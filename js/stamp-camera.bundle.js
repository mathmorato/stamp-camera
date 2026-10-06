/**
 * STAMP-CAMERA v1.0.2 - Pacote Autônomo 100% Client-Side
 * Funciona nativamente tanto em servidores HTTP quanto no protocolo file:///
 */
(function() {
  'use strict';

  // --- Início de js/config.js ---
  /**
   * STAMP-CAMERA - Configurações Gerais e Constantes
   * Versão: 1.0.0
   * 100% Client-side - Nenhuma informação é enviada para servidores externos.
   */
  const PNITE_VERSION = "v.1.0.6";
  const APP_CONFIG = {
    name: 'STAMP-CAMERA',
    subtitle: 'Carimbo técnico e geográfico para fotografias',
    version: PNITE_VERSION,
    defaultLanguage: 'pt-BR',
    supportedLanguages: ['pt-BR', 'en', 'es'],
    defaultTheme: 'dark',
  };
  const COORD_FORMATS = {
    DECIMAL_CARDINAL: 'decimal_cardinal', // 15.869969° S, 50.852275° W
    DMS: 'dms',                           // 15°52'11.89"S, 50°51'08.19"W
    DDM: 'ddm',                           // 15°52.198'S, 50°51.136'W
    DECIMAL_SIGNED: 'decimal_signed',     // Lat: -15.86996936, Long: -50.85227460
    CUSTOM: 'custom'                      // Formato customizável
  };
  const DATE_FORMATS = {
    BR: 'pt-BR',                          // 22/11/2022
    ISO: 'iso',                           // 2022-11-22
    TEXTUAL: 'textual'                    // 22 de novembro de 2022
  };
  const TIME_FORMATS = {
    FULL: 'full',                         // 18:05:43
    NO_SECONDS: 'no_seconds',             // 18:05
    DATE_TIME: 'date_time'                // 22/11/2022 18:05:43
  };
  const STAMP_POSITIONS = {
    TOP_LEFT: 'top-left',
    TOP_CENTER: 'top-center',
    TOP_RIGHT: 'top-right',
    CENTER_LEFT: 'center-left',
    CENTER: 'center',
    CENTER_RIGHT: 'center-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_CENTER: 'bottom-center',
    BOTTOM_RIGHT: 'bottom-right',
    CUSTOM: 'custom'
  };
  const LABEL_MODES = {
    ICONS: 'icons',      // Somente ícones inline (ex: 📍 -15.8699, 📅 22/11/2022)
    TEXT: 'text',        // Rótulos de texto (ex: Coordenadas: -15.8699, Data: 22/11/2022)
    NONE: 'none'         // Sem rótulos ou ícones (apenas os valores)
  };
  const STAMP_LAYOUTS = {
    MULTILINE: 'multiline',      // Múltiplas linhas (ícone + valor por linha)
    SINGLE_LINE: 'single_line'   // Linha única inline contínua separada por ' • '
  };
  const LINE_ART_PATHS = {
    photo_id: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    date: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M16 2v4 M8 2v4 M3 10h18',
    time: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2',
    datetime: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M16 2v4 M8 2v4 M3 10h18 M12 14v3l2 1',
    coordinates: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    lat: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    lon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    altitude: 'M8 3l4 8 5-5 5 15H2L8 3z M8 13l2 3 M14 12l2 2',
    street: 'M4 19L8 5 M20 19L16 5 M12 5v3 M12 11v3 M12 17v3',
    number: 'M4 9h16 M4 15h16 M10 3L8 21 M16 3l-2 21',
    address_street_num: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    neighborhood: 'M2 20h20 M4 20V8l6-4v16 M10 20V10l6-4v14 M16 20V6l4-2v16',
    locality: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    city: 'M2 20h20 M3 20V10h5v10 M8 20V4h8v16 M16 20v-8h5v8',
    state: 'M1 6v14l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v14 M16 6v14',
    country: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 0 20 M12 2a15.3 15.3 0 0 0 0 20',
    city_state_country: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    postal_code: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6',
    project_name: 'M2 22h20 M12 2v20 M12 5H6l-4 7h10 M12 5h6l4 7H12',
    process: 'M12 3v18 M5 6h14 M2 13l3-7 3 7a3 3 0 0 1-6 0z M16 13l3-7 3 7a3 3 0 0 1-6 0z',
    report_num: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z M9 12h6 M9 16h4',
    responsible: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    custom_text: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
    default: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'
  };
  const EMOJI_TO_LINE_ART = {
    '📷': 'photo_id',
    '📅': 'date',
    '🕒': 'time',
    '⏰': 'time',
    '📍': 'coordinates',
    '🌐': 'lat',
    '⛰️': 'altitude',
    '🏔️': 'altitude',
    '🛣️': 'street',
    '🔢': 'number',
    '🏠': 'address_street_num',
    '🏘️': 'neighborhood',
    '📌': 'locality',
    '🏙️': 'city',
    '🗺️': 'state',
    '🌍': 'country',
    '📮': 'postal_code',
    '🏗️': 'project_name',
    '⚖️': 'process',
    '📋': 'report_num',
    '👤': 'responsible',
    '📝': 'custom_text'
  };
  function getLineArtPath(iconOrFieldId) {
    if (!iconOrFieldId) return LINE_ART_PATHS.default;
    if (LINE_ART_PATHS[iconOrFieldId]) return LINE_ART_PATHS[iconOrFieldId];
    if (EMOJI_TO_LINE_ART[iconOrFieldId]) return LINE_ART_PATHS[EMOJI_TO_LINE_ART[iconOrFieldId]];
    return LINE_ART_PATHS.default;
  }
  function getLineArtSvg(iconOrFieldId, className = 'svg-icon-sm') {
    const pathD = getLineArtPath(iconOrFieldId);
    return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="${pathD}"/></svg>`;
  }
  const FIELD_ICONS = {
    photo_id: 'photo_id',
    date: 'date',
    time: 'time',
    datetime: 'datetime',
    coordinates: 'coordinates',
    lat: 'lat',
    lon: 'lon',
    altitude: 'altitude',
    street: 'street',
    number: 'number',
    address_street_num: 'address_street_num',
    neighborhood: 'neighborhood',
    locality: 'locality',
    city: 'city',
    state: 'state',
    country: 'country',
    city_state_country: 'city_state_country',
    postal_code: 'postal_code',
    project_name: 'project_name',
    process: 'process',
    report_num: 'report_num',
    responsible: 'responsible',
    custom_text: 'custom_text'
  };
  const DEFAULT_STAMP_SETTINGS = {
    position: STAMP_POSITIONS.BOTTOM_LEFT,
    marginPercentX: 2.5,
    marginPercentY: 2.5,
    customPosX: null, // em percentual da imagem (0 a 100)
    customPosY: null,
    fontFamily: 'Inter',
    fontSize: 22,             // Tamanho base em px (calculado em proporção na imagem)
    fontSizeScale: 1.0,       // Fator multiplicador
    lineHeight: 1.35,
    letterSpacing: 0.5,
    fontWeight: '600',
    isItalic: false,
    textColor: '#FFFFFF',
    backgroundColor: '#0F172A',
    backgroundOpacity: 85,    // 0 a 100
    backgroundType: 'semitransparent', // 'none', 'solid', 'semitransparent'
    borderWidth: 0,           // 0, 1, 2, 4
    borderColor: '#3B82F6',
    borderRadius: 8,
    hasShadow: true,
    textAlign: 'left',        // 'left', 'center', 'right'
    padding: 16,
    coordFormat: COORD_FORMATS.DECIMAL_CARDINAL,
    dateFormat: DATE_FORMATS.BR,
    timeFormat: TIME_FORMATS.FULL,
    customCoordTemplate: '{lat}, {lon}',
    labelMode: LABEL_MODES.ICONS,          // Padrão: Somente ícones inline!
    inlineLayout: STAMP_LAYOUTS.MULTILINE,  // 'multiline' ou 'single_line'
    inlineSeparator: ' • '
  };
  const DEFAULT_NUMBERING = {
    enabled: false,
    prefix: 'FOTOGRAFIA ',
    suffix: '',
    startNumber: 1,
    digits: 2
  };
  
  // --- Fim de js/config.js ---

  // --- Início de js/geolocation.js ---
  /**
   * STAMP-CAMERA - Módulo de Geolocalização e Conversão de Coordenadas
   * Suporta formatos: Decimal Cardinal, DMS, DDM, Decimal Puro e Customizado.
   * Validação rigorosa e 100% Client-side.
   */
  
  
  
  /**
   * Converte graus decimais para DMS (Graus, Minutos e Segundos)
   * @param {number} deg - Graus decimais
   * @param {boolean} isLat - Verdadeiro se for latitude, falso para longitude
   * @returns {string} Ex: 15°52'11.89"S
   */
  function toDms(deg, isLat) {
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
  function toDdm(deg, isLat) {
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
  function toDecimalCardinal(lat, lon, precision = 6) {
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
  function toDecimalSigned(lat, lon, precision = 8) {
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
  function formatCoordinates(lat, lon, formatType = COORD_FORMATS.DECIMAL_CARDINAL, customTemplate = '', altitude = null) {
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
  function isValidCoordinate(lat, lon) {
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
  function parseCoordinateString(str) {
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
  
  // --- Fim de js/geolocation.js ---

  // --- Início de js/exif-reader.js ---
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
  async function readExifData(fileOrBuffer) {
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
  function parseExifDate(str) {
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
  
  // --- Fim de js/exif-reader.js ---

  // --- Início de js/image-loader.js ---
  /**
   * STAMP-CAMERA - Carregador e Normalizador de Imagens
   * Processa arquivos de imagem, corrige orientação EXIF e gera canvas de alta resolução.
   * 100% Client-side.
   */
  
  
  
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
  async function loadImageFromFile(file) {
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
  function applyExifOrientation(img, orientation = 1) {
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
  async function createDemoImage(type = 'with_gps') {
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
  
  // --- Fim de js/image-loader.js ---

  // --- Início de js/templates.js ---
  /**
   * STAMP-CAMERA - Modelos e Presets Pré-configurados
   * Implementa Modelos 1 a 5 e Presets de Perícia, Obra, Fiscalização, etc.
   * Contém a lista completa dos campos padrão conforme as regras da diretriz.
   */
  const BUILT_IN_MODELS = [
    {
      id: 'model_1_simple',
      name: 'Modelo 1 - Simples (Ícones)',
      description: 'Data, hora e coordenadas com ícones inline modernos.',
      position: STAMP_POSITIONS.BOTTOM_LEFT,
      backgroundType: 'semitransparent',
      backgroundColor: '#0F172A',
      backgroundOpacity: 85,
      textColor: '#FFFFFF',
      borderWidth: 0,
      borderRadius: 8,
      hasShadow: true,
      fontFamily: 'Inter',
      fontSize: 20,
      fontSizeScale: 1.0,
      textAlign: 'left',
      coordFormat: COORD_FORMATS.DECIMAL_CARDINAL,
      dateFormat: DATE_FORMATS.BR,
      timeFormat: TIME_FORMATS.FULL,
      labelMode: LABEL_MODES.ICONS,
      inlineLayout: STAMP_LAYOUTS.MULTILINE,
      fields: [
        { id: 'date', label: 'Data', enabled: true, showLabel: true },
        { id: 'time', label: 'Hora', enabled: true, showLabel: true },
        { id: 'lat', label: 'Lat', enabled: true, showLabel: true },
        { id: 'lon', label: 'Long', enabled: true, showLabel: true }
      ]
    },
    {
      id: 'model_2_location',
      name: 'Modelo 2 - Localização',
      description: 'Data/Hora combinadas, endereço completo e coordenadas geográficas.',
      position: STAMP_POSITIONS.BOTTOM_LEFT,
      backgroundType: 'semitransparent',
      backgroundColor: '#0F172A',
      backgroundOpacity: 90,
      textColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#3B82F6',
      borderRadius: 8,
      hasShadow: true,
      fontFamily: 'Inter',
      fontSize: 20,
      fontSizeScale: 1.0,
      textAlign: 'left',
      coordFormat: COORD_FORMATS.DECIMAL_CARDINAL,
      dateFormat: DATE_FORMATS.BR,
      timeFormat: TIME_FORMATS.DATE_TIME,
      labelMode: LABEL_MODES.ICONS,
      inlineLayout: STAMP_LAYOUTS.MULTILINE,
      fields: [
        { id: 'datetime', label: 'Data e Hora', enabled: true, showLabel: false },
        { id: 'address_street_num', label: 'Endereço', enabled: true, showLabel: false },
        { id: 'neighborhood', label: 'Bairro', enabled: true, showLabel: false },
        { id: 'city_state_country', label: 'Localidade', enabled: true, showLabel: false },
        { id: 'coordinates', label: 'Coordenadas', enabled: true, showLabel: false }
      ]
    },
    {
      id: 'model_3_technical',
      name: 'Modelo 3 - Técnico',
      description: 'Formato clássico com rótulos em caixa alta para laudos e vistorias.',
      position: STAMP_POSITIONS.BOTTOM_LEFT,
      backgroundType: 'semitransparent',
      backgroundColor: '#000000',
      backgroundOpacity: 85,
      textColor: '#F8FAFC',
      borderWidth: 2,
      borderColor: '#2563EB',
      borderRadius: 6,
      hasShadow: true,
      fontFamily: 'Inter',
      fontSize: 21,
      fontSizeScale: 1.0,
      textAlign: 'left',
      coordFormat: COORD_FORMATS.DECIMAL_SIGNED,
      dateFormat: DATE_FORMATS.BR,
      timeFormat: TIME_FORMATS.FULL,
      labelMode: LABEL_MODES.TEXT,
      inlineLayout: STAMP_LAYOUTS.MULTILINE,
      fields: [
        { id: 'date', label: 'DATA', enabled: true, showLabel: true },
        { id: 'time', label: 'HORA', enabled: true, showLabel: true },
        { id: 'locality', label: 'LOCAL', enabled: true, showLabel: true },
        { id: 'coordinates', label: 'COORDENADAS', enabled: true, showLabel: true }
      ]
    },
    {
      id: 'model_4_forensic',
      name: 'Modelo 4 - Fotografia Pericial',
      description: 'Identificação pericial com número de fotografia, processo e responsável.',
      position: STAMP_POSITIONS.BOTTOM_LEFT,
      backgroundType: 'semitransparent',
      backgroundColor: '#0F172A',
      backgroundOpacity: 90,
      textColor: '#FFFFFF',
      borderWidth: 2,
      borderColor: '#E2E8F0',
      borderRadius: 6,
      hasShadow: true,
      fontFamily: 'Inter',
      fontSize: 21,
      fontSizeScale: 1.0,
      textAlign: 'left',
      coordFormat: COORD_FORMATS.DMS,
      dateFormat: DATE_FORMATS.BR,
      timeFormat: TIME_FORMATS.FULL,
      labelMode: LABEL_MODES.TEXT,
      inlineLayout: STAMP_LAYOUTS.MULTILINE,
      fields: [
        { id: 'photo_id', label: 'FOTOGRAFIA Nº', enabled: true, showLabel: true, defaultValue: '01' },
        { id: 'date', label: 'DATA', enabled: true, showLabel: true },
        { id: 'time', label: 'HORA', enabled: true, showLabel: true },
        { id: 'locality', label: 'LOCAL', enabled: true, showLabel: true },
        { id: 'coordinates', label: 'COORDENADAS', enabled: true, showLabel: true },
        { id: 'process', label: 'PROCESSO', enabled: true, showLabel: true, defaultValue: '5557293-56.2020.8.09.0097' },
        { id: 'responsible', label: 'PERITO RESPONSÁVEL', enabled: true, showLabel: true, defaultValue: 'Eng. Perito' }
      ]
    },
    {
      id: 'model_5_custom',
      name: 'Modelo 5 - Personalizado',
      description: 'Configuração flexível com todos os campos disponíveis para seleção.',
      position: STAMP_POSITIONS.BOTTOM_RIGHT,
      backgroundType: 'semitransparent',
      backgroundColor: '#0F172A',
      backgroundOpacity: 80,
      textColor: '#FFFFFF',
      borderWidth: 0,
      borderRadius: 8,
      hasShadow: true,
      fontFamily: 'Inter',
      fontSize: 20,
      fontSizeScale: 1.0,
      textAlign: 'left',
      coordFormat: COORD_FORMATS.DECIMAL_CARDINAL,
      dateFormat: DATE_FORMATS.BR,
      timeFormat: TIME_FORMATS.FULL,
      labelMode: LABEL_MODES.ICONS,
      inlineLayout: STAMP_LAYOUTS.MULTILINE,
      fields: [
        { id: 'datetime', label: 'Data e Hora', enabled: true, showLabel: false },
        { id: 'coordinates', label: 'Coordenadas', enabled: true, showLabel: true },
        { id: 'locality', label: 'Local', enabled: true, showLabel: true },
        { id: 'altitude', label: 'Altitude', enabled: false, showLabel: true },
        { id: 'project_name', label: 'Obra', enabled: false, showLabel: true, defaultValue: 'Residência Jussara' },
        { id: 'custom_text', label: 'Observação', enabled: false, showLabel: false, defaultValue: 'Inspeção de rotina' }
      ]
    },
    {
      id: 'model_6_inline_banner',
      name: 'Modelo 6 - Faixa Inline com Ícones',
      description: 'Linha única contínua com ícones inline (📍 📅 🕒 🏙️) em formato compacto.',
      position: STAMP_POSITIONS.BOTTOM_CENTER,
      backgroundType: 'semitransparent',
      backgroundColor: '#0F172A',
      backgroundOpacity: 85,
      textColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#3B82F6',
      borderRadius: 8,
      hasShadow: true,
      fontFamily: 'Inter',
      fontSize: 18,
      fontSizeScale: 1.0,
      textAlign: 'center',
      coordFormat: COORD_FORMATS.DECIMAL_CARDINAL,
      dateFormat: DATE_FORMATS.BR,
      timeFormat: TIME_FORMATS.DATE_TIME,
      labelMode: LABEL_MODES.ICONS,
      inlineLayout: STAMP_LAYOUTS.SINGLE_LINE,
      fields: [
        { id: 'datetime', label: 'Data e Hora', enabled: true, showLabel: false },
        { id: 'coordinates', label: 'Coordenadas', enabled: true, showLabel: false },
        { id: 'city_state_country', label: 'Localidade', enabled: true, showLabel: false }
      ]
    }
  ];
  const PRESET_CATEGORIES = [
    {
      id: 'preset_pericia',
      name: 'Perícia Judicial / Técnica',
      baseModelId: 'model_4_forensic'
    },
    {
      id: 'preset_obra',
      name: 'Obra & Construção Civil',
      baseModelId: 'model_3_technical',
      enabledFields: ['project_name', 'responsible', 'date', 'time', 'locality', 'coordinates'],
      fieldDefaults: {
        project_name: 'Residência Jussara',
        responsible: 'Engenheiro Civil'
      }
    },
    {
      id: 'preset_inspecao',
      name: 'Inspeção Predial',
      baseModelId: 'model_2_location',
      enabledFields: ['custom_text', 'datetime', 'address_street_num', 'neighborhood', 'city_state_country', 'coordinates'],
      fieldDefaults: {
        custom_text: 'Vistoria Estrutural'
      }
    },
    {
      id: 'preset_fiscalizacao',
      name: 'Fiscalização Ambiental / Urbana',
      baseModelId: 'model_3_technical',
      enabledFields: ['report_num', 'date', 'time', 'locality', 'coordinates'],
      fieldDefaults: {
        report_num: 'AI-2026/049'
      }
    },
    {
      id: 'preset_registro',
      name: 'Registro Fotográfico',
      baseModelId: 'model_1_simple',
      enabledFields: ['photo_id', 'date', 'time', 'coordinates']
    },
    {
      id: 'preset_vistoria',
      name: 'Vistoria Imobiliária',
      baseModelId: 'model_2_location',
      enabledFields: ['datetime', 'address_street_num', 'neighborhood', 'city_state_country', 'coordinates']
    },
    {
      id: 'preset_pessoal',
      name: 'Uso Pessoal / Viagem',
      baseModelId: 'model_1_simple',
      enabledFields: ['date', 'time', 'locality', 'coordinates']
    }
  ];
  
  /**
   * Lista completa de todos os campos padrão suportados pela diretriz (Seção 10)
   */
  const STANDARD_FIELD_DEFS = [
    { id: 'photo_id', name: 'Identificação da Fotografia', category: 'general', defaultLabel: 'FOTO', placeholder: 'Ex: FOTOGRAFIA 01' },
    { id: 'date', name: 'Data', category: 'datetime', defaultLabel: 'Data', placeholder: 'Ex: 22/11/2022' },
    { id: 'time', name: 'Hora', category: 'datetime', defaultLabel: 'Hora', placeholder: 'Ex: 18:05:43' },
    { id: 'datetime', name: 'Data e Hora combinadas', category: 'datetime', defaultLabel: 'Data/Hora', placeholder: 'Ex: 22/11/2022 18:05:43' },
    { id: 'coordinates', name: 'Coordenadas (Lat/Long)', category: 'location', defaultLabel: 'Coordenadas', placeholder: 'Ex: 15.869969° S, 50.852275° W' },
    { id: 'lat', name: 'Latitude', category: 'location', defaultLabel: 'Lat', placeholder: 'Ex: 15.869969° S' },
    { id: 'lon', name: 'Longitude', category: 'location', defaultLabel: 'Long', placeholder: 'Ex: 50.852275° W' },
    { id: 'altitude', name: 'Altitude', category: 'location', defaultLabel: 'Altitude', placeholder: 'Ex: 312.5 m' },
    { id: 'street', name: 'Rua / Logradouro', category: 'location', defaultLabel: 'Rua', placeholder: 'Ex: Av. José Vicente' },
    { id: 'number', name: 'Número', category: 'location', defaultLabel: 'Nº', placeholder: 'Ex: 100' },
    { id: 'address_street_num', name: 'Rua e Número combinados', category: 'location', defaultLabel: 'Endereço', placeholder: 'Ex: Av. José Vicente, nº 100' },
    { id: 'neighborhood', name: 'Bairro', category: 'location', defaultLabel: 'Bairro', placeholder: 'Ex: Setor Central' },
    { id: 'locality', name: 'Local / Referência', category: 'location', defaultLabel: 'Local', placeholder: 'Ex: Jussara, GO' },
    { id: 'city', name: 'Cidade / Município', category: 'location', defaultLabel: 'Cidade', placeholder: 'Ex: Jussara' },
    { id: 'state', name: 'Estado / UF', category: 'location', defaultLabel: 'Estado', placeholder: 'Ex: Goiás' },
    { id: 'country', name: 'País', category: 'location', defaultLabel: 'País', placeholder: 'Ex: Brasil' },
    { id: 'city_state_country', name: 'Cidade, Estado, País', category: 'location', defaultLabel: 'Localidade', placeholder: 'Ex: Jussara, Goiás, Brasil' },
    { id: 'postal_code', name: 'CEP', category: 'location', defaultLabel: 'CEP', placeholder: 'Ex: 76270-000' },
    { id: 'project_name', name: 'Nome da Obra / Projeto', category: 'technical', defaultLabel: 'Obra', placeholder: 'Ex: Residência Jussara' },
    { id: 'process', name: 'Processo Judicial / Administrativo', category: 'technical', defaultLabel: 'Processo', placeholder: 'Ex: 5557293-56.2020.8.09.0097' },
    { id: 'report_num', name: 'Relatório / Laudo nº', category: 'technical', defaultLabel: 'Relatório', placeholder: 'Ex: Laudo 04/2022' },
    { id: 'responsible', name: 'Responsável Técnico / Perito', category: 'technical', defaultLabel: 'Responsável', placeholder: 'Ex: Eng. Perito Especialista' },
    { id: 'custom_text', name: 'Texto Personalizado', category: 'custom', defaultLabel: 'Observações', placeholder: 'Ex: Vistoria técnica' }
  ];
  
  // --- Fim de js/templates.js ---

  // --- Início de js/storage.js ---
  /**
   * STAMP-CAMERA - Gerenciamento de Armazenamento Local (localStorage)
   * 100% Client-side. Não envia dados para a nuvem.
   */
  
  const STORAGE_KEYS = {
    SETTINGS: 'stamp_camera_settings_v1',
    THEME: 'stamp_camera_theme',
    CUSTOM_PRESETS: 'stamp_camera_custom_presets_v1',
    LANGUAGE: 'stamp_camera_lang',
    RECENT_CONFIG: 'stamp_camera_recent_config'
  };
  const storage = {
    getTheme() {
      try {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
      } catch {
        return 'dark';
      }
    },
  
    setTheme(theme) {
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
      } catch (e) {
        console.warn('Erro ao salvar tema:', e);
      }
    },
  
    getLanguage() {
      try {
        return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'pt-BR';
      } catch {
        return 'pt-BR';
      }
    },
  
    setLanguage(lang) {
      try {
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      } catch (e) {
        console.warn('Erro ao salvar idioma:', e);
      }
    },
  
    getSettings() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    },
  
    saveSettings(settings) {
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      } catch (e) {
        console.warn('Erro ao salvar configurações:', e);
      }
    },
  
    getCustomPresets() {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRESETS);
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    },
  
    saveCustomPreset(preset) {
      try {
        const presets = this.getCustomPresets();
        const existingIdx = presets.findIndex(p => p.id === preset.id);
        if (existingIdx >= 0) {
          presets[existingIdx] = preset;
        } else {
          presets.push(preset);
        }
        localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(presets));
        return true;
      } catch (e) {
        console.warn('Erro ao salvar preset:', e);
        return false;
      }
    },
  
    deleteCustomPreset(presetId) {
      try {
        let presets = this.getCustomPresets();
        presets = presets.filter(p => p.id !== presetId);
        localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(presets));
        return true;
      } catch {
        return false;
      }
    }
  };
  
  // --- Fim de js/storage.js ---

  // --- Início de js/stamp-engine.js ---
  /**
   * STAMP-CAMERA - Stamp Engine (Motor de Renderização do Carimbo)
   * Motor Canvas 2D independente da interface.
   * Calcula posições, formata textos, desenha caixas com cantos arredondados,
   * sombras, bordas e renderiza tanto para preview interativo quanto para exportação 1:1.
   */
  
  
  
  function resolveIconKey(id, icon) {
    if (icon && LINE_ART_PATHS[icon]) return icon;
    if (icon && EMOJI_TO_LINE_ART[icon]) return EMOJI_TO_LINE_ART[icon];
    if (id && LINE_ART_PATHS[id]) return id;
    return 'default';
  }
  class StampEngine {
    constructor() {
      this.lastBounds = null; // Guarda os limites do carimbo no último render (para drag-and-drop)
    }
  
    /**
     * Renderiza a imagem e o carimbo em um canvas de destino
     * @param {HTMLCanvasElement} targetCanvas - Canvas onde será desenhado
     * @param {HTMLCanvasElement|HTMLImageElement} sourceImage - Imagem base
     * @param {Array<{label: string, value: string, showLabel: boolean, isCustom: boolean}>} lines - Linhas do carimbo
     * @param {Object} settings - Configurações visuais do carimbo
     * @param {boolean} isExport - Se for verdadeiro, renderiza com resolução nativa máxima
     * @returns {{x: number, y: number, width: number, height: number}} Dimensões do carimbo renderizado
     */
    render(targetCanvas, sourceImage, lines, settings, isExport = false) {
      if (!targetCanvas || !sourceImage) return null;
  
      const ctx = targetCanvas.getContext('2d');
      const imgWidth = sourceImage.width;
      const imgHeight = sourceImage.height;
  
      // Ajusta o tamanho do targetCanvas
      if (targetCanvas.width !== imgWidth || targetCanvas.height !== imgHeight) {
        targetCanvas.width = imgWidth;
        targetCanvas.height = imgHeight;
      }
  
      // 1. Desenha a fotografia original
      ctx.clearRect(0, 0, imgWidth, imgHeight);
      ctx.drawImage(sourceImage, 0, 0, imgWidth, imgHeight);
  
      // Se não houver linhas ativas, nada mais a desenhar
      const activeLines = lines.filter(l => l && (l.value !== '' && l.value !== null && l.value !== undefined));
      if (activeLines.length === 0) {
        this.lastBounds = null;
        return null;
      }
  
      // 2. Calcula tipografia e escalas baseadas nas dimensões da imagem
      const baseDimension = Math.min(imgWidth, imgHeight);
      const scaleFactor = baseDimension / 1080; // Normalizado para referência Full HD 1080p
  
      const fontSizePx = Math.max(14, Math.round((settings.fontSize || 22) * scaleFactor * (settings.fontSizeScale || 1.0)));
      const lineHeightPx = Math.round(fontSizePx * (settings.lineHeight || 1.35));
      const paddingPx = Math.max(8, Math.round((settings.padding || 16) * scaleFactor));
      const borderRadiusPx = Math.round((settings.borderRadius || 8) * scaleFactor);
      const borderWidthPx = Math.round((settings.borderWidth || 0) * scaleFactor);
  
      // Configuração de fonte no context para medição
      const fontStyle = settings.isItalic ? 'italic' : 'normal';
      const fontWeight = settings.fontWeight || '600';
      const fontFamily = settings.fontFamily || 'Inter, system-ui, sans-serif';
      const fontSpec = `${fontStyle} ${fontWeight} ${fontSizePx}px ${fontFamily}, "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
      ctx.font = fontSpec;
  
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = `${(settings.letterSpacing || 0.5) * scaleFactor}px`;
      }
  
      // 3. Formata e mede as linhas com suporte a ícones line art vetorizados e layouts
      const renderedRows = [];
      let maxContentWidth = 0;
  
      const labelMode = settings.labelMode || 'icons';
      const isSingleLine = settings.inlineLayout === 'single_line';
      const canUsePath2D = typeof Path2D !== 'undefined';
  
      if (isSingleLine) {
        // Modo linha única contínua com ícones line-art
        const segments = [];
        const separator = settings.inlineSeparator || '  •  ';
        const sepWidth = ctx.measureText(separator).width;
        let totalWidth = 0;
  
        for (let sIdx = 0; sIdx < activeLines.length; sIdx++) {
          const item = activeLines[sIdx];
          const valText = String(item.value || '').trim();
          if (!valText) continue;
  
          let iconKey = null;
          let text = valText;
  
          if (labelMode === 'icons') {
            iconKey = resolveIconKey(item.id, item.icon);
          } else if (labelMode === 'text') {
            if (item.showLabel && item.label) {
              text = `${item.label}: ${valText}`;
            }
          }
  
          const iconSize = iconKey ? Math.round(fontSizePx * 0.95) : 0;
          const iconGap = iconKey ? Math.round(fontSizePx * 0.45) : 0;
          const textWidth = ctx.measureText(text).width;
          const segWidth = (iconKey ? iconSize + iconGap : 0) + textWidth;
  
          segments.push({
            iconKey,
            text,
            iconSize,
            iconGap,
            textWidth,
            width: segWidth,
            isLast: false
          });
        }
  
        if (segments.length > 0) {
          segments[segments.length - 1].isLast = true;
          for (let s = 0; s < segments.length; s++) {
            totalWidth += segments[s].width;
            if (!segments[s].isLast) {
              totalWidth += sepWidth;
            }
          }
          maxContentWidth = totalWidth;
          renderedRows.push({
            isSingleLine: true,
            segments,
            separator,
            sepWidth,
            width: totalWidth
          });
        }
      } else {
        // Modo multilinhas com ícones line-art verticais
        for (const item of activeLines) {
          const valText = String(item.value || '').trim();
          if (!valText) continue;
  
          let iconKey = null;
          let displayText = valText;
  
          if (labelMode === 'icons') {
            iconKey = resolveIconKey(item.id, item.icon);
          } else if (labelMode === 'text') {
            if (item.showLabel && item.label) {
              displayText = `${item.label}: ${valText}`;
            }
          }
  
          // Suporte a quebra de linha interna dentro do valor
          const subLines = displayText.split('\n');
          for (let slIdx = 0; slIdx < subLines.length; slIdx++) {
            const sub = subLines[slIdx].trim();
            if (sub) {
              const rowIconKey = (slIdx === 0) ? iconKey : null;
              const iconSize = rowIconKey ? Math.round(fontSizePx * 0.95) : 0;
              const iconGap = rowIconKey ? Math.round(fontSizePx * 0.45) : 0;
              const textMetrics = ctx.measureText(sub);
              const w = (rowIconKey ? iconSize + iconGap : 0) + textMetrics.width;
              if (w > maxContentWidth) maxContentWidth = w;
              renderedRows.push({
                isSingleLine: false,
                iconKey: rowIconKey,
                text: sub,
                iconSize,
                iconGap,
                width: w
              });
            }
          }
        }
      }
  
      if (renderedRows.length === 0) {
        this.lastBounds = null;
        return null;
      }
  
      const boxWidth = Math.round(maxContentWidth + (paddingPx * 2));
      const boxHeight = Math.round((renderedRows.length * lineHeightPx) + (paddingPx * 2) - (lineHeightPx - fontSizePx) + 4);
  
      // 4. Calcula posicionamento (X, Y)
      const marginX = Math.round((imgWidth * (settings.marginPercentX || 2.5)) / 100);
      const marginY = Math.round((imgHeight * (settings.marginPercentY || 2.5)) / 100);
  
      let posX = marginX;
      let posY = imgHeight - boxHeight - marginY;
  
      // Se estiver em modo de posição livre personalizado (drag-and-drop)
      if (settings.position === STAMP_POSITIONS.CUSTOM && settings.customPosX !== null && settings.customPosY !== null) {
        posX = Math.round(settings.customPosX * imgWidth);
        posY = Math.round(settings.customPosY * imgHeight);
      } else {
        switch (settings.position) {
          case STAMP_POSITIONS.TOP_LEFT:
            posX = marginX;
            posY = marginY;
            break;
          case STAMP_POSITIONS.TOP_CENTER:
            posX = Math.round((imgWidth - boxWidth) / 2);
            posY = marginY;
            break;
          case STAMP_POSITIONS.TOP_RIGHT:
            posX = imgWidth - boxWidth - marginX;
            posY = marginY;
            break;
          case STAMP_POSITIONS.CENTER_LEFT:
            posX = marginX;
            posY = Math.round((imgHeight - boxHeight) / 2);
            break;
          case STAMP_POSITIONS.CENTER:
            posX = Math.round((imgWidth - boxWidth) / 2);
            posY = Math.round((imgHeight - boxHeight) / 2);
            break;
          case STAMP_POSITIONS.CENTER_RIGHT:
            posX = imgWidth - boxWidth - marginX;
            posY = Math.round((imgHeight - boxHeight) / 2);
            break;
          case STAMP_POSITIONS.BOTTOM_LEFT:
            posX = marginX;
            posY = imgHeight - boxHeight - marginY;
            break;
          case STAMP_POSITIONS.BOTTOM_CENTER:
            posX = Math.round((imgWidth - boxWidth) / 2);
            posY = imgHeight - boxHeight - marginY;
            break;
          case STAMP_POSITIONS.BOTTOM_RIGHT:
            posX = imgWidth - boxWidth - marginX;
            posY = imgHeight - boxHeight - marginY;
            break;
        }
      }
  
      // Trava para evitar que o carimbo saia completamente da tela
      posX = Math.max(0, Math.min(imgWidth - boxWidth, posX));
      posY = Math.max(0, Math.min(imgHeight - boxHeight, posY));
  
      // Salva os limites para cálculo de clique e arraste
      this.lastBounds = {
        x: posX,
        y: posY,
        width: boxWidth,
        height: boxHeight,
        canvasWidth: imgWidth,
        canvasHeight: imgHeight
      };
  
      // 5. Desenha o fundo da caixa (Background)
      ctx.save();
  
      if (settings.hasShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = Math.round(12 * scaleFactor);
        ctx.shadowOffsetX = Math.round(2 * scaleFactor);
        ctx.shadowOffsetY = Math.round(4 * scaleFactor);
      }
  
      if (settings.backgroundType !== 'none') {
        const opacity = settings.backgroundType === 'solid' ? 1.0 : (settings.backgroundOpacity || 85) / 100;
        ctx.fillStyle = hexToRgba(settings.backgroundColor || '#0F172A', opacity);
        drawRoundedRect(ctx, posX, posY, boxWidth, boxHeight, borderRadiusPx);
        ctx.fill();
  
        // Borda se configurada
        if (borderWidthPx > 0 && settings.borderColor) {
          ctx.shadowColor = 'transparent'; // Evita sombra dupla na borda
          ctx.lineWidth = borderWidthPx;
          ctx.strokeStyle = settings.borderColor;
          ctx.stroke();
        }
      }
  
      ctx.restore();
  
      // 6. Desenha os textos e ícones line-art com renderização precisa
      ctx.save();
      ctx.font = fontSpec;
      ctx.fillStyle = settings.textColor || '#FFFFFF';
  
      if (settings.hasShadow && settings.backgroundType === 'none') {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = Math.round(6 * scaleFactor);
        ctx.shadowOffsetX = Math.round(2 * scaleFactor);
        ctx.shadowOffsetY = Math.round(2 * scaleFactor);
      }
  
      let textStartY = posY + paddingPx + fontSizePx;
      const textAlign = settings.textAlign || 'left';
  
      for (let i = 0; i < renderedRows.length; i++) {
        const row = renderedRows[i];
        let rowX = posX + paddingPx;
  
        if (textAlign === 'center') {
          rowX = posX + (boxWidth / 2) - (row.width / 2);
        } else if (textAlign === 'right') {
          rowX = posX + boxWidth - paddingPx - row.width;
        }
  
        const rowY = textStartY + (i * lineHeightPx);
  
        if (row.isSingleLine && row.segments) {
          let curX = rowX;
          for (const seg of row.segments) {
            if (seg.iconKey && LINE_ART_PATHS[seg.iconKey] && canUsePath2D) {
              const iconSize = seg.iconSize;
              const iconScale = iconSize / 24;
              const iconY = rowY - fontSizePx + Math.round((fontSizePx - iconSize) / 2);
  
              ctx.save();
              ctx.translate(curX, iconY);
              ctx.scale(iconScale, iconScale);
              ctx.lineWidth = 1.75;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              ctx.strokeStyle = settings.textColor || '#FFFFFF';
              ctx.stroke(new Path2D(LINE_ART_PATHS[seg.iconKey]));
              ctx.restore();
  
              curX += iconSize + seg.iconGap;
            }
  
            ctx.fillText(seg.text, curX, rowY);
            curX += ctx.measureText(seg.text).width;
  
            if (!seg.isLast) {
              ctx.fillText(row.separator, curX, rowY);
              curX += row.sepWidth;
            }
          }
        } else {
          let curX = rowX;
          if (row.iconKey && LINE_ART_PATHS[row.iconKey] && canUsePath2D) {
            const iconSize = row.iconSize;
            const iconScale = iconSize / 24;
            const iconY = rowY - fontSizePx + Math.round((fontSizePx - iconSize) / 2);
  
            ctx.save();
            ctx.translate(curX, iconY);
            ctx.scale(iconScale, iconScale);
            ctx.lineWidth = 1.75;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = settings.textColor || '#FFFFFF';
            ctx.stroke(new Path2D(LINE_ART_PATHS[row.iconKey]));
            ctx.restore();
  
            curX += iconSize + row.iconGap;
          }
  
          ctx.fillText(row.text, curX, rowY);
        }
      }
  
      ctx.restore();
  
      return this.lastBounds;
    }
  
    /**
     * Verifica se uma coordenada (x, y) em espaço do canvas está dentro do carimbo
     * @param {number} canvasX
     * @param {number} canvasY
     * @returns {boolean}
     */
    isPointInsideStamp(canvasX, canvasY) {
      if (!this.lastBounds) return false;
      const { x, y, width, height } = this.lastBounds;
      return (
        canvasX >= x &&
        canvasX <= x + width &&
        canvasY >= y &&
        canvasY <= y + height
      );
    }
  }
  
  /**
   * Utilitário para desenhar retângulos com cantos arredondados
   */
  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, radius);
    } else {
      // Fallback para navegadores sem roundRect nativo
      const r = Math.min(radius, width / 2, height / 2);
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + r);
      ctx.lineTo(x + width, y + height - r);
      ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      ctx.lineTo(x + r, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
  }
  
  /**
   * Converte cor hex (#RRGGBB) para rgba(r, g, b, a)
   */
  function hexToRgba(hex, alpha = 1.0) {
    if (!hex || typeof hex !== 'string') return `rgba(15, 23, 42, ${alpha})`;
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length !== 6) return `rgba(15, 23, 42, ${alpha})`;
  
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
  
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // --- Fim de js/stamp-engine.js ---

  // --- Início de js/export.js ---
  /**
   * STAMP-CAMERA - Módulo de Exportação de Fotografias
   * Gera imagem de alta fidelidade nos formatos JPG, PNG e WebP
   * preservando o arquivo original do usuário intacto.
   */
  
  /**
   * Exporta o canvas e inicia o download da imagem carimbada
   * @param {HTMLCanvasElement} canvas
   * @param {string} originalFilename
   * @param {'image/jpeg'|'image/png'|'image/webp'} mimeType
   * @param {number} quality (0.1 a 1.0)
   * @returns {Promise<string>} Nome do arquivo gerado
   */
  async function exportStampedPhoto(canvas, originalFilename = 'fotografia.jpg', mimeType = 'image/jpeg', quality = 0.95) {
    if (!canvas) {
      throw new Error('Canvas não fornecido para exportação');
    }
  
    // Define extensão conforme o formato
    let ext = 'jpg';
    if (mimeType === 'image/png') ext = 'png';
    if (mimeType === 'image/webp') ext = 'webp';
  
    // Extrai nome base sem extensão
    const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
    const targetFilename = `${baseName}_stamp.${ext}`;
  
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha ao gerar arquivo de imagem'));
            return;
          }
  
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = targetFilename;
          document.body.appendChild(a);
          a.click();
  
          // Limpeza de memória
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            resolve(targetFilename);
          }, 100);
        },
        mimeType,
        quality
      );
    });
  }
  
  // --- Fim de js/export.js ---

  // --- Início de js/i18n.js ---
  /**
   * STAMP-CAMERA - Internacionalização (i18n)
   * Suporte a Português (Brasil), Inglês e Espanhol.
   */
  const TRANSLATIONS = {
    'pt-BR': {
      appName: 'STAMP-CAMERA',
      subtitle: 'Carimbo técnico e geográfico para fotografias',
      privacyBadge: '100% Processamento Local • Privacidade Garantida',
      openPhoto: 'Abrir Fotografia',
      demoPhoto: 'Carregar Foto de Demonstração',
      exportPhoto: 'Exportar Fotografia',
      settings: 'Configurações',
      theme: 'Tema',
      language: 'Idioma',
      presets: 'Modelos e Presets',
      fields: 'Campos do Carimbo',
      exifInfo: 'Metadados e Localização',
      appearance: 'Aparência e Estilo',
      position: 'Posição e Margens',
      typography: 'Tipografia',
      sourceAuto: 'AUTO',
      sourceManual: 'MANUAL',
      noGpsTitle: 'Sem coordenadas GPS nos metadados',
      noGpsDesc: 'Esta fotografia não possui coordenadas nos metadados EXIF.',
      insertGpsManual: 'Inserir coordenadas manualmente',
      noDateTitle: 'Data e horário não encontrados',
      noDateDesc: 'Não foi possível encontrar DateTimeOriginal nos metadados.',
      insertDateManual: 'Inserir data/hora manualmente',
      dragInstructions: 'Dica: Arraste o carimbo diretamente na fotografia para posicionamento livre.',
      dropInstructions: 'Arraste e solte uma imagem aqui ou clique para selecionar',
      formats: 'Formatos',
      quality: 'Qualidade',
      resolution: 'Resolução',
      downloadJpg: 'Baixar JPG',
      downloadPng: 'Baixar PNG',
      downloadWebp: 'Baixar WebP',
      successExport: 'Fotografia exportada com sucesso!'
    },
    'en': {
      appName: 'STAMP-CAMERA',
      subtitle: 'Technical & Georeferenced Stamp for Photographs',
      privacyBadge: '100% Client-Side Processing • Privacy Guaranteed',
      openPhoto: 'Open Photo',
      demoPhoto: 'Load Demo Photo',
      exportPhoto: 'Export Photo',
      settings: 'Settings',
      theme: 'Theme',
      language: 'Language',
      presets: 'Templates & Presets',
      fields: 'Stamp Fields',
      exifInfo: 'Metadata & Location',
      appearance: 'Appearance & Style',
      position: 'Position & Margins',
      typography: 'Typography',
      sourceAuto: 'AUTO',
      sourceManual: 'MANUAL',
      noGpsTitle: 'No GPS coordinates in metadata',
      noGpsDesc: 'This photograph does not contain GPS coordinates in EXIF.',
      insertGpsManual: 'Enter coordinates manually',
      noDateTitle: 'Date & time not found',
      noDateDesc: 'Could not find DateTimeOriginal in metadata.',
      insertDateManual: 'Enter date/time manually',
      dragInstructions: 'Tip: Drag the stamp directly over the photo for free positioning.',
      dropInstructions: 'Drag and drop an image here or click to select',
      formats: 'Formats',
      quality: 'Quality',
      resolution: 'Resolution',
      downloadJpg: 'Download JPG',
      downloadPng: 'Download PNG',
      downloadWebp: 'Download WebP',
      successExport: 'Photograph exported successfully!'
    },
    'es': {
      appName: 'STAMP-CAMERA',
      subtitle: 'Sello técnico y geográfico para fotografías',
      privacyBadge: '100% Procesamiento Local • Privacidad Garantizada',
      openPhoto: 'Abrir Fotografía',
      demoPhoto: 'Cargar Foto de Demostración',
      exportPhoto: 'Exportar Fotografía',
      settings: 'Configuraciones',
      theme: 'Tema',
      language: 'Idioma',
      presets: 'Modelos y Ajustes',
      fields: 'Campos del Sello',
      exifInfo: 'Metadatos y Ubicación',
      appearance: 'Apariencia y Estilo',
      position: 'Posición y Márgenes',
      typography: 'Tipografía',
      sourceAuto: 'AUTO',
      sourceManual: 'MANUAL',
      noGpsTitle: 'Sin coordenadas GPS en metadatos',
      noGpsDesc: 'Esta fotografía no contiene coordenadas en metadatos EXIF.',
      insertGpsManual: 'Ingresar coordenadas manualmente',
      noDateTitle: 'Fecha y hora no encontradas',
      noDateDesc: 'No se encontró DateTimeOriginal en los metadatos.',
      insertDateManual: 'Ingresar fecha/hora manualmente',
      dragInstructions: 'Consejo: Arrastre el sello directamente en la foto para posición libre.',
      dropInstructions: 'Arrastre y suelte una imagen aquí o haga clic para seleccionar',
      formats: 'Formatos',
      quality: 'Calidad',
      resolution: 'Resolución',
      downloadJpg: 'Descargar JPG',
      downloadPng: 'Descargar PNG',
      downloadWebp: 'Descargar WebP',
      successExport: '¡Fotografía exportada con éxito!'
    }
  };
  
  let currentLang = 'pt-BR';
  function setLanguage(lang) {
    if (TRANSLATIONS[lang]) {
      currentLang = lang;
    }
  }
  function t(key) {
    return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ||
           (TRANSLATIONS['pt-BR'] && TRANSLATIONS['pt-BR'][key]) ||
           key;
  }
  
  // --- Fim de js/i18n.js ---

  // --- Início de js/geocoder.js ---
  /**
   * STAMP-CAMERA - Módulo de Geocodificação Reversa (Offline First + Suporte a Nominatim)
   * Transforma latitude e longitude em Cidade, Estado e País de forma 100% client-side.
   * Possui base offline integrada para funcionamento desconectado e fallback inteligente.
   */
  
  // Base offline de capitais, cidades de referência e estados brasileiros
  const BRAZIL_STATES = [
    { uf: 'GO', name: 'Goiás', minLat: -19.5, maxLat: -12.3, minLon: -53.3, maxLon: -45.9 },
    { uf: 'DF', name: 'Distrito Federal', minLat: -16.05, maxLat: -15.5, minLon: -48.3, maxLon: -47.3 },
    { uf: 'SP', name: 'São Paulo', minLat: -25.3, maxLat: -19.7, minLon: -53.1, maxLon: -44.1 },
    { uf: 'RJ', name: 'Rio de Janeiro', minLat: -23.4, maxLat: -20.7, minLon: -44.9, maxLon: -40.9 },
    { uf: 'MG', name: 'Minas Gerais', minLat: -22.9, maxLat: -14.2, minLon: -51.1, maxLon: -39.8 },
    { uf: 'BA', name: 'Bahia', minLat: -18.3, maxLat: -8.5, minLon: -46.6, maxLon: -37.3 },
    { uf: 'PR', name: 'Paraná', minLat: -26.7, maxLat: -22.5, minLon: -54.6, maxLon: -48.0 },
    { uf: 'RS', name: 'Rio Grande do Sul', minLat: -33.7, maxLat: -27.0, minLon: -57.6, maxLon: -49.7 },
    { uf: 'SC', name: 'Santa Catarina', minLat: -29.4, maxLat: -25.9, minLon: -53.8, maxLon: -48.3 },
    { uf: 'MT', name: 'Mato Grosso', minLat: -18.0, maxLat: -7.3, minLon: -61.6, maxLon: -50.1 },
    { uf: 'MS', name: 'Mato Grosso do Sul', minLat: -24.1, maxLat: -17.1, minLon: -58.2, maxLon: -50.9 },
    { uf: 'ES', name: 'Espírito Santo', minLat: -21.3, maxLat: -17.8, minLon: -41.9, maxLon: -39.6 },
    { uf: 'CE', name: 'Ceará', minLat: -7.9, maxLat: -2.7, minLon: -41.4, maxLon: -37.2 },
    { uf: 'PE', name: 'Pernambuco', minLat: -9.5, maxLat: -7.1, minLon: -41.4, maxLon: -34.8 },
    { uf: 'PA', name: 'Pará', minLat: -9.8, maxLat: 2.6, minLon: -58.9, maxLon: -46.0 },
    { uf: 'AM', name: 'Amazonas', minLat: -9.8, maxLat: 2.2, minLon: -73.8, maxLon: -56.1 }
  ];
  
  const OFFLINE_CITIES = [
    // Goiás (incluindo Jussara - foto de referência do projeto)
    { name: 'Jussara', state: 'Goiás', country: 'Brasil', lat: -15.8699, lon: -50.8523, radiusKm: 35 },
    { name: 'Goiânia', state: 'Goiás', country: 'Brasil', lat: -16.6869, lon: -49.2648, radiusKm: 35 },
    { name: 'Anápolis', state: 'Goiás', country: 'Brasil', lat: -16.3267, lon: -48.9534, radiusKm: 25 },
    { name: 'Rio Verde', state: 'Goiás', country: 'Brasil', lat: -17.7923, lon: -50.9192, radiusKm: 30 },
    { name: 'Itaberaí', state: 'Goiás', country: 'Brasil', lat: -16.0203, lon: -49.8108, radiusKm: 30 },
    { name: 'Goiás', state: 'Goiás', country: 'Brasil', lat: -15.9342, lon: -50.1408, radiusKm: 30 },
    { name: 'Aruanã', state: 'Goiás', country: 'Brasil', lat: -14.9211, lon: -51.0828, radiusKm: 40 },
    { name: 'Brasília', state: 'Distrito Federal', country: 'Brasil', lat: -15.7975, lon: -47.8919, radiusKm: 40 },
  
    // Capitais e Centros Regionais do Brasil
    { name: 'São Paulo', state: 'São Paulo', country: 'Brasil', lat: -23.5505, lon: -46.6333, radiusKm: 45 },
    { name: 'Campinas', state: 'São Paulo', country: 'Brasil', lat: -22.9056, lon: -47.0608, radiusKm: 25 },
    { name: 'Santos', state: 'São Paulo', country: 'Brasil', lat: -23.9608, lon: -46.3336, radiusKm: 20 },
    { name: 'Ribeirão Preto', state: 'São Paulo', country: 'Brasil', lat: -21.1767, lon: -47.8108, radiusKm: 25 },
    { name: 'Rio de Janeiro', state: 'Rio de Janeiro', country: 'Brasil', lat: -22.9068, lon: -43.1729, radiusKm: 40 },
    { name: 'Niterói', state: 'Rio de Janeiro', country: 'Brasil', lat: -22.8833, lon: -43.1036, radiusKm: 20 },
    { name: 'Belo Horizonte', state: 'Minas Gerais', country: 'Brasil', lat: -19.9167, lon: -43.9345, radiusKm: 35 },
    { name: 'Uberlândia', state: 'Minas Gerais', country: 'Brasil', lat: -18.9186, lon: -48.2772, radiusKm: 25 },
    { name: 'Curitiba', state: 'Paraná', country: 'Brasil', lat: -25.4297, lon: -49.2711, radiusKm: 30 },
    { name: 'Londrina', state: 'Paraná', country: 'Brasil', lat: -23.3103, lon: -51.1628, radiusKm: 25 },
    { name: 'Porto Alegre', state: 'Rio Grande do Sul', country: 'Brasil', lat: -30.0346, lon: -51.2177, radiusKm: 30 },
    { name: 'Caxias do Sul', state: 'Rio Grande do Sul', country: 'Brasil', lat: -29.1678, lon: -51.1794, radiusKm: 25 },
    { name: 'Florianópolis', state: 'Santa Catarina', country: 'Brasil', lat: -27.5954, lon: -48.5480, radiusKm: 25 },
    { name: 'Joinville', state: 'Santa Catarina', country: 'Brasil', lat: -26.3044, lon: -48.8456, radiusKm: 25 },
    { name: 'Salvador', state: 'Bahia', country: 'Brasil', lat: -12.9777, lon: -38.5016, radiusKm: 35 },
    { name: 'Feira de Santana', state: 'Bahia', country: 'Brasil', lat: -12.2667, lon: -38.9667, radiusKm: 25 },
    { name: 'Fortaleza', state: 'Ceará', country: 'Brasil', lat: -3.7172, lon: -38.5433, radiusKm: 30 },
    { name: 'Recife', state: 'Pernambuco', country: 'Brasil', lat: -8.0476, lon: -34.8770, radiusKm: 30 },
    { name: 'Cuiabá', state: 'Mato Grosso', country: 'Brasil', lat: -15.6014, lon: -56.0979, radiusKm: 30 },
    { name: 'Campo Grande', state: 'Mato Grosso do Sul', country: 'Brasil', lat: -20.4697, lon: -54.6201, radiusKm: 30 },
    { name: 'Vitória', state: 'Espírito Santo', country: 'Brasil', lat: -20.3155, lon: -40.3128, radiusKm: 20 },
    { name: 'Belém', state: 'Pará', country: 'Brasil', lat: -1.4558, lon: -48.4902, radiusKm: 30 },
    { name: 'Manaus', state: 'Amazonas', country: 'Brasil', lat: -3.1190, lon: -60.0217, radiusKm: 35 }
  ];
  
  /**
   * Calcula a distância em quilômetros entre duas coordenadas (Fórmula de Haversine)
   */
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  /**
   * Busca localização através da base offline embutida
   * @param {number} lat
   * @param {number} lon
   * @returns {{city: string, state: string, country: string}|null}
   */
  function getOfflineLocation(lat, lon) {
    if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
      return null;
    }
  
    // Verifica se está dentro dos limites do Brasil
    const inBrazil = lat >= -33.75 && lat <= 5.27 && lon >= -73.98 && lon <= -34.79;
    const country = inBrazil ? 'Brasil' : 'Internacional';
  
    let bestCity = null;
    let minDistance = Infinity;
  
    // Procura cidade mais próxima no raio aceitável
    for (const city of OFFLINE_CITIES) {
      const dist = haversineDistance(lat, lon, city.lat, city.lon);
      if (dist < minDistance && dist <= city.radiusKm * 1.5) {
        minDistance = dist;
        bestCity = city;
      }
    }
  
    if (bestCity) {
      return {
        city: bestCity.name,
        state: bestCity.state,
        country: bestCity.country,
        source: 'OFFLINE_BASE'
      };
    }
  
    // Se não achou cidade exata, tenta achar o estado brasileiro pelo bounding box
    if (inBrazil) {
      for (const st of BRAZIL_STATES) {
        if (lat >= st.minLat && lat <= st.maxLat && lon >= st.minLon && lon <= st.maxLon) {
          return {
            city: '',
            state: st.name,
            country: 'Brasil',
            source: 'OFFLINE_STATE'
          };
        }
      }
      return {
        city: '',
        state: '',
        country: 'Brasil',
        source: 'OFFLINE_COUNTRY'
      };
    }
  
    return null;
  }
  
  /**
   * Realiza geocodificação reversa inteligente:
   * 1. Tenta consulta via rede (Nominatim OSM) com timeout rápido de 2.5s
   * 2. Em caso de falha (offline, erro ou timeout), usa a base offline embutida imediatamente.
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<{city: string, state: string, country: string, neighborhood: string, street: string, postalCode: string, source: string}>}
   */
  async function reverseGeocode(lat, lon) {
    if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
      return null;
    }
  
    // 1. Base offline local (instantânea, zero latência, 100% client-side)
    const offline = getOfflineLocation(lat, lon);
    let result = null;
    if (offline) {
      result = {
        city: offline.city,
        state: offline.state,
        country: offline.country,
        neighborhood: '',
        street: '',
        postalCode: '',
        source: 'AUTO'
      };
    }
  
    // 2. Se houver conexão com a internet, tenta enriquecer com rua/bairro detalhados
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
  
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        clearTimeout(timeoutId);
  
        if (res.ok) {
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const city = addr.city || addr.town || addr.municipality || addr.village || addr.city_district || (result ? result.city : '');
            const state = addr.state || (result ? result.state : '');
            const country = addr.country || 'Brasil';
            const neighborhood = addr.suburb || addr.neighbourhood || addr.quarter || '';
            const street = addr.road || '';
            const postalCode = addr.postcode || '';
  
            return {
              city,
              state,
              country,
              neighborhood,
              street,
              postalCode,
              source: 'AUTO'
            };
          }
        }
      } catch {
        // Ignora erro de rede e retorna o resultado da base offline
      }
    }
  
    return result;
  }
  
  // --- Fim de js/geocoder.js ---

  // --- Início de js/tools/stamp-camera/tool.js ---
  /**
   * STAMP-CAMERA - Núcleo de Estado e Regras de Negócio (Tool Controller)
   * Mantém o estado da foto, metadados EXIF, localização com rastreamento de origem (AUTO/MANUAL),
   * e compõe as linhas para renderização no StampEngine.
   */
  class StampCameraTool {
    constructor() {
      this.photo = null;       // { canvas, width, height, filename, fileSize }
      this.exif = null;        // Metadados extraídos
      this.location = this.createDefaultLocation();
      this.settings = { ...DEFAULT_STAMP_SETTINGS };
      this.numbering = { ...DEFAULT_NUMBERING };
      this.activeFields = [];  // Lista ordenada de TODOS os campos disponíveis
      this.selectedModelId = 'model_1_simple';
  
      this.initDefaultFields();
    }
  
    createDefaultLocation() {
      return {
        latitude: null,
        longitude: null,
        altitude: null,
        date: '',
        time: '',
        dateObj: null,
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        locality: '',
        district: '',
        city: '',
        municipality: '',
        state: '',
        stateCode: '',
        country: '',
        postalCode: '',
        referencePoint: '',
        projectName: '',
        process: '',
        reportNum: '',
        responsible: '',
        customText: '',
        photoId: '01',
        // Rastreamento explícito da origem de cada dado (AUTO vs MANUAL)
        sources: {
          latitude: 'MANUAL',
          longitude: 'MANUAL',
          altitude: 'MANUAL',
          date: 'MANUAL',
          time: 'MANUAL',
          street: 'MANUAL',
          number: 'MANUAL',
          neighborhood: 'MANUAL',
          locality: 'MANUAL',
          city: 'MANUAL',
          state: 'MANUAL',
          country: 'MANUAL',
          postalCode: 'MANUAL',
          referencePoint: 'MANUAL',
          projectName: 'MANUAL',
          process: 'MANUAL',
          reportNum: 'MANUAL',
          responsible: 'MANUAL',
          customText: 'MANUAL'
        }
      };
    }
  
    initDefaultFields() {
      // Inicializa todos os campos padrão com base no Modelo 1
      const defaultModel = BUILT_IN_MODELS[0];
      this.applyModel(defaultModel);
    }
  
    /**
     * Aplica um modelo ou preset predefinido, garantindo que TODOS os campos
     * padrão continuem acessíveis na lista para o usuário ativar/desativar livremente.
     */
    applyModel(model) {
      if (!model) return;
      this.selectedModelId = model.id;
  
      if (model.position) this.settings.position = model.position;
      if (model.backgroundType) this.settings.backgroundType = model.backgroundType;
      if (model.backgroundColor) this.settings.backgroundColor = model.backgroundColor;
      if (model.backgroundOpacity !== undefined) this.settings.backgroundOpacity = model.backgroundOpacity;
      if (model.textColor) this.settings.textColor = model.textColor;
      if (model.borderWidth !== undefined) this.settings.borderWidth = model.borderWidth;
      if (model.borderColor) this.settings.borderColor = model.borderColor;
      if (model.borderRadius !== undefined) this.settings.borderRadius = model.borderRadius;
      if (model.hasShadow !== undefined) this.settings.hasShadow = model.hasShadow;
      if (model.fontFamily) this.settings.fontFamily = model.fontFamily;
      if (model.fontSize) this.settings.fontSize = model.fontSize;
      if (model.fontSizeScale) this.settings.fontSizeScale = model.fontSizeScale;
      if (model.textAlign) this.settings.textAlign = model.textAlign;
      if (model.coordFormat) this.settings.coordFormat = model.coordFormat;
      if (model.dateFormat) this.settings.dateFormat = model.dateFormat;
      if (model.timeFormat) this.settings.timeFormat = model.timeFormat;
      if (model.labelMode) this.settings.labelMode = model.labelMode;
      if (model.inlineLayout) this.settings.inlineLayout = model.inlineLayout;
  
      // Reseta posição personalizada caso troque de modelo
      this.settings.customPosX = null;
      this.settings.customPosY = null;
  
      // Preserva campos personalizados já criados pelo usuário
      const existingCustomFields = this.activeFields.filter(f => f.isCustom);
  
      // Constrói lista completa: campos ativados pelo modelo primeiro, seguidos pelos outros campos padrão desativados
      const modelFieldMap = new Map();
      if (model.fields) {
        model.fields.forEach((f, idx) => {
          modelFieldMap.set(f.id, { ...f, order: idx });
        });
      }
  
      const orderedList = [];
      const remainingStandard = [];
  
      // 1. Campos que o modelo declarou explicitamente (ficam no topo)
      if (model.fields) {
        for (const mf of model.fields) {
          const def = STANDARD_FIELD_DEFS.find(d => d.id === mf.id);
          orderedList.push({
            id: mf.id,
            name: def ? def.name : mf.label,
            label: mf.label || (def ? def.defaultLabel : mf.id),
            enabled: mf.enabled !== false,
            showLabel: mf.showLabel !== false,
            isCustom: false,
            customValue: mf.defaultValue || '',
            order: orderedList.length
          });
        }
      }
  
      // 2. Todos os outros campos padrão disponíveis (adicionados após os do modelo, inicialmente desmarcados)
      for (const def of STANDARD_FIELD_DEFS) {
        if (!modelFieldMap.has(def.id)) {
          remainingStandard.push({
            id: def.id,
            name: def.name,
            label: def.defaultLabel,
            enabled: false,
            showLabel: true,
            isCustom: false,
            customValue: '',
            order: orderedList.length + remainingStandard.length
          });
        }
      }
  
      // Monta a lista completa mantendo todos os campos acessíveis
      this.activeFields = [...orderedList, ...remainingStandard, ...existingCustomFields];
    }
  
    /**
     * Carrega nova fotografia e extrai metadados
     */
    loadPhotoData(photoData) {
      this.photo = {
        canvas: photoData.canvas,
        width: photoData.width,
        height: photoData.height,
        filename: photoData.filename,
        fileSize: photoData.fileSize
      };
  
      this.exif = photoData.exif || {};
      this.updateLocationFromExif();
  
      // Se fornecidos dados geográficos complementares (ex: demo de teste)
      if (photoData.locationData) {
        const ld = photoData.locationData;
        if (ld.city) this.location.city = ld.city;
        if (ld.state) this.location.state = ld.state;
        if (ld.country) this.location.country = ld.country;
        if (ld.neighborhood) this.location.neighborhood = ld.neighborhood;
        if (ld.street) this.location.street = ld.street;
        if (ld.number) this.location.number = ld.number;
        if (ld.postalCode) this.location.postalCode = ld.postalCode;
        if (ld.projectName) this.location.projectName = ld.projectName;
        if (ld.process) this.location.process = ld.process;
        if (ld.responsible) this.location.responsible = ld.responsible;
        if (ld.reportNum) this.location.reportNum = ld.reportNum;
        if (ld.customText) this.location.customText = ld.customText;
      }
    }
  
    /**
     * Popula a localização com dados do EXIF marcando como AUTO,
     * sem inventar dados faltantes!
     */
    updateLocationFromExif() {
      if (!this.exif) return;
  
      if (this.exif.hasGps && this.exif.latitude !== null && this.exif.longitude !== null) {
        this.location.latitude = this.exif.latitude;
        this.location.longitude = this.exif.longitude;
        this.location.sources.latitude = 'AUTO';
        this.location.sources.longitude = 'AUTO';
      } else {
        this.location.latitude = null;
        this.location.longitude = null;
        this.location.sources.latitude = 'MANUAL';
        this.location.sources.longitude = 'MANUAL';
      }
  
      if (this.exif.altitude !== null && this.exif.altitude !== undefined) {
        this.location.altitude = this.exif.altitude;
        this.location.sources.altitude = 'AUTO';
      } else {
        this.location.altitude = null;
        this.location.sources.altitude = 'MANUAL';
      }
  
      if (this.exif.hasDate && this.exif.dateObj) {
        this.location.dateObj = this.exif.dateObj;
        this.location.date = this.formatDateString(this.exif.dateObj, this.settings.dateFormat);
        this.location.time = this.formatTimeString(this.exif.dateObj, this.settings.timeFormat);
        this.location.sources.date = 'AUTO';
        this.location.sources.time = 'AUTO';
      } else {
        this.location.dateObj = null;
        this.location.date = '';
        this.location.time = '';
        this.location.sources.date = 'MANUAL';
        this.location.sources.time = 'MANUAL';
      }
    }
  
    /**
     * Limpa o espaço de trabalho resetando a foto e os campos
     */
    clearWorkspace() {
      this.photo = null;
      this.exif = null;
      this.location = this.createDefaultLocation();
      this.settings.customPosX = null;
      this.settings.customPosY = null;
      this.initDefaultFields();
    }
  
    /**
     * Tenta resolver automaticamente Cidade, Estado e País com base nas coordenadas
     */
    async autoResolveLocation() {
      if (this.location.latitude !== null && this.location.longitude !== null) {
        const geo = await reverseGeocode(this.location.latitude, this.location.longitude);
        if (geo) {
          if (geo.city && !this.location.city) {
            this.location.city = geo.city;
            this.location.sources.city = 'AUTO';
          }
          if (geo.state && !this.location.state) {
            this.location.state = geo.state;
            this.location.sources.state = 'AUTO';
          }
          if (geo.country && !this.location.country) {
            this.location.country = geo.country;
            this.location.sources.country = 'AUTO';
          }
          if (geo.neighborhood && !this.location.neighborhood) {
            this.location.neighborhood = geo.neighborhood;
            this.location.sources.neighborhood = 'AUTO';
          }
          if (geo.street && !this.location.street) {
            this.location.street = geo.street;
            this.location.sources.street = 'AUTO';
          }
          if (geo.postalCode && !this.location.postalCode) {
            this.location.postalCode = geo.postalCode;
            this.location.sources.postalCode = 'AUTO';
          }
          return geo;
        }
      }
      return null;
    }
  
    /**
     * Atualiza o valor de qualquer campo (tanto padrão quanto customizado),
     * sincronizando com o estado interno e marcando a origem como MANUAL.
     */
    setFieldValue(fieldId, value) {
      const trimmed = typeof value === 'string' ? value.trim() : value;
  
      switch (fieldId) {
        case 'date':
          this.location.date = value;
          this.location.sources.date = 'MANUAL';
          break;
  
        case 'time':
          this.location.time = value;
          this.location.sources.time = 'MANUAL';
          break;
  
        case 'coordinates': {
          const parsed = parseCoordinateString(value);
          if (parsed) {
            this.location.latitude = parsed.lat;
            this.location.longitude = parsed.lon;
            this.location.sources.latitude = 'MANUAL';
            this.location.sources.longitude = 'MANUAL';
          }
          break;
        }
  
        case 'lat': {
          const lat = parseFloat(value);
          if (!isNaN(lat) && lat >= -90 && lat <= 90) {
            this.location.latitude = lat;
            this.location.sources.latitude = 'MANUAL';
          }
          break;
        }
  
        case 'lon': {
          const lon = parseFloat(value);
          if (!isNaN(lon) && lon >= -180 && lon <= 180) {
            this.location.longitude = lon;
            this.location.sources.longitude = 'MANUAL';
          }
          break;
        }
  
        case 'altitude': {
          const alt = parseFloat(value);
          this.location.altitude = isNaN(alt) ? null : alt;
          this.location.sources.altitude = 'MANUAL';
          break;
        }
  
        case 'street':
          this.location.street = value;
          this.location.sources.street = 'MANUAL';
          break;
  
        case 'number':
          this.location.number = value;
          this.location.sources.number = 'MANUAL';
          break;
  
        case 'neighborhood':
          this.location.neighborhood = value;
          this.location.sources.neighborhood = 'MANUAL';
          break;
  
        case 'locality':
          this.location.locality = value;
          this.location.sources.locality = 'MANUAL';
          break;
  
        case 'city':
          this.location.city = value;
          this.location.sources.city = 'MANUAL';
          break;
  
        case 'state':
          this.location.state = value;
          this.location.sources.state = 'MANUAL';
          break;
  
        case 'country':
          this.location.country = value;
          this.location.sources.country = 'MANUAL';
          break;
  
        case 'postal_code':
          this.location.postalCode = value;
          this.location.sources.postalCode = 'MANUAL';
          break;
  
        case 'project_name':
          this.location.projectName = value;
          this.location.sources.projectName = 'MANUAL';
          break;
  
        case 'process':
          this.location.process = value;
          this.location.sources.process = 'MANUAL';
          break;
  
        case 'report_num':
          this.location.reportNum = value;
          this.location.sources.reportNum = 'MANUAL';
          break;
  
        case 'responsible':
          this.location.responsible = value;
          this.location.sources.responsible = 'MANUAL';
          break;
  
        case 'custom_text':
          this.location.customText = value;
          this.location.sources.customText = 'MANUAL';
          break;
  
        case 'photo_id':
          this.location.photoId = value;
          break;
  
        default: {
          const f = this.activeFields.find(field => field.id === fieldId);
          if (f) {
            f.customValue = value;
          }
          break;
        }
      }
    }
  
    /**
     * Formata objeto Date segundo o padrão selecionado
     */
    formatDateString(dateObj, format = DATE_FORMATS.BR) {
      if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return '';
      }
  
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
  
      if (format === DATE_FORMATS.ISO) {
        return `${year}-${month}-${day}`;
      }
  
      if (format === DATE_FORMATS.TEXTUAL) {
        const months = [
          'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        return `${day} de ${months[dateObj.getMonth()]} de ${year}`;
      }
  
      // Padrão Brasileiro (BR)
      return `${day}/${month}/${year}`;
    }
  
    /**
     * Formata horário segundo padrão selecionado
     */
    formatTimeString(dateObj, format = TIME_FORMATS.FULL) {
      if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return '';
      }
  
      const hh = String(dateObj.getHours()).padStart(2, '0');
      const mm = String(dateObj.getMinutes()).padStart(2, '0');
      const ss = String(dateObj.getSeconds()).padStart(2, '0');
  
      if (format === TIME_FORMATS.NO_SECONDS) {
        return `${hh}:${mm}`;
      }
  
      return `${hh}:${mm}:${ss}`;
    }
  
    /**
     * Resolve o valor formatado de um campo para exibição no carimbo
     */
    getFieldValue(fieldId, fieldConfig = {}) {
      switch (fieldId) {
        case 'date':
          return this.location.date || (this.location.dateObj ? this.formatDateString(this.location.dateObj, this.settings.dateFormat) : '');
  
        case 'time':
          return this.location.time || (this.location.dateObj ? this.formatTimeString(this.location.dateObj, this.settings.timeFormat) : '');
  
        case 'datetime': {
          const d = this.location.date || (this.location.dateObj ? this.formatDateString(this.location.dateObj, this.settings.dateFormat) : '');
          const t = this.location.time || (this.location.dateObj ? this.formatTimeString(this.location.dateObj, this.settings.timeFormat) : '');
          if (d && t) return `${d} ${t}`;
          return d || t || '';
        }
  
        case 'coordinates':
          return formatCoordinates(
            this.location.latitude,
            this.location.longitude,
            this.settings.coordFormat,
            this.settings.customCoordTemplate,
            this.location.altitude
          );
  
        case 'lat': {
          if (this.location.latitude === null || isNaN(this.location.latitude)) return '';
          if (this.settings.coordFormat === COORD_FORMATS.DMS) {
            return toDms(this.location.latitude, true);
          }
          if (this.settings.coordFormat === COORD_FORMATS.DDM) {
            return toDdm(this.location.latitude, true);
          }
          if (this.settings.coordFormat === COORD_FORMATS.DECIMAL_SIGNED) {
            return this.location.latitude.toFixed(8);
          }
          const dir = this.location.latitude >= 0 ? 'N' : 'S';
          return `${Math.abs(this.location.latitude).toFixed(6)}° ${dir}`;
        }
  
        case 'lon': {
          if (this.location.longitude === null || isNaN(this.location.longitude)) return '';
          if (this.settings.coordFormat === COORD_FORMATS.DMS) {
            return toDms(this.location.longitude, false);
          }
          if (this.settings.coordFormat === COORD_FORMATS.DDM) {
            return toDdm(this.location.longitude, false);
          }
          if (this.settings.coordFormat === COORD_FORMATS.DECIMAL_SIGNED) {
            return this.location.longitude.toFixed(8);
          }
          const dir = this.location.longitude >= 0 ? 'E' : 'W';
          return `${Math.abs(this.location.longitude).toFixed(6)}° ${dir}`;
        }
  
        case 'altitude':
          return this.location.altitude !== null ? `${this.location.altitude.toFixed(1)} m` : '';
  
        case 'street':
          return this.location.street || '';
  
        case 'number':
          return this.location.number ? (this.location.number.startsWith('nº') ? this.location.number : `nº ${this.location.number}`) : '';
  
        case 'address_street_num': {
          if (this.location.street && this.location.number) {
            const numStr = this.location.number.startsWith('nº') ? this.location.number : `nº ${this.location.number}`;
            return `${this.location.street}, ${numStr}`;
          }
          return this.location.street || (this.location.number ? `nº ${this.location.number}` : '');
        }
  
        case 'neighborhood':
          return this.location.neighborhood || '';
  
        case 'locality': {
          if (this.location.locality) return this.location.locality;
          const parts = [this.location.city, this.location.state || this.location.stateCode].filter(Boolean);
          return parts.join(', ');
        }
  
        case 'city':
          return this.location.city || this.location.municipality || '';
  
        case 'state':
          return this.location.state || this.location.stateCode || '';
  
        case 'country':
          return this.location.country || '';
  
        case 'city_state_country': {
          const parts = [
            this.location.city || this.location.municipality,
            this.location.state || this.location.stateCode,
            this.location.country
          ].filter(Boolean);
          return parts.join(', ');
        }
  
        case 'postal_code':
          return this.location.postalCode ? (this.location.postalCode.startsWith('CEP') ? this.location.postalCode : `CEP: ${this.location.postalCode}`) : '';
  
        case 'project_name':
          return this.location.projectName || fieldConfig.customValue || '';
  
        case 'process':
          return this.location.process || fieldConfig.customValue || '';
  
        case 'report_num':
          return this.location.reportNum || fieldConfig.customValue || '';
  
        case 'responsible':
          return this.location.responsible || fieldConfig.customValue || '';
  
        case 'custom_text':
          return this.location.customText || fieldConfig.customValue || '';
  
        case 'photo_id': {
          if (this.numbering.enabled) {
            const num = String(this.numbering.startNumber).padStart(this.numbering.digits, '0');
            return `${this.numbering.prefix}${num}${this.numbering.suffix}`;
          }
          return this.location.photoId || fieldConfig.customValue || '01';
        }
  
        default:
          // Campos personalizados adicionados pelo usuário
          return fieldConfig.customValue || '';
      }
    }
  
    /**
     * Constrói a lista de linhas prontas para desenho no carimbo
     */
    getStampRenderLines() {
      const lines = [];
  
      for (const field of this.activeFields) {
        if (!field.enabled) continue;
  
        const val = this.getFieldValue(field.id, field);
        if (val) {
          lines.push({
            id: field.id,
            label: field.label,
            value: val,
            showLabel: field.showLabel !== false,
            isCustom: field.isCustom,
            icon: field.icon || FIELD_ICONS[field.id] || 'default'
          });
        }
      }
  
      return lines;
    }
  
    /**
     * Adiciona um campo customizado à lista
     */
    addCustomField(label = 'Novo Campo', defaultValue = '') {
      const id = `custom_${Date.now()}`;
      const newField = {
        id,
        name: label,
        label,
        enabled: true,
        showLabel: true,
        isCustom: true,
        customValue: defaultValue,
        order: this.activeFields.length
      };
      this.activeFields.push(newField);
      return newField;
    }
  
    /**
     * Remove um campo da lista
     */
    removeField(fieldId) {
      this.activeFields = this.activeFields.filter(f => f.id !== fieldId);
    }
  
    /**
     * Move um campo para cima ou para baixo
     */
    moveField(fieldId, direction = 'up') {
      const idx = this.activeFields.findIndex(f => f.id === fieldId);
      if (idx < 0) return;
  
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= this.activeFields.length) return;
  
      const temp = this.activeFields[idx];
      this.activeFields[idx] = this.activeFields[targetIdx];
      this.activeFields[targetIdx] = temp;
    }
  }
  
  // --- Fim de js/tools/stamp-camera/tool.js ---

  // --- Início de js/tools/stamp-camera/ui.js ---
  /**
   * STAMP-CAMERA - Camada de Interface do Usuário (UI Controller)
   * Gerencia formulários, listas de campos editáveis, sincronização bidirecional,
   * drag-and-drop no canvas, alertas de EXIF, badges de origem (AUTO/MANUAL) e sincronização em tempo real.
   */
  class StampCameraUI {
    constructor(tool, engine, app) {
      this.tool = tool;
      this.engine = engine;
      this.app = app;
  
      // Estado do arraste no Canvas
      this.isDraggingStamp = false;
      this.dragStart = { x: 0, y: 0 };
      this.stampStartPos = { x: 0, y: 0 };
  
      this.cacheDOMElements();
      this.bindEvents();
      this.renderPresetsList();
      this.renderFieldsList();
    }
  
    cacheDOMElements() {
      // Canvas e preview
      this.previewCanvas = document.getElementById('previewCanvas');
      this.previewContainer = document.getElementById('previewContainer');
      this.emptyPlaceholder = document.getElementById('emptyPlaceholder');
      this.imageInfoBar = document.getElementById('imageInfoBar');
      this.photoMetaText = document.getElementById('photoMetaText');
      this.dragHintPill = document.getElementById('dragHintPill');
  
      // Botões principais
      this.fileInput = document.getElementById('fileInput');
      this.btnOpenPhoto = document.getElementById('btnOpenPhoto');
      this.btnDemoWithGps = document.getElementById('btnDemoWithGps');
      this.btnDemoWithoutGps = document.getElementById('btnDemoWithoutGps');
      this.btnExport = document.getElementById('btnExport');
  
      // Tabs e painéis
      this.tabButtons = document.querySelectorAll('.tab-btn');
      this.tabPanels = document.querySelectorAll('.tab-panel');
  
      // Alertas de Metadados
      this.alertNoGps = document.getElementById('alertNoGps');
      this.alertNoDate = document.getElementById('alertNoDate');
      this.alertMetaSuccess = document.getElementById('alertMetaSuccess');
  
      // Campos de Localização (Painel Direito)
      this.inputLat = document.getElementById('inputLat');
      this.inputLon = document.getElementById('inputLon');
      this.inputAlt = document.getElementById('inputAlt');
      this.inputDate = document.getElementById('inputDate');
      this.inputTime = document.getElementById('inputTime');
      this.inputStreet = document.getElementById('inputStreet');
      this.inputNumber = document.getElementById('inputNumber');
      this.inputNeighborhood = document.getElementById('inputNeighborhood');
      this.inputCity = document.getElementById('inputCity');
      this.inputState = document.getElementById('inputState');
      this.inputCountry = document.getElementById('inputCountry');
      this.inputPostalCode = document.getElementById('inputPostalCode');
      this.inputProjectName = document.getElementById('inputProjectName');
      this.inputProcess = document.getElementById('inputProcess');
      this.inputResponsible = document.getElementById('inputResponsible');
  
      // Badges de Origem (AUTO / MANUAL)
      this.badgeLat = document.getElementById('badgeLat');
      this.badgeLon = document.getElementById('badgeLon');
      this.badgeAlt = document.getElementById('badgeAlt');
      this.badgeDate = document.getElementById('badgeDate');
      this.badgeTime = document.getElementById('badgeTime');
  
      // Lista de campos do carimbo (Painel Esquerdo)
      this.fieldsContainer = document.getElementById('fieldsContainer');
      this.btnAddField = document.getElementById('btnAddField');
  
      // Presets
      this.presetsSelect = document.getElementById('presetsSelect');
      this.btnSavePreset = document.getElementById('btnSavePreset');
  
      // Configurações do Carimbo
      this.selectCoordFormat = document.getElementById('selectCoordFormat');
      this.selectDateFormat = document.getElementById('selectDateFormat');
      this.selectTimeFormat = document.getElementById('selectTimeFormat');
      this.selectFontFamily = document.getElementById('selectFontFamily');
      this.rangeFontSize = document.getElementById('rangeFontSize');
      this.valFontSize = document.getElementById('valFontSize');
      this.colorText = document.getElementById('colorText');
      this.colorBg = document.getElementById('colorBg');
      this.selectBgType = document.getElementById('selectBgType');
      this.rangeBgOpacity = document.getElementById('rangeBgOpacity');
      this.valBgOpacity = document.getElementById('valBgOpacity');
      this.selectBorderWidth = document.getElementById('selectBorderWidth');
      this.colorBorder = document.getElementById('colorBorder');
      this.rangeBorderRadius = document.getElementById('rangeBorderRadius');
      this.valBorderRadius = document.getElementById('valBorderRadius');
      this.checkShadow = document.getElementById('checkShadow');
      this.checkBold = document.getElementById('checkBold');
      this.checkItalic = document.getElementById('checkItalic');
      this.selectTextAlign = document.getElementById('selectTextAlign');
      this.selectLabelMode = document.getElementById('selectLabelMode');
      this.selectInlineLayout = document.getElementById('selectInlineLayout');
  
      // Grid de Posições
      this.posButtons = document.querySelectorAll('.pos-btn');
  
      // Exportação
      this.selectExportFormat = document.getElementById('selectExportFormat');
      this.rangeExportQuality = document.getElementById('rangeExportQuality');
      this.valExportQuality = document.getElementById('valExportQuality');
      this.qualityGroup = document.getElementById('qualityGroup');
  
      // Numeração automática
      this.checkAutoNumber = document.getElementById('checkAutoNumber');
      this.inputNumberPrefix = document.getElementById('inputNumberPrefix');
      this.inputNumberStart = document.getElementById('inputNumberStart');
      this.inputNumberDigits = document.getElementById('inputNumberDigits');
    }
  
    bindEvents() {
      // Alternância de Abas nos painéis
      this.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.dataset.tab;
          const panel = btn.closest('.panel');
          if (panel) {
            panel.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            panel.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const target = panel.querySelector(`#tab-${tab}`);
            if (target) target.classList.add('active');
          }
        });
      });
  
      // Posições em Grade (9 Pontos)
      this.posButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const pos = btn.dataset.pos;
          this.posButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.tool.settings.position = pos;
          this.tool.settings.customPosX = null;
          this.tool.settings.customPosY = null;
          this.app.requestRender();
        });
      });
  
      // Mudança de formatos
      this.selectCoordFormat.addEventListener('change', (e) => {
        this.tool.settings.coordFormat = e.target.value;
        this.updateFieldInputValue('coordinates', this.tool.getFieldValue('coordinates'));
        this.updateFieldInputValue('lat', this.tool.getFieldValue('lat'));
        this.updateFieldInputValue('lon', this.tool.getFieldValue('lon'));
        this.app.requestRender();
      });
  
      this.selectDateFormat.addEventListener('change', (e) => {
        this.tool.settings.dateFormat = e.target.value;
        if (this.tool.location.dateObj) {
          this.tool.location.date = this.tool.formatDateString(this.tool.location.dateObj, e.target.value);
          this.inputDate.value = this.tool.location.date;
          this.updateFieldInputValue('date', this.tool.location.date);
          this.updateFieldInputValue('datetime', this.tool.getFieldValue('datetime'));
        }
        this.app.requestRender();
      });
  
      this.selectTimeFormat.addEventListener('change', (e) => {
        this.tool.settings.timeFormat = e.target.value;
        if (this.tool.location.dateObj) {
          this.tool.location.time = this.tool.formatTimeString(this.tool.location.dateObj, e.target.value);
          this.inputTime.value = this.tool.location.time;
          this.updateFieldInputValue('time', this.tool.location.time);
          this.updateFieldInputValue('datetime', this.tool.getFieldValue('datetime'));
        }
        this.app.requestRender();
      });
  
      // Estilos Visuais
      this.selectFontFamily.addEventListener('change', (e) => {
        this.tool.settings.fontFamily = e.target.value;
        this.app.requestRender();
      });
  
      this.rangeFontSize.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.valFontSize.textContent = `${val}px`;
        this.tool.settings.fontSize = val;
        this.app.requestRender();
      });
  
      this.colorText.addEventListener('input', (e) => {
        this.tool.settings.textColor = e.target.value;
        this.app.requestRender();
      });
  
      this.colorBg.addEventListener('input', (e) => {
        this.tool.settings.backgroundColor = e.target.value;
        this.app.requestRender();
      });
  
      this.selectBgType.addEventListener('change', (e) => {
        this.tool.settings.backgroundType = e.target.value;
        this.app.requestRender();
      });
  
      this.rangeBgOpacity.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.valBgOpacity.textContent = `${val}%`;
        this.tool.settings.backgroundOpacity = val;
        this.app.requestRender();
      });
  
      this.selectBorderWidth.addEventListener('change', (e) => {
        this.tool.settings.borderWidth = parseInt(e.target.value, 10);
        this.app.requestRender();
      });
  
      this.colorBorder.addEventListener('input', (e) => {
        this.tool.settings.borderColor = e.target.value;
        this.app.requestRender();
      });
  
      this.rangeBorderRadius.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.valBorderRadius.textContent = `${val}px`;
        this.tool.settings.borderRadius = val;
        this.app.requestRender();
      });
  
      this.checkShadow.addEventListener('change', (e) => {
        this.tool.settings.hasShadow = e.target.checked;
        this.app.requestRender();
      });
  
      this.checkBold.addEventListener('change', (e) => {
        this.tool.settings.fontWeight = e.target.checked ? '700' : '400';
        this.app.requestRender();
      });
  
      this.checkItalic.addEventListener('change', (e) => {
        this.tool.settings.isItalic = e.target.checked;
        this.app.requestRender();
      });
  
      this.selectTextAlign.addEventListener('change', (e) => {
        this.tool.settings.textAlign = e.target.value;
        this.app.requestRender();
      });
  
      if (this.selectLabelMode) {
        this.selectLabelMode.addEventListener('change', (e) => {
          this.tool.settings.labelMode = e.target.value;
          this.app.requestRender();
        });
      }
  
      if (this.selectInlineLayout) {
        this.selectInlineLayout.addEventListener('change', (e) => {
          this.tool.settings.inlineLayout = e.target.value;
          this.app.requestRender();
        });
      }
  
      // Numeração Automática
      this.checkAutoNumber.addEventListener('change', (e) => {
        this.tool.numbering.enabled = e.target.checked;
        this.updateFieldInputValue('photo_id', this.tool.getFieldValue('photo_id'));
        this.app.requestRender();
      });
  
      this.inputNumberPrefix.addEventListener('input', (e) => {
        this.tool.numbering.prefix = e.target.value;
        this.updateFieldInputValue('photo_id', this.tool.getFieldValue('photo_id'));
        this.app.requestRender();
      });
  
      this.inputNumberStart.addEventListener('input', (e) => {
        this.tool.numbering.startNumber = parseInt(e.target.value, 10) || 1;
        this.updateFieldInputValue('photo_id', this.tool.getFieldValue('photo_id'));
        this.app.requestRender();
      });
  
      this.inputNumberDigits.addEventListener('input', (e) => {
        this.tool.numbering.digits = parseInt(e.target.value, 10) || 2;
        this.updateFieldInputValue('photo_id', this.tool.getFieldValue('photo_id'));
        this.app.requestRender();
      });
  
      // Exportação
      this.selectExportFormat.addEventListener('change', (e) => {
        const isJpg = e.target.value === 'image/jpeg';
        this.qualityGroup.style.display = isJpg ? 'block' : 'none';
      });
  
      this.rangeExportQuality.addEventListener('input', (e) => {
        const val = Math.round(parseFloat(e.target.value) * 100);
        this.valExportQuality.textContent = `${val}%`;
      });
  
      // Sincronização dos campos do painel direito (Localização & Técnico)
      this.bindLocationInputs();
  
      // Eventos de drag-and-drop de arquivo
      this.bindFileDropEvents();
  
      // Eventos de movimentação do carimbo no Canvas
      this.bindCanvasStampDrag();
  
      // Botão Adicionar Campo Personalizado
      this.btnAddField.addEventListener('click', () => {
        const field = this.tool.addCustomField('Campo Personalizado', 'Valor');
        this.renderFieldsList();
        this.app.requestRender();
      });
  
      // Seleção de Preset / Modelo
      this.presetsSelect.addEventListener('change', (e) => {
        this.loadSelectedPreset(e.target.value);
      });
  
      // Salvar Preset Personalizado
      this.btnSavePreset.addEventListener('click', () => {
        const name = prompt('Nome para o novo Modelo / Preset:', 'Meu Modelo Personalizado');
        if (name) {
          const customPreset = {
            id: `custom_${Date.now()}`,
            name: name.trim(),
            description: 'Modelo customizado salvo pelo usuário',
            ...this.tool.settings,
            fields: this.tool.activeFields.map(f => ({
              id: f.id,
              label: f.label,
              enabled: f.enabled,
              showLabel: f.showLabel,
              defaultValue: f.customValue || this.tool.getFieldValue(f.id, f)
            }))
          };
          storage.saveCustomPreset(customPreset);
          this.renderPresetsList();
          this.presetsSelect.value = customPreset.id;
          alert('Modelo salvo com sucesso no navegador!');
        }
      });
    }
  
    /**
     * Vincula os inputs do painel direito com sincronização bidirecional
     */
    bindLocationInputs() {
      // Latitude manual
      this.inputLat.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val >= -90 && val <= 90) {
          this.tool.location.latitude = val;
          this.tool.location.sources.latitude = 'MANUAL';
          this.updateSourceBadges();
          this.updateFieldInputValue('lat', this.tool.getFieldValue('lat'));
          this.updateFieldInputValue('coordinates', this.tool.getFieldValue('coordinates'));
          this.app.requestRender();
        }
      });
  
      // Longitude manual
      this.inputLon.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val >= -180 && val <= 180) {
          this.tool.location.longitude = val;
          this.tool.location.sources.longitude = 'MANUAL';
          this.updateSourceBadges();
          this.updateFieldInputValue('lon', this.tool.getFieldValue('lon'));
          this.updateFieldInputValue('coordinates', this.tool.getFieldValue('coordinates'));
          this.app.requestRender();
        }
      });
  
      // Altitude manual
      this.inputAlt.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.tool.location.altitude = isNaN(val) ? null : val;
        this.tool.location.sources.altitude = 'MANUAL';
        this.updateSourceBadges();
        this.updateFieldInputValue('altitude', this.tool.getFieldValue('altitude'));
        this.app.requestRender();
      });
  
      // Data manual
      this.inputDate.addEventListener('input', (e) => {
        this.tool.location.date = e.target.value;
        this.tool.location.sources.date = 'MANUAL';
        this.updateSourceBadges();
        this.updateFieldInputValue('date', e.target.value);
        this.updateFieldInputValue('datetime', this.tool.getFieldValue('datetime'));
        this.app.requestRender();
      });
  
      // Hora manual
      this.inputTime.addEventListener('input', (e) => {
        this.tool.location.time = e.target.value;
        this.tool.location.sources.time = 'MANUAL';
        this.updateSourceBadges();
        this.updateFieldInputValue('time', e.target.value);
        this.updateFieldInputValue('datetime', this.tool.getFieldValue('datetime'));
        this.app.requestRender();
      });
  
      // Campos de Endereço e Dados Técnicos
      const bindText = (inputElem, key, fieldId, relatedFieldIds = []) => {
        inputElem.addEventListener('input', (e) => {
          this.tool.location[key] = e.target.value;
          this.tool.location.sources[key] = 'MANUAL';
          this.updateFieldInputValue(fieldId, e.target.value);
          for (const relId of relatedFieldIds) {
            this.updateFieldInputValue(relId, this.tool.getFieldValue(relId));
          }
          this.app.requestRender();
        });
      };
  
      bindText(this.inputStreet, 'street', 'street', ['address_street_num']);
      bindText(this.inputNumber, 'number', 'number', ['address_street_num']);
      bindText(this.inputNeighborhood, 'neighborhood', 'neighborhood');
      bindText(this.inputCity, 'city', 'city', ['locality', 'city_state_country']);
      bindText(this.inputState, 'state', 'state', ['locality', 'city_state_country']);
      bindText(this.inputCountry, 'country', 'country', ['city_state_country']);
      bindText(this.inputPostalCode, 'postalCode', 'postal_code');
      bindText(this.inputProjectName, 'projectName', 'project_name');
      bindText(this.inputProcess, 'process', 'process');
      bindText(this.inputResponsible, 'responsible', 'responsible');
    }
  
    /**
     * Atualiza o valor exibido no input de um campo na aba "Campos"
     */
    updateFieldInputValue(fieldId, value) {
      if (!this.fieldsContainer) return;
      const row = this.fieldsContainer.querySelector(`[data-id="${fieldId}"]`);
      if (row) {
        const valInput = row.querySelector('.field-value-input');
        if (valInput && valInput !== document.activeElement) {
          valInput.value = value || '';
        }
      }
    }
  
    bindFileDropEvents() {
      const dropZone = this.previewContainer;
  
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        }, false);
      });
  
      ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
          dropZone.classList.add('drag-active');
        }, false);
      });
  
      ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
          dropZone.classList.remove('drag-active');
        }, false);
      });
  
      dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
          this.app.handleFileSelected(files[0]);
        }
      });
    }
  
    /**
     * Arraste interativo do carimbo diretamente sobre o Canvas
     */
    bindCanvasStampDrag() {
      const canvas = this.previewCanvas;
  
      const getCanvasCoords = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
  
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  
        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
        };
      };
  
      const onStart = (e) => {
        if (!this.tool.photo) return;
        const { x, y } = getCanvasCoords(e);
  
        if (this.engine.isPointInsideStamp(x, y)) {
          this.isDraggingStamp = true;
          this.dragStart = { x, y };
          this.stampStartPos = {
            x: this.engine.lastBounds.x,
            y: this.engine.lastBounds.y
          };
          canvas.style.cursor = 'grabbing';
          e.preventDefault();
        }
      };
  
      const onMove = (e) => {
        if (!this.tool.photo) return;
        const { x, y } = getCanvasCoords(e);
  
        if (this.isDraggingStamp) {
          const deltaX = x - this.dragStart.x;
          const deltaY = y - this.dragStart.y;
  
          const newX = this.stampStartPos.x + deltaX;
          const newY = this.stampStartPos.y + deltaY;
  
          this.tool.settings.position = STAMP_POSITIONS.CUSTOM;
          this.tool.settings.customPosX = Math.max(0, Math.min(1, newX / canvas.width));
          this.tool.settings.customPosY = Math.max(0, Math.min(1, newY / canvas.height));
  
          this.posButtons.forEach(b => b.classList.remove('active'));
          this.app.requestRender();
        } else {
          if (this.engine.isPointInsideStamp(x, y)) {
            canvas.style.cursor = 'grab';
          } else {
            canvas.style.cursor = 'default';
          }
        }
      };
  
      const onEnd = () => {
        if (this.isDraggingStamp) {
          this.isDraggingStamp = false;
          canvas.style.cursor = 'grab';
        }
      };
  
      canvas.addEventListener('mousedown', onStart);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
  
      canvas.addEventListener('touchstart', onStart, { passive: false });
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onEnd);
    }
  
    /**
     * Sincroniza todos os controles quando uma nova fotografia é carregada
     */
    syncPhotoState() {
      if (!this.tool.photo) {
        this.emptyPlaceholder.style.display = 'flex';
        this.previewCanvas.style.display = 'none';
        this.imageInfoBar.style.display = 'none';
        if (this.dragHintPill) this.dragHintPill.style.display = 'none';
        return;
      }
  
      this.emptyPlaceholder.style.display = 'none';
      this.previewCanvas.style.display = 'block';
      this.imageInfoBar.style.display = 'flex';
      if (this.dragHintPill) this.dragHintPill.style.display = 'block';
  
      const w = this.tool.photo.width;
      const h = this.tool.photo.height;
      const sizeMb = (this.tool.photo.fileSize / (1024 * 1024)).toFixed(2);
      this.photoMetaText.textContent = `${this.tool.photo.filename} • ${w} × ${h} px • ${sizeMb} MB`;
  
      // Sincroniza TODOS os inputs do painel direito com os dados da localização
      this.inputLat.value = this.tool.location.latitude !== null ? this.tool.location.latitude.toFixed(8) : '';
      this.inputLon.value = this.tool.location.longitude !== null ? this.tool.location.longitude.toFixed(8) : '';
      this.inputAlt.value = this.tool.location.altitude !== null ? this.tool.location.altitude.toFixed(1) : '';
      this.inputDate.value = this.tool.location.date || '';
      this.inputTime.value = this.tool.location.time || '';
      this.inputStreet.value = this.tool.location.street || '';
      this.inputNumber.value = this.tool.location.number || '';
      this.inputNeighborhood.value = this.tool.location.neighborhood || '';
      this.inputCity.value = this.tool.location.city || '';
      this.inputState.value = this.tool.location.state || '';
      this.inputCountry.value = this.tool.location.country || '';
      this.inputPostalCode.value = this.tool.location.postalCode || '';
      this.inputProjectName.value = this.tool.location.projectName || '';
      this.inputProcess.value = this.tool.location.process || '';
      this.inputResponsible.value = this.tool.location.responsible || '';
  
      // Alertas de Metadados
      const exif = this.tool.exif;
      if (exif && exif.hasGps) {
        this.alertNoGps.style.display = 'none';
      } else {
        this.alertNoGps.style.display = 'flex';
      }
  
      if (exif && exif.hasDate) {
        this.alertNoDate.style.display = 'none';
      } else {
        this.alertNoDate.style.display = 'flex';
      }
  
      if (exif && exif.hasGps && exif.hasDate) {
        this.alertMetaSuccess.style.display = 'flex';
      } else {
        this.alertMetaSuccess.style.display = 'none';
      }
  
      this.updateSourceBadges();
      this.renderFieldsList();
    }
  
    updateSourceBadges() {
      const updateBadge = (badgeElem, source) => {
        if (!badgeElem) return;
        badgeElem.textContent = source;
        badgeElem.className = `badge badge-${source.toLowerCase()}`;
      };
  
      updateBadge(this.badgeLat, this.tool.location.sources.latitude);
      updateBadge(this.badgeLon, this.tool.location.sources.longitude);
      updateBadge(this.badgeAlt, this.tool.location.sources.altitude);
      updateBadge(this.badgeDate, this.tool.location.sources.date);
      updateBadge(this.badgeTime, this.tool.location.sources.time);
    }
  
    renderPresetsList() {
      this.presetsSelect.innerHTML = '';
  
      // Modelos Padrão
      const groupModels = document.createElement('optgroup');
      groupModels.label = 'Modelos Padrão (Diretriz)';
      BUILT_IN_MODELS.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        groupModels.appendChild(opt);
      });
      this.presetsSelect.appendChild(groupModels);
  
      // Presets Especializados
      const groupPresets = document.createElement('optgroup');
      groupPresets.label = 'Presets por Atividade';
      PRESET_CATEGORIES.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        groupPresets.appendChild(opt);
      });
      this.presetsSelect.appendChild(groupPresets);
  
      // Presets do Usuário
      const userPresets = storage.getCustomPresets();
      if (userPresets.length > 0) {
        const groupUser = document.createElement('optgroup');
        groupUser.label = 'Meus Modelos Salvos';
        userPresets.forEach(u => {
          const opt = document.createElement('option');
          opt.value = u.id;
          opt.textContent = u.name;
          groupUser.appendChild(opt);
        });
        this.presetsSelect.appendChild(groupUser);
      }
  
      this.presetsSelect.value = this.tool.selectedModelId;
    }
  
    loadSelectedPreset(presetId) {
      const model = BUILT_IN_MODELS.find(m => m.id === presetId);
      if (model) {
        this.tool.applyModel(model);
        this.syncControlsWithSettings();
        this.renderFieldsList();
        this.app.requestRender();
        return;
      }
  
      const cat = PRESET_CATEGORIES.find(c => c.id === presetId);
      if (cat) {
        const baseModel = BUILT_IN_MODELS.find(m => m.id === cat.baseModelId) || BUILT_IN_MODELS[0];
        this.tool.applyModel(baseModel);
        this.tool.selectedModelId = cat.id;
  
        if (cat.enabledFields) {
          for (const f of this.tool.activeFields) {
            f.enabled = cat.enabledFields.includes(f.id);
          }
        }
  
        if (cat.fieldDefaults) {
          for (const [k, v] of Object.entries(cat.fieldDefaults)) {
            this.tool.setFieldValue(k, v);
          }
        }
  
        this.syncControlsWithSettings();
        this.renderFieldsList();
        this.app.requestRender();
        return;
      }
  
      const userPresets = storage.getCustomPresets();
      const userPreset = userPresets.find(u => u.id === presetId);
      if (userPreset) {
        this.tool.applyModel(userPreset);
        this.syncControlsWithSettings();
        this.renderFieldsList();
        this.app.requestRender();
      }
    }
  
    syncControlsWithSettings() {
      const s = this.tool.settings;
  
      this.posButtons.forEach(b => {
        b.classList.toggle('active', b.dataset.pos === s.position);
      });
  
      this.selectCoordFormat.value = s.coordFormat || COORD_FORMATS.DECIMAL_CARDINAL;
      this.selectDateFormat.value = s.dateFormat || DATE_FORMATS.BR;
      this.selectTimeFormat.value = s.timeFormat || TIME_FORMATS.FULL;
      this.selectFontFamily.value = s.fontFamily || 'Inter';
      this.rangeFontSize.value = s.fontSize || 20;
      this.valFontSize.textContent = `${s.fontSize || 20}px`;
      this.colorText.value = s.textColor || '#FFFFFF';
      this.colorBg.value = s.backgroundColor || '#0F172A';
      this.selectBgType.value = s.backgroundType || 'semitransparent';
      this.rangeBgOpacity.value = s.backgroundOpacity || 85;
      this.valBgOpacity.textContent = `${s.backgroundOpacity || 85}%`;
      this.selectBorderWidth.value = String(s.borderWidth || 0);
      this.colorBorder.value = s.borderColor || '#3B82F6';
      this.rangeBorderRadius.value = s.borderRadius || 8;
      this.valBorderRadius.textContent = `${s.borderRadius || 8}px`;
      this.checkShadow.checked = !!s.hasShadow;
      this.checkBold.checked = s.fontWeight === '700';
      this.checkItalic.checked = !!s.isItalic;
      this.selectTextAlign.value = s.textAlign || 'left';
      if (this.selectLabelMode) this.selectLabelMode.value = s.labelMode || 'icons';
      if (this.selectInlineLayout) this.selectInlineLayout.value = s.inlineLayout || 'multiline';
    }
  
    /**
     * Renderiza a lista de campos no painel esquerdo:
     * Cada campo possui:
     * - Checkbox de ativar/desativar
     * - Rótulo editável
     * - Valor editável diretamente na linha com sincronização bidirecional
     * - Botão de mostrar/ocultar rótulo (🏷️)
     * - Botões de reordenação (↑ e ↓)
     * - Botão de excluir se for campo customizado
     */
    renderFieldsList() {
      this.fieldsContainer.innerHTML = '';
  
      this.tool.activeFields.forEach((field, index) => {
        const row = document.createElement('div');
        row.className = `field-item ${field.enabled ? 'enabled' : 'disabled'}`;
        row.dataset.id = field.id;
  
        // 1. Checkbox de ativação/desativação
        const check = document.createElement('input');
        check.type = 'checkbox';
        check.className = 'field-checkbox';
        check.checked = field.enabled;
        check.title = 'Ativar/desativar campo no carimbo';
        check.addEventListener('change', (e) => {
          field.enabled = e.target.checked;
          row.classList.toggle('enabled', field.enabled);
          row.classList.toggle('disabled', !field.enabled);
          this.app.requestRender();
        });
  
        // 2. Rótulo / Nome do campo (editável)
        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.className = 'field-label-input';
        labelInput.value = field.label;
        labelInput.title = 'Rótulo exibido no carimbo (ex: DATA, LOCAL, OBRA)';
        labelInput.addEventListener('input', (e) => {
          field.label = e.target.value;
          this.app.requestRender();
        });
  
        // 3. Valor do campo (EDITÁVEL para todos os campos!)
        const currentVal = this.tool.getFieldValue(field.id, field);
        const def = STANDARD_FIELD_DEFS.find(d => d.id === field.id);
        const placeholderText = def ? def.placeholder : 'Valor...';
  
        const valInput = document.createElement('input');
        valInput.type = 'text';
        valInput.className = 'field-value-input';
        valInput.value = currentVal || '';
        valInput.placeholder = placeholderText;
        valInput.title = 'Editar valor do campo diretamente';
  
        valInput.addEventListener('input', (e) => {
          const newVal = e.target.value;
          this.tool.setFieldValue(field.id, newVal);
  
          // Sincroniza com os inputs correspondentes no painel direito se existirem
          this.syncRightPanelInput(field.id, newVal);
  
          // Se o campo estiver desmarcado mas o usuário digitou, pode continuar ou manter o estado
          this.app.requestRender();
        });
  
        // 4. Ações: Rótulo Visível, Mover Cima, Mover Baixo, Excluir
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'field-actions';
  
        const toggleLabelBtn = document.createElement('button');
        toggleLabelBtn.type = 'button';
        toggleLabelBtn.className = `btn-icon ${field.showLabel ? 'active' : ''}`;
        toggleLabelBtn.title = field.showLabel ? 'Rótulo visível no carimbo' : 'Rótulo oculto (apenas o valor)';
        toggleLabelBtn.innerHTML = '<svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
        toggleLabelBtn.addEventListener('click', () => {
          field.showLabel = !field.showLabel;
          toggleLabelBtn.classList.toggle('active', field.showLabel);
          this.app.requestRender();
        });
  
        const btnUp = document.createElement('button');
        btnUp.type = 'button';
        btnUp.className = 'btn-icon';
        btnUp.innerHTML = '<svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
        btnUp.title = 'Mover campo para cima';
        btnUp.disabled = index === 0;
        btnUp.addEventListener('click', () => {
          this.tool.moveField(field.id, 'up');
          this.renderFieldsList();
          this.app.requestRender();
        });
  
        const btnDown = document.createElement('button');
        btnDown.type = 'button';
        btnDown.className = 'btn-icon';
        btnDown.innerHTML = '<svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
        btnDown.title = 'Mover campo para baixo';
        btnDown.disabled = index === this.tool.activeFields.length - 1;
        btnDown.addEventListener('click', () => {
          this.tool.moveField(field.id, 'down');
          this.renderFieldsList();
          this.app.requestRender();
        });
  
        actionsDiv.appendChild(toggleLabelBtn);
        actionsDiv.appendChild(btnUp);
        actionsDiv.appendChild(btnDown);
  
        if (field.isCustom) {
          const btnDelete = document.createElement('button');
          btnDelete.type = 'button';
          btnDelete.className = 'btn-icon btn-delete';
          btnDelete.innerHTML = '<svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
          btnDelete.title = 'Remover campo personalizado';
          btnDelete.addEventListener('click', () => {
            this.tool.removeField(field.id);
            this.renderFieldsList();
            this.app.requestRender();
          });
          actionsDiv.appendChild(btnDelete);
        }
  
        // 1.5. Ícone inline do campo (formato line-art)
        const iconTag = document.createElement('span');
        iconTag.className = 'field-icon-tag';
        iconTag.innerHTML = getLineArtSvg(field.icon || field.id);
        iconTag.title = 'Ícone line art do campo exibido no carimbo';
  
        row.appendChild(check);
        row.appendChild(iconTag);
        row.appendChild(labelInput);
        row.appendChild(valInput);
        row.appendChild(actionsDiv);
  
        this.fieldsContainer.appendChild(row);
      });
    }
  
    /**
     * Sincroniza do painel esquerdo para o painel direito
     */
    syncRightPanelInput(fieldId, value) {
      const inputMap = {
        'date': this.inputDate,
        'time': this.inputTime,
        'lat': this.inputLat,
        'lon': this.inputLon,
        'altitude': this.inputAlt,
        'street': this.inputStreet,
        'number': this.inputNumber,
        'neighborhood': this.inputNeighborhood,
        'city': this.inputCity,
        'state': this.inputState,
        'country': this.inputCountry,
        'postal_code': this.inputPostalCode,
        'project_name': this.inputProjectName,
        'process': this.inputProcess,
        'responsible': this.inputResponsible
      };
  
      const targetInput = inputMap[fieldId];
      if (targetInput && targetInput !== document.activeElement) {
        targetInput.value = value;
      }
  
      this.updateSourceBadges();
    }
  }
  
  // --- Fim de js/tools/stamp-camera/ui.js ---

  // --- Início de js/main.js ---
  /**
   * STAMP-CAMERA - Ponto de Entrada Principal (Main Application Entry)
   * Orquestra o ciclo de vida, temas, carregamento de imagens,
   * renderização reativa e exportação.
   */
  
  
  
  
  
  
  
  
  
  class StampCameraApp {
    constructor() {
      this.tool = new StampCameraTool();
      this.engine = new StampEngine();
      this.ui = null;
      this.renderScheduled = false;
  
      this.init();
    }
  
    init() {
      // 1. Inicializa o tema salvo ou padrão escuro
      this.initTheme();
  
      // 2. Inicializa o idioma
      this.initLanguage();
  
      // 3. Inicializa UI e escutas
      this.ui = new StampCameraUI(this.tool, this.engine, this);
  
      // 4. Conecta eventos globais
      this.bindGlobalEvents();
  
      console.log('[STAMP-CAMERA] Sistema inicializado com sucesso. 100% Client-Side.');
    }
  
    initTheme() {
      const savedTheme = storage.getTheme();
      document.documentElement.setAttribute('data-theme', savedTheme);
  
      const themeToggleBtn = document.getElementById('themeToggleBtn');
      if (themeToggleBtn) {
        const sunSvg = `<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
        const moonSvg = `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  
        themeToggleBtn.innerHTML = savedTheme === 'dark' ? sunSvg : moonSvg;
        themeToggleBtn.title = savedTheme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro';
        themeToggleBtn.addEventListener('click', () => {
          const current = document.documentElement.getAttribute('data-theme');
          const next = current === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          storage.setTheme(next);
          themeToggleBtn.innerHTML = next === 'dark' ? sunSvg : moonSvg;
          themeToggleBtn.title = next === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro';
        });
      }
    }
  
    initLanguage() {
      const savedLang = storage.getLanguage();
      setLanguage(savedLang);
      const langSelect = document.getElementById('langSelect');
      if (langSelect) {
        langSelect.value = savedLang;
        langSelect.addEventListener('change', (e) => {
          storage.setLanguage(e.target.value);
          setLanguage(e.target.value);
          // Atualiza interface se necessário
        });
      }
    }
  
    bindGlobalEvents() {
      // Botão "Abrir Fotografia"
      const btnOpen = document.getElementById('btnOpenPhoto');
      const fileInput = document.getElementById('fileInput');
      const btnDropOpen = document.getElementById('btnDropOpen');
  
      if (btnOpen && fileInput) {
        btnOpen.addEventListener('click', () => fileInput.click());
      }
      if (btnDropOpen && fileInput) {
        btnDropOpen.addEventListener('click', () => fileInput.click());
      }
  
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            this.handleFileSelected(e.target.files[0]);
          }
        });
      }
  
      // Botões de Demonstração (Permitem testar imediatamente com um clique)
      const btnDemoWithGps = document.getElementById('btnDemoWithGps');
      if (btnDemoWithGps) {
        btnDemoWithGps.addEventListener('click', async () => {
          await this.loadDemoPhoto('with_gps');
        });
      }
  
      const btnDemoWithoutGps = document.getElementById('btnDemoWithoutGps');
      if (btnDemoWithoutGps) {
        btnDemoWithoutGps.addEventListener('click', async () => {
          await this.loadDemoPhoto('without_gps');
        });
      }
  
      // Botão Limpar / Resetar
      const btnClearWorkspace = document.getElementById('btnClearWorkspace');
      if (btnClearWorkspace) {
        btnClearWorkspace.addEventListener('click', () => this.handleClear());
      }
  
      const btnClearPhoto = document.getElementById('btnClearPhoto');
      if (btnClearPhoto) {
        btnClearPhoto.addEventListener('click', () => this.handleClear());
      }
  
      // Botão de Busca Automática de Endereço pelas Coordenadas
      const btnAutoGeocode = document.getElementById('btnAutoGeocode');
      if (btnAutoGeocode) {
        btnAutoGeocode.addEventListener('click', () => this.handleAutoGeocode());
      }
  
      // Botão de Exportação
      const btnExport = document.getElementById('btnExport');
      if (btnExport) {
        btnExport.addEventListener('click', () => this.handleExport());
      }
  
      // Redimensionamento de janela (atualiza preview se necessário)
      window.addEventListener('resize', () => {
        this.requestRender();
      });
    }
  
    async handleFileSelected(file) {
      try {
        this.showLoading(true);
        const photoData = await loadImageFromFile(file);
        this.tool.loadPhotoData(photoData);
  
        // Busca automática de cidade, estado e país se houver GPS
        await this.tool.autoResolveLocation();
  
        this.ui.syncPhotoState();
        this.requestRender();
  
        if (this.tool.location.city || this.tool.location.state) {
          const locStr = [this.tool.location.city, this.tool.location.state, this.tool.location.country].filter(Boolean).join(', ');
          this.showToast(`Localização identificada: ${locStr}`);
        }
      } catch (err) {
        alert(`Erro ao processar fotografia: ${err.message}`);
      } finally {
        this.showLoading(false);
      }
    }
  
    async loadDemoPhoto(type = 'with_gps') {
      try {
        this.showLoading(true);
        const demoData = await createDemoImage(type);
        this.tool.loadPhotoData(demoData);
  
        // Busca automática de cidade, estado e país se houver GPS
        await this.tool.autoResolveLocation();
  
        this.ui.syncPhotoState();
        this.requestRender();
  
        if (this.tool.location.city || this.tool.location.state) {
          const locStr = [this.tool.location.city, this.tool.location.state, this.tool.location.country].filter(Boolean).join(', ');
          this.showToast(`Localização identificada: ${locStr}`);
        }
      } catch (err) {
        console.error('Erro ao gerar foto de demonstração:', err);
      } finally {
        this.showLoading(false);
      }
    }
  
    handleClear() {
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.value = '';
  
      this.tool.clearWorkspace();
      this.ui.syncPhotoState();
      this.requestRender();
      this.showToast('Área de trabalho limpa.');
    }
  
    async handleAutoGeocode() {
      if (this.tool.location.latitude === null || this.tool.location.longitude === null) {
        this.showToast('Insira coordenadas de latitude e longitude primeiro.');
        return;
      }
  
      this.showLoading(true);
      try {
        const geo = await this.tool.autoResolveLocation();
        this.ui.syncPhotoState();
        this.requestRender();
  
        if (geo && (geo.city || geo.state)) {
          const locStr = [geo.city, geo.state, geo.country].filter(Boolean).join(', ');
          this.showToast(`Localização identificada: ${locStr}`);
        } else {
          this.showToast('Coordenadas válidas, mas localidade não mapeada.');
        }
      } finally {
        this.showLoading(false);
      }
    }
  
    /**
     * Solicita nova renderização usando requestAnimationFrame para alto desempenho
     */
    requestRender() {
      if (this.renderScheduled) return;
      this.renderScheduled = true;
  
      requestAnimationFrame(() => {
        this.renderScheduled = false;
        this.render();
      });
    }
  
    render() {
      if (!this.tool.photo || !this.ui.previewCanvas) return;
  
      const canvas = this.ui.previewCanvas;
      const source = this.tool.photo.canvas;
      const lines = this.tool.getStampRenderLines();
      const settings = this.tool.settings;
  
      this.engine.render(canvas, source, lines, settings, false);
    }
  
    async handleExport() {
      if (!this.tool.photo) {
        alert('Selecione ou carregue uma fotografia antes de exportar.');
        return;
      }
  
      try {
        const btnExport = document.getElementById('btnExport');
        const originalHtml = btnExport.innerHTML;
        btnExport.innerHTML = `<svg class="svg-icon" style="animation: spin 0.7s linear infinite;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg><span>Gerando...</span>`;
        btnExport.disabled = true;
  
        // Criar canvas de alta resolução 1:1 para exportação sem perda de qualidade
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.tool.photo.width;
        exportCanvas.height = this.tool.photo.height;
  
        const lines = this.tool.getStampRenderLines();
        const settings = this.tool.settings;
  
        // Renderiza resolução nativa
        this.engine.render(exportCanvas, this.tool.photo.canvas, lines, settings, true);
  
        // Determina formato e qualidade
        const formatSelect = document.getElementById('selectExportFormat');
        const qualityRange = document.getElementById('rangeExportQuality');
  
        const mimeType = formatSelect ? formatSelect.value : 'image/jpeg';
        const quality = qualityRange ? parseFloat(qualityRange.value) : 0.95;
  
        const filename = await exportStampedPhoto(
          exportCanvas,
          this.tool.photo.filename,
          mimeType,
          quality
        );
  
        btnExport.innerHTML = originalHtml;
        btnExport.disabled = false;
  
        // Mensagem visual de sucesso
        this.showToast(`Fotografia exportada: ${filename}`);
      } catch (err) {
        const btnExport = document.getElementById('btnExport');
        if (btnExport) {
          btnExport.innerHTML = `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Exportar Foto</span>`;
          btnExport.disabled = false;
        }
        alert(`Falha ao exportar imagem: ${err.message}`);
      }
    }
  
    showToast(msg) {
      let toast = document.getElementById('appToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('visible');
      setTimeout(() => {
        toast.classList.remove('visible');
      }, 3500);
    }
  
    showLoading(isLoading) {
      const loader = document.getElementById('loadingIndicator');
      if (loader) {
        loader.style.display = isLoading ? 'flex' : 'none';
      }
    }
  }
  
  // Inicia aplicação após DOM pronto
  document.addEventListener('DOMContentLoaded', () => {
    window.stampCameraApp = new StampCameraApp();
  });
  
  // --- Fim de js/main.js ---

})();
