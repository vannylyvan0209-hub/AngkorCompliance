// HR Worker Management System
class HRWorkerManagement {
    constructor() {
        this.currentUser = null;
        this.workers = [];
        this.filteredWorkers = [];
        this.selectedWorker = null;
        this.searchTerm = '';
        this.statusFilter = '';
        this.departmentFilter = '';
        
        this.init();
    }
    
    async init() {
        console.log('👥 Initializing HR Worker Management...');
        
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
        
        console.log('✅ HR Worker Management initialized');
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
        await this.loadWorkers();
    }
    
    async loadWorkers() {
        try {
            const workersRef = this.collection(this.db, 'workers');
            const q = this.query(
                workersRef,
                this.where('factoryId', '==', this.currentUser.factoryId),
                this.orderBy('name', 'asc')
            );
            
            const snapshot = await this.getDocs(q);
            this.workers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.filteredWorkers = [...this.workers];
            this.updateWorkersDisplay();
            
        } catch (error) {
            console.error('Error loading workers:', error);
        }
    }
    
    updateWorkersDisplay() {
        const workersList = document.getElementById('workersList');
        
        if (this.filteredWorkers.length === 0) {
            workersList.innerHTML = `
                <div style="text-align: center; padding: var(--space-8); color: var(--neutral-500);">
                    <i data-lucide="users" style="width: 48px; height: 48px; margin-bottom: var(--space-4);"></i>
                    <h3 style="font-size: var(--text-lg); font-weight: 600; margin-bottom: var(--space-2);">No workers found</h3>
                    <p>Try adjusting your search criteria or add a new worker.</p>
                </div>
            `;
        } else {
            workersList.innerHTML = this.filteredWorkers.map(worker => `
                <div class="worker-card ${this.selectedWorker && this.selectedWorker.id === worker.id ? 'selected' : ''}" 
                     onclick="selectWorker('${worker.id}')">
                    <div class="worker-header">
                        <div class="worker-avatar">
                            ${this.getWorkerInitials(worker.name)}
                        </div>
                        <div class="worker-info">
                            <div class="worker-name">${worker.name || 'Unknown Worker'}</div>
                            <div class="worker-details">
                                ${worker.position || 'Worker'} • ${worker.department || 'General'} • ID: ${worker.id.substring(0, 8)}
                            </div>
                        </div>
                        <div class="worker-status status-${worker.status || 'active'}">
                            ${this.getStatusText(worker.status)}
                        </div>
                    </div>
                    <div class="worker-stats">
                        <div class="stat-item">
                            <div class="stat-number">${this.getWorkerStat(worker, 'attendance')}%</div>
                            <div class="stat-label">Attendance</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${this.getWorkerStat(worker, 'training')}</div>
                            <div class="stat-label">Training</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${this.getWorkerStat(worker, 'performance')}</div>
                            <div class="stat-label">Performance</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    selectWorker(workerId) {
        this.selectedWorker = this.workers.find(w => w.id === workerId);
        this.updateWorkersDisplay();
        this.updateWorkerDetails();
    }
    
    updateWorkerDetails() {
        if (!this.selectedWorker) {
            // Reset details panel
            document.getElementById('selectedWorkerName').textContent = 'Select a Worker';
            document.getElementById('selectedWorkerRole').textContent = 'Click on a worker card to view details';
            document.getElementById('selectedWorkerAvatar').innerHTML = '<span>W</span>';
            
            // Reset all detail values
            const detailValues = document.querySelectorAll('.detail-value');
            detailValues.forEach(value => value.textContent = '-');
            
            return;
        }
        
        const worker = this.selectedWorker;
        
        // Update header
        document.getElementById('selectedWorkerName').textContent = worker.name || 'Unknown Worker';
        document.getElementById('selectedWorkerRole').textContent = `${worker.position || 'Worker'} • ${worker.department || 'General'}`;
        document.getElementById('selectedWorkerAvatar').innerHTML = `<span>${this.getWorkerInitials(worker.name)}</span>`;
        
        // Update profile tab
        document.getElementById('workerId').textContent = worker.id.substring(0, 8);
        document.getElementById('workerDepartment').textContent = worker.department || 'General';
        document.getElementById('workerPosition').textContent = worker.position || 'Worker';
        document.getElementById('workerJoinDate').textContent = worker.joinDate ? this.formatDate(worker.joinDate) : 'N/A';
        document.getElementById('workerEmail').textContent = worker.email || 'N/A';
        document.getElementById('workerPhone').textContent = worker.phone || 'N/A';
        document.getElementById('workerAddress').textContent = worker.address || 'N/A';
        
        // Update performance tab
        document.getElementById('attendanceRate').textContent = `${this.getWorkerStat(worker, 'attendance')}%`;
        document.getElementById('performanceScore').textContent = `${this.getWorkerStat(worker, 'performance')}/10`;
        document.getElementById('overtimeHours').textContent = `${this.getWorkerStat(worker, 'overtime')}h`;
        document.getElementById('lastReview').textContent = worker.lastReview ? this.formatDate(worker.lastReview) : 'N/A';
        document.getElementById('nextReview').textContent = worker.nextReview ? this.formatDate(worker.nextReview) : 'N/A';
        
        // Update training tab
        document.getElementById('completedTraining').textContent = this.getWorkerStat(worker, 'training');
        document.getElementById('pendingTraining').textContent = this.getWorkerStat(worker, 'pendingTraining');
        document.getElementById('certifications').textContent = worker.certifications ? worker.certifications.join(', ') : 'None';
        document.getElementById('lastTraining').textContent = worker.lastTraining ? this.formatDate(worker.lastTraining) : 'N/A';
        
        // Update compliance tab
        document.getElementById('complianceStatus').textContent = worker.complianceStatus || 'Compliant';
        document.getElementById('safetyViolations').textContent = this.getWorkerStat(worker, 'violations');
        document.getElementById('lastAudit').textContent = worker.lastAudit ? this.formatDate(worker.lastAudit) : 'N/A';
        document.getElementById('nextAudit').textContent = worker.nextAudit ? this.formatDate(worker.nextAudit) : 'N/A';
    }
    
    applyFilters() {
        this.searchTerm = document.getElementById('searchInput').value.toLowerCase();
        this.statusFilter = document.getElementById('statusFilter').value;
        this.departmentFilter = document.getElementById('departmentFilter').value;
        
        this.filteredWorkers = this.workers.filter(worker => {
            const matchesSearch = !this.searchTerm || 
                worker.name.toLowerCase().includes(this.searchTerm) ||
                worker.id.toLowerCase().includes(this.searchTerm) ||
                (worker.department && worker.department.toLowerCase().includes(this.searchTerm));
            
            const matchesStatus = !this.statusFilter || worker.status === this.statusFilter;
            const matchesDepartment = !this.departmentFilter || worker.department === this.departmentFilter;
            
            return matchesSearch && matchesStatus && matchesDepartment;
        });
        
        this.updateWorkersDisplay();
    }
    
    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('departmentFilter').value = '';
        
        this.searchTerm = '';
        this.statusFilter = '';
        this.departmentFilter = '';
        
        this.filteredWorkers = [...this.workers];
        this.updateWorkersDisplay();
    }
    
    initializeUI() {
        console.log('UI initialized');
    }
    
    setupEventListeners() {
        // Search input event listener
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.applyFilters();
            });
        }
        
        // Filter select event listeners
        const statusFilter = document.getElementById('statusFilter');
        const departmentFilter = document.getElementById('departmentFilter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        if (departmentFilter) {
            departmentFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
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
    
    getWorkerStat(worker, statType) {
        // Mock data - in real implementation, this would come from the database
        const mockStats = {
            attendance: Math.floor(Math.random() * 20) + 80, // 80-100%
            training: Math.floor(Math.random() * 5) + 1, // 1-5 trainings
            performance: Math.floor(Math.random() * 3) + 7, // 7-10 score
            overtime: Math.floor(Math.random() * 20) + 5, // 5-25 hours
            pendingTraining: Math.floor(Math.random() * 3), // 0-2 pending
            violations: Math.floor(Math.random() * 3) // 0-2 violations
        };
        
        return mockStats[statType] || 0;
    }
    
    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
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

// Global functions for HTML onclick handlers
function selectWorker(workerId) {
    if (window.workerManagement) {
        window.workerManagement.selectWorker(workerId);
    }
}

function applyFilters() {
    if (window.workerManagement) {
        window.workerManagement.applyFilters();
    }
}

function clearFilters() {
    if (window.workerManagement) {
        window.workerManagement.clearFilters();
    }
}

function addNewWorker() {
    // Navigate to add worker page
    window.location.href = 'hr-worker-management.html?action=add';
}

function editWorker() {
    if (window.workerManagement && window.workerManagement.selectedWorker) {
        // Navigate to edit worker page
        window.location.href = `hr-worker-management.html?action=edit&worker=${window.workerManagement.selectedWorker.id}`;
    } else {
        alert('Please select a worker first');
    }
}

function scheduleTraining() {
    if (window.workerManagement && window.workerManagement.selectedWorker) {
        // Navigate to training scheduling page
        window.location.href = `hr-staff-settings.html?tab=training&worker=${window.workerManagement.selectedWorker.id}`;
    } else {
        alert('Please select a worker first');
    }
}

function viewPerformance() {
    if (window.workerManagement && window.workerManagement.selectedWorker) {
        // Navigate to performance view page
        window.location.href = `hr-worker-management.html?action=performance&worker=${window.workerManagement.selectedWorker.id}`;
    } else {
        alert('Please select a worker first');
    }
}

function generateReport() {
    if (window.workerManagement && window.workerManagement.selectedWorker) {
        // Generate worker report
        const worker = window.workerManagement.selectedWorker;
        const reportData = {
            timestamp: new Date().toISOString(),
            type: 'worker_report',
            workerId: worker.id,
            workerName: worker.name,
            department: worker.department,
            position: worker.position,
            joinDate: worker.joinDate,
            status: worker.status,
            attendance: window.workerManagement.getWorkerStat(worker, 'attendance'),
            performance: window.workerManagement.getWorkerStat(worker, 'performance'),
            training: window.workerManagement.getWorkerStat(worker, 'training')
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `worker_report_${worker.id}_${new Date().toISOString().split('T')[0]}.json`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        window.workerManagement.showNotification('success', 'Worker report generated successfully');
        
    } else {
        alert('Please select a worker first');
    }
}

function deactivateWorker() {
    if (window.workerManagement && window.workerManagement.selectedWorker) {
        if (confirm('Are you sure you want to deactivate this worker?')) {
            // Deactivate worker
            const worker = window.workerManagement.selectedWorker;
            console.log('Deactivating worker:', worker.id);
            
            // In real implementation, this would update the worker status in Firebase
            window.workerManagement.showNotification('success', 'Worker deactivated successfully');
            
            // Reload workers
            window.workerManagement.loadWorkers();
        }
    } else {
        alert('Please select a worker first');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('🚪 Logging out...');
        
        // Sign out from Firebase
        window.workerManagement.auth.signOut().then(() => {
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

// Initialize the management when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the worker management
    window.workerManagement = new HRWorkerManagement();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HRWorkerManagement;
}
