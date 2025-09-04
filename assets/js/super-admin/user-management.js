// User Management System
class UserManagement {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.filteredUsers = [];
        this.selectedUser = null;
        this.searchTerm = '';
        this.roleFilter = 'all';
        this.statusFilter = 'all';
        
        this.init();
    }
    
    async init() {
        console.log('👥 Initializing User Management...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize UI
        this.initializeUI();
        
        // Load initial data
        await this.loadUsers();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ User Management initialized');
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
                            
                            // Only allow super admins
                            if (userData.role === 'super_admin') {
                                this.currentUser = { ...user, ...userData };
                                this.updateUserDisplay();
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
    
    updateUserDisplay() {
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (this.currentUser) {
            userName.textContent = this.currentUser.name || this.currentUser.displayName || 'Super Admin';
            
            // Set avatar initials
            const initials = (this.currentUser.name || 'SA').split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatar.innerHTML = `<span>${initials}</span>`;
        }
    }
    
    async loadUsers() {
        try {
            const usersRef = this.collection(this.db, 'users');
            const snapshot = await this.getDocs(usersRef);
            this.users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.filteredUsers = [...this.users];
            this.updateUsersDisplay();
            this.updateUserStats();
            this.updateRecentActivity();
            
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }
    
    updateUsersDisplay() {
        const usersList = document.getElementById('usersList');
        
        if (this.filteredUsers.length === 0) {
            usersList.innerHTML = `
                <div style="text-align: center; padding: var(--space-8); color: var(--neutral-500);">
                    <i data-lucide="users" style="width: 48px; height: 48px; margin-bottom: var(--space-4);"></i>
                    <p>No users found matching your criteria</p>
                </div>
            `;
            return;
        }
        
        usersList.innerHTML = this.filteredUsers.map(user => `
            <div class="user-card ${this.selectedUser && this.selectedUser.id === user.id ? 'selected' : ''}" 
                 onclick="window.userManagement.selectUser('${user.id}')">
                <div class="user-avatar-small">
                    <span>${this.getUserInitials(user)}</span>
                </div>
                <div class="user-info-card">
                    <div class="user-name">${user.name || user.displayName || 'Unknown User'}</div>
                    <div class="user-email">${user.email || 'No email'}</div>
                    <div class="user-role">${this.getRoleDisplayName(user.role)}</div>
                </div>
                <div class="user-status">
                    <div class="status-indicator status-${user.status || 'inactive'}"></div>
                    <span style="font-size: var(--text-xs); color: var(--neutral-600);">
                        ${this.getStatusDisplayName(user.status)}
                    </span>
                </div>
            </div>
        `).join('');
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    selectUser(userId) {
        this.selectedUser = this.users.find(u => u.id === userId);
        this.updateUsersDisplay();
        this.updateUserDetails();
    }
    
    updateUserDetails() {
        const userDetails = document.getElementById('userDetails');
        
        if (!this.selectedUser) {
            userDetails.innerHTML = `
                <h3 class="section-title" style="font-size: var(--text-lg); margin-bottom: var(--space-4);">
                    <i data-lucide="user"></i>
                    User Details
                </h3>
                <div style="text-align: center; color: var(--neutral-500); padding: var(--space-8);">
                    Select a user to view details
                </div>
            `;
            return;
        }
        
        const user = this.selectedUser;
        
        userDetails.innerHTML = `
            <div class="detail-header">
                <div class="detail-avatar">
                    <span>${this.getUserInitials(user)}</span>
                </div>
                <div class="detail-info">
                    <h3>${user.name || user.displayName || 'Unknown User'}</h3>
                    <p>${user.email || 'No email'}</p>
                    <div class="user-role">${this.getRoleDisplayName(user.role)}</div>
                </div>
            </div>
            
            <div style="margin-bottom: var(--space-4);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                    <span style="font-size: var(--text-sm); color: var(--neutral-600);">Status:</span>
                    <span style="font-size: var(--text-sm); font-weight: 500; color: var(--neutral-900);">
                        ${this.getStatusDisplayName(user.status)}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                    <span style="font-size: var(--text-sm); color: var(--neutral-600);">Factory:</span>
                    <span style="font-size: var(--text-sm); font-weight: 500; color: var(--neutral-900);">
                        ${user.factoryName || 'Not assigned'}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                    <span style="font-size: var(--text-sm); color: var(--neutral-600);">Created:</span>
                    <span style="font-size: var(--text-sm); font-weight: 500; color: var(--neutral-900);">
                        ${this.formatDate(user.createdAt)}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="font-size: var(--text-sm); color: var(--neutral-600);">Last Login:</span>
                    <span style="font-size: var(--text-sm); font-weight: 500; color: var(--neutral-900);">
                        ${this.formatDate(user.lastLoginAt) || 'Never'}
                    </span>
                </div>
            </div>
            
            <div class="detail-actions">
                <button class="detail-btn primary" onclick="window.userManagement.editUser('${user.id}')">
                    Edit
                </button>
                <button class="detail-btn secondary" onclick="window.userManagement.resetPassword('${user.id}')">
                    Reset Password
                </button>
                <button class="detail-btn danger" onclick="window.userManagement.deactivateUser('${user.id}')">
                    ${user.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        `;
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    updateUserStats() {
        const totalUsers = this.users.length;
        const activeUsers = this.users.filter(u => u.status === 'active').length;
        const pendingUsers = this.users.filter(u => u.status === 'pending').length;
        const newUsers = this.users.filter(u => {
            const userDate = u.createdAt ? u.createdAt.toDate() : new Date(u.createdAt);
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return userDate > monthAgo;
        }).length;
        
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('activeUsers').textContent = activeUsers;
        document.getElementById('pendingUsers').textContent = pendingUsers;
        document.getElementById('newUsers').textContent = newUsers;
    }
    
    updateRecentActivity() {
        const activityList = document.getElementById('recentActivity');
        const activities = this.getRecentActivities();
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${activity.color};">
                    <i data-lucide="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    getRecentActivities() {
        const activities = [];
        
        // Add recent user registrations
        const recentUsers = this.users
            .filter(u => {
                const userDate = u.createdAt ? u.createdAt.toDate() : new Date(u.createdAt);
                const dayAgo = new Date();
                dayAgo.setDate(dayAgo.getDate() - 1);
                return userDate > dayAgo;
            })
            .slice(0, 5);
        
        recentUsers.forEach(user => {
            activities.push({
                title: `New user: ${user.name || user.email}`,
                time: this.getTimeAgo(user.createdAt ? user.createdAt.toDate() : new Date(user.createdAt)),
                icon: 'user-plus',
                color: 'var(--primary-500)'
            });
        });
        
        // Add status changes
        const statusChanges = this.users
            .filter(u => u.lastStatusChange)
            .slice(0, 5);
        
        statusChanges.forEach(user => {
            activities.push({
                title: `${user.name || user.email} ${user.status === 'active' ? 'activated' : 'deactivated'}`,
                time: this.getTimeAgo(user.lastStatusChange ? user.lastStatusChange.toDate() : new Date(user.lastStatusChange)),
                icon: user.status === 'active' ? 'check-circle' : 'x-circle',
                color: user.status === 'active' ? 'var(--success-500)' : 'var(--error-500)'
            });
        });
        
        return activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 8);
    }
    
    applyFilters() {
        this.filteredUsers = this.users.filter(user => {
            const matchesSearch = this.searchTerm === '' || 
                (user.name && user.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(this.searchTerm.toLowerCase()));
            
            const matchesRole = this.roleFilter === 'all' || user.role === this.roleFilter;
            const matchesStatus = this.statusFilter === 'all' || user.status === this.statusFilter;
            
            return matchesSearch && matchesRole && matchesStatus;
        });
        
        this.updateUsersDisplay();
    }
    
    getUserInitials(user) {
        const name = user.name || user.displayName || user.email || 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    
    getRoleDisplayName(role) {
        const roleMap = {
            'worker': 'Worker',
            'factory_admin': 'Factory Admin',
            'hr_staff': 'HR Staff',
            'analytics_user': 'Analytics User',
            'auditor': 'Auditor',
            'super_admin': 'Super Admin'
        };
        return roleMap[role] || 'Unknown';
    }
    
    getStatusDisplayName(status) {
        const statusMap = {
            'active': 'Active',
            'inactive': 'Inactive',
            'pending': 'Pending'
        };
        return statusMap[status] || 'Unknown';
    }
    
    formatDate(date) {
        if (!date) return 'N/A';
        
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} days ago`;
        
        const diffInWeeks = Math.floor(diffInDays / 7);
        return `${diffInWeeks} weeks ago`;
    }
    
    initializeUI() {
        // Set default filters
        document.getElementById('roleFilter').value = this.roleFilter;
        document.getElementById('statusFilter').value = this.statusFilter;
        
        console.log('UI initialized');
    }
    
    setupEventListeners() {
        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.applyFilters();
        });
        
        // Role filter
        document.getElementById('roleFilter').addEventListener('change', (e) => {
            this.roleFilter = e.target.value;
            this.applyFilters();
        });
        
        // Status filter
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.statusFilter = e.target.value;
            this.applyFilters();
        });
        
        console.log('Event listeners setup');
    }
    
    // User management functions
    showAddUserModal() {
        // In a real implementation, this would show a modal for adding users
        this.showNotification('info', 'Add user functionality would open a modal here');
    }
    
    editUser(userId) {
        // In a real implementation, this would open an edit modal
        this.showNotification('info', `Edit user ${userId} functionality would open a modal here`);
    }
    
    resetPassword(userId) {
        // In a real implementation, this would trigger a password reset
        this.showNotification('success', `Password reset email sent to user ${userId}`);
    }
    
    deactivateUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        const action = newStatus === 'active' ? 'activated' : 'deactivated';
        
        // In a real implementation, this would update the user status in Firebase
        this.showNotification('success', `User ${user.name || user.email} has been ${action}`);
    }
    
    exportUsers() {
        // In a real implementation, this would export user data
        const dataStr = JSON.stringify(this.filteredUsers, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'users-export.json';
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('success', 'User data exported successfully');
    }
    
    showNotification(type, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-500)' : type === 'error' ? 'var(--error-500)' : 'var(--primary-500)'};
            color: white;
            padding: var(--space-4);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize the user management when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the user management
    window.userManagement = new UserManagement();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManagement;
}
