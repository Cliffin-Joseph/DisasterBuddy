import React from 'react';
import { render } from '@testing-library/react-native';
import { AppButton, ProgressBar } from '../src/components/UIComponents';

test('shared buttons expose their purpose, hint and disabled state', () => {
  const screen = render(
    <AppButton label="Call 995" accessibilityHint="Opens the phone app" disabled onPress={() => {}} />,
  );
  const button = screen.getByRole('button', { name: 'Call 995' });

  expect(button.props.accessibilityHint).toBe('Opens the phone app');
  expect(button.props.accessibilityState.disabled).toBe(true);
});

test('progress is available as a number to screen readers', () => {
  const screen = render(<ProgressBar value={42.7} />);
  const progress = screen.getByRole('progressbar');

  expect(progress.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 43 });
});
