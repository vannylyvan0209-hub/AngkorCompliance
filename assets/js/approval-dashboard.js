// Document Approval Dashboard - Enhanced Approval Workflow System
let currentUser = null;
let allDocuments = [];
let filteredDocuments = [];
let factories = [];
let realTimeListeners = [];
let currentDocument = null;

// Wait for Firebase to be available before initializing
function initializeApprovaldashboard() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeApprovaldashboard, 100);
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

document.addEventListener('DOMContentLoaded', async function() {
    console.log('📋 Document Approval Dashboard loading...');
    
    // Check authentication and permissions
    await checkAuthentication();
    
    // Initialize approval dashboard
    await initializeApprovalDashboard();
    
    console.log('✅ Document Approval Dashboard ready');
    
    // Add debug function to global scope
    window.testApprovalDashboard = function() {
        console.log('🧪 Testing Approval Dashboard...');
        console.log('📊 Current state:');
        console.log('- All documents:', allDocuments.length);
        console.log('- Filtered documents:', filteredDocuments.length);
        console.log('- Current user:', currentUser);
        
        // Test sample data loading
        if (allDocuments.length === 0) {
            console.log('📋 Loading sample documents...');
            loadSampleDocuments();
            loadApprovalStats();
            updateApprovalList();
        }
        
        console.log('✅ Approval Dashboard test completed');
    };
});

// Authentication Check
async function checkAuthentication() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(async function(user) {
            if (!user) {
                console.log('❌ No authenticated user, redirecting to login');
                window.location.href = 'login.html';
                return;
            }
            
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (!userDoc.exists()) {
                    console.log('❌ No user profile found, redirecting to login');
                    window.location.href = 'login.html';
                    return;
                }
                
                const userData = userDoc.data();
                
                // Only super_admin and factory_admin can access approval dashboard
                if (!['super_admin', 'factory_admin'].includes(userData.role)) {
                    console.log('⚠️ Access denied - insufficient permissions for approval dashboard');
                    window.location.href = 'dashboard.html';
                    return;
                }
                
                currentUser = {
                    id: user.uid,
                    ...userData
                };
                
                console.log('✅ Approval access granted for:', userData.role);
                
                // Update user avatar
                updateUserAvatar(userData);
                
                resolve();
                
            } catch (error) {
                console.error('❌ Error checking authentication:', error);
                reject(error);
            }
        });
    });
}

// Initialize Approval Dashboard
async function initializeApprovalDashboard() {
    try {
        console.log('📋 Initializing approval dashboard...');
        
        // Load all required data
        await Promise.all([
            loadFactories(),
            loadDocuments(),
            loadApprovalStats()
        ]);
        
        // Setup real-time listeners
        setupRealTimeListeners();
        
        // Initialize UI
        updateApprovalList();
        populateFactoryFilter();
        
        console.log('✅ Approval dashboard initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing approval dashboard:', error);
        showError('Failed to load approval dashboard: ' + error.message);
    }
}

// Load Factories
async function loadFactories() {
    try {
        console.log('🏭 Loading factories...');
        
        const factoriesRef = collection(db, 'factories');
        const snapshot = await getDocs(factoriesRef);
        factories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log('✅ Factories loaded:', factories.length);
        
    } catch (error) {
        console.error('❌ Error loading factories:', error);
        factories = [];
        // Load sample factories if Firebase fails
        loadSampleFactories();
    }
}

// Load Documents with Approval Status
async function loadDocuments() {
    try {
        console.log('📄 Loading documents for approval...');
        
        // Set a timeout to prevent infinite loading
        const loadingTimeout = setTimeout(() => {
            console.log('⏰ Loading timeout reached, using sample data');
            loadSampleDocuments();
        }, 10000); // 10 seconds timeout
        
        const documentsRef = collection(db, 'documents');
        let q;
        
        try {
            q = query(documentsRef, orderBy('uploadedAt', 'desc'));
        } catch (error) {
            console.log('⚠️ Cannot order by uploadedAt, using simple query');
            q = query(documentsRef);
        }
        
        const snapshot = await getDocs(q);
        
        allDocuments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Ensure approval status exists
                approvalStatus: data.approvalStatus || 'draft',
                approvalHistory: data.approvalHistory || [],
                submittedForApproval: data.submittedForApproval || false,
                submittedAt: data.submittedAt || null,
                approvedBy: data.approvedBy || null,
                approvedAt: data.approvedAt || null,
                rejectedBy: data.rejectedBy || null,
                rejectedAt: data.rejectedAt || null,
                approvalComments: data.approvalComments || ''
            };
        });
        
        filteredDocuments = [...allDocuments];
        
        console.log('✅ Documents loaded:', allDocuments.length);
        
        // Clear the timeout since we loaded successfully
        clearTimeout(loadingTimeout);
        
    } catch (error) {
        console.error('❌ Error loading documents:', error);
        console.log('⚠️ Using sample documents due to Firebase error');
        clearTimeout(loadingTimeout);
        loadSampleDocuments();
    }
}

// Load Sample Documents for Demonstration
function loadSampleDocuments() {
    console.log('📋 Loading sample documents for approval demonstration...');
    
    // Sample documents with approval status
    allDocuments = [
        {
            id: 'doc-001',
            title: 'Business License 2024',
            originalName: 'business_license_2024.pdf',
            category: 'business-license',
            approvalStatus: 'pending',
            submittedForApproval: true,
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            factoryId: 'factory-001',
            fileSize: 245760,
            fileType: 'application/pdf',
            approvalComments: 'Pending review by compliance team'
        },
        {
            id: 'doc-002',
            title: 'Safety Certificate',
            originalName: 'safety_certificate.pdf',
            category: 'safety-certificate',
            approvalStatus: 'approved',
            submittedForApproval: true,
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            approvedBy: 'admin@example.com',
            approvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            factoryId: 'factory-002',
            fileSize: 512000,
            fileType: 'application/pdf',
            approvalComments: 'All safety requirements met'
        },
        {
            id: 'doc-003',
            title: 'Environmental Permit',
            originalName: 'environmental_permit.pdf',
            category: 'environmental-permit',
            approvalStatus: 'rejected',
            submittedForApproval: true,
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            rejectedBy: 'admin@example.com',
            rejectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            factoryId: 'factory-001',
            fileSize: 1024000,
            fileType: 'application/pdf',
            approvalComments: 'Missing required environmental impact assessment'
        },
        {
            id: 'doc-004',
            title: 'Quality Control Procedures',
            originalName: 'quality_control.pdf',
            category: 'quality-certificate',
            approvalStatus: 'draft',
            submittedForApproval: false,
            uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            factoryId: 'factory-003',
            fileSize: 768000,
            fileType: 'application/pdf',
            approvalComments: 'Draft document - not yet submitted for approval'
        }
    ];
    
    filteredDocuments = [...allDocuments];
    
    console.log('✅ Sample documents loaded:', allDocuments.length);
}

// Load Sample Factories for Demonstration
function loadSampleFactories() {
    console.log('🏭 Loading sample factories for demonstration...');
    
    // Sample factories data
    factories = [
        {
            id: 'factory-001',
            name: 'Angkor Textile Factory',
            location: 'Phnom Penh',
            industry: 'Textile'
        },
        {
            id: 'factory-002',
            name: 'Siem Reap Garment Co.',
            location: 'Siem Reap',
            industry: 'Garment'
        },
        {
            id: 'factory-003',
            name: 'Battambang Manufacturing',
            location: 'Battambang',
            industry: 'Manufacturing'
        }
    ];
    
    console.log('✅ Sample factories loaded:', factories.length);
}

// Load Approval Statistics
async function loadApprovalStats() {
    try {
        console.log('📊 Loading approval statistics...');
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Count by status
        const pendingCount = allDocuments.filter(doc => doc.approvalStatus === 'pending').length;
        const approvedToday = allDocuments.filter(doc => {
            if (doc.approvalStatus !== 'approved' || !doc.approvedAt) return false;
            const approvedDate = doc.approvedAt.toDate ? doc.approvedAt.toDate() : new Date(doc.approvedAt);
            return approvedDate >= today;
        }).length;
        const rejectedToday = allDocuments.filter(doc => {
            if (doc.approvalStatus !== 'rejected' || !doc.rejectedAt) return false;
            const rejectedDate = doc.rejectedAt.toDate ? doc.rejectedAt.toDate() : new Date(doc.rejectedAt);
            return rejectedDate >= today;
        }).length;
        const draftCount = allDocuments.filter(doc => doc.approvalStatus === 'draft').length;
        
        // Calculate additional statistics
        const totalReviewed = allDocuments.filter(doc => 
            doc.approvalStatus === 'approved' || doc.approvalStatus === 'rejected'
        ).length;
        
        const totalApproved = allDocuments.filter(doc => doc.approvalStatus === 'approved').length;
        const approvalRate = totalReviewed > 0 ? Math.round((totalApproved / totalReviewed) * 100) : 0;
        
        // Calculate average review time (simplified - using 24 hours as default)
        const avgReviewTime = '24h';
        
        // Update statistics display
        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('approvedCount').textContent = approvedToday;
        document.getElementById('rejectedCount').textContent = rejectedToday;
        document.getElementById('draftCount').textContent = draftCount;
        document.getElementById('totalReviewed').textContent = totalReviewed;
        document.getElementById('approvalRate').textContent = approvalRate + '%';
        document.getElementById('avgReviewTime').textContent = avgReviewTime;
        
        console.log('✅ Approval statistics loaded');
        
    } catch (error) {
        console.error('❌ Error loading approval statistics:', error);
    }
}

// Setup Real-time Listeners
function setupRealTimeListeners() {
    try {
        console.log('👂 Setting up real-time listeners...');
        
        // Listen for document changes
        const documentsRef = collection(db, 'documents');
        let q;
        
        try {
            q = query(documentsRef, orderBy('uploadedAt', 'desc'));
        } catch (error) {
            console.log('⚠️ Cannot order by uploadedAt, using simple query');
            q = query(documentsRef);
        }
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        handleDocumentAdded(change.doc);
                    } else if (change.type === 'modified') {
                        handleDocumentModified(change.doc);
                    } else if (change.type === 'removed') {
                        handleDocumentRemoved(change.doc.id);
                    }
                });
            });
        
        realTimeListeners.push(unsubscribe);
        
        console.log('✅ Real-time listeners set up');
        
    } catch (error) {
        console.error('❌ Error setting up real-time listeners:', error);
    }
}

// Handle Document Added
function handleDocumentAdded(doc) {
    const data = doc.data();
    const newDoc = {
        id: doc.id,
        ...data,
        approvalStatus: data.approvalStatus || 'draft',
        approvalHistory: data.approvalHistory || [],
        submittedForApproval: data.submittedForApproval || false,
        submittedAt: data.submittedAt || null,
        approvedBy: data.approvedBy || null,
        approvedAt: data.approvedAt || null,
        rejectedBy: data.rejectedBy || null,
        rejectedAt: data.rejectedAt || null,
        approvalComments: data.approvalComments || ''
    };
    
    // Add to allDocuments if not already present
    if (!allDocuments.find(d => d.id === doc.id)) {
        allDocuments.unshift(newDoc);
        applyFilters();
    }
}

// Handle Document Modified
function handleDocumentModified(doc) {
    const data = doc.data();
    const updatedDoc = {
        id: doc.id,
        ...data,
        approvalStatus: data.approvalStatus || 'draft',
        approvalHistory: data.approvalHistory || [],
        submittedForApproval: data.submittedForApproval || false,
        submittedAt: data.submittedAt || null,
        approvedBy: data.approvedBy || null,
        approvedAt: data.approvedAt || null,
        rejectedBy: data.rejectedBy || null,
        rejectedAt: data.rejectedAt || null,
        approvalComments: data.approvalComments || ''
    };
    
    // Update in allDocuments
    const index = allDocuments.findIndex(d => d.id === doc.id);
    if (index !== -1) {
        allDocuments[index] = updatedDoc;
        applyFilters();
    }
}

// Handle Document Removed
function handleDocumentRemoved(docId) {
    // Remove from allDocuments
    allDocuments = allDocuments.filter(d => d.id !== docId);
    applyFilters();
    loadApprovalStats();
}

// Apply Filters
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const factoryFilter = document.getElementById('factoryFilter')?.value || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const dateFilter = document.getElementById('dateFilter')?.value || '';
    
    filteredDocuments = allDocuments.filter(doc => {
        // Status filter
        const statusMatch = !statusFilter || doc.approvalStatus === statusFilter;
        
        // Factory filter
        const factoryMatch = !factoryFilter || doc.factoryId === factoryFilter;
        
        // Category filter
        const categoryMatch = !categoryFilter || doc.category === categoryFilter;
        
        // Date filter
        let dateMatch = true;
        if (dateFilter) {
            const now = new Date();
            let docDate = doc.uploadedAt;
            
            // Handle Firestore Timestamp objects
            if (docDate && typeof docDate.toDate === 'function') {
                docDate = docDate.toDate();
            } else if (typeof docDate === 'string') {
                docDate = new Date(docDate);
            } else if (typeof docDate === 'number') {
                docDate = new Date(docDate);
            }
            
            if ((docDate instanceof Date) && !isNaN(docDate.getTime())) {
                if (dateFilter === 'today') {
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    dateMatch = docDate >= today;
                } else if (dateFilter === 'week') {
                    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                    dateMatch = docDate >= weekAgo;
                } else if (dateFilter === 'month') {
                    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    dateMatch = docDate >= monthAgo;
                }
            } else {
                dateMatch = false;
            }
        }
        
        return statusMatch && factoryMatch && categoryMatch && dateMatch;
    });
    
    updateApprovalList();
    loadApprovalStats();
}

// Update Approval List
function updateApprovalList() {
    const container = document.getElementById('approvalList');
    if (!container) return;
    
    if (filteredDocuments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i data-lucide="check-circle"></i>
                </div>
                <h3>No documents found</h3>
                <p>No documents match your current filters. Try adjusting your search criteria.</p>
            </div>
        `;
        return;
    }
    
    const approvalItemsHTML = filteredDocuments.map(doc => createApprovalItem(doc)).join('');
    container.innerHTML = approvalItemsHTML;
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Create Approval Item
function createApprovalItem(doc) {
    const statusClass = `status-${doc.approvalStatus}`;
    const statusText = getStatusText(doc.approvalStatus);
    const factoryName = getFactoryName(doc.factoryId);
    const uploadedDate = formatDate(doc.uploadedAt);
    
    let actionButtons = '';
    
    if (doc.approvalStatus === 'pending') {
        actionButtons = `
            <button class="btn-view" onclick="viewDocument('${doc.id}')">
                <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
                View
            </button>
            <button class="btn-approve" onclick="openApprovalModal('${doc.id}', 'approve')">
                <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                Approve
            </button>
            <button class="btn-reject" onclick="openApprovalModal('${doc.id}', 'reject')">
                <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                Reject
            </button>
        `;
    } else if (doc.approvalStatus === 'draft') {
        actionButtons = `
            <button class="btn-view" onclick="viewDocument('${doc.id}')">
                <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
                View
            </button>
        `;
    } else {
        actionButtons = `
            <button class="btn-view" onclick="viewDocument('${doc.id}')">
                <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
                View
            </button>
        `;
    }
    
    return `
        <div class="approval-item">
            <div class="document-info">
                <div class="document-icon">
                    ${getDocumentIcon(doc.fileType)}
                </div>
                <div class="document-details">
                    <div class="document-title">${doc.title || doc.originalName || 'Untitled Document'}</div>
                    <div class="document-meta">
                        <span>${factoryName}</span>
                        <span>${doc.category || 'Uncategorized'}</span>
                        <span>Uploaded ${uploadedDate}</span>
                    </div>
                </div>
            </div>
            
            <div class="approval-status ${statusClass}">
                <i data-lucide="${getStatusIcon(doc.approvalStatus)}" style="width: 14px; height: 14px;"></i>
                ${statusText}
            </div>
            
            <div class="approval-actions">
                ${actionButtons}
            </div>
        </div>
    `;
}

// Get Status Text
function getStatusText(status) {
    const statusTexts = {
        'draft': 'Draft',
        'pending': 'Pending Approval',
        'approved': 'Approved',
        'rejected': 'Rejected'
    };
    return statusTexts[status] || 'Unknown';
}

// Get Status Icon
function getStatusIcon(status) {
    const statusIcons = {
        'draft': 'edit',
        'pending': 'clock',
        'approved': 'check-circle',
        'rejected': 'x-circle'
    };
    return statusIcons[status] || 'help-circle';
}

// Get Document Icon
function getDocumentIcon(fileType) {
    if (!fileType) return '<i data-lucide="file"></i>';
    
    const iconMap = {
        'pdf': 'file-text',
        'doc': 'file-text',
        'docx': 'file-text',
        'xls': 'file-spreadsheet',
        'xlsx': 'file-spreadsheet',
        'ppt': 'file-presentation',
        'pptx': 'file-presentation',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'gif': 'image'
    };
    
    const extension = fileType.toLowerCase().split('.').pop();
    const icon = iconMap[extension] || 'file';
    
    return `<i data-lucide="${icon}"></i>`;
}

// Get Factory Name
function getFactoryName(factoryId) {
    if (!factoryId) return 'No Factory';
    const factory = factories.find(f => f.id === factoryId);
    return factory ? factory.name : 'Unknown Factory';
}

// Format Date
function formatDate(date) {
    if (!date) return 'Unknown date';
    
    if (date && typeof date.toDate === 'function') {
        date = date.toDate();
    } else if (typeof date === 'string') {
        date = new Date(date);
    } else if (typeof date === 'number') {
        date = new Date(date);
    }
    
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid date';
    }
    
    return moment(date).fromNow();
}

// Populate Factory Filter
function populateFactoryFilter() {
    const factoryFilter = document.getElementById('factoryFilter');
    if (!factoryFilter) return;
    
    const options = factories.map(factory => 
        `<option value="${factory.id}">${factory.name}</option>`
    ).join('');
    
    factoryFilter.innerHTML = '<option value="">All Factories</option>' + options;
}

// Open Approval Modal
function openApprovalModal(docId, action) {
    const doc = allDocuments.find(d => d.id === docId);
    if (!doc) return;
    
    currentDocument = doc;
    
    const modal = document.getElementById('approvalModal');
    const modalTitle = document.getElementById('modalTitle');
    const documentInfo = document.getElementById('documentInfo');
    
    modalTitle.textContent = action === 'approve' ? 'Approve Document' : 'Reject Document';
    
    // Populate document info
    documentInfo.innerHTML = `
        <div style="background: var(--neutral-50); padding: var(--space-4); border-radius: var(--radius-md);">
            <h4 style="margin: 0 0 var(--space-2) 0; color: var(--neutral-900);">${doc.title || doc.originalName || 'Untitled Document'}</h4>
            <div style="display: flex; gap: var(--space-4); font-size: var(--text-sm); color: var(--neutral-600);">
                <span><strong>Factory:</strong> ${getFactoryName(doc.factoryId)}</span>
                <span><strong>Category:</strong> ${doc.category || 'Uncategorized'}</span>
                <span><strong>Uploaded:</strong> ${formatDate(doc.uploadedAt)}</span>
            </div>
            ${doc.description ? `<p style="margin: var(--space-2) 0 0 0; color: var(--neutral-700);">${doc.description}</p>` : ''}
        </div>
    `;
    
    // Clear previous comments
    document.getElementById('approvalComments').value = '';
    
    // Show modal
    modal.classList.add('open');
}

// Close Approval Modal
function closeApprovalModal() {
    const modal = document.getElementById('approvalModal');
    modal.classList.remove('open');
    currentDocument = null;
}

// Approve Document
async function approveDocument() {
    if (!currentDocument) return;
    
    try {
        const comments = document.getElementById('approvalComments').value.trim();
        
        const approvalData = {
            approvalStatus: 'approved',
            approvedBy: currentUser.id,
            approvedAt: new Date(),
            approvalComments: comments,
            submittedForApproval: false
        };
        
        // Add to approval history
        const approvalHistory = currentDocument.approvalHistory || [];
        approvalHistory.push({
            action: 'approved',
            by: currentUser.id,
            at: new Date(),
            comments: comments
        });
        approvalData.approvalHistory = approvalHistory;
        
        // Update document
        const docRef = doc(db, 'documents', currentDocument.id);
        await updateDoc(docRef, approvalData);
        
        // Log audit entry
        await logAuditEntry('document_approved', {
            documentId: currentDocument.id,
            documentTitle: currentDocument.title || currentDocument.originalName,
            comments: comments
        });
        
        closeApprovalModal();
        showSuccess('Document approved successfully');
        
    } catch (error) {
        console.error('❌ Error approving document:', error);
        showError('Failed to approve document: ' + error.message);
    }
}

// Reject Document
async function rejectDocument() {
    if (!currentDocument) return;
    
    try {
        const comments = document.getElementById('approvalComments').value.trim();
        
        if (!comments) {
            showError('Please provide a reason for rejection');
            return;
        }
        
        const approvalData = {
            approvalStatus: 'rejected',
            rejectedBy: currentUser.id,
            rejectedAt: new Date(),
            approvalComments: comments,
            submittedForApproval: false
        };
        
        // Add to approval history
        const approvalHistory = currentDocument.approvalHistory || [];
        approvalHistory.push({
            action: 'rejected',
            by: currentUser.id,
            at: new Date(),
            comments: comments
        });
        approvalData.approvalHistory = approvalHistory;
        
        // Update document
        const docRef = doc(db, 'documents', currentDocument.id);
        await updateDoc(docRef, approvalData);
        
        // Log audit entry
        await logAuditEntry('document_rejected', {
            documentId: currentDocument.id,
            documentTitle: currentDocument.title || currentDocument.originalName,
            comments: comments
        });
        
        closeApprovalModal();
        showSuccess('Document rejected successfully');
        
    } catch (error) {
        console.error('❌ Error rejecting document:', error);
        showError('Failed to reject document: ' + error.message);
    }
}

// View Document
function viewDocument(docId) {
    // Open document in new tab or modal
    window.open(`documents.html?view=${docId}`, '_blank');
}

// Log Audit Entry
async function logAuditEntry(action, details) {
    try {
        const auditRef = collection(db, 'audit_log');
        await addDoc(auditRef, {
            action: action,
            userId: currentUser.id,
            userEmail: currentUser.email,
            userRole: currentUser.role,
            details: details,
            timestamp: new Date(),
            ipAddress: 'web-client'
        });
    } catch (error) {
        console.error('❌ Error logging audit entry:', error);
    }
}

// Update User Avatar
function updateUserAvatar(userData) {
    const avatar = document.getElementById('userAvatar');
    if (avatar) {
        const initials = getUserInitials(userData);
        avatar.textContent = initials;
    }
}

// Get User Initials
function getUserInitials(user) {
    const name = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (!name) return user.email ? user.email[0].toUpperCase() : '?';
    
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Mobile Menu Functions
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
    }
}

function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    }
}

// Utility Functions
function showSuccess(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-600);
        color: white;
        padding: var(--space-4) var(--space-6);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        font-weight: 500;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showError(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--danger-600);
        color: white;
        padding: var(--space-4) var(--space-6);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        font-weight: 500;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Logout Function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('🚪 Logging out...');
        
        // Clean up real-time listeners
        realTimeListeners.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        
        // Sign out from Firebase
        auth.signOut().then(() => {
            localStorage.clear();
            sessionStorage.clear();
            console.log('✅ Logout successful');
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('❌ Logout error:', error);
            window.location.href = 'login.html';
        });
    }
}

// Export Approval Data
function exportApprovalData() {
    try {
        console.log('📊 Exporting approval data...');
        
        const exportData = {
            timestamp: new Date().toISOString(),
            statistics: {
                pending: allDocuments.filter(doc => doc.approvalStatus === 'pending').length,
                approvedToday: allDocuments.filter(doc => {
                    if (doc.approvalStatus !== 'approved' || !doc.approvedAt) return false;
                    const approvedDate = doc.approvedAt.toDate ? doc.approvedAt.toDate() : new Date(doc.approvedAt);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return approvedDate >= today;
                }).length,
                rejectedToday: allDocuments.filter(doc => {
                    if (doc.approvalStatus !== 'rejected' || !doc.rejectedAt) return false;
                    const rejectedDate = doc.rejectedAt.toDate ? doc.rejectedAt.toDate() : new Date(doc.rejectedAt);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return rejectedDate >= today;
                }).length,
                draft: allDocuments.filter(doc => doc.approvalStatus === 'draft').length,
                totalReviewed: allDocuments.filter(doc => 
                    doc.approvalStatus === 'approved' || doc.approvalStatus === 'rejected'
                ).length
            },
            documents: allDocuments.map(doc => ({
                id: doc.id,
                title: doc.title || doc.originalName,
                status: doc.approvalStatus,
                submittedAt: doc.submittedAt,
                approvedAt: doc.approvedAt,
                rejectedAt: doc.rejectedAt,
                approvedBy: doc.approvedBy,
                rejectedBy: doc.rejectedBy,
                comments: doc.approvalComments
            }))
        };
        
        // Create and download CSV
        const csvContent = convertToCSV(exportData.documents);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `approval-data-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('Approval data exported successfully!');
        console.log('✅ Approval data exported');
        
    } catch (error) {
        console.error('❌ Error exporting approval data:', error);
        showError('Failed to export approval data');
    }
}

// Refresh Approval Data
function refreshApprovalData() {
    try {
        console.log('🔄 Refreshing approval data...');
        
        // Reload documents
        loadDocuments();
        
        // Reload statistics
        loadApprovalStats();
        
        showSuccess('Approval data refreshed successfully!');
        console.log('✅ Approval data refreshed');
        
    } catch (error) {
        console.error('❌ Error refreshing approval data:', error);
        showError('Failed to refresh approval data');
    }
}

// Convert data to CSV format
function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

// Global functions for HTML onclick handlers
window.applyFilters = applyFilters;
window.openApprovalModal = openApprovalModal;
window.closeApprovalModal = closeApprovalModal;
window.approveDocument = approveDocument;
window.rejectDocument = rejectDocument;
window.viewDocument = viewDocument;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.logout = logout;
window.exportApprovalData = exportApprovalData;
window.refreshApprovalData = refreshApprovalData;

}

// Start the initialization process
initializeApprovaldashboard();
