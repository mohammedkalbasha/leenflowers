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

export const StoreConfig = {
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
