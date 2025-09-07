/**
 * Post-Deployment Monitoring 2025 - JavaScript
 * Monitor production deployment and gather user feedback
 */

class PostDeploymentMonitoring2025 {
    constructor() {
        this.monitoringData = {
            performance: {},
            errors: {},
            userFeedback: {},
            accessibility: {},
            usage: {}
        };
        this.alerts = [];
        this.isMonitoring = false;
        this.init();
    }

    init() {
        this.setupMonitoringUI();
        this.bindMonitoringEvents();
        this.startMonitoring();
    }

    setupMonitoringUI() {
        const monitoringUI = document.createElement('div');
        monitoringUI.className = 'post-deployment-monitoring';
        monitoringUI.innerHTML = `
            <div class="monitoring-header">
                <h3>Post-Deployment Monitoring</h3>
                <div class="monitoring-controls">
                    <button class="btn btn-primary" id="startMonitoring">Start Monitoring</button>
                    <button class="btn btn-secondary" id="pauseMonitoring">Pause</button>
                    <button class="btn btn-secondary" id="exportData">Export Data</button>
                    <button class="btn btn-danger" id="stopMonitoring">Stop</button>
                </div>
            </div>
            <div class="monitoring-content">
                <div class="monitoring-tabs">
                    <button class="tab-btn active" data-tab="performance">Performance</button>
                    <button class="tab-btn" data-tab="errors">Errors</button>
                    <button class="tab-btn" data-tab="feedback">User Feedback</button>
                    <button class="tab-btn" data-tab="accessibility">Accessibility</button>
                    <button class="tab-btn" data-tab="usage">Usage</button>
                </div>
                <div class="monitoring-panels">
                    <div class="monitoring-panel active" id="performance-panel">
                        <div class="panel-content" id="performanceContent"></div>
                    </div>
                    <div class="monitoring-panel" id="errors-panel">
                        <div class="panel-content" id="errorsContent"></div>
                    </div>
                    <div class="monitoring-panel" id="feedback-panel">
                        <div class="panel-content" id="feedbackContent"></div>
                    </div>
                    <div class="monitoring-panel" id="accessibility-panel">
                        <div class="panel-content" id="accessibilityContent"></div>
                    </div>
                    <div class="monitoring-panel" id="usage-panel">
                        <div class="panel-content" id="usageContent"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(monitoringUI);
    }

    bindMonitoringEvents() {
        document.getElementById('startMonitoring').addEventListener('click', () => {
            this.startMonitoring();
        });

        document.getElementById('pauseMonitoring').addEventListener('click', () => {
            this.pauseMonitoring();
        });

        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('stopMonitoring').addEventListener('click', () => {
            this.stopMonitoring();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.updateMonitoringUI('Monitoring started');
        
        // Start monitoring intervals
        this.performanceInterval = setInterval(() => {
            this.monitorPerformance();
        }, 5000);

        this.errorInterval = setInterval(() => {
            this.monitorErrors();
        }, 10000);

        this.feedbackInterval = setInterval(() => {
            this.monitorUserFeedback();
        }, 30000);

        this.accessibilityInterval = setInterval(() => {
            this.monitorAccessibility();
        }, 60000);

        this.usageInterval = setInterval(() => {
            this.monitorUsage();
        }, 30000);

        // Initial data collection
        this.collectInitialData();
    }

    pauseMonitoring() {
        this.isMonitoring = false;
        this.updateMonitoringUI('Monitoring paused');
        
        // Clear intervals
        if (this.performanceInterval) clearInterval(this.performanceInterval);
        if (this.errorInterval) clearInterval(this.errorInterval);
        if (this.feedbackInterval) clearInterval(this.feedbackInterval);
        if (this.accessibilityInterval) clearInterval(this.accessibilityInterval);
        if (this.usageInterval) clearInterval(this.usageInterval);
    }

    stopMonitoring() {
        this.pauseMonitoring();
        this.updateMonitoringUI('Monitoring stopped');
    }

    collectInitialData() {
        this.monitorPerformance();
        this.monitorErrors();
        this.monitorUserFeedback();
        this.monitorAccessibility();
        this.monitorUsage();
    }

    monitorPerformance() {
        const performanceData = {
            timestamp: new Date().toISOString(),
            loadTime: performance.now(),
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0,
            pageSize: document.documentElement.outerHTML.length,
            resourceCount: document.querySelectorAll('link, script, img').length,
            domElements: document.querySelectorAll('*').length
        };

        this.monitoringData.performance[performanceData.timestamp] = performanceData;
        this.updatePerformancePanel();
        this.checkPerformanceAlerts(performanceData);
    }

    monitorErrors() {
        const errorData = {
            timestamp: new Date().toISOString(),
            jsErrors: window.jsErrors || 0,
            cssErrors: window.cssErrors || 0,
            networkErrors: window.networkErrors || 0,
            accessibilityErrors: window.accessibilityErrors || 0
        };

        this.monitoringData.errors[errorData.timestamp] = errorData;
        this.updateErrorsPanel();
        this.checkErrorAlerts(errorData);
    }

    monitorUserFeedback() {
        const feedbackData = {
            timestamp: new Date().toISOString(),
            totalFeedback: this.getTotalFeedback(),
            positiveFeedback: this.getPositiveFeedback(),
            negativeFeedback: this.getNegativeFeedback(),
            averageRating: this.getAverageRating(),
            recentFeedback: this.getRecentFeedback()
        };

        this.monitoringData.userFeedback[feedbackData.timestamp] = feedbackData;
        this.updateFeedbackPanel();
        this.checkFeedbackAlerts(feedbackData);
    }

    monitorAccessibility() {
        const accessibilityData = {
            timestamp: new Date().toISOString(),
            contrastIssues: this.getContrastIssues(),
            focusIssues: this.getFocusIssues(),
            keyboardIssues: this.getKeyboardIssues(),
            screenReaderIssues: this.getScreenReaderIssues(),
            wcagCompliance: this.getWCAGCompliance()
        };

        this.monitoringData.accessibility[accessibilityData.timestamp] = accessibilityData;
        this.updateAccessibilityPanel();
        this.checkAccessibilityAlerts(accessibilityData);
    }

    monitorUsage() {
        const usageData = {
            timestamp: new Date().toISOString(),
            activeUsers: this.getActiveUsers(),
            pageViews: this.getPageViews(),
            sessionDuration: this.getSessionDuration(),
            bounceRate: this.getBounceRate(),
            conversionRate: this.getConversionRate()
        };

        this.monitoringData.usage[usageData.timestamp] = usageData;
        this.updateUsagePanel();
        this.checkUsageAlerts(usageData);
    }

    updatePerformancePanel() {
        const panel = document.getElementById('performanceContent');
        if (!panel) return;

        const data = Object.values(this.monitoringData.performance);
        const latest = data[data.length - 1];

        panel.innerHTML = `
            <div class="performance-metrics">
                <div class="metric-card">
                    <h4>Load Time</h4>
                    <div class="metric-value">${latest.loadTime.toFixed(2)}ms</div>
                </div>
                <div class="metric-card">
                    <h4>Memory Usage</h4>
                    <div class="metric-value">${latest.memoryUsage.toFixed(2)}MB</div>
                </div>
                <div class="metric-card">
                    <h4>Page Size</h4>
                    <div class="metric-value">${(latest.pageSize / 1024).toFixed(2)}KB</div>
                </div>
                <div class="metric-card">
                    <h4>Resources</h4>
                    <div class="metric-value">${latest.resourceCount}</div>
                </div>
            </div>
            <div class="performance-chart">
                <canvas id="performanceChart" width="400" height="200"></canvas>
            </div>
        `;

        this.drawPerformanceChart();
    }

    updateErrorsPanel() {
        const panel = document.getElementById('errorsContent');
        if (!panel) return;

        const data = Object.values(this.monitoringData.errors);
        const latest = data[data.length - 1];

        panel.innerHTML = `
            <div class="error-metrics">
                <div class="metric-card">
                    <h4>JS Errors</h4>
                    <div class="metric-value">${latest.jsErrors}</div>
                </div>
                <div class="metric-card">
                    <h4>CSS Errors</h4>
                    <div class="metric-value">${latest.cssErrors}</div>
                </div>
                <div class="metric-card">
                    <h4>Network Errors</h4>
                    <div class="metric-value">${latest.networkErrors}</div>
                </div>
                <div class="metric-card">
                    <h4>A11y Errors</h4>
                    <div class="metric-value">${latest.accessibilityErrors}</div>
                </div>
            </div>
            <div class="error-chart">
                <canvas id="errorChart" width="400" height="200"></canvas>
            </div>
        `;

        this.drawErrorChart();
    }

    updateFeedbackPanel() {
        const panel = document.getElementById('feedbackContent');
        if (!panel) return;

        const data = Object.values(this.monitoringData.userFeedback);
        const latest = data[data.length - 1];

        panel.innerHTML = `
            <div class="feedback-metrics">
                <div class="metric-card">
                    <h4>Total Feedback</h4>
                    <div class="metric-value">${latest.totalFeedback}</div>
                </div>
                <div class="metric-card">
                    <h4>Positive</h4>
                    <div class="metric-value">${latest.positiveFeedback}</div>
                </div>
                <div class="metric-card">
                    <h4>Negative</h4>
                    <div class="metric-value">${latest.negativeFeedback}</div>
                </div>
                <div class="metric-card">
                    <h4>Avg Rating</h4>
                    <div class="metric-value">${latest.averageRating.toFixed(1)}/5</div>
                </div>
            </div>
            <div class="feedback-list">
                <h4>Recent Feedback</h4>
                <div class="feedback-items">
                    ${latest.recentFeedback.map(feedback => `
                        <div class="feedback-item">
                            <div class="feedback-rating">${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}</div>
                            <div class="feedback-text">${feedback.text}</div>
                            <div class="feedback-time">${new Date(feedback.timestamp).toLocaleTimeString()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    updateAccessibilityPanel() {
        const panel = document.getElementById('accessibilityContent');
        if (!panel) return;

        const data = Object.values(this.monitoringData.accessibility);
        const latest = data[data.length - 1];

        panel.innerHTML = `
            <div class="accessibility-metrics">
                <div class="metric-card">
                    <h4>Contrast Issues</h4>
                    <div class="metric-value">${latest.contrastIssues}</div>
                </div>
                <div class="metric-card">
                    <h4>Focus Issues</h4>
                    <div class="metric-value">${latest.focusIssues}</div>
                </div>
                <div class="metric-card">
                    <h4>Keyboard Issues</h4>
                    <div class="metric-value">${latest.keyboardIssues}</div>
                </div>
                <div class="metric-card">
                    <h4>WCAG Compliance</h4>
                    <div class="metric-value">${latest.wcagCompliance}%</div>
                </div>
            </div>
            <div class="accessibility-chart">
                <canvas id="accessibilityChart" width="400" height="200"></canvas>
            </div>
        `;

        this.drawAccessibilityChart();
    }

    updateUsagePanel() {
        const panel = document.getElementById('usageContent');
        if (!panel) return;

        const data = Object.values(this.monitoringData.usage);
        const latest = data[data.length - 1];

        panel.innerHTML = `
            <div class="usage-metrics">
                <div class="metric-card">
                    <h4>Active Users</h4>
                    <div class="metric-value">${latest.activeUsers}</div>
                </div>
                <div class="metric-card">
                    <h4>Page Views</h4>
                    <div class="metric-value">${latest.pageViews}</div>
                </div>
                <div class="metric-card">
                    <h4>Session Duration</h4>
                    <div class="metric-value">${latest.sessionDuration.toFixed(1)}min</div>
                </div>
                <div class="metric-card">
                    <h4>Bounce Rate</h4>
                    <div class="metric-value">${latest.bounceRate.toFixed(1)}%</div>
                </div>
            </div>
            <div class="usage-chart">
                <canvas id="usageChart" width="400" height="200"></canvas>
            </div>
        `;

        this.drawUsageChart();
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.monitoring-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-panel`).classList.add('active');
    }

    drawPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = Object.values(this.monitoringData.performance);
        
        // Simple chart drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = (index / (data.length - 1)) * canvas.width;
            const y = canvas.height - (point.loadTime / 1000) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }

    drawErrorChart() {
        const canvas = document.getElementById('errorChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = Object.values(this.monitoringData.errors);
        
        // Simple chart drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = (index / (data.length - 1)) * canvas.width;
            const y = canvas.height - (point.jsErrors / 10) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }

    drawAccessibilityChart() {
        const canvas = document.getElementById('accessibilityChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = Object.values(this.monitoringData.accessibility);
        
        // Simple chart drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = (index / (data.length - 1)) * canvas.width;
            const y = canvas.height - (point.wcagCompliance / 100) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }

    drawUsageChart() {
        const canvas = document.getElementById('usageChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = Object.values(this.monitoringData.usage);
        
        // Simple chart drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = (index / (data.length - 1)) * canvas.width;
            const y = canvas.height - (point.activeUsers / 100) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }

    // Alert checking methods
    checkPerformanceAlerts(data) {
        if (data.loadTime > 3000) {
            this.addAlert('warning', 'High load time detected', `Load time: ${data.loadTime.toFixed(2)}ms`);
        }
        if (data.memoryUsage > 100) {
            this.addAlert('warning', 'High memory usage', `Memory usage: ${data.memoryUsage.toFixed(2)}MB`);
        }
    }

    checkErrorAlerts(data) {
        if (data.jsErrors > 5) {
            this.addAlert('error', 'High JavaScript error rate', `${data.jsErrors} JS errors detected`);
        }
        if (data.cssErrors > 2) {
            this.addAlert('error', 'CSS errors detected', `${data.cssErrors} CSS errors`);
        }
    }

    checkFeedbackAlerts(data) {
        if (data.averageRating < 3) {
            this.addAlert('warning', 'Low user satisfaction', `Average rating: ${data.averageRating.toFixed(1)}/5`);
        }
        if (data.negativeFeedback > data.positiveFeedback) {
            this.addAlert('warning', 'More negative feedback than positive', 'User satisfaction declining');
        }
    }

    checkAccessibilityAlerts(data) {
        if (data.wcagCompliance < 95) {
            this.addAlert('warning', 'Accessibility compliance below target', `WCAG compliance: ${data.wcagCompliance}%`);
        }
        if (data.contrastIssues > 0) {
            this.addAlert('warning', 'Color contrast issues detected', `${data.contrastIssues} contrast issues`);
        }
    }

    checkUsageAlerts(data) {
        if (data.bounceRate > 70) {
            this.addAlert('warning', 'High bounce rate', `Bounce rate: ${data.bounceRate.toFixed(1)}%`);
        }
        if (data.sessionDuration < 2) {
            this.addAlert('warning', 'Low session duration', `Session duration: ${data.sessionDuration.toFixed(1)} minutes`);
        }
    }

    addAlert(type, title, message) {
        const alert = {
            id: Date.now(),
            type,
            title,
            message,
            timestamp: new Date().toISOString()
        };
        
        this.alerts.push(alert);
        this.displayAlert(alert);
    }

    displayAlert(alert) {
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${alert.type}`;
        alertElement.innerHTML = `
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.message}</p>
                <div class="alert-time">${new Date(alert.timestamp).toLocaleTimeString()}</div>
            </div>
        `;
        
        document.body.appendChild(alertElement);
        
        setTimeout(() => {
            alertElement.remove();
        }, 5000);
    }

    // Data collection methods
    getTotalFeedback() {
        return window.feedbackCollection ? window.feedbackCollection.getFeedbackData().length : 0;
    }

    getPositiveFeedback() {
        if (!window.feedbackCollection) return 0;
        const feedback = window.feedbackCollection.getFeedbackData();
        return feedback.filter(f => f.rating >= 4).length;
    }

    getNegativeFeedback() {
        if (!window.feedbackCollection) return 0;
        const feedback = window.feedbackCollection.getFeedbackData();
        return feedback.filter(f => f.rating <= 2).length;
    }

    getAverageRating() {
        if (!window.feedbackCollection) return 0;
        const feedback = window.feedbackCollection.getFeedbackData();
        if (feedback.length === 0) return 0;
        return feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
    }

    getRecentFeedback() {
        if (!window.feedbackCollection) return [];
        const feedback = window.feedbackCollection.getFeedbackData();
        return feedback.slice(-5).map(f => ({
            rating: f.rating,
            text: f.title,
            timestamp: f.timestamp
        }));
    }

    getContrastIssues() {
        return window.accessibilityErrors ? window.accessibilityErrors.contrast || 0 : 0;
    }

    getFocusIssues() {
        return window.accessibilityErrors ? window.accessibilityErrors.focus || 0 : 0;
    }

    getKeyboardIssues() {
        return window.accessibilityErrors ? window.accessibilityErrors.keyboard || 0 : 0;
    }

    getScreenReaderIssues() {
        return window.accessibilityErrors ? window.accessibilityErrors.screenReader || 0 : 0;
    }

    getWCAGCompliance() {
        return window.accessibilityErrors ? window.accessibilityErrors.wcagCompliance || 100 : 100;
    }

    getActiveUsers() {
        return Math.floor(Math.random() * 100) + 50; // Simulated data
    }

    getPageViews() {
        return Math.floor(Math.random() * 1000) + 500; // Simulated data
    }

    getSessionDuration() {
        return Math.random() * 10 + 5; // Simulated data
    }

    getBounceRate() {
        return Math.random() * 30 + 20; // Simulated data
    }

    getConversionRate() {
        return Math.random() * 10 + 5; // Simulated data
    }

    updateMonitoringUI(message) {
        const header = document.querySelector('.monitoring-header h3');
        if (header) {
            header.textContent = `Post-Deployment Monitoring - ${message}`;
        }
    }

    exportData() {
        const dataStr = JSON.stringify(this.monitoringData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `post-deployment-monitoring-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Public API methods
    getMonitoringData() {
        return this.monitoringData;
    }

    getAlerts() {
        return this.alerts;
    }

    isMonitoringActive() {
        return this.isMonitoring;
    }
}

// Initialize post-deployment monitoring
document.addEventListener('DOMContentLoaded', () => {
    window.postDeploymentMonitoring = new PostDeploymentMonitoring2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PostDeploymentMonitoring2025;
}
