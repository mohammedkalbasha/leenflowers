# خطة تنفيذ المرحلة الثانية لمتجر لين للزهور (Leen Flowers - Phase 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** تفعيل البنية التحتية الخلفية للمتجر (Backend & Database) بربط قاعدة بيانات مدمجة عبر `node:sqlite`، توفير واجهة برمجية REST API لإدارة المنتجات والطلبات والإعدادات، حماية لوحة التحكم برمز PIN، التسجيل التلقائي للطلبات فور إتمامها عبر الواتساب، وإضافة نظام طباعة كروت الإهداء وإرساليات التوصيل.

**Architecture:** خادم Node.js متكامل في `server.js` يجمع بين تقديم الملفات الثابتة وواجهة REST API مع طبقة قاعدة بيانات SQLite دائمة ومحرك ترحيل تلقائي. العميل يملك طبقة `api-client.js` مع fallback ذكي يضمن استمرار عمل المتجر بسلاسة سواء بوجود اتصال بالخادم أو في بيئة التشغيل المستقلة.

**Tech Stack:** Node.js v25 (Native `node:sqlite`, HTTP), Vanilla JS (ES Modules + Universal Bundle), CSS3 & CSS Paged Media `@media print`, HTML5.

**Spec:** `docs/superpowers/specs/2026-10-03-leen-flowers-phase2-spec.md`

## Global Constraints
- قاعدة البيانات بدون أي مكتبات خارجية (تعتمد حصرياً على `node:sqlite` المدمج في Node.js).
- الرمز السري الافتراضي للوحة التحكم: `1234` مع إمكانية التغيير والتخزين المشفر.
- رقم الواتساب المعتمد: ديناميكي من إعدادات قاعدة البيانات (الافتراضي `0797035039`).
- الحفاظ على سرعة التحميل ومبدأ عدم تعطل المتجر حتى لو كان الخادم غير متاح.
- نظام الطباعة يجب أن يتناسب مع مقاسات الطباعة القياسية (A4 وورق الإيصالات الحرارية) مع إطار زخرفي راقٍ لكرت الإهداء.

---

### Task 1: طبقة قاعدة البيانات الدائمة (Database Layer with Native SQLite)

**Files:**
- Create: `db.js`
- Test: `tests/db-test.js`

**Interfaces:**
- Produces: `initDatabase(dbPath)`
- Produces: `getDb()`
- Produces CRUD methods for `products`, `orders`, `config`, `auth`.

- [ ] **Step 1: كتابة اختبار قاعدة البيانات**
  إنشاء `tests/db-test.js` لاختبار إنشاء الجداول، إدخال منتج، استرجاع الإعدادات، وإدخال طلب واسترجاعه.
- [ ] **Step 2: تشغيل الاختبار والتحقق من الفشل الأولي**
  `node tests/db-test.js` (يجب أن يفشل قبل كتابة `db.js`).
- [ ] **Step 3: برمجة `db.js`**
  تضمين تهيئة جداول SQLite (`config`, `products`, `orders`, `auth`) والبذر التلقائي (Auto-seeding) للمنتجات الـ 8 الافتراضية والإعدادات.
- [ ] **Step 4: إعادة تشغيل الاختبار والتأكد من النجاح بنسبة 100%**
  `node tests/db-test.js`.
- [ ] **Step 5: حفظ التغييرات**
  `git add db.js tests/db-test.js; git commit -m "feat(phase2): implement native sqlite database layer"`

---

### Task 2: توسيع الخادم بواجهة REST API الشاملة (Backend REST API)

**Files:**
- Modify: `server.js`
- Test: `tests/api-test.js`

**Interfaces:**
- Endpoints:
  - `GET /api/config`
  - `PUT /api/config` (يتطلب PIN)
  - `GET /api/products`
  - `POST /api/products` (يتطلب PIN)
  - `PUT /api/products/:id` (يتطلب PIN)
  - `DELETE /api/products/:id` (يتطلب PIN)
  - `GET /api/orders` (يتطلب PIN)
  - `POST /api/orders` (مفتوح لواجهة المتجر لتسجيل الطلبات)
  - `PUT /api/orders/:id/status` (يتطلب PIN)
  - `POST /api/auth/login`
  - `POST /api/auth/change-pin` (يتطلب PIN)
  - `GET /api/stats` (يتطلب PIN)

- [ ] **Step 1: كتابة اختبار الـ API التلقائي**
  إنشاء `tests/api-test.js` لاختبار جميع نقاط النهاية المذكورة أعلاه.
- [ ] **Step 2: تشغيل الاختبار والتحقق من الفشل**
  `node tests/api-test.js`.
- [ ] **Step 3: برمجة نقاط النهاية في `server.js`**
  دمج `db.js` ومعالجة المسارات والتحقق من الترويسة `X-Admin-PIN` أو الجلسة.
- [ ] **Step 4: إعادة تشغيل الاختبار والتأكد من النجاح التام**
  `node tests/api-test.js`.
- [ ] **Step 5: حفظ التغييرات**
  `git add server.js tests/api-test.js; git commit -m "feat(phase2): implement comprehensive rest api with admin auth"`

---

### Task 3: عميل الواجهة البرمجية الموحد (Unified API Client with Fallback)

**Files:**
- Create: `js/api-client.js`
- Modify: `scripts/build.js`

**Interfaces:**
- Produces: `ApiClient` (methods: `getConfig()`, `saveConfig()`, `getProducts()`, `createOrder()`, `verifyPin()`, etc.) مع Fallback تلقائي إلى `localStorage` في حال تعذر الوصول للخادم.

- [ ] **Step 1: كتابة `js/api-client.js`**
- [ ] **Step 2: تحديث `scripts/build.js`** لتضمين `api-client.js` في الحزم الموحدة `bundle.js` و `dashboard-bundle.js`.
- [ ] **Step 3: تشغيل `node scripts/build.js` والتأكد من التجميع السليم**
- [ ] **Step 4: حفظ التغييرات**
  `git add js/api-client.js scripts/build.js; git commit -m "feat(phase2): add resilient api-client with offline fallback"`

---

### Task 4: حماية لوحة التحكم برمز PIN وإدارة الطلبات الحقيقية (Protected Dashboard & Orders)

**Files:**
- Modify: `dashboard.html`
- Modify: `js/dashboard.js`
- Modify: `css/main.css`

**Interfaces:**
- Features:
  - شاشة قفل (Lock Screen / PIN Modal) تمنع عرض البيانات إلا بعد إدخال رمز المرور (الافتراضي `1234`).
  - إمكانية تغيير الرمز السري من تبويب الإعدادات.
  - جدول الطلبات يعرض الطلبات الحقيقية المسجلة من قاعدة البيانات مع أزرار تبديل الحالة (جديد، قيد التجهيز، تم التوصيل).
  - زر حذف الطلب أو إرسال تحديث للعميل على الواتساب.

- [ ] **Step 1: إضافة شاشة القفل وتحديثات لوحة التحكم في `dashboard.html`**
- [ ] **Step 2: برمجة منطق الحماية والتحقق من الجلسة في `js/dashboard.js`**
- [ ] **Step 3: اختبار تسجيل الدخول الخاطئ والصحيح وحفظ الجلسة**
- [ ] **Step 4: حفظ التغييرات**
  `git add dashboard.html js/dashboard.js css/main.css; git commit -m "feat(phase2): secure dashboard with pin code and live order management"`

---

### Task 5: نظام طباعة كرت الإهداء وإرسالية السائق (Printable Gift Cards & Delivery Slips)

**Files:**
- Create: `css/print.css`
- Modify: `dashboard.html`
- Modify: `js/dashboard.js`
- Modify: `css/main.css`

**Interfaces:**
- Features:
  - زر `[ 🖨️ طباعة الكرت والإرسالية ]` في جدول الطلبات.
  - نافذة معاينة الطباعة (Print Preview Modal) مقسمة بشكل فني إلى:
    1. كرت إهداء أنيق بهامش وردي ناعم، اسم المستلم، نص الرسالة وتوقيع المشتري.
    2. إرسالية التوصيل لسائق التوصيل تتضمن العنوان، الهاتف، المبلغ المطلوب، ووقت التسليم.
    3. بطاقة تحضير باقة الورد لمُنسّق الزهور مع الملاحظات الخاصة ونوع الورد.
  - استدعاء `window.print()` مع تطبيق `@media print` لعزل بقية عناصر لوحة التحكم وطباعة القسيمة بدقة.

- [ ] **Step 1: كتابة ملف الأنماط `css/print.css`**
- [ ] **Step 2: إضافة نافذة المعاينة في `dashboard.html`**
- [ ] **Step 3: ربط زر الطباعة في `js/dashboard.js` وتجهيز بيانات الطلب**
- [ ] **Step 4: اختبار وظيفة الطباعة ومعاينة التنسيق**
- [ ] **Step 5: حفظ التغييرات**
  `git add css/print.css dashboard.html js/dashboard.js css/main.css; git commit -m "feat(phase2): add elegant printable gift cards and delivery vouchers"`

---

### Task 6: ربط واجهة المتجر بنظام تسجيل الطلبات التلقائي (Storefront Live Order Sync)

**Files:**
- Modify: `js/app.js`
- Modify: `index.html`
- Rebuild: `js/bundle.js`

**Interfaces:**
- Features:
  - عند الضغط على "تأكيد وإرسال الطلب عبر واتساب" في `index.html`:
    1. يتم إرسال الطلب عبر `ApiClient.createOrder(orderData)`.
    2. إرجاع رقم الطلب الرسمي (مثال: `LF-26-001`).
    3. تضمين رقم الطلب في رسالة الواتساب المولدة.
    4. ظهور الطلب تلقائياً في لوحة التحكم بدون الحاجة لإعادة تحميل الصفحة.

- [ ] **Step 1: تحديث تدفق إتمام الطلب في `js/app.js`**
- [ ] **Step 2: إعادة توليد الحزم عبر `node scripts/build.js`**
- [ ] **Step 3: إجراء طلب تجريبي والتحقق من حفظه في قاعدة البيانات وظهوره في لوحة التحكم**
- [ ] **Step 4: حفظ التغييرات**
  `git add js/app.js index.html js/bundle.js; git commit -m "feat(phase2): connect storefront checkout to live db orders"`

---

### Task 7: التحقق والاختبار الشامل لنظام المرحلة الثانية (End-to-End Verification)

**Files:**
- Create: `tests/phase2-e2e.js`
- Run: Full automated suite

- [ ] **Step 1: كتابة وتشغيل اختبار E2E الشامل للمرحلة الثانية**
- [ ] **Step 2: التحقق من حماية الـ PIN وقفل اللوحة**
- [ ] **Step 3: التحقق من تسجيل طلب عبر المتجر وظهوره في قاعدة البيانات ولوحة التحكم**
- [ ] **Step 4: التحقق من دقة قسيمة الطباعة المخصصة لكرت الإهداء والسائق**
- [ ] **Step 5: تشغيل كافة الاختبارات السابقة والتأكد من اجتيازها بنسبة 100%**
