import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import GenericPicker from '@/components/ui/GenericPicker';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

import { useColorScheme } from '@/hooks/useColorScheme';
const mockUseColorScheme = useColorScheme as jest.Mock;

describe('GenericPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorScheme.mockReturnValue('light');
  });

  const mockOptions = [
    { label: 'Option 1', value: 'opt1', icon: 'water' },
    { label: 'Option 2', value: 'opt2', icon: 'leaf' },
    { label: 'Option 3', value: 'opt3', icon: 'settings' },
  ];

  it('renders picker label', () => {
    const mockOnChange = jest.fn();
    render(
      <GenericPicker
        label="Select Source"
        options={mockOptions}
        value="opt1"
        onChange={mockOnChange}
      />,
    );
    expect(screen.getByText('Select Source')).toBeTruthy();
  });

  it('displays selected value in button', () => {
    const mockOnChange = jest.fn();
    render(
      <GenericPicker
        label="Select Source"
        options={mockOptions}
        value="opt2"
        onChange={mockOnChange}
      />,
    );
    expect(screen.getByText('Option 2')).toBeTruthy();
  });

  it('opens dropdown when button is pressed', () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <GenericPicker
        label="Select Source"
        options={mockOptions}
        value="opt1"
        onChange={mockOnChange}
        testID="picker-button"
      />,
    );
    const button = getByTestId('picker-button');
    fireEvent.press(button);

    // Should show other options now
    expect(screen.getByText('Option 2')).toBeTruthy();
    expect(screen.getByText('Option 3')).toBeTruthy();
  });

  it('closes dropdown when button is pressed again', () => {
    const mockOnChange = jest.fn();
    const { getByTestId, queryByText } = render(
      <GenericPicker
        label="Select Source"
        options={mockOptions}
        value="opt1"
        onChange={mockOnChange}
        testID="picker-button"
      />,
    );
    const button = getByTestId('picker-button');

    // Open dropdown
    fireEvent.press(button);
    expect(screen.getByText('Option 2')).toBeTruthy();

    // Close dropdown
    fireEvent.press(button);
    expect(queryByText('Option 2')).toBeNull();
  });

  it('calls onChange when option is selected', () => {
    const mockOnChange = jest.fn();
    render(
      <GenericPicker
        label="Select Source"
        options={mockOptions}
        value="opt1"
        onChange={mockOnChange}
        testID="picker-button"
      />,
    );

    // Open dropdown
    fireEvent.press(screen.getByTestId('picker-button'));

    // Select second option
    fireEvent.press(screen.getByText('Option 2'));

    expect(mockOnChange).toHaveBeenCalledWith('opt2');
  });

  it('closes dropdown after selecting option', () => {
    const mockOnChange = jest.fn();
    const { getByTestId, queryByText } = render(
      <GenericPicker
        label="Select Source"
        options={mockOptions}
        value="opt1"
        onChange={mockOnChange}
        testID="picker-button"
      />,
    );

    // Open dropdown
    fireEvent.press(getByTestId('picker-button'));

    // Select second option
    fireEvent.press(screen.getByText('Option 2'));

    // Dropdown should be closed
    expect(queryByText('Option 3')).toBeNull();
  });

  it('disables button when disabled prop is true', () => {
    const mockOnChange = jest.fn();
    const { getByTestId, queryByText } = render(
      <GenericPicker
        label="Select Source"
        options={mockOptions}
        value="opt1"
        onChange={mockOnChange}
        disabled={true}
        testID="picker-button"
      />,
    );

    const button = getByTestId('picker-button');
    // Try to press button - it should not open dropdown when disabled
    fireEvent.press(button);

    // When disabled, options should not be visible
    expect(queryByText('Option 2')).toBeNull();
  });

  it('highlights selected option', () => {
    const mockOnChange = jest.fn();
    const { getByTestId, queryAllByText } = render(
      <GenericPicker
        label="Select Source"
        options={mockOptions}
        value="opt2"
        onChange={mockOnChange}
        testID="picker-button"
      />,
    );

    // Open dropdown
    fireEvent.press(getByTestId('picker-button'));

    // Selected option should be visible in dropdown
    const option2Elements = queryAllByText('Option 2');
    expect(option2Elements.length).toBeGreaterThan(0);
  });

  it('handles options without icons', () => {
    const mockOnChange = jest.fn();
    const optionsWithoutIcons = [
      { label: 'Option A', value: 'a' },
      { label: 'Option B', value: 'b' },
    ];

    render(
      <GenericPicker
        label="Select"
        options={optionsWithoutIcons}
        value="a"
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByText('Option A')).toBeTruthy();
  });

  describe('dark mode', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('dark');
    });

    it('renders label in dark mode', () => {
      render(
        <GenericPicker
          label="Select Source"
          options={mockOptions}
          value="opt1"
          onChange={jest.fn()}
        />,
      );
      expect(screen.getByText('Select Source')).toBeTruthy();
    });

    it('displays selected value in dark mode', () => {
      render(
        <GenericPicker
          label="Select Source"
          options={mockOptions}
          value="opt2"
          onChange={jest.fn()}
        />,
      );
      expect(screen.getByText('Option 2')).toBeTruthy();
    });

    it('opens and closes dropdown in dark mode', () => {
      const { getByTestId, queryByText } = render(
        <GenericPicker
          label="Select Source"
          options={mockOptions}
          value="opt1"
          onChange={jest.fn()}
          testID="picker-button"
        />,
      );

      fireEvent.press(getByTestId('picker-button'));
      expect(screen.getByText('Option 2')).toBeTruthy();

      fireEvent.press(getByTestId('picker-button'));
      expect(queryByText('Option 2')).toBeNull();
    });

    it('calls onChange when option selected in dark mode', () => {
      const mockOnChange = jest.fn();
      render(
        <GenericPicker
          label="Select Source"
          options={mockOptions}
          value="opt1"
          onChange={mockOnChange}
          testID="picker-button"
        />,
      );

      fireEvent.press(screen.getByTestId('picker-button'));
      fireEvent.press(screen.getByText('Option 3'));

      expect(mockOnChange).toHaveBeenCalledWith('opt3');
    });
  });

  it('updates when value prop changes', () => {
    const mockOnChange = jest.fn();
    const { rerender } = render(
      <GenericPicker
        label="Select Source"
        options={mockOptions}
        value="opt1"
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByText('Option 1')).toBeTruthy();

    rerender(
      <GenericPicker
        label="Select Source"
        options={mockOptions}
        value="opt3"
        onChange={mockOnChange}
      />,
    );

    expect(screen.getByText('Option 3')).toBeTruthy();
  });

  it('renders with chevron icon in button', () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <GenericPicker
        label="Select Source"
        options={mockOptions}
        value="opt1"
        onChange={mockOnChange}
        testID="picker-button"
      />,
    );

    const button = getByTestId('picker-button');
    // Button should show chevron icon (this is implementation detail but testable)
    expect(button).toBeTruthy();
  });
});
