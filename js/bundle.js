
/**
 * Standalone Storefront Bundle for Leen Flowers (متجر لين للزهور)
 * Self-contained: works on file://, http://, and all production servers without CORS.
 */
(function() {
  'use strict';

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
 * Social Media Feed Data for Leen Flowers (إنستغرام وفيسبوك)
 * Prepared for live API synchronization in Phase 2
 */

const instagramPosts = [
  {
    id: 'ig-1',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    caption: 'تنسيق استثنائي من أزهار الجوري الهولندي والبيبي روز لصباح مفعم بالبهجة 🌸🌿 متوفر الآن للطلب والتوصيل في عمان.',
    likes: 248,
    comments: 19,
    date: 'منذ يومين',
    url: 'https://www.instagram.com/leen_flower11'
  },
  {
    id: 'ig-2',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    caption: 'الكلاسيكية التي لا تفقد بريقها أبداً ❤️ جوري أحمر ملكي بتغليف أسود فاخر مع كرت إهداء مخملي.',
    likes: 312,
    comments: 34,
    date: 'منذ 3 أيام',
    url: 'https://www.instagram.com/leen_flower11'
  },
  {
    id: 'ig-3',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    caption: 'فازات الكريستال الفاخرة لتزيين طاولات استقبالكم ومناسباتكم الخاصة ✨ نسعد باستقبال حجوزاتكم عبر الواتساب.',
    likes: 185,
    comments: 12,
    date: 'منذ 5 أيام',
    url: 'https://www.instagram.com/leen_flower11'
  },
  {
    id: 'ig-4',
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=800&q=80',
    caption: 'مبارك التخرج لكل المبدعين 🎓 باقات التخرج المميزة مع مجسم القبعة والوشاح الأنيق جاهزة للتسليم الفوري.',
    likes: 420,
    comments: 48,
    date: 'منذ أسبوع',
    url: 'https://www.instagram.com/leen_flower11'
  },
  {
    id: 'ig-5',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
    caption: 'البوكس المخملي المزدوج: ورد جوري نضر + تشكيلة شوكولاتة سويسرية فاخرة 🍫🌹 الهدية المتكاملة لمن تحب.',
    likes: 290,
    comments: 26,
    date: 'منذ أسبوع',
    url: 'https://www.instagram.com/leen_flower11'
  },
  {
    id: 'ig-6',
    image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=800&q=80',
    caption: 'أجمل إطلالة لعروس الموسم 💍 مسكة عروس بتنسيق ناعم من الورد الأبيض والكالّا ليلي بتفاصيل دانتيل ساحرة.',
    likes: 510,
    comments: 63,
    date: 'منذ أسبوعين',
    url: 'https://www.instagram.com/leen_flower11'
  }
];

const facebookPosts = [
  {
    id: 'fb-1',
    author: 'لين للزهور - Leen Flowers',
    time: 'منذ يومين · 🌍',
    content: 'يسعد أوقاتكم متابعينا الكرام 🌸 نوفر لكم يومياً قطفة طازجة من أرقى أنواع الورد الجوري الطبيعي مع خدمة التوصيل السريع لكافة مناطق عمان والزرقاء وإربد. بطاقة الإهداء والتغليف الفاخر دائماً مجاناً مع كل باقة! للطلب الفوري تواصلوا معنا عبر الواتساب: 0797035039',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    likes: 184,
    comments: 29,
    shares: 14,
    url: 'https://www.facebook.com/p/Leen-Flowers-100090007161366/'
  },
  {
    id: 'fb-2',
    author: 'لين للزهور - Leen Flowers',
    time: 'منذ 4 أيام · 🌍',
    content: 'تجهيز وتنسيق استاندات وبوكسات استقبال المواليد وحفلات التخرج بأحدث الموديلات العصرية 🌿✨ تصاميم مخصصة بأسماء أحبابكم وعبارات تهنئة مطبوعة بحرفية عالية. أهلاً بكم في متجركم لين للزهور.',
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=800&q=80',
    likes: 215,
    comments: 42,
    shares: 22,
    url: 'https://www.facebook.com/p/Leen-Flowers-100090007161366/'
  },
  {
    id: 'fb-3',
    author: 'لين للزهور - Leen Flowers',
    time: 'منذ أسبوع · 🌍',
    content: 'جمعة مباركة على الجميع 🤍 لا تترددوا بإسعاد من تحبون بباقة ورد طبيعي تفوح عطراً وتعبّر عن أرق المشاعر. نفتح أبوابنا يومياً من 9 صباحاً وحتى 11 مساءً.',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
    likes: 156,
    comments: 18,
    shares: 9,
    url: 'https://www.facebook.com/p/Leen-Flowers-100090007161366/'
  }
];


  /**
 * Cart Manager & WhatsApp Order Dispatcher for Leen Flowers (متجر لين للزهور)
 */



const STORAGE_KEY_CART = 'leen_flowers_cart';

class CartStore {
  constructor() {
    this.items = [];
    this.listeners = [];
    this.loadFromStorage();
  }

  loadFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CART);
        if (stored) {
          this.items = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Could not read cart from localStorage', e);
      }
    }
  }

  saveToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(this.items));
      } catch (e) {
        console.warn('Could not save cart to localStorage', e);
      }
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.items));
  }

  addItem(product, quantity = 1) {
    if (!product || !product.id) return;
    const existing = this.items.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        product: { ...product },
        quantity: Math.max(1, quantity)
      });
    }
    this.saveToStorage();
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.product.id !== productId);
    this.saveToStorage();
  }

  updateQuantity(productId, delta) {
    const item = this.items.find(i => i.product.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.saveToStorage();
    }
  }

  clear() {
    this.items = [];
    this.saveToStorage();
  }

  getItems() {
    return this.items;
  }

  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((total, item) => {
      const price = Number(item.product.price) || 0;
      return total + price * item.quantity;
    }, 0);
  }

  /**
   * Formats the order into a clear, aesthetic Arabic WhatsApp message
   */
  formatOrderMessage(details = {}) {
    const {
      buyerName = '',
      buyerPhone = '',
      recipientName = '',
      recipientPhone = '',
      city = '',
      address = '',
      deliveryDate = '',
      deliveryTime = '',
      cardMessage = '',
      cardSign = '',
      notes = ''
    } = details;

    const subtotal = this.getSubtotal();
    const deliveryFee = details.deliveryFee !== undefined ? Number(details.deliveryFee) : 0;
    const grandTotal = subtotal + deliveryFee;

    const itemsText = this.items
      .map((item, index) => {
        const itemTotal = (item.product.price * item.quantity).toFixed(2);
        return `${index + 1}. ${item.quantity}x ${item.product.title} (${itemTotal} د.أ)`;
      })
      .join('\n');

    let msg = `🌸 *طلب جديد من متجر لين للزهور (Leen Flowers)* 🌸\n`;
    msg += `─────────────────────────\n`;
    msg += `👤 *بيانات المشتري:*\n`;
    msg += `• الاسم: ${buyerName || 'غير محدد'}\n`;
    msg += `• الهاتف: ${buyerPhone || 'غير محدد'}\n\n`;

    msg += `🎁 *بيانات المستلم:*\n`;
    msg += `• الاسم: ${recipientName || buyerName || 'نفس المشتري'}\n`;
    msg += `• الهاتف: ${recipientPhone || buyerPhone || 'نفس المشتري'}\n\n`;

    msg += `📍 *تفاصيل التوصيل:*\n`;
    msg += `• المدينة / المنطقة: ${city || 'عمان'}\n`;
    msg += `• العنوان التفصيلي: ${address || 'سيتم التوضيح عبر الواتساب'}\n`;
    msg += `• التاريخ المفضل: ${deliveryDate || 'في أقرب وقت'}\n`;
    msg += `• الفترة: ${deliveryTime || 'خلال اليوم'}\n\n`;

    if (cardMessage && cardMessage.trim()) {
      msg += `💌 *بطاقة الإهداء:*\n`;
      msg += `"${cardMessage.trim()}"\n`;
      if (cardSign && cardSign.trim()) {
        msg += `✍️ التوقيع: ${cardSign.trim()}\n`;
      }
      msg += `\n`;
    }

    msg += `🛍️ *تفاصيل المنتجات:*\n`;
    msg += `${itemsText}\n`;
    msg += `─────────────────────────\n`;
    msg += `💰 *قيمة المنتجات:* ${subtotal.toFixed(2)} د.أ\n`;
    if (deliveryFee > 0) {
      msg += `🚗 *رسوم التوصيل التقديرية:* ${deliveryFee.toFixed(2)} د.أ\n`;
      msg += `✨ *المجموع الإجمالي:* ${grandTotal.toFixed(2)} د.أ\n`;
    } else {
      msg += `✨ *المجموع الإجمالي:* ${grandTotal.toFixed(2)} د.أ\n`;
    }

    if (notes && notes.trim()) {
      msg += `\n📝 *ملاحظات خاصة:*\n${notes.trim()}\n`;
    }

    msg += `─────────────────────────\n`;
    msg += `تم إرسال هذا الطلب تلقائياً عبر موقع *لين للزهور* 💐`;

    return msg;
  }

  /**
   * Generates the direct WhatsApp URL
   */
  generateWhatsAppOrderUrl(details = {}, customPhone = null) {
    const rawPhone = customPhone || StoreConfig.defaultWhatsApp;
    const cleanPhone = StoreConfig.formatWhatsAppNumber(rawPhone);
    const message = this.formatOrderMessage(details);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }
}

const CartManager = new CartStore();


  /**
 * Interactive 3D Luxury Flower Bouquet & Petals Scene for Leen Flowers (متجر لين للزهور)
 * High compatibility (WebGL standard materials, mobile-responsive, zero CORS issues)
 */

function initThreeFlowerScene(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (typeof THREE === 'undefined') {
    console.warn('Three.js is not loaded.');
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:20px; color:var(--text-muted);">
        <div style="font-size:3.5rem; margin-bottom:10px;">🌸</div>
        <h4 style="color:var(--text-main);">باقة ورد لين للزهور ثلاثية الأبعاد</h4>
        <p style="font-size:0.85rem;">زهور طبيعية منسقة بحب وإتقان</p>
      </div>
    `;
    return null;
  }

  // Determine container dimensions safely
  let width = container.clientWidth || container.offsetWidth || 420;
  let height = container.clientHeight || container.offsetHeight || 420;
  if (width < 100) width = 420;
  if (height < 100) height = 420;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0.8, 5.2);

  // Renderer
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'default'
    });
  } catch (e) {
    console.error('WebGL initialization failed', e);
    return null;
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'pan-y'; // allow mobile vertical scrolling

  // Theme palettes configuration
  const themeColors = {
    blush: {
      mainRose: 0xd94b68,
      secondaryRose: 0xf48b9f,
      miniRose: 0xffadc0,
      stamen: 0xd4af37,
      stem: 0x2d5a37,
      leaf: 0x3b7548,
      vase: 0xffffff,
      vaseBorder: 0xd4af37,
      ambient: 0xffedf1,
      mainLight: 0xffffff,
      rimLight: 0xffc2ce
    },
    lavender: {
      mainRose: 0x765bb5,
      secondaryRose: 0x9b84d4,
      miniRose: 0xd5cbf2,
      stamen: 0x3b8465,
      stem: 0x24553b,
      leaf: 0x2f6d4d,
      vase: 0xffffff,
      vaseBorder: 0x8e7cc3,
      ambient: 0xf3f0fc,
      mainLight: 0xffffff,
      rimLight: 0xdad0fb
    },
    midnight: {
      mainRose: 0xd91e42,
      secondaryRose: 0xf24b6a,
      miniRose: 0xff7b93,
      stamen: 0xf5c065,
      stem: 0x1d3d28,
      leaf: 0x274e35,
      vase: 0x1e2433,
      vaseBorder: 0xf5c065,
      ambient: 0x1a1e2d,
      mainLight: 0xffeedd,
      rimLight: 0xf5c065
    }
  };

  let currentTheme = document.documentElement.getAttribute('data-theme') || 'blush';
  if (!themeColors[currentTheme]) currentTheme = 'blush';

  // --- Lighting ---
  const ambientLight = new THREE.AmbientLight(themeColors[currentTheme].ambient, 1.3);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(themeColors[currentTheme].mainLight, 1.8);
  mainLight.position.set(4, 7, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.9);
  backLight.position.set(-4, -2, -4);
  scene.add(backLight);

  const rimLight = new THREE.PointLight(themeColors[currentTheme].rimLight, 1.8, 12);
  rimLight.position.set(0, 2.5, 2);
  scene.add(rimLight);

  // --- Bouquet Master Group ---
  const bouquet = new THREE.Group();
  scene.add(bouquet);

  // Storage for materials that change with theme
  const dynamicMaterials = [];

  // Helper to create a curved 3D petal
  function createPetal(width, length, curveZ, colorHex, isInner = false) {
    const geom = new THREE.PlaneGeometry(width, length, 8, 8);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = pos.getX(i);
      const normY = (y + length / 2) / length;
      const z = -Math.sin(normY * Math.PI) * curveZ - Math.sin((x / width) * Math.PI) * (curveZ * 0.35);
      pos.setZ(i, z);
    }
    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.55,
      metalness: 0.08,
      side: THREE.DoubleSide
    });
    dynamicMaterials.push({ mat, type: isInner ? 'inner' : 'outer' });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // Create a full 3D Rose Flower head
  function createRose(scale = 1.0, mainColor, secColor) {
    const roseGroup = new THREE.Group();

    // Central bud
    const coreGeom = new THREE.SphereGeometry(0.24 * scale, 12, 12);
    const coreMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.6
    });
    dynamicMaterials.push({ mat: coreMat, type: 'inner' });
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.scale.set(0.7, 1.2, 0.7);
    core.position.y = 0.08 * scale;
    roseGroup.add(core);

    // Layers of curved petals
    const layers = [
      { count: 4, w: 0.5 * scale, l: 0.65 * scale, r: 0.16 * scale, tilt: 0.35, c: 0.28, inner: true },
      { count: 6, w: 0.7 * scale, l: 0.85 * scale, r: 0.32 * scale, tilt: 0.6, c: 0.38, inner: true },
      { count: 8, w: 0.95 * scale, l: 1.05 * scale, r: 0.52 * scale, tilt: 0.9, c: 0.48, inner: false },
      { count: 10, w: 1.2 * scale, l: 1.25 * scale, r: 0.75 * scale, tilt: 1.2, c: 0.58, inner: false }
    ];

    layers.forEach((layer, layerIdx) => {
      for (let i = 0; i < layer.count; i++) {
        const color = layer.inner ? mainColor : secColor;
        const petal = createPetal(layer.w, layer.l, layer.c, color, layer.inner);
        const angle = (i / layer.count) * Math.PI * 2 + (layerIdx * 0.45);
        const x = Math.cos(angle) * layer.r;
        const z = Math.sin(angle) * layer.r;

        petal.position.set(x, layerIdx * 0.04 * scale, z);
        petal.rotation.y = -angle - Math.PI / 2;
        petal.rotation.x = layer.tilt + (Math.random() * 0.08 - 0.04);
        petal.rotation.z = (Math.random() * 0.1 - 0.05);

        roseGroup.add(petal);
      }
    });

    return roseGroup;
  }

  // 1. Central Queen Rose (باقة ورد رئيسية)
  const centerRose = createRose(1.15, themeColors[currentTheme].mainRose, themeColors[currentTheme].secondaryRose);
  centerRose.position.set(0, 0.35, 0);
  bouquet.add(centerRose);

  // 2. Surrounding Side Roses (ورود إضافية لتشكيل باقة حقيقية)
  const sideRose1 = createRose(0.78, themeColors[currentTheme].secondaryRose, themeColors[currentTheme].miniRose);
  sideRose1.position.set(0.85, 0.15, 0.2);
  sideRose1.rotation.z = -0.4;
  sideRose1.rotation.y = 0.5;
  bouquet.add(sideRose1);

  const sideRose2 = createRose(0.75, themeColors[currentTheme].secondaryRose, themeColors[currentTheme].miniRose);
  sideRose2.position.set(-0.85, 0.1, 0.15);
  sideRose2.rotation.z = 0.45;
  sideRose2.rotation.y = -0.6;
  bouquet.add(sideRose2);

  const sideRose3 = createRose(0.7, themeColors[currentTheme].mainRose, themeColors[currentTheme].secondaryRose);
  sideRose3.position.set(0.1, 0.2, -0.75);
  sideRose3.rotation.x = -0.4;
  bouquet.add(sideRose3);

  // 3. Stems & Green Leaves
  const stemMat = new THREE.MeshStandardMaterial({
    color: themeColors[currentTheme].stem,
    roughness: 0.7
  });
  dynamicMaterials.push({ mat: stemMat, type: 'stem' });

  const leafMat = new THREE.MeshStandardMaterial({
    color: themeColors[currentTheme].leaf,
    roughness: 0.55,
    side: THREE.DoubleSide
  });
  dynamicMaterials.push({ mat: leafMat, type: 'leaf' });

  // Main Stems
  const stemGeom = new THREE.CylinderGeometry(0.06, 0.08, 2.4, 12);
  const stem1 = new THREE.Mesh(stemGeom, stemMat);
  stem1.position.set(0, -0.9, 0);
  bouquet.add(stem1);

  // Leaves
  function createLeafMesh(scale, x, y, z, rx, ry, rz) {
    const leafGeom = new THREE.PlaneGeometry(0.55 * scale, 1.1 * scale, 6, 6);
    const pos = leafGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const ny = (pos.getY(i) + 0.55) / 1.1;
      pos.setZ(i, -Math.sin(ny * Math.PI) * 0.25);
    }
    leafGeom.computeVertexNormals();

    const leaf = new THREE.Mesh(leafGeom, leafMat);
    leaf.position.set(x, y, z);
    leaf.rotation.set(rx, ry, rz);
    leaf.castShadow = true;
    return leaf;
  }

  bouquet.add(createLeafMesh(1.1, 0.7, -0.3, 0.4, 0.6, 0.8, -0.6));
  bouquet.add(createLeafMesh(1.0, -0.75, -0.35, 0.35, 0.5, -0.8, 0.6));
  bouquet.add(createLeafMesh(0.9, 0.1, -0.4, -0.65, -0.7, 0.2, 0.1));
  bouquet.add(createLeafMesh(0.85, -0.4, -0.7, 0.5, 0.8, -0.4, 0.5));

  // 4. Luxury Golden Ribbon Wrap around bouquet
  const ribbonGeom = new THREE.TorusGeometry(0.45, 0.05, 12, 32);
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: themeColors[currentTheme].stamen,
    metalness: 0.85,
    roughness: 0.25
  });
  dynamicMaterials.push({ mat: ribbonMat, type: 'gold' });

  const ribbon = new THREE.Mesh(ribbonGeom, ribbonMat);
  ribbon.rotation.x = Math.PI / 2;
  ribbon.position.set(0, -0.55, 0);
  bouquet.add(ribbon);

  // Second Ribbon loop
  const ribbonBowGeom = new THREE.TorusGeometry(0.22, 0.035, 12, 24);
  const ribbonBow1 = new THREE.Mesh(ribbonBowGeom, ribbonMat);
  ribbonBow1.position.set(0.18, -0.58, 0.42);
  ribbonBow1.rotation.y = 0.4;
  bouquet.add(ribbonBow1);

  const ribbonBow2 = new THREE.Mesh(ribbonBowGeom, ribbonMat);
  ribbonBow2.position.set(-0.18, -0.58, 0.42);
  ribbonBow2.rotation.y = -0.4;
  bouquet.add(ribbonBow2);

  // Position bouquet nicely in camera view
  bouquet.position.y = 0.2;

  // --- Falling & Floating Rose Petals ---
  const petalsCount = 28;
  const floatingPetals = [];
  const petalParticleGroup = new THREE.Group();
  scene.add(petalParticleGroup);

  const smallPetalGeom = new THREE.PlaneGeometry(0.22, 0.32, 4, 4);
  const pos = smallPetalGeom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, -Math.sin(((pos.getY(i) + 0.16) / 0.32) * Math.PI) * 0.12);
  }
  smallPetalGeom.computeVertexNormals();

  for (let i = 0; i < petalsCount; i++) {
    const pMat = new THREE.MeshStandardMaterial({
      color: themeColors[currentTheme].secondaryRose,
      roughness: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88
    });
    dynamicMaterials.push({ mat: pMat, type: 'petal' });

    const pMesh = new THREE.Mesh(smallPetalGeom, pMat);
    pMesh.position.set(
      (Math.random() - 0.5) * 6,
      Math.random() * 5 - 1.5,
      (Math.random() - 0.5) * 4
    );
    pMesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    floatingPetals.push({
      mesh: pMesh,
      speedY: 0.006 + Math.random() * 0.012,
      speedRotX: (Math.random() - 0.5) * 0.02,
      speedRotY: (Math.random() - 0.5) * 0.02,
      swayOffset: Math.random() * Math.PI * 2
    });
    petalParticleGroup.add(pMesh);
  }

  // --- Interaction Tracking (Mouse & Touch Drag) ---
  let isDragging = false;
  let prevX = 0;
  let prevY = 0;
  let targetRotY = 0;
  let targetRotX = 0.1;
  let targetTiltZ = 0;

  function onPointerMove(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (isDragging) {
      const deltaX = clientX - prevX;
      const deltaY = clientY - prevY;
      targetRotY += deltaX * 0.012;
      targetRotX += deltaY * 0.01;
      targetRotX = Math.max(-0.4, Math.min(0.6, targetRotX));
      prevX = clientX;
      prevY = clientY;
    } else {
      const rect = container.getBoundingClientRect();
      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = normX * 0.45;
      targetRotX = 0.15 - normY * 0.25;
      targetTiltZ = -normX * 0.15;
    }
  }

  function onPointerDown(e) {
    isDragging = true;
    prevX = e.touches ? e.touches[0].clientX : e.clientX;
    prevY = e.touches ? e.touches[0].clientY : e.clientY;
  }

  function onPointerUp() {
    isDragging = false;
  }

  container.addEventListener('mousemove', onPointerMove, { passive: true });
  container.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mouseup', onPointerUp);

  container.addEventListener('touchmove', onPointerMove, { passive: true });
  container.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  // Resize handler
  function handleResize() {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth || 400;
    const h = container.clientHeight || 400;
    if (w < 50 || h < 50) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener('resize', handleResize);
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => handleResize());
    ro.observe(container);
  }

  // --- Dynamic Theme Updater ---
  function updateTheme3D(newTheme) {
    if (!themeColors[newTheme]) return;
    currentTheme = newTheme;
    const p = themeColors[newTheme];

    dynamicMaterials.forEach(({ mat, type }) => {
      if (type === 'inner') mat.color.setHex(p.mainRose);
      else if (type === 'outer' || type === 'petal') mat.color.setHex(p.secondaryRose);
      else if (type === 'stem') mat.color.setHex(p.stem);
      else if (type === 'leaf') mat.color.setHex(p.leaf);
      else if (type === 'gold') mat.color.setHex(p.stamen);
    });

    ambientLight.color.setHex(p.ambient);
    mainLight.color.setHex(p.mainLight);
    rimLight.color.setHex(p.rimLight);
  }

  // --- Render Loop ---
  let animId = null;
  const clock = new THREE.Clock();

  function animate() {
    animId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Gentle floating breathing animation
    bouquet.position.y = 0.2 + Math.sin(elapsedTime * 1.6) * 0.06;

    // Smooth inertia interpolation
    bouquet.rotation.x += (targetRotX - bouquet.rotation.x) * 0.08;
    bouquet.rotation.y += (targetRotY - bouquet.rotation.y) * 0.08;
    bouquet.rotation.z += (targetTiltZ - bouquet.rotation.z) * 0.08;

    // Subtle automatic spin when idle
    if (!isDragging) {
      targetRotY += 0.0025;
    }

    // Floating petals animation
    floatingPetals.forEach(p => {
      p.mesh.position.y -= p.speedY;
      p.mesh.position.x += Math.sin(elapsedTime * 1.2 + p.swayOffset) * 0.004;
      p.mesh.rotation.x += p.speedRotX;
      p.mesh.rotation.y += p.speedRotY;

      // Wrap around
      if (p.mesh.position.y < -2.6) {
        p.mesh.position.y = 2.8;
        p.mesh.position.x = (Math.random() - 0.5) * 5;
      }
    });

    renderer.render(scene, camera);
  }

  animate();

  return {
    updateTheme3D,
    destroy() {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      renderer.dispose();
    }
  };
}


  /**
 * Main Application Orchestrator for Leen Flowers (متجر لين للزهور)
 */







document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Store Configuration
  StoreConfig.load();
  updateStoreContactLinks();

  // 2. Setup Three.js Interactive 3D Flower Scene
  const threeScene = initThreeFlowerScene('three-canvas-container');

  // 3. Theme Switcher System
  initThemeSwitcher(threeScene);

  // 4. Products Rendering & Category Filters
  initProductCatalog();

  // 5. Product Details Modal View
  initProductDetailsModal();

  // 6. Social Media Feeds (Instagram & Facebook)
  initSocialMediaFeeds();

  // 7. Cart Drawer & Badge Listeners
  initCartDrawer();

  // 8. Checkout Flow & WhatsApp Integration
  initCheckoutFlow();

  // 9. Auto-fill minimum delivery date to today
  initDeliveryDateInput();
});

/**
 * Update dynamic WhatsApp links from current config
 */
function updateStoreContactLinks() {
  const cleanPhone = StoreConfig.formatWhatsAppNumber(StoreConfig.defaultWhatsApp);
  const waUrl = `https://wa.me/${cleanPhone}`;

  const heroWa = document.getElementById('hero-wa-btn');
  if (heroWa) heroWa.href = waUrl;

  const floatingWa = document.getElementById('floating-wa-btn');
  if (floatingWa) floatingWa.href = waUrl;

  const footerWa = document.getElementById('footer-wa-icon');
  if (footerWa) footerWa.href = waUrl;

  const footerPhone = document.getElementById('footer-phone-display');
  if (footerPhone) {
    footerPhone.textContent = StoreConfig.defaultWhatsApp;
    footerPhone.href = `tel:${StoreConfig.defaultWhatsApp}`;
  }

  // Populate city dropdown
  const citySelect = document.getElementById('city-select');
  if (citySelect && StoreConfig.cities) {
    citySelect.innerHTML = StoreConfig.cities
      .map(c => `<option value="${c}">${c}</option>`)
      .join('');
  }
}

/**
 * Theme Switcher: blush, lavender, midnight
 */
function initThemeSwitcher(threeScene) {
  const rootHtml = document.documentElement;
  const themeBtns = document.querySelectorAll('[data-set-theme]');
  const savedTheme = StoreConfig.activeTheme || 'blush';

  function applyTheme(themeName) {
    rootHtml.setAttribute('data-theme', themeName);
    themeBtns.forEach(btn => {
      if (btn.getAttribute('data-set-theme') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    StoreConfig.save({ activeTheme: themeName });

    if (threeScene && typeof threeScene.updateTheme3D === 'function') {
      threeScene.updateTheme3D(themeName);
    }
  }

  // Apply initial theme
  applyTheme(savedTheme);

  // Attach button events
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const chosen = btn.getAttribute('data-set-theme');
      applyTheme(chosen);
      showToast(`تم تطبيق ثيم: ${btn.textContent.trim()}`);
    });
  });
}

/**
 * Product Catalog & Filtering
 */
let currentCategory = 'all';
let searchQuery = '';

function initProductCatalog() {
  const filterContainer = document.getElementById('category-filters');
  const searchInput = document.getElementById('search-input');

  // Render Category Filter Pills
  if (filterContainer) {
    filterContainer.innerHTML = initialCategories
      .map(
        cat => `
        <button type="button" class="cat-btn ${cat.id === 'all' ? 'active' : ''}" data-cat-id="${cat.id}">
          <span>${cat.icon}</span> ${cat.name}
        </button>
      `
      )
      .join('');

    filterContainer.addEventListener('click', e => {
      const btn = e.target.closest('.cat-btn');
      if (!btn) return;
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-cat-id');
      renderProductsGrid();
    });
  }

  // Footer category links
  document.querySelectorAll('[data-category]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetCat = link.getAttribute('data-category');
      const targetBtn = document.querySelector(`[data-cat-id="${targetCat}"]`);
      if (targetBtn) {
        targetBtn.click();
      }
      const storeSection = document.getElementById('store-catalog');
      if (storeSection) {
        storeSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderProductsGrid();
    });
  }

  renderProductsGrid();
}

function renderProductsGrid() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const allProducts = getProducts();
  const filtered = allProducts.filter(p => {
    const matchesCat = currentCategory === 'all' || p.category === currentCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding:50px 20px; color:var(--text-muted);">
        <div style="font-size:3rem; margin-bottom:12px;">🌸</div>
        <h3>لم يتم العثور على زهور مطابقة لبحثك</h3>
        <p>جرب البحث بكلمة أخرى أو اختر قسماً مختلفاً</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map(p => {
      return `
      <div class="product-card" data-product-id="${p.id}" data-action="view-details" title="اضغط لعرض تفاصيل الباقة">
        <div class="card-img-wrap">
          <img src="${p.image}" alt="${p.title}" class="card-img" loading="lazy">
          ${p.badge ? `<span class="card-badge-tag">${p.badge}</span>` : ''}
        </div>
        <div class="card-body">
          <h4 class="card-title">${p.title}</h4>
          <p class="card-desc">${p.description}</p>
          <div class="card-footer">
            <div class="price-box">
              <span class="price-main">${p.price.toFixed(2)} د.أ</span>
              ${p.oldPrice ? `<span class="price-old">${p.oldPrice.toFixed(2)} د.أ</span>` : ''}
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="card-view-btn" data-action="view-details" data-id="${p.id}" title="معاينة التفاصيل">
                🔍 التفاصيل
              </button>
              <button type="button" class="btn-add-cart" data-action="add-to-cart" data-id="${p.id}" title="إضافة سريعة للسلة">
                <span>+</span> 🛒
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join('');

  // Attach card click handlers for details modal
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', e => {
      // Don't trigger details if clicked directly on add-to-cart
      if (e.target.closest('[data-action="add-to-cart"]')) return;
      const id = card.getAttribute('data-product-id');
      const prod = getProductById(id);
      if (prod) openProductModal(prod);
    });
  });

  // Attach add-to-cart click handler
  grid.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const prod = getProductById(id);
      if (prod) {
        CartManager.addItem(prod, 1);
        showToast(`تمت إضافة "${prod.title}" إلى السلة 🌸`);
      }
    });
  });
}

/**
 * Product Details Modal System
 */
let currentModalProduct = null;
let currentModalQty = 1;

function initProductDetailsModal() {
  const overlay = document.getElementById('product-details-modal-overlay');
  const closeBtn = document.getElementById('close-prod-modal-btn');
  const decBtn = document.getElementById('modal-qty-decrease');
  const incBtn = document.getElementById('modal-qty-increase');
  const qtyVal = document.getElementById('modal-qty-val');
  const addCartBtn = document.getElementById('modal-btn-add-cart');
  const directWaBtn = document.getElementById('modal-btn-direct-wa');

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
    });
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  }

  if (decBtn && incBtn && qtyVal) {
    decBtn.addEventListener('click', () => {
      if (currentModalQty > 1) {
        currentModalQty--;
        qtyVal.textContent = currentModalQty;
      }
    });
    incBtn.addEventListener('click', () => {
      currentModalQty++;
      qtyVal.textContent = currentModalQty;
    });
  }

  if (addCartBtn) {
    addCartBtn.addEventListener('click', () => {
      if (currentModalProduct) {
        CartManager.addItem(currentModalProduct, currentModalQty);
        showToast(`تمت إضافة (${currentModalQty}) من "${currentModalProduct.title}" إلى السلة 🌸`);
        if (overlay) overlay.classList.remove('active');
      }
    });
  }

  if (directWaBtn) {
    directWaBtn.addEventListener('click', () => {
      if (currentModalProduct) {
        const cleanPhone = StoreConfig.formatWhatsAppNumber(StoreConfig.defaultWhatsApp);
        const total = (currentModalProduct.price * currentModalQty).toFixed(2);
        let msg = `🌸 *استفسار وطلب مباشر من متجر لين للزهور* 🌸\n`;
        msg += `─────────────────────────\n`;
        msg += `💐 *الباقة المطلوبة:* ${currentModalProduct.title}\n`;
        msg += `🔢 *الكمية:* ${currentModalQty}\n`;
        msg += `💰 *السعر الإجمالي:* ${total} د.أ\n`;
        msg += `🏷️ *القسم:* ${currentModalProduct.category}\n`;
        if (currentModalProduct.dimensions) {
          msg += `📐 *الأبعاد:* ${currentModalProduct.dimensions}\n`;
        }
        msg += `─────────────────────────\n`;
        msg += `مرحباً، أود تأكيد طلب هذه الباقة وتزويدكم بتفاصيل التوصيل ورسالة كرت الإهداء.`;

        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
      }
    });
  }
}

function openProductModal(prod) {
  const overlay = document.getElementById('product-details-modal-overlay');
  if (!overlay || !prod) return;

  currentModalProduct = prod;
  currentModalQty = 1;

  const imgEl = document.getElementById('modal-img');
  const badgeEl = document.getElementById('modal-badge');
  const titleEl = document.getElementById('modal-title');
  const priceEl = document.getElementById('modal-price');
  const oldPriceEl = document.getElementById('modal-old-price');
  const descEl = document.getElementById('modal-desc');
  const qtyVal = document.getElementById('modal-qty-val');

  // Specs
  const specType = document.getElementById('modal-spec-flower-type');
  const specCount = document.getElementById('modal-spec-count');
  const specDim = document.getElementById('modal-spec-dimensions');
  const specPack = document.getElementById('modal-spec-packaging');
  const specFresh = document.getElementById('modal-spec-freshness');
  const careDesc = document.getElementById('modal-care-desc');

  if (imgEl) {
    imgEl.src = prod.image;
    imgEl.alt = prod.title;
  }
  if (badgeEl) {
    badgeEl.textContent = prod.badge || 'تنسيق فاخر 🌸';
    badgeEl.style.display = prod.badge ? 'inline-block' : 'none';
  }
  if (titleEl) titleEl.textContent = prod.title;
  if (priceEl) priceEl.textContent = `${Number(prod.price).toFixed(2)} د.أ`;
  if (oldPriceEl) {
    if (prod.oldPrice) {
      oldPriceEl.textContent = `${Number(prod.oldPrice).toFixed(2)} د.أ`;
      oldPriceEl.style.display = 'inline';
    } else {
      oldPriceEl.style.display = 'none';
    }
  }
  if (descEl) descEl.textContent = prod.description;
  if (qtyVal) qtyVal.textContent = '1';

  if (specType) specType.textContent = prod.flowerType || 'ورد جوري طبيعي مستورد درجة أولى';
  if (specCount) specCount.textContent = prod.flowerCount || 'تنسيق متناسق ومتقن';
  if (specDim) specDim.textContent = prod.dimensions || 'ارتفاع 45 - 55 سم تقريباً';
  if (specPack) specPack.textContent = prod.packaging || 'تغليف فاخر مقاوم للماء وشريط ساتان';
  if (specFresh) specFresh.textContent = prod.freshness || '7 - 10 أيام مع العناية الموصى بها';
  if (careDesc) careDesc.textContent = prod.careTips || 'قص أطراف السيقان بزاوية 45 درجة، واستبدل الماء كل يومين وضع الباقة في مكان بارد بعيداً عن أشعة الشمس.';

  overlay.classList.add('active');
}

/**
 * Social Media Feeds (Instagram & Facebook Live Feed)
 */
function initSocialMediaFeeds() {
  const igTabBtn = document.getElementById('tab-btn-ig');
  const fbTabBtn = document.getElementById('tab-btn-fb');
  const igView = document.getElementById('social-view-ig');
  const fbView = document.getElementById('social-view-fb');
  const igGrid = document.getElementById('ig-posts-grid');
  const fbList = document.getElementById('fb-posts-list');

  // Render Instagram Posts
  if (igGrid) {
    igGrid.innerHTML = instagramPosts
      .map(
        p => `
      <div class="ig-card">
        <div class="ig-img-wrap">
          <img src="${p.image}" alt="منشور إنستغرام لين للزهور" class="ig-img" loading="lazy">
          <div class="ig-overlay">
            <span>❤️ ${p.likes}</span>
            <span>💬 ${p.comments}</span>
          </div>
        </div>
        <div class="ig-body">
          <p class="ig-caption">${p.caption}</p>
          <div class="ig-foot">
            <span>📅 ${p.date}</span>
            <a href="${p.url}" target="_blank" rel="noopener" class="ig-link">
              <span>عرض على إنستغرام</span> ↗
            </a>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  }

  // Render Facebook Posts
  if (fbList) {
    fbList.innerHTML = facebookPosts
      .map(
        p => `
      <div class="fb-card">
        <div class="fb-header">
          <div class="fb-avatar">🌸</div>
          <div class="fb-page-info">
            <h5>${p.author} <span style="color:#1877f2;">✓</span></h5>
            <span>${p.time}</span>
          </div>
        </div>
        <p class="fb-content">${p.content}</p>
        <div class="fb-img-wrap">
          <img src="${p.image}" alt="صورة منشور فيسبوك" loading="lazy">
        </div>
        <div class="fb-stats-bar">
          <span>👍 ${p.likes} إعجاب · ${p.comments} تعليق</span>
          <a href="${p.url}" target="_blank" rel="noopener" class="fb-link-btn">
            <span>مشاهدة المنشور الأصلي</span> 📘
          </a>
        </div>
      </div>
    `
      )
      .join('');
  }

  // Switch tabs
  if (igTabBtn && fbTabBtn && igView && fbView) {
    igTabBtn.addEventListener('click', () => {
      igTabBtn.classList.add('active');
      fbTabBtn.classList.remove('active');
      igView.style.display = 'block';
      fbView.style.display = 'none';
    });

    fbTabBtn.addEventListener('click', () => {
      fbTabBtn.classList.add('active');
      igTabBtn.classList.remove('active');
      igView.style.display = 'none';
      fbView.style.display = 'block';
    });
  }
}

/**
 * Cart Drawer Logic
 */
function initCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const openBtn = document.getElementById('open-cart-btn');
  const closeBtn = document.getElementById('close-cart-btn');
  const itemsContainer = document.getElementById('cart-items-container');
  const counter = document.getElementById('cart-counter');
  const subtotalEl = document.getElementById('cart-subtotal-val');
  const totalEl = document.getElementById('cart-total-val');
  const proceedBtn = document.getElementById('proceed-checkout-btn');

  function updateCartUI() {
    const items = CartManager.getItems();
    const count = CartManager.getItemCount();
    const subtotal = CartManager.getSubtotal();

    if (counter) counter.textContent = count;
    if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} د.أ`;
    if (totalEl) totalEl.textContent = `${subtotal.toFixed(2)} د.أ`;

    if (!itemsContainer) return;

    if (items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">🛒</div>
          <h4>سلتك فارغة حالياً</h4>
          <p>اختر باقتك المفضلة وأضفها للسلة لتجهيز طلبك</p>
        </div>
      `;
      if (proceedBtn) proceedBtn.style.display = 'none';
      return;
    }

    if (proceedBtn) proceedBtn.style.display = 'flex';

    itemsContainer.innerHTML = items
      .map(item => `
        <div class="cart-item-row" data-id="${item.product.id}">
          <img src="${item.product.image}" alt="${item.product.title}" class="cart-item-img">
          <div class="cart-item-info">
            <h5 class="cart-item-title">${item.product.title}</h5>
            <div class="cart-item-price">${(item.product.price * item.quantity).toFixed(2)} د.أ</div>
          </div>
          <div class="cart-item-ctrl">
            <button type="button" class="qty-btn" data-action="decrease" data-id="${item.product.id}">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button type="button" class="qty-btn" data-action="increase" data-id="${item.product.id}">+</button>
          </div>
          <button type="button" class="btn-remove-item" data-action="remove" data-id="${item.product.id}" title="حذف">🗑️</button>
        </div>
      `)
      .join('');

    // Quantity events
    itemsContainer.querySelectorAll('.qty-btn').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        const act = b.getAttribute('data-action');
        CartManager.updateQuantity(id, act === 'increase' ? 1 : -1);
      });
    });

    // Remove event
    itemsContainer.querySelectorAll('.btn-remove-item').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        CartManager.removeItem(id);
      });
    });
  }

  // Subscribe to cart changes
  CartManager.subscribe(updateCartUI);
  updateCartUI();

  // Drawer Open/Close
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      overlay.classList.add('active');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  }

  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      if (CartManager.getItemCount() === 0) {
        showToast('يرجى إضافة زهور إلى السلة أولاً!');
        return;
      }
      overlay.classList.remove('active');
      openCheckoutModal();
    });
  }
}

/**
 * Checkout Flow & Modal
 */
function openCheckoutModal() {
  const modalOverlay = document.getElementById('checkout-modal-overlay');
  const modalTotal = document.getElementById('modal-total-display');
  if (modalTotal) {
    modalTotal.textContent = `${CartManager.getSubtotal().toFixed(2)} د.أ`;
  }
  if (modalOverlay) {
    modalOverlay.classList.add('active');
  }
}

function initCheckoutFlow() {
  const modalOverlay = document.getElementById('checkout-modal-overlay');
  const closeBtn = document.getElementById('close-checkout-btn');
  const form = document.getElementById('checkout-form');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      if (CartManager.getItemCount() === 0) {
        showToast('السلة فارغة!');
        return;
      }

      const orderDetails = {
        buyerName: document.getElementById('buyer-name').value.trim(),
        buyerPhone: document.getElementById('buyer-phone').value.trim(),
        recipientName: document.getElementById('recipient-name').value.trim(),
        recipientPhone: document.getElementById('recipient-phone').value.trim(),
        city: document.getElementById('city-select').value,
        address: document.getElementById('detailed-address').value.trim(),
        deliveryDate: document.getElementById('delivery-date').value,
        deliveryTime: document.getElementById('delivery-time').value,
        cardMessage: document.getElementById('gift-card-message').value.trim(),
        cardSign: document.getElementById('gift-card-sign').value.trim(),
        notes: document.getElementById('order-notes').value.trim()
      };

      // Save order to history for the Dashboard
      saveOrderToLocalHistory(orderDetails, CartManager.getItems(), CartManager.getSubtotal());

      // Generate WhatsApp Link
      const targetPhone = StoreConfig.defaultWhatsApp;
      const waUrl = CartManager.generateWhatsAppOrderUrl(orderDetails, targetPhone);

      // Close modal and clear cart
      modalOverlay.classList.remove('active');
      form.reset();
      CartManager.clear();

      showToast('جاري فتح الواتساب لإرسال الطلب... 💐');

      // Open WhatsApp in new tab/app
      window.open(waUrl, '_blank');
    });
  }
}

/**
 * Save placed order to local history for Dashboard inspection
 */
function saveOrderToLocalHistory(details, items, subtotal) {
  const STORAGE_KEY_ORDERS = 'leen_flowers_orders';
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]');
    const newOrder = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString(),
      customerName: details.buyerName,
      customerPhone: details.buyerPhone,
      recipientName: details.recipientName || details.buyerName,
      city: details.city,
      address: details.address,
      items: items.map(i => ({ title: i.product.title, qty: i.quantity, price: i.product.price })),
      subtotal: subtotal,
      cardMessage: details.cardMessage,
      status: 'pending' // pending, processing, delivered
    };
    existing.unshift(newOrder);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(existing));
  } catch (err) {
    console.warn('Could not record order in local history', err);
  }
}

/**
 * Auto-fill delivery date
 */
function initDeliveryDateInput() {
  const dateInput = document.getElementById('delivery-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }
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
