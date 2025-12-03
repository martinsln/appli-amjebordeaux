const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
    new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
  ];

// Add support for WASM files
config.resolver.assetExts.push('wasm');

// Create a virtual polyfill for wa-sqlite WASM
const polyfillPath = path.resolve(__dirname, 'node_modules/.cache/virtual/wa-sqlite-polyfill.js');
fs.mkdirSync(path.dirname(polyfillPath), { recursive: true });
fs.writeFileSync(polyfillPath, `
// Polyfill for wa-sqlite WASM file
console.warn('wa-sqlite WASM polyfill loaded - SQLite functionality may be limited on web');
export default null;
`);

// Add custom resolver to handle wa-sqlite WASM files
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle wa-sqlite WASM file resolution for web
  if (platform === 'web' && moduleName.includes('wa-sqlite.wasm')) {
    console.warn('wa-sqlite WASM file requested, using polyfill for web compatibility');
    return {
      filePath: polyfillPath,
      type: 'sourceFile',
    };
  }
  
  // Use the default resolver for all other cases
  return originalResolveRequest ? originalResolveRequest(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
