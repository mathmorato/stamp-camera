/**
 * STAMP-CAMERA - Configurações Gerais e Constantes
 * Versão: 1.0.0
 * 100% Client-side - Nenhuma informação é enviada para servidores externos.
 */

export const PNITE_VERSION = "v.1.1.9";

export const APP_CONFIG = {
  name: 'STAMP-CAMERA',
  subtitle: 'Carimbo técnico e geográfico para fotografias',
  version: PNITE_VERSION,
  defaultLanguage: 'pt-BR',
  supportedLanguages: ['pt-BR', 'en', 'es'],
  defaultTheme: 'dark',
};

export const COORD_FORMATS = {
  DECIMAL_CARDINAL: 'decimal_cardinal', // 15.869969° S, 50.852275° W
  DMS: 'dms',                           // 15°52'11.89"S, 50°51'08.19"W
  DDM: 'ddm',                           // 15°52.198'S, 50°51.136'W
  DECIMAL_SIGNED: 'decimal_signed',     // Lat: -15.86996936, Long: -50.85227460
  CUSTOM: 'custom'                      // Formato customizável
};

export const DATE_FORMATS = {
  BR: 'pt-BR',                          // 22/11/2022
  ISO: 'iso',                           // 2022-11-22
  TEXTUAL: 'textual'                    // 22 de novembro de 2022
};

export const TIME_FORMATS = {
  FULL: 'full',                         // 18:05:43
  NO_SECONDS: 'no_seconds',             // 18:05
  DATE_TIME: 'date_time'                // 22/11/2022 18:05:43
};

export const STAMP_POSITIONS = {
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

export const LABEL_MODES = {
  ICONS: 'icons',      // Somente ícones line art (ex: data, hora, coordenadas)
  TEXT: 'text',        // Rótulos de texto (ex: Coordenadas: -15.8699, Data: 22/11/2022)
  NONE: 'none'         // Sem rótulos ou ícones (apenas os valores)
};

export const STAMP_LAYOUTS = {
  MULTILINE: 'multiline',      // Múltiplas linhas (ícone + valor por linha)
  SINGLE_LINE: 'single_line'   // Linha única inline contínua separada por ' • '
};

export const LINE_ART_PATHS = {
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
  address_neighborhood: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10 M19 13v7 M15 13h4',
  neighborhood: 'M2 20h20 M4 20V8l6-4v16 M10 20V10l6-4v14 M16 20V6l4-2v16',
  locality: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  city: 'M2 20h20 M3 20V10h5v10 M8 20V4h8v16 M16 20v-8h5v8',
  state: 'M1 6v14l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v14 M16 6v14',
  country: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 0 20 M12 2a15.3 15.3 0 0 0 0 20',
  city_state_country: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  postal_code: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6',
  project_name: 'M2 22h20 M12 2v20 M12 5H6l-4 7h10 M12 5h6l4 7H12',
  report_num: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z M9 12h6 M9 16h4',
  custom_text: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  default: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'
};

export const EMOJI_TO_LINE_ART = {
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
  '🏡': 'address_neighborhood',
  '🏘️': 'neighborhood',
  '📌': 'locality',
  '🏙️': 'city',
  '🗺️': 'state',
  '🌍': 'country',
  '📮': 'postal_code',
  '🏗️': 'project_name',
  '📋': 'report_num',
  '📝': 'custom_text'
};

export function getLineArtPath(iconOrFieldId) {
  if (!iconOrFieldId) return LINE_ART_PATHS.default;
  if (LINE_ART_PATHS[iconOrFieldId]) return LINE_ART_PATHS[iconOrFieldId];
  if (EMOJI_TO_LINE_ART[iconOrFieldId]) return LINE_ART_PATHS[EMOJI_TO_LINE_ART[iconOrFieldId]];
  return LINE_ART_PATHS.default;
}

export function getLineArtSvg(iconOrFieldId, className = 'svg-icon-sm') {
  const pathD = getLineArtPath(iconOrFieldId);
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="${pathD}"/></svg>`;
}

export const FIELD_ICONS = {
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
  address_neighborhood: 'address_neighborhood',
  neighborhood: 'neighborhood',
  locality: 'locality',
  city: 'city',
  state: 'state',
  country: 'country',
  city_state_country: 'city_state_country',
  postal_code: 'postal_code',
  project_name: 'project_name',
  report_num: 'report_num',
  custom_text: 'custom_text'
};

export const DEFAULT_STAMP_SETTINGS = {
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
  labelMode: LABEL_MODES.ICONS,          // Padrão: Somente ícones line art!
  inlineLayout: STAMP_LAYOUTS.MULTILINE,  // 'multiline' ou 'single_line'
  inlineSeparator: ' • ',
  showOriginStampBadge: false,           // Exibe [EXIF] / [MANUAL] no carimbo
  preserveExif: true                     // Preserva/reinjeta EXIF na exportação JPEG
};

export const DEFAULT_NUMBERING = {
  enabled: false,
  prefix: 'FOTOGRAFIA ',
  suffix: '',
  startNumber: 1,
  digits: 2
};
