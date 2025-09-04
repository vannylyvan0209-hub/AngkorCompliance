/**
 * Quick Cache Clear Script for Angkor Compliance Platform
 * Run this in browser console for immediate cache clearing
 */

// Cache Clear Utility
// Wait for Firebase to be available before initializing
function initializeCacheClear() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeCacheClear, 100);
        return;
    }

    // Get Firebase instances and functions from the global Firebase object
    const { db } = window.Firebase;
    const { clearPersistence } = window.Firebase;

    (function() {
        'use strict';

    console.log('🧹 Angkor Compliance Cache Clear Tool');
    console.log('=====================================');

    // Cache clear functions
    const cacheClear = {
        // Clear all localStorage except essential items
        clearLocalStorage: function() {
            const essentialKeys = ['userRole', 'userName', 'language', 'preferred-language'];
            let clearedCount = 0;
            
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && !essentialKeys.includes(key)) {
                    localStorage.removeItem(key);
                    clearedCount++;
                }
            }
            
            console.log(`✅ Cleared ${clearedCount} localStorage items`);
            return clearedCount;
        },

        // Clear all sessionStorage
        clearSessionStorage: function() {
            const count = sessionStorage.length;
            sessionStorage.clear();
            console.log(`✅ Cleared ${count} sessionStorage items`);
            return count;
        },

        // Clear browser cache by reloading with cache bust
        clearBrowserCache: function() {
            console.log('🔄 Reloading page with cache bust...');
            const timestamp = Date.now();
            const url = new URL(window.location.href);
            url.searchParams.set('cache_bust', timestamp);
            window.location.href = url.toString();
        },

        // Clear Firebase cache
        clearFirebaseCache: async function() {
            if (db) {
                try {
                    await clearPersistence();
                    console.log('✅ Firebase cache cleared');
                    return true;
                } catch (e) {
                    console.warn('⚠️ Firebase cache clear failed:', e.message);
                    return false;
                }
            } else {
                console.log('ℹ️ Firebase not available');
                return false;
            }
        },

        // Clear all cache types
        clearAll: async function() {
            console.log('🧹 Starting comprehensive cache clear...');
            
            const localStorageCleared = this.clearLocalStorage();
            const sessionStorageCleared = this.clearSessionStorage();
            const firebaseCleared = await this.clearFirebaseCache();
            
            console.log('📊 Cache Clear Summary:');
            console.log(`   localStorage: ${localStorageCleared} items cleared`);
            console.log(`   sessionStorage: ${sessionStorageCleared} items cleared`);
            console.log(`   Firebase: ${firebaseCleared ? 'cleared' : 'failed'}`);
            
            return {
                localStorage: localStorageCleared,
                sessionStorage: sessionStorageCleared,
                firebase: firebaseCleared
            };
        },

        // Show cache status
        showStatus: function() {
            console.log('📊 Current Cache Status:');
            console.log(`   localStorage: ${localStorage.length} items`);
            console.log(`   sessionStorage: ${sessionStorage.length} items`);
            
            // Show localStorage contents
            console.log('   localStorage contents:');
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                console.log(`     ${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
            }
            
            // Show sessionStorage contents
            console.log('   sessionStorage contents:');
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                const value = sessionStorage.getItem(key);
                console.log(`     ${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
            }
        },

        // Force page refresh
        forceRefresh: function() {
            console.log('🔄 Forcing page refresh...');
            window.location.reload(true);
        },

        // Clear specific cache by key pattern
        clearByPattern: function(pattern) {
            let clearedCount = 0;
            
            // Clear localStorage
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.includes(pattern)) {
                    localStorage.removeItem(key);
                    clearedCount++;
                }
            }
            
            // Clear sessionStorage
            for (let i = sessionStorage.length - 1; i >= 0; i--) {
                const key = sessionStorage.key(i);
                if (key && key.includes(pattern)) {
                    sessionStorage.removeItem(key);
                    clearedCount++;
                }
            }
            
            console.log(`✅ Cleared ${clearedCount} items matching pattern: ${pattern}`);
            return clearedCount;
        }
    };

    // Expose to global scope
    window.cacheClear = cacheClear;

    // Show available commands
    console.log('Available commands:');
    console.log('  cacheClear.clearLocalStorage()     - Clear localStorage');
    console.log('  cacheClear.clearSessionStorage()   - Clear sessionStorage');
    console.log('  cacheClear.clearBrowserCache()     - Clear browser cache');
    console.log('  cacheClear.clearFirebaseCache()    - Clear Firebase cache');
    console.log('  cacheClear.clearAll()              - Clear all cache types');
    console.log('  cacheClear.showStatus()            - Show current cache status');
    console.log('  cacheClear.forceRefresh()          - Force page refresh');
    console.log('  cacheClear.clearByPattern("text")  - Clear items matching pattern');
    console.log('');
    console.log('Example: cacheClear.clearAll()');

    })();
}

// Start the initialization process
initializeCacheClear();
