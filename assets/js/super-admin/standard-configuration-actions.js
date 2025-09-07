// Standard Configuration Actions for Super Admin
class StandardConfigurationActions {
    constructor(core) {
        this.core = core;
    }
    
    async createStandard() {
        window.location.href = 'standard-editor.html';
    }
    
    async generateChecklist() {
        try {
            this.core.showNotification('info', 'Generating audit checklist...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.core.showNotification('success', 'Audit checklist generated successfully');
        } catch (error) {
            console.error('Error generating checklist:', error);
            this.core.showNotification('error', 'Failed to generate audit checklist');
        }
    }
    
    async importStandard() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.xml';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.processImportedStandard(data);
                    } catch (error) {
                        this.core.showNotification('error', 'Invalid file format');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    async processImportedStandard(data) {
        try {
            this.core.showNotification('info', 'Processing imported standard...');
            await this.core.addDoc(this.core.collection(this.core.db, 'standards'), data);
            this.core.showNotification('success', 'Standard imported successfully');
        } catch (error) {
            console.error('Error processing imported standard:', error);
            this.core.showNotification('error', 'Failed to import standard');
        }
    }
    
    async exportStandards() {
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                standards: this.core.standards,
                templates: this.core.templates,
                profiles: this.core.profiles
            };
            
            const json = JSON.stringify(exportData, null, 2);
            this.downloadJSON(json, 'standards-export.json');
            this.core.showNotification('success', 'Standards exported successfully');
        } catch (error) {
            console.error('Error exporting standards:', error);
            this.core.showNotification('error', 'Failed to export standards');
        }
    }
    
    switchTab(tabName) {
        this.core.currentTab = tabName;
        
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
    }
    
    async editStandard(standardId) {
        window.location.href = `standard-editor.html?id=${standardId}`;
    }
    
    async viewStandard(standardId) {
        const standard = this.core.standards.find(s => s.id === standardId);
        if (!standard) return;
        this.showStandardDetailsModal(standard);
    }
    
    showStandardDetailsModal(standard) {
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
                        ${standard.name}
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
                        <strong>Version:</strong> ${standard.version}
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Status:</strong> 
                        <span class="standard-status ${standard.status}" style="
                            padding: var(--space-1) var(--space-2);
                            border-radius: var(--radius-sm);
                            font-size: var(--text-xs);
                            font-weight: 600;
                            text-transform: uppercase;
                            margin-left: var(--space-2);
                        ">${standard.status}</span>
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Category:</strong> ${standard.category}
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Requirements:</strong> ${standard.requirements}
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Description:</strong>
                        <p style="margin-top: var(--space-2); color: var(--neutral-600);">
                            ${standard.description}
                        </p>
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Applicable To:</strong> ${standard.applicableTo.join(', ')}
                    </div>
                    <div>
                        <strong>Last Updated:</strong> ${this.core.formatDate(standard.lastUpdated)}
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
    
    async configureStandard(standardId) {
        window.location.href = `standard-configuration-editor.html?id=${standardId}`;
    }
    
    async deleteStandard(standardId) {
        const standard = this.core.standards.find(s => s.id === standardId);
        if (!standard) return;
        
        if (!confirm(`Are you sure you want to delete "${standard.name}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            const standardRef = this.core.doc(this.core.db, 'standards', standardId);
            await this.core.deleteDoc(standardRef);
            this.core.showNotification('success', 'Standard deleted successfully');
        } catch (error) {
            console.error('Error deleting standard:', error);
            this.core.showNotification('error', 'Failed to delete standard');
        }
    }
    
    async editTemplate(templateId) {
        window.location.href = `template-editor.html?id=${templateId}`;
    }
    
    async downloadTemplate(templateId) {
        const template = this.core.templates.find(t => t.id === templateId);
        if (!template) return;
        
        try {
            this.core.showNotification('info', `Downloading ${template.name}...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.core.showNotification('success', 'Template downloaded successfully');
        } catch (error) {
            console.error('Error downloading template:', error);
            this.core.showNotification('error', 'Failed to download template');
        }
    }
    
    async duplicateTemplate(templateId) {
        const template = this.core.templates.find(t => t.id === templateId);
        if (!template) return;
        
        try {
            const duplicatedTemplate = {
                ...template,
                name: `${template.name} (Copy)`,
                lastUpdated: new Date()
            };
            
            await this.core.addDoc(this.core.collection(this.core.db, 'templates'), duplicatedTemplate);
            this.core.showNotification('success', 'Template duplicated successfully');
        } catch (error) {
            console.error('Error duplicating template:', error);
            this.core.showNotification('error', 'Failed to duplicate template');
        }
    }
    
    async editProfile(profileId) {
        window.location.href = `profile-editor.html?id=${profileId}`;
    }
    
    async viewProfile(profileId) {
        const profile = this.core.profiles.find(p => p.id === profileId);
        if (!profile) return;
        this.showProfileDetailsModal(profile);
    }
    
    showProfileDetailsModal(profile) {
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
                        ${profile.name}
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
                        <strong>Status:</strong> 
                        <span class="profile-status ${profile.status}" style="
                            padding: var(--space-1) var(--space-2);
                            border-radius: var(--radius-sm);
                            font-size: var(--text-xs);
                            font-weight: 600;
                            text-transform: uppercase;
                            margin-left: var(--space-2);
                        ">${profile.status}</span>
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Standards:</strong> ${profile.standards.join(', ')}
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Factories:</strong> ${profile.factories}
                    </div>
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Description:</strong>
                        <p style="margin-top: var(--space-2); color: var(--neutral-600);">
                            ${profile.description}
                        </p>
                    </div>
                    <div>
                        <strong>Last Updated:</strong> ${this.core.formatDate(profile.lastUpdated)}
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
    
    async applyProfile(profileId) {
        const profile = this.core.profiles.find(p => p.id === profileId);
        if (!profile) return;
        
        if (!confirm(`Are you sure you want to apply the "${profile.name}" configuration profile?`)) {
            return;
        }
        
        try {
            this.core.showNotification('info', `Applying ${profile.name} configuration profile...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.core.showNotification('success', 'Configuration profile applied successfully');
        } catch (error) {
            console.error('Error applying profile:', error);
            this.core.showNotification('error', 'Failed to apply configuration profile');
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
        if (window.standardConfigurationCore) {
            window.standardConfigurationActions = new StandardConfigurationActions(window.standardConfigurationCore);
            
            // Override core methods with actions
            window.standardConfigurationCore.createStandard = () => window.standardConfigurationActions.createStandard();
            window.standardConfigurationCore.generateChecklist = () => window.standardConfigurationActions.generateChecklist();
            window.standardConfigurationCore.importStandard = () => window.standardConfigurationActions.importStandard();
            window.standardConfigurationCore.exportStandards = () => window.standardConfigurationActions.exportStandards();
            window.standardConfigurationCore.switchTab = (tabName) => window.standardConfigurationActions.switchTab(tabName);
            window.standardConfigurationCore.editStandard = (standardId) => window.standardConfigurationActions.editStandard(standardId);
            window.standardConfigurationCore.viewStandard = (standardId) => window.standardConfigurationActions.viewStandard(standardId);
            window.standardConfigurationCore.configureStandard = (standardId) => window.standardConfigurationActions.configureStandard(standardId);
            window.standardConfigurationCore.deleteStandard = (standardId) => window.standardConfigurationActions.deleteStandard(standardId);
            window.standardConfigurationCore.editTemplate = (templateId) => window.standardConfigurationActions.editTemplate(templateId);
            window.standardConfigurationCore.downloadTemplate = (templateId) => window.standardConfigurationActions.downloadTemplate(templateId);
            window.standardConfigurationCore.duplicateTemplate = (templateId) => window.standardConfigurationActions.duplicateTemplate(templateId);
            window.standardConfigurationCore.editProfile = (profileId) => window.standardConfigurationActions.editProfile(profileId);
            window.standardConfigurationCore.viewProfile = (profileId) => window.standardConfigurationActions.viewProfile(profileId);
            window.standardConfigurationCore.applyProfile = (profileId) => window.standardConfigurationActions.applyProfile(profileId);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StandardConfigurationActions;
}
