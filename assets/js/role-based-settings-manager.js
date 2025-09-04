// Role-Based Settings Manager - Centralized Configuration System
class RoleBasedSettingsManager {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.currentFactory = null;
        this.settings = {};
        this.roleConfigs = this.initializeRoleConfigs();
        this.init();
    }

    async init() {
        console.log('🎛️ Initializing Role-Based Settings Manager...');
        
        // Check authentication and role
        await this.checkAuth();
        
        // Load role-specific settings
        await this.loadRoleSettings();
        
        // Setup role-based navigation
        this.setupRoleNavigation();
        
        // Initialize role-specific features
        await this.initializeRoleFeatures();
        
        console.log('✅ Role-Based Settings Manager initialized');
    }

    initializeRoleConfigs() {
        return {
            super_admin: {
                name: 'Super Admin',
                description: 'Complete system administration',
                settingsPages: ['settings.html'],
                permissions: {
                    users: ['create', 'read', 'update', 'delete'],
                    factories: ['create', 'read', 'update', 'delete'],
                    caps: ['create', 'read', 'update', 'delete'],
                    documents: ['create', 'read', 'update', 'delete'],
                    audit: ['read', 'export', 'clear'],
                    system: ['read', 'update'],
                    analytics: ['read', 'export'],
                    notifications: ['read', 'update']
                },
                features: {
                    globalSettings: true,
                    userManagement: true,
                    factoryManagement: true,
                    systemMonitoring: true,
                    auditLogging: true,
                    analytics: true
                }
            },
            factory_admin: {
                name: 'Factory Admin',
                description: 'Factory-specific administration',
                settingsPages: ['factory-admin-settings.html'],
                permissions: {
                    users: ['read', 'update'], // Limited to factory users
                    factories: ['read', 'update'], // Limited to own factory
                    caps: ['create', 'read', 'update'], // Limited to factory CAPs
                    documents: ['create', 'read', 'update'], // Limited to factory documents
                    audit: ['read'], // Limited to factory audit
                    system: ['read'],
                    analytics: ['read'], // Limited to factory analytics
                    notifications: ['read', 'update']
                },
                features: {
                    factorySettings: true,
                    userManagement: true,
                    complianceManagement: true,
                    reporting: true,
                    notifications: true
                }
            },
            hr_staff: {
                name: 'HR Staff',
                description: 'Human resources and workforce management',
                settingsPages: ['hr-staff-settings.html'],
                permissions: {
                    users: ['create', 'read', 'update'], // HR user management
                    factories: ['read'], // Read-only factory info
                    caps: ['read'], // Read-only CAP access
                    documents: ['read'], // Read-only document access
                    audit: ['read'], // Limited audit access
                    system: ['read'],
                    analytics: ['read'], // HR-specific analytics
                    notifications: ['read', 'update']
                },
                features: {
                    workforceManagement: true,
                    grievanceManagement: true,
                    trainingManagement: true,
                    hrReports: true,
                    notifications: true
                }
            },
            auditor: {
                name: 'Auditor',
                description: 'Compliance auditing and verification',
                settingsPages: ['auditor-settings.html'],
                permissions: {
                    users: ['read'], // Read-only user access
                    factories: ['read'], // Read-only factory access
                    caps: ['read'], // Read-only CAP access
                    documents: ['read'], // Read-only document access
                    audit: ['read', 'export'], // Full audit access
                    system: ['read'],
                    analytics: ['read', 'export'], // Full analytics access
                    notifications: ['read']
                },
                features: {
                    auditManagement: true,
                    complianceStandards: true,
                    auditChecklists: true,
                    findingsManagement: true,
                    auditReports: true,
                    notifications: true
                }
            },
            viewer: {
                name: 'Viewer',
                description: 'Read-only access to compliance data',
                settingsPages: ['viewer-settings.html'],
                permissions: {
                    users: ['read'], // Read-only
                    factories: ['read'], // Read-only
                    caps: ['read'], // Read-only
                    documents: ['read'], // Read-only
                    audit: ['read'], // Read-only
                    system: ['read'],
                    analytics: ['read'], // Read-only
                    notifications: ['read']
                },
                features: {
                    viewingPreferences: true,
                    dashboardSettings: true,
                    reportAccess: true,
                    notificationSettings: true,
                    exportSettings: true
                }
            }
        };
    }

    async checkAuth() {
        try {
            const user = auth.currentUser;
            if (!user) {
                window.location.href = 'login.html';
                return;
            }

            // Get user data
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (!userDoc.exists) {
                window.location.href = 'login.html';
                return;
            }

            const userData = userDoc.data();
            this.currentUser = userData;
            this.currentRole = userData.role;
            this.currentFactory = userData.factoryId;

            // Update UI
            document.getElementById('userName').textContent = userData.name || userData.email;

        } catch (error) {
            console.error('❌ Authentication error:', error);
            window.location.href = 'login.html';
        }
    }

    async loadRoleSettings() {
        try {
            const roleConfig = this.roleConfigs[this.currentRole];
            if (!roleConfig) {
                throw new Error(`Invalid role: ${this.currentRole}`);
            }

            // Load role-specific settings
            const settingsCollection = `${this.currentRole}_settings`;
            const settingsQuery = this.currentFactory 
                ? db.collection(settingsCollection).where('factoryId', '==', this.currentFactory)
                : db.collection(settingsCollection).where('userId', '==', this.currentUser.uid);

            const settingsSnapshot = await settingsQuery.limit(1).get();

            if (!settingsSnapshot.empty) {
                this.settings = settingsSnapshot.docs[0].data();
            }

        } catch (error) {
            console.error('❌ Error loading role settings:', error);
        }
    }

    setupRoleNavigation() {
        const roleConfig = this.roleConfigs[this.currentRole];
        if (!roleConfig) return;

        // Update page title and description
        document.title = `${roleConfig.name} Settings - Angkor Compliance`;
        
        const headerTitle = document.querySelector('.header-left h1');
        if (headerTitle) {
            headerTitle.textContent = `${roleConfig.name} Settings`;
        }

        const headerDescription = document.querySelector('.header-left p');
        if (headerDescription) {
            headerDescription.textContent = roleConfig.description;
        }

        // Setup role-specific navigation
        this.setupRoleSpecificNavigation();
    }

    setupRoleSpecificNavigation() {
        const roleConfig = this.roleConfigs[this.currentRole];
        if (!roleConfig) return;

        // Hide/show navigation items based on role permissions
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const tabId = item.getAttribute('onclick')?.match(/showTab\('([^']+)'\)/)?.[1];
            if (tabId) {
                const hasPermission = this.checkTabPermission(tabId);
                item.style.display = hasPermission ? 'block' : 'none';
            }
        });

        // Show first available tab
        const firstVisibleTab = document.querySelector('.nav-item[style="display: block"], .nav-item:not([style="display: none"])');
        if (firstVisibleTab) {
            const tabId = firstVisibleTab.getAttribute('onclick')?.match(/showTab\('([^']+)'\)/)?.[1];
            if (tabId) {
                this.showTab(tabId);
            }
        }
    }

    checkTabPermission(tabId) {
        const roleConfig = this.roleConfigs[this.currentRole];
        if (!roleConfig) return false;

        const tabPermissions = {
            general: true, // All roles can access general settings
            factory: roleConfig.features.factorySettings,
            users: roleConfig.permissions.users.includes('read'),
            compliance: roleConfig.features.complianceStandards || roleConfig.features.auditManagement,
            notifications: roleConfig.permissions.notifications.includes('read'),
            reports: roleConfig.features.reporting || roleConfig.features.auditReports,
            audit: roleConfig.permissions.audit.includes('read'),
            workforce: roleConfig.features.workforceManagement,
            grievances: roleConfig.features.grievanceManagement,
            training: roleConfig.features.trainingManagement,
            checklists: roleConfig.features.auditChecklists,
            findings: roleConfig.features.findingsManagement
        };

        return tabPermissions[tabId] || false;
    }

    async initializeRoleFeatures() {
        const roleConfig = this.roleConfigs[this.currentRole];
        if (!roleConfig) return;

        // Initialize role-specific features
        switch (this.currentRole) {
            case 'super_admin':
                await this.initializeSuperAdminFeatures();
                break;
            case 'factory_admin':
                await this.initializeFactoryAdminFeatures();
                break;
            case 'hr_staff':
                await this.initializeHRStaffFeatures();
                break;
            case 'auditor':
                await this.initializeAuditorFeatures();
                break;
            case 'viewer':
                await this.initializeViewerFeatures();
                break;
        }
    }

    async initializeSuperAdminFeatures() {
        // Initialize global system monitoring
        await this.loadSystemMetrics();
        await this.setupGlobalNotifications();
        await this.initializeGlobalAnalytics();
    }

    async initializeFactoryAdminFeatures() {
        // Initialize factory-specific features
        await this.loadFactoryData();
        await this.setupFactoryNotifications();
        await this.initializeFactoryAnalytics();
    }

    async initializeHRStaffFeatures() {
        // Initialize HR-specific features
        await this.loadWorkforceData();
        await this.setupHRNotifications();
        await this.initializeHRAnalytics();
    }

    async initializeAuditorFeatures() {
        // Initialize auditor-specific features
        await this.loadAuditData();
        await this.setupAuditNotifications();
        await this.initializeAuditAnalytics();
    }

    async initializeViewerFeatures() {
        // Initialize viewer-specific features
        await this.loadViewingPreferences();
        await this.setupViewerNotifications();
        await this.initializeViewerAnalytics();
    }

    // Role-specific data loading methods
    async loadSystemMetrics() {
        try {
            const metrics = await this.getSystemMetrics();
            this.updateSystemMetricsDisplay(metrics);
        } catch (error) {
            console.error('❌ Error loading system metrics:', error);
        }
    }

    async loadFactoryData() {
        try {
            const factoryData = await this.getFactoryData();
            this.updateFactoryDataDisplay(factoryData);
        } catch (error) {
            console.error('❌ Error loading factory data:', error);
        }
    }

    async loadWorkforceData() {
        try {
            const workforceData = await this.getWorkforceData();
            this.updateWorkforceDataDisplay(workforceData);
        } catch (error) {
            console.error('❌ Error loading workforce data:', error);
        }
    }

    async loadAuditData() {
        try {
            const auditData = await this.getAuditData();
            this.updateAuditDataDisplay(auditData);
        } catch (error) {
            console.error('❌ Error loading audit data:', error);
        }
    }

    async loadViewingPreferences() {
        try {
            const preferences = await this.getViewingPreferences();
            this.updateViewingPreferencesDisplay(preferences);
        } catch (error) {
            console.error('❌ Error loading viewing preferences:', error);
        }
    }

    // Data retrieval methods
    async getSystemMetrics() {
        const usersSnapshot = await db.collection('users').get();
        const factoriesSnapshot = await db.collection('factories').get();
        const documentsSnapshot = await db.collection('documents').get();
        const capsSnapshot = await db.collection('caps').get();

        return {
            totalUsers: usersSnapshot.size,
            totalFactories: factoriesSnapshot.size,
            totalDocuments: documentsSnapshot.size,
            totalCAPs: capsSnapshot.size,
            activeUsers: usersSnapshot.docs.filter(doc => doc.data().status === 'active').length,
            activeFactories: factoriesSnapshot.docs.filter(doc => doc.data().status === 'active').length
        };
    }

    async getFactoryData() {
        if (!this.currentFactory) return {};

        const factoryDoc = await db.collection('factories').doc(this.currentFactory).get();
        return factoryDoc.exists ? factoryDoc.data() : {};
    }

    async getWorkforceData() {
        if (!this.currentFactory) return {};

        const settingsDoc = await db.collection('hr_settings')
            .where('factoryId', '==', this.currentFactory)
            .limit(1)
            .get();

        return settingsDoc.empty ? {} : settingsDoc.docs[0].data();
    }

    async getAuditData() {
        const auditSnapshot = await db.collection('audit_log')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();

        return auditSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getViewingPreferences() {
        const preferencesDoc = await db.collection('viewer_settings')
            .where('userId', '==', this.currentUser.uid)
            .limit(1)
            .get();

        return preferencesDoc.empty ? {} : preferencesDoc.docs[0].data();
    }

    // Display update methods
    updateSystemMetricsDisplay(metrics) {
        // Update system metrics display
        Object.keys(metrics).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = metrics[key];
            }
        });
    }

    updateFactoryDataDisplay(factoryData) {
        // Update factory data display
        Object.keys(factoryData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = factoryData[key];
            }
        });
    }

    updateWorkforceDataDisplay(workforceData) {
        // Update workforce data display
        Object.keys(workforceData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = workforceData[key];
            }
        });
    }

    updateAuditDataDisplay(auditData) {
        // Update audit data display
        const auditContainer = document.getElementById('auditData');
        if (auditContainer) {
            auditContainer.innerHTML = auditData.map(audit => `
                <div class="audit-item">
                    <div class="audit-action">${audit.action}</div>
                    <div class="audit-user">${audit.userName}</div>
                    <div class="audit-time">${audit.timestamp?.toDate().toLocaleString()}</div>
                </div>
            `).join('');
        }
    }

    updateViewingPreferencesDisplay(preferences) {
        // Update viewing preferences display
        Object.keys(preferences).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = preferences[key];
            }
        });
    }

    // Notification setup methods
    async setupGlobalNotifications() {
        // Setup global system notifications
        if (window.notificationSystem) {
            window.notificationSystem.subscribe('system_alert', this.handleSystemAlert.bind(this));
            window.notificationSystem.subscribe('user_registered', this.handleUserRegistered.bind(this));
            window.notificationSystem.subscribe('factory_registered', this.handleFactoryRegistered.bind(this));
        }
    }

    async setupFactoryNotifications() {
        // Setup factory-specific notifications
        if (window.notificationSystem) {
            window.notificationSystem.subscribe('cap_created', this.handleCAPCreated.bind(this));
            window.notificationSystem.subscribe('document_uploaded', this.handleDocumentUploaded.bind(this));
            window.notificationSystem.subscribe('compliance_alert', this.handleComplianceAlert.bind(this));
        }
    }

    async setupHRNotifications() {
        // Setup HR-specific notifications
        if (window.notificationSystem) {
            window.notificationSystem.subscribe('grievance_submitted', this.handleGrievanceSubmitted.bind(this));
            window.notificationSystem.subscribe('training_reminder', this.handleTrainingReminder.bind(this));
            window.notificationSystem.subscribe('workforce_update', this.handleWorkforceUpdate.bind(this));
        }
    }

    async setupAuditNotifications() {
        // Setup auditor-specific notifications
        if (window.notificationSystem) {
            window.notificationSystem.subscribe('audit_event', this.handleAuditEvent.bind(this));
            window.notificationSystem.subscribe('compliance_breach', this.handleComplianceBreach.bind(this));
            window.notificationSystem.subscribe('audit_scheduled', this.handleAuditScheduled.bind(this));
        }
    }

    async setupViewerNotifications() {
        // Setup viewer-specific notifications
        if (window.notificationSystem) {
            window.notificationSystem.subscribe('report_generated', this.handleReportGenerated.bind(this));
            window.notificationSystem.subscribe('data_updated', this.handleDataUpdated.bind(this));
        }
    }

    // Notification handlers
    handleSystemAlert(notification) {
        console.log('System alert received:', notification);
        this.showNotification(notification);
    }

    handleUserRegistered(notification) {
        console.log('User registered:', notification);
        this.showNotification(notification);
    }

    handleFactoryRegistered(notification) {
        console.log('Factory registered:', notification);
        this.showNotification(notification);
    }

    handleCAPCreated(notification) {
        console.log('CAP created:', notification);
        this.showNotification(notification);
    }

    handleDocumentUploaded(notification) {
        console.log('Document uploaded:', notification);
        this.showNotification(notification);
    }

    handleComplianceAlert(notification) {
        console.log('Compliance alert:', notification);
        this.showNotification(notification);
    }

    handleGrievanceSubmitted(notification) {
        console.log('Grievance submitted:', notification);
        this.showNotification(notification);
    }

    handleTrainingReminder(notification) {
        console.log('Training reminder:', notification);
        this.showNotification(notification);
    }

    handleWorkforceUpdate(notification) {
        console.log('Workforce update:', notification);
        this.showNotification(notification);
    }

    handleAuditEvent(notification) {
        console.log('Audit event:', notification);
        this.showNotification(notification);
    }

    handleComplianceBreach(notification) {
        console.log('Compliance breach:', notification);
        this.showNotification(notification);
    }

    handleAuditScheduled(notification) {
        console.log('Audit scheduled:', notification);
        this.showNotification(notification);
    }

    handleReportGenerated(notification) {
        console.log('Report generated:', notification);
        this.showNotification(notification);
    }

    handleDataUpdated(notification) {
        console.log('Data updated:', notification);
        this.showNotification(notification);
    }

    showNotification(notification) {
        // Show notification using the notification system
        if (window.notificationSystem) {
            window.notificationSystem.createNotification(
                notification.type || 'info',
                notification.title,
                notification.message,
                notification.options
            );
        }
    }

    // Analytics initialization methods
    async initializeGlobalAnalytics() {
        // Initialize global analytics
        await this.loadGlobalAnalytics();
        this.setupGlobalCharts();
    }

    async initializeFactoryAnalytics() {
        // Initialize factory analytics
        await this.loadFactoryAnalytics();
        this.setupFactoryCharts();
    }

    async initializeHRAnalytics() {
        // Initialize HR analytics
        await this.loadHRAnalytics();
        this.setupHRCharts();
    }

    async initializeAuditAnalytics() {
        // Initialize audit analytics
        await this.loadAuditAnalytics();
        this.setupAuditCharts();
    }

    async initializeViewerAnalytics() {
        // Initialize viewer analytics
        await this.loadViewerAnalytics();
        this.setupViewerCharts();
    }

    // Analytics loading methods
    async loadGlobalAnalytics() {
        // Load global analytics data
        console.log('Loading global analytics...');
    }

    async loadFactoryAnalytics() {
        // Load factory analytics data
        console.log('Loading factory analytics...');
    }

    async loadHRAnalytics() {
        // Load HR analytics data
        console.log('Loading HR analytics...');
    }

    async loadAuditAnalytics() {
        // Load audit analytics data
        console.log('Loading audit analytics...');
    }

    async loadViewerAnalytics() {
        // Load viewer analytics data
        console.log('Loading viewer analytics...');
    }

    // Chart setup methods
    setupGlobalCharts() {
        // Setup global charts
        console.log('Setting up global charts...');
    }

    setupFactoryCharts() {
        // Setup factory charts
        console.log('Setting up factory charts...');
    }

    setupHRCharts() {
        // Setup HR charts
        console.log('Setting up HR charts...');
    }

    setupAuditCharts() {
        // Setup audit charts
        console.log('Setting up audit charts...');
    }

    setupViewerCharts() {
        // Setup viewer charts
        console.log('Setting up viewer charts...');
    }

    // Tab management
    showTab(tabId) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Add active class to clicked nav item
        const clickedItem = event.target.closest('.nav-item');
        if (clickedItem) {
            clickedItem.classList.add('active');
        }
    }

    // Permission checking
    hasPermission(resource, action) {
        const roleConfig = this.roleConfigs[this.currentRole];
        if (!roleConfig) return false;

        return roleConfig.permissions[resource]?.includes(action) || false;
    }

    // Settings saving
    async saveSettings(section, data) {
        try {
            const settingsCollection = `${this.currentRole}_settings`;
            const settingsRef = this.currentFactory 
                ? db.collection(settingsCollection).where('factoryId', '==', this.currentFactory)
                : db.collection(settingsCollection).where('userId', '==', this.currentUser.uid);

            const settingsSnapshot = await settingsRef.limit(1).get();

            if (settingsSnapshot.empty) {
                // Create new settings document
                await db.collection(settingsCollection).add({
                    factoryId: this.currentFactory,
                    userId: this.currentUser.uid,
                    [section]: data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: this.currentUser.uid
                });
            } else {
                // Update existing settings document
                const docRef = settingsSnapshot.docs[0].ref;
                await docRef.update({
                    [section]: data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: this.currentUser.uid
                });
            }

            // Update local settings
            this.settings[section] = data;

            // Log audit entry
            await this.logAuditEntry(`${this.currentRole}_settings_${section}_updated`, {
                section: section,
                data: data
            });

            return true;

        } catch (error) {
            console.error('❌ Error saving settings:', error);
            throw error;
        }
    }

    async logAuditEntry(action, data) {
        try {
            await db.collection('audit_log').add({
                action: action,
                userId: this.currentUser.uid,
                userName: this.currentUser.name || this.currentUser.email,
                userRole: this.currentRole,
                factoryId: this.currentFactory,
                data: data,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ipAddress: await this.getClientIP(),
                userAgent: navigator.userAgent
            });
        } catch (error) {
            console.error('❌ Error logging audit entry:', error);
        }
    }

    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'Unknown';
        }
    }

    // Utility methods
    showSuccess(message) {
        if (window.notificationSystem) {
            window.notificationSystem.createNotification('success', 'Success', message);
        } else {
            alert(message);
        }
    }

    showError(message) {
        if (window.notificationSystem) {
            window.notificationSystem.createNotification('error', 'Error', message);
        } else {
            alert(message);
        }
    }

    // Public API methods
    getCurrentRole() {
        return this.currentRole;
    }

    getCurrentFactory() {
        return this.currentFactory;
    }

    getRoleConfig() {
        return this.roleConfigs[this.currentRole];
    }

    getSettings() {
        return this.settings;
    }
}

// Initialize Role-Based Settings Manager
let roleSettingsManager;

document.addEventListener('DOMContentLoaded', function() {
    roleSettingsManager = new RoleBasedSettingsManager();
});

// Global functions for HTML onclick handlers
window.showTab = (tabId) => {
    if (roleSettingsManager) {
        roleSettingsManager.showTab(tabId);
    }
};

window.logout = () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('❌ Logout error:', error);
    });
};

// Export for use in other modules
window.RoleBasedSettingsManager = RoleBasedSettingsManager;
