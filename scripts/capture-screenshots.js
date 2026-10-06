import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const TARGET_URL = 'http://127.0.0.1:8080/index.html';
const PORT = 9223;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\M\\.gemini\\antigravity-ide\\brain\\9d130056-8140-47ab-8d9c-c7548d7722c8';

async function capture() {
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1600,1000',
    '--user-data-dir=C:\\Users\\M\\.gemini\\antigravity-ide\\scratch\\chrome_profile_ss_' + Date.now()
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const page = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: PORT,
        path: `/json/new?${encodeURIComponent(TARGET_URL)}`,
        method: 'PUT'
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.on('error', reject);
      req.end();
    });

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pending = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await new Promise(r => setTimeout(r, 1000));

    // Capture 1: Empty state
    const ss1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'redesign_empty_state.png'), Buffer.from(ss1.data, 'base64'));
    console.log('Saved redesign_empty_state.png');

    // Load demo photo with GPS
    await send('Runtime.evaluate', {
      expression: `document.getElementById('btnDemoWithGps').click();`
    });
    await new Promise(r => setTimeout(r, 1200));

    // Switch to Campos tab to showcase field ordering and inline icon tags
    await send('Runtime.evaluate', {
      expression: `document.querySelector('[data-tab="fields"]').click();`
    });
    await new Promise(r => setTimeout(r, 500));

    // Capture 2: Active photo with stamp in dark mode
    const ss2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'redesign_active_dark.png'), Buffer.from(ss2.data, 'base64'));
    console.log('Saved redesign_active_dark.png');

    // Switch to light theme
    await send('Runtime.evaluate', {
      expression: `document.getElementById('themeToggleBtn').click();`
    });
    await new Promise(r => setTimeout(r, 500));

    // Capture 3: Active photo in light mode
    const ss3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'redesign_active_light.png'), Buffer.from(ss3.data, 'base64'));
    console.log('Saved redesign_active_light.png');

    // Switch to export tab
    await send('Runtime.evaluate', {
      expression: `document.querySelector('[data-tab="export"]').click();`
    });
    await new Promise(r => setTimeout(r, 500));

    // Capture 4: Export tab
    const ss4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'redesign_active_export.png'), Buffer.from(ss4.data, 'base64'));
    console.log('Saved redesign_active_export.png');

    ws.close();
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

capture().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
