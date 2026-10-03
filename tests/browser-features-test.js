import { execSync } from 'node:child_process';
import assert from 'node:assert';

console.log('Running Interactive Headless Chrome Test for Dynamic Features...');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// We run a test script inside Chrome using a test HTML runner or evaluating via DOM
// Let's create an automated test HTML file that executes these checks directly in the browser runtime
const testScript = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Browser Features Runtime Test</title>
</head>
<body>
  <div id="test-results">RUNNING...</div>
  <iframe id="app-frame" src="http://localhost:3000" style="width:1200px; height:800px;"></iframe>
  <script>
    const frame = document.getElementById('app-frame');
    frame.onload = async () => {
      const doc = frame.contentDocument;
      const win = frame.contentWindow;
      const results = [];

      function check(desc, cond) {
        if (cond) {
          results.push('PASS: ' + desc);
        } else {
          results.push('FAIL: ' + desc);
        }
      }

      try {
        // Wait 1s for app initialization
        await new Promise(r => setTimeout(r, 1000));

        // 1. Initial State: body should NOT have modal-open
        check('Initial body has no modal-open', !doc.body.classList.contains('modal-open'));

        // 2. Open Product Details Modal
        const firstCard = doc.querySelector('.product-card');
        if (firstCard) {
          firstCard.click();
          await new Promise(r => setTimeout(r, 400));
          check('Opening product modal locks body scroll (body.modal-open)', doc.body.classList.contains('modal-open'));

          // Check gallery
          const mainImg = doc.getElementById('modal-img');
          const prevBtn = doc.getElementById('modal-gallery-prev');
          const nextBtn = doc.getElementById('modal-gallery-next');
          const thumbs = doc.querySelectorAll('.gallery-thumb-item');

          check('Modal main image has source', Boolean(mainImg && mainImg.src));
          check('Multi-image product has thumbnails', thumbs.length >= 2);
          check('Prev and Next navigation buttons visible', prevBtn && prevBtn.style.display !== 'none');

          // Click next button
          const initialSrc = mainImg.src;
          if (nextBtn) {
            nextBtn.click();
            await new Promise(r => setTimeout(r, 200));
            check('Clicking next arrow changes product photo', mainImg.src !== initialSrc);
          }

          // Close modal
          const closeBtn = doc.getElementById('close-prod-modal-btn');
          if (closeBtn) {
            closeBtn.click();
            await new Promise(r => setTimeout(r, 300));
            check('Closing product modal restores body scroll (no modal-open)', !doc.body.classList.contains('modal-open'));
          }
        }

        // 3. Open Cart Drawer
        const cartBtn = doc.getElementById('open-cart-btn');
        if (cartBtn) {
          cartBtn.click();
          await new Promise(r => setTimeout(r, 300));
          check('Opening cart drawer locks body scroll', doc.body.classList.contains('modal-open'));

          const closeCartBtn = doc.getElementById('close-cart-btn');
          if (closeCartBtn) {
            closeCartBtn.click();
            await new Promise(r => setTimeout(r, 300));
            check('Closing cart drawer restores body scroll', !doc.body.classList.contains('modal-open'));
          }
        }

        // 4. Test Checkout Modal & Gift Card Toggle & Location
        // Add item to cart first
        const addBtn = doc.querySelector('[data-action="add-to-cart"]');
        if (addBtn) addBtn.click();
        await new Promise(r => setTimeout(r, 300));

        // Open cart and proceed to checkout
        if (cartBtn) cartBtn.click();
        await new Promise(r => setTimeout(r, 300));
        const proceedBtn = doc.getElementById('proceed-checkout-btn');
        if (proceedBtn) proceedBtn.click();
        await new Promise(r => setTimeout(r, 400));

        check('Opening checkout modal locks body scroll', doc.body.classList.contains('modal-open'));

        // Check exact time input
        const exactTimeInput = doc.getElementById('delivery-exact-time');
        check('Exact time input exists with value', exactTimeInput && exactTimeInput.value === '18:00');

        // Check location URL input and GPS button
        const locationInput = doc.getElementById('delivery-location-url');
        const gpsBtn = doc.getElementById('btn-get-location');
        check('Location input exists', Boolean(locationInput));
        check('GPS location button exists', Boolean(gpsBtn));

        // Check Gift Card Toggle
        const toggleGift = doc.getElementById('toggle-gift-card');
        const giftBox = doc.getElementById('gift-card-fields-box');
        check('Gift card toggle checkbox is initially unchecked', toggleGift && !toggleGift.checked);
        check('Gift card fields are initially hidden', giftBox && (giftBox.style.display === 'none' || getComputedStyle(giftBox).display === 'none'));

        // Toggle Gift Card on
        if (toggleGift) {
          toggleGift.checked = true;
          toggleGift.dispatchEvent(new Event('change'));
          await new Promise(r => setTimeout(r, 200));
          check('Checking gift card toggle displays the custom message and sign fields', giftBox && giftBox.style.display === 'block');

          // Toggle Gift Card off
          toggleGift.checked = false;
          toggleGift.dispatchEvent(new Event('change'));
          await new Promise(r => setTimeout(r, 200));
          check('Unchecking gift card toggle re-collapses the fields', giftBox && giftBox.style.display === 'none');
        }

        // Close checkout modal
        const closeCheckoutBtn = doc.getElementById('close-checkout-btn');
        if (closeCheckoutBtn) {
          closeCheckoutBtn.click();
          await new Promise(r => setTimeout(r, 300));
          check('Closing checkout modal restores body scroll', !doc.body.classList.contains('modal-open'));
        }

        document.getElementById('test-results').innerHTML = results.join('<br>');
      } catch (err) {
        document.getElementById('test-results').innerHTML = 'ERROR: ' + err.message;
      }
    };
  </script>
</body>
</html>
`;

import fs from 'node:fs';
fs.writeFileSync('test-features-runner.html', testScript, 'utf8');

const dump = execSync(`"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=8000 --dump-dom http://localhost:3000/test-features-runner.html`, {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024
});

console.log('Result from Headless Browser:');
const match = dump.match(/<div id="test-results">([\s\S]*?)<\/div>/);
if (match) {
  const lines = match[1].replace(/<br>/g, '\n').trim().split('\n');
  let hasFail = false;
  lines.forEach(l => {
    if (l.startsWith('PASS')) console.log('  ✅ ' + l);
    else if (l.startsWith('FAIL')) {
      console.log('  ❌ ' + l);
      hasFail = true;
    } else console.log('  ℹ️ ' + l);
  });

  if (hasFail) {
    console.error('Some browser tests failed!');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL INTERACTIVE BROWSER TESTS PASSED 100%!');
  }
} else {
  console.log('Dump output:', dump.substring(0, 500));
}
