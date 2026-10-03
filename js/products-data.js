/**
 * Products Data Repository for Leen Flowers (متجر لين للزهور)
 * Ready to be migrated to a backend database in Phase 2
 */

const STORAGE_KEY_PRODUCTS = 'leen_flowers_products';

export const initialCategories = [
  { id: 'all', name: 'جميع الزهور والهدايا', icon: '🌸' },
  { id: 'natural-bouquets', name: 'باقات ورد طبيعي', icon: '🌹' },
  { id: 'gift-boxes', name: 'بوكسات ورد وهدايا', icon: '🎁' },
  { id: 'vases', name: 'فازات واستاندات فاخرة', icon: '🏺' },
  { id: 'occasions', name: 'مناسبات وتخرج وأعراس', icon: '🎓' }
];

export const initialProducts = [
  {
    id: 'lf-001',
    title: 'باقة جوري أحمر ملكي (Royal Crimson)',
    category: 'natural-bouquets',
    price: 25.0,
    oldPrice: 30.0,
    badge: 'الأكثر طلباً ⭐',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    description: 'تنسيق استثنائي من 25 جورية حمراء هولندية فاخرة مع أوراق الأوكالبتوس العطرية، مغلفة بطبقات الورق الحريري الأسود والأبيض وشريط ساتان عريض.',
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
    inStock: true,
    featured: false
  }
];

export function getProducts() {
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

export function getProductById(id) {
  const products = getProducts();
  return products.find(p => p.id === id);
}

export function saveProducts(productsList) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(productsList));
    } catch (e) {
      console.warn('Could not save products to localStorage', e);
    }
  }
  return productsList;
}

export function resetDefaultProducts() {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
  }
  return [...initialProducts];
}
