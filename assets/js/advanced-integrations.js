// Advanced Integrations System for Angkor Compliance Platform
// Implements Google Workspace, Microsoft 365, webhooks, and enterprise integrations as outlined in the vision document

class AdvancedIntegrationsSystem {
    constructor() {
        this.db = window.Firebase?.db;
        this.currentUser = null;
        this.integrations = new Map();
        this.webhooks = new Map();
        this.connectors = new Map();
        this.apiKeys = new Map();
        this.isInitialized = false;
        
        this.initializeIntegrationsSystem();
    }

    async initializeIntegrationsSystem() {
        try {
            console.log('🔗 Initializing Advanced Integrations System...');
            
            // Initialize Google Workspace integration
            await this.initializeGoogleWorkspace();
            
            // Initialize Microsoft 365 integration
            await this.initializeMicrosoft365();
            
            // Initialize webhook system
            await this.initializeWebhookSystem();
            
            // Initialize API connectors
            await this.initializeAPIConnectors();
            
            // Initialize messaging integrations
            await this.initializeMessagingIntegrations();
            
            // Set up real-time listeners
            this.setupRealTimeListeners();
            
            this.isInitialized = true;
            console.log('✅ Advanced Integrations System initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Advanced Integrations System:', error);
            this.isInitialized = false;
        }
    }

    // Google Workspace Integration
    async initializeGoogleWorkspace() {
        this.integrations.set('google_workspace', {
            id: 'google_workspace',
            name: 'Google Workspace',
            type: 'productivity',
            status: 'disabled',
            config: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                redirectUri: `${window.location.origin}/auth/google/callback`,
                scopes: [
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/documents',
                    'https://www.googleapis.com/auth/calendar',
                    'https://www.googleapis.com/auth/gmail.send',
                    'https://www.googleapis.com/auth/spreadsheets'
                ],
                apiKey: process.env.GOOGLE_API_KEY
            },
            features: {
                drive: {
                    enabled: false,
                    syncDocuments: true,
                    autoBackup: true,
                    folderStructure: 'factory-based'
                },
                calendar: {
                    enabled: false,
                    syncEvents: true,
                    createMeetings: true,
                    reminderNotifications: true
                },
                gmail: {
                    enabled: false,
                    sendNotifications: true,
                    emailTemplates: true,
                    autoResponses: true
                },
                sheets: {
                    enabled: false,
                    exportData: true,
                    importData: true,
                    realTimeSync: true
                }
            }
        });

        // Load Google Workspace configuration
        await this.loadIntegrationConfig('google_workspace');
    }

    // Microsoft 365 Integration
    async initializeMicrosoft365() {
        this.integrations.set('microsoft_365', {
            id: 'microsoft_365',
            name: 'Microsoft 365',
            type: 'productivity',
            status: 'disabled',
            config: {
                clientId: process.env.MICROSOFT_CLIENT_ID,
                clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
                tenantId: process.env.MICROSOFT_TENANT_ID,
                redirectUri: `${window.location.origin}/auth/microsoft/callback`,
                scopes: [
                    'https://graph.microsoft.com/Files.ReadWrite',
                    'https://graph.microsoft.com/Calendars.ReadWrite',
                    'https://graph.microsoft.com/Mail.Send',
                    'https://graph.microsoft.com/Sites.ReadWrite.All'
                ]
            },
            features: {
                onedrive: {
                    enabled: false,
                    syncDocuments: true,
                    autoBackup: true,
                    folderStructure: 'factory-based'
                },
                sharepoint: {
                    enabled: false,
                    syncDocuments: true,
                    createSites: true,
                    managePermissions: true
                },
                outlook: {
                    enabled: false,
                    syncCalendar: true,
                    sendEmails: true,
                    createMeetings: true
                },
                teams: {
                    enabled: false,
                    createChannels: true,
                    sendMessages: true,
                    scheduleMeetings: true
                }
            }
        });

        // Load Microsoft 365 configuration
        await this.loadIntegrationConfig('microsoft_365');
    }

    // Webhook System
    async initializeWebhookSystem() {
        // Initialize webhook endpoints
        this.webhooks.set('slack', {
            id: 'slack',
            name: 'Slack Integration',
            type: 'messaging',
            status: 'disabled',
            config: {
                webhookUrl: process.env.SLACK_WEBHOOK_URL,
                channel: '#compliance-alerts',
                username: 'Angkor Compliance Bot',
                icon: ':factory:'
            },
            events: {
                'document.approved': true,
                'cap.created': true,
                'grievance.submitted': true,
                'permit.expiring': true,
                'audit.scheduled': true
            }
        });

        this.webhooks.set('teams', {
            id: 'teams',
            name: 'Microsoft Teams',
            type: 'messaging',
            status: 'disabled',
            config: {
                webhookUrl: process.env.TEAMS_WEBHOOK_URL,
                channel: 'Compliance Alerts',
                title: 'Angkor Compliance Platform'
            },
            events: {
                'document.approved': true,
                'cap.created': true,
                'grievance.submitted': true,
                'permit.expiring': true,
                'audit.scheduled': true
            }
        });

        this.webhooks.set('email', {
            id: 'email',
            name: 'Email Notifications',
            type: 'email',
            status: 'disabled',
            config: {
                smtpServer: process.env.SMTP_SERVER,
                smtpPort: process.env.SMTP_PORT,
                username: process.env.SMTP_USERNAME,
                password: process.env.SMTP_PASSWORD,
                fromEmail: 'noreply@angkorcompliance.com',
                fromName: 'Angkor Compliance Platform'
            },
            events: {
                'document.approved': true,
                'cap.created': true,
                'grievance.submitted': true,
                'permit.expiring': true,
                'audit.scheduled': true
            }
        });

        this.webhooks.set('sms', {
            id: 'sms',
            name: 'SMS Notifications',
            type: 'sms',
            status: 'disabled',
            config: {
                provider: 'twilio',
                accountSid: process.env.TWILIO_ACCOUNT_SID,
                authToken: process.env.TWILIO_AUTH_TOKEN,
                fromNumber: process.env.TWILIO_FROM_NUMBER
            },
            events: {
                'permit.expiring': true,
                'audit.scheduled': true,
                'grievance.critical': true
            }
        });

        // Load webhook configurations
        await this.loadWebhookConfigurations();
    }

    // API Connectors
    async initializeAPIConnectors() {
        // WhatsApp Business API
        this.connectors.set('whatsapp', {
            id: 'whatsapp',
            name: 'WhatsApp Business API',
            type: 'messaging',
            status: 'disabled',
            config: {
                apiKey: process.env.WHATSAPP_API_KEY,
                phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
                businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
                webhookUrl: `${window.location.origin}/api/whatsapp/webhook`
            },
            features: {
                sendMessages: true,
                receiveMessages: true,
                mediaSupport: true,
                templates: true,
                quickReplies: true
            }
        });

        // Telegram Bot API
        this.connectors.set('telegram', {
            id: 'telegram',
            name: 'Telegram Bot',
            type: 'messaging',
            status: 'disabled',
            config: {
                botToken: process.env.TELEGRAM_BOT_TOKEN,
                webhookUrl: `${window.location.origin}/api/telegram/webhook`,
                allowedUsers: []
            },
            features: {
                sendMessages: true,
                receiveMessages: true,
                mediaSupport: true,
                inlineKeyboards: true,
                groupChats: true
            }
        });

        // ESG Tools Integration
        this.connectors.set('esg_tools', {
            id: 'esg_tools',
            name: 'ESG Tools Integration',
            type: 'compliance',
            status: 'disabled',
            config: {
                apiEndpoint: process.env.ESG_API_ENDPOINT,
                apiKey: process.env.ESG_API_KEY,
                syncInterval: 24 * 60 * 60 * 1000 // 24 hours
            },
            features: {
                dataSync: true,
                reportGeneration: true,
                complianceScoring: true,
                trendAnalysis: true
            }
        });

        // Load connector configurations
        await this.loadConnectorConfigurations();
    }

    // Messaging Integrations
    async initializeMessagingIntegrations() {
        // Initialize messaging templates
        this.messagingTemplates = {
            grievance_submitted: {
                title: 'New Grievance Submitted',
                message: 'A new grievance has been submitted and requires your attention.',
                priority: 'high',
                channels: ['slack', 'teams', 'email', 'sms']
            },
            permit_expiring: {
                title: 'Permit Expiry Warning',
                message: 'A permit is expiring soon. Please review and take action.',
                priority: 'medium',
                channels: ['slack', 'teams', 'email']
            },
            audit_scheduled: {
                title: 'Audit Scheduled',
                message: 'An audit has been scheduled. Please prepare accordingly.',
                priority: 'medium',
                channels: ['slack', 'teams', 'email']
            },
            cap_created: {
                title: 'New CAP Created',
                message: 'A new Corrective Action Plan has been created.',
                priority: 'medium',
                channels: ['slack', 'teams', 'email']
            },
            document_approved: {
                title: 'Document Approved',
                message: 'A document has been approved and is now available.',
                priority: 'low',
                channels: ['slack', 'teams']
            }
        };
    }

    // Google Workspace Methods
    async connectGoogleWorkspace(authCode) {
        try {
            const integration = this.integrations.get('google_workspace');
            if (!integration) {
                throw new Error('Google Workspace integration not configured');
            }

            // Exchange auth code for tokens
            const tokens = await this.exchangeGoogleAuthCode(authCode, integration.config);
            
            // Store tokens securely
            await this.storeIntegrationTokens('google_workspace', tokens);
            
            // Test connection
            const isConnected = await this.testGoogleWorkspaceConnection(tokens);
            
            if (isConnected) {
                integration.status = 'connected';
                await this.saveIntegrationConfig('google_workspace');
                
                console.log('✅ Google Workspace connected successfully');
                return { success: true };
            } else {
                throw new Error('Failed to verify Google Workspace connection');
            }

        } catch (error) {
            console.error('❌ Google Workspace connection failed:', error);
            throw error;
        }
    }

    async syncGoogleDriveDocuments(factoryId) {
        try {
            const integration = this.integrations.get('google_workspace');
            if (integration.status !== 'connected') {
                throw new Error('Google Workspace not connected');
            }

            const tokens = await this.getIntegrationTokens('google_workspace');
            
            // Get documents from Google Drive
            const driveDocuments = await this.getGoogleDriveDocuments(tokens, factoryId);
            
            // Sync with local documents
            const syncResults = await this.syncDocumentsWithGoogleDrive(driveDocuments, factoryId);
            
            console.log(`✅ Synced ${syncResults.synced} documents with Google Drive`);
            return syncResults;

        } catch (error) {
            console.error('❌ Google Drive sync failed:', error);
            throw error;
        }
    }

    async createGoogleCalendarEvent(eventData) {
        try {
            const integration = this.integrations.get('google_workspace');
            if (integration.status !== 'connected') {
                throw new Error('Google Workspace not connected');
            }

            const tokens = await this.getIntegrationTokens('google_workspace');
            
            // Create event in Google Calendar
            const calendarEvent = await this.createGoogleCalendarEventAPI(tokens, eventData);
            
            console.log('✅ Google Calendar event created:', calendarEvent.id);
            return calendarEvent;

        } catch (error) {
            console.error('❌ Google Calendar event creation failed:', error);
            throw error;
        }
    }

    // Microsoft 365 Methods
    async connectMicrosoft365(authCode) {
        try {
            const integration = this.integrations.get('microsoft_365');
            if (!integration) {
                throw new Error('Microsoft 365 integration not configured');
            }

            // Exchange auth code for tokens
            const tokens = await this.exchangeMicrosoftAuthCode(authCode, integration.config);
            
            // Store tokens securely
            await this.storeIntegrationTokens('microsoft_365', tokens);
            
            // Test connection
            const isConnected = await this.testMicrosoft365Connection(tokens);
            
            if (isConnected) {
                integration.status = 'connected';
                await this.saveIntegrationConfig('microsoft_365');
                
                console.log('✅ Microsoft 365 connected successfully');
                return { success: true };
            } else {
                throw new Error('Failed to verify Microsoft 365 connection');
            }

        } catch (error) {
            console.error('❌ Microsoft 365 connection failed:', error);
            throw error;
        }
    }

    async syncOneDriveDocuments(factoryId) {
        try {
            const integration = this.integrations.get('microsoft_365');
            if (integration.status !== 'connected') {
                throw new Error('Microsoft 365 not connected');
            }

            const tokens = await this.getIntegrationTokens('microsoft_365');
            
            // Get documents from OneDrive
            const onedriveDocuments = await this.getOneDriveDocuments(tokens, factoryId);
            
            // Sync with local documents
            const syncResults = await this.syncDocumentsWithOneDrive(onedriveDocuments, factoryId);
            
            console.log(`✅ Synced ${syncResults.synced} documents with OneDrive`);
            return syncResults;

        } catch (error) {
            console.error('❌ OneDrive sync failed:', error);
            throw error;
        }
    }

    // Webhook Methods
    async sendWebhookNotification(eventType, data, webhookId = null) {
        try {
            const webhooks = webhookId ? [this.webhooks.get(webhookId)] : Array.from(this.webhooks.values());
            
            const notifications = [];
            
            for (const webhook of webhooks) {
                if (webhook.status === 'enabled' && webhook.events[eventType]) {
                    try {
                        const template = this.messagingTemplates[eventType];
                        if (!template) {
                            console.warn(`No template found for event: ${eventType}`);
                            continue;
                        }

                        const notification = await this.sendWebhookNotificationAPI(webhook, template, data);
                        notifications.push({
                            webhookId: webhook.id,
                            success: true,
                            response: notification
                        });
                        
                    } catch (error) {
                        console.error(`❌ Failed to send webhook notification to ${webhook.id}:`, error);
                        notifications.push({
                            webhookId: webhook.id,
                            success: false,
                            error: error.message
                        });
                    }
                }
            }

            return { notifications };

        } catch (error) {
            console.error('❌ Webhook notification failed:', error);
            throw error;
        }
    }

    async configureWebhook(webhookId, config) {
        try {
            const webhook = this.webhooks.get(webhookId);
            if (!webhook) {
                throw new Error(`Webhook not found: ${webhookId}`);
            }

            // Update webhook configuration
            webhook.config = { ...webhook.config, ...config };
            webhook.status = 'enabled';
            
            // Test webhook configuration
            const isWorking = await this.testWebhookConfiguration(webhook);
            
            if (isWorking) {
                await this.saveWebhookConfiguration(webhookId);
                console.log(`✅ Webhook ${webhookId} configured successfully`);
                return { success: true };
            } else {
                throw new Error('Webhook configuration test failed');
            }

        } catch (error) {
            console.error('❌ Webhook configuration failed:', error);
            throw error;
        }
    }

    // API Connector Methods
    async sendWhatsAppMessage(phoneNumber, message, template = null) {
        try {
            const connector = this.connectors.get('whatsapp');
            if (connector.status !== 'enabled') {
                throw new Error('WhatsApp connector not enabled');
            }

            const response = await this.sendWhatsAppMessageAPI(connector.config, phoneNumber, message, template);
            
            console.log('✅ WhatsApp message sent:', response.messageId);
            return response;

        } catch (error) {
            console.error('❌ WhatsApp message failed:', error);
            throw error;
        }
    }

    async sendTelegramMessage(chatId, message, keyboard = null) {
        try {
            const connector = this.connectors.get('telegram');
            if (connector.status !== 'enabled') {
                throw new Error('Telegram connector not enabled');
            }

            const response = await this.sendTelegramMessageAPI(connector.config, chatId, message, keyboard);
            
            console.log('✅ Telegram message sent:', response.messageId);
            return response;

        } catch (error) {
            console.error('❌ Telegram message failed:', error);
            throw error;
        }
    }

    // Utility Methods
    async exchangeGoogleAuthCode(authCode, config) {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                code: authCode,
                client_id: config.clientId,
                client_secret: config.clientSecret,
                redirect_uri: config.redirectUri,
                grant_type: 'authorization_code'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange Google auth code');
        }

        return await response.json();
    }

    async exchangeMicrosoftAuthCode(authCode, config) {
        const response = await fetch(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                code: authCode,
                client_id: config.clientId,
                client_secret: config.clientSecret,
                redirect_uri: config.redirectUri,
                grant_type: 'authorization_code'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange Microsoft auth code');
        }

        return await response.json();
    }

    async storeIntegrationTokens(integrationId, tokens) {
        // Store tokens securely (in production, encrypt these)
        await this.db.collection('integration_tokens').doc(integrationId).set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
            createdAt: new Date()
        });
    }

    async getIntegrationTokens(integrationId) {
        const tokenDoc = await this.db.collection('integration_tokens').doc(integrationId).get();
        if (!tokenDoc.exists) {
            throw new Error(`No tokens found for integration: ${integrationId}`);
        }

        const tokens = tokenDoc.data();
        
        // Check if token is expired and refresh if needed
        if (tokens.expiresAt.toDate() < new Date()) {
            return await this.refreshIntegrationTokens(integrationId, tokens.refreshToken);
        }

        return tokens;
    }

    async refreshIntegrationTokens(integrationId, refreshToken) {
        const integration = this.integrations.get(integrationId);
        if (!integration) {
            throw new Error(`Integration not found: ${integrationId}`);
        }

        let response;
        if (integrationId === 'google_workspace') {
            response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    refresh_token: refreshToken,
                    client_id: integration.config.clientId,
                    client_secret: integration.config.clientSecret,
                    grant_type: 'refresh_token'
                })
            });
        } else if (integrationId === 'microsoft_365') {
            response = await fetch(`https://login.microsoftonline.com/${integration.config.tenantId}/oauth2/v2.0/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    refresh_token: refreshToken,
                    client_id: integration.config.clientId,
                    client_secret: integration.config.clientSecret,
                    grant_type: 'refresh_token'
                })
            });
        }

        if (!response.ok) {
            throw new Error('Failed to refresh tokens');
        }

        const newTokens = await response.json();
        await this.storeIntegrationTokens(integrationId, newTokens);
        
        return {
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token || refreshToken,
            expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
            createdAt: new Date()
        };
    }

    async testGoogleWorkspaceConnection(tokens) {
        try {
            const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
                headers: {
                    'Authorization': `Bearer ${tokens.accessToken}`
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async testMicrosoft365Connection(tokens) {
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    'Authorization': `Bearer ${tokens.accessToken}`
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async testWebhookConfiguration(webhook) {
        try {
            const testData = {
                test: true,
                timestamp: new Date().toISOString(),
                message: 'Test notification from Angkor Compliance Platform'
            };

            const response = await fetch(webhook.config.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Configuration Loading/Saving
    async loadIntegrationConfig(integrationId) {
        try {
            const configDoc = await this.db.collection('integration_configs').doc(integrationId).get();
            if (configDoc.exists) {
                const savedConfig = configDoc.data();
                const integration = this.integrations.get(integrationId);
                if (integration) {
                    integration.status = savedConfig.status || 'disabled';
                    integration.config = { ...integration.config, ...savedConfig.config };
                    integration.features = { ...integration.features, ...savedConfig.features };
                }
            }
        } catch (error) {
            console.error(`❌ Failed to load integration config for ${integrationId}:`, error);
        }
    }

    async saveIntegrationConfig(integrationId) {
        try {
            const integration = this.integrations.get(integrationId);
            if (integration) {
                await this.db.collection('integration_configs').doc(integrationId).set({
                    status: integration.status,
                    config: integration.config,
                    features: integration.features,
                    updatedAt: new Date()
                });
            }
        } catch (error) {
            console.error(`❌ Failed to save integration config for ${integrationId}:`, error);
        }
    }

    async loadWebhookConfigurations() {
        try {
            const webhooksSnapshot = await this.db.collection('webhook_configs').get();
            webhooksSnapshot.forEach(doc => {
                const webhookConfig = doc.data();
                const webhook = this.webhooks.get(doc.id);
                if (webhook) {
                    webhook.status = webhookConfig.status || 'disabled';
                    webhook.config = { ...webhook.config, ...webhookConfig.config };
                    webhook.events = { ...webhook.events, ...webhookConfig.events };
                }
            });
        } catch (error) {
            console.error('❌ Failed to load webhook configurations:', error);
        }
    }

    async saveWebhookConfiguration(webhookId) {
        try {
            const webhook = this.webhooks.get(webhookId);
            if (webhook) {
                await this.db.collection('webhook_configs').doc(webhookId).set({
                    status: webhook.status,
                    config: webhook.config,
                    events: webhook.events,
                    updatedAt: new Date()
                });
            }
        } catch (error) {
            console.error(`❌ Failed to save webhook configuration for ${webhookId}:`, error);
        }
    }

    async loadConnectorConfigurations() {
        try {
            const connectorsSnapshot = await this.db.collection('connector_configs').get();
            connectorsSnapshot.forEach(doc => {
                const connectorConfig = doc.data();
                const connector = this.connectors.get(doc.id);
                if (connector) {
                    connector.status = connectorConfig.status || 'disabled';
                    connector.config = { ...connector.config, ...connectorConfig.config };
                    connector.features = { ...connector.features, ...connectorConfig.features };
                }
            });
        } catch (error) {
            console.error('❌ Failed to load connector configurations:', error);
        }
    }

    setupRealTimeListeners() {
        // Listen for integration configuration changes
        this.db.collection('integration_configs').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added' || change.type === 'modified') {
                    this.loadIntegrationConfig(change.doc.id);
                }
            });
        });

        // Listen for webhook configuration changes
        this.db.collection('webhook_configs').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added' || change.type === 'modified') {
                    const webhookConfig = change.doc.data();
                    const webhook = this.webhooks.get(change.doc.id);
                    if (webhook) {
                        webhook.status = webhookConfig.status || 'disabled';
                        webhook.config = { ...webhook.config, ...webhookConfig.config };
                        webhook.events = { ...webhook.events, ...webhookConfig.events };
                    }
                }
            });
        });
    }

    // Getter Methods
    getIntegrations() {
        return Array.from(this.integrations.values());
    }

    getWebhooks() {
        return Array.from(this.webhooks.values());
    }

    getConnectors() {
        return Array.from(this.connectors.values());
    }

    getIntegration(integrationId) {
        return this.integrations.get(integrationId);
    }

    getWebhook(webhookId) {
        return this.webhooks.get(webhookId);
    }

    getConnector(connectorId) {
        return this.connectors.get(connectorId);
    }

    isIntegrationEnabled(integrationId) {
        const integration = this.integrations.get(integrationId);
        return integration && integration.status === 'connected';
    }

    isWebhookEnabled(webhookId) {
        const webhook = this.webhooks.get(webhookId);
        return webhook && webhook.status === 'enabled';
    }

    isConnectorEnabled(connectorId) {
        const connector = this.connectors.get(connectorId);
        return connector && connector.status === 'enabled';
    }
}

// Initialize and export
if (typeof window !== 'undefined') {
    window.advancedIntegrations = new AdvancedIntegrationsSystem();
    console.log('🔗 Advanced Integrations System loaded');
}
