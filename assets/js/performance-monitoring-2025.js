/**
 * Performance Monitoring 2025 - JavaScript
 * Performance monitoring for 2025 design system
 */

class PerformanceMonitoring2025 {
    constructor() {
        this.metrics = {
            pageLoad: {},
            coreWebVitals: {},
            resourceTiming: {},
            userTiming: {},
            memory: {},
            network: {}
        };
        this.alerts = [];
        this.isMonitoring = false;
        this.init();
    }

    init() {
        this.setupPerformanceObservers();
        this.setupResourceMonitoring();
        this.setupMemoryMonitoring();
        this.setupNetworkMonitoring();
        this.setupUserTiming();
        this.createPerformanceDashboard();
        this.startMonitoring();
    }

    setupPerformanceObservers() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.coreWebVitals.lcp = {
                    value: lastEntry.startTime,
                    timestamp: Date.now(),
                    status: this.getLCPStatus(lastEntry.startTime)
                };
                this.updateCoreWebVitals();
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.coreWebVitals.fid = {
                        value: entry.processingStart - entry.startTime,
                        timestamp: Date.now(),
                        status: this.getFIDStatus(entry.processingStart - entry.startTime)
                    };
                    this.updateCoreWebVitals();
                });
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.coreWebVitals.cls = {
                    value: clsValue,
                    timestamp: Date.now(),
                    status: this.getCLSStatus(clsValue)
                };
                this.updateCoreWebVitals();
            }).observe({ entryTypes: ['layout-shift'] });

            // First Contentful Paint (FCP)
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.coreWebVitals.fcp = {
                        value: entry.startTime,
                        timestamp: Date.now(),
                        status: this.getFCPStatus(entry.startTime)
                    };
                    this.updateCoreWebVitals();
                });
            }).observe({ entryTypes: ['paint'] });
        }
    }

    setupResourceMonitoring() {
        // Monitor resource loading performance
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.resourceTiming[entry.name] = {
                        duration: entry.duration,
                        size: entry.transferSize,
                        type: entry.initiatorType,
                        timestamp: Date.now()
                    };
                });
                this.updateResourceMetrics();
            }).observe({ entryTypes: ['resource'] });
        }
    }

    setupMemoryMonitoring() {
        // Monitor memory usage
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memory = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };
                this.updateMemoryMetrics();
            }, 5000);
        }
    }

    setupNetworkMonitoring() {
        // Monitor network performance
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.metrics.network = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData,
                timestamp: Date.now()
            };
            this.updateNetworkMetrics();
        }
    }

    setupUserTiming() {
        // Monitor user interactions
        let interactionCount = 0;
        let lastInteractionTime = Date.now();

        ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                interactionCount++;
                lastInteractionTime = Date.now();
                this.metrics.userTiming = {
                    interactionCount,
                    lastInteractionTime,
                    timestamp: Date.now()
                };
                this.updateUserTimingMetrics();
            });
        });
    }

    createPerformanceDashboard() {
        const dashboard = document.createElement('div');
        dashboard.className = 'performance-dashboard';
        dashboard.innerHTML = `
            <div class="performance-header">
                <h2 class="performance-title">Performance Monitoring</h2>
                <div class="performance-controls">
                    <button class="performance-refresh" id="refreshPerformance">
                        <i data-lucide="refresh-cw" class="icon"></i>
                        Refresh
                    </button>
                </div>
            </div>
            
            <div class="performance-metrics" id="performanceMetrics">
                <!-- Metrics will be populated here -->
            </div>
            
            <div class="performance-charts">
                <div class="performance-chart">
                    <div class="performance-chart-header">
                        <h3 class="performance-chart-title">Performance Over Time</h3>
                        <div class="performance-chart-controls">
                            <button class="performance-chart-control active" data-period="1h">1H</button>
                            <button class="performance-chart-control" data-period="24h">24H</button>
                            <button class="performance-chart-control" data-period="7d">7D</button>
                        </div>
                    </div>
                    <div class="performance-chart-content">
                        <p>Performance chart will be displayed here</p>
                    </div>
                </div>
                
                <div class="performance-chart">
                    <div class="performance-chart-header">
                        <h3 class="performance-chart-title">Core Web Vitals</h3>
                    </div>
                    <div class="core-web-vitals" id="coreWebVitals">
                        <!-- Core Web Vitals will be populated here -->
                    </div>
                </div>
            </div>
            
            <div class="performance-alerts">
                <div class="performance-alerts-header">
                    <h3 class="performance-alerts-title">Performance Alerts</h3>
                </div>
                <ul class="performance-alerts-list" id="performanceAlerts">
                    <!-- Alerts will be populated here -->
                </ul>
            </div>
        `;
        
        document.body.appendChild(dashboard);
        lucide.createIcons();
        
        // Bind events
        document.getElementById('refreshPerformance').addEventListener('click', () => {
            this.refreshMetrics();
        });
        
        document.querySelectorAll('.performance-chart-control').forEach(control => {
            control.addEventListener('click', (e) => {
                document.querySelectorAll('.performance-chart-control').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.updateChartPeriod(e.target.dataset.period);
            });
        });
    }

    startMonitoring() {
        this.isMonitoring = true;
        this.updatePageLoadMetrics();
        this.updatePerformanceIndicator();
        
        // Update metrics every 30 seconds
        setInterval(() => {
            if (this.isMonitoring) {
                this.updateAllMetrics();
            }
        }, 30000);
    }

    stopMonitoring() {
        this.isMonitoring = false;
    }

    updatePageLoadMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.metrics.pageLoad = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstByte: navigation.responseStart - navigation.requestStart,
                domInteractive: navigation.domInteractive - navigation.navigationStart,
                totalLoadTime: navigation.loadEventEnd - navigation.navigationStart,
                timestamp: Date.now()
            };
            this.updatePageLoadDisplay();
        }
    }

    updateCoreWebVitals() {
        const container = document.getElementById('coreWebVitals');
        if (!container) return;

        const vitals = this.metrics.coreWebVitals;
        let html = '';

        if (vitals.lcp) {
            html += `
                <div class="core-web-vital">
                    <i data-lucide="clock" class="core-web-vital-icon"></i>
                    <div class="core-web-vital-label">LCP</div>
                    <div class="core-web-vital-value">${vitals.lcp.value.toFixed(0)}<span class="core-web-vital-unit">ms</span></div>
                    <div class="core-web-vital-status ${vitals.lcp.status}">${vitals.lcp.status}</div>
                </div>
            `;
        }

        if (vitals.fid) {
            html += `
                <div class="core-web-vital">
                    <i data-lucide="mouse-pointer" class="core-web-vital-icon"></i>
                    <div class="core-web-vital-label">FID</div>
                    <div class="core-web-vital-value">${vitals.fid.value.toFixed(0)}<span class="core-web-vital-unit">ms</span></div>
                    <div class="core-web-vital-status ${vitals.fid.status}">${vitals.fid.status}</div>
                </div>
            `;
        }

        if (vitals.cls) {
            html += `
                <div class="core-web-vital">
                    <i data-lucide="move" class="core-web-vital-icon"></i>
                    <div class="core-web-vital-label">CLS</div>
                    <div class="core-web-vital-value">${vitals.cls.value.toFixed(3)}<span class="core-web-vital-unit"></span></div>
                    <div class="core-web-vital-status ${vitals.cls.status}">${vitals.cls.status}</div>
                </div>
            `;
        }

        if (vitals.fcp) {
            html += `
                <div class="core-web-vital">
                    <i data-lucide="paintbrush" class="core-web-vital-icon"></i>
                    <div class="core-web-vital-label">FCP</div>
                    <div class="core-web-vital-value">${vitals.fcp.value.toFixed(0)}<span class="core-web-vital-unit">ms</span></div>
                    <div class="core-web-vital-status ${vitals.fcp.status}">${vitals.fcp.status}</div>
                </div>
            `;
        }

        container.innerHTML = html;
        lucide.createIcons();
    }

    updatePageLoadDisplay() {
        const container = document.getElementById('performanceMetrics');
        if (!container) return;

        const pageLoad = this.metrics.pageLoad;
        const memory = this.metrics.memory;
        const network = this.metrics.network;

        let html = `
            <div class="performance-metric">
                <div class="performance-metric-header">
                    <h3 class="performance-metric-title">Page Load Time</h3>
                    <i data-lucide="clock" class="performance-metric-icon"></i>
                </div>
                <div class="performance-metric-value">${pageLoad.totalLoadTime.toFixed(0)}<span class="performance-metric-unit">ms</span></div>
                <div class="performance-metric-change positive">
                    <i data-lucide="trending-down" class="icon"></i>
                    <span>Good</span>
                </div>
            </div>
        `;

        if (memory.used) {
            const usedMB = memory.used / 1024 / 1024;
            html += `
                <div class="performance-metric">
                    <div class="performance-metric-header">
                        <h3 class="performance-metric-title">Memory Usage</h3>
                        <i data-lucide="cpu" class="performance-metric-icon"></i>
                    </div>
                    <div class="performance-metric-value">${usedMB.toFixed(1)}<span class="performance-metric-unit">MB</span></div>
                    <div class="performance-metric-change ${usedMB < 50 ? 'positive' : 'negative'}">
                        <i data-lucide="${usedMB < 50 ? 'trending-down' : 'trending-up'}" class="icon"></i>
                        <span>${usedMB < 50 ? 'Good' : 'High'}</span>
                    </div>
                </div>
            `;
        }

        if (network.effectiveType) {
            html += `
                <div class="performance-metric">
                    <div class="performance-metric-header">
                        <h3 class="performance-metric-title">Network</h3>
                        <i data-lucide="wifi" class="performance-metric-icon"></i>
                    </div>
                    <div class="performance-metric-value">${network.effectiveType.toUpperCase()}<span class="performance-metric-unit"></span></div>
                    <div class="performance-metric-change neutral">
                        <i data-lucide="activity" class="icon"></i>
                        <span>${network.downlink}Mbps</span>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
        lucide.createIcons();
    }

    updateResourceMetrics() {
        // Update resource timing metrics
        const resources = Object.values(this.metrics.resourceTiming);
        if (resources.length > 0) {
            const avgDuration = resources.reduce((sum, r) => sum + r.duration, 0) / resources.length;
            const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
            
            // Add to performance metrics if not already present
            const container = document.getElementById('performanceMetrics');
            if (container && !container.querySelector('[data-metric="resources"]')) {
                const resourceMetric = document.createElement('div');
                resourceMetric.className = 'performance-metric';
                resourceMetric.setAttribute('data-metric', 'resources');
                resourceMetric.innerHTML = `
                    <div class="performance-metric-header">
                        <h3 class="performance-metric-title">Resource Load</h3>
                        <i data-lucide="download" class="performance-metric-icon"></i>
                    </div>
                    <div class="performance-metric-value">${avgDuration.toFixed(0)}<span class="performance-metric-unit">ms</span></div>
                    <div class="performance-metric-change positive">
                        <i data-lucide="trending-down" class="icon"></i>
                        <span>${(totalSize / 1024).toFixed(1)}KB</span>
                    </div>
                `;
                container.appendChild(resourceMetric);
                lucide.createIcons();
            }
        }
    }

    updateMemoryMetrics() {
        // Memory metrics are updated in updatePageLoadDisplay
        this.updatePageLoadDisplay();
    }

    updateNetworkMetrics() {
        // Network metrics are updated in updatePageLoadDisplay
        this.updatePageLoadDisplay();
    }

    updateUserTimingMetrics() {
        // User timing metrics can be displayed in the dashboard
        const userTiming = this.metrics.userTiming;
        if (userTiming && userTiming.interactionCount > 0) {
            const container = document.getElementById('performanceMetrics');
            if (container && !container.querySelector('[data-metric="interactions"]')) {
                const interactionMetric = document.createElement('div');
                interactionMetric.className = 'performance-metric';
                interactionMetric.setAttribute('data-metric', 'interactions');
                interactionMetric.innerHTML = `
                    <div class="performance-metric-header">
                        <h3 class="performance-metric-title">User Interactions</h3>
                        <i data-lucide="mouse-pointer" class="performance-metric-icon"></i>
                    </div>
                    <div class="performance-metric-value">${userTiming.interactionCount}<span class="performance-metric-unit"></span></div>
                    <div class="performance-metric-change positive">
                        <i data-lucide="activity" class="icon"></i>
                        <span>Active</span>
                    </div>
                `;
                container.appendChild(interactionMetric);
                lucide.createIcons();
            }
        }
    }

    updatePerformanceIndicator() {
        // Create performance indicator
        if (!document.querySelector('.performance-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'performance-indicator';
            indicator.innerHTML = `
                <div class="pulse"></div>
                <span>Performance: Good</span>
            `;
            document.body.appendChild(indicator);
        }

        // Update indicator based on current performance
        const indicator = document.querySelector('.performance-indicator');
        if (indicator) {
            const overallStatus = this.getOverallPerformanceStatus();
            indicator.className = `performance-indicator ${overallStatus}`;
            indicator.querySelector('span').textContent = `Performance: ${overallStatus}`;
            
            if (overallStatus === 'good') {
                indicator.classList.add('show');
                setTimeout(() => indicator.classList.remove('show'), 3000);
            }
        }
    }

    updateAllMetrics() {
        this.updatePageLoadMetrics();
        this.updateCoreWebVitals();
        this.updateResourceMetrics();
        this.updateMemoryMetrics();
        this.updateNetworkMetrics();
        this.updateUserTimingMetrics();
        this.updatePerformanceIndicator();
        this.checkPerformanceAlerts();
    }

    refreshMetrics() {
        this.updateAllMetrics();
    }

    updateChartPeriod(period) {
        // Update chart data based on selected period
        console.log(`Updating chart period to: ${period}`);
    }

    checkPerformanceAlerts() {
        const alerts = [];
        
        // Check LCP
        if (this.metrics.coreWebVitals.lcp && this.metrics.coreWebVitals.lcp.value > 4000) {
            alerts.push({
                type: 'warning',
                title: 'Slow LCP',
                description: `Largest Contentful Paint is ${this.metrics.coreWebVitals.lcp.value.toFixed(0)}ms`,
                timestamp: new Date().toLocaleTimeString()
            });
        }

        // Check FID
        if (this.metrics.coreWebVitals.fid && this.metrics.coreWebVitals.fid.value > 300) {
            alerts.push({
                type: 'warning',
                title: 'High FID',
                description: `First Input Delay is ${this.metrics.coreWebVitals.fid.value.toFixed(0)}ms`,
                timestamp: new Date().toLocaleTimeString()
            });
        }

        // Check CLS
        if (this.metrics.coreWebVitals.cls && this.metrics.coreWebVitals.cls.value > 0.25) {
            alerts.push({
                type: 'error',
                title: 'High CLS',
                description: `Cumulative Layout Shift is ${this.metrics.coreWebVitals.cls.value.toFixed(3)}`,
                timestamp: new Date().toLocaleTimeString()
            });
        }

        // Check memory usage
        if (this.metrics.memory.used) {
            const usedMB = this.metrics.memory.used / 1024 / 1024;
            if (usedMB > 100) {
                alerts.push({
                    type: 'warning',
                    title: 'High Memory Usage',
                    description: `Memory usage is ${usedMB.toFixed(1)}MB`,
                    timestamp: new Date().toLocaleTimeString()
                });
            }
        }

        this.alerts = alerts;
        this.updateAlertsDisplay();
    }

    updateAlertsDisplay() {
        const container = document.getElementById('performanceAlerts');
        if (!container) return;

        if (this.alerts.length === 0) {
            container.innerHTML = '<li class="performance-alert"><span>No performance alerts</span></li>';
            return;
        }

        let html = '';
        this.alerts.forEach(alert => {
            html += `
                <li class="performance-alert">
                    <i data-lucide="${alert.type === 'error' ? 'alert-circle' : 'alert-triangle'}" class="performance-alert-icon ${alert.type}"></i>
                    <div class="performance-alert-content">
                        <h4 class="performance-alert-title">${alert.title}</h4>
                        <p class="performance-alert-description">${alert.description}</p>
                    </div>
                    <div class="performance-alert-time">${alert.timestamp}</div>
                </li>
            `;
        });

        container.innerHTML = html;
        lucide.createIcons();
    }

    // Status determination methods
    getLCPStatus(value) {
        if (value <= 2500) return 'good';
        if (value <= 4000) return 'needs-improvement';
        return 'poor';
    }

    getFIDStatus(value) {
        if (value <= 100) return 'good';
        if (value <= 300) return 'needs-improvement';
        return 'poor';
    }

    getCLSStatus(value) {
        if (value <= 0.1) return 'good';
        if (value <= 0.25) return 'needs-improvement';
        return 'poor';
    }

    getFCPStatus(value) {
        if (value <= 1800) return 'good';
        if (value <= 3000) return 'needs-improvement';
        return 'poor';
    }

    getOverallPerformanceStatus() {
        const vitals = this.metrics.coreWebVitals;
        let status = 'good';

        if (vitals.lcp && vitals.lcp.status === 'poor') status = 'poor';
        if (vitals.fid && vitals.fid.status === 'poor') status = 'poor';
        if (vitals.cls && vitals.cls.status === 'poor') status = 'poor';

        if (status === 'good') {
            if (vitals.lcp && vitals.lcp.status === 'needs-improvement') status = 'warning';
            if (vitals.fid && vitals.fid.status === 'needs-improvement') status = 'warning';
            if (vitals.cls && vitals.cls.status === 'needs-improvement') status = 'warning';
        }

        return status;
    }

    // Public API methods
    getMetrics() {
        return this.metrics;
    }

    getAlerts() {
        return this.alerts;
    }

    exportMetrics() {
        return {
            metrics: this.metrics,
            alerts: this.alerts,
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitoring = new PerformanceMonitoring2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitoring2025;
}
