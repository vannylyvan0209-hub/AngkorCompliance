// Super Admin Profile Management Actions
class ProfileManagementActions {
    constructor(core) {
        this.core = core;
    }
    
    async exportProfile() {
        try {
            this.core.showNotification('info', 'Exporting profile data...');
            
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create profile data object
            const profileData = {
                personalInfo: {
                    firstName: this.core.profileData.firstName,
                    lastName: this.core.profileData.lastName,
                    email: this.core.profileData.email,
                    phone: this.core.profileData.phone,
                    jobTitle: this.core.profileData.jobTitle,
                    department: this.core.profileData.department
                },
                contactInfo: {
                    address: this.core.profileData.address,
                    city: this.core.profileData.city,
                    country: this.core.profileData.country,
                    postalCode: this.core.profileData.postalCode
                },
                additionalInfo: {
                    bio: this.core.profileData.bio
                },
                preferences: this.core.profileData.preferences,
                securitySettings: this.core.securitySettings,
                exportDate: new Date().toISOString()
            };
            
            // Create and download JSON file
            const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `profile_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.core.showNotification('success', 'Profile exported successfully');
            
        } catch (error) {
            console.error('Error exporting profile:', error);
            this.core.showNotification('error', 'Failed to export profile');
        }
    }
    
    async saveProfile() {
        try {
            this.core.showNotification('info', 'Saving profile changes...');
            
            // Simulate save
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update profile data with form values
            this.updateProfileFromForms();
            
            // Save to Firebase if available
            if (this.core.currentUser && this.core.updateDoc) {
                const profileRef = this.core.doc(this.core.db, 'user_profiles', this.core.currentUser.uid);
                await this.core.updateDoc(profileRef, {
                    ...this.core.profileData,
                    lastUpdated: this.core.serverTimestamp()
                });
            }
            
            this.core.updateOverviewStats();
            this.core.renderProfileData();
            this.core.showNotification('success', 'Profile saved successfully');
            
        } catch (error) {
            console.error('Error saving profile:', error);
            this.core.showNotification('error', 'Failed to save profile');
        }
    }
    
    updateProfileFromForms() {
        // Personal Information
        this.core.profileData.firstName = document.getElementById('firstName').value;
        this.core.profileData.lastName = document.getElementById('lastName').value;
        this.core.profileData.email = document.getElementById('email').value;
        this.core.profileData.phone = document.getElementById('phone').value;
        this.core.profileData.jobTitle = document.getElementById('jobTitle').value;
        this.core.profileData.department = document.getElementById('department').value;
        
        // Contact Information
        this.core.profileData.address = document.getElementById('address').value;
        this.core.profileData.city = document.getElementById('city').value;
        this.core.profileData.country = document.getElementById('country').value;
        this.core.profileData.postalCode = document.getElementById('postalCode').value;
        
        // Additional Information
        this.core.profileData.bio = document.getElementById('bio').value;
        
        // Preferences
        this.core.profileData.preferences = {
            defaultLanguage: document.getElementById('defaultLanguage').value,
            timeZone: document.getElementById('timeZone').value,
            dateFormat: document.getElementById('dateFormat').value,
            timeFormat: document.getElementById('timeFormat').value,
            theme: document.getElementById('theme').value,
            notifications: document.getElementById('notifications').value
        };
    }
    
    async refreshProfile() {
        try {
            this.core.showNotification('info', 'Refreshing profile data...');
            
            // Simulate refresh
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            await this.core.loadInitialData();
            
            this.core.showNotification('success', 'Profile refreshed successfully');
            
        } catch (error) {
            console.error('Error refreshing profile:', error);
            this.core.showNotification('error', 'Failed to refresh profile');
        }
    }
    
    async resetProfile() {
        if (!confirm('Are you sure you want to reset your profile to default values? This action cannot be undone.')) {
            return;
        }
        
        try {
            this.core.showNotification('info', 'Resetting profile...');
            
            // Simulate reset
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Reset to default values
            this.core.profileData = this.core.getMockProfileData();
            
            this.core.updateOverviewStats();
            this.core.renderProfileData();
            this.core.showNotification('success', 'Profile reset successfully');
            
        } catch (error) {
            console.error('Error resetting profile:', error);
            this.core.showNotification('error', 'Failed to reset profile');
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
    
    async uploadAvatar() {
        this.core.showNotification('info', 'Opening avatar upload dialog...');
        
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                this.core.showNotification('info', 'Uploading avatar...');
                
                // Simulate upload
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Create preview URL
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Update avatar display
                    const avatar = document.getElementById('profileAvatar');
                    avatar.style.backgroundImage = `url(${e.target.result})`;
                    avatar.style.backgroundSize = 'cover';
                    avatar.style.backgroundPosition = 'center';
                    
                    // Hide initials
                    document.getElementById('avatarInitials').style.display = 'none';
                };
                reader.readAsDataURL(file);
                
                this.core.showNotification('success', 'Avatar uploaded successfully');
                
            } catch (error) {
                console.error('Error uploading avatar:', error);
                this.core.showNotification('error', 'Failed to upload avatar');
            }
        });
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }
    
    async cancelChanges() {
        this.core.showNotification('info', 'Discarding changes...');
        
        // Simulate cancel
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reset form fields to original values
        this.core.renderProfileData();
        
        this.core.showNotification('success', 'Changes discarded');
    }
    
    async savePersonalInfo() {
        try {
            this.core.showNotification('info', 'Saving personal information...');
            
            // Simulate save
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update profile data
            this.updateProfileFromForms();
            
            // Save to Firebase if available
            if (this.core.currentUser && this.core.updateDoc) {
                const profileRef = this.core.doc(this.core.db, 'user_profiles', this.core.currentUser.uid);
                await this.core.updateDoc(profileRef, {
                    ...this.core.profileData,
                    lastUpdated: this.core.serverTimestamp()
                });
            }
            
            this.core.updateOverviewStats();
            this.core.renderProfileData();
            this.core.showNotification('success', 'Personal information saved successfully');
            
        } catch (error) {
            console.error('Error saving personal info:', error);
            this.core.showNotification('error', 'Failed to save personal information');
        }
    }
    
    async resetPreferences() {
        if (!confirm('Are you sure you want to reset your preferences to default values?')) {
            return;
        }
        
        try {
            this.core.showNotification('info', 'Resetting preferences...');
            
            // Simulate reset
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Reset preferences to default
            this.core.profileData.preferences = {
                defaultLanguage: 'en',
                timeZone: 'Asia/Phnom_Penh',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                theme: 'light',
                notifications: 'all'
            };
            
            this.core.updateFormFields();
            this.core.updateOverviewStats();
            this.core.showNotification('success', 'Preferences reset successfully');
            
        } catch (error) {
            console.error('Error resetting preferences:', error);
            this.core.showNotification('error', 'Failed to reset preferences');
        }
    }
    
    async savePreferences() {
        try {
            this.core.showNotification('info', 'Saving preferences...');
            
            // Simulate save
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update preferences
            this.core.profileData.preferences = {
                defaultLanguage: document.getElementById('defaultLanguage').value,
                timeZone: document.getElementById('timeZone').value,
                dateFormat: document.getElementById('dateFormat').value,
                timeFormat: document.getElementById('timeFormat').value,
                theme: document.getElementById('theme').value,
                notifications: document.getElementById('notifications').value
            };
            
            // Save to Firebase if available
            if (this.core.currentUser && this.core.updateDoc) {
                const profileRef = this.core.doc(this.core.db, 'user_profiles', this.core.currentUser.uid);
                await this.core.updateDoc(profileRef, {
                    preferences: this.core.profileData.preferences,
                    lastUpdated: this.core.serverTimestamp()
                });
            }
            
            this.core.updateOverviewStats();
            this.core.showNotification('success', 'Preferences saved successfully');
            
        } catch (error) {
            console.error('Error saving preferences:', error);
            this.core.showNotification('error', 'Failed to save preferences');
        }
    }
    
    async configureSecurity(settingId) {
        const setting = this.core.securitySettings.find(s => s.id === settingId);
        if (!setting) return;
        
        this.core.showNotification('info', `Opening configuration for ${setting.name}...`);
        
        // Simulate configuration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.showSecurityConfigurationModal(setting);
    }
    
    showSecurityConfigurationModal(setting) {
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
                        ${setting.name}
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
                            ${setting.description}
                        </p>
                        
                        <div style="background: var(--neutral-50); padding: var(--space-4); border-radius: var(--radius-lg);">
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Current Settings
                            </h4>
                            ${Object.entries(setting.settings).map(([key, value]) => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) 0; border-bottom: 1px solid var(--neutral-200);">
                                    <span style="color: var(--neutral-700); font-size: var(--text-sm);">${this.formatSettingKey(key)}:</span>
                                    <span style="color: var(--neutral-900); font-weight: 500; font-size: var(--text-sm);">${value}</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--neutral-200);">
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Configuration Options
                            </h4>
                            <p style="color: var(--neutral-600); font-size: var(--text-sm);">
                                Advanced configuration options are available through the system settings panel. 
                                Contact your system administrator for detailed configuration changes.
                            </p>
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
    
    formatSettingKey(key) {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
    
    async toggleSecurity(settingId) {
        const setting = this.core.securitySettings.find(s => s.id === settingId);
        if (!setting) return;
        
        const action = setting.isEnabled ? 'disable' : 'enable';
        
        if (!confirm(`Are you sure you want to ${action} "${setting.name}"?`)) {
            return;
        }
        
        try {
            this.core.showNotification('info', `${action.charAt(0).toUpperCase() + action.slice(1)}ing ${setting.name}...`);
            
            // Simulate toggle
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setting.isEnabled = !setting.isEnabled;
            setting.lastUpdated = new Date();
            
            this.core.updateOverviewStats();
            this.core.renderSecuritySettings();
            this.core.showNotification('success', `${setting.name} ${action}d successfully`);
            
        } catch (error) {
            console.error('Error toggling security setting:', error);
            this.core.showNotification('error', `Failed to ${action} security setting`);
        }
    }
}

// Initialize actions when core is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.profileManagementCore) {
            window.profileManagementActions = new ProfileManagementActions(window.profileManagementCore);
            
            // Override core methods with actions
            window.profileManagementCore.exportProfile = () => window.profileManagementActions.exportProfile();
            window.profileManagementCore.saveProfile = () => window.profileManagementActions.saveProfile();
            window.profileManagementCore.refreshProfile = () => window.profileManagementActions.refreshProfile();
            window.profileManagementCore.resetProfile = () => window.profileManagementActions.resetProfile();
            window.profileManagementCore.switchTab = (tabName) => window.profileManagementActions.switchTab(tabName);
            window.profileManagementCore.uploadAvatar = () => window.profileManagementActions.uploadAvatar();
            window.profileManagementCore.cancelChanges = () => window.profileManagementActions.cancelChanges();
            window.profileManagementCore.savePersonalInfo = () => window.profileManagementActions.savePersonalInfo();
            window.profileManagementCore.resetPreferences = () => window.profileManagementActions.resetPreferences();
            window.profileManagementCore.savePreferences = () => window.profileManagementActions.savePreferences();
            window.profileManagementCore.configureSecurity = (settingId) => window.profileManagementActions.configureSecurity(settingId);
            window.profileManagementCore.toggleSecurity = (settingId) => window.profileManagementActions.toggleSecurity(settingId);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileManagementActions;
}
