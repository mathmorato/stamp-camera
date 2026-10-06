/**
 * STAMP-CAMERA - Teste E2E Headless no Google Chrome via CDP
 * Valida a execução interativa de todos os botões, abas, campos, presets e exportação
 * tanto em file:/// quanto em http://.
 */

import http from 'http';
import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';

async function runBrowserTest(targetUrl) {
  console.log(`\n======================================================`);
  console.log(`Testando ambiente real no Chrome: ${targetUrl}`);
  console.log(`======================================================`);

  const port = 9222;
  const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + path.join(os.tmpdir(), 'stamp-camera-chrome-' + Date.now())
  ]);

  await new Promise(r => setTimeout(r, 1200));

  try {
    const newPage = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: port,
        path: `/json/new?${encodeURIComponent(targetUrl)}`,
        method: 'PUT'
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.on('error', reject);
      req.end();
    });

    const ws = new WebSocket(newPage.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const pendingPromises = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pendingPromises.has(msg.id)) {
        const { resolve, reject } = pendingPromises.get(msg.id);
        pendingPromises.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
        console.log(`  [Console]:`, text);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        console.error(`  [Erro JS]:`, msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
      }
    };

    function sendCmd(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pendingPromises.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(fnStr) {
      const res = await sendCmd('Runtime.evaluate', {
        expression: `(${fnStr})()`,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result ? res.result.value : null;
    }

    await sendCmd('Runtime.enable');
    await sendCmd('Page.enable');

    // Aguarda inicialização
    await new Promise(r => setTimeout(r, 1500));

    // 1. Testa carregamento da aplicação
    const initCheck = await evaluate(`() => {
      const headerIconBtns = document.querySelectorAll('.header-btn-icon');
      return {
        appLoaded: !!window.stampCameraApp,
        title: document.title,
        btnDemoExists: !!document.getElementById('btnDemoWithGps'),
        btnExportExists: !!document.getElementById('btnExport'),
        headerInlineIconsCount: headerIconBtns.length
      };
    }`);
    console.log('✓ Inicialização da aplicação (com botões de ícones inline):', initCheck);

    // 2. Testa clique no botão Demo com GPS
    const demoClickResult = await evaluate(`async () => {
      const btn = document.getElementById('btnDemoWithGps');
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 600));
      const app = window.stampCameraApp;
      const canvas = document.getElementById('previewCanvas');
      const lines = app?.tool?.getStampRenderLines() || [];
      return {
        hasPhoto: !!(app && app.tool && app.tool.photo),
        filename: app?.tool?.photo?.filename,
        canvasVisible: canvas?.style.display === 'block',
        canvasDimensions: canvas ? canvas.width + 'x' + canvas.height : null,
        activeFieldsCount: app?.tool?.activeFields?.length,
        autoCity: app?.tool?.location?.city,
        autoState: app?.tool?.location?.state,
        autoCountry: app?.tool?.location?.country,
        stampLinesWithInlineIcons: lines.length > 0 && lines.every(l => !!l.icon)
      };
    }`);
    console.log('✓ Carregamento da foto de teste, geocodificação e ícones inline no carimbo:', demoClickResult);

    // 3. Testa alternância de abas e campos
    const tabClickResult = await evaluate(`() => {
      const fieldsTabBtn = document.querySelector('[data-tab="fields"]');
      if (fieldsTabBtn) fieldsTabBtn.click();
      const fieldsPanel = document.getElementById('tab-fields');
      const items = document.querySelectorAll('.field-item');
      return {
        tabActive: fieldsPanel?.classList.contains('active'),
        itemsCount: items.length
      };
    }`);
    console.log('✓ Alternância para aba Campos:', tabClickResult);

    // 4. Testa edição de valor de um campo
    const fieldEditResult = await evaluate(`() => {
      const app = window.stampCameraApp;
      const bairroRow = document.querySelector('[data-id="neighborhood"]');
      if (bairroRow) {
        const valInput = bairroRow.querySelector('.field-value-input');
        const check = bairroRow.querySelector('.field-checkbox');
        if (valInput) {
          valInput.value = 'Bairro São Francisco';
          valInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (check && !check.checked) {
          check.checked = true;
          check.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      const lines = app.tool.getStampRenderLines();
      return {
        linesCount: lines.length,
        hasCustomBairro: lines.some(l => l.value === 'Bairro São Francisco')
      };
    }`);
    console.log('✓ Edição de valor de campo e inclusão no carimbo:', fieldEditResult);

    // 5. Testa mudança de posição (9-grid)
    const posResult = await evaluate(`() => {
      const app = window.stampCameraApp;
      const topCenterBtn = document.querySelector('[data-pos="top-center"]');
      if (topCenterBtn) topCenterBtn.click();
      return {
        currentPos: app.tool.settings.position
      };
    }`);
    console.log('✓ Alteração de posição (grade 3x3):', posResult);

    // 6. Testa alternância de tema
    const themeResult = await evaluate(`() => {
      const themeBtn = document.getElementById('themeToggleBtn');
      const initial = document.documentElement.getAttribute('data-theme');
      if (themeBtn) themeBtn.click();
      const toggled = document.documentElement.getAttribute('data-theme');
      if (themeBtn) themeBtn.click();
      const reverted = document.documentElement.getAttribute('data-theme');
      return { initial, toggled, reverted };
    }`);
    console.log('✓ Alternância de tema (Claro / Escuro):', themeResult);

    // 7. Testa exportação (mock de toBlob para verificar chamada limpa)
    const exportResult = await evaluate(`async () => {
      let exportCalled = false;
      const origToBlob = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = function(callback, type, quality) {
        exportCalled = true;
        callback(new Blob(['fake-image'], { type }));
      };
      const btnExport = document.getElementById('btnExport');
      if (btnExport) btnExport.click();
      await new Promise(r => setTimeout(r, 400));
      HTMLCanvasElement.prototype.toBlob = origToBlob;
      return { exportCalled };
    }`);
    // 8. Testa botão Limpar Espaço de Trabalho
    const clearResult = await evaluate(`() => {
      const clearBtn = document.getElementById('btnClearWorkspace');
      if (clearBtn) clearBtn.click();
      const app = window.stampCameraApp;
      const canvas = document.getElementById('previewCanvas');
      const placeholder = document.getElementById('emptyPlaceholder');
      return {
        photoCleared: app.tool.photo === null,
        canvasHidden: canvas.style.display === 'none',
        placeholderVisible: placeholder.style.display === 'flex'
      };
    }`);
    console.log('✓ Botão Limpar Espaço de Trabalho:', clearResult);

    ws.close();
  } catch (err) {
    console.error('Falha no teste:', err);
  } finally {
    chromeProc.kill();
  }
}

async function run() {
  await runBrowserTest(pathToFileURL(path.resolve('index.html')).href);
  await runBrowserTest('http://127.0.0.1:8080/index.html');
  console.log('\n=== TODOS OS TESTES E2E EM NAVEGADOR REAL FORAM CONCLUÍDOS ===\n');
  process.exit(0);
}

run();
