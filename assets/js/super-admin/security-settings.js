import { initializeFirebase } from '../../firebase-config.js';

class SecuritySettings {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.securityLogs = [];
        this.securityAlerts = [];
        this.activeSessions = [];
        this.securityMetrics = null;
        this.currentSettings = {};
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            await this.loadAllData();
            this.initializeSecurityMetrics();
            this.updateOverviewCards();
        } catch (error) {
            console.error('Error initializing Security Settings:', error);
            this.showError('Failed to initialize security settings');
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    try {
                        // Get user's role information
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.role === 'super_admin') {
                                resolve();
                            } else {
                                reject(new Error('Access denied. Super admin role required.'));
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
        // Form submission
        document.getElementById('securitySettingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSecuritySettings();
        });

        // IP restriction toggle
        document.getElementById('restrictIPAccess').addEventListener('change', (e) => {
            const allowedIPsField = document.getElementById('allowedIPs');
            allowedIPsField.disabled = !e.target.checked;
        });
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadSecuritySettings(),
                this.loadSecurityLogs(),
                this.loadSecurityAlerts(),
                this.loadActiveSessions()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadSecuritySettings() {
        try {
            const settingsDoc = await this.db.collection('security_settings').doc('global').get();
            
            if (settingsDoc.exists) {
                this.currentSettings = settingsDoc.data();
            } else {
                // Set default settings
                this.currentSettings = {
                    requireMFA: false,
                    enforcePasswordPolicy: true,
                    passwordExpiryDays: 90,
                    sessionTimeout: 30,
                    restrictIPAccess: false,
                    allowedIPs: '',
                    enableAuditLogging: true,
                    logRetentionDays: 365,
                    enableDataEncryption: true,
                    enableBackupEncryption: true,
                    dataRetentionPolicy: 2555
                };
            }

            this.populateSettingsForm();
        } catch (error) {
            console.error('Error loading security settings:', error);
        }
    }

    async loadSecurityLogs() {
        try {
            const logsSnapshot = await this.db
                .collection('security_logs')
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();

            this.securityLogs = [];
            logsSnapshot.forEach(doc => {
                const logData = doc.data();
                this.securityLogs.push({
                    id: doc.id,
                    ...logData
                });
            });

            this.updateSecurityLogsTable();
        } catch (error) {
            console.error('Error loading security logs:', error);
        }
    }

    async loadSecurityAlerts() {
        try {
            const alertsSnapshot = await this.db
                .collection('security_alerts')
                .where('status', '==', 'active')
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();

            this.securityAlerts = [];
            alertsSnapshot.forEach(doc => {
                const alertData = doc.data();
                this.securityAlerts.push({
                    id: doc.id,
                    ...alertData
                });
            });

            this.updateSecurityAlerts();
        } catch (error) {
            console.error('Error loading security alerts:', error);
        }
    }

    async loadActiveSessions() {
        try {
            const sessionsSnapshot = await this.db
                .collection('active_sessions')
                .orderBy('lastActivity', 'desc')
                .limit(20)
                .get();

            this.activeSessions = [];
            sessionsSnapshot.forEach(doc => {
                const sessionData = doc.data();
                this.activeSessions.push({
                    id: doc.id,
                    ...sessionData
                });
            });

            this.updateActiveSessions();
        } catch (error) {
            console.error('Error loading active sessions:', error);
        }
    }

    populateSettingsForm() {
        // Authentication Settings
        document.getElementById('requireMFA').checked = this.currentSettings.requireMFA || false;
        document.getElementById('enforcePasswordPolicy').checked = this.currentSettings.enforcePasswordPolicy || false;
        document.getElementById('passwordExpiryDays').value = this.currentSettings.passwordExpiryDays || 90;
        document.getElementById('sessionTimeout').value = this.currentSettings.sessionTimeout || 30;

        // Access Control
        document.getElementById('restrictIPAccess').checked = this.currentSettings.restrictIPAccess || false;
        document.getElementById('allowedIPs').value = this.currentSettings.allowedIPs || '';
        document.getElementById('allowedIPs').disabled = !this.currentSettings.restrictIPAccess;
        document.getElementById('enableAuditLogging').checked = this.currentSettings.enableAuditLogging || false;
        document.getElementById('logRetentionDays').value = this.currentSettings.logRetentionDays || 365;

        // Data Protection
        document.getElementById('enableDataEncryption').checked = this.currentSettings.enableDataEncryption || false;
        document.getElementById('enableBackupEncryption').checked = this.currentSettings.enableBackupEncryption || false;
        document.getElementById('dataRetentionPolicy').value = this.currentSettings.dataRetentionPolicy || 2555;
    }

    updateSecurityLogsTable() {
        const tableBody = document.getElementById('securityLogsTable');
        
        if (this.securityLogs.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i data-lucide="activity"></i>
                        <p>No security logs found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.securityLogs.map(log => `
            <tr>
                <td>${this.formatDateTime(log.timestamp)}</td>
                <td>
                    <span class="event-badge event-${log.eventType}">
                        ${log.eventType}
                    </span>
                </td>
                <td>
                    <div class="user-info">
                        <div class="user-name">${log.userName || 'Unknown'}</div>
                        <div class="user-email">${log.userEmail || 'N/A'}</div>
                    </div>
                </td>
                <td>${log.ipAddress || 'N/A'}</td>
                <td>${log.details || 'No details'}</td>
                <td>
                    <span class="risk-badge risk-${log.riskLevel}">
                        ${log.riskLevel}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewLogDetails('${log.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="investigateEvent('${log.id}')">
                            <i data-lucide="search"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateSecurityAlerts() {
        const alertsContainer = document.getElementById('securityAlerts');
        
        if (this.securityAlerts.length === 0) {
            alertsContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="bell"></i>
                    <p>No active security alerts</p>
                </div>
            `;
            return;
        }

        alertsContainer.innerHTML = this.securityAlerts.map(alert => `
            <div class="alert-item alert-${alert.severity}">
                <div class="alert-header">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-time">${this.formatTimeAgo(alert.timestamp)}</div>
                </div>
                <div class="alert-description">${alert.description}</div>
                <div class="alert-actions">
                    <button class="btn btn-sm btn-outline" onclick="viewAlertDetails('${alert.id}')">
                        View Details
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="resolveAlert('${alert.id}')">
                        Resolve
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateActiveSessions() {
        const sessionsContainer = document.getElementById('activeSessions');
        
        if (this.activeSessions.length === 0) {
            sessionsContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="users"></i>
                    <p>No active sessions</p>
                </div>
            `;
            return;
        }

        sessionsContainer.innerHTML = this.activeSessions.map(session => `
            <div class="session-item">
                <div class="session-header">
                    <div class="session-user">${session.userName}</div>
                    <div class="session-status status-${session.status}">${session.status}</div>
                </div>
                <div class="session-details">
                    <div class="session-info">
                        <span class="session-factory">${session.factoryName || 'N/A'}</span>
                        <span class="session-ip">${session.ipAddress}</span>
                    </div>
                    <div class="session-time">${this.formatTimeAgo(session.lastActivity)}</div>
                </div>
                <div class="session-actions">
                    <button class="btn btn-sm btn-outline" onclick="terminateSession('${session.id}')">
                        <i data-lucide="log-out"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    initializeSecurityMetrics() {
        const ctx = document.getElementById('securityMetricsChart').getContext('2d');
        
        this.securityMetrics = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical'],
                datasets: [{
                    data: [65, 20, 10, 5],
                    backgroundColor: [
                        '#10b981', // Green
                        '#f59e0b', // Yellow
                        '#f97316', // Orange
                        '#ef4444'  // Red
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 10
                        }
                    }
                }
            }
        });
    }

    updateOverviewCards() {
        // Calculate security score
        const totalChecks = 10;
        const passedChecks = this.calculateSecurityScore();
        const securityScore = Math.round((passedChecks / totalChecks) * 100);
        
        // Count active threats
        const activeThreats = this.securityAlerts.filter(alert => 
            alert.severity === 'high' || alert.severity === 'critical'
        ).length;
        
        // Count active sessions
        const activeSessionsCount = this.activeSessions.length;
        
        // Count failed logins in last 24 hours
        const failedLogins = this.securityLogs.filter(log => 
            log.eventType === 'failed_login' && 
            this.isWithin24Hours(log.timestamp)
        ).length;

        // Update card values
        document.querySelector('.overview-card:nth-child(1) .card-value').textContent = `${securityScore}/100`;
        document.querySelector('.overview-card:nth-child(2) .card-value').textContent = activeThreats;
        document.querySelector('.overview-card:nth-child(3) .card-value').textContent = activeSessionsCount;
        document.querySelector('.overview-card:nth-child(4) .card-value').textContent = failedLogins;
    }

    calculateSecurityScore() {
        let score = 0;
        
        // Check various security measures
        if (this.currentSettings.requireMFA) score++;
        if (this.currentSettings.enforcePasswordPolicy) score++;
        if (this.currentSettings.enableDataEncryption) score++;
        if (this.currentSettings.enableAuditLogging) score++;
        if (this.currentSettings.restrictIPAccess) score++;
        if (this.currentSettings.enableBackupEncryption) score++;
        if (this.currentSettings.passwordExpiryDays <= 90) score++;
        if (this.currentSettings.sessionTimeout <= 30) score++;
        if (this.currentSettings.logRetentionDays >= 365) score++;
        if (this.securityAlerts.length === 0) score++;
        
        return score;
    }

    async saveSecuritySettings() {
        try {
            const formData = this.collectSettingsFormData();
            
            const settingsData = {
                ...formData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            };

            await this.db.collection('security_settings').doc('global').set(settingsData, { merge: true });
            
            this.currentSettings = settingsData;
            this.updateOverviewCards();
            this.showSuccess('Security settings saved successfully');

        } catch (error) {
            console.error('Error saving security settings:', error);
            this.showError('Failed to save security settings');
        }
    }

    collectSettingsFormData() {
        return {
            requireMFA: document.getElementById('requireMFA').checked,
            enforcePasswordPolicy: document.getElementById('enforcePasswordPolicy').checked,
            passwordExpiryDays: parseInt(document.getElementById('passwordExpiryDays').value),
            sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
            restrictIPAccess: document.getElementById('restrictIPAccess').checked,
            allowedIPs: document.getElementById('allowedIPs').value,
            enableAuditLogging: document.getElementById('enableAuditLogging').checked,
            logRetentionDays: parseInt(document.getElementById('logRetentionDays').value),
            enableDataEncryption: document.getElementById('enableDataEncryption').checked,
            enableBackupEncryption: document.getElementById('enableBackupEncryption').checked,
            dataRetentionPolicy: parseInt(document.getElementById('dataRetentionPolicy').value)
        };
    }

    async terminateSession(sessionId) {
        try {
            if (confirm('Are you sure you want to terminate this session?')) {
                await this.db.collection('active_sessions').doc(sessionId).delete();
                await this.loadActiveSessions();
                this.showSuccess('Session terminated successfully');
            }
        } catch (error) {
            console.error('Error terminating session:', error);
            this.showError('Failed to terminate session');
        }
    }

    async resolveAlert(alertId) {
        try {
            await this.db.collection('security_alerts').doc(alertId).update({
                status: 'resolved',
                resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
                resolvedBy: this.currentUser.uid
            });
            
            await this.loadSecurityAlerts();
            this.showSuccess('Alert resolved successfully');
        } catch (error) {
            console.error('Error resolving alert:', error);
            this.showError('Failed to resolve alert');
        }
    }

    // Helper methods
    formatDateTime(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Unknown';
        
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

    isWithin24Hours(timestamp) {
        if (!timestamp) return false;
        
        const now = new Date();
        const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffInHours = (now - time) / (1000 * 60 * 60);
        
        return diffInHours <= 24;
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
let securitySettings;

function saveSecuritySettings() {
    securitySettings.saveSecuritySettings();
}

function refreshSecurityLogs() {
    securitySettings.loadSecurityLogs();
}

function viewLogDetails(logId) {
    alert('View Log Details feature coming soon');
}

function investigateEvent(eventId) {
    alert('Investigate Event feature coming soon');
}

function viewAlertDetails(alertId) {
    alert('View Alert Details feature coming soon');
}

function resolveAlert(alertId) {
    securitySettings.resolveAlert(alertId);
}

function terminateSession(sessionId) {
    securitySettings.terminateSession(sessionId);
}

function generateSecurityReport() {
    alert('Generate Security Report feature coming soon');
}

function terminateAllSessions() {
    if (confirm('Are you sure you want to terminate all active sessions?')) {
        alert('Terminate All Sessions feature coming soon');
    }
}

function exportSecurityLogs() {
    alert('Export Security Logs feature coming soon');
}

function runSecurityScan() {
    alert('Run Security Scan feature coming soon');
}

function updateSecurityPolicies() {
    alert('Update Security Policies feature coming soon');
}

function configureFirewall() {
    alert('Configure Firewall feature coming soon');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function terminateSelectedSessions() {
    alert('Terminate Selected Sessions feature coming soon');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    securitySettings = new SecuritySettings();
    window.securitySettings = securitySettings;
    securitySettings.init();
});
