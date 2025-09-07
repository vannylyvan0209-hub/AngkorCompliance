/**
 * Angkor Compliance Platform - PWA Features JavaScript 2025
 * Progressive Web App features with 2025 design system styling
 */

class PWAFeaturesManager {
    constructor() {
        this.config = {
            enableInstallPrompt: true,
            enableUpdatePrompt: true,
            enableOfflineIndicator: true,
            enableSyncIndicator: true,
            enableLoadingScreen: true,
            enableAnimations: true,
            enableGlassmorphism: true,
            enableNeumorphism: false,
            enableDarkMode: true,
            enableResponsive: true,
            enableAccessibility: true,
            animationDuration: 300,
            installPromptDelay: 5000,
            updateCheckInterval: 30000
        };
        this.deferredPrompt = null;
        this.updateAvailable = false;
        this.isOnline = navigator.onLine;
        this.isInstalled = false;
        this.isLoading = true;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createPWAElements();
        this.checkInstallability();
        this.checkForUpdates();
        this.setupOfflineDetection();
        this.setupLoadingScreen();
    }

    setupEventListeners() {
        window.addEventListener('beforeinstallprompt', (e) => this.handleBeforeInstallPrompt(e));
        window.addEventListener('appinstalled', () => this.handleAppInstalled());
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        window.addEventListener('load', () => this.handleLoad());
        document.addEventListener('click', (e) => this.handleClick(e));
    }

    createPWAElements() {
        this.createInstallPrompt();
        this.createUpdatePrompt();
        this.createOfflineIndicator();
        this.createSyncIndicator();
        this.createLoadingScreen();
    }

    createInstallPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'pwa-install-prompt';
        prompt.innerHTML = this.renderInstallPrompt();
        document.body.appendChild(prompt);
        this.installPrompt = prompt;
    }

    createUpdatePrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'pwa-update-prompt';
        prompt.innerHTML = this.renderUpdatePrompt();
        document.body.appendChild(prompt);
        this.updatePrompt = prompt;
    }

    createOfflineIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'pwa-offline-indicator';
        indicator.innerHTML = this.renderOfflineIndicator();
        document.body.appendChild(indicator);
        this.offlineIndicator = indicator;
    }

    createSyncIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'pwa-sync-indicator';
        indicator.innerHTML = this.renderSyncIndicator();
        document.body.appendChild(indicator);
        this.syncIndicator = indicator;
    }

    createLoadingScreen() {
        const screen = document.createElement('div');
        screen.className = 'pwa-loading-screen';
        screen.innerHTML = this.renderLoadingScreen();
        document.body.appendChild(screen);
        this.loadingScreen = screen;
    }

    renderInstallPrompt() {
        return `
            <div class="pwa-install-prompt-header">
                <h3 class="pwa-install-prompt-title">Install Angkor Compliance</h3>
                <button class="pwa-install-prompt-close" data-action="close-install">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="pwa-install-prompt-content">
                <div class="pwa-install-prompt-icon">
                    <i data-lucide="download"></i>
                </div>
                <div class="pwa-install-prompt-text">
                    <p class="pwa-install-prompt-description">
                        Install this app on your device for quick access and offline functionality.
                    </p>
                </div>
            </div>
            <div class="pwa-install-prompt-actions">
                <button class="pwa-install-prompt-button secondary" data-action="dismiss-install">Not now</button>
                <button class="pwa-install-prompt-button primary" data-action="install-app">Install</button>
            </div>
        `;
    }

    renderUpdatePrompt() {
        return `
            <div class="pwa-update-prompt-header">
                <i class="pwa-update-prompt-icon" data-lucide="refresh-cw"></i>
                <h3 class="pwa-update-prompt-title">Update Available</h3>
            </div>
            <p class="pwa-update-prompt-message">
                A new version of the app is available. Update now to get the latest features and improvements.
            </p>
            <div class="pwa-update-prompt-actions">
                <button class="pwa-update-prompt-button secondary" data-action="dismiss-update">Later</button>
                <button class="pwa-update-prompt-button primary" data-action="update-app">Update</button>
            </div>
        `;
    }

    renderOfflineIndicator() {
        return `
            <div class="pwa-offline-indicator-content">
                <i class="pwa-offline-indicator-icon" data-lucide="wifi-off"></i>
                <p class="pwa-offline-indicator-text">You're offline</p>
            </div>
        `;
    }

    renderSyncIndicator() {
        return `
            <div class="pwa-sync-indicator-content">
                <i class="pwa-sync-indicator-icon" data-lucide="refresh-cw"></i>
                <p class="pwa-sync-indicator-text">Syncing data...</p>
            </div>
        `;
    }

    renderLoadingScreen() {
        return `
            <div class="pwa-loading-screen-content">
                <div class="pwa-loading-screen-logo">
                    <i data-lucide="shield-check"></i>
                </div>
                <h1 class="pwa-loading-screen-title">Angkor Compliance</h1>
                <div class="pwa-loading-screen-spinner"></div>
                <p class="pwa-loading-screen-message">Loading your compliance dashboard...</p>
            </div>
        `;
    }

    checkInstallability() {
        if (this.isInstalled || !this.config.enableInstallPrompt) return;
        
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            return;
        }
        
        // Show install prompt after delay
        setTimeout(() => {
            this.showInstallPrompt();
        }, this.config.installPromptDelay);
    }

    checkForUpdates() {
        if (!this.config.enableUpdatePrompt) return;
        
        // Check for updates periodically
        setInterval(() => {
            this.checkForServiceWorkerUpdate();
        }, this.config.updateCheckInterval);
    }

    checkForServiceWorkerUpdate() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration) {
                    registration.update();
                }
            });
        }
    }

    setupOfflineDetection() {
        if (!this.config.enableOfflineIndicator) return;
        
        this.updateOnlineStatus();
    }

    setupLoadingScreen() {
        if (!this.config.enableLoadingScreen) return;
        
        // Hide loading screen after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 1000);
        });
    }

    handleBeforeInstallPrompt(e) {
        e.preventDefault();
        this.deferredPrompt = e;
        this.showInstallPrompt();
    }

    handleAppInstalled() {
        this.isInstalled = true;
        this.hideInstallPrompt();
        this.triggerEvent('pwa:installed');
    }

    handleOnline() {
        this.isOnline = true;
        this.hideOfflineIndicator();
        this.triggerEvent('pwa:online');
    }

    handleOffline() {
        this.isOnline = false;
        this.showOfflineIndicator();
        this.triggerEvent('pwa:offline');
    }

    handleLoad() {
        this.isLoading = false;
        this.hideLoadingScreen();
    }

    handleClick(e) {
        const action = e.target.getAttribute('data-action');
        if (!action) return;
        
        switch (action) {
            case 'close-install':
            case 'dismiss-install':
                this.hideInstallPrompt();
                break;
            case 'install-app':
                this.installApp();
                break;
            case 'dismiss-update':
                this.hideUpdatePrompt();
                break;
            case 'update-app':
                this.updateApp();
                break;
        }
    }

    showInstallPrompt() {
        if (!this.installPrompt || this.isInstalled) return;
        
        this.installPrompt.classList.add('active');
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        this.triggerEvent('pwa:install-prompt:show');
    }

    hideInstallPrompt() {
        if (!this.installPrompt) return;
        
        this.installPrompt.classList.remove('active');
        this.triggerEvent('pwa:install-prompt:hide');
    }

    showUpdatePrompt() {
        if (!this.updatePrompt) return;
        
        this.updatePrompt.classList.add('active');
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        this.triggerEvent('pwa:update-prompt:show');
    }

    hideUpdatePrompt() {
        if (!this.updatePrompt) return;
        
        this.updatePrompt.classList.remove('active');
        this.triggerEvent('pwa:update-prompt:hide');
    }

    showOfflineIndicator() {
        if (!this.offlineIndicator) return;
        
        this.offlineIndicator.classList.add('active');
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        this.triggerEvent('pwa:offline-indicator:show');
    }

    hideOfflineIndicator() {
        if (!this.offlineIndicator) return;
        
        this.offlineIndicator.classList.remove('active');
        this.triggerEvent('pwa:offline-indicator:hide');
    }

    showSyncIndicator() {
        if (!this.syncIndicator) return;
        
        this.syncIndicator.classList.add('active');
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        this.triggerEvent('pwa:sync-indicator:show');
    }

    hideSyncIndicator() {
        if (!this.syncIndicator) return;
        
        this.syncIndicator.classList.remove('active');
        this.triggerEvent('pwa:sync-indicator:hide');
    }

    showLoadingScreen() {
        if (!this.loadingScreen) return;
        
        this.loadingScreen.classList.remove('hidden');
        this.triggerEvent('pwa:loading-screen:show');
    }

    hideLoadingScreen() {
        if (!this.loadingScreen) return;
        
        this.loadingScreen.classList.add('hidden');
        this.triggerEvent('pwa:loading-screen:hide');
    }

    installApp() {
        if (!this.deferredPrompt) return;
        
        this.deferredPrompt.prompt();
        
        this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                this.triggerEvent('pwa:install:accepted');
            } else {
                this.triggerEvent('pwa:install:dismissed');
            }
            this.deferredPrompt = null;
        });
        
        this.hideInstallPrompt();
    }

    updateApp() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration && registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
            });
        }
        
        this.hideUpdatePrompt();
        this.triggerEvent('pwa:update:accepted');
    }

    updateOnlineStatus() {
        if (this.isOnline) {
            this.hideOfflineIndicator();
        } else {
            this.showOfflineIndicator();
        }
    }

    // Public Methods
    getInstallability() {
        return {
            canInstall: !!this.deferredPrompt,
            isInstalled: this.isInstalled
        };
    }

    getOnlineStatus() {
        return {
            isOnline: this.isOnline
        };
    }

    getUpdateStatus() {
        return {
            updateAvailable: this.updateAvailable
        };
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
        if (this.installPrompt) {
            this.installPrompt.remove();
            this.installPrompt = null;
        }
        
        if (this.updatePrompt) {
            this.updatePrompt.remove();
            this.updatePrompt = null;
        }
        
        if (this.offlineIndicator) {
            this.offlineIndicator.remove();
            this.offlineIndicator = null;
        }
        
        if (this.syncIndicator) {
            this.syncIndicator.remove();
            this.syncIndicator = null;
        }
        
        if (this.loadingScreen) {
            this.loadingScreen.remove();
            this.loadingScreen = null;
        }
    }
}

// Initialize PWA features manager
document.addEventListener('DOMContentLoaded', () => {
    window.pwaFeaturesManager = new PWAFeaturesManager();
});

// Global access
window.PWAFeaturesManager = PWAFeaturesManager;
