#!/usr/bin/env node

/**
 * Auto-Generate Gallery Data from Optimized Media
 *
 * Reads actual thumbnail dimensions for proper masonry layout.
 * Ordering: real photos first, then renders, per category.
 * No titles on images.
 *
 * Filename convention:
 *   kitchen-real-001.webp, kitchen-render-001.webp
 *   wardrobe-real-001.webp, wardrobe-render-001.webp
 */

import sharp from "sharp";
import path from "path";
import fs from "fs";
import { glob } from "glob";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const FULL_DIR = path.join(ROOT, "public", "media", "optimized", "images", "full");
const AVIF_DIR = path.join(ROOT, "public", "media", "optimized", "images", "avif");
const THUMB_DIR = path.join(ROOT, "public", "media", "optimized", "images", "thumb");
const VIDEO_DIR = path.join(ROOT, "public", "media", "optimized", "videos");
const MOBILE_VIDEO_DIR = path.join(ROOT, "public", "media", "optimized", "videos", "mobile");
const POSTER_DIR = path.join(ROOT, "public", "media", "optimized", "videos", "posters");
const BLUR_JSON = path.join(ROOT, "data", "blur-placeholders.json");
const OUTPUT = path.join(ROOT, "data", "gallery.ts");

function parseFilename(basename) {
  // kitchen-real-001, kitchen-render-005, wardrobe-real-002, etc.
  const match = basename.match(/^(kitchen|wardrobe)-(real|render)-(\d+)$/);
  if (match) {
    return {
      category: match[1],
      photoType: match[2], // "real" or "render"
      order: parseInt(match[3], 10),
    };
  }
  // Fallback for any other naming
  const isWardrobe = basename.toLowerCase().includes("wardrobe");
  return {
    category: isWardrobe ? "wardrobe" : "kitchen",
    photoType: "render",
    order: 999,
  };
}

async function main() {
  console.log("\n=== Generating Gallery Data ===\n");

  let blurMap = {};
  if (fs.existsSync(BLUR_JSON)) {
    blurMap = JSON.parse(fs.readFileSync(BLUR_JSON, "utf-8"));
  }

  const items = [];

  // Process images
  const fullImages = await glob(path.join(FULL_DIR, "*.webp").replace(/\\/g, "/"));

  for (const fullPath of fullImages) {
    const basename = path.basename(fullPath, ".webp");
    const thumbPath = path.join(THUMB_DIR, basename + ".webp");
    const avifPath = path.join(AVIF_DIR, basename + ".avif");

    if (!fs.existsSync(thumbPath)) continue;

    // Read ACTUAL thumb dimensions
    let width = 600;
    let height = 400;
    try {
      const meta = await sharp(thumbPath).metadata();
      width = meta.width || 600;
      height = meta.height || 400;
    } catch {}

    const parsed = parseFilename(basename);
    const blurEntry = blurMap[basename];
    const blurData = typeof blurEntry === "object" ? blurEntry.blur : (blurEntry || "");

    items.push({
      id: "", // assigned after sorting
      type: "image",
      category: parsed.category,
      photoType: parsed.photoType,
      sortOrder: parsed.order,
      title: "",
      width,
      height,
      blurData: blurData || undefined,
      src: {
        full: `/media/optimized/images/full/${basename}.webp`,
        avif: fs.existsSync(avifPath) ? `/media/optimized/images/avif/${basename}.avif` : "",
        thumb: `/media/optimized/images/thumb/${basename}.webp`,
      },
    });
  }

  // Process videos
  const videoPattern = path.join(VIDEO_DIR, "*.mp4").replace(/\\/g, "/");
  const videos = await glob(videoPattern);

  for (const videoPath of videos) {
    const basename = path.basename(videoPath, ".mp4");
    const mobilePath = path.join(MOBILE_VIDEO_DIR, basename + ".mp4");
    const posterPath = path.join(POSTER_DIR, basename + ".webp");
    const parsed = parseFilename(basename);

    items.push({
      id: "",
      type: "video",
      category: parsed.category,
      photoType: parsed.photoType,
      sortOrder: parsed.order,
      title: "",
      src: {
        full: "",
        avif: "",
        thumb: fs.existsSync(posterPath) ? `/media/optimized/videos/posters/${basename}.webp` : "",
      },
      video: {
        desktop: `/media/optimized/videos/${basename}.mp4`,
        mobile: fs.existsSync(mobilePath) ? `/media/optimized/videos/mobile/${basename}.mp4` : "",
        poster: fs.existsSync(posterPath) ? `/media/optimized/videos/posters/${basename}.webp` : "",
      },
    });
  }

  // Sort: within each category, real photos first, then renders. By order number within each group.
  // Overall order: kitchen-real, kitchen-render, wardrobe-real, wardrobe-render
  const sortKey = (item) => {
    const catOrder = item.category === "kitchen" ? 0 : 1;
    const typeOrder = item.photoType === "real" ? 0 : 1;
    return catOrder * 10000 + typeOrder * 1000 + item.sortOrder;
  };
  items.sort((a, b) => sortKey(a) - sortKey(b));

  // Assign sequential IDs
  items.forEach((item, i) => { item.id = String(i + 1); });

  // Remove internal sorting fields from output
  const cleanItems = items.map(({ photoType, sortOrder, ...rest }) => rest);

  const ts = `// AUTO-GENERATED by scripts/generate-gallery-data.mjs
// Do not edit manually. Run: npm run optimize:gallery

export interface GalleryItemSrc {
  full: string;
  avif: string;
  thumb: string;
}

export interface GalleryItemVideo {
  desktop: string;
  mobile: string;
  poster: string;
}

export interface GalleryItem {
  id: string;
  type: "image" | "video";
  category: "kitchen" | "wardrobe";
  title: string;
  width?: number;
  height?: number;
  blurData?: string;
  src: GalleryItemSrc;
  video?: GalleryItemVideo;
}

export const galleryItems: GalleryItem[] = ${JSON.stringify(cleanItems, null, 2)};
`;

  fs.writeFileSync(OUTPUT, ts, "utf-8");

  const kitchenReal = items.filter(i => i.category === "kitchen" && i.photoType === "real").length;
  const kitchenRender = items.filter(i => i.category === "kitchen" && i.photoType === "render").length;
  const wardrobeReal = items.filter(i => i.category === "wardrobe" && i.photoType === "real").length;
  const wardrobeRender = items.filter(i => i.category === "wardrobe" && i.photoType === "render").length;

  console.log(`  Generated ${items.length} gallery items`);
  console.log(`    Kitchen real:    ${kitchenReal}`);
  console.log(`    Kitchen render:  ${kitchenRender}`);
  console.log(`    Wardrobe real:   ${wardrobeReal}`);
  console.log(`    Wardrobe render: ${wardrobeRender}`);
  console.log(`  Order: kitchen-real -> kitchen-render -> wardrobe-real -> wardrobe-render`);
  console.log(`  Output: ${OUTPUT}`);
  console.log("\nDone!\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
