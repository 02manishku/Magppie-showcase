"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { GalleryItemVideo } from "@/data/gallery";

interface OptimizedVideoProps {
  video: GalleryItemVideo;
  posterSrc: string;
  alt: string;
  isActive?: boolean;
  className?: string;
}

function getOptimalVideoSrc(video: GalleryItemVideo): string {
  if (typeof navigator !== "undefined" && "connection" in navigator) {
    const conn = (navigator as unknown as { connection: { effectiveType?: string } }).connection;
    const etype = conn?.effectiveType;
    if (etype === "slow-2g" || etype === "2g" || etype === "3g") {
      return video.mobile || video.desktop;
    }
  }
  return video.desktop;
}

export default function OptimizedVideo({
  video,
  posterSrc,
  alt,
  isActive = false,
  className = "",
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [showTapToLoad, setShowTapToLoad] = useState(false);

  // Check if connection is very slow
  useEffect(() => {
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const conn = (navigator as unknown as { connection: { effectiveType?: string } }).connection;
      if (conn?.effectiveType === "slow-2g") {
        setShowTapToLoad(true);
      }
    }
  }, []);

  // Auto-play when active in lightbox
  useEffect(() => {
    if (isActive && loaded && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
    if (!isActive && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive, loaded]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    setShowTapToLoad(false);
  }, []);

  if (!isActive) {
    // Show poster only in grid
    return (
      <div className={`relative ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterSrc || video.poster}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Active in lightbox
  if (showTapToLoad && !loaded) {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        onClick={handleLoad}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterSrc || video.poster}
          alt={alt}
          className="h-full w-full object-contain"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="rounded-full bg-white/20 px-6 py-3 text-sm text-white backdrop-blur-sm">
            Tap to load video
          </span>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={getOptimalVideoSrc(video)}
      poster={posterSrc || video.poster}
      autoPlay={isActive}
      controls
      playsInline
      preload={isActive ? "auto" : "none"}
      onCanPlay={() => setLoaded(true)}
      className={`max-h-full max-w-full ${className}`}
      style={{ outline: "none" }}
    />
  );
}
