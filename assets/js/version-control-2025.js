/**
 * Version Control 2025 - JavaScript
 * Version control system for design system components
 */

class VersionControl2025 {
    constructor() {
        this.currentVersion = '2025.1.0';
        this.versions = [];
        this.changes = [];
        this.isVersioning = false;
        this.init();
    }

    init() {
        this.loadVersions();
        this.createVersionControlDashboard();
        this.setupEventListeners();
        this.setupVersionTracking();
    }

    loadVersions() {
        const savedVersions = localStorage.getItem('design-system-versions');
        if (savedVersions) {
            this.versions = JSON.parse(savedVersions);
        } else {
            // Create initial version
            this.createInitialVersion();
        }
    }

    saveVersions() {
        localStorage.setItem('design-system-versions', JSON.stringify(this.versions));
    }

    createInitialVersion() {
        const initialVersion = {
            id: '2025.1.0',
            version: '2025.1.0',
            type: 'major',
            description: 'Initial 2025 design system release',
            changes: [
                'Implemented 2025 design system',
                'Added role-based theming',
                'Added glassmorphism effects',
                'Added neumorphism components',
                'Added micro-interactions',
                'Added responsive design',
                'Added dark mode support',
                'Added accessibility features',
                'Added PWA features',
                'Added internationalization support'
            ],
            timestamp: new Date().toISOString(),
            author: 'System',
            status: 'stable',
            components: this.getComponentList()
        };
        
        this.versions.push(initialVersion);
        this.saveVersions();
    }

    createVersionControlDashboard() {
        const dashboard = document.createElement('div');
        dashboard.className = 'version-control-dashboard';
        dashboard.innerHTML = `
            <div class="version-control-header">
                <h2 class="version-control-title">Version Control</h2>
                <div class="version-control-actions">
                    <button class="version-control-action" id="createVersion">
                        <i data-lucide="plus" class="icon"></i>
                        New Version
                    </button>
                    <button class="version-control-action" id="compareVersions">
                        <i data-lucide="git-compare" class="icon"></i>
                        Compare
                    </button>
                </div>
            </div>
            
            <div class="version-status" id="versionStatus" style="display: none;">
                <i data-lucide="info" class="icon"></i>
                <span>Version control system ready</span>
            </div>
            
            <div class="version-info">
                <div class="version-info-header">
                    <h3 class="version-info-title">Current Version</h3>
                    <span class="version-info-badge" id="versionBadge">Stable</span>
                </div>
                <div class="version-info-content">
                    <div class="version-info-item">
                        <div class="version-info-label">Version</div>
                        <div class="version-info-value" id="currentVersion">${this.currentVersion}</div>
                    </div>
                    <div class="version-info-item">
                        <div class="version-info-label">Components</div>
                        <div class="version-info-value" id="componentCount">0</div>
                    </div>
                    <div class="version-info-item">
                        <div class="version-info-label">Last Updated</div>
                        <div class="version-info-value" id="lastUpdated">-</div>
                    </div>
                    <div class="version-info-item">
                        <div class="version-info-label">Status</div>
                        <div class="version-info-value" id="versionStatus">Stable</div>
                    </div>
                </div>
            </div>
            
            <div class="version-history">
                <div class="version-history-header">
                    <h3 class="version-history-title">Version History</h3>
                    <div class="version-history-controls">
                        <button class="version-history-control active" data-filter="all">All</button>
                        <button class="version-history-control" data-filter="major">Major</button>
                        <button class="version-history-control" data-filter="minor">Minor</button>
                        <button class="version-history-control" data-filter="patch">Patch</button>
                    </div>
                </div>
                <ul class="version-history-list" id="versionHistoryList">
                    <!-- Version history items will be populated here -->
                </ul>
            </div>
            
            <div class="version-comparison">
                <div class="version-comparison-header">
                    <h3 class="version-comparison-title">Version Comparison</h3>
                    <div class="version-comparison-controls">
                        <select class="version-comparison-select" id="compareFrom">
                            <option value="">Select version...</option>
                        </select>
                        <span>vs</span>
                        <select class="version-comparison-select" id="compareTo">
                            <option value="">Select version...</option>
                        </select>
                    </div>
                </div>
                <div class="version-comparison-content" id="versionComparisonContent">
                    <div class="version-comparison-side">
                        <div class="version-comparison-side-header">
                            <h4 class="version-comparison-side-title">From Version</h4>
                            <span class="version-comparison-side-badge">Select</span>
                        </div>
                        <div class="version-comparison-side-content">
                            Select a version to compare
                        </div>
                    </div>
                    <div class="version-comparison-side">
                        <div class="version-comparison-side-header">
                            <h4 class="version-comparison-side-title">To Version</h4>
                            <span class="version-comparison-side-badge">Select</span>
                        </div>
                        <div class="version-comparison-side-content">
                            Select a version to compare
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dashboard);
        lucide.createIcons();
        this.updateVersionInfo();
        this.updateVersionHistory();
        this.updateComparisonSelects();
    }

    setupEventListeners() {
        // Create version button
        document.getElementById('createVersion').addEventListener('click', () => {
            this.showCreateVersionModal();
        });

        // Compare versions button
        document.getElementById('compareVersions').addEventListener('click', () => {
            this.showCompareVersionsModal();
        });

        // Filter controls
        document.querySelectorAll('.version-history-control').forEach(control => {
            control.addEventListener('click', (e) => {
                document.querySelectorAll('.version-history-control').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.filterVersions(e.target.dataset.filter);
            });
        });

        // Comparison selects
        document.getElementById('compareFrom').addEventListener('change', (e) => {
            this.updateComparison('from', e.target.value);
        });

        document.getElementById('compareTo').addEventListener('change', (e) => {
            this.updateComparison('to', e.target.value);
        });
    }

    setupVersionTracking() {
        // Track component changes
        this.trackComponentChanges();
        
        // Auto-save changes every 5 minutes
        setInterval(() => {
            this.autoSaveChanges();
        }, 5 * 60 * 1000);
    }

    trackComponentChanges() {
        // Track changes to design system components
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    this.recordChange(mutation);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    recordChange(mutation) {
        const change = {
            type: mutation.type,
            target: mutation.target.tagName,
            timestamp: new Date().toISOString(),
            details: this.getChangeDetails(mutation)
        };

        this.changes.push(change);
    }

    getChangeDetails(mutation) {
        if (mutation.type === 'childList') {
            return {
                addedNodes: mutation.addedNodes.length,
                removedNodes: mutation.removedNodes.length
            };
        } else if (mutation.type === 'attributes') {
            return {
                attributeName: mutation.attributeName,
                oldValue: mutation.oldValue,
                newValue: mutation.target.getAttribute(mutation.attributeName)
            };
        }
        return {};
    }

    autoSaveChanges() {
        if (this.changes.length > 0) {
            // Save changes to localStorage
            localStorage.setItem('design-system-changes', JSON.stringify(this.changes));
        }
    }

    async createVersion(version, type, description, changes) {
        if (this.isVersioning) return;

        this.isVersioning = true;
        this.showVersionStatus('info', 'Creating version...');

        try {
            const newVersion = {
                id: version,
                version: version,
                type: type,
                description: description,
                changes: changes || this.getRecentChanges(),
                timestamp: new Date().toISOString(),
                author: 'User',
                status: 'stable',
                components: this.getComponentList()
            };

            this.versions.unshift(newVersion);
            this.currentVersion = version;
            this.changes = []; // Clear changes after versioning
            
            this.saveVersions();
            this.updateVersionInfo();
            this.updateVersionHistory();
            this.updateComparisonSelects();
            this.showVersionStatus('success', 'Version created successfully');
            
            return newVersion;
        } catch (error) {
            this.showVersionStatus('error', 'Failed to create version: ' + error.message);
            throw error;
        } finally {
            this.isVersioning = false;
        }
    }

    getRecentChanges() {
        // Get recent changes for version description
        const recentChanges = this.changes.slice(-10);
        return recentChanges.map(change => {
            if (change.type === 'childList') {
                return `Added ${change.details.addedNodes} components, removed ${change.details.removedNodes} components`;
            } else if (change.type === 'attributes') {
                return `Updated ${change.details.attributeName} attribute`;
            }
            return 'Component change';
        });
    }

    getComponentList() {
        // Get list of current components
        const components = [];
        const componentElements = document.querySelectorAll('[class*="btn"], [class*="card"], [class*="form"], [class*="alert"], [class*="modal"]');
        
        componentElements.forEach(element => {
            const classes = Array.from(element.classList);
            const componentClass = classes.find(cls => 
                cls.includes('btn') || cls.includes('card') || cls.includes('form') || 
                cls.includes('alert') || cls.includes('modal')
            );
            if (componentClass && !components.includes(componentClass)) {
                components.push(componentClass);
            }
        });

        return components;
    }

    updateVersionInfo() {
        const currentVersionElement = document.getElementById('currentVersion');
        const componentCountElement = document.getElementById('componentCount');
        const lastUpdatedElement = document.getElementById('lastUpdated');
        const versionStatusElement = document.getElementById('versionStatus');

        if (currentVersionElement) {
            currentVersionElement.textContent = this.currentVersion;
        }

        if (componentCountElement) {
            componentCountElement.textContent = this.getComponentList().length;
        }

        if (lastUpdatedElement) {
            const lastVersion = this.versions[0];
            if (lastVersion) {
                lastUpdatedElement.textContent = new Date(lastVersion.timestamp).toLocaleDateString();
            }
        }

        if (versionStatusElement) {
            versionStatusElement.textContent = 'Stable';
        }
    }

    updateVersionHistory() {
        const container = document.getElementById('versionHistoryList');
        if (!container) return;

        if (this.versions.length === 0) {
            container.innerHTML = '<li class="version-history-item"><span>No versions available</span></li>';
            return;
        }

        let html = '';
        this.versions.forEach(version => {
            const isCurrent = version.version === this.currentVersion;
            const date = new Date(version.timestamp);
            
            html += `
                <li class="version-history-item ${isCurrent ? 'current' : ''}">
                    <div class="version-history-info">
                        <h4 class="version-history-version">v${version.version}</h4>
                        <p class="version-history-description">${version.description}</p>
                        <div class="version-history-meta">
                            <span>${date.toLocaleDateString()}</span>
                            <span>•</span>
                            <span>${version.type}</span>
                            <span>•</span>
                            <span>${version.author}</span>
                        </div>
                    </div>
                    <div class="version-history-actions">
                        <button class="version-history-action primary" onclick="window.versionControl.restoreVersion('${version.id}')">
                            Restore
                        </button>
                        <button class="version-history-action" onclick="window.versionControl.viewVersion('${version.id}')">
                            View
                        </button>
                    </div>
                </li>
            `;
        });

        container.innerHTML = html;
    }

    updateComparisonSelects() {
        const fromSelect = document.getElementById('compareFrom');
        const toSelect = document.getElementById('compareTo');

        if (fromSelect && toSelect) {
            const options = this.versions.map(version => 
                `<option value="${version.id}">v${version.version}</option>`
            ).join('');

            fromSelect.innerHTML = '<option value="">Select version...</option>' + options;
            toSelect.innerHTML = '<option value="">Select version...</option>' + options;
        }
    }

    filterVersions(filter) {
        const items = document.querySelectorAll('.version-history-item');
        items.forEach(item => {
            const version = this.versions.find(v => v.id === item.dataset.versionId);
            if (!version) return;

            let show = true;
            switch (filter) {
                case 'major':
                    show = version.type === 'major';
                    break;
                case 'minor':
                    show = version.type === 'minor';
                    break;
                case 'patch':
                    show = version.type === 'patch';
                    break;
                case 'all':
                default:
                    show = true;
                    break;
            }

            item.style.display = show ? 'flex' : 'none';
        });
    }

    updateComparison(side, versionId) {
        const version = this.versions.find(v => v.id === versionId);
        if (!version) return;

        const sideElement = document.querySelector(`.version-comparison-side:${side === 'from' ? 'first-child' : 'last-child'}`);
        if (sideElement) {
            const title = sideElement.querySelector('.version-comparison-side-title');
            const badge = sideElement.querySelector('.version-comparison-side-badge');
            const content = sideElement.querySelector('.version-comparison-side-content');

            if (title) title.textContent = `v${version.version}`;
            if (badge) badge.textContent = version.type;
            if (content) {
                content.innerHTML = `
                    <p><strong>Description:</strong> ${version.description}</p>
                    <p><strong>Changes:</strong></p>
                    <ul>
                        ${version.changes.map(change => `<li>${change}</li>`).join('')}
                    </ul>
                    <p><strong>Components:</strong> ${version.components.length}</p>
                    <p><strong>Date:</strong> ${new Date(version.timestamp).toLocaleString()}</p>
                `;
            }
        }
    }

    async restoreVersion(versionId) {
        const version = this.versions.find(v => v.id === versionId);
        if (!version) return;

        if (confirm(`Are you sure you want to restore to version ${version.version}?`)) {
            try {
                // This would restore the design system to the specified version
                // In a real implementation, this would involve restoring CSS, JS, and HTML
                this.currentVersion = version.version;
                this.updateVersionInfo();
                this.showVersionStatus('success', `Restored to version ${version.version}`);
            } catch (error) {
                this.showVersionStatus('error', 'Failed to restore version: ' + error.message);
            }
        }
    }

    viewVersion(versionId) {
        const version = this.versions.find(v => v.id === versionId);
        if (!version) return;

        this.showVersionDetailsModal(version);
    }

    showVersionStatus(type, message) {
        const status = document.getElementById('versionStatus');
        if (status) {
            status.className = `version-status ${type}`;
            status.querySelector('span').textContent = message;
            status.style.display = 'flex';
            
            setTimeout(() => {
                status.style.display = 'none';
            }, 5000);
        }
    }

    showCreateVersionModal() {
        const modal = document.createElement('div');
        modal.className = 'version-modal';
        modal.innerHTML = `
            <div class="content">
                <div class="header">
                    <h3 class="title">Create New Version</h3>
                    <button class="close" onclick="this.closest('.version-modal').remove()">
                        <i data-lucide="x" class="icon"></i>
                    </button>
                </div>
                <div class="body">
                    <div class="form-group">
                        <label class="form-label">Version Number</label>
                        <input type="text" class="form-input" id="versionNumber" placeholder="e.g., 2025.1.1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Version Type</label>
                        <select class="form-input" id="versionType">
                            <option value="patch">Patch (bug fixes)</option>
                            <option value="minor">Minor (new features)</option>
                            <option value="major">Major (breaking changes)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-textarea" id="versionDescription" placeholder="Describe the changes in this version"></textarea>
                    </div>
                </div>
                <div class="footer">
                    <button class="btn btn-secondary" onclick="this.closest('.version-modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="window.versionControl.createVersionFromModal()">Create Version</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        lucide.createIcons();
        
        setTimeout(() => modal.classList.add('show'), 100);
    }

    showCompareVersionsModal() {
        const modal = document.createElement('div');
        modal.className = 'version-modal';
        modal.innerHTML = `
            <div class="content">
                <div class="header">
                    <h3 class="title">Compare Versions</h3>
                    <button class="close" onclick="this.closest('.version-modal').remove()">
                        <i data-lucide="x" class="icon"></i>
                    </button>
                </div>
                <div class="body">
                    <div class="form-group">
                        <label class="form-label">From Version</label>
                        <select class="form-input" id="compareFromModal">
                            <option value="">Select version...</option>
                            ${this.versions.map(version => 
                                `<option value="${version.id}">v${version.version}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">To Version</label>
                        <select class="form-input" id="compareToModal">
                            <option value="">Select version...</option>
                            ${this.versions.map(version => 
                                `<option value="${version.id}">v${version.version}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="footer">
                    <button class="btn btn-secondary" onclick="this.closest('.version-modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="window.versionControl.compareVersionsFromModal()">Compare</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        lucide.createIcons();
        
        setTimeout(() => modal.classList.add('show'), 100);
    }

    showVersionDetailsModal(version) {
        const modal = document.createElement('div');
        modal.className = 'version-modal';
        modal.innerHTML = `
            <div class="content">
                <div class="header">
                    <h3 class="title">Version ${version.version} Details</h3>
                    <button class="close" onclick="this.closest('.version-modal').remove()">
                        <i data-lucide="x" class="icon"></i>
                    </button>
                </div>
                <div class="body">
                    <div class="form-group">
                        <label class="form-label">Version</label>
                        <input type="text" class="form-input" value="${version.version}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <input type="text" class="form-input" value="${version.type}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="form-textarea" readonly>${version.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Changes</label>
                        <textarea class="form-textarea" readonly>${version.changes.join('\n')}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Components</label>
                        <input type="text" class="form-input" value="${version.components.join(', ')}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="text" class="form-input" value="${new Date(version.timestamp).toLocaleString()}" readonly>
                    </div>
                </div>
                <div class="footer">
                    <button class="btn btn-secondary" onclick="this.closest('.version-modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        lucide.createIcons();
        
        setTimeout(() => modal.classList.add('show'), 100);
    }

    async createVersionFromModal() {
        const version = document.getElementById('versionNumber').value;
        const type = document.getElementById('versionType').value;
        const description = document.getElementById('versionDescription').value;
        
        if (!version || !description) {
            alert('Please fill in all required fields');
            return;
        }
        
        try {
            await this.createVersion(version, type, description);
            document.querySelector('.version-modal').remove();
        } catch (error) {
            console.error('Failed to create version:', error);
        }
    }

    compareVersionsFromModal() {
        const fromVersion = document.getElementById('compareFromModal').value;
        const toVersion = document.getElementById('compareToModal').value;
        
        if (!fromVersion || !toVersion) {
            alert('Please select both versions to compare');
            return;
        }
        
        // Update the comparison in the dashboard
        this.updateComparison('from', fromVersion);
        this.updateComparison('to', toVersion);
        
        document.querySelector('.version-modal').remove();
    }

    // Public API methods
    getVersions() {
        return this.versions;
    }

    getCurrentVersion() {
        return this.currentVersion;
    }

    getChanges() {
        return this.changes;
    }

    exportVersions() {
        const dataStr = JSON.stringify(this.versions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `design-system-versions-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Initialize version control
document.addEventListener('DOMContentLoaded', () => {
    window.versionControl = new VersionControl2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VersionControl2025;
}
