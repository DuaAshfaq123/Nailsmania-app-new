// Run from the project root (C:\nails):
//   node apply-logo.js my-logo.png "#FAF5F6"
//
// 1st argument: your logo (square PNG, transparent background, ideally 1024x1024)
// 2nd argument: splash + icon background colour (default #FAF5F6, the nails blush)
//
// Replaces, from that one logo:
//   - phone launcher icons (mipmap-*/ic_launcher.png + ic_launcher_round.png)
//   - the splash screen (drawable-nodpi/bootsplash_fullscreen.png, the library logo files,
//     blanks the old brand/tagline images, and sets the splash colour)
//   - the in-app logo (src/assets/images/AppLogo.png, shrunk to 512x512)
//   - notification accent colour (values/colors.xml)
// Every file it touches is copied to _backup_logo first. Run once; to run again, delete
// or rename _backup_logo.
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

const [logoArg, bgArg = '#FAF5F6'] = process.argv.slice(2);
if (!logoArg || !fs.existsSync(logoArg)) {
  console.error('Usage: node apply-logo.js my-logo.png "#FAF5F6"\nLogo file not found: ' + logoArg);
  process.exit(1);
}
if (!/^#[0-9a-fA-F]{6}$/.test(bgArg)) {
  console.error('Background colour must look like #FAF5F6');
  process.exit(1);
}

const ROOT = process.cwd();
const RES = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');
const BACKUP = path.join(ROOT, '_backup_logo');
const LOGO = path.resolve(logoArg);
const bgHex = bgArg.toUpperCase();
const bg = {
  r: parseInt(bgHex.slice(1, 3), 16),
  g: parseInt(bgHex.slice(3, 5), 16),
  b: parseInt(bgHex.slice(5, 7), 16),
  alpha: 1,
};
const CLEAR = {r: 0, g: 0, b: 0, alpha: 0};

if (!fs.existsSync(RES)) {
  console.error(`Not found: ${RES}\nRun this from the project root.`);
  process.exit(1);
}
if (fs.existsSync(BACKUP)) {
  console.error('_backup_logo already exists. Rename or delete it, then run again.');
  process.exit(1);
}
fs.mkdirSync(BACKUP);

const backup = file => {
  if (!fs.existsSync(file)) {
    return;
  }
  const dest = path.join(BACKUP, path.relative(ROOT, file));
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.copyFileSync(file, dest);
};

const written = [];
const out = async (file, pipeline) => {
  backup(file);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  await pipeline.png({compressionLevel: 9}).toFile(file);
  written.push(path.relative(ROOT, file));
};

// Existing pixel size of a file, or a fallback when it is missing.
const sizeOf = async (file, fallback) => {
  try {
    const m = await sharp(file).metadata();
    return {w: m.width, h: m.height};
  } catch (e) {
    return {w: fallback, h: fallback};
  }
};

// Logo resized to fit inside a w x h box, transparent padding.
const fitLogo = (w, h, fraction = 1) =>
  sharp(LOGO)
    .resize(Math.round(w * fraction), Math.round(h * fraction), {fit: 'contain', background: CLEAR})
    .png()
    .toBuffer();

(async () => {
  const meta = await sharp(LOGO).metadata();
  console.log(`Logo: ${meta.width}x${meta.height}, alpha: ${meta.hasAlpha ? 'yes' : 'NO (a solid background will show)'}`);

  // ---- 1. Launcher icons ----
  const DENSITIES = {mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192};
  for (const [density, def] of Object.entries(DENSITIES)) {
    const dir = path.join(RES, `mipmap-${density}`);
    const {w: s} = await sizeOf(path.join(dir, 'ic_launcher.png'), def);
    const inner = await fitLogo(s, s, 0.78);
    const square = await sharp({create: {width: s, height: s, channels: 4, background: bg}})
      .composite([{input: inner, gravity: 'centre'}])
      .png()
      .toBuffer();
    await out(path.join(dir, 'ic_launcher.png'), sharp(square));
    const mask = Buffer.from(
      `<svg width="${s}" height="${s}"><circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}" fill="#fff"/></svg>`,
    );
    await out(
      path.join(dir, 'ic_launcher_round.png'),
      sharp(square).composite([{input: mask, blend: 'dest-in'}]),
    );
  }
  console.log('OK  launcher icons');

  // ---- 2. Splash screen ----
  // The old splash was one fullscreen picture stretched across the screen. It is replaced by
  // the logo alone on the splash colour, drawn at its real size in the middle (no stretching).
  const fullscreen = await fitLogo(600, 600);
  await out(
    path.join(RES, 'drawable-nodpi', 'bootsplash_fullscreen.png'),
    sharp({create: {width: 600, height: 600, channels: 4, background: CLEAR}}).composite([
      {input: fullscreen, gravity: 'centre'},
    ]),
  );

  const splashXml = path.join(RES, 'drawable', 'compat_splash_screen.xml');
  if (fs.existsSync(splashXml)) {
    backup(splashXml);
    const xml = fs.readFileSync(splashXml, 'utf8');
    const next = xml.replace('fill_horizontal|center_vertical', 'center');
    fs.writeFileSync(splashXml, next, 'utf8');
    written.push(path.relative(ROOT, splashXml) + (next === xml ? ' (gravity not found, unchanged)' : ' (gravity -> center)'));
  }

  // Library logo / brand files: same pixel sizes as before, so nothing that references them breaks.
  for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
    const dir = path.join(RES, `drawable-${density}`);
    const logoFile = path.join(dir, 'bootsplash_logo.png');
    if (fs.existsSync(logoFile)) {
      const {w, h} = await sizeOf(logoFile, 288);
      const inner = await fitLogo(w, h, 0.9);
      await out(
        logoFile,
        sharp({create: {width: w, height: h, channels: 4, background: CLEAR}}).composite([
          {input: inner, gravity: 'centre'},
        ]),
      );
    }
    const brandFile = path.join(dir, 'bootsplash_brand.png');
    if (fs.existsSync(brandFile)) {
      const {w, h} = await sizeOf(brandFile, 80);
      await out(brandFile, sharp({create: {width: w, height: h, channels: 4, background: CLEAR}}));
    }
  }

  const colorsXml = path.join(RES, 'values', 'colors.xml');
  if (fs.existsSync(colorsXml)) {
    backup(colorsXml);
    let c = fs.readFileSync(colorsXml, 'utf8');
    c = c.replace(/(<color name="bootsplash_background">)[^<]*(<\/color>)/, `$1${bgHex}$2`);
    c = c.replace(/(<color name="notification_color">)[^<]*(<\/color>)/, '$1#C94B77$2');
    fs.writeFileSync(colorsXml, c, 'utf8');
    written.push(path.relative(ROOT, colorsXml) + ` (splash ${bgHex}, notification #C94B77)`);
  }
  console.log('OK  splash screen');

  // ---- 3. In-app logo ----
  const inApp = path.join(ROOT, 'src', 'assets', 'images', 'AppLogo.png');
  await out(inApp, sharp(LOGO).resize(512, 512, {fit: 'contain', background: CLEAR}));
  console.log('OK  in-app logo');

  console.log('\nChanged:\n  ' + written.join('\n  '));
  console.log(`\nBackups are in ${path.relative(ROOT, BACKUP)}.`);
  console.log('Next: uninstall the old app from the phone, then run npx react-native run-android.');
  console.log('Not changed: the small notification icon (drawable/ic_notification.xml).');
})().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
