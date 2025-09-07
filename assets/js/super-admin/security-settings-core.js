// Security Settings Core System for Super Admin
class SecuritySettingsCore {
    constructor() {
        this.currentUser = null;
        this.securityConfig = {};
        this.accessPolicies = [];
        this.securityMetrics = {};
        this.charts = {};
        this.init();
    }
    
    async init() {
        console.log('🛡️ Initializing Security Settings Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.initializeCharts();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ Security Settings Core initialized');
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
            window.superAdminNavigation.updateCurrentPage('Security Settings');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadSecurityConfig(),
            this.loadAccessPolicies(),
            this.loadSecurityMetrics()
        ]);
        this.updateSecurityOverview();
        this.renderAccessPolicies();
        this.updateSecurityMetrics();
    }
    
    async loadSecurityConfig() {
        try {
            const configRef = this.collection(this.db, 'security_config');
            const snapshot = await this.getDocs(configRef);
            this.securityConfig = {};
            snapshot.docs.forEach(doc => {
                this.securityConfig[doc.id] = doc.data();
            });
            
            if (Object.keys(this.securityConfig).length === 0) {
                this.securityConfig = this.getDefaultSecurityConfig();
            }
            console.log('✓ Loaded security configuration');
        } catch (error) {
            console.error('Error loading security config:', error);
            this.securityConfig = this.getDefaultSecurityConfig();
        }
    }
    
    async loadAccessPolicies() {
        try {
            const policiesRef = this.collection(this.db, 'access_policies');
            const snapshot = await this.getDocs(policiesRef);
            this.accessPolicies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (this.accessPolicies.length === 0) {
                this.accessPolicies = this.getMockAccessPolicies();
            }
            console.log(`✓ Loaded ${this.accessPolicies.length} access policies`);
        } catch (error) {
            console.error('Error loading access policies:', error);
            this.accessPolicies = this.getMockAccessPolicies();
        }
    }
    
    async loadSecurityMetrics() {
        try {
            const metricsRef = this.collection(this.db, 'security_metrics');
            const snapshot = await this.getDocs(metricsRef);
            this.securityMetrics = {};
            snapshot.docs.forEach(doc => {
                this.securityMetrics[doc.id] = doc.data();
            });
            console.log('✓ Loaded security metrics');
        } catch (error) {
            console.error('Error loading security metrics:', error);
            this.securityMetrics = this.getMockSecurityMetrics();
        }
    }
    
    getDefaultSecurityConfig() {
        return {
            mfaRequired: true,
            passwordComplexity: 'medium',
            sessionTimeout: 30,
            accountLockout: true,
            ipWhitelist: false,
            rateLimit: 1000,
            sslEnforcement: true,
            corsPolicy: 'moderate',
            dataEncryption: true,
            auditLogging: true,
            dataRetention: 365,
            privacyMode: true
        };
    }
    
    getMockAccessPolicies() {
        return [
            {
                id: 'policy_1',
                name: 'Super Admin Access',
                description: 'Full system access for super administrators',
                status: 'enabled',
                users: 5,
                permissions: ['read', 'write', 'delete', 'admin'],
                lastModified: new Date()
            },
            {
                id: 'policy_2',
                name: 'Factory Admin Access',
                description: 'Factory management access for factory administrators',
                status: 'enabled',
                users: 12,
                permissions: ['read', 'write'],
                lastModified: new Date()
            },
            {
                id: 'policy_3',
                name: 'HR Staff Access',
                description: 'Human resources management access',
                status: 'enabled',
                users: 8,
                permissions: ['read', 'write'],
                lastModified: new Date()
            },
            {
                id: 'policy_4',
                name: 'Auditor Access',
                description: 'Read-only access for compliance auditors',
                status: 'enabled',
                users: 15,
                permissions: ['read'],
                lastModified: new Date()
            },
            {
                id: 'policy_5',
                name: 'Worker Portal Access',
                description: 'Limited access for factory workers',
                status: 'enabled',
                users: 150,
                permissions: ['read'],
                lastModified: new Date()
            },
            {
                id: 'policy_6',
                name: 'API Access',
                description: 'Programmatic access for integrations',
                status: 'disabled',
                users: 3,
                permissions: ['read', 'write'],
                lastModified: new Date()
            }
        ];
    }
    
    getMockSecurityMetrics() {
        return {
            securityScore: 95,
            mfaEnabled: 98,
            activeThreats: 3,
            failedLogins: 12,
            blockedIPs: 3,
            securityAlerts: 1,
            complianceScore: 98
        };
    }
    
    updateSecurityOverview() {
        document.getElementById('securityScore').textContent = `${this.securityMetrics.securityScore || 95}%`;
        document.getElementById('mfaEnabled').textContent = `${this.securityMetrics.mfaEnabled || 98}%`;
        document.getElementById('activeThreats').textContent = this.securityMetrics.activeThreats || 3;
        document.getElementById('accessLogs').textContent = '24/7';
    }
    
    renderAccessPolicies() {
        const accessControlGrid = document.getElementById('accessControlGrid');
        if (!accessControlGrid) return;
        
        accessControlGrid.innerHTML = this.accessPolicies.map(policy => `
            <div class="access-item">
                <div class="access-item-header">
                    <div class="access-item-title">${policy.name}</div>
                    <div class="access-item-status ${policy.status}">${policy.status}</div>
                </div>
                <div class="access-item-description">${policy.description}</div>
                <div class="access-item-actions">
                    <button class="access-btn" onclick="editPolicy('${policy.id}')">
                        <i data-lucide="edit"></i>
                        Edit
                    </button>
                    <button class="access-btn" onclick="togglePolicy('${policy.id}')">
                        <i data-lucide="${policy.status === 'enabled' ? 'pause' : 'play'}"></i>
                        ${policy.status === 'enabled' ? 'Disable' : 'Enable'}
                    </button>
                    <button class="access-btn" onclick="viewPolicyDetails('${policy.id}')">
                        <i data-lucide="eye"></i>
                        View
                    </button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    updateSecurityMetrics() {
        document.getElementById('failedLogins').textContent = this.securityMetrics.failedLogins || 12;
        document.getElementById('blockedIPs').textContent = this.securityMetrics.blockedIPs || 3;
        document.getElementById('securityAlerts').textContent = this.securityMetrics.securityAlerts || 1;
        document.getElementById('complianceScore').textContent = `${this.securityMetrics.complianceScore || 98}%`;
    }
    
    initializeUI() {
        this.loadSecurityConfigToUI();
    }
    
    loadSecurityConfigToUI() {
        const config = this.securityConfig;
        
        this.setToggleState('mfaRequired', config.mfaRequired);
        this.setToggleState('accountLockout', config.accountLockout);
        this.setToggleState('ipWhitelist', config.ipWhitelist);
        this.setToggleState('sslEnforcement', config.sslEnforcement);
        this.setToggleState('dataEncryption', config.dataEncryption);
        this.setToggleState('auditLogging', config.auditLogging);
        this.setToggleState('privacyMode', config.privacyMode);
        
        document.getElementById('passwordComplexity').value = config.passwordComplexity || 'medium';
        document.getElementById('corsPolicy').value = config.corsPolicy || 'moderate';
        document.getElementById('sessionTimeout').value = config.sessionTimeout || 30;
        document.getElementById('rateLimit').value = config.rateLimit || 1000;
        document.getElementById('dataRetention').value = config.dataRetention || 365;
    }
    
    setToggleState(elementId, isActive) {
        const toggle = document.getElementById(elementId);
        if (toggle) {
            if (isActive) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
    }
    
    initializeCharts() {
        this.initializeSecurityChart();
    }
    
    initializeSecurityChart() {
        const ctx = document.getElementById('securityChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.getSecurityChartData();
        
        this.charts.security = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Security Events',
                        data: data.securityEvents,
                        borderColor: 'var(--danger-500)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Failed Logins',
                        data: data.failedLogins,
                        borderColor: 'var(--warning-500)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Blocked Attempts',
                        data: data.blockedAttempts,
                        borderColor: 'var(--success-500)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    getSecurityChartData() {
        const now = new Date();
        const labels = [];
        const securityEvents = [];
        const failedLogins = [];
        const blockedAttempts = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            securityEvents.push(Math.floor(Math.random() * 20) + 5);
            failedLogins.push(Math.floor(Math.random() * 15) + 2);
            blockedAttempts.push(Math.floor(Math.random() * 10) + 1);
        }
        
        return { labels, securityEvents, failedLogins, blockedAttempts };
    }
    
    setupEventListeners() {
        this.setupGlobalEventListeners();
        this.setupFormEventListeners();
    }
    
    setupGlobalEventListeners() {
        window.runSecurityScan = () => this.runSecurityScan();
        window.updateSecurityPolicies = () => this.updateSecurityPolicies();
        window.resetToDefaults = () => this.resetToDefaults();
        window.exportConfig = () => this.exportConfig();
        window.editPolicy = (policyId) => this.editPolicy(policyId);
        window.togglePolicy = (policyId) => this.togglePolicy(policyId);
        window.viewPolicyDetails = (policyId) => this.viewPolicyDetails(policyId);
        window.toggleSetting = (settingId) => this.toggleSetting(settingId);
    }
    
    setupFormEventListeners() {
        const inputs = document.querySelectorAll('.form-input, .form-select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.saveSecurityConfig();
            });
        });
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const configRef = this.collection(this.db, 'security_config');
        this.onSnapshot(configRef, (snapshot) => {
            this.securityConfig = {};
            snapshot.docs.forEach(doc => {
                this.securityConfig[doc.id] = doc.data();
            });
            this.loadSecurityConfigToUI();
        });
        
        const policiesRef = this.collection(this.db, 'access_policies');
        this.onSnapshot(policiesRef, (snapshot) => {
            this.accessPolicies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderAccessPolicies();
        });
        
        const metricsRef = this.collection(this.db, 'security_metrics');
        this.onSnapshot(metricsRef, (snapshot) => {
            this.securityMetrics = {};
            snapshot.docs.forEach(doc => {
                this.securityMetrics[doc.id] = doc.data();
            });
            this.updateSecurityOverview();
            this.updateSecurityMetrics();
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
    window.securitySettingsCore = new SecuritySettingsCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecuritySettingsCore;
}
