// Evidence Review System
class EvidenceReviewer {
    constructor() {
        this.currentUser = null;
        this.evidenceItems = [];
        this.reviewHistory = [];
        this.selectedItems = new Set();
        this.currentEvidence = null;
        this.currentReview = null;
        
        // Initialize Firebase
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.storage = firebase.storage();
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadEvidence = this.loadEvidence.bind(this);
        this.loadReviewHistory = this.loadReviewHistory.bind(this);
        this.renderReviewQueue = this.renderReviewQueue.bind(this);
        this.renderReviewHistory = this.renderReviewHistory.bind(this);
        this.filterEvidence = this.filterEvidence.bind(this);
        this.startReview = this.startReview.bind(this);
        this.submitReview = this.submitReview.bind(this);
        this.bulkApprove = this.bulkApprove.bind(this);
        this.bulkReject = this.bulkReject.bind(this);
        this.autoReview = this.autoReview.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
        this.closeReviewModal = this.closeReviewModal.bind(this);
        this.closeBulkReviewModal = this.closeBulkReviewModal.bind(this);
        this.closeHistoryModal = this.closeHistoryModal.bind(this);
        this.applyBulkReview = this.applyBulkReview.bind(this);
        this.viewHistory = this.viewHistory.bind(this);
        this.generateReport = this.generateReport.bind(this);
        this.exportReviewReport = this.exportReviewReport.bind(this);
        this.exportHistory = this.exportHistory.bind(this);
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
            await this.loadEvidence();
            await this.loadReviewHistory();

            // Set up event listeners
            this.setupEventListeners();

            // Initial render
            this.renderReviewQueue();
            this.renderReviewHistory();
            this.updateStats();

            console.log('Evidence Reviewer initialized successfully');
        } catch (error) {
            console.error('Error initializing Evidence Reviewer:', error);
        }
    }

    setupEventListeners() {
        // Evidence selection listeners
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.name === 'evidence') {
                this.toggleEvidenceSelection(e.target.value, e.target.checked);
            }
        });

        // Form validation listeners
        const reviewDecision = document.getElementById('reviewDecision');
        const reviewComments = document.getElementById('reviewComments');
        
        if (reviewDecision) {
            reviewDecision.addEventListener('change', () => {
                this.validateReviewForm();
            });
        }
        
        if (reviewComments) {
            reviewComments.addEventListener('input', () => {
                this.validateReviewForm();
            });
        }
    }

    async loadEvidence() {
        try {
            const snapshot = await this.db.collection('evidence')
                .where('factoryId', '==', this.currentUser.uid)
                .orderBy('uploadedAt', 'desc')
                .get();

            this.evidenceItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading evidence:', error);
        }
    }

    async loadReviewHistory() {
        try {
            const snapshot = await this.db.collection('evidenceReviews')
                .where('factoryId', '==', this.currentUser.uid)
                .orderBy('reviewedAt', 'desc')
                .limit(50)
                .get();

            this.reviewHistory = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading review history:', error);
        }
    }

    renderReviewQueue(filteredItems = this.evidenceItems) {
        const queue = document.getElementById('reviewQueue');
        if (!queue) return;

        const itemsForReview = filteredItems.filter(item => 
            item.reviewStatus === 'pending' || item.reviewStatus === 'in_review'
        );

        if (itemsForReview.length === 0) {
            queue.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="check-circle"></i>
                    <p>No evidence items pending review</p>
                    <button class="btn btn-primary" onclick="evidenceReviewer.loadEvidence()">
                        Refresh Queue
                    </button>
                </div>
            `;
            return;
        }

        queue.innerHTML = itemsForReview.map(item => this.renderEvidenceCard(item)).join('');
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderEvidenceCard(item) {
        const isSelected = this.selectedItems.has(item.id);
        const statusClass = `status-${item.reviewStatus || 'pending'}`;
        const priorityClass = `priority-${item.priority || 'medium'}`;
        const uploadDate = new Date(item.uploadedAt).toLocaleDateString();

        return `
            <div class="evidence-card ${isSelected ? 'selected' : ''}" data-id="${item.id}">
                <div class="evidence-header">
                    <div class="evidence-checkbox">
                        <input type="checkbox" 
                               id="evidence_${item.id}" 
                               name="evidence" 
                               value="${item.id}"
                               ${isSelected ? 'checked' : ''}>
                        <label for="evidence_${item.id}"></label>
                    </div>
                    <div class="evidence-meta">
                        <span class="status-badge ${statusClass}">${item.reviewStatus || 'pending'}</span>
                        <span class="priority-badge ${priorityClass}">${item.priority || 'medium'}</span>
                    </div>
                </div>
                <div class="evidence-preview" onclick="evidenceReviewer.openReview('${item.id}')">
                    ${this.getEvidencePreview(item)}
                </div>
                <div class="evidence-content">
                    <h3>${item.name}</h3>
                    <p class="evidence-description">${item.description || 'No description'}</p>
                    <div class="evidence-details">
                        <span class="evidence-standard">${item.standard || 'No standard'}</span>
                        <span class="evidence-requirement">${item.requirement || 'No requirement'}</span>
                    </div>
                    <div class="evidence-tags">
                        ${item.tags ? item.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                    <div class="evidence-footer">
                        <span class="upload-date">${uploadDate}</span>
                        <span class="file-size">${this.formatFileSize(item.size)}</span>
                    </div>
                </div>
                <div class="evidence-actions">
                    <button class="btn btn-sm btn-primary" onclick="evidenceReviewer.openReview('${item.id}')">
                        <i data-lucide="eye"></i>
                        Review
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="evidenceReviewer.viewEvidenceDetails('${item.id}')">
                        <i data-lucide="info"></i>
                        Details
                    </button>
                </div>
            </div>
        `;
    }

    getEvidencePreview(item) {
        const fileExtension = item.name.split('.').pop().toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            return `<img src="${item.url}" alt="${item.name}" class="evidence-image">`;
        } else if (['pdf'].includes(fileExtension)) {
            return `<div class="evidence-icon"><i data-lucide="file-text"></i></div>`;
        } else if (['doc', 'docx'].includes(fileExtension)) {
            return `<div class="evidence-icon"><i data-lucide="file-text"></i></div>`;
        } else if (['mp4', 'avi', 'mov'].includes(fileExtension)) {
            return `<div class="evidence-icon"><i data-lucide="video"></i></div>`;
        } else if (['mp3', 'wav', 'aac'].includes(fileExtension)) {
            return `<div class="evidence-icon"><i data-lucide="volume-2"></i></div>`;
        } else {
            return `<div class="evidence-icon"><i data-lucide="file"></i></div>`;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    renderReviewHistory(historyItems = this.reviewHistory) {
        const history = document.getElementById('reviewHistory');
        if (!history) return;

        if (historyItems.length === 0) {
            history.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="history"></i>
                    <p>No review history available</p>
                </div>
            `;
            return;
        }

        const recentHistory = historyItems.slice(0, 5);
        
        history.innerHTML = recentHistory.map(review => this.renderHistoryItem(review)).join('');
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderHistoryItem(review) {
        const reviewDate = new Date(review.reviewedAt).toLocaleDateString();
        const decisionClass = `decision-${review.decision}`;
        
        return `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-meta">
                        <span class="evidence-name">${review.evidenceName}</span>
                        <span class="reviewer-name">by ${review.reviewerName}</span>
                    </div>
                    <div class="history-status">
                        <span class="decision-badge ${decisionClass}">${review.decision}</span>
                        <span class="review-date">${reviewDate}</span>
                    </div>
                </div>
                <div class="history-content">
                    <p class="review-comments">${review.comments}</p>
                    <div class="review-metrics">
                        <span class="quality-score">Quality: ${review.qualityScore}/5</span>
                        <span class="priority-level">Priority: ${review.priority}</span>
                    </div>
                </div>
            </div>
        `;
    }

    filterEvidence() {
        const reviewStatusFilter = document.getElementById('reviewStatusFilter').value;
        const standardFilter = document.getElementById('standardFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const reviewerFilter = document.getElementById('reviewerFilter').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        let filteredItems = this.evidenceItems;

        if (reviewStatusFilter !== 'all') {
            filteredItems = filteredItems.filter(item => 
                (item.reviewStatus || 'pending') === reviewStatusFilter
            );
        }

        if (standardFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.standard === standardFilter);
        }

        if (priorityFilter !== 'all') {
            filteredItems = filteredItems.filter(item => 
                (item.priority || 'medium') === priorityFilter
            );
        }

        if (reviewerFilter === 'me') {
            filteredItems = filteredItems.filter(item => 
                item.reviewedBy === this.currentUser.uid
            );
        } else if (reviewerFilter === 'others') {
            filteredItems = filteredItems.filter(item => 
                item.reviewedBy && item.reviewedBy !== this.currentUser.uid
            );
        }

        if (startDate) {
            filteredItems = filteredItems.filter(item => 
                new Date(item.uploadedAt) >= new Date(startDate)
            );
        }

        if (endDate) {
            filteredItems = filteredItems.filter(item => 
                new Date(item.uploadedAt) <= new Date(endDate)
            );
        }

        this.renderReviewQueue(filteredItems);
    }

    startReview() {
        const pendingItems = this.evidenceItems.filter(item => 
            item.reviewStatus === 'pending' || item.reviewStatus === 'in_review'
        );

        if (pendingItems.length === 0) {
            this.showNotification('No items pending review', 'info');
            return;
        }

        // Start with the first pending item
        this.openReview(pendingItems[0].id);
    }

    openReview(evidenceId) {
        const evidence = this.evidenceItems.find(e => e.id === evidenceId);
        if (!evidence) return;

        this.currentEvidence = evidence;
        this.currentReview = null;

        // Populate evidence preview
        this.populateEvidencePreview(evidence);

        // Populate metadata
        document.getElementById('evidenceFileName').textContent = evidence.name;
        document.getElementById('evidenceFileType').textContent = evidence.type;
        document.getElementById('evidenceFileSize').textContent = this.formatFileSize(evidence.size);
        document.getElementById('evidenceUploadDate').textContent = new Date(evidence.uploadedAt).toLocaleDateString();
        document.getElementById('evidenceStandard').textContent = evidence.standard || 'Not specified';
        document.getElementById('evidenceRequirement').textContent = evidence.requirement || 'Not specified';

        // Reset form
        this.resetReviewForm();

        // Show modal
        const modal = document.getElementById('reviewModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    populateEvidencePreview(evidence) {
        const preview = document.getElementById('evidencePreview');
        if (!preview) return;

        const fileExtension = evidence.name.split('.').pop().toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            preview.innerHTML = `<img src="${evidence.url}" alt="${evidence.name}" class="evidence-image">`;
        } else {
            const icon = this.getFileIcon(evidence.name);
            preview.innerHTML = `
                <div class="evidence-icon-large">
                    <i data-lucide="${icon}"></i>
                </div>
            `;
        }
    }

    getFileIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
        if (['pdf'].includes(extension)) return 'file-text';
        if (['doc', 'docx'].includes(extension)) return 'file-text';
        if (['mp4', 'avi', 'mov'].includes(extension)) return 'video';
        if (['mp3', 'wav', 'aac'].includes(extension)) return 'volume-2';
        return 'file';
    }

    resetReviewForm() {
        document.getElementById('reviewForm').reset();
        document.getElementById('reviewDecision').value = '';
        document.getElementById('reviewComments').value = '';
        document.getElementById('reviewRecommendations').value = '';
        document.getElementById('reviewPriority').value = 'medium';
        document.getElementById('assignTo').value = '';
        
        // Reset quality score
        document.querySelectorAll('input[name="qualityScore"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Reset compliance checklist
        document.querySelectorAll('input[name="compliance"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    validateReviewForm() {
        const decision = document.getElementById('reviewDecision').value;
        const comments = document.getElementById('reviewComments').value;
        const submitButton = document.querySelector('#reviewModal .btn-primary');
        
        if (decision && comments.trim()) {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }

    async submitReview() {
        try {
            const decision = document.getElementById('reviewDecision').value;
            const comments = document.getElementById('reviewComments').value;
            const recommendations = document.getElementById('reviewRecommendations').value;
            const priority = document.getElementById('reviewPriority').value;
            const assignTo = document.getElementById('assignTo').value;

            if (!decision || !comments.trim()) {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }

            // Get quality score
            const qualityScore = document.querySelector('input[name="qualityScore"]:checked')?.value || 3;

            // Get compliance checklist
            const complianceItems = Array.from(document.querySelectorAll('input[name="compliance"]:checked'))
                .map(checkbox => checkbox.value);

            this.showLoading();

            const reviewData = {
                evidenceId: this.currentEvidence.id,
                evidenceName: this.currentEvidence.name,
                decision: decision,
                comments: comments,
                recommendations: recommendations,
                qualityScore: parseInt(qualityScore),
                complianceItems: complianceItems,
                priority: priority,
                assignTo: assignTo,
                reviewerId: this.currentUser.uid,
                reviewerName: this.currentUser.displayName || this.currentUser.email,
                reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
                factoryId: this.currentUser.uid
            };

            // Save review
            await this.db.collection('evidenceReviews').add(reviewData);

            // Update evidence status
            await this.db.collection('evidence').doc(this.currentEvidence.id).update({
                reviewStatus: decision,
                reviewedBy: this.currentUser.uid,
                reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: priority,
                assignTo: assignTo
            });

            this.hideLoading();
            this.closeReviewModal();
            
            // Refresh data
            await this.loadEvidence();
            await this.loadReviewHistory();
            this.renderReviewQueue();
            this.renderReviewHistory();
            this.updateStats();
            
            this.showNotification('Review submitted successfully', 'success');
        } catch (error) {
            console.error('Error submitting review:', error);
            this.hideLoading();
            this.showNotification('Error submitting review', 'error');
        }
    }

    async saveDraft() {
        try {
            const reviewData = this.collectReviewData();
            reviewData.status = 'draft';
            
            await this.db.collection('evidenceReviewDrafts').add(reviewData);
            this.showNotification('Draft saved successfully', 'success');
        } catch (error) {
            console.error('Error saving draft:', error);
            this.showNotification('Error saving draft', 'error');
        }
    }

    collectReviewData() {
        const decision = document.getElementById('reviewDecision').value;
        const comments = document.getElementById('reviewComments').value;
        const recommendations = document.getElementById('reviewRecommendations').value;
        const priority = document.getElementById('reviewPriority').value;
        const assignTo = document.getElementById('assignTo').value;
        const qualityScore = document.querySelector('input[name="qualityScore"]:checked')?.value || 3;
        const complianceItems = Array.from(document.querySelectorAll('input[name="compliance"]:checked'))
            .map(checkbox => checkbox.value);

        return {
            evidenceId: this.currentEvidence.id,
            evidenceName: this.currentEvidence.name,
            decision: decision,
            comments: comments,
            recommendations: recommendations,
            qualityScore: parseInt(qualityScore),
            complianceItems: complianceItems,
            priority: priority,
            assignTo: assignTo,
            reviewerId: this.currentUser.uid,
            reviewerName: this.currentUser.displayName || this.currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            factoryId: this.currentUser.uid
        };
    }

    bulkApprove() {
        if (this.selectedItems.size === 0) {
            this.showNotification('Please select evidence items to approve', 'error');
            return;
        }

        this.openBulkReviewModal('approved');
    }

    bulkReject() {
        if (this.selectedItems.size === 0) {
            this.showNotification('Please select evidence items to reject', 'error');
            return;
        }

        this.openBulkReviewModal('rejected');
    }

    openBulkReviewModal(defaultDecision) {
        const modal = document.getElementById('bulkReviewModal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateSelectedItemsList();
            
            if (defaultDecision) {
                document.getElementById('bulkDecision').value = defaultDecision;
            }
        }
    }

    updateSelectedItemsList() {
        const selectedList = document.getElementById('selectedList');
        const selectedCount = document.getElementById('selectedCount');
        
        if (selectedList && selectedCount) {
            selectedCount.textContent = this.selectedItems.size;
            
            selectedList.innerHTML = Array.from(this.selectedItems).map(id => {
                const item = this.evidenceItems.find(e => e.id === id);
                return item ? `
                    <div class="selected-item">
                        <span class="item-name">${item.name}</span>
                        <span class="item-type">${item.type}</span>
                    </div>
                ` : '';
            }).join('');
        }
    }

    async applyBulkReview() {
        try {
            this.showLoading();

            const decision = document.getElementById('bulkDecision').value;
            const qualityScore = document.getElementById('bulkQualityScore').value;
            const priority = document.getElementById('bulkPriority').value;
            const comments = document.getElementById('bulkComments').value;

            const reviewPromises = Array.from(this.selectedItems).map(id => {
                const reviewData = {
                    evidenceId: id,
                    evidenceName: this.evidenceItems.find(e => e.id === id)?.name || 'Unknown',
                    decision: decision,
                    comments: comments,
                    qualityScore: parseInt(qualityScore),
                    priority: priority,
                    reviewerId: this.currentUser.uid,
                    reviewerName: this.currentUser.displayName || this.currentUser.email,
                    reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    factoryId: this.currentUser.uid
                };

                const batch = this.db.batch();
                
                // Add review
                const reviewRef = this.db.collection('evidenceReviews').doc();
                batch.set(reviewRef, reviewData);
                
                // Update evidence
                const evidenceRef = this.db.collection('evidence').doc(id);
                batch.update(evidenceRef, {
                    reviewStatus: decision,
                    reviewedBy: this.currentUser.uid,
                    reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    priority: priority
                });

                return batch.commit();
            });

            await Promise.all(reviewPromises);

            this.hideLoading();
            this.closeBulkReviewModal();
            this.clearSelection();
            
            await this.loadEvidence();
            await this.loadReviewHistory();
            this.renderReviewQueue();
            this.renderReviewHistory();
            this.updateStats();
            
            this.showNotification(`Bulk review applied to ${this.selectedItems.size} items`, 'success');
        } catch (error) {
            console.error('Error applying bulk review:', error);
            this.hideLoading();
            this.showNotification('Error applying bulk review', 'error');
        }
    }

    autoReview() {
        const pendingItems = this.evidenceItems.filter(item => 
            item.reviewStatus === 'pending'
        );

        if (pendingItems.length === 0) {
            this.showNotification('No items available for auto-review', 'info');
            return;
        }

        this.showNotification(`Auto-reviewing ${pendingItems.length} items...`, 'info');
        
        // Simple auto-review logic - approve items with good metadata
        pendingItems.forEach(item => {
            const hasGoodMetadata = item.standard && item.requirement && item.description;
            const decision = hasGoodMetadata ? 'approved' : 'needs_revision';
            
            this.db.collection('evidence').doc(item.id).update({
                reviewStatus: decision,
                reviewedBy: this.currentUser.uid,
                reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
                priority: 'medium'
            });
        });

        this.loadEvidence();
        this.renderReviewQueue();
        this.updateStats();
    }

    selectAll() {
        const checkboxes = document.querySelectorAll('input[name="evidence"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.selectedItems.add(checkbox.value);
        });
        
        document.querySelectorAll('.evidence-card').forEach(card => {
            card.classList.add('selected');
        });
    }

    clearSelection() {
        const checkboxes = document.querySelectorAll('input[name="evidence"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        this.selectedItems.clear();
        document.querySelectorAll('.evidence-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    toggleEvidenceSelection(evidenceId, isSelected) {
        if (isSelected) {
            this.selectedItems.add(evidenceId);
        } else {
            this.selectedItems.delete(evidenceId);
        }
        
        const card = document.querySelector(`[data-id="${evidenceId}"]`);
        if (card) {
            card.classList.toggle('selected', isSelected);
        }
    }

    viewHistory() {
        const modal = document.getElementById('historyModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderHistoryTable();
        }
    }

    renderHistoryTable() {
        const table = document.getElementById('historyTable');
        if (!table) return;

        if (this.reviewHistory.length === 0) {
            table.innerHTML = '<p>No review history available</p>';
            return;
        }

        table.innerHTML = `
            <table class="history-table-content">
                <thead>
                    <tr>
                        <th>Evidence</th>
                        <th>Reviewer</th>
                        <th>Decision</th>
                        <th>Quality Score</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.reviewHistory.map(review => `
                        <tr>
                            <td>${review.evidenceName}</td>
                            <td>${review.reviewerName}</td>
                            <td><span class="decision-badge decision-${review.decision}">${review.decision}</span></td>
                            <td>${review.qualityScore}/5</td>
                            <td>${new Date(review.reviewedAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="evidenceReviewer.viewReviewDetails('${review.id}')">
                                    <i data-lucide="eye"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    viewReviewDetails(reviewId) {
        const review = this.reviewHistory.find(r => r.id === reviewId);
        if (!review) return;

        // Show review details in a modal or expand the row
        this.showNotification(`Review details for ${review.evidenceName}`, 'info');
    }

    async generateReport() {
        try {
            this.showLoading();

            const reportData = {
                totalEvidence: this.evidenceItems.length,
                pendingReview: this.evidenceItems.filter(item => 
                    item.reviewStatus === 'pending'
                ).length,
                approved: this.evidenceItems.filter(item => 
                    item.reviewStatus === 'approved'
                ).length,
                rejected: this.evidenceItems.filter(item => 
                    item.reviewStatus === 'rejected'
                ).length,
                averageQualityScore: this.calculateAverageQualityScore(),
                reviewHistory: this.reviewHistory.slice(0, 20), // Last 20 reviews
                generatedAt: new Date().toISOString(),
                generatedBy: this.currentUser.uid
            };

            // Save report
            await this.db.collection('reviewReports').add(reportData);

            this.hideLoading();
            this.showNotification('Report generated successfully', 'success');
        } catch (error) {
            console.error('Error generating report:', error);
            this.hideLoading();
            this.showNotification('Error generating report', 'error');
        }
    }

    calculateAverageQualityScore() {
        const reviewsWithScores = this.reviewHistory.filter(review => review.qualityScore);
        if (reviewsWithScores.length === 0) return 0;
        
        const totalScore = reviewsWithScores.reduce((sum, review) => sum + review.qualityScore, 0);
        return (totalScore / reviewsWithScores.length).toFixed(1);
    }

    async exportReviewReport() {
        try {
            const reportData = {
                evidenceItems: this.evidenceItems,
                reviewHistory: this.reviewHistory,
                stats: {
                    totalEvidence: this.evidenceItems.length,
                    pendingReview: this.evidenceItems.filter(item => 
                        item.reviewStatus === 'pending'
                    ).length,
                    approved: this.evidenceItems.filter(item => 
                        item.reviewStatus === 'approved'
                    ).length,
                    rejected: this.evidenceItems.filter(item => 
                        item.reviewStatus === 'rejected'
                    ).length,
                    averageQualityScore: this.calculateAverageQualityScore()
                }
            };

            const csvContent = this.generateReviewCSV(reportData);
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `evidence_review_report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting report:', error);
            this.showNotification('Error exporting report', 'error');
        }
    }

    generateReviewCSV(data) {
        const headers = ['Evidence Name', 'Standard', 'Requirement', 'Review Status', 'Reviewer', 'Decision', 'Quality Score', 'Review Date', 'Comments'];
        const rows = data.reviewHistory.map(review => [
            review.evidenceName,
            review.standard || '',
            review.requirement || '',
            review.reviewStatus || '',
            review.reviewerName,
            review.decision,
            review.qualityScore || '',
            new Date(review.reviewedAt).toLocaleDateString(),
            review.comments || ''
        ]);

        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    async exportHistory() {
        try {
            const csvContent = this.generateReviewCSV({ reviewHistory: this.reviewHistory });
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `review_history_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting history:', error);
            this.showNotification('Error exporting history', 'error');
        }
    }

    updateStats() {
        const pendingReview = this.evidenceItems.filter(item => 
            item.reviewStatus === 'pending'
        ).length;
        
        const reviewedToday = this.reviewHistory.filter(review => {
            const today = new Date().toDateString();
            const reviewDate = new Date(review.reviewedAt).toDateString();
            return reviewDate === today;
        }).length;
        
        const approvedCount = this.evidenceItems.filter(item => 
            item.reviewStatus === 'approved'
        ).length;
        
        const totalReviewed = this.evidenceItems.filter(item => 
            item.reviewStatus && item.reviewStatus !== 'pending'
        ).length;
        
        const approvalRate = totalReviewed > 0 ? Math.round((approvedCount / totalReviewed) * 100) : 0;

        document.getElementById('pendingReview').textContent = pendingReview;
        document.getElementById('reviewedToday').textContent = reviewedToday;
        document.getElementById('approvalRate').textContent = `${approvalRate}%`;
    }

    closeReviewModal() {
        const modal = document.getElementById('reviewModal');
        if (modal) {
            modal.style.display = 'none';
            this.currentEvidence = null;
            this.currentReview = null;
        }
    }

    closeBulkReviewModal() {
        const modal = document.getElementById('bulkReviewModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeHistoryModal() {
        const modal = document.getElementById('historyModal');
        if (modal) {
            modal.style.display = 'none';
        }
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

// Initialize the evidence reviewer
const evidenceReviewer = new EvidenceReviewer();

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    evidenceReviewer.init();
});
