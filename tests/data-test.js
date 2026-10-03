import assert from 'node:assert';
import { StoreConfig } from '../js/store-config.js';
import { initialProducts, getProducts, getProductById, saveProducts } from '../js/products-data.js';

console.log('Testing StoreConfig and Products Data...');

// Test 1: Store Config defaults
assert.strictEqual(StoreConfig.name, 'لين للزهور - Leen Flowers', 'Store name should match');
assert.strictEqual(StoreConfig.defaultWhatsApp, '0797035039', 'Default WhatsApp should match 0797035039');
assert.strictEqual(StoreConfig.countryCode, '962', 'Default Jordan country code should be 962');
assert.ok(StoreConfig.instagram.includes('leen_flower11'), 'Instagram link must include leen_flower11');
assert.ok(StoreConfig.facebook.includes('Leen-Flowers'), 'Facebook link must include Leen-Flowers');

// Test 2: Clean Phone Number Formatter
const formatted = StoreConfig.formatWhatsAppNumber('0797035039');
assert.strictEqual(formatted, '962797035039', 'Formatted number should be 962797035039 without leading 0');

// Test 3: Products Data
assert.ok(initialProducts.length >= 8, 'Initial products should have at least 8 items');
const firstProduct = initialProducts[0];
assert.ok(firstProduct.id, 'Product must have id');
assert.ok(firstProduct.title, 'Product must have title');
assert.ok(firstProduct.price > 0, 'Product must have valid price');
assert.ok(firstProduct.category, 'Product must have category');
assert.ok(firstProduct.image, 'Product must have image');

const found = getProductById(firstProduct.id);
assert.strictEqual(found.title, firstProduct.title, 'getProductById should find product');

console.log('✅ Task 1 Data tests passed successfully!');
