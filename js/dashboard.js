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
 * Products Table & Add / Edit Product Modal
 */
let cachedProducts = [];

function initProductsTable() {
  const tbody = document.getElementById('dashboard-products-tbody');
  const resetBtn = document.getElementById('btn-reset-products');
  const openAddModalBtn = document.getElementById('btn-open-add-product');
  const addModalOverlay = document.getElementById('add-product-modal-overlay');
  const closeAddModalBtn = document.getElementById('close-add-modal-btn');
  const cancelProdModalBtn = document.getElementById('btn-cancel-prod-modal');
  const addForm = document.getElementById('add-product-form');

  // Modal Controls
  const editProdIdInput = document.getElementById('edit-prod-id');
  const modalIcon = document.getElementById('modal-product-icon');
  const modalTitle = document.getElementById('modal-product-title');
  const submitBtnText = document.getElementById('btn-submit-product-text');

  // Image Album & Upload Controls
  const dropzone = document.getElementById('image-upload-dropzone');
  const fileInput = document.getElementById('local-file-upload-input');
  const urlInput = document.getElementById('new-prod-image-url-input');
  const btnAddUrl = document.getElementById('btn-add-image-url');
  const albumGrid = document.getElementById('album-thumbnails-grid');
  const albumCount = document.getElementById('album-count');

  let modalImagesList = [];

  // Toolbar & Filter Controls
  const searchInput = document.getElementById('dash-prod-search');
  const clearSearchBtn = document.getElementById('dash-prod-search-clear');
  const catFilter = document.getElementById('dash-prod-cat-filter');
  const stockFilter = document.getElementById('dash-prod-stock-filter');
  const counterDisplay = document.getElementById('dash-prod-counter');

  let currentSearchQuery = '';
  let currentCatFilter = 'all';
  let currentStockFilter = 'all';

  const catMap = {
    'natural-bouquets': 'باقات ورد طبيعي',
    'gift-boxes': 'بوكسات ورد وهدايا',
    'vases': 'فازات واستاندات فاخرة',
    'occasions': 'مناسبات وتخرج وأعراس'
  };

  async function loadProductsData() {
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
    renderProducts();
  }

  function getFilteredProducts() {
    return cachedProducts.filter(p => {
      // 1. Search Query
      if (currentSearchQuery) {
        const q = currentSearchQuery.toLowerCase();
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const badgeMatch = (p.badge || '').toLowerCase().includes(q);
        const catNameMatch = (catMap[p.category] || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !badgeMatch && !catNameMatch) return false;
      }

      // 2. Category Filter
      if (currentCatFilter !== 'all' && p.category !== currentCatFilter) {
        return false;
      }

      // 3. Stock Filter
      if (currentStockFilter === 'in' && !p.inStock) return false;
      if (currentStockFilter === 'out' && p.inStock) return false;

      return true;
    });
  }

  function renderProducts() {
    if (!tbody) return;

    const filtered = getFilteredProducts();

    // Update Counter
    if (counterDisplay) {
      counterDisplay.innerHTML = `المعروض: <strong>${filtered.length}</strong> من أصل ${cachedProducts.length} باقة`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:36px 16px; color:var(--text-muted);">
            <div style="font-size:2rem; margin-bottom:8px;">🔍</div>
            <strong style="font-size:1.05rem; display:block; margin-bottom:4px;">لم يتم العثور على أي باقات مطابقة</strong>
            <span style="font-size:0.85rem;">جرّب تعديل كلمات البحث أو تغيير الفلتر المختار</span>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const priceNum = parseFloat(p.price) || 0;
      const oldPriceNum = p.oldPrice ? parseFloat(p.oldPrice) : null;
      const catLabel = catMap[p.category] || p.category;

      return `
        <tr data-id="${p.id}">
          <td class="dash-prod-thumb-cell">
            <img src="${p.image}" alt="${p.title}" class="dash-prod-thumb" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100'">
          </td>
          <td>
            <div class="dash-prod-title-wrap">
              <span class="dash-prod-title">${p.title}</span>
              <div class="dash-prod-meta">
                <span class="dash-prod-id">${p.id}</span>
                ${p.badge ? `<span class="dash-prod-badge-tag">${p.badge}</span>` : ''}
                ${p.featured ? `<span class="dash-prod-featured-tag">⭐ مميز</span>` : ''}
              </div>
            </div>
          </td>
          <td>
            <span class="dash-cat-pill dash-cat-${p.category}">
              ${catLabel}
            </span>
          </td>
          <td>
            <div class="dash-price-box">
              <span class="dash-price-current">${priceNum.toFixed(2)} د.أ</span>
              ${oldPriceNum ? `<span class="dash-price-old">${oldPriceNum.toFixed(2)} د.أ</span>` : ''}
            </div>
          </td>
          <td style="text-align:center;">
            <button type="button" class="dash-btn-stock ${p.inStock ? 'in-stock' : 'out-stock'}" data-action="toggle-stock" data-id="${p.id}" title="انقر لتغيير التوفر فوراً">
              <span class="stock-dot"></span>
              <span>${p.inStock ? 'متوفر بالمحل ✓' : 'نفد من المحل ✕'}</span>
            </button>
          </td>
          <td>
            <div class="dash-table-actions">
              <button type="button" class="dash-btn-action dash-btn-edit" data-action="edit" data-id="${p.id}" title="تعديل بيانات وسعر الباقة">
                ✏️ تعديل
              </button>
              <button type="button" class="dash-btn-action dash-btn-del" data-action="delete" data-id="${p.id}" title="حذف الباقة من المتجر">
                🗑️ حذف
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    updateDashboardStats();
  }

  loadProductsData();

  // Toolbar Listeners
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      currentSearchQuery = e.target.value.trim();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearchQuery ? 'inline-block' : 'none';
      }
      renderProducts();
    });
  }

  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchQuery = '';
      clearSearchBtn.style.display = 'none';
      searchInput.focus();
      renderProducts();
    });
  }

  if (catFilter) {
    catFilter.addEventListener('change', e => {
      currentCatFilter = e.target.value;
      renderProducts();
    });
  }

  if (stockFilter) {
    stockFilter.addEventListener('change', e => {
      currentStockFilter = e.target.value;
      renderProducts();
    });
  }

  // Album Rendering
  function renderAlbumThumbnails() {
    if (albumCount) albumCount.textContent = modalImagesList.length;
    if (!albumGrid) return;

    if (modalImagesList.length === 0) {
      albumGrid.innerHTML = `
        <div class="album-empty-notice">
          لم يتم إضافة أي صور بعد. اسحب صوراً من جهازك أو أضف روابط بالأعلى.
        </div>
      `;
      return;
    }

    albumGrid.innerHTML = modalImagesList.map((imgUrl, idx) => `
      <div class="album-thumb-card ${idx === 0 ? 'is-primary' : ''}">
        <img src="${imgUrl}" alt="صورة ${idx + 1}" onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100'">
        ${idx === 0 ? '<span class="album-primary-badge">الرئيسية ⭐</span>' : ''}
        <div class="album-thumb-overlay">
          ${idx !== 0 ? `<button type="button" class="album-thumb-btn make-primary" data-action="set-primary" data-idx="${idx}" title="تعيين كصورة رئيسية">⭐</button>` : ''}
          <button type="button" class="album-thumb-btn delete" data-action="remove-img" data-idx="${idx}" title="حذف من الألبوم">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  // Album Action Clicks (Set Primary / Remove Image)
  if (albumGrid) {
    albumGrid.addEventListener('click', e => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const idx = parseInt(btn.dataset.idx, 10);
      const action = btn.dataset.action;

      if (action === 'set-primary' && idx > 0 && idx < modalImagesList.length) {
        const item = modalImagesList.splice(idx, 1)[0];
        modalImagesList.unshift(item);
        renderAlbumThumbnails();
        showToast('تم تعيين الصورة كصورة رئيسية للمتجر ⭐');
      }

      if (action === 'remove-img' && idx >= 0 && idx < modalImagesList.length) {
        modalImagesList.splice(idx, 1);
        renderAlbumThumbnails();
        showToast('تمت إزالة الصورة من الألبوم 🗑️');
      }
    });
  }

  // Local File Upload / Dropzone
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleImageFiles(files) {
    const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArr.length === 0) {
      showToast('يرجى اختيار ملفات صور صالحة (PNG, JPG, WebP)');
      return;
    }

    showToast(`جاري معالجة ورفع ${fileArr.length} صور للألبوم... ⏳`);

    for (const file of fileArr) {
      try {
        const base64 = await readFileAsBase64(file);
        let uploadedUrl = base64;
        try {
          const res = await ApiClient.uploadImage(base64);
          if (res && res.url) {
            uploadedUrl = res.url;
          }
        } catch (_) {}
        modalImagesList.push(uploadedUrl);
      } catch (err) {
        console.warn('Error uploading file:', err);
      }
    }

    renderAlbumThumbnails();
    showToast(`تمت إضافة ${fileArr.length} صور إلى الألبوم بنجاح! 📸`);
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', e => {
      if (e.target.tagName !== 'INPUT') {
        fileInput.click();
      }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', e => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        handleImageFiles(files);
      }
    });

    fileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files.length > 0) {
        handleImageFiles(e.target.files);
        fileInput.value = '';
      }
    });
  }

  // Add URL Input
  if (btnAddUrl && urlInput) {
    btnAddUrl.addEventListener('click', () => {
      const url = urlInput.value.trim();
      if (!url) {
        showToast('يرجى كتابة أو لصق رابط الصورة أولاً!');
        urlInput.focus();
        return;
      }
      modalImagesList.push(url);
      urlInput.value = '';
      renderAlbumThumbnails();
      showToast('تمت إضافة رابط الصورة إلى الألبوم ✨');
    });

    urlInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnAddUrl.click();
      }
    });
  }

  // Open Add Product Modal (Create Mode)
  function openAddModal() {
    if (!addModalOverlay) return;
    if (addForm) addForm.reset();
    if (editProdIdInput) editProdIdInput.value = '';
    if (modalIcon) modalIcon.textContent = '🌹';
    if (modalTitle) modalTitle.textContent = 'إضافة باقة ورد / منتج جديد';
    if (submitBtnText) submitBtnText.textContent = 'حفظ وإضافة للمتجر';
    
    // Default initial image for new product
    modalImagesList = ['https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'];
    renderAlbumThumbnails();

    addModalOverlay.classList.add('active');
  }

  // Open Edit Product Modal (Edit Mode)
  function openEditModal(prodId) {
    const prod = cachedProducts.find(x => x.id === prodId);
    if (!prod || !addModalOverlay) return;

    if (editProdIdInput) editProdIdInput.value = prod.id;
    if (modalIcon) modalIcon.textContent = '✏️';
    if (modalTitle) modalTitle.textContent = `تعديل بيانات: ${prod.title}`;
    if (submitBtnText) submitBtnText.textContent = 'حفظ التعديلات';

    document.getElementById('new-prod-title').value = prod.title || '';
    document.getElementById('new-prod-category').value = prod.category || 'natural-bouquets';
    document.getElementById('new-prod-price').value = prod.price || '';
    document.getElementById('new-prod-old-price').value = prod.oldPrice || '';
    document.getElementById('new-prod-badge').value = prod.badge || '';
    document.getElementById('new-prod-desc').value = prod.description || '';

    const featuredCheckbox = document.getElementById('new-prod-featured');
    if (featuredCheckbox) {
      featuredCheckbox.checked = Boolean(prod.featured);
    }

    // Populate album images
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      modalImagesList = [...prod.images];
    } else if (prod.image) {
      modalImagesList = [prod.image];
    } else {
      modalImagesList = [];
    }
    renderAlbumThumbnails();

    addModalOverlay.classList.add('active');
  }

  function closeProductModal() {
    if (addModalOverlay) addModalOverlay.classList.remove('active');
  }

  if (openAddModalBtn) {
    openAddModalBtn.addEventListener('click', openAddModal);
  }

  if (closeAddModalBtn) {
    closeAddModalBtn.addEventListener('click', closeProductModal);
  }

  if (cancelProdModalBtn) {
    cancelProdModalBtn.addEventListener('click', closeProductModal);
  }

  if (addModalOverlay) {
    addModalOverlay.addEventListener('click', e => {
      if (e.target === addModalOverlay) closeProductModal();
    });
  }

  // Table Action Clicks (Toggle Stock / Edit / Delete)
  if (tbody) {
    tbody.addEventListener('click', async e => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const id = btn.dataset.id;

      // 1. Toggle In Stock
      if (action === 'toggle-stock') {
        const prod = cachedProducts.find(x => x.id === id);
        if (prod) {
          prod.inStock = !prod.inStock;
          try {
            await ApiClient.updateProduct(id, { inStock: prod.inStock });
          } catch (_) {}
          saveProducts(cachedProducts);
          renderProducts();
          const stateText = prod.inStock ? 'متوفر بالمحل' : 'غير متوفر (نفد)';
          showToast(`تم تحديث حالة [${prod.title}] إلى: ${stateText}`);
        }
      }

      // 2. Edit Product
      if (action === 'edit') {
        openEditModal(id);
      }

      // 3. Delete Product
      if (action === 'delete') {
        const prod = cachedProducts.find(x => x.id === id);
        const name = prod ? prod.title : id;
        if (confirm(`هل أنت متأكد من رغبتك بحذف المنتج [${name}] بشكل نهائي؟`)) {
          try {
            await ApiClient.deleteProduct(id);
          } catch (_) {}
          cachedProducts = cachedProducts.filter(x => x.id !== id);
          saveProducts(cachedProducts);
          renderProducts();
          showToast(`تم حذف المنتج [${name}] بنجاح 🗑️`);
        }
      }
    });
  }

  // Form Submit (Create or Update Product)
  if (addForm) {
    addForm.addEventListener('submit', async e => {
      e.preventDefault();

      const editId = editProdIdInput ? editProdIdInput.value.trim() : '';
      const isEditing = Boolean(editId);

      const title = document.getElementById('new-prod-title').value.trim();
      const category = document.getElementById('new-prod-category').value;
      const price = parseFloat(document.getElementById('new-prod-price').value);
      const oldPriceVal = document.getElementById('new-prod-old-price').value.trim();
      const oldPrice = oldPriceVal ? parseFloat(oldPriceVal) : null;
      const badge = document.getElementById('new-prod-badge').value.trim();
      const description = document.getElementById('new-prod-desc').value.trim();
      const featured = document.getElementById('new-prod-featured')
        ? document.getElementById('new-prod-featured').checked
        : false;

      if (modalImagesList.length === 0) {
        showToast('يرجى إضافة صورة واحدة على الأقل للباقة (عبر الرفع أو الرابط)!');
        return;
      }

      const primaryImage = modalImagesList[0];
      const imagesArray = [...modalImagesList];

      if (isEditing) {
        // UPDATE EXISTING PRODUCT
        const existingIdx = cachedProducts.findIndex(x => x.id === editId);
        const updatedFields = {
          title,
          category,
          price,
          oldPrice,
          badge,
          image: primaryImage,
          images: imagesArray,
          description,
          featured
        };

        try {
          await ApiClient.updateProduct(editId, updatedFields);
        } catch (_) {}

        if (existingIdx !== -1) {
          cachedProducts[existingIdx] = { ...cachedProducts[existingIdx], ...updatedFields };
        }

        saveProducts(cachedProducts);
        renderProducts();
        closeProductModal();
        showToast(`تم تحديث وحفظ بيانات [${title}] بنجاح! ✨`);
      } else {
        // CREATE NEW PRODUCT
        const newProd = {
          id: `lf-${Date.now()}`,
          title,
          category,
          price,
          oldPrice,
          badge,
          image: primaryImage,
          images: imagesArray,
          description,
          flowerType: 'تشكيلة زهور طبيعية فاخرة',
          flowerCount: 'تنسيق متناسق ومتقن',
          dimensions: 'الارتفاع 45 - 55 سم تقريباً',
          packaging: 'تغليف فاخر مقاوم للماء وشريط ساتان',
          freshness: '7 - 10 أيام مع العناية الموصى بها',
          careTips: 'قص أطراف السيقان بزاوية 45 درجة، واستبدل الماء كل يومين.',
          inStock: true,
          featured
        };

        try {
          await ApiClient.createProduct(newProd);
        } catch (_) {}

        cachedProducts.unshift(newProd);
        saveProducts(cachedProducts);
        renderProducts();
        closeProductModal();
        showToast('تمت إضافة الباقة الجديدة وحفظها في قاعدة البيانات! 🌹');
      }
    });
  }

  // Reset defaults
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('هل ترغب بإعادة تعيين قائمة المنتجات إلى المنتجات الافتراضية لقاعدة البيانات؟')) {
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
            <p>نوع الطلب: <strong style="color:var(--primary);">${order.fulfillmentType === 'pickup' ? '🏬 استلام من المحل (الفرع)' : '🚗 توصيل إلى العنوان'}</strong></p>
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
