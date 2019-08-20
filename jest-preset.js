const { resolve } = require("path");

module.exports = {
  globalSetup: resolve(__dirname, "./dist/setup.js"),
  globalTeardown: resolve(__dirname, "./dist/teardown.js"),
  testEnvironment: resolve(__dirname, "./dist/environment.js")
};
