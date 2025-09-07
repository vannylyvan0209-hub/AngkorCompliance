// Performance Optimization Core
class PerformanceOptimizationCore {
    constructor() {
        this.currentUser = null;
        this.performanceMetrics = [];
        this.optimizationTools = [];
        this.cachingSystems = [];
        this.performanceAnalytics = [];
        this.currentTab = 'monitoring';
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        console.log('⚡ Initializing Performance Optimization Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ Performance Optimization Core initialized');
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
        if (window.superAdminNavigation) {
            window.superAdminNavigation.updateCurrentPage('Performance Optimization');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadPerformanceMetrics(),
            this.loadOptimizationTools(),
            this.loadCachingSystems(),
            this.loadPerformanceAnalytics()
        ]);
        
        this.updateOverviewStats();
        this.renderPerformanceMonitoring();
        this.renderOptimizationTools();
        this.renderCachingManagement();
        this.renderPerformanceAnalytics();
    }
    
    async loadPerformanceMetrics() {
        try {
            const metricsRef = this.collection(this.db, 'performance_metrics');
            const snapshot = await this.getDocs(metricsRef);
            this.performanceMetrics = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.performanceMetrics.length === 0) {
                this.performanceMetrics = this.getMockPerformanceMetrics();
            }
            console.log(`✓ Loaded ${this.performanceMetrics.length} performance metrics`);
        } catch (error) {
            console.error('Error loading performance metrics:', error);
            this.performanceMetrics = this.getMockPerformanceMetrics();
        }
    }
    
    async loadOptimizationTools() {
        try {
            const toolsRef = this.collection(this.db, 'optimization_tools');
            const snapshot = await this.getDocs(toolsRef);
            this.optimizationTools = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.optimizationTools.length === 0) {
                this.optimizationTools = this.getMockOptimizationTools();
            }
            console.log(`✓ Loaded ${this.optimizationTools.length} optimization tools`);
        } catch (error) {
            console.error('Error loading optimization tools:', error);
            this.optimizationTools = this.getMockOptimizationTools();
        }
    }
    
    async loadCachingSystems() {
        try {
            const cachingRef = this.collection(this.db, 'caching_systems');
            const snapshot = await this.getDocs(cachingRef);
            this.cachingSystems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.cachingSystems.length === 0) {
                this.cachingSystems = this.getMockCachingSystems();
            }
            console.log(`✓ Loaded ${this.cachingSystems.length} caching systems`);
        } catch (error) {
            console.error('Error loading caching systems:', error);
            this.cachingSystems = this.getMockCachingSystems();
        }
    }
    
    async loadPerformanceAnalytics() {
        try {
            const analyticsRef = this.collection(this.db, 'performance_analytics');
            const snapshot = await this.getDocs(analyticsRef);
            this.performanceAnalytics = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.performanceAnalytics.length === 0) {
                this.performanceAnalytics = this.getMockPerformanceAnalytics();
            }
            console.log(`✓ Loaded ${this.performanceAnalytics.length} performance analytics`);
        } catch (error) {
            console.error('Error loading performance analytics:', error);
            this.performanceAnalytics = this.getMockPerformanceAnalytics();
        }
    }
    
    getMockPerformanceMetrics() {
        return [
            {
                id: 'metric_1',
                name: 'Database Response Time',
                description: 'Average response time for database queries and operations',
                status: 'optimal',
                currentValue: 45,
                unit: 'ms',
                threshold: 100,
                lastUpdated: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
                metrics: {
                    average: 45,
                    min: 12,
                    max: 89,
                    percentile95: 78
                },
                trend: 'stable'
            },
            {
                id: 'metric_2',
                name: 'API Response Time',
                description: 'Average response time for API endpoints and requests',
                status: 'optimal',
                currentValue: 145,
                unit: 'ms',
                threshold: 500,
                lastUpdated: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
                metrics: {
                    average: 145,
                    min: 67,
                    max: 234,
                    percentile95: 198
                },
                trend: 'stable'
            },
            {
                id: 'metric_3',
                name: 'Memory Usage',
                description: 'System memory utilization and consumption patterns',
                status: 'warning',
                currentValue: 78,
                unit: '%',
                threshold: 85,
                lastUpdated: new Date(Date.now() - 30 * 1000), // 30 seconds ago
                metrics: {
                    used: 78,
                    total: 100,
                    available: 22,
                    peak: 82
                },
                trend: 'up'
            },
            {
                id: 'metric_4',
                name: 'CPU Usage',
                description: 'Central processing unit utilization and load',
                status: 'optimal',
                currentValue: 45,
                unit: '%',
                threshold: 80,
                lastUpdated: new Date(Date.now() - 15 * 1000), // 15 seconds ago
                metrics: {
                    average: 45,
                    min: 23,
                    max: 67,
                    cores: 8
                },
                trend: 'stable'
            },
            {
                id: 'metric_5',
                name: 'Disk I/O',
                description: 'Disk input/output operations and throughput',
                status: 'optimal',
                currentValue: 234,
                unit: 'MB/s',
                threshold: 1000,
                lastUpdated: new Date(Date.now() - 45 * 1000), // 45 seconds ago
                metrics: {
                    read: 156,
                    write: 78,
                    total: 234,
                    queue: 2
                },
                trend: 'stable'
            },
            {
                id: 'metric_6',
                name: 'Network Latency',
                description: 'Network communication latency and packet loss',
                status: 'critical',
                currentValue: 456,
                unit: 'ms',
                threshold: 200,
                lastUpdated: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
                metrics: {
                    average: 456,
                    min: 123,
                    max: 789,
                    packetLoss: 0.5
                },
                trend: 'up'
            }
        ];
    }
    
    getMockOptimizationTools() {
        return [
            {
                id: 'tool_1',
                name: 'Database Query Optimizer',
                description: 'Automatically optimize database queries and improve performance',
                status: 'enabled',
                lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                configuration: {
                    autoOptimize: true,
                    schedule: 'daily',
                    threshold: 100
                },
                results: {
                    queriesOptimized: 45,
                    performanceGain: 23,
                    lastOptimization: new Date(Date.now() - 2 * 60 * 60 * 1000)
                }
            },
            {
                id: 'tool_2',
                name: 'Memory Cleanup',
                description: 'Automatically clean up memory leaks and optimize memory usage',
                status: 'enabled',
                lastRun: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                configuration: {
                    autoCleanup: true,
                    schedule: 'hourly',
                    threshold: 80
                },
                results: {
                    memoryFreed: 256,
                    leaksFixed: 3,
                    lastCleanup: new Date(Date.now() - 30 * 60 * 1000)
                }
            },
            {
                id: 'tool_3',
                name: 'Cache Optimization',
                description: 'Optimize cache strategies and improve cache hit rates',
                status: 'enabled',
                lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
                configuration: {
                    autoOptimize: true,
                    schedule: 'hourly',
                    targetHitRate: 90
                },
                results: {
                    hitRateImproved: 5,
                    cacheSizeOptimized: 128,
                    lastOptimization: new Date(Date.now() - 1 * 60 * 60 * 1000)
                }
            },
            {
                id: 'tool_4',
                name: 'API Rate Limiting',
                description: 'Manage API rate limits and prevent system overload',
                status: 'enabled',
                lastRun: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                configuration: {
                    autoAdjust: true,
                    maxRequests: 1000,
                    windowSize: 60
                },
                results: {
                    requestsLimited: 23,
                    overloadsPrevented: 2,
                    lastAdjustment: new Date(Date.now() - 15 * 60 * 1000)
                }
            },
            {
                id: 'tool_5',
                name: 'Load Balancer',
                description: 'Distribute load across multiple servers and optimize traffic',
                status: 'enabled',
                lastRun: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                configuration: {
                    algorithm: 'round-robin',
                    healthCheck: true,
                    failover: true
                },
                results: {
                    serversActive: 3,
                    loadDistributed: 67,
                    lastRebalance: new Date(Date.now() - 5 * 60 * 1000)
                }
            },
            {
                id: 'tool_6',
                name: 'Compression Engine',
                description: 'Compress data and reduce bandwidth usage',
                status: 'disabled',
                lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                configuration: {
                    autoCompress: false,
                    algorithm: 'gzip',
                    threshold: 1024
                },
                results: {
                    dataCompressed: 0,
                    bandwidthSaved: 0,
                    lastCompression: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            }
        ];
    }
    
    getMockCachingSystems() {
        return [
            {
                id: 'cache_1',
                name: 'Redis Cache',
                description: 'In-memory data structure store for high-performance caching',
                status: 'active',
                lastUpdated: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
                configuration: {
                    maxMemory: '2GB',
                    evictionPolicy: 'LRU',
                    persistence: true
                },
                stats: {
                    hitRate: 87,
                    missRate: 13,
                    totalKeys: 15420,
                    memoryUsed: '1.2GB'
                }
            },
            {
                id: 'cache_2',
                name: 'CDN Cache',
                description: 'Content delivery network for static asset caching',
                status: 'active',
                lastUpdated: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                configuration: {
                    ttl: 3600,
                    compression: true,
                    edgeLocations: 12
                },
                stats: {
                    hitRate: 94,
                    missRate: 6,
                    totalAssets: 8920,
                    bandwidthSaved: '2.3TB'
                }
            },
            {
                id: 'cache_3',
                name: 'Database Query Cache',
                description: 'Cache frequently executed database queries',
                status: 'active',
                lastUpdated: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
                configuration: {
                    maxSize: '512MB',
                    ttl: 1800,
                    autoInvalidate: true
                },
                stats: {
                    hitRate: 76,
                    missRate: 24,
                    cachedQueries: 2340,
                    memoryUsed: '256MB'
                }
            },
            {
                id: 'cache_4',
                name: 'Session Cache',
                description: 'Cache user sessions and authentication data',
                status: 'active',
                lastUpdated: new Date(Date.now() - 30 * 1000), // 30 seconds ago
                configuration: {
                    maxSessions: 10000,
                    ttl: 7200,
                    encryption: true
                },
                stats: {
                    hitRate: 98,
                    missRate: 2,
                    activeSessions: 3456,
                    memoryUsed: '128MB'
                }
            },
            {
                id: 'cache_5',
                name: 'API Response Cache',
                description: 'Cache API responses to reduce server load',
                status: 'inactive',
                lastUpdated: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
                configuration: {
                    maxSize: '1GB',
                    ttl: 900,
                    cacheableEndpoints: ['GET']
                },
                stats: {
                    hitRate: 0,
                    missRate: 100,
                    cachedResponses: 0,
                    memoryUsed: '0MB'
                }
            },
            {
                id: 'cache_6',
                name: 'File System Cache',
                description: 'Cache file system operations and metadata',
                status: 'active',
                lastUpdated: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
                configuration: {
                    maxSize: '256MB',
                    ttl: 3600,
                    prefetch: true
                },
                stats: {
                    hitRate: 82,
                    missRate: 18,
                    cachedFiles: 5670,
                    memoryUsed: '89MB'
                }
            }
        ];
    }
    
    getMockPerformanceAnalytics() {
        return [
            {
                id: 'analytics_1',
                name: 'Response Time Trends',
                description: 'Historical analysis of system response times and performance patterns',
                trend: 'up',
                lastUpdated: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
                metrics: {
                    current: 145,
                    previous: 132,
                    change: 9.8,
                    period: '24h'
                },
                insights: [
                    'Response time increased by 9.8% in the last 24 hours',
                    'Peak usage occurred at 2:00 PM with 234ms average',
                    'Database queries are the primary bottleneck'
                ]
            },
            {
                id: 'analytics_2',
                name: 'Throughput Analysis',
                description: 'System throughput and request processing capacity analysis',
                trend: 'up',
                lastUpdated: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                metrics: {
                    current: 2400,
                    previous: 2100,
                    change: 14.3,
                    period: '24h'
                },
                insights: [
                    'Throughput increased by 14.3% in the last 24 hours',
                    'Peak throughput reached 3.2K requests/minute',
                    'System is handling increased load efficiently'
                ]
            },
            {
                id: 'analytics_3',
                name: 'Error Rate Monitoring',
                description: 'System error rates and failure pattern analysis',
                trend: 'down',
                lastUpdated: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
                metrics: {
                    current: 0.2,
                    previous: 0.8,
                    change: -75.0,
                    period: '24h'
                },
                insights: [
                    'Error rate decreased by 75% in the last 24 hours',
                    'Most errors are related to timeout issues',
                    'System stability has significantly improved'
                ]
            },
            {
                id: 'analytics_4',
                name: 'Resource Utilization',
                description: 'CPU, memory, and disk utilization patterns and trends',
                trend: 'stable',
                lastUpdated: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
                metrics: {
                    current: 67,
                    previous: 65,
                    change: 3.1,
                    period: '24h'
                },
                insights: [
                    'Resource utilization increased by 3.1% in the last 24 hours',
                    'Memory usage is approaching warning threshold',
                    'CPU utilization remains within optimal range'
                ]
            },
            {
                id: 'analytics_5',
                name: 'Cache Performance',
                description: 'Cache hit rates and efficiency analysis across all caching layers',
                trend: 'up',
                lastUpdated: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
                metrics: {
                    current: 87,
                    previous: 82,
                    change: 6.1,
                    period: '24h'
                },
                insights: [
                    'Cache hit rate improved by 6.1% in the last 24 hours',
                    'Redis cache is performing exceptionally well',
                    'CDN cache hit rate reached 94%'
                ]
            },
            {
                id: 'analytics_6',
                name: 'User Experience Metrics',
                description: 'User experience metrics including page load times and interaction delays',
                trend: 'up',
                lastUpdated: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                metrics: {
                    current: 1.2,
                    previous: 1.8,
                    change: -33.3,
                    period: '24h'
                },
                insights: [
                    'Page load time improved by 33.3% in the last 24 hours',
                    'User satisfaction scores have increased',
                    'Mobile performance has significantly improved'
                ]
            }
        ];
    }
    
    updateOverviewStats() {
        const avgResponseTime = this.performanceMetrics.find(m => m.name === 'API Response Time')?.currentValue || 145;
        const throughput = this.performanceAnalytics.find(a => a.name === 'Throughput Analysis')?.metrics.current || 2400;
        const cacheHitRate = this.cachingSystems.reduce((acc, cache) => acc + cache.stats.hitRate, 0) / this.cachingSystems.length || 87;
        const errorRate = this.performanceAnalytics.find(a => a.name === 'Error Rate Monitoring')?.metrics.current || 0.2;
        
        document.getElementById('responseTime').textContent = `${avgResponseTime}ms`;
        document.getElementById('throughput').textContent = `${(throughput / 1000).toFixed(1)}K`;
        document.getElementById('cacheHitRate').textContent = `${Math.round(cacheHitRate)}%`;
        document.getElementById('errorRate').textContent = `${errorRate}%`;
    }
    
    renderPerformanceMonitoring() {
        const container = document.getElementById('performanceMonitoring');
        if (!container) return;
        
        container.innerHTML = this.performanceMetrics.map(metric => `
            <div class="monitoring-item">
                <div class="monitoring-header">
                    <div class="monitoring-name">${metric.name}</div>
                    <div class="monitoring-status ${metric.status}">${metric.status}</div>
                </div>
                <div class="monitoring-description">${metric.description}</div>
                <div class="monitoring-metrics">
                    <div><strong>Current:</strong> ${metric.currentValue}${metric.unit}</div>
                    <div><strong>Threshold:</strong> ${metric.threshold}${metric.unit}</div>
                    <div><strong>Trend:</strong> ${metric.trend}</div>
                    <div><strong>Updated:</strong> ${this.formatTime(metric.lastUpdated)}</div>
                </div>
                <div class="monitoring-actions">
                    <button class="monitoring-btn" onclick="viewMetricDetails('${metric.id}')">View Details</button>
                    <button class="monitoring-btn" onclick="configureMetric('${metric.id}')">Configure</button>
                    <button class="monitoring-btn" onclick="testMetric('${metric.id}')">Test</button>
                </div>
            </div>
        `).join('');
    }
    
    renderOptimizationTools() {
        const container = document.getElementById('optimizationTools');
        if (!container) return;
        
        container.innerHTML = this.optimizationTools.map(tool => `
            <div class="tool-item">
                <div class="tool-header">
                    <div class="tool-name">${tool.name}</div>
                    <div class="tool-status ${tool.status}">${tool.status}</div>
                </div>
                <div class="tool-description">${tool.description}</div>
                <div style="margin-bottom: var(--space-3); font-size: var(--text-xs); color: var(--neutral-500);">
                    <strong>Last Run:</strong> ${this.formatTime(tool.lastRun)}<br>
                    <strong>Schedule:</strong> ${tool.configuration.schedule}
                </div>
                <div class="tool-actions">
                    <button class="tool-btn" onclick="viewToolDetails('${tool.id}')">View Details</button>
                    <button class="tool-btn" onclick="runTool('${tool.id}')">Run Now</button>
                    <button class="tool-btn" onclick="configureTool('${tool.id}')">Configure</button>
                </div>
            </div>
        `).join('');
    }
    
    renderCachingManagement() {
        const container = document.getElementById('cachingManagement');
        if (!container) return;
        
        container.innerHTML = this.cachingSystems.map(cache => `
            <div class="cache-item">
                <div class="cache-header">
                    <div class="cache-name">${cache.name}</div>
                    <div class="cache-status ${cache.status}">${cache.status}</div>
                </div>
                <div class="cache-description">${cache.description}</div>
                <div class="cache-stats">
                    <div><strong>Hit Rate:</strong> ${cache.stats.hitRate}%</div>
                    <div><strong>Memory Used:</strong> ${cache.stats.memoryUsed}</div>
                    <div><strong>Total Keys:</strong> ${cache.stats.totalKeys?.toLocaleString() || 'N/A'}</div>
                    <div><strong>Updated:</strong> ${this.formatTime(cache.lastUpdated)}</div>
                </div>
                <div class="cache-actions">
                    <button class="cache-btn" onclick="viewCacheDetails('${cache.id}')">View Details</button>
                    <button class="cache-btn" onclick="clearCache('${cache.id}')">Clear Cache</button>
                    <button class="cache-btn" onclick="configureCache('${cache.id}')">Configure</button>
                </div>
            </div>
        `).join('');
    }
    
    renderPerformanceAnalytics() {
        const container = document.getElementById('performanceAnalytics');
        if (!container) return;
        
        container.innerHTML = this.performanceAnalytics.map(analytics => `
            <div class="analytics-item">
                <div class="analytics-header">
                    <div class="analytics-name">${analytics.name}</div>
                    <div class="analytics-trend ${analytics.trend}">${analytics.trend}</div>
                </div>
                <div class="analytics-description">${analytics.description}</div>
                <div class="analytics-metrics">
                    <div><strong>Current:</strong> ${analytics.metrics.current}${analytics.metrics.period === '24h' ? '' : '%'}</div>
                    <div><strong>Change:</strong> ${analytics.metrics.change > 0 ? '+' : ''}${analytics.metrics.change}%</div>
                    <div><strong>Period:</strong> ${analytics.metrics.period}</div>
                    <div><strong>Updated:</strong> ${this.formatTime(analytics.lastUpdated)}</div>
                </div>
                <div class="analytics-actions">
                    <button class="analytics-btn" onclick="viewAnalyticsDetails('${analytics.id}')">View Details</button>
                    <button class="analytics-btn" onclick="exportAnalytics('${analytics.id}')">Export</button>
                    <button class="analytics-btn" onclick="configureAnalytics('${analytics.id}')">Configure</button>
                </div>
            </div>
        `).join('');
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
    
    initializeUI() {
        // Initialize any UI components
    }
    
    setupEventListeners() {
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        window.runOptimization = () => this.runOptimization();
        window.generateReport = () => this.generateReport();
        window.refreshMetrics = () => this.refreshMetrics();
        window.exportMetrics = () => this.exportMetrics();
        window.switchTab = (tabName) => this.switchTab(tabName);
        window.viewMetricDetails = (metricId) => this.viewMetricDetails(metricId);
        window.configureMetric = (metricId) => this.configureMetric(metricId);
        window.testMetric = (metricId) => this.testMetric(metricId);
        window.viewToolDetails = (toolId) => this.viewToolDetails(toolId);
        window.runTool = (toolId) => this.runTool(toolId);
        window.configureTool = (toolId) => this.configureTool(toolId);
        window.viewCacheDetails = (cacheId) => this.viewCacheDetails(cacheId);
        window.clearCache = (cacheId) => this.clearCache(cacheId);
        window.configureCache = (cacheId) => this.configureCache(cacheId);
        window.viewAnalyticsDetails = (analyticsId) => this.viewAnalyticsDetails(analyticsId);
        window.exportAnalytics = (analyticsId) => this.exportAnalytics(analyticsId);
        window.configureAnalytics = (analyticsId) => this.configureAnalytics(analyticsId);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const metricsRef = this.collection(this.db, 'performance_metrics');
        this.onSnapshot(metricsRef, (snapshot) => {
            this.performanceMetrics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderPerformanceMonitoring();
        });
        
        const toolsRef = this.collection(this.db, 'optimization_tools');
        this.onSnapshot(toolsRef, (snapshot) => {
            this.optimizationTools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderOptimizationTools();
        });
        
        const cachingRef = this.collection(this.db, 'caching_systems');
        this.onSnapshot(cachingRef, (snapshot) => {
            this.cachingSystems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderCachingManagement();
        });
        
        const analyticsRef = this.collection(this.db, 'performance_analytics');
        this.onSnapshot(analyticsRef, (snapshot) => {
            this.performanceAnalytics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderPerformanceAnalytics();
        });
    }
    
    // Utility methods
    showNotification(type, message) {
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
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    window.performanceOptimizationCore = new PerformanceOptimizationCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizationCore;
}
