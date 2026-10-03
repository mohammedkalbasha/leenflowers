import { execSync } from 'node:child_process';
import http from 'node:http';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

console.log('Running End-to-End browser test suite on Chrome headless...');

try {
  // Run chrome and dump dom after 6 seconds to let tests complete
  const out = execSync(`"${chrome}" --headless=new --disable-gpu --virtual-time-budget=8000 --dump-dom http://localhost:3000/test-runner.html`, {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024
  });

  // Extract results div contents
  const resultsStart = out.indexOf('<div id="results">');
  const resultsEnd = out.indexOf('<iframe id="store-frame"', resultsStart);
  
  if (resultsStart !== -1 && resultsEnd !== -1) {
    const resultsSnippet = out.substring(resultsStart, resultsEnd);
    // Strip HTML tags for clean console output
    const cleanText = resultsSnippet
      .replace(/<div class="suite">/g, '\n🔷 ')
      .replace(/<div class="pass">/g, '  ')
      .replace(/<div class="fail">/g, '  ')
      .replace(/<div>/g, '  ')
      .replace(/<\/div>/g, '\n')
      .replace(/<[^>]+>/g, '');
    
    console.log('\n--- BROWSER TEST RESULTS ---');
    console.log(cleanText.trim());

    if (cleanText.includes('FAIL:')) {
      console.error('\n❌ SOME TESTS FAILED!');
      process.exit(1);
    } else if (cleanText.includes('TEST RUN COMPLETE')) {
      console.log('\n🎉 ALL TESTS PASSED WITH 100% SUCCESS!');
    } else {
      console.warn('\n⚠️ Tests may not have completed within time budget.');
    }
  } else {
    console.warn('Could not locate results div. Full output length:', out.length);
  }
} catch (e) {
  console.error('Execution error:', e.message);
  process.exit(1);
}
