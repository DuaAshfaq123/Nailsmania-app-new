import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import {debugLog, debugWarn} from './debugLog';

const OPTIONS = {
  mediaType: 'photo',
  selectionLimit: 1,
  maxWidth: 1600,
  maxHeight: 2000,
  quality: 0.88,
  includeBase64: false,
  saveToPhotos: false,
};

const parseResponse = response => {
  if (response.didCancel) {
    debugLog('ImagePicker', 'User cancelled image selection');
    return null;
  }
  if (response.errorCode) {
    debugWarn(
      'ImagePicker',
      `Image selection failed: ${response.errorCode}`,
      response.errorMessage,
    );
    throw new Error(response.errorMessage || 'Failed to select image');
  }
  const asset = response.assets?.[0];
  return asset?.uri
    ? {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName || null,
        type: asset.type || null,
      }
    : null;
};

export const pickImageFromGallery = async () =>
  parseResponse(await launchImageLibrary(OPTIONS));

export const takeImageWithCamera = async () =>
  parseResponse(await launchCamera(OPTIONS));
