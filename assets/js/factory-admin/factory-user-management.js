import { initializeFirebase } from '../../firebase-config.js';

class FactoryUserManagement {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.currentFactory = null;
        this.users = [];
        this.filteredUsers = [];
        this.filters = {
            search: '',
            role: '',
            status: ''
        };
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            await this.loadFactoryData();
            this.setupEventListeners();
            await this.loadUsers();
            this.updateStatistics();
        } catch (error) {
            console.error('Error initializing Factory User Management:', error);
            this.showError('Failed to initialize user management system');
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    try {
                        // Get user's factory information
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.role === 'factory_admin' && userData.factoryId) {
                                this.currentFactory = userData.factoryId;
                                resolve();
                            } else {
                                reject(new Error('Access denied. Factory admin role required.'));
                            }
                        } else {
                            reject(new Error('User profile not found'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('User not authenticated'));
                }
            });
        });
    }

    async loadFactoryData() {
        try {
            const factoryDoc = await this.db.collection('factories').doc(this.currentFactory).get();
            if (factoryDoc.exists) {
                const factoryData = factoryDoc.data();
                // Update page title with factory name
                document.title = `Factory User Management - ${factoryData.name} - Angkor Compliance`;
            }
        } catch (error) {
            console.error('Error loading factory data:', error);
        }
    }

    setupEventListeners() {
        // Search and filter events
        document.getElementById('searchUsers').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.applyFilters();
        });

        document.getElementById('roleFilter').addEventListener('change', (e) => {
            this.filters.role = e.target.value;
            this.applyFilters();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });

        // Form submissions
        document.getElementById('inviteUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.inviteUser();
        });

        document.getElementById('editUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateUser();
        });

        // Real-time listeners for user updates
        this.setupRealtimeListeners();
    }

    async loadUsers() {
        try {
            this.showLoading();
            
            const usersSnapshot = await this.db
                .collection('users')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('createdAt', 'desc')
                .get();

            this.users = [];
            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                this.users.push({
                    id: doc.id,
                    ...userData,
                    createdAt: userData.createdAt?.toDate() || new Date(),
                    lastActive: userData.lastActive?.toDate() || new Date()
                });
            });

            this.filteredUsers = [...this.users];
            this.updateUsersTable();
            this.updateStatistics();
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Failed to load users');
        } finally {
            this.hideLoading();
        }
    }

    setupRealtimeListeners() {
        // Listen for real-time updates to users
        this.db
            .collection('users')
            .where('factoryId', '==', this.currentFactory)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const userData = change.doc.data();
                        const user = {
                            id: change.doc.id,
                            ...userData,
                            createdAt: userData.createdAt?.toDate() || new Date(),
                            lastActive: userData.lastActive?.toDate() || new Date()
                        };

                        const existingIndex = this.users.findIndex(u => u.id === user.id);
                        if (existingIndex >= 0) {
                            this.users[existingIndex] = user;
                        } else {
                            this.users.unshift(user);
                        }
                    } else if (change.type === 'removed') {
                        this.users = this.users.filter(u => u.id !== change.doc.id);
                    }
                });

                this.applyFilters();
                this.updateStatistics();
            });
    }

    applyFilters() {
        this.filteredUsers = this.users.filter(user => {
            const matchesSearch = !this.filters.search || 
                user.firstName?.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                user.lastName?.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                user.email?.toLowerCase().includes(this.filters.search.toLowerCase());

            const matchesRole = !this.filters.role || user.role === this.filters.role;
            const matchesStatus = !this.filters.status || user.status === this.filters.status;

            return matchesSearch && matchesRole && matchesStatus;
        });

        this.updateUsersTable();
    }

    updateUsersTable() {
        const tableBody = document.getElementById('usersTableBody');
        
        if (this.filteredUsers.length === 0) {
            tableBody.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="users"></i>
                    <h3>No users found</h3>
                    <p>${this.filters.search || this.filters.role || this.filters.status ? 'Try adjusting your filters' : 'Start by inviting users to your factory'}</p>
                    ${!this.filters.search && !this.filters.role && !this.filters.status ? 
                        `<button class="btn btn-primary" onclick="inviteNewUser()">
                            <i data-lucide="user-plus"></i> Invite First User
                        </button>` : ''
                    }
                </div>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredUsers.map(user => `
            <div class="table-row">
                <div>
                    <div class="user-avatar">
                        ${this.getInitials(user.firstName, user.lastName)}
                    </div>
                </div>
                <div class="user-info">
                    <div class="user-name">${user.firstName} ${user.lastName}</div>
                    <div class="user-email">${user.email}</div>
                </div>
                <div>
                    <span class="role-badge role-${user.role}">${user.role}</span>
                </div>
                <div>${this.getDepartmentName(user.department)}</div>
                <div>
                    <span class="status-badge status-${user.status}">${user.status}</span>
                </div>
                <div>${this.formatDate(user.lastActive)}</div>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editUser('${user.id}')" title="Edit User">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn-icon" onclick="viewUserDetails('${user.id}')" title="View Details">
                        <i data-lucide="eye"></i>
                    </button>
                    <button class="btn-icon" onclick="toggleUserStatus('${user.id}')" title="${user.status === 'active' ? 'Deactivate' : 'Activate'} User">
                        <i data-lucide="${user.status === 'active' ? 'user-x' : 'user-check'}"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    updateStatistics() {
        const stats = {
            total: this.users.length,
            active: this.users.filter(u => u.status === 'active').length,
            pending: this.users.filter(u => u.status === 'pending').length,
            admin: this.users.filter(u => u.role === 'admin').length
        };

        document.getElementById('totalUsers').textContent = stats.total;
        document.getElementById('activeUsers').textContent = stats.active;
        document.getElementById('pendingUsers').textContent = stats.pending;
        document.getElementById('adminUsers').textContent = stats.admin;
    }

    async inviteUser() {
        try {
            const formData = {
                firstName: document.getElementById('inviteFirstName').value.trim(),
                lastName: document.getElementById('inviteLastName').value.trim(),
                email: document.getElementById('inviteEmail').value.trim().toLowerCase(),
                role: document.getElementById('inviteRole').value,
                department: document.getElementById('inviteDepartment').value,
                message: document.getElementById('inviteMessage').value.trim()
            };

            // Validate form data
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.role || !formData.department) {
                this.showError('Please fill in all required fields');
                return;
            }

            // Check if user already exists
            const existingUser = await this.db.collection('users').where('email', '==', formData.email).get();
            if (!existingUser.empty) {
                this.showError('A user with this email already exists');
                return;
            }

            // Create invitation
            const invitationData = {
                ...formData,
                factoryId: this.currentFactory,
                status: 'pending',
                invitedBy: this.currentUser.uid,
                invitedAt: firebase.firestore.FieldValue.serverTimestamp(),
                invitationToken: this.generateInvitationToken(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            };

            await this.db.collection('user_invitations').add(invitationData);

            // Send invitation email (in a real app, this would be handled by a backend service)
            await this.sendInvitationEmail(invitationData);

            this.showSuccess('User invitation sent successfully');
            this.closeModal('inviteUserModal');
            this.resetInviteForm();

        } catch (error) {
            console.error('Error inviting user:', error);
            this.showError('Failed to send invitation');
        }
    }

    async updateUser() {
        try {
            const userId = document.getElementById('editUserId').value;
            const formData = {
                firstName: document.getElementById('editFirstName').value.trim(),
                lastName: document.getElementById('editLastName').value.trim(),
                email: document.getElementById('editEmail').value.trim().toLowerCase(),
                role: document.getElementById('editRole').value,
                department: document.getElementById('editDepartment').value,
                status: document.getElementById('editStatus').value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            };

            // Validate form data
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.role || !formData.department) {
                this.showError('Please fill in all required fields');
                return;
            }

            // Check if email is already taken by another user
            const existingUser = await this.db.collection('users')
                .where('email', '==', formData.email)
                .where('id', '!=', userId)
                .get();
            
            if (!existingUser.empty) {
                this.showError('A user with this email already exists');
                return;
            }

            await this.db.collection('users').doc(userId).update(formData);

            this.showSuccess('User updated successfully');
            this.closeModal('editUserModal');

        } catch (error) {
            console.error('Error updating user:', error);
            this.showError('Failed to update user');
        }
    }

    async toggleUserStatus(userId) {
        try {
            const user = this.users.find(u => u.id === userId);
            if (!user) return;

            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            
            await this.db.collection('users').doc(userId).update({
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            });

            this.showSuccess(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);

        } catch (error) {
            console.error('Error toggling user status:', error);
            this.showError('Failed to update user status');
        }
    }

    async exportUserData() {
        try {
            const csvData = this.filteredUsers.map(user => ({
                'First Name': user.firstName,
                'Last Name': user.lastName,
                'Email': user.email,
                'Role': user.role,
                'Department': this.getDepartmentName(user.department),
                'Status': user.status,
                'Last Active': this.formatDate(user.lastActive),
                'Created': this.formatDate(user.createdAt)
            }));

            const csv = this.convertToCSV(csvData);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `factory_users_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);

            this.showSuccess('User data exported successfully');

        } catch (error) {
            console.error('Error exporting user data:', error);
            this.showError('Failed to export user data');
        }
    }

    // Helper methods
    getInitials(firstName, lastName) {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    }

    getDepartmentName(department) {
        const departments = {
            'hr': 'Human Resources',
            'operations': 'Operations',
            'quality': 'Quality Control',
            'safety': 'Safety & Compliance',
            'management': 'Management'
        };
        return departments[department] || department;
    }

    formatDate(date) {
        if (!date) return 'Never';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    generateInvitationToken() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    async sendInvitationEmail(invitationData) {
        // In a real application, this would be handled by a backend service
        // For now, we'll just log the invitation
        console.log('Invitation email would be sent:', invitationData);
        
        // Store invitation in Firestore for tracking
        await this.db.collection('email_logs').add({
            type: 'user_invitation',
            to: invitationData.email,
            subject: 'Invitation to Join Angkor Compliance Platform',
            data: invitationData,
            sentAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'sent'
        });
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return `"${value}"`;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }

    resetInviteForm() {
        document.getElementById('inviteUserForm').reset();
    }

    showLoading() {
        // Add loading indicator if needed
    }

    hideLoading() {
        // Remove loading indicator if needed
    }

    showSuccess(message) {
        // Implement success notification
        alert(message); // Replace with proper notification system
    }

    showError(message) {
        // Implement error notification
        alert('Error: ' + message); // Replace with proper notification system
    }
}

// Global functions for button actions
let factoryUserManagement;

function inviteNewUser() {
    document.getElementById('inviteUserModal').style.display = 'block';
}

function editUser(userId) {
    const user = factoryUserManagement.users.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editFirstName').value = user.firstName || '';
    document.getElementById('editLastName').value = user.lastName || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editRole').value = user.role || '';
    document.getElementById('editDepartment').value = user.department || '';
    document.getElementById('editStatus').value = user.status || 'active';

    document.getElementById('editUserModal').style.display = 'block';
}

function viewUserDetails(userId) {
    // Implement user details view
    alert('User details view - to be implemented');
}

function toggleUserStatus(userId) {
    factoryUserManagement.toggleUserStatus(userId);
}

function applyFilters() {
    factoryUserManagement.applyFilters();
}

function exportUserData() {
    factoryUserManagement.exportUserData();
}

function bulkRoleUpdate() {
    alert('Bulk role update - to be implemented');
}

function viewAccessLogs() {
    alert('Access logs view - to be implemented');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    factoryUserManagement = new FactoryUserManagement();
    window.factoryUserManagement = factoryUserManagement;
    factoryUserManagement.init();
});
