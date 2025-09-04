// Compliance Documentation Review System
class ComplianceDocumentationReviewSystem {
    constructor() {
        this.currentUser = null;
        this.documents = [];
        this.currentDocument = null;
        this.currentReview = null;
        this.filters = {
            status: '',
            category: '',
            priority: ''
        };
        
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
            
            // Load documents
            await this.loadDocuments();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('Compliance Documentation Review System initialized successfully');
        } catch (error) {
            console.error('Error initializing Compliance Documentation Review System:', error);
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
        
        // Initialize filters
        this.initializeFilters();
        
        // Initialize document preview
        this.initializeDocumentPreview();
    }

    initializeFormValidation() {
        const form = document.getElementById('reviewForm');
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
        if (field.id === 'overallAssessment' && value.length < 20) {
            this.showFieldError(field, 'Overall assessment must be at least 20 characters');
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

    initializeFilters() {
        const filterInputs = ['statusFilter', 'categoryFilter', 'priorityFilter'];
        
        filterInputs.forEach(filterId => {
            const filter = document.getElementById(filterId);
            filter.addEventListener('change', () => {
                this.filters[filterId.replace('Filter', '')] = filter.value;
                this.filterDocuments();
            });
        });
    }

    initializeDocumentPreview() {
        const previewContainer = document.getElementById('documentPreview');
        
        // Add click handler for document preview
        previewContainer.addEventListener('click', () => {
            if (this.currentDocument && this.currentDocument.fileUrl) {
                window.open(this.currentDocument.fileUrl, '_blank');
            }
        });
    }

    async loadDocuments() {
        try {
            const documentsSnapshot = await this.db.collection('complianceDocuments')
                .where('status', 'in', ['pending', 'in_review'])
                .orderBy('submissionDate', 'desc')
                .get();
            
            this.documents = [];
            documentsSnapshot.forEach(doc => {
                this.documents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.displayDocumentQueue();
        } catch (error) {
            console.error('Error loading documents:', error);
            this.showNotification('Error loading documents', 'error');
        }
    }

    displayDocumentQueue() {
        const queueContainer = document.getElementById('documentQueue');
        queueContainer.innerHTML = '';
        
        if (this.documents.length === 0) {
            queueContainer.innerHTML = '<p class="text-muted">No documents in queue</p>';
            return;
        }
        
        this.documents.forEach(document => {
            const documentItem = this.createDocumentItem(document);
            queueContainer.appendChild(documentItem);
        });
    }

    createDocumentItem(document) {
        const documentItem = document.createElement('div');
        documentItem.className = 'document-item';
        documentItem.dataset.documentId = document.id;
        
        const priorityClass = this.getPriorityClass(document.priority);
        const statusClass = this.getStatusClass(document.status);
        
        documentItem.innerHTML = `
            <div class="document-header">
                <h6 class="document-title">${document.title}</h6>
                <div class="document-badges">
                    <span class="badge badge-${priorityClass}">${document.priority}</span>
                    <span class="badge badge-${statusClass}">${document.status}</span>
                </div>
            </div>
            <div class="document-meta">
                <span class="document-type">${document.type}</span>
                <span class="document-date">${this.formatDate(document.submissionDate)}</span>
            </div>
            <div class="document-submitter">
                <i class="fas fa-user"></i>
                <span>${document.submittedBy}</span>
            </div>
            <div class="document-actions">
                <button class="btn btn-sm btn-primary review-doc">
                    <i class="fas fa-eye"></i> Review
                </button>
            </div>
        `;
        
        // Add click handler
        documentItem.querySelector('.review-doc').addEventListener('click', () => {
            this.loadDocument(document);
        });
        
        return documentItem;
    }

    getPriorityClass(priority) {
        const classes = {
            high: 'danger',
            medium: 'warning',
            low: 'success'
        };
        return classes[priority] || 'secondary';
    }

    getStatusClass(status) {
        const classes = {
            pending: 'warning',
            in_review: 'info',
            approved: 'success',
            rejected: 'danger',
            requires_revision: 'warning'
        };
        return classes[status] || 'secondary';
    }

    async loadDocument(document) {
        try {
            this.currentDocument = document;
            
            // Update document information
            this.updateDocumentInfo(document);
            
            // Load existing review if any
            await this.loadExistingReview(document.id);
            
            // Update UI state
            this.updateUIState();
            
            this.showNotification(`Loaded document: ${document.title}`, 'info');
        } catch (error) {
            console.error('Error loading document:', error);
            this.showNotification('Error loading document', 'error');
        }
    }

    updateDocumentInfo(document) {
        document.getElementById('docTitle').textContent = document.title;
        document.getElementById('docType').textContent = document.type;
        document.getElementById('docSubmitter').textContent = document.submittedBy;
        document.getElementById('docSubmissionDate').textContent = this.formatDate(document.submissionDate);
        document.getElementById('docPriority').textContent = document.priority;
        document.getElementById('docStatus').textContent = document.status;
        
        // Update document preview
        this.updateDocumentPreview(document);
    }

    updateDocumentPreview(document) {
        const previewContainer = document.getElementById('documentPreview');
        
        if (document.fileUrl) {
            previewContainer.innerHTML = `
                <div class="preview-content">
                    <i class="fas fa-file-pdf"></i>
                    <h5>${document.title}</h5>
                    <p>Click to view document</p>
                    <button class="btn btn-primary btn-sm">
                        <i class="fas fa-external-link-alt"></i> Open Document
                    </button>
                </div>
            `;
        } else {
            previewContainer.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-file-pdf"></i>
                    <p>Document preview not available</p>
                </div>
            `;
        }
    }

    async loadExistingReview(documentId) {
        try {
            const reviewSnapshot = await this.db.collection('documentReviews')
                .where('documentId', '==', documentId)
                .where('reviewerId', '==', this.currentUser.uid)
                .limit(1)
                .get();
            
            if (!reviewSnapshot.empty) {
                this.currentReview = {
                    id: reviewSnapshot.docs[0].id,
                    ...reviewSnapshot.docs[0].data()
                };
                this.populateReviewForm(this.currentReview);
            } else {
                this.clearReviewForm();
            }
        } catch (error) {
            console.error('Error loading existing review:', error);
        }
    }

    populateReviewForm(review) {
        const fields = [
            'complianceScore', 'complianceStatus', 'clarityScore', 'completenessScore', 
            'accuracyScore', 'strengths', 'weaknesses', 'recommendations', 
            'overallAssessment', 'actionRequired', 'deadline', 'actionNotes'
        ];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && review[fieldId]) {
                field.value = review[fieldId];
            }
        });
    }

    clearReviewForm() {
        document.getElementById('reviewForm').reset();
        this.currentReview = null;
    }

    updateUIState() {
        const hasDocument = !!this.currentDocument;
        
        // Enable/disable action buttons
        document.getElementById('saveReview').disabled = !hasDocument;
        document.getElementById('approveDocument').disabled = !hasDocument;
        document.getElementById('rejectDocument').disabled = !hasDocument;
        
        // Update form state
        const form = document.getElementById('reviewForm');
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = !hasDocument;
        });
    }

    filterDocuments() {
        let filteredDocs = this.documents;
        
        if (this.filters.status) {
            filteredDocs = filteredDocs.filter(doc => doc.status === this.filters.status);
        }
        
        if (this.filters.category) {
            filteredDocs = filteredDocs.filter(doc => doc.type === this.filters.category);
        }
        
        if (this.filters.priority) {
            filteredDocs = filteredDocs.filter(doc => doc.priority === this.filters.priority);
        }
        
        this.displayFilteredDocuments(filteredDocs);
    }

    displayFilteredDocuments(documents) {
        const queueContainer = document.getElementById('documentQueue');
        queueContainer.innerHTML = '';
        
        if (documents.length === 0) {
            queueContainer.innerHTML = '<p class="text-muted">No documents match the filters</p>';
            return;
        }
        
        documents.forEach(document => {
            const documentItem = this.createDocumentItem(document);
            queueContainer.appendChild(documentItem);
        });
    }

    setupEventListeners() {
        // Save review button
        document.getElementById('saveReview').addEventListener('click', () => {
            this.saveReview();
        });
        
        // Approve document button
        document.getElementById('approveDocument').addEventListener('click', () => {
            this.approveDocument();
        });
        
        // Reject document button
        document.getElementById('rejectDocument').addEventListener('click', () => {
            this.rejectDocument();
        });
        
        // Refresh queue button
        document.getElementById('refreshQueue').addEventListener('click', () => {
            this.loadDocuments();
        });
        
        // Form submission
        document.getElementById('reviewForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveReview();
        });
    }

    async saveReview() {
        try {
            if (!this.currentDocument) {
                this.showNotification('No document selected for review', 'error');
                return;
            }
            
            // Validate form
            if (!this.validateReviewForm()) {
                this.showNotification('Please fix form errors before saving', 'error');
                return;
            }
            
            // Get form data
            const reviewData = this.getReviewFormData();
            reviewData.documentId = this.currentDocument.id;
            reviewData.reviewerId = this.currentUser.uid;
            reviewData.reviewerName = this.currentUser.displayName || this.currentUser.email;
            reviewData.reviewDate = new Date();
            reviewData.status = 'draft';
            
            // Save to Firebase
            if (this.currentReview) {
                // Update existing review
                await this.db.collection('documentReviews').doc(this.currentReview.id).update(reviewData);
                this.showNotification('Review updated successfully', 'success');
            } else {
                // Create new review
                const reviewRef = await this.db.collection('documentReviews').add(reviewData);
                this.currentReview = {
                    id: reviewRef.id,
                    ...reviewData
                };
                this.showNotification('Review saved successfully', 'success');
            }
            
        } catch (error) {
            console.error('Error saving review:', error);
            this.showNotification('Error saving review', 'error');
        }
    }

    validateReviewForm() {
        const requiredFields = ['complianceScore', 'complianceStatus', 'overallAssessment', 'actionRequired'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    getReviewFormData() {
        const form = document.getElementById('reviewForm');
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

    async approveDocument() {
        try {
            if (!this.currentDocument) {
                this.showNotification('No document selected', 'error');
                return;
            }
            
            // Validate review form
            if (!this.validateReviewForm()) {
                this.showNotification('Please complete the review form before approving', 'error');
                return;
            }
            
            // Save review first
            await this.saveReview();
            
            // Update document status
            await this.db.collection('complianceDocuments').doc(this.currentDocument.id).update({
                status: 'approved',
                approvedBy: this.currentUser.uid,
                approvedDate: new Date(),
                reviewId: this.currentReview.id
            });
            
            // Update review status
            await this.db.collection('documentReviews').doc(this.currentReview.id).update({
                status: 'approved',
                actionRequired: 'approve'
            });
            
            this.showNotification('Document approved successfully', 'success');
            
            // Reload documents
            await this.loadDocuments();
            
            // Clear current document
            this.currentDocument = null;
            this.updateUIState();
            
        } catch (error) {
            console.error('Error approving document:', error);
            this.showNotification('Error approving document', 'error');
        }
    }

    async rejectDocument() {
        try {
            if (!this.currentDocument) {
                this.showNotification('No document selected', 'error');
                return;
            }
            
            // Validate review form
            if (!this.validateReviewForm()) {
                this.showNotification('Please complete the review form before rejecting', 'error');
                return;
            }
            
            // Save review first
            await this.saveReview();
            
            // Update document status
            await this.db.collection('complianceDocuments').doc(this.currentDocument.id).update({
                status: 'rejected',
                rejectedBy: this.currentUser.uid,
                rejectedDate: new Date(),
                reviewId: this.currentReview.id
            });
            
            // Update review status
            await this.db.collection('documentReviews').doc(this.currentReview.id).update({
                status: 'rejected',
                actionRequired: 'reject'
            });
            
            this.showNotification('Document rejected successfully', 'success');
            
            // Reload documents
            await this.loadDocuments();
            
            // Clear current document
            this.currentDocument = null;
            this.updateUIState();
            
        } catch (error) {
            console.error('Error rejecting document:', error);
            this.showNotification('Error rejecting document', 'error');
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
    new ComplianceDocumentationReviewSystem();
});

// Mock data for development
const mockDocuments = [
    {
        id: '1',
        title: 'Safety Policy Document',
        type: 'policies',
        submittedBy: 'HR Manager',
        submissionDate: new Date('2024-01-15'),
        priority: 'high',
        status: 'pending',
        fileUrl: '#'
    },
    {
        id: '2',
        title: 'Environmental Compliance Procedure',
        type: 'procedures',
        submittedBy: 'Environmental Officer',
        submissionDate: new Date('2024-01-14'),
        priority: 'medium',
        status: 'in_review',
        fileUrl: '#'
    },
    {
        id: '3',
        title: 'Quality Control Training Manual',
        type: 'training',
        submittedBy: 'Training Coordinator',
        submissionDate: new Date('2024-01-13'),
        priority: 'low',
        status: 'pending',
        fileUrl: '#'
    }
];
