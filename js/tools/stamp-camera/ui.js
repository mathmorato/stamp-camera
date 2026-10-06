/**
 * STAMP-CAMERA - Camada de Interface do Usuário (UI Controller)
 * Gerencia formulários, listas de campos, drag-and-drop no canvas, alertas de EXIF,
 * badges de origem (AUTO/MANUAL) e sincronização em tempo real.
 */

import { BUILT_IN_MODELS, PRESET_CATEGORIES, STANDARD_FIELD_DEFS } from '../../templates.js';
import { COORD_FORMATS, DATE_FORMATS, TIME_FORMATS, STAMP_POSITIONS } from '../../config.js';
import { parseCoordinateString, isValidCoordinate } from '../../geolocation.js';
import { storage } from '../../storage.js';

export class StampCameraUI {
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

    // Campos de Localização
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

    // Lista de campos do carimbo
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
    // Alternância de Abas
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.tabButtons.forEach(b => b.classList.remove('active'));
        this.tabPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(`tab-${tab}`);
        if (target) target.classList.add('active');
      });
    });

    // Posições em Grade
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
      this.app.requestRender();
    });

    this.selectDateFormat.addEventListener('change', (e) => {
      this.tool.settings.dateFormat = e.target.value;
      this.tool.location.date = this.tool.formatDateString(this.tool.location.dateObj, e.target.value);
      this.inputDate.value = this.tool.location.date;
      this.app.requestRender();
    });

    this.selectTimeFormat.addEventListener('change', (e) => {
      this.tool.settings.timeFormat = e.target.value;
      this.tool.location.time = this.tool.formatTimeString(this.tool.location.dateObj, e.target.value);
      this.inputTime.value = this.tool.location.time;
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

    // Numeração Automática
    this.checkAutoNumber.addEventListener('change', (e) => {
      this.tool.numbering.enabled = e.target.checked;
      this.app.requestRender();
    });

    this.inputNumberPrefix.addEventListener('input', (e) => {
      this.tool.numbering.prefix = e.target.value;
      this.app.requestRender();
    });

    this.inputNumberStart.addEventListener('input', (e) => {
      this.tool.numbering.startNumber = parseInt(e.target.value, 10) || 1;
      this.app.requestRender();
    });

    this.inputNumberDigits.addEventListener('input', (e) => {
      this.tool.numbering.digits = parseInt(e.target.value, 10) || 2;
      this.app.requestRender();
    });

    // Formato de exportação e qualidade
    this.selectExportFormat.addEventListener('change', (e) => {
      const isJpg = e.target.value === 'image/jpeg';
      this.qualityGroup.style.display = isJpg ? 'block' : 'none';
    });

    this.rangeExportQuality.addEventListener('input', (e) => {
      const val = Math.round(parseFloat(e.target.value) * 100);
      this.valExportQuality.textContent = `${val}%`;
    });

    // Edição manual de localização e metadados
    this.bindLocationInputs();

    // Drag-and-drop de arquivos no canvas e container
    this.bindFileDropEvents();

    // Drag-and-drop livre do carimbo no Canvas
    this.bindCanvasStampDrag();

    // Adição de novo campo
    this.btnAddField.addEventListener('click', () => {
      const field = this.tool.addCustomField('Novo Campo', 'Valor');
      this.renderFieldsList();
      this.app.requestRender();
    });

    // Seleção de preset
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
            defaultValue: f.customValue
          }))
        };
        storage.saveCustomPreset(customPreset);
        this.renderPresetsList();
        this.presetsSelect.value = customPreset.id;
        alert('Modelo salvo com sucesso no navegador!');
      }
    });
  }

  bindLocationInputs() {
    // Latitude manual
    this.inputLat.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= -90 && val <= 90) {
        this.tool.location.latitude = val;
        this.tool.location.sources.latitude = 'MANUAL';
        this.updateSourceBadges();
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
        this.app.requestRender();
      }
    });

    // Altitude manual
    this.inputAlt.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.tool.location.altitude = isNaN(val) ? null : val;
      this.tool.location.sources.altitude = 'MANUAL';
      this.updateSourceBadges();
      this.app.requestRender();
    });

    // Data manual
    this.inputDate.addEventListener('input', (e) => {
      this.tool.location.date = e.target.value;
      this.tool.location.sources.date = 'MANUAL';
      this.updateSourceBadges();
      this.app.requestRender();
    });

    // Hora manual
    this.inputTime.addEventListener('input', (e) => {
      this.tool.location.time = e.target.value;
      this.tool.location.sources.time = 'MANUAL';
      this.updateSourceBadges();
      this.app.requestRender();
    });

    // Endereço e dados civis
    const bindSimpleText = (inputElem, key) => {
      inputElem.addEventListener('input', (e) => {
        this.tool.location[key] = e.target.value;
        this.tool.location.sources[key] = 'MANUAL';
        this.app.requestRender();
      });
    };

    bindSimpleText(this.inputStreet, 'street');
    bindSimpleText(this.inputNumber, 'number');
    bindSimpleText(this.inputNeighborhood, 'neighborhood');
    bindSimpleText(this.inputCity, 'city');
    bindSimpleText(this.inputState, 'state');
    bindSimpleText(this.inputCountry, 'country');
    bindSimpleText(this.inputPostalCode, 'postalCode');

    // Dados técnicos
    this.inputProjectName.addEventListener('input', (e) => {
      this.updateCustomFieldDef('project_name', e.target.value);
    });

    this.inputProcess.addEventListener('input', (e) => {
      this.updateCustomFieldDef('process', e.target.value);
    });

    this.inputResponsible.addEventListener('input', (e) => {
      this.updateCustomFieldDef('responsible', e.target.value);
    });
  }

  updateCustomFieldDef(id, value) {
    const f = this.tool.activeFields.find(field => field.id === id);
    if (f) {
      f.customValue = value;
      this.app.requestRender();
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

    // Mousedown / Touchstart
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

    // Mousemove / Touchmove
    const onMove = (e) => {
      if (!this.tool.photo) return;
      const { x, y } = getCanvasCoords(e);

      if (this.isDraggingStamp) {
        const deltaX = x - this.dragStart.x;
        const deltaY = y - this.dragStart.y;

        const newX = this.stampStartPos.x + deltaX;
        const newY = this.stampStartPos.y + deltaY;

        // Atualiza posição personalizada em proporção (0 a 1)
        this.tool.settings.position = STAMP_POSITIONS.CUSTOM;
        this.tool.settings.customPosX = Math.max(0, Math.min(1, newX / canvas.width));
        this.tool.settings.customPosY = Math.max(0, Math.min(1, newY / canvas.height));

        // Desmarca botões de grade
        this.posButtons.forEach(b => b.classList.remove('active'));

        this.app.requestRender();
      } else {
        // Altera cursor quando passar o mouse em cima do carimbo
        if (this.engine.isPointInsideStamp(x, y)) {
          canvas.style.cursor = 'grab';
        } else {
          canvas.style.cursor = 'default';
        }
      }
    };

    // Mouseup / Touchend
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
   * Atualiza a interface quando uma nova foto é carregada
   */
  syncPhotoState() {
    if (!this.tool.photo) {
      this.emptyPlaceholder.style.display = 'flex';
      this.previewCanvas.style.display = 'none';
      this.imageInfoBar.style.display = 'none';
      return;
    }

    this.emptyPlaceholder.style.display = 'none';
    this.previewCanvas.style.display = 'block';
    this.imageInfoBar.style.display = 'flex';

    // Barra de informações da imagem
    const w = this.tool.photo.width;
    const h = this.tool.photo.height;
    const sizeMb = (this.tool.photo.fileSize / (1024 * 1024)).toFixed(2);
    this.photoMetaText.textContent = `${this.tool.photo.filename} • ${w}x${h}px • ${sizeMb} MB`;

    // Sincroniza campos de localização
    this.inputLat.value = this.tool.location.latitude !== null ? this.tool.location.latitude.toFixed(8) : '';
    this.inputLon.value = this.tool.location.longitude !== null ? this.tool.location.longitude.toFixed(8) : '';
    this.inputAlt.value = this.tool.location.altitude !== null ? this.tool.location.altitude.toFixed(1) : '';
    this.inputDate.value = this.tool.location.date || '';
    this.inputTime.value = this.tool.location.time || '';

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

    // Grupo Modelos Básicos
    const groupModels = document.createElement('optgroup');
    groupModels.label = 'Modelos Padrão (Diretriz)';
    BUILT_IN_MODELS.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      groupModels.appendChild(opt);
    });
    this.presetsSelect.appendChild(groupModels);

    // Grupo Presets Especializados
    const groupPresets = document.createElement('optgroup');
    groupPresets.label = 'Presets por Atividade';
    PRESET_CATEGORIES.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      groupPresets.appendChild(opt);
    });
    this.presetsSelect.appendChild(groupPresets);

    // Presets Customizados do Usuário
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
    // 1. Verifica nos modelos padrão
    const model = BUILT_IN_MODELS.find(m => m.id === presetId);
    if (model) {
      this.tool.applyModel(model);
      this.syncControlsWithSettings();
      this.renderFieldsList();
      this.app.requestRender();
      return;
    }

    // 2. Verifica nos presets especializados
    const cat = PRESET_CATEGORIES.find(c => c.id === presetId);
    if (cat) {
      const baseModel = BUILT_IN_MODELS.find(m => m.id === cat.baseModelId) || BUILT_IN_MODELS[0];
      this.tool.applyModel(baseModel);
      this.tool.selectedModelId = cat.id;

      if (cat.customFields) {
        cat.customFields.forEach(cf => {
          const exists = this.tool.activeFields.find(f => f.id === cf.id);
          if (exists) {
            exists.enabled = true;
            exists.customValue = cf.defaultValue;
          } else {
            this.tool.activeFields.push({
              id: cf.id,
              name: cf.label,
              label: cf.label,
              enabled: true,
              showLabel: cf.showLabel,
              isCustom: true,
              customValue: cf.defaultValue,
              order: this.tool.activeFields.length
            });
          }
        });
      }

      this.syncControlsWithSettings();
      this.renderFieldsList();
      this.app.requestRender();
      return;
    }

    // 3. Verifica nos presets do usuário
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

    // Sincroniza botões de posição
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
  }

  renderFieldsList() {
    this.fieldsContainer.innerHTML = '';

    this.tool.activeFields.forEach((field, index) => {
      const row = document.createElement('div');
      row.className = `field-item ${field.enabled ? 'enabled' : 'disabled'}`;
      row.dataset.id = field.id;

      // Checkbox de ativação
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'field-checkbox';
      check.checked = field.enabled;
      check.title = 'Ativar/desativar campo';
      check.addEventListener('change', (e) => {
        field.enabled = e.target.checked;
        row.classList.toggle('enabled', field.enabled);
        row.classList.toggle('disabled', !field.enabled);
        this.app.requestRender();
      });

      // Rótulo / Label editável
      const labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.className = 'field-label-input';
      labelInput.value = field.label;
      labelInput.title = 'Rótulo exibido no carimbo';
      labelInput.addEventListener('input', (e) => {
        field.label = e.target.value;
        this.app.requestRender();
      });

      // Valor prévio ou editável se for custom
      const valSpan = document.createElement('div');
      valSpan.className = 'field-value-preview';

      if (field.isCustom) {
        const valInput = document.createElement('input');
        valInput.type = 'text';
        valInput.className = 'field-custom-input';
        valInput.value = field.customValue;
        valInput.placeholder = 'Valor do campo...';
        valInput.addEventListener('input', (e) => {
          field.customValue = e.target.value;
          this.app.requestRender();
        });
        valSpan.appendChild(valInput);
      } else {
        const currentVal = this.tool.getFieldValue(field.id, field) || '(vazio)';
        valSpan.textContent = currentVal;
      }

      // Checkbox para exibir ou ocultar o rótulo
      const toggleLabelBtn = document.createElement('button');
      toggleLabelBtn.type = 'button';
      toggleLabelBtn.className = `btn-icon ${field.showLabel ? 'active' : ''}`;
      toggleLabelBtn.title = field.showLabel ? 'Rótulo visível' : 'Rótulo oculto (apenas valor)';
      toggleLabelBtn.innerHTML = '🏷️';
      toggleLabelBtn.addEventListener('click', () => {
        field.showLabel = !field.showLabel;
        toggleLabelBtn.classList.toggle('active', field.showLabel);
        this.app.requestRender();
      });

      // Botões de reordenação (Cima / Baixo)
      const btnUp = document.createElement('button');
      btnUp.type = 'button';
      btnUp.className = 'btn-icon';
      btnUp.innerHTML = '↑';
      btnUp.title = 'Mover para cima';
      btnUp.disabled = index === 0;
      btnUp.addEventListener('click', () => {
        this.tool.moveField(field.id, 'up');
        this.renderFieldsList();
        this.app.requestRender();
      });

      const btnDown = document.createElement('button');
      btnDown.type = 'button';
      btnDown.className = 'btn-icon';
      btnDown.innerHTML = '↓';
      btnDown.title = 'Mover para baixo';
      btnDown.disabled = index === this.tool.activeFields.length - 1;
      btnDown.addEventListener('click', () => {
        this.tool.moveField(field.id, 'down');
        this.renderFieldsList();
        this.app.requestRender();
      });

      // Botão excluir se for custom
      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.className = 'btn-icon btn-delete';
      btnDelete.innerHTML = '✕';
      btnDelete.title = 'Remover campo';
      btnDelete.addEventListener('click', () => {
        this.tool.removeField(field.id);
        this.renderFieldsList();
        this.app.requestRender();
      });

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'field-actions';
      actionsDiv.appendChild(toggleLabelBtn);
      actionsDiv.appendChild(btnUp);
      actionsDiv.appendChild(btnDown);
      if (field.isCustom) actionsDiv.appendChild(btnDelete);

      row.appendChild(check);
      row.appendChild(labelInput);
      row.appendChild(valSpan);
      row.appendChild(actionsDiv);

      this.fieldsContainer.appendChild(row);
    });
  }
}
