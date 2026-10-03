import assert from 'node:assert';
import { CartManager } from '../js/cart.js';
import { initialProducts } from '../js/products-data.js';

console.log('Testing CartManager and WhatsApp Order Generation...');

// Setup fresh cart
CartManager.clear();

const product1 = initialProducts[0]; // price 25.0
const product2 = initialProducts[1]; // price 35.0

// Test 1: Add items
CartManager.addItem(product1, 2); // 2 * 25 = 50
CartManager.addItem(product2, 1); // 1 * 35 = 35

assert.strictEqual(CartManager.getItemCount(), 3, 'Total items count should be 3');
assert.strictEqual(CartManager.getSubtotal(), 85.0, 'Subtotal should be 85.0 JOD');

// Test 2: Update quantity
CartManager.updateQuantity(product1.id, -1); // 1 * 25 = 25
assert.strictEqual(CartManager.getItemCount(), 2, 'Total items should now be 2');
assert.strictEqual(CartManager.getSubtotal(), 60.0, 'Subtotal should now be 60.0 JOD');

// Test 3: Generate WhatsApp payload
const mockOrderDetails = {
  buyerName: 'أحمد الباشا',
  buyerPhone: '0791234567',
  recipientName: 'سارة خالد',
  recipientPhone: '0789876543',
  city: 'عمان - الجبيهة وشمال عمان',
  address: 'شارع الملكة رانيا، عمارة 12، شقة 4',
  deliveryDate: '2026-10-05',
  deliveryTime: 'مساءً (4:00 - 8:00)',
  cardMessage: 'كل عام وأنتِ بألف خير يا أغلى الناس، دمتِ لنا وردة فواحة 🌸',
  cardSign: 'أحمد',
  notes: 'يرجى وضع شريط أوف وايت حريري أنيق مع الباقة'
};

const waUrl = CartManager.generateWhatsAppOrderUrl(mockOrderDetails, '0797035039');
assert.ok(waUrl.startsWith('https://wa.me/962797035039?text='), 'URL must point to clean Jordan number 962797035039');

const decodedText = decodeURIComponent(waUrl.replace('https://wa.me/962797035039?text=', ''));
assert.ok(decodedText.includes('طلب جديد من متجر لين للزهور'), 'Message must contain shop title');
assert.ok(decodedText.includes('أحمد الباشا'), 'Message must contain buyer name');
assert.ok(decodedText.includes('سارة خالد'), 'Message must contain recipient name');
assert.ok(decodedText.includes('كل عام وأنتِ بألف خير'), 'Message must contain card message');
assert.ok(decodedText.includes(product1.title), 'Message must list product 1');
assert.ok(decodedText.includes('60.00 د.أ') || decodedText.includes('60 د.أ') || decodedText.includes('60'), 'Message must contain total amount');

console.log('✅ Task 4 Cart & WhatsApp tests passed successfully!');
