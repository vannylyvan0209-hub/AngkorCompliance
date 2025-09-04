import { initializeFirebase } from '../../firebase-config.js';

class EvidenceCollector {
    constructor() {
        this.db = null;
        this.auth = null;
        this.storage = null;
        this.currentUser = null;
        this.currentFactory = null;
        this.evidenceItems = [];
        this.uploadedFiles = [];
        this.currentEvidenceId = null;
        
        // Standard requirements mapping
        this.standardRequirements = {
            iso_9001: [
                { id: '4.1', title: 'Understanding the organization and its context' },
                { id: '5.1', title: 'Leadership and commitment' },
                { id: '6.1', title: 'Actions to address risks and opportunities' },
                { id: '7.1', title: 'Resources' },
                { id: '8.1', title: 'Operational planning and control' },
                { id: '9.1', title: 'Monitoring, measurement, analysis and evaluation' },
                { id: '10.1', title: 'Improvement' }
            ],
            iso_14001: [
                { id: '4.1', title: 'Understanding the organization and its context' },
                { id: '5.1', title: 'Leadership and commitment' },
                { id: '6.1', title: 'Actions to address risks and opportunities' },
                { id: '7.1', title: 'Resources' },
                { id: '8.1', title: 'Operational planning and control' },
                { id: '9.1', title: 'Monitoring, measurement, analysis and evaluation' },
                { id: '10.1', title: 'Improvement' }
            ]
        };
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.storage = firebase.storage();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            await this.loadEvidence();
            this.renderEvidence();
            this.updateStats();
            lucide.createIcons();
        } catch (error) {
            console.error('Error initializing Evidence Collector:', error);
            this.showError('Failed to initialize evidence collection system');
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
                            if (userData.role === 'auditor' || userData.role === 'super_admin') {
                                this.currentFactory = userData.factoryId;
                                resolve();
                            } else {
                                reject(new Error('Access denied. Auditor role required.'));
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
        // File upload event listeners
        const evidenceFile = document.getElementById('evidenceFile');
        if (evidenceFile) {
            evidenceFile.addEventListener('change', (e) => this.handleFileSelection(e));
        }
    }

    handleFileSelection(event) {
        this.uploadedFiles = Array.from(event.target.files);
        this.renderFileList();
    }

    renderFileList() {
        const container = document.getElementById('fileList');
        if (!container) return;

        container.innerHTML = this.uploadedFiles.map((file, index) => `
            <div class="file-item">
                <div class="file-info">
                    <i data-lucide="file"></i>
                    <div class="file-details">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${this.formatFileSize(file.size)}</span>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline" onclick="evidenceCollector.removeFile(${index})">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `).join('');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.renderFileList();
    }

    updateRequirements() {
        const standard = document.getElementById('auditStandard').value;
        const requirementSelect = document.getElementById('requirement');
        
        requirementSelect.innerHTML = '<option value="">Select Requirement</option>';
        
        if (standard && this.standardRequirements[standard]) {
            this.standardRequirements[standard].forEach(req => {
                const option = document.createElement('option');
                option.value = req.id;
                option.textContent = `${req.id} - ${req.title}`;
                requirementSelect.appendChild(option);
            });
        }
    }

    updateModalRequirements() {
        const standard = document.getElementById('modalAuditStandard').value;
        const requirementSelect = document.getElementById('modalRequirement');
        
        requirementSelect.innerHTML = '<option value="">Select Requirement</option>';
        
        if (standard && this.standardRequirements[standard]) {
            this.standardRequirements[standard].forEach(req => {
                const option = document.createElement('option');
                option.value = req.id;
                option.textContent = `${req.id} - ${req.title}`;
                requirementSelect.appendChild(option);
            });
        }
    }

    toggleEvidenceFields() {
        const evidenceType = document.getElementById('modalEvidenceType').value;
        
        // Hide all evidence fields
        document.querySelectorAll('.evidence-field').forEach(field => {
            field.style.display = 'none';
        });
        
        // Show relevant field based on type
        switch (evidenceType) {
            case 'document':
            case 'photo':
            case 'video':
            case 'audio':
                document.getElementById('fileUploadSection').style.display = 'block';
                break;
            case 'interview':
                document.getElementById('interviewSection').style.display = 'block';
                break;
            case 'observation':
                document.getElementById('observationSection').style.display = 'block';
                break;
            case 'sample':
                document.getElementById('sampleSection').style.display = 'block';
                break;
            default:
                document.getElementById('textContentSection').style.display = 'block';
        }
    }

    async loadEvidence() {
        try {
            const evidenceSnapshot = await this.db
                .collection('audit_evidence')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('createdAt', 'desc')
                .get();

            this.evidenceItems = [];
            evidenceSnapshot.forEach(doc => {
                const evidenceData = doc.data();
                this.evidenceItems.push({
                    id: doc.id,
                    ...evidenceData
                });
            });
        } catch (error) {
            console.error('Error loading evidence:', error);
        }
    }

    renderEvidence() {
        const evidenceGrid = document.getElementById('evidenceGrid');
        
        if (this.evidenceItems.length === 0) {
            evidenceGrid.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="folder-open"></i>
                    <p>No evidence collected yet</p>
                    <button class="btn btn-primary" onclick="evidenceCollector.openCollectionModal()">
                        <i data-lucide="plus"></i>
                        Add First Evidence
                    </button>
                </div>
            `;
            return;
        }

        evidenceGrid.innerHTML = this.evidenceItems.map(evidence => `
            <div class="evidence-card" onclick="evidenceCollector.openEvidenceReview('${evidence.id}')">
                <div class="evidence-header">
                    <div class="evidence-icon">
                        <i data-lucide="${this.getEvidenceIcon(evidence.evidenceType)}"></i>
                    </div>
                    <div class="evidence-status">
                        <span class="status-badge status-${evidence.status || 'pending'}">${evidence.status || 'pending'}</span>
                    </div>
                </div>
                <div class="evidence-content">
                    <h3>${evidence.title}</h3>
                    <div class="evidence-meta">
                        <span class="standard">${this.getStandardDisplay(evidence.auditStandard)}</span>
                        <span class="requirement">${evidence.requirement}</span>
                        <span class="type">${this.getEvidenceTypeDisplay(evidence.evidenceType)}</span>
                    </div>
                    <p class="evidence-description">${evidence.description || 'No description provided'}</p>
                    <div class="evidence-footer">
                        <span class="date">${this.formatDate(evidence.createdAt)}</span>
                        <span class="size">${evidence.fileSize ? this.formatFileSize(evidence.fileSize) : 'N/A'}</span>
                    </div>
                </div>
                <div class="evidence-actions">
                    <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); evidenceCollector.downloadEvidence('${evidence.id}')">
                        <i data-lucide="download"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); evidenceCollector.deleteEvidence('${evidence.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getEvidenceIcon(evidenceType) {
        const icons = {
            document: 'file-text',
            photo: 'image',
            video: 'video',
            audio: 'music',
            interview: 'users',
            observation: 'eye',
            sample: 'package'
        };
        return icons[evidenceType] || 'file';
    }

    getStandardDisplay(standard) {
        const standards = {
            iso_9001: 'ISO 9001',
            iso_14001: 'ISO 14001',
            ohsas_18001: 'OHSAS 18001',
            sa_8000: 'SA 8000',
            custom: 'Custom'
        };
        return standards[standard] || standard;
    }

    getEvidenceTypeDisplay(type) {
        const types = {
            document: 'Document',
            photo: 'Photo',
            video: 'Video',
            audio: 'Audio',
            interview: 'Interview',
            observation: 'Observation',
            sample: 'Sample'
        };
        return types[type] || type;
    }

    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }

    openCollectionModal() {
        document.getElementById('evidenceCollectionModal').style.display = 'flex';
        document.getElementById('evidenceForm').reset();
        this.uploadedFiles = [];
        this.renderFileList();
        this.toggleEvidenceFields();
    }

    closeCollectionModal() {
        document.getElementById('evidenceCollectionModal').style.display = 'none';
    }

    async saveEvidence() {
        try {
            if (!this.validateEvidenceForm()) {
                return;
            }

            this.showLoading();
            
            const evidenceData = this.collectEvidenceData();
            
            // Upload files if any
            if (this.uploadedFiles.length > 0) {
                const uploadedUrls = await this.uploadFiles(this.uploadedFiles);
                evidenceData.fileUrls = uploadedUrls;
                evidenceData.fileSize = this.calculateTotalFileSize(this.uploadedFiles);
            }
            
            // Save to database
            await this.db.collection('audit_evidence').add({
                ...evidenceData,
                factoryId: this.currentFactory,
                createdBy: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });

            this.showSuccess('Evidence saved successfully');
            this.closeCollectionModal();
            await this.loadEvidence();
            this.renderEvidence();
            this.updateStats();
        } catch (error) {
            console.error('Error saving evidence:', error);
            this.showError('Failed to save evidence');
        } finally {
            this.hideLoading();
        }
    }

    validateEvidenceForm() {
        const title = document.getElementById('evidenceTitle').value.trim();
        const auditStandard = document.getElementById('modalAuditStandard').value;
        const requirement = document.getElementById('modalRequirement').value;
        const evidenceType = document.getElementById('modalEvidenceType').value;
        
        if (!title) {
            this.showError('Evidence title is required');
            return false;
        }
        if (!auditStandard) {
            this.showError('Audit standard is required');
            return false;
        }
        if (!requirement) {
            this.showError('Requirement is required');
            return false;
        }
        if (!evidenceType) {
            this.showError('Evidence type is required');
            return false;
        }
        
        return true;
    }

    collectEvidenceData() {
        const evidenceType = document.getElementById('modalEvidenceType').value;
        let content = {};
        
        switch (evidenceType) {
            case 'interview':
                content = {
                    intervieweeName: document.getElementById('intervieweeName').value,
                    intervieweeRole: document.getElementById('intervieweeRole').value,
                    interviewDate: document.getElementById('interviewDate').value,
                    interviewDuration: document.getElementById('interviewDuration').value,
                    interviewNotes: document.getElementById('interviewNotes').value
                };
                break;
            case 'observation':
                content = {
                    observationDate: document.getElementById('observationDate').value,
                    observationTime: document.getElementById('observationTime').value,
                    observationLocation: document.getElementById('observationLocation').value,
                    observerName: document.getElementById('observerName').value,
                    observationDetails: document.getElementById('observationDetails').value
                };
                break;
            case 'sample':
                content = {
                    sampleId: document.getElementById('sampleId').value,
                    sampleType: document.getElementById('sampleType').value,
                    sampleCollectionDate: document.getElementById('sampleCollectionDate').value,
                    sampleStorageLocation: document.getElementById('sampleStorageLocation').value,
                    sampleDescription: document.getElementById('sampleDescription').value
                };
                break;
            default:
                content = {
                    description: document.getElementById('evidenceDescription').value
                };
        }

        return {
            title: document.getElementById('evidenceTitle').value,
            auditStandard: document.getElementById('modalAuditStandard').value,
            requirement: document.getElementById('modalRequirement').value,
            evidenceType: evidenceType,
            department: document.getElementById('modalDepartment').value,
            priority: document.getElementById('evidencePriority').value,
            tags: document.getElementById('evidenceTags').value,
            confidentialityLevel: document.getElementById('confidentialityLevel').value,
            notes: document.getElementById('evidenceNotes').value,
            content: content
        };
    }

    async uploadFiles(files) {
        const uploadPromises = files.map(async (file) => {
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = this.storage.ref(`evidence/${this.currentFactory}/${fileName}`);
            const snapshot = await storageRef.put(file);
            return await snapshot.ref.getDownloadURL();
        });
        
        return Promise.all(uploadPromises);
    }

    calculateTotalFileSize(files) {
        return files.reduce((total, file) => total + file.size, 0);
    }

    openEvidenceReview(evidenceId) {
        const evidence = this.evidenceItems.find(e => e.id === evidenceId);
        if (!evidence) return;

        this.currentEvidenceId = evidenceId;
        this.renderEvidenceReview(evidence);
        document.getElementById('evidenceReviewModal').style.display = 'flex';
    }

    renderEvidenceReview(evidence) {
        const reviewContent = document.getElementById('evidenceReviewContent');
        const statusBadge = document.getElementById('reviewEvidenceStatus');
        
        statusBadge.textContent = evidence.status || 'pending';
        statusBadge.className = `status-badge status-${evidence.status || 'pending'}`;
        
        reviewContent.innerHTML = `
            <div class="evidence-review-header">
                <h3>${evidence.title}</h3>
                <div class="evidence-meta">
                    <span class="standard">${this.getStandardDisplay(evidence.auditStandard)}</span>
                    <span class="requirement">${evidence.requirement}</span>
                    <span class="type">${this.getEvidenceTypeDisplay(evidence.evidenceType)}</span>
                    <span class="priority priority-${evidence.priority}">${evidence.priority}</span>
                </div>
            </div>
            
            <div class="evidence-content-review">
                <p>${evidence.description || 'No content provided'}</p>
            </div>
            
            <div class="evidence-details">
                <div class="detail-item">
                    <label>Department:</label>
                    <span>${evidence.department || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Created:</label>
                    <span>${this.formatDate(evidence.createdAt)}</span>
                </div>
            </div>
        `;
    }

    closeReviewModal() {
        document.getElementById('evidenceReviewModal').style.display = 'none';
        this.currentEvidenceId = null;
    }

    async approveEvidence() {
        if (!this.currentEvidenceId) return;
        
        try {
            await this.db.collection('audit_evidence').doc(this.currentEvidenceId).update({
                status: 'approved',
                reviewedBy: this.currentUser.uid,
                reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            this.showSuccess('Evidence approved');
            this.closeReviewModal();
            await this.loadEvidence();
            this.renderEvidence();
            this.updateStats();
        } catch (error) {
            console.error('Error approving evidence:', error);
            this.showError('Failed to approve evidence');
        }
    }

    async rejectEvidence() {
        if (!this.currentEvidenceId) return;
        
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;
        
        try {
            await this.db.collection('audit_evidence').doc(this.currentEvidenceId).update({
                status: 'rejected',
                rejectionReason: reason,
                reviewedBy: this.currentUser.uid,
                reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            this.showSuccess('Evidence rejected');
            this.closeReviewModal();
            await this.loadEvidence();
            this.renderEvidence();
            this.updateStats();
        } catch (error) {
            console.error('Error rejecting evidence:', error);
            this.showError('Failed to reject evidence');
        }
    }

    openBulkUpload() {
        alert('Bulk upload functionality coming soon');
    }

    closeBulkUploadModal() {
        document.getElementById('bulkUploadModal').style.display = 'none';
    }

    filterEvidence() {
        alert('Filter functionality coming soon');
    }

    async downloadEvidence(evidenceId) {
        const evidence = this.evidenceItems.find(e => e.id === evidenceId);
        if (!evidence || !evidence.fileUrls) {
            this.showError('No files to download');
            return;
        }

        evidence.fileUrls.forEach(url => {
            const a = document.createElement('a');
            a.href = url;
            a.download = evidence.title;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    async deleteEvidence(evidenceId) {
        if (!confirm('Are you sure you want to delete this evidence?')) {
            return;
        }

        try {
            await this.db.collection('audit_evidence').doc(evidenceId).delete();
            this.showSuccess('Evidence deleted successfully');
            await this.loadEvidence();
            this.renderEvidence();
            this.updateStats();
        } catch (error) {
            console.error('Error deleting evidence:', error);
            this.showError('Failed to delete evidence');
        }
    }

    exportEvidence() {
        alert('Export functionality coming soon');
    }

    updateStats() {
        document.getElementById('totalEvidence').textContent = this.evidenceItems.length;
        document.getElementById('pendingReview').textContent = this.evidenceItems.filter(e => e.status === 'pending').length;
        
        const totalSize = this.evidenceItems.reduce((total, evidence) => total + (evidence.fileSize || 0), 0);
        document.getElementById('storageUsed').textContent = this.formatFileSize(totalSize);
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
}

// Global functions
let evidenceCollector;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    evidenceCollector = new EvidenceCollector();
    window.evidenceCollector = evidenceCollector;
    evidenceCollector.init();
});
