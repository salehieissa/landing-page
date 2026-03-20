"use client";

import React, { useRef, useEffect, useState } from "react";

interface PhoneMockupProps {
  videoSrc?: string;
  imageSrc?: string;
  className?: string;
}

const DEPTH = 10;

export default function PhoneMockup({
  videoSrc,
  imageSrc,
  className = "",
}: PhoneMockupProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoSrc]);

  return (
    <div
      className={`relative ${className}`}
      style={{ aspectRatio: "430/932", transformStyle: "preserve-3d" }}
    >
      {/* ─── FRONT FACE ─── */}
      <div
        className="absolute inset-0"
        style={{ transform: `translateZ(${DEPTH / 2}px)`, backfaceVisibility: "hidden" }}
      >
        <div className="absolute inset-0 rounded-[clamp(2.5rem,8%,3.5rem)] bg-[#1c1c1e] shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_20px_60px_-10px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.2)]">
          {/* Frame highlight */}
          <div className="absolute inset-0 rounded-[clamp(2.5rem,8%,3.5rem)] bg-gradient-to-b from-white/[0.08] via-transparent to-transparent" />

          {/* Screen bezel */}
          <div className="absolute inset-[clamp(3px,0.8%,5px)] overflow-hidden rounded-[clamp(2.2rem,7.2%,3.2rem)] bg-black">
            {videoSrc && (
              <video
                ref={videoRef}
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                onCanPlay={() => setVideoReady(true)}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${videoReady ? "opacity-100" : "opacity-0"}`}
              />
            )}

            {imageSrc && !videoSrc && (
              <img
                src={imageSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            {/* Fallback lock screen */}
            {(!videoReady || (!videoSrc && !imageSrc)) && (
              <FallbackScreen />
            )}

            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-[1.2%] -translate-x-1/2">
              <div
                className="rounded-full bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]"
                style={{ width: "clamp(80px, 28%, 126px)", height: "clamp(20px, 3.5%, 35px)" }}
              />
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-[1.5%] left-1/2 -translate-x-1/2">
              <div className="h-[4px] rounded-full bg-white/20" style={{ width: "clamp(80px, 35%, 134px)" }} />
            </div>

            {/* Screen reflection */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* ─── BACK FACE ─── */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateZ(${-DEPTH / 2}px) rotateY(180deg)`,
          backfaceVisibility: "hidden",
        }}
      >
        <div className="absolute inset-0 rounded-[clamp(2.5rem,8%,3.5rem)] bg-[#1a1a1c] shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
          {/* Back panel gradient */}
          <div className="absolute inset-0 rounded-[clamp(2.5rem,8%,3.5rem)] bg-gradient-to-b from-[#2a2a2e] via-[#1c1c1e] to-[#18181a]" />

          {/* Camera bump */}
          <div className="absolute left-[6%] top-[2.5%] h-[12%] w-[28%] rounded-[20%] bg-[#111113] shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_2px_8px_rgba(0,0,0,0.3)]">
            {/* Main camera */}
            <div className="absolute left-[15%] top-[18%] h-[38%] w-[32%] rounded-full bg-[#0a0a0c] shadow-[0_0_0_2px_#1c1c1e,0_0_0_3px_rgba(255,255,255,0.08)]">
              <div className="absolute inset-[20%] rounded-full bg-gradient-to-br from-[#1a1a3e] via-[#0f0f2e] to-[#0a0a1a]" />
              <div className="absolute left-[25%] top-[20%] h-[20%] w-[20%] rounded-full bg-white/10" />
            </div>
            {/* Second camera */}
            <div className="absolute left-[55%] top-[18%] h-[38%] w-[32%] rounded-full bg-[#0a0a0c] shadow-[0_0_0_2px_#1c1c1e,0_0_0_3px_rgba(255,255,255,0.08)]">
              <div className="absolute inset-[20%] rounded-full bg-gradient-to-br from-[#1a1a3e] via-[#0f0f2e] to-[#0a0a1a]" />
              <div className="absolute left-[25%] top-[20%] h-[20%] w-[20%] rounded-full bg-white/10" />
            </div>
            {/* Flash */}
            <div className="absolute bottom-[15%] left-[30%] h-[22%] w-[18%] rounded-full bg-[#1a1a1c] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
              <div className="absolute inset-[25%] rounded-full bg-[#2a2a1e]" />
            </div>
            {/* LiDAR */}
            <div className="absolute bottom-[15%] right-[20%] h-[18%] w-[15%] rounded-full bg-[#0a0a0c] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]" />
          </div>

          {/* Apple logo area */}
          <div className="absolute left-1/2 top-[42%] -translate-x-1/2">
            <div className="h-[18px] w-[16px] rounded-full bg-white/[0.04]" />
          </div>

          {/* Subtle back texture */}
          <div className="absolute inset-0 rounded-[clamp(2.5rem,8%,3.5rem)] bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.01]" />
        </div>
      </div>

      {/* ─── SIDE EDGES (top, bottom, left, right) ─── */}
      {/* Top edge */}
      <div
        className="absolute left-0 right-0 top-0"
        style={{
          height: `${DEPTH}px`,
          transform: `rotateX(90deg) translateZ(${DEPTH / 2}px)`,
          transformOrigin: "top",
        }}
      >
        <div className="h-full w-full rounded-t-[2px] bg-gradient-to-b from-[#3a3a3e] to-[#2a2a2e]" />
      </div>

      {/* Bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: `${DEPTH}px`,
          transform: `rotateX(-90deg) translateZ(${DEPTH / 2}px)`,
          transformOrigin: "bottom",
        }}
      >
        <div className="h-full w-full rounded-b-[2px] bg-gradient-to-t from-[#3a3a3e] to-[#1a1a1e]" />
      </div>

      {/* Right edge */}
      <div
        className="absolute bottom-0 right-0 top-0"
        style={{
          width: `${DEPTH}px`,
          transform: `rotateY(90deg) translateZ(${DEPTH / 2}px)`,
          transformOrigin: "right",
        }}
      >
        <div className="h-full w-full bg-gradient-to-l from-[#3a3a3e] to-[#222224]">
          {/* Power button */}
          <div className="absolute right-0 top-[28%] h-[10%] w-full rounded-[1px] bg-[#404044] shadow-[0_0_0_0.5px_rgba(255,255,255,0.08)_inset]" />
        </div>
      </div>

      {/* Left edge */}
      <div
        className="absolute bottom-0 left-0 top-0"
        style={{
          width: `${DEPTH}px`,
          transform: `rotateY(-90deg) translateZ(${DEPTH / 2}px)`,
          transformOrigin: "left",
        }}
      >
        <div className="h-full w-full bg-gradient-to-r from-[#3a3a3e] to-[#222224]">
          {/* Volume buttons */}
          <div className="absolute left-0 top-[16%] h-[3%] w-full rounded-[1px] bg-[#404044] shadow-[0_0_0_0.5px_rgba(255,255,255,0.08)_inset]" />
          <div className="absolute left-0 top-[22%] h-[5.5%] w-full rounded-[1px] bg-[#404044] shadow-[0_0_0_0.5px_rgba(255,255,255,0.08)_inset]" />
          <div className="absolute left-0 top-[29%] h-[5.5%] w-full rounded-[1px] bg-[#404044] shadow-[0_0_0_0.5px_rgba(255,255,255,0.08)_inset]" />
        </div>
      </div>
    </div>
  );
}

function FallbackScreen() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      <div className="flex items-center justify-between px-[8%] pt-[4%]">
        <span className="text-[min(0.75rem,2.8vw)] font-medium text-white/70">9:41</span>
        <div className="flex items-center gap-[3px]">
          <div className="flex gap-[1px]">
            <div className="h-[4px] w-[2px] rounded-[0.5px] bg-white/40" />
            <div className="h-[5px] w-[2px] rounded-[0.5px] bg-white/40" />
            <div className="h-[6px] w-[2px] rounded-[0.5px] bg-white/40" />
            <div className="h-[7px] w-[2px] rounded-[0.5px] bg-white/50" />
          </div>
          <svg className="h-[10px] w-[18px] text-white/40" viewBox="0 0 25 12" fill="currentColor">
            <rect x="0" y="1" width="21" height="10" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
            <rect x="2" y="3" width="14" height="6" rx="1" fill="currentColor" />
            <path d="M23 4.5v3a1.5 1.5 0 000-3z" />
          </svg>
        </div>
      </div>

      <div className="mt-[15%] flex flex-col items-center">
        <svg className="h-[4%] w-[4%] text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </div>

      <div className="mt-[3%] text-center">
        <p className="text-[min(4.5rem,13vw)] font-light leading-none tracking-tight text-white/90">
          9:41
        </p>
        <p className="mt-[2%] text-[min(1rem,3.2vw)] font-normal text-white/50">
          Sunday, March 8
        </p>
      </div>

      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }} />
    </div>
  );
}
