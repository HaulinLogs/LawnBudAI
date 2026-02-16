/**
 * Jest setup file
 * Runs before all tests to configure the test environment
 */

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
