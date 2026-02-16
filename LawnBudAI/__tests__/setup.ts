/**
 * Jest setup file
 * Runs before all tests to configure the test environment
 */

// Built-in Jest matchers are included in @testing-library/react-native v12.4+
// No additional imports needed

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiSet: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock fetch for tests that use it
global.fetch = jest.fn();

// Suppress console errors/logs in tests unless explicitly needed
const originalError = console.error;
const originalLog = console.log;

beforeAll(() => {
  console.error = jest.fn((...args) => {
    // Only suppress specific expected warnings
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('Non-serializable'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  });

  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.log = originalLog;
});
