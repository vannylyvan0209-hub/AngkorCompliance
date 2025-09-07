// Multi-Factory Overview Core System for Super Admin
class MultiFactoryOverviewCore {
    constructor() {
        this.currentUser = null;
        this.factories = [];
        this.analytics = {};
        this.riskAssessment = [];
        this.complianceChart = null;
        
        this.init();
    }
    
    async init() {
        console.log('🏭 Initializing Multi-Factory Overview Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        this.initializeCharts();
        console.log('✅ Multi-Factory Overview Core initialized');
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
            window.superAdminNavigation.updateCurrentPage('Multi-Factory Overview');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadFactories(),
            this.loadAnalytics(),
            this.loadRiskAssessment()
        ]);
        
        this.updateEnterpriseOverview();
        this.renderFactories();
        this.renderRiskAssessment();
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
    
    async loadAnalytics() {
        try {
            const analyticsRef = this.collection(this.db, 'enterprise_analytics');
            const snapshot = await this.getDocs(analyticsRef);
            this.analytics = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.analytics.length === 0) {
                this.analytics = this.getMockAnalytics();
            }
            console.log(`✓ Loaded analytics data`);
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.analytics = this.getMockAnalytics();
        }
    }
    
    async loadRiskAssessment() {
        try {
            const riskRef = this.collection(this.db, 'risk_assessments');
            const snapshot = await this.getDocs(riskRef);
            this.riskAssessment = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.riskAssessment.length === 0) {
                this.riskAssessment = this.getMockRiskAssessment();
            }
            console.log(`✓ Loaded ${this.riskAssessment.length} risk assessments`);
        } catch (error) {
            console.error('Error loading risk assessment:', error);
            this.riskAssessment = this.getMockRiskAssessment();
        }
    }
    
    getMockFactories() {
        return [
            {
                id: 'factory_1',
                name: 'Angkor Textile Manufacturing',
                location: 'Phnom Penh, Cambodia',
                status: 'compliant',
                complianceScore: 95,
                employees: 450,
                lastAudit: new Date('2024-01-15'),
                nextAudit: new Date('2024-04-15'),
                standards: ['ISO 9001:2015', 'ISO 14001:2015'],
                riskLevel: 'low'
            },
            {
                id: 'factory_2',
                name: 'Siem Reap Garment Factory',
                location: 'Siem Reap, Cambodia',
                status: 'compliant',
                complianceScore: 88,
                employees: 320,
                lastAudit: new Date('2024-01-20'),
                nextAudit: new Date('2024-04-20'),
                standards: ['ISO 9001:2015', 'ISO 45001:2018'],
                riskLevel: 'low'
            },
            {
                id: 'factory_3',
                name: 'Battambang Electronics',
                location: 'Battambang, Cambodia',
                status: 'pending',
                complianceScore: 72,
                employees: 180,
                lastAudit: new Date('2023-12-10'),
                nextAudit: new Date('2024-03-10'),
                standards: ['ISO 9001:2015', 'ISO 27001:2013'],
                riskLevel: 'medium'
            },
            {
                id: 'factory_4',
                name: 'Kampong Cham Food Processing',
                location: 'Kampong Cham, Cambodia',
                status: 'compliant',
                complianceScore: 92,
                employees: 280,
                lastAudit: new Date('2024-01-25'),
                nextAudit: new Date('2024-04-25'),
                standards: ['ISO 9001:2015', 'ISO 22000:2018'],
                riskLevel: 'low'
            },
            {
                id: 'factory_5',
                name: 'Preah Sihanouk Port Services',
                location: 'Preah Sihanouk, Cambodia',
                status: 'compliant',
                complianceScore: 85,
                employees: 150,
                lastAudit: new Date('2024-01-30'),
                nextAudit: new Date('2024-04-30'),
                standards: ['ISO 9001:2015', 'ISO 14001:2015'],
                riskLevel: 'low'
            },
            {
                id: 'factory_6',
                name: 'Kandal Construction Materials',
                location: 'Kandal, Cambodia',
                status: 'pending',
                complianceScore: 68,
                employees: 95,
                lastAudit: new Date('2023-11-15'),
                nextAudit: new Date('2024-02-15'),
                standards: ['ISO 9001:2015', 'ISO 45001:2018'],
                riskLevel: 'medium'
            },
            {
                id: 'factory_7',
                name: 'Takeo Agricultural Processing',
                location: 'Takeo, Cambodia',
                status: 'compliant',
                complianceScore: 90,
                employees: 220,
                lastAudit: new Date('2024-02-05'),
                nextAudit: new Date('2024-05-05'),
                standards: ['ISO 9001:2015', 'ISO 14001:2015'],
                riskLevel: 'low'
            },
            {
                id: 'factory_8',
                name: 'Kampot Salt Production',
                location: 'Kampot, Cambodia',
                status: 'compliant',
                complianceScore: 87,
                employees: 120,
                lastAudit: new Date('2024-02-10'),
                nextAudit: new Date('2024-05-10'),
                standards: ['ISO 9001:2015', 'ISO 22000:2018'],
                riskLevel: 'low'
            },
            {
                id: 'factory_9',
                name: 'Koh Kong Rubber Processing',
                location: 'Koh Kong, Cambodia',
                status: 'pending',
                complianceScore: 75,
                employees: 160,
                lastAudit: new Date('2023-12-20'),
                nextAudit: new Date('2024-03-20'),
                standards: ['ISO 9001:2015', 'ISO 14001:2015'],
                riskLevel: 'medium'
            },
            {
                id: 'factory_10',
                name: 'Mondulkiri Mining Operations',
                location: 'Mondulkiri, Cambodia',
                status: 'compliant',
                complianceScore: 82,
                employees: 200,
                lastAudit: new Date('2024-02-15'),
                nextAudit: new Date('2024-05-15'),
                standards: ['ISO 9001:2015', 'ISO 45001:2018'],
                riskLevel: 'low'
            },
            {
                id: 'factory_11',
                name: 'Ratanakiri Gem Processing',
                location: 'Ratanakiri, Cambodia',
                status: 'compliant',
                complianceScore: 89,
                employees: 110,
                lastAudit: new Date('2024-02-20'),
                nextAudit: new Date('2024-05-20'),
                standards: ['ISO 9001:2015', 'ISO 14001:2015'],
                riskLevel: 'low'
            },
            {
                id: 'factory_12',
                name: 'Stung Treng Hydropower',
                location: 'Stung Treng, Cambodia',
                status: 'compliant',
                complianceScore: 94,
                employees: 85,
                lastAudit: new Date('2024-02-25'),
                nextAudit: new Date('2024-05-25'),
                standards: ['ISO 9001:2015', 'ISO 50001:2018'],
                riskLevel: 'low'
            }
        ];
    }
    
    getMockAnalytics() {
        return {
            complianceTrends: [
                { month: 'Jan', compliance: 85 },
                { month: 'Feb', compliance: 87 },
                { month: 'Mar', compliance: 89 },
                { month: 'Apr', compliance: 91 },
                { month: 'May', compliance: 88 },
                { month: 'Jun', compliance: 92 }
            ],
            insights: [
                {
                    type: 'success',
                    title: 'Compliance Improvement',
                    description: 'Overall compliance increased by 12% this month'
                },
                {
                    type: 'warning',
                    title: 'Pending Audits',
                    description: '3 factories have overdue audit requirements'
                },
                {
                    type: 'success',
                    title: 'Training Completion',
                    description: '95% of employees completed safety training'
                },
                {
                    type: 'danger',
                    title: 'Risk Alerts',
                    description: '2 high-risk items require immediate attention'
                }
            ]
        };
    }
    
    getMockRiskAssessment() {
        return [
            {
                id: 'risk_1',
                name: 'Environmental Compliance',
                level: 'low',
                description: 'All factories maintain proper environmental standards with regular monitoring',
                impact: 'Low',
                probability: 'Low',
                mitigation: 'Continue current monitoring practices',
                lastAssessed: new Date('2024-01-15')
            },
            {
                id: 'risk_2',
                name: 'Worker Safety',
                level: 'medium',
                description: 'Some factories show increased safety incident rates requiring attention',
                impact: 'Medium',
                probability: 'Medium',
                mitigation: 'Implement additional safety training programs',
                lastAssessed: new Date('2024-01-20')
            },
            {
                id: 'risk_3',
                name: 'Supply Chain Disruption',
                level: 'low',
                description: 'Supply chain remains stable with diversified suppliers',
                impact: 'Medium',
                probability: 'Low',
                mitigation: 'Maintain supplier diversity and backup plans',
                lastAssessed: new Date('2024-01-25')
            },
            {
                id: 'risk_4',
                name: 'Regulatory Changes',
                level: 'medium',
                description: 'New compliance regulations may require system updates',
                impact: 'High',
                probability: 'Medium',
                mitigation: 'Monitor regulatory updates and prepare implementation plans',
                lastAssessed: new Date('2024-01-30')
            },
            {
                id: 'risk_5',
                name: 'Data Security',
                level: 'low',
                description: 'Strong data security measures in place across all factories',
                impact: 'High',
                probability: 'Low',
                mitigation: 'Continue current security protocols and regular audits',
                lastAssessed: new Date('2024-02-01')
            },
            {
                id: 'risk_6',
                name: 'Quality Control',
                level: 'low',
                description: 'Quality control systems functioning effectively',
                impact: 'Medium',
                probability: 'Low',
                mitigation: 'Maintain current quality control processes',
                lastAssessed: new Date('2024-02-05')
            }
        ];
    }
    
    updateEnterpriseOverview() {
        const total = this.factories.length;
        const compliant = this.factories.filter(f => f.status === 'compliant').length;
        const pending = this.factories.filter(f => f.status === 'pending').length;
        const nonCompliant = this.factories.filter(f => f.status === 'non-compliant').length;
        
        document.getElementById('totalFactories').textContent = total;
        document.getElementById('compliantFactories').textContent = compliant;
        document.getElementById('pendingReviews').textContent = pending;
        document.getElementById('nonCompliantFactories').textContent = nonCompliant;
    }
    
    renderFactories() {
        const factoryGrid = document.getElementById('factoryGrid');
        if (!factoryGrid) return;
        
        factoryGrid.innerHTML = this.factories.map(factory => `
            <div class="factory-card ${factory.status}">
                <div class="factory-header">
                    <div class="factory-info">
                        <h3>${factory.name}</h3>
                        <div class="factory-location">
                            <i data-lucide="map-pin"></i>
                            <span>${factory.location}</span>
                        </div>
                    </div>
                    <div class="factory-status ${factory.status}">${factory.status}</div>
                </div>
                
                <div class="factory-metrics">
                    <div class="metric-item">
                        <div class="metric-value">${factory.complianceScore}%</div>
                        <div class="metric-label">Compliance Score</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${factory.employees}</div>
                        <div class="metric-label">Employees</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${factory.standards.length}</div>
                        <div class="metric-label">Standards</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${this.formatDate(factory.nextAudit)}</div>
                        <div class="metric-label">Next Audit</div>
                    </div>
                </div>
                
                <div class="factory-actions">
                    <button class="factory-btn" onclick="viewFactory('${factory.id}')">
                        <i data-lucide="eye"></i>
                        View
                    </button>
                    <button class="factory-btn" onclick="editFactory('${factory.id}')">
                        <i data-lucide="edit"></i>
                        Edit
                    </button>
                    <button class="factory-btn" onclick="auditFactory('${factory.id}')">
                        <i data-lucide="clipboard-check"></i>
                        Audit
                    </button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    renderRiskAssessment() {
        const riskGrid = document.getElementById('riskGrid');
        if (!riskGrid) return;
        
        riskGrid.innerHTML = this.riskAssessment.map(risk => `
            <div class="risk-item">
                <div class="risk-header-item">
                    <div class="risk-name">${risk.name}</div>
                    <div class="risk-level ${risk.level}">${risk.level}</div>
                </div>
                <div class="risk-description">${risk.description}</div>
                <div class="risk-actions">
                    <button class="risk-btn" onclick="viewRisk('${risk.id}')">
                        <i data-lucide="eye"></i>
                        View Details
                    </button>
                    <button class="risk-btn" onclick="mitigateRisk('${risk.id}')">
                        <i data-lucide="shield"></i>
                        Mitigate
                    </button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    initializeCharts() {
        this.initializeComplianceChart();
    }
    
    initializeComplianceChart() {
        const ctx = document.getElementById('complianceChart');
        if (!ctx) return;
        
        const data = this.analytics.complianceTrends || [
            { month: 'Jan', compliance: 85 },
            { month: 'Feb', compliance: 87 },
            { month: 'Mar', compliance: 89 },
            { month: 'Apr', compliance: 91 },
            { month: 'May', compliance: 88 },
            { month: 'Jun', compliance: 92 }
        ];
        
        this.complianceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: 'Compliance %',
                    data: data.map(d => d.compliance),
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    initializeUI() {
        // Initialize any UI components
    }
    
    setupEventListeners() {
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        window.addFactory = () => this.addFactory();
        window.generateReport = () => this.generateReport();
        window.exportAnalytics = () => this.exportAnalytics();
        window.refreshAnalytics = () => this.refreshAnalytics();
        window.updateRiskAssessment = () => this.updateRiskAssessment();
        window.viewFactory = (factoryId) => this.viewFactory(factoryId);
        window.editFactory = (factoryId) => this.editFactory(factoryId);
        window.auditFactory = (factoryId) => this.auditFactory(factoryId);
        window.viewRisk = (riskId) => this.viewRisk(riskId);
        window.mitigateRisk = (riskId) => this.mitigateRisk(riskId);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const factoriesRef = this.collection(this.db, 'factories');
        this.onSnapshot(factoriesRef, (snapshot) => {
            this.factories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateEnterpriseOverview();
            this.renderFactories();
        });
        
        const riskRef = this.collection(this.db, 'risk_assessments');
        this.onSnapshot(riskRef, (snapshot) => {
            this.riskAssessment = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderRiskAssessment();
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
    window.multiFactoryOverviewCore = new MultiFactoryOverviewCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiFactoryOverviewCore;
}
