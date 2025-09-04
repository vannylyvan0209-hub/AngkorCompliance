// Evidence Binder Creation System
class EvidenceBinderCreationSystem {
    constructor() {
        this.currentUser = null;
        this.binders = [];
        this.currentBinder = null;
        this.evidenceItems = [];
        this.selectedEvidence = [];
        this.binderTemplates = [];
        
        this.initializeSystem();
    }

    async initializeSystem() {
        try {
            // Initialize Firebase
            await this.initializeFirebase();
            
            // Check authentication
            await this.checkAuthentication();
            
            // Initialize UI components
            this.initializeUI();
            
            // Load binders and evidence
            await this.loadBinders();
            await this.loadEvidence();
            await this.loadTemplates();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('Evidence Binder Creation System initialized successfully');
        } catch (error) {
            console.error('Error initializing Evidence Binder Creation System:', error);
            this.showNotification('Error initializing system', 'error');
        }
    }

    async initializeFirebase() {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase not loaded');
        }
        
        this.db = firebase.firestore();
        this.storage = firebase.storage();
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    console.log('User authenticated:', user.email);
                    resolve(user);
                } else {
                    console.log('No user authenticated');
                    reject(new Error('User not authenticated'));
                }
            });
        });
    }

    initializeUI() {
        // Initialize drag and drop
        this.initializeDragAndDrop();
        
        // Initialize binder preview
        this.initializeBinderPreview();
        
        // Initialize search functionality
        this.initializeSearch();
    }

    initializeDragAndDrop() {
        const evidenceContainer = document.getElementById('evidenceContainer');
        const binderContainer = document.getElementById('binderContainer');
        
        if (evidenceContainer) {
            evidenceContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                evidenceContainer.classList.add('drag-over');
            });
            
            evidenceContainer.addEventListener('dragleave', () => {
                evidenceContainer.classList.remove('drag-over');
            });
            
            evidenceContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                evidenceContainer.classList.remove('drag-over');
                this.handleEvidenceDrop(e);
            });
        }
        
        if (binderContainer) {
            binderContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                binderContainer.classList.add('drag-over');
            });
            
            binderContainer.addEventListener('dragleave', () => {
                binderContainer.classList.remove('drag-over');
            });
            
            binderContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                binderContainer.classList.remove('drag-over');
                this.handleBinderDrop(e);
            });
        }
    }

    initializeBinderPreview() {
        const previewContainer = document.getElementById('binderPreview');
        if (previewContainer) {
            previewContainer.addEventListener('click', () => {
                this.generateBinderPreview();
            });
        }
    }

    initializeSearch() {
        const searchInput = document.getElementById('evidenceSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterEvidence(e.target.value);
            });
        }
    }

    async loadBinders() {
        try {
            const bindersSnapshot = await this.db.collection('evidenceBinders')
                .where('auditorId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();
            
            this.binders = [];
            bindersSnapshot.forEach(doc => {
                this.binders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.displayBinders();
        } catch (error) {
            console.error('Error loading binders:', error);
            this.showNotification('Error loading binders', 'error');
        }
    }

    async loadEvidence() {
        try {
            const evidenceSnapshot = await this.db.collection('auditEvidence')
                .where('auditorId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();
            
            this.evidenceItems = [];
            evidenceSnapshot.forEach(doc => {
                this.evidenceItems.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.displayEvidence();
        } catch (error) {
            console.error('Error loading evidence:', error);
            this.showNotification('Error loading evidence', 'error');
        }
    }

    async loadTemplates() {
        try {
            const templatesSnapshot = await this.db.collection('binderTemplates')
                .orderBy('name', 'asc')
                .get();
            
            this.binderTemplates = [];
            templatesSnapshot.forEach(doc => {
                this.binderTemplates.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.populateTemplateDropdown();
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    displayBinders() {
        const bindersContainer = document.getElementById('bindersList');
        if (!bindersContainer) return;
        
        bindersContainer.innerHTML = '';
        
        if (this.binders.length === 0) {
            bindersContainer.innerHTML = '<p class="text-muted">No binders created yet</p>';
            return;
        }
        
        this.binders.forEach(binder => {
            const binderItem = this.createBinderItem(binder);
            bindersContainer.appendChild(binderItem);
        });
    }

    createBinderItem(binder) {
        const binderItem = document.createElement('div');
        binderItem.className = 'binder-item';
        binderItem.dataset.binderId = binder.id;
        
        binderItem.innerHTML = `
            <div class="binder-title">${binder.name}</div>
            <div class="binder-preview">${binder.description || 'No description'}</div>
            <div class="binder-meta">
                <span class="evidence-count">${binder.evidenceCount || 0} items</span>
                <span class="binder-date">${this.formatDate(binder.createdAt)}</span>
            </div>
            <div class="binder-actions">
                <button class="btn btn-sm btn-primary edit-binder">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-success export-binder">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        `;
        
        // Add event listeners
        binderItem.querySelector('.edit-binder').addEventListener('click', () => {
            this.loadBinder(binder);
        });
        
        binderItem.querySelector('.export-binder').addEventListener('click', () => {
            this.exportBinder(binder);
        });
        
        return binderItem;
    }

    displayEvidence() {
        const evidenceContainer = document.getElementById('evidenceContainer');
        if (!evidenceContainer) return;
        
        evidenceContainer.innerHTML = '';
        
        if (this.evidenceItems.length === 0) {
            evidenceContainer.innerHTML = '<p class="text-muted">No evidence items available</p>';
            return;
        }
        
        this.evidenceItems.forEach(evidence => {
            const evidenceItem = this.createEvidenceItem(evidence);
            evidenceContainer.appendChild(evidenceItem);
        });
    }

    createEvidenceItem(evidence) {
        const evidenceItem = document.createElement('div');
        evidenceItem.className = 'evidence-item';
        evidenceItem.dataset.evidenceId = evidence.id;
        evidenceItem.draggable = true;
        
        const typeIcon = this.getEvidenceTypeIcon(evidence.type);
        
        evidenceItem.innerHTML = `
            <div class="evidence-header">
                <i class="fas ${typeIcon}"></i>
                <span class="evidence-title">${evidence.title}</span>
                <div class="evidence-actions">
                    <button class="btn btn-sm btn-outline-primary add-to-binder">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="evidence-preview">${evidence.description || 'No description'}</div>
            <div class="evidence-meta">
                <span class="evidence-type">${evidence.type}</span>
                <span class="evidence-date">${this.formatDate(evidence.createdAt)}</span>
            </div>
        `;
        
        // Add event listeners
        evidenceItem.querySelector('.add-to-binder').addEventListener('click', () => {
            this.addEvidenceToBinder(evidence);
        });
        
        evidenceItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', evidence.id);
        });
        
        return evidenceItem;
    }

    getEvidenceTypeIcon(type) {
        const icons = {
            document: 'fa-file-alt',
            photo: 'fa-image',
            video: 'fa-video',
            audio: 'fa-microphone',
            statement: 'fa-comment',
            record: 'fa-clipboard-list'
        };
        return icons[type] || 'fa-file';
    }

    populateTemplateDropdown() {
        const templateSelect = document.getElementById('binderTemplate');
        if (!templateSelect) return;
        
        templateSelect.innerHTML = '<option value="">Select Template</option>';
        
        this.binderTemplates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            templateSelect.appendChild(option);
        });
    }

    async loadBinder(binder) {
        try {
            this.currentBinder = binder;
            
            // Load binder evidence
            await this.loadBinderEvidence(binder.id);
            
            // Update UI
            this.updateBinderUI();
            
            this.showNotification(`Loaded binder: ${binder.name}`, 'info');
        } catch (error) {
            console.error('Error loading binder:', error);
            this.showNotification('Error loading binder', 'error');
        }
    }

    async loadBinderEvidence(binderId) {
        try {
            const evidenceSnapshot = await this.db.collection('binderEvidence')
                .where('binderId', '==', binderId)
                .orderBy('order', 'asc')
                .get();
            
            this.selectedEvidence = [];
            evidenceSnapshot.forEach(doc => {
                this.selectedEvidence.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.displayBinderEvidence();
        } catch (error) {
            console.error('Error loading binder evidence:', error);
        }
    }

    displayBinderEvidence() {
        const binderContainer = document.getElementById('binderContainer');
        if (!binderContainer) return;
        
        binderContainer.innerHTML = '';
        
        if (this.selectedEvidence.length === 0) {
            binderContainer.innerHTML = '<p class="text-muted">No evidence in binder</p>';
            return;
        }
        
        this.selectedEvidence.forEach((evidence, index) => {
            const evidenceItem = this.createBinderEvidenceItem(evidence, index);
            binderContainer.appendChild(evidenceItem);
        });
    }

    createBinderEvidenceItem(evidence, index) {
        const evidenceItem = document.createElement('div');
        evidenceItem.className = 'binder-evidence-item';
        evidenceItem.dataset.evidenceId = evidence.id;
        evidenceItem.draggable = true;
        
        const typeIcon = this.getEvidenceTypeIcon(evidence.type);
        
        evidenceItem.innerHTML = `
            <div class="evidence-header">
                <span class="evidence-order">${index + 1}</span>
                <i class="fas ${typeIcon}"></i>
                <span class="evidence-title">${evidence.title}</span>
                <div class="evidence-actions">
                    <button class="btn btn-sm btn-outline-danger remove-from-binder">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="evidence-preview">${evidence.description || 'No description'}</div>
            <div class="evidence-meta">
                <span class="evidence-type">${evidence.type}</span>
                <span class="evidence-date">${this.formatDate(evidence.createdAt)}</span>
            </div>
        `;
        
        // Add event listeners
        evidenceItem.querySelector('.remove-from-binder').addEventListener('click', () => {
            this.removeEvidenceFromBinder(evidence.id);
        });
        
        evidenceItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', evidence.id);
        });
        
        return evidenceItem;
    }

    updateBinderUI() {
        // Update binder form
        const binderForm = document.getElementById('binderForm');
        if (binderForm && this.currentBinder) {
            document.getElementById('binderName').value = this.currentBinder.name;
            document.getElementById('binderDescription').value = this.currentBinder.description || '';
            document.getElementById('binderTemplate').value = this.currentBinder.templateId || '';
        }
        
        // Update action buttons
        const saveButton = document.getElementById('saveBinder');
        const createButton = document.getElementById('createBinder');
        
        if (saveButton) saveButton.style.display = this.currentBinder ? 'block' : 'none';
        if (createButton) createButton.style.display = this.currentBinder ? 'none' : 'block';
    }

    async addEvidenceToBinder(evidence) {
        try {
            if (!this.currentBinder) {
                this.showNotification('Please create or select a binder first', 'warning');
                return;
            }
            
            // Check if evidence is already in binder
            const existingEvidence = this.selectedEvidence.find(e => e.id === evidence.id);
            if (existingEvidence) {
                this.showNotification('Evidence already in binder', 'info');
                return;
            }
            
            // Add to selected evidence
            this.selectedEvidence.push({
                ...evidence,
                order: this.selectedEvidence.length
            });
            
            // Update display
            this.displayBinderEvidence();
            
            this.showNotification(`Added ${evidence.title} to binder`, 'success');
        } catch (error) {
            console.error('Error adding evidence to binder:', error);
            this.showNotification('Error adding evidence to binder', 'error');
        }
    }

    async removeEvidenceFromBinder(evidenceId) {
        try {
            // Remove from selected evidence
            this.selectedEvidence = this.selectedEvidence.filter(e => e.id !== evidenceId);
            
            // Update display
            this.displayBinderEvidence();
            
            this.showNotification('Evidence removed from binder', 'success');
        } catch (error) {
            console.error('Error removing evidence from binder:', error);
            this.showNotification('Error removing evidence from binder', 'error');
        }
    }

    handleEvidenceDrop(e) {
        const evidenceId = e.dataTransfer.getData('text/plain');
        const evidence = this.evidenceItems.find(e => e.id === evidenceId);
        
        if (evidence) {
            this.addEvidenceToBinder(evidence);
        }
    }

    handleBinderDrop(e) {
        const evidenceId = e.dataTransfer.getData('text/plain');
        const evidence = this.selectedEvidence.find(e => e.id === evidenceId);
        
        if (evidence) {
            // Reorder evidence in binder
            this.reorderEvidence(evidenceId, e.clientY);
        }
    }

    reorderEvidence(evidenceId, dropY) {
        const binderContainer = document.getElementById('binderContainer');
        const evidenceItems = Array.from(binderContainer.children);
        
        let newIndex = evidenceItems.length;
        
        for (let i = 0; i < evidenceItems.length; i++) {
            const rect = evidenceItems[i].getBoundingClientRect();
            if (dropY < rect.top + rect.height / 2) {
                newIndex = i;
                break;
            }
        }
        
        // Update order
        const evidence = this.selectedEvidence.find(e => e.id === evidenceId);
        this.selectedEvidence = this.selectedEvidence.filter(e => e.id !== evidenceId);
        this.selectedEvidence.splice(newIndex, 0, evidence);
        
        // Update order numbers
        this.selectedEvidence.forEach((evidence, index) => {
            evidence.order = index;
        });
        
        this.displayBinderEvidence();
    }

    filterEvidence(searchTerm) {
        const evidenceItems = document.querySelectorAll('.evidence-item');
        
        evidenceItems.forEach(item => {
            const title = item.querySelector('.evidence-title').textContent.toLowerCase();
            const description = item.querySelector('.evidence-preview').textContent.toLowerCase();
            const type = item.querySelector('.evidence-type').textContent.toLowerCase();
            
            const matches = title.includes(searchTerm.toLowerCase()) ||
                           description.includes(searchTerm.toLowerCase()) ||
                           type.includes(searchTerm.toLowerCase());
            
            item.style.display = matches ? 'block' : 'none';
        });
    }

    async createBinder() {
        try {
            const name = document.getElementById('binderName').value.trim();
            const description = document.getElementById('binderDescription').value.trim();
            const templateId = document.getElementById('binderTemplate').value;
            
            if (!name) {
                this.showNotification('Please enter a binder name', 'error');
                return;
            }
            
            const binderData = {
                name,
                description,
                templateId,
                evidenceCount: this.selectedEvidence.length,
                auditorId: this.currentUser.uid,
                auditorName: this.currentUser.displayName || this.currentUser.email,
                createdAt: new Date(),
                status: 'draft'
            };
            
            // Save binder
            const binderRef = await this.db.collection('evidenceBinders').add(binderData);
            
            // Save binder evidence
            await this.saveBinderEvidence(binderRef.id);
            
            this.currentBinder = {
                id: binderRef.id,
                ...binderData
            };
            
            this.binders.unshift(this.currentBinder);
            this.displayBinders();
            this.updateBinderUI();
            
            this.showNotification('Binder created successfully', 'success');
        } catch (error) {
            console.error('Error creating binder:', error);
            this.showNotification('Error creating binder', 'error');
        }
    }

    async saveBinder() {
        try {
            if (!this.currentBinder) {
                this.showNotification('No binder selected', 'error');
                return;
            }
            
            const name = document.getElementById('binderName').value.trim();
            const description = document.getElementById('binderDescription').value.trim();
            const templateId = document.getElementById('binderTemplate').value;
            
            if (!name) {
                this.showNotification('Please enter a binder name', 'error');
                return;
            }
            
            const updateData = {
                name,
                description,
                templateId,
                evidenceCount: this.selectedEvidence.length,
                updatedAt: new Date()
            };
            
            // Update binder
            await this.db.collection('evidenceBinders').doc(this.currentBinder.id).update(updateData);
            
            // Update binder evidence
            await this.saveBinderEvidence(this.currentBinder.id);
            
            // Update local data
            Object.assign(this.currentBinder, updateData);
            
            this.displayBinders();
            
            this.showNotification('Binder saved successfully', 'success');
        } catch (error) {
            console.error('Error saving binder:', error);
            this.showNotification('Error saving binder', 'error');
        }
    }

    async saveBinderEvidence(binderId) {
        try {
            // Remove existing evidence
            const existingEvidence = await this.db.collection('binderEvidence')
                .where('binderId', '==', binderId)
                .get();
            
            const batch = this.db.batch();
            existingEvidence.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            // Add new evidence
            this.selectedEvidence.forEach(evidence => {
                const evidenceRef = this.db.collection('binderEvidence').doc();
                batch.set(evidenceRef, {
                    binderId,
                    evidenceId: evidence.id,
                    title: evidence.title,
                    description: evidence.description,
                    type: evidence.type,
                    order: evidence.order,
                    createdAt: evidence.createdAt,
                    auditorId: this.currentUser.uid
                });
            });
            
            await batch.commit();
        } catch (error) {
            console.error('Error saving binder evidence:', error);
            throw error;
        }
    }

    async exportBinder(binder) {
        try {
            this.showNotification('Generating binder export...', 'info');
            
            // Load binder evidence
            await this.loadBinderEvidence(binder.id);
            
            // Create export data
            const exportData = {
                binder: {
                    name: binder.name,
                    description: binder.description,
                    createdAt: this.formatDate(binder.createdAt),
                    auditor: binder.auditorName
                },
                evidence: this.selectedEvidence.map(evidence => ({
                    title: evidence.title,
                    description: evidence.description,
                    type: evidence.type,
                    createdAt: this.formatDate(evidence.createdAt),
                    order: evidence.order
                }))
            };
            
            // Generate PDF or export file
            const exportContent = this.generateExportContent(exportData);
            
            // Create and download file
            const blob = new Blob([exportContent], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `binder_${binder.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
            a.click();
            
            this.showNotification('Binder exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting binder:', error);
            this.showNotification('Error exporting binder', 'error');
        }
    }

    generateExportContent(data) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Evidence Binder - ${data.binder.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .evidence-item { border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 5px; }
        .evidence-title { font-weight: bold; color: #333; }
        .evidence-meta { color: #666; font-size: 12px; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Evidence Binder: ${data.binder.name}</h1>
        <p><strong>Description:</strong> ${data.binder.description}</p>
        <p><strong>Created:</strong> ${data.binder.createdAt}</p>
        <p><strong>Auditor:</strong> ${data.binder.auditor}</p>
    </div>
    
    <h2>Evidence Items (${data.evidence.length})</h2>
    ${data.evidence.map(evidence => `
        <div class="evidence-item">
            <div class="evidence-title">${evidence.order}. ${evidence.title}</div>
            <div>${evidence.description}</div>
            <div class="evidence-meta">
                Type: ${evidence.type} | Created: ${evidence.createdAt}
            </div>
        </div>
    `).join('')}
</body>
</html>`;
    }

    generateBinderPreview() {
        if (!this.currentBinder) {
            this.showNotification('No binder selected for preview', 'warning');
            return;
        }
        
        const previewData = {
            binder: this.currentBinder,
            evidence: this.selectedEvidence
        };
        
        const previewContent = this.generateExportContent(previewData);
        
        // Open preview in new window
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(previewContent);
        previewWindow.document.close();
    }

    setupEventListeners() {
        // Create binder button
        const createButton = document.getElementById('createBinder');
        if (createButton) {
            createButton.addEventListener('click', () => {
                this.createBinder();
            });
        }
        
        // Save binder button
        const saveButton = document.getElementById('saveBinder');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveBinder();
            });
        }
        
        // New binder button
        const newButton = document.getElementById('newBinder');
        if (newButton) {
            newButton.addEventListener('click', () => {
                this.newBinder();
            });
        }
        
        // Template selection
        const templateSelect = document.getElementById('binderTemplate');
        if (templateSelect) {
            templateSelect.addEventListener('change', () => {
                this.loadTemplate(templateSelect.value);
            });
        }
    }

    newBinder() {
        this.currentBinder = null;
        this.selectedEvidence = [];
        
        // Clear form
        document.getElementById('binderForm').reset();
        
        // Clear binder container
        const binderContainer = document.getElementById('binderContainer');
        if (binderContainer) {
            binderContainer.innerHTML = '<p class="text-muted">No evidence in binder</p>';
        }
        
        this.updateBinderUI();
        this.showNotification('New binder ready', 'info');
    }

    async loadTemplate(templateId) {
        if (!templateId) return;
        
        try {
            const template = this.binderTemplates.find(t => t.id === templateId);
            if (template) {
                // Apply template structure
                this.applyTemplate(template);
                this.showNotification(`Template "${template.name}" applied`, 'success');
            }
        } catch (error) {
            console.error('Error loading template:', error);
            this.showNotification('Error loading template', 'error');
        }
    }

    applyTemplate(template) {
        // Apply template structure to current binder
        if (template.structure) {
            // This would apply the template's evidence organization structure
            console.log('Applying template structure:', template.structure);
        }
    }

    formatDate(date) {
        if (date && date.toDate) {
            return date.toDate().toLocaleDateString();
        }
        return new Date(date).toLocaleDateString();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize the system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EvidenceBinderCreationSystem();
});

// Mock data for development
const mockEvidence = [
    {
        id: '1',
        title: 'Safety Inspection Report',
        description: 'Comprehensive safety inspection report for Factory A',
        type: 'document',
        createdAt: new Date('2024-01-15'),
        auditorId: 'auditor1'
    },
    {
        id: '2',
        title: 'Worker Interview Statement',
        description: 'Interview statement from worker regarding safety concerns',
        type: 'statement',
        createdAt: new Date('2024-01-14'),
        auditorId: 'auditor1'
    },
    {
        id: '3',
        title: 'Equipment Photos',
        description: 'Photographic evidence of equipment condition',
        type: 'photo',
        createdAt: new Date('2024-01-13'),
        auditorId: 'auditor1'
    }
];

const mockBinders = [
    {
        id: '1',
        name: 'Safety Compliance Binder',
        description: 'Evidence binder for safety compliance audit',
        evidenceCount: 5,
        createdAt: new Date('2024-01-15'),
        auditorId: 'auditor1',
        status: 'draft'
    },
    {
        id: '2',
        name: 'Environmental Audit Binder',
        description: 'Evidence binder for environmental compliance',
        evidenceCount: 3,
        createdAt: new Date('2024-01-14'),
        auditorId: 'auditor1',
        status: 'complete'
    }
];

const mockTemplates = [
    {
        id: '1',
        name: 'Standard Compliance Template',
        description: 'Standard template for compliance audits',
        structure: {
            sections: ['Introduction', 'Evidence', 'Findings', 'Conclusions']
        }
    },
    {
        id: '2',
        name: 'Safety Audit Template',
        description: 'Specialized template for safety audits',
        structure: {
            sections: ['Safety Policies', 'Training Records', 'Incident Reports', 'Inspections']
        }
    }
];
