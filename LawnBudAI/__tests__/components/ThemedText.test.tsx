/**
 * Tests for ThemedText component
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ThemedText } from '@/components/ThemedText';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

describe('ThemedText', () => {
  it('renders children text', () => {
    render(<ThemedText>Hello World</ThemedText>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('renders with type="title"', () => {
    render(<ThemedText type="title">Title</ThemedText>);
    expect(screen.getByText('Title')).toBeTruthy();
  });

  it('renders with type="defaultSemiBold"', () => {
    render(<ThemedText type="defaultSemiBold">Bold</ThemedText>);
    expect(screen.getByText('Bold')).toBeTruthy();
  });

  it('renders with type="subtitle"', () => {
    render(<ThemedText type="subtitle">Subtitle</ThemedText>);
    expect(screen.getByText('Subtitle')).toBeTruthy();
  });

  it('renders with type="link"', () => {
    render(<ThemedText type="link">Link</ThemedText>);
    expect(screen.getByText('Link')).toBeTruthy();
  });

  it('renders with custom lightColor', () => {
    render(<ThemedText lightColor="#ff0000">Colored</ThemedText>);
    expect(screen.getByText('Colored')).toBeTruthy();
  });
});
