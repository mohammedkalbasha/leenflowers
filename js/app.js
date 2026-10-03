/**
 * Main Application Orchestrator for Leen Flowers (متجر لين للزهور)
 */

import { StoreConfig } from './store-config.js';
import { initialCategories, getProducts, getProductById } from './products-data.js';
import { instagramPosts, facebookPosts } from './social-feed-data.js';
import { CartManager } from './cart.js';
import { initThreeFlowerScene } from './three-scene.js';

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
            <div class="card-action-btns">
              <button type="button" class="btn-card-details" data-action="view-details" data-id="${p.id}" title="عرض تفاصيل ومواصفات الباقة">
                <span class="btn-icon">👁️</span>
                <span class="btn-text">التفاصيل</span>
              </button>
              <button type="button" class="btn-card-add" data-action="add-to-cart" data-id="${p.id}" title="إضافة سريعة للسلة">
                <span class="btn-icon">🛒</span>
                <span class="btn-text">أضف</span>
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
 * Scroll Lock Helper to prevent background scrolling when modals are open
 */
function lockBodyScroll() {
  document.body.classList.add('modal-open');
}

function unlockBodyScroll() {
  const activeModal = document.querySelector(
    '.modal-overlay.active, .cart-drawer-overlay.active, .product-modal-overlay.active'
  );
  if (!activeModal) {
    document.body.classList.remove('modal-open');
  }
}

// Global ESC key to close open modals
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeElements = document.querySelectorAll(
        '.modal-overlay.active, .cart-drawer-overlay.active, .product-modal-overlay.active'
      );
      activeElements.forEach(el => el.classList.remove('active'));
      unlockBodyScroll();
    }
  });
}

/**
 * Product Details Modal System with Album / Gallery Support
 */
let currentModalProduct = null;
let currentModalQty = 1;
let currentModalImages = [];
let currentModalImageIndex = 0;

function initProductDetailsModal() {
  const overlay = document.getElementById('product-details-modal-overlay');
  const closeBtn = document.getElementById('close-prod-modal-btn');
  const decBtn = document.getElementById('modal-qty-decrease');
  const incBtn = document.getElementById('modal-qty-increase');
  const qtyVal = document.getElementById('modal-qty-val');
  const addCartBtn = document.getElementById('modal-btn-add-cart');
  const directWaBtn = document.getElementById('modal-btn-direct-wa');
  const prevBtn = document.getElementById('modal-gallery-prev');
  const nextBtn = document.getElementById('modal-gallery-next');

  function closeProductModal() {
    if (overlay) overlay.classList.remove('active');
    unlockBodyScroll();
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', closeProductModal);
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeProductModal();
    });
  }

  // Gallery Navigation Buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateGallery(-1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateGallery(1);
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
        closeProductModal();
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

function navigateGallery(delta) {
  if (!currentModalImages || currentModalImages.length <= 1) return;
  currentModalImageIndex = (currentModalImageIndex + delta + currentModalImages.length) % currentModalImages.length;
  updateGalleryDisplay();
}

function setGalleryIndex(index) {
  if (!currentModalImages || index < 0 || index >= currentModalImages.length) return;
  currentModalImageIndex = index;
  updateGalleryDisplay();
}

function updateGalleryDisplay() {
  const imgEl = document.getElementById('modal-img');
  const thumbsContainer = document.getElementById('modal-gallery-thumbs');

  if (imgEl && currentModalImages[currentModalImageIndex]) {
    imgEl.src = currentModalImages[currentModalImageIndex];
    if (currentModalProduct) {
      imgEl.alt = `${currentModalProduct.title} - صورة ${currentModalImageIndex + 1}`;
    }
  }

  if (thumbsContainer) {
    thumbsContainer.querySelectorAll('.gallery-thumb-item').forEach((btn, idx) => {
      btn.classList.toggle('active', idx === currentModalImageIndex);
    });
  }
}

function openProductModal(prod) {
  const overlay = document.getElementById('product-details-modal-overlay');
  if (!overlay || !prod) return;

  currentModalProduct = prod;
  currentModalQty = 1;

  // Extract images array (support single or multiple photos album)
  if (Array.isArray(prod.images) && prod.images.length > 0) {
    currentModalImages = prod.images;
  } else if (prod.image) {
    currentModalImages = [prod.image];
  } else {
    currentModalImages = [];
  }
  currentModalImageIndex = 0;

  const imgEl = document.getElementById('modal-img');
  const prevBtn = document.getElementById('modal-gallery-prev');
  const nextBtn = document.getElementById('modal-gallery-next');
  const thumbsContainer = document.getElementById('modal-gallery-thumbs');
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

  // Configure album / gallery controls
  if (currentModalImages.length > 1) {
    if (prevBtn) prevBtn.style.display = 'flex';
    if (nextBtn) nextBtn.style.display = 'flex';
    if (thumbsContainer) {
      thumbsContainer.style.display = 'flex';
      thumbsContainer.innerHTML = currentModalImages
        .map((imgUrl, idx) => `
          <button type="button" class="gallery-thumb-item ${idx === 0 ? 'active' : ''}" data-thumb-idx="${idx}" aria-label="صورة ${idx + 1}">
            <img src="${imgUrl}" alt="مصغرة ${idx + 1}" loading="lazy">
          </button>
        `)
        .join('');

      thumbsContainer.querySelectorAll('.gallery-thumb-item').forEach(thumbBtn => {
        thumbBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(thumbBtn.getAttribute('data-thumb-idx'), 10);
          setGalleryIndex(idx);
        });
      });
    }
  } else {
    // Single image product: hide navigation arrows and thumbnails strip
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (thumbsContainer) {
      thumbsContainer.style.display = 'none';
      thumbsContainer.innerHTML = '';
    }
  }

  updateGalleryDisplay();

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
  lockBodyScroll();
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
      igView.classList.add('active');
      fbView.classList.remove('active');
      igView.style.display = 'block';
      fbView.style.display = 'none';
    });

    fbTabBtn.addEventListener('click', () => {
      fbTabBtn.classList.add('active');
      igTabBtn.classList.remove('active');
      fbView.classList.add('active');
      igView.classList.remove('active');
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

  // Drawer Open/Close with body scroll lock
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      overlay.classList.add('active');
      lockBodyScroll();
    });
  }

  function closeCartDrawer() {
    if (overlay) overlay.classList.remove('active');
    unlockBodyScroll();
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeCartDrawer);
  }

  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        closeCartDrawer();
      }
    });
  }

  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      if (CartManager.getItemCount() === 0) {
        showToast('يرجى إضافة زهور إلى السلة أولاً!');
        return;
      }
      closeCartDrawer();
      openCheckoutModal();
    });
  }
}

/**
 * Checkout Flow & Modal
 */
let currentFulfillmentType = 'delivery';

function updateCheckoutTotals() {
  const modalTotal = document.getElementById('modal-total-display');
  const feeNote = document.getElementById('modal-delivery-fee-note');
  const subtotal = CartManager.getSubtotal();
  const isPickup = currentFulfillmentType === 'pickup';
  const deliveryFee = isPickup ? 0.0 : 3.0;
  const grandTotal = subtotal + deliveryFee;

  if (modalTotal) {
    modalTotal.textContent = `${grandTotal.toFixed(2)} د.أ`;
  }
  if (feeNote) {
    if (isPickup) {
      feeNote.textContent = 'استلام من المحل (مجاناً 0.00 د.أ)';
      feeNote.style.color = '#16a34a';
    } else {
      feeNote.textContent = 'شامل رسوم التوصيل (+3.00 د.أ)';
      feeNote.style.color = 'var(--text-muted)';
    }
  }
}

/**
 * Checkout Flow & Modal
 */
function openCheckoutModal() {
  const modalOverlay = document.getElementById('checkout-modal-overlay');
  updateCheckoutTotals();
  if (modalOverlay) {
    modalOverlay.classList.add('active');
    lockBodyScroll();
  }
}

function initCheckoutFlow() {
  const modalOverlay = document.getElementById('checkout-modal-overlay');
  const closeBtn = document.getElementById('close-checkout-btn');
  const form = document.getElementById('checkout-form');
  const toggleGiftCard = document.getElementById('toggle-gift-card');
  const giftCardBox = document.getElementById('gift-card-fields-box');
  const giftCardMsg = document.getElementById('gift-card-message');
  const giftCardSign = document.getElementById('gift-card-sign');
  const btnGetLocation = document.getElementById('btn-get-location');
  const locationInput = document.getElementById('delivery-location-url');

  // Fulfillment Radios & Elements
  const typeDeliveryRadio = document.getElementById('type-delivery');
  const typePickupRadio = document.getElementById('type-pickup');
  const optionDeliveryLabel = document.getElementById('option-delivery-label');
  const optionPickupLabel = document.getElementById('option-pickup-label');
  const deliveryFields = document.getElementById('delivery-specific-fields');
  const pickupInfoBox = document.getElementById('pickup-store-info');
  const citySelect = document.getElementById('city-select');
  const detailedAddress = document.getElementById('detailed-address');
  const labelDeliveryDate = document.getElementById('label-delivery-date');
  const labelDeliveryTime = document.getElementById('label-delivery-time');

  function setFulfillmentMode(mode) {
    currentFulfillmentType = mode;
    const isPickup = mode === 'pickup';

    if (optionDeliveryLabel && optionPickupLabel) {
      if (isPickup) {
        optionPickupLabel.classList.add('active');
        optionDeliveryLabel.classList.remove('active');
        if (typePickupRadio) typePickupRadio.checked = true;
      } else {
        optionDeliveryLabel.classList.add('active');
        optionPickupLabel.classList.remove('active');
        if (typeDeliveryRadio) typeDeliveryRadio.checked = true;
      }
    }

    if (deliveryFields && pickupInfoBox) {
      deliveryFields.style.display = isPickup ? 'none' : 'block';
      pickupInfoBox.style.display = isPickup ? 'block' : 'none';
    }

    if (citySelect && detailedAddress) {
      citySelect.required = !isPickup;
      detailedAddress.required = !isPickup;
    }

    if (labelDeliveryDate) {
      labelDeliveryDate.textContent = isPickup ? 'تاريخ الاستلام من المحل المطلوب *' : 'تاريخ التوصيل المطلوب *';
    }
    if (labelDeliveryTime) {
      labelDeliveryTime.textContent = isPickup ? 'ساعة الاستلام المحددة' : 'الساعة المحددة للتوصيل';
    }

    updateCheckoutTotals();
  }

  if (typeDeliveryRadio) {
    typeDeliveryRadio.addEventListener('change', () => setFulfillmentMode('delivery'));
  }
  if (typePickupRadio) {
    typePickupRadio.addEventListener('change', () => setFulfillmentMode('pickup'));
  }
  if (optionDeliveryLabel) {
    optionDeliveryLabel.addEventListener('click', () => setFulfillmentMode('delivery'));
  }
  if (optionPickupLabel) {
    optionPickupLabel.addEventListener('click', () => setFulfillmentMode('pickup'));
  }

  function closeCheckout() {
    if (modalOverlay) modalOverlay.classList.remove('active');
    unlockBodyScroll();
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeCheckout);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) {
        closeCheckout();
      }
    });
  }

  // 1. Gift Card Toggle Switch
  if (toggleGiftCard && giftCardBox) {
    toggleGiftCard.addEventListener('change', () => {
      if (toggleGiftCard.checked) {
        giftCardBox.style.display = 'block';
        giftCardBox.classList.add('visible');
        if (giftCardMsg) giftCardMsg.focus();
      } else {
        giftCardBox.style.display = 'none';
        giftCardBox.classList.remove('visible');
      }
    });
  }

  // 2. Geolocation / GPS Button to populate Google Maps link
  if (btnGetLocation && locationInput) {
    btnGetLocation.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showToast('خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك. يرجى لصق الرابط يدوياً.');
        return;
      }

      btnGetLocation.disabled = true;
      btnGetLocation.innerHTML = '<span>⏳ جاري تحديد موقعك...</span>';

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
          locationInput.value = mapsUrl;
          btnGetLocation.disabled = false;
          btnGetLocation.innerHTML = '<span>✓ تم تحديد الموقع</span>';
          showToast('تم تحديد موقعك بدقة عبر GPS بنجاح 🎯');
        },
        (err) => {
          btnGetLocation.disabled = false;
          btnGetLocation.innerHTML = '<span>🎯 تحديد موقعي الحالي</span>';
          console.warn('Geolocation error:', err.message);
          showToast('تعذر جلب موقعك تلقائياً. يرجى لصق رابط خرائط جوجل يدوياً.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  // 3. Checkout Form Submission
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      if (CartManager.getItemCount() === 0) {
        showToast('السلة فارغة!');
        return;
      }

      const isPickup = currentFulfillmentType === 'pickup';
      const isGift = toggleGiftCard ? toggleGiftCard.checked : false;
      const exactTimeVal = document.getElementById('delivery-exact-time')
        ? document.getElementById('delivery-exact-time').value
        : '';
      const locationUrlVal = locationInput ? locationInput.value.trim() : '';

      const subtotal = CartManager.getSubtotal();
      const deliveryFee = isPickup ? 0.0 : 3.0;
      const total = subtotal + deliveryFee;

      const orderDetails = {
        buyerName: document.getElementById('buyer-name').value.trim(),
        buyerPhone: document.getElementById('buyer-phone').value.trim(),
        recipientName: document.getElementById('recipient-name').value.trim(),
        recipientPhone: document.getElementById('recipient-phone').value.trim(),
        fulfillmentType: currentFulfillmentType,
        city: isPickup ? 'عمان - استلام من الفرع' : (citySelect ? citySelect.value : 'عمان'),
        address: isPickup ? 'استلام شخصي من المحل (الفرع الرئيسي - الجبيهة)' : (detailedAddress ? detailedAddress.value.trim() : ''),
        deliveryDate: document.getElementById('delivery-date').value,
        deliveryTime: document.getElementById('delivery-time').value,
        exactTime: exactTimeVal,
        locationUrl: isPickup ? '' : locationUrlVal,
        deliveryFee: deliveryFee,
        total: total,
        isGiftCard: isGift,
        cardMessage: isGift && giftCardMsg ? giftCardMsg.value.trim() : '',
        cardSign: isGift && giftCardSign ? giftCardSign.value.trim() : '',
        notes: document.getElementById('order-notes').value.trim()
      };

      // 1. Create order in Database via ApiClient
      let serverOrder = null;
      try {
        serverOrder = await ApiClient.createOrder({
          buyerName: orderDetails.buyerName,
          buyerPhone: orderDetails.buyerPhone,
          recipientName: orderDetails.recipientName || orderDetails.buyerName,
          recipientPhone: orderDetails.recipientPhone || orderDetails.buyerPhone,
          fulfillmentType: orderDetails.fulfillmentType,
          city: orderDetails.city,
          detailedAddress: orderDetails.address,
          deliveryDate: orderDetails.deliveryDate,
          deliveryTime: orderDetails.deliveryTime,
          exactTime: orderDetails.exactTime,
          locationUrl: orderDetails.locationUrl,
          giftCardMessage: orderDetails.cardMessage,
          giftCardSign: orderDetails.cardSign,
          orderNotes: orderDetails.notes,
          items: CartManager.getItems().map(item => ({
            id: item.product.id,
            title: item.product.title,
            qty: item.quantity,
            price: item.product.price
          })),
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          total: total
        });
      } catch (err) {
        console.warn('Could not save to API database, fallback to offline mode:', err.message);
      }

      if (serverOrder && serverOrder.orderNumber) {
        orderDetails.orderNumber = serverOrder.orderNumber;
      }

      // 2. Save order to local history as backup
      saveOrderToLocalHistory(orderDetails, CartManager.getItems(), subtotal);

      // 3. Generate WhatsApp Link with official order number, location, exact time, and card
      const targetPhone = StoreConfig.defaultWhatsApp;
      const waUrl = CartManager.generateWhatsAppOrderUrl(orderDetails, targetPhone);

      // 4. Close modal and clear cart
      closeCheckout();
      form.reset();
      setFulfillmentMode('delivery');
      if (toggleGiftCard) toggleGiftCard.checked = false;
      if (giftCardBox) giftCardBox.style.display = 'none';
      CartManager.clear();

      const orderBadgeText = orderDetails.orderNumber ? ` رقم [${orderDetails.orderNumber}]` : '';
      const modeText = isPickup ? ' (استلام من المحل)' : ' (توصيل)';
      showToast(`تم تأكيد الطلب${orderBadgeText}${modeText}! جاري فتح الواتساب... 💐`);

      // 5. Open WhatsApp in new tab/app
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
