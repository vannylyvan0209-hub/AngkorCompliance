// Billing Management System for Super Admin

class BillingManagement {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.subscriptions = [];
        this.payments = [];
        this.factories = [];
        this.billingPlans = [];
        this.revenueChart = null;
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            await this.loadAllData();
            this.initializeRevenueChart();
            this.updateOverviewCards();
        } catch (error) {
            console.error('Error initializing Billing Management:', error);
            this.showError('Failed to initialize billing management');
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    try {
                        // Get user's role information
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.role === 'super_admin') {
                                resolve();
                            } else {
                                reject(new Error('Access denied. Super admin role required.'));
                            }
                        } else {
                            reject(new Error('User profile not found'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('User not authenticated'));
                }
            });
        });
    }

    setupEventListeners() {
        // Revenue period selector
        document.getElementById('revenuePeriod').addEventListener('change', (e) => {
            this.updateRevenueChart(parseInt(e.target.value));
        });

        // Form submissions
        document.getElementById('subscriptionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSubscription();
        });
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadSubscriptions(),
                this.loadPayments(),
                this.loadFactories(),
                this.loadBillingPlans(),
                this.loadRecentActivity()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadSubscriptions() {
        try {
            const subscriptionsSnapshot = await this.db
                .collection('subscriptions')
                .orderBy('createdAt', 'desc')
                .get();

            this.subscriptions = [];
            subscriptionsSnapshot.forEach(doc => {
                const subscriptionData = doc.data();
                this.subscriptions.push({
                    id: doc.id,
                    ...subscriptionData
                });
            });

            this.updateSubscriptionsTable();
        } catch (error) {
            console.error('Error loading subscriptions:', error);
        }
    }

    async loadPayments() {
        try {
            const paymentsSnapshot = await this.db
                .collection('payments')
                .orderBy('dueDate', 'asc')
                .get();

            this.payments = [];
            paymentsSnapshot.forEach(doc => {
                const paymentData = doc.data();
                this.payments.push({
                    id: doc.id,
                    ...paymentData
                });
            });

            this.updatePaymentsTable();
        } catch (error) {
            console.error('Error loading payments:', error);
        }
    }

    async loadFactories() {
        try {
            const factoriesSnapshot = await this.db
                .collection('factories')
                .where('status', '==', 'active')
                .orderBy('name')
                .get();

            this.factories = [];
            factoriesSnapshot.forEach(doc => {
                const factoryData = doc.data();
                this.factories.push({
                    id: doc.id,
                    ...factoryData
                });
            });

            this.populateFactorySelect();
        } catch (error) {
            console.error('Error loading factories:', error);
        }
    }

    async loadBillingPlans() {
        try {
            const plansSnapshot = await this.db
                .collection('billing_plans')
                .orderBy('name')
                .get();

            this.billingPlans = [];
            plansSnapshot.forEach(doc => {
                const planData = doc.data();
                this.billingPlans.push({
                    id: doc.id,
                    ...planData
                });
            });
        } catch (error) {
            console.error('Error loading billing plans:', error);
        }
    }

    async loadRecentActivity() {
        try {
            const activitySnapshot = await this.db
                .collection('billing_activity')
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();

            const activities = [];
            activitySnapshot.forEach(doc => {
                const activityData = doc.data();
                activities.push({
                    id: doc.id,
                    ...activityData
                });
            });

            this.updateRecentActivity(activities);
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    updateSubscriptionsTable() {
        const tableBody = document.getElementById('subscriptionsTable');
        
        if (this.subscriptions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i data-lucide="users"></i>
                        <p>No subscriptions found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.subscriptions.map(subscription => {
            const factory = this.factories.find(f => f.id === subscription.factoryId);
            const plan = this.billingPlans.find(p => p.id === subscription.planId);
            
            return `
                <tr>
                    <td>
                        <div class="factory-info">
                            <div class="factory-name">${factory ? factory.name : 'Unknown Factory'}</div>
                            <div class="factory-id">${subscription.factoryId}</div>
                        </div>
                    </td>
                    <td>
                        <span class="plan-badge plan-${subscription.planType}">
                            ${plan ? plan.name : subscription.planType}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge status-${subscription.status}">
                            ${subscription.status}
                        </span>
                    </td>
                    <td>${subscription.billingCycle}</td>
                    <td>$${subscription.amount.toFixed(2)}</td>
                    <td>${this.formatDate(subscription.nextBillingDate)}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-outline" onclick="viewSubscription('${subscription.id}')">
                                <i data-lucide="eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="editSubscription('${subscription.id}')">
                                <i data-lucide="edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="cancelSubscription('${subscription.id}')">
                                <i data-lucide="x"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updatePaymentsTable() {
        const tableBody = document.getElementById('paymentsTable');
        
        if (this.payments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i data-lucide="credit-card"></i>
                        <p>No payments found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.payments.map(payment => {
            const factory = this.factories.find(f => f.id === payment.factoryId);
            
            return `
                <tr>
                    <td>
                        <div class="factory-info">
                            <div class="factory-name">${factory ? factory.name : 'Unknown Factory'}</div>
                            <div class="factory-id">${payment.factoryId}</div>
                        </div>
                    </td>
                    <td>
                        <a href="#" onclick="viewInvoice('${payment.invoiceNumber}')">
                            ${payment.invoiceNumber}
                        </a>
                    </td>
                    <td>$${payment.amount.toFixed(2)}</td>
                    <td>
                        <span class="status-badge status-${payment.status}">
                            ${payment.status}
                        </span>
                    </td>
                    <td>${this.formatDate(payment.dueDate)}</td>
                    <td>${payment.paymentMethod || 'Not specified'}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-outline" onclick="viewPayment('${payment.id}')">
                                <i data-lucide="eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="processPayment('${payment.id}')">
                                <i data-lucide="credit-card"></i>
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="sendReminder('${payment.id}')">
                                <i data-lucide="mail"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    populateFactorySelect() {
        const factorySelect = document.getElementById('factorySelect');
        
        factorySelect.innerHTML = '<option value="">Select Factory</option>' +
            this.factories.map(factory => 
                `<option value="${factory.id}">${factory.name}</option>`
            ).join('');
    }

    updateRecentActivity(activities) {
        const activityContainer = document.getElementById('recentActivity');
        
        if (activities.length === 0) {
            activityContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="activity"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i data-lucide="${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-details">${activity.description}</div>
                    <div class="activity-time">${this.formatTimeAgo(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    initializeRevenueChart() {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        this.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Revenue',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
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
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        this.updateRevenueChart(12); // Default to 12 months
    }

    async updateRevenueChart(months) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const revenueData = await this.getRevenueData(startDate, endDate);
            
            this.revenueChart.data.labels = revenueData.labels;
            this.revenueChart.data.datasets[0].data = revenueData.values;
            this.revenueChart.update();
        } catch (error) {
            console.error('Error updating revenue chart:', error);
        }
    }

    async getRevenueData(startDate, endDate) {
        // Mock data for now - replace with actual Firebase query
        const labels = [];
        const values = [];
        
        for (let i = 0; i < 12; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            values.push(Math.floor(Math.random() * 50000) + 10000);
        }

        return { labels, values };
    }

    updateOverviewCards() {
        // Calculate totals from data
        const totalRevenue = this.subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
        const activeSubscriptions = this.subscriptions.filter(sub => sub.status === 'active').length;
        const paymentIssues = this.payments.filter(payment => payment.status === 'overdue').length;
        const upcomingRenewals = this.subscriptions.filter(sub => {
            const nextBilling = new Date(sub.nextBillingDate);
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            return nextBilling <= thirtyDaysFromNow;
        }).length;

        // Update card values
        document.querySelector('.overview-card:nth-child(1) .card-value').textContent = `$${totalRevenue.toLocaleString()}`;
        document.querySelector('.overview-card:nth-child(2) .card-value').textContent = activeSubscriptions;
        document.querySelector('.overview-card:nth-child(3) .card-value').textContent = paymentIssues;
        document.querySelector('.overview-card:nth-child(4) .card-value').textContent = upcomingRenewals;
    }

    async saveSubscription() {
        try {
            const formData = this.collectSubscriptionFormData();
            
            if (!formData.factoryId || !formData.planType) {
                this.showError('Please fill in all required fields');
                return;
            }

            const subscriptionData = {
                factoryId: formData.factoryId,
                planType: formData.planType,
                billingCycle: formData.billingCycle,
                startDate: formData.startDate,
                amount: this.calculateAmount(formData.planType, formData.billingCycle),
                status: 'active',
                nextBillingDate: this.calculateNextBillingDate(formData.startDate, formData.billingCycle),
                discountCode: formData.discountCode || null,
                notes: formData.notes || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: this.currentUser.uid,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            };

            await this.db.collection('subscriptions').add(subscriptionData);
            
            // Create initial invoice
            await this.createInvoice(subscriptionData);
            
            await this.loadSubscriptions();
            this.closeModal('addSubscriptionModal');
            this.showSuccess('Subscription created successfully');

        } catch (error) {
            console.error('Error saving subscription:', error);
            this.showError('Failed to create subscription');
        }
    }

    async createInvoice(subscriptionData) {
        try {
            const invoiceNumber = this.generateInvoiceNumber();
            
            const invoiceData = {
                invoiceNumber: invoiceNumber,
                factoryId: subscriptionData.factoryId,
                subscriptionId: subscriptionData.id,
                amount: subscriptionData.amount,
                status: 'pending',
                dueDate: subscriptionData.nextBillingDate,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: this.currentUser.uid
            };

            await this.db.collection('invoices').add(invoiceData);
        } catch (error) {
            console.error('Error creating invoice:', error);
        }
    }

    generateInvoiceNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `INV-${timestamp}-${random}`;
    }

    calculateAmount(planType, billingCycle) {
        const basePrices = {
            'basic': 99,
            'professional': 299,
            'enterprise': 599
        };

        const multipliers = {
            'monthly': 1,
            'quarterly': 2.7, // 10% discount
            'annually': 10.8 // 10% discount
        };

        return basePrices[planType] * multipliers[billingCycle];
    }

    calculateNextBillingDate(startDate, billingCycle) {
        const date = new Date(startDate);
        
        switch (billingCycle) {
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'annually':
                date.setFullYear(date.getFullYear() + 1);
                break;
        }

        return date;
    }

    collectSubscriptionFormData() {
        return {
            factoryId: document.getElementById('factorySelect').value,
            planType: document.getElementById('planSelect').value,
            billingCycle: document.getElementById('billingCycle').value,
            startDate: document.getElementById('startDate').value,
            discountCode: document.getElementById('discountCode').value,
            notes: document.getElementById('notes').value
        };
    }

    // Helper methods
    formatDate(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Unknown';
        
        const now = new Date();
        const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minutes ago`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)} hours ago`;
        } else {
            return `${Math.floor(diffInMinutes / 1440)} days ago`;
        }
    }

    getActivityIcon(type) {
        const icons = {
            'subscription_created': 'users',
            'payment_received': 'credit-card',
            'invoice_generated': 'file-text',
            'payment_failed': 'alert-triangle',
            'subscription_cancelled': 'x-circle',
            'reminder_sent': 'mail'
        };
        return icons[type] || 'activity';
    }

    showSuccess(message) {
        // Implement success notification
        alert(message); // Replace with proper notification system
    }

    showError(message) {
        // Implement error notification
        alert('Error: ' + message); // Replace with proper notification system
    }
}

// Global functions for button actions
let billingManagement;

function addNewSubscription() {
    document.getElementById('addSubscriptionModal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function saveSubscription() {
    billingManagement.saveSubscription();
}

function refreshPayments() {
    billingManagement.loadPayments();
}

function viewSubscription(subscriptionId) {
    alert('View Subscription feature coming soon');
}

function editSubscription(subscriptionId) {
    alert('Edit Subscription feature coming soon');
}

function cancelSubscription(subscriptionId) {
    if (confirm('Are you sure you want to cancel this subscription?')) {
        alert('Cancel Subscription feature coming soon');
    }
}

function viewPayment(paymentId) {
    alert('View Payment feature coming soon');
}

function processPayment(paymentId) {
    alert('Process Payment feature coming soon');
}

function sendReminder(paymentId) {
    alert('Send Reminder feature coming soon');
}

function viewInvoice(invoiceNumber) {
    alert('View Invoice feature coming soon');
}

function generateInvoice() {
    alert('Generate Invoice feature coming soon');
}

function sendPaymentReminder() {
    alert('Send Payment Reminder feature coming soon');
}

function exportBillingData() {
    alert('Export Billing Data feature coming soon');
}

function viewBillingReports() {
    alert('View Billing Reports feature coming soon');
}

function manageDiscounts() {
    alert('Manage Discounts feature coming soon');
}

function configureTaxRates() {
    alert('Configure Tax Rates feature coming soon');
}

function editPlan(planType) {
    alert('Edit Plan feature coming soon');
}

function viewPlanDetails(planType) {
    alert('View Plan Details feature coming soon');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    billingManagement = new BillingManagement();
    window.billingManagement = billingManagement;
    billingManagement.init();
});
