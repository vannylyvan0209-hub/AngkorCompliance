// CAP Analytics System
class CAPAnalytics {
    constructor() {
        this.currentUser = null;
        this.analyticsData = {
            audits: [],
            cases: [],
            grievances: [],
            factories: [],
            complianceReports: []
        };
        this.charts = {};
        this.timeRange = 90;
        this.factoryFilter = 'all';
        
        this.init();
    }
    
    async init() {
        console.log('📊 Initializing CAP Analytics...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize UI
        this.initializeUI();
        
        // Load initial data
        await this.loadInitialData();
        
        // Initialize charts
        this.initializeCharts();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ CAP Analytics initialized');
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
                            
                            // Allow analytics users, super admins, and auditors
                            if (userData.role === 'analytics_user' || userData.role === 'super_admin' || userData.role === 'auditor') {
                                this.currentUser = { ...user, ...userData };
                                this.updateUserDisplay();
                                resolve();
                            } else {
                                console.log('❌ Access denied - insufficient permissions');
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
    
    updateUserDisplay() {
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (this.currentUser) {
            userName.textContent = this.currentUser.name || this.currentUser.displayName || 'CAP Analyst';
            
            // Set avatar initials
            const initials = (this.currentUser.name || 'CA').split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatar.innerHTML = `<span>${initials}</span>`;
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadAudits(),
            this.loadCases(),
            this.loadGrievances(),
            this.loadFactories(),
            this.loadComplianceReports()
        ]);
        
        this.updateMetrics();
        this.updateComplianceScore();
        this.updateComplianceBreakdown();
        this.updateAuditTimeline();
    }
    
    async loadAudits() {
        try {
            const auditsRef = this.collection(this.db, 'audits');
            let q = this.query(
                auditsRef,
                this.orderBy('createdAt', 'desc')
            );
            
            // Apply factory filter if not 'all'
            if (this.factoryFilter !== 'all') {
                q = this.query(
                    auditsRef,
                    this.where('factoryId', '==', this.factoryFilter),
                    this.orderBy('createdAt', 'desc')
                );
            }
            
            const snapshot = await this.getDocs(q);
            this.analyticsData.audits = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading audits:', error);
        }
    }
    
    async loadCases() {
        try {
            const casesRef = this.collection(this.db, 'cases');
            let q = this.query(
                casesRef,
                this.orderBy('createdAt', 'desc')
            );
            
            if (this.factoryFilter !== 'all') {
                q = this.query(
                    casesRef,
                    this.where('factoryId', '==', this.factoryFilter),
                    this.orderBy('createdAt', 'desc')
                );
            }
            
            const snapshot = await this.getDocs(q);
            this.analyticsData.cases = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading cases:', error);
        }
    }
    
    async loadGrievances() {
        try {
            const grievancesRef = this.collection(this.db, 'grievances');
            let q = this.query(
                grievancesRef,
                this.orderBy('createdAt', 'desc')
            );
            
            if (this.factoryFilter !== 'all') {
                q = this.query(
                    grievancesRef,
                    this.where('factoryId', '==', this.factoryFilter),
                    this.orderBy('createdAt', 'desc')
                );
            }
            
            const snapshot = await this.getDocs(q);
            this.analyticsData.grievances = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading grievances:', error);
        }
    }
    
    async loadFactories() {
        try {
            const factoriesRef = this.collection(this.db, 'factories');
            const snapshot = await this.getDocs(factoriesRef);
            this.analyticsData.factories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading factories:', error);
        }
    }
    
    async loadComplianceReports() {
        try {
            const reportsRef = this.collection(this.db, 'compliance_reports');
            let q = this.query(
                reportsRef,
                this.orderBy('createdAt', 'desc')
            );
            
            if (this.factoryFilter !== 'all') {
                q = this.query(
                    reportsRef,
                    this.where('factoryId', '==', this.factoryFilter),
                    this.orderBy('createdAt', 'desc')
                );
            }
            
            const snapshot = await this.getDocs(q);
            this.analyticsData.complianceReports = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading compliance reports:', error);
        }
    }
    
    updateMetrics() {
        const auditCompletionRate = this.calculateAuditCompletionRate();
        const regulatoryViolations = this.calculateRegulatoryViolations();
        const avgAuditScore = this.calculateAverageAuditScore();
        const complianceAlerts = this.calculateComplianceAlerts();
        
        // Update metric displays
        document.getElementById('auditCompletionRate').textContent = `${auditCompletionRate}%`;
        document.getElementById('regulatoryViolations').textContent = regulatoryViolations;
        document.getElementById('avgAuditScore').textContent = avgAuditScore;
        document.getElementById('complianceAlerts').textContent = complianceAlerts;
    }
    
    updateComplianceScore() {
        const overallScore = this.calculateOverallComplianceScore();
        document.getElementById('overallScore').textContent = `${overallScore}%`;
        
        // Update the circular progress indicator
        const scoreCircle = document.querySelector('.score-circle');
        const degrees = (overallScore / 100) * 360;
        scoreCircle.style.background = `conic-gradient(var(--success-500) 0deg, var(--success-500) ${degrees}deg, var(--neutral-200) ${degrees}deg, var(--neutral-200) 360deg)`;
    }
    
    updateComplianceBreakdown() {
        const breakdownGrid = document.getElementById('complianceBreakdown');
        const breakdownData = this.getComplianceBreakdownData();
        
        breakdownGrid.innerHTML = breakdownData.map(item => `
            <div class="breakdown-item">
                <div class="breakdown-value">${item.value}%</div>
                <div class="breakdown-label">${item.label}</div>
                <div class="breakdown-status status-${item.status}">
                    ${this.getStatusText(item.status)}
                </div>
            </div>
        `).join('');
    }
    
    updateAuditTimeline() {
        const timelineList = document.getElementById('auditTimeline');
        const timelineData = this.getAuditTimelineData();
        
        timelineList.innerHTML = timelineData.map(item => `
            <div class="timeline-item">
                <div class="timeline-icon" style="background: ${item.color};">
                    <i data-lucide="${item.icon}"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-title">${item.title}</div>
                    <div class="timeline-description">${item.description}</div>
                    <div class="timeline-time">${item.time}</div>
                </div>
            </div>
        `).join('');
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    initializeCharts() {
        this.initializeComplianceTrendsChart();
        this.initializeAuditDistributionChart();
    }
    
    initializeComplianceTrendsChart() {
        const ctx = document.getElementById('complianceTrendsChart').getContext('2d');
        
        const data = this.getComplianceTrendsData();
        
        this.charts.complianceTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Compliance Score',
                        data: data.scores,
                        borderColor: 'var(--success-500)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Audit Score',
                        data: data.auditScores,
                        borderColor: 'var(--primary-500)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4,
                        fill: true
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
    
    initializeAuditDistributionChart() {
        const ctx = document.getElementById('auditDistributionChart').getContext('2d');
        
        const data = this.getAuditDistributionData();
        
        this.charts.auditDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'var(--success-500)',
                        'var(--warning-500)',
                        'var(--error-500)',
                        'var(--primary-500)'
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
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
    
    getComplianceTrendsData() {
        const days = this.timeRange;
        const labels = [];
        const scores = [];
        const auditScores = [];
        
        for (let i = days - 1; i >= 0; i -= 7) { // Weekly data points
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Calculate compliance score for this period
            const periodCompliance = this.calculatePeriodComplianceScore(date);
            scores.push(periodCompliance);
            
            // Calculate audit score for this period
            const periodAuditScore = this.calculatePeriodAuditScore(date);
            auditScores.push(periodAuditScore);
        }
        
        return { labels, scores, auditScores };
    }
    
    getAuditDistributionData() {
        const completed = this.analyticsData.audits.filter(a => a.status === 'completed').length;
        const inProgress = this.analyticsData.audits.filter(a => a.status === 'in_progress').length;
        const pending = this.analyticsData.audits.filter(a => a.status === 'pending').length;
        const overdue = this.analyticsData.audits.filter(a => a.status === 'overdue').length;
        
        return {
            labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
            values: [completed, inProgress, pending, overdue]
        };
    }
    
    getComplianceBreakdownData() {
        return [
            {
                label: 'Safety Compliance',
                value: this.calculateCategoryCompliance('safety'),
                status: this.getComplianceStatus(this.calculateCategoryCompliance('safety'))
            },
            {
                label: 'Labor Rights',
                value: this.calculateCategoryCompliance('labor_rights'),
                status: this.getComplianceStatus(this.calculateCategoryCompliance('labor_rights'))
            },
            {
                label: 'Environmental',
                value: this.calculateCategoryCompliance('environmental'),
                status: this.getComplianceStatus(this.calculateCategoryCompliance('environmental'))
            },
            {
                label: 'Quality Standards',
                value: this.calculateCategoryCompliance('quality'),
                status: this.getComplianceStatus(this.calculateCategoryCompliance('quality'))
            },
            {
                label: 'Documentation',
                value: this.calculateCategoryCompliance('documentation'),
                status: this.getComplianceStatus(this.calculateCategoryCompliance('documentation'))
            },
            {
                label: 'Training',
                value: this.calculateCategoryCompliance('training'),
                status: this.getComplianceStatus(this.calculateCategoryCompliance('training'))
            }
        ];
    }
    
    getAuditTimelineData() {
        const recentAudits = this.analyticsData.audits
            .slice(0, 10)
            .map(audit => {
                const auditDate = audit.createdAt ? audit.createdAt.toDate() : new Date(audit.createdAt);
                const timeAgo = this.getTimeAgo(auditDate);
                
                return {
                    title: `${audit.type} Audit`,
                    description: `Audit conducted at ${audit.factoryName || 'Factory'} with score ${audit.score || 'N/A'}`,
                    time: timeAgo,
                    icon: this.getAuditIcon(audit.status),
                    color: this.getAuditColor(audit.status)
                };
            });
        
        return recentAudits;
    }
    
    calculateAuditCompletionRate() {
        const totalAudits = this.analyticsData.audits.length;
        if (totalAudits === 0) return 0;
        
        const completedAudits = this.analyticsData.audits.filter(a => a.status === 'completed').length;
        return Math.round((completedAudits / totalAudits) * 100);
    }
    
    calculateRegulatoryViolations() {
        return this.analyticsData.audits.reduce((total, audit) => {
            return total + (audit.violations ? audit.violations.length : 0);
        }, 0);
    }
    
    calculateAverageAuditScore() {
        const completedAudits = this.analyticsData.audits.filter(a => a.status === 'completed' && a.score);
        
        if (completedAudits.length === 0) return 85; // Default value
        
        const totalScore = completedAudits.reduce((sum, audit) => sum + (audit.score || 0), 0);
        return Math.round(totalScore / completedAudits.length);
    }
    
    calculateComplianceAlerts() {
        return this.analyticsData.audits.filter(a => a.status === 'overdue' || a.score < 70).length;
    }
    
    calculateOverallComplianceScore() {
        const auditScore = this.calculateAverageAuditScore();
        const caseResolutionRate = this.calculateCaseResolutionRate();
        const grievanceResolutionRate = this.calculateGrievanceResolutionRate();
        
        // Weighted average: 40% audit score, 30% case resolution, 30% grievance resolution
        return Math.round((auditScore * 0.4) + (caseResolutionRate * 0.3) + (grievanceResolutionRate * 0.3));
    }
    
    calculateCaseResolutionRate() {
        const totalCases = this.analyticsData.cases.length;
        if (totalCases === 0) return 85; // Default value
        
        const resolvedCases = this.analyticsData.cases.filter(c => c.status === 'resolved').length;
        return Math.round((resolvedCases / totalCases) * 100);
    }
    
    calculateGrievanceResolutionRate() {
        const totalGrievances = this.analyticsData.grievances.length;
        if (totalGrievances === 0) return 85; // Default value
        
        const resolvedGrievances = this.analyticsData.grievances.filter(g => g.status === 'resolved').length;
        return Math.round((resolvedGrievances / totalGrievances) * 100);
    }
    
    calculateCategoryCompliance(category) {
        const categoryAudits = this.analyticsData.audits.filter(a => a.category === category);
        
        if (categoryAudits.length === 0) return 85; // Default value
        
        const totalScore = categoryAudits.reduce((sum, audit) => sum + (audit.score || 0), 0);
        return Math.round(totalScore / categoryAudits.length);
    }
    
    calculatePeriodComplianceScore(date) {
        // Mock calculation for demonstration
        const baseScore = 85;
        const variation = Math.random() * 10 - 5; // ±5 points
        return Math.max(0, Math.min(100, Math.round(baseScore + variation)));
    }
    
    calculatePeriodAuditScore(date) {
        // Mock calculation for demonstration
        const baseScore = 87;
        const variation = Math.random() * 8 - 4; // ±4 points
        return Math.max(0, Math.min(100, Math.round(baseScore + variation)));
    }
    
    getComplianceStatus(score) {
        if (score >= 90) return 'compliant';
        if (score >= 70) return 'pending';
        return 'non-compliant';
    }
    
    getStatusText(status) {
        const statusMap = {
            'compliant': 'Compliant',
            'pending': 'Pending',
            'non-compliant': 'Non-Compliant'
        };
        return statusMap[status] || 'Pending';
    }
    
    getAuditIcon(status) {
        const iconMap = {
            'completed': 'check-circle',
            'in_progress': 'clock',
            'pending': 'calendar',
            'overdue': 'alert-triangle'
        };
        return iconMap[status] || 'file-text';
    }
    
    getAuditColor(status) {
        const colorMap = {
            'completed': 'var(--success-500)',
            'in_progress': 'var(--primary-500)',
            'pending': 'var(--warning-500)',
            'overdue': 'var(--error-500)'
        };
        return colorMap[status] || 'var(--neutral-500)';
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} days ago`;
        
        const diffInWeeks = Math.floor(diffInDays / 7);
        return `${diffInWeeks} weeks ago`;
    }
    
    initializeUI() {
        // Set default filters
        document.getElementById('timeRange').value = this.timeRange;
        document.getElementById('factoryFilter').value = this.factoryFilter;
        
        console.log('UI initialized');
    }
    
    setupEventListeners() {
        // Time range change
        document.getElementById('timeRange').addEventListener('change', (e) => {
            this.timeRange = parseInt(e.target.value);
            this.refreshData();
        });
        
        // Factory filter change
        document.getElementById('factoryFilter').addEventListener('change', (e) => {
            this.factoryFilter = e.target.value;
            this.refreshData();
        });
        
        console.log('Event listeners setup');
    }
    
    async refreshData() {
        await this.loadInitialData();
        this.updateCharts();
    }
    
    updateCharts() {
        // Update compliance trends chart
        if (this.charts.complianceTrends) {
            const trendsData = this.getComplianceTrendsData();
            this.charts.complianceTrends.data.labels = trendsData.labels;
            this.charts.complianceTrends.data.datasets[0].data = trendsData.scores;
            this.charts.complianceTrends.data.datasets[1].data = trendsData.auditScores;
            this.charts.complianceTrends.update();
        }
        
        // Update audit distribution chart
        if (this.charts.auditDistribution) {
            const distributionData = this.getAuditDistributionData();
            this.charts.auditDistribution.data.labels = distributionData.labels;
            this.charts.auditDistribution.data.datasets[0].data = distributionData.values;
            this.charts.auditDistribution.update();
        }
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

// Global functions for HTML onclick handlers
function exportCAPData() {
    if (window.capAnalytics) {
        window.capAnalytics.exportCAPAnalyticsData();
    }
}

// Initialize the analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the CAP analytics
    window.capAnalytics = new CAPAnalytics();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CAPAnalytics;
}
