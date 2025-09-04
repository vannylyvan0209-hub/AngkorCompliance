// HR Staff Settings System
class HRStaffSettings {
    constructor() {
        this.currentUser = null;
        this.trainingPrograms = [];
        this.complianceRequirements = [];
        this.workerPolicies = [];
        this.systemSettings = {};
        
        this.init();
    }
    
    async init() {
        console.log('⚙️ Initializing HR Staff Settings...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize UI
        this.initializeUI();
        
        // Load initial data
        await this.loadInitialData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ HR Staff Settings initialized');
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
                            
                            // Allow HR staff and factory admins
                            if (userData.role === 'hr_staff' || userData.role === 'factory_admin') {
                                this.currentUser = { ...user, ...userData };
                                this.updateUserDisplay();
                                resolve();
                            } else {
                                console.log('❌ Access denied - insufficient permissions');
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
    
    updateUserDisplay() {
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (this.currentUser) {
            userName.textContent = this.currentUser.name || this.currentUser.displayName || 'HR Staff';
            
            // Set avatar initials
            const initials = (this.currentUser.name || 'HR').split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatar.innerHTML = `<span>${initials}</span>`;
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadTrainingPrograms(),
            this.loadComplianceRequirements(),
            this.loadWorkerPolicies(),
            this.loadSystemSettings()
        ]);
    }
    
    async loadTrainingPrograms() {
        try {
            const trainingRef = this.collection(this.db, 'training_programs');
            const q = this.query(
                trainingRef,
                this.where('factoryId', '==', this.currentUser.factoryId),
                this.orderBy('createdAt', 'desc')
            );
            
            const snapshot = await this.getDocs(q);
            this.trainingPrograms = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.updateTrainingDisplay();
        } catch (error) {
            console.error('Error loading training programs:', error);
        }
    }
    
    async loadComplianceRequirements() {
        try {
            const complianceRef = this.collection(this.db, 'compliance_requirements');
            const q = this.query(
                complianceRef,
                this.where('factoryId', '==', this.currentUser.factoryId)
            );
            
            const snapshot = await this.getDocs(q);
            this.complianceRequirements = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.updateComplianceDisplay();
        } catch (error) {
            console.error('Error loading compliance requirements:', error);
        }
    }
    
    async loadWorkerPolicies() {
        try {
            const policiesRef = this.collection(this.db, 'worker_policies');
            const q = this.query(
                policiesRef,
                this.where('factoryId', '==', this.currentUser.factoryId)
            );
            
            const snapshot = await this.getDocs(q);
            this.workerPolicies = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.updatePoliciesDisplay();
        } catch (error) {
            console.error('Error loading worker policies:', error);
        }
    }
    
    async loadSystemSettings() {
        try {
            const settingsRef = this.doc(this.db, 'system_settings', this.currentUser.factoryId);
            const settingsDoc = await this.getDoc(settingsRef);
            
            if (settingsDoc.exists()) {
                this.systemSettings = settingsDoc.data();
                this.updateSystemSettingsDisplay();
            } else {
                // Load default settings
                this.systemSettings = this.getDefaultSystemSettings();
                this.updateSystemSettingsDisplay();
            }
        } catch (error) {
            console.error('Error loading system settings:', error);
        }
    }
    
    updateTrainingDisplay() {
        const trainingList = document.getElementById('trainingList');
        
        if (this.trainingPrograms.length === 0) {
            trainingList.innerHTML = `
                <div style="text-align: center; padding: var(--space-4); color: var(--neutral-500);">
                    <i data-lucide="book-open" style="width: 24px; height: 24px; margin-bottom: var(--space-2);"></i>
                    <p>No training programs found</p>
                </div>
            `;
        } else {
            trainingList.innerHTML = this.trainingPrograms.map(training => `
                <div class="training-item">
                    <div class="training-info">
                        <div class="training-title">${training.title}</div>
                        <div class="training-details">
                            ${training.type} • ${training.duration}h • Due: ${this.formatDate(training.dueDate)} • ${training.priority} priority
                        </div>
                    </div>
                    <div class="training-actions">
                        <button onclick="editTraining('${training.id}')" class="action-btn secondary">
                            <i data-lucide="edit"></i>
                            Edit
                        </button>
                        <button onclick="deleteTraining('${training.id}')" class="action-btn danger">
                            <i data-lucide="trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    updateComplianceDisplay() {
        const complianceGrid = document.getElementById('complianceGrid');
        
        if (this.complianceRequirements.length === 0) {
            // Load default compliance requirements
            this.complianceRequirements = this.getDefaultComplianceRequirements();
        }
        
        complianceGrid.innerHTML = this.complianceRequirements.map(requirement => `
            <div class="compliance-card">
                <div class="compliance-header">
                    <div class="compliance-title">${requirement.title}</div>
                    <div class="compliance-status status-${requirement.status}">
                        ${this.getStatusText(requirement.status)}
                    </div>
                </div>
                <div class="compliance-description">${requirement.description}</div>
            </div>
        `).join('');
    }
    
    updatePoliciesDisplay() {
        const policyList = document.getElementById('policyList');
        
        if (this.workerPolicies.length === 0) {
            // Load default policies
            this.workerPolicies = this.getDefaultWorkerPolicies();
        }
        
        policyList.innerHTML = this.workerPolicies.map(policy => `
            <div class="policy-item">
                <input type="checkbox" class="policy-checkbox" id="policy_${policy.id}" 
                       ${policy.enabled ? 'checked' : ''} onchange="togglePolicy('${policy.id}')">
                <div class="policy-info">
                    <div class="policy-title">${policy.title}</div>
                    <div class="policy-description">${policy.description}</div>
                </div>
            </div>
        `).join('');
    }
    
    updateSystemSettingsDisplay() {
        // Update form fields with current settings
        if (this.systemSettings.language) {
            document.getElementById('defaultLanguage').value = this.systemSettings.language;
        }
        if (this.systemSettings.dateFormat) {
            document.getElementById('dateFormat').value = this.systemSettings.dateFormat;
        }
        if (this.systemSettings.timezone) {
            document.getElementById('timezone').value = this.systemSettings.timezone;
        }
        if (this.systemSettings.backupFrequency) {
            document.getElementById('backupFrequency').value = this.systemSettings.backupFrequency;
        }
        if (this.systemSettings.dataRetention) {
            document.getElementById('dataRetention').value = this.systemSettings.dataRetention;
        }
        if (this.systemSettings.autoCleanup) {
            document.getElementById('autoCleanup').value = this.systemSettings.autoCleanup;
        }
        if (this.systemSettings.alertThreshold) {
            document.getElementById('alertThreshold').value = this.systemSettings.alertThreshold;
        }
        if (this.systemSettings.notificationFrequency) {
            document.getElementById('notificationFrequency').value = this.systemSettings.notificationFrequency;
        }
        if (this.systemSettings.autoReminder) {
            document.getElementById('autoReminder').value = this.systemSettings.autoReminder;
        }
        if (this.systemSettings.standardHours) {
            document.getElementById('standardHours').value = this.systemSettings.standardHours;
        }
        if (this.systemSettings.overtimeThreshold) {
            document.getElementById('overtimeThreshold').value = this.systemSettings.overtimeThreshold;
        }
        if (this.systemSettings.breakDuration) {
            document.getElementById('breakDuration').value = this.systemSettings.breakDuration;
        }
    }
    
    initializeUI() {
        // Set default date for training due date
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        document.getElementById('trainingDueDate').value = nextMonth.toISOString().split('T')[0];
        
        console.log('UI initialized');
    }
    
    setupEventListeners() {
        // Training form submission
        const trainingForm = document.getElementById('trainingForm');
        if (trainingForm) {
            trainingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTrainingProgram();
            });
        }
        
        console.log('Event listeners setup');
    }
    
    async addTrainingProgram() {
        try {
            const formData = {
                title: document.getElementById('trainingTitle').value,
                type: document.getElementById('trainingType').value,
                duration: parseFloat(document.getElementById('trainingDuration').value),
                dueDate: new Date(document.getElementById('trainingDueDate').value),
                targetDepartment: document.getElementById('targetDepartment').value,
                priority: document.getElementById('trainingPriority').value,
                description: document.getElementById('trainingDescription').value,
                mandatory: document.getElementById('mandatoryTraining').checked,
                factoryId: this.currentUser.factoryId,
                createdBy: this.currentUser.uid,
                status: 'active',
                createdAt: this.serverTimestamp(),
                updatedAt: this.serverTimestamp()
            };
            
            // Add to Firestore
            const trainingRef = this.collection(this.db, 'training_programs');
            await this.addDoc(trainingRef, formData);
            
            // Show success message
            this.showNotification('success', 'Training program added successfully');
            
            // Reset form
            document.getElementById('trainingForm').reset();
            
            // Reload training programs
            await this.loadTrainingPrograms();
            
        } catch (error) {
            console.error('Error adding training program:', error);
            this.showNotification('error', 'Error adding training program');
        }
    }
    
    async saveComplianceSettings() {
        try {
            const settings = {
                alertThreshold: parseInt(document.getElementById('alertThreshold').value) || 30,
                notificationFrequency: document.getElementById('notificationFrequency').value,
                autoReminder: document.getElementById('autoReminder').value,
                factoryId: this.currentUser.factoryId,
                updatedBy: this.currentUser.uid,
                updatedAt: this.serverTimestamp()
            };
            
            // Update in Firestore
            const settingsRef = this.doc(this.db, 'system_settings', this.currentUser.factoryId);
            await this.updateDoc(settingsRef, {
                complianceSettings: settings
            }, { merge: true });
            
            this.showNotification('success', 'Compliance settings saved successfully');
            
        } catch (error) {
            console.error('Error saving compliance settings:', error);
            this.showNotification('error', 'Error saving compliance settings');
        }
    }
    
    async savePolicies() {
        try {
            const enabledPolicies = this.workerPolicies
                .filter(policy => document.getElementById(`policy_${policy.id}`).checked)
                .map(policy => policy.id);
            
            const settings = {
                enabledPolicies: enabledPolicies,
                factoryId: this.currentUser.factoryId,
                updatedBy: this.currentUser.uid,
                updatedAt: this.serverTimestamp()
            };
            
            // Update in Firestore
            const settingsRef = this.doc(this.db, 'system_settings', this.currentUser.factoryId);
            await this.updateDoc(settingsRef, {
                policySettings: settings
            }, { merge: true });
            
            this.showNotification('success', 'Policies saved successfully');
            
        } catch (error) {
            console.error('Error saving policies:', error);
            this.showNotification('error', 'Error saving policies');
        }
    }
    
    async saveWorkingHours() {
        try {
            const settings = {
                standardHours: document.getElementById('standardHours').value,
                overtimeThreshold: parseInt(document.getElementById('overtimeThreshold').value) || 8,
                breakDuration: parseInt(document.getElementById('breakDuration').value) || 60,
                factoryId: this.currentUser.factoryId,
                updatedBy: this.currentUser.uid,
                updatedAt: this.serverTimestamp()
            };
            
            // Update in Firestore
            const settingsRef = this.doc(this.db, 'system_settings', this.currentUser.factoryId);
            await this.updateDoc(settingsRef, {
                workingHoursSettings: settings
            }, { merge: true });
            
            this.showNotification('success', 'Working hours saved successfully');
            
        } catch (error) {
            console.error('Error saving working hours:', error);
            this.showNotification('error', 'Error saving working hours');
        }
    }
    
    async saveSystemSettings() {
        try {
            const settings = {
                language: document.getElementById('defaultLanguage').value,
                dateFormat: document.getElementById('dateFormat').value,
                timezone: document.getElementById('timezone').value,
                factoryId: this.currentUser.factoryId,
                updatedBy: this.currentUser.uid,
                updatedAt: this.serverTimestamp()
            };
            
            // Update in Firestore
            const settingsRef = this.doc(this.db, 'system_settings', this.currentUser.factoryId);
            await this.updateDoc(settingsRef, {
                localizationSettings: settings
            }, { merge: true });
            
            this.showNotification('success', 'System settings saved successfully');
            
        } catch (error) {
            console.error('Error saving system settings:', error);
            this.showNotification('error', 'Error saving system settings');
        }
    }
    
    async saveDataSettings() {
        try {
            const settings = {
                backupFrequency: document.getElementById('backupFrequency').value,
                dataRetention: parseInt(document.getElementById('dataRetention').value) || 24,
                autoCleanup: document.getElementById('autoCleanup').value,
                factoryId: this.currentUser.factoryId,
                updatedBy: this.currentUser.uid,
                updatedAt: this.serverTimestamp()
            };
            
            // Update in Firestore
            const settingsRef = this.doc(this.db, 'system_settings', this.currentUser.factoryId);
            await this.updateDoc(settingsRef, {
                dataSettings: settings
            }, { merge: true });
            
            this.showNotification('success', 'Data settings saved successfully');
            
        } catch (error) {
            console.error('Error saving data settings:', error);
            this.showNotification('error', 'Error saving data settings');
        }
    }
    
    showNotification(type, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-500)' : 'var(--error-500)'};
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
    
    // Utility functions
    getDefaultSystemSettings() {
        return {
            language: 'en',
            dateFormat: 'MM/DD/YYYY',
            timezone: 'Asia/Phnom_Penh',
            backupFrequency: 'weekly',
            dataRetention: 24,
            autoCleanup: 'enabled',
            alertThreshold: 30,
            notificationFrequency: 'weekly',
            autoReminder: 'enabled',
            standardHours: '8:00 AM - 5:00 PM',
            overtimeThreshold: 8,
            breakDuration: 60
        };
    }
    
    getDefaultComplianceRequirements() {
        return [
            {
                id: 'safety_training',
                title: 'Safety Training',
                description: 'Annual safety training for all workers',
                status: 'active',
                frequency: 'annual'
            },
            {
                id: 'compliance_training',
                title: 'Compliance Training',
                description: 'Regular compliance and policy training',
                status: 'active',
                frequency: 'quarterly'
            },
            {
                id: 'health_check',
                title: 'Health Check',
                description: 'Regular health checkups for workers',
                status: 'pending',
                frequency: 'annual'
            },
            {
                id: 'equipment_training',
                title: 'Equipment Training',
                description: 'Training for new equipment and machinery',
                status: 'active',
                frequency: 'as_needed'
            }
        ];
    }
    
    getDefaultWorkerPolicies() {
        return [
            {
                id: 'safety_first',
                title: 'Safety First Policy',
                description: 'All workers must prioritize safety in their work',
                enabled: true
            },
            {
                id: 'no_discrimination',
                title: 'No Discrimination Policy',
                description: 'Zero tolerance for discrimination based on any factor',
                enabled: true
            },
            {
                id: 'harassment_free',
                title: 'Harassment-Free Workplace',
                description: 'Maintain a harassment-free work environment',
                enabled: true
            },
            {
                id: 'confidentiality',
                title: 'Confidentiality Policy',
                description: 'Maintain confidentiality of company and worker information',
                enabled: true
            },
            {
                id: 'attendance',
                title: 'Attendance Policy',
                description: 'Regular attendance and punctuality requirements',
                enabled: true
            },
            {
                id: 'overtime',
                title: 'Overtime Policy',
                description: 'Guidelines for overtime work and compensation',
                enabled: true
            }
        ];
    }
    
    getStatusText(status) {
        const statusMap = {
            'active': 'Active',
            'pending': 'Pending',
            'inactive': 'Inactive',
            'overdue': 'Overdue'
        };
        return statusMap[status] || 'Active';
    }
    
    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }
}

// Global functions for HTML onclick handlers
function editTraining(trainingId) {
    // Navigate to edit training page
    window.location.href = `hr-staff-settings.html?tab=training&edit=${trainingId}`;
}

function deleteTraining(trainingId) {
    if (confirm('Are you sure you want to delete this training program?')) {
        // Delete training program
        if (window.hrSettings) {
            window.hrSettings.deleteTrainingProgram(trainingId);
        }
    }
}

function togglePolicy(policyId) {
    // Policy toggle is handled in the updatePoliciesDisplay method
    console.log('Policy toggled:', policyId);
}

function saveComplianceSettings() {
    if (window.hrSettings) {
        window.hrSettings.saveComplianceSettings();
    }
}

function savePolicies() {
    if (window.hrSettings) {
        window.hrSettings.savePolicies();
    }
}

function saveWorkingHours() {
    if (window.hrSettings) {
        window.hrSettings.saveWorkingHours();
    }
}

function saveSystemSettings() {
    if (window.hrSettings) {
        window.hrSettings.saveSystemSettings();
    }
}

function saveDataSettings() {
    if (window.hrSettings) {
        window.hrSettings.saveDataSettings();
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('🚪 Logging out...');
        
        // Sign out from Firebase
        window.hrSettings.auth.signOut().then(() => {
            localStorage.clear();
            sessionStorage.clear();
            console.log('✅ Logout successful');
            window.location.href = '../../login.html';
        }).catch((error) => {
            console.error('❌ Logout error:', error);
            window.location.href = '../../login.html';
        });
    }
}

// Initialize the settings when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the HR settings
    window.hrSettings = new HRStaffSettings();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HRStaffSettings;
}
