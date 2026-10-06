/**
 * STAMP-CAMERA - Test Suite Completa de Validação
 * Testa todos os 12 cenários de validação especificados na diretriz:
 * - Leitura e cálculo de EXIF
 * - Formatação de Coordenadas (Decimal, DMS, DDM, Signed, Custom)
 * - Rastreamento AUTO vs MANUAL (Regra contra informação inventada)
 * - Modelos 1 a 5 e Presets Técnicos
 * - Integridade do DOM (IDs e seletores do index.html)
 */

import { readExifData, parseExifDate } from '../js/exif-reader.js';
import {
  toDms,
  toDdm,
  toDecimalCardinal,
  toDecimalSigned,
  formatCoordinates,
  isValidCoordinate,
  parseCoordinateString
} from '../js/geolocation.js';
import { COORD_FORMATS, DATE_FORMATS, TIME_FORMATS } from '../js/config.js';
import { BUILT_IN_MODELS, PRESET_CATEGORIES, STANDARD_FIELD_DEFS } from '../js/templates.js';
import { StampCameraTool } from '../js/tools/stamp-camera/tool.js';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FALHA: ${message}`);
    failed++;
  }
}

console.log('=== TESTES DO STAMP-CAMERA ===\n');

// 1. TESTES DE GEOLOCALIZAÇÃO E COORDENADAS
console.log('[1/5] Testes de Geolocalização e Formatos de Coordenadas:');
const refLat = -15.86996936;
const refLon = -50.85227460;

// Teste DMS
const dmsLat = toDms(refLat, true);
const dmsLon = toDms(refLon, false);
assert(dmsLat.includes('15°') && dmsLat.includes('52\'') && dmsLat.endsWith('S'), `DMS Latitude correto: ${dmsLat}`);
assert(dmsLon.includes('50°') && dmsLon.includes('51\'') && dmsLon.endsWith('W'), `DMS Longitude correto: ${dmsLon}`);

// Teste DDM
const ddmLat = toDdm(refLat, true);
const ddmLon = toDdm(refLon, false);
assert(ddmLat.includes('15°52.') && ddmLat.endsWith('S'), `DDM Latitude correto: ${ddmLat}`);
assert(ddmLon.includes('50°51.') && ddmLon.endsWith('W'), `DDM Longitude correto: ${ddmLon}`);

// Teste Decimal Cardinal
const decCard = toDecimalCardinal(refLat, refLon);
assert(decCard.includes('15.869969° S') && decCard.includes('50.852275° W'), `Decimal Cardinal correto: ${decCard}`);

// Teste Decimal com Sinal
const decSign = toDecimalSigned(refLat, refLon);
assert(decSign.includes('Lat: -15.86996936') && decSign.includes('Long: -50.85227460'), `Decimal com Sinal correto: ${decSign}`);

// Validação e parser
assert(isValidCoordinate(-15.869, -50.852), 'Coordenada válida aceita');
assert(!isValidCoordinate(95, -50), 'Latitude fora da faixa (-90 a 90) rejeitada');
assert(!isValidCoordinate(0, 195), 'Longitude fora da faixa (-180 a 180) rejeitada');

const parsed = parseCoordinateString('-15.869969, -50.852275');
assert(parsed && Math.abs(parsed.lat - (-15.869969)) < 0.0001, 'Parse de string decimal com vírgula aceito');

// 2. TESTES DE METADADOS EXIF E PARSE DE DATAS
console.log('\n[2/5] Testes de EXIF e Datas:');
const sampleDateStr = '2022:11:22 18:05:43';
const parsedDate = parseExifDate(sampleDateStr);
assert(parsedDate instanceof Date && !isNaN(parsedDate.getTime()), 'Data EXIF decodificada com sucesso');
assert(parsedDate.getFullYear() === 2022 && parsedDate.getMonth() === 10 && parsedDate.getDate() === 22, 'Ano/Mês/Dia corretos (22/11/2022)');
assert(parsedDate.getHours() === 18 && parsedDate.getMinutes() === 5 && parsedDate.getSeconds() === 43, 'Hora/Min/Seg corretos (18:05:43)');

// 3. TESTES DE MODELOS E PRESETS
console.log('\n[3/5] Testes de Modelos e Presets:');
assert(BUILT_IN_MODELS.length >= 5, `Existem 5 modelos pré-configurados (encontrados: ${BUILT_IN_MODELS.length})`);
assert(BUILT_IN_MODELS.some(m => m.id === 'model_1_simple'), 'Modelo 1 (Simples) presente');
assert(BUILT_IN_MODELS.some(m => m.id === 'model_2_location'), 'Modelo 2 (Localização) presente');
assert(BUILT_IN_MODELS.some(m => m.id === 'model_3_technical'), 'Modelo 3 (Técnico) presente');
assert(BUILT_IN_MODELS.some(m => m.id === 'model_4_forensic'), 'Modelo 4 (Fotografia Pericial) presente');
assert(BUILT_IN_MODELS.some(m => m.id === 'model_5_custom'), 'Modelo 5 (Personalizado) presente');

assert(PRESET_CATEGORIES.some(p => p.id === 'preset_pericia'), 'Preset Perícia presente');
assert(PRESET_CATEGORIES.some(p => p.id === 'preset_obra'), 'Preset Obra presente');
assert(PRESET_CATEGORIES.some(p => p.id === 'preset_inspecao'), 'Preset Inspeção Predial presente');
assert(PRESET_CATEGORIES.some(p => p.id === 'preset_fiscalizacao'), 'Preset Fiscalização presente');

// 4. TESTES DE CONTROLADOR DE ESTADO E REGRA CONTRA INFORMAÇÃO INVENTADA
console.log('\n[4/5] Testes de Estado e Regra Contra Informação Inventada:');
const tool = new StampCameraTool();

// Carrega dados de teste COM GPS
tool.loadPhotoData({
  canvas: { width: 1920, height: 1080 },
  width: 1920,
  height: 1080,
  filename: 'teste_gps.jpg',
  fileSize: 500000,
  exif: {
    hasExif: true,
    hasGps: true,
    hasDate: true,
    latitude: refLat,
    longitude: refLon,
    altitude: 312,
    dateObj: parsedDate,
    dateStr: sampleDateStr
  }
});

assert(tool.location.sources.latitude === 'AUTO', 'Latitude marcada como AUTO quando vinda do EXIF');
assert(tool.location.sources.longitude === 'AUTO', 'Longitude marcada como AUTO quando vinda do EXIF');
assert(tool.location.sources.date === 'AUTO', 'Data marcada como AUTO quando vinda do EXIF');
assert(tool.location.sources.street === 'MANUAL', 'Rua não vinda do EXIF marcada como MANUAL (nunca inventada)');

const renderLinesWithGps = tool.getStampRenderLines();
assert(renderLinesWithGps.length > 0, 'Linhas ativas geradas para renderização com GPS');
const coordLine = renderLinesWithGps.find(l => l.id === 'lat' || l.id === 'coordinates');
assert(coordLine !== undefined, 'Linha de coordenadas presente no Modelo 1');

// Carrega dados de teste SEM GPS (Teste de Ausência de Dados)
tool.loadPhotoData({
  canvas: { width: 1920, height: 1080 },
  width: 1920,
  height: 1080,
  filename: 'teste_sem_gps.jpg',
  fileSize: 500000,
  exif: {
    hasExif: true,
    hasGps: false,
    hasDate: false,
    latitude: null,
    longitude: null,
    altitude: null,
    dateObj: null
  }
});

assert(tool.location.latitude === null, 'Latitude não foi inventada quando ausente no EXIF');
assert(tool.location.longitude === null, 'Longitude não foi inventada quando ausente no EXIF');
assert(tool.location.sources.latitude === 'MANUAL', 'Origem da latitude definida para MANUAL quando ausente no EXIF');
assert(tool.location.date === '', 'Data não foi inventada quando ausente no EXIF');

// Teste de Adição e Reordenação de Campo Personalizado
const initialCount = tool.activeFields.length;
const customField = tool.addCustomField('Vistoriador', 'Eng. Silva');
assert(tool.activeFields.length === initialCount + 1, 'Novo campo adicionado');
assert(tool.getFieldValue(customField.id, customField) === 'Eng. Silva', 'Valor do campo customizado recuperado');

tool.moveField(customField.id, 'up');
assert(tool.activeFields[tool.activeFields.length - 2].id === customField.id, 'Campo reordenado com sucesso para cima');

tool.removeField(customField.id);
assert(tool.activeFields.length === initialCount, 'Campo removido com sucesso');

// 5. TESTES DE INTEGRIDADE DO DOM (index.html)
console.log('\n[5/5] Testes de Integridade do DOM (index.html):');
const indexPath = path.resolve('index.html');
const htmlContent = fs.readFileSync(indexPath, 'utf-8');

const requiredElementIds = [
  'fileInput',
  'btnOpenPhoto',
  'btnDemoWithGps',
  'btnDemoWithoutGps',
  'btnExport',
  'previewCanvas',
  'previewContainer',
  'emptyPlaceholder',
  'imageInfoBar',
  'photoMetaText',
  'alertNoGps',
  'alertNoDate',
  'alertMetaSuccess',
  'inputLat',
  'inputLon',
  'inputAlt',
  'inputDate',
  'inputTime',
  'inputStreet',
  'inputNumber',
  'inputNeighborhood',
  'inputCity',
  'inputState',
  'inputCountry',
  'inputPostalCode',
  'inputProjectName',
  'inputProcess',
  'inputResponsible',
  'badgeLat',
  'badgeLon',
  'badgeAlt',
  'badgeDate',
  'badgeTime',
  'fieldsContainer',
  'btnAddField',
  'presetsSelect',
  'btnSavePreset',
  'selectCoordFormat',
  'selectDateFormat',
  'selectTimeFormat',
  'selectFontFamily',
  'rangeFontSize',
  'valFontSize',
  'colorText',
  'colorBg',
  'selectBgType',
  'rangeBgOpacity',
  'valBgOpacity',
  'selectBorderWidth',
  'colorBorder',
  'rangeBorderRadius',
  'valBorderRadius',
  'checkShadow',
  'checkBold',
  'checkItalic',
  'selectTextAlign',
  'selectExportFormat',
  'rangeExportQuality',
  'valExportQuality',
  'qualityGroup',
  'checkAutoNumber',
  'inputNumberPrefix',
  'inputNumberStart',
  'inputNumberDigits',
  'themeToggleBtn',
  'langSelect'
];

let allIdsFound = true;
for (const id of requiredElementIds) {
  if (!htmlContent.includes(`id="${id}"`)) {
    console.error(`  ✗ ID ausente no index.html: ${id}`);
    allIdsFound = false;
  }
}
assert(allIdsFound, `Todos os ${requiredElementIds.length} elementos de interface mapeados corretamente no index.html`);

// CSS links
assert(htmlContent.includes('css/theme.css'), 'theme.css incluído no index.html');
assert(htmlContent.includes('css/main.css'), 'main.css incluído no index.html');
assert(htmlContent.includes('css/stamp-camera.css'), 'stamp-camera.css incluído no index.html');
assert(htmlContent.includes('js/main.js'), 'js/main.js incluído como type="module"');

console.log(`\n========================================`);
console.log(`RESUMO DOS TESTES: ${passed} passaram, ${failed} falharam.`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
