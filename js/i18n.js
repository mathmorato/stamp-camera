/**
 * STAMP-CAMERA - Internacionalização (i18n)
 * Suporte a Português (Brasil), Inglês e Espanhol.
 */

export const TRANSLATIONS = {
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

export function setLanguage(lang) {
  if (TRANSLATIONS[lang]) {
    currentLang = lang;
  }
}

export function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ||
         (TRANSLATIONS['pt-BR'] && TRANSLATIONS['pt-BR'][key]) ||
         key;
}
