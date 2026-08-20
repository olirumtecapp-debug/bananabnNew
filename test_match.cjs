async function testStartMatch() {
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
    
    console.log('Clicking COMEÇAR ...');
    await send('Runtime.evaluate', { 
      expression: `
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('COMEÇAR'));
        if (btn) btn.click();
      ` 
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    const doc = await send('Runtime.evaluate', { expression: 'document.getElementById("root").innerText' });
    console.log('=== MATCH SCREEN TEXT ===\n' + doc?.result?.value);
    
    process.exit(0);
  });
}

testStartMatch().catch(console.error);
