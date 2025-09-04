// SLA Management System for Grievance Committee
// Handles Service Level Agreement monitoring, configuration, and reporting

class SLAManagement {
    constructor() {
        this.slaConfig = {};
        this.cases = [];
        this.alerts = [];
        this.currentUser = null;
        this.isInitialized = false;
        this.chart = null;
        this.currentPeriod = 'quarter';
        this.unsubscribe = null;
        this.init();
    }

    async init() {
        try {
            console.log('🔧 Initializing SLA Management System...');
            
            // Wait for Firebase to be available
            if (!window.Firebase) {
                console.log('⏳ Waiting for Firebase to initialize...');
                setTimeout(() => this.init(), 100);
                return;
            }

            await this.checkAuthentication();
            await this.loadSLAConfig();
            await this.loadCases();
            await this.loadAlerts();
            this.setupChart();
            this.updateDashboard();
            this.setupEventListeners();
            this.isInitialized = true;
            
            console.log('✅ SLA Management System initialized');
        } catch (error) {
            console.error('❌ Error initializing SLA Management:', error);
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

    async loadSLAConfig() {
        try {
            console.log('⚙️ Loading SLA configuration...');
            
            const { db } = window.Firebase;
            const { doc, getDoc } = window.Firebase;
            
            // Load SLA configuration from Firestore
            const configDocRef = doc(db, 'sla_config', 'default');
            const configDoc = await getDoc(configDocRef);
            
            if (configDoc.exists()) {
                this.slaConfig = configDoc.data();
                console.log('✅ SLA configuration loaded');
            } else {
                // Set default configuration
                this.slaConfig = {
                    initialResponseTime: 24,
                    investigationTime: 7,
                    resolutionTime: 14,
                    escalationThreshold: 48,
                    priorityLevel: 'medium',
                    notificationFrequency: 'daily'
                };
                console.log('⚠️ Using default SLA configuration');
            }
            
            this.updateConfigDisplay();
        } catch (error) {
            console.error('❌ Error loading SLA configuration:', error);
        }
    }

    async loadCases() {
        try {
            console.log('📋 Loading cases for SLA analysis...');
            
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
                
                this.calculateSLAMetrics();
                this.updateDashboard();
            });
            
            console.log('✅ Cases loaded for SLA analysis');
        } catch (error) {
            console.error('❌ Error loading cases:', error);
        }
    }

    async loadAlerts() {
        try {
            console.log('🚨 Loading SLA alerts...');
            
            const { db } = window.Firebase;
            const { collection, query, orderBy, limit, onSnapshot } = window.Firebase;
            
            // Create query for alerts
            const alertsRef = collection(db, 'sla_alerts');
            const alertsQuery = query(alertsRef, orderBy('createdAt', 'desc'), limit(10));
            
            // Set up real-time listener for alerts
            onSnapshot(alertsQuery, (snapshot) => {
                this.alerts = [];
                snapshot.forEach((doc) => {
                    this.alerts.push({ id: doc.id, ...doc.data() });
                });
                
                this.updateAlertsDisplay();
            });
            
            console.log('✅ SLA alerts loaded');
        } catch (error) {
            console.error('❌ Error loading alerts:', error);
        }
    }

    calculateSLAMetrics() {
        try {
            const now = new Date();
            let totalCases = 0;
            let compliantCases = 0;
            let totalResponseTime = 0;
            let totalResolutionTime = 0;
            let violations = 0;
            
            this.cases.forEach(caseData => {
                if (caseData.status !== 'closed') return;
                
                totalCases++;
                
                // Calculate response time
                const responseTime = (caseData.firstResponseAt?.toDate() - caseData.createdAt?.toDate()) / (1000 * 60 * 60 * 24);
                totalResponseTime += responseTime;
                
                // Calculate resolution time
                const resolutionTime = (caseData.resolvedAt?.toDate() - caseData.createdAt?.toDate()) / (1000 * 60 * 60 * 24);
                totalResolutionTime += resolutionTime;
                
                // Check SLA compliance
                const isResponseCompliant = responseTime <= (this.slaConfig.initialResponseTime / 24);
                const isResolutionCompliant = resolutionTime <= this.slaConfig.resolutionTime;
                
                if (isResponseCompliant && isResolutionCompliant) {
                    compliantCases++;
                } else {
                    violations++;
                }
            });
            
            // Update dashboard metrics
            const complianceRate = totalCases > 0 ? Math.round((compliantCases / totalCases) * 100) : 0;
            const avgResponseTime = totalCases > 0 ? (totalResponseTime / totalCases).toFixed(1) : 0;
            const avgResolutionTime = totalCases > 0 ? (totalResolutionTime / totalCases).toFixed(1) : 0;
            
            // Update display
            document.getElementById('overallPercentage').textContent = `${complianceRate}%`;
            document.getElementById('overallStatus').textContent = `${complianceRate}% Compliant`;
            document.getElementById('avgResponseTime').textContent = `${avgResponseTime} days`;
            document.getElementById('avgResolutionTime').textContent = `${avgResolutionTime} days`;
            document.getElementById('violationCount').textContent = violations;
            document.getElementById('violationStatus').textContent = `${violations} Cases`;
            
            // Update status colors
            this.updateStatusColors(complianceRate, avgResponseTime, avgResolutionTime);
            
        } catch (error) {
            console.error('❌ Error calculating SLA metrics:', error);
        }
    }

    updateStatusColors(complianceRate, avgResponseTime, avgResolutionTime) {
        // Overall compliance status
        const overallStatus = document.getElementById('overallStatus');
        const overallPercentage = document.getElementById('overallPercentage');
        
        if (complianceRate >= 90) {
            overallStatus.className = 'sla-status sla-good';
            overallPercentage.style.color = 'var(--success-600)';
        } else if (complianceRate >= 75) {
            overallStatus.className = 'sla-status sla-warning';
            overallPercentage.style.color = 'var(--warning-600)';
        } else {
            overallStatus.className = 'sla-status sla-critical';
            overallPercentage.style.color = 'var(--error-600)';
        }
        
        // Response time status
        const responseStatus = document.getElementById('responseStatus');
        const responseTimeElement = document.getElementById('avgResponseTime');
        const targetResponse = this.slaConfig.initialResponseTime / 24;
        
        if (avgResponseTime <= targetResponse) {
            responseStatus.className = 'sla-status sla-good';
            responseTimeElement.style.color = 'var(--success-600)';
        } else if (avgResponseTime <= targetResponse * 1.2) {
            responseStatus.className = 'sla-status sla-warning';
            responseTimeElement.style.color = 'var(--warning-600)';
        } else {
            responseStatus.className = 'sla-status sla-critical';
            responseTimeElement.style.color = 'var(--error-600)';
        }
        
        // Resolution time status
        const resolutionStatus = document.getElementById('resolutionStatus');
        const resolutionTimeElement = document.getElementById('avgResolutionTime');
        
        if (avgResolutionTime <= this.slaConfig.resolutionTime) {
            resolutionStatus.className = 'sla-status sla-good';
            resolutionTimeElement.style.color = 'var(--success-600)';
        } else if (avgResolutionTime <= this.slaConfig.resolutionTime * 1.1) {
            resolutionStatus.className = 'sla-status sla-warning';
            resolutionTimeElement.style.color = 'var(--warning-600)';
        } else {
            resolutionStatus.className = 'sla-status sla-critical';
            resolutionTimeElement.style.color = 'var(--error-600)';
        }
    }

    setupChart() {
        try {
            const ctx = document.getElementById('slaTrendChart');
            if (!ctx) return;
            
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.getChartLabels(),
                    datasets: [
                        {
                            label: 'Response Time (days)',
                            data: this.getResponseTimeData(),
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Resolution Time (days)',
                            data: this.getResolutionTimeData(),
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
                                text: 'Days'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('❌ Error setting up chart:', error);
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

    getResponseTimeData() {
        // Generate sample data - in real implementation, this would come from actual case data
        const data = [];
        for (let i = 0; i < this.getChartLabels().length; i++) {
            data.push(Math.random() * 3 + 1); // Random values between 1-4 days
        }
        return data;
    }

    getResolutionTimeData() {
        // Generate sample data - in real implementation, this would come from actual case data
        const data = [];
        for (let i = 0; i < this.getChartLabels().length; i++) {
            data.push(Math.random() * 5 + 5); // Random values between 5-10 days
        }
        return data;
    }

    updateConfigDisplay() {
        try {
            document.getElementById('initialResponseTime').value = this.slaConfig.initialResponseTime;
            document.getElementById('investigationTime').value = this.slaConfig.investigationTime;
            document.getElementById('resolutionTime').value = this.slaConfig.resolutionTime;
            document.getElementById('escalationThreshold').value = this.slaConfig.escalationThreshold;
            document.getElementById('priorityLevel').value = this.slaConfig.priorityLevel;
            document.getElementById('notificationFrequency').value = this.slaConfig.notificationFrequency;
        } catch (error) {
            console.error('❌ Error updating config display:', error);
        }
    }

    updateAlertsDisplay() {
        try {
            const alertsList = document.getElementById('alertsList');
            if (!alertsList) return;
            
            alertsList.innerHTML = '';
            
            this.alerts.slice(0, 5).forEach(alert => {
                const alertItem = document.createElement('div');
                alertItem.className = 'alert-item';
                
                const iconClass = this.getAlertIconClass(alert.type);
                const icon = this.getAlertIcon(alert.type);
                
                alertItem.innerHTML = `
                    <div class="alert-icon" style="background: ${iconClass};">
                        <i data-lucide="${icon}"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">${alert.title}</div>
                        <div class="alert-description">${alert.description}</div>
                        <div class="alert-time">${this.formatTime(alert.createdAt)}</div>
                    </div>
                `;
                
                alertsList.appendChild(alertItem);
            });
            
            // Reinitialize Lucide icons
            if (window.lucide) {
                lucide.createIcons();
            }
        } catch (error) {
            console.error('❌ Error updating alerts display:', error);
        }
    }

    getAlertIconClass(type) {
        switch (type) {
            case 'violation': return 'var(--error-500)';
            case 'warning': return 'var(--warning-500)';
            case 'success': return 'var(--success-500)';
            default: return 'var(--info-500)';
        }
    }

    getAlertIcon(type) {
        switch (type) {
            case 'violation': return 'alert-triangle';
            case 'warning': return 'clock';
            case 'success': return 'check-circle';
            default: return 'info';
        }
    }

    formatTime(timestamp) {
        if (!timestamp) return 'Unknown time';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hours ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} days ago`;
    }

    updateDashboard() {
        this.calculateSLAMetrics();
        this.updateAlertsDisplay();
    }

    setupEventListeners() {
        // Add event listeners for configuration changes
        const configInputs = document.querySelectorAll('.config-input, .config-select');
        configInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.slaConfig[input.id] = input.value;
            });
        });
    }
}

// Global functions for button actions
window.openSLAConfig = function() {
    console.log('🔧 Opening SLA configuration...');
    // This could open a modal or navigate to a detailed config page
};

window.saveSLAConfig = async function() {
    try {
        console.log('💾 Saving SLA configuration...');
        
        const { db } = window.Firebase;
        const { doc, setDoc } = window.Firebase;
        
        // Get current configuration values
        const config = {
            initialResponseTime: parseInt(document.getElementById('initialResponseTime').value),
            investigationTime: parseInt(document.getElementById('investigationTime').value),
            resolutionTime: parseInt(document.getElementById('resolutionTime').value),
            escalationThreshold: parseInt(document.getElementById('escalationThreshold').value),
            priorityLevel: document.getElementById('priorityLevel').value,
            notificationFrequency: document.getElementById('notificationFrequency').value,
            updatedAt: new Date(),
            updatedBy: window.slaManagement?.currentUser?.id
        };
        
        // Save to Firestore
        await setDoc(doc(db, 'sla_config', 'default'), config);
        
        // Update local config
        if (window.slaManagement) {
            window.slaManagement.slaConfig = config;
        }
        
        console.log('✅ SLA configuration saved successfully');
        alert('SLA configuration saved successfully!');
    } catch (error) {
        console.error('❌ Error saving SLA configuration:', error);
        alert('Error saving SLA configuration. Please try again.');
    }
};

window.updateChartPeriod = function(period) {
    if (window.slaManagement) {
        window.slaManagement.currentPeriod = period;
        window.slaManagement.setupChart();
    }
};

window.loadAllAlerts = function() {
    console.log('📋 Loading all alerts...');
    // This could navigate to a detailed alerts page or open a modal
};

window.generateSLAReport = async function() {
    try {
        console.log('📊 Generating SLA report...');
        
        const dateRange = document.getElementById('dateRange').value;
        const caseType = document.getElementById('caseType').value;
        const priority = document.getElementById('priority').value;
        const investigator = document.getElementById('investigator').value;
        
        // Generate report based on filters
        const reportData = {
            dateRange,
            caseType,
            priority,
            investigator,
            generatedAt: new Date(),
            generatedBy: window.slaManagement?.currentUser?.id
        };
        
        console.log('📋 Report data:', reportData);
        
        // In a real implementation, this would generate and display a detailed report
        document.getElementById('reportResults').innerHTML = `
            <div style="padding: var(--space-4); background: var(--neutral-50); border-radius: var(--radius-lg); margin-top: var(--space-4);">
                <h4 style="margin-bottom: var(--space-2);">SLA Report Generated</h4>
                <p style="color: var(--neutral-600);">Report generated for ${dateRange} with filters applied.</p>
                <p style="color: var(--neutral-600);">Case Type: ${caseType}, Priority: ${priority}, Investigator: ${investigator}</p>
            </div>
        `;
        
    } catch (error) {
        console.error('❌ Error generating SLA report:', error);
        alert('Error generating report. Please try again.');
    }
};

window.exportSLAReport = function() {
    console.log('📥 Exporting SLA report...');
    // This would export the current report data to CSV/PDF
    alert('SLA report export functionality will be implemented in the next phase.');
};

// Initialize the SLA Management system
let slaManagement;
document.addEventListener('DOMContentLoaded', () => {
    slaManagement = new SLAManagement();
    window.slaManagement = slaManagement;
});
