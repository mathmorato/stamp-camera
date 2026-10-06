/**
 * STAMP-CAMERA - Leitor EXIF 100% Client-side
 * Extrai metadados fotográficos, coordenadas GPS, data/hora e orientação
 * sem qualquer dependência externa ou envio para servidores.
 */

/**
 * Lê os metadados EXIF a partir de um File ou ArrayBuffer
 * @param {File|ArrayBuffer} fileOrBuffer
 * @returns {Promise<Object>}
 */
export async function readExifData(fileOrBuffer) {
  let buffer;
  if (fileOrBuffer instanceof ArrayBuffer) {
    buffer = fileOrBuffer;
  } else if (fileOrBuffer && typeof fileOrBuffer.arrayBuffer === 'function') {
    buffer = await fileOrBuffer.arrayBuffer();
  } else {
    throw new Error('Formato inválido fornecido ao leitor EXIF');
  }

  const result = {
    hasExif: false,
    hasGps: false,
    hasDate: false,
    latitude: null,
    longitude: null,
    altitude: null,
    dateStr: null,
    dateObj: null,
    dateSource: null, // 'DateTimeOriginal' | 'CreateDate' | 'ModifyDate'
    make: null,
    model: null,
    orientation: 1,   // Default: normal (1)
    software: null,
    rawTags: {}
  };

  try {
    const view = new DataView(buffer);

    // Verificar se é JPEG (SOI marker 0xFFD8)
    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xFFD8) {
      // Não é JPEG ou buffer muito curto
      return result;
    }

    let offset = 2;
    const length = view.byteLength;

    // Percorrer os segmentos do JPEG até achar APP1 (0xFFE1)
    while (offset < length - 4) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      if (marker === 0xFFE1) {
        // Encontrou APP1
        const segmentLength = view.getUint16(offset, false);
        const segmentStart = offset + 2;

        // Verificar cabeçalho "Exif\0\0" (0x45 0x78 0x69 0x66 0x00 0x00)
        if (
          view.getUint8(segmentStart) === 0x45 &&
          view.getUint8(segmentStart + 1) === 0x78 &&
          view.getUint8(segmentStart + 2) === 0x69 &&
          view.getUint8(segmentStart + 3) === 0x66 &&
          view.getUint8(segmentStart + 4) === 0x00 &&
          view.getUint8(segmentStart + 5) === 0x00
        ) {
          const tiffStart = segmentStart + 6;
          parseTiff(view, tiffStart, result);
          result.hasExif = true;
          break;
        }

        offset += segmentLength;
      } else if ((marker & 0xFF00) === 0xFF00) {
        // Outros marcadores JPEG
        if (marker === 0xFFDA || marker === 0xFFD9) {
          // Início dos dados da imagem ou fim
          break;
        }
        const segLen = view.getUint16(offset, false);
        offset += segLen;
      } else {
        break;
      }
    }
  } catch (err) {
    console.warn('[STAMP-CAMERA] Aviso ao ler EXIF:', err);
  }

  // Avalia se tem GPS válido
  if (result.latitude !== null && result.longitude !== null) {
    result.hasGps = true;
  }

  // Avalia se tem data válida
  if (result.dateObj !== null) {
    result.hasDate = true;
  }

  return result;
}

/**
 * Faz o parse da estrutura TIFF
 */
function parseTiff(view, tiffStart, result) {
  // Byte order: 0x4949 ('II' Little Endian) ou 0x4D4D ('MM' Big Endian)
  const byteOrder = view.getUint16(tiffStart, false);
  let littleEndian;
  if (byteOrder === 0x4949) {
    littleEndian = true;
  } else if (byteOrder === 0x4D4D) {
    littleEndian = false;
  } else {
    return; // Ordem de bytes inválida
  }

  // Verificar o número mágico 42 (0x002A)
  if (view.getUint16(tiffStart + 2, littleEndian) !== 42) {
    return;
  }

  // Offset do IFD0 (relativo ao início do TIFF)
  const ifd0Offset = view.getUint32(tiffStart + 4, littleEndian);
  if (ifd0Offset + tiffStart >= view.byteLength) return;

  let exifSubOffset = null;
  let gpsSubOffset = null;

  // Ler IFD0
  parseIFD(view, tiffStart, tiffStart + ifd0Offset, littleEndian, (tag, val) => {
    result.rawTags[tag] = val;
    if (tag === 0x0112) result.orientation = val; // Orientation
    if (tag === 0x010F) result.make = val;        // Make
    if (tag === 0x0110) result.model = val;       // Model
    if (tag === 0x0131) result.software = val;    // Software
    if (tag === 0x0132 && !result.dateStr) {      // ModifyDate
      result.dateStr = val;
      result.dateSource = 'ModifyDate';
    }
    if (tag === 0x8769) exifSubOffset = val;      // Exif IFD Pointer
    if (tag === 0x8825) gpsSubOffset = val;       // GPS IFD Pointer
  });

  // Ler Exif Sub-IFD
  if (exifSubOffset !== null && tiffStart + exifSubOffset < view.byteLength) {
    let dtOriginal = null;
    let dtDigitized = null;

    parseIFD(view, tiffStart, tiffStart + exifSubOffset, littleEndian, (tag, val) => {
      result.rawTags[tag] = val;
      if (tag === 0x9003) dtOriginal = val;  // DateTimeOriginal
      if (tag === 0x9004) dtDigitized = val; // CreateDate
    });

    if (dtOriginal) {
      result.dateStr = dtOriginal;
      result.dateSource = 'DateTimeOriginal';
    } else if (dtDigitized && !result.dateStr) {
      result.dateStr = dtDigitized;
      result.dateSource = 'CreateDate';
    }
  }

  // Tentar converter a string de data para Date object
  if (result.dateStr) {
    result.dateObj = parseExifDate(result.dateStr);
  }

  // Ler GPS Sub-IFD
  if (gpsSubOffset !== null && tiffStart + gpsSubOffset < view.byteLength) {
    let latRef = 'N';
    let latValues = null;
    let lonRef = 'E';
    let lonValues = null;
    let altRef = 0;
    let altVal = null;
    let gpsDateStr = null;
    let gpsTimeVals = null;

    parseIFD(view, tiffStart, tiffStart + gpsSubOffset, littleEndian, (tag, val) => {
      result.rawTags[tag] = val;
      if (tag === 0x0001) latRef = val;
      if (tag === 0x0002) latValues = val;
      if (tag === 0x0003) lonRef = val;
      if (tag === 0x0004) lonValues = val;
      if (tag === 0x0005) altRef = val;
      if (tag === 0x0006) altVal = val;
      if (tag === 0x0007) gpsTimeVals = val;
      if (tag === 0x001D) gpsDateStr = val;
    });

    if (latValues && latValues.length === 3) {
      const deg = latValues[0] + latValues[1] / 60 + latValues[2] / 3600;
      result.latitude = (latRef === 'S' || latRef === 's') ? -deg : deg;
    }

    if (lonValues && lonValues.length === 3) {
      const deg = lonValues[0] + lonValues[1] / 60 + lonValues[2] / 3600;
      result.longitude = (lonRef === 'W' || lonRef === 'w') ? -deg : deg;
    }

    if (typeof altVal === 'number') {
      result.altitude = altRef === 1 ? -altVal : altVal;
    }

    // Se não havia data normal, mas tem GPS Date/Time
    if (!result.dateObj && gpsDateStr) {
      const gpsDateParsed = parseExifGpsDate(gpsDateStr, gpsTimeVals);
      if (gpsDateParsed) {
        result.dateObj = gpsDateParsed;
        result.dateStr = gpsDateStr;
        result.dateSource = 'GPSDateStamp';
      }
    }
  }
}

/**
 * Lê as entradas de um diretório IFD
 */
function parseIFD(view, tiffStart, ifdOffset, littleEndian, callback) {
  if (ifdOffset + 2 > view.byteLength) return;
  const numEntries = view.getUint16(ifdOffset, littleEndian);
  let entryOffset = ifdOffset + 2;

  for (let i = 0; i < numEntries; i++) {
    if (entryOffset + 12 > view.byteLength) break;

    const tag = view.getUint16(entryOffset, littleEndian);
    const type = view.getUint16(entryOffset + 2, littleEndian);
    const count = view.getUint32(entryOffset + 4, littleEndian);
    const valueOffset = entryOffset + 8;

    const val = readTagValue(view, tiffStart, type, count, valueOffset, littleEndian);
    if (val !== undefined && val !== null) {
      callback(tag, val);
    }

    entryOffset += 12;
  }
}

/**
 * Converte os bytes de uma tag TIFF no valor correspondente
 */
function readTagValue(view, tiffStart, type, count, valueOffset, littleEndian) {
  // Types:
  // 1: BYTE, 2: ASCII, 3: SHORT (16-bit), 4: LONG (32-bit), 5: RATIONAL (2x 32-bit),
  // 7: UNDEFINED, 9: SLONG, 10: SRATIONAL
  let dataOffset = valueOffset;
  const typeBytes = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8];
  const byteSize = (typeBytes[type] || 1) * count;

  if (byteSize > 4) {
    const ptr = view.getUint32(valueOffset, littleEndian);
    dataOffset = tiffStart + ptr;
    if (dataOffset >= view.byteLength) return null;
  }

  try {
    switch (type) {
      case 1: // BYTE
      case 7: // UNDEFINED
        if (count === 1) return view.getUint8(dataOffset);
        {
          const arr = [];
          for (let i = 0; i < count && dataOffset + i < view.byteLength; i++) {
            arr.push(view.getUint8(dataOffset + i));
          }
          return arr;
        }

      case 2: { // ASCII
        let str = '';
        for (let i = 0; i < count && dataOffset + i < view.byteLength; i++) {
          const charCode = view.getUint8(dataOffset + i);
          if (charCode === 0) break; // Terminação nula
          str += String.fromCharCode(charCode);
        }
        return str.trim();
      }

      case 3: // SHORT
        if (count === 1) return view.getUint16(dataOffset, littleEndian);
        {
          const arr = [];
          for (let i = 0; i < count; i++) {
            arr.push(view.getUint16(dataOffset + i * 2, littleEndian));
          }
          return arr;
        }

      case 4: // LONG
        if (count === 1) return view.getUint32(dataOffset, littleEndian);
        {
          const arr = [];
          for (let i = 0; i < count; i++) {
            arr.push(view.getUint32(dataOffset + i * 4, littleEndian));
          }
          return arr;
        }

      case 5: { // RATIONAL
        if (count === 1) {
          const num = view.getUint32(dataOffset, littleEndian);
          const den = view.getUint32(dataOffset + 4, littleEndian);
          return den === 0 ? 0 : num / den;
        }
        const arr = [];
        for (let i = 0; i < count; i++) {
          const num = view.getUint32(dataOffset + i * 8, littleEndian);
          const den = view.getUint32(dataOffset + i * 8 + 4, littleEndian);
          arr.push(den === 0 ? 0 : num / den);
        }
        return arr;
      }

      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Converte formato padrão EXIF 'YYYY:MM:DD HH:MM:SS' para Date
 */
export function parseExifDate(str) {
  if (!str || typeof str !== 'string') return null;
  const match = str.match(/^(\d{4})[:\-](\d{2})[:\-](\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return null;

  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10) - 1;
  const d = parseInt(match[3], 10);
  const hh = parseInt(match[4], 10);
  const mm = parseInt(match[5], 10);
  const ss = parseInt(match[6], 10);

  const date = new Date(y, m, d, hh, mm, ss);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Converte GPSDateStamp ('YYYY:MM:DD') e GPSTimeStamp ([h, m, s]) para Date
 */
function parseExifGpsDate(dateStr, timeVals) {
  if (!dateStr) return null;
  const parts = dateStr.split(/[:\-]/);
  if (parts.length < 3) return null;

  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);

  let hh = 0, mm = 0, ss = 0;
  if (timeVals && timeVals.length >= 3) {
    hh = Math.floor(timeVals[0]);
    mm = Math.floor(timeVals[1]);
    ss = Math.floor(timeVals[2]);
  }

  const date = new Date(Date.UTC(y, m, d, hh, mm, ss));
  return isNaN(date.getTime()) ? null : date;
}
