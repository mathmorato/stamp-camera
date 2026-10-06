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
  STAMP_POSITIONS
} from '../../config.js';
import { formatCoordinates, toDms, toDdm } from '../../geolocation.js';
import { BUILT_IN_MODELS, STANDARD_FIELD_DEFS } from '../../templates.js';

export class StampCameraTool {
  constructor() {
    this.photo = null;       // { canvas, width, height, filename, fileSize }
    this.exif = null;        // Metadados extraídos
    this.location = this.createDefaultLocation();
    this.settings = { ...DEFAULT_STAMP_SETTINGS };
    this.numbering = { ...DEFAULT_NUMBERING };
    this.activeFields = [];  // Lista ordenada de campos no carimbo
    this.selectedModelId = 'model_1_simple';

    this.initDefaultFields();
  }

  createDefaultLocation() {
    return {
      latitude: null,
      longitude: null,
      altitude: null,
      date: null,
      time: null,
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
        referencePoint: 'MANUAL'
      }
    };
  }

  initDefaultFields() {
    // Carrega os campos do Modelo 1 por padrão
    const defaultModel = BUILT_IN_MODELS[0];
    this.applyModel(defaultModel);
  }

  /**
   * Aplica um modelo ou preset predefinido
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

    // Reseta posição personalizada caso troque de modelo
    this.settings.customPosX = null;
    this.settings.customPosY = null;

    // Constrói lista de campos ativos
    this.activeFields = model.fields.map((f, index) => {
      const def = STANDARD_FIELD_DEFS.find(d => d.id === f.id);
      return {
        id: f.id,
        name: def ? def.name : f.label,
        label: f.label || (def ? def.defaultLabel : f.id),
        enabled: f.enabled !== false,
        showLabel: f.showLabel !== false,
        isCustom: !def,
        customValue: f.defaultValue || '',
        order: index
      };
    });
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
        return this.location.number ? `nº ${this.location.number}` : '';

      case 'address_street_num': {
        if (this.location.street && this.location.number) {
          return `${this.location.street}, nº ${this.location.number}`;
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
        return this.location.postalCode ? `CEP: ${this.location.postalCode}` : '';

      case 'photo_id': {
        if (this.numbering.enabled) {
          const num = String(this.numbering.startNumber).padStart(this.numbering.digits, '0');
          return `${this.numbering.prefix}${num}${this.numbering.suffix}`;
        }
        return fieldConfig.customValue || '01';
      }

      default:
        // Campos personalizados
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
          isCustom: field.isCustom
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
