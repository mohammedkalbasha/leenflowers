import fs from 'node:fs';

console.log('Testing bundle execution in simulated browser environment...');

// Setup global window and document mocks
const elements = new Map();

function createMockElement(tag, id = '', className = '') {
  return {
    tagName: tag.toUpperCase(),
    id,
    className,
    style: {},
    classList: {
      add: function(c) { this._classes = this._classes || new Set(); this._classes.add(c); },
      remove: function(c) { if (this._classes) this._classes.delete(c); },
      contains: function(c) { return this._classes ? this._classes.has(c) : false; }
    },
    attributes: new Map(),
    getAttribute: function(name) { return this.attributes.get(name) || null; },
    setAttribute: function(name, val) { this.attributes.set(name, val); },
    addEventListener: function(event, handler) {
      this._handlers = this._handlers || {};
      this._handlers[event] = this._handlers[event] || [];
      this._handlers[event].push(handler);
    },
    click: function() {
      if (this._handlers && this._handlers['click']) {
        this._handlers['click'].forEach(h => h({ target: this, preventDefault: () => {} }));
      }
    },
    innerHTML: '',
    textContent: '',
    children: [],
    appendChild: function(c) { this.children.push(c); return c; },
    removeChild: function(c) { this.children = this.children.filter(x => x !== c); },
    querySelectorAll: function(sel) {
      if (sel.includes('[data-set-theme]')) {
        return [
          createMockElement('button', '', 'theme-btn'),
          createMockElement('button', '', 'theme-btn'),
          createMockElement('button', '', 'theme-btn')
        ];
      }
      return [];
    },
    closest: function() { return this; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 400 }),
    clientWidth: 400,
    clientHeight: 400
  };
}

global.window = {
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  devicePixelRatio: 1,
  open: () => {}
};

global.document = {
  documentElement: createMockElement('html'),
  addEventListener: function(event, handler) {
    if (event === 'DOMContentLoaded') {
      this._readyHandler = handler;
    }
  },
  getElementById: function(id) {
    if (!elements.has(id)) {
      elements.set(id, createMockElement('div', id));
    }
    return elements.get(id);
  },
  querySelectorAll: function(sel) {
    if (sel.includes('[data-set-theme]')) {
      return [
        createMockElement('button', '', 'theme-btn'),
        createMockElement('button', '', 'theme-btn'),
        createMockElement('button', '', 'theme-btn')
      ];
    }
    return [];
  }
};

global.localStorage = global.window.localStorage;

// Run bundle
try {
  const bundleCode = fs.readFileSync('js/bundle.js', 'utf8');
  eval(bundleCode);

  // Trigger DOMContentLoaded
  if (global.document._readyHandler) {
    global.document._readyHandler();
  }

  console.log('✅ js/bundle.js executed smoothly with ZERO errors on DOMContentLoaded!');
} catch (e) {
  console.error('❌ Error executing bundle.js:', e);
  process.exit(1);
}
