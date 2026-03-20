"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import AnimatedTextCycle from "@/components/ui/animated-text-cycle";
import VaporizeTextCycle, { Tag } from "@/components/ui/vapour-text-effect";
import FrameScrubber from "@/components/ui/frame-scrubber";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

const FRAME_COUNT = 119;
const getFramePath = (index: number) =>
  `/frames-clean/frame-${String(index + 1).padStart(3, "0")}.webp`;

const PRESET_FRAME_COUNT = 121;
const getPresetFramePath = (index: number) =>
  `/frames-presets/frame-${String(index + 1).padStart(3, "0")}.webp`;

function useSmooth(value: MotionValue<number>) {
  return useSpring(value, { stiffness: 60, damping: 25, mass: 0.8 });
}

function useCoolveticaFamily() {
  const [family, setFamily] = useState("sans-serif");
  useEffect(() => {
    const raw = getComputedStyle(document.body).getPropertyValue("--font-coolvetica").trim();
    if (raw) setFamily(raw);
  }, []);
  return family;
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const coolveticaFamily = useCoolveticaFamily();

  const gradientY = useSmooth(useTransform(scrollYProgress, [0, 1], [0, -60]));
  const gradientHue = useSmooth(
    useTransform(scrollYProgress, [0, 0.5, 1], [0, -8, -15])
  );
  const gradientSaturation = useSmooth(
    useTransform(scrollYProgress, [0, 1], [0, 5])
  );

  const [frameProgress, setFrameProgress] = useState(0);
  const [presetProgress, setPresetProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const phone = document.getElementById("phone-section");
      if (phone) {
        const rect = phone.getBoundingClientRect();
        const scrollable = phone.offsetHeight - window.innerHeight;
        if (scrollable > 0) {
          setFrameProgress(Math.max(0, Math.min(1, -rect.top / scrollable)));
        }
      }
      const preset = document.getElementById("preset-section");
      if (preset) {
        const rect = preset.getBoundingClientRect();
        const scrollable = preset.offsetHeight - window.innerHeight;
        if (scrollable > 0) {
          setPresetProgress(Math.max(0, Math.min(1, -rect.top / scrollable)));
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="relative"
      style={{ overflowX: "clip" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Scroll-reactive gradient background — fixed behind everything */}
      <motion.div
        className="fixed inset-0 -z-10"
        style={{
          y: gradientY,
          filter: useTransform(
            [gradientHue, gradientSaturation] as MotionValue[],
            ([h, s]: number[]) =>
              `hue-rotate(${h}deg) saturate(${1 + s / 100})`
          ),
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#e5e5e5] via-[#d8d8d8] to-[#f0f0f0]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.9),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#f5f5f5] to-transparent" />
      </motion.div>

      {/* Grain texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ─── HERO SECTION ─── */}
      <section className="relative flex min-h-[45dvh] flex-col items-center justify-center px-6 pb-0 pt-[env(safe-area-inset-top)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-6 h-8 w-64 sm:h-10 sm:w-80"
          >
            <VaporizeTextCycle
              texts={["visual essential", "vocal essential"]}
              font={{
                fontFamily: coolveticaFamily,
                fontSize: "20px",
                fontWeight: 400,
              }}
              color="rgb(0, 0, 0)"
              spread={4}
              density={6}
              animation={{
                vaporizeDuration: 1.8,
                fadeInDuration: 0.8,
                waitDuration: 2,
              }}
              direction="left-to-right"
              alignment="center"
              tag={Tag.P}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-center text-[clamp(3rem,10vw,6rem)] leading-[1.05] tracking-tight"
          >
            <span className="block bg-gradient-to-b from-black to-neutral-600 bg-clip-text text-transparent">
              your{" "}
              <AnimatedTextCycle
                words={[
                  "songs",
                  "visuals",
                  "videos",
                  "mixes",
                  "vocals",
                ]}
                interval={3000}
                className="font-display text-neutral-400"
              />
            </span>
            <span className="block bg-gradient-to-b from-black to-neutral-600 bg-clip-text text-transparent">
              deserve better
            </span>
          </motion.h1>

        </motion.div>

      </section>

      {/* ─── PHONE FRAME SEQUENCE ─── */}
      <div id="phone-section" className="relative -mt-16 z-10 sm:-mt-24" style={{ height: "300vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0">
            <FrameScrubber
              frameCount={FRAME_COUNT}
              framePath={getFramePath}
              scrollProgress={frameProgress}
              className="h-full w-full"
            />
          </div>
          <div className={`shrink-0 flex justify-center py-6 transition-all duration-700 ease-out ${frameProgress > 0.85 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"}`}>
            <a href="https://visualessential.com/open">
              <InteractiveHoverButton text="Create Now" />
            </a>
          </div>
        </div>
      </div>

      {/* ─── PRESETS SECTION ─── */}
      <section className="relative px-6 pb-8 pt-16 sm:px-8 sm:pt-24">
        <div className="mx-auto max-w-xl">
          <ScrollReveal>
            <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.3em] text-neutral-400 sm:mb-8">
              Vocal Presets
            </p>
            <h2 className="font-display text-center text-[clamp(2rem,6vw,3.5rem)] leading-[1.1] tracking-tight bg-gradient-to-b from-black to-neutral-600 bg-clip-text text-transparent">
              Engineered for your voice
            </h2>
            <p className="mt-4 text-center text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
              Professional vocal presets crafted for creators who want their sound to stand out.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── PRESET FRAME SEQUENCE ─── */}
      <div id="preset-section" className="relative z-10" style={{ height: "300vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0">
            <FrameScrubber
              frameCount={PRESET_FRAME_COUNT}
              framePath={getPresetFramePath}
              scrollProgress={presetProgress}
              className="h-full w-full"
            />
          </div>
          <div className={`shrink-0 flex justify-center pb-3 -mt-32 transition-all duration-700 ease-out ${presetProgress > 0.85 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"}`}>
            <a href="https://vocalessential.com/pages/funnel">
              <InteractiveHoverButton text="Upgrade Your Sound" className="w-52" />
            </a>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-20 bg-[#e5e5e5] px-6 py-12 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-xl">
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-black">
              Follow along
            </p>
            <div className="flex items-center gap-5">
              <SocialLink href="https://instagram.com/eis.ssa" label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </SocialLink>
              <SocialLink href="https://tiktok.com/@eis.ssa" label="TikTok">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.78a8.18 8.18 0 004.76 1.52V6.83a4.85 4.85 0 01-1-.14z" />
                </svg>
              </SocialLink>
              <SocialLink href="https://youtube.com/@eissamusicofficial" label="YouTube">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
                </svg>
              </SocialLink>
            </div>
            <p className="text-[11px] text-neutral-400">
              &copy; {new Date().getFullYear()} Eissa Salehi
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.4"],
  });
  const opacity = useSmooth(useTransform(scrollYProgress, [0, 1], [0, 1]));
  const y = useSmooth(useTransform(scrollYProgress, [0, 1], [40, 0]));

  return (
    <motion.div ref={ref} style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}


function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full text-black transition-opacity duration-200 hover:opacity-60 active:opacity-40"
    >
      {children}
    </a>
  );
}
