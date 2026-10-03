import { getProducts } from '../js/products-data.js';
import https from 'node:https';

function checkUrl(url) {
  return new Promise(resolve => {
    const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve({ url, status: res.statusCode });
    });
    req.on('error', err => resolve({ url, status: 0, error: err.message }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ url, status: 408 }); });
    req.end();
  });
}

const prods = getProducts();
console.log(`Checking ${prods.length} product images...`);
for (const p of prods) {
  const res = await checkUrl(p.image);
  const ok = res.status >= 200 && res.status < 400;
  console.log(`${ok ? '✅' : '❌'} [HTTP ${res.status}] ${p.title} (${p.image.substring(0, 50)}...)`);
}
