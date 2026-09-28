import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AlertDetailScreen from '../src/screens/alerts/AlertDetailScreen';
import LocalHelpScreen from '../src/screens/resourceLibrary/LocalHelpScreen';
import { confirmHelpContact, openHelpLink } from '../src/services/helpLinks';

jest.mock('../src/services/helpLinks', () => ({ confirmHelpContact: jest.fn(), openHelpLink: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

beforeEach(() => jest.clearAllMocks());

test('event screen shows provenance and opens related learning and local help', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  const screen = render(<AlertDetailScreen navigation={navigation} route={{ params: {
    event: { id: 'FL-1', title: 'Example flood', type: 'Flood', typeCode: 'FL', country: 'Example country', alertLevel: 'Orange', distanceKm: 200, reportUrl: 'https://www.gdacs.org/report.aspx?id=1' },
    updatedAt: '2026-09-28T10:00:00Z',
  } }} />);
  expect(screen.getByText('Example flood')).toBeTruthy();
  expect(screen.getByText(/Reported location: Example country/)).toBeTruthy();
  expect(screen.getByText(/This is not an evacuation instruction/)).toBeTruthy();
  fireEvent.press(screen.getByText('Flood preparedness'));
  expect(navigation.navigate).toHaveBeenCalledWith('LearnTab', { screen: 'ResourceCategory', params: { categoryId: 'flood' }, initial: false });
  fireEvent.press(screen.getByText('Local help in Singapore'));
  expect(navigation.navigate).toHaveBeenCalledWith('LocalHelp');
  fireEvent.press(screen.getByText('Open official GDACS report'));
  expect(openHelpLink).toHaveBeenCalledWith('https://www.gdacs.org/report.aspx?id=1');
});
test('missing event has a usable recovery action', () => {
  const navigation = { goBack: jest.fn() };
  const screen = render(<AlertDetailScreen navigation={navigation} route={{}} />);
  expect(screen.getByText('Event unavailable')).toBeTruthy();
  fireEvent.press(screen.getByText('Back to alerts'));
  expect(navigation.goBack).toHaveBeenCalled();
});
test('local help puts emergency contacts first and routes calls through confirmation', () => {
  const screen = render(<LocalHelpScreen navigation={{ goBack: jest.fn() }} />);
  expect(screen.getByText('Find the right help, quickly')).toBeTruthy();
  expect(screen.getByText('In immediate danger?')).toBeTruthy();
  expect(screen.queryByText('Community support and directories')).toBeNull();
  expect(screen.getByText(/Contacts were last reviewed/)).toBeTruthy();
  fireEvent.press(screen.getByText('Call 995'));
  expect(confirmHelpContact).toHaveBeenCalledWith(expect.objectContaining({ id: 'scdf', phone: '995' }));
  fireEvent.press(screen.getByText('SMS 70999'));
  expect(confirmHelpContact).toHaveBeenCalledWith(expect.objectContaining({ id: 'police-sms', sms: '70999' }));
  expect(screen.getByRole('button', { name: 'Call 995' }).props.accessibilityHint).toMatch(/Confirm the call/);
});
