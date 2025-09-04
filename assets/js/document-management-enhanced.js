// Enhanced Document Management
import { 
    auth, 
    db, 
    storage,
    storageRef,
    uploadBytes,
    getDownloadURL 
} from '../firebase-config.js';

// Enhanced Document Management System v2.0
// Key improvements: Real-time updates, security, bulk operations, better UX

class EnhancedDocumentManager {
    constructor() {
        this.documents = [];
        this.filteredDocuments = [];
        this.factories = [];
        this.currentView = 'grid';
        this.currentUser = null;
        this.selectedDocuments = new Set();
        this.realTimeListeners = [];
        this.canWrite = false;
        this.init();
    }

    async init() {
        try {
            await this.checkAuthentication();
            await this.loadFactories();
            await this.loadDocuments();
            this.setupRealTimeListeners();
            this.setupEventListeners();
            this.updateDocumentsDisplay();
            this.updateStats();
        } catch (error) {
            console.error('❌ Error initializing:', error);
            this.showError('Failed to initialize document management');
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
            this.factories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        } catch (error) {
            console.error('❌ Error loading factories:', error);
        }
    }

    async loadDocuments() {
        try {
            this.showLoadingState();
            const snapshot = await collection(db, 'documents');
            this.documents = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    uploadedAt: this.safeToDate(data.uploadedAt) || new Date(),
                    issueDate: this.safeToDate(data.issueDate),
                    expirationDate: this.safeToDate(data.expirationDate)
                };
            });
            this.documents.sort((a, b) => b.uploadedAt - a.uploadedAt);
            this.applyFilters();
        } catch (error) {
            console.error('❌ Error loading documents:', error);
            this.showError('Failed to load documents');
        } finally {
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
            expirationDate: this.safeToDate(data.expirationDate)
        };
        this.documents.unshift(document);
        this.applyFilters();
        this.updateStats();
    }

    handleDocumentModified(doc) {
        const data = doc.data();
        const document = {
            id: doc.id,
            ...data,
            uploadedAt: this.safeToDate(data.uploadedAt) || new Date(),
            issueDate: this.safeToDate(data.issueDate),
            expirationDate: this.safeToDate(data.expirationDate)
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
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => this.applyFilters(), 300);
            });
        }
        ['categoryFilter', 'statusFilter', 'factoryFilter', 'dateFilter', 'typeFilter'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.applyFilters());
        });
        // Wait for Firebase to be available before initializing
function initializeDocumentmanagementenhanced() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeDocumentmanagementenhanced, 100);
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
                if (e.key === 'f') { e.preventDefault(); document.getElementById('searchInput')?.focus(); }
                if (e.key === 'n' && this.canWrite) { e.preventDefault(); window.location.href = 'upload.html'; }
                if (e.key === 'a') { e.preventDefault(); this.selectAllDocuments(); }
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
            if (searchTerm && !this.matchesSearch(doc, searchTerm)) return false;
            if (categoryFilter && doc.category !== categoryFilter) return false;
            if (statusFilter && this.getDocumentStatus(doc) !== statusFilter) return false;
            if (factoryFilter && doc.factoryId !== factoryFilter) return false;
            if (dateFilter && !this.matchesDateFilter(doc, dateFilter)) return false;
            if (typeFilter && doc.fileType !== typeFilter) return false;
            return true;
        });

        this.updateDocumentsDisplay();
        this.updateResultsCount();
    }

    matchesSearch(doc, searchTerm) {
        const fields = [doc.title, doc.originalName, doc.categoryName, doc.documentNumber, doc.issuingAuthority, doc.description, doc.factoryName]
            .filter(Boolean).map(v => String(v).toLowerCase());
        return fields.some(f => f.includes(searchTerm));
    }

    matchesDateFilter(doc, filter) {
        const now = new Date();
        const uploadDate = doc.uploadedAt;
        switch (filter) {
            case 'today': return uploadDate.toDateString && uploadDate.toDateString() === now.toDateString();
            case 'week': return uploadDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case 'month': return uploadDate.getMonth && uploadDate.getMonth() === now.getMonth() && uploadDate.getFullYear && uploadDate.getFullYear() === now.getFullYear();
            default: return true;
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
                        <th><input type="checkbox" id="selectAll" onchange="docManager.toggleSelectAll(this)"></th>
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
        const isSelected = this.selectedDocuments.has(doc.id);
        return `
            <div class="document-card ${isSelected ? 'selected' : ''}" onclick="docManager.toggleDocumentSelection('${doc.id}', event)">
                <div class="document-header">
                    <div class="document-icon">${this.getDocumentIcon(doc.fileType)}</div>
                    <div class="document-info">
                        <div class="document-title">${doc.title || doc.originalName || 'Untitled Document'}</div>
                        <div class="document-category">${doc.categoryName || 'Uncategorized'}</div>
                    </div>
                    <div class="document-checkbox">
                        <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="event.stopPropagation(); docManager.toggleDocumentSelection('${doc.id}')">
                    </div>
                </div>
                <div class="document-meta">
                    <div class="meta-row"><i data-lucide="building-2" style="width:14px;height:14px;"></i><span>${factoryName}</span></div>
                    <div class="meta-row"><i data-lucide="calendar" style="width:14px;height:14px;"></i><span>Uploaded ${this.formatDate(doc.uploadedAt)}</span></div>
                    ${doc.expirationDate ? `<div class="meta-row"><i data-lucide="clock" style="width:14px;height:14px;"></i><span>Expires ${this.formatDate(doc.expirationDate)}</span></div>` : ''}
                </div>
                <div class="document-status">
                    <span class="status-badge ${status}">${this.getStatusIcon(status)}${this.formatStatus(status)}</span>
                    <div class="document-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); docManager.downloadDocument('${doc.id}')" title="Download"><i data-lucide="download" style="width:16px;height:16px;"></i></button>
                        <button class="action-btn" onclick="event.stopPropagation(); docManager.shareDocument('${doc.id}')" title="Share"><i data-lucide="share-2" style="width:16px;height:16px;"></i></button>
                        ${this.canWrite ? `<button class="action-btn" onclick="event.stopPropagation(); docManager.editDocument('${doc.id}')" title="Edit"><i data-lucide="edit-2" style="width:16px;height:16px;"></i></button>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    createDocumentRow(doc) {
        const factory = this.factories.find(f => f.id === doc.factoryId);
        const factoryName = factory ? factory.name : doc.factoryId || 'Unknown';
        const status = this.getDocumentStatus(doc);
        const isSelected = this.selectedDocuments.has(doc.id);
        return `
            <tr onclick="docManager.viewDocument('${doc.id}')" style="cursor:pointer;">
                <td onclick="event.stopPropagation(); docManager.toggleDocumentSelection('${doc.id}')"><input type="checkbox" ${isSelected ? 'checked' : ''}></td>
                <td>
                    <div style="display:flex;align-items:center;gap:var(--space-3);">
                        <div style="width:32px;height:32px;color:var(--primary-600);">${this.getDocumentIcon(doc.fileType)}</div>
                        <div>
                            <div style="font-weight:500;color:var(--neutral-900);">${doc.title || doc.originalName || 'Untitled Document'}</div>
                            <div style="font-size:0.75rem;color:var(--neutral-600);">${this.formatFileSize(doc.fileSize)}</div>
                        </div>
                    </div>
                </td>
                <td>${doc.categoryName || 'Uncategorized'}</td>
                <td>${factoryName}</td>
                <td><span class="status-badge ${status}">${this.getStatusIcon(status)}${this.formatStatus(status)}</span></td>
                <td>${this.formatDate(doc.uploadedAt)}</td>
                <td>${doc.expirationDate ? this.formatDate(doc.expirationDate) : 'No expiration'}</td>
                <td>
                    <div style="display:flex;gap:var(--space-1);">
                        <button class="action-btn" onclick="event.stopPropagation(); docManager.downloadDocument('${doc.id}')" title="Download"><i data-lucide="download" style="width:14px;height:14px;"></i></button>
                        <button class="action-btn" onclick="event.stopPropagation(); docManager.shareDocument('${doc.id}')" title="Share"><i data-lucide="share-2" style="width:14px;height:14px;"></i></button>
                        ${this.canWrite ? `<button class="action-btn" onclick="event.stopPropagation(); docManager.editDocument('${doc.id}')" title="Edit"><i data-lucide="edit-2" style="width:14px;height:14px;"></i></button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }

    createEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon"><i data-lucide="file-text"></i></div>
                <h3 class="font-semibold text-neutral-900 mb-2">No documents found</h3>
                <p class="text-neutral-600 mb-4">Try adjusting your filters or upload new documents.</p>
                <a href="upload.html" class="btn btn-primary"><i data-lucide="plus"></i>Upload Documents</a>
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
                const days = Math.ceil((doc.expirationDate - now) / (1000 * 60 * 60 * 24));
                if (days <= 30 && days > 0) expiringSoon++;
                else if (days <= 0) expired++;
            }
            if (doc.uploadedAt >= thisMonthStart) thisMonth++;
        });
        const map = { totalDocuments: this.documents.length, expiringSoon, expiredDocuments: expired, thisMonthUploads: thisMonth };
        Object.entries(map).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        });
    }

    updateResultsCount() {
        const count = this.filteredDocuments.length;
        const total = this.documents.length;
        const text = count === total ? `Showing ${count} documents` : `Showing ${count} of ${total} documents`;
        const el = document.getElementById('resultsCount');
        if (el) el.textContent = text;
    }

    setView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-option').forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`[data-view="${view}"]`);
        if (activeButton) activeButton.classList.add('active');
        this.updateDocumentsDisplay();
    }

    viewDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (doc && doc.downloadURL) this.showDocumentPreview(doc);
    }

    downloadDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (doc && doc.downloadURL) {
            const a = document.createElement('a');
            a.href = doc.downloadURL;
            a.download = doc.originalName || 'document';
            a.click();
            this.showNotification(`Downloading ${doc.title || doc.originalName}...`, 'success');
        }
    }

    shareDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (doc && doc.downloadURL) {
            if (navigator.share) {
                navigator.share({ title: doc.title || doc.originalName, text: `Document: ${doc.title || doc.originalName}`, url: doc.downloadURL });
            } else {
                navigator.clipboard.writeText(doc.downloadURL).then(() => this.showNotification('Document URL copied to clipboard!'));
            }
        }
    }

    editDocument(docId) {
        window.location.href = `upload.html?edit=${docId}`;
    }

    toggleDocumentSelection(docId) {
        if (this.selectedDocuments.has(docId)) this.selectedDocuments.delete(docId);
        else this.selectedDocuments.add(docId);
        this.updateDocumentsDisplay();
        this.updateBulkActions();
    }

    toggleSelectAll(checkbox) {
        if (checkbox.checked) this.selectedDocuments = new Set(this.filteredDocuments.map(doc => doc.id));
        else this.selectedDocuments.clear();
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
        if (!bulkActions) return;
        if (this.selectedDocuments.size > 0) {
            bulkActions.style.display = 'flex';
            bulkActions.innerHTML = `
                <span>${this.selectedDocuments.size} document(s) selected</span>
                <button class="btn btn-secondary" onclick="docManager.bulkDownload()"><i data-lucide="download"></i> Download</button>
                ${this.canWrite ? `<button class=\"btn btn-secondary\" onclick=\"docManager.bulkDelete()\"><i data-lucide=\"trash-2\"></i> Delete</button>` : ''}
            `;
        } else {
            bulkActions.style.display = 'none';
        }
    }

    bulkDownload() {
        if (this.selectedDocuments.size === 0) return;
        this.selectedDocuments.forEach(docId => this.downloadDocument(docId));
        this.showNotification(`Downloading ${this.selectedDocuments.size} documents...`);
    }

    bulkDelete() {
        if (this.selectedDocuments.size === 0 || !this.canWrite) return;
        if (confirm(`Are you sure you want to delete ${this.selectedDocuments.size} documents?`)) {
            this.selectedDocuments.forEach(docId => this.deleteDocument(docId));
            this.selectedDocuments.clear();
            this.updateBulkActions();
        }
    }

    async deleteDocument(docId) {
        try {
            const doc = this.documents.find(d => d.id === docId);
            if (!doc) return;
            await collection(db, 'documents', docId);
            if (doc.fileName) {
                const fileRef = storageRef(storage, doc.fileName);
                await deleteObject(fileRef);
            }
            this.showNotification('Document deleted successfully');
        } catch (error) {
            console.error('Error deleting document:', error);
            this.showError('Failed to delete document');
        }
    }

    // Utilities
    safeToDate(value) {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (value && typeof value.toDate === 'function') return value.toDate();
        if (typeof value === 'string') { const d = new Date(value); return isNaN(d.getTime()) ? null : d; }
        if (typeof value === 'number') return new Date(value);
        if (value && typeof value.seconds === 'number') return new Date(value.seconds * 1000);
        return null;
    }

    getDocumentStatus(doc) {
        if (!doc.expirationDate) return 'active';
        const now = new Date();
        const days = Math.ceil((doc.expirationDate - now) / (1000 * 60 * 60 * 24));
        if (days <= 0) return 'expired';
        if (days <= 30) return 'expiring';
        return 'active';
    }

    getDocumentIcon(fileType) {
        if (fileType?.includes('pdf')) return '<i data-lucide="file-text"></i>';
        if (fileType?.includes('word') || fileType?.includes('document')) return '<i data-lucide="file-text"></i>';
        if (fileType?.includes('image')) return '<i data-lucide="image"></i>';
        return '<i data-lucide="file"></i>';
    }

    getStatusIcon(status) {
        const icons = {
            active: '<i data-lucide="check-circle" style="width:12px;height:12px;"></i>',
            expiring: '<i data-lucide="clock" style="width:12px;height:12px;"></i>',
            expired: '<i data-lucide="x-circle" style="width:12px;height:12px;"></i>'
        };
        return icons[status] || '';
    }

    formatStatus(status) {
        const map = { active: 'Active', expiring: 'Expiring Soon', expired: 'Expired' };
        return map[status] || 'Unknown';
    }

    formatDate(date) {
        if (!date) return 'Not set';
        if (typeof date === 'string') date = new Date(date);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

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

    hideLoadingState() {}

    showDocumentPreview(doc) {
        const modal = document.createElement('div');
        modal.className = 'document-preview-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${doc.title || doc.originalName}</h3>
                        <button class="modal-close" onclick="this.closest('.document-preview-modal').remove()"><i data-lucide="x"></i></button>
                    </div>
                    <div class="modal-body"><iframe src="${doc.downloadURL}" width="100%" height="500px"></iframe></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.initializeIcons();
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
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 5000);
        this.initializeIcons();
    }

    showError(message) { this.showNotification(message, 'error'); }
    initializeIcons() { if (typeof lucide !== 'undefined') { lucide.createIcons(); } }
    destroy() { this.realTimeListeners.forEach(unsubscribe => unsubscribe()); this.realTimeListeners = []; }
}

// Initialize Enhanced Document Manager
let docManager;
document.addEventListener('DOMContentLoaded', function() { docManager = new EnhancedDocumentManager(); });

// Global helpers
window.clearAllFilters = function() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('factoryFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('typeFilter').value = '';
    docManager.applyFilters();
};

window.exportDocuments = function() { docManager.showNotification('Export functionality will be implemented in the next update.'); };
window.importDocuments = function() { docManager.showNotification('Import functionality will be implemented in the next update.'); };
window.logout = function() {
    if (confirm('Are you sure you want to logout?')) {
        if (docManager) docManager.destroy();
        auth.signOut().then(() => { window.location.href = 'login.html'; }).catch(() => { window.location.href = 'login.html'; });
    }
};

// Mobile menu helpers
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
initializeDocumentmanagementenhanced();
