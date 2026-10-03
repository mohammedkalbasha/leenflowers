/**
 * Dashboard Logic for Leen Flowers (متجر لين للزهور)
 * Prepares the admin interface for Phase 2 Database integration
 */

import { StoreConfig } from './store-config.js';
import { getProducts, saveProducts, resetDefaultProducts, initialCategories } from './products-data.js';

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
