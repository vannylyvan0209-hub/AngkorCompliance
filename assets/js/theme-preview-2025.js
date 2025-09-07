/**
 * Angkor Compliance Platform - Theme Preview JavaScript 2025
 * Theme preview functionality for role switching
 */

class ThemePreviewManager {
    constructor() {
        this.preview = null;
        this.config = {
            enableAnimations: true,
            enableGlassmorphism: true,
            enableNeumorphism: false,
            enableDarkMode: true,
            enableResponsive: true,
            enableAccessibility: true,
            animationDuration: 300,
            previewDelay: 100
        };
        this.themes = [
            {
                id: 'worker',
                name: 'Worker Portal',
                description: 'Clean and simple interface for factory workers',
                icon: 'user',
                colors: ['#3B82F6', '#10B981', '#F59E0B'],
                preview: 'worker-preview'
            },
            {
                id: 'factory-admin',
                name: 'Factory Admin',
                description: 'Management interface for factory administrators',
                icon: 'building',
                colors: ['#8B5CF6', '#06B6D4', '#84CC16'],
                preview: 'factory-admin-preview'
            },
            {
                id: 'hr-staff',
                name: 'HR Staff',
                description: 'Human resources management interface',
                icon: 'users',
                colors: ['#EF4444', '#F97316', '#EAB308'],
                preview: 'hr-staff-preview'
            },
            {
                id: 'grievance-committee',
                name: 'Grievance Committee',
                description: 'Case management for grievance committee members',
                icon: 'scale',
                colors: ['#DC2626', '#EA580C', '#CA8A04'],
                preview: 'grievance-committee-preview'
            },
            {
                id: 'auditor',
                name: 'Auditor',
                description: 'Audit and compliance management interface',
                icon: 'search',
                colors: ['#7C3AED', '#0891B2', '#65A30D'],
                preview: 'auditor-preview'
            },
            {
                id: 'analytics',
                name: 'Analytics',
                description: 'Data analytics and reporting interface',
                icon: 'bar-chart',
                colors: ['#059669', '#0D9488', '#16A34A'],
                preview: 'analytics-preview'
            },
            {
                id: 'super-admin',
                name: 'Super Admin',
                description: 'System administration and configuration',
                icon: 'settings',
                colors: ['#BE185D', '#BE123C', '#9F1239'],
                preview: 'super-admin-preview'
            }
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createPreview();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        document.addEventListener('click', (e) => this.handleClick(e));
    }

    createPreview() {
        const preview = document.createElement('div');
        preview.className = 'theme-preview';
        preview.innerHTML = this.renderPreview();
        document.body.appendChild(preview);
        this.preview = preview;
    }

    renderPreview() {
        return `
            <div class="theme-preview-content">
                <div class="theme-preview-header">
                    <h2 class="theme-preview-title">Choose Your Theme</h2>
                    <button class="theme-preview-close" data-action="close">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="theme-preview-grid">
                    ${this.themes.map(theme => this.renderThemeItem(theme)).join('')}
                </div>
                <div class="theme-preview-actions">
                    <button class="theme-preview-button secondary" data-action="cancel">Cancel</button>
                    <button class="theme-preview-button" data-action="apply">Apply Theme</button>
                </div>
            </div>
        `;
    }

    renderThemeItem(theme) {
        return `
            <div class="theme-preview-item" data-theme="${theme.id}">
                <div class="theme-preview-item-header">
                    <i class="theme-preview-item-icon" data-lucide="${theme.icon}"></i>
                    <h3 class="theme-preview-item-title">${theme.name}</h3>
                </div>
                <p class="theme-preview-item-description">${theme.description}</p>
                <div class="theme-preview-item-preview" data-preview="${theme.preview}"></div>
            </div>
        `;
    }

    show() {
        if (!this.preview) return;
        
        this.preview.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        this.triggerEvent('theme-preview:show');
    }

    hide() {
        if (!this.preview) return;
        
        this.preview.classList.remove('active');
        document.body.style.overflow = '';
        
        this.triggerEvent('theme-preview:hide');
    }

    selectTheme(themeId) {
        const theme = this.themes.find(t => t.id === themeId);
        if (!theme) return;
        
        // Remove active class from all items
        const items = this.preview.querySelectorAll('.theme-preview-item');
        items.forEach(item => item.classList.remove('active'));
        
        // Add active class to selected item
        const selectedItem = this.preview.querySelector(`[data-theme="${themeId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        this.triggerEvent('theme-preview:select', { theme });
    }

    applyTheme() {
        const activeItem = this.preview.querySelector('.theme-preview-item.active');
        if (!activeItem) return;
        
        const themeId = activeItem.getAttribute('data-theme');
        const theme = this.themes.find(t => t.id === themeId);
        if (!theme) return;
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', themeId);
        document.body.className = `role-theme ${themeId}`;
        
        // Update role switching if available
        if (window.roleSwitchingManager) {
            window.roleSwitchingManager.switchRole(themeId);
        }
        
        this.hide();
        this.triggerEvent('theme-preview:apply', { theme });
    }

    handleKeyboard(e) {
        if (!this.preview || !this.preview.classList.contains('active')) return;
        
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this.hide();
                break;
            case 'Enter':
                e.preventDefault();
                this.applyTheme();
                break;
        }
    }

    handleClick(e) {
        if (!this.preview || !this.preview.classList.contains('active')) return;
        
        const action = e.target.getAttribute('data-action');
        if (action) {
            e.preventDefault();
            this.handleAction(action);
            return;
        }
        
        const themeItem = e.target.closest('.theme-preview-item');
        if (themeItem) {
            const themeId = themeItem.getAttribute('data-theme');
            this.selectTheme(themeId);
            return;
        }
        
        // Close on overlay click
        if (e.target === this.preview) {
            this.hide();
        }
    }

    handleAction(action) {
        switch (action) {
            case 'close':
            case 'cancel':
                this.hide();
                break;
            case 'apply':
                this.applyTheme();
                break;
        }
    }

    // Public Methods
    open() {
        this.show();
    }

    close() {
        this.hide();
    }

    getThemes() {
        return [...this.themes];
    }

    getCurrentTheme() {
        const activeItem = this.preview?.querySelector('.theme-preview-item.active');
        if (!activeItem) return null;
        
        const themeId = activeItem.getAttribute('data-theme');
        return this.themes.find(t => t.id === themeId);
    }

    // Utility Methods
    triggerEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    // Configuration
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    getConfig() {
        return { ...this.config };
    }

    // Cleanup
    destroy() {
        if (this.preview) {
            this.preview.remove();
            this.preview = null;
        }
    }
}

// Initialize theme preview manager
document.addEventListener('DOMContentLoaded', () => {
    window.themePreviewManager = new ThemePreviewManager();
});

// Global access
window.ThemePreviewManager = ThemePreviewManager;
