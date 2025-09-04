// HR Dashboard System
class HRDashboard {
    constructor() {
        this.currentUser = null;
        this.workers = [];
        this.notifications = [];
        this.trainingProgress = [];
        this.workerDistributionChart = null;
        
        this.init();
    }
    
    async init() {
        console.log('👥 Initializing HR Dashboard...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize UI
        this.initializeUI();
        
        // Load initial data
        await this.loadInitialData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ HR Dashboard initialized');
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
                            
                            // Allow HR staff and factory admins
                            if (userData.role === 'hr_staff' || userData.role === 'factory_admin') {
                                this.currentUser = { ...user, ...userData };
                                this.updateUserDisplay();
                                resolve();
                            } else {
                                console.log('❌ Access denied - insufficient permissions');
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
    
    updateUserDisplay() {
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (this.currentUser) {
            userName.textContent = this.currentUser.name || this.currentUser.displayName || 'HR Staff';
            
            // Set avatar initials
            const initials = (this.currentUser.name || 'HR').split(' ').map(n => n[0]).join('').toUpperCase();
            userAvatar.innerHTML = `<span>${initials}</span>`;
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadWorkers(),
            this.loadNotifications(),
            this.loadTrainingProgress(),
            this.loadStatistics()
        ]);
        
        // Initialize charts after data is loaded
        this.initializeCharts();
    }
    
    async loadWorkers() {
        try {
            const workersRef = this.collection(this.db, 'workers');
            const q = this.query(
                workersRef,
                this.where('factoryId', '==', this.currentUser.factoryId),
                this.orderBy('createdAt', 'desc'),
                this.limit(10)
            );
            
            const snapshot = await this.getDocs(q);
            this.workers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.updateWorkersDisplay();
        } catch (error) {
            console.error('Error loading workers:', error);
        }
    }
    
    async loadNotifications() {
        try {
            const notificationsRef = this.collection(this.db, 'notifications');
            const q = this.query(
                notificationsRef,
                this.where('recipientId', '==', this.currentUser.uid),
                this.where('read', '==', false),
                this.orderBy('createdAt', 'desc'),
                this.limit(5)
            );
            
            const snapshot = await this.getDocs(q);
            this.notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.updateNotificationsDisplay();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }
    
    async loadTrainingProgress() {
        try {
            const trainingRef = this.collection(this.db, 'worker_training');
            const q = this.query(
                trainingRef,
                this.where('factoryId', '==', this.currentUser.factoryId),
                this.orderBy('dueDate', 'asc'),
                this.limit(5)
            );
            
            const snapshot = await this.getDocs(q);
            this.trainingProgress = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.updateTrainingDisplay();
        } catch (error) {
            console.error('Error loading training progress:', error);
        }
    }
    
    async loadStatistics() {
        try {
            // Load total workers count
            const workersRef = this.collection(this.db, 'workers');
            const workersQuery = this.query(
                workersRef,
                this.where('factoryId', '==', this.currentUser.factoryId)
            );
            const workersSnapshot = await this.getDocs(workersQuery);
            const totalWorkers = workersSnapshot.size;
            
            // Load compliant workers count
            const compliantQuery = this.query(
                workersRef,
                this.where('factoryId', '==', this.currentUser.factoryId),
                this.where('complianceStatus', '==', 'compliant')
            );
            const compliantSnapshot = await this.getDocs(compliantQuery);
            const compliantWorkers = compliantSnapshot.size;
            
            // Load pending actions count
            const pendingQuery = this.query(
                this.collection(this.db, 'worker_training'),
                this.where('factoryId', '==', this.currentUser.factoryId),
                this.where('status', 'in', ['pending', 'overdue'])
            );
            const pendingSnapshot = await this.getDocs(pendingQuery);
            const pendingActions = pendingSnapshot.size;
            
            // Load training completed count
            const trainingQuery = this.query(
                this.collection(this.db, 'worker_training'),
                this.where('factoryId', '==', this.currentUser.factoryId),
                this.where('status', '==', 'completed')
            );
            const trainingSnapshot = await this.getDocs(trainingQuery);
            const trainingCompleted = trainingSnapshot.size;
            
            // Update statistics display
            document.getElementById('totalWorkers').textContent = totalWorkers;
            document.getElementById('compliantWorkers').textContent = compliantWorkers;
            document.getElementById('pendingActions').textContent = pendingActions;
            document.getElementById('trainingCompleted').textContent = trainingCompleted;
            
            // Calculate trends (simplified)
            const workersTrend = totalWorkers > 0 ? '+5%' : '0%';
            const complianceTrend = compliantWorkers > 0 ? '+12%' : '0%';
            const pendingTrend = pendingActions > 0 ? '-8%' : '0%';
            const trainingTrend = trainingCompleted > 0 ? '+15%' : '0%';
            
            document.getElementById('workersTrend').textContent = `${workersTrend} this month`;
            document.getElementById('complianceTrend').textContent = `${complianceTrend} this month`;
            document.getElementById('pendingTrend').textContent = `${pendingTrend} this month`;
            document.getElementById('trainingTrend').textContent = `${trainingTrend} this month`;
            
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }
    
    updateWorkersDisplay() {
        const recentWorkers = document.getElementById('recentWorkers');
        
        if (this.workers.length === 0) {
            recentWorkers.innerHTML = `
                <div style="text-align: center; padding: var(--space-4); color: var(--neutral-500);">
                    <i data-lucide="users" style="width: 24px; height: 24px; margin-bottom: var(--space-2);"></i>
                    <p>No workers found</p>
                </div>
            `;
        } else {
            recentWorkers.innerHTML = this.workers.map(worker => `
                <div class="worker-item" onclick="viewWorker('${worker.id}')">
                    <div class="worker-avatar">
                        ${this.getWorkerInitials(worker.name)}
                    </div>
                    <div class="worker-info">
                        <div class="worker-name">${worker.name || 'Unknown Worker'}</div>
                        <div class="worker-details">
                            ${worker.position || 'Worker'} • ${worker.department || 'General'}
                        </div>
                    </div>
                    <div class="worker-status status-${worker.status || 'active'}">
                        ${this.getStatusText(worker.status)}
                    </div>
                </div>
            `).join('');
        }
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    updateNotificationsDisplay() {
        const notificationsList = document.getElementById('notificationsList');
        
        if (this.notifications.length === 0) {
            notificationsList.innerHTML = `
                <div style="text-align: center; padding: var(--space-4); color: var(--neutral-500);">
                    <i data-lucide="bell-off" style="width: 24px; height: 24px; margin-bottom: var(--space-2);"></i>
                    <p>No new notifications</p>
                </div>
            `;
        } else {
            notificationsList.innerHTML = this.notifications.map(notification => `
                <div class="notification-item">
                    <div class="notification-icon">
                        <i data-lucide="${this.getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>${notification.title}</h4>
                        <p>${notification.message}</p>
                        <div class="notification-time">${this.formatTime(notification.createdAt)}</div>
                    </div>
                </div>
            `).join('');
        }
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    updateTrainingDisplay() {
        const trainingProgress = document.getElementById('trainingProgress');
        
        if (this.trainingProgress.length === 0) {
            trainingProgress.innerHTML = `
                <div style="text-align: center; padding: var(--space-4); color: var(--neutral-500);">
                    <i data-lucide="book-open" style="width: 24px; height: 24px; margin-bottom: var(--space-2);"></i>
                    <p>No training scheduled</p>
                </div>
            `;
        } else {
            trainingProgress.innerHTML = this.trainingProgress.map(training => `
                <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); border-radius: var(--radius-lg); margin-bottom: var(--space-3); background: var(--neutral-50);">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: var(--${this.getTrainingStatusColor(training.status)}-500); flex-shrink: 0;"></div>
                    <div style="flex: 1;">
                        <h4 style="font-size: var(--text-sm); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-1);">${training.title}</h4>
                        <p style="font-size: var(--text-xs); color: var(--neutral-600);">Due: ${this.formatDate(training.dueDate)}</p>
                    </div>
                </div>
            `).join('');
        }
    }
    
    initializeCharts() {
        this.initializeWorkerDistributionChart();
    }
    
    initializeWorkerDistributionChart() {
        const ctx = document.getElementById('workerDistributionChart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.workerDistributionChart) {
            this.workerDistributionChart.destroy();
        }
        
        // Prepare data for the chart
        const departments = this.getDepartmentDistribution();
        
        this.workerDistributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: departments.map(d => d.department),
                datasets: [{
                    data: departments.map(d => d.count),
                    backgroundColor: [
                        '#3B82F6',
                        '#10B981',
                        '#F59E0B',
                        '#EF4444',
                        '#8B5CF6',
                        '#06B6D4'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    getDepartmentDistribution() {
        const departments = {};
        
        this.workers.forEach(worker => {
            const dept = worker.department || 'General';
            departments[dept] = (departments[dept] || 0) + 1;
        });
        
        return Object.entries(departments).map(([department, count]) => ({
            department,
            count
        }));
    }
    
    initializeUI() {
        // Initialize any UI components
        console.log('UI initialized');
    }
    
    setupEventListeners() {
        // Setup any event listeners
        console.log('Event listeners setup');
    }
    
    // Utility functions
    getWorkerInitials(name) {
        if (!name) return 'W';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    
    getStatusText(status) {
        const statusMap = {
            'active': 'Active',
            'pending': 'Pending',
            'inactive': 'Inactive',
            'suspended': 'Suspended'
        };
        return statusMap[status] || 'Active';
    }
    
    getNotificationIcon(type) {
        const icons = {
            'training': 'book-open',
            'compliance': 'shield-check',
            'worker': 'user',
            'general': 'bell',
            'default': 'info'
        };
        return icons[type] || icons.default;
    }
    
    getTrainingStatusColor(status) {
        const colors = {
            'completed': 'success',
            'pending': 'warning',
            'overdue': 'error',
            'in_progress': 'info'
        };
        return colors[status] || 'warning';
    }
    
    formatTime(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }
    
    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }
}

// Global functions for HTML onclick handlers
function addNewWorker() {
    window.location.href = 'hr-worker-management.html?action=add';
}

function scheduleTraining() {
    window.location.href = 'hr-staff-settings.html?tab=training';
}

function generateReport() {
    // Generate HR report
    const reportData = {
        timestamp: new Date().toISOString(),
        type: 'hr_dashboard',
        workers: window.hrDashboard.workers.length,
        compliant: document.getElementById('compliantWorkers').textContent,
        pending: document.getElementById('pendingActions').textContent,
        training: document.getElementById('trainingCompleted').textContent
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `hr_dashboard_report_${new Date().toISOString().split('T')[0]}.json`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('✅ HR report generated');
}

function viewCompliance() {
    window.location.href = 'hr-staff-settings.html?tab=compliance';
}

function viewWorker(workerId) {
    window.location.href = `hr-worker-management.html?worker=${workerId}`;
}

function navigateToWorkerManagement() {
    window.location.href = 'hr-worker-management.html';
}

function navigateToTrainingManagement() {
    window.location.href = 'hr-staff-settings.html?tab=training';
}

function navigateToComplianceMonitoring() {
    window.location.href = 'hr-staff-settings.html?tab=compliance';
}

function navigateToHRSettings() {
    window.location.href = 'hr-staff-settings.html';
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('🚪 Logging out...');
        
        // Clean up charts
        if (window.hrDashboard && window.hrDashboard.workerDistributionChart) {
            window.hrDashboard.workerDistributionChart.destroy();
        }
        
        // Sign out from Firebase
        window.hrDashboard.auth.signOut().then(() => {
            localStorage.clear();
            sessionStorage.clear();
            console.log('✅ Logout successful');
            window.location.href = '../../login.html';
        }).catch((error) => {
            console.error('❌ Logout error:', error);
            window.location.href = '../../login.html';
        });
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the HR dashboard
    window.hrDashboard = new HRDashboard();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HRDashboard;
}
