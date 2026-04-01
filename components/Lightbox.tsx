"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VideoPlayer from "./VideoPlayer";
import type { GalleryItem } from "@/data/gallery";

interface LightboxProps {
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ items, currentIndex, onClose, onNavigate }: LightboxProps) {
  const [direction, setDirection] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const item = items[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setDirection(1);
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, items.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  useEffect(() => {
    document.body.classList.add("lightbox-open");
    return () => document.body.classList.remove("lightbox-open");
  }, []);

  useEffect(() => {
    setIsZoomed(false);
  }, [currentIndex]);

  // Preload adjacent images
  useEffect(() => {
    [currentIndex - 1, currentIndex + 1].forEach((idx) => {
      if (idx >= 0 && idx < items.length && items[idx].type === "image") {
        const src = items[idx].src.full;
        if (src) {
          const img = new window.Image();
          img.src = src;
        }
      }
    });
  }, [currentIndex, items]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };
  const onTouchEnd = () => {
    if (isZoomed) return;
    const dx = touchStartX.current - touchEndX.current;
    const dy = touchStartY.current - touchEndY.current;
    if (Math.abs(dy) > 120 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
      return;
    }
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goNext();
      else goPrev();
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      role="dialog"
      aria-modal="true"
      aria-label="Gallery lightbox"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-bg-dark"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-50 flex h-10 w-10 items-center justify-center text-xl text-text-light/50 transition-all duration-200 hover:scale-110 hover:text-text-light"
        aria-label="Close"
      >
        &#x2715;
      </button>

      {/* Counter */}
      <div className="absolute left-5 top-5 z-50 text-sm tabular-nums text-text-light/40">
        {currentIndex + 1} / {items.length}
      </div>

      {/* Arrows */}
      {currentIndex > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-3 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-text-light/30 transition-all duration-200 hover:bg-text-light/5 hover:text-text-light/80 md:left-5"
          aria-label="Previous"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {currentIndex < items.length - 1 && (
        <button
          onClick={goNext}
          className="absolute right-3 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-text-light/30 transition-all duration-200 hover:bg-text-light/5 hover:text-text-light/80 md:right-5"
          aria-label="Next"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Content */}
      <div
        className="relative z-10 flex h-full w-full items-center justify-center p-4 md:p-[5vw]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={item.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate={isZoomed ? { x: 0, opacity: 1, scale: 2.2 } : "center"}
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0, 1] }}
            className={`flex max-h-[90vh] w-full max-w-6xl flex-col items-center justify-center ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
            style={{ willChange: "transform, opacity" }}
            drag={isZoomed}
            dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
            dragElastic={0.1}
            onDoubleClick={() => setIsZoomed(!isZoomed)}
          >
            {item.type === "image" ? (
              <picture className="flex items-center justify-center">
                {item.src.avif && <source srcSet={item.src.avif} type="image/avif" />}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src.full}
                  alt={item.title}
                  className="max-h-[85vh] max-w-full rounded object-contain"
                  loading="eager"
                />
              </picture>
            ) : item.video ? (
              <VideoPlayer
                src={item.video.desktop}
                poster={item.src.thumb}
                isActive={true}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption - always visible below image */}
      <div className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2 text-center">
        <p className="kicker text-text-light/30">{item.category}</p>
        <p className="mt-1 font-display text-lg font-light text-text-light/70">
          {item.title}
        </p>
      </div>
    </motion.div>
  );
}
