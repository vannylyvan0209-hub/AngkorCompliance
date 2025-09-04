// Analytics Dashboard System
class AnalyticsDashboard {
    constructor() {
        this.currentUser = null;
        this.analyticsData = {
            cases: [],
            workers: [],
            factories: [],
            grievances: [],
            audits: []
        };
        this.charts = {};
        this.dateRange = 30;
        
        this.init();
    }
    
    async init() {
        console.log('📊 Initializing Analytics Dashboard...');
        
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
        
        console.log('✅ Analytics Dashboard initialized');
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
                            
                            // Allow analytics users, super admins, and factory admins
                            if (userData.role === 'analytics_user' || userData.role === 'super_admin' || userData.role === 'factory_admin') {
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
            userName.textContent = this.currentUser.name || this.currentUser.displayName || 'Analytics User';
            
            // Set avatar initials
            const initials = (this.currentUser.name || 'AN').split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatar.innerHTML = `<span>${initials}</span>`;
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadCases(),
            this.loadWorkers(),
            this.loadFactories(),
            this.loadGrievances(),
            this.loadAudits()
        ]);
        
        this.updateMetrics();
        this.updateInsights();
    }
    
    async loadCases() {
        try {
            const casesRef = this.collection(this.db, 'cases');
            const q = this.query(
                casesRef,
                this.where('factoryId', '==', this.currentUser.factoryId),
                this.orderBy('createdAt', 'desc')
            );
            
            const snapshot = await this.getDocs(q);
            this.analyticsData.cases = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading cases:', error);
        }
    }
    
    async loadWorkers() {
        try {
            const workersRef = this.collection(this.db, 'workers');
            const q = this.query(
                workersRef,
                this.where('factoryId', '==', this.currentUser.factoryId)
            );
            
            const snapshot = await this.getDocs(q);
            this.analyticsData.workers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading workers:', error);
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
    
    async loadGrievances() {
        try {
            const grievancesRef = this.collection(this.db, 'grievances');
            const q = this.query(
                grievancesRef,
                this.where('factoryId', '==', this.currentUser.factoryId),
                this.orderBy('createdAt', 'desc')
            );
            
            const snapshot = await this.getDocs(q);
            this.analyticsData.grievances = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading grievances:', error);
        }
    }
    
    async loadAudits() {
        try {
            const auditsRef = this.collection(this.db, 'audits');
            const q = this.query(
                auditsRef,
                this.where('factoryId', '==', this.currentUser.factoryId),
                this.orderBy('createdAt', 'desc')
            );
            
            const snapshot = await this.getDocs(q);
            this.analyticsData.audits = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading audits:', error);
        }
    }
    
    updateMetrics() {
        const totalCases = this.analyticsData.cases.length;
        const resolvedCases = this.analyticsData.cases.filter(c => c.status === 'resolved').length;
        const resolutionRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;
        const avgResponseTime = this.calculateAverageResponseTime();
        const workerSatisfaction = this.calculateWorkerSatisfaction();
        
        // Update metric displays
        document.getElementById('totalCases').textContent = totalCases;
        document.getElementById('resolutionRate').textContent = `${resolutionRate}%`;
        document.getElementById('avgResponseTime').textContent = `${avgResponseTime}h`;
        document.getElementById('workerSatisfaction').textContent = `${workerSatisfaction}%`;
        
        // Update trend values
        document.getElementById('weeklyCases').textContent = this.getWeeklyCases();
        document.getElementById('avgResolutionTime').textContent = this.getAverageResolutionTime();
        document.getElementById('activeWorkers').textContent = this.analyticsData.workers.filter(w => w.status === 'active').length;
        document.getElementById('complianceScore').textContent = `${this.calculateComplianceScore()}%`;
    }
    
    updateInsights() {
        const insightsList = document.getElementById('insightsList');
        const insights = this.generateInsights();
        
        insightsList.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <div class="insight-icon" style="background: ${insight.color};">
                    <i data-lucide="${insight.icon}"></i>
                </div>
                <div class="insight-content">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-description">${insight.description}</div>
                    <div class="insight-time">${insight.time}</div>
                </div>
            </div>
        `).join('');
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    initializeCharts() {
        this.initializeCaseTrendsChart();
        this.initializeCaseDistributionChart();
        this.initializeDepartmentPerformanceChart();
    }
    
    initializeCaseTrendsChart() {
        const ctx = document.getElementById('caseTrendsChart').getContext('2d');
        
        const data = this.getCaseTrendsData();
        
        this.charts.caseTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'New Cases',
                        data: data.newCases,
                        borderColor: 'var(--primary-500)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Resolved Cases',
                        data: data.resolvedCases,
                        borderColor: 'var(--success-500)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Pending Cases',
                        data: data.pendingCases,
                        borderColor: 'var(--warning-500)',
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
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
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
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
    
    initializeCaseDistributionChart() {
        const ctx = document.getElementById('caseDistributionChart').getContext('2d');
        
        const data = this.getCaseDistributionData();
        
        this.charts.caseDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'var(--primary-500)',
                        'var(--success-500)',
                        'var(--warning-500)',
                        'var(--error-500)',
                        'var(--info-500)'
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
    
    initializeDepartmentPerformanceChart() {
        const ctx = document.getElementById('departmentPerformanceChart').getContext('2d');
        
        const data = this.getDepartmentPerformanceData();
        
        this.charts.departmentPerformance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Performance Score',
                    data: data.values,
                    backgroundColor: 'var(--primary-500)',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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
    
    getCaseTrendsData() {
        const days = this.dateRange;
        const labels = [];
        const newCases = [];
        const resolvedCases = [];
        const pendingCases = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            const dayCases = this.analyticsData.cases.filter(c => {
                const caseDate = c.createdAt ? c.createdAt.toDate() : new Date(c.createdAt);
                return caseDate.toDateString() === date.toDateString();
            });
            
            newCases.push(dayCases.length);
            resolvedCases.push(dayCases.filter(c => c.status === 'resolved').length);
            pendingCases.push(dayCases.filter(c => c.status === 'pending').length);
        }
        
        return { labels, newCases, resolvedCases, pendingCases };
    }
    
    getCaseDistributionData() {
        const caseTypes = {};
        
        this.analyticsData.cases.forEach(c => {
            const type = c.type || 'General';
            caseTypes[type] = (caseTypes[type] || 0) + 1;
        });
        
        return {
            labels: Object.keys(caseTypes),
            values: Object.values(caseTypes)
        };
    }
    
    getDepartmentPerformanceData() {
        const departments = ['Production', 'Quality', 'Maintenance', 'Packaging', 'Warehouse'];
        const performance = departments.map(dept => {
            const deptWorkers = this.analyticsData.workers.filter(w => w.department === dept);
            if (deptWorkers.length === 0) return 0;
            
            const avgPerformance = deptWorkers.reduce((sum, w) => sum + (w.performanceScore || 0), 0) / deptWorkers.length;
            return Math.round(avgPerformance);
        });
        
        return {
            labels: departments,
            values: performance
        };
    }
    
    generateInsights() {
        const insights = [];
        
        // Case volume insight
        const recentCases = this.analyticsData.cases.filter(c => {
            const caseDate = c.createdAt ? c.createdAt.toDate() : new Date(c.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return caseDate > weekAgo;
        });
        
        if (recentCases.length > 10) {
            insights.push({
                title: 'High Case Volume',
                description: `${recentCases.length} cases reported in the last week. Consider reviewing case management processes.`,
                icon: 'alert-triangle',
                color: 'var(--warning-500)',
                time: '2 hours ago'
            });
        }
        
        // Resolution rate insight
        const resolutionRate = this.calculateResolutionRate();
        if (resolutionRate < 70) {
            insights.push({
                title: 'Low Resolution Rate',
                description: `Current resolution rate is ${resolutionRate}%. Focus on improving case resolution efficiency.`,
                icon: 'clock',
                color: 'var(--error-500)',
                time: '1 day ago'
            });
        }
        
        // Worker satisfaction insight
        const satisfaction = this.calculateWorkerSatisfaction();
        if (satisfaction > 85) {
            insights.push({
                title: 'High Worker Satisfaction',
                description: `Worker satisfaction is at ${satisfaction}%. Great job maintaining positive workplace environment.`,
                icon: 'heart',
                color: 'var(--success-500)',
                time: '3 days ago'
            });
        }
        
        // Compliance insight
        const complianceScore = this.calculateComplianceScore();
        if (complianceScore < 80) {
            insights.push({
                title: 'Compliance Alert',
                description: `Compliance score is ${complianceScore}%. Review compliance procedures and training.`,
                icon: 'shield-alert',
                color: 'var(--error-500)',
                time: '5 days ago'
            });
        }
        
        return insights.slice(0, 5); // Limit to 5 insights
    }
    
    calculateAverageResponseTime() {
        const resolvedCases = this.analyticsData.cases.filter(c => c.status === 'resolved' && c.resolvedAt);
        
        if (resolvedCases.length === 0) return 0;
        
        const totalHours = resolvedCases.reduce((sum, c) => {
            const created = c.createdAt ? c.createdAt.toDate() : new Date(c.createdAt);
            const resolved = c.resolvedAt ? c.resolvedAt.toDate() : new Date(c.resolvedAt);
            const diffHours = (resolved - created) / (1000 * 60 * 60);
            return sum + diffHours;
        }, 0);
        
        return Math.round(totalHours / resolvedCases.length);
    }
    
    calculateWorkerSatisfaction() {
        const workersWithSatisfaction = this.analyticsData.workers.filter(w => w.satisfactionScore);
        
        if (workersWithSatisfaction.length === 0) return 75; // Default value
        
        const totalSatisfaction = workersWithSatisfaction.reduce((sum, w) => sum + (w.satisfactionScore || 0), 0);
        return Math.round(totalSatisfaction / workersWithSatisfaction.length);
    }
    
    calculateResolutionRate() {
        const totalCases = this.analyticsData.cases.length;
        if (totalCases === 0) return 0;
        
        const resolvedCases = this.analyticsData.cases.filter(c => c.status === 'resolved').length;
        return Math.round((resolvedCases / totalCases) * 100);
    }
    
    calculateComplianceScore() {
        const audits = this.analyticsData.audits.filter(a => a.status === 'completed');
        
        if (audits.length === 0) return 85; // Default value
        
        const totalScore = audits.reduce((sum, a) => sum + (a.complianceScore || 0), 0);
        return Math.round(totalScore / audits.length);
    }
    
    getWeeklyCases() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return this.analyticsData.cases.filter(c => {
            const caseDate = c.createdAt ? c.createdAt.toDate() : new Date(c.createdAt);
            return caseDate > weekAgo;
        }).length;
    }
    
    getAverageResolutionTime() {
        const resolvedCases = this.analyticsData.cases.filter(c => c.status === 'resolved' && c.resolvedAt);
        
        if (resolvedCases.length === 0) return 0;
        
        const totalDays = resolvedCases.reduce((sum, c) => {
            const created = c.createdAt ? c.createdAt.toDate() : new Date(c.createdAt);
            const resolved = c.resolvedAt ? c.resolvedAt.toDate() : new Date(c.resolvedAt);
            const diffDays = (resolved - created) / (1000 * 60 * 60 * 24);
            return sum + diffDays;
        }, 0);
        
        return Math.round(totalDays / resolvedCases.length);
    }
    
    initializeUI() {
        // Set default date range
        document.getElementById('dateRange').value = this.dateRange;
        
        console.log('UI initialized');
    }
    
    setupEventListeners() {
        // Date range change
        document.getElementById('dateRange').addEventListener('change', (e) => {
            this.dateRange = parseInt(e.target.value);
            this.refreshData();
        });
        
        console.log('Event listeners setup');
    }
    
    async refreshData() {
        await this.loadInitialData();
        this.updateCharts();
    }
    
    updateCharts() {
        // Update case trends chart
        if (this.charts.caseTrends) {
            const trendsData = this.getCaseTrendsData();
            this.charts.caseTrends.data.labels = trendsData.labels;
            this.charts.caseTrends.data.datasets[0].data = trendsData.newCases;
            this.charts.caseTrends.data.datasets[1].data = trendsData.resolvedCases;
            this.charts.caseTrends.data.datasets[2].data = trendsData.pendingCases;
            this.charts.caseTrends.update();
        }
        
        // Update case distribution chart
        if (this.charts.caseDistribution) {
            const distributionData = this.getCaseDistributionData();
            this.charts.caseDistribution.data.labels = distributionData.labels;
            this.charts.caseDistribution.data.datasets[0].data = distributionData.values;
            this.charts.caseDistribution.update();
        }
        
        // Update department performance chart
        if (this.charts.departmentPerformance) {
            const performanceData = this.getDepartmentPerformanceData();
            this.charts.departmentPerformance.data.labels = performanceData.labels;
            this.charts.departmentPerformance.data.datasets[0].data = performanceData.values;
            this.charts.departmentPerformance.update();
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
function exportData() {
    if (window.analyticsDashboard) {
        window.analyticsDashboard.exportAnalyticsData();
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the analytics dashboard
    window.analyticsDashboard = new AnalyticsDashboard();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsDashboard;
}
