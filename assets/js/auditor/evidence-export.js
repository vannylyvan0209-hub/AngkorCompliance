class EvidenceExporter {
    constructor() {
        this.currentUser = null;
        this.exportHistory = [];
        this.exportTemplates = [];
        this.currentExport = null;
        this.evidenceData = [];
        
        this.initializeFirebase();
        this.initializeEventListeners();
        this.loadInitialData();
    }

    async initializeFirebase() {
        try {
            // Initialize Firebase (assuming firebase is already loaded)
            if (typeof firebase !== 'undefined') {
                await this.checkAuthentication();
            } else {
                console.error('Firebase not loaded');
            }
        } catch (error) {
            console.error('Firebase initialization error:', error);
        }
    }

    async checkAuthentication() {
        try {
            const user = firebase.auth().currentUser;
            if (user) {
                this.currentUser = user;
                await this.loadUserData();
            } else {
                // Redirect to login if not authenticated
                window.location.href = '../../login.html';
            }
        } catch (error) {
            console.error('Authentication error:', error);
        }
    }

    async loadUserData() {
        try {
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .get();
            
            if (userDoc.exists && userDoc.data().role === 'auditor') {
                await this.loadEvidenceData();
                await this.loadExportHistory();
                await this.loadExportTemplates();
                this.updateStatistics();
            } else {
                console.error('User not authorized as auditor');
                window.location.href = '../../login.html';
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async loadEvidenceData() {
        try {
            const evidenceSnapshot = await firebase.firestore()
                .collection('evidence')
                .where('auditorId', '==', this.currentUser.uid)
                .get();
            
            this.evidenceData = evidenceSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.populateCategoryFilter();
        } catch (error) {
            console.error('Error loading evidence data:', error);
        }
    }

    populateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        const categories = [...new Set(this.evidenceData.map(item => item.category))];
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    async loadExportHistory() {
        try {
            const historySnapshot = await firebase.firestore()
                .collection('exportHistory')
                .where('auditorId', '==', this.currentUser.uid)
                .orderBy('exportDate', 'desc')
                .limit(50)
                .get();
            
            this.exportHistory = historySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderExportHistory();
        } catch (error) {
            console.error('Error loading export history:', error);
        }
    }

    async loadExportTemplates() {
        try {
            const templatesSnapshot = await firebase.firestore()
                .collection('exportTemplates')
                .where('auditorId', '==', this.currentUser.uid)
                .get();
            
            this.exportTemplates = templatesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.renderExportTemplates();
        } catch (error) {
            console.error('Error loading export templates:', error);
        }
    }

    updateStatistics() {
        document.getElementById('totalEvidence').textContent = this.evidenceData.length;
        
        const today = new Date().toDateString();
        const exportedToday = this.exportHistory.filter(export_ => 
            new Date(export_.exportDate.toDate()).toDateString() === today
        ).length;
        document.getElementById('exportedToday').textContent = exportedToday;
        
        const pendingExports = this.exportHistory.filter(export_ => 
            export_.status === 'pending' || export_.status === 'processing'
        ).length;
        document.getElementById('pendingExports').textContent = pendingExports;
    }

    initializeEventListeners() {
        // Export configuration
        document.getElementById('generateExportBtn').addEventListener('click', () => this.generateExport());
        document.getElementById('quickExportBtn').addEventListener('click', () => this.quickExport());
        
        // Template management
        document.getElementById('saveTemplateBtn').addEventListener('click', () => this.saveAsTemplate());
        document.getElementById('loadTemplateBtn').addEventListener('click', () => this.loadTemplate());
        document.getElementById('createTemplateBtn').addEventListener('click', () => this.showTemplateModal());
        
        // History management
        document.getElementById('refreshHistoryBtn').addEventListener('click', () => this.loadExportHistory());
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
        
        // Quick date buttons
        document.querySelectorAll('.quick-dates button').forEach(button => {
            button.addEventListener('click', (e) => this.setQuickDate(parseInt(e.target.dataset.days)));
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', () => this.closeModal(button.closest('.modal')));
        });
        
        // Template modal
        document.getElementById('cancelTemplateBtn').addEventListener('click', () => this.closeTemplateModal());
        document.getElementById('saveTemplateBtn').addEventListener('click', () => this.saveTemplate());
        
        // Export details modal
        document.getElementById('closeDetailsBtn').addEventListener('click', () => this.closeExportDetailsModal());
        document.getElementById('downloadExportBtn').addEventListener('click', () => this.downloadExport());
    }

    setQuickDate(days) {
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        
        document.getElementById('fromDate').value = fromDate.toISOString().split('T')[0];
        document.getElementById('toDate').value = toDate.toISOString().split('T')[0];
    }

    async generateExport() {
        try {
            const exportConfig = this.getExportConfiguration();
            const filteredEvidence = this.filterEvidence(exportConfig);
            
            if (filteredEvidence.length === 0) {
                alert('No evidence found matching the selected criteria.');
                return;
            }
            
            this.currentExport = {
                id: this.generateExportId(),
                config: exportConfig,
                evidence: filteredEvidence,
                status: 'pending',
                exportDate: new Date(),
                auditorId: this.currentUser.uid
            };
            
            await this.saveExportToHistory();
            this.showExportProgressModal();
            await this.processExport();
            
        } catch (error) {
            console.error('Error generating export:', error);
            alert('Error generating export. Please try again.');
        }
    }

    async quickExport() {
        try {
            // Set default configuration for quick export
            document.getElementById('includeMetadata').checked = true;
            document.getElementById('includeThumbnails').checked = true;
            document.getElementById('includeLinks').checked = true;
            document.getElementById('includeAuditTrail').checked = false;
            
            // Set date to last 30 days
            this.setQuickDate(30);
            
            // Generate export with default settings
            await this.generateExport();
            
        } catch (error) {
            console.error('Error in quick export:', error);
        }
    }

    getExportConfiguration() {
        const format = document.querySelector('input[name="format"]:checked').value;
        const includeMetadata = document.getElementById('includeMetadata').checked;
        const includeThumbnails = document.getElementById('includeThumbnails').checked;
        const includeLinks = document.getElementById('includeLinks').checked;
        const includeAuditTrail = document.getElementById('includeAuditTrail').checked;
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;
        const category = document.getElementById('categoryFilter').value;
        const status = document.getElementById('statusFilter').value;
        const fileType = document.getElementById('fileTypeFilter').value;
        
        return {
            format,
            includeMetadata,
            includeThumbnails,
            includeLinks,
            includeAuditTrail,
            fromDate,
            toDate,
            category,
            status,
            fileType
        };
    }

    filterEvidence(config) {
        let filtered = this.evidenceData;
        
        // Filter by date range
        if (config.fromDate && config.toDate) {
            const fromDate = new Date(config.fromDate);
            const toDate = new Date(config.toDate);
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.uploadDate.toDate());
                return itemDate >= fromDate && itemDate <= toDate;
            });
        }
        
        // Filter by category
        if (config.category) {
            filtered = filtered.filter(item => item.category === config.category);
        }
        
        // Filter by status
        if (config.status) {
            filtered = filtered.filter(item => item.status === config.status);
        }
        
        // Filter by file type
        if (config.fileType) {
            filtered = filtered.filter(item => item.fileType === config.fileType);
        }
        
        return filtered;
    }

    generateExportId() {
        return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async saveExportToHistory() {
        try {
            await firebase.firestore()
                .collection('exportHistory')
                .doc(this.currentExport.id)
                .set(this.currentExport);
            
            this.exportHistory.unshift(this.currentExport);
            this.renderExportHistory();
            this.updateStatistics();
        } catch (error) {
            console.error('Error saving export to history:', error);
        }
    }

    showExportProgressModal() {
        document.getElementById('exportProgressModal').style.display = 'flex';
        this.resetProgressSteps();
    }

    resetProgressSteps() {
        for (let i = 1; i <= 4; i++) {
            const step = document.getElementById(`step${i}`);
            step.querySelector('.step-icon').setAttribute('data-lucide', 'circle');
            step.classList.remove('completed');
        }
    }

    async processExport() {
        try {
            // Step 1: Collecting evidence
            await this.updateProgressStep(1, 'Collecting evidence...');
            await this.simulateProgress(1000);
            
            // Step 2: Processing files
            await this.updateProgressStep(2, 'Processing files...');
            await this.simulateProgress(1500);
            
            // Step 3: Generating report
            await this.updateProgressStep(3, 'Generating report...');
            await this.simulateProgress(2000);
            
            // Step 4: Finalizing export
            await this.updateProgressStep(4, 'Finalizing export...');
            await this.simulateProgress(1000);
            
            // Complete export
            this.completeExport();
            
        } catch (error) {
            console.error('Error processing export:', error);
            this.updateProgressText('Export failed. Please try again.');
        }
    }

    async updateProgressStep(stepNumber, text) {
        const step = document.getElementById(`step${stepNumber}`);
        const icon = step.querySelector('.step-icon');
        
        // Update previous steps to completed
        for (let i = 1; i < stepNumber; i++) {
            const prevStep = document.getElementById(`step${i}`);
            prevStep.querySelector('.step-icon').setAttribute('data-lucide', 'check-circle');
            prevStep.classList.add('completed');
        }
        
        // Update current step
        icon.setAttribute('data-lucide', 'loader-2');
        step.classList.add('active');
        
        this.updateProgressText(text);
        
        // Re-render Lucide icons
        lucide.createIcons();
    }

    async simulateProgress(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    updateProgressText(text) {
        document.getElementById('exportProgressText').textContent = text;
    }

    completeExport() {
        this.currentExport.status = 'completed';
        this.currentExport.completedDate = new Date();
        this.currentExport.fileSize = this.calculateFileSize();
        
        this.updateProgressText('Export completed successfully!');
        
        // Update export history
        this.updateExportInHistory();
        
        // Close progress modal after delay
        setTimeout(() => {
            this.closeModal(document.getElementById('exportProgressModal'));
            this.showExportDetailsModal();
        }, 2000);
    }

    calculateFileSize() {
        // Mock file size calculation based on evidence count and format
        const baseSize = this.currentExport.evidence.length * 1024; // 1KB per evidence item
        const formatMultiplier = {
            'pdf': 1.5,
            'excel': 1.2,
            'zip': 0.8,
            'json': 0.5
        };
        
        return Math.round(baseSize * formatMultiplier[this.currentExport.config.format]);
    }

    async updateExportInHistory() {
        try {
            await firebase.firestore()
                .collection('exportHistory')
                .doc(this.currentExport.id)
                .update({
                    status: this.currentExport.status,
                    completedDate: this.currentExport.completedDate,
                    fileSize: this.currentExport.fileSize
                });
            
            const index = this.exportHistory.findIndex(exp => exp.id === this.currentExport.id);
            if (index !== -1) {
                this.exportHistory[index] = { ...this.currentExport };
                this.renderExportHistory();
            }
        } catch (error) {
            console.error('Error updating export in history:', error);
        }
    }

    showExportDetailsModal() {
        const modal = document.getElementById('exportDetailsModal');
        const content = document.getElementById('exportDetailsContent');
        
        content.innerHTML = `
            <div class="export-summary">
                <h4>Export Summary</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <strong>Export ID:</strong> ${this.currentExport.id}
                    </div>
                    <div class="summary-item">
                        <strong>Format:</strong> ${this.currentExport.config.format.toUpperCase()}
                    </div>
                    <div class="summary-item">
                        <strong>Evidence Items:</strong> ${this.currentExport.evidence.length}
                    </div>
                    <div class="summary-item">
                        <strong>File Size:</strong> ${this.formatFileSize(this.currentExport.fileSize)}
                    </div>
                    <div class="summary-item">
                        <strong>Export Date:</strong> ${this.currentExport.exportDate.toLocaleString()}
                    </div>
                    <div class="summary-item">
                        <strong>Status:</strong> <span class="status-badge completed">Completed</span>
                    </div>
                </div>
            </div>
            <div class="evidence-preview">
                <h4>Evidence Preview (${this.currentExport.evidence.length} items)</h4>
                <div class="evidence-list">
                    ${this.currentExport.evidence.slice(0, 10).map(item => `
                        <div class="evidence-item">
                            <i data-lucide="${this.getFileIcon(item.fileType)}"></i>
                            <span>${item.fileName}</span>
                            <small>${item.category} • ${item.status}</small>
                        </div>
                    `).join('')}
                    ${this.currentExport.evidence.length > 10 ? 
                        `<div class="evidence-more">... and ${this.currentExport.evidence.length - 10} more items</div>` : 
                        ''}
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        lucide.createIcons();
    }

    getFileIcon(fileType) {
        const iconMap = {
            'image': 'image',
            'document': 'file-text',
            'video': 'video',
            'audio': 'music',
            'default': 'file'
        };
        return iconMap[fileType] || iconMap.default;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    renderExportHistory() {
        const tbody = document.getElementById('exportHistoryBody');
        tbody.innerHTML = '';
        
        this.exportHistory.forEach(export_ => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${export_.exportDate.toDate().toLocaleDateString()}</td>
                <td><span class="format-badge ${export_.config.format}">${export_.config.format.toUpperCase()}</span></td>
                <td>${export_.evidence.length} items</td>
                <td><span class="status-badge ${export_.status}">${export_.status}</span></td>
                <td>${export_.fileSize ? this.formatFileSize(export_.fileSize) : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="evidenceExporter.viewExportDetails('${export_.id}')">
                        <i data-lucide="eye"></i>
                    </button>
                    ${export_.status === 'completed' ? `
                        <button class="btn btn-sm btn-primary" onclick="evidenceExporter.downloadExport('${export_.id}')">
                            <i data-lucide="download"></i>
                        </button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(row);
        });
        
        lucide.createIcons();
    }

    renderExportTemplates() {
        const grid = document.getElementById('templatesGrid');
        grid.innerHTML = '';
        
        this.exportTemplates.forEach(template => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.innerHTML = `
                <div class="template-header">
                    <h4>${template.name}</h4>
                    <div class="template-actions">
                        <button class="btn btn-sm btn-outline" onclick="evidenceExporter.loadTemplate('${template.id}')">
                            <i data-lucide="folder-open"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="evidenceExporter.deleteTemplate('${template.id}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                <p class="template-description">${template.description || 'No description'}</p>
                <div class="template-settings">
                    <small>Format: ${template.defaultFormat || 'PDF'}</small>
                    <small>Items: ${template.defaultItems || 'All'}</small>
                </div>
            `;
            grid.appendChild(card);
        });
        
        lucide.createIcons();
    }

    async saveAsTemplate() {
        try {
            const config = this.getExportConfiguration();
            const template = {
                name: `Export Template ${new Date().toLocaleDateString()}`,
                description: 'Custom export configuration',
                config: config,
                defaultFormat: config.format,
                defaultItems: 'Filtered',
                auditorId: this.currentUser.uid,
                createdDate: new Date()
            };
            
            const docRef = await firebase.firestore()
                .collection('exportTemplates')
                .add(template);
            
            template.id = docRef.id;
            this.exportTemplates.push(template);
            this.renderExportTemplates();
            
            alert('Template saved successfully!');
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Error saving template. Please try again.');
        }
    }

    async loadTemplate(templateId) {
        try {
            const template = this.exportTemplates.find(t => t.id === templateId);
            if (template) {
                this.applyTemplate(template.config);
                alert('Template loaded successfully!');
            }
        } catch (error) {
            console.error('Error loading template:', error);
        }
    }

    applyTemplate(config) {
        // Apply template configuration to form
        document.querySelector(`input[name="format"][value="${config.format}"]`).checked = true;
        document.getElementById('includeMetadata').checked = config.includeMetadata;
        document.getElementById('includeThumbnails').checked = config.includeThumbnails;
        document.getElementById('includeLinks').checked = config.includeLinks;
        document.getElementById('includeAuditTrail').checked = config.includeAuditTrail;
        document.getElementById('fromDate').value = config.fromDate;
        document.getElementById('toDate').value = config.toDate;
        document.getElementById('categoryFilter').value = config.category;
        document.getElementById('statusFilter').value = config.status;
        document.getElementById('fileTypeFilter').value = config.fileType;
    }

    async deleteTemplate(templateId) {
        if (confirm('Are you sure you want to delete this template?')) {
            try {
                await firebase.firestore()
                    .collection('exportTemplates')
                    .doc(templateId)
                    .delete();
                
                this.exportTemplates = this.exportTemplates.filter(t => t.id !== templateId);
                this.renderExportTemplates();
                
                alert('Template deleted successfully!');
            } catch (error) {
                console.error('Error deleting template:', error);
                alert('Error deleting template. Please try again.');
            }
        }
    }

    showTemplateModal() {
        document.getElementById('templateModalTitle').textContent = 'Create Export Template';
        document.getElementById('templateModal').style.display = 'flex';
        document.getElementById('templateForm').reset();
    }

    closeTemplateModal() {
        document.getElementById('templateModal').style.display = 'none';
    }

    async saveTemplate() {
        try {
            const name = document.getElementById('templateName').value;
            const description = document.getElementById('templateDescription').value;
            
            if (!name.trim()) {
                alert('Template name is required.');
                return;
            }
            
            const config = this.getExportConfiguration();
            const template = {
                name: name.trim(),
                description: description.trim(),
                config: config,
                defaultFormat: config.format,
                defaultItems: 'Filtered',
                auditorId: this.currentUser.uid,
                createdDate: new Date()
            };
            
            const docRef = await firebase.firestore()
                .collection('exportTemplates')
                .add(template);
            
            template.id = docRef.id;
            this.exportTemplates.push(template);
            this.renderExportTemplates();
            
            this.closeTemplateModal();
            alert('Template created successfully!');
        } catch (error) {
            console.error('Error creating template:', error);
            alert('Error creating template. Please try again.');
        }
    }

    async clearHistory() {
        if (confirm('Are you sure you want to clear all export history? This action cannot be undone.')) {
            try {
                // Clear from Firestore
                const batch = firebase.firestore().batch();
                this.exportHistory.forEach(export_ => {
                    batch.delete(firebase.firestore().collection('exportHistory').doc(export_.id));
                });
                await batch.commit();
                
                // Clear local data
                this.exportHistory = [];
                this.renderExportHistory();
                this.updateStatistics();
                
                alert('Export history cleared successfully!');
            } catch (error) {
                console.error('Error clearing history:', error);
                alert('Error clearing history. Please try again.');
            }
        }
    }

    viewExportDetails(exportId) {
        const export_ = this.exportHistory.find(exp => exp.id === exportId);
        if (export_) {
            this.currentExport = export_;
            this.showExportDetailsModal();
        }
    }

    async downloadExport(exportId) {
        try {
            const export_ = this.exportHistory.find(exp => exp.id === exportId);
            if (export_ && export_.status === 'completed') {
                // Simulate file download
                const link = document.createElement('a');
                link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(export_, null, 2))}`;
                link.download = `evidence_export_${export_.id}.${export_.config.format}`;
                link.click();
                
                alert('Export downloaded successfully!');
            }
        } catch (error) {
            console.error('Error downloading export:', error);
            alert('Error downloading export. Please try again.');
        }
    }

    closeModal(modal) {
        modal.style.display = 'none';
    }

    closeExportDetailsModal() {
        document.getElementById('exportDetailsModal').style.display = 'none';
    }
}

// Initialize the Evidence Exporter when the page loads
let evidenceExporter;
document.addEventListener('DOMContentLoaded', () => {
    evidenceExporter = new EvidenceExporter();
});
