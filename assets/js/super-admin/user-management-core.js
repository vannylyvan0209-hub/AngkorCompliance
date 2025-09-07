// User Management Core System for Super Admin
class UserManagementCore {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.roles = [];
        this.permissions = {};
        this.filters = { role: 'all', status: 'all', factory: 'all' };
        this.searchTerm = '';
        this.init();
    }
    
    async init() {
        console.log('👥 Initializing User Management Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ User Management Core initialized');
    }
    
    async initializeFirebase() {
        try {
            if (window.Firebase) {
                this.auth = window.Firebase.auth;
                this.db = window.Firebase.db;
                this.doc = window.Firebase.doc;
                this.getDoc = window.Firebase.getDoc;
                this.collection = window.Firebase.collection;
                this.addDoc = window.Firebase.addDoc;
                this.updateDoc = window.Firebase.updateDoc;
                this.deleteDoc = window.Firebase.deleteDoc;
                this.query = window.Firebase.query;
                this.where = window.Firebase.where;
                this.orderBy = window.Firebase.orderBy;
                this.onSnapshot = window.Firebase.onSnapshot;
                this.getDocs = window.Firebase.getDocs;
                this.serverTimestamp = window.Firebase.serverTimestamp;
                console.log('✓ Firebase initialized successfully');
                return true;
            } else {
                console.log('⚠ Firebase not available, using local mode');
                return false;
            }
        } catch (error) {
            console.error('✗ Error initializing Firebase:', error);
            return false;
        }
    }
    
    async checkAuthentication() {
        return new Promise((resolve) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        const userDocRef = this.doc(this.db, 'users', user.uid);
                        const userDoc = await this.getDoc(userDocRef);
                        
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            if (userData.role === 'super_admin') {
                                this.currentUser = { ...user, ...userData };
                                resolve();
                            } else {
                                console.log('❌ Access denied - super admin privileges required');
                                window.location.href = '../../login.html';
                            }
                        } else {
                            console.log('❌ User profile not found');
                            window.location.href = '../../login.html';
                        }
                    } catch (error) {
                        console.error('Error checking authentication:', error);
                        window.location.href = '../../login.html';
                    }
                } else {
                    console.log('❌ No authenticated user');
                    window.location.href = '../../login.html';
                }
            });
        });
    }
    
    initializeNavigation() {
        if (window.superAdminNavigation) {
            window.superAdminNavigation.updateCurrentPage('User Management');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadUsers(),
            this.loadRoles(),
            this.loadPermissions()
        ]);
        this.renderUserTable();
        this.updateUserStatistics();
    }
    
    async loadUsers() {
        try {
            const usersRef = this.collection(this.db, 'users');
            const snapshot = await this.getDocs(usersRef);
            this.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(`✓ Loaded ${this.users.length} users`);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }
    
    async loadRoles() {
        try {
            const rolesRef = this.collection(this.db, 'roles');
            const snapshot = await this.getDocs(rolesRef);
            this.roles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (this.roles.length === 0) {
                this.roles = this.getDefaultRoles();
            }
        } catch (error) {
            console.error('Error loading roles:', error);
            this.roles = this.getDefaultRoles();
        }
    }
    
    async loadPermissions() {
        try {
            const permissionsRef = this.collection(this.db, 'permissions');
            const snapshot = await this.getDocs(permissionsRef);
            this.permissions = {};
            snapshot.docs.forEach(doc => {
                this.permissions[doc.id] = doc.data();
            });
            if (Object.keys(this.permissions).length === 0) {
                this.permissions = this.getDefaultPermissions();
            }
        } catch (error) {
            console.error('Error loading permissions:', error);
            this.permissions = this.getDefaultPermissions();
        }
    }
    
    getDefaultRoles() {
        return [
            { id: 'super_admin', name: 'Super Admin', description: 'Complete system administration', color: '#ef4444' },
            { id: 'factory_admin', name: 'Factory Admin', description: 'Factory management and oversight', color: '#B8941F' },
            { id: 'hr_staff', name: 'HR Staff', description: 'Human resources management', color: '#22c55e' },
            { id: 'grievance_committee', name: 'Grievance Committee', description: 'Case management and resolution', color: '#f59e0b' },
            { id: 'auditor', name: 'Auditor', description: 'Audit and compliance verification', color: '#3b82f6' },
            { id: 'analytics_user', name: 'Analytics User', description: 'Data analysis and reporting', color: '#8b5cf6' },
            { id: 'worker', name: 'Worker', description: 'Basic worker access', color: '#D4AF37' }
        ];
    }
    
    getDefaultPermissions() {
        return {
            super_admin: {
                canManageUsers: true,
                canManageFactories: true,
                canManageSystem: true,
                canViewAllData: true,
                canManageBackups: true,
                canManageStandards: true,
                canManageBilling: true,
                canManageSecurity: true
            },
            factory_admin: {
                canManageFactoryUsers: true,
                canViewFactoryData: true,
                canManageFactorySettings: true,
                canViewFactoryReports: true
            },
            hr_staff: {
                canManageWorkers: true,
                canManageTraining: true,
                canManageCompliance: true,
                canViewHRReports: true
            },
            grievance_committee: {
                canManageCases: true,
                canAssignCases: true,
                canViewAllCases: true,
                canGenerateReports: true
            },
            auditor: {
                canConductAudits: true,
                canManageEvidence: true,
                canGenerateReports: true,
                canViewComplianceData: true
            },
            analytics_user: {
                canViewAnalytics: true,
                canExportData: true,
                canGenerateReports: true,
                canViewSystemMetrics: true
            },
            worker: {
                canSubmitGrievance: true,
                canViewOwnCases: true,
                canAccessTraining: true,
                canViewProfile: true
            }
        };
    }
    
    renderUserTable() {
        const userTable = document.getElementById('userTable');
        if (!userTable) return;
        
        const filteredUsers = this.getFilteredUsers();
        const tableBody = userTable.querySelector('tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = filteredUsers.map(user => `
            <tr class="user-row">
                <td>
                    <div class="user-info">
                        <div class="user-avatar">
                            <span>${this.getUserInitials(user)}</span>
                        </div>
                        <div class="user-details">
                            <div class="user-name">${user.name || user.email}</div>
                            <div class="user-email">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="role-badge" style="background: ${this.getRoleColor(user.role)}">
                        ${this.getRoleName(user.role)}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${user.status || 'active'}">
                        ${user.status || 'active'}
                    </span>
                </td>
                <td>${user.factoryName || 'N/A'}</td>
                <td>${this.formatDate(user.lastLogin)}</td>
                <td>${this.formatDate(user.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="editUser('${user.id}')" title="Edit User">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="action-btn permissions" onclick="managePermissions('${user.id}')" title="Manage Permissions">
                            <i data-lucide="shield"></i>
                        </button>
                        <button class="action-btn ${user.status === 'active' ? 'suspend' : 'activate'}" 
                                onclick="${user.status === 'active' ? 'suspendUser' : 'activateUser'}('${user.id}')" 
                                title="${user.status === 'active' ? 'Suspend' : 'Activate'} User">
                            <i data-lucide="${user.status === 'active' ? 'pause' : 'play'}"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteUser('${user.id}')" title="Delete User">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    getFilteredUsers() {
        let filtered = this.users;
        
        if (this.filters.role !== 'all') {
            filtered = filtered.filter(u => u.role === this.filters.role);
        }
        
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(u => (u.status || 'active') === this.filters.status);
        }
        
        if (this.filters.factory !== 'all') {
            filtered = filtered.filter(u => u.factoryId === this.filters.factory);
        }
        
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(u => 
                (u.name && u.name.toLowerCase().includes(term)) ||
                u.email.toLowerCase().includes(term) ||
                (u.role && u.role.toLowerCase().includes(term))
            );
        }
        
        return filtered;
    }
    
    updateUserStatistics() {
        const totalUsers = this.users.length;
        const activeUsers = this.users.filter(u => (u.status || 'active') === 'active').length;
        const pendingUsers = this.users.filter(u => u.status === 'pending').length;
        const suspendedUsers = this.users.filter(u => u.status === 'suspended').length;
        
        const statsElements = {
            totalUsers: document.getElementById('totalUsers'),
            activeUsers: document.getElementById('activeUsers'),
            pendingUsers: document.getElementById('pendingUsers'),
            suspendedUsers: document.getElementById('suspendedUsers')
        };
        
        if (statsElements.totalUsers) statsElements.totalUsers.textContent = totalUsers;
        if (statsElements.activeUsers) statsElements.activeUsers.textContent = activeUsers;
        if (statsElements.pendingUsers) statsElements.pendingUsers.textContent = pendingUsers;
        if (statsElements.suspendedUsers) statsElements.suspendedUsers.textContent = suspendedUsers;
    }
    
    initializeUI() {
        this.initializeFilters();
        this.initializeSearch();
        this.initializeModals();
    }
    
    initializeFilters() {
        const roleFilter = document.getElementById('roleFilter');
        const statusFilter = document.getElementById('statusFilter');
        const factoryFilter = document.getElementById('factoryFilter');
        
        if (roleFilter) {
            roleFilter.innerHTML = '<option value="all">All Roles</option>';
            this.roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role.id;
                option.textContent = role.name;
                roleFilter.appendChild(option);
            });
            
            roleFilter.addEventListener('change', (e) => {
                this.filters.role = e.target.value;
                this.renderUserTable();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.renderUserTable();
            });
        }
        
        if (factoryFilter) {
            factoryFilter.innerHTML = '<option value="all">All Factories</option>';
            const factories = [...new Set(this.users.map(u => u.factoryName).filter(Boolean))];
            factories.forEach(factory => {
                const option = document.createElement('option');
                option.value = factory;
                option.textContent = factory;
                factoryFilter.appendChild(option);
            });
            
            factoryFilter.addEventListener('change', (e) => {
                this.filters.factory = e.target.value;
                this.renderUserTable();
            });
        }
    }
    
    initializeSearch() {
        const searchInput = document.getElementById('userSearch');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.renderUserTable();
        });
    }
    
    initializeModals() {
        const createUserModal = document.getElementById('createUserModal');
        if (createUserModal) {
            const form = createUserModal.querySelector('form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleCreateUser(form);
                });
            }
        }
        
        const editUserModal = document.getElementById('editUserModal');
        if (editUserModal) {
            const form = editUserModal.querySelector('form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleEditUser(form);
                });
            }
        }
    }
    
    setupEventListeners() {
        window.createUser = () => this.openCreateUserModal();
        window.editUser = (userId) => this.openEditUserModal(userId);
        window.managePermissions = (userId) => this.openPermissionsModal(userId);
        window.suspendUser = (userId) => this.suspendUser(userId);
        window.activateUser = (userId) => this.activateUser(userId);
        window.deleteUser = (userId) => this.deleteUser(userId);
        window.exportUsers = () => this.exportUsers();
        window.bulkActions = (action) => this.handleBulkAction(action);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const usersRef = this.collection(this.db, 'users');
        this.onSnapshot(usersRef, (snapshot) => {
            this.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderUserTable();
            this.updateUserStatistics();
        });
    }
    
    // Utility methods
    getUserInitials(user) {
        const name = user.name || user.email;
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    
    getRoleName(roleId) {
        const role = this.roles.find(r => r.id === roleId);
        return role ? role.name : roleId;
    }
    
    getRoleColor(roleId) {
        const role = this.roles.find(r => r.id === roleId);
        return role ? role.color : '#6B7280';
    }
    
    formatDate(date) {
        if (!date) return 'Never';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString();
    }
    
    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-500)' : type === 'warning' ? 'var(--warning-500)' : 'var(--error-500)'};
            color: white;
            padding: var(--space-4);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    window.userManagementCore = new UserManagementCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManagementCore;
}
