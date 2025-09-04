// Enhanced Document Management System v2.0
// Features: Real-time updates, advanced search, security, mobile optimization

class DocumentManager {
    constructor() {
        this.documents = [];
        this.filteredDocuments = [];
        this.factories = [];
        this.currentView = 'grid';
        this.currentUser = null;
        this.isLoading = false;
        this.searchTimeout = null;
        this.realTimeListeners = [];
        this.selectedDocuments = new Set();
        
        // Enhanced document categories
        this.documentCategories = {
            'business-license': {
                name: 'Business License',
                icon: 'building',
                color: '#3b82f6',
                expirationRequired: true
            },
            'safety-certificate': {
                name: 'Safety Certificate',
                icon: 'shield-check',
                color: '#10b981',
                expirationRequired: true
            },
            'environmental-permit': {
                name: 'Environmental Permit',
                icon: 'leaf',
                color: '#059669',
                expirationRequired: true
            },
            'labor-compliance': {
                name: 'Labor Compliance',
                icon: 'users',
                color: '#8b5cf6',
                expirationRequired: false
            },
            'quality-certificate': {
                name: 'Quality Certificate',
                icon: 'award',
                color: '#f59e0b',
                expirationRequired: true
            },
            'insurance-policy': {
                name: 'Insurance Policy',
                icon: 'umbrella',
                color: '#06b6d4',
                expirationRequired: true
            },
            'audit-report': {
                name: 'Audit Report',
                icon: 'search',
                color: '#6366f1',
                expirationRequired: false
            },
            'training-record': {
                name: 'Training Record',
                icon: 'graduation-cap',
                color: '#ec4899',
                expirationRequired: false
            }
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Enhanced Document Manager...');
            
            await this.checkAuthentication();
            await this.loadFactories();
            await this.loadDocuments();
            this.setupRealTimeListeners();
            this.setupEventListeners();
            this.updateDocumentsDisplay();
            this.updateStats();
            
            console.log('✅ Document Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Document Manager:', error);
            this.showError('Failed to initialize document management system');
        }
    }
    
    async checkAuthentication() {
        return new Promise((resolve) => {
            auth.onAuthStateChanged(async (user) => {
                if (!user) {
                    window.location.href = 'login.html';
                    return;
                }
                
                try {
                    const userDoc = await collection(db, 'users', user.uid);
                    
                    if (!userDoc.exists()()) {
                        window.location.href = 'login.html';
                        return;
                    }
                    
                    const userData = userDoc.data();
                    this.currentUser = { uid: user.uid, ...userData };
                    this.canWrite = (userData.role === 'super_admin' || userData.role === 'factory_admin');
                    
                    const allowedRoles = ['super_admin', 'factory_admin', 'hr_staff', 'auditor'];
                    if (!allowedRoles.includes(userData.role)) {
                        window.location.href = 'dashboard.html';
                        return;
                    }
                    
                    console.log('✅ Access granted for:', userData.role);
                    resolve();
                    
                } catch (error) {
                    console.error('❌ Auth error:', error);
                    window.location.href = 'login.html';
                }
            });
        });
    }
    
    async loadFactories() {
        try {
            const snapshot = await collection(db, 'factories');
            this.factories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            const factoryFilter = document.getElementById('factoryFilter');
            if (factoryFilter) {
                factoryFilter.innerHTML = '<option value="">All Factories</option>';
                this.factories.forEach(factory => {
                    const option = document.createElement('option');
                    option.value = factory.id;
                    option.textContent = factory.name || factory.id;
                    factoryFilter.appendChild(option);
                });
            }
            
            console.log('✅ Factories loaded:', this.factories.length);
            
        } catch (error) {
            console.error('❌ Error loading factories:', error);
        }
    }
    
    async loadDocuments() {
        try {
            this.isLoading = true;
            this.showLoadingState();
            
            const snapshot = await collection(db, 'documents');
            this.documents = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    uploadedAt: this.safeToDate(data.uploadedAt) || new Date(),
                    issueDate: this.safeToDate(data.issueDate),
                    expirationDate: this.safeToDate(data.expirationDate),
                    lastModified: this.safeToDate(data.lastModified) || new Date()
                };
            });
            
            this.documents.sort((a, b) => b.uploadedAt - a.uploadedAt);
            this.applyFilters();
            
            console.log('✅ Documents loaded:', this.documents.length);
            
        } catch (error) {
            console.error('❌ Error loading documents:', error);
            this.showError('Failed to load documents');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }
    
    setupRealTimeListeners() {
        try {
            const unsubscribe = collection(db, 'documents')
                .orderBy('uploadedAt', 'desc')
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            this.handleDocumentAdded(change.doc);
                        } else if (change.type === 'modified') {
                            this.handleDocumentModified(change.doc);
                        } else if (change.type === 'removed') {
                            this.handleDocumentRemoved(change.doc.id);
                        }
                    });
                });
            
            this.realTimeListeners.push(unsubscribe);
            
        } catch (error) {
            console.error('❌ Error setting up real-time listeners:', error);
        }
    }
    
    handleDocumentAdded(doc) {
        const data = doc.data();
        const document = {
            id: doc.id,
            ...data,
            uploadedAt: this.safeToDate(data.uploadedAt) || new Date(),
            issueDate: this.safeToDate(data.issueDate),
            expirationDate: this.safeToDate(data.expirationDate),
            lastModified: this.safeToDate(data.lastModified) || new Date()
        };
        
        this.documents.unshift(document);
        this.applyFilters();
        this.updateStats();
        this.showNotification(`New document: ${document.title || document.originalName}`);
    }
    
    handleDocumentModified(doc) {
        const data = doc.data();
        const document = {
            id: doc.id,
            ...data,
            uploadedAt: this.safeToDate(data.uploadedAt) || new Date(),
            issueDate: this.safeToDate(data.issueDate),
            expirationDate: this.safeToDate(data.expirationDate),
            lastModified: this.safeToDate(data.lastModified) || new Date()
        };
        
        const index = this.documents.findIndex(d => d.id === doc.id);
        if (index !== -1) {
            this.documents[index] = document;
            this.applyFilters();
            this.updateStats();
        }
    }
    
    handleDocumentRemoved(docId) {
        this.documents = this.documents.filter(d => d.id !== docId);
        this.applyFilters();
        this.updateStats();
    }
    
    setupEventListeners() {
        // Enhanced search with debouncing
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.applyFilters();
                }, 300);
            });
        }
        
        // Filter changes
        ['categoryFilter', 'statusFilter', 'factoryFilter', 'dateFilter', 'typeFilter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
            }
        });
        
        // View toggle
        const viewOptions = document.querySelectorAll('.view-option');
        viewOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                this.setView(view);
            });
        });
        
        // Keyboard shortcuts
        // Wait for Firebase to be available before initializing
function initializeDocumentmanagement() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeDocumentmanagement, 100);
        return;
    }

    // Get Firebase instances and functions from the global Firebase object
    const { auth, db } = window.Firebase;
    const {
        doc,
        getDoc,
        setDoc,
        updateDoc,
        deleteDoc,
        collection,
        query,
        where,
        orderBy,
        limit,
        onSnapshot,
        getDocs,
        addDoc,
        serverTimestamp,
        writeBatch
    } = window.Firebase;

document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'f':
                        e.preventDefault();
                        document.getElementById('searchInput')?.focus();
                        break;
                    case 'n':
                        e.preventDefault();
                        window.location.href = 'upload.html';
                        break;
                    case 'a':
                        e.preventDefault();
                        this.selectAllDocuments();
                        break;
                }
            }
        });
    }
    
    applyFilters() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const factoryFilter = document.getElementById('factoryFilter')?.value || '';
        const dateFilter = document.getElementById('dateFilter')?.value || '';
        const typeFilter = document.getElementById('typeFilter')?.value || '';
        
        this.filteredDocuments = this.documents.filter(doc => {
            // Enhanced search across multiple fields
            if (searchTerm && !this.matchesSearch(doc, searchTerm)) {
                return false;
            }
            
            if (categoryFilter && doc.category !== categoryFilter) {
                return false;
            }
            
            if (statusFilter && this.getDocumentStatus(doc) !== statusFilter) {
                return false;
            }
            
            if (factoryFilter && doc.factoryId !== factoryFilter) {
                return false;
            }
            
            if (dateFilter && !this.matchesDateFilter(doc, dateFilter)) {
                return false;
            }
            
            if (typeFilter && doc.fileType !== typeFilter) {
                return false;
            }
            
            return true;
        });
        
        this.updateDocumentsDisplay();
        this.updateResultsCount();
    }
    
    matchesSearch(doc, searchTerm) {
        const searchFields = [
            doc.title,
            doc.originalName,
            doc.categoryName,
            doc.documentNumber,
            doc.issuingAuthority,
            doc.description,
            doc.tags?.join(' '),
            doc.factoryName
        ].filter(Boolean).map(field => field.toLowerCase());
        
        return searchFields.some(field => field.includes(searchTerm));
    }
    
    matchesDateFilter(doc, filter) {
        const now = new Date();
        const uploadDate = doc.uploadedAt;
        
        switch (filter) {
            case 'today':
                return uploadDate.toDateString() === now.toDateString();
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return uploadDate >= weekAgo;
            case 'month':
                return uploadDate.getMonth() === now.getMonth() && uploadDate.getFullYear() === now.getFullYear();
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                const docQuarter = Math.floor(uploadDate.getMonth() / 3);
                return quarter === docQuarter && uploadDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    }
    
    updateDocumentsDisplay() {
        const container = document.getElementById('documentsContainer');
        if (!container) return;
        
        if (this.filteredDocuments.length === 0) {
            container.innerHTML = this.createEmptyState();
            return;
        }
        
        if (this.currentView === 'grid') {
            this.displayGridView(container);
        } else {
            this.displayListView(container);
        }
    }
    
    displayGridView(container) {
        const gridHTML = `
            <div class="documents-grid">
                ${this.filteredDocuments.map(doc => this.createDocumentCard(doc)).join('')}
            </div>
        `;
        
        container.innerHTML = gridHTML;
        this.initializeIcons();
    }
    
    displayListView(container) {
        const tableHTML = `
            <table class="documents-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" id="selectAll" onchange="documentManager.toggleSelectAll(this)"></th>
                        <th>Document</th>
                        <th>Category</th>
                        <th>Factory</th>
                        <th>Status</th>
                        <th>Upload Date</th>
                        <th>Expiration</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.filteredDocuments.map(doc => this.createDocumentRow(doc)).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = tableHTML;
        this.initializeIcons();
    }
    
    createDocumentCard(doc) {
        const factory = this.factories.find(f => f.id === doc.factoryId);
        const factoryName = factory ? factory.name : doc.factoryId || 'Unknown';
        const status = this.getDocumentStatus(doc);
        const category = this.documentCategories[doc.category];
        const isSelected = this.selectedDocuments.has(doc.id);
        
        return `
            <div class="document-card ${isSelected ? 'selected' : ''}" onclick="documentManager.toggleDocumentSelection('${doc.id}', event)">
                <div class="document-header">
                    <div class="document-icon" style="color: ${category?.color || '#6b7280'}">
                        ${this.getDocumentIcon(doc.fileType)}
                    </div>
                    <div class="document-info">
                        <div class="document-title">${doc.title || doc.originalName || 'Untitled Document'}</div>
                        <div class="document-category">${doc.categoryName || 'Uncategorized'}</div>
                    </div>
                    <div class="document-checkbox">
                        <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="event.stopPropagation(); documentManager.toggleDocumentSelection('${doc.id}')">
                    </div>
                </div>
                
                <div class="document-meta">
                    <div class="meta-row">
                        <i data-lucide="building-2" style="width: 14px; height: 14px;"></i>
                        <span>${factoryName}</span>
                    </div>
                    <div class="meta-row">
                        <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                        <span>Uploaded ${this.formatDate(doc.uploadedAt)}</span>
                    </div>
                    ${doc.expirationDate ? `
                    <div class="meta-row">
                        <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
                        <span>Expires ${this.formatDate(doc.expirationDate)}</span>
                    </div>
                    ` : ''}
                    ${doc.documentNumber ? `
                    <div class="meta-row">
                        <i data-lucide="hash" style="width: 14px; height: 14px;"></i>
                        <span>${doc.documentNumber}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="document-status">
                    <span class="status-badge ${status}">
                        ${this.getStatusIcon(status)}
                        ${this.formatStatus(status)}
                    </span>
                    
                    <div class="document-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); documentManager.downloadDocument('${doc.id}')" title="Download">
                            <i data-lucide="download" style="width: 16px; height: 16px;"></i>
                        </button>
                        <button class="action-btn" onclick="event.stopPropagation(); documentManager.shareDocument('${doc.id}')" title="Share">
                            <i data-lucide="share-2" style="width: 16px; height: 16px;"></i>
                        </button>
                        ${this.canWrite ? `
                        <button class="action-btn" onclick="event.stopPropagation(); documentManager.editDocument('${doc.id}')" title="Edit">
                            <i data-lucide="edit-2" style="width: 16px; height: 16px;"></i>
                        </button>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    createDocumentRow(doc) {
        const factory = this.factories.find(f => f.id === doc.factoryId);
        const factoryName = factory ? factory.name : doc.factoryId || 'Unknown';
        const status = this.getDocumentStatus(doc);
        const category = this.documentCategories[doc.category];
        const isSelected = this.selectedDocuments.has(doc.id);
        
        return `
            <tr onclick="documentManager.viewDocument('${doc.id}')" style="cursor: pointer;">
                <td onclick="event.stopPropagation(); documentManager.toggleDocumentSelection('${doc.id}')">
                    <input type="checkbox" ${isSelected ? 'checked' : ''}>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: var(--space-3);">
                        <div style="width: 32px; height: 32px; color: ${category?.color || '#6b7280'};">
                            ${this.getDocumentIcon(doc.fileType)}
                        </div>
                        <div>
                            <div style="font-weight: 500; color: var(--neutral-900);">${doc.title || doc.originalName || 'Untitled Document'}</div>
                            <div style="font-size: 0.75rem; color: var(--neutral-600);">${this.formatFileSize(doc.fileSize)}</div>
                        </div>
                    </div>
                </td>
                <td>${doc.categoryName || 'Uncategorized'}</td>
                <td>${factoryName}</td>
                <td>
                    <span class="status-badge ${status}">
                        ${this.getStatusIcon(status)}
                        ${this.formatStatus(status)}
                    </span>
                </td>
                <td>${this.formatDate(doc.uploadedAt)}</td>
                <td>${doc.expirationDate ? this.formatDate(doc.expirationDate) : 'No expiration'}</td>
                <td>
                    <div style="display: flex; gap: var(--space-1);">
                        <button class="action-btn" onclick="event.stopPropagation(); documentManager.downloadDocument('${doc.id}')" title="Download">
                            <i data-lucide="download" style="width: 14px; height: 14px;"></i>
                        </button>
                        <button class="action-btn" onclick="event.stopPropagation(); documentManager.shareDocument('${doc.id}')" title="Share">
                            <i data-lucide="share-2" style="width: 14px; height: 14px;"></i>
                        </button>
                        ${this.canWrite ? `
                        <button class="action-btn" onclick="event.stopPropagation(); documentManager.editDocument('${doc.id}')" title="Edit">
                            <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
                        </button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }
    
    createEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i data-lucide="file-text"></i>
                </div>
                <h3 class="font-semibold text-neutral-900 mb-2">No documents found</h3>
                <p class="text-neutral-600 mb-4">Try adjusting your filters or upload new documents.</p>
                <a href="upload.html" class="btn btn-primary">
                    <i data-lucide="plus"></i>
                    Upload Documents
                </a>
            </div>
        `;
    }
    
    updateStats() {
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        let expiringSoon = 0;
        let expired = 0;
        let thisMonth = 0;
        
        this.documents.forEach(doc => {
            if (doc.expirationDate) {
                const daysUntilExpiration = Math.ceil((doc.expirationDate - now) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
                    expiringSoon++;
                } else if (daysUntilExpiration <= 0) {
                    expired++;
                }
            }
            
            if (doc.uploadedAt >= thisMonthStart) {
                thisMonth++;
            }
        });
        
        const statElements = {
            'totalDocuments': this.documents.length,
            'expiringSoon': expiringSoon,
            'expiredDocuments': expired,
            'thisMonthUploads': thisMonth
        };
        
        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    updateResultsCount() {
        const count = this.filteredDocuments.length;
        const total = this.documents.length;
        const resultsText = count === total ? 
            `Showing ${count} documents` : 
            `Showing ${count} of ${total} documents`;
        
        const resultsElement = document.getElementById('resultsCount');
        if (resultsElement) {
            resultsElement.textContent = resultsText;
        }
    }
    
    setView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.view-option').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = document.querySelector(`[data-view="${view}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        this.updateDocumentsDisplay();
    }
    
    // Document Actions
    viewDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (doc && doc.downloadURL) {
            this.showDocumentPreview(doc);
        }
    }
    
    downloadDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (doc && doc.downloadURL) {
            this.downloadWithProgress(doc);
        }
    }
    
    shareDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (doc && doc.downloadURL) {
            if (navigator.share) {
                navigator.share({
                    title: doc.title || doc.originalName,
                    text: `Document: ${doc.title || doc.originalName}`,
                    url: doc.downloadURL
                });
            } else {
                navigator.clipboard.writeText(doc.downloadURL).then(() => {
                    this.showNotification('Document URL copied to clipboard!');
                });
            }
        }
    }
    
    editDocument(docId) {
        window.location.href = `upload.html?edit=${docId}`;
    }
    
    // Selection Management
    toggleDocumentSelection(docId, event) {
        if (this.selectedDocuments.has(docId)) {
            this.selectedDocuments.delete(docId);
        } else {
            this.selectedDocuments.add(docId);
        }
        
        this.updateDocumentsDisplay();
        this.updateBulkActions();
    }
    
    toggleSelectAll(checkbox) {
        if (checkbox.checked) {
            this.selectedDocuments = new Set(this.filteredDocuments.map(doc => doc.id));
        } else {
            this.selectedDocuments.clear();
        }
        
        this.updateDocumentsDisplay();
        this.updateBulkActions();
    }
    
    selectAllDocuments() {
        this.selectedDocuments = new Set(this.filteredDocuments.map(doc => doc.id));
        this.updateDocumentsDisplay();
        this.updateBulkActions();
    }
    
    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        if (bulkActions) {
            if (this.selectedDocuments.size > 0) {
                bulkActions.style.display = 'flex';
                bulkActions.innerHTML = `
                    <span>${this.selectedDocuments.size} document(s) selected</span>
                    <button class="btn btn-secondary" onclick="documentManager.bulkDownload()">
                        <i data-lucide="download"></i> Download
                    </button>
                    ${documentManager.canWrite ? `
                    <button class=\"btn btn-secondary\" onclick=\"documentManager.bulkDelete()\">
                        <i data-lucide=\"trash-2\"></i> Delete
                    </button>
                    <button class=\"btn btn-secondary\" onclick=\"documentManager.bulkMove()\">
                        <i data-lucide=\"folder\"></i> Move
                    </button>` : ''}
                `;
            } else {
                bulkActions.style.display = 'none';
            }
        }
    }
    
    bulkDownload() {
        if (this.selectedDocuments.size === 0) return;
        
        this.selectedDocuments.forEach(docId => {
            this.downloadDocument(docId);
        });
        
        this.showNotification(`Downloading ${this.selectedDocuments.size} documents...`);
    }
    
    bulkDelete() {
        if (this.selectedDocuments.size === 0) return;
        
        if (confirm(`Are you sure you want to delete ${this.selectedDocuments.size} documents?`)) {
            this.selectedDocuments.forEach(docId => {
                this.deleteDocument(docId);
            });
            
            this.selectedDocuments.clear();
            this.updateBulkActions();
        }
    }
    
    bulkMove() {
        if (this.selectedDocuments.size === 0) return;
        
        // Implement bulk move functionality
        const selectedDocs = Array.from(this.selectedDocuments);
        const targetCategory = prompt('Enter target category (business_license, safety_certificate, environmental_permit, labor_compliance, quality_certificate, insurance_policy, audit_report, training_record):');
        
        if (!targetCategory) return;
        
        const validCategories = [
            'business_license', 'safety_certificate', 'environmental_permit', 
            'labor_compliance', 'quality_certificate', 'insurance_policy', 
            'audit_report', 'training_record'
        ];
        
        if (!validCategories.includes(targetCategory)) {
            this.showError('Invalid category. Please select a valid category.');
            return;
        }
        
        if (confirm(`Move ${selectedDocs.length} document(s) to ${targetCategory}?`)) {
            this.performBulkMove(selectedDocs, targetCategory);
        }
    }
    
    async performBulkMove(docIds, targetCategory) {
        try {
            this.showNotification(`Moving ${docIds.length} documents...`);
            
            const batch = db.batch();
            const categoryName = this.getCategoryDisplayName(targetCategory);
            
            docIds.forEach(docId => {
                const docRef = collection(db, 'documents', docId);
                batch.update(docRef, {
                    category: targetCategory,
                    categoryName: categoryName,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: auth.currentUser?.uid
                });
            });
            
            await batch.commit();
            
            this.showNotification(`Successfully moved ${docIds.length} documents to ${categoryName}`);
            this.selectedDocuments.clear();
            this.updateSelectionUI();
            
        } catch (error) {
            console.error('Error performing bulk move:', error);
            this.showError('Failed to move documents: ' + error.message);
        }
    }
    
    getCategoryDisplayName(category) {
        const categoryMap = {
            'business_license': 'Business License',
            'safety_certificate': 'Safety Certificate',
            'environmental_permit': 'Environmental Permit',
            'labor_compliance': 'Labor Compliance',
            'quality_certificate': 'Quality Certificate',
            'insurance_policy': 'Insurance Policy',
            'audit_report': 'Audit Report',
            'training_record': 'Training Record'
        };
        return categoryMap[category] || category;
    }
    
    async deleteDocument(docId) {
        try {
            const doc = this.documents.find(d => d.id === docId);
            if (!doc) return;
            
            // Delete from Firestore
            await collection(db, 'documents', docId);
            
            // Delete from Storage
            if (doc.fileName) {
                const storageRef = firebase.storage.ref(doc.fileName);
                await storageRef.delete();
            }
            
            this.showNotification('Document deleted successfully');
            
        } catch (error) {
            console.error('Error deleting document:', error);
            this.showError('Failed to delete document');
        }
    }
    
    // Utility Methods
    safeToDate(dateValue) {
        if (!dateValue) return null;
        
        if (dateValue instanceof Date) {
            return dateValue;
        }
        
        if (dateValue && typeof dateValue.toDate === 'function') {
            return dateValue.toDate();
        }
        
        if (typeof dateValue === 'string') {
            const parsed = new Date(dateValue);
            return isNaN(parsed.getTime()) ? null : parsed;
        }
        
        if (typeof dateValue === 'number') {
            return new Date(dateValue);
        }
        
        if (dateValue && typeof dateValue.seconds === 'number') {
            return new Date(dateValue.seconds * 1000);
        }
        
        return null;
    }
    
    getDocumentStatus(doc) {
        if (!doc.expirationDate) return 'active';
        
        const now = new Date();
        const daysUntilExpiration = Math.ceil((doc.expirationDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiration <= 0) return 'expired';
        if (daysUntilExpiration <= 30) return 'expiring';
        return 'active';
    }
    
    getDocumentIcon(fileType) {
        if (fileType?.includes('pdf')) {
            return '<i data-lucide="file-text"></i>';
        } else if (fileType?.includes('word') || fileType?.includes('document')) {
            return '<i data-lucide="file-text"></i>';
        } else if (fileType?.includes('image')) {
            return '<i data-lucide="image"></i>';
        } else {
            return '<i data-lucide="file"></i>';
        }
    }
    
    getStatusIcon(status) {
        const icons = {
            active: '<i data-lucide="check-circle" style="width: 12px; height: 12px;"></i>',
            expiring: '<i data-lucide="clock" style="width: 12px; height: 12px;"></i>',
            expired: '<i data-lucide="x-circle" style="width: 12px; height: 12px;"></i>'
        };
        return icons[status] || '';
    }
    
    formatStatus(status) {
        const statusMap = {
            active: 'Active',
            expiring: 'Expiring Soon',
            expired: 'Expired'
        };
        return statusMap[status] || 'Unknown';
    }
    
    formatDate(date) {
        if (!date) return 'Not set';
        
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    formatFileSize(bytes) {
        if (!bytes) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // UI Methods
    showLoadingState() {
        const container = document.getElementById('documentsContainer');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading documents...</p>
                </div>
            `;
        }
    }
    
    hideLoadingState() {
        // Loading state will be replaced by actual content
    }
    
    showDocumentPreview(doc) {
        const modal = document.createElement('div');
        modal.className = 'document-preview-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${doc.title || doc.originalName}</h3>
                        <button class="modal-close" onclick="this.closest('.document-preview-modal').remove()">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <iframe src="${doc.downloadURL}" width="100%" height="500px"></iframe>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.initializeIcons();
    }
    
    downloadWithProgress(doc) {
        const a = document.createElement('a');
        a.href = doc.downloadURL;
        a.download = doc.originalName || 'document';
        a.click();
        
        this.showNotification(`Downloading ${doc.title || doc.originalName}...`, 'success');
    }
    
    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
        
        this.initializeIcons();
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    initializeIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    // Cleanup
    destroy() {
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

// Initialize Document Manager
let documentManager;

document.addEventListener('DOMContentLoaded', function() {
    documentManager = new DocumentManager();
});

// Global functions for HTML onclick handlers
window.clearAllFilters = function() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('factoryFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('typeFilter').value = '';
    
    documentManager.applyFilters();
};

window.exportDocuments = function() {
    documentManager.showNotification('Export functionality will be implemented in the next update.');
};

window.importDocuments = function() {
    documentManager.showNotification('Import functionality will be implemented in the next update.');
};

window.logout = function() {
    if (confirm('Are you sure you want to logout?')) {
        if (documentManager) {
            documentManager.destroy();
        }
        auth.signOut().then(() => {
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Logout error:', error);
            window.location.href = 'login.html';
        });
    }
};

// Mobile menu functions
window.toggleMobileMenu = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
};

window.closeMobileMenu = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
};

// Start the initialization process
initializeDocumentmanagement();
