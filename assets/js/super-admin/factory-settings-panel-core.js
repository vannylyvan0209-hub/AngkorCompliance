// Factory Settings Panel Core System for Super Admin
class FactorySettingsPanelCore {
    constructor() {
        this.currentUser = null;
        this.factories = [];
        this.selectedFactory = null;
        this.factorySettings = {};
        this.inheritanceSettings = [];
        this.customizationTools = [];
        this.currentTab = 'general';
        
        this.init();
    }
    
    async init() {
        console.log('⚙️ Initializing Factory Settings Panel Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ Factory Settings Panel Core initialized');
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
            window.superAdminNavigation.updateCurrentPage('Factory Settings Panel');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadFactories(),
            this.loadInheritanceSettings(),
            this.loadCustomizationTools()
        ]);
        
        this.renderFactoryDropdown();
        this.renderInheritanceSettings();
        this.renderCustomizationTools();
    }
    
    async loadFactories() {
        try {
            const factoriesRef = this.collection(this.db, 'factories');
            const snapshot = await this.getDocs(factoriesRef);
            this.factories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.factories.length === 0) {
                this.factories = this.getMockFactories();
            }
            console.log(`✓ Loaded ${this.factories.length} factories`);
        } catch (error) {
            console.error('Error loading factories:', error);
            this.factories = this.getMockFactories();
        }
    }
    
    async loadInheritanceSettings() {
        try {
            const inheritanceRef = this.collection(this.db, 'inheritance_settings');
            const snapshot = await this.getDocs(inheritanceRef);
            this.inheritanceSettings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.inheritanceSettings.length === 0) {
                this.inheritanceSettings = this.getMockInheritanceSettings();
            }
            console.log(`✓ Loaded ${this.inheritanceSettings.length} inheritance settings`);
        } catch (error) {
            console.error('Error loading inheritance settings:', error);
            this.inheritanceSettings = this.getMockInheritanceSettings();
        }
    }
    
    async loadCustomizationTools() {
        try {
            const customizationRef = this.collection(this.db, 'customization_tools');
            const snapshot = await this.getDocs(customizationRef);
            this.customizationTools = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.customizationTools.length === 0) {
                this.customizationTools = this.getMockCustomizationTools();
            }
            console.log(`✓ Loaded ${this.customizationTools.length} customization tools`);
        } catch (error) {
            console.error('Error loading customization tools:', error);
            this.customizationTools = this.getMockCustomizationTools();
        }
    }
    
    getMockFactories() {
        return [
            {
                id: 'factory_1',
                name: 'Angkor Textile Manufacturing',
                location: 'Phnom Penh, Cambodia',
                status: 'active',
                industryType: 'textiles',
                complianceScore: 95
            },
            {
                id: 'factory_2',
                name: 'Siem Reap Garment Factory',
                location: 'Siem Reap, Cambodia',
                status: 'active',
                industryType: 'textiles',
                complianceScore: 88
            },
            {
                id: 'factory_3',
                name: 'Battambang Electronics',
                location: 'Battambang, Cambodia',
                status: 'active',
                industryType: 'electronics',
                complianceScore: 72
            },
            {
                id: 'factory_4',
                name: 'Kampong Cham Food Processing',
                location: 'Kampong Cham, Cambodia',
                status: 'active',
                industryType: 'food',
                complianceScore: 92
            },
            {
                id: 'factory_5',
                name: 'Preah Sihanouk Port Services',
                location: 'Preah Sihanouk, Cambodia',
                status: 'active',
                industryType: 'services',
                complianceScore: 85
            }
        ];
    }
    
    getMockInheritanceSettings() {
        return [
            {
                id: 'inherit_1',
                name: 'Global Security Policies',
                status: 'inherited',
                description: 'Security policies inherited from global system settings',
                source: 'Global System',
                lastUpdated: new Date('2024-01-15'),
                canOverride: true
            },
            {
                id: 'inherit_2',
                name: 'Default Notification Settings',
                status: 'overridden',
                description: 'Notification settings customized for this factory',
                source: 'Factory Custom',
                lastUpdated: new Date('2024-01-20'),
                canOverride: true
            },
            {
                id: 'inherit_3',
                name: 'Compliance Standards',
                status: 'inherited',
                description: 'Compliance standards inherited from industry profile',
                source: 'Industry Profile',
                lastUpdated: new Date('2024-01-25'),
                canOverride: false
            },
            {
                id: 'inherit_4',
                name: 'User Access Controls',
                status: 'custom',
                description: 'Custom user access controls specific to this factory',
                source: 'Factory Custom',
                lastUpdated: new Date('2024-02-01'),
                canOverride: true
            },
            {
                id: 'inherit_5',
                name: 'Audit Schedule',
                status: 'inherited',
                description: 'Audit schedule inherited from compliance requirements',
                source: 'Compliance Requirements',
                lastUpdated: new Date('2024-02-05'),
                canOverride: true
            },
            {
                id: 'inherit_6',
                name: 'Data Retention Policies',
                status: 'overridden',
                description: 'Data retention policies customized for this factory',
                source: 'Factory Custom',
                lastUpdated: new Date('2024-02-10'),
                canOverride: true
            }
        ];
    }
    
    getMockCustomizationTools() {
        return [
            {
                id: 'custom_1',
                name: 'Factory Branding',
                type: 'branding',
                description: 'Customize factory branding, logos, and visual identity',
                isEnabled: true,
                lastUsed: new Date('2024-01-15')
            },
            {
                id: 'custom_2',
                name: 'Dashboard Layout',
                type: 'layout',
                description: 'Customize dashboard layout and widget arrangement',
                isEnabled: true,
                lastUsed: new Date('2024-01-20')
            },
            {
                id: 'custom_3',
                name: 'Report Templates',
                type: 'templates',
                description: 'Create and manage custom report templates',
                isEnabled: false,
                lastUsed: new Date('2024-01-10')
            },
            {
                id: 'custom_4',
                name: 'Workflow Automation',
                type: 'automation',
                description: 'Configure automated workflows and processes',
                isEnabled: true,
                lastUsed: new Date('2024-01-25')
            },
            {
                id: 'custom_5',
                name: 'Custom Fields',
                type: 'fields',
                description: 'Add custom fields to forms and data collection',
                isEnabled: true,
                lastUsed: new Date('2024-02-01')
            },
            {
                id: 'custom_6',
                name: 'API Integrations',
                type: 'integrations',
                description: 'Configure custom API integrations and webhooks',
                isEnabled: false,
                lastUsed: new Date('2024-01-05')
            }
        ];
    }
    
    renderFactoryDropdown() {
        const dropdown = document.getElementById('factoryDropdown');
        if (!dropdown) return;
        
        dropdown.innerHTML = this.factories.map(factory => `
            <div class="dropdown-item" onclick="selectFactory('${factory.id}')">
                <div style="font-weight: 500; color: var(--neutral-900);">${factory.name}</div>
                <div style="font-size: var(--text-xs); color: var(--neutral-600);">${factory.location}</div>
            </div>
        `).join('');
    }
    
    renderInheritanceSettings() {
        const inheritanceGrid = document.getElementById('inheritanceGrid');
        if (!inheritanceGrid) return;
        
        inheritanceGrid.innerHTML = this.inheritanceSettings.map(setting => `
            <div class="inheritance-item">
                <div class="inheritance-header-item">
                    <div class="inheritance-name">${setting.name}</div>
                    <div class="inheritance-status ${setting.status}">${setting.status}</div>
                </div>
                <div class="inheritance-description">${setting.description}</div>
                <div style="margin-bottom: var(--space-3);">
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        <strong>Source:</strong> ${setting.source}
                    </div>
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        <strong>Last Updated:</strong> ${this.formatDate(setting.lastUpdated)}
                    </div>
                </div>
                <div class="inheritance-actions">
                    <button class="inheritance-btn" onclick="viewInheritance('${setting.id}')">
                        <i data-lucide="eye"></i>
                        View
                    </button>
                    ${setting.canOverride ? `
                        <button class="inheritance-btn" onclick="overrideInheritance('${setting.id}')">
                            <i data-lucide="edit"></i>
                            Override
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    renderCustomizationTools() {
        const customizationGrid = document.getElementById('customizationGrid');
        if (!customizationGrid) return;
        
        customizationGrid.innerHTML = this.customizationTools.map(tool => `
            <div class="customization-item">
                <div class="customization-header-item">
                    <div class="customization-name">${tool.name}</div>
                    <div class="customization-type">${tool.type}</div>
                </div>
                <div class="customization-description">${tool.description}</div>
                <div style="margin-bottom: var(--space-3);">
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        <strong>Status:</strong> ${tool.isEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        <strong>Last Used:</strong> ${this.formatDate(tool.lastUsed)}
                    </div>
                </div>
                <div class="customization-actions">
                    <button class="customization-btn" onclick="configureTool('${tool.id}')">
                        <i data-lucide="settings"></i>
                        Configure
                    </button>
                    <button class="customization-btn" onclick="toggleTool('${tool.id}')">
                        <i data-lucide="${tool.isEnabled ? 'pause' : 'play'}"></i>
                        ${tool.isEnabled ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    async loadFactorySettings(factoryId) {
        try {
            const settingsRef = this.doc(this.db, 'factory_settings', factoryId);
            const settingsDoc = await this.getDoc(settingsRef);
            
            if (settingsDoc.exists()) {
                this.factorySettings = settingsDoc.data();
            } else {
                this.factorySettings = this.getDefaultFactorySettings();
            }
            
            this.renderSettingsTabs();
            console.log(`✓ Loaded settings for factory ${factoryId}`);
        } catch (error) {
            console.error('Error loading factory settings:', error);
            this.factorySettings = this.getDefaultFactorySettings();
            this.renderSettingsTabs();
        }
    }
    
    getDefaultFactorySettings() {
        return {
            general: {
                factoryName: '',
                timezone: 'Asia/Phnom_Penh',
                language: 'en',
                dateFormat: 'DD/MM/YYYY',
                currency: 'USD',
                autoSave: true,
                notifications: true
            },
            compliance: {
                standards: [],
                auditFrequency: 'quarterly',
                complianceReporting: true,
                riskAssessment: true,
                correctiveActions: true
            },
            security: {
                twoFactorAuth: true,
                sessionTimeout: 30,
                passwordPolicy: 'strong',
                accessLogging: true,
                ipRestrictions: false
            },
            notifications: {
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: true,
                auditAlerts: true,
                complianceAlerts: true,
                systemAlerts: true
            },
            integrations: {
                apiEnabled: false,
                webhookUrl: '',
                thirdPartyIntegrations: [],
                dataSync: false,
                backupIntegration: false
            }
        };
    }
    
    renderSettingsTabs() {
        this.renderGeneralSettings();
        this.renderComplianceSettings();
        this.renderSecuritySettings();
        this.renderNotificationSettings();
        this.renderIntegrationSettings();
    }
    
    renderGeneralSettings() {
        const generalSettings = document.getElementById('generalSettings');
        if (!generalSettings) return;
        
        const settings = this.factorySettings.general || {};
        
        generalSettings.innerHTML = `
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Factory Name</div>
                </div>
                <div class="setting-description">Display name for this factory</div>
                <input type="text" class="setting-input" value="${settings.factoryName || ''}" 
                       onchange="updateSetting('general', 'factoryName', this.value)">
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Timezone</div>
                </div>
                <div class="setting-description">Default timezone for this factory</div>
                <select class="setting-select" onchange="updateSetting('general', 'timezone', this.value)">
                    <option value="Asia/Phnom_Penh" ${settings.timezone === 'Asia/Phnom_Penh' ? 'selected' : ''}>Asia/Phnom_Penh</option>
                    <option value="UTC" ${settings.timezone === 'UTC' ? 'selected' : ''}>UTC</option>
                    <option value="Asia/Bangkok" ${settings.timezone === 'Asia/Bangkok' ? 'selected' : ''}>Asia/Bangkok</option>
                </select>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Language</div>
                </div>
                <div class="setting-description">Default language for this factory</div>
                <select class="setting-select" onchange="updateSetting('general', 'language', this.value)">
                    <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                    <option value="km" ${settings.language === 'km' ? 'selected' : ''}>Khmer</option>
                </select>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Date Format</div>
                </div>
                <div class="setting-description">Date format for this factory</div>
                <select class="setting-select" onchange="updateSetting('general', 'dateFormat', this.value)">
                    <option value="DD/MM/YYYY" ${settings.dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY" ${settings.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD" ${settings.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
                </select>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Auto Save</div>
                    <div class="setting-toggle ${settings.autoSave ? 'active' : ''}" 
                         onclick="toggleSetting('general', 'autoSave')"></div>
                </div>
                <div class="setting-description">Automatically save changes</div>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Notifications</div>
                    <div class="setting-toggle ${settings.notifications ? 'active' : ''}" 
                         onclick="toggleSetting('general', 'notifications')"></div>
                </div>
                <div class="setting-description">Enable system notifications</div>
            </div>
        `;
    }
    
    renderComplianceSettings() {
        const complianceSettings = document.getElementById('complianceSettings');
        if (!complianceSettings) return;
        
        const settings = this.factorySettings.compliance || {};
        
        complianceSettings.innerHTML = `
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Audit Frequency</div>
                </div>
                <div class="setting-description">How often audits are conducted</div>
                <select class="setting-select" onchange="updateSetting('compliance', 'auditFrequency', this.value)">
                    <option value="monthly" ${settings.auditFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                    <option value="quarterly" ${settings.auditFrequency === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                    <option value="annually" ${settings.auditFrequency === 'annually' ? 'selected' : ''}>Annually</option>
                </select>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Compliance Reporting</div>
                    <div class="setting-toggle ${settings.complianceReporting ? 'active' : ''}" 
                         onclick="toggleSetting('compliance', 'complianceReporting')"></div>
                </div>
                <div class="setting-description">Enable automated compliance reporting</div>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Risk Assessment</div>
                    <div class="setting-toggle ${settings.riskAssessment ? 'active' : ''}" 
                         onclick="toggleSetting('compliance', 'riskAssessment')"></div>
                </div>
                <div class="setting-description">Enable risk assessment tools</div>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Corrective Actions</div>
                    <div class="setting-toggle ${settings.correctiveActions ? 'active' : ''}" 
                         onclick="toggleSetting('compliance', 'correctiveActions')"></div>
                </div>
                <div class="setting-description">Enable corrective action tracking</div>
            </div>
        `;
    }
    
    renderSecuritySettings() {
        const securitySettings = document.getElementById('securitySettings');
        if (!securitySettings) return;
        
        const settings = this.factorySettings.security || {};
        
        securitySettings.innerHTML = `
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Two-Factor Authentication</div>
                    <div class="setting-toggle ${settings.twoFactorAuth ? 'active' : ''}" 
                         onclick="toggleSetting('security', 'twoFactorAuth')"></div>
                </div>
                <div class="setting-description">Require 2FA for all users</div>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Session Timeout (minutes)</div>
                </div>
                <div class="setting-description">Auto-logout after inactivity</div>
                <input type="number" class="setting-input" value="${settings.sessionTimeout || 30}" 
                       onchange="updateSetting('security', 'sessionTimeout', parseInt(this.value))">
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Password Policy</div>
                </div>
                <div class="setting-description">Password strength requirements</div>
                <select class="setting-select" onchange="updateSetting('security', 'passwordPolicy', this.value)">
                    <option value="basic" ${settings.passwordPolicy === 'basic' ? 'selected' : ''}>Basic</option>
                    <option value="strong" ${settings.passwordPolicy === 'strong' ? 'selected' : ''}>Strong</option>
                    <option value="enterprise" ${settings.passwordPolicy === 'enterprise' ? 'selected' : ''}>Enterprise</option>
                </select>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Access Logging</div>
                    <div class="setting-toggle ${settings.accessLogging ? 'active' : ''}" 
                         onclick="toggleSetting('security', 'accessLogging')"></div>
                </div>
                <div class="setting-description">Log all access attempts</div>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">IP Restrictions</div>
                    <div class="setting-toggle ${settings.ipRestrictions ? 'active' : ''}" 
                         onclick="toggleSetting('security', 'ipRestrictions')"></div>
                </div>
                <div class="setting-description">Restrict access by IP address</div>
            </div>
        `;
    }
    
    renderNotificationSettings() {
        const notificationSettings = document.getElementById('notificationSettings');
        if (!notificationSettings) return;
        
        const settings = this.factorySettings.notifications || {};
        
        notificationSettings.innerHTML = `
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Email Notifications</div>
                    <div class="setting-toggle ${settings.emailNotifications ? 'active' : ''}" 
                         onclick="toggleSetting('notifications', 'emailNotifications')"></div>
                </div>
                <div class="setting-description">Send notifications via email</div>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">SMS Notifications</div>
                    <div class="setting-toggle ${settings.smsNotifications ? 'active' : ''}" 
                         onclick="toggleSetting('notifications', 'smsNotifications')"></div>
                </div>
                <div class="setting-description">Send notifications via SMS</div>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Push Notifications</div>
                    <div class="setting-toggle ${settings.pushNotifications ? 'active' : ''}" 
                         onclick="toggleSetting('notifications', 'pushNotifications')"></div>
                </div>
                <div class="setting-description">Send push notifications</div>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Audit Alerts</div>
                    <div class="setting-toggle ${settings.auditAlerts ? 'active' : ''}" 
                         onclick="toggleSetting('notifications', 'auditAlerts')"></div>
                </div>
                <div class="setting-description">Alert on audit events</div>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Compliance Alerts</div>
                    <div class="setting-toggle ${settings.complianceAlerts ? 'active' : ''}" 
                         onclick="toggleSetting('notifications', 'complianceAlerts')"></div>
                </div>
                <div class="setting-description">Alert on compliance issues</div>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">System Alerts</div>
                    <div class="setting-toggle ${settings.systemAlerts ? 'active' : ''}" 
                         onclick="toggleSetting('notifications', 'systemAlerts')"></div>
                </div>
                <div class="setting-description">Alert on system events</div>
            </div>
        `;
    }
    
    renderIntegrationSettings() {
        const integrationSettings = document.getElementById('integrationSettings');
        if (!integrationSettings) return;
        
        const settings = this.factorySettings.integrations || {};
        
        integrationSettings.innerHTML = `
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">API Enabled</div>
                    <div class="setting-toggle ${settings.apiEnabled ? 'active' : ''}" 
                         onclick="toggleSetting('integrations', 'apiEnabled')"></div>
                </div>
                <div class="setting-description">Enable API access for this factory</div>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Webhook URL</div>
                </div>
                <div class="setting-description">URL for webhook notifications</div>
                <input type="url" class="setting-input" value="${settings.webhookUrl || ''}" 
                       onchange="updateSetting('integrations', 'webhookUrl', this.value)">
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Data Sync</div>
                    <div class="setting-toggle ${settings.dataSync ? 'active' : ''}" 
                         onclick="toggleSetting('integrations', 'dataSync')"></div>
                </div>
                <div class="setting-description">Enable data synchronization</div>
            </div>
            
            <div class="setting-item">
                <div class="setting-header">
                    <div class="setting-title">Backup Integration</div>
                    <div class="setting-toggle ${settings.backupIntegration ? 'active' : ''}" 
                         onclick="toggleSetting('integrations', 'backupIntegration')"></div>
                </div>
                <div class="setting-description">Enable backup integration</div>
            </div>
        `;
    }
    
    initializeUI() {
        // Initialize any UI components
    }
    
    setupEventListeners() {
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        window.resetToDefaults = () => this.resetToDefaults();
        window.saveAllSettings = () => this.saveAllSettings();
        window.selectFactory = (factoryId) => this.selectFactory(factoryId);
        window.switchTab = (tabName) => this.switchTab(tabName);
        window.updateSetting = (category, key, value) => this.updateSetting(category, key, value);
        window.toggleSetting = (category, key) => this.toggleSetting(category, key);
        window.importSettings = () => this.importSettings();
        window.exportSettings = () => this.exportSettings();
        window.updateComplianceSettings = () => this.updateComplianceSettings();
        window.updateSecuritySettings = () => this.updateSecuritySettings();
        window.updateNotificationSettings = () => this.updateNotificationSettings();
        window.updateIntegrationSettings = () => this.updateIntegrationSettings();
        window.viewInheritance = (inheritanceId) => this.viewInheritance(inheritanceId);
        window.overrideInheritance = (inheritanceId) => this.overrideInheritance(inheritanceId);
        window.configureTool = (toolId) => this.configureTool(toolId);
        window.toggleTool = (toolId) => this.toggleTool(toolId);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const factoriesRef = this.collection(this.db, 'factories');
        this.onSnapshot(factoriesRef, (snapshot) => {
            this.factories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderFactoryDropdown();
        });
    }
    
    // Utility methods
    formatDate(date) {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString();
    }
    
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
    window.factorySettingsPanelCore = new FactorySettingsPanelCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FactorySettingsPanelCore;
}
