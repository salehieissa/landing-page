"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";

const scheduleIdle =
  typeof window !== "undefined" && typeof window.requestIdleCallback === "function"
    ? (cb: () => void) => window.requestIdleCallback(cb)
    : (cb: () => void) => setTimeout(cb, 1);

interface FrameScrubberProps {
  frameCount: number;
  framePath: (index: number) => string;
  scrollProgress: number;
  className?: string;
}

export default function FrameScrubber({
  frameCount,
  framePath,
  scrollProgress,
  className = "",
}: FrameScrubberProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedSetRef = useRef<Set<number>>(new Set());
  const [firstReady, setFirstReady] = useState(false);
  const currentFrameRef = useRef(-1);
  const sizeRef = useRef({ w: 0, h: 0 });
  const rafRef = useRef<number>(0);

  const paths = useMemo(
    () => Array.from({ length: frameCount }, (_, i) => framePath(i)),
    [frameCount, framePath]
  );

  useEffect(() => {
    let cancelled = false;
    const images: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
    const loaded = new Set<number>();
    imagesRef.current = images;
    loadedSetRef.current = loaded;

    const loadImage = (i: number) => {
      if (cancelled) return;
      const img = new Image();
      if (i === 0) {
        (img as HTMLImageElement & { fetchPriority: string }).fetchPriority = "high";
        img.decoding = "sync";
      } else {
        img.decoding = "async";
      }
      img.src = paths[i];
      img.onload = () => {
        if (cancelled) return;
        images[i] = img;
        loaded.add(i);
        if (i === 0) setFirstReady(true);
      };
    };

    loadImage(0);

    const BATCH = 6;
    let nextIndex = 1;
    const loadBatch = () => {
      if (cancelled || nextIndex >= frameCount) return;
      const end = Math.min(nextIndex + BATCH, frameCount);
      for (let i = nextIndex; i < end; i++) loadImage(i);
      nextIndex = end;
      if (nextIndex < frameCount) {
        scheduleIdle(loadBatch);
      }
    };

    const kickoff = () => {
      if (!cancelled) loadBatch();
    };
    scheduleIdle(kickoff);

    return () => {
      cancelled = true;
    };
  }, [frameCount, paths]);

  const syncSize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (sizeRef.current.w !== w || sizeRef.current.h !== h) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      sizeRef.current = { w, h };
      currentFrameRef.current = -1;
    }
  }, []);

  useEffect(() => {
    syncSize();
    const obs = new ResizeObserver(syncSize);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [syncSize]);

  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      const images = imagesRef.current;
      if (!canvas || index === currentFrameRef.current) return;

      let img = images[index];
      if (!img || !img.complete) {
        for (let offset = 1; offset < 5; offset++) {
          const below = images[index - offset];
          if (below?.complete) { img = below; break; }
          const above = images[index + offset];
          if (above?.complete) { img = above; break; }
        }
      }
      if (!img || !img.complete) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      syncSize();

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      const scale = Math.min(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const sx = (cw - sw) / 2;
      const sy = (ch - sh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, sx, sy, sw, sh);
      currentFrameRef.current = index;
    },
    [syncSize]
  );

  useEffect(() => {
    if (!firstReady) return;
    const frameIndex = Math.min(
      Math.floor(scrollProgress * frameCount),
      frameCount - 1
    );
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => drawFrame(Math.max(0, frameIndex)));
  }, [scrollProgress, firstReady, frameCount, drawFrame]);

  useEffect(() => {
    if (firstReady) drawFrame(0);
  }, [firstReady, drawFrame]);

  return (
    <div
      ref={containerRef}
      className={`${className} ${firstReady ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
