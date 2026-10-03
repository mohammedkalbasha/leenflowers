/**
 * Dashboard Logic for Leen Flowers (متجر لين للزهور)
 * Phase 2: Full SQLite REST API, PIN Protection, Live Orders, and Printable Vouchers
 */

import { ApiClient } from './api-client.js';
import { StoreConfig } from './store-config.js';
import { getProducts, saveProducts, resetDefaultProducts, initialCategories } from './products-data.js';

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
