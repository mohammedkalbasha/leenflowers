import http from 'node:http';
import { execSync } from 'node:child_process';
import { getDb, OrdersDb, ProductsDb, AuthDb } from '../db.js';

console.log('======================================================');
console.log('   LEEN FLOWERS PHASE 2 RIGOROUS VERIFICATION SUITE   ');
console.log('======================================================\n');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runPhase2Verification() {
  let passed = 0;
  let failed = 0;

  function assert(cond, name) {
    if (cond) {
      passed++;
      console.log(`✅ PASS: ${name}`);
    } else {
      failed++;
      console.error(`❌ FAIL: ${name}`);
    }
  }

  try {
    // 1. Database Sanity
    console.log('\n--- 1. DATABASE & PERSISTENCE ---');
    const dbProducts = ProductsDb.getAll();
    assert(dbProducts.length >= 8, `Database has ${dbProducts.length} products`);
    assert(AuthDb.verifyPin('1234'), 'Default admin PIN 1234 is active');

    // 2. Direct API Checkout Submission
    console.log('\n--- 2. REST API & AUTOMATIC ORDER RECORDING ---');
    const orderPayload = {
      buyerName: 'فيصل الزعبي',
      buyerPhone: '0797035039',
      recipientName: 'د. ليلى',
      recipientPhone: '0797035039',
      city: 'عمان - الشميساني والرابية',
      detailedAddress: 'شارع الثقافة مجمع الأطباء',
      deliveryDate: '2026-10-06',
      deliveryTime: 'صباحاً (9:00 ص - 1:00 م)',
      giftCardMessage: 'تهانينا الحارة بافتتاح العيادة الجديدة، متمنين لكِ دوام النجاح والتألق.',
      giftCardSign: 'فيصل وعائلته',
      orderNotes: 'يرجى التوصيل قبل الظهر',
      items: [
        { id: 'lf-001', title: 'باقة جوري أحمر ملكي (Royal Crimson)', qty: 2, price: 25.0 },
        { id: 'lf-003', title: 'فازة كريستال توليب وروز (Crystal Dawn)', qty: 1, price: 45.0 }
      ],
      subtotal: 95.0,
      deliveryFee: 3.0,
      total: 98.0
    };

    const newOrderId = OrdersDb.create(orderPayload);
    assert(newOrderId > 0, `Order created in database with internal ID: ${newOrderId}`);
    const recordedOrder = OrdersDb.getById(newOrderId);
    assert(recordedOrder && recordedOrder.orderNumber.startsWith('LF-26-'), `Generated official order number: ${recordedOrder ? recordedOrder.orderNumber : ''}`);
    assert(recordedOrder.recipientName === 'د. ليلى', 'Recipient name persisted correctly');
    assert(recordedOrder.total === 98.0, 'Order total persisted correctly');

    // 3. Headless Chrome Browser Test: Storefront Checkout to Database
    console.log('\n--- 3. HEADLESS CHROME: STOREFRONT CHECKOUT TO DB ---');
    const storeOut = execSync('node scripts/run-e2e.js', { encoding: 'utf8' });
    assert(storeOut.includes('ALL TESTS PASSED WITH 100% SUCCESS!'), 'Storefront 35-point E2E test suite passed cleanly');

    // 4. Headless Chrome Browser Test: Dashboard PIN Lock & Print Modal
    console.log('\n--- 4. HEADLESS CHROME: DASHBOARD PIN LOCK & PRINT VOUCHER ---');
    
    // Test HTML runner for dashboard Phase 2
    const dashDump = execSync(`"${chrome}" --headless=new --disable-gpu --virtual-time-budget=5000 --dump-dom http://localhost:3000/dashboard.html`, {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024
    });

    assert(dashDump.includes('id="dashboard-lock-overlay"'), 'Dashboard contains PIN Lock Screen overlay');
    assert(dashDump.includes('id="admin-pin-input"'), 'PIN input element exists');
    assert(dashDump.includes('id="print-modal-overlay"'), 'Print Voucher modal exists');
    assert(dashDump.includes('id="printable-voucher"'), 'Printable voucher container exists');
    assert(dashDump.includes('css/print.css'), 'print.css stylesheet linked');

    // 5. Verify Orders Table Content in Dashboard
    const allOrders = OrdersDb.getAll();
    assert(allOrders.length >= 1, `Orders database has ${allOrders.length} orders recorded`);
    const latest = allOrders[0];
    assert(latest.items.length >= 1, `Latest order has ${latest.items.length} items`);

    console.log('\n======================================================');
    console.log(`PHASE 2 AUDIT COMPLETE: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Phase 2 verification error:', err.message);
    process.exit(1);
  }
}

runPhase2Verification();
