// Navigation and sidebar management
export class NavigationManager {
    constructor() {
        // Bottom nav buttons
        this.navAddBtn = document.getElementById('nav-add-btn');
        this.navHistoryBtn = document.getElementById('nav-history-btn');
        this.navSnippetsBtn = document.getElementById('nav-snippets-btn');
        
        // History sidebar
        this.historyOverlay = document.getElementById('history-overlay');
        this.historySidebar = document.getElementById('history-sidebar');
        this.closeHistorySidebarBtn = document.getElementById('close-history-sidebar');
        
        // Snippet sidebar
        this.snippetOverlay = document.getElementById('snippet-overlay');
        this.snippetSidebar = document.getElementById('snippet-sidebar');
        this.closeSnippetSidebarBtn = document.getElementById('close-snippet-sidebar');
        this.manageSnippetsBtn = document.getElementById('manage-snippets-btn');
        
        // Settings sidebar
        this.settingsOverlay = document.getElementById('settings-overlay');
        this.settingsSidebar = document.getElementById('settings-sidebar');
        
        this.init();
    }

    init() {
        // Bottom navigation
        this.navHistoryBtn.addEventListener('click', () => {
            this.openHistorySidebar();
            this.setActiveNav('history');
        });
        
        this.navSnippetsBtn.addEventListener('click', () => {
            this.openSnippetSidebar();
            this.setActiveNav('snippets');
        });
        
        this.navAddBtn.addEventListener('click', () => {
            this.closeAllSidebars();
            this.setActiveNav('add');
        });
        
        // Sidebar close buttons
        this.historyOverlay.addEventListener('click', () => this.closeHistorySidebar());
        this.closeHistorySidebarBtn.addEventListener('click', () => this.closeHistorySidebar());
        
        this.snippetOverlay.addEventListener('click', () => this.closeSnippetSidebar());
        this.closeSnippetSidebarBtn.addEventListener('click', () => this.closeSnippetSidebar());
        
        // Manage snippets button
        this.manageSnippetsBtn.addEventListener('click', () => this.openSnippetSidebar());
    }

    openHistorySidebar() {
        // Close other sidebars
        this.closeSnippetSidebar();
        this.closeSettingsSidebar();
        
        // Show overlay first
        this.historyOverlay.style.display = 'block';
        
        // Add open class after a brief delay for smooth transition
        setTimeout(() => {
            this.historySidebar.classList.add('open');
        }, 10);
    }

    closeHistorySidebar() {
        // Remove open class first for transition
        this.historySidebar.classList.remove('open');
        
        // Hide overlay after transition completes
        setTimeout(() => {
            this.historyOverlay.style.display = 'none';
        }, 300);
        
        this.setActiveNav('add');
    }

    openSnippetSidebar() {
        // Close other sidebars
        this.closeHistorySidebar();
        this.closeSettingsSidebar();
        
        // Show overlay first
        this.snippetOverlay.style.display = 'block';
        
        // Add open class after a brief delay for smooth transition
        setTimeout(() => {
            this.snippetSidebar.classList.add('open');
        }, 10);
    }

    closeSnippetSidebar() {
        // Remove open class first for transition
        this.snippetSidebar.classList.remove('open');
        
        // Hide overlay after transition completes
        setTimeout(() => {
            this.snippetOverlay.style.display = 'none';
        }, 300);
        
        this.setActiveNav('add');
    }

    closeAllSidebars() {
        this.closeHistorySidebar();
        this.closeSnippetSidebar();
        this.closeSettingsSidebar();
    }

    closeSettingsSidebar() {
        if (this.settingsSidebar && this.settingsOverlay) {
            // Remove open class first for transition
            this.settingsSidebar.classList.remove('open');
            
            // Hide overlay after transition completes
            setTimeout(() => {
                this.settingsOverlay.style.display = 'none';
            }, 300);
        }
    }

    setActiveNav(section) {
        // Remove active class from all nav items
        this.navAddBtn.classList.remove('active');
        this.navHistoryBtn.classList.remove('active');
        this.navSnippetsBtn.classList.remove('active');
        
        // Add active class to selected nav item
        if (section === 'add') {
            this.navAddBtn.classList.add('active');
        } else if (section === 'history') {
            this.navHistoryBtn.classList.add('active');
        } else if (section === 'snippets') {
            this.navSnippetsBtn.classList.add('active');
        }
    }
}
