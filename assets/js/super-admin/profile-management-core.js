// Super Admin Profile Management Core
class ProfileManagementCore {
    constructor() {
        this.currentUser = null;
        this.profileData = {};
        this.securitySettings = [];
        this.activityLog = [];
        this.currentTab = 'information';
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        console.log('👤 Initializing Super Admin Profile Management Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ Super Admin Profile Management Core initialized');
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
            window.superAdminNavigation.updateCurrentPage('Profile Management');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadProfileData(),
            this.loadSecuritySettings(),
            this.loadActivityLog()
        ]);
        
        this.updateOverviewStats();
        this.renderProfileData();
        this.renderSecuritySettings();
        this.renderActivityLog();
    }
    
    async loadProfileData() {
        try {
            if (this.currentUser) {
                const profileRef = this.doc(this.db, 'user_profiles', this.currentUser.uid);
                const profileDoc = await this.getDoc(profileRef);
                
                if (profileDoc.exists()) {
                    this.profileData = profileDoc.data();
                } else {
                    this.profileData = this.getMockProfileData();
                }
            } else {
                this.profileData = this.getMockProfileData();
            }
            console.log('✓ Loaded profile data');
        } catch (error) {
            console.error('Error loading profile data:', error);
            this.profileData = this.getMockProfileData();
        }
    }
    
    async loadSecuritySettings() {
        try {
            const securityRef = this.collection(this.db, 'security_settings');
            const snapshot = await this.getDocs(securityRef);
            this.securitySettings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.securitySettings.length === 0) {
                this.securitySettings = this.getMockSecuritySettings();
            }
            console.log(`✓ Loaded ${this.securitySettings.length} security settings`);
        } catch (error) {
            console.error('Error loading security settings:', error);
            this.securitySettings = this.getMockSecuritySettings();
        }
    }
    
    async loadActivityLog() {
        try {
            const activityRef = this.collection(this.db, 'user_activity');
            const snapshot = await this.getDocs(activityRef);
            this.activityLog = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.activityLog.length === 0) {
                this.activityLog = this.getMockActivityLog();
            }
            console.log(`✓ Loaded ${this.activityLog.length} activity log entries`);
        } catch (error) {
            console.error('Error loading activity log:', error);
            this.activityLog = this.getMockActivityLog();
        }
    }
    
    getMockProfileData() {
        return {
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@angkor-compliance.com',
            phone: '+855 23 123 456',
            jobTitle: 'System Administrator',
            department: 'IT Administration',
            address: 'Phnom Penh, Cambodia',
            city: 'Phnom Penh',
            country: 'KH',
            postalCode: '12000',
            bio: 'Experienced system administrator with expertise in compliance management, security, and enterprise software administration. Passionate about ensuring system reliability and user experience.',
            avatar: null,
            memberSince: new Date('2024-01-01'),
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            totalLogins: 1247,
            profileViews: 89,
            preferences: {
                defaultLanguage: 'en',
                timeZone: 'Asia/Phnom_Penh',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                theme: 'light',
                notifications: 'all'
            }
        };
    }
    
    getMockSecuritySettings() {
        return [
            {
                id: 'security_1',
                name: 'Two-Factor Authentication',
                description: 'Enable two-factor authentication for enhanced security',
                isEnabled: true,
                lastUpdated: new Date('2024-02-15'),
                settings: {
                    method: 'authenticator',
                    backupCodes: 8,
                    trustedDevices: 3
                }
            },
            {
                id: 'security_2',
                name: 'Password Policy',
                description: 'Configure password requirements and expiration',
                isEnabled: true,
                lastUpdated: new Date('2024-02-14'),
                settings: {
                    minLength: 12,
                    requireUppercase: true,
                    requireLowercase: true,
                    requireNumbers: true,
                    requireSymbols: true,
                    expirationDays: 90
                }
            },
            {
                id: 'security_3',
                name: 'Session Management',
                description: 'Manage active sessions and timeout settings',
                isEnabled: true,
                lastUpdated: new Date('2024-02-13'),
                settings: {
                    timeoutMinutes: 30,
                    maxConcurrentSessions: 5,
                    requireReauth: true
                }
            },
            {
                id: 'security_4',
                name: 'Login Notifications',
                description: 'Receive notifications for login attempts',
                isEnabled: true,
                lastUpdated: new Date('2024-02-12'),
                settings: {
                    emailNotifications: true,
                    smsNotifications: false,
                    suspiciousActivity: true
                }
            },
            {
                id: 'security_5',
                name: 'API Access Control',
                description: 'Manage API keys and access permissions',
                isEnabled: true,
                lastUpdated: new Date('2024-02-11'),
                settings: {
                    apiKeys: 3,
                    rateLimit: '1000/hour',
                    ipWhitelist: true
                }
            },
            {
                id: 'security_6',
                name: 'Data Encryption',
                description: 'Configure data encryption settings',
                isEnabled: true,
                lastUpdated: new Date('2024-02-10'),
                settings: {
                    encryptionLevel: 'AES-256',
                    keyRotation: '30 days',
                    backupEncryption: true
                }
            }
        ];
    }
    
    getMockActivityLog() {
        return [
            {
                id: 'activity_1',
                title: 'Profile Updated',
                description: 'Updated personal information and contact details',
                type: 'profile',
                timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 'activity_2',
                title: 'Security Settings Changed',
                description: 'Modified two-factor authentication settings',
                type: 'security',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 'activity_3',
                title: 'System Login',
                description: 'Successfully logged into the system',
                type: 'login',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 'activity_4',
                title: 'Password Changed',
                description: 'Password successfully updated',
                type: 'security',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 'activity_5',
                title: 'Preferences Updated',
                description: 'Updated system preferences and settings',
                type: 'preferences',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 'activity_6',
                title: 'API Key Generated',
                description: 'Generated new API key for system integration',
                type: 'security',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            {
                id: 'activity_7',
                title: 'Failed Login Attempt',
                description: 'Failed login attempt from unknown IP address',
                type: 'security',
                timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
                ipAddress: '203.0.113.1',
                userAgent: 'Mozilla/5.0 (Unknown)'
            },
            {
                id: 'activity_8',
                title: 'Profile Viewed',
                description: 'Profile viewed by another administrator',
                type: 'profile',
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                ipAddress: '192.168.1.101',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        ];
    }
    
    updateOverviewStats() {
        const profileStatus = this.calculateProfileCompleteness();
        const securityLevel = this.calculateSecurityLevel();
        const preferencesCount = Object.keys(this.profileData.preferences || {}).length;
        const lastActivity = this.getLastActivityTime();
        
        document.getElementById('profileStatus').textContent = profileStatus;
        document.getElementById('securityLevel').textContent = securityLevel;
        document.getElementById('preferencesCount').textContent = preferencesCount;
        document.getElementById('lastActivity').textContent = lastActivity;
    }
    
    calculateProfileCompleteness() {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'jobTitle', 'department'];
        const completedFields = requiredFields.filter(field => this.profileData[field] && this.profileData[field].trim() !== '');
        const completeness = Math.round((completedFields.length / requiredFields.length) * 100);
        
        if (completeness === 100) return 'Complete';
        if (completeness >= 80) return 'Almost Complete';
        if (completeness >= 60) return 'Partial';
        return 'Incomplete';
    }
    
    calculateSecurityLevel() {
        const enabledSecurity = this.securitySettings.filter(setting => setting.isEnabled).length;
        const totalSecurity = this.securitySettings.length;
        const securityPercentage = Math.round((enabledSecurity / totalSecurity) * 100);
        
        if (securityPercentage >= 90) return 'High';
        if (securityPercentage >= 70) return 'Medium';
        return 'Low';
    }
    
    getLastActivityTime() {
        if (this.activityLog.length === 0) return 'No activity';
        
        const lastActivity = this.activityLog[0];
        const now = new Date();
        const diff = now - lastActivity.timestamp;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    }
    
    renderProfileData() {
        // Update profile sidebar
        this.updateProfileSidebar();
        
        // Update form fields
        this.updateFormFields();
    }
    
    updateProfileSidebar() {
        const initials = (this.profileData.firstName?.[0] || 'S') + (this.profileData.lastName?.[0] || 'A');
        const fullName = `${this.profileData.firstName || 'Super'} ${this.profileData.lastName || 'Admin'}`;
        
        document.getElementById('avatarInitials').textContent = initials;
        document.getElementById('profileName').textContent = fullName;
        document.getElementById('profileRole').textContent = this.profileData.jobTitle || 'System Administrator';
        document.getElementById('memberSince').textContent = this.formatDate(this.profileData.memberSince, 'MMM YYYY');
        document.getElementById('lastLogin').textContent = this.formatTime(this.profileData.lastLogin);
        document.getElementById('totalLogins').textContent = this.profileData.totalLogins?.toLocaleString() || '0';
        document.getElementById('profileViews').textContent = this.profileData.profileViews?.toLocaleString() || '0';
    }
    
    updateFormFields() {
        // Personal Information
        document.getElementById('firstName').value = this.profileData.firstName || '';
        document.getElementById('lastName').value = this.profileData.lastName || '';
        document.getElementById('email').value = this.profileData.email || '';
        document.getElementById('phone').value = this.profileData.phone || '';
        document.getElementById('jobTitle').value = this.profileData.jobTitle || '';
        document.getElementById('department').value = this.profileData.department || '';
        
        // Contact Information
        document.getElementById('address').value = this.profileData.address || '';
        document.getElementById('city').value = this.profileData.city || '';
        document.getElementById('country').value = this.profileData.country || 'KH';
        document.getElementById('postalCode').value = this.profileData.postalCode || '';
        
        // Additional Information
        document.getElementById('bio').value = this.profileData.bio || '';
        
        // Preferences
        if (this.profileData.preferences) {
            document.getElementById('defaultLanguage').value = this.profileData.preferences.defaultLanguage || 'en';
            document.getElementById('timeZone').value = this.profileData.preferences.timeZone || 'Asia/Phnom_Penh';
            document.getElementById('dateFormat').value = this.profileData.preferences.dateFormat || 'MM/DD/YYYY';
            document.getElementById('timeFormat').value = this.profileData.preferences.timeFormat || '12h';
            document.getElementById('theme').value = this.profileData.preferences.theme || 'light';
            document.getElementById('notifications').value = this.profileData.preferences.notifications || 'all';
        }
    }
    
    renderSecuritySettings() {
        const container = document.getElementById('securitySettings');
        if (!container) return;
        
        container.innerHTML = this.securitySettings.map(setting => `
            <div class="security-item">
                <div class="security-header">
                    <div class="security-name">${setting.name}</div>
                    <div class="security-status ${setting.isEnabled ? 'enabled' : 'disabled'}">${setting.isEnabled ? 'enabled' : 'disabled'}</div>
                </div>
                <div class="security-description">${setting.description}</div>
                <div style="margin-bottom: var(--space-3);">
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        <strong>Last Updated:</strong> ${this.formatDate(setting.lastUpdated)}
                    </div>
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        <strong>Settings:</strong> ${Object.keys(setting.settings).length} configured
                    </div>
                </div>
                <div class="security-actions">
                    <button class="security-btn" onclick="configureSecurity('${setting.id}')">Configure</button>
                    <button class="security-btn" onclick="toggleSecurity('${setting.id}')">
                        ${setting.isEnabled ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderActivityLog() {
        const container = document.getElementById('activityLog');
        if (!container) return;
        
        if (this.activityLog.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: var(--space-8); color: var(--neutral-500);">
                    <i data-lucide="activity" style="width: 48px; height: 48px; margin: 0 auto var(--space-4); display: block;"></i>
                    <p>No activity found</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }
        
        container.innerHTML = this.activityLog.map(activity => `
            <div class="activity-item">
                <div class="activity-header">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                </div>
                <div class="activity-description">${activity.description}</div>
                <div style="margin-top: var(--space-2); font-size: var(--text-xs); color: var(--neutral-500);">
                    <strong>IP:</strong> ${activity.ipAddress} | <strong>Type:</strong> ${activity.type}
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    formatDate(date, format = 'MM/DD/YYYY') {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        
        if (format === 'MMM YYYY') {
            return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
        
        return d.toLocaleDateString();
    }
    
    formatTime(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }
    
    initializeUI() {
        // Initialize any UI components
    }
    
    setupEventListeners() {
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        window.exportProfile = () => this.exportProfile();
        window.saveProfile = () => this.saveProfile();
        window.refreshProfile = () => this.refreshProfile();
        window.resetProfile = () => this.resetProfile();
        window.switchTab = (tabName) => this.switchTab(tabName);
        window.uploadAvatar = () => this.uploadAvatar();
        window.cancelChanges = () => this.cancelChanges();
        window.savePersonalInfo = () => this.savePersonalInfo();
        window.resetPreferences = () => this.resetPreferences();
        window.savePreferences = () => this.savePreferences();
        window.configureSecurity = (settingId) => this.configureSecurity(settingId);
        window.toggleSecurity = (settingId) => this.toggleSecurity(settingId);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        if (this.currentUser) {
            const profileRef = this.doc(this.db, 'user_profiles', this.currentUser.uid);
            this.onSnapshot(profileRef, (doc) => {
                if (doc.exists()) {
                    this.profileData = doc.data();
                    this.updateOverviewStats();
                    this.renderProfileData();
                }
            });
        }
        
        const securityRef = this.collection(this.db, 'security_settings');
        this.onSnapshot(securityRef, (snapshot) => {
            this.securitySettings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderSecuritySettings();
        });
        
        const activityRef = this.collection(this.db, 'user_activity');
        this.onSnapshot(activityRef, (snapshot) => {
            this.activityLog = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderActivityLog();
        });
    }
    
    // Utility methods
    showNotification(type, message) {
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
    window.profileManagementCore = new ProfileManagementCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileManagementCore;
}
