// System Hardening Dashboard for Angkor Compliance v2
// Handles security testing, performance monitoring, disaster recovery, and go-live preparation

class SystemHardeningDashboard {
    constructor() {
        this.currentUser = null;
        this.securityTrendsChart = null;
        this.performanceDistributionChart = null;
        this.isInitialized = false;
        
        this.initializeSystemHardeningDashboard();
    }

    async initializeSystemHardeningDashboard() {
        try {
            console.log('🔒 Initializing System Hardening Dashboard...');
            
            // Wait for Firebase to be ready
            await this.waitForFirebase();
            
            // Check authentication
            await this.checkAuthentication();
            
            // Load sidebar
            await this.loadSidebar();
            
            // Initialize dashboard components
            await Promise.all([
                this.loadSecurityTests(),
                this.loadPerformanceMetrics(),
                this.loadDRMetrics(),
                this.loadGoLiveChecklist(),
                this.initializeCharts()
            ]);
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ System Hardening Dashboard initialized');
            
        } catch (error) {
            console.error('❌ Error initializing System Hardening Dashboard:', error);
            this.isInitialized = false;
        }
    }

    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.Firebase && window.Firebase.db) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    async checkAuthentication() {
        try {
            const auth = window.Firebase?.auth;
            if (!auth) {
                throw new Error('Firebase Auth not available');
            }

            return new Promise((resolve, reject) => {
                const unsubscribe = auth.onAuthStateChanged(async (user) => {
                    unsubscribe();
                    if (user) {
                        this.currentUser = user;
                        console.log('✅ User authenticated:', user.email);
                        resolve(user);
                    } else {
                        console.log('❌ No user authenticated');
                        window.location.href = 'login.html';
                        reject(new Error('No user authenticated'));
                    }
                });
            });
        } catch (error) {
            console.error('Error checking authentication:', error);
            throw error;
        }
    }

    async loadSidebar() {
        try {
            const sidebarContainer = document.getElementById('sidebarContainer');
            if (!sidebarContainer) {
                throw new Error('Sidebar container not found');
            }

            // Load sidebar template
            const response = await fetch('assets/templates/sidebar.html');
            const sidebarTemplate = await response.text();
            
            sidebarContainer.innerHTML = sidebarTemplate;
            
            // Initialize sidebar functionality
            this.initializeSidebar();
            
        } catch (error) {
            console.error('Error loading sidebar:', error);
        }
    }

    initializeSidebar() {
        // Add active class to current page
        const currentPage = 'system-hardening-dashboard';
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        
        sidebarLinks.forEach(link => {
            if (link.getAttribute('data-page') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    async loadSecurityTests() {
        try {
            const securityTestsGrid = document.getElementById('securityTestsGrid');
            if (!securityTestsGrid) return;

            const testTypes = [
                { name: 'Authentication', type: 'authentication', description: 'Test MFA, password policies, and session management' },
                { name: 'Authorization', type: 'authorization', description: 'Test RBAC/ABAC implementation and access controls' },
                { name: 'Data Encryption', type: 'data_encryption', description: 'Test TLS, data encryption, and key management' },
                { name: 'API Security', type: 'api_security', description: 'Test rate limiting, input validation, and CORS policies' },
                { name: 'Input Validation', type: 'input_validation', description: 'Test SQL injection, XSS, and CSRF protection' }
            ];

            securityTestsGrid.innerHTML = testTypes.map(test => this.getSecurityTestHTML(test)).join('');
            
        } catch (error) {
            console.error('Error loading security tests:', error);
            document.getElementById('securityTestsGrid').innerHTML = this.getErrorStateHTML('security tests');
        }
    }

    getSecurityTestHTML(test) {
        return `
            <div class="security-test-card" data-test-type="${test.type}" onclick="runSecurityTest('${test.type}')">
                <div class="test-header">
                    <span class="test-name">${test.name}</span>
                    <span class="test-status pending">Pending</span>
                </div>
                <div class="test-score" id="score_${test.type}">-</div>
                <div class="test-description">${test.description}</div>
            </div>
        `;
    }

    async loadPerformanceMetrics() {
        try {
            // Load performance metrics from the system
            const performanceData = await window.SystemHardening?.runPerformanceAudit();
            
            if (performanceData) {
                this.updatePerformanceDisplay(performanceData);
            }
            
        } catch (error) {
            console.error('Error loading performance metrics:', error);
        }
    }

    updatePerformanceDisplay(performanceData) {
        try {
            const metrics = performanceData.metrics;
            
            // Update metric values
            document.getElementById('pageLoadTime').textContent = `${metrics.pageLoadTime}ms`;
            document.getElementById('apiResponseTime').textContent = `${metrics.apiResponseTime}ms`;
            document.getElementById('memoryUsage').textContent = `${Math.round(metrics.cpuUsage)}%`;
            
            // Update performance score
            document.getElementById('performanceScore').textContent = performanceData.performanceScore;
            
            // Update progress bar
            const progressBar = document.querySelector('#performanceScore').closest('.status-card').querySelector('.status-progress-fill');
            progressBar.style.width = `${performanceData.performanceScore}%`;
            
            // Update progress bar class based on score
            progressBar.className = 'status-progress-fill';
            if (performanceData.performanceScore >= 90) {
                progressBar.classList.add('excellent');
            } else if (performanceData.performanceScore >= 80) {
                progressBar.classList.add('good');
            } else if (performanceData.performanceScore >= 70) {
                progressBar.classList.add('warning');
            } else {
                progressBar.classList.add('danger');
            }
            
        } catch (error) {
            console.error('Error updating performance display:', error);
        }
    }

    async loadDRMetrics() {
        try {
            // Load disaster recovery metrics from the system
            const drData = await window.SystemHardening?.runDisasterRecoveryDrill();
            
            if (drData) {
                this.updateDRDisplay(drData);
            }
            
        } catch (error) {
            console.error('Error loading DR metrics:', error);
        }
    }

    updateDRDisplay(drData) {
        try {
            // Update DR metrics
            document.getElementById('rpoValue').textContent = drData.rpo;
            document.getElementById('rtoValue').textContent = drData.rto;
            document.getElementById('backupStatus').textContent = drData.tests.backupCreation.success ? 'Success' : 'Failed';
            document.getElementById('dataIntegrity').textContent = drData.tests.dataIntegrity.success ? '100%' : 'Failed';
            
            // Update DR status
            document.getElementById('drStatus').textContent = drData.success ? 'Ready' : 'Not Ready';
            
            // Update progress bar
            const progressBar = document.querySelector('#drStatus').closest('.status-card').querySelector('.status-progress-fill');
            progressBar.style.width = drData.success ? '100%' : '50%';
            
        } catch (error) {
            console.error('Error updating DR display:', error);
        }
    }

    async loadGoLiveChecklist() {
        try {
            const goLiveChecklist = document.getElementById('goLiveChecklist');
            if (!goLiveChecklist) return;

            const checklistItems = [
                { title: 'Security Tests', description: 'All security penetration tests completed', status: 'pending' },
                { title: 'Performance Audit', description: 'Performance optimization and monitoring setup', status: 'pending' },
                { title: 'Disaster Recovery', description: 'DR procedures tested and validated', status: 'pending' },
                { title: 'Monitoring Setup', description: 'System monitoring and alerting configured', status: 'pending' },
                { title: 'Documentation', description: 'User manuals and admin guides prepared', status: 'pending' },
                { title: 'Training Materials', description: 'Training materials and sessions ready', status: 'pending' }
            ];

            goLiveChecklist.innerHTML = checklistItems.map(item => this.getChecklistItemHTML(item)).join('');
            
        } catch (error) {
            console.error('Error loading go-live checklist:', error);
            document.getElementById('goLiveChecklist').innerHTML = this.getErrorStateHTML('go-live checklist');
        }
    }

    getChecklistItemHTML(item) {
        return `
            <div class="checklist-item ${item.status}" data-item="${item.title.toLowerCase().replace(/\s+/g, '_')}">
                <div class="checklist-header">
                    <span class="checklist-title">${item.title}</span>
                    <div class="checklist-status ${item.status}">
                        <i data-lucide="${item.status === 'completed' ? 'check' : item.status === 'failed' ? 'x' : 'clock'}"></i>
                    </div>
                </div>
                <div class="checklist-description">${item.description}</div>
                <div class="checklist-details">Status: ${item.status}</div>
            </div>
        `;
    }

    async initializeCharts() {
        try {
            await this.initializeSecurityTrendsChart();
            await this.initializePerformanceDistributionChart();
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    async initializeSecurityTrendsChart() {
        try {
            const ctx = document.getElementById('securityTrendsChart');
            if (!ctx) return;

            // Sample data - in real implementation, this would come from the system
            const chartData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Security Score',
                    data: [85, 87, 89, 91, 93, 95],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Vulnerabilities',
                    data: [15, 13, 11, 9, 7, 5],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            };

            this.securityTrendsChart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error initializing security trends chart:', error);
        }
    }

    async initializePerformanceDistributionChart() {
        try {
            const ctx = document.getElementById('performanceDistributionChart');
            if (!ctx) return;

            // Sample data - in real implementation, this would come from the system
            const chartData = {
                labels: ['Excellent', 'Good', 'Fair', 'Poor'],
                datasets: [{
                    data: [60, 25, 10, 5],
                    backgroundColor: [
                        '#28a745',
                        '#17a2b8',
                        '#ffc107',
                        '#dc3545'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            };

            this.performanceDistributionChart = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
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
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error initializing performance distribution chart:', error);
        }
    }

    setupEventListeners() {
        // Security test card clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.security-test-card')) {
                const testType = e.target.closest('.security-test-card').getAttribute('data-test-type');
                if (testType) {
                    this.runSecurityTest(testType);
                }
            }
        });
    }

    getErrorStateHTML(type) {
        return `
            <div class="error-state">
                <div class="error-icon">
                    <i data-lucide="alert-triangle"></i>
                </div>
                <h3>Error loading ${type}</h3>
                <p>There was an error loading the ${type}. Please try refreshing the page.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i data-lucide="refresh-cw"></i>
                    Refresh Page
                </button>
            </div>
        `;
    }
}

// Initialize System Hardening Dashboard
window.systemHardeningDashboard = new SystemHardeningDashboard();

// Global functions for HTML onclick handlers
window.runAllTests = async function() {
    try {
        console.log('🔄 Running all tests...');
        
        // Run security tests
        await window.runSecurityTests();
        
        // Run performance audit
        await window.runPerformanceAudit();
        
        // Run DR drill
        await window.runDRDrill();
        
        console.log('✅ All tests completed');
        
    } catch (error) {
        console.error('Error running all tests:', error);
        alert('Error running all tests');
    }
};

window.runSecurityTests = async function() {
    try {
        console.log('🔒 Running security tests...');
        
        const testTypes = ['authentication', 'authorization', 'data_encryption', 'api_security', 'input_validation'];
        
        for (const testType of testTypes) {
            await window.runSecurityTest(testType);
        }
        
        console.log('✅ Security tests completed');
        
    } catch (error) {
        console.error('Error running security tests:', error);
        alert('Error running security tests');
    }
};

window.runSecurityTest = async function(testType) {
    try {
        console.log(`🔒 Running ${testType} security test...`);
        
        // Update test card status
        const testCard = document.querySelector(`[data-test-type="${testType}"]`);
        if (testCard) {
            testCard.classList.remove('pending', 'completed', 'failed');
            testCard.classList.add('running');
            
            const statusElement = testCard.querySelector('.test-status');
            statusElement.textContent = 'Running';
            statusElement.className = 'test-status running';
        }
        
        // Run the security test
        const testResult = await window.SystemHardening?.runSecurityPenetrationTest(testType);
        
        if (testResult) {
            // Update test card with results
            if (testCard) {
                testCard.classList.remove('running');
                testCard.classList.add(testResult.riskScore < 30 ? 'completed' : 'failed');
                
                const statusElement = testCard.querySelector('.test-status');
                const scoreElement = testCard.querySelector('.test-score');
                
                if (testResult.riskScore < 30) {
                    statusElement.textContent = 'Passed';
                    statusElement.className = 'test-status completed';
                } else {
                    statusElement.textContent = 'Failed';
                    statusElement.className = 'test-status failed';
                }
                
                scoreElement.textContent = testResult.riskScore;
            }
            
            // Update overall security score
            window.updateSecurityScore();
        }
        
    } catch (error) {
        console.error(`Error running ${testType} security test:`, error);
        
        // Update test card to failed state
        const testCard = document.querySelector(`[data-test-type="${testType}"]`);
        if (testCard) {
            testCard.classList.remove('running');
            testCard.classList.add('failed');
            
            const statusElement = testCard.querySelector('.test-status');
            statusElement.textContent = 'Error';
            statusElement.className = 'test-status failed';
        }
    }
};

window.runPerformanceAudit = async function() {
    try {
        console.log('⚡ Running performance audit...');
        
        const auditResult = await window.SystemHardening?.runPerformanceAudit();
        
        if (auditResult) {
            // Update performance display
            window.systemHardeningDashboard.updatePerformanceDisplay(auditResult);
            
            // Update go-live checklist
            window.updateChecklistItem('performance_audit', 'completed');
            
            console.log('✅ Performance audit completed');
        }
        
    } catch (error) {
        console.error('Error running performance audit:', error);
        alert('Error running performance audit');
    }
};

window.runDRDrill = async function() {
    try {
        console.log('🔄 Running disaster recovery drill...');
        
        const drResult = await window.SystemHardening?.runDisasterRecoveryDrill();
        
        if (drResult) {
            // Update DR display
            window.systemHardeningDashboard.updateDRDisplay(drResult);
            
            // Update go-live checklist
            window.updateChecklistItem('disaster_recovery', drResult.success ? 'completed' : 'failed');
            
            console.log('✅ Disaster recovery drill completed');
        }
        
    } catch (error) {
        console.error('Error running DR drill:', error);
        alert('Error running DR drill');
    }
};

window.prepareForGoLive = async function() {
    try {
        console.log('🚀 Preparing for go-live...');
        
        const goLiveResult = await window.SystemHardening?.prepareForGoLive();
        
        if (goLiveResult) {
            // Update go-live status
            document.getElementById('goLiveStatus').textContent = goLiveResult.readyForGoLive ? 'Ready' : 'Not Ready';
            
            // Update progress bar
            const progressBar = document.querySelector('#goLiveStatus').closest('.status-card').querySelector('.status-progress-fill');
            progressBar.style.width = goLiveResult.readyForGoLive ? '100%' : '50%';
            
            // Update checklist items
            Object.entries(goLiveResult.checklist).forEach(([key, value]) => {
                const status = value.status === 'completed' || value.success === true ? 'completed' : 'failed';
                window.updateChecklistItem(key, status);
            });
            
            console.log('✅ Go-live preparation completed');
            
            if (goLiveResult.readyForGoLive) {
                alert('🎉 System is ready for go-live!');
            } else {
                alert('⚠️ System is not ready for go-live. Please review the checklist.');
            }
        }
        
    } catch (error) {
        console.error('Error preparing for go-live:', error);
        alert('Error preparing for go-live');
    }
};

window.runGoLivePreparation = async function() {
    // Alias for prepareForGoLive
    await window.prepareForGoLive();
};

window.updateSecurityScore = function() {
    try {
        // Calculate overall security score from all tests
        const testCards = document.querySelectorAll('.security-test-card');
        let totalScore = 0;
        let completedTests = 0;
        
        testCards.forEach(card => {
            const scoreElement = card.querySelector('.test-score');
            const score = parseInt(scoreElement.textContent);
            
            if (!isNaN(score)) {
                totalScore += score;
                completedTests++;
            }
        });
        
        if (completedTests > 0) {
            const averageScore = Math.round(totalScore / completedTests);
            document.getElementById('securityScore').textContent = averageScore;
            
            // Update progress bar
            const progressBar = document.querySelector('#securityScore').closest('.status-card').querySelector('.status-progress-fill');
            progressBar.style.width = `${averageScore}%`;
            
            // Update progress bar class based on score
            progressBar.className = 'status-progress-fill';
            if (averageScore >= 90) {
                progressBar.classList.add('excellent');
            } else if (averageScore >= 80) {
                progressBar.classList.add('good');
            } else if (averageScore >= 70) {
                progressBar.classList.add('warning');
            } else {
                progressBar.classList.add('danger');
            }
        }
        
    } catch (error) {
        console.error('Error updating security score:', error);
    }
};

window.updateChecklistItem = function(itemKey, status) {
    try {
        const checklistItem = document.querySelector(`[data-item="${itemKey}"]`);
        if (checklistItem) {
            checklistItem.className = `checklist-item ${status}`;
            
            const statusElement = checklistItem.querySelector('.checklist-status');
            statusElement.className = `checklist-status ${status}`;
            
            const icon = status === 'completed' ? 'check' : status === 'failed' ? 'x' : 'clock';
            statusElement.innerHTML = `<i data-lucide="${icon}"></i>`;
            
            // Reinitialize Lucide icons
            lucide.createIcons();
        }
        
    } catch (error) {
        console.error('Error updating checklist item:', error);
    }
};
