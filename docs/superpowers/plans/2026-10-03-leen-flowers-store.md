# خطة تنفيذ متجر لين للزهور (Leen Flowers)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** بناء متجر إلكتروني فاخر، بسيط، ومتجاوب بالكامل لمتجر "لين للزهور" يحتوي على عنصر 3D تفاعلي، محول لـ 3 ثيمات تصميمية، سلة تسوق ونموذج طلب كامل يرسل التفاصيل مباشرة إلى الواتساب، بالإضافة إلى لوحة تحكم تمهيدية للمرحلة الثانية.

**Architecture:** بنية معمارية نظيفة وقائمة على Vanilla ES Modules و Three.js بدون تعقيدات بناء (No build step required)، مع فصل طبقة البيانات والإعدادات لتكون جاهزة 100% للربط بقاعدة بيانات في المرحلة الثانية، مع دعم التبديل المباشر بين 3 ثيمات بصرية وتوافق تام مع الهواتف الذكية (RTL Arabic First).

**Tech Stack:** HTML5, CSS3 (Modern Glassmorphism & CSS Variables), JavaScript (ES Modules), Three.js (3D Rose & Particle Petals), LocalStorage API.

**Spec:** `docs/superpowers/specs/2026-10-03-leen-flowers-store-design.md`

## Global Constraints
- اللغة الأساسية: العربية (RTL) مع خطوط عصرية أنيقة (Cairo / Alexandria).
- رقم الواتساب المبدئي: `0797035039` (+962797035039) مع جعله قابلاً للتعديل من الإعدادات ولوحة التحكم.
- الروابط الرسمية: فيسبوك وإنستغرام لمتجر لين للزهور.
- سرعة التحميل الفائقة والاستجابة التامة للهواتف والحواسيب.

---

### Task 1: طبقة البيانات والإعدادات (Store Config & Products Data)

**Files:**
- Create: `js/store-config.js`
- Create: `js/products-data.js`
- Create: `tests/data-test.js`

**Interfaces:**
- Produces: `StoreConfig` (رقم الواتساب، الروابط الاجتماعية، خيارات التوصيل، الثيم المختار)
- Produces: `getProducts()`, `getProductById(id)`, `saveProducts(list)`, `resetDefaultProducts()`

- [ ] **Step 1: كتابة اختبار التحقق من بنية البيانات والإعدادات**
  كتابة ملف `tests/data-test.js` للتأكد من استرجاع المنتجات، تطابق الحقول الأساسية (id, title, price, category, image, description)، واسترجاع رقم الواتساب الافتراضي وإمكانية تحديثه.

- [ ] **Step 2: تشغيل الاختبار والتحقق من النتيجة**
  تشغيل اختبار Node.js للتحقق: `node tests/data-test.js` (يجب أن يفشل قبل كتابة الملفات).

- [ ] **Step 3: كتابة ملف `js/store-config.js`**
  تضمين إعدادات المتجر:
  - الاسم: لين للزهور - Leen Flowers
  - رقم الواتساب الافتراضي: `0797035039`
  - رمز الدولة الافتراضي للأردن: `962`
  - رابط إنستغرام: `https://www.instagram.com/leen_flower11`
  - رابط فيسبوك: `https://www.facebook.com/p/Leen-Flowers-100090007161366/`
  - طرق حفظ واسترجاع الإعدادات عبر `localStorage`.

- [ ] **Step 4: كتابة ملف `js/products-data.js`**
  إنشاء تشكيلة باقات ورد طبيعي، بوكسات هدايا، فازات واستاندات، وباقات تخرج ومناسبات بأسعار دينار أردني (JOD) مع صور وبطاقات وصفية جذابة، وتوابع الحفظ والاسترجاع.

- [ ] **Step 5: تشغيل الاختبار للتأكد من النجاح**
  تشغيل `node tests/data-test.js` والتأكد من نجاح كافة الفحوصات.

---

### Task 2: نظام التصميم والمتغيرات للثيمات الثلاثة (Design System & 3 Themes)

**Files:**
- Create: `css/themes.css`
- Create: `css/main.css`

**Interfaces:**
- Produces: 3 CSS Theme Tokens:
  - `[data-theme="blush"]` (Blush Rose & Champagne Gold)
  - `[data-theme="lavender"]` (Botanical Lavender & Pure White)
  - `[data-theme="midnight"]` (Luxury Midnight & Emerald Gold)
- Produces: Reusable utility classes, glassmorphism, responsive grid, animations.

- [ ] **Step 1: كتابة `css/themes.css`**
  تعريف متغيرات الألوان والإضاءة والخلفيات لكل ثيم من الثيمات الثلاثة:
  - `--bg-primary`, `--bg-secondary`, `--surface-glass`, `--border-glass`
  - `--text-primary`, `--text-muted`, `--accent`, `--accent-hover`, `--accent-glow`
  - `--badge-bg`, `--badge-color`, `--card-shadow`

- [ ] **Step 2: كتابة `css/main.css`**
  - دعم RTL كامل وتضمين خطوط Google Fonts (Cairo & Alexandria).
  - تصميم الترويسة والشريط العلوي مع تأثير الزجاج (Backdrop Filter Blur).
  - تصميم بطاقات المنتجات مع تأثير Hover والتكبير الناعم وظلال فاخرة.
  - تصميم أزرار السلة ومحول الثيمات ونوافذ الـ Modals.
  - Media Queries دقيقة لكافة أحجام الشاشات من 360px وحتى شاشات 4K.

---

### Task 3: مشهد الـ 3D التفاعلي بالـ Three.js (Interactive 3D Flower & Petals)

**Files:**
- Create: `js/three-scene.js`

**Interfaces:**
- Produces: `initThreeFlowerScene(containerId)`
- Features: مشهد 3D لزهرة فاخرة تدور بنعومة، تفاعل مع الماوس واللمس، سقوط بتلات ورد رقيقة بنظام جزيئات (Particle System)، وإضاءة ديناميكية تتكيف مع الثيم المختار.

- [ ] **Step 1: بناء مشهد Three.js**
  - إعداد Scene, Camera, WebGLRenderer مع دعم الـ Retina / High DPI.
  - بناء هندسة زهرة الورد الجوري (Rose Flower Petals) بتدرجات لونية ونعومة مخملية.
  - بناء نظام بتلات متطايرة (Falling Floating Rose Petals) تسبح في الفضاء بحركة عشوائية طبيعية.
  - إضافة تفاعل تتبع حركة الماوس واللمس باليد (Orbit & Tilt Parallax).
  - إضافة تابع `updateTheme3D(themeName)` لتحديث ألوان الإضاءة والبتلات لتناسب الثيم المختار (Blush / Lavender / Midnight).
  - تنظيف الموارد تلقائياً عند تغيير الحجم (Window Resize Listener).

---

### Task 4: سلة المشتريات ومولد رسالة الواتساب الشاملة (Cart & WhatsApp Integration)

**Files:**
- Create: `js/cart.js`
- Create: `tests/cart-test.js`

**Interfaces:**
- Produces: `Cart` class / functions:
  - `addToCart(productId, qty)`
  - `removeFromCart(productId)`
  - `updateQuantity(productId, delta)`
  - `getCartTotal()`
  - `generateWhatsAppOrderUrl(orderDetails)`
  - `saveCartToStorage()`, `loadCartFromStorage()`

- [ ] **Step 1: كتابة اختبار وحدة `tests/cart-test.js`**
  فحص إضافة المنتجات وحساب المجموع بدقة، والتحقق من صياغة رابط الواتساب `https://wa.me/...` واحتوائه على كل البيانات:
  - بيانات المشتري والمستلم
  - المدينة والعنوان وموعد التوصيل
  - نص كرت الإهداء
  - قائمة المنتجات والمجموع الكلي

- [ ] **Step 2: تشغيل الاختبار والتحقق من الفشل قبل البرمجة**
  تشغيل `node tests/cart-test.js`.

- [ ] **Step 3: برمجة `js/cart.js`**
  - بناء إدارة حالة السلة مع التخزين في `localStorage`.
  - دالة صياغة رسالة الواتساب المنسقة بدقة مع الرموز التعبيرية والخطوط الفاصلة وتشفير الرابط بـ `encodeURIComponent`.
  - دعم الرقم المخصص من `StoreConfig`.

- [ ] **Step 4: تشغيل الاختبار والتأكد من نجاحه بالكامل**
  تشغيل `node tests/cart-test.js` والتأكد من نجاح كافة الحالات.

---

### Task 5: الصفحة الرئيسية ومحول الثيمات التفاعلي (Storefront & Theme Switcher)

**Files:**
- Create: `index.html`
- Create: `js/app.js`

**Interfaces:**
- Features:
  - شريط علوي مع شعار المتجر، روابط فيسبوك وإنستغرام، محول الثيمات الـ 3 التفاعلي، وأيقونة السلة.
  - قسم Hero مع الـ 3D التفاعلي وعناوين ترحيبية راقية.
  - شريط مميزات المتجر (ورد طبيعي فاخر، توصيل سريع، كرت إهداء مجاني).
  - تبويبات تصفية المنتجات حسب الأقسام وخانة بحث سريع.
  - شبكة المنتجات (Product Cards) مع صور عالية الجودة وزر إضافة فوري للسلة.
  - نافذة السلة الجانبية (Cart Drawer).
  - نافذة إتمام الطلب الشاملة (Checkout Modal) مع كافة حقول الإهداء والتوصيل.
  - زر الإرسال المباشر للواتساب.

- [ ] **Step 1: بناء هيكل `index.html` دلالي ونظيف**
  - تهيئة العناصر مع معرفات واضحة وتصميم متجاوب.
  - إضافة روابط خطوط Google Fonts واستيراد المكتبات (Three.js عبر CDN موثوق).

- [ ] **Step 2: كتابة `js/app.js`**
  - ربط عرض المنتجات والتصفية والبحث.
  - تفعيل محول الثيمات وحفظ الثيم المختار في `localStorage`.
  - ربط السلة وفتح النوافذ التفاعلية عند الطلب وتحديث العدادات.

---

### Task 6: لوحة التحكم التمهيدية للمرحلة الثانية (Dashboard Preview Interface)

**Files:**
- Create: `dashboard.html`
- Create: `js/dashboard.js`
- Modify: `css/main.css` (إضافة أنماط لوحة التحكم)

**Interfaces:**
- Features:
  - إحصائيات سريعة (عدد المنتجات، إجمالي الطلبات، متوسط المبيعات).
  - إدارة المنتجات (إضافة منتج جديد، تعديل السعر، تبديل التوفر، حذف).
  - إعدادات المتجر (تحديث رقم الواتساب المعتمد، تحديث رسوم التوصيل، روابط التواصل).
  - استعراض سجل الطلبات التي تم إنشاؤها عبر الموقع.

- [ ] **Step 1: بناء `dashboard.html`**
  تصميم لوحة تحكم أنيقة وعصرية بنفس هوية المتجر تتيح لصاحب العمل التحكم بكل شيء بسهولة.

- [ ] **Step 2: كتابة `js/dashboard.js`**
  ربط عمليات التعديل والحفظ فورياً مع `StoreConfig` و `products-data.js` عبر `localStorage` تمهيداً لربط الـ Backend في المرحلة الثانية.

---

### Task 7: التحقق والاختبار الشامل والتأكد من الجاهزية (Verification & Browser Audit)

**Files:**
- Verify: `index.html`
- Verify: `dashboard.html`
- Check on mobile & desktop viewports

- [ ] **Step 1: التحقق من مشهد الـ 3D وسلاسة الحركة والبتلات**
- [ ] **Step 2: اختبار التبديل بين الثيمات الثلاثة والتأكد من تناسق الألوان**
- [ ] **Step 3: تجربة دورة طلب كاملة من السلة وحتى إرسال رسالة الواتساب**
- [ ] **Step 4: تجربة لوحة التحكم وتغيير رقم الواتساب والتأكد من تحديثه في المتجر**
- [ ] **Step 5: التحقق من التجاوب التام على الهواتف الذكية والأجهزة المختلفة**
