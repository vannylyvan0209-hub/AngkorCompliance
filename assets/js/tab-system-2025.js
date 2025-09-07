/**
 * Angkor Compliance Platform - Tab System JavaScript 2025
 * 
 * Modern tab navigation system with 2025 design patterns,
 * accessibility support, and responsive design.
 */

class TabSystemManager {
    constructor() {
        this.tabSystems = new Map();
        this.config = {
            enableKeyboardNavigation: true,
            enableTouchNavigation: true,
            enableAccessibility: true,
            enableAnimations: true,
            enableClosableTabs: true,
            enableDraggableTabs: false,
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
            enableHorizontal: true,
            enableVertical: false,
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
        this.initializeTabSystems();
        this.setupAccessibility();
        this.setupResponsive();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    initializeTabSystems() {
        const tabSystemElements = document.querySelectorAll('.tab-system');
        tabSystemElements.forEach((element, index) => {
            const id = element.id || `tab-system-${index}`;
            this.createTabSystem(id, element);
        });
    }

    setupAccessibility() {
        this.tabSystems.forEach((tabSystem, id) => {
            const { element } = tabSystem;
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'tablist');
            }
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'Tab navigation');
            }
        });
    }

    setupResponsive() {
        const updateResponsiveClasses = () => {
            this.tabSystems.forEach((tabSystem) => {
                const { element } = tabSystem;
                if (window.innerWidth < 768) {
                    element.classList.add('tab-system-mobile');
                } else {
                    element.classList.remove('tab-system-mobile');
                }
            });
        };
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    // Public Methods
    createTabSystem(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        this.tabSystems.set(id, {
            id,
            element,
            config,
            isLoaded: false,
            isAnimating: false,
            currentTab: null,
            tabs: [],
            panels: [],
            error: null
        });
        
        this.applyConfiguration(this.tabSystems.get(id));
        return this.tabSystems.get(id);
    }

    addTab(id, tab) {
        const tabSystem = this.tabSystems.get(id);
        if (!tabSystem) {
            console.error(`Tab system with id "${id}" not found`);
            return;
        }
        
        const { config } = tabSystem;
        
        tabSystem.tabs.push(tab);
        this.renderTabSystem(tabSystem);
        
        this.triggerEvent(tabSystem.element, 'tabsystem:tab:add', { 
            tabSystem: config, 
            tab 
        });
        
        return this;
    }

    removeTab(id, tabId) {
        const tabSystem = this.tabSystems.get(id);
        if (!tabSystem) {
            console.error(`Tab system with id "${id}" not found`);
            return;
        }
        
        const { config } = tabSystem;
        
        tabSystem.tabs = tabSystem.tabs.filter(tab => tab.id !== tabId);
        tabSystem.panels = tabSystem.panels.filter(panel => panel.id !== tabId);
        
        // If removed tab was active, activate first available tab
        if (tabSystem.currentTab === tabId) {
            const firstTab = tabSystem.tabs[0];
            if (firstTab) {
                this.activateTab(id, firstTab.id);
            } else {
                tabSystem.currentTab = null;
            }
        }
        
        this.renderTabSystem(tabSystem);
        
        this.triggerEvent(tabSystem.element, 'tabsystem:tab:remove', { 
            tabSystem: config, 
            tabId 
        });
        
        return this;
    }

    updateTab(id, tabId, updates) {
        const tabSystem = this.tabSystems.get(id);
        if (!tabSystem) {
            console.error(`Tab system with id "${id}" not found`);
            return;
        }
        
        const { config } = tabSystem;
        
        const tabIndex = tabSystem.tabs.findIndex(tab => tab.id === tabId);
        if (tabIndex !== -1) {
            tabSystem.tabs[tabIndex] = { ...tabSystem.tabs[tabIndex], ...updates };
            this.renderTabSystem(tabSystem);
        }
        
        this.triggerEvent(tabSystem.element, 'tabsystem:tab:update', { 
            tabSystem: config, 
            tabId, 
            updates 
        });
        
        return this;
    }

    activateTab(id, tabId) {
        const tabSystem = this.tabSystems.get(id);
        if (!tabSystem) {
            console.error(`Tab system with id "${id}" not found`);
            return;
        }
        
        const { config } = tabSystem;
        
        // Deactivate current tab
        if (tabSystem.currentTab) {
            this.deactivateTab(id, tabSystem.currentTab);
        }
        
        // Activate new tab
        const tab = tabSystem.tabs.find(tab => tab.id === tabId);
        if (tab) {
            tabSystem.currentTab = tabId;
            this.updateTabSystem(tabSystem);
        }
        
        this.triggerEvent(tabSystem.element, 'tabsystem:tab:activate', { 
            tabSystem: config, 
            tabId 
        });
        
        return this;
    }

    deactivateTab(id, tabId) {
        const tabSystem = this.tabSystems.get(id);
        if (!tabSystem) {
            console.error(`Tab system with id "${id}" not found`);
            return;
        }
        
        const { config } = tabSystem;
        
        if (tabSystem.currentTab === tabId) {
            tabSystem.currentTab = null;
            this.updateTabSystem(tabSystem);
        }
        
        this.triggerEvent(tabSystem.element, 'tabsystem:tab:deactivate', { 
            tabSystem: config, 
            tabId 
        });
        
        return this;
    }

    // Private Methods
    applyConfiguration(tabSystem) {
        const { element, config } = tabSystem;
        
        if (config.enableKeyboardNavigation) element.classList.add('tab-system-keyboard-enabled');
        if (config.enableTouchNavigation) element.classList.add('tab-system-touch-enabled');
        if (config.enableAccessibility) element.classList.add('tab-system-accessibility-enabled');
        if (config.enableAnimations) element.classList.add('tab-system-animations-enabled');
        if (config.enableClosableTabs) element.classList.add('tab-system-closable-enabled');
        if (config.enableDraggableTabs) element.classList.add('tab-system-draggable-enabled');
        if (config.enableAutoHide) element.classList.add('tab-system-autohide-enabled');
        if (config.enableSmoothScrolling) element.classList.add('tab-system-smooth-scroll-enabled');
        if (config.enableFocusManagement) element.classList.add('tab-system-focus-enabled');
        if (config.enableRoleManagement) element.classList.add('tab-system-role-enabled');
        if (config.enableUserMenu) element.classList.add('tab-system-user-menu-enabled');
        if (config.enableSearch) element.classList.add('tab-system-search-enabled');
        if (config.enableNotifications) element.classList.add('tab-system-notifications-enabled');
        if (config.enableThemeToggle) element.classList.add('tab-system-theme-enabled');
        if (config.enableGlassmorphism) element.classList.add('tab-system-glass');
        if (config.enableNeumorphism) element.classList.add('tab-system-neumorphism');
        if (config.enableElevated) element.classList.add('tab-system-elevated');
        if (config.enableFlat) element.classList.add('tab-system-flat');
        if (config.enableCompact) element.classList.add('tab-system-compact');
        if (config.enableLarge) element.classList.add('tab-system-large');
        if (config.enableHorizontal) element.classList.add('tab-system-horizontal');
        if (config.enableVertical) element.classList.add('tab-system-vertical');
        if (config.enablePrimary) element.classList.add('tab-system-primary');
        if (config.enableSecondary) element.classList.add('tab-system-secondary');
        if (config.enableSuccess) element.classList.add('tab-system-success');
        if (config.enableWarning) element.classList.add('tab-system-warning');
        if (config.enableDanger) element.classList.add('tab-system-danger');
        if (config.enableInfo) element.classList.add('tab-system-info');
        
        this.addEventListeners(tabSystem);
        this.renderTabSystem(tabSystem);
    }

    addEventListeners(tabSystem) {
        const { element, config } = tabSystem;
        
        // Tab event listeners
        const tabs = element.querySelectorAll('.tab-system-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = tab.getAttribute('data-tab-id');
                if (tabId) {
                    this.activateTab(tabSystem.id, tabId);
                }
            });
        });
        
        // Close button event listeners
        const closeButtons = element.querySelectorAll('.tab-system-tab-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tabId = button.getAttribute('data-tab-id');
                if (tabId) {
                    this.removeTab(tabSystem.id, tabId);
                }
            });
        });
        
        // Action button event listeners
        const actionButtons = element.querySelectorAll('.tab-system-action');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.getAttribute('data-action');
                this.handleAction(tabSystem, action);
            });
        });
    }

    renderTabSystem(tabSystem) {
        const { element, config, tabs } = tabSystem;
        
        this.updateTabSystemHeader(tabSystem);
        this.updateTabSystemNavigation(tabSystem);
        this.updateTabSystemContent(tabSystem);
    }

    updateTabSystemHeader(tabSystem) {
        const { element, config } = tabSystem;
        
        const header = element.querySelector('.tab-system-header');
        if (!header) return;
        
        const title = header.querySelector('.tab-system-title');
        const subtitle = header.querySelector('.tab-system-subtitle');
        const actions = header.querySelector('.tab-system-actions');
        
        if (title && config.title) {
            title.textContent = config.title;
        }
        
        if (subtitle && config.subtitle) {
            subtitle.textContent = config.subtitle;
        }
        
        if (actions && config.actions) {
            actions.innerHTML = config.actions.map(action => `
                <button class="tab-system-action" data-action="${action.action}">
                    <i data-lucide="${action.icon}"></i>
                </button>
            `).join('');
            
            // Add event listeners to action buttons
            const actionButtons = actions.querySelectorAll('.tab-system-action');
            actionButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const action = button.getAttribute('data-action');
                    this.handleAction(tabSystem, action);
                });
            });
        }
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    updateTabSystemNavigation(tabSystem) {
        const { element, config, tabs } = tabSystem;
        
        const nav = element.querySelector('.tab-system-nav');
        if (!nav) return;
        
        if (tabs.length === 0) {
            nav.innerHTML = '<div class="tab-system-empty">No tabs available</div>';
            return;
        }
        
        // Render tabs
        const navScroll = nav.querySelector('.tab-system-nav-scroll');
        if (navScroll) {
            navScroll.innerHTML = tabs.map(tab => this.renderTab(tab)).join('');
        }
        
        // Add event listeners to new tabs
        const tabElements = nav.querySelectorAll('.tab-system-tab');
        tabElements.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = tab.getAttribute('data-tab-id');
                if (tabId) {
                    this.activateTab(tabSystem.id, tabId);
                }
            });
        });
        
        // Add event listeners to close buttons
        const closeButtons = nav.querySelectorAll('.tab-system-tab-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tabId = button.getAttribute('data-tab-id');
                if (tabId) {
                    this.removeTab(tabSystem.id, tabId);
                }
            });
        });
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    updateTabSystemContent(tabSystem) {
        const { element, config, tabs, panels } = tabSystem;
        
        const content = element.querySelector('.tab-system-content');
        if (!content) return;
        
        if (tabs.length === 0) {
            content.innerHTML = '<div class="tab-system-empty">No content available</div>';
            return;
        }
        
        // Render panels
        content.innerHTML = tabs.map(tab => {
            const panel = panels.find(p => p.id === tab.id);
            return this.renderTabPanel(tab, panel);
        }).join('');
        
        // Add event listeners to new panels
        const panelElements = content.querySelectorAll('.tab-system-panel');
        panelElements.forEach(panel => {
            const tabId = panel.getAttribute('data-tab-id');
            if (tabId) {
                this.addPanelEventListeners(tabSystem, panel, tabId);
            }
        });
    }

    renderTab(tab) {
        const badge = tab.badge ? `<span class="tab-system-tab-badge">${tab.badge}</span>` : '';
        const closeButton = tab.closable ? `<button class="tab-system-tab-close" data-tab-id="${tab.id}"><i data-lucide="x"></i></button>` : '';
        const disabled = tab.disabled ? 'disabled' : '';
        const active = tab.active ? 'active' : '';
        
        return `
            <div class="tab-system-tab ${active} ${disabled}" 
                 data-tab-id="${tab.id}" 
                 role="tab" 
                 aria-selected="${tab.active}" 
                 aria-controls="tab-panel-${tab.id}">
                <i class="tab-system-tab-icon" data-lucide="${tab.icon}"></i>
                <span class="tab-system-tab-text">${tab.text}</span>
                ${badge}
                ${closeButton}
            </div>
        `;
    }

    renderTabPanel(tab, panel) {
        const content = panel ? panel.content : '';
        const active = tab.active ? 'active' : '';
        
        return `
            <div class="tab-system-panel ${active}" 
                 data-tab-id="${tab.id}" 
                 role="tabpanel" 
                 aria-labelledby="tab-${tab.id}">
                ${content}
            </div>
        `;
    }

    addPanelEventListeners(tabSystem, panel, tabId) {
        const { config } = tabSystem;
        
        // Add any panel-specific event listeners here
        // This is where you would add event listeners for panel content
    }

    updateTabSystem(tabSystem) {
        const { element, config, tabs, currentTab } = tabSystem;
        
        // Update tab states
        const tabElements = element.querySelectorAll('.tab-system-tab');
        tabElements.forEach(tab => {
            const tabId = tab.getAttribute('data-tab-id');
            if (tabId === currentTab) {
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
            } else {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            }
        });
        
        // Update panel states
        const panelElements = element.querySelectorAll('.tab-system-panel');
        panelElements.forEach(panel => {
            const tabId = panel.getAttribute('data-tab-id');
            if (tabId === currentTab) {
                panel.classList.add('active');
                panel.setAttribute('aria-hidden', 'false');
            } else {
                panel.classList.remove('active');
                panel.setAttribute('aria-hidden', 'true');
            }
        });
    }

    handleAction(tabSystem, action) {
        const { config } = tabSystem;
        
        switch (action) {
            case 'add':
                this.addNewTab(tabSystem);
                break;
            case 'close':
                this.closeAllTabs(tabSystem);
                break;
            case 'refresh':
                this.refreshTabSystem(tabSystem);
                break;
            case 'custom':
                if (config.customAction) {
                    config.customAction(tabSystem);
                }
                break;
            default:
                console.log(`Unknown action: ${action}`);
        }
    }

    addNewTab(tabSystem) {
        const { config } = tabSystem;
        
        const newTab = {
            id: `tab-${Date.now()}`,
            text: 'New Tab',
            icon: 'file',
            content: '<p>New tab content</p>',
            closable: true,
            active: false
        };
        
        this.addTab(tabSystem.id, newTab);
        this.activateTab(tabSystem.id, newTab.id);
    }

    closeAllTabs(tabSystem) {
        const { config } = tabSystem;
        
        tabSystem.tabs.forEach(tab => {
            if (tab.closable) {
                this.removeTab(tabSystem.id, tab.id);
            }
        });
    }

    refreshTabSystem(tabSystem) {
        const { config } = tabSystem;
        
        this.renderTabSystem(tabSystem);
    }

    // Event Handlers
    handleResize() {
        this.tabSystems.forEach((tabSystem) => {
            const { config } = tabSystem;
            
            if (window.innerWidth < 768) {
                tabSystem.element.classList.add('tab-system-mobile');
            } else {
                tabSystem.element.classList.remove('tab-system-mobile');
            }
        });
    }

    handleKeyboardNavigation(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Tab':
                    e.preventDefault();
                    this.navigateTabs('next');
                    break;
            }
        }
    }

    navigateTabs(direction) {
        // Find active tab system
        const activeTabSystem = Array.from(this.tabSystems.values()).find(ts => 
            ts.element.contains(document.activeElement)
        );
        
        if (!activeTabSystem) return;
        
        const { element } = activeTabSystem;
        const tabs = element.querySelectorAll('.tab-system-tab:not(.disabled)');
        const currentIndex = Array.from(tabs).findIndex(tab => tab === document.activeElement);
        
        let nextIndex;
        if (direction === 'next') {
            nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        }
        
        if (tabs[nextIndex]) {
            tabs[nextIndex].focus();
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
        this.tabSystems.forEach((tabSystem, id) => {
            this.destroyTabSystem(id);
        });
        this.tabSystems.clear();
    }

    destroyTabSystem(id) {
        const tabSystem = this.tabSystems.get(id);
        if (!tabSystem) return;
        
        const { element } = tabSystem;
        element.removeEventListener('click', this.handleAction);
        
        this.tabSystems.delete(id);
        return this;
    }
}

// Initialize tab system manager
document.addEventListener('DOMContentLoaded', () => {
    window.tabSystemManager = new TabSystemManager();
});

// Global access
window.TabSystemManager = TabSystemManager;
