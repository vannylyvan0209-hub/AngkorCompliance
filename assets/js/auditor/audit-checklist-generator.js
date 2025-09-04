// Audit Checklist Generator System
class ChecklistGenerator {
    constructor() {
        this.currentUser = null;
        this.templates = [];
        this.requirements = [];
        this.selectedRequirements = new Set();
        this.generatedChecklist = null;
        this.currentTemplate = null;
        
        // Initialize Firebase
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadTemplates = this.loadTemplates.bind(this);
        this.loadRequirements = this.loadRequirements.bind(this);
        this.updateRequirements = this.updateRequirements.bind(this);
        this.renderRequirements = this.renderRequirements.bind(this);
        this.generateChecklist = this.generateChecklist.bind(this);
        this.renderChecklist = this.renderChecklist.bind(this);
        this.loadTemplate = this.loadTemplate.bind(this);
        this.saveTemplate = this.saveTemplate.bind(this);
        this.selectAllRequirements = this.selectAllRequirements.bind(this);
        this.clearAllRequirements = this.clearAllRequirements.bind(this);
        this.filterRequirements = this.filterRequirements.bind(this);
        this.exportChecklist = this.exportChecklist.bind(this);
        this.printChecklist = this.printChecklist.bind(this);
        this.closeTemplateModal = this.closeTemplateModal.bind(this);
        this.closeSaveModal = this.closeSaveModal.bind(this);
        this.closeFilterModal = this.closeFilterModal.bind(this);
        this.saveTemplateToDatabase = this.saveTemplateToDatabase.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
    }

    async init() {
        try {
            // Check authentication
            this.currentUser = this.auth.currentUser;
            if (!this.currentUser) {
                console.error('User not authenticated');
                return;
            }

            // Initialize Lucide icons
            if (window.lucide) {
                lucide.createIcons();
            }

            // Load data
            await this.loadTemplates();
            await this.loadRequirements();

            // Set up event listeners
            this.setupEventListeners();

            // Initial render
            this.renderRequirements();
            this.updateStats();

            console.log('Checklist Generator initialized successfully');
        } catch (error) {
            console.error('Error initializing Checklist Generator:', error);
        }
    }

    setupEventListeners() {
        // Requirement selection listeners
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.name === 'requirement') {
                this.toggleRequirement(e.target.value, e.target.checked);
            }
        });

        // Standard change listener
        const standardSelect = document.getElementById('auditStandard');
        if (standardSelect) {
            standardSelect.addEventListener('change', this.updateRequirements);
        }
    }

    async loadTemplates() {
        try {
            const snapshot = await this.db.collection('checklistTemplates')
                .where('factoryId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();

            this.templates = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    async loadRequirements() {
        try {
            const snapshot = await this.db.collection('requirements')
                .where('factoryId', '==', this.currentUser.uid)
                .get();

            this.requirements = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading requirements:', error);
        }
    }

    updateRequirements() {
        const standard = document.getElementById('auditStandard').value;
        const scope = document.getElementById('auditScope');
        
        // Clear scope options
        scope.innerHTML = '<option value="">Select Scope</option>';
        
        if (standard) {
            const scopes = this.getScopesForStandard(standard);
            scopes.forEach(scopeOption => {
                const option = document.createElement('option');
                option.value = scopeOption.value;
                option.textContent = scopeOption.label;
                scope.appendChild(option);
            });
        }

        // Filter requirements based on standard
        this.filterRequirementsByStandard(standard);
    }

    getScopesForStandard(standard) {
        const scopes = {
            'iso_9001': [
                { value: 'full', label: 'Full Quality Management System' },
                { value: 'partial', label: 'Partial QMS Audit' },
                { value: 'process', label: 'Process Audit' },
                { value: 'product', label: 'Product Audit' }
            ],
            'iso_14001': [
                { value: 'full', label: 'Full Environmental Management System' },
                { value: 'partial', label: 'Partial EMS Audit' },
                { value: 'compliance', label: 'Compliance Audit' },
                { value: 'performance', label: 'Performance Audit' }
            ],
            'ohsas_18001': [
                { value: 'full', label: 'Full OHS Management System' },
                { value: 'partial', label: 'Partial OHS Audit' },
                { value: 'compliance', label: 'Compliance Audit' },
                { value: 'risk', label: 'Risk Assessment' }
            ],
            'sa_8000': [
                { value: 'full', label: 'Full Social Accountability System' },
                { value: 'partial', label: 'Partial SA Audit' },
                { value: 'labor', label: 'Labor Rights Audit' },
                { value: 'working_conditions', label: 'Working Conditions Audit' }
            ],
            'custom': [
                { value: 'custom', label: 'Custom Scope' }
            ]
        };

        return scopes[standard] || [];
    }

    filterRequirementsByStandard(standard) {
        if (!standard) {
            this.renderRequirements();
            return;
        }

        const filteredRequirements = this.requirements.filter(req => 
            req.standard === standard || req.standard === 'universal'
        );

        this.renderRequirements(filteredRequirements);
    }

    renderRequirements(requirementsToRender = this.requirements) {
        const grid = document.getElementById('requirementsGrid');
        if (!grid) return;

        if (requirementsToRender.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="list-checks"></i>
                    <p>No requirements found for the selected standard</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = requirementsToRender.map(req => this.renderRequirementCard(req)).join('');
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderRequirementCard(requirement) {
        const isSelected = this.selectedRequirements.has(requirement.id);
        const priorityClass = `priority-${requirement.priority}`;
        const typeClass = `type-${requirement.type}`;

        return `
            <div class="requirement-card ${isSelected ? 'selected' : ''}">
                <div class="requirement-header">
                    <div class="requirement-checkbox">
                        <input type="checkbox" 
                               id="req_${requirement.id}" 
                               name="requirement" 
                               value="${requirement.id}"
                               ${isSelected ? 'checked' : ''}>
                        <label for="req_${requirement.id}"></label>
                    </div>
                    <div class="requirement-meta">
                        <span class="priority-badge ${priorityClass}">${requirement.priority}</span>
                        <span class="type-badge ${typeClass}">${requirement.type}</span>
                    </div>
                </div>
                <div class="requirement-content">
                    <h3>${requirement.title}</h3>
                    <p class="requirement-description">${requirement.description}</p>
                    <div class="requirement-details">
                        <span class="requirement-id">ID: ${requirement.requirementId}</span>
                        <span class="requirement-category">${requirement.category}</span>
                    </div>
                </div>
            </div>
        `;
    }

    toggleRequirement(requirementId, isSelected) {
        if (isSelected) {
            this.selectedRequirements.add(requirementId);
        } else {
            this.selectedRequirements.delete(requirementId);
        }
        
        // Update UI
        const card = document.querySelector(`[data-requirement-id="${requirementId}"]`);
        if (card) {
            card.classList.toggle('selected', isSelected);
        }
    }

    selectAllRequirements() {
        const checkboxes = document.querySelectorAll('input[name="requirement"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.selectedRequirements.add(checkbox.value);
        });
        
        // Update UI
        document.querySelectorAll('.requirement-card').forEach(card => {
            card.classList.add('selected');
        });
    }

    clearAllRequirements() {
        const checkboxes = document.querySelectorAll('input[name="requirement"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        this.selectedRequirements.clear();
        
        // Update UI
        document.querySelectorAll('.requirement-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    async generateChecklist() {
        try {
            this.showLoading();

            const checklistName = document.getElementById('checklistName').value;
            const auditStandard = document.getElementById('auditStandard').value;
            const auditType = document.getElementById('auditType').value;
            const auditScope = document.getElementById('auditScope').value;
            const department = document.getElementById('department').value;
            const checklistLevel = document.getElementById('checklistLevel').value;

            if (!checklistName || !auditStandard) {
                this.hideLoading();
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }

            if (this.selectedRequirements.size === 0) {
                this.hideLoading();
                this.showNotification('Please select at least one requirement', 'error');
                return;
            }

            // Get selected requirements
            const selectedReqs = this.requirements.filter(req => 
                this.selectedRequirements.has(req.id)
            );

            // Generate checklist
            this.generatedChecklist = {
                id: this.generateId(),
                name: checklistName,
                standard: auditStandard,
                type: auditType,
                scope: auditScope,
                department: department,
                level: checklistLevel,
                requirements: selectedReqs,
                items: this.generateChecklistItems(selectedReqs),
                metadata: {
                    generatedAt: new Date().toISOString(),
                    generatedBy: this.currentUser.uid,
                    totalItems: selectedReqs.length,
                    estimatedTime: this.calculateEstimatedTime(selectedReqs)
                }
            };

            // Save to database
            await this.saveChecklistToDatabase();

            this.hideLoading();
            this.renderChecklist();
            this.updateStats();
            
            this.showNotification('Checklist generated successfully', 'success');
        } catch (error) {
            console.error('Error generating checklist:', error);
            this.hideLoading();
            this.showNotification('Error generating checklist', 'error');
        }
    }

    generateChecklistItems(requirements) {
        return requirements.map((req, index) => ({
            id: `item_${index + 1}`,
            requirementId: req.id,
            title: req.title,
            description: req.description,
            category: req.category,
            priority: req.priority,
            type: req.type,
            responseType: 'yes_no',
            required: req.type === 'mandatory',
            evidenceRequired: req.evidenceRequired || '',
            notes: req.notes || '',
            order: index + 1
        }));
    }

    calculateEstimatedTime(requirements) {
        const baseTime = 5; // minutes per requirement
        const priorityMultiplier = {
            'high': 1.5,
            'medium': 1.0,
            'low': 0.7
        };

        const totalMinutes = requirements.reduce((total, req) => {
            const multiplier = priorityMultiplier[req.priority] || 1.0;
            return total + (baseTime * multiplier);
        }, 0);

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return {
            totalMinutes,
            hours,
            minutes,
            formatted: `${hours}h ${minutes}m`
        };
    }

    renderChecklist() {
        const preview = document.getElementById('checklistPreview');
        if (!preview || !this.generatedChecklist) return;

        const checklist = this.generatedChecklist;

        preview.innerHTML = `
            <div class="checklist-document">
                <div class="checklist-header">
                    <h1>${checklist.name}</h1>
                    <div class="checklist-meta">
                        <div class="meta-item">
                            <strong>Standard:</strong> ${checklist.standard}
                        </div>
                        <div class="meta-item">
                            <strong>Type:</strong> ${checklist.type || 'Not specified'}
                        </div>
                        <div class="meta-item">
                            <strong>Scope:</strong> ${checklist.scope || 'Not specified'}
                        </div>
                        <div class="meta-item">
                            <strong>Department:</strong> ${checklist.department || 'All Departments'}
                        </div>
                        <div class="meta-item">
                            <strong>Level:</strong> ${checklist.level}
                        </div>
                        <div class="meta-item">
                            <strong>Generated:</strong> ${new Date(checklist.metadata.generatedAt).toLocaleDateString()}
                        </div>
                        <div class="meta-item">
                            <strong>Estimated Time:</strong> ${checklist.metadata.estimatedTime.formatted}
                        </div>
                    </div>
                </div>

                <div class="checklist-items">
                    ${checklist.items.map(item => this.renderChecklistItem(item)).join('')}
                </div>

                <div class="checklist-footer">
                    <div class="footer-info">
                        <p><strong>Total Items:</strong> ${checklist.metadata.totalItems}</p>
                        <p><strong>Generated by:</strong> ${this.currentUser.email}</p>
                        <p><strong>Date:</strong> ${new Date(checklist.metadata.generatedAt).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderChecklistItem(item) {
        return `
            <div class="checklist-item" data-item-id="${item.id}">
                <div class="item-header">
                    <div class="item-number">${item.order}</div>
                    <div class="item-meta">
                        <span class="priority-badge priority-${item.priority}">${item.priority}</span>
                        <span class="type-badge type-${item.type}">${item.type}</span>
                        ${item.required ? '<span class="required-badge">Required</span>' : ''}
                    </div>
                </div>
                <div class="item-content">
                    <h3>${item.title}</h3>
                    <p class="item-description">${item.description}</p>
                    ${item.evidenceRequired ? `<p class="evidence-required"><strong>Evidence Required:</strong> ${item.evidenceRequired}</p>` : ''}
                    ${item.notes ? `<p class="item-notes"><strong>Notes:</strong> ${item.notes}</p>` : ''}
                </div>
                <div class="item-response">
                    <div class="response-options">
                        <label class="response-option">
                            <input type="radio" name="response_${item.id}" value="yes">
                            <span class="option-text">Yes</span>
                        </label>
                        <label class="response-option">
                            <input type="radio" name="response_${item.id}" value="no">
                            <span class="option-text">No</span>
                        </label>
                        <label class="response-option">
                            <input type="radio" name="response_${item.id}" value="na">
                            <span class="option-text">N/A</span>
                        </label>
                    </div>
                    <div class="response-notes">
                        <textarea placeholder="Add notes or findings..." rows="2"></textarea>
                    </div>
                </div>
            </div>
        `;
    }

    async saveChecklistToDatabase() {
        try {
            await this.db.collection('generatedChecklists').add({
                ...this.generatedChecklist,
                factoryId: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error saving checklist to database:', error);
            throw error;
        }
    }

    loadTemplate() {
        const modal = document.getElementById('templateModal');
        const grid = document.getElementById('templateGrid');
        
        if (modal && grid) {
            modal.style.display = 'flex';
            this.renderTemplates();
        }
    }

    renderTemplates() {
        const grid = document.getElementById('templateGrid');
        if (!grid) return;

        if (this.templates.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="file-text"></i>
                    <p>No templates available</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.templates.map(template => `
            <div class="template-card" onclick="checklistGenerator.useTemplate('${template.id}')">
                <div class="template-header">
                    <h3>${template.name}</h3>
                    <span class="template-category">${template.category}</span>
                </div>
                <p>${template.description || 'No description available'}</p>
                <div class="template-meta">
                    <span>Standard: ${template.standard}</span>
                    <span>Items: ${template.requirements ? template.requirements.length : 0}</span>
                </div>
            </div>
        `).join('');
    }

    useTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (template) {
            this.currentTemplate = template;
            this.closeTemplateModal();
            this.populateFromTemplate(template);
        }
    }

    populateFromTemplate(template) {
        // Populate form fields
        document.getElementById('checklistName').value = `${template.name} - Generated`;
        document.getElementById('auditStandard').value = template.standard;
        document.getElementById('auditType').value = template.type || '';
        document.getElementById('auditScope').value = template.scope || '';
        document.getElementById('department').value = template.department || '';
        document.getElementById('checklistLevel').value = template.level || 'standard';

        // Update requirements
        this.updateRequirements();

        // Select template requirements
        if (template.requirements) {
            this.selectedRequirements.clear();
            template.requirements.forEach(reqId => {
                this.selectedRequirements.add(reqId);
            });
            this.renderRequirements();
        }
    }

    saveTemplate() {
        const modal = document.getElementById('saveTemplateModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    async saveTemplateToDatabase() {
        try {
            const templateName = document.getElementById('templateName').value;
            const templateDescription = document.getElementById('templateDescription').value;
            const templateCategory = document.getElementById('templateCategory').value;
            const templateTags = document.getElementById('templateTags').value;

            if (!templateName) {
                this.showNotification('Please enter a template name', 'error');
                return;
            }

            const templateData = {
                name: templateName,
                description: templateDescription,
                category: templateCategory,
                tags: templateTags.split(',').map(tag => tag.trim()).filter(tag => tag),
                standard: document.getElementById('auditStandard').value,
                type: document.getElementById('auditType').value,
                scope: document.getElementById('auditScope').value,
                department: document.getElementById('department').value,
                level: document.getElementById('checklistLevel').value,
                requirements: Array.from(this.selectedRequirements),
                factoryId: this.currentUser.uid,
                createdBy: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.db.collection('checklistTemplates').add(templateData);
            
            this.closeSaveModal();
            this.loadTemplates();
            this.updateStats();
            this.showNotification('Template saved successfully', 'success');
        } catch (error) {
            console.error('Error saving template:', error);
            this.showNotification('Error saving template', 'error');
        }
    }

    filterRequirements() {
        const modal = document.getElementById('filterModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    applyFilter() {
        const priorityHigh = document.getElementById('priorityHigh').checked;
        const priorityMedium = document.getElementById('priorityMedium').checked;
        const priorityLow = document.getElementById('priorityLow').checked;
        const typeMandatory = document.getElementById('typeMandatory').checked;
        const typeRecommended = document.getElementById('typeRecommended').checked;
        const typeOptional = document.getElementById('typeOptional').checked;
        const searchKeywords = document.getElementById('searchKeywords').value.toLowerCase();

        const selectedPriorities = [];
        if (priorityHigh) selectedPriorities.push('high');
        if (priorityMedium) selectedPriorities.push('medium');
        if (priorityLow) selectedPriorities.push('low');

        const selectedTypes = [];
        if (typeMandatory) selectedTypes.push('mandatory');
        if (typeRecommended) selectedTypes.push('recommended');
        if (typeOptional) selectedTypes.push('optional');

        const filteredRequirements = this.requirements.filter(req => {
            const priorityMatch = selectedPriorities.length === 0 || selectedPriorities.includes(req.priority);
            const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(req.type);
            const keywordMatch = !searchKeywords || 
                req.title.toLowerCase().includes(searchKeywords) ||
                req.description.toLowerCase().includes(searchKeywords);

            return priorityMatch && typeMatch && keywordMatch;
        });

        this.closeFilterModal();
        this.renderRequirements(filteredRequirements);
    }

    exportChecklist(format) {
        if (!this.generatedChecklist) {
            this.showNotification('No checklist to export', 'error');
            return;
        }

        try {
            if (format === 'pdf') {
                this.exportToPDF();
            } else if (format === 'excel') {
                this.exportToExcel();
            }
        } catch (error) {
            console.error('Error exporting checklist:', error);
            this.showNotification('Error exporting checklist', 'error');
        }
    }

    exportToPDF() {
        // Simple PDF export using browser print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${this.generatedChecklist.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .checklist-header { text-align: center; margin-bottom: 30px; }
                        .checklist-item { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                        .item-number { font-weight: bold; }
                        .response-options { margin-top: 10px; }
                        .response-option { display: inline-block; margin-right: 20px; }
                    </style>
                </head>
                <body>
                    ${document.getElementById('checklistPreview').innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    exportToExcel() {
        const checklist = this.generatedChecklist;
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${checklist.name.replace(/[^a-z0-9]/gi, '_')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateCSV() {
        const checklist = this.generatedChecklist;
        const headers = ['Item #', 'Title', 'Description', 'Category', 'Priority', 'Type', 'Required', 'Evidence Required', 'Notes'];
        const rows = checklist.items.map(item => [
            item.order,
            item.title,
            item.description,
            item.category,
            item.priority,
            item.type,
            item.required ? 'Yes' : 'No',
            item.evidenceRequired,
            item.notes
        ]);

        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    printChecklist() {
        if (!this.generatedChecklist) {
            this.showNotification('No checklist to print', 'error');
            return;
        }

        window.print();
    }

    closeTemplateModal() {
        const modal = document.getElementById('templateModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeSaveModal() {
        const modal = document.getElementById('saveTemplateModal');
        if (modal) {
            modal.style.display = 'none';
            // Reset form
            document.getElementById('templateForm').reset();
        }
    }

    closeFilterModal() {
        const modal = document.getElementById('filterModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateStats() {
        document.getElementById('totalTemplates').textContent = this.templates.length;
        document.getElementById('generatedChecklists').textContent = this.generatedChecklist ? 1 : 0;
        document.getElementById('availableStandards').textContent = new Set(this.requirements.map(r => r.standard)).size;
    }

    generateId() {
        return 'checklist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the checklist generator
const checklistGenerator = new ChecklistGenerator();

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    checklistGenerator.init();
});
