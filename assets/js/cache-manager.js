/**
 * Cache Manager for Angkor Compliance Platform
 * Handles browser cache, localStorage, sessionStorage, and Firebase cache issues
 */

// Cache Manager
// Wait for Firebase to be available before initializing
function initializeCacheManager() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeCacheManager, 100);
        return;
    }

    // Get Firebase instances and functions from the global Firebase object
    const { db } = window.Firebase;
    const { clearPersistence } = window.Firebase;

    class CacheManager {
    constructor() {
        this.version = '1.0.0';
        this.cachePrefix = 'angkor_compliance_';
        this.memoryCache = new Map();
        this.cacheExpiry = new Map();
        this.init();
    }

    init() {
        console.log('🔄 Cache Manager initialized');
        this.clearExpiredCache();
        this.setupCacheVersioning();
    }

    /**
     * Setup cache versioning to force cache refresh on updates
     */
    setupCacheVersioning() {
        const currentVersion = localStorage.getItem(this.cachePrefix + 'version');
        if (currentVersion !== this.version) {
            console.log('🔄 Cache version changed, clearing old cache');
            this.clearAllCache();
            localStorage.setItem(this.cachePrefix + 'version', this.version);
        }
    }

    /**
     * Clear all types of cache
     */
    clearAllCache() {
        // Clear memory cache
        this.memoryCache.clear();
        this.cacheExpiry.clear();

        // Clear localStorage (except essential items)
        const essentialKeys = ['userRole', 'userName', 'language', 'preferred-language'];
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.cachePrefix) && !essentialKeys.includes(key)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Clear sessionStorage
        sessionStorage.clear();

        console.log('🧹 All cache cleared');
    }

    /**
     * Clear expired cache entries
     */
    clearExpiredCache() {
        const now = Date.now();
        const expiredKeys = [];

        this.cacheExpiry.forEach((expiry, key) => {
            if (now > expiry) {
                expiredKeys.push(key);
            }
        });

        expiredKeys.forEach(key => {
            this.memoryCache.delete(key);
            this.cacheExpiry.delete(key);
        });

        if (expiredKeys.length > 0) {
            console.log(`🧹 Cleared ${expiredKeys.length} expired cache entries`);
        }
    }

    /**
     * Set cache with expiration
     */
    setCache(key, data, ttl = 300000) { // Default 5 minutes
        const cacheKey = this.cachePrefix + key;
        const expiry = Date.now() + ttl;
        
        this.memoryCache.set(cacheKey, data);
        this.cacheExpiry.set(cacheKey, expiry);
        
        // Also store in localStorage for persistence
        try {
            localStorage.setItem(cacheKey, JSON.stringify({
                data: data,
                expiry: expiry
            }));
        } catch (e) {
            console.warn('Failed to store in localStorage:', e);
        }
    }

    /**
     * Get cache data
     */
    getCache(key) {
        const cacheKey = this.cachePrefix + key;
        const now = Date.now();

        // Check memory cache first
        if (this.memoryCache.has(cacheKey)) {
            const expiry = this.cacheExpiry.get(cacheKey);
            if (now < expiry) {
                return this.memoryCache.get(cacheKey);
            } else {
                this.memoryCache.delete(cacheKey);
                this.cacheExpiry.delete(cacheKey);
            }
        }

        // Check localStorage
        try {
            const stored = localStorage.getItem(cacheKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (now < parsed.expiry) {
                    // Restore to memory cache
                    this.memoryCache.set(cacheKey, parsed.data);
                    this.cacheExpiry.set(cacheKey, parsed.expiry);
                    return parsed.data;
                } else {
                    localStorage.removeItem(cacheKey);
                }
            }
        } catch (e) {
            console.warn('Failed to read from localStorage:', e);
        }

        return null;
    }

    /**
     * Invalidate specific cache
     */
    invalidateCache(key) {
        const cacheKey = this.cachePrefix + key;
        this.memoryCache.delete(cacheKey);
        this.cacheExpiry.delete(cacheKey);
        localStorage.removeItem(cacheKey);
        console.log(`🗑️ Cache invalidated: ${key}`);
    }

    /**
     * Force browser cache refresh
     */
    forceBrowserRefresh() {
        // Add timestamp to force cache refresh
        const timestamp = Date.now();
        const links = document.querySelectorAll('link[rel="stylesheet"], script[src]');
        
        links.forEach(link => {
            const url = new URL(link.href || link.src, window.location.origin);
            url.searchParams.set('v', timestamp);
            if (link.href) link.href = url.toString();
            if (link.src) link.src = url.toString();
        });

        console.log('🔄 Forced browser cache refresh');
    }

    /**
     * Clear Firebase cache (if available)
     */
    async clearFirebaseCache() {
        try {
            if (db) {
                // Clear Firestore cache
                await clearPersistence();
                console.log('🔥 Firebase cache cleared');
            }
        } catch (e) {
            console.warn('Failed to clear Firebase cache:', e);
        }
    }

    /**
     * Handle authentication cache
     */
    clearAuthCache() {
        // Clear auth-related cache
        this.invalidateCache('user_profile');
        this.invalidateCache('user_permissions');
        this.invalidateCache('factory_data');
        
        // Clear essential auth data
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        
        console.log('🔐 Auth cache cleared');
    }

    /**
     * Cache user data with proper invalidation
     */
    cacheUserData(userId, userData) {
        this.setCache(`user_${userId}`, userData, 1800000); // 30 minutes
        this.setCache('current_user', userData, 1800000);
    }

    /**
     * Get cached user data
     */
    getCachedUserData(userId) {
        return this.getCache(`user_${userId}`) || this.getCache('current_user');
    }

    /**
     * Setup cache monitoring
     */
    setupMonitoring() {
        // Monitor for memory pressure
        if ('memory' in performance) {
            setInterval(() => {
                if (performance.memory.usedJSHeapSize > performance.memory.jsHeapSizeLimit * 0.8) {
                    console.warn('⚠️ High memory usage, clearing cache');
                    this.clearExpiredCache();
                }
            }, 30000); // Check every 30 seconds
        }

        // Monitor localStorage usage
        setInterval(() => {
            try {
                const used = new Blob(Object.values(localStorage)).size;
                const limit = 5 * 1024 * 1024; // 5MB limit
                
                if (used > limit * 0.8) {
                    console.warn('⚠️ High localStorage usage, clearing old cache');
                    this.clearExpiredCache();
                }
            } catch (e) {
                // Ignore errors
            }
        }, 60000); // Check every minute
    }
}

    }

    // Global cache manager instance
    window.cacheManager = new CacheManager();

    // Setup monitoring
    window.cacheManager.setupMonitoring();

    // Export for module usage
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CacheManager;
    }
}

// Start the initialization process
initializeCacheManager();
