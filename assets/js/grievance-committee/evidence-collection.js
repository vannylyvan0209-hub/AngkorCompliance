// Evidence Collection System
// Manages evidence upload, organization, and management for grievance investigations

class EvidenceCollection {
    constructor() {
        this.currentLanguage = 'en';
        this.evidenceItems = [];
        this.uploadedFiles = [];
        this.currentCase = null;
        this.filters = {
            case: '',
            type: '',
            status: '',
            date: ''
        };
        
        this.initializeSystem();
        this.setupEventListeners();
        this.loadSampleData();
    }

    initializeSystem() {
        // Initialize Firebase
        if (typeof firebase !== 'undefined') {
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.storage = firebase.storage();
            this.setupFirebaseListeners();
        }

        // Set default date
        document.getElementById('date-filter').value = new Date().toISOString().split('T')[0];
        
        // Initialize language
        this.updateLanguage();
        
        // Initialize tabs
        this.initializeTabs();
    }

    setupEventListeners() {
        // File upload events
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const browseBtn = document.getElementById('browse-btn');

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            this.handleFileUpload(files);
        });

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Filter events
        document.getElementById('apply-filters-btn').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('clear-filters-btn').addEventListener('click', () => {
            this.clearFilters();
        });

        // Language toggle
        document.querySelector('.language-btn').addEventListener('click', () => {
            this.toggleLanguage();
        });
    }

    setupFirebaseListeners() {
        // Listen for authentication state changes
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.loadUserData(user);
            } else {
                console.log('User not authenticated');
            }
        });
    }

    loadUserData(user) {
        // Load user-specific evidence data
        this.db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    if (userData.role === 'grievance_committee') {
                        this.loadEvidenceData();
                    }
                }
            })
            .catch((error) => {
                console.error('Error loading user data:', error);
            });
    }

    loadEvidenceData() {
        // Load evidence data from Firestore
        this.db.collection('evidence')
            .where('investigatorId', '==', this.auth.currentUser.uid)
            .orderBy('uploadedAt', 'desc')
            .get()
            .then((querySnapshot) => {
                const evidence = [];
                querySnapshot.forEach((doc) => {
                    evidence.push({ id: doc.id, ...doc.data() });
                });
                this.evidenceItems = evidence;
                this.updateDisplay();
                this.updateStatistics();
            })
            .catch((error) => {
                console.error('Error loading evidence data:', error);
                // Load sample data if Firebase fails
                this.loadSampleData();
            });
    }

    loadSampleData() {
        // Sample evidence items
        this.evidenceItems = [
            {
                id: 1,
                title: 'Initial Complaint Form',
                type: 'document',
                status: 'verified',
                caseId: 'GC-2024-001',
                caseTitle: 'Workplace Harassment Complaint',
                uploadedAt: new Date(Date.now() - 86400000 * 2),
                investigator: 'John Smith',
                fileSize: '245 KB',
                fileType: 'PDF'
            },
            {
                id: 2,
                title: 'Witness Statement - Jane Doe',
                type: 'statement',
                status: 'verified',
                caseId: 'GC-2024-001',
                caseTitle: 'Workplace Harassment Complaint',
                uploadedAt: new Date(Date.now() - 86400000),
                investigator: 'John Smith',
                fileSize: '156 KB',
                fileType: 'DOCX'
            },
            {
                id: 3,
                title: 'Security Camera Footage',
                type: 'video',
                status: 'pending',
                caseId: 'GC-2024-001',
                caseTitle: 'Workplace Harassment Complaint',
                uploadedAt: new Date(Date.now() - 86400000 * 0.5),
                investigator: 'John Smith',
                fileSize: '15.2 MB',
                fileType: 'MP4'
            },
            {
                id: 4,
                title: 'HR Policy Documents',
                type: 'document',
                status: 'uploaded',
                caseId: 'GC-2024-001',
                caseTitle: 'Workplace Harassment Complaint',
                uploadedAt: new Date(Date.now() - 86400000 * 1.5),
                investigator: 'John Smith',
                fileSize: '892 KB',
                fileType: 'PDF'
            },
            {
                id: 5,
                title: 'Accused Party Response',
                type: 'statement',
                status: 'pending',
                caseId: 'GC-2024-001',
                caseTitle: 'Workplace Harassment Complaint',
                uploadedAt: new Date(Date.now() - 86400000 * 0.25),
                investigator: 'John Smith',
                fileSize: '203 KB',
                fileType: 'DOCX'
            },
            {
                id: 6,
                title: 'Incident Location Photos',
                type: 'photo',
                status: 'uploaded',
                caseId: 'GC-2024-001',
                caseTitle: 'Workplace Harassment Complaint',
                uploadedAt: new Date(Date.now() - 86400000 * 0.75),
                investigator: 'John Smith',
                fileSize: '2.1 MB',
                fileType: 'JPG'
            }
        ];

        // Sample cases for filter dropdown
        this.loadSampleCases();
        
        this.updateDisplay();
        this.updateStatistics();
    }

    loadSampleCases() {
        const caseFilter = document.getElementById('case-filter');
        const cases = [
            { id: 'GC-2024-001', title: 'Workplace Harassment Complaint' },
            { id: 'GC-2024-002', title: 'Wage Dispute Case' },
            { id: 'GC-2024-003', title: 'Safety Violation Report' }
        ];

        cases.forEach(caseItem => {
            const option = document.createElement('option');
            option.value = caseItem.id;
            option.textContent = `${caseItem.id} - ${caseItem.title}`;
            caseFilter.appendChild(option);
        });
    }

    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            this.processFile(file);
        });
    }

    processFile(file) {
        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            this.showNotification(`File ${file.name} is too large. Maximum size is 50MB.`, 'error');
            return;
        }

        // Create evidence item
        const evidenceItem = {
            id: Date.now() + Math.random(),
            title: file.name,
            type: this.getFileType(file),
            status: 'pending',
            caseId: this.filters.case || 'Unassigned',
            caseTitle: 'Pending Assignment',
            uploadedAt: new Date(),
            investigator: 'Current User',
            fileSize: this.formatFileSize(file.size),
            fileType: file.name.split('.').pop().toUpperCase(),
            file: file
        };

        // Add to uploaded files list
        this.uploadedFiles.push(evidenceItem);
        
        // Update display
        this.updateUploadList();
        this.updateStatistics();
        
        this.showNotification(`File ${file.name} uploaded successfully`, 'success');
    }

    getFileType(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const typeMap = {
            'pdf': 'document',
            'doc': 'document',
            'docx': 'document',
            'xls': 'document',
            'xlsx': 'document',
            'jpg': 'photo',
            'jpeg': 'photo',
            'png': 'photo',
            'gif': 'photo',
            'mp4': 'video',
            'avi': 'video',
            'mov': 'video',
            'mp3': 'audio',
            'wav': 'audio',
            'm4a': 'audio'
        };
        return typeMap[extension] || 'document';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateDisplay() {
        this.updateEvidenceList();
        this.updateCategoryGrid();
        this.updateTimelineView();
        this.updateRelationshipsView();
    }

    updateUploadList() {
        const uploadList = document.getElementById('upload-list');
        uploadList.innerHTML = '';

        this.uploadedFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'evidence-item';
            
            const statusClass = `status-${file.status}`;
            const statusText = file.status.charAt(0).toUpperCase() + file.status.slice(1);
            
            fileItem.innerHTML = `
                <div class="evidence-icon">
                    <i class="fas fa-${this.getEvidenceIcon(file.type)}"></i>
                </div>
                <div class="evidence-info">
                    <div class="evidence-title">${file.title}</div>
                    <div class="evidence-meta">
                        ${file.fileSize} • ${file.fileType} • ${file.uploadedAt.toLocaleDateString()}
                    </div>
                </div>
                <span class="evidence-status ${statusClass}">${statusText}</span>
                <div class="evidence-actions">
                    <button class="btn btn-success btn-sm" onclick="evidenceCollection.verifyEvidence(${file.id})">
                        <i class="fas fa-check"></i> Verify
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="evidenceCollection.removeEvidence(${file.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;
            
            uploadList.appendChild(fileItem);
        });
    }

    updateEvidenceList() {
        const evidenceList = document.getElementById('evidence-list');
        evidenceList.innerHTML = '';

        // Apply filters
        const filteredEvidence = this.getFilteredEvidence();

        filteredEvidence.forEach(evidence => {
            const evidenceItem = document.createElement('div');
            evidenceItem.className = 'evidence-item';
            
            const statusClass = `status-${evidence.status}`;
            const statusText = evidence.status.charAt(0).toUpperCase() + evidence.status.slice(1);
            
            evidenceItem.innerHTML = `
                <div class="evidence-icon">
                    <i class="fas fa-${this.getEvidenceIcon(evidence.type)}"></i>
                </div>
                <div class="evidence-info">
                    <div class="evidence-title">${evidence.title}</div>
                    <div class="evidence-meta">
                        Case: ${evidence.caseId} • ${evidence.fileSize} • ${evidence.fileType} • ${evidence.uploadedAt.toLocaleDateString()}
                    </div>
                </div>
                <span class="evidence-status ${statusClass}">${statusText}</span>
                <div class="evidence-actions">
                    ${evidence.status === 'pending' ? 
                        `<button class="btn btn-primary btn-sm" onclick="evidenceCollection.assignToCase(${evidence.id})">
                            <i class="fas fa-link"></i> Assign
                        </button>` : ''}
                    ${evidence.status === 'uploaded' ? 
                        `<button class="btn btn-success btn-sm" onclick="evidenceCollection.verifyEvidence(${evidence.id})">
                            <i class="fas fa-check"></i> Verify
                        </button>` : ''}
                    <button class="btn btn-secondary btn-sm" onclick="evidenceCollection.viewEvidence(${evidence.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="evidenceCollection.deleteEvidence(${evidence.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            evidenceList.appendChild(evidenceItem);
        });
    }

    getFilteredEvidence() {
        let filtered = [...this.evidenceItems];

        if (this.filters.case) {
            filtered = filtered.filter(e => e.caseId === this.filters.case);
        }
        if (this.filters.type) {
            filtered = filtered.filter(e => e.type === this.filters.type);
        }
        if (this.filters.status) {
            filtered = filtered.filter(e => e.status === this.filters.status);
        }
        if (this.filters.date) {
            const filterDate = new Date(this.filters.date);
            filtered = filtered.filter(e => {
                const evidenceDate = new Date(e.uploadedAt);
                return evidenceDate.toDateString() === filterDate.toDateString();
            });
        }

        return filtered;
    }

    updateCategoryGrid() {
        const categoryGrid = document.getElementById('category-grid');
        categoryGrid.innerHTML = '';

        const categories = [
            { name: 'Documents', icon: 'file-alt', type: 'document' },
            { name: 'Photos', icon: 'camera', type: 'photo' },
            { name: 'Videos', icon: 'video', type: 'video' },
            { name: 'Audio', icon: 'microphone', type: 'audio' },
            { name: 'Statements', icon: 'comments', type: 'statement' }
        ];

        categories.forEach(category => {
            const count = this.evidenceItems.filter(e => e.type === category.type).length;
            
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            
            categoryCard.innerHTML = `
                <div class="category-header">
                    <i class="fas fa-${category.icon}"></i>
                    <h4>${category.name}</h4>
                    <span class="category-count">${count}</span>
                </div>
                <p>${this.getCategoryDescription(category.type)}</p>
            `;
            
            categoryGrid.appendChild(categoryCard);
        });
    }

    getCategoryDescription(type) {
        const descriptions = {
            'document': 'Policy documents, forms, and official records',
            'photo': 'Photographic evidence and images',
            'video': 'Video recordings and footage',
            'audio': 'Audio recordings and statements',
            'statement': 'Witness and party statements'
        };
        return descriptions[type] || '';
    }

    updateTimelineView() {
        const timelineView = document.getElementById('timeline-view');
        timelineView.innerHTML = '';

        // Sort evidence by date
        const sortedEvidence = [...this.evidenceItems].sort((a, b) => b.uploadedAt - a.uploadedAt);

        sortedEvidence.forEach(evidence => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.style.cssText = `
                border-left: 3px solid #667eea;
                padding-left: 20px;
                margin-bottom: 20px;
                position: relative;
            `;
            
            timelineItem.innerHTML = `
                <div style="position: relative;">
                    <div style="position: absolute; left: -11px; top: 0; width: 19px; height: 19px; border-radius: 50%; background: #667eea;"></div>
                    <h5 style="margin: 0 0 5px 0; color: #333;">${evidence.title}</h5>
                    <p style="margin: 0 0 5px 0; color: #666;">Case: ${evidence.caseId} • Type: ${evidence.type}</p>
                    <small style="color: #999;">${evidence.uploadedAt.toLocaleDateString()}</small>
                </div>
            `;
            
            timelineView.appendChild(timelineItem);
        });
    }

    updateRelationshipsView() {
        const relationshipsView = document.getElementById('relationships-view');
        relationshipsView.innerHTML = '';

        // Group evidence by case
        const caseGroups = {};
        this.evidenceItems.forEach(evidence => {
            if (!caseGroups[evidence.caseId]) {
                caseGroups[evidence.caseId] = [];
            }
            caseGroups[evidence.caseId].push(evidence);
        });

        Object.keys(caseGroups).forEach(caseId => {
            const caseGroup = document.createElement('div');
            caseGroup.style.cssText = `
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 20px;
            `;
            
            const evidence = caseGroups[caseId];
            const caseTitle = evidence[0]?.caseTitle || caseId;
            
            caseGroup.innerHTML = `
                <h4 style="margin: 0 0 15px 0; color: #333;">${caseTitle}</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    ${evidence.map(e => `
                        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                            <strong>${e.title}</strong><br>
                            <small style="color: #666;">${e.type} • ${e.status}</small>
                        </div>
                    `).join('')}
                </div>
            `;
            
            relationshipsView.appendChild(caseGroup);
        });
    }

    updateStatistics() {
        const totalEvidence = this.evidenceItems.length + this.uploadedFiles.length;
        const pendingUpload = this.uploadedFiles.filter(f => f.status === 'pending').length;
        const verifiedEvidence = this.evidenceItems.filter(e => e.status === 'verified').length;
        const rejectedEvidence = this.evidenceItems.filter(e => e.status === 'rejected').length;

        document.getElementById('total-evidence').textContent = totalEvidence;
        document.getElementById('pending-upload').textContent = pendingUpload;
        document.getElementById('verified-evidence').textContent = verifiedEvidence;
        document.getElementById('rejected-evidence').textContent = rejectedEvidence;
    }

    getEvidenceIcon(type) {
        const iconMap = {
            'document': 'file-alt',
            'photo': 'camera',
            'video': 'video',
            'audio': 'microphone',
            'statement': 'comments'
        };
        return iconMap[type] || 'file';
    }

    applyFilters() {
        this.filters.case = document.getElementById('case-filter').value;
        this.filters.type = document.getElementById('type-filter').value;
        this.filters.status = document.getElementById('status-filter').value;
        this.filters.date = document.getElementById('date-filter').value;

        this.updateEvidenceList();
        this.showNotification('Filters applied successfully', 'success');
    }

    clearFilters() {
        document.getElementById('case-filter').value = '';
        document.getElementById('type-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('date-filter').value = '';

        this.filters = {
            case: '',
            type: '',
            status: '',
            date: ''
        };

        this.updateEvidenceList();
        this.showNotification('Filters cleared', 'info');
    }

    verifyEvidence(evidenceId) {
        // Find evidence in uploaded files first
        let evidence = this.uploadedFiles.find(f => f.id === evidenceId);
        if (evidence) {
            evidence.status = 'verified';
            this.updateUploadList();
            this.updateStatistics();
            this.showNotification('Evidence verified successfully', 'success');
            return;
        }

        // Find evidence in main evidence items
        evidence = this.evidenceItems.find(e => e.id === evidenceId);
        if (evidence) {
            evidence.status = 'verified';
            this.updateDisplay();
            this.updateStatistics();
            this.showNotification('Evidence verified successfully', 'success');
        }
    }

    removeEvidence(evidenceId) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== evidenceId);
        this.updateUploadList();
        this.updateStatistics();
        this.showNotification('Evidence removed successfully', 'success');
    }

    assignToCase(evidenceId) {
        const evidence = this.evidenceItems.find(e => e.id === evidenceId);
        if (evidence) {
            // In a real implementation, this would open a case assignment modal
            evidence.status = 'uploaded';
            this.updateDisplay();
            this.updateStatistics();
            this.showNotification('Evidence assigned to case successfully', 'success');
        }
    }

    viewEvidence(evidenceId) {
        const evidence = this.evidenceItems.find(e => e.id === evidenceId);
        if (evidence) {
            alert(`Evidence Details:\n\nTitle: ${evidence.title}\nType: ${evidence.type}\nCase: ${evidence.caseId}\nStatus: ${evidence.status}\nUploaded: ${evidence.uploadedAt.toLocaleDateString()}\nFile Size: ${evidence.fileSize}`);
        }
    }

    deleteEvidence(evidenceId) {
        if (confirm('Are you sure you want to delete this evidence? This action cannot be undone.')) {
            this.evidenceItems = this.evidenceItems.filter(e => e.id !== evidenceId);
            this.updateDisplay();
            this.updateStatistics();
            this.showNotification('Evidence deleted successfully', 'success');
        }
    }

    initializeTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                document.getElementById(`${targetTab}-content`).classList.add('active');
            });
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 500;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Language support
    updateLanguage() {
        const translations = {
            en: {
                'page-title': 'Evidence Collection',
                'page-subtitle': 'Upload, organize, and manage evidence for grievance investigations',
                'filters-title': 'Evidence Filters',
                'case-filter-label': 'Case Number',
                'type-filter-label': 'Evidence Type',
                'status-filter-label': 'Status',
                'date-filter-label': 'Date Range',
                'apply-filters-text': 'Apply Filters',
                'clear-filters-text': 'Clear',
                'upload-title': 'Upload Evidence',
                'upload-text': 'Drag and drop files here or click to browse',
                'browse-text': 'Browse Files',
                'evidence-list-title': 'Evidence List',
                'organization-title': 'Evidence Organization',
                'categories-tab': 'Categories',
                'timeline-tab': 'Timeline',
                'relationships-tab': 'Relationships',
                'total-evidence-label': 'Total Evidence',
                'pending-upload-label': 'Pending Upload',
                'verified-evidence-label': 'Verified Evidence',
                'rejected-evidence-label': 'Rejected Evidence',
                'lang-text': 'English'
            },
            km: {
                'page-title': 'ការប្រមូលភស្តុតាង',
                'page-subtitle': 'ផ្ទុកឡើង រៀបចំ និងគ្រប់គ្រងភស្តុតាងសម្រាប់ការស៊ើបអង្កេតពាក្យបណ្តឹង',
                'filters-title': 'តម្រងភស្តុតាង',
                'case-filter-label': 'លេខករណី',
                'type-filter-label': 'ប្រភេទភស្តុតាង',
                'status-filter-label': 'ស្ថានភាព',
                'date-filter-label': 'ចន្លោះកាលបរិច្ឆេទ',
                'apply-filters-text': 'អនុវត្តតម្រង',
                'clear-filters-text': 'សម្អាត',
                'upload-title': 'ផ្ទុកឡើងភស្តុតាង',
                'upload-text': 'ទាញ និងទម្លាក់ឯកសារនៅទីនេះ ឬចុចដើម្បីរុករក',
                'browse-text': 'រុករកឯកសារ',
                'evidence-list-title': 'បញ្ជីភស្តុតាង',
                'organization-title': 'ការរៀបចំភស្តុតាង',
                'categories-tab': 'ប្រភេទ',
                'timeline-tab': 'ពេលវេលា',
                'relationships-tab': 'ទំនាក់ទំនង',
                'total-evidence-label': 'ភស្តុតាងសរុប',
                'pending-upload-label': 'កំពុងផ្ទុកឡើង',
                'verified-evidence-label': 'ភស្តុតាងដែលបានផ្ទៀងផ្ទាត់',
                'rejected-evidence-label': 'ភស្តុតាងដែលបានបដិសេធ',
                'lang-text': 'ខ្មែរ'
            }
        };

        const currentTranslations = translations[this.currentLanguage];
        Object.keys(currentTranslations).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = currentTranslations[key];
            }
        });
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'km' : 'en';
        this.updateLanguage();
    }
}

// Initialize the system when the page loads
let evidenceCollection;

document.addEventListener('DOMContentLoaded', () => {
    evidenceCollection = new EvidenceCollection();
});

// Global functions for HTML onclick handlers
window.evidenceCollection = null;

window.toggleLanguage = function() {
    if (evidenceCollection) {
        evidenceCollection.toggleLanguage();
    }
};

// Make functions globally accessible
window.verifyEvidence = function(id) {
    if (evidenceCollection) {
        evidenceCollection.verifyEvidence(id);
    }
};

window.removeEvidence = function(id) {
    if (evidenceCollection) {
        evidenceCollection.removeEvidence(id);
    }
};

window.assignToCase = function(id) {
    if (evidenceCollection) {
        evidenceCollection.assignToCase(id);
    }
};

window.viewEvidence = function(id) {
    if (evidenceCollection) {
        evidenceCollection.viewEvidence(id);
    }
};

window.deleteEvidence = function(id) {
    if (evidenceCollection) {
        evidenceCollection.deleteEvidence(id);
    }
};
