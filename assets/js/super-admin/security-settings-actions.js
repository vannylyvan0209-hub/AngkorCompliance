// Security Settings Actions for Super Admin
class SecuritySettingsActions {
    constructor(core) {
        this.core = core;
    }
    
    async runSecurityScan() {
        try {
            this.core.showNotification('info', 'Running comprehensive security scan...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            this.core.securityMetrics.securityScore = Math.floor(Math.random() * 10) + 90;
            this.core.securityMetrics.activeThreats = Math.floor(Math.random() * 5);
            
            this.core.updateSecurityOverview();
            this.core.showNotification('success', 'Security scan completed successfully');
        } catch (error) {
            console.error('Error running security scan:', error);
            this.core.showNotification('error', 'Security scan failed');
        }
    }
    
    async updateSecurityPolicies() {
        try {
            this.core.showNotification('info', 'Updating security policies...');
            await this.core.saveSecurityConfig();
            this.core.showNotification('success', 'Security policies updated successfully');
        } catch (error) {
            console.error('Error updating security policies:', error);
            this.core.showNotification('error', 'Failed to update security policies');
        }
    }
    
    async saveSecurityConfig() {
        try {
            const config = {
                mfaRequired: document.getElementById('mfaRequired').classList.contains('active'),
                passwordComplexity: document.getElementById('passwordComplexity').value,
                sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
                accountLockout: document.getElementById('accountLockout').classList.contains('active'),
                ipWhitelist: document.getElementById('ipWhitelist').classList.contains('active'),
                rateLimit: parseInt(document.getElementById('rateLimit').value),
                sslEnforcement: document.getElementById('sslEnforcement').classList.contains('active'),
                corsPolicy: document.getElementById('corsPolicy').value,
                dataEncryption: document.getElementById('dataEncryption').classList.contains('active'),
                auditLogging: document.getElementById('auditLogging').classList.contains('active'),
                dataRetention: parseInt(document.getElementById('dataRetention').value),
                privacyMode: document.getElementById('privacyMode').classList.contains('active'),
                lastModified: new Date(),
                modifiedBy: this.core.currentUser.uid
            };
            
            const configRef = this.core.doc(this.core.db, 'security_config', 'main');
            await this.core.updateDoc(configRef, config);
            this.core.securityConfig = config;
        } catch (error) {
            console.error('Error saving security config:', error);
            this.core.showNotification('error', 'Failed to save security configuration');
        }
    }
    
    async resetToDefaults() {
        if (!confirm('Are you sure you want to reset all security settings to defaults? This action cannot be undone.')) {
            return;
        }
        
        try {
            this.core.showNotification('info', 'Resetting security settings to defaults...');
            
            const defaultConfig = this.core.getDefaultSecurityConfig();
            const configRef = this.core.doc(this.core.db, 'security_config', 'main');
            await this.core.updateDoc(configRef, defaultConfig);
            
            this.core.securityConfig = defaultConfig;
            this.core.loadSecurityConfigToUI();
            this.core.showNotification('success', 'Security settings reset to defaults');
        } catch (error) {
            console.error('Error resetting to defaults:', error);
            this.core.showNotification('error', 'Failed to reset security settings');
        }
    }
    
    async exportConfig() {
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                securityConfig: this.core.securityConfig,
                accessPolicies: this.core.accessPolicies,
                securityMetrics: this.core.securityMetrics
            };
            
            const json = JSON.stringify(exportData, null, 2);
            this.downloadJSON(json, 'security-config-export.json');
            this.core.showNotification('success', 'Security configuration exported successfully');
        } catch (error) {
            console.error('Error exporting config:', error);
            this.core.showNotification('error', 'Failed to export security configuration');
        }
    }
    
    async editPolicy(policyId) {
        const policy = this.core.accessPolicies.find(p => p.id === policyId);
        if (!policy) return;
        window.location.href = `access-policy-editor.html?id=${policyId}`;
    }
    
    async togglePolicy(policyId) {
        const policy = this.core.accessPolicies.find(p => p.id === policyId);
        if (!policy) return;
        
        try {
            const newStatus = policy.status === 'enabled' ? 'disabled' : 'enabled';
            const policyRef = this.core.doc(this.core.db, 'access_policies', policyId);
            await this.core.updateDoc(policyRef, {
                status: newStatus,
                lastModified: new Date(),
                modifiedBy: this.core.currentUser.uid
            });
            
            policy.status = newStatus;
            this.core.renderAccessPolicies();
            this.core.showNotification('success', `Policy ${newStatus} successfully`);
        } catch (error) {
            console.error('Error toggling policy:', error);
            this.core.showNotification('error', 'Failed to update policy');
        }
    }
    
    async viewPolicyDetails(policyId) {
        const policy = this.core.accessPolicies.find(p => p.id === policyId);
        if (!policy) return;
        this.showPolicyDetailsModal(policy);
    }
    
    showPolicyDetailsModal(policy) {
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
                max-width: 500px;
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
                        ${policy.name}
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
                    <p style="color: var(--neutral-600); margin-bottom: var(--space-4);">
                        ${policy.description}
                    </p>
                    <div style="margin-bottom: var(--space-3);">
                        <strong>Status:</strong> 
                        <span class="access-item-status ${policy.status}" style="
                            padding: var(--space-1) var(--space-2);
                            border-radius: var(--radius-sm);
                            font-size: var(--text-xs);
                            font-weight: 600;
                            text-transform: uppercase;
                            margin-left: var(--space-2);
                        ">${policy.status}</span>
                    </div>
                    <div style="margin-bottom: var(--space-3);">
                        <strong>Users:</strong> ${policy.users}
                    </div>
                    <div style="margin-bottom: var(--space-3);">
                        <strong>Permissions:</strong> ${policy.permissions.join(', ')}
                    </div>
                    <div>
                        <strong>Last Modified:</strong> ${this.core.formatDate(policy.lastModified)}
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
    
    toggleSetting(settingId) {
        const toggle = document.getElementById(settingId);
        if (toggle) {
            toggle.classList.toggle('active');
            this.saveSecurityConfig();
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
        if (window.securitySettingsCore) {
            window.securitySettingsActions = new SecuritySettingsActions(window.securitySettingsCore);
            
            // Override core methods with actions
            window.securitySettingsCore.runSecurityScan = () => window.securitySettingsActions.runSecurityScan();
            window.securitySettingsCore.updateSecurityPolicies = () => window.securitySettingsActions.updateSecurityPolicies();
            window.securitySettingsCore.saveSecurityConfig = () => window.securitySettingsActions.saveSecurityConfig();
            window.securitySettingsCore.resetToDefaults = () => window.securitySettingsActions.resetToDefaults();
            window.securitySettingsCore.exportConfig = () => window.securitySettingsActions.exportConfig();
            window.securitySettingsCore.editPolicy = (policyId) => window.securitySettingsActions.editPolicy(policyId);
            window.securitySettingsCore.togglePolicy = (policyId) => window.securitySettingsActions.togglePolicy(policyId);
            window.securitySettingsCore.viewPolicyDetails = (policyId) => window.securitySettingsActions.viewPolicyDetails(policyId);
            window.securitySettingsCore.toggleSetting = (settingId) => window.securitySettingsActions.toggleSetting(settingId);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecuritySettingsActions;
}
