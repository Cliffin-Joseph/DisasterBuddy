import { Alert, Linking } from 'react-native';
import { confirmHelpContact, openHelpLink } from '../src/services/helpLinks';
import logger from '../src/services/logger';

jest.mock('../src/services/logger', () => ({ warn: jest.fn() }));

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(Linking, 'openURL').mockResolvedValue();
});
afterEach(() => jest.restoreAllMocks());

test('contact requires confirmation and never calls during the test', async () => {
  confirmHelpContact({ title: 'Police', phone: '999' });
  expect(Linking.openURL).not.toHaveBeenCalled();
  const buttons = Alert.alert.mock.calls[0][2];
  expect(buttons[0].style).toBe('cancel');
  await buttons[1].onPress();
  expect(Linking.openURL).toHaveBeenCalledWith('tel:999');
});
test('SMS opens the composer without sending a message', async () => {
  confirmHelpContact({ title: 'Police SMS', sms: '70999' });
  await Alert.alert.mock.calls[0][2][1].onPress();
  expect(Linking.openURL).toHaveBeenCalledWith('sms:70999');
});
test('failed links give actionable feedback and a diagnostic log', async () => {
  Linking.openURL.mockRejectedValue(new Error('No handler'));
  expect(await openHelpLink('tel:995', 'Use 995 manually.')).toBe(false);
  expect(Alert.alert).toHaveBeenCalledWith('Could not open link', 'Use 995 manually.');
  expect(logger.warn).toHaveBeenCalledWith('help_link_open_failed', expect.any(Error));
});
