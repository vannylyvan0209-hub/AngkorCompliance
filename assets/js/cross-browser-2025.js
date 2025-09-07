/**
 * Angkor Compliance Platform - Cross-Browser Testing JavaScript 2025
 * 
 * Cross-browser compatibility testing and fallback functionality.
 */

class CrossBrowserManager {
    constructor() {
        this.browserInfo = this.detectBrowser();
        this.features = this.detectFeatures();
        this.init();
    }

    init() {
        this.setupFallbacks();
        this.setupPolyfills();
        this.setupCompatibility();
    }

    detectBrowser() {
        const ua = navigator.userAgent;
        const browsers = {
            chrome: /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor),
            firefox: /Firefox/.test(ua),
            safari: /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor),
            edge: /Edg/.test(ua),
            ie: /MSIE|Trident/.test(ua)
        };

        const browser = Object.keys(browsers).find(key => browsers[key]);
        const version = this.getBrowserVersion(ua, browser);

        return { name: browser, version, userAgent: ua };
    }

    getBrowserVersion(ua, browser) {
        const patterns = {
            chrome: /Chrome\/(\d+)/,
            firefox: /Firefox\/(\d+)/,
            safari: /Version\/(\d+)/,
            edge: /Edg\/(\d+)/,
            ie: /MSIE (\d+)|Trident.*rv:(\d+)/
        };

        const match = ua.match(patterns[browser]);
        return match ? match[1] || match[2] : 'unknown';
    }

    detectFeatures() {
        return {
            flexbox: this.supportsFlexbox(),
            grid: this.supportsGrid(),
            customProperties: this.supportsCustomProperties(),
            intersectionObserver: this.supportsIntersectionObserver(),
            webp: this.supportsWebP(),
            serviceWorker: this.supportsServiceWorker(),
            pushNotifications: this.supportsPushNotifications(),
            geolocation: this.supportsGeolocation(),
            localStorage: this.supportsLocalStorage(),
            sessionStorage: this.supportsSessionStorage()
        };
    }

    supportsFlexbox() {
        const div = document.createElement('div');
        return div.style.display === 'flex' || div.style.display === '-webkit-flex';
    }

    supportsGrid() {
        const div = document.createElement('div');
        return div.style.display === 'grid' || div.style.display === '-ms-grid';
    }

    supportsCustomProperties() {
        return window.CSS && CSS.supports && CSS.supports('color', 'var(--test)');
    }

    supportsIntersectionObserver() {
        return 'IntersectionObserver' in window;
    }

    supportsWebP() {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    supportsServiceWorker() {
        return 'serviceWorker' in navigator;
    }

    supportsPushNotifications() {
        return 'PushManager' in window;
    }

    supportsGeolocation() {
        return 'geolocation' in navigator;
    }

    supportsLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    supportsSessionStorage() {
        try {
            sessionStorage.setItem('test', 'test');
            sessionStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    setupFallbacks() {
        if (!this.features.flexbox) {
            this.addFlexboxFallback();
        }
        if (!this.features.grid) {
            this.addGridFallback();
        }
        if (!this.features.customProperties) {
            this.addCustomPropertiesFallback();
        }
        if (!this.features.intersectionObserver) {
            this.addIntersectionObserverFallback();
        }
    }

    addFlexboxFallback() {
        const style = document.createElement('style');
        style.textContent = `
            .flex { display: -webkit-box; display: -webkit-flex; display: -moz-box; display: -ms-flexbox; display: flex; }
            .flex > * { -webkit-box-flex: 1; -webkit-flex: 1; -moz-box-flex: 1; -ms-flex: 1; flex: 1; }
        `;
        document.head.appendChild(style);
    }

    addGridFallback() {
        const style = document.createElement('style');
        style.textContent = `
            .grid { display: -webkit-box; display: -webkit-flex; display: -moz-box; display: -ms-flexbox; display: flex; -webkit-flex-wrap: wrap; -ms-flex-wrap: wrap; flex-wrap: wrap; }
            .grid > * { -webkit-box-flex: 1; -webkit-flex: 1 1 300px; -moz-box-flex: 1; -ms-flex: 1 1 300px; flex: 1 1 300px; }
        `;
        document.head.appendChild(style);
    }

    addCustomPropertiesFallback() {
        const style = document.createElement('style');
        style.textContent = `
            :root { --primary-500: #d4af37; --secondary-500: #3b82f6; --success-500: #22c55e; --warning-500: #f59e0b; --danger-500: #ef4444; --info-500: #3b82f6; }
        `;
        document.head.appendChild(style);
    }

    addIntersectionObserverFallback() {
        window.IntersectionObserver = class {
            constructor(callback) {
                this.callback = callback;
            }
            observe(element) {
                setTimeout(() => this.callback([{ isIntersecting: true, target: element }]), 100);
            }
            unobserve() {}
            disconnect() {}
        };
    }

    setupPolyfills() {
        this.addPolyfills();
    }

    addPolyfills() {
        // Add polyfills for missing features
        if (!Array.prototype.includes) {
            Array.prototype.includes = function(searchElement) {
                return this.indexOf(searchElement) !== -1;
            };
        }

        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function(searchString) {
                return this.indexOf(searchString) === 0;
            };
        }

        if (!String.prototype.endsWith) {
            String.prototype.endsWith = function(searchString) {
                return this.indexOf(searchString) === this.length - searchString.length;
            };
        }
    }

    setupCompatibility() {
        this.addCompatibilityStyles();
        this.addCompatibilityScripts();
    }

    addCompatibilityStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .browser-${this.browserInfo.name} { /* Browser-specific styles */ }
            .browser-${this.browserInfo.name}-${this.browserInfo.version} { /* Version-specific styles */ }
        `;
        document.head.appendChild(style);
    }

    addCompatibilityScripts() {
        // Add browser-specific scripts
        if (this.browserInfo.name === 'ie') {
            this.addIEScripts();
        } else if (this.browserInfo.name === 'safari') {
            this.addSafariScripts();
        } else if (this.browserInfo.name === 'firefox') {
            this.addFirefoxScripts();
        }
    }

    addIEScripts() {
        // IE-specific scripts
        console.log('IE detected, adding compatibility scripts');
    }

    addSafariScripts() {
        // Safari-specific scripts
        console.log('Safari detected, adding compatibility scripts');
    }

    addFirefoxScripts() {
        // Firefox-specific scripts
        console.log('Firefox detected, adding compatibility scripts');
    }

    // Public API
    getBrowserInfo() {
        return this.browserInfo;
    }

    getFeatures() {
        return this.features;
    }

    isSupported(feature) {
        return this.features[feature] || false;
    }

    getCompatibilityReport() {
        return {
            browser: this.browserInfo,
            features: this.features,
            compatibility: this.calculateCompatibility(),
            recommendations: this.getRecommendations()
        };
    }

    calculateCompatibility() {
        const supportedFeatures = Object.values(this.features).filter(Boolean).length;
        const totalFeatures = Object.keys(this.features).length;
        return Math.round((supportedFeatures / totalFeatures) * 100);
    }

    getRecommendations() {
        const recommendations = [];
        
        if (!this.features.flexbox) {
            recommendations.push('Consider using flexbox fallbacks');
        }
        if (!this.features.grid) {
            recommendations.push('Consider using grid fallbacks');
        }
        if (!this.features.customProperties) {
            recommendations.push('Consider using CSS custom properties fallbacks');
        }
        if (!this.features.intersectionObserver) {
            recommendations.push('Consider using intersection observer fallbacks');
        }
        
        return recommendations;
    }
}

// Initialize cross-browser manager
document.addEventListener('DOMContentLoaded', () => {
    window.crossBrowserManager = new CrossBrowserManager();
});

// Global access
window.CrossBrowserManager = CrossBrowserManager;
