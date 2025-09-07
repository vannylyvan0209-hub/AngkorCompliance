/**
 * Angkor Compliance Platform - Sidebar Navigation JavaScript 2025
 * 
 * Ultra-minimal sidebar navigation with 2025 design patterns,
 * accessibility support, and responsive design.
 */

class SidebarManager {
    constructor() {
        this.sidebars = new Map();
        this.config = {
            enableKeyboardNavigation: true,
            enableTouchNavigation: true,
            enableAccessibility: true,
            enableAnimations: true,
            enableCollapse: true,
            enableOverlay: true,
            enableAutoHide: false,
            autoHideDelay: 3000,
            animationDuration: 300,
            animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            breakpoint: 768,
            overlayOpacity: 0.5,
            enableSmoothScrolling: true,
            enableFocusManagement: true,
            enableRoleManagement: true,
            enableUserMenu: true,
            enableSearch: false,
            enableNotifications: true,
            enableThemeToggle: true
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSidebars();
        this.setupAccessibility();
        this.setupResponsive();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        document.addEventListener('click', (e) => this.handleClickOutside(e));
    }

    initializeSidebars() {
        const sidebarElements = document.querySelectorAll('.sidebar');
        sidebarElements.forEach((element, index) => {
            const id = element.id || `sidebar-${index}`;
            this.createSidebar(id, element);
        });
    }

    setupAccessibility() {
        this.sidebars.forEach((sidebar, id) => {
            const { element } = sidebar;
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'navigation');
            }
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'Main navigation');
            }
        });
    }

    setupResponsive() {
        const updateResponsiveClasses = () => {
            this.sidebars.forEach((sidebar) => {
                const { element } = sidebar;
                if (window.innerWidth < this.config.breakpoint) {
                    element.classList.add('sidebar-mobile');
                } else {
                    element.classList.remove('sidebar-mobile');
                }
            });
        };
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    // Public Methods
    createSidebar(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        this.sidebars.set(id, {
            id,
            element,
            config,
            isCollapsed: false,
            isHidden: false,
            isLoaded: false,
            isAnimating: false,
            currentItem: null,
            navigation: [],
            user: null,
            error: null
        });
        
        this.applyConfiguration(this.sidebars.get(id));
        return this.sidebars.get(id);
    }

    toggleSidebar(id) {
        const sidebar = this.sidebars.get(id);
        if (!sidebar) {
            console.error(`Sidebar with id "${id}" not found`);
            return;
        }
        
        const { config } = sidebar;
        
        if (sidebar.isHidden) {
            this.showSidebar(id);
        } else {
            this.hideSidebar(id);
        }
        
        return this;
    }

    showSidebar(id) {
        const sidebar = this.sidebars.get(id);
        if (!sidebar) {
            console.error(`Sidebar with id "${id}" not found`);
            return;
        }
        
        const { config } = sidebar;
        
        sidebar.isHidden = false;
        sidebar.element.classList.remove('hidden');
        
        if (window.innerWidth < config.breakpoint) {
            this.showOverlay(id);
        }
        
        this.triggerEvent(sidebar.element, 'sidebar:show', { 
            sidebar: config 
        });
        
        return this;
    }

    hideSidebar(id) {
        const sidebar = this.sidebars.get(id);
        if (!sidebar) {
            console.error(`Sidebar with id "${id}" not found`);
            return;
        }
        
        const { config } = sidebar;
        
        sidebar.isHidden = true;
        sidebar.element.classList.add('hidden');
        
        this.hideOverlay(id);
        
        this.triggerEvent(sidebar.element, 'sidebar:hide', { 
            sidebar: config 
        });
        
        return this;
    }

    collapseSidebar(id) {
        const sidebar = this.sidebars.get(id);
        if (!sidebar) {
            console.error(`Sidebar with id "${id}" not found`);
            return;
        }
        
        const { config } = sidebar;
        
        sidebar.isCollapsed = true;
        sidebar.element.classList.add('collapsed');
        
        this.triggerEvent(sidebar.element, 'sidebar:collapse', { 
            sidebar: config 
        });
        
        return this;
    }

    expandSidebar(id) {
        const sidebar = this.sidebars.get(id);
        if (!sidebar) {
            console.error(`Sidebar with id "${id}" not found`);
            return;
        }
        
        const { config } = sidebar;
        
        sidebar.isCollapsed = false;
        sidebar.element.classList.remove('collapsed');
        
        this.triggerEvent(sidebar.element, 'sidebar:expand', { 
            sidebar: config 
        });
        
        return this;
    }

    toggleCollapse(id) {
        const sidebar = this.sidebars.get(id);
        if (!sidebar) {
            console.error(`Sidebar with id "${id}" not found`);
            return;
        }
        
        if (sidebar.isCollapsed) {
            this.expandSidebar(id);
        } else {
            this.collapseSidebar(id);
        }
        
        return this;
    }

    setActiveItem(id, itemId) {
        const sidebar = this.sidebars.get(id);
        if (!sidebar) {
            console.error(`Sidebar with id "${id}" not found`);
            return;
        }
        
        const { config } = sidebar;
        
        // Remove active class from all items
        const items = sidebar.element.querySelectorAll('.sidebar-nav-item');
        items.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to target item
        const targetItem = sidebar.element.querySelector(`[data-item-id="${itemId}"]`);
        if (targetItem) {
            targetItem.classList.add('active');
            sidebar.currentItem = itemId;
        }
        
        this.triggerEvent(sidebar.element, 'sidebar:item:activate', { 
            sidebar: config, 
            itemId 
        });
        
        return this;
    }

    addNavigationItem(id, item) {
        const sidebar = this.sidebars.get(id);
        if (!sidebar) {
            console.error(`Sidebar with id "${id}" not found`);
            return;
        }
        
        const { config } = sidebar;
        
        sidebar.navigation.push(item);
        this.renderSidebar(sidebar);
        
        this.triggerEvent(sidebar.element, 'sidebar:item:add', { 
            sidebar: config, 
            item 
        });
        
        return this;
    }

    removeNavigationItem(id, itemId) {
        const sidebar = this.sidebars.get(id);
        if (!sidebar) {
            console.error(`Sidebar with id "${id}" not found`);
            return;
        }
        
        const { config } = sidebar;
        
        sidebar.navigation = sidebar.navigation.filter(item => item.id !== itemId);
        this.renderSidebar(sidebar);
        
        this.triggerEvent(sidebar.element, 'sidebar:item:remove', { 
            sidebar: config, 
            itemId 
        });
        
        return this;
    }

    setUser(id, user) {
        const sidebar = this.sidebars.get(id);
        if (!sidebar) {
            console.error(`Sidebar with id "${id}" not found`);
            return;
        }
        
        const { config } = sidebar;
        
        sidebar.user = user;
        this.updateUserInfo(sidebar);
        
        this.triggerEvent(sidebar.element, 'sidebar:user:change', { 
            sidebar: config, 
            user 
        });
        
        return this;
    }

    // Private Methods
    applyConfiguration(sidebar) {
        const { element, config } = sidebar;
        
        if (config.enableKeyboardNavigation) element.classList.add('sidebar-keyboard-enabled');
        if (config.enableTouchNavigation) element.classList.add('sidebar-touch-enabled');
        if (config.enableAccessibility) element.classList.add('sidebar-accessibility-enabled');
        if (config.enableAnimations) element.classList.add('sidebar-animations-enabled');
        if (config.enableCollapse) element.classList.add('sidebar-collapse-enabled');
        if (config.enableOverlay) element.classList.add('sidebar-overlay-enabled');
        if (config.enableAutoHide) element.classList.add('sidebar-autohide-enabled');
        if (config.enableSmoothScrolling) element.classList.add('sidebar-smooth-scroll-enabled');
        if (config.enableFocusManagement) element.classList.add('sidebar-focus-enabled');
        if (config.enableRoleManagement) element.classList.add('sidebar-role-enabled');
        if (config.enableUserMenu) element.classList.add('sidebar-user-menu-enabled');
        if (config.enableSearch) element.classList.add('sidebar-search-enabled');
        if (config.enableNotifications) element.classList.add('sidebar-notifications-enabled');
        if (config.enableThemeToggle) element.classList.add('sidebar-theme-enabled');
        
        this.addEventListeners(sidebar);
        this.renderSidebar(sidebar);
    }

    addEventListeners(sidebar) {
        const { element, config } = sidebar;
        
        // Toggle event listeners
        const toggleButton = element.querySelector('.sidebar-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggleCollapse(sidebar.id);
            });
        }
        
        // Navigation item event listeners
        const navItems = element.querySelectorAll('.sidebar-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = item.getAttribute('data-item-id');
                if (itemId) {
                    this.setActiveItem(sidebar.id, itemId);
                }
            });
        });
        
        // User menu event listeners
        const userElement = element.querySelector('.sidebar-user');
        if (userElement) {
            userElement.addEventListener('click', () => {
                this.toggleUserMenu(sidebar.id);
            });
        }
        
        // Submenu event listeners
        const submenuItems = element.querySelectorAll('.sidebar-nav-item[data-has-submenu]');
        submenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSubmenu(sidebar.id, item);
            });
        });
    }

    renderSidebar(sidebar) {
        const { element, config, navigation } = sidebar;
        
        this.updateSidebarHeader(sidebar);
        this.updateSidebarNavigation(sidebar);
        this.updateSidebarFooter(sidebar);
    }

    updateSidebarHeader(sidebar) {
        const { element, config } = sidebar;
        
        const logo = element.querySelector('.sidebar-logo');
        const toggle = element.querySelector('.sidebar-toggle');
        
        if (logo && config.logo) {
            const logoIcon = logo.querySelector('.sidebar-logo-icon');
            const logoText = logo.querySelector('.sidebar-logo-text');
            
            if (logoIcon && config.logo.icon) {
                logoIcon.innerHTML = `<i data-lucide="${config.logo.icon}"></i>`;
            }
            
            if (logoText && config.logo.text) {
                logoText.textContent = config.logo.text;
            }
        }
        
        if (toggle) {
            const toggleIcon = toggle.querySelector('i');
            if (toggleIcon) {
                toggleIcon.setAttribute('data-lucide', sidebar.isCollapsed ? 'chevron-right' : 'chevron-left');
            }
        }
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    updateSidebarNavigation(sidebar) {
        const { element, config, navigation } = sidebar;
        
        const navContainer = element.querySelector('.sidebar-nav');
        if (!navContainer) return;
        
        if (navigation.length === 0) {
            navContainer.innerHTML = '<div class="sidebar-empty">No navigation items</div>';
            return;
        }
        
        // Group navigation items by section
        const sections = this.groupNavigationItems(navigation);
        
        // Render sections
        navContainer.innerHTML = sections.map(section => {
            const sectionHtml = `
                <div class="sidebar-nav-section">
                    ${section.title ? `<div class="sidebar-nav-title">${section.title}</div>` : ''}
                    <div class="sidebar-nav-items">
                        ${section.items.map(item => this.renderNavigationItem(item)).join('')}
                    </div>
                </div>
            `;
            return sectionHtml;
        }).join('');
        
        // Add event listeners to new items
        const navItems = navContainer.querySelectorAll('.sidebar-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const itemId = item.getAttribute('data-item-id');
                if (itemId) {
                    this.setActiveItem(sidebar.id, itemId);
                }
            });
        });
        
        // Add event listeners to submenu items
        const submenuItems = navContainer.querySelectorAll('.sidebar-nav-item[data-has-submenu]');
        submenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSubmenu(sidebar.id, item);
            });
        });
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    updateSidebarFooter(sidebar) {
        const { element, config, user } = sidebar;
        
        const footer = element.querySelector('.sidebar-footer');
        if (!footer) return;
        
        if (user) {
            const userElement = footer.querySelector('.sidebar-user');
            if (userElement) {
                const avatar = userElement.querySelector('.sidebar-user-avatar');
                const name = userElement.querySelector('.sidebar-user-name');
                const role = userElement.querySelector('.sidebar-user-role');
                
                if (avatar) {
                    if (user.avatar) {
                        avatar.style.backgroundImage = `url(${user.avatar})`;
                        avatar.style.backgroundSize = 'cover';
                        avatar.style.backgroundPosition = 'center';
                    } else {
                        avatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                    }
                }
                
                if (name) {
                    name.textContent = user.name || 'User';
                }
                
                if (role) {
                    role.textContent = user.role || 'User';
                }
            }
        }
    }

    updateUserInfo(sidebar) {
        const { element, config, user } = sidebar;
        
        const userElement = element.querySelector('.sidebar-user');
        if (!userElement || !user) return;
        
        const avatar = userElement.querySelector('.sidebar-user-avatar');
        const name = userElement.querySelector('.sidebar-user-name');
        const role = userElement.querySelector('.sidebar-user-role');
        
        if (avatar) {
            if (user.avatar) {
                avatar.style.backgroundImage = `url(${user.avatar})`;
                avatar.style.backgroundSize = 'cover';
                avatar.style.backgroundPosition = 'center';
            } else {
                avatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
            }
        }
        
        if (name) {
            name.textContent = user.name || 'User';
        }
        
        if (role) {
            role.textContent = user.role || 'User';
        }
    }

    groupNavigationItems(navigation) {
        const sections = {};
        
        navigation.forEach(item => {
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

    renderNavigationItem(item) {
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const badge = item.badge ? `<span class="sidebar-nav-badge">${item.badge}</span>` : '';
        const arrow = hasSubmenu ? '<i class="sidebar-nav-arrow" data-lucide="chevron-right"></i>' : '';
        
        return `
            <div class="sidebar-nav-item ${item.active ? 'active' : ''} ${hasSubmenu ? 'has-submenu' : ''}" 
                 data-item-id="${item.id}" 
                 data-has-submenu="${hasSubmenu}">
                <i class="sidebar-nav-icon" data-lucide="${item.icon}"></i>
                <span class="sidebar-nav-text">${item.text}</span>
                ${badge}
                ${arrow}
                ${hasSubmenu ? this.renderSubmenu(item.submenu) : ''}
            </div>
        `;
    }

    renderSubmenu(submenu) {
        return `
            <div class="sidebar-nav-submenu">
                ${submenu.map(subitem => `
                    <div class="sidebar-nav-subitem ${subitem.active ? 'active' : ''}" 
                         data-item-id="${subitem.id}">
                        <i class="sidebar-nav-subicon" data-lucide="${subitem.icon}"></i>
                        <span class="sidebar-nav-subtext">${subitem.text}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    toggleSubmenu(sidebar, item) {
        const { config } = sidebar;
        
        const isExpanded = item.classList.contains('expanded');
        
        if (isExpanded) {
            item.classList.remove('expanded');
        } else {
            item.classList.add('expanded');
        }
        
        this.triggerEvent(sidebar.element, 'sidebar:submenu:toggle', { 
            sidebar: config, 
            item: item.getAttribute('data-item-id'),
            expanded: !isExpanded
        });
    }

    toggleUserMenu(sidebar) {
        const { config } = sidebar;
        
        this.triggerEvent(sidebar.element, 'sidebar:user:menu:toggle', { 
            sidebar: config 
        });
    }

    showOverlay(sidebar) {
        const { config } = sidebar;
        
        if (!config.enableOverlay) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, ${config.overlayOpacity});
            z-index: ${config.overlayZIndex || 999};
            opacity: 0;
            transition: opacity ${config.animationDuration}ms ${config.animationEasing};
        `;
        
        overlay.addEventListener('click', () => {
            this.hideSidebar(sidebar.id);
        });
        
        document.body.appendChild(overlay);
        
        // Animate overlay
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
        
        sidebar.overlay = overlay;
    }

    hideOverlay(sidebar) {
        if (sidebar.overlay) {
            sidebar.overlay.style.opacity = '0';
            setTimeout(() => {
                if (sidebar.overlay && sidebar.overlay.parentNode) {
                    sidebar.overlay.parentNode.removeChild(sidebar.overlay);
                }
                sidebar.overlay = null;
            }, sidebar.config.animationDuration);
        }
    }

    // Event Handlers
    handleResize() {
        this.sidebars.forEach((sidebar) => {
            const { config } = sidebar;
            
            if (window.innerWidth >= config.breakpoint) {
                sidebar.element.classList.remove('hidden');
                this.hideOverlay(sidebar);
            } else if (sidebar.isHidden) {
                sidebar.element.classList.add('hidden');
            }
        });
    }

    handleKeyboardNavigation(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    this.toggleFirstSidebar();
                    break;
            }
        }
    }

    handleClickOutside(e) {
        this.sidebars.forEach((sidebar) => {
            const { config } = sidebar;
            
            if (window.innerWidth < config.breakpoint && 
                !sidebar.element.contains(e.target) && 
                !sidebar.isHidden) {
                this.hideSidebar(sidebar.id);
            }
        });
    }

    toggleFirstSidebar() {
        const firstSidebar = this.sidebars.values().next().value;
        if (firstSidebar) {
            this.toggleSidebar(firstSidebar.id);
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
        this.sidebars.forEach((sidebar, id) => {
            this.destroySidebar(id);
        });
        this.sidebars.clear();
    }

    destroySidebar(id) {
        const sidebar = this.sidebars.get(id);
        if (!sidebar) return;
        
        this.hideOverlay(sidebar);
        
        const { element } = sidebar;
        element.removeEventListener('click', this.handleAction);
        
        this.sidebars.delete(id);
        return this;
    }
}

// Initialize sidebar manager
document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});

// Global access
window.SidebarManager = SidebarManager;
