/**
 * Offline Support 2025 - JavaScript
 * Modern offline support with loading and error states
 */

class OfflineSupport2025 {
    constructor() {
        this.isOnline = navigator.onLine;
        this.isServiceWorkerSupported = 'serviceWorker' in navigator;
        this.retryAttempts = 0;
        this.maxRetryAttempts = 3;
        this.retryDelay = 1000;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupServiceWorker();
        this.setupOfflineDetection();
        this.setupCacheManagement();
        this.setupSyncQueue();
    }

    setupEventListeners() {
        // Online/offline detection
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Page visibility for sync
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                this.syncPendingData();
            }
        });

        // Before unload for cleanup
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    setupServiceWorker() {
        if (this.isServiceWorkerSupported) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                    this.serviceWorkerRegistration = registration;
                    this.setupServiceWorkerEvents(registration);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }

    setupServiceWorkerEvents(registration) {
        // Listen for updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.showUpdateAvailable();
                }
            });
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            this.handleServiceWorkerMessage(event.data);
        });
    }

    setupOfflineDetection() {
        // Create offline indicator
        this.createOfflineIndicator();
        
        // Initial state
        if (!this.isOnline) {
            this.showOfflineState();
        }
    }

    createOfflineIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'offline-indicator';
        indicator.innerHTML = `
            <i data-lucide="wifi-off" class="icon"></i>
            <span>You're offline</span>
        `;
        document.body.appendChild(indicator);
        this.offlineIndicator = indicator;
        lucide.createIcons();
    }

    handleOnline() {
        this.isOnline = true;
        this.hideOfflineState();
        this.showOnlineState();
        this.syncPendingData();
    }

    handleOffline() {
        this.isOnline = false;
        this.showOfflineState();
    }

    showOfflineState() {
        if (this.offlineIndicator) {
            this.offlineIndicator.classList.add('offline', 'show');
            this.offlineIndicator.innerHTML = `
                <i data-lucide="wifi-off" class="icon"></i>
                <span>You're offline</span>
            `;
            lucide.createIcons();
        }
        this.showOfflineOverlay();
    }

    hideOfflineState() {
        if (this.offlineIndicator) {
            this.offlineIndicator.classList.remove('offline', 'show');
        }
        this.hideOfflineOverlay();
    }

    showOnlineState() {
        if (this.offlineIndicator) {
            this.offlineIndicator.classList.add('online', 'show');
            this.offlineIndicator.innerHTML = `
                <i data-lucide="wifi" class="icon"></i>
                <span>Back online</span>
            `;
            lucide.createIcons();
            
            // Hide after 3 seconds
            setTimeout(() => {
                this.offlineIndicator.classList.remove('show');
            }, 3000);
        }
    }

    showOfflineOverlay() {
        if (document.querySelector('.offline-overlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'offline-overlay';
        overlay.innerHTML = `
            <div class="content">
                <i data-lucide="wifi-off" class="icon"></i>
                <h2>You're Offline</h2>
                <p>It looks like you've lost your internet connection. Some features may be limited while offline.</p>
                <div class="actions">
                    <button class="retry-button" onclick="window.offlineSupport.retryConnection()">
                        <i data-lucide="refresh-cw"></i>
                        Try Again
                    </button>
                    <button class="btn btn-secondary" onclick="window.offlineSupport.hideOfflineOverlay()">
                        Continue Offline
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        lucide.createIcons();
        
        setTimeout(() => overlay.classList.add('show'), 100);
    }

    hideOfflineOverlay() {
        const overlay = document.querySelector('.offline-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    retryConnection() {
        this.showLoadingOverlay('Checking connection...');
        
        // Test connection
        fetch('/api/health', { 
            method: 'HEAD',
            cache: 'no-cache'
        })
        .then(() => {
            this.hideLoadingOverlay();
            this.handleOnline();
        })
        .catch(() => {
            this.hideLoadingOverlay();
            this.showRetryError();
        });
    }

    showRetryError() {
        const overlay = document.querySelector('.offline-overlay .content');
        if (overlay) {
            overlay.innerHTML = `
                <i data-lucide="alert-circle" class="icon" style="color: var(--danger-500);"></i>
                <h2>Still Offline</h2>
                <p>Unable to connect to the server. Please check your internet connection and try again.</p>
                <div class="actions">
                    <button class="retry-button" onclick="window.offlineSupport.retryConnection()">
                        <i data-lucide="refresh-cw"></i>
                        Try Again
                    </button>
                    <button class="btn btn-secondary" onclick="window.offlineSupport.hideOfflineOverlay()">
                        Continue Offline
                    </button>
                </div>
            `;
            lucide.createIcons();
        }
    }

    showLoadingOverlay(message = 'Loading...') {
        if (document.querySelector('.loading-overlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="spinner"></div>
            <div class="message">${message}</div>
        `;
        document.body.appendChild(overlay);
        
        setTimeout(() => overlay.classList.add('show'), 100);
    }

    hideLoadingOverlay() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    setupCacheManagement() {
        this.createCacheStatus();
        this.updateCacheStatus();
    }

    createCacheStatus() {
        const status = document.createElement('div');
        status.className = 'cache-status';
        status.innerHTML = `
            <i data-lucide="database" class="icon"></i>
            <span>Cache ready</span>
        `;
        document.body.appendChild(status);
        this.cacheStatus = status;
        lucide.createIcons();
    }

    updateCacheStatus() {
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                if (this.cacheStatus) {
                    this.cacheStatus.innerHTML = `
                        <i data-lucide="database" class="icon"></i>
                        <span>${cacheNames.length} caches available</span>
                    `;
                    lucide.createIcons();
                }
            });
        }
    }

    setupSyncQueue() {
        this.syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
        this.createSyncStatus();
    }

    createSyncStatus() {
        const status = document.createElement('div');
        status.className = 'sync-status';
        status.innerHTML = `
            <i data-lucide="sync" class="icon"></i>
            <span>Sync ready</span>
        `;
        document.body.appendChild(status);
        this.syncStatus = status;
        lucide.createIcons();
    }

    addToSyncQueue(data) {
        this.syncQueue.push({
            id: Date.now(),
            data: data,
            timestamp: new Date().toISOString(),
            retries: 0
        });
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
        this.updateSyncStatus();
    }

    syncPendingData() {
        if (!this.isOnline || this.syncQueue.length === 0) return;

        this.showSyncStatus('syncing', 'Syncing data...');
        
        const promises = this.syncQueue.map(item => this.syncItem(item));
        
        Promise.allSettled(promises).then(results => {
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            
            if (failed === 0) {
                this.showSyncStatus('synced', 'All data synced');
                this.syncQueue = [];
                localStorage.removeItem('syncQueue');
            } else {
                this.showSyncStatus('error', `${failed} items failed to sync`);
            }
            
            setTimeout(() => this.hideSyncStatus(), 3000);
        });
    }

    syncItem(item) {
        return fetch('/api/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item.data)
        }).then(response => {
            if (!response.ok) throw new Error('Sync failed');
            return response;
        });
    }

    showSyncStatus(type, message) {
        if (this.syncStatus) {
            this.syncStatus.className = `sync-status ${type} show`;
            this.syncStatus.innerHTML = `
                <i data-lucide="sync" class="icon"></i>
                <span>${message}</span>
            `;
            lucide.createIcons();
        }
    }

    hideSyncStatus() {
        if (this.syncStatus) {
            this.syncStatus.classList.remove('show');
        }
    }

    updateSyncStatus() {
        if (this.syncQueue.length > 0) {
            this.showSyncStatus('syncing', `${this.syncQueue.length} items pending`);
        }
    }

    showUpdateAvailable() {
        const overlay = document.createElement('div');
        overlay.className = 'offline-overlay';
        overlay.innerHTML = `
            <div class="content">
                <i data-lucide="download" class="icon"></i>
                <h2>Update Available</h2>
                <p>A new version of the app is available. Would you like to update now?</p>
                <div class="actions">
                    <button class="retry-button" onclick="window.offlineSupport.updateApp()">
                        <i data-lucide="download"></i>
                        Update Now
                    </button>
                    <button class="btn btn-secondary" onclick="window.offlineSupport.hideOfflineOverlay()">
                        Later
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        lucide.createIcons();
        
        setTimeout(() => overlay.classList.add('show'), 100);
    }

    updateApp() {
        if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.waiting) {
            this.serviceWorkerRegistration.waiting.postMessage({ action: 'skipWaiting' });
            window.location.reload();
        }
    }

    handleServiceWorkerMessage(data) {
        switch (data.type) {
            case 'CACHE_UPDATED':
                this.updateCacheStatus();
                break;
            case 'SYNC_COMPLETE':
                this.syncPendingData();
                break;
        }
    }

    cleanup() {
        // Save any pending data
        if (this.syncQueue.length > 0) {
            localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
        }
    }
}

// Initialize offline support
document.addEventListener('DOMContentLoaded', () => {
    window.offlineSupport = new OfflineSupport2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfflineSupport2025;
}
