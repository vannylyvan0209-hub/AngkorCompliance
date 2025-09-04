import { initializeFirebase } from '../../firebase-config.js';

class StandardConfiguration {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.standards = [];
        this.filteredStandards = [];
        this.selectedStandard = null;
        this.requirements = [];
        this.isNewStandard = false;
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            await this.loadStandards();
        } catch (error) {
            console.error('Error initializing Standard Configuration:', error);
            this.showError('Failed to initialize standard configuration');
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
        document.getElementById('searchStandards').addEventListener('input', (e) => {
            this.searchStandards(e.target.value);
        });

        // Form submission
        document.getElementById('standardConfigurationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStandard();
        });

        // Requirement form submission
        document.getElementById('requirementForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addRequirementFromModal();
        });
    }

    async loadStandards() {
        try {
            this.showLoading();
            
            const standardsSnapshot = await this.db
                .collection('compliance_standards')
                .orderBy('name')
                .get();

            this.standards = [];
            standardsSnapshot.forEach(doc => {
                const standardData = doc.data();
                this.standards.push({
                    id: doc.id,
                    ...standardData,
                    createdAt: standardData.createdAt?.toDate() || new Date(),
                    updatedAt: standardData.updatedAt?.toDate() || new Date()
                });
            });

            this.filteredStandards = [...this.standards];
            this.updateStandardsList();
            
        } catch (error) {
            console.error('Error loading standards:', error);
            this.showError('Failed to load standards');
        } finally {
            this.hideLoading();
        }
    }

    updateStandardsList() {
        const container = document.getElementById('standardsContainer');
        
        if (this.filteredStandards.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="shield"></i>
                    <h3>No standards found</h3>
                    <p>No standards match the current filters</p>
                    <button class="btn btn-primary" onclick="addNewStandard()">
                        <i data-lucide="plus"></i> Add First Standard
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredStandards.map(standard => `
            <div class="standard-item ${this.selectedStandard?.id === standard.id ? 'active' : ''}" 
                 onclick="selectStandard('${standard.id}')">
                <div class="standard-icon">
                    <i data-lucide="${this.getStandardIcon(standard.category)}"></i>
                </div>
                <div class="standard-info">
                    <div class="standard-name">${standard.name}</div>
                    <div class="standard-details">
                        ${standard.code} • ${this.getCategoryName(standard.category)}
                    </div>
                    <div class="standard-meta">
                        <div class="version-info">
                            <span class="version-badge">v${standard.version}</span>
                            <span>${standard.certificationBody || 'No cert body'}</span>
                        </div>
                        <div class="meta-item">
                            <i data-lucide="list-check"></i>
                            <span>${standard.requirements?.length || 0} requirements</span>
                        </div>
                    </div>
                </div>
                <div>
                    <span class="standard-status status-${standard.status || 'active'}">
                        ${(standard.status || 'active').charAt(0).toUpperCase() + (standard.status || 'active').slice(1)}
                    </span>
                </div>
            </div>
        `).join('');

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    selectStandard(standardId) {
        this.selectedStandard = this.standards.find(s => s.id === standardId);
        if (!this.selectedStandard) return;

        this.updateStandardsList();
        this.loadStandardDetails();
        this.showStandardForm();
    }

    loadStandardDetails() {
        if (!this.selectedStandard) return;

        // Populate form fields
        document.getElementById('standardName').value = this.selectedStandard.name || '';
        document.getElementById('standardCode').value = this.selectedStandard.code || '';
        document.getElementById('standardCategory').value = this.selectedStandard.category || '';
        document.getElementById('standardVersion').value = this.selectedStandard.version || '';
        document.getElementById('standardDescription').value = this.selectedStandard.description || '';
        document.getElementById('standardStatus').value = this.selectedStandard.status || 'active';
        document.getElementById('auditFrequency').value = this.selectedStandard.auditFrequency || '';
        document.getElementById('certificationBody').value = this.selectedStandard.certificationBody || '';
        document.getElementById('validityPeriod').value = this.selectedStandard.validityPeriod || '';
        document.getElementById('requiresTraining').checked = this.selectedStandard.requiresTraining || false;
        document.getElementById('requiresDocumentation').checked = this.selectedStandard.requiresDocumentation || false;
        document.getElementById('requiresAudit').checked = this.selectedStandard.requiresAudit || false;
        document.getElementById('officialWebsite').value = this.selectedStandard.officialWebsite || '';
        document.getElementById('documentationUrl').value = this.selectedStandard.documentationUrl || '';
        document.getElementById('additionalNotes').value = this.selectedStandard.additionalNotes || '';

        // Load requirements
        this.requirements = this.selectedStandard.requirements || [];
        this.updateRequirementsList();
    }

    updateRequirementsList() {
        const requirementsList = document.getElementById('requirementsList');
        
        if (this.requirements.length === 0) {
            requirementsList.innerHTML = `
                <div class="empty-state" style="padding: var(--space-4);">
                    <i data-lucide="list-check"></i>
                    <h4>No requirements</h4>
                    <p>Add requirements to this standard</p>
                </div>
            `;
            return;
        }

        requirementsList.innerHTML = this.requirements.map((requirement, index) => `
            <div class="requirement-item">
                <div class="requirement-info">
                    <div class="requirement-title">${requirement.title}</div>
                    <div class="requirement-description">${requirement.description || 'No description'}</div>
                    <div class="standard-meta">
                        <div class="meta-item">
                            <span class="category-tag">${requirement.type}</span>
                        </div>
                        <div class="meta-item">
                            <span class="category-tag">${requirement.priority}</span>
                        </div>
                    </div>
                </div>
                <div class="requirement-actions">
                    <button class="btn btn-sm btn-outline" onclick="editRequirement(${index})">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="removeRequirement(${index})">
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

    showStandardForm() {
        document.getElementById('noStandardSelected').style.display = 'none';
        document.getElementById('standardForm').style.display = 'block';
    }

    addNewStandard() {
        this.isNewStandard = true;
        this.selectedStandard = null;
        this.requirements = [];
        
        // Clear form
        document.getElementById('standardConfigurationForm').reset();
        
        // Set default values
        document.getElementById('standardStatus').value = 'draft';
        
        // Update UI
        this.updateStandardsList();
        this.updateRequirementsList();
        this.showStandardForm();
        
        // Update form header
        document.querySelector('.form-header h3').innerHTML = '<i data-lucide="plus"></i> New Standard';
    }

    async saveStandard() {
        try {
            this.showLoading();

            const formData = this.collectFormData();
            
            if (this.isNewStandard) {
                // Create new standard
                const docRef = await this.db.collection('compliance_standards').add({
                    ...formData,
                    requirements: this.requirements,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    createdBy: this.currentUser.uid,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: this.currentUser.uid
                });
                
                this.selectedStandard = { id: docRef.id, ...formData };
                this.isNewStandard = false;
                
            } else {
                // Update existing standard
                await this.db.collection('compliance_standards').doc(this.selectedStandard.id).update({
                    ...formData,
                    requirements: this.requirements,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: this.currentUser.uid
                });
            }

            // Update form header
            document.querySelector('.form-header h3').innerHTML = '<i data-lucide="edit"></i> Edit Standard';
            
            await this.loadStandards();
            this.showSuccess('Standard saved successfully');

        } catch (error) {
            console.error('Error saving standard:', error);
            this.showError('Failed to save standard');
        } finally {
            this.hideLoading();
        }
    }

    collectFormData() {
        return {
            name: document.getElementById('standardName').value.trim(),
            code: document.getElementById('standardCode').value.trim(),
            category: document.getElementById('standardCategory').value,
            version: document.getElementById('standardVersion').value.trim(),
            description: document.getElementById('standardDescription').value.trim(),
            status: document.getElementById('standardStatus').value,
            auditFrequency: document.getElementById('auditFrequency').value,
            certificationBody: document.getElementById('certificationBody').value.trim(),
            validityPeriod: parseInt(document.getElementById('validityPeriod').value) || null,
            requiresTraining: document.getElementById('requiresTraining').checked,
            requiresDocumentation: document.getElementById('requiresDocumentation').checked,
            requiresAudit: document.getElementById('requiresAudit').checked,
            officialWebsite: document.getElementById('officialWebsite').value.trim(),
            documentationUrl: document.getElementById('documentationUrl').value.trim(),
            additionalNotes: document.getElementById('additionalNotes').value.trim()
        };
    }

    searchStandards(query) {
        if (!query.trim()) {
            this.filteredStandards = [...this.standards];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredStandards = this.standards.filter(standard => 
                standard.name.toLowerCase().includes(searchTerm) ||
                standard.code.toLowerCase().includes(searchTerm) ||
                standard.description?.toLowerCase().includes(searchTerm)
            );
        }
        this.updateStandardsList();
    }

    filterStandards() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        if (!categoryFilter) {
            this.filteredStandards = [...this.standards];
        } else {
            this.filteredStandards = this.standards.filter(standard => 
                standard.category === categoryFilter
            );
        }
        this.updateStandardsList();
    }

    addRequirement() {
        // Show modal
        document.getElementById('requirementModal').style.display = 'block';
        document.getElementById('requirementForm').reset();
    }

    addRequirementFromModal() {
        const title = document.getElementById('requirementTitle').value.trim();
        const description = document.getElementById('requirementDescription').value.trim();
        const type = document.getElementById('requirementType').value;
        const priority = document.getElementById('requirementPriority').value;

        if (!title) {
            this.showError('Requirement title is required');
            return;
        }

        const requirement = {
            title,
            description,
            type,
            priority,
            id: Date.now().toString() // Simple ID for now
        };

        this.requirements.push(requirement);
        this.updateRequirementsList();
        this.closeModal('requirementModal');
        this.showSuccess('Requirement added successfully');
    }

    editRequirement(index) {
        const requirement = this.requirements[index];
        if (!requirement) return;

        // Populate modal
        document.getElementById('requirementTitle').value = requirement.title;
        document.getElementById('requirementDescription').value = requirement.description || '';
        document.getElementById('requirementType').value = requirement.type;
        document.getElementById('requirementPriority').value = requirement.priority;

        // Show modal
        document.getElementById('requirementModal').style.display = 'block';
        
        // Update modal title and button
        document.querySelector('#requirementModal .modal-header h3').innerHTML = '<i data-lucide="edit"></i> Edit Requirement';
        document.querySelector('#requirementModal button[type="submit"]').innerHTML = '<i data-lucide="save"></i> Update Requirement';
        
        // Store index for update
        this.editingRequirementIndex = index;
    }

    removeRequirement(index) {
        if (confirm('Are you sure you want to remove this requirement?')) {
            this.requirements.splice(index, 1);
            this.updateRequirementsList();
            this.showSuccess('Requirement removed successfully');
        }
    }

    duplicateStandard() {
        if (!this.selectedStandard) return;

        this.isNewStandard = true;
        this.selectedStandard = null;
        
        // Copy form data
        const originalData = this.collectFormData();
        const requirements = [...this.requirements];
        
        // Clear form and set copied data
        document.getElementById('standardConfigurationForm').reset();
        
        // Set copied values
        document.getElementById('standardName').value = `${originalData.name} (Copy)`;
        document.getElementById('standardCode').value = `${originalData.code}_COPY`;
        document.getElementById('standardCategory').value = originalData.category;
        document.getElementById('standardVersion').value = originalData.version;
        document.getElementById('standardDescription').value = originalData.description;
        document.getElementById('standardStatus').value = 'draft';
        document.getElementById('auditFrequency').value = originalData.auditFrequency;
        document.getElementById('certificationBody').value = originalData.certificationBody;
        document.getElementById('validityPeriod').value = originalData.validityPeriod;
        document.getElementById('requiresTraining').checked = originalData.requiresTraining;
        document.getElementById('requiresDocumentation').checked = originalData.requiresDocumentation;
        document.getElementById('requiresAudit').checked = originalData.requiresAudit;
        document.getElementById('officialWebsite').value = originalData.officialWebsite;
        document.getElementById('documentationUrl').value = originalData.documentationUrl;
        document.getElementById('additionalNotes').value = originalData.additionalNotes;

        // Copy requirements
        this.requirements = requirements;
        this.updateRequirementsList();
        
        // Update UI
        document.querySelector('.form-header h3').innerHTML = '<i data-lucide="copy"></i> Duplicate Standard';
        this.showStandardForm();
    }

    async deleteStandard() {
        if (!this.selectedStandard || this.isNewStandard) return;

        if (confirm('Are you sure you want to delete this standard? This action cannot be undone.')) {
            try {
                this.showLoading();
                
                await this.db.collection('compliance_standards').doc(this.selectedStandard.id).delete();
                
                this.selectedStandard = null;
                this.requirements = [];
                this.updateStandardsList();
                this.updateRequirementsList();
                this.showStandardForm();
                
                await this.loadStandards();
                this.showSuccess('Standard deleted successfully');

            } catch (error) {
                console.error('Error deleting standard:', error);
                this.showError('Failed to delete standard');
            } finally {
                this.hideLoading();
            }
        }
    }

    resetForm() {
        if (confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')) {
            if (this.selectedStandard) {
                this.loadStandardDetails();
            } else {
                document.getElementById('standardConfigurationForm').reset();
                this.requirements = [];
                this.updateRequirementsList();
            }
        }
    }

    async exportStandards() {
        try {
            const exportData = {
                standards: this.standards.map(standard => ({
                    id: standard.id,
                    name: standard.name,
                    code: standard.code,
                    category: standard.category,
                    version: standard.version,
                    description: standard.description,
                    status: standard.status,
                    auditFrequency: standard.auditFrequency,
                    certificationBody: standard.certificationBody,
                    validityPeriod: standard.validityPeriod,
                    requirements: standard.requirements || [],
                    officialWebsite: standard.officialWebsite,
                    documentationUrl: standard.documentationUrl,
                    additionalNotes: standard.additionalNotes,
                    createdAt: standard.createdAt,
                    updatedAt: standard.updatedAt
                })),
                exportedAt: new Date().toISOString(),
                exportedBy: this.currentUser.email
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compliance_standards_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);

            this.showSuccess('Standards exported successfully');

        } catch (error) {
            console.error('Error exporting standards:', error);
            this.showError('Failed to export standards');
        }
    }

    // Helper methods
    getStandardIcon(category) {
        const icons = {
            'quality': 'check-circle',
            'environmental': 'leaf',
            'safety': 'shield',
            'social': 'users',
            'organic': 'sprout'
        };
        return icons[category] || 'shield';
    }

    getCategoryName(category) {
        const categories = {
            'quality': 'Quality Management',
            'environmental': 'Environmental',
            'safety': 'Health & Safety',
            'social': 'Social Accountability',
            'organic': 'Organic & Fair Trade'
        };
        return categories[category] || category;
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        
        // Reset modal form
        if (modalId === 'requirementModal') {
            document.getElementById('requirementForm').reset();
            document.querySelector('#requirementModal .modal-header h3').innerHTML = '<i data-lucide="list-check"></i> Add Requirement';
            document.querySelector('#requirementModal button[type="submit"]').innerHTML = '<i data-lucide="plus"></i> Add Requirement';
            this.editingRequirementIndex = null;
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
            saveButton.innerHTML = '<i data-lucide="save"></i> Save Standard';
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
let standardConfiguration;

function selectStandard(standardId) {
    standardConfiguration.selectStandard(standardId);
}

function searchStandards() {
    const query = document.getElementById('searchStandards').value;
    standardConfiguration.searchStandards(query);
}

function filterStandards() {
    standardConfiguration.filterStandards();
}

function addNewStandard() {
    standardConfiguration.addNewStandard();
}

function addRequirement() {
    standardConfiguration.addRequirement();
}

function editRequirement(index) {
    standardConfiguration.editRequirement(index);
}

function removeRequirement(index) {
    standardConfiguration.removeRequirement(index);
}

function duplicateStandard() {
    standardConfiguration.duplicateStandard();
}

function deleteStandard() {
    standardConfiguration.deleteStandard();
}

function resetForm() {
    standardConfiguration.resetForm();
}

function exportStandards() {
    standardConfiguration.exportStandards();
}

function closeModal(modalId) {
    standardConfiguration.closeModal(modalId);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    standardConfiguration = new StandardConfiguration();
    window.standardConfiguration = standardConfiguration;
    standardConfiguration.init();
});
