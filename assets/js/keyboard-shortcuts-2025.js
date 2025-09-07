/**
 * Angkor Compliance Platform - Keyboard Shortcuts JavaScript 2025
 * Keyboard shortcuts with visual feedback
 */

class KeyboardShortcutsManager {
    constructor() {
        this.shortcuts = new Map();
        this.config = {
            enableVisualFeedback: true,
            enableSoundFeedback: false,
            enableHapticFeedback: false,
            enableAnimations: true,
            enableGlassmorphism: true,
            enableNeumorphism: false,
            enableDarkMode: true,
            enableResponsive: true,
            enableAccessibility: true,
            animationDuration: 300,
            feedbackDuration: 1000,
            keyPressDelay: 100
        };
        this.shortcutsList = [
            {
                category: 'Navigation',
                shortcuts: [
                    { keys: ['Ctrl', 'K'], description: 'Open search', action: 'search' },
                    { keys: ['Ctrl', 'H'], description: 'Go to home', action: 'home' },
                    { keys: ['Ctrl', 'B'], description: 'Toggle sidebar', action: 'sidebar' },
                    { keys: ['Ctrl', 'N'], description: 'New item', action: 'new' },
                    { keys: ['Ctrl', 'E'], description: 'Edit current item', action: 'edit' }
                ]
            },
            {
                category: 'Actions',
                shortcuts: [
                    { keys: ['Ctrl', 'S'], description: 'Save changes', action: 'save' },
                    { keys: ['Ctrl', 'Z'], description: 'Undo last action', action: 'undo' },
                    { keys: ['Ctrl', 'Y'], description: 'Redo last action', action: 'redo' },
                    { keys: ['Ctrl', 'D'], description: 'Delete item', action: 'delete' },
                    { keys: ['Ctrl', 'C'], description: 'Copy item', action: 'copy' },
                    { keys: ['Ctrl', 'V'], description: 'Paste item', action: 'paste' }
                ]
            },
            {
                category: 'Interface',
                shortcuts: [
                    { keys: ['Ctrl', 'T'], description: 'Toggle theme', action: 'theme' },
                    { keys: ['Ctrl', 'M'], description: 'Toggle dark mode', action: 'dark-mode' },
                    { keys: ['Ctrl', 'F'], description: 'Toggle fullscreen', action: 'fullscreen' },
                    { keys: ['Ctrl', 'I'], description: 'Toggle inspector', action: 'inspector' },
                    { keys: ['Ctrl', '?'], description: 'Show shortcuts', action: 'shortcuts' }
                ]
            },
            {
                category: 'Role Switching',
                shortcuts: [
                    { keys: ['Ctrl', '1'], description: 'Switch to Worker', action: 'role-worker' },
                    { keys: ['Ctrl', '2'], description: 'Switch to Factory Admin', action: 'role-factory-admin' },
                    { keys: ['Ctrl', '3'], description: 'Switch to HR Staff', action: 'role-hr-staff' },
                    { keys: ['Ctrl', '4'], description: 'Switch to Grievance Committee', action: 'role-grievance-committee' },
                    { keys: ['Ctrl', '5'], description: 'Switch to Auditor', action: 'role-auditor' },
                    { keys: ['Ctrl', '6'], description: 'Switch to Analytics', action: 'role-analytics' },
                    { keys: ['Ctrl', '7'], description: 'Switch to Super Admin', action: 'role-super-admin' }
                ]
            }
        ];
        this.pressedKeys = new Set();
        this.shortcutsModal = null;
        this.indicator = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createShortcutsModal();
        this.createIndicator();
        this.registerShortcuts();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        document.addEventListener('click', (e) => this.handleClick(e));
    }

    createShortcutsModal() {
        const modal = document.createElement('div');
        modal.className = 'keyboard-shortcuts';
        modal.innerHTML = this.renderShortcutsModal();
        document.body.appendChild(modal);
        this.shortcutsModal = modal;
    }

    createIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'keyboard-shortcuts-indicator';
        indicator.innerHTML = this.renderIndicator();
        document.body.appendChild(indicator);
        this.indicator = indicator;
    }

    renderShortcutsModal() {
        return `
            <div class="keyboard-shortcuts-content">
                <div class="keyboard-shortcuts-header">
                    <h2 class="keyboard-shortcuts-title">Keyboard Shortcuts</h2>
                    <button class="keyboard-shortcuts-close" data-action="close">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="keyboard-shortcuts-sections">
                    ${this.shortcutsList.map(section => this.renderShortcutsSection(section)).join('')}
                </div>
            </div>
        `;
    }

    renderShortcutsSection(section) {
        return `
            <div class="keyboard-shortcuts-section">
                <h3 class="keyboard-shortcuts-section-title">${section.category}</h3>
                <div class="keyboard-shortcuts-list">
                    ${section.shortcuts.map(shortcut => this.renderShortcutItem(shortcut)).join('')}
                </div>
            </div>
        `;
    }

    renderShortcutItem(shortcut) {
        return `
            <div class="keyboard-shortcuts-item">
                <p class="keyboard-shortcuts-item-description">${shortcut.description}</p>
                <div class="keyboard-shortcuts-item-keys">
                    ${shortcut.keys.map((key, index) => `
                        ${index > 0 ? '<span class="keyboard-shortcuts-key plus">+</span>' : ''}
                        <span class="keyboard-shortcuts-key" data-key="${key.toLowerCase()}">${key}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderIndicator() {
        return `
            <p class="keyboard-shortcuts-indicator-text">
                <span class="keyboard-shortcuts-indicator-key" data-key="ctrl">Ctrl</span>
                <span class="keyboard-shortcuts-key plus">+</span>
                <span class="keyboard-shortcuts-indicator-key" data-key="k">K</span>
                <span>for shortcuts</span>
            </p>
        `;
    }

    registerShortcuts() {
        this.shortcutsList.forEach(section => {
            section.shortcuts.forEach(shortcut => {
                const key = shortcut.keys.join('+').toLowerCase();
                this.shortcuts.set(key, shortcut);
            });
        });
    }

    handleKeyDown(e) {
        const key = this.getKeyName(e);
        this.pressedKeys.add(key);
        
        if (this.config.enableVisualFeedback) {
            this.showKeyPress(key);
        }
        
        if (this.config.enableSoundFeedback) {
            this.playSound('key-press');
        }
        
        if (this.config.enableHapticFeedback) {
            this.triggerHaptic('key-press');
        }
        
        this.checkShortcut();
    }

    handleKeyUp(e) {
        const key = this.getKeyName(e);
        this.pressedKeys.delete(key);
        
        if (this.config.enableVisualFeedback) {
            this.hideKeyPress(key);
        }
    }

    handleClick(e) {
        if (!this.shortcutsModal || !this.shortcutsModal.classList.contains('active')) return;
        
        const action = e.target.getAttribute('data-action');
        if (action) {
            e.preventDefault();
            this.handleAction(action);
            return;
        }
        
        // Close on overlay click
        if (e.target === this.shortcutsModal) {
            this.hideShortcuts();
        }
    }

    handleAction(action) {
        switch (action) {
            case 'close':
                this.hideShortcuts();
                break;
        }
    }

    checkShortcut() {
        const shortcutKey = Array.from(this.pressedKeys).sort().join('+');
        const shortcut = this.shortcuts.get(shortcutKey);
        
        if (shortcut) {
            this.executeShortcut(shortcut);
        }
    }

    executeShortcut(shortcut) {
        switch (shortcut.action) {
            case 'search':
                this.openSearch();
                break;
            case 'home':
                this.goHome();
                break;
            case 'sidebar':
                this.toggleSidebar();
                break;
            case 'new':
                this.createNew();
                break;
            case 'edit':
                this.editCurrent();
                break;
            case 'save':
                this.saveChanges();
                break;
            case 'undo':
                this.undoAction();
                break;
            case 'redo':
                this.redoAction();
                break;
            case 'delete':
                this.deleteItem();
                break;
            case 'copy':
                this.copyItem();
                break;
            case 'paste':
                this.pasteItem();
                break;
            case 'theme':
                this.toggleTheme();
                break;
            case 'dark-mode':
                this.toggleDarkMode();
                break;
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            case 'inspector':
                this.toggleInspector();
                break;
            case 'shortcuts':
                this.showShortcuts();
                break;
            case 'role-worker':
                this.switchRole('worker');
                break;
            case 'role-factory-admin':
                this.switchRole('factory-admin');
                break;
            case 'role-hr-staff':
                this.switchRole('hr-staff');
                break;
            case 'role-grievance-committee':
                this.switchRole('grievance-committee');
                break;
            case 'role-auditor':
                this.switchRole('auditor');
                break;
            case 'role-analytics':
                this.switchRole('analytics');
                break;
            case 'role-super-admin':
                this.switchRole('super-admin');
                break;
        }
        
        this.triggerEvent('keyboard-shortcut:execute', { shortcut });
    }

    showKeyPress(key) {
        const keyElements = document.querySelectorAll(`[data-key="${key.toLowerCase()}"]`);
        keyElements.forEach(element => {
            element.classList.add('active');
        });
    }

    hideKeyPress(key) {
        const keyElements = document.querySelectorAll(`[data-key="${key.toLowerCase()}"]`);
        keyElements.forEach(element => {
            element.classList.remove('active');
        });
    }

    showShortcuts() {
        if (!this.shortcutsModal) return;
        
        this.shortcutsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        this.triggerEvent('keyboard-shortcuts:show');
    }

    hideShortcuts() {
        if (!this.shortcutsModal) return;
        
        this.shortcutsModal.classList.remove('active');
        document.body.style.overflow = '';
        
        this.triggerEvent('keyboard-shortcuts:hide');
    }

    showIndicator() {
        if (!this.indicator) return;
        
        this.indicator.classList.add('active');
        
        setTimeout(() => {
            this.hideIndicator();
        }, this.config.feedbackDuration);
    }

    hideIndicator() {
        if (!this.indicator) return;
        
        this.indicator.classList.remove('active');
    }

    // Shortcut Actions
    openSearch() {
        // Implement search functionality
        this.triggerEvent('keyboard-shortcut:search');
    }

    goHome() {
        window.location.href = '/';
        this.triggerEvent('keyboard-shortcut:home');
    }

    toggleSidebar() {
        // Implement sidebar toggle
        this.triggerEvent('keyboard-shortcut:sidebar');
    }

    createNew() {
        // Implement new item creation
        this.triggerEvent('keyboard-shortcut:new');
    }

    editCurrent() {
        // Implement edit current item
        this.triggerEvent('keyboard-shortcut:edit');
    }

    saveChanges() {
        // Implement save changes
        this.triggerEvent('keyboard-shortcut:save');
    }

    undoAction() {
        // Implement undo action
        this.triggerEvent('keyboard-shortcut:undo');
    }

    redoAction() {
        // Implement redo action
        this.triggerEvent('keyboard-shortcut:redo');
    }

    deleteItem() {
        // Implement delete item
        this.triggerEvent('keyboard-shortcut:delete');
    }

    copyItem() {
        // Implement copy item
        this.triggerEvent('keyboard-shortcut:copy');
    }

    pasteItem() {
        // Implement paste item
        this.triggerEvent('keyboard-shortcut:paste');
    }

    toggleTheme() {
        if (window.themePreviewManager) {
            window.themePreviewManager.open();
        }
        this.triggerEvent('keyboard-shortcut:theme');
    }

    toggleDarkMode() {
        if (window.darkModeManager) {
            window.darkModeManager.toggle();
        }
        this.triggerEvent('keyboard-shortcut:dark-mode');
    }

    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
        this.triggerEvent('keyboard-shortcut:fullscreen');
    }

    toggleInspector() {
        // Implement inspector toggle
        this.triggerEvent('keyboard-shortcut:inspector');
    }

    switchRole(role) {
        if (window.roleSwitchingManager) {
            window.roleSwitchingManager.switchRole(role);
        }
        this.triggerEvent('keyboard-shortcut:role', { role });
    }

    // Utility Methods
    getKeyName(e) {
        if (e.ctrlKey) return 'ctrl';
        if (e.metaKey) return 'cmd';
        if (e.altKey) return 'alt';
        if (e.shiftKey) return 'shift';
        return e.key.toLowerCase();
    }

    playSound(type) {
        // Implement sound feedback
        this.triggerEvent('keyboard-shortcut:sound', { type });
    }

    triggerHaptic(type) {
        // Implement haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        this.triggerEvent('keyboard-shortcut:haptic', { type });
    }

    triggerEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    // Public Methods
    addShortcut(keys, description, action) {
        const key = keys.join('+').toLowerCase();
        this.shortcuts.set(key, { keys, description, action });
    }

    removeShortcut(keys) {
        const key = keys.join('+').toLowerCase();
        this.shortcuts.delete(key);
    }

    getShortcuts() {
        return [...this.shortcuts.values()];
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
        if (this.shortcutsModal) {
            this.shortcutsModal.remove();
            this.shortcutsModal = null;
        }
        
        if (this.indicator) {
            this.indicator.remove();
            this.indicator = null;
        }
        
        this.shortcuts.clear();
    }
}

// Initialize keyboard shortcuts manager
document.addEventListener('DOMContentLoaded', () => {
    window.keyboardShortcutsManager = new KeyboardShortcutsManager();
});

// Global access
window.KeyboardShortcutsManager = KeyboardShortcutsManager;
