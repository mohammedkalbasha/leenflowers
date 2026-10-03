
/**
 * Standalone Dashboard Bundle for Leen Flowers (متجر لين للزهور)
 * Self-contained: works on file://, http://, and all production servers without CORS.
 */
(function() {
  'use strict';

  /**
 * Unified API Client for Leen Flowers (متجر لين للزهور)
 * Connects storefront and dashboard to REST API & SQLite with seamless offline fallback
 */

const STORAGE_KEY_AUTH = 'leen_admin_auth_pin';

const ApiClient = {
  baseUrl: (typeof window !== 'undefined' && window.location.origin && window.location.protocol.startsWith('http'))
    ? window.location.origin
    : 'http://localhost:3000',

  getAuthPin() {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem(STORAGE_KEY_AUTH) || localStorage.getItem(STORAGE_KEY_AUTH) || '';
  },

  setAuthPin(pin, remember = false) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY_AUTH, pin);
    if (remember) localStorage.setItem(STORAGE_KEY_AUTH, pin);
  },

  clearAuthPin() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  },

  isAuthenticated() {
    return Boolean(this.getAuthPin());
  },

  async request(method, path, body = null, requireAuth = false) {
    const pin = this.getAuthPin();
    const headers = {
      'Content-Type': 'application/json'
    };
    if (pin) {
      headers['x-admin-pin'] = pin;
    }

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const contentType = res.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        throw new Error(data && data.error ? data.error : `HTTP ${res.status}`);
      }
      return data;
    } catch (err) {
      console.warn(`[ApiClient] Request ${method} ${path} error:`, err.message);
      throw err;
    }
  },

  // --- Auth Endpoints ---
  async login(pin, remember = false) {
    try {
      const res = await this.request('POST', '/api/auth/login', { pin });
      if (res.success) {
        this.setAuthPin(pin, remember);
        return { success: true };
      }
      return { success: false, error: res.error || 'رمز الدخول غير صحيح' };
    } catch (err) {
      // Local fallback if server unreachable
      if (pin === '1234') {
        this.setAuthPin(pin, remember);
        return { success: true, offline: true };
      }
      return { success: false, error: err.message };
    }
  },

  async changePin(newPin) {
    return this.request('POST', '/api/auth/change-pin', { newPin }, true);
  },

  // --- Config Endpoints ---
  async getConfig() {
    try {
      return await this.request('GET', '/api/config');
    } catch (_) {
      return null;
    }
  },

  async saveConfig(newConfig) {
    return this.request('PUT', '/api/config', newConfig, true);
  },

  // --- Products Endpoints ---
  async getProducts() {
    try {
      return await this.request('GET', '/api/products');
    } catch (_) {
      return null;
    }
  },

  async createProduct(product) {
    return this.request('POST', '/api/products', product, true);
  },

  async updateProduct(id, product) {
    return this.request('PUT', `/api/products/${id}`, product, true);
  },

  async deleteProduct(id) {
    return this.request('DELETE', `/api/products/${id}`, null, true);
  },

  // --- Orders Endpoints ---
  async getOrders() {
    try {
      return await this.request('GET', '/api/orders', null, true);
    } catch (_) {
      return [];
    }
  },

  async createOrder(orderData) {
    try {
      return await this.request('POST', '/api/orders', orderData);
    } catch (err) {
      console.warn('API createOrder failed, generating offline order ID:', err.message);
      // Offline fallback: generate client order number
      const seq = Math.floor(100 + Math.random() * 900);
      return {
        id: Date.now(),
        orderNumber: `LF-26-${seq}`,
        ...orderData,
        createdAt: new Date().toISOString(),
        offline: true
      };
    }
  },

  async updateOrderStatus(id, status) {
    return this.request('PUT', `/api/orders/${id}/status`, { status }, true);
  },

  async deleteOrder(id) {
    return this.request('DELETE', `/api/orders/${id}`, null, true);
  },

  // --- Stats Endpoint ---
  async getStats() {
    try {
      return await this.request('GET', '/api/stats', null, true);
    } catch (_) {
      return null;
    }
  }
};


  /**
 * Store Configuration for Leen Flowers (متجر لين للزهور)
 * Can be overridden in localStorage or via the dashboard
 */

const STORAGE_KEY_CONFIG = 'leen_flowers_config';

const defaultStoreConfig = {
  name: 'لين للزهور - Leen Flowers',
  tagline: 'زهور تُحاكي مشاعرك بأرقى تفاصيلها 🌸',
  description: 'متجر متخصص بأرقى باقات الورد الطبيعي، بوكسات الهدايا الفاخرة، وتنسيق مناسباتكم السعيدة.',
  defaultWhatsApp: '0797035039',
  countryCode: '962',
  instagram: 'https://www.instagram.com/leen_flower11',
  facebook: 'https://www.facebook.com/p/Leen-Flowers-100090007161366/',
  currency: 'د.أ',
  currencyCode: 'JOD',
  activeTheme: 'blush', // blush | lavender | midnight
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

const StoreConfig = {
  ...defaultStoreConfig,

  /**
   * Cleans and formats phone number for WhatsApp wa.me links
   * e.g., "0797035039" -> "962797035039"
   */
  formatWhatsAppNumber(phone) {
    if (!phone) return '962797035039';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('00')) {
      clean = clean.substring(2);
    }
    if (clean.startsWith('07')) {
      clean = '962' + clean.substring(1);
    } else if (clean.startsWith('7') && clean.length === 9) {
      clean = '962' + clean;
    }
    return clean;
  },

  /**
   * Load store configuration from localStorage
   */
  load() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
        if (stored) {
          const parsed = JSON.parse(stored);
          Object.assign(this, parsed);
        }
      } catch (e) {
        console.warn('Could not load config from localStorage', e);
      }
    }
    return this;
  },

  /**
   * Save store configuration to localStorage
   */
  save(newConfig = {}) {
    Object.assign(this, newConfig);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this));
      } catch (e) {
        console.warn('Could not save config to localStorage', e);
      }
    }
    return this;
  },

  /**
   * Reset store configuration to factory defaults
   */
  reset() {
    Object.assign(this, defaultStoreConfig);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY_CONFIG);
    }
    return this;
  }
};


  /**
 * Products Data Repository for Leen Flowers (متجر لين للزهور)
 * Ready to be migrated to a backend database in Phase 2
 */

const STORAGE_KEY_PRODUCTS = 'leen_flowers_products';

const initialCategories = [
  { id: 'all', name: 'جميع الزهور والهدايا', icon: '🌸' },
  { id: 'natural-bouquets', name: 'باقات ورد طبيعي', icon: '🌹' },
  { id: 'gift-boxes', name: 'بوكسات ورد وهدايا', icon: '🎁' },
  { id: 'vases', name: 'فازات واستاندات فاخرة', icon: '🏺' },
  { id: 'occasions', name: 'مناسبات وتخرج وأعراس', icon: '🎓' }
];

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
    inStock: true,
    featured: true
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
    inStock: true,
    featured: true
  },
  {
    id: 'lf-003',
    title: 'فازة كريستال توليب وروز (Crystal Dawn)',
    category: 'vases',
    price: 45.0,
    oldPrice: 50.0,
    badge: 'تصميم حصري 💎',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    description: 'فازة زجاجية أسطوانية فاخرة تحتوي على مزيج ساحر من أزهار التوليب الوردية والجوري الهولندي مع إضاءة خفية تضفي سحراً على المكان.',
    flowerType: 'توليب هولندي طبيعي وردي وجوري باودر',
    flowerCount: '20 زهرة توليب وجوري منتقاة بدقة',
    dimensions: 'الارتفاع 45 سم × العرض 30 سم (تشمل الفازة)',
    packaging: 'فازة زجاجية كريستالية ثقيلة هدية مع التنسيق',
    freshness: '6 - 9 أيام',
    careTips: 'التوليب يفضل الماء المثلج قليلاً؛ قم بتغيير الماء يومياً لإطالة عمر الزهرة.',
    inStock: true,
    featured: true
  },
  {
    id: 'lf-004',
    title: 'باقة تخرج ملكية مع وشاح وقبعة (Graduation Glory)',
    category: 'occasions',
    price: 30.0,
    oldPrice: 35.0,
    badge: 'موسم التخرج 🎓',
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80',
    description: 'باقة تخرج راقية بتدرجات الأبيض والأصفر والذهبي، مصممة خصيصاً مع مجسم قبعة تخرج صغيرة وشريط مطبوع بعبارات التهنئة.',
    flowerType: 'جوري أصفر وذهبي، زهور الجربيرا، ونبتة السوليداجو',
    flowerCount: '22 زهرة طبيعية',
    dimensions: 'الارتفاع 55 سم × العرض 40 سم',
    packaging: 'تغليف ذهبي وأسود ملكي مع وشاح تخرج مصغر',
    freshness: '7 - 10 أيام',
    careTips: 'ضع الباقة في فازة ماء بارد فور استلامها بعد جلسة التصوير والاحتفال.',
    inStock: true,
    featured: true
  },
  {
    id: 'lf-005',
    title: 'باقة وايت ليدي الفاخرة (Pure White Lady)',
    category: 'natural-bouquets',
    price: 28.0,
    oldPrice: 32.0,
    badge: 'نقاء وهدوء 🤍',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
    description: 'مزيج فاخر من الجوري الأبيض وزهور الجيبسوفيليا (نَفَس الطفل) بتغليف أبيض عاجي ناعم يُعبر عن أسمى معاني التقدير والنقاء.',
    flowerType: 'جوري أبيض ملكي وزهور الجيبسوفيليا الناعمة',
    flowerCount: '24 زهرة جوري محاطة بسحاب الجيبسوفيليا',
    dimensions: 'الارتفاع 48 سم × العرض 36 سم',
    packaging: 'ورق كوري عاجي ناعم الملمس ضد البلل',
    freshness: '8 - 11 يوماً',
    careTips: 'احرص على إزالة أي أوراق ميتة سفلية قبل وضعها في الفازة ليبقى الماء نظيفاً ونقياً.',
    inStock: true,
    featured: false
  },
  {
    id: 'lf-006',
    title: 'بوكس القلب المخملي مع شوكولاتة (Velvet Heart)',
    category: 'gift-boxes',
    price: 40.0,
    oldPrice: 48.0,
    badge: 'هدية متكاملة 🍫',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
    description: 'صندوق مخملي أنيق على شكل قلب مقسوم لجانبين: جانب مليء بالورد الجوري الأحمر الفاخر، وجانب يضم تشكيلة شوكولاتة سويسرية فاخرة.',
    flowerType: 'جوري أحمر قاني مجدول بعناية',
    flowerCount: '18 إلى 20 زهرة جوري منتقاة بدقة',
    dimensions: 'الصندوق: 30 سم × 30 سم',
    packaging: 'صندوق مخملي هارت بوكس أحمر نبيذي فاخر',
    freshness: '8 - 10 أيام للورد، والشوكولاتة طازجة بصلاحية سنة',
    careTips: 'رش قطرات ماء رذاذية خفيفة على رؤوس الورد كل صباح لتغذيتها.',
    inStock: true,
    featured: true
  },
  {
    id: 'lf-007',
    title: 'استاند أكريليك للمناسبات والاستقبال (Golden Welcome)',
    category: 'vases',
    price: 60.0,
    oldPrice: 70.0,
    badge: 'مناسبات خاصة 🌟',
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=800&q=80',
    description: 'استاند عصري شفاف عالي الجودة بتنسيق زهور كثيف وراقي، مخصص لمداخل الحفلات واستقبال المواليد مع تخصيص عبارة الأكريليك حسب رغبتك.',
    flowerType: 'تشكيلة زهور هيدرانجيا، أوركيد، بيبي روز، وجوري',
    flowerCount: 'تنسيق كثيف فاخر (أكثر من 40 زهرة)',
    dimensions: 'الارتفاع 75 سم × العرض 45 سم',
    packaging: 'استاند أكريليك كريستالي شفاف مع لوح كتابة بالاسم',
    freshness: '7 - 9 أيام',
    careTips: 'تم تزويد قاعدة الاستاند بمادة مرطبة تحفظ نضارة الزهور طوال فترة الحفل.',
    inStock: true,
    featured: false
  },
  {
    id: 'lf-008',
    title: 'مسكة عروس كلاسيكية (Bridal Symphony)',
    category: 'occasions',
    price: 55.0,
    oldPrice: 65.0,
    badge: 'أعراس 💍',
    image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=800&q=80',
    description: 'مسكة عروس بتصميم كلاسيكي دائري فائق الدقة من الجوري الأوف وايت والكالّا ليلي مع مقبض ملفوف بالدانتيل واللؤلؤ.',
    flowerType: 'جوري أوف وايت مستورد، كالّا ليلي، أوراق فضية',
    flowerCount: '25 زهرة منسقة بدقة هندسية دائرية متناسقة',
    dimensions: 'القطر 26 سم، المقبض 16 سم',
    packaging: 'مقبض حريري ساتان مع تطريز دانتيل وأزرار لؤلؤ',
    freshness: 'يتم تجهيزها صباح يوم الزفاف لتبقى في أبهى نضارتها',
    careTips: 'تُحفظ في وعاء ماء صغير حتى موعد جلسة التصوير والزفاف.',
    inStock: true,
    featured: false
  }
];

function getProducts() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read products from localStorage', e);
    }
  }
  return [...initialProducts];
}

function getProductById(id) {
  const products = getProducts();
  return products.find(p => p.id === id);
}

function saveProducts(productsList) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(productsList));
    } catch (e) {
      console.warn('Could not save products to localStorage', e);
    }
  }
  return productsList;
}

function resetDefaultProducts() {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
  }
  return [...initialProducts];
}


  /**
 * Dashboard Logic for Leen Flowers (متجر لين للزهور)
 * Prepares the admin interface for Phase 2 Database integration
 */




const STORAGE_KEY_ORDERS = 'leen_flowers_orders';

document.addEventListener('DOMContentLoaded', () => {
  StoreConfig.load();

  initDashboardThemeSwitcher();
  initSettingsForm();
  initProductsTable();
  initOrdersTable();
  updateDashboardStats();
});

/**
 * Theme switcher inside dashboard
 */
function initDashboardThemeSwitcher() {
  const rootHtml = document.documentElement;
  const themeBtns = document.querySelectorAll('[data-set-theme]');
  const current = StoreConfig.activeTheme || 'blush';

  rootHtml.setAttribute('data-theme', current);
  themeBtns.forEach(btn => {
    if (btn.getAttribute('data-set-theme') === current) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.addEventListener('click', () => {
      const chosen = btn.getAttribute('data-set-theme');
      rootHtml.setAttribute('data-theme', chosen);
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      StoreConfig.save({ activeTheme: chosen });
      showToast(`تم تبديل المظهر إلى: ${btn.textContent}`);
    });
  });
}

/**
 * Store & WhatsApp Settings Form
 */
function initSettingsForm() {
  const form = document.getElementById('settings-form');
  const nameInput = document.getElementById('cfg-store-name');
  const phoneInput = document.getElementById('cfg-whatsapp-phone');
  const igInput = document.getElementById('cfg-instagram-url');
  const fbInput = document.getElementById('cfg-facebook-url');

  if (nameInput) nameInput.value = StoreConfig.name || '';
  if (phoneInput) phoneInput.value = StoreConfig.defaultWhatsApp || '';
  if (igInput) igInput.value = StoreConfig.instagram || '';
  if (fbInput) fbInput.value = StoreConfig.facebook || '';

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const updated = {
        name: nameInput.value.trim(),
        defaultWhatsApp: phoneInput.value.trim(),
        instagram: igInput.value.trim(),
        facebook: fbInput.value.trim()
      };

      StoreConfig.save(updated);
      updateDashboardStats();
      showToast('تم حفظ إعدادات المتجر ورقم الواتساب بنجاح! 💾');
    });
  }
}

/**
 * Products Table & Add Product Modal
 */
function initProductsTable() {
  const tbody = document.getElementById('dashboard-products-tbody');
  const resetBtn = document.getElementById('btn-reset-products');
  const openAddModalBtn = document.getElementById('btn-open-add-product');
  const addModalOverlay = document.getElementById('add-product-modal-overlay');
  const closeAddModalBtn = document.getElementById('close-add-modal-btn');
  const addForm = document.getElementById('add-product-form');

  function renderRows() {
    const products = getProducts();
    if (!tbody) return;

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">لا توجد منتجات مسجلة. اضغط على استعادة الافتراضية.</td></tr>`;
      return;
    }

    const catMap = {
      'natural-bouquets': 'باقات طبيعية',
      'gift-boxes': 'بوكسات وهدايا',
      'vases': 'فازات واستاندات',
      'occasions': 'مناسبات وتخرج'
    };

    tbody.innerHTML = products
      .map(
        p => `
        <tr data-id="${p.id}">
          <td>
            <img src="${p.image}" alt="${p.title}" class="table-product-thumb" loading="lazy">
          </td>
          <td>
            <strong>${p.title}</strong>
            ${p.badge ? `<br><small style="color:var(--primary);">${p.badge}</small>` : ''}
          </td>
          <td>${catMap[p.category] || p.category}</td>
          <td><strong style="color:var(--primary);">${Number(p.price).toFixed(2)} د.أ</strong></td>
          <td>
            <span class="status-badge ${p.inStock !== false ? 'in-stock' : 'out-stock'}">
              ${p.inStock !== false ? 'متوفر للطلب' : 'غير متوفر'}
            </span>
          </td>
          <td>
            <button type="button" class="table-action-btn" data-action="toggle-stock" data-id="${p.id}" title="تبديل التوفر">
              ${p.inStock !== false ? 'تعطيل' : 'تفعيل'}
            </button>
            <button type="button" class="table-action-btn delete" data-action="delete" data-id="${p.id}" title="حذف المنتج">
              حذف 🗑️
            </button>
          </td>
        </tr>
      `
      )
      .join('');

    // Toggle stock
    tbody.querySelectorAll('[data-action="toggle-stock"]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        const list = getProducts();
        const item = list.find(x => x.id === id);
        if (item) {
          item.inStock = item.inStock === false ? true : false;
          saveProducts(list);
          renderRows();
          updateDashboardStats();
          showToast(`تم تحديث حالة توفر "${item.title}"`);
        }
      });
    });

    // Delete product
    tbody.querySelectorAll('[data-action="delete"]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        if (confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج من المتجر؟')) {
          const list = getProducts().filter(x => x.id !== id);
          saveProducts(list);
          renderRows();
          updateDashboardStats();
          showToast('تم حذف المنتج بنجاح 🗑️');
        }
      });
    });
  }

  renderRows();

  // Reset to default products
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('هل تريد استعادة قائمة المنتجات والباقات الأصلية؟')) {
        resetDefaultProducts();
        renderRows();
        updateDashboardStats();
        showToast('تمت استعادة المنتجات الافتراضية بنجاح 🌸');
      }
    });
  }

  // Open / Close Add Modal
  if (openAddModalBtn && addModalOverlay) {
    openAddModalBtn.addEventListener('click', () => {
      addModalOverlay.classList.add('active');
    });
  }

  if (closeAddModalBtn && addModalOverlay) {
    closeAddModalBtn.addEventListener('click', () => {
      addModalOverlay.classList.remove('active');
    });
  }

  // Add Product Form Submit
  if (addForm) {
    addForm.addEventListener('submit', e => {
      e.preventDefault();
      const newProd = {
        id: 'lf-' + Date.now().toString(36),
        title: document.getElementById('new-prod-title').value.trim(),
        category: document.getElementById('new-prod-category').value,
        price: parseFloat(document.getElementById('new-prod-price').value),
        badge: document.getElementById('new-prod-badge').value.trim() || null,
        image: document.getElementById('new-prod-image').value.trim(),
        description: document.getElementById('new-prod-desc').value.trim(),
        inStock: true
      };

      const list = getProducts();
      list.unshift(newProd);
      saveProducts(list);

      addForm.reset();
      addModalOverlay.classList.remove('active');
      renderRows();
      updateDashboardStats();
      showToast(`تمت إضافة "${newProd.title}" إلى المتجر بنجاح! ✨`);
    });
  }
}

/**
 * Orders Table
 */
function initOrdersTable() {
  const tbody = document.getElementById('dashboard-orders-tbody');
  const clearBtn = document.getElementById('btn-clear-orders');

  function renderOrders() {
    if (!tbody) return;
    try {
      const orders = JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]');
      if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">لا توجد طلبات مسجلة بعد. عند إتمام طلب من المتجر سيظهر هنا مباشرة.</td></tr>`;
        return;
      }

      tbody.innerHTML = orders
        .map(o => {
          const itemsSummary = (o.items || [])
            .map(i => `${i.qty}x ${i.title}`)
            .join(', ');
          const dateStr = new Date(o.date).toLocaleDateString('ar-JO', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return `
          <tr>
            <td><strong>#${o.id}</strong></td>
            <td><small>${dateStr}</small></td>
            <td>
              <strong>${o.customerName}</strong><br>
              <small><a href="tel:${o.customerPhone}" style="color:var(--primary);">${o.customerPhone}</a></small>
            </td>
            <td>
              ${o.recipientName ? `<strong>${o.recipientName}</strong><br>` : ''}
              <small>${o.city || 'عمان'}</small>
            </td>
            <td style="max-width:240px; font-size:0.85rem;">${itemsSummary || 'منتجات'}</td>
            <td><strong style="color:var(--primary);">${Number(o.subtotal).toFixed(2)} د.أ</strong></td>
            <td style="max-width:200px; font-size:0.82rem; color:var(--text-muted);">${o.cardMessage ? `"${o.cardMessage}"` : '—'}</td>
          </tr>
        `;
        })
        .join('');
    } catch (err) {
      console.warn('Could not read orders', err);
    }
  }

  renderOrders();

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('هل أنت متأكد من مسح سجل الطلبات التجريبي؟')) {
        localStorage.removeItem(STORAGE_KEY_ORDERS);
        renderOrders();
        updateDashboardStats();
        showToast('تم مسح سجل الطلبات التجريبي');
      }
    });
  }
}

/**
 * Update Top Metric Badges
 */
function updateDashboardStats() {
  const prodNum = document.getElementById('stat-total-products');
  const ordersNum = document.getElementById('stat-total-orders');
  const revNum = document.getElementById('stat-total-revenue');
  const phoneDisplay = document.getElementById('stat-active-phone');

  const products = getProducts();
  if (prodNum) prodNum.textContent = products.length;

  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]');
  } catch (e) {}

  if (ordersNum) ordersNum.textContent = orders.length;

  const totalRev = orders.reduce((sum, o) => sum + (Number(o.subtotal) || 0), 0);
  if (revNum) revNum.textContent = `${totalRev.toFixed(2)} د.أ`;

  if (phoneDisplay) phoneDisplay.textContent = StoreConfig.defaultWhatsApp || '0797035039';
}

/**
 * Toast Notification Helper
 */
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById('toast-notice');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}


})();
