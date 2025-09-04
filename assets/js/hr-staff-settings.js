// HR Staff Settings Management System
class HRStaffSettings {
    constructor() {
        this.currentUser = null;
        this.currentFactory = null;
        this.settings = {};
        this.init();
    }

    async init() {
        console.log('👥 Initializing HR Staff Settings...');
        
        // Check authentication and role
        await this.checkAuth();
        
        // Load settings
        await this.loadSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize charts
        this.initializeCharts();
        
        // Load initial data
        await this.loadInitialData();
        
        console.log('✅ HR Staff Settings initialized');
    }

    async checkAuth() {
        try {
            const user = auth.currentUser;
            if (!user) {
                window.location.href = 'login.html';
                return;
            }

            // Get user data
            const userDoc = await collection(db, 'users', user.uid);
            if (!userDoc.exists()()) {
                window.location.href = 'login.html';
                return;
            }

            const userData = userDoc.data();
            if (userData.role !== 'hr_staff' && userData.role !== 'factory_admin' && userData.role !== 'super_admin') {
                alert('Access denied. HR Staff role required.');
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
            const settingsDoc = await collection(db, 'hr_settings')
                .where('factoryId', '==', this.currentFactory)
                .limit(1)
                .get();

            if (!settingsDoc.empty) {
                this.settings = settingsDoc.docs[0].data();
                this.populateForms();
            }

        } catch (error) {
            console.error('❌ Error loading settings:', error);
        }
    }

    setupEventListeners() {
        // Form submissions
        document.getElementById('demographicsForm')?.addEventListener('submit', (e) => this.saveDemographics(e));
        document.getElementById('workingConditionsForm')?.addEventListener('submit', (e) => this.saveWorkingConditions(e));
        document.getElementById('laborStandardsForm')?.addEventListener('submit', (e) => this.saveLaborStandards(e));
        document.getElementById('healthSafetyForm')?.addEventListener('submit', (e) => this.saveHealthSafety(e));
        document.getElementById('resolutionProcessForm')?.addEventListener('submit', (e) => this.saveResolutionProcess(e));
        document.getElementById('trainingRequirementsForm')?.addEventListener('submit', (e) => this.saveTrainingRequirements(e));
        document.getElementById('hrNotificationsForm')?.addEventListener('submit', (e) => this.saveHRNotifications(e));
        document.getElementById('alertFrequencyForm')?.addEventListener('submit', (e) => this.saveAlertFrequency(e));
    }

    populateForms() {
        // Demographics
        if (this.settings.demographics) {
            Object.keys(this.settings.demographics).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = this.settings.demographics[key];
            });
        }

        // Working conditions
        if (this.settings.workingConditions) {
            Object.keys(this.settings.workingConditions).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = this.settings.workingConditions[key];
            });
        }

        // Labor standards
        if (this.settings.laborStandards) {
            Object.keys(this.settings.laborStandards).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.laborStandards[key];
            });
        }

        // Health & safety
        if (this.settings.healthSafety) {
            Object.keys(this.settings.healthSafety).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.healthSafety[key];
            });
        }

        // Resolution process
        if (this.settings.resolutionProcess) {
            Object.keys(this.settings.resolutionProcess).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = this.settings.resolutionProcess[key];
            });
        }

        // Training requirements
        if (this.settings.trainingRequirements) {
            Object.keys(this.settings.trainingRequirements).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.trainingRequirements[key];
            });
        }

        // HR notifications
        if (this.settings.hrNotifications) {
            Object.keys(this.settings.hrNotifications).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.hrNotifications[key];
            });
        }

        // Alert frequency
        if (this.settings.alertFrequency) {
            Object.keys(this.settings.alertFrequency).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = this.settings.alertFrequency[key];
            });
        }
    }

    async loadInitialData() {
        await Promise.all([
            this.loadGrievanceCategories(),
            this.loadTrainingPrograms(),
            this.loadWorkforceAnalytics(),
            this.updateComplianceMetrics()
        ]);
    }

    async loadGrievanceCategories() {
        try {
            const categoriesSnapshot = await collection(db, 'grievance_categories')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('name')
                .get();

            const categoriesContainer = document.getElementById('grievanceCategories');
            if (!categoriesContainer) return;

            if (categoriesSnapshot.empty) {
                categoriesContainer.innerHTML = '<p class="text-muted">No grievance categories found.</p>';
                return;
            }

            categoriesContainer.innerHTML = categoriesSnapshot.docs.map(doc => {
                const category = doc.data();
                return `
                    <div class="category-item">
                        <div class="category-info">
                            <h4>${category.name}</h4>
                            <p>${category.description || 'No description'}</p>
                            <span class="priority-badge ${category.priority}">${category.priority}</span>
                        </div>
                        <div class="category-actions">
                            <button onclick="editGrievanceCategory('${doc.id}')" class="btn btn-sm btn-outline">
                                <i data-lucide="edit"></i>
                            </button>
                            <button onclick="deleteGrievanceCategory('${doc.id}')" class="btn btn-sm btn-danger">
                                <i data-lucide="trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

        } catch (error) {
            console.error('❌ Error loading grievance categories:', error);
        }
    }

    async loadTrainingPrograms() {
        try {
            const programsSnapshot = await collection(db, 'training_programs')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('name')
                .get();

            const programsContainer = document.getElementById('trainingPrograms');
            if (!programsContainer) return;

            if (programsSnapshot.empty) {
                programsContainer.innerHTML = '<p class="text-muted">No training programs found.</p>';
                return;
            }

            programsContainer.innerHTML = programsSnapshot.docs.map(doc => {
                const program = doc.data();
                return `
                    <div class="training-item">
                        <div class="training-info">
                            <h4>${program.name}</h4>
                            <p>${program.description || 'No description'}</p>
                            <div class="training-details">
                                <span class="duration">${program.duration}h</span>
                                <span class="frequency">${program.frequency}</span>
                                <span class="required-for">${program.requiredFor}</span>
                            </div>
                        </div>
                        <div class="training-actions">
                            <button onclick="editTrainingProgram('${doc.id}')" class="btn btn-sm btn-outline">
                                <i data-lucide="edit"></i>
                            </button>
                            <button onclick="deleteTrainingProgram('${doc.id}')" class="btn btn-sm btn-danger">
                                <i data-lucide="trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

        } catch (error) {
            console.error('❌ Error loading training programs:', error);
        }
    }

    async loadWorkforceAnalytics() {
        try {
            // Get workforce data
            const workforceData = await this.getWorkforceData();
            
            // Create chart
            const ctx = document.getElementById('workforceAnalyticsChart');
            if (!ctx) return;

            if (this.workforceChart) {
                this.workforceChart.destroy();
            }

            this.workforceChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Full-time', 'Part-time', 'Contract'],
                    datasets: [{
                        data: [
                            workforceData.fullTime || 0,
                            workforceData.partTime || 0,
                            workforceData.contract || 0
                        ],
                        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: 'Workforce Distribution'
                        }
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error loading workforce analytics:', error);
        }
    }

    async getWorkforceData() {
        try {
            const settingsDoc = await collection(db, 'hr_settings')
                .where('factoryId', '==', this.currentFactory)
                .limit(1)
                .get();

            if (!settingsDoc.empty) {
                return settingsDoc.docs[0].data().demographics || {};
            }

            return {};

        } catch (error) {
            console.error('❌ Error getting workforce data:', error);
            return {};
        }
    }

    async updateComplianceMetrics() {
        try {
            // Calculate metrics based on settings and data
            const metrics = await this.calculateComplianceMetrics();
            
            // Update UI
            document.getElementById('trainingCompletion').textContent = `${metrics.trainingCompletion}%`;
            document.getElementById('grievanceResolution').textContent = `${metrics.grievanceResolution}%`;
            document.getElementById('safetyCompliance').textContent = `${metrics.safetyCompliance}%`;
            document.getElementById('laborCompliance').textContent = `${metrics.laborCompliance}%`;

        } catch (error) {
            console.error('❌ Error updating compliance metrics:', error);
        }
    }

    async calculateComplianceMetrics() {
        try {
            // Get training completion rate
            const trainingSnapshot = await collection(db, 'training_records')
                .where('factoryId', '==', this.currentFactory)
                .get();

            const totalTraining = trainingSnapshot.size;
            const completedTraining = trainingSnapshot.docs.filter(doc => 
                doc.data().status === 'completed'
            ).length;

            // Get grievance resolution rate
            const grievanceSnapshot = await collection(db, 'grievances')
                .where('factoryId', '==', this.currentFactory)
                .get();

            const totalGrievances = grievanceSnapshot.size;
            const resolvedGrievances = grievanceSnapshot.docs.filter(doc => 
                doc.data().status === 'resolved'
            ).length;

            return {
                trainingCompletion: totalTraining > 0 ? Math.round((completedTraining / totalTraining) * 100) : 0,
                grievanceResolution: totalGrievances > 0 ? Math.round((resolvedGrievances / totalGrievances) * 100) : 0,
                safetyCompliance: this.settings.healthSafety ? 85 : 0, // Placeholder
                laborCompliance: this.settings.laborStandards ? 90 : 0 // Placeholder
            };

        } catch (error) {
            console.error('❌ Error calculating compliance metrics:', error);
            return {
                trainingCompletion: 0,
                grievanceResolution: 0,
                safetyCompliance: 0,
                laborCompliance: 0
            };
        }
    }

    // Form save methods
    async saveDemographics(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const demographics = {
                totalEmployees: parseInt(formData.get('totalEmployees')) || 0,
                fullTimeEmployees: parseInt(formData.get('fullTimeEmployees')) || 0,
                partTimeEmployees: parseInt(formData.get('partTimeEmployees')) || 0,
                contractEmployees: parseInt(formData.get('contractEmployees')) || 0,
                femaleEmployees: parseInt(formData.get('femaleEmployees')) || 0,
                maleEmployees: parseInt(formData.get('maleEmployees')) || 0
            };

            await this.saveSettings('demographics', demographics);
            this.showSuccess('Demographics saved successfully');
            await this.loadWorkforceAnalytics();

        } catch (error) {
            console.error('❌ Error saving demographics:', error);
            this.showError('Failed to save demographics');
        }
    }

    async saveWorkingConditions(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const workingConditions = {
                standardWorkHours: parseInt(formData.get('standardWorkHours')) || 8,
                overtimePolicy: formData.get('overtimePolicy') || 'standard',
                breakTime: parseInt(formData.get('breakTime')) || 30,
                leavePolicy: formData.get('leavePolicy') || ''
            };

            await this.saveSettings('workingConditions', workingConditions);
            this.showSuccess('Working conditions saved successfully');

        } catch (error) {
            console.error('❌ Error saving working conditions:', error);
            this.showError('Failed to save working conditions');
        }
    }

    async saveLaborStandards(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const laborStandards = {
                minimumWage: formData.has('minimumWage'),
                overtimePay: formData.has('overtimePay'),
                childLabor: formData.has('childLabor'),
                forcedLabor: formData.has('forcedLabor'),
                discrimination: formData.has('discrimination'),
                harassment: formData.has('harassment')
            };

            await this.saveSettings('laborStandards', laborStandards);
            this.showSuccess('Labor standards saved successfully');
            await this.updateComplianceMetrics();

        } catch (error) {
            console.error('❌ Error saving labor standards:', error);
            this.showError('Failed to save labor standards');
        }
    }

    async saveHealthSafety(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const healthSafety = {
                safetyTraining: formData.has('safetyTraining'),
                ppe: formData.has('ppe'),
                emergencyProcedures: formData.has('emergencyProcedures'),
                healthChecks: formData.has('healthChecks'),
                safetyOfficer: formData.get('safetyOfficer') || ''
            };

            await this.saveSettings('healthSafety', healthSafety);
            this.showSuccess('Health & safety settings saved successfully');
            await this.updateComplianceMetrics();

        } catch (error) {
            console.error('❌ Error saving health & safety:', error);
            this.showError('Failed to save health & safety settings');
        }
    }

    async saveResolutionProcess(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const resolutionProcess = {
                responseTime: parseInt(formData.get('responseTime')) || 24,
                resolutionTime: parseInt(formData.get('resolutionTime')) || 7,
                escalationLevels: parseInt(formData.get('escalationLevels')) || 3,
                anonymousReporting: formData.get('anonymousReporting') === 'true'
            };

            await this.saveSettings('resolutionProcess', resolutionProcess);
            this.showSuccess('Resolution process saved successfully');

        } catch (error) {
            console.error('❌ Error saving resolution process:', error);
            this.showError('Failed to save resolution process');
        }
    }

    async saveTrainingRequirements(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const trainingRequirements = {
                orientationTraining: formData.has('orientationTraining'),
                safetyTraining: formData.has('safetyTraining'),
                complianceTraining: formData.has('complianceTraining'),
                skillDevelopment: formData.has('skillDevelopment'),
                trainingFrequency: formData.get('trainingFrequency') || 'quarterly'
            };

            await this.saveSettings('trainingRequirements', trainingRequirements);
            this.showSuccess('Training requirements saved successfully');

        } catch (error) {
            console.error('❌ Error saving training requirements:', error);
            this.showError('Failed to save training requirements');
        }
    }

    async saveHRNotifications(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const hrNotifications = {
                newGrievances: formData.has('newGrievances'),
                trainingReminders: formData.has('trainingReminders'),
                complianceDeadlines: formData.has('complianceDeadlines'),
                safetyIncidents: formData.has('safetyIncidents'),
                hrNotificationEmail: formData.get('hrNotificationEmail') || ''
            };

            await this.saveSettings('hrNotifications', hrNotifications);
            this.showSuccess('HR notifications saved successfully');

        } catch (error) {
            console.error('❌ Error saving HR notifications:', error);
            this.showError('Failed to save HR notifications');
        }
    }

    async saveAlertFrequency(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const alertFrequency = {
                grievanceAlerts: formData.get('grievanceAlerts') || 'daily',
                trainingAlerts: formData.get('trainingAlerts') || 'monthly',
                complianceAlerts: formData.get('complianceAlerts') || 'daily'
            };

            await this.saveSettings('alertFrequency', alertFrequency);
            this.showSuccess('Alert frequency saved successfully');

        } catch (error) {
            console.error('❌ Error saving alert frequency:', error);
            this.showError('Failed to save alert frequency');
        }
    }

    async saveSettings(section, data) {
        try {
            const settingsRef = collection(db, 'hr_settings')
                .where('factoryId', '==', this.currentFactory)
                .limit(1);

            const settingsSnapshot = await settingsRef.get();

            if (settingsSnapshot.empty) {
                // Create new settings document
                await collection(db, 'hr_settings', {
                    factoryId: this.currentFactory,
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
            await this.logAuditEntry(`hr_settings_${section}_updated`, {
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
            await collection(db, 'audit_log', {
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

    initializeCharts() {
        if (typeof Chart !== 'undefined') {
            Chart.defaults.font.family = 'Inter, sans-serif';
            Chart.defaults.color = '#6B7280';
        }
    }
}

// Initialize HR Staff Settings
let hrStaffSettings;

// Wait for Firebase to be available before initializing
function initializeHrstaffsettings() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeHrstaffsettings, 100);
        return;
    }

    // Get Firebase instances and functions from the global Firebase object
    const { auth, db } = window.Firebase;
    const {
        doc,
        getDoc,
        setDoc,
        updateDoc,
        deleteDoc,
        collection,
        query,
        where,
        orderBy,
        limit,
        onSnapshot,
        getDocs,
        addDoc,
        serverTimestamp,
        writeBatch
    } = window.Firebase;

document.addEventListener('DOMContentLoaded', function() {
    hrStaffSettings = new HRStaffSettings();
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

window.openAddGrievanceCategoryModal = () => {
    document.getElementById('addGrievanceCategoryModal').style.display = 'flex';
};

window.openAddTrainingModal = () => {
    document.getElementById('addTrainingModal').style.display = 'flex';
};

window.closeModal = (modalId) => {
    document.getElementById(modalId).style.display = 'none';
};

window.saveNewGrievanceCategory = async () => {
    try {
        const form = document.getElementById('addGrievanceCategoryForm');
        const formData = new FormData(form);
        
        const categoryData = {
            name: formData.get('name'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            factoryId: hrStaffSettings.currentFactory,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: hrStaffSettings.currentUser.uid
        };

        await collection(db, 'grievance_categories', categoryData);
        
        closeModal('addGrievanceCategoryModal');
        form.reset();
        hrStaffSettings.showSuccess('Grievance category added successfully');
        await hrStaffSettings.loadGrievanceCategories();

    } catch (error) {
        console.error('❌ Error adding grievance category:', error);
        hrStaffSettings.showError('Failed to add grievance category');
    }
};

window.saveNewTraining = async () => {
    try {
        const form = document.getElementById('addTrainingForm');
        const formData = new FormData(form);
        
        const trainingData = {
            name: formData.get('name'),
            description: formData.get('description'),
            duration: parseFloat(formData.get('duration')),
            frequency: formData.get('frequency'),
            requiredFor: formData.get('requiredFor'),
            factoryId: hrStaffSettings.currentFactory,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: hrStaffSettings.currentUser.uid
        };

        await collection(db, 'training_programs', trainingData);
        
        closeModal('addTrainingModal');
        form.reset();
        hrStaffSettings.showSuccess('Training program added successfully');
        await hrStaffSettings.loadTrainingPrograms();

    } catch (error) {
        console.error('❌ Error adding training program:', error);
        hrStaffSettings.showError('Failed to add training program');
    }
};

window.generateWorkforceReport = async () => {
    try {
        const workforceData = await hrStaffSettings.getWorkforceData();
        const reportData = {
            type: 'workforce_report',
            data: workforceData,
            generatedAt: new Date(),
            generatedBy: hrStaffSettings.currentUser.uid,
            factoryId: hrStaffSettings.currentFactory
        };

        // Save report to Firestore
        await collection(db, 'hr_reports', {
            ...reportData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Export as CSV
        const csvData = [
            ['Metric', 'Value'],
            ['Total Employees', workforceData.totalEmployees || 0],
            ['Full-time Employees', workforceData.fullTimeEmployees || 0],
            ['Part-time Employees', workforceData.partTimeEmployees || 0],
            ['Contract Employees', workforceData.contractEmployees || 0],
            ['Female Employees', workforceData.femaleEmployees || 0],
            ['Male Employees', workforceData.maleEmployees || 0]
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `workforce_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        hrStaffSettings.showSuccess('Workforce report generated and downloaded');

    } catch (error) {
        console.error('❌ Error generating workforce report:', error);
        hrStaffSettings.showError('Failed to generate workforce report');
    }
};

window.exportWorkforceData = async () => {
    try {
        const workforceData = await hrStaffSettings.getWorkforceData();
        const jsonData = JSON.stringify(workforceData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `workforce_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        hrStaffSettings.showSuccess('Workforce data exported successfully');

    } catch (error) {
        console.error('❌ Error exporting workforce data:', error);
        hrStaffSettings.showError('Failed to export workforce data');
    }
};

window.logout = () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('❌ Logout error:', error);
    });
};

// Start the initialization process
initializeHrstaffsettings();
