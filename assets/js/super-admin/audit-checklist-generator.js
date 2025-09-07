// Audit Checklist Generator for Super Admin

class AuditChecklistGenerator {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.standards = [];
        this.requirements = [];
        this.selectedStandards = [];
        this.selectedRequirements = [];
        this.generatedChecklist = [];
        this.templates = [];
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            await this.loadStandards();
            await this.loadRequirements();
            await this.loadTemplates();
            this.updateStatistics();
        } catch (error) {
            console.error('Error initializing Audit Checklist Generator:', error);
            this.showError('Failed to initialize checklist generator');
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
        // Standard selection
        document.querySelectorAll('.standard-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleStandardSelection(e.target);
            });
        });

        // Form submission
        document.getElementById('checklistBuilderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateChecklist();
        });

        // Requirement filter
        document.getElementById('requirementFilter').addEventListener('change', (e) => {
            this.filterRequirements();
        });
    }

    async loadStandards() {
        try {
            const standardsSnapshot = await this.db
                .collection('compliance_standards')
                .where('status', '==', 'active')
                .orderBy('name')
                .get();

            this.standards = [];
            standardsSnapshot.forEach(doc => {
                const standardData = doc.data();
                this.standards.push({
                    id: doc.id,
                    ...standardData
                });
            });
        } catch (error) {
            console.error('Error loading standards:', error);
        }
    }

    async loadRequirements() {
        try {
            const requirementsSnapshot = await this.db
                .collection('requirements')
                .where('status', '==', 'active')
                .orderBy('title')
                .get();

            this.requirements = [];
            requirementsSnapshot.forEach(doc => {
                const requirementData = doc.data();
                this.requirements.push({
                    id: doc.id,
                    ...requirementData
                });
            });
        } catch (error) {
            console.error('Error loading requirements:', error);
        }
    }

    async loadTemplates() {
        try {
            const templatesSnapshot = await this.db
                .collection('checklist_templates')
                .orderBy('name')
                .get();

            this.templates = [];
            templatesSnapshot.forEach(doc => {
                const templateData = doc.data();
                this.templates.push({
                    id: doc.id,
                    ...templateData
                });
            });

            this.updateStatistics();
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    handleStandardSelection(checkbox) {
        const standardId = checkbox.value;
        
        if (checkbox.checked) {
            this.selectedStandards.push(standardId);
            checkbox.closest('.standard-item').classList.add('selected');
        } else {
            this.selectedStandards = this.selectedStandards.filter(id => id !== standardId);
            checkbox.closest('.standard-item').classList.remove('selected');
        }

        this.updateRequirementsPreview();
    }

    updateRequirementsPreview() {
        const previewContainer = document.getElementById('requirementsPreview');
        
        if (this.selectedStandards.length === 0) {
            previewContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="list-check"></i>
                    <h4>No requirements selected</h4>
                    <p>Select standards above to see requirements</p>
                </div>
            `;
            return;
        }

        // Filter requirements based on selected standards
        const filteredRequirements = this.requirements.filter(requirement => 
            this.selectedStandards.includes(requirement.standard)
        );

        if (filteredRequirements.length === 0) {
            previewContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="list-check"></i>
                    <h4>No requirements found</h4>
                    <p>No requirements available for selected standards</p>
                </div>
            `;
            return;
        }

        previewContainer.innerHTML = filteredRequirements.map(requirement => `
            <div class="requirement-item">
                <input type="checkbox" class="requirement-checkbox" 
                       id="req_${requirement.id}" 
                       value="${requirement.id}"
                       ${this.selectedRequirements.includes(requirement.id) ? 'checked' : ''}
                       onchange="toggleRequirementSelection('${requirement.id}')">
                <div class="requirement-info">
                    <div class="requirement-title">${requirement.title}</div>
                    <div class="requirement-details">${requirement.description || 'No description'}</div>
                    <div class="requirement-meta">
                        <span class="meta-tag tag-type">${requirement.type}</span>
                        <span class="meta-tag tag-priority">${requirement.priority}</span>
                        <span class="meta-tag tag-category">${this.getStandardName(requirement.standard)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    toggleRequirementSelection(requirementId) {
        const index = this.selectedRequirements.indexOf(requirementId);
        if (index > -1) {
            this.selectedRequirements.splice(index, 1);
        } else {
            this.selectedRequirements.push(requirementId);
        }
    }

    filterRequirements() {
        const filter = document.getElementById('requirementFilter').value;
        const previewContainer = document.getElementById('requirementsPreview');
        
        let filteredRequirements = this.requirements.filter(requirement => 
            this.selectedStandards.includes(requirement.standard)
        );

        // Apply additional filters
        switch (filter) {
            case 'mandatory':
                filteredRequirements = filteredRequirements.filter(req => req.type === 'mandatory');
                break;
            case 'high-priority':
                filteredRequirements = filteredRequirements.filter(req => req.priority === 'high');
                break;
            case 'active':
                filteredRequirements = filteredRequirements.filter(req => req.status === 'active');
                break;
        }

        if (filteredRequirements.length === 0) {
            previewContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="list-check"></i>
                    <h4>No requirements found</h4>
                    <p>No requirements match the current filter</p>
                </div>
            `;
            return;
        }

        previewContainer.innerHTML = filteredRequirements.map(requirement => `
            <div class="requirement-item">
                <input type="checkbox" class="requirement-checkbox" 
                       id="req_${requirement.id}" 
                       value="${requirement.id}"
                       ${this.selectedRequirements.includes(requirement.id) ? 'checked' : ''}
                       onchange="toggleRequirementSelection('${requirement.id}')">
                <div class="requirement-info">
                    <div class="requirement-title">${requirement.title}</div>
                    <div class="requirement-details">${requirement.description || 'No description'}</div>
                    <div class="requirement-meta">
                        <span class="meta-tag tag-type">${requirement.type}</span>
                        <span class="meta-tag tag-priority">${requirement.priority}</span>
                        <span class="meta-tag tag-category">${this.getStandardName(requirement.standard)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    generateChecklist() {
        try {
            this.showLoading();

            const formData = this.collectFormData();
            
            if (this.selectedRequirements.length === 0) {
                this.showError('Please select at least one requirement');
                return;
            }

            // Generate checklist items
            this.generatedChecklist = this.selectedRequirements.map((requirementId, index) => {
                const requirement = this.requirements.find(r => r.id === requirementId);
                if (!requirement) return null;

                return {
                    id: `item_${index + 1}`,
                    number: index + 1,
                    requirement: requirement,
                    question: this.generateQuestion(requirement, formData.questionFormat),
                    guidance: formData.includeGuidance ? requirement.implementationNotes || 'No guidance available' : null,
                    evidence: formData.includeEvidence ? 'Documentation, records, and evidence required' : null,
                    risk: formData.includeRisk ? this.assessRisk(requirement) : null,
                    corrective: formData.includeCorrective ? 'Corrective action required if non-compliant' : null,
                    options: this.generateOptions(formData.questionFormat)
                };
            }).filter(item => item !== null);

            this.updateChecklistPreview();
            this.updateChecklistSummary();
            this.showSuccess('Checklist generated successfully');

        } catch (error) {
            console.error('Error generating checklist:', error);
            this.showError('Failed to generate checklist');
        } finally {
            this.hideLoading();
        }
    }

    generateQuestion(requirement, format) {
        const baseQuestion = `Does the organization comply with ${requirement.title}?`;
        
        switch (format) {
            case 'yes-no':
                return baseQuestion;
            case 'compliance-level':
                return `What is the compliance level for ${requirement.title}?`;
            case 'evidence-based':
                return `What evidence demonstrates compliance with ${requirement.title}?`;
            case 'rating-scale':
                return `Rate the compliance level for ${requirement.title} (1-5 scale)`;
            default:
                return baseQuestion;
        }
    }

    generateOptions(format) {
        switch (format) {
            case 'yes-no':
                return ['Yes', 'No', 'Not Applicable'];
            case 'compliance-level':
                return ['Full Compliance', 'Partial Compliance', 'Non-Compliant', 'Not Applicable'];
            case 'evidence-based':
                return ['Evidence Available', 'Evidence Partial', 'No Evidence', 'Not Applicable'];
            case 'rating-scale':
                return ['1 - Poor', '2 - Fair', '3 - Good', '4 - Very Good', '5 - Excellent'];
            default:
                return ['Yes', 'No', 'Not Applicable'];
        }
    }

    assessRisk(requirement) {
        const riskLevels = {
            'high': 'High Risk - Immediate attention required',
            'medium': 'Medium Risk - Monitor and address',
            'low': 'Low Risk - Acceptable level'
        };
        
        if (requirement.priority === 'high' || requirement.type === 'mandatory') {
            return riskLevels.high;
        } else if (requirement.priority === 'medium') {
            return riskLevels.medium;
        } else {
            return riskLevels.low;
        }
    }

    updateChecklistPreview() {
        const previewContainer = document.getElementById('checklistPreview');
        
        if (this.generatedChecklist.length === 0) {
            previewContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="check-square"></i>
                    <h4>No checklist generated</h4>
                    <p>Configure and generate a checklist to see preview</p>
                </div>
            `;
            return;
        }

        previewContainer.innerHTML = this.generatedChecklist.map(item => `
            <div class="checklist-item">
                <div class="checklist-number">${item.number}</div>
                <div class="checklist-content">
                    <div class="checklist-question">${item.question}</div>
                    ${item.guidance ? `<div class="checklist-guidance"><strong>Guidance:</strong> ${item.guidance}</div>` : ''}
                    ${item.evidence ? `<div class="checklist-guidance"><strong>Evidence Required:</strong> ${item.evidence}</div>` : ''}
                    ${item.risk ? `<div class="checklist-guidance"><strong>Risk Level:</strong> ${item.risk}</div>` : ''}
                    ${item.corrective ? `<div class="checklist-guidance"><strong>Corrective Action:</strong> ${item.corrective}</div>` : ''}
                    <div class="checklist-options">
                        ${item.options.map(option => `
                            <div class="option-item">
                                <input type="radio" name="item_${item.number}" value="${option}">
                                <label>${option}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateChecklistSummary() {
        const summaryContainer = document.getElementById('checklistSummary');
        const formData = this.collectFormData();
        
        if (this.generatedChecklist.length === 0) {
            summaryContainer.style.display = 'none';
            return;
        }

        summaryContainer.style.display = 'block';
        document.getElementById('totalQuestions').textContent = this.generatedChecklist.length;
        document.getElementById('estimatedTime').textContent = `${formData.auditDuration || this.calculateEstimatedTime()} hours`;
        document.getElementById('standardsCovered').textContent = this.selectedStandards.length;
    }

    calculateEstimatedTime() {
        // Estimate 15 minutes per question
        return Math.ceil(this.generatedChecklist.length * 0.25);
    }

    collectFormData() {
        return {
            name: document.getElementById('checklistName').value.trim(),
            type: document.getElementById('checklistType').value,
            scope: document.getElementById('auditScope').value.trim(),
            duration: parseInt(document.getElementById('auditDuration').value) || 8,
            description: document.getElementById('checklistDescription').value.trim(),
            requirementFilter: document.getElementById('requirementFilter').value,
            questionFormat: document.getElementById('questionFormat').value,
            includeGuidance: document.getElementById('includeGuidance').checked,
            includeEvidence: document.getElementById('includeEvidence').checked,
            includeRisk: document.getElementById('includeRisk').checked,
            includeCorrective: document.getElementById('includeCorrective').checked
        };
    }

    async saveTemplate() {
        try {
            const formData = this.collectFormData();
            
            if (!formData.name) {
                this.showError('Please enter a checklist name');
                return;
            }

            if (this.selectedRequirements.length === 0) {
                this.showError('Please select at least one requirement');
                return;
            }

            const templateData = {
                name: formData.name,
                type: formData.type,
                scope: formData.scope,
                description: formData.description,
                standards: this.selectedStandards,
                requirements: this.selectedRequirements,
                configuration: {
                    requirementFilter: formData.requirementFilter,
                    questionFormat: formData.questionFormat,
                    includeGuidance: formData.includeGuidance,
                    includeEvidence: formData.includeEvidence,
                    includeRisk: formData.includeRisk,
                    includeCorrective: formData.includeCorrective
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: this.currentUser.uid,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            };

            await this.db.collection('checklist_templates').add(templateData);
            
            await this.loadTemplates();
            this.showSuccess('Template saved successfully');

        } catch (error) {
            console.error('Error saving template:', error);
            this.showError('Failed to save template');
        }
    }

    loadTemplate(templateId) {
        // Load predefined templates
        const templates = {
            'iso9001': {
                name: 'ISO 9001 Quality Management Audit',
                type: 'internal',
                scope: 'Quality Management System',
                standards: ['iso9001'],
                requirements: this.requirements.filter(r => r.standard === 'iso9001').map(r => r.id)
            },
            'iso14001': {
                name: 'ISO 14001 Environmental Management Audit',
                type: 'internal',
                scope: 'Environmental Management System',
                standards: ['iso14001'],
                requirements: this.requirements.filter(r => r.standard === 'iso14001').map(r => r.id)
            },
            'iso45001': {
                name: 'ISO 45001 Health & Safety Audit',
                type: 'internal',
                scope: 'Occupational Health & Safety Management',
                standards: ['iso45001'],
                requirements: this.requirements.filter(r => r.standard === 'iso45001').map(r => r.id)
            },
            'sa8000': {
                name: 'SA 8000 Social Accountability Audit',
                type: 'external',
                scope: 'Social Accountability Management',
                standards: ['sa8000'],
                requirements: this.requirements.filter(r => r.standard === 'sa8000').map(r => r.id)
            }
        };

        const template = templates[templateId];
        if (!template) return;

        // Populate form
        document.getElementById('checklistName').value = template.name;
        document.getElementById('checklistType').value = template.type;
        document.getElementById('auditScope').value = template.scope;

        // Select standards
        this.selectedStandards = template.standards;
        this.selectedRequirements = template.requirements;

        // Update UI
        document.querySelectorAll('.standard-checkbox').forEach(checkbox => {
            checkbox.checked = this.selectedStandards.includes(checkbox.value);
            if (checkbox.checked) {
                checkbox.closest('.standard-item').classList.add('selected');
            } else {
                checkbox.closest('.standard-item').classList.remove('selected');
            }
        });

        this.updateRequirementsPreview();
        this.showSuccess('Template loaded successfully');
    }

    async exportChecklist() {
        try {
            if (this.generatedChecklist.length === 0) {
                this.showError('No checklist to export');
                return;
            }

            const formData = this.collectFormData();
            const exportData = {
                checklist: {
                    name: formData.name,
                    type: formData.type,
                    scope: formData.scope,
                    description: formData.description,
                    generatedAt: new Date().toISOString(),
                    generatedBy: this.currentUser.email
                },
                items: this.generatedChecklist.map(item => ({
                    number: item.number,
                    question: item.question,
                    guidance: item.guidance,
                    evidence: item.evidence,
                    risk: item.risk,
                    corrective: item.corrective,
                    options: item.options,
                    requirement: {
                        title: item.requirement.title,
                        code: item.requirement.code,
                        standard: item.requirement.standard
                    }
                })),
                summary: {
                    totalQuestions: this.generatedChecklist.length,
                    estimatedTime: formData.duration || this.calculateEstimatedTime(),
                    standardsCovered: this.selectedStandards.length
                }
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_checklist_${formData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);

            this.showSuccess('Checklist exported successfully');

        } catch (error) {
            console.error('Error exporting checklist:', error);
            this.showError('Failed to export checklist');
        }
    }

    previewChecklist() {
        this.generateChecklist();
    }

    saveDraft() {
        // Save current state as draft
        const formData = this.collectFormData();
        const draftData = {
            ...formData,
            selectedStandards: this.selectedStandards,
            selectedRequirements: this.selectedRequirements,
            savedAt: new Date().toISOString()
        };

        localStorage.setItem('checklistDraft', JSON.stringify(draftData));
        this.showSuccess('Draft saved successfully');
    }

    clearBuilder() {
        if (confirm('Are you sure you want to clear the builder? All unsaved changes will be lost.')) {
            document.getElementById('checklistBuilderForm').reset();
            this.selectedStandards = [];
            this.selectedRequirements = [];
            this.generatedChecklist = [];

            // Clear UI
            document.querySelectorAll('.standard-checkbox').forEach(checkbox => {
                checkbox.checked = false;
                checkbox.closest('.standard-item').classList.remove('selected');
            });

            this.updateRequirementsPreview();
            this.updateChecklistPreview();
            this.updateChecklistSummary();
        }
    }

    refreshPreview() {
        this.updateChecklistPreview();
        this.updateChecklistSummary();
    }

    updateStatistics() {
        document.getElementById('totalTemplates').textContent = this.templates.length;
        // Mock data for now
        document.getElementById('totalChecklists').textContent = '45';
        document.getElementById('activeStandards').textContent = this.standards.length;
        document.getElementById('totalRequirements').textContent = this.requirements.length;
    }

    // Helper methods
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

    showLoading() {
        // Add loading indicator
        const generateButton = document.querySelector('button[type="submit"]');
        if (generateButton) {
            generateButton.disabled = true;
            generateButton.innerHTML = '<i data-lucide="loader-2"></i> Generating...';
        }
    }

    hideLoading() {
        // Remove loading indicator
        const generateButton = document.querySelector('button[type="submit"]');
        if (generateButton) {
            generateButton.disabled = false;
            generateButton.innerHTML = '<i data-lucide="play"></i> Generate Checklist';
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
let auditChecklistGenerator;

function toggleRequirementSelection(requirementId) {
    auditChecklistGenerator.toggleRequirementSelection(requirementId);
}

function generateChecklist() {
    auditChecklistGenerator.generateChecklist();
}

function saveTemplate() {
    auditChecklistGenerator.saveTemplate();
}

function exportChecklist() {
    auditChecklistGenerator.exportChecklist();
}

function previewChecklist() {
    auditChecklistGenerator.previewChecklist();
}

function saveDraft() {
    auditChecklistGenerator.saveDraft();
}

function clearBuilder() {
    auditChecklistGenerator.clearBuilder();
}

function refreshPreview() {
    auditChecklistGenerator.refreshPreview();
}

function loadTemplate(templateId) {
    auditChecklistGenerator.loadTemplate(templateId);
}

function importTemplate() {
    alert('Import Template feature coming soon');
}

function exportTemplate() {
    alert('Export Template feature coming soon');
}

function shareTemplate() {
    alert('Share Template feature coming soon');
}

function templateAnalytics() {
    alert('Template Analytics feature coming soon');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    auditChecklistGenerator = new AuditChecklistGenerator();
    window.auditChecklistGenerator = auditChecklistGenerator;
    auditChecklistGenerator.init();
});
