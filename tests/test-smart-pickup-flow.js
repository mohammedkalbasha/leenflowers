import { execSync } from 'node:child_process';
import fs from 'node:fs';

console.log('Testing Smart Pickup & Recipient Flow in Headless Chrome...');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const runnerHtml = `
<!DOCTYPE html>
<html>
<body>
  <div id="results">RUNNING</div>
  <iframe id="store-frame" src="http://localhost:3000" style="width:1200px; height:800px;"></iframe>
  <script>
    const frame = document.getElementById('store-frame');
    frame.onload = async () => {
      const doc = frame.contentDocument;
      const logs = [];

      try {
        await new Promise(r => setTimeout(r, 1000));

        // Add 1 item & open checkout
        const addBtn = doc.querySelector('[data-action="add-to-cart"]');
        if (addBtn) addBtn.click();
        await new Promise(r => setTimeout(r, 200));

        const openCart = doc.getElementById('open-cart-btn');
        if (openCart) openCart.click();
        await new Promise(r => setTimeout(r, 200));

        const proceed = doc.getElementById('proceed-checkout-btn');
        if (proceed) proceed.click();
        await new Promise(r => setTimeout(r, 400));

        const deliveryCard = doc.getElementById('option-delivery-label');
        const pickupCard = doc.getElementById('option-pickup-label');
        const deliveryWrap = doc.getElementById('delivery-section-wrap');
        const pickupSection = doc.getElementById('pickup-options-section');
        const pickupForSelf = doc.getElementById('pickup-for-self-label');
        const pickupForOther = doc.getElementById('pickup-for-other-label');
        const pickupOtherDetails = doc.getElementById('pickup-other-details');

        // 1. Initial State (Delivery)
        logs.push('1. Initial Delivery active: ' + deliveryCard.classList.contains('active'));
        logs.push('2. Initial Delivery wrap visible: ' + (deliveryWrap.style.display !== 'none'));
        logs.push('3. Initial Pickup section hidden: ' + (pickupSection.style.display === 'none'));

        // 2. Click Pickup
        pickupCard.click();
        await new Promise(r => setTimeout(r, 300));

        logs.push('4. After Pickup click - Delivery wrap hidden: ' + (deliveryWrap.style.display === 'none'));
        logs.push('5. After Pickup click - Pickup section visible: ' + (pickupSection.style.display === 'block'));
        logs.push('6. After Pickup click - Self pickup active by default: ' + pickupForSelf.classList.contains('active'));
        logs.push('7. After Pickup click - Other details hidden for self: ' + (pickupOtherDetails.style.display === 'none'));

        // 3. Click "إهداء لشخص آخر"
        pickupForOther.click();
        await new Promise(r => setTimeout(r, 300));

        logs.push('8. After Other click - Other option active: ' + pickupForOther.classList.contains('active'));
        logs.push('9. After Other click - Other details visible: ' + (pickupOtherDetails.style.display === 'block'));

        // 4. Click back "لي شخصياً"
        pickupForSelf.click();
        await new Promise(r => setTimeout(r, 300));

        logs.push('10. After re-clicking Self - Self active: ' + pickupForSelf.classList.contains('active'));
        logs.push('11. After re-clicking Self - Other details hidden again: ' + (pickupOtherDetails.style.display === 'none'));

        document.getElementById('results').innerHTML = logs.join('<br>');
      } catch (err) {
        document.getElementById('results').innerHTML = 'ERROR: ' + err.message;
      }
    };
  </script>
</body>
</html>
`;

fs.writeFileSync('temp-smart-pickup.html', runnerHtml, 'utf8');

const dump = execSync(`"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=6000 --dump-dom http://localhost:3000/temp-smart-pickup.html`, {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024
});

fs.unlinkSync('temp-smart-pickup.html');

const match = dump.match(/<div id="results">([\s\S]*?)<\/div>/);
if (match) {
  const lines = match[1].replace(/<br>/g, '\n').trim().split('\n');
  let allPass = true;
  lines.forEach(l => {
    if (l.includes(': true')) {
      console.log('  ✅ ' + l);
    } else {
      console.log('  ❌ ' + l);
      allPass = false;
    }
  });

  if (!allPass) {
    console.error('Some checks failed!');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 11 SMART RECIPIENT & FULFILLMENT CHECKS PASSED 100%!');
  }
} else {
  console.log('Dump output:', dump.substring(0, 500));
}
