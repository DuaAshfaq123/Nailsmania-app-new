import {Layout} from '../../theme/spacing';
import {screenWidth} from '../../utils/responsive';

// The synthetic "no filter" chip useCategoryCatalog prepends to the live category names.
// Named here because Home now has to tell it apart from a real category in two places:
// the filters below, and the chip row's selected-card treatment.
export const ALL_CHIP = 'All';

const TRENDING_SEARCH_COUNT = 6;

/**
 * A fresh handful of collection shortcuts for the Search sheet.
 *
 * The old list was a fixed six names from the public catalog. The catalog is now local
 * and static, so a shuffle on each open is what keeps this section from looking like a
 * second copy of the category grid below it.
 */
export const pickRandomSearchChips = (
  filterChips = [],
  count = TRENDING_SEARCH_COUNT,
) => {
  const pool = filterChips.filter(chip => chip.id && chip.id !== ALL_CHIP);
  const shuffled = [...pool];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Fallback only — see getCategoryCardHeight. Retained so a card whose asset dimensions
// can't be resolved still gets the original varied-height look rather than collapsing.
export const MASONRY_HEIGHT_MULTIPLIERS = [
  1.25, 0.85, 1.1, 0.9, 1.2, 0.8, 1.15, 0.95,
];

// Matches what MasonryGrid actually lays out: two flex:1 columns inside a container
// padded by screenPadding on both sides and separated by columnGap. Keep in sync with
// MasonryGrid/styles.js — this is the width every category card is rendered at.
const COLUMN_WIDTH =
  (screenWidth - Layout.screenPadding * 2 - Layout.columnGap) / 2;

// Guardrails against a future asset with a pathological aspect ratio (a 4:1 banner would
// otherwise produce a sliver, a 1:4 one a monolith taller than the viewport).
//
// Expressed as a multiple of COLUMN_WIDTH — i.e. as bounds on the card's aspect ratio —
// deliberately, not as a multiple of categoryBaseHeight. Card width scales with the screen's
// WIDTH while categoryBaseHeight scales with its HEIGHT, so a height-derived bound tightens
// on short/wide devices: at 0.45–1.55x base it already clipped Rajistani on an iPhone SE and
// would have cropped a quarter off every portrait tile on a 4:3 tablet. A ratio bound is
// scale-invariant, so it behaves identically on every device.
//
// Current artwork spans 0.67x (Stylish, 3:2 landscape) to 1.66x (Rajistani, ~3:5 portrait),
// so neither bound is reachable by today's images on any screen size.
const MIN_CARD_HEIGHT = COLUMN_WIDTH * 0.5; // no wider than 2:1
const MAX_CARD_HEIGHT = COLUMN_WIDTH * 2; // no taller than 1:2

// Card height is derived from the image's own aspect ratio rather than from a decorative
// multiplier pattern, because the two were previously unrelated: the multiplier was picked
// by array position, so a tall portrait image could land in a short landscape card and get
// centre-cropped by resizeMode="cover". Bridal (480x720) drew the shortest multiplier and
// lost 30% of its height; Stylish (480x320) sat in a portrait card and lost 46% of its
// width — in both cases the cropped-away part was the fingers.
//
// Sizing the card to the image instead means "cover" has nothing left to crop: the source
// and the frame have identical aspect ratios, so the whole image is always visible, at its
// true proportions (no stretching — cover never distorts, it only ever crops, and here the
// crop is zero) and with no letterbox bars. "contain" would also avoid the crop but would
// pad the mismatch with empty bars instead, which is what would have looked inconsistent
// next to the other full-bleed cards.
//
// The masonry keeps its staggered look for free: real aspect ratios span 0.60–1.50, so
// heights still vary widely (roughly 108–270), which is what assignMasonryColumns balances
// the two columns with.
// Sized from dimensions stored in the packaged manifest, keeping this synchronous.
//
// That matters because the images are now remote: Image.getSize would be an async network
// round-trip per tile, so every card would pop into place after layout. The old
// Image.resolveAssetSource path was removed with the bundled assets — it only ever worked
// on require()d modules and returns nothing for a {uri} source.
const getCategoryCardHeight = (index, explicitSize) => {
  const source =
    explicitSize?.width && explicitSize?.height ? explicitSize : null;

  const fallback =
    Layout.categoryBaseHeight *
    MASONRY_HEIGHT_MULTIPLIERS[index % MASONRY_HEIGHT_MULTIPLIERS.length];

  if (!source?.width || !source?.height) {
    return fallback;
  }

  const height = COLUMN_WIDTH / (source.width / source.height);
  return Math.min(MAX_CARD_HEIGHT, Math.max(MIN_CARD_HEIGHT, height));
};

/**
 * Builds the masonry items for the Home grid.
 *
 * Categories come from the packaged manifest and use local file URIs.
 */
export const buildCategoryMasonryItems = (categories = []) =>
  categories.map((category, index) => ({
    id: `category_${category.id || category.name}`,
    // English identity used for navigation and manifest lookup.
    name: category.name,
    // Localized label for cards / chips.
    displayName: category.displayName || category.name,
    description: category.description || '',
    thumbnail: category.thumbnail,
    height: getCategoryCardHeight(index, {
      width: category.imageWidth,
      height: category.imageHeight,
    }),
  }));

export const filterCategoriesByChip = (categories, selectedChip) => {
  if (selectedChip === ALL_CHIP) {
    return categories.filter(category => category.name !== ALL_CHIP);
  }
  return categories.filter(category => category.name === selectedChip);
};

export const filterTrendingByChip = (items, selectedChip) => {
  if (selectedChip === ALL_CHIP) {
    return items;
  }
  return items.filter(item => item.categoryName === selectedChip);
};
