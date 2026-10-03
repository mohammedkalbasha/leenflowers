import fs from 'node:fs';
import path from 'node:path';

console.log('Compiling standalone bundles for Leen Flowers (Zero CORS / Full Native Compatibility)...');

// Read modules
const storeConfigCode = fs.readFileSync('js/store-config.js', 'utf8')
  .replace(/export const StoreConfig/g, 'const StoreConfig');

const productsDataCode = fs.readFileSync('js/products-data.js', 'utf8')
  .replace(/export const initialCategories/g, 'const initialCategories')
  .replace(/export const initialProducts/g, 'const initialProducts')
  .replace(/export function getProducts/g, 'function getProducts')
  .replace(/export function getProductById/g, 'function getProductById')
  .replace(/export function saveProducts/g, 'function saveProducts')
  .replace(/export function resetDefaultProducts/g, 'function resetDefaultProducts');

const socialFeedDataCode = fs.readFileSync('js/social-feed-data.js', 'utf8')
  .replace(/export const instagramPosts/g, 'const instagramPosts')
  .replace(/export const facebookPosts/g, 'const facebookPosts');

const cartCode = fs.readFileSync('js/cart.js', 'utf8')
  .replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '')
  .replace(/export const CartManager/g, 'const CartManager');

const threeSceneCode = fs.readFileSync('js/three-scene.js', 'utf8')
  .replace(/export function initThreeFlowerScene/g, 'function initThreeFlowerScene');

const appCode = fs.readFileSync('js/app.js', 'utf8')
  .replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '');

const dashboardCode = fs.readFileSync('js/dashboard.js', 'utf8')
  .replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '');

// Store bundle
const storefrontBundle = `
/**
 * Standalone Storefront Bundle for Leen Flowers (متجر لين للزهور)
 * Self-contained: works on file://, http://, and all production servers without CORS.
 */
(function() {
  'use strict';

  ${storeConfigCode}

  ${productsDataCode}

  ${socialFeedDataCode}

  ${cartCode}

  ${threeSceneCode}

  ${appCode}

})();
`;

// Dashboard bundle
const dashboardBundle = `
/**
 * Standalone Dashboard Bundle for Leen Flowers (متجر لين للزهور)
 * Self-contained: works on file://, http://, and all production servers without CORS.
 */
(function() {
  'use strict';

  ${storeConfigCode}

  ${productsDataCode}

  ${dashboardCode}

})();
`;

fs.writeFileSync('js/bundle.js', storefrontBundle);
fs.writeFileSync('js/dashboard-bundle.js', dashboardBundle);

console.log('✅ Generated js/bundle.js (' + (storefrontBundle.length / 1024).toFixed(1) + ' KB)');
console.log('✅ Generated js/dashboard-bundle.js (' + (dashboardBundle.length / 1024).toFixed(1) + ' KB)');
