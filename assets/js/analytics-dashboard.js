// Analytics Dashboard for Angkor Compliance v2
// Handles risk heatmaps, KPI visualization, and export functionality

class AnalyticsDashboard {
    constructor() {
        this.currentUser = null;
        this.selectedFactory = '';
        this.dateRange = 30;
        this.riskLevel = '';
        this.exportFormat = 'higg';
        this.complianceTrendsChart = null;
        this.riskDistributionChart = null;
        this.isInitialized = false;
        
        this.initializeAnalyticsDashboard();
    }

    async initializeAnalyticsDashboard() {
        try {
            console.log('📊 Initializing Analytics Dashboard...');
            
            // Wait for Firebase to be ready
            await this.waitForFirebase();
            
            // Check authentication
            await this.checkAuthentication();
            
            // Load sidebar
            await this.loadSidebar();
            
            // Initialize dashboard components
            await Promise.all([
                this.loadFactories(),
                this.loadKPIs(),
                this.loadRiskHeatmap(),
                this.initializeCharts()
            ]);
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Analytics Dashboard initialized');
                    
                } catch (error) {
            console.error('❌ Error initializing Analytics Dashboard:', error);
            this.isInitialized = false;
        }
    }

    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.Firebase && window.Firebase.db) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    async checkAuthentication() {
        try {
            const auth = window.Firebase?.auth;
            if (!auth) {
                throw new Error('Firebase Auth not available');
            }

            return new Promise((resolve, reject) => {
                const unsubscribe = auth.onAuthStateChanged(async (user) => {
                    unsubscribe();
                    if (user) {
                        this.currentUser = user;
                        console.log('✅ User authenticated:', user.email);
                        resolve(user);
                    } else {
                        console.log('❌ No user authenticated');
                        window.location.href = 'login.html';
                        reject(new Error('No user authenticated'));
                    }
                });
            });
    } catch (error) {
            console.error('Error checking authentication:', error);
            throw error;
        }
    }

    async loadSidebar() {
        try {
            const sidebarContainer = document.getElementById('sidebarContainer');
            if (!sidebarContainer) {
                throw new Error('Sidebar container not found');
            }

            // Load sidebar template
            const response = await fetch('assets/templates/sidebar.html');
            const sidebarTemplate = await response.text();
            
            sidebarContainer.innerHTML = sidebarTemplate;
            
            // Initialize sidebar functionality
            this.initializeSidebar();
        
    } catch (error) {
            console.error('Error loading sidebar:', error);
        }
    }

    initializeSidebar() {
        // Add active class to current page
        const currentPage = 'analytics-dashboard';
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        
        sidebarLinks.forEach(link => {
            if (link.getAttribute('data-page') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    async loadFactories() {
        try {
            const factoryFilter = document.getElementById('factoryFilter');
            if (!factoryFilter) return;

            // Get user's accessible factories based on role
            const userRole = this.currentUser.role || 'user';
            let factories = [];

            if (userRole === 'super_admin') {
                // Super admin can see all factories
                const factoriesSnapshot = await window.Firebase.db.collection('factories').get();
                factories = factoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
            } else {
                // Other roles see assigned factories
                const userDoc = await window.Firebase.db.collection('users').doc(this.currentUser.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    factories = userData.assignedFactories || [];
                }
            }

            // Populate factory filter
            factoryFilter.innerHTML = '<option value="">All Factories</option>';
            factories.forEach(factory => {
                const option = document.createElement('option');
                option.value = factory.id;
                option.textContent = factory.name;
                factoryFilter.appendChild(option);
            });
        
    } catch (error) {
            console.error('Error loading factories:', error);
        }
    }

    async loadKPIs() {
        try {
            const dateRange = this.getDateRange();
            const factoryId = this.selectedFactory || 'all';

            // Get KPI data
            const kpiData = await window.AnalyticsSystem?.calculateKPIs(factoryId, dateRange);
            
            if (kpiData) {
                this.updateKPIDisplay(kpiData);
            }

        } catch (error) {
            console.error('Error loading KPIs:', error);
        }
    }

    async loadRiskHeatmap() {
        try {
            const dateRange = this.getDateRange();
            const factoryId = this.selectedFactory || 'all';

            // Get risk heatmap data
            const riskData = await window.AnalyticsSystem?.generateRiskHeatmap(factoryId, dateRange);
            
            if (riskData) {
                this.updateRiskHeatmap(riskData);
            }

        } catch (error) {
            console.error('Error loading risk heatmap:', error);
        }
    }

    async initializeCharts() {
        try {
            await this.initializeComplianceTrendsChart();
            await this.initializeRiskDistributionChart();
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    async initializeComplianceTrendsChart() {
        try {
            const ctx = document.getElementById('complianceTrendsChart');
    if (!ctx) return;
    
            // Sample data - in real implementation, this would come from the analytics system
            const chartData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Compliance Score',
                    data: [85, 87, 89, 91, 88, 92],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Risk Score',
                    data: [15, 13, 11, 9, 12, 8],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            };

            this.complianceTrendsChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                }
            },
            scales: {
                y: {
                            beginAtZero: true,
                            max: 100
                }
            }
        }
    });

        } catch (error) {
            console.error('Error initializing compliance trends chart:', error);
        }
    }

    async initializeRiskDistributionChart() {
        try {
            const ctx = document.getElementById('riskDistributionChart');
            if (!ctx) return;

            // Sample data - in real implementation, this would come from the analytics system
            const chartData = {
                labels: ['Critical', 'High', 'Medium', 'Low'],
                datasets: [{
                    data: [2, 8, 15, 25],
                    backgroundColor: [
                        '#dc3545',
                        '#fd7e14',
                        '#ffc107',
                        '#28a745'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            };

            this.riskDistributionChart = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
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
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error initializing risk distribution chart:', error);
        }
    }

    updateKPIDisplay(kpiData) {
        try {
            // Update overall score
            const overallScore = document.getElementById('overallScore');
            if (overallScore) {
                overallScore.textContent = kpiData.overallScore;
            }

            // Update risk level
            const riskLevel = document.getElementById('riskLevel');
            if (riskLevel) {
                const riskKPI = kpiData.kpis.risk;
                if (riskKPI.score >= 80) {
                    riskLevel.textContent = 'Low';
                    riskLevel.style.color = '#28a745';
                } else if (riskKPI.score >= 60) {
                    riskLevel.textContent = 'Medium';
                    riskLevel.style.color = '#ffc107';
                } else if (riskKPI.score >= 40) {
                    riskLevel.textContent = 'High';
                    riskLevel.style.color = '#fd7e14';
                } else {
                    riskLevel.textContent = 'Critical';
                    riskLevel.style.color = '#dc3545';
                }
            }

            // Update open CAPs
            const openCAPs = document.getElementById('openCAPs');
            if (openCAPs) {
                const complianceKPI = kpiData.kpis.compliance;
                const totalCAPs = complianceKPI.metrics.totalCAPs;
                const completedCAPs = complianceKPI.metrics.completedCAPs;
                openCAPs.textContent = totalCAPs - completedCAPs;
            }

            // Update active grievances
            const activeGrievances = document.getElementById('activeGrievances');
            if (activeGrievances) {
                const qualityKPI = kpiData.kpis.quality;
                const totalGrievances = qualityKPI.metrics.totalGrievances;
                const resolvedGrievances = qualityKPI.metrics.resolvedGrievances;
                activeGrievances.textContent = totalGrievances - resolvedGrievances;
            }

        } catch (error) {
            console.error('Error updating KPI display:', error);
        }
    }

    updateRiskHeatmap(riskData) {
        try {
            const heatmapContainer = document.getElementById('riskHeatmap');
            if (!heatmapContainer) return;

            const riskMatrix = riskData.riskMatrix;
            const distribution = riskData.riskDistribution;

            heatmapContainer.innerHTML = `
                <div class="risk-level-card critical">
                    <div class="risk-count">${riskMatrix.critical.count}</div>
                    <div class="risk-label">Critical</div>
                    <div class="risk-percentage">${distribution.critical}%</div>
            </div>
                <div class="risk-level-card high">
                    <div class="risk-count">${riskMatrix.high.count}</div>
                    <div class="risk-label">High</div>
                    <div class="risk-percentage">${distribution.high}%</div>
                </div>
                <div class="risk-level-card medium">
                    <div class="risk-count">${riskMatrix.medium.count}</div>
                    <div class="risk-label">Medium</div>
                    <div class="risk-percentage">${distribution.medium}%</div>
            </div>
                <div class="risk-level-card low">
                    <div class="risk-count">${riskMatrix.low.count}</div>
                    <div class="risk-label">Low</div>
                    <div class="risk-percentage">${distribution.low}%</div>
        </div>
    `;

        } catch (error) {
            console.error('Error updating risk heatmap:', error);
        }
    }

    getDateRange() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - this.dateRange);

        return {
            start: startDate,
            end: endDate
        };
    }

    setupEventListeners() {
        // Factory filter
        const factoryFilter = document.getElementById('factoryFilter');
        if (factoryFilter) {
            factoryFilter.addEventListener('change', (e) => {
                this.selectedFactory = e.target.value;
                this.refreshData();
            });
        }

        // Date range filter
        const dateRangeFilter = document.getElementById('dateRangeFilter');
        if (dateRangeFilter) {
            dateRangeFilter.addEventListener('change', (e) => {
                this.dateRange = parseInt(e.target.value);
                this.refreshData();
            });
        }

        // Risk level filter
        const riskLevelFilter = document.getElementById('riskLevelFilter');
        if (riskLevelFilter) {
            riskLevelFilter.addEventListener('change', (e) => {
                this.riskLevel = e.target.value;
                this.refreshData();
            });
        }

        // Export format filter
        const exportFormatFilter = document.getElementById('exportFormatFilter');
        if (exportFormatFilter) {
            exportFormatFilter.addEventListener('change', (e) => {
                this.exportFormat = e.target.value;
            });
        }

        // Export option selection
        const exportOptions = document.querySelectorAll('.export-option');
        exportOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                // Remove selected class from all options
                exportOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected class to clicked option
                option.classList.add('selected');
                
                // Update export format
                this.exportFormat = option.getAttribute('data-format');
                
                // Update filter dropdown
                if (exportFormatFilter) {
                    exportFormatFilter.value = this.exportFormat;
                }
            });
        });
    }

    async refreshData() {
        try {
            console.log('🔄 Refreshing analytics data...');
            
            await Promise.all([
                this.loadKPIs(),
                this.loadRiskHeatmap()
            ]);
            
            console.log('✅ Analytics data refreshed');
    } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }
}

// Initialize Analytics Dashboard
window.analyticsDashboard = new AnalyticsDashboard();

// Global functions for HTML onclick handlers
window.refreshAnalytics = function() {
    window.analyticsDashboard.refreshData();
};

window.exportAnalytics = function() {
    // Implement analytics export functionality
    try {
        const exportData = this.prepareExportData();
        const format = format || 'json';
        
        const result = await window.analyticsExportsSystem?.exportToFormat(exportData, format);
        
        if (result && result.data) {
            if (result.blob) {
                // Download file for PDF, Excel, CSV
                const link = document.createElement('a');
                link.href = result.data;
                link.download = result.filename || `analytics-export-${new Date().toISOString().split('T')[0]}.${format}`;
                link.click();
                URL.revokeObjectURL(result.data);
            } else {
                // For JSON, create text file
                const blob = new Blob([result.data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = result.filename || `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
            }
            
            this.showNotification(`Analytics exported successfully as ${format.toUpperCase()}`, 'success');
        }
    } catch (error) {
        console.error('Export error:', error);
        this.showNotification('Failed to export analytics. Please try again.', 'error');
    }
    // Export functionality implemented above
};

// Add prepareExportData method to AnalyticsDashboard class
AnalyticsDashboard.prototype.prepareExportData = function() {
    return {
        compliance: this.complianceData || [],
        risks: this.riskData || {},
        kpis: this.kpiData || [],
        caps: this.capData || [],
        permits: this.permitsData || [],
        grievances: this.grievancesData || [],
        exportDate: new Date().toISOString(),
        factoryId: this.currentFactoryId || 'default',
        userId: this.currentUserId || 'anonymous'
    };
};

window.generateRiskReport = async function() {
    try {
        const dateRange = window.analyticsDashboard.getDateRange();
        const factoryId = window.analyticsDashboard.selectedFactory || 'all';
        
        const riskReport = await window.AnalyticsSystem?.generateRiskHeatmap(factoryId, dateRange);
        
        if (riskReport) {
            // Create downloadable report
            const reportBlob = new Blob([JSON.stringify(riskReport, null, 2)], { type: 'application/json' });
            const reportUrl = URL.createObjectURL(reportBlob);
            
    const link = document.createElement('a');
            link.href = reportUrl;
            link.download = `risk-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
            
            URL.revokeObjectURL(reportUrl);
            console.log('✅ Risk report exported');
        }
    } catch (error) {
        console.error('Error generating risk report:', error);
        alert('Error generating risk report');
    }
};

window.generateBuyerExport = async function() {
    try {
        const dateRange = window.analyticsDashboard.getDateRange();
        const factoryId = window.analyticsDashboard.selectedFactory || 'all';
        const buyerFormat = window.analyticsDashboard.exportFormat;
        
        if (!factoryId || factoryId === 'all') {
            alert('Please select a specific factory for buyer export');
            return;
        }
        
        const exportData = await window.AnalyticsSystem?.generateBuyerExport(factoryId, buyerFormat, dateRange);
        
        if (exportData) {
            // Create downloadable export
            const exportBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const exportUrl = URL.createObjectURL(exportBlob);
            
        const link = document.createElement('a');
            link.href = exportUrl;
            link.download = `${buyerFormat}-export-${factoryId}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
            
            URL.revokeObjectURL(exportUrl);
            console.log(`✅ ${buyerFormat.toUpperCase()} export generated for factory ${factoryId}`);
        }
    } catch (error) {
        console.error('Error generating buyer export:', error);
        alert('Error generating buyer export');
    }
};



