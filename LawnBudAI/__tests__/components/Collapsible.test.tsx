/**
 * Tests for the Collapsible component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Collapsible } from '@/components/Collapsible';

const mockUseColorScheme = jest.fn(() => 'light');

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

describe('Collapsible', () => {
  it('renders the title', () => {
    render(
      <Collapsible title="Section Title">
        <Text>Content</Text>
      </Collapsible>,
    );
    expect(screen.getByText('Section Title')).toBeTruthy();
  });

  it('hides children by default', () => {
    render(
      <Collapsible title="Section">
        <Text testID="hidden-content">Hidden</Text>
      </Collapsible>,
    );
    expect(screen.queryByTestId('hidden-content')).toBeNull();
  });

  it('shows children after pressing the header', () => {
    render(
      <Collapsible title="Section">
        <Text testID="shown-content">Visible</Text>
      </Collapsible>,
    );
    fireEvent.press(screen.getByText('Section'));
    expect(screen.getByTestId('shown-content')).toBeTruthy();
  });

  it('hides children again after pressing twice', () => {
    render(
      <Collapsible title="Toggle">
        <Text testID="toggle-content">Content</Text>
      </Collapsible>,
    );
    fireEvent.press(screen.getByText('Toggle'));
    expect(screen.getByTestId('toggle-content')).toBeTruthy();
    fireEvent.press(screen.getByText('Toggle'));
    expect(screen.queryByTestId('toggle-content')).toBeNull();
  });

  it('renders with dark theme', () => {
    mockUseColorScheme.mockReturnValueOnce('dark');
    render(
      <Collapsible title="Dark Section">
        <Text>Dark content</Text>
      </Collapsible>,
    );
    expect(screen.getByText('Dark Section')).toBeTruthy();
  });
});
