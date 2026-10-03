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
      exactTime = '',
      locationUrl = '',
      fulfillmentType = 'delivery',
      isGiftCard = false,
      cardMessage = '',
      cardSign = '',
      notes = ''
    } = details;

    const subtotal = this.getSubtotal();
    const isPickup = fulfillmentType === 'pickup';
    const deliveryFee = isPickup
      ? 0
      : (details.deliveryFee !== undefined ? Number(details.deliveryFee) : 3.0);
    const grandTotal = subtotal + deliveryFee;

    const itemsText = this.items
      .map((item, index) => {
        const itemTotal = (item.product.price * item.quantity).toFixed(2);
        return `${index + 1}. ${item.quantity}x ${item.product.title} (${itemTotal} د.أ)`;
      })
      .join('\n');

    let msg = `🌸 *طلب جديد من متجر لين للزهور (Leen Flowers)* 🌸\n`;
    if (details.orderNumber) {
      msg += `🏷️ *رقم الطلب الرسمي:* ${details.orderNumber}\n`;
    }
    msg += `─────────────────────────\n`;
    msg += `👤 *بيانات المشتري (صاحب الطلب):*\n`;
    msg += `• الاسم: ${buyerName || 'غير محدد'}\n`;
    msg += `• الهاتف: ${buyerPhone || 'غير محدد'}\n\n`;

    if (isPickup) {
      msg += `🏬 *طريقة وموعد الاستلام:*\n`;
      msg += `• نوع الطلب: استلام من المحل (الفرع الرئيسي) 🏬\n`;
      msg += `• تاريخ الاستلام المطلوب: ${deliveryDate || 'اليوم'}\n`;
      if (exactTime && exactTime.trim()) {
        msg += `• ساعة الاستلام المحددة: ${exactTime.trim()} (${deliveryTime || 'مساءً'})\n\n`;
      } else {
        msg += `• فترة الاستلام: ${deliveryTime || 'خلال ساعات الدوام'}\n\n`;
      }
    } else {
      if (details.deliveryRecipientType === 'other' || (recipientName && recipientName !== buyerName)) {
        msg += `🎁 *بيانات المستلم (إهداء لشخص آخر):*\n`;
        msg += `• اسم المستلم: ${recipientName}\n`;
        msg += `• هاتف المستلم: ${recipientPhone || 'غير محدد'}\n\n`;
      } else {
        msg += `🏠 *المستلم:* التوصيل للمشتري نفسه (${buyerName})\n\n`;
      }

      msg += `📍 *تفاصيل التوصيل إلى العنوان:*\n`;
      msg += `• نوع الطلب: توصيل إلى العنوان 🚗\n`;
      msg += `• المدينة / المنطقة: ${city || 'عمان'}\n`;
      msg += `• العنوان التفصيلي: ${address || 'سيتم التوضيح عبر الواتساب'}\n`;
      if (locationUrl && locationUrl.trim()) {
        msg += `• رابط الموقع الجغرافي: ${locationUrl.trim()}\n`;
      }
      msg += `• تاريخ التوصيل المطلوب: ${deliveryDate || 'في أقرب وقت'}\n`;
      if (exactTime && exactTime.trim()) {
        msg += `• الساعة المحددة: ${exactTime.trim()} (${deliveryTime || 'مساءً'})\n\n`;
      } else {
        msg += `• الفترة: ${deliveryTime || 'خلال اليوم'}\n\n`;
      }
    }

    if ((isGiftCard || cardMessage) && cardMessage && cardMessage.trim()) {
      msg += `💌 *بطاقة الإهداء (مرفقة مع الورد):*\n`;
      msg += `"${cardMessage.trim()}"\n`;
      if (cardSign && cardSign.trim()) {
        msg += `✍️ التوقيع: ${cardSign.trim()}\n`;
      }
      msg += `\n`;
    } else if (isGiftCard) {
      msg += `💌 *بطاقة الإهداء:* بطاقة فارغة لكتابة الإهداء يدوياً عند الاستلام\n\n`;
    } else {
      msg += `💌 *بطاقة الإهداء:* بدون كرت إهداء\n\n`;
    }

    msg += `🛍️ *تفاصيل المنتجات:*\n`;
    msg += `${itemsText}\n`;
    msg += `─────────────────────────\n`;
    msg += `💰 *قيمة المنتجات:* ${subtotal.toFixed(2)} د.أ\n`;
    if (isPickup) {
      msg += `🏬 *رسوم التوصيل:* مجاناً 0.00 د.أ (استلام من المحل)\n`;
    } else {
      msg += `🚗 *رسوم التوصيل:* ${deliveryFee.toFixed(2)} د.أ\n`;
    }
    msg += `✨ *المجموع الإجمالي:* ${grandTotal.toFixed(2)} د.أ\n`;

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
