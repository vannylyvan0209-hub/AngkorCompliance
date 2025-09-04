// Factory Admin Settings JavaScript
class FactoryAdminSettings {
    constructor() {
        this.currentUser = null;
        this.factoryData = null;
        this.users = [];
        this.auditLog = [];
        
        this.init();
    }
    
    async init() {
        console.log('🏭 Initializing Factory Admin Settings...');
        
        // Check authentication and role
        await this.checkAuth();
        
        // Load factory data
        await this.loadFactoryData();
        
        // Initialize UI
        this.initializeUI();
        
        // Load initial data
        await this.loadInitialData();
        
        console.log('✅ Factory Admin Settings initialized');
    }
    
    async checkAuth() {
        return new Promise((resolve) => {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    const userDoc = await collection(db, 'users', user.uid);
                    if (userDoc.exists()()) {
                        const userData = userDoc.data();
                        if (userData.role === 'factory_admin') {
                            this.currentUser = { ...user, ...userData };
                            document.getElementById('userName').textContent = userData.name;
                            resolve();
                        } else {
                            alert('Access denied. Only Factory Admins can access this page.');
                            window.location.href = 'index.html';
                        }
                    } else {
                        alert('User data not found.');
                        window.location.href = 'index.html';
                    }
                } else {
                    window.location.href = 'login.html';
                }
            });
        });
    }
    
    async loadFactoryData() {
        try {
            const factoryDoc = await collection(db, 'factories', this.currentUser.factoryId);
            if (factoryDoc.exists()) {
                this.factoryData = { id: factoryDoc.id, ...factoryDoc.data() };
                this.populateFactoryForms();
            }
        } catch (error) {
            console.error('Error loading factory data:', error);
        }
    }
    
    populateFactoryForms() {
        // Populate factory information form
        if (this.factoryData) {
            document.getElementById('factoryName').value = this.factoryData.name || '';
            document.getElementById('factoryAddress').value = this.factoryData.address || '';
            document.getElementById('factoryPhone').value = this.factoryData.phone || '';
            document.getElementById('factoryEmail').value = this.factoryData.email || '';
            document.getElementById('factoryIndustry').value = this.factoryData.industry || '';
            
            // Populate workforce form
            document.getElementById('totalWorkers').value = this.factoryData.totalWorkers || 0;
            document.getElementById('femaleWorkers').value = this.factoryData.femaleWorkers || 0;
            document.getElementById('maleWorkers').value = this.factoryData.maleWorkers || 0;
            document.getElementById('underageWorkers').value = this.factoryData.underageWorkers || 0;
            document.getElementById('workingHours').value = this.factoryData.workingHours || 8;
            
            // Populate production form
            document.getElementById('productionCapacity').value = this.factoryData.productionCapacity || '';
            document.getElementById('mainProducts').value = this.factoryData.mainProducts || '';
            document.getElementById('certifications').value = this.factoryData.certifications || '';
        }
    }
    
    initializeUI() {
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Setup form event listeners
        this.setupFormListeners();
        
        // Setup tab navigation
        this.setupTabNavigation();
    }
    
    setupFormListeners() {
        // Factory information form
        document.getElementById('factoryInfoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveFactoryInfo();
        });
        
        // Regional settings form
        document.getElementById('regionalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRegionalSettings();
        });
        
        // Workforce form
        document.getElementById('workforceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveWorkforceInfo();
        });
        
        // Production form
        document.getElementById('productionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProductionInfo();
        });
        
        // Email notifications form
        document.getElementById('emailNotificationsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEmailNotifications();
        });
        
        // System notifications form
        document.getElementById('systemNotificationsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSystemNotifications();
        });
        
        // Compliance form
        document.getElementById('complianceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveComplianceSettings();
        });
    }
    
    setupTabNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const tabContents = document.querySelectorAll('.tab-content');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetTab = item.getAttribute('onclick').match(/showTab\('(.+)'\)/)[1];
                this.showTab(targetTab);
            });
        });
    }
    
    showTab(tabId) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Show target tab
        document.getElementById(tabId).classList.add('active');
        
        // Add active class to clicked nav item
        event.target.classList.add('active');
        
        // Load tab-specific data
        this.loadTabData(tabId);
    }
    
    async loadTabData(tabId) {
        switch (tabId) {
            case 'users':
                await this.loadFactoryUsers();
                break;
            case 'compliance':
                await this.loadComplianceSettings();
                break;
            case 'reports':
                await this.loadReportsData();
                break;
            case 'audit':
                await this.loadAuditLog();
                break;
        }
    }
    
    async loadInitialData() {
        // Load user statistics
        await this.loadUserStatistics();
        
        // Load compliance metrics
        await this.loadComplianceMetrics();
    }
    
    // Form Save Methods
    async saveFactoryInfo() {
        try {
            const formData = new FormData(document.getElementById('factoryInfoForm'));
            const data = Object.fromEntries(formData.entries());
            
            await collection(db, 'factories', this.currentUser.factoryId, {
                name: data.factoryName,
                address: data.factoryAddress,
                phone: data.factoryPhone,
                email: data.factoryEmail,
                industry: data.factoryIndustry,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            });
            
            this.logAuditEvent('factory_info_updated', 'Updated factory information');
            this.showSuccess('Factory information saved successfully');
            
        } catch (error) {
            console.error('Error saving factory info:', error);
            this.showError('Failed to save factory information');
        }
    }
    
    async saveRegionalSettings() {
        try {
            const formData = new FormData(document.getElementById('regionalForm'));
            const data = Object.fromEntries(formData.entries());
            
            await collection(db, 'factories', this.currentUser.factoryId, {
                timezone: data.timezone,
                language: data.language,
                currency: data.currency,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            });
            
            this.logAuditEvent('regional_settings_updated', 'Updated regional settings');
            this.showSuccess('Regional settings saved successfully');
            
        } catch (error) {
            console.error('Error saving regional settings:', error);
            this.showError('Failed to save regional settings');
        }
    }
    
    async saveWorkforceInfo() {
        try {
            const formData = new FormData(document.getElementById('workforceForm'));
            const data = Object.fromEntries(formData.entries());
            
            await collection(db, 'factories', this.currentUser.factoryId, {
                totalWorkers: parseInt(data.totalWorkers) || 0,
                femaleWorkers: parseInt(data.femaleWorkers) || 0,
                maleWorkers: parseInt(data.maleWorkers) || 0,
                underageWorkers: parseInt(data.underageWorkers) || 0,
                workingHours: parseInt(data.workingHours) || 8,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            });
            
            this.logAuditEvent('workforce_info_updated', 'Updated workforce information');
            this.showSuccess('Workforce information saved successfully');
            
        } catch (error) {
            console.error('Error saving workforce info:', error);
            this.showError('Failed to save workforce information');
        }
    }
    
    async saveProductionInfo() {
        try {
            const formData = new FormData(document.getElementById('productionForm'));
            const data = Object.fromEntries(formData.entries());
            
            await collection(db, 'factories', this.currentUser.factoryId, {
                productionCapacity: data.productionCapacity,
                mainProducts: data.mainProducts,
                certifications: data.certifications,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            });
            
            this.logAuditEvent('production_info_updated', 'Updated production information');
            this.showSuccess('Production information saved successfully');
            
        } catch (error) {
            console.error('Error saving production info:', error);
            this.showError('Failed to save production information');
        }
    }
    
    // User Management Methods
    async loadFactoryUsers() {
        try {
            const snapshot = await collection(db, 'users')
                .where('factoryId', '==', this.currentUser.factoryId)
                .get();
            
            this.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateUsersTable();
            
        } catch (error) {
            console.error('Error loading factory users:', error);
        }
    }
    
    updateUsersTable() {
        const tbody = document.getElementById('factoryUsersTable');
        
        if (this.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge badge-${this.getRoleBadgeClass(user.role)}">${this.formatRole(user.role)}</span></td>
                <td><span class="badge badge-${user.status === 'active' ? 'success' : 'danger'}">${user.status}</span></td>
                <td>
                    <button onclick="factoryAdminSettings.editUser('${user.id}')" class="btn btn-small btn-outline">Edit</button>
                    <button onclick="factoryAdminSettings.deleteUser('${user.id}')" class="btn btn-small btn-danger">Delete</button>
                </td>
            </tr>
        `).join('');
    }
    
    async loadUserStatistics() {
        try {
            const snapshot = await collection(db, 'users')
                .where('factoryId', '==', this.currentUser.factoryId)
                .get();
            
            const users = snapshot.docs.map(doc => doc.data());
            
            document.getElementById('totalUsers').textContent = users.length;
            document.getElementById('activeUsers').textContent = users.filter(u => u.status === 'active').length;
            document.getElementById('hrUsers').textContent = users.filter(u => u.role === 'hr_staff').length;
            document.getElementById('auditorUsers').textContent = users.filter(u => u.role === 'auditor').length;
            
        } catch (error) {
            console.error('Error loading user statistics:', error);
        }
    }
    
    // Compliance Methods
    async loadComplianceSettings() {
        try {
            const doc = await collection(db, 'factories', this.currentUser.factoryId);
            if (doc.exists()) {
                const data = doc.data();
                
                // Set checkbox values
                document.querySelector('input[name="laborStandards"]').checked = data.laborStandards || false;
                document.querySelector('input[name="safetyStandards"]').checked = data.safetyStandards || false;
                document.querySelector('input[name="environmentalStandards"]').checked = data.environmentalStandards || false;
                document.querySelector('input[name="qualityStandards"]').checked = data.qualityStandards || false;
            }
        } catch (error) {
            console.error('Error loading compliance settings:', error);
        }
    }
    
    async saveComplianceSettings() {
        try {
            const formData = new FormData(document.getElementById('complianceForm'));
            const data = Object.fromEntries(formData.entries());
            
            await collection(db, 'factories', this.currentUser.factoryId, {
                laborStandards: data.laborStandards === 'true',
                safetyStandards: data.safetyStandards === 'true',
                environmentalStandards: data.environmentalStandards === 'true',
                qualityStandards: data.qualityStandards === 'true',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            });
            
            this.logAuditEvent('compliance_settings_updated', 'Updated compliance settings');
            this.showSuccess('Compliance settings saved successfully');
            
        } catch (error) {
            console.error('Error saving compliance settings:', error);
            this.showError('Failed to save compliance settings');
        }
    }
    
    // Notification Methods
    async saveEmailNotifications() {
        try {
            const formData = new FormData(document.getElementById('emailNotificationsForm'));
            const data = Object.fromEntries(formData.entries());
            
            await collection(db, 'user_preferences', this.currentUser.uid, {
                notifications: {
                    email: {
                        documentExpiry: data.documentExpiry === 'true',
                        capDueDate: data.capDueDate === 'true',
                        newGrievances: data.newGrievances === 'true',
                        complianceBreaches: data.complianceBreaches === 'true',
                        email: data.notificationEmail
                    }
                }
            }, { merge: true });
            
            this.logAuditEvent('email_notifications_updated', 'Updated email notification settings');
            this.showSuccess('Email notification settings saved successfully');
            
        } catch (error) {
            console.error('Error saving email notifications:', error);
            this.showError('Failed to save email notification settings');
        }
    }
    
    async saveSystemNotifications() {
        try {
            const formData = new FormData(document.getElementById('systemNotificationsForm'));
            const data = Object.fromEntries(formData.entries());
            
            await collection(db, 'user_preferences', this.currentUser.uid, {
                notifications: {
                    system: {
                        soundEnabled: data.soundEnabled === 'true',
                        desktopNotifications: data.desktopNotifications === 'true',
                        autoDismiss: data.autoDismiss === 'true',
                        dismissDelay: parseInt(data.dismissDelay) || 5
                    }
                }
            }, { merge: true });
            
            this.logAuditEvent('system_notifications_updated', 'Updated system notification settings');
            this.showSuccess('System notification settings saved successfully');
            
        } catch (error) {
            console.error('Error saving system notifications:', error);
            this.showError('Failed to save system notification settings');
        }
    }
    
    // Reports & Analytics Methods
    async loadReportsData() {
        try {
            // Load compliance metrics
            await this.loadComplianceMetrics();
            
            // Create performance chart
            this.createPerformanceChart();
            
        } catch (error) {
            console.error('Error loading reports data:', error);
        }
    }
    
    async loadComplianceMetrics() {
        try {
            const [documents, caps, grievances] = await Promise.all([
                this.getFactoryDocuments(),
                this.getFactoryCAPs(),
                this.getFactoryGrievances()
            ]);
            
            const complianceScore = this.calculateComplianceScore(documents, caps, grievances);
            const documentHealth = this.calculateDocumentHealth(documents);
            const capCompletion = this.calculateCAPCompletion(caps);
            const grievanceResolution = this.calculateGrievanceResolution(grievances);
            
            document.getElementById('complianceScore').textContent = `${complianceScore}%`;
            document.getElementById('documentHealth').textContent = `${documentHealth}%`;
            document.getElementById('capCompletion').textContent = `${capCompletion}%`;
            document.getElementById('grievanceResolution').textContent = `${grievanceResolution}%`;
            
        } catch (error) {
            console.error('Error loading compliance metrics:', error);
        }
    }
    
    createPerformanceChart() {
        const ctx = document.getElementById('factoryPerformanceChart');
        if (!ctx) return;
        
        if (advancedAnalytics) {
            advancedAnalytics.createChart('factoryPerformanceChart', {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Compliance Score',
                        data: [85, 87, 89, 88, 90, 92],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Factory Performance Trend'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }
    
    // Audit Log Methods
    async loadAuditLog() {
        try {
            const snapshot = await collection(db, 'audit_log')
                .where('factoryId', '==', this.currentUser.factoryId)
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();
            
            this.auditLog = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateAuditLogTable();
            
        } catch (error) {
            console.error('Error loading audit log:', error);
        }
    }
    
    updateAuditLogTable() {
        const tbody = document.getElementById('auditLogTable');
        
        if (this.auditLog.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No audit log entries found</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.auditLog.map(entry => `
            <tr>
                <td>${this.formatTimestamp(entry.timestamp)}</td>
                <td>${entry.userName || 'System'}</td>
                <td><span class="badge badge-${this.getActionBadgeClass(entry.action)}">${this.formatAction(entry.action)}</span></td>
                <td>${entry.details}</td>
                <td>${entry.ipAddress || 'N/A'}</td>
            </tr>
        `).join('');
    }
    
    // Utility Methods
    async getFactoryDocuments() {
        const snapshot = await collection(db, 'documents')
            .where('factoryId', '==', this.currentUser.factoryId)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    async getFactoryCAPs() {
        const snapshot = await collection(db, 'caps')
            .where('factoryId', '==', this.currentUser.factoryId)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    async getFactoryGrievances() {
        const snapshot = await collection(db, 'grievances')
            .where('factoryId', '==', this.currentUser.factoryId)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    calculateComplianceScore(documents, caps, grievances) {
        const docScore = this.calculateDocumentHealth(documents);
        const capScore = this.calculateCAPCompletion(caps);
        const grievanceScore = this.calculateGrievanceResolution(grievances);
        
        return Math.round((docScore + capScore + grievanceScore) / 3);
    }
    
    calculateDocumentHealth(documents) {
        if (documents.length === 0) return 100;
        
        const now = new Date();
        let validDocs = 0;
        
        documents.forEach(doc => {
            if (!doc.expirationDate) {
                validDocs++;
            } else {
                const daysUntilExpiration = Math.ceil((doc.expirationDate.toDate() - now) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiration > 0) {
                    validDocs++;
                }
            }
        });
        
        return Math.round((validDocs / documents.length) * 100);
    }
    
    calculateCAPCompletion(caps) {
        if (caps.length === 0) return 100;
        
        const completedCAPs = caps.filter(cap => cap.status === 'completed').length;
        return Math.round((completedCAPs / caps.length) * 100);
    }
    
    calculateGrievanceResolution(grievances) {
        if (grievances.length === 0) return 100;
        
        const resolvedGrievances = grievances.filter(g => g.status === 'resolved').length;
        return Math.round((resolvedGrievances / grievances.length) * 100);
    }
    
    async logAuditEvent(action, details) {
        try {
            await collection(db, 'audit_log', {
                userId: this.currentUser.uid,
                userName: this.currentUser.name,
                factoryId: this.currentUser.factoryId,
                action: action,
                details: details,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ipAddress: await this.getClientIP()
            });
        } catch (error) {
            console.error('Error logging audit event:', error);
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
    
    // UI Helper Methods
    getRoleBadgeClass(role) {
        switch (role) {
            case 'factory_admin': return 'primary';
            case 'hr_staff': return 'info';
            case 'auditor': return 'warning';
            case 'viewer': return 'secondary';
            default: return 'secondary';
        }
    }
    
    formatRole(role) {
        return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    getActionBadgeClass(action) {
        if (action.includes('create')) return 'success';
        if (action.includes('update')) return 'info';
        if (action.includes('delete')) return 'danger';
        return 'secondary';
    }
    
    formatAction(action) {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    formatTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleString();
    }
    
    showSuccess(message) {
        // Show success notification
        if (notificationSystem) {
            notificationSystem.createNotification('success', 'Success', message);
        } else {
            alert(message);
        }
    }
    
    showError(message) {
        // Show error notification
        if (notificationSystem) {
            notificationSystem.createNotification('error', 'Error', message);
        } else {
            alert(message);
        }
    }
}

// Initialize factory admin settings
let factoryAdminSettings;

// Wait for Firebase to be available before initializing
function initializeFactoryAdminSettings() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeFactoryadminsettings, 100);
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
    factoryAdminSettings = new FactoryAdminSettings();
});

// Global functions for HTML onclick handlers
window.factoryAdminSettings = factoryAdminSettings;

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function openAddUserModal() {
    openModal('addUserModal');
}

function openAddCategoryModal() {
    openModal('addCategoryModal');
}

// Report functions
function generateFactoryReport() {
    if (advancedAnalytics) {
        advancedAnalytics.generateReport('factory_performance', {
            factory: factoryAdminSettings.currentUser.factoryId
        }).then(reportData => {
            advancedAnalytics.exportReport(reportData, 'csv');
        });
    }
}

function exportFactoryData() {
    // Export factory data to CSV
    const data = factoryAdminSettings.factoryData;
    const csv = `Factory Name,${data.name}\nAddress,${data.address}\nPhone,${data.phone}\nEmail,${data.email}\nIndustry,${data.industry}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `factory_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

function exportAuditLog() {
    if (factoryAdminSettings.auditLog.length === 0) {
        alert('No audit log data to export');
        return;
    }
    
    const csv = ['Timestamp,User,Action,Details,IP Address'];
    factoryAdminSettings.auditLog.forEach(entry => {
        csv.push(`${factoryAdminSettings.formatTimestamp(entry.timestamp)},${entry.userName},${entry.action},${entry.details},${entry.ipAddress}`);
    });
    
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

function clearAuditLog() {
    if (confirm('Are you sure you want to clear the audit log? This action cannot be undone.')) {
        // Clear audit log entries older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        collection(db, 'audit_log')
            .where('factoryId', '==', factoryAdminSettings.currentUser.factoryId)
            .where('timestamp', '<', thirtyDaysAgo)
            .get()
            .then(snapshot => {
                const batch = db.batch();
                snapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
                return batch.commit();
            })
            .then(() => {
                factoryAdminSettings.showSuccess('Audit log cleared successfully');
                factoryAdminSettings.loadAuditLog();
            })
            .catch(error => {
                console.error('Error clearing audit log:', error);
                factoryAdminSettings.showError('Failed to clear audit log');
            });
    }
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch(error => {
        console.error('Error signing out:', error);
    });
}

// Start the initialization process
initializeFactoryAdminSettings();
