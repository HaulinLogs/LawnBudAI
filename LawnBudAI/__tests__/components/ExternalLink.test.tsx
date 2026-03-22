/**
 * Tests for the ExternalLink component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ExternalLink } from '@/components/ExternalLink';

jest.mock('expo-router', () => ({
  Link: ({ onPress, href, ...rest }: any) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity testID="external-link" onPress={(e: any) => onPress && onPress(e)} {...rest}>
        <Text>{href}</Text>
      </TouchableOpacity>
    );
  },
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(() => Promise.resolve()),
}));

describe('ExternalLink', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require('expo-web-browser').openBrowserAsync as jest.Mock).mockClear();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(
      <ExternalLink href="https://example.com">Link</ExternalLink>,
    );
    expect(getByTestId('external-link')).toBeTruthy();
  });

  it('opens browser on press when Platform.OS is not web', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { openBrowserAsync } = require('expo-web-browser');
    const originalOS = Platform.OS;
    // @ts-ignore
    Platform.OS = 'ios';

    const { getByTestId } = render(
      <ExternalLink href="https://example.com/advice">Link</ExternalLink>,
    );
    const mockEvent = { preventDefault: jest.fn() };
    await fireEvent.press(getByTestId('external-link'), mockEvent);
    expect(openBrowserAsync).toHaveBeenCalledWith('https://example.com/advice');

    // @ts-ignore
    Platform.OS = originalOS;
  });

  it('does not open browser when Platform.OS is web', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { openBrowserAsync } = require('expo-web-browser');
    const originalOS = Platform.OS;
    // @ts-ignore
    Platform.OS = 'web';

    const { getByTestId } = render(
      <ExternalLink href="https://example.com/advice">Link</ExternalLink>,
    );
    const mockEvent = { preventDefault: jest.fn() };
    await fireEvent.press(getByTestId('external-link'), mockEvent);
    expect(openBrowserAsync).not.toHaveBeenCalled();

    // @ts-ignore
    Platform.OS = originalOS;
  });
});
