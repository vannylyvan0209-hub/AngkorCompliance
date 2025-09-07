// Requirement Management System for Super Admin

class RequirementManagement {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.requirements = [];
        this.filteredRequirements = [];
        this.selectedRequirement = null;
        this.controls = [];
        this.isNewRequirement = false;
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            await this.loadRequirements();
        } catch (error) {
            console.error('Error initializing Requirement Management:', error);
            this.showError('Failed to initialize requirement management');
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    try {
                        // Get user's role information
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.role === 'super_admin') {
                                resolve();
                            } else {
                                reject(new Error('Access denied. Super admin role required.'));
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
        // Search functionality
        document.getElementById('searchRequirements').addEventListener('input', (e) => {
            this.searchRequirements(e.target.value);
        });

        // Form submission
        document.getElementById('requirementManagementForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRequirement();
        });

        // Control form submission
        document.getElementById('controlForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addControlFromModal();
        });
    }

    async loadRequirements() {
        try {
            this.showLoading();
            
            const requirementsSnapshot = await this.db
                .collection('requirements')
                .orderBy('title')
                .get();

            this.requirements = [];
            requirementsSnapshot.forEach(doc => {
                const requirementData = doc.data();
                this.requirements.push({
                    id: doc.id,
                    ...requirementData,
                    createdAt: requirementData.createdAt?.toDate() || new Date(),
                    updatedAt: requirementData.updatedAt?.toDate() || new Date()
                });
            });

            this.filteredRequirements = [...this.requirements];
            this.updateRequirementsList();
            this.updateStatistics();
            
        } catch (error) {
            console.error('Error loading requirements:', error);
            this.showError('Failed to load requirements');
        } finally {
            this.hideLoading();
        }
    }

    updateRequirementsList() {
        const container = document.getElementById('requirementsContainer');
        
        if (this.filteredRequirements.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="list-check"></i>
                    <h3>No requirements found</h3>
                    <p>No requirements match the current filters</p>
                    <button class="btn btn-primary" onclick="addNewRequirement()">
                        <i data-lucide="plus"></i> Add First Requirement
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredRequirements.map(requirement => `
            <div class="requirement-item ${this.selectedRequirement?.id === requirement.id ? 'active' : ''}" 
                 onclick="selectRequirement('${requirement.id}')">
                <div class="requirement-icon">
                    <i data-lucide="${this.getRequirementIcon(requirement.category)}"></i>
                </div>
                <div class="requirement-info">
                    <div class="requirement-title">${requirement.title}</div>
                    <div class="requirement-details">
                        ${requirement.code} • ${this.getStandardName(requirement.standard)}
                    </div>
                    <div class="requirement-meta">
                        <span class="meta-tag tag-standard">${this.getStandardName(requirement.standard)}</span>
                        <span class="meta-tag tag-type">${requirement.type}</span>
                        <span class="meta-tag tag-priority">${requirement.priority}</span>
                        <span class="meta-tag tag-status">${requirement.status}</span>
                    </div>
                    <div class="requirement-status">
                        <div class="status-indicator status-${requirement.status}"></div>
                        <span>${requirement.controls?.length || 0} controls</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    updateStatistics() {
        const totalRequirements = this.requirements.length;
        const activeRequirements = this.requirements.filter(r => r.status === 'active').length;
        const mandatoryRequirements = this.requirements.filter(r => r.type === 'mandatory').length;
        const highPriorityRequirements = this.requirements.filter(r => r.priority === 'high').length;

        document.getElementById('totalRequirements').textContent = totalRequirements;
        document.getElementById('activeRequirements').textContent = activeRequirements;
        document.getElementById('mandatoryRequirements').textContent = mandatoryRequirements;
        document.getElementById('highPriorityRequirements').textContent = highPriorityRequirements;
    }

    selectRequirement(requirementId) {
        this.selectedRequirement = this.requirements.find(r => r.id === requirementId);
        if (!this.selectedRequirement) return;

        this.updateRequirementsList();
        this.loadRequirementDetails();
        this.showRequirementForm();
    }

    loadRequirementDetails() {
        if (!this.selectedRequirement) return;

        // Populate form fields
        document.getElementById('requirementTitle').value = this.selectedRequirement.title || '';
        document.getElementById('requirementCode').value = this.selectedRequirement.code || '';
        document.getElementById('requirementStandard').value = this.selectedRequirement.standard || '';
        document.getElementById('requirementCategory').value = this.selectedRequirement.category || '';
        document.getElementById('requirementDescription').value = this.selectedRequirement.description || '';
        document.getElementById('requirementType').value = this.selectedRequirement.type || '';
        document.getElementById('requirementPriority').value = this.selectedRequirement.priority || '';
        document.getElementById('requirementStatus').value = this.selectedRequirement.status || 'active';
        document.getElementById('complianceLevel').value = this.selectedRequirement.complianceLevel || '';
        document.getElementById('requiresEvidence').checked = this.selectedRequirement.requiresEvidence || false;
        document.getElementById('requiresTraining').checked = this.selectedRequirement.requiresTraining || false;
        document.getElementById('requiresDocumentation').checked = this.selectedRequirement.requiresDocumentation || false;
        document.getElementById('referenceDocument').value = this.selectedRequirement.referenceDocument || '';
        document.getElementById('guidanceUrl').value = this.selectedRequirement.guidanceUrl || '';
        document.getElementById('implementationNotes').value = this.selectedRequirement.implementationNotes || '';

        // Load controls
        this.controls = this.selectedRequirement.controls || [];
        this.updateControlsList();
    }

    updateControlsList() {
        const controlsList = document.getElementById('controlsList');
        
        if (this.controls.length === 0) {
            controlsList.innerHTML = `
                <div class="empty-state" style="padding: var(--space-4);">
                    <i data-lucide="shield"></i>
                    <h4>No controls</h4>
                    <p>Add controls to this requirement</p>
                </div>
            `;
            return;
        }

        controlsList.innerHTML = this.controls.map((control, index) => `
            <div class="control-item">
                <div class="control-info">
                    <div class="control-title">${control.title}</div>
                    <div class="control-description">${control.description || 'No description'}</div>
                    <div class="requirement-meta">
                        <span class="meta-tag tag-type">${control.type}</span>
                        <span class="meta-tag tag-priority">${control.frequency}</span>
                    </div>
                </div>
                <div class="control-actions">
                    <button class="btn btn-sm btn-outline" onclick="editControl(${index})">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="removeControl(${index})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    showRequirementForm() {
        document.getElementById('noRequirementSelected').style.display = 'none';
        document.getElementById('requirementForm').style.display = 'block';
    }

    addNewRequirement() {
        this.isNewRequirement = true;
        this.selectedRequirement = null;
        this.controls = [];
        
        // Clear form
        document.getElementById('requirementManagementForm').reset();
        
        // Set default values
        document.getElementById('requirementStatus').value = 'draft';
        
        // Update UI
        this.updateRequirementsList();
        this.updateControlsList();
        this.showRequirementForm();
        
        // Update form header
        document.querySelector('.form-header h3').innerHTML = '<i data-lucide="plus"></i> New Requirement';
    }

    async saveRequirement() {
        try {
            this.showLoading();

            const formData = this.collectFormData();
            
            if (this.isNewRequirement) {
                // Create new requirement
                const docRef = await this.db.collection('requirements').add({
                    ...formData,
                    controls: this.controls,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    createdBy: this.currentUser.uid,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: this.currentUser.uid
                });
                
                this.selectedRequirement = { id: docRef.id, ...formData };
                this.isNewRequirement = false;
                
            } else {
                // Update existing requirement
                await this.db.collection('requirements').doc(this.selectedRequirement.id).update({
                    ...formData,
                    controls: this.controls,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: this.currentUser.uid
                });
            }

            // Update form header
            document.querySelector('.form-header h3').innerHTML = '<i data-lucide="edit"></i> Edit Requirement';
            
            await this.loadRequirements();
            this.showSuccess('Requirement saved successfully');

        } catch (error) {
            console.error('Error saving requirement:', error);
            this.showError('Failed to save requirement');
        } finally {
            this.hideLoading();
        }
    }

    collectFormData() {
        return {
            title: document.getElementById('requirementTitle').value.trim(),
            code: document.getElementById('requirementCode').value.trim(),
            standard: document.getElementById('requirementStandard').value,
            category: document.getElementById('requirementCategory').value,
            description: document.getElementById('requirementDescription').value.trim(),
            type: document.getElementById('requirementType').value,
            priority: document.getElementById('requirementPriority').value,
            status: document.getElementById('requirementStatus').value,
            complianceLevel: document.getElementById('complianceLevel').value,
            requiresEvidence: document.getElementById('requiresEvidence').checked,
            requiresTraining: document.getElementById('requiresTraining').checked,
            requiresDocumentation: document.getElementById('requiresDocumentation').checked,
            referenceDocument: document.getElementById('referenceDocument').value.trim(),
            guidanceUrl: document.getElementById('guidanceUrl').value.trim(),
            implementationNotes: document.getElementById('implementationNotes').value.trim()
        };
    }

    searchRequirements(query) {
        if (!query.trim()) {
            this.filteredRequirements = [...this.requirements];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredRequirements = this.requirements.filter(requirement => 
                requirement.title.toLowerCase().includes(searchTerm) ||
                requirement.code.toLowerCase().includes(searchTerm) ||
                requirement.description?.toLowerCase().includes(searchTerm)
            );
        }
        this.updateRequirementsList();
    }

    filterRequirements() {
        const standardFilter = document.getElementById('standardFilter').value;
        
        if (!standardFilter) {
            this.filteredRequirements = [...this.requirements];
        } else {
            this.filteredRequirements = this.requirements.filter(requirement => 
                requirement.standard === standardFilter
            );
        }
        this.updateRequirementsList();
    }

    applyFilters() {
        const typeFilter = document.getElementById('typeFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;

        this.filteredRequirements = this.requirements.filter(requirement => {
            // Type filter
            if (typeFilter && requirement.type !== typeFilter) return false;
            
            // Priority filter
            if (priorityFilter && requirement.priority !== priorityFilter) return false;
            
            // Status filter
            if (statusFilter && requirement.status !== statusFilter) return false;
            
            // Category filter
            if (categoryFilter && requirement.category !== categoryFilter) return false;
            
            return true;
        });

        this.updateRequirementsList();
    }

    clearFilters() {
        document.getElementById('typeFilter').value = '';
        document.getElementById('priorityFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('standardFilter').value = '';
        
        this.filteredRequirements = [...this.requirements];
        this.updateRequirementsList();
    }

    addControl() {
        // Show modal
        document.getElementById('controlModal').style.display = 'block';
        document.getElementById('controlForm').reset();
    }

    addControlFromModal() {
        const title = document.getElementById('controlTitle').value.trim();
        const description = document.getElementById('controlDescription').value.trim();
        const type = document.getElementById('controlType').value;
        const frequency = document.getElementById('controlFrequency').value;

        if (!title) {
            this.showError('Control title is required');
            return;
        }

        const control = {
            title,
            description,
            type,
            frequency,
            id: Date.now().toString() // Simple ID for now
        };

        this.controls.push(control);
        this.updateControlsList();
        this.closeModal('controlModal');
        this.showSuccess('Control added successfully');
    }

    editControl(index) {
        const control = this.controls[index];
        if (!control) return;

        // Populate modal
        document.getElementById('controlTitle').value = control.title;
        document.getElementById('controlDescription').value = control.description || '';
        document.getElementById('controlType').value = control.type;
        document.getElementById('controlFrequency').value = control.frequency;

        // Show modal
        document.getElementById('controlModal').style.display = 'block';
        
        // Update modal title and button
        document.querySelector('#controlModal .modal-header h3').innerHTML = '<i data-lucide="edit"></i> Edit Control';
        document.querySelector('#controlModal button[type="submit"]').innerHTML = '<i data-lucide="save"></i> Update Control';
        
        // Store index for update
        this.editingControlIndex = index;
    }

    removeControl(index) {
        if (confirm('Are you sure you want to remove this control?')) {
            this.controls.splice(index, 1);
            this.updateControlsList();
            this.showSuccess('Control removed successfully');
        }
    }

    duplicateRequirement() {
        if (!this.selectedRequirement) return;

        this.isNewRequirement = true;
        this.selectedRequirement = null;
        
        // Copy form data
        const originalData = this.collectFormData();
        const controls = [...this.controls];
        
        // Clear form and set copied data
        document.getElementById('requirementManagementForm').reset();
        
        // Set copied values
        document.getElementById('requirementTitle').value = `${originalData.title} (Copy)`;
        document.getElementById('requirementCode').value = `${originalData.code}_COPY`;
        document.getElementById('requirementStandard').value = originalData.standard;
        document.getElementById('requirementCategory').value = originalData.category;
        document.getElementById('requirementDescription').value = originalData.description;
        document.getElementById('requirementType').value = originalData.type;
        document.getElementById('requirementPriority').value = originalData.priority;
        document.getElementById('requirementStatus').value = 'draft';
        document.getElementById('complianceLevel').value = originalData.complianceLevel;
        document.getElementById('requiresEvidence').checked = originalData.requiresEvidence;
        document.getElementById('requiresTraining').checked = originalData.requiresTraining;
        document.getElementById('requiresDocumentation').checked = originalData.requiresDocumentation;
        document.getElementById('referenceDocument').value = originalData.referenceDocument;
        document.getElementById('guidanceUrl').value = originalData.guidanceUrl;
        document.getElementById('implementationNotes').value = originalData.implementationNotes;

        // Copy controls
        this.controls = controls;
        this.updateControlsList();
        
        // Update UI
        document.querySelector('.form-header h3').innerHTML = '<i data-lucide="copy"></i> Duplicate Requirement';
        this.showRequirementForm();
    }

    async deleteRequirement() {
        if (!this.selectedRequirement || this.isNewRequirement) return;

        if (confirm('Are you sure you want to delete this requirement? This action cannot be undone.')) {
            try {
                this.showLoading();
                
                await this.db.collection('requirements').doc(this.selectedRequirement.id).delete();
                
                this.selectedRequirement = null;
                this.controls = [];
                this.updateRequirementsList();
                this.updateControlsList();
                this.showRequirementForm();
                
                await this.loadRequirements();
                this.showSuccess('Requirement deleted successfully');

            } catch (error) {
                console.error('Error deleting requirement:', error);
                this.showError('Failed to delete requirement');
            } finally {
                this.hideLoading();
            }
        }
    }

    resetForm() {
        if (confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')) {
            if (this.selectedRequirement) {
                this.loadRequirementDetails();
            } else {
                document.getElementById('requirementManagementForm').reset();
                this.controls = [];
                this.updateControlsList();
            }
        }
    }

    async exportRequirements() {
        try {
            const exportData = {
                requirements: this.requirements.map(requirement => ({
                    id: requirement.id,
                    title: requirement.title,
                    code: requirement.code,
                    standard: requirement.standard,
                    category: requirement.category,
                    description: requirement.description,
                    type: requirement.type,
                    priority: requirement.priority,
                    status: requirement.status,
                    complianceLevel: requirement.complianceLevel,
                    controls: requirement.controls || [],
                    referenceDocument: requirement.referenceDocument,
                    guidanceUrl: requirement.guidanceUrl,
                    implementationNotes: requirement.implementationNotes,
                    createdAt: requirement.createdAt,
                    updatedAt: requirement.updatedAt
                })),
                exportedAt: new Date().toISOString(),
                exportedBy: this.currentUser.email
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `requirements_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);

            this.showSuccess('Requirements exported successfully');

        } catch (error) {
            console.error('Error exporting requirements:', error);
            this.showError('Failed to export requirements');
        }
    }

    // Helper methods
    getRequirementIcon(category) {
        const icons = {
            'quality': 'check-circle',
            'environmental': 'leaf',
            'safety': 'shield',
            'social': 'users',
            'organic': 'sprout'
        };
        return icons[category] || 'list-check';
    }

    getStandardName(standard) {
        const standards = {
            'iso9001': 'ISO 9001',
            'iso14001': 'ISO 14001',
            'iso45001': 'ISO 45001',
            'sa8000': 'SA 8000',
            'bsci': 'BSCI',
            'sedex': 'Sedex',
            'wrap': 'WRAP',
            'fairtrade': 'Fairtrade',
            'organic': 'Organic',
            'gots': 'GOTS'
        };
        return standards[standard] || standard;
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        
        // Reset modal form
        if (modalId === 'controlModal') {
            document.getElementById('controlForm').reset();
            document.querySelector('#controlModal .modal-header h3').innerHTML = '<i data-lucide="shield"></i> Add Control';
            document.querySelector('#controlModal button[type="submit"]').innerHTML = '<i data-lucide="plus"></i> Add Control';
            this.editingControlIndex = null;
        }
    }

    showLoading() {
        // Add loading indicator
        const saveButton = document.querySelector('button[type="submit"]');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = '<i data-lucide="loader-2"></i> Saving...';
        }
    }

    hideLoading() {
        // Remove loading indicator
        const saveButton = document.querySelector('button[type="submit"]');
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i data-lucide="save"></i> Save Requirement';
        }
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
let requirementManagement;

function selectRequirement(requirementId) {
    requirementManagement.selectRequirement(requirementId);
}

function searchRequirements() {
    const query = document.getElementById('searchRequirements').value;
    requirementManagement.searchRequirements(query);
}

function filterRequirements() {
    requirementManagement.filterRequirements();
}

function applyFilters() {
    requirementManagement.applyFilters();
}

function clearFilters() {
    requirementManagement.clearFilters();
}

function addNewRequirement() {
    requirementManagement.addNewRequirement();
}

function addControl() {
    requirementManagement.addControl();
}

function editControl(index) {
    requirementManagement.editControl(index);
}

function removeControl(index) {
    requirementManagement.removeControl(index);
}

function duplicateRequirement() {
    requirementManagement.duplicateRequirement();
}

function deleteRequirement() {
    requirementManagement.deleteRequirement();
}

function resetForm() {
    requirementManagement.resetForm();
}

function exportRequirements() {
    requirementManagement.exportRequirements();
}

function closeModal(modalId) {
    requirementManagement.closeModal(modalId);
}

function bulkImport() {
    alert('Bulk Import feature coming soon');
}

function generateChecklist() {
    alert('Generate Checklist feature coming soon');
}

function requirementAnalytics() {
    alert('Requirement Analytics feature coming soon');
}

function standardMapping() {
    alert('Standard Mapping feature coming soon');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    requirementManagement = new RequirementManagement();
    window.requirementManagement = requirementManagement;
    requirementManagement.init();
});
