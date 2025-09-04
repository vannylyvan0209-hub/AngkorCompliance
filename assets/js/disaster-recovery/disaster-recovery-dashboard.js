class DisasterRecoveryDashboard {
    constructor() {
        this.currentTests = new Map();
        this.testResults = new Map();
        this.drStatus = {
            rpo: '≤15 min',
            rto: '≤2 hrs',
            backupSuccess: '99.8%',
            testsPassed: '24/24'
        };
        this.initializeDashboard();
        this.bindEvents();
    }

    initializeDashboard() {
        this.populateBackupTests();
        this.populateFailoverTests();
        this.populateRecoveryTests();
        this.populateContinuityTests();
        this.populateDrReports();
        this.populateDrStatusCards();
        this.updateDrMetrics();
    }

    bindEvents() {
        // Backup Tests
        document.getElementById('runBackupTests')?.addEventListener('click', () => this.runBackupTests());
        document.getElementById('exportBackupReport')?.addEventListener('click', () => this.exportBackupReport());

        // Failover Tests
        document.getElementById('runFailoverTests')?.addEventListener('click', () => this.runFailoverTests());

        // Recovery Tests
        document.getElementById('runRecoveryTests')?.addEventListener('click', () => this.runRecoveryTests());

        // Continuity Tests
        document.getElementById('runContinuityTests')?.addEventListener('click', () => this.runContinuityTests());
    }

    populateBackupTests() {
        const backupTests = [
            { id: 'backup-1', name: 'Automated Backup Testing', description: 'Validate automated backup processes and success rates', status: 'passed', priority: 'critical' },
            { id: 'backup-2', name: 'Data Recovery Time Validation', description: 'Test data recovery time within RPO requirements', status: 'passed', priority: 'critical' },
            { id: 'backup-3', name: 'Point-in-Time Recovery Testing', description: 'Validate point-in-time recovery capabilities', status: 'passed', priority: 'high' },
            { id: 'backup-4', name: 'Cross-Region Backup Verification', description: 'Verify cross-region backup replication', status: 'passed', priority: 'high' },
            { id: 'backup-5', name: 'Backup Integrity Validation', description: 'Test backup data integrity and consistency', status: 'passed', priority: 'medium' }
        ];

        const container = document.getElementById('backupTests');
        if (!container) return;

        container.innerHTML = backupTests.map(test => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card dr-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${test.name}</h6>
                            <span class="badge bg-${this.getStatusColor(test.status)}">${test.status}</span>
                        </div>
                        <p class="card-text small text-muted">${test.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-${this.getPriorityColor(test.priority)}">${test.priority}</span>
                            <button class="btn btn-sm btn-outline-primary" onclick="drDashboard.showTestDetails('${test.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateFailoverTests() {
        const failoverTests = [
            { id: 'failover-1', name: 'Database Failover Testing', description: 'Test database failover to secondary instance', status: 'passed', priority: 'critical' },
            { id: 'failover-2', name: 'Application Recovery Scenarios', description: 'Validate application recovery after failure', status: 'passed', priority: 'critical' },
            { id: 'failover-3', name: 'Data Center Failover Simulation', description: 'Simulate complete data center failure', status: 'passed', priority: 'critical' },
            { id: 'failover-4', name: 'Load Balancer Failover', description: 'Test load balancer failover mechanisms', status: 'passed', priority: 'high' },
            { id: 'failover-5', name: 'Network Failover Testing', description: 'Validate network redundancy and failover', status: 'passed', priority: 'medium' }
        ];

        const container = document.getElementById('failoverTests');
        if (!container) return;

        container.innerHTML = failoverTests.map(test => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card dr-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${test.name}</h6>
                            <span class="badge bg-${this.getStatusColor(test.status)}">${test.status}</span>
                        </div>
                        <p class="card-text small text-muted">${test.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-${this.getPriorityColor(test.priority)}">${test.priority}</span>
                            <button class="btn btn-sm btn-outline-primary" onclick="drDashboard.showTestDetails('${test.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateRecoveryTests() {
        const recoveryTests = [
            { id: 'recovery-1', name: 'RPO ≤ 15 minutes Validation', description: 'Validate Recovery Point Objective within 15 minutes', status: 'passed', priority: 'critical' },
            { id: 'recovery-2', name: 'RTO ≤ 2 hours Validation', description: 'Validate Recovery Time Objective within 2 hours', status: 'passed', priority: 'critical' },
            { id: 'recovery-3', name: 'Offline Capability Testing', description: 'Test platform functionality in offline mode', status: 'passed', priority: 'high' },
            { id: 'recovery-4', name: 'Graceful Degradation Validation', description: 'Validate graceful degradation during failures', status: 'passed', priority: 'high' },
            { id: 'recovery-5', name: 'Communication Plan Testing', description: 'Test communication protocols during DR events', status: 'passed', priority: 'medium' }
        ];

        const container = document.getElementById('recoveryTests');
        if (!container) return;

        container.innerHTML = recoveryTests.map(test => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card dr-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${test.name}</h6>
                            <span class="badge bg-${this.getStatusColor(test.status)}">${test.status}</span>
                        </div>
                        <p class="card-text small text-muted">${test.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-${this.getPriorityColor(test.priority)}">${test.priority}</span>
                            <button class="btn btn-sm btn-outline-primary" onclick="drDashboard.showTestDetails('${test.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateContinuityTests() {
        const continuityTests = [
            { id: 'continuity-1', name: 'Business Process Continuity', description: 'Validate critical business processes during DR', status: 'passed', priority: 'critical' },
            { id: 'continuity-2', name: 'Data Access Continuity', description: 'Test data access during recovery scenarios', status: 'passed', priority: 'critical' },
            { id: 'continuity-3', name: 'User Experience Continuity', description: 'Validate user experience during DR events', status: 'passed', priority: 'high' },
            { id: 'continuity-4', name: 'Integration Continuity', description: 'Test third-party integrations during DR', status: 'passed', priority: 'medium' },
            { id: 'continuity-5', name: 'Monitoring Continuity', description: 'Validate monitoring and alerting during DR', status: 'passed', priority: 'medium' }
        ];

        const container = document.getElementById('continuityTests');
        if (!container) return;

        container.innerHTML = continuityTests.map(test => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card dr-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${test.name}</h6>
                            <span class="badge bg-${this.getStatusColor(test.status)}">${test.status}</span>
                        </div>
                        <p class="card-text small text-muted">${test.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-${this.getPriorityColor(test.priority)}">${test.priority}</span>
                            <button class="btn btn-sm btn-outline-primary" onclick="drDashboard.showTestDetails('${test.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateDrReports() {
        const reports = [
            { date: '2024-01-15', type: 'Backup Strategy', status: 'Completed', rpo: '≤15 min', rto: '≤2 hrs' },
            { date: '2024-01-14', type: 'Failover Testing', status: 'Completed', rpo: '≤15 min', rto: '≤2 hrs' },
            { date: '2024-01-13', type: 'Recovery Scenarios', status: 'Completed', rpo: '≤15 min', rto: '≤2 hrs' },
            { date: '2024-01-12', type: 'Business Continuity', status: 'Completed', rpo: '≤15 min', rto: '≤2 hrs' },
            { date: '2024-01-11', type: 'Full DR Drill', status: 'Completed', rpo: '≤15 min', rto: '≤2 hrs' }
        ];

        const container = document.getElementById('drReportsBody');
        if (!container) return;

        container.innerHTML = reports.map(report => `
            <tr>
                <td>${report.date}</td>
                <td>${report.type}</td>
                <td><span class="badge bg-success">${report.status}</span></td>
                <td>${report.rpo}</td>
                <td>${report.rto}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="drDashboard.viewReport('${report.type}')">
                        <i class="fas fa-eye me-1"></i>View
                    </button>
                </td>
            </tr>
        `).join('');
    }

    populateDrStatusCards() {
        const statusItems = [
            { id: 'status-1', title: 'Backup Infrastructure', status: 'operational', description: 'Automated backup systems running normally', lastCheck: '2 hours ago' },
            { id: 'status-2', title: 'Failover Systems', status: 'operational', description: 'All failover mechanisms ready and tested', lastCheck: '4 hours ago' },
            { id: 'status-3', title: 'Recovery Procedures', status: 'operational', description: 'Recovery procedures validated and documented', lastCheck: '1 day ago' },
            { id: 'status-4', title: 'Business Continuity', status: 'operational', description: 'Business continuity plans tested and ready', lastCheck: '1 day ago' }
        ];

        const container = document.getElementById('drStatusCards');
        if (!container) return;

        container.innerHTML = statusItems.map(item => `
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card dr-card h-100 dr-status ${item.status}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${item.title}</h6>
                            <span class="badge bg-${this.getStatusColor(item.status)}">${item.status}</span>
                        </div>
                        <p class="card-text small text-muted">${item.description}</p>
                        <small class="text-muted">Last Check: ${item.lastCheck}</small>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-info" onclick="drDashboard.showDrStatusDetails('${item.id}')">
                                <i class="fas fa-info-circle me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateDrMetrics() {
        document.getElementById('rpoStatus')?.textContent = this.drStatus.rpo;
        document.getElementById('rtoStatus')?.textContent = this.drStatus.rto;
        document.getElementById('backupSuccess')?.textContent = this.drStatus.backupSuccess;
        document.getElementById('drTestsPassed')?.textContent = this.drStatus.testsPassed;
    }

    getStatusColor(status) {
        switch (status) {
            case 'passed':
            case 'operational': return 'success';
            case 'failed': return 'danger';
            case 'running': return 'warning';
            case 'pending': return 'secondary';
            default: return 'secondary';
        }
    }

    getPriorityColor(priority) {
        switch (priority) {
            case 'critical': return 'danger';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'success';
            default: return 'secondary';
        }
    }

    async runBackupTests() {
        const button = document.getElementById('runBackupTests');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Running Tests...';
        }

        try {
            await this.simulateTestExecution('backup', 4000);
            this.showNotification('Backup tests completed successfully!', 'success');
        } catch (error) {
            this.showNotification('Error running backup tests', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play me-2"></i>Run Backup Tests';
            }
        }
    }

    async runFailoverTests() {
        const button = document.getElementById('runFailoverTests');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Running Tests...';
        }

        try {
            await this.simulateTestExecution('failover', 5000);
            this.showNotification('Failover tests completed successfully!', 'success');
        } catch (error) {
            this.showNotification('Error running failover tests', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play me-2"></i>Run Failover Tests';
            }
        }
    }

    async runRecoveryTests() {
        const button = document.getElementById('runRecoveryTests');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Running Tests...';
        }

        try {
            await this.simulateTestExecution('recovery', 4500);
            this.showNotification('Recovery tests completed successfully!', 'success');
        } catch (error) {
            this.showNotification('Error running recovery tests', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play me-2"></i>Run Recovery Tests';
            }
        }
    }

    async runContinuityTests() {
        const button = document.getElementById('runContinuityTests');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Running Tests...';
        }

        try {
            await this.simulateTestExecution('continuity', 3500);
            this.showNotification('Business continuity tests completed successfully!', 'success');
        } catch (error) {
            this.showNotification('Error running continuity tests', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play me-2"></i>Run Continuity Tests';
            }
        }
    }

    async simulateTestExecution(testType, duration) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.currentTests.set(testType, 'completed');
                this.testResults.set(testType, { status: 'passed', timestamp: new Date() });
                resolve();
            }, duration);
        });
    }

    showTestDetails(testId) {
        const testDetails = {
            'backup-1': {
                title: 'Automated Backup Testing Details',
                description: 'Comprehensive testing of automated backup processes including database backups, file system backups, and configuration backups.',
                results: 'All automated backup tests passed. Backup success rate maintained at 99.8%.',
                recommendations: 'Continue monitoring backup performance and implement additional backup verification steps.'
            }
        };

        const details = testDetails[testId] || {
            title: 'DR Test Details',
            description: 'Detailed information about this disaster recovery test.',
            results: 'Test results and findings.',
            recommendations: 'DR recommendations and best practices.'
        };

        const modal = document.getElementById('testDetailsModal');
        const content = document.getElementById('testDetailsContent');
        
        if (content) {
            content.innerHTML = `
                <h6>${details.title}</h6>
                <p class="text-muted">${details.description}</p>
                <hr>
                <h6>Test Results</h6>
                <p>${details.results}</p>
                <hr>
                <h6>Recommendations</h6>
                <p>${details.recommendations}</p>
            `;
        }

        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    showDrStatusDetails(statusId) {
        const statusDetails = {
            'status-1': {
                title: 'Backup Infrastructure Status',
                description: 'Current status of automated backup systems and infrastructure components.',
                details: 'All backup systems operational. Automated backups running on schedule. Cross-region replication active.',
                health: 'Excellent - All systems green'
            }
        };

        const details = statusDetails[statusId] || {
            title: 'DR Status Details',
            description: 'Detailed information about this disaster recovery component.',
            details: 'Component status and health information.',
            health: 'Overall health assessment.'
        };

        const modal = document.getElementById('drStatusModal');
        const content = document.getElementById('drStatusContent');
        
        if (content) {
            content.innerHTML = `
                <h6>${details.title}</h6>
                <p class="text-muted">${details.description}</p>
                <hr>
                <h6>Current Status</h6>
                <p>${details.details}</p>
                <hr>
                <h6>Health Assessment</h6>
                <p>${details.health}</p>
            `;
        }

        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    exportBackupReport() {
        const report = {
            title: 'Disaster Recovery Backup Strategy Report',
            date: new Date().toISOString(),
            tests: [
                { name: 'Automated Backup Testing', status: 'PASSED', priority: 'CRITICAL' },
                { name: 'Data Recovery Time Validation', status: 'PASSED', priority: 'CRITICAL' },
                { name: 'Point-in-Time Recovery Testing', status: 'PASSED', priority: 'HIGH' },
                { name: 'Cross-Region Backup Verification', status: 'PASSED', priority: 'HIGH' },
                { name: 'Backup Integrity Validation', status: 'PASSED', priority: 'MEDIUM' }
            ],
            summary: 'All backup strategy tests passed successfully. Platform demonstrates strong disaster recovery capabilities.',
            rpo: '≤15 minutes',
            rto: '≤2 hours'
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dr-backup-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('DR backup report exported successfully!', 'success');
    }

    viewReport(reportType) {
        this.showNotification(`Viewing ${reportType} report...`, 'info');
    }

    showNotification(message, type = 'info') {
        const alertClass = type === 'error' ? 'danger' : type;
        const alertHtml = `
            <div class="alert alert-${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        const container = document.querySelector('.container-fluid');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
            
            setTimeout(() => {
                const alert = container.querySelector('.alert');
                if (alert) {
                    alert.remove();
                }
            }, 5000);
        }
    }
}

// Initialize the disaster recovery dashboard
const drDashboard = new DisasterRecoveryDashboard();
