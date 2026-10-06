/**
 * STAMP-CAMERA - Camada de Interface do Usuário (UI Controller)
 * Gerencia formulários, listas de campos editáveis, sincronização bidirecional,
 * drag-and-drop no canvas, alertas de EXIF, badges de origem (AUTO/MANUAL) e sincronização em tempo real.
 */

import { BUILT_IN_MODELS, PRESET_CATEGORIES, STANDARD_FIELD_DEFS } from '../../templates.js';
import { COORD_FORMATS, DATE_FORMATS, TIME_FORMATS, STAMP_POSITIONS, LABEL_MODES, STAMP_LAYOUTS, FIELD_ICONS, getLineArtSvg } from '../../config.js';
import { parseCoordinateString, isValidCoordinate, formatCoordinates } from '../../geolocation.js';
import { storage } from '../../storage.js';
import { reverseGeocode } from '../../geocoder.js';
import { readExifData } from '../../exif-reader.js';
import { loadImageFromFile } from '../../image-loader.js';
import { exportStampedPhotosBatch } from '../../export.js';

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

    // Badges de Origem (AUTO / MANUAL)
    this.badgeLat = document.getElementById('badgeLat');
    this.badgeLon = document.getElementById('badgeLon');
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
    this.btnLabelModeTrigger = document.getElementById('btnLabelModeTrigger');
    this.menuLabelMode = document.getElementById('menuLabelMode');
    this.customLabelModeWrapper = document.getElementById('customLabelModeWrapper');
    this.selectInlineLayout = document.getElementById('selectInlineLayout');

    // Grid de Posições
    this.posButtons = document.querySelectorAll('.pos-btn');

    // Exportação
    this.selectExportFormat = document.getElementById('selectExportFormat');
    this.rangeExportQuality = document.getElementById('rangeExportQuality');
    this.valExportQuality = document.getElementById('valExportQuality');
    this.qualityGroup = document.getElementById('qualityGroup');
    this.checkPreserveExif = document.getElementById('checkPreserveExif');
    this.exportExifNote = document.getElementById('exportExifNote');

    // Selo de Origem no Carimbo
    this.checkOriginStampBadge = document.getElementById('checkOriginStampBadge');

    // GPS e Câmera Móvel
    this.btnDeviceGps = document.getElementById('btnDeviceGps');
    this.btnCaptureCamera = document.getElementById('btnCaptureCamera');
    this.cameraInput = document.getElementById('cameraInput');
    this.btnPlaceholderCamera = document.getElementById('btnPlaceholderCamera');
    this.btnPlaceholderBatch = document.getElementById('btnPlaceholderBatch');

    // Processamento em Lote
    this.btnBatchModal = document.getElementById('btnBatchModal');
    this.btnOpenBatchFromExport = document.getElementById('btnOpenBatchFromExport');
    this.batchModal = document.getElementById('batchModal');
    this.btnCloseBatchModal = document.getElementById('btnCloseBatchModal');
    this.btnAddBatchFiles = document.getElementById('btnAddBatchFiles');
    this.batchFileInput = document.getElementById('batchFileInput');
    this.batchListContainer = document.getElementById('batchListContainer');
    this.batchCountText = document.getElementById('batchCountText');
    this.batchBadge = document.getElementById('batchBadge');
    this.btnClearBatch = document.getElementById('btnClearBatch');
    this.btnExportBatchZip = document.getElementById('btnExportBatchZip');
    this.batchProgressWrapper = document.getElementById('batchProgressWrapper');
    this.batchProgressFill = document.getElementById('batchProgressFill');
    this.batchProgressText = document.getElementById('batchProgressText');
    this.batchPrefix = document.getElementById('batchPrefix');
    this.batchStartNum = document.getElementById('batchStartNum');
    this.batchPreserveExif = document.getElementById('batchPreserveExif');
    this.batchPhotos = [];

    // Numeração automática
    this.checkAutoNumber = document.getElementById('checkAutoNumber');
    this.inputNumberPrefix = document.getElementById('inputNumberPrefix');
    this.inputNumberStart = document.getElementById('inputNumberStart');
    this.inputNumberDigits = document.getElementById('inputNumberDigits');

    // Modal de Confirmação (Separar / Unificar)
    this.confirmActionModal = document.getElementById('confirmActionModal');
    this.confirmModalTitle = document.getElementById('confirmModalTitle');
    this.confirmModalMessage = document.getElementById('confirmModalMessage');
    this.btnConfirmModalClose = document.getElementById('btnConfirmModalClose');
    this.btnConfirmModalCancel = document.getElementById('btnConfirmModalCancel');
    this.btnConfirmModalOk = document.getElementById('btnConfirmModalOk');
    this.pendingConfirmAction = null;

    // Botões de Alternância Rápida (Separar / Unificar) no painel de Localização
    this.btnToggleSplitCoords = document.getElementById('btnToggleSplitCoords');
    this.btnToggleSplitDateTime = document.getElementById('btnToggleSplitDateTime');
    this.btnToggleSplitAddress = document.getElementById('btnToggleSplitAddress');
    this.btnToggleSplitLocality = document.getElementById('btnToggleSplitLocality');

    // Botão de Rotação Rápida no Cabeçalho Superior
    this.btnHeaderRotate = document.getElementById('btnHeaderRotate');

    // Botões de Rotação da Imagem (Barra Superior do Preview)
    this.btnRotateLeft = document.getElementById('btnRotateLeft');
    this.btnRotateRight = document.getElementById('btnRotateRight');
    this.btnRotate180 = document.getElementById('btnRotate180');
    this.btnFlipH = document.getElementById('btnFlipH');
    this.btnFlipV = document.getElementById('btnFlipV');

    // Barra Flutuante de Rotação sobre o Canvas
    this.floatingRotateBar = document.getElementById('floatingRotateBar');
    this.btnFloatRotateLeft = document.getElementById('btnFloatRotateLeft');
    this.btnFloatRotateRight = document.getElementById('btnFloatRotateRight');
    this.btnFloatRotate180 = document.getElementById('btnFloatRotate180');
    this.btnFloatFlipH = document.getElementById('btnFloatFlipH');
    this.btnFloatFlipV = document.getElementById('btnFloatFlipV');

    // Botões de Rotação na Aba de Modelos (Barra Lateral)
    this.btnSidebarRotateLeft = document.getElementById('btnSidebarRotateLeft');
    this.btnSidebarRotateRight = document.getElementById('btnSidebarRotateRight');
    this.btnSidebarRotate180 = document.getElementById('btnSidebarRotate180');
    this.btnSidebarFlipH = document.getElementById('btnSidebarFlipH');
    this.btnSidebarFlipV = document.getElementById('btnSidebarFlipV');

    // Indicador Discreto de Salvamento no Topo
    this.saveStatusIndicator = document.getElementById('saveStatusIndicator');
    this.saveStatusDot = document.getElementById('saveStatusDot');
    this.saveStatusText = document.getElementById('saveStatusText');

    // Banner de Retomada de Trabalho Anterior (IndexedDB)
    this.draftRestoreBanner = document.getElementById('draftRestoreBanner');
    this.btnRestoreDraft = document.getElementById('btnRestoreDraft');
    this.btnDiscardDraft = document.getElementById('btnDiscardDraft');

    // Botões de Ações de Modelos & Presets
    this.btnDuplicatePreset = document.getElementById('btnDuplicatePreset');
    this.btnRenamePreset = document.getElementById('btnRenamePreset');
    this.btnDeletePreset = document.getElementById('btnDeletePreset');
    this.modelFactoryNote = document.getElementById('modelFactoryNote');

    // Botão de Redefinir Numeração
    this.btnResetNumbering = document.getElementById('btnResetNumbering');

    // Backup & Limpeza de Dados
    this.btnExportBackupJson = document.getElementById('btnExportBackupJson');
    this.btnImportBackupJson = document.getElementById('btnImportBackupJson');
    this.backupFileInput = document.getElementById('backupFileInput');
    this.btnClearAllBrowserData = document.getElementById('btnClearAllBrowserData');

    // Modal de Escolha de Importação
    this.importChoiceModal = document.getElementById('importChoiceModal');
    this.btnCloseImportModal = document.getElementById('btnCloseImportModal');
    this.btnImportCancel = document.getElementById('btnImportCancel');
    this.btnImportReplace = document.getElementById('btnImportReplace');
    this.btnImportMerge = document.getElementById('btnImportMerge');
    this.pendingImportJson = null;

    // Timer do auto-save com debounce de 500ms
    this.autoSaveTimer = null;
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
        this.scheduleAutoSave();
        this.app.requestRender();
      });
    });

    // Mudança de formatos
    this.selectCoordFormat.addEventListener('change', (e) => {
      this.tool.settings.coordFormat = e.target.value;
      this.updateFieldInputValue('coordinates', this.tool.getFieldValue('coordinates'));
      this.updateFieldInputValue('lat', this.tool.getFieldValue('lat'));
      this.updateFieldInputValue('lon', this.tool.getFieldValue('lon'));
      this.scheduleAutoSave();
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
      this.scheduleAutoSave();
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
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    // Estilos Visuais
    this.selectFontFamily.addEventListener('change', (e) => {
      this.tool.settings.fontFamily = e.target.value;
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.rangeFontSize.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.valFontSize.textContent = `${val}px`;
      this.tool.settings.fontSize = val;
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.colorText.addEventListener('input', (e) => {
      this.tool.settings.textColor = e.target.value;
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.colorBg.addEventListener('input', (e) => {
      this.tool.settings.backgroundColor = e.target.value;
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.selectBgType.addEventListener('change', (e) => {
      this.tool.settings.backgroundType = e.target.value;
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.rangeBgOpacity.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.valBgOpacity.textContent = `${val}%`;
      this.tool.settings.backgroundOpacity = val;
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.selectBorderWidth.addEventListener('change', (e) => {
      this.tool.settings.borderWidth = parseInt(e.target.value, 10);
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.colorBorder.addEventListener('input', (e) => {
      this.tool.settings.borderColor = e.target.value;
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.rangeBorderRadius.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.valBorderRadius.textContent = `${val}px`;
      this.tool.settings.borderRadius = val;
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.checkShadow.addEventListener('change', (e) => {
      this.tool.settings.hasShadow = e.target.checked;
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.checkBold.addEventListener('change', (e) => {
      this.tool.settings.fontWeight = e.target.checked ? '700' : '400';
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.checkItalic.addEventListener('change', (e) => {
      this.tool.settings.isItalic = e.target.checked;
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.selectTextAlign.addEventListener('change', (e) => {
      this.tool.settings.textAlign = e.target.value;
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    if (this.selectLabelMode) {
      this.selectLabelMode.addEventListener('change', (e) => {
        this.tool.settings.labelMode = e.target.value;
        this.syncLabelModeCustomUI(e.target.value);
        this.scheduleAutoSave();
        this.app.requestRender();
      });
    }

    if (this.btnLabelModeTrigger) {
      this.btnLabelModeTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.menuLabelMode) {
          const isOpen = this.menuLabelMode.style.display === 'flex';
          this.menuLabelMode.style.display = isOpen ? 'none' : 'flex';
        }
      });
    }

    if (this.menuLabelMode) {
      const items = this.menuLabelMode.querySelectorAll('.custom-label-mode-item');
      items.forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = item.dataset.value;
          if (this.selectLabelMode) {
            this.selectLabelMode.value = val;
            this.selectLabelMode.dispatchEvent(new Event('change', { bubbles: true }));
          }
          if (this.menuLabelMode) {
            this.menuLabelMode.style.display = 'none';
          }
        });
      });
    }

    if (this.selectInlineLayout) {
      this.selectInlineLayout.addEventListener('change', (e) => {
        this.tool.settings.inlineLayout = e.target.value;
        this.scheduleAutoSave();
        this.app.requestRender();
      });
    }

    // Numeração Automática
    this.checkAutoNumber.addEventListener('change', (e) => {
      this.tool.numbering.enabled = e.target.checked;
      this.updateFieldInputValue('photo_id', this.tool.getFieldValue('photo_id'));
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.inputNumberPrefix.addEventListener('input', (e) => {
      this.tool.numbering.prefix = e.target.value;
      this.updateFieldInputValue('photo_id', this.tool.getFieldValue('photo_id'));
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.inputNumberStart.addEventListener('input', (e) => {
      this.tool.numbering.startNumber = parseInt(e.target.value, 10) || 1;
      this.updateFieldInputValue('photo_id', this.tool.getFieldValue('photo_id'));
      this.scheduleAutoSave();
      this.app.requestRender();
    });

    this.inputNumberDigits.addEventListener('input', (e) => {
      this.tool.numbering.digits = parseInt(e.target.value, 10) || 2;
      this.updateFieldInputValue('photo_id', this.tool.getFieldValue('photo_id'));
      this.scheduleAutoSave();
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
      if (this.menuLabelMode && this.menuLabelMode.style.display !== 'none') {
        if (!this.customLabelModeWrapper?.contains(e.target)) {
          this.menuLabelMode.style.display = 'none';
        }
      }
    });

    // Seleção de Preset / Modelo
    this.presetsSelect.addEventListener('change', (e) => {
      this.loadSelectedPreset(e.target.value);
    });

    // Salvar Novo Modelo Personalizado
    if (this.btnSavePreset) {
      this.btnSavePreset.addEventListener('click', () => {
        const name = prompt('Nome para o novo Modelo / Preset:', 'Meu Modelo Personalizado');
        if (name && name.trim()) {
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
          this.loadSelectedPreset(customPreset.id);
          this.scheduleAutoSave();
          if (this.app?.showToast) this.app.showToast(`Modelo "${customPreset.name}" salvo com sucesso!`);
        }
      });
    }

    // Duplicar Modelo Atual
    if (this.btnDuplicatePreset) {
      this.btnDuplicatePreset.addEventListener('click', () => {
        const currentModel = this.getSelectedModelObject();
        const baseName = currentModel ? currentModel.name : 'Modelo';
        const copyName = `${baseName} (Cópia)`;
        const duplicatePreset = {
          id: `custom_${Date.now()}`,
          name: copyName,
          description: `Cópia criada a partir de ${baseName}`,
          ...this.tool.settings,
          fields: this.tool.activeFields.map(f => ({
            id: f.id,
            label: f.label,
            enabled: f.enabled,
            showLabel: f.showLabel,
            defaultValue: f.customValue || this.tool.getFieldValue(f.id, f)
          }))
        };
        storage.saveCustomPreset(duplicatePreset);
        this.renderPresetsList();
        this.presetsSelect.value = duplicatePreset.id;
        this.loadSelectedPreset(duplicatePreset.id);
        this.scheduleAutoSave();
        if (this.app?.showToast) this.app.showToast(`Modelo duplicado como "${copyName}".`);
      });
    }

    // Renomear Modelo Atual (Modelos de fábrica protegidos!)
    if (this.btnRenamePreset) {
      this.btnRenamePreset.addEventListener('click', () => {
        if (this.isBuiltInModel(this.tool.selectedModelId)) {
          alert('Modelos de fábrica não podem ser renomeados. Duplique este modelo para criar uma cópia personalizada.');
          return;
        }
        const currentModel = this.getSelectedModelObject();
        const newName = prompt('Novo nome para o modelo:', currentModel ? currentModel.name : '');
        if (newName && newName.trim()) {
          storage.renameCustomPreset(this.tool.selectedModelId, newName.trim());
          this.renderPresetsList();
          this.presetsSelect.value = this.tool.selectedModelId;
          this.scheduleAutoSave();
          if (this.app?.showToast) this.app.showToast(`Modelo renomeado para "${newName.trim()}".`);
        }
      });
    }

    // Excluir Modelo Atual (Modelos de fábrica protegidos!)
    if (this.btnDeletePreset) {
      this.btnDeletePreset.addEventListener('click', () => {
        if (this.isBuiltInModel(this.tool.selectedModelId)) {
          alert('Modelos de fábrica não podem ser apagados.');
          return;
        }
        const currentModel = this.getSelectedModelObject();
        const modelName = currentModel ? currentModel.name : 'este modelo';
        this.showConfirmDialog({
          title: 'Excluir Modelo',
          message: `Tem certeza de que deseja excluir permanentemente o modelo "${modelName}"?`,
          confirmText: 'Excluir Modelo',
          onConfirm: () => {
            storage.deleteCustomPreset(this.tool.selectedModelId);
            this.tool.selectedModelId = 'model_1_simple';
            this.loadSelectedPreset('model_1_simple');
            this.renderPresetsList();
            this.scheduleAutoSave();
            if (this.app?.showToast) this.app.showToast('Modelo excluído com sucesso.');
          }
        });
      });
    }

    // Redefinir Numeração (com confirmação)
    if (this.btnResetNumbering) {
      this.btnResetNumbering.addEventListener('click', () => {
        this.showConfirmDialog({
          title: 'Redefinir Numeração',
          message: 'Deseja redefinir o contador de numeração para o número 1?',
          confirmText: 'Redefinir',
          onConfirm: () => {
            this.tool.resetNumbering();
            this.syncNumberingControls();
            this.updateFieldInputValue('photo_id', this.tool.getFieldValue('photo_id'));
            this.scheduleAutoSave();
            this.app.requestRender();
            if (this.app?.showToast) this.app.showToast('Numeração redefinida para 1.');
          }
        });
      });
    }

    // Exportar Configurações (.json) - Sem fotos
    if (this.btnExportBackupJson) {
      this.btnExportBackupJson.addEventListener('click', () => {
        const backupData = storage.getBackupData(this.tool);
        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stamp-camera-config-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (this.app?.showToast) this.app.showToast('Configurações exportadas (.json) sem fotos.');
      });
    }

    // Importar Configurações (.json)
    if (this.btnImportBackupJson && this.backupFileInput) {
      this.btnImportBackupJson.addEventListener('click', () => {
        this.backupFileInput.click();
      });

      this.backupFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const content = evt.target.result;
            JSON.parse(content);
            this.pendingImportJson = content;
            if (this.importChoiceModal) {
              this.importChoiceModal.style.display = 'flex';
            }
          } catch (err) {
            alert(`Arquivo JSON inválido: ${err.message}`);
          }
        };
        reader.readAsText(file);
      });
    }

    // Modal de Escolha de Importação
    if (this.btnCloseImportModal) {
      this.btnCloseImportModal.addEventListener('click', () => this.closeImportModal());
    }
    if (this.btnImportCancel) {
      this.btnImportCancel.addEventListener('click', () => this.closeImportModal());
    }

    if (this.btnImportReplace) {
      this.btnImportReplace.addEventListener('click', () => {
        if (!this.pendingImportJson) return;
        const res = storage.importBackupData(this.pendingImportJson, 'replace', this.tool);
        this.closeImportModal();
        if (res.success) {
          this.syncControlsWithSettings();
          this.syncNumberingControls();
          this.syncLocationInputs();
          this.renderPresetsList();
          this.renderFieldsList();
          this.scheduleAutoSave();
          this.app.requestRender();
          if (this.app?.showToast) this.app.showToast('Configurações substituídas com sucesso!');
        } else {
          alert(`Erro na importação: ${res.error}`);
        }
      });
    }

    if (this.btnImportMerge) {
      this.btnImportMerge.addEventListener('click', () => {
        if (!this.pendingImportJson) return;
        const res = storage.importBackupData(this.pendingImportJson, 'merge', this.tool);
        this.closeImportModal();
        if (res.success) {
          this.syncControlsWithSettings();
          this.syncNumberingControls();
          this.syncLocationInputs();
          this.renderPresetsList();
          this.renderFieldsList();
          this.scheduleAutoSave();
          this.app.requestRender();
          if (this.app?.showToast) this.app.showToast('Modelos e configurações mesclados com sucesso!');
        } else {
          alert(`Erro na importação: ${res.error}`);
        }
      });
    }

    // Apagar Dados Deste Navegador (Limpeza de localStorage e IndexedDB)
    if (this.btnClearAllBrowserData) {
      this.btnClearAllBrowserData.addEventListener('click', () => {
        this.showConfirmDialog({
          title: 'Apagar Dados Deste Navegador',
          message: 'Atenção: Todos os dados salvos neste navegador (modelos personalizados, configurações, preferências e fotos em rascunho) serão apagados permanentemente. Deseja prosseguir?',
          confirmText: 'Apagar Tudo',
          onConfirm: async () => {
            await storage.clearAllData();
            this.tool.clearWorkspace();
            this.syncControlsWithSettings();
            this.syncNumberingControls();
            this.syncLocationInputs();
            this.renderPresetsList();
            this.renderFieldsList();
            this.app.requestRender();
            this.updateSaveIndicator('saved');
            if (this.draftRestoreBanner) this.draftRestoreBanner.style.display = 'none';
            if (this.app?.showToast) this.app.showToast('Todos os dados locais foram apagados com sucesso.');
          }
        });
      });
    }

    // Banner de Retomada de Trabalho Anterior
    if (this.btnRestoreDraft) {
      this.btnRestoreDraft.addEventListener('click', async () => {
        const draft = await storage.getDraftPhoto();
        if (draft && draft.dataUrl) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = draft.width || img.naturalWidth;
            canvas.height = draft.height || img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            this.tool.photo = {
              canvas,
              width: canvas.width,
              height: canvas.height,
              filename: draft.filename || 'rascunho.jpg',
              fileSize: draft.fileSize || 0
            };
            this.tool.exif = draft.exif || {};
            if (draft.customPosX !== undefined) this.tool.settings.customPosX = draft.customPosX;
            if (draft.customPosY !== undefined) this.tool.settings.customPosY = draft.customPosY;

            this.syncPhotoState();
            this.app.requestRender();
            if (this.draftRestoreBanner) this.draftRestoreBanner.style.display = 'none';
            if (this.app?.showToast) this.app.showToast('Fotografia anterior retomada com sucesso!');
          };
          img.src = draft.dataUrl;
        } else {
          if (this.draftRestoreBanner) this.draftRestoreBanner.style.display = 'none';
        }
      });
    }

    if (this.btnDiscardDraft) {
      this.btnDiscardDraft.addEventListener('click', async () => {
        await storage.clearDraftPhoto();
        if (this.draftRestoreBanner) this.draftRestoreBanner.style.display = 'none';
        if (this.app?.showToast) this.app.showToast('Rascunho anterior descartado.');
      });
    }

    // Selo de Origem [EXIF] / [MANUAL] no Carimbo
    if (this.checkOriginStampBadge) {
      this.checkOriginStampBadge.addEventListener('change', (e) => {
        this.tool.settings.showOriginStampBadge = e.target.checked;
        this.app.requestRender();
      });
    }

    // Preservação de EXIF e aviso dinâmico na exportação
    if (this.checkPreserveExif) {
      this.checkPreserveExif.addEventListener('change', (e) => {
        this.tool.settings.preserveExif = e.target.checked;
        this.updateExportExifNote();
      });
    }

    if (this.selectExportFormat) {
      this.selectExportFormat.addEventListener('change', () => {
        this.updateExportExifNote();
      });
    }
    this.updateExportExifNote();

    // Captura de GPS do Dispositivo em Tempo Real
    if (this.btnDeviceGps) {
      this.btnDeviceGps.addEventListener('click', () => {
        this.captureDeviceGps();
      });
    }

    // Captura pela Câmera no Celular
    if (this.btnCaptureCamera && this.cameraInput) {
      this.btnCaptureCamera.addEventListener('click', () => this.cameraInput.click());
    }
    if (this.btnPlaceholderCamera && this.cameraInput) {
      this.btnPlaceholderCamera.addEventListener('click', () => this.cameraInput.click());
    }
    if (this.cameraInput) {
      this.cameraInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleCameraCapture(e.target.files[0]);
        }
      });
    }

    // 1. Cabeçalho Superior e Barra Superior do Preview
    if (this.btnHeaderRotate) {
      this.btnHeaderRotate.addEventListener('click', () => this.handleRotatePhoto('right'));
    }
    if (this.btnRotateLeft) {
      this.btnRotateLeft.addEventListener('click', () => this.handleRotatePhoto('left'));
    }
    if (this.btnRotateRight) {
      this.btnRotateRight.addEventListener('click', () => this.handleRotatePhoto('right'));
    }
    if (this.btnRotate180) {
      this.btnRotate180.addEventListener('click', () => this.handleRotatePhoto(180));
    }
    if (this.btnFlipH) {
      this.btnFlipH.addEventListener('click', () => this.handleFlipPhoto('horizontal'));
    }
    if (this.btnFlipV) {
      this.btnFlipV.addEventListener('click', () => this.handleFlipPhoto('vertical'));
    }

    // 2. Barra Flutuante sobre o Canvas
    if (this.btnFloatRotateLeft) {
      this.btnFloatRotateLeft.addEventListener('click', () => this.handleRotatePhoto('left'));
    }
    if (this.btnFloatRotateRight) {
      this.btnFloatRotateRight.addEventListener('click', () => this.handleRotatePhoto('right'));
    }
    if (this.btnFloatRotate180) {
      this.btnFloatRotate180.addEventListener('click', () => this.handleRotatePhoto(180));
    }
    if (this.btnFloatFlipH) {
      this.btnFloatFlipH.addEventListener('click', () => this.handleFlipPhoto('horizontal'));
    }
    if (this.btnFloatFlipV) {
      this.btnFloatFlipV.addEventListener('click', () => this.handleFlipPhoto('vertical'));
    }

    // 3. Barra Lateral (Card de Rotação em Modelos)
    if (this.btnSidebarRotateLeft) {
      this.btnSidebarRotateLeft.addEventListener('click', () => this.handleRotatePhoto('left'));
    }
    if (this.btnSidebarRotateRight) {
      this.btnSidebarRotateRight.addEventListener('click', () => this.handleRotatePhoto('right'));
    }
    if (this.btnSidebarRotate180) {
      this.btnSidebarRotate180.addEventListener('click', () => this.handleRotatePhoto(180));
    }
    if (this.btnSidebarFlipH) {
      this.btnSidebarFlipH.addEventListener('click', () => this.handleFlipPhoto('horizontal'));
    }
    if (this.btnSidebarFlipV) {
      this.btnSidebarFlipV.addEventListener('click', () => this.handleFlipPhoto('vertical'));
    }

    // 4. Atalhos de Teclado Rápidos (R = 90° horário, Shift+R = 90° anti-horário, Alt+R = 180°)
    window.addEventListener('keydown', (e) => {
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (document.activeElement && document.activeElement.isContentEditable)) {
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        if (!this.tool || !this.tool.photo) return;
        e.preventDefault();
        if (e.altKey) {
          this.handleRotatePhoto(180);
        } else if (e.shiftKey) {
          this.handleRotatePhoto('left');
        } else {
          this.handleRotatePhoto('right');
        }
      }
    });

    // Modal e Fila de Processamento em Lote
    if (this.btnBatchModal) {
      this.btnBatchModal.addEventListener('click', () => this.openBatchModal());
    }
    if (this.btnPlaceholderBatch) {
      this.btnPlaceholderBatch.addEventListener('click', () => this.openBatchModal());
    }
    if (this.btnOpenBatchFromExport) {
      this.btnOpenBatchFromExport.addEventListener('click', () => this.openBatchModal());
    }
    if (this.btnCloseBatchModal) {
      this.btnCloseBatchModal.addEventListener('click', () => this.closeBatchModal());
    }
    if (this.btnAddBatchFiles && this.batchFileInput) {
      this.btnAddBatchFiles.addEventListener('click', () => this.batchFileInput.click());
    }
    if (this.batchFileInput) {
      this.batchFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.addBatchFiles(e.target.files);
        }
      });
    }
    if (this.btnClearBatch) {
      this.btnClearBatch.addEventListener('click', () => this.clearBatch());
    }
    if (this.btnExportBatchZip) {
      this.btnExportBatchZip.addEventListener('click', () => this.processAndExportBatchZip());
    }

    // Modal de Confirmação (Separar / Unificar)
    if (this.btnConfirmModalClose) {
      this.btnConfirmModalClose.addEventListener('click', () => this.closeConfirmDialog());
    }
    if (this.btnConfirmModalCancel) {
      this.btnConfirmModalCancel.addEventListener('click', () => this.closeConfirmDialog());
    }
    if (this.btnConfirmModalOk) {
      this.btnConfirmModalOk.addEventListener('click', () => {
        if (typeof this.pendingConfirmAction === 'function') {
          const action = this.pendingConfirmAction;
          this.closeConfirmDialog();
          action();
        } else {
          this.closeConfirmDialog();
        }
      });
    }
    if (this.confirmActionModal) {
      this.confirmActionModal.addEventListener('click', (e) => {
        if (e.target === this.confirmActionModal || e.target.classList.contains('batch-modal-backdrop')) {
          this.closeConfirmDialog();
        }
      });
    }

    // Botões de Alternância Rápida (Separar / Unificar) no painel de Localização
    if (this.btnToggleSplitLocality) {
      this.btnToggleSplitLocality.addEventListener('click', () => {
        const isUnified = this.tool.isLocalityUnified();
        if (isUnified) {
          this.showConfirmDialog({
            title: 'Separar Localidade',
            message: 'Deseja separar a Localidade em três campos individuais no carimbo: Cidade, Estado e País?',
            confirmText: 'Confirmar Separação',
            onConfirm: () => {
              this.tool.splitLocality();
              this.renderFieldsList();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Localidade separada em Cidade, Estado e País.');
              }
            }
          });
        } else {
          this.showConfirmDialog({
            title: 'Unificar Localidade',
            message: 'Deseja unificar Cidade, Estado e País em uma única linha no carimbo?',
            confirmText: 'Confirmar Unificação',
            onConfirm: () => {
              this.tool.unifyLocality();
              this.renderFieldsList();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Cidade, Estado e País unificados em Localidade.');
              }
            }
          });
        }
      });
    }

    if (this.btnToggleSplitAddress) {
      this.btnToggleSplitAddress.addEventListener('click', () => {
        const isUnified = this.tool.isAddressUnified();
        if (isUnified) {
          this.showConfirmDialog({
            title: 'Separar Endereço e Bairro',
            message: 'Deseja separar o Endereço e o Bairro em campos individuais no carimbo?',
            confirmText: 'Confirmar Separação',
            onConfirm: () => {
              this.tool.splitAddress();
              this.renderFieldsList();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Endereço e Bairro separados.');
              }
            }
          });
        } else {
          this.showConfirmDialog({
            title: 'Unificar Endereço e Bairro',
            message: 'Deseja unificar Endereço e Bairro em uma única linha no carimbo?',
            confirmText: 'Confirmar Unificação',
            onConfirm: () => {
              this.tool.unifyAddress();
              this.renderFieldsList();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Endereço e Bairro unificados.');
              }
            }
          });
        }
      });
    }

    if (this.btnToggleSplitCoords) {
      this.btnToggleSplitCoords.addEventListener('click', () => {
        const isUnified = this.tool.isCoordinatesUnified();
        if (isUnified) {
          this.showConfirmDialog({
            title: 'Separar Coordenadas',
            message: 'Deseja separar as Coordenadas em Latitude e Longitude individuais?',
            confirmText: 'Confirmar Separação',
            onConfirm: () => {
              this.tool.splitCoordinates();
              this.renderFieldsList();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Coordenadas separadas em Lat e Long.');
              }
            }
          });
        } else {
          this.showConfirmDialog({
            title: 'Unificar Coordenadas',
            message: 'Deseja unificar Latitude e Longitude na mesma linha no carimbo?',
            confirmText: 'Confirmar Unificação',
            onConfirm: () => {
              this.tool.unifyCoordinates();
              this.renderFieldsList();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Latitude e Longitude unificadas na mesma linha.');
              }
            }
          });
        }
      });
    }

    if (this.btnToggleSplitDateTime) {
      this.btnToggleSplitDateTime.addEventListener('click', () => {
        const isUnified = this.tool.isDateTimeUnified();
        if (isUnified) {
          this.showConfirmDialog({
            title: 'Separar Data e Hora',
            message: 'Deseja separar Data e Hora em linhas individuais no carimbo?',
            confirmText: 'Confirmar Separação',
            onConfirm: () => {
              this.tool.splitDateTime();
              this.renderFieldsList();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Data e Hora separadas em linhas individuais.');
              }
            }
          });
        } else {
          this.showConfirmDialog({
            title: 'Unificar Data e Hora',
            message: 'Deseja unificar Data e Hora na mesma linha no carimbo?',
            confirmText: 'Confirmar Unificação',
            onConfirm: () => {
              this.tool.unifyDateTime();
              this.renderFieldsList();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Data e Hora unificadas na mesma linha.');
              }
            }
          });
        }
      });
    }

    this.updateSplitButtonsState();
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
        this.scheduleAutoSave();
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
        this.scheduleAutoSave();
        this.app.requestRender();
      }
    });


    // Data manual
    if (this.inputDate) {
      this.inputDate.addEventListener('input', (e) => {
        this.tool.location.date = e.target.value;
        this.tool.location.sources.date = 'MANUAL';
        this.updateSourceBadges();
        this.updateFieldInputValue('date', e.target.value);
        this.updateFieldInputValue('datetime', this.tool.getFieldValue('datetime'));
        this.scheduleAutoSave();
        this.app.requestRender();
      });
    }

    // Hora manual
    if (this.inputTime) {
      this.inputTime.addEventListener('input', (e) => {
        this.tool.location.time = e.target.value;
        this.tool.location.sources.time = 'MANUAL';
        this.updateSourceBadges();
        this.updateFieldInputValue('time', e.target.value);
        this.updateFieldInputValue('datetime', this.tool.getFieldValue('datetime'));
        this.scheduleAutoSave();
        this.app.requestRender();
      });
    }

    // Campos de Endereço e Dados Técnicos
    const bindText = (inputElem, key, fieldId, relatedFieldIds = []) => {
      if (!inputElem) return;
      inputElem.addEventListener('input', (e) => {
        this.tool.location[key] = e.target.value;
        this.tool.location.sources[key] = 'MANUAL';
        this.updateFieldInputValue(fieldId, e.target.value);
        for (const relId of relatedFieldIds) {
          this.updateFieldInputValue(relId, this.tool.getFieldValue(relId));
        }
        this.scheduleAutoSave();
        this.app.requestRender();
      });
    };

    bindText(this.inputStreet, 'street', 'street', ['address_street_num', 'address_neighborhood']);
    bindText(this.inputNumber, 'number', 'number', ['address_street_num', 'address_neighborhood']);
    bindText(this.inputNeighborhood, 'neighborhood', 'neighborhood', ['address_neighborhood']);
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
   * Executa a rotação da fotografia atual e atualiza a UI, canvas e rascunho
   * @param {'left'|'right'|180|'180'} direction
   */
  async handleRotatePhoto(direction) {
    if (!this.tool || !this.tool.photo) {
      if (this.app && typeof this.app.showToast === 'function') {
        this.app.showToast('Selecione uma fotografia antes de girar.');
      }
      return;
    }
    this.tool.rotatePhoto(direction);
    this.syncPhotoState();
    this.app.requestRender();
    if (this.app && typeof this.app.saveCurrentDraft === 'function') {
      await this.app.saveCurrentDraft();
    }
    if (this.app && typeof this.app.showToast === 'function') {
      const msg = (direction === 180 || direction === '180')
        ? 'Fotografia invertida 180°.'
        : direction === 'left'
          ? 'Fotografia girada 90° à esquerda.'
          : 'Fotografia girada 90° à direita.';
      this.app.showToast(msg);
    }
  }

  /**
   * Executa espelhamento da fotografia atual
   * @param {'horizontal'|'vertical'} axis
   */
  async handleFlipPhoto(axis = 'horizontal') {
    if (!this.tool || !this.tool.photo) {
      if (this.app && typeof this.app.showToast === 'function') {
        this.app.showToast('Selecione uma fotografia antes de espelhar.');
      }
      return;
    }
    this.tool.flipPhoto(axis);
    this.syncPhotoState();
    this.app.requestRender();
    if (this.app && typeof this.app.saveCurrentDraft === 'function') {
      await this.app.saveCurrentDraft();
    }
    if (this.app && typeof this.app.showToast === 'function') {
      this.app.showToast(axis === 'horizontal' ? 'Fotografia espelhada horizontalmente.' : 'Fotografia espelhada verticalmente.');
    }
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
      if (this.floatingRotateBar) this.floatingRotateBar.style.display = 'none';
      return;
    }

    this.emptyPlaceholder.style.display = 'none';
    this.previewCanvas.style.display = 'block';
    this.imageInfoBar.style.display = 'flex';
    if (this.dragHintPill) this.dragHintPill.style.display = 'block';
    if (this.floatingRotateBar) this.floatingRotateBar.style.display = 'flex';

    const w = this.tool.photo.width;
    const h = this.tool.photo.height;
    const sizeMb = (this.tool.photo.fileSize / (1024 * 1024)).toFixed(2);
    this.photoMetaText.textContent = `${this.tool.photo.filename} • ${w} × ${h} px • ${sizeMb} MB`;

    // Sincroniza TODOS os inputs do painel direito com os dados da localização
    if (this.inputLat) this.inputLat.value = this.tool.location.latitude !== null ? this.tool.location.latitude.toFixed(8) : '';
    if (this.inputLon) this.inputLon.value = this.tool.location.longitude !== null ? this.tool.location.longitude.toFixed(8) : '';
    if (this.inputDate) this.inputDate.value = this.tool.location.date || '';
    if (this.inputTime) this.inputTime.value = this.tool.location.time || '';
    if (this.inputStreet) this.inputStreet.value = this.tool.location.street || '';
    if (this.inputNumber) this.inputNumber.value = this.tool.location.number || '';
    if (this.inputNeighborhood) this.inputNeighborhood.value = this.tool.location.neighborhood || '';
    if (this.inputCity) this.inputCity.value = this.tool.location.city || '';
    if (this.inputState) this.inputState.value = this.tool.location.state || '';
    if (this.inputCountry) this.inputCountry.value = this.tool.location.country || '';
    if (this.inputPostalCode) this.inputPostalCode.value = this.tool.location.postalCode || '';
    if (this.inputProjectName) this.inputProjectName.value = this.tool.location.projectName || '';

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
      const isAuto = source === 'AUTO';
      badgeElem.textContent = isAuto ? 'EXIF' : 'MANUAL';
      badgeElem.className = `badge ${isAuto ? 'badge-auto' : 'badge-manual'}`;
    };

    updateBadge(this.badgeLat, this.tool.location.sources.latitude);
    updateBadge(this.badgeLon, this.tool.location.sources.longitude);
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
    this.updateModelButtonsState();
  }

  isBuiltInModel(presetId) {
    if (!presetId) return true;
    return BUILT_IN_MODELS.some(m => m.id === presetId) || PRESET_CATEGORIES.some(p => p.id === presetId);
  }

  getSelectedModelObject() {
    const id = this.tool.selectedModelId;
    return BUILT_IN_MODELS.find(m => m.id === id) ||
           PRESET_CATEGORIES.find(p => p.id === id) ||
           storage.getCustomPresets().find(c => c.id === id) ||
           null;
  }

  updateModelButtonsState() {
    const isBuiltIn = this.isBuiltInModel(this.tool.selectedModelId);
    if (this.btnRenamePreset) {
      this.btnRenamePreset.disabled = isBuiltIn;
      this.btnRenamePreset.title = isBuiltIn ? 'Modelos de fábrica não podem ser renomeados' : 'Renomear este modelo';
    }
    if (this.btnDeletePreset) {
      this.btnDeletePreset.disabled = isBuiltIn;
      this.btnDeletePreset.title = isBuiltIn ? 'Modelos de fábrica não podem ser apagados' : 'Excluir este modelo';
    }
    if (this.modelFactoryNote) {
      this.modelFactoryNote.style.display = isBuiltIn ? 'block' : 'none';
    }
  }

  closeImportModal() {
    if (this.importChoiceModal) {
      this.importChoiceModal.style.display = 'none';
    }
    this.pendingImportJson = null;
    if (this.backupFileInput) {
      this.backupFileInput.value = '';
    }
  }

  showDraftBanner(draft) {
    if (!this.draftRestoreBanner) return;
    const details = document.getElementById('draftResumeDetails');
    if (details && draft.filename) {
      const dateStr = draft.savedAt ? new Date(draft.savedAt).toLocaleTimeString('pt-BR') : '';
      details.textContent = `Fotografia "${draft.filename}" de sessão anterior${dateStr ? ` (${dateStr})` : ''}.`;
    }
    this.draftRestoreBanner.style.display = 'flex';
  }

  hideDraftBanner() {
    if (this.draftRestoreBanner) {
      this.draftRestoreBanner.style.display = 'none';
    }
  }

  /**
   * Restaura o estado salvo a partir do Schema 1 e sincroniza todos os controles
   * @param {Object} savedState
   */
  restoreState(savedState) {
    if (!savedState) {
      this.renderPresetsList();
      this.syncControlsWithSettings();
      this.syncLocationInputs();
      this.syncNumberingControls();
      this.renderFieldsList();
      this.updateModelButtonsState();
      if (!storage.isStorageAvailable()) {
        this.updateSaveIndicator('unavailable');
      } else {
        this.updateSaveIndicator('saved');
      }
      return;
    }

    this.tool.loadState(savedState);
    this.renderPresetsList();
    if (savedState.selectedModelId && this.presetsSelect) {
      this.presetsSelect.value = savedState.selectedModelId;
    }
    this.syncControlsWithSettings();
    this.syncLocationInputs();
    this.syncNumberingControls();
    this.renderFieldsList();
    this.updateModelButtonsState();

    if (!storage.isStorageAvailable()) {
      this.updateSaveIndicator('unavailable');
    } else {
      this.updateSaveIndicator('saved');
    }
  }

  scheduleAutoSave() {
    if (!storage.isStorageAvailable()) {
      this.updateSaveIndicator('unavailable');
      return;
    }
    this.updateSaveIndicator('saving');
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.performAutoSave();
    }, 500);
  }

  performAutoSave() {
    try {
      if (!storage.isStorageAvailable()) {
        this.updateSaveIndicator('unavailable');
        return;
      }
      const stateToSave = {
        config: { ...this.tool.settings },
        counter: { ...this.tool.numbering },
        location: { ...this.tool.location },
        activeFields: this.tool.activeFields.map(f => ({ ...f })),
        selectedModelId: this.tool.selectedModelId,
        models: storage.getCustomPresets()
      };
      storage.saveAppState(stateToSave);

      if (this.tool.photo) {
        storage.updateDraftPosition(this.tool.settings.customPosX, this.tool.settings.customPosY);
      }

      this.updateSaveIndicator('saved');
    } catch (e) {
      console.warn('Erro ao executar auto-save:', e);
      this.updateSaveIndicator('unavailable');
    }
  }

  updateSaveIndicator(status) {
    if (!this.saveStatusIndicator || !this.saveStatusText) return;

    this.saveStatusIndicator.classList.remove('saving', 'unavailable', 'near-full');

    switch (status) {
      case 'saving':
        this.saveStatusIndicator.classList.add('saving');
        this.saveStatusText.textContent = 'Salvando...';
        break;
      case 'unavailable':
        this.saveStatusIndicator.classList.add('unavailable');
        this.saveStatusText.textContent = 'Salvamento local indisponível neste navegador';
        this.saveStatusIndicator.title = 'Armazenamento restrito ou navegação anônima sem persistência';
        break;
      case 'near-full':
        this.saveStatusIndicator.classList.add('near-full');
        this.saveStatusText.textContent = 'Armazenamento quase cheio (>80%)';
        break;
      case 'saved':
      default:
        this.saveStatusText.textContent = 'Salvo neste navegador ✓';
        this.saveStatusIndicator.title = 'Todas as alterações são salvas localmente neste navegador';
        break;
    }
  }

  syncNumberingControls() {
    if (this.inputNumberStart) this.inputNumberStart.value = this.tool.numbering.startNumber;
    if (this.inputNumberPrefix) this.inputNumberPrefix.value = this.tool.numbering.prefix;
    if (this.inputNumberDigits) this.inputNumberDigits.value = this.tool.numbering.digits;
    if (this.checkAutoNumber) this.checkAutoNumber.checked = !!this.tool.numbering.enabled;
  }

  syncLocationInputs() {
    const loc = this.tool.location;
    if (this.inputLat) this.inputLat.value = loc.latitude !== null ? loc.latitude : '';
    if (this.inputLon) this.inputLon.value = loc.longitude !== null ? loc.longitude : '';
    if (this.inputDate) this.inputDate.value = loc.date || '';
    if (this.inputTime) this.inputTime.value = loc.time || '';
    if (this.inputStreet) this.inputStreet.value = loc.street || '';
    if (this.inputNumber) this.inputNumber.value = loc.number || '';
    if (this.inputNeighborhood) this.inputNeighborhood.value = loc.neighborhood || '';
    if (this.inputCity) this.inputCity.value = loc.city || '';
    if (this.inputState) this.inputState.value = loc.state || '';
    if (this.inputCountry) this.inputCountry.value = loc.country || '';
    if (this.inputPostalCode) this.inputPostalCode.value = loc.postalCode || '';
    if (this.inputProjectName) this.inputProjectName.value = loc.projectName || '';
    this.updateSourceBadges();
  }

  loadSelectedPreset(presetId) {
    const model = BUILT_IN_MODELS.find(m => m.id === presetId);
    if (model) {
      this.tool.applyModel(model);
      this.syncControlsWithSettings();
      this.renderFieldsList();
      this.updateModelButtonsState();
      this.scheduleAutoSave();
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
      this.updateModelButtonsState();
      this.scheduleAutoSave();
      this.app.requestRender();
      return;
    }

    const userPresets = storage.getCustomPresets();
    const userPreset = userPresets.find(u => u.id === presetId);
    if (userPreset) {
      this.tool.applyModel(userPreset);
      this.syncControlsWithSettings();
      this.renderFieldsList();
      this.updateModelButtonsState();
      this.scheduleAutoSave();
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
    if (this.selectLabelMode) {
      this.selectLabelMode.value = s.labelMode || 'icons';
      this.syncLabelModeCustomUI(this.selectLabelMode.value);
    }
    if (this.selectInlineLayout) this.selectInlineLayout.value = s.inlineLayout || 'multiline';
  }

  /**
   * Sincroniza a interface visual do seletor customizado de modo de rótulo (Line Art)
   */
  syncLabelModeCustomUI(value = 'icons') {
    if (!this.btnLabelModeTrigger) return;
    const triggerText = this.btnLabelModeTrigger.querySelector('.custom-trigger-text');
    const triggerIcons = this.btnLabelModeTrigger.querySelector('.custom-trigger-icons');
    if (triggerText) {
      if (value === 'icons') {
        triggerText.textContent = 'Somente Ícones Line Art';
        if (triggerIcons) triggerIcons.style.display = 'inline-flex';
      } else if (value === 'text') {
        triggerText.textContent = 'Rótulo em Texto (DATA:, LAT:, LOCAL:)';
        if (triggerIcons) triggerIcons.style.display = 'none';
      } else if (value === 'none') {
        triggerText.textContent = 'Ocultar Rótulos (Apenas Valores)';
        if (triggerIcons) triggerIcons.style.display = 'none';
      }
    }
    if (this.menuLabelMode) {
      const items = this.menuLabelMode.querySelectorAll('.custom-label-mode-item');
      items.forEach(it => {
        it.classList.toggle('active', it.dataset.value === value);
      });
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
      this.scheduleAutoSave();
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
          this.scheduleAutoSave();
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
   * Modal de confirmação interativa para ações do usuário
   */
  showConfirmDialog({ title, message, confirmText = 'Confirmar', onConfirm }) {
    if (!this.confirmActionModal) {
      if (window.confirm(message)) {
        if (typeof onConfirm === 'function') onConfirm();
      }
      return;
    }

    if (this.confirmModalTitle) this.confirmModalTitle.textContent = title;
    if (this.confirmModalMessage) this.confirmModalMessage.textContent = message;
    if (this.btnConfirmModalOk) this.btnConfirmModalOk.textContent = confirmText;

    this.pendingConfirmAction = onConfirm;
    this.confirmActionModal.style.display = 'flex';
  }

  closeConfirmDialog() {
    if (this.confirmActionModal) {
      this.confirmActionModal.style.display = 'none';
    }
    this.pendingConfirmAction = null;
  }

  /**
   * Atualiza os botões de alternância rápida na aba Localização
   */
  updateSplitButtonsState() {
    if (this.btnToggleSplitLocality) {
      const isUnified = this.tool.isLocalityUnified();
      const icon = this.btnToggleSplitLocality.querySelector('.btn-split-icon');
      const label = this.btnToggleSplitLocality.querySelector('.btn-split-label');
      if (icon) icon.textContent = isUnified ? '⫽' : '⨁';
      if (label) label.textContent = isUnified ? 'Separar Localidade' : 'Unificar Localidade';
      this.btnToggleSplitLocality.title = isUnified ? 'Separar em Cidade, Estado e País' : 'Unificar em Cidade, Estado e País';
    }
    if (this.btnToggleSplitAddress) {
      const isUnified = this.tool.isAddressUnified();
      const icon = this.btnToggleSplitAddress.querySelector('.btn-split-icon');
      const label = this.btnToggleSplitAddress.querySelector('.btn-split-label');
      if (icon) icon.textContent = isUnified ? '⫽' : '⨁';
      if (label) label.textContent = isUnified ? 'Separar Endereço/Bairro' : 'Unificar Endereço/Bairro';
      this.btnToggleSplitAddress.title = isUnified ? 'Separar Endereço e Bairro em linhas individuais' : 'Unificar Endereço e Bairro na mesma linha';
    }
    if (this.btnToggleSplitCoords) {
      const isUnified = this.tool.isCoordinatesUnified();
      const icon = this.btnToggleSplitCoords.querySelector('.btn-split-icon');
      const label = this.btnToggleSplitCoords.querySelector('.btn-split-label');
      if (icon) icon.textContent = isUnified ? '⫽' : '⨁';
      if (label) label.textContent = isUnified ? 'Separar Lat/Long' : 'Unificar Coordenadas';
      this.btnToggleSplitCoords.title = isUnified ? 'Separar em Latitude e Longitude' : 'Unificar Latitude e Longitude na mesma linha';
    }
    if (this.btnToggleSplitDateTime) {
      const isUnified = this.tool.isDateTimeUnified();
      const icon = this.btnToggleSplitDateTime.querySelector('.btn-split-icon');
      const label = this.btnToggleSplitDateTime.querySelector('.btn-split-label');
      if (icon) icon.textContent = isUnified ? '⫽' : '⨁';
      if (label) label.textContent = isUnified ? 'Separar Data/Hora' : 'Unificar Data/Hora';
      this.btnToggleSplitDateTime.title = isUnified ? 'Separar Data e Hora em linhas individuais' : 'Unificar Data e Hora na mesma linha';
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
   * - Botão de separar / unificar se aplicável
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
        this.scheduleAutoSave();
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
        this.scheduleAutoSave();
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

        this.scheduleAutoSave();
        this.app.requestRender();
      });

      // 4. Ações: Rótulo Visível, Mover Cima, Mover Baixo, Separar/Unificar, Excluir
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
        this.scheduleAutoSave();
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
        this.scheduleAutoSave();
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
        this.scheduleAutoSave();
        this.app.requestRender();
      });

      actionsDiv.appendChild(toggleLabelBtn);
      actionsDiv.appendChild(btnUp);
      actionsDiv.appendChild(btnDown);

      // Botão de Separar ou Unificar conforme o tipo de campo
      if (field.id === 'city_state_country') {
        const btnSplit = document.createElement('button');
        btnSplit.type = 'button';
        btnSplit.className = 'btn-field-split-toggle';
        btnSplit.title = 'Separar em Cidade, Estado e País';
        btnSplit.innerHTML = '⫽';
        btnSplit.addEventListener('click', () => {
          this.showConfirmDialog({
            title: 'Separar Localidade',
            message: 'Deseja separar a Localidade em três campos individuais no carimbo: Cidade, Estado e País?',
            confirmText: 'Confirmar Separação',
            onConfirm: () => {
              this.tool.splitLocality();
              this.renderFieldsList();
              this.scheduleAutoSave();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Localidade separada em Cidade, Estado e País.');
              }
            }
          });
        });
        actionsDiv.appendChild(btnSplit);
      } else if (field.id === 'city') {
        const btnUnify = document.createElement('button');
        btnUnify.type = 'button';
        btnUnify.className = 'btn-field-split-toggle';
        btnUnify.title = 'Unificar em Cidade, Estado e País';
        btnUnify.innerHTML = '⨁';
        btnUnify.addEventListener('click', () => {
          this.showConfirmDialog({
            title: 'Unificar Localidade',
            message: 'Deseja unificar Cidade, Estado e País em uma única linha no carimbo?',
            confirmText: 'Confirmar Unificação',
            onConfirm: () => {
              this.tool.unifyLocality();
              this.renderFieldsList();
              this.scheduleAutoSave();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Cidade, Estado e País unificados em Localidade.');
              }
            }
          });
        });
        actionsDiv.appendChild(btnUnify);
      } else if (field.id === 'address_neighborhood') {
        const btnSplit = document.createElement('button');
        btnSplit.type = 'button';
        btnSplit.className = 'btn-field-split-toggle';
        btnSplit.title = 'Separar em Endereço e Bairro';
        btnSplit.innerHTML = '⫽';
        btnSplit.addEventListener('click', () => {
          this.showConfirmDialog({
            title: 'Separar Endereço e Bairro',
            message: 'Deseja separar Endereço e Bairro em campos individuais no carimbo?',
            confirmText: 'Confirmar Separação',
            onConfirm: () => {
              this.tool.splitAddress();
              this.renderFieldsList();
              this.scheduleAutoSave();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Endereço e Bairro separados.');
              }
            }
          });
        });
        actionsDiv.appendChild(btnSplit);
      } else if (field.id === 'address_street_num') {
        const btnUnify = document.createElement('button');
        btnUnify.type = 'button';
        btnUnify.className = 'btn-field-split-toggle';
        btnUnify.title = 'Unificar em Endereço e Bairro';
        btnUnify.innerHTML = '⨁';
        btnUnify.addEventListener('click', () => {
          this.showConfirmDialog({
            title: 'Unificar Endereço e Bairro',
            message: 'Deseja unificar Endereço e Bairro em uma única linha no carimbo?',
            confirmText: 'Confirmar Unificação',
            onConfirm: () => {
              this.tool.unifyAddress();
              this.renderFieldsList();
              this.scheduleAutoSave();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Endereço e Bairro unificados.');
              }
            }
          });
        });
        actionsDiv.appendChild(btnUnify);
      } else if (field.id === 'datetime') {
        const btnSplit = document.createElement('button');
        btnSplit.type = 'button';
        btnSplit.className = 'btn-field-split-toggle';
        btnSplit.title = 'Separar em Data e Hora';
        btnSplit.innerHTML = '⫽';
        btnSplit.addEventListener('click', () => {
          this.showConfirmDialog({
            title: 'Separar Data e Hora',
            message: 'Deseja separar Data e Hora em linhas individuais no carimbo?',
            confirmText: 'Confirmar Separação',
            onConfirm: () => {
              this.tool.splitDateTime();
              this.renderFieldsList();
              this.scheduleAutoSave();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Data e Hora separadas em linhas individuais.');
              }
            }
          });
        });
        actionsDiv.appendChild(btnSplit);
      } else if (field.id === 'date') {
        const btnUnify = document.createElement('button');
        btnUnify.type = 'button';
        btnUnify.className = 'btn-field-split-toggle';
        btnUnify.title = 'Unificar em Data e Hora';
        btnUnify.innerHTML = '⨁';
        btnUnify.addEventListener('click', () => {
          this.showConfirmDialog({
            title: 'Unificar Data e Hora',
            message: 'Deseja unificar Data e Hora na mesma linha no carimbo?',
            confirmText: 'Confirmar Unificação',
            onConfirm: () => {
              this.tool.unifyDateTime();
              this.renderFieldsList();
              this.scheduleAutoSave();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Data e Hora unificadas na mesma linha.');
              }
            }
          });
        });
        actionsDiv.appendChild(btnUnify);
      } else if (field.id === 'coordinates') {
        const btnSplit = document.createElement('button');
        btnSplit.type = 'button';
        btnSplit.className = 'btn-field-split-toggle';
        btnSplit.title = 'Separar em Latitude e Longitude';
        btnSplit.innerHTML = '⫽';
        btnSplit.addEventListener('click', () => {
          this.showConfirmDialog({
            title: 'Separar Coordenadas',
            message: 'Deseja separar as Coordenadas em Latitude e Longitude individuais?',
            confirmText: 'Confirmar Separação',
            onConfirm: () => {
              this.tool.splitCoordinates();
              this.renderFieldsList();
              this.scheduleAutoSave();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Coordenadas separadas em Lat e Long.');
              }
            }
          });
        });
        actionsDiv.appendChild(btnSplit);
      } else if (field.id === 'lat') {
        const btnUnify = document.createElement('button');
        btnUnify.type = 'button';
        btnUnify.className = 'btn-field-split-toggle';
        btnUnify.title = 'Unificar em Coordenadas';
        btnUnify.innerHTML = '⨁';
        btnUnify.addEventListener('click', () => {
          this.showConfirmDialog({
            title: 'Unificar Coordenadas',
            message: 'Deseja unificar Latitude e Longitude na mesma linha no carimbo?',
            confirmText: 'Confirmar Unificação',
            onConfirm: () => {
              this.tool.unifyCoordinates();
              this.renderFieldsList();
              this.scheduleAutoSave();
              this.app.requestRender();
              if (this.app && typeof this.app.showToast === 'function') {
                this.app.showToast('Latitude e Longitude unificadas na mesma linha.');
              }
            }
          });
        });
        actionsDiv.appendChild(btnUnify);
      }

      if (field.isCustom || field.isOptionalOnDemand) {
        const btnDelete = document.createElement('button');
        btnDelete.type = 'button';
        btnDelete.className = 'btn-icon btn-delete';
        btnDelete.innerHTML = '<svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        btnDelete.title = field.isCustom ? 'Remover campo personalizado' : 'Ocultar campo';
        btnDelete.addEventListener('click', () => {
          this.tool.removeField(field.id);
          this.renderFieldsList();
          this.scheduleAutoSave();
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

    this.updateSplitButtonsState();
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
      'project_name': this.inputProjectName
    };

    const targetInput = inputMap[fieldId];
    if (targetInput && targetInput !== document.activeElement) {
      targetInput.value = value;
    }

    if (fieldId === 'city_state_country') {
      const parts = (value || '').split(',').map(s => s.trim());
      if (parts[0] && this.inputCity !== document.activeElement) this.inputCity.value = parts[0];
      if (parts[1] && this.inputState !== document.activeElement) this.inputState.value = parts[1];
      if (parts[2] && this.inputCountry !== document.activeElement) this.inputCountry.value = parts[2];
    } else if (fieldId === 'address_neighborhood') {
      const parts = (value || '').split(',').map(s => s.trim());
      if (parts.length >= 2) {
        if (this.inputNeighborhood !== document.activeElement) this.inputNeighborhood.value = parts[parts.length - 1];
        if (this.inputStreet !== document.activeElement) this.inputStreet.value = parts.slice(0, -1).join(', ');
      }
    } else if (fieldId === 'datetime') {
      const parts = (value || '').trim().split(/\s+/);
      if (parts[0] && this.inputDate !== document.activeElement) this.inputDate.value = parts[0];
      if (parts[1] && this.inputTime !== document.activeElement) this.inputTime.value = parts.slice(1).join(' ');
    }

    this.updateSourceBadges();
  }

  /**
   * Atualiza o aviso de metadados EXIF da aba de exportação
   */
  updateExportExifNote() {
    if (!this.exportExifNote) return;
    const format = this.selectExportFormat ? this.selectExportFormat.value : 'image/jpeg';
    const preserve = this.checkPreserveExif ? this.checkPreserveExif.checked : true;

    if (format === 'image/jpeg') {
      if (preserve) {
        this.exportExifNote.textContent = '✓ Os metadados originais da câmera (GPS, data, modelo) serão regravados no arquivo JPEG gerado.';
        this.exportExifNote.style.color = 'var(--text-muted)';
      } else {
        this.exportExifNote.textContent = '⚠️ Metadados EXIF desativados. A imagem exportada não conterá dados de GPS ou câmera.';
        this.exportExifNote.style.color = '#eab308';
      }
    } else {
      this.exportExifNote.textContent = '⚠️ Atenção: Os formatos PNG e WebP descartam metadados EXIF por padrão da web. Para preservar os dados EXIF intactos no arquivo, selecione JPEG.';
      this.exportExifNote.style.color = '#eab308';
    }
  }

  /**
   * Captura as coordenadas de GPS do dispositivo móvel do usuário
   */
  async captureDeviceGps() {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada neste navegador.');
      return;
    }

    if (this.btnDeviceGps) {
      this.btnDeviceGps.disabled = true;
      this.btnDeviceGps.innerHTML = `<span>Obtendo GPS...</span>`;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const alt = pos.coords.altitude !== null ? pos.coords.altitude : null;

        this.tool.location.latitude = lat;
        this.tool.location.longitude = lon;
        this.tool.location.altitude = alt;
        this.tool.location.sources.latitude = 'AUTO';
        this.tool.location.sources.longitude = 'AUTO';
        if (alt !== null) this.tool.location.sources.altitude = 'AUTO';

        this.inputLat.value = lat.toFixed(8);
        this.inputLon.value = lon.toFixed(8);

        this.updateSourceBadges();
        this.renderFieldsList();
        this.app.requestRender();

        try {
          const geo = await reverseGeocode(lat, lon);
          if (geo) {
            this.applyGeocodedLocation(geo);
          }
        } catch {}

        if (this.btnDeviceGps) {
          this.btnDeviceGps.disabled = false;
          this.btnDeviceGps.innerHTML = `
            <svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
            <span>GPS do Dispositivo</span>
          `;
        }

        if (this.app && typeof this.app.showToast === 'function') {
          this.app.showToast('Coordenadas GPS obtidas do dispositivo com sucesso!');
        }
      },
      (err) => {
        if (this.btnDeviceGps) {
          this.btnDeviceGps.disabled = false;
          this.btnDeviceGps.innerHTML = `
            <svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
            <span>GPS do Dispositivo</span>
          `;
        }
        alert(`Não foi possível obter o GPS do dispositivo: ${err.message}. Verifique as permissões de localização no navegador.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  /**
   * Captura foto diretamente da câmera traseira do celular e busca geolocalização se necessário
   */
  async handleCameraCapture(file) {
    if (!file) return;
    try {
      if (this.app && typeof this.app.showLoading === 'function') {
        this.app.showLoading(true);
      }
      const photoData = await loadImageFromFile(file);

      // Se a foto não possui GPS no EXIF (comum na web móvel), busca geolocalização imediata do dispositivo
      if (!photoData.exif.hasGps && navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              photoData.exif.hasGps = true;
              photoData.exif.latitude = pos.coords.latitude;
              photoData.exif.longitude = pos.coords.longitude;
              if (pos.coords.altitude !== null) photoData.exif.altitude = pos.coords.altitude;
              resolve();
            },
            () => resolve(),
            { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
          );
        });
      }

      // Se não possui data no EXIF, atribui a data atual
      if (!photoData.exif.hasDate) {
        photoData.exif.hasDate = true;
        photoData.exif.dateObj = new Date();
      }

      this.tool.loadPhotoData(photoData);
      this.syncPhotoState();
      this.app.requestRender();

      // Geocodificação automática de endereço
      if (this.tool.location.latitude !== null && this.tool.location.longitude !== null) {
        try {
          const geo = await reverseGeocode(this.tool.location.latitude, this.tool.location.longitude);
          if (geo) this.applyGeocodedLocation(geo);
        } catch {}
      }

      if (this.app && typeof this.app.showToast === 'function') {
        this.app.showToast('Fotografia capturada na câmera com sucesso!');
      }
    } catch (err) {
      alert(`Falha ao processar fotografia da câmera: ${err.message}`);
    } finally {
      if (this.app && typeof this.app.showLoading === 'function') {
        this.app.showLoading(false);
      }
      if (this.cameraInput) this.cameraInput.value = '';
    }
  }

  /**
   * Métodos de Gerenciamento do Modal de Lote
   */
  openBatchModal() {
    if (this.batchModal) {
      this.batchModal.style.display = 'flex';
      this.renderBatchList();
    }
  }

  closeBatchModal() {
    if (this.batchModal) {
      this.batchModal.style.display = 'none';
    }
  }

  async addBatchFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (this.batchPhotos.some(p => p.filename === file.name && p.fileSize === file.size)) {
        continue;
      }
      try {
        const exif = await readExifData(file);
        this.batchPhotos.push({
          file,
          filename: file.name,
          fileSize: file.size,
          exif
        });
      } catch {
        this.batchPhotos.push({
          file,
          filename: file.name,
          fileSize: file.size,
          exif: { hasGps: false, hasDate: false }
        });
      }
    }

    if (this.batchFileInput) this.batchFileInput.value = '';
    this.updateBatchBadge();
    this.renderBatchList();

    if (this.app && typeof this.app.showToast === 'function') {
      this.app.showToast(`${fileList.length} fotografia(s) adicionadas à fila de lote.`);
    }
  }

  updateBatchBadge() {
    const count = this.batchPhotos.length;
    if (this.batchBadge) {
      this.batchBadge.textContent = count;
      this.batchBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
    if (this.batchCountText) {
      this.batchCountText.textContent = `${count} fotografia(s) na fila`;
    }
  }

  clearBatch() {
    this.batchPhotos = [];
    this.updateBatchBadge();
    this.renderBatchList();
  }

  renderBatchList() {
    if (!this.batchListContainer) return;
    this.batchListContainer.innerHTML = '';

    if (this.batchPhotos.length === 0) {
      this.batchListContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 11.5px;">
          Nenhuma fotografia na fila de lote. Clique em <strong>+ Adicionar Mais Fotos</strong> para importar.
        </div>
      `;
      return;
    }

    const prefix = this.batchPrefix ? this.batchPrefix.value : 'Foto ';
    const startNum = parseInt(this.batchStartNum ? this.batchStartNum.value : 1, 10) || 1;

    this.batchPhotos.forEach((photo, idx) => {
      const item = document.createElement('div');
      item.className = 'batch-item';

      const numStr = `${prefix}${String(startNum + idx).padStart(2, '0')}`;
      const gpsStatus = photo.exif?.hasGps ? '📍 GPS Detectado' : 'Sem GPS';
      const sizeKb = (photo.fileSize / 1024).toFixed(0);

      item.innerHTML = `
        <div class="batch-item-info">
          <span class="batch-item-num">${numStr}</span>
          <span class="batch-item-name" title="${photo.filename}">${photo.filename}</span>
          <span style="font-size: 10px; color: var(--text-subtle);">(${sizeKb} KB)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="batch-item-status">${gpsStatus}</span>
          <button type="button" class="btn-icon btn-sm btn-remove-batch" title="Remover da fila" data-index="${idx}">
            <svg class="svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `;

      const removeBtn = item.querySelector('.btn-remove-batch');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.batchPhotos.splice(idx, 1);
          this.updateBatchBadge();
          this.renderBatchList();
        });
      }

      this.batchListContainer.appendChild(item);
    });
  }

  async processAndExportBatchZip() {
    if (this.batchPhotos.length === 0) {
      alert('Nenhuma fotografia na fila de lote.');
      return;
    }

    const prefix = this.batchPrefix ? this.batchPrefix.value : 'Foto ';
    const startNum = parseInt(this.batchStartNum ? this.batchStartNum.value : 1, 10) || 1;
    const preserveExif = this.batchPreserveExif ? this.batchPreserveExif.checked : true;
    const mimeType = this.selectExportFormat ? this.selectExportFormat.value : 'image/jpeg';

    if (this.batchProgressWrapper) this.batchProgressWrapper.style.display = 'flex';
    if (this.btnExportBatchZip) this.btnExportBatchZip.disabled = true;

    try {
      const total = this.batchPhotos.length;
      const loadedPhotos = [];

      for (let i = 0; i < total; i++) {
        const item = this.batchPhotos[i];
        if (this.batchProgressText) {
          this.batchProgressText.textContent = `Carregando foto ${i + 1} de ${total}: ${item.filename}...`;
        }
        if (this.batchProgressFill) {
          this.batchProgressFill.style.width = `${Math.round(((i) / (total * 2)) * 100)}%`;
        }

        const photoData = await loadImageFromFile(item.file);
        loadedPhotos.push({
          ...photoData,
          batchIndex: i,
          seqNumber: `${prefix}${String(startNum + i).padStart(2, '0')}`
        });
      }

      const renderPhotoFn = async (p, idx, tot) => {
        if (this.batchProgressText) {
          this.batchProgressText.textContent = `Carimbando foto ${idx + 1} de ${tot}: ${p.filename}...`;
        }
        if (this.batchProgressFill) {
          this.batchProgressFill.style.width = `${Math.round(50 + ((idx + 1) / (tot * 2)) * 100)}%`;
        }

        const canvas = document.createElement('canvas');
        canvas.width = p.width;
        canvas.height = p.height;

        const lines = this.tool.activeFields
          .filter(f => f.enabled)
          .map(f => {
            let val = '';
            if (f.id === 'photo_id') {
              val = p.seqNumber;
            } else if (['lat', 'lon', 'coordinates'].includes(f.id)) {
              if (p.exif.hasGps) {
                val = formatCoordinates(p.exif.latitude, p.exif.longitude, this.tool.settings.coordFormat);
              } else {
                val = this.tool.getFieldValue(f.id, f);
              }
            } else if (['date', 'time', 'datetime'].includes(f.id)) {
              if (p.exif.hasDate && p.exif.dateObj) {
                val = this.tool.formatDateTime(p.exif.dateObj);
              } else {
                val = this.tool.getFieldValue(f.id, f);
              }
            } else {
              val = this.tool.getFieldValue(f.id, f);
            }

            if (this.tool.settings.showOriginStampBadge) {
              const originBadge = (['lat', 'lon', 'coordinates'].includes(f.id))
                ? (p.exif.hasGps ? 'EXIF' : 'MANUAL')
                : (['date', 'time', 'datetime'].includes(f.id))
                  ? (p.exif.hasDate ? 'EXIF' : 'MANUAL')
                  : null;
              if (originBadge) val = `${val} [${originBadge}]`;
            }

            return {
              id: f.id,
              label: f.label,
              value: val,
              showLabel: f.showLabel !== false,
              isCustom: f.isCustom,
              icon: f.icon || FIELD_ICONS[f.id] || 'default'
            };
          })
          .filter(l => l.value);

        this.engine.render(canvas, p.canvas, lines, this.tool.settings, true);
        return canvas;
      };

      await exportStampedPhotosBatch(loadedPhotos, renderPhotoFn, {
        mimeType,
        preserveExif,
        zipFilename: `fotos_carimbadas_${Date.now()}.zip`
      });

      // Avança a numeração pela quantidade de fotos exportadas no lote
      this.tool.advanceNumbering(total);
      this.syncNumberingControls();
      this.scheduleAutoSave();

      if (this.batchProgressText) {
        this.batchProgressText.textContent = `✓ Lote concluído! Download do ZIP iniciado.`;
      }
      if (this.batchProgressFill) {
        this.batchProgressFill.style.width = '100%';
      }

      if (this.app && typeof this.app.showToast === 'function') {
        this.app.showToast(`Lote com ${total} fotografias processado e baixado em ZIP!`);
      }

      setTimeout(() => {
        this.closeBatchModal();
        if (this.batchProgressWrapper) this.batchProgressWrapper.style.display = 'none';
        if (this.batchProgressFill) this.batchProgressFill.style.width = '0%';
      }, 1500);
    } catch (err) {
      alert(`Erro durante o processamento em lote: ${err.message}`);
    } finally {
      if (this.btnExportBatchZip) this.btnExportBatchZip.disabled = false;
    }
  }
}
