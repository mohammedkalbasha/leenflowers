import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { initialProducts } from '../js/products-data.js';
import { CartManager } from '../js/cart.js';
import { OrdersDb, initDatabase } from '../db.js';

console.log('========================================================');
console.log('   VERIFYING FULFILLMENT MODE: DELIVERY VS STORE PICKUP');
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

// 1. Delivery Mode Verification
test('Delivery mode calculates 3.0 JOD fee and formats delivery WhatsApp message', () => {
  CartManager.clear();
  CartManager.addItem(initialProducts[0], 1); // 25.0 JOD

  const orderDetails = {
    orderNumber: 'LF-26-801',
    buyerName: 'يوسف العلي',
    buyerPhone: '0795554433',
    city: 'عمان - الجبيهة',
    address: 'شارع ياجوز، عمارة 10',
    deliveryDate: '2026-10-18',
    deliveryTime: 'مساءً',
    exactTime: '17:00',
    locationUrl: 'https://maps.google.com/?q=32.0123,35.8456',
    fulfillmentType: 'delivery',
    deliveryFee: 3.0
  };

  const waUrl = CartManager.generateWhatsAppOrderUrl(orderDetails, '0797035039');
  const decoded = decodeURIComponent(waUrl);

  assert.ok(decoded.includes('نوع الطلب: توصيل إلى العنوان 🚗'), 'WhatsApp indicates delivery mode');
  assert.ok(decoded.includes('رسوم التوصيل:* 3.00 د.أ'), 'WhatsApp includes 3.00 JOD delivery fee');
  assert.ok(decoded.includes('المجموع الإجمالي:* 28.00 د.أ'), 'Grand total is 28.00 JOD (25 + 3)');
  assert.ok(decoded.includes('شارع ياجوز'), 'Contains street address');
  assert.ok(decoded.includes('https://maps.google.com/?q=32.0123,35.8456'), 'Contains maps URL');
});

// 2. Store Pickup Mode Verification
test('Store pickup mode waives delivery fee (0.0 JOD) and formats pickup WhatsApp message', () => {
  CartManager.clear();
  CartManager.addItem(initialProducts[0], 1); // 25.0 JOD

  const orderDetails = {
    orderNumber: 'LF-26-802',
    buyerName: 'هدى مصطفى',
    buyerPhone: '0781112233',
    city: 'عمان - استلام من الفرع',
    address: 'استلام شخصي من المحل (الفرع الرئيسي - الجبيهة)',
    deliveryDate: '2026-10-18',
    deliveryTime: 'صباحاً',
    exactTime: '11:30',
    fulfillmentType: 'pickup'
  };

  const waUrl = CartManager.generateWhatsAppOrderUrl(orderDetails, '0797035039');
  const decoded = decodeURIComponent(waUrl);

  assert.ok(decoded.includes('نوع الطلب: استلام شخصي من المحل (الفرع الرئيسي) 🏬'), 'WhatsApp indicates store pickup');
  assert.ok(decoded.includes('رسوم التوصيل:* مجاناً 0.00 د.أ (استلام من المحل)'), 'WhatsApp shows free pickup');
  assert.ok(decoded.includes('المجموع الإجمالي:* 25.00 د.أ'), 'Grand total has NO delivery fee added (25.00 JOD)');
  assert.ok(decoded.includes('11:30'), 'Contains exact pickup hour');
});

// 3. Database Persistence of fulfillmentType
test('Database orders table correctly stores and retrieves fulfillmentType', () => {
  const pickupOrder = {
    buyerName: 'كريم جمال',
    buyerPhone: '0796667788',
    fulfillmentType: 'pickup',
    city: 'عمان - استلام من الفرع',
    detailedAddress: 'استلام من المحل',
    deliveryDate: '2026-10-20',
    deliveryTime: 'مساءً',
    exactTime: '19:00',
    items: [{ id: 'lf-002', title: 'بوكس اللافندر', qty: 1, price: 35.0 }],
    subtotal: 35.0,
    deliveryFee: 0.0,
    total: 35.0
  };

  const newId = OrdersDb.create(pickupOrder);
  assert.ok(newId > 0, 'Pickup order inserted');

  const fetched = OrdersDb.getById(newId);
  assert.strictEqual(fetched.fulfillmentType, 'pickup', 'fulfillmentType is persisted as pickup');
  assert.strictEqual(fetched.deliveryFee, 0, 'deliveryFee is 0');
  assert.strictEqual(fetched.total, 35, 'Total matches subtotal without delivery fee');
});

// 4. Headless Chrome DOM Verification
test('Headless Chrome DOM contains fulfillment mode elements', () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const dump = execSync(`"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=5000 --dump-dom http://localhost:3000/`, {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024
  });

  assert.ok(dump.includes('id="type-delivery"'), 'Delivery radio button exists');
  assert.ok(dump.includes('id="type-pickup"'), 'Pickup radio button exists');
  assert.ok(dump.includes('توصيل إلى العنوان'), 'Delivery label text exists');
  assert.ok(dump.includes('استلام من المحل'), 'Store pickup label text exists');
  assert.ok(dump.includes('id="pickup-store-info"'), 'Store pickup info box exists');
  assert.ok(dump.includes('عمان - شمال عمان، الجبيهة'), 'Store address displayed');
  assert.ok(dump.includes('id="modal-delivery-fee-note"'), 'Dynamic fee breakdown note exists');
});

console.log('\n========================================================');
console.log(`ALL ${passedCount} FULFILLMENT MODE TESTS PASSED 100%!`);
console.log('========================================================\n');
