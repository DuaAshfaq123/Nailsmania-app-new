// Run from the project root:  node convert-text-to-nails.js
// Rewrites src/i18n/locales/en.json (mehandi -> nails text) and regenerates
// src/constants/notificationMessages.js so both use the SAME 100 messages in the SAME order.
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const enPath = path.join(root, 'src', 'i18n', 'locales', 'en.json');
const msgPath = path.join(root, 'src', 'constants', 'notificationMessages.js');

for (const p of [enPath, msgPath]) {
  if (!fs.existsSync(p)) {
    console.error(`Not found: ${p}\nRun this from the project root.`);
    process.exit(1);
  }
}

// ---- Backup (only the first time, so a second run never overwrites the originals) ----
const backupDir = path.join(root, '_backup_text');
fs.mkdirSync(backupDir, {recursive: true});
const backupOnce = (src, name) => {
  const dest = path.join(backupDir, name);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
  }
};
backupOnce(enPath, 'en.json');
backupOnce(msgPath, 'notificationMessages.js');

// ---- The 100 nails notification messages (title, body) ----
const MESSAGES = [
  ["Today's nail muse", 'A fresh set of nail designs is waiting for you.'],
  ['Bridal inspiration', 'Elegant bridal nails for the big day. Take a look.'],
  ['Keep it simple', 'Minimal designs that take minutes and still turn heads.'],
  ['French tip classics', 'Timeless tips that suit every outfit.'],
  ['Short nail style', 'Chic ideas that work beautifully on short nails.'],
  ['Feeling festive?', 'Celebration-ready nail designs picked for you.'],
  ['Long and lovely', 'Elegant designs made for length.'],
  ['Five minutes to spare?', 'Browse a quick design to try on your fingertips.'],
  ['Base coat first', 'A good base coat helps polish last longer.'],
  ['Glitter glam', 'Sparkle for parties, weddings and nights out.'],
  ['Acrylic ideas', 'Sculpted shapes and bold colour combinations.'],
  ['Save your favourites', 'Build a collection you can come back to anytime.'],
  ['Modern and minimal', 'Clean lines for an understated finish.'],
  ['Practice makes perfect', 'Start with thin coats and build up the colour.'],
  ['Bridesmaid nails', "Designs that suit the bride's closest circle."],
  ['Cure it right', "Follow your lamp's timing so gel sets properly."],
  ['Floral favourites', 'Petals, vines and blossoms on every nail.'],
  ['Geometric nails', 'Lines, triangles and shapes for a sharp finish.'],
  ['For little hands', 'Playful, simple designs made for kids.'],
  ['Gel finish', 'A glossy, long-lasting look worth trying.'],
  ['Ombre magic', 'Soft gradients that blend from one shade to the next.'],
  ['Pearl accents', 'A little shimmer that feels quietly luxurious.'],
  ['Eid ready', 'Festive nail designs for the celebration.'],
  ['Wedding season', 'Everything from engagement to reception, in one place.'],
  ['Lace-inspired', 'Delicate patterns with a soft, romantic feel.'],
  ['Bold and graphic', 'Strong shapes and colour blocks for real impact.'],
  ['A quiet scroll', 'Open the gallery and pick a design that catches your eye.'],
  ['Negative space', 'What you leave bare matters as much as what you paint.'],
  ['Nude perfection', 'Soft neutrals that go with everything.'],
  ['Fresh inspiration', 'Open the app and discover designs worth saving.'],
  ['Marble effect', 'Swirls of colour that look like polished stone.'],
  ['Cover the gaps', 'Tiny dots and lines tie a busy design together.'],
  ['Party nails', 'Bright, fun ideas for a night out.'],
  ['Symmetry study', 'Match all ten nails for a polished result.'],
  ['Thin-line detail', 'Fine work that rewards a steady hand.'],
  ['Let it dry', 'Give each coat a moment before adding the next.'],
  ['Chrome shine', 'Mirror finishes that catch every light.'],
  ['Try a new style', 'Step outside your usual and see what happens.'],
  ['Almond shape', 'A soft, flattering shape with endless design options.'],
  ['Square and sleek', 'Clean edges that suit bold colours.'],
  ['Just the accent', 'One decorated nail is sometimes all you need.'],
  ['Stiletto drama', 'Long, pointed designs for a dramatic look.'],
  ['Something bold', 'Go bigger than you normally would today.'],
  ['Protect your cuticles', 'A drop of oil each day keeps nails looking fresh.'],
  ['Layer your look', 'Combine textures, colours and finishes.'],
  ['Engagement nails', 'Elegant designs for the ring ceremony.'],
  ['Free-hand practice', 'Paint without a plan and see where it takes you.'],
  ['Leaf and vine', 'Organic shapes that flow along the nail.'],
  ['Browse the gallery', 'Open the app and discover designs waiting for you.'],
  ['Border and outline', 'Frame a design and the whole thing looks finished.'],
  ['Checkerboard fun', 'A simple pattern that adds instant style.'],
  ['Reception looks', 'Refined designs for the evening celebration.'],
  ['Take your time', 'The best manicures are never rushed.'],
  ['Dots and drops', 'The simplest detail, and one of the most effective.'],
  ['Swirl and spiral', 'Curved lines that draw the eye straight in.'],
  ['Match your outfit', 'Pick a design that echoes your colours.'],
  ['Everyday nails', 'You do not need an occasion to enjoy a good manicure.'],
  ['Tiny details', 'Small touches that peek out from a sleeve.'],
  ['Classic red', 'A timeless shade that never goes out of style.'],
  ['Thumb designs', 'An easy place to start if you are new to nail art.'],
  ['Shading and depth', 'Blend colours to make a design come alive.'],
  ['Save it for later', 'Found something you love? Add it to your collection.'],
  ['Rhinestone sparkle', 'A few well-placed gems add instant glamour.'],
  ['Weekend project', 'Set aside an afternoon for something detailed.'],
  ['Fresh polish wins', 'Newer bottles give smoother, more even colour.'],
  ['Matching sets', 'Ten nails, one continuous look.'],
  ['Teardrop motifs', 'A soft shape that fills any nail beautifully.'],
  ['Winter shades', 'Deep, rich colours for cooler days.'],
  ['Less is more', 'One well-placed detail can be enough.'],
  ['Cover the whole nail', 'Full-colour designs that look polished and complete.'],
  ['Try something short', 'Short nails are often easier to paint yourself.'],
  ['Mesh and lace', 'Delicate textures that add richness without weight.'],
  ['Flowing curves', 'Let the lines follow the shape of your nail.'],
  ['A design a day', 'Browse something new before you settle for the night.'],
  ['Guest nails', 'Quick, pretty designs for a room full of people.'],
  ['Fine brushes', 'A thin brush gives you far more control.'],
  ['Crown motifs', 'A regal centrepiece for a bridal design.'],
  ['Sun and moon', 'Celestial shapes with a timeless feel.'],
  ['Keep it clean', 'Wipe mistakes right away, before the polish sets.'],
  ['Toe-nail ideas', 'Matching colour finishes a whole look.'],
  ['Discover a new design', "See which designs are catching everyone's eye."],
  ['Chunky and modern', 'Bold shapes and open space for a current look.'],
  ['Delicate and fine', 'Whisper-thin lines for a soft, subtle finish.'],
  ['Fusion designs', 'Blend two styles and make something of your own.'],
  ['Sister of the bride', 'Designs that complement without competing.'],
  ['Start small', 'One accent today. A full set another time.'],
  ['Butterfly motifs', 'Light, playful shapes that suit any age.'],
  ['Paint with confidence', 'Commit to the stroke — hesitation shows in the line.'],
  ['Need a spark?', 'Twenty seconds in the gallery can unlock your next design.'],
  ['Top coat time', 'A glossy top coat seals in colour and shine.'],
  ['Deep burgundy', 'A rich shade that feels perfect for any season.'],
  ['Do it twice', 'A design you have done before always comes out better.'],
  ['Pastel palette', 'Soft shades with a fresh, easy feel.'],
  ['Pick a favourite', 'Open your saved designs and choose one to try.'],
  ['Heart and star', 'Small shapes that add a playful touch.'],
  ['Big day tomorrow?', 'Prep your nails tonight so the colour looks its best.'],
  ['Explore a category', 'There is a whole style you have not opened yet.'],
  ['Found a favourite?', 'Save a design and keep it in your collection.'],
  ['Golden touches', 'A thin gold line lifts any colour.'],
  ['See you tomorrow', 'New inspiration will be here waiting.'],
].map(([title, body]) => ({title, body}));

if (MESSAGES.length !== 100) {
  console.warn(`Note: ${MESSAGES.length} messages (expected 100).`);
}

// ---- en.json ----
const en = JSON.parse(fs.readFileSync(enPath, 'utf8').replace(/^\uFEFF/, ''));

const set = (dotPath, value) => {
  const keys = dotPath.split('.');
  let obj = en;
  for (const key of keys.slice(0, -1)) {
    if (!obj || typeof obj[key] !== 'object') {
      console.warn(`MISSING KEY (skipped): ${dotPath}`);
      return;
    }
    obj = obj[key];
  }
  obj[keys[keys.length - 1]] = value;
};

// Legal text: keep developer name and contact as requested, only swap the app name.
const renameInLegal = node => {
  Object.keys(node).forEach(key => {
    if (typeof node[key] === 'string') {
      node[key] = node[key].replace(/Mehandi/g, 'Nails');
    }
  });
};
if (en.legal) {
  renameInLegal(en.legal);
}

set('common.appLogoLabel', 'Nails app logo');
set('common.searchNoResultsSubtitle', 'Try Bridal, Acrylic, or French Tips');

set(
  'upload.guidancePlaceholder',
  'e.g. Apply a thin base coat first and cure for 60 seconds. Finish with a glossy top coat.',
);

set(
  'guidelines.whatToIncludeBody',
  'Show the full design clearly, with the nails fully visible in frame. A close-up detail shot is welcome as a separate submission.',
);

set('support.emailSubject', 'Nails App Support');

set('home.brandTitle', 'Nails');
set('home.categoryDescriptionFallback', 'Beautiful nail inspiration');
set('home.categoryNames', {
  All: 'All',
  Acrylic: 'Acrylic',
  Gel: 'Gel',
  'French Tips': 'French Tips',
  'Nail Art': 'Nail Art',
  Bridal: 'Bridal',
  'Short Nails': 'Short Nails',
  'Long Nails': 'Long Nails',
  Glitter: 'Glitter',
  Minimal: 'Minimal',
  'Eid Special': 'Eid Special',
  Kids: 'Kids',
});
set('home.categoryDescriptions', {
  All: 'Explore every style in one place',
  Acrylic: 'Sculpted shapes and bold colour',
  Gel: 'Glossy, long-lasting finishes',
  'French Tips': 'Timeless tips for every outfit',
  'Nail Art': 'Creative designs, painted by hand',
  Bridal: 'Elegant looks for your special day',
  'Short Nails': 'Chic ideas for short lengths',
  'Long Nails': 'Statement designs made for length',
  Glitter: 'Sparkle for every celebration',
  Minimal: 'Clean, simple and understated',
  'Eid Special': 'Festive designs for celebration',
  Kids: 'Playful designs for little hands',
});

set('notifications.channelDescription', 'One nail design idea each evening at 6 PM.');
set(
  'notifications.downloadCompleteBody',
  'Saved to your gallery in the Nails724 album.',
);
set('notifications.messages', MESSAGES);

set(
  'legal.aboutUsText',
  [
    '',
    'Welcome to Nails App - your gallery of nail design inspiration, from everyday manicures to bridal and festive looks!',
    '',
    'Our Journey:',
    'Nails App was born from a love of beautiful, expressive nails. We set out to build a place where great designs are easy to browse, save, and carry with you whenever you need inspiration.',
    '',
    'Our Purpose:',
    'Our mission is simple: help you find the perfect nail design for any occasion, quickly and beautifully. We make discovering and revisiting your favorite designs effortless, wherever you are.',
    '',
    'Our Commitment:',
    "We're committed to providing a well-organized, high-quality library of nail designs, thoughtfully categorized so you can find exactly what you're looking for - from short and minimal styles to acrylic, gel, glitter, and bridal collections.",
    '',
    'Features and Offerings:',
    '- Browse an extensive gallery of nail designs, categorized by style, length, and occasion.',
    '- Save your favorite designs to revisit anytime.',
    '- Download designs to your device for offline reference.',
    '- Share designs you love directly from the app.',
    '- Keep your own reference photos privately in My Designs, saved only on your device.',
    '',
    'Our Vision:',
    "Our vision is to be your go-to source for nail inspiration - whether you're a bride planning your big day, a nail artist looking for references, or simply someone who loves a fresh manicure.",
    '',
    'Contact Us:',
    'Have questions, suggestions, or feedback in mind? Feel free to reach out to us at {{email}}. Your input is invaluable in shaping the Nails App experience.',
    '',
    'Thank you for using Nails App, where style, creativity, and self-expression come together!',
    '',
  ].join('\n'),
);

fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`, 'utf8');
console.log('updated   src/i18n/locales/en.json');

// ---- notificationMessages.js (same MESSAGES, same order) ----
const q = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const header = `/**
 * Daily local-notification copy for engagement.
 *
 * DATA ONLY — no scheduling logic here. The scheduler
 * (src/services/notifications/notificationService.js) picks a random entry when it
 * schedules each day's 6 PM trigger.
 *
 * Kept as a plain JS module so scheduling still works when the React tree is not mounted
 * (app start / after reboot).
 *
 * This array is the ENGLISH SOURCE and the identity of the pool. Its length fixes how many
 * messages exist and each entry's INDEX is the key the locale files translate against
 * (\`notifications.messages.<index>\`), which is also what the scheduler de-duplicates on.
 * en.json holds the same messages in the same order.
 *
 * Consequence for edits: NEVER reorder or splice this array — that silently reassigns
 * every translation after the edit point. Append new messages to the end.
 *
 * Content must stay on-brief for this app: a nail design catalog for browsing inspiration
 * (categories, random discoveries, and favourites). No stale claims ("new designs added
 * today"). Mix bridal, festival, styles, shapes, light technique/care tips, and
 * open-the-app nudges.
 */
`;

const body = MESSAGES.map(
  m => `  {\n    title: ${q(m.title)},\n    body: ${q(m.body)},\n  },\n`,
).join('');

fs.writeFileSync(
  msgPath,
  `${header}export const NOTIFICATION_MESSAGES = [\n${body}];\n\nexport default NOTIFICATION_MESSAGES;\n`,
  'utf8',
);
console.log('updated   src/constants/notificationMessages.js');

// ---- Report any old-theme words left in en.json ----
const OLD = /mehn|mehand|henna|mehendi|tikki|rajist|rajasth|karwa|diwali/i;
const leftovers = [];
const walk = (node, trail) => {
  if (typeof node === 'string') {
    if (OLD.test(node)) {
      leftovers.push(`${trail}: ${node.slice(0, 90)}`);
    }
  } else if (node && typeof node === 'object') {
    Object.keys(node).forEach(key => walk(node[key], `${trail}.${key}`));
  }
};
walk(en, 'en');
console.log(
  leftovers.length
    ? `\nStill mentions old-theme words:\n${leftovers.join('\n')}`
    : '\nNo old-theme words left in en.json.',
);
console.log(`\nDone. ${MESSAGES.length} notification messages written to both files.`);
