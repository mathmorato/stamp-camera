/**
 * STAMP-CAMERA - Build Script
 * Empacota os módulos em um único script autônomo (js/stamp-camera.bundle.js)
 * compatível com file:/// (duplo clique local no Windows sem bloqueio de CORS)
 * e com servidores web / GitHub Pages.
 */

import fs from 'fs';
import path from 'path';

const files = [
  'js/config.js',
  'js/geolocation.js',
  'js/exif-reader.js',
  'js/image-loader.js',
  'js/templates.js',
  'js/storage.js',
  'js/stamp-engine.js',
  'js/export.js',
  'js/i18n.js',
  'js/tools/stamp-camera/tool.js',
  'js/tools/stamp-camera/ui.js',
  'js/main.js'
];

let bundleContent = `/**
 * STAMP-CAMERA v1.0.2 - Pacote Autônomo 100% Client-Side
 * Funciona nativamente tanto em servidores HTTP quanto no protocolo file:///
 */
(function() {
  'use strict';
\n`;

for (const filePath of files) {
  const fullPath = path.resolve(filePath);
  let code = fs.readFileSync(fullPath, 'utf-8');

  // Remove imports (tanto single-line quanto multi-line)
  code = code.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
  code = code.replace(/import\s+['"][^'"]+['"];?/g, '');

  // Remove exports
  code = code.replace(/^\s*export\s+default\s+/gm, '');
  code = code.replace(/^\s*export\s+(const|let|var|function|class|async\s+function)\s+/gm, '$1 ');
  code = code.replace(/^\s*export\s*\{[^}]*\};?\s*$/gm, '');

  bundleContent += `  // --- Início de ${filePath} ---\n`;
  bundleContent += code.split('\n').map(line => '  ' + line).join('\n');
  bundleContent += `\n  // --- Fim de ${filePath} ---\n\n`;
}

bundleContent += `})();\n`;

const outputPath = path.resolve('js/stamp-camera.bundle.js');
fs.writeFileSync(outputPath, bundleContent, 'utf-8');
console.log(`✓ Pacote gerado com sucesso em: ${outputPath} (${bundleContent.length} bytes)`);
