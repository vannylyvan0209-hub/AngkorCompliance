// User Management Actions for Super Admin
class UserManagementActions {
    constructor(core) {
        this.core = core;
    }
    
    async openCreateUserModal() {
        const modal = document.getElementById('createUserModal');
        if (modal) {
            modal.classList.add('show');
            this.populateRoleOptions('createUserRole');
        }
    }
    
    async openEditUserModal(userId) {
        const user = this.core.users.find(u => u.id === userId);
        if (!user) return;
        
        const modal = document.getElementById('editUserModal');
        if (modal) {
            document.getElementById('editUserName').value = user.name || '';
            document.getElementById('editUserEmail').value = user.email || '';
            document.getElementById('editUserRole').value = user.role || '';
            document.getElementById('editUserStatus').value = user.status || 'active';
            document.getElementById('editUserFactory').value = user.factoryId || '';
            
            modal.classList.add('show');
            this.populateRoleOptions('editUserRole');
        }
    }
    
    async openPermissionsModal(userId) {
        const user = this.core.users.find(u => u.id === userId);
        if (!user) return;
        
        window.location.href = `user-permissions.html?id=${userId}`;
    }
    
    async handleCreateUser(form) {
        try {
            const userData = {
                name: form.querySelector('#createUserName').value,
                email: form.querySelector('#createUserEmail').value,
                role: form.querySelector('#createUserRole').value,
                status: 'pending',
                factoryId: form.querySelector('#createUserFactory').value || null,
                createdAt: this.core.serverTimestamp(),
                createdBy: this.core.currentUser.uid
            };
            
            await this.core.addDoc(this.core.collection(this.core.db, 'users'), userData);
            
            this.core.showNotification('success', 'User created successfully!');
            this.closeModal('createUserModal');
            form.reset();
            
        } catch (error) {
            console.error('Error creating user:', error);
            this.core.showNotification('error', 'Failed to create user. Please try again.');
        }
    }
    
    async handleEditUser(form) {
        try {
            const userId = form.dataset.userId;
            const userData = {
                name: form.querySelector('#editUserName').value,
                email: form.querySelector('#editUserEmail').value,
                role: form.querySelector('#editUserRole').value,
                status: form.querySelector('#editUserStatus').value,
                factoryId: form.querySelector('#editUserFactory').value || null,
                updatedAt: this.core.serverTimestamp(),
                updatedBy: this.core.currentUser.uid
            };
            
            const userRef = this.core.doc(this.core.db, 'users', userId);
            await this.core.updateDoc(userRef, userData);
            
            this.core.showNotification('success', 'User updated successfully!');
            this.closeModal('editUserModal');
            
        } catch (error) {
            console.error('Error updating user:', error);
            this.core.showNotification('error', 'Failed to update user. Please try again.');
        }
    }
    
    async suspendUser(userId) {
        if (!confirm('Are you sure you want to suspend this user?')) return;
        
        try {
            const userRef = this.core.doc(this.core.db, 'users', userId);
            await this.core.updateDoc(userRef, {
                status: 'suspended',
                suspendedAt: this.core.serverTimestamp(),
                suspendedBy: this.core.currentUser.uid
            });
            
            this.core.showNotification('success', 'User suspended successfully');
            
        } catch (error) {
            console.error('Error suspending user:', error);
            this.core.showNotification('error', 'Failed to suspend user');
        }
    }
    
    async activateUser(userId) {
        try {
            const userRef = this.core.doc(this.core.db, 'users', userId);
            await this.core.updateDoc(userRef, {
                status: 'active',
                activatedAt: this.core.serverTimestamp(),
                activatedBy: this.core.currentUser.uid
            });
            
            this.core.showNotification('success', 'User activated successfully');
            
        } catch (error) {
            console.error('Error activating user:', error);
            this.core.showNotification('error', 'Failed to activate user');
        }
    }
    
    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        
        try {
            const userRef = this.core.doc(this.core.db, 'users', userId);
            await this.core.deleteDoc(userRef);
            
            this.core.showNotification('success', 'User deleted successfully');
            
        } catch (error) {
            console.error('Error deleting user:', error);
            this.core.showNotification('error', 'Failed to delete user');
        }
    }
    
    async exportUsers() {
        try {
            const exportData = this.core.users.map(user => ({
                name: user.name || '',
                email: user.email,
                role: user.role || '',
                status: user.status || 'active',
                factory: user.factoryName || '',
                lastLogin: this.core.formatDate(user.lastLogin),
                createdAt: this.core.formatDate(user.createdAt)
            }));
            
            const csv = this.convertToCSV(exportData);
            this.downloadCSV(csv, 'users-export.csv');
            
            this.core.showNotification('success', 'Users exported successfully');
            
        } catch (error) {
            console.error('Error exporting users:', error);
            this.core.showNotification('error', 'Failed to export users');
        }
    }
    
    async handleBulkAction(action) {
        const selectedUsers = this.getSelectedUsers();
        if (selectedUsers.length === 0) {
            this.core.showNotification('warning', 'Please select users first');
            return;
        }
        
        if (!confirm(`Are you sure you want to ${action} ${selectedUsers.length} users?`)) return;
        
        try {
            const promises = selectedUsers.map(userId => {
                const userRef = this.core.doc(this.core.db, 'users', userId);
                return this.core.updateDoc(userRef, {
                    status: action,
                    [`${action}At`]: this.core.serverTimestamp(),
                    [`${action}By`]: this.core.currentUser.uid
                });
            });
            
            await Promise.all(promises);
            
            this.core.showNotification('success', `${selectedUsers.length} users ${action}ed successfully`);
            
        } catch (error) {
            console.error(`Error ${action}ing users:`, error);
            this.core.showNotification('error', `Failed to ${action} users`);
        }
    }
    
    populateRoleOptions(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '';
        this.core.roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id;
            option.textContent = role.name;
            select.appendChild(option);
        });
    }
    
    getSelectedUsers() {
        const checkboxes = document.querySelectorAll('.user-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value}"` : value;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }
    
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Initialize actions when core is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.userManagementCore) {
            window.userManagementActions = new UserManagementActions(window.userManagementCore);
            
            // Override core methods with actions
            window.userManagementCore.openCreateUserModal = () => window.userManagementActions.openCreateUserModal();
            window.userManagementCore.openEditUserModal = (userId) => window.userManagementActions.openEditUserModal(userId);
            window.userManagementCore.openPermissionsModal = (userId) => window.userManagementActions.openPermissionsModal(userId);
            window.userManagementCore.handleCreateUser = (form) => window.userManagementActions.handleCreateUser(form);
            window.userManagementCore.handleEditUser = (form) => window.userManagementActions.handleEditUser(form);
            window.userManagementCore.suspendUser = (userId) => window.userManagementActions.suspendUser(userId);
            window.userManagementCore.activateUser = (userId) => window.userManagementActions.activateUser(userId);
            window.userManagementCore.deleteUser = (userId) => window.userManagementActions.deleteUser(userId);
            window.userManagementCore.exportUsers = () => window.userManagementActions.exportUsers();
            window.userManagementCore.handleBulkAction = (action) => window.userManagementActions.handleBulkAction(action);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManagementActions;
}
