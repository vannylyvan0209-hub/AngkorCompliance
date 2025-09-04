// Finding Documentation System
class FindingDocumentationSystem {
    constructor() {
        this.currentUser = null;
        this.findings = [];
        this.currentFinding = null;
        this.uploadedFiles = [];
        this.isDraftSaved = false;
        
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
            
            // Load existing findings
            await this.loadFindings();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update statistics
            this.updateStatistics();
            
            console.log('Finding Documentation System initialized successfully');
        } catch (error) {
            console.error('Error initializing Finding Documentation System:', error);
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
        // Initialize form validation
        this.initializeFormValidation();
        
        // Initialize file upload
        this.initializeFileUpload();
        
        // Initialize severity indicators
        this.initializeSeverityIndicators();
        
        // Initialize auto-save
        this.initializeAutoSave();
    }

    initializeFormValidation() {
        const form = document.getElementById('findingForm');
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        if (isRequired && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        // Specific validation rules
        if (field.id === 'findingTitle' && value.length < 5) {
            this.showFieldError(field, 'Title must be at least 5 characters');
            return false;
        }
        
        if (field.id === 'findingDescription' && value.length < 20) {
            this.showFieldError(field, 'Description must be at least 20 characters');
            return false;
        }
        
        if (field.id === 'recommendations' && value.length < 10) {
            this.showFieldError(field, 'Recommendations must be at least 10 characters');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    initializeFileUpload() {
        const fileUpload = document.getElementById('fileUpload');
        const fileInput = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');
        
        // Drag and drop functionality
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.classList.add('dragover');
        });
        
        fileUpload.addEventListener('dragleave', () => {
            fileUpload.classList.remove('dragover');
        });
        
        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('dragover');
            const files = e.dataTransfer.files;
            this.handleFileUpload(files);
        });
        
        // Click to upload
        fileUpload.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    async handleFileUpload(files) {
        const fileList = document.getElementById('fileList');
        
        for (let file of files) {
            try {
                // Validate file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    this.showNotification(`File ${file.name} is too large (max 10MB)`, 'error');
                    continue;
                }
                
                // Validate file type
                const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
                const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
                
                if (!allowedTypes.includes(fileExtension)) {
                    this.showNotification(`File type ${fileExtension} not allowed`, 'error');
                    continue;
                }
                
                // Create file item
                const fileItem = this.createFileItem(file);
                fileList.appendChild(fileItem);
                
                // Store file reference
                this.uploadedFiles.push({
                    file: file,
                    element: fileItem,
                    uploaded: false
                });
                
                this.showNotification(`File ${file.name} added successfully`, 'success');
            } catch (error) {
                console.error('Error handling file upload:', error);
                this.showNotification(`Error uploading ${file.name}`, 'error');
            }
        }
    }

    createFileItem(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
            </div>
            <div class="file-actions">
                <button class="btn btn-sm btn-outline-danger remove-file">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add remove functionality
        fileItem.querySelector('.remove-file').addEventListener('click', () => {
            this.removeFile(fileItem, file);
        });
        
        return fileItem;
    }

    removeFile(fileItem, file) {
        fileItem.remove();
        this.uploadedFiles = this.uploadedFiles.filter(f => f.file !== file);
        this.showNotification(`File ${file.name} removed`, 'info');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    initializeSeverityIndicators() {
        const severitySelect = document.getElementById('findingSeverity');
        const prioritySelect = document.getElementById('findingPriority');
        
        severitySelect.addEventListener('change', () => {
            this.updateSeverityIndicator();
        });
        
        prioritySelect.addEventListener('change', () => {
            this.updatePriorityIndicator();
        });
    }

    updateSeverityIndicator() {
        const severity = document.getElementById('findingSeverity').value;
        const severityField = document.getElementById('findingSeverity');
        
        // Remove existing classes
        severityField.classList.remove('severity-critical', 'severity-major', 'severity-minor', 'severity-observation');
        
        // Add appropriate class
        if (severity) {
            severityField.classList.add(`severity-${severity}`);
        }
    }

    updatePriorityIndicator() {
        const priority = document.getElementById('findingPriority').value;
        const priorityField = document.getElementById('findingPriority');
        
        // Remove existing classes
        priorityField.classList.remove('priority-immediate', 'priority-high', 'priority-medium', 'priority-low');
        
        // Add appropriate class
        if (priority) {
            priorityField.classList.add(`priority-${priority}`);
        }
    }

    initializeAutoSave() {
        const form = document.getElementById('findingForm');
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.autoSaveDraft();
            });
        });
    }

    autoSaveDraft() {
        if (this.isDraftSaved) return;
        
        setTimeout(() => {
            this.saveDraft();
        }, 2000);
    }

    async saveDraft() {
        try {
            const formData = this.getFormData();
            formData.status = 'draft';
            formData.lastModified = new Date();
            formData.userId = this.currentUser.uid;
            
            // Save to localStorage for immediate access
            localStorage.setItem('findingDraft', JSON.stringify(formData));
            
            // Save to Firebase
            const draftRef = await this.db.collection('findingDrafts').add(formData);
            
            this.isDraftSaved = true;
            this.showNotification('Draft saved successfully', 'success');
            
            console.log('Draft saved with ID:', draftRef.id);
        } catch (error) {
            console.error('Error saving draft:', error);
            this.showNotification('Error saving draft', 'error');
        }
    }

    async loadDraft() {
        try {
            // Try to load from localStorage first
            const localDraft = localStorage.getItem('findingDraft');
            if (localDraft) {
                const draftData = JSON.parse(localDraft);
                this.populateForm(draftData);
                this.showNotification('Draft loaded from local storage', 'info');
                return;
            }
            
            // Load from Firebase
            const draftsSnapshot = await this.db.collection('findingDrafts')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('lastModified', 'desc')
                .limit(1)
                .get();
            
            if (!draftsSnapshot.empty) {
                const draftData = draftsSnapshot.docs[0].data();
                this.populateForm(draftData);
                this.showNotification('Draft loaded from cloud', 'info');
            } else {
                this.showNotification('No draft found', 'info');
            }
        } catch (error) {
            console.error('Error loading draft:', error);
            this.showNotification('Error loading draft', 'error');
        }
    }

    populateForm(data) {
        Object.keys(data).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                if (field.type === 'date') {
                    field.value = data[key] ? new Date(data[key].toDate()).toISOString().split('T')[0] : '';
                } else {
                    field.value = data[key] || '';
                }
            }
        });
        
        this.updateSeverityIndicator();
        this.updatePriorityIndicator();
    }

    async loadFindings() {
        try {
            const findingsSnapshot = await this.db.collection('findings')
                .where('auditorId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            this.findings = [];
            findingsSnapshot.forEach(doc => {
                this.findings.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.displayRecentFindings();
            this.updateStatistics();
        } catch (error) {
            console.error('Error loading findings:', error);
            this.showNotification('Error loading findings', 'error');
        }
    }

    displayRecentFindings() {
        const recentFindings = document.getElementById('recentFindings');
        recentFindings.innerHTML = '';
        
        if (this.findings.length === 0) {
            recentFindings.innerHTML = '<p class="text-muted">No findings yet</p>';
            return;
        }
        
        this.findings.forEach(finding => {
            const findingItem = document.createElement('div');
            findingItem.className = 'finding-item';
            findingItem.innerHTML = `
                <div class="finding-header">
                    <h6 class="finding-title">${finding.title}</h6>
                    <span class="severity-badge severity-${finding.severity}">${finding.severity}</span>
                </div>
                <div class="finding-meta">
                    <span class="finding-category">${finding.category}</span>
                    <span class="finding-date">${this.formatDate(finding.createdAt)}</span>
                </div>
                <p class="finding-description">${finding.description.substring(0, 100)}...</p>
            `;
            
            findingItem.addEventListener('click', () => {
                this.loadFinding(finding);
            });
            
            recentFindings.appendChild(findingItem);
        });
    }

    async loadFinding(finding) {
        this.currentFinding = finding;
        this.populateForm(finding);
        
        // Update UI to show editing mode
        document.getElementById('submitFinding').textContent = 'Update Finding';
        document.getElementById('submitFinding').innerHTML = '<i class="fas fa-edit"></i> Update Finding';
        
        this.showNotification(`Loaded finding: ${finding.title}`, 'info');
    }

    updateStatistics() {
        const stats = {
            total: this.findings.length,
            critical: this.findings.filter(f => f.severity === 'critical').length,
            major: this.findings.filter(f => f.severity === 'major').length,
            minor: this.findings.filter(f => f.severity === 'minor').length
        };
        
        document.getElementById('totalFindings').textContent = stats.total;
        document.getElementById('criticalFindings').textContent = stats.critical;
        document.getElementById('majorFindings').textContent = stats.major;
        document.getElementById('minorFindings').textContent = stats.minor;
    }

    setupEventListeners() {
        // Save draft button
        document.getElementById('saveDraft').addEventListener('click', () => {
            this.saveDraft();
        });
        
        // Submit finding button
        document.getElementById('submitFinding').addEventListener('click', () => {
            this.submitFinding();
        });
        
        // Load template button
        document.getElementById('loadTemplate').addEventListener('click', () => {
            this.loadTemplate();
        });
        
        // Export findings button
        document.getElementById('exportFindings').addEventListener('click', () => {
            this.exportFindings();
        });
        
        // Generate report button
        document.getElementById('generateReport').addEventListener('click', () => {
            this.generateReport();
        });
        
        // Form submission
        document.getElementById('findingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFinding();
        });
    }

    async submitFinding() {
        try {
            // Validate form
            if (!this.validateForm()) {
                this.showNotification('Please fix form errors before submitting', 'error');
                return;
            }
            
            // Get form data
            const formData = this.getFormData();
            formData.status = 'submitted';
            formData.createdAt = new Date();
            formData.auditorId = this.currentUser.uid;
            formData.auditorName = this.currentUser.displayName || this.currentUser.email;
            
            // Upload files if any
            if (this.uploadedFiles.length > 0) {
                formData.attachments = await this.uploadFiles();
            }
            
            // Save to Firebase
            let findingRef;
            if (this.currentFinding) {
                // Update existing finding
                findingRef = await this.db.collection('findings').doc(this.currentFinding.id).update(formData);
                this.showNotification('Finding updated successfully', 'success');
            } else {
                // Create new finding
                findingRef = await this.db.collection('findings').add(formData);
                this.showNotification('Finding submitted successfully', 'success');
            }
            
            // Clear form
            this.clearForm();
            
            // Reload findings
            await this.loadFindings();
            
            // Clear draft
            localStorage.removeItem('findingDraft');
            this.isDraftSaved = false;
            
        } catch (error) {
            console.error('Error submitting finding:', error);
            this.showNotification('Error submitting finding', 'error');
        }
    }

    validateForm() {
        const requiredFields = ['findingTitle', 'findingCategory', 'findingSeverity', 'findingPriority', 'findingDescription', 'recommendations'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    getFormData() {
        const form = document.getElementById('findingForm');
        const formData = {};
        
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name || input.id) {
                const key = input.name || input.id;
                formData[key] = input.value;
            }
        });
        
        return formData;
    }

    async uploadFiles() {
        const uploadedFiles = [];
        
        for (let fileData of this.uploadedFiles) {
            try {
                const file = fileData.file;
                const fileName = `findings/${Date.now()}_${file.name}`;
                const fileRef = this.storage.ref().child(fileName);
                
                const snapshot = await fileRef.put(file);
                const downloadURL = await snapshot.ref.getDownloadURL();
                
                uploadedFiles.push({
                    name: file.name,
                    url: downloadURL,
                    size: file.size,
                    type: file.type
                });
                
                fileData.uploaded = true;
            } catch (error) {
                console.error('Error uploading file:', error);
                this.showNotification(`Error uploading ${fileData.file.name}`, 'error');
            }
        }
        
        return uploadedFiles;
    }

    clearForm() {
        document.getElementById('findingForm').reset();
        document.getElementById('fileList').innerHTML = '';
        this.uploadedFiles = [];
        this.currentFinding = null;
        
        // Reset submit button
        document.getElementById('submitFinding').textContent = 'Submit Finding';
        document.getElementById('submitFinding').innerHTML = '<i class="fas fa-paper-plane"></i> Submit Finding';
        
        // Clear severity indicators
        this.updateSeverityIndicator();
        this.updatePriorityIndicator();
    }

    loadTemplate() {
        const template = {
            findingTitle: 'Sample Finding Title',
            findingCategory: 'compliance',
            findingSeverity: 'major',
            findingPriority: 'high',
            findingDescription: 'This is a sample finding description that demonstrates the proper format and level of detail required for audit findings.',
            findingCriteria: 'Reference to specific standard requirement or criteria that was not met.',
            findingEvidence: 'Documentation of the evidence that supports this finding.',
            businessImpact: 'medium',
            riskLevel: 'high',
            impactDescription: 'Description of the potential impact of this finding on business operations.',
            recommendations: 'Specific, actionable recommendations to address the finding and prevent recurrence.',
            responsibleParty: 'Department or person responsible for implementing the recommendations.'
        };
        
        this.populateForm(template);
        this.showNotification('Template loaded', 'info');
    }

    exportFindings() {
        const data = this.findings.map(finding => ({
            Title: finding.title,
            Category: finding.category,
            Severity: finding.severity,
            Priority: finding.priority,
            Description: finding.description,
            Created: this.formatDate(finding.createdAt),
            Status: finding.status
        }));
        
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `findings_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        this.showNotification('Findings exported successfully', 'success');
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }

    generateReport() {
        // This would integrate with a report generation service
        this.showNotification('Report generation feature coming soon', 'info');
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
    new FindingDocumentationSystem();
});

// Mock data for development
const mockFindings = [
    {
        id: '1',
        title: 'Inadequate Safety Training Records',
        category: 'safety',
        severity: 'major',
        priority: 'high',
        description: 'Safety training records for new employees are incomplete and missing required documentation.',
        createdAt: new Date('2024-01-15'),
        status: 'submitted'
    },
    {
        id: '2',
        title: 'Non-Compliant Waste Disposal Procedures',
        category: 'environmental',
        severity: 'critical',
        priority: 'immediate',
        description: 'Waste disposal procedures do not meet environmental compliance standards.',
        createdAt: new Date('2024-01-14'),
        status: 'submitted'
    },
    {
        id: '3',
        title: 'Insufficient Quality Control Documentation',
        category: 'quality',
        severity: 'minor',
        priority: 'medium',
        description: 'Quality control procedures lack proper documentation and verification records.',
        createdAt: new Date('2024-01-13'),
        status: 'submitted'
    }
];
