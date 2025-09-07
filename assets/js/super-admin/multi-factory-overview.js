// Multi-Factory Overview System for Super Admin

class MultiFactoryOverview {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.factories = [];
        this.filteredFactories = [];
        this.performanceChart = null;
        this.currentMetric = 'compliance';
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            await this.loadAllData();
        } catch (error) {
            console.error('Error initializing Multi-Factory Overview:', error);
            this.showError('Failed to initialize overview');
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    try {
                        // Get user's role information
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.role === 'super_admin') {
                                resolve();
                            } else {
                                reject(new Error('Access denied. Super admin role required.'));
                            }
                        } else {
                            reject(new Error('User profile not found'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('User not authenticated'));
                }
            });
        });
    }

    setupEventListeners() {
        // Performance metric selector
        document.getElementById('performanceMetric').addEventListener('change', (e) => {
            this.currentMetric = e.target.value;
            this.updatePerformanceChart();
        });

        // Filter event listeners
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('industryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('complianceFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('regionFilter').addEventListener('change', () => this.applyFilters());
    }

    async loadAllData() {
        try {
            this.showLoading();
            
            // Load factories and their statistics
            await this.loadFactories();
            await this.loadSystemStatistics();
            await this.loadRecentActivity();
            
            this.initializePerformanceChart();
            this.updateFactoriesTable();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load overview data');
        } finally {
            this.hideLoading();
        }
    }

    async loadFactories() {
        try {
            const factoriesSnapshot = await this.db
                .collection('factories')
                .orderBy('name')
                .get();

            this.factories = [];
            
            for (const doc of factoriesSnapshot.docs) {
                const factoryData = doc.data();
                
                // Get factory statistics
                const stats = await this.getFactoryStatistics(doc.id);
                
                this.factories.push({
                    id: doc.id,
                    ...factoryData,
                    ...stats,
                    createdAt: factoryData.createdAt?.toDate() || new Date(),
                    updatedAt: factoryData.updatedAt?.toDate() || new Date()
                });
            }

            this.filteredFactories = [...this.factories];
            
        } catch (error) {
            console.error('Error loading factories:', error);
            throw error;
        }
    }

    async getFactoryStatistics(factoryId) {
        try {
            // Get user count
            const usersSnapshot = await this.db
                .collection('users')
                .where('factoryId', '==', factoryId)
                .where('status', '==', 'active')
                .get();

            // Get case count
            const casesSnapshot = await this.db
                .collection('grievance_cases')
                .where('factoryId', '==', factoryId)
                .get();

            // Mock compliance score (in real app, this would be calculated)
            const complianceScore = Math.floor(Math.random() * 40) + 60; // 60-100%

            return {
                activeUsers: usersSnapshot.size,
                totalCases: casesSnapshot.size,
                complianceScore: complianceScore,
                activityLevel: Math.floor(Math.random() * 100) + 1
            };
        } catch (error) {
            console.error('Error getting factory statistics:', error);
            return { activeUsers: 0, totalCases: 0, complianceScore: 0, activityLevel: 0 };
        }
    }

    async loadSystemStatistics() {
        try {
            // Calculate system-wide statistics
            const totalFactories = this.factories.length;
            const totalUsers = this.factories.reduce((sum, factory) => sum + factory.activeUsers, 0);
            const totalCases = this.factories.reduce((sum, factory) => sum + factory.totalCases, 0);
            const avgCompliance = this.factories.length > 0 
                ? Math.round(this.factories.reduce((sum, factory) => sum + factory.complianceScore, 0) / this.factories.length)
                : 0;

            // Update statistics display
            document.getElementById('totalFactories').textContent = totalFactories;
            document.getElementById('activeUsers').textContent = totalUsers;
            document.getElementById('totalCases').textContent = totalCases;
            document.getElementById('avgCompliance').textContent = `${avgCompliance}%`;

            // Update change indicators (mock data for now)
            this.updateChangeIndicators();

        } catch (error) {
            console.error('Error loading system statistics:', error);
        }
    }

    updateChangeIndicators() {
        // Mock change indicators
        const changes = {
            factoriesChange: '+2 this month',
            usersChange: '+15% from last week',
            casesChange: '+8% from last week',
            complianceChange: '+3% from last month'
        };

        Object.entries(changes).forEach(([id, change]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = change;
                element.className = `stat-change ${change.includes('+') ? 'positive' : 'negative'}`;
            }
        });
    }

    async loadRecentActivity() {
        try {
            // In a real app, this would load from an activity log collection
            // For now, we'll use mock data
            const activities = [
                {
                    type: 'factory_registered',
                    title: 'New factory registered',
                    time: '2 minutes ago',
                    icon: 'plus'
                },
                {
                    type: 'settings_updated',
                    title: 'Factory settings updated',
                    time: '15 minutes ago',
                    icon: 'settings'
                },
                {
                    type: 'user_added',
                    title: 'New user added',
                    time: '1 hour ago',
                    icon: 'user-plus'
                },
                {
                    type: 'compliance_alert',
                    title: 'Compliance alert',
                    time: '2 hours ago',
                    icon: 'alert-triangle'
                }
            ];

            this.updateActivityList(activities);

        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    updateActivityList(activities) {
        const activityList = document.getElementById('activityList');
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i data-lucide="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    initializePerformanceChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        this.performanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Performance',
                    data: [],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        this.updatePerformanceChart();
    }

    updatePerformanceChart() {
        if (!this.performanceChart) return;

        const metricLabels = {
            compliance: 'Compliance Score',
            cases: 'Case Volume',
            users: 'Active Users',
            activity: 'Activity Level'
        };

        const labels = this.filteredFactories.map(factory => factory.name);
        const data = this.filteredFactories.map(factory => {
            switch (this.currentMetric) {
                case 'compliance':
                    return factory.complianceScore;
                case 'cases':
                    return factory.totalCases;
                case 'users':
                    return factory.activeUsers;
                case 'activity':
                    return factory.activityLevel;
                default:
                    return factory.complianceScore;
            }
        });

        this.performanceChart.data.labels = labels;
        this.performanceChart.data.datasets[0].data = data;
        this.performanceChart.data.datasets[0].label = metricLabels[this.currentMetric];
        this.performanceChart.update();
    }

    updateFactoriesTable() {
        const tableBody = document.getElementById('factoriesTableBody');
        
        if (this.filteredFactories.length === 0) {
            tableBody.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="building"></i>
                    <h3>No factories found</h3>
                    <p>No factories match the current filters</p>
                </div>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredFactories.map(factory => `
            <div class="table-row">
                <div class="factory-avatar">
                    ${this.getInitials(factory.name)}
                </div>
                <div class="factory-info">
                    <div class="factory-name">${factory.name}</div>
                    <div class="factory-details">${this.getIndustryName(factory.industry)}</div>
                </div>
                <div class="factory-info">
                    <div class="factory-name">${factory.city || 'N/A'}</div>
                    <div class="factory-details">${factory.country || 'N/A'}</div>
                </div>
                <div>
                    <span class="status-badge status-${factory.status || 'active'}">
                        ${(factory.status || 'active').charAt(0).toUpperCase() + (factory.status || 'active').slice(1)}
                    </span>
                </div>
                <div class="compliance-score">
                    ${factory.activeUsers || 0}
                </div>
                <div class="compliance-score ${this.getComplianceClass(factory.complianceScore)}">
                    ${factory.complianceScore || 0}%
                </div>
                <div>
                    <button class="btn btn-sm btn-outline" onclick="viewFactory('${factory.id}')">
                        <i data-lucide="eye"></i> View
                    </button>
                </div>
            </div>
        `).join('');

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const industryFilter = document.getElementById('industryFilter').value;
        const complianceFilter = document.getElementById('complianceFilter').value;
        const regionFilter = document.getElementById('regionFilter').value;

        this.filteredFactories = this.factories.filter(factory => {
            // Status filter
            if (statusFilter && factory.status !== statusFilter) return false;
            
            // Industry filter
            if (industryFilter && factory.industry !== industryFilter) return false;
            
            // Compliance filter
            if (complianceFilter) {
                const score = factory.complianceScore || 0;
                switch (complianceFilter) {
                    case 'high':
                        if (score < 80) return false;
                        break;
                    case 'medium':
                        if (score < 60 || score >= 80) return false;
                        break;
                    case 'low':
                        if (score >= 60) return false;
                        break;
                }
            }
            
            // Region filter
            if (regionFilter && factory.country !== regionFilter) return false;
            
            return true;
        });

        this.updateFactoriesTable();
        this.updatePerformanceChart();
    }

    clearFilters() {
        document.getElementById('statusFilter').value = '';
        document.getElementById('industryFilter').value = '';
        document.getElementById('complianceFilter').value = '';
        document.getElementById('regionFilter').value = '';
        
        this.filteredFactories = [...this.factories];
        this.updateFactoriesTable();
        this.updatePerformanceChart();
    }

    async exportOverviewData() {
        try {
            const exportData = {
                overview: {
                    totalFactories: this.factories.length,
                    totalUsers: this.factories.reduce((sum, factory) => sum + factory.activeUsers, 0),
                    totalCases: this.factories.reduce((sum, factory) => sum + factory.totalCases, 0),
                    avgCompliance: this.factories.length > 0 
                        ? Math.round(this.factories.reduce((sum, factory) => sum + factory.complianceScore, 0) / this.factories.length)
                        : 0
                },
                factories: this.filteredFactories.map(factory => ({
                    id: factory.id,
                    name: factory.name,
                    industry: factory.industry,
                    location: `${factory.city}, ${factory.country}`,
                    status: factory.status,
                    activeUsers: factory.activeUsers,
                    totalCases: factory.totalCases,
                    complianceScore: factory.complianceScore,
                    activityLevel: factory.activityLevel
                })),
                exportedAt: new Date().toISOString(),
                exportedBy: this.currentUser.email
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `multi_factory_overview_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);

            this.showSuccess('Overview data exported successfully');

        } catch (error) {
            console.error('Error exporting overview data:', error);
            this.showError('Failed to export overview data');
        }
    }

    async generateReport() {
        try {
            this.showLoading();
            
            // In a real app, this would generate a comprehensive PDF report
            // For now, we'll create a simple HTML report
            
            const reportData = {
                title: 'Multi-Factory Overview Report',
                generatedAt: new Date().toISOString(),
                generatedBy: this.currentUser.email,
                summary: {
                    totalFactories: this.factories.length,
                    totalUsers: this.factories.reduce((sum, factory) => sum + factory.activeUsers, 0),
                    totalCases: this.factories.reduce((sum, factory) => sum + factory.totalCases, 0),
                    avgCompliance: this.factories.length > 0 
                        ? Math.round(this.factories.reduce((sum, factory) => sum + factory.complianceScore, 0) / this.factories.length)
                        : 0
                },
                factories: this.filteredFactories
            };

            // Create and download report
            const reportHtml = this.generateReportHTML(reportData);
            const blob = new Blob([reportHtml], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `factory_overview_report_${new Date().toISOString().split('T')[0]}.html`;
            a.click();
            window.URL.revokeObjectURL(url);

            this.showSuccess('Report generated successfully');

        } catch (error) {
            console.error('Error generating report:', error);
            this.showError('Failed to generate report');
        } finally {
            this.hideLoading();
        }
    }

    generateReportHTML(data) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${data.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .summary { background: #f5f5f5; padding: 20px; margin-bottom: 30px; }
                    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
                    .summary-item { text-align: center; }
                    .summary-number { font-size: 24px; font-weight: bold; color: #3b82f6; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #3b82f6; color: white; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${data.title}</h1>
                    <p>Generated on ${new Date(data.generatedAt).toLocaleString()}</p>
                    <p>Generated by: ${data.generatedBy}</p>
                </div>
                
                <div class="summary">
                    <h2>System Summary</h2>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-number">${data.summary.totalFactories}</div>
                            <div>Total Factories</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-number">${data.summary.totalUsers}</div>
                            <div>Active Users</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-number">${data.summary.totalCases}</div>
                            <div>Total Cases</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-number">${data.summary.avgCompliance}%</div>
                            <div>Avg Compliance</div>
                        </div>
                    </div>
                </div>
                
                <h2>Factory Details</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Factory Name</th>
                            <th>Industry</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Users</th>
                            <th>Cases</th>
                            <th>Compliance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.factories.map(factory => `
                            <tr>
                                <td>${factory.name}</td>
                                <td>${this.getIndustryName(factory.industry)}</td>
                                <td>${factory.city}, ${factory.country}</td>
                                <td>${factory.status}</td>
                                <td>${factory.activeUsers}</td>
                                <td>${factory.totalCases}</td>
                                <td>${factory.complianceScore}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
    }

    async refreshData() {
        await this.loadAllData();
        this.showSuccess('Data refreshed successfully');
    }

    // Helper methods
    getInitials(name) {
        return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
    }

    getIndustryName(industry) {
        const industries = {
            'textiles': 'Textiles & Apparel',
            'electronics': 'Electronics',
            'automotive': 'Automotive',
            'food': 'Food & Beverage',
            'chemicals': 'Chemicals',
            'pharmaceuticals': 'Pharmaceuticals',
            'construction': 'Construction',
            'other': 'Other'
        };
        return industries[industry] || industry;
    }

    getComplianceClass(score) {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    }

    showLoading() {
        // Add loading indicator
        const refreshButton = document.querySelector('button[onclick="refreshData()"]');
        if (refreshButton) {
            refreshButton.disabled = true;
            refreshButton.innerHTML = '<i data-lucide="loader-2"></i> Loading...';
        }
    }

    hideLoading() {
        // Remove loading indicator
        const refreshButton = document.querySelector('button[onclick="refreshData()"]');
        if (refreshButton) {
            refreshButton.disabled = false;
            refreshButton.innerHTML = '<i data-lucide="refresh-cw"></i> Refresh';
        }
    }

    showSuccess(message) {
        // Implement success notification
        alert(message); // Replace with proper notification system
    }

    showError(message) {
        // Implement error notification
        alert('Error: ' + message); // Replace with proper notification system
    }
}

// Global functions for button actions
let multiFactoryOverview;

function applyFilters() {
    multiFactoryOverview.applyFilters();
}

function clearFilters() {
    multiFactoryOverview.clearFilters();
}

function updatePerformanceChart() {
    multiFactoryOverview.updatePerformanceChart();
}

function viewFactory(factoryId) {
    // Navigate to factory details page
    window.location.href = `../factory-admin/factory-settings-panel.html?factory=${factoryId}`;
}

function exportOverviewData() {
    multiFactoryOverview.exportOverviewData();
}

function refreshData() {
    multiFactoryOverview.refreshData();
}

function generateReport() {
    multiFactoryOverview.generateReport();
}

function viewAllFactories() {
    // Navigate to factory list page
    window.location.href = 'factory-registration.html';
}

function registerNewFactory() {
    // Navigate to factory registration page
    window.location.href = 'factory-registration.html';
}

function bulkSettings() {
    // Navigate to bulk settings page
    window.location.href = 'factory-settings-panel.html';
}

function systemAnalytics() {
    // Navigate to system analytics page
    alert('System Analytics feature coming soon');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    multiFactoryOverview = new MultiFactoryOverview();
    window.multiFactoryOverview = multiFactoryOverview;
    multiFactoryOverview.init();
});
