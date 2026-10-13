import RNFS from 'react-native-fs';
import {debugError} from '../../utils/debugLog';
import {
  getLocalFavorites,
  setLocalFavorites,
} from '../favorites/favoritesService';

const ROOT = `${RNFS.DocumentDirectoryPath}/custom-designs`;
const MANIFEST_PATH = `${ROOT}/manifest.json`;
const listeners = new Set();

let recordsPromise;

const extensionFor = asset => {
  const filenameExtension = asset?.fileName?.split('.').pop()?.toLowerCase();
  if (/^(jpe?g|png|webp|heic|heif)$/.test(filenameExtension || '')) {
    return filenameExtension === 'jpeg' ? 'jpg' : filenameExtension;
  }
  const mimeExtension = asset?.type?.split('/').pop()?.toLowerCase();
  if (/^(jpe?g|png|webp|heic|heif)$/.test(mimeExtension || '')) {
    return mimeExtension === 'jpeg' ? 'jpg' : mimeExtension;
  }
  return 'jpg';
};

const sourcePathFor = uri =>
  uri?.startsWith('file://') ? uri.slice('file://'.length) : uri;

const withImageRef = record => {
  const uri = `file://${ROOT}/${record.filename}`;
  return {
    ...record,
    imageRef: {
      designId: record.id,
      fullUrl: uri,
      thumbnailUrl: uri,
      categoryName: record.category,
    },
  };
};

const ensureRoot = async () => {
  await RNFS.mkdir(ROOT);
};

const readRecords = async () => {
  await ensureRoot();
  if (!(await RNFS.exists(MANIFEST_PATH))) {
    return [];
  }
  const parsed = JSON.parse(await RNFS.readFile(MANIFEST_PATH, 'utf8'));
  return Array.isArray(parsed) ? parsed : [];
};

const getRecords = () => {
  if (!recordsPromise) {
    recordsPromise = readRecords().catch(error => {
      recordsPromise = null;
      debugError('CustomDesigns', 'Failed to read local designs', error);
      throw error;
    });
  }
  return recordsPromise;
};

const writeRecords = async records => {
  await ensureRoot();
  await RNFS.writeFile(MANIFEST_PATH, JSON.stringify(records), 'utf8');
  recordsPromise = Promise.resolve(records);
  const hydrated = records.map(withImageRef);
  listeners.forEach(listener => listener(hydrated));
  return hydrated;
};

export const getCustomDesigns = async () =>
  (await getRecords()).map(withImageRef);

export const addCustomDesign = async ({asset, category}) => {
  if (!asset?.uri || !category) {
    throw new Error('An image and category are required');
  }
  const current = await getRecords();
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const filename = `${id}.${extensionFor(asset)}`;
  const destination = `${ROOT}/${filename}`;
  await ensureRoot();
  await RNFS.copyFile(sourcePathFor(asset.uri), destination);
  const record = {
    id,
    filename,
    category,
    width: asset.width || null,
    height: asset.height || null,
    createdAtMs: Date.now(),
  };
  try {
    await writeRecords([record, ...current]);
    return withImageRef(record);
  } catch (error) {
    await RNFS.unlink(destination).catch(() => {});
    throw error;
  }
};

export const deleteCustomDesign = async id => {
  const current = await getRecords();
  const record = current.find(item => item.id === id);
  if (!record) {
    return;
  }
  await writeRecords(current.filter(item => item.id !== id));
  try {
    const favorites = await getLocalFavorites();
    if (favorites.some(favorite => favorite.key === id)) {
      await setLocalFavorites(
        favorites.filter(favorite => favorite.key !== id),
      );
    }
  } catch (error) {
    debugError('CustomDesigns', 'Failed to remove deleted favorite', error);
  }
  await RNFS.unlink(`${ROOT}/${record.filename}`).catch(error => {
    debugError('CustomDesigns', 'Failed to remove local image file', error);
  });
};

export const subscribeCustomDesigns = listener => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
