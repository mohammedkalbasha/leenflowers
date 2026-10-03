/**
 * Unified API Client for Leen Flowers (متجر لين للزهور)
 * Connects storefront and dashboard to REST API & SQLite with seamless offline fallback
 */

const STORAGE_KEY_AUTH = 'leen_admin_auth_pin';

export const ApiClient = {
  baseUrl: (typeof window !== 'undefined' && window.location.origin && window.location.protocol.startsWith('http'))
    ? window.location.origin
    : 'http://localhost:3000',

  getAuthPin() {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem(STORAGE_KEY_AUTH) || localStorage.getItem(STORAGE_KEY_AUTH) || '';
  },

  setAuthPin(pin, remember = false) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEY_AUTH, pin);
    if (remember) localStorage.setItem(STORAGE_KEY_AUTH, pin);
  },

  clearAuthPin() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  },

  isAuthenticated() {
    return Boolean(this.getAuthPin());
  },

  async request(method, path, body = null, requireAuth = false) {
    const pin = this.getAuthPin();
    const headers = {
      'Content-Type': 'application/json'
    };
    if (pin) {
      headers['x-admin-pin'] = pin;
    }

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const contentType = res.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        throw new Error(data && data.error ? data.error : `HTTP ${res.status}`);
      }
      return data;
    } catch (err) {
      console.warn(`[ApiClient] Request ${method} ${path} error:`, err.message);
      throw err;
    }
  },

  // --- Auth Endpoints ---
  async login(pin, remember = false) {
    try {
      const res = await this.request('POST', '/api/auth/login', { pin });
      if (res.success) {
        this.setAuthPin(pin, remember);
        return { success: true };
      }
      return { success: false, error: res.error || 'رمز الدخول غير صحيح' };
    } catch (err) {
      // Local fallback if server unreachable
      if (pin === '1234') {
        this.setAuthPin(pin, remember);
        return { success: true, offline: true };
      }
      return { success: false, error: err.message };
    }
  },

  async changePin(newPin) {
    return this.request('POST', '/api/auth/change-pin', { newPin }, true);
  },

  // --- Config Endpoints ---
  async getConfig() {
    try {
      return await this.request('GET', '/api/config');
    } catch (_) {
      return null;
    }
  },

  async saveConfig(newConfig) {
    return this.request('PUT', '/api/config', newConfig, true);
  },

  // --- Products Endpoints ---
  async getProducts() {
    try {
      return await this.request('GET', '/api/products');
    } catch (_) {
      return null;
    }
  },

  async createProduct(product) {
    return this.request('POST', '/api/products', product, true);
  },

  async updateProduct(id, product) {
    return this.request('PUT', `/api/products/${id}`, product, true);
  },

  async deleteProduct(id) {
    return this.request('DELETE', `/api/products/${id}`, null, true);
  },

  async uploadImage(base64Data) {
    try {
      return await this.request('POST', '/api/upload', { data: base64Data }, true);
    } catch (err) {
      console.warn('API uploadImage fallback:', err.message);
      return { success: true, url: base64Data };
    }
  },

  // --- Orders Endpoints ---
  async getOrders() {
    try {
      return await this.request('GET', '/api/orders', null, true);
    } catch (_) {
      return [];
    }
  },

  async createOrder(orderData) {
    try {
      return await this.request('POST', '/api/orders', orderData);
    } catch (err) {
      console.warn('API createOrder failed, generating offline order ID:', err.message);
      // Offline fallback: generate client order number
      const seq = Math.floor(100 + Math.random() * 900);
      return {
        id: Date.now(),
        orderNumber: `LF-26-${seq}`,
        ...orderData,
        createdAt: new Date().toISOString(),
        offline: true
      };
    }
  },

  async updateOrderStatus(id, status) {
    return this.request('PUT', `/api/orders/${id}/status`, { status }, true);
  },

  async deleteOrder(id) {
    return this.request('DELETE', `/api/orders/${id}`, null, true);
  },

  // --- Stats Endpoint ---
  async getStats() {
    try {
      return await this.request('GET', '/api/stats', null, true);
    } catch (_) {
      return null;
    }
  }
};
