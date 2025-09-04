// Evidence Linking System
class EvidenceLinker {
    constructor() {
        this.currentUser = null;
        this.evidenceItems = [];
        this.requirements = [];
        this.evidenceLinks = [];
        this.selectedEvidence = new Set();
        this.selectedRequirements = new Set();
        this.currentEvidence = null;
        this.currentLink = null;
        
        // Initialize Firebase
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.storage = firebase.storage();
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadEvidence = this.loadEvidence.bind(this);
        this.loadRequirements = this.loadRequirements.bind(this);
        this.loadEvidenceLinks = this.loadEvidenceLinks.bind(this);
        this.renderEvidenceList = this.renderEvidenceList.bind(this);
        this.renderRequirementsTree = this.renderRequirementsTree.bind(this);
        this.renderLinkingWorkspace = this.renderLinkingWorkspace.bind(this);
        this.filterEvidence = this.filterEvidence.bind(this);
        this.startLinking = this.startLinking.bind(this);
        this.createLink = this.createLink.bind(this);
        this.bulkLink = this.bulkLink.bind(this);
        this.autoLink = this.autoLink.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.clearSelection = this.clearSelection.bind(this);
        this.closeLinkingModal = this.closeLinkingModal.bind(this);
        this.closeBulkLinkingModal = this.closeBulkLinkingModal.bind(this);
        this.closeRequirementsTreeModal = this.closeRequirementsTreeModal.bind(this);
        this.applyBulkLinking = this.applyBulkLinking.bind(this);
        this.viewUnlinked = this.viewUnlinked.bind(this);
        this.searchRequirements = this.searchRequirements.bind(this);
        this.viewRequirementsTree = this.viewRequirementsTree.bind(this);
        this.clearLinks = this.clearLinks.bind(this);
        this.verifyLinks = this.verifyLinks.bind(this);
        this.generateCoverageReport = this.generateCoverageReport.bind(this);
        this.viewLinkingHistory = this.viewLinkingHistory.bind(this);
        this.exportLinkingReport = this.exportLinkingReport.bind(this);
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
            await this.loadRequirements();
            await this.loadEvidenceLinks();

            // Set up event listeners
            this.setupEventListeners();

            // Initial render
            this.renderEvidenceList();
            this.renderRequirementsTree();
            this.renderLinkingWorkspace();
            this.updateStats();

            console.log('Evidence Linker initialized successfully');
        } catch (error) {
            console.error('Error initializing Evidence Linker:', error);
        }
    }

    setupEventListeners() {
        // Evidence selection listeners
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.name === 'evidence') {
                this.toggleEvidenceSelection(e.target.value, e.target.checked);
            }
        });

        // Requirement selection listeners
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.name === 'requirement') {
                this.toggleRequirementSelection(e.target.value, e.target.checked);
            }
        });

        // Link strength slider
        const linkStrength = document.getElementById('linkStrength');
        if (linkStrength) {
            linkStrength.addEventListener('input', (e) => {
                this.updateStrengthDisplay(e.target.value);
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

    async loadRequirements() {
        try {
            const snapshot = await this.db.collection('requirements')
                .where('factoryId', '==', this.currentUser.uid)
                .orderBy('standard', 'asc')
                .orderBy('category', 'asc')
                .get();

            this.requirements = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading requirements:', error);
        }
    }

    async loadEvidenceLinks() {
        try {
            const snapshot = await this.db.collection('evidenceLinks')
                .where('factoryId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();

            this.evidenceLinks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading evidence links:', error);
        }
    }

    renderEvidenceList(filteredItems = this.evidenceItems) {
        const list = document.getElementById('evidenceList');
        if (!list) return;

        if (filteredItems.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="file-text"></i>
                    <p>No evidence items found</p>
                    <button class="btn btn-primary" onclick="evidenceLinker.loadEvidence()">
                        Refresh List
                    </button>
                </div>
            `;
            return;
        }

        list.innerHTML = filteredItems.map(item => this.renderEvidenceItem(item)).join('');
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderEvidenceItem(item) {
        const isSelected = this.selectedEvidence.has(item.id);
        const linkStatus = this.getLinkStatus(item.id);
        const linkCount = this.getLinkCount(item.id);
        const uploadDate = new Date(item.uploadedAt).toLocaleDateString();

        return `
            <div class="evidence-item ${isSelected ? 'selected' : ''}" data-id="${item.id}">
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
                        <span class="link-status-badge ${linkStatus}">${linkStatus}</span>
                        <span class="link-count">${linkCount} links</span>
                    </div>
                </div>
                <div class="evidence-preview" onclick="evidenceLinker.openLinking('${item.id}')">
                    ${this.getEvidencePreview(item)}
                </div>
                <div class="evidence-content">
                    <h3>${item.name}</h3>
                    <p class="evidence-description">${item.description || 'No description'}</p>
                    <div class="evidence-details">
                        <span class="evidence-standard">${item.standard || 'No standard'}</span>
                        <span class="evidence-type">${item.type}</span>
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
                    <button class="btn btn-sm btn-primary" onclick="evidenceLinker.openLinking('${item.id}')">
                        <i data-lucide="link"></i>
                        Link
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="evidenceLinker.viewEvidenceDetails('${item.id}')">
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

    getLinkStatus(evidenceId) {
        const links = this.evidenceLinks.filter(link => link.evidenceId === evidenceId);
        if (links.length === 0) return 'unlinked';
        if (links.length >= 3) return 'verified';
        if (links.length >= 1) return 'linked';
        return 'partially_linked';
    }

    getLinkCount(evidenceId) {
        return this.evidenceLinks.filter(link => link.evidenceId === evidenceId).length;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    renderRequirementsTree() {
        const tree = document.getElementById('requirementsTree');
        if (!tree) return;

        if (this.requirements.length === 0) {
            tree.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="list-checks"></i>
                    <p>No requirements available</p>
                </div>
            `;
            return;
        }

        const standards = [...new Set(this.requirements.map(req => req.standard))];
        
        tree.innerHTML = standards.map(standard => this.renderStandardNode(standard)).join('');
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderStandardNode(standard) {
        const standardRequirements = this.requirements.filter(req => req.standard === standard);
        const categories = [...new Set(standardRequirements.map(req => req.category))];
        
        return `
            <div class="standard-node">
                <div class="standard-header" onclick="evidenceLinker.toggleStandard('${standard}')">
                    <div class="standard-icon">
                        <i data-lucide="book-open"></i>
                    </div>
                    <div class="standard-info">
                        <span class="standard-name">${this.getStandardDisplayName(standard)}</span>
                        <span class="requirement-count">${standardRequirements.length} requirements</span>
                    </div>
                    <div class="standard-toggle">
                        <i data-lucide="chevron-down"></i>
                    </div>
                </div>
                <div class="standard-content" id="standard_${standard}">
                    ${categories.map(category => this.renderCategoryNode(standard, category)).join('')}
                </div>
            </div>
        `;
    }

    getStandardDisplayName(standard) {
        const names = {
            'iso_9001': 'ISO 9001 - Quality Management',
            'iso_14001': 'ISO 14001 - Environmental Management',
            'ohsas_18001': 'OHSAS 18001 - Occupational Health & Safety',
            'sa_8000': 'SA 8000 - Social Accountability'
        };
        return names[standard] || standard;
    }

    renderCategoryNode(standard, category) {
        const categoryRequirements = this.requirements.filter(req => 
            req.standard === standard && req.category === category
        );
        
        return `
            <div class="category-node">
                <div class="category-header" onclick="evidenceLinker.toggleCategory('${standard}_${category}')">
                    <div class="category-icon">
                        <i data-lucide="${this.getCategoryIcon(category)}"></i>
                    </div>
                    <div class="category-info">
                        <span class="category-name">${category}</span>
                        <span class="requirement-count">${categoryRequirements.length} items</span>
                    </div>
                    <div class="category-toggle">
                        <i data-lucide="chevron-right"></i>
                    </div>
                </div>
                <div class="category-content" id="category_${standard}_${category}">
                    ${categoryRequirements.map(req => this.renderRequirementNode(req)).join('')}
                </div>
            </div>
        `;
    }

    getCategoryIcon(category) {
        const icons = {
            'policy': 'shield',
            'procedure': 'settings',
            'record': 'file-text',
            'training': 'graduation-cap',
            'monitoring': 'activity'
        };
        return icons[category] || 'list';
    }

    renderRequirementNode(requirement) {
        const isSelected = this.selectedRequirements.has(requirement.id);
        const evidenceCount = this.getRequirementEvidenceCount(requirement.id);
        
        return `
            <div class="requirement-node ${isSelected ? 'selected' : ''}" data-id="${requirement.id}">
                <div class="requirement-header" onclick="evidenceLinker.toggleRequirement('${requirement.id}')">
                    <div class="requirement-checkbox">
                        <input type="checkbox" 
                               id="requirement_${requirement.id}" 
                               name="requirement" 
                               value="${requirement.id}"
                               ${isSelected ? 'checked' : ''}>
                        <label for="requirement_${requirement.id}"></label>
                    </div>
                    <div class="requirement-info">
                        <span class="requirement-code">${requirement.code}</span>
                        <span class="requirement-title">${requirement.title}</span>
                    </div>
                    <div class="requirement-meta">
                        <span class="evidence-count">${evidenceCount} evidence</span>
                    </div>
                </div>
            </div>
        `;
    }

    getRequirementEvidenceCount(requirementId) {
        return this.evidenceLinks.filter(link => link.requirementId === requirementId).length;
    }

    renderLinkingWorkspace() {
        const workspace = document.getElementById('linkingWorkspace');
        if (!workspace) return;

        if (this.selectedEvidence.size === 0 && this.selectedRequirements.size === 0) {
            workspace.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="link"></i>
                    <p>Select evidence and requirements to start linking</p>
                </div>
            `;
            return;
        }

        workspace.innerHTML = `
            <div class="linking-summary">
                <div class="summary-item">
                    <span class="summary-label">Selected Evidence:</span>
                    <span class="summary-value">${this.selectedEvidence.size} items</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Selected Requirements:</span>
                    <span class="summary-value">${this.selectedRequirements.size} items</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Potential Links:</span>
                    <span class="summary-value">${this.selectedEvidence.size * this.selectedRequirements.size}</span>
                </div>
            </div>
            <div class="linking-actions">
                <button class="btn btn-primary" onclick="evidenceLinker.createBulkLinks()">
                    <i data-lucide="link-2"></i>
                    Create Links
                </button>
                <button class="btn btn-outline" onclick="evidenceLinker.clearSelection()">
                    <i data-lucide="x"></i>
                    Clear Selection
                </button>
            </div>
        `;
    }

    filterEvidence() {
        const linkingStatusFilter = document.getElementById('linkingStatusFilter').value;
        const standardFilter = document.getElementById('standardFilter').value;
        const evidenceTypeFilter = document.getElementById('evidenceTypeFilter').value;
        const requirementCategoryFilter = document.getElementById('requirementCategoryFilter').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        let filteredItems = this.evidenceItems;

        if (linkingStatusFilter !== 'all') {
            filteredItems = filteredItems.filter(item => 
                this.getLinkStatus(item.id) === linkingStatusFilter
            );
        }

        if (standardFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.standard === standardFilter);
        }

        if (evidenceTypeFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.type === evidenceTypeFilter);
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

        this.renderEvidenceList(filteredItems);
    }

    startLinking() {
        const unlinkedItems = this.evidenceItems.filter(item => 
            this.getLinkStatus(item.id) === 'unlinked'
        );

        if (unlinkedItems.length === 0) {
            this.showNotification('No unlinked evidence items found', 'info');
            return;
        }

        // Start with the first unlinked item
        this.openLinking(unlinkedItems[0].id);
    }

    openLinking(evidenceId) {
        const evidence = this.evidenceItems.find(e => e.id === evidenceId);
        if (!evidence) return;

        this.currentEvidence = evidence;

        // Populate evidence preview
        this.populateEvidencePreview(evidence);

        // Populate evidence info
        document.getElementById('evidenceFileName').textContent = evidence.name;
        document.getElementById('evidenceFileType').textContent = evidence.type;
        document.getElementById('evidenceStandard').textContent = evidence.standard || 'Not specified';
        document.getElementById('evidenceRequirements').textContent = this.getCurrentRequirements(evidenceId);

        // Reset form
        this.resetLinkForm();

        // Show modal
        const modal = document.getElementById('linkingModal');
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

    getCurrentRequirements(evidenceId) {
        const links = this.evidenceLinks.filter(link => link.evidenceId === evidenceId);
        if (links.length === 0) return 'None';
        
        const requirementIds = links.map(link => link.requirementId);
        const requirements = this.requirements.filter(req => requirementIds.includes(req.id));
        return requirements.map(req => req.code).join(', ');
    }

    resetLinkForm() {
        document.getElementById('linkForm').reset();
        document.getElementById('linkStandard').value = '';
        document.getElementById('linkCategory').value = '';
        document.getElementById('linkType').value = 'direct';
        document.getElementById('linkStrength').value = '3';
        document.getElementById('linkDescription').value = '';
        document.getElementById('linkTags').value = '';
        document.getElementById('linkPriority').value = 'medium';
        
        // Clear requirements list
        document.getElementById('requirementsList').innerHTML = '';
    }

    updateRequirements() {
        const standard = document.getElementById('linkStandard').value;
        const category = document.getElementById('linkCategory').value;
        const requirementsList = document.getElementById('requirementsList');
        
        if (!standard) {
            requirementsList.innerHTML = '<p>Please select a standard first</p>';
            return;
        }

        let filteredRequirements = this.requirements.filter(req => req.standard === standard);
        
        if (category) {
            filteredRequirements = filteredRequirements.filter(req => req.category === category);
        }

        if (filteredRequirements.length === 0) {
            requirementsList.innerHTML = '<p>No requirements found for the selected criteria</p>';
            return;
        }

        requirementsList.innerHTML = filteredRequirements.map(req => `
            <div class="requirement-item">
                <div class="requirement-checkbox">
                    <input type="checkbox" 
                           id="link_requirement_${req.id}" 
                           name="link_requirement" 
                           value="${req.id}">
                    <label for="link_requirement_${req.id}"></label>
                </div>
                <div class="requirement-info">
                    <span class="requirement-code">${req.code}</span>
                    <span class="requirement-title">${req.title}</span>
                    <span class="requirement-category">${req.category}</span>
                </div>
            </div>
        `).join('');
    }

    updateStrengthDisplay(value) {
        const strengthLabels = document.querySelector('.strength-labels');
        if (strengthLabels) {
            const labels = strengthLabels.querySelectorAll('span');
            if (labels.length >= 2) {
                const percentage = ((value - 1) / 4) * 100;
                labels[0].style.opacity = 1 - (percentage / 100);
                labels[1].style.opacity = percentage / 100;
            }
        }
    }

    async createLink() {
        try {
            const selectedRequirements = Array.from(document.querySelectorAll('input[name="link_requirement"]:checked'))
                .map(checkbox => checkbox.value);

            if (selectedRequirements.length === 0) {
                this.showNotification('Please select at least one requirement', 'error');
                return;
            }

            const linkType = document.getElementById('linkType').value;
            const linkStrength = document.getElementById('linkStrength').value;
            const linkDescription = document.getElementById('linkDescription').value;
            const linkTags = document.getElementById('linkTags').value;
            const linkPriority = document.getElementById('linkPriority').value;

            this.showLoading();

            const linkPromises = selectedRequirements.map(requirementId => {
                const requirement = this.requirements.find(req => req.id === requirementId);
                
                const linkData = {
                    evidenceId: this.currentEvidence.id,
                    evidenceName: this.currentEvidence.name,
                    requirementId: requirementId,
                    requirementCode: requirement.code,
                    requirementTitle: requirement.title,
                    linkType: linkType,
                    linkStrength: parseInt(linkStrength),
                    description: linkDescription,
                    tags: linkTags ? linkTags.split(',').map(tag => tag.trim()) : [],
                    priority: linkPriority,
                    linkedBy: this.currentUser.uid,
                    linkedByName: this.currentUser.displayName || this.currentUser.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    factoryId: this.currentUser.uid
                };

                return this.db.collection('evidenceLinks').add(linkData);
            });

            await Promise.all(linkPromises);

            this.hideLoading();
            this.closeLinkingModal();
            
            // Refresh data
            await this.loadEvidenceLinks();
            this.renderEvidenceList();
            this.renderRequirementsTree();
            this.renderLinkingWorkspace();
            this.updateStats();
            
            this.showNotification(`Created ${selectedRequirements.length} links successfully`, 'success');
        } catch (error) {
            console.error('Error creating links:', error);
            this.hideLoading();
            this.showNotification('Error creating links', 'error');
        }
    }

    async saveLinkDraft() {
        try {
            const linkData = this.collectLinkData();
            linkData.status = 'draft';
            
            await this.db.collection('evidenceLinkDrafts').add(linkData);
            this.showNotification('Draft saved successfully', 'success');
        } catch (error) {
            console.error('Error saving draft:', error);
            this.showNotification('Error saving draft', 'error');
        }
    }

    collectLinkData() {
        const selectedRequirements = Array.from(document.querySelectorAll('input[name="link_requirement"]:checked'))
            .map(checkbox => checkbox.value);
        const linkType = document.getElementById('linkType').value;
        const linkStrength = document.getElementById('linkStrength').value;
        const linkDescription = document.getElementById('linkDescription').value;
        const linkTags = document.getElementById('linkTags').value;
        const linkPriority = document.getElementById('linkPriority').value;

        return {
            evidenceId: this.currentEvidence.id,
            evidenceName: this.currentEvidence.name,
            requirementIds: selectedRequirements,
            linkType: linkType,
            linkStrength: parseInt(linkStrength),
            description: linkDescription,
            tags: linkTags ? linkTags.split(',').map(tag => tag.trim()) : [],
            priority: linkPriority,
            createdBy: this.currentUser.uid,
            createdByName: this.currentUser.displayName || this.currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            factoryId: this.currentUser.uid
        };
    }

    bulkLink() {
        if (this.selectedEvidence.size === 0) {
            this.showNotification('Please select evidence items to link', 'error');
            return;
        }

        const modal = document.getElementById('bulkLinkingModal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateSelectedEvidenceList();
            this.populateBulkRequirements();
        }
    }

    updateSelectedEvidenceList() {
        const selectedList = document.getElementById('selectedEvidenceList');
        const selectedCount = document.getElementById('selectedEvidenceCount');
        
        if (selectedList && selectedCount) {
            selectedCount.textContent = this.selectedEvidence.size;
            
            selectedList.innerHTML = Array.from(this.selectedEvidence).map(id => {
                const item = this.evidenceItems.find(e => e.id === id);
                return item ? `
                    <div class="selected-evidence-item">
                        <span class="item-name">${item.name}</span>
                        <span class="item-type">${item.type}</span>
                    </div>
                ` : '';
            }).join('');
        }
    }

    populateBulkRequirements() {
        const bulkRequirements = document.getElementById('bulkRequirements');
        if (bulkRequirements) {
            bulkRequirements.innerHTML = this.requirements.map(req => `
                <option value="${req.id}">${req.code} - ${req.title}</option>
            `).join('');
        }
    }

    async applyBulkLinking() {
        try {
            const standard = document.getElementById('bulkStandard').value;
            const selectedRequirements = Array.from(document.getElementById('bulkRequirements').selectedOptions)
                .map(option => option.value);
            const linkType = document.getElementById('bulkLinkType').value;
            const linkStrength = document.getElementById('bulkLinkStrength').value;
            const linkDescription = document.getElementById('bulkLinkDescription').value;

            if (!standard || selectedRequirements.length === 0) {
                this.showNotification('Please select standard and requirements', 'error');
                return;
            }

            this.showLoading();

            const linkPromises = [];
            
            Array.from(this.selectedEvidence).forEach(evidenceId => {
                selectedRequirements.forEach(requirementId => {
                    const requirement = this.requirements.find(req => req.id === requirementId);
                    const evidence = this.evidenceItems.find(e => e.id === evidenceId);
                    
                    const linkData = {
                        evidenceId: evidenceId,
                        evidenceName: evidence.name,
                        requirementId: requirementId,
                        requirementCode: requirement.code,
                        requirementTitle: requirement.title,
                        linkType: linkType,
                        linkStrength: parseInt(linkStrength),
                        description: linkDescription,
                        tags: [],
                        priority: 'medium',
                        linkedBy: this.currentUser.uid,
                        linkedByName: this.currentUser.displayName || this.currentUser.email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        factoryId: this.currentUser.uid
                    };

                    linkPromises.push(this.db.collection('evidenceLinks').add(linkData));
                });
            });

            await Promise.all(linkPromises);

            this.hideLoading();
            this.closeBulkLinkingModal();
            this.clearSelection();
            
            await this.loadEvidenceLinks();
            this.renderEvidenceList();
            this.renderRequirementsTree();
            this.renderLinkingWorkspace();
            this.updateStats();
            
            this.showNotification(`Created ${linkPromises.length} links successfully`, 'success');
        } catch (error) {
            console.error('Error applying bulk linking:', error);
            this.hideLoading();
            this.showNotification('Error applying bulk linking', 'error');
        }
    }

    autoLink() {
        const unlinkedItems = this.evidenceItems.filter(item => 
            this.getLinkStatus(item.id) === 'unlinked'
        );

        if (unlinkedItems.length === 0) {
            this.showNotification('No unlinked evidence items found', 'info');
            return;
        }

        this.showNotification(`Auto-linking ${unlinkedItems.length} items...`, 'info');
        
        // Simple auto-linking logic based on evidence metadata
        unlinkedItems.forEach(item => {
            if (item.standard && item.requirement) {
                const matchingRequirements = this.requirements.filter(req => 
                    req.standard === item.standard && 
                    req.code === item.requirement
                );
                
                if (matchingRequirements.length > 0) {
                    const linkData = {
                        evidenceId: item.id,
                        evidenceName: item.name,
                        requirementId: matchingRequirements[0].id,
                        requirementCode: matchingRequirements[0].code,
                        requirementTitle: matchingRequirements[0].title,
                        linkType: 'direct',
                        linkStrength: 4,
                        description: 'Auto-linked based on metadata',
                        tags: ['auto-linked'],
                        priority: 'medium',
                        linkedBy: this.currentUser.uid,
                        linkedByName: this.currentUser.displayName || this.currentUser.email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        factoryId: this.currentUser.uid
                    };

                    this.db.collection('evidenceLinks').add(linkData);
                }
            }
        });

        this.loadEvidenceLinks();
        this.renderEvidenceList();
        this.updateStats();
    }

    selectAll() {
        const checkboxes = document.querySelectorAll('input[name="evidence"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.selectedEvidence.add(checkbox.value);
        });
        
        document.querySelectorAll('.evidence-item').forEach(item => {
            item.classList.add('selected');
        });
        
        this.renderLinkingWorkspace();
    }

    clearSelection() {
        const checkboxes = document.querySelectorAll('input[name="evidence"], input[name="requirement"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        this.selectedEvidence.clear();
        this.selectedRequirements.clear();
        
        document.querySelectorAll('.evidence-item, .requirement-node').forEach(item => {
            item.classList.remove('selected');
        });
        
        this.renderLinkingWorkspace();
    }

    toggleEvidenceSelection(evidenceId, isSelected) {
        if (isSelected) {
            this.selectedEvidence.add(evidenceId);
        } else {
            this.selectedEvidence.delete(evidenceId);
        }
        
        const item = document.querySelector(`[data-id="${evidenceId}"]`);
        if (item) {
            item.classList.toggle('selected', isSelected);
        }
        
        this.renderLinkingWorkspace();
    }

    toggleRequirementSelection(requirementId, isSelected) {
        if (isSelected) {
            this.selectedRequirements.add(requirementId);
        } else {
            this.selectedRequirements.delete(requirementId);
        }
        
        const item = document.querySelector(`[data-id="${requirementId}"]`);
        if (item) {
            item.classList.toggle('selected', isSelected);
        }
        
        this.renderLinkingWorkspace();
    }

    viewUnlinked() {
        const unlinkedItems = this.evidenceItems.filter(item => 
            this.getLinkStatus(item.id) === 'unlinked'
        );
        this.renderEvidenceList(unlinkedItems);
    }

    searchRequirements() {
        const searchTerm = prompt('Enter search term for requirements:');
        if (!searchTerm) return;

        const filteredRequirements = this.requirements.filter(req => 
            req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.code.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.renderRequirementsTree(filteredRequirements);
    }

    viewRequirementsTree() {
        const modal = document.getElementById('requirementsTreeModal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateTreeView();
        }
    }

    updateTreeView() {
        const treeView = document.getElementById('requirementsTreeView');
        if (!treeView) return;

        const standard = document.getElementById('treeStandard').value;
        const showEvidenceCount = document.getElementById('showEvidenceCount').checked;

        let filteredRequirements = this.requirements;
        if (standard !== 'all') {
            filteredRequirements = this.requirements.filter(req => req.standard === standard);
        }

        treeView.innerHTML = filteredRequirements.map(req => `
            <div class="tree-requirement-item">
                <div class="requirement-info">
                    <span class="requirement-code">${req.code}</span>
                    <span class="requirement-title">${req.title}</span>
                    <span class="requirement-standard">${req.standard}</span>
                </div>
                ${showEvidenceCount ? `<span class="evidence-count">${this.getRequirementEvidenceCount(req.id)} evidence</span>` : ''}
            </div>
        `).join('');
    }

    async clearLinks() {
        if (this.selectedEvidence.size === 0) {
            this.showNotification('Please select evidence items to clear links', 'error');
            return;
        }

        if (!confirm('Are you sure you want to clear all links for the selected evidence?')) {
            return;
        }

        try {
            this.showLoading();

            const deletePromises = Array.from(this.selectedEvidence).map(evidenceId => {
                return this.db.collection('evidenceLinks')
                    .where('evidenceId', '==', evidenceId)
                    .get()
                    .then(snapshot => {
                        const batch = this.db.batch();
                        snapshot.docs.forEach(doc => {
                            batch.delete(doc.ref);
                        });
                        return batch.commit();
                    });
            });

            await Promise.all(deletePromises);

            this.hideLoading();
            this.clearSelection();
            
            await this.loadEvidenceLinks();
            this.renderEvidenceList();
            this.renderRequirementsTree();
            this.renderLinkingWorkspace();
            this.updateStats();
            
            this.showNotification('Links cleared successfully', 'success');
        } catch (error) {
            console.error('Error clearing links:', error);
            this.hideLoading();
            this.showNotification('Error clearing links', 'error');
        }
    }

    verifyLinks() {
        const unverifiedLinks = this.evidenceLinks.filter(link => 
            !link.verified
        );

        if (unverifiedLinks.length === 0) {
            this.showNotification('No unverified links found', 'info');
            return;
        }

        this.showNotification(`Verifying ${unverifiedLinks.length} links...`, 'info');
        
        // Simple verification logic
        unverifiedLinks.forEach(link => {
            this.db.collection('evidenceLinks').doc(link.id).update({
                verified: true,
                verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
                verifiedBy: this.currentUser.uid
            });
        });

        this.loadEvidenceLinks();
        this.updateStats();
    }

    async generateCoverageReport() {
        try {
            this.showLoading();

            const reportData = {
                totalEvidence: this.evidenceItems.length,
                totalRequirements: this.requirements.length,
                totalLinks: this.evidenceLinks.length,
                coverageByStandard: this.calculateCoverageByStandard(),
                coverageByCategory: this.calculateCoverageByCategory(),
                generatedAt: new Date().toISOString(),
                generatedBy: this.currentUser.uid
            };

            await this.db.collection('coverageReports').add(reportData);

            this.hideLoading();
            this.showNotification('Coverage report generated successfully', 'success');
        } catch (error) {
            console.error('Error generating coverage report:', error);
            this.hideLoading();
            this.showNotification('Error generating coverage report', 'error');
        }
    }

    calculateCoverageByStandard() {
        const standards = [...new Set(this.requirements.map(req => req.standard))];
        return standards.map(standard => {
            const standardRequirements = this.requirements.filter(req => req.standard === standard);
            const linkedRequirements = new Set(
                this.evidenceLinks
                    .filter(link => standardRequirements.some(req => req.id === link.requirementId))
                    .map(link => link.requirementId)
            );
            
            return {
                standard: standard,
                totalRequirements: standardRequirements.length,
                linkedRequirements: linkedRequirements.size,
                coverage: (linkedRequirements.size / standardRequirements.length) * 100
            };
        });
    }

    calculateCoverageByCategory() {
        const categories = [...new Set(this.requirements.map(req => req.category))];
        return categories.map(category => {
            const categoryRequirements = this.requirements.filter(req => req.category === category);
            const linkedRequirements = new Set(
                this.evidenceLinks
                    .filter(link => categoryRequirements.some(req => req.id === link.requirementId))
                    .map(link => link.requirementId)
            );
            
            return {
                category: category,
                totalRequirements: categoryRequirements.length,
                linkedRequirements: linkedRequirements.size,
                coverage: (linkedRequirements.size / categoryRequirements.length) * 100
            };
        });
    }

    viewLinkingHistory() {
        // Implementation for viewing linking history
        this.showNotification('Linking history feature coming soon', 'info');
    }

    async exportLinkingReport() {
        try {
            const reportData = {
                evidenceItems: this.evidenceItems,
                requirements: this.requirements,
                evidenceLinks: this.evidenceLinks,
                coverage: this.calculateCoverageByStandard(),
                generatedAt: new Date().toISOString()
            };

            const csvContent = this.generateLinkingCSV(reportData);
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `evidence_linking_report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting linking report:', error);
            this.showNotification('Error exporting linking report', 'error');
        }
    }

    generateLinkingCSV(data) {
        const headers = ['Evidence Name', 'Requirement Code', 'Requirement Title', 'Link Type', 'Link Strength', 'Description', 'Created Date'];
        const rows = data.evidenceLinks.map(link => [
            link.evidenceName,
            link.requirementCode,
            link.requirementTitle,
            link.linkType,
            link.linkStrength,
            link.description || '',
            new Date(link.createdAt).toLocaleDateString()
        ]);

        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    exportTreeView() {
        const treeData = this.requirements.map(req => ({
            code: req.code,
            title: req.title,
            standard: req.standard,
            category: req.category,
            evidenceCount: this.getRequirementEvidenceCount(req.id)
        }));

        const csvContent = this.generateTreeCSV(treeData);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `requirements_tree_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateTreeCSV(data) {
        const headers = ['Code', 'Title', 'Standard', 'Category', 'Evidence Count'];
        const rows = data.map(item => [
            item.code,
            item.title,
            item.standard,
            item.category,
            item.evidenceCount
        ]);

        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    updateStats() {
        const unlinkedEvidence = this.evidenceItems.filter(item => 
            this.getLinkStatus(item.id) === 'unlinked'
        ).length;
        
        const linkedToday = this.evidenceLinks.filter(link => {
            const today = new Date().toDateString();
            const linkDate = new Date(link.createdAt).toDateString();
            return linkDate === today;
        }).length;
        
        const totalRequirements = this.requirements.length;
        const linkedRequirements = new Set(this.evidenceLinks.map(link => link.requirementId)).size;
        const coverageRate = totalRequirements > 0 ? Math.round((linkedRequirements / totalRequirements) * 100) : 0;

        document.getElementById('unlinkedEvidence').textContent = unlinkedEvidence;
        document.getElementById('linkedToday').textContent = linkedToday;
        document.getElementById('coverageRate').textContent = `${coverageRate}%`;
    }

    closeLinkingModal() {
        const modal = document.getElementById('linkingModal');
        if (modal) {
            modal.style.display = 'none';
            this.currentEvidence = null;
            this.currentLink = null;
        }
    }

    closeBulkLinkingModal() {
        const modal = document.getElementById('bulkLinkingModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeRequirementsTreeModal() {
        const modal = document.getElementById('requirementsTreeModal');
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

// Initialize the evidence linker
const evidenceLinker = new EvidenceLinker();

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    evidenceLinker.init();
});
