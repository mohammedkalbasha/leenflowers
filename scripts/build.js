import fs from 'node:fs';

console.log('Compiling standalone bundles for Leen Flowers (Zero CORS / Full Native Compatibility)...');

function cleanModule(code) {
  return code
    .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
    .replace(/export\s*\{[\s\S]*?\};?/g, '');
}

// Read modules
const storeConfigCode = cleanModule(fs.readFileSync('js/store-config.js', 'utf8'));
const productsDataCode = cleanModule(fs.readFileSync('js/products-data.js', 'utf8'));
const socialFeedDataCode = cleanModule(fs.readFileSync('js/social-feed-data.js', 'utf8'));
const cartCode = cleanModule(fs.readFileSync('js/cart.js', 'utf8'));
const threeSceneCode = cleanModule(fs.readFileSync('js/three-scene.js', 'utf8'));
const appCode = cleanModule(fs.readFileSync('js/app.js', 'utf8'));
const dashboardCode = cleanModule(fs.readFileSync('js/dashboard.js', 'utf8'));

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
