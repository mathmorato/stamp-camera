/**
 * STAMP-CAMERA - Gerenciamento de Armazenamento Local (localStorage)
 * 100% Client-side. Não envia dados para a nuvem.
 */

const STORAGE_KEYS = {
  SETTINGS: 'stamp_camera_settings_v1',
  THEME: 'stamp_camera_theme',
  CUSTOM_PRESETS: 'stamp_camera_custom_presets_v1',
  LANGUAGE: 'stamp_camera_lang',
  RECENT_CONFIG: 'stamp_camera_recent_config'
};

export const storage = {
  getTheme() {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    } catch {
      return 'dark';
    }
  },

  setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.warn('Erro ao salvar tema:', e);
    }
  },

  getLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'pt-BR';
    } catch {
      return 'pt-BR';
    }
  },

  setLanguage(lang) {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.warn('Erro ao salvar idioma:', e);
    }
  },

  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Erro ao salvar configurações:', e);
    }
  },

  getCustomPresets() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRESETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomPreset(preset) {
    try {
      const presets = this.getCustomPresets();
      const existingIdx = presets.findIndex(p => p.id === preset.id);
      if (existingIdx >= 0) {
        presets[existingIdx] = preset;
      } else {
        presets.push(preset);
      }
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(presets));
      return true;
    } catch (e) {
      console.warn('Erro ao salvar preset:', e);
      return false;
    }
  },

  deleteCustomPreset(presetId) {
    try {
      let presets = this.getCustomPresets();
      presets = presets.filter(p => p.id !== presetId);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(presets));
      return true;
    } catch {
      return false;
    }
  }
};
