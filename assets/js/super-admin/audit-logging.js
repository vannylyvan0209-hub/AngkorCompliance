// Audit Logging & Compliance System for Super Admin
class AuditLoggingSystem {
    constructor() {
        this.currentUser = null;
        this.auditLogs = [];
        this.complianceMetrics = {};
        this.filters = {
            timeRange: '7d',
            user: 'all',
            action: 'all',
            resource: 'all',
            status: 'all'
        };
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 20,
            totalItems: 0
        };
        this.charts = {};
        
        this.init();
    }
    
    async init() {
        console.log('📋 Initializing Audit Logging & Compliance System...');
        
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
        
        console.log('✅ Audit Logging & Compliance System initialized');
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
            window.superAdminNavigation.updateCurrentPage('Audit Logging & Compliance');
        } else {
            // Retry after a short delay
            setTimeout(() => {
                this.initializeNavigation();
            }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadAuditLogs(),
            this.loadComplianceMetrics()
        ]);
        
        this.updateAuditOverview();
        this.renderAuditLogs();
        this.updateComplianceMetrics();
    }
    
    async loadAuditLogs() {
        try {
            const logsRef = this.collection(this.db, 'audit_logs');
            const snapshot = await this.getDocs(logsRef);
            this.auditLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // If no logs in database, use mock data
            if (this.auditLogs.length === 0) {
                this.auditLogs = this.getMockAuditLogs();
            }
            
            this.pagination.totalItems = this.auditLogs.length;
            
            console.log(`✓ Loaded ${this.auditLogs.length} audit logs`);
            
        } catch (error) {
            console.error('Error loading audit logs:', error);
            this.auditLogs = this.getMockAuditLogs();
            this.pagination.totalItems = this.auditLogs.length;
        }
    }
    
    async loadComplianceMetrics() {
        try {
            const metricsRef = this.collection(this.db, 'compliance_metrics');
            const snapshot = await this.getDocs(metricsRef);
            this.complianceMetrics = {};
            
            snapshot.docs.forEach(doc => {
                this.complianceMetrics[doc.id] = doc.data();
            });
            
            console.log('✓ Loaded compliance metrics');
            
        } catch (error) {
            console.error('Error loading compliance metrics:', error);
            this.complianceMetrics = this.getMockComplianceMetrics();
        }
    }
    
    getMockAuditLogs() {
        const now = new Date();
        const actions = ['create', 'update', 'delete', 'login', 'logout'];
        const resources = ['user', 'factory', 'case', 'audit', 'system'];
        const statuses = ['success', 'failed', 'pending'];
        const users = [
            { name: 'John Doe', role: 'super_admin', avatar: 'JD' },
            { name: 'Jane Smith', role: 'factory_admin', avatar: 'JS' },
            { name: 'Mike Johnson', role: 'hr_staff', avatar: 'MJ' },
            { name: 'Sarah Wilson', role: 'auditor', avatar: 'SW' },
            { name: 'David Brown', role: 'worker', avatar: 'DB' }
        ];
        
        return Array.from({ length: 100 }, (_, i) => {
            const user = users[Math.floor(Math.random() * users.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const resource = resources[Math.floor(Math.random() * resources.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            return {
                id: `audit_${i}`,
                timestamp: new Date(now.getTime() - (i * 60000)), // 1 minute intervals
                user: user,
                action: action,
                resource: resource,
                status: status,
                details: `${action} operation on ${resource}`,
                ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            };
        });
    }
    
    getMockComplianceMetrics() {
        return {
            dataIntegrity: 99.8,
            accessControl: 98.5,
            dataRetention: 100,
            securityCompliance: 97.2
        };
    }
    
    updateAuditOverview() {
        const totalEvents = this.auditLogs.length;
        const activeUsers = new Set(this.auditLogs.map(log => log.user.name)).size;
        const complianceScore = this.calculateComplianceScore();
        const securityEvents = this.auditLogs.filter(log => 
            log.action === 'login' || log.action === 'logout' || log.status === 'failed'
        ).length;
        
        document.getElementById('totalAuditEvents').textContent = totalEvents.toLocaleString();
        document.getElementById('activeUsers').textContent = activeUsers;
        document.getElementById('complianceScore').textContent = `${complianceScore}%`;
        document.getElementById('securityEvents').textContent = securityEvents;
    }
    
    calculateComplianceScore() {
        const totalLogs = this.auditLogs.length;
        const successfulLogs = this.auditLogs.filter(log => log.status === 'success').length;
        return totalLogs > 0 ? Math.round((successfulLogs / totalLogs) * 100) : 100;
    }
    
    renderAuditLogs() {
        const auditLogsTable = document.getElementById('auditLogsTable');
        if (!auditLogsTable) return;
        
        const tableBody = auditLogsTable.querySelector('tbody');
        if (!tableBody) return;
        
        const filteredLogs = this.getFilteredLogs();
        const paginatedLogs = this.getPaginatedLogs(filteredLogs);
        
        tableBody.innerHTML = paginatedLogs.map(log => `
            <tr class="audit-log-row">
                <td>
                    <div class="log-timestamp">${this.formatTimestamp(log.timestamp)}</div>
                </td>
                <td>
                    <div class="log-user">
                        <div class="user-avatar">${log.user.avatar}</div>
                        <div class="user-info">
                            <div class="user-name">${log.user.name}</div>
                            <div class="user-role">${log.user.role}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="log-action">
                        <div class="action-icon ${log.action}">
                            <i data-lucide="${this.getActionIcon(log.action)}"></i>
                        </div>
                        <div class="action-text">${this.capitalizeFirst(log.action)}</div>
                    </div>
                </td>
                <td>
                    <div class="log-resource">${this.capitalizeFirst(log.resource)}</div>
                </td>
                <td>
                    <div class="log-status status-${log.status}">${log.status}</div>
                </td>
                <td>
                    <div class="log-details">${log.details}</div>
                </td>
            </tr>
        `).join('');
        
        this.renderPagination(filteredLogs.length);
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    getFilteredLogs() {
        let filtered = this.auditLogs;
        
        // Filter by time range
        if (this.filters.timeRange !== 'all') {
            const timeRange = this.getTimeRange(this.filters.timeRange);
            filtered = filtered.filter(log => {
                const logTime = log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
                return logTime >= timeRange.start && logTime <= timeRange.end;
            });
        }
        
        // Filter by user
        if (this.filters.user !== 'all') {
            filtered = filtered.filter(log => log.user.name === this.filters.user);
        }
        
        // Filter by action
        if (this.filters.action !== 'all') {
            filtered = filtered.filter(log => log.action === this.filters.action);
        }
        
        // Filter by resource
        if (this.filters.resource !== 'all') {
            filtered = filtered.filter(log => log.resource === this.filters.resource);
        }
        
        // Filter by status
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(log => log.status === this.filters.status);
        }
        
        return filtered;
    }
    
    getPaginatedLogs(logs) {
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
        const endIndex = startIndex + this.pagination.itemsPerPage;
        return logs.slice(startIndex, endIndex);
    }
    
    getTimeRange(timeRange) {
        const now = new Date();
        const start = new Date();
        
        switch (timeRange) {
            case '1h':
                start.setHours(now.getHours() - 1);
                break;
            case '24h':
                start.setDate(now.getDate() - 1);
                break;
            case '7d':
                start.setDate(now.getDate() - 7);
                break;
            case '30d':
                start.setDate(now.getDate() - 30);
                break;
            default:
                start.setDate(now.getDate() - 7);
        }
        
        return { start, end: now };
    }
    
    renderPagination(totalItems) {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        const totalPages = Math.ceil(totalItems / this.pagination.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="pagination-btn" ${this.pagination.currentPage === 1 ? 'disabled' : ''} 
                    onclick="changePage(${this.pagination.currentPage - 1})">
                <i data-lucide="chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.pagination.currentPage - 2 && i <= this.pagination.currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.pagination.currentPage ? 'active' : ''}" 
                            onclick="changePage(${i})">${i}</button>
                `;
            } else if (i === this.pagination.currentPage - 3 || i === this.pagination.currentPage + 3) {
                paginationHTML += '<span class="pagination-btn">...</span>';
            }
        }
        
        // Next button
        paginationHTML += `
            <button class="pagination-btn" ${this.pagination.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="changePage(${this.pagination.currentPage + 1})">
                <i data-lucide="chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    updateComplianceMetrics() {
        document.getElementById('dataIntegrity').textContent = `${this.complianceMetrics.dataIntegrity || 99.8}%`;
        document.getElementById('accessControl').textContent = `${this.complianceMetrics.accessControl || 98.5}%`;
        document.getElementById('dataRetention').textContent = `${this.complianceMetrics.dataRetention || 100}%`;
        document.getElementById('securityCompliance').textContent = `${this.complianceMetrics.securityCompliance || 97.2}%`;
    }
    
    initializeUI() {
        this.initializeFilters();
    }
    
    initializeFilters() {
        const timeRangeFilter = document.getElementById('timeRangeFilter');
        const userFilter = document.getElementById('userFilter');
        const actionFilter = document.getElementById('actionFilter');
        const resourceFilter = document.getElementById('resourceFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (timeRangeFilter) {
            timeRangeFilter.addEventListener('change', (e) => {
                this.filters.timeRange = e.target.value;
                this.pagination.currentPage = 1;
                this.renderAuditLogs();
            });
        }
        
        if (userFilter) {
            // Populate user filter
            const uniqueUsers = [...new Set(this.auditLogs.map(log => log.user.name))];
            userFilter.innerHTML = '<option value="all">All Users</option>';
            uniqueUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user;
                option.textContent = user;
                userFilter.appendChild(option);
            });
            
            userFilter.addEventListener('change', (e) => {
                this.filters.user = e.target.value;
                this.pagination.currentPage = 1;
                this.renderAuditLogs();
            });
        }
        
        if (actionFilter) {
            actionFilter.addEventListener('change', (e) => {
                this.filters.action = e.target.value;
                this.pagination.currentPage = 1;
                this.renderAuditLogs();
            });
        }
        
        if (resourceFilter) {
            resourceFilter.addEventListener('change', (e) => {
                this.filters.resource = e.target.value;
                this.pagination.currentPage = 1;
                this.renderAuditLogs();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.pagination.currentPage = 1;
                this.renderAuditLogs();
            });
        }
    }
    
    initializeCharts() {
        this.initializeComplianceChart();
    }
    
    initializeComplianceChart() {
        const ctx = document.getElementById('complianceChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        const data = this.getComplianceData();
        
        this.charts.compliance = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Data Integrity',
                        data: data.dataIntegrity,
                        borderColor: 'var(--success-500)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Access Control',
                        data: data.accessControl,
                        borderColor: 'var(--primary-500)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Security Compliance',
                        data: data.securityCompliance,
                        borderColor: 'var(--warning-500)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
                        max: 100,
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
    
    getComplianceData() {
        const now = new Date();
        const labels = [];
        const dataIntegrity = [];
        const accessControl = [];
        const securityCompliance = [];
        
        // Generate data for the last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            
            // Mock data - in real implementation, this would come from historical data
            dataIntegrity.push(Math.floor(Math.random() * 2) + 98); // 98-100%
            accessControl.push(Math.floor(Math.random() * 5) + 95); // 95-100%
            securityCompliance.push(Math.floor(Math.random() * 8) + 92); // 92-100%
        }
        
        return { labels, dataIntegrity, accessControl, securityCompliance };
    }
    
    setupEventListeners() {
        // Setup global event listeners
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        // Export functionality
        window.exportAuditLogs = () => {
            this.exportAuditLogs();
        };
        
        window.generateComplianceReport = () => {
            this.generateComplianceReport();
        };
        
        // Log management
        window.refreshLogs = () => {
            this.refreshLogs();
        };
        
        window.clearFilters = () => {
            this.clearFilters();
        };
        
        // Pagination
        window.changePage = (page) => {
            this.changePage(page);
        };
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        // Listen for audit log updates
        const logsRef = this.collection(this.db, 'audit_logs');
        this.onSnapshot(logsRef, (snapshot) => {
            this.auditLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.pagination.totalItems = this.auditLogs.length;
            this.updateAuditOverview();
            this.renderAuditLogs();
        });
        
        // Listen for compliance metrics updates
        const metricsRef = this.collection(this.db, 'compliance_metrics');
        this.onSnapshot(metricsRef, (snapshot) => {
            this.complianceMetrics = {};
            snapshot.docs.forEach(doc => {
                this.complianceMetrics[doc.id] = doc.data();
            });
            this.updateComplianceMetrics();
        });
    }
    
    // Audit logging methods
    async exportAuditLogs() {
        try {
            const filteredLogs = this.getFilteredLogs();
            
            const exportData = {
                timestamp: new Date().toISOString(),
                filters: this.filters,
                logs: filteredLogs.map(log => ({
                    timestamp: this.formatTimestamp(log.timestamp),
                    user: log.user.name,
                    role: log.user.role,
                    action: log.action,
                    resource: log.resource,
                    status: log.status,
                    details: log.details,
                    ipAddress: log.ipAddress,
                    userAgent: log.userAgent
                })),
                summary: {
                    totalLogs: filteredLogs.length,
                    timeRange: this.filters.timeRange,
                    complianceScore: this.calculateComplianceScore()
                }
            };
            
            // Convert to JSON and download
            const json = JSON.stringify(exportData, null, 2);
            this.downloadJSON(json, 'audit-logs-export.json');
            
            this.showNotification('success', 'Audit logs exported successfully');
            
        } catch (error) {
            console.error('Error exporting audit logs:', error);
            this.showNotification('error', 'Failed to export audit logs');
        }
    }
    
    async generateComplianceReport() {
        try {
            const reportData = {
                timestamp: new Date().toISOString(),
                complianceMetrics: this.complianceMetrics,
                auditSummary: {
                    totalEvents: this.auditLogs.length,
                    complianceScore: this.calculateComplianceScore(),
                    securityEvents: this.auditLogs.filter(log => 
                        log.action === 'login' || log.action === 'logout' || log.status === 'failed'
                    ).length
                },
                recommendations: this.generateComplianceRecommendations()
            };
            
            // Convert to JSON and download
            const json = JSON.stringify(reportData, null, 2);
            this.downloadJSON(json, 'compliance-report.json');
            
            this.showNotification('success', 'Compliance report generated successfully');
            
        } catch (error) {
            console.error('Error generating compliance report:', error);
            this.showNotification('error', 'Failed to generate compliance report');
        }
    }
    
    generateComplianceRecommendations() {
        const recommendations = [];
        
        if (this.complianceMetrics.dataIntegrity < 99) {
            recommendations.push('Improve data integrity monitoring and validation processes');
        }
        
        if (this.complianceMetrics.accessControl < 99) {
            recommendations.push('Strengthen access control policies and user authentication');
        }
        
        if (this.complianceMetrics.securityCompliance < 98) {
            recommendations.push('Enhance security monitoring and incident response procedures');
        }
        
        return recommendations;
    }
    
    refreshLogs() {
        this.loadAuditLogs();
        this.renderAuditLogs();
        this.showNotification('success', 'Audit logs refreshed');
    }
    
    clearFilters() {
        this.filters = {
            timeRange: '7d',
            user: 'all',
            action: 'all',
            resource: 'all',
            status: 'all'
        };
        
        // Reset filter dropdowns
        document.getElementById('timeRangeFilter').value = '7d';
        document.getElementById('userFilter').value = 'all';
        document.getElementById('actionFilter').value = 'all';
        document.getElementById('resourceFilter').value = 'all';
        document.getElementById('statusFilter').value = 'all';
        
        this.pagination.currentPage = 1;
        this.renderAuditLogs();
        
        this.showNotification('info', 'Filters cleared');
    }
    
    changePage(page) {
        this.pagination.currentPage = page;
        this.renderAuditLogs();
    }
    
    // Utility methods
    formatTimestamp(timestamp) {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    }
    
    getActionIcon(action) {
        const icons = {
            create: 'plus',
            update: 'edit',
            delete: 'trash-2',
            login: 'log-in',
            logout: 'log-out'
        };
        return icons[action] || 'activity';
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
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
}

// Initialize the audit logging system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the audit logging system
    window.auditLoggingSystem = new AuditLoggingSystem();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuditLoggingSystem;
}
