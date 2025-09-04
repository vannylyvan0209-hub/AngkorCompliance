import { initializeFirebase } from '../../firebase-config.js';

class PermissionManagementDashboard {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.currentFactory = null;
        this.permissionSets = [];
        this.accessLogs = [];
        this.securityPolicies = [];
        this.recentAlerts = [];
        this.permissionMatrix = {};
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            this.initializePermissionMatrix();
            await this.loadAllData();
            this.updateOverviewCards();
        } catch (error) {
            console.error('Error initializing Permission Management Dashboard:', error);
            this.showError('Failed to initialize permission management dashboard');
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
        // Log filter
        document.getElementById('logFilter').addEventListener('change', (e) => {
            this.filterAccessLogs(e.target.value);
        });
    }

    initializePermissionMatrix() {
        this.permissionMatrix = {
            factory_admin: {
                name: 'Factory Administrator',
                permissions: {
                    'View Documents': true,
                    'Upload Documents': true,
                    'Approve Documents': true,
                    'View Compliance': true,
                    'Manage CAPs': true,
                    'View Audits': true,
                    'View Users': true,
                    'Invite Users': true,
                    'Manage Roles': true,
                    'View Reports': true,
                    'Export Data': true,
                    'View Analytics': true
                }
            },
            compliance_manager: {
                name: 'Compliance Manager',
                permissions: {
                    'View Documents': true,
                    'Upload Documents': true,
                    'Approve Documents': true,
                    'View Compliance': true,
                    'Manage CAPs': true,
                    'View Audits': true,
                    'View Users': false,
                    'Invite Users': false,
                    'Manage Roles': false,
                    'View Reports': true,
                    'Export Data': true,
                    'View Analytics': true
                }
            },
            hr_manager: {
                name: 'HR Manager',
                permissions: {
                    'View Documents': true,
                    'Upload Documents': true,
                    'Approve Documents': false,
                    'View Compliance': true,
                    'Manage CAPs': false,
                    'View Audits': true,
                    'View Users': true,
                    'Invite Users': true,
                    'Manage Roles': false,
                    'View Reports': true,
                    'Export Data': true,
                    'View Analytics': true
                }
            },
            supervisor: {
                name: 'Supervisor',
                permissions: {
                    'View Documents': true,
                    'Upload Documents': true,
                    'Approve Documents': false,
                    'View Compliance': true,
                    'Manage CAPs': false,
                    'View Audits': false,
                    'View Users': false,
                    'Invite Users': false,
                    'Manage Roles': false,
                    'View Reports': true,
                    'Export Data': false,
                    'View Analytics': false
                }
            },
            worker: {
                name: 'Worker',
                permissions: {
                    'View Documents': true,
                    'Upload Documents': false,
                    'Approve Documents': false,
                    'View Compliance': false,
                    'Manage CAPs': false,
                    'View Audits': false,
                    'View Users': false,
                    'Invite Users': false,
                    'Manage Roles': false,
                    'View Reports': false,
                    'Export Data': false,
                    'View Analytics': false
                }
            },
            viewer: {
                name: 'Viewer',
                permissions: {
                    'View Documents': true,
                    'Upload Documents': false,
                    'Approve Documents': false,
                    'View Compliance': true,
                    'Manage CAPs': false,
                    'View Audits': true,
                    'View Users': false,
                    'Invite Users': false,
                    'Manage Roles': false,
                    'View Reports': true,
                    'Export Data': false,
                    'View Analytics': false
                }
            }
        };
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadPermissionSets(),
                this.loadAccessLogs(),
                this.loadSecurityPolicies(),
                this.loadRecentAlerts()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadPermissionSets() {
        try {
            const setsSnapshot = await this.db
                .collection('permission_sets')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('name')
                .get();

            this.permissionSets = [];
            setsSnapshot.forEach(doc => {
                const setData = doc.data();
                this.permissionSets.push({
                    id: doc.id,
                    ...setData
                });
            });

            this.updatePermissionSets();
        } catch (error) {
            console.error('Error loading permission sets:', error);
        }
    }

    async loadAccessLogs() {
        try {
            const logsSnapshot = await this.db
                .collection('access_logs')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();

            this.accessLogs = [];
            logsSnapshot.forEach(doc => {
                const logData = doc.data();
                this.accessLogs.push({
                    id: doc.id,
                    ...logData
                });
            });

            this.updateAccessLogsTable();
        } catch (error) {
            console.error('Error loading access logs:', error);
        }
    }

    async loadSecurityPolicies() {
        try {
            const policiesSnapshot = await this.db
                .collection('security_policies')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('name')
                .get();

            this.securityPolicies = [];
            policiesSnapshot.forEach(doc => {
                const policyData = doc.data();
                this.securityPolicies.push({
                    id: doc.id,
                    ...policyData
                });
            });

            this.updateSecurityPolicies();
        } catch (error) {
            console.error('Error loading security policies:', error);
        }
    }

    async loadRecentAlerts() {
        try {
            const alertsSnapshot = await this.db
                .collection('security_alerts')
                .where('factoryId', '==', this.currentFactory)
                .where('status', '==', 'active')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            this.recentAlerts = [];
            alertsSnapshot.forEach(doc => {
                const alertData = doc.data();
                this.recentAlerts.push({
                    id: doc.id,
                    ...alertData
                });
            });

            this.updateRecentAlerts();
        } catch (error) {
            console.error('Error loading recent alerts:', error);
        }
    }

    updatePermissionMatrix() {
        const tableBody = document.getElementById('permissionMatrixBody');
        const permissions = [
            'View Documents', 'Upload Documents', 'Approve Documents',
            'View Compliance', 'Manage CAPs', 'View Audits',
            'View Users', 'Invite Users', 'Manage Roles',
            'View Reports', 'Export Data', 'View Analytics'
        ];

        tableBody.innerHTML = Object.keys(this.permissionMatrix).map(role => `
            <tr>
                <td class="role-name">${this.permissionMatrix[role].name}</td>
                ${permissions.map(permission => `
                    <td class="permission-cell">
                        <div class="permission-indicator ${this.permissionMatrix[role].permissions[permission] ? 'granted' : 'denied'}">
                            <i data-lucide="${this.permissionMatrix[role].permissions[permission] ? 'check' : 'x'}"></i>
                        </div>
                    </td>
                `).join('')}
            </tr>
        `).join('');
    }

    updatePermissionSets() {
        const container = document.getElementById('permissionSets');
        
        if (this.permissionSets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="shield"></i>
                    <p>No permission sets found</p>
                    <button class="btn btn-primary" onclick="createPermissionSet()">
                        <i data-lucide="plus"></i> Create First Set
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.permissionSets.map(set => `
            <div class="permission-set-item">
                <div class="set-header">
                    <h4>${set.name}</h4>
                    <div class="set-actions">
                        <button class="btn btn-sm btn-outline" onclick="editPermissionSet('${set.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="deletePermissionSet('${set.id}')">
                            <i data-lucide="trash"></i>
                        </button>
                    </div>
                </div>
                <div class="set-description">${set.description || 'No description'}</div>
                <div class="set-permissions">
                    ${Object.keys(set.permissions || {}).map(category => `
                        <div class="permission-category">
                            <strong>${category}:</strong>
                            ${set.permissions[category].join(', ')}
                        </div>
                    `).join('')}
                </div>
                <div class="set-usage">
                    <span class="usage-count">${set.usageCount || 0} users</span>
                </div>
            </div>
        `).join('');
    }

    updateAccessLogsTable() {
        const tableBody = document.getElementById('accessLogsTable');
        
        if (this.accessLogs.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i data-lucide="activity"></i>
                        <p>No access logs found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.accessLogs.map(log => `
            <tr class="log-row ${log.result === 'denied' ? 'violation' : ''}">
                <td>
                    <div class="user-info">
                        <div class="user-avatar">
                            <i data-lucide="user"></i>
                        </div>
                        <div class="user-details">
                            <div class="user-name">${log.userName || 'Unknown User'}</div>
                            <div class="user-email">${log.userEmail || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="action-badge action-${log.action}">
                        ${this.getActionDisplayName(log.action)}
                    </span>
                </td>
                <td>${log.resource || 'N/A'}</td>
                <td>
                    <span class="result-badge result-${log.result}">
                        ${log.result}
                    </span>
                </td>
                <td>${log.ipAddress || 'N/A'}</td>
                <td>${this.formatTimeAgo(log.timestamp)}</td>
            </tr>
        `).join('');
    }

    updateSecurityPolicies() {
        const container = document.getElementById('securityPolicies');
        
        if (this.securityPolicies.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="lock"></i>
                    <p>No security policies found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.securityPolicies.map(policy => `
            <div class="policy-item">
                <div class="policy-header">
                    <h4>${policy.name}</h4>
                    <span class="policy-status status-${policy.status}">${policy.status}</span>
                </div>
                <div class="policy-description">${policy.description || 'No description'}</div>
                <div class="policy-details">
                    <div class="policy-rule">
                        <strong>Rule:</strong> ${policy.rule}
                    </div>
                    <div class="policy-action">
                        <strong>Action:</strong> ${policy.action}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateRecentAlerts() {
        const container = document.getElementById('recentAlerts');
        
        if (this.recentAlerts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="bell"></i>
                    <p>No recent alerts</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.recentAlerts.map(alert => `
            <div class="alert-item alert-${alert.severity}">
                <div class="alert-header">
                    <h4>${alert.title}</h4>
                    <span class="alert-severity severity-${alert.severity}">${alert.severity}</span>
                </div>
                <div class="alert-message">${alert.message}</div>
                <div class="alert-meta">
                    <span class="alert-time">${this.formatTimeAgo(alert.createdAt)}</span>
                    <button class="btn btn-sm btn-outline" onclick="viewAlertDetails('${alert.id}')">
                        <i data-lucide="eye"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterAccessLogs(filterType) {
        let filteredLogs = this.accessLogs;

        switch (filterType) {
            case 'login':
                filteredLogs = this.accessLogs.filter(log => log.action === 'login');
                break;
            case 'permission':
                filteredLogs = this.accessLogs.filter(log => log.action === 'permission_change');
                break;
            case 'access':
                filteredLogs = this.accessLogs.filter(log => log.action === 'access_attempt');
                break;
            case 'violation':
                filteredLogs = this.accessLogs.filter(log => log.result === 'denied');
                break;
            default:
                // Show all logs
                break;
        }

        this.updateAccessLogsTableWithData(filteredLogs);
    }

    updateAccessLogsTableWithData(logs) {
        const tableBody = document.getElementById('accessLogsTable');
        
        if (logs.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i data-lucide="search"></i>
                        <p>No logs found matching your criteria</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = logs.map(log => `
            <tr class="log-row ${log.result === 'denied' ? 'violation' : ''}">
                <td>
                    <div class="user-info">
                        <div class="user-avatar">
                            <i data-lucide="user"></i>
                        </div>
                        <div class="user-details">
                            <div class="user-name">${log.userName || 'Unknown User'}</div>
                            <div class="user-email">${log.userEmail || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="action-badge action-${log.action}">
                        ${this.getActionDisplayName(log.action)}
                    </span>
                </td>
                <td>${log.resource || 'N/A'}</td>
                <td>
                    <span class="result-badge result-${log.result}">
                        ${log.result}
                    </span>
                </td>
                <td>${log.ipAddress || 'N/A'}</td>
                <td>${this.formatTimeAgo(log.timestamp)}</td>
            </tr>
        `).join('');
    }

    updateOverviewCards() {
        const totalUsers = 156; // This would come from users collection
        const permissionSets = this.permissionSets.length;
        const accessViolations = this.accessLogs.filter(log => log.result === 'denied').length;
        const complianceScore = this.calculateComplianceScore();

        // Update card values
        document.querySelector('.overview-card:nth-child(1) .card-value').textContent = totalUsers;
        document.querySelector('.overview-card:nth-child(2) .card-value').textContent = permissionSets;
        document.querySelector('.overview-card:nth-child(3) .card-value').textContent = accessViolations;
        document.querySelector('.overview-card:nth-child(4) .card-value').textContent = `${complianceScore}%`;
    }

    calculateComplianceScore() {
        // Calculate compliance score based on security policies and access logs
        let score = 100;
        
        // Deduct points for access violations
        const violations = this.accessLogs.filter(log => log.result === 'denied').length;
        score -= violations * 2;
        
        // Deduct points for missing security policies
        const missingPolicies = 5 - this.securityPolicies.length; // Assuming 5 is the minimum required
        score -= missingPolicies * 5;
        
        // Deduct points for inactive policies
        const inactivePolicies = this.securityPolicies.filter(policy => policy.status !== 'active').length;
        score -= inactivePolicies * 3;
        
        return Math.max(0, Math.round(score));
    }

    // Helper methods
    getActionDisplayName(action) {
        const actionNames = {
            'login': 'Login',
            'logout': 'Logout',
            'permission_change': 'Permission Change',
            'access_attempt': 'Access Attempt',
            'data_export': 'Data Export',
            'user_creation': 'User Creation',
            'role_assignment': 'Role Assignment'
        };
        return actionNames[action] || action;
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
let permissionManagementDashboard;

function createPermissionSet() {
    document.getElementById('permissionSetModal').style.display = 'flex';
}

function exportPermissions() {
    alert('Export Permissions feature coming soon');
}

function bulkPermissionUpdate() {
    document.getElementById('bulkPermissionModal').style.display = 'flex';
}

function permissionAudit() {
    alert('Permission Audit feature coming soon');
}

function accessReview() {
    alert('Access Review feature coming soon');
}

function securityReport() {
    alert('Security Report feature coming soon');
}

function complianceCheck() {
    alert('Compliance Check feature coming soon');
}

function backupPermissions() {
    alert('Backup Permissions feature coming soon');
}

function editPermissionSet(setId) {
    alert('Edit Permission Set feature coming soon');
}

function deletePermissionSet(setId) {
    if (confirm('Are you sure you want to delete this permission set?')) {
        alert('Delete Permission Set feature coming soon');
    }
}

function savePermissionSet() {
    alert('Save Permission Set feature coming soon');
}

function confirmBulkPermissionUpdate() {
    alert('Confirm Bulk Permission Update feature coming soon');
}

function viewAlertDetails(alertId) {
    alert('View Alert Details feature coming soon');
}

function investigateViolation() {
    alert('Investigate Violation feature coming soon');
}

function blockUser() {
    alert('Block User feature coming soon');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    permissionManagementDashboard = new PermissionManagementDashboard();
    window.permissionManagementDashboard = permissionManagementDashboard;
    permissionManagementDashboard.init();
});
