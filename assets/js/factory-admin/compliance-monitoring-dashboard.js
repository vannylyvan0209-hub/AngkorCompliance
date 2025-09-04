import { initializeFirebase } from '../../firebase-config.js';

class ComplianceMonitoringDashboard {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.currentFactory = null;
        this.violations = [];
        this.caps = [];
        this.standards = [];
        this.recentActivities = [];
        this.deadlines = [];
        this.complianceChart = null;
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            await this.loadAllData();
            this.initializeComplianceChart();
            this.updateOverviewCards();
        } catch (error) {
            console.error('Error initializing Compliance Monitoring Dashboard:', error);
            this.showError('Failed to initialize compliance monitoring dashboard');
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    try {
                        // Get user's role and factory information
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.role === 'factory_admin' || userData.role === 'super_admin') {
                                this.currentFactory = userData.factoryId;
                                resolve();
                            } else {
                                reject(new Error('Access denied. Factory admin role required.'));
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
        // Compliance filter
        document.getElementById('complianceFilter').addEventListener('change', (e) => {
            this.filterComplianceData(e.target.value);
        });

        // CAP filter
        document.getElementById('capFilter').addEventListener('change', (e) => {
            this.filterCAPs(e.target.value);
        });
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadViolations(),
                this.loadCAPs(),
                this.loadStandards(),
                this.loadRecentActivities(),
                this.loadDeadlines()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadViolations() {
        try {
            const violationsSnapshot = await this.db
                .collection('violations')
                .where('factoryId', '==', this.currentFactory)
                .where('status', 'in', ['open', 'in_progress'])
                .orderBy('createdAt', 'desc')
                .get();

            this.violations = [];
            violationsSnapshot.forEach(doc => {
                const violationData = doc.data();
                this.violations.push({
                    id: doc.id,
                    ...violationData
                });
            });

            this.updateViolationsTable();
        } catch (error) {
            console.error('Error loading violations:', error);
        }
    }

    async loadCAPs() {
        try {
            const capsSnapshot = await this.db
                .collection('corrective_action_plans')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('createdAt', 'desc')
                .get();

            this.caps = [];
            capsSnapshot.forEach(doc => {
                const capData = doc.data();
                this.caps.push({
                    id: doc.id,
                    ...capData
                });
            });

            this.updateCAPsGrid();
        } catch (error) {
            console.error('Error loading CAPs:', error);
        }
    }

    async loadStandards() {
        try {
            const standardsSnapshot = await this.db
                .collection('compliance_standards')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('name')
                .get();

            this.standards = [];
            standardsSnapshot.forEach(doc => {
                const standardData = doc.data();
                this.standards.push({
                    id: doc.id,
                    ...standardData
                });
            });

            this.updateStandardsList();
        } catch (error) {
            console.error('Error loading standards:', error);
        }
    }

    async loadRecentActivities() {
        try {
            const activitiesSnapshot = await this.db
                .collection('compliance_activities')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();

            this.recentActivities = [];
            activitiesSnapshot.forEach(doc => {
                const activityData = doc.data();
                this.recentActivities.push({
                    id: doc.id,
                    ...activityData
                });
            });

            this.updateRecentActivities();
        } catch (error) {
            console.error('Error loading recent activities:', error);
        }
    }

    async loadDeadlines() {
        try {
            const deadlinesSnapshot = await this.db
                .collection('compliance_deadlines')
                .where('factoryId', '==', this.currentFactory)
                .where('dueDate', '>=', new Date())
                .orderBy('dueDate', 'asc')
                .limit(10)
                .get();

            this.deadlines = [];
            deadlinesSnapshot.forEach(doc => {
                const deadlineData = doc.data();
                this.deadlines.push({
                    id: doc.id,
                    ...deadlineData
                });
            });

            this.updateDeadlinesList();
        } catch (error) {
            console.error('Error loading deadlines:', error);
        }
    }

    initializeComplianceChart() {
        const ctx = document.getElementById('complianceChart').getContext('2d');
        
        this.complianceChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Compliant', 'Minor Issues', 'Major Issues', 'Critical Issues'],
                datasets: [{
                    data: [65, 20, 10, 5],
                    backgroundColor: [
                        '#10b981', // Green
                        '#f59e0b', // Yellow
                        '#f97316', // Orange
                        '#ef4444'  // Red
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
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    updateViolationsTable() {
        const tableBody = document.getElementById('violationsTable');
        
        if (this.violations.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i data-lucide="check-circle"></i>
                        <p>No active violations found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.violations.map(violation => `
            <tr class="violation-row ${violation.severity === 'critical' ? 'critical' : ''}">
                <td>
                    <div class="violation-info">
                        <div class="violation-title">${violation.title}</div>
                        <div class="violation-description">${violation.description}</div>
                    </div>
                </td>
                <td>
                    <span class="standard-badge standard-${violation.standard}">
                        ${this.getStandardDisplayName(violation.standard)}
                    </span>
                </td>
                <td>
                    <span class="severity-badge severity-${violation.severity}">
                        ${violation.severity}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${violation.status}">
                        ${violation.status}
                    </span>
                </td>
                <td>${this.formatDate(violation.dueDate)}</td>
                <td>${violation.assignedTo || 'Unassigned'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewViolationDetails('${violation.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="createCAPFromViolation('${violation.id}')">
                            <i data-lucide="clipboard-list"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="markViolationResolved('${violation.id}')">
                            <i data-lucide="check"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateCAPsGrid() {
        const container = document.getElementById('capsGrid');
        
        if (this.caps.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="clipboard-list"></i>
                    <p>No corrective action plans found</p>
                    <button class="btn btn-primary" onclick="createCAP()">
                        <i data-lucide="plus"></i> Create First CAP
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.caps.map(cap => `
            <div class="cap-item cap-${cap.status}">
                <div class="cap-header">
                    <h4>${cap.title}</h4>
                    <div class="cap-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewCAPDetails('${cap.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editCAP('${cap.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                    </div>
                </div>
                <div class="cap-description">${cap.description}</div>
                <div class="cap-meta">
                    <div class="cap-standard">
                        <strong>Standard:</strong> ${this.getStandardDisplayName(cap.standard)}
                    </div>
                    <div class="cap-severity">
                        <strong>Severity:</strong> 
                        <span class="severity-badge severity-${cap.severity}">${cap.severity}</span>
                    </div>
                    <div class="cap-status">
                        <strong>Status:</strong> 
                        <span class="status-badge status-${cap.status}">${cap.status}</span>
                    </div>
                    <div class="cap-due-date">
                        <strong>Due:</strong> ${this.formatDate(cap.dueDate)}
                    </div>
                </div>
                <div class="cap-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${cap.progress || 0}%"></div>
                    </div>
                    <span class="progress-text">${cap.progress || 0}% Complete</span>
                </div>
            </div>
        `).join('');
    }

    updateStandardsList() {
        const container = document.getElementById('standardsList');
        
        if (this.standards.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="shield"></i>
                    <p>No compliance standards found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.standards.map(standard => `
            <div class="standard-item">
                <div class="standard-header">
                    <h4>${standard.name}</h4>
                    <span class="compliance-score">${standard.complianceScore || 0}%</span>
                </div>
                <div class="standard-description">${standard.description || 'No description'}</div>
                <div class="standard-meta">
                    <div class="standard-status">
                        <span class="status-indicator status-${standard.status}"></span>
                        ${standard.status}
                    </div>
                    <div class="standard-version">v${standard.version || '1.0'}</div>
                </div>
            </div>
        `).join('');
    }

    updateRecentActivities() {
        const container = document.getElementById('recentActivities');
        
        if (this.recentActivities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="activity"></i>
                    <p>No recent activities</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i data-lucide="${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${this.formatTimeAgo(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    updateDeadlinesList() {
        const container = document.getElementById('deadlinesList');
        
        if (this.deadlines.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="clock"></i>
                    <p>No upcoming deadlines</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.deadlines.map(deadline => `
            <div class="deadline-item ${this.isDeadlineUrgent(deadline.dueDate) ? 'urgent' : ''}">
                <div class="deadline-header">
                    <h4>${deadline.title}</h4>
                    <span class="deadline-days">${this.getDaysUntilDeadline(deadline.dueDate)} days</span>
                </div>
                <div class="deadline-description">${deadline.description}</div>
                <div class="deadline-meta">
                    <div class="deadline-type">${deadline.type}</div>
                    <div class="deadline-date">${this.formatDate(deadline.dueDate)}</div>
                </div>
            </div>
        `).join('');
    }

    filterComplianceData(standard) {
        // Update chart based on selected standard
        if (standard === 'all') {
            this.updateComplianceChart([65, 20, 10, 5]);
        } else {
            // Filter data based on standard
            const filteredData = this.getComplianceDataForStandard(standard);
            this.updateComplianceChart(filteredData);
        }
    }

    filterCAPs(status) {
        let filteredCAPs = this.caps;

        if (status !== 'all') {
            filteredCAPs = this.caps.filter(cap => cap.status === status);
        }

        this.updateCAPsGridWithData(filteredCAPs);
    }

    updateComplianceChart(data) {
        this.complianceChart.data.datasets[0].data = data;
        this.complianceChart.update();
    }

    updateCAPsGridWithData(caps) {
        const container = document.getElementById('capsGrid');
        
        if (caps.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="search"></i>
                    <p>No CAPs found matching your criteria</p>
                </div>
            `;
            return;
        }

        container.innerHTML = caps.map(cap => `
            <div class="cap-item cap-${cap.status}">
                <div class="cap-header">
                    <h4>${cap.title}</h4>
                    <div class="cap-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewCAPDetails('${cap.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editCAP('${cap.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                    </div>
                </div>
                <div class="cap-description">${cap.description}</div>
                <div class="cap-meta">
                    <div class="cap-standard">
                        <strong>Standard:</strong> ${this.getStandardDisplayName(cap.standard)}
                    </div>
                    <div class="cap-severity">
                        <strong>Severity:</strong> 
                        <span class="severity-badge severity-${cap.severity}">${cap.severity}</span>
                    </div>
                    <div class="cap-status">
                        <strong>Status:</strong> 
                        <span class="status-badge status-${cap.status}">${cap.status}</span>
                    </div>
                    <div class="cap-due-date">
                        <strong>Due:</strong> ${this.formatDate(cap.dueDate)}
                    </div>
                </div>
                <div class="cap-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${cap.progress || 0}%"></div>
                    </div>
                    <span class="progress-text">${cap.progress || 0}% Complete</span>
                </div>
            </div>
        `).join('');
    }

    updateOverviewCards() {
        const overallCompliance = this.calculateOverallCompliance();
        const activeViolations = this.violations.length;
        const openCAPs = this.caps.filter(cap => cap.status === 'open').length;
        const nextAudit = this.getNextAuditDate();

        // Update card values
        document.querySelector('.overview-card:nth-child(1) .card-value').textContent = `${overallCompliance}%`;
        document.querySelector('.overview-card:nth-child(2) .card-value').textContent = activeViolations;
        document.querySelector('.overview-card:nth-child(3) .card-value').textContent = openCAPs;
        document.querySelector('.overview-card:nth-child(4) .card-value').textContent = nextAudit;
    }

    calculateOverallCompliance() {
        // Calculate overall compliance based on standards and violations
        let totalScore = 0;
        let totalStandards = this.standards.length;

        if (totalStandards === 0) return 0;

        this.standards.forEach(standard => {
            totalScore += standard.complianceScore || 0;
        });

        // Deduct points for violations
        const violationPenalty = this.violations.length * 2;
        const finalScore = Math.max(0, (totalScore / totalStandards) - violationPenalty);

        return Math.round(finalScore);
    }

    getNextAuditDate() {
        // Find the next audit deadline
        const auditDeadlines = this.deadlines.filter(deadline => 
            deadline.type === 'audit' && new Date(deadline.dueDate) > new Date()
        );

        if (auditDeadlines.length === 0) return 'No audits scheduled';

        const nextAudit = auditDeadlines[0];
        const daysUntil = this.getDaysUntilDeadline(nextAudit.dueDate);
        return `${daysUntil} days`;
    }

    // Helper methods
    getStandardDisplayName(standard) {
        const standardNames = {
            'iso9001': 'ISO 9001',
            'iso14001': 'ISO 14001',
            'ohsas18001': 'OHSAS 18001',
            'custom': 'Custom Standard'
        };
        return standardNames[standard] || standard;
    }

    getActivityIcon(type) {
        const icons = {
            'violation_created': 'alert-triangle',
            'cap_created': 'clipboard-list',
            'cap_completed': 'check-circle',
            'audit_scheduled': 'calendar',
            'standard_updated': 'edit',
            'compliance_check': 'shield-check'
        };
        return icons[type] || 'activity';
    }

    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Never';
        
        const now = new Date();
        const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minutes ago`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)} hours ago`;
        } else {
            return `${Math.floor(diffInMinutes / 1440)} days ago`;
        }
    }

    getDaysUntilDeadline(dueDate) {
        const now = new Date();
        const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    isDeadlineUrgent(dueDate) {
        return this.getDaysUntilDeadline(dueDate) <= 7;
    }

    getComplianceDataForStandard(standard) {
        // Mock data - in real implementation, this would calculate based on actual data
        const mockData = {
            'iso9001': [70, 20, 8, 2],
            'iso14001': [60, 25, 12, 3],
            'ohsas18001': [80, 15, 4, 1],
            'custom': [50, 30, 15, 5]
        };
        return mockData[standard] || [65, 20, 10, 5];
    }

    showLoading(message) {
        // Implement loading indicator
        console.log('Loading:', message);
    }

    hideLoading() {
        // Hide loading indicator
        console.log('Loading complete');
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
let complianceMonitoringDashboard;

function createCAP() {
    document.getElementById('createCAPModal').style.display = 'flex';
}

function exportComplianceReport() {
    alert('Export Compliance Report feature coming soon');
}

function bulkUpdateViolations() {
    alert('Bulk Update Violations feature coming soon');
}

function scheduleAudit() {
    alert('Schedule Audit feature coming soon');
}

function generateReport() {
    alert('Generate Report feature coming soon');
}

function reviewViolations() {
    alert('Review Violations feature coming soon');
}

function updateStandards() {
    alert('Update Standards feature coming soon');
}

function complianceTraining() {
    alert('Compliance Training feature coming soon');
}

function riskAssessment() {
    alert('Risk Assessment feature coming soon');
}

function viewViolationDetails(violationId) {
    document.getElementById('violationDetailsModal').style.display = 'flex';
    // Load violation details
    alert('View Violation Details feature coming soon');
}

function createCAPFromViolation(violationId) {
    document.getElementById('createCAPModal').style.display = 'flex';
    // Pre-populate form with violation data
    alert('Create CAP from Violation feature coming soon');
}

function markViolationResolved(violationId) {
    if (confirm('Are you sure you want to mark this violation as resolved?')) {
        alert('Mark Violation Resolved feature coming soon');
    }
}

function viewCAPDetails(capId) {
    document.getElementById('capDetailsModal').style.display = 'flex';
    // Load CAP details
    alert('View CAP Details feature coming soon');
}

function editCAP(capId) {
    alert('Edit CAP feature coming soon');
}

function saveCAP() {
    alert('Save CAP feature coming soon');
}

function updateCAP() {
    alert('Update CAP feature coming soon');
}

function completeCAP() {
    if (confirm('Are you sure you want to mark this CAP as complete?')) {
        alert('Complete CAP feature coming soon');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    complianceMonitoringDashboard = new ComplianceMonitoringDashboard();
    window.complianceMonitoringDashboard = complianceMonitoringDashboard;
    complianceMonitoringDashboard.init();
});
