import {
  getCategoryDesigns,
  getRandomDesigns,
  resolveFullImageRefs,
} from './catalogService';

export const fetchCategoryImages = categoryName =>
  getCategoryDesigns(categoryName);

export const fetchAllCategoryImages = () => getCategoryDesigns('All');

export const subscribeToCategoryImages = () => () => {};

export const paginateImages = (
  images,
  page,
  batchSize,
  initialBatchSize = batchSize,
) => {
  const firstPageSize = Math.max(1, initialBatchSize);
  const totalVisible =
    page <= 1 ? firstPageSize : firstPageSize + (page - 1) * batchSize;
  const sliced = images.slice(0, totalVisible);
  return {images: sliced, isComplete: sliced.length >= images.length};
};

export const fetchRandomCategoryImages = async (count = 10) =>
  (await getRandomDesigns(count)).map(imageRef => ({
    id: imageRef.designId,
    imageRef,
    imageUrl: imageRef.fullUrl,
    categoryName: imageRef.categoryId,
  }));

export {resolveFullImageRefs};
