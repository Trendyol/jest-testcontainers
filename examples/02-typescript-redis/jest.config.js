const ts_preset = require('ts-jest/jest-preset');
// you should require "@trendyol/jest-testcontainers" in your own project
const testcontainers_preset = require('../../jest-preset.js');

module.exports = {
  ...ts_preset,
  ...testcontainers_preset,
};
