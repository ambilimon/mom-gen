// LocalStorage utility functions
import { CONFIG } from '../config.js';

/**
 * Get data from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed data or default value
 */
export function getStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage (${key}):`, error);
        return defaultValue;
    }
}

/**
 * Set data in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing to localStorage (${key}):`, error);
        return false;
    }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 */
export function removeStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage (${key}):`, error);
        return false;
    }
}

/**
 * Clear all app data from localStorage
 */
export function clearAllStorage() {
    try {
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
}

// Specific storage functions for app data

export function getContacts() {
    return getStorage(CONFIG.STORAGE_KEYS.CONTACTS, {});
}

export function saveContacts(contacts) {
    return setStorage(CONFIG.STORAGE_KEYS.CONTACTS, contacts);
}

export function getSnippets() {
    return getStorage(CONFIG.STORAGE_KEYS.SNIPPETS, []);
}

export function saveSnippets(snippets) {
    return setStorage(CONFIG.STORAGE_KEYS.SNIPPETS, snippets);
}

export function getMeetingHistory() {
    return getStorage(CONFIG.STORAGE_KEYS.HISTORY, []);
}

export function saveMeetingHistory(history) {
    return setStorage(CONFIG.STORAGE_KEYS.HISTORY, history);
}

export function getSettings() {
    return getStorage(CONFIG.STORAGE_KEYS.SETTINGS, CONFIG.DEFAULT_SETTINGS);
}

export function saveSettings(settings) {
    return setStorage(CONFIG.STORAGE_KEYS.SETTINGS, settings);
}
