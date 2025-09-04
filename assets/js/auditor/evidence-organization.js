// Evidence Organization System
class EvidenceOrganizer {
    constructor() {
        this.currentUser = null;
        this.evidenceItems = [];
        this.folders = [];
        this.selectedItems = new Set();
        this.currentEvidence = null;
        this.uploadedFiles = [];
        
        // Initialize Firebase
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.storage = firebase.storage();
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadEvidence = this.loadEvidence.bind(this);
        this.loadFolders = this.loadFolders.bind(this);
        this.renderEvidence = this.renderEvidence.bind(this);
        this.renderOrganizationTree = this.renderOrganizationTree.bind(this);
        this.filterEvidence = this.filterEvidence.bind(this);
        this.uploadEvidence = this.uploadEvidence.bind(this);
        this.processUpload = this.processUpload.bind(this);
        this.bulkOrganize = this.bulkOrganize.bind(this);
        this.autoCategorize = this.autoCategorize.bind(this);
        this.createFolder = this.createFolder.bind(this);
        this.saveFolder = this.saveFolder.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
        this.exportSelected = this.exportSelected.bind(this);
        this.closeUploadModal = this.closeUploadModal.bind(this);
        this.closeDetailsModal = this.closeDetailsModal.bind(this);
        this.closeCreateFolderModal = this.closeCreateFolderModal.bind(this);
        this.closeBulkOrganizeModal = this.closeBulkOrganizeModal.bind(this);
        this.applyBulkOrganization = this.applyBulkOrganization.bind(this);
        this.downloadEvidence = this.downloadEvidence.bind(this);
        this.editEvidence = this.editEvidence.bind(this);
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
            await this.loadFolders();

            // Set up event listeners
            this.setupEventListeners();

            // Initial render
            this.renderEvidence();
            this.renderOrganizationTree();
            this.updateStats();

            console.log('Evidence Organizer initialized successfully');
        } catch (error) {
            console.error('Error initializing Evidence Organizer:', error);
        }
    }

    setupEventListeners() {
        // File upload listeners
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files);
            });
        }

        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                this.handleFileSelection(e.dataTransfer.files);
            });
        }

        // Standard change listener for requirements
        const uploadStandard = document.getElementById('uploadStandard');
        if (uploadStandard) {
            uploadStandard.addEventListener('change', () => {
                this.updateRequirements();
            });
        }

        // Evidence selection listeners
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.name === 'evidence') {
                this.toggleEvidenceSelection(e.target.value, e.target.checked);
            }
        });
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

    async loadFolders() {
        try {
            const snapshot = await this.db.collection('evidenceFolders')
                .where('factoryId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'asc')
                .get();

            this.folders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading folders:', error);
        }
    }

    renderEvidence(filteredItems = this.evidenceItems) {
        const grid = document.getElementById('evidenceGrid');
        if (!grid) return;

        if (filteredItems.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="folder-open"></i>
                    <p>No evidence items found</p>
                    <button class="btn btn-primary" onclick="evidenceOrganizer.uploadEvidence()">
                        Upload Your First Evidence
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredItems.map(item => this.renderEvidenceCard(item)).join('');
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderEvidenceCard(item) {
        const isSelected = this.selectedItems.has(item.id);
        const statusClass = `status-${item.status}`;
        const typeClass = `type-${item.type}`;
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
                        <span class="status-badge ${statusClass}">${item.status}</span>
                        <span class="type-badge ${typeClass}">${item.type}</span>
                    </div>
                </div>
                <div class="evidence-preview" onclick="evidenceOrganizer.showEvidenceDetails('${item.id}')">
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

    renderOrganizationTree() {
        const tree = document.getElementById('organizationTree');
        if (!tree) return;

        const rootFolders = this.folders.filter(folder => !folder.parentId);
        
        if (rootFolders.length === 0) {
            tree.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="folder"></i>
                    <p>No folders created yet</p>
                    <button class="btn btn-primary" onclick="evidenceOrganizer.createFolder()">
                        Create First Folder
                    </button>
                </div>
            `;
            return;
        }

        tree.innerHTML = rootFolders.map(folder => this.renderFolderNode(folder)).join('');
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderFolderNode(folder, level = 0) {
        const children = this.folders.filter(f => f.parentId === folder.id);
        const evidenceCount = this.evidenceItems.filter(e => e.folderId === folder.id).length;
        
        return `
            <div class="folder-node" style="padding-left: ${level * 20}px;">
                <div class="folder-item" onclick="evidenceOrganizer.toggleFolder('${folder.id}')">
                    <div class="folder-icon">
                        <i data-lucide="${children.length > 0 ? 'folder-open' : 'folder'}"></i>
                    </div>
                    <div class="folder-info">
                        <span class="folder-name">${folder.name}</span>
                        <span class="folder-count">${evidenceCount} items</span>
                    </div>
                    <div class="folder-actions">
                        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); evidenceOrganizer.editFolder('${folder.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); evidenceOrganizer.deleteFolder('${folder.id}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                <div class="folder-children" id="children_${folder.id}" style="display: ${level === 0 ? 'block' : 'none'};">
                    ${children.map(child => this.renderFolderNode(child, level + 1)).join('')}
                </div>
            </div>
        `;
    }

    filterEvidence() {
        const standardFilter = document.getElementById('standardFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        let filteredItems = this.evidenceItems;

        if (standardFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.standard === standardFilter);
        }

        if (statusFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.status === statusFilter);
        }

        if (typeFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.type === typeFilter);
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

        this.renderEvidence(filteredItems);
    }

    uploadEvidence() {
        const modal = document.getElementById('uploadModal');
        if (modal) {
            modal.style.display = 'flex';
            this.resetUploadForm();
        }
    }

    handleFileSelection(files) {
        this.uploadedFiles = Array.from(files);
        this.showFilePreview();
    }

    showFilePreview() {
        const preview = document.getElementById('uploadPreview');
        const fileList = document.getElementById('fileList');
        
        if (preview && fileList) {
            preview.style.display = 'block';
            
            fileList.innerHTML = this.uploadedFiles.map(file => `
                <div class="file-item">
                    <div class="file-icon">
                        <i data-lucide="${this.getFileIcon(file.name)}"></i>
                    </div>
                    <div class="file-info">
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${this.formatFileSize(file.size)}</span>
                    </div>
                </div>
            `).join('');
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

    async processUpload() {
        try {
            this.showLoading();

            const standard = document.getElementById('uploadStandard').value;
            const requirement = document.getElementById('uploadRequirement').value;
            const type = document.getElementById('uploadType').value;
            const description = document.getElementById('uploadDescription').value;
            const tags = document.getElementById('uploadTags').value;
            const date = document.getElementById('uploadDate').value;

            if (!standard || this.uploadedFiles.length === 0) {
                this.hideLoading();
                this.showNotification('Please select a standard and upload files', 'error');
                return;
            }

            const uploadPromises = this.uploadedFiles.map(file => 
                this.uploadFile(file, {
                    standard,
                    requirement,
                    type,
                    description,
                    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                    dateCollected: date
                })
            );

            await Promise.all(uploadPromises);

            this.hideLoading();
            this.closeUploadModal();
            this.loadEvidence();
            this.renderEvidence();
            this.updateStats();
            
            this.showNotification('Evidence uploaded successfully', 'success');
        } catch (error) {
            console.error('Error uploading evidence:', error);
            this.hideLoading();
            this.showNotification('Error uploading evidence', 'error');
        }
    }

    async uploadFile(file, metadata) {
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = this.storage.ref(`evidence/${this.currentUser.uid}/${fileName}`);
        
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();

        const evidenceData = {
            name: file.name,
            url: downloadURL,
            size: file.size,
            type: metadata.type,
            standard: metadata.standard,
            requirement: metadata.requirement,
            description: metadata.description,
            tags: metadata.tags,
            dateCollected: metadata.dateCollected,
            status: 'unorganized',
            folderId: null,
            factoryId: this.currentUser.uid,
            uploadedBy: this.currentUser.uid,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await this.db.collection('evidence').add(evidenceData);
    }

    bulkOrganize() {
        if (this.selectedItems.size === 0) {
            this.showNotification('Please select evidence items to organize', 'error');
            return;
        }

        const modal = document.getElementById('bulkOrganizeModal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateSelectedItemsList();
            this.populateFolderOptions();
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

    populateFolderOptions() {
        const targetFolder = document.getElementById('targetFolder');
        if (targetFolder) {
            targetFolder.innerHTML = '<option value="">Select Folder</option>';
            this.folders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder.id;
                option.textContent = folder.name;
                targetFolder.appendChild(option);
            });
        }
    }

    async applyBulkOrganization() {
        try {
            this.showLoading();

            const targetFolder = document.getElementById('targetFolder').value;
            const bulkStandard = document.getElementById('bulkStandard').value;
            const bulkRequirement = document.getElementById('bulkRequirement').value;
            const bulkTags = document.getElementById('bulkTags').value;

            const updatePromises = Array.from(this.selectedItems).map(id => {
                const updateData = {};
                
                if (targetFolder) updateData.folderId = targetFolder;
                if (bulkStandard) updateData.standard = bulkStandard;
                if (bulkRequirement) updateData.requirement = bulkRequirement;
                if (bulkTags) {
                    const newTags = bulkTags.split(',').map(tag => tag.trim());
                    updateData.tags = firebase.firestore.FieldValue.arrayUnion(...newTags);
                }
                
                updateData.status = 'organized';
                updateData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

                return this.db.collection('evidence').doc(id).update(updateData);
            });

            await Promise.all(updatePromises);

            this.hideLoading();
            this.closeBulkOrganizeModal();
            this.clearSelection();
            this.loadEvidence();
            this.renderEvidence();
            this.updateStats();
            
            this.showNotification('Bulk organization completed successfully', 'success');
        } catch (error) {
            console.error('Error applying bulk organization:', error);
            this.hideLoading();
            this.showNotification('Error applying bulk organization', 'error');
        }
    }

    autoCategorize() {
        // Simple auto-categorization based on file names and types
        const uncategorizedItems = this.evidenceItems.filter(item => 
            item.status === 'unorganized' || !item.standard
        );

        if (uncategorizedItems.length === 0) {
            this.showNotification('No uncategorized evidence found', 'info');
            return;
        }

        this.showNotification(`Auto-categorizing ${uncategorizedItems.length} items...`, 'info');
        
        // This would implement AI-based categorization logic
        // For now, just mark as organized
        uncategorizedItems.forEach(item => {
            this.db.collection('evidence').doc(item.id).update({
                status: 'organized',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        this.loadEvidence();
        this.renderEvidence();
        this.updateStats();
    }

    createFolder() {
        const modal = document.getElementById('createFolderModal');
        if (modal) {
            modal.style.display = 'flex';
            this.populateParentFolderOptions();
        }
    }

    populateParentFolderOptions() {
        const parentFolder = document.getElementById('parentFolder');
        if (parentFolder) {
            parentFolder.innerHTML = '<option value="">Root Level</option>';
            this.folders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder.id;
                option.textContent = folder.name;
                parentFolder.appendChild(option);
            });
        }
    }

    async saveFolder() {
        try {
            const folderName = document.getElementById('folderName').value;
            const parentFolder = document.getElementById('parentFolder').value;
            const folderStandard = document.getElementById('folderStandard').value;
            const folderDescription = document.getElementById('folderDescription').value;

            if (!folderName) {
                this.showNotification('Please enter a folder name', 'error');
                return;
            }

            const folderData = {
                name: folderName,
                parentId: parentFolder || null,
                standard: folderStandard || null,
                description: folderDescription,
                factoryId: this.currentUser.uid,
                createdBy: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.db.collection('evidenceFolders').add(folderData);
            
            this.closeCreateFolderModal();
            this.loadFolders();
            this.renderOrganizationTree();
            this.showNotification('Folder created successfully', 'success');
        } catch (error) {
            console.error('Error creating folder:', error);
            this.showNotification('Error creating folder', 'error');
        }
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

    async exportSelected() {
        if (this.selectedItems.size === 0) {
            this.showNotification('Please select evidence items to export', 'error');
            return;
        }

        try {
            const selectedEvidence = this.evidenceItems.filter(item => 
                this.selectedItems.has(item.id)
            );

            const csvContent = this.generateEvidenceCSV(selectedEvidence);
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `evidence_export_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting evidence:', error);
            this.showNotification('Error exporting evidence', 'error');
        }
    }

    generateEvidenceCSV(evidence) {
        const headers = ['Name', 'Type', 'Standard', 'Requirement', 'Status', 'Description', 'Tags', 'Upload Date', 'Size'];
        const rows = evidence.map(item => [
            item.name,
            item.type,
            item.standard || '',
            item.requirement || '',
            item.status,
            item.description || '',
            item.tags ? item.tags.join(', ') : '',
            new Date(item.uploadedAt).toLocaleDateString(),
            this.formatFileSize(item.size)
        ]);

        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    showEvidenceDetails(evidenceId) {
        const evidence = this.evidenceItems.find(e => e.id === evidenceId);
        if (!evidence) return;

        this.currentEvidence = evidence;
        const modal = document.getElementById('evidenceDetailsModal');
        const details = document.getElementById('evidenceDetails');
        
        if (modal && details) {
            modal.style.display = 'flex';
            details.innerHTML = this.renderEvidenceDetails(evidence);
        }
    }

    renderEvidenceDetails(evidence) {
        const uploadDate = new Date(evidence.uploadedAt).toLocaleString();
        
        return `
            <div class="evidence-details-content">
                <div class="evidence-preview-large">
                    ${this.getEvidencePreview(evidence)}
                </div>
                <div class="evidence-info">
                    <h3>${evidence.name}</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Type:</label>
                            <span>${evidence.type}</span>
                        </div>
                        <div class="info-item">
                            <label>Standard:</label>
                            <span>${evidence.standard || 'Not specified'}</span>
                        </div>
                        <div class="info-item">
                            <label>Requirement:</label>
                            <span>${evidence.requirement || 'Not specified'}</span>
                        </div>
                        <div class="info-item">
                            <label>Status:</label>
                            <span class="status-badge status-${evidence.status}">${evidence.status}</span>
                        </div>
                        <div class="info-item">
                            <label>Size:</label>
                            <span>${this.formatFileSize(evidence.size)}</span>
                        </div>
                        <div class="info-item">
                            <label>Upload Date:</label>
                            <span>${uploadDate}</span>
                        </div>
                    </div>
                    <div class="evidence-description-full">
                        <label>Description:</label>
                        <p>${evidence.description || 'No description provided'}</p>
                    </div>
                    <div class="evidence-tags-full">
                        <label>Tags:</label>
                        <div class="tags-container">
                            ${evidence.tags ? evidence.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : 'No tags'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async downloadEvidence() {
        if (!this.currentEvidence) return;

        try {
            const link = document.createElement('a');
            link.href = this.currentEvidence.url;
            link.download = this.currentEvidence.name;
            link.click();
        } catch (error) {
            console.error('Error downloading evidence:', error);
            this.showNotification('Error downloading evidence', 'error');
        }
    }

    editEvidence() {
        // Implementation for editing evidence metadata
        this.showNotification('Edit functionality coming soon', 'info');
    }

    updateRequirements() {
        const standard = document.getElementById('uploadStandard').value;
        const requirementSelect = document.getElementById('uploadRequirement');
        
        requirementSelect.innerHTML = '<option value="">Select Requirement</option>';
        
        if (standard) {
            const requirements = this.getRequirementsForStandard(standard);
            requirements.forEach(req => {
                const option = document.createElement('option');
                option.value = req.id;
                option.textContent = req.title;
                requirementSelect.appendChild(option);
            });
        }
    }

    getRequirementsForStandard(standard) {
        // This would be populated from the requirements collection
        const requirements = {
            'iso_9001': [
                { id: 'req_1', title: 'Quality Management System' },
                { id: 'req_2', title: 'Management Responsibility' },
                { id: 'req_3', title: 'Resource Management' }
            ],
            'iso_14001': [
                { id: 'req_4', title: 'Environmental Policy' },
                { id: 'req_5', title: 'Environmental Aspects' },
                { id: 'req_6', title: 'Legal Requirements' }
            ],
            'ohsas_18001': [
                { id: 'req_7', title: 'OH&S Policy' },
                { id: 'req_8', title: 'Hazard Identification' },
                { id: 'req_9', title: 'Risk Assessment' }
            ],
            'sa_8000': [
                { id: 'req_10', title: 'Child Labor' },
                { id: 'req_11', title: 'Forced Labor' },
                { id: 'req_12', title: 'Health & Safety' }
            ]
        };

        return requirements[standard] || [];
    }

    resetUploadForm() {
        this.uploadedFiles = [];
        document.getElementById('uploadPreview').style.display = 'none';
        document.getElementById('fileInput').value = '';
        document.getElementById('uploadStandard').value = '';
        document.getElementById('uploadRequirement').value = '';
        document.getElementById('uploadType').value = 'document';
        document.getElementById('uploadDescription').value = '';
        document.getElementById('uploadTags').value = '';
        document.getElementById('uploadDate').value = '';
    }

    updateStats() {
        const totalEvidence = this.evidenceItems.length;
        const organizedEvidence = this.evidenceItems.filter(item => 
            item.status === 'organized' || item.status === 'reviewed' || item.status === 'approved'
        ).length;
        const activeStandards = new Set(this.evidenceItems.map(item => item.standard).filter(Boolean)).size;

        document.getElementById('totalEvidence').textContent = totalEvidence;
        document.getElementById('organizedEvidence').textContent = organizedEvidence;
        document.getElementById('activeStandards').textContent = activeStandards;
    }

    closeUploadModal() {
        const modal = document.getElementById('uploadModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeDetailsModal() {
        const modal = document.getElementById('evidenceDetailsModal');
        if (modal) {
            modal.style.display = 'none';
            this.currentEvidence = null;
        }
    }

    closeCreateFolderModal() {
        const modal = document.getElementById('createFolderModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('folderForm').reset();
        }
    }

    closeBulkOrganizeModal() {
        const modal = document.getElementById('bulkOrganizeModal');
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

// Initialize the evidence organizer
const evidenceOrganizer = new EvidenceOrganizer();

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    evidenceOrganizer.init();
});
