// Auditor Settings Management System
class AuditorSettings {
    constructor() {
        this.currentUser = null;
        this.currentFactory = null;
        this.settings = {};
        this.init();
    }

    async init() {
        console.log('🔍 Initializing Auditor Settings...');
        
        // Check authentication and role
        await this.checkAuth();
        
        // Load settings
        await this.loadSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize charts
        this.initializeCharts();
        
        // Load initial data
        await this.loadInitialData();
        
        console.log('✅ Auditor Settings initialized');
    }

    async checkAuth() {
        try {
            const user = auth.currentUser;
            if (!user) {
                window.location.href = 'login.html';
                return;
            }

            // Get user data
            const userDoc = await collection(db, 'users', user.uid);
            if (!userDoc.exists()()) {
                window.location.href = 'login.html';
                return;
            }

            const userData = userDoc.data();
            if (userData.role !== 'auditor' && userData.role !== 'factory_admin' && userData.role !== 'super_admin') {
                alert('Access denied. Auditor role required.');
                window.location.href = 'dashboard.html';
                return;
            }

            this.currentUser = userData;
            this.currentFactory = userData.factoryId;

            // Update UI
            document.getElementById('userName').textContent = userData.name || userData.email;

        } catch (error) {
            console.error('❌ Authentication error:', error);
            window.location.href = 'login.html';
        }
    }

    async loadSettings() {
        try {
            const settingsDoc = await collection(db, 'auditor_settings')
                .where('factoryId', '==', this.currentFactory)
                .limit(1)
                .get();

            if (!settingsDoc.empty) {
                this.settings = settingsDoc.docs[0].data();
                this.populateForms();
            }

        } catch (error) {
            console.error('❌ Error loading settings:', error);
        }
    }

    setupEventListeners() {
        // Form submissions
        document.getElementById('auditSchedulingForm')?.addEventListener('submit', (e) => this.saveAuditScheduling(e));
        document.getElementById('auditTypesForm')?.addEventListener('submit', (e) => this.saveAuditTypes(e));
        document.getElementById('complianceFrameworksForm')?.addEventListener('submit', (e) => this.saveComplianceFrameworks(e));
        document.getElementById('complianceThresholdsForm')?.addEventListener('submit', (e) => this.saveComplianceThresholds(e));
        document.getElementById('findingSeverityForm')?.addEventListener('submit', (e) => this.saveFindingSeverity(e));
        document.getElementById('auditNotificationsForm')?.addEventListener('submit', (e) => this.saveAuditNotifications(e));
        document.getElementById('reportNotificationsForm')?.addEventListener('submit', (e) => this.saveReportNotifications(e));
    }

    populateForms() {
        // Audit scheduling
        if (this.settings.auditScheduling) {
            Object.keys(this.settings.auditScheduling).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = this.settings.auditScheduling[key];
            });
        }

        // Audit types
        if (this.settings.auditTypes) {
            Object.keys(this.settings.auditTypes).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.auditTypes[key];
            });
        }

        // Compliance frameworks
        if (this.settings.complianceFrameworks) {
            Object.keys(this.settings.complianceFrameworks).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.complianceFrameworks[key];
            });
        }

        // Compliance thresholds
        if (this.settings.complianceThresholds) {
            Object.keys(this.settings.complianceThresholds).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = this.settings.complianceThresholds[key];
            });
        }

        // Finding severity
        if (this.settings.findingSeverity) {
            Object.keys(this.settings.findingSeverity).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = this.settings.findingSeverity[key];
            });
        }

        // Audit notifications
        if (this.settings.auditNotifications) {
            Object.keys(this.settings.auditNotifications).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.auditNotifications[key];
            });
        }

        // Report notifications
        if (this.settings.reportNotifications) {
            Object.keys(this.settings.reportNotifications).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = this.settings.reportNotifications[key];
            });
        }
    }

    async loadInitialData() {
        await Promise.all([
            this.loadChecklists(),
            this.loadFindingCategories(),
            this.loadComplianceAnalytics(),
            this.updateAuditMetrics()
        ]);
    }

    async loadChecklists() {
        try {
            // Load document compliance checklist
            const documentChecklistSnapshot = await collection(db, 'audit_checklists')
                .where('factoryId', '==', this.currentFactory)
                .where('type', '==', 'document')
                .orderBy('priority', 'desc')
                .get();

            const documentContainer = document.getElementById('documentChecklist');
            if (documentContainer) {
                if (documentChecklistSnapshot.empty) {
                    documentContainer.innerHTML = '<p class="text-muted">No document checklist items found.</p>';
                } else {
                    documentContainer.innerHTML = documentChecklistSnapshot.docs.map(doc => {
                        const item = doc.data();
                        return this.createChecklistItemHTML(doc.id, item);
                    }).join('');
                }
            }

            // Load process compliance checklist
            const processChecklistSnapshot = await collection(db, 'audit_checklists')
                .where('factoryId', '==', this.currentFactory)
                .where('type', '==', 'process')
                .orderBy('priority', 'desc')
                .get();

            const processContainer = document.getElementById('processChecklist');
            if (processContainer) {
                if (processChecklistSnapshot.empty) {
                    processContainer.innerHTML = '<p class="text-muted">No process checklist items found.</p>';
                } else {
                    processContainer.innerHTML = processChecklistSnapshot.docs.map(doc => {
                        const item = doc.data();
                        return this.createChecklistItemHTML(doc.id, item);
                    }).join('');
                }
            }

            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

        } catch (error) {
            console.error('❌ Error loading checklists:', error);
        }
    }

    createChecklistItemHTML(id, item) {
        return `
            <div class="checklist-item">
                <div class="checklist-info">
                    <h4>${item.title}</h4>
                    <p>${item.description || 'No description'}</p>
                    <div class="checklist-details">
                        <span class="priority-badge ${item.priority}">${item.priority}</span>
                        <span class="category-badge">${item.category}</span>
                    </div>
                    ${item.evidence ? `<p class="evidence-required"><strong>Evidence:</strong> ${item.evidence}</p>` : ''}
                </div>
                <div class="checklist-actions">
                    <button onclick="editChecklistItem('${id}')" class="btn btn-sm btn-outline">
                        <i data-lucide="edit"></i>
                    </button>
                    <button onclick="deleteChecklistItem('${id}')" class="btn btn-sm btn-danger">
                        <i data-lucide="trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    async loadFindingCategories() {
        try {
            const categoriesSnapshot = await collection(db, 'finding_categories')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('name')
                .get();

            const categoriesContainer = document.getElementById('findingCategories');
            if (!categoriesContainer) return;

            if (categoriesSnapshot.empty) {
                categoriesContainer.innerHTML = '<p class="text-muted">No finding categories found.</p>';
                return;
            }

            categoriesContainer.innerHTML = categoriesSnapshot.docs.map(doc => {
                const category = doc.data();
                return `
                    <div class="finding-category-item">
                        <div class="category-info">
                            <h4>${category.name}</h4>
                            <p>${category.description || 'No description'}</p>
                            <div class="category-details">
                                <span class="severity-badge ${category.severity}">${category.severity}</span>
                                <span class="color-indicator" style="background-color: ${category.color}"></span>
                            </div>
                        </div>
                        <div class="category-actions">
                            <button onclick="editFindingCategory('${doc.id}')" class="btn btn-sm btn-outline">
                                <i data-lucide="edit"></i>
                            </button>
                            <button onclick="deleteFindingCategory('${doc.id}')" class="btn btn-sm btn-danger">
                                <i data-lucide="trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

        } catch (error) {
            console.error('❌ Error loading finding categories:', error);
        }
    }

    async loadComplianceAnalytics() {
        try {
            // Get compliance data
            const complianceData = await this.getComplianceData();
            
            // Create chart
            const ctx = document.getElementById('complianceAnalyticsChart');
            if (!ctx) return;

            if (this.complianceChart) {
                this.complianceChart.destroy();
            }

            this.complianceChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Document', 'Process', 'Safety', 'Labor', 'Environmental', 'Quality'],
                    datasets: [{
                        label: 'Compliance Score (%)',
                        data: [
                            complianceData.document || 0,
                            complianceData.process || 0,
                            complianceData.safety || 0,
                            complianceData.labor || 0,
                            complianceData.environmental || 0,
                            complianceData.quality || 0
                        ],
                        backgroundColor: [
                            '#3B82F6',
                            '#10B981',
                            '#F59E0B',
                            '#EF4444',
                            '#8B5CF6',
                            '#06B6D4'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Compliance Scores by Category'
                        }
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error loading compliance analytics:', error);
        }
    }

    async getComplianceData() {
        try {
            // Get recent audit data
            const auditSnapshot = await collection(db, 'audits')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            const complianceData = {
                document: 0,
                process: 0,
                safety: 0,
                labor: 0,
                environmental: 0,
                quality: 0
            };

            let totalAudits = 0;

            auditSnapshot.docs.forEach(doc => {
                const audit = doc.data();
                if (audit.complianceScores) {
                    Object.keys(audit.complianceScores).forEach(category => {
                        if (complianceData.hasOwnProperty(category)) {
                            complianceData[category] += audit.complianceScores[category] || 0;
                        }
                    });
                    totalAudits++;
                }
            });

            // Calculate averages
            if (totalAudits > 0) {
                Object.keys(complianceData).forEach(category => {
                    complianceData[category] = Math.round(complianceData[category] / totalAudits);
                });
            }

            return complianceData;

        } catch (error) {
            console.error('❌ Error getting compliance data:', error);
            return {};
        }
    }

    async updateAuditMetrics() {
        try {
            // Calculate metrics based on audit data
            const metrics = await this.calculateAuditMetrics();
            
            // Update UI
            document.getElementById('overallCompliance').textContent = `${metrics.overallCompliance}%`;
            document.getElementById('criticalFindings').textContent = metrics.criticalFindings;
            document.getElementById('openFindings').textContent = metrics.openFindings;
            document.getElementById('resolvedFindings').textContent = metrics.resolvedFindings;

        } catch (error) {
            console.error('❌ Error updating audit metrics:', error);
        }
    }

    async calculateAuditMetrics() {
        try {
            // Get recent audits
            const auditSnapshot = await collection(db, 'audits')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();

            // Get findings
            const findingsSnapshot = await collection(db, 'audit_findings')
                .where('factoryId', '==', this.currentFactory)
                .get();

            let overallCompliance = 0;
            let totalAudits = 0;
            let criticalFindings = 0;
            let openFindings = 0;
            let resolvedFindings = 0;

            // Calculate compliance scores
            auditSnapshot.docs.forEach(doc => {
                const audit = doc.data();
                if (audit.overallComplianceScore) {
                    overallCompliance += audit.overallComplianceScore;
                    totalAudits++;
                }
            });

            // Calculate findings
            findingsSnapshot.docs.forEach(doc => {
                const finding = doc.data();
                if (finding.severity === 'critical') {
                    criticalFindings++;
                }
                if (finding.status === 'open') {
                    openFindings++;
                } else if (finding.status === 'resolved') {
                    resolvedFindings++;
                }
            });

            return {
                overallCompliance: totalAudits > 0 ? Math.round(overallCompliance / totalAudits) : 0,
                criticalFindings: criticalFindings,
                openFindings: openFindings,
                resolvedFindings: resolvedFindings
            };

        } catch (error) {
            console.error('❌ Error calculating audit metrics:', error);
            return {
                overallCompliance: 0,
                criticalFindings: 0,
                openFindings: 0,
                resolvedFindings: 0
            };
        }
    }

    // Form save methods
    async saveAuditScheduling(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const auditScheduling = {
                auditFrequency: formData.get('auditFrequency') || 'quarterly',
                auditDuration: parseInt(formData.get('auditDuration')) || 3,
                auditTeamSize: parseInt(formData.get('auditTeamSize')) || 2,
                auditScope: formData.get('auditScope') || ''
            };

            await this.saveSettings('auditScheduling', auditScheduling);
            this.showSuccess('Audit scheduling saved successfully');

        } catch (error) {
            console.error('❌ Error saving audit scheduling:', error);
            this.showError('Failed to save audit scheduling');
        }
    }

    async saveAuditTypes(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const auditTypes = {
                documentAudit: formData.has('documentAudit'),
                processAudit: formData.has('processAudit'),
                safetyAudit: formData.has('safetyAudit'),
                laborAudit: formData.has('laborAudit'),
                environmentalAudit: formData.has('environmentalAudit'),
                qualityAudit: formData.has('qualityAudit')
            };

            await this.saveSettings('auditTypes', auditTypes);
            this.showSuccess('Audit types saved successfully');

        } catch (error) {
            console.error('❌ Error saving audit types:', error);
            this.showError('Failed to save audit types');
        }
    }

    async saveComplianceFrameworks(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const complianceFrameworks = {
                iso9001: formData.has('iso9001'),
                iso14001: formData.has('iso14001'),
                iso45001: formData.has('iso45001'),
                sa8000: formData.has('sa8000'),
                bcorp: formData.has('bcorp'),
                fairtrade: formData.has('fairtrade')
            };

            await this.saveSettings('complianceFrameworks', complianceFrameworks);
            this.showSuccess('Compliance frameworks saved successfully');

        } catch (error) {
            console.error('❌ Error saving compliance frameworks:', error);
            this.showError('Failed to save compliance frameworks');
        }
    }

    async saveComplianceThresholds(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const complianceThresholds = {
                criticalThreshold: parseInt(formData.get('criticalThreshold')) || 95,
                warningThreshold: parseInt(formData.get('warningThreshold')) || 85,
                acceptableThreshold: parseInt(formData.get('acceptableThreshold')) || 75,
                gracePeriod: parseInt(formData.get('gracePeriod')) || 30
            };

            await this.saveSettings('complianceThresholds', complianceThresholds);
            this.showSuccess('Compliance thresholds saved successfully');

        } catch (error) {
            console.error('❌ Error saving compliance thresholds:', error);
            this.showError('Failed to save compliance thresholds');
        }
    }

    async saveFindingSeverity(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const findingSeverity = {
                criticalSeverity: formData.get('criticalSeverity') || '',
                majorSeverity: formData.get('majorSeverity') || '',
                minorSeverity: formData.get('minorSeverity') || '',
                observationSeverity: formData.get('observationSeverity') || ''
            };

            await this.saveSettings('findingSeverity', findingSeverity);
            this.showSuccess('Finding severity criteria saved successfully');

        } catch (error) {
            console.error('❌ Error saving finding severity:', error);
            this.showError('Failed to save finding severity criteria');
        }
    }

    async saveAuditNotifications(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const auditNotifications = {
                auditScheduled: formData.has('auditScheduled'),
                auditStarted: formData.has('auditStarted'),
                auditCompleted: formData.has('auditCompleted'),
                criticalFindings: formData.has('criticalFindings'),
                complianceBreaches: formData.has('complianceBreaches'),
                auditorNotificationEmail: formData.get('auditorNotificationEmail') || ''
            };

            await this.saveSettings('auditNotifications', auditNotifications);
            this.showSuccess('Audit notifications saved successfully');

        } catch (error) {
            console.error('❌ Error saving audit notifications:', error);
            this.showError('Failed to save audit notifications');
        }
    }

    async saveReportNotifications(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const reportNotifications = {
                reportGenerated: formData.has('reportGenerated'),
                reportApproved: formData.has('reportApproved'),
                reportRejected: formData.has('reportRejected'),
                reportFrequency: formData.get('reportFrequency') || 'daily'
            };

            await this.saveSettings('reportNotifications', reportNotifications);
            this.showSuccess('Report notifications saved successfully');

        } catch (error) {
            console.error('❌ Error saving report notifications:', error);
            this.showError('Failed to save report notifications');
        }
    }

    async saveSettings(section, data) {
        try {
            const settingsRef = collection(db, 'auditor_settings')
                .where('factoryId', '==', this.currentFactory)
                .limit(1);

            const settingsSnapshot = await settingsRef.get();

            if (settingsSnapshot.empty) {
                // Create new settings document
                await collection(db, 'auditor_settings', {
                    factoryId: this.currentFactory,
                    [section]: data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: this.currentUser.uid
                });
            } else {
                // Update existing settings document
                const docRef = settingsSnapshot.docs[0].ref;
                await docRef.update({
                    [section]: data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: this.currentUser.uid
                });
            }

            // Update local settings
            this.settings[section] = data;

            // Log audit entry
            await this.logAuditEntry(`auditor_settings_${section}_updated`, {
                section: section,
                data: data
            });

        } catch (error) {
            console.error('❌ Error saving settings:', error);
            throw error;
        }
    }

    async logAuditEntry(action, data) {
        try {
            await collection(db, 'audit_log', {
                action: action,
                userId: this.currentUser.uid,
                userName: this.currentUser.name || this.currentUser.email,
                factoryId: this.currentFactory,
                data: data,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ipAddress: await this.getClientIP(),
                userAgent: navigator.userAgent
            });
        } catch (error) {
            console.error('❌ Error logging audit entry:', error);
        }
    }

    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'Unknown';
        }
    }

    showSuccess(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'notification-toast success';
        toast.innerHTML = `
            <div class="toast-header">
                <i data-lucide="check-circle"></i>
                <span class="toast-title">Success</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="toast-message">${message}</div>
        `;

        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(toast);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 3000);
    }

    showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'notification-toast critical';
        toast.innerHTML = `
            <div class="toast-header">
                <i data-lucide="alert-circle"></i>
                <span class="toast-title">Error</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="toast-message">${message}</div>
        `;

        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(toast);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    initializeCharts() {
        if (typeof Chart !== 'undefined') {
            Chart.defaults.font.family = 'Inter, sans-serif';
            Chart.defaults.color = '#6B7280';
        }
    }
}

// Initialize Auditor Settings
let auditorSettings;

// Wait for Firebase to be available before initializing
function initializeAuditorsettings() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeAuditorsettings, 100);
        return;
    }

    // Get Firebase instances and functions from the global Firebase object
    const { auth, db } = window.Firebase;
    const {
        doc,
        getDoc,
        setDoc,
        updateDoc,
        deleteDoc,
        collection,
        query,
        where,
        orderBy,
        limit,
        onSnapshot,
        getDocs,
        addDoc,
        serverTimestamp,
        writeBatch
    } = window.Firebase;

document.addEventListener('DOMContentLoaded', function() {
    auditorSettings = new AuditorSettings();
});

// Global functions for HTML onclick handlers
window.showTab = (tabId) => {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    
    // Add active class to clicked nav item
    event.target.classList.add('active');
};

window.openAddChecklistItemModal = (type) => {
    document.getElementById('addChecklistItemModal').style.display = 'flex';
    document.getElementById('checklistItemCategory').value = type;
};

window.openAddFindingCategoryModal = () => {
    document.getElementById('addFindingCategoryModal').style.display = 'flex';
};

window.closeModal = (modalId) => {
    document.getElementById(modalId).style.display = 'none';
};

window.saveNewChecklistItem = async () => {
    try {
        const form = document.getElementById('addChecklistItemForm');
        const formData = new FormData(form);
        
        const checklistData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            evidence: formData.get('evidence'),
            type: formData.get('category'),
            factoryId: auditorSettings.currentFactory,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: auditorSettings.currentUser.uid
        };

        await collection(db, 'audit_checklists', checklistData);
        
        closeModal('addChecklistItemModal');
        form.reset();
        auditorSettings.showSuccess('Checklist item added successfully');
        await auditorSettings.loadChecklists();

    } catch (error) {
        console.error('❌ Error adding checklist item:', error);
        auditorSettings.showError('Failed to add checklist item');
    }
};

window.saveNewFindingCategory = async () => {
    try {
        const form = document.getElementById('addFindingCategoryForm');
        const formData = new FormData(form);
        
        const categoryData = {
            name: formData.get('name'),
            description: formData.get('description'),
            severity: formData.get('severity'),
            color: formData.get('color'),
            factoryId: auditorSettings.currentFactory,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: auditorSettings.currentUser.uid
        };

        await collection(db, 'finding_categories', categoryData);
        
        closeModal('addFindingCategoryModal');
        form.reset();
        auditorSettings.showSuccess('Finding category added successfully');
        await auditorSettings.loadFindingCategories();

    } catch (error) {
        console.error('❌ Error adding finding category:', error);
        auditorSettings.showError('Failed to add finding category');
    }
};

window.generateComplianceReport = async () => {
    try {
        const complianceData = await auditorSettings.getComplianceData();
        const reportData = {
            type: 'compliance_report',
            data: complianceData,
            generatedAt: new Date(),
            generatedBy: auditorSettings.currentUser.uid,
            factoryId: auditorSettings.currentFactory
        };

        // Save report to Firestore
        await collection(db, 'auditor_reports', {
            ...reportData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Export as CSV
        const csvData = [
            ['Category', 'Compliance Score (%)'],
            ['Document', complianceData.document || 0],
            ['Process', complianceData.process || 0],
            ['Safety', complianceData.safety || 0],
            ['Labor', complianceData.labor || 0],
            ['Environmental', complianceData.environmental || 0],
            ['Quality', complianceData.quality || 0]
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `compliance_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        auditorSettings.showSuccess('Compliance report generated and downloaded');

    } catch (error) {
        console.error('❌ Error generating compliance report:', error);
        auditorSettings.showError('Failed to generate compliance report');
    }
};

window.exportComplianceData = async () => {
    try {
        const complianceData = await auditorSettings.getComplianceData();
        const jsonData = JSON.stringify(complianceData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `compliance_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        auditorSettings.showSuccess('Compliance data exported successfully');

    } catch (error) {
        console.error('❌ Error exporting compliance data:', error);
        auditorSettings.showError('Failed to export compliance data');
    }
};

window.logout = () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('❌ Logout error:', error);
    });
};

// Start the initialization process
initializeAuditorsettings();
