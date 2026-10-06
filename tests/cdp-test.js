// Test script using Node to check Chrome CDP console logs
import http from 'http';
import { spawn } from 'child_process';

async function testUrl(targetUrl) {
  console.log(`\n--- Testando URL: ${targetUrl} ---`);
  const port = 9222;
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const chromeProc = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=C:\\Users\\M\\.gemini\\antigravity-ide\\scratch\\chrome_test_profile'
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

    const wsUrl = newPage.webSocketDebuggerUrl;
    console.log('Conectando ao WebSocket CDP da nova página:', wsUrl);

    // Conectar WebSocket nativo do Node 24
    const ws = new WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function send(method, params = {}) {
      const id = msgId++;
      ws.send(JSON.stringify({ id, method, params }));
      return id;
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
        console.log(`[CONSOLE ${msg.params.type.toUpperCase()}]:`, text);
      } else if (msg.method === 'Runtime.exceptionThrown') {
        console.error('[EXCEPTION]:', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
      } else if (msg.method === 'Log.entryAdded') {
        console.log(`[LOG ${msg.params.entry.level}]:`, msg.params.entry.text);
      } else if (msg.result && msg.result.result) {
        console.log(`[EVAL RESULT id=${msg.id}]:`, msg.result.result.value || JSON.stringify(msg.result.result));
      }
    };

    send('Runtime.enable');
    send('Log.enable');
    send('Page.enable');
    send('Page.navigate', { url: targetUrl });

    await new Promise(r => setTimeout(r, 2500));

    // Executa verificação do DOM e testa clicar no botão Demo
    const evalId = send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.getElementById('btnDemoWithGps');
          const hasApp = !!window.stampCameraApp;
          let clicked = false;
          if (btn) {
            btn.click();
            clicked = true;
          }
          return JSON.stringify({
            href: window.location.href,
            title: document.title,
            bodyLength: document.body ? document.body.innerHTML.length : 0,
            hasApp: hasApp,
            btnExists: !!btn,
            btnClicked: clicked
          });
        })()
      `,
      returnByValue: true
    });

    await new Promise(r => setTimeout(r, 1500));

    // Verificar se o canvas agora está ativo
    send('Runtime.evaluate', {
      expression: `
        (() => {
          const canvas = document.getElementById('previewCanvas');
          const app = window.stampCameraApp;
          return JSON.stringify({
            appPhotoExists: !!(app && app.tool && app.tool.photo),
            canvasDisplay: canvas ? canvas.style.display : null,
            canvasWidth: canvas ? canvas.width : null,
            canvasHeight: canvas ? canvas.height : null
          });
        })()
      `,
      returnByValue: true
    });

    await new Promise(r => setTimeout(r, 1500));
    ws.close();
  } catch (err) {
    console.error('Erro no teste CDP:', err);
  } finally {
    chromeProc.kill();
  }
}

async function run() {
  await testUrl('file:///C:/Antigravity/stamp-camera/index.html');
  await testUrl('http://127.0.0.1:8080/index.html');
  process.exit(0);
}

run();
