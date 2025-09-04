// Advanced Analytics and Reporting System
class AdvancedAnalytics {
    constructor() {
        this.charts = new Map();
        this.reports = new Map();
        this.dataCache = new Map();
        this.reportTemplates = new Map();
        this.exportFormats = ['pdf', 'excel', 'csv', 'json'];
        
        this.init();
    }
    
    async init() {
        console.log('📊 Initializing Advanced Analytics...');
        await this.loadReportTemplates();
        this.initializeCharts();
        this.setupDataListeners();
        console.log('✅ Advanced Analytics initialized');
    }
    
    async loadReportTemplates() {
        this.reportTemplates = new Map([
            ['compliance_overview', {
                name: 'Compliance Overview Report',
                description: 'Comprehensive compliance status and metrics',
                sections: ['summary', 'documents', 'caps', 'grievances', 'trends'],
                charts: ['compliance_score', 'document_status', 'cap_progress', 'grievance_trends'],
                filters: ['date_range', 'factory', 'category', 'status']
            }],
            ['factory_performance', {
                name: 'Factory Performance Report',
                description: 'Detailed factory performance analysis',
                sections: ['performance_metrics', 'compliance_scores', 'document_health', 'cap_status'],
                charts: ['factory_comparison', 'performance_trends', 'compliance_heatmap', 'risk_matrix'],
                filters: ['date_range', 'factory', 'metric_type']
            }],
            ['risk_assessment', {
                name: 'Risk Assessment Report',
                description: 'Comprehensive risk analysis and assessment',
                sections: ['risk_overview', 'high_risk_items', 'trend_analysis', 'recommendations'],
                charts: ['risk_matrix', 'risk_trends', 'risk_distribution', 'mitigation_progress'],
                filters: ['date_range', 'risk_level', 'category', 'factory']
            }]
        ]);
    }
    
    initializeCharts() {
        if (typeof Chart !== 'undefined') {
            Chart.defaults.font.family = 'Inter, sans-serif';
            Chart.defaults.color = '#6B7280';
            Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            Chart.defaults.plugins.tooltip.cornerRadius = 8;
            Chart.defaults.plugins.tooltip.padding = 12;
        }
    }
    
    setupDataListeners() {
        this.dataListeners = [];
        
        // Document listeners
        const docUnsubscribe = db.collection('documents')
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    this.handleDataChange('documents', change);
                });
            });
        this.dataListeners.push(docUnsubscribe);
        
        // CAP listeners
        const capUnsubscribe = db.collection('caps')
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    this.handleDataChange('caps', change);
                });
            });
        this.dataListeners.push(capUnsubscribe);
        
        // Grievance listeners
        const grievanceUnsubscribe = db.collection('grievances')
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    this.handleDataChange('grievances', change);
                });
            });
        this.dataListeners.push(grievanceUnsubscribe);
    }
    
    handleDataChange(collection, change) {
        this.dataCache.delete(collection);
        this.updateChartsForCollection(collection);
        this.notifyDataChange(collection, change);
    }
    
    updateChartsForCollection(collection) {
        this.charts.forEach((chart, chartId) => {
            if (chart.dependencies && chart.dependencies.includes(collection)) {
                this.refreshChart(chartId);
            }
        });
    }
    
    createChart(chartId, config) {
        const canvas = document.getElementById(chartId);
        if (!canvas) {
            console.error(`Canvas element with id '${chartId}' not found`);
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, config);
        
        this.charts.set(chartId, {
            instance: chart,
            config: config,
            dependencies: config.dependencies || [],
            lastUpdate: Date.now()
        });
        
        return chart;
    }
    
    async refreshChart(chartId) {
        const chartInfo = this.charts.get(chartId);
        if (!chartInfo) return;
        
        try {
            const newData = await this.getChartData(chartId);
            chartInfo.instance.data = newData;
            chartInfo.instance.update('none');
            chartInfo.lastUpdate = Date.now();
        } catch (error) {
            console.error(`Error refreshing chart ${chartId}:`, error);
        }
    }
    
    async getChartData(chartId) {
        if (this.dataCache.has(chartId)) {
            return this.dataCache.get(chartId);
        }
        
        let data;
        switch (chartId) {
            case 'compliance_score':
                data = await this.getComplianceScoreData();
                break;
            case 'document_status':
                data = await this.getDocumentStatusData();
                break;
            case 'cap_progress':
                data = await this.getCAPProgressData();
                break;
            case 'grievance_trends':
                data = await this.getGrievanceTrendsData();
                break;
            default:
                data = await this.getCustomChartData(chartId);
        }
        
        this.dataCache.set(chartId, data);
        return data;
    }
    
    async getComplianceScoreData() {
        const [documents, caps, grievances, factories] = await Promise.all([
            this.getDocumentsData(),
            this.getCAPsData(),
            this.getGrievancesData(),
            this.getFactoriesData()
        ]);
        
        return factories.map(factory => {
            const factoryDocs = documents.filter(doc => doc.factoryId === factory.id);
            const factoryCAPs = caps.filter(cap => cap.factoryId === factory.id);
            const factoryGrievances = grievances.filter(g => g.factoryId === factory.id);
            
            const docScore = this.calculateDocumentScore(factoryDocs);
            const capScore = this.calculateCAPScore(factoryCAPs);
            const grievanceScore = this.calculateGrievanceScore(factoryGrievances);
            
            const overallScore = (docScore + capScore + grievanceScore) / 3;
            
            return {
                factory: factory.name,
                score: Math.round(overallScore * 100) / 100,
                documentScore: docScore,
                capScore: capScore,
                grievanceScore: grievanceScore
            };
        });
    }
    
    async getDocumentStatusData() {
        const documents = await this.getDocumentsData();
        
        const statusCounts = {
            active: 0,
            expiring: 0,
            expired: 0
        };
        
        const now = new Date();
        documents.forEach(doc => {
            if (!doc.expirationDate) {
                statusCounts.active++;
            } else {
                const daysUntilExpiration = Math.ceil((doc.expirationDate.toDate() - now) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiration <= 0) {
                    statusCounts.expired++;
                } else if (daysUntilExpiration <= 30) {
                    statusCounts.expiring++;
                } else {
                    statusCounts.active++;
                }
            }
        });
        
        return {
            labels: ['Active', 'Expiring Soon', 'Expired'],
            datasets: [{
                data: [statusCounts.active, statusCounts.expiring, statusCounts.expired],
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                borderWidth: 0
            }]
        };
    }
    
    async getCAPProgressData() {
        const caps = await this.getCAPsData();
        
        const progressRanges = {
            '0-25%': 0,
            '26-50%': 0,
            '51-75%': 0,
            '76-100%': 0
        };
        
        caps.forEach(cap => {
            const progress = cap.progress || 0;
            if (progress <= 25) progressRanges['0-25%']++;
            else if (progress <= 50) progressRanges['26-50%']++;
            else if (progress <= 75) progressRanges['51-75%']++;
            else progressRanges['76-100%']++;
        });
        
        return {
            labels: Object.keys(progressRanges),
            datasets: [{
                data: Object.values(progressRanges),
                backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'],
                borderWidth: 0
            }]
        };
    }
    
    async getGrievanceTrendsData() {
        const grievances = await this.getGrievancesData();
        
        const monthlyData = {};
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = date.toISOString().slice(0, 7);
            monthlyData[monthKey] = 0;
        }
        
        grievances.forEach(grievance => {
            const grievanceDate = grievance.createdAt.toDate();
            const monthKey = grievanceDate.toISOString().slice(0, 7);
            if (monthlyData[monthKey] !== undefined) {
                monthlyData[monthKey]++;
            }
        });
        
        return {
            labels: Object.keys(monthlyData).map(key => {
                const [year, month] = key.split('-');
                return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }),
            datasets: [{
                label: 'Grievances',
                data: Object.values(monthlyData),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
    }
    
    calculateDocumentScore(documents) {
        if (documents.length === 0) return 1;
        
        let validDocs = 0;
        const now = new Date();
        
        documents.forEach(doc => {
            if (!doc.expirationDate) {
                validDocs++;
            } else {
                const daysUntilExpiration = Math.ceil((doc.expirationDate.toDate() - now) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiration > 0) {
                    validDocs++;
                }
            }
        });
        
        return validDocs / documents.length;
    }
    
    calculateCAPScore(caps) {
        if (caps.length === 0) return 1;
        
        const completedCAPs = caps.filter(cap => cap.status === 'completed').length;
        return completedCAPs / caps.length;
    }
    
    calculateGrievanceScore(grievances) {
        if (grievances.length === 0) return 1;
        
        const resolvedGrievances = grievances.filter(g => g.status === 'resolved').length;
        return resolvedGrievances / grievances.length;
    }
    
    async getDocumentsData() {
        const snapshot = await db.collection('documents').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    async getCAPsData() {
        const snapshot = await db.collection('caps').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    async getGrievancesData() {
        const snapshot = await db.collection('grievances').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    async getFactoriesData() {
        const snapshot = await db.collection('factories').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    async generateReport(templateId, filters = {}) {
        const template = this.reportTemplates.get(templateId);
        if (!template) {
            throw new Error(`Report template '${templateId}' not found`);
        }
        
        console.log(`📊 Generating ${template.name}...`);
        
        const reportData = {
            template: template,
            filters: filters,
            generatedAt: new Date(),
            data: {},
            summary: await this.calculateSummaryMetrics(filters)
        };
        
        return reportData;
    }
    
    async calculateSummaryMetrics(filters) {
        const [documents, caps, grievances, users] = await Promise.all([
            this.getDocumentsData(),
            this.getCAPsData(),
            this.getGrievancesData(),
            this.getUsersData()
        ]);
        
        const now = new Date();
        
        const filteredDocs = this.applyFilters(documents, filters);
        const filteredCAPs = this.applyFilters(caps, filters);
        const filteredGrievances = this.applyFilters(grievances, filters);
        
        return {
            totalDocuments: filteredDocs.length,
            expiringDocuments: filteredDocs.filter(doc => {
                if (!doc.expirationDate) return false;
                const daysUntilExpiration = Math.ceil((doc.expirationDate.toDate() - now) / (1000 * 60 * 60 * 24));
                return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
            }).length,
            totalCAPs: filteredCAPs.length,
            overdueCAPs: filteredCAPs.filter(cap => {
                if (!cap.dueDate) return false;
                return cap.dueDate.toDate() < now && cap.status !== 'completed';
            }).length,
            totalGrievances: filteredGrievances.length,
            pendingGrievances: filteredGrievances.filter(g => g.status === 'pending').length,
            totalUsers: users.length,
            activeUsers: users.filter(u => u.status === 'active').length,
            overallComplianceScore: this.calculateOverallComplianceScore(filteredDocs, filteredCAPs, filteredGrievances)
        };
    }
    
    applyFilters(data, filters) {
        let filteredData = [...data];
        
        if (filters.date_range) {
            const { start, end } = filters.date_range;
            filteredData = filteredData.filter(item => {
                const itemDate = item.createdAt?.toDate() || new Date();
                return itemDate >= start && itemDate <= end;
            });
        }
        
        if (filters.factory) {
            filteredData = filteredData.filter(item => item.factoryId === filters.factory);
        }
        
        if (filters.status) {
            filteredData = filteredData.filter(item => item.status === filters.status);
        }
        
        return filteredData;
    }
    
    calculateOverallComplianceScore(documents, caps, grievances) {
        const docScore = this.calculateDocumentScore(documents);
        const capScore = this.calculateCAPScore(caps);
        const grievanceScore = this.calculateGrievanceScore(grievances);
        
        return Math.round(((docScore + capScore + grievanceScore) / 3) * 100);
    }
    
    async getUsersData() {
        const snapshot = await db.collection('users').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    async exportReport(reportData, format = 'csv') {
        switch (format) {
            case 'csv':
                return await this.exportToCSV(reportData);
            case 'json':
                return await this.exportToJSON(reportData);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    
    async exportToCSV(reportData) {
        const csvData = this.convertReportToCSV(reportData);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportData.template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    async exportToJSON(reportData) {
        const jsonData = JSON.stringify(reportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportData.template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    convertReportToCSV(reportData) {
        const rows = [];
        
        rows.push(['Summary Metrics']);
        rows.push(['Metric', 'Value']);
        Object.entries(reportData.summary).forEach(([key, value]) => {
            rows.push([key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), value]);
        });
        
        return rows.map(row => row.join(',')).join('\n');
    }
    
    notifyDataChange(collection, change) {
        this.subscribers?.forEach(callback => {
            try {
                callback(collection, change);
            } catch (error) {
                console.error('Analytics subscriber error:', error);
            }
        });
    }
    
    subscribe(callback) {
        if (!this.subscribers) this.subscribers = new Set();
        this.subscribers.add(callback);
    }
    
    unsubscribe(callback) {
        this.subscribers?.delete(callback);
    }
    
    destroy() {
        this.charts.forEach(chartInfo => {
            chartInfo.instance.destroy();
        });
        this.charts.clear();
        
        this.dataListeners?.forEach(unsubscribe => unsubscribe());
        this.dataListeners = [];
        
        this.dataCache.clear();
        this.subscribers?.clear();
    }
}

// Initialize analytics system
let advancedAnalytics;

document.addEventListener('DOMContentLoaded', function() {
    advancedAnalytics = new AdvancedAnalytics();
});

// Global functions for HTML onclick handlers
window.advancedAnalytics = advancedAnalytics;
