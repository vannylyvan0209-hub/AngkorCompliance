// System Settings & Configuration System for Super Admin
class SystemSettingsSystem {
    constructor() {
        this.currentUser = null;
        this.settings = {};
        this.originalSettings = {};
        this.hasUnsavedChanges = false;
        
        this.init();
    }
    
    async init() {
        console.log('⚙️ Initializing System Settings & Configuration System...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize navigation
        this.initializeNavigation();
        
        // Load initial settings
        await this.loadSettings();
        
        // Initialize UI
        this.initializeUI();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup real-time updates
        this.setupRealTimeUpdates();
        
        console.log('✅ System Settings & Configuration System initialized');
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
                            
                            // Only allow super admins
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
        // Wait for navigation service to be available
        if (window.superAdminNavigation) {
            window.superAdminNavigation.updateCurrentPage('System Settings');
        } else {
            // Retry after a short delay
            setTimeout(() => {
                this.initializeNavigation();
            }, 100);
        }
    }
    
    async loadSettings() {
        try {
            const settingsRef = this.collection(this.db, 'system_settings');
            const snapshot = await this.getDocs(settingsRef);
            
            this.settings = {};
            snapshot.docs.forEach(doc => {
                this.settings[doc.id] = doc.data();
            });
            
            // If no settings in database, use default settings
            if (Object.keys(this.settings).length === 0) {
                this.settings = this.getDefaultSettings();
            }
            
            // Store original settings for comparison
            this.originalSettings = JSON.parse(JSON.stringify(this.settings));
            
            this.populateSettingsForm();
            
            console.log('✓ Loaded system settings');
            
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = this.getDefaultSettings();
            this.originalSettings = JSON.parse(JSON.stringify(this.settings));
            this.populateSettingsForm();
        }
    }
    
    getDefaultSettings() {
        return {
            general: {
                systemName: 'Angkor Compliance Platform',
                systemDescription: 'Enterprise compliance management platform for garment manufacturing',
                defaultLanguage: 'en',
                timeZone: 'Asia/Phnom_Penh',
                maintenanceMode: false,
                autoSave: true,
                sessionTimeout: 30
            },
            security: {
                mfaRequired: true,
                passwordComplexity: 'medium',
                passwordExpiry: 90
            },
            database: {
                connectionPoolSize: 20,
                queryTimeout: 30
            },
            email: {
                smtpServer: 'smtp.gmail.com',
                smtpPort: 587,
                useTLS: true
            },
            notifications: {
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: true
            },
            integrations: {
                apiRateLimit: 1000,
                apiTimeout: 30
            },
            backup: {
                autoBackup: true,
                backupFrequency: 'weekly',
                backupRetention: 30
            },
            maintenance: {
                autoCleanup: true,
                logRotation: true,
                cacheManagement: true
            }
        };
    }
    
    populateSettingsForm() {
        // General Settings
        document.getElementById('systemName').value = this.settings.general?.systemName || '';
        document.getElementById('systemDescription').value = this.settings.general?.systemDescription || '';
        document.getElementById('defaultLanguage').value = this.settings.general?.defaultLanguage || 'en';
        document.getElementById('timeZone').value = this.settings.general?.timeZone || 'Asia/Phnom_Penh';
        document.getElementById('sessionTimeout').value = this.settings.general?.sessionTimeout || 30;
        
        // Toggle switches
        this.setToggleState('maintenanceMode', this.settings.general?.maintenanceMode || false);
        this.setToggleState('autoSave', this.settings.general?.autoSave || true);
        
        // Security Settings
        document.getElementById('passwordComplexity').value = this.settings.security?.passwordComplexity || 'medium';
        document.getElementById('passwordExpiry').value = this.settings.security?.passwordExpiry || 90;
        this.setToggleState('mfaRequired', this.settings.security?.mfaRequired || true);
        
        // Database Settings
        document.getElementById('connectionPoolSize').value = this.settings.database?.connectionPoolSize || 20;
        document.getElementById('queryTimeout').value = this.settings.database?.queryTimeout || 30;
        
        // Email Settings
        document.getElementById('smtpServer').value = this.settings.email?.smtpServer || 'smtp.gmail.com';
        document.getElementById('smtpPort').value = this.settings.email?.smtpPort || 587;
        this.setToggleState('useTLS', this.settings.email?.useTLS || true);
        
        // Notification Settings
        this.setToggleState('emailNotifications', this.settings.notifications?.emailNotifications || true);
        this.setToggleState('smsNotifications', this.settings.notifications?.smsNotifications || false);
        this.setToggleState('pushNotifications', this.settings.notifications?.pushNotifications || true);
        
        // Integration Settings
        document.getElementById('apiRateLimit').value = this.settings.integrations?.apiRateLimit || 1000;
        document.getElementById('apiTimeout').value = this.settings.integrations?.apiTimeout || 30;
        
        // Backup Settings
        document.getElementById('backupFrequency').value = this.settings.backup?.backupFrequency || 'weekly';
        document.getElementById('backupRetention').value = this.settings.backup?.backupRetention || 30;
        this.setToggleState('autoBackup', this.settings.backup?.autoBackup || true);
        
        // Maintenance Settings
        this.setToggleState('autoCleanup', this.settings.maintenance?.autoCleanup || true);
        this.setToggleState('logRotation', this.settings.maintenance?.logRotation || true);
        this.setToggleState('cacheManagement', this.settings.maintenance?.cacheManagement || true);
    }
    
    setToggleState(toggleId, isActive) {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            if (isActive) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
    }
    
    initializeUI() {
        // Initialize any UI components
    }
    
    setupEventListeners() {
        // Setup global event listeners
        this.setupGlobalEventListeners();
        
        // Setup form change listeners
        this.setupFormChangeListeners();
    }
    
    setupGlobalEventListeners() {
        // Settings navigation
        window.showSettingsSection = (sectionName) => {
            this.showSettingsSection(sectionName);
        };
        
        // Toggle switches
        window.toggleSetting = (settingId) => {
            this.toggleSetting(settingId);
        };
        
        // Save and reset functions
        window.saveAllSettings = () => {
            this.saveAllSettings();
        };
        
        window.resetToDefaults = () => {
            this.resetToDefaults();
        };
    }
    
    setupFormChangeListeners() {
        // Add change listeners to all form inputs
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.markAsChanged();
            });
        });
    }
    
    showSettingsSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected section
        document.getElementById(sectionName + '-settings').classList.add('active');
        
        // Add active class to clicked tab
        event.target.classList.add('active');
    }
    
    toggleSetting(settingId) {
        const toggle = document.getElementById(settingId);
        if (toggle) {
            toggle.classList.toggle('active');
            this.markAsChanged();
        }
    }
    
    markAsChanged() {
        this.hasUnsavedChanges = true;
        // You could add a visual indicator here
    }
    
    async saveAllSettings() {
        try {
            // Collect all settings from the form
            const newSettings = this.collectSettingsFromForm();
            
            // Update settings in database
            for (const [category, settings] of Object.entries(newSettings)) {
                const settingsRef = this.doc(this.db, 'system_settings', category);
                await this.updateDoc(settingsRef, {
                    ...settings,
                    updatedAt: this.serverTimestamp(),
                    updatedBy: this.currentUser.uid
                });
            }
            
            // Update local settings
            this.settings = newSettings;
            this.originalSettings = JSON.parse(JSON.stringify(this.settings));
            this.hasUnsavedChanges = false;
            
            this.showNotification('success', 'Settings saved successfully!');
            
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('error', 'Failed to save settings. Please try again.');
        }
    }
    
    collectSettingsFromForm() {
        return {
            general: {
                systemName: document.getElementById('systemName').value,
                systemDescription: document.getElementById('systemDescription').value,
                defaultLanguage: document.getElementById('defaultLanguage').value,
                timeZone: document.getElementById('timeZone').value,
                maintenanceMode: document.getElementById('maintenanceMode').classList.contains('active'),
                autoSave: document.getElementById('autoSave').classList.contains('active'),
                sessionTimeout: parseInt(document.getElementById('sessionTimeout').value)
            },
            security: {
                mfaRequired: document.getElementById('mfaRequired').classList.contains('active'),
                passwordComplexity: document.getElementById('passwordComplexity').value,
                passwordExpiry: parseInt(document.getElementById('passwordExpiry').value)
            },
            database: {
                connectionPoolSize: parseInt(document.getElementById('connectionPoolSize').value),
                queryTimeout: parseInt(document.getElementById('queryTimeout').value)
            },
            email: {
                smtpServer: document.getElementById('smtpServer').value,
                smtpPort: parseInt(document.getElementById('smtpPort').value),
                useTLS: document.getElementById('useTLS').classList.contains('active')
            },
            notifications: {
                emailNotifications: document.getElementById('emailNotifications').classList.contains('active'),
                smsNotifications: document.getElementById('smsNotifications').classList.contains('active'),
                pushNotifications: document.getElementById('pushNotifications').classList.contains('active')
            },
            integrations: {
                apiRateLimit: parseInt(document.getElementById('apiRateLimit').value),
                apiTimeout: parseInt(document.getElementById('apiTimeout').value)
            },
            backup: {
                autoBackup: document.getElementById('autoBackup').classList.contains('active'),
                backupFrequency: document.getElementById('backupFrequency').value,
                backupRetention: parseInt(document.getElementById('backupRetention').value)
            },
            maintenance: {
                autoCleanup: document.getElementById('autoCleanup').classList.contains('active'),
                logRotation: document.getElementById('logRotation').classList.contains('active'),
                cacheManagement: document.getElementById('cacheManagement').classList.contains('active')
            }
        };
    }
    
    async resetToDefaults() {
        if (!confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.')) {
            return;
        }
        
        try {
            // Reset to default settings
            this.settings = this.getDefaultSettings();
            this.populateSettingsForm();
            this.hasUnsavedChanges = true;
            
            this.showNotification('info', 'Settings reset to defaults. Click "Save All Settings" to apply changes.');
            
        } catch (error) {
            console.error('Error resetting settings:', error);
            this.showNotification('error', 'Failed to reset settings.');
        }
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        // Listen for settings updates
        const settingsRef = this.collection(this.db, 'system_settings');
        this.onSnapshot(settingsRef, (snapshot) => {
            this.settings = {};
            snapshot.docs.forEach(doc => {
                this.settings[doc.id] = doc.data();
            });
            
            // Only update form if no unsaved changes
            if (!this.hasUnsavedChanges) {
                this.populateSettingsForm();
            }
        });
    }
    
    // Utility methods
    showNotification(type, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-500)' : 
                        type === 'error' ? 'var(--error-500)' : 
                        type === 'warning' ? 'var(--warning-500)' : 'var(--info-500)'};
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

// Initialize the system settings system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the system settings system
    window.systemSettingsSystem = new SystemSettingsSystem();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemSettingsSystem;
}