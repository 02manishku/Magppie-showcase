"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { GalleryItem as GalleryItemType } from "@/data/gallery";

interface GalleryItemProps {
  item: GalleryItemType;
  index: number;
  onClick: () => void;
}

export default function GalleryItem({ item, index, onClick }: GalleryItemProps) {
  const thumbSrc = item.src.thumb || item.src.full;
  const isPriority = index < 6;
  const [loaded, setLoaded] = useState(isPriority);
  const [inView, setInView] = useState(isPriority);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPriority) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [isPriority]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: (index % 3) * 0.1,
        ease: [0.25, 0.1, 0, 1],
      }}
      className="group relative aspect-[3/2] cursor-pointer overflow-hidden rounded-sm"
      onClick={onClick}
    >
      {/* Shimmer placeholder */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-text-secondary/5" />
      )}

      <Image
        src={thumbSrc}
        alt={item.title || item.category}
        width={item.width || 600}
        height={item.height || 400}
        priority={isPriority}
        loading={isPriority ? "eager" : "lazy"}
        placeholder={item.blurData ? "blur" : "empty"}
        blurDataURL={item.blurData}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Video play icon */}
      {item.type === "video" && loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" fill="white" className="ml-0.5 h-5 w-5 opacity-80">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          </div>
        </div>
      )}

      {/* Hover overlay with gradient + title */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute bottom-0 left-0 p-4">
          <p className="kicker mb-1 text-accent">{item.category}</p>
          <p className="font-display text-lg font-medium text-text-light">{item.title}</p>
        </div>
      </div>
    </motion.div>
  );
}
