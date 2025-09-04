// Document Versioning System v1.0
// Features: Version tracking, comparison, rollback, history management
import { 
    auth, 
    db, 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    orderBy, 
    addDoc, 
    updateDoc, 
    serverTimestamp,
    arrayUnion,
    storage,
    storageRef,
    uploadBytes,
    getDownloadURL
} from '../firebase-config.js';

class DocumentVersioningSystem {
    constructor() {
        this.currentDocument = null;
        this.versions = [];
        this.selectedVersions = [];
        this.versionHistory = [];
        
        this.init();
    }
    
    init() {
        console.log('🚀 Document Versioning System initialized');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Version comparison events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.version-compare-btn')) {
                this.showVersionComparison();
            }
            
            if (e.target.matches('.version-rollback-btn')) {
                this.rollbackToVersion(e.target.dataset.versionId);
            }
            
            if (e.target.matches('.version-history-btn')) {
                this.showVersionHistory();
            }
        });
    }
    
    async loadDocumentVersions(documentId) {
        try {
            console.log('📄 Loading versions for document:', documentId);
            
            const versionsRef = collection(db, 'documentVersions');
            const versionsQuery = query(
                versionsRef,
                where('documentId', '==', documentId),
                orderBy('versionNumber', 'desc')
            );
            const snapshot = await getDocs(versionsQuery);
            
            this.versions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }));
            
            // Get current document
            const docRef = doc(db, 'documents', documentId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                this.currentDocument = {
                    id: docSnapshot.id,
                    ...docSnapshot.data(),
                    versionNumber: this.versions.length + 1
                };
            }
            
            console.log('✅ Loaded', this.versions.length, 'versions');
            this.updateVersionDisplay();
            
        } catch (error) {
            console.error('❌ Error loading document versions:', error);
            this.showError('Failed to load document versions');
        }
    }
    
    async createNewVersion(documentId, fileData, metadata) {
        try {
            console.log('🔄 Creating new version for document:', documentId);
            
            // Get current version number
            const versionNumber = this.versions.length + 1;
            
            // Upload new file version
            const fileName = `documents/${documentId}/versions/v${versionNumber}_${fileData.name}`;
            const fileRef = storageRef(storage, fileName);
            
            const uploadResult = await uploadBytes(fileRef, fileData);
            const downloadURL = await getDownloadURL(uploadResult.ref);
            
            // Create version record
            const versionData = {
                documentId: documentId,
                versionNumber: versionNumber,
                fileName: fileName,
                originalName: fileData.name,
                fileSize: fileData.size,
                fileType: fileData.type,
                downloadURL: downloadURL,
                metadata: {
                    ...metadata,
                    uploadedBy: auth.currentUser.uid,
                    uploadedAt: new Date(),
                    changeDescription: metadata.changeDescription || 'Version update'
                },
                createdAt: new Date(),
                createdBy: auth.currentUser.uid,
                status: 'active'
            };
            
            const versionRef = await addDoc(collection(db, 'documentVersions'), versionData);
            
            // Update main document record
            await updateDoc(doc(db, 'documents', documentId), {
                currentVersion: versionNumber,
                lastModified: new Date(),
                lastModifiedBy: auth.currentUser.uid,
                versionHistory: arrayUnion({
                    versionNumber: versionNumber,
                    versionId: versionRef.id,
                    changeDescription: metadata.changeDescription,
                    createdAt: new Date(),
                    createdBy: auth.currentUser.uid
                })
            });
            
            // Add to local versions
            this.versions.unshift({
                id: versionRef.id,
                ...versionData
            });
            
            this.updateVersionDisplay();
            this.showNotification(`Version ${versionNumber} created successfully`, 'success');
            
            return versionRef.id;
            
        } catch (error) {
            console.error('❌ Error creating new version:', error);
            this.showError('Failed to create new version');
            throw error;
        }
    }
    
    async rollbackToVersion(versionId) {
        try {
            const version = this.versions.find(v => v.id === versionId);
            if (!version) {
                this.showError('Version not found');
                return;
            }
            
            if (!confirm(`Are you sure you want to rollback to version ${version.versionNumber}? This will create a new version with the old content.`)) {
                return;
            }
            
            console.log('🔄 Rolling back to version:', version.versionNumber);
            
            // Download the old version file
            const response = await fetch(version.downloadURL);
            const blob = await response.blob();
            
            // Create a new file object
            const file = new File([blob], version.originalName, {
                type: version.fileType
            });
            
            // Create new version with rollback content
            const metadata = {
                changeDescription: `Rollback to version ${version.versionNumber}`,
                rollbackFrom: version.versionNumber,
                rollbackReason: 'User requested rollback'
            };
            
            await this.createNewVersion(this.currentDocument.id, file, metadata);
            
            this.showNotification(`Successfully rolled back to version ${version.versionNumber}`, 'success');
            
        } catch (error) {
            console.error('❌ Error rolling back version:', error);
            this.showError('Failed to rollback version');
        }
    }
    
    showVersionComparison() {
        if (this.selectedVersions.length !== 2) {
            this.showError('Please select exactly 2 versions to compare');
            return;
        }
        
        const version1 = this.versions.find(v => v.id === this.selectedVersions[0]);
        const version2 = this.versions.find(v => v.id === this.selectedVersions[1]);
        
        if (!version1 || !version2) {
            this.showError('Selected versions not found');
            return;
        }
        
        this.createComparisonModal(version1, version2);
    }
    
    createComparisonModal(version1, version2) {
        const modal = document.createElement('div');
        modal.className = 'version-comparison-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>Version Comparison</h3>
                        <button class="modal-close" onclick="this.closest('.version-comparison-modal').remove()">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="comparison-header">
                            <div class="version-info">
                                <h4>Version ${version1.versionNumber}</h4>
                                <p>${this.formatDate(version1.createdAt)}</p>
                                <p>${version1.metadata.changeDescription}</p>
                            </div>
                            <div class="version-info">
                                <h4>Version ${version2.versionNumber}</h4>
                                <p>${this.formatDate(version2.createdAt)}</p>
                                <p>${version2.metadata.changeDescription}</p>
                            </div>
                        </div>
                        <div class="comparison-content">
                            <div class="version-preview">
                                <h5>Version ${version1.versionNumber}</h5>
                                <iframe src="${version1.downloadURL}" width="100%" height="400px"></iframe>
                            </div>
                            <div class="version-preview">
                                <h5>Version ${version2.versionNumber}</h5>
                                <iframe src="${version2.downloadURL}" width="100%" height="400px"></iframe>
                            </div>
                        </div>
                        <div class="comparison-actions">
                            <button class="btn btn-secondary" onclick="documentVersioning.downloadVersion('${version1.id}')">
                                <i data-lucide="download"></i> Download v${version1.versionNumber}
                            </button>
                            <button class="btn btn-secondary" onclick="documentVersioning.downloadVersion('${version2.id}')">
                                <i data-lucide="download"></i> Download v${version2.versionNumber}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.initializeIcons();
    }
    
    showVersionHistory() {
        const modal = document.createElement('div');
        modal.className = 'version-history-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Version History</h3>
                        <button class="modal-close" onclick="this.closest('.version-history-modal').remove()">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="version-timeline">
                            ${this.versions.map(version => this.createVersionTimelineItem(version)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.initializeIcons();
    }
    
    createVersionTimelineItem(version) {
        const isCurrent = version.versionNumber === this.currentDocument?.currentVersion;
        
        return `
            <div class="timeline-item ${isCurrent ? 'current' : ''}">
                <div class="timeline-marker">
                    <i data-lucide="${isCurrent ? 'star' : 'circle'}"></i>
                </div>
                <div class="timeline-content">
                    <div class="version-header">
                        <h4>Version ${version.versionNumber}</h4>
                        <span class="version-date">${this.formatDate(version.createdAt)}</span>
                    </div>
                    <div class="version-details">
                        <p><strong>Change:</strong> ${version.metadata.changeDescription}</p>
                        <p><strong>File:</strong> ${version.originalName} (${this.formatFileSize(version.fileSize)})</p>
                        <p><strong>Uploaded by:</strong> ${version.metadata.uploadedBy}</p>
                    </div>
                    <div class="version-actions">
                        <button class="btn btn-sm btn-secondary" onclick="documentVersioning.downloadVersion('${version.id}')">
                            <i data-lucide="download"></i> Download
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="documentVersioning.previewVersion('${version.id}')">
                            <i data-lucide="eye"></i> Preview
                        </button>
                        ${!isCurrent ? `
                        <button class="btn btn-sm btn-warning" onclick="documentVersioning.rollbackToVersion('${version.id}')">
                            <i data-lucide="rotate-ccw"></i> Rollback
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    updateVersionDisplay() {
        const container = document.getElementById('versionContainer');
        if (!container) return;
        
        if (this.versions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="file-text" style="width: 48px; height: 48px; color: var(--neutral-400);"></i>
                    <h3>No versions available</h3>
                    <p>This document has no version history yet.</p>
                </div>
            `;
            return;
        }
        
        const versionsHTML = `
            <div class="versions-header">
                <h3>Document Versions (${this.versions.length})</h3>
                <div class="version-actions">
                    <button class="btn btn-secondary" onclick="documentVersioning.showVersionHistory()">
                        <i data-lucide="history"></i> View History
                    </button>
                    <button class="btn btn-primary" onclick="documentVersioning.createNewVersionFromCurrent()">
                        <i data-lucide="plus"></i> Create New Version
                    </button>
                </div>
            </div>
            <div class="versions-list">
                ${this.versions.map(version => this.createVersionCard(version)).join('')}
            </div>
        `;
        
        container.innerHTML = versionsHTML;
        this.initializeIcons();
    }
    
    createVersionCard(version) {
        const isCurrent = version.versionNumber === this.currentDocument?.currentVersion;
        
        return `
            <div class="version-card ${isCurrent ? 'current' : ''}">
                <div class="version-header">
                    <div class="version-info">
                        <h4>Version ${version.versionNumber}</h4>
                        <span class="version-date">${this.formatDate(version.createdAt)}</span>
                        ${isCurrent ? '<span class="current-badge">Current</span>' : ''}
                    </div>
                    <div class="version-checkbox">
                        <input type="checkbox" onchange="documentVersioning.toggleVersionSelection('${version.id}', this)">
                    </div>
                </div>
                <div class="version-details">
                    <p><strong>Change:</strong> ${version.metadata.changeDescription}</p>
                    <p><strong>File:</strong> ${version.originalName}</p>
                    <p><strong>Size:</strong> ${this.formatFileSize(version.fileSize)}</p>
                </div>
                <div class="version-actions">
                    <button class="btn btn-sm btn-secondary" onclick="documentVersioning.downloadVersion('${version.id}')">
                        <i data-lucide="download"></i> Download
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="documentVersioning.previewVersion('${version.id}')">
                        <i data-lucide="eye"></i> Preview
                    </button>
                    ${!isCurrent ? `
                    <button class="btn btn-sm btn-warning" onclick="documentVersioning.rollbackToVersion('${version.id}')">
                        <i data-lucide="rotate-ccw"></i> Rollback
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    toggleVersionSelection(versionId, checkbox) {
        if (checkbox.checked) {
            if (this.selectedVersions.length >= 2) {
                checkbox.checked = false;
                this.showError('You can only select 2 versions for comparison');
                return;
            }
            this.selectedVersions.push(versionId);
        } else {
            this.selectedVersions = this.selectedVersions.filter(id => id !== versionId);
        }
        
        this.updateComparisonButton();
    }
    
    updateComparisonButton() {
        const compareBtn = document.getElementById('compareVersionsBtn');
        if (compareBtn) {
            compareBtn.disabled = this.selectedVersions.length !== 2;
            compareBtn.textContent = `Compare (${this.selectedVersions.length}/2)`;
        }
    }
    
    async downloadVersion(versionId) {
        try {
            const version = this.versions.find(v => v.id === versionId);
            if (!version) {
                this.showError('Version not found');
                return;
            }
            
            const a = document.createElement('a');
            a.href = version.downloadURL;
            a.download = `v${version.versionNumber}_${version.originalName}`;
            a.click();
            
            this.showNotification(`Downloading version ${version.versionNumber}`, 'success');
            
        } catch (error) {
            console.error('❌ Error downloading version:', error);
            this.showError('Failed to download version');
        }
    }
    
    previewVersion(versionId) {
        const version = this.versions.find(v => v.id === versionId);
        if (!version) {
            this.showError('Version not found');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'version-preview-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Version ${version.versionNumber} Preview</h3>
                        <button class="modal-close" onclick="this.closest('.version-preview-modal').remove()">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="version-info">
                            <p><strong>Change:</strong> ${version.metadata.changeDescription}</p>
                            <p><strong>Created:</strong> ${this.formatDate(version.createdAt)}</p>
                            <p><strong>File:</strong> ${version.originalName}</p>
                        </div>
                        <div class="version-preview">
                            <iframe src="${version.downloadURL}" width="100%" height="500px"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.initializeIcons();
    }
    
    async createNewVersionFromCurrent() {
        // This would typically open a file upload dialog
        // For now, we'll show a notification
        this.showNotification('New version creation will be implemented in the upload interface', 'info');
    }
    
    // Utility Methods
    formatDate(date) {
        if (!date) return 'Unknown';
        
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    formatFileSize(bytes) {
        if (!bytes) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 1px solid var(--neutral-200);
            border-radius: var(--radius-lg);
            padding: var(--space-4);
            box-shadow: var(--shadow-lg);
            z-index: 2000;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            border-left: 4px solid ${type === 'success' ? 'var(--success-500)' : type === 'error' ? 'var(--danger-500)' : 'var(--primary-500)'};
        `;
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--space-2);">
                <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}" style="width: 16px; height: 16px;"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
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
}

// Initialize Document Versioning System
let documentVersioning;

document.addEventListener('DOMContentLoaded', function() {
    documentVersioning = new DocumentVersioningSystem();
});

// Global functions for HTML onclick handlers
window.loadDocumentVersions = function(documentId) {
    documentVersioning.loadDocumentVersions(documentId);
};

window.createNewVersion = function(documentId, fileData, metadata) {
    return documentVersioning.createNewVersion(documentId, fileData, metadata);
};

window.rollbackToVersion = function(versionId) {
    documentVersioning.rollbackToVersion(versionId);
};

window.showVersionHistory = function() {
    documentVersioning.showVersionHistory();
};

window.showVersionComparison = function() {
    documentVersioning.showVersionComparison();
};
