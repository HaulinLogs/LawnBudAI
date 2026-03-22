/**
 * Tests for the TodoStatusCard component
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { TodoStatusCard } from '@/components/TodoStatusCard';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

const mockTodo = {
  name: 'Mowing',
  text: 'Mow your lawn this week',
  frequency: 'weekly' as const,
};

describe('TodoStatusCard', () => {
  it('renders title', () => {
    render(<TodoStatusCard title="Lawn Tasks" todo={mockTodo} />);
    expect(screen.getByText('Lawn Tasks')).toBeTruthy();
  });

  it('renders todo name when todo is provided', () => {
    render(<TodoStatusCard title="Task" todo={mockTodo} />);
    expect(screen.getByText('Mowing')).toBeTruthy();
  });

  it('shows "Loading..." when todo is null', () => {
    render(<TodoStatusCard title="Task" todo={null} />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('renders todo text', () => {
    render(<TodoStatusCard title="Task" todo={mockTodo} />);
    expect(screen.getByText('Mow your lawn this week')).toBeTruthy();
  });
});
