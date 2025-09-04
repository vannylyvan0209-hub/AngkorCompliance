// Case Management Dashboard
// Grievance Committee - Advanced Analytics and Performance Metrics

class CaseDashboard {
    constructor() {
        this.cases = [];
        this.currentUser = null;
        this.isInitialized = false;
        this.charts = {};
        this.currentPeriod = 'quarter';
        this.unsubscribe = null;
        this.init();
    }

    async init() {
        try {
            console.log('🔧 Initializing Case Management Dashboard...');
            
            // Wait for Firebase to be available
            if (!window.Firebase) {
                console.log('⏳ Waiting for Firebase to initialize...');
                setTimeout(() => this.init(), 100);
                return;
            }

            await this.checkAuthentication();
            await this.loadCases();
            this.setupCharts();
            this.updateDashboard();
            this.setupEventListeners();
            this.isInitialized = true;
            
            console.log('✅ Case Management Dashboard initialized');
        } catch (error) {
            console.error('❌ Error initializing Case Dashboard:', error);
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
            console.log('📋 Loading cases for dashboard...');
            
            const { db } = window.Firebase;
            const { collection, query, orderBy, onSnapshot } = window.Firebase;
            
            // Create query for cases
            const casesRef = collection(db, 'grievance_cases');
            const casesQuery = query(casesRef, orderBy('createdAt', 'desc'));
            
            // Set up real-time listener
            this.unsubscribe = onSnapshot(casesQuery, (snapshot) => {
                this.cases = [];
                snapshot.forEach((doc) => {
                    this.cases.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log(`✅ Loaded ${this.cases.length} cases for dashboard`);
                this.updateDashboard();
            }, (error) => {
                console.error('❌ Error loading cases:', error);
                // Load sample data for development
                this.loadSampleCases();
            });
            
        } catch (error) {
            console.error('❌ Error in loadCases:', error);
            // Load sample data for development
            this.loadSampleCases();
        }
    }

    loadSampleCases() {
        console.log('📋 Loading sample cases for dashboard development...');
        
        this.cases = [
            {
                id: 'case_001',
                trackingNumber: 'GC-2024-001',
                category: 'harassment',
                severity: 'high',
                status: 'investigating',
                description: 'Worker reported verbal harassment by supervisor',
                assignedTo: 'John Doe',
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-16'),
                resolvedAt: null,
                workerId: null,
                factoryId: 'factory_001'
            },
            {
                id: 'case_002',
                trackingNumber: 'GC-2024-002',
                category: 'wage',
                severity: 'medium',
                status: 'assigned',
                description: 'Dispute over overtime pay calculation',
                assignedTo: 'Jane Smith',
                createdAt: new Date('2024-01-14'),
                updatedAt: new Date('2024-01-15'),
                resolvedAt: null,
                workerId: 'worker_123',
                factoryId: 'factory_001'
            },
            {
                id: 'case_003',
                trackingNumber: 'GC-2024-003',
                category: 'safety',
                severity: 'critical',
                status: 'new',
                description: 'Safety equipment malfunction reported',
                assignedTo: null,
                createdAt: new Date('2024-01-16'),
                updatedAt: new Date('2024-01-16'),
                resolvedAt: null,
                workerId: null,
                factoryId: 'factory_002'
            },
            {
                id: 'case_004',
                trackingNumber: 'GC-2024-004',
                category: 'discrimination',
                severity: 'high',
                status: 'resolved',
                description: 'Alleged discrimination in promotion process',
                assignedTo: 'Mike Johnson',
                createdAt: new Date('2024-01-10'),
                updatedAt: new Date('2024-01-13'),
                resolvedAt: new Date('2024-01-13'),
                workerId: 'worker_456',
                factoryId: 'factory_001'
            },
            {
                id: 'case_005',
                trackingNumber: 'GC-2024-005',
                category: 'working_conditions',
                severity: 'low',
                status: 'closed',
                description: 'Request for improved ventilation in work area',
                assignedTo: 'Sarah Wilson',
                createdAt: new Date('2024-01-08'),
                updatedAt: new Date('2024-01-12'),
                resolvedAt: new Date('2024-01-12'),
                workerId: 'worker_789',
                factoryId: 'factory_003'
            }
        ];
        
        this.updateDashboard();
    }

    updateDashboard() {
        try {
            this.updateKPIs();
            this.updateCharts();
            this.updateSLAMetrics();
            this.updatePerformanceMetrics();
            console.log('📊 Dashboard updated with latest data');
        } catch (error) {
            console.error('❌ Error updating dashboard:', error);
        }
    }

    updateKPIs() {
        try {
            const totalCases = this.cases.length;
            const resolvedCases = this.cases.filter(c => c.status === 'resolved' || c.status === 'closed').length;
            const avgResolutionTime = this.calculateAverageResolutionTime();
            const slaBreaches = this.calculateSLABreaches();

            // Update KPI values
            document.getElementById('totalCasesKPI').textContent = totalCases;
            document.getElementById('resolvedCasesKPI').textContent = resolvedCases;
            document.getElementById('avgResolutionTime').textContent = avgResolutionTime.toFixed(1);
            document.getElementById('slaBreaches').textContent = slaBreaches;

            // Update trends (simulated for now)
            document.getElementById('casesTrend').textContent = '+12% this month';
            document.getElementById('resolvedTrend').textContent = '+8% this month';
            document.getElementById('resolutionTrend').textContent = '-2 days';
            document.getElementById('slaTrend').textContent = '-15% this month';

            console.log('📈 KPIs updated');
        } catch (error) {
            console.error('❌ Error updating KPIs:', error);
        }
    }

    calculateAverageResolutionTime() {
        try {
            const resolvedCases = this.cases.filter(c => c.resolvedAt && c.createdAt);
            if (resolvedCases.length === 0) return 0;

            const totalDays = resolvedCases.reduce((sum, caseItem) => {
                const created = new Date(caseItem.createdAt);
                const resolved = new Date(caseItem.resolvedAt);
                const days = (resolved - created) / (1000 * 60 * 60 * 24);
                return sum + days;
            }, 0);

            return totalDays / resolvedCases.length;
        } catch (error) {
            console.error('❌ Error calculating average resolution time:', error);
            return 0;
        }
    }

    calculateSLABreaches() {
        try {
            // Simulate SLA breaches calculation
            // In a real implementation, this would check against actual SLA targets
            const slaTarget = 7; // 7 days target
            const resolvedCases = this.cases.filter(c => c.resolvedAt && c.createdAt);
            
            const breaches = resolvedCases.filter(caseItem => {
                const created = new Date(caseItem.createdAt);
                const resolved = new Date(caseItem.resolvedAt);
                const days = (resolved - created) / (1000 * 60 * 60 * 24);
                return days > slaTarget;
            }).length;

            return breaches;
        } catch (error) {
            console.error('❌ Error calculating SLA breaches:', error);
            return 0;
        }
    }

    setupCharts() {
        try {
            this.setupStatusChart();
            this.setupCategoryChart();
            console.log('📊 Charts initialized');
        } catch (error) {
            console.error('❌ Error setting up charts:', error);
        }
    }

    setupStatusChart() {
        try {
            const ctx = document.getElementById('statusChart');
            if (!ctx) return;

            this.charts.statusChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['New', 'Assigned', 'Investigating', 'Resolved', 'Closed'],
                    datasets: [{
                        data: [1, 1, 1, 1, 1],
                        backgroundColor: [
                            '#3B82F6', // Blue
                            '#F59E0B', // Yellow
                            '#8B5CF6', // Purple
                            '#10B981', // Green
                            '#6B7280'  // Gray
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
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('❌ Error setting up status chart:', error);
        }
    }

    setupCategoryChart() {
        try {
            const ctx = document.getElementById('categoryChart');
            if (!ctx) return;

            this.charts.categoryChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Harassment', 'Wage', 'Safety', 'Discrimination', 'Working Conditions'],
                    datasets: [{
                        label: 'Cases by Category',
                        data: [1, 1, 1, 1, 1],
                        backgroundColor: [
                            '#EF4444', // Red
                            '#F97316', // Orange
                            '#EAB308', // Yellow
                            '#8B5CF6', // Purple
                            '#06B6D4'  // Cyan
                        ],
                        borderWidth: 0,
                        borderRadius: 4
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
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('❌ Error setting up category chart:', error);
        }
    }

    updateCharts() {
        try {
            this.updateStatusChart();
            this.updateCategoryChart();
            console.log('📊 Charts updated');
        } catch (error) {
            console.error('❌ Error updating charts:', error);
        }
    }

    updateStatusChart() {
        try {
            if (!this.charts.statusChart) return;

            const statusCounts = {
                new: this.cases.filter(c => c.status === 'new').length,
                assigned: this.cases.filter(c => c.status === 'assigned').length,
                investigating: this.cases.filter(c => c.status === 'investigating').length,
                resolved: this.cases.filter(c => c.status === 'resolved').length,
                closed: this.cases.filter(c => c.status === 'closed').length
            };

            this.charts.statusChart.data.datasets[0].data = [
                statusCounts.new,
                statusCounts.assigned,
                statusCounts.investigating,
                statusCounts.resolved,
                statusCounts.closed
            ];

            this.charts.statusChart.update();
        } catch (error) {
            console.error('❌ Error updating status chart:', error);
        }
    }

    updateCategoryChart() {
        try {
            if (!this.charts.categoryChart) return;

            const categoryCounts = {
                harassment: this.cases.filter(c => c.category === 'harassment').length,
                wage: this.cases.filter(c => c.category === 'wage').length,
                safety: this.cases.filter(c => c.category === 'safety').length,
                discrimination: this.cases.filter(c => c.category === 'discrimination').length,
                working_conditions: this.cases.filter(c => c.category === 'working_conditions').length
            };

            this.charts.categoryChart.data.datasets[0].data = [
                categoryCounts.harassment,
                categoryCounts.wage,
                categoryCounts.safety,
                categoryCounts.discrimination,
                categoryCounts.working_conditions
            ];

            this.charts.categoryChart.update();
        } catch (error) {
            console.error('❌ Error updating category chart:', error);
        }
    }

    updateSLAMetrics() {
        try {
            // Response Time SLA
            const responseTime = 2.3; // Simulated average response time
            const responseSlaPercentage = Math.min(100, (responseTime / 3) * 100); // 3 days target
            
            document.getElementById('responseTime').textContent = `${responseTime} days`;
            document.getElementById('responseSlaProgress').style.width = `${responseSlaPercentage}%`;
            
            if (responseSlaPercentage >= 80) {
                document.getElementById('responseSlaStatus').textContent = 'Good';
                document.getElementById('responseSlaStatus').className = 'sla-status sla-good';
                document.getElementById('responseSlaProgress').className = 'progress-fill progress-good';
            } else if (responseSlaPercentage >= 60) {
                document.getElementById('responseSlaStatus').textContent = 'Warning';
                document.getElementById('responseSlaStatus').className = 'sla-status sla-warning';
                document.getElementById('responseSlaProgress').className = 'progress-fill progress-warning';
            } else {
                document.getElementById('responseSlaStatus').textContent = 'Critical';
                document.getElementById('responseSlaStatus').className = 'sla-status sla-critical';
                document.getElementById('responseSlaProgress').className = 'progress-fill progress-critical';
            }

            // Resolution Time SLA
            const resolutionTime = 7.2; // Simulated average resolution time
            const resolutionSlaPercentage = Math.min(100, (resolutionTime / 10) * 100); // 10 days target
            
            document.getElementById('resolutionTime').textContent = `${resolutionTime} days`;
            document.getElementById('resolutionSlaProgress').style.width = `${resolutionSlaPercentage}%`;
            
            if (resolutionSlaPercentage >= 80) {
                document.getElementById('resolutionSlaStatus').textContent = 'Good';
                document.getElementById('resolutionSlaStatus').className = 'sla-status sla-good';
                document.getElementById('resolutionSlaProgress').className = 'progress-fill progress-good';
            } else if (resolutionSlaPercentage >= 60) {
                document.getElementById('resolutionSlaStatus').textContent = 'Warning';
                document.getElementById('resolutionSlaStatus').className = 'sla-status sla-warning';
                document.getElementById('resolutionSlaProgress').className = 'progress-fill progress-warning';
            } else {
                document.getElementById('resolutionSlaStatus').textContent = 'Critical';
                document.getElementById('resolutionSlaStatus').className = 'sla-status sla-critical';
                document.getElementById('resolutionSlaProgress').className = 'progress-fill progress-critical';
            }

            // Investigation Time SLA
            const investigationTime = 4.1; // Simulated average investigation time
            const investigationSlaPercentage = Math.min(100, (investigationTime / 5) * 100); // 5 days target
            
            document.getElementById('investigationTime').textContent = `${investigationTime} days`;
            document.getElementById('investigationSlaProgress').style.width = `${investigationSlaPercentage}%`;
            
            if (investigationSlaPercentage >= 80) {
                document.getElementById('investigationSlaStatus').textContent = 'Good';
                document.getElementById('investigationSlaStatus').className = 'sla-status sla-good';
                document.getElementById('investigationSlaProgress').className = 'progress-fill progress-good';
            } else if (investigationSlaPercentage >= 60) {
                document.getElementById('investigationSlaStatus').textContent = 'Warning';
                document.getElementById('investigationSlaStatus').className = 'sla-status sla-warning';
                document.getElementById('investigationSlaProgress').className = 'progress-fill progress-warning';
            } else {
                document.getElementById('investigationSlaStatus').textContent = 'Critical';
                document.getElementById('investigationSlaStatus').className = 'sla-status sla-critical';
                document.getElementById('investigationSlaProgress').className = 'progress-fill progress-critical';
            }

            console.log('⏱️ SLA metrics updated');
        } catch (error) {
            console.error('❌ Error updating SLA metrics:', error);
        }
    }

    updatePerformanceMetrics() {
        try {
            // Simulated performance metrics
            const metrics = {
                caseLoad: 15,
                satisfactionRate: 94,
                repeatCases: 3,
                escalationRate: 8,
                complianceScore: 96,
                teamEfficiency: 87
            };

            document.getElementById('caseLoad').textContent = metrics.caseLoad;
            document.getElementById('satisfactionRate').textContent = `${metrics.satisfactionRate}%`;
            document.getElementById('repeatCases').textContent = `${metrics.repeatCases}%`;
            document.getElementById('escalationRate').textContent = `${metrics.escalationRate}%`;
            document.getElementById('complianceScore').textContent = `${metrics.complianceScore}%`;
            document.getElementById('teamEfficiency').textContent = `${metrics.teamEfficiency}%`;

            console.log('📊 Performance metrics updated');
        } catch (error) {
            console.error('❌ Error updating performance metrics:', error);
        }
    }

    setupEventListeners() {
        try {
            console.log('🎧 Dashboard event listeners set up');
        } catch (error) {
            console.error('❌ Error setting up event listeners:', error);
        }
    }

    // Chart Period Updates
    updateChartPeriod(period) {
        try {
            this.currentPeriod = period;
            console.log(`📊 Updating charts for period: ${period}`);
            
            // Update chart data based on period
            // In a real implementation, this would filter data by time period
            this.updateCharts();
        } catch (error) {
            console.error('❌ Error updating chart period:', error);
        }
    }

    updateCategoryChart() {
        try {
            console.log('📊 Refreshing category chart...');
            this.updateCharts();
        } catch (error) {
            console.error('❌ Error updating category chart:', error);
        }
    }

    // Dashboard Actions
    async refreshDashboard() {
        try {
            const refreshBtn = document.getElementById('refreshBtn');
            const originalHTML = refreshBtn.innerHTML;
            
            refreshBtn.innerHTML = '<div class="loading-spinner"></div> Refreshing...';
            refreshBtn.disabled = true;

            // Reload cases and update dashboard
            if (this.unsubscribe) {
                this.unsubscribe();
            }
            await this.loadCases();

            refreshBtn.innerHTML = originalHTML;
            refreshBtn.disabled = false;
            
            console.log('🔄 Dashboard refreshed');
        } catch (error) {
            console.error('❌ Error refreshing dashboard:', error);
        }
    }

    async exportDashboard() {
        try {
            console.log('📤 Exporting dashboard report...');
            
            // For now, just show export message
            // In the future, this would generate and download a PDF/Excel report
            alert('Dashboard export functionality will be implemented in the next iteration');
        } catch (error) {
            console.error('❌ Error exporting dashboard:', error);
        }
    }

    async generateReport() {
        try {
            console.log('📄 Generating dashboard report...');
            
            // For now, just show report generation message
            // In the future, this would generate a comprehensive report
            alert('Report generation functionality will be implemented in the next iteration');
        } catch (error) {
            console.error('❌ Error generating report:', error);
        }
    }

    loadRecentActivity() {
        try {
            console.log('📋 Loading recent activity...');
            
            // For now, just show message
            // In the future, this would load more activity items
            alert('Recent activity loading functionality will be implemented in the next iteration');
        } catch (error) {
            console.error('❌ Error loading recent activity:', error);
        }
    }

    // Cleanup
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        
        console.log('🧹 Case Dashboard destroyed');
    }
}

// Global functions for HTML onclick handlers
window.refreshDashboard = () => window.caseDashboard?.refreshDashboard();
window.exportDashboard = () => window.caseDashboard?.exportDashboard();
window.generateReport = () => window.caseDashboard?.generateReport();
window.loadRecentActivity = () => window.caseDashboard?.loadRecentActivity();
window.updateChartPeriod = (period) => window.caseDashboard?.updateChartPeriod(period);
window.updateCategoryChart = () => window.caseDashboard?.updateCategoryChart();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.caseDashboard = new CaseDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.caseDashboard) {
        window.caseDashboard.destroy();
    }
});
