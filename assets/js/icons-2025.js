/**
 * Angkor Compliance Platform - Icon System JavaScript 2025
 * 
 * Lucide icon management and icon system functionality.
 */

class IconManager {
    constructor() {
        this.iconCache = new Map();
        this.init();
    }

    init() {
        this.setupLucideIcons();
        this.setupIconEvents();
        this.setupIconAnimations();
    }

    setupLucideIcons() {
        // Initialize Lucide icons if available
        if (window.lucide) {
            lucide.createIcons();
        } else {
            // Fallback: Load Lucide icons dynamically
            this.loadLucideIcons();
        }
    }

    loadLucideIcons() {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/lucide@latest/dist/umd/lucide.js';
        script.onload = () => {
            if (window.lucide) {
                lucide.createIcons();
            }
        };
        document.head.appendChild(script);
    }

    setupIconEvents() {
        // Icon button click events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.icon-btn, .icon-btn *')) {
                const iconBtn = e.target.closest('.icon-btn');
                if (iconBtn) {
                    this.handleIconButtonClick(iconBtn, e);
                }
            }
        });

        // Icon hover events
        document.addEventListener('mouseenter', (e) => {
            if (e.target.matches('.icon-hover, .icon-hover *')) {
                const icon = e.target.closest('.icon-hover');
                if (icon) {
                    this.handleIconHover(icon, 'enter');
                }
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.matches('.icon-hover, .icon-hover *')) {
                const icon = e.target.closest('.icon-hover');
                if (icon) {
                    this.handleIconHover(icon, 'leave');
                }
            }
        }, true);
    }

    setupIconAnimations() {
        // Setup icon animations based on data attributes
        const animatedIcons = document.querySelectorAll('[data-icon-animation]');
        animatedIcons.forEach(icon => {
            const animation = icon.dataset.iconAnimation;
            this.addIconAnimation(icon, animation);
        });
    }

    handleIconButtonClick(iconBtn, event) {
        // Add click animation
        iconBtn.classList.add('icon-active');
        setTimeout(() => {
            iconBtn.classList.remove('icon-active');
        }, 150);

        // Trigger custom event
        const customEvent = new CustomEvent('iconButtonClick', {
            detail: {
                element: iconBtn,
                originalEvent: event
            }
        });
        iconBtn.dispatchEvent(customEvent);
    }

    handleIconHover(icon, type) {
        if (type === 'enter') {
            icon.classList.add('icon-hover-active');
        } else {
            icon.classList.remove('icon-hover-active');
        }
    }

    addIconAnimation(icon, animation) {
        icon.classList.add(`icon-${animation}`);
    }

    removeIconAnimation(icon, animation) {
        icon.classList.remove(`icon-${animation}`);
    }

    // Icon creation methods
    createIcon(name, options = {}) {
        const {
            size = 'md',
            color = 'neutral',
            variant = 'outline',
            animation = null,
            className = ''
        } = options;

        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', name);
        icon.className = `icon icon-${size} icon-${color} icon-${variant} ${className}`;

        if (animation) {
            icon.classList.add(`icon-${animation}`);
        }

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        return icon;
    }

    createIconButton(name, options = {}) {
        const {
            size = 'md',
            variant = 'ghost',
            color = 'neutral',
            animation = null,
            className = '',
            tooltip = null,
            badge = null
        } = options;

        const button = document.createElement('button');
        button.className = `icon-btn icon-btn-${size} icon-btn-${variant} ${className}`;
        button.type = 'button';

        const icon = this.createIcon(name, { size, color, animation });
        button.appendChild(icon);

        if (tooltip) {
            button.setAttribute('data-tooltip', tooltip);
            button.classList.add('icon-tooltip');
        }

        if (badge) {
            button.setAttribute('data-badge', badge);
            button.classList.add('icon-badge');
        }

        return button;
    }

    createIconGroup(icons, options = {}) {
        const {
            className = '',
            gap = 'sm'
        } = options;

        const group = document.createElement('div');
        group.className = `icon-group icon-group-${gap} ${className}`;

        icons.forEach(iconConfig => {
            const icon = this.createIcon(iconConfig.name, iconConfig.options || {});
            group.appendChild(icon);
        });

        return group;
    }

    createIconStack(icons, options = {}) {
        const {
            className = '',
            size = 'md'
        } = options;

        const stack = document.createElement('div');
        stack.className = `icon-stack icon-stack-${size} ${className}`;

        icons.forEach(iconConfig => {
            const icon = this.createIcon(iconConfig.name, {
                ...iconConfig.options,
                size
            });
            stack.appendChild(icon);
        });

        return stack;
    }

    // Icon utility methods
    updateIcon(icon, newName) {
        icon.setAttribute('data-lucide', newName);
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    updateIconColor(icon, color) {
        icon.className = icon.className.replace(/icon-\w+/, `icon-${color}`);
    }

    updateIconSize(icon, size) {
        icon.className = icon.className.replace(/icon-\w+/, `icon-${size}`);
    }

    updateIconVariant(icon, variant) {
        icon.className = icon.className.replace(/icon-\w+/, `icon-${variant}`);
    }

    addIconAnimation(icon, animation) {
        icon.classList.add(`icon-${animation}`);
    }

    removeIconAnimation(icon, animation) {
        icon.classList.remove(`icon-${animation}`);
    }

    // Icon validation
    validateIcon(name) {
        // Common Lucide icon names for validation
        const validIcons = [
            'user', 'users', 'building', 'home', 'settings', 'search', 'menu',
            'x', 'check', 'plus', 'minus', 'edit', 'trash', 'save', 'download',
            'upload', 'share', 'copy', 'link', 'external-link', 'mail', 'phone',
            'calendar', 'clock', 'map-pin', 'globe', 'shield', 'lock', 'unlock',
            'eye', 'eye-off', 'heart', 'star', 'bookmark', 'flag', 'tag',
            'filter', 'sort', 'grid', 'list', 'layout', 'sidebar', 'panel',
            'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
            'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'rotate',
            'refresh', 'reload', 'play', 'pause', 'stop', 'skip-forward',
            'skip-back', 'volume', 'volume-x', 'mic', 'mic-off', 'camera',
            'image', 'file', 'folder', 'database', 'server', 'cloud', 'wifi',
            'bluetooth', 'battery', 'power', 'monitor', 'smartphone', 'tablet',
            'laptop', 'desktop', 'printer', 'scanner', 'keyboard', 'mouse',
            'headphones', 'speaker', 'tv', 'radio', 'gamepad', 'controller'
        ];

        return validIcons.includes(name);
    }

    // Icon search and filtering
    searchIcons(query) {
        const allIcons = document.querySelectorAll('[data-lucide]');
        const results = [];

        allIcons.forEach(icon => {
            const iconName = icon.getAttribute('data-lucide');
            if (iconName.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    element: icon,
                    name: iconName
                });
            }
        });

        return results;
    }

    // Icon statistics
    getIconStats() {
        const allIcons = document.querySelectorAll('[data-lucide]');
        const stats = {
            total: allIcons.length,
            byName: {},
            bySize: {},
            byColor: {},
            byVariant: {}
        };

        allIcons.forEach(icon => {
            const name = icon.getAttribute('data-lucide');
            const size = icon.className.match(/icon-(\w+)/)?.[1] || 'md';
            const color = icon.className.match(/icon-(\w+)/)?.[1] || 'neutral';
            const variant = icon.className.match(/icon-(\w+)/)?.[1] || 'outline';

            stats.byName[name] = (stats.byName[name] || 0) + 1;
            stats.bySize[size] = (stats.bySize[size] || 0) + 1;
            stats.byColor[color] = (stats.byColor[color] || 0) + 1;
            stats.byVariant[variant] = (stats.byVariant[variant] || 0) + 1;
        });

        return stats;
    }

    // Public API
    createIcon(name, options = {}) {
        return this.createIcon(name, options);
    }

    createIconButton(name, options = {}) {
        return this.createIconButton(name, options);
    }

    createIconGroup(icons, options = {}) {
        return this.createIconGroup(icons, options);
    }

    createIconStack(icons, options = {}) {
        return this.createIconStack(icons, options);
    }

    updateIcon(icon, newName) {
        this.updateIcon(icon, newName);
    }

    updateIconColor(icon, color) {
        this.updateIconColor(icon, color);
    }

    updateIconSize(icon, size) {
        this.updateIconSize(icon, size);
    }

    updateIconVariant(icon, variant) {
        this.updateIconVariant(icon, variant);
    }

    addIconAnimation(icon, animation) {
        this.addIconAnimation(icon, animation);
    }

    removeIconAnimation(icon, animation) {
        this.removeIconAnimation(icon, animation);
    }

    validateIcon(name) {
        return this.validateIcon(name);
    }

    searchIcons(query) {
        return this.searchIcons(query);
    }

    getIconStats() {
        return this.getIconStats();
    }
}

// Initialize icon manager
document.addEventListener('DOMContentLoaded', () => {
    window.iconManager = new IconManager();
});

// Global access
window.IconManager = IconManager;
