/**
 * Tests for the MowerIcon component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { MowerIcon } from '@/components/MowerIcon';

describe('MowerIcon', () => {
  it('renders with default props', () => {
    const { toJSON } = render(<MowerIcon />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom rotation', () => {
    const { toJSON } = render(<MowerIcon rotation={90} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom dimensions', () => {
    const { toJSON } = render(<MowerIcon width={40} height={60} />);
    expect(toJSON()).toBeTruthy();
  });
});
