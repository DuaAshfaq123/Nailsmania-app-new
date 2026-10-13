import {Linking, PermissionsAndroid, Platform} from 'react-native';

const LEGACY_WRITE_PERMISSION =
  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

const getGalleryPermissions = () =>
  require('@react-native-camera-roll/camera-roll');

const requestLegacyWritePermission = async () => {
  const alreadyGranted = await PermissionsAndroid.check(
    LEGACY_WRITE_PERMISSION,
  );
  if (alreadyGranted) {
    return true;
  }

  const result = await PermissionsAndroid.request(LEGACY_WRITE_PERMISSION);
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

// Gallery saves on API 29+ use MediaStore and need no runtime storage permission.
// API 28 and below write to public Pictures via legacy storage and need WRITE_EXTERNAL_STORAGE.
// iOS asks for Photos access as part of the save itself (see requestGalleryAlbumAccess).
export const requestDownloadPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version >= 29) {
    return true;
  }

  return requestLegacyWritePermission();
};

/**
 * iOS only: whether we may file the saved photo under the app's own album.
 *
 * Putting an asset in a named album is a read-write operation on the library. Add-only
 * access — the level a bare save would prompt for — cannot enumerate albums, so the
 * existing "Mehandi724" album would be invisible and a fresh duplicate created on every
 * download. Asking for full access once keeps a single album, and a refusal is not fatal:
 * the caller still saves the photo, it just lands in Recents like any other save.
 */
export const requestGalleryAlbumAccess = async () => {
  if (Platform.OS !== 'ios') {
    return true;
  }

  const {iosReadGalleryPermission, iosRequestReadWriteGalleryPermission} =
    getGalleryPermissions();

  const status = await iosReadGalleryPermission('readWrite');
  if (status === 'not-determined') {
    return (await iosRequestReadWriteGalleryPermission()) === 'granted';
  }

  return status === 'granted';
};

const IOS_PHOTO_PERMISSION_CODES = new Set([
  'E_PHOTO_LIBRARY_AUTH_DENIED',
  'E_PHOTO_LIBRARY_AUTH_RESTRICTED',
]);

export const isDownloadPermissionError = error => {
  if (error instanceof Error && error.message === 'Storage permission denied') {
    return true;
  }

  return IOS_PHOTO_PERMISSION_CODES.has(error?.code);
};

export const openAppSettings = () => Linking.openSettings();
