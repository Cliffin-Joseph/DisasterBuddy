import { Alert, Linking } from 'react-native';
import logger from './logger';

export async function openHelpLink(url, fallbackMessage = 'Please open the official source in your browser.') {
  try {
    await Linking.openURL(url);
    return true;
  } catch (error) {
    logger.warn('help_link_open_failed', error);
    Alert.alert('Could not open link', fallbackMessage);
    return false;
  }
}

export function confirmHelpContact(resource) {
  const number = resource.phone || resource.sms;
  const isSms = Boolean(resource.sms);
  Alert.alert(
    isSms ? `Message ${number}?` : `Open dialler for ${resource.displayPhone || number}?`,
    `${resource.title}. Singapore only. ${isSms ? 'Your messaging app will open; you must write and send the message yourself.' : 'Confirm the call in your phone app.'}`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: isSms ? 'Open messages' : 'Open dialler', onPress: () => openHelpLink(
        `${isSms ? 'sms' : 'tel'}:${number}`,
        `This device could not open its ${isSms ? 'messaging' : 'phone'} app. Use ${resource.displayPhone || number} manually on a phone in Singapore.`,
      ) },
    ],
  );
}
