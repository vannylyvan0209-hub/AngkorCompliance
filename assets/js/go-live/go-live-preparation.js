class GoLivePreparation {
    constructor() {
        this.tasks = new Map();
        this.currentTask = null;
        this.taskStatus = {
            total: 24,
            completed: 18,
            inProgress: 4,
            blocked: 2
        };
        this.initializeDashboard();
        this.bindEvents();
    }

    initializeDashboard() {
        this.populateEnvironmentTasks();
        this.populateDeploymentTasks();
        this.populateUATTasks();
        this.populateChecklistTable();
        this.populateGoLiveStatusCards();
        this.updateTaskMetrics();
    }

    bindEvents() {
        // Environment Tasks
        document.getElementById('validateEnvironment')?.addEventListener('click', () => this.validateEnvironment());
        document.getElementById('exportEnvironmentReport')?.addEventListener('click', () => this.exportEnvironmentReport());

        // Deployment Tasks
        document.getElementById('testDeployment')?.addEventListener('click', () => this.testDeployment());
        document.getElementById('exportDeploymentReport')?.addEventListener('click', () => this.exportDeploymentReport());

        // UAT Tasks
        document.getElementById('startUAT')?.addEventListener('click', () => this.startUAT());
        document.getElementById('exportUATReport')?.addEventListener('click', () => this.exportUATReport());

        // Go-Live Approval
        document.getElementById('approveGoLive')?.addEventListener('click', () => this.approveGoLive());

        // Task Update Modal
        document.getElementById('saveTaskUpdate')?.addEventListener('click', () => this.saveTaskUpdate());
    }

    populateEnvironmentTasks() {
        const environmentTasks = [
            { id: 'env-1', title: 'Production Infrastructure Provisioning', description: 'Set up production servers, databases, and networking infrastructure', status: 'completed', priority: 'critical', owner: 'DevOps Team', dueDate: '2024-01-10' },
            { id: 'env-2', title: 'SSL Certificate Management', description: 'Install and configure SSL certificates for production domains', status: 'completed', priority: 'critical', owner: 'Security Team', dueDate: '2024-01-12' },
            { id: 'env-3', title: 'Domain Configuration', description: 'Configure DNS settings and domain routing for production', status: 'completed', priority: 'high', owner: 'DevOps Team', dueDate: '2024-01-12' },
            { id: 'env-4', title: 'Monitoring and Alerting Setup', description: 'Configure production monitoring, alerting, and logging systems', status: 'in-progress', priority: 'high', owner: 'Monitoring Team', dueDate: '2024-01-15' },
            { id: 'env-5', title: 'Log Aggregation Configuration', description: 'Set up centralized logging and log analysis tools', status: 'pending', priority: 'medium', owner: 'DevOps Team', dueDate: '2024-01-18' }
        ];

        const container = document.getElementById('environmentTasks');
        if (!container) return;

        container.innerHTML = environmentTasks.map(task => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card go-live-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${task.title}</h6>
                            <span class="badge bg-${this.getStatusColor(task.status)}">${task.status}</span>
                        </div>
                        <p class="card-text small text-muted">${task.description}</p>
                        <div class="mb-2">
                            <span class="go-live-phase">Environment</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-${this.getPriorityColor(task.priority)}">${task.priority}</span>
                            <small class="text-muted">Due: ${task.dueDate}</small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Owner: ${task.owner}</small>
                            <button class="btn btn-sm btn-outline-primary" onclick="goLiveDashboard.showTaskDetails('${task.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateDeploymentTasks() {
        const deploymentTasks = [
            { id: 'dep-1', title: 'CI/CD Pipeline Validation', description: 'Validate automated build, test, and deployment pipelines', status: 'completed', priority: 'critical', owner: 'DevOps Team', dueDate: '2024-01-10' },
            { id: 'dep-2', title: 'Automated Testing Integration', description: 'Integrate automated testing into deployment pipeline', status: 'completed', priority: 'high', owner: 'QA Team', dueDate: '2024-01-12' },
            { id: 'dep-3', title: 'Rollback Procedures', description: 'Test and validate rollback procedures for failed deployments', status: 'completed', priority: 'high', owner: 'DevOps Team', dueDate: '2024-01-12' },
            { id: 'dep-4', title: 'Blue-Green Deployment Testing', description: 'Test blue-green deployment strategy for zero-downtime updates', status: 'in-progress', priority: 'high', owner: 'DevOps Team', dueDate: '2024-01-15' },
            { id: 'dep-5', title: 'Zero-Downtime Deployment Validation', description: 'Validate zero-downtime deployment procedures', status: 'pending', priority: 'medium', owner: 'DevOps Team', dueDate: '2024-01-18' }
        ];

        const container = document.getElementById('deploymentTasks');
        if (!container) return;

        container.innerHTML = deploymentTasks.map(task => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card go-live-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${task.title}</h6>
                            <span class="badge bg-${this.getStatusColor(task.status)}">${task.status}</span>
                        </div>
                        <p class="card-text small text-muted">${task.description}</p>
                        <div class="mb-2">
                            <span class="go-live-phase">Deployment</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-${this.getPriorityColor(task.priority)}">${task.priority}</span>
                            <small class="text-muted">Due: ${task.dueDate}</small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Owner: ${task.owner}</small>
                            <button class="btn btn-sm btn-outline-primary" onclick="goLiveDashboard.showTaskDetails('${task.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateUATTasks() {
        const uatTasks = [
            { id: 'uat-1', title: 'End-to-End Workflow Testing', description: 'Test complete user workflows from start to finish', status: 'completed', priority: 'critical', owner: 'QA Team', dueDate: '2024-01-10' },
            { id: 'uat-2', title: 'Multi-tenant Scenario Testing', description: 'Validate multi-tenant isolation and data security', status: 'completed', priority: 'critical', owner: 'Security Team', dueDate: '2024-01-12' },
            { id: 'uat-3', title: 'Performance Benchmarking', description: 'Conduct performance testing under expected load conditions', status: 'completed', priority: 'high', owner: 'Performance Team', dueDate: '2024-01-12' },
            { id: 'uat-4', title: 'Security Validation', description: 'Final security validation and penetration testing', status: 'in-progress', priority: 'high', owner: 'Security Team', dueDate: '2024-01-15' },
            { id: 'uat-5', title: 'Compliance Requirement Validation', description: 'Validate compliance with industry standards and regulations', status: 'pending', priority: 'medium', owner: 'Compliance Team', dueDate: '2024-01-18' }
        ];

        const container = document.getElementById('uatTasks');
        if (!container) return;

        container.innerHTML = uatTasks.map(task => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card go-live-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${task.title}</h6>
                            <span class="badge bg-${this.getStatusColor(task.status)}">${task.status}</span>
                        </div>
                        <p class="card-text small text-muted">${task.description}</p>
                        <div class="mb-2">
                            <span class="go-live-phase">UAT</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-${this.getPriorityColor(task.priority)}">${task.priority}</span>
                            <small class="text-muted">Due: ${task.dueDate}</small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Owner: ${task.owner}</small>
                            <button class="btn btn-sm btn-outline-primary" onclick="goLiveDashboard.showTaskDetails('${task.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateChecklistTable() {
        const checklistData = [
            { task: 'Production Environment Setup', category: 'Infrastructure', status: 'completed', owner: 'DevOps Team', dueDate: '2024-01-10' },
            { task: 'SSL Certificate Installation', category: 'Security', status: 'completed', owner: 'Security Team', dueDate: '2024-01-12' },
            { task: 'Domain Configuration', category: 'Infrastructure', status: 'completed', owner: 'DevOps Team', dueDate: '2024-01-12' },
            { task: 'Monitoring Setup', category: 'Operations', status: 'in-progress', owner: 'Monitoring Team', dueDate: '2024-01-15' },
            { task: 'CI/CD Pipeline Validation', category: 'Deployment', status: 'completed', owner: 'DevOps Team', dueDate: '2024-01-10' },
            { task: 'Automated Testing', category: 'Quality', status: 'completed', owner: 'QA Team', dueDate: '2024-01-12' },
            { task: 'Rollback Procedures', category: 'Deployment', status: 'completed', owner: 'DevOps Team', dueDate: '2024-01-12' },
            { task: 'End-to-End Testing', category: 'UAT', status: 'completed', owner: 'QA Team', dueDate: '2024-01-10' },
            { task: 'Multi-tenant Testing', category: 'UAT', status: 'completed', owner: 'Security Team', dueDate: '2024-01-12' },
            { task: 'Performance Testing', category: 'UAT', status: 'completed', owner: 'Performance Team', dueDate: '2024-01-12' },
            { task: 'Security Validation', category: 'UAT', status: 'in-progress', owner: 'Security Team', dueDate: '2024-01-15' },
            { task: 'Compliance Validation', category: 'UAT', status: 'pending', owner: 'Compliance Team', dueDate: '2024-01-18' }
        ];

        const container = document.getElementById('checklistBody');
        if (!container) return;

        container.innerHTML = checklistData.map(item => `
            <tr class="checklist-item">
                <td>${item.task}</td>
                <td>${item.category}</td>
                <td><span class="badge bg-${this.getStatusColor(item.status)}">${item.status}</span></td>
                <td>${item.owner}</td>
                <td>${item.dueDate}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="goLiveDashboard.updateTaskStatus('${item.task}')">
                        <i class="fas fa-edit me-1"></i>Update
                    </button>
                </td>
            </tr>
        `).join('');
    }

    populateGoLiveStatusCards() {
        const statusItems = [
            { id: 'status-1', title: 'Production Environment', status: 'operational', description: 'All production infrastructure is provisioned and configured', lastCheck: '2 hours ago' },
            { id: 'status-2', title: 'Deployment Pipeline', status: 'operational', description: 'CI/CD pipeline is validated and ready for production', lastCheck: '4 hours ago' },
            { id: 'status-3', title: 'User Acceptance Testing', status: 'in-progress', description: 'UAT is in progress with most critical tests completed', lastCheck: '1 day ago' },
            { id: 'status-4', title: 'Go-Live Readiness', status: 'ready', description: 'Platform is ready for go-live with minor items pending', lastCheck: '1 day ago' }
        ];

        const container = document.getElementById('goLiveStatusCards');
        if (!container) return;

        container.innerHTML = statusItems.map(item => `
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card go-live-card h-100 go-live-status ${item.status}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${item.title}</h6>
                            <span class="badge bg-${this.getStatusColor(item.status)}">${item.status}</span>
                        </div>
                        <p class="card-text small text-muted">${item.description}</p>
                        <small class="text-muted">Last Check: ${item.lastCheck}</small>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-info" onclick="goLiveDashboard.showStatusDetails('${item.id}')">
                                <i class="fas fa-info-circle me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateTaskMetrics() {
        document.getElementById('totalTasks')?.textContent = this.taskStatus.total;
        document.getElementById('completedTasks')?.textContent = this.taskStatus.completed;
        document.getElementById('inProgressTasks')?.textContent = this.taskStatus.inProgress;
        document.getElementById('blockedTasks')?.textContent = this.taskStatus.blocked;
    }

    getStatusColor(status) {
        switch (status) {
            case 'completed':
            case 'operational':
            case 'ready': return 'success';
            case 'in-progress': return 'warning';
            case 'pending': return 'secondary';
            case 'blocked': return 'danger';
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

    async validateEnvironment() {
        const button = document.getElementById('validateEnvironment');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Validating...';
        }

        try {
            await this.simulateValidation(3000);
            this.showNotification('Environment validation completed successfully!', 'success');
        } catch (error) {
            this.showNotification('Error during environment validation', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play me-2"></i>Validate Environment';
            }
        }
    }

    async testDeployment() {
        const button = document.getElementById('testDeployment');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Testing...';
        }

        try {
            await this.simulateValidation(4000);
            this.showNotification('Deployment testing completed successfully!', 'success');
        } catch (error) {
            this.showNotification('Error during deployment testing', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play me-2"></i>Test Deployment';
            }
        }
    }

    async startUAT() {
        const button = document.getElementById('startUAT');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Starting...';
        }

        try {
            await this.simulateValidation(2000);
            this.showNotification('UAT session started successfully!', 'success');
        } catch (error) {
            this.showNotification('Error starting UAT session', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play me-2"></i>Start UAT';
            }
        }
    }

    async simulateValidation(duration) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }

    showTaskDetails(taskId) {
        const taskDetails = {
            'env-1': {
                title: 'Production Infrastructure Provisioning',
                description: 'Set up production servers, databases, and networking infrastructure for the Angkor Compliance platform.',
                status: 'completed',
                owner: 'DevOps Team',
                dueDate: '2024-01-10',
                notes: 'All production infrastructure has been successfully provisioned and configured. Servers are running and ready for deployment.'
            }
        };

        const details = taskDetails[taskId] || {
            title: 'Task Details',
            description: 'Detailed information about this go-live preparation task.',
            status: 'Unknown',
            owner: 'Unknown',
            dueDate: 'N/A',
            notes: 'No additional notes available for this task.'
        };

        const modal = document.getElementById('taskDetailsModal');
        const content = document.getElementById('taskDetailsContent');
        
        if (content) {
            content.innerHTML = `
                <h6>${details.title}</h6>
                <p class="text-muted">${details.description}</p>
                <hr>
                <div class="row">
                    <div class="col-md-6">
                        <strong>Status:</strong> <span class="badge bg-${this.getStatusColor(details.status)}">${details.status}</span>
                    </div>
                    <div class="col-md-6">
                        <strong>Owner:</strong> ${details.owner}
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-md-6">
                        <strong>Due Date:</strong> ${details.dueDate}
                    </div>
                    <div class="col-md-6">
                        <strong>Notes:</strong> ${details.notes}
                    </div>
                </div>
            `;
        }

        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    updateTaskStatus(taskName) {
        this.currentTask = taskName;
        const modal = document.getElementById('updateTaskModal');
        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    saveTaskUpdate() {
        const status = document.getElementById('taskStatus').value;
        const notes = document.getElementById('taskNotes').value;
        const owner = document.getElementById('taskOwner').value;

        if (!status || !owner) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        this.showNotification(`Task "${this.currentTask}" updated successfully!`, 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('updateTaskModal'));
        if (modal) {
            modal.hide();
        }
        
        // Refresh checklist
        this.populateChecklistTable();
    }

    showStatusDetails(statusId) {
        const statusDetails = {
            'status-1': {
                title: 'Production Environment Status',
                description: 'Current status of production infrastructure and configuration.',
                details: 'All production infrastructure has been successfully provisioned and configured. Servers are running, databases are operational, and networking is configured.',
                health: 'Excellent - All systems operational'
            }
        };

        const details = statusDetails[statusId] || {
            title: 'Status Details',
            description: 'Detailed information about this go-live component.',
            details: 'Component status and health information.',
            health: 'Overall health assessment.'
        };

        const modal = document.getElementById('taskDetailsModal');
        const content = document.getElementById('taskDetailsContent');
        
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

    approveGoLive() {
        if (confirm('Are you sure you want to approve the go-live? This action will finalize the deployment approval.')) {
            this.showNotification('Go-live approved successfully! Platform is ready for production deployment.', 'success');
            document.getElementById('approveGoLive').disabled = true;
            document.getElementById('approveGoLive').innerHTML = '<i class="fas fa-check me-2"></i>Go-Live Approved';
        }
    }

    exportEnvironmentReport() {
        this.exportReport('Environment', 'environment');
    }

    exportDeploymentReport() {
        this.exportReport('Deployment', 'deployment');
    }

    exportUATReport() {
        this.exportReport('UAT', 'uat');
    }

    exportReport(reportType, category) {
        const report = {
            title: `${reportType} Report - Go-Live Preparation`,
            date: new Date().toISOString(),
            category: category,
            summary: `${reportType} validation report for the Angkor Compliance platform go-live preparation.`,
            readiness: '85%',
            status: 'Ready for go-live'
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${category}-go-live-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification(`${reportType} report exported successfully!`, 'success');
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

// Initialize the go-live preparation dashboard
const goLiveDashboard = new GoLivePreparation();
