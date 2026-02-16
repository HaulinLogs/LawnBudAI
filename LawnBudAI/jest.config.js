module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(expo|expo-router|expo-sqlite|expo-blur|expo-constants|expo-font|expo-haptics|expo-image|expo-linking|expo-splash-screen|expo-status-bar|expo-symbols|expo-system-ui|expo-web-browser|expo-modules-core|expo-asset|react-native|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens|react-native-web|@react-native|@react-navigation|@expo)/)',
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testTimeout: 10000,
  verbose: true,
  bail: false,
  maxWorkers: 2,
};
