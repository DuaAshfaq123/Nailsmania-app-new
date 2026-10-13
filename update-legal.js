// Run from the project root:
//   node update-legal.js "Your Name or Business" "your-email@example.com"
//
// Replaces the previous developer's name and email in the Privacy Policy and Terms &
// Conditions (src/i18n/locales/en.json -> "legal" section) with yours, and sets the
// "effective as of" date to today. Run it AFTER node convert-text-to-nails.js.
const fs = require('fs');
const path = require('path');

const [name, email] = process.argv.slice(2);
if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
  console.error('Usage: node update-legal.js "Your Name" "you@example.com"');
  process.exit(1);
}

const enPath = path.join(process.cwd(), 'src', 'i18n', 'locales', 'en.json');
if (!fs.existsSync(enPath)) {
  console.error(`Not found: ${enPath}\nRun this from the project root.`);
  process.exit(1);
}

const backupDir = path.join(process.cwd(), '_backup_text');
fs.mkdirSync(backupDir, {recursive: true});
const backup = path.join(backupDir, 'en.before-legal.json');
if (!fs.existsSync(backup)) {
  fs.copyFileSync(enPath, backup);
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf8').replace(/^\uFEFF/, ''));
const today = new Date().toISOString().slice(0, 10);

let changes = 0;
const swap = (text, from, to) => {
  const parts = text.split(from);
  changes += parts.length - 1;
  return parts.join(to);
};

Object.keys(en.legal || {}).forEach(key => {
  if (typeof en.legal[key] !== 'string') {
    return;
  }
  let text = en.legal[key];
  text = swap(text, 'Yasir Munir', name);
  text = swap(text, 'yasir.official128@gmail.com', email);
  text = swap(text, 'yasir.munir128@gmail.com', email);
  text = swap(text, '2023-12-03', today);
  en.legal[key] = text;
});

fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`, 'utf8');
console.log(`Done. ${changes} replacements. Name: "${name}", email: ${email}, date: ${today}.`);

// Anything still naming the old developer?
const left = [];
const walk = (node, trail) => {
  if (typeof node === 'string') {
    if (/yasir|munir/i.test(node)) {
      left.push(`${trail}: ${node.slice(0, 80)}`);
    }
  } else if (node && typeof node === 'object') {
    Object.keys(node).forEach(k => walk(node[k], `${trail}.${k}`));
  }
};
walk(en, 'en');
console.log(left.length ? `\nStill mentions the old name:\n${left.join('\n')}` : 'No old developer name left in en.json.');
