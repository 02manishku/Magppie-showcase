"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [hasPlayed, setHasPlayed] = useState(true);
  const [indicatorVisible, setIndicatorVisible] = useState(true);

  useEffect(() => {
    if (!sessionStorage.getItem("hero-animation-played")) {
      sessionStorage.setItem("hero-animation-played", "true");
      setHasPlayed(false);
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIndicatorVisible(window.scrollY <= 80);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={ref} className="relative h-dvh w-full overflow-hidden bg-[#141412]">
      {/* Background video */}
      <motion.div
        className="absolute inset-0"
        initial={hasPlayed ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
      >
        <div className="absolute inset-0 origin-center">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/media/optimized/images/full/kitchen-real-001.webp"
            className="h-full w-full object-cover object-center"
          >
            <source src="/hero-compressed.mp4" type="video/mp4" />
          </video>
        </div>
      </motion.div>

      {/* Cinematic overlays */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(to right, rgba(20,20,18,0.78) 0%, rgba(20,20,18,0.55) 30%, rgba(20,20,18,0.15) 60%, rgba(20,20,18,0.05) 100%),
            linear-gradient(to top, rgba(20,20,18,0.6) 0%, rgba(20,20,18,0.0) 25%),
            linear-gradient(to bottom, rgba(20,20,18,0.3) 0%, rgba(20,20,18,0.0) 15%),
            radial-gradient(ellipse at center, transparent 40%, rgba(20,20,18,0.25) 100%)
          `,
        }}
      />

      {/* Content */}
      <div className="pointer-events-none relative z-10 h-full w-full">
        <div className="absolute left-0 top-[58%] w-full max-w-[650px] -translate-y-1/2 px-6 lg:px-[8vw]">
          {/* Decorative line + kicker */}
          <motion.div
            className="mb-5 flex items-center gap-1.5"
            initial={hasPlayed ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <motion.div
              className="h-px origin-left bg-[#F5F0E8]/45"
              initial={hasPlayed ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              style={{ width: "24px" }}
            />
            <motion.span
              className="text-[11px] font-normal uppercase tracking-[0.18em] text-[#F5F0E8]/45"
              initial={hasPlayed ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.5 }}
            >
              Explore the Collection
            </motion.span>
          </motion.div>

          {/* Heading line 1 */}
          <motion.h1
            className="font-display text-[38px] font-light leading-[1.05] tracking-[-0.02em] text-[#F5F0E8] lg:text-[72px]"
            initial={hasPlayed ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.8 }}
          >
            Kitchens & Wardrobes
          </motion.h1>

          {/* Heading line 2 - GOLD ACCENT */}
          <motion.div
            className="font-display text-[38px] font-light leading-[1.05] tracking-[-0.02em] text-accent lg:text-[72px]"
            initial={hasPlayed ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 18, delay: 1.0 }}
          >
            by Magppie
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="mt-7 max-w-[380px] text-[13px] font-normal leading-[1.6] text-[#F5F0E8]/50 lg:text-[15px]"
            initial={hasPlayed ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 18, delay: 1.3 }}
          >
            The world&apos;s first wellness kitchens, built entirely from stone
          </motion.p>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="pointer-events-none absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 transition-opacity duration-300"
        style={{ opacity: indicatorVisible ? 1 : 0 }}
        initial={hasPlayed ? false : { opacity: 0 }}
        animate={indicatorVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 2.0, duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative h-[50px] w-px overflow-hidden bg-[#F5F0E8]/25">
          <motion.div
            className="absolute left-1/2 top-0 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#F5F0E8]/60"
            animate={{ y: [0, 50, 50], opacity: [1, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.8, 1] }}
          />
        </div>
      </motion.div>
    </section>
  );
}
