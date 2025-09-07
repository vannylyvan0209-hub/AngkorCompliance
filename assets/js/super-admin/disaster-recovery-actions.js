// Disaster Recovery Planning Actions
class DisasterRecoveryActions {
    constructor(core) {
        this.core = core;
    }
    
    async initiateRecovery() {
        if (!confirm('Are you sure you want to initiate disaster recovery procedures? This action will activate emergency protocols.')) {
            return;
        }
        
        try {
            this.core.showNotification('warning', 'Initiating disaster recovery procedures...');
            
            // Simulate recovery initiation
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Simulate recovery results
            const results = {
                systemsActivated: 8,
                backupSystemsOnline: 6,
                estimatedRecoveryTime: '4.5 hours',
                dataIntegrity: 99.2
            };
            
            this.core.showNotification('success', `Recovery initiated! ${results.systemsActivated} systems activated, estimated recovery time: ${results.estimatedRecoveryTime}`);
            
        } catch (error) {
            console.error('Error initiating recovery:', error);
            this.core.showNotification('error', 'Failed to initiate disaster recovery');
        }
    }
    
    async runDisasterTest() {
        try {
            this.core.showNotification('info', 'Running comprehensive disaster recovery test...');
            
            // Simulate disaster test
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Simulate test results
            const results = {
                testsPassed: 12,
                testsFailed: 2,
                overallSuccess: 85.7,
                criticalIssues: 1
            };
            
            if (results.criticalIssues > 0) {
                this.core.showNotification('warning', `Disaster test completed with ${results.criticalIssues} critical issue(s). ${results.testsPassed}/${results.testsPassed + results.testsFailed} tests passed.`);
            } else {
                this.core.showNotification('success', `Disaster test completed successfully! ${results.testsPassed}/${results.testsPassed + results.testsFailed} tests passed.`);
            }
            
        } catch (error) {
            console.error('Error running disaster test:', error);
            this.core.showNotification('error', 'Failed to run disaster recovery test');
        }
    }
    
    async refreshRecovery() {
        try {
            this.core.showNotification('info', 'Refreshing disaster recovery data...');
            
            // Simulate refresh
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await this.core.loadInitialData();
            
            this.core.showNotification('success', 'Disaster recovery data refreshed successfully');
            
        } catch (error) {
            console.error('Error refreshing recovery data:', error);
            this.core.showNotification('error', 'Failed to refresh disaster recovery data');
        }
    }
    
    async exportRecovery() {
        try {
            this.core.showNotification('info', 'Exporting disaster recovery data...');
            
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create recovery data object
            const recoveryData = {
                recoveryPlans: this.core.recoveryPlans,
                businessContinuity: this.core.businessContinuity,
                emergencyResponse: this.core.emergencyResponse,
                testingValidation: this.core.testingValidation,
                exportDate: new Date().toISOString(),
                summary: {
                    activePlans: this.core.recoveryPlans.filter(plan => plan.status === 'active').length,
                    testSuccessRate: this.core.calculateTestSuccessRate(),
                    avgRTO: this.core.calculateAverageRTO()
                }
            };
            
            // Create and download JSON file
            const blob = new Blob([JSON.stringify(recoveryData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `disaster_recovery_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.core.showNotification('success', 'Disaster recovery data exported successfully');
            
        } catch (error) {
            console.error('Error exporting recovery data:', error);
            this.core.showNotification('error', 'Failed to export disaster recovery data');
        }
    }
    
    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        event.target.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
        
        this.core.currentTab = tabName;
    }
    
    async viewPlanDetails(planId) {
        const plan = this.core.recoveryPlans.find(p => p.id === planId);
        if (!plan) return;
        
        this.core.showNotification('info', `Viewing details for ${plan.name}...`);
        
        // Simulate viewing details
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.showPlanDetailsModal(plan);
    }
    
    showPlanDetailsModal(plan) {
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
                max-width: 700px;
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
                        ${plan.name}
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
                    <div style="margin-bottom: var(--space-4);">
                        <p style="color: var(--neutral-600); margin-bottom: var(--space-4);">
                            ${plan.description}
                        </p>
                        
                        <div style="background: var(--neutral-50); padding: var(--space-4); border-radius: var(--radius-lg);">
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Recovery Objectives
                            </h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                                <div><strong>RTO (Recovery Time Objective):</strong> ${plan.rto}</div>
                                <div><strong>RPO (Recovery Point Objective):</strong> ${plan.rpo}</div>
                                <div><strong>Priority:</strong> ${plan.priority}</div>
                                <div><strong>Status:</strong> <span class="plan-status ${plan.status}">${plan.status}</span></div>
                            </div>
                        </div>
                        
                        <div style="margin-top: var(--space-4); background: var(--neutral-50); padding: var(--space-4); border-radius: var(--radius-lg);">
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Test Results
                            </h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                                <div><strong>Last Tested:</strong> ${this.core.formatTime(plan.metrics.lastTested)}</div>
                                <div><strong>Test Success Rate:</strong> ${plan.metrics.testSuccess}%</div>
                                <div><strong>Actual Recovery Time:</strong> ${plan.metrics.recoveryTime}</div>
                                <div><strong>Data Loss:</strong> ${plan.metrics.dataLoss}</div>
                            </div>
                        </div>
                    </div>
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
    
    async testPlan(planId) {
        const plan = this.core.recoveryPlans.find(p => p.id === planId);
        if (!plan) return;
        
        try {
            this.core.showNotification('info', `Testing ${plan.name}...`);
            
            // Simulate plan test
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Simulate test result
            const success = Math.random() > 0.2; // 80% success rate
            
            if (success) {
                this.core.showNotification('success', `${plan.name} test completed successfully`);
            } else {
                this.core.showNotification('error', `${plan.name} test failed - check logs for details`);
            }
            
        } catch (error) {
            console.error('Error testing plan:', error);
            this.core.showNotification('error', 'Failed to test recovery plan');
        }
    }
    
    async editPlan(planId) {
        const plan = this.core.recoveryPlans.find(p => p.id === planId);
        if (!plan) return;
        
        this.core.showNotification('info', `Opening editor for ${plan.name}...`);
        
        // Simulate opening editor
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.showPlanEditorModal(plan);
    }
    
    showPlanEditorModal(plan) {
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
                max-width: 600px;
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
                        Edit ${plan.name}
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
                    <div style="margin-bottom: var(--space-4);">
                        <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                            Recovery Time Objective (RTO)
                        </label>
                        <input type="text" value="${plan.rto}" style="
                            width: 100%;
                            padding: var(--space-3);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            font-size: var(--text-sm);
                        ">
                    </div>
                    
                    <div style="margin-bottom: var(--space-4);">
                        <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                            Recovery Point Objective (RPO)
                        </label>
                        <input type="text" value="${plan.rpo}" style="
                            width: 100%;
                            padding: var(--space-3);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            font-size: var(--text-sm);
                        ">
                    </div>
                    
                    <div style="margin-bottom: var(--space-4);">
                        <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                            Priority
                        </label>
                        <select style="
                            width: 100%;
                            padding: var(--space-3);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            font-size: var(--text-sm);
                        ">
                            <option value="critical" ${plan.priority === 'critical' ? 'selected' : ''}>Critical</option>
                            <option value="high" ${plan.priority === 'high' ? 'selected' : ''}>High</option>
                            <option value="medium" ${plan.priority === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="low" ${plan.priority === 'low' ? 'selected' : ''}>Low</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: var(--space-6);">
                        <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                            Status
                        </label>
                        <select style="
                            width: 100%;
                            padding: var(--space-3);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            font-size: var(--text-sm);
                        ">
                            <option value="active" ${plan.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="draft" ${plan.status === 'draft' ? 'selected' : ''}>Draft</option>
                            <option value="inactive" ${plan.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: var(--space-3); justify-content: flex-end;">
                        <button onclick="this.closest('.modal-overlay').remove()" style="
                            padding: var(--space-3) var(--space-6);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            background: white;
                            color: var(--neutral-700);
                            font-size: var(--text-sm);
                            cursor: pointer;
                        ">Cancel</button>
                        <button onclick="this.savePlan('${plan.id}')" style="
                            padding: var(--space-3) var(--space-6);
                            border: none;
                            border-radius: var(--radius-md);
                            background: var(--primary-600);
                            color: white;
                            font-size: var(--text-sm);
                            cursor: pointer;
                        ">Save Changes</button>
                    </div>
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
    
    async savePlan(planId) {
        try {
            this.core.showNotification('info', 'Saving recovery plan...');
            
            // Simulate save
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.core.showNotification('success', 'Recovery plan saved successfully');
            
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();
            
        } catch (error) {
            console.error('Error saving plan:', error);
            this.core.showNotification('error', 'Failed to save recovery plan');
        }
    }
    
    // Similar methods for continuity, response, and testing
    async viewContinuityDetails(continuityId) {
        const continuity = this.core.businessContinuity.find(c => c.id === continuityId);
        if (!continuity) return;
        
        this.core.showNotification('info', `Viewing details for ${continuity.name}...`);
        // Implement continuity details modal
    }
    
    async testContinuity(continuityId) {
        const continuity = this.core.businessContinuity.find(c => c.id === continuityId);
        if (!continuity) return;
        
        try {
            this.core.showNotification('info', `Testing ${continuity.name}...`);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const success = Math.random() > 0.3; // 70% success rate
            
            if (success) {
                this.core.showNotification('success', `${continuity.name} continuity test passed`);
            } else {
                this.core.showNotification('error', `${continuity.name} continuity test failed`);
            }
            
        } catch (error) {
            console.error('Error testing continuity:', error);
            this.core.showNotification('error', 'Failed to test business continuity');
        }
    }
    
    async editContinuity(continuityId) {
        const continuity = this.core.businessContinuity.find(c => c.id === continuityId);
        if (!continuity) return;
        
        this.core.showNotification('info', `Opening editor for ${continuity.name}...`);
        // Implement continuity editor modal
    }
    
    async viewResponseDetails(responseId) {
        const response = this.core.emergencyResponse.find(r => r.id === responseId);
        if (!response) return;
        
        this.core.showNotification('info', `Viewing details for ${response.name}...`);
        // Implement response details modal
    }
    
    async testResponse(responseId) {
        const response = this.core.emergencyResponse.find(r => r.id === responseId);
        if (!response) return;
        
        try {
            this.core.showNotification('info', `Testing ${response.name}...`);
            
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            const success = Math.random() > 0.25; // 75% success rate
            
            if (success) {
                this.core.showNotification('success', `${response.name} response test completed`);
            } else {
                this.core.showNotification('error', `${response.name} response test failed`);
            }
            
        } catch (error) {
            console.error('Error testing response:', error);
            this.core.showNotification('error', 'Failed to test emergency response');
        }
    }
    
    async editResponse(responseId) {
        const response = this.core.emergencyResponse.find(r => r.id === responseId);
        if (!response) return;
        
        this.core.showNotification('info', `Opening editor for ${response.name}...`);
        // Implement response editor modal
    }
    
    async viewTestDetails(testId) {
        const test = this.core.testingValidation.find(t => t.id === testId);
        if (!test) return;
        
        this.core.showNotification('info', `Viewing details for ${test.name}...`);
        // Implement test details modal
    }
    
    async runTest(testId) {
        const test = this.core.testingValidation.find(t => t.id === testId);
        if (!test) return;
        
        try {
            this.core.showNotification('info', `Running ${test.name}...`);
            
            await new Promise(resolve => setTimeout(resolve, 4000));
            
            const success = Math.random() > 0.2; // 80% success rate
            
            if (success) {
                this.core.showNotification('success', `${test.name} completed successfully`);
            } else {
                this.core.showNotification('error', `${test.name} failed - check test logs`);
            }
            
        } catch (error) {
            console.error('Error running test:', error);
            this.core.showNotification('error', 'Failed to run test');
        }
    }
    
    async scheduleTest(testId) {
        const test = this.core.testingValidation.find(t => t.id === testId);
        if (!test) return;
        
        this.core.showNotification('info', `Scheduling ${test.name}...`);
        
        // Simulate scheduling
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.core.showNotification('success', `${test.name} scheduled successfully`);
    }
}

// Initialize actions when core is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.disasterRecoveryCore) {
            window.disasterRecoveryActions = new DisasterRecoveryActions(window.disasterRecoveryCore);
            
            // Override core methods with actions
            window.disasterRecoveryCore.initiateRecovery = () => window.disasterRecoveryActions.initiateRecovery();
            window.disasterRecoveryCore.runDisasterTest = () => window.disasterRecoveryActions.runDisasterTest();
            window.disasterRecoveryCore.refreshRecovery = () => window.disasterRecoveryActions.refreshRecovery();
            window.disasterRecoveryCore.exportRecovery = () => window.disasterRecoveryActions.exportRecovery();
            window.disasterRecoveryCore.switchTab = (tabName) => window.disasterRecoveryActions.switchTab(tabName);
            window.disasterRecoveryCore.viewPlanDetails = (planId) => window.disasterRecoveryActions.viewPlanDetails(planId);
            window.disasterRecoveryCore.testPlan = (planId) => window.disasterRecoveryActions.testPlan(planId);
            window.disasterRecoveryCore.editPlan = (planId) => window.disasterRecoveryActions.editPlan(planId);
            window.disasterRecoveryCore.viewContinuityDetails = (continuityId) => window.disasterRecoveryActions.viewContinuityDetails(continuityId);
            window.disasterRecoveryCore.testContinuity = (continuityId) => window.disasterRecoveryActions.testContinuity(continuityId);
            window.disasterRecoveryCore.editContinuity = (continuityId) => window.disasterRecoveryActions.editContinuity(continuityId);
            window.disasterRecoveryCore.viewResponseDetails = (responseId) => window.disasterRecoveryActions.viewResponseDetails(responseId);
            window.disasterRecoveryCore.testResponse = (responseId) => window.disasterRecoveryActions.testResponse(responseId);
            window.disasterRecoveryCore.editResponse = (responseId) => window.disasterRecoveryActions.editResponse(responseId);
            window.disasterRecoveryCore.viewTestDetails = (testId) => window.disasterRecoveryActions.viewTestDetails(testId);
            window.disasterRecoveryCore.runTest = (testId) => window.disasterRecoveryActions.runTest(testId);
            window.disasterRecoveryCore.scheduleTest = (testId) => window.disasterRecoveryActions.scheduleTest(testId);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DisasterRecoveryActions;
}
