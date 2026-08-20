async function testGame() {
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
    await send('Runtime.enable');
    await send('Page.enable');
    
    let errors = [];
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        errors.push(msg.params.exceptionDetails);
        console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description || '');
      }
    });

    console.log('Navigating to game #/jogar/ia ...');
    await send('Page.navigate', { url: 'http://localhost:8089/#/jogar/ia' });
    
    await new Promise(r => setTimeout(r, 2000));
    
    const doc = await send('Runtime.evaluate', { expression: 'document.getElementById("root").innerText' });
    console.log('=== GAME SCREEN TEXT ===\n' + doc?.result?.value);
    console.log('=== GAME SCREEN ERRORS ===', errors.length);
    
    process.exit(0);
  });
}

testGame().catch(console.error);
