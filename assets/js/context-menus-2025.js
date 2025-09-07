/**
 * Angkor Compliance Platform - Context Menus JavaScript 2025
 * 
 * Modern context menu system with glassmorphism effects,
 * accessibility support, and responsive design.
 */

class ContextMenuManager {
    constructor() {
        this.contextMenus = new Map();
        this.activeMenu = null;
        this.config = {
            enableKeyboardNavigation: true,
            enableTouchNavigation: true,
            enableAccessibility: true,
            enableAnimations: true,
            enableSubmenus: true,
            enableOverlay: true,
            enableAutoHide: true,
            autoHideDelay: 100,
            animationDuration: 200,
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
            enableTopLeft: false,
            enableTopRight: false,
            enableBottomLeft: false,
            enableBottomRight: false,
            enableCenter: false,
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
        this.setupAccessibility();
        this.setupResponsive();
    }

    setupEventListeners() {
        document.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        document.addEventListener('click', (e) => this.handleClickOutside(e));
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        document.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());
    }

    setupAccessibility() {
        // Add ARIA attributes for screen readers
        document.addEventListener('contextmenu', (e) => {
            if (e.target.hasAttribute('data-context-menu')) {
                e.target.setAttribute('aria-haspopup', 'true');
                e.target.setAttribute('aria-expanded', 'false');
            }
        });
    }

    setupResponsive() {
        const updateResponsiveClasses = () => {
            this.contextMenus.forEach((menu) => {
                const { element } = menu;
                if (window.innerWidth < 768) {
                    element.classList.add('context-menu-mobile');
                } else {
                    element.classList.remove('context-menu-mobile');
                }
            });
        };
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    // Public Methods
    createContextMenu(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        this.contextMenus.set(id, {
            id,
            element,
            config,
            isVisible: false,
            isLoaded: false,
            isAnimating: false,
            currentItem: null,
            items: [],
            error: null
        });
        
        this.applyConfiguration(this.contextMenus.get(id));
        return this.contextMenus.get(id);
    }

    showContextMenu(id, x, y, items = []) {
        const menu = this.contextMenus.get(id);
        if (!menu) {
            console.error(`Context menu with id "${id}" not found`);
            return;
        }
        
        const { config } = menu;
        
        // Hide any existing context menu
        this.hideAllContextMenus();
        
        // Set menu items
        if (items.length > 0) {
            menu.items = items;
            this.renderContextMenu(menu);
        }
        
        // Position menu
        this.positionContextMenu(menu, x, y);
        
        // Show menu
        menu.isVisible = true;
        menu.element.classList.add('show');
        
        // Set as active menu
        this.activeMenu = menu;
        
        this.triggerEvent(menu.element, 'contextmenu:show', { 
            menu: config, 
            x, 
            y 
        });
        
        return this;
    }

    hideContextMenu(id) {
        const menu = this.contextMenus.get(id);
        if (!menu) {
            console.error(`Context menu with id "${id}" not found`);
            return;
        }
        
        const { config } = menu;
        
        menu.isVisible = false;
        menu.element.classList.remove('show');
        
        if (this.activeMenu === menu) {
            this.activeMenu = null;
        }
        
        this.triggerEvent(menu.element, 'contextmenu:hide', { 
            menu: config 
        });
        
        return this;
    }

    hideAllContextMenus() {
        this.contextMenus.forEach((menu, id) => {
            this.hideContextMenu(id);
        });
    }

    addContextMenuItem(id, item) {
        const menu = this.contextMenus.get(id);
        if (!menu) {
            console.error(`Context menu with id "${id}" not found`);
            return;
        }
        
        const { config } = menu;
        
        menu.items.push(item);
        this.renderContextMenu(menu);
        
        this.triggerEvent(menu.element, 'contextmenu:item:add', { 
            menu: config, 
            item 
        });
        
        return this;
    }

    removeContextMenuItem(id, itemId) {
        const menu = this.contextMenus.get(id);
        if (!menu) {
            console.error(`Context menu with id "${id}" not found`);
            return;
        }
        
        const { config } = menu;
        
        menu.items = menu.items.filter(item => item.id !== itemId);
        this.renderContextMenu(menu);
        
        this.triggerEvent(menu.element, 'contextmenu:item:remove', { 
            menu: config, 
            itemId 
        });
        
        return this;
    }

    updateContextMenuItem(id, itemId, updates) {
        const menu = this.contextMenus.get(id);
        if (!menu) {
            console.error(`Context menu with id "${id}" not found`);
            return;
        }
        
        const { config } = menu;
        
        const itemIndex = menu.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            menu.items[itemIndex] = { ...menu.items[itemIndex], ...updates };
            this.renderContextMenu(menu);
        }
        
        this.triggerEvent(menu.element, 'contextmenu:item:update', { 
            menu: config, 
            itemId, 
            updates 
        });
        
        return this;
    }

    // Private Methods
    applyConfiguration(menu) {
        const { element, config } = menu;
        
        if (config.enableKeyboardNavigation) element.classList.add('context-menu-keyboard-enabled');
        if (config.enableTouchNavigation) element.classList.add('context-menu-touch-enabled');
        if (config.enableAccessibility) element.classList.add('context-menu-accessibility-enabled');
        if (config.enableAnimations) element.classList.add('context-menu-animations-enabled');
        if (config.enableSubmenus) element.classList.add('context-menu-submenus-enabled');
        if (config.enableOverlay) element.classList.add('context-menu-overlay-enabled');
        if (config.enableAutoHide) element.classList.add('context-menu-autohide-enabled');
        if (config.enableSmoothScrolling) element.classList.add('context-menu-smooth-scroll-enabled');
        if (config.enableFocusManagement) element.classList.add('context-menu-focus-enabled');
        if (config.enableRoleManagement) element.classList.add('context-menu-role-enabled');
        if (config.enableUserMenu) element.classList.add('context-menu-user-menu-enabled');
        if (config.enableSearch) element.classList.add('context-menu-search-enabled');
        if (config.enableNotifications) element.classList.add('context-menu-notifications-enabled');
        if (config.enableThemeToggle) element.classList.add('context-menu-theme-enabled');
        if (config.enableGlassmorphism) element.classList.add('context-menu-glass');
        if (config.enableNeumorphism) element.classList.add('context-menu-neumorphism');
        if (config.enableElevated) element.classList.add('context-menu-elevated');
        if (config.enableFlat) element.classList.add('context-menu-flat');
        if (config.enableCompact) element.classList.add('context-menu-compact');
        if (config.enableLarge) element.classList.add('context-menu-large');
        if (config.enableTopLeft) element.classList.add('context-menu-top-left');
        if (config.enableTopRight) element.classList.add('context-menu-top-right');
        if (config.enableBottomLeft) element.classList.add('context-menu-bottom-left');
        if (config.enableBottomRight) element.classList.add('context-menu-bottom-right');
        if (config.enableCenter) element.classList.add('context-menu-center');
        if (config.enablePrimary) element.classList.add('context-menu-primary');
        if (config.enableSecondary) element.classList.add('context-menu-secondary');
        if (config.enableSuccess) element.classList.add('context-menu-success');
        if (config.enableWarning) element.classList.add('context-menu-warning');
        if (config.enableDanger) element.classList.add('context-menu-danger');
        if (config.enableInfo) element.classList.add('context-menu-info');
        
        this.addEventListeners(menu);
        this.renderContextMenu(menu);
    }

    addEventListeners(menu) {
        const { element, config } = menu;
        
        // Close button event listeners
        const closeButton = element.querySelector('.context-menu-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideContextMenu(menu.id);
            });
        }
        
        // Menu item event listeners
        const menuItems = element.querySelectorAll('.context-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = item.getAttribute('data-item-id');
                if (itemId) {
                    this.handleMenuItemClick(menu, itemId);
                }
            });
        });
        
        // Submenu event listeners
        const submenuItems = element.querySelectorAll('.context-menu-item[data-has-submenu]');
        submenuItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.showSubmenu(menu, item);
            });
            
            item.addEventListener('mouseleave', () => {
                this.hideSubmenu(menu, item);
            });
        });
    }

    renderContextMenu(menu) {
        const { element, config, items } = menu;
        
        this.updateContextMenuHeader(menu);
        this.updateContextMenuContent(menu);
        this.updateContextMenuFooter(menu);
    }

    updateContextMenuHeader(menu) {
        const { element, config } = menu;
        
        const header = element.querySelector('.context-menu-header');
        if (!header) return;
        
        const title = header.querySelector('.context-menu-title');
        const closeButton = header.querySelector('.context-menu-close');
        
        if (title && config.title) {
            title.textContent = config.title;
        }
        
        if (closeButton) {
            const closeIcon = closeButton.querySelector('i');
            if (closeIcon) {
                closeIcon.setAttribute('data-lucide', 'x');
            }
        }
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    updateContextMenuContent(menu) {
        const { element, config, items } = menu;
        
        const content = element.querySelector('.context-menu-content');
        if (!content) return;
        
        if (items.length === 0) {
            content.innerHTML = '<div class="context-menu-empty">No items available</div>';
            return;
        }
        
        // Group items by section
        const sections = this.groupContextMenuItems(items);
        
        // Render sections
        content.innerHTML = sections.map(section => {
            const sectionHtml = `
                <div class="context-menu-section">
                    ${section.title ? `<div class="context-menu-section-title">${section.title}</div>` : ''}
                    <div class="context-menu-items">
                        ${section.items.map(item => this.renderContextMenuItem(item)).join('')}
                    </div>
                </div>
            `;
            return sectionHtml;
        }).join('');
        
        // Add event listeners to new items
        const menuItems = content.querySelectorAll('.context-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = item.getAttribute('data-item-id');
                if (itemId) {
                    this.handleMenuItemClick(menu, itemId);
                }
            });
        });
        
        // Add event listeners to submenu items
        const submenuItems = content.querySelectorAll('.context-menu-item[data-has-submenu]');
        submenuItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.showSubmenu(menu, item);
            });
            
            item.addEventListener('mouseleave', () => {
                this.hideSubmenu(menu, item);
            });
        });
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    updateContextMenuFooter(menu) {
        const { element, config } = menu;
        
        const footer = element.querySelector('.context-menu-footer');
        if (!footer) return;
        
        const footerText = footer.querySelector('.context-menu-footer-text');
        const footerActions = footer.querySelector('.context-menu-footer-actions');
        
        if (footerText && config.footerText) {
            footerText.textContent = config.footerText;
        }
        
        if (footerActions && config.footerActions) {
            footerActions.innerHTML = config.footerActions.map(action => `
                <button class="context-menu-footer-button" data-action="${action.action}">
                    <i data-lucide="${action.icon}"></i>
                </button>
            `).join('');
            
            // Add event listeners to footer buttons
            const footerButtons = footerActions.querySelectorAll('.context-menu-footer-button');
            footerButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const action = button.getAttribute('data-action');
                    this.handleFooterAction(menu, action);
                });
            });
        }
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    groupContextMenuItems(items) {
        const sections = {};
        
        items.forEach(item => {
            const section = item.section || 'default';
            if (!sections[section]) {
                sections[section] = {
                    title: section === 'default' ? null : section,
                    items: []
                };
            }
            sections[section].items.push(item);
        });
        
        return Object.values(sections);
    }

    renderContextMenuItem(item) {
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const shortcut = item.shortcut ? `<span class="context-menu-shortcut">${item.shortcut}</span>` : '';
        const arrow = hasSubmenu ? '<i class="context-menu-arrow" data-lucide="chevron-right"></i>' : '';
        const disabled = item.disabled ? 'disabled' : '';
        const variant = item.variant ? item.variant : '';
        
        return `
            <div class="context-menu-item ${disabled} ${variant}" 
                 data-item-id="${item.id}" 
                 data-has-submenu="${hasSubmenu}">
                <i class="context-menu-icon" data-lucide="${item.icon}"></i>
                <span class="context-menu-text">${item.text}</span>
                ${shortcut}
                ${arrow}
                ${hasSubmenu ? this.renderContextMenuSubmenu(item.submenu) : ''}
            </div>
        `;
    }

    renderContextMenuSubmenu(submenu) {
        return `
            <div class="context-menu-submenu">
                ${submenu.map(subitem => `
                    <div class="context-menu-item ${subitem.disabled ? 'disabled' : ''} ${subitem.variant ? subitem.variant : ''}" 
                         data-item-id="${subitem.id}">
                        <i class="context-menu-icon" data-lucide="${subitem.icon}"></i>
                        <span class="context-menu-text">${subitem.text}</span>
                        ${subitem.shortcut ? `<span class="context-menu-shortcut">${subitem.shortcut}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    positionContextMenu(menu, x, y) {
        const { element, config } = menu;
        
        // Reset position
        element.style.top = '0';
        element.style.left = '0';
        element.style.transform = 'none';
        
        // Get menu dimensions
        const menuRect = element.getBoundingClientRect();
        const menuWidth = menuRect.width;
        const menuHeight = menuRect.height;
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate position
        let finalX = x;
        let finalY = y;
        
        // Adjust horizontal position if menu would overflow
        if (x + menuWidth > viewportWidth) {
            finalX = x - menuWidth;
        }
        
        // Adjust vertical position if menu would overflow
        if (y + menuHeight > viewportHeight) {
            finalY = y - menuHeight;
        }
        
        // Ensure menu stays within viewport
        finalX = Math.max(0, Math.min(finalX, viewportWidth - menuWidth));
        finalY = Math.max(0, Math.min(finalY, viewportHeight - menuHeight));
        
        // Apply position
        element.style.left = `${finalX}px`;
        element.style.top = `${finalY}px`;
    }

    showSubmenu(menu, item) {
        const { config } = menu;
        
        if (!config.enableSubmenus) return;
        
        const submenu = item.querySelector('.context-menu-submenu');
        if (!submenu) return;
        
        submenu.style.display = 'block';
        
        // Position submenu
        const itemRect = item.getBoundingClientRect();
        const submenuRect = submenu.getBoundingClientRect();
        
        let submenuX = itemRect.right + 8;
        let submenuY = itemRect.top;
        
        // Adjust position if submenu would overflow
        if (submenuX + submenuRect.width > window.innerWidth) {
            submenuX = itemRect.left - submenuRect.width - 8;
        }
        
        if (submenuY + submenuRect.height > window.innerHeight) {
            submenuY = window.innerHeight - submenuRect.height - 8;
        }
        
        submenu.style.left = `${submenuX}px`;
        submenu.style.top = `${submenuY}px`;
        
        this.triggerEvent(menu.element, 'contextmenu:submenu:show', { 
            menu: config, 
            item: item.getAttribute('data-item-id')
        });
    }

    hideSubmenu(menu, item) {
        const { config } = menu;
        
        if (!config.enableSubmenus) return;
        
        const submenu = item.querySelector('.context-menu-submenu');
        if (!submenu) return;
        
        submenu.style.display = 'none';
        
        this.triggerEvent(menu.element, 'contextmenu:submenu:hide', { 
            menu: config, 
            item: item.getAttribute('data-item-id')
        });
    }

    handleMenuItemClick(menu, itemId) {
        const { config } = menu;
        
        const item = menu.items.find(item => item.id === itemId);
        if (!item) return;
        
        if (item.disabled) return;
        
        // Execute item action
        if (item.action) {
            if (typeof item.action === 'function') {
                item.action(item);
            } else if (typeof item.action === 'string') {
                this.executeAction(menu, item.action, item);
            }
        }
        
        // Hide menu if not persistent
        if (!item.persistent) {
            this.hideContextMenu(menu.id);
        }
        
        this.triggerEvent(menu.element, 'contextmenu:item:click', { 
            menu: config, 
            itemId, 
            item 
        });
    }

    handleFooterAction(menu, action) {
        const { config } = menu;
        
        this.executeAction(menu, action);
        
        this.triggerEvent(menu.element, 'contextmenu:footer:action', { 
            menu: config, 
            action 
        });
    }

    executeAction(menu, action, item = null) {
        const { config } = menu;
        
        switch (action) {
            case 'close':
                this.hideContextMenu(menu.id);
                break;
            case 'refresh':
                this.renderContextMenu(menu);
                break;
            case 'custom':
                if (item && item.customAction) {
                    item.customAction(item);
                }
                break;
            default:
                console.log(`Unknown action: ${action}`);
        }
    }

    // Event Handlers
    handleContextMenu(e) {
        const target = e.target;
        const contextMenuId = target.getAttribute('data-context-menu');
        
        if (contextMenuId) {
            e.preventDefault();
            
            const menu = this.contextMenus.get(contextMenuId);
            if (menu) {
                this.showContextMenu(contextMenuId, e.clientX, e.clientY);
            }
        }
    }

    handleClickOutside(e) {
        if (this.activeMenu && !this.activeMenu.element.contains(e.target)) {
            this.hideContextMenu(this.activeMenu.id);
        }
    }

    handleKeyboardNavigation(e) {
        if (this.activeMenu) {
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    this.hideContextMenu(this.activeMenu.id);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateMenu('down');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateMenu('up');
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    this.activateMenuItem();
                    break;
            }
        }
    }

    handleScroll() {
        if (this.activeMenu) {
            this.hideContextMenu(this.activeMenu.id);
        }
    }

    handleResize() {
        if (this.activeMenu) {
            this.hideContextMenu(this.activeMenu.id);
        }
    }

    navigateMenu(direction) {
        if (!this.activeMenu) return;
        
        const { element } = this.activeMenu;
        const items = element.querySelectorAll('.context-menu-item:not(.disabled)');
        const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);
        
        let nextIndex;
        if (direction === 'down') {
            nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }
        
        if (items[nextIndex]) {
            items[nextIndex].focus();
        }
    }

    activateMenuItem() {
        if (!this.activeMenu) return;
        
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('context-menu-item')) {
            const itemId = activeElement.getAttribute('data-item-id');
            if (itemId) {
                this.handleMenuItemClick(this.activeMenu, itemId);
            }
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
        this.contextMenus.forEach((menu, id) => {
            this.destroyContextMenu(id);
        });
        this.contextMenus.clear();
    }

    destroyContextMenu(id) {
        const menu = this.contextMenus.get(id);
        if (!menu) return;
        
        const { element } = menu;
        element.removeEventListener('click', this.handleAction);
        
        this.contextMenus.delete(id);
        return this;
    }
}

// Initialize context menu manager
document.addEventListener('DOMContentLoaded', () => {
    window.contextMenuManager = new ContextMenuManager();
});

// Global access
window.ContextMenuManager = ContextMenuManager;
