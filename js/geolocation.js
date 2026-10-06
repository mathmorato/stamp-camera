/**
 * STAMP-CAMERA - Módulo de Geolocalização e Conversão de Coordenadas
 * Suporta formatos: Decimal Cardinal, DMS, DDM, Decimal Puro e Customizado.
 * Validação rigorosa e 100% Client-side.
 */

import { COORD_FORMATS } from './config.js';

/**
 * Converte graus decimais para DMS (Graus, Minutos e Segundos)
 * @param {number} deg - Graus decimais
 * @param {boolean} isLat - Verdadeiro se for latitude, falso para longitude
 * @returns {string} Ex: 15°52'11.89"S
 */
export function toDms(deg, isLat) {
  if (deg === null || deg === undefined || isNaN(deg)) return '';
  const dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  const absDeg = Math.abs(deg);
  const d = Math.floor(absDeg);
  const minFloat = (absDeg - d) * 60;
  const m = Math.floor(minFloat);
  const s = ((minFloat - m) * 60).toFixed(2);
  const sPadded = s < 10 ? `0${s}` : s;
  const mPadded = m < 10 ? `0${m}` : m;
  return `${d}°${mPadded}'${sPadded}"${dir}`;
}

/**
 * Converte graus decimais para DDM (Graus e Minutos Decimais)
 * @param {number} deg - Graus decimais
 * @param {boolean} isLat - Verdadeiro se for latitude
 * @returns {string} Ex: 15°52.198'S
 */
export function toDdm(deg, isLat) {
  if (deg === null || deg === undefined || isNaN(deg)) return '';
  const dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  const absDeg = Math.abs(deg);
  const d = Math.floor(absDeg);
  const minFloat = ((absDeg - d) * 60).toFixed(3);
  const minPadded = minFloat < 10 ? `0${minFloat}` : minFloat;
  return `${d}°${minPadded}'${dir}`;
}

/**
 * Converte para Decimal com indicação Cardinal
 * @param {number} lat
 * @param {number} lon
 * @param {number} precision
 * @returns {string} Ex: 15.869969° S, 50.852275° W
 */
export function toDecimalCardinal(lat, lon, precision = 6) {
  if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) return '';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  const absLat = Math.abs(lat).toFixed(precision);
  const absLon = Math.abs(lon).toFixed(precision);
  return `${absLat}° ${latDir}, ${absLon}° ${lonDir}`;
}

/**
 * Converte para formato Decimal com sinal explícito
 * @param {number} lat
 * @param {number} lon
 * @param {number} precision
 * @returns {string} Ex: Lat: -15.86996936, Long: -50.85227460
 */
export function toDecimalSigned(lat, lon, precision = 8) {
  if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) return '';
  const latStr = lat.toFixed(precision);
  const lonStr = lon.toFixed(precision);
  return `Lat: ${latStr}, Long: ${lonStr}`;
}

/**
 * Formata coordenadas conforme a configuração selecionada
 * @param {number|null} lat
 * @param {number|null} lon
 * @param {string} formatType
 * @param {string} customTemplate
 * @param {number|null} altitude
 * @returns {string}
 */
export function formatCoordinates(lat, lon, formatType = COORD_FORMATS.DECIMAL_CARDINAL, customTemplate = '', altitude = null) {
  if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
    return '';
  }

  switch (formatType) {
    case COORD_FORMATS.DECIMAL_CARDINAL:
      return toDecimalCardinal(lat, lon);

    case COORD_FORMATS.DMS:
      return `${toDms(lat, true)}, ${toDms(lon, false)}`;

    case COORD_FORMATS.DDM:
      return `${toDdm(lat, true)}, ${toDdm(lon, false)}`;

    case COORD_FORMATS.DECIMAL_SIGNED:
      return toDecimalSigned(lat, lon);

    case COORD_FORMATS.CUSTOM: {
      if (!customTemplate) return toDecimalCardinal(lat, lon);
      return customTemplate
        .replace(/{lat}/g, lat.toFixed(6))
        .replace(/{lon}/g, lon.toFixed(6))
        .replace(/{lat_dec}/g, lat.toString())
        .replace(/{lon_dec}/g, lon.toString())
        .replace(/{lat_dms}/g, toDms(lat, true))
        .replace(/{lon_dms}/g, toDms(lon, false))
        .replace(/{lat_ddm}/g, toDdm(lat, true))
        .replace(/{lon_ddm}/g, toDdm(lon, false))
        .replace(/{alt}/g, altitude !== null ? `${altitude.toFixed(1)}m` : '');
    }

    default:
      return toDecimalCardinal(lat, lon);
  }
}

/**
 * Valida se um par de coordenadas é válido
 * @param {number} lat
 * @param {number} lon
 * @returns {boolean}
 */
export function isValidCoordinate(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return false;
  if (isNaN(lat) || isNaN(lon)) return false;
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Tenta fazer o parse de uma string de coordenadas inserida pelo usuário
 * Aceita:
 * - "-15.869969, -50.852275"
 * - "15°52'11.89\"S, 50°51'08.19\"W"
 * @param {string} str
 * @returns {{lat: number, lon: number}|null}
 */
export function parseCoordinateString(str) {
  if (!str || typeof str !== 'string') return null;
  const clean = str.trim();

  // Caso 1: Dois números decimais separados por vírgula ou espaço
  const decMatch = clean.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
  if (decMatch) {
    const lat = parseFloat(decMatch[1]);
    const lon = parseFloat(decMatch[2]);
    if (isValidCoordinate(lat, lon)) return { lat, lon };
  }

  // Caso 2: Notação com DMS (graus, minutos, segundos com N/S/E/W)
  const dmsRegex = /(\d+)[°\s]+(\d+)['\s]+(\d+(?:\.\d+)?)"?\s*([NSEW])/gi;
  const matches = [...clean.matchAll(dmsRegex)];
  if (matches.length === 2) {
    let lat = null;
    let lon = null;
    for (const m of matches) {
      const deg = parseFloat(m[1]) + parseFloat(m[2]) / 60 + parseFloat(m[3]) / 3600;
      const dir = m[4].toUpperCase();
      if (dir === 'N' || dir === 'S') {
        lat = dir === 'S' ? -deg : deg;
      } else if (dir === 'E' || dir === 'W') {
        lon = dir === 'W' ? -deg : deg;
      }
    }
    if (lat !== null && lon !== null && isValidCoordinate(lat, lon)) {
      return { lat, lon };
    }
  }

  return null;
}
