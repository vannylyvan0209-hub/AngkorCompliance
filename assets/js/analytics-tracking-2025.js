/**
 * Analytics Tracking 2025 - JavaScript
 * Analytics tracking for design system usage and performance
 */

class AnalyticsTracking2025 {
    constructor() {
        this.isEnabled = this.checkAnalyticsEnabled();
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.events = [];
        this.metrics = {
            pageViews: 0,
            componentUsage: {},
            performance: {},
            userInteractions: 0,
            errors: 0
        };
        this.init();
    }

    init() {
        if (!this.isEnabled) return;

        this.setupEventListeners();
        this.setupPerformanceTracking();
        this.setupComponentTracking();
        this.setupErrorTracking();
        this.setupRealTimeTracking();
        this.startSession();
    }

    checkAnalyticsEnabled() {
        // Check if analytics is enabled in localStorage
        const enabled = localStorage.getItem('analytics-enabled');
        if (enabled !== null) {
            return enabled === 'true';
        }

        // Check if user has opted in
        return this.hasUserConsent();
    }

    hasUserConsent() {
        // Check for analytics consent
        const consent = localStorage.getItem('analytics-consent');
        return consent === 'accepted';
    }

    setupEventListeners() {
        // Track page views
        this.trackPageView();

        // Track component interactions
        document.addEventListener('click', (e) => {
            this.trackComponentInteraction(e.target);
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.trackFormSubmission(e.target);
        });

        // Track scroll depth
        let scrollDepth = 0;
        window.addEventListener('scroll', () => {
            const newDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (newDepth > scrollDepth) {
                scrollDepth = newDepth;
                this.trackScrollDepth(scrollDepth);
            }
        });

        // Track time on page
        this.trackTimeOnPage();
    }

    setupPerformanceTracking() {
        // Track page load performance
        window.addEventListener('load', () => {
            this.trackPageLoadPerformance();
        });

        // Track resource loading
        this.trackResourceLoading();

        // Track Core Web Vitals
        this.trackCoreWebVitals();
    }

    setupComponentTracking() {
        // Track component usage
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.trackComponentUsage(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupErrorTracking() {
        // Track JavaScript errors
        window.addEventListener('error', (e) => {
            this.trackError('javascript', e.error);
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError('promise', e.reason);
        });

        // Track resource loading errors
        window.addEventListener('error', (e) => {
            if (e.target !== window) {
                this.trackError('resource', e.target.src || e.target.href);
            }
        }, true);
    }

    setupRealTimeTracking() {
        // Update metrics every 30 seconds
        setInterval(() => {
            this.updateRealTimeMetrics();
        }, 30000);

        // Send analytics data every 60 seconds
        setInterval(() => {
            this.sendAnalyticsData();
        }, 60000);
    }

    startSession() {
        this.trackEvent('session_start', {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
    }

    trackPageView() {
        this.metrics.pageViews++;
        this.trackEvent('page_view', {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
        });
    }

    trackComponentInteraction(element) {
        this.metrics.userInteractions++;
        
        const component = this.identifyComponent(element);
        if (component) {
            this.trackEvent('component_interaction', {
                component: component.name,
                componentType: component.type,
                action: 'click',
                timestamp: new Date().toISOString()
            });
        }
    }

    trackFormSubmission(form) {
        this.trackEvent('form_submission', {
            formId: form.id || 'unnamed',
            formAction: form.action,
            formMethod: form.method,
            fieldCount: form.elements.length,
            timestamp: new Date().toISOString()
        });
    }

    trackScrollDepth(depth) {
        this.trackEvent('scroll_depth', {
            depth: depth,
            timestamp: new Date().toISOString()
        });
    }

    trackTimeOnPage() {
        // Track time on page when user leaves
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - this.startTime;
            this.trackEvent('time_on_page', {
                duration: timeOnPage,
                timestamp: new Date().toISOString()
            });
        });
    }

    trackPageLoadPerformance() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.metrics.performance = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstByte: navigation.responseStart - navigation.requestStart,
                domInteractive: navigation.domInteractive - navigation.navigationStart,
                totalLoadTime: navigation.loadEventEnd - navigation.navigationStart
            };

            this.trackEvent('page_load_performance', {
                ...this.metrics.performance,
                timestamp: new Date().toISOString()
            });
        }
    }

    trackResourceLoading() {
        const resources = performance.getEntriesByType('resource');
        resources.forEach(resource => {
            this.trackEvent('resource_load', {
                name: resource.name,
                type: resource.initiatorType,
                duration: resource.duration,
                size: resource.transferSize,
                timestamp: new Date().toISOString()
            });
        });
    }

    trackCoreWebVitals() {
        // Track Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.trackEvent('core_web_vital', {
                metric: 'LCP',
                value: lastEntry.startTime,
                timestamp: new Date().toISOString()
            });
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Track First Input Delay (FID)
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                this.trackEvent('core_web_vital', {
                    metric: 'FID',
                    value: entry.processingStart - entry.startTime,
                    timestamp: new Date().toISOString()
                });
            });
        }).observe({ entryTypes: ['first-input'] });

        // Track Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            this.trackEvent('core_web_vital', {
                metric: 'CLS',
                value: clsValue,
                timestamp: new Date().toISOString()
            });
        }).observe({ entryTypes: ['layout-shift'] });
    }

    trackComponentUsage(element) {
        const component = this.identifyComponent(element);
        if (component) {
            if (!this.metrics.componentUsage[component.name]) {
                this.metrics.componentUsage[component.name] = 0;
            }
            this.metrics.componentUsage[component.name]++;

            this.trackEvent('component_usage', {
                component: component.name,
                componentType: component.type,
                timestamp: new Date().toISOString()
            });
        }
    }

    identifyComponent(element) {
        // Identify 2025 design system components
        const classList = element.classList;
        
        if (classList.contains('btn')) {
            return { name: 'button', type: 'interactive' };
        }
        if (classList.contains('card')) {
            return { name: 'card', type: 'layout' };
        }
        if (classList.contains('modal')) {
            return { name: 'modal', type: 'overlay' };
        }
        if (classList.contains('form-input')) {
            return { name: 'form-input', type: 'form' };
        }
        if (classList.contains('nav-item')) {
            return { name: 'navigation', type: 'navigation' };
        }
        if (classList.contains('alert')) {
            return { name: 'alert', type: 'feedback' };
        }
        if (classList.contains('progress')) {
            return { name: 'progress', type: 'feedback' };
        }
        if (classList.contains('avatar')) {
            return { name: 'avatar', type: 'display' };
        }
        if (classList.contains('tooltip')) {
            return { name: 'tooltip', type: 'overlay' };
        }
        if (classList.contains('dropdown')) {
            return { name: 'dropdown', type: 'interactive' };
        }

        return null;
    }

    trackError(type, error) {
        this.metrics.errors++;
        this.trackEvent('error', {
            type: type,
            message: error.message || error,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }

    updateRealTimeMetrics() {
        // Update real-time metrics display
        this.updateMetricsDisplay();
    }

    updateMetricsDisplay() {
        const metricsDisplay = document.querySelector('.analytics-metrics');
        if (!metricsDisplay) return;

        // Update page views
        const pageViewsElement = metricsDisplay.querySelector('[data-metric="page-views"] .metric-value');
        if (pageViewsElement) {
            pageViewsElement.textContent = this.metrics.pageViews;
        }

        // Update user interactions
        const interactionsElement = metricsDisplay.querySelector('[data-metric="interactions"] .metric-value');
        if (interactionsElement) {
            interactionsElement.textContent = this.metrics.userInteractions;
        }

        // Update errors
        const errorsElement = metricsDisplay.querySelector('[data-metric="errors"] .metric-value');
        if (errorsElement) {
            errorsElement.textContent = this.metrics.errors;
        }

        // Update component usage
        const componentUsageElement = metricsDisplay.querySelector('[data-metric="components"] .metric-value');
        if (componentUsageElement) {
            const totalComponents = Object.values(this.metrics.componentUsage).reduce((sum, count) => sum + count, 0);
            componentUsageElement.textContent = totalComponents;
        }
    }

    trackEvent(eventName, data) {
        const event = {
            event: eventName,
            data: data,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        };

        this.events.push(event);

        // Send immediately for critical events
        if (['error', 'session_start'].includes(eventName)) {
            this.sendEvent(event);
        }
    }

    sendEvent(event) {
        if (!this.isEnabled) return;

        // Send to analytics endpoint
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        }).catch(error => {
            console.error('Analytics tracking error:', error);
        });
    }

    sendAnalyticsData() {
        if (this.events.length === 0) return;

        const batch = {
            sessionId: this.sessionId,
            events: this.events,
            metrics: this.metrics,
            timestamp: new Date().toISOString()
        };

        fetch('/api/analytics/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(batch)
        }).then(() => {
            this.events = []; // Clear sent events
        }).catch(error => {
            console.error('Analytics batch error:', error);
        });
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Public API methods
    enable() {
        this.isEnabled = true;
        localStorage.setItem('analytics-enabled', 'true');
        this.init();
    }

    disable() {
        this.isEnabled = false;
        localStorage.setItem('analytics-enabled', 'false');
    }

    getMetrics() {
        return this.metrics;
    }

    getEvents() {
        return this.events;
    }

    clearData() {
        this.events = [];
        this.metrics = {
            pageViews: 0,
            componentUsage: {},
            performance: {},
            userInteractions: 0,
            errors: 0
        };
    }
}

// Initialize analytics tracking
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new AnalyticsTracking2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsTracking2025;
}
