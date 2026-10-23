/**
 * Storage Engine for The Client Billing Kit
 * Manages local persistence, profiles, client presets, and JSON backup/restore.
 * 100% client-side, zero external network transmission.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StorageEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEYS = {
    PROFILE: 'cbk_seller_profile_v1',
    CLIENTS: 'cbk_client_presets_v1',
    SETTINGS: 'cbk_app_settings_v1',
    CURRENT_INVOICE: 'cbk_active_draft_v1',
    INVOICE_HISTORY: 'cbk_invoice_history_v1'
  };

  const DEFAULT_PROFILE = {
    businessName: 'Studio Minimalist',
    senderName: 'Alex Morgan',
    senderEmail: 'alex@studiominimalist.design',
    senderAddress: '100 Creative Way, Suite 400\nSan Francisco, CA 94103',
    senderPhone: '+1 (415) 555-0199',
    taxId: 'US-84920192',
    accentColor: '#18181b', // sleek obsidian zinc
    logoDataUri: null,
    defaultCurrency: 'USD',
    defaultPaymentTerms: 'Payment due within 14 days of invoice date.\nBank: Chase Business | Routing: 12100024 | Acct: 892019482\nStripe / Wire: invoice.link/pay'
  };

  function isLocalStorageAvailable() {
    try {
      const test = '__cbk_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  function getStoredItem(key, defaultValue = null) {
    if (!isLocalStorageAvailable()) return defaultValue;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      console.warn(`Failed to parse storage key ${key}:`, e);
      return defaultValue;
    }
  }

  function setStoredItem(key, value) {
    if (!isLocalStorageAvailable()) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Failed to write storage key ${key}:`, e);
      return false;
    }
  }

  // Profile operations
  function loadProfile() {
    return getStoredItem(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  }

  function saveProfile(profile) {
    const current = loadProfile();
    const updated = { ...current, ...profile, updatedAt: new Date().toISOString() };
    return setStoredItem(STORAGE_KEYS.PROFILE, updated);
  }

  // Client Presets
  function loadClients() {
    return getStoredItem(STORAGE_KEYS.CLIENTS, []);
  }

  function saveClient(client) {
    const clients = loadClients();
    const id = client.id || 'client_' + Date.now();
    const existingIdx = clients.findIndex(c => c.id === id);

    const clientRecord = {
      ...client,
      id,
      updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      clients[existingIdx] = clientRecord;
    } else {
      clients.push(clientRecord);
    }

    setStoredItem(STORAGE_KEYS.CLIENTS, clients);
    return clientRecord;
  }

  // Current draft operations
  function loadDraft() {
    return getStoredItem(STORAGE_KEYS.CURRENT_INVOICE, null);
  }

  function saveDraft(invoiceData) {
    return setStoredItem(STORAGE_KEYS.CURRENT_INVOICE, {
      ...invoiceData,
      savedAt: new Date().toISOString()
    });
  }

  // Save historical snapshot
  function archiveInvoice(invoiceData) {
    const history = getStoredItem(STORAGE_KEYS.INVOICE_HISTORY, []);
    const record = {
      ...invoiceData,
      archivedAt: new Date().toISOString()
    };
    history.unshift(record);
    // keep maximum 50 recent snapshots locally
    if (history.length > 50) history.pop();
    setStoredItem(STORAGE_KEYS.INVOICE_HISTORY, history);
    return record;
  }

  // Backup & Restore
  function exportFullBackupJSON() {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: loadProfile(),
      clients: loadClients(),
      draft: loadDraft(),
      history: getStoredItem(STORAGE_KEYS.INVOICE_HISTORY, [])
    };
    return JSON.stringify(backup, null, 2);
  }

  function importBackupJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.version) throw new Error("Invalid backup format: Missing version tag");

      if (data.profile) setStoredItem(STORAGE_KEYS.PROFILE, data.profile);
      if (data.clients) setStoredItem(STORAGE_KEYS.CLIENTS, data.clients);
      if (data.draft) setStoredItem(STORAGE_KEYS.CURRENT_INVOICE, data.draft);
      if (data.history) setStoredItem(STORAGE_KEYS.INVOICE_HISTORY, data.history);

      return { success: true, message: "Backup restored successfully!" };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  return {
    STORAGE_KEYS,
    DEFAULT_PROFILE,
    isLocalStorageAvailable,
    loadProfile,
    saveProfile,
    loadClients,
    saveClient,
    loadDraft,
    saveDraft,
    archiveInvoice,
    exportFullBackupJSON,
    importBackupJSON
  };
}));
