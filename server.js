import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase, ConfigDb, ProductsDb, OrdersDb, AuthDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Initialize Native SQLite Database
initDatabase(path.join(__dirname, 'data/leen_flowers.db'));

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({ _raw: body });
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-pin',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

function verifyAdminAuth(req) {
  const pinHeader = req.headers['x-admin-pin'] || req.headers['x-admin-token'];
  if (pinHeader && AuthDb.verifyPin(pinHeader)) {
    return true;
  }
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return AuthDb.verifyPin(token);
  }
  return false;
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-pin',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  const [pathname, search] = req.url.split('?');

  // --- REST API ROUTER ---
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Auth Login: POST /api/auth/login
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        const body = await parseBody(req);
        if (body.pin && AuthDb.verifyPin(body.pin)) {
          return sendJson(res, 200, { success: true, token: body.pin, message: 'تم التحقق بنجاح' });
        }
        return sendJson(res, 401, { success: false, error: 'رمز الدخول (PIN) غير صحيح' });
      }

      // 2. Change PIN: POST /api/auth/change-pin (Auth required)
      if (pathname === '/api/auth/change-pin' && req.method === 'POST') {
        if (!verifyAdminAuth(req)) {
          return sendJson(res, 401, { error: 'غير مصرح به - يرجى تسجيل الدخول أولاً' });
        }
        const body = await parseBody(req);
        if (!body.newPin || body.newPin.length < 4) {
          return sendJson(res, 400, { error: 'يجب أن يتكون الرمز السري من 4 أرقام على الأقل' });
        }
        AuthDb.setPin(body.newPin);
        return sendJson(res, 200, { success: true, message: 'تم تحديث الرمز السري بنجاح' });
      }

      // 3. Store Config: GET, PUT /api/config
      if (pathname === '/api/config') {
        if (req.method === 'GET') {
          return sendJson(res, 200, ConfigDb.get());
        }
        if (req.method === 'PUT') {
          if (!verifyAdminAuth(req)) {
            return sendJson(res, 401, { error: 'غير مصرح به' });
          }
          const body = await parseBody(req);
          const updated = ConfigDb.update(body);
          return sendJson(res, 200, updated);
        }
      }

      // 4. Products: /api/products
      if (pathname === '/api/products') {
        if (req.method === 'GET') {
          return sendJson(res, 200, ProductsDb.getAll());
        }
        if (req.method === 'POST') {
          if (!verifyAdminAuth(req)) {
            return sendJson(res, 401, { error: 'غير مصرح به' });
          }
          const body = await parseBody(req);
          if (!body.title || !body.price) {
            return sendJson(res, 400, { error: 'اسم المنتج وسعره مطلوبان' });
          }
          const created = ProductsDb.create(body);
          return sendJson(res, 201, created);
        }
      }

      // Product single item: /api/products/:id
      const prodMatch = pathname.match(/^\/api\/products\/([^\/]+)$/);
      if (prodMatch) {
        const prodId = prodMatch[1];
        if (req.method === 'GET') {
          const item = ProductsDb.getById(prodId);
          if (!item) return sendJson(res, 404, { error: 'المنتج غير موجود' });
          return sendJson(res, 200, item);
        }
        if (req.method === 'PUT') {
          if (!verifyAdminAuth(req)) return sendJson(res, 401, { error: 'غير مصرح به' });
          const body = await parseBody(req);
          const updated = ProductsDb.update(prodId, body);
          if (!updated) return sendJson(res, 404, { error: 'المنتج غير موجود' });
          return sendJson(res, 200, updated);
        }
        if (req.method === 'DELETE') {
          if (!verifyAdminAuth(req)) return sendJson(res, 401, { error: 'غير مصرح به' });
          ProductsDb.delete(prodId);
          return sendJson(res, 200, { success: true, message: 'تم حذف المنتج بنجاح' });
        }
      }

      // 5. Upload Image: POST /api/upload
      if (pathname === '/api/upload' && req.method === 'POST') {
        const body = await parseBody(req);
        if (!body.data) {
          return sendJson(res, 400, { error: 'بيانات الصورة مطلوبة' });
        }

        const match = body.data.match(/^data:image\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
        let ext = 'jpg';
        let buffer;
        if (match) {
          ext = match[1].replace('jpeg', 'jpg');
          buffer = Buffer.from(match[2], 'base64');
        } else {
          buffer = Buffer.from(body.data, 'base64');
        }

        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filename = `flower-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
        const targetPath = path.join(uploadsDir, filename);
        fs.writeFileSync(targetPath, buffer);

        const url = `/uploads/${filename}`;
        return sendJson(res, 200, { success: true, url, filename });
      }

      // 5. Orders: /api/orders
      if (pathname === '/api/orders') {
        // Public order placement from storefront checkout
        if (req.method === 'POST') {
          const body = await parseBody(req);
          if (!body.buyerName || !body.buyerPhone || !body.detailedAddress) {
            return sendJson(res, 400, { error: 'بيانات المشتري والعنوان مطلوبة بالكامل' });
          }
          const id = OrdersDb.create(body);
          const createdOrder = OrdersDb.getById(id);
          return sendJson(res, 201, createdOrder);
        }
        // Admin orders list
        if (req.method === 'GET') {
          if (!verifyAdminAuth(req)) return sendJson(res, 401, { error: 'غير مصرح به' });
          return sendJson(res, 200, OrdersDb.getAll());
        }
      }

      // Order status update: /api/orders/:id/status
      const orderStatusMatch = pathname.match(/^\/api\/orders\/([^\/]+)\/status$/);
      if (orderStatusMatch && req.method === 'PUT') {
        if (!verifyAdminAuth(req)) return sendJson(res, 401, { error: 'غير مصرح به' });
        const orderId = orderStatusMatch[1];
        const body = await parseBody(req);
        if (!body.status) return sendJson(res, 400, { error: 'الحالة الجديدة مطلوبة' });
        const updated = OrdersDb.updateStatus(orderId, body.status);
        if (!updated) return sendJson(res, 404, { error: 'الطلب غير موجود' });
        return sendJson(res, 200, updated);
      }

      // Order single item: /api/orders/:id
      const orderMatch = pathname.match(/^\/api\/orders\/([^\/]+)$/);
      if (orderMatch) {
        const orderId = orderMatch[1];
        if (req.method === 'GET') {
          if (!verifyAdminAuth(req)) return sendJson(res, 401, { error: 'غير مصرح به' });
          const o = OrdersDb.getById(orderId);
          if (!o) return sendJson(res, 404, { error: 'الطلب غير موجود' });
          return sendJson(res, 200, o);
        }
        if (req.method === 'DELETE') {
          if (!verifyAdminAuth(req)) return sendJson(res, 401, { error: 'غير مصرح به' });
          OrdersDb.delete(orderId);
          return sendJson(res, 200, { success: true });
        }
      }

      // 6. Stats: GET /api/stats (Admin only)
      if (pathname === '/api/stats' && req.method === 'GET') {
        if (!verifyAdminAuth(req)) return sendJson(res, 401, { error: 'غير مصرح به' });
        const products = ProductsDb.getAll();
        const orders = OrdersDb.getAll();
        const totalRevenue = orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + (o.total || 0), 0);

        return sendJson(res, 200, {
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          pendingOrders: orders.filter(o => o.status === 'new' || o.status === 'preparing').length
        });
      }

      return sendJson(res, 404, { error: 'مسار API غير موجود' });
    } catch (apiErr) {
      console.error('API Error:', apiErr);
      return sendJson(res, 500, { error: 'حدث خطأ في الخادم الداخلي', details: apiErr.message });
    }
  }

  // --- STATIC FILE SERVING ---
  let reqUrl = pathname;
  if (reqUrl === '/') reqUrl = '/index.html';

  const filePath = path.join(__dirname, reqUrl);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Leen Flowers Dev Server with REST API & Database running at http://localhost:${PORT}`);
});
