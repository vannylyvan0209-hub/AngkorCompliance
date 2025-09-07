/**
 * Angkor Compliance Platform - Dark Mode JavaScript 2025
 * 
 * Comprehensive dark mode functionality with automatic detection,
 * manual toggle, and seamless theme switching.
 */

class DarkModeManager {
    constructor() {
        this.theme = this.getStoredTheme() || this.getSystemTheme();
        this.toggle = null;
        this.init();
    }

    /**
     * Initialize dark mode system
     */
    init() {
        this.setupToggle();
        this.applyTheme(this.theme);
        this.setupSystemThemeListener();
        this.setupKeyboardShortcuts();
        this.setupStorageListener();
    }

    /**
     * Setup dark mode toggle button
     */
    setupToggle() {
        this.toggle = document.querySelector('.dark-mode-toggle');
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleTheme());
            this.updateToggleState();
        }
    }

    /**
     * Get stored theme from localStorage
     */
    getStoredTheme() {
        try {
            return localStorage.getItem('angkor-theme');
        } catch (e) {
            console.warn('Unable to access localStorage:', e);
            return null;
        }
    }

    /**
     * Get system theme preference
     */
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        const body = document.body;
        const html = document.documentElement;

        // Remove existing theme classes
        body.classList.remove('dark-mode', 'light-mode');
        html.classList.remove('dark-mode', 'light-mode');

        // Apply new theme
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            html.classList.add('dark-mode');
        } else if (theme === 'light') {
            body.classList.add('light-mode');
            html.classList.add('light-mode');
        }

        // Update meta theme-color
        this.updateMetaThemeColor(theme);

        // Update toggle state
        this.updateToggleState();

        // Store theme preference
        this.storeTheme(theme);

        // Dispatch theme change event
        this.dispatchThemeChangeEvent(theme);
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    /**
     * Set specific theme
     */
    setTheme(theme) {
        if (theme === 'system') {
            this.theme = this.getSystemTheme();
        } else {
            this.theme = theme;
        }
        this.applyTheme(this.theme);
    }

    /**
     * Update toggle button state
     */
    updateToggleState() {
        if (!this.toggle) return;

        const isDark = this.theme === 'dark';
        const isLight = this.theme === 'light';
        const isSystem = this.theme === 'system';

        // Update toggle classes
        this.toggle.classList.toggle('active', isDark);
        this.toggle.setAttribute('data-theme', this.theme);

        // Update toggle text/aria-label
        const toggleText = this.toggle.querySelector('.toggle-text');
        const toggleIcon = this.toggle.querySelector('.toggle-icon');
        
        if (toggleText) {
            if (isDark) {
                toggleText.textContent = 'Dark Mode';
            } else if (isLight) {
                toggleText.textContent = 'Light Mode';
            } else {
                toggleText.textContent = 'System Theme';
            }
        }

        if (toggleIcon) {
            if (isDark) {
                toggleIcon.innerHTML = '<i data-lucide="moon"></i>';
            } else if (isLight) {
                toggleIcon.innerHTML = '<i data-lucide="sun"></i>';
            } else {
                toggleIcon.innerHTML = '<i data-lucide="monitor"></i>';
            }
            
            // Reinitialize Lucide icons
            if (window.lucide) {
                lucide.createIcons();
            }
        }

        // Update aria-label
        this.toggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    }

    /**
     * Update meta theme-color for mobile browsers
     */
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }

        if (theme === 'dark') {
            metaThemeColor.content = '#0a0a0a';
        } else {
            metaThemeColor.content = '#ffffff';
        }
    }

    /**
     * Store theme preference in localStorage
     */
    storeTheme(theme) {
        try {
            localStorage.setItem('angkor-theme', theme);
        } catch (e) {
            console.warn('Unable to store theme preference:', e);
        }
    }

    /**
     * Setup system theme change listener
     */
    setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (this.theme === 'system') {
                    this.applyTheme(this.getSystemTheme());
                }
            });
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + D to toggle dark mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Ctrl/Cmd + Shift + L to set light mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                this.setTheme('light');
            }
            
            // Ctrl/Cmd + Shift + K to set dark mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'K') {
                e.preventDefault();
                this.setTheme('dark');
            }
            
            // Ctrl/Cmd + Shift + S to set system theme
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.setTheme('system');
            }
        });
    }

    /**
     * Setup storage listener for cross-tab synchronization
     */
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'angkor-theme' && e.newValue !== this.theme) {
                this.theme = e.newValue;
                this.applyTheme(this.theme);
            }
        });
    }

    /**
     * Dispatch theme change event
     */
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themechange', {
            detail: {
                theme: theme,
                isDark: theme === 'dark',
                isLight: theme === 'light',
                isSystem: theme === 'system'
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.theme;
    }

    /**
     * Check if dark mode is active
     */
    isDarkMode() {
        return this.theme === 'dark';
    }

    /**
     * Check if light mode is active
     */
    isLightMode() {
        return this.theme === 'light';
    }

    /**
     * Check if system theme is active
     */
    isSystemTheme() {
        return this.theme === 'system';
    }

    /**
     * Get effective theme (resolves system theme to actual theme)
     */
    getEffectiveTheme() {
        if (this.theme === 'system') {
            return this.getSystemTheme();
        }
        return this.theme;
    }

    /**
     * Check if effective theme is dark
     */
    isEffectiveDarkMode() {
        return this.getEffectiveTheme() === 'dark';
    }

    /**
     * Check if effective theme is light
     */
    isEffectiveLightMode() {
        return this.getEffectiveTheme() === 'light';
    }

    /**
     * Add theme change listener
     */
    onThemeChange(callback) {
        document.addEventListener('themechange', callback);
    }

    /**
     * Remove theme change listener
     */
    offThemeChange(callback) {
        document.removeEventListener('themechange', callback);
    }

    /**
     * Create dark mode toggle button
     */
    createToggleButton(options = {}) {
        const {
            size = 'md',
            showText = true,
            showIcon = true,
            position = 'fixed',
            top = '20px',
            right = '20px',
            zIndex = 1000
        } = options;

        const toggle = document.createElement('button');
        toggle.className = `dark-mode-toggle dark-mode-toggle-${size}`;
        toggle.setAttribute('aria-label', 'Toggle dark mode');
        toggle.setAttribute('title', 'Toggle dark mode (Ctrl+Shift+D)');

        if (position === 'fixed') {
            toggle.style.position = 'fixed';
            toggle.style.top = top;
            toggle.style.right = right;
            toggle.style.zIndex = zIndex;
        }

        let content = '';
        
        if (showIcon) {
            content += '<div class="dark-mode-icon sun"><i data-lucide="sun"></i></div>';
            content += '<div class="dark-mode-icon moon"><i data-lucide="moon"></i></div>';
        }
        
        if (showText) {
            content += '<span class="toggle-text">Light Mode</span>';
        }
        
        content += '<div class="dark-mode-switch"></div>';
        
        toggle.innerHTML = content;

        // Add to DOM
        document.body.appendChild(toggle);

        // Setup toggle
        this.toggle = toggle;
        this.setupToggle();
        this.updateToggleState();

        return toggle;
    }

    /**
     * Create theme selector dropdown
     */
    createThemeSelector(options = {}) {
        const {
            container = document.body,
            position = 'relative'
        } = options;

        const selector = document.createElement('div');
        selector.className = 'theme-selector';
        selector.style.position = position;

        const label = document.createElement('label');
        label.textContent = 'Theme:';
        label.style.marginRight = '8px';
        label.style.fontSize = '14px';
        label.style.color = 'var(--neutral-600)';

        const select = document.createElement('select');
        select.className = 'theme-select';
        select.style.background = 'var(--glass-bg)';
        select.style.border = '1px solid var(--glass-border)';
        select.style.borderRadius = 'var(--radius-md)';
        select.style.padding = '8px 12px';
        select.style.fontSize = '14px';
        select.style.color = 'var(--neutral-700)';

        const lightOption = document.createElement('option');
        lightOption.value = 'light';
        lightOption.textContent = 'Light';

        const darkOption = document.createElement('option');
        darkOption.value = 'dark';
        darkOption.textContent = 'Dark';

        const systemOption = document.createElement('option');
        systemOption.value = 'system';
        systemOption.textContent = 'System';

        select.appendChild(lightOption);
        select.appendChild(darkOption);
        select.appendChild(systemOption);

        select.addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        selector.appendChild(label);
        selector.appendChild(select);

        container.appendChild(selector);

        // Update select value
        select.value = this.theme;

        return selector;
    }

    /**
     * Initialize theme for specific elements
     */
    initializeElementTheme(element) {
        if (!element) return;

        const isDark = this.isEffectiveDarkMode();
        
        // Add theme class to element
        element.classList.toggle('dark-mode', isDark);
        element.classList.toggle('light-mode', !isDark);

        // Update element attributes
        element.setAttribute('data-theme', this.getEffectiveTheme());
        element.setAttribute('data-dark-mode', isDark);
    }

    /**
     * Update all elements with theme classes
     */
    updateAllElements() {
        const elements = document.querySelectorAll('[data-theme-aware]');
        elements.forEach(element => {
            this.initializeElementTheme(element);
        });
    }

    /**
     * Destroy dark mode manager
     */
    destroy() {
        if (this.toggle) {
            this.toggle.removeEventListener('click', this.toggleTheme);
        }
        
        // Remove event listeners
        window.removeEventListener('storage', this.setupStorageListener);
        
        // Remove theme classes
        document.body.classList.remove('dark-mode', 'light-mode');
        document.documentElement.classList.remove('dark-mode', 'light-mode');
    }
}

// Initialize dark mode manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.darkModeManager = new DarkModeManager();
    
    // Update all theme-aware elements
    window.darkModeManager.updateAllElements();
    
    // Listen for theme changes to update elements
    window.darkModeManager.onThemeChange(() => {
        window.darkModeManager.updateAllElements();
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DarkModeManager;
}

// Global access
window.DarkModeManager = DarkModeManager;
