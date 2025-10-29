// Settings modal management
import { CONFIG } from '../config.js';
import { getSettings, saveSettings } from '../utils/storage.js';
import { getModelsForProvider } from '../utils/api.js';

export class SettingsManager {
    constructor() {
        this.modal = document.getElementById('settings-modal');
        this.form = document.getElementById('settings-form');
        this.providerSelect = document.getElementById('ai-provider');
        this.apiKeyInput = document.getElementById('api-key-input');
        this.modelSelect = document.getElementById('model-select');
        this.providerLabel = document.getElementById('provider-label');
        this.apiKeyHelpText = document.getElementById('api-key-help-text');
        this.modelCount = document.getElementById('model-count');
        this.statusMessage = document.getElementById('settings-status-message');
        this.toggleVisibilityBtn = document.getElementById('toggle-api-key-visibility');
        this.saveBtn = document.getElementById('settings-save-btn');
        this.saveBtnText = document.getElementById('settings-save-text');
        this.saveBtnLoader = document.getElementById('settings-save-loader');
        
        this.currentSettings = getSettings();
        
        this.init();
    }

    init() {
        // Event listeners
        document.getElementById('settings-btn').addEventListener('click', () => this.open());
        document.getElementById('settings-modal-close').addEventListener('click', () => this.close());
        document.getElementById('settings-cancel-btn').addEventListener('click', () => this.close());
        this.toggleVisibilityBtn.addEventListener('click', () => this.toggleApiKeyVisibility());
        this.providerSelect.addEventListener('change', () => this.handleProviderChange());
        this.apiKeyInput.addEventListener('input', () => this.handleApiKeyInput());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Keyboard shortcut: Ctrl+,
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === ',') {
                e.preventDefault();
                this.open();
            }
        });
        
        // Load initial settings
        this.loadCurrentSettings();
    }

    open() {
        this.loadCurrentSettings();
        this.modal.style.display = 'flex';
    }

    close() {
        this.modal.style.display = 'none';
        this.clearStatusMessage();
    }

    loadCurrentSettings() {
        this.currentSettings = getSettings();
        this.providerSelect.value = this.currentSettings.provider;
        this.apiKeyInput.value = this.currentSettings.apiKey || '';
        
        this.updateProviderUI();
        
        if (this.currentSettings.apiKey) {
            this.loadModels();
        }
    }

    updateProviderUI() {
        const provider = this.providerSelect.value;
        const providerConfig = CONFIG.PROVIDERS[provider];
        
        this.providerLabel.textContent = providerConfig.apiKeyLabel;
        this.apiKeyHelpText.textContent = providerConfig.apiKeyHelp;
    }

    async handleProviderChange() {
        this.updateProviderUI();
        this.modelSelect.innerHTML = '<option value="">Enter API key to load models...</option>';
        this.modelSelect.disabled = true;
        this.modelCount.textContent = '';
        
        if (this.apiKeyInput.value.trim()) {
            await this.loadModels();
        }
    }

    async handleApiKeyInput() {
        const apiKey = this.apiKeyInput.value.trim();
        
        if (apiKey.length > 10) {
            await this.loadModels();
        } else {
            this.modelSelect.innerHTML = '<option value="">Enter API key to load models...</option>';
            this.modelSelect.disabled = true;
            this.modelCount.textContent = '';
        }
    }

    async loadModels() {
        const provider = this.providerSelect.value;
        const apiKey = this.apiKeyInput.value.trim();
        
        if (!apiKey) {
            return;
        }
        
        try {
            this.showStatusMessage('Loading models...', 'info');
            
            const models = await getModelsForProvider(provider, apiKey);
            
            this.modelSelect.innerHTML = '';
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name;
                this.modelSelect.appendChild(option);
            });
            
            // Select current model or first available
            if (this.currentSettings.model) {
                this.modelSelect.value = this.currentSettings.model;
            }
            
            this.modelSelect.disabled = false;
            this.modelCount.textContent = `(${models.length} available)`;
            this.showStatusMessage(`Loaded ${models.length} models successfully!`, 'success');
            
        } catch (error) {
            console.error('Error loading models:', error);
            this.showStatusMessage(`Error loading models: ${error.message}`, 'error');
            this.modelSelect.innerHTML = '<option value="">Failed to load models</option>';
            this.modelSelect.disabled = true;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const provider = this.providerSelect.value;
        const apiKey = this.apiKeyInput.value.trim();
        const model = this.modelSelect.value;
        
        if (!apiKey) {
            this.showStatusMessage('Please enter an API key', 'error');
            return;
        }
        
        if (!model) {
            this.showStatusMessage('Please select a model', 'error');
            return;
        }
        
        this.setLoading(true);
        
        try {
            const newSettings = {
                provider,
                apiKey,
                model
            };
            
            saveSettings(newSettings);
            this.currentSettings = newSettings;
            
            this.showStatusMessage('Settings saved successfully!', 'success');
            
            setTimeout(() => {
                this.close();
            }, 1000);
            
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatusMessage('Error saving settings', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    toggleApiKeyVisibility() {
        const type = this.apiKeyInput.type;
        this.apiKeyInput.type = type === 'password' ? 'text' : 'password';
        
        const eyeIcon = document.getElementById('eye-icon');
        if (type === 'password') {
            eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
        } else {
            eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        }
    }

    showStatusMessage(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = 'mb-4 p-3 rounded-lg text-sm';
        
        if (type === 'success') {
            this.statusMessage.classList.add('bg-green-50', 'border', 'border-green-200', 'text-green-800');
        } else if (type === 'error') {
            this.statusMessage.classList.add('bg-red-50', 'border', 'border-red-200', 'text-red-800');
        } else {
            this.statusMessage.classList.add('bg-blue-50', 'border', 'border-blue-200', 'text-blue-800');
        }
        
        this.statusMessage.classList.remove('hidden');
    }

    clearStatusMessage() {
        this.statusMessage.classList.add('hidden');
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.saveBtn.disabled = true;
            this.saveBtnText.classList.add('hidden');
            this.saveBtnLoader.classList.remove('hidden');
        } else {
            this.saveBtn.disabled = false;
            this.saveBtnText.classList.remove('hidden');
            this.saveBtnLoader.classList.add('hidden');
        }
    }
}
