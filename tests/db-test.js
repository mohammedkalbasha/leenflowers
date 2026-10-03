import { initDatabase, getDb, closeDatabase, ProductsDb, OrdersDb, ConfigDb, AuthDb } from '../db.js';
import fs from 'node:fs';
import path from 'node:path';

console.log('Testing Native SQLite Database Layer for Leen Flowers (Phase 2)...');

const testDbPath = path.resolve('data/test_leen_flowers.db');
if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

try {
  initDatabase(testDbPath);
  console.log('✅ Database initialized successfully');

  // 1. Config Test
  const config = ConfigDb.get();
  if (!config || config.defaultWhatsApp !== '0797035039') {
    throw new Error('Config failed to seed with default WhatsApp number');
  }
  console.log('✅ Config seeded correctly:', config.name, config.defaultWhatsApp);

  ConfigDb.update({ defaultWhatsApp: '0797035039', name: 'متجر لين للزهور الفاخرة' });
  const updatedCfg = ConfigDb.get();
  if (updatedCfg.name !== 'متجر لين للزهور الفاخرة') {
    throw new Error('Config update failed');
  }
  console.log('✅ Config update verified');

  // 2. Products Test
  const products = ProductsDb.getAll();
  if (!Array.isArray(products) || products.length < 8) {
    throw new Error(`Expected at least 8 seeded products, found ${products ? products.length : 0}`);
  }
  console.log(`✅ Products seeded correctly (${products.length} products)`);

  const newProd = {
    id: 'lf-test-999',
    title: 'باقة اختبار لوتس',
    category: 'natural-bouquets',
    price: 33.5,
    oldPrice: 40.0,
    badge: 'تجربة',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
    description: 'وصف باقة تجريبية',
    flowerType: 'لوتس طبيعي',
    flowerCount: '15 زهرة',
    dimensions: '40 سم',
    packaging: 'تغليف بيج',
    freshness: '7 أيام',
    careTips: 'ماء بارد',
    inStock: 1,
    featured: 0
  };
  ProductsDb.create(newProd);
  const fetchedProd = ProductsDb.getById('lf-test-999');
  if (!fetchedProd || fetchedProd.price !== 33.5) {
    throw new Error('Failed to create or fetch product lf-test-999');
  }
  console.log('✅ Product create and getById verified');

  ProductsDb.delete('lf-test-999');
  if (ProductsDb.getById('lf-test-999')) {
    throw new Error('Product delete failed');
  }
  console.log('✅ Product delete verified');

  // 3. Orders Test
  const newOrder = {
    orderNumber: 'LF-26-TEST01',
    buyerName: 'سعيد العلي',
    buyerPhone: '0791112233',
    recipientName: 'منى',
    recipientPhone: '0794445566',
    city: 'عمان - الجبيهة',
    detailedAddress: 'قرب الجامعة الأردنية',
    deliveryDate: '2026-10-04',
    deliveryTime: 'مساءً',
    giftCardMessage: 'كل عام وأنت بألف خير',
    giftCardSign: 'سعيد',
    orderNotes: 'يرجى وضع شريط أزرق',
    items: JSON.stringify([{ id: 'lf-001', title: 'باقة جوري', qty: 1, price: 25.0 }]),
    subtotal: 25.0,
    deliveryFee: 3.0,
    total: 28.0,
    status: 'new'
  };
  const orderId = OrdersDb.create(newOrder);
  if (!orderId) throw new Error('Order creation returned falsy ID');
  const fetchedOrder = OrdersDb.getById(orderId);
  if (!fetchedOrder || fetchedOrder.buyerName !== 'سعيد العلي') {
    throw new Error('Failed to fetch created order');
  }
  console.log('✅ Order create and getById verified:', fetchedOrder.orderNumber);

  OrdersDb.updateStatus(orderId, 'preparing');
  const updatedOrder = OrdersDb.getById(orderId);
  if (updatedOrder.status !== 'preparing') {
    throw new Error('Order status update failed');
  }
  console.log('✅ Order status update verified');

  // 4. Auth Test
  if (!AuthDb.verifyPin('1234')) {
    throw new Error('Default PIN 1234 failed verification');
  }
  if (AuthDb.verifyPin('9999')) {
    throw new Error('Wrong PIN unexpectedly verified');
  }
  AuthDb.setPin('5678');
  if (!AuthDb.verifyPin('5678')) {
    throw new Error('New PIN 5678 failed verification');
  }
  console.log('✅ Auth PIN verification and change verified');

  // Cleanup test DB
  closeDatabase();
  fs.unlinkSync(testDbPath);
  console.log('\n🎉 ALL DATABASE LAYER TESTS PASSED!');
} catch (e) {
  console.error('\n❌ DATABASE TEST FAILED:', e.message);
  try { closeDatabase(); } catch (_) {}
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  process.exit(1);
}
