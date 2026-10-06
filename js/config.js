/**
 * STAMP-CAMERA - Configurações Gerais e Constantes
 * Versão: 1.0.0
 * 100% Client-side - Nenhuma informação é enviada para servidores externos.
 */

export const APP_CONFIG = {
  name: 'STAMP-CAMERA',
  subtitle: 'Carimbo técnico e geográfico para fotografias',
  version: '1.0.0',
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
  customCoordTemplate: '{lat}, {lon}'
};

export const DEFAULT_NUMBERING = {
  enabled: false,
  prefix: 'FOTOGRAFIA ',
  suffix: '',
  startNumber: 1,
  digits: 2
};
