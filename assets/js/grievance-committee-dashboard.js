// Grievance Committee Dashboard for Angkor Compliance v2
// Implements comprehensive case management and committee functionality

class GrievanceCommitteeDashboard {
    constructor() {
        this.db = window.Firebase?.db;
        this.auth = window.Firebase?.auth;
        this.currentUser = null;
        this.cases = [];
        this.assignedCases = [];
        this.statistics = {};
        this.isInitialized = false;
        this.chart = null;
        
        this.initializeCommitteeDashboard();
    }

    async initializeCommitteeDashboard() {
        try {
            console.log('🏛️ Initializing Grievance Committee Dashboard...');
            
            // Check authentication and role
            await this.checkAuthentication();
            
            // Load all data
            await Promise.all([
                this.loadCases(),
                this.loadAssignedCases(),
                this.loadStatistics(),
                this.setupRealTimeListeners()
            ]);
            
            // Initialize analytics chart
            this.initializeAnalyticsChart();
            
            this.isInitialized = true;
            console.log('✅ Grievance Committee Dashboard initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Grievance Committee Dashboard:', error);
            this.isInitialized = false;
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (!user) {
                    console.log('❌ No authenticated user, redirecting to login');
                    window.location.href = 'login.html';
                    return;
                }
                
                try {
                    const userDoc = await this.db.collection('users').doc(user.uid).get();
                    
                    if (!userDoc.exists) {
                        console.log('❌ No user profile found, redirecting to login');
                        window.location.href = 'login.html';
                        return;
                    }
                    
                    const userData = userDoc.data();
                    
                    // Check if user has grievance committee role
                    if (userData.role !== 'grievance_committee' && userData.role !== 'super_admin') {
                        console.log('⚠️ Access denied - insufficient permissions');
                        window.location.href = 'dashboard.html';
                        return;
                    }
                    
                    this.currentUser = { uid: user.uid, ...userData };
                    console.log('✅ Authentication verified for Grievance Committee');
                    resolve();
                    
                } catch (error) {
                    console.error('❌ Error checking authentication:', error);
                    reject(error);
                }
            });
        });
    }

    async loadCases() {
        try {
            const casesSnapshot = await this.db.collection('grievance_cases')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            this.cases = casesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.updateRecentCasesDisplay();
            console.log(`📋 Loaded ${this.cases.length} recent cases`);
        } catch (error) {
            console.error('Error loading cases:', error);
        }
    }

    async loadAssignedCases() {
        try {
            const assignedSnapshot = await this.db.collection('grievance_cases')
                .where('assignedTo', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();
            
            this.assignedCases = assignedSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.updateAssignedCasesDisplay();
            console.log(`📋 Loaded ${this.assignedCases.length} assigned cases`);
        } catch (error) {
            console.error('Error loading assigned cases:', error);
        }
    }

    async loadStatistics() {
        try {
            // Get all cases for statistics
            const allCasesSnapshot = await this.db.collection('grievance_cases').get();
            const allCases = allCasesSnapshot.docs.map(doc => doc.data());
            
            // Calculate statistics
            this.statistics = {
                totalCases: allCases.length,
                pendingCases: allCases.filter(c => c.status === 'new' || c.status === 'assigned').length,
                investigatingCases: allCases.filter(c => c.status === 'investigating').length,
                resolvedCases: allCases.filter(c => c.status === 'resolved').length,
                criticalCases: allCases.filter(c => c.priority === 'critical').length,
                avgResolutionTime: this.calculateAverageResolutionTime(allCases)
            };
            
            this.updateStatisticsDisplay();
            console.log('📊 Statistics loaded');
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    calculateAverageResolutionTime(cases) {
        const resolvedCases = cases.filter(c => c.status === 'resolved' && c.resolvedAt && c.createdAt);
        
        if (resolvedCases.length === 0) return 0;
        
        const totalDays = resolvedCases.reduce((sum, c) => {
            const created = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
            const resolved = c.resolvedAt.toDate ? c.resolvedAt.toDate() : new Date(c.resolvedAt);
            const days = (resolved - created) / (1000 * 60 * 60 * 24);
            return sum + days;
        }, 0);
        
        return Math.round(totalDays / resolvedCases.length);
    }

    setupRealTimeListeners() {
        // Listen for new cases
        this.db.collection('grievance_cases')
            .where('status', '==', 'new')
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        console.log('🆕 New case received:', change.doc.data());
                        this.loadCases(); // Refresh cases
                        this.loadStatistics(); // Refresh statistics
                    }
                });
            });
        
        // Listen for status changes on assigned cases
        this.db.collection('grievance_cases')
            .where('assignedTo', '==', this.currentUser.uid)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'modified') {
                        console.log('🔄 Assigned case updated:', change.doc.data());
                        this.loadAssignedCases(); // Refresh assigned cases
                        this.loadStatistics(); // Refresh statistics
                    }
                });
            });
    }

    updateRecentCasesDisplay() {
        const container = document.getElementById('recentCasesList');
        const countElement = document.getElementById('recentCasesCount');
        
        if (!container || !countElement) return;
        
        countElement.textContent = this.cases.length;
        
        if (this.cases.length === 0) {
            container.innerHTML = `
                <div class="case-item">
                    <div class="case-title">No recent cases</div>
                    <div class="case-meta">All caught up!</div>
                </div>
            `;
            return;
        }
        
        const casesHTML = this.cases.map(caseItem => `
            <div class="case-item" onclick="committeeDashboard.viewCase('${caseItem.id}')">
                <div class="case-title">${caseItem.title || 'Untitled Case'}</div>
                <div class="case-meta">
                    <span class="case-status status-${caseItem.status}">${this.formatStatus(caseItem.status)}</span>
                    <span>${this.formatDate(caseItem.createdAt)}</span>
                    <span>${caseItem.category || 'General'}</span>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = casesHTML;
    }

    updateAssignedCasesDisplay() {
        const container = document.getElementById('assignedCasesList');
        const countElement = document.getElementById('assignedCasesCount');
        
        if (!container || !countElement) return;
        
        countElement.textContent = this.assignedCases.length;
        
        if (this.assignedCases.length === 0) {
            container.innerHTML = `
                <div class="case-item">
                    <div class="case-title">No assigned cases</div>
                    <div class="case-meta">You're all caught up!</div>
                </div>
            `;
            return;
        }
        
        const casesHTML = this.assignedCases.map(caseItem => `
            <div class="case-item" onclick="committeeDashboard.viewCase('${caseItem.id}')">
                <div class="case-title">${caseItem.title || 'Untitled Case'}</div>
                <div class="case-meta">
                    <span class="case-status status-${caseItem.status}">${this.formatStatus(caseItem.status)}</span>
                    <span>${this.formatDate(caseItem.assignedAt || caseItem.createdAt)}</span>
                    <span>${caseItem.priority || 'Medium'} Priority</span>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = casesHTML;
    }

    updateStatisticsDisplay() {
        // Update stat values
        document.getElementById('totalCases').textContent = this.statistics.totalCases;
        document.getElementById('pendingCases').textContent = this.statistics.pendingCases;
        document.getElementById('investigatingCases').textContent = this.statistics.investigatingCases;
        document.getElementById('resolvedCases').textContent = this.statistics.resolvedCases;
        document.getElementById('criticalCases').textContent = this.statistics.criticalCases;
        document.getElementById('avgResolutionTime').textContent = `${this.statistics.avgResolutionTime} days`;
        
        // Update trends (simplified - in real implementation, this would compare with historical data)
        this.updateTrends();
    }

    updateTrends() {
        // This would typically compare current stats with previous period
        // For now, we'll use placeholder trends
        const trends = {
            casesTrend: '+12% this month',
            pendingTrend: '-5% this week',
            investigatingTrend: 'No change',
            resolvedTrend: '+8% this month',
            criticalTrend: '+3 this week',
            resolutionTrend: '-2 days'
        };
        
        Object.keys(trends).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = trends[key];
            }
        });
    }

    initializeAnalyticsChart() {
        const ctx = document.getElementById('caseAnalyticsChart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Prepare data for chart
        const chartData = this.prepareChartData();
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'New Cases',
                        data: chartData.newCases,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Resolved Cases',
                        data: chartData.resolvedCases,
                        borderColor: '#10b981',
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
                        display: true,
                        text: 'Case Trends (Last 30 Days)'
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
    }

    prepareChartData() {
        // Generate sample data for the last 30 days
        const labels = [];
        const newCases = [];
        const resolvedCases = [];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Generate sample data (in real implementation, this would come from actual case data)
            newCases.push(Math.floor(Math.random() * 5) + 1);
            resolvedCases.push(Math.floor(Math.random() * 4) + 1);
        }
        
        return { labels, newCases, resolvedCases };
    }

    // Case Management Methods
    async viewCase(caseId) {
        try {
            console.log(`👀 Viewing case: ${caseId}`);
            
            // Navigate to case detail page or open modal
            window.location.href = `grievance-case-detail.html?id=${caseId}`;
            
        } catch (error) {
            console.error('Error viewing case:', error);
            alert('Error loading case details. Please try again.');
        }
    }

    async assignCase(caseId, committeeMemberId) {
        try {
            if (!window.RBACSystem) {
                throw new Error('RBAC system not available');
            }
            
            const result = await window.RBACSystem.assignGrievanceCase(caseId, committeeMemberId);
            
            if (result.success) {
                console.log(`✅ Case ${caseId} assigned successfully`);
                this.loadCases(); // Refresh cases
                this.loadAssignedCases(); // Refresh assigned cases
                return result;
            }
        } catch (error) {
            console.error('Error assigning case:', error);
            throw error;
        }
    }

    async updateCaseStatus(caseId, newStatus, notes = '') {
        try {
            if (!window.RBACSystem) {
                throw new Error('RBAC system not available');
            }
            
            const result = await window.RBACSystem.updateGrievanceStatus(
                caseId, 
                newStatus, 
                this.currentUser.uid, 
                notes
            );
            
            if (result.success) {
                console.log(`✅ Case ${caseId} status updated to ${newStatus}`);
                this.loadCases(); // Refresh cases
                this.loadAssignedCases(); // Refresh assigned cases
                this.loadStatistics(); // Refresh statistics
                return result;
            }
        } catch (error) {
            console.error('Error updating case status:', error);
            throw error;
        }
    }

    async addCaseNote(caseId, note, isInternal = false) {
        try {
            if (!window.RBACSystem) {
                throw new Error('RBAC system not available');
            }
            
            const result = await window.RBACSystem.addGrievanceNote(
                caseId, 
                this.currentUser.uid, 
                note, 
                isInternal
            );
            
            if (result.success) {
                console.log(`✅ Note added to case ${caseId}`);
                return result;
            }
        } catch (error) {
            console.error('Error adding case note:', error);
            throw error;
        }
    }

    // Utility Methods
    formatStatus(status) {
        const statusMap = {
            'new': 'New',
            'assigned': 'Assigned',
            'investigating': 'Investigating',
            'resolved': 'Resolved',
            'closed': 'Closed'
        };
        
        return statusMap[status] || status;
    }

    formatDate(date) {
        if (!date) return 'Unknown';
        
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Export Methods
    async exportCommitteeReport() {
        try {
            console.log('📊 Exporting committee report...');
            
            const reportData = {
                generatedAt: new Date(),
                generatedBy: this.currentUser.uid,
                statistics: this.statistics,
                recentCases: this.cases.slice(0, 10),
                assignedCases: this.assignedCases,
                period: 'Last 30 days'
            };
            
            // Convert to CSV
            const csv = this.convertToCSV(reportData);
            
            // Download file
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `grievance-committee-report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            console.log('✅ Committee report exported successfully');
        } catch (error) {
            console.error('Error exporting committee report:', error);
            alert('Error exporting report. Please try again.');
        }
    }

    convertToCSV(data) {
        // Simple CSV conversion for report data
        const headers = ['Case ID', 'Title', 'Status', 'Priority', 'Category', 'Created Date', 'Assigned To'];
        const rows = [];
        
        // Add recent cases
        data.recentCases.forEach(caseItem => {
            rows.push([
                caseItem.id,
                caseItem.title || 'Untitled',
                caseItem.status,
                caseItem.priority || 'Medium',
                caseItem.category || 'General',
                this.formatDate(caseItem.createdAt),
                caseItem.assignedTo || 'Unassigned'
            ]);
        });
        
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        return csvContent;
    }

    // Refresh Methods
    async refreshCommitteeData() {
        try {
            const refreshBtn = document.getElementById('refreshBtn');
            const originalHTML = refreshBtn.innerHTML;
            
            // Show loading state
            refreshBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Refreshing...';
            refreshBtn.disabled = true;
            
            // Reload all data
            await Promise.all([
                this.loadCases(),
                this.loadAssignedCases(),
                this.loadStatistics()
            ]);
            
            // Reinitialize chart
            this.initializeAnalyticsChart();
            
            console.log('✅ Committee data refreshed successfully');
            
        } catch (error) {
            console.error('Error refreshing committee data:', error);
        } finally {
            // Restore button state
            const refreshBtn = document.getElementById('refreshBtn');
            refreshBtn.innerHTML = '<i data-lucide="refresh-cw"></i> Refresh';
            refreshBtn.disabled = false;
        }
    }
}

// Initialize Grievance Committee Dashboard
window.committeeDashboard = new GrievanceCommitteeDashboard();

// Global functions for HTML onclick handlers
window.openNewCaseModal = function() {
    console.log('➕ Opening new case modal...');
    // Implementation for new case modal
    alert('New case modal would open here');
};

window.exportCommitteeReport = function() {
    if (window.committeeDashboard) {
        window.committeeDashboard.exportCommitteeReport();
    }
};

window.refreshCommitteeData = function() {
    if (window.committeeDashboard) {
        window.committeeDashboard.refreshCommitteeData();
    }
};
