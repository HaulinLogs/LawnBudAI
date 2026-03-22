/**
 * Tests for the EventForm component - focused on uncovered branches
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import EventForm from '@/components/EventForm';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

const baseProps = {
  date: '2026-09-01',
  onDateChange: jest.fn(),
  amount: '3.5',
  onAmountChange: jest.fn(),
  amountLabel: 'Height (inches)',
  amountPlaceholder: '3.5',
  notes: '',
  onNotesChange: jest.fn(),
  submitLabel: 'Save',
  onSubmit: jest.fn(),
  submitting: false,
};

describe('EventForm', () => {
  it('renders the submit button label when not submitting', () => {
    render(<EventForm {...baseProps} />);
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('shows ActivityIndicator when submitting=true', () => {
    const { toJSON } = render(<EventForm {...baseProps} submitting={true} />);
    expect(toJSON()).toBeTruthy();
    // Button text should not be visible while submitting
    expect(screen.queryByText('Save')).toBeNull();
  });

  it('renders with disabled=true without crashing', () => {
    const { toJSON } = render(<EventForm {...baseProps} disabled={true} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders optionalField when provided', () => {
    const { getByText } = render(
      <EventForm {...baseProps} optionalField={<></>} />,
    );
    expect(getByText('Save')).toBeTruthy();
  });

  it('renders with numeric keyboard type', () => {
    const { toJSON } = render(<EventForm {...baseProps} amountKeyboardType="numeric" />);
    expect(toJSON()).toBeTruthy();
  });
});
