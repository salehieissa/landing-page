"use client";

import { useRef, useEffect, useState, useCallback } from "react";

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
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const currentFrameRef = useRef(-1);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = framePath(i);
      img.onload = () => {
        loadedCount++;
        if (!cancelled && loadedCount === frameCount) {
          imagesRef.current = images;
          setLoaded(true);
        }
      };
      images.push(img);
    }

    return () => {
      cancelled = true;
    };
  }, [frameCount, framePath]);

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
      if (!canvas || !images.length || index === currentFrameRef.current) return;

      const img = images[index];
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
    if (!loaded) return;
    const frameIndex = Math.min(
      Math.floor(scrollProgress * frameCount),
      frameCount - 1
    );
    drawFrame(Math.max(0, frameIndex));
  }, [scrollProgress, loaded, frameCount, drawFrame]);

  useEffect(() => {
    if (loaded) drawFrame(0);
  }, [loaded, drawFrame]);

  return (
    <div
      ref={containerRef}
      className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
