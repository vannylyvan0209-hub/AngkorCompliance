// Notification System Core for Super Admin
class NotificationSystemCore {
    constructor() {
        this.currentUser = null;
        this.notifications = [];
        this.alertConfigs = [];
        this.communicationTools = [];
        this.currentTab = 'all';
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        console.log('🔔 Initializing Notification System Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ Notification System Core initialized');
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
            window.superAdminNavigation.updateCurrentPage('Notification System');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadNotifications(),
            this.loadAlertConfigs(),
            this.loadCommunicationTools()
        ]);
        
        this.updateOverviewStats();
        this.renderNotifications();
        this.renderAlertConfigs();
        this.renderCommunicationTools();
    }
    
    async loadNotifications() {
        try {
            const notificationsRef = this.collection(this.db, 'notifications');
            const snapshot = await this.getDocs(notificationsRef);
            this.notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.notifications.length === 0) {
                this.notifications = this.getMockNotifications();
            }
            console.log(`✓ Loaded ${this.notifications.length} notifications`);
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.notifications = this.getMockNotifications();
        }
    }
    
    async loadAlertConfigs() {
        try {
            const alertConfigsRef = this.collection(this.db, 'alert_configs');
            const snapshot = await this.getDocs(alertConfigsRef);
            this.alertConfigs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.alertConfigs.length === 0) {
                this.alertConfigs = this.getMockAlertConfigs();
            }
            console.log(`✓ Loaded ${this.alertConfigs.length} alert configurations`);
        } catch (error) {
            console.error('Error loading alert configs:', error);
            this.alertConfigs = this.getMockAlertConfigs();
        }
    }
    
    async loadCommunicationTools() {
        try {
            const toolsRef = this.collection(this.db, 'communication_tools');
            const snapshot = await this.getDocs(toolsRef);
            this.communicationTools = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.communicationTools.length === 0) {
                this.communicationTools = this.getMockCommunicationTools();
            }
            console.log(`✓ Loaded ${this.communicationTools.length} communication tools`);
        } catch (error) {
            console.error('Error loading communication tools:', error);
            this.communicationTools = this.getMockCommunicationTools();
        }
    }
    
    getMockNotifications() {
        return [
            {
                id: 'notif_1',
                title: 'System Performance Alert',
                content: 'Database response time has exceeded 2 seconds. Consider optimizing queries.',
                type: 'system',
                priority: 'high',
                isRead: false,
                isUrgent: false,
                timestamp: new Date('2024-02-15T10:30:00'),
                source: 'System Monitor',
                actions: ['View Details', 'Dismiss']
            },
            {
                id: 'notif_2',
                title: 'Security Threat Detected',
                content: 'Multiple failed login attempts detected from IP 192.168.1.100',
                type: 'security',
                priority: 'urgent',
                isRead: false,
                isUrgent: true,
                timestamp: new Date('2024-02-15T09:45:00'),
                source: 'Security System',
                actions: ['Block IP', 'View Logs', 'Dismiss']
            },
            {
                id: 'notif_3',
                title: 'Compliance Audit Due',
                content: 'Factory ABC-001 has a compliance audit due in 3 days',
                type: 'compliance',
                priority: 'medium',
                isRead: true,
                isUrgent: false,
                timestamp: new Date('2024-02-15T08:15:00'),
                source: 'Compliance Manager',
                actions: ['Schedule Audit', 'View Details']
            },
            {
                id: 'notif_4',
                title: 'Backup Completed Successfully',
                content: 'Daily backup completed successfully. 2.3GB of data backed up.',
                type: 'system',
                priority: 'low',
                isRead: true,
                isUrgent: false,
                timestamp: new Date('2024-02-15T06:00:00'),
                source: 'Backup System',
                actions: ['View Report']
            },
            {
                id: 'notif_5',
                title: 'New User Registration',
                content: 'New user "John Doe" has registered and is awaiting approval',
                type: 'system',
                priority: 'medium',
                isRead: false,
                isUrgent: false,
                timestamp: new Date('2024-02-14T16:30:00'),
                source: 'User Management',
                actions: ['Approve', 'Reject', 'View Profile']
            },
            {
                id: 'notif_6',
                title: 'Performance Optimization Available',
                content: 'AI has identified 3 optimization opportunities that could improve system performance by 15%',
                type: 'performance',
                priority: 'medium',
                isRead: false,
                isUrgent: false,
                timestamp: new Date('2024-02-14T14:20:00'),
                source: 'AI Copilot',
                actions: ['View Recommendations', 'Implement']
            },
            {
                id: 'notif_7',
                title: 'Certificate Expiring Soon',
                content: 'SSL certificate for angkor-compliance.com expires in 30 days',
                type: 'security',
                priority: 'high',
                isRead: false,
                isUrgent: false,
                timestamp: new Date('2024-02-14T12:00:00'),
                source: 'Security System',
                actions: ['Renew Certificate', 'View Details']
            },
            {
                id: 'notif_8',
                title: 'Factory Status Update',
                content: 'Factory XYZ-002 has completed all compliance requirements for this quarter',
                type: 'compliance',
                priority: 'low',
                isRead: true,
                isUrgent: false,
                timestamp: new Date('2024-02-14T10:45:00'),
                source: 'Factory Manager',
                actions: ['View Report', 'Generate Certificate']
            }
        ];
    }
    
    getMockAlertConfigs() {
        return [
            {
                id: 'alert_1',
                name: 'System Performance Alerts',
                description: 'Monitor system performance metrics and send alerts when thresholds are exceeded',
                isEnabled: true,
                settings: {
                    cpuThreshold: '80%',
                    memoryThreshold: '85%',
                    diskThreshold: '90%',
                    responseTimeThreshold: '2s'
                }
            },
            {
                id: 'alert_2',
                name: 'Security Alerts',
                description: 'Monitor security events and send immediate alerts for threats',
                isEnabled: true,
                settings: {
                    failedLoginThreshold: '5',
                    suspiciousActivityThreshold: '3',
                    malwareDetection: 'enabled',
                    intrusionDetection: 'enabled'
                }
            },
            {
                id: 'alert_3',
                name: 'Compliance Alerts',
                description: 'Monitor compliance deadlines and send reminders for upcoming audits',
                isEnabled: true,
                settings: {
                    auditReminderDays: '7',
                    complianceDeadlineDays: '30',
                    violationThreshold: '1',
                    reportDueDays: '5'
                }
            },
            {
                id: 'alert_4',
                name: 'Backup Alerts',
                description: 'Monitor backup processes and send alerts for failures or issues',
                isEnabled: true,
                settings: {
                    backupFailureAlert: 'enabled',
                    backupSizeThreshold: '10GB',
                    backupTimeThreshold: '6h',
                    retentionAlertDays: '7'
                }
            },
            {
                id: 'alert_5',
                name: 'User Activity Alerts',
                description: 'Monitor user activity and send alerts for unusual behavior',
                isEnabled: false,
                settings: {
                    inactiveUserDays: '30',
                    unusualLoginLocation: 'enabled',
                    bulkUserActions: 'enabled',
                    privilegeEscalation: 'enabled'
                }
            },
            {
                id: 'alert_6',
                name: 'System Health Alerts',
                description: 'Monitor overall system health and send alerts for critical issues',
                isEnabled: true,
                settings: {
                    uptimeThreshold: '99%',
                    errorRateThreshold: '5%',
                    serviceDownAlert: 'enabled',
                    maintenanceModeAlert: 'enabled'
                }
            }
        ];
    }
    
    getMockCommunicationTools() {
        return [
            {
                id: 'tool_1',
                name: 'Email Notifications',
                description: 'Send email notifications to administrators and users',
                status: 'active',
                settings: {
                    smtpServer: 'smtp.angkor-compliance.com',
                    fromAddress: 'noreply@angkor-compliance.com',
                    dailyLimit: '1000',
                    templateEngine: 'enabled'
                }
            },
            {
                id: 'tool_2',
                name: 'SMS Alerts',
                description: 'Send SMS alerts for critical system events',
                status: 'active',
                settings: {
                    provider: 'Twilio',
                    dailyLimit: '100',
                    criticalOnly: 'enabled',
                    internationalSupport: 'enabled'
                }
            },
            {
                id: 'tool_3',
                name: 'Slack Integration',
                description: 'Send notifications to Slack channels for team collaboration',
                status: 'inactive',
                settings: {
                    webhookUrl: 'configured',
                    channel: '#system-alerts',
                    mentionUsers: 'enabled',
                    richFormatting: 'enabled'
                }
            },
            {
                id: 'tool_4',
                name: 'Webhook Notifications',
                description: 'Send HTTP webhook notifications to external systems',
                status: 'active',
                settings: {
                    retryAttempts: '3',
                    timeoutSeconds: '30',
                    authentication: 'enabled',
                    payloadFormat: 'JSON'
                }
            },
            {
                id: 'tool_5',
                name: 'Push Notifications',
                description: 'Send push notifications to mobile devices',
                status: 'active',
                settings: {
                    provider: 'Firebase',
                    dailyLimit: '500',
                    badgeCount: 'enabled',
                    soundEnabled: 'enabled'
                }
            },
            {
                id: 'tool_6',
                name: 'In-App Notifications',
                description: 'Display notifications within the application interface',
                status: 'active',
                settings: {
                    autoHide: 'enabled',
                    hideDelay: '5s',
                    position: 'top-right',
                    animation: 'enabled'
                }
            }
        ];
    }
    
    updateOverviewStats() {
        const total = this.notifications.length;
        const unread = this.notifications.filter(n => !n.isRead).length;
        const urgent = this.notifications.filter(n => n.isUrgent).length;
        const sentToday = this.notifications.filter(n => {
            const today = new Date();
            const notificationDate = n.timestamp.toDate ? n.timestamp.toDate() : new Date(n.timestamp);
            return notificationDate.toDateString() === today.toDateString();
        }).length;
        
        document.getElementById('totalNotifications').textContent = total;
        document.getElementById('unreadNotifications').textContent = unread;
        document.getElementById('urgentNotifications').textContent = urgent;
        document.getElementById('sentNotifications').textContent = sentToday;
    }
    
    renderNotifications() {
        this.renderNotificationTab('all', this.notifications);
        this.renderNotificationTab('unread', this.notifications.filter(n => !n.isRead));
        this.renderNotificationTab('urgent', this.notifications.filter(n => n.isUrgent));
        this.renderNotificationTab('system', this.notifications.filter(n => n.type === 'system'));
        this.renderNotificationTab('security', this.notifications.filter(n => n.type === 'security'));
    }
    
    renderNotificationTab(tabName, notifications) {
        const container = document.getElementById(tabName === 'all' ? 'allNotifications' : 
                                                tabName === 'unread' ? 'unreadNotificationsList' :
                                                tabName === 'urgent' ? 'urgentNotificationsList' :
                                                tabName === 'system' ? 'systemNotifications' :
                                                'securityNotifications');
        
        if (!container) return;
        
        if (notifications.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: var(--space-8); color: var(--neutral-500);">
                    <i data-lucide="bell-off" style="width: 48px; height: 48px; margin: 0 auto var(--space-4); display: block;"></i>
                    <p>No ${tabName} notifications found</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }
        
        container.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.isRead ? '' : 'unread'} ${notification.isUrgent ? 'urgent' : ''}" 
                 onclick="viewNotification('${notification.id}')">
                <div class="notification-header-item">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
                </div>
                <div class="notification-content">${notification.content}</div>
                <div class="notification-meta">
                    <div class="notification-type ${notification.type}">${notification.type}</div>
                    <div class="notification-actions">
                        ${notification.actions.map(action => `
                            <button class="notification-action-btn" onclick="event.stopPropagation(); handleNotificationAction('${notification.id}', '${action}')">
                                ${action}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    renderAlertConfigs() {
        const container = document.getElementById('alertConfigGrid');
        if (!container) return;
        
        container.innerHTML = this.alertConfigs.map(config => `
            <div class="config-item">
                <div class="config-header-item">
                    <div class="config-name">${config.name}</div>
                    <div class="config-toggle ${config.isEnabled ? 'active' : ''}" 
                         onclick="toggleAlertConfig('${config.id}')"></div>
                </div>
                <div class="config-description">${config.description}</div>
                <div class="config-settings">
                    ${Object.entries(config.settings).map(([key, value]) => `
                        <div class="config-setting">
                            <span class="config-setting-label">${this.formatSettingKey(key)}:</span>
                            <span class="config-setting-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    renderCommunicationTools() {
        const container = document.getElementById('communicationToolsGrid');
        if (!container) return;
        
        container.innerHTML = this.communicationTools.map(tool => `
            <div class="tool-item">
                <div class="tool-header">
                    <div class="tool-name">${tool.name}</div>
                    <div class="tool-status ${tool.status}">${tool.status}</div>
                </div>
                <div class="tool-description">${tool.description}</div>
                <div class="tool-actions">
                    <button class="tool-btn" onclick="configureTool('${tool.id}')">Configure</button>
                    <button class="tool-btn" onclick="toggleTool('${tool.id}')">
                        ${tool.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    formatSettingKey(key) {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
    
    formatTime(timestamp) {
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
        window.markAllAsRead = () => this.markAllAsRead();
        window.sendNotification = () => this.sendNotification();
        window.refreshNotifications = () => this.refreshNotifications();
        window.exportNotifications = () => this.exportNotifications();
        window.switchTab = (tabName) => this.switchTab(tabName);
        window.viewNotification = (notificationId) => this.viewNotification(notificationId);
        window.handleNotificationAction = (notificationId, action) => this.handleNotificationAction(notificationId, action);
        window.toggleAlertConfig = (configId) => this.toggleAlertConfig(configId);
        window.configureTool = (toolId) => this.configureTool(toolId);
        window.toggleTool = (toolId) => this.toggleTool(toolId);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const notificationsRef = this.collection(this.db, 'notifications');
        this.onSnapshot(notificationsRef, (snapshot) => {
            this.notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderNotifications();
        });
        
        const alertConfigsRef = this.collection(this.db, 'alert_configs');
        this.onSnapshot(alertConfigsRef, (snapshot) => {
            this.alertConfigs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderAlertConfigs();
        });
        
        const toolsRef = this.collection(this.db, 'communication_tools');
        this.onSnapshot(toolsRef, (snapshot) => {
            this.communicationTools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderCommunicationTools();
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
    window.notificationSystemCore = new NotificationSystemCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystemCore;
}
