/**
 * Local resilience: IndexedDB autosave for the active board + localStorage for settings
 * + .mboard.json export/import helpers.
 */

const DB_NAME = 'matephis-board-db';
const DB_VERSION = 1;
const STORE_NAME = 'boards';
const CURRENT_KEY = 'current';
const SETTINGS_KEY = 'matephis_board_settings';

function openDB() {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            resolve(null);
            return;
        }
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export class BoardStorage {
    constructor() {
        this._dbPromise = openDB().catch(() => null);
        this._saveTimer = null;
    }

    loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (_) {
            return {};
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (_) {
            // ignore quota/private-mode errors
        }
    }

    async loadBoard() {
        const db = await this._dbPromise;
        if (!db) return null;
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const req = tx.objectStore(STORE_NAME).get(CURRENT_KEY);
                req.onsuccess = () => {
                    const raw = req.result;
                    if (typeof raw !== 'string') return resolve(raw || null);
                    try { resolve(JSON.parse(raw)); } catch (_) { resolve(null); }
                };
                req.onerror = () => resolve(null);
            } catch (_) {
                resolve(null);
            }
        });
    }

    async saveBoardNow(scene) {
        if (this._saveTimer) {
            clearTimeout(this._saveTimer);
            this._saveTimer = null;
        }
        if (this._idleId && typeof cancelIdleCallback === 'function') cancelIdleCallback(this._idleId);
        this._idleId = null;
        const db = await this._dbPromise;
        if (!db) return;
        // Stored as one JSON string: cloning a string into IndexedDB is ~free, while cloning
        // the object tree of a big board blocked the page for several ms on every save.
        const payload = JSON.stringify(scene.toJSON());
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put(payload, CURRENT_KEY);
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
            } catch (_) {
                resolve(false);
            }
        });
    }

    /**
     * Autosave after a pause, in an idle moment (not while the next stroke is being drawn).
     * Closing or hiding the page still saves immediately (see index.js).
     */
    scheduleSave(scene, delayMs = 300) {
        if (this._saveTimer) clearTimeout(this._saveTimer);
        if (this._idleId && typeof cancelIdleCallback === 'function') cancelIdleCallback(this._idleId);
        this._idleId = null;
        this._saveTimer = setTimeout(() => {
            this._saveTimer = null;
            if (typeof requestIdleCallback === 'function') {
                this._idleId = requestIdleCallback(() => {
                    this._idleId = null;
                    this.saveBoardNow(scene);
                }, { timeout: 2000 });
            } else {
                this.saveBoardNow(scene);
            }
        }, Math.max(delayMs, 800));
    }

    exportJSONFile(scene) {
        const json = JSON.stringify(scene.toJSON());
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().slice(0, 10);
        const a = document.createElement('a');
        a.href = url;
        a.download = `matephis-board-${date}.mboard.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}
