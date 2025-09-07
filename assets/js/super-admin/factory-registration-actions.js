// Factory Registration Actions for Super Admin
class FactoryRegistrationActions {
    constructor(core) {
        this.core = core;
    }
    
    async viewAllRegistrations() {
        // Navigate to comprehensive registrations view
        window.location.href = 'factory-registrations-list.html';
    }
    
    async exportRegistrations() {
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                totalRegistrations: this.core.pendingRegistrations.length,
                pendingRegistrations: this.core.pendingRegistrations.filter(r => r.status === 'pending').length,
                approvedRegistrations: this.core.pendingRegistrations.filter(r => r.status === 'approved').length,
                rejectedRegistrations: this.core.pendingRegistrations.filter(r => r.status === 'rejected').length,
                registrations: this.core.pendingRegistrations
            };
            
            this.downloadJSON(exportData, 'factory-registrations-export.json');
            this.core.showNotification('success', 'Registrations exported successfully');
            
        } catch (error) {
            console.error('Error exporting registrations:', error);
            this.core.showNotification('error', 'Failed to export registrations');
        }
    }
    
    async resetForm() {
        const form = document.getElementById('registrationForm');
        if (form) {
            form.reset();
            this.core.showNotification('info', 'Form reset successfully');
        }
    }
    
    async saveDraft() {
        try {
            const form = document.getElementById('registrationForm');
            const formData = new FormData(form);
            const draftData = this.core.collectFormData(formData);
            
            // Save draft to localStorage
            const drafts = JSON.parse(localStorage.getItem('factoryRegistrationDrafts') || '[]');
            drafts.push({
                id: 'draft_' + Date.now(),
                ...draftData,
                savedDate: new Date().toISOString()
            });
            localStorage.setItem('factoryRegistrationDrafts', JSON.stringify(drafts));
            
            this.core.showNotification('success', 'Draft saved successfully');
            
        } catch (error) {
            console.error('Error saving draft:', error);
            this.core.showNotification('error', 'Failed to save draft');
        }
    }
    
    async refreshRegistrations() {
        try {
            this.core.showNotification('info', 'Refreshing registrations...');
            
            await this.core.loadPendingRegistrations();
            this.core.renderPendingRegistrations();
            
            this.core.showNotification('success', 'Registrations refreshed successfully');
            
        } catch (error) {
            console.error('Error refreshing registrations:', error);
            this.core.showNotification('error', 'Failed to refresh registrations');
        }
    }
    
    async bulkApprove() {
        const pendingRegistrations = this.core.pendingRegistrations.filter(r => r.status === 'pending');
        
        if (pendingRegistrations.length === 0) {
            this.core.showNotification('info', 'No pending registrations to approve');
            return;
        }
        
        if (!confirm(`Are you sure you want to approve ${pendingRegistrations.length} pending registrations?`)) {
            return;
        }
        
        try {
            this.core.showNotification('info', `Approving ${pendingRegistrations.length} registrations...`);
            
            // Simulate bulk approval
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Update status
            pendingRegistrations.forEach(registration => {
                registration.status = 'approved';
                registration.approvedDate = new Date();
                registration.approvedBy = this.core.currentUser?.displayName || 'Super Admin';
            });
            
            this.core.renderPendingRegistrations();
            this.core.showNotification('success', `${pendingRegistrations.length} registrations approved successfully`);
            
        } catch (error) {
            console.error('Error bulk approving registrations:', error);
            this.core.showNotification('error', 'Failed to bulk approve registrations');
        }
    }
    
    async viewRegistration(registrationId) {
        const registration = this.core.pendingRegistrations.find(r => r.id === registrationId);
        if (!registration) return;
        
        this.showRegistrationDetailsModal(registration);
    }
    
    showRegistrationDetailsModal(registration) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: var(--radius-2xl);
                padding: var(--space-6);
                max-width: 800px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-4);
                ">
                    <h3 style="font-size: var(--text-lg); font-weight: 600; color: var(--neutral-900);">
                        ${registration.factoryName}
                    </h3>
                    <button onclick="this.closest('.modal-overlay').remove()" style="
                        background: none;
                        border: none;
                        font-size: var(--text-xl);
                        cursor: pointer;
                        color: var(--neutral-500);
                    ">×</button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);">
                        <div>
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Basic Information
                            </h4>
                            <div style="margin-bottom: var(--space-2);">
                                <strong>Registration #:</strong> ${registration.registrationNumber}
                            </div>
                            <div style="margin-bottom: var(--space-2);">
                                <strong>Industry:</strong> ${this.core.formatIndustryType(registration.industryType)}
                            </div>
                            <div style="margin-bottom: var(--space-2);">
                                <strong>Company Size:</strong> ${this.core.formatCompanySize(registration.companySize)}
                            </div>
                            <div style="margin-bottom: var(--space-2);">
                                <strong>Location:</strong> ${registration.location}
                            </div>
                            <div style="margin-bottom: var(--space-2);">
                                <strong>Status:</strong> 
                                <span class="registration-status ${registration.status}" style="
                                    padding: var(--space-1) var(--space-2);
                                    border-radius: var(--radius-sm);
                                    font-size: var(--text-xs);
                                    font-weight: 600;
                                    text-transform: uppercase;
                                    margin-left: var(--space-2);
                                ">${registration.status}</span>
                            </div>
                        </div>
                        
                        <div>
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Contact Information
                            </h4>
                            <div style="margin-bottom: var(--space-2);">
                                <strong>Primary Contact:</strong> ${registration.primaryContact}
                            </div>
                            <div style="margin-bottom: var(--space-2);">
                                <strong>Email:</strong> ${registration.email}
                            </div>
                            <div style="margin-bottom: var(--space-2);">
                                <strong>Phone:</strong> ${registration.phone}
                            </div>
                            <div style="margin-bottom: var(--space-2);">
                                <strong>Website:</strong> ${registration.website || 'N/A'}
                            </div>
                            <div style="margin-bottom: var(--space-2);">
                                <strong>Submitted:</strong> ${this.core.formatDate(registration.submittedDate)}
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: var(--space-6);">
                        <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                            Compliance Standards
                        </h4>
                        <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                            ${registration.standards.map(standard => `
                                <span style="
                                    display: inline-block;
                                    background: var(--primary-100);
                                    color: var(--primary-700);
                                    padding: var(--space-1) var(--space-2);
                                    border-radius: var(--radius-sm);
                                    font-size: var(--text-xs);
                                    font-weight: 500;
                                ">${standard}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${registration.approvedDate ? `
                        <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--neutral-200);">
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Approval Information
                            </h4>
                            <div style="margin-bottom: var(--space-2);">
                                <strong>Approved Date:</strong> ${this.core.formatDate(registration.approvedDate)}
                            </div>
                            <div style="margin-bottom: var(--space-2);">
                                <strong>Approved By:</strong> ${registration.approvedBy}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    async approveRegistration(registrationId) {
        const registration = this.core.pendingRegistrations.find(r => r.id === registrationId);
        if (!registration) return;
        
        if (!confirm(`Are you sure you want to approve "${registration.factoryName}"?`)) {
            return;
        }
        
        try {
            this.core.showNotification('info', `Approving ${registration.factoryName}...`);
            
            // Simulate approval process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update registration status
            registration.status = 'approved';
            registration.approvedDate = new Date();
            registration.approvedBy = this.core.currentUser?.displayName || 'Super Admin';
            
            // Move to next workflow step
            this.updateWorkflowStep(4);
            
            this.core.renderPendingRegistrations();
            this.core.showNotification('success', `${registration.factoryName} approved successfully`);
            
        } catch (error) {
            console.error('Error approving registration:', error);
            this.core.showNotification('error', 'Failed to approve registration');
        }
    }
    
    async rejectRegistration(registrationId) {
        const registration = this.core.pendingRegistrations.find(r => r.id === registrationId);
        if (!registration) return;
        
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;
        
        if (!confirm(`Are you sure you want to reject "${registration.factoryName}"?`)) {
            return;
        }
        
        try {
            this.core.showNotification('info', `Rejecting ${registration.factoryName}...`);
            
            // Simulate rejection process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update registration status
            registration.status = 'rejected';
            registration.rejectedDate = new Date();
            registration.rejectedBy = this.core.currentUser?.displayName || 'Super Admin';
            registration.rejectionReason = reason;
            
            this.core.renderPendingRegistrations();
            this.core.showNotification('success', `${registration.factoryName} rejected successfully`);
            
        } catch (error) {
            console.error('Error rejecting registration:', error);
            this.core.showNotification('error', 'Failed to reject registration');
        }
    }
    
    updateWorkflowStep(stepNumber) {
        this.core.workflowSteps.forEach((step, index) => {
            if (index + 1 < stepNumber) {
                step.status = 'completed';
            } else if (index + 1 === stepNumber) {
                step.status = 'active';
            } else {
                step.status = 'pending';
            }
        });
        
        this.core.currentStep = stepNumber;
        this.renderWorkflowSteps();
    }
    
    renderWorkflowSteps() {
        const workflowSteps = document.querySelector('.workflow-steps');
        if (!workflowSteps) return;
        
        workflowSteps.innerHTML = this.core.workflowSteps.map(step => `
            <div class="workflow-step">
                <div class="step-circle ${step.status}">${step.id}</div>
                <div class="step-label ${step.status === 'active' ? 'active' : ''}">${step.name}</div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
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
        if (window.factoryRegistrationCore) {
            window.factoryRegistrationActions = new FactoryRegistrationActions(window.factoryRegistrationCore);
            
            // Override core methods with actions
            window.factoryRegistrationCore.viewAllRegistrations = () => window.factoryRegistrationActions.viewAllRegistrations();
            window.factoryRegistrationCore.exportRegistrations = () => window.factoryRegistrationActions.exportRegistrations();
            window.factoryRegistrationCore.resetForm = () => window.factoryRegistrationActions.resetForm();
            window.factoryRegistrationCore.saveDraft = () => window.factoryRegistrationActions.saveDraft();
            window.factoryRegistrationCore.refreshRegistrations = () => window.factoryRegistrationActions.refreshRegistrations();
            window.factoryRegistrationCore.bulkApprove = () => window.factoryRegistrationActions.bulkApprove();
            window.factoryRegistrationCore.viewRegistration = (registrationId) => window.factoryRegistrationActions.viewRegistration(registrationId);
            window.factoryRegistrationCore.approveRegistration = (registrationId) => window.factoryRegistrationActions.approveRegistration(registrationId);
            window.factoryRegistrationCore.rejectRegistration = (registrationId) => window.factoryRegistrationActions.rejectRegistration(registrationId);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FactoryRegistrationActions;
}
