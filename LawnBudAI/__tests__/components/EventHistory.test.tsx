/**
 * Tests for the EventHistory component - focused on uncovered branches
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import EventHistory from '@/components/EventHistory';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

jest.mock('@expo/vector-icons/Ionicons', () => 'MockIcon');

const mockEvents = [
  { id: 'evt-1', date: '2026-09-01', detail: 'First Event' },
];

const baseProps = {
  events: mockEvents,
  loading: false,
  error: null,
  renderEventDetail: (event: any) => <Text>{event.detail}</Text>,
  onDelete: jest.fn(),
};

describe('EventHistory', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows loading indicator when loading=true', () => {
    const { toJSON } = render(<EventHistory {...baseProps} events={[]} loading={true} />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows error message when error is provided', () => {
    render(<EventHistory {...baseProps} events={[]} error="Failed to load events" />);
    expect(screen.getByText('Failed to load events')).toBeTruthy();
  });

  it('shows empty state when events array is empty', () => {
    render(<EventHistory {...baseProps} events={[]} emptyStateText="No records yet" />);
    expect(screen.getByText('No records yet')).toBeTruthy();
  });

  it('renders event detail', () => {
    render(<EventHistory {...baseProps} />);
    expect(screen.getByText('First Event')).toBeTruthy();
  });

  it('calls onDelete when delete button is pressed', () => {
    const onDelete = jest.fn();
    render(<EventHistory {...baseProps} onDelete={onDelete} />);
    // The delete button is a TouchableOpacity - press it
    const touchables = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);
    expect(onDelete).toHaveBeenCalledWith('evt-1');
  });
});
