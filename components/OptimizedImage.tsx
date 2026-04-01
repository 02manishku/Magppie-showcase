"use client";

import Image from "next/image";
import type { GalleryItemSrc } from "@/data/gallery";

interface OptimizedImageProps {
  src: GalleryItemSrc;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  onClick?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  priority = false,
  sizes = "(max-width: 768px) 50vw, 33vw",
  className = "",
  onClick,
}: OptimizedImageProps) {
  // If we have optimized local images, use <picture> with AVIF + WebP
  if (src.full && src.full.startsWith("/media/")) {
    return (
      <picture onClick={onClick} className={className}>
        {src.avif && <source srcSet={src.avif} type="image/avif" />}
        <source srcSet={src.full} type="image/webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src.full}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={className}
          style={fill ? { objectFit: "cover", width: "100%", height: "100%" } : undefined}
        />
      </picture>
    );
  }

  // Fallback: use Next.js <Image> for remote URLs (Unsplash placeholders)
  return (
    <Image
      src={src.thumb || src.full}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes={sizes}
      className={className}
      placeholder="empty"
      onClick={onClick}
    />
  );
}
