// Super Admin Dashboard System
class SuperAdminDashboard {
    constructor() {
        this.currentUser = null;
        this.dashboardData = {
            users: [],
            factories: [],
            cases: [],
            audits: [],
            grievances: [],
            systemLogs: []
        };
        this.charts = {};
        
        this.init();
    }
    
    async init() {
        console.log('🔧 Initializing Super Admin Dashboard...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize navigation
        this.initializeNavigation();
        
        // Initialize UI
        this.initializeUI();
        
        // Load initial data
        await this.loadInitialData();
        
        // Initialize charts
        this.initializeCharts();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Super Admin Dashboard initialized');
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
                                this.updateUserDisplay();
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
            window.superAdminNavigation.updateCurrentPage('System Overview');
            window.superAdminNavigation.updateNotificationCount(this.calculateSystemAlerts());
        } else {
            // Retry after a short delay
            setTimeout(() => {
                this.initializeNavigation();
            }, 100);
        }
    }
    
    updateUserDisplay() {
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (this.currentUser) {
            userName.textContent = this.currentUser.name || this.currentUser.displayName || 'Super Admin';
            
            // Set avatar initials
            const initials = (this.currentUser.name || 'SA').split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatar.innerHTML = `<span>${initials}</span>`;
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadUsers(),
            this.loadFactories(),
            this.loadCases(),
            this.loadAudits(),
            this.loadGrievances(),
            this.loadSystemLogs()
        ]);
        
        this.updateMetrics();
        this.updateQuickStats();
        this.updateRecentActivity();
        this.updateSystemComponents();
    }
    
    async loadUsers() {
        try {
            const usersRef = this.collection(this.db, 'users');
            const snapshot = await this.getDocs(usersRef);
            this.dashboardData.users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }
    
    async loadFactories() {
        try {
            const factoriesRef = this.collection(this.db, 'factories');
            const snapshot = await this.getDocs(factoriesRef);
            this.dashboardData.factories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading factories:', error);
        }
    }
    
    async loadCases() {
        try {
            const casesRef = this.collection(this.db, 'cases');
            const snapshot = await this.getDocs(casesRef);
            this.dashboardData.cases = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading cases:', error);
        }
    }
    
    async loadAudits() {
        try {
            const auditsRef = this.collection(this.db, 'audits');
            const snapshot = await this.getDocs(auditsRef);
            this.dashboardData.audits = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading audits:', error);
        }
    }
    
    async loadGrievances() {
        try {
            const grievancesRef = this.collection(this.db, 'grievances');
            const snapshot = await this.getDocs(grievancesRef);
            this.dashboardData.grievances = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading grievances:', error);
        }
    }
    
    async loadSystemLogs() {
        try {
            const logsRef = this.collection(this.db, 'system_logs');
            const q = this.query(
                logsRef,
                this.orderBy('timestamp', 'desc'),
                this.limit(50)
            );
            const snapshot = await this.getDocs(q);
            this.dashboardData.systemLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading system logs:', error);
        }
    }
    
    updateMetrics() {
        const totalUsers = this.dashboardData.users.length;
        const activeFactories = this.dashboardData.factories.filter(f => f.status === 'active').length;
        const systemHealth = this.calculateSystemHealth();
        const totalCases = this.dashboardData.cases.length;
        
        // Update metric displays
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('activeFactories').textContent = activeFactories;
        document.getElementById('systemHealth').textContent = `${systemHealth}%`;
        document.getElementById('totalCases').textContent = totalCases;
    }
    
    updateQuickStats() {
        const onlineUsers = this.calculateOnlineUsers();
        const pendingApprovals = this.calculatePendingApprovals();
        const systemAlerts = this.calculateSystemAlerts();
        const storageUsed = this.calculateStorageUsed();
        
        // Update quick stats
        document.getElementById('onlineUsers').textContent = onlineUsers;
        document.getElementById('pendingApprovals').textContent = pendingApprovals;
        document.getElementById('systemAlerts').textContent = systemAlerts;
        document.getElementById('storageUsed').textContent = `${storageUsed}%`;
    }
    
    updateRecentActivity() {
        const activityList = document.getElementById('recentActivity');
        const activities = this.getRecentActivities();
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${activity.color};">
                    <i data-lucide="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    updateSystemComponents() {
        const componentsGrid = document.getElementById('systemComponents');
        const components = this.getSystemComponents();
        
        componentsGrid.innerHTML = components.map(component => `
            <div class="overview-item">
                <div class="overview-value">${component.value}</div>
                <div class="overview-label">${component.label}</div>
                <div class="overview-status status-${component.status}">
                    ${this.getStatusText(component.status)}
                </div>
            </div>
        `).join('');
    }
    
    initializeCharts() {
        this.initializeSystemOverviewChart();
    }
    
    initializeSystemOverviewChart() {
        const ctx = document.getElementById('systemOverviewChart').getContext('2d');
        
        const data = this.getSystemOverviewData();
        
        this.charts.systemOverview = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Active Users',
                        data: data.activeUsers,
                        backgroundColor: 'var(--primary-500)',
                        borderRadius: 8
                    },
                    {
                        label: 'Total Cases',
                        data: data.totalCases,
                        backgroundColor: 'var(--success-500)',
                        borderRadius: 8
                    },
                    {
                        label: 'Pending Audits',
                        data: data.pendingAudits,
                        backgroundColor: 'var(--warning-500)',
                        borderRadius: 8
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
    
    getSystemOverviewData() {
        const factories = this.dashboardData.factories;
        
        return {
            labels: factories.map(f => f.name || f.id),
            activeUsers: factories.map(f => {
                const factoryUsers = this.dashboardData.users.filter(u => u.factoryId === f.id);
                return factoryUsers.filter(u => u.status === 'active').length;
            }),
            totalCases: factories.map(f => {
                return this.dashboardData.cases.filter(c => c.factoryId === f.id).length;
            }),
            pendingAudits: factories.map(f => {
                return this.dashboardData.audits.filter(a => a.factoryId === f.id && a.status === 'pending').length;
            })
        };
    }
    
    getRecentActivities() {
        const activities = [];
        
        // Add user registrations
        const recentUsers = this.dashboardData.users
            .filter(u => {
                const userDate = u.createdAt ? u.createdAt.toDate() : new Date(u.createdAt);
                const dayAgo = new Date();
                dayAgo.setDate(dayAgo.getDate() - 1);
                return userDate > dayAgo;
            })
            .slice(0, 5);
        
        recentUsers.forEach(user => {
            activities.push({
                title: `New user registered: ${user.name || user.email}`,
                time: this.getTimeAgo(user.createdAt ? user.createdAt.toDate() : new Date(user.createdAt)),
                icon: 'user-plus',
                color: 'var(--primary-500)'
            });
        });
        
        // Add case submissions
        const recentCases = this.dashboardData.cases
            .filter(c => {
                const caseDate = c.createdAt ? c.createdAt.toDate() : new Date(c.createdAt);
                const dayAgo = new Date();
                dayAgo.setDate(dayAgo.getDate() - 1);
                return caseDate > dayAgo;
            })
            .slice(0, 5);
        
        recentCases.forEach(caseItem => {
            activities.push({
                title: `New case submitted: ${caseItem.title || caseItem.id}`,
                time: this.getTimeAgo(caseItem.createdAt ? caseItem.createdAt.toDate() : new Date(caseItem.createdAt)),
                icon: 'file-text',
                color: 'var(--success-500)'
            });
        });
        
        // Add audit completions
        const recentAudits = this.dashboardData.audits
            .filter(a => a.status === 'completed')
            .filter(a => {
                const auditDate = a.completedAt ? a.completedAt.toDate() : new Date(a.completedAt);
                const dayAgo = new Date();
                dayAgo.setDate(dayAgo.getDate() - 1);
                return auditDate > dayAgo;
            })
            .slice(0, 5);
        
        recentAudits.forEach(audit => {
            activities.push({
                title: `Audit completed: ${audit.type || audit.id}`,
                time: this.getTimeAgo(audit.completedAt ? audit.completedAt.toDate() : new Date(audit.completedAt)),
                icon: 'check-circle',
                color: 'var(--success-500)'
            });
        });
        
        return activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 10);
    }
    
    getSystemComponents() {
        return [
            {
                label: 'Database',
                value: '99.9%',
                status: 'healthy'
            },
            {
                label: 'Authentication',
                value: '100%',
                status: 'healthy'
            },
            {
                label: 'File Storage',
                value: '85%',
                status: 'warning'
            },
            {
                label: 'Email Service',
                value: '98%',
                status: 'healthy'
            },
            {
                label: 'API Gateway',
                value: '99.5%',
                status: 'healthy'
            },
            {
                label: 'Monitoring',
                value: '100%',
                status: 'healthy'
            }
        ];
    }
    
    calculateSystemHealth() {
        const components = this.getSystemComponents();
        const totalComponents = components.length;
        const healthyComponents = components.filter(c => c.status === 'healthy').length;
        
        return Math.round((healthyComponents / totalComponents) * 100);
    }
    
    calculateOnlineUsers() {
        // Mock calculation - in real implementation, this would track active sessions
        return Math.floor(this.dashboardData.users.length * 0.3);
    }
    
    calculatePendingApprovals() {
        return this.dashboardData.users.filter(u => u.status === 'pending').length +
               this.dashboardData.factories.filter(f => f.status === 'pending').length;
    }
    
    calculateSystemAlerts() {
        // Mock calculation - in real implementation, this would check system logs
        return Math.floor(Math.random() * 5);
    }
    
    calculateStorageUsed() {
        // Mock calculation - in real implementation, this would check actual storage usage
        return Math.floor(Math.random() * 30) + 60; // 60-90%
    }
    
    getStatusText(status) {
        const statusMap = {
            'healthy': 'Healthy',
            'warning': 'Warning',
            'critical': 'Critical'
        };
        return statusMap[status] || 'Unknown';
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} days ago`;
        
        const diffInWeeks = Math.floor(diffInDays / 7);
        return `${diffInWeeks} weeks ago`;
    }
    
    initializeUI() {
        console.log('UI initialized');
    }
    
    setupEventListeners() {
        console.log('Event listeners setup');
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

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the super admin dashboard
    window.superAdminDashboard = new SuperAdminDashboard();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuperAdminDashboard;
}
