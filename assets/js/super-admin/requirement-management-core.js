// Requirement Management Core System for Super Admin
class RequirementManagementCore {
    constructor() {
        this.currentUser = null;
        this.requirements = [];
        this.complianceMetrics = {};
        this.gapAnalysis = [];
        this.filters = {
            search: '',
            status: 'all',
            standard: 'all',
            priority: 'all'
        };
        this.charts = {};
        this.init();
    }
    
    async init() {
        console.log('📋 Initializing Requirement Management Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.initializeCharts();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ Requirement Management Core initialized');
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
            window.superAdminNavigation.updateCurrentPage('Requirement Management');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadRequirements(),
            this.loadComplianceMetrics(),
            this.loadGapAnalysis()
        ]);
        this.updateRequirementOverview();
        this.renderRequirements();
        this.updateComplianceMetrics();
        this.renderGapAnalysis();
    }
    
    async loadRequirements() {
        try {
            const requirementsRef = this.collection(this.db, 'requirements');
            const snapshot = await this.getDocs(requirementsRef);
            this.requirements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (this.requirements.length === 0) {
                this.requirements = this.getMockRequirements();
            }
            console.log(`✓ Loaded ${this.requirements.length} requirements`);
        } catch (error) {
            console.error('Error loading requirements:', error);
            this.requirements = this.getMockRequirements();
        }
    }
    
    async loadComplianceMetrics() {
        try {
            const metricsRef = this.collection(this.db, 'compliance_metrics');
            const snapshot = await this.getDocs(metricsRef);
            this.complianceMetrics = {};
            snapshot.docs.forEach(doc => {
                this.complianceMetrics[doc.id] = doc.data();
            });
            console.log('✓ Loaded compliance metrics');
        } catch (error) {
            console.error('Error loading compliance metrics:', error);
            this.complianceMetrics = this.getMockComplianceMetrics();
        }
    }
    
    async loadGapAnalysis() {
        try {
            const gapRef = this.collection(this.db, 'gap_analysis');
            const snapshot = await this.getDocs(gapRef);
            this.gapAnalysis = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (this.gapAnalysis.length === 0) {
                this.gapAnalysis = this.getMockGapAnalysis();
            }
            console.log(`✓ Loaded ${this.gapAnalysis.length} gap analysis items`);
        } catch (error) {
            console.error('Error loading gap analysis:', error);
            this.gapAnalysis = this.getMockGapAnalysis();
        }
    }
    
    getMockRequirements() {
        const standards = ['ISO 9001', 'ISO 14001', 'OHSAS 18001', 'ISO 45001'];
        const statuses = ['compliant', 'pending', 'non-compliant'];
        const priorities = ['high', 'medium', 'low'];
        
        return Array.from({ length: 20 }, (_, i) => {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const standard = standards[Math.floor(Math.random() * standards.length)];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];
            
            return {
                id: `req_${i}`,
                code: `REQ-${String(i + 1).padStart(3, '0')}`,
                title: `Requirement ${i + 1}: ${this.getRequirementTitle(i)}`,
                description: `This requirement covers ${this.getRequirementDescription(i)} and ensures compliance with ${standard} standards.`,
                standard: standard,
                status: status,
                priority: priority,
                category: this.getRequirementCategory(i),
                lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                dueDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
                assignedTo: `User ${Math.floor(Math.random() * 10) + 1}`,
                complianceScore: Math.floor(Math.random() * 40) + 60
            };
        });
    }
    
    getRequirementTitle(index) {
        const titles = [
            'Quality Management System', 'Environmental Management', 'Occupational Health and Safety',
            'Risk Management', 'Document Control', 'Training and Competence', 'Internal Auditing',
            'Management Review', 'Corrective Actions', 'Preventive Actions', 'Customer Satisfaction',
            'Supplier Management', 'Product Realization', 'Measurement and Monitoring', 'Data Analysis',
            'Continual Improvement', 'Legal Compliance', 'Emergency Preparedness', 'Incident Investigation',
            'Performance Evaluation'
        ];
        return titles[index % titles.length];
    }
    
    getRequirementDescription(index) {
        const descriptions = [
            'quality control processes and procedures', 'environmental impact assessment and mitigation',
            'workplace safety protocols and procedures', 'risk identification and mitigation strategies',
            'documentation and record keeping systems', 'employee training and development programs',
            'internal audit processes and procedures', 'management review and decision making',
            'corrective action implementation and tracking', 'preventive action planning and execution',
            'customer feedback and satisfaction monitoring', 'supplier evaluation and management',
            'product development and delivery processes', 'performance measurement and monitoring',
            'data collection and analysis procedures', 'continuous improvement initiatives',
            'regulatory compliance monitoring', 'emergency response and preparedness',
            'incident reporting and investigation', 'performance evaluation and assessment'
        ];
        return descriptions[index % descriptions.length];
    }
    
    getRequirementCategory(index) {
        const categories = [
            'Quality Management', 'Environmental Management', 'Health & Safety', 'Risk Management',
            'Documentation', 'Training', 'Auditing', 'Management', 'Operations', 'Compliance'
        ];
        return categories[index % categories.length];
    }
    
    getMockComplianceMetrics() {
        return {
            compliantRequirements: 156,
            pendingRequirements: 23,
            nonCompliantRequirements: 7,
            complianceScore: 84,
            totalRequirements: 186,
            updatedThisMonth: 12,
            dueSoon: 5,
            overdue: 2
        };
    }
    
    getMockGapAnalysis() {
        return [
            {
                id: 'gap_1',
                title: 'Document Control System',
                description: 'Current document control system lacks version control and approval workflows',
                priority: 'high',
                standard: 'ISO 9001',
                impact: 'High risk of non-compliance',
                recommendation: 'Implement automated document control system with approval workflows'
            },
            {
                id: 'gap_2',
                title: 'Training Records Management',
                description: 'Training records are not properly maintained and tracked',
                priority: 'medium',
                standard: 'ISO 14001',
                impact: 'Medium risk of audit findings',
                recommendation: 'Establish centralized training records management system'
            },
            {
                id: 'gap_3',
                title: 'Emergency Response Procedures',
                description: 'Emergency response procedures need updating and testing',
                priority: 'high',
                standard: 'OHSAS 18001',
                impact: 'High risk to employee safety',
                recommendation: 'Update emergency procedures and conduct regular drills'
            },
            {
                id: 'gap_4',
                title: 'Supplier Evaluation Process',
                description: 'Supplier evaluation criteria need standardization',
                priority: 'low',
                standard: 'ISO 9001',
                impact: 'Low risk but affects quality',
                recommendation: 'Develop standardized supplier evaluation criteria'
            }
        ];
    }
    
    updateRequirementOverview() {
        const compliant = this.requirements.filter(r => r.status === 'compliant').length;
        const pending = this.requirements.filter(r => r.status === 'pending').length;
        const nonCompliant = this.requirements.filter(r => r.status === 'non-compliant').length;
        const total = this.requirements.length;
        const complianceScore = total > 0 ? Math.round((compliant / total) * 100) : 0;
        
        document.getElementById('compliantRequirements').textContent = compliant;
        document.getElementById('pendingRequirements').textContent = pending;
        document.getElementById('nonCompliantRequirements').textContent = nonCompliant;
        document.getElementById('complianceScore').textContent = `${complianceScore}%`;
    }
    
    renderRequirements() {
        const requirementsGrid = document.getElementById('requirementsGrid');
        if (!requirementsGrid) return;
        
        const filteredRequirements = this.getFilteredRequirements();
        
        requirementsGrid.innerHTML = filteredRequirements.map(requirement => `
            <div class="requirement-item">
                <div class="requirement-header">
                    <div>
                        <div class="requirement-title">${requirement.title}</div>
                        <div class="requirement-code">${requirement.code}</div>
                    </div>
                    <div class="requirement-status ${requirement.status}">${requirement.status}</div>
                </div>
                <div class="requirement-description">${requirement.description}</div>
                <div class="requirement-meta">
                    <div class="requirement-meta-item">
                        <i data-lucide="book"></i>
                        <span>${requirement.standard}</span>
                    </div>
                    <div class="requirement-meta-item">
                        <i data-lucide="flag"></i>
                        <span>${requirement.priority}</span>
                    </div>
                    <div class="requirement-meta-item">
                        <i data-lucide="calendar"></i>
                        <span>${this.formatDate(requirement.dueDate)}</span>
                    </div>
                </div>
                <div class="requirement-actions">
                    <button class="requirement-btn" onclick="editRequirement('${requirement.id}')">
                        <i data-lucide="edit"></i>
                        Edit
                    </button>
                    <button class="requirement-btn" onclick="viewRequirement('${requirement.id}')">
                        <i data-lucide="eye"></i>
                        View
                    </button>
                    <button class="requirement-btn" onclick="updateStatus('${requirement.id}')">
                        <i data-lucide="check"></i>
                        Update
                    </button>
                    <button class="requirement-btn danger" onclick="deleteRequirement('${requirement.id}')">
                        <i data-lucide="trash-2"></i>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    getFilteredRequirements() {
        let filtered = this.requirements;
        
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            filtered = filtered.filter(req => 
                req.title.toLowerCase().includes(searchLower) ||
                req.code.toLowerCase().includes(searchLower) ||
                req.description.toLowerCase().includes(searchLower)
            );
        }
        
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(req => req.status === this.filters.status);
        }
        
        if (this.filters.standard !== 'all') {
            filtered = filtered.filter(req => req.standard.toLowerCase().includes(this.filters.standard));
        }
        
        if (this.filters.priority !== 'all') {
            filtered = filtered.filter(req => req.priority === this.filters.priority);
        }
        
        return filtered;
    }
    
    updateComplianceMetrics() {
        document.getElementById('totalRequirements').textContent = this.complianceMetrics.totalRequirements || this.requirements.length;
        document.getElementById('updatedThisMonth').textContent = this.complianceMetrics.updatedThisMonth || 12;
        document.getElementById('dueSoon').textContent = this.complianceMetrics.dueSoon || 5;
        document.getElementById('overdue').textContent = this.complianceMetrics.overdue || 2;
    }
    
    renderGapAnalysis() {
        const gapAnalysisGrid = document.getElementById('gapAnalysisGrid');
        if (!gapAnalysisGrid) return;
        
        gapAnalysisGrid.innerHTML = this.gapAnalysis.map(gap => `
            <div class="analysis-item">
                <div class="analysis-item-header">
                    <div class="analysis-item-title">${gap.title}</div>
                    <div class="analysis-item-priority ${gap.priority}">${gap.priority}</div>
                </div>
                <div class="analysis-item-description">${gap.description}</div>
                <div class="analysis-item-actions">
                    <button class="analysis-btn" onclick="viewGapDetails('${gap.id}')">
                        <i data-lucide="eye"></i>
                        View Details
                    </button>
                    <button class="analysis-btn" onclick="createActionPlan('${gap.id}')">
                        <i data-lucide="plus"></i>
                        Action Plan
                    </button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    initializeUI() {
        this.initializeFilters();
    }
    
    initializeFilters() {
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const standardFilter = document.getElementById('standardFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.renderRequirements();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.renderRequirements();
            });
        }
        
        if (standardFilter) {
            standardFilter.addEventListener('change', (e) => {
                this.filters.standard = e.target.value;
                this.renderRequirements();
            });
        }
        
        if (priorityFilter) {
            priorityFilter.addEventListener('change', (e) => {
                this.filters.priority = e.target.value;
                this.renderRequirements();
            });
        }
    }
    
    initializeCharts() {
        this.initializeComplianceChart();
    }
    
    initializeComplianceChart() {
        const ctx = document.getElementById('complianceChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.getComplianceChartData();
        
        this.charts.compliance = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Compliance Score',
                        data: data.complianceScores,
                        borderColor: 'var(--success-500)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Requirements Met',
                        data: data.requirementsMet,
                        borderColor: 'var(--primary-500)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                        max: 100,
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
    
    getComplianceChartData() {
        const now = new Date();
        const labels = [];
        const complianceScores = [];
        const requirementsMet = [];
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            
            complianceScores.push(Math.floor(Math.random() * 20) + 70);
            requirementsMet.push(Math.floor(Math.random() * 30) + 120);
        }
        
        return { labels, complianceScores, requirementsMet };
    }
    
    setupEventListeners() {
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        window.createRequirement = () => this.createRequirement();
        window.runGapAnalysis = () => this.runGapAnalysis();
        window.exportRequirements = () => this.exportRequirements();
        window.importRequirements = () => this.importRequirements();
        window.editRequirement = (requirementId) => this.editRequirement(requirementId);
        window.viewRequirement = (requirementId) => this.viewRequirement(requirementId);
        window.updateStatus = (requirementId) => this.updateStatus(requirementId);
        window.deleteRequirement = (requirementId) => this.deleteRequirement(requirementId);
        window.viewGapDetails = (gapId) => this.viewGapDetails(gapId);
        window.createActionPlan = (gapId) => this.createActionPlan(gapId);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const requirementsRef = this.collection(this.db, 'requirements');
        this.onSnapshot(requirementsRef, (snapshot) => {
            this.requirements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateRequirementOverview();
            this.renderRequirements();
        });
        
        const metricsRef = this.collection(this.db, 'compliance_metrics');
        this.onSnapshot(metricsRef, (snapshot) => {
            this.complianceMetrics = {};
            snapshot.docs.forEach(doc => {
                this.complianceMetrics[doc.id] = doc.data();
            });
            this.updateComplianceMetrics();
        });
        
        const gapRef = this.collection(this.db, 'gap_analysis');
        this.onSnapshot(gapRef, (snapshot) => {
            this.gapAnalysis = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderGapAnalysis();
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
    window.requirementManagementCore = new RequirementManagementCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RequirementManagementCore;
}
