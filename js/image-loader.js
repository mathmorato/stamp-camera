/**
 * STAMP-CAMERA - Carregador e Normalizador de Imagens
 * Processa arquivos de imagem, corrige orientação EXIF e gera canvas de alta resolução.
 * 100% Client-side.
 */

import { readExifData } from './exif-reader.js';
import { DEMO_LIBERTY_BASE64 } from '../assets/images/demo-image-data.js';

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
 * Gera a fotografia oficial de demonstração (Estátua da Liberdade - Nova York)
 * com coordenadas geográficas reais de Liberty Island extraídas diretamente da fotografia.
 * @param {'with_gps'|'without_gps'|'empty'} type
 * @returns {Promise<Object>}
 */
export async function createDemoImage(type = 'with_gps') {
  const canvas = document.createElement('canvas');
  let width = 768;
  let height = 1024;

  if (typeof Image !== 'undefined' && typeof DEMO_LIBERTY_BASE64 !== 'undefined') {
    const img = new Image();
    img.src = DEMO_LIBERTY_BASE64;
    await new Promise((resolve) => {
      if (img.complete && img.naturalWidth) resolve();
      else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    });

    width = img.naturalWidth || 768;
    height = img.naturalHeight || 1024;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
    }
  } else {
    canvas.width = 768;
    canvas.height = 1024;
  }

  let exif;
  if (type === 'with_gps') {
    // Coordenadas reais da Estátua da Liberdade (Liberty Island, Nova York)
    // Lat: 40.68925° N, Lon: 74.04450° W, Alt: 15m
    exif = {
      hasExif: true,
      hasGps: true,
      hasDate: true,
      latitude: 40.68925,
      longitude: -74.0445,
      altitude: 15.0,
      dateStr: '2024:06:15 14:32:10',
      dateObj: new Date(2024, 5, 15, 14, 32, 10),
      dateSource: 'DateTimeOriginal',
      make: 'Apple',
      model: 'iPhone 15 Pro',
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
      dateStr: '2024:06:15 14:32:10',
      dateObj: new Date(2024, 5, 15, 14, 32, 10),
      dateSource: 'DateTimeOriginal',
      make: 'Apple',
      model: 'iPhone 15 Pro',
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
    city: 'Nova York',
    state: 'Nova York',
    country: 'Estados Unidos',
    neighborhood: 'Liberty Island',
    street: 'Liberty Island',
    number: '1',
    postalCode: '10004',
    projectName: 'Monumento da Estátua da Liberdade',
    reportNum: 'VIST-NY-2024/42',
    customText: 'Inspeção pericial in loco'
  } : null;

  return {
    canvas,
    width,
    height,
    exif,
    locationData,
    filename: `estatua_da_liberdade_${type}.jpg`,
    fileSize: 162489
  };
}
