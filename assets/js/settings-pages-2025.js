/**
 * Angkor Compliance Platform - Settings Pages JavaScript 2025
 * 
 * Modern settings pages with 2025 design patterns,
 * accessibility support, and responsive design.
 */

class SettingsPagesManager {
    constructor() {
        this.settingsPages = new Map();
        this.config = {
            enableKeyboardNavigation: true,
            enableTouchNavigation: true,
            enableAccessibility: true,
            enableAnimations: true,
            enableAutoSave: true,
            enableValidation: true,
            enableAutoHide: false,
            autoHideDelay: 3000,
            animationDuration: 300,
            animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            enableSmoothScrolling: true,
            enableFocusManagement: true,
            enableRoleManagement: true,
            enableUserMenu: true,
            enableSearch: false,
            enableNotifications: true,
            enableThemeToggle: true,
            enableGlassmorphism: true,
            enableNeumorphism: false,
            enableElevated: false,
            enableFlat: false,
            enableCompact: false,
            enableLarge: false,
            enablePrimary: false,
            enableSecondary: false,
            enableSuccess: false,
            enableWarning: false,
            enableDanger: false,
            enableInfo: false
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSettingsPages();
        this.setupAccessibility();
        this.setupResponsive();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        document.addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.addEventListener('change', (e) => this.handleFormChange(e));
    }

    initializeSettingsPages() {
        const settingsPageElements = document.querySelectorAll('.settings-page');
        settingsPageElements.forEach((element, index) => {
            const id = element.id || `settings-page-${index}`;
            this.createSettingsPage(id, element);
        });
    }

    setupAccessibility() {
        this.settingsPages.forEach((settingsPage, id) => {
            const { element } = settingsPage;
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'main');
            }
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'Settings page');
            }
        });
    }

    setupResponsive() {
        const updateResponsiveClasses = () => {
            this.settingsPages.forEach((settingsPage) => {
                const { element } = settingsPage;
                if (window.innerWidth < 768) {
                    element.classList.add('settings-page-mobile');
                } else {
                    element.classList.remove('settings-page-mobile');
                }
            });
        };
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    // Public Methods
    createSettingsPage(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        this.settingsPages.set(id, {
            id,
            element,
            config,
            isLoaded: false,
            isAnimating: false,
            isDirty: false,
            isSaving: false,
            sections: [],
            forms: [],
            error: null
        });
        
        this.applyConfiguration(this.settingsPages.get(id));
        return this.settingsPages.get(id);
    }

    addSettingsSection(id, section) {
        const settingsPage = this.settingsPages.get(id);
        if (!settingsPage) {
            console.error(`Settings page with id "${id}" not found`);
            return;
        }
        
        const { config } = settingsPage;
        
        settingsPage.sections.push(section);
        this.renderSettingsPage(settingsPage);
        
        this.triggerEvent(settingsPage.element, 'settingspage:section:add', { 
            settingsPage: config, 
            section 
        });
        
        return this;
    }

    removeSettingsSection(id, sectionId) {
        const settingsPage = this.settingsPages.get(id);
        if (!settingsPage) {
            console.error(`Settings page with id "${id}" not found`);
            return;
        }
        
        const { config } = settingsPage;
        
        settingsPage.sections = settingsPage.sections.filter(section => section.id !== sectionId);
        this.renderSettingsPage(settingsPage);
        
        this.triggerEvent(settingsPage.element, 'settingspage:section:remove', { 
            settingsPage: config, 
            sectionId 
        });
        
        return this;
    }

    updateSettingsSection(id, sectionId, updates) {
        const settingsPage = this.settingsPages.get(id);
        if (!settingsPage) {
            console.error(`Settings page with id "${id}" not found`);
            return;
        }
        
        const { config } = settingsPage;
        
        const sectionIndex = settingsPage.sections.findIndex(section => section.id === sectionId);
        if (sectionIndex !== -1) {
            settingsPage.sections[sectionIndex] = { ...settingsPage.sections[sectionIndex], ...updates };
            this.renderSettingsPage(settingsPage);
        }
        
        this.triggerEvent(settingsPage.element, 'settingspage:section:update', { 
            settingsPage: config, 
            sectionId, 
            updates 
        });
        
        return this;
    }

    addSettingsForm(id, form) {
        const settingsPage = this.settingsPages.get(id);
        if (!settingsPage) {
            console.error(`Settings page with id "${id}" not found`);
            return;
        }
        
        const { config } = settingsPage;
        
        settingsPage.forms.push(form);
        this.renderSettingsPage(settingsPage);
        
        this.triggerEvent(settingsPage.element, 'settingspage:form:add', { 
            settingsPage: config, 
            form 
        });
        
        return this;
    }

    removeSettingsForm(id, formId) {
        const settingsPage = this.settingsPages.get(id);
        if (!settingsPage) {
            console.error(`Settings page with id "${id}" not found`);
            return;
        }
        
        const { config } = settingsPage;
        
        settingsPage.forms = settingsPage.forms.filter(form => form.id !== formId);
        this.renderSettingsPage(settingsPage);
        
        this.triggerEvent(settingsPage.element, 'settingspage:form:remove', { 
            settingsPage: config, 
            formId 
        });
        
        return this;
    }

    updateSettingsForm(id, formId, updates) {
        const settingsPage = this.settingsPages.get(id);
        if (!settingsPage) {
            console.error(`Settings page with id "${id}" not found`);
            return;
        }
        
        const { config } = settingsPage;
        
        const formIndex = settingsPage.forms.findIndex(form => form.id === formId);
        if (formIndex !== -1) {
            settingsPage.forms[formIndex] = { ...settingsPage.forms[formIndex], ...updates };
            this.renderSettingsPage(settingsPage);
        }
        
        this.triggerEvent(settingsPage.element, 'settingspage:form:update', { 
            settingsPage: config, 
            formId, 
            updates 
        });
        
        return this;
    }

    saveSettingsPage(id) {
        const settingsPage = this.settingsPages.get(id);
        if (!settingsPage) {
            console.error(`Settings page with id "${id}" not found`);
            return;
        }
        
        const { config } = settingsPage;
        
        if (settingsPage.isSaving) {
            return;
        }
        
        settingsPage.isSaving = true;
        this.updateSettingsPage(settingsPage);
        
        // Simulate save operation
        setTimeout(() => {
            settingsPage.isSaving = false;
            settingsPage.isDirty = false;
            this.updateSettingsPage(settingsPage);
            
            this.triggerEvent(settingsPage.element, 'settingspage:save', { 
                settingsPage: config 
            });
        }, 1000);
        
        return this;
    }

    resetSettingsPage(id) {
        const settingsPage = this.settingsPages.get(id);
        if (!settingsPage) {
            console.error(`Settings page with id "${id}" not found`);
            return;
        }
        
        const { config } = settingsPage;
        
        settingsPage.isDirty = false;
        this.updateSettingsPage(settingsPage);
        
        this.triggerEvent(settingsPage.element, 'settingspage:reset', { 
            settingsPage: config 
        });
        
        return this;
    }

    // Private Methods
    applyConfiguration(settingsPage) {
        const { element, config } = settingsPage;
        
        if (config.enableKeyboardNavigation) element.classList.add('settings-page-keyboard-enabled');
        if (config.enableTouchNavigation) element.classList.add('settings-page-touch-enabled');
        if (config.enableAccessibility) element.classList.add('settings-page-accessibility-enabled');
        if (config.enableAnimations) element.classList.add('settings-page-animations-enabled');
        if (config.enableAutoSave) element.classList.add('settings-page-autosave-enabled');
        if (config.enableValidation) element.classList.add('settings-page-validation-enabled');
        if (config.enableAutoHide) element.classList.add('settings-page-autohide-enabled');
        if (config.enableSmoothScrolling) element.classList.add('settings-page-smooth-scroll-enabled');
        if (config.enableFocusManagement) element.classList.add('settings-page-focus-enabled');
        if (config.enableRoleManagement) element.classList.add('settings-page-role-enabled');
        if (config.enableUserMenu) element.classList.add('settings-page-user-menu-enabled');
        if (config.enableSearch) element.classList.add('settings-page-search-enabled');
        if (config.enableNotifications) element.classList.add('settings-page-notifications-enabled');
        if (config.enableThemeToggle) element.classList.add('settings-page-theme-enabled');
        if (config.enableGlassmorphism) element.classList.add('settings-page-glass');
        if (config.enableNeumorphism) element.classList.add('settings-page-neumorphism');
        if (config.enableElevated) element.classList.add('settings-page-elevated');
        if (config.enableFlat) element.classList.add('settings-page-flat');
        if (config.enableCompact) element.classList.add('settings-page-compact');
        if (config.enableLarge) element.classList.add('settings-page-large');
        if (config.enablePrimary) element.classList.add('settings-page-primary');
        if (config.enableSecondary) element.classList.add('settings-page-secondary');
        if (config.enableSuccess) element.classList.add('settings-page-success');
        if (config.enableWarning) element.classList.add('settings-page-warning');
        if (config.enableDanger) element.classList.add('settings-page-danger');
        if (config.enableInfo) element.classList.add('settings-page-info');
        
        this.addEventListeners(settingsPage);
        this.renderSettingsPage(settingsPage);
    }

    addEventListeners(settingsPage) {
        const { element, config } = settingsPage;
        
        // Action button event listeners
        const actionButtons = element.querySelectorAll('.settings-page-action');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.getAttribute('data-action');
                this.handleAction(settingsPage, action);
            });
        });
        
        // Section action button event listeners
        const sectionActionButtons = element.querySelectorAll('.settings-page-section-action');
        sectionActionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.getAttribute('data-action');
                this.handleSectionAction(settingsPage, action);
            });
        });
        
        // Form action button event listeners
        const formActionButtons = element.querySelectorAll('.settings-page-form-action');
        formActionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.getAttribute('data-action');
                this.handleFormAction(settingsPage, action);
            });
        });
        
        // Form button event listeners
        const formButtons = element.querySelectorAll('.settings-page-form-button');
        formButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.getAttribute('data-action');
                this.handleFormButton(settingsPage, action);
            });
        });
    }

    renderSettingsPage(settingsPage) {
        const { element, config, sections, forms } = settingsPage;
        
        this.updateSettingsPageHeader(settingsPage);
        this.updateSettingsPageSidebar(settingsPage);
        this.updateSettingsPageMain(settingsPage);
    }

    updateSettingsPageHeader(settingsPage) {
        const { element, config } = settingsPage;
        
        const header = element.querySelector('.settings-page-header');
        if (!header) return;
        
        const title = header.querySelector('.settings-page-title');
        const subtitle = header.querySelector('.settings-page-subtitle');
        const actions = header.querySelector('.settings-page-actions');
        
        if (title && config.title) {
            title.textContent = config.title;
        }
        
        if (subtitle && config.subtitle) {
            subtitle.textContent = config.subtitle;
        }
        
        if (actions && config.actions) {
            actions.innerHTML = config.actions.map(action => `
                <button class="settings-page-action" data-action="${action.action}">
                    <i data-lucide="${action.icon}"></i>
                </button>
            `).join('');
            
            // Add event listeners to action buttons
            const actionButtons = actions.querySelectorAll('.settings-page-action');
            actionButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const action = button.getAttribute('data-action');
                    this.handleAction(settingsPage, action);
                });
            });
        }
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    updateSettingsPageSidebar(settingsPage) {
        const { element, config, sections } = settingsPage;
        
        const sidebar = element.querySelector('.settings-page-sidebar');
        if (!sidebar) return;
        
        if (sections.length === 0) {
            sidebar.innerHTML = '<div class="settings-page-empty">No sections available</div>';
            return;
        }
        
        // Render sections
        sidebar.innerHTML = sections.map(section => this.renderSettingsSection(section)).join('');
        
        // Add event listeners to new sections
        const sectionElements = sidebar.querySelectorAll('.settings-page-section');
        sectionElements.forEach(section => {
            section.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = section.getAttribute('data-section-id');
                if (sectionId) {
                    this.handleSectionClick(settingsPage, sectionId);
                }
            });
        });
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    updateSettingsPageMain(settingsPage) {
        const { element, config, sections, forms } = settingsPage;
        
        const main = element.querySelector('.settings-page-main');
        if (!main) return;
        
        if (sections.length === 0 && forms.length === 0) {
            main.innerHTML = '<div class="settings-page-empty">No content available</div>';
            return;
        }
        
        // Render sections and forms
        const content = [
            ...sections.map(section => this.renderSettingsSectionContent(section)),
            ...forms.map(form => this.renderSettingsForm(form))
        ].join('');
        
        main.innerHTML = content;
        
        // Add event listeners to new content
        const sectionElements = main.querySelectorAll('.settings-page-section');
        sectionElements.forEach(section => {
            const sectionId = section.getAttribute('data-section-id');
            if (sectionId) {
                this.addSectionEventListeners(settingsPage, section, sectionId);
            }
        });
        
        const formElements = main.querySelectorAll('.settings-page-form');
        formElements.forEach(form => {
            const formId = form.getAttribute('data-form-id');
            if (formId) {
                this.addFormEventListeners(settingsPage, form, formId);
            }
        });
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    renderSettingsSection(section) {
        const active = section.active ? 'active' : '';
        const disabled = section.disabled ? 'disabled' : '';
        
        return `
            <div class="settings-page-section ${active} ${disabled}" 
                 data-section-id="${section.id}">
                <div class="settings-page-section-header">
                    <div class="settings-page-section-content">
                        <div class="settings-page-section-title">${section.title}</div>
                        ${section.subtitle ? `<div class="settings-page-section-subtitle">${section.subtitle}</div>` : ''}
                    </div>
                    <i class="settings-page-section-icon" data-lucide="${section.icon}"></i>
                </div>
            </div>
        `;
    }

    renderSettingsSectionContent(section) {
        const active = section.active ? 'active' : '';
        const disabled = section.disabled ? 'disabled' : '';
        
        return `
            <div class="settings-page-section ${active} ${disabled}" 
                 data-section-id="${section.id}">
                <div class="settings-page-section-header">
                    <div class="settings-page-section-content">
                        <div class="settings-page-section-title">${section.title}</div>
                        ${section.subtitle ? `<div class="settings-page-section-subtitle">${section.subtitle}</div>` : ''}
                    </div>
                    <div class="settings-page-section-actions">
                        ${section.actions ? section.actions.map(action => `
                            <button class="settings-page-section-action" data-action="${action.action}">
                                <i data-lucide="${action.icon}"></i>
                            </button>
                        `).join('') : ''}
                    </div>
                </div>
                <div class="settings-page-section-content">
                    ${section.content}
                </div>
            </div>
        `;
    }

    renderSettingsForm(form) {
        const active = form.active ? 'active' : '';
        const disabled = form.disabled ? 'disabled' : '';
        
        return `
            <div class="settings-page-form ${active} ${disabled}" 
                 data-form-id="${form.id}">
                <div class="settings-page-form-header">
                    <div class="settings-page-form-content">
                        <div class="settings-page-form-title">${form.title}</div>
                        ${form.subtitle ? `<div class="settings-page-form-subtitle">${form.subtitle}</div>` : ''}
                    </div>
                    <div class="settings-page-form-actions">
                        ${form.actions ? form.actions.map(action => `
                            <button class="settings-page-form-action" data-action="${action.action}">
                                <i data-lucide="${action.icon}"></i>
                            </button>
                        `).join('') : ''}
                    </div>
                </div>
                <div class="settings-page-form-content">
                    ${form.content}
                </div>
            </div>
        `;
    }

    addSectionEventListeners(settingsPage, section, sectionId) {
        const { config } = settingsPage;
        
        // Add any section-specific event listeners here
        // This is where you would add event listeners for section content
    }

    addFormEventListeners(settingsPage, form, formId) {
        const { config } = settingsPage;
        
        // Add any form-specific event listeners here
        // This is where you would add event listeners for form content
    }

    updateSettingsPage(settingsPage) {
        const { element, config, isDirty, isSaving } = settingsPage;
        
        // Update dirty state
        if (isDirty) {
            element.classList.add('settings-page-dirty');
        } else {
            element.classList.remove('settings-page-dirty');
        }
        
        // Update saving state
        if (isSaving) {
            element.classList.add('settings-page-saving');
        } else {
            element.classList.remove('settings-page-saving');
        }
    }

    handleAction(settingsPage, action) {
        const { config } = settingsPage;
        
        switch (action) {
            case 'save':
                this.saveSettingsPage(settingsPage.id);
                break;
            case 'reset':
                this.resetSettingsPage(settingsPage.id);
                break;
            case 'refresh':
                this.refreshSettingsPage(settingsPage);
                break;
            case 'custom':
                if (config.customAction) {
                    config.customAction(settingsPage);
                }
                break;
            default:
                console.log(`Unknown action: ${action}`);
        }
    }

    handleSectionAction(settingsPage, action) {
        const { config } = settingsPage;
        
        switch (action) {
            case 'edit':
                this.editSection(settingsPage);
                break;
            case 'delete':
                this.deleteSection(settingsPage);
                break;
            case 'custom':
                if (config.customSectionAction) {
                    config.customSectionAction(settingsPage);
                }
                break;
            default:
                console.log(`Unknown section action: ${action}`);
        }
    }

    handleFormAction(settingsPage, action) {
        const { config } = settingsPage;
        
        switch (action) {
            case 'edit':
                this.editForm(settingsPage);
                break;
            case 'delete':
                this.deleteForm(settingsPage);
                break;
            case 'custom':
                if (config.customFormAction) {
                    config.customFormAction(settingsPage);
                }
                break;
            default:
                console.log(`Unknown form action: ${action}`);
        }
    }

    handleFormButton(settingsPage, action) {
        const { config } = settingsPage;
        
        switch (action) {
            case 'save':
                this.saveSettingsPage(settingsPage.id);
                break;
            case 'reset':
                this.resetSettingsPage(settingsPage.id);
                break;
            case 'cancel':
                this.cancelForm(settingsPage);
                break;
            case 'custom':
                if (config.customFormButtonAction) {
                    config.customFormButtonAction(settingsPage);
                }
                break;
            default:
                console.log(`Unknown form button action: ${action}`);
        }
    }

    handleSectionClick(settingsPage, sectionId) {
        const { config } = settingsPage;
        
        // Toggle section active state
        const section = settingsPage.sections.find(s => s.id === sectionId);
        if (section) {
            section.active = !section.active;
            this.renderSettingsPage(settingsPage);
        }
        
        this.triggerEvent(settingsPage.element, 'settingspage:section:click', { 
            settingsPage: config, 
            sectionId 
        });
    }

    handleFormSubmit(e) {
        const form = e.target;
        const settingsPage = this.findSettingsPageByElement(form);
        
        if (settingsPage) {
            e.preventDefault();
            this.saveSettingsPage(settingsPage.id);
        }
    }

    handleFormChange(e) {
        const input = e.target;
        const settingsPage = this.findSettingsPageByElement(input);
        
        if (settingsPage) {
            settingsPage.isDirty = true;
            this.updateSettingsPage(settingsPage);
        }
    }

    findSettingsPageByElement(element) {
        for (const [id, settingsPage] of this.settingsPages) {
            if (settingsPage.element.contains(element)) {
                return settingsPage;
            }
        }
        return null;
    }

    editSection(settingsPage) {
        const { config } = settingsPage;
        
        this.triggerEvent(settingsPage.element, 'settingspage:section:edit', { 
            settingsPage: config 
        });
    }

    deleteSection(settingsPage) {
        const { config } = settingsPage;
        
        this.triggerEvent(settingsPage.element, 'settingspage:section:delete', { 
            settingsPage: config 
        });
    }

    editForm(settingsPage) {
        const { config } = settingsPage;
        
        this.triggerEvent(settingsPage.element, 'settingspage:form:edit', { 
            settingsPage: config 
        });
    }

    deleteForm(settingsPage) {
        const { config } = settingsPage;
        
        this.triggerEvent(settingsPage.element, 'settingspage:form:delete', { 
            settingsPage: config 
        });
    }

    cancelForm(settingsPage) {
        const { config } = settingsPage;
        
        this.resetSettingsPage(settingsPage.id);
        
        this.triggerEvent(settingsPage.element, 'settingspage:form:cancel', { 
            settingsPage: config 
        });
    }

    refreshSettingsPage(settingsPage) {
        const { config } = settingsPage;
        
        this.renderSettingsPage(settingsPage);
    }

    // Event Handlers
    handleResize() {
        this.settingsPages.forEach((settingsPage) => {
            const { config } = settingsPage;
            
            if (window.innerWidth < 768) {
                settingsPage.element.classList.add('settings-page-mobile');
            } else {
                settingsPage.element.classList.remove('settings-page-mobile');
            }
        });
    }

    handleKeyboardNavigation(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveFirstSettingsPage();
                    break;
            }
        }
    }

    saveFirstSettingsPage() {
        const firstSettingsPage = this.settingsPages.values().next().value;
        if (firstSettingsPage) {
            this.saveSettingsPage(firstSettingsPage.id);
        }
    }

    // Utility Methods
    triggerEvent(element, eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
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
        this.settingsPages.forEach((settingsPage, id) => {
            this.destroySettingsPage(id);
        });
        this.settingsPages.clear();
    }

    destroySettingsPage(id) {
        const settingsPage = this.settingsPages.get(id);
        if (!settingsPage) return;
        
        const { element } = settingsPage;
        element.removeEventListener('click', this.handleAction);
        
        this.settingsPages.delete(id);
        return this;
    }
}

// Initialize settings pages manager
document.addEventListener('DOMContentLoaded', () => {
    window.settingsPagesManager = new SettingsPagesManager();
});

// Global access
window.SettingsPagesManager = SettingsPagesManager;
