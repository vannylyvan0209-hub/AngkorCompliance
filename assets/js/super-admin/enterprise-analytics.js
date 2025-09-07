// Enterprise Analytics System for Super Admin
class EnterpriseAnalyticsSystem {
    constructor() {
        this.currentUser = null;
        this.factories = [];
        this.analytics = {};
        this.charts = {};
        this.filters = {
            timeRange: '30d',
            factory: 'all',
            metricType: 'all',
            comparison: 'none'
        };
        
        this.init();
    }
    
    async init() {
        console.log('📈 Initializing Enterprise Analytics System...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize navigation
        this.initializeNavigation();
        
        // Load initial data
        await this.loadInitialData();
        
        // Initialize UI
        this.initializeUI();
        
        // Initialize charts
        this.initializeCharts();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup real-time updates
        this.setupRealTimeUpdates();
        
        console.log('✅ Enterprise Analytics System initialized');
    }
    
    async initializeFirebase() {
        try {
            if (window.Firebase) {
                this.auth = window.Firebase.auth;
                this.db = window.Firebase.db;
                this.doc = window.Firebase.doc;
                this.getDoc = window.Firebase.getDoc;
                this.collection = window.Firebase.collection;
                this.addDoc = window.Firebase.addDoc;
                this.updateDoc = window.Firebase.updateDoc;
                this.deleteDoc = window.Firebase.deleteDoc;
                this.query = window.Firebase.query;
                this.where = window.Firebase.where;
                this.orderBy = window.Firebase.orderBy;
                this.onSnapshot = window.Firebase.onSnapshot;
                this.getDocs = window.Firebase.getDocs;
                this.serverTimestamp = window.Firebase.serverTimestamp;
                
                console.log('✓ Firebase initialized successfully');
                return true;
            } else {
                console.log('⚠ Firebase not available, using local mode');
                return false;
            }
        } catch (error) {
            console.error('✗ Error initializing Firebase:', error);
            return false;
        }
    }
    
    async checkAuthentication() {
        return new Promise((resolve) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        const userDocRef = this.doc(this.db, 'users', user.uid);
                        const userDoc = await this.getDoc(userDocRef);
                        
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            
                            // Only allow super admins
                            if (userData.role === 'super_admin') {
                                this.currentUser = { ...user, ...userData };
                                resolve();
                            } else {
                                console.log('❌ Access denied - super admin privileges required');
                                window.location.href = '../../login.html';
                            }
                        } else {
                            console.log('❌ User profile not found');
                            window.location.href = '../../login.html';
                        }
                    } catch (error) {
                        console.error('Error checking authentication:', error);
                        window.location.href = '../../login.html';
                    }
                } else {
                    console.log('❌ No authenticated user');
                    window.location.href = '../../login.html';
                }
            });
        });
    }
    
    initializeNavigation() {
        // Wait for navigation service to be available
        if (window.superAdminNavigation) {
            window.superAdminNavigation.updateCurrentPage('Enterprise Analytics');
        } else {
            // Retry after a short delay
            setTimeout(() => {
                this.initializeNavigation();
            }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadFactories(),
            this.loadAnalyticsData(),
            this.loadRiskData()
        ]);
        
        this.updateKeyMetrics();
        this.renderFactoryPerformance();
        this.renderRiskAssessment();
    }
    
    async loadFactories() {
        try {
            const factoriesRef = this.collection(this.db, 'factories');
            const snapshot = await this.getDocs(factoriesRef);
            this.factories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`✓ Loaded ${this.factories.length} factories`);
            
        } catch (error) {
            console.error('Error loading factories:', error);
        }
    }
    
    async loadAnalyticsData() {
        try {
            // Load compliance data
            const complianceRef = this.collection(this.db, 'compliance_metrics');
            const complianceSnapshot = await this.getDocs(complianceRef);
            this.analytics.compliance = complianceSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Load performance data
            const performanceRef = this.collection(this.db, 'performance_metrics');
            const performanceSnapshot = await this.getDocs(performanceRef);
            this.analytics.performance = performanceSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log('✓ Loaded analytics data');
            
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }
    
    async loadRiskData() {
        try {
            const risksRef = this.collection(this.db, 'risk_assessments');
            const snapshot = await this.getDocs(risksRef);
            this.analytics.risks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log('✓ Loaded risk data');
            
        } catch (error) {
            console.error('Error loading risk data:', error);
        }
    }
    
    updateKeyMetrics() {
        const totalFactories = this.factories.length;
        const overallCompliance = this.calculateOverallCompliance();
        const activeRisks = this.calculateActiveRisks();
        const totalWorkers = this.calculateTotalWorkers();
        
        // Update metric values
        document.getElementById('totalFactories').textContent = totalFactories;
        document.getElementById('overallCompliance').textContent = `${overallCompliance}%`;
        document.getElementById('activeRisks').textContent = activeRisks;
        document.getElementById('totalWorkers').textContent = totalWorkers.toLocaleString();
    }
    
    calculateOverallCompliance() {
        if (this.factories.length === 0) return 0;
        
        const totalScore = this.factories.reduce((sum, factory) => {
            return sum + (factory.complianceScore || 0);
        }, 0);
        
        return Math.round(totalScore / this.factories.length);
    }
    
    calculateActiveRisks() {
        if (!this.analytics.risks) return 0;
        
        return this.analytics.risks.filter(risk => 
            risk.status === 'active' && risk.severity === 'high'
        ).length;
    }
    
    calculateTotalWorkers() {
        return this.factories.reduce((sum, factory) => {
            return sum + (factory.workerCount || 0);
        }, 0);
    }
    
    renderFactoryPerformance() {
        const performanceTable = document.getElementById('performanceTable');
        if (!performanceTable) return;
        
        const tableBody = performanceTable.querySelector('tbody');
        if (!tableBody) return;
        
        const filteredFactories = this.getFilteredFactories();
        
        tableBody.innerHTML = filteredFactories.map(factory => `
            <tr class="factory-row">
                <td>
                    <div class="factory-info">
                        <div class="factory-avatar">
                            ${this.getFactoryInitials(factory)}
                        </div>
                        <div class="factory-details">
                            <div class="factory-name">${factory.name}</div>
                            <div class="factory-location">${factory.location}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="performance-score ${this.getScoreClass(factory.complianceScore)}">
                        ${factory.complianceScore || 0}%
                    </span>
                </td>
                <td>
                    <span class="performance-score ${this.getRiskClass(factory.riskLevel)}">
                        ${factory.riskLevel || 'Low'}
                    </span>
                </td>
                <td>${factory.activeCases || 0}</td>
                <td>${this.formatDate(factory.lastAudit)}</td>
                <td>
                    <span class="performance-score status-${factory.status}">
                        ${factory.status || 'Active'}
                    </span>
                </td>
            </tr>
        `).join('');
    }
    
    renderRiskAssessment() {
        const riskItems = document.getElementById('riskItems');
        if (!riskItems) return;
        
        const riskSummary = this.calculateRiskSummary();
        
        riskItems.innerHTML = Object.entries(riskSummary).map(([level, count]) => `
            <div class="risk-item">
                <div class="risk-icon ${level}">
                    <i data-lucide="${this.getRiskIcon(level)}"></i>
                </div>
                <div class="risk-content">
                    <div class="risk-title-text">${this.getRiskTitle(level)} Risk</div>
                    <div class="risk-description">${this.getRiskDescription(level)}</div>
                </div>
                <div class="risk-count">${count}</div>
            </div>
        `).join('');
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    calculateRiskSummary() {
        if (!this.analytics.risks) {
            return { high: 0, medium: 0, low: 0 };
        }
        
        const summary = { high: 0, medium: 0, low: 0 };
        
        this.analytics.risks.forEach(risk => {
            if (risk.status === 'active') {
                summary[risk.severity] = (summary[risk.severity] || 0) + 1;
            }
        });
        
        return summary;
    }
    
    getFilteredFactories() {
        let filtered = this.factories;
        
        if (this.filters.factory !== 'all') {
            filtered = filtered.filter(f => f.id === this.filters.factory);
        }
        
        return filtered;
    }
    
    initializeUI() {
        this.initializeFilters();
    }
    
    initializeFilters() {
        const timeRangeFilter = document.getElementById('timeRangeFilter');
        const factoryFilter = document.getElementById('factoryFilter');
        const metricTypeFilter = document.getElementById('metricTypeFilter');
        const comparisonFilter = document.getElementById('comparisonFilter');
        
        if (timeRangeFilter) {
            timeRangeFilter.addEventListener('change', (e) => {
                this.filters.timeRange = e.target.value;
                this.updateCharts();
            });
        }
        
        if (factoryFilter) {
            // Populate factory filter
            factoryFilter.innerHTML = '<option value="all">All Factories</option>';
            this.factories.forEach(factory => {
                const option = document.createElement('option');
                option.value = factory.id;
                option.textContent = factory.name;
                factoryFilter.appendChild(option);
            });
            
            factoryFilter.addEventListener('change', (e) => {
                this.filters.factory = e.target.value;
                this.renderFactoryPerformance();
                this.updateCharts();
            });
        }
        
        if (metricTypeFilter) {
            metricTypeFilter.addEventListener('change', (e) => {
                this.filters.metricType = e.target.value;
                this.updateCharts();
            });
        }
        
        if (comparisonFilter) {
            comparisonFilter.addEventListener('change', (e) => {
                this.filters.comparison = e.target.value;
                this.updateCharts();
            });
        }
    }
    
    initializeCharts() {
        this.initializeComplianceTrendsChart();
        this.initializeRiskDistributionChart();
    }
    
    initializeComplianceTrendsChart() {
        const ctx = document.getElementById('complianceTrendsChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.getComplianceTrendsData();
        
        this.charts.complianceTrends = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Overall Compliance',
                        data: data.compliance,
                        borderColor: 'var(--primary-500)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Industry Average',
                        data: data.industryAverage,
                        borderColor: 'var(--neutral-400)',
                        backgroundColor: 'rgba(156, 163, 175, 0.1)',
                        tension: 0.4,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    initializeRiskDistributionChart() {
        const ctx = document.getElementById('riskDistributionChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.getRiskDistributionData();
        
        this.charts.riskDistribution = new Chart(chartCtx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'var(--danger-500)',
                        'var(--warning-500)',
                        'var(--success-500)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }
    
    getComplianceTrendsData() {
        const now = new Date();
        const days = this.getDaysForTimeRange(this.filters.timeRange);
        const labels = [];
        const compliance = [];
        const industryAverage = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Mock data - in real implementation, this would come from historical data
            compliance.push(Math.floor(Math.random() * 20) + 75); // 75-95
            industryAverage.push(Math.floor(Math.random() * 15) + 70); // 70-85
        }
        
        return { labels, compliance, industryAverage };
    }
    
    getRiskDistributionData() {
        const riskSummary = this.calculateRiskSummary();
        
        return {
            labels: ['High Risk', 'Medium Risk', 'Low Risk'],
            values: [riskSummary.high, riskSummary.medium, riskSummary.low]
        };
    }
    
    getDaysForTimeRange(timeRange) {
        const ranges = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365
        };
        return ranges[timeRange] || 30;
    }
    
    updateCharts() {
        if (this.charts.complianceTrends) {
            const data = this.getComplianceTrendsData();
            this.charts.complianceTrends.data.labels = data.labels;
            this.charts.complianceTrends.data.datasets[0].data = data.compliance;
            this.charts.complianceTrends.data.datasets[1].data = data.industryAverage;
            this.charts.complianceTrends.update();
        }
        
        if (this.charts.riskDistribution) {
            const data = this.getRiskDistributionData();
            this.charts.riskDistribution.data.datasets[0].data = data.values;
            this.charts.riskDistribution.update();
        }
    }
    
    setupEventListeners() {
        // Setup global event listeners
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        // Export functionality
        window.exportAnalytics = () => {
            this.exportAnalytics();
        };
        
        window.scheduleReport = () => {
            this.scheduleReport();
        };
        
        window.toggleChartType = (chartType) => {
            this.toggleChartType(chartType);
        };
        
        window.exportChart = (chartType) => {
            this.exportChart(chartType);
        };
        
        window.refreshPerformance = () => {
            this.refreshPerformance();
        };
        
        window.exportPerformance = () => {
            this.exportPerformance();
        };
        
        window.viewAllRisks = () => {
            this.viewAllRisks();
        };
        
        window.generateRiskReport = () => {
            this.generateRiskReport();
        };
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        // Listen for factory updates
        const factoriesRef = this.collection(this.db, 'factories');
        this.onSnapshot(factoriesRef, (snapshot) => {
            this.factories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.updateKeyMetrics();
            this.renderFactoryPerformance();
        });
        
        // Listen for risk updates
        const risksRef = this.collection(this.db, 'risk_assessments');
        this.onSnapshot(risksRef, (snapshot) => {
            this.analytics.risks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.updateKeyMetrics();
            this.renderRiskAssessment();
            this.updateCharts();
        });
    }
    
    // Analytics methods
    async exportAnalytics() {
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                filters: this.filters,
                metrics: {
                    totalFactories: this.factories.length,
                    overallCompliance: this.calculateOverallCompliance(),
                    activeRisks: this.calculateActiveRisks(),
                    totalWorkers: this.calculateTotalWorkers()
                },
                factories: this.factories.map(factory => ({
                    name: factory.name,
                    location: factory.location,
                    complianceScore: factory.complianceScore || 0,
                    riskLevel: factory.riskLevel || 'Low',
                    activeCases: factory.activeCases || 0,
                    lastAudit: this.formatDate(factory.lastAudit)
                }))
            };
            
            // Convert to JSON and download
            const json = JSON.stringify(exportData, null, 2);
            this.downloadJSON(json, 'enterprise-analytics-export.json');
            
            this.showNotification('success', 'Analytics exported successfully');
            
        } catch (error) {
            console.error('Error exporting analytics:', error);
            this.showNotification('error', 'Failed to export analytics');
        }
    }
    
    async scheduleReport() {
        // Navigate to report scheduling page
        window.location.href = 'report-scheduling.html';
    }
    
    toggleChartType(chartType) {
        if (chartType === 'compliance' && this.charts.complianceTrends) {
            const currentType = this.charts.complianceTrends.config.type;
            this.charts.complianceTrends.config.type = currentType === 'line' ? 'bar' : 'line';
            this.charts.complianceTrends.update();
        } else if (chartType === 'risk' && this.charts.riskDistribution) {
            const currentType = this.charts.riskDistribution.config.type;
            this.charts.riskDistribution.config.type = currentType === 'doughnut' ? 'pie' : 'doughnut';
            this.charts.riskDistribution.update();
        }
    }
    
    exportChart(chartType) {
        if (chartType === 'compliance' && this.charts.complianceTrends) {
            const url = this.charts.complianceTrends.toBase64Image();
            this.downloadImage(url, 'compliance-trends.png');
        } else if (chartType === 'risk' && this.charts.riskDistribution) {
            const url = this.charts.riskDistribution.toBase64Image();
            this.downloadImage(url, 'risk-distribution.png');
        }
    }
    
    refreshPerformance() {
        this.loadInitialData();
        this.showNotification('success', 'Performance data refreshed');
    }
    
    exportPerformance() {
        const performanceData = this.factories.map(factory => ({
            name: factory.name,
            location: factory.location,
            complianceScore: factory.complianceScore || 0,
            riskLevel: factory.riskLevel || 'Low',
            activeCases: factory.activeCases || 0,
            lastAudit: this.formatDate(factory.lastAudit),
            status: factory.status || 'Active'
        }));
        
        const csv = this.convertToCSV(performanceData);
        this.downloadCSV(csv, 'factory-performance.csv');
        
        this.showNotification('success', 'Performance data exported');
    }
    
    viewAllRisks() {
        // Navigate to detailed risk assessment page
        window.location.href = 'risk-assessment.html';
    }
    
    generateRiskReport() {
        // Navigate to risk report generation page
        window.location.href = 'risk-report.html';
    }
    
    // Utility methods
    getFactoryInitials(factory) {
        return factory.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    
    getScoreClass(score) {
        if (score >= 90) return 'score-excellent';
        if (score >= 80) return 'score-good';
        if (score >= 70) return 'score-fair';
        return 'score-poor';
    }
    
    getRiskClass(riskLevel) {
        const level = (riskLevel || 'Low').toLowerCase();
        if (level === 'high') return 'score-poor';
        if (level === 'medium') return 'score-fair';
        return 'score-excellent';
    }
    
    getRiskIcon(level) {
        const icons = {
            high: 'alert-triangle',
            medium: 'alert-circle',
            low: 'check-circle'
        };
        return icons[level] || 'help-circle';
    }
    
    getRiskTitle(level) {
        return level.charAt(0).toUpperCase() + level.slice(1);
    }
    
    getRiskDescription(level) {
        const descriptions = {
            high: 'Critical issues requiring immediate attention',
            medium: 'Issues that need to be addressed soon',
            low: 'Minor issues or good practices'
        };
        return descriptions[level] || 'Risk assessment';
    }
    
    formatDate(date) {
        if (!date) return 'Never';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString();
    }
    
    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value}"` : value;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }
    
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    downloadJSON(json, filename) {
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    downloadImage(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    }
    
    showNotification(type, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-500)' : 'var(--error-500)'};
            color: white;
            padding: var(--space-4);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize the enterprise analytics system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the enterprise analytics system
    window.enterpriseAnalyticsSystem = new EnterpriseAnalyticsSystem();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnterpriseAnalyticsSystem;
}
