// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  {
    ignores: [
      'dist/*',
      '.expo/*',
      'node_modules/*',
      'build/*',
      'coverage/*',
      '.next/*',
      '.git/*',
    ],
  },
  expoConfig,
]);
