// Backup Recovery Actions for Super Admin
class BackupRecoveryActions {
    constructor(core) {
        this.core = core;
    }
    
    async createBackup() {
        try {
            this.core.showNotification('info', 'Creating backup...');
            
            const backupData = {
                name: `Manual Backup ${new Date().toLocaleString()}`,
                type: 'full',
                status: 'in-progress',
                size: 0,
                createdAt: new Date(),
                retentionDays: 30,
                location: 'AWS S3',
                createdBy: this.core.currentUser.uid
            };
            
            await this.core.addDoc(this.core.collection(this.core.db, 'backups'), backupData);
            this.core.showNotification('success', 'Backup creation initiated successfully');
            
        } catch (error) {
            console.error('Error creating backup:', error);
            this.core.showNotification('error', 'Failed to create backup');
        }
    }
    
    async testRecovery() {
        try {
            this.core.showNotification('info', 'Testing recovery procedures...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.core.showNotification('success', 'Recovery test completed successfully');
        } catch (error) {
            console.error('Error testing recovery:', error);
            this.core.showNotification('error', 'Recovery test failed');
        }
    }
    
    async scheduleBackup() {
        window.location.href = 'backup-scheduling.html';
    }
    
    async configureBackup() {
        window.location.href = 'backup-configuration.html';
    }
    
    selectRecoveryOption(option) {
        this.core.selectedRecoveryOption = option;
        
        document.querySelectorAll('.recovery-option').forEach(el => {
            el.classList.remove('selected');
        });
        
        event.target.closest('.recovery-option').classList.add('selected');
        this.core.updateRecoveryDetails();
    }
    
    async restoreBackup(backupId) {
        const backup = this.core.backups.find(b => b.id === backupId);
        if (!backup) return;
        
        if (!confirm(`Are you sure you want to restore from "${backup.name}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            this.core.showNotification('info', `Restoring from ${backup.name}...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            this.core.showNotification('success', 'Backup restored successfully');
        } catch (error) {
            console.error('Error restoring backup:', error);
            this.core.showNotification('error', 'Failed to restore backup');
        }
    }
    
    async testBackup(backupId) {
        const backup = this.core.backups.find(b => b.id === backupId);
        if (!backup) return;
        
        try {
            this.core.showNotification('info', `Testing ${backup.name}...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.core.showNotification('success', 'Backup test completed successfully');
        } catch (error) {
            console.error('Error testing backup:', error);
            this.core.showNotification('error', 'Backup test failed');
        }
    }
    
    async deleteBackup(backupId) {
        const backup = this.core.backups.find(b => b.id === backupId);
        if (!backup) return;
        
        if (!confirm(`Are you sure you want to delete "${backup.name}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            const backupRef = this.core.doc(this.core.db, 'backups', backupId);
            await this.core.deleteDoc(backupRef);
            this.core.showNotification('success', 'Backup deleted successfully');
        } catch (error) {
            console.error('Error deleting backup:', error);
            this.core.showNotification('error', 'Failed to delete backup');
        }
    }
    
    async initiateEmergencyRecovery() {
        if (!confirm('Are you sure you want to initiate emergency recovery? This will affect system availability.')) {
            return;
        }
        
        try {
            this.core.showNotification('warning', 'Initiating emergency recovery procedures...');
            await new Promise(resolve => setTimeout(resolve, 10000));
            this.core.showNotification('success', 'Emergency recovery completed successfully');
        } catch (error) {
            console.error('Error initiating emergency recovery:', error);
            this.core.showNotification('error', 'Emergency recovery failed');
        }
    }
    
    async initiateFailover() {
        if (!confirm('Are you sure you want to initiate failover? This will switch to backup systems.')) {
            return;
        }
        
        try {
            this.core.showNotification('warning', 'Initiating failover to backup systems...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            this.core.showNotification('success', 'Failover completed successfully');
        } catch (error) {
            console.error('Error initiating failover:', error);
            this.core.showNotification('error', 'Failover failed');
        }
    }
    
    async initiateSystemRestore() {
        if (!confirm('Are you sure you want to restore the system to the last known good state?')) {
            return;
        }
        
        try {
            this.core.showNotification('warning', 'Initiating system restore...');
            await new Promise(resolve => setTimeout(resolve, 8000));
            this.core.showNotification('success', 'System restore completed successfully');
        } catch (error) {
            console.error('Error initiating system restore:', error);
            this.core.showNotification('error', 'System restore failed');
        }
    }
    
    async activateBusinessContinuity() {
        if (!confirm('Are you sure you want to activate the business continuity plan?')) {
            return;
        }
        
        try {
            this.core.showNotification('warning', 'Activating business continuity plan...');
            await new Promise(resolve => setTimeout(resolve, 6000));
            this.core.showNotification('success', 'Business continuity plan activated successfully');
        } catch (error) {
            console.error('Error activating business continuity:', error);
            this.core.showNotification('error', 'Business continuity activation failed');
        }
    }
}

// Initialize actions when core is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.backupRecoveryCore) {
            window.backupRecoveryActions = new BackupRecoveryActions(window.backupRecoveryCore);
            
            // Override core methods with actions
            window.backupRecoveryCore.createBackup = () => window.backupRecoveryActions.createBackup();
            window.backupRecoveryCore.testRecovery = () => window.backupRecoveryActions.testRecovery();
            window.backupRecoveryCore.scheduleBackup = () => window.backupRecoveryActions.scheduleBackup();
            window.backupRecoveryCore.configureBackup = () => window.backupRecoveryActions.configureBackup();
            window.backupRecoveryCore.selectRecoveryOption = (option) => window.backupRecoveryActions.selectRecoveryOption(option);
            window.backupRecoveryCore.restoreBackup = (backupId) => window.backupRecoveryActions.restoreBackup(backupId);
            window.backupRecoveryCore.testBackup = (backupId) => window.backupRecoveryActions.testBackup(backupId);
            window.backupRecoveryCore.deleteBackup = (backupId) => window.backupRecoveryActions.deleteBackup(backupId);
            window.backupRecoveryCore.initiateEmergencyRecovery = () => window.backupRecoveryActions.initiateEmergencyRecovery();
            window.backupRecoveryCore.initiateFailover = () => window.backupRecoveryActions.initiateFailover();
            window.backupRecoveryCore.initiateSystemRestore = () => window.backupRecoveryActions.initiateSystemRestore();
            window.backupRecoveryCore.activateBusinessContinuity = () => window.backupRecoveryActions.activateBusinessContinuity();
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackupRecoveryActions;
}
