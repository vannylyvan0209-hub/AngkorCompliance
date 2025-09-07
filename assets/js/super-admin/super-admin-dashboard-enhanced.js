// Enhanced Super Admin Dashboard System
// Comprehensive dashboard with all Super Admin features

class SuperAdminDashboardEnhanced {
    constructor() {
        this.currentUser = null;
        this.dashboardData = {
            users: [],
            factories: [],
            cases: [],
            audits: [],
            grievances: [],
            systemLogs: [],
            analytics: {},
            systemHealth: {},
            notifications: []
        };
        this.charts = {};
        this.realTimeUpdates = null;
        
        this.init();
    }
    
    async init() {
        console.log('🔧 Initializing Enhanced Super Admin Dashboard...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize navigation
        this.initializeNavigation();
        
        // Initialize UI components
        this.initializeUI();
        
        // Load comprehensive data
        await this.loadComprehensiveData();
        
        // Initialize all charts and visualizations
        this.initializeAllCharts();
        
        // Setup real-time updates
        this.setupRealTimeUpdates();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize system monitoring
        this.initializeSystemMonitoring();
        
        console.log('✅ Enhanced Super Admin Dashboard initialized');
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
    
    async loadComprehensiveData() {
        console.log('📊 Loading comprehensive dashboard data...');
        
        await Promise.all([
            this.loadUsers(),
            this.loadFactories(),
            this.loadCases(),
            this.loadAudits(),
            this.loadGrievances(),
            this.loadSystemLogs(),
            this.loadAnalytics(),
            this.loadSystemHealth(),
            this.loadNotifications()
        ]);
        
        this.updateAllMetrics();
        this.updateQuickStats();
        this.updateRecentActivity();
        this.updateSystemComponents();
        this.updateNotifications();
        
        console.log('✅ Comprehensive data loaded');
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
                this.limit(100)
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
    
    async loadAnalytics() {
        try {
            // Load comprehensive analytics data
            this.dashboardData.analytics = {
                userGrowth: this.calculateUserGrowth(),
                factoryPerformance: this.calculateFactoryPerformance(),
                caseResolution: this.calculateCaseResolution(),
                auditCompliance: this.calculateAuditCompliance(),
                systemUsage: this.calculateSystemUsage(),
                revenueMetrics: this.calculateRevenueMetrics()
            };
            
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }
    
    async loadSystemHealth() {
        try {
            this.dashboardData.systemHealth = {
                database: this.checkDatabaseHealth(),
                authentication: this.checkAuthenticationHealth(),
                storage: this.checkStorageHealth(),
                api: this.checkAPIHealth(),
                monitoring: this.checkMonitoringHealth(),
                security: this.checkSecurityHealth()
            };
            
        } catch (error) {
            console.error('Error loading system health:', error);
        }
    }
    
    async loadNotifications() {
        try {
            const notificationsRef = this.collection(this.db, 'notifications');
            const q = this.query(
                notificationsRef,
                this.where('type', '==', 'system'),
                this.orderBy('timestamp', 'desc'),
                this.limit(50)
            );
            const snapshot = await this.getDocs(q);
            this.dashboardData.notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }
    
    updateAllMetrics() {
        const totalUsers = this.dashboardData.users.length;
        const activeFactories = this.dashboardData.factories.filter(f => f.status === 'active').length;
        const systemHealth = this.calculateOverallSystemHealth();
        const totalCases = this.dashboardData.cases.length;
        const totalAudits = this.dashboardData.audits.length;
        const totalGrievances = this.dashboardData.grievances.length;
        
        // Update metric displays
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('activeFactories').textContent = activeFactories;
        document.getElementById('systemHealth').textContent = `${systemHealth}%`;
        document.getElementById('totalCases').textContent = totalCases;
        
        // Add new metrics if elements exist
        const totalAuditsEl = document.getElementById('totalAudits');
        const totalGrievancesEl = document.getElementById('totalGrievances');
        
        if (totalAuditsEl) totalAuditsEl.textContent = totalAudits;
        if (totalGrievancesEl) totalGrievancesEl.textContent = totalGrievances;
    }
    
    updateQuickStats() {
        const onlineUsers = this.calculateOnlineUsers();
        const pendingApprovals = this.calculatePendingApprovals();
        const systemAlerts = this.calculateSystemAlerts();
        const storageUsed = this.calculateStorageUsed();
        const activeSessions = this.calculateActiveSessions();
        const systemLoad = this.calculateSystemLoad();
        
        // Update quick stats
        document.getElementById('onlineUsers').textContent = onlineUsers;
        document.getElementById('pendingApprovals').textContent = pendingApprovals;
        document.getElementById('systemAlerts').textContent = systemAlerts;
        document.getElementById('storageUsed').textContent = `${storageUsed}%`;
        
        // Add new stats if elements exist
        const activeSessionsEl = document.getElementById('activeSessions');
        const systemLoadEl = document.getElementById('systemLoad');
        
        if (activeSessionsEl) activeSessionsEl.textContent = activeSessions;
        if (systemLoadEl) systemLoadEl.textContent = `${systemLoad}%`;
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
    
    updateNotifications() {
        const notificationCount = this.dashboardData.notifications.filter(n => !n.read).length;
        
        if (window.superAdminNavigation) {
            window.superAdminNavigation.updateNotificationCount(notificationCount);
        }
    }
    
    initializeAllCharts() {
        this.initializeSystemOverviewChart();
        this.initializeUserGrowthChart();
        this.initializeFactoryPerformanceChart();
        this.initializeCaseResolutionChart();
        this.initializeSystemHealthChart();
        this.initializeRevenueChart();
    }
    
    initializeSystemOverviewChart() {
        const ctx = document.getElementById('systemOverviewChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.getSystemOverviewData();
        
        this.charts.systemOverview = new Chart(chartCtx, {
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
    
    initializeUserGrowthChart() {
        const ctx = document.getElementById('userGrowthChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.dashboardData.analytics.userGrowth;
        
        this.charts.userGrowth = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'User Growth',
                    data: data.values,
                    borderColor: 'var(--primary-500)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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
    
    initializeFactoryPerformanceChart() {
        const ctx = document.getElementById('factoryPerformanceChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.dashboardData.analytics.factoryPerformance;
        
        this.charts.factoryPerformance = new Chart(chartCtx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'var(--success-500)',
                        'var(--warning-500)',
                        'var(--danger-500)',
                        'var(--info-500)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    initializeCaseResolutionChart() {
        const ctx = document.getElementById('caseResolutionChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.dashboardData.analytics.caseResolution;
        
        this.charts.caseResolution = new Chart(chartCtx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Cases Resolved',
                    data: data.values,
                    backgroundColor: 'var(--success-500)',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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
    
    initializeSystemHealthChart() {
        const ctx = document.getElementById('systemHealthChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.getSystemHealthData();
        
        this.charts.systemHealth = new Chart(chartCtx, {
            type: 'radar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'System Health',
                    data: data.values,
                    borderColor: 'var(--success-500)',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    pointBackgroundColor: 'var(--success-500)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'var(--success-500)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }
    
    initializeRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.dashboardData.analytics.revenueMetrics;
        
        this.charts.revenue = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Revenue',
                    data: data.values,
                    borderColor: 'var(--primary-500)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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
    
    setupRealTimeUpdates() {
        // Setup real-time listeners for critical data
        this.setupUserUpdates();
        this.setupFactoryUpdates();
        this.setupCaseUpdates();
        this.setupSystemLogUpdates();
    }
    
    setupUserUpdates() {
        if (!this.onSnapshot) return;
        
        const usersRef = this.collection(this.db, 'users');
        this.realTimeUpdates = this.onSnapshot(usersRef, (snapshot) => {
            this.dashboardData.users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.updateAllMetrics();
        });
    }
    
    setupFactoryUpdates() {
        if (!this.onSnapshot) return;
        
        const factoriesRef = this.collection(this.db, 'factories');
        this.realTimeUpdates = this.onSnapshot(factoriesRef, (snapshot) => {
            this.dashboardData.factories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.updateAllMetrics();
        });
    }
    
    setupCaseUpdates() {
        if (!this.onSnapshot) return;
        
        const casesRef = this.collection(this.db, 'cases');
        this.realTimeUpdates = this.onSnapshot(casesRef, (snapshot) => {
            this.dashboardData.cases = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.updateAllMetrics();
        });
    }
    
    setupSystemLogUpdates() {
        if (!this.onSnapshot) return;
        
        const logsRef = this.collection(this.db, 'system_logs');
        const q = this.query(logsRef, this.orderBy('timestamp', 'desc'), this.limit(10));
        
        this.realTimeUpdates = this.onSnapshot(q, (snapshot) => {
            this.dashboardData.systemLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.updateRecentActivity();
        });
    }
    
    initializeSystemMonitoring() {
        // Initialize system monitoring and health checks
        this.startSystemHealthMonitoring();
        this.startPerformanceMonitoring();
        this.startSecurityMonitoring();
    }
    
    startSystemHealthMonitoring() {
        setInterval(() => {
            this.checkSystemHealth();
        }, 30000); // Check every 30 seconds
    }
    
    startPerformanceMonitoring() {
        setInterval(() => {
            this.monitorPerformance();
        }, 60000); // Check every minute
    }
    
    startSecurityMonitoring() {
        setInterval(() => {
            this.monitorSecurity();
        }, 300000); // Check every 5 minutes
    }
    
    // Analytics calculation methods
    calculateUserGrowth() {
        const now = new Date();
        const labels = [];
        const values = [];
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
            
            const monthUsers = this.dashboardData.users.filter(user => {
                const userDate = user.createdAt ? user.createdAt.toDate() : new Date(user.createdAt);
                return userDate.getMonth() === date.getMonth() && userDate.getFullYear() === date.getFullYear();
            }).length;
            
            values.push(monthUsers);
        }
        
        return { labels, values };
    }
    
    calculateFactoryPerformance() {
        const factories = this.dashboardData.factories;
        const total = factories.length;
        
        return {
            labels: ['Excellent', 'Good', 'Needs Improvement', 'Critical'],
            values: [
                Math.floor(total * 0.4),
                Math.floor(total * 0.35),
                Math.floor(total * 0.2),
                Math.floor(total * 0.05)
            ]
        };
    }
    
    calculateCaseResolution() {
        const now = new Date();
        const labels = [];
        const values = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            
            const dayCases = this.dashboardData.cases.filter(caseItem => {
                const caseDate = caseItem.resolvedAt ? caseItem.resolvedAt.toDate() : new Date(caseItem.resolvedAt);
                return caseDate.toDateString() === date.toDateString();
            }).length;
            
            values.push(dayCases);
        }
        
        return { labels, values };
    }
    
    calculateAuditCompliance() {
        const audits = this.dashboardData.audits;
        const total = audits.length;
        const compliant = audits.filter(a => a.status === 'compliant').length;
        
        return Math.round((compliant / total) * 100) || 0;
    }
    
    calculateSystemUsage() {
        const users = this.dashboardData.users;
        const activeUsers = users.filter(u => u.lastLogin && this.isRecentLogin(u.lastLogin)).length;
        
        return Math.round((activeUsers / users.length) * 100) || 0;
    }
    
    calculateRevenueMetrics() {
        const now = new Date();
        const labels = [];
        const values = [];
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
            
            // Mock revenue calculation - in real implementation, this would come from billing data
            const revenue = Math.floor(Math.random() * 50000) + 10000;
            values.push(revenue);
        }
        
        return { labels, values };
    }
    
    // System health check methods
    checkDatabaseHealth() {
        // Mock database health check
        return Math.floor(Math.random() * 5) + 95; // 95-99%
    }
    
    checkAuthenticationHealth() {
        // Mock authentication health check
        return 100;
    }
    
    checkStorageHealth() {
        // Mock storage health check
        return Math.floor(Math.random() * 10) + 85; // 85-94%
    }
    
    checkAPIHealth() {
        // Mock API health check
        return Math.floor(Math.random() * 3) + 97; // 97-99%
    }
    
    checkMonitoringHealth() {
        // Mock monitoring health check
        return 100;
    }
    
    checkSecurityHealth() {
        // Mock security health check
        return Math.floor(Math.random() * 5) + 95; // 95-99%
    }
    
    calculateOverallSystemHealth() {
        const health = this.dashboardData.systemHealth;
        const values = Object.values(health);
        return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
    }
    
    getSystemHealthData() {
        const health = this.dashboardData.systemHealth;
        return {
            labels: Object.keys(health).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
            values: Object.values(health)
        };
    }
    
    // Utility methods
    calculateOnlineUsers() {
        return Math.floor(this.dashboardData.users.length * 0.3);
    }
    
    calculatePendingApprovals() {
        return this.dashboardData.users.filter(u => u.status === 'pending').length +
               this.dashboardData.factories.filter(f => f.status === 'pending').length;
    }
    
    calculateSystemAlerts() {
        return this.dashboardData.notifications.filter(n => !n.read).length;
    }
    
    calculateStorageUsed() {
        return Math.floor(Math.random() * 30) + 60; // 60-90%
    }
    
    calculateActiveSessions() {
        return Math.floor(this.dashboardData.users.length * 0.2);
    }
    
    calculateSystemLoad() {
        return Math.floor(Math.random() * 40) + 30; // 30-70%
    }
    
    isRecentLogin(lastLogin) {
        if (!lastLogin) return false;
        const loginDate = lastLogin.toDate ? lastLogin.toDate() : new Date(lastLogin);
        const now = new Date();
        const diffInHours = (now - loginDate) / (1000 * 60 * 60);
        return diffInHours < 24;
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
        const health = this.dashboardData.systemHealth;
        
        return Object.entries(health).map(([key, value]) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: `${value}%`,
            status: value >= 95 ? 'healthy' : value >= 85 ? 'warning' : 'critical'
        }));
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
    
    checkSystemHealth() {
        console.log('Checking system health...');
        // Implement system health checks
    }
    
    monitorPerformance() {
        console.log('Monitoring performance...');
        // Implement performance monitoring
    }
    
    monitorSecurity() {
        console.log('Monitoring security...');
        // Implement security monitoring
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

// Initialize the enhanced dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the enhanced super admin dashboard
    window.superAdminDashboardEnhanced = new SuperAdminDashboardEnhanced();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuperAdminDashboardEnhanced;
}
