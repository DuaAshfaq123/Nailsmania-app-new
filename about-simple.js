// Run from the project root:  node about-simple.js
// Uses the ORIGINAL About Us text and only swaps the mehendi words for nails words.
// Run it after node convert-text-to-nails.js (that script writes a rewritten About Us,
// this one replaces it with the simple word-swap version).
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const enPath = path.join(root, 'src', 'i18n', 'locales', 'en.json');
const originalBackup = path.join(root, '_backup_text', 'en.json');

if (!fs.existsSync(enPath)) {
  console.error(`Not found: ${enPath}\nRun this from the project root.`);
  process.exit(1);
}

const read = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
const en = read(enPath);
// Prefer the untouched original saved by convert-text-to-nails.js; otherwise the current file.
const sourceFile = fs.existsSync(originalBackup) ? originalBackup : enPath;
let text = read(sourceFile).legal.aboutUsText;

if (!/mehandi|henna/i.test(text) && sourceFile === enPath) {
  console.log('About Us has no mehendi words left in the current file and no original backup was found.');
  console.log('Nothing changed.');
  process.exit(0);
}

// Order matters: specific phrases first, generic words last.
const SWAPS = [
  ['henna (mehandi)', 'nail'],
  ['Mehandi App', 'Nails App'],
  ['tradition of mehandi', 'tradition of nails'],
  ['art of henna', 'art of nails'],
  ['mehandi designs', 'nail designs'],
  ['mehandi design', 'nail design'],
  ['mehandi inspiration', 'nail inspiration'],
  ['Mehandi', 'Nails'],
  ['mehandi', 'nail'],
  ['henna', 'nail'],
];
SWAPS.forEach(([from, to]) => {
  text = text.split(from).join(to);
});

en.legal.aboutUsText = text;
fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`, 'utf8');

console.log('About Us updated (source: ' + path.relative(root, sourceFile) + ').');
if (/mehandi|mehndi|mehendi|henna/i.test(text)) {
  console.log('Warning: some old words are still in the About Us text.');
}
console.log('\n----- NEW ABOUT US -----' + text + '------------------------');
