import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {
  requestDownloadPermission,
  requestGalleryAlbumAccess,
} from '../../utils/permissions';

const getCameraRoll = () =>
  require('@react-native-camera-roll/camera-roll').CameraRoll;

const GALLERY_ALBUM = 'Nails724';

const SUPPORTED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);


const IOS_COPY_DIR = `${RNFS.CachesDirectoryPath}/downloads`;
const IOS_COPY_LIMIT = 20;

const getExtension = imageUrl => {
  const path = imageUrl.split('?')[0];
  const ext = path.split('.').pop()?.toLowerCase();

  if (ext && SUPPORTED_EXTENSIONS.has(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext;
  }

  return 'jpg';
};

const toFileUri = filePath =>
  filePath.startsWith('file://') ? filePath : `file://${filePath}`;
const stripFileScheme = value =>
  value.startsWith('file://') ? value.slice('file://'.length) : value;

const downloadToFile = async (imageUrl, filePath, onProgress) => {
  const result = RNFS.downloadFile({
    fromUrl: imageUrl,
    toFile: filePath,
    progress: res => {
      if (onProgress && res.contentLength > 0) {
        const percent = (res.bytesWritten / res.contentLength) * 100;
        onProgress(Math.floor(percent));
      }
    },
  });

  const response = await result.promise;

  if (response.statusCode !== 200) {
    throw new Error(`Download failed with status ${response.statusCode}`);
  }

  return filePath;
};

const materializeSource = async (imageUrl, filePath, onProgress) => {
  if (imageUrl.startsWith('file://')) {
    await RNFS.copyFile(stripFileScheme(imageUrl), filePath);
    onProgress?.(100);
    return;
  }

  await downloadToFile(imageUrl, filePath, onProgress);
};

// API 29+: CameraRoll inserts via MediaStore (RELATIVE_PATH + IS_PENDING).
// API 28: CameraRoll writes to public Pictures/<album> and runs MediaScannerConnection.
// iOS: PHPhotoLibrary creates the asset and adds it to the album when allowed.
const saveToGallery = async (filePath, album) => {
  const savedAsset = await getCameraRoll().saveAsset(toFileUri(filePath), {
    type: 'photo',
    ...(album ? {album} : {}),
  });

  return savedAsset.node.image.uri;
};

const pruneIOSCopies = async () => {
  try {
    const entries = await RNFS.readDir(IOS_COPY_DIR);
    const stale = entries
      .sort((a, b) => (b.mtime?.getTime() ?? 0) - (a.mtime?.getTime() ?? 0))
      .slice(IOS_COPY_LIMIT);

    await Promise.all(
      stale.map(entry => RNFS.unlink(entry.path).catch(() => {})),
    );
  } catch {
    // Housekeeping only — never let it fail a download that already succeeded.
  }
};

const downloadToGalleryAndroid = async (imageUrl, onProgress) => {
  const extension = getExtension(imageUrl);
  const tempPath = `${
    RNFS.CachesDirectoryPath
  }/nails_${Date.now()}.${extension}`;

  await materializeSource(imageUrl, tempPath, onProgress);

  try {
    return {
      mediaUri: await saveToGallery(tempPath, GALLERY_ALBUM),
      localPath: null,
      savedToGallery: true,
    };
  } finally {
    await RNFS.unlink(tempPath).catch(() => {});
  }
};

const downloadToGalleryIOS = async (imageUrl, onProgress) => {
  const extension = getExtension(imageUrl);
  await RNFS.mkdir(IOS_COPY_DIR);
  const localPath = `${IOS_COPY_DIR}/nails_${Date.now()}.${extension}`;

  await materializeSource(imageUrl, localPath, onProgress);

  try {
    const album = (await requestGalleryAlbumAccess()) ? GALLERY_ALBUM : null;
    const mediaUri = await saveToGallery(localPath, album);
    await pruneIOSCopies();

    return {mediaUri, localPath, savedToGallery: true};
  } catch (error) {
    await RNFS.unlink(localPath).catch(() => {});
    throw error;
  }
};

/**
 * Saves a design to the device photo gallery.
 *
 * Android files it under Pictures/Nails724 via MediaStore; iOS adds it to a Photos
 * album of the same name. Resolves to the saved asset's uri plus, on iOS, the local
 * copy the download notification opens.
 */
export const downloadImage = async (imageUrl, onProgress) => {
  if (!imageUrl?.trim()) {
    throw new Error('Invalid image URL');
  }

  const hasPermission = await requestDownloadPermission();
  if (!hasPermission) {
    throw new Error('Storage permission denied');
  }

  return Platform.OS === 'ios'
    ? downloadToGalleryIOS(imageUrl, onProgress)
    : downloadToGalleryAndroid(imageUrl, onProgress);
};
