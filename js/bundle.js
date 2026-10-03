
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
 * Ultra-Realistic 3D Velvet Rose & Petals Scene for Leen Flowers (متجر لين للزهور)
 * Natural organic petal curves, velvet textures, golden ratio spiral, and calibrated studio lighting.
 */

function initThreeFlowerScene(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  if (typeof THREE === 'undefined') {
    console.warn('Three.js is not loaded.');
    return null;
  }

  // Dimensions
  let width = container.clientWidth || 440;
  let height = container.clientHeight || 440;
  if (width < 100) width = 440;
  if (height < 100) height = 440;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 0.6, 5.0);

  // High Quality Renderer with balanced tone mapping
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (e) {
    console.error('WebGL init error', e);
    return null;
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0; // Prevent white blowout!
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'pan-y';

  // --- Theme Color Definitions (Rich, saturated velvet colors) ---
  const themes = {
    blush: {
      petalBase: '#730d20',
      petalMid: '#b81938',
      petalEdge: '#d83756',
      petalRim: '#f26882',
      sheenColor: 0xff99aa,
      stemColor: 0x1d3d25,
      sepalColor: 0x275231,
      ambientColor: 0xffedf0,
      keyColor: 0xfff0e8,
      rimColor: 0xffa3b6,
      haloColor: 0xd4af37
    },
    lavender: {
      petalBase: '#3c256e',
      petalMid: '#5c3ca6',
      petalEdge: '#7f5ec9',
      petalRim: '#a98ee8',
      sheenColor: 0xd5c4ff,
      stemColor: 0x1d3b2a,
      sepalColor: 0x29533b,
      ambientColor: 0xf2effb,
      keyColor: 0xffffff,
      rimColor: 0xcaa9ff,
      haloColor: 0x8e7cc3
    },
    midnight: {
      petalBase: '#5e0516',
      petalMid: '#990c27',
      petalEdge: '#d4173b',
      petalRim: '#ff4d6d',
      sheenColor: 0xff8599,
      stemColor: 0x142b1a,
      sepalColor: 0x1c3a24,
      ambientColor: 0x1f2333,
      keyColor: 0xffe8cc,
      rimColor: 0xf5c065,
      haloColor: 0xf5c065
    }
  };

  let currentThemeName = document.documentElement.getAttribute('data-theme') || 'blush';
  if (!themes[currentThemeName]) currentThemeName = 'blush';
  let theme = themes[currentThemeName];

  // --- Calibrated Studio Lighting (Soft & Rich, NOT Overblown) ---
  const ambientLight = new THREE.AmbientLight(theme.ambientColor, 0.65);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(theme.keyColor, 1.15);
  keyLight.position.set(3, 5, 4);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const softFillLight = new THREE.DirectionalLight(0xffffff, 0.45);
  softFillLight.position.set(-3, 1, 2);
  scene.add(softFillLight);

  const rimLight = new THREE.PointLight(theme.rimColor, 1.2, 8);
  rimLight.position.set(0, 2.8, -2);
  scene.add(rimLight);

  // Group holding the entire flower
  const flowerGroup = new THREE.Group();
  scene.add(flowerGroup);

  // --- Procedural Organic Rose Petal Texture Generator ---
  function generatePetalTexture(baseHex, midHex, edgeHex, rimHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 512);

    // Natural curved heart/oval rose petal outline with alpha clip
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(256, 480); // tapered stem base

    // Left curved margin
    ctx.bezierCurveTo(80, 420, 30, 240, 60, 140);
    // Left shoulder to top rounded lobes
    ctx.bezierCurveTo(80, 50, 190, 40, 256, 80);
    // Right shoulder
    ctx.bezierCurveTo(322, 40, 432, 50, 452, 140);
    // Right margin to base
    ctx.bezierCurveTo(482, 240, 432, 420, 256, 480);
    ctx.closePath();
    ctx.clip();

    // 1. Rich velvet radial gradient
    const grad = ctx.createRadialGradient(256, 450, 40, 256, 200, 320);
    grad.addColorStop(0, baseHex);
    grad.addColorStop(0.35, midHex);
    grad.addColorStop(0.75, edgeHex);
    grad.addColorStop(1, rimHex);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // 2. Micro velvet veins radiating from base
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    for (let a = -0.55; a <= 0.55; a += 0.05) {
      ctx.beginPath();
      ctx.moveTo(256, 470);
      const endX = 256 + Math.sin(a) * 380;
      const endY = 80 + Math.abs(a) * 80;
      const cpX = 256 + Math.sin(a) * 200 + (Math.random() * 10 - 5);
      const cpY = 280;
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.stroke();
    }

    // 3. Delicate velvet rim glow
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.stroke();

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
  }

  // --- Procedural Rose Leaf Texture Generator ---
  function generateLeafTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 256, 512);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(128, 490);
    ctx.bezierCurveTo(20, 380, 10, 180, 128, 20); // leaf tip
    ctx.bezierCurveTo(246, 180, 236, 380, 128, 490);
    ctx.closePath();
    ctx.clip();

    // Dark forest green gradient
    const grad = ctx.createLinearGradient(128, 490, 128, 20);
    grad.addColorStop(0, '#162e1c');
    grad.addColorStop(0.5, '#244d2d');
    grad.addColorStop(1, '#33683f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    // Central vein
    ctx.strokeStyle = '#478255';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(128, 490);
    ctx.lineTo(128, 30);
    ctx.stroke();

    // Side veins
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    for (let y = 100; y < 450; y += 35) {
      ctx.beginPath();
      ctx.moveTo(128, y);
      ctx.lineTo(60, y - 40);
      ctx.moveTo(128, y);
      ctx.lineTo(196, y - 40);
      ctx.stroke();
    }
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }

  // Initial textures
  let petalTexture = generatePetalTexture(theme.petalBase, theme.petalMid, theme.petalEdge, theme.petalRim);
  const leafTexture = generateLeafTexture();

  // --- Smooth Natural Curved Petal Mesh Builder ---
  function createCurvedPetalGeometry(width, height, cupDepth, curlBack) {
    const geom = new THREE.PlaneGeometry(width, height, 16, 16);
    const pos = geom.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Normalized coordinates: -1 to +1 horizontally, 0 to 1 vertically
      const u = x / (width * 0.5);
      const v = (y + height * 0.5) / height;

      // Natural cup curve: deep depression in the middle
      const cup = -Math.sin(v * Math.PI) * (1 - u * u) * cupDepth;

      // Top petal margin curling gracefully outward
      const curl = v > 0.75 ? Math.sin((v - 0.75) * 4 * (Math.PI * 0.5)) * curlBack : 0;

      // Slight wavy organic edge
      const wave = Math.sin(u * Math.PI * 3) * 0.02 * v;

      pos.setZ(i, cup + curl + wave);
    }

    geom.computeVertexNormals();
    return geom;
  }

  // Petal Material
  const petalMaterial = new THREE.MeshStandardMaterial({
    map: petalTexture,
    roughness: 0.42,
    metalness: 0.05,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.1,
    shadowSide: THREE.DoubleSide
  });

  // --- Natural Fibonacci Spiral Golden Blooming Rose Head ---
  const roseHead = new THREE.Group();

  // Layers of petals expanding outward in golden angle spiral
  const petalLayers = [
    // Layer 1: Core tightly wound spiral bud
    { count: 4, w: 0.55, h: 0.75, r: 0.08, tilt: 0.2, cup: 0.25, curl: -0.05, yOffset: 0.2 },
    // Layer 2: Inner blooming core
    { count: 6, w: 0.75, h: 0.95, r: 0.18, tilt: 0.42, cup: 0.35, curl: 0.08, yOffset: 0.14 },
    // Layer 3: Middle velvet swirl
    { count: 8, w: 1.05, h: 1.25, r: 0.34, tilt: 0.65, cup: 0.45, curl: 0.18, yOffset: 0.08 },
    // Layer 4: Open radiant bloom
    { count: 10, w: 1.35, h: 1.5, r: 0.55, tilt: 0.92, cup: 0.55, curl: 0.28, yOffset: 0.02 },
    // Layer 5: Large outer drooping lush petals
    { count: 12, w: 1.65, h: 1.7, r: 0.82, tilt: 1.25, cup: 0.62, curl: 0.42, yOffset: -0.06 }
  ];

  petalLayers.forEach((layer, layerIdx) => {
    const geom = createCurvedPetalGeometry(layer.w, layer.h, layer.cup, layer.curl);

    for (let i = 0; i < layer.count; i++) {
      const mesh = new THREE.Mesh(geom, petalMaterial);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Golden ratio spiral angle: 137.5 degrees
      const phi = (i / layer.count) * Math.PI * 2 + layerIdx * 0.62;
      const x = Math.cos(phi) * layer.r;
      const z = Math.sin(phi) * layer.r;

      mesh.position.set(x, layer.yOffset + (Math.random() * 0.03 - 0.015), z);
      mesh.rotation.y = -phi - Math.PI / 2;
      mesh.rotation.x = layer.tilt + (Math.random() * 0.06 - 0.03);
      mesh.rotation.z = Math.random() * 0.08 - 0.04;

      roseHead.add(mesh);
    }
  });

  // Central rose core stamen with tiny golden pollen tips
  const centerCoreGeom = new THREE.SphereGeometry(0.2, 16, 16);
  const centerCoreMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(theme.petalBase),
    roughness: 0.6
  });
  const centerCore = new THREE.Mesh(centerCoreGeom, centerCoreMat);
  centerCore.scale.set(0.8, 1.2, 0.8);
  centerCore.position.y = 0.25;
  roseHead.add(centerCore);

  // Glistening Dew Drops (Spheres with glassy specular)
  const dropMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.92,
    ior: 1.33,
    transparent: true,
    opacity: 0.85
  });

  const dropGeom = new THREE.SphereGeometry(0.04, 8, 8);
  const dropCoords = [
    [0.35, 0.38, 0.45],
    [-0.42, 0.28, 0.38],
    [0.15, 0.48, -0.35],
    [0.55, 0.15, -0.2]
  ];
  dropCoords.forEach(([dx, dy, dz]) => {
    const drop = new THREE.Mesh(dropGeom, dropMat);
    drop.position.set(dx, dy, dz);
    drop.scale.set(1, 0.7, 1);
    roseHead.add(drop);
  });

  flowerGroup.add(roseHead);
  roseHead.position.y = 0.55;

  // --- Green Calyx (5 Sepals hugging flower base) ---
  const sepalMat = new THREE.MeshStandardMaterial({
    color: theme.sepalColor,
    roughness: 0.65,
    side: THREE.DoubleSide
  });

  const sepalGeom = new THREE.ConeGeometry(0.18, 0.85, 4);
  sepalGeom.translate(0, -0.35, 0);

  for (let s = 0; s < 5; s++) {
    const sepal = new THREE.Mesh(sepalGeom, sepalMat);
    const angle = (s / 5) * Math.PI * 2;
    sepal.position.set(Math.cos(angle) * 0.38, 0.38, Math.sin(angle) * 0.38);
    sepal.rotation.y = -angle;
    sepal.rotation.x = 0.65;
    sepal.castShadow = true;
    flowerGroup.add(sepal);
  }

  // --- Natural Curved Stem with Thorns ---
  const stemCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.42, 0),
    new THREE.Vector3(0.06, -0.6, 0.04),
    new THREE.Vector3(-0.08, -1.6, -0.04),
    new THREE.Vector3(0.02, -2.6, 0.0)
  );

  const stemGeom = new THREE.TubeGeometry(stemCurve, 32, 0.065, 12, false);
  const stemMat = new THREE.MeshStandardMaterial({
    color: theme.stemColor,
    roughness: 0.68,
    metalness: 0.05
  });
  const stem = new THREE.Mesh(stemGeom, stemMat);
  stem.castShadow = true;
  flowerGroup.add(stem);

  // Thorns
  const thornGeom = new THREE.ConeGeometry(0.045, 0.16, 4);
  thornGeom.rotateX(Math.PI / 2);
  const thornMat = new THREE.MeshStandardMaterial({ color: 0x5a1820, roughness: 0.5 });

  const thorn1 = new THREE.Mesh(thornGeom, thornMat);
  thorn1.position.set(0.07, -0.4, 0.05);
  thorn1.rotation.y = 0.8;
  flowerGroup.add(thorn1);

  const thorn2 = new THREE.Mesh(thornGeom, thornMat);
  thorn2.position.set(-0.08, -1.1, -0.03);
  thorn2.rotation.y = -2.2;
  flowerGroup.add(thorn2);

  // --- Natural Leaves with Leaf Vein Textures ---
  const leafMat = new THREE.MeshStandardMaterial({
    map: leafTexture,
    roughness: 0.52,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.1
  });

  const leafGeom = new THREE.PlaneGeometry(0.7, 1.25, 8, 8);
  // Curve leaf slightly
  const lpos = leafGeom.attributes.position;
  for (let i = 0; i < lpos.count; i++) {
    const v = (lpos.getY(i) + 0.6) / 1.2;
    lpos.setZ(i, -Math.sin(v * Math.PI) * 0.18);
  }
  leafGeom.computeVertexNormals();

  const leaf1 = new THREE.Mesh(leafGeom, leafMat);
  leaf1.position.set(0.65, -0.5, 0.25);
  leaf1.rotation.set(0.4, 0.8, -0.5);
  leaf1.castShadow = true;
  flowerGroup.add(leaf1);

  const leaf2 = new THREE.Mesh(leafGeom, leafMat);
  leaf2.position.set(-0.7, -1.0, 0.2);
  leaf2.rotation.set(0.35, -1.1, 0.65);
  leaf2.castShadow = true;
  flowerGroup.add(leaf2);

  // Elegant golden ring halo around the rose
  const haloGeom = new THREE.TorusGeometry(1.65, 0.014, 16, 64);
  const haloMat = new THREE.MeshStandardMaterial({
    color: theme.haloColor,
    metalness: 0.85,
    roughness: 0.22
  });
  const halo = new THREE.Mesh(haloGeom, haloMat);
  halo.rotation.x = Math.PI / 2.3;
  halo.position.y = 0.55;
  flowerGroup.add(halo);

  // --- Falling & Floating Velvety Rose Petals ---
  const petalCount = 26;
  const floatingPetals = [];
  const petalParticleGroup = new THREE.Group();
  scene.add(petalParticleGroup);

  const smallPetalGeom = createCurvedPetalGeometry(0.35, 0.48, 0.12, 0.06);

  for (let i = 0; i < petalCount; i++) {
    const pMesh = new THREE.Mesh(smallPetalGeom, petalMaterial);
    pMesh.position.set(
      (Math.random() - 0.5) * 5.5,
      Math.random() * 5 - 1.5,
      (Math.random() - 0.5) * 4.5
    );
    pMesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    floatingPetals.push({
      mesh: pMesh,
      speedY: 0.007 + Math.random() * 0.011,
      rotX: (Math.random() - 0.5) * 0.016,
      rotY: (Math.random() - 0.5) * 0.016,
      rotZ: (Math.random() - 0.5) * 0.016,
      sway: Math.random() * Math.PI * 2
    });
    petalParticleGroup.add(pMesh);
  }

  // --- Smooth Interaction Tracking ---
  let isDragging = false;
  let prevX = 0;
  let prevY = 0;
  let targetRotY = 0;
  let targetRotX = 0.12;
  let targetTiltZ = 0;

  function onPointerMove(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (isDragging) {
      const deltaX = clientX - prevX;
      const deltaY = clientY - prevY;
      targetRotY += deltaX * 0.012;
      targetRotX += deltaY * 0.01;
      targetRotX = Math.max(-0.35, Math.min(0.55, targetRotX));
      prevX = clientX;
      prevY = clientY;
    } else {
      const rect = container.getBoundingClientRect();
      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = normX * 0.45;
      targetRotX = 0.15 - normY * 0.25;
      targetTiltZ = -normX * 0.12;
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

  // Resize
  function handleResize() {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth || 440;
    const h = container.clientHeight || 440;
    if (w < 50 || h < 50) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', handleResize);
  if (window.ResizeObserver) {
    new ResizeObserver(handleResize).observe(container);
  }

  // --- Theme Updater ---
  function updateTheme3D(newTheme) {
    if (!themes[newTheme]) return;
    theme = themes[newTheme];

    // Re-generate petal texture with new rich tones
    petalTexture.dispose();
    petalTexture = generatePetalTexture(theme.petalBase, theme.petalMid, theme.petalEdge, theme.petalRim);
    petalMaterial.map = petalTexture;
    petalMaterial.needsUpdate = true;

    // Update colors
    centerCoreMat.color.set(theme.petalBase);
    stemMat.color.setHex(theme.stemColor);
    sepalMat.color.setHex(theme.sepalColor);
    haloMat.color.setHex(theme.haloColor);

    ambientLight.color.setHex(theme.ambientColor);
    keyLight.color.setHex(theme.keyColor);
    rimLight.color.setHex(theme.rimColor);
  }

  // --- Animation Loop ---
  let animId = null;
  const clock = new THREE.Clock();

  function animate() {
    animId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Natural breathing floating motion
    flowerGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.05;

    // Smooth inertia
    flowerGroup.rotation.x += (targetRotX - flowerGroup.rotation.x) * 0.08;
    flowerGroup.rotation.y += (targetRotY - flowerGroup.rotation.y) * 0.08;
    flowerGroup.rotation.z += (targetTiltZ - flowerGroup.rotation.z) * 0.08;

    // Subtle idle spin
    if (!isDragging) {
      targetRotY += 0.003;
    }

    // Spin halo gently
    halo.rotation.z += 0.006;

    // Animate falling petals
    floatingPetals.forEach(p => {
      p.mesh.position.y -= p.speedY;
      p.mesh.position.x += Math.sin(elapsedTime * 1.1 + p.sway) * 0.003;
      p.mesh.rotation.x += p.rotX;
      p.mesh.rotation.y += p.rotY;
      p.mesh.rotation.z += p.rotZ;

      if (p.mesh.position.y < -2.6) {
        p.mesh.position.y = 2.8;
        p.mesh.position.x = (Math.random() - 0.5) * 5.5;
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
