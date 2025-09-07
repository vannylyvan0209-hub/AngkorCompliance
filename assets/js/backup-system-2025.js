/**
 * Backup System 2025 - JavaScript
 * Backup and rollback system for design system changes
 */

class BackupSystem2025 {
    constructor() {
        this.backups = [];
        this.currentBackup = null;
        this.isBackingUp = false;
        this.isRestoring = false;
        this.init();
    }

    init() {
        this.loadBackups();
        this.createBackupDashboard();
        this.setupEventListeners();
        this.setupAutoBackup();
    }

    loadBackups() {
        const savedBackups = localStorage.getItem('design-system-backups');
        if (savedBackups) {
            this.backups = JSON.parse(savedBackups);
        }
    }

    saveBackups() {
        localStorage.setItem('design-system-backups', JSON.stringify(this.backups));
    }

    createBackupDashboard() {
        const dashboard = document.createElement('div');
        dashboard.className = 'backup-dashboard';
        dashboard.innerHTML = `
            <div class="backup-header">
                <h2 class="backup-title">Design System Backups</h2>
                <div class="backup-controls">
                    <button class="backup-button" id="createBackup">
                        <i data-lucide="save" class="icon"></i>
                        Create Backup
                    </button>
                    <button class="backup-button" id="restoreBackup">
                        <i data-lucide="rotate-ccw" class="icon"></i>
                        Restore
                    </button>
                </div>
            </div>
            
            <div class="backup-status" id="backupStatus" style="display: none;">
                <i data-lucide="info" class="icon"></i>
                <span>Backup system ready</span>
            </div>
            
            <div class="backup-progress" id="backupProgress" style="display: none;">
                <div class="backup-progress-header">
                    <h3 class="backup-progress-title">Backup Progress</h3>
                    <span class="backup-progress-percentage">0%</span>
                </div>
                <div class="backup-progress-bar">
                    <div class="backup-progress-fill"></div>
                </div>
                <div class="backup-progress-message">Preparing backup...</div>
            </div>
            
            <div class="backup-list">
                <div class="backup-list-header">
                    <h3 class="backup-list-title">Available Backups</h3>
                    <div class="backup-list-controls">
                        <button class="backup-list-control active" data-filter="all">All</button>
                        <button class="backup-list-control" data-filter="recent">Recent</button>
                        <button class="backup-list-control" data-filter="manual">Manual</button>
                        <button class="backup-list-control" data-filter="auto">Auto</button>
                    </div>
                </div>
                <ul class="backup-items" id="backupItems">
                    <!-- Backup items will be populated here -->
                </ul>
            </div>
        `;
        
        document.body.appendChild(dashboard);
        lucide.createIcons();
        this.updateBackupList();
    }

    setupEventListeners() {
        // Create backup button
        document.getElementById('createBackup').addEventListener('click', () => {
            this.showCreateBackupModal();
        });

        // Restore backup button
        document.getElementById('restoreBackup').addEventListener('click', () => {
            this.showRestoreBackupModal();
        });

        // Filter controls
        document.querySelectorAll('.backup-list-control').forEach(control => {
            control.addEventListener('click', (e) => {
                document.querySelectorAll('.backup-list-control').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.filterBackups(e.target.dataset.filter);
            });
        });
    }

    setupAutoBackup() {
        // Create automatic backup every hour
        setInterval(() => {
            this.createAutoBackup();
        }, 60 * 60 * 1000); // 1 hour

        // Create backup on page load if none exists
        if (this.backups.length === 0) {
            this.createAutoBackup();
        }
    }

    async createBackup(name, description, type = 'manual') {
        if (this.isBackingUp) return;

        this.isBackup = true;
        this.showBackupProgress();

        try {
            const backup = {
                id: Date.now().toString(),
                name: name || `Backup ${new Date().toLocaleString()}`,
                description: description || 'Manual backup',
                type: type,
                timestamp: new Date().toISOString(),
                data: await this.captureCurrentState(),
                version: this.getCurrentVersion()
            };

            this.backups.unshift(backup);
            
            // Keep only last 10 backups
            if (this.backups.length > 10) {
                this.backups = this.backups.slice(0, 10);
            }

            this.saveBackups();
            this.updateBackupList();
            this.showBackupStatus('success', 'Backup created successfully');
            
            return backup;
        } catch (error) {
            this.showBackupStatus('error', 'Failed to create backup: ' + error.message);
            throw error;
        } finally {
            this.isBackingUp = false;
            this.hideBackupProgress();
        }
    }

    async createAutoBackup() {
        try {
            await this.createBackup(
                `Auto Backup ${new Date().toLocaleString()}`,
                'Automatic backup',
                'auto'
            );
        } catch (error) {
            console.error('Auto backup failed:', error);
        }
    }

    async restoreBackup(backupId) {
        if (this.isRestoring) return;

        const backup = this.backups.find(b => b.id === backupId);
        if (!backup) {
            throw new Error('Backup not found');
        }

        this.isRestoring = true;
        this.showBackupProgress();

        try {
            await this.applyBackup(backup);
            this.showBackupStatus('success', 'Backup restored successfully');
        } catch (error) {
            this.showBackupStatus('error', 'Failed to restore backup: ' + error.message);
            throw error;
        } finally {
            this.isRestoring = false;
            this.hideBackupProgress();
        }
    }

    async captureCurrentState() {
        const state = {
            css: {},
            html: {},
            js: {},
            settings: {}
        };

        // Capture CSS files
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        for (const link of cssLinks) {
            try {
                const response = await fetch(link.href);
                const css = await response.text();
                state.css[link.href] = css;
            } catch (error) {
                console.warn('Failed to capture CSS:', link.href);
            }
        }

        // Capture HTML structure
        state.html = {
            title: document.title,
            body: document.body.innerHTML,
            head: document.head.innerHTML
        };

        // Capture JavaScript state
        state.js = {
            localStorage: { ...localStorage },
            sessionStorage: { ...sessionStorage }
        };

        // Capture design system settings
        state.settings = {
            currentRole: document.body.className,
            theme: localStorage.getItem('theme'),
            language: localStorage.getItem('preferred-language')
        };

        return state;
    }

    async applyBackup(backup) {
        const state = backup.data;

        // Restore CSS files
        for (const [url, css] of Object.entries(state.css)) {
            const link = document.querySelector(`link[href="${url}"]`);
            if (link) {
                // Create a new link element with the backup CSS
                const newLink = document.createElement('link');
                newLink.rel = 'stylesheet';
                newLink.href = 'data:text/css;base64,' + btoa(css);
                link.parentNode.replaceChild(newLink, link);
            }
        }

        // Restore HTML structure
        if (state.html) {
            document.title = state.html.title;
            document.body.innerHTML = state.html.body;
        }

        // Restore JavaScript state
        if (state.js) {
            // Clear current storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Restore backup storage
            for (const [key, value] of Object.entries(state.js.localStorage)) {
                localStorage.setItem(key, value);
            }
            for (const [key, value] of Object.entries(state.js.sessionStorage)) {
                sessionStorage.setItem(key, value);
            }
        }

        // Restore settings
        if (state.settings) {
            document.body.className = state.settings.currentRole || '';
            if (state.settings.theme) {
                localStorage.setItem('theme', state.settings.theme);
            }
            if (state.settings.language) {
                localStorage.setItem('preferred-language', state.settings.language);
            }
        }

        // Reinitialize components
        this.reinitializeComponents();
    }

    reinitializeComponents() {
        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Reinitialize AOS
        if (window.AOS) {
            AOS.init();
        }

        // Reinitialize other components
        if (window.roleSwitching) {
            window.roleSwitching.init();
        }

        if (window.darkMode) {
            window.darkMode.init();
        }
    }

    getCurrentVersion() {
        return '2025.1.0'; // This should be dynamically determined
    }

    showBackupProgress() {
        const progress = document.getElementById('backupProgress');
        if (progress) {
            progress.style.display = 'block';
            this.updateProgress(0, 'Preparing backup...');
        }
    }

    hideBackupProgress() {
        const progress = document.getElementById('backupProgress');
        if (progress) {
            progress.style.display = 'none';
        }
    }

    updateProgress(percentage, message) {
        const progressFill = document.querySelector('.backup-progress-fill');
        const progressPercentage = document.querySelector('.backup-progress-percentage');
        const progressMessage = document.querySelector('.backup-progress-message');

        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
        if (progressPercentage) {
            progressPercentage.textContent = percentage + '%';
        }
        if (progressMessage) {
            progressMessage.textContent = message;
        }
    }

    showBackupStatus(type, message) {
        const status = document.getElementById('backupStatus');
        if (status) {
            status.className = `backup-status ${type}`;
            status.querySelector('span').textContent = message;
            status.style.display = 'flex';
            
            setTimeout(() => {
                status.style.display = 'none';
            }, 5000);
        }
    }

    updateBackupList() {
        const container = document.getElementById('backupItems');
        if (!container) return;

        if (this.backups.length === 0) {
            container.innerHTML = '<li class="backup-item"><span>No backups available</span></li>';
            return;
        }

        let html = '';
        this.backups.forEach(backup => {
            const date = new Date(backup.timestamp);
            const isCurrent = backup.id === this.currentBackup?.id;
            
            html += `
                <li class="backup-item ${isCurrent ? 'current' : ''}">
                    <div class="backup-item-info">
                        <h4 class="backup-item-name">${backup.name}</h4>
                        <p class="backup-item-description">${backup.description}</p>
                        <div class="backup-item-meta">
                            <span>${date.toLocaleString()}</span>
                            <span>•</span>
                            <span>${backup.type}</span>
                            <span>•</span>
                            <span>v${backup.version}</span>
                        </div>
                    </div>
                    <div class="backup-item-actions">
                        <button class="backup-item-action primary" onclick="window.backupSystem.restoreBackup('${backup.id}')">
                            Restore
                        </button>
                        <button class="backup-item-action" onclick="window.backupSystem.downloadBackup('${backup.id}')">
                            Download
                        </button>
                        <button class="backup-item-action danger" onclick="window.backupSystem.deleteBackup('${backup.id}')">
                            Delete
                        </button>
                    </div>
                </li>
            `;
        });

        container.innerHTML = html;
    }

    filterBackups(filter) {
        const items = document.querySelectorAll('.backup-item');
        items.forEach(item => {
            const backup = this.backups.find(b => b.id === item.dataset.backupId);
            if (!backup) return;

            let show = true;
            switch (filter) {
                case 'recent':
                    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    show = new Date(backup.timestamp) > oneDayAgo;
                    break;
                case 'manual':
                    show = backup.type === 'manual';
                    break;
                case 'auto':
                    show = backup.type === 'auto';
                    break;
                case 'all':
                default:
                    show = true;
                    break;
            }

            item.style.display = show ? 'flex' : 'none';
        });
    }

    showCreateBackupModal() {
        const modal = document.createElement('div');
        modal.className = 'backup-modal';
        modal.innerHTML = `
            <div class="content">
                <div class="header">
                    <h3 class="title">Create Backup</h3>
                    <button class="close" onclick="this.closest('.backup-modal').remove()">
                        <i data-lucide="x" class="icon"></i>
                    </button>
                </div>
                <div class="body">
                    <div class="form-group">
                        <label class="form-label">Backup Name</label>
                        <input type="text" class="form-input" id="backupName" placeholder="Enter backup name">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-textarea" id="backupDescription" placeholder="Enter backup description"></textarea>
                    </div>
                </div>
                <div class="footer">
                    <button class="btn btn-secondary" onclick="this.closest('.backup-modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="window.backupSystem.createBackupFromModal()">Create Backup</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        lucide.createIcons();
        
        setTimeout(() => modal.classList.add('show'), 100);
    }

    showRestoreBackupModal() {
        if (this.backups.length === 0) {
            this.showBackupStatus('warning', 'No backups available to restore');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'backup-modal';
        modal.innerHTML = `
            <div class="content">
                <div class="header">
                    <h3 class="title">Restore Backup</h3>
                    <button class="close" onclick="this.closest('.backup-modal').remove()">
                        <i data-lucide="x" class="icon"></i>
                    </button>
                </div>
                <div class="body">
                    <div class="form-group">
                        <label class="form-label">Select Backup</label>
                        <select class="form-input" id="restoreBackupSelect">
                            ${this.backups.map(backup => `
                                <option value="${backup.id}">${backup.name} - ${new Date(backup.timestamp).toLocaleString()}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Warning</label>
                        <p style="color: var(--warning-600); font-size: var(--text-sm);">
                            Restoring a backup will replace the current design system state. This action cannot be undone.
                        </p>
                    </div>
                </div>
                <div class="footer">
                    <button class="btn btn-secondary" onclick="this.closest('.backup-modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="window.backupSystem.restoreBackupFromModal()">Restore Backup</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        lucide.createIcons();
        
        setTimeout(() => modal.classList.add('show'), 100);
    }

    async createBackupFromModal() {
        const name = document.getElementById('backupName').value;
        const description = document.getElementById('backupDescription').value;
        
        try {
            await this.createBackup(name, description);
            document.querySelector('.backup-modal').remove();
        } catch (error) {
            console.error('Failed to create backup:', error);
        }
    }

    async restoreBackupFromModal() {
        const backupId = document.getElementById('restoreBackupSelect').value;
        
        try {
            await this.restoreBackup(backupId);
            document.querySelector('.backup-modal').remove();
        } catch (error) {
            console.error('Failed to restore backup:', error);
        }
    }

    async downloadBackup(backupId) {
        const backup = this.backups.find(b => b.id === backupId);
        if (!backup) return;

        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-${backup.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    deleteBackup(backupId) {
        if (confirm('Are you sure you want to delete this backup?')) {
            this.backups = this.backups.filter(b => b.id !== backupId);
            this.saveBackups();
            this.updateBackupList();
            this.showBackupStatus('success', 'Backup deleted successfully');
        }
    }

    // Public API methods
    getBackups() {
        return this.backups;
    }

    getCurrentBackup() {
        return this.currentBackup;
    }

    exportAllBackups() {
        const dataStr = JSON.stringify(this.backups, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `all-backups-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Initialize backup system
document.addEventListener('DOMContentLoaded', () => {
    window.backupSystem = new BackupSystem2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackupSystem2025;
}
