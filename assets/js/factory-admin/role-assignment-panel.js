import { initializeFirebase } from '../../firebase-config.js';

class RoleAssignmentPanel {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.currentFactory = null;
        this.users = [];
        this.roleTemplates = [];
        this.selectedUser = null;
        this.rolePermissions = {};
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            this.initializeRolePermissions();
            await this.loadAllData();
            this.updateOverviewCards();
        } catch (error) {
            console.error('Error initializing Role Assignment Panel:', error);
            this.showError('Failed to initialize role assignment panel');
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    try {
                        // Get user's role and factory information
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.role === 'factory_admin' || userData.role === 'super_admin') {
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

    setupEventListeners() {
        // Search functionality
        document.getElementById('userSearch').addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });

        // Role filter
        document.getElementById('roleFilter').addEventListener('change', (e) => {
            this.filterUsersByRole(e.target.value);
        });

        // Role change handler
        document.getElementById('newRole').addEventListener('change', (e) => {
            this.updatePermissionMatrix(e.target.value);
        });
    }

    initializeRolePermissions() {
        this.rolePermissions = {
            factory_admin: {
                name: 'Factory Administrator',
                permissions: {
                    'Document Management': ['View Documents', 'Upload Documents', 'Approve Documents'],
                    'Compliance Management': ['View Compliance Status', 'Manage CAPs', 'View Audit Results'],
                    'User Management': ['View Users', 'Invite Users', 'Manage Roles'],
                    'Reports & Analytics': ['View Reports', 'Export Data', 'View Analytics']
                }
            },
            compliance_manager: {
                name: 'Compliance Manager',
                permissions: {
                    'Document Management': ['View Documents', 'Upload Documents', 'Approve Documents'],
                    'Compliance Management': ['View Compliance Status', 'Manage CAPs', 'View Audit Results'],
                    'Reports & Analytics': ['View Reports', 'Export Data', 'View Analytics']
                }
            },
            hr_manager: {
                name: 'HR Manager',
                permissions: {
                    'Document Management': ['View Documents', 'Upload Documents'],
                    'Compliance Management': ['View Compliance Status', 'View Audit Results'],
                    'User Management': ['View Users', 'Invite Users'],
                    'Reports & Analytics': ['View Reports', 'Export Data', 'View Analytics']
                }
            },
            supervisor: {
                name: 'Supervisor',
                permissions: {
                    'Document Management': ['View Documents', 'Upload Documents'],
                    'Compliance Management': ['View Compliance Status'],
                    'Reports & Analytics': ['View Reports']
                }
            },
            worker: {
                name: 'Worker',
                permissions: {
                    'Document Management': ['View Documents']
                }
            },
            viewer: {
                name: 'Viewer',
                permissions: {
                    'Document Management': ['View Documents'],
                    'Compliance Management': ['View Compliance Status', 'View Audit Results'],
                    'Reports & Analytics': ['View Reports']
                }
            }
        };
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadUsers(),
                this.loadRoleTemplates()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadUsers() {
        try {
            const usersSnapshot = await this.db
                .collection('users')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('firstName')
                .get();

            this.users = [];
            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                this.users.push({
                    id: doc.id,
                    ...userData
                });
            });

            this.updateUsersTable();
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async loadRoleTemplates() {
        try {
            const templatesSnapshot = await this.db
                .collection('role_templates')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('name')
                .get();

            this.roleTemplates = [];
            templatesSnapshot.forEach(doc => {
                const templateData = doc.data();
                this.roleTemplates.push({
                    id: doc.id,
                    ...templateData
                });
            });

            this.updateRoleTemplates();
        } catch (error) {
            console.error('Error loading role templates:', error);
        }
    }

    updateUsersTable() {
        const tableBody = document.getElementById('usersTable');
        
        if (this.users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i data-lucide="users"></i>
                        <p>No users found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.users.map(user => `
            <tr class="user-row" data-user-id="${user.id}">
                <td>
                    <div class="user-info">
                        <div class="user-avatar">
                            <i data-lucide="user"></i>
                        </div>
                        <div class="user-details">
                            <div class="user-name">${user.firstName} ${user.lastName}</div>
                            <div class="user-email">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="role-badge role-${user.role}">
                        ${this.getRoleDisplayName(user.role)}
                    </span>
                </td>
                <td>${user.department || 'N/A'}</td>
                <td>
                    <span class="status-badge status-${user.status || 'active'}">
                        ${user.status || 'active'}
                    </span>
                </td>
                <td>${this.formatTimeAgo(user.lastActive)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="selectUser('${user.id}')">
                            <i data-lucide="user-check"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="viewUserDetails('${user.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editUserPermissions('${user.id}')">
                            <i data-lucide="key"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateRoleTemplates() {
        const container = document.getElementById('roleTemplates');
        
        if (this.roleTemplates.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="shield"></i>
                    <p>No role templates found</p>
                    <button class="btn btn-primary" onclick="createRoleTemplate()">
                        <i data-lucide="plus"></i> Create First Template
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.roleTemplates.map(template => `
            <div class="template-item">
                <div class="template-header">
                    <h4>${template.name}</h4>
                    <div class="template-actions">
                        <button class="btn btn-sm btn-outline" onclick="editTemplate('${template.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="deleteTemplate('${template.id}')">
                            <i data-lucide="trash"></i>
                        </button>
                    </div>
                </div>
                <div class="template-description">${template.description || 'No description'}</div>
                <div class="template-permissions">
                    ${Object.keys(template.permissions || {}).map(category => `
                        <div class="permission-category">
                            <strong>${category}:</strong>
                            ${template.permissions[category].join(', ')}
                        </div>
                    `).join('')}
                </div>
                <div class="template-usage">
                    <span class="usage-count">${template.usageCount || 0} users</span>
                </div>
            </div>
        `).join('');
    }

    selectUser(userId) {
        this.selectedUser = this.users.find(user => user.id === userId);
        if (!this.selectedUser) return;

        // Update sidebar form
        document.getElementById('selectedUser').value = `${this.selectedUser.firstName} ${this.selectedUser.lastName}`;
        document.getElementById('newRole').value = this.selectedUser.role;
        document.getElementById('effectiveDate').value = new Date().toISOString().split('T')[0];

        // Show assignment form
        document.getElementById('roleAssignmentForm').style.display = 'block';
        document.getElementById('noUserSelected').style.display = 'none';

        // Update permission matrix
        this.updatePermissionMatrix(this.selectedUser.role);

        // Highlight selected user
        document.querySelectorAll('.user-row').forEach(row => {
            row.classList.remove('selected');
        });
        document.querySelector(`[data-user-id="${userId}"]`).classList.add('selected');
    }

    updatePermissionMatrix(role) {
        const container = document.getElementById('permissionMatrix');
        const permissions = this.rolePermissions[role];
        
        if (!permissions) {
            container.innerHTML = '<p>No permissions defined for this role</p>';
            return;
        }

        container.innerHTML = Object.keys(permissions.permissions).map(category => `
            <div class="permission-category">
                <h4>${category}</h4>
                <div class="permission-list">
                    ${permissions.permissions[category].map(permission => `
                        <div class="permission-item">
                            <i data-lucide="check" class="permission-icon"></i>
                            <span>${permission}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    async assignRole() {
        try {
            if (!this.selectedUser) {
                this.showError('Please select a user first');
                return;
            }

            const newRole = document.getElementById('newRole').value;
            const reason = document.getElementById('assignmentReason').value;
            const effectiveDate = document.getElementById('effectiveDate').value;

            if (!newRole) {
                this.showError('Please select a new role');
                return;
            }

            if (!reason) {
                this.showError('Please provide a reason for the role change');
                return;
            }

            this.showLoading('Assigning role...');

            // Create role assignment record
            const assignmentData = {
                userId: this.selectedUser.id,
                previousRole: this.selectedUser.role,
                newRole: newRole,
                reason: reason,
                effectiveDate: effectiveDate,
                assignedBy: this.currentUser.uid,
                assignedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            };

            await this.db.collection('role_assignments').add(assignmentData);

            // Update user role
            await this.db.collection('users').doc(this.selectedUser.id).update({
                role: newRole,
                roleUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                roleUpdatedBy: this.currentUser.uid
            });

            // Send notification to user
            await this.notifyUserOfRoleChange(this.selectedUser, newRole, reason);

            this.hideLoading();
            this.showSuccess('Role assigned successfully');
            this.cancelAssignment();
            await this.loadUsers();

        } catch (error) {
            console.error('Error assigning role:', error);
            this.hideLoading();
            this.showError('Failed to assign role');
        }
    }

    async notifyUserOfRoleChange(user, newRole, reason) {
        // In a real implementation, this would send an email or notification
        console.log(`Notifying user ${user.email} of role change to ${newRole}`);
        
        // Create notification record
        await this.db.collection('notifications').add({
            userId: user.id,
            type: 'role_change',
            title: 'Role Assignment Update',
            message: `Your role has been changed to ${this.getRoleDisplayName(newRole)}. Reason: ${reason}`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            read: false
        });
    }

    cancelAssignment() {
        this.selectedUser = null;
        document.getElementById('roleAssignmentForm').style.display = 'none';
        document.getElementById('noUserSelected').style.display = 'block';
        
        // Clear form
        document.getElementById('selectedUser').value = '';
        document.getElementById('newRole').value = '';
        document.getElementById('assignmentReason').value = '';
        document.getElementById('effectiveDate').value = '';

        // Remove selection highlight
        document.querySelectorAll('.user-row').forEach(row => {
            row.classList.remove('selected');
        });
    }

    filterUsers(searchTerm) {
        const filteredUsers = this.users.filter(user => 
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.updateUsersTableWithData(filteredUsers);
    }

    filterUsersByRole(role) {
        if (!role) {
            this.updateUsersTableWithData(this.users);
            return;
        }

        const filteredUsers = this.users.filter(user => user.role === role);
        this.updateUsersTableWithData(filteredUsers);
    }

    updateUsersTableWithData(users) {
        const tableBody = document.getElementById('usersTable');
        
        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i data-lucide="search"></i>
                        <p>No users found matching your criteria</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = users.map(user => `
            <tr class="user-row" data-user-id="${user.id}">
                <td>
                    <div class="user-info">
                        <div class="user-avatar">
                            <i data-lucide="user"></i>
                        </div>
                        <div class="user-details">
                            <div class="user-name">${user.firstName} ${user.lastName}</div>
                            <div class="user-email">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="role-badge role-${user.role}">
                        ${this.getRoleDisplayName(user.role)}
                    </span>
                </td>
                <td>${user.department || 'N/A'}</td>
                <td>
                    <span class="status-badge status-${user.status || 'active'}">
                        ${user.status || 'active'}
                    </span>
                </td>
                <td>${this.formatTimeAgo(user.lastActive)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="selectUser('${user.id}')">
                            <i data-lucide="user-check"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="viewUserDetails('${user.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editUserPermissions('${user.id}')">
                            <i data-lucide="key"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateOverviewCards() {
        const totalUsers = this.users.length;
        const activeRoles = new Set(this.users.map(user => user.role)).size;
        const pendingAssignments = 0; // This would come from role_assignments collection
        const complianceScore = this.calculateComplianceScore();

        // Update card values
        document.querySelector('.overview-card:nth-child(1) .card-value').textContent = totalUsers;
        document.querySelector('.overview-card:nth-child(2) .card-value').textContent = activeRoles;
        document.querySelector('.overview-card:nth-child(3) .card-value').textContent = pendingAssignments;
        document.querySelector('.overview-card:nth-child(4) .card-value').textContent = `${complianceScore}%`;
    }

    calculateComplianceScore() {
        // Calculate compliance score based on role assignments and permissions
        let score = 100;
        
        // Deduct points for users without proper role assignments
        const usersWithoutRoles = this.users.filter(user => !user.role).length;
        score -= (usersWithoutRoles / this.users.length) * 20;
        
        // Deduct points for users with expired roles
        const usersWithExpiredRoles = this.users.filter(user => 
            user.roleExpiryDate && new Date(user.roleExpiryDate) < new Date()
        ).length;
        score -= (usersWithExpiredRoles / this.users.length) * 15;
        
        return Math.max(0, Math.round(score));
    }

    // Helper methods
    getRoleDisplayName(role) {
        return this.rolePermissions[role]?.name || role;
    }

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Never';
        
        const now = new Date();
        const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minutes ago`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)} hours ago`;
        } else {
            return `${Math.floor(diffInMinutes / 1440)} days ago`;
        }
    }

    showLoading(message) {
        // Implement loading indicator
        console.log('Loading:', message);
    }

    hideLoading() {
        // Hide loading indicator
        console.log('Loading complete');
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
let roleAssignmentPanel;

function selectUser(userId) {
    roleAssignmentPanel.selectUser(userId);
}

function assignRole() {
    roleAssignmentPanel.assignRole();
}

function cancelAssignment() {
    roleAssignmentPanel.cancelAssignment();
}

function createRoleTemplate() {
    document.getElementById('roleTemplateModal').style.display = 'flex';
}

function bulkRoleAssignment() {
    document.getElementById('bulkRoleModal').style.display = 'flex';
}

function exportUserRoles() {
    alert('Export User Roles feature coming soon');
}

function roleAudit() {
    alert('Role Audit feature coming soon');
}

function permissionReview() {
    alert('Permission Review feature coming soon');
}

function roleAnalytics() {
    alert('Role Analytics feature coming soon');
}

function accessReport() {
    alert('Access Report feature coming soon');
}

function viewUserDetails(userId) {
    alert('View User Details feature coming soon');
}

function editUserPermissions(userId) {
    alert('Edit User Permissions feature coming soon');
}

function editTemplate(templateId) {
    alert('Edit Template feature coming soon');
}

function deleteTemplate(templateId) {
    if (confirm('Are you sure you want to delete this template?')) {
        alert('Delete Template feature coming soon');
    }
}

function saveRoleTemplate() {
    alert('Save Role Template feature coming soon');
}

function confirmRoleAssignment() {
    alert('Confirm Role Assignment feature coming soon');
}

function confirmBulkAssignment() {
    alert('Confirm Bulk Assignment feature coming soon');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    roleAssignmentPanel = new RoleAssignmentPanel();
    window.roleAssignmentPanel = roleAssignmentPanel;
    roleAssignmentPanel.init();
});
