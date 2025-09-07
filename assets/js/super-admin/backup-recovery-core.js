// Backup & Recovery Core System for Super Admin
class BackupRecoveryCore {
    constructor() {
        this.currentUser = null;
        this.backups = [];
        this.recoveryOptions = {};
        this.disasterRecovery = {};
        this.selectedRecoveryOption = 'full';
        this.init();
    }
    
    async init() {
        console.log('💾 Initializing Backup & Recovery Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ Backup & Recovery Core initialized');
    }
    
    async initializeFirebase() {
        try {
            if (window.Firebase) {
                this.auth = window.Firebase.auth;
                this.db = window.Firebase.db;
                this.doc = window.Firebase.doc;
                this.getDoc = window.Firebase.getDoc;
                this.collection = window.Firebase.collection;
                this.addDoc = window.Firebase.addDoc;
                this.updateDoc = window.Firebase.updateDoc;
                this.deleteDoc = window.Firebase.deleteDoc;
                this.query = window.Firebase.query;
                this.where = window.Firebase.where;
                this.orderBy = window.Firebase.orderBy;
                this.onSnapshot = window.Firebase.onSnapshot;
                this.getDocs = window.Firebase.getDocs;
                this.serverTimestamp = window.Firebase.serverTimestamp;
                console.log('✓ Firebase initialized successfully');
                return true;
            } else {
                console.log('⚠ Firebase not available, using local mode');
                return false;
            }
        } catch (error) {
            console.error('✗ Error initializing Firebase:', error);
            return false;
        }
    }
    
    async checkAuthentication() {
        return new Promise((resolve) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        const userDocRef = this.doc(this.db, 'users', user.uid);
                        const userDoc = await this.getDoc(userDocRef);
                        
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            if (userData.role === 'super_admin') {
                                this.currentUser = { ...user, ...userData };
                                resolve();
                            } else {
                                console.log('❌ Access denied - super admin privileges required');
                                window.location.href = '../../login.html';
                            }
                        } else {
                            console.log('❌ User profile not found');
                            window.location.href = '../../login.html';
                        }
                    } catch (error) {
                        console.error('Error checking authentication:', error);
                        window.location.href = '../../login.html';
                    }
                } else {
                    console.log('❌ No authenticated user');
                    window.location.href = '../../login.html';
                }
            });
        });
    }
    
    initializeNavigation() {
        if (window.superAdminNavigation) {
            window.superAdminNavigation.updateCurrentPage('Backup & Recovery');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadBackups(),
            this.loadRecoveryOptions(),
            this.loadDisasterRecovery()
        ]);
        this.updateBackupStatus();
        this.renderBackups();
        this.updateRecoveryDetails();
    }
    
    async loadBackups() {
        try {
            const backupsRef = this.collection(this.db, 'backups');
            const snapshot = await this.getDocs(backupsRef);
            this.backups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (this.backups.length === 0) {
                this.backups = this.getMockBackups();
            }
            console.log(`✓ Loaded ${this.backups.length} backups`);
        } catch (error) {
            console.error('Error loading backups:', error);
            this.backups = this.getMockBackups();
        }
    }
    
    async loadRecoveryOptions() {
        try {
            const recoveryRef = this.collection(this.db, 'recovery_options');
            const snapshot = await this.getDocs(recoveryRef);
            this.recoveryOptions = {};
            snapshot.docs.forEach(doc => {
                this.recoveryOptions[doc.id] = doc.data();
            });
            console.log('✓ Loaded recovery options');
        } catch (error) {
            console.error('Error loading recovery options:', error);
            this.recoveryOptions = this.getMockRecoveryOptions();
        }
    }
    
    async loadDisasterRecovery() {
        try {
            const disasterRef = this.collection(this.db, 'disaster_recovery');
            const snapshot = await this.getDocs(disasterRef);
            this.disasterRecovery = {};
            snapshot.docs.forEach(doc => {
                this.disasterRecovery[doc.id] = doc.data();
            });
            console.log('✓ Loaded disaster recovery data');
        } catch (error) {
            console.error('Error loading disaster recovery data:', error);
            this.disasterRecovery = this.getMockDisasterRecovery();
        }
    }
    
    getMockBackups() {
        const now = new Date();
        const statuses = ['completed', 'in-progress', 'failed', 'scheduled'];
        const types = ['full', 'incremental', 'differential'];
        
        return Array.from({ length: 8 }, (_, i) => {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            const size = Math.floor(Math.random() * 500) + 100;
            
            return {
                id: `backup_${i}`,
                name: `${type.charAt(0).toUpperCase() + type.slice(1)} Backup ${i + 1}`,
                type: type,
                status: status,
                size: size,
                createdAt: new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)),
                completedAt: status === 'completed' ? new Date(now.getTime() - (i * 24 * 60 * 60 * 1000) + 3600000) : null,
                retentionDays: 30,
                location: 'AWS S3',
                checksum: `sha256:${Math.random().toString(36).substring(2, 15)}`
            };
        });
    }
    
    getMockRecoveryOptions() {
        return {
            full: {
                type: 'Full System Recovery',
                estimatedTime: '2-4 hours',
                dataSize: '1.2 TB',
                lastTested: '3 days ago',
                successRate: '100%'
            },
            partial: {
                type: 'Partial Recovery',
                estimatedTime: '30-60 minutes',
                dataSize: '500 GB',
                lastTested: '1 week ago',
                successRate: '98%'
            },
            'point-in-time': {
                type: 'Point-in-Time Recovery',
                estimatedTime: '1-2 hours',
                dataSize: '800 GB',
                lastTested: '2 days ago',
                successRate: '99%'
            }
        };
    }
    
    getMockDisasterRecovery() {
        return {
            emergency: { status: 'ready', lastTested: '1 week ago', estimatedRecoveryTime: '4-6 hours' },
            failover: { status: 'ready', lastTested: '3 days ago', estimatedFailoverTime: '15-30 minutes' },
            systemRestore: { status: 'ready', lastTested: '5 days ago', estimatedRestoreTime: '2-3 hours' },
            businessContinuity: { status: 'ready', lastTested: '2 weeks ago', estimatedActivationTime: '1-2 hours' }
        };
    }
    
    updateBackupStatus() {
        const totalSize = this.backups.reduce((sum, backup) => sum + (backup.size || 0), 0);
        document.getElementById('backupStorage').textContent = `${(totalSize / 1024).toFixed(1)} TB`;
        
        const lastBackup = this.backups
            .filter(b => b.status === 'completed')
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
        
        if (lastBackup) {
            const timeDiff = new Date() - new Date(lastBackup.completedAt);
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            document.getElementById('lastBackup').textContent = hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
        } else {
            document.getElementById('lastBackup').textContent = 'Never';
        }
        
        document.getElementById('retentionPolicy').textContent = '30 days';
        
        const successfulTests = this.backups.filter(b => b.status === 'completed').length;
        document.getElementById('recoveryTests').textContent = `${successfulTests}/${this.backups.length}`;
    }
    
    renderBackups() {
        const backupGrid = document.getElementById('backupGrid');
        if (!backupGrid) return;
        
        const sortedBackups = this.backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        backupGrid.innerHTML = sortedBackups.map(backup => `
            <div class="backup-item">
                <div class="backup-header">
                    <div class="backup-name">${backup.name}</div>
                    <div class="backup-status ${backup.status}">${backup.status}</div>
                </div>
                <div class="backup-details">
                    <div class="backup-detail">
                        <div class="backup-detail-label">Type</div>
                        <div class="backup-detail-value">${this.capitalizeFirst(backup.type)}</div>
                    </div>
                    <div class="backup-detail">
                        <div class="backup-detail-label">Size</div>
                        <div class="backup-detail-value">${backup.size} MB</div>
                    </div>
                    <div class="backup-detail">
                        <div class="backup-detail-label">Created</div>
                        <div class="backup-detail-value">${this.formatDate(backup.createdAt)}</div>
                    </div>
                    <div class="backup-detail">
                        <div class="backup-detail-label">Location</div>
                        <div class="backup-detail-value">${backup.location}</div>
                    </div>
                </div>
                <div class="backup-actions">
                    <button class="backup-action-btn" onclick="restoreBackup('${backup.id}')">
                        <i data-lucide="download"></i>
                        Restore
                    </button>
                    <button class="backup-action-btn" onclick="testBackup('${backup.id}')">
                        <i data-lucide="play"></i>
                        Test
                    </button>
                    <button class="backup-action-btn danger" onclick="deleteBackup('${backup.id}')">
                        <i data-lucide="trash-2"></i>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    updateRecoveryDetails() {
        const option = this.recoveryOptions[this.selectedRecoveryOption];
        if (!option) return;
        
        document.getElementById('recoveryType').textContent = option.type;
        document.getElementById('recoveryTime').textContent = option.estimatedTime;
        document.getElementById('recoverySize').textContent = option.dataSize;
        document.getElementById('lastTested').textContent = option.lastTested;
        document.getElementById('successRate').textContent = option.successRate;
    }
    
    initializeUI() {
        // Initialize any UI components
    }
    
    setupEventListeners() {
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        window.createBackup = () => this.createBackup();
        window.testRecovery = () => this.testRecovery();
        window.scheduleBackup = () => this.scheduleBackup();
        window.configureBackup = () => this.configureBackup();
        window.selectRecoveryOption = (option) => this.selectRecoveryOption(option);
        window.restoreBackup = (backupId) => this.restoreBackup(backupId);
        window.testBackup = (backupId) => this.testBackup(backupId);
        window.deleteBackup = (backupId) => this.deleteBackup(backupId);
        window.initiateEmergencyRecovery = () => this.initiateEmergencyRecovery();
        window.initiateFailover = () => this.initiateFailover();
        window.initiateSystemRestore = () => this.initiateSystemRestore();
        window.activateBusinessContinuity = () => this.activateBusinessContinuity();
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const backupsRef = this.collection(this.db, 'backups');
        this.onSnapshot(backupsRef, (snapshot) => {
            this.backups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateBackupStatus();
            this.renderBackups();
        });
    }
    
    // Utility methods
    formatDate(date) {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString();
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-500)' : 
                        type === 'error' ? 'var(--error-500)' : 
                        type === 'warning' ? 'var(--warning-500)' : 'var(--info-500)'};
            color: white;
            padding: var(--space-4);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    window.backupRecoveryCore = new BackupRecoveryCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackupRecoveryCore;
}
