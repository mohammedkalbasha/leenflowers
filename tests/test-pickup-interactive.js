import { execSync } from 'node:child_process';
import fs from 'node:fs';

console.log('Testing interactive switching between Delivery and Pickup in Chrome...');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const htmlRunner = `
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

        // Add 1 item
        const addBtn = doc.querySelector('[data-action="add-to-cart"]');
        if (addBtn) addBtn.click();
        await new Promise(r => setTimeout(r, 300));

        // Open Cart & Proceed
        const openCart = doc.getElementById('open-cart-btn');
        if (openCart) openCart.click();
        await new Promise(r => setTimeout(r, 300));

        const proceed = doc.getElementById('proceed-checkout-btn');
        if (proceed) proceed.click();
        await new Promise(r => setTimeout(r, 400));

        const deliveryCard = doc.getElementById('option-delivery-label');
        const pickupCard = doc.getElementById('option-pickup-label');
        const deliveryFields = doc.getElementById('delivery-specific-fields');
        const pickupInfo = doc.getElementById('pickup-store-info');
        const totalDisplay = doc.getElementById('modal-total-display');
        const feeNote = doc.getElementById('modal-delivery-fee-note');

        // Check Initial: Delivery selected
        logs.push('Initial Delivery active: ' + deliveryCard.classList.contains('active'));
        logs.push('Initial Delivery fields visible: ' + (deliveryFields.style.display !== 'none'));
        logs.push('Initial Pickup info hidden: ' + (pickupInfo.style.display === 'none'));
        logs.push('Initial Total contains delivery fee: ' + totalDisplay.textContent.includes('28.00'));

        // Switch to Pickup
        pickupCard.click();
        await new Promise(r => setTimeout(r, 300));

        logs.push('After Pickup click - Pickup active: ' + pickupCard.classList.contains('active'));
        logs.push('After Pickup click - Delivery fields hidden: ' + (deliveryFields.style.display === 'none'));
        logs.push('After Pickup click - Pickup info visible: ' + (pickupInfo.style.display === 'block'));
        logs.push('After Pickup click - Total has 0 fee: ' + totalDisplay.textContent.includes('25.00'));
        logs.push('After Pickup click - Fee note mentions free pickup: ' + feeNote.textContent.includes('مجاناً'));

        // Switch back to Delivery
        deliveryCard.click();
        await new Promise(r => setTimeout(r, 300));

        logs.push('Switch back - Delivery active: ' + deliveryCard.classList.contains('active'));
        logs.push('Switch back - Delivery fields visible: ' + (deliveryFields.style.display === 'block'));
        logs.push('Switch back - Total restored: ' + totalDisplay.textContent.includes('28.00'));

        document.getElementById('results').innerHTML = logs.join('<br>');
      } catch (err) {
        document.getElementById('results').innerHTML = 'ERROR: ' + err.message;
      }
    };
  </script>
</body>
</html>
`;

fs.writeFileSync('temp-pickup-test.html', htmlRunner, 'utf8');

const dump = execSync(`"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=6000 --dump-dom http://localhost:3000/temp-pickup-test.html`, {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024
});

fs.unlinkSync('temp-pickup-test.html');

const match = dump.match(/<div id="results">([\s\S]*?)<\/div>/);
if (match) {
  const lines = match[1].replace(/<br>/g, '\n').trim().split('\n');
  lines.forEach(l => console.log('  👉 ' + l));
} else {
  console.log('No match found');
}
