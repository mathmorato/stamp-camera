/**
 * STAMP-CAMERA - Núcleo de Estado e Regras de Negócio (Tool Controller)
 * Mantém o estado da foto, metadados EXIF, localização com rastreamento de origem (AUTO/MANUAL),
 * e compõe as linhas para renderização no StampEngine.
 */

import {
  DEFAULT_STAMP_SETTINGS,
  DEFAULT_NUMBERING,
  COORD_FORMATS,
  DATE_FORMATS,
  TIME_FORMATS,
  STAMP_POSITIONS,
  LABEL_MODES,
  STAMP_LAYOUTS,
  FIELD_ICONS
} from '../../config.js';
import { formatCoordinates, toDms, toDdm, parseCoordinateString, isValidCoordinate } from '../../geolocation.js';
import { BUILT_IN_MODELS, PRESET_CATEGORIES, STANDARD_FIELD_DEFS } from '../../templates.js';
import { reverseGeocode } from '../../geocoder.js';

export const OPTIONAL_ON_DEMAND_FIELDS = [
  'photo_id',
  'project_name',
  'report_num',
  'custom_text'
];

export class StampCameraTool {
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
        const isOpt = OPTIONAL_ON_DEMAND_FIELDS.includes(mf.id);
        orderedList.push({
          id: mf.id,
          name: def ? def.name : mf.label,
          label: mf.label || (def ? def.defaultLabel : mf.id),
          enabled: mf.enabled !== false,
          showLabel: mf.showLabel !== false,
          isCustom: false,
          isOptionalOnDemand: isOpt,
          added: mf.enabled !== false,
          customValue: mf.defaultValue || '',
          order: orderedList.length
        });
      }
    }

    // 2. Todos os outros campos padrão disponíveis (adicionados após os do modelo, inicialmente desmarcados)
    for (const def of STANDARD_FIELD_DEFS) {
      if (!modelFieldMap.has(def.id)) {
        const isOpt = OPTIONAL_ON_DEMAND_FIELDS.includes(def.id);
        remainingStandard.push({
          id: def.id,
          name: def.name,
          label: def.defaultLabel,
          enabled: false,
          showLabel: true,
          isCustom: false,
          isOptionalOnDemand: isOpt,
          added: false,
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

      case 'address_neighborhood': {
        this.location.sources.street = 'MANUAL';
        this.location.sources.neighborhood = 'MANUAL';
        const val = (value || '').trim();
        if (val.includes(',')) {
          const parts = val.split(',').map(s => s.trim());
          this.location.neighborhood = parts.pop();
          this.location.street = parts.join(', ');
        } else {
          this.location.street = val;
        }
        break;
      }

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

      case 'city_state_country': {
        this.location.sources.city = 'MANUAL';
        this.location.sources.state = 'MANUAL';
        this.location.sources.country = 'MANUAL';
        const val = (value || '').trim();
        if (val.includes(',')) {
          const parts = val.split(',').map(s => s.trim());
          if (parts.length >= 3) {
            this.location.city = parts[0];
            this.location.state = parts[1];
            this.location.country = parts[2];
          } else if (parts.length === 2) {
            this.location.city = parts[0];
            this.location.state = parts[1];
          } else {
            this.location.city = parts[0];
          }
        } else {
          this.location.city = val;
        }
        break;
      }

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

      case 'address_neighborhood': {
        const addr = this.getFieldValue('address_street_num');
        const neigh = this.location.neighborhood;
        if (addr && neigh) {
          return `${addr}, ${neigh}`;
        }
        return addr || neigh || '';
      }

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
   * Retorna o selo de origem (EXIF ou MANUAL) para um campo específico
   */
  getFieldOriginBadge(fieldId) {
    if (['lat', 'lon', 'coordinates', 'latitude', 'longitude'].includes(fieldId)) {
      return this.location.sources.latitude === 'AUTO' ? 'EXIF' : 'MANUAL';
    }
    if (['date', 'time', 'datetime'].includes(fieldId)) {
      return this.location.sources.date === 'AUTO' ? 'EXIF' : 'MANUAL';
    }
    if (fieldId === 'altitude') {
      return this.location.sources.altitude === 'AUTO' ? 'EXIF' : 'MANUAL';
    }
    return null;
  }

  /**
   * Constrói a lista de linhas prontas para desenho no carimbo
   */
  getStampRenderLines() {
    const lines = [];
    const showOrigin = !!this.settings.showOriginStampBadge;

    for (const field of this.activeFields) {
      if (!field.enabled) continue;

      let val = this.getFieldValue(field.id, field);
      if (val) {
        if (showOrigin) {
          const badge = this.getFieldOriginBadge(field.id);
          if (badge) {
            val = `${val} [${badge}]`;
          }
        }

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
   * Adiciona/ativa um campo padrão que estava oculto sob demanda
   */
  addStandardField(fieldId) {
    const field = this.activeFields.find(f => f.id === fieldId);
    if (field) {
      field.added = true;
      field.enabled = true;
      return field;
    }
    return null;
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
      isOptionalOnDemand: false,
      added: true,
      customValue: defaultValue,
      order: this.activeFields.length
    };
    this.activeFields.push(newField);
    return newField;
  }

  /**
   * Remove um campo da lista (se customizado exclui, se padrão opcional oculta)
   */
  removeField(fieldId) {
    const field = this.activeFields.find(f => f.id === fieldId);
    if (!field) return;
    if (field.isCustom) {
      this.activeFields = this.activeFields.filter(f => f.id !== fieldId);
      delete this.location.sources[fieldId];
    } else {
      field.added = false;
      field.enabled = false;
    }
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

  /**
   * Utilitários de Separação e Unificação de Campos
   */
  isFieldEnabled(fieldId) {
    const f = this.activeFields.find(field => field.id === fieldId);
    return !!(f && f.enabled);
  }

  isLocalityUnified() {
    return this.isFieldEnabled('city_state_country');
  }

  splitLocality() {
    const compField = this.activeFields.find(f => f.id === 'city_state_country');
    if (compField) compField.enabled = false;

    const cityField = this.activeFields.find(f => f.id === 'city');
    const stateField = this.activeFields.find(f => f.id === 'state');
    const countryField = this.activeFields.find(f => f.id === 'country');

    const toInsert = [cityField, stateField, countryField].filter(Boolean);
    toInsert.forEach(f => { f.enabled = true; f.added = true; });

    const targetIdx = this.activeFields.findIndex(f => f.id === 'city_state_country');
    if (targetIdx >= 0) {
      this.activeFields = this.activeFields.filter(f => !toInsert.includes(f));
      const newTargetIdx = this.activeFields.findIndex(f => f.id === 'city_state_country');
      this.activeFields.splice(newTargetIdx + 1, 0, ...toInsert);
    }
    return true;
  }

  unifyLocality() {
    const cityField = this.activeFields.find(f => f.id === 'city');
    const stateField = this.activeFields.find(f => f.id === 'state');
    const countryField = this.activeFields.find(f => f.id === 'country');
    [cityField, stateField, countryField].forEach(f => { if (f) f.enabled = false; });

    const compField = this.activeFields.find(f => f.id === 'city_state_country');
    if (compField) {
      compField.enabled = true;
      compField.added = true;
      const cityIdx = this.activeFields.findIndex(f => f.id === 'city');
      if (cityIdx >= 0) {
        this.activeFields = this.activeFields.filter(f => f.id !== 'city_state_country');
        this.activeFields.splice(cityIdx, 0, compField);
      }
    }
    return true;
  }

  isAddressUnified() {
    return this.isFieldEnabled('address_neighborhood');
  }

  splitAddress() {
    const compField = this.activeFields.find(f => f.id === 'address_neighborhood');
    if (compField) compField.enabled = false;

    const streetNumField = this.activeFields.find(f => f.id === 'address_street_num');
    const neighField = this.activeFields.find(f => f.id === 'neighborhood');

    const toInsert = [streetNumField, neighField].filter(Boolean);
    toInsert.forEach(f => { f.enabled = true; f.added = true; });

    const targetIdx = this.activeFields.findIndex(f => f.id === 'address_neighborhood');
    if (targetIdx >= 0) {
      this.activeFields = this.activeFields.filter(f => !toInsert.includes(f));
      const newTargetIdx = this.activeFields.findIndex(f => f.id === 'address_neighborhood');
      this.activeFields.splice(newTargetIdx + 1, 0, ...toInsert);
    }
    return true;
  }

  unifyAddress() {
    const streetNumField = this.activeFields.find(f => f.id === 'address_street_num');
    const streetField = this.activeFields.find(f => f.id === 'street');
    const numField = this.activeFields.find(f => f.id === 'number');
    const neighField = this.activeFields.find(f => f.id === 'neighborhood');

    [streetNumField, streetField, numField, neighField].forEach(f => { if (f) f.enabled = false; });

    const compField = this.activeFields.find(f => f.id === 'address_neighborhood');
    if (compField) {
      compField.enabled = true;
      compField.added = true;
      const posIdx = this.activeFields.findIndex(f => f.id === 'address_street_num' || f.id === 'neighborhood');
      if (posIdx >= 0) {
        this.activeFields = this.activeFields.filter(f => f.id !== 'address_neighborhood');
        this.activeFields.splice(posIdx, 0, compField);
      }
    }
    return true;
  }

  isCoordinatesUnified() {
    return this.isFieldEnabled('coordinates');
  }

  splitCoordinates() {
    const compField = this.activeFields.find(f => f.id === 'coordinates');
    if (compField) compField.enabled = false;

    const latField = this.activeFields.find(f => f.id === 'lat');
    const lonField = this.activeFields.find(f => f.id === 'lon');

    const toInsert = [latField, lonField].filter(Boolean);
    toInsert.forEach(f => { f.enabled = true; f.added = true; });

    const targetIdx = this.activeFields.findIndex(f => f.id === 'coordinates');
    if (targetIdx >= 0) {
      this.activeFields = this.activeFields.filter(f => !toInsert.includes(f));
      const newTargetIdx = this.activeFields.findIndex(f => f.id === 'coordinates');
      this.activeFields.splice(newTargetIdx + 1, 0, ...toInsert);
    }
    return true;
  }

  unifyCoordinates() {
    const latField = this.activeFields.find(f => f.id === 'lat');
    const lonField = this.activeFields.find(f => f.id === 'lon');
    [latField, lonField].forEach(f => { if (f) f.enabled = false; });

    const compField = this.activeFields.find(f => f.id === 'coordinates');
    if (compField) {
      compField.enabled = true;
      compField.added = true;
      const posIdx = this.activeFields.findIndex(f => f.id === 'lat');
      if (posIdx >= 0) {
        this.activeFields = this.activeFields.filter(f => f.id !== 'coordinates');
        this.activeFields.splice(posIdx, 0, compField);
      }
    }
    return true;
  }

  isDateTimeUnified() {
    return this.isFieldEnabled('datetime');
  }

  splitDateTime() {
    const compField = this.activeFields.find(f => f.id === 'datetime');
    if (compField) compField.enabled = false;

    const dateField = this.activeFields.find(f => f.id === 'date');
    const timeField = this.activeFields.find(f => f.id === 'time');

    const toInsert = [dateField, timeField].filter(Boolean);
    toInsert.forEach(f => { f.enabled = true; f.added = true; });

    const targetIdx = this.activeFields.findIndex(f => f.id === 'datetime');
    if (targetIdx >= 0) {
      this.activeFields = this.activeFields.filter(f => !toInsert.includes(f));
      const newTargetIdx = this.activeFields.findIndex(f => f.id === 'datetime');
      this.activeFields.splice(newTargetIdx + 1, 0, ...toInsert);
    }
    return true;
  }

  unifyDateTime() {
    const dateField = this.activeFields.find(f => f.id === 'date');
    const timeField = this.activeFields.find(f => f.id === 'time');
    [dateField, timeField].forEach(f => { if (f) f.enabled = false; });

    const compField = this.activeFields.find(f => f.id === 'datetime');
    if (compField) {
      compField.enabled = true;
      compField.added = true;
      const posIdx = this.activeFields.findIndex(f => f.id === 'date');
      if (posIdx >= 0) {
        this.activeFields = this.activeFields.filter(f => f.id !== 'datetime');
        this.activeFields.splice(posIdx, 0, compField);
      }
    }
    return true;
  }

  /**
   * Avança o contador de numeração após uma exportação concluída com sucesso.
   * Nunca avança ao simplesmente abrir uma fotografia.
   */
  advanceNumbering(count = 1) {
    const current = parseInt(this.numbering.startNumber, 10) || 1;
    this.numbering.startNumber = current + (parseInt(count, 10) || 1);
    return this.numbering.startNumber;
  }

  /**
   * Redefine o contador de numeração para o número inicial (1)
   */
  resetNumbering() {
    this.numbering.startNumber = 1;
    return this.numbering.startNumber;
  }

  /**
   * Rotaciona a fotografia atual em 90 graus (horário ou anti-horário).
   * Atualiza dimensões e renderiza de forma 100% sem perdas.
   * @param {'right'|'left'} direction
   * @returns {Object|null} Objeto da foto atualizado
   */
  rotatePhoto(direction = 'right') {
    if (!this.photo || !this.photo.canvas) return null;
    const oldCanvas = this.photo.canvas;
    const newCanvas = document.createElement('canvas');
    newCanvas.width = oldCanvas.height;
    newCanvas.height = oldCanvas.width;
    const ctx = newCanvas.getContext('2d');

    if (direction === 'left') {
      ctx.translate(0, newCanvas.height);
      ctx.rotate(-Math.PI / 2);
    } else {
      ctx.translate(newCanvas.width, 0);
      ctx.rotate(Math.PI / 2);
    }
    ctx.drawImage(oldCanvas, 0, 0);

    this.photo.canvas = newCanvas;
    this.photo.width = newCanvas.width;
    this.photo.height = newCanvas.height;

    // Atualiza customPosX e customPosY se houver posição personalizada
    if (this.settings.customPosX !== null && this.settings.customPosY !== null) {
      const oldX = this.settings.customPosX;
      const oldY = this.settings.customPosY;
      if (direction === 'right') {
        this.settings.customPosX = 1 - oldY;
        this.settings.customPosY = oldX;
      } else {
        this.settings.customPosX = oldY;
        this.settings.customPosY = 1 - oldX;
      }
    }

    return this.photo;
  }

  /**
   * Restaura o estado salvo a partir do Schema 1
   * @param {Object} state
   */
  loadState(state) {
    if (!state) return;
    if (state.config) {
      this.settings = { ...this.settings, ...state.config };
    }
    if (state.counter) {
      this.numbering = { ...this.numbering, ...state.counter };
    }
    const loc = state.data?.location || state.location;
    if (loc) {
      this.location = { ...this.location, ...loc };
      if (loc.sources) {
        this.location.sources = { ...this.location.sources, ...loc.sources };
      }
    }
    const fields = state.data?.activeFields || state.activeFields;
    if (Array.isArray(fields) && fields.length > 0) {
      this.activeFields = fields.map(f => ({ ...f }));
    }
    if (state.selectedModelId) {
      this.selectedModelId = state.selectedModelId;
    }
  }
}

