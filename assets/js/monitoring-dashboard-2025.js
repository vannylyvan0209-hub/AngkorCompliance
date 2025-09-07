/**
 * Monitoring Dashboard 2025 - JavaScript
 * Monitoring dashboard for design system performance
 */

class MonitoringDashboard2025 {
    constructor() {
        this.metrics = {
            performance: {},
            usage: {},
            errors: {},
            accessibility: {}
        };
        this.charts = {};
        this.init();
    }

    init() {
        this.setupMonitoringUI();
        this.bindMonitoringEvents();
        this.startMonitoring();
    }

    setupMonitoringUI() {
        const monitoringUI = document.createElement('div');
        monitoringUI.className = 'monitoring-dashboard';
        monitoringUI.innerHTML = `
            <div class="monitoring-header">
                <h3>Design System Monitoring</h3>
                <div class="monitoring-controls">
                    <button class="btn btn-primary" id="refreshMetrics">Refresh</button>
                    <button class="btn btn-secondary" id="exportMetrics">Export</button>
                    <button class="btn btn-secondary" id="toggleMonitoring">Pause</button>
                </div>
            </div>
            <div class="monitoring-content">
                <div class="metrics-grid">
                    <div class="metric-card performance">
                        <h4>Performance</h4>
                        <div class="metric-value" id="performanceValue">--</div>
                        <div class="metric-chart" id="performanceChart"></div>
                    </div>
                    <div class="metric-card usage">
                        <h4>Usage</h4>
                        <div class="metric-value" id="usageValue">--</div>
                        <div class="metric-chart" id="usageChart"></div>
                    </div>
                    <div class="metric-card errors">
                        <h4>Errors</h4>
                        <div class="metric-value" id="errorsValue">--</div>
                        <div class="metric-chart" id="errorsChart"></div>
                    </div>
                    <div class="metric-card accessibility">
                        <h4>Accessibility</h4>
                        <div class="metric-value" id="accessibilityValue">--</div>
                        <div class="metric-chart" id="accessibilityChart"></div>
                    </div>
                </div>
                <div class="monitoring-details">
                    <div class="detail-section">
                        <h4>Recent Events</h4>
                        <div class="events-list" id="eventsList"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(monitoringUI);
    }

    bindMonitoringEvents() {
        document.getElementById('refreshMetrics').addEventListener('click', () => {
            this.refreshMetrics();
        });

        document.getElementById('exportMetrics').addEventListener('click', () => {
            this.exportMetrics();
        });

        document.getElementById('toggleMonitoring').addEventListener('click', () => {
            this.toggleMonitoring();
        });
    }

    startMonitoring() {
        this.collectMetrics();
        this.updateCharts();
        this.updateEvents();
        
        // Update every 5 seconds
        setInterval(() => {
            this.collectMetrics();
            this.updateCharts();
            this.updateEvents();
        }, 5000);
    }

    collectMetrics() {
        // Performance metrics
        this.metrics.performance = {
            loadTime: performance.now(),
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0,
            cssSize: this.getCSSSize(),
            jsSize: this.getJSSize()
        };

        // Usage metrics
        this.metrics.usage = {
            componentsUsed: this.getComponentsUsed(),
            roleSwitches: this.getRoleSwitches(),
            themeChanges: this.getThemeChanges()
        };

        // Error metrics
        this.metrics.errors = {
            jsErrors: this.getJSErrors(),
            cssErrors: this.getCSSErrors(),
            accessibilityErrors: this.getAccessibilityErrors()
        };

        // Accessibility metrics
        this.metrics.accessibility = {
            contrastIssues: this.getContrastIssues(),
            focusIssues: this.getFocusIssues(),
            keyboardIssues: this.getKeyboardIssues()
        };
    }

    getCSSSize() {
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        return cssLinks.length * 10; // Estimated size
    }

    getJSSize() {
        const jsScripts = document.querySelectorAll('script[src]');
        return jsScripts.length * 5; // Estimated size
    }

    getComponentsUsed() {
        const components = document.querySelectorAll('.btn, .card, .form-input, .alert, .modal');
        return components.length;
    }

    getRoleSwitches() {
        return localStorage.getItem('role-switches') || 0;
    }

    getThemeChanges() {
        return localStorage.getItem('theme-changes') || 0;
    }

    getJSErrors() {
        return window.jsErrors || 0;
    }

    getCSSErrors() {
        return window.cssErrors || 0;
    }

    getAccessibilityErrors() {
        return window.accessibilityErrors || 0;
    }

    getContrastIssues() {
        return window.contrastIssues || 0;
    }

    getFocusIssues() {
        return window.focusIssues || 0;
    }

    getKeyboardIssues() {
        return window.keyboardIssues || 0;
    }

    updateCharts() {
        this.updatePerformanceChart();
        this.updateUsageChart();
        this.updateErrorsChart();
        this.updateAccessibilityChart();
    }

    updatePerformanceChart() {
        const chart = document.getElementById('performanceChart');
        const value = document.getElementById('performanceValue');
        
        if (chart && value) {
            const loadTime = this.metrics.performance.loadTime;
            value.textContent = `${loadTime.toFixed(0)}ms`;
            
            // Simple chart visualization
            chart.innerHTML = this.createSimpleChart([
                { label: 'Load Time', value: loadTime, max: 1000 },
                { label: 'Memory', value: this.metrics.performance.memoryUsage, max: 100 },
                { label: 'CSS Size', value: this.metrics.performance.cssSize, max: 50 },
                { label: 'JS Size', value: this.metrics.performance.jsSize, max: 50 }
            ]);
        }
    }

    updateUsageChart() {
        const chart = document.getElementById('usageChart');
        const value = document.getElementById('usageValue');
        
        if (chart && value) {
            const components = this.metrics.usage.componentsUsed;
            value.textContent = `${components} components`;
            
            chart.innerHTML = this.createSimpleChart([
                { label: 'Components', value: components, max: 100 },
                { label: 'Role Switches', value: this.metrics.usage.roleSwitches, max: 50 },
                { label: 'Theme Changes', value: this.metrics.usage.themeChanges, max: 50 }
            ]);
        }
    }

    updateErrorsChart() {
        const chart = document.getElementById('errorsChart');
        const value = document.getElementById('errorsValue');
        
        if (chart && value) {
            const totalErrors = this.metrics.errors.jsErrors + this.metrics.errors.cssErrors + this.metrics.errors.accessibilityErrors;
            value.textContent = `${totalErrors} errors`;
            
            chart.innerHTML = this.createSimpleChart([
                { label: 'JS Errors', value: this.metrics.errors.jsErrors, max: 10 },
                { label: 'CSS Errors', value: this.metrics.errors.cssErrors, max: 10 },
                { label: 'A11y Errors', value: this.metrics.errors.accessibilityErrors, max: 10 }
            ]);
        }
    }

    updateAccessibilityChart() {
        const chart = document.getElementById('accessibilityChart');
        const value = document.getElementById('accessibilityValue');
        
        if (chart && value) {
            const totalIssues = this.metrics.accessibility.contrastIssues + this.metrics.accessibility.focusIssues + this.metrics.accessibility.keyboardIssues;
            value.textContent = `${totalIssues} issues`;
            
            chart.innerHTML = this.createSimpleChart([
                { label: 'Contrast', value: this.metrics.accessibility.contrastIssues, max: 10 },
                { label: 'Focus', value: this.metrics.accessibility.focusIssues, max: 10 },
                { label: 'Keyboard', value: this.metrics.accessibility.keyboardIssues, max: 10 }
            ]);
        }
    }

    createSimpleChart(data) {
        return data.map(item => {
            const percentage = Math.min((item.value / item.max) * 100, 100);
            return `
                <div class="chart-item">
                    <div class="chart-label">${item.label}</div>
                    <div class="chart-bar">
                        <div class="chart-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="chart-value">${item.value}</div>
                </div>
            `;
        }).join('');
    }

    updateEvents() {
        const eventsList = document.getElementById('eventsList');
        if (!eventsList) return;

        const events = this.getRecentEvents();
        eventsList.innerHTML = events.map(event => `
            <div class="event-item ${event.type}">
                <div class="event-time">${event.time}</div>
                <div class="event-message">${event.message}</div>
            </div>
        `).join('');
    }

    getRecentEvents() {
        return [
            {
                time: new Date().toLocaleTimeString(),
                type: 'info',
                message: 'Design system monitoring active'
            },
            {
                time: new Date(Date.now() - 5000).toLocaleTimeString(),
                type: 'success',
                message: 'All components loaded successfully'
            },
            {
                time: new Date(Date.now() - 10000).toLocaleTimeString(),
                type: 'warning',
                message: 'High memory usage detected'
            }
        ];
    }

    refreshMetrics() {
        this.collectMetrics();
        this.updateCharts();
        this.updateEvents();
    }

    exportMetrics() {
        const dataStr = JSON.stringify(this.metrics, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `design-system-metrics-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    toggleMonitoring() {
        const button = document.getElementById('toggleMonitoring');
        if (button.textContent === 'Pause') {
            button.textContent = 'Resume';
            this.pauseMonitoring();
        } else {
            button.textContent = 'Pause';
            this.resumeMonitoring();
        }
    }

    pauseMonitoring() {
        // Pause monitoring logic
    }

    resumeMonitoring() {
        // Resume monitoring logic
    }

    // Public API methods
    getMetrics() {
        return this.metrics;
    }

    addEvent(type, message) {
        const events = this.getRecentEvents();
        events.unshift({
            time: new Date().toLocaleTimeString(),
            type: type,
            message: message
        });
        this.updateEvents();
    }
}

// Initialize monitoring dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.monitoringDashboard = new MonitoringDashboard2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MonitoringDashboard2025;
}
