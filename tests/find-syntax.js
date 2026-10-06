import fs from 'fs';

const code = fs.readFileSync('./js/stamp-camera.bundle.js', 'utf-8');
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('import ') || line.includes('from \'') || line.includes('from "') || line.trim().startsWith('import')) {
    console.log(`Linha ${i + 1}: ${line}`);
  }
}
