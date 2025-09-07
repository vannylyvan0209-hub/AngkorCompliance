/**
 * Angkor Compliance Platform - Accordion Components JavaScript 2025
 * 
 * Modern accordion components with smooth animations and 2025 design patterns,
 * accessibility support, and responsive design.
 */

class AccordionManager {
    constructor() {
        this.accordions = new Map();
        this.config = {
            enableKeyboardNavigation: true,
            enableTouchNavigation: true,
            enableAccessibility: true,
            enableAnimations: true,
            enableMultipleOpen: false,
            enableAutoClose: true,
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
            enableVertical: true,
            enableHorizontal: false,
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
        this.initializeAccordions();
        this.setupAccessibility();
        this.setupResponsive();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    initializeAccordions() {
        const accordionElements = document.querySelectorAll('.accordion');
        accordionElements.forEach((element, index) => {
            const id = element.id || `accordion-${index}`;
            this.createAccordion(id, element);
        });
    }

    setupAccessibility() {
        this.accordions.forEach((accordion, id) => {
            const { element } = accordion;
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'tablist');
            }
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'Accordion navigation');
            }
        });
    }

    setupResponsive() {
        const updateResponsiveClasses = () => {
            this.accordions.forEach((accordion) => {
                const { element } = accordion;
                if (window.innerWidth < 768) {
                    element.classList.add('accordion-mobile');
                } else {
                    element.classList.remove('accordion-mobile');
                }
            });
        };
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    // Public Methods
    createAccordion(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        this.accordions.set(id, {
            id,
            element,
            config,
            isLoaded: false,
            isAnimating: false,
            activeItems: [],
            items: [],
            error: null
        });
        
        this.applyConfiguration(this.accordions.get(id));
        return this.accordions.get(id);
    }

    addAccordionItem(id, item) {
        const accordion = this.accordions.get(id);
        if (!accordion) {
            console.error(`Accordion with id "${id}" not found`);
            return;
        }
        
        const { config } = accordion;
        
        accordion.items.push(item);
        this.renderAccordion(accordion);
        
        this.triggerEvent(accordion.element, 'accordion:item:add', { 
            accordion: config, 
            item 
        });
        
        return this;
    }

    removeAccordionItem(id, itemId) {
        const accordion = this.accordions.get(id);
        if (!accordion) {
            console.error(`Accordion with id "${id}" not found`);
            return;
        }
        
        const { config } = accordion;
        
        accordion.items = accordion.items.filter(item => item.id !== itemId);
        accordion.activeItems = accordion.activeItems.filter(activeId => activeId !== itemId);
        
        this.renderAccordion(accordion);
        
        this.triggerEvent(accordion.element, 'accordion:item:remove', { 
            accordion: config, 
            itemId 
        });
        
        return this;
    }

    updateAccordionItem(id, itemId, updates) {
        const accordion = this.accordions.get(id);
        if (!accordion) {
            console.error(`Accordion with id "${id}" not found`);
            return;
        }
        
        const { config } = accordion;
        
        const itemIndex = accordion.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            accordion.items[itemIndex] = { ...accordion.items[itemIndex], ...updates };
            this.renderAccordion(accordion);
        }
        
        this.triggerEvent(accordion.element, 'accordion:item:update', { 
            accordion: config, 
            itemId, 
            updates 
        });
        
        return this;
    }

    toggleAccordionItem(id, itemId) {
        const accordion = this.accordions.get(id);
        if (!accordion) {
            console.error(`Accordion with id "${id}" not found`);
            return;
        }
        
        const { config } = accordion;
        
        const isActive = accordion.activeItems.includes(itemId);
        
        if (isActive) {
            this.closeAccordionItem(id, itemId);
        } else {
            this.openAccordionItem(id, itemId);
        }
        
        return this;
    }

    openAccordionItem(id, itemId) {
        const accordion = this.accordions.get(id);
        if (!accordion) {
            console.error(`Accordion with id "${id}" not found`);
            return;
        }
        
        const { config } = accordion;
        
        // If multiple open is disabled, close all other items
        if (!config.enableMultipleOpen) {
            accordion.activeItems.forEach(activeId => {
                if (activeId !== itemId) {
                    this.closeAccordionItem(id, activeId);
                }
            });
        }
        
        // Add to active items
        if (!accordion.activeItems.includes(itemId)) {
            accordion.activeItems.push(itemId);
        }
        
        this.updateAccordion(accordion);
        
        this.triggerEvent(accordion.element, 'accordion:item:open', { 
            accordion: config, 
            itemId 
        });
        
        return this;
    }

    closeAccordionItem(id, itemId) {
        const accordion = this.accordions.get(id);
        if (!accordion) {
            console.error(`Accordion with id "${id}" not found`);
            return;
        }
        
        const { config } = accordion;
        
        // Remove from active items
        accordion.activeItems = accordion.activeItems.filter(activeId => activeId !== itemId);
        
        this.updateAccordion(accordion);
        
        this.triggerEvent(accordion.element, 'accordion:item:close', { 
            accordion: config, 
            itemId 
        });
        
        return this;
    }

    openAllAccordionItems(id) {
        const accordion = this.accordions.get(id);
        if (!accordion) {
            console.error(`Accordion with id "${id}" not found`);
            return;
        }
        
        const { config } = accordion;
        
        accordion.items.forEach(item => {
            if (!accordion.activeItems.includes(item.id)) {
                accordion.activeItems.push(item.id);
            }
        });
        
        this.updateAccordion(accordion);
        
        this.triggerEvent(accordion.element, 'accordion:items:open:all', { 
            accordion: config 
        });
        
        return this;
    }

    closeAllAccordionItems(id) {
        const accordion = this.accordions.get(id);
        if (!accordion) {
            console.error(`Accordion with id "${id}" not found`);
            return;
        }
        
        const { config } = accordion;
        
        accordion.activeItems = [];
        
        this.updateAccordion(accordion);
        
        this.triggerEvent(accordion.element, 'accordion:items:close:all', { 
            accordion: config 
        });
        
        return this;
    }

    // Private Methods
    applyConfiguration(accordion) {
        const { element, config } = accordion;
        
        if (config.enableKeyboardNavigation) element.classList.add('accordion-keyboard-enabled');
        if (config.enableTouchNavigation) element.classList.add('accordion-touch-enabled');
        if (config.enableAccessibility) element.classList.add('accordion-accessibility-enabled');
        if (config.enableAnimations) element.classList.add('accordion-animations-enabled');
        if (config.enableMultipleOpen) element.classList.add('accordion-multiple-enabled');
        if (config.enableAutoClose) element.classList.add('accordion-autoclose-enabled');
        if (config.enableAutoHide) element.classList.add('accordion-autohide-enabled');
        if (config.enableSmoothScrolling) element.classList.add('accordion-smooth-scroll-enabled');
        if (config.enableFocusManagement) element.classList.add('accordion-focus-enabled');
        if (config.enableRoleManagement) element.classList.add('accordion-role-enabled');
        if (config.enableUserMenu) element.classList.add('accordion-user-menu-enabled');
        if (config.enableSearch) element.classList.add('accordion-search-enabled');
        if (config.enableNotifications) element.classList.add('accordion-notifications-enabled');
        if (config.enableThemeToggle) element.classList.add('accordion-theme-enabled');
        if (config.enableGlassmorphism) element.classList.add('accordion-glass');
        if (config.enableNeumorphism) element.classList.add('accordion-neumorphism');
        if (config.enableElevated) element.classList.add('accordion-elevated');
        if (config.enableFlat) element.classList.add('accordion-flat');
        if (config.enableCompact) element.classList.add('accordion-compact');
        if (config.enableLarge) element.classList.add('accordion-large');
        if (config.enableVertical) element.classList.add('accordion-vertical');
        if (config.enableHorizontal) element.classList.add('accordion-horizontal');
        if (config.enablePrimary) element.classList.add('accordion-primary');
        if (config.enableSecondary) element.classList.add('accordion-secondary');
        if (config.enableSuccess) element.classList.add('accordion-success');
        if (config.enableWarning) element.classList.add('accordion-warning');
        if (config.enableDanger) element.classList.add('accordion-danger');
        if (config.enableInfo) element.classList.add('accordion-info');
        
        this.addEventListeners(accordion);
        this.renderAccordion(accordion);
    }

    addEventListeners(accordion) {
        const { element, config } = accordion;
        
        // Accordion item header event listeners
        const itemHeaders = element.querySelectorAll('.accordion-item-header');
        itemHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = header.getAttribute('data-item-id');
                if (itemId) {
                    this.toggleAccordionItem(accordion.id, itemId);
                }
            });
        });
        
        // Action button event listeners
        const actionButtons = element.querySelectorAll('.accordion-action');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.getAttribute('data-action');
                this.handleAction(accordion, action);
            });
        });
    }

    renderAccordion(accordion) {
        const { element, config, items } = accordion;
        
        this.updateAccordionHeader(accordion);
        this.updateAccordionItems(accordion);
    }

    updateAccordionHeader(accordion) {
        const { element, config } = accordion;
        
        const header = element.querySelector('.accordion-header');
        if (!header) return;
        
        const title = header.querySelector('.accordion-title');
        const subtitle = header.querySelector('.accordion-subtitle');
        const actions = header.querySelector('.accordion-actions');
        
        if (title && config.title) {
            title.textContent = config.title;
        }
        
        if (subtitle && config.subtitle) {
            subtitle.textContent = config.subtitle;
        }
        
        if (actions && config.actions) {
            actions.innerHTML = config.actions.map(action => `
                <button class="accordion-action" data-action="${action.action}">
                    <i data-lucide="${action.icon}"></i>
                </button>
            `).join('');
            
            // Add event listeners to action buttons
            const actionButtons = actions.querySelectorAll('.accordion-action');
            actionButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const action = button.getAttribute('data-action');
                    this.handleAction(accordion, action);
                });
            });
        }
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    updateAccordionItems(accordion) {
        const { element, config, items } = accordion;
        
        const itemsContainer = element.querySelector('.accordion-items');
        if (!itemsContainer) return;
        
        if (items.length === 0) {
            itemsContainer.innerHTML = '<div class="accordion-empty">No items available</div>';
            return;
        }
        
        // Render items
        itemsContainer.innerHTML = items.map(item => this.renderAccordionItem(item)).join('');
        
        // Add event listeners to new items
        const itemHeaders = itemsContainer.querySelectorAll('.accordion-item-header');
        itemHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = header.getAttribute('data-item-id');
                if (itemId) {
                    this.toggleAccordionItem(accordion.id, itemId);
                }
            });
        });
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    renderAccordionItem(item) {
        const badge = item.badge ? `<span class="accordion-item-badge">${item.badge}</span>` : '';
        const disabled = item.disabled ? 'disabled' : '';
        const active = item.active ? 'active' : '';
        
        return `
            <div class="accordion-item ${active} ${disabled}" data-item-id="${item.id}">
                <button class="accordion-item-header" 
                        data-item-id="${item.id}" 
                        role="tab" 
                        aria-expanded="${item.active}" 
                        aria-controls="accordion-panel-${item.id}">
                    <i class="accordion-item-icon" data-lucide="${item.icon}"></i>
                    <div class="accordion-item-content">
                        <div class="accordion-item-title">${item.title}</div>
                        ${item.subtitle ? `<div class="accordion-item-subtitle">${item.subtitle}</div>` : ''}
                    </div>
                    ${badge}
                    <div class="accordion-item-indicator">
                        <i data-lucide="chevron-down"></i>
                    </div>
                </button>
                <div class="accordion-item-content-panel" 
                     role="tabpanel" 
                     aria-labelledby="accordion-header-${item.id}">
                    <div class="accordion-item-content-inner">
                        <div class="accordion-item-content">
                            ${item.content}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateAccordion(accordion) {
        const { element, config, items, activeItems } = accordion;
        
        // Update item states
        const itemElements = element.querySelectorAll('.accordion-item');
        itemElements.forEach(item => {
            const itemId = item.getAttribute('data-item-id');
            const isActive = activeItems.includes(itemId);
            
            if (isActive) {
                item.classList.add('active');
                const header = item.querySelector('.accordion-item-header');
                const panel = item.querySelector('.accordion-item-content-panel');
                
                if (header) {
                    header.setAttribute('aria-expanded', 'true');
                }
                
                if (panel) {
                    panel.setAttribute('aria-hidden', 'false');
                }
            } else {
                item.classList.remove('active');
                const header = item.querySelector('.accordion-item-header');
                const panel = item.querySelector('.accordion-item-content-panel');
                
                if (header) {
                    header.setAttribute('aria-expanded', 'false');
                }
                
                if (panel) {
                    panel.setAttribute('aria-hidden', 'true');
                }
            }
        });
    }

    handleAction(accordion, action) {
        const { config } = accordion;
        
        switch (action) {
            case 'open-all':
                this.openAllAccordionItems(accordion.id);
                break;
            case 'close-all':
                this.closeAllAccordionItems(accordion.id);
                break;
            case 'refresh':
                this.refreshAccordion(accordion);
                break;
            case 'custom':
                if (config.customAction) {
                    config.customAction(accordion);
                }
                break;
            default:
                console.log(`Unknown action: ${action}`);
        }
    }

    refreshAccordion(accordion) {
        const { config } = accordion;
        
        this.renderAccordion(accordion);
    }

    // Event Handlers
    handleResize() {
        this.accordions.forEach((accordion) => {
            const { config } = accordion;
            
            if (window.innerWidth < 768) {
                accordion.element.classList.add('accordion-mobile');
            } else {
                accordion.element.classList.remove('accordion-mobile');
            }
        });
    }

    handleKeyboardNavigation(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateAccordion('down');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateAccordion('up');
                    break;
            }
        }
    }

    navigateAccordion(direction) {
        // Find active accordion
        const activeAccordion = Array.from(this.accordions.values()).find(acc => 
            acc.element.contains(document.activeElement)
        );
        
        if (!activeAccordion) return;
        
        const { element } = activeAccordion;
        const headers = element.querySelectorAll('.accordion-item-header:not(.disabled)');
        const currentIndex = Array.from(headers).findIndex(header => header === document.activeElement);
        
        let nextIndex;
        if (direction === 'down') {
            nextIndex = currentIndex < headers.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : headers.length - 1;
        }
        
        if (headers[nextIndex]) {
            headers[nextIndex].focus();
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
        this.accordions.forEach((accordion, id) => {
            this.destroyAccordion(id);
        });
        this.accordions.clear();
    }

    destroyAccordion(id) {
        const accordion = this.accordions.get(id);
        if (!accordion) return;
        
        const { element } = accordion;
        element.removeEventListener('click', this.handleAction);
        
        this.accordions.delete(id);
        return this;
    }
}

// Initialize accordion manager
document.addEventListener('DOMContentLoaded', () => {
    window.accordionManager = new AccordionManager();
});

// Global access
window.AccordionManager = AccordionManager;
