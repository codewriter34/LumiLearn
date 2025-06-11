// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable strict "exports" enforcement causing `require` errors in Hermes
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
