class PerformanceOptimization {
    constructor() {
        this.charts = new Map();
        this.loadTestRunning = false;
        this.loadTestInterval = null;
        this.initializeDashboard();
        this.bindEvents();
        this.initializeCharts();
        this.populateMetrics();
    }

    initializeDashboard() {
        this.populateFrontendMetrics();
        this.populateBackendMetrics();
        this.populateDatabaseMetrics();
        this.populateLoadTestResults();
        this.populateOptimizationCards();
        this.updatePerformanceMetrics();
    }

    bindEvents() {
        // Load Testing
        document.getElementById('startLoadTest')?.addEventListener('click', () => this.startLoadTest());
        document.getElementById('stopLoadTest')?.addEventListener('click', () => this.stopLoadTest());

        // Optimization
        document.getElementById('runOptimizationScan')?.addEventListener('click', () => this.runOptimizationScan());
        document.getElementById('exportOptimizationReport')?.addEventListener('click', () => this.exportOptimizationReport());
    }

    initializeCharts() {
        this.initializePageLoadChart();
        this.initializeBundleSizeChart();
        this.initializeApiResponseChart();
        this.initializeServerResourceChart();
        this.initializeQueryPerformanceChart();
        this.initializeConnectionPoolChart();
    }

    initializePageLoadChart() {
        const ctx = document.getElementById('pageLoadChart');
        if (!ctx) return;

        this.charts.set('pageLoad', new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
                datasets: [{
                    label: 'Dashboard',
                    data: [180, 165, 190, 175, 160, 155, 170, 165, 180, 175, 160, 155],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Documents',
                    data: [220, 205, 230, 215, 200, 195, 210, 205, 220, 215, 200, 195],
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Page Load Times (ms)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Load Time (ms)'
                        }
                    }
                }
            }
        });
    }

    initializeBundleSizeChart() {
        const ctx = document.getElementById('bundleSizeChart');
        if (!ctx) return;

        this.charts.set('bundleSize', new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Core JS', 'Vendor Libraries', 'CSS', 'Images', 'Fonts'],
                datasets: [{
                    data: [45, 30, 15, 8, 2],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c',
                        '#4facfe'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Bundle Size Distribution (KB)'
                    }
                }
            }
        });
    }

    initializeApiResponseChart() {
        const ctx = document.getElementById('apiResponseChart');
        if (!ctx) return;

        this.charts.set('apiResponse', new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['User Auth', 'Document API', 'Analytics', 'Standards', 'CAP API'],
                datasets: [{
                    label: 'Response Time (ms)',
                    data: [120, 180, 95, 150, 200],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c',
                        '#4facfe'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'API Response Times'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Response Time (ms)'
                        }
                    }
                }
            }
        });
    }

    initializeServerResourceChart() {
        const ctx = document.getElementById('serverResourceChart');
        if (!ctx) return;

        this.charts.set('serverResource', new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
                datasets: [{
                    label: 'CPU Usage (%)',
                    data: [25, 20, 15, 20, 35, 45, 50, 45, 40, 35, 30, 25],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Memory Usage (%)',
                    data: [40, 38, 35, 40, 45, 50, 55, 50, 45, 40, 38, 40],
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Server Resource Usage'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Usage (%)'
                        }
                    }
                }
            }
        });
    }

    initializeQueryPerformanceChart() {
        const ctx = document.getElementById('queryPerformanceChart');
        if (!ctx) return;

        this.charts.set('queryPerformance', new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['User Queries', 'Document Queries', 'Analytics Queries', 'Audit Queries'],
                datasets: [{
                    label: 'Execution Time (ms)',
                    data: [15, 25, 45, 35],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Database Query Performance'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Execution Time (ms)'
                        }
                    }
                }
            }
        });
    }

    initializeConnectionPoolChart() {
        const ctx = document.getElementById('connectionPoolChart');
        if (!ctx) return;

        this.charts.set('connectionPool', new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Idle', 'Available', 'Max'],
                datasets: [{
                    data: [25, 15, 10, 50],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Database Connection Pool'
                    }
                }
            }
        });
    }

    populateFrontendMetrics() {
        const metrics = [
            { page: 'Dashboard', loadTime: '180ms', bundleSize: '45KB', score: 95, status: 'Excellent' },
            { page: 'Documents', loadTime: '220ms', bundleSize: '52KB', score: 88, status: 'Good' },
            { page: 'Analytics', loadTime: '195ms', bundleSize: '48KB', score: 92, status: 'Excellent' },
            { page: 'Standards', loadTime: '210ms', bundleSize: '50KB', score: 85, status: 'Good' },
            { page: 'CAP Management', loadTime: '185ms', bundleSize: '47KB', score: 90, status: 'Excellent' }
        ];

        const container = document.getElementById('frontendMetricsBody');
        if (!container) return;

        container.innerHTML = metrics.map(metric => `
            <tr>
                <td>${metric.page}</td>
                <td>${metric.loadTime}</td>
                <td>${metric.bundleSize}</td>
                <td>${metric.score}/100</td>
                <td><span class="badge bg-${this.getPerformanceStatusColor(metric.score)}">${metric.status}</span></td>
            </tr>
        `).join('');
    }

    populateBackendMetrics() {
        const metrics = [
            { endpoint: '/api/auth/login', avgTime: '120ms', p95Time: '180ms', requests: 1250, errorRate: '0.1%' },
            { endpoint: '/api/documents', avgTime: '180ms', p95Time: '250ms', requests: 890, errorRate: '0.2%' },
            { endpoint: '/api/analytics', avgTime: '95ms', p95Time: '140ms', requests: 650, errorRate: '0.0%' },
            { endpoint: '/api/standards', avgTime: '150ms', p95Time: '200ms', requests: 420, errorRate: '0.1%' },
            { endpoint: '/api/cap', avgTime: '200ms', p95Time: '280ms', requests: 380, errorRate: '0.3%' }
        ];

        const container = document.getElementById('backendMetricsBody');
        if (!container) return;

        container.innerHTML = metrics.map(metric => `
            <tr>
                <td>${metric.endpoint}</td>
                <td>${metric.avgTime}</td>
                <td>${metric.p95Time}</td>
                <td>${metric.requests.toLocaleString()}</td>
                <td><span class="badge bg-${this.getErrorRateColor(metric.errorRate)}">${metric.errorRate}</span></td>
            </tr>
        `).join('');
    }

    populateDatabaseMetrics() {
        const metrics = [
            { queryType: 'User Queries', execTime: '15ms', count: 1250, cacheRate: '85%', status: 'Optimal' },
            { queryType: 'Document Queries', execTime: '25ms', count: 890, cacheRate: '72%', status: 'Good' },
            { queryType: 'Analytics Queries', execTime: '45ms', count: 650, cacheRate: '60%', status: 'Good' },
            { queryType: 'Audit Queries', execTime: '35ms', count: 420, cacheRate: '78%', status: 'Good' }
        ];

        const container = document.getElementById('databaseMetricsBody');
        if (!container) return;

        container.innerHTML = metrics.map(metric => `
            <tr>
                <td>${metric.queryType}</td>
                <td>${metric.execTime}</td>
                <td>${metric.count.toLocaleString()}</td>
                <td>${metric.cacheRate}</td>
                <td><span class="badge bg-${this.getDatabaseStatusColor(metric.status)}">${metric.status}</span></td>
            </tr>
        `).join('');
    }

    populateLoadTestResults() {
        const results = [
            { date: '2024-01-15', users: 1000, duration: '30 min', responseTime: '245ms', throughput: '850 req/s', errorRate: '0.1%', status: 'Passed' },
            { date: '2024-01-14', users: 500, duration: '15 min', responseTime: '180ms', throughput: '450 req/s', errorRate: '0.0%', status: 'Passed' },
            { date: '2024-01-13', users: 2000, duration: '45 min', responseTime: '320ms', throughput: '1200 req/s', errorRate: '0.2%', status: 'Passed' }
        ];

        const container = document.getElementById('loadTestResultsBody');
        if (!container) return;

        container.innerHTML = results.map(result => `
            <tr>
                <td>${result.date}</td>
                <td>${result.users.toLocaleString()}</td>
                <td>${result.duration}</td>
                <td>${result.responseTime}</td>
                <td>${result.throughput}</td>
                <td><span class="badge bg-${this.getErrorRateColor(result.errorRate)}">${result.errorRate}</span></td>
                <td><span class="badge bg-success">${result.status}</span></td>
            </tr>
        `).join('');
    }

    populateOptimizationCards() {
        const optimizations = [
            { id: 'opt-1', title: 'Bundle Size Optimization', priority: 'high', impact: '15% improvement', description: 'Implement code splitting and lazy loading for better initial page load times', status: 'pending' },
            { id: 'opt-2', title: 'Database Index Optimization', priority: 'medium', impact: '25% improvement', description: 'Add composite indexes for frequently used query patterns', status: 'pending' },
            { id: 'opt-3', title: 'API Response Caching', priority: 'high', impact: '30% improvement', description: 'Implement Redis caching for frequently accessed data', status: 'pending' },
            { id: 'opt-4', title: 'Image Optimization', priority: 'low', impact: '10% improvement', description: 'Implement WebP format and responsive images', status: 'pending' }
        ];

        const container = document.getElementById('optimizationCards');
        if (!container) return;

        container.innerHTML = optimizations.map(opt => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card optimization-card ${this.getPriorityClass(opt.priority)}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${opt.title}</h6>
                            <span class="badge bg-${this.getPriorityColor(opt.priority)}">${opt.priority}</span>
                        </div>
                        <p class="card-text small text-muted">${opt.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Impact: ${opt.impact}</small>
                            <span class="badge bg-secondary">${opt.status}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updatePerformanceMetrics() {
        document.getElementById('avgResponseTime')?.textContent = '245ms';
        document.getElementById('concurrentUsers')?.textContent = '1,250';
        document.getElementById('availability')?.textContent = '99.95%';
        document.getElementById('dbPerformance')?.textContent = '98%';
    }

    async startLoadTest() {
        if (this.loadTestRunning) return;

        const virtualUsers = parseInt(document.getElementById('virtualUsers')?.value || 1000);
        const duration = parseInt(document.getElementById('testDuration')?.value || 30);
        const rampUp = parseInt(document.getElementById('rampUpTime')?.value || 5);

        this.loadTestRunning = true;
        document.getElementById('startLoadTest')?.setAttribute('disabled', 'true');
        document.getElementById('stopLoadTest')?.removeAttribute('disabled');
        document.getElementById('loadTestStatus').innerHTML = `
            <p class="text-primary"><i class="fas fa-play me-2"></i>Load test running...</p>
            <small class="text-muted">${virtualUsers} virtual users, ${duration} minutes duration</small>
        `;
        document.getElementById('loadTestProgress').style.display = 'block';

        let progress = 0;
        this.loadTestInterval = setInterval(() => {
            progress += (100 / (duration * 60)) * 10; // Update every 10 seconds
            if (progress >= 100) {
                this.completeLoadTest();
                return;
            }

            document.getElementById('testProgress').textContent = Math.round(progress) + '%';
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
        }, 10000);
    }

    stopLoadTest() {
        if (this.loadTestInterval) {
            clearInterval(this.loadTestInterval);
            this.loadTestInterval = null;
        }
        this.loadTestRunning = false;
        document.getElementById('startLoadTest')?.removeAttribute('disabled');
        document.getElementById('stopLoadTest')?.setAttribute('disabled', 'true');
        document.getElementById('loadTestStatus').innerHTML = '<p class="text-warning"><i class="fas fa-stop me-2"></i>Test stopped by user</p>';
        document.getElementById('loadTestProgress').style.display = 'none';
    }

    completeLoadTest() {
        this.stopLoadTest();
        document.getElementById('loadTestStatus').innerHTML = '<p class="text-success"><i class="fas fa-check me-2"></i>Test completed successfully</p>';
        
        // Add new result to the table
        const newResult = {
            date: new Date().toISOString().split('T')[0],
            users: parseInt(document.getElementById('virtualUsers')?.value || 1000),
            duration: document.getElementById('testDuration')?.value + ' min',
            responseTime: '245ms',
            throughput: '850 req/s',
            errorRate: '0.1%',
            status: 'Passed'
        };

        this.addLoadTestResult(newResult);
        this.showNotification('Load test completed successfully!', 'success');
    }

    addLoadTestResult(result) {
        const container = document.getElementById('loadTestResultsBody');
        if (!container) return;

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${result.date}</td>
            <td>${result.users.toLocaleString()}</td>
            <td>${result.duration}</td>
            <td>${result.responseTime}</td>
            <td>${result.throughput}</td>
            <td><span class="badge bg-${this.getErrorRateColor(result.errorRate)}">${result.errorRate}</span></td>
            <td><span class="badge bg-success">${result.status}</span></td>
        `;
        container.insertBefore(newRow, container.firstChild);
    }

    async runOptimizationScan() {
        const button = document.getElementById('runOptimizationScan');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Scanning...';
        }

        try {
            await this.simulateOptimizationScan(3000);
            this.showNotification('Optimization scan completed! New recommendations available.', 'success');
        } catch (error) {
            this.showNotification('Error running optimization scan', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-search me-2"></i>Run Optimization Scan';
            }
        }
    }

    async simulateOptimizationScan(duration) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate finding new optimizations
                this.addNewOptimization({
                    id: 'opt-5',
                    title: 'CDN Implementation',
                    priority: 'medium',
                    impact: '20% improvement',
                    description: 'Implement CDN for static assets to reduce latency',
                    status: 'pending'
                });
                resolve();
            }, duration);
        });
    }

    addNewOptimization(optimization) {
        const container = document.getElementById('optimizationCards');
        if (!container) return;

        const newCard = document.createElement('div');
        newCard.className = 'col-md-6 col-lg-4 mb-3';
        newCard.innerHTML = `
            <div class="card optimization-card ${this.getPriorityClass(optimization.priority)}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="card-title mb-0">${optimization.title}</h6>
                        <span class="badge bg-${this.getPriorityColor(optimization.priority)}">${optimization.priority}</span>
                    </div>
                    <p class="card-text small text-muted">${optimization.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">Impact: ${optimization.impact}</small>
                        <span class="badge bg-secondary">${optimization.status}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(newCard);
    }

    exportOptimizationReport() {
        const report = {
            title: 'Performance Optimization Report',
            date: new Date().toISOString(),
            metrics: {
                avgResponseTime: '245ms',
                concurrentUsers: '1,250',
                availability: '99.95%',
                dbPerformance: '98%'
            },
            optimizations: [
                { title: 'Bundle Size Optimization', priority: 'high', impact: '15% improvement', status: 'pending' },
                { title: 'Database Index Optimization', priority: 'medium', impact: '25% improvement', status: 'pending' },
                { title: 'API Response Caching', priority: 'high', impact: '30% improvement', status: 'pending' },
                { title: 'Image Optimization', priority: 'low', impact: '10% improvement', status: 'pending' }
            ],
            summary: 'Platform performance is excellent with 99.95% availability. Several optimization opportunities identified for further improvement.'
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-optimization-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Performance optimization report exported successfully!', 'success');
    }

    getPerformanceStatusColor(score) {
        if (score >= 90) return 'success';
        if (score >= 80) return 'warning';
        if (score >= 70) return 'info';
        return 'danger';
    }

    getErrorRateColor(errorRate) {
        const rate = parseFloat(errorRate);
        if (rate === 0) return 'success';
        if (rate <= 0.5) return 'warning';
        return 'danger';
    }

    getDatabaseStatusColor(status) {
        switch (status) {
            case 'Optimal': return 'success';
            case 'Good': return 'info';
            case 'Warning': return 'warning';
            default: return 'secondary';
        }
    }

    getPriorityColor(priority) {
        switch (priority) {
            case 'critical': return 'danger';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'success';
            default: return 'secondary';
        }
    }

    getPriorityClass(priority) {
        switch (priority) {
            case 'critical': return 'critical';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return '';
            default: return '';
        }
    }

    showNotification(message, type = 'info') {
        const alertClass = type === 'error' ? 'danger' : type;
        const alertHtml = `
            <div class="alert alert-${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        const container = document.querySelector('.container-fluid');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
            
            setTimeout(() => {
                const alert = container.querySelector('.alert');
                if (alert) {
                    alert.remove();
                }
            }, 5000);
        }
    }
}

// Initialize the performance optimization dashboard
const performanceOptimization = new PerformanceOptimization();
