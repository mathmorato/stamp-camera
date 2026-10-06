/**
 * STAMP-CAMERA - Módulo de Exportação de Fotografias
 * Gera imagem de alta fidelidade nos formatos JPG, PNG e WebP
 * preservando o arquivo original do usuário intacto.
 * Suporta preservação de metadados EXIF e processamento em lote com download em ZIP.
 */

import { injectApp1BytesIntoJpeg } from './exif-reader.js';
import piexif from './vendor/piexif.js';
import { ZipWriter } from './zip-writer.js';

/**
 * Converte blob para ArrayBuffer
 * @param {Blob} blob
 * @returns {Promise<ArrayBuffer>}
 */
async function blobToArrayBuffer(blob) {
  if (typeof blob.arrayBuffer === 'function') {
    return await blob.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Falha ao ler blob'));
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Atualiza ou insere metadados EXIF em um JPEG usando piexifjs
 * @param {ArrayBuffer} jpegBuffer
 * @param {Object} exifData
 * @param {Uint8Array} [rawApp1Bytes]
 * @returns {ArrayBuffer|Uint8Array}
 */
function applyExifToJpegBuffer(jpegBuffer, exifData = {}, rawApp1Bytes = null) {
  const p = (typeof window !== 'undefined' && window.piexif) ? window.piexif : piexif;

  // Se piexif estiver disponível e houver coordenadas ou dados EXIF
  if (p && typeof p.load === 'function') {
    try {
      const u8 = new Uint8Array(jpegBuffer);
      let binary = '';
      const len = u8.byteLength;
      // Converte uint8 para binary string de forma otimizada em blocos
      const chunkSize = 16384;
      for (let i = 0; i < len; i += chunkSize) {
        binary += String.fromCharCode.apply(null, u8.subarray(i, Math.min(i + chunkSize, len)));
      }

      let exifObj = { '0th': {}, 'Exif': {}, 'GPS': {}, '1st': {}, 'thumbnail': null };

      // Se havia bytes brutos de APP1 do arquivo original, tenta carregar como base
      if (rawApp1Bytes && rawApp1Bytes.length > 4) {
        try {
          // Cria JPEG dummy temporário para ler o exifObj completo do arquivo original
          let origApp1Bin = '';
          for (let i = 0; i < rawApp1Bytes.length; i += chunkSize) {
            origApp1Bin += String.fromCharCode.apply(null, rawApp1Bytes.subarray(i, Math.min(i + chunkSize, rawApp1Bytes.length)));
          }
          const dummyJpeg = '\xff\xd8' + origApp1Bin + '\xff\xd9';
          exifObj = p.load(dummyJpeg);
        } catch {
          // Usa objeto vazio padrão
        }
      }

      // Atualiza coordenadas GPS se válidas
      if (typeof exifData.latitude === 'number' && typeof exifData.longitude === 'number' &&
          !isNaN(exifData.latitude) && !isNaN(exifData.longitude)) {
        exifObj['GPS'] = exifObj['GPS'] || {};
        exifObj['GPS'][p.GPSIFD.GPSLatitudeRef] = exifData.latitude < 0 ? 'S' : 'N';
        exifObj['GPS'][p.GPSIFD.GPSLatitude] = p.GPSHelper.degToDmsRational(exifData.latitude);
        exifObj['GPS'][p.GPSIFD.GPSLongitudeRef] = exifData.longitude < 0 ? 'W' : 'E';
        exifObj['GPS'][p.GPSIFD.GPSLongitude] = p.GPSHelper.degToDmsRational(exifData.longitude);

        if (typeof exifData.altitude === 'number' && !isNaN(exifData.altitude)) {
          exifObj['GPS'][p.GPSIFD.GPSAltitudeRef] = exifData.altitude < 0 ? 1 : 0;
          exifObj['GPS'][p.GPSIFD.GPSAltitude] = [Math.round(Math.abs(exifData.altitude) * 10), 10];
        }
      }

      // Atualiza data/hora se fornecida
      if (exifData.dateStr) {
        exifObj['0th'] = exifObj['0th'] || {};
        exifObj['Exif'] = exifObj['Exif'] || {};
        exifObj['0th'][p.ImageIFD.DateTime] = exifData.dateStr;
        exifObj['Exif'][p.ExifIFD.DateTimeOriginal] = exifData.dateStr;
        exifObj['Exif'][p.ExifIFD.DateTimeDigitized] = exifData.dateStr;
      }

      // Adiciona software STAMP-CAMERA
      exifObj['0th'] = exifObj['0th'] || {};
      exifObj['0th'][p.ImageIFD.Software] = 'STAMP-CAMERA';

      const exifBytes = p.dump(exifObj);
      const newBinary = p.insert(exifBytes, binary);

      // Converte binary string de volta para Uint8Array
      const newU8 = new Uint8Array(newBinary.length);
      for (let i = 0; i < newBinary.length; i++) {
        newU8[i] = newBinary.charCodeAt(i);
      }
      return newU8;
    } catch {
      // Fallback silencioso para reinjeção direta de APP1 nativo
    }
  }

  // Fallback 100% binário nativo: reinjeta os bytes brutos do APP1 original
  if (rawApp1Bytes && rawApp1Bytes.length > 4) {
    return injectApp1BytesIntoJpeg(jpegBuffer, rawApp1Bytes);
  }

  return jpegBuffer;
}

/**
 * Exporta o canvas e inicia o download da imagem carimbada
 * @param {HTMLCanvasElement} canvas
 * @param {string} originalFilename
 * @param {'image/jpeg'|'image/png'|'image/webp'} mimeType
 * @param {number} quality (0.1 a 1.0, padrao 1.0 sem perda)
 * @param {Object} [options]
 * @param {boolean} [options.preserveExif=true] Se deve preservar/gravar metadados EXIF
 * @param {Uint8Array} [options.rawApp1Bytes] Bytes originais do APP1
 * @param {Object} [options.exifData] Metadados para enriquecimento
 * @returns {Promise<{filename: string, exifPreserved: boolean}>}
 */
export async function exportStampedPhoto(
  canvas,
  originalFilename = 'fotografia.jpg',
  mimeType = 'image/jpeg',
  quality = 1.0,
  options = {}
) {
  if (!canvas) {
    throw new Error('Canvas não fornecido para exportação');
  }

  const preserveExif = options.preserveExif !== false;

  // Define extensão conforme o formato
  let ext = 'jpg';
  if (mimeType === 'image/png') ext = 'png';
  if (mimeType === 'image/webp') ext = 'webp';

  // Extrai nome base sem extensão
  const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
  const targetFilename = `${baseName}_stamp.${ext}`;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Falha ao gerar arquivo de imagem'));
          return;
        }

        let finalBlob = blob;
        let exifPreserved = false;

        // Regravação de EXIF apenas para o formato JPEG
        if (mimeType === 'image/jpeg' && preserveExif) {
          try {
            const buf = await blobToArrayBuffer(blob);
            const enrichedBuf = applyExifToJpegBuffer(buf, options.exifData, options.rawApp1Bytes);
            finalBlob = new Blob([enrichedBuf], { type: 'image/jpeg' });
            exifPreserved = true;
          } catch (err) {
            console.warn('[STAMP-CAMERA] Não foi possível regravar EXIF na imagem:', err);
          }
        }

        const url = URL.createObjectURL(finalBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = targetFilename;
        document.body.appendChild(a);
        a.click();

        // Limpeza de memória
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve({ filename: targetFilename, exifPreserved });
        }, 100);
      },
      mimeType,
      quality
    );
  });
}

/**
 * Exporta múltiplas fotos em lote, agrupando tudo em um arquivo ZIP
 * @param {Array<Object>} photos Lista de fotos { filename, canvas, exif, ... }
 * @param {Function} renderPhotoFn Função (photo, index, total) => HTMLCanvasElement | Promise<HTMLCanvasElement>
 * @param {Object} [options]
 * @param {'image/jpeg'|'image/png'|'image/webp'} [options.mimeType='image/jpeg']
 * @param {boolean} [options.preserveExif=true]
 * @param {string} [options.zipFilename='fotos_carimbadas_lote.zip']
 * @param {Function} [onProgress] Callback de progresso ({ current, total, filename })
 * @returns {Promise<{ total: number, zipFilename: string }>}
 */
export async function exportStampedPhotosBatch(
  photos,
  renderPhotoFn,
  options = {},
  onProgress = null
) {
  if (!photos || photos.length === 0) {
    throw new Error('Nenhuma foto selecionada para processamento em lote');
  }

  const mimeType = options.mimeType || 'image/jpeg';
  const preserveExif = options.preserveExif !== false;
  const zipFilename = options.zipFilename || 'fotos_carimbadas_lote.zip';
  let ext = 'jpg';
  if (mimeType === 'image/png') ext = 'png';
  if (mimeType === 'image/webp') ext = 'webp';

  const zip = new ZipWriter();
  const total = photos.length;

  for (let i = 0; i < total; i++) {
    const photo = photos[i];
    const baseName = photo.filename ? (photo.filename.substring(0, photo.filename.lastIndexOf('.')) || photo.filename) : `foto_${i + 1}`;
    const outName = `${baseName}_stamp.${ext}`;

    if (typeof onProgress === 'function') {
      onProgress({ current: i + 1, total, filename: photo.filename || outName });
    }

    // Renderiza a imagem através do callback
    const renderedCanvas = await renderPhotoFn(photo, i, total);
    if (!renderedCanvas) continue;

    // Converte canvas para Blob
    const blob = await new Promise((resolve) => {
      renderedCanvas.toBlob(resolve, mimeType, 1.0);
    });

    if (!blob) continue;

    let finalData = blob;
    if (mimeType === 'image/jpeg' && preserveExif) {
      try {
        const buf = await blobToArrayBuffer(blob);
        const enriched = applyExifToJpegBuffer(buf, photo.exifData || photo.exif, photo.exif?.rawApp1Bytes);
        finalData = enriched;
      } catch (err) {
        console.warn(`[STAMP-CAMERA] Falha ao injetar EXIF na foto em lote ${i + 1}:`, err);
      }
    }

    await zip.addFile(outName, finalData);
  }

  // Realiza o download do arquivo ZIP
  zip.downloadZip(zipFilename);

  return { total, zipFilename };
}
