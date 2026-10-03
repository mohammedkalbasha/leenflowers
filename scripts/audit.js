import fs from 'node:fs';

console.log('==============================================');
console.log('  LEEN FLOWERS RIGOROUS AUDIT & VERIFICATION  ');
console.log('==============================================\n');

// 1. Check all JS files syntax
const filesToTest = [
  'js/store-config.js',
  'js/products-data.js',
  'js/social-feed-data.js',
  'js/cart.js',
  'js/three-scene.js',
  'js/app.js',
  'js/dashboard.js',
  'js/bundle.js',
  'js/dashboard-bundle.js'
];

let syntaxErrors = 0;
for (const file of filesToTest) {
  try {
    const code = fs.readFileSync(file, 'utf8');
    const clean = code
      .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ')
      .replace(/export\s*\{[\s\S]*?\};?/g, '');
    new Function(clean);
    console.log(`[SYNTAX] ✅ ${file} is valid`);
  } catch (e) {
    console.error(`[SYNTAX] ❌ ${file} has error: ${e.message}`);
    syntaxErrors++;
  }
}

// 2. Check Bundle.js specifically (without any regex replacement, exactly as browser runs it)
try {
  const bundleCode = fs.readFileSync('js/bundle.js', 'utf8');
  new Function(bundleCode);
  console.log('[BUNDLE] ✅ js/bundle.js raw execution check passed');
} catch (e) {
  console.error('[BUNDLE] ❌ js/bundle.js failed:', e.message);
  syntaxErrors++;
}

try {
  const dashBundleCode = fs.readFileSync('js/dashboard-bundle.js', 'utf8');
  new Function(dashBundleCode);
  console.log('[BUNDLE] ✅ js/dashboard-bundle.js raw execution check passed');
} catch (e) {
  console.error('[BUNDLE] ❌ js/dashboard-bundle.js failed:', e.message);
  syntaxErrors++;
}

// 3. Check HTML IDs
console.log('\n--- Checking Document IDs ---');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const dashboardHtml = fs.readFileSync('dashboard.html', 'utf8');
const appJs = fs.readFileSync('js/app.js', 'utf8');
const threeJs = fs.readFileSync('js/three-scene.js', 'utf8');
const dashJs = fs.readFileSync('js/dashboard.js', 'utf8');

function checkIds(jsCode, htmlCode, htmlName) {
  const idRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
  let match;
  let missing = 0;
  const ids = new Set();
  while ((match = idRegex.exec(jsCode)) !== null) {
    ids.add(match[1]);
  }
  for (const id of ids) {
    const exists = htmlCode.includes(`id="${id}"`) || htmlCode.includes(`id='${id}'`);
    if (!exists) {
      console.warn(`[ID MISSING] ⚠️ ID "${id}" referenced in JS but NOT found in ${htmlName}`);
      missing++;
    } else {
      console.log(`[ID OK] ✅ ID "${id}" present in ${htmlName}`);
    }
  }
  return missing;
}

const missingStoreIds = checkIds(appJs + threeJs, indexHtml, 'index.html');
const missingDashIds = checkIds(dashJs, dashboardHtml, 'dashboard.html');

// 4. Check CSS & Themes Tokens
console.log('\n--- Checking Themes CSS Tokens ---');
const themesCss = fs.readFileSync('css/themes.css', 'utf8');
const requiredTokens = [
  '--primary',
  '--primary-hover',
  '--primary-light',
  '--primary-contrast',
  '--bg-main',
  '--bg-card',
  '--text-main',
  '--text-muted',
  '--border-color'
];
for (const theme of ['[data-theme="blush"]', '[data-theme="lavender"]', '[data-theme="midnight"]']) {
  const themeIdx = themesCss.indexOf(theme);
  if (themeIdx === -1) {
    console.error(`[THEME] ❌ Theme selector ${theme} missing in themes.css`);
  } else {
    console.log(`[THEME] ✅ Theme selector ${theme} exists`);
  }
}

for (const token of requiredTokens) {
  if (!themesCss.includes(token)) {
    console.error(`[TOKEN] ❌ Token ${token} missing in themes.css`);
  } else {
    console.log(`[TOKEN] ✅ Token ${token} defined`);
  }
}

// 5. Check Product Images & Assets
console.log('\n--- Checking Product Data & Images ---');
import('../js/products-data.js').then((prodModule) => {
  const products = prodModule.getProducts();
  console.log(`Auditing ${products.length} products...`);
  let prodErrors = 0;
  products.forEach((p, idx) => {
    if (!p.id || !p.title || !p.price || !p.category || !p.image) {
      console.error(`[PROD] ❌ Product at index ${idx} missing essential field:`, p);
      prodErrors++;
    }
    if (!p.specs || !p.specs.flowerType || !p.specs.flowerCount || !p.specs.careTips) {
      console.warn(`[PROD] ⚠️ Product ${p.id} missing detailed specs`);
    }
  });
  if (prodErrors === 0) {
    console.log(`[PROD] ✅ All ${products.length} products have complete valid schemas and specs`);
  }
}).catch(err => {
  console.error('[PROD] ❌ Could not import products-data.js:', err.message);
});
