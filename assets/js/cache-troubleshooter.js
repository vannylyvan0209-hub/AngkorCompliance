/**
 * Cache Troubleshooter for Angkor Compliance Platform
 * Provides diagnostic tools and automatic fixes for cache issues
 */

// Cache Troubleshooter
import { 
    auth, 
    db, 
    collection, 
    query, 
    limit, 
    getDocs, 
    enableNetwork, 
    clearPersistence 
} from '../firebase-config.js';

class CacheTroubleshooter {
    constructor() {
        this.issues = [];
        this.fixes = [];
    }

    /**
     * Run comprehensive cache diagnostics
     */
    async runDiagnostics() {
        console.log('🔍 Running cache diagnostics...');
        this.issues = [];
        this.fixes = [];

        // Check browser cache
        this.checkBrowserCache();
        
        // Check localStorage
        this.checkLocalStorage();
        
        // Check sessionStorage
        this.checkSessionStorage();
        
        // Check Firebase cache
        await this.checkFirebaseCache();
        
        // Check memory usage
        this.checkMemoryUsage();
        
        // Check for stale data
        this.checkStaleData();

        return {
            issues: this.issues,
            fixes: this.fixes,
            summary: this.generateSummary()
        };
    }

    /**
     * Check browser cache issues
     */
    checkBrowserCache() {
        // Check if page is cached
        if (window.performance && window.performance.navigation) {
            const navigationType = window.performance.navigation.type;
            if (navigationType === window.performance.navigation.TYPE_BACK_FORWARD) {
                this.issues.push({
                    type: 'browser_cache',
                    severity: 'medium',
                    message: 'Page loaded from browser cache (back/forward navigation)',
                    fix: () => this.forcePageRefresh()
                });
            }
        }

        // Check cache headers
        const metaCacheControl = document.querySelector('meta[http-equiv="Cache-Control"]');
        if (metaCacheControl && metaCacheControl.content.includes('no-cache')) {
            this.issues.push({
                type: 'cache_headers',
                severity: 'low',
                message: 'Page has no-cache headers which may cause performance issues',
                fix: () => this.optimizeCacheHeaders()
            });
        }
    }

    /**
     * Check localStorage issues
     */
    checkLocalStorage() {
        try {
            const used = new Blob(Object.values(localStorage)).size;
            const limit = 5 * 1024 * 1024; // 5MB
            
            if (used > limit * 0.9) {
                this.issues.push({
                    type: 'localStorage',
                    severity: 'high',
                    message: `localStorage usage is high: ${(used / 1024 / 1024).toFixed(2)}MB`,
                    fix: () => this.cleanLocalStorage()
                });
            }

            // Check for corrupted data
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                try {
                    JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    this.issues.push({
                        type: 'corrupted_data',
                        severity: 'medium',
                        message: `Corrupted data in localStorage: ${key}`,
                        fix: () => this.removeCorruptedData(key)
                    });
                }
            }
        } catch (e) {
            this.issues.push({
                type: 'localStorage_error',
                severity: 'high',
                message: 'localStorage access error',
                fix: () => this.resetLocalStorage()
            });
        }
    }

    /**
     * Check sessionStorage issues
     */
    checkSessionStorage() {
        try {
            const used = new Blob(Object.values(sessionStorage)).size;
            const limit = 5 * 1024 * 1024; // 5MB
            
            if (used > limit * 0.9) {
                this.issues.push({
                    type: 'sessionStorage',
                    severity: 'medium',
                    message: `sessionStorage usage is high: ${(used / 1024 / 1024).toFixed(2)}MB`,
                    fix: () => this.cleanSessionStorage()
                });
            }
        } catch (e) {
            this.issues.push({
                type: 'sessionStorage_error',
                severity: 'medium',
                message: 'sessionStorage access error',
                fix: () => this.resetSessionStorage()
            });
        }
    }

    /**
     * Check Firebase cache issues
     */
    async checkFirebaseCache() {
        if (window.firebase && window.firebase.db) {
            try {
                // Check if Firebase is connected
                const isConnected = await this.checkFirebaseConnection();
                if (!isConnected) {
                    this.issues.push({
                        type: 'firebase_cache',
                        severity: 'high',
                        message: 'Firebase connection issues detected',
                        fix: () => this.resetFirebaseConnection()
                    });
                }
            } catch (e) {
                this.issues.push({
                    type: 'firebase_error',
                    severity: 'high',
                    message: 'Firebase cache error',
                    fix: () => this.clearFirebaseCache()
                });
            }
        }
    }

    /**
     * Check memory usage
     */
    checkMemoryUsage() {
        if ('memory' in performance) {
            const used = performance.memory.usedJSHeapSize;
            const limit = performance.memory.jsHeapSizeLimit;
            const percentage = (used / limit) * 100;

            if (percentage > 80) {
                this.issues.push({
                    type: 'memory_usage',
                    severity: 'high',
                    message: `High memory usage: ${percentage.toFixed(1)}%`,
                    fix: () => this.cleanupMemory()
                });
            }
        }
    }

    /**
     * Check for stale data
     */
    checkStaleData() {
        // Check user session
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');
        const lastLogin = localStorage.getItem('lastLogin');

        if (userRole && userName && lastLogin) {
            const loginTime = parseInt(lastLogin);
            const now = Date.now();
            const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);

            if (hoursSinceLogin > 24) {
                this.issues.push({
                    type: 'stale_session',
                    severity: 'medium',
                    message: 'User session may be stale',
                    fix: () => this.refreshUserSession()
                });
            }
        }
    }

    /**
     * Apply automatic fixes
     */
    async applyFixes() {
        console.log('🔧 Applying cache fixes...');
        
        for (const issue of this.issues) {
            if (issue.fix) {
                try {
                    await issue.fix();
                    this.fixes.push({
                        issue: issue.message,
                        status: 'fixed'
                    });
                } catch (e) {
                    this.fixes.push({
                        issue: issue.message,
                        status: 'failed',
                        error: e.message
                    });
                }
            }
        }

        return this.fixes;
    }

    /**
     * Fix methods
     */
    forcePageRefresh() {
        window.location.reload(true);
    }

    optimizeCacheHeaders() {
        // Remove no-cache headers for better performance
        const metaTags = document.querySelectorAll('meta[http-equiv="Cache-Control"]');
        metaTags.forEach(tag => {
            if (tag.content.includes('no-cache')) {
                tag.content = 'max-age=3600'; // 1 hour cache
            }
        });
    }

    cleanLocalStorage() {
        const essentialKeys = ['userRole', 'userName', 'language', 'preferred-language'];
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !essentialKeys.includes(key)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    cleanSessionStorage() {
        sessionStorage.clear();
    }

    removeCorruptedData(key) {
        localStorage.removeItem(key);
    }

    resetLocalStorage() {
        localStorage.clear();
    }

    resetSessionStorage() {
        sessionStorage.clear();
    }

    async checkFirebaseConnection() {
        try {
            // Try a simple query to test connection
            const testQuery = query(
                collection(db, 'users'),
                limit(1)
            );
            await getDocs(testQuery);
            return true;
        } catch (e) {
            return false;
        }
    }

    async resetFirebaseConnection() {
        try {
            await enableNetwork(db);
        } catch (e) {
            console.error('Failed to reset Firebase connection:', e);
        }
    }

    async clearFirebaseCache() {
        try {
            await clearPersistence();
        } catch (e) {
            console.error('Failed to clear Firebase cache:', e);
        }
    }

    cleanupMemory() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Clear any large objects
        if (window.cacheManager) {
            window.cacheManager.clearExpiredCache();
        }
    }

    async refreshUserSession() {
        try {
            // Re-authenticate user
            const currentUser = auth.currentUser;
            if (currentUser) {
                await currentUser.reload();
                localStorage.setItem('lastLogin', Date.now().toString());
            }
        } catch (e) {
            console.error('Failed to refresh user session:', e);
        }
    }

    /**
     * Generate diagnostic summary
     */
    generateSummary() {
        const critical = this.issues.filter(i => i.severity === 'high').length;
        const medium = this.issues.filter(i => i.severity === 'medium').length;
        const low = this.issues.filter(i => i.severity === 'low').length;

        return {
            total: this.issues.length,
            critical,
            medium,
            low,
            status: critical > 0 ? 'critical' : medium > 0 ? 'warning' : 'healthy'
        };
    }

    /**
     * Create cache status report
     */
    createReport() {
        const summary = this.generateSummary();
        
        return {
            timestamp: new Date().toISOString(),
            summary,
            issues: this.issues,
            fixes: this.fixes,
            recommendations: this.generateRecommendations()
        };
    }

    /**
     * Generate recommendations
     */
    generateRecommendations() {
        const recommendations = [];

        if (this.issues.some(i => i.type === 'browser_cache')) {
            recommendations.push('Consider implementing proper cache headers for better performance');
        }

        if (this.issues.some(i => i.type === 'localStorage')) {
            recommendations.push('Implement cache size monitoring and automatic cleanup');
        }

        if (this.issues.some(i => i.type === 'firebase_cache')) {
            recommendations.push('Add Firebase connection monitoring and retry logic');
        }

        if (this.issues.some(i => i.type === 'memory_usage')) {
            recommendations.push('Optimize memory usage by implementing lazy loading and cleanup');
        }

        return recommendations;
    }
}

// Global cache troubleshooter instance
window.cacheTroubleshooter = new CacheTroubleshooter();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CacheTroubleshooter;
}
