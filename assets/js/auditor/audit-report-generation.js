import { initializeFirebase } from '../../firebase-config.js';

class AuditReportGenerator {
    constructor() {
        this.db = null;
        this.currentUser = null;
        this.auditPlans = [];
        this.selectedAudit = null;
        this.findings = [];
        this.init();
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            await this.checkAuthentication();
            await this.loadAuditPlans();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing report generator:', error);
            this.showError('Failed to initialize report generation system');
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.role === 'auditor' || userData.role === 'super_admin') {
                                this.currentUser = { ...user, ...userData };
                                resolve();
                            } else {
                                reject(new Error('Access denied. Auditor role required.'));
                            }
                        } else {
                            reject(new Error('User profile not found.'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('User not authenticated.'));
                }
            });
        });
    }

    async loadAuditPlans() {
        try {
            const auditPlansSnapshot = await this.db.collection('auditPlans')
                .orderBy('createdAt', 'desc')
                .get();
            
            this.auditPlans = auditPlansSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.populateAuditSelect();
        } catch (error) {
            console.error('Error loading audit plans:', error);
        }
    }

    populateAuditSelect() {
        const auditSelect = document.getElementById('auditSelect');
        auditSelect.innerHTML = '<option value="">Choose an audit...</option>';
        
        this.auditPlans.forEach(audit => {
            const option = document.createElement('option');
            option.value = audit.id;
            option.textContent = audit.auditTitle;
            auditSelect.appendChild(option);
        });
    }

    loadAuditData() {
        const auditId = document.getElementById('auditSelect').value;
        if (!auditId) {
            this.selectedAudit = null;
            this.updateReportPreview();
            return;
        }

        this.selectedAudit = this.auditPlans.find(audit => audit.id === auditId);
        if (this.selectedAudit) {
            // Pre-populate form with audit data
            document.getElementById('reportTitle').value = `${this.selectedAudit.auditTitle} - Audit Report`;
            document.getElementById('reportType').value = this.selectedAudit.auditType;
            document.getElementById('auditScope').value = this.selectedAudit.auditScope || '';
            
            // Set audit period
            const startDate = this.formatDate(this.selectedAudit.startDate);
            const endDate = this.formatDate(this.selectedAudit.endDate);
            document.getElementById('auditPeriod').value = `${startDate} - ${endDate}`;
            
            this.loadAuditFindings(auditId);
        }
        
        this.updateReportPreview();
    }

    async loadAuditFindings(auditId) {
        try {
            const findingsSnapshot = await this.db.collection('auditFindings')
                .where('auditId', '==', auditId)
                .orderBy('severity', 'desc')
                .get();
            
            this.findings = findingsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.updateFindingsList();
        } catch (error) {
            console.error('Error loading audit findings:', error);
        }
    }

    updateFindingsList() {
        const findingsList = document.getElementById('findingsList');
        
        if (this.findings.length === 0) {
            findingsList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="alert-circle"></i>
                    <p>No findings added yet</p>
                    <button class="btn btn-outline" onclick="addFinding()">
                        <i data-lucide="plus"></i> Add Finding
                    </button>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        findingsList.innerHTML = this.findings.map(finding => `
            <div class="finding-item">
                <div class="finding-header">
                    <div class="finding-title">${finding.title}</div>
                    <span class="finding-severity severity-${finding.severity}">${this.capitalizeFirst(finding.severity)}</span>
                </div>
                <div class="finding-description">${finding.description}</div>
                <div class="finding-recommendation">
                    <strong>Recommendation:</strong> ${finding.recommendation}
                </div>
                <div style="margin-top: var(--space-2);">
                    <button class="btn-icon" onclick="editFinding('${finding.id}')" title="Edit">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteFinding('${finding.id}')" title="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `).join('') + `
            <button class="btn btn-outline" onclick="addFinding()" style="margin-top: var(--space-3);">
                <i data-lucide="plus"></i> Add Finding
            </button>
        `;

        if (window.lucide) lucide.createIcons();
    }

    addFinding() {
        const findingData = {
            title: prompt('Finding Title:'),
            severity: prompt('Severity (critical/high/medium/low):').toLowerCase(),
            description: prompt('Description:'),
            recommendation: prompt('Recommendation:')
        };

        if (findingData.title && findingData.severity && findingData.description) {
            const finding = {
                id: Date.now().toString(),
                ...findingData,
                auditId: this.selectedAudit?.id,
                createdBy: this.currentUser.uid,
                createdAt: new Date()
            };

            this.findings.push(finding);
            this.updateFindingsList();
            this.updateReportPreview();
        }
    }

    editFinding(findingId) {
        const finding = this.findings.find(f => f.id === findingId);
        if (!finding) return;

        const updatedData = {
            title: prompt('Finding Title:', finding.title),
            severity: prompt('Severity (critical/high/medium/low):', finding.severity).toLowerCase(),
            description: prompt('Description:', finding.description),
            recommendation: prompt('Recommendation:', finding.recommendation)
        };

        if (updatedData.title && updatedData.severity && updatedData.description) {
            Object.assign(finding, updatedData);
            this.updateFindingsList();
            this.updateReportPreview();
        }
    }

    deleteFinding(findingId) {
        if (confirm('Are you sure you want to delete this finding?')) {
            this.findings = this.findings.filter(f => f.id !== findingId);
            this.updateFindingsList();
            this.updateReportPreview();
        }
    }

    updateReportPreview() {
        const preview = document.getElementById('reportPreview');
        
        if (!this.selectedAudit) {
            preview.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="file-text"></i>
                    <p>Select an audit to preview the report</p>
                    <p>Fill in the form to see the report content</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        const formData = this.getFormData();
        const complianceScore = parseInt(formData.complianceScore) || 0;
        const scoreClass = this.getScoreClass(complianceScore);

        preview.innerHTML = `
            <div class="report-header">
                <div class="report-title">${formData.reportTitle || 'Audit Report'}</div>
                <div class="report-meta">
                    ${formData.reportType || 'Audit Type'} • ${formData.auditPeriod || 'Audit Period'}
                </div>
                <div class="compliance-score ${scoreClass}">
                    ${complianceScore}% Compliance
                </div>
            </div>

            <div class="report-section">
                <h4>Executive Summary</h4>
                <p>${formData.executiveSummary || 'Executive summary will appear here...'}</p>
            </div>

            <div class="report-section">
                <h4>Audit Scope</h4>
                <p>${formData.auditScope || 'Audit scope will appear here...'}</p>
            </div>

            <div class="report-section">
                <h4>Key Findings</h4>
                <p>${formData.keyFindings || 'Key findings will appear here...'}</p>
            </div>

            <div class="report-section">
                <h4>Detailed Findings</h4>
                ${this.findings.length > 0 ? this.findings.map(finding => `
                    <div class="finding-item">
                        <div class="finding-header">
                            <div class="finding-title">${finding.title}</div>
                            <span class="finding-severity severity-${finding.severity}">${this.capitalizeFirst(finding.severity)}</span>
                        </div>
                        <div class="finding-description">${finding.description}</div>
                        <div class="finding-recommendation">
                            <strong>Recommendation:</strong> ${finding.recommendation}
                        </div>
                    </div>
                `).join('') : '<p>No detailed findings available.</p>'}
            </div>

            <div class="report-section">
                <h4>Recommendations</h4>
                <p>${formData.recommendations || 'Recommendations will appear here...'}</p>
            </div>

            <div class="report-section">
                <h4>Next Steps</h4>
                <p>${formData.nextSteps || 'Next steps will appear here...'}</p>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    getFormData() {
        const form = document.getElementById('reportForm');
        const formData = new FormData(form);
        return Object.fromEntries(formData.entries());
    }

    getScoreClass(score) {
        if (score >= 90) return 'score-excellent';
        if (score >= 80) return 'score-good';
        if (score >= 70) return 'score-fair';
        return 'score-poor';
    }

    async generateReport() {
        if (!this.selectedAudit) {
            this.showError('Please select an audit first');
            return;
        }

        const formData = this.getFormData();
        if (!formData.reportTitle || !formData.reportType) {
            this.showError('Please fill in the required fields');
            return;
        }

        try {
            const reportData = {
                ...formData,
                auditId: this.selectedAudit.id,
                findings: this.findings,
                generatedBy: this.currentUser.uid,
                generatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'draft'
            };

            await this.db.collection('auditReports').add(reportData);
            
            this.showSuccess('Report generated successfully');
            this.updateReportPreview();
        } catch (error) {
            console.error('Error generating report:', error);
            this.showError('Failed to generate report');
        }
    }

    async exportReport() {
        if (!this.selectedAudit) {
            this.showError('Please select an audit first');
            return;
        }

        try {
            const formData = this.getFormData();
            const reportContent = this.generateReportContent(formData);
            
            const blob = new Blob([reportContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${formData.reportTitle || 'audit_report'}_${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting report:', error);
            this.showError('Failed to export report');
        }
    }

    generateReportContent(formData) {
        const complianceScore = parseInt(formData.complianceScore) || 0;
        
        return `
AUDIT REPORT
${'='.repeat(50)}

${formData.reportTitle || 'Audit Report'}
${formData.reportType || 'Audit Type'} • ${formData.auditPeriod || 'Audit Period'}

Overall Compliance Score: ${complianceScore}%

${'='.repeat(50)}

EXECUTIVE SUMMARY
${'-'.repeat(20)}
${formData.executiveSummary || 'Executive summary not provided.'}

AUDIT SCOPE
${'-'.repeat(20)}
${formData.auditScope || 'Audit scope not provided.'}

KEY FINDINGS
${'-'.repeat(20)}
${formData.keyFindings || 'Key findings not provided.'}

DETAILED FINDINGS
${'-'.repeat(20)}
${this.findings.length > 0 ? this.findings.map(finding => `
${finding.title} (${finding.severity.toUpperCase()})
${finding.description}

Recommendation: ${finding.recommendation}
`).join('\n') : 'No detailed findings available.'}

RECOMMENDATIONS
${'-'.repeat(20)}
${formData.recommendations || 'Recommendations not provided.'}

NEXT STEPS
${'-'.repeat(20)}
${formData.nextSteps || 'Next steps not provided.'}

${'='.repeat(50)}
Report generated on: ${new Date().toLocaleDateString()}
Generated by: ${this.currentUser.firstName} ${this.currentUser.lastName}
        `.trim();
    }

    setupEventListeners() {
        // Add real-time preview updates
        const form = document.getElementById('reportForm');
        form.addEventListener('input', () => {
            this.updateReportPreview();
        });
    }

    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showSuccess(message) {
        alert(message);
    }

    showError(message) {
        alert('Error: ' + message);
    }
}

// Global functions for button actions
window.loadAuditData = function() {
    window.auditReportGenerator.loadAuditData();
};

window.addFinding = function() {
    window.auditReportGenerator.addFinding();
};

window.editFinding = function(findingId) {
    window.auditReportGenerator.editFinding(findingId);
};

window.deleteFinding = function(findingId) {
    window.auditReportGenerator.deleteFinding(findingId);
};

window.generateReport = function() {
    window.auditReportGenerator.generateReport();
};

window.exportReport = function() {
    window.auditReportGenerator.exportReport();
};

let auditReportGenerator;
document.addEventListener('DOMContentLoaded', () => {
    auditReportGenerator = new AuditReportGenerator();
    window.auditReportGenerator = auditReportGenerator;
});
