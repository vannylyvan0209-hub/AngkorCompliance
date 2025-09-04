class DocumentationManagement {
    constructor() {
        this.documents = new Map();
        this.currentDocs = new Map();
        this.docStatus = {
            total: 156,
            approved: 142,
            pendingReview: 8,
            expired: 6
        };
        this.initializeDashboard();
        this.bindEvents();
    }

    initializeDashboard() {
        this.populateTechnicalDocs();
        this.populateUserDocs();
        this.populateOperationalDocs();
        this.populateLifecycleTable();
        this.populateReportsTable();
        this.populateDocStatusCards();
        this.updateDocMetrics();
    }

    bindEvents() {
        // Technical Documentation
        document.getElementById('createTechnicalDoc')?.addEventListener('click', () => this.showCreateDocModal('technical'));
        document.getElementById('exportTechnicalDocs')?.addEventListener('click', () => this.exportDocs('technical'));

        // User Documentation
        document.getElementById('createUserDoc')?.addEventListener('click', () => this.showCreateDocModal('user'));
        document.getElementById('exportUserDocs')?.addEventListener('click', () => this.exportDocs('user'));

        // Operational Documentation
        document.getElementById('createOperationalDoc')?.addEventListener('click', () => this.showCreateDocModal('operational'));
        document.getElementById('exportOperationalDocs')?.addEventListener('click', () => this.exportDocs('operational'));

        // Create Document Modal
        document.getElementById('saveDoc')?.addEventListener('click', () => this.createDocument());
    }

    populateTechnicalDocs() {
        const technicalDocs = [
            { id: 'tech-1', title: 'API Documentation (OpenAPI/Swagger)', description: 'Comprehensive API reference with endpoints, parameters, and examples', status: 'approved', version: '2.1.0', priority: 'critical', owner: 'Dev Team', lastUpdated: '2024-01-15' },
            { id: 'tech-2', title: 'Database Schema Documentation', description: 'Complete database schema with tables, relationships, and constraints', status: 'approved', version: '1.8.2', priority: 'high', owner: 'Data Team', lastUpdated: '2024-01-14' },
            { id: 'tech-3', title: 'Deployment Architecture Guide', description: 'Infrastructure setup, deployment procedures, and configuration', status: 'review', version: '1.5.0', priority: 'high', owner: 'DevOps Team', lastUpdated: '2024-01-13' },
            { id: 'tech-4', title: 'Troubleshooting Guide', description: 'Common issues, error codes, and resolution procedures', status: 'approved', version: '1.2.1', priority: 'medium', owner: 'Support Team', lastUpdated: '2024-01-12' },
            { id: 'tech-5', title: 'Performance Tuning Guide', description: 'Optimization techniques and best practices', status: 'draft', version: '0.9.0', priority: 'medium', owner: 'Performance Team', lastUpdated: '2024-01-11' }
        ];

        const container = document.getElementById('technicalDocs');
        if (!container) return;

        container.innerHTML = technicalDocs.map(doc => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card doc-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${doc.title}</h6>
                            <span class="badge bg-${this.getStatusColor(doc.status)}">${doc.status}</span>
                        </div>
                        <p class="card-text small text-muted">${doc.description}</p>
                        <div class="mb-2">
                            <span class="doc-category">Technical</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">v${doc.version}</small>
                            <span class="badge bg-${this.getPriorityColor(doc.priority)}">${doc.priority}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Owner: ${doc.owner}</small>
                            <button class="btn btn-sm btn-outline-primary" onclick="docManagement.showDocDetails('${doc.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateUserDocs() {
        const userDocs = [
            { id: 'user-1', title: 'End-User Manual', description: 'Complete user guide for factory personnel and compliance officers', status: 'approved', version: '3.2.0', priority: 'critical', owner: 'Training Team', lastUpdated: '2024-01-15' },
            { id: 'user-2', title: 'Administrator Guide', description: 'System administration and configuration guide', status: 'approved', version: '2.8.1', priority: 'high', owner: 'Admin Team', lastUpdated: '2024-01-14' },
            { id: 'user-3', title: 'Training Materials', description: 'Training modules, presentations, and assessment materials', status: 'approved', version: '2.5.0', priority: 'high', owner: 'Training Team', lastUpdated: '2024-01-13' },
            { id: 'user-4', title: 'Best Practices Guide', description: 'Industry best practices and compliance recommendations', status: 'review', version: '1.9.0', priority: 'medium', owner: 'Compliance Team', lastUpdated: '2024-01-12' },
            { id: 'user-5', title: 'FAQ and Troubleshooting', description: 'Frequently asked questions and user support', status: 'approved', version: '1.6.2', priority: 'medium', owner: 'Support Team', lastUpdated: '2024-01-11' }
        ];

        const container = document.getElementById('userDocs');
        if (!container) return;

        container.innerHTML = userDocs.map(doc => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card doc-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${doc.title}</h6>
                            <span class="badge bg-${this.getStatusColor(doc.status)}">${doc.status}</span>
                        </div>
                        <p class="card-text small text-muted">${doc.description}</p>
                        <div class="mb-2">
                            <span class="doc-category">User</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">v${doc.version}</small>
                            <span class="badge bg-${this.getPriorityColor(doc.priority)}">${doc.priority}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Owner: ${doc.owner}</small>
                            <button class="btn btn-sm btn-outline-primary" onclick="docManagement.showDocDetails('${doc.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateOperationalDocs() {
        const operationalDocs = [
            { id: 'op-1', title: 'Runbooks and Playbooks', description: 'Operational procedures and incident response playbooks', status: 'approved', version: '2.3.0', priority: 'critical', owner: 'Ops Team', lastUpdated: '2024-01-15' },
            { id: 'op-2', title: 'Incident Response Procedures', description: 'Step-by-step incident response and escalation procedures', status: 'approved', version: '2.1.1', priority: 'critical', owner: 'Security Team', lastUpdated: '2024-01-14' },
            { id: 'op-3', title: 'Change Management Procedures', description: 'Change request, approval, and implementation procedures', status: 'approved', version: '1.8.0', priority: 'high', owner: 'Change Team', lastUpdated: '2024-01-13' },
            { id: 'op-4', title: 'Monitoring and Alerting Guide', description: 'System monitoring setup and alert configuration', status: 'review', version: '1.5.0', priority: 'high', owner: 'Monitoring Team', lastUpdated: '2024-01-12' },
            { id: 'op-5', title: 'Backup and Recovery Procedures', description: 'Data backup, recovery, and disaster recovery procedures', status: 'approved', version: '1.4.2', priority: 'high', owner: 'DR Team', lastUpdated: '2024-01-11' }
        ];

        const container = document.getElementById('operationalDocs');
        if (!container) return;

        container.innerHTML = operationalDocs.map(doc => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card doc-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${doc.title}</h6>
                            <span class="badge bg-${this.getStatusColor(doc.status)}">${doc.status}</span>
                        </div>
                        <p class="card-text small text-muted">${doc.description}</p>
                        <div class="mb-2">
                            <span class="doc-category">Operational</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">v${doc.version}</small>
                            <span class="badge bg-${this.getPriorityColor(doc.priority)}">${doc.priority}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Owner: ${doc.owner}</small>
                            <button class="btn btn-sm btn-outline-primary" onclick="docManagement.showDocDetails('${doc.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateLifecycleTable() {
        const lifecycleData = [
            { document: 'API Documentation', version: '2.1.0', status: 'approved', lastReview: '2024-01-15', nextReview: '2024-04-15' },
            { document: 'Database Schema', version: '1.8.2', status: 'approved', lastReview: '2024-01-14', nextReview: '2024-04-14' },
            { document: 'Deployment Guide', version: '1.5.0', status: 'review', lastReview: '2024-01-13', nextReview: '2024-01-20' },
            { document: 'End-User Manual', version: '3.2.0', status: 'approved', lastReview: '2024-01-12', nextReview: '2024-04-12' },
            { document: 'Training Materials', version: '2.5.0', status: 'approved', lastReview: '2024-01-11', nextReview: '2024-04-11' }
        ];

        const container = document.getElementById('lifecycleBody');
        if (!container) return;

        container.innerHTML = lifecycleData.map(item => `
            <tr>
                <td>${item.document}</td>
                <td>${item.version}</td>
                <td><span class="badge bg-${this.getStatusColor(item.status)}">${item.status}</span></td>
                <td>${item.lastReview}</td>
                <td>${item.nextReview}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="docManagement.viewLifecycle('${item.document}')">
                        <i class="fas fa-eye me-1"></i>View
                    </button>
                </td>
            </tr>
        `).join('');
    }

    populateReportsTable() {
        const reportsData = [
            { type: 'Documentation Coverage Report', lastGenerated: '2024-01-15', status: 'Completed', coverage: '94%' },
            { type: 'Quality Metrics Report', lastGenerated: '2024-01-14', status: 'Completed', coverage: '91%' },
            { type: 'Compliance Report', lastGenerated: '2024-01-13', status: 'Completed', coverage: '96%' },
            { type: 'Review Status Report', lastGenerated: '2024-01-12', status: 'Completed', coverage: '89%' },
            { type: 'Expiration Report', lastGenerated: '2024-01-11', status: 'Completed', coverage: '100%' }
        ];

        const container = document.getElementById('reportsBody');
        if (!container) return;

        container.innerHTML = reportsData.map(item => `
            <tr>
                <td>${item.type}</td>
                <td>${item.lastGenerated}</td>
                <td><span class="badge bg-success">${item.status}</span></td>
                <td>${item.coverage}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="docManagement.generateReport('${item.type}')">
                        <i class="fas fa-sync me-1"></i>Generate
                    </button>
                </td>
            </tr>
        `).join('');
    }

    populateDocStatusCards() {
        const statusItems = [
            { id: 'status-1', title: 'Technical Documentation', status: 'operational', description: 'All critical technical documentation is up-to-date and approved', lastCheck: '2 hours ago' },
            { id: 'status-2', title: 'User Documentation', status: 'operational', description: 'User manuals and training materials are current and accessible', lastCheck: '4 hours ago' },
            { id: 'status-3', title: 'Operational Documentation', status: 'operational', description: 'Operational procedures and runbooks are validated and ready', lastCheck: '1 day ago' },
            { id: 'status-4', title: 'Documentation Lifecycle', status: 'operational', description: 'Document review and approval workflows are functioning properly', lastCheck: '1 day ago' }
        ];

        const container = document.getElementById('docStatusCards');
        if (!container) return;

        container.innerHTML = statusItems.map(item => `
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card doc-card h-100 doc-status ${item.status}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${item.title}</h6>
                            <span class="badge bg-${this.getStatusColor(item.status)}">${item.status}</span>
                        </div>
                        <p class="card-text small text-muted">${item.description}</p>
                        <small class="text-muted">Last Check: ${item.lastCheck}</small>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-info" onclick="docManagement.showDocStatusDetails('${item.id}')">
                                <i class="fas fa-info-circle me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateDocMetrics() {
        document.getElementById('totalDocs')?.textContent = this.docStatus.total;
        document.getElementById('approvedDocs')?.textContent = this.docStatus.approved;
        document.getElementById('pendingReview')?.textContent = this.docStatus.pendingReview;
        document.getElementById('expiredDocs')?.textContent = this.docStatus.expired;
    }

    getStatusColor(status) {
        switch (status) {
            case 'approved':
            case 'operational': return 'success';
            case 'review': return 'warning';
            case 'draft': return 'secondary';
            case 'expired':
            case 'failed': return 'danger';
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

    showCreateDocModal(category) {
        const modal = document.getElementById('createDocModal');
        if (modal) {
            document.getElementById('docCategory').value = category;
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    createDocument() {
        const title = document.getElementById('docTitle').value;
        const category = document.getElementById('docCategory').value;
        const description = document.getElementById('docDescription').value;
        const priority = document.getElementById('docPriority').value;
        const owner = document.getElementById('docOwner').value;

        if (!title || !category || !description || !priority || !owner) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const newDoc = {
            id: `doc-${Date.now()}`,
            title,
            description,
            category,
            priority,
            owner,
            status: 'draft',
            version: '0.1.0',
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        this.documents.set(newDoc.id, newDoc);
        this.showNotification('Document created successfully!', 'success');
        
        // Close modal and refresh
        const modal = bootstrap.Modal.getInstance(document.getElementById('createDocModal'));
        if (modal) {
            modal.hide();
        }
        
        // Refresh the appropriate section
        if (category === 'technical') {
            this.populateTechnicalDocs();
        } else if (category === 'user') {
            this.populateUserDocs();
        } else if (category === 'operational') {
            this.populateOperationalDocs();
        }
    }

    showDocDetails(docId) {
        const doc = this.documents.get(docId) || {
            title: 'Document Details',
            description: 'Detailed information about this document.',
            status: 'Unknown',
            version: 'N/A',
            owner: 'Unknown'
        };

        const modal = document.getElementById('docDetailsModal');
        const content = document.getElementById('docDetailsContent');
        
        if (content) {
            content.innerHTML = `
                <h6>${doc.title}</h6>
                <p class="text-muted">${doc.description}</p>
                <hr>
                <div class="row">
                    <div class="col-md-6">
                        <strong>Status:</strong> <span class="badge bg-${this.getStatusColor(doc.status)}">${doc.status}</span>
                    </div>
                    <div class="col-md-6">
                        <strong>Version:</strong> ${doc.version}
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-md-6">
                        <strong>Owner:</strong> ${doc.owner}
                    </div>
                    <div class="col-md-6">
                        <strong>Last Updated:</strong> ${doc.lastUpdated || 'N/A'}
                    </div>
                </div>
            `;
        }

        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    showDocStatusDetails(statusId) {
        const statusDetails = {
            'status-1': {
                title: 'Technical Documentation Status',
                description: 'Current status of all technical documentation components.',
                details: 'All critical technical documentation is up-to-date and approved. API documentation, database schemas, and deployment guides are current.',
                health: 'Excellent - All systems green'
            }
        };

        const details = statusDetails[statusId] || {
            title: 'Documentation Status Details',
            description: 'Detailed information about this documentation component.',
            details: 'Component status and health information.',
            health: 'Overall health assessment.'
        };

        const modal = document.getElementById('docDetailsModal');
        const content = document.getElementById('docDetailsContent');
        
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

    exportDocs(category) {
        const report = {
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} Documentation Export`,
            date: new Date().toISOString(),
            category: category,
            documents: [],
            summary: `Export of all ${category} documentation for the Angkor Compliance platform.`
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${category}-documentation-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification(`${category} documentation exported successfully!`, 'success');
    }

    viewLifecycle(documentName) {
        this.showNotification(`Viewing lifecycle for ${documentName}...`, 'info');
    }

    generateReport(reportType) {
        this.showNotification(`Generating ${reportType}...`, 'info');
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

// Initialize the documentation management dashboard
const docManagement = new DocumentationManagement();
