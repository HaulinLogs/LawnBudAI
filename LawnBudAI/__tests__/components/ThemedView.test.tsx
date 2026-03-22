/**
 * Tests for ThemedView component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '@/components/ThemedView';
import { Text } from 'react-native';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

describe('ThemedView', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ThemedView>
        <Text>Child</Text>
      </ThemedView>,
    );
    expect(getByText('Child')).toBeTruthy();
  });

  it('renders with custom lightColor', () => {
    const { toJSON } = render(<ThemedView lightColor="#ffffff" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom darkColor', () => {
    const { toJSON } = render(<ThemedView darkColor="#000000" />);
    expect(toJSON()).toBeTruthy();
  });
});
