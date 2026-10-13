import {
  ensureCatalogPack,
  readPackJson,
  resolveBaseAssetUri,
  resolvePackUri,
} from './catalogBridge';

let catalogPromise;
let fullPackPromise;

const shuffle = items => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const buildCatalog = async () => {
  const manifest = await readPackJson('thumbs', 'catalog.json');
  const thumbsRoot = await ensureCatalogPack('thumbs');

  const categories = await Promise.all(
    manifest.categories.map(async category => ({
      ...category,
      imageUrl: await resolveBaseAssetUri(
        `catalog/tiles/${category.slug}.webp`,
      ),
    })),
  );

  const designs = manifest.designs.map(design => ({
    ...design,
    designId: design.id,
    categoryName: design.categoryId,
    thumbnailUrl: resolvePackUri(thumbsRoot, design.thumbPath),
    fullUrl: resolvePackUri(thumbsRoot, design.thumbPath),
  }));

  const designsByCategory = new Map();
  designs.forEach(design => {
    const entries = designsByCategory.get(design.categoryId) || [];
    entries.push(design);
    designsByCategory.set(design.categoryId, entries);
  });

  return {categories, designs, designsByCategory};
};

export const loadCatalog = () => {
  if (!catalogPromise) {
    catalogPromise = buildCatalog()
      .then(catalog => {
        prefetchFullPack();
        return catalog;
      })
      .catch(error => {
        catalogPromise = null;
        throw error;
      });
  }
  return catalogPromise;
};

const prefetchFullPack = () => {
  if (!fullPackPromise) {
    fullPackPromise = ensureCatalogPack('full').catch(error => {
      fullPackPromise = null;
      throw error;
    });
  }
};

export const getCategories = async () => (await loadCatalog()).categories;

export const getCategoryDesigns = async categoryName => {
  const catalog = await loadCatalog();
  const designs =
    categoryName === 'All'
      ? catalog.designs
      : catalog.designsByCategory.get(categoryName) || [];
  return shuffle(designs);
};

export const getRandomDesigns = async (count = 10) => {
  const {designsByCategory} = await loadCatalog();
  const queues = [...designsByCategory.values()].map(designs =>
    shuffle(designs),
  );
  const picked = [];

  for (let depth = 0; picked.length < count; depth += 1) {
    const pass = shuffle(queues.filter(queue => queue.length > depth));
    if (pass.length === 0) {
      break;
    }
    for (const queue of pass) {
      if (picked.length >= count) {
        break;
      }
      picked.push(queue[depth]);
    }
  }

  return picked;
};

export const getDesignsByIds = async ids => {
  const {designs} = await loadCatalog();
  const byId = new Map(designs.map(design => [design.designId, design]));
  return ids.map(id => byId.get(id)).filter(Boolean);
};

export const resolveFullImageRefs = async imageRefs => {
  if (!fullPackPromise) {
    fullPackPromise = ensureCatalogPack('full');
  }

  let fullRoot;
  try {
    fullRoot = await fullPackPromise;
  } catch {
    fullPackPromise = null;
    return imageRefs;
  }

  return imageRefs.map(imageRef => ({
    ...imageRef,
    fullUrl: imageRef.fullPath
      ? resolvePackUri(fullRoot, imageRef.fullPath)
      : imageRef.fullUrl,
  }));
};
