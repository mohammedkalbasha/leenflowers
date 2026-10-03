import http from 'node:http';
import assert from 'node:assert';

const urls = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/css/main.css',
  '/css/themes.css',
  '/js/app.js',
  '/js/three-scene.js',
  '/js/cart.js',
  '/js/products-data.js',
  '/js/store-config.js',
  '/js/dashboard.js'
];

async function checkUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, length: data.length });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing all endpoints on http://localhost:3000...');
  for (const path of urls) {
    const res = await checkUrl(path);
    console.log(`Endpoint ${path} -> Status: ${res.statusCode}, Body: ${res.length} bytes`);
    assert.strictEqual(res.statusCode, 200, `Expected 200 for ${path}`);
    assert.ok(res.length > 50, `Expected content for ${path}`);
  }
  console.log('✅ All endpoints responded with 200 OK and valid content!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
