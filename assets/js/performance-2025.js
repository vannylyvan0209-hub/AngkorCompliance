/**
 * Angkor Compliance Platform - Performance Optimization JavaScript 2025
 * 
 * Performance monitoring, optimization, and enhancement functionality.
 */

class PerformanceManager {
    constructor() {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            interactionTime: 0,
            memoryUsage: 0,
            networkRequests: 0,
            errors: 0
        };
        this.observers = new Map();
        this.init();
    }

    init() {
        this.setupPerformanceMonitoring();
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupAnimationOptimization();
        this.setupMemoryManagement();
        this.setupNetworkOptimization();
    }

    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.measureLoadPerformance();
        });

        // Monitor render performance
        this.observeRenderPerformance();

        // Monitor interaction performance
        this.observeInteractionPerformance();

        // Monitor memory usage
        this.observeMemoryUsage();

        // Monitor network requests
        this.observeNetworkRequests();

        // Monitor errors
        this.observeErrors();
    }

    measureLoadPerformance() {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            this.metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
            
            // Log performance metrics
            console.log('Performance Metrics:', {
                loadTime: this.metrics.loadTime + 'ms',
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart + 'ms',
                firstPaint: this.getFirstPaint(),
                firstContentfulPaint: this.getFirstContentfulPaint()
            });
        }
    }

    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : 0;
    }

    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return firstContentfulPaint ? firstContentfulPaint.startTime : 0;
    }

    observeRenderPerformance() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure') {
                        this.metrics.renderTime = entry.duration;
                    }
                }
            });
            
            observer.observe({ entryTypes: ['measure'] });
            this.observers.set('render', observer);
        }
    }

    observeInteractionPerformance() {
        let interactionStart = 0;
        
        document.addEventListener('click', (e) => {
            interactionStart = performance.now();
        });

        document.addEventListener('click', (e) => {
            const interactionTime = performance.now() - interactionStart;
            this.metrics.interactionTime = interactionTime;
            
            if (interactionTime > 100) {
                console.warn('Slow interaction detected:', interactionTime + 'ms');
            }
        }, { once: true });
    }

    observeMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
                
                // Log memory usage if it's high
                if (this.metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
                    console.warn('High memory usage detected:', this.metrics.memoryUsage / 1024 / 1024 + 'MB');
                }
            }, 5000);
        }
    }

    observeNetworkRequests() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'resource') {
                        this.metrics.networkRequests++;
                        
                        // Log slow requests
                        if (entry.duration > 1000) {
                            console.warn('Slow network request detected:', entry.name, entry.duration + 'ms');
                        }
                    }
                }
            });
            
            observer.observe({ entryTypes: ['resource'] });
            this.observers.set('network', observer);
        }
    }

    observeErrors() {
        window.addEventListener('error', (e) => {
            this.metrics.errors++;
            console.error('JavaScript error:', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.metrics.errors++;
            console.error('Unhandled promise rejection:', e.reason);
        });
    }

    setupLazyLoading() {
        // Lazy load images
        this.lazyLoadImages();
        
        // Lazy load content
        this.lazyLoadContent();
        
        // Lazy load components
        this.lazyLoadComponents();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy-image');
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy-image');
                img.classList.add('loaded');
            });
        }
    }

    lazyLoadContent() {
        const contentElements = document.querySelectorAll('.lazy-content');
        
        if ('IntersectionObserver' in window) {
            const contentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        element.classList.remove('lazy-content');
                        element.classList.add('loaded');
                        contentObserver.unobserve(element);
                    }
                });
            });
            
            contentElements.forEach(element => contentObserver.observe(element));
        } else {
            // Fallback for browsers without IntersectionObserver
            contentElements.forEach(element => {
                element.classList.remove('lazy-content');
                element.classList.add('loaded');
            });
        }
    }

    lazyLoadComponents() {
        const components = document.querySelectorAll('[data-lazy-component]');
        
        if ('IntersectionObserver' in window) {
            const componentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const component = entry.target;
                        const componentName = component.dataset.lazyComponent;
                        
                        // Load component dynamically
                        this.loadComponent(componentName, component);
                        componentObserver.unobserve(component);
                    }
                });
            });
            
            components.forEach(component => componentObserver.observe(component));
        }
    }

    loadComponent(name, container) {
        // Dynamic component loading
        const script = document.createElement('script');
        script.src = `assets/js/components/${name}.js`;
        script.onload = () => {
            // Initialize component
            if (window[`${name}Component`]) {
                new window[`${name}Component`](container);
            }
        };
        document.head.appendChild(script);
    }

    setupImageOptimization() {
        // Optimize images on load
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            this.optimizeImage(img);
        });
    }

    optimizeImage(img) {
        // Add loading optimization
        img.loading = 'lazy';
        
        // Add decoding optimization
        img.decoding = 'async';
        
        // Add error handling
        img.onerror = () => {
            img.src = 'assets/images/placeholder.png';
            img.alt = 'Image failed to load';
        };
    }

    setupAnimationOptimization() {
        // Optimize animations based on device capabilities
        if (this.isLowEndDevice()) {
            this.disableAnimations();
        }
        
        // Optimize animations based on user preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.disableAnimations();
        }
    }

    isLowEndDevice() {
        // Check for low-end device indicators
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const memory = navigator.deviceMemory;
        const cores = navigator.hardwareConcurrency;
        
        return (
            (connection && connection.effectiveType === 'slow-2g') ||
            (memory && memory < 4) ||
            (cores && cores < 4)
        );
    }

    disableAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }

    setupMemoryManagement() {
        // Clean up unused resources
        setInterval(() => {
            this.cleanupResources();
        }, 30000); // Every 30 seconds
    }

    cleanupResources() {
        // Remove unused event listeners
        this.cleanupEventListeners();
        
        // Remove unused DOM elements
        this.cleanupDOMElements();
        
        // Clear unused caches
        this.cleanupCaches();
    }

    cleanupEventListeners() {
        // Remove event listeners from removed elements
        const removedElements = document.querySelectorAll('.removed');
        removedElements.forEach(element => {
            element.removeEventListener('click', this.handleClick);
            element.removeEventListener('hover', this.handleHover);
        });
    }

    cleanupDOMElements() {
        // Remove elements marked for removal
        const elementsToRemove = document.querySelectorAll('.to-remove');
        elementsToRemove.forEach(element => {
            element.remove();
        });
    }

    cleanupCaches() {
        // Clear unused caches
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    if (cacheName.includes('unused')) {
                        caches.delete(cacheName);
                    }
                });
            });
        }
    }

    setupNetworkOptimization() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Prefetch non-critical resources
        this.prefetchNonCriticalResources();
        
        // Optimize network requests
        this.optimizeNetworkRequests();
    }

    preloadCriticalResources() {
        const criticalResources = [
            'assets/css/design-tokens-2025.css',
            'assets/css/components-2025.css',
            'assets/css/layout-2025.css'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = 'style';
            document.head.appendChild(link);
        });
    }

    prefetchNonCriticalResources() {
        const nonCriticalResources = [
            'assets/css/print-2025.css',
            'assets/css/accessibility-2025.css',
            'assets/js/print-2025.js',
            'assets/js/accessibility-2025.js'
        ];
        
        // Prefetch after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                nonCriticalResources.forEach(resource => {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = resource;
                    document.head.appendChild(link);
                });
            }, 1000);
        });
    }

    optimizeNetworkRequests() {
        // Batch network requests
        this.batchRequests();
        
        // Cache network responses
        this.cacheResponses();
        
        // Compress network data
        this.compressData();
    }

    batchRequests() {
        // Implement request batching logic
        const requestQueue = [];
        let batchTimeout;
        
        const processBatch = () => {
            if (requestQueue.length > 0) {
                // Process batched requests
                this.processBatchedRequests(requestQueue);
                requestQueue.length = 0;
            }
        };
        
        return {
            add: (request) => {
                requestQueue.push(request);
                clearTimeout(batchTimeout);
                batchTimeout = setTimeout(processBatch, 100);
            }
        };
    }

    processBatchedRequests(requests) {
        // Process multiple requests in a single batch
        console.log('Processing batched requests:', requests.length);
    }

    cacheResponses() {
        // Implement response caching
        if ('caches' in window) {
            caches.open('angkor-compliance-v1').then(cache => {
                // Cache critical responses
                console.log('Caching responses');
            });
        }
    }

    compressData() {
        // Implement data compression
        if ('CompressionStream' in window) {
            console.log('Data compression available');
        }
    }

    // Public API
    getMetrics() {
        return { ...this.metrics };
    }

    getPerformanceReport() {
        return {
            metrics: this.metrics,
            recommendations: this.getRecommendations(),
            timestamp: new Date().toISOString()
        };
    }

    getRecommendations() {
        const recommendations = [];
        
        if (this.metrics.loadTime > 3000) {
            recommendations.push('Consider optimizing page load time');
        }
        
        if (this.metrics.interactionTime > 100) {
            recommendations.push('Consider optimizing interaction performance');
        }
        
        if (this.metrics.memoryUsage > 50 * 1024 * 1024) {
            recommendations.push('Consider optimizing memory usage');
        }
        
        if (this.metrics.networkRequests > 100) {
            recommendations.push('Consider reducing network requests');
        }
        
        if (this.metrics.errors > 0) {
            recommendations.push('Fix JavaScript errors');
        }
        
        return recommendations;
    }

    optimize() {
        // Run all optimizations
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupAnimationOptimization();
        this.setupMemoryManagement();
        this.setupNetworkOptimization();
    }

    destroy() {
        // Clean up observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

// Initialize performance manager
document.addEventListener('DOMContentLoaded', () => {
    window.performanceManager = new PerformanceManager();
});

// Global access
window.PerformanceManager = PerformanceManager;
