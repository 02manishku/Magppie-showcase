#!/usr/bin/env node

/**
 * Image Optimization Pipeline for Magppie Showcase
 *
 * Scans /public/media/raw/images/ for all image files and generates:
 *   1. Full HD WebP (1920px, q80) → /public/media/optimized/images/full/
 *   2. Thumbnail WebP (600px, q75) → /public/media/optimized/images/thumb/
 *   3. AVIF version (1920px, q65) → /public/media/optimized/images/avif/
 *   4. Tiny base64 blur placeholder → /data/blur-placeholders.json
 *
 * Strips all EXIF metadata. Skips already-processed files (by mtime).
 */

import sharp from "sharp";
import { glob } from "glob";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const RAW_DIR = path.join(ROOT, "public", "media", "raw", "images");
const FULL_DIR = path.join(ROOT, "public", "media", "optimized", "images", "full");
const THUMB_DIR = path.join(ROOT, "public", "media", "optimized", "images", "thumb");
const AVIF_DIR = path.join(ROOT, "public", "media", "optimized", "images", "avif");
const BLUR_JSON = path.join(ROOT, "data", "blur-placeholders.json");

const IMAGE_EXTENSIONS = "**/*.{jpg,jpeg,png,webp,tiff,heic,JPG,JPEG,PNG}";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
  return (bytes / (1024 * 1024)).toFixed(1) + "MB";
}

function sanitizeFilename(filename) {
  // Replace spaces, parentheses, and special chars with underscores
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

function isStale(srcPath, destPath) {
  if (!fs.existsSync(destPath)) return true;
  const srcStat = fs.statSync(srcPath);
  const destStat = fs.statSync(destPath);
  return srcStat.mtimeMs > destStat.mtimeMs;
}

async function processImage(srcPath, relativePath) {
  const ext = path.extname(relativePath);
  const rawName = path.basename(relativePath, ext);
  const safeName = sanitizeFilename(rawName);

  const fullPath = path.join(FULL_DIR, safeName + ".webp");
  const thumbPath = path.join(THUMB_DIR, safeName + ".webp");
  const avifPath = path.join(AVIF_DIR, safeName + ".avif");

  const srcSize = fs.statSync(srcPath).size;
  const needsFull = isStale(srcPath, fullPath);
  const needsThumb = isStale(srcPath, thumbPath);
  const needsAvif = isStale(srcPath, avifPath);

  if (!needsFull && !needsThumb && !needsAvif) {
    return { name: rawName, safeName, skipped: true };
  }

  // Load image once, reuse pipeline
  const image = sharp(srcPath, { failOn: "none" }).rotate(); // auto-rotate based on EXIF

  const metadata = await image.metadata();

  const results = {};

  // Full HD WebP
  if (needsFull) {
    const fullBuffer = await image
      .clone()
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toBuffer();
    fs.writeFileSync(fullPath, fullBuffer);
    results.fullSize = fullBuffer.length;
  } else {
    results.fullSize = fs.statSync(fullPath).size;
  }

  // Thumbnail WebP
  if (needsThumb) {
    const thumbBuffer = await image
      .clone()
      .resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 75, effort: 6 })
      .toBuffer();
    fs.writeFileSync(thumbPath, thumbBuffer);
    results.thumbSize = thumbBuffer.length;
  } else {
    results.thumbSize = fs.statSync(thumbPath).size;
  }

  // AVIF version
  if (needsAvif) {
    const avifBuffer = await image
      .clone()
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .avif({ quality: 65, effort: 6 })
      .toBuffer();
    fs.writeFileSync(avifPath, avifBuffer);
    results.avifSize = avifBuffer.length;
  } else {
    results.avifSize = fs.statSync(avifPath).size;
  }

  // Blur placeholder (always regenerate, tiny operation)
  const blurBuffer = await image
    .clone()
    .resize({ width: 16 })
    .webp({ quality: 20 })
    .toBuffer();
  const blurBase64 = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  const reduction = ((1 - results.fullSize / srcSize) * 100).toFixed(0);

  return {
    name: rawName,
    safeName,
    skipped: false,
    srcSize,
    fullSize: results.fullSize,
    thumbSize: results.thumbSize,
    avifSize: results.avifSize,
    blur: blurBase64,
    reduction,
    width: metadata.width,
    height: metadata.height,
  };
}

async function main() {
  console.log("\n=== Magppie Image Optimization Pipeline ===\n");

  ensureDir(RAW_DIR);
  ensureDir(FULL_DIR);
  ensureDir(THUMB_DIR);
  ensureDir(AVIF_DIR);
  ensureDir(path.dirname(BLUR_JSON));

  // Find all images in raw directory
  const pattern = path.join(RAW_DIR, IMAGE_EXTENSIONS).replace(/\\/g, "/");
  const files = await glob(pattern);

  if (files.length === 0) {
    console.log("No images found in", RAW_DIR);
    console.log("Drop your raw images there and re-run.\n");
    return;
  }

  console.log(`Found ${files.length} images to process.\n`);

  const blurMap = {};
  let totalSrcSize = 0;
  let totalOptSize = 0;
  let processed = 0;
  let skipped = 0;

  for (let i = 0; i < files.length; i++) {
    const srcPath = files[i];
    const relativePath = path.relative(RAW_DIR, srcPath);

    try {
      const result = await processImage(srcPath, relativePath);

      if (result.skipped) {
        skipped++;
        process.stdout.write(`  [${i + 1}/${files.length}] ${result.name} ... SKIPPED (up to date)\n`);
        continue;
      }

      blurMap[result.safeName] = { blur: result.blur, width: result.width, height: result.height };
      totalSrcSize += result.srcSize;
      totalOptSize += result.fullSize;
      processed++;

      console.log(
        `  [${i + 1}/${files.length}] ${result.name}: ${formatBytes(result.srcSize)} -> ${formatBytes(result.fullSize)} (full) | ${formatBytes(result.thumbSize)} (thumb) | ${formatBytes(result.avifSize)} (avif) | ${result.reduction}% reduction`
      );
    } catch (err) {
      console.error(`  [${i + 1}/${files.length}] ERROR processing ${relativePath}: ${err.message}`);
    }
  }

  // Load existing blur map and merge
  let existingBlurMap = {};
  if (fs.existsSync(BLUR_JSON)) {
    try {
      existingBlurMap = JSON.parse(fs.readFileSync(BLUR_JSON, "utf-8"));
    } catch {}
  }
  const mergedBlurMap = { ...existingBlurMap, ...blurMap };
  fs.writeFileSync(BLUR_JSON, JSON.stringify(mergedBlurMap, null, 2));

  console.log("\n=== Summary ===");
  console.log(`  Processed: ${processed}`);
  console.log(`  Skipped:   ${skipped}`);
  if (totalSrcSize > 0) {
    console.log(`  Total raw:       ${formatBytes(totalSrcSize)}`);
    console.log(`  Total optimized: ${formatBytes(totalOptSize)} (full WebP)`);
    console.log(`  Overall reduction: ${((1 - totalOptSize / totalSrcSize) * 100).toFixed(0)}%`);
  }
  console.log(`  Blur placeholders: ${BLUR_JSON}`);
  console.log("\nDone!\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
