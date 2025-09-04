// Viewer Settings Management System
class ViewerSettings {
    constructor() {
        this.currentUser = null;
        this.currentFactory = null;
        this.settings = {};
        this.init();
    }

    async init() {
        console.log('👁️ Initializing Viewer Settings...');
        
        // Check authentication and role
        await this.checkAuth();
        
        // Load settings
        await this.loadSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Populate forms
        this.populateForms();
        
        console.log('✅ Viewer Settings initialized');
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
            if (userData.role !== 'viewer' && userData.role !== 'factory_admin' && userData.role !== 'super_admin') {
                alert('Access denied. Viewer role required.');
                window.location.href = 'dashboard.html';
                return;
            }

            this.currentUser = userData;
            this.currentFactory = userData.factoryId;

            // Update UI
            document.getElementById('userName').textContent = userData.name || userData.email;

        } catch (error) {
            console.error('❌ Authentication error:', error);
            window.location.href = 'login.html';
        }
    }

    async loadSettings() {
        try {
            const settingsDoc = await db.collection('viewer_settings')
                .where('factoryId', '==', this.currentFactory)
                .where('userId', '==', this.currentUser.uid)
                .limit(1)
                .get();

            if (!settingsDoc.empty) {
                this.settings = settingsDoc.docs[0].data();
            }

        } catch (error) {
            console.error('❌ Error loading settings:', error);
        }
    }

    setupEventListeners() {
        // Form submissions
        document.getElementById('displaySettingsForm')?.addEventListener('submit', (e) => this.saveDisplaySettings(e));
        document.getElementById('dataVisibilityForm')?.addEventListener('submit', (e) => this.saveDataVisibility(e));
        document.getElementById('dashboardLayoutForm')?.addEventListener('submit', (e) => this.saveDashboardLayout(e));
        document.getElementById('widgetPreferencesForm')?.addEventListener('submit', (e) => this.saveWidgetPreferences(e));
        document.getElementById('availableReportsForm')?.addEventListener('submit', (e) => this.saveAvailableReports(e));
        document.getElementById('reportSettingsForm')?.addEventListener('submit', (e) => this.saveReportSettings(e));
        document.getElementById('notificationTypesForm')?.addEventListener('submit', (e) => this.saveNotificationTypes(e));
        document.getElementById('notificationPreferencesForm')?.addEventListener('submit', (e) => this.saveNotificationPreferences(e));
        document.getElementById('exportFormatsForm')?.addEventListener('submit', (e) => this.saveExportFormats(e));
        document.getElementById('exportOptionsForm')?.addEventListener('submit', (e) => this.saveExportOptions(e));
    }

    populateForms() {
        // Display settings
        if (this.settings.displaySettings) {
            Object.keys(this.settings.displaySettings).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = this.settings.displaySettings[key];
            });
        }

        // Data visibility
        if (this.settings.dataVisibility) {
            Object.keys(this.settings.dataVisibility).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.dataVisibility[key];
            });
        }

        // Dashboard layout
        if (this.settings.dashboardLayout) {
            Object.keys(this.settings.dashboardLayout).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = this.settings.dashboardLayout[key];
            });
        }

        // Widget preferences
        if (this.settings.widgetPreferences) {
            Object.keys(this.settings.widgetPreferences).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.widgetPreferences[key];
            });
        }

        // Available reports
        if (this.settings.availableReports) {
            Object.keys(this.settings.availableReports).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.availableReports[key];
            });
        }

        // Report settings
        if (this.settings.reportSettings) {
            Object.keys(this.settings.reportSettings).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = this.settings.reportSettings[key];
            });
        }

        // Notification types
        if (this.settings.notificationTypes) {
            Object.keys(this.settings.notificationTypes).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.notificationTypes[key];
            });
        }

        // Notification preferences
        if (this.settings.notificationPreferences) {
            Object.keys(this.settings.notificationPreferences).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.notificationPreferences[key];
            });
        }

        // Export formats
        if (this.settings.exportFormats) {
            Object.keys(this.settings.exportFormats).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.exportFormats[key];
            });
        }

        // Export options
        if (this.settings.exportOptions) {
            Object.keys(this.settings.exportOptions).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.exportOptions[key];
            });
        }
    }

    // Form save methods
    async saveDisplaySettings(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const displaySettings = {
                defaultView: formData.get('defaultView') || 'dashboard',
                itemsPerPage: parseInt(formData.get('itemsPerPage')) || 25,
                dateFormat: formData.get('dateFormat') || 'DD/MM/YYYY',
                timeFormat: formData.get('timeFormat') || '24h'
            };

            await this.saveSettings('displaySettings', displaySettings);
            this.showSuccess('Display settings saved successfully');

        } catch (error) {
            console.error('❌ Error saving display settings:', error);
            this.showError('Failed to save display settings');
        }
    }

    async saveDataVisibility(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const dataVisibility = {
                showExpiredDocuments: formData.has('showExpiredDocuments'),
                showOverdueCAPs: formData.has('showOverdueCAPs'),
                showPendingGrievances: formData.has('showPendingGrievances'),
                showCriticalAlerts: formData.has('showCriticalAlerts'),
                showHistoricalData: formData.has('showHistoricalData'),
                dataRetentionDays: parseInt(formData.get('dataRetentionDays')) || 90
            };

            await this.saveSettings('dataVisibility', dataVisibility);
            this.showSuccess('Data visibility settings saved successfully');

        } catch (error) {
            console.error('❌ Error saving data visibility:', error);
            this.showError('Failed to save data visibility settings');
        }
    }

    async saveDashboardLayout(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const dashboardLayout = {
                dashboardTheme: formData.get('dashboardTheme') || 'light',
                widgetLayout: formData.get('widgetLayout') || 'list',
                refreshInterval: parseInt(formData.get('refreshInterval')) || 5
            };

            await this.saveSettings('dashboardLayout', dashboardLayout);
            this.showSuccess('Dashboard layout saved successfully');

        } catch (error) {
            console.error('❌ Error saving dashboard layout:', error);
            this.showError('Failed to save dashboard layout');
        }
    }

    async saveWidgetPreferences(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const widgetPreferences = {
                showComplianceScore: formData.has('showComplianceScore'),
                showDocumentStatus: formData.has('showDocumentStatus'),
                showCAPProgress: formData.has('showCAPProgress'),
                showGrievanceStats: formData.has('showGrievanceStats'),
                showRecentActivity: formData.has('showRecentActivity'),
                showAlerts: formData.has('showAlerts')
            };

            await this.saveSettings('widgetPreferences', widgetPreferences);
            this.showSuccess('Widget preferences saved successfully');

        } catch (error) {
            console.error('❌ Error saving widget preferences:', error);
            this.showError('Failed to save widget preferences');
        }
    }

    async saveAvailableReports(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const availableReports = {
                complianceOverview: formData.has('complianceOverview'),
                documentStatus: formData.has('documentStatus'),
                capProgress: formData.has('capProgress'),
                grievanceSummary: formData.has('grievanceSummary'),
                auditResults: formData.has('auditResults'),
                performanceMetrics: formData.has('performanceMetrics')
            };

            await this.saveSettings('availableReports', availableReports);
            this.showSuccess('Available reports saved successfully');

        } catch (error) {
            console.error('❌ Error saving available reports:', error);
            this.showError('Failed to save available reports');
        }
    }

    async saveReportSettings(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const reportSettings = {
                defaultReportPeriod: formData.get('defaultReportPeriod') || 'current_month',
                reportDetailLevel: formData.get('reportDetailLevel') || 'detailed',
                includeCharts: formData.has('includeCharts'),
                includeRecommendations: formData.has('includeRecommendations')
            };

            await this.saveSettings('reportSettings', reportSettings);
            this.showSuccess('Report settings saved successfully');

        } catch (error) {
            console.error('❌ Error saving report settings:', error);
            this.showError('Failed to save report settings');
        }
    }

    async saveNotificationTypes(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const notificationTypes = {
                documentExpiry: formData.has('documentExpiry'),
                capDueDate: formData.has('capDueDate'),
                newGrievances: formData.has('newGrievances'),
                complianceBreaches: formData.has('complianceBreaches'),
                systemUpdates: formData.has('systemUpdates'),
                viewerNotificationEmail: formData.get('viewerNotificationEmail') || ''
            };

            await this.saveSettings('notificationTypes', notificationTypes);
            this.showSuccess('Notification types saved successfully');

        } catch (error) {
            console.error('❌ Error saving notification types:', error);
            this.showError('Failed to save notification types');
        }
    }

    async saveNotificationPreferences(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const notificationPreferences = {
                emailNotifications: formData.has('emailNotifications'),
                browserNotifications: formData.has('browserNotifications'),
                soundNotifications: formData.has('soundNotifications'),
                notificationFrequency: formData.get('notificationFrequency') || 'daily',
                quietHours: formData.get('quietHours') || 'night'
            };

            await this.saveSettings('notificationPreferences', notificationPreferences);
            this.showSuccess('Notification preferences saved successfully');

        } catch (error) {
            console.error('❌ Error saving notification preferences:', error);
            this.showError('Failed to save notification preferences');
        }
    }

    async saveExportFormats(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const exportFormats = {
                exportCSV: formData.has('exportCSV'),
                exportJSON: formData.has('exportJSON'),
                exportPDF: formData.has('exportPDF'),
                exportExcel: formData.has('exportExcel'),
                defaultExportFormat: formData.get('defaultExportFormat') || 'csv'
            };

            await this.saveSettings('exportFormats', exportFormats);
            this.showSuccess('Export formats saved successfully');

        } catch (error) {
            console.error('❌ Error saving export formats:', error);
            this.showError('Failed to save export formats');
        }
    }

    async saveExportOptions(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const exportOptions = {
                includeHeaders: formData.has('includeHeaders'),
                includeMetadata: formData.has('includeMetadata'),
                includeCharts: formData.has('includeCharts'),
                maxExportRows: parseInt(formData.get('maxExportRows')) || 5000,
                exportCompression: formData.get('exportCompression') || 'zip'
            };

            await this.saveSettings('exportOptions', exportOptions);
            this.showSuccess('Export options saved successfully');

        } catch (error) {
            console.error('❌ Error saving export options:', error);
            this.showError('Failed to save export options');
        }
    }

    async saveSettings(section, data) {
        try {
            const settingsRef = db.collection('viewer_settings')
                .where('factoryId', '==', this.currentFactory)
                .where('userId', '==', this.currentUser.uid)
                .limit(1);

            const settingsSnapshot = await settingsRef.get();

            if (settingsSnapshot.empty) {
                // Create new settings document
                await db.collection('viewer_settings').add({
                    factoryId: this.currentFactory,
                    userId: this.currentUser.uid,
                    [section]: data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Update existing settings document
                const docRef = settingsSnapshot.docs[0].ref;
                await docRef.update({
                    [section]: data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Update local settings
            this.settings[section] = data;

            // Log audit entry
            await this.logAuditEntry(`viewer_settings_${section}_updated`, {
                section: section,
                data: data
            });

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

    showSuccess(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'notification-toast success';
        toast.innerHTML = `
            <div class="toast-header">
                <i data-lucide="check-circle"></i>
                <span class="toast-title">Success</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="toast-message">${message}</div>
        `;

        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(toast);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 3000);
    }

    showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'notification-toast critical';
        toast.innerHTML = `
            <div class="toast-header">
                <i data-lucide="alert-circle"></i>
                <span class="toast-title">Error</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="toast-message">${message}</div>
        `;

        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(toast);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
}

// Initialize Viewer Settings
let viewerSettings;

document.addEventListener('DOMContentLoaded', function() {
    viewerSettings = new ViewerSettings();
});

// Global functions for HTML onclick handlers
window.showTab = (tabId) => {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    
    // Add active class to clicked nav item
    event.target.classList.add('active');
};

window.logout = () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('❌ Logout error:', error);
    });
};
