// Run from the project root:  node build-catalog.js
//
// Builds catalog-packs/ (tiles, thumbs + catalog.json, full) from your nail images.
//
// Put your images here, ONE FOLDER PER CATEGORY, folder names exactly as below:
//
//   nail-images/
//     Acrylic/        01.jpg 02.jpg ...
//     Gel/
//     French Tips/
//     Nail Art/
//     Bridal/
//     Short Nails/
//     Long Nails/
//     Glitter/
//     Minimal/
//     Eid Special/
//     Kids/
//
// Optional: a file named "cover.jpg" (or .png/.webp) inside a category folder is used
// for that category's Home tile and is NOT added as a design. Without it, the first image is used.
//
// One-time setup:  npm install --no-save sharp
const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('The "sharp" package is missing. Run:  npm install --no-save sharp');
  process.exit(1);
}

const ROOT = process.cwd();
const INPUT = path.join(ROOT, 'nail-images');
const OUT = path.join(ROOT, 'catalog-packs');

// Must match src/constants/categories.js (without "All") and en.json home.categoryNames.
const CATEGORIES = [
  ['Acrylic', 'Sculpted shapes and bold colour'],
  ['Gel', 'Glossy, long-lasting finishes'],
  ['French Tips', 'Timeless tips for every outfit'],
  ['Nail Art', 'Creative designs, painted by hand'],
  ['Bridal', 'Elegant looks for your special day'],
  ['Short Nails', 'Chic ideas for short lengths'],
  ['Long Nails', 'Statement designs made for length'],
  ['Glitter', 'Sparkle for every celebration'],
  ['Minimal', 'Clean, simple and understated'],
  ['Eid Special', 'Festive designs for celebration'],
  ['Kids', 'Playful designs for little hands'],
];

const TILE_WIDTH = 480;
const THUMB_WIDTH = 480;
const FULL_MAX = 1600;
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;
const COVER = /^cover\.(jpe?g|png|webp)$/i;
const slugify = s =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const fileSize = dir => {
  let total = 0;
  const walk = d =>
    fs.readdirSync(d, {withFileTypes: true}).forEach(e => {
      const p = path.join(d, e.name);
      e.isDirectory() ? walk(p) : (total += fs.statSync(p).size);
    });
  walk(dir);
  return total;
};

(async () => {
  if (!fs.existsSync(INPUT)) {
    console.error(`Folder not found: ${INPUT}\nCreate nail-images/<Category>/ folders first (see the top of this file).`);
    process.exit(1);
  }

  // Only the three generated folders are reset; nothing else is touched.
  ['tiles', 'thumbs', 'full'].forEach(name => {
    fs.rmSync(path.join(OUT, name), {recursive: true, force: true});
    fs.mkdirSync(path.join(OUT, name), {recursive: true});
  });

  const manifest = {version: 1, categories: [], designs: []};

  for (const [name, description] of CATEGORIES) {
    const dir = path.join(INPUT, name);
    if (!fs.existsSync(dir)) {
      console.warn(`SKIPPED  "${name}" - folder nail-images/${name} not found`);
      continue;
    }
    const files = fs.readdirSync(dir).filter(f => IMAGE_EXT.test(f)).sort();
    const coverFile = files.find(f => COVER.test(f));
    const designFiles = files.filter(f => !COVER.test(f));
    if (designFiles.length === 0) {
      console.warn(`SKIPPED  "${name}" - no images inside`);
      continue;
    }

    const slug = slugify(name);
    fs.mkdirSync(path.join(OUT, 'thumbs', slug), {recursive: true});
    fs.mkdirSync(path.join(OUT, 'full', slug), {recursive: true});

    // Home tile
    const tileSource = path.join(dir, coverFile || designFiles[0]);
    const tileInfo = await sharp(tileSource)
      .rotate()
      .resize({width: TILE_WIDTH, withoutEnlargement: true})
      .webp({quality: 75})
      .toFile(path.join(OUT, 'tiles', `${slug}.webp`));

    manifest.categories.push({
      id: name,
      name,
      slug,
      description,
      imageWidth: tileInfo.width,
      imageHeight: tileInfo.height,
      count: designFiles.length,
    });

    // Designs
    let index = 0;
    for (const file of designFiles) {
      index += 1;
      const num = String(index).padStart(3, '0');
      const thumbPath = `${slug}/${num}.webp`;
      const fullPath = `${slug}/${num}.webp`;
      const src = path.join(dir, file);

      const thumbInfo = await sharp(src)
        .rotate()
        .resize({width: THUMB_WIDTH, withoutEnlargement: true})
        .webp({quality: 70})
        .toFile(path.join(OUT, 'thumbs', thumbPath));

      await sharp(src)
        .rotate()
        .resize({width: FULL_MAX, height: FULL_MAX, fit: 'inside', withoutEnlargement: true})
        .webp({quality: 82})
        .toFile(path.join(OUT, 'full', fullPath));

      manifest.designs.push({
        id: `${slug}-${num}`,
        categoryId: name,
        thumbPath,
        fullPath,
        width: thumbInfo.width,
        height: thumbInfo.height,
      });
    }
    console.log(`OK       ${name}: ${designFiles.length} designs`);
  }

  fs.writeFileSync(
    path.join(OUT, 'thumbs', 'catalog.json'),
    JSON.stringify(manifest, null, 2),
  );

  const mb = n => (n / 1048576).toFixed(1);
  console.log(
    `\nDone: ${manifest.categories.length} categories, ${manifest.designs.length} designs.`,
  );
  console.log(
    `Sizes  tiles ${mb(fileSize(path.join(OUT, 'tiles')))} MB | thumbs ${mb(fileSize(path.join(OUT, 'thumbs')))} MB | full ${mb(fileSize(path.join(OUT, 'full')))} MB`,
  );
  if (manifest.categories.length === 0) {
    console.error('No categories were built - check your folder names.');
    process.exit(1);
  }
})();
