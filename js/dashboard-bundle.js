
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
 * Includes multi-image photo albums for each floral arrangement
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
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548094891-c4969f667c49?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80'
    ],
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
    images: [
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80'
    ],
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
    images: [
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'
    ],
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
    image: 'https://images.unsplash.com/photo-1508615039623-a2ed60631f2a?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1508615039623-a2ed60631f2a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
    ],
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
    image: 'https://images.unsplash.com/photo-1563241527-3004b2968853?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1563241527-3004b2968853?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=800&q=80'
    ],
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
    images: [
      'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
    ],
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
    images: [
      'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80'
    ],
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
    images: [
      'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563241527-3004b2968853?auto=format&fit=crop&w=800&q=80'
    ],
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
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
}

function resetDefaultProducts() {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
  }
  return [...initialProducts];
}


  /**
 * Dashboard Logic for Leen Flowers (متجر لين للزهور)
 * Phase 2: Full SQLite REST API, PIN Protection, Live Orders, and Printable Vouchers
 */





document.addEventListener('DOMContentLoaded', () => {
  StoreConfig.load();

  initDashboardThemeSwitcher();
  initAuthProtection();
  initSettingsForm();
  initProductsTable();
  initOrdersTable();
  initPrintModal();
  updateDashboardStats();
});

/**
 * PIN-based Authentication & Lock Screen
 */
function initAuthProtection() {
  const lockOverlay = document.getElementById('dashboard-lock-overlay');
  const pinForm = document.getElementById('admin-pin-form');
  const pinInput = document.getElementById('admin-pin-input');
  const errorMsg = document.getElementById('lock-error-msg');
  const logoutBtn = document.getElementById('btn-admin-logout');
  const changePinBtn = document.getElementById('btn-save-new-pin');
  const newPinInput = document.getElementById('cfg-new-pin');

  // Check initial state
  if (ApiClient.isAuthenticated()) {
    if (lockOverlay) lockOverlay.classList.remove('active');
  } else {
    if (lockOverlay) lockOverlay.classList.add('active');
  }

  // Handle Login Submit
  if (pinForm) {
    pinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pin = pinInput.value.trim();
      if (!pin) return;

      if (errorMsg) errorMsg.style.display = 'none';

      try {
        const res = await ApiClient.login(pin, true);
        if (res.success) {
          if (lockOverlay) lockOverlay.classList.remove('active');
          pinInput.value = '';
          showToast('مرحباً بك! تم الدخول بنجاح 🌸');
          // Reload fresh data from database
          refreshAllData();
        } else {
          if (errorMsg) {
            errorMsg.textContent = res.error || 'رمز الدخول غير صحيح';
            errorMsg.style.display = 'block';
          }
        }
      } catch (err) {
        if (errorMsg) {
          errorMsg.textContent = err.message || 'حدث خطأ في الاتصال بالخادم';
          errorMsg.style.display = 'block';
        }
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      ApiClient.clearAuthPin();
      if (lockOverlay) lockOverlay.classList.add('active');
      showToast('تم قفل لوحة التحكم بنجاح 🔒');
    });
  }

  // Handle Change PIN
  if (changePinBtn && newPinInput) {
    changePinBtn.addEventListener('click', async () => {
      const newPin = newPinInput.value.trim();
      if (!newPin || newPin.length < 4) {
        return alert('يرجى إدخال رمز سري مكون من 4 أرقام على الأقل');
      }
      try {
        await ApiClient.changePin(newPin);
        ApiClient.setAuthPin(newPin, true);
        newPinInput.value = '';
        showToast('تم تحديث رمز المرور (PIN) بنجاح! 🔑');
      } catch (err) {
        alert('تعذر تحديث الرمز: ' + err.message);
      }
    });
  }
}

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

  async function loadConfigValues() {
    let cfg = null;
    try {
      cfg = await ApiClient.getConfig();
    } catch (_) {}
    if (!cfg) cfg = StoreConfig;

    if (nameInput) nameInput.value = cfg.name || '';
    if (phoneInput) phoneInput.value = cfg.defaultWhatsApp || '';
    if (igInput) igInput.value = cfg.instagram || '';
    if (fbInput) fbInput.value = cfg.facebook || '';
  }

  loadConfigValues();

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const updated = {
        name: nameInput.value.trim(),
        defaultWhatsApp: phoneInput.value.trim(),
        instagram: igInput.value.trim(),
        facebook: fbInput.value.trim()
      };

      try {
        await ApiClient.saveConfig(updated);
      } catch (_) {}
      StoreConfig.save(updated);
      updateDashboardStats();
      showToast('تم حفظ إعدادات المتجر ورقم الواتساب في قاعدة البيانات! 💾');
    });
  }
}

/**
 * Products Table & Add Product Modal
 */
let cachedProducts = [];

function initProductsTable() {
  const tbody = document.getElementById('dashboard-products-tbody');
  const resetBtn = document.getElementById('btn-reset-products');
  const openAddModalBtn = document.getElementById('btn-open-add-product');
  const addModalOverlay = document.getElementById('add-product-modal-overlay');
  const closeAddModalBtn = document.getElementById('close-add-modal-btn');
  const addForm = document.getElementById('add-product-form');

  async function renderProducts() {
    if (!tbody) return;
    try {
      const apiProds = await ApiClient.getProducts();
      if (apiProds && Array.isArray(apiProds)) {
        cachedProducts = apiProds;
      } else {
        cachedProducts = getProducts();
      }
    } catch (_) {
      cachedProducts = getProducts();
    }

    if (cachedProducts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">لا توجد منتجات حالياً.</td></tr>`;
      return;
    }

    const catMap = {
      'natural-bouquets': 'باقات ورد طبيعي',
      'gift-boxes': 'بوكسات ورد وهدايا',
      'vases': 'فازات واستاندات',
      'occasions': 'أعراس ومناسبات'
    };

    tbody.innerHTML = cachedProducts.map(p => `
      <tr data-id="${p.id}">
        <td>
          <img src="${p.image}" alt="${p.title}" class="dash-prod-thumb" onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100'">
        </td>
        <td>
          <div style="font-weight:700;">${p.title}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${p.badge || ''}</div>
        </td>
        <td>
          <span style="font-size:0.82rem; background:var(--badge-bg); color:var(--primary); padding:3px 8px; border-radius:12px;">
            ${catMap[p.category] || p.category}
          </span>
        </td>
        <td style="font-weight:700; color:var(--primary);">
          ${parseFloat(p.price).toFixed(2)} د.أ
        </td>
        <td>
          <button type="button" class="dash-btn-stock ${p.inStock ? 'in-stock' : 'out-stock'}" data-action="toggle-stock" data-id="${p.id}">
            ${p.inStock ? 'متوفر ✓' : 'غير متوفر ✕'}
          </button>
        </td>
        <td>
          <button type="button" class="dash-btn-del" data-action="delete" data-id="${p.id}" title="حذف المنتج">
            🗑️ حذف
          </button>
        </td>
      </tr>
    `).join('');

    updateDashboardStats();
  }

  renderProducts();

  // Action clicks (Toggle stock / Delete)
  if (tbody) {
    tbody.addEventListener('click', async e => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const id = btn.dataset.id;

      if (action === 'toggle-stock') {
        const prod = cachedProducts.find(x => x.id === id);
        if (prod) {
          prod.inStock = !prod.inStock;
          try {
            await ApiClient.updateProduct(id, { inStock: prod.inStock });
          } catch (_) {}
          saveProducts(cachedProducts);
          renderProducts();
          showToast(`تم تحديث حالة توفر المنتج: ${prod.title}`);
        }
      }

      if (action === 'delete') {
        if (confirm('هل أنت متأكد من رغبتك بحذف هذا المنتج؟')) {
          try {
            await ApiClient.deleteProduct(id);
          } catch (_) {}
          cachedProducts = cachedProducts.filter(x => x.id !== id);
          saveProducts(cachedProducts);
          renderProducts();
          showToast('تم حذف المنتج بنجاح 🗑️');
        }
      }
    });
  }

  // Open modal
  if (openAddModalBtn && addModalOverlay) {
    openAddModalBtn.addEventListener('click', () => {
      addModalOverlay.classList.add('active');
    });
  }

  // Close modal
  if (closeAddModalBtn && addModalOverlay) {
    closeAddModalBtn.addEventListener('click', () => {
      addModalOverlay.classList.remove('active');
    });
  }

  // Form submit (Add product)
  if (addForm) {
    addForm.addEventListener('submit', async e => {
      e.preventDefault();
      const title = document.getElementById('new-prod-title').value.trim();
      const category = document.getElementById('new-prod-category').value;
      const price = parseFloat(document.getElementById('new-prod-price').value);
      const badge = document.getElementById('new-prod-badge').value.trim();
      const image = document.getElementById('new-prod-image').value.trim();
      const description = document.getElementById('new-prod-desc').value.trim();

      const newProd = {
        id: `lf-${Date.now()}`,
        title,
        category,
        price,
        oldPrice: null,
        badge,
        image,
        description,
        flowerType: 'تشكيلة زهور طبيعية فاخرة',
        flowerCount: 'تنسيق متناسق ومتقن',
        dimensions: 'الارتفاع 45 - 55 سم تقريباً',
        packaging: 'تغليف فاخر مقاوم للماء وشريط ساتان',
        freshness: '7 - 10 أيام مع العناية الموصى بها',
        careTips: 'قص أطراف السيقان بزاوية 45 درجة، واستبدل الماء كل يومين.',
        inStock: true,
        featured: false
      };

      try {
        await ApiClient.createProduct(newProd);
      } catch (_) {}
      cachedProducts.unshift(newProd);
      saveProducts(cachedProducts);
      renderProducts();

      addForm.reset();
      if (addModalOverlay) addModalOverlay.classList.remove('active');
      showToast('تمت إضافة الباقة الجديدة وحفظها بنجاح! 🌹');
    });
  }

  // Reset defaults
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('هل ترغب بإعادة تعيين قائمة المنتجات إلى المنتجات الافتراضية؟')) {
        const resetList = resetDefaultProducts();
        cachedProducts = resetList;
        renderProducts();
        showToast('تمت استعادة المنتجات الافتراضية بنجاح 🔄');
      }
    });
  }
}

/**
 * Orders Table & Live Status Management
 */
let cachedOrders = [];

function initOrdersTable() {
  const tbody = document.getElementById('dashboard-orders-tbody');
  const refreshBtn = document.getElementById('btn-refresh-orders');

  async function renderOrders() {
    if (!tbody) return;

    try {
      cachedOrders = await ApiClient.getOrders();
    } catch (_) {
      try {
        const stored = localStorage.getItem('leen_flowers_orders');
        cachedOrders = stored ? JSON.parse(stored) : [];
      } catch (_) {
        cachedOrders = [];
      }
    }

    if (!cachedOrders || cachedOrders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:32px; color:var(--text-muted);">
            🌸 لا توجد طلبات مسجلة حالياً. أي طلب يتم عبر المتجر سيظهر هنا تلقائياً مع تفاصيله الكاملة.
          </td>
        </tr>
      `;
      return;
    }

    const statusMap = {
      new: { label: 'جديد 🆕', cls: 'order-status-new' },
      preparing: { label: 'قيد التجهيز ⏳', cls: 'order-status-preparing' },
      out_for_delivery: { label: 'خرج للتوصيل 🚗', cls: 'order-status-out_for_delivery' },
      delivered: { label: 'تم التسليم ✓', cls: 'order-status-delivered' },
      cancelled: { label: 'ملغي ✕', cls: 'order-status-cancelled' }
    };

    tbody.innerHTML = cachedOrders.map(o => {
      const itemsList = Array.isArray(o.items) ? o.items : [];
      const itemsText = itemsList.map(i => `${i.qty || 1}x ${i.title}`).join('<br>');
      const currentStatus = o.status || 'new';

      return `
        <tr data-order-id="${o.id}">
          <td style="font-weight:800; color:var(--primary); font-family:monospace;">
            ${o.orderNumber || `LF-26-${o.id}`}
          </td>
          <td style="font-size:0.85rem;">
            <div>📅 ${o.deliveryDate || 'اليوم'}</div>
            <div style="color:var(--text-muted); font-size:0.75rem;">${o.deliveryTime || 'خلال ساعات اليوم'}</div>
          </td>
          <td>
            <div style="font-weight:700;">${o.buyerName || 'عميل'}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);"><a href="tel:${o.buyerPhone}">${o.buyerPhone || ''}</a></div>
            ${o.recipientName && o.recipientName !== o.buyerName ? `<div style="font-size:0.74rem; color:var(--primary);">المستلم: ${o.recipientName}</div>` : ''}
          </td>
          <td style="font-size:0.85rem; max-width:180px;">
            <div style="font-weight:600;">${o.city || 'عمان'}</div>
            <div style="font-size:0.78rem; color:var(--text-muted);">${o.detailedAddress || ''}</div>
          </td>
          <td style="font-size:0.82rem; line-height:1.4;">
            ${itemsText || 'باقة ورد'}
          </td>
          <td style="font-weight:800; color:var(--primary); font-size:1.05rem;">
            ${parseFloat(o.total || 0).toFixed(2)} د.أ
          </td>
          <td>
            <select class="dash-status-select" data-action="change-status" data-order-id="${o.id}" style="padding:4px 8px; border-radius:8px; border:1px solid var(--border-color); font-size:0.82rem; background:var(--bg-surface);">
              <option value="new" ${currentStatus === 'new' ? 'selected' : ''}>جديد 🆕</option>
              <option value="preparing" ${currentStatus === 'preparing' ? 'selected' : ''}>قيد التجهيز ⏳</option>
              <option value="out_for_delivery" ${currentStatus === 'out_for_delivery' ? 'selected' : ''}>خرج للتوصيل 🚗</option>
              <option value="delivered" ${currentStatus === 'delivered' ? 'selected' : ''}>تم التسليم ✓</option>
              <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>ملغي ✕</option>
            </select>
          </td>
          <td>
            <div class="order-actions-cell">
              <button type="button" class="btn-order-print" data-action="print" data-order-id="${o.id}" title="طباعة كرت الإهداء وإرسالية التوصيل">
                <span>🖨️ طباعة</span>
              </button>
              <a href="https://wa.me/${StoreConfig.formatWhatsAppNumber(o.buyerPhone)}?text=${encodeURIComponent(`مرحباً ${o.buyerName}، نتواصل معك من متجر لين للزهور بخصوص طلبك رقم ${o.orderNumber || ''}.`)}" target="_blank" rel="noopener" class="dash-btn-outline" style="padding:5px 8px; font-size:0.8rem;" title="مراسلة المشتري">
                💬
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    updateDashboardStats();
  }

  renderOrders();

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      renderOrders();
      showToast('تم تحديث قائمة الطلبات من قاعدة البيانات 🔄');
    });
  }

  // Handle Order Status Changes & Print Clicks
  if (tbody) {
    tbody.addEventListener('change', async e => {
      const select = e.target.closest('select[data-action="change-status"]');
      if (!select) return;

      const orderId = select.dataset.orderId;
      const newStatus = select.value;

      try {
        await ApiClient.updateOrderStatus(orderId, newStatus);
        const o = cachedOrders.find(x => String(x.id) === String(orderId));
        if (o) o.status = newStatus;
        showToast(`تم تحديث حالة الطلب رقم ${orderId} إلى: ${select.options[select.selectedIndex].text}`);
      } catch (err) {
        showToast('تعذر تحديث الحالة: ' + err.message);
      }
    });

    tbody.addEventListener('click', e => {
      const printBtn = e.target.closest('button[data-action="print"]');
      if (!printBtn) return;

      const orderId = printBtn.dataset.orderId;
      const order = cachedOrders.find(x => String(x.id) === String(orderId));
      if (order) {
        openPrintModal(order);
      }
    });
  }
}

/**
 * Printable Voucher System (Gift Card & Driver Voucher)
 */
function initPrintModal() {
  const modal = document.getElementById('print-modal-overlay');
  const closeBtn = document.getElementById('close-print-modal-btn');
  const cancelBtn = document.getElementById('btn-cancel-print');
  const printTriggerBtn = document.getElementById('btn-trigger-print');

  function closeModal() {
    if (modal) modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (printTriggerBtn) {
    printTriggerBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

function openPrintModal(order) {
  const modal = document.getElementById('print-modal-overlay');
  const voucherEl = document.getElementById('printable-voucher');
  if (!modal || !voucherEl) return;

  document.body.classList.add('modal-open');

  const itemsList = Array.isArray(order.items) ? order.items : [];
  const itemsRows = itemsList.map(i => `
    <tr>
      <td>${i.title}</td>
      <td style="text-align:center;">${i.qty || 1}</td>
      <td style="text-align:left;">${parseFloat(i.price || 0).toFixed(2)} د.أ</td>
      <td style="text-align:left;">${(parseFloat(i.price || 0) * (i.qty || 1)).toFixed(2)} د.أ</td>
    </tr>
  `).join('');

  voucherEl.innerHTML = `
    <div class="voucher-container">
      <!-- 1. Gift Card Section -->
      <div class="gift-card-print-box">
        <div class="gift-card-recipient-line">
          إلى العزيز/ة: <span>${order.recipientName || order.buyerName || 'أعز الناس'}</span>
        </div>
        
        <div class="gift-card-body-text">
          "${order.giftCardMessage || 'مع أطيب التمنيات وأجمل باقات الورد والتقدير.'}"
        </div>

        <div class="gift-card-sender-line">
          مع كل الحب، <br>
          <strong>${order.giftCardSign || order.buyerName || ''}</strong>
        </div>
      </div>

      <div class="cut-here-line">
        <span>✂️ قص هنا لإرفاق كرت الإهداء مع باقة الورد ✂️</span>
      </div>

      <!-- 2. Delivery & Florist Voucher -->
      <div class="delivery-slip-box">
        <div class="slip-header">
          <div>
            <h3>🌸 متجر لين للزهور (Leen Flowers)</h3>
            <span style="font-size:0.85rem; color:#666;">إرسالية التوصيل وبطاقة تحضير الطلب</span>
          </div>
          <div class="slip-order-badge">
            ${order.orderNumber || `LF-26-${order.id}`}
          </div>
        </div>

        <div class="slip-grid">
          <div class="slip-info-group">
            <h4>👤 بيانات المستلم والتوصيل</h4>
            <p>الاسم: <strong>${order.recipientName || order.buyerName}</strong></p>
            <p>الهاتف: <strong>${order.recipientPhone || order.buyerPhone}</strong></p>
            <p>المدينة / المنطقة: <strong>${order.city}</strong></p>
            <p>العنوان التفصيلي: ${order.detailedAddress}</p>
            ${order.locationUrl ? `<p>رابط اللوكيشن: <a href="${order.locationUrl}" target="_blank" rel="noopener" style="color:#0284c7; text-decoration:underline; font-weight:600;">📍 فتح موقع خرائط Google</a></p>` : ''}
          </div>

          <div class="slip-info-group">
            <h4>⏰ الموعد وتفاصيل المشتري</h4>
            <p>المشتري: ${order.buyerName} (${order.buyerPhone})</p>
            <p>التاريخ المطلوب: <strong>${order.deliveryDate || 'اليوم'}</strong></p>
            <p>الساعة المحددة: <strong>${order.exactTime ? order.exactTime + ' (' + (order.deliveryTime || 'مساءً') + ')' : (order.deliveryTime || 'مساءً')}</strong></p>
            <p>ملاحظات التجهيز: <em style="color:#c85a70;">${order.orderNotes || 'لا توجد'}</em></p>
          </div>
        </div>

        <table class="slip-items-table">
          <thead>
            <tr>
              <th>المنتج / الباقة</th>
              <th style="text-align:center;">الكمية</th>
              <th style="text-align:left;">السعر</th>
              <th style="text-align:left;">المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows || '<tr><td colspan="4">باقة ورد طبيعي</td></tr>'}
          </tbody>
        </table>

        <div class="slip-total-bar">
          <div>المبلغ المطلوب تحصيله عند التسليم:</div>
          <div>${parseFloat(order.total || 0).toFixed(2)} دينار أردني (د.أ)</div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

/**
 * Update Dashboard Header Stats
 */
async function updateDashboardStats() {
  const statProds = document.getElementById('stat-total-products');
  const statOrders = document.getElementById('stat-total-orders');
  const statRev = document.getElementById('stat-total-revenue');
  const statPhone = document.getElementById('stat-active-phone');

  try {
    const stats = await ApiClient.getStats();
    if (stats) {
      if (statProds) statProds.textContent = stats.totalProducts;
      if (statOrders) statOrders.textContent = stats.totalOrders;
      if (statRev) statRev.textContent = `${stats.totalRevenue.toFixed(2)} د.أ`;
    }
  } catch (_) {
    if (statProds) statProds.textContent = cachedProducts.length;
    if (statOrders) statOrders.textContent = cachedOrders.length;
    const rev = cachedOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    if (statRev) statRev.textContent = `${rev.toFixed(2)} د.أ`;
  }

  if (statPhone) {
    statPhone.textContent = StoreConfig.defaultWhatsApp;
  }
}

function refreshAllData() {
  initSettingsForm();
  initProductsTable();
  initOrdersTable();
  updateDashboardStats();
}

/**
 * Toast notice helper
 */
function showToast(msg) {
  const toast = document.getElementById('toast-notice');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3500);
}


})();
