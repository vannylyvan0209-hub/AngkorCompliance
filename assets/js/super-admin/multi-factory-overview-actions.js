// Multi-Factory Overview Actions for Super Admin
class MultiFactoryOverviewActions {
    constructor(core) {
        this.core = core;
    }
    
    async addFactory() {
        window.location.href = 'factory-registration.html';
    }
    
    async generateReport() {
        try {
            this.core.showNotification('info', 'Generating enterprise report...');
            
            // Simulate report generation
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Create report data
            const reportData = {
                timestamp: new Date().toISOString(),
                totalFactories: this.core.factories.length,
                compliantFactories: this.core.factories.filter(f => f.status === 'compliant').length,
                pendingReviews: this.core.factories.filter(f => f.status === 'pending').length,
                nonCompliantFactories: this.core.factories.filter(f => f.status === 'non-compliant').length,
                averageComplianceScore: this.calculateAverageCompliance(),
                riskAssessment: this.core.riskAssessment,
                factories: this.core.factories
            };
            
            // Download report
            this.downloadJSON(reportData, 'enterprise-report.json');
            
            this.core.showNotification('success', 'Enterprise report generated successfully');
            
        } catch (error) {
            console.error('Error generating report:', error);
            this.core.showNotification('error', 'Failed to generate enterprise report');
        }
    }
    
    calculateAverageCompliance() {
        if (this.core.factories.length === 0) return 0;
        const total = this.core.factories.reduce((sum, factory) => sum + factory.complianceScore, 0);
        return Math.round(total / this.core.factories.length);
    }
    
    async exportAnalytics() {
        try {
            const analyticsData = {
                timestamp: new Date().toISOString(),
                complianceTrends: this.core.analytics.complianceTrends,
                insights: this.core.analytics.insights,
                factories: this.core.factories.map(f => ({
                    id: f.id,
                    name: f.name,
                    complianceScore: f.complianceScore,
                    status: f.status,
                    riskLevel: f.riskLevel
                }))
            };
            
            this.downloadJSON(analyticsData, 'analytics-export.json');
            this.core.showNotification('success', 'Analytics data exported successfully');
            
        } catch (error) {
            console.error('Error exporting analytics:', error);
            this.core.showNotification('error', 'Failed to export analytics data');
        }
    }
    
    async refreshAnalytics() {
        try {
            this.core.showNotification('info', 'Refreshing analytics data...');
            
            // Reload data
            await this.core.loadAnalytics();
            await this.core.loadFactories();
            await this.core.loadRiskAssessment();
            
            // Update UI
            this.core.updateEnterpriseOverview();
            this.core.renderFactories();
            this.core.renderRiskAssessment();
            
            // Update chart
            if (this.core.complianceChart) {
                this.core.complianceChart.destroy();
            }
            this.core.initializeComplianceChart();
            
            this.core.showNotification('success', 'Analytics data refreshed successfully');
            
        } catch (error) {
            console.error('Error refreshing analytics:', error);
            this.core.showNotification('error', 'Failed to refresh analytics data');
        }
    }
    
    async updateRiskAssessment() {
        try {
            this.core.showNotification('info', 'Updating risk assessment...');
            
            // Simulate risk assessment update
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Reload risk assessment data
            await this.core.loadRiskAssessment();
            this.core.renderRiskAssessment();
            
            this.core.showNotification('success', 'Risk assessment updated successfully');
            
        } catch (error) {
            console.error('Error updating risk assessment:', error);
            this.core.showNotification('error', 'Failed to update risk assessment');
        }
    }
    
    async viewFactory(factoryId) {
        const factory = this.core.factories.find(f => f.id === factoryId);
        if (!factory) return;
        
        this.showFactoryDetailsModal(factory);
    }
    
    showFactoryDetailsModal(factory) {
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
                        ${factory.name}
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
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
                        <div>
                            <strong>Location:</strong> ${factory.location}
                        </div>
                        <div>
                            <strong>Status:</strong> 
                            <span class="factory-status ${factory.status}" style="
                                padding: var(--space-1) var(--space-2);
                                border-radius: var(--radius-sm);
                                font-size: var(--text-xs);
                                font-weight: 600;
                                text-transform: uppercase;
                                margin-left: var(--space-2);
                            ">${factory.status}</span>
                        </div>
                        <div>
                            <strong>Compliance Score:</strong> ${factory.complianceScore}%
                        </div>
                        <div>
                            <strong>Employees:</strong> ${factory.employees}
                        </div>
                        <div>
                            <strong>Risk Level:</strong> ${factory.riskLevel}
                        </div>
                        <div>
                            <strong>Standards:</strong> ${factory.standards.length}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Standards:</strong>
                        <div style="margin-top: var(--space-2);">
                            ${factory.standards.map(standard => `
                                <span style="
                                    display: inline-block;
                                    background: var(--primary-100);
                                    color: var(--primary-700);
                                    padding: var(--space-1) var(--space-2);
                                    border-radius: var(--radius-sm);
                                    font-size: var(--text-xs);
                                    margin-right: var(--space-2);
                                    margin-bottom: var(--space-1);
                                ">${standard}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                        <div>
                            <strong>Last Audit:</strong> ${this.core.formatDate(factory.lastAudit)}
                        </div>
                        <div>
                            <strong>Next Audit:</strong> ${this.core.formatDate(factory.nextAudit)}
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
    
    async editFactory(factoryId) {
        window.location.href = `factory-settings-panel.html?id=${factoryId}`;
    }
    
    async auditFactory(factoryId) {
        const factory = this.core.factories.find(f => f.id === factoryId);
        if (!factory) return;
        
        try {
            this.core.showNotification('info', `Starting audit for ${factory.name}...`);
            
            // Navigate to audit page
            window.location.href = `audit-checklist-generator.html?factory=${factoryId}`;
            
        } catch (error) {
            console.error('Error starting audit:', error);
            this.core.showNotification('error', 'Failed to start factory audit');
        }
    }
    
    async viewRisk(riskId) {
        const risk = this.core.riskAssessment.find(r => r.id === riskId);
        if (!risk) return;
        
        this.showRiskDetailsModal(risk);
    }
    
    showRiskDetailsModal(risk) {
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
                        ${risk.name}
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
                        <strong>Risk Level:</strong> 
                        <span class="risk-level ${risk.level}" style="
                            padding: var(--space-1) var(--space-2);
                            border-radius: var(--radius-sm);
                            font-size: var(--text-xs);
                            font-weight: 600;
                            text-transform: uppercase;
                            margin-left: var(--space-2);
                        ">${risk.level}</span>
                    </div>
                    
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Description:</strong>
                        <p style="margin-top: var(--space-2); color: var(--neutral-600);">
                            ${risk.description}
                        </p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
                        <div>
                            <strong>Impact:</strong> ${risk.impact}
                        </div>
                        <div>
                            <strong>Probability:</strong> ${risk.probability}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Mitigation Strategy:</strong>
                        <p style="margin-top: var(--space-2); color: var(--neutral-600);">
                            ${risk.mitigation}
                        </p>
                    </div>
                    
                    <div>
                        <strong>Last Assessed:</strong> ${this.core.formatDate(risk.lastAssessed)}
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
    
    async mitigateRisk(riskId) {
        const risk = this.core.riskAssessment.find(r => r.id === riskId);
        if (!risk) return;
        
        if (!confirm(`Are you sure you want to implement mitigation measures for "${risk.name}"?`)) {
            return;
        }
        
        try {
            this.core.showNotification('info', `Implementing mitigation measures for ${risk.name}...`);
            
            // Simulate mitigation implementation
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            this.core.showNotification('success', 'Mitigation measures implemented successfully');
            
        } catch (error) {
            console.error('Error mitigating risk:', error);
            this.core.showNotification('error', 'Failed to implement mitigation measures');
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
        if (window.multiFactoryOverviewCore) {
            window.multiFactoryOverviewActions = new MultiFactoryOverviewActions(window.multiFactoryOverviewCore);
            
            // Override core methods with actions
            window.multiFactoryOverviewCore.addFactory = () => window.multiFactoryOverviewActions.addFactory();
            window.multiFactoryOverviewCore.generateReport = () => window.multiFactoryOverviewActions.generateReport();
            window.multiFactoryOverviewCore.exportAnalytics = () => window.multiFactoryOverviewActions.exportAnalytics();
            window.multiFactoryOverviewCore.refreshAnalytics = () => window.multiFactoryOverviewActions.refreshAnalytics();
            window.multiFactoryOverviewCore.updateRiskAssessment = () => window.multiFactoryOverviewActions.updateRiskAssessment();
            window.multiFactoryOverviewCore.viewFactory = (factoryId) => window.multiFactoryOverviewActions.viewFactory(factoryId);
            window.multiFactoryOverviewCore.editFactory = (factoryId) => window.multiFactoryOverviewActions.editFactory(factoryId);
            window.multiFactoryOverviewCore.auditFactory = (factoryId) => window.multiFactoryOverviewActions.auditFactory(factoryId);
            window.multiFactoryOverviewCore.viewRisk = (riskId) => window.multiFactoryOverviewActions.viewRisk(riskId);
            window.multiFactoryOverviewCore.mitigateRisk = (riskId) => window.multiFactoryOverviewActions.mitigateRisk(riskId);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiFactoryOverviewActions;
}
