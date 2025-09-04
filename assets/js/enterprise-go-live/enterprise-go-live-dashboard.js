class EnterpriseGoLiveDashboard {
    constructor() {
        this.deploymentStatus = 'ready';
        this.deploymentPhase = 'pre-deployment';
        this.monitoringInterval = null;
        this.countdownInterval = null;
        this.initializeDashboard();
        this.bindEvents();
        this.startCountdown();
        this.startLiveMonitoring();
    }

    initializeDashboard() {
        this.populateDeploymentStatus();
        this.populateMonitoringMetrics();
        this.populateRollbackProcedures();
        this.populateCommunicationCenter();
        this.populatePostLiveAnalysis();
        this.populateEnterpriseStatusCards();
        this.updateMetrics();
    }

    bindEvents() {
        // Go-Live Initiation
        document.getElementById('initiateGoLive')?.addEventListener('click', () => this.showGoLiveConfirmation());
        document.getElementById('confirmGoLive')?.addEventListener('click', () => this.confirmGoLive());

        // Deployment Controls
        document.getElementById('startDeployment')?.addEventListener('click', () => this.startDeployment());
        document.getElementById('pauseDeployment')?.addEventListener('click', () => this.pauseDeployment());
        document.getElementById('stopDeployment')?.addEventListener('click', () => this.stopDeployment());

        // Monitoring Controls
        document.getElementById('refreshMetrics')?.addEventListener('click', () => this.refreshMetrics());
        document.getElementById('exportMetrics')?.addEventListener('click', () => this.exportMetrics());

        // Rollback Controls
        document.getElementById('initiateRollback')?.addEventListener('click', () => this.showRollbackConfirmation());
        document.getElementById('confirmRollback')?.addEventListener('click', () => this.confirmRollback());
        document.getElementById('testRollback')?.addEventListener('click', () => this.testRollback());

        // Communication Controls
        document.getElementById('sendUpdate')?.addEventListener('click', () => this.sendStatusUpdate());
        document.getElementById('scheduleUpdate')?.addEventListener('click', () => this.scheduleUpdate());

        // Post-Live Controls
        document.getElementById('generateReport')?.addEventListener('click', () => this.generatePostLiveReport());
        document.getElementById('scheduleReview')?.addEventListener('click', () => this.scheduleReviewMeeting());
    }

    populateDeploymentStatus() {
        const deploymentData = [
            { id: 'dep-1', phase: 'Infrastructure', status: 'completed', description: 'Production servers, databases, and networking configured', progress: 100, owner: 'DevOps Team' },
            { id: 'dep-2', phase: 'Application', status: 'ready', description: 'Angkor Compliance platform ready for deployment', progress: 100, owner: 'Development Team' },
            { id: 'dep-3', phase: 'Security', status: 'completed', description: 'SSL certificates, firewalls, and security controls active', progress: 100, owner: 'Security Team' },
            { id: 'dep-4', phase: 'Monitoring', status: 'completed', description: 'Production monitoring, alerting, and logging active', progress: 100, owner: 'Monitoring Team' },
            { id: 'dep-5', phase: 'Database', status: 'ready', description: 'Production database configured and optimized', progress: 100, owner: 'Database Team' },
            { id: 'dep-6', phase: 'Load Balancer', status: 'ready', description: 'Load balancer configured for high availability', progress: 100, owner: 'Infrastructure Team' }
        ];

        const container = document.getElementById('deploymentStatus');
        if (!container) return;

        container.innerHTML = deploymentData.map(item => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card enterprise-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${item.phase}</h6>
                            <span class="badge bg-${this.getStatusColor(item.status)}">${item.status}</span>
                        </div>
                        <p class="card-text small text-muted">${item.description}</p>
                        <div class="mb-2">
                            <span class="deployment-phase">${item.phase}</span>
                        </div>
                        <div class="progress mb-2" style="height: 8px;">
                            <div class="progress-bar bg-${this.getStatusColor(item.status)}" role="progressbar" style="width: ${item.progress}%"></div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Owner: ${item.owner}</small>
                            <small class="text-muted">${item.progress}%</small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateMonitoringMetrics() {
        const monitoringData = [
            { metric: 'System Health', value: 'Excellent', status: 'green', trend: '+2.5%', description: 'All systems operational' },
            { metric: 'Response Time', value: '245ms', status: 'green', trend: '-12%', description: 'P95 response time' },
            { metric: 'Error Rate', value: '0.02%', status: 'green', trend: '-5%', description: 'Error rate below threshold' },
            { metric: 'CPU Usage', value: '23%', status: 'green', trend: '+1%', description: 'Optimal resource utilization' },
            { metric: 'Memory Usage', value: '67%', status: 'yellow', trend: '+8%', description: 'Within acceptable limits' },
            { metric: 'Active Users', value: '1,247', status: 'green', trend: '+15%', description: 'Current active sessions' }
        ];

        const container = document.getElementById('monitoringMetrics');
        if (!container) return;

        container.innerHTML = monitoringData.map(item => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card enterprise-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${item.metric}</h6>
                            <span class="status-indicator ${item.status}"></span>
                        </div>
                        <h4 class="mb-2">${item.value}</h4>
                        <p class="card-text small text-muted">${item.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-${item.status === 'green' ? 'success' : item.status === 'yellow' ? 'warning' : 'danger'}">
                                ${item.trend}
                            </small>
                            <small class="text-muted">Live</small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateRollbackProcedures() {
        const rollbackData = [
            { id: 'rb-1', procedure: 'Database Rollback', description: 'Restore database to previous stable state', time: '5-8 minutes', impact: 'Medium', status: 'ready' },
            { id: 'rb-2', procedure: 'Application Rollback', description: 'Deploy previous stable application version', time: '3-5 minutes', impact: 'Low', status: 'ready' },
            { id: 'rb-3', procedure: 'Infrastructure Rollback', description: 'Revert infrastructure changes if needed', time: '10-15 minutes', impact: 'High', status: 'ready' },
            { id: 'rb-4', procedure: 'Configuration Rollback', description: 'Restore previous configuration settings', time: '2-3 minutes', impact: 'Low', status: 'ready' }
        ];

        const container = document.getElementById('rollbackProcedures');
        if (!container) return;

        container.innerHTML = rollbackData.map(item => `
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card enterprise-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${item.procedure}</h6>
                            <span class="badge bg-${this.getStatusColor(item.status)}">${item.status}</span>
                        </div>
                        <p class="card-text small text-muted">${item.description}</p>
                        <div class="mb-2">
                            <small class="text-muted"><strong>Time:</strong> ${item.time}</small>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted"><strong>Impact:</strong> ${item.impact}</small>
                        </div>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-info" onclick="enterpriseDashboard.testRollbackProcedure('${item.id}')">
                                <i class="fas fa-vial me-1"></i>Test
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateCommunicationCenter() {
        const communicationData = [
            { id: 'comm-1', type: 'Stakeholder Update', status: 'scheduled', description: 'Weekly status update to executive team', nextUpdate: '2024-01-20 10:00 AM', audience: 'Executive Team' },
            { id: 'comm-2', type: 'Technical Update', status: 'sent', description: 'Daily technical status to operations team', nextUpdate: '2024-01-19 9:00 AM', audience: 'Operations Team' },
            { id: 'comm-3', type: 'User Notification', status: 'draft', description: 'Platform availability notification to users', nextUpdate: '2024-01-18 2:00 PM', audience: 'All Users' },
            { id: 'comm-4', type: 'Incident Alert', status: 'ready', description: 'Emergency communication template', nextUpdate: 'On-demand', audience: 'Emergency Contacts' }
        ];

        const container = document.getElementById('communicationCenter');
        if (!container) return;

        container.innerHTML = communicationData.map(item => `
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card enterprise-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${item.type}</h6>
                            <span class="badge bg-${this.getStatusColor(item.status)}">${item.status}</span>
                        </div>
                        <p class="card-text small text-muted">${item.description}</p>
                        <div class="mb-2">
                            <small class="text-muted"><strong>Next Update:</strong> ${item.nextUpdate}</small>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted"><strong>Audience:</strong> ${item.audience}</small>
                        </div>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="enterpriseDashboard.sendCommunication('${item.id}')">
                                <i class="fas fa-paper-plane me-1"></i>Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populatePostLiveAnalysis() {
        const postLiveData = [
            { id: 'pla-1', metric: 'User Adoption', value: '94%', trend: '+8%', description: 'User adoption rate post go-live', status: 'excellent' },
            { id: 'pla-2', metric: 'Performance', value: '99.2%', trend: '+0.5%', description: 'System performance vs. baseline', status: 'excellent' },
            { id: 'pla-3', metric: 'Support Tickets', value: '12', trend: '-25%', description: 'Support tickets this week', status: 'good' },
            { id: 'pla-4', metric: 'Uptime', value: '99.97%', trend: '+0.02%', description: 'Production uptime since go-live', status: 'excellent' }
        ];

        const container = document.getElementById('postLiveAnalysis');
        if (!container) return;

        container.innerHTML = postLiveData.map(item => `
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card enterprise-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${item.metric}</h6>
                            <span class="badge bg-${this.getStatusColor(item.status)}">${item.status}</span>
                        </div>
                        <h4 class="mb-2">${item.value}</h4>
                        <p class="card-text small text-muted">${item.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-success">${item.trend}</small>
                            <small class="text-muted">vs. Baseline</small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateEnterpriseStatusCards() {
        const statusData = [
            { id: 'status-1', title: 'Production Environment', status: 'operational', description: 'All production systems running smoothly', lastCheck: '2 minutes ago', health: 'excellent' },
            { id: 'status-2', title: 'User Experience', status: 'excellent', description: 'Users reporting positive experience', lastCheck: '5 minutes ago', health: 'excellent' },
            { id: 'status-3', title: 'Security Posture', status: 'secure', description: 'All security controls active and validated', lastCheck: '1 hour ago', health: 'excellent' },
            { id: 'status-4', title: 'Performance Metrics', status: 'optimal', description: 'All performance targets exceeded', lastCheck: '3 minutes ago', health: 'excellent' }
        ];

        const container = document.getElementById('enterpriseStatusCards');
        if (!container) return;

        container.innerHTML = statusData.map(item => `
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card enterprise-card h-100 enterprise-status ${item.status}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${item.title}</h6>
                            <span class="badge bg-${this.getStatusColor(item.status)}">${item.status}</span>
                        </div>
                        <p class="card-text small text-muted">${item.description}</p>
                        <div class="mb-2">
                            <small class="text-muted">Last Check: ${item.lastCheck}</small>
                        </div>
                        <div class="mb-2">
                            <span class="badge bg-${this.getHealthColor(item.health)}">${item.health}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    startCountdown() {
        this.countdownInterval = setInterval(() => {
            const now = new Date();
            const targetDate = new Date('2024-01-20T10:00:00');
            const timeDiff = targetDate - now;

            if (timeDiff > 0) {
                const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

                const countdownElement = document.getElementById('countdownTimer');
                if (countdownElement) {
                    countdownElement.textContent = `T-${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
            } else {
                const countdownElement = document.getElementById('countdownTimer');
                if (countdownElement) {
                    countdownElement.textContent = 'GO-LIVE READY!';
                    countdownElement.className = 'countdown-timer text-success';
                }
            }
        }, 1000);
    }

    startLiveMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.refreshMetrics();
        }, 30000); // Refresh every 30 seconds
    }

    updateMetrics() {
        // Update enterprise metrics with real-time data
        const metrics = {
            environments: Math.floor(Math.random() * 2) + 3,
            users: Math.floor(Math.random() * 200) + 1200,
            factories: Math.floor(Math.random() * 10) + 40,
            uptime: (99.9 + Math.random() * 0.1).toFixed(2)
        };

        document.getElementById('totalEnvironments')?.textContent = metrics.environments;
        document.getElementById('totalUsers')?.textContent = `${metrics.users}+`;
        document.getElementById('totalFactories')?.textContent = metrics.factories;
        document.getElementById('uptime')?.textContent = `${metrics.uptime}%`;
    }

    showGoLiveConfirmation() {
        const modal = document.getElementById('goLiveConfirmationModal');
        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    async confirmGoLive() {
        const button = document.getElementById('confirmGoLive');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Initiating Go-Live...';
        }

        try {
            await this.simulateGoLiveProcess(5000);
            this.deploymentStatus = 'in-progress';
            this.deploymentPhase = 'deployment';
            this.showNotification('Enterprise Go-Live initiated successfully!', 'success');
            this.updateDeploymentStatus();
        } catch (error) {
            this.showNotification('Error during go-live initiation', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-rocket me-2"></i>PROCEED WITH GO-LIVE';
            }
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('goLiveConfirmationModal'));
        if (modal) {
            modal.hide();
        }
    }

    async startDeployment() {
        if (this.deploymentStatus === 'ready') {
            this.deploymentStatus = 'in-progress';
            this.deploymentPhase = 'deployment';
            this.showNotification('Production deployment started', 'info');
            this.updateDeploymentStatus();
        }
    }

    pauseDeployment() {
        if (this.deploymentStatus === 'in-progress') {
            this.deploymentStatus = 'paused';
            this.showNotification('Deployment paused', 'warning');
            this.updateDeploymentStatus();
        }
    }

    stopDeployment() {
        if (this.deploymentStatus === 'in-progress' || this.deploymentStatus === 'paused') {
            this.deploymentStatus = 'stopped';
            this.showNotification('Deployment stopped', 'warning');
            this.updateDeploymentStatus();
        }
    }

    refreshMetrics() {
        this.updateMetrics();
        this.populateMonitoringMetrics();
        this.showNotification('Metrics refreshed', 'info');
    }

    exportMetrics() {
        const report = {
            title: 'Enterprise Go-Live Metrics Report',
            date: new Date().toISOString(),
            metrics: {
                environments: document.getElementById('totalEnvironments')?.textContent,
                users: document.getElementById('totalUsers')?.textContent,
                factories: document.getElementById('totalFactories')?.textContent,
                uptime: document.getElementById('uptime')?.textContent
            },
            deploymentStatus: this.deploymentStatus,
            deploymentPhase: this.deploymentPhase
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enterprise-go-live-metrics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Metrics report exported successfully!', 'success');
    }

    showRollbackConfirmation() {
        const modal = document.getElementById('rollbackConfirmationModal');
        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    async confirmRollback() {
        const button = document.getElementById('confirmRollback');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Initiating Rollback...';
        }

        try {
            await this.simulateRollbackProcess(8000);
            this.showNotification('Emergency rollback completed successfully!', 'success');
        } catch (error) {
            this.showNotification('Error during rollback process', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-undo me-2"></i>CONFIRM ROLLBACK';
            }
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('rollbackConfirmationModal'));
        if (modal) {
            modal.hide();
        }
    }

    testRollback() {
        this.showNotification('Rollback test procedure initiated', 'info');
    }

    sendStatusUpdate() {
        this.showNotification('Status update sent to stakeholders', 'success');
    }

    scheduleUpdate() {
        this.showNotification('Status update scheduled', 'info');
    }

    generatePostLiveReport() {
        const report = {
            title: 'Post-Live Analysis Report',
            date: new Date().toISOString(),
            summary: 'Comprehensive analysis of platform performance post go-live',
            recommendations: [
                'Continue monitoring user adoption patterns',
                'Optimize performance based on real-world usage',
                'Plan for next feature release cycle'
            ]
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `post-live-analysis-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Post-live report generated successfully!', 'success');
    }

    scheduleReviewMeeting() {
        this.showNotification('Review meeting scheduled for next week', 'info');
    }

    updateDeploymentStatus() {
        // Update deployment status display based on current state
        const statusElement = document.getElementById('deploymentStatus');
        if (statusElement) {
            // Update status indicators based on deploymentStatus
            this.populateDeploymentStatus();
        }
    }

    getStatusColor(status) {
        switch (status) {
            case 'completed':
            case 'operational':
            case 'excellent':
            case 'secure':
            case 'optimal':
            case 'ready': return 'success';
            case 'in-progress':
            case 'good': return 'warning';
            case 'pending':
            case 'draft': return 'secondary';
            case 'stopped':
            case 'critical': return 'danger';
            default: return 'secondary';
        }
    }

    getHealthColor(health) {
        switch (health) {
            case 'excellent': return 'success';
            case 'good': return 'info';
            case 'fair': return 'warning';
            case 'poor': return 'danger';
            default: return 'secondary';
        }
    }

    async simulateGoLiveProcess(duration) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }

    async simulateRollbackProcess(duration) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, duration);
        });
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

// Initialize the enterprise go-live dashboard
const enterpriseDashboard = new EnterpriseGoLiveDashboard();
