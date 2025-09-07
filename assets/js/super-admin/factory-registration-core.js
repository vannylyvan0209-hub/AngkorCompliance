// Factory Registration Core System for Super Admin
class FactoryRegistrationCore {
    constructor() {
        this.currentUser = null;
        this.pendingRegistrations = [];
        this.workflowSteps = [
            { id: 1, name: 'Application', status: 'completed' },
            { id: 2, name: 'Review', status: 'completed' },
            { id: 3, name: 'Approval', status: 'active' },
            { id: 4, name: 'Setup', status: 'pending' },
            { id: 5, name: 'Activation', status: 'pending' }
        ];
        this.currentStep = 3;
        
        this.init();
    }
    
    async init() {
        console.log('📝 Initializing Factory Registration Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ Factory Registration Core initialized');
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
            window.superAdminNavigation.updateCurrentPage('Factory Registration');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await this.loadPendingRegistrations();
        this.renderPendingRegistrations();
    }
    
    async loadPendingRegistrations() {
        try {
            const registrationsRef = this.collection(this.db, 'factory_registrations');
            const snapshot = await this.getDocs(registrationsRef);
            this.pendingRegistrations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.pendingRegistrations.length === 0) {
                this.pendingRegistrations = this.getMockRegistrations();
            }
            console.log(`✓ Loaded ${this.pendingRegistrations.length} pending registrations`);
        } catch (error) {
            console.error('Error loading pending registrations:', error);
            this.pendingRegistrations = this.getMockRegistrations();
        }
    }
    
    getMockRegistrations() {
        return [
            {
                id: 'reg_1',
                factoryName: 'Phnom Penh Textile Manufacturing',
                registrationNumber: 'PP-TM-2024-001',
                industryType: 'textiles',
                companySize: 'large',
                location: 'Phnom Penh, Cambodia',
                primaryContact: 'Sokha Chen',
                email: 'sokha.chen@pptextile.com',
                phone: '+855 12 345 678',
                status: 'pending',
                submittedDate: new Date('2024-02-01'),
                standards: ['ISO 9001:2015', 'ISO 14001:2015'],
                employees: 350
            },
            {
                id: 'reg_2',
                factoryName: 'Siem Reap Electronics Assembly',
                registrationNumber: 'SR-EA-2024-002',
                industryType: 'electronics',
                companySize: 'medium',
                location: 'Siem Reap, Cambodia',
                primaryContact: 'Ratanak Kim',
                email: 'ratanak.kim@srelectronics.com',
                phone: '+855 23 456 789',
                status: 'pending',
                submittedDate: new Date('2024-02-05'),
                standards: ['ISO 9001:2015', 'ISO 27001:2013'],
                employees: 120
            },
            {
                id: 'reg_3',
                factoryName: 'Battambang Food Processing',
                registrationNumber: 'BT-FP-2024-003',
                industryType: 'food',
                companySize: 'medium',
                location: 'Battambang, Cambodia',
                primaryContact: 'Sophea Lim',
                email: 'sophea.lim@btfood.com',
                phone: '+855 34 567 890',
                status: 'pending',
                submittedDate: new Date('2024-02-08'),
                standards: ['ISO 9001:2015', 'ISO 22000:2018'],
                employees: 85
            },
            {
                id: 'reg_4',
                factoryName: 'Kampong Cham Construction Materials',
                registrationNumber: 'KC-CM-2024-004',
                industryType: 'construction',
                companySize: 'small',
                location: 'Kampong Cham, Cambodia',
                primaryContact: 'Vicheka Ouk',
                email: 'vicheka.ouk@kcconstruction.com',
                phone: '+855 45 678 901',
                status: 'pending',
                submittedDate: new Date('2024-02-12'),
                standards: ['ISO 9001:2015', 'ISO 45001:2018'],
                employees: 45
            },
            {
                id: 'reg_5',
                factoryName: 'Preah Sihanouk Port Services',
                registrationNumber: 'PS-PS-2024-005',
                industryType: 'services',
                companySize: 'large',
                location: 'Preah Sihanouk, Cambodia',
                primaryContact: 'Sokunthea Meas',
                email: 'sokunthea.meas@psport.com',
                phone: '+855 56 789 012',
                status: 'pending',
                submittedDate: new Date('2024-02-15'),
                standards: ['ISO 9001:2015', 'ISO 14001:2015'],
                employees: 280
            }
        ];
    }
    
    renderPendingRegistrations() {
        const registrationsGrid = document.getElementById('registrationsGrid');
        if (!registrationsGrid) return;
        
        registrationsGrid.innerHTML = this.pendingRegistrations.map(registration => `
            <div class="registration-item">
                <div class="registration-header">
                    <div class="registration-info">
                        <h4>${registration.factoryName}</h4>
                        <div class="registration-location">
                            <i data-lucide="map-pin"></i>
                            <span>${registration.location}</span>
                        </div>
                    </div>
                    <div class="registration-status ${registration.status}">${registration.status}</div>
                </div>
                
                <div class="registration-details">
                    <div class="detail-item">
                        <span class="detail-label">Registration #:</span>
                        <span class="detail-value">${registration.registrationNumber}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Industry:</span>
                        <span class="detail-value">${this.formatIndustryType(registration.industryType)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Size:</span>
                        <span class="detail-value">${this.formatCompanySize(registration.companySize)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Contact:</span>
                        <span class="detail-value">${registration.primaryContact}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Standards:</span>
                        <span class="detail-value">${registration.standards.length}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Submitted:</span>
                        <span class="detail-value">${this.formatDate(registration.submittedDate)}</span>
                    </div>
                </div>
                
                <div class="registration-actions">
                    <button class="registration-btn" onclick="viewRegistration('${registration.id}')">
                        <i data-lucide="eye"></i>
                        View
                    </button>
                    <button class="registration-btn approve" onclick="approveRegistration('${registration.id}')">
                        <i data-lucide="check"></i>
                        Approve
                    </button>
                    <button class="registration-btn reject" onclick="rejectRegistration('${registration.id}')">
                        <i data-lucide="x"></i>
                        Reject
                    </button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    initializeUI() {
        this.initializeForm();
    }
    
    initializeForm() {
        const form = document.getElementById('registrationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(e);
            });
        }
    }
    
    async handleFormSubmit(event) {
        try {
            const formData = new FormData(event.target);
            const registrationData = this.collectFormData(formData);
            
            this.showNotification('info', 'Submitting factory registration...');
            
            // Simulate submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Add to pending registrations
            this.pendingRegistrations.push({
                id: 'reg_' + Date.now(),
                ...registrationData,
                status: 'pending',
                submittedDate: new Date()
            });
            
            this.renderPendingRegistrations();
            event.target.reset();
            
            this.showNotification('success', 'Factory registration submitted successfully');
            
        } catch (error) {
            console.error('Error submitting registration:', error);
            this.showNotification('error', 'Failed to submit factory registration');
        }
    }
    
    collectFormData(formData) {
        const data = {};
        for (let [key, value] of formData.entries()) {
            if (key === 'standards') {
                if (!data.standards) data.standards = [];
                data.standards.push(value);
            } else {
                data[key] = value;
            }
        }
        
        // Generate registration number
        data.registrationNumber = this.generateRegistrationNumber(data.industryType, data.province);
        
        return data;
    }
    
    generateRegistrationNumber(industryType, province) {
        const industryCode = this.getIndustryCode(industryType);
        const provinceCode = this.getProvinceCode(province);
        const year = new Date().getFullYear();
        const sequence = String(this.pendingRegistrations.length + 1).padStart(3, '0');
        
        return `${provinceCode}-${industryCode}-${year}-${sequence}`;
    }
    
    getIndustryCode(industryType) {
        const codes = {
            'manufacturing': 'MF',
            'textiles': 'TX',
            'electronics': 'EL',
            'food': 'FD',
            'construction': 'CN',
            'mining': 'MN',
            'agriculture': 'AG',
            'services': 'SV'
        };
        return codes[industryType] || 'MF';
    }
    
    getProvinceCode(province) {
        const codes = {
            'phnom_penh': 'PP',
            'siem_reap': 'SR',
            'battambang': 'BT',
            'kampong_cham': 'KC',
            'preah_sihanouk': 'PS',
            'kandal': 'KD',
            'takeo': 'TK',
            'kampot': 'KP',
            'koh_kong': 'KK',
            'mondulkiri': 'MD',
            'ratanakiri': 'RT',
            'stung_treng': 'ST'
        };
        return codes[province] || 'PP';
    }
    
    setupEventListeners() {
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        window.viewAllRegistrations = () => this.viewAllRegistrations();
        window.exportRegistrations = () => this.exportRegistrations();
        window.resetForm = () => this.resetForm();
        window.saveDraft = () => this.saveDraft();
        window.refreshRegistrations = () => this.refreshRegistrations();
        window.bulkApprove = () => this.bulkApprove();
        window.viewRegistration = (registrationId) => this.viewRegistration(registrationId);
        window.approveRegistration = (registrationId) => this.approveRegistration(registrationId);
        window.rejectRegistration = (registrationId) => this.rejectRegistration(registrationId);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const registrationsRef = this.collection(this.db, 'factory_registrations');
        this.onSnapshot(registrationsRef, (snapshot) => {
            this.pendingRegistrations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderPendingRegistrations();
        });
    }
    
    // Utility methods
    formatIndustryType(industryType) {
        const types = {
            'manufacturing': 'Manufacturing',
            'textiles': 'Textiles & Garments',
            'electronics': 'Electronics',
            'food': 'Food Processing',
            'construction': 'Construction',
            'mining': 'Mining',
            'agriculture': 'Agriculture',
            'services': 'Services'
        };
        return types[industryType] || industryType;
    }
    
    formatCompanySize(companySize) {
        const sizes = {
            'small': 'Small (1-50)',
            'medium': 'Medium (51-200)',
            'large': 'Large (201-500)',
            'enterprise': 'Enterprise (500+)'
        };
        return sizes[companySize] || companySize;
    }
    
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
    window.factoryRegistrationCore = new FactoryRegistrationCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FactoryRegistrationCore;
}
