/**
 * Daily local-notification copy for engagement.
 *
 * DATA ONLY — no scheduling logic here. The scheduler
 * (src/services/notifications/notificationService.js) picks a random entry when it
 * schedules each day’s 6 PM trigger.
 *
 * Kept as a plain JS module so scheduling still works when the React tree is not mounted
 * (app start / after reboot).
 *
 * This array is now the ENGLISH SOURCE and the identity of the pool, not the display copy.
 * Its length fixes how many messages exist and each entry's INDEX is the key the locale
 * files translate against (`notifications.messages.<index>`), which is also what the
 * scheduler de-duplicates on. Translated copy is resolved in notificationService's
 * localizeMessage; these strings remain the fallback whenever a locale has no entry for an
 * index, so adding a message here before translating it is safe.
 *
 * Consequence for edits: NEVER reorder or splice this array — that silently reassigns
 * every translation after the edit point. Append new messages to the end.
 *
 * Content must stay on-brief for this app: a mehndi/henna design catalog for browsing
 * inspiration (categories, random discoveries, and favourites). No stale claims
 * ("new designs added today"). Mix bridal, festival, regional styles, motifs, light
 * technique/aftercare tips, and open-the-app nudges.
 */
export const NOTIFICATION_MESSAGES = [
  {
    title: "Today's mehndi muse",
    body: 'A fresh set of hand designs is waiting for you.',
  },
  {
    title: 'Bridal inspiration',
    body: 'Royal full-hand patterns for the big day. Take a look.',
  },
  {
    title: 'Keep it simple',
    body: 'Minimal designs that take minutes and still turn heads.',
  },
  {
    title: 'Arabic elegance',
    body: 'Bold, flowing vines that suit any occasion.',
  },
  {
    title: 'Fingertip artistry',
    body: 'Small finger designs with a big finish.',
  },
  {
    title: 'Feeling festive?',
    body: 'Celebration-ready patterns picked for you.',
  },
  {
    title: 'Back-hand beauty',
    body: 'Full-coverage designs that photograph beautifully.',
  },
  {
    title: 'Five minutes to spare?',
    body: 'Try a quick tikki design on your palm.',
  },
  {
    title: 'Deepen your stain',
    body: 'Leave the paste on longer for a richer colour.',
  },
  {
    title: 'Rajasthani heritage',
    body: 'Traditional motifs with centuries behind them.',
  },
  {
    title: 'Foot mehndi',
    body: 'Anklet-style patterns that finish a whole look.',
  },
  {
    title: 'Save your favourites',
    body: 'Build a collection you can come back to anytime.',
  },
  {title: 'Modern and minimal', body: 'Clean lines for an understated finish.'},
  {
    title: 'Practice makes perfect',
    body: 'Start with the centre and work outwards.',
  },
  {
    title: 'Guest-of-honour hands',
    body: "Designs that suit the bride's closest circle.",
  },
  {
    title: 'Warm it up',
    body: 'Gentle warmth after removing the paste helps the colour set.',
  },
  {
    title: 'Floral favourites',
    body: 'Petals, vines and blossoms in every size.',
  },
  {
    title: 'Geometric mehndi',
    body: 'Grids, chevrons and repeats for a sharp finish.',
  },
  {
    title: 'For little hands',
    body: 'Playful, quick designs made for children.',
  },
  {
    title: 'Half-hand designs',
    body: 'A middle ground between minimal and full coverage.',
  },
  {title: 'Wrist to elbow', body: 'Extended patterns for a dramatic sweep.'},
  {title: 'Peacock motifs', body: 'A classic centrepiece that never dates.'},
  {
    title: 'Mandala magic',
    body: 'Circular designs that anchor the whole palm.',
  },
  {title: 'Eid ready', body: 'Festive patterns to wear for the celebration.'},
  {
    title: 'Wedding season',
    body: 'Everything from sangeet to reception, in one place.',
  },
  {
    title: 'Lace-inspired',
    body: 'Delicate net patterns with a soft, romantic feel.',
  },
  {
    title: 'Bold and graphic',
    body: 'Thick strokes and strong shapes for real impact.',
  },
  {
    title: 'A quiet scroll',
    body: 'Open the gallery and pick a design that catches your eye.',
  },
  {
    title: 'Negative space',
    body: 'What you leave bare matters as much as what you fill.',
  },
  {
    title: 'Paisley perfection',
    body: 'The shape at the heart of so many designs.',
  },
  {
    title: 'Fresh inspiration',
    body: 'Open the app and discover designs worth saving.',
  },
  {
    title: 'Bridal side hands',
    body: 'Patterns designed to be seen from every angle.',
  },
  {
    title: 'Cover the gaps',
    body: 'Small dots and dashes tie a busy design together.',
  },
  {title: 'Karwa Chauth ready', body: 'Traditional designs for the occasion.'},
  {
    title: 'Symmetry study',
    body: 'Mirror your left and right for a polished result.',
  },
  {title: 'Thin-line detail', body: 'Fine work that rewards a steady hand.'},
  {title: 'Let it dry', body: 'Four to six hours makes all the difference.'},
  {title: 'Full-hand front', body: 'Palm designs with layers of detail.'},
  {
    title: 'Try a new style',
    body: 'Step outside your usual and see what happens.',
  },
  {
    title: 'Moroccan patterns',
    body: 'Tile-inspired geometry with a distinctive rhythm.',
  },
  {
    title: 'Indo-Arabic mix',
    body: 'Dense Indian detail meets flowing Arabic lines.',
  },
  {title: 'Just the fingers', body: 'A quick design when time is short.'},
  {
    title: 'Bracelet designs',
    body: 'A band around the wrist, and nothing more.',
  },
  {title: 'Something bold', body: 'Go bigger than you normally would today.'},
  {
    title: 'Avoid water early',
    body: 'Keep hands dry for a few hours after removing paste.',
  },
  {
    title: 'Layer your motifs',
    body: 'Build depth by nesting small shapes inside larger ones.',
  },
  {
    title: 'Engagement designs',
    body: 'Elegant patterns for the ring ceremony.',
  },
  {
    title: 'Free-hand practice',
    body: 'Draw without a plan and see where it takes you.',
  },
  {title: 'Leaf and vine', body: 'Organic shapes that flow with the hand.'},
  {
    title: 'Browse the gallery',
    body: 'Open the app and discover designs waiting for you.',
  },
  {
    title: 'Border patterns',
    body: 'Frame a design and the whole thing looks finished.',
  },
  {
    title: 'Checkerboard fills',
    body: 'A simple grid that adds instant texture.',
  },
  {
    title: 'Reception looks',
    body: 'Refined designs for the evening celebration.',
  },
  {title: 'Take your time', body: 'The best designs are never rushed.'},
  {
    title: 'Dots and drops',
    body: 'The simplest element, and one of the most effective.',
  },
  {title: 'Spiral centres', body: 'A coiled middle draws the eye straight in.'},
  {
    title: 'Match your outfit',
    body: 'Pick a design that echoes your embroidery.',
  },
  {
    title: 'Everyday mehndi',
    body: 'You do not need an occasion to wear a design.',
  },
  {title: 'Wrist accents', body: 'Small details that peek out from a sleeve.'},
  {
    title: 'Traditional Indian',
    body: 'Dense, detailed designs rooted in classic style.',
  },
  {
    title: 'Thumb designs',
    body: 'An easy place to start if you are new to this.',
  },
  {
    title: 'Shading and depth',
    body: 'Vary your line weight to make a design come alive.',
  },
  {
    title: 'Save it for later',
    body: 'Found something you love? Add it to your collection.',
  },
  {title: 'Bridal feet', body: 'Intricate patterns from ankle to toe.'},
  {
    title: 'Weekend project',
    body: 'Set aside an afternoon for something detailed.',
  },
  {
    title: 'Fresh paste wins',
    body: 'Newer cones give a darker, cleaner stain.',
  },
  {title: 'Mirror designs', body: 'Two hands, one continuous pattern.'},
  {
    title: 'Teardrop motifs',
    body: 'A soft shape that fills any space beautifully.',
  },
  {
    title: 'Diwali designs',
    body: 'Lamps, flowers and light-inspired patterns.',
  },
  {title: 'Less is more', body: 'One well-placed motif can be enough.'},
  {title: 'Fill the palm', body: 'Centre-heavy designs that radiate outwards.'},
  {
    title: 'Try the back',
    body: 'Back-hand designs are often easier to draw yourself.',
  },
  {
    title: 'Net and jaali',
    body: 'Lattice work that adds richness without weight.',
  },
  {
    title: 'Flowing curves',
    body: 'Let the lines follow the shape of your hand.',
  },
  {
    title: 'A design a day',
    body: 'Browse something new before you settle for the night.',
  },
  {
    title: 'Guest hands',
    body: 'Quick, pretty designs for a room full of people.',
  },
  {
    title: 'Fine-tip cones',
    body: 'A smaller opening gives you far more control.',
  },
  {title: 'Crown motifs', body: 'A regal centrepiece for a bridal design.'},
  {title: 'Sun and moon', body: 'Celestial shapes with a timeless feel.'},
  {
    title: 'Keep it clean',
    body: 'Wipe mistakes immediately, before the paste sets.',
  },
  {
    title: 'Anklet patterns',
    body: 'A band around the ankle finishes bare feet.',
  },
  {
    title: 'Discover a new design',
    body: "See which designs are catching everyone's eye.",
  },
  {
    title: 'Chunky and modern',
    body: 'Thick shapes and open space for a current look.',
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
  {title: 'Start small', body: 'One motif today. A full hand another time.'},
  {title: 'Butterfly motifs', body: 'Light, playful shapes that suit any age.'},
  {
    title: 'Fill with confidence',
    body: 'Commit to the stroke — hesitation shows in the line.',
  },
  {
    title: 'Need a spark?',
    body: 'Twenty seconds in the gallery can unlock your next design.',
  },
  {title: 'Elbow accents', body: 'A small motif above the wrist adds balance.'},
  {title: 'Deep maroon', body: 'The colour keeps developing for a day or two.'},
  {
    title: 'Draw it twice',
    body: 'A design you have done before always comes out better.',
  },
  {
    title: 'Traditional feet',
    body: 'Classic patterns for ceremonies and celebrations.',
  },
  {
    title: 'Pick a favourite',
    body: 'Open your saved designs and choose one to try.',
  },
  {
    title: 'Vine wraps',
    body: 'Spiral a vine up a finger for an easy, striking look.',
  },
  {
    title: 'Big day tomorrow?',
    body: 'Apply the night before so the colour has time to deepen.',
  },
  {
    title: 'Explore a category',
    body: 'There is a whole style you have not opened yet.',
  },
  {
    title: 'Made something?',
    body: 'Save a design and keep it in your collection.',
  },
  {title: 'See you tomorrow', body: 'New inspiration will be here waiting.'},
];

export default NOTIFICATION_MESSAGES;
