import { initializeFirebase } from '../../firebase-config.js';

class AuditManagementDashboard {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.currentFactory = null;
        this.audits = [];
        this.auditFindings = [];
        this.auditTypes = [];
        this.upcomingAudits = [];
        this.auditStats = {};
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            await this.loadAllData();
            this.updateOverviewCards();
        } catch (error) {
            console.error('Error initializing Audit Management Dashboard:', error);
            this.showError('Failed to initialize audit management dashboard');
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
        // Audit filter
        document.getElementById('auditFilter').addEventListener('change', (e) => {
            this.filterAudits(e.target.value);
        });

        // Findings filter
        document.getElementById('findingsFilter').addEventListener('change', (e) => {
            this.filterFindings(e.target.value);
        });
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadAudits(),
                this.loadAuditFindings(),
                this.loadAuditTypes(),
                this.loadUpcomingAudits(),
                this.loadAuditStats()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadAudits() {
        try {
            const auditsSnapshot = await this.db
                .collection('audits')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('auditDate', 'desc')
                .get();

            this.audits = [];
            auditsSnapshot.forEach(doc => {
                const auditData = doc.data();
                this.audits.push({
                    id: doc.id,
                    ...auditData
                });
            });

            this.updateAuditSchedule();
            this.updateAuditResultsTable();
        } catch (error) {
            console.error('Error loading audits:', error);
        }
    }

    async loadAuditFindings() {
        try {
            const findingsSnapshot = await this.db
                .collection('audit_findings')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('createdAt', 'desc')
                .get();

            this.auditFindings = [];
            findingsSnapshot.forEach(doc => {
                const findingData = doc.data();
                this.auditFindings.push({
                    id: doc.id,
                    ...findingData
                });
            });

            this.updateFindingsGrid();
        } catch (error) {
            console.error('Error loading audit findings:', error);
        }
    }

    async loadAuditTypes() {
        try {
            const typesSnapshot = await this.db
                .collection('audit_types')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('name')
                .get();

            this.auditTypes = [];
            typesSnapshot.forEach(doc => {
                const typeData = doc.data();
                this.auditTypes.push({
                    id: doc.id,
                    ...typeData
                });
            });

            this.updateAuditTypes();
        } catch (error) {
            console.error('Error loading audit types:', error);
        }
    }

    async loadUpcomingAudits() {
        try {
            const upcomingSnapshot = await this.db
                .collection('audits')
                .where('factoryId', '==', this.currentFactory)
                .where('auditDate', '>=', new Date())
                .where('status', '==', 'scheduled')
                .orderBy('auditDate', 'asc')
                .limit(10)
                .get();

            this.upcomingAudits = [];
            upcomingSnapshot.forEach(doc => {
                const auditData = doc.data();
                this.upcomingAudits.push({
                    id: doc.id,
                    ...auditData
                });
            });

            this.updateUpcomingAudits();
        } catch (error) {
            console.error('Error loading upcoming audits:', error);
        }
    }

    async loadAuditStats() {
        try {
            // Calculate audit statistics
            const totalAudits = this.audits.length;
            const passedAudits = this.audits.filter(audit => 
                audit.status === 'completed' && audit.result === 'pass'
            ).length;
            const inProgressAudits = this.audits.filter(audit => 
                audit.status === 'in_progress'
            ).length;
            const openFindings = this.auditFindings.filter(finding => 
                finding.status === 'open'
            ).length;

            this.auditStats = {
                totalAudits,
                passedAudits,
                inProgressAudits,
                openFindings,
                successRate: totalAudits > 0 ? Math.round((passedAudits / totalAudits) * 100) : 0
            };

            this.updateAuditStats();
        } catch (error) {
            console.error('Error loading audit stats:', error);
        }
    }

    updateAuditSchedule() {
        const container = document.getElementById('auditSchedule');
        
        if (this.audits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="calendar"></i>
                    <p>No audits scheduled</p>
                    <button class="btn btn-primary" onclick="scheduleAudit()">
                        <i data-lucide="plus"></i> Schedule First Audit
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.audits.map(audit => `
            <div class="audit-item audit-${audit.status}">
                <div class="audit-header">
                    <h4>${audit.title}</h4>
                    <div class="audit-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewAuditDetails('${audit.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editAudit('${audit.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                    </div>
                </div>
                <div class="audit-description">${audit.description}</div>
                <div class="audit-meta">
                    <div class="audit-type">
                        <strong>Type:</strong> ${this.getAuditTypeDisplayName(audit.type)}
                    </div>
                    <div class="audit-scope">
                        <strong>Scope:</strong> ${this.getScopeDisplayName(audit.scope)}
                    </div>
                    <div class="audit-date">
                        <strong>Date:</strong> ${this.formatDate(audit.auditDate)}
                    </div>
                    <div class="audit-status">
                        <strong>Status:</strong> 
                        <span class="status-badge status-${audit.status}">${this.getStatusDisplayName(audit.status)}</span>
                    </div>
                </div>
                <div class="audit-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${audit.progress || 0}%"></div>
                    </div>
                    <span class="progress-text">${audit.progress || 0}% Complete</span>
                </div>
            </div>
        `).join('');
    }

    updateAuditResultsTable() {
        const tableBody = document.getElementById('auditResultsTable');
        
        if (this.audits.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i data-lucide="file-text"></i>
                        <p>No audit results found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.audits.map(audit => `
            <tr class="audit-row ${audit.result === 'fail' ? 'failed' : ''}">
                <td>
                    <div class="audit-info">
                        <div class="audit-title">${audit.title}</div>
                        <div class="audit-description">${audit.description}</div>
                    </div>
                </td>
                <td>
                    <span class="type-badge type-${audit.type}">
                        ${this.getAuditTypeDisplayName(audit.type)}
                    </span>
                </td>
                <td>${audit.auditor || 'Unassigned'}</td>
                <td>${this.formatDate(audit.auditDate)}</td>
                <td>
                    <span class="status-badge status-${audit.status}">
                        ${this.getStatusDisplayName(audit.status)}
                    </span>
                </td>
                <td>
                    <span class="score-badge score-${this.getScoreCategory(audit.score)}">
                        ${audit.score || 'N/A'}%
                    </span>
                </td>
                <td>${this.getFindingsCount(audit.id)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewAuditDetails('${audit.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editAudit('${audit.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="exportAuditReport('${audit.id}')">
                            <i data-lucide="download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateFindingsGrid() {
        const container = document.getElementById('findingsGrid');
        
        if (this.auditFindings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="alert-triangle"></i>
                    <p>No audit findings found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.auditFindings.map(finding => `
            <div class="finding-item finding-${finding.severity}">
                <div class="finding-header">
                    <h4>${finding.title}</h4>
                    <div class="finding-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewFindingDetails('${finding.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editFinding('${finding.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                    </div>
                </div>
                <div class="finding-description">${finding.description}</div>
                <div class="finding-meta">
                    <div class="finding-severity">
                        <strong>Severity:</strong> 
                        <span class="severity-badge severity-${finding.severity}">${finding.severity}</span>
                    </div>
                    <div class="finding-status">
                        <strong>Status:</strong> 
                        <span class="status-badge status-${finding.status}">${this.getFindingStatusDisplayName(finding.status)}</span>
                    </div>
                    <div class="finding-audit">
                        <strong>Audit:</strong> ${this.getAuditTitle(finding.auditId)}
                    </div>
                    <div class="finding-date">
                        <strong>Found:</strong> ${this.formatDate(finding.createdAt)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateAuditTypes() {
        const container = document.getElementById('auditTypes');
        
        if (this.auditTypes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="folder"></i>
                    <p>No audit types found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.auditTypes.map(type => `
            <div class="type-item">
                <div class="type-header">
                    <h4>${type.name}</h4>
                    <span class="audit-count">${type.auditCount || 0} audits</span>
                </div>
                <div class="type-description">${type.description || 'No description'}</div>
                <div class="type-stats">
                    <div class="stat-item">
                        <span class="stat-label">Success Rate:</span>
                        <span class="stat-value">${type.successRate || 0}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Avg. Score:</span>
                        <span class="stat-value">${type.averageScore || 0}%</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateUpcomingAudits() {
        const container = document.getElementById('upcomingAudits');
        
        if (this.upcomingAudits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="clock"></i>
                    <p>No upcoming audits scheduled</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.upcomingAudits.map(audit => `
            <div class="upcoming-audit-item">
                <div class="audit-header">
                    <h4>${audit.title}</h4>
                    <span class="audit-date">${this.formatDate(audit.auditDate)}</span>
                </div>
                <div class="audit-details">
                    <div class="audit-type">${this.getAuditTypeDisplayName(audit.type)}</div>
                    <div class="audit-auditor">${audit.auditor || 'Unassigned'}</div>
                    <div class="audit-duration">${audit.duration} days</div>
                </div>
            </div>
        `).join('');
    }

    updateAuditStats() {
        const container = document.getElementById('auditStats');
        
        container.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">Total Audits</div>
                <div class="stat-value">${this.auditStats.totalAudits}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Success Rate</div>
                <div class="stat-value">${this.auditStats.successRate}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Avg. Score</div>
                <div class="stat-value">${this.calculateAverageScore()}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Open Findings</div>
                <div class="stat-value">${this.auditStats.openFindings}</div>
            </div>
        `;
    }

    filterAudits(auditType) {
        let filteredAudits = this.audits;

        if (auditType !== 'all') {
            filteredAudits = this.audits.filter(audit => audit.type === auditType);
        }

        this.updateAuditResultsTableWithData(filteredAudits);
    }

    filterFindings(status) {
        let filteredFindings = this.auditFindings;

        if (status !== 'all') {
            filteredFindings = this.auditFindings.filter(finding => finding.status === status);
        }

        this.updateFindingsGridWithData(filteredFindings);
    }

    updateAuditResultsTableWithData(audits) {
        const tableBody = document.getElementById('auditResultsTable');
        
        if (audits.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i data-lucide="search"></i>
                        <p>No audits found matching your criteria</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = audits.map(audit => `
            <tr class="audit-row ${audit.result === 'fail' ? 'failed' : ''}">
                <td>
                    <div class="audit-info">
                        <div class="audit-title">${audit.title}</div>
                        <div class="audit-description">${audit.description}</div>
                    </div>
                </td>
                <td>
                    <span class="type-badge type-${audit.type}">
                        ${this.getAuditTypeDisplayName(audit.type)}
                    </span>
                </td>
                <td>${audit.auditor || 'Unassigned'}</td>
                <td>${this.formatDate(audit.auditDate)}</td>
                <td>
                    <span class="status-badge status-${audit.status}">
                        ${this.getStatusDisplayName(audit.status)}
                    </span>
                </td>
                <td>
                    <span class="score-badge score-${this.getScoreCategory(audit.score)}">
                        ${audit.score || 'N/A'}%
                    </span>
                </td>
                <td>${this.getFindingsCount(audit.id)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewAuditDetails('${audit.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editAudit('${audit.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="exportAuditReport('${audit.id}')">
                            <i data-lucide="download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateFindingsGridWithData(findings) {
        const container = document.getElementById('findingsGrid');
        
        if (findings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="search"></i>
                    <p>No findings found matching your criteria</p>
                </div>
            `;
            return;
        }

        container.innerHTML = findings.map(finding => `
            <div class="finding-item finding-${finding.severity}">
                <div class="finding-header">
                    <h4>${finding.title}</h4>
                    <div class="finding-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewFindingDetails('${finding.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editFinding('${finding.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                    </div>
                </div>
                <div class="finding-description">${finding.description}</div>
                <div class="finding-meta">
                    <div class="finding-severity">
                        <strong>Severity:</strong> 
                        <span class="severity-badge severity-${finding.severity}">${finding.severity}</span>
                    </div>
                    <div class="finding-status">
                        <strong>Status:</strong> 
                        <span class="status-badge status-${finding.status}">${this.getFindingStatusDisplayName(finding.status)}</span>
                    </div>
                    <div class="finding-audit">
                        <strong>Audit:</strong> ${this.getAuditTitle(finding.auditId)}
                    </div>
                    <div class="finding-date">
                        <strong>Found:</strong> ${this.formatDate(finding.createdAt)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateOverviewCards() {
        const totalAudits = this.auditStats.totalAudits;
        const passedAudits = this.auditStats.passedAudits;
        const inProgressAudits = this.auditStats.inProgressAudits;
        const openFindings = this.auditStats.openFindings;

        // Update card values
        document.querySelector('.overview-card:nth-child(1) .card-value').textContent = totalAudits;
        document.querySelector('.overview-card:nth-child(2) .card-value').textContent = passedAudits;
        document.querySelector('.overview-card:nth-child(3) .card-value').textContent = inProgressAudits;
        document.querySelector('.overview-card:nth-child(4) .card-value').textContent = openFindings;
    }

    calculateAverageScore() {
        const completedAudits = this.audits.filter(audit => 
            audit.status === 'completed' && audit.score
        );

        if (completedAudits.length === 0) return 0;

        const totalScore = completedAudits.reduce((sum, audit) => sum + audit.score, 0);
        return Math.round(totalScore / completedAudits.length);
    }

    getFindingsCount(auditId) {
        return this.auditFindings.filter(finding => finding.auditId === auditId).length;
    }

    getAuditTitle(auditId) {
        const audit = this.audits.find(a => a.id === auditId);
        return audit ? audit.title : 'Unknown Audit';
    }

    getScoreCategory(score) {
        if (!score) return 'na';
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 70) return 'fair';
        return 'poor';
    }

    // Helper methods
    getAuditTypeDisplayName(type) {
        const typeNames = {
            'internal': 'Internal Audit',
            'external': 'External Audit',
            'compliance': 'Compliance Audit',
            'safety': 'Safety Audit',
            'quality': 'Quality Audit'
        };
        return typeNames[type] || type;
    }

    getScopeDisplayName(scope) {
        const scopeNames = {
            'full': 'Full Factory',
            'department': 'Department Specific',
            'process': 'Process Specific',
            'compliance': 'Compliance Specific'
        };
        return scopeNames[scope] || scope;
    }

    getStatusDisplayName(status) {
        const statusNames = {
            'scheduled': 'Scheduled',
            'in_progress': 'In Progress',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusNames[status] || status;
    }

    getFindingStatusDisplayName(status) {
        const statusNames = {
            'open': 'Open',
            'in_progress': 'In Progress',
            'resolved': 'Resolved',
            'closed': 'Closed'
        };
        return statusNames[status] || status;
    }

    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
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
let auditManagementDashboard;

function scheduleAudit() {
    document.getElementById('scheduleAuditModal').style.display = 'flex';
}

function importAuditData() {
    alert('Import Audit Data feature coming soon');
}

function exportAuditReport() {
    alert('Export Audit Report feature coming soon');
}

function createAuditChecklist() {
    alert('Create Audit Checklist feature coming soon');
}

function assignAuditor() {
    alert('Assign Auditor feature coming soon');
}

function reviewFindings() {
    alert('Review Findings feature coming soon');
}

function generateReport() {
    alert('Generate Report feature coming soon');
}

function auditAnalytics() {
    alert('Audit Analytics feature coming soon');
}

function complianceCheck() {
    alert('Compliance Check feature coming soon');
}

function viewAuditDetails(auditId) {
    document.getElementById('auditDetailsModal').style.display = 'flex';
    // Load audit details
    alert('View Audit Details feature coming soon');
}

function editAudit(auditId) {
    alert('Edit Audit feature coming soon');
}

function saveScheduledAudit() {
    alert('Save Scheduled Audit feature coming soon');
}

function updateAudit() {
    alert('Update Audit feature coming soon');
}

function completeAudit() {
    alert('Complete Audit feature coming soon');
}

function viewFindingDetails(findingId) {
    document.getElementById('findingDetailsModal').style.display = 'flex';
    // Load finding details
    alert('View Finding Details feature coming soon');
}

function editFinding(findingId) {
    alert('Edit Finding feature coming soon');
}

function createCAP() {
    alert('Create CAP feature coming soon');
}

function resolveFinding() {
    alert('Resolve Finding feature coming soon');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    auditManagementDashboard = new AuditManagementDashboard();
    window.auditManagementDashboard = auditManagementDashboard;
    auditManagementDashboard.init();
});
