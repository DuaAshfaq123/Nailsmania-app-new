// Run from the project root (C:\nails):
//   node set-app-name.js "NailsMania"
//
// Sets the app name in EVERY place, whatever the files currently contain (even a typo
// like "Nailss"), and prints what each place said before and after:
//   1. name under the icon on the phone   android/.../values/strings.xml  (needs a rebuild)
//   2. title on the first page            en.json -> home.brandTitle        (reload is enough)
//   3. logo label, support email subject  en.json
//   4. About Us / Terms / Privacy text    en.json -> legal (only the app-name words)
//   5. Share message                      src/constants/config.js
// Backups go to _backup_setname (created once). Allowed: letters, numbers, spaces, - . &
const fs = require('fs');
const path = require('path');

const name = (process.argv[2] || '').trim();
if (!/^[A-Za-z0-9][A-Za-z0-9 .&-]{1,29}$/.test(name)) {
  console.error('Usage: node set-app-name.js "NailsMania"\nUse 2-30 characters: letters, numbers, spaces, - . &');
  process.exit(1);
}

const root = process.cwd();
const stringsPath = path.join(root, 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');
const enPath = path.join(root, 'src', 'i18n', 'locales', 'en.json');
const configPath = path.join(root, 'src', 'constants', 'config.js');
for (const p of [stringsPath, enPath, configPath]) {
  if (!fs.existsSync(p)) {
    console.error(`Not found: ${p}\nRun this from the project root (C:\\nails).`);
    process.exit(1);
  }
}

const backupDir = path.join(root, '_backup_setname');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
  [stringsPath, enPath, configPath].forEach(p =>
    fs.copyFileSync(p, path.join(backupDir, path.basename(p))),
  );
}

const show = (label, before, after) =>
  console.log(`  ${label.padEnd(22)} "${before}"  ->  "${after}"`);
console.log(`Setting the app name to "${name}":\n`);

// 1. strings.xml
const xml = fs.readFileSync(stringsPath, 'utf8');
const xmlBefore = (xml.match(/<string name="app_name">([^<]*)<\/string>/) || [])[1] || '(not found)';
const xmlSafe = name.replace(/&/g, '&amp;');
fs.writeFileSync(
  stringsPath,
  xml.replace(/(<string name="app_name">)[^<]*(<\/string>)/, `$1${xmlSafe}$2`),
  'utf8',
);
show('phone name (xml)', xmlBefore, xmlSafe);

// 2-4. en.json
const en = JSON.parse(fs.readFileSync(enPath, 'utf8').replace(/^\uFEFF/, ''));
const oldBrand = (en.home && en.home.brandTitle) || '';
show('first-page title', oldBrand, name);
en.home.brandTitle = name;
if (en.common) {
  show('logo label', en.common.appLogoLabel, `${name} app logo`);
  en.common.appLogoLabel = `${name} app logo`;
}
if (en.support) {
  show('support subject', en.support.emailSubject, `${name} Support`);
  en.support.emailSubject = `${name} Support`;
}
let legalChanged = 0;
if (en.legal) {
  Object.keys(en.legal).forEach(key => {
    if (typeof en.legal[key] !== 'string') {
      return;
    }
    let text = en.legal[key];
    if (oldBrand && oldBrand !== name) {
      text = text.split(oldBrand).join(name);
    }
    // "Nails App" / "Nailss app" style leftovers (the word right before "App"/"app")
    text = text.replace(/\bNails+(?= [Aa]pp\b)/g, name);
    if (text !== en.legal[key]) {
      legalChanged += 1;
      en.legal[key] = text;
    }
  });
}
console.log(`  ${'legal text'.padEnd(22)} ${legalChanged} block(s) updated`);
fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`, 'utf8');

// 5. config.js share message
const cfg = fs.readFileSync(configPath, 'utf8');
const cfgBefore = (cfg.match(/Check out ([^!`]*)!/) || [])[1] || '(not found)';
fs.writeFileSync(configPath, cfg.replace(/Check out [^!`]*!/, `Check out ${name}!`), 'utf8');
show('share message', cfgBefore, name);

console.log('\nNext:');
console.log('  - the phone name (xml) needs a rebuild:  npx react-native run-android');
console.log('  - the in-app text only needs a reload (press r in the Metro window)');
