import fs from 'fs';

const buf = fs.readFileSync('assets/images/demo_liberty.jpg');
const b64 = buf.toString('base64');
const content = `export const DEMO_LIBERTY_BASE64 = "data:image/jpeg;base64,${b64}";\n`;
fs.writeFileSync('assets/images/demo-image-data.js', content);
console.log('Created demo-image-data.js! Length:', content.length);
