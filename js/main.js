/**
 * STAMP-CAMERA - Ponto de Entrada Principal (Main Application Entry)
 * Orquestra o ciclo de vida, temas, carregamento de imagens,
 * renderização reativa e exportação.
 */

import { StampEngine } from './stamp-engine.js';
import { loadImageFromFile, createDemoImage } from './image-loader.js';
import { exportStampedPhoto } from './export.js';
import { storage } from './storage.js';
import { StampCameraTool } from './tools/stamp-camera/tool.js';
import { StampCameraUI } from './tools/stamp-camera/ui.js';
import { setLanguage } from './i18n.js';

class StampCameraApp {
  constructor() {
    this.tool = new StampCameraTool();
    this.engine = new StampEngine();
    this.ui = null;
    this.renderScheduled = false;

    this.init();
  }

  init() {
    // 1. Inicializa o tema salvo ou padrão escuro
    this.initTheme();

    // 2. Inicializa o idioma
    this.initLanguage();

    // 3. Inicializa UI e escutas
    this.ui = new StampCameraUI(this.tool, this.engine, this);

    // 4. Restaura estado salvo do Schema 1
    this.restoreSavedAppState();

    // 5. Conecta eventos globais
    this.bindGlobalEvents();

    // 6. Verifica cota de armazenamento e rascunho anterior (IndexedDB)
    this.checkStorageAndDrafts();

    console.log('[STAMP-CAMERA] Sistema inicializado com sucesso. 100% Client-Side.');
  }

  restoreSavedAppState() {
    try {
      const savedState = storage.getAppState();
      if (this.ui) {
        this.ui.restoreState(savedState);
      }
    } catch (e) {
      console.warn('Erro ao restaurar estado do app:', e);
    }
  }

  async checkStorageAndDrafts() {
    try {
      // Monitoramento de espaço (>80%)
      const quota = await storage.checkStorageQuota();
      if (quota && quota.isNearFull && this.ui) {
        this.ui.updateSaveIndicator('near-full');
      }

      // Solicita persistência
      await storage.requestPersistence();

      // Verifica rascunho no IndexedDB
      const draft = await storage.getDraftPhoto();
      if (draft && draft.dataUrl && this.ui) {
        this.ui.showDraftBanner(draft);
      }
    } catch (e) {
      console.warn('Erro ao verificar armazenamento e rascunhos:', e);
    }
  }

  async saveCurrentDraft() {
    if (!this.tool.photo || !this.tool.photo.canvas) return;
    try {
      const canvas = this.tool.photo.canvas;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      await storage.saveDraftPhoto({
        dataUrl,
        width: this.tool.photo.width,
        height: this.tool.photo.height,
        filename: this.tool.photo.filename,
        fileSize: this.tool.photo.fileSize,
        exif: this.tool.exif,
        customPosX: this.tool.settings.customPosX,
        customPosY: this.tool.settings.customPosY
      });
    } catch (e) {
      console.warn('Erro ao salvar rascunho no IndexedDB:', e);
    }
  }

  initTheme() {
    const savedTheme = storage.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      const sunSvg = `<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      const moonSvg = `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

      themeToggleBtn.innerHTML = savedTheme === 'dark' ? sunSvg : moonSvg;
      themeToggleBtn.title = savedTheme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro';
      themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        storage.setTheme(next);
        themeToggleBtn.innerHTML = next === 'dark' ? sunSvg : moonSvg;
        themeToggleBtn.title = next === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro';
      });
    }
  }

  initLanguage() {
    const savedLang = storage.getLanguage();
    setLanguage(savedLang);
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.value = savedLang;
      langSelect.addEventListener('change', (e) => {
        storage.setLanguage(e.target.value);
        setLanguage(e.target.value);
        // Atualiza interface se necessário
      });
    }
  }

  bindGlobalEvents() {
    // Botão "Abrir Fotografia"
    const btnOpen = document.getElementById('btnOpenPhoto');
    const fileInput = document.getElementById('fileInput');
    const btnDropOpen = document.getElementById('btnDropOpen');

    if (btnOpen && fileInput) {
      btnOpen.addEventListener('click', () => fileInput.click());
    }
    if (btnDropOpen && fileInput) {
      btnDropOpen.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (e.target.files.length > 1) {
          if (this.ui) {
            this.ui.addBatchFiles(e.target.files);
            this.ui.openBatchModal();
          }
        } else {
          this.handleFileSelected(e.target.files[0]);
        }
      });
    }

    // Botões de Demonstração (Permitem testar imediatamente com um clique)
    const btnDemoWithGps = document.getElementById('btnDemoWithGps');
    if (btnDemoWithGps) {
      btnDemoWithGps.addEventListener('click', async () => {
        await this.loadDemoPhoto('with_gps');
      });
    }

    const btnDemoWithoutGps = document.getElementById('btnDemoWithoutGps');
    if (btnDemoWithoutGps) {
      btnDemoWithoutGps.addEventListener('click', async () => {
        await this.loadDemoPhoto('without_gps');
      });
    }

    // Botão Limpar / Resetar
    const btnClearWorkspace = document.getElementById('btnClearWorkspace');
    if (btnClearWorkspace) {
      btnClearWorkspace.addEventListener('click', () => this.handleClear());
    }

    const btnClearPhoto = document.getElementById('btnClearPhoto');
    if (btnClearPhoto) {
      btnClearPhoto.addEventListener('click', () => this.handleClear());
    }

    // Botão de Busca Automática de Endereço pelas Coordenadas
    const btnAutoGeocode = document.getElementById('btnAutoGeocode');
    if (btnAutoGeocode) {
      btnAutoGeocode.addEventListener('click', () => this.handleAutoGeocode());
    }

    // Botão de Exportação
    const btnExport = document.getElementById('btnExport');
    if (btnExport) {
      btnExport.addEventListener('click', () => this.handleExport());
    }

    // Redimensionamento de janela (atualiza preview se necessário)
    window.addEventListener('resize', () => {
      this.requestRender();
    });
  }

  async handleFileSelected(file) {
    try {
      this.showLoading(true);
      const photoData = await loadImageFromFile(file);
      this.tool.loadPhotoData(photoData);

      // Busca automática de cidade, estado e país se houver GPS
      await this.tool.autoResolveLocation();

      this.ui.syncPhotoState();
      this.requestRender();

      // Salva rascunho da fotografia no IndexedDB
      await this.saveCurrentDraft();

      if (this.tool.location.city || this.tool.location.state) {
        const locStr = [this.tool.location.city, this.tool.location.state, this.tool.location.country].filter(Boolean).join(', ');
        this.showToast(`Localização identificada: ${locStr}`);
      }
    } catch (err) {
      alert(`Erro ao processar fotografia: ${err.message}`);
    } finally {
      this.showLoading(false);
    }
  }

  async loadDemoPhoto(type = 'with_gps') {
    try {
      this.showLoading(true);
      const demoData = await createDemoImage(type);
      this.tool.loadPhotoData(demoData);

      // Busca automática de cidade, estado e país se houver GPS
      await this.tool.autoResolveLocation();

      this.ui.syncPhotoState();
      this.requestRender();

      // Salva rascunho da demonstração no IndexedDB
      await this.saveCurrentDraft();

      if (this.tool.location.city || this.tool.location.state) {
        const locStr = [this.tool.location.city, this.tool.location.state, this.tool.location.country].filter(Boolean).join(', ');
        this.showToast(`Localização identificada: ${locStr}`);
      }
    } catch (err) {
      console.error('Erro ao gerar foto de demonstração:', err);
    } finally {
      this.showLoading(false);
    }
  }

  async handleClear() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';

    await storage.clearDraftPhoto();
    if (this.ui) this.ui.hideDraftBanner();

    this.tool.clearWorkspace();
    this.ui.syncPhotoState();
    this.requestRender();
    this.showToast('Área de trabalho limpa.');
  }

  async handleAutoGeocode() {
    if (this.tool.location.latitude === null || this.tool.location.longitude === null) {
      this.showToast('Insira coordenadas de latitude e longitude primeiro.');
      return;
    }

    this.showLoading(true);
    try {
      const geo = await this.tool.autoResolveLocation();
      this.ui.syncPhotoState();
      this.requestRender();

      if (geo && (geo.city || geo.state)) {
        const locStr = [geo.city, geo.state, geo.country].filter(Boolean).join(', ');
        this.showToast(`Localização identificada: ${locStr}`);
      } else {
        this.showToast('Coordenadas válidas, mas localidade não mapeada.');
      }
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Solicita nova renderização usando requestAnimationFrame para alto desempenho
   */
  requestRender() {
    if (this.renderScheduled) return;
    this.renderScheduled = true;

    requestAnimationFrame(() => {
      this.renderScheduled = false;
      this.render();
    });
  }

  render() {
    if (!this.tool.photo || !this.ui.previewCanvas) return;

    const canvas = this.ui.previewCanvas;
    const source = this.tool.photo.canvas;
    const lines = this.tool.getStampRenderLines();
    const settings = this.tool.settings;

    this.engine.render(canvas, source, lines, settings, false);
  }

  async handleExport() {
    if (!this.tool.photo) {
      alert('Selecione ou carregue uma fotografia antes de exportar.');
      return;
    }

    try {
      const btnExport = document.getElementById('btnExport');
      const originalHtml = btnExport.innerHTML;
      btnExport.innerHTML = `<svg class="svg-icon" style="animation: spin 0.7s linear infinite;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg><span>Gerando...</span>`;
      btnExport.disabled = true;

      // Criar canvas de alta resolução 1:1 para exportação sem perda de qualidade
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = this.tool.photo.width;
      exportCanvas.height = this.tool.photo.height;

      const lines = this.tool.getStampRenderLines();
      const settings = this.tool.settings;

      // Renderiza resolução nativa
      this.engine.render(exportCanvas, this.tool.photo.canvas, lines, settings, true);

      // Determina formato e qualidade (qualidade máxima 1.0 preservando 100% da imagem sem perda)
      const formatSelect = document.getElementById('selectExportFormat');
      const mimeType = formatSelect ? formatSelect.value : 'image/jpeg';
      const quality = 1.0;

      const exportRes = await exportStampedPhoto(
        exportCanvas,
        this.tool.photo.filename,
        mimeType,
        quality,
        {
          preserveExif: this.tool.settings.preserveExif !== false,
          rawApp1Bytes: this.tool.photo?.exif?.rawApp1Bytes,
          exifData: {
            latitude: this.tool.location.latitude,
            longitude: this.tool.location.longitude,
            altitude: this.tool.location.altitude,
            dateStr: this.tool.photo?.exif?.dateStr || null
          }
        }
      );

      btnExport.innerHTML = originalHtml;
      btnExport.disabled = false;

      // Avança a numeração após exportação concluída com sucesso
      this.tool.advanceNumbering(1);
      if (this.ui) {
        this.ui.syncNumberingControls();
        this.ui.scheduleAutoSave();
      }

      // Mensagem visual de sucesso
      const outFilename = typeof exportRes === 'string' ? exportRes : exportRes.filename;
      const exifTag = (exportRes && exportRes.exifPreserved) ? ' (EXIF preservado)' : '';
      this.showToast(`Fotografia exportada: ${outFilename}${exifTag}`);
    } catch (err) {
      const btnExport = document.getElementById('btnExport');
      if (btnExport) {
        btnExport.innerHTML = `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Exportar Foto</span>`;
        btnExport.disabled = false;
      }
      alert(`Falha ao exportar imagem: ${err.message}`);
    }
  }

  showToast(msg) {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3500);
  }

  showLoading(isLoading) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
      loader.style.display = isLoading ? 'flex' : 'none';
    }
  }
}

// Inicia aplicação após DOM pronto
document.addEventListener('DOMContentLoaded', () => {
  window.stampCameraApp = new StampCameraApp();
});
