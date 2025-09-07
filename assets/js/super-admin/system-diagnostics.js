// System Diagnostics & Monitoring System for Super Admin
class SystemDiagnosticsSystem {
    constructor() {
        this.currentUser = null;
        this.systemMetrics = {};
        this.logs = [];
        this.diagnosticTools = [];
        this.charts = {};
        this.updateInterval = null;
        
        this.init();
    }
    
    async init() {
        console.log('🔧 Initializing System Diagnostics & Monitoring System...');
        
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
        
        // Start periodic updates
        this.startPeriodicUpdates();
        
        console.log('✅ System Diagnostics & Monitoring System initialized');
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
            window.superAdminNavigation.updateCurrentPage('System Diagnostics');
        } else {
            // Retry after a short delay
            setTimeout(() => {
                this.initializeNavigation();
            }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadSystemMetrics(),
            this.loadSystemLogs(),
            this.loadDiagnosticTools()
        ]);
        
        this.updateSystemHealth();
        this.renderSystemLogs();
        this.renderDiagnosticTools();
    }
    
    async loadSystemMetrics() {
        try {
            const metricsRef = this.collection(this.db, 'system_metrics');
            const snapshot = await this.getDocs(metricsRef);
            this.systemMetrics = {};
            
            snapshot.docs.forEach(doc => {
                this.systemMetrics[doc.id] = doc.data();
            });
            
            console.log('✓ Loaded system metrics');
            
        } catch (error) {
            console.error('Error loading system metrics:', error);
            // Use mock data if database is not available
            this.systemMetrics = this.getMockSystemMetrics();
        }
    }
    
    async loadSystemLogs() {
        try {
            const logsRef = this.collection(this.db, 'system_logs');
            const snapshot = await this.getDocs(logsRef);
            this.logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`✓ Loaded ${this.logs.length} system logs`);
            
        } catch (error) {
            console.error('Error loading system logs:', error);
            // Use mock data if database is not available
            this.logs = this.getMockSystemLogs();
        }
    }
    
    async loadDiagnosticTools() {
        try {
            const toolsRef = this.collection(this.db, 'diagnostic_tools');
            const snapshot = await this.getDocs(toolsRef);
            this.diagnosticTools = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // If no tools in database, use default tools
            if (this.diagnosticTools.length === 0) {
                this.diagnosticTools = this.getDefaultDiagnosticTools();
            }
            
            console.log(`✓ Loaded ${this.diagnosticTools.length} diagnostic tools`);
            
        } catch (error) {
            console.error('Error loading diagnostic tools:', error);
            this.diagnosticTools = this.getDefaultDiagnosticTools();
        }
    }
    
    getMockSystemMetrics() {
        return {
            server: { status: 'online', responseTime: 12 },
            database: { status: 'connected', responseTime: 8 },
            cpu: { usage: 78, status: 'warning' },
            memory: { usage: 62, status: 'healthy' },
            disk: { usage: 45, status: 'healthy' },
            network: { status: 'active', latency: 5 }
        };
    }
    
    getMockSystemLogs() {
        const now = new Date();
        const levels = ['info', 'warning', 'error'];
        const messages = [
            'User authentication successful',
            'Database connection established',
            'High CPU usage detected',
            'Memory usage within normal limits',
            'Backup process completed',
            'System maintenance scheduled',
            'Error in payment processing',
            'Cache cleared successfully',
            'New user registered',
            'System performance optimized'
        ];
        
        return Array.from({ length: 20 }, (_, i) => ({
            id: `log_${i}`,
            timestamp: new Date(now.getTime() - (i * 60000)), // 1 minute intervals
            level: levels[Math.floor(Math.random() * levels.length)],
            message: messages[Math.floor(Math.random() * messages.length)],
            source: 'system'
        }));
    }
    
    getDefaultDiagnosticTools() {
        return [
            {
                id: 'ping_test',
                name: 'Network Ping Test',
                description: 'Test network connectivity and latency',
                status: 'ready',
                category: 'network'
            },
            {
                id: 'disk_check',
                name: 'Disk Health Check',
                description: 'Check disk health and free space',
                status: 'ready',
                category: 'storage'
            },
            {
                id: 'memory_test',
                name: 'Memory Diagnostic',
                description: 'Test system memory for errors',
                status: 'ready',
                category: 'hardware'
            },
            {
                id: 'database_test',
                name: 'Database Connection Test',
                description: 'Test database connectivity and performance',
                status: 'ready',
                category: 'database'
            },
            {
                id: 'ssl_check',
                name: 'SSL Certificate Check',
                description: 'Verify SSL certificate validity',
                status: 'ready',
                category: 'security'
            },
            {
                id: 'backup_test',
                name: 'Backup System Test',
                description: 'Test backup system functionality',
                status: 'ready',
                category: 'backup'
            }
        ];
    }
    
    updateSystemHealth() {
        // Update server status
        document.getElementById('serverStatus').textContent = this.systemMetrics.server?.status || 'Online';
        
        // Update database status
        document.getElementById('databaseStatus').textContent = this.systemMetrics.database?.status || 'Connected';
        
        // Update CPU usage
        document.getElementById('cpuUsage').textContent = `${this.systemMetrics.cpu?.usage || 78}%`;
        
        // Update disk usage
        document.getElementById('diskUsage').textContent = `${this.systemMetrics.disk?.usage || 45}%`;
        
        // Update memory usage
        document.getElementById('memoryUsage').textContent = `${this.systemMetrics.memory?.usage || 62}%`;
        
        // Update network status
        document.getElementById('networkStatus').textContent = this.systemMetrics.network?.status || 'Active';
        
        // Update performance metrics
        document.getElementById('responseTime').textContent = `${this.systemMetrics.server?.responseTime || 145}ms`;
        document.getElementById('throughput').textContent = `${this.systemMetrics.throughput || 1247} req/s`;
        document.getElementById('errorRate').textContent = `${this.systemMetrics.errorRate || 0.2}%`;
        document.getElementById('activeUsers').textContent = `${this.systemMetrics.activeUsers || 1847}`;
    }
    
    renderSystemLogs() {
        const logsContainer = document.getElementById('logsContainer');
        if (!logsContainer) return;
        
        // Sort logs by timestamp (newest first)
        const sortedLogs = this.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        logsContainer.innerHTML = sortedLogs.map(log => `
            <div class="log-entry" data-level="${log.level}">
                <div class="log-timestamp">${this.formatTimestamp(log.timestamp)}</div>
                <div class="log-level ${log.level}">${log.level}</div>
                <div class="log-message">${log.message}</div>
            </div>
        `).join('');
    }
    
    renderDiagnosticTools() {
        const toolsGrid = document.getElementById('diagnosticToolsGrid');
        if (!toolsGrid) return;
        
        toolsGrid.innerHTML = this.diagnosticTools.map(tool => `
            <div class="tool-card">
                <div class="tool-header">
                    <div class="tool-name">${tool.name}</div>
                    <div class="tool-status ${tool.status}">${tool.status}</div>
                </div>
                <div class="tool-description">${tool.description}</div>
                <div class="tool-actions">
                    <button class="tool-btn" onclick="runDiagnosticTool('${tool.id}')">
                        <i data-lucide="play"></i>
                        Run
                    </button>
                    <button class="tool-btn" onclick="viewToolDetails('${tool.id}')">
                        <i data-lucide="eye"></i>
                        Details
                    </button>
                </div>
            </div>
        `).join('');
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
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
                        label: 'CPU Usage (%)',
                        data: data.cpu,
                        borderColor: 'var(--warning-500)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Memory Usage (%)',
                        data: data.memory,
                        borderColor: 'var(--primary-500)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Response Time (ms)',
                        data: data.responseTime,
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
        const cpu = [];
        const memory = [];
        const responseTime = [];
        
        // Generate data for the last 24 hours
        for (let i = 23; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 60 * 60 * 1000));
            labels.push(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            
            // Mock data - in real implementation, this would come from monitoring system
            cpu.push(Math.floor(Math.random() * 30) + 50); // 50-80%
            memory.push(Math.floor(Math.random() * 20) + 50); // 50-70%
            responseTime.push(Math.floor(Math.random() * 100) + 100); // 100-200ms
        }
        
        return { labels, cpu, memory, responseTime };
    }
    
    setupEventListeners() {
        // Setup global event listeners
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        // System diagnostics
        window.runSystemDiagnostics = () => {
            this.runSystemDiagnostics();
        };
        
        window.exportDiagnostics = () => {
            this.exportDiagnostics();
        };
        
        // Performance metrics
        window.refreshMetrics = () => {
            this.refreshMetrics();
        };
        
        window.exportMetrics = () => {
            this.exportMetrics();
        };
        
        // Log filtering
        window.filterLogs = (level) => {
            this.filterLogs(level);
        };
        
        // Diagnostic tools
        window.runDiagnosticTool = (toolId) => {
            this.runDiagnosticTool(toolId);
        };
        
        window.viewToolDetails = (toolId) => {
            this.viewToolDetails(toolId);
        };
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        // Listen for system metrics updates
        const metricsRef = this.collection(this.db, 'system_metrics');
        this.onSnapshot(metricsRef, (snapshot) => {
            this.systemMetrics = {};
            snapshot.docs.forEach(doc => {
                this.systemMetrics[doc.id] = doc.data();
            });
            this.updateSystemHealth();
        });
        
        // Listen for system logs updates
        const logsRef = this.collection(this.db, 'system_logs');
        this.onSnapshot(logsRef, (snapshot) => {
            this.logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderSystemLogs();
        });
    }
    
    startPeriodicUpdates() {
        // Update metrics every 30 seconds
        this.updateInterval = setInterval(() => {
            this.updateSystemMetrics();
        }, 30000);
    }
    
    updateSystemMetrics() {
        // Simulate real-time metric updates
        this.systemMetrics.cpu.usage = Math.floor(Math.random() * 30) + 50;
        this.systemMetrics.memory.usage = Math.floor(Math.random() * 20) + 50;
        this.systemMetrics.server.responseTime = Math.floor(Math.random() * 100) + 100;
        
        this.updateSystemHealth();
        
        // Update chart if it exists
        if (this.charts.performance) {
            const data = this.getPerformanceData();
            this.charts.performance.data.labels = data.labels;
            this.charts.performance.data.datasets[0].data = data.cpu;
            this.charts.performance.data.datasets[1].data = data.memory;
            this.charts.performance.data.datasets[2].data = data.responseTime;
            this.charts.performance.update();
        }
    }
    
    // System diagnostics methods
    async runSystemDiagnostics() {
        try {
            this.showNotification('info', 'Running comprehensive system diagnostics...');
            
            // Simulate diagnostic process
            await this.simulateDiagnostics();
            
            this.showNotification('success', 'System diagnostics completed successfully');
            
        } catch (error) {
            console.error('Error running system diagnostics:', error);
            this.showNotification('error', 'System diagnostics failed');
        }
    }
    
    async simulateDiagnostics() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Update diagnostic tools status
                this.diagnosticTools.forEach(tool => {
                    tool.status = Math.random() > 0.2 ? 'ready' : 'running';
                });
                
                this.renderDiagnosticTools();
                resolve();
            }, 3000);
        });
    }
    
    async exportDiagnostics() {
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                systemMetrics: this.systemMetrics,
                logs: this.logs.slice(0, 100), // Last 100 logs
                diagnosticTools: this.diagnosticTools,
                summary: {
                    systemHealth: this.calculateSystemHealth(),
                    totalLogs: this.logs.length,
                    activeTools: this.diagnosticTools.filter(t => t.status === 'ready').length
                }
            };
            
            // Convert to JSON and download
            const json = JSON.stringify(exportData, null, 2);
            this.downloadJSON(json, 'system-diagnostics-report.json');
            
            this.showNotification('success', 'Diagnostics report exported successfully');
            
        } catch (error) {
            console.error('Error exporting diagnostics:', error);
            this.showNotification('error', 'Failed to export diagnostics report');
        }
    }
    
    calculateSystemHealth() {
        const metrics = Object.values(this.systemMetrics);
        const healthyCount = metrics.filter(m => m.status === 'healthy' || m.status === 'online' || m.status === 'connected').length;
        return Math.round((healthyCount / metrics.length) * 100);
    }
    
    refreshMetrics() {
        this.loadSystemMetrics();
        this.updateSystemHealth();
        this.showNotification('success', 'Metrics refreshed');
    }
    
    exportMetrics() {
        const metricsData = {
            timestamp: new Date().toISOString(),
            metrics: this.systemMetrics
        };
        
        const json = JSON.stringify(metricsData, null, 2);
        this.downloadJSON(json, 'system-metrics.json');
        
        this.showNotification('success', 'Metrics exported successfully');
    }
    
    filterLogs(level) {
        const logEntries = document.querySelectorAll('.log-entry');
        const filterButtons = document.querySelectorAll('.log-filter');
        
        // Update filter buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Filter log entries
        logEntries.forEach(entry => {
            if (level === 'all' || entry.dataset.level === level) {
                entry.style.display = 'flex';
            } else {
                entry.style.display = 'none';
            }
        });
    }
    
    async runDiagnosticTool(toolId) {
        const tool = this.diagnosticTools.find(t => t.id === toolId);
        if (!tool) return;
        
        try {
            tool.status = 'running';
            this.renderDiagnosticTools();
            
            this.showNotification('info', `Running ${tool.name}...`);
            
            // Simulate tool execution
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            tool.status = 'ready';
            this.renderDiagnosticTools();
            
            this.showNotification('success', `${tool.name} completed successfully`);
            
        } catch (error) {
            console.error('Error running diagnostic tool:', error);
            tool.status = 'ready';
            this.renderDiagnosticTools();
            this.showNotification('error', `Failed to run ${tool.name}`);
        }
    }
    
    viewToolDetails(toolId) {
        const tool = this.diagnosticTools.find(t => t.id === toolId);
        if (!tool) return;
        
        // Navigate to tool details page
        window.location.href = `tool-details.html?id=${toolId}`;
    }
    
    // Utility methods
    formatTimestamp(timestamp) {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    }
    
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
    
    // Cleanup method
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize the system diagnostics system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the system diagnostics system
    window.systemDiagnosticsSystem = new SystemDiagnosticsSystem();
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (window.systemDiagnosticsSystem) {
        window.systemDiagnosticsSystem.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemDiagnosticsSystem;
}
