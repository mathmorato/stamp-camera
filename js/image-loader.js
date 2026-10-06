/**
 * STAMP-CAMERA - Carregador e Normalizador de Imagens
 * Processa arquivos de imagem, corrige orientação EXIF e gera canvas de alta resolução.
 * 100% Client-side.
 */

import { readExifData } from './exif-reader.js';

/**
 * Carrega e processa uma imagem do usuário
 * @param {File|Blob} file
 * @returns {Promise<{
 *   canvas: HTMLCanvasElement,
 *   width: number,
 *   height: number,
 *   exif: Object,
 *   filename: string,
 *   fileSize: number
 * }>}
 */
export async function loadImageFromFile(file) {
  const exif = await readExifData(file);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const normalizedCanvas = applyExifOrientation(img, exif.orientation || 1);
        resolve({
          canvas: normalizedCanvas,
          width: normalizedCanvas.width,
          height: normalizedCanvas.height,
          exif: exif,
          filename: file.name || 'fotografia.jpg',
          fileSize: file.size || 0
        });
      };
      img.onerror = () => reject(new Error('Erro ao decodificar arquivo de imagem'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Cria um canvas corrigindo a orientação EXIF (1 a 8)
 * @param {HTMLImageElement|HTMLCanvasElement} img
 * @param {number} orientation
 * @returns {HTMLCanvasElement}
 */
export function applyExifOrientation(img, orientation = 1) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  // Se a orientação inverter largura e altura (5, 6, 7, 8)
  if (orientation >= 5 && orientation <= 8) {
    canvas.width = height;
    canvas.height = width;
  } else {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.save();

  switch (orientation) {
    case 2: // Horizontal flip
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      break;
    case 3: // 180° rotate
      ctx.translate(width, height);
      ctx.rotate(Math.PI);
      break;
    case 4: // Vertical flip
      ctx.translate(0, height);
      ctx.scale(1, -1);
      break;
    case 5: // 90° CCW + horizontal flip
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6: // 90° CW
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -height);
      break;
    case 7: // 90° CW + horizontal flip
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(width, -height);
      ctx.scale(-1, 1);
      break;
    case 8: // 90° CCW
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-width, 0);
      break;
    default:
      // Orientação 1 (normal)
      break;
  }

  ctx.drawImage(img, 0, 0);
  ctx.restore();

  return canvas;
}

/**
 * Gera uma fotografia de demonstração técnica rica diretamente via Canvas
 * para que o usuário possa testar todas as funcionalidades imediatamente.
 * @param {'with_gps'|'without_gps'|'empty'} type
 * @returns {Promise<Object>}
 */
export async function createDemoImage(type = 'with_gps') {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  // Gradiente de fundo simulando cena externa/obra
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1080);
  bgGrad.addColorStop(0, '#38bdf8');   // Céu
  bgGrad.addColorStop(0.45, '#bae6fd');
  bgGrad.addColorStop(0.46, '#78716c'); // Terreno/Construção
  bgGrad.addColorStop(1, '#44403c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1920, 1080);

  // Desenhar elementos de estrutura técnica (obra civil / inspeção)
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(200, 420, 400, 500); // Pilar A
  ctx.fillRect(800, 380, 450, 540); // Pilar B
  ctx.fillRect(1400, 440, 360, 480); // Pilar C

  // Viga superior
  ctx.fillStyle = '#64748b';
  ctx.fillRect(150, 350, 1650, 80);

  // Linhas de armadura / grid
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  for (let x = 220; x < 600; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 420);
    ctx.lineTo(x, 920);
    ctx.stroke();
  }

  // Tarja com identificador de foto de referência
  ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
  ctx.fillRect(50, 50, 800, 110);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.fillText('STAMP-CAMERA • FOTOGRAFIA DE TESTE TÉCNICO', 80, 95);
  ctx.fillStyle = '#f8fafc';
  ctx.font = '18px Inter, sans-serif';
  ctx.fillText(
    type === 'with_gps'
      ? 'Metadados simulados: GPS (Jussara/GO) + Data/Hora 22/11/2022'
      : type === 'without_gps'
      ? 'Metadados simulados: Data/Hora presente, SEM COORDENADAS GPS'
      : 'Metadados simulados: Sem EXIF (Inserção Manual)',
    80,
    135
  );

  let exif;
  if (type === 'with_gps') {
    // Coordenadas da fotografia de referência especificada na regra (Jussara, Goiás)
    // Lat: -15.86996936, Lon: -50.85227460
    exif = {
      hasExif: true,
      hasGps: true,
      hasDate: true,
      latitude: -15.86996936,
      longitude: -50.8522746,
      altitude: 312.5,
      dateStr: '2022:11:22 18:05:43',
      dateObj: new Date(2022, 10, 22, 18, 5, 43),
      dateSource: 'DateTimeOriginal',
      make: 'Sony',
      model: 'DSC-HX99',
      orientation: 1
    };
  } else if (type === 'without_gps') {
    exif = {
      hasExif: true,
      hasGps: false,
      hasDate: true,
      latitude: null,
      longitude: null,
      altitude: null,
      dateStr: '2022:11:22 18:05:43',
      dateObj: new Date(2022, 10, 22, 18, 5, 43),
      dateSource: 'DateTimeOriginal',
      make: 'Canon',
      model: 'EOS Rebel T7',
      orientation: 1
    };
  } else {
    exif = {
      hasExif: false,
      hasGps: false,
      hasDate: false,
      latitude: null,
      longitude: null,
      altitude: null,
      dateStr: null,
      dateObj: null,
      dateSource: null,
      make: null,
      model: null,
      orientation: 1
    };
  }

  const locationData = type === 'with_gps' ? {
    city: 'Jussara',
    state: 'Goiás',
    country: 'Brasil',
    neighborhood: 'Setor Central',
    street: 'Av. José Vicente',
    number: '100',
    postalCode: '76270-000',
    projectName: 'Residência Jussara',
    process: '5557293-56.2020.8.09.0097',
    responsible: 'Eng. Perito Especialista',
    reportNum: 'RT-2022/88',
    customText: 'Vistoria técnica in loco'
  } : null;

  return {
    canvas,
    width: 1920,
    height: 1080,
    exif,
    locationData,
    filename: `demo_${type}.jpg`,
    fileSize: 1024 * 768
  };
}
