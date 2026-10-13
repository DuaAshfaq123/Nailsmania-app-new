/**
 * @format
 */

import {AppRegistry, I18nManager} from 'react-native';
import notifee from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';
import {handleDownloadNotificationEvent} from './src/services/notifications/downloadNotificationService';

notifee.onBackgroundEvent(handleDownloadNotificationEvent);

/*
 * Layout direction is driven exclusively by the language the user picked in Settings, and
 * never by the device locale — see LanguageContext, which owns the forceRTL call.
 *
 * allowRTL(false) is what enforces "never by the device locale": I18nUtil resolves
 * isRTL as `forced || (allowed && devicePreferredLanguageIsRTL)`, so leaving allowRTL at
 * its default of true would flip an English-language app to RTL on an Arabic phone.
 *
 * forceRTL is deliberately NOT reset here. It is persisted natively in SharedPreferences
 * and is the only record of the direction across a restart; calling forceRTL(false) on
 * boot — as this file used to — wiped that record on every launch, which is why the app
 * could never actually enter RTL.
 */
I18nManager.allowRTL(false);

AppRegistry.registerComponent(appName, () => App);
