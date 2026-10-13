import BootSplash from 'react-native-bootsplash';
import {debugError} from './debugLog';

let hideStarted = false;

export const hideBootSplash = async ({fade = true} = {}) => {
  if (hideStarted) {
    return;
  }
  hideStarted = true;
  try {
    await BootSplash.hide({fade});
  } catch (error) {
    debugError('BootSplash', 'Failed to hide native splash', error);
  }
};
