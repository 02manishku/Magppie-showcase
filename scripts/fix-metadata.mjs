import fs from "fs";
import sharp from "sharp";
import { glob } from "glob";

async function main() {
  const file = "data/blur-placeholders.json";
  let map = {};
  if (fs.existsSync(file)) {
      map = JSON.parse(fs.readFileSync(file));
  }
  const fullImages = await glob("public/media/optimized/images/full/*.webp");
  for (const p of fullImages) {
    const meta = await sharp(p).metadata();
    const basename = p.replace(/\\/g, '/').split('/').pop().replace('.webp', '');
    if (typeof map[basename] === 'string') {
      map[basename] = { blur: map[basename], width: meta.width, height: meta.height };
    } else if (map[basename]) {
      map[basename].width = meta.width;
      map[basename].height = meta.height;
    } else {
        map[basename] = { width: meta.width, height: meta.height };
    }
  }
  fs.writeFileSync(file, JSON.stringify(map, null, 2));
  console.log("Fixed metadata for", fullImages.length, "images");
}
main();
