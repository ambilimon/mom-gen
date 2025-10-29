// Main application entry point
import { SettingsManager } from './features/settings.js';
import { ContactManager } from './features/contacts.js';
import { SnippetManager } from './features/snippets.js';
import { CameraManager } from './features/camera.js';
import { HistoryManager } from './features/history.js';
import { NavigationManager } from './features/navigation.js';
import { FormManager } from './features/form.js';

class MOMGeneratorApp {
    constructor() {
        this.settingsManager = null;
        this.contactManager = null;
        this.snippetManager = null;
        this.cameraManager = null;
        this.historyManager = null;
        this.navigationManager = null;
        this.formManager = null;
    }

    init() {
        // Initialize all managers in the correct order
        // Some managers depend on others, so order matters
        
        this.settingsManager = new SettingsManager();
        this.contactManager = new ContactManager();
        this.snippetManager = new SnippetManager();
        this.cameraManager = new CameraManager();
        this.historyManager = new HistoryManager(this.contactManager);
        this.navigationManager = new NavigationManager();
        this.formManager = new FormManager(
            this.contactManager,
            this.snippetManager,
            this.cameraManager,
            this.historyManager
        );

        console.log('MOM Generator App initialized successfully!');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new MOMGeneratorApp();
    app.init();
});
