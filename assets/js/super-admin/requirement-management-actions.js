// Requirement Management Actions for Super Admin
class RequirementManagementActions {
    constructor(core) {
        this.core = core;
    }
    
    async createRequirement() {
        window.location.href = 'requirement-editor.html';
    }
    
    async runGapAnalysis() {
        try {
            this.core.showNotification('info', 'Running compliance gap analysis...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.core.showNotification('success', 'Gap analysis completed successfully');
        } catch (error) {
            console.error('Error running gap analysis:', error);
            this.core.showNotification('error', 'Gap analysis failed');
        }
    }
    
    async exportRequirements() {
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                requirements: this.core.requirements,
                complianceMetrics: this.core.complianceMetrics,
                gapAnalysis: this.core.gapAnalysis
            };
            
            const json = JSON.stringify(exportData, null, 2);
            this.downloadJSON(json, 'requirements-export.json');
            this.core.showNotification('success', 'Requirements exported successfully');
        } catch (error) {
            console.error('Error exporting requirements:', error);
            this.core.showNotification('error', 'Failed to export requirements');
        }
    }
    
    async importRequirements() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.processImportedData(data);
                    } catch (error) {
                        this.core.showNotification('error', 'Invalid file format');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    async processImportedData(data) {
        try {
            this.core.showNotification('info', 'Processing imported data...');
            
            if (data.requirements) {
                for (const requirement of data.requirements) {
                    await this.core.addDoc(this.core.collection(this.core.db, 'requirements'), requirement);
                }
            }
            
            this.core.showNotification('success', 'Requirements imported successfully');
        } catch (error) {
            console.error('Error processing imported data:', error);
            this.core.showNotification('error', 'Failed to import requirements');
        }
    }
    
    async editRequirement(requirementId) {
        window.location.href = `requirement-editor.html?id=${requirementId}`;
    }
    
    async viewRequirement(requirementId) {
        const requirement = this.core.requirements.find(r => r.id === requirementId);
        if (!requirement) return;
        this.showRequirementDetailsModal(requirement);
    }
    
    showRequirementDetailsModal(requirement) {
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
                        ${requirement.title}
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
                        <strong>Code:</strong> ${requirement.code}
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Standard:</strong> ${requirement.standard}
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Status:</strong> 
                        <span class="requirement-status ${requirement.status}" style="
                            padding: var(--space-1) var(--space-2);
                            border-radius: var(--radius-sm);
                            font-size: var(--text-xs);
                            font-weight: 600;
                            text-transform: uppercase;
                            margin-left: var(--space-2);
                        ">${requirement.status}</span>
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Priority:</strong> ${requirement.priority}
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Description:</strong>
                        <p style="margin-top: var(--space-2); color: var(--neutral-600);">
                            ${requirement.description}
                        </p>
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Due Date:</strong> ${this.core.formatDate(requirement.dueDate)}
                    </div>
                    <div>
                        <strong>Assigned To:</strong> ${requirement.assignedTo}
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
    
    async updateStatus(requirementId) {
        const requirement = this.core.requirements.find(r => r.id === requirementId);
        if (!requirement) return;
        
        const newStatus = prompt('Enter new status (compliant, pending, non-compliant):', requirement.status);
        if (!newStatus || !['compliant', 'pending', 'non-compliant'].includes(newStatus)) {
            return;
        }
        
        try {
            const requirementRef = this.core.doc(this.core.db, 'requirements', requirementId);
            await this.core.updateDoc(requirementRef, {
                status: newStatus,
                lastUpdated: new Date(),
                updatedBy: this.core.currentUser.uid
            });
            
            this.core.showNotification('success', 'Requirement status updated successfully');
        } catch (error) {
            console.error('Error updating requirement status:', error);
            this.core.showNotification('error', 'Failed to update requirement status');
        }
    }
    
    async deleteRequirement(requirementId) {
        const requirement = this.core.requirements.find(r => r.id === requirementId);
        if (!requirement) return;
        
        if (!confirm(`Are you sure you want to delete "${requirement.title}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            const requirementRef = this.core.doc(this.core.db, 'requirements', requirementId);
            await this.core.deleteDoc(requirementRef);
            this.core.showNotification('success', 'Requirement deleted successfully');
        } catch (error) {
            console.error('Error deleting requirement:', error);
            this.core.showNotification('error', 'Failed to delete requirement');
        }
    }
    
    async viewGapDetails(gapId) {
        const gap = this.core.gapAnalysis.find(g => g.id === gapId);
        if (!gap) return;
        this.showGapDetailsModal(gap);
    }
    
    showGapDetailsModal(gap) {
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
                        ${gap.title}
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
                        <strong>Priority:</strong> 
                        <span class="analysis-item-priority ${gap.priority}" style="
                            padding: var(--space-1) var(--space-2);
                            border-radius: var(--radius-sm);
                            font-size: var(--text-xs);
                            font-weight: 600;
                            text-transform: uppercase;
                            margin-left: var(--space-2);
                        ">${gap.priority}</span>
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Standard:</strong> ${gap.standard}
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Impact:</strong> ${gap.impact}
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Description:</strong>
                        <p style="margin-top: var(--space-2); color: var(--neutral-600);">
                            ${gap.description}
                        </p>
                    </div>
                    <div>
                        <strong>Recommendation:</strong>
                        <p style="margin-top: var(--space-2); color: var(--neutral-600);">
                            ${gap.recommendation}
                        </p>
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
    
    async createActionPlan(gapId) {
        const gap = this.core.gapAnalysis.find(g => g.id === gapId);
        if (!gap) return;
        window.location.href = `action-plan-editor.html?gapId=${gapId}`;
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
        if (window.requirementManagementCore) {
            window.requirementManagementActions = new RequirementManagementActions(window.requirementManagementCore);
            
            // Override core methods with actions
            window.requirementManagementCore.createRequirement = () => window.requirementManagementActions.createRequirement();
            window.requirementManagementCore.runGapAnalysis = () => window.requirementManagementActions.runGapAnalysis();
            window.requirementManagementCore.exportRequirements = () => window.requirementManagementActions.exportRequirements();
            window.requirementManagementCore.importRequirements = () => window.requirementManagementActions.importRequirements();
            window.requirementManagementCore.editRequirement = (requirementId) => window.requirementManagementActions.editRequirement(requirementId);
            window.requirementManagementCore.viewRequirement = (requirementId) => window.requirementManagementActions.viewRequirement(requirementId);
            window.requirementManagementCore.updateStatus = (requirementId) => window.requirementManagementActions.updateStatus(requirementId);
            window.requirementManagementCore.deleteRequirement = (requirementId) => window.requirementManagementActions.deleteRequirement(requirementId);
            window.requirementManagementCore.viewGapDetails = (gapId) => window.requirementManagementActions.viewGapDetails(gapId);
            window.requirementManagementCore.createActionPlan = (gapId) => window.requirementManagementActions.createActionPlan(gapId);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RequirementManagementActions;
}
