import { execSync } from 'node:child_process';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

try {
  const out = execSync(`"${chrome}" --headless=new --disable-gpu --virtual-time-budget=6000 --dump-dom http://localhost:3000/test-dashboard.html`, {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });

  const s = out.indexOf('<div id="results">');
  const e = out.indexOf('<iframe id="dash-frame"', s);
  if (s !== -1 && e !== -1) {
    const clean = out.substring(s, e)
      .replace(/<[^>]+>/g, '\n')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    console.log(clean);
  } else {
    console.log('Results output length:', out.length);
  }
} catch (err) {
  console.error('Error running dashboard test:', err.message);
  process.exit(1);
}
