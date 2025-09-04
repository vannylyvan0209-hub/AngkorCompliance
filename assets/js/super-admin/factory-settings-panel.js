import { initializeFirebase } from '../../firebase-config.js';

class FactorySettingsPanel {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.factories = [];
        this.selectedFactory = null;
        this.currentSettings = {};
        this.originalSettings = {};
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            await this.loadFactories();
        } catch (error) {
            console.error('Error initializing Factory Settings Panel:', error);
            this.showError('Failed to initialize settings panel');
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
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.switchTab(tabName);
            });
        });

        // Feature toggles
        document.querySelectorAll('.feature-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const featureName = e.currentTarget.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.toggleFeature(featureName);
            });
        });
    }

    async loadFactories() {
        try {
            this.showLoading();
            
            const factoriesSnapshot = await this.db
                .collection('factories')
                .orderBy('name')
                .get();

            this.factories = [];
            factoriesSnapshot.forEach(doc => {
                const factoryData = doc.data();
                this.factories.push({
                    id: doc.id,
                    ...factoryData,
                    createdAt: factoryData.createdAt?.toDate() || new Date(),
                    updatedAt: factoryData.updatedAt?.toDate() || new Date()
                });
            });

            this.updateFactoryList();
        } catch (error) {
            console.error('Error loading factories:', error);
            this.showError('Failed to load factories');
        } finally {
            this.hideLoading();
        }
    }

    updateFactoryList() {
        const factoryList = document.getElementById('factoryList');
        
        if (this.factories.length === 0) {
            factoryList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="building"></i>
                    <h3>No factories found</h3>
                    <p>Factories will appear here once registered</p>
                </div>
            `;
            return;
        }

        factoryList.innerHTML = this.factories.map(factory => `
            <div class="factory-item ${this.selectedFactory?.id === factory.id ? 'active' : ''}" 
                 onclick="selectFactory('${factory.id}')">
                <div class="factory-avatar">
                    ${this.getInitials(factory.name)}
                </div>
                <div class="factory-info">
                    <div class="factory-name">${factory.name}</div>
                    <div class="factory-details">${factory.industry} • ${factory.city}</div>
                </div>
            </div>
        `).join('');

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    async selectFactory(factoryId) {
        try {
            this.selectedFactory = this.factories.find(f => f.id === factoryId);
            if (!this.selectedFactory) return;

            this.updateFactoryList();
            await this.loadFactorySettings();
            this.showFactorySettings();
        } catch (error) {
            console.error('Error selecting factory:', error);
            this.showError('Failed to load factory settings');
        }
    }

    async loadFactorySettings() {
        try {
            if (!this.selectedFactory) return;

            // Load factory settings from Firestore
            const settingsDoc = await this.db
                .collection('factory_settings')
                .doc(this.selectedFactory.id)
                .get();

            if (settingsDoc.exists) {
                this.currentSettings = settingsDoc.data();
            } else {
                // Create default settings
                this.currentSettings = this.getDefaultSettings();
            }

            this.originalSettings = JSON.parse(JSON.stringify(this.currentSettings));
            this.populateSettingsForm();
            await this.loadUsageStatistics();
        } catch (error) {
            console.error('Error loading factory settings:', error);
            this.showError('Failed to load factory settings');
        }
    }

    getDefaultSettings() {
        return {
            // General settings
            name: this.selectedFactory.name,
            factoryCode: this.selectedFactory.factoryCode,
            industry: this.selectedFactory.industry,
            timezone: this.selectedFactory.timezone || 'Asia/Phnom_Penh',
            description: this.selectedFactory.description || '',
            contactEmail: this.selectedFactory.email || '',
            contactPhone: this.selectedFactory.phone || '',
            website: this.selectedFactory.website || '',
            address: this.selectedFactory.address || '',

            // Compliance settings
            complianceStandards: this.selectedFactory.complianceStandards || [],
            auditFrequency: this.selectedFactory.auditFrequency || '',
            nextAuditDate: '',
            hasGrievanceSystem: this.selectedFactory.hasGrievanceSystem || false,
            hasWorkerCommittee: this.selectedFactory.hasWorkerCommittee || false,
            hasSafetyProgram: this.selectedFactory.hasSafetyProgram || false,
            hasTrainingProgram: this.selectedFactory.hasTrainingProgram || false,

            // Feature settings
            enableAI: this.selectedFactory.enableAI || false,
            enableAnalytics: this.selectedFactory.enableAnalytics || false,
            enableMultiLanguage: this.selectedFactory.enableMultiLanguage || false,
            enableAPI: this.selectedFactory.enableAPI || false,

            // User settings
            maxUsers: this.selectedFactory.maxUsers || 10,
            userRole: 'staff',
            requireApproval: true,
            autoAssignRole: true,
            sendWelcomeEmail: true,

            // Billing settings
            subscriptionPlan: this.selectedFactory.subscriptionPlan || 'basic',
            billingCycle: 'monthly',
            nextBillingDate: '',
            billingAmount: this.getBillingAmount(this.selectedFactory.subscriptionPlan || 'basic'),

            // Security settings
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordPolicy: 'standard',
            mfaRequired: 'none',
            enableAuditLog: true,
            dataEncryption: true,
            backupEnabled: true,
            gdprCompliance: false
        };
    }

    getBillingAmount(plan) {
        const amounts = {
            'basic': '$99/month',
            'professional': '$299/month',
            'enterprise': '$799/month',
            'custom': 'Contact Sales'
        };
        return amounts[plan] || '$99/month';
    }

    populateSettingsForm() {
        if (!this.currentSettings) return;

        // General settings
        document.getElementById('factoryName').value = this.currentSettings.name || '';
        document.getElementById('factoryCode').value = this.currentSettings.factoryCode || '';
        document.getElementById('industry').value = this.currentSettings.industry || '';
        document.getElementById('timezone').value = this.currentSettings.timezone || '';
        document.getElementById('description').value = this.currentSettings.description || '';
        document.getElementById('contactEmail').value = this.currentSettings.contactEmail || '';
        document.getElementById('contactPhone').value = this.currentSettings.contactPhone || '';
        document.getElementById('website').value = this.currentSettings.website || '';
        document.getElementById('address').value = this.currentSettings.address || '';

        // Compliance settings
        this.setMultiSelectValues('complianceStandards', this.currentSettings.complianceStandards || []);
        document.getElementById('auditFrequency').value = this.currentSettings.auditFrequency || '';
        document.getElementById('nextAuditDate').value = this.currentSettings.nextAuditDate || '';
        document.getElementById('hasGrievanceSystem').checked = this.currentSettings.hasGrievanceSystem || false;
        document.getElementById('hasWorkerCommittee').checked = this.currentSettings.hasWorkerCommittee || false;
        document.getElementById('hasSafetyProgram').checked = this.currentSettings.hasSafetyProgram || false;
        document.getElementById('hasTrainingProgram').checked = this.currentSettings.hasTrainingProgram || false;

        // Feature toggles
        this.updateFeatureToggle('aiToggle', this.currentSettings.enableAI || false);
        this.updateFeatureToggle('analyticsToggle', this.currentSettings.enableAnalytics || false);
        this.updateFeatureToggle('languageToggle', this.currentSettings.enableMultiLanguage || false);
        this.updateFeatureToggle('apiToggle', this.currentSettings.enableAPI || false);

        // User settings
        document.getElementById('maxUsers').value = this.currentSettings.maxUsers || 10;
        document.getElementById('userRole').value = this.currentSettings.userRole || 'staff';
        document.getElementById('requireApproval').checked = this.currentSettings.requireApproval || false;
        document.getElementById('autoAssignRole').checked = this.currentSettings.autoAssignRole || false;
        document.getElementById('sendWelcomeEmail').checked = this.currentSettings.sendWelcomeEmail || false;

        // Billing settings
        document.getElementById('subscriptionPlan').value = this.currentSettings.subscriptionPlan || 'basic';
        document.getElementById('billingCycle').value = this.currentSettings.billingCycle || 'monthly';
        document.getElementById('nextBillingDate').value = this.currentSettings.nextBillingDate || '';
        document.getElementById('billingAmount').value = this.currentSettings.billingAmount || '$99/month';

        // Security settings
        document.getElementById('sessionTimeout').value = this.currentSettings.sessionTimeout || 30;
        document.getElementById('maxLoginAttempts').value = this.currentSettings.maxLoginAttempts || 5;
        document.getElementById('passwordPolicy').value = this.currentSettings.passwordPolicy || 'standard';
        document.getElementById('mfaRequired').value = this.currentSettings.mfaRequired || 'none';
        document.getElementById('enableAuditLog').checked = this.currentSettings.enableAuditLog || false;
        document.getElementById('dataEncryption').checked = this.currentSettings.dataEncryption || false;
        document.getElementById('backupEnabled').checked = this.currentSettings.backupEnabled || false;
        document.getElementById('gdprCompliance').checked = this.currentSettings.gdprCompliance || false;

        // Update factory info header
        document.getElementById('selectedFactoryName').textContent = this.currentSettings.name || 'Factory Name';
        document.getElementById('selectedFactoryDetails').textContent = 
            `${this.getIndustryName(this.currentSettings.industry)} • ${this.currentSettings.city || 'Location'}`;
        
        this.updateFactoryStatus();
    }

    setMultiSelectValues(selectId, values) {
        const select = document.getElementById(selectId);
        if (!select) return;

        Array.from(select.options).forEach(option => {
            option.selected = values.includes(option.value);
        });
    }

    updateFeatureToggle(toggleId, isActive) {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            if (isActive) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
    }

    updateFactoryStatus() {
        const statusElement = document.getElementById('factoryStatus');
        if (!statusElement) return;

        const status = this.selectedFactory?.status || 'active';
        const statusClass = `status-${status}`;
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);

        statusElement.className = `status-indicator ${statusClass}`;
        statusElement.innerHTML = `
            <i data-lucide="circle"></i>
            <span>${statusText}</span>
        `;

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    async loadUsageStatistics() {
        try {
            if (!this.selectedFactory) return;

            // Load usage statistics
            const stats = await this.getFactoryStatistics();
            
            document.getElementById('activeUsers').textContent = stats.activeUsers || 0;
            document.getElementById('totalCases').textContent = stats.totalCases || 0;
            document.getElementById('complianceScore').textContent = `${stats.complianceScore || 0}%`;
            document.getElementById('lastActivity').textContent = stats.lastActivity || '-';
        } catch (error) {
            console.error('Error loading usage statistics:', error);
        }
    }

    async getFactoryStatistics() {
        try {
            // Get user count
            const usersSnapshot = await this.db
                .collection('users')
                .where('factoryId', '==', this.selectedFactory.id)
                .where('status', '==', 'active')
                .get();

            // Get case count
            const casesSnapshot = await this.db
                .collection('grievance_cases')
                .where('factoryId', '==', this.selectedFactory.id)
                .get();

            // Mock compliance score (in real app, this would be calculated)
            const complianceScore = Math.floor(Math.random() * 40) + 60; // 60-100%

            return {
                activeUsers: usersSnapshot.size,
                totalCases: casesSnapshot.size,
                complianceScore: complianceScore,
                lastActivity: this.formatRelativeTime(this.selectedFactory.updatedAt)
            };
        } catch (error) {
            console.error('Error getting factory statistics:', error);
            return { activeUsers: 0, totalCases: 0, complianceScore: 0, lastActivity: '-' };
        }
    }

    showFactorySettings() {
        document.getElementById('noFactorySelected').style.display = 'none';
        document.getElementById('factorySettings').style.display = 'block';
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Show selected tab content
        const selectedTab = document.getElementById(tabName + 'Tab');
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Add active class to clicked button
        const clickedButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
    }

    toggleFeature(featureName) {
        const toggleId = featureName.replace('enable', '').toLowerCase() + 'Toggle';
        const toggle = document.getElementById(toggleId);
        
        if (toggle) {
            const isActive = toggle.classList.contains('active');
            this.updateFeatureToggle(toggleId, !isActive);
            this.currentSettings[featureName] = !isActive;
        }
    }

    collectFormData() {
        return {
            // General settings
            name: document.getElementById('factoryName').value.trim(),
            factoryCode: document.getElementById('factoryCode').value.trim(),
            industry: document.getElementById('industry').value,
            timezone: document.getElementById('timezone').value,
            description: document.getElementById('description').value.trim(),
            contactEmail: document.getElementById('contactEmail').value.trim(),
            contactPhone: document.getElementById('contactPhone').value.trim(),
            website: document.getElementById('website').value.trim(),
            address: document.getElementById('address').value.trim(),

            // Compliance settings
            complianceStandards: this.getSelectedComplianceStandards(),
            auditFrequency: document.getElementById('auditFrequency').value,
            nextAuditDate: document.getElementById('nextAuditDate').value,
            hasGrievanceSystem: document.getElementById('hasGrievanceSystem').checked,
            hasWorkerCommittee: document.getElementById('hasWorkerCommittee').checked,
            hasSafetyProgram: document.getElementById('hasSafetyProgram').checked,
            hasTrainingProgram: document.getElementById('hasTrainingProgram').checked,

            // Feature settings
            enableAI: this.currentSettings.enableAI || false,
            enableAnalytics: this.currentSettings.enableAnalytics || false,
            enableMultiLanguage: this.currentSettings.enableMultiLanguage || false,
            enableAPI: this.currentSettings.enableAPI || false,

            // User settings
            maxUsers: parseInt(document.getElementById('maxUsers').value) || 10,
            userRole: document.getElementById('userRole').value,
            requireApproval: document.getElementById('requireApproval').checked,
            autoAssignRole: document.getElementById('autoAssignRole').checked,
            sendWelcomeEmail: document.getElementById('sendWelcomeEmail').checked,

            // Billing settings
            subscriptionPlan: document.getElementById('subscriptionPlan').value,
            billingCycle: document.getElementById('billingCycle').value,
            nextBillingDate: document.getElementById('nextBillingDate').value,
            billingAmount: document.getElementById('billingAmount').value,

            // Security settings
            sessionTimeout: parseInt(document.getElementById('sessionTimeout').value) || 30,
            maxLoginAttempts: parseInt(document.getElementById('maxLoginAttempts').value) || 5,
            passwordPolicy: document.getElementById('passwordPolicy').value,
            mfaRequired: document.getElementById('mfaRequired').value,
            enableAuditLog: document.getElementById('enableAuditLog').checked,
            dataEncryption: document.getElementById('dataEncryption').checked,
            backupEnabled: document.getElementById('backupEnabled').checked,
            gdprCompliance: document.getElementById('gdprCompliance').checked
        };
    }

    getSelectedComplianceStandards() {
        const select = document.getElementById('complianceStandards');
        const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
        return selectedOptions;
    }

    async saveSettings() {
        try {
            if (!this.selectedFactory) {
                this.showError('No factory selected');
                return;
            }

            this.showLoading();

            const formData = this.collectFormData();
            
            // Update factory settings in Firestore
            await this.db
                .collection('factory_settings')
                .doc(this.selectedFactory.id)
                .set(formData, { merge: true });

            // Update factory document with basic info
            await this.db
                .collection('factories')
                .doc(this.selectedFactory.id)
                .update({
                    name: formData.name,
                    industry: formData.industry,
                    timezone: formData.timezone,
                    description: formData.description,
                    email: formData.contactEmail,
                    phone: formData.contactPhone,
                    website: formData.website,
                    address: formData.address,
                    complianceStandards: formData.complianceStandards,
                    auditFrequency: formData.auditFrequency,
                    hasGrievanceSystem: formData.hasGrievanceSystem,
                    hasWorkerCommittee: formData.hasWorkerCommittee,
                    hasSafetyProgram: formData.hasSafetyProgram,
                    hasTrainingProgram: formData.hasTrainingProgram,
                    enableAI: formData.enableAI,
                    enableAnalytics: formData.enableAnalytics,
                    enableMultiLanguage: formData.enableMultiLanguage,
                    enableAPI: formData.enableAPI,
                    maxUsers: formData.maxUsers,
                    subscriptionPlan: formData.subscriptionPlan,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: this.currentUser.uid
                });

            this.currentSettings = formData;
            this.originalSettings = JSON.parse(JSON.stringify(formData));
            
            this.showSuccess('Settings saved successfully');
            await this.loadFactories(); // Refresh factory list

        } catch (error) {
            console.error('Error saving settings:', error);
            this.showError('Failed to save settings');
        } finally {
            this.hideLoading();
        }
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to their original values?')) {
            this.currentSettings = JSON.parse(JSON.stringify(this.originalSettings));
            this.populateSettingsForm();
            this.showSuccess('Settings reset to original values');
        }
    }

    async exportFactorySettings() {
        try {
            if (!this.selectedFactory) {
                this.showError('No factory selected');
                return;
            }

            const settings = this.collectFormData();
            const exportData = {
                factory: {
                    id: this.selectedFactory.id,
                    name: this.selectedFactory.name,
                    code: this.selectedFactory.factoryCode
                },
                settings: settings,
                exportedAt: new Date().toISOString(),
                exportedBy: this.currentUser.email
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `factory_settings_${this.selectedFactory.factoryCode}_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);

            this.showSuccess('Settings exported successfully');

        } catch (error) {
            console.error('Error exporting settings:', error);
            this.showError('Failed to export settings');
        }
    }

    // Helper methods
    getInitials(name) {
        return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
    }

    getIndustryName(industry) {
        const industries = {
            'textiles': 'Textiles & Apparel',
            'electronics': 'Electronics',
            'automotive': 'Automotive',
            'food': 'Food & Beverage',
            'chemicals': 'Chemicals',
            'pharmaceuticals': 'Pharmaceuticals',
            'construction': 'Construction',
            'other': 'Other'
        };
        return industries[industry] || industry;
    }

    formatRelativeTime(date) {
        if (!date) return 'Never';
        
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} days ago`;
        
        return date.toLocaleDateString();
    }

    showLoading() {
        // Add loading indicator
        const saveButton = document.querySelector('button[onclick="saveSettings()"]');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = '<i data-lucide="loader-2"></i> Saving...';
        }
    }

    hideLoading() {
        // Remove loading indicator
        const saveButton = document.querySelector('button[onclick="saveSettings()"]');
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i data-lucide="save"></i> Save Changes';
        }
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
let factorySettingsPanel;

function selectFactory(factoryId) {
    factorySettingsPanel.selectFactory(factoryId);
}

function switchTab(tabName) {
    factorySettingsPanel.switchTab(tabName);
}

function toggleFeature(featureName) {
    factorySettingsPanel.toggleFeature(featureName);
}

function saveSettings() {
    factorySettingsPanel.saveSettings();
}

function resetSettings() {
    factorySettingsPanel.resetSettings();
}

function saveAllSettings() {
    factorySettingsPanel.saveSettings();
}

function exportFactorySettings() {
    factorySettingsPanel.exportFactorySettings();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    factorySettingsPanel = new FactorySettingsPanel();
    window.factorySettingsPanel = factorySettingsPanel;
    factorySettingsPanel.init();
});
