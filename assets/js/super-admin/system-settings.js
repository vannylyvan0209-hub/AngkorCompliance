// System Settings Management
class SystemSettings {
    constructor() {
        this.currentUser = null;
        this.settings = {
            general: {},
            security: {},
            notifications: {},
            integrations: {},
            advanced: {}
        };
        this.systemLogs = [];
        this.systemStatus = {};
        
        this.init();
    }
    
    async init() {
        console.log('⚙️ Initializing System Settings...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize UI
        this.initializeUI();
        
        // Load initial data
        await this.loadSettings();
        await this.loadSystemLogs();
        await this.loadSystemStatus();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ System Settings initialized');
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
    
    async loadSettings() {
        try {
            const settingsRef = this.doc(this.db, 'system_settings', 'main');
            const settingsDoc = await this.getDoc(settingsRef);
            
            if (settingsDoc.exists()) {
                this.settings = settingsDoc.data();
            } else {
                // Load default settings
                this.settings = this.getDefaultSettings();
            }
            
            this.updateSettingsDisplay();
            
        } catch (error) {
            console.error('Error loading settings:', error);
            // Load default settings on error
            this.settings = this.getDefaultSettings();
            this.updateSettingsDisplay();
        }
    }
    
    getDefaultSettings() {
        return {
            general: {
                platformName: 'Angkor Compliance Platform',
                defaultLanguage: 'en',
                timezone: 'Asia/Phnom_Penh',
                allowRegistration: true,
                emailVerification: true,
                sessionTimeout: 30
            },
            security: {
                twoFactorAuth: false,
                passwordComplexity: 'medium',
                maxLoginAttempts: 5,
                dataEncryption: true,
                auditLogging: true
            },
            notifications: {
                systemAlerts: true,
                weeklyReports: false,
                realTimeNotifications: true
            },
            integrations: {
                emailService: 'smtp',
                fileStorage: 'firebase'
            },
            advanced: {
                cacheDuration: 24,
                rateLimit: 100,
                maintenanceMode: false
            }
        };
    }
    
    updateSettingsDisplay() {
        // Update General Settings
        document.getElementById('platformName').value = this.settings.general.platformName || 'Angkor Compliance Platform';
        document.getElementById('defaultLanguage').value = this.settings.general.defaultLanguage || 'en';
        document.getElementById('timezone').value = this.settings.general.timezone || 'Asia/Phnom_Penh';
        document.getElementById('sessionTimeout').value = this.settings.general.sessionTimeout || 30;
        
        // Update toggle switches
        this.updateToggleSwitch('allowRegistration', this.settings.general.allowRegistration);
        this.updateToggleSwitch('emailVerification', this.settings.general.emailVerification);
        this.updateToggleSwitch('twoFactorAuth', this.settings.security.twoFactorAuth);
        this.updateToggleSwitch('dataEncryption', this.settings.security.dataEncryption);
        this.updateToggleSwitch('auditLogging', this.settings.security.auditLogging);
        this.updateToggleSwitch('systemAlerts', this.settings.notifications.systemAlerts);
        this.updateToggleSwitch('weeklyReports', this.settings.notifications.weeklyReports);
        this.updateToggleSwitch('realTimeNotifications', this.settings.notifications.realTimeNotifications);
        this.updateToggleSwitch('maintenanceMode', this.settings.advanced.maintenanceMode);
        
        // Update Security Settings
        document.getElementById('passwordComplexity').value = this.settings.security.passwordComplexity || 'medium';
        document.getElementById('maxLoginAttempts').value = this.settings.security.maxLoginAttempts || 5;
        
        // Update Integrations Settings
        document.getElementById('emailService').value = this.settings.integrations.emailService || 'smtp';
        document.getElementById('fileStorage').value = this.settings.integrations.fileStorage || 'firebase';
        
        // Update Advanced Settings
        document.getElementById('cacheDuration').value = this.settings.advanced.cacheDuration || 24;
        document.getElementById('rateLimit').value = this.settings.advanced.rateLimit || 100;
    }
    
    updateToggleSwitch(elementId, isActive) {
        const element = document.getElementById(elementId);
        if (element) {
            if (isActive) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }
        }
    }
    
    async loadSystemLogs() {
        try {
            const logsRef = this.collection(this.db, 'system_logs');
            const q = this.query(
                logsRef,
                this.orderBy('timestamp', 'desc'),
                this.limit(20)
            );
            const snapshot = await this.getDocs(q);
            this.systemLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.updateSystemLogsDisplay();
            
        } catch (error) {
            console.error('Error loading system logs:', error);
        }
    }
    
    updateSystemLogsDisplay() {
        const logsList = document.getElementById('systemLogs');
        
        if (this.systemLogs.length === 0) {
            logsList.innerHTML = `
                <div style="text-align: center; padding: var(--space-4); color: var(--neutral-500);">
                    <p>No recent logs</p>
                </div>
            `;
            return;
        }
        
        logsList.innerHTML = this.systemLogs.map(log => `
            <div class="log-item">
                <div class="log-icon" style="background: ${this.getLogColor(log.level)};">
                    <i data-lucide="${this.getLogIcon(log.level)}"></i>
                </div>
                <div class="log-content">
                    <div class="log-title">${log.message}</div>
                    <div class="log-time">${this.formatDate(log.timestamp)}</div>
                </div>
            </div>
        `).join('');
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    async loadSystemStatus() {
        try {
            // Mock system status data - in real implementation, this would come from monitoring services
            this.systemStatus = {
                uptime: '99.9%',
                responseTime: '45ms',
                activeUsers: this.calculateActiveUsers(),
                storageUsed: this.calculateStorageUsed()
            };
            
            this.updateSystemStatusDisplay();
            
        } catch (error) {
            console.error('Error loading system status:', error);
        }
    }
    
    updateSystemStatusDisplay() {
        document.getElementById('uptime').textContent = this.systemStatus.uptime || '99.9%';
        document.getElementById('responseTime').textContent = this.systemStatus.responseTime || '45ms';
        document.getElementById('activeUsers').textContent = this.systemStatus.activeUsers || '1,234';
        document.getElementById('storageUsed').textContent = this.systemStatus.storageUsed || '67%';
    }
    
    calculateActiveUsers() {
        // Mock calculation - in real implementation, this would track active sessions
        return Math.floor(Math.random() * 2000) + 500;
    }
    
    calculateStorageUsed() {
        // Mock calculation - in real implementation, this would check actual storage usage
        return Math.floor(Math.random() * 40) + 50; // 50-90%
    }
    
    getLogColor(level) {
        const colorMap = {
            'info': 'var(--info-500)',
            'warning': 'var(--warning-500)',
            'error': 'var(--error-500)',
            'success': 'var(--success-500)'
        };
        return colorMap[level] || 'var(--neutral-500)';
    }
    
    getLogIcon(level) {
        const iconMap = {
            'info': 'info',
            'warning': 'alert-triangle',
            'error': 'x-circle',
            'success': 'check-circle'
        };
        return iconMap[level] || 'file-text';
    }
    
    formatDate(date) {
        if (!date) return 'N/A';
        
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    async saveAllSettings() {
        try {
            // Collect all current settings from the UI
            const currentSettings = this.collectCurrentSettings();
            
            // Save to Firebase
            const settingsRef = this.doc(this.db, 'system_settings', 'main');
            await this.updateDoc(settingsRef, {
                ...currentSettings,
                lastUpdated: this.serverTimestamp(),
                updatedBy: this.currentUser.uid
            });
            
            // Log the settings update
            await this.logSystemActivity('Settings updated', 'info');
            
            this.showNotification('success', 'Settings saved successfully');
            
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('error', 'Failed to save settings');
        }
    }
    
    collectCurrentSettings() {
        return {
            general: {
                platformName: document.getElementById('platformName').value,
                defaultLanguage: document.getElementById('defaultLanguage').value,
                timezone: document.getElementById('timezone').value,
                allowRegistration: document.getElementById('allowRegistration').classList.contains('active'),
                emailVerification: document.getElementById('emailVerification').classList.contains('active'),
                sessionTimeout: parseInt(document.getElementById('sessionTimeout').value)
            },
            security: {
                twoFactorAuth: document.getElementById('twoFactorAuth').classList.contains('active'),
                passwordComplexity: document.getElementById('passwordComplexity').value,
                maxLoginAttempts: parseInt(document.getElementById('maxLoginAttempts').value),
                dataEncryption: document.getElementById('dataEncryption').classList.contains('active'),
                auditLogging: document.getElementById('auditLogging').classList.contains('active')
            },
            notifications: {
                systemAlerts: document.getElementById('systemAlerts').classList.contains('active'),
                weeklyReports: document.getElementById('weeklyReports').classList.contains('active'),
                realTimeNotifications: document.getElementById('realTimeNotifications').classList.contains('active')
            },
            integrations: {
                emailService: document.getElementById('emailService').value,
                fileStorage: document.getElementById('fileStorage').value
            },
            advanced: {
                cacheDuration: parseInt(document.getElementById('cacheDuration').value),
                rateLimit: parseInt(document.getElementById('rateLimit').value),
                maintenanceMode: document.getElementById('maintenanceMode').classList.contains('active')
            }
        };
    }
    
    async resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
            try {
                const defaultSettings = this.getDefaultSettings();
                
                const settingsRef = this.doc(this.db, 'system_settings', 'main');
                await this.updateDoc(settingsRef, {
                    ...defaultSettings,
                    lastUpdated: this.serverTimestamp(),
                    updatedBy: this.currentUser.uid
                });
                
                this.settings = defaultSettings;
                this.updateSettingsDisplay();
                
                await this.logSystemActivity('Settings reset to defaults', 'warning');
                
                this.showNotification('success', 'Settings reset to defaults');
                
            } catch (error) {
                console.error('Error resetting settings:', error);
                this.showNotification('error', 'Failed to reset settings');
            }
        }
    }
    
    async createBackup() {
        try {
            // In a real implementation, this would create a comprehensive backup
            const backupData = {
                settings: this.settings,
                timestamp: new Date().toISOString(),
                createdBy: this.currentUser.uid
            };
            
            // Save backup to Firebase
            const backupRef = this.collection(this.db, 'system_backups');
            await this.addDoc(backupRef, backupData);
            
            await this.logSystemActivity('System backup created', 'info');
            
            this.showNotification('success', 'Backup created successfully');
            
        } catch (error) {
            console.error('Error creating backup:', error);
            this.showNotification('error', 'Failed to create backup');
        }
    }
    
    async restoreBackup() {
        if (confirm('Are you sure you want to restore from backup? This will overwrite current settings.')) {
            try {
                // In a real implementation, this would restore from a selected backup
                this.showNotification('info', 'Backup restoration would open a modal to select backup file');
                
            } catch (error) {
                console.error('Error restoring backup:', error);
                this.showNotification('error', 'Failed to restore backup');
            }
        }
    }
    
    async exportData() {
        try {
            const exportData = {
                settings: this.settings,
                systemLogs: this.systemLogs,
                systemStatus: this.systemStatus,
                exportDate: new Date().toISOString(),
                exportedBy: this.currentUser.uid
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `system-export-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
            
            await this.logSystemActivity('System data exported', 'info');
            
            this.showNotification('success', 'Data exported successfully');
            
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('error', 'Failed to export data');
        }
    }
    
    async logSystemActivity(message, level = 'info') {
        try {
            const logRef = this.collection(this.db, 'system_logs');
            await this.addDoc(logRef, {
                message: message,
                level: level,
                timestamp: this.serverTimestamp(),
                userId: this.currentUser.uid,
                userEmail: this.currentUser.email
            });
            
        } catch (error) {
            console.error('Error logging system activity:', error);
        }
    }
    
    initializeUI() {
        console.log('UI initialized');
    }
    
    setupEventListeners() {
        // Add event listeners for real-time updates
        console.log('Event listeners setup');
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

// Initialize the system settings when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the system settings
    window.systemSettings = new SystemSettings();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemSettings;
}
