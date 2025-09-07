// Billing & Licensing Management Core System for Super Admin
class BillingManagementCore {
    constructor() {
        this.currentUser = null;
        this.subscriptions = [];
        this.payments = [];
        this.licenses = [];
        this.usage = {};
        this.analytics = {};
        this.charts = {};
        this.init();
    }
    
    async init() {
        console.log('💳 Initializing Billing Management Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.initializeCharts();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ Billing Management Core initialized');
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
            window.superAdminNavigation.updateCurrentPage('Billing & Licensing');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadSubscriptions(),
            this.loadPayments(),
            this.loadLicenses(),
            this.loadUsageData()
        ]);
        this.updateBillingOverview();
        this.renderSubscriptions();
        this.renderPayments();
        this.renderLicenses();
    }
    
    async loadSubscriptions() {
        try {
            const subscriptionsRef = this.collection(this.db, 'subscriptions');
            const snapshot = await this.getDocs(subscriptionsRef);
            this.subscriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(`✓ Loaded ${this.subscriptions.length} subscriptions`);
        } catch (error) {
            console.error('Error loading subscriptions:', error);
        }
    }
    
    async loadPayments() {
        try {
            const paymentsRef = this.collection(this.db, 'payments');
            const snapshot = await this.getDocs(paymentsRef);
            this.payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(`✓ Loaded ${this.payments.length} payments`);
        } catch (error) {
            console.error('Error loading payments:', error);
        }
    }
    
    async loadLicenses() {
        try {
            const licensesRef = this.collection(this.db, 'licenses');
            const snapshot = await this.getDocs(licensesRef);
            this.licenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(`✓ Loaded ${this.licenses.length} licenses`);
        } catch (error) {
            console.error('Error loading licenses:', error);
        }
    }
    
    async loadUsageData() {
        try {
            const usageRef = this.collection(this.db, 'usage_analytics');
            const snapshot = await this.getDocs(usageRef);
            this.usage = {};
            snapshot.docs.forEach(doc => {
                this.usage[doc.id] = doc.data();
            });
            console.log('✓ Loaded usage data');
        } catch (error) {
            console.error('Error loading usage data:', error);
        }
    }
    
    updateBillingOverview() {
        const totalRevenue = this.calculateTotalRevenue();
        const activeSubscriptions = this.subscriptions.filter(s => s.status === 'active').length;
        const pendingPayments = this.payments.filter(p => p.status === 'pending').length;
        const expiringLicenses = this.calculateExpiringLicenses();
        
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
        document.getElementById('activeSubscriptions').textContent = activeSubscriptions;
        document.getElementById('pendingPayments').textContent = pendingPayments;
        document.getElementById('expiringLicenses').textContent = expiringLicenses;
    }
    
    calculateTotalRevenue() {
        return this.payments
            .filter(p => p.status === 'completed')
            .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    }
    
    calculateExpiringLicenses() {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        return this.licenses.filter(license => {
            const expiryDate = license.expiryDate?.toDate ? license.expiryDate.toDate() : new Date(license.expiryDate);
            return expiryDate <= thirtyDaysFromNow && license.status === 'active';
        }).length;
    }
    
    renderSubscriptions() {
        const subscriptionsTable = document.getElementById('subscriptionsTable');
        if (!subscriptionsTable) return;
        
        const tableBody = subscriptionsTable.querySelector('tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.subscriptions.map(subscription => `
            <tr class="subscription-row">
                <td>
                    <div class="subscription-info">
                        <div class="subscription-name">${subscription.name}</div>
                        <div class="subscription-factory">${subscription.factoryName || 'N/A'}</div>
                    </div>
                </td>
                <td>
                    <span class="subscription-plan">${subscription.plan || 'Basic'}</span>
                </td>
                <td>
                    <span class="subscription-status status-${subscription.status}">
                        ${subscription.status || 'Active'}
                    </span>
                </td>
                <td>$${subscription.amount || 0}/month</td>
                <td>${this.formatDate(subscription.startDate)}</td>
                <td>${this.formatDate(subscription.endDate)}</td>
                <td>
                    <div class="subscription-actions">
                        <button class="action-btn edit" onclick="editSubscription('${subscription.id}')" title="Edit Subscription">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="action-btn ${subscription.status === 'active' ? 'suspend' : 'activate'}" 
                                onclick="${subscription.status === 'active' ? 'suspendSubscription' : 'activateSubscription'}('${subscription.id}')" 
                                title="${subscription.status === 'active' ? 'Suspend' : 'Activate'} Subscription">
                            <i data-lucide="${subscription.status === 'active' ? 'pause' : 'play'}"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteSubscription('${subscription.id}')" title="Delete Subscription">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    renderPayments() {
        const paymentsTable = document.getElementById('paymentsTable');
        if (!paymentsTable) return;
        
        const tableBody = paymentsTable.querySelector('tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.payments.map(payment => `
            <tr class="payment-row">
                <td>
                    <div class="payment-info">
                        <div class="payment-id">${payment.id}</div>
                        <div class="payment-factory">${payment.factoryName || 'N/A'}</div>
                    </div>
                </td>
                <td>$${payment.amount || 0}</td>
                <td>
                    <span class="payment-status status-${payment.status}">
                        ${payment.status || 'Pending'}
                    </span>
                </td>
                <td>${payment.method || 'Credit Card'}</td>
                <td>${this.formatDate(payment.date)}</td>
                <td>
                    <div class="payment-actions">
                        <button class="action-btn view" onclick="viewPaymentDetails('${payment.id}')" title="View Details">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="action-btn ${payment.status === 'pending' ? 'process' : 'refund'}" 
                                onclick="${payment.status === 'pending' ? 'processPayment' : 'refundPayment'}('${payment.id}')" 
                                title="${payment.status === 'pending' ? 'Process' : 'Refund'} Payment">
                            <i data-lucide="${payment.status === 'pending' ? 'check' : 'undo'}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    renderLicenses() {
        const licensesTable = document.getElementById('licensesTable');
        if (!licensesTable) return;
        
        const tableBody = licensesTable.querySelector('tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.licenses.map(license => `
            <tr class="license-row">
                <td>
                    <div class="license-info">
                        <div class="license-name">${license.name}</div>
                        <div class="license-factory">${license.factoryName || 'N/A'}</div>
                    </div>
                </td>
                <td>
                    <span class="license-type">${license.type || 'Standard'}</span>
                </td>
                <td>
                    <span class="license-status status-${license.status}">
                        ${license.status || 'Active'}
                    </span>
                </td>
                <td>${this.formatDate(license.startDate)}</td>
                <td>${this.formatDate(license.expiryDate)}</td>
                <td>
                    <div class="license-actions">
                        <button class="action-btn view" onclick="viewLicenseDetails('${license.id}')" title="View Details">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="action-btn renew" onclick="renewLicense('${license.id}')" title="Renew License">
                            <i data-lucide="refresh-cw"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteLicense('${license.id}')" title="Delete License">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    initializeUI() {
        this.initializeModals();
    }
    
    initializeModals() {
        const createSubscriptionModal = document.getElementById('addSubscriptionModal');
        if (createSubscriptionModal) {
            const form = createSubscriptionModal.querySelector('form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleCreateSubscription(form);
                });
            }
        }
    }
    
    async handleCreateSubscription(form) {
        try {
            const subscriptionData = {
                name: document.getElementById('subscriptionName').value,
                factoryId: document.getElementById('subscriptionFactory').value,
                plan: document.getElementById('subscriptionPlan').value,
                amount: parseFloat(document.getElementById('subscriptionAmount').value),
                status: 'active',
                startDate: new Date(),
                endDate: this.calculateEndDate(document.getElementById('subscriptionPlan').value),
                createdAt: this.serverTimestamp(),
                createdBy: this.currentUser.uid
            };
            
            await this.addDoc(this.collection(this.db, 'subscriptions'), subscriptionData);
            
            this.showNotification('success', 'Subscription created successfully!');
            this.closeModal('addSubscriptionModal');
            form.reset();
            
            await this.loadSubscriptions();
            this.renderSubscriptions();
            this.updateBillingOverview();
            
        } catch (error) {
            console.error('Error creating subscription:', error);
            this.showNotification('error', 'Failed to create subscription. Please try again.');
        }
    }
    
    calculateEndDate(plan) {
        const endDate = new Date();
        switch (plan) {
            case 'monthly':
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case 'quarterly':
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            case 'yearly':
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
            default:
                endDate.setMonth(endDate.getMonth() + 1);
        }
        return endDate;
    }
    
    initializeCharts() {
        this.initializeRevenueChart();
        this.initializeUsageChart();
    }
    
    initializeRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.getRevenueData();
        
        this.charts.revenue = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Revenue',
                        data: data.revenue,
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
    
    initializeUsageChart() {
        const ctx = document.getElementById('usageChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.getUsageData();
        
        this.charts.usage = new Chart(chartCtx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'var(--primary-500)',
                        'var(--success-500)',
                        'var(--warning-500)',
                        'var(--danger-500)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }
    
    getRevenueData() {
        const now = new Date();
        const labels = [];
        const revenue = [];
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            revenue.push(Math.floor(Math.random() * 50000) + 20000);
        }
        
        return { labels, revenue };
    }
    
    getUsageData() {
        return {
            labels: ['Active Users', 'Storage Used', 'API Calls', 'Bandwidth'],
            values: [75, 60, 45, 30]
        };
    }
    
    setupEventListeners() {
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        window.addSubscription = () => this.openCreateSubscriptionModal();
        window.editSubscription = (subscriptionId) => this.editSubscription(subscriptionId);
        window.suspendSubscription = (subscriptionId) => this.suspendSubscription(subscriptionId);
        window.activateSubscription = (subscriptionId) => this.activateSubscription(subscriptionId);
        window.deleteSubscription = (subscriptionId) => this.deleteSubscription(subscriptionId);
        window.viewPaymentDetails = (paymentId) => this.viewPaymentDetails(paymentId);
        window.processPayment = (paymentId) => this.processPayment(paymentId);
        window.refundPayment = (paymentId) => this.refundPayment(paymentId);
        window.viewLicenseDetails = (licenseId) => this.viewLicenseDetails(licenseId);
        window.renewLicense = (licenseId) => this.renewLicense(licenseId);
        window.deleteLicense = (licenseId) => this.deleteLicense(licenseId);
        window.exportBillingData = () => this.exportBillingData();
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const subscriptionsRef = this.collection(this.db, 'subscriptions');
        this.onSnapshot(subscriptionsRef, (snapshot) => {
            this.subscriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderSubscriptions();
            this.updateBillingOverview();
        });
        
        const paymentsRef = this.collection(this.db, 'payments');
        this.onSnapshot(paymentsRef, (snapshot) => {
            this.payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderPayments();
            this.updateBillingOverview();
        });
        
        const licensesRef = this.collection(this.db, 'licenses');
        this.onSnapshot(licensesRef, (snapshot) => {
            this.licenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderLicenses();
            this.updateBillingOverview();
        });
    }
    
    // Utility methods
    formatDate(date) {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString();
    }
    
    openCreateSubscriptionModal() {
        const modal = document.getElementById('addSubscriptionModal');
        if (modal) {
            modal.classList.add('show');
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    showNotification(type, message) {
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
    window.billingManagementCore = new BillingManagementCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BillingManagementCore;
}
