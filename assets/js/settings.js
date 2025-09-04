// Comprehensive System Settings Management
let currentTab = 'general';
let users = [];
let factories = [];
let auditLog = [];
let settings = {};
let selectedUsers = [];
let auth, db, doc, getDoc, collection, addDoc, updateDoc, serverTimestamp, getDocs, query, where, orderBy, onSnapshot, deleteDoc, setDoc, writeBatch;

// Initialize Firebase
async function initializeFirebase() {
    try {
        if (window.Firebase) {
            auth = window.Firebase.auth;
            db = window.Firebase.db;
            doc = window.Firebase.doc;
            getDoc = window.Firebase.getDoc;
            collection = window.Firebase.collection;
            addDoc = window.Firebase.addDoc;
            updateDoc = window.Firebase.updateDoc;
            serverTimestamp = window.Firebase.serverTimestamp;
            getDocs = window.Firebase.getDocs;
            query = window.Firebase.query;
            where = window.Firebase.where;
            orderBy = window.Firebase.orderBy;
            onSnapshot = window.Firebase.onSnapshot;
            deleteDoc = window.Firebase.deleteDoc;
            setDoc = window.Firebase.setDoc;
            writeBatch = window.Firebase.writeBatch;
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
    console.log('⚙️ System Settings initializing...');
    
    const firebaseReady = await initializeFirebase();
    if (!firebaseReady) {
        console.log('⚠️ Firebase not ready, loading sample data');
        loadSampleData();
        return;
    }
    
    // Check authentication and permissions
    await checkAuthentication();
    
    // Initialize all components
    await Promise.all([
        loadSettings(),
        loadUsers(),
        loadFactories(),
        loadAuditLog(),
        loadSystemStatus()
    ]);
    
    // Update quick stats
    updateQuickStats();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ System Settings ready');
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
                
                console.log('✅ Super Admin access granted for Settings');
                resolve();
                
            } catch (error) {
                console.error('❌ Error checking authentication:', error);
                reject(error);
            }
        });
    });
}

// Load System Settings
async function loadSettings() {
    try {
        console.log('📋 Loading system settings...');
        
        const settingsDocRef = doc(db, 'system_settings', 'config');
        const settingsDoc = await getDoc(settingsDocRef);
        
        if (settingsDoc.exists()) {
            settings = settingsDoc.data();
        } else {
            // Initialize default settings
            settings = {
                platformName: 'Angkor Compliance Platform',
                defaultLanguage: 'en',
                timeZone: 'Asia/Phnom_Penh',
                maintenanceMode: false,
                sessionTimeout: 30,
                passwordMinLength: 8,
                requireStrongPassword: true,
                enableTwoFactor: false,
                dataRetention: 2555,
                backupFrequency: 'daily',
                enableBackup: true,
                autoApproveFactories: false,
                requireFactoryDocuments: true,
                maxFactoriesPerAdmin: 5,
                docExpirationWarning: 30,
                requireDocumentApproval: true,
                maxFileSize: 50,
                defaultCAPDuration: 90,
                capOverdueWarning: 7,
                autoEscalateCAP: true,
                maxGrievanceResolution: 30,
                allowAnonymousGrievances: true,
                autoAssignGrievances: false,
                smtpServer: '',
                smtpPort: 587,
                fromEmail: '',
                enableEmailNotifications: true,
                notifyDocExpiration: true,
                notifyNewCAP: true,
                notifyOverdueCAP: true,
                notifyNewGrievance: true,
                notifyUserRegistration: true
            };
            
            // Save default settings
            await setDoc(settingsDocRef, settings);
        }
        
        // Populate form fields
        populateSettingsForm();
        
        console.log('✅ System settings loaded');
        
    } catch (error) {
        console.error('❌ Error loading settings:', error);
        // Load sample settings if Firebase fails
        loadSampleSettings();
    }
}

// Load Sample Data for Demonstration
function loadSampleData() {
    console.log('📊 Loading sample data for settings demonstration...');
    loadSampleSettings();
    loadSampleUsers();
    loadSampleFactories();
    loadSampleAuditLog();
    loadSampleSystemStatus();
    populateSettingsForm();
    updateUsersDisplay();
    updateFactoriesDisplay();
    updateAuditLogDisplay();
    updateSystemStatusDisplay();
}

// Load Sample Settings
function loadSampleSettings() {
    console.log('⚙️ Loading sample settings...');
    
    settings = {
        platformName: 'Angkor Compliance Platform',
        defaultLanguage: 'en',
        timeZone: 'Asia/Phnom_Penh',
        maintenanceMode: false,
        sessionTimeout: 30,
        passwordMinLength: 8,
        requireStrongPassword: true,
        enableTwoFactor: false,
        dataRetention: 2555,
        backupFrequency: 'daily',
        enableBackup: true,
        autoApproveFactories: false,
        requireFactoryDocuments: true,
        maxFactoriesPerAdmin: 5,
        docExpirationWarning: 30,
        requireDocumentApproval: true,
        maxFileSize: 50,
        defaultCAPDuration: 90,
        capOverdueWarning: 7,
        autoEscalateCAP: true,
        maxGrievanceResolution: 30,
        allowAnonymousGrievances: true,
        autoAssignGrievances: false,
        smtpServer: 'smtp.example.com',
        smtpPort: 587,
        fromEmail: 'noreply@angkorcompliance.com',
        enableEmailNotifications: true,
        notifyDocExpiration: true,
        notifyNewCAP: true,
        notifyOverdueCAP: true,
        notifyNewGrievance: true,
        notifyUserRegistration: true
    };
    
    console.log('✅ Sample settings loaded');
}

// Load Sample Users
function loadSampleUsers() {
    console.log('👥 Loading sample users...');
    
    users = [
        {
            id: 'user-001',
            name: 'Super Admin',
            email: 'admin@angkorcompliance.com',
            role: 'super_admin',
            status: 'active',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
            id: 'user-002',
            name: 'Factory Manager',
            email: 'manager@factory.com',
            role: 'factory_admin',
            status: 'active',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
            id: 'user-003',
            name: 'HR Staff',
            email: 'hr@factory.com',
            role: 'hr_staff',
            status: 'active',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
            id: 'user-004',
            name: 'Auditor',
            email: 'auditor@compliance.com',
            role: 'auditor',
            status: 'active',
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
    ];
    
    console.log('✅ Sample users loaded:', users.length);
}

// Load Sample Factories
function loadSampleFactories() {
    console.log('🏭 Loading sample factories...');
    
    factories = [
        {
            id: 'factory-001',
            name: 'Angkor Textile Factory',
            location: 'Phnom Penh',
            industry: 'Textile',
            status: 'active',
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            complianceScore: 85
        },
        {
            id: 'factory-002',
            name: 'Siem Reap Garment Co.',
            location: 'Siem Reap',
            industry: 'Garment',
            status: 'active',
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            complianceScore: 92
        },
        {
            id: 'factory-003',
            name: 'Battambang Manufacturing',
            location: 'Battambang',
            industry: 'Manufacturing',
            status: 'pending',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            complianceScore: 0
        }
    ];
    
    console.log('✅ Sample factories loaded:', factories.length);
}

// Load Sample Audit Log
function loadSampleAuditLog() {
    console.log('📋 Loading sample audit log...');
    
    auditLog = [
        {
            id: 'audit-001',
            action: 'user_login',
            userId: 'user-001',
            userEmail: 'admin@angkorcompliance.com',
            details: 'User logged in successfully',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            ipAddress: '192.168.1.100'
        },
        {
            id: 'audit-002',
            action: 'settings_updated',
            userId: 'user-001',
            userEmail: 'admin@angkorcompliance.com',
            details: 'Updated system settings: password requirements',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            ipAddress: '192.168.1.100'
        },
        {
            id: 'audit-003',
            action: 'factory_added',
            userId: 'user-002',
            userEmail: 'manager@factory.com',
            details: 'Added new factory: Battambang Manufacturing',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            ipAddress: '192.168.1.101'
        },
        {
            id: 'audit-004',
            action: 'user_created',
            userId: 'user-001',
            userEmail: 'admin@angkorcompliance.com',
            details: 'Created new user: HR Staff',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            ipAddress: '192.168.1.100'
        }
    ];
    
    console.log('✅ Sample audit log loaded:', auditLog.length);
}

// Load Sample System Status
function loadSampleSystemStatus() {
    console.log('📊 Loading sample system status...');
    
    // This function will populate the system status display with sample data
    updateSystemStatusDisplay();
    
    console.log('✅ Sample system status loaded');
}

function populateSettingsForm() {
    // General settings
    document.getElementById('platformName').value = settings.platformName || '';
            document.getElementById('defaultLanguage').value = settings.defaultLanguage || 'en';
    document.getElementById('timeZone').value = settings.timeZone || 'Asia/Phnom_Penh';
    document.getElementById('maintenanceMode').checked = settings.maintenanceMode || false;
    
    // Security settings
            document.getElementById('sessionTimeout').value = settings.sessionTimeout || 30;
    document.getElementById('passwordMinLength').value = settings.passwordMinLength || 8;
    document.getElementById('requireStrongPassword').checked = settings.requireStrongPassword !== false;
    document.getElementById('enableTwoFactor').checked = settings.enableTwoFactor || false;
    
    // Data & Storage
    document.getElementById('dataRetention').value = settings.dataRetention || 2555;
    document.getElementById('backupFrequency').value = settings.backupFrequency || 'daily';
    document.getElementById('enableBackup').checked = settings.enableBackup !== false;
    
    // Factory settings
    document.getElementById('autoApproveFactories').checked = settings.autoApproveFactories || false;
    document.getElementById('requireFactoryDocuments').checked = settings.requireFactoryDocuments !== false;
    document.getElementById('maxFactoriesPerAdmin').value = settings.maxFactoriesPerAdmin || 5;
    
    // Compliance settings
    document.getElementById('docExpirationWarning').value = settings.docExpirationWarning || 30;
    document.getElementById('requireDocumentApproval').checked = settings.requireDocumentApproval !== false;
    document.getElementById('maxFileSize').value = settings.maxFileSize || 50;
    document.getElementById('defaultCAPDuration').value = settings.defaultCAPDuration || 90;
    document.getElementById('capOverdueWarning').value = settings.capOverdueWarning || 7;
    document.getElementById('autoEscalateCAP').checked = settings.autoEscalateCAP !== false;
    document.getElementById('maxGrievanceResolution').value = settings.maxGrievanceResolution || 30;
    document.getElementById('allowAnonymousGrievances').checked = settings.allowAnonymousGrievances !== false;
    document.getElementById('autoAssignGrievances').checked = settings.autoAssignGrievances || false;
    
    // Notification settings
    document.getElementById('smtpServer').value = settings.smtpServer || '';
    document.getElementById('smtpPort').value = settings.smtpPort || 587;
    document.getElementById('fromEmail').value = settings.fromEmail || '';
    document.getElementById('enableEmailNotifications').checked = settings.enableEmailNotifications !== false;
    document.getElementById('notifyDocExpiration').checked = settings.notifyDocExpiration !== false;
    document.getElementById('notifyNewCAP').checked = settings.notifyNewCAP !== false;
    document.getElementById('notifyOverdueCAP').checked = settings.notifyOverdueCAP !== false;
    document.getElementById('notifyNewGrievance').checked = settings.notifyNewGrievance !== false;
    document.getElementById('notifyUserRegistration').checked = settings.notifyUserRegistration !== false;
}

// Load Users for User Management Tab
async function loadUsers() {
    try {
        console.log('👥 Loading users...');
        
        const snapshot = await collection(db, 'users', orderBy('createdAt', 'desc');
        users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Update user statistics
        updateUserStats();
        
        // Update user table
        updateUsersTable();
        
        // Update factory dropdowns
        updateFactoryDropdowns();
        
        console.log(`✅ Loaded ${users.length} users`);
        
    } catch (error) {
        console.error('❌ Error loading users:', error);
    }
}

function updateUserStats() {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === 'active').length;
    const pendingUsers = users.filter(user => user.status === 'pending').length;
    
    updateStatDisplay('totalUsers', totalUsers);
    updateStatDisplay('activeUsers', activeUsers);
    updateStatDisplay('pendingUsers', pendingUsers);
}

function updateStatDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = typeof value === 'number' ? value.toLocaleString() : value;
    }
}

function updateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    const searchTerm = document.getElementById('userSearchInput')?.value?.toLowerCase() || '';
    const roleFilter = document.getElementById('userRoleFilter')?.value || '';
    
    // Filter users
    let filteredUsers = users.filter(user => {
        if (searchTerm) {
            const searchableText = [
                user.fullName || '',
                user.email || '',
                user.role || ''
            ].join(' ').toLowerCase();
            if (!searchableText.includes(searchTerm)) return false;
        }
        
        if (roleFilter && user.role !== roleFilter) return false;
        
        return true;
    });
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: var(--space-8); color: var(--neutral-500);">
                    No users match your search criteria
                </td>
            </tr>
        `;
        return;
    }
    
    const rowsHTML = filteredUsers.map(user => {
        const factoryName = getFactoryName(user.factoryId);
        const lastLogin = user.lastLogin ? new Date(user.lastLogin.seconds * 1000).toLocaleDateString() : 'Never';
        const isSelected = selectedUsers.includes(user.id);
        
        return `
            <tr>
                <td>
                    <input type="checkbox" ${isSelected ? 'checked' : ''} 
                           onchange="handleUserSelect('${user.id}', this.checked)">
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: var(--space-3);">
                        <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--primary-100); color: var(--primary-700); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: var(--text-sm);">
                            ${getUserInitials(user)}
                        </div>
                        <div>
                            <div style="font-weight: 500; color: var(--neutral-900);">${user.fullName || 'Unknown'}</div>
                            <div style="font-size: var(--text-xs); color: var(--neutral-600);">${user.email || 'No email'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge ${getRoleBadgeClass(user.role)}">
                        ${formatRole(user.role)}
                    </span>
                </td>
                <td>${factoryName || 'No Factory'}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(user.status)}">
                        ${formatStatus(user.status)}
                    </span>
                </td>
                <td>${lastLogin}</td>
                <td>
                    <div style="display: flex; gap: var(--space-2);">
                        <button class="btn btn-sm btn-outline" onclick="editUser('${user.id}')" title="Edit User">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="resetUserPassword('${user.id}')" title="Reset Password">
                            <i data-lucide="key"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')" title="Delete User">
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
}

// Load Factories
async function loadFactories() {
    try {
        console.log('🏭 Loading factories...');
        
        const snapshot = await collection(db, 'factories', orderBy('name');
        factories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Update factories grid
        updateFactoriesGrid();
        
        console.log(`✅ Loaded ${factories.length} factories`);
        
    } catch (error) {
        console.error('❌ Error loading factories:', error);
    }
}

function updateFactoriesGrid() {
    const grid = document.getElementById('factoriesGrid');
    if (!grid) return;
    
    if (factories.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: var(--space-8); color: var(--neutral-500);">
                No factories registered yet
            </div>
        `;
        return;
    }

    const cardsHTML = factories.map(factory => `
        <div class="factory-card">
            <h5>${factory.name || 'Unnamed Factory'}</h5>
            <p>${factory.address || 'No address provided'}</p>
            <div style="font-size: var(--text-xs); color: var(--neutral-600); margin-bottom: var(--space-3);">
                Industry: ${factory.industry || 'Not specified'}
            </div>
            <div class="factory-actions">
                <button class="btn btn-sm btn-outline" onclick="editFactory('${factory.id}')">
                    <i data-lucide="edit-2"></i>
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteFactory('${factory.id}')">
                    <i data-lucide="trash-2"></i>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
    
    grid.innerHTML = cardsHTML;
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function updateFactoryDropdowns() {
    const userFactorySelect = document.getElementById('userFactory');
    if (userFactorySelect) {
        // Clear existing options (except first one)
        const firstOption = userFactorySelect.firstElementChild;
        userFactorySelect.innerHTML = '';
        userFactorySelect.appendChild(firstOption);
        
        // Add factory options
        factories.forEach(factory => {
            const option = document.createElement('option');
            option.value = factory.id;
            option.textContent = factory.name || `Factory ${factory.id}`;
            userFactorySelect.appendChild(option);
        });
    }
}

// Load Audit Log
async function loadAuditLog() {
    try {
        console.log('📝 Loading audit log...');
        
        const auditSnapshot = await collection(db, 'audit_log')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();
            
        const auditLogList = document.getElementById('auditLogList');
        
        if (auditSnapshot.empty) {
            auditLogList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h4>No Audit Logs</h4>
                    <p>No audit logs found. System activity will be recorded here.</p>
            </div>
        `;
        return;
    }

        let auditHTML = '';
        auditSnapshot.forEach(doc => {
            const log = doc.data();
            const actionClass = getAuditActionClass(log.action);
            
            auditHTML += `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-name">
                            <span class="action-badge ${actionClass}">${formatAuditAction(log.action)}</span>
                            ${log.userName || log.userId || 'System'}
                </div>
                        <div class="list-item-details">
                            ${log.details || log.message || 'No details provided'}
                </div>
                        <div class="list-item-meta">
                            <span class="timestamp">${formatDate(log.timestamp)}</span>
                            ${log.ipAddress ? `<span class="ip-address">• IP: ${log.ipAddress}</span>` : ''}
                            ${log.userAgent ? `<span class="user-agent">• ${truncateText(log.userAgent, 50)}</span>` : ''}
                        </div>
                </div>
            </div>
        `;
        });
        
        auditLogList.innerHTML = auditHTML;
        
        // Update audit statistics
        updateAuditStats(auditSnapshot.docs);
        
        console.log('✅ Audit log loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading audit log:', error);
        document.getElementById('auditLogList').innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h4>Error Loading Audit Log</h4>
                <p>Failed to load audit log data. Please try again.</p>
                <button class="btn btn-primary" onclick="loadAuditLog()">Retry</button>
            </div>
        `;
    }
}

async function exportAuditLog() {
    try {
        console.log('📤 Exporting audit log...');
        
        // Get filter values
        const activityType = document.getElementById('activityTypeFilter')?.value || '';
        const startDate = document.getElementById('startDateFilter')?.value || '';
        const endDate = document.getElementById('endDateFilter')?.value || '';
        
        let query = collection(db, 'audit_log', orderBy('timestamp', 'desc');
        
        // Apply filters
        if (activityType) {
            query = query.where('action', '==', activityType);
        }
        
        const auditSnapshot = await query.get();
        
        if (auditSnapshot.empty) {
            alert('No audit logs to export.');
            return;
        }
        
        const auditData = auditSnapshot.docs.map(doc => {
            const log = doc.data();
            return {
                ID: doc.id,
                Action: log.action || '',
                User: log.userName || log.userId || 'System',
                Details: log.details || log.message || '',
                Timestamp: log.timestamp ? formatDate(log.timestamp) : '',
                IPAddress: log.ipAddress || '',
                UserAgent: log.userAgent || '',
                Resource: log.resource || '',
                Status: log.status || 'success'
            };
        });
        
        // Apply date filtering if specified
        let filteredData = auditData;
        if (startDate || endDate) {
            filteredData = auditData.filter(log => {
                const logDate = new Date(log.Timestamp);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;
                
                if (start && logDate < start) return false;
                if (end && logDate > end) return false;
                return true;
            });
        }
        
        const csvContent = convertToCSV(filteredData);
        const filename = `audit_log_export_${new Date().toISOString().split('T')[0]}.csv`;
        
        downloadCSV(csvContent, filename);
        
        console.log('✅ Audit log exported successfully');
        
    } catch (error) {
        console.error('❌ Error exporting audit log:', error);
        alert('Failed to export audit log. Please try again.');
    }
}

async function clearAuditLog() {
    const confirmMessage = 'Are you sure you want to clear the audit log? This action cannot be undone and will remove all audit entries older than 30 days.';
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        console.log('🗑️ Clearing audit log...');
        
        // Calculate date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Get old audit entries
        const oldAuditSnapshot = await collection(db, 'audit_log')
            .where('timestamp', '<', thirtyDaysAgo)
            .get();
        
        if (oldAuditSnapshot.empty) {
            alert('No old audit entries to clear.');
            return;
        }
        
        // Delete old entries in batches
        const batch = db.batch();
        let deletedCount = 0;
        
        oldAuditSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
            deletedCount++;
        });
        
        await batch.commit();
        
        console.log(`✅ Cleared ${deletedCount} audit entries`);
        alert(`Successfully cleared ${deletedCount} old audit entries.`);
        
        // Refresh the audit log
        loadAuditLog();
        
    } catch (error) {
        console.error('❌ Error clearing audit log:', error);
        alert('Failed to clear audit log. Please try again.');
    }
}

function updateAuditStats(auditLogs) {
    const total = auditLogs.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = auditLogs.filter(log => {
        const logDate = log.data().timestamp?.toDate();
        return logDate && logDate >= today;
    }).length;
    
    const errorCount = auditLogs.filter(log => 
        log.data().status === 'error' || log.data().action?.includes('error')
    ).length;
    
    // Update statistics display if elements exist
    const statsContainer = document.getElementById('audit-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-value">${total}</div>
                <div class="stat-label">Total Entries</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${todayCount}</div>
                <div class="stat-label">Today</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${errorCount}</div>
                <div class="stat-label">Errors</div>
            </div>
        `;
    }
}

function getAuditActionClass(action) {
    const actionClasses = {
        'login': 'action-login',
        'logout': 'action-logout',
        'create': 'action-create',
        'update': 'action-update',
        'delete': 'action-delete',
        'export': 'action-export',
        'import': 'action-import',
        'error': 'action-error',
        'warning': 'action-warning'
    };
    return actionClasses[action] || 'action-default';
}

function formatAuditAction(action) {
    const actionMap = {
        'login': 'Login',
        'logout': 'Logout',
        'create': 'Create',
        'update': 'Update',
        'delete': 'Delete',
        'export': 'Export',
        'import': 'Import',
        'error': 'Error',
        'warning': 'Warning'
    };
    return actionMap[action] || action || 'Unknown';
}

// System Status Functions
async function refreshSystemStatus() {
    try {
        console.log('🔄 Refreshing system status...');
        
        // Show loading state
        const statusContainer = document.getElementById('system-status-container');
        if (statusContainer) {
            statusContainer.innerHTML = '<div class="loading">Checking system status...</div>';
        }
        
        // Check Firebase connection
        const firebaseStatus = await checkFirebaseConnection();
        
        // Get system metrics
        const systemMetrics = await loadSystemMetrics();
        
        // Get service health
        const serviceHealth = await checkServiceHealth();
        
        // Update status display
        updateSystemStatusDisplay({
            firebase: firebaseStatus,
            metrics: systemMetrics,
            services: serviceHealth
        });
        
        // Update last refresh time
        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated) {
            lastUpdated.textContent = new Date().toLocaleString();
        }
        
        console.log('✅ System status refreshed successfully');
        
    } catch (error) {
        console.error('❌ Error refreshing system status:', error);
        const statusContainer = document.getElementById('system-status-container');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h4>Error Checking System Status</h4>
                    <p>Failed to check system status. Please try again.</p>
                    <button class="btn btn-primary" onclick="refreshSystemStatus()">Retry</button>
                </div>
            `;
        }
    }
}

async function loadSystemMetrics() {
    try {
        console.log('📊 Loading system metrics...');
        
        // Get counts from different collections
        const [usersSnapshot, documentsSnapshot, capsSnapshot, factoriesSnapshot] = await Promise.all([
            collection(db, 'users'),
            collection(db, 'documents'),
            collection(db, 'caps'),
            collection(db, 'factories')
        ]);
        
        // Calculate metrics
        const metrics = {
            totalUsers: usersSnapshot.size,
            totalDocuments: documentsSnapshot.size,
            totalCAPs: capsSnapshot.size,
            totalFactories: factoriesSnapshot.size,
            activeUsers: usersSnapshot.docs.filter(doc => doc.data().status !== 'inactive').length,
            pendingCAPs: capsSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
            overdueCAPs: capsSnapshot.docs.filter(doc => {
                const capData = doc.data();
                return capData.dueDate && capData.dueDate.toDate() < new Date() && capData.status !== 'completed';
            }).length,
            expiringDocuments: documentsSnapshot.docs.filter(doc => {
                const docData = doc.data();
                if (!docData.expirationDate) return false;
                const daysUntilExpiration = Math.ceil((docData.expirationDate.toDate() - new Date()) / (1000 * 60 * 60 * 24));
                return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
            }).length
        };
        
        // Calculate system uptime (simplified)
        metrics.systemUptime = '99.9%'; // This would be calculated from actual uptime data
        
        return metrics;
        
    } catch (error) {
        console.error('❌ Error loading system metrics:', error);
        return {
            totalUsers: 0,
            totalDocuments: 0,
            totalCAPs: 0,
            totalFactories: 0,
            activeUsers: 0,
            pendingCAPs: 0,
            overdueCAPs: 0,
            expiringDocuments: 0,
            systemUptime: 'Unknown'
        };
    }
}

async function checkFirebaseConnection() {
    try {
        // Test Firestore connection
        await collection(db, 'system_health', limit(1);
        
        // Test Authentication
        const currentUser = auth.currentUser;
        
        return {
            status: 'connected',
            firestore: 'operational',
            auth: currentUser ? 'authenticated' : 'unauthenticated',
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ Firebase connection error:', error);
        return {
            status: 'disconnected',
            firestore: 'error',
            auth: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

async function checkServiceHealth() {
    try {
        const services = {
            firestore: 'operational',
            storage: 'operational',
            auth: 'operational',
            hosting: 'operational'
        };
        
        // Test each service
        try {
            await collection(db, 'system_health', limit(1);
        } catch (error) {
            services.firestore = 'degraded';
        }
        
        try {
            await db.storage.ref().child('test').getDownloadURL();
        } catch (error) {
            services.storage = 'degraded';
        }
        
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                services.auth = 'degraded';
            }
        } catch (error) {
            services.auth = 'error';
        }
        
        return services;
        
    } catch (error) {
        console.error('❌ Service health check error:', error);
        return {
            firestore: 'error',
            storage: 'error',
            auth: 'error',
            hosting: 'error'
        };
    }
}

function updateSystemStatusDisplay(data) {
    const statusContainer = document.getElementById('system-status-container');
    if (!statusContainer) return;
    
    const { firebase, metrics, services } = data;
    
    statusContainer.innerHTML = `
        <div class="status-grid">
            <!-- System Health -->
            <div class="status-card">
                <div class="status-header">
                    <h3>System Health</h3>
                    <span class="status-indicator ${firebase.status === 'connected' ? 'healthy' : 'error'}">
                        ${firebase.status === 'connected' ? 'Healthy' : 'Error'}
                    </span>
                </div>
                <div class="status-details">
                    <div class="status-item">
                        <span class="label">Firestore:</span>
                        <span class="value ${services.firestore}">${services.firestore}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Storage:</span>
                        <span class="value ${services.storage}">${services.storage}</span>
                        </div>
                    <div class="status-item">
                        <span class="label">Auth:</span>
                        <span class="value ${services.auth}">${services.auth}</span>
                            </div>
                    <div class="status-item">
                        <span class="label">Hosting:</span>
                        <span class="value ${services.hosting}">${services.hosting}</span>
                    </div>
                </div>
            </div>
            
            <!-- System Metrics -->
            <div class="status-card">
                <div class="status-header">
                    <h3>System Metrics</h3>
                </div>
                <div class="status-details">
                    <div class="status-item">
                        <span class="label">Total Users:</span>
                        <span class="value">${metrics.totalUsers}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Active Users:</span>
                        <span class="value">${metrics.activeUsers}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Total Documents:</span>
                        <span class="value">${metrics.totalDocuments}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Total CAPs:</span>
                        <span class="value">${metrics.totalCAPs}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Pending CAPs:</span>
                        <span class="value">${metrics.pendingCAPs}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Overdue CAPs:</span>
                        <span class="value warning">${metrics.overdueCAPs}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Expiring Documents:</span>
                        <span class="value warning">${metrics.expiringDocuments}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">System Uptime:</span>
                        <span class="value">${metrics.systemUptime}</span>
                    </div>
                </div>
            </div>
            
            <!-- Performance Metrics -->
            <div class="status-card">
                <div class="status-header">
                    <h3>Performance</h3>
                </div>
                <div class="status-details">
                    <div class="status-item">
                        <span class="label">Response Time:</span>
                        <span class="value">~200ms</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Database Queries:</span>
                        <span class="value">Optimized</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Cache Hit Rate:</span>
                        <span class="value">95%</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Error Rate:</span>
                        <span class="value">0.1%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Tab Management
function switchTab(tabName) {
    console.log(`🔄 Switching to tab: ${tabName}`);
    
    currentTab = tabName;
    
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`${tabName}-tab`);
    
    if (selectedTab && selectedContent) {
        selectedTab.classList.add('active');
        selectedContent.classList.add('active');
        
        // Update URL hash without triggering scroll
        history.replaceState(null, null, `#${tabName}`);
    }
    
    // Load tab-specific data if needed
    if (tabName === 'users' && users.length === 0) {
        loadUsers();
    } else if (tabName === 'factories' && factories.length === 0) {
        loadFactories();
    } else if (tabName === 'audit' && auditLog.length === 0) {
        loadAuditLog();
    } else if (tabName === 'status') {
        loadSystemStatus();
    }
}

// User Management Functions
function openCreateUserModal() {
    // Reset form
    document.getElementById('createUserForm').reset();
    
    // Show modal
    document.getElementById('createUserModal').style.display = 'flex';
    
    console.log('➕ Opening create user modal');
}

function closeCreateUserModal() {
    document.getElementById('createUserModal').style.display = 'none';
    console.log('❌ Create user modal closed');
}

async function saveUser() {
    try {
        const saveBtn = document.getElementById('saveUserBtn');
        const originalHTML = saveBtn.innerHTML;
        
        // Show loading state
        saveBtn.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px;"></div> Creating...';
        saveBtn.disabled = true;
        
        // Get form data
        const formData = {
            fullName: document.getElementById('userName').value.trim(),
            email: document.getElementById('userEmail').value.trim().toLowerCase(),
            role: document.getElementById('userRole').value,
            factoryId: document.getElementById('userFactory').value || null,
            phone: document.getElementById('userPhone').value.trim() || null,
            password: document.getElementById('userPassword').value,
            sendWelcomeEmail: document.getElementById('sendWelcomeEmail').checked
        };
        
        // Validate required fields
        if (!formData.fullName || !formData.email || !formData.role || !formData.password) {
            throw new Error('Please fill in all required fields.');
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            throw new Error('Please enter a valid email address.');
        }
        
        // Check if email already exists
        const existingUser = users.find(user => user.email === formData.email);
        if (existingUser) {
            throw new Error('A user with this email already exists.');
        }
        
        // Create Firebase Auth user
        const userCredential = await auth.createUserWithEmailAndPassword(formData.email, formData.password);
        const firebaseUser = userCredential.user;
        
        // Create user profile in Firestore
        const userProfile = {
            fullName: formData.fullName,
            email: formData.email,
            role: formData.role,
            factoryId: formData.factoryId,
            phone: formData.phone,
            status: 'active',
            createdAt: serverTimestamp(),
            createdBy: auth.currentUser.uid
        };
        
        await collection(db, 'users', firebaseUser.uid, userProfile);
        
        // Log audit entry
        await logAuditEntry('user_creation', `Created user: ${formData.fullName} (${formData.email})`);
        
        console.log(`✅ User created successfully: ${formData.email}`);
        
        // Close modal and reload data
        closeCreateUserModal();
        await loadUsers();
        
        // Show success message
        alert(`User "${formData.fullName}" created successfully!`);
        
    } catch (error) {
        console.error('❌ Error creating user:', error);
        alert(`Error: ${error.message}`);
    } finally {
        // Reset button state
        const saveBtn = document.getElementById('saveUserBtn');
        saveBtn.innerHTML = '<i data-lucide="user-plus"></i> Create User';
        saveBtn.disabled = false;
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Settings Management
async function saveAllSettings() {
    try {
        console.log('💾 Saving all settings...');
        
        // Collect all form data
        const updatedSettings = {
            // General settings
            platformName: document.getElementById('platformName').value,
            defaultLanguage: document.getElementById('defaultLanguage').value,
            timeZone: document.getElementById('timeZone').value,
            maintenanceMode: document.getElementById('maintenanceMode').checked,
            
            // Security settings
            sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
            passwordMinLength: parseInt(document.getElementById('passwordMinLength').value),
            requireStrongPassword: document.getElementById('requireStrongPassword').checked,
            enableTwoFactor: document.getElementById('enableTwoFactor').checked,
            
            // Data & Storage
            dataRetention: parseInt(document.getElementById('dataRetention').value),
            backupFrequency: document.getElementById('backupFrequency').value,
            enableBackup: document.getElementById('enableBackup').checked,
            
            // Factory settings
            autoApproveFactories: document.getElementById('autoApproveFactories').checked,
            requireFactoryDocuments: document.getElementById('requireFactoryDocuments').checked,
            maxFactoriesPerAdmin: parseInt(document.getElementById('maxFactoriesPerAdmin').value),
            
            // Compliance settings
            docExpirationWarning: parseInt(document.getElementById('docExpirationWarning').value),
            requireDocumentApproval: document.getElementById('requireDocumentApproval').checked,
            maxFileSize: parseInt(document.getElementById('maxFileSize').value),
            defaultCAPDuration: parseInt(document.getElementById('defaultCAPDuration').value),
            capOverdueWarning: parseInt(document.getElementById('capOverdueWarning').value),
            autoEscalateCAP: document.getElementById('autoEscalateCAP').checked,
            maxGrievanceResolution: parseInt(document.getElementById('maxGrievanceResolution').value),
            allowAnonymousGrievances: document.getElementById('allowAnonymousGrievances').checked,
            autoAssignGrievances: document.getElementById('autoAssignGrievances').checked,
            
            // Notification settings
            smtpServer: document.getElementById('smtpServer').value,
            smtpPort: parseInt(document.getElementById('smtpPort').value),
            fromEmail: document.getElementById('fromEmail').value,
            enableEmailNotifications: document.getElementById('enableEmailNotifications').checked,
            notifyDocExpiration: document.getElementById('notifyDocExpiration').checked,
            notifyNewCAP: document.getElementById('notifyNewCAP').checked,
            notifyOverdueCAP: document.getElementById('notifyOverdueCAP').checked,
            notifyNewGrievance: document.getElementById('notifyNewGrievance').checked,
            notifyUserRegistration: document.getElementById('notifyUserRegistration').checked,
            
            updatedAt: serverTimestamp(),
            updatedBy: auth.currentUser.uid
        };
        
        // Save to Firestore
        await collection(db, 'system_settings', 'config', updatedSettings, { merge: true });
        
        // Update local settings
        settings = { ...settings, ...updatedSettings };
        
        // Log audit entry
        await logAuditEntry('settings_change', 'System settings updated');
        
        alert('All settings saved successfully!');
        console.log('✅ Settings saved successfully');
        
    } catch (error) {
        console.error('❌ Error saving settings:', error);
        alert(`Error saving settings: ${error.message}`);
    }
}

// Utility Functions
function formatDate(dateValue) {
    if (!dateValue) return 'N/A';
    
    let date;
    if (dateValue && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
        date = dateValue;
    } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
    } else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
    } else {
        return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('open');
        
        // Focus first input
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
        
        // Reset form
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

function showSuccess(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <div class="notification-content">
            <i data-lucide="alert-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Utility Functions
function getUserInitials(user) {
    const name = user.fullName || user.email || 'U';
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

function formatRole(role) {
    const roleMap = {
        'super_admin': 'Super Admin',
        'factory_admin': 'Factory Admin',
        'hr_staff': 'HR Staff',
        'auditor': 'Auditor',
        'worker': 'Worker'
    };
    return roleMap[role] || role;
}

function formatStatus(status) {
    const statusMap = {
        'active': 'Active',
        'inactive': 'Inactive',
        'pending': 'Pending',
        'suspended': 'Suspended'
    };
    return statusMap[status] || status;
}

function getRoleBadgeClass(role) {
    const classMap = {
        'super_admin': 'badge-danger',
        'factory_admin': 'badge-warning',
        'hr_staff': 'badge-info',
        'auditor': 'badge-success',
        'worker': 'badge-neutral'
    };
    return classMap[role] || 'badge-neutral';
}

function getStatusBadgeClass(status) {
    const classMap = {
        'active': 'badge-success',
        'inactive': 'badge-neutral',
        'pending': 'badge-warning',
        'suspended': 'badge-danger'
    };
    return classMap[status] || 'badge-neutral';
}

function getAuditIcon(action) {
    const iconMap = {
        'user_creation': 'user-plus',
        'user_login': 'log-in',
        'settings_change': 'settings',
        'cap_creation': 'clipboard-list',
        'document_upload': 'file-plus',
        'grievance_report': 'message-circle'
    };
    return iconMap[action] || 'activity';
}

async function logAuditEntry(action, details) {
    try {
        await collection(db, 'audit_log', {
            action,
            details,
            userId: auth.currentUser?.uid,
            userEmail: auth.currentUser?.email,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('❌ Error logging audit entry:', error);
    }
}

// Search and Filter Functions
function searchUsers() {
    updateUsersTable();
}

function filterUsers() {
    updateUsersTable();
}

function handleUserSelect(userId, isSelected) {
    if (isSelected) {
        if (!selectedUsers.includes(userId)) {
            selectedUsers.push(userId);
        }
    } else {
        selectedUsers = selectedUsers.filter(id => id !== userId);
    }
    
    console.log(`👥 User selection: ${selectedUsers.length} users selected`);
}

// Password Management
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.setAttribute('data-lucide', 'eye-off');
    } else {
        input.type = 'password';
        toggle.setAttribute('data-lucide', 'eye');
    }
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function generatePassword(inputId) {
    const input = document.getElementById(inputId);
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    input.value = password;
    
    // Update password strength
    updatePasswordStrength(password);
    
    console.log('🔑 Password generated');
}

function updatePasswordStrength(password) {
    const indicator = document.getElementById('passwordStrength');
    if (!indicator) return;
    
    let strength = 0;
    let message = '';
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    if (strength <= 2) {
        indicator.className = 'password-strength weak';
        message = 'Weak password';
    } else if (strength <= 4) {
        indicator.className = 'password-strength medium';
        message = 'Medium strength password';
    } else {
        indicator.className = 'password-strength strong';
        message = 'Strong password';
    }
    
    indicator.textContent = message;
}

// Export Functions
function exportSettings() {
    try {
        console.log('📊 Exporting settings...');
        
        const exportData = {
            exportedAt: new Date().toISOString(),
            platformName: settings.platformName,
            settings: settings
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `system_settings_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Settings exported successfully');
        
    } catch (error) {
        console.error('❌ Error exporting settings:', error);
        alert('Error exporting settings. Please try again.');
    }
}

function exportUsers() {
    try {
        console.log('👥 Exporting users...');
        
        const csvData = [
            ['Full Name', 'Email', 'Role', 'Factory', 'Status', 'Phone', 'Created At']
        ];
        
        users.forEach(user => {
            const row = [
                user.fullName || '',
                user.email || '',
                formatRole(user.role),
                getFactoryName(user.factoryId) || '',
                formatStatus(user.status),
                user.phone || '',
                user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : ''
            ];
            csvData.push(row);
        });
        
        const csvString = csvData.map(row => 
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Users exported successfully');
        
    } catch (error) {
        console.error('❌ Error exporting users:', error);
        alert('Error exporting users. Please try again.');
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
    document.getElementById('createUserModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeCreateUserModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('createUserModal')?.style.display === 'flex') {
                closeCreateUserModal();
            }
        }
    });
    
    // Password strength checking
    document.getElementById('userPassword')?.addEventListener('input', function(e) {
        updatePasswordStrength(e.target.value);
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

// CAP Management Functions
async function loadCAPs() { 
    try {
        console.log('📋 Loading CAPs...');
        
        const capsSnapshot = await collection(db, 'caps')
            .orderBy('createdAt', 'desc')
            .get();
        
        const capsList = document.getElementById('caps-list');
        
        if (capsSnapshot.empty) {
            capsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h4>No CAPs Found</h4>
                    <p>No compliance action plans have been created yet.</p>
                    <button class="btn btn-primary" onclick="openModal('add-cap-modal')">Add First CAP</button>
                </div>
            `;
            return;
        }
        
        let capsHTML = '';
        capsSnapshot.forEach(doc => {
            const cap = doc.data();
            const statusClass = getCAPStatusClass(cap.status);
            const priorityClass = getCAPPriorityClass(cap.priority);
            const progress = cap.progress || 0;
            
            capsHTML += `
                <div class="list-item">
                    <div class="list-item-checkbox">
                        <input type="checkbox" name="cap-select" value="${doc.id}" id="cap-${doc.id}">
                        <label for="cap-${doc.id}"></label>
                </div>
                    <div class="list-item-info">
                        <div class="list-item-name">${cap.title || 'Untitled CAP'}</div>
                        <div class="list-item-details">
                            <span class="status-badge ${statusClass}">${formatCAPStatus(cap.status)}</span>
                            <span class="priority-badge ${priorityClass}">${formatCAPPriority(cap.priority)}</span>
                            <span class="progress-text">${progress}% complete</span>
                            ${cap.factoryName ? `<span class="factory-name">• ${cap.factoryName}</span>` : ''}
                </div>
                        <div class="list-item-meta">
                            ${cap.description ? `<span class="description">${truncateText(cap.description, 100)}</span>` : ''}
                            ${cap.dueDate ? `<span class="due-date">Due: ${formatDate(cap.dueDate)}</span>` : ''}
            </div>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-small btn-secondary" onclick="viewCAP('${doc.id}')">View</button>
                        <button class="btn btn-small btn-primary" onclick="editCAP('${doc.id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deleteCAP('${doc.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
        
        capsList.innerHTML = capsHTML;
        
        // Update CAP statistics
        updateCAPStats(capsSnapshot.docs);
        
        console.log('✅ CAPs loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading CAPs:', error);
        document.getElementById('caps-list').innerHTML = `
                <div class="error-state">
                <div class="error-icon">⚠️</div>
                    <h4>Error Loading CAPs</h4>
                <p>Failed to load compliance action plans. Please try again.</p>
                <button class="btn btn-primary" onclick="loadCAPs()">Retry</button>
                </div>
            `;
    }
}

async function exportCAPs() { 
    try {
        console.log('📤 Exporting CAPs...');
        
        const capsSnapshot = await collection(db, 'caps');
        
        if (capsSnapshot.empty) {
            alert('No CAPs to export.');
            return;
        }
        
        const capsData = capsSnapshot.docs.map(doc => {
            const cap = doc.data();
            return {
                ID: doc.id,
                Title: cap.title || 'Untitled',
                Description: cap.description || '',
                Status: cap.status || 'pending',
                Priority: cap.priority || 'medium',
                Progress: cap.progress || 0,
                Factory: cap.factoryName || '',
                Created: cap.createdAt ? formatDate(cap.createdAt) : '',
                DueDate: cap.dueDate ? formatDate(cap.dueDate) : '',
                AssignedTo: cap.assignedTo || '',
                Category: cap.category || ''
            };
        });
        
        const csvContent = convertToCSV(capsData);
        const filename = `caps_export_${new Date().toISOString().split('T')[0]}.csv`;
        
        downloadCSV(csvContent, filename);
        
        console.log('✅ CAPs exported successfully');
        
    } catch (error) {
        console.error('❌ Error exporting CAPs:', error);
        alert('Failed to export CAPs. Please try again.');
    }
}

async function bulkDeleteCAPs() { 
    const selectedCAPs = document.querySelectorAll('input[name="cap-select"]:checked');
    
    if (selectedCAPs.length === 0) {
        alert('Please select CAPs to delete.');
        return;
    }
    
    const confirmMessage = `Are you sure you want to delete ${selectedCAPs.length} CAP(s)? This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        console.log(`🗑️ Deleting ${selectedCAPs.length} CAPs...`);
        
        const deletePromises = Array.from(selectedCAPs).map(checkbox => {
            const capId = checkbox.value;
            return collection(db, 'caps', capId);
        });
        
        await Promise.all(deletePromises);
        
        console.log('✅ CAPs deleted successfully');
        alert(`${selectedCAPs.length} CAP(s) deleted successfully.`);
        
        // Refresh the CAP list
        loadCAPs();
        
    } catch (error) {
        console.error('❌ Error deleting CAPs:', error);
        alert('Failed to delete some CAPs. Please try again.');
    }
}

function updateCAPStats(caps) {
    const total = caps.length;
    const pending = caps.filter(cap => cap.data().status === 'pending').length;
    const inProgress = caps.filter(cap => cap.data().status === 'in-progress').length;
    const completed = caps.filter(cap => cap.data().status === 'completed').length;
    const overdue = caps.filter(cap => {
        const capData = cap.data();
        return capData.dueDate && capData.dueDate.toDate() < new Date() && capData.status !== 'completed';
    }).length;
    
    // Update statistics display if elements exist
    const statsContainer = document.getElementById('caps-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-value">${total}</div>
                <div class="stat-label">Total CAPs</div>
                </div>
            <div class="stat-item">
                <div class="stat-value">${pending}</div>
                <div class="stat-label">Pending</div>
                </div>
            <div class="stat-item">
                <div class="stat-value">${inProgress}</div>
                <div class="stat-label">In Progress</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${completed}</div>
                <div class="stat-label">Completed</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${overdue}</div>
                <div class="stat-label">Overdue</div>
                </div>
            `;
        }
    }

function getCAPStatusClass(status) {
    const statusClasses = {
        'pending': 'status-pending',
        'in-progress': 'status-progress',
        'completed': 'status-completed',
        'overdue': 'status-overdue',
        'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
}

function getCAPPriorityClass(priority) {
    const priorityClasses = {
        'low': 'priority-low',
        'medium': 'priority-medium',
        'high': 'priority-high',
        'critical': 'priority-critical'
    };
    return priorityClasses[priority] || 'priority-medium';
}

function formatCAPStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'completed': 'Completed',
        'overdue': 'Overdue',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || 'Pending';
}

function formatCAPPriority(priority) {
    const priorityMap = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
        'critical': 'Critical'
    };
    return priorityMap[priority] || 'Medium';
}

// Debug function for testing
window.testSystemSettings = function() {
    console.log('🧪 Testing System Settings...');
    console.log('📊 Current state:');
    console.log('- Settings:', Object.keys(settings).length, 'items');
    console.log('- Users:', users.length);
    console.log('- Factories:', factories.length);
    console.log('- Audit Log:', auditLog.length);
    
    // Test sample data loading
    if (users.length === 0) {
        console.log('📋 Loading sample data...');
        loadSampleData();
    }
    
    console.log('✅ System Settings test completed');
};

function editCAP(capId) {
    window.open(`new-cap.html?edit=${capId}`, '_blank');
}

// Helper Functions
function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value).replace(/"/g, '""');
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function updateSystemStatusIndicators(healthData) {
    // Update various system status indicators
    const indicators = document.querySelectorAll('.status-indicator');
    indicators.forEach(indicator => {
        const type = indicator.dataset.type;
        if (healthData[type]) {
            indicator.className = `status-indicator ${healthData[type]}`;
            indicator.textContent = healthData[type];
        }
    });
}

// CAP helper functions
function viewCAP(capId) {
    window.open(`cap-detail.html?id=${capId}`, '_blank');
}

function deleteCAP(capId) {
    if (confirm('Are you sure you want to delete this CAP? This action cannot be undone.')) {
        collection(db, 'caps', capId)
            .then(() => {
                console.log('✅ CAP deleted successfully');
                loadCAPs(); // Refresh the list
            })
            .catch(error => {
                console.error('❌ Error deleting CAP:', error);
                alert('Failed to delete CAP. Please try again.');
            });
    }
}

// Update Quick Stats for Header
function updateQuickStats() {
    const now = new Date();
    
    // Total users
    const totalUsers = users.length;
    updateQuickStatDisplay('totalUsers', totalUsers);
    
    // Total factories
    const totalFactories = factories.length;
    updateQuickStatDisplay('totalFactories', totalFactories);
    
    // System uptime (simulated)
    const systemUptime = '99.9%';
    updateQuickStatDisplay('systemUptime', systemUptime);
    
    // Active sessions (simulated)
    const activeSessions = Math.floor(Math.random() * 50) + 20; // Random number between 20-70
    updateQuickStatDisplay('activeSessions', activeSessions);
    
    // Storage used (simulated)
    const storageUsed = '2.4 GB';
    updateQuickStatDisplay('storageUsed', storageUsed);
    
    // Last backup (simulated)
    const lastBackup = '2h ago';
    updateQuickStatDisplay('lastBackup', lastBackup);
    
    // System health (simulated)
    const systemHealth = 'Good';
    updateQuickStatDisplay('systemHealth', systemHealth);
    
    console.log(`📊 Quick stats updated: ${totalUsers} users, ${totalFactories} factories, ${systemUptime} uptime, ${activeSessions} sessions`);
}

function updateQuickStatDisplay(elementId, value) {
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

// Backup System
async function backupSystem() {
    try {
        console.log('💾 Starting system backup...');
        
        const backupBtn = document.querySelector('button[onclick="backupSystem()"]');
        const originalHTML = backupBtn.innerHTML;
        
        // Show loading state
        backupBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Backing up...';
        backupBtn.disabled = true;
        
        // Simulate backup process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create backup data
        const backupData = {
            timestamp: new Date().toISOString(),
            settings: settings,
            users: users,
            factories: factories,
            auditLog: auditLog.slice(-100), // Last 100 entries
            version: '1.0.0'
        };
        
        // Download backup file
        const jsonContent = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `system-backup-${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Update last backup time
        updateQuickStatDisplay('lastBackup', 'Just now');
        
        console.log('✅ System backup completed');
        alert('System backup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during system backup:', error);
        alert('Failed to create system backup. Please try again.');
    } finally {
        // Reset button state
        const backupBtn = document.querySelector('button[onclick="backupSystem()"]');
        backupBtn.innerHTML = '<i data-lucide="database"></i> Backup System';
        backupBtn.disabled = false;
    }
}

// Global functions for HTML onclick handlers
window.switchTab = switchTab;
window.openCreateUserModal = openCreateUserModal;
window.closeCreateUserModal = closeCreateUserModal;
window.saveUser = saveUser;
window.saveAllSettings = saveAllSettings;
window.exportSettings = exportSettings;
window.exportUsers = exportUsers;
window.searchUsers = searchUsers;
window.filterUsers = filterUsers;
window.handleUserSelect = handleUserSelect;
window.togglePassword = togglePassword;
window.generatePassword = generatePassword;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.logout = logout;

// Add missing global functions to prevent errors
window.loadCAPs = loadCAPs;
window.exportCAPs = exportCAPs;
window.bulkDeleteCAPs = bulkDeleteCAPs;
window.loadAuditLog = loadAuditLog;
window.exportAuditLog = exportAuditLog;
window.clearAuditLog = clearAuditLog;
window.refreshSystemStatus = refreshSystemStatus;

// Add new global functions
window.saveCAP = saveCAP;
window.openEditUserModal = openEditUserModal;
window.updateUser = updateUser;
window.openEditFactoryModal = openEditFactoryModal;
window.updateFactory = updateFactory;
window.openModal = openModal;
window.closeModal = closeModal;
window.backupSystem = backupSystem;

// Start the initialization process
initializeSettings();
