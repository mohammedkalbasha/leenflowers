import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

let dbInstance = null;

export function initDatabase(dbPath = 'data/leen_flowers.db') {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  dbInstance = new DatabaseSync(dbPath);

  // Enable WAL mode for high performance
  dbInstance.exec('PRAGMA journal_mode = WAL;');

  // 1. Create Tables
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      oldPrice REAL,
      badge TEXT,
      image TEXT NOT NULL,
      description TEXT NOT NULL,
      flowerType TEXT,
      flowerCount TEXT,
      dimensions TEXT,
      packaging TEXT,
      freshness TEXT,
      careTips TEXT,
      inStock INTEGER DEFAULT 1,
      featured INTEGER DEFAULT 0,
      images TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderNumber TEXT UNIQUE NOT NULL,
      buyerName TEXT NOT NULL,
      buyerPhone TEXT NOT NULL,
      recipientName TEXT,
      recipientPhone TEXT,
      city TEXT NOT NULL,
      detailedAddress TEXT NOT NULL,
      deliveryDate TEXT,
      deliveryTime TEXT,
      exactTime TEXT,
      locationUrl TEXT,
      fulfillmentType TEXT DEFAULT 'delivery',
      giftCardMessage TEXT,
      giftCardSign TEXT,
      orderNotes TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      deliveryFee REAL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT DEFAULT 'new',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auth (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      pinHash TEXT NOT NULL,
      salt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  try {
    dbInstance.exec('ALTER TABLE products ADD COLUMN images TEXT;');
  } catch (_) {}
  try {
    dbInstance.exec('ALTER TABLE orders ADD COLUMN exactTime TEXT;');
  } catch (_) {}
  try {
    dbInstance.exec('ALTER TABLE orders ADD COLUMN locationUrl TEXT;');
  } catch (_) {}
  try {
    dbInstance.exec("ALTER TABLE orders ADD COLUMN fulfillmentType TEXT DEFAULT 'delivery';");
  } catch (_) {}

  // 2. Auto-seed config if empty
  const configRow = dbInstance.prepare('SELECT id FROM config WHERE id = 1').get();
  if (!configRow) {
    const defaultConfig = {
      name: 'لين للزهور - Leen Flowers',
      tagline: 'زهور تُحاكي مشاعرك بأرقى تفاصيلها 🌸',
      description: 'متجر متخصص بأرقى باقات الورد الطبيعي، بوكسات الهدايا الفاخرة، وتنسيق مناسباتكم السعيدة.',
      defaultWhatsApp: '0797035039',
      countryCode: '962',
      instagram: 'https://www.instagram.com/leen_flower11',
      facebook: 'https://www.facebook.com/p/Leen-Flowers-100090007161366/',
      currency: 'د.أ',
      currencyCode: 'JOD',
      activeTheme: 'blush',
      deliveryFee: 3.0,
      minOrder: 10.0,
      cities: [
        'عمان - الجبيهة وشمال عمان',
        'عمان - دابوق وخلدا وعبدون',
        'عمان - الشميساني والرابية',
        'عمان - طبربور وشفا بدران',
        'عمان - المقابلين وجنوب عمان',
        'الزرقاء وضواحيها',
        'إربد والرمثا',
        'السلط والفحيص وماحص',
        'مادبا',
        'محافظات أخرى (بالتنسيق)'
      ]
    };
    dbInstance.prepare('INSERT INTO config (id, data, updatedAt) VALUES (1, ?, ?)').run(
      JSON.stringify(defaultConfig),
      new Date().toISOString()
    );
  }

  // 3. Auto-seed default PIN (1234) if empty
  const authRow = dbInstance.prepare('SELECT id FROM auth WHERE id = 1').get();
  if (!authRow) {
    const salt = crypto.randomBytes(16).toString('hex');
    const pinHash = hashPin('1234', salt);
    dbInstance.prepare('INSERT INTO auth (id, pinHash, salt, updatedAt) VALUES (1, ?, ?, ?)').run(
      pinHash,
      salt,
      new Date().toISOString()
    );
  }

  // 4. Auto-seed default products if empty
  const countRow = dbInstance.prepare('SELECT COUNT(*) as cnt FROM products').get();
  if (!countRow || countRow.cnt === 0) {
    seedInitialProducts(dbInstance);
  }

  return dbInstance;
}

export function getDb() {
  if (!dbInstance) {
    initDatabase();
  }
  return dbInstance;
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

function hashPin(pin, salt) {
  return crypto.scryptSync(pin, salt, 32).toString('hex');
}

function seedInitialProducts(db) {
  const initialProducts = [
    {
      id: 'lf-001',
      title: 'باقة جوري أحمر ملكي (Royal Crimson)',
      category: 'natural-bouquets',
      price: 25.0,
      oldPrice: 30.0,
      badge: 'الأكثر طلباً ⭐',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      description: 'تنسيق استثنائي من 25 جورية حمراء هولندية فاخرة مع أوراق الأوكالبتوس العطرية، مغلفة بطبقات الورق الحريري الأسود والأبيض وشريط ساتان عريض.',
      flowerType: 'جوري أحمر هولندي كلاسيكي درجة أولى + أوكالبتوس',
      flowerCount: '25 جورية طبيعية',
      dimensions: 'الارتفاع 50 سم × العرض 35 سم',
      packaging: 'تغليف حريري فاخر مقاوم للماء وشريط ساتان عريض',
      freshness: '7 - 10 أيام مع تبديل الماء المنتظم',
      careTips: 'قص أطراف السيقان بزاوية 45 درجة، واستبدل الماء كل يومين وضع الباقة في مكان بارد بعيداً عن أشعة الشمس المباشرة.',
      inStock: 1,
      featured: 1
    },
    {
      id: 'lf-002',
      title: 'بوكس لافندر ونقاء الباستيل (Pastel Elegance)',
      category: 'gift-boxes',
      price: 35.0,
      oldPrice: 42.0,
      badge: 'جديد فاخر ✨',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      description: 'بوكس هدايا دائري أنيق يجمع بين زهور البيبي روز، الليليوم الأبيض، ولمسات اللافندر الطبيعي مع كرت إهداء مخملي خاص.',
      flowerType: 'بيبي روز باستيل، ليليوم عاجي، سنبل لافندر عطري',
      flowerCount: 'تشكيلة كثيفة تضم أكثر من 30 برعماً وزهرة',
      dimensions: 'القطر 28 سم × الارتفاع 32 سم',
      packaging: 'صندوق مخملي فاخر مزود بإسفنجة رطوبة مائية داخلية',
      freshness: '8 - 12 يوماً',
      careTips: 'أضف نصف كوب ماء بارد في وسط البوكس كل يومين لترطيب الإسفنجة والحفاظ على تفتح البراعم.',
      inStock: 1,
      featured: 1
    },
    {
      id: 'lf-003',
      title: 'فازة كريستال توليب وروز (Crystal Dawn)',
      category: 'vases',
      price: 45.0,
      oldPrice: 50.0,
      badge: 'تصميم حصري 💎',
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      description: 'فازة زجاجية كريستالية ثقيلة تضم زهور التوليب الوردي، الجوري الأبيض، وفروع الجيبسوفيلا الناعمة، جاهزة لتزيين أرقى المساحات.',
      flowerType: 'توليب هولندي طبيعي، جوري أبيض، وجيبسوفيلا ناعمة',
      flowerCount: '20 زهرة منسقة باحتراف هندسي',
      dimensions: 'الارتفاع 45 سم × العرض 30 سم',
      packaging: 'فازة كريستال هندسية فاخرة قابلة لإعادة الاستخدام',
      freshness: '6 - 9 أيام',
      careTips: 'حافظ على مستوى الماء نقياً بإضافة قطرة من مغذي الزهور وتغيير الماء كلياً كل يومين.',
      inStock: 1,
      featured: 1
    },
    {
      id: 'lf-004',
      title: 'باقة تخرج ملكية مع وشاح وقبعة (Graduation Glory)',
      category: 'occasions',
      price: 38.0,
      oldPrice: null,
      badge: 'موسم التخرج 🎓',
      image: 'https://images.unsplash.com/photo-1508615039623-a2ed60631f2a?auto=format&fit=crop&w=800&q=80',
      description: 'باقة مصممة خصيصاً لحفلات التخرج تضم أزهار دوار الشمس المشرقة مع البيبي روز الأبيض وتغليف يحمل قبعة تخرج صغيرة وأشرطة تهنئة.',
      flowerType: 'دوار شمس طبيعي، بيبي روز، أستر أبيض وأوكالبتوس',
      flowerCount: '18 زهرة غنية ومبهجة',
      dimensions: 'الارتفاع 55 سم × العرض 40 سم',
      packaging: 'تغليف تخرج خاص بلون كحلي وذهبي مع شريط مطبوع',
      freshness: '7 - 10 أيام',
      careTips: 'ضع الباقة في فازة ماء فور انتهاء الحفل مع إزالة الأوراق المغمورة بالماء.',
      inStock: 1,
      featured: 0
    },
    {
      id: 'lf-005',
      title: 'باقة وايت ليدي الفاخرة (Pure White Lady)',
      category: 'natural-bouquets',
      price: 28.0,
      oldPrice: 32.0,
      badge: 'نقاء وأناقة 🤍',
      image: 'https://images.unsplash.com/photo-1563241527-3004b2968853?auto=format&fit=crop&w=800&q=80',
      description: 'باقة بيضاء نقية تتكون من زهور الليليوم المعطرة، الورد الجوري الأبيض، وأوراق الروسكوس الإيطالي الخضراء لتناسب كافة التهاني والزيارات.',
      flowerType: 'ليليوم عاجي فاخر مع ورد جوري أبيض نقي',
      flowerCount: '22 زهرة وبرعم متفتح تدريجياً',
      dimensions: 'الارتفاع 52 سم × العرض 36 سم',
      packaging: 'تغليف رخامي أبيض مع لمسات روز جولد ناعمة',
      freshness: '8 - 14 يوماً مع تفتح براعم الليليوم تباعاً',
      careTips: 'انزع حبوب اللقاح الصفراء من أسدية الليليوم عند تفتحها لمنع تلطيخ البتلات وإطالة عمر الزهرة.',
      inStock: 1,
      featured: 0
    },
    {
      id: 'lf-006',
      title: 'بوكس القلب المخملي مع شوكولاتة (Velvet Heart)',
      category: 'gift-boxes',
      price: 48.0,
      oldPrice: 55.0,
      badge: 'هدية متكاملة 🍫',
      image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
      description: 'صندوق مخملي فاخر على شكل قلب، مقسوم إلى نصفين: نصف ممتلئ بزهور الجوري الأحمر القاني، والنصف الآخر يضم قطع شوكولاتة سويسرية فاخرة.',
      flowerType: 'جوري أحمر مخملي منتقى حبة حبة',
      flowerCount: '16 جورية منسقة بانتظام قلبي دقيق',
      dimensions: 'العرض 30 سم × العمق 28 سم × الارتفاع 15 سم',
      packaging: 'علبة هدايا قلب مخملي أحمر أو أسود مع غطاء وشريطة',
      freshness: '6 - 9 أيام',
      careTips: 'رش البتلات برذاذ مائي خفيف يومياً وتجنب رش الشوكولاتة.',
      inStock: 1,
      featured: 1
    },
    {
      id: 'lf-007',
      title: 'استاند أكريليك للمناسبات والاستقبال (Golden Welcome)',
      category: 'vases',
      price: 65.0,
      oldPrice: null,
      badge: 'فخامة الاستقبال 👑',
      image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=800&q=80',
      description: 'استاند شفاف من الأكريليك مع قاعدة ذهبية، يعلوه شلال من الزهور الطبيعية بألوان الباستيل والزهري، مثالي لمداخل البيوت واستقبال المواليد.',
      flowerType: 'هيدرانجيا، روز، ليزيانثوس، وفروع خضراء متدلية',
      flowerCount: 'تنسيق شلالي كثيف بأكثر من 40 زهرة',
      dimensions: 'الارتفاع 75 سم × العرض 45 سم',
      packaging: 'استاند أكريليك عالي الشفافية مع صينية مائية مدمجة',
      freshness: '7 - 10 أيام',
      careTips: 'أضف الماء ببطء إلى الصينية المائية المركزية كل يومين.',
      inStock: 1,
      featured: 0
    },
    {
      id: 'lf-008',
      title: 'مسكة عروس كلاسيكية (Bridal Symphony)',
      category: 'occasions',
      price: 50.0,
      oldPrice: 60.0,
      badge: 'ليلة العمر 👰',
      image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=800&q=80',
      description: 'مسكة عروس مصممة بأعلى درجات الدقة والنعومة من زهور الكالا البيضاء والبيبي روز العاجي مع مقبض ملفوف بالحرير ولؤلؤ طبيعي.',
      flowerType: 'كالا بيضاء نادرة، روز أوف وايت، وقطرات اللؤلؤ',
      flowerCount: 'باقة دائرية متماسكة وناعمة جداً',
      dimensions: 'القطر 24 سم × الارتفاع 28 سم',
      packaging: 'مقبض حريري مريح لليد مع خرز لؤلؤي أنيق',
      freshness: 'تُجهز قبل المناسبة بساعات لضمان ذروة النضارة',
      careTips: 'احفظ المسكة في مكان مبرد حتى موعد الزفاف مع وضع أطراف السيقان في قليل من الماء.',
      inStock: 1,
      featured: 0
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO products (
      id, title, category, price, oldPrice, badge, image, description,
      flowerType, flowerCount, dimensions, packaging, freshness, careTips,
      inStock, featured, createdAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  const now = new Date().toISOString();
  for (const p of initialProducts) {
    stmt.run(
      p.id, p.title, p.category, p.price, p.oldPrice, p.badge, p.image, p.description,
      p.flowerType, p.flowerCount, p.dimensions, p.packaging, p.freshness, p.careTips,
      p.inStock, p.featured, now
    );
  }
}

// --- Data Access Objects ---

export const ConfigDb = {
  get() {
    const row = getDb().prepare('SELECT data FROM config WHERE id = 1').get();
    return row ? JSON.parse(row.data) : null;
  },
  update(newConfig) {
    const current = this.get() || {};
    const merged = { ...current, ...newConfig };
    getDb().prepare('UPDATE config SET data = ?, updatedAt = ? WHERE id = 1').run(
      JSON.stringify(merged),
      new Date().toISOString()
    );
    return merged;
  }
};

export const ProductsDb = {
  getAll() {
    return getDb().prepare('SELECT * FROM products ORDER BY featured DESC, createdAt DESC').all().map(p => ({
      ...p,
      inStock: Boolean(p.inStock),
      featured: Boolean(p.featured),
      images: p.images ? JSON.parse(p.images) : (p.image ? [p.image] : [])
    }));
  },
  getById(id) {
    const p = getDb().prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!p) return null;
    return {
      ...p,
      inStock: Boolean(p.inStock),
      featured: Boolean(p.featured),
      images: p.images ? JSON.parse(p.images) : (p.image ? [p.image] : [])
    };
  },
  create(prod) {
    const now = new Date().toISOString();
    const id = prod.id || `lf-${Date.now()}`;
    const imagesList = Array.isArray(prod.images) && prod.images.length > 0
      ? prod.images
      : (prod.image ? [prod.image] : []);
    const imagesJson = JSON.stringify(imagesList);
    const primaryImage = imagesList[0] || prod.image || '';

    getDb().prepare(`
      INSERT INTO products (
        id, title, category, price, oldPrice, badge, image, images, description,
        flowerType, flowerCount, dimensions, packaging, freshness, careTips,
        inStock, featured, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, prod.title, prod.category, prod.price, prod.oldPrice || null,
      prod.badge || '', primaryImage, imagesJson, prod.description || '',
      prod.flowerType || '', prod.flowerCount || '', prod.dimensions || '',
      prod.packaging || '', prod.freshness || '', prod.careTips || '',
      prod.inStock ? 1 : 0, prod.featured ? 1 : 0, now
    );
    return this.getById(id);
  },
  update(id, prod) {
    const current = this.getById(id);
    if (!current) return null;
    const merged = { ...current, ...prod };
    const imagesList = Array.isArray(merged.images) && merged.images.length > 0
      ? merged.images
      : (merged.image ? [merged.image] : []);
    const imagesJson = JSON.stringify(imagesList);
    const primaryImage = imagesList[0] || merged.image || '';

    getDb().prepare(`
      UPDATE products SET
        title = ?, category = ?, price = ?, oldPrice = ?, badge = ?,
        image = ?, images = ?, description = ?, flowerType = ?, flowerCount = ?,
        dimensions = ?, packaging = ?, freshness = ?, careTips = ?,
        inStock = ?, featured = ?
      WHERE id = ?
    `).run(
      merged.title, merged.category, merged.price, merged.oldPrice, merged.badge,
      primaryImage, imagesJson, merged.description, merged.flowerType, merged.flowerCount,
      merged.dimensions, merged.packaging, merged.freshness, merged.careTips,
      merged.inStock ? 1 : 0, merged.featured ? 1 : 0, id
    );
    return this.getById(id);
  },
  delete(id) {
    getDb().prepare('DELETE FROM products WHERE id = ?').run(id);
    return true;
  }
};

export const OrdersDb = {
  getAll() {
    return getDb().prepare('SELECT * FROM orders ORDER BY id DESC').all().map(o => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
    }));
  },
  getById(id) {
    const o = getDb().prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!o) return null;
    return {
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
    };
  },
  getByOrderNumber(orderNumber) {
    const o = getDb().prepare('SELECT * FROM orders WHERE orderNumber = ?').get(orderNumber);
    if (!o) return null;
    return {
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
    };
  },
  create(order) {
    const now = new Date().toISOString();
    const countRow = getDb().prepare('SELECT COUNT(*) as count FROM orders').get();
    const seq = (countRow.count + 1).toString().padStart(3, '0');
    const orderNumber = order.orderNumber || `LF-26-${seq}`;
    const itemsJson = typeof order.items === 'string' ? order.items : JSON.stringify(order.items || []);

    const res = getDb().prepare(`
      INSERT INTO orders (
        orderNumber, buyerName, buyerPhone, recipientName, recipientPhone,
        city, detailedAddress, deliveryDate, deliveryTime, exactTime, locationUrl,
        fulfillmentType, giftCardMessage, giftCardSign, orderNotes,
        items, subtotal, deliveryFee, total, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderNumber, order.buyerName, order.buyerPhone,
      order.recipientName || order.buyerName,
      order.recipientPhone || order.buyerPhone,
      order.city, order.detailedAddress,
      order.deliveryDate || '', order.deliveryTime || '',
      order.exactTime || '', order.locationUrl || '',
      order.fulfillmentType || 'delivery',
      order.giftCardMessage || '', order.giftCardSign || '',
      order.orderNotes || '', itemsJson,
      order.subtotal || 0, order.deliveryFee || 0, order.total || 0,
      order.status || 'new', now
    );
    return res.lastInsertRowid;
  },
  updateStatus(id, status) {
    getDb().prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    return this.getById(id);
  },
  delete(id) {
    getDb().prepare('DELETE FROM orders WHERE id = ?').run(id);
    return true;
  }
};

export const AuthDb = {
  verifyPin(pin) {
    const row = getDb().prepare('SELECT pinHash, salt FROM auth WHERE id = 1').get();
    if (!row) return false;
    const computed = hashPin(pin, row.salt);
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(row.pinHash));
  },
  setPin(newPin) {
    const salt = crypto.randomBytes(16).toString('hex');
    const pinHash = hashPin(newPin, salt);
    getDb().prepare('UPDATE auth SET pinHash = ?, salt = ?, updatedAt = ? WHERE id = 1').run(
      pinHash, salt, new Date().toISOString()
    );
    return true;
  }
};
