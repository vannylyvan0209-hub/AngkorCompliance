import { initializeFirebase } from '../../firebase-config.js';

class CaseManagement {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.currentFactory = null;
        this.cases = [];
        this.filteredCases = [];
        this.investigators = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.selectedCases = new Set();
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
            this.renderCases();
        } catch (error) {
            console.error('Error initializing Case Management:', error);
            this.showError('Failed to initialize case management system');
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
        // Search input with debouncing
        let searchTimeout;
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filterCases();
            }, 300);
        });

        // Filter change events
        ['statusFilter', 'priorityFilter', 'categoryFilter', 'dateFilter'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.filterCases();
            });
        });
    }

    async loadAllData() {
        try {
            this.showLoading();
            await Promise.all([
                this.loadCases(),
                this.loadInvestigators()
            ]);
            this.hideLoading();
        } catch (error) {
            console.error('Error loading data:', error);
            this.hideLoading();
        }
    }

    async loadCases() {
        try {
            const casesSnapshot = await this.db
                .collection('grievance_cases')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('createdAt', 'desc')
                .get();

            this.cases = [];
            casesSnapshot.forEach(doc => {
                const caseData = doc.data();
                this.cases.push({
                    id: doc.id,
                    ...caseData
                });
            });

            this.filteredCases = [...this.cases];
        } catch (error) {
            console.error('Error loading cases:', error);
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
                    email: userData.email
                });
            });

            this.populateInvestigatorSelect();
        } catch (error) {
            console.error('Error loading investigators:', error);
        }
    }

    populateInvestigatorSelect() {
        const select = document.getElementById('caseAssignee');
        select.innerHTML = '<option value="">Select Investigator</option>';
        
        this.investigators.forEach(investigator => {
            const option = document.createElement('option');
            option.value = investigator.id;
            option.textContent = investigator.name;
            select.appendChild(option);
        });
    }

    filterCases() {
        const statusFilter = document.getElementById('statusFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        this.filteredCases = this.cases.filter(caseItem => {
            // Status filter
            if (statusFilter !== 'all' && caseItem.status !== statusFilter) {
                return false;
            }

            // Priority filter
            if (priorityFilter !== 'all' && caseItem.priority !== priorityFilter) {
                return false;
            }

            // Category filter
            if (categoryFilter !== 'all' && caseItem.category !== categoryFilter) {
                return false;
            }

            // Search filter
            if (searchTerm) {
                const searchableText = [
                    caseItem.caseId,
                    caseItem.title,
                    caseItem.description,
                    caseItem.category
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });

        this.currentPage = 1;
        this.renderCases();
    }

    renderCases() {
        const tableBody = document.getElementById('casesTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageCases = this.filteredCases.slice(startIndex, endIndex);

        if (pageCases.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="11" class="empty-state">
                        <i data-lucide="folder-open"></i>
                        <p>No cases found matching your criteria</p>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pageCases.map(caseItem => `
                <tr class="case-row case-${caseItem.status}">
                    <td>
                        <input type="checkbox" class="case-checkbox" value="${caseItem.id}" 
                               onchange="caseManagement.toggleCaseSelection('${caseItem.id}')">
                    </td>
                    <td>
                        <span class="case-id">${caseItem.caseId}</span>
                    </td>
                    <td>
                        <div class="case-title">
                            <strong>${caseItem.title}</strong>
                            <div class="case-description">${this.truncateText(caseItem.description, 100)}</div>
                        </div>
                    </td>
                    <td>
                        <span class="category-badge category-${caseItem.category}">
                            ${this.getCategoryDisplayName(caseItem.category)}
                        </span>
                    </td>
                    <td>
                        <span class="priority-badge priority-${caseItem.priority}">
                            ${caseItem.priority}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge status-${caseItem.status}">
                            ${this.getStatusDisplayName(caseItem.status)}
                        </span>
                    </td>
                    <td>
                        <div class="assignee-info">
                            ${this.getAssigneeName(caseItem.assignedTo)}
                        </div>
                    </td>
                    <td>
                        <div class="date-info">
                            <div class="date">${this.formatDate(caseItem.createdAt)}</div>
                            <div class="time">${this.formatTime(caseItem.createdAt)}</div>
                        </div>
                    </td>
                    <td>
                        <div class="date-info">
                            <div class="date">${this.formatDate(caseItem.updatedAt)}</div>
                            <div class="time">${this.formatTime(caseItem.updatedAt)}</div>
                        </div>
                    </td>
                    <td>
                        <span class="sla-badge ${this.getSLAClass(caseItem)}">
                            ${this.getSLAStatus(caseItem)}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-outline" onclick="caseManagement.viewCaseDetails('${caseItem.id}')">
                                <i data-lucide="eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="caseManagement.editCase('${caseItem.id}')">
                                <i data-lucide="edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="caseManagement.assignCase('${caseItem.id}')">
                                <i data-lucide="user-plus"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        this.updatePagination();
        this.updateSelectedCount();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredCases.length / this.itemsPerPage);
        const paginationInfo = document.getElementById('paginationInfo');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredCases.length);
        paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${this.filteredCases.length} cases`;

        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;
    }

    toggleCaseSelection(caseId) {
        if (this.selectedCases.has(caseId)) {
            this.selectedCases.delete(caseId);
        } else {
            this.selectedCases.add(caseId);
        }
        this.updateSelectedCount();
    }

    updateSelectedCount() {
        const selectedCount = this.selectedCases.size;
        const bulkActionsBtn = document.querySelector('.action-right .btn:last-child');
        
        if (selectedCount > 0) {
            bulkActionsBtn.innerHTML = `
                <i data-lucide="settings"></i>
                Bulk Actions (${selectedCount})
            `;
        } else {
            bulkActionsBtn.innerHTML = `
                <i data-lucide="settings"></i>
                Bulk Actions
            `;
        }
    }

    async saveNewCase() {
        try {
            const caseData = {
                title: document.getElementById('caseTitle').value,
                category: document.getElementById('caseCategory').value,
                priority: document.getElementById('casePriority').value,
                description: document.getElementById('caseDescription').value,
                notes: document.getElementById('caseNotes').value,
                workerId: document.getElementById('workerId').value,
                department: document.getElementById('department').value,
                assignedTo: document.getElementById('caseAssignee').value,
                status: 'new',
                factoryId: this.currentFactory,
                createdBy: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                caseId: this.generateCaseId()
            };

            await this.db.collection('grievance_cases').add(caseData);
            
            this.showSuccess('Case created successfully');
            this.closeModal('newCaseModal');
            this.resetForm();
            await this.loadCases();
            this.filterCases();
            this.updateHeaderStats();
        } catch (error) {
            console.error('Error creating case:', error);
            this.showError('Failed to create case');
        }
    }

    generateCaseId() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substr(2, 5);
        return `GC-${timestamp.slice(-6)}-${random.toUpperCase()}`;
    }

    resetForm() {
        document.getElementById('newCaseForm').reset();
    }

    updateHeaderStats() {
        const activeCases = this.cases.filter(c => c.status !== 'closed').length;
        const todayCases = this.cases.filter(c => this.isSameDay(c.createdAt.toDate(), new Date())).length;

        document.getElementById('activeCasesCount').textContent = activeCases;
        document.getElementById('todayCasesCount').textContent = todayCases;
        document.getElementById('avgResolutionTime').textContent = '5 days';
    }

    // Helper methods
    getCategoryDisplayName(category) {
        const categories = {
            'harassment': 'Harassment',
            'discrimination': 'Discrimination',
            'safety': 'Safety',
            'wages': 'Wages',
            'working_conditions': 'Working Conditions',
            'other': 'Other'
        };
        return categories[category] || category;
    }

    getStatusDisplayName(status) {
        const statuses = {
            'new': 'New',
            'assigned': 'Assigned',
            'investigating': 'Investigating',
            'resolved': 'Resolved',
            'closed': 'Closed'
        };
        return statuses[status] || status;
    }

    getAssigneeName(assigneeId) {
        if (!assigneeId) return 'Unassigned';
        const investigator = this.investigators.find(inv => inv.id === assigneeId);
        return investigator ? investigator.name : 'Unknown';
    }

    getSLAClass(caseItem) {
        return 'sla-good';
    }

    getSLAStatus(caseItem) {
        return 'On Track';
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }

    formatTime(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    // Modal management
    openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
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

    // Placeholder methods for future implementation
    viewCaseDetails(caseId) {
        alert('View case details: ' + caseId);
    }

    editCase(caseId) {
        alert('Edit case: ' + caseId);
    }

    assignCase(caseId) {
        alert('Assign case: ' + caseId);
    }
}

// Global functions
let caseManagement;

function openNewCaseModal() {
    caseManagement.openModal('newCaseModal');
}

function importCases() {
    alert('Import Cases feature coming soon');
}

function exportCases() {
    alert('Export Cases feature coming soon');
}

function refreshCases() {
    caseManagement.loadAllData();
}

function openBulkActions() {
    if (caseManagement.selectedCases.size === 0) {
        alert('Please select cases first');
        return;
    }
    caseManagement.openModal('bulkActionsModal');
}

function clearFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('priorityFilter').value = 'all';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('searchInput').value = '';
    caseManagement.filterCases();
}

function saveNewCase() {
    caseManagement.saveNewCase();
}

function closeModal(modalId) {
    caseManagement.closeModal(modalId);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    caseManagement = new CaseManagement();
    window.caseManagement = caseManagement;
    caseManagement.init();
});
