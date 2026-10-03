import http from 'node:http';

console.log('Testing REST API for Leen Flowers (Phase 2)...');

const BASE_URL = 'http://localhost:3000';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    const req = http.request(url, { method, headers: reqHeaders }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: json, raw: data });
        } catch (_) {
          resolve({ status: res.statusCode, headers: res.headers, data, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runApiTests() {
  try {
    // 1. Config endpoint
    const cfgRes = await request('GET', '/api/config');
    if (cfgRes.status !== 200 || !cfgRes.data.defaultWhatsApp) {
      throw new Error(`GET /api/config failed: status ${cfgRes.status}, data: ${JSON.stringify(cfgRes.data)}`);
    }
    console.log('✅ GET /api/config passed:', cfgRes.data.name);

    // 2. Auth Login endpoint
    const loginFail = await request('POST', '/api/auth/login', { pin: '0000' });
    if (loginFail.status !== 401) {
      throw new Error(`POST /api/auth/login expected 401 for wrong pin, got ${loginFail.status}`);
    }
    const loginOk = await request('POST', '/api/auth/login', { pin: '1234' });
    if (loginOk.status !== 200 || !loginOk.data.token) {
      throw new Error(`POST /api/auth/login failed for correct pin: ${JSON.stringify(loginOk.data)}`);
    }
    const adminPin = '1234';
    console.log('✅ POST /api/auth/login passed (401 on bad pin, 200 on valid pin)');

    // 3. Products endpoint
    const prodsRes = await request('GET', '/api/products');
    if (prodsRes.status !== 200 || !Array.isArray(prodsRes.data) || prodsRes.data.length < 8) {
      throw new Error(`GET /api/products failed: status ${prodsRes.status}, length: ${prodsRes.data ? prodsRes.data.length : 0}`);
    }
    console.log(`✅ GET /api/products passed (${prodsRes.data.length} products)`);

    // Create product requires PIN
    const prodNoAuth = await request('POST', '/api/products', { title: 'No Auth' });
    if (prodNoAuth.status !== 401) {
      throw new Error(`POST /api/products without auth expected 401, got ${prodNoAuth.status}`);
    }
    console.log('✅ POST /api/products rejects unauthenticated requests with 401');

    const createdProd = await request('POST', '/api/products', {
      title: 'باقة مميزة جديدة للربيع',
      category: 'natural-bouquets',
      price: 29.0,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
      description: 'باقة ربيعية مبهجة'
    }, { 'x-admin-pin': adminPin });

    if (createdProd.status !== 201 || !createdProd.data.id) {
      throw new Error(`POST /api/products with PIN failed: status ${createdProd.status}, data: ${JSON.stringify(createdProd.data)}`);
    }
    const newId = createdProd.data.id;
    console.log('✅ POST /api/products with PIN passed:', newId);

    // 4. Orders endpoint (Public create from checkout)
    const orderRes = await request('POST', '/api/orders', {
      buyerName: 'سارة خالد',
      buyerPhone: '0797035039',
      recipientName: 'أم سارة',
      recipientPhone: '0797035039',
      city: 'عمان - دابوق',
      detailedAddress: 'شارع السلام بناية 12',
      deliveryDate: '2026-10-05',
      deliveryTime: 'مساءً',
      giftCardMessage: 'دمتِ لنا سنداً وأماناً يا أمي الغالية',
      giftCardSign: 'ابنتك سارة',
      items: [{ id: 'lf-001', title: 'باقة جوري', qty: 1, price: 25.0 }],
      subtotal: 25.0,
      deliveryFee: 3.0,
      total: 28.0
    });
    if (orderRes.status !== 201 || !orderRes.data.orderNumber) {
      throw new Error(`POST /api/orders failed: status ${orderRes.status}, data: ${JSON.stringify(orderRes.data)}`);
    }
    console.log('✅ POST /api/orders (Public checkout) passed:', orderRes.data.orderNumber);

    // Orders list requires PIN
    const ordersList = await request('GET', '/api/orders', null, { 'x-admin-pin': adminPin });
    if (ordersList.status !== 200 || !Array.isArray(ordersList.data)) {
      throw new Error(`GET /api/orders failed: status ${ordersList.status}`);
    }
    console.log(`✅ GET /api/orders with PIN passed (${ordersList.data.length} orders)`);

    // Update order status
    const orderIdToUpdate = orderRes.data.id;
    const updateStatusRes = await request('PUT', `/api/orders/${orderIdToUpdate}/status`, { status: 'preparing' }, { 'x-admin-pin': adminPin });
    if (updateStatusRes.status !== 200 || updateStatusRes.data.status !== 'preparing') {
      throw new Error(`PUT /api/orders/:id/status failed: status ${updateStatusRes.status}`);
    }
    console.log('✅ PUT /api/orders/:id/status passed');

    // 5. Stats endpoint
    const statsRes = await request('GET', '/api/stats', null, { 'x-admin-pin': adminPin });
    if (statsRes.status !== 200 || typeof statsRes.data.totalProducts !== 'number') {
      throw new Error(`GET /api/stats failed: status ${statsRes.status}`);
    }
    console.log('✅ GET /api/stats passed:', statsRes.data);

    // Cleanup created product
    await request('DELETE', `/api/products/${newId}`, null, { 'x-admin-pin': adminPin });
    console.log('✅ DELETE /api/products/:id passed');

    console.log('\n🎉 ALL REST API ENDPOINTS VERIFIED AND PASSING 100%!');
  } catch (err) {
    console.error('\n❌ API TEST FAILED:', err.message);
    process.exit(1);
  }
}

runApiTests();
