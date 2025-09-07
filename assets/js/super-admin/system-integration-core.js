// System Integration Management Core
class SystemIntegrationCore {
    constructor() {
        this.currentUser = null;
        this.apiEndpoints = [];
        this.integrations = [];
        this.webhooks = [];
        this.externalConnections = [];
        this.currentTab = 'apis';
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        console.log('🔗 Initializing System Integration Management Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ System Integration Management Core initialized');
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
            window.superAdminNavigation.updateCurrentPage('System Integration Management');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadApiEndpoints(),
            this.loadIntegrations(),
            this.loadWebhooks(),
            this.loadExternalConnections()
        ]);
        
        this.updateOverviewStats();
        this.renderApiManagement();
        this.renderIntegrations();
        this.renderWebhooks();
        this.renderExternalConnections();
    }
    
    async loadApiEndpoints() {
        try {
            const apiRef = this.collection(this.db, 'api_endpoints');
            const snapshot = await this.getDocs(apiRef);
            this.apiEndpoints = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.apiEndpoints.length === 0) {
                this.apiEndpoints = this.getMockApiEndpoints();
            }
            console.log(`✓ Loaded ${this.apiEndpoints.length} API endpoints`);
        } catch (error) {
            console.error('Error loading API endpoints:', error);
            this.apiEndpoints = this.getMockApiEndpoints();
        }
    }
    
    async loadIntegrations() {
        try {
            const integrationsRef = this.collection(this.db, 'third_party_integrations');
            const snapshot = await this.getDocs(integrationsRef);
            this.integrations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.integrations.length === 0) {
                this.integrations = this.getMockIntegrations();
            }
            console.log(`✓ Loaded ${this.integrations.length} integrations`);
        } catch (error) {
            console.error('Error loading integrations:', error);
            this.integrations = this.getMockIntegrations();
        }
    }
    
    async loadWebhooks() {
        try {
            const webhooksRef = this.collection(this.db, 'webhooks');
            const snapshot = await this.getDocs(webhooksRef);
            this.webhooks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.webhooks.length === 0) {
                this.webhooks = this.getMockWebhooks();
            }
            console.log(`✓ Loaded ${this.webhooks.length} webhooks`);
        } catch (error) {
            console.error('Error loading webhooks:', error);
            this.webhooks = this.getMockWebhooks();
        }
    }
    
    async loadExternalConnections() {
        try {
            const connectionsRef = this.collection(this.db, 'external_connections');
            const snapshot = await this.getDocs(connectionsRef);
            this.externalConnections = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.externalConnections.length === 0) {
                this.externalConnections = this.getMockExternalConnections();
            }
            console.log(`✓ Loaded ${this.externalConnections.length} external connections`);
        } catch (error) {
            console.error('Error loading external connections:', error);
            this.externalConnections = this.getMockExternalConnections();
        }
    }
    
    getMockApiEndpoints() {
        return [
            {
                id: 'api_1',
                name: 'User Management API',
                description: 'RESTful API for user account management and authentication',
                endpoint: '/api/v1/users',
                method: 'GET, POST, PUT, DELETE',
                status: 'active',
                version: 'v1.2.3',
                lastUpdated: new Date('2024-02-15'),
                usage: {
                    requests: 15420,
                    errors: 23,
                    avgResponseTime: 145
                },
                authentication: 'Bearer Token',
                rateLimit: '1000/hour'
            },
            {
                id: 'api_2',
                name: 'Factory Data API',
                description: 'API for factory information and compliance data management',
                endpoint: '/api/v1/factories',
                method: 'GET, POST, PUT, DELETE',
                status: 'active',
                version: 'v1.1.8',
                lastUpdated: new Date('2024-02-14'),
                usage: {
                    requests: 8930,
                    errors: 12,
                    avgResponseTime: 89
                },
                authentication: 'API Key',
                rateLimit: '500/hour'
            },
            {
                id: 'api_3',
                name: 'Compliance Reporting API',
                description: 'API for generating and managing compliance reports',
                endpoint: '/api/v1/reports',
                method: 'GET, POST',
                status: 'active',
                version: 'v1.0.5',
                lastUpdated: new Date('2024-02-13'),
                usage: {
                    requests: 2340,
                    errors: 8,
                    avgResponseTime: 234
                },
                authentication: 'OAuth 2.0',
                rateLimit: '200/hour'
            },
            {
                id: 'api_4',
                name: 'Audit Logging API',
                description: 'API for audit trail and logging management',
                endpoint: '/api/v1/audit',
                method: 'GET, POST',
                status: 'active',
                version: 'v1.3.1',
                lastUpdated: new Date('2024-02-12'),
                usage: {
                    requests: 18750,
                    errors: 5,
                    avgResponseTime: 67
                },
                authentication: 'Bearer Token',
                rateLimit: '2000/hour'
            },
            {
                id: 'api_5',
                name: 'Notification API',
                description: 'API for sending notifications and alerts',
                endpoint: '/api/v1/notifications',
                method: 'POST',
                status: 'active',
                version: 'v1.1.2',
                lastUpdated: new Date('2024-02-11'),
                usage: {
                    requests: 4560,
                    errors: 15,
                    avgResponseTime: 123
                },
                authentication: 'API Key',
                rateLimit: '1000/hour'
            },
            {
                id: 'api_6',
                name: 'Analytics API',
                description: 'API for analytics data and reporting',
                endpoint: '/api/v1/analytics',
                method: 'GET',
                status: 'deprecated',
                version: 'v0.9.4',
                lastUpdated: new Date('2024-01-20'),
                usage: {
                    requests: 890,
                    errors: 45,
                    avgResponseTime: 456
                },
                authentication: 'API Key',
                rateLimit: '100/hour'
            }
        ];
    }
    
    getMockIntegrations() {
        return [
            {
                id: 'integration_1',
                name: 'Slack Integration',
                description: 'Send compliance notifications and alerts to Slack channels',
                logo: '💬',
                status: 'connected',
                lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                configuration: {
                    webhookUrl: 'https://hooks.slack.com/services/...',
                    channels: ['#compliance', '#alerts'],
                    events: ['audit_complete', 'violation_detected']
                },
                usage: {
                    messagesSent: 1247,
                    lastMessage: new Date(Date.now() - 15 * 60 * 1000)
                }
            },
            {
                id: 'integration_2',
                name: 'Microsoft Teams',
                description: 'Integration with Microsoft Teams for team collaboration',
                logo: '👥',
                status: 'connected',
                lastSync: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
                configuration: {
                    webhookUrl: 'https://outlook.office.com/webhook/...',
                    channels: ['Compliance Team', 'Management'],
                    events: ['report_generated', 'audit_scheduled']
                },
                usage: {
                    messagesSent: 892,
                    lastMessage: new Date(Date.now() - 2 * 60 * 60 * 1000)
                }
            },
            {
                id: 'integration_3',
                name: 'Email Service',
                description: 'SMTP integration for email notifications and reports',
                logo: '📧',
                status: 'connected',
                lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                configuration: {
                    smtpHost: 'smtp.gmail.com',
                    smtpPort: 587,
                    username: 'noreply@angkor-compliance.com',
                    events: ['daily_report', 'urgent_alert']
                },
                usage: {
                    emailsSent: 3456,
                    lastEmail: new Date(Date.now() - 10 * 60 * 1000)
                }
            },
            {
                id: 'integration_4',
                name: 'SMS Gateway',
                description: 'SMS integration for urgent notifications and alerts',
                logo: '📱',
                status: 'connected',
                lastSync: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                configuration: {
                    provider: 'Twilio',
                    phoneNumber: '+855 23 123 456',
                    events: ['critical_violation', 'system_down']
                },
                usage: {
                    smsSent: 234,
                    lastSms: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                }
            },
            {
                id: 'integration_5',
                name: 'Google Drive',
                description: 'Integration for document storage and report archiving',
                logo: '📁',
                status: 'connected',
                lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                configuration: {
                    folderId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
                    events: ['report_generated', 'document_uploaded']
                },
                usage: {
                    filesUploaded: 567,
                    lastUpload: new Date(Date.now() - 1 * 60 * 60 * 1000)
                }
            },
            {
                id: 'integration_6',
                name: 'Zapier Integration',
                description: 'Automation platform integration for workflow automation',
                logo: '⚡',
                status: 'error',
                lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                configuration: {
                    webhookUrl: 'https://hooks.zapier.com/hooks/catch/...',
                    events: ['new_factory', 'compliance_check']
                },
                usage: {
                    workflowsTriggered: 89,
                    lastTrigger: new Date(Date.now() - 24 * 60 * 60 * 1000)
                },
                error: 'Authentication failed - API key expired'
            },
            {
                id: 'integration_7',
                name: 'Salesforce CRM',
                description: 'CRM integration for customer and factory relationship management',
                logo: '☁️',
                status: 'disconnected',
                lastSync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
                configuration: {
                    instanceUrl: 'https://angkor-compliance.salesforce.com',
                    events: ['new_lead', 'opportunity_created']
                },
                usage: {
                    recordsSynced: 1234,
                    lastSync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            },
            {
                id: 'integration_8',
                name: 'QuickBooks',
                description: 'Accounting software integration for financial data sync',
                logo: '💰',
                status: 'connected',
                lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                configuration: {
                    companyId: '123456789',
                    events: ['invoice_created', 'payment_received']
                },
                usage: {
                    transactionsSynced: 456,
                    lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000)
                }
            }
        ];
    }
    
    getMockWebhooks() {
        return [
            {
                id: 'webhook_1',
                name: 'Factory Registration Webhook',
                description: 'Triggered when a new factory is registered in the system',
                url: 'https://api.external-system.com/webhooks/factory-registration',
                status: 'enabled',
                events: ['factory.created', 'factory.updated'],
                lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                configuration: {
                    secret: 'whsec_1234567890abcdef',
                    timeout: 30,
                    retries: 3
                },
                usage: {
                    totalTriggers: 45,
                    successfulDeliveries: 43,
                    failedDeliveries: 2
                }
            },
            {
                id: 'webhook_2',
                name: 'Compliance Alert Webhook',
                description: 'Sends alerts when compliance violations are detected',
                url: 'https://monitoring.angkor-compliance.com/webhooks/compliance-alert',
                status: 'enabled',
                events: ['violation.detected', 'violation.resolved'],
                lastTriggered: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                configuration: {
                    secret: 'whsec_abcdef1234567890',
                    timeout: 15,
                    retries: 5
                },
                usage: {
                    totalTriggers: 123,
                    successfulDeliveries: 120,
                    failedDeliveries: 3
                }
            },
            {
                id: 'webhook_3',
                name: 'Audit Completion Webhook',
                description: 'Notifies external systems when audits are completed',
                url: 'https://audit-system.com/webhooks/audit-complete',
                status: 'enabled',
                events: ['audit.completed', 'audit.failed'],
                lastTriggered: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
                configuration: {
                    secret: 'whsec_9876543210fedcba',
                    timeout: 20,
                    retries: 3
                },
                usage: {
                    totalTriggers: 67,
                    successfulDeliveries: 65,
                    failedDeliveries: 2
                }
            },
            {
                id: 'webhook_4',
                name: 'User Activity Webhook',
                description: 'Tracks user activities and sends to external analytics',
                url: 'https://analytics.external.com/webhooks/user-activity',
                status: 'enabled',
                events: ['user.login', 'user.logout', 'user.action'],
                lastTriggered: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                configuration: {
                    secret: 'whsec_fedcba0987654321',
                    timeout: 10,
                    retries: 2
                },
                usage: {
                    totalTriggers: 2340,
                    successfulDeliveries: 2335,
                    failedDeliveries: 5
                }
            },
            {
                id: 'webhook_5',
                name: 'Payment Processing Webhook',
                description: 'Handles payment notifications from external payment processors',
                url: 'https://payments.angkor-compliance.com/webhooks/payment',
                status: 'enabled',
                events: ['payment.success', 'payment.failed', 'payment.refunded'],
                lastTriggered: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                configuration: {
                    secret: 'whsec_13579ace2468bdf0',
                    timeout: 25,
                    retries: 4
                },
                usage: {
                    totalTriggers: 89,
                    successfulDeliveries: 87,
                    failedDeliveries: 2
                }
            },
            {
                id: 'webhook_6',
                name: 'System Health Webhook',
                description: 'Monitors system health and sends status updates',
                url: 'https://monitoring.external.com/webhooks/health-check',
                status: 'disabled',
                events: ['system.healthy', 'system.unhealthy', 'system.maintenance'],
                lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                configuration: {
                    secret: 'whsec_2468ace13579bdf0',
                    timeout: 30,
                    retries: 3
                },
                usage: {
                    totalTriggers: 456,
                    successfulDeliveries: 450,
                    failedDeliveries: 6
                }
            }
        ];
    }
    
    getMockExternalConnections() {
        return [
            {
                id: 'connection_1',
                name: 'Government Compliance Portal',
                description: 'Connection to Cambodian government compliance reporting system',
                type: 'API',
                status: 'online',
                lastCheck: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                configuration: {
                    endpoint: 'https://compliance.gov.kh/api/v1',
                    authentication: 'OAuth 2.0',
                    rateLimit: '100/hour'
                },
                usage: {
                    requestsToday: 45,
                    lastRequest: new Date(Date.now() - 10 * 60 * 1000),
                    avgResponseTime: 234
                }
            },
            {
                id: 'connection_2',
                name: 'Labor Ministry Database',
                description: 'Connection to Ministry of Labor and Vocational Training database',
                type: 'Database',
                status: 'online',
                lastCheck: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
                configuration: {
                    host: 'db.labor.gov.kh',
                    port: 5432,
                    database: 'labor_records',
                    authentication: 'SSL Certificate'
                },
                usage: {
                    queriesToday: 123,
                    lastQuery: new Date(Date.now() - 5 * 60 * 1000),
                    avgResponseTime: 89
                }
            },
            {
                id: 'connection_3',
                name: 'Weather Service API',
                description: 'External weather service for environmental compliance monitoring',
                type: 'API',
                status: 'online',
                lastCheck: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
                configuration: {
                    endpoint: 'https://api.weather.com/v1/current',
                    authentication: 'API Key',
                    rateLimit: '1000/day'
                },
                usage: {
                    requestsToday: 24,
                    lastRequest: new Date(Date.now() - 2 * 60 * 1000),
                    avgResponseTime: 156
                }
            },
            {
                id: 'connection_4',
                name: 'Banking System',
                description: 'Connection to banking system for payment processing',
                type: 'API',
                status: 'online',
                lastCheck: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
                configuration: {
                    endpoint: 'https://api.bank.gov.kh/v2',
                    authentication: 'Certificate',
                    rateLimit: '500/hour'
                },
                usage: {
                    requestsToday: 67,
                    lastRequest: new Date(Date.now() - 15 * 60 * 1000),
                    avgResponseTime: 345
                }
            },
            {
                id: 'connection_5',
                name: 'Email Service Provider',
                description: 'SMTP connection for email delivery services',
                type: 'SMTP',
                status: 'online',
                lastCheck: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
                configuration: {
                    host: 'smtp.sendgrid.net',
                    port: 587,
                    authentication: 'API Key',
                    encryption: 'TLS'
                },
                usage: {
                    emailsToday: 234,
                    lastEmail: new Date(Date.now() - 2 * 60 * 1000),
                    avgDeliveryTime: 123
                }
            },
            {
                id: 'connection_6',
                name: 'SMS Gateway',
                description: 'SMS service provider for text message notifications',
                type: 'API',
                status: 'error',
                lastCheck: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
                configuration: {
                    endpoint: 'https://api.twilio.com/2010-04-01',
                    authentication: 'Basic Auth',
                    rateLimit: '1000/hour'
                },
                usage: {
                    requestsToday: 12,
                    lastRequest: new Date(Date.now() - 30 * 60 * 1000),
                    avgResponseTime: 456
                },
                error: 'Authentication failed - credentials expired'
            },
            {
                id: 'connection_7',
                name: 'File Storage Service',
                description: 'Cloud storage service for document and file management',
                type: 'API',
                status: 'online',
                lastCheck: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
                configuration: {
                    endpoint: 'https://storage.googleapis.com/v1',
                    authentication: 'Service Account',
                    rateLimit: '10000/day'
                },
                usage: {
                    requestsToday: 456,
                    lastRequest: new Date(Date.now() - 1 * 60 * 1000),
                    avgResponseTime: 78
                }
            },
            {
                id: 'connection_8',
                name: 'Analytics Service',
                description: 'External analytics service for data processing and insights',
                type: 'API',
                status: 'offline',
                lastCheck: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
                configuration: {
                    endpoint: 'https://analytics.external.com/v1',
                    authentication: 'Bearer Token',
                    rateLimit: '500/hour'
                },
                usage: {
                    requestsToday: 0,
                    lastRequest: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    avgResponseTime: 234
                }
            }
        ];
    }
    
    updateOverviewStats() {
        const activeApis = this.apiEndpoints.filter(api => api.status === 'active').length;
        const connectedIntegrations = this.integrations.filter(integration => integration.status === 'connected').length;
        const enabledWebhooks = this.webhooks.filter(webhook => webhook.status === 'enabled').length;
        const onlineConnections = this.externalConnections.filter(connection => connection.status === 'online').length;
        
        document.getElementById('apiEndpoints').textContent = activeApis;
        document.getElementById('activeIntegrations').textContent = connectedIntegrations;
        document.getElementById('webhooks').textContent = enabledWebhooks;
        document.getElementById('externalConnections').textContent = onlineConnections;
    }
    
    renderApiManagement() {
        const container = document.getElementById('apiManagement');
        if (!container) return;
        
        container.innerHTML = this.apiEndpoints.map(api => `
            <div class="api-item">
                <div class="api-header">
                    <div class="api-name">${api.name}</div>
                    <div class="api-status ${api.status}">${api.status}</div>
                </div>
                <div class="api-description">${api.description}</div>
                <div class="api-meta">
                    <div><strong>Endpoint:</strong> ${api.endpoint}</div>
                    <div><strong>Version:</strong> ${api.version}</div>
                </div>
                <div class="api-meta">
                    <div><strong>Method:</strong> ${api.method}</div>
                    <div><strong>Auth:</strong> ${api.authentication}</div>
                </div>
                <div class="api-meta">
                    <div><strong>Requests:</strong> ${api.usage.requests.toLocaleString()}</div>
                    <div><strong>Errors:</strong> ${api.usage.errors}</div>
                </div>
                <div class="api-actions">
                    <button class="api-btn" onclick="viewApiDetails('${api.id}')">View Details</button>
                    <button class="api-btn" onclick="testApiEndpoint('${api.id}')">Test</button>
                    <button class="api-btn" onclick="configureApi('${api.id}')">Configure</button>
                </div>
            </div>
        `).join('');
    }
    
    renderIntegrations() {
        const container = document.getElementById('integrationsGrid');
        if (!container) return;
        
        container.innerHTML = this.integrations.map(integration => `
            <div class="integration-item">
                <div class="integration-header">
                    <div class="integration-name">
                        <div class="integration-logo">${integration.logo}</div>
                        ${integration.name}
                    </div>
                    <div class="integration-status ${integration.status}">${integration.status}</div>
                </div>
                <div class="integration-description">${integration.description}</div>
                <div style="margin-bottom: var(--space-3); font-size: var(--text-xs); color: var(--neutral-500);">
                    <strong>Last Sync:</strong> ${this.formatTime(integration.lastSync)}
                </div>
                ${integration.error ? `
                    <div style="margin-bottom: var(--space-3); padding: var(--space-2); background: var(--danger-50); border: 1px solid var(--danger-200); border-radius: var(--radius-sm); font-size: var(--text-xs); color: var(--danger-700);">
                        <strong>Error:</strong> ${integration.error}
                    </div>
                ` : ''}
                <div class="integration-actions">
                    <button class="integration-btn" onclick="viewIntegrationDetails('${integration.id}')">View Details</button>
                    <button class="integration-btn" onclick="testIntegration('${integration.id}')">Test</button>
                    <button class="integration-btn" onclick="configureIntegration('${integration.id}')">Configure</button>
                </div>
            </div>
        `).join('');
    }
    
    renderWebhooks() {
        const container = document.getElementById('webhookManagement');
        if (!container) return;
        
        container.innerHTML = this.webhooks.map(webhook => `
            <div class="webhook-item">
                <div class="webhook-header">
                    <div class="webhook-name">${webhook.name}</div>
                    <div class="webhook-status ${webhook.status}">${webhook.status}</div>
                </div>
                <div class="webhook-description">${webhook.description}</div>
                <div class="webhook-url">${webhook.url}</div>
                <div style="margin-bottom: var(--space-3); font-size: var(--text-xs); color: var(--neutral-500);">
                    <strong>Events:</strong> ${webhook.events.join(', ')}<br>
                    <strong>Last Triggered:</strong> ${this.formatTime(webhook.lastTriggered)}<br>
                    <strong>Success Rate:</strong> ${Math.round((webhook.usage.successfulDeliveries / webhook.usage.totalTriggers) * 100)}%
                </div>
                <div class="webhook-actions">
                    <button class="webhook-btn" onclick="viewWebhookDetails('${webhook.id}')">View Details</button>
                    <button class="webhook-btn" onclick="testWebhook('${webhook.id}')">Test</button>
                    <button class="webhook-btn" onclick="configureWebhook('${webhook.id}')">Configure</button>
                </div>
            </div>
        `).join('');
    }
    
    renderExternalConnections() {
        const container = document.getElementById('connectivityManagement');
        if (!container) return;
        
        container.innerHTML = this.externalConnections.map(connection => `
            <div class="connectivity-item">
                <div class="connectivity-header">
                    <div class="connectivity-name">${connection.name}</div>
                    <div class="connectivity-status ${connection.status}">${connection.status}</div>
                </div>
                <div class="connectivity-description">${connection.description}</div>
                <div style="margin-bottom: var(--space-3); font-size: var(--text-xs); color: var(--neutral-500);">
                    <strong>Type:</strong> ${connection.type}<br>
                    <strong>Last Check:</strong> ${this.formatTime(connection.lastCheck)}<br>
                    <strong>Requests Today:</strong> ${connection.usage.requestsToday}
                </div>
                ${connection.error ? `
                    <div style="margin-bottom: var(--space-3); padding: var(--space-2); background: var(--danger-50); border: 1px solid var(--danger-200); border-radius: var(--radius-sm); font-size: var(--text-xs); color: var(--danger-700);">
                        <strong>Error:</strong> ${connection.error}
                    </div>
                ` : ''}
                <div class="connectivity-actions">
                    <button class="connectivity-btn" onclick="viewConnectionDetails('${connection.id}')">View Details</button>
                    <button class="connectivity-btn" onclick="testConnection('${connection.id}')">Test</button>
                    <button class="connectivity-btn" onclick="configureConnection('${connection.id}')">Configure</button>
                </div>
            </div>
        `).join('');
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
        window.createIntegration = () => this.createIntegration();
        window.testConnections = () => this.testConnections();
        window.refreshIntegrations = () => this.refreshIntegrations();
        window.exportIntegrations = () => this.exportIntegrations();
        window.switchTab = (tabName) => this.switchTab(tabName);
        window.viewApiDetails = (apiId) => this.viewApiDetails(apiId);
        window.testApiEndpoint = (apiId) => this.testApiEndpoint(apiId);
        window.configureApi = (apiId) => this.configureApi(apiId);
        window.viewIntegrationDetails = (integrationId) => this.viewIntegrationDetails(integrationId);
        window.testIntegration = (integrationId) => this.testIntegration(integrationId);
        window.configureIntegration = (integrationId) => this.configureIntegration(integrationId);
        window.viewWebhookDetails = (webhookId) => this.viewWebhookDetails(webhookId);
        window.testWebhook = (webhookId) => this.testWebhook(webhookId);
        window.configureWebhook = (webhookId) => this.configureWebhook(webhookId);
        window.viewConnectionDetails = (connectionId) => this.viewConnectionDetails(connectionId);
        window.testConnection = (connectionId) => this.testConnection(connectionId);
        window.configureConnection = (connectionId) => this.configureConnection(connectionId);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const apiRef = this.collection(this.db, 'api_endpoints');
        this.onSnapshot(apiRef, (snapshot) => {
            this.apiEndpoints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderApiManagement();
        });
        
        const integrationsRef = this.collection(this.db, 'third_party_integrations');
        this.onSnapshot(integrationsRef, (snapshot) => {
            this.integrations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderIntegrations();
        });
        
        const webhooksRef = this.collection(this.db, 'webhooks');
        this.onSnapshot(webhooksRef, (snapshot) => {
            this.webhooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderWebhooks();
        });
        
        const connectionsRef = this.collection(this.db, 'external_connections');
        this.onSnapshot(connectionsRef, (snapshot) => {
            this.externalConnections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderExternalConnections();
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
    window.systemIntegrationCore = new SystemIntegrationCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemIntegrationCore;
}
