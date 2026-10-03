/**
 * Cart Manager & WhatsApp Order Dispatcher for Leen Flowers (متجر لين للزهور)
 */

import { StoreConfig } from './store-config.js';

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

export const CartManager = new CartStore();
