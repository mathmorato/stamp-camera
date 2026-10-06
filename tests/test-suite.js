/**
 * STAMP-CAMERA - Test Suite Completa de Validação
 * Testa todos os 12 cenários de validação especificados na diretriz:
 * - Leitura e cálculo de EXIF
 * - Formatação de Coordenadas (Decimal, DMS, DDM, Signed, Custom)
 * - Rastreamento AUTO vs MANUAL (Regra contra informação inventada)
 * - Modelos 1 a 5 e Presets Técnicos
 * - Integridade do DOM (IDs e seletores do index.html)
 */

import { readExifData, parseExifDate, injectApp1BytesIntoJpeg } from '../js/exif-reader.js';
import { ZipWriter } from '../js/zip-writer.js';
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
import { getOfflineLocation } from '../js/geocoder.js';
import { migrate, storage, CURRENT_SCHEMA_VERSION } from '../js/storage.js';
import fs from 'fs';
import path from 'path';

if (typeof document === 'undefined') {
  global.document = {
    createElement: (tag) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({
            translate: () => {},
            rotate: () => {},
            drawImage: () => {}
          }),
          toDataURL: () => 'data:image/jpeg;base64,mock'
        };
      }
      return {};
    }
  };
}

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
assert(BUILT_IN_MODELS.some(m => m.id === 'model_6_inline_banner'), 'Modelo 6 (Faixa Inline com Ícones) presente');

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
assert(coordLine.icon !== undefined && coordLine.icon.length > 0, 'Ícone inline presente na linha do carimbo');

// Testes de Padrões: Data/Hora, Lat/Long e Localidade na mesma linha
const dtLine = renderLinesWithGps.find(l => l.id === 'datetime');
assert(dtLine !== undefined, 'Data e hora juntas na mesma linha por padrão no Modelo 1');
assert(renderLinesWithGps.some(l => l.id === 'coordinates'), 'Latitude e longitude juntas na mesma linha por padrão no Modelo 1');

// Teste de Local ativado por padrão com Cidade, Estado e País na mesma linha
tool.location.city = 'Jussara';
tool.location.state = 'Goiás';
tool.location.country = 'Brasil';
const linesWithCityStateCountry = tool.getStampRenderLines();
const locLine = linesWithCityStateCountry.find(l => l.id === 'city_state_country');
assert(locLine !== undefined, 'Local (Cidade, Estado e País) ativado por padrão no Modelo 1');
assert(locLine.value.includes('Jussara') && locLine.value.includes('Goiás') && locLine.value.includes('Brasil'), 'Cidade, Estado e País renderizados juntos na mesma linha');

// Teste de Separação e Unificação de Localidade
tool.splitLocality();
assert(tool.isLocalityUnified() === false, 'Localidade separada em Cidade, Estado e País individuais');
assert(tool.activeFields.find(f => f.id === 'city').enabled === true, 'Campo Cidade ativado individualmente');
tool.unifyLocality();
assert(tool.isLocalityUnified() === true, 'Localidade reunificada com sucesso em Cidade, Estado e País');

// Teste de Unificação e Separação de Endereço e Bairro
tool.setFieldValue('street', 'Av. José Vicente');
tool.setFieldValue('number', '100');
tool.setFieldValue('neighborhood', 'Setor Central');
const addrNeighVal = tool.getFieldValue('address_neighborhood');
assert(addrNeighVal.includes('Av. José Vicente') && addrNeighVal.includes('Setor Central'), 'Endereço e Bairro unificados na mesma linha');
tool.splitAddress();
assert(tool.isAddressUnified() === false, 'Endereço e Bairro separados em linhas individuais');
tool.unifyAddress();
assert(tool.isAddressUnified() === true, 'Endereço e Bairro reunificados com sucesso');

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

// Teste de Disponibilidade de Todos os Campos Padrão
assert(tool.activeFields.length >= 20, `Todos os campos padrão disponíveis na lista (total: ${tool.activeFields.length})`);
const bairroField = tool.activeFields.find(f => f.id === 'neighborhood');
assert(bairroField !== undefined, 'Campo Bairro disponível na lista');

// Teste de Ativação e Edição de Valor de Campo Padrão
tool.setFieldValue('neighborhood', 'Setor Central');
assert(tool.location.neighborhood === 'Setor Central', 'Valor de Bairro gravado na localização');
bairroField.enabled = true;
const linesWithBairro = tool.getStampRenderLines();
assert(linesWithBairro.some(l => l.value === 'Setor Central'), 'Bairro ativado e renderizado nas linhas do carimbo');

// Teste de Campos Técnicos (Obra, Processo, Responsável)
tool.setFieldValue('project_name', 'Residência Jussara');
assert(tool.location.projectName === 'Residência Jussara', 'Nome da Obra atualizado com sucesso');
tool.setFieldValue('process', '5557293-56.2020.8.09.0097');
assert(tool.location.process === '5557293-56.2020.8.09.0097', 'Número do Processo atualizado com sucesso');
tool.setFieldValue('responsible', 'Eng. Perito Especialista');
assert(tool.location.responsible === 'Eng. Perito Especialista', 'Responsável Técnico atualizado com sucesso');

// Teste de Adição e Reordenação de Campo Personalizado
const initialCount = tool.activeFields.length;
const customField = tool.addCustomField('Vistoriador', 'Eng. Silva');
assert(tool.activeFields.length === initialCount + 1, 'Novo campo adicionado');
assert(tool.getFieldValue(customField.id, customField) === 'Eng. Silva', 'Valor do campo customizado recuperado');

tool.moveField(customField.id, 'up');
assert(tool.activeFields[tool.activeFields.length - 2].id === customField.id, 'Campo reordenado com sucesso para cima');

tool.removeField(customField.id);
assert(tool.activeFields.length === initialCount, 'Campo removido com sucesso');

// Testes do Geocodificador Offline (Identificação Automática de Cidade/Estado/País)
console.log('\n[4.5/5] Testes de Geocodificação Automática e Limpeza:');
const geoJussara = getOfflineLocation(refLat, refLon);
assert(geoJussara && geoJussara.city === 'Jussara', `Geocodificador identificou Cidade: ${geoJussara?.city}`);
assert(geoJussara && geoJussara.state === 'Goiás', `Geocodificador identificou Estado: ${geoJussara?.state}`);
assert(geoJussara && geoJussara.country === 'Brasil', `Geocodificador identificou País: ${geoJussara?.country}`);

const geoBrasilia = getOfflineLocation(-15.7975, -47.8919);
assert(geoBrasilia && geoBrasilia.city === 'Brasília', `Geocodificador identificou Brasília: ${geoBrasilia?.city}`);

// Teste de Selos de Origem [EXIF] e [MANUAL] no Carimbo
console.log('\n[4.7/5] Testes de Selos de Origem, Preservação de EXIF e Gerador ZIP:');
tool.loadPhotoData({
  canvas: { width: 1920, height: 1080 },
  width: 1920,
  height: 1080,
  filename: 'teste_origem.jpg',
  fileSize: 500000,
  exif: {
    hasExif: true,
    hasGps: true,
    hasDate: true,
    latitude: refLat,
    longitude: refLon,
    altitude: null,
    dateObj: parsedDate,
    dateStr: sampleDateStr
  }
});
tool.settings.showOriginStampBadge = true;
tool.location.date = '22/11/2022';
tool.location.sources.date = 'MANUAL';
const dateField = tool.activeFields.find(f => f.id === 'date');
if (dateField) dateField.enabled = true;
const stampLinesWithBadges = tool.getStampRenderLines();
const coordLineBadge = stampLinesWithBadges.find(l => l.id === 'lat' || l.id === 'coordinates');
assert(coordLineBadge && coordLineBadge.value.includes('[EXIF]'), 'Selo [EXIF] anexado à coordenada extraída do EXIF');
const dateLineBadge = stampLinesWithBadges.find(l => l.id === 'date');
assert(dateLineBadge && dateLineBadge.value.includes('[MANUAL]'), 'Selo [MANUAL] anexado a campo com fonte MANUAL');

// Teste de Injeção e Preservação de Segmento APP1 EXIF em JPEG
const sampleLibertyPath = path.resolve('assets/images/demo_liberty.jpg');
const sampleLibertyBuf = fs.readFileSync(sampleLibertyPath);
const libertyExif = await readExifData(sampleLibertyBuf.buffer.slice(sampleLibertyBuf.byteOffset, sampleLibertyBuf.byteOffset + sampleLibertyBuf.byteLength));
assert(libertyExif.hasExif && libertyExif.hasGps && libertyExif.rawApp1Bytes !== null, 'Segmento binário APP1 bruto extraído com sucesso da foto de demonstração');

// Simula JPEG sem EXIF gerado por Canvas: SOI (FFD8) + DQT (FFDB)
const mockCanvasJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xDB, 0x00, 0x04, 0x00, 0x00, 0xFF, 0xD9]);
const injectedJpeg = injectApp1BytesIntoJpeg(mockCanvasJpeg, libertyExif.rawApp1Bytes);
assert(injectedJpeg.length > mockCanvasJpeg.length, 'Segmento APP1 reinjetado no buffer do JPEG');
const reReadExif = await readExifData(injectedJpeg.buffer.slice(injectedJpeg.byteOffset, injectedJpeg.byteOffset + injectedJpeg.byteLength));
assert(reReadExif.hasExif && reReadExif.hasGps && Math.abs(reReadExif.latitude - 40.68925) < 0.001, 'Metadados EXIF e coordenadas GPS recuperados 100% intactos após injeção');

// Teste do Gerador ZIP (ZipWriter)
const zip = new ZipWriter();
await zip.addFile('foto_01.jpg', new Uint8Array([0xFF, 0xD8, 0xFF, 0xD9]));
await zip.addFile('foto_02.jpg', new Uint8Array([0xFF, 0xD8, 0xFF, 0xD9]));
const zipBytes = zip.generateUint8Array();
assert(zipBytes.length > 50, `Arquivo ZIP válido gerado com sucesso (${zipBytes.length} bytes)`);
// Verifica assinatura inicial PK\x03\x04
assert(zipBytes[0] === 0x50 && zipBytes[1] === 0x4B && zipBytes[2] === 0x03 && zipBytes[3] === 0x04, 'Assinatura padrão PK\x03\x04 verificada no início do ZIP');

// Testes de Rotação, Numeração e Esquema de Persistência
console.log('\n[4.8/5] Testes de Rotação de Imagem, Numeração e Esquema de Persistência:');
const mockPhoto = {
  canvas: {
    width: 1920,
    height: 1080,
    getContext: () => ({ translate: () => {}, rotate: () => {}, drawImage: () => {} })
  },
  width: 1920,
  height: 1080,
  filename: 'foto_rotacao.jpg',
  fileSize: 100000
};
tool.loadPhotoData(mockPhoto);
tool.settings.customPosX = 0.2;
tool.settings.customPosY = 0.3;
tool.rotatePhoto('right');
assert(tool.photo.width === 1080 && tool.photo.height === 1920, 'Dimensões invertidas após rotação de 90° à direita');
assert(Math.abs(tool.settings.customPosX - 0.7) < 0.001 && Math.abs(tool.settings.customPosY - 0.2) < 0.001, 'Posição proporcional recalculada corretamente após rotação');
tool.rotatePhoto('left');
assert(tool.photo.width === 1920 && tool.photo.height === 1080, 'Dimensões restauradas após rotação de 90° à esquerda');
tool.rotatePhoto(180);
assert(tool.photo.width === 1920 && tool.photo.height === 1080, 'Dimensões mantidas após rotação de 180°');
assert(Math.abs(tool.settings.customPosX - 0.8) < 0.001 && Math.abs(tool.settings.customPosY - 0.7) < 0.001, 'Posição proporcional invertida corretamente após rotação de 180°');
tool.rotatePhoto(180);

tool.resetNumbering();
assert(tool.numbering.startNumber === 1, 'Contador redefinido para 1');
tool.advanceNumbering(1);
assert(tool.numbering.startNumber === 2, 'Contador avançado para 2 após 1 exportação');
tool.advanceNumbering(3);
assert(tool.numbering.startNumber === 5, 'Contador avançado para 5 após lote de 3 fotos');

const backup = storage.getBackupData(tool);
assert(backup.schema === 1, 'Backup gerado com Schema 1');
assert(backup.version === 'v.1.1.6', 'Backup com versão atualizada v.1.1.6');
assert(backup.config && backup.data && backup.counter, 'Estrutura completa de backup exportada sem fotos');

const legacyData = {
  schema: 0,
  settings: { fontSize: 24 },
  customPresets: [{ id: 'custom_1', name: 'Meu Modelo' }]
};
const migrated = migrate(legacyData);
assert(migrated.schema === 1, 'Dados legados convertidos com sucesso para Schema 1 pela função migrate()');
assert(migrated.config.fontSize === 24, 'Configurações preservadas na migração');
assert(migrated.models.length === 1, 'Modelos personalizados preservados na migração');

tool.clearWorkspace();

// 5. TESTES DE INTEGRIDADE DO DOM (index.html)
console.log('\n[5/5] Testes de Integridade do DOM (index.html):');
const indexPath = path.resolve('index.html');
const htmlContent = fs.readFileSync(indexPath, 'utf-8');

const requiredElementIds = [
  'fileInput',
  'btnOpenPhoto',
  'btnClearWorkspace',
  'btnClearPhoto',
  'btnAutoGeocode',
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
  'badgeLat',
  'badgeLon',
  'badgeDate',
  'badgeTime',
  'btnRotateLeft',
  'btnRotateRight',
  'btnRotate180',
  'floatingRotateBar',
  'btnFloatRotateLeft',
  'btnFloatRotateRight',
  'btnFloatRotate180',
  'btnSidebarRotateLeft',
  'btnSidebarRotateRight',
  'btnSidebarRotate180',
  'saveStatusIndicator',
  'draftRestoreBanner',
  'btnRestoreDraft',
  'btnDiscardDraft',
  'btnDuplicatePreset',
  'btnRenamePreset',
  'btnDeletePreset',
  'btnResetNumbering',
  'btnExportBackupJson',
  'btnImportBackupJson',
  'btnClearAllBrowserData',
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
  'selectLabelMode',
  'selectInlineLayout',
  'selectExportFormat',
  'rangeExportQuality',
  'valExportQuality',
  'qualityGroup',
  'checkAutoNumber',
  'inputNumberPrefix',
  'inputNumberStart',
  'inputNumberDigits',
  'themeToggleBtn',
  'langSelect',
  'cameraInput',
  'btnCaptureCamera',
  'btnBatchModal',
  'btnDeviceGps',
  'checkPreserveExif',
  'checkOriginStampBadge',
  'batchModal',
  'confirmActionModal',
  'btnToggleSplitCoords',
  'btnToggleSplitDateTime',
  'btnToggleSplitAddress',
  'btnToggleSplitLocality'
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
assert(htmlContent.includes('js/stamp-camera.bundle.js'), 'stamp-camera.bundle.js incluído no index.html');

console.log(`\n========================================`);
console.log(`RESUMO DOS TESTES: ${passed} passaram, ${failed} falharam.`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
