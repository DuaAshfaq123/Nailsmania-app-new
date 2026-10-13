import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {debugError} from '../../utils/debugLog';

const getShare = () => require('react-native-share').default;

const SUPPORTED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

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

const getMimeType = extension => {
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
};

const downloadToCache = async imageUrl => {
  const extension = getExtension(imageUrl);
  const filePath = `${RNFS.CachesDirectoryPath}/share_${Date.now()}.${extension}`;

  const result = await RNFS.downloadFile({
    fromUrl: imageUrl,
    toFile: filePath,
  }).promise;

  if (result.statusCode !== 200) {
    throw new Error(`Download failed with status ${result.statusCode}`);
  }

  return {filePath, extension};
};

export const shareImageFile = async (filePath, extension = 'jpg') => {
  const normalizedUri = toFileUri(filePath);

  await getShare().open({
    url: normalizedUri,
    type: getMimeType(extension),
    failOnCancel: false,
    ...(Platform.OS === 'android' ? {title: 'Share image'} : {}),
  });
};

export const prepareAndShareImage = async imageUrl => {
  try {
    const extension = getExtension(imageUrl);
    const filePath = imageUrl.startsWith('file://')
      ? imageUrl.slice('file://'.length)
      : (await downloadToCache(imageUrl)).filePath;
    await shareImageFile(filePath, extension);
  } catch (error) {
    debugError('Share', 'Failed to share image', error);
    throw error;
  }
};
