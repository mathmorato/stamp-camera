/**
 * STAMP-CAMERA - Camada de Interface do Usuário (UI Controller)
 * Gerencia formulários, listas de campos editáveis, sincronização bidirecional,
 * drag-and-drop no canvas, alertas de EXIF, badges de origem (AUTO/MANUAL) e sincronização em tempo real.
 */

import { BUILT_IN_MODELS, PRESET_CATEGORIES, STANDARD_FIELD_DEFS } from '../../templates.js';
import { COORD_FORMATS, DATE_FORMATS, TIME_FORMATS, STAMP_POSITIONS, LABEL_MODES, STAMP_LAYOUTS, FIELD_ICONS, getLineArtSvg } from '../../config.js';
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
    this.dragHintPill = document.getElementById('dragHintPill');

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

    // Campos de Localização (Painel Direito)
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

    // Lista de campos do carimbo (Painel Esquerdo)
    this.fieldsContainer = document.getElementById('fieldsContainer');
    this.btnAddField = document.getElementById('btnAddField');
    this.addFieldMenu = document.getElementById('addFieldMenu');

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
    this.selectLabelMode = document.getElementById('selectLabelMode');
    this.selectInlineLayout = document.getElementById('selectInlineLayout');

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
    // Alternância de Abas nos painéis
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        const panel = btn.closest('.panel');
        if (panel) {
          panel.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          panel.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          const target = panel.querySelector(`#tab-${tab}`);
          if (target) target.classList.add('active');
        }
      });
    });

    // Posições em Grade (9 Pontos)
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
      this.updateFieldInputValue('coordinates', this.tool.getFieldValue('coordinates'));
      this.updateFieldInputValue('lat', this.tool.getFieldValue('lat'));
      this.updateFieldInputValue('lon', this.tool.getFieldValue('lon'));
      this.app.requestRender();
    });

    this.selectDateFormat.addEventListener('change', (e) => {
      this.tool.settings.dateFormat = e.target.value;
      if (this.tool.location.dateObj) {
        this.tool.location.date = this.tool.formatDateString(this.tool.location.dateObj, e.target.value);
        this.inputDate.value = this.tool.location.date;
        this.updateFieldInputValue('date', this.tool.location.date);
        this.updateFieldInputValue('datetime', this.tool.getFieldValue('datetime'));
      }
      this.app.requestRender();
    });

    this.selectTimeFormat.addEventListener('change', (e) => {
      this.tool.settings.timeFormat = e.target.value;
      if (this.tool.location.dateObj) {
        this.tool.location.time = this.tool.formatTimeString(this.tool.location.dateObj, e.target.value);
        this.inputTime.value = this.tool.location.time;
        this.updateFieldInputValue('time', this.tool.location.time);
        this.updateFieldInputValue('datetime', this.tool.getFieldValue('datetime'));
      }
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

    if (this.selectLabelMode) {
      this.selectLabelMode.addEventListener('change', (e) => {
        this.tool.settings.labelMode = e.target.value;
        this.app.requestRender();
      });
    }

    if (this.selectInlineLayout) {
      this.selectInlineLayout.addEventListener('change', (e) => {
        this.tool.settings.inlineLayout = e.target.value;
        this.app.requestRender();
      });
    }

    // Numeração Automática
    this.checkAutoNumber.addEventListener('change', (e) => {
      this.tool.numbering.enabled = e.target.checked;
      this.updateFieldInputValue('photo_id', this.tool.getFieldValue('photo_id'));
      this.app.requestRender();
    });

    this.inputNumberPrefix.addEventListener('input', (e) => {
      this.tool.numbering.prefix = e.target.value;
      this.updateFieldInputValue('photo_id', this.tool.getFieldValue('photo_id'));
      this.app.requestRender();
    });

    this.inputNumberStart.addEventListener('input', (e) => {
      this.tool.numbering.startNumber = parseInt(e.target.value, 10) || 1;
      this.updateFieldInputValue('photo_id', this.tool.getFieldValue('photo_id'));
      this.app.requestRender();
    });

    this.inputNumberDigits.addEventListener('input', (e) => {
      this.tool.numbering.digits = parseInt(e.target.value, 10) || 2;
      this.updateFieldInputValue('photo_id', this.tool.getFieldValue('photo_id'));
      this.app.requestRender();
    });

    // Exportação - qualidade fixada em 100% máxima sem exibir opção de compressão com perda
    if (this.selectExportFormat) {
      this.selectExportFormat.addEventListener('change', () => {
        if (this.qualityGroup) this.qualityGroup.style.display = 'none';
      });
    }

    if (this.rangeExportQuality) {
      this.rangeExportQuality.value = '1.0';
      this.rangeExportQuality.addEventListener('input', (e) => {
        const val = Math.round(parseFloat(e.target.value) * 100);
        if (this.valExportQuality) this.valExportQuality.textContent = `${val}%`;
      });
    }

    // Sincronização dos campos do painel direito (Localização & Técnico)
    this.bindLocationInputs();

    // Eventos de drag-and-drop de arquivo
    this.bindFileDropEvents();

    // Eventos de movimentação do carimbo no Canvas
    this.bindCanvasStampDrag();

    // Botão Adicionar Campo (+ Novo Campo com Dropdown)
    if (this.btnAddField) {
      this.btnAddField.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleAddFieldMenu();
      });
    }

    document.addEventListener('click', (e) => {
      if (this.addFieldMenu && this.addFieldMenu.style.display !== 'none') {
        if (!this.btnAddField?.contains(e.target) && !this.addFieldMenu.contains(e.target)) {
          this.addFieldMenu.style.display = 'none';
        }
      }
    });

    // Seleção de Preset / Modelo
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
            defaultValue: f.customValue || this.tool.getFieldValue(f.id, f)
          }))
        };
        storage.saveCustomPreset(customPreset);
        this.renderPresetsList();
        this.presetsSelect.value = customPreset.id;
        alert('Modelo salvo com sucesso no navegador!');
      }
    });
  }

  /**
   * Vincula os inputs do painel direito com sincronização bidirecional
   */
  bindLocationInputs() {
    // Latitude manual
    this.inputLat.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= -90 && val <= 90) {
        this.tool.location.latitude = val;
        this.tool.location.sources.latitude = 'MANUAL';
        this.updateSourceBadges();
        this.updateFieldInputValue('lat', this.tool.getFieldValue('lat'));
        this.updateFieldInputValue('coordinates', this.tool.getFieldValue('coordinates'));
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
        this.updateFieldInputValue('lon', this.tool.getFieldValue('lon'));
        this.updateFieldInputValue('coordinates', this.tool.getFieldValue('coordinates'));
        this.app.requestRender();
      }
    });

    // Altitude manual
    this.inputAlt.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.tool.location.altitude = isNaN(val) ? null : val;
      this.tool.location.sources.altitude = 'MANUAL';
      this.updateSourceBadges();
      this.updateFieldInputValue('altitude', this.tool.getFieldValue('altitude'));
      this.app.requestRender();
    });

    // Data manual
    this.inputDate.addEventListener('input', (e) => {
      this.tool.location.date = e.target.value;
      this.tool.location.sources.date = 'MANUAL';
      this.updateSourceBadges();
      this.updateFieldInputValue('date', e.target.value);
      this.updateFieldInputValue('datetime', this.tool.getFieldValue('datetime'));
      this.app.requestRender();
    });

    // Hora manual
    this.inputTime.addEventListener('input', (e) => {
      this.tool.location.time = e.target.value;
      this.tool.location.sources.time = 'MANUAL';
      this.updateSourceBadges();
      this.updateFieldInputValue('time', e.target.value);
      this.updateFieldInputValue('datetime', this.tool.getFieldValue('datetime'));
      this.app.requestRender();
    });

    // Campos de Endereço e Dados Técnicos
    const bindText = (inputElem, key, fieldId, relatedFieldIds = []) => {
      inputElem.addEventListener('input', (e) => {
        this.tool.location[key] = e.target.value;
        this.tool.location.sources[key] = 'MANUAL';
        this.updateFieldInputValue(fieldId, e.target.value);
        for (const relId of relatedFieldIds) {
          this.updateFieldInputValue(relId, this.tool.getFieldValue(relId));
        }
        this.app.requestRender();
      });
    };

    bindText(this.inputStreet, 'street', 'street', ['address_street_num']);
    bindText(this.inputNumber, 'number', 'number', ['address_street_num']);
    bindText(this.inputNeighborhood, 'neighborhood', 'neighborhood');
    bindText(this.inputCity, 'city', 'city', ['locality', 'city_state_country']);
    bindText(this.inputState, 'state', 'state', ['locality', 'city_state_country']);
    bindText(this.inputCountry, 'country', 'country', ['city_state_country']);
    bindText(this.inputPostalCode, 'postalCode', 'postal_code');
    bindText(this.inputProjectName, 'projectName', 'project_name');
    bindText(this.inputProcess, 'process', 'process');
    bindText(this.inputResponsible, 'responsible', 'responsible');
  }

  /**
   * Atualiza o valor exibido no input de um campo na aba "Campos"
   */
  updateFieldInputValue(fieldId, value) {
    if (!this.fieldsContainer) return;
    const row = this.fieldsContainer.querySelector(`[data-id="${fieldId}"]`);
    if (row) {
      const valInput = row.querySelector('.field-value-input');
      if (valInput && valInput !== document.activeElement) {
        valInput.value = value || '';
      }
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

    const onMove = (e) => {
      if (!this.tool.photo) return;
      const { x, y } = getCanvasCoords(e);

      if (this.isDraggingStamp) {
        const deltaX = x - this.dragStart.x;
        const deltaY = y - this.dragStart.y;

        const newX = this.stampStartPos.x + deltaX;
        const newY = this.stampStartPos.y + deltaY;

        this.tool.settings.position = STAMP_POSITIONS.CUSTOM;
        this.tool.settings.customPosX = Math.max(0, Math.min(1, newX / canvas.width));
        this.tool.settings.customPosY = Math.max(0, Math.min(1, newY / canvas.height));

        this.posButtons.forEach(b => b.classList.remove('active'));
        this.app.requestRender();
      } else {
        if (this.engine.isPointInsideStamp(x, y)) {
          canvas.style.cursor = 'grab';
        } else {
          canvas.style.cursor = 'default';
        }
      }
    };

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
   * Sincroniza todos os controles quando uma nova fotografia é carregada
   */
  syncPhotoState() {
    if (!this.tool.photo) {
      this.emptyPlaceholder.style.display = 'flex';
      this.previewCanvas.style.display = 'none';
      this.imageInfoBar.style.display = 'none';
      if (this.dragHintPill) this.dragHintPill.style.display = 'none';
      return;
    }

    this.emptyPlaceholder.style.display = 'none';
    this.previewCanvas.style.display = 'block';
    this.imageInfoBar.style.display = 'flex';
    if (this.dragHintPill) this.dragHintPill.style.display = 'block';

    const w = this.tool.photo.width;
    const h = this.tool.photo.height;
    const sizeMb = (this.tool.photo.fileSize / (1024 * 1024)).toFixed(2);
    this.photoMetaText.textContent = `${this.tool.photo.filename} • ${w} × ${h} px • ${sizeMb} MB`;

    // Sincroniza TODOS os inputs do painel direito com os dados da localização
    this.inputLat.value = this.tool.location.latitude !== null ? this.tool.location.latitude.toFixed(8) : '';
    this.inputLon.value = this.tool.location.longitude !== null ? this.tool.location.longitude.toFixed(8) : '';
    this.inputAlt.value = this.tool.location.altitude !== null ? this.tool.location.altitude.toFixed(1) : '';
    this.inputDate.value = this.tool.location.date || '';
    this.inputTime.value = this.tool.location.time || '';
    this.inputStreet.value = this.tool.location.street || '';
    this.inputNumber.value = this.tool.location.number || '';
    this.inputNeighborhood.value = this.tool.location.neighborhood || '';
    this.inputCity.value = this.tool.location.city || '';
    this.inputState.value = this.tool.location.state || '';
    this.inputCountry.value = this.tool.location.country || '';
    this.inputPostalCode.value = this.tool.location.postalCode || '';
    this.inputProjectName.value = this.tool.location.projectName || '';
    this.inputProcess.value = this.tool.location.process || '';
    this.inputResponsible.value = this.tool.location.responsible || '';

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

    // Modelos Padrão
    const groupModels = document.createElement('optgroup');
    groupModels.label = 'Modelos Padrão (Diretriz)';
    BUILT_IN_MODELS.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      groupModels.appendChild(opt);
    });
    this.presetsSelect.appendChild(groupModels);

    // Presets Especializados
    const groupPresets = document.createElement('optgroup');
    groupPresets.label = 'Presets por Atividade';
    PRESET_CATEGORIES.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      groupPresets.appendChild(opt);
    });
    this.presetsSelect.appendChild(groupPresets);

    // Presets do Usuário
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
    const model = BUILT_IN_MODELS.find(m => m.id === presetId);
    if (model) {
      this.tool.applyModel(model);
      this.syncControlsWithSettings();
      this.renderFieldsList();
      this.app.requestRender();
      return;
    }

    const cat = PRESET_CATEGORIES.find(c => c.id === presetId);
    if (cat) {
      const baseModel = BUILT_IN_MODELS.find(m => m.id === cat.baseModelId) || BUILT_IN_MODELS[0];
      this.tool.applyModel(baseModel);
      this.tool.selectedModelId = cat.id;

      if (cat.enabledFields) {
        for (const f of this.tool.activeFields) {
          f.enabled = cat.enabledFields.includes(f.id);
        }
      }

      if (cat.fieldDefaults) {
        for (const [k, v] of Object.entries(cat.fieldDefaults)) {
          this.tool.setFieldValue(k, v);
        }
      }

      this.syncControlsWithSettings();
      this.renderFieldsList();
      this.app.requestRender();
      return;
    }

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
    if (this.selectLabelMode) this.selectLabelMode.value = s.labelMode || 'icons';
    if (this.selectInlineLayout) this.selectInlineLayout.value = s.inlineLayout || 'multiline';
  }

  /**
   * Renderiza a lista de campos no painel esquerdo:
   * Cada campo possui:
   * - Checkbox de ativar/desativar
   * - Rótulo editável
   * - Valor editável diretamente na linha com sincronização bidirecional
   * - Botão de mostrar/ocultar rótulo (🏷️)
   * - Botões de reordenação (↑ e ↓)
   * - Botão de excluir se for campo customizado
   */
  toggleAddFieldMenu() {
    if (!this.addFieldMenu) {
      this.tool.addCustomField('Campo Personalizado', 'Valor');
      this.renderFieldsList();
      this.app.requestRender();
      return;
    }

    const isVisible = this.addFieldMenu.style.display === 'flex';
    if (isVisible) {
      this.addFieldMenu.style.display = 'none';
      return;
    }

    this.renderAddFieldMenu();
    this.addFieldMenu.style.display = 'flex';
  }

  renderAddFieldMenu() {
    if (!this.addFieldMenu) return;
    this.addFieldMenu.innerHTML = '';

    // 1. Opção: Campo Personalizado
    const btnCustom = document.createElement('button');
    btnCustom.type = 'button';
    btnCustom.className = 'add-field-menu-item';
    btnCustom.innerHTML = `
      <span class="menu-item-icon">
        <svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </span>
      <span><strong>+ Campo Personalizado</strong></span>
    `;
    btnCustom.addEventListener('click', () => {
      this.tool.addCustomField('Campo Personalizado', 'Valor');
      this.addFieldMenu.style.display = 'none';
      this.renderFieldsList();
      this.app.requestRender();
    });
    this.addFieldMenu.appendChild(btnCustom);

    // 2. Opções: Campos padrão opcionais sob demanda ainda não adicionados
    const availableOnDemand = this.tool.activeFields.filter(f => f.isOptionalOnDemand && !f.added && !f.enabled);

    if (availableOnDemand.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'add-field-menu-divider';
      this.addFieldMenu.appendChild(divider);

      const title = document.createElement('div');
      title.className = 'add-field-menu-title';
      title.textContent = 'Campos Técnicos & Amostra';
      this.addFieldMenu.appendChild(title);

      for (const field of availableOnDemand) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'add-field-menu-item';
        item.innerHTML = `
          <span class="menu-item-icon">${getLineArtSvg(field.icon || field.id)}</span>
          <span>+ ${field.name || field.label}</span>
        `;
        item.addEventListener('click', () => {
          this.tool.addStandardField(field.id);
          this.addFieldMenu.style.display = 'none';
          this.renderFieldsList();
          this.app.requestRender();
          if (this.app && typeof this.app.showToast === 'function') {
            this.app.showToast(`Campo "${field.label}" adicionado.`);
          }
        });
        this.addFieldMenu.appendChild(item);
      }
    }
  }

  /**
   * Renderiza a lista de campos no painel esquerdo:
   * Cada campo possui:
   * - Checkbox de ativar/desativar
   * - Rótulo editável
   * - Valor editável diretamente na linha com sincronização bidirecional
   * - Botão de mostrar/ocultar rótulo (🏷️)
   * - Botões de reordenação (↑ e ↓)
   * - Botão de excluir se for campo customizado ou campo sob demanda
   */
  renderFieldsList() {
    this.fieldsContainer.innerHTML = '';

    const fieldsToRender = this.tool.activeFields.filter(f => {
      if (f.isOptionalOnDemand && !f.added && !f.enabled) {
        return false;
      }
      return true;
    });

    fieldsToRender.forEach((field, index) => {
      const row = document.createElement('div');
      row.className = `field-item ${field.enabled ? 'enabled' : 'disabled'}`;
      row.dataset.id = field.id;

      // 1. Checkbox de ativação/desativação
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'field-checkbox';
      check.checked = field.enabled;
      check.title = 'Ativar/desativar campo no carimbo';
      check.addEventListener('change', (e) => {
        field.enabled = e.target.checked;
        row.classList.toggle('enabled', field.enabled);
        row.classList.toggle('disabled', !field.enabled);
        this.app.requestRender();
      });

      // 2. Rótulo / Nome do campo (editável)
      const labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.className = 'field-label-input';
      labelInput.value = field.label;
      labelInput.title = 'Rótulo exibido no carimbo (ex: DATA, LOCAL, OBRA)';
      labelInput.addEventListener('input', (e) => {
        field.label = e.target.value;
        this.app.requestRender();
      });

      // 3. Valor do campo (EDITÁVEL para todos os campos!)
      const currentVal = this.tool.getFieldValue(field.id, field);
      const def = STANDARD_FIELD_DEFS.find(d => d.id === field.id);
      const placeholderText = def ? def.placeholder : 'Valor...';

      const valInput = document.createElement('input');
      valInput.type = 'text';
      valInput.className = 'field-value-input';
      valInput.value = currentVal || '';
      valInput.placeholder = placeholderText;
      valInput.title = 'Editar valor do campo diretamente';

      valInput.addEventListener('input', (e) => {
        const newVal = e.target.value;
        this.tool.setFieldValue(field.id, newVal);

        // Sincroniza com os inputs correspondentes no painel direito se existirem
        this.syncRightPanelInput(field.id, newVal);

        // Se o campo estiver desmarcado mas o usuário digitou, pode continuar ou manter o estado
        this.app.requestRender();
      });

      // 4. Ações: Rótulo Visível, Mover Cima, Mover Baixo, Excluir
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'field-actions';

      const toggleLabelBtn = document.createElement('button');
      toggleLabelBtn.type = 'button';
      toggleLabelBtn.className = `btn-icon ${field.showLabel ? 'active' : ''}`;
      toggleLabelBtn.title = field.showLabel ? 'Rótulo visível no carimbo' : 'Rótulo oculto (apenas o valor)';
      toggleLabelBtn.innerHTML = '<svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
      toggleLabelBtn.addEventListener('click', () => {
        field.showLabel = !field.showLabel;
        toggleLabelBtn.classList.toggle('active', field.showLabel);
        this.app.requestRender();
      });

      const btnUp = document.createElement('button');
      btnUp.type = 'button';
      btnUp.className = 'btn-icon';
      btnUp.innerHTML = '<svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
      btnUp.title = 'Mover campo para cima';
      btnUp.disabled = index === 0;
      btnUp.addEventListener('click', () => {
        this.tool.moveField(field.id, 'up');
        this.renderFieldsList();
        this.app.requestRender();
      });

      const btnDown = document.createElement('button');
      btnDown.type = 'button';
      btnDown.className = 'btn-icon';
      btnDown.innerHTML = '<svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
      btnDown.title = 'Mover campo para baixo';
      btnDown.disabled = index === fieldsToRender.length - 1;
      btnDown.addEventListener('click', () => {
        this.tool.moveField(field.id, 'down');
        this.renderFieldsList();
        this.app.requestRender();
      });

      actionsDiv.appendChild(toggleLabelBtn);
      actionsDiv.appendChild(btnUp);
      actionsDiv.appendChild(btnDown);

      if (field.isCustom || field.isOptionalOnDemand) {
        const btnDelete = document.createElement('button');
        btnDelete.type = 'button';
        btnDelete.className = 'btn-icon btn-delete';
        btnDelete.innerHTML = '<svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        btnDelete.title = field.isCustom ? 'Remover campo personalizado' : 'Ocultar campo';
        btnDelete.addEventListener('click', () => {
          this.tool.removeField(field.id);
          this.renderFieldsList();
          this.app.requestRender();
        });
        actionsDiv.appendChild(btnDelete);
      }

      // 1.5. Ícone inline do campo (formato line-art)
      const iconTag = document.createElement('span');
      iconTag.className = 'field-icon-tag';
      iconTag.innerHTML = getLineArtSvg(field.icon || field.id);
      iconTag.title = 'Ícone line art do campo exibido no carimbo';

      row.appendChild(check);
      row.appendChild(iconTag);
      row.appendChild(labelInput);
      row.appendChild(valInput);
      row.appendChild(actionsDiv);

      this.fieldsContainer.appendChild(row);
    });
  }

  /**
   * Sincroniza do painel esquerdo para o painel direito
   */
  syncRightPanelInput(fieldId, value) {
    const inputMap = {
      'date': this.inputDate,
      'time': this.inputTime,
      'lat': this.inputLat,
      'lon': this.inputLon,
      'altitude': this.inputAlt,
      'street': this.inputStreet,
      'number': this.inputNumber,
      'neighborhood': this.inputNeighborhood,
      'city': this.inputCity,
      'state': this.inputState,
      'country': this.inputCountry,
      'postal_code': this.inputPostalCode,
      'project_name': this.inputProjectName,
      'process': this.inputProcess,
      'responsible': this.inputResponsible
    };

    const targetInput = inputMap[fieldId];
    if (targetInput && targetInput !== document.activeElement) {
      targetInput.value = value;
    }

    this.updateSourceBadges();
  }
}
