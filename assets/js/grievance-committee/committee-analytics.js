// Committee Analytics System for Grievance Committee
// Handles performance metrics, trends, and reporting functionality

class CommitteeAnalytics {
    constructor() {
        this.cases = [];
        this.investigators = [];
        this.currentUser = null;
        this.isInitialized = false;
        this.charts = {};
        this.currentPeriod = 'quarter';
        this.filters = {
            dateRange: 'last30days',
            caseType: 'all',
            investigator: 'all',
            priority: 'all'
        };
        this.unsubscribe = null;
        this.init();
    }

    async init() {
        try {
            console.log('🔧 Initializing Committee Analytics...');
            
            // Wait for Firebase to be available
            if (!window.Firebase) {
                console.log('⏳ Waiting for Firebase to initialize...');
                setTimeout(() => this.init(), 100);
                return;
            }

            await this.checkAuthentication();
            await this.loadCases();
            await this.loadInvestigators();
            this.setupCharts();
            this.updateAnalytics();
            this.setupEventListeners();
            this.isInitialized = true;
            
            console.log('✅ Committee Analytics initialized');
        } catch (error) {
            console.error('❌ Error initializing Committee Analytics:', error);
        }
    }

    async checkAuthentication() {
        try {
            const { auth, db } = window.Firebase;
            const { doc, getDoc } = window.Firebase;
            
            return new Promise((resolve, reject) => {
                auth.onAuthStateChanged(async (user) => {
                    if (!user) {
                        window.location.href = '../../login.html';
                        reject(new Error('User not authenticated'));
                        return;
                    }

                    try {
                        const userDocRef = doc(db, 'users', user.uid);
                        const userDoc = await getDoc(userDocRef);
                        
                        if (!userDoc.exists()) {
                            window.location.href = '../../login.html';
                            reject(new Error('User document not found'));
                            return;
                        }

                        const userData = userDoc.data();
                        this.currentUser = { id: user.uid, ...userData };
                        
                        // Check if user has grievance committee access
                        if (!['grievance_committee', 'super_admin'].includes(userData.role)) {
                            window.location.href = '../../dashboard.html';
                            reject(new Error('Insufficient permissions'));
                            return;
                        }

                        console.log('✅ Authentication verified for:', userData.name || userData.email);
                        resolve();
                    } catch (error) {
                        console.error('❌ Error checking authentication:', error);
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error('❌ Error in authentication check:', error);
            throw error;
        }
    }

    async loadCases() {
        try {
            console.log('📋 Loading cases for analytics...');
            
            const { db } = window.Firebase;
            const { collection, query, orderBy, onSnapshot } = window.Firebase;
            
            // Create query for cases
            const casesRef = collection(db, 'grievance_cases');
            const casesQuery = query(casesRef, orderBy('createdAt', 'desc'));
            
            // Set up real-time listener
            this.unsubscribe = onSnapshot(casesQuery, (snapshot) => {
                this.cases = [];
                snapshot.forEach((doc) => {
                    this.cases.push({ id: doc.id, ...doc.data() });
                });
                
                this.updateAnalytics();
                console.log(`✅ Loaded ${this.cases.length} cases for analytics`);
            });
            
        } catch (error) {
            console.error('❌ Error loading cases:', error);
        }
    }

    async loadInvestigators() {
        try {
            console.log('👥 Loading investigators...');
            
            const { db } = window.Firebase;
            const { collection, query, where, onSnapshot } = window.Firebase;
            
            // Create query for investigators
            const usersRef = collection(db, 'users');
            const investigatorsQuery = query(usersRef, where('role', '==', 'grievance_committee'));
            
            // Set up real-time listener
            onSnapshot(investigatorsQuery, (snapshot) => {
                this.investigators = [];
                snapshot.forEach((doc) => {
                    this.investigators.push({ id: doc.id, ...doc.data() });
                });
                
                this.updateInvestigatorPerformance();
                console.log(`✅ Loaded ${this.investigators.length} investigators`);
            });
            
        } catch (error) {
            console.error('❌ Error loading investigators:', error);
        }
    }

    setupCharts() {
        try {
            // Case Volume Trends Chart
            const volumeCtx = document.getElementById('caseVolumeChart');
            if (volumeCtx) {
                this.charts.volume = new Chart(volumeCtx, {
                    type: 'line',
                    data: {
                        labels: this.getChartLabels(),
                        datasets: [
                            {
                                label: 'New Cases',
                                data: this.getCaseVolumeData(),
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                tension: 0.4
                            },
                            {
                                label: 'Resolved Cases',
                                data: this.getResolvedVolumeData(),
                                borderColor: 'rgb(16, 185, 129)',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                tension: 0.4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Number of Cases'
                                }
                            }
                        }
                    }
                });
            }

            // Case Type Distribution Chart
            const typeCtx = document.getElementById('caseTypeChart');
            if (typeCtx) {
                this.charts.type = new Chart(typeCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Harassment', 'Safety', 'Wages', 'Discrimination', 'Working Conditions'],
                        datasets: [{
                            data: [25, 20, 15, 18, 22],
                            backgroundColor: [
                                'rgb(239, 68, 68)',
                                'rgb(59, 130, 246)',
                                'rgb(16, 185, 129)',
                                'rgb(245, 158, 11)',
                                'rgb(139, 92, 246)'
                            ],
                            borderWidth: 2,
                            borderColor: '#ffffff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                            },
                            title: {
                                display: false
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error setting up charts:', error);
        }
    }

    getChartLabels() {
        const labels = [];
        const now = new Date();
        
        switch (this.currentPeriod) {
            case 'week':
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
                }
                break;
            case 'month':
                for (let i = 29; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    labels.push(date.getDate());
                }
                break;
            case 'quarter':
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(now);
                    date.setMonth(date.getMonth() - i);
                    labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
                }
                break;
        }
        
        return labels;
    }

    getCaseVolumeData() {
        // Generate sample data - in real implementation, this would come from actual case data
        const data = [];
        for (let i = 0; i < this.getChartLabels().length; i++) {
            data.push(Math.floor(Math.random() * 20) + 5); // Random values between 5-25
        }
        return data;
    }

    getResolvedVolumeData() {
        // Generate sample data - in real implementation, this would come from actual case data
        const data = [];
        for (let i = 0; i < this.getChartLabels().length; i++) {
            data.push(Math.floor(Math.random() * 15) + 3); // Random values between 3-18
        }
        return data;
    }

    updateAnalytics() {
        try {
            const filteredCases = this.filterCases();
            const metrics = this.calculateMetrics(filteredCases);
            
            // Update overview metrics
            document.getElementById('totalCases').textContent = metrics.totalCases.toLocaleString();
            document.getElementById('resolutionRate').textContent = `${metrics.resolutionRate}%`;
            document.getElementById('avgResolutionTime').textContent = `${metrics.avgResolutionTime} days`;
            document.getElementById('satisfactionRate').textContent = `${metrics.satisfactionRate}%`;
            
            // Update performance metrics
            document.getElementById('slaPercentage').textContent = `${metrics.slaCompliance}%`;
            document.getElementById('slaStatus').textContent = `${metrics.slaCompliance}%`;
            document.getElementById('qualityPercentage').textContent = `${metrics.qualityScore}%`;
            document.getElementById('qualityStatus').textContent = `${metrics.qualityScore}%`;
            document.getElementById('efficiencyPercentage').textContent = `${metrics.efficiencyScore}%`;
            document.getElementById('efficiencyStatus').textContent = `${metrics.efficiencyScore}%`;
            
            // Update status colors
            this.updateStatusColors(metrics);
            
        } catch (error) {
            console.error('❌ Error updating analytics:', error);
        }
    }

    filterCases() {
        let filtered = [...this.cases];
        
        // Apply date range filter
        const now = new Date();
        const dateRange = this.filters.dateRange;
        let startDate;
        
        switch (dateRange) {
            case 'last7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'last30days':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'last90days':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'last6months':
                startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
                break;
            case 'last12months':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(0);
        }
        
        filtered = filtered.filter(caseData => {
            const caseDate = caseData.createdAt?.toDate() || new Date(caseData.createdAt);
            return caseDate >= startDate;
        });
        
        // Apply case type filter
        if (this.filters.caseType !== 'all') {
            filtered = filtered.filter(caseData => caseData.type === this.filters.caseType);
        }
        
        // Apply investigator filter
        if (this.filters.investigator !== 'all') {
            filtered = filtered.filter(caseData => caseData.assignedTo === this.filters.investigator);
        }
        
        // Apply priority filter
        if (this.filters.priority !== 'all') {
            filtered = filtered.filter(caseData => caseData.priority === this.filters.priority);
        }
        
        return filtered;
    }

    calculateMetrics(cases) {
        const totalCases = cases.length;
        const resolvedCases = cases.filter(c => c.status === 'resolved' || c.status === 'closed').length;
        const resolutionRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;
        
        // Calculate average resolution time
        const resolvedCasesWithTime = cases.filter(c => 
            (c.status === 'resolved' || c.status === 'closed') && 
            c.createdAt && c.resolvedAt
        );
        
        let totalResolutionTime = 0;
        resolvedCasesWithTime.forEach(c => {
            const created = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
            const resolved = c.resolvedAt.toDate ? c.resolvedAt.toDate() : new Date(c.resolvedAt);
            totalResolutionTime += (resolved - created) / (1000 * 60 * 60 * 24);
        });
        
        const avgResolutionTime = resolvedCasesWithTime.length > 0 ? 
            Math.round((totalResolutionTime / resolvedCasesWithTime.length) * 10) / 10 : 0;
        
        // Calculate other metrics (sample data for now)
        const satisfactionRate = 85 + Math.random() * 10; // 85-95%
        const slaCompliance = 90 + Math.random() * 8; // 90-98%
        const qualityScore = 88 + Math.random() * 8; // 88-96%
        const efficiencyScore = 85 + Math.random() * 10; // 85-95%
        
        return {
            totalCases,
            resolutionRate,
            avgResolutionTime,
            satisfactionRate: Math.round(satisfactionRate),
            slaCompliance: Math.round(slaCompliance),
            qualityScore: Math.round(qualityScore),
            efficiencyScore: Math.round(efficiencyScore)
        };
    }

    updateStatusColors(metrics) {
        // Update SLA status colors
        const slaStatus = document.getElementById('slaStatus');
        const slaPercentage = document.getElementById('slaPercentage');
        
        if (metrics.slaCompliance >= 95) {
            slaStatus.className = 'performance-status status-excellent';
            slaPercentage.style.color = 'var(--success-600)';
        } else if (metrics.slaCompliance >= 85) {
            slaStatus.className = 'performance-status status-good';
            slaPercentage.style.color = 'var(--primary-600)';
        } else if (metrics.slaCompliance >= 75) {
            slaStatus.className = 'performance-status status-warning';
            slaPercentage.style.color = 'var(--warning-600)';
        } else {
            slaStatus.className = 'performance-status status-poor';
            slaPercentage.style.color = 'var(--error-600)';
        }
        
        // Update quality status colors
        const qualityStatus = document.getElementById('qualityStatus');
        const qualityPercentage = document.getElementById('qualityPercentage');
        
        if (metrics.qualityScore >= 90) {
            qualityStatus.className = 'performance-status status-excellent';
            qualityPercentage.style.color = 'var(--success-600)';
        } else if (metrics.qualityScore >= 80) {
            qualityStatus.className = 'performance-status status-good';
            qualityPercentage.style.color = 'var(--primary-600)';
        } else if (metrics.qualityScore >= 70) {
            qualityStatus.className = 'performance-status status-warning';
            qualityPercentage.style.color = 'var(--warning-600)';
        } else {
            qualityStatus.className = 'performance-status status-poor';
            qualityPercentage.style.color = 'var(--error-600)';
        }
        
        // Update efficiency status colors
        const efficiencyStatus = document.getElementById('efficiencyStatus');
        const efficiencyPercentage = document.getElementById('efficiencyPercentage');
        
        if (metrics.efficiencyScore >= 90) {
            efficiencyStatus.className = 'performance-status status-excellent';
            efficiencyPercentage.style.color = 'var(--success-600)';
        } else if (metrics.efficiencyScore >= 80) {
            efficiencyStatus.className = 'performance-status status-good';
            efficiencyPercentage.style.color = 'var(--primary-600)';
        } else if (metrics.efficiencyScore >= 70) {
            efficiencyStatus.className = 'performance-status status-warning';
            efficiencyPercentage.style.color = 'var(--warning-600)';
        } else {
            efficiencyStatus.className = 'performance-status status-poor';
            efficiencyPercentage.style.color = 'var(--error-600)';
        }
    }

    updateInvestigatorPerformance() {
        try {
            const investigatorsList = document.getElementById('investigatorsList');
            if (!investigatorsList) return;
            
            // Calculate performance for each investigator
            const investigatorPerformance = this.investigators.map(investigator => {
                const investigatorCases = this.cases.filter(c => c.assignedTo === investigator.id);
                const totalCases = investigatorCases.length;
                const resolvedCases = investigatorCases.filter(c => 
                    c.status === 'resolved' || c.status === 'closed'
                ).length;
                
                const resolutionRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;
                
                // Calculate average resolution time
                const resolvedCasesWithTime = investigatorCases.filter(c => 
                    (c.status === 'resolved' || c.status === 'closed') && 
                    c.createdAt && c.resolvedAt
                );
                
                let totalResolutionTime = 0;
                resolvedCasesWithTime.forEach(c => {
                    const created = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
                    const resolved = c.resolvedAt.toDate ? c.resolvedAt.toDate() : new Date(c.resolvedAt);
                    totalResolutionTime += (resolved - created) / (1000 * 60 * 60 * 24);
                });
                
                const avgResolutionTime = resolvedCasesWithTime.length > 0 ? 
                    Math.round((totalResolutionTime / resolvedCasesWithTime.length) * 10) / 10 : 0;
                
                // Calculate performance score
                const performanceScore = Math.round(
                    (resolutionRate * 0.4) + 
                    ((100 - avgResolutionTime) * 0.3) + 
                    (Math.random() * 10 + 85) * 0.3
                );
                
                return {
                    ...investigator,
                    totalCases,
                    resolutionRate,
                    avgResolutionTime,
                    performanceScore
                };
            });
            
            // Sort by performance score
            investigatorPerformance.sort((a, b) => b.performanceScore - a.performanceScore);
            
            // Update display
            investigatorsList.innerHTML = '';
            investigatorPerformance.slice(0, 5).forEach(investigator => {
                const initials = investigator.name ? 
                    investigator.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
                    'UN';
                
                const investigatorItem = document.createElement('div');
                investigatorItem.className = 'investigator-item';
                
                investigatorItem.innerHTML = `
                    <div class="investigator-avatar">${initials}</div>
                    <div class="investigator-info">
                        <div class="investigator-name">${investigator.name || 'Unknown'}</div>
                        <div class="investigator-stats">
                            <span>Cases: ${investigator.totalCases}</span>
                            <span>Resolution Rate: ${investigator.resolutionRate}%</span>
                            <span>Avg Time: ${investigator.avgResolutionTime} days</span>
                        </div>
                    </div>
                    <div class="investigator-score">${investigator.performanceScore}</div>
                `;
                
                investigatorsList.appendChild(investigatorItem);
            });
            
        } catch (error) {
            console.error('❌ Error updating investigator performance:', error);
        }
    }

    setupEventListeners() {
        // Add event listeners for filter changes
        const filterInputs = document.querySelectorAll('.filter-input');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.filters[input.id] = input.value;
            });
        });
    }
}

// Global functions for button actions
window.applyFilters = function() {
    if (window.committeeAnalytics) {
        window.committeeAnalytics.updateAnalytics();
    }
};

window.refreshAnalytics = function() {
    if (window.committeeAnalytics) {
        window.committeeAnalytics.updateAnalytics();
        window.committeeAnalytics.updateInvestigatorPerformance();
        console.log('🔄 Analytics data refreshed');
    }
};

window.updateChartPeriod = function(period) {
    if (window.committeeAnalytics) {
        window.committeeAnalytics.currentPeriod = period;
        window.committeeAnalytics.setupCharts();
    }
};

window.viewAllInvestigators = function() {
    console.log('👥 Viewing all investigators...');
    // This could navigate to a detailed investigator performance page
    alert('Detailed investigator performance page will be implemented in the next phase.');
};

window.exportAnalytics = function() {
    console.log('📥 Exporting analytics report...');
    // This would export the current analytics data to PDF/Excel
    alert('Analytics export functionality will be implemented in the next phase.');
};

// Initialize the Committee Analytics system
let committeeAnalytics;
document.addEventListener('DOMContentLoaded', () => {
    committeeAnalytics = new CommitteeAnalytics();
    window.committeeAnalytics = committeeAnalytics;
});
