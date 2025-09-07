// Factory Settings Panel Actions for Super Admin
class FactorySettingsPanelActions {
    constructor(core) {
        this.core = core;
    }
    
    async resetToDefaults() {
        if (!this.core.selectedFactory) {
            this.core.showNotification('warning', 'Please select a factory first');
            return;
        }
        
        if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
            return;
        }
        
        try {
            this.core.showNotification('info', 'Resetting settings to defaults...');
            
            // Reset to default settings
            this.core.factorySettings = this.core.getDefaultFactorySettings();
            this.core.renderSettingsTabs();
            
            this.core.showNotification('success', 'Settings reset to defaults successfully');
            
        } catch (error) {
            console.error('Error resetting settings:', error);
            this.core.showNotification('error', 'Failed to reset settings to defaults');
        }
    }
    
    async saveAllSettings() {
        if (!this.core.selectedFactory) {
            this.core.showNotification('warning', 'Please select a factory first');
            return;
        }
        
        try {
            this.core.showNotification('info', 'Saving all settings...');
            
            // Save settings to Firebase
            const settingsRef = this.core.doc(this.core.db, 'factory_settings', this.core.selectedFactory);
            await this.core.updateDoc(settingsRef, {
                ...this.core.factorySettings,
                lastUpdated: this.core.serverTimestamp(),
                updatedBy: this.core.currentUser?.uid
            });
            
            this.core.showNotification('success', 'All settings saved successfully');
            
        } catch (error) {
            console.error('Error saving settings:', error);
            this.core.showNotification('error', 'Failed to save settings');
        }
    }
    
    async selectFactory(factoryId) {
        const factory = this.core.factories.find(f => f.id === factoryId);
        if (!factory) return;
        
        this.core.selectedFactory = factoryId;
        document.getElementById('selectedFactory').textContent = factory.name;
        
        // Close dropdown
        document.getElementById('factoryDropdown').classList.remove('show');
        
        // Load factory settings
        await this.core.loadFactorySettings(factoryId);
        
        this.core.showNotification('info', `Selected factory: ${factory.name}`);
    }
    
    switchTab(tabName) {
        this.core.currentTab = tabName;
        
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        event.target.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
    }
    
    updateSetting(category, key, value) {
        if (!this.core.factorySettings[category]) {
            this.core.factorySettings[category] = {};
        }
        
        this.core.factorySettings[category][key] = value;
        
        // Auto-save if enabled
        if (this.core.factorySettings.general?.autoSave) {
            this.saveAllSettings();
        }
    }
    
    toggleSetting(category, key) {
        if (!this.core.factorySettings[category]) {
            this.core.factorySettings[category] = {};
        }
        
        const currentValue = this.core.factorySettings[category][key] || false;
        this.core.factorySettings[category][key] = !currentValue;
        
        // Update UI
        const toggle = event.target;
        toggle.classList.toggle('active');
        
        // Auto-save if enabled
        if (this.core.factorySettings.general?.autoSave) {
            this.saveAllSettings();
        }
    }
    
    async importSettings() {
        if (!this.core.selectedFactory) {
            this.core.showNotification('warning', 'Please select a factory first');
            return;
        }
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const settings = JSON.parse(e.target.result);
                        this.processImportedSettings(settings);
                    } catch (error) {
                        this.core.showNotification('error', 'Invalid settings file format');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    async processImportedSettings(settings) {
        try {
            this.core.showNotification('info', 'Processing imported settings...');
            
            // Validate settings structure
            if (!this.validateSettingsStructure(settings)) {
                this.core.showNotification('error', 'Invalid settings structure');
                return;
            }
            
            // Merge with existing settings
            this.core.factorySettings = { ...this.core.factorySettings, ...settings };
            this.core.renderSettingsTabs();
            
            this.core.showNotification('success', 'Settings imported successfully');
            
        } catch (error) {
            console.error('Error processing imported settings:', error);
            this.core.showNotification('error', 'Failed to import settings');
        }
    }
    
    validateSettingsStructure(settings) {
        const requiredCategories = ['general', 'compliance', 'security', 'notifications', 'integrations'];
        return requiredCategories.every(category => settings[category] && typeof settings[category] === 'object');
    }
    
    async exportSettings() {
        if (!this.core.selectedFactory) {
            this.core.showNotification('warning', 'Please select a factory first');
            return;
        }
        
        try {
            const factory = this.core.factories.find(f => f.id === this.core.selectedFactory);
            const exportData = {
                factoryId: this.core.selectedFactory,
                factoryName: factory?.name || 'Unknown Factory',
                exportDate: new Date().toISOString(),
                settings: this.core.factorySettings
            };
            
            this.downloadJSON(exportData, `factory-settings-${factory?.name?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}.json`);
            this.core.showNotification('success', 'Settings exported successfully');
            
        } catch (error) {
            console.error('Error exporting settings:', error);
            this.core.showNotification('error', 'Failed to export settings');
        }
    }
    
    async updateComplianceSettings() {
        try {
            this.core.showNotification('info', 'Updating compliance settings...');
            
            // Simulate compliance settings update
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.core.showNotification('success', 'Compliance settings updated successfully');
            
        } catch (error) {
            console.error('Error updating compliance settings:', error);
            this.core.showNotification('error', 'Failed to update compliance settings');
        }
    }
    
    async updateSecuritySettings() {
        try {
            this.core.showNotification('info', 'Updating security settings...');
            
            // Simulate security settings update
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.core.showNotification('success', 'Security settings updated successfully');
            
        } catch (error) {
            console.error('Error updating security settings:', error);
            this.core.showNotification('error', 'Failed to update security settings');
        }
    }
    
    async updateNotificationSettings() {
        try {
            this.core.showNotification('info', 'Updating notification settings...');
            
            // Simulate notification settings update
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.core.showNotification('success', 'Notification settings updated successfully');
            
        } catch (error) {
            console.error('Error updating notification settings:', error);
            this.core.showNotification('error', 'Failed to update notification settings');
        }
    }
    
    async updateIntegrationSettings() {
        try {
            this.core.showNotification('info', 'Updating integration settings...');
            
            // Simulate integration settings update
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.core.showNotification('success', 'Integration settings updated successfully');
            
        } catch (error) {
            console.error('Error updating integration settings:', error);
            this.core.showNotification('error', 'Failed to update integration settings');
        }
    }
    
    async viewInheritance(inheritanceId) {
        const inheritance = this.core.inheritanceSettings.find(i => i.id === inheritanceId);
        if (!inheritance) return;
        
        this.showInheritanceDetailsModal(inheritance);
    }
    
    showInheritanceDetailsModal(inheritance) {
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
                        ${inheritance.name}
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
                        <span class="inheritance-status ${inheritance.status}" style="
                            padding: var(--space-1) var(--space-2);
                            border-radius: var(--radius-sm);
                            font-size: var(--text-xs);
                            font-weight: 600;
                            text-transform: uppercase;
                            margin-left: var(--space-2);
                        ">${inheritance.status}</span>
                    </div>
                    
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Source:</strong> ${inheritance.source}
                    </div>
                    
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Description:</strong>
                        <p style="margin-top: var(--space-2); color: var(--neutral-600);">
                            ${inheritance.description}
                        </p>
                    </div>
                    
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Can Override:</strong> ${inheritance.canOverride ? 'Yes' : 'No'}
                    </div>
                    
                    <div>
                        <strong>Last Updated:</strong> ${this.core.formatDate(inheritance.lastUpdated)}
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
    
    async overrideInheritance(inheritanceId) {
        const inheritance = this.core.inheritanceSettings.find(i => i.id === inheritanceId);
        if (!inheritance) return;
        
        if (!inheritance.canOverride) {
            this.core.showNotification('warning', 'This setting cannot be overridden');
            return;
        }
        
        if (!confirm(`Are you sure you want to override "${inheritance.name}"?`)) {
            return;
        }
        
        try {
            this.core.showNotification('info', `Overriding ${inheritance.name}...`);
            
            // Simulate inheritance override
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update inheritance status
            inheritance.status = 'overridden';
            inheritance.lastUpdated = new Date();
            
            this.core.renderInheritanceSettings();
            this.core.showNotification('success', `${inheritance.name} overridden successfully`);
            
        } catch (error) {
            console.error('Error overriding inheritance:', error);
            this.core.showNotification('error', 'Failed to override inheritance setting');
        }
    }
    
    async configureTool(toolId) {
        const tool = this.core.customizationTools.find(t => t.id === toolId);
        if (!tool) return;
        
        this.core.showNotification('info', `Opening configuration for ${tool.name}...`);
        
        // Simulate tool configuration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update last used date
        tool.lastUsed = new Date();
        this.core.renderCustomizationTools();
        
        this.core.showNotification('success', `${tool.name} configuration opened`);
    }
    
    async toggleTool(toolId) {
        const tool = this.core.customizationTools.find(t => t.id === toolId);
        if (!tool) return;
        
        try {
            this.core.showNotification('info', `${tool.isEnabled ? 'Disabling' : 'Enabling'} ${tool.name}...`);
            
            // Simulate tool toggle
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update tool status
            tool.isEnabled = !tool.isEnabled;
            tool.lastUsed = new Date();
            
            this.core.renderCustomizationTools();
            this.core.showNotification('success', `${tool.name} ${tool.isEnabled ? 'enabled' : 'disabled'} successfully`);
            
        } catch (error) {
            console.error('Error toggling tool:', error);
            this.core.showNotification('error', `Failed to ${tool.isEnabled ? 'disable' : 'enable'} ${tool.name}`);
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
        if (window.factorySettingsPanelCore) {
            window.factorySettingsPanelActions = new FactorySettingsPanelActions(window.factorySettingsPanelCore);
            
            // Override core methods with actions
            window.factorySettingsPanelCore.resetToDefaults = () => window.factorySettingsPanelActions.resetToDefaults();
            window.factorySettingsPanelCore.saveAllSettings = () => window.factorySettingsPanelActions.saveAllSettings();
            window.factorySettingsPanelCore.selectFactory = (factoryId) => window.factorySettingsPanelActions.selectFactory(factoryId);
            window.factorySettingsPanelCore.switchTab = (tabName) => window.factorySettingsPanelActions.switchTab(tabName);
            window.factorySettingsPanelCore.updateSetting = (category, key, value) => window.factorySettingsPanelActions.updateSetting(category, key, value);
            window.factorySettingsPanelCore.toggleSetting = (category, key) => window.factorySettingsPanelActions.toggleSetting(category, key);
            window.factorySettingsPanelCore.importSettings = () => window.factorySettingsPanelActions.importSettings();
            window.factorySettingsPanelCore.exportSettings = () => window.factorySettingsPanelActions.exportSettings();
            window.factorySettingsPanelCore.updateComplianceSettings = () => window.factorySettingsPanelActions.updateComplianceSettings();
            window.factorySettingsPanelCore.updateSecuritySettings = () => window.factorySettingsPanelActions.updateSecuritySettings();
            window.factorySettingsPanelCore.updateNotificationSettings = () => window.factorySettingsPanelActions.updateNotificationSettings();
            window.factorySettingsPanelCore.updateIntegrationSettings = () => window.factorySettingsPanelActions.updateIntegrationSettings();
            window.factorySettingsPanelCore.viewInheritance = (inheritanceId) => window.factorySettingsPanelActions.viewInheritance(inheritanceId);
            window.factorySettingsPanelCore.overrideInheritance = (inheritanceId) => window.factorySettingsPanelActions.overrideInheritance(inheritanceId);
            window.factorySettingsPanelCore.configureTool = (toolId) => window.factorySettingsPanelActions.configureTool(toolId);
            window.factorySettingsPanelCore.toggleTool = (toolId) => window.factorySettingsPanelActions.toggleTool(toolId);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FactorySettingsPanelActions;
}
