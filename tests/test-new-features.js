import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { initialProducts, getProductById } from '../js/products-data.js';
import { CartManager } from '../js/cart.js';
import { OrdersDb, initDatabase } from '../db.js';

console.log('========================================================');
console.log('   VERIFYING NEW FEATURES: MODAL LOCK, GALLERY & CHECKOUT');
console.log('========================================================\n');

initDatabase('data/leen_flowers.db');

let passedCount = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Verify Products Album / Multi-Photo Data
test('All initial products have images array with valid URLs', () => {
  assert.ok(initialProducts.length >= 8, 'At least 8 products exist');
  for (const p of initialProducts) {
    assert.ok(Array.isArray(p.images), `Product ${p.id} must have images array`);
    assert.ok(p.images.length >= 1, `Product ${p.id} must have at least 1 image`);
    assert.ok(p.images[0].startsWith('http'), `Product ${p.id} first image must be valid URL`);
  }
});

test('Multi-image products have multiple photos (Album)', () => {
  const lf001 = getProductById('lf-001');
  assert.ok(lf001.images.length >= 3, 'lf-001 has 3+ photos in album');
  const lf002 = getProductById('lf-002');
  assert.ok(lf002.images.length >= 2, 'lf-002 has 2+ photos in album');
});

// 2. Verify WhatsApp Message Formatting with all new fields
test('WhatsApp message formats exact time, location URL, and enabled gift card', () => {
  CartManager.clear();
  const product = initialProducts[0];
  CartManager.addItem(product, 2);

  const orderDetails = {
    orderNumber: 'LF-26-777',
    buyerName: 'سارة خالد',
    buyerPhone: '0798888888',
    recipientName: 'منى أحمد',
    recipientPhone: '0787777777',
    city: 'عمان - دابوق وخلدا وعبدون',
    address: 'دابوق، قرب جامع الملك حسين، عمارة 5',
    locationUrl: 'https://maps.google.com/?q=31.987654,35.876543',
    deliveryDate: '2026-10-10',
    deliveryTime: 'مساءً (4:00 - 8:00)',
    exactTime: '17:30',
    isGiftCard: true,
    cardMessage: 'أجمل التهاني بالمنزل الجديد يا أغلى صديقة 🌸🏡',
    cardSign: 'سارة',
    notes: 'تغليف وردي مع شريط مخملي'
  };

  const waUrl = CartManager.generateWhatsAppOrderUrl(orderDetails, '0797035039');
  const decoded = decodeURIComponent(waUrl);

  assert.ok(decoded.includes('17:30 (مساءً (4:00 - 8:00))'), 'Contains exact time with period');
  assert.ok(decoded.includes('https://maps.google.com/?q=31.987654,35.876543'), 'Contains Google Maps location URL');
  assert.ok(decoded.includes('أجمل التهاني بالمنزل الجديد'), 'Contains custom gift card message');
  assert.ok(decoded.includes('✍️ التوقيع: سارة'), 'Contains gift card signature');
  assert.ok(decoded.includes('LF-26-777'), 'Contains official order number');
});

test('WhatsApp message formats correctly when gift card is toggled off', () => {
  CartManager.clear();
  CartManager.addItem(initialProducts[1], 1);

  const orderDetails = {
    orderNumber: 'LF-26-778',
    buyerName: 'عمر ناصر',
    buyerPhone: '0791112233',
    city: 'عمان - الجبيهة',
    address: 'شارع الجامعة',
    deliveryDate: '2026-10-12',
    deliveryTime: 'صباحاً',
    exactTime: '10:00',
    locationUrl: '',
    isGiftCard: false,
    cardMessage: '',
    cardSign: ''
  };

  const waUrl = CartManager.generateWhatsAppOrderUrl(orderDetails, '0797035039');
  const decoded = decodeURIComponent(waUrl);

  assert.ok(decoded.includes('💌 *بطاقة الإهداء:* بدون كرت إهداء'), 'Shows without gift card when unchecked');
  assert.ok(decoded.includes('10:00 (صباحاً)'), 'Contains exact time');
});

// 3. Database Persistence of exactTime and locationUrl
test('Database orders table correctly stores exactTime and locationUrl', () => {
  const testOrder = {
    buyerName: 'ليلى زيد',
    buyerPhone: '0799991122',
    recipientName: 'ديمة زيد',
    recipientPhone: '0788883344',
    city: 'عمان - الشميساني',
    detailedAddress: 'شارع الملكة نور، عمارة الأمل',
    deliveryDate: '2026-10-15',
    deliveryTime: 'مساءً',
    exactTime: '19:15',
    locationUrl: 'https://maps.google.com/?q=31.960000,35.900000',
    giftCardMessage: 'كل الحب والتوفيق في عملكِ الجديد 💐',
    giftCardSign: 'ليلى',
    orderNotes: 'يرجى الاتصال قبل الوصول بـ 15 دقيقة',
    items: [{ id: 'lf-001', title: 'باقة جوري', qty: 1, price: 25.0 }],
    subtotal: 25.0,
    deliveryFee: 3.0,
    total: 28.0
  };

  const newId = OrdersDb.create(testOrder);
  assert.ok(newId > 0, 'Order created in database');

  const fetched = OrdersDb.getById(newId);
  assert.strictEqual(fetched.exactTime, '19:15', 'exactTime persisted in database');
  assert.strictEqual(fetched.locationUrl, 'https://maps.google.com/?q=31.960000,35.900000', 'locationUrl persisted in database');
  assert.strictEqual(fetched.giftCardMessage, 'كل الحب والتوفيق في عملكِ الجديد 💐', 'giftCardMessage persisted');
});

// 4. Headless Chrome DOM Verification
test('Headless Chrome DOM contains all new elements and classes', () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const dump = execSync(`"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=5000 --dump-dom http://localhost:3000/`, {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024
  });

  // 1. Gallery album elements
  assert.ok(dump.includes('gallery-main-wrap'), 'Gallery main wrap exists');
  assert.ok(dump.includes('modal-gallery-prev'), 'Gallery prev button exists');
  assert.ok(dump.includes('modal-gallery-next'), 'Gallery next button exists');
  assert.ok(dump.includes('modal-gallery-thumbs'), 'Gallery thumbnails container exists');

  // 2. Exact time and location elements
  assert.ok(dump.includes('delivery-exact-time'), 'Exact delivery time input exists');
  assert.ok(dump.includes('delivery-location-url'), 'Delivery location URL input exists');
  assert.ok(dump.includes('btn-get-location'), 'GPS Get location button exists');
  assert.ok(dump.includes('تحديد موقعي الحالي'), 'GPS button has Arabic label');

  // 3. Gift card toggle switch elements
  assert.ok(dump.includes('toggle-gift-card'), 'Toggle gift card checkbox exists');
  assert.ok(dump.includes('gift-card-fields-box'), 'Gift card expandable container exists');
  assert.ok(dump.includes('toggle-slider'), 'Toggle switch slider exists');
});

console.log('\n========================================================');
console.log(`ALL ${passedCount} FEATURE VERIFICATION TESTS PASSED SUCCESSFULLY!`);
console.log('========================================================\n');
