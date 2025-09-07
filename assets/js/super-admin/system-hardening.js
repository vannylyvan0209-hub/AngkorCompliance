// System Hardening & Security System for Super Admin
class SystemHardeningSystem {
    constructor() {
        this.currentUser = null;
        this.securityTests = [];
        this.performanceMetrics = {};
        this.goLiveChecklist = [];
        this.charts = {};
        
        this.init();
    }
    
    async init() {
        console.log('🔒 Initializing System Hardening & Security System...');
        
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
        
        console.log('✅ System Hardening & Security System initialized');
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
            window.superAdminNavigation.updateCurrentPage('System Hardening');
        } else {
            // Retry after a short delay
            setTimeout(() => {
                this.initializeNavigation();
            }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadSecurityTests(),
            this.loadPerformanceMetrics(),
            this.loadGoLiveChecklist()
        ]);
        
        this.renderSecurityTests();
        this.renderGoLiveChecklist();
        this.updatePerformanceMetrics();
    }
    
    async loadSecurityTests() {
        try {
            const testsRef = this.collection(this.db, 'security_tests');
            const snapshot = await this.getDocs(testsRef);
            this.securityTests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // If no tests in database, use default tests
            if (this.securityTests.length === 0) {
                this.securityTests = this.getDefaultSecurityTests();
            }
            
            console.log(`✓ Loaded ${this.securityTests.length} security tests`);
            
        } catch (error) {
            console.error('Error loading security tests:', error);
            this.securityTests = this.getDefaultSecurityTests();
        }
    }
    
    async loadPerformanceMetrics() {
        try {
            const metricsRef = this.collection(this.db, 'performance_metrics');
            const snapshot = await this.getDocs(metricsRef);
            this.performanceMetrics = {};
            
            snapshot.docs.forEach(doc => {
                this.performanceMetrics[doc.id] = doc.data();
            });
            
            console.log('✓ Loaded performance metrics');
            
        } catch (error) {
            console.error('Error loading performance metrics:', error);
        }
    }
    
    async loadGoLiveChecklist() {
        try {
            const checklistRef = this.collection(this.db, 'go_live_checklist');
            const snapshot = await this.getDocs(checklistRef);
            this.goLiveChecklist = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // If no checklist in database, use default checklist
            if (this.goLiveChecklist.length === 0) {
                this.goLiveChecklist = this.getDefaultGoLiveChecklist();
            }
            
            console.log(`✓ Loaded ${this.goLiveChecklist.length} go-live checklist items`);
            
        } catch (error) {
            console.error('Error loading go-live checklist:', error);
            this.goLiveChecklist = this.getDefaultGoLiveChecklist();
        }
    }
    
    getDefaultSecurityTests() {
        return [
            {
                id: 'auth_test',
                name: 'Authentication Security',
                description: 'Test multi-factor authentication and access controls',
                status: 'passed',
                lastRun: new Date(),
                category: 'authentication'
            },
            {
                id: 'db_test',
                name: 'Database Security',
                description: 'Test database encryption and access controls',
                status: 'failed',
                lastRun: new Date(),
                category: 'database'
            },
            {
                id: 'network_test',
                name: 'Network Security',
                description: 'Test firewall rules and network access controls',
                status: 'passed',
                lastRun: new Date(),
                category: 'network'
            },
            {
                id: 'ssl_test',
                name: 'SSL/TLS Configuration',
                description: 'Test SSL certificate validity and configuration',
                status: 'failed',
                lastRun: new Date(),
                category: 'ssl'
            },
            {
                id: 'api_test',
                name: 'API Security',
                description: 'Test API endpoints for security vulnerabilities',
                status: 'pending',
                lastRun: null,
                category: 'api'
            },
            {
                id: 'backup_test',
                name: 'Backup Security',
                description: 'Test backup encryption and access controls',
                status: 'passed',
                lastRun: new Date(),
                category: 'backup'
            }
        ];
    }
    
    getDefaultGoLiveChecklist() {
        return [
            {
                id: 'security_audit',
                title: 'Complete Security Audit',
                description: 'Run comprehensive security tests and fix all critical issues',
                completed: false,
                priority: 'high'
            },
            {
                id: 'performance_test',
                title: 'Performance Testing',
                description: 'Conduct load testing and optimize system performance',
                completed: false,
                priority: 'high'
            },
            {
                id: 'backup_verification',
                title: 'Backup System Verification',
                description: 'Verify backup systems and disaster recovery procedures',
                completed: true,
                priority: 'high'
            },
            {
                id: 'ssl_certificates',
                title: 'SSL Certificate Renewal',
                description: 'Ensure all SSL certificates are valid and properly configured',
                completed: false,
                priority: 'high'
            },
            {
                id: 'monitoring_setup',
                title: 'Monitoring System Setup',
                description: 'Configure system monitoring and alerting',
                completed: true,
                priority: 'medium'
            },
            {
                id: 'documentation',
                title: 'System Documentation',
                description: 'Complete system documentation and user guides',
                completed: false,
                priority: 'medium'
            },
            {
                id: 'user_training',
                title: 'User Training',
                description: 'Conduct user training sessions and prepare support materials',
                completed: false,
                priority: 'medium'
            },
            {
                id: 'go_live_plan',
                title: 'Go-Live Plan',
                description: 'Create detailed go-live plan with rollback procedures',
                completed: false,
                priority: 'low'
            }
        ];
    }
    
    renderSecurityTests() {
        const testsGrid = document.getElementById('securityTestsGrid');
        if (!testsGrid) return;
        
        testsGrid.innerHTML = this.securityTests.map(test => `
            <div class="test-item">
                <div class="test-item-header">
                    <div class="test-name">${test.name}</div>
                    <div class="test-status ${test.status}">${test.status}</div>
                </div>
                <div class="test-description">${test.description}</div>
                <div class="test-actions">
                    <button class="test-action-btn" onclick="runTest('${test.id}')">
                        <i data-lucide="play"></i>
                        Run
                    </button>
                    <button class="test-action-btn" onclick="viewTestDetails('${test.id}')">
                        <i data-lucide="eye"></i>
                        Details
                    </button>
                    <button class="test-action-btn" onclick="scheduleTest('${test.id}')">
                        <i data-lucide="calendar"></i>
                        Schedule
                    </button>
                </div>
            </div>
        `).join('');
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    renderGoLiveChecklist() {
        const checklist = document.getElementById('goLiveChecklist');
        if (!checklist) return;
        
        checklist.innerHTML = this.goLiveChecklist.map(item => `
            <div class="checklist-item">
                <div class="checklist-checkbox ${item.completed ? 'checked' : ''}" 
                     onclick="toggleChecklistItem('${item.id}')">
                    ${item.completed ? '<i data-lucide="check"></i>' : ''}
                </div>
                <div class="checklist-content">
                    <div class="checklist-title">${item.title}</div>
                    <div class="checklist-description">${item.description}</div>
                </div>
                <div class="checklist-priority priority-${item.priority}">
                    ${item.priority}
                </div>
            </div>
        `).join('');
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    updatePerformanceMetrics() {
        // Update performance metric values
        document.getElementById('responseTime').textContent = `${this.performanceMetrics.responseTime || 150}ms`;
        document.getElementById('cpuUsage').textContent = `${this.performanceMetrics.cpuUsage || 45}%`;
        document.getElementById('memoryUsage').textContent = `${this.performanceMetrics.memoryUsage || 62}%`;
        document.getElementById('diskUsage').textContent = `${this.performanceMetrics.diskUsage || 78}%`;
    }
    
    initializeUI() {
        // Initialize any UI components
    }
    
    initializeCharts() {
        this.initializePerformanceChart();
    }
    
    initializePerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.getPerformanceData();
        
        this.charts.performance = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Response Time (ms)',
                        data: data.responseTime,
                        borderColor: 'var(--primary-500)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'CPU Usage (%)',
                        data: data.cpuUsage,
                        borderColor: 'var(--warning-500)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Memory Usage (%)',
                        data: data.memoryUsage,
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
    
    getPerformanceData() {
        const now = new Date();
        const labels = [];
        const responseTime = [];
        const cpuUsage = [];
        const memoryUsage = [];
        
        // Generate data for the last 24 hours
        for (let i = 23; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 60 * 60 * 1000));
            labels.push(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            
            // Mock data - in real implementation, this would come from monitoring system
            responseTime.push(Math.floor(Math.random() * 100) + 100); // 100-200ms
            cpuUsage.push(Math.floor(Math.random() * 30) + 30); // 30-60%
            memoryUsage.push(Math.floor(Math.random() * 20) + 50); // 50-70%
        }
        
        return { labels, responseTime, cpuUsage, memoryUsage };
    }
    
    setupEventListeners() {
        // Setup global event listeners
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        // Security scan functionality
        window.runSecurityScan = () => {
            this.runSecurityScan();
        };
        
        window.generateReport = () => {
            this.generateReport();
        };
        
        // Security test actions
        window.runTest = (testId) => {
            this.runTest(testId);
        };
        
        window.viewTestDetails = (testId) => {
            this.viewTestDetails(testId);
        };
        
        window.scheduleTest = (testId) => {
            this.scheduleTest(testId);
        };
        
        window.runAllTests = () => {
            this.runAllTests();
        };
        
        window.scheduleTests = () => {
            this.scheduleTests();
        };
        
        // Go-live checklist actions
        window.toggleChecklistItem = (itemId) => {
            this.toggleChecklistItem(itemId);
        };
        
        window.markAllComplete = () => {
            this.markAllComplete();
        };
        
        // Security status actions
        window.viewAuthDetails = () => {
            this.viewAuthDetails();
        };
        
        window.configureAuth = () => {
            this.configureAuth();
        };
        
        window.viewDbDetails = () => {
            this.viewDbDetails();
        };
        
        window.fixDbIssues = () => {
            this.fixDbIssues();
        };
        
        window.viewNetworkDetails = () => {
            this.viewNetworkDetails();
        };
        
        window.configureNetwork = () => {
            this.configureNetwork();
        };
        
        window.viewSslDetails = () => {
            this.viewSslDetails();
        };
        
        window.renewSsl = () => {
            this.renewSsl();
        };
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        // Listen for security test updates
        const testsRef = this.collection(this.db, 'security_tests');
        this.onSnapshot(testsRef, (snapshot) => {
            this.securityTests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderSecurityTests();
        });
        
        // Listen for performance metrics updates
        const metricsRef = this.collection(this.db, 'performance_metrics');
        this.onSnapshot(metricsRef, (snapshot) => {
            this.performanceMetrics = {};
            snapshot.docs.forEach(doc => {
                this.performanceMetrics[doc.id] = doc.data();
            });
            this.updatePerformanceMetrics();
        });
    }
    
    // Security methods
    async runSecurityScan() {
        try {
            this.showNotification('info', 'Starting comprehensive security scan...');
            
            // Simulate security scan
            await this.simulateSecurityScan();
            
            this.showNotification('success', 'Security scan completed successfully');
            
        } catch (error) {
            console.error('Error running security scan:', error);
            this.showNotification('error', 'Security scan failed');
        }
    }
    
    async simulateSecurityScan() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Update test statuses
                this.securityTests.forEach(test => {
                    if (test.status === 'pending') {
                        test.status = Math.random() > 0.3 ? 'passed' : 'failed';
                        test.lastRun = new Date();
                    }
                });
                
                this.renderSecurityTests();
                resolve();
            }, 3000);
        });
    }
    
    async generateReport() {
        try {
            const reportData = {
                timestamp: new Date().toISOString(),
                securityTests: this.securityTests,
                performanceMetrics: this.performanceMetrics,
                goLiveChecklist: this.goLiveChecklist,
                summary: {
                    totalTests: this.securityTests.length,
                    passedTests: this.securityTests.filter(t => t.status === 'passed').length,
                    failedTests: this.securityTests.filter(t => t.status === 'failed').length,
                    completedChecklistItems: this.goLiveChecklist.filter(i => i.completed).length,
                    totalChecklistItems: this.goLiveChecklist.length
                }
            };
            
            // Convert to JSON and download
            const json = JSON.stringify(reportData, null, 2);
            this.downloadJSON(json, 'system-hardening-report.json');
            
            this.showNotification('success', 'System hardening report generated successfully');
            
        } catch (error) {
            console.error('Error generating report:', error);
            this.showNotification('error', 'Failed to generate report');
        }
    }
    
    async runTest(testId) {
        try {
            const test = this.securityTests.find(t => t.id === testId);
            if (!test) return;
            
            this.showNotification('info', `Running ${test.name}...`);
            
            // Simulate test execution
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update test status
            test.status = Math.random() > 0.2 ? 'passed' : 'failed';
            test.lastRun = new Date();
            
            this.renderSecurityTests();
            
            this.showNotification('success', `${test.name} completed`);
            
        } catch (error) {
            console.error('Error running test:', error);
            this.showNotification('error', 'Test execution failed');
        }
    }
    
    async runAllTests() {
        try {
            this.showNotification('info', 'Running all security tests...');
            
            for (const test of this.securityTests) {
                await this.runTest(test.id);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            this.showNotification('success', 'All security tests completed');
            
        } catch (error) {
            console.error('Error running all tests:', error);
            this.showNotification('error', 'Failed to run all tests');
        }
    }
    
    viewTestDetails(testId) {
        const test = this.securityTests.find(t => t.id === testId);
        if (!test) return;
        
        // Navigate to test details page
        window.location.href = `test-details.html?id=${testId}`;
    }
    
    scheduleTest(testId) {
        const test = this.securityTests.find(t => t.id === testId);
        if (!test) return;
        
        // Navigate to test scheduling page
        window.location.href = `test-scheduling.html?id=${testId}`;
    }
    
    scheduleTests() {
        // Navigate to test scheduling page
        window.location.href = 'test-scheduling.html';
    }
    
    async toggleChecklistItem(itemId) {
        try {
            const item = this.goLiveChecklist.find(i => i.id === itemId);
            if (!item) return;
            
            item.completed = !item.completed;
            
            // Update in database
            if (this.updateDoc) {
                const itemRef = this.doc(this.db, 'go_live_checklist', itemId);
                await this.updateDoc(itemRef, {
                    completed: item.completed,
                    updatedAt: this.serverTimestamp(),
                    updatedBy: this.currentUser.uid
                });
            }
            
            this.renderGoLiveChecklist();
            
            this.showNotification('success', `Checklist item ${item.completed ? 'completed' : 'unchecked'}`);
            
        } catch (error) {
            console.error('Error toggling checklist item:', error);
            this.showNotification('error', 'Failed to update checklist item');
        }
    }
    
    async markAllComplete() {
        try {
            this.goLiveChecklist.forEach(item => {
                item.completed = true;
            });
            
            this.renderGoLiveChecklist();
            
            this.showNotification('success', 'All checklist items marked as complete');
            
        } catch (error) {
            console.error('Error marking all complete:', error);
            this.showNotification('error', 'Failed to mark all items complete');
        }
    }
    
    // Security status methods
    viewAuthDetails() {
        // Navigate to authentication details page
        window.location.href = 'auth-details.html';
    }
    
    configureAuth() {
        // Navigate to authentication configuration page
        window.location.href = 'auth-configuration.html';
    }
    
    viewDbDetails() {
        // Navigate to database details page
        window.location.href = 'database-details.html';
    }
    
    fixDbIssues() {
        // Navigate to database issues page
        window.location.href = 'database-issues.html';
    }
    
    viewNetworkDetails() {
        // Navigate to network details page
        window.location.href = 'network-details.html';
    }
    
    configureNetwork() {
        // Navigate to network configuration page
        window.location.href = 'network-configuration.html';
    }
    
    viewSslDetails() {
        // Navigate to SSL details page
        window.location.href = 'ssl-details.html';
    }
    
    renewSsl() {
        // Navigate to SSL renewal page
        window.location.href = 'ssl-renewal.html';
    }
    
    // Utility methods
    downloadJSON(json, filename) {
        const blob = new Blob([json], { type: 'application/json' });
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
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize the system hardening system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the system hardening system
    window.systemHardeningSystem = new SystemHardeningSystem();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemHardeningSystem;
}
