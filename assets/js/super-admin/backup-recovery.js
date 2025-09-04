import { initializeFirebase } from '../../firebase-config.js';

class BackupRecovery {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.backupHistory = [];
        this.recoveryPoints = [];
        this.backupAnalytics = null;
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
            this.initializeBackupAnalytics();
            this.updateOverviewCards();
        } catch (error) {
            console.error('Error initializing Backup & Recovery:', error);
            this.showError('Failed to initialize backup & recovery');
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
        document.getElementById('backupSettingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBackupSettings();
        });

        // Backup frequency change
        document.getElementById('backupFrequency').addEventListener('change', (e) => {
            this.updateBackupSchedule(e.target.value);
        });
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadBackupSettings(),
                this.loadBackupHistory(),
                this.loadRecoveryPoints()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadBackupSettings() {
        try {
            const settingsDoc = await this.db.collection('backup_settings').doc('global').get();
            
            if (settingsDoc.exists) {
                this.currentSettings = settingsDoc.data();
            } else {
                // Set default settings
                this.currentSettings = {
                    backupFrequency: 'daily',
                    backupTime: '02:00',
                    retentionDays: 30,
                    backupUserData: true,
                    backupDocuments: true,
                    backupSettings: true,
                    backupLogs: false,
                    storageLocation: 'firebase',
                    enableEncryption: true,
                    enableCompression: true
                };
            }

            this.populateSettingsForm();
        } catch (error) {
            console.error('Error loading backup settings:', error);
        }
    }

    async loadBackupHistory() {
        try {
            const historySnapshot = await this.db
                .collection('backup_history')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            this.backupHistory = [];
            historySnapshot.forEach(doc => {
                const backupData = doc.data();
                this.backupHistory.push({
                    id: doc.id,
                    ...backupData
                });
            });

            this.updateBackupHistoryTable();
        } catch (error) {
            console.error('Error loading backup history:', error);
        }
    }

    async loadRecoveryPoints() {
        try {
            const pointsSnapshot = await this.db
                .collection('recovery_points')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            this.recoveryPoints = [];
            pointsSnapshot.forEach(doc => {
                const pointData = doc.data();
                this.recoveryPoints.push({
                    id: doc.id,
                    ...pointData
                });
            });

            this.updateRecoveryPoints();
        } catch (error) {
            console.error('Error loading recovery points:', error);
        }
    }

    populateSettingsForm() {
        // Backup Schedule
        document.getElementById('backupFrequency').value = this.currentSettings.backupFrequency || 'daily';
        document.getElementById('backupTime').value = this.currentSettings.backupTime || '02:00';
        document.getElementById('retentionDays').value = this.currentSettings.retentionDays || 30;

        // Backup Scope
        document.getElementById('backupUserData').checked = this.currentSettings.backupUserData || false;
        document.getElementById('backupDocuments').checked = this.currentSettings.backupDocuments || false;
        document.getElementById('backupSettings').checked = this.currentSettings.backupSettings || false;
        document.getElementById('backupLogs').checked = this.currentSettings.backupLogs || false;

        // Storage Configuration
        document.getElementById('storageLocation').value = this.currentSettings.storageLocation || 'firebase';
        document.getElementById('enableEncryption').checked = this.currentSettings.enableEncryption || false;
        document.getElementById('enableCompression').checked = this.currentSettings.enableCompression || false;
    }

    updateBackupHistoryTable() {
        const tableBody = document.getElementById('backupHistoryTable');
        
        if (this.backupHistory.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i data-lucide="history"></i>
                        <p>No backup history found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.backupHistory.map(backup => `
            <tr>
                <td>${this.formatDateTime(backup.createdAt)}</td>
                <td>
                    <span class="backup-type-badge type-${backup.type}">
                        ${backup.type}
                    </span>
                </td>
                <td>${this.formatFileSize(backup.size)}</td>
                <td>
                    <span class="status-badge status-${backup.status}">
                        ${backup.status}
                    </span>
                </td>
                <td>${backup.duration || 'N/A'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewBackupDetails('${backup.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="restoreFromBackup('${backup.id}')">
                            <i data-lucide="refresh-cw"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="downloadBackup('${backup.id}')">
                            <i data-lucide="download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateRecoveryPoints() {
        const container = document.getElementById('recoveryPoints');
        
        if (this.recoveryPoints.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="rotate-ccw"></i>
                    <p>No recovery points available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.recoveryPoints.map(point => `
            <div class="recovery-point-item">
                <div class="point-header">
                    <div class="point-date">${this.formatDate(point.createdAt)}</div>
                    <div class="point-status status-${point.status}">${point.status}</div>
                </div>
                <div class="point-details">
                    <div class="point-size">${this.formatFileSize(point.size)}</div>
                    <div class="point-type">${point.type}</div>
                </div>
                <div class="point-actions">
                    <button class="btn btn-sm btn-outline" onclick="restoreFromPoint('${point.id}')">
                        Restore
                    </button>
                </div>
            </div>
        `).join('');
    }

    initializeBackupAnalytics() {
        const ctx = document.getElementById('backupAnalyticsChart').getContext('2d');
        
        this.backupAnalytics = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Backup Size (GB)',
                    data: [2.1, 2.3, 2.0, 2.4, 2.2, 2.5, 2.4],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' GB';
                            }
                        }
                    }
                }
            }
        });
    }

    updateOverviewCards() {
        if (this.backupHistory.length === 0) return;

        const lastBackup = this.backupHistory[0];
        const totalSize = this.backupHistory.reduce((sum, backup) => sum + (backup.size || 0), 0);
        const successfulBackups = this.backupHistory.filter(backup => backup.status === 'completed').length;
        const backupHealth = Math.round((successfulBackups / this.backupHistory.length) * 100);

        // Update card values
        document.querySelector('.overview-card:nth-child(1) .card-value').textContent = this.formatTimeAgo(lastBackup.createdAt);
        document.querySelector('.overview-card:nth-child(2) .card-value').textContent = this.formatFileSize(totalSize);
        document.querySelector('.overview-card:nth-child(3) .card-value').textContent = '15 min';
        document.querySelector('.overview-card:nth-child(4) .card-value').textContent = `${backupHealth}%`;
    }

    async saveBackupSettings() {
        try {
            const formData = this.collectSettingsFormData();
            
            const settingsData = {
                ...formData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            };

            await this.db.collection('backup_settings').doc('global').set(settingsData, { merge: true });
            
            this.currentSettings = settingsData;
            this.showSuccess('Backup settings saved successfully');

        } catch (error) {
            console.error('Error saving backup settings:', error);
            this.showError('Failed to save backup settings');
        }
    }

    async createManualBackup() {
        try {
            this.showLoading('Creating backup...');

            const backupData = {
                type: 'manual',
                status: 'in_progress',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: this.currentUser.uid,
                size: 0,
                duration: 0,
                scope: this.getBackupScope()
            };

            const backupRef = await this.db.collection('backup_history').add(backupData);

            // Simulate backup process
            setTimeout(async () => {
                const backupSize = Math.floor(Math.random() * 1000) + 1000; // 1-2 GB
                const duration = Math.floor(Math.random() * 10) + 5; // 5-15 minutes

                await this.db.collection('backup_history').doc(backupRef.id).update({
                    status: 'completed',
                    size: backupSize,
                    duration: `${duration} minutes`,
                    completedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                await this.loadBackupHistory();
                this.hideLoading();
                this.showSuccess('Backup created successfully');

            }, 3000);

        } catch (error) {
            console.error('Error creating backup:', error);
            this.hideLoading();
            this.showError('Failed to create backup');
        }
    }

    async restoreFromBackup(backupId) {
        try {
            const backup = this.backupHistory.find(b => b.id === backupId);
            if (!backup) {
                this.showError('Backup not found');
                return;
            }

            if (confirm(`Are you sure you want to restore from backup created on ${this.formatDateTime(backup.createdAt)}? This action cannot be undone.`)) {
                this.showLoading('Restoring data...');

                // Simulate restore process
                setTimeout(async () => {
                    await this.db.collection('restore_history').add({
                        backupId: backupId,
                        status: 'completed',
                        restoredAt: firebase.firestore.FieldValue.serverTimestamp(),
                        restoredBy: this.currentUser.uid,
                        notes: 'Manual restore from backup'
                    });

                    this.hideLoading();
                    this.showSuccess('Data restored successfully');
                }, 5000);
            }

        } catch (error) {
            console.error('Error restoring from backup:', error);
            this.hideLoading();
            this.showError('Failed to restore data');
        }
    }

    collectSettingsFormData() {
        return {
            backupFrequency: document.getElementById('backupFrequency').value,
            backupTime: document.getElementById('backupTime').value,
            retentionDays: parseInt(document.getElementById('retentionDays').value),
            backupUserData: document.getElementById('backupUserData').checked,
            backupDocuments: document.getElementById('backupDocuments').checked,
            backupSettings: document.getElementById('backupSettings').checked,
            backupLogs: document.getElementById('backupLogs').checked,
            storageLocation: document.getElementById('storageLocation').value,
            enableEncryption: document.getElementById('enableEncryption').checked,
            enableCompression: document.getElementById('enableCompression').checked
        };
    }

    getBackupScope() {
        const scope = [];
        if (document.getElementById('backupUserData').checked) scope.push('user_data');
        if (document.getElementById('backupDocuments').checked) scope.push('documents');
        if (document.getElementById('backupSettings').checked) scope.push('settings');
        if (document.getElementById('backupLogs').checked) scope.push('logs');
        return scope;
    }

    updateBackupSchedule(frequency) {
        const backupTimeField = document.getElementById('backupTime');
        
        switch (frequency) {
            case 'hourly':
                backupTimeField.disabled = true;
                backupTimeField.value = '00:00';
                break;
            case 'daily':
                backupTimeField.disabled = false;
                break;
            case 'weekly':
                backupTimeField.disabled = false;
                break;
            case 'monthly':
                backupTimeField.disabled = false;
                break;
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

    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
let backupRecovery;

function saveBackupSettings() {
    backupRecovery.saveBackupSettings();
}

function refreshBackupHistory() {
    backupRecovery.loadBackupHistory();
}

function createManualBackup() {
    backupRecovery.createManualBackup();
}

function testRestore() {
    alert('Test Restore feature coming soon');
}

function exportBackupData() {
    alert('Export Backup Data feature coming soon');
}

function validateBackups() {
    alert('Validate Backups feature coming soon');
}

function cleanupOldBackups() {
    if (confirm('Are you sure you want to cleanup old backup files?')) {
        alert('Cleanup Old Backups feature coming soon');
    }
}

function configureDisasterRecovery() {
    alert('Configure Disaster Recovery feature coming soon');
}

function viewBackupDetails(backupId) {
    alert('View Backup Details feature coming soon');
}

function restoreFromBackup(backupId) {
    backupRecovery.restoreFromBackup(backupId);
}

function downloadBackup(backupId) {
    alert('Download Backup feature coming soon');
}

function restoreFromPoint(pointId) {
    alert('Restore From Point feature coming soon');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function confirmRestore() {
    alert('Confirm Restore feature coming soon');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    backupRecovery = new BackupRecovery();
    window.backupRecovery = backupRecovery;
    backupRecovery.init();
});
