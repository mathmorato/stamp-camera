/**
 * STAMP-CAMERA - Gerenciamento de Armazenamento Local (localStorage e IndexedDB)
 * Versão: 1.1.5
 * 100% Client-side. Nenhum dado é enviado para a nuvem ou servidores externos.
 * 
 * Regras Técnicas:
 * - Versão no esquema: { "schema": 1, ... }
 * - Função migrate() converte versões legadas sem descarte de dados
 * - Todo acesso encapsulado em try/catch resiliente (compatível com aba anônima)
 * - Monitoramento de espaço com navigator.storage.estimate()
 * - Solicitação de persistência com navigator.storage.persist()
 */

import { PNITE_VERSION, DEFAULT_STAMP_SETTINGS, DEFAULT_NUMBERING } from './config.js';

export const CURRENT_SCHEMA_VERSION = 1;

const STORAGE_KEYS = {
  APP_STATE: 'stamp_camera_app_state_v1',
  SETTINGS: 'stamp_camera_settings_v1',
  THEME: 'stamp_camera_theme',
  CUSTOM_PRESETS: 'stamp_camera_custom_presets_v1',
  LANGUAGE: 'stamp_camera_lang',
  COUNTER: 'stamp_camera_counter_v1'
};

const DB_CONFIG = {
  NAME: 'stamp_camera_db',
  VERSION: 1,
  STORE_DRAFT: 'draft_store'
};

/**
 * Converte dados salvos de esquemas antigos para o esquema atual (Schema 1)
 * @param {Object} data 
 * @returns {Object} Dados normalizados no Schema 1
 */
export function migrate(data) {
  if (!data || typeof data !== 'object') {
    return {
      schema: CURRENT_SCHEMA_VERSION,
      version: PNITE_VERSION,
      config: { ...DEFAULT_STAMP_SETTINGS },
      models: [],
      data: { location: {}, activeFields: [] },
      counter: { ...DEFAULT_NUMBERING },
      selectedModelId: 'model_1_simple'
    };
  }

  const result = { ...data };
  const schema = typeof result.schema === 'number' ? result.schema : 0;

  if (schema < 1) {
    result.schema = CURRENT_SCHEMA_VERSION;
    result.version = result.version || PNITE_VERSION;
    result.config = result.config || result.settings || { ...DEFAULT_STAMP_SETTINGS };
    result.models = Array.isArray(result.models) ? result.models : (result.customPresets || []);
    result.data = result.data || {};
    if (!result.data.location) {
      result.data.location = result.location || {};
    }
    if (!Array.isArray(result.data.activeFields)) {
      result.data.activeFields = result.activeFields || [];
    }
    result.counter = result.counter || result.numbering || { ...DEFAULT_NUMBERING };
    result.selectedModelId = result.selectedModelId || 'model_1_simple';
  }

  return result;
}

/**
 * Helper interno para abrir o IndexedDB de forma resiliente em try/catch
 */
function openIndexedDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB não suportado'));
    }
    try {
      const request = indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_CONFIG.STORE_DRAFT)) {
          db.createObjectStore(DB_CONFIG.STORE_DRAFT, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('IndexedDB bloqueado'));
    } catch (err) {
      reject(err);
    }
  });
}

export const storage = {
  isAvailable: null,

  /**
   * Testa se o localStorage está disponível e gravável
   */
  isStorageAvailable() {
    if (this.isAvailable !== null) return this.isAvailable;
    try {
      const testKey = '__stamp_storage_probe__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      this.isAvailable = true;
      return true;
    } catch (e) {
      this.isAvailable = false;
      return false;
    }
  },

  // -------------------------------------------------------------
  // TEMA E IDIOMA
  // -------------------------------------------------------------
  getTheme() {
    try {
      if (!this.isStorageAvailable()) return 'dark';
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    } catch {
      return 'dark';
    }
  },

  setTheme(theme) {
    try {
      if (!this.isStorageAvailable()) return;
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.warn('Erro ao salvar tema:', e);
    }
  },

  getLanguage() {
    try {
      if (!this.isStorageAvailable()) return 'pt-BR';
      return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'pt-BR';
    } catch {
      return 'pt-BR';
    }
  },

  setLanguage(lang) {
    try {
      if (!this.isStorageAvailable()) return;
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.warn('Erro ao salvar idioma:', e);
    }
  },

  // -------------------------------------------------------------
  // ESTADO COMPLETO DO APP (SCHEMA 1)
  // -------------------------------------------------------------
  getAppState() {
    try {
      if (!this.isStorageAvailable()) return null;
      const raw = localStorage.getItem(STORAGE_KEYS.APP_STATE);
      if (raw) {
        const parsed = JSON.parse(raw);
        return migrate(parsed);
      }

      // Fallback para chaves legadas se existirem
      const legacySettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const legacyPresets = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRESETS);
      if (legacySettings || legacyPresets) {
        return migrate({
          schema: 0,
          settings: legacySettings ? JSON.parse(legacySettings) : null,
          customPresets: legacyPresets ? JSON.parse(legacyPresets) : []
        });
      }
      return null;
    } catch (e) {
      console.warn('Erro ao ler estado do app:', e);
      return null;
    }
  },

  saveAppState(state) {
    try {
      if (!this.isStorageAvailable()) return false;
      const payload = {
        schema: CURRENT_SCHEMA_VERSION,
        version: PNITE_VERSION,
        updatedAt: Date.now(),
        config: state.config || state.settings || {},
        models: state.models || this.getCustomPresets() || [],
        data: {
          location: state.location || (state.data && state.data.location) || {},
          activeFields: state.activeFields || (state.data && state.data.activeFields) || []
        },
        counter: state.counter || state.numbering || { ...DEFAULT_NUMBERING },
        selectedModelId: state.selectedModelId || 'model_1_simple'
      };

      localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn('Erro ao salvar estado do app:', e);
      return false;
    }
  },

  // -------------------------------------------------------------
  // MODELOS E PRESETS PERSONALIZADOS
  // -------------------------------------------------------------
  getCustomPresets() {
    try {
      if (!this.isStorageAvailable()) return [];
      // Tenta ler do app state primeiro
      const state = this.getAppState();
      if (state && Array.isArray(state.models) && state.models.length > 0) {
        return state.models;
      }
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRESETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomPreset(preset) {
    try {
      if (!preset || !preset.id) return false;
      const presets = this.getCustomPresets();
      const existingIdx = presets.findIndex(p => p.id === preset.id);
      if (existingIdx >= 0) {
        presets[existingIdx] = preset;
      } else {
        presets.push(preset);
      }
      if (this.isStorageAvailable()) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(presets));
        // Sincroniza também no estado unificado
        const state = this.getAppState() || {};
        state.models = presets;
        this.saveAppState(state);
      }
      return true;
    } catch (e) {
      console.warn('Erro ao salvar preset personalizado:', e);
      return false;
    }
  },

  renameCustomPreset(presetId, newName) {
    try {
      if (!presetId || !newName) return false;
      const presets = this.getCustomPresets();
      const target = presets.find(p => p.id === presetId);
      if (!target) return false;
      target.name = newName.trim();
      if (this.isStorageAvailable()) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(presets));
        const state = this.getAppState() || {};
        state.models = presets;
        this.saveAppState(state);
      }
      return true;
    } catch (e) {
      console.warn('Erro ao renomear preset:', e);
      return false;
    }
  },

  deleteCustomPreset(presetId) {
    try {
      let presets = this.getCustomPresets();
      presets = presets.filter(p => p.id !== presetId);
      if (this.isStorageAvailable()) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(presets));
        const state = this.getAppState() || {};
        state.models = presets;
        this.saveAppState(state);
      }
      return true;
    } catch (e) {
      console.warn('Erro ao excluir preset:', e);
      return false;
    }
  },

  // -------------------------------------------------------------
  // CONTADOR DE NUMERAÇÃO
  // -------------------------------------------------------------
  getCounter() {
    try {
      if (!this.isStorageAvailable()) return null;
      const raw = localStorage.getItem(STORAGE_KEYS.COUNTER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveCounter(counterData) {
    try {
      if (!this.isStorageAvailable()) return false;
      localStorage.setItem(STORAGE_KEYS.COUNTER, JSON.stringify(counterData));
      return true;
    } catch (e) {
      console.warn('Erro ao salvar contador:', e);
      return false;
    }
  },

  // -------------------------------------------------------------
  // RASCUNHO DE FOTO NO INDEXEDDB
  // -------------------------------------------------------------
  async saveDraftPhoto(draftData) {
    try {
      const db = await openIndexedDatabase();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(DB_CONFIG.STORE_DRAFT, 'readwrite');
          const store = tx.objectStore(DB_CONFIG.STORE_DRAFT);
          const record = {
            id: 'current_draft',
            savedAt: Date.now(),
            ...draftData
          };
          const req = store.put(record);
          req.onsuccess = () => resolve(true);
          req.onerror = () => {
            console.warn('Falha ao salvar rascunho no IndexedDB:', req.error);
            resolve(false);
          };
        } catch {
          resolve(false);
        }
      });
    } catch (e) {
      console.warn('IndexedDB indisponível para rascunho:', e);
      return false;
    }
  },

  async updateDraftPosition(customPosX, customPosY) {
    try {
      const draft = await this.getDraftPhoto();
      if (!draft) return false;
      draft.customPosX = customPosX;
      draft.customPosY = customPosY;
      draft.savedAt = Date.now();
      return await this.saveDraftPhoto(draft);
    } catch {
      return false;
    }
  },

  async getDraftPhoto() {
    try {
      const db = await openIndexedDatabase();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(DB_CONFIG.STORE_DRAFT, 'readonly');
          const store = tx.objectStore(DB_CONFIG.STORE_DRAFT);
          const req = store.get('current_draft');
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
    } catch {
      return null;
    }
  },

  async clearDraftPhoto() {
    try {
      const db = await openIndexedDatabase();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(DB_CONFIG.STORE_DRAFT, 'readwrite');
          const store = tx.objectStore(DB_CONFIG.STORE_DRAFT);
          const req = store.delete('current_draft');
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      });
    } catch {
      return false;
    }
  },

  // -------------------------------------------------------------
  // MONITORAMENTO DE ESPAÇO E PERSISTÊNCIA
  // -------------------------------------------------------------
  async checkStorageQuota() {
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.estimate === 'function') {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const ratio = quota > 0 ? usage / quota : 0;
        return {
          usage,
          quota,
          ratio,
          isNearFull: ratio > 0.8
        };
      }
    } catch (e) {
      console.warn('Erro ao verificar cota de armazenamento:', e);
    }
    return { usage: 0, quota: 0, ratio: 0, isNearFull: false };
  },

  async requestPersistence() {
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.persist === 'function') {
        const persisted = await navigator.storage.persist();
        return persisted;
      }
    } catch (e) {
      console.warn('Erro ao solicitar persistência:', e);
    }
    return false;
  },

  // -------------------------------------------------------------
  // BACKUP E RESTAURAÇÃO (.JSON)
  // -------------------------------------------------------------
  getBackupData(tool) {
    const customModels = this.getCustomPresets();
    return {
      schema: CURRENT_SCHEMA_VERSION,
      version: PNITE_VERSION,
      exportedAt: new Date().toISOString(),
      config: tool ? { ...tool.settings } : { ...DEFAULT_STAMP_SETTINGS },
      models: customModels,
      data: {
        location: tool ? { ...tool.location, sources: { ...tool.location.sources } } : {},
        activeFields: tool ? tool.activeFields.map(f => ({ ...f })) : []
      },
      counter: tool ? { ...tool.numbering } : { ...DEFAULT_NUMBERING }
    };
  },

  importBackupData(jsonContent, mode = 'replace', currentTool = null) {
    try {
      const parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      const migrated = migrate(parsed);

      if (mode === 'replace') {
        // Substitui tudo
        if (migrated.models && Array.isArray(migrated.models)) {
          if (this.isStorageAvailable()) {
            localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(migrated.models));
          }
        }
        if (currentTool) {
          if (migrated.config) currentTool.settings = { ...DEFAULT_STAMP_SETTINGS, ...migrated.config };
          if (migrated.counter) currentTool.numbering = { ...DEFAULT_NUMBERING, ...migrated.counter };
          if (migrated.data && migrated.data.location) {
            currentTool.location = { ...currentTool.location, ...migrated.data.location };
          }
          if (migrated.data && Array.isArray(migrated.data.activeFields) && migrated.data.activeFields.length > 0) {
            currentTool.activeFields = migrated.data.activeFields;
          }
        }
        this.saveAppState(migrated);
        return { success: true, mode: 'replace', data: migrated };
      } else {
        // Mesclar (merge)
        const existingModels = this.getCustomPresets();
        const incomingModels = Array.isArray(migrated.models) ? migrated.models : [];
        const mergedModels = [...existingModels];

        for (const model of incomingModels) {
          const idx = mergedModels.findIndex(m => m.id === model.id);
          if (idx >= 0) {
            mergedModels[idx] = model; // atualiza existente
          } else {
            mergedModels.push(model); // adiciona novo
          }
        }

        if (this.isStorageAvailable()) {
          localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(mergedModels));
        }

        if (currentTool) {
          if (migrated.config) {
            currentTool.settings = { ...currentTool.settings, ...migrated.config };
          }
          if (migrated.data && migrated.data.location) {
            // Preenche dados faltantes
            for (const [k, v] of Object.entries(migrated.data.location)) {
              if (v && !currentTool.location[k]) {
                currentTool.location[k] = v;
              }
            }
          }
        }

        const mergedState = {
          schema: CURRENT_SCHEMA_VERSION,
          version: PNITE_VERSION,
          config: currentTool ? currentTool.settings : (migrated.config || {}),
          models: mergedModels,
          data: {
            location: currentTool ? currentTool.location : (migrated.data?.location || {}),
            activeFields: currentTool ? currentTool.activeFields : (migrated.data?.activeFields || [])
          },
          counter: currentTool ? currentTool.numbering : (migrated.counter || { ...DEFAULT_NUMBERING })
        };

        this.saveAppState(mergedState);
        return { success: true, mode: 'merge', data: mergedState };
      }
    } catch (err) {
      console.error('Falha ao importar backup JSON:', err);
      return { success: false, error: err.message };
    }
  },

  // -------------------------------------------------------------
  // LIMPEZA TOTAL DE DADOS (PRIMEIRO ACESSO)
  // -------------------------------------------------------------
  async clearAllData() {
    try {
      if (this.isStorageAvailable()) {
        for (const key of Object.values(STORAGE_KEYS)) {
          localStorage.removeItem(key);
        }
      }
      // Limpa IndexedDB
      await this.clearDraftPhoto();
      return true;
    } catch (e) {
      console.warn('Erro ao limpar dados locais:', e);
      return false;
    }
  }
};
