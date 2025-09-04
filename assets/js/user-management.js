// Comprehensive User Management System
// Wait for Firebase to be available before initializing
function initializeUserManagement() {
  console.log('🚀 User Management initialization started...');
  
  // Check if Firebase is available
  if (!window.Firebase) {
    console.log('⏳ Waiting for Firebase to initialize...');
    setTimeout(initializeUserManagement, 100);
    return;
  }
  
  console.log('✅ Firebase is available, proceeding with initialization...');

  // Get Firebase instances and functions from the global Firebase object
  const { auth, db } = window.Firebase;
  const {
    doc, 
    getDoc, 
    setDoc,
    collection, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp,
    EmailAuthProvider,
    getDocs,
    writeBatch
  } = window.Firebase;

  let users = [];
  let filteredUsers = [];
  let factories = [];
  let currentPage = 1;
  let pageSize = 25;
  let totalPages = 1;
  let selectedUsers = [];
  let editingUserId = null;
  let searchTimeout = null;

  document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 User Management system initializing...');
    
    // Check authentication and permissions
    await checkAuthentication();
    
    // Initialize all components
    await Promise.all([
      loadFactories(),
      loadUsers(),
      loadUserStatistics(),
      setupEventListeners()
    ]);
    
    console.log('✅ User Management system ready');
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
                    window.location.href = 'super-admin-dashboard.html';
                    return;
                }
                
                // Store admin credentials for user creation (simplified approach)
                localStorage.setItem('adminEmail', user.email);
                // Note: In production, you'd want a more secure way to handle this
                
                console.log('✅ Super Admin access granted for User Management');
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
        console.log('🏭 Loading factories...');
        
        const factoriesRef = collection(db, 'factories');
        const q = query(factoriesRef, orderBy('name'));
        const snapshot = await getDocs(q);
        factories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Update factory dropdowns
        updateFactoryDropdowns();
        
        console.log(`✅ Loaded ${factories.length} factories`);
        
    } catch (error) {
        console.error('❌ Error loading factories:', error);
        // Continue with empty factories array
        factories = [];
    }
}

function updateFactoryDropdowns() {
    const factorySelects = ['factoryFilter', 'factoryId'];
    
    factorySelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) {
            console.warn(`Factory select element not found: ${selectId}`);
            return;
        }
        
        // Clear existing options (except first one)
        const firstOption = select.firstElementChild;
        select.innerHTML = '';
        if (firstOption) {
            select.appendChild(firstOption);
        }
        
        // Add factory options
        if (factories && factories.length > 0) {
            factories.forEach(factory => {
                const option = document.createElement('option');
                option.value = factory.id;
                option.textContent = factory.name || `Factory ${factory.id}`;
                select.appendChild(option);
            });
        } else {
            console.log('No factories available for dropdowns');
        }
    });
}

// Load Users with real-time updates
async function loadUsers() {
    try {
        console.log('👥 Loading users...');
        showTableLoading(true);
        
        // Set a timeout to prevent infinite loading
        const loadingTimeout = setTimeout(() => {
            console.log('⏰ Loading timeout reached, using sample data');
            showTableLoading(false);
            loadSampleUsers();
        }, 10000); // 10 seconds timeout
        
        // Set up real-time listener for users
        const usersRef = collection(db, 'users');
        let q;
        
        try {
            q = query(usersRef, orderBy('createdAt', 'desc'));
        } catch (error) {
            console.log('⚠️ Cannot order by createdAt, using simple query');
            q = query(usersRef);
        }
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            try {
                users = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                console.log(`📊 Users updated: ${users.length} total`);
                
                // Apply current filters
                applyFilters();
                
                // Update statistics
                updateUserStatistics();
                
                showTableLoading(false);
                clearTimeout(loadingTimeout); // Clear the timeout since we loaded successfully
            } catch (error) {
                console.error('❌ Error processing users data:', error);
                showTableLoading(false);
                showEmptyState('Error processing users data. Please refresh the page.');
            }
        }, (error) => {
            console.error('❌ Error loading users:', error);
            showTableLoading(false);
            clearTimeout(loadingTimeout);
            console.log('⚠️ Using sample users due to Firebase error');
            loadSampleUsers();
        });
        
        // Store unsubscribe function for cleanup
        window.usersUnsubscribe = unsubscribe;
        
    } catch (error) {
        console.error('❌ Error setting up users listener:', error);
        showTableLoading(false);
        clearTimeout(loadingTimeout);
        console.log('⚠️ Using sample users due to setup error');
        loadSampleUsers();
    }
}

// Load and Update User Statistics
async function loadUserStatistics() {
    try {
        console.log('📊 Loading user statistics...');
        updateUserStatistics();
    } catch (error) {
        console.error('❌ Error loading user statistics:', error);
    }
}

function updateUserStatistics() {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === 'active' || !user.status).length;
    const pendingUsers = users.filter(user => user.status === 'pending').length;
    const newThisMonth = users.filter(user => {
        const createdAt = user.createdAt?.toDate() || new Date();
        return createdAt >= thisMonthStart;
    }).length;
    const superAdmins = users.filter(user => user.role === 'super_admin').length;
    const factoryAdmins = users.filter(user => user.role === 'factory_admin').length;
    const hrStaff = users.filter(user => user.role === 'hr_staff').length;
    
    // Update statistics display
    updateStatDisplay('totalUsers', totalUsers);
    updateStatDisplay('activeUsers', activeUsers);
    updateStatDisplay('pendingUsers', pendingUsers);
    updateStatDisplay('newThisMonth', newThisMonth);
    updateStatDisplay('superAdmins', superAdmins);
    updateStatDisplay('factoryAdmins', factoryAdmins);
    updateStatDisplay('hrStaff', hrStaff);
    
    console.log(`📈 Statistics updated: ${totalUsers} total, ${activeUsers} active, ${pendingUsers} pending, ${newThisMonth} new this month, ${superAdmins} super admins, ${factoryAdmins} factory admins, ${hrStaff} HR staff`);
}

function updateStatDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        // Animate the value change
        element.style.transform = 'scale(1.1)';
        element.textContent = value.toLocaleString();
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
    const roleFilter = document.getElementById('roleFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const factoryFilter = document.getElementById('factoryFilter')?.value || '';
    
    filteredUsers = users.filter(user => {
        // Search term filter
        if (searchTerm) {
            const searchableText = [
                user.displayName || '',
                user.email || '',
                user.firstName || '',
                user.lastName || '',
                user.department || '',
                user.phoneNumber || '',
                getFactoryName(user.factoryId) || ''
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }
        
        // Role filter
        if (roleFilter && user.role !== roleFilter) {
            return false;
        }
        
        // Status filter
        if (statusFilter) {
            const userStatus = user.status || 'active';
            if (userStatus !== statusFilter) {
                return false;
            }
        }
        
        // Factory filter
        if (factoryFilter && user.factoryId !== factoryFilter) {
            return false;
        }
        
        return true;
    });
    
    // Reset to first page
    currentPage = 1;
    
    // Update display
    updateUsersTable();
    updatePagination();
    
    console.log(`🔍 Filters applied: ${filteredUsers.length} users match criteria`);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('roleFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('factoryFilter').value = '';
    
    applyFilters();
}

// Table Management
function updateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    if (paginatedUsers.length === 0) {
        showEmptyState();
        return;
    }
    
    // Generate table rows
    const rowsHTML = paginatedUsers.map(user => {
        const isSelected = selectedUsers.includes(user.id);
        const userStatus = user.status || 'active';
        const lastActive = user.lastActive?.toDate() || user.createdAt?.toDate() || new Date();
        
        return `
            <tr class="${isSelected ? 'selected' : ''}">
                <td>
                    <input type="checkbox" ${isSelected ? 'checked' : ''} 
                           onchange="handleUserSelect('${user.id}', this.checked)">
                </td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">
                            ${getUserInitials(user)}
                        </div>
                        <div class="user-details">
                            <h4>${user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User'}</h4>
                            <p>${user.email || 'No email'}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="role-badge role-${user.role?.replace('_', '-') || 'worker'}">
                        ${formatRole(user.role)}
                    </span>
                </td>
                <td>${getFactoryName(user.factoryId) || 'No Factory'}</td>
                <td>
                    <span class="status-badge status-${userStatus}">
                        ${formatStatus(userStatus)}
                    </span>
                </td>
                <td>${formatTimeAgo(lastActive)}</td>
                <td>
                    <div class="user-actions">
                        <button class="action-btn view" onclick="viewUser('${user.id}')" title="View User Dashboard">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editUser('${user.id}')" title="Edit User">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="action-btn" onclick="sendPasswordReset('${user.id}')" title="Send Password Reset">
                            <i data-lucide="key-round"></i>
                        </button>
                        <button class="action-btn toggle" onclick="toggleUserStatus('${user.id}')" title="Toggle Status">
                            <i data-lucide="${userStatus === 'active' ? 'user-x' : 'user-check'}"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteUser('${user.id}')" title="Delete User">
                            <i data-lucide="trash-2"></i>
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
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    const defaultMessage = filteredUsers.length === 0 && users.length > 0 
        ? 'No users match your search criteria.' 
        : 'No users found.';
    
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">
                <div class="empty-state-icon">
                    <i data-lucide="users"></i>
                </div>
                <p>${message || defaultMessage}</p>
                ${filteredUsers.length === 0 && users.length > 0 ? 
                    '<button class="btn btn-outline mt-4" onclick="clearFilters()">Clear Filters</button>' : 
                    '<button class="btn btn-primary mt-4" onclick="openCreateUserModal()">Add First User</button>'
                }
            </td>
        </tr>
    `;
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Add sample users if no users exist
function loadSampleUsers() {
    console.log('📦 Loading sample users for demonstration...');
    
    const sampleUsers = [
        {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            displayName: 'John Doe',
            email: 'john.doe@angkorcompliance.com',
            role: 'factory_admin',
            factoryId: 'factory-1',
            status: 'active',
            department: 'Management',
            phoneNumber: '+855 23 123 456',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lastActive: new Date()
        },
        {
            id: 'user-2',
            firstName: 'Jane',
            lastName: 'Smith',
            displayName: 'Jane Smith',
            email: 'jane.smith@angkorcompliance.com',
            role: 'hr_staff',
            factoryId: 'factory-2',
            status: 'active',
            department: 'Human Resources',
            phoneNumber: '+855 23 654 321',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            lastActive: new Date()
        },
        {
            id: 'user-3',
            firstName: 'Mike',
            lastName: 'Johnson',
            displayName: 'Mike Johnson',
            email: 'mike.johnson@angkorcompliance.com',
            role: 'auditor',
            factoryId: null,
            status: 'active',
            department: 'Compliance',
            phoneNumber: '+855 23 789 012',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            lastActive: new Date()
        },
        {
            id: 'user-4',
            firstName: 'Sarah',
            lastName: 'Wilson',
            displayName: 'Sarah Wilson',
            email: 'sarah.wilson@angkorcompliance.com',
            role: 'super_admin',
            factoryId: null,
            status: 'active',
            department: 'Administration',
            phoneNumber: '+855 23 456 789',
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            lastActive: new Date()
        },
        {
            id: 'user-5',
            firstName: 'David',
            lastName: 'Brown',
            displayName: 'David Brown',
            email: 'david.brown@angkorcompliance.com',
            role: 'factory_admin',
            factoryId: 'factory-3',
            status: 'active',
            department: 'Operations',
            phoneNumber: '+855 23 321 654',
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            lastActive: new Date()
        },
        {
            id: 'user-6',
            firstName: 'Lisa',
            lastName: 'Garcia',
            displayName: 'Lisa Garcia',
            email: 'lisa.garcia@angkorcompliance.com',
            role: 'hr_staff',
            factoryId: 'factory-1',
            status: 'pending',
            department: 'Human Resources',
            phoneNumber: '+855 23 987 654',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            lastActive: new Date()
        },
        {
            id: 'user-7',
            firstName: 'Robert',
            lastName: 'Taylor',
            displayName: 'Robert Taylor',
            email: 'robert.taylor@angkorcompliance.com',
            role: 'worker',
            factoryId: 'factory-2',
            status: 'active',
            department: 'Production',
            phoneNumber: '+855 23 147 258',
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            lastActive: new Date()
        },
        {
            id: 'user-8',
            firstName: 'Emily',
            lastName: 'Davis',
            displayName: 'Emily Davis',
            email: 'emily.davis@angkorcompliance.com',
            role: 'hr_staff',
            factoryId: 'factory-3',
            status: 'active',
            department: 'Human Resources',
            phoneNumber: '+855 23 369 258',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            lastActive: new Date()
        }
    ];
    
    users = [...sampleUsers];
    filteredUsers = [...users];
    updateUsersTable();
    updateUserStatistics();
    showTableLoading(false);
    
    console.log('✅ Sample users loaded for demonstration');
}

// Pagination
function updatePagination() {
    totalPages = Math.ceil(filteredUsers.length / pageSize);
    
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationControls = document.getElementById('paginationControls');
    
    if (!paginationInfo || !paginationControls) return;
    
    // Update pagination info
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, filteredUsers.length);
    const totalItems = filteredUsers.length;
    
    if (totalItems === 0) {
        paginationInfo.textContent = 'No users to display';
    } else {
        paginationInfo.textContent = `Showing ${startItem} to ${endItem} of ${totalItems} users`;
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
    updateUsersTable();
    updatePagination();
}

function handlePageSizeChange() {
    const pageSizeSelect = document.getElementById('pageSize');
    pageSize = parseInt(pageSizeSelect.value);
    currentPage = 1;
    updateUsersTable();
    updatePagination();
}

// User Selection
function handleUserSelect(userId, isSelected) {
    if (isSelected) {
        if (!selectedUsers.includes(userId)) {
            selectedUsers.push(userId);
        }
    } else {
        selectedUsers = selectedUsers.filter(id => id !== userId);
    }
    
    updateSelectAllCheckbox();
    console.log(`👤 User selection: ${selectedUsers.length} users selected`);
}

function handleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const isChecked = selectAllCheckbox.checked;
    
    if (isChecked) {
        // Select all visible users
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const visibleUsers = filteredUsers.slice(startIndex, endIndex);
        
        visibleUsers.forEach(user => {
            if (!selectedUsers.includes(user.id)) {
                selectedUsers.push(user.id);
            }
        });
    } else {
        // Deselect all
        selectedUsers = [];
    }
    
    updateUsersTable();
    console.log(`🔄 Select all: ${selectedUsers.length} users selected`);
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAll');
    if (!selectAllCheckbox) return;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const visibleUsers = filteredUsers.slice(startIndex, endIndex);
    
    const visibleUserIds = visibleUsers.map(user => user.id);
    const selectedVisibleUsers = visibleUserIds.filter(id => selectedUsers.includes(id));
    
    if (selectedVisibleUsers.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedVisibleUsers.length === visibleUserIds.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

// User Modal Management
function openCreateUserModal() {
    editingUserId = null;
    
    // Reset form
    document.getElementById('userForm').reset();
    
    // Update modal title and button
    document.getElementById('modalTitle').textContent = 'Add New User';
    const saveBtn = document.getElementById('saveUserBtn');
    saveBtn.innerHTML = '<i data-lucide="user-plus"></i> Create User';
    
    // Show modal
    document.getElementById('userModal').style.display = 'flex';
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    console.log('➕ Opening create user modal');
}

function viewUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    console.log('👤 Opening user performance dashboard:', user.displayName || user.email);
    
    // Navigate to user performance dashboard
    window.location.href = `user-dashboard.html?id=${userId}`;
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    editingUserId = userId;
    
    // Populate form with user data
    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.lastName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('role').value = user.role || '';
    document.getElementById('factoryId').value = user.factoryId || '';
    document.getElementById('phoneNumber').value = user.phoneNumber || '';
    document.getElementById('department').value = user.department || '';
    document.getElementById('notes').value = user.notes || '';
    
    // Update modal title and button
    document.getElementById('modalTitle').textContent = 'Edit User';
    const saveBtn = document.getElementById('saveUserBtn');
    saveBtn.innerHTML = '<i data-lucide="save"></i> Update User';
    
    // Show modal
    document.getElementById('userModal').style.display = 'flex';
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    console.log(`✏️ Opening edit modal for user: ${userId}`);
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    editingUserId = null;
    
    console.log('❌ User modal closed');
}

// Save User (Create/Update)
async function saveUser() {
    try {
        const saveBtn = document.getElementById('saveUserBtn');
        const originalHTML = saveBtn.innerHTML;
        
        // Show loading state
        saveBtn.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px;"></div> Saving...';
        saveBtn.disabled = true;
        
        // Get form data
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim().toLowerCase(),
            role: document.getElementById('role').value,
            factoryId: document.getElementById('factoryId').value || null,
            phoneNumber: document.getElementById('phoneNumber').value.trim() || null,
            department: document.getElementById('department').value.trim() || null,
            notes: document.getElementById('notes').value.trim() || null
        };
        
        // Validate required fields
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
            throw new Error('Please fill in all required fields (First Name, Last Name, Email, and Role).');
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            throw new Error('Please enter a valid email address.');
        }
        
        // Role validation
        const validRoles = ['super_admin', 'factory_admin', 'hr_staff', 'auditor', 'worker'];
        if (!validRoles.includes(formData.role)) {
            throw new Error('Please select a valid role.');
        }
        
        // Check for duplicate email (exclude current user if editing)
        const existingUser = users.find(user => 
            user.email === formData.email && user.id !== editingUserId
        );
        if (existingUser) {
            throw new Error('A user with this email address already exists.');
        }
        
        // Prepare user data
        const userData = {
            ...formData,
            displayName: `${formData.firstName} ${formData.lastName}`,
            status: 'active',
            updatedAt: serverTimestamp()
        };
        
        if (editingUserId) {
            // Update existing user
            const userRef = doc(db, 'users', editingUserId);
            await updateDoc(userRef, userData);
            console.log(`✅ User updated successfully: ${editingUserId}`);
            await logAuditEntry('user_update', { userId: editingUserId, userData });
        } else {
            // Create new user
            userData.createdAt = serverTimestamp();
            
            // Generate a secure temporary password
            const tempPassword = generateSecurePassword();
            
            try {
                // For now, create user profile in Firestore only
                // Firebase Auth user creation will be handled by the user's first login
                // This avoids session switching issues
                
                // Generate a unique ID for the user
                const userRef = doc(collection(db, 'users'));
                const userId = userRef.id;
                
                // Create user profile in Firestore
                userData.id = userId;
                userData.status = 'pending'; // User needs to set up their account
                userData.tempPassword = tempPassword; // Store temp password for first login
                await setDoc(userRef, userData);
                
                console.log(`✅ User profile created successfully: ${userId}`);
                await logAuditEntry('user_create', { userId: userId, email: formData.email, role: formData.role });
                
                // Show success message with instructions
                alert(`User profile created successfully!\n\nUser ID: ${userId}\nTemporary Password: ${tempPassword}\n\nInstructions for the user:\n1. Go to login page\n2. Use their email and this temporary password\n3. They will be prompted to change their password on first login.`);
                
            } catch (error) {
                console.error('❌ Error creating user profile:', error);
                throw new Error(`Failed to create user profile: ${error.message}`);
            }
        }
        
        // Close modal and reset state
        closeUserModal();
        
        // Clear selections
        selectedUsers = [];
        
        console.log('🎉 User save operation completed successfully');
        
    } catch (error) {
        console.error('❌ Error saving user:', error);
        alert(`Error: ${error.message}`);
        await logAuditEntry('user_save_error', { message: error.message });
    } finally {
        // Reset button state
        const saveBtn = document.getElementById('saveUserBtn');
        saveBtn.innerHTML = editingUserId ? 
            '<i data-lucide="save"></i> Update User' : 
            '<i data-lucide="user-plus"></i> Create User';
        saveBtn.disabled = false;
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// User Actions
async function toggleUserStatus(userId) {
    let originalHTML = '';
    let button = null;
    
    try {
        const user = users.find(u => u.id === userId);
        if (!user) {
            alert('User not found.');
            return;
        }
        
        const currentStatus = user.status || 'active';
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        
        const confirmMessage = `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this user?`;
        if (!confirm(confirmMessage)) return;
        
        // Show loading state
        button = event.target.closest('.action-btn');
        if (button) {
            originalHTML = button.innerHTML;
            button.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px;"></div>';
            button.disabled = true;
        }
        
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
        
        console.log(`🔄 User status toggled: ${userId} -> ${newStatus}`);
        await logAuditEntry('user_status_toggle', { userId, status: newStatus });
        
    } catch (error) {
        console.error('❌ Error toggling user status:', error);
        alert('Error updating user status. Please try again.');
    } finally {
        // Reset button state
        if (button && originalHTML) {
            button.innerHTML = originalHTML;
            button.disabled = false;
        }
    }
}

async function deleteUser(userId) {
    try {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        const confirmMessage = `Are you sure you want to delete "${user.displayName || user.email}"?\n\nThis action cannot be undone.`;
        if (!confirm(confirmMessage)) return;
        
        // Delete from Firestore
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);
        
        // Note: We don't delete from Firebase Auth to preserve audit trail
        // The user account will remain but won't be able to access the system
        
        console.log(`🗑️ User deleted: ${userId}`);
        await logAuditEntry('user_delete', { userId });
        
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        alert('Error deleting user. Please try again.');
    }
}

// Bulk Operations
function bulkActions() {
    if (selectedUsers.length === 0) {
        alert('Please select one or more users to perform bulk actions.');
        return;
    }
    
    const action = prompt(`Selected ${selectedUsers.length} user(s).\n\nChoose action:\n1. Activate\n2. Deactivate\n3. Delete\n\nEnter number (1-3):`);
    
    switch (action) {
        case '1':
            bulkUpdateStatus('active');
            break;
        case '2':
            bulkUpdateStatus('inactive');
            break;
        case '3':
            bulkDelete();
            break;
        default:
            console.log('❌ Invalid bulk action selected');
    }
}

async function bulkUpdateStatus(status) {
    try {
        const confirmMessage = `Are you sure you want to ${status} ${selectedUsers.length} selected user(s)?`;
        if (!confirm(confirmMessage)) return;
        
        // Chunk writes to avoid exceeding Firestore 500 write limit
        const chunkSize = 450;
        for (let i = 0; i < selectedUsers.length; i += chunkSize) {
            const chunk = selectedUsers.slice(i, i + chunkSize);
            const batch = writeBatch(db);
            chunk.forEach(userId => {
                const userRef = doc(db, 'users', userId);
                batch.update(userRef, {
                    status: status,
                    updatedAt: serverTimestamp()
                });
            });
            await batch.commit();
            await logAuditEntry('bulk_user_status_update', { count: chunk.length, status });
        }
        
        console.log(`✅ Bulk status update completed: ${selectedUsers.length} users -> ${status}`);
        
        // Clear selections
        selectedUsers = [];
        updateUsersTable();
        
    } catch (error) {
        console.error('❌ Error in bulk status update:', error);
        alert('Error updating users. Please try again.');
    }
}

async function bulkDelete() {
    try {
        const confirmMessage = `Are you sure you want to delete ${selectedUsers.length} selected user(s)?\n\nThis action cannot be undone.`;
        if (!confirm(confirmMessage)) return;
        
        // Chunk deletes to avoid exceeding Firestore 500 write limit
        const chunkSize = 450;
        for (let i = 0; i < selectedUsers.length; i += chunkSize) {
            const chunk = selectedUsers.slice(i, i + chunkSize);
            const batch = writeBatch(db);
            chunk.forEach(userId => {
                const userRef = doc(db, 'users', userId);
                batch.delete(userRef);
            });
            await batch.commit();
            await logAuditEntry('bulk_user_delete', { count: chunk.length });
        }
        
        console.log(`🗑️ Bulk delete completed: ${selectedUsers.length} users deleted`);
        
        // Clear selections
        selectedUsers = [];
        updateUsersTable();
        
    } catch (error) {
        console.error('❌ Error in bulk delete:', error);
        alert('Error deleting users. Please try again.');
    }
}

// Send password reset email
async function sendPasswordReset(userId) {
    try {
        const user = users.find(u => u.id === userId);
        if (!user || !user.email) {
            alert('No email found for this user.');
            return;
        }
        if (!confirm(`Send password reset email to ${user.email}?`)) return;
        await auth.sendPasswordResetEmail(user.email);
        alert(`Password reset email sent to ${user.email}.`);
        console.log(`🔐 Password reset email sent to: ${user.email}`);
        await logAuditEntry('user_password_reset', { userId, email: user.email });
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        alert(`Error sending password reset: ${error.message}`);
    }
}

// Export Users
function exportUsers() {
    try {
        console.log('📊 Exporting users...');
        
        // Prepare CSV data
        const headers = ['Name', 'Email', 'Role', 'Factory', 'Status', 'Department', 'Phone', 'Created Date'];
        const csvData = [headers];
        
        const usersToExport = filteredUsers.length > 0 ? filteredUsers : users;
        
        usersToExport.forEach(user => {
            const row = [
                user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
                user.email || 'N/A',
                formatRole(user.role),
                getFactoryName(user.factoryId) || 'N/A',
                formatStatus(user.status || 'active'),
                user.department || 'N/A',
                user.phoneNumber || 'N/A',
                user.createdAt ? user.createdAt.toDate().toLocaleDateString() : 'N/A'
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
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`✅ Users exported: ${usersToExport.length} records`);
        
    } catch (error) {
        console.error('❌ Error exporting users:', error);
        alert('Error exporting users. Please try again.');
    }
}

// Utility Functions
function formatRole(role) {
    const roleMap = {
        'super_admin': 'Super Admin',
        'factory_admin': 'Factory Admin',
        'hr_staff': 'HR Staff',
        'auditor': 'Auditor',
        'worker': 'Worker'
    };
    return roleMap[role] || 'Unknown';
}

function formatStatus(status) {
    const statusMap = {
        'active': 'Active',
        'inactive': 'Inactive',
        'pending': 'Pending'
    };
    return statusMap[status] || 'Active';
}

function getUserInitials(user) {
    const name = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (!name) return user.email ? user.email[0].toUpperCase() : '?';
    
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function getFactoryName(factoryId) {
    if (!factoryId) return null;
    const factory = factories.find(f => f.id === factoryId);
    return factory ? factory.name : `Factory ${factoryId}`;
}

function formatTimeAgo(date) {
    if (!date) return 'Never';
    
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

function generateSecurePassword() {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
}

// Simple audit logging helper for this page
async function logAuditEntry(action, details) {
    try {
        const auditRef = collection(db, 'audit_log');
        await addDoc(auditRef, {
            action,
            details,
            actorId: auth.currentUser?.uid || null,
            actorEmail: auth.currentUser?.email || null,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.warn('Audit log failed:', error);
    }
}

function showTableLoading(show) {
    const loadingOverlay = document.getElementById('tableLoading');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
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

// Event Listeners Setup
function setupEventListeners() {
    // Close modal when clicking outside
    document.getElementById('userModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeUserModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('userModal')?.style.display === 'flex') {
            closeUserModal();
        }
    });
    
    // Form submission
    document.getElementById('userForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveUser();
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
        if (window.usersUnsubscribe) {
            window.usersUnsubscribe();
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
window.openCreateUserModal = openCreateUserModal;
window.closeUserModal = closeUserModal;
window.saveUser = saveUser;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.toggleUserStatus = toggleUserStatus;
window.handleSearch = handleSearch;
window.handleFilterChange = handleFilterChange;
window.clearFilters = clearFilters;
window.handleUserSelect = handleUserSelect;
window.handleSelectAll = handleSelectAll;
window.changePage = changePage;
window.handlePageSizeChange = handlePageSizeChange;
window.bulkActions = bulkActions;
window.exportUsers = exportUsers;
window.sendPasswordReset = sendPasswordReset;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.logout = logout;

// Debug functions
window.testUserManagement = function() {
    console.log('🧪 Testing User Management...');
    console.log('Firebase available:', !!window.Firebase);
    console.log('Users loaded:', users.length);
    console.log('Factories loaded:', factories.length);
    console.log('Current page:', currentPage);
    console.log('Filtered users:', filteredUsers.length);
    
    // Force reload sample data
    loadSampleUsers();
};

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (window.usersUnsubscribe) {
        window.usersUnsubscribe();
    }
});
}

// Start the initialization process
initializeUserManagement();
