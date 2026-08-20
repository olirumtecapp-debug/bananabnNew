const fs = require('fs');

async function captureScreenshot() {
  const res = await fetch('http://localhost:9222/json');
  const targets = await res.json();
  const page = targets.find(t => t.type === 'page');
  
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  
  let msgId = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const id = msgId++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  ws.addEventListener('open', async () => {
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 1,
      mobile: false
    });
    
    console.log('Navigating to test server...');
    await send('Page.navigate', { url: 'http://localhost:8089/' });
    
    await new Promise(r => setTimeout(r, 2000));
    
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(screenshot.data, 'base64');
    fs.writeFileSync('C:/Users/Murilo Pai/.gemini/antigravity/brain/31faf6ea-c09a-4a2a-9300-23771524773a/screenshot_test.png', buffer);
    console.log('Saved screenshot_test.png');
    process.exit(0);
  });
}

captureScreenshot().catch(console.error);
