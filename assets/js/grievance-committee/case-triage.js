import { initializeFirebase } from '../../firebase-config.js';

class CaseTriage {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.currentFactory = null;
        this.pendingCases = [];
        this.investigators = [];
        this.currentCase = null;
        this.subcategories = {
            harassment: ['Verbal', 'Physical', 'Sexual', 'Bullying', 'Cyber'],
            discrimination: ['Age', 'Gender', 'Race', 'Religion', 'Disability', 'National Origin'],
            safety: ['Equipment', 'Environment', 'Procedures', 'Training', 'Emergency'],
            wages: ['Overtime', 'Benefits', 'Pay Rate', 'Deductions', 'Bonuses'],
            working_conditions: ['Hours', 'Environment', 'Equipment', 'Supervision', 'Policies'],
            management: ['Supervision', 'Communication', 'Policies', 'Decisions', 'Treatment'],
            other: ['General', 'Uncategorized']
        };
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            await this.loadAllData();
            this.updateHeaderStats();
            this.renderTriageQueue();
        } catch (error) {
            console.error('Error initializing Case Triage:', error);
            this.showError('Failed to initialize case triage system');
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    try {
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.role === 'grievance_committee' || userData.role === 'super_admin') {
                                this.currentFactory = userData.factoryId;
                                resolve();
                            } else {
                                reject(new Error('Access denied. Grievance committee role required.'));
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
        // Queue filter change
        document.getElementById('queueFilter').addEventListener('change', () => {
            this.filterQueue();
        });
    }

    async loadAllData() {
        try {
            this.showLoading();
            await Promise.all([
                this.loadPendingCases(),
                this.loadInvestigators()
            ]);
            this.hideLoading();
        } catch (error) {
            console.error('Error loading data:', error);
            this.hideLoading();
        }
    }

    async loadPendingCases() {
        try {
            const casesSnapshot = await this.db
                .collection('grievance_cases')
                .where('factoryId', '==', this.currentFactory)
                .where('status', '==', 'new')
                .orderBy('createdAt', 'asc')
                .get();

            this.pendingCases = [];
            casesSnapshot.forEach(doc => {
                const caseData = doc.data();
                this.pendingCases.push({
                    id: doc.id,
                    ...caseData
                });
            });
        } catch (error) {
            console.error('Error loading pending cases:', error);
            throw error;
        }
    }

    async loadInvestigators() {
        try {
            const investigatorsSnapshot = await this.db
                .collection('users')
                .where('factoryId', '==', this.currentFactory)
                .where('role', '==', 'grievance_committee')
                .get();

            this.investigators = [];
            investigatorsSnapshot.forEach(doc => {
                const userData = doc.data();
                this.investigators.push({
                    id: doc.id,
                    name: userData.name || userData.email,
                    email: userData.email,
                    workload: 0 // Will be calculated later
                });
            });

            await this.calculateWorkloads();
            this.populateInvestigatorSelect();
        } catch (error) {
            console.error('Error loading investigators:', error);
        }
    }

    async calculateWorkloads() {
        try {
            const assignedCasesSnapshot = await this.db
                .collection('grievance_cases')
                .where('factoryId', '==', this.currentFactory)
                .where('status', 'in', ['assigned', 'investigating'])
                .get();

            const workloadMap = {};
            assignedCasesSnapshot.forEach(doc => {
                const caseData = doc.data();
                if (caseData.assignedTo) {
                    workloadMap[caseData.assignedTo] = (workloadMap[caseData.assignedTo] || 0) + 1;
                }
            });

            this.investigators.forEach(investigator => {
                investigator.workload = workloadMap[investigator.id] || 0;
            });
        } catch (error) {
            console.error('Error calculating workloads:', error);
        }
    }

    populateInvestigatorSelect() {
        const select = document.getElementById('assignedInvestigator');
        select.innerHTML = '<option value="">Select Investigator</option>';
        
        this.investigators.forEach(investigator => {
            const option = document.createElement('option');
            option.value = investigator.id;
            option.textContent = `${investigator.name} (${investigator.workload} cases)`;
            select.appendChild(option);
        });
    }

    renderTriageQueue() {
        const queueContainer = document.getElementById('triageQueue');
        
        if (this.pendingCases.length === 0) {
            queueContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="clipboard-check"></i>
                    <p>No cases pending triage</p>
                </div>
            `;
            return;
        }

        queueContainer.innerHTML = this.pendingCases.map(caseItem => `
            <div class="queue-item" onclick="caseTriage.openTriageModal('${caseItem.id}')">
                <div class="queue-item-header">
                    <div class="case-info">
                        <h4>${caseItem.title}</h4>
                        <span class="case-number">${caseItem.caseId}</span>
                    </div>
                    <div class="case-meta">
                        <span class="submission-time">${this.formatTimeAgo(caseItem.createdAt)}</span>
                        <span class="urgency-indicator ${this.getUrgencyClass(caseItem)}">
                            ${this.getUrgencyText(caseItem)}
                        </span>
                    </div>
                </div>
                <div class="queue-item-content">
                    <p class="case-description">${this.truncateText(caseItem.description, 150)}</p>
                    <div class="case-details">
                        <span class="worker-id">${caseItem.workerId || 'Anonymous'}</span>
                        <span class="department">${caseItem.department || 'Not specified'}</span>
                    </div>
                </div>
                <div class="queue-item-actions">
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); caseTriage.openTriageModal('${caseItem.id}')">
                        <i data-lucide="clipboard-check"></i>
                        Triage
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); caseTriage.viewCaseDetails('${caseItem.id}')">
                        <i data-lucide="eye"></i>
                        View
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterQueue() {
        const filterValue = document.getElementById('queueFilter').value;
        let filteredCases = this.pendingCases;

        switch (filterValue) {
            case 'urgent':
                filteredCases = this.pendingCases.filter(caseItem => 
                    caseItem.priority === 'high' || caseItem.priority === 'critical'
                );
                break;
            case 'anonymous':
                filteredCases = this.pendingCases.filter(caseItem => 
                    !caseItem.workerId || caseItem.workerId === ''
                );
                break;
            case 'new':
                filteredCases = this.pendingCases.filter(caseItem => 
                    caseItem.status === 'new'
                );
                break;
        }

        this.renderFilteredQueue(filteredCases);
    }

    renderFilteredQueue(cases) {
        const queueContainer = document.getElementById('triageQueue');
        
        if (cases.length === 0) {
            queueContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="search"></i>
                    <p>No cases found matching your criteria</p>
                </div>
            `;
            return;
        }

        queueContainer.innerHTML = cases.map(caseItem => `
            <div class="queue-item" onclick="caseTriage.openTriageModal('${caseItem.id}')">
                <div class="queue-item-header">
                    <div class="case-info">
                        <h4>${caseItem.title}</h4>
                        <span class="case-number">${caseItem.caseId}</span>
                    </div>
                    <div class="case-meta">
                        <span class="submission-time">${this.formatTimeAgo(caseItem.createdAt)}</span>
                        <span class="urgency-indicator ${this.getUrgencyClass(caseItem)}">
                            ${this.getUrgencyText(caseItem)}
                        </span>
                    </div>
                </div>
                <div class="queue-item-content">
                    <p class="case-description">${this.truncateText(caseItem.description, 150)}</p>
                    <div class="case-details">
                        <span class="worker-id">${caseItem.workerId || 'Anonymous'}</span>
                        <span class="department">${caseItem.department || 'Not specified'}</span>
                    </div>
                </div>
                <div class="queue-item-actions">
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); caseTriage.openTriageModal('${caseItem.id}')">
                        <i data-lucide="clipboard-check"></i>
                        Triage
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); caseTriage.viewCaseDetails('${caseItem.id}')">
                        <i data-lucide="eye"></i>
                        View
                    </button>
                </div>
            </div>
        `).join('');
    }

    async openTriageModal(caseId) {
        try {
            this.showLoading();
            const caseDoc = await this.db.collection('grievance_cases').doc(caseId).get();
            
            if (caseDoc.exists) {
                this.currentCase = {
                    id: caseId,
                    ...caseDoc.data()
                };
                this.populateTriageModal();
                this.openModal('caseTriageModal');
            } else {
                this.showError('Case not found');
            }
        } catch (error) {
            console.error('Error opening triage modal:', error);
            this.showError('Failed to load case details');
        } finally {
            this.hideLoading();
        }
    }

    populateTriageModal() {
        if (!this.currentCase) return;

        // Populate case information
        document.getElementById('triageCaseNumber').textContent = this.currentCase.caseId;
        document.getElementById('triageCaseTitle').textContent = this.currentCase.title;
        document.getElementById('triageSubmissionDate').textContent = this.formatDateTime(this.currentCase.createdAt);
        document.getElementById('triageWorkerId').textContent = this.currentCase.workerId || 'Not specified';
        document.getElementById('triageDepartment').textContent = this.currentCase.department || 'Not specified';
        document.getElementById('triageDescription').textContent = this.currentCase.description;

        // Set existing values if available
        if (this.currentCase.category) {
            document.getElementById('primaryCategory').value = this.currentCase.category;
            this.updateSubcategories();
        }
        if (this.currentCase.subcategory) {
            document.getElementById('subcategory').value = this.currentCase.subcategory;
        }
        if (this.currentCase.severity) {
            document.getElementById(`triageSeverity${this.capitalizeFirst(this.currentCase.severity)}`).checked = true;
        }
        if (this.currentCase.priority) {
            document.getElementById(`triagePriority${this.capitalizeFirst(this.currentCase.priority)}`).checked = true;
        }
        if (this.currentCase.assignedTo) {
            document.getElementById('assignedInvestigator').value = this.currentCase.assignedTo;
        }
    }

    updateSubcategories() {
        const primaryCategory = document.getElementById('primaryCategory').value;
        const subcategorySelect = document.getElementById('subcategory');
        
        subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
        
        if (primaryCategory && this.subcategories[primaryCategory]) {
            this.subcategories[primaryCategory].forEach(subcategory => {
                const option = document.createElement('option');
                option.value = subcategory.toLowerCase().replace(' ', '_');
                option.textContent = subcategory;
                subcategorySelect.appendChild(option);
            });
        }
    }

    selectTriageSeverity(severity) {
        document.getElementById(`triageSeverity${this.capitalizeFirst(severity)}`).checked = true;
    }

    selectTriagePriority(priority) {
        document.getElementById(`triagePriority${this.capitalizeFirst(priority)}`).checked = true;
    }

    async completeTriage() {
        try {
            if (!this.currentCase) {
                this.showError('No case selected for triage');
                return;
            }

            const triageData = this.collectTriageData();
            
            if (!this.validateTriageData(triageData)) {
                return;
            }

            this.showLoading();
            
            // Update case with triage information
            await this.db.collection('grievance_cases').doc(this.currentCase.id).update({
                category: triageData.primaryCategory,
                subcategory: triageData.subcategory,
                severity: triageData.severity,
                priority: triageData.priority,
                assignedTo: triageData.assignedInvestigator,
                assignmentMethod: triageData.assignmentMethod,
                triageNotes: triageData.triageNotes,
                riskAssessment: {
                    retaliationRisk: triageData.retaliationRisk,
                    safetyRisk: triageData.safetyRisk,
                    legalRisk: triageData.legalRisk,
                    reputationRisk: triageData.reputationRisk,
                    financialRisk: triageData.financialRisk,
                    notes: triageData.riskNotes
                },
                status: 'assigned',
                triagedBy: this.currentUser.uid,
                triagedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.showSuccess('Case triage completed successfully');
            this.closeTriageModal();
            await this.loadAllData();
            this.updateHeaderStats();
            this.renderTriageQueue();
        } catch (error) {
            console.error('Error completing triage:', error);
            this.showError('Failed to complete triage');
        } finally {
            this.hideLoading();
        }
    }

    collectTriageData() {
        return {
            primaryCategory: document.getElementById('primaryCategory').value,
            subcategory: document.getElementById('subcategory').value,
            severity: document.querySelector('input[name="triageSeverity"]:checked')?.value,
            priority: document.querySelector('input[name="triagePriority"]:checked')?.value,
            assignedInvestigator: document.getElementById('assignedInvestigator').value,
            assignmentMethod: document.querySelector('input[name="assignmentMethod"]:checked')?.value,
            triageNotes: document.getElementById('triageNotes').value,
            retaliationRisk: document.getElementById('retaliationRisk').checked,
            safetyRisk: document.getElementById('safetyRisk').checked,
            legalRisk: document.getElementById('legalRisk').checked,
            reputationRisk: document.getElementById('reputationRisk').checked,
            financialRisk: document.getElementById('financialRisk').checked,
            riskNotes: document.getElementById('riskNotes').value
        };
    }

    validateTriageData(data) {
        if (!data.primaryCategory) {
            this.showError('Please select a primary category');
            return false;
        }
        if (!data.severity) {
            this.showError('Please select a severity level');
            return false;
        }
        if (!data.priority) {
            this.showError('Please select a priority level');
            return false;
        }
        if (!data.assignedInvestigator) {
            this.showError('Please assign an investigator');
            return false;
        }
        return true;
    }

    async saveTriageDraft() {
        try {
            if (!this.currentCase) {
                this.showError('No case selected for triage');
                return;
            }

            const triageData = this.collectTriageData();
            
            this.showLoading();
            
            // Save as draft
            await this.db.collection('grievance_cases').doc(this.currentCase.id).update({
                triageDraft: triageData,
                draftSavedBy: this.currentUser.uid,
                draftSavedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.showSuccess('Triage draft saved successfully');
        } catch (error) {
            console.error('Error saving triage draft:', error);
            this.showError('Failed to save triage draft');
        } finally {
            this.hideLoading();
        }
    }

    updateHeaderStats() {
        const pendingTriage = this.pendingCases.length;
        const todayTriage = this.pendingCases.filter(caseItem => 
            this.isSameDay(caseItem.createdAt.toDate(), new Date())
        ).length;

        document.getElementById('pendingTriage').textContent = pendingTriage;
        document.getElementById('todayTriage').textContent = todayTriage;
    }

    // Helper methods
    formatTimeAgo(timestamp) {
        const now = new Date();
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days}d ago`;
        }
    }

    formatDateTime(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    getUrgencyClass(caseItem) {
        if (caseItem.priority === 'critical') return 'urgent-critical';
        if (caseItem.priority === 'high') return 'urgent-high';
        if (caseItem.priority === 'medium') return 'urgent-medium';
        return 'urgent-low';
    }

    getUrgencyText(caseItem) {
        if (caseItem.priority === 'critical') return 'Critical';
        if (caseItem.priority === 'high') return 'High';
        if (caseItem.priority === 'medium') return 'Medium';
        return 'Low';
    }

    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Modal management
    openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    closeTriageModal() {
        this.closeModal('caseTriageModal');
        this.currentCase = null;
        this.resetTriageForm();
    }

    resetTriageForm() {
        document.getElementById('primaryCategory').value = '';
        document.getElementById('subcategory').innerHTML = '<option value="">Select Subcategory</option>';
        document.querySelectorAll('input[name="triageSeverity"]').forEach(radio => radio.checked = false);
        document.querySelectorAll('input[name="triagePriority"]').forEach(radio => radio.checked = false);
        document.getElementById('assignedInvestigator').value = '';
        document.getElementById('triageNotes').value = '';
        document.getElementById('riskNotes').value = '';
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showSuccess(message) {
        alert(message);
    }

    showError(message) {
        alert('Error: ' + message);
    }

    // Placeholder methods
    viewCaseDetails(caseId) {
        alert('View case details: ' + caseId);
    }
}

// Global functions
let caseTriage;

function filterQueue() {
    caseTriage.filterQueue();
}

function refreshQueue() {
    caseTriage.loadAllData();
}

function selectTriageSeverity(severity) {
    caseTriage.selectTriageSeverity(severity);
}

function selectTriagePriority(priority) {
    caseTriage.selectTriagePriority(priority);
}

function updateSubcategories() {
    caseTriage.updateSubcategories();
}

function completeTriage() {
    caseTriage.completeTriage();
}

function saveTriageDraft() {
    caseTriage.saveTriageDraft();
}

function closeTriageModal() {
    caseTriage.closeTriageModal();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    caseTriage = new CaseTriage();
    window.caseTriage = caseTriage;
    caseTriage.init();
});
