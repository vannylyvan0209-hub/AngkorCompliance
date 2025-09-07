// Standards Management System for Super Admin
class StandardsManagementSystem {
    constructor() {
        this.currentUser = null;
        this.standards = [];
        this.requirements = [];
        this.checklists = [];
        this.analytics = {};
        this.charts = {};
        this.filters = {
            timeRange: '30d',
            category: 'all',
            status: 'all'
        };
        
        this.init();
    }
    
    async init() {
        console.log('📚 Initializing Standards Management System...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize navigation
        this.initializeNavigation();
        
        // Load initial data
        await this.loadInitialData();
        
        // Initialize UI
        this.initializeUI();
        
        // Initialize charts
        this.initializeCharts();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup real-time updates
        this.setupRealTimeUpdates();
        
        console.log('✅ Standards Management System initialized');
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
                            
                            // Only allow super admins
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
        // Wait for navigation service to be available
        if (window.superAdminNavigation) {
            window.superAdminNavigation.updateCurrentPage('Standards Registry');
        } else {
            // Retry after a short delay
            setTimeout(() => {
                this.initializeNavigation();
            }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadStandards(),
            this.loadRequirements(),
            this.loadChecklists()
        ]);
        
        this.renderStandardsGrid();
        this.updateAnalytics();
    }
    
    async loadStandards() {
        try {
            const standardsRef = this.collection(this.db, 'standards');
            const snapshot = await this.getDocs(standardsRef);
            this.standards = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`✓ Loaded ${this.standards.length} standards`);
            
        } catch (error) {
            console.error('Error loading standards:', error);
        }
    }
    
    async loadRequirements() {
        try {
            const requirementsRef = this.collection(this.db, 'requirements');
            const snapshot = await this.getDocs(requirementsRef);
            this.requirements = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading requirements:', error);
        }
    }
    
    async loadChecklists() {
        try {
            const checklistsRef = this.collection(this.db, 'audit_checklists');
            const snapshot = await this.getDocs(checklistsRef);
            this.checklists = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading checklists:', error);
        }
    }
    
    renderStandardsGrid() {
        const standardsGrid = document.getElementById('standardsGrid');
        if (!standardsGrid) return;
        
        const filteredStandards = this.getFilteredStandards();
        
        standardsGrid.innerHTML = filteredStandards.map(standard => `
            <div class="standard-card fade-in">
                <div class="standard-header">
                    <div class="standard-info">
                        <h3>${standard.name}</h3>
                        <p>${standard.code} • ${standard.category}</p>
                    </div>
                    <div class="standard-status status-${standard.status}">
                        ${standard.status}
                    </div>
                </div>
                
                <div class="standard-metrics">
                    <div class="metric-item">
                        <div class="metric-value">${standard.requirementCount || 0}</div>
                        <div class="metric-label">Requirements</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${standard.checklistCount || 0}</div>
                        <div class="metric-label">Checklists</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${standard.complianceRate || 0}%</div>
                        <div class="metric-label">Compliance</div>
                    </div>
                </div>
                
                <div class="standard-actions">
                    <button class="standard-action-btn" onclick="viewStandardDetails('${standard.id}')">
                        <i data-lucide="eye"></i>
                        View
                    </button>
                    <button class="standard-action-btn" onclick="editStandard('${standard.id}')">
                        <i data-lucide="edit"></i>
                        Edit
                    </button>
                    <button class="standard-action-btn" onclick="manageRequirements('${standard.id}')">
                        <i data-lucide="list"></i>
                        Requirements
                    </button>
                    <button class="standard-action-btn" onclick="manageChecklists('${standard.id}')">
                        <i data-lucide="check-square"></i>
                        Checklists
                    </button>
                    <button class="standard-action-btn danger" onclick="deleteStandard('${standard.id}')">
                        <i data-lucide="trash-2"></i>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    getFilteredStandards() {
        let filtered = this.standards;
        
        // Filter by category
        if (this.filters.category !== 'all') {
            filtered = filtered.filter(s => s.category === this.filters.category);
        }
        
        // Filter by status
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(s => s.status === this.filters.status);
        }
        
        return filtered;
    }
    
    updateAnalytics() {
        const totalStandards = this.standards.length;
        const activeStandards = this.standards.filter(s => s.status === 'active').length;
        const complianceRate = this.calculateComplianceRate();
        const auditChecklists = this.checklists.length;
        
        // Update summary values
        document.getElementById('totalStandards').textContent = totalStandards;
        document.getElementById('activeStandards').textContent = activeStandards;
        document.getElementById('complianceRate').textContent = `${complianceRate}%`;
        document.getElementById('auditChecklists').textContent = auditChecklists;
    }
    
    calculateComplianceRate() {
        const compliantStandards = this.standards.filter(s => s.complianceRate >= 80).length;
        return Math.round((compliantStandards / this.standards.length) * 100) || 0;
    }
    
    initializeUI() {
        this.initializeFilters();
        this.initializeModals();
    }
    
    initializeFilters() {
        const timeFilter = document.getElementById('timeFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.filters.timeRange = e.target.value;
                this.updateCharts();
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.renderStandardsGrid();
            });
        }
    }
    
    initializeModals() {
        // Initialize standard creation modal
        const createStandardModal = document.getElementById('standardCreationModal');
        if (createStandardModal) {
            const form = createStandardModal.querySelector('form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleStandardCreation(form);
                });
            }
        }
    }
    
    async handleStandardCreation(form) {
        try {
            const standardData = {
                name: document.getElementById('standardName').value,
                code: document.getElementById('standardCode').value,
                category: document.getElementById('standardCategory').value,
                version: document.getElementById('standardVersion').value,
                description: document.getElementById('standardDescription').value,
                applicableIndustries: this.getSelectedIndustries(),
                status: document.getElementById('standardStatus').value,
                effectiveDate: document.getElementById('effectiveDate').value,
                expiryDate: document.getElementById('expiryDate').value || null,
                requirementCount: 0,
                checklistCount: 0,
                complianceRate: 0,
                createdAt: this.serverTimestamp(),
                createdBy: this.currentUser.uid
            };
            
            // Add standard to database
            await this.addDoc(this.collection(this.db, 'standards'), standardData);
            
            this.showNotification('success', 'Standard created successfully!');
            this.closeStandardCreation();
            form.reset();
            
            // Reload standards
            await this.loadStandards();
            this.renderStandardsGrid();
            
        } catch (error) {
            console.error('Error creating standard:', error);
            this.showNotification('error', 'Failed to create standard. Please try again.');
        }
    }
    
    getSelectedIndustries() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }
    
    initializeCharts() {
        this.initializeStandardsUsageChart();
    }
    
    initializeStandardsUsageChart() {
        const ctx = document.getElementById('standardsUsageChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.getStandardsUsageData();
        
        this.charts.standardsUsage = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Standards Usage',
                        data: data.usage,
                        borderColor: 'var(--primary-500)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Compliance Rate',
                        data: data.compliance,
                        borderColor: 'var(--success-500)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    getStandardsUsageData() {
        const now = new Date();
        const labels = [];
        const usage = [];
        const compliance = [];
        
        // Generate data for the selected time range
        const days = this.getDaysForTimeRange(this.filters.timeRange);
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Mock data - in real implementation, this would come from historical data
            usage.push(Math.floor(Math.random() * 50) + 20); // 20-70
            compliance.push(Math.floor(Math.random() * 20) + 80); // 80-100
        }
        
        return { labels, usage, compliance };
    }
    
    getDaysForTimeRange(timeRange) {
        const ranges = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365
        };
        return ranges[timeRange] || 30;
    }
    
    updateCharts() {
        if (this.charts.standardsUsage) {
            const data = this.getStandardsUsageData();
            this.charts.standardsUsage.data.labels = data.labels;
            this.charts.standardsUsage.data.datasets[0].data = data.usage;
            this.charts.standardsUsage.data.datasets[1].data = data.compliance;
            this.charts.standardsUsage.update();
        }
    }
    
    setupEventListeners() {
        // Setup global event listeners
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        // Export functionality
        window.exportStandards = () => {
            this.exportStandards();
        };
        
        // Standard actions
        window.viewStandardDetails = (standardId) => {
            this.viewStandardDetails(standardId);
        };
        
        window.editStandard = (standardId) => {
            this.editStandard(standardId);
        };
        
        window.manageRequirements = (standardId) => {
            this.manageRequirements(standardId);
        };
        
        window.manageChecklists = (standardId) => {
            this.manageChecklists(standardId);
        };
        
        window.deleteStandard = (standardId) => {
            this.deleteStandard(standardId);
        };
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        // Listen for standards updates
        const standardsRef = this.collection(this.db, 'standards');
        this.onSnapshot(standardsRef, (snapshot) => {
            this.standards = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderStandardsGrid();
            this.updateAnalytics();
        });
    }
    
    // Standard management methods
    async viewStandardDetails(standardId) {
        const standard = this.standards.find(s => s.id === standardId);
        if (!standard) return;
        
        // Navigate to standard details page
        window.location.href = `standard-details.html?id=${standardId}`;
    }
    
    async editStandard(standardId) {
        const standard = this.standards.find(s => s.id === standardId);
        if (!standard) return;
        
        // Open edit modal with standard data
        this.openEditModal(standard);
    }
    
    async manageRequirements(standardId) {
        // Navigate to requirements management
        window.location.href = `requirements-management.html?standardId=${standardId}`;
    }
    
    async manageChecklists(standardId) {
        // Navigate to checklists management
        window.location.href = `checklists-management.html?standardId=${standardId}`;
    }
    
    async deleteStandard(standardId) {
        if (!confirm('Are you sure you want to delete this standard? This action cannot be undone.')) return;
        
        try {
            const standardRef = this.doc(this.db, 'standards', standardId);
            await this.deleteDoc(standardRef);
            
            this.showNotification('success', 'Standard deleted successfully');
            
        } catch (error) {
            console.error('Error deleting standard:', error);
            this.showNotification('error', 'Failed to delete standard');
        }
    }
    
    async exportStandards() {
        try {
            const exportData = this.standards.map(standard => ({
                name: standard.name,
                code: standard.code,
                category: standard.category,
                version: standard.version,
                status: standard.status,
                effectiveDate: standard.effectiveDate,
                expiryDate: standard.expiryDate || '',
                requirementCount: standard.requirementCount || 0,
                checklistCount: standard.checklistCount || 0,
                complianceRate: standard.complianceRate || 0,
                createdAt: standard.createdAt?.toDate?.() || new Date(standard.createdAt)
            }));
            
            // Convert to CSV
            const csv = this.convertToCSV(exportData);
            
            // Download CSV
            this.downloadCSV(csv, 'standards-export.csv');
            
            this.showNotification('success', 'Standards exported successfully');
            
        } catch (error) {
            console.error('Error exporting standards:', error);
            this.showNotification('error', 'Failed to export standards');
        }
    }
    
    openEditModal(standard) {
        // Populate form with standard data
        document.getElementById('standardName').value = standard.name;
        document.getElementById('standardCode').value = standard.code;
        document.getElementById('standardCategory').value = standard.category;
        document.getElementById('standardVersion').value = standard.version;
        document.getElementById('standardDescription').value = standard.description || '';
        document.getElementById('standardStatus').value = standard.status;
        document.getElementById('effectiveDate').value = standard.effectiveDate;
        document.getElementById('expiryDate').value = standard.expiryDate || '';
        
        // Set applicable industries
        if (standard.applicableIndustries) {
            standard.applicableIndustries.forEach(industry => {
                const checkbox = document.getElementById(`industry-${industry}`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Open modal
        document.getElementById('standardCreationModal').classList.add('show');
    }
    
    closeStandardCreation() {
        document.getElementById('standardCreationModal').classList.remove('show');
        document.getElementById('standardCreationForm').reset();
    }
    
    // Utility methods
    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value}"` : value;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }
    
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    showNotification(type, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-500)' : 'var(--error-500)'};
            color: white;
            padding: var(--space-4);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize the standards management system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the standards management system
    window.standardsManagementSystem = new StandardsManagementSystem();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StandardsManagementSystem;
}
