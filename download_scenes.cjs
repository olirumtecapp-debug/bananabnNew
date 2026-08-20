const fs = require('fs');
const path = require('path');

const scenesDir = path.join(__dirname, 'public', 'scenes');
if (!fs.existsSync(scenesDir)) {
  fs.mkdirSync(scenesDir, { recursive: true });
}

const scenes = [
  { name: 'classic.jpg', url: 'https://bananabn.lovable.app/__l5e/assets-v1/93a869b6-a659-4ead-8b81-25066cebb777/classic.jpg' },
  { name: 'bordo.jpg', url: 'https://bananabn.lovable.app/__l5e/assets-v1/c0a131b4-2096-4f31-a5f6-cdc1c56bc382/bordo.jpg' },
  { name: 'safari.jpg', url: 'https://bananabn.lovable.app/__l5e/assets-v1/412adb55-e3b0-4cc3-94a3-256bd05e9f89/safari.jpg' },
  { name: 'ocean.jpg', url: 'https://bananabn.lovable.app/__l5e/assets-v1/fa41a358-0f06-4753-bca4-d64dad1e8c65/ocean.jpg' },
  { name: 'pastel.jpg', url: 'https://bananabn.lovable.app/__l5e/assets-v1/d9eecccc-8de1-4c0a-9fed-495ff715ef2d/pastel.jpg' },
];

async function download() {
  for (const s of scenes) {
    const dest = path.join(scenesDir, s.name);
    console.log('Downloading', s.name, 'from', s.url);
    const res = await fetch(s.url);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    console.log('Saved', dest, buffer.length, 'bytes');
  }
}

download().catch(console.error);
