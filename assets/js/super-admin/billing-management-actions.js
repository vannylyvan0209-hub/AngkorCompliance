// Billing Management Actions for Super Admin
class BillingManagementActions {
    constructor(core) {
        this.core = core;
    }
    
    async editSubscription(subscriptionId) {
        const subscription = this.core.subscriptions.find(s => s.id === subscriptionId);
        if (!subscription) return;
        
        window.location.href = `subscription-edit.html?id=${subscriptionId}`;
    }
    
    async suspendSubscription(subscriptionId) {
        if (!confirm('Are you sure you want to suspend this subscription?')) return;
        
        try {
            const subscriptionRef = this.core.doc(this.core.db, 'subscriptions', subscriptionId);
            await this.core.updateDoc(subscriptionRef, {
                status: 'suspended',
                suspendedAt: this.core.serverTimestamp(),
                suspendedBy: this.core.currentUser.uid
            });
            
            this.core.showNotification('success', 'Subscription suspended successfully');
            
        } catch (error) {
            console.error('Error suspending subscription:', error);
            this.core.showNotification('error', 'Failed to suspend subscription');
        }
    }
    
    async activateSubscription(subscriptionId) {
        try {
            const subscriptionRef = this.core.doc(this.core.db, 'subscriptions', subscriptionId);
            await this.core.updateDoc(subscriptionRef, {
                status: 'active',
                activatedAt: this.core.serverTimestamp(),
                activatedBy: this.core.currentUser.uid
            });
            
            this.core.showNotification('success', 'Subscription activated successfully');
            
        } catch (error) {
            console.error('Error activating subscription:', error);
            this.core.showNotification('error', 'Failed to activate subscription');
        }
    }
    
    async deleteSubscription(subscriptionId) {
        if (!confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) return;
        
        try {
            const subscriptionRef = this.core.doc(this.core.db, 'subscriptions', subscriptionId);
            await this.core.deleteDoc(subscriptionRef);
            
            this.core.showNotification('success', 'Subscription deleted successfully');
            
        } catch (error) {
            console.error('Error deleting subscription:', error);
            this.core.showNotification('error', 'Failed to delete subscription');
        }
    }
    
    async viewPaymentDetails(paymentId) {
        const payment = this.core.payments.find(p => p.id === paymentId);
        if (!payment) return;
        
        const modal = document.getElementById('paymentDetailsModal');
        if (modal) {
            document.getElementById('paymentDetailsContent').innerHTML = `
                <div class="payment-details">
                    <h4>Payment Details</h4>
                    <p><strong>Amount:</strong> $${payment.amount}</p>
                    <p><strong>Status:</strong> ${payment.status}</p>
                    <p><strong>Method:</strong> ${payment.method}</p>
                    <p><strong>Date:</strong> ${this.core.formatDate(payment.date)}</p>
                    <p><strong>Factory:</strong> ${payment.factoryName}</p>
                </div>
            `;
            modal.classList.add('show');
        }
    }
    
    async processPayment(paymentId) {
        try {
            const paymentRef = this.core.doc(this.core.db, 'payments', paymentId);
            await this.core.updateDoc(paymentRef, {
                status: 'completed',
                processedAt: this.core.serverTimestamp(),
                processedBy: this.core.currentUser.uid
            });
            
            this.core.showNotification('success', 'Payment processed successfully');
            
        } catch (error) {
            console.error('Error processing payment:', error);
            this.core.showNotification('error', 'Failed to process payment');
        }
    }
    
    async refundPayment(paymentId) {
        if (!confirm('Are you sure you want to refund this payment?')) return;
        
        try {
            const paymentRef = this.core.doc(this.core.db, 'payments', paymentId);
            await this.core.updateDoc(paymentRef, {
                status: 'refunded',
                refundedAt: this.core.serverTimestamp(),
                refundedBy: this.core.currentUser.uid
            });
            
            this.core.showNotification('success', 'Payment refunded successfully');
            
        } catch (error) {
            console.error('Error refunding payment:', error);
            this.core.showNotification('error', 'Failed to refund payment');
        }
    }
    
    async viewLicenseDetails(licenseId) {
        const license = this.core.licenses.find(l => l.id === licenseId);
        if (!license) return;
        
        window.location.href = `license-details.html?id=${licenseId}`;
    }
    
    async renewLicense(licenseId) {
        const license = this.core.licenses.find(l => l.id === licenseId);
        if (!license) return;
        
        window.location.href = `license-renewal.html?id=${licenseId}`;
    }
    
    async deleteLicense(licenseId) {
        if (!confirm('Are you sure you want to delete this license? This action cannot be undone.')) return;
        
        try {
            const licenseRef = this.core.doc(this.core.db, 'licenses', licenseId);
            await this.core.deleteDoc(licenseRef);
            
            this.core.showNotification('success', 'License deleted successfully');
            
        } catch (error) {
            console.error('Error deleting license:', error);
            this.core.showNotification('error', 'Failed to delete license');
        }
    }
    
    async exportBillingData() {
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                subscriptions: this.core.subscriptions,
                payments: this.core.payments,
                licenses: this.core.licenses,
                summary: {
                    totalRevenue: this.core.calculateTotalRevenue(),
                    activeSubscriptions: this.core.subscriptions.filter(s => s.status === 'active').length,
                    pendingPayments: this.core.payments.filter(p => p.status === 'pending').length,
                    expiringLicenses: this.core.calculateExpiringLicenses()
                }
            };
            
            const json = JSON.stringify(exportData, null, 2);
            this.downloadJSON(json, 'billing-data-export.json');
            
            this.core.showNotification('success', 'Billing data exported successfully');
            
        } catch (error) {
            console.error('Error exporting billing data:', error);
            this.core.showNotification('error', 'Failed to export billing data');
        }
    }
    
    downloadJSON(json, filename) {
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Initialize actions when core is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.billingManagementCore) {
            window.billingManagementActions = new BillingManagementActions(window.billingManagementCore);
            
            // Override core methods with actions
            window.billingManagementCore.editSubscription = (subscriptionId) => window.billingManagementActions.editSubscription(subscriptionId);
            window.billingManagementCore.suspendSubscription = (subscriptionId) => window.billingManagementActions.suspendSubscription(subscriptionId);
            window.billingManagementCore.activateSubscription = (subscriptionId) => window.billingManagementActions.activateSubscription(subscriptionId);
            window.billingManagementCore.deleteSubscription = (subscriptionId) => window.billingManagementActions.deleteSubscription(subscriptionId);
            window.billingManagementCore.viewPaymentDetails = (paymentId) => window.billingManagementActions.viewPaymentDetails(paymentId);
            window.billingManagementCore.processPayment = (paymentId) => window.billingManagementActions.processPayment(paymentId);
            window.billingManagementCore.refundPayment = (paymentId) => window.billingManagementActions.refundPayment(paymentId);
            window.billingManagementCore.viewLicenseDetails = (licenseId) => window.billingManagementActions.viewLicenseDetails(licenseId);
            window.billingManagementCore.renewLicense = (licenseId) => window.billingManagementActions.renewLicense(licenseId);
            window.billingManagementCore.deleteLicense = (licenseId) => window.billingManagementActions.deleteLicense(licenseId);
            window.billingManagementCore.exportBillingData = () => window.billingManagementActions.exportBillingData();
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BillingManagementActions;
}
