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

    // 4. Conecta eventos globais
    this.bindGlobalEvents();

    console.log('[STAMP-CAMERA] Sistema inicializado com sucesso. 100% Client-Side.');
  }

  initTheme() {
    const savedTheme = storage.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
      themeToggleBtn.title = savedTheme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro';
      themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        storage.setTheme(next);
        themeToggleBtn.innerHTML = next === 'dark' ? '☀️' : '🌙';
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
        if (e.target.files && e.target.files[0]) {
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

  handleClear() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';

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
      btnExport.innerHTML = '⏳';
      btnExport.disabled = true;

      // Criar canvas de alta resolução 1:1 para exportação sem perda de qualidade
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = this.tool.photo.width;
      exportCanvas.height = this.tool.photo.height;

      const lines = this.tool.getStampRenderLines();
      const settings = this.tool.settings;

      // Renderiza resolução nativa
      this.engine.render(exportCanvas, this.tool.photo.canvas, lines, settings, true);

      // Determina formato e qualidade
      const formatSelect = document.getElementById('selectExportFormat');
      const qualityRange = document.getElementById('rangeExportQuality');

      const mimeType = formatSelect ? formatSelect.value : 'image/jpeg';
      const quality = qualityRange ? parseFloat(qualityRange.value) : 0.95;

      const filename = await exportStampedPhoto(
        exportCanvas,
        this.tool.photo.filename,
        mimeType,
        quality
      );

      btnExport.innerHTML = originalHtml;
      btnExport.disabled = false;

      // Mensagem visual de sucesso
      this.showToast(`Fotografia exportada: ${filename}`);
    } catch (err) {
      const btnExport = document.getElementById('btnExport');
      if (btnExport) {
        btnExport.innerHTML = '💾';
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
