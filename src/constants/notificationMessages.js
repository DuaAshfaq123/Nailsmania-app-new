/**
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
 * (`notifications.messages.<index>`), which is also what the scheduler de-duplicates on.
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
export const NOTIFICATION_MESSAGES = [
  {
    title: 'Today\'s nail muse',
    body: 'A fresh set of nail designs is waiting for you.',
  },
  {
    title: 'Bridal inspiration',
    body: 'Elegant bridal nails for the big day. Take a look.',
  },
  {
    title: 'Keep it simple',
    body: 'Minimal designs that take minutes and still turn heads.',
  },
  {
    title: 'French tip classics',
    body: 'Timeless tips that suit every outfit.',
  },
  {
    title: 'Short nail style',
    body: 'Chic ideas that work beautifully on short nails.',
  },
  {
    title: 'Feeling festive?',
    body: 'Celebration-ready nail designs picked for you.',
  },
  {
    title: 'Long and lovely',
    body: 'Elegant designs made for length.',
  },
  {
    title: 'Five minutes to spare?',
    body: 'Browse a quick design to try on your fingertips.',
  },
  {
    title: 'Base coat first',
    body: 'A good base coat helps polish last longer.',
  },
  {
    title: 'Glitter glam',
    body: 'Sparkle for parties, weddings and nights out.',
  },
  {
    title: 'Acrylic ideas',
    body: 'Sculpted shapes and bold colour combinations.',
  },
  {
    title: 'Save your favourites',
    body: 'Build a collection you can come back to anytime.',
  },
  {
    title: 'Modern and minimal',
    body: 'Clean lines for an understated finish.',
  },
  {
    title: 'Practice makes perfect',
    body: 'Start with thin coats and build up the colour.',
  },
  {
    title: 'Bridesmaid nails',
    body: 'Designs that suit the bride\'s closest circle.',
  },
  {
    title: 'Cure it right',
    body: 'Follow your lamp\'s timing so gel sets properly.',
  },
  {
    title: 'Floral favourites',
    body: 'Petals, vines and blossoms on every nail.',
  },
  {
    title: 'Geometric nails',
    body: 'Lines, triangles and shapes for a sharp finish.',
  },
  {
    title: 'For little hands',
    body: 'Playful, simple designs made for kids.',
  },
  {
    title: 'Gel finish',
    body: 'A glossy, long-lasting look worth trying.',
  },
  {
    title: 'Ombre magic',
    body: 'Soft gradients that blend from one shade to the next.',
  },
  {
    title: 'Pearl accents',
    body: 'A little shimmer that feels quietly luxurious.',
  },
  {
    title: 'Eid ready',
    body: 'Festive nail designs for the celebration.',
  },
  {
    title: 'Wedding season',
    body: 'Everything from engagement to reception, in one place.',
  },
  {
    title: 'Lace-inspired',
    body: 'Delicate patterns with a soft, romantic feel.',
  },
  {
    title: 'Bold and graphic',
    body: 'Strong shapes and colour blocks for real impact.',
  },
  {
    title: 'A quiet scroll',
    body: 'Open the gallery and pick a design that catches your eye.',
  },
  {
    title: 'Negative space',
    body: 'What you leave bare matters as much as what you paint.',
  },
  {
    title: 'Nude perfection',
    body: 'Soft neutrals that go with everything.',
  },
  {
    title: 'Fresh inspiration',
    body: 'Open the app and discover designs worth saving.',
  },
  {
    title: 'Marble effect',
    body: 'Swirls of colour that look like polished stone.',
  },
  {
    title: 'Cover the gaps',
    body: 'Tiny dots and lines tie a busy design together.',
  },
  {
    title: 'Party nails',
    body: 'Bright, fun ideas for a night out.',
  },
  {
    title: 'Symmetry study',
    body: 'Match all ten nails for a polished result.',
  },
  {
    title: 'Thin-line detail',
    body: 'Fine work that rewards a steady hand.',
  },
  {
    title: 'Let it dry',
    body: 'Give each coat a moment before adding the next.',
  },
  {
    title: 'Chrome shine',
    body: 'Mirror finishes that catch every light.',
  },
  {
    title: 'Try a new style',
    body: 'Step outside your usual and see what happens.',
  },
  {
    title: 'Almond shape',
    body: 'A soft, flattering shape with endless design options.',
  },
  {
    title: 'Square and sleek',
    body: 'Clean edges that suit bold colours.',
  },
  {
    title: 'Just the accent',
    body: 'One decorated nail is sometimes all you need.',
  },
  {
    title: 'Stiletto drama',
    body: 'Long, pointed designs for a dramatic look.',
  },
  {
    title: 'Something bold',
    body: 'Go bigger than you normally would today.',
  },
  {
    title: 'Protect your cuticles',
    body: 'A drop of oil each day keeps nails looking fresh.',
  },
  {
    title: 'Layer your look',
    body: 'Combine textures, colours and finishes.',
  },
  {
    title: 'Engagement nails',
    body: 'Elegant designs for the ring ceremony.',
  },
  {
    title: 'Free-hand practice',
    body: 'Paint without a plan and see where it takes you.',
  },
  {
    title: 'Leaf and vine',
    body: 'Organic shapes that flow along the nail.',
  },
  {
    title: 'Browse the gallery',
    body: 'Open the app and discover designs waiting for you.',
  },
  {
    title: 'Border and outline',
    body: 'Frame a design and the whole thing looks finished.',
  },
  {
    title: 'Checkerboard fun',
    body: 'A simple pattern that adds instant style.',
  },
  {
    title: 'Reception looks',
    body: 'Refined designs for the evening celebration.',
  },
  {
    title: 'Take your time',
    body: 'The best manicures are never rushed.',
  },
  {
    title: 'Dots and drops',
    body: 'The simplest detail, and one of the most effective.',
  },
  {
    title: 'Swirl and spiral',
    body: 'Curved lines that draw the eye straight in.',
  },
  {
    title: 'Match your outfit',
    body: 'Pick a design that echoes your colours.',
  },
  {
    title: 'Everyday nails',
    body: 'You do not need an occasion to enjoy a good manicure.',
  },
  {
    title: 'Tiny details',
    body: 'Small touches that peek out from a sleeve.',
  },
  {
    title: 'Classic red',
    body: 'A timeless shade that never goes out of style.',
  },
  {
    title: 'Thumb designs',
    body: 'An easy place to start if you are new to nail art.',
  },
  {
    title: 'Shading and depth',
    body: 'Blend colours to make a design come alive.',
  },
  {
    title: 'Save it for later',
    body: 'Found something you love? Add it to your collection.',
  },
  {
    title: 'Rhinestone sparkle',
    body: 'A few well-placed gems add instant glamour.',
  },
  {
    title: 'Weekend project',
    body: 'Set aside an afternoon for something detailed.',
  },
  {
    title: 'Fresh polish wins',
    body: 'Newer bottles give smoother, more even colour.',
  },
  {
    title: 'Matching sets',
    body: 'Ten nails, one continuous look.',
  },
  {
    title: 'Teardrop motifs',
    body: 'A soft shape that fills any nail beautifully.',
  },
  {
    title: 'Winter shades',
    body: 'Deep, rich colours for cooler days.',
  },
  {
    title: 'Less is more',
    body: 'One well-placed detail can be enough.',
  },
  {
    title: 'Cover the whole nail',
    body: 'Full-colour designs that look polished and complete.',
  },
  {
    title: 'Try something short',
    body: 'Short nails are often easier to paint yourself.',
  },
  {
    title: 'Mesh and lace',
    body: 'Delicate textures that add richness without weight.',
  },
  {
    title: 'Flowing curves',
    body: 'Let the lines follow the shape of your nail.',
  },
  {
    title: 'A design a day',
    body: 'Browse something new before you settle for the night.',
  },
  {
    title: 'Guest nails',
    body: 'Quick, pretty designs for a room full of people.',
  },
  {
    title: 'Fine brushes',
    body: 'A thin brush gives you far more control.',
  },
  {
    title: 'Crown motifs',
    body: 'A regal centrepiece for a bridal design.',
  },
  {
    title: 'Sun and moon',
    body: 'Celestial shapes with a timeless feel.',
  },
  {
    title: 'Keep it clean',
    body: 'Wipe mistakes right away, before the polish sets.',
  },
  {
    title: 'Toe-nail ideas',
    body: 'Matching colour finishes a whole look.',
  },
  {
    title: 'Discover a new design',
    body: 'See which designs are catching everyone\'s eye.',
  },
  {
    title: 'Chunky and modern',
    body: 'Bold shapes and open space for a current look.',
  },
  {
    title: 'Delicate and fine',
    body: 'Whisper-thin lines for a soft, subtle finish.',
  },
  {
    title: 'Fusion designs',
    body: 'Blend two styles and make something of your own.',
  },
  {
    title: 'Sister of the bride',
    body: 'Designs that complement without competing.',
  },
  {
    title: 'Start small',
    body: 'One accent today. A full set another time.',
  },
  {
    title: 'Butterfly motifs',
    body: 'Light, playful shapes that suit any age.',
  },
  {
    title: 'Paint with confidence',
    body: 'Commit to the stroke — hesitation shows in the line.',
  },
  {
    title: 'Need a spark?',
    body: 'Twenty seconds in the gallery can unlock your next design.',
  },
  {
    title: 'Top coat time',
    body: 'A glossy top coat seals in colour and shine.',
  },
  {
    title: 'Deep burgundy',
    body: 'A rich shade that feels perfect for any season.',
  },
  {
    title: 'Do it twice',
    body: 'A design you have done before always comes out better.',
  },
  {
    title: 'Pastel palette',
    body: 'Soft shades with a fresh, easy feel.',
  },
  {
    title: 'Pick a favourite',
    body: 'Open your saved designs and choose one to try.',
  },
  {
    title: 'Heart and star',
    body: 'Small shapes that add a playful touch.',
  },
  {
    title: 'Big day tomorrow?',
    body: 'Prep your nails tonight so the colour looks its best.',
  },
  {
    title: 'Explore a category',
    body: 'There is a whole style you have not opened yet.',
  },
  {
    title: 'Found a favourite?',
    body: 'Save a design and keep it in your collection.',
  },
  {
    title: 'Golden touches',
    body: 'A thin gold line lifts any colour.',
  },
  {
    title: 'See you tomorrow',
    body: 'New inspiration will be here waiting.',
  },
];

export default NOTIFICATION_MESSAGES;
