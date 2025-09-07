// Standard Configuration Core System for Super Admin
class StandardConfigurationCore {
    constructor() {
        this.currentUser = null;
        this.standards = [];
        this.templates = [];
        this.profiles = [];
        this.currentTab = 'standards';
        this.init();
    }
    
    async init() {
        console.log('⚙️ Initializing Standard Configuration Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ Standard Configuration Core initialized');
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
            window.superAdminNavigation.updateCurrentPage('Standard Configuration');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadStandards(),
            this.loadTemplates(),
            this.loadProfiles()
        ]);
        this.updateStandardOverview();
        this.renderStandards();
        this.renderTemplates();
        this.renderProfiles();
    }
    
    async loadStandards() {
        try {
            const standardsRef = this.collection(this.db, 'standards');
            const snapshot = await this.getDocs(standardsRef);
            this.standards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (this.standards.length === 0) {
                this.standards = this.getMockStandards();
            }
            console.log(`✓ Loaded ${this.standards.length} standards`);
        } catch (error) {
            console.error('Error loading standards:', error);
            this.standards = this.getMockStandards();
        }
    }
    
    async loadTemplates() {
        try {
            const templatesRef = this.collection(this.db, 'templates');
            const snapshot = await this.getDocs(templatesRef);
            this.templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (this.templates.length === 0) {
                this.templates = this.getMockTemplates();
            }
            console.log(`✓ Loaded ${this.templates.length} templates`);
        } catch (error) {
            console.error('Error loading templates:', error);
            this.templates = this.getMockTemplates();
        }
    }
    
    async loadProfiles() {
        try {
            const profilesRef = this.collection(this.db, 'configuration_profiles');
            const snapshot = await this.getDocs(profilesRef);
            this.profiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (this.profiles.length === 0) {
                this.profiles = this.getMockProfiles();
            }
            console.log(`✓ Loaded ${this.profiles.length} configuration profiles`);
        } catch (error) {
            console.error('Error loading profiles:', error);
            this.profiles = this.getMockProfiles();
        }
    }
    
    getMockStandards() {
        return [
            {
                id: 'std_1',
                name: 'ISO 9001:2015',
                version: '2015',
                status: 'active',
                description: 'Quality management systems - Requirements',
                category: 'Quality Management',
                lastUpdated: new Date(),
                requirements: 156,
                applicableTo: ['Manufacturing', 'Services', 'Software']
            },
            {
                id: 'std_2',
                name: 'ISO 14001:2015',
                version: '2015',
                status: 'active',
                description: 'Environmental management systems - Requirements with guidance for use',
                category: 'Environmental Management',
                lastUpdated: new Date(),
                requirements: 98,
                applicableTo: ['Manufacturing', 'Construction', 'Mining']
            },
            {
                id: 'std_3',
                name: 'ISO 45001:2018',
                version: '2018',
                status: 'active',
                description: 'Occupational health and safety management systems - Requirements with guidance for use',
                category: 'Health & Safety',
                lastUpdated: new Date(),
                requirements: 87,
                applicableTo: ['Manufacturing', 'Construction', 'Healthcare']
            },
            {
                id: 'std_4',
                name: 'ISO 27001:2013',
                version: '2013',
                status: 'active',
                description: 'Information security management systems - Requirements',
                category: 'Information Security',
                lastUpdated: new Date(),
                requirements: 114,
                applicableTo: ['IT Services', 'Software', 'Banking']
            },
            {
                id: 'std_5',
                name: 'ISO 50001:2018',
                version: '2018',
                status: 'active',
                description: 'Energy management systems - Requirements with guidance for use',
                category: 'Energy Management',
                lastUpdated: new Date(),
                requirements: 76,
                applicableTo: ['Manufacturing', 'Utilities', 'Transportation']
            },
            {
                id: 'std_6',
                name: 'ISO 22000:2018',
                version: '2018',
                status: 'active',
                description: 'Food safety management systems - Requirements for any organization in the food chain',
                category: 'Food Safety',
                lastUpdated: new Date(),
                requirements: 92,
                applicableTo: ['Food Production', 'Restaurants', 'Retail']
            },
            {
                id: 'std_7',
                name: 'ISO 20000-1:2018',
                version: '2018',
                status: 'draft',
                description: 'IT service management - Part 1: Service management system requirements',
                category: 'IT Service Management',
                lastUpdated: new Date(),
                requirements: 65,
                applicableTo: ['IT Services', 'Software', 'Telecommunications']
            },
            {
                id: 'std_8',
                name: 'ISO 13485:2016',
                version: '2016',
                status: 'inactive',
                description: 'Medical devices - Quality management systems - Requirements for regulatory purposes',
                category: 'Medical Devices',
                lastUpdated: new Date(),
                requirements: 108,
                applicableTo: ['Medical Devices', 'Pharmaceuticals', 'Healthcare']
            }
        ];
    }
    
    getMockTemplates() {
        return [
            {
                id: 'tpl_1',
                name: 'Quality Manual Template',
                type: 'document',
                description: 'Standard template for quality management system manual',
                standard: 'ISO 9001:2015',
                lastUpdated: new Date(),
                downloads: 245
            },
            {
                id: 'tpl_2',
                name: 'Environmental Policy Template',
                type: 'policy',
                description: 'Template for environmental management policy',
                standard: 'ISO 14001:2015',
                lastUpdated: new Date(),
                downloads: 189
            },
            {
                id: 'tpl_3',
                name: 'Risk Assessment Template',
                type: 'assessment',
                description: 'Comprehensive risk assessment template',
                standard: 'ISO 45001:2018',
                lastUpdated: new Date(),
                downloads: 312
            },
            {
                id: 'tpl_4',
                name: 'Internal Audit Checklist',
                type: 'checklist',
                description: 'Detailed internal audit checklist template',
                standard: 'ISO 9001:2015',
                lastUpdated: new Date(),
                downloads: 278
            },
            {
                id: 'tpl_5',
                name: 'Management Review Template',
                type: 'document',
                description: 'Template for management review meetings',
                standard: 'ISO 14001:2015',
                lastUpdated: new Date(),
                downloads: 156
            },
            {
                id: 'tpl_6',
                name: 'Corrective Action Form',
                type: 'form',
                description: 'Standard corrective action form template',
                standard: 'ISO 45001:2018',
                lastUpdated: new Date(),
                downloads: 203
            },
            {
                id: 'tpl_7',
                name: 'Training Record Template',
                type: 'record',
                description: 'Employee training record template',
                standard: 'ISO 9001:2015',
                lastUpdated: new Date(),
                downloads: 167
            },
            {
                id: 'tpl_8',
                name: 'Supplier Evaluation Template',
                type: 'assessment',
                description: 'Supplier evaluation and selection template',
                standard: 'ISO 14001:2015',
                lastUpdated: new Date(),
                downloads: 134
            }
        ];
    }
    
    getMockProfiles() {
        return [
            {
                id: 'prof_1',
                name: 'Manufacturing Profile',
                status: 'active',
                description: 'Configuration profile for manufacturing organizations',
                standards: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
                lastUpdated: new Date(),
                factories: 12
            },
            {
                id: 'prof_2',
                name: 'Service Provider Profile',
                status: 'active',
                description: 'Configuration profile for service-based organizations',
                standards: ['ISO 9001:2015', 'ISO 27001:2013'],
                lastUpdated: new Date(),
                factories: 8
            },
            {
                id: 'prof_3',
                name: 'Healthcare Profile',
                status: 'active',
                description: 'Configuration profile for healthcare organizations',
                standards: ['ISO 9001:2015', 'ISO 13485:2016'],
                lastUpdated: new Date(),
                factories: 5
            },
            {
                id: 'prof_4',
                name: 'Food Industry Profile',
                status: 'active',
                description: 'Configuration profile for food industry organizations',
                standards: ['ISO 9001:2015', 'ISO 22000:2018', 'ISO 14001:2015'],
                lastUpdated: new Date(),
                factories: 7
            },
            {
                id: 'prof_5',
                name: 'IT Services Profile',
                status: 'inactive',
                description: 'Configuration profile for IT service organizations',
                standards: ['ISO 9001:2015', 'ISO 27001:2013', 'ISO 20000-1:2018'],
                lastUpdated: new Date(),
                factories: 3
            }
        ];
    }
    
    updateStandardOverview() {
        const active = this.standards.filter(s => s.status === 'active').length;
        const draft = this.standards.filter(s => s.status === 'draft').length;
        const inactive = this.standards.filter(s => s.status === 'inactive').length;
        const totalTemplates = this.templates.length;
        
        document.getElementById('activeStandards').textContent = active;
        document.getElementById('draftStandards').textContent = draft;
        document.getElementById('inactiveStandards').textContent = inactive;
        document.getElementById('totalTemplates').textContent = totalTemplates;
    }
    
    renderStandards() {
        const standardsGrid = document.getElementById('standardsGrid');
        if (!standardsGrid) return;
        
        standardsGrid.innerHTML = this.standards.map(standard => `
            <div class="standard-item">
                <div class="standard-header">
                    <div>
                        <div class="standard-title">${standard.name}</div>
                        <div class="standard-version">v${standard.version}</div>
                    </div>
                    <div class="standard-status ${standard.status}">${standard.status}</div>
                </div>
                <div class="standard-description">${standard.description}</div>
                <div class="standard-meta">
                    <div class="standard-meta-item">
                        <i data-lucide="layers"></i>
                        <span>${standard.requirements} requirements</span>
                    </div>
                    <div class="standard-meta-item">
                        <i data-lucide="calendar"></i>
                        <span>${this.formatDate(standard.lastUpdated)}</span>
                    </div>
                </div>
                <div class="standard-actions">
                    <button class="standard-btn" onclick="editStandard('${standard.id}')">
                        <i data-lucide="edit"></i>
                        Edit
                    </button>
                    <button class="standard-btn" onclick="viewStandard('${standard.id}')">
                        <i data-lucide="eye"></i>
                        View
                    </button>
                    <button class="standard-btn" onclick="configureStandard('${standard.id}')">
                        <i data-lucide="settings"></i>
                        Configure
                    </button>
                    <button class="standard-btn danger" onclick="deleteStandard('${standard.id}')">
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
    
    renderTemplates() {
        const templatesGrid = document.getElementById('templatesGrid');
        if (!templatesGrid) return;
        
        templatesGrid.innerHTML = this.templates.map(template => `
            <div class="template-item">
                <div class="template-header">
                    <div class="template-name">${template.name}</div>
                    <div class="template-type">${template.type}</div>
                </div>
                <div class="template-description">${template.description}</div>
                <div class="template-actions">
                    <button class="template-btn" onclick="editTemplate('${template.id}')">
                        <i data-lucide="edit"></i>
                        Edit
                    </button>
                    <button class="template-btn" onclick="downloadTemplate('${template.id}')">
                        <i data-lucide="download"></i>
                        Download
                    </button>
                    <button class="template-btn" onclick="duplicateTemplate('${template.id}')">
                        <i data-lucide="copy"></i>
                        Duplicate
                    </button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    renderProfiles() {
        const profilesGrid = document.getElementById('profilesGrid');
        if (!profilesGrid) return;
        
        profilesGrid.innerHTML = this.profiles.map(profile => `
            <div class="profile-item">
                <div class="profile-header">
                    <div class="profile-name">${profile.name}</div>
                    <div class="profile-status ${profile.status}">${profile.status}</div>
                </div>
                <div class="profile-description">${profile.description}</div>
                <div class="profile-meta">
                    <div class="profile-meta-item">
                        <i data-lucide="layers"></i>
                        <span>${profile.standards.length} standards</span>
                    </div>
                    <div class="profile-meta-item">
                        <i data-lucide="building"></i>
                        <span>${profile.factories} factories</span>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="profile-btn" onclick="editProfile('${profile.id}')">
                        <i data-lucide="edit"></i>
                        Edit
                    </button>
                    <button class="profile-btn" onclick="viewProfile('${profile.id}')">
                        <i data-lucide="eye"></i>
                        View
                    </button>
                    <button class="profile-btn" onclick="applyProfile('${profile.id}')">
                        <i data-lucide="check"></i>
                        Apply
                    </button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    initializeUI() {
        // Initialize any UI components
    }
    
    setupEventListeners() {
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        window.createStandard = () => this.createStandard();
        window.generateChecklist = () => this.generateChecklist();
        window.importStandard = () => this.importStandard();
        window.exportStandards = () => this.exportStandards();
        window.switchTab = (tabName) => this.switchTab(tabName);
        window.editStandard = (standardId) => this.editStandard(standardId);
        window.viewStandard = (standardId) => this.viewStandard(standardId);
        window.configureStandard = (standardId) => this.configureStandard(standardId);
        window.deleteStandard = (standardId) => this.deleteStandard(standardId);
        window.editTemplate = (templateId) => this.editTemplate(templateId);
        window.downloadTemplate = (templateId) => this.downloadTemplate(templateId);
        window.duplicateTemplate = (templateId) => this.duplicateTemplate(templateId);
        window.editProfile = (profileId) => this.editProfile(profileId);
        window.viewProfile = (profileId) => this.viewProfile(profileId);
        window.applyProfile = (profileId) => this.applyProfile(profileId);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const standardsRef = this.collection(this.db, 'standards');
        this.onSnapshot(standardsRef, (snapshot) => {
            this.standards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateStandardOverview();
            this.renderStandards();
        });
        
        const templatesRef = this.collection(this.db, 'templates');
        this.onSnapshot(templatesRef, (snapshot) => {
            this.templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateStandardOverview();
            this.renderTemplates();
        });
        
        const profilesRef = this.collection(this.db, 'configuration_profiles');
        this.onSnapshot(profilesRef, (snapshot) => {
            this.profiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderProfiles();
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
    window.standardConfigurationCore = new StandardConfigurationCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StandardConfigurationCore;
}
