// Factory Management System for Super Admin
// Comprehensive factory management with registration, oversight, and analytics

class FactoryManagementSystem {
    constructor() {
        this.currentUser = null;
        this.factories = [];
        this.analytics = {};
        this.charts = {};
        this.filters = {
            timeRange: '30d',
            factoryType: 'all',
            status: 'all'
        };
        
        this.init();
    }
    
    async init() {
        console.log('🏭 Initializing Factory Management System...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize navigation
        this.initializeNavigation();
        
        // Load factory data
        await this.loadFactories();
        
        // Initialize UI
        this.initializeUI();
        
        // Initialize charts
        this.initializeCharts();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup real-time updates
        this.setupRealTimeUpdates();
        
        console.log('✅ Factory Management System initialized');
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
            window.superAdminNavigation.updateCurrentPage('Factory Management');
        } else {
            // Retry after a short delay
            setTimeout(() => {
                this.initializeNavigation();
            }, 100);
        }
    }
    
    async loadFactories() {
        try {
            const factoriesRef = this.collection(this.db, 'factories');
            const snapshot = await this.getDocs(factoriesRef);
            this.factories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`✓ Loaded ${this.factories.length} factories`);
            this.renderFactoryGrid();
            this.updateAnalytics();
            
        } catch (error) {
            console.error('Error loading factories:', error);
        }
    }
    
    renderFactoryGrid() {
        const factoryGrid = document.getElementById('factoryGrid');
        if (!factoryGrid) return;
        
        const filteredFactories = this.getFilteredFactories();
        
        factoryGrid.innerHTML = filteredFactories.map(factory => `
            <div class="factory-card fade-in">
                <div class="factory-header">
                    <div class="factory-info">
                        <h3>${factory.name}</h3>
                        <p>${factory.location} • ${factory.type}</p>
                    </div>
                    <div class="factory-status status-${factory.status}">
                        ${factory.status}
                    </div>
                </div>
                
                <div class="factory-metrics">
                    <div class="metric-item">
                        <div class="metric-value">${factory.workerCount || 0}</div>
                        <div class="metric-label">Workers</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${factory.complianceScore || 0}%</div>
                        <div class="metric-label">Compliance</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${factory.activeCases || 0}</div>
                        <div class="metric-label">Active Cases</div>
                    </div>
                </div>
                
                <div class="factory-actions">
                    <button class="factory-action-btn" onclick="viewFactoryDetails('${factory.id}')">
                        <i data-lucide="eye"></i>
                        View
                    </button>
                    <button class="factory-action-btn" onclick="editFactory('${factory.id}')">
                        <i data-lucide="edit"></i>
                        Edit
                    </button>
                    <button class="factory-action-btn" onclick="manageFactoryUsers('${factory.id}')">
                        <i data-lucide="users"></i>
                        Users
                    </button>
                    <button class="factory-action-btn danger" onclick="suspendFactory('${factory.id}')">
                        <i data-lucide="pause"></i>
                        Suspend
                    </button>
                </div>
            </div>
        `).join('');
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    getFilteredFactories() {
        let filtered = this.factories;
        
        // Filter by status
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(f => f.status === this.filters.status);
        }
        
        // Filter by type
        if (this.filters.factoryType !== 'all') {
            filtered = filtered.filter(f => f.type === this.filters.factoryType);
        }
        
        return filtered;
    }
    
    updateAnalytics() {
        const totalFactories = this.factories.length;
        const activeFactories = this.factories.filter(f => f.status === 'active').length;
        const complianceRate = this.calculateComplianceRate();
        const averageScore = this.calculateAverageScore();
        
        // Update summary values
        document.getElementById('totalFactories').textContent = totalFactories;
        document.getElementById('activeFactories').textContent = activeFactories;
        document.getElementById('complianceRate').textContent = `${complianceRate}%`;
        document.getElementById('averageScore').textContent = averageScore;
        
        // Update factory filter dropdown
        this.updateFactoryFilter();
    }
    
    calculateComplianceRate() {
        const compliantFactories = this.factories.filter(f => f.complianceScore >= 80).length;
        return Math.round((compliantFactories / this.factories.length) * 100) || 0;
    }
    
    calculateAverageScore() {
        const totalScore = this.factories.reduce((sum, f) => sum + (f.complianceScore || 0), 0);
        return Math.round(totalScore / this.factories.length) || 0;
    }
    
    updateFactoryFilter() {
        const factoryFilter = document.getElementById('factoryFilter');
        if (!factoryFilter) return;
        
        // Clear existing options except "All Factories"
        factoryFilter.innerHTML = '<option value="all">All Factories</option>';
        
        // Add factory options
        this.factories.forEach(factory => {
            const option = document.createElement('option');
            option.value = factory.id;
            option.textContent = factory.name;
            factoryFilter.appendChild(option);
        });
    }
    
    initializeUI() {
        // Initialize filter dropdowns
        this.initializeFilters();
        
        // Initialize form validation
        this.initializeFormValidation();
    }
    
    initializeFilters() {
        const timeFilter = document.getElementById('timeFilter');
        const factoryFilter = document.getElementById('factoryFilter');
        
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.filters.timeRange = e.target.value;
                this.updateCharts();
            });
        }
        
        if (factoryFilter) {
            factoryFilter.addEventListener('change', (e) => {
                this.filters.factoryType = e.target.value;
                this.renderFactoryGrid();
            });
        }
    }
    
    initializeFormValidation() {
        const form = document.getElementById('factoryRegistrationForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFactoryRegistration(form);
        });
    }
    
    async handleFactoryRegistration(form) {
        try {
            const formData = new FormData(form);
            const factoryData = {
                name: document.getElementById('factoryName').value,
                code: document.getElementById('factoryCode').value,
                type: document.getElementById('factoryType').value,
                location: document.getElementById('factoryLocation').value,
                email: document.getElementById('factoryEmail').value,
                phone: document.getElementById('factoryPhone').value,
                adminEmail: document.getElementById('adminEmail').value,
                complianceStandards: Array.from(document.getElementById('complianceStandards').selectedOptions).map(option => option.value),
                description: document.getElementById('factoryDescription').value,
                status: 'pending',
                createdAt: this.serverTimestamp(),
                createdBy: this.currentUser.uid
            };
            
            // Add factory to database
            const docRef = await this.addDoc(this.collection(this.db, 'factories'), factoryData);
            
            // Create factory admin user
            await this.createFactoryAdmin(factoryData.adminEmail, docRef.id);
            
            // Show success message
            this.showNotification('success', 'Factory registered successfully!');
            
            // Close modal and reset form
            this.closeFactoryRegistration();
            form.reset();
            
            // Reload factories
            await this.loadFactories();
            
        } catch (error) {
            console.error('Error registering factory:', error);
            this.showNotification('error', 'Failed to register factory. Please try again.');
        }
    }
    
    async createFactoryAdmin(email, factoryId) {
        try {
            // Create factory admin user account
            const adminData = {
                email: email,
                role: 'factory_admin',
                factoryId: factoryId,
                status: 'pending',
                createdAt: this.serverTimestamp(),
                createdBy: this.currentUser.uid
            };
            
            await this.addDoc(this.collection(this.db, 'users'), adminData);
            
            // Send invitation email (in real implementation)
            console.log(`Factory admin invitation sent to ${email}`);
            
        } catch (error) {
            console.error('Error creating factory admin:', error);
        }
    }
    
    initializeCharts() {
        this.initializeFactoryPerformanceChart();
    }
    
    initializeFactoryPerformanceChart() {
        const ctx = document.getElementById('factoryPerformanceChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.getFactoryPerformanceData();
        
        this.charts.factoryPerformance = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Compliance Score',
                        data: data.complianceScores,
                        borderColor: 'var(--success-500)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Worker Count',
                        data: data.workerCounts,
                        borderColor: 'var(--primary-500)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
    
    getFactoryPerformanceData() {
        const now = new Date();
        const labels = [];
        const complianceScores = [];
        const workerCounts = [];
        
        // Generate data for the selected time range
        const days = this.getDaysForTimeRange(this.filters.timeRange);
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Mock data - in real implementation, this would come from historical data
            complianceScores.push(Math.floor(Math.random() * 20) + 80); // 80-100
            workerCounts.push(Math.floor(Math.random() * 500) + 100); // 100-600
        }
        
        return { labels, complianceScores, workerCounts };
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
        if (this.charts.factoryPerformance) {
            const data = this.getFactoryPerformanceData();
            this.charts.factoryPerformance.data.labels = data.labels;
            this.charts.factoryPerformance.data.datasets[0].data = data.complianceScores;
            this.charts.factoryPerformance.data.datasets[1].data = data.workerCounts;
            this.charts.factoryPerformance.update();
        }
    }
    
    setupEventListeners() {
        // Setup global event listeners
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        // Export functionality
        window.exportFactoryData = () => {
            this.exportFactoryData();
        };
        
        // Factory actions
        window.viewFactoryDetails = (factoryId) => {
            this.viewFactoryDetails(factoryId);
        };
        
        window.editFactory = (factoryId) => {
            this.editFactory(factoryId);
        };
        
        window.manageFactoryUsers = (factoryId) => {
            this.manageFactoryUsers(factoryId);
        };
        
        window.suspendFactory = (factoryId) => {
            this.suspendFactory(factoryId);
        };
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        // Listen for factory updates
        const factoriesRef = this.collection(this.db, 'factories');
        this.onSnapshot(factoriesRef, (snapshot) => {
            this.factories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderFactoryGrid();
            this.updateAnalytics();
        });
    }
    
    // Factory management methods
    async viewFactoryDetails(factoryId) {
        const factory = this.factories.find(f => f.id === factoryId);
        if (!factory) return;
        
        // Navigate to factory details page
        window.location.href = `factory-details.html?id=${factoryId}`;
    }
    
    async editFactory(factoryId) {
        const factory = this.factories.find(f => f.id === factoryId);
        if (!factory) return;
        
        // Open edit modal with factory data
        this.openEditModal(factory);
    }
    
    async manageFactoryUsers(factoryId) {
        // Navigate to factory user management
        window.location.href = `factory-user-management.html?id=${factoryId}`;
    }
    
    async suspendFactory(factoryId) {
        if (!confirm('Are you sure you want to suspend this factory?')) return;
        
        try {
            const factoryRef = this.doc(this.db, 'factories', factoryId);
            await this.updateDoc(factoryRef, {
                status: 'suspended',
                suspendedAt: this.serverTimestamp(),
                suspendedBy: this.currentUser.uid
            });
            
            this.showNotification('success', 'Factory suspended successfully');
            
        } catch (error) {
            console.error('Error suspending factory:', error);
            this.showNotification('error', 'Failed to suspend factory');
        }
    }
    
    async exportFactoryData() {
        try {
            const exportData = this.factories.map(factory => ({
                name: factory.name,
                code: factory.code,
                type: factory.type,
                location: factory.location,
                status: factory.status,
                workerCount: factory.workerCount || 0,
                complianceScore: factory.complianceScore || 0,
                createdAt: factory.createdAt?.toDate?.() || new Date(factory.createdAt)
            }));
            
            // Convert to CSV
            const csv = this.convertToCSV(exportData);
            
            // Download CSV
            this.downloadCSV(csv, 'factory-data.csv');
            
            this.showNotification('success', 'Factory data exported successfully');
            
        } catch (error) {
            console.error('Error exporting factory data:', error);
            this.showNotification('error', 'Failed to export factory data');
        }
    }
    
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
    
    openEditModal(factory) {
        // Populate form with factory data
        document.getElementById('factoryName').value = factory.name;
        document.getElementById('factoryCode').value = factory.code;
        document.getElementById('factoryType').value = factory.type;
        document.getElementById('factoryLocation').value = factory.location;
        document.getElementById('factoryEmail').value = factory.email;
        document.getElementById('factoryPhone').value = factory.phone;
        document.getElementById('adminEmail').value = factory.adminEmail;
        document.getElementById('factoryDescription').value = factory.description || '';
        
        // Open modal
        document.getElementById('factoryRegistrationModal').classList.add('show');
    }
    
    closeFactoryRegistration() {
        document.getElementById('factoryRegistrationModal').classList.remove('show');
        document.getElementById('factoryRegistrationForm').reset();
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

// Initialize the factory management system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the factory management system
    window.factoryManagementSystem = new FactoryManagementSystem();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FactoryManagementSystem;
}
