/**
 * Angkor Compliance Platform - Dropdown Menu System JavaScript 2025
 * 
 * Modern dropdown menu system with 2025 design patterns,
 * accessibility support, and responsive design.
 */

class DropdownManager {
    constructor() {
        this.dropdowns = new Map();
        this.activeDropdown = null;
        this.config = {
            animation: true,
            delay: 100,
            hideDelay: 100,
            position: 'auto',
            trigger: 'click',
            interactive: false,
            arrow: true,
            maxWidth: 280,
            zIndex: 1000,
            animationDuration: 200,
            animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            boundary: 'viewport',
            offset: 8,
            placement: 'bottom-start'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeDropdowns();
        this.setupAccessibility();
        this.setupKeyboardNavigation();
    }

    setupEventListeners() {
        // Handle click events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.dropdown-toggle')) {
                this.handleToggleClick(e);
            } else if (e.target.closest('.dropdown-item')) {
                this.handleItemClick(e);
            } else {
                this.handleOutsideClick(e);
            }
        });

        // Handle mouse events
        document.addEventListener('mouseenter', (e) => {
            if (e.target.closest('.dropdown-toggle')) {
                this.handleMouseEnter(e);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.closest('.dropdown-toggle')) {
                this.handleMouseLeave(e);
            }
        }, true);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle scroll
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }

    initializeDropdowns() {
        const dropdownElements = document.querySelectorAll('.dropdown');
        
        dropdownElements.forEach((element, index) => {
            const id = element.id || `dropdown-${index}`;
            const toggle = element.querySelector('.dropdown-toggle');
            const menu = element.querySelector('.dropdown-menu');
            
            if (toggle && menu) {
                this.createDropdown(id, element, toggle, menu);
            }
        });
    }

    setupAccessibility() {
        this.dropdowns.forEach((dropdown, id) => {
            const { toggle, menu } = dropdown;
            
            // Add ARIA attributes
            if (!toggle.getAttribute('aria-haspopup')) {
                toggle.setAttribute('aria-haspopup', 'true');
            }
            
            if (!toggle.getAttribute('aria-expanded')) {
                toggle.setAttribute('aria-expanded', 'false');
            }
            
            if (!menu.getAttribute('role')) {
                menu.setAttribute('role', 'menu');
            }
            
            if (!menu.getAttribute('aria-hidden')) {
                menu.setAttribute('aria-hidden', 'true');
            }
            
            // Add ID references
            const menuId = menu.id || `dropdown-menu-${id}`;
            menu.id = menuId;
            toggle.setAttribute('aria-controls', menuId);
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.dropdown-toggle')) {
                this.handleToggleKeydown(e);
            } else if (e.target.closest('.dropdown-menu')) {
                this.handleMenuKeydown(e);
            }
        });
    }

    // Public Methods
    createDropdown(id, element, toggle, menu, options = {}) {
        const config = { ...this.config, ...options };
        
        // Store dropdown
        this.dropdowns.set(id, {
            id,
            element,
            toggle,
            menu,
            config,
            timeout: null,
            hideTimeout: null
        });
        
        return this.dropdowns.get(id);
    }

    showDropdown(id, options = {}) {
        const dropdown = this.dropdowns.get(id);
        if (!dropdown) {
            console.error(`Dropdown with id "${id}" not found`);
            return;
        }
        
        const { toggle, menu, config } = dropdown;
        const dropdownConfig = { ...config, ...options };
        
        // Clear any existing timeouts
        if (dropdown.timeout) {
            clearTimeout(dropdown.timeout);
        }
        if (dropdown.hideTimeout) {
            clearTimeout(dropdown.hideTimeout);
        }
        
        // Set timeout for showing
        dropdown.timeout = setTimeout(() => {
            this.activateDropdown(dropdown, dropdownConfig);
        }, dropdownConfig.delay);
        
        return this;
    }

    hideDropdown(id, options = {}) {
        const dropdown = this.dropdowns.get(id);
        if (!dropdown) {
            console.error(`Dropdown with id "${id}" not found`);
            return;
        }
        
        const { toggle, menu, config } = dropdown;
        const dropdownConfig = { ...config, ...options };
        
        // Clear any existing timeouts
        if (dropdown.timeout) {
            clearTimeout(dropdown.timeout);
        }
        if (dropdown.hideTimeout) {
            clearTimeout(dropdown.hideTimeout);
        }
        
        // Set timeout for hiding
        dropdown.hideTimeout = setTimeout(() => {
            this.deactivateDropdown(dropdown, dropdownConfig);
        }, dropdownConfig.hideDelay);
        
        return this;
    }

    toggleDropdown(id, options = {}) {
        const dropdown = this.dropdowns.get(id);
        if (!dropdown) return;
        
        if (this.activeDropdown && this.activeDropdown.id === id) {
            this.hideDropdown(id, options);
        } else {
            this.showDropdown(id, options);
        }
        
        return this;
    }

    updateDropdown(id, content, options = {}) {
        const dropdown = this.dropdowns.get(id);
        if (!dropdown) {
            console.error(`Dropdown with id "${id}" not found`);
            return;
        }
        
        const { menu } = dropdown;
        
        if (typeof content === 'string') {
            menu.innerHTML = content;
        } else {
            menu.appendChild(content);
        }
        
        // Update position if dropdown is active
        if (this.activeDropdown && this.activeDropdown.id === id) {
            this.positionDropdown(dropdown);
        }
        
        return this;
    }

    destroyDropdown(id) {
        const dropdown = this.dropdowns.get(id);
        if (!dropdown) return;
        
        const { timeout, hideTimeout } = dropdown;
        
        // Clear timeouts
        if (timeout) clearTimeout(timeout);
        if (hideTimeout) clearTimeout(hideTimeout);
        
        // Remove from active dropdown
        if (this.activeDropdown && this.activeDropdown.id === id) {
            this.activeDropdown = null;
        }
        
        // Remove from dropdowns map
        this.dropdowns.delete(id);
        
        return this;
    }

    // Private Methods
    activateDropdown(dropdown, config) {
        const { toggle, menu } = dropdown;
        
        // Hide any existing active dropdown
        if (this.activeDropdown && this.activeDropdown.id !== dropdown.id) {
            this.deactivateDropdown(this.activeDropdown, config);
        }
        
        // Set as active
        this.activeDropdown = dropdown;
        
        // Position dropdown
        this.positionDropdown(dropdown);
        
        // Show dropdown
        this.showDropdownMenu(menu, config);
        
        // Update ARIA attributes
        toggle.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
        
        // Focus first item
        this.focusFirstItem(menu);
        
        // Trigger event
        this.triggerEvent(toggle, 'dropdown:show', { dropdown: config });
    }

    deactivateDropdown(dropdown, config) {
        const { toggle, menu } = dropdown;
        
        // Hide dropdown
        this.hideDropdownMenu(menu, config);
        
        // Update ARIA attributes
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        
        // Remove from active
        if (this.activeDropdown && this.activeDropdown.id === dropdown.id) {
            this.activeDropdown = null;
        }
        
        // Trigger event
        this.triggerEvent(toggle, 'dropdown:hide', { dropdown: config });
    }

    showDropdownMenu(menu, config) {
        menu.classList.add('show');
        
        if (config.animation) {
            menu.style.transition = `opacity ${config.animationDuration}ms ${config.animationEasing}, 
                                   visibility ${config.animationDuration}ms ${config.animationEasing}, 
                                   transform ${config.animationDuration}ms ${config.animationEasing}`;
        }
    }

    hideDropdownMenu(menu, config) {
        menu.classList.remove('show');
        
        if (config.animation) {
            setTimeout(() => {
                menu.style.transition = '';
            }, config.animationDuration);
        }
    }

    positionDropdown(dropdown) {
        const { toggle, menu, config } = dropdown;
        
        // Get toggle and menu dimensions
        const toggleRect = toggle.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // Calculate position
        const position = this.calculatePosition(toggleRect, menuRect, viewport, config);
        
        // Apply position
        this.applyPosition(menu, position, config);
    }

    calculatePosition(toggleRect, menuRect, viewport, config) {
        const { placement, offset, boundary } = config;
        
        let position = { x: 0, y: 0, placement };
        
        // Calculate base position
        switch (placement) {
            case 'bottom-start':
                position.x = toggleRect.left;
                position.y = toggleRect.bottom + offset;
                break;
            case 'bottom-end':
                position.x = toggleRect.right - menuRect.width;
                position.y = toggleRect.bottom + offset;
                break;
            case 'bottom-center':
                position.x = toggleRect.left + (toggleRect.width - menuRect.width) / 2;
                position.y = toggleRect.bottom + offset;
                break;
            case 'top-start':
                position.x = toggleRect.left;
                position.y = toggleRect.top - menuRect.height - offset;
                break;
            case 'top-end':
                position.x = toggleRect.right - menuRect.width;
                position.y = toggleRect.top - menuRect.height - offset;
                break;
            case 'top-center':
                position.x = toggleRect.left + (toggleRect.width - menuRect.width) / 2;
                position.y = toggleRect.top - menuRect.height - offset;
                break;
            case 'left-start':
                position.x = toggleRect.left - menuRect.width - offset;
                position.y = toggleRect.top;
                break;
            case 'left-end':
                position.x = toggleRect.left - menuRect.width - offset;
                position.y = toggleRect.bottom - menuRect.height;
                break;
            case 'right-start':
                position.x = toggleRect.right + offset;
                position.y = toggleRect.top;
                break;
            case 'right-end':
                position.x = toggleRect.right + offset;
                position.y = toggleRect.bottom - menuRect.height;
                break;
            case 'auto':
                position = this.calculateAutoPosition(toggleRect, menuRect, viewport, offset);
                break;
        }
        
        // Adjust for boundary
        if (boundary === 'viewport') {
            position = this.adjustForViewport(position, menuRect, viewport);
        }
        
        return position;
    }

    calculateAutoPosition(toggleRect, menuRect, viewport, offset) {
        const positions = [
            'bottom-start', 'bottom-end', 'bottom-center',
            'top-start', 'top-end', 'top-center',
            'left-start', 'left-end',
            'right-start', 'right-end'
        ];
        
        for (const placement of positions) {
            let position = { x: 0, y: 0, placement };
            
            switch (placement) {
                case 'bottom-start':
                    position.x = toggleRect.left;
                    position.y = toggleRect.bottom + offset;
                    break;
                case 'bottom-end':
                    position.x = toggleRect.right - menuRect.width;
                    position.y = toggleRect.bottom + offset;
                    break;
                case 'bottom-center':
                    position.x = toggleRect.left + (toggleRect.width - menuRect.width) / 2;
                    position.y = toggleRect.bottom + offset;
                    break;
                case 'top-start':
                    position.x = toggleRect.left;
                    position.y = toggleRect.top - menuRect.height - offset;
                    break;
                case 'top-end':
                    position.x = toggleRect.right - menuRect.width;
                    position.y = toggleRect.top - menuRect.height - offset;
                    break;
                case 'top-center':
                    position.x = toggleRect.left + (toggleRect.width - menuRect.width) / 2;
                    position.y = toggleRect.top - menuRect.height - offset;
                    break;
                case 'left-start':
                    position.x = toggleRect.left - menuRect.width - offset;
                    position.y = toggleRect.top;
                    break;
                case 'left-end':
                    position.x = toggleRect.left - menuRect.width - offset;
                    position.y = toggleRect.bottom - menuRect.height;
                    break;
                case 'right-start':
                    position.x = toggleRect.right + offset;
                    position.y = toggleRect.top;
                    break;
                case 'right-end':
                    position.x = toggleRect.right + offset;
                    position.y = toggleRect.bottom - menuRect.height;
                    break;
            }
            
            // Check if position fits in viewport
            if (this.isPositionInViewport(position, menuRect, viewport)) {
                return position;
            }
        }
        
        // Fallback to bottom-start
        return {
            x: toggleRect.left,
            y: toggleRect.bottom + offset,
            placement: 'bottom-start'
        };
    }

    isPositionInViewport(position, menuRect, viewport) {
        return position.x >= 0 && 
               position.y >= 0 && 
               position.x + menuRect.width <= viewport.width && 
               position.y + menuRect.height <= viewport.height;
    }

    adjustForViewport(position, menuRect, viewport) {
        const adjusted = { ...position };
        
        // Adjust horizontal position
        if (adjusted.x < 0) {
            adjusted.x = 0;
        } else if (adjusted.x + menuRect.width > viewport.width) {
            adjusted.x = viewport.width - menuRect.width;
        }
        
        // Adjust vertical position
        if (adjusted.y < 0) {
            adjusted.y = 0;
        } else if (adjusted.y + menuRect.height > viewport.height) {
            adjusted.y = viewport.height - menuRect.height;
        }
        
        return adjusted;
    }

    applyPosition(menu, position, config) {
        // Remove existing position classes
        menu.classList.remove(
            'dropdown-menu-right', 'dropdown-menu-center', 'dropdown-menu-up'
        );
        
        // Add position class based on placement
        if (position.placement.includes('right')) {
            menu.classList.add('dropdown-menu-right');
        } else if (position.placement.includes('center')) {
            menu.classList.add('dropdown-menu-center');
        } else if (position.placement.includes('top')) {
            menu.classList.add('dropdown-menu-up');
        }
        
        // Apply position styles
        menu.style.position = 'fixed';
        menu.style.left = `${position.x}px`;
        menu.style.top = `${position.y}px`;
        menu.style.zIndex = config.zIndex;
    }

    focusFirstItem(menu) {
        const firstItem = menu.querySelector('.dropdown-item:not(.disabled)');
        if (firstItem) {
            firstItem.focus();
        }
    }

    // Event Handlers
    handleToggleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const toggle = e.target.closest('.dropdown-toggle');
        const dropdown = this.findDropdownByToggle(toggle);
        if (!dropdown) return;
        
        const { config } = dropdown;
        if (config.trigger === 'click') {
            this.toggleDropdown(dropdown.id);
        }
    }

    handleItemClick(e) {
        const item = e.target.closest('.dropdown-item');
        if (!item) return;
        
        const dropdown = this.findDropdownByItem(item);
        if (!dropdown) return;
        
        const { config } = dropdown;
        
        // Don't close if item is disabled
        if (item.classList.contains('disabled')) {
            e.preventDefault();
            return;
        }
        
        // Don't close if item has data-keep-open attribute
        if (item.hasAttribute('data-keep-open')) {
            e.preventDefault();
            return;
        }
        
        // Close dropdown
        this.hideDropdown(dropdown.id);
        
        // Trigger event
        this.triggerEvent(item, 'dropdown:item:click', { 
            dropdown: config, 
            item: item 
        });
    }

    handleOutsideClick(e) {
        if (this.activeDropdown) {
            const { element } = this.activeDropdown;
            if (!element.contains(e.target)) {
                this.hideDropdown(this.activeDropdown.id);
            }
        }
    }

    handleMouseEnter(e) {
        const toggle = e.target.closest('.dropdown-toggle');
        const dropdown = this.findDropdownByToggle(toggle);
        if (!dropdown) return;
        
        const { config } = dropdown;
        if (config.trigger === 'hover') {
            this.showDropdown(dropdown.id);
        }
    }

    handleMouseLeave(e) {
        const toggle = e.target.closest('.dropdown-toggle');
        const dropdown = this.findDropdownByToggle(toggle);
        if (!dropdown) return;
        
        const { config } = dropdown;
        if (config.trigger === 'hover') {
            this.hideDropdown(dropdown.id);
        }
    }

    handleToggleKeydown(e) {
        const toggle = e.target.closest('.dropdown-toggle');
        const dropdown = this.findDropdownByToggle(toggle);
        if (!dropdown) return;
        
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.toggleDropdown(dropdown.id);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.showDropdown(dropdown.id);
                break;
            case 'Escape':
                if (this.activeDropdown && this.activeDropdown.id === dropdown.id) {
                    this.hideDropdown(dropdown.id);
                }
                break;
        }
    }

    handleMenuKeydown(e) {
        const menu = e.target.closest('.dropdown-menu');
        const dropdown = this.findDropdownByMenu(menu);
        if (!dropdown) return;
        
        const { menu: dropdownMenu } = dropdown;
        const items = Array.from(dropdownMenu.querySelectorAll('.dropdown-item:not(.disabled)'));
        const currentIndex = items.indexOf(e.target);
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                items[nextIndex].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                items[prevIndex].focus();
                break;
            case 'Home':
                e.preventDefault();
                items[0].focus();
                break;
            case 'End':
                e.preventDefault();
                items[items.length - 1].focus();
                break;
            case 'Escape':
                e.preventDefault();
                this.hideDropdown(dropdown.id);
                dropdown.toggle.focus();
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                e.target.click();
                break;
        }
    }

    handleResize() {
        if (this.activeDropdown) {
            this.positionDropdown(this.activeDropdown);
        }
    }

    handleScroll() {
        if (this.activeDropdown) {
            this.positionDropdown(this.activeDropdown);
        }
    }

    // Utility Methods
    findDropdownByToggle(toggle) {
        for (const dropdown of this.dropdowns.values()) {
            if (dropdown.toggle === toggle) {
                return dropdown;
            }
        }
        return null;
    }

    findDropdownByItem(item) {
        for (const dropdown of this.dropdowns.values()) {
            if (dropdown.menu.contains(item)) {
                return dropdown;
            }
        }
        return null;
    }

    findDropdownByMenu(menu) {
        for (const dropdown of this.dropdowns.values()) {
            if (dropdown.menu === menu) {
                return dropdown;
            }
        }
        return null;
    }

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
        this.dropdowns.forEach((dropdown, id) => {
            this.destroyDropdown(id);
        });
        this.dropdowns.clear();
        this.activeDropdown = null;
    }
}

// Initialize dropdown manager
document.addEventListener('DOMContentLoaded', () => {
    window.dropdownManager = new DropdownManager();
});

// Global access
window.DropdownManager = DropdownManager;
