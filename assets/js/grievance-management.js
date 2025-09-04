// Comprehensive Grievance Management System
let grievances = [];
let filteredGrievances = [];
let factories = [];
let currentPage = 1;
let pageSize = 25;
let totalPages = 1;
let selectedGrievances = [];
let editingGrievanceId = null;
let searchTimeout = null;
let auth, db, doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, serverTimestamp, getDocs;

// Initialize Firebase
async function initializeFirebase() {
    try {
        if (window.Firebase) {
            auth = window.Firebase.auth;
            db = window.Firebase.db;
            doc = window.Firebase.doc;
            getDoc = window.Firebase.getDoc;
            collection = window.Firebase.collection;
            query = window.Firebase.query;
            where = window.Firebase.where;
            orderBy = window.Firebase.orderBy;
            onSnapshot = window.Firebase.onSnapshot;
            addDoc = window.Firebase.addDoc;
            updateDoc = window.Firebase.updateDoc;
            serverTimestamp = window.Firebase.serverTimestamp;
            getDocs = window.Firebase.getDocs;
            console.log('✅ Firebase instances and functions loaded successfully');
            return true;
        } else {
            console.log('⚠️ Firebase not available, using local mode');
            return false;
        }
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('⚠️ Grievance Management system initializing...');
    
    const firebaseReady = await initializeFirebase();
    if (!firebaseReady) {
        console.log('⚠️ Firebase not ready, loading sample data');
        loadSampleGrievances();
        return;
    }
    
    // Check authentication and permissions
    await checkAuthentication();
    
    // Initialize all components
    await Promise.all([
        loadFactories(),
        loadGrievances(),
        loadGrievanceStatistics(),
        setupEventListeners()
    ]);
    
    console.log('✅ Grievance Management system ready');
    
    // Add debug function to global scope
    window.testGrievanceManagement = function() {
        console.log('🧪 Testing Grievance Management...');
        console.log('📊 Current state:');
        console.log('- All grievances:', grievances.length);
        console.log('- Filtered grievances:', filteredGrievances.length);
        console.log('- Factories:', factories.length);
        
        // Test sample data loading
        if (grievances.length === 0) {
            console.log('📋 Loading sample grievances...');
            loadSampleGrievances();
            loadGrievanceStatistics();
            updateGrievancesDisplay();
        }
        
        console.log('✅ Grievance Management test completed');
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
                
                if (userData.role !== 'super_admin') {
                    console.log('⚠️ Access denied - insufficient permissions');
                    window.location.href = 'dashboard.html';
                    return;
                }
                
                console.log('✅ Super Admin access granted for Grievance Management');
                resolve();
                
            } catch (error) {
                console.error('❌ Error checking authentication:', error);
                reject(error);
            }
        });
    });
}

// Load Factories for dropdowns
async function loadFactories() {
    try {
        console.log('🏭 Loading factories for grievance management...');
        
        const factoriesRef = collection(db, 'factories');
        const factoriesQuery = query(factoriesRef, orderBy('name'));
        const snapshot = await getDocs(factoriesQuery);
        
        factories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Update factory dropdown
        updateFactoryDropdown();
        
        console.log(`✅ Loaded ${factories.length} factories`);
        
    } catch (error) {
        console.error('❌ Error loading factories:', error);
        factories = [];
        // Load sample factories if Firebase fails
        loadSampleFactories();
    }
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
    updateFactoryDropdown();
}

function updateFactoryDropdown() {
    const factorySelect = document.getElementById('factoryId');
    if (!factorySelect) return;
    
    // Clear existing options (except first one)
    const firstOption = factorySelect.firstElementChild;
    factorySelect.innerHTML = '';
    factorySelect.appendChild(firstOption);
    
    // Add factory options
    factories.forEach(factory => {
        const option = document.createElement('option');
        option.value = factory.id;
        option.textContent = factory.name || `Factory ${factory.id}`;
        factorySelect.appendChild(option);
    });
}

// Load Grievances with real-time updates
async function loadGrievances() {
    try {
        console.log('⚠️ Loading grievances...');
        showTableLoading(true);
        
        // Set a timeout to prevent infinite loading
        const loadingTimeout = setTimeout(() => {
            console.log('⏰ Loading timeout reached, using sample data');
            showTableLoading(false);
            loadSampleGrievances();
        }, 10000); // 10 seconds timeout
        
        // Set up real-time listener for grievances
        const grievancesRef = collection(db, 'grievances');
        let q;
        try {
            q = query(grievancesRef, orderBy('submittedAt', 'desc'));
        } catch (error) {
            console.log('⚠️ Cannot order by submittedAt, using simple query');
            q = query(grievancesRef);
        }
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            try {
            grievances = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`📊 Grievances updated: ${grievances.length} total`);
            
            // Apply current filters
            applyFilters();
            
            // Update statistics
            updateGrievanceStatistics();
            
            showTableLoading(false);
                clearTimeout(loadingTimeout);
            } catch (error) {
                console.error('❌ Error processing grievances data:', error);
                showTableLoading(false);
                clearTimeout(loadingTimeout);
                console.log('⚠️ Using sample grievances due to Firebase error');
                loadSampleGrievances();
            }
        }, (error) => {
            console.error('❌ Error loading grievances:', error);
            showTableLoading(false);
            clearTimeout(loadingTimeout);
            console.log('⚠️ Using sample grievances due to Firebase error');
            loadSampleGrievances();
        });
        
        // Store unsubscribe function for cleanup
        window.grievancesUnsubscribe = unsubscribe;
        
    } catch (error) {
        console.error('❌ Error setting up grievances listener:', error);
        showTableLoading(false);
        clearTimeout(loadingTimeout);
        console.log('⚠️ Using sample grievances due to setup error');
        loadSampleGrievances();
    }
}

// Load Sample Grievances for Demonstration
function loadSampleGrievances() {
    console.log('📋 Loading sample grievances for demonstration...');
    
    // Sample grievances data
    grievances = [
        {
            id: 'grievance-001',
            title: 'Safety Equipment Issue',
            description: 'Workers reporting inadequate safety equipment in production area',
            category: 'safety',
            priority: 'high',
            status: 'investigating',
            reporterName: 'Sok Dara',
            reporterEmail: 'sok.dara@factory.com',
            factoryId: 'factory-001',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            assignedTo: 'admin@example.com',
            investigationNotes: 'Safety audit scheduled for next week'
        },
        {
            id: 'grievance-002',
            title: 'Overtime Pay Dispute',
            description: 'Employees not receiving correct overtime compensation',
            category: 'payroll',
            priority: 'medium',
            status: 'new',
            reporterName: 'Chan Vuthy',
            reporterEmail: 'chan.vuthy@factory.com',
            factoryId: 'factory-002',
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            assignedTo: null
        },
        {
            id: 'grievance-003',
            title: 'Workplace Harassment',
            description: 'Allegations of verbal harassment by supervisor',
            category: 'harassment',
            priority: 'high',
            status: 'escalated',
            reporterName: 'Kim Sopheak',
            reporterEmail: 'kim.sopheak@factory.com',
            factoryId: 'factory-001',
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            assignedTo: 'hr@example.com',
            investigationNotes: 'HR investigation in progress'
        },
        {
            id: 'grievance-004',
            title: 'Poor Working Conditions',
            description: 'Ventilation issues in packaging department',
            category: 'working-conditions',
            priority: 'medium',
            status: 'resolved',
            reporterName: 'Ly Srey',
            reporterEmail: 'ly.srey@factory.com',
            factoryId: 'factory-003',
            submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            assignedTo: 'admin@example.com',
            resolution: 'Ventilation system upgraded and working properly'
        }
    ];
    
    filteredGrievances = [...grievances];
    
    console.log('✅ Sample grievances loaded:', grievances.length);
    updateGrievancesDisplay();
    updateGrievanceStatistics();
}

// Update Grievances Display
function updateGrievancesDisplay() {
    const container = document.getElementById('grievancesTableBody');
    if (!container) return;
    
    if (filteredGrievances.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-8 text-neutral-500">
                    <div class="flex flex-col items-center gap-2">
                        <i data-lucide="alert-circle" class="w-8 h-8"></i>
                        <p>No grievances found</p>
                        <p class="text-sm">Try adjusting your search criteria</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const grievancesHTML = filteredGrievances.map(grievance => createGrievanceRow(grievance)).join('');
    container.innerHTML = grievancesHTML;
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Create Grievance Row
function createGrievanceRow(grievance) {
    const statusClass = getStatusClass(grievance.status);
    const priorityClass = getPriorityClass(grievance.priority);
    const categoryClass = getCategoryClass(grievance.category);
    const submittedDate = formatDate(grievance.submittedAt);
    const factoryName = getFactoryName(grievance.factoryId);
    
    return `
        <tr class="hover:bg-neutral-50 transition-colors">
            <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                    <input type="checkbox" class="grievance-checkbox" value="${grievance.id}" onchange="handleGrievanceSelection()">
                    <div>
                        <div class="font-medium text-neutral-900">${grievance.title || 'Untitled'}</div>
                        <div class="text-sm text-neutral-600">${grievance.reporterName || 'Anonymous'}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryClass}">
                    ${formatCategory(grievance.category)}
                </span>
            </td>
            <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClass}">
                    ${formatPriority(grievance.priority)}
                </span>
            </td>
            <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                    ${formatStatus(grievance.status)}
                </span>
            </td>
            <td class="px-4 py-3 text-sm text-neutral-600">${factoryName}</td>
            <td class="px-4 py-3 text-sm text-neutral-600">${submittedDate}</td>
            <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                    <button onclick="viewGrievance('${grievance.id}')" class="btn-icon" title="View Details">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                    <button onclick="editGrievance('${grievance.id}')" class="btn-icon" title="Edit">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <div class="relative">
                        <button onclick="toggleStatusMenu('${grievance.id}')" class="btn-icon" title="Update Status">
                            <i data-lucide="more-vertical" class="w-4 h-4"></i>
                        </button>
                        <div id="statusMenu-${grievance.id}" class="status-menu hidden">
                            <button onclick="updateGrievanceStatus('${grievance.id}', 'investigating')" class="status-option">Start Investigation</button>
                            <button onclick="updateGrievanceStatus('${grievance.id}', 'escalated')" class="status-option">Escalate</button>
                            <button onclick="updateGrievanceStatus('${grievance.id}', 'resolved')" class="status-option">Mark Resolved</button>
                            <button onclick="updateGrievanceStatus('${grievance.id}', 'closed')" class="status-option">Close</button>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    `;
}

// Load and Update Grievance Statistics
async function loadGrievanceStatistics() {
    try {
        console.log('📊 Loading grievance statistics...');
        updateGrievanceStatistics();
    } catch (error) {
        console.error('❌ Error loading grievance statistics:', error);
    }
}

function updateGrievanceStatistics() {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalGrievances = grievances.length;
    const openGrievances = grievances.filter(grievance => 
        ['new', 'investigating', 'escalated'].includes(grievance.status || 'new')
    ).length;
    const resolvedThisMonth = grievances.filter(grievance => {
        const resolvedAt = grievance.resolvedAt?.toDate();
        return resolvedAt && resolvedAt >= thisMonthStart && grievance.status === 'resolved';
    }).length;
    
    // Calculate additional statistics
    const criticalGrievances = grievances.filter(grievance => 
        grievance.priority === 'critical'
    ).length;
    const investigatingGrievances = grievances.filter(grievance => 
        grievance.status === 'investigating'
    ).length;
    
    // Calculate resolution rate
    const resolvedGrievances = grievances.filter(g => g.status === 'resolved');
    const resolutionRate = totalGrievances > 0 ? Math.round((resolvedGrievances.length / totalGrievances) * 100) : 0;
    
    // Calculate average resolution time
    const resolvedWithDates = grievances.filter(g => g.resolvedAt && g.submittedAt);
    let averageResolutionTime = 0;
    if (resolvedWithDates.length > 0) {
        const totalResolutionTime = resolvedWithDates.reduce((sum, grievance) => {
            const submitted = grievance.submittedAt.toDate();
            const resolved = grievance.resolvedAt.toDate();
            return sum + (resolved - submitted);
        }, 0);
        averageResolutionTime = Math.round(totalResolutionTime / resolvedWithDates.length / (1000 * 60 * 60 * 24)); // Convert to days
    }
    
    // Update statistics display
    updateStatDisplay('totalGrievances', totalGrievances);
    updateStatDisplay('openGrievances', openGrievances);
    updateStatDisplay('resolvedGrievances', resolvedThisMonth);
    updateStatDisplay('averageResolutionTime', averageResolutionTime > 0 ? `${averageResolutionTime}d` : 'N/A');
    updateStatDisplay('criticalGrievances', criticalGrievances);
    updateStatDisplay('investigatingGrievances', investigatingGrievances);
    updateStatDisplay('resolutionRate', resolutionRate + '%');
    
    console.log(`📈 Statistics updated: ${totalGrievances} total, ${openGrievances} open, ${resolvedThisMonth} resolved this month, ${criticalGrievances} critical, ${investigatingGrievances} investigating, ${resolutionRate}% resolution rate`);
}

function updateStatDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        // Animate the value change
        element.style.transform = 'scale(1.1)';
        element.textContent = typeof value === 'number' ? value.toLocaleString() : value;
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
}

// Search and Filter Functions
function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300); // Debounce search
}

function handleFilterChange() {
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value?.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const priorityFilter = document.getElementById('priorityFilter')?.value || '';
    
    filteredGrievances = grievances.filter(grievance => {
        // Search term filter
        if (searchTerm) {
            const searchableText = [
                grievance.title || '',
                grievance.description || '',
                grievance.reporterName || '',
                grievance.category || '',
                getFactoryName(grievance.factoryId) || ''
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }
        
        // Category filter
        if (categoryFilter && grievance.category !== categoryFilter) {
            return false;
        }
        
        // Status filter
        if (statusFilter) {
            const grievanceStatus = grievance.status || 'new';
            if (grievanceStatus !== statusFilter) {
                return false;
            }
        }
        
        // Priority filter
        if (priorityFilter && grievance.priority !== priorityFilter) {
            return false;
        }
        
        return true;
    });
    
    // Reset to first page
    currentPage = 1;
    
    // Update display
    updateGrievancesTable();
    updatePagination();
    
    console.log(`🔍 Filters applied: ${filteredGrievances.length} grievances match criteria`);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('priorityFilter').value = '';
    
    applyFilters();
}

// Table Management
function updateGrievancesTable() {
    const tbody = document.getElementById('grievancesTableBody');
    if (!tbody) return;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedGrievances = filteredGrievances.slice(startIndex, endIndex);
    
    if (paginatedGrievances.length === 0) {
        showEmptyState();
        return;
    }
    
    // Generate table rows
    const rowsHTML = paginatedGrievances.map(grievance => {
        const isSelected = selectedGrievances.includes(grievance.id);
        const grievanceStatus = grievance.status || 'new';
        const priority = grievance.priority || 'medium';
        const submittedAt = grievance.submittedAt?.toDate() || new Date();
        
        return `
            <tr class="${isSelected ? 'selected' : ''}">
                <td>
                    <input type="checkbox" ${isSelected ? 'checked' : ''} 
                           onchange="handleGrievanceSelect('${grievance.id}', this.checked)">
                </td>
                <td>
                    <div class="grievance-info">
                        <div class="grievance-avatar">
                            ${getGrievanceInitials(grievance)}
                        </div>
                        <div class="grievance-details">
                            <h4>${grievance.title || 'Untitled Grievance'}</h4>
                            <p>${truncateText(grievance.description || 'No description', 60)}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="category-badge">
                        ${formatCategory(grievance.category)}
                    </span>
                </td>
                <td>
                    <div>
                        <div style="font-weight: 500; color: var(--neutral-900);">
                            ${grievance.anonymousReport ? 'Anonymous' : (grievance.reporterName || 'Unknown')}
                        </div>
                        <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                            ${getFactoryName(grievance.factoryId) || 'No Factory'}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="priority-badge priority-${priority}">
                        ${formatPriority(priority)}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${grievanceStatus}">
                        ${formatStatus(grievanceStatus)}
                    </span>
                </td>
                <td>
                    <div style="font-size: var(--text-sm);">
                        ${formatDate(submittedAt)}
                    </div>
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        ${formatTimeAgo(submittedAt)}
                    </div>
                </td>
                <td>
                    <div class="grievance-actions">
                        <button class="action-btn view" onclick="viewGrievance('${grievance.id}')" title="View Details">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="action-btn investigate" onclick="updateGrievanceStatus('${grievance.id}', 'investigating')" title="Start Investigation">
                            <i data-lucide="search"></i>
                        </button>
                        <button class="action-btn resolve" onclick="updateGrievanceStatus('${grievance.id}', 'resolved')" title="Mark Resolved">
                            <i data-lucide="check-circle"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = rowsHTML;
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Update select all checkbox
    updateSelectAllCheckbox();
}

function showEmptyState(message = null) {
    const tbody = document.getElementById('grievancesTableBody');
    if (!tbody) return;
    
    const defaultMessage = filteredGrievances.length === 0 && grievances.length > 0 
        ? 'No grievances match your search criteria.' 
        : 'No grievances found.';
    
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="empty-state">
                <div class="empty-state-icon">
                    <i data-lucide="message-circle"></i>
                </div>
                <p>${message || defaultMessage}</p>
                ${filteredGrievances.length === 0 && grievances.length > 0 ? 
                    '<button class="btn btn-outline mt-4" onclick="clearFilters()">Clear Filters</button>' : 
                    '<button class="btn btn-primary mt-4" onclick="openCreateGrievanceModal()">Report First Grievance</button>'
                }
            </td>
        </tr>
    `;
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Pagination
function updatePagination() {
    totalPages = Math.ceil(filteredGrievances.length / pageSize);
    
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationControls = document.getElementById('paginationControls');
    
    if (!paginationInfo || !paginationControls) return;
    
    // Update pagination info
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, filteredGrievances.length);
    const totalItems = filteredGrievances.length;
    
    if (totalItems === 0) {
        paginationInfo.textContent = 'No grievances to display';
    } else {
        paginationInfo.textContent = `Showing ${startItem} to ${endItem} of ${totalItems} grievances`;
    }
    
    // Update pagination controls
    if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
    }
    
    let controlsHTML = '';
    
    // Previous button
    controlsHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${currentPage - 1})">
            <i data-lucide="chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        controlsHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    // Next button
    controlsHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${currentPage + 1})">
            <i data-lucide="chevron-right"></i>
        </button>
    `;
    
    paginationControls.innerHTML = controlsHTML;
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    updateGrievancesTable();
    updatePagination();
}

function handlePageSizeChange() {
    const pageSizeSelect = document.getElementById('pageSize');
    pageSize = parseInt(pageSizeSelect.value);
    currentPage = 1;
    updateGrievancesTable();
    updatePagination();
}

// Grievance Selection
function handleGrievanceSelect(grievanceId, isSelected) {
    if (isSelected) {
        if (!selectedGrievances.includes(grievanceId)) {
            selectedGrievances.push(grievanceId);
        }
    } else {
        selectedGrievances = selectedGrievances.filter(id => id !== grievanceId);
    }
    
    updateSelectAllCheckbox();
    console.log(`⚠️ Grievance selection: ${selectedGrievances.length} grievances selected`);
}

function handleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const isChecked = selectAllCheckbox.checked;
    
    if (isChecked) {
        // Select all visible grievances
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const visibleGrievances = filteredGrievances.slice(startIndex, endIndex);
        
        visibleGrievances.forEach(grievance => {
            if (!selectedGrievances.includes(grievance.id)) {
                selectedGrievances.push(grievance.id);
            }
        });
    } else {
        // Deselect all
        selectedGrievances = [];
    }
    
    updateGrievancesTable();
    console.log(`🔄 Select all: ${selectedGrievances.length} grievances selected`);
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAll');
    if (!selectAllCheckbox) return;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const visibleGrievances = filteredGrievances.slice(startIndex, endIndex);
    
    const visibleGrievanceIds = visibleGrievances.map(grievance => grievance.id);
    const selectedVisibleGrievances = visibleGrievanceIds.filter(id => selectedGrievances.includes(id));
    
    if (selectedVisibleGrievances.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedVisibleGrievances.length === visibleGrievanceIds.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

// Grievance Modal Management
function openCreateGrievanceModal() {
    editingGrievanceId = null;
    
    // Reset form
    document.getElementById('grievanceForm').reset();
    
    // Set default values
    document.getElementById('priority').value = 'medium';
    
    // Update modal title and button
    document.getElementById('modalTitle').textContent = 'Report New Grievance';
    const saveBtn = document.getElementById('saveGrievanceBtn');
    saveBtn.innerHTML = '<i data-lucide="plus-circle"></i> Submit Grievance';
    
    // Show modal
    document.getElementById('grievanceModal').style.display = 'flex';
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    console.log('➕ Opening create grievance modal');
}

function viewGrievance(grievanceId) {
    const grievance = grievances.find(g => g.id === grievanceId);
    if (!grievance) return;
    
    // For now, just show an alert with grievance details
    // In the future, this could open a detailed view modal
    const details = `
Grievance Details:

Title: ${grievance.title || 'Untitled'}
Category: ${formatCategory(grievance.category)}
Reporter: ${grievance.anonymousReport ? 'Anonymous' : (grievance.reporterName || 'Unknown')}
Priority: ${formatPriority(grievance.priority || 'medium')}
Status: ${formatStatus(grievance.status || 'new')}
Factory: ${getFactoryName(grievance.factoryId) || 'No Factory'}

Description:
${grievance.description || 'No description provided'}

${grievance.incidentDate ? 'Incident Date: ' + new Date(grievance.incidentDate).toLocaleDateString() : ''}
${grievance.incidentLocation ? 'Location: ' + grievance.incidentLocation : ''}
${grievance.peopleInvolved ? 'People Involved: ' + grievance.peopleInvolved : ''}
${grievance.desiredResolution ? 'Desired Resolution: ' + grievance.desiredResolution : ''}
    `.trim();
    
    alert(details);
    
    console.log('👀 Viewing grievance details:', grievance);
}

function closeGrievanceModal() {
    document.getElementById('grievanceModal').style.display = 'none';
    editingGrievanceId = null;
    
    console.log('❌ Grievance modal closed');
}

// Save Grievance
async function saveGrievance() {
    try {
        const saveBtn = document.getElementById('saveGrievanceBtn');
        const originalHTML = saveBtn.innerHTML;
        
        // Show loading state
        saveBtn.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px;"></div> Submitting...';
        saveBtn.disabled = true;
        
        // Get form data
        const formData = {
            title: document.getElementById('grievanceTitle').value.trim(),
            category: document.getElementById('category').value,
            reporterName: document.getElementById('reporterName').value.trim(),
            reporterContact: document.getElementById('reporterContact').value.trim() || null,
            factoryId: document.getElementById('factoryId').value || null,
            priority: document.getElementById('priority').value,
            description: document.getElementById('description').value.trim(),
            incidentDate: document.getElementById('incidentDate').value || null,
            incidentLocation: document.getElementById('incidentLocation').value.trim() || null,
            peopleInvolved: document.getElementById('peopleInvolved').value.trim() || null,
            desiredResolution: document.getElementById('desiredResolution').value.trim() || null,
            anonymousReport: document.getElementById('anonymousReport').checked,
            urgentCase: document.getElementById('urgentCase').checked
        };
        
        // Validate required fields
        if (!formData.title || !formData.category || !formData.description) {
            throw new Error('Please fill in all required fields.');
        }
        
        if (!formData.anonymousReport && !formData.reporterName) {
            throw new Error('Reporter name is required for non-anonymous reports.');
        }
        
        // Prepare grievance data
        const grievanceData = {
            ...formData,
            status: 'new',
            submittedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            submittedBy: auth.currentUser?.uid || null
        };
        
        // Adjust priority if marked as urgent
        if (formData.urgentCase && formData.priority !== 'critical') {
            grievanceData.priority = 'high';
        }
        
        // Create new grievance
        const docRef = await addDoc(collection(db, 'grievances'), grievanceData);
        console.log(`✅ Grievance created successfully: ${docRef.id}`);
        
        // Close modal and reset state
        closeGrievanceModal();
        
        // Clear selections
        selectedGrievances = [];
        
        console.log('🎉 Grievance submission completed successfully');
        
    } catch (error) {
        console.error('❌ Error saving grievance:', error);
        alert(`Error: ${error.message}`);
    } finally {
        // Reset button state
        const saveBtn = document.getElementById('saveGrievanceBtn');
        saveBtn.innerHTML = '<i data-lucide="plus-circle"></i> Submit Grievance';
        saveBtn.disabled = false;
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Grievance Status Management
async function updateGrievanceStatus(grievanceId, newStatus) {
    try {
        const grievance = grievances.find(g => g.id === grievanceId);
        if (!grievance) return;
        
        const statusMessages = {
            'investigating': 'start investigation on',
            'resolved': 'mark as resolved',
            'closed': 'close',
            'escalated': 'escalate'
        };
        
        const confirmMessage = `Are you sure you want to ${statusMessages[newStatus] || 'update'} this grievance?`;
        if (!confirm(confirmMessage)) return;
        
        const updateData = {
            status: newStatus,
            updatedAt: serverTimestamp(),
            updatedBy: auth.currentUser?.uid || null
        };
        
        // Add resolution timestamp for resolved cases
        if (newStatus === 'resolved') {
            updateData.resolvedAt = serverTimestamp();
        }
        
        await updateDoc(doc(db, 'grievances', grievanceId), updateData);
        
        console.log(`🔄 Grievance status updated: ${grievanceId} -> ${newStatus}`);
        
    } catch (error) {
        console.error('❌ Error updating grievance status:', error);
        alert('Error updating grievance status. Please try again.');
    }
}

// Export and Reporting
function exportGrievances() {
    try {
        console.log('📊 Exporting grievances...');
        
        // Prepare CSV data
        const headers = ['Title', 'Category', 'Reporter', 'Factory', 'Priority', 'Status', 'Submitted Date', 'Incident Date', 'Description'];
        const csvData = [headers];
        
        const grievancesToExport = filteredGrievances.length > 0 ? filteredGrievances : grievances;
        
        grievancesToExport.forEach(grievance => {
            const row = [
                grievance.title || 'Untitled',
                formatCategory(grievance.category),
                grievance.anonymousReport ? 'Anonymous' : (grievance.reporterName || 'Unknown'),
                getFactoryName(grievance.factoryId) || 'No Factory',
                formatPriority(grievance.priority || 'medium'),
                formatStatus(grievance.status || 'new'),
                grievance.submittedAt ? grievance.submittedAt.toDate().toLocaleDateString() : 'N/A',
                grievance.incidentDate || 'N/A',
                (grievance.description || 'No description').replace(/\n/g, ' ').substring(0, 200)
            ];
            csvData.push(row);
        });
        
        // Convert to CSV string
        const csvString = csvData.map(row => 
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Download CSV
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `grievances_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`✅ Grievances exported: ${grievancesToExport.length} records`);
        
    } catch (error) {
        console.error('❌ Error exporting grievances:', error);
        alert('Error exporting grievances. Please try again.');
    }
}

function generateReport() {
    // For now, just show a summary
    const totalGrievances = grievances.length;
    const byStatus = grievances.reduce((acc, g) => {
        const status = g.status || 'new';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
    
    const byCategory = grievances.reduce((acc, g) => {
        const category = g.category || 'other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});
    
    const report = `
Grievance Management Report
Generated: ${new Date().toLocaleDateString()}

Summary:
- Total Grievances: ${totalGrievances}
- Open Cases: ${(byStatus.new || 0) + (byStatus.investigating || 0) + (byStatus.escalated || 0)}
- Resolved Cases: ${byStatus.resolved || 0}
- Closed Cases: ${byStatus.closed || 0}

By Category:
${Object.entries(byCategory).map(([cat, count]) => `- ${formatCategory(cat)}: ${count}`).join('\n')}

By Status:
${Object.entries(byStatus).map(([status, count]) => `- ${formatStatus(status)}: ${count}`).join('\n')}
    `;
    
    alert(report);
    console.log('📊 Grievance report generated');
}

// Mobile Menu Functions
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
    }
    
    console.log('📱 Mobile menu toggled');
}

function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    }
    
    console.log('📱 Mobile menu closed');
}

// Utility Functions
function formatCategory(category) {
    const categoryMap = {
        'harassment': 'Harassment',
        'discrimination': 'Discrimination',
        'safety': 'Safety Concerns',
        'wages': 'Wages & Benefits',
        'working_conditions': 'Working Conditions',
        'management': 'Management Issues',
        'other': 'Other'
    };
    return categoryMap[category] || 'Unknown';
}

function formatPriority(priority) {
    const priorityMap = {
        'critical': 'Critical',
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low'
    };
    return priorityMap[priority] || 'Medium';
}

function formatStatus(status) {
    const statusMap = {
        'new': 'New',
        'investigating': 'Investigating',
        'resolved': 'Resolved',
        'closed': 'Closed',
        'escalated': 'Escalated'
    };
    return statusMap[status] || 'New';
}

function getFactoryName(factoryId) {
    if (!factoryId) return null;
    const factory = factories.find(f => f.id === factoryId);
    return factory ? factory.name : `Factory ${factoryId}`;
}

function getGrievanceInitials(grievance) {
    if (grievance.anonymousReport) {
        return '?';
    }
    const name = grievance.reporterName || 'Unknown';
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatDate(date) {
    if (!date) return 'N/A';
    
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
    
    return date.toLocaleDateString();
}

// Get Status Class for styling
function getStatusClass(status) {
    const statusClasses = {
        'new': 'bg-blue-100 text-blue-800',
        'investigating': 'bg-yellow-100 text-yellow-800',
        'escalated': 'bg-orange-100 text-orange-800',
        'resolved': 'bg-green-100 text-green-800',
        'closed': 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

// Get Priority Class for styling
function getPriorityClass(priority) {
    const priorityClasses = {
        'low': 'bg-green-100 text-green-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'high': 'bg-orange-100 text-orange-800',
        'critical': 'bg-red-100 text-red-800'
    };
    return priorityClasses[priority] || 'bg-gray-100 text-gray-800';
}

// Get Category Class for styling
function getCategoryClass(category) {
    const categoryClasses = {
        'safety': 'bg-red-100 text-red-800',
        'payroll': 'bg-blue-100 text-blue-800',
        'harassment': 'bg-purple-100 text-purple-800',
        'working-conditions': 'bg-orange-100 text-orange-800',
        'discrimination': 'bg-pink-100 text-pink-800',
        'other': 'bg-gray-100 text-gray-800'
    };
    return categoryClasses[category] || 'bg-gray-100 text-gray-800';
}

function formatTimeAgo(date) {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
}

function showTableLoading(show) {
    const loadingOverlay = document.getElementById('tableLoading');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Close modal when clicking outside
    document.getElementById('grievanceModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeGrievanceModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('grievanceModal')?.style.display === 'flex') {
            closeGrievanceModal();
        }
    });
    
    // Form submission
    document.getElementById('grievanceForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveGrievance();
    });
    
    // Mobile menu auto-close on navigation
    document.addEventListener('click', function(e) {
        if (e.target.matches('.sidebar-nav-item')) {
            closeMobileMenu();
        }
    });
    
    console.log('👂 Event listeners set up');
}

// Logout Function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('🚪 Logging out...');
        
        // Clean up listeners
        if (window.grievancesUnsubscribe) {
            window.grievancesUnsubscribe();
        }
        
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

// Global functions for HTML onclick handlers
window.openCreateGrievanceModal = openCreateGrievanceModal;
window.closeGrievanceModal = closeGrievanceModal;
window.saveGrievance = saveGrievance;
window.viewGrievance = viewGrievance;
window.updateGrievanceStatus = updateGrievanceStatus;
window.handleSearch = handleSearch;
window.handleFilterChange = handleFilterChange;
window.clearFilters = clearFilters;
window.handleGrievanceSelect = handleGrievanceSelect;
window.handleSelectAll = handleSelectAll;
window.changePage = changePage;
window.handlePageSizeChange = handlePageSizeChange;
window.exportGrievances = exportGrievances;
window.generateReport = generateReport;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.logout = logout;

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (window.grievancesUnsubscribe) {
        window.grievancesUnsubscribe();
    }
});

// Initialization is handled by DOMContentLoaded event listener
