/**
 * STAMP-CAMERA - Modelos e Presets Pré-configurados
 * Implementa Modelos 1 a 5 e Presets de Perícia, Obra, Fiscalização, etc.
 * Contém a lista completa dos campos padrão conforme as regras da diretriz.
 */

import { COORD_FORMATS, DATE_FORMATS, TIME_FORMATS, STAMP_POSITIONS, LABEL_MODES, STAMP_LAYOUTS, FIELD_ICONS } from './config.js';

export const BUILT_IN_MODELS = [
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

export const PRESET_CATEGORIES = [
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
export const STANDARD_FIELD_DEFS = [
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
