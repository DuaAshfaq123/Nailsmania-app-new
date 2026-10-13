import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
import RNFS from 'react-native-fs';

const nativeCatalog = NativeModules.CatalogAssets;

const requireCatalogBridge = () => {
  if (!['android', 'ios'].includes(Platform.OS) || !nativeCatalog) {
    throw new Error(`The local catalog is unavailable on ${Platform.OS}`);
  }
  return nativeCatalog;
};

export const ensureCatalogPack = packName =>
  requireCatalogBridge().ensurePack(packName);

const CATALOG_PACK_PROGRESS_EVENT = 'CatalogPackProgress';

export const subscribeCatalogPackProgress = listener => {
  if (!nativeCatalog) {
    return () => {};
  }
  const emitter = new NativeEventEmitter(nativeCatalog);
  const subscription = emitter.addListener(
    CATALOG_PACK_PROGRESS_EVENT,
    listener,
  );
  return () => subscription.remove();
};


export const confirmMeteredCatalogDownload = () => {
  if (typeof nativeCatalog?.confirmMeteredDownload !== 'function') {
    return Promise.resolve(false);
  }
  return nativeCatalog.confirmMeteredDownload();
};

export const readPackJson = async (packName, relativePath) => {
  const root = await ensureCatalogPack(packName);
  return JSON.parse(await RNFS.readFile(`${root}/${relativePath}`, 'utf8'));
};

export const resolvePackUri = (root, relativePath) =>
  `file://${root}/${relativePath}`;

export const resolveBaseAssetUri = relativePath =>
  requireCatalogBridge().resolveBaseAsset(relativePath);
