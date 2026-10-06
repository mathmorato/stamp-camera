/**
 * STAMP-CAMERA - Modelos e Presets Pré-configurados
 * Implementa Modelos 1 a 5 e Presets de Perícia, Obra, Fiscalização, etc.
 */

import { COORD_FORMATS, DATE_FORMATS, TIME_FORMATS, STAMP_POSITIONS } from './config.js';

export const BUILT_IN_MODELS = [
  {
    id: 'model_1_simple',
    name: 'Modelo 1 - Simples',
    description: 'Data, hora e coordenadas em formato direto.',
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
    fields: [
      { id: 'datetime', label: 'Data e Hora', enabled: true, showLabel: false },
      { id: 'address_street_num', label: 'Endereço', enabled: true, showLabel: false },
      { id: 'neighborhood', label: 'Bairro', enabled: true, showLabel: false },
      { id: 'city_state_country', label: 'Cidade/Estado/País', enabled: true, showLabel: false },
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
    fields: [
      { id: 'datetime', label: 'Data e Hora', enabled: true, showLabel: false },
      { id: 'coordinates', label: 'Coordenadas', enabled: true, showLabel: true },
      { id: 'locality', label: 'Local', enabled: true, showLabel: true },
      { id: 'altitude', label: 'Altitude', enabled: false, showLabel: true },
      { id: 'project_name', label: 'Obra / Projeto', enabled: false, showLabel: true, defaultValue: 'Residência Jussara' },
      { id: 'custom_text', label: 'Observação', enabled: false, showLabel: false, defaultValue: 'Inspeção de rotina' }
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
    customFields: [
      { id: 'project_name', label: 'OBRA', enabled: true, showLabel: true, defaultValue: 'Residência Jussara' },
      { id: 'responsible', label: 'RESP. TÉCNICO', enabled: true, showLabel: true, defaultValue: 'Engenheiro Civil' }
    ]
  },
  {
    id: 'preset_inspecao',
    name: 'Inspeção Predial',
    baseModelId: 'model_2_location',
    customFields: [
      { id: 'inspection_type', label: 'TIPO DE INSPEÇÃO', enabled: true, showLabel: true, defaultValue: 'Vistoria Estrutural' }
    ]
  },
  {
    id: 'preset_fiscalizacao',
    name: 'Fiscalização Ambiental / Urbana',
    baseModelId: 'model_3_technical',
    customFields: [
      { id: 'report_num', label: 'RELATÓRIO / AUTO', enabled: true, showLabel: true, defaultValue: 'AI-2026/049' }
    ]
  },
  {
    id: 'preset_registro',
    name: 'Registro Fotográfico',
    baseModelId: 'model_1_simple'
  },
  {
    id: 'preset_vistoria',
    name: 'Vistoria Imobiliária',
    baseModelId: 'model_2_location'
  },
  {
    id: 'preset_pessoal',
    name: 'Uso Pessoal / Viagem',
    baseModelId: 'model_1_simple'
  }
];

/**
 * Lista dos campos padrão que a aplicação suporta
 */
export const STANDARD_FIELD_DEFS = [
  { id: 'photo_id', name: 'Identificação da Fotografia', category: 'general', defaultLabel: 'FOTO' },
  { id: 'date', name: 'Data', category: 'datetime', defaultLabel: 'Data' },
  { id: 'time', name: 'Hora', category: 'datetime', defaultLabel: 'Hora' },
  { id: 'datetime', name: 'Data e Hora combinadas', category: 'datetime', defaultLabel: 'Data/Hora' },
  { id: 'coordinates', name: 'Coordenadas (Lat/Long)', category: 'location', defaultLabel: 'Coordenadas' },
  { id: 'lat', name: 'Latitude isolada', category: 'location', defaultLabel: 'Lat' },
  { id: 'lon', name: 'Longitude isolada', category: 'location', defaultLabel: 'Long' },
  { id: 'altitude', name: 'Altitude', category: 'location', defaultLabel: 'Altitude' },
  { id: 'street', name: 'Rua / Logradouro', category: 'location', defaultLabel: 'Rua' },
  { id: 'number', name: 'Número', category: 'location', defaultLabel: 'Nº' },
  { id: 'address_street_num', name: 'Rua e Número combinados', category: 'location', defaultLabel: 'Endereço' },
  { id: 'neighborhood', name: 'Bairro', category: 'location', defaultLabel: 'Bairro' },
  { id: 'locality', name: 'Local / Cidade, UF', category: 'location', defaultLabel: 'Local' },
  { id: 'city', name: 'Cidade / Município', category: 'location', defaultLabel: 'Cidade' },
  { id: 'state', name: 'Estado / UF', category: 'location', defaultLabel: 'Estado' },
  { id: 'country', name: 'País', category: 'location', defaultLabel: 'País' },
  { id: 'city_state_country', name: 'Cidade, Estado, País', category: 'location', defaultLabel: 'Localidade' },
  { id: 'postal_code', name: 'CEP', category: 'location', defaultLabel: 'CEP' },
  { id: 'project_name', name: 'Nome da Obra / Projeto', category: 'technical', defaultLabel: 'Obra' },
  { id: 'process', name: 'Processo Judicial / Administrativo', category: 'technical', defaultLabel: 'Processo' },
  { id: 'report_num', name: 'Relatório / Laudo nº', category: 'technical', defaultLabel: 'Relatório' },
  { id: 'responsible', name: 'Responsável Técnico / Perito', category: 'technical', defaultLabel: 'Responsável' },
  { id: 'custom_text', name: 'Texto Personalizado', category: 'custom', defaultLabel: 'Observações' }
];
