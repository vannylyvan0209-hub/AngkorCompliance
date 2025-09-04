/**
 * Comprehensive Audit Logging System Implementation
 * Angkor Compliance Platform - Phase 0, Week 3
 * 
 * This module implements:
 * - Immutable audit logging
 * - Data lineage tracking
 * - Security monitoring
 * - Audit export functionality
 * - Compliance reporting
 */

class ComprehensiveAuditLogging {
    constructor() {
        this.auditQueue = [];
        this.auditProcessor = null;
        this.securityMonitor = null;
        this.dataLineageTracker = null;
        this.exportManager = null;
        
        // Initialize audit logging system
        this.initializeSystem();
    }

    /**
     * Initialize the comprehensive audit logging system
     */
    async initializeSystem() {
        try {
            // Initialize audit processor
            this.auditProcessor = new AuditProcessor();
            
            // Initialize security monitor
            this.securityMonitor = new SecurityMonitor();
            
            // Initialize data lineage tracker
            this.dataLineageTracker = new DataLineageTracker();
            
            // Initialize export manager
            this.exportManager = new AuditExportManager();
            
            // Start audit processing
            this.startAuditProcessing();
            
            console.log('Comprehensive audit logging system initialized');
        } catch (error) {
            console.error('Failed to initialize audit logging system:', error);
            throw error;
        }
    }

    /**
     * Start audit processing
     */
    startAuditProcessing() {
        // Process audit queue every 5 seconds
        setInterval(() => {
            this.processAuditQueue();
        }, 5000);
    }

    /**
     * Log audit event with comprehensive metadata
     */
    async logAuditEvent(action, metadata, options = {}) {
        try {
            const auditEvent = await this.createAuditEvent(action, metadata, options);
            
            // Add to processing queue
            this.auditQueue.push(auditEvent);
            
            // Process immediately if high priority
            if (options.priority === 'high') {
                await this.processAuditEvent(auditEvent);
            }
            
            return auditEvent.id;
        } catch (error) {
            console.error('Failed to log audit event:', error);
            throw error;
        }
    }

    /**
     * Create comprehensive audit event
     */
    async createAuditEvent(action, metadata, options = {}) {
        try {
            const eventId = this.generateEventId();
            const timestamp = Firebase.serverTimestamp();
            const user = Firebase.auth.currentUser;
            
            // Get client information
            const clientInfo = await this.getClientInformation();
            
            // Get session information
            const sessionInfo = this.getSessionInformation();
            
            // Create base audit event
            const auditEvent = {
                id: eventId,
                timestamp,
                action,
                resource: metadata.resource || 'unknown',
                userId: user?.uid || 'system',
                userEmail: user?.email || 'system',
                userRole: await this.getUserRole(user?.uid),
                tenantId: metadata.tenantId || await this.getCurrentTenantId(),
                factoryId: metadata.factoryId || null,
                metadata,
                clientInfo,
                sessionInfo,
                priority: options.priority || 'normal',
                status: 'pending',
                hash: null,
                signature: null,
                createdAt: timestamp
            };

            // Add data lineage information
            if (metadata.dataLineage) {
                auditEvent.dataLineage = await this.dataLineageTracker.trackLineage(metadata.dataLineage);
            }

            // Add security context
            auditEvent.securityContext = await this.securityMonitor.getSecurityContext(auditEvent);

            // Generate hash for immutability
            auditEvent.hash = await this.generateEventHash(auditEvent);

            return auditEvent;
        } catch (error) {
            console.error('Failed to create audit event:', error);
            throw error;
        }
    }

    /**
     * Generate unique event ID
     */
    generateEventId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `audit-${timestamp}-${random}`;
    }

    /**
     * Get client information
     */
    async getClientInformation() {
        try {
            return {
                ipAddress: await this.getClientIP(),
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                screenResolution: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                referrer: document.referrer,
                url: window.location.href
            };
        } catch (error) {
            console.error('Failed to get client information:', error);
            return {};
        }
    }

    /**
     * Get client IP address
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Get session information
     */
    getSessionInformation() {
        return {
            sessionId: sessionStorage.getItem('sessionId') || 'unknown',
            loginTime: sessionStorage.getItem('loginTime') || 'unknown',
            lastActivity: sessionStorage.getItem('lastActivity') || 'unknown',
            deviceId: sessionStorage.getItem('deviceId') || 'unknown'
        };
    }

    /**
     * Get user role
     */
    async getUserRole(userId) {
        try {
            if (!userId) return 'system';
            
            const userDoc = await Firebase.getDoc(
                Firebase.doc(Firebase.db, 'users', userId)
            );
            
            if (userDoc.exists()) {
                return userDoc.data().role || 'unknown';
            }
            
            return 'unknown';
        } catch (error) {
            console.error('Failed to get user role:', error);
            return 'unknown';
        }
    }

    /**
     * Get current tenant ID
     */
    async getCurrentTenantId() {
        try {
            if (window.multiTenant && window.multiTenant.getCurrentTenant()) {
                return window.multiTenant.getCurrentTenant().id;
            }
            return 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Generate event hash for immutability
     */
    async generateEventHash(auditEvent) {
        try {
            // Create hashable string (exclude hash and signature fields)
            const hashableData = { ...auditEvent };
            delete hashableData.hash;
            delete hashableData.signature;
            
            const hashString = JSON.stringify(hashableData);
            
            // Use Web Crypto API for SHA-256 hash
            const encoder = new TextEncoder();
            const data = encoder.encode(hashString);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            
            // Convert to hex string
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            return hashHex;
        } catch (error) {
            console.error('Failed to generate event hash:', error);
            return 'hash-error';
        }
    }

    /**
     * Process audit queue
     */
    async processAuditQueue() {
        try {
            if (this.auditQueue.length === 0) return;
            
            const events = [...this.auditQueue];
            this.auditQueue = [];
            
            for (const event of events) {
                await this.processAuditEvent(event);
            }
        } catch (error) {
            console.error('Failed to process audit queue:', error);
        }
    }

    /**
     * Process individual audit event
     */
    async processAuditEvent(auditEvent) {
        try {
            // Process through audit processor
            const processedEvent = await this.auditProcessor.process(auditEvent);
            
            // Store in Firestore
            await this.storeAuditEvent(processedEvent);
            
            // Update data lineage
            if (processedEvent.dataLineage) {
                await this.dataLineageTracker.updateLineage(processedEvent);
            }
            
            // Check security alerts
            await this.securityMonitor.checkSecurityAlerts(processedEvent);
            
            console.log(`Audit event processed: ${processedEvent.id}`);
        } catch (error) {
            console.error('Failed to process audit event:', error);
            // Re-queue for retry
            this.auditQueue.push(auditEvent);
        }
    }

    /**
     * Store audit event in Firestore
     */
    async storeAuditEvent(auditEvent) {
        try {
            // Store in main audit collection
            await Firebase.setDoc(
                Firebase.doc(Firebase.db, 'audit-logs', auditEvent.id),
                auditEvent
            );
            
            // Store in tenant-specific collection if applicable
            if (auditEvent.tenantId && auditEvent.tenantId !== 'unknown') {
                await Firebase.setDoc(
                    Firebase.doc(Firebase.db, 'tenants', auditEvent.tenantId, 'audit-logs', auditEvent.id),
                    auditEvent
                );
            }
            
            // Store in factory-specific collection if applicable
            if (auditEvent.factoryId) {
                await Firebase.setDoc(
                    Firebase.doc(Firebase.db, 'factories', auditEvent.factoryId, 'audit-logs', auditEvent.id),
                    auditEvent
                );
            }
            
        } catch (error) {
            console.error('Failed to store audit event:', error);
            throw error;
        }
    }

    /**
     * Search audit logs
     */
    async searchAuditLogs(query, options = {}) {
        try {
            const searchResults = await this.auditProcessor.search(query, options);
            return searchResults;
        } catch (error) {
            console.error('Failed to search audit logs:', error);
            throw error;
        }
    }

    /**
     * Export audit logs
     */
    async exportAuditLogs(format, query, options = {}) {
        try {
            const exportData = await this.exportManager.exportLogs(format, query, options);
            return exportData;
        } catch (error) {
            console.error('Failed to export audit logs:', error);
            throw error;
        }
    }

    /**
     * Get audit statistics
     */
    async getAuditStatistics(tenantId = null, timeRange = '30d') {
        try {
            const stats = await this.auditProcessor.getStatistics(tenantId, timeRange);
            return stats;
        } catch (error) {
            console.error('Failed to get audit statistics:', error);
            throw error;
        }
    }

    /**
     * Get security alerts
     */
    async getSecurityAlerts(tenantId = null, severity = 'all') {
        try {
            const alerts = await this.securityMonitor.getAlerts(tenantId, severity);
            return alerts;
        } catch (error) {
            console.error('Failed to get security alerts:', error);
            throw error;
        }
    }
}

/**
 * Audit Processor for handling audit events
 */
class AuditProcessor {
    constructor() {
        this.processors = new Map();
        this.searchIndex = new Map();
        this.statistics = new Map();
        
        // Initialize processors
        this.initializeProcessors();
    }

    /**
     * Initialize audit processors
     */
    initializeProcessors() {
        // User action processor
        this.processors.set('user', new UserActionProcessor());
        
        // Document processor
        this.processors.set('document', new DocumentActionProcessor());
        
        // Case processor
        this.processors.set('case', new CaseActionProcessor());
        
        // CAP processor
        this.processors.set('cap', new CAPActionProcessor());
        
        // System processor
        this.processors.set('system', new SystemActionProcessor());
    }

    /**
     * Process audit event
     */
    async process(auditEvent) {
        try {
            // Get appropriate processor
            const processor = this.getProcessor(auditEvent.resource);
            if (processor) {
                auditEvent = await processor.process(auditEvent);
            }
            
            // Add to search index
            this.indexEvent(auditEvent);
            
            // Update statistics
            this.updateStatistics(auditEvent);
            
            // Mark as processed
            auditEvent.status = 'processed';
            auditEvent.processedAt = Firebase.serverTimestamp();
            
            return auditEvent;
        } catch (error) {
            console.error('Failed to process audit event:', error);
            auditEvent.status = 'error';
            auditEvent.error = error.message;
            return auditEvent;
        }
    }

    /**
     * Get appropriate processor for resource
     */
    getProcessor(resource) {
        const resourceType = this.getResourceType(resource);
        return this.processors.get(resourceType);
    }

    /**
     * Get resource type from resource string
     */
    getResourceType(resource) {
        if (resource.includes('user')) return 'user';
        if (resource.includes('document')) return 'document';
        if (resource.includes('case')) return 'case';
        if (resource.includes('cap')) return 'cap';
        return 'system';
    }

    /**
     * Index event for search
     */
    indexEvent(auditEvent) {
        const indexKey = `${auditEvent.resource}-${auditEvent.action}`;
        
        if (!this.searchIndex.has(indexKey)) {
            this.searchIndex.set(indexKey, []);
        }
        
        this.searchIndex.get(indexKey).push({
            id: auditEvent.id,
            timestamp: auditEvent.timestamp,
            userId: auditEvent.userId,
            metadata: auditEvent.metadata
        });
    }

    /**
     * Update statistics
     */
    updateStatistics(auditEvent) {
        const date = new Date().toISOString().split('T')[0];
        
        if (!this.statistics.has(date)) {
            this.statistics.set(date, {
                totalEvents: 0,
                byAction: {},
                byResource: {},
                byUser: {},
                byTenant: {}
            });
        }
        
        const dayStats = this.statistics.get(date);
        dayStats.totalEvents++;
        
        // Count by action
        dayStats.byAction[auditEvent.action] = (dayStats.byAction[auditEvent.action] || 0) + 1;
        
        // Count by resource
        dayStats.byResource[auditEvent.resource] = (dayStats.byResource[auditEvent.resource] || 0) + 1;
        
        // Count by user
        dayStats.byUser[auditEvent.userId] = (dayStats.byUser[auditEvent.userId] || 0) + 1;
        
        // Count by tenant
        if (auditEvent.tenantId) {
            dayStats.byTenant[auditEvent.tenantId] = (dayStats.byTenant[auditEvent.tenantId] || 0) + 1;
        }
    }

    /**
     * Search audit logs
     */
    async search(query, options = {}) {
        try {
            const results = [];
            const searchTerm = query.toLowerCase();
            
            // Search through indexed events
            for (const [indexKey, events] of this.searchIndex) {
                for (const event of events) {
                    if (this.matchesSearch(event, searchTerm, options)) {
                        results.push(event);
                    }
                }
            }
            
            // Sort results
            results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Apply pagination
            if (options.limit) {
                return results.slice(0, options.limit);
            }
            
            return results;
        } catch (error) {
            console.error('Search failed:', error);
            throw error;
        }
    }

    /**
     * Check if event matches search criteria
     */
    matchesSearch(event, searchTerm, options) {
        // Check action
        if (options.action && event.metadata.action !== options.action) {
            return false;
        }
        
        // Check resource
        if (options.resource && event.metadata.resource !== options.resource) {
            return false;
        }
        
        // Check user
        if (options.userId && event.userId !== options.userId) {
            return false;
        }
        
        // Check date range
        if (options.startDate || options.endDate) {
            const eventDate = new Date(event.timestamp);
            if (options.startDate && eventDate < new Date(options.startDate)) {
                return false;
            }
            if (options.endDate && eventDate > new Date(options.endDate)) {
                return false;
            }
        }
        
        // Check search term
        if (searchTerm) {
            const searchableText = JSON.stringify(event.metadata).toLowerCase();
            return searchableText.includes(searchTerm);
        }
        
        return true;
    }

    /**
     * Get audit statistics
     */
    async getStatistics(tenantId, timeRange) {
        try {
            const stats = {
                totalEvents: 0,
                byAction: {},
                byResource: {},
                byUser: {},
                byTenant: {},
                timeRange
            };
            
            // Aggregate statistics
            for (const [date, dayStats] of this.statistics) {
                if (this.isInTimeRange(date, timeRange)) {
                    stats.totalEvents += dayStats.totalEvents;
                    
                    // Aggregate by action
                    for (const [action, count] of Object.entries(dayStats.byAction)) {
                        stats.byAction[action] = (stats.byAction[action] || 0) + count;
                    }
                    
                    // Aggregate by resource
                    for (const [resource, count] of Object.entries(dayStats.byResource)) {
                        stats.byResource[resource] = (stats.byResource[resource] || 0) + count;
                    }
                    
                    // Aggregate by user
                    for (const [user, count] of Object.entries(dayStats.byUser)) {
                        stats.byUser[user] = (stats.byUser[user] || 0) + count;
                    }
                    
                    // Aggregate by tenant
                    for (const [tenant, count] of Object.entries(dayStats.byTenant)) {
                        if (!tenantId || tenant === tenantId) {
                            stats.byTenant[tenant] = (stats.byTenant[tenant] || 0) + count;
                        }
                    }
                }
            }
            
            return stats;
        } catch (error) {
            console.error('Failed to get statistics:', error);
            throw error;
        }
    }

    /**
     * Check if date is in time range
     */
    isInTimeRange(date, timeRange) {
        const eventDate = new Date(date);
        const now = new Date();
        
        switch (timeRange) {
            case '1d':
                return eventDate >= new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case '7d':
                return eventDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30d':
                return eventDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case '90d':
                return eventDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            default:
                return true;
        }
    }
}

/**
 * Security Monitor for detecting security threats
 */
class SecurityMonitor {
    constructor() {
        this.securityRules = new Map();
        this.alerts = [];
        this.threatLevel = 'low';
        
        // Initialize security rules
        this.initializeSecurityRules();
    }

    /**
     * Initialize security rules
     */
    initializeSecurityRules() {
        // Failed login attempts
        this.securityRules.set('failed-login', {
            threshold: 5,
            timeWindow: 15 * 60 * 1000, // 15 minutes
            severity: 'medium',
            action: 'block-account'
        });
        
        // Unusual access patterns
        this.securityRules.set('unusual-access', {
            threshold: 3,
            timeWindow: 60 * 60 * 1000, // 1 hour
            severity: 'high',
            action: 'alert-admin'
        });
        
        // Data access violations
        this.securityRules.set('data-violation', {
            threshold: 1,
            timeWindow: 0, // Immediate
            severity: 'critical',
            action: 'block-access'
        });
        
        // Admin privilege escalation
        this.securityRules.set('privilege-escalation', {
            threshold: 1,
            timeWindow: 0, // Immediate
            severity: 'critical',
            action: 'block-access'
        });
    }

    /**
     * Get security context for audit event
     */
    async getSecurityContext(auditEvent) {
        try {
            const context = {
                threatLevel: 'low',
                riskFactors: [],
                recommendations: []
            };
            
            // Check for security threats
            const threats = await this.detectThreats(auditEvent);
            if (threats.length > 0) {
                context.threatLevel = this.calculateThreatLevel(threats);
                context.riskFactors = threats;
                context.recommendations = this.generateRecommendations(threats);
            }
            
            return context;
        } catch (error) {
            console.error('Failed to get security context:', error);
            return { threatLevel: 'unknown', riskFactors: [], recommendations: [] };
        }
    }

    /**
     * Detect security threats
     */
    async detectThreats(auditEvent) {
        const threats = [];
        
        try {
            // Check failed login attempts
            if (auditEvent.action === 'auth.failed-login') {
                const failedLogins = await this.getFailedLoginCount(auditEvent.userId);
                if (failedLogins >= this.securityRules.get('failed-login').threshold) {
                    threats.push({
                        type: 'failed-login',
                        severity: 'medium',
                        description: `Multiple failed login attempts: ${failedLogins}`,
                        recommendation: 'Consider account lockout or additional verification'
                    });
                }
            }
            
            // Check unusual access patterns
            if (auditEvent.action.includes('read') || auditEvent.action.includes('write')) {
                const accessPattern = await this.checkAccessPattern(auditEvent);
                if (accessPattern.unusual) {
                    threats.push({
                        type: 'unusual-access',
                        severity: 'high',
                        description: `Unusual access pattern detected: ${accessPattern.reason}`,
                        recommendation: 'Review user access and consider additional monitoring'
                    });
                }
            }
            
            // Check data access violations
            if (auditEvent.metadata.confidentiality === 'restricted') {
                const userRole = auditEvent.userRole;
                if (!['super-admin'].includes(userRole)) {
                    threats.push({
                        type: 'data-violation',
                        severity: 'critical',
                        description: `Unauthorized access to restricted data by ${userRole}`,
                        recommendation: 'Immediate access revocation and investigation required'
                    });
                }
            }
            
            // Check privilege escalation
            if (auditEvent.action.includes('admin') && !['super-admin'].includes(auditEvent.userRole)) {
                threats.push({
                    type: 'privilege-escalation',
                    severity: 'critical',
                    description: `Unauthorized admin action attempted by ${auditEvent.userRole}`,
                    recommendation: 'Immediate access revocation and security review required'
                });
            }
            
        } catch (error) {
            console.error('Threat detection failed:', error);
        }
        
        return threats;
    }

    /**
     * Get failed login count for user
     */
    async getFailedLoginCount(userId) {
        try {
            const failedLogins = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'audit-logs'),
                    Firebase.where('action', '==', 'auth.failed-login'),
                    Firebase.where('userId', '==', userId),
                    Firebase.where('timestamp', '>=', new Date(Date.now() - 15 * 60 * 1000))
                )
            );
            
            return failedLogins.size;
        } catch (error) {
            console.error('Failed to get failed login count:', error);
            return 0;
        }
    }

    /**
     * Check access pattern for unusual activity
     */
    async checkAccessPattern(auditEvent) {
        try {
            const recentAccess = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'audit-logs'),
                    Firebase.where('userId', '==', auditEvent.userId),
                    Firebase.where('timestamp', '>=', new Date(Date.now() - 60 * 60 * 1000))
                )
            );
            
            const accessCount = recentAccess.size;
            const isUnusual = accessCount > 50; // More than 50 actions per hour
            
            return {
                unusual: isUnusual,
                reason: isUnusual ? `High access frequency: ${accessCount} actions per hour` : 'Normal access pattern'
            };
        } catch (error) {
            console.error('Failed to check access pattern:', error);
            return { unusual: false, reason: 'Unable to determine' };
        }
    }

    /**
     * Calculate overall threat level
     */
    calculateThreatLevel(threats) {
        const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
        let maxLevel = 1;
        
        for (const threat of threats) {
            const level = severityLevels[threat.severity] || 1;
            maxLevel = Math.max(maxLevel, level);
        }
        
        const levelNames = ['low', 'medium', 'high', 'critical'];
        return levelNames[maxLevel - 1];
    }

    /**
     * Generate security recommendations
     */
    generateRecommendations(threats) {
        const recommendations = [];
        
        for (const threat of threats) {
            if (threat.recommendation) {
                recommendations.push(threat.recommendation);
            }
        }
        
        // Add general recommendations based on threat level
        const maxSeverity = Math.max(...threats.map(t => ['low', 'medium', 'high', 'critical'].indexOf(t.severity)));
        
        if (maxSeverity >= 2) { // Medium or higher
            recommendations.push('Enable additional logging and monitoring');
        }
        
        if (maxSeverity >= 3) { // High or higher
            recommendations.push('Review and update access controls');
        }
        
        if (maxSeverity >= 4) { // Critical
            recommendations.push('Immediate security incident response required');
        }
        
        return [...new Set(recommendations)]; // Remove duplicates
    }

    /**
     * Check security alerts
     */
    async checkSecurityAlerts(auditEvent) {
        try {
            const threats = await this.detectThreats(auditEvent);
            
            for (const threat of threats) {
                if (threat.severity === 'high' || threat.severity === 'critical') {
                    await this.createSecurityAlert(auditEvent, threat);
                }
            }
        } catch (error) {
            console.error('Failed to check security alerts:', error);
        }
    }

    /**
     * Create security alert
     */
    async createSecurityAlert(auditEvent, threat) {
        try {
            const alert = {
                id: this.generateAlertId(),
                timestamp: Firebase.serverTimestamp(),
                severity: threat.severity,
                type: threat.type,
                description: threat.description,
                recommendation: threat.recommendation,
                auditEventId: auditEvent.id,
                userId: auditEvent.userId,
                tenantId: auditEvent.tenantId,
                status: 'active',
                acknowledged: false,
                acknowledgedBy: null,
                acknowledgedAt: null
            };
            
            // Store alert
            await Firebase.addDoc(
                Firebase.collection(Firebase.db, 'security-alerts'),
                alert
            );
            
            // Add to local alerts
            this.alerts.push(alert);
            
            console.log(`Security alert created: ${alert.id}`);
        } catch (error) {
            console.error('Failed to create security alert:', error);
        }
    }

    /**
     * Generate alert ID
     */
    generateAlertId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `alert-${timestamp}-${random}`;
    }

    /**
     * Get security alerts
     */
    async getAlerts(tenantId, severity) {
        try {
            let query = Firebase.collection(Firebase.db, 'security-alerts');
            
            if (tenantId) {
                query = Firebase.query(query, Firebase.where('tenantId', '==', tenantId));
            }
            
            if (severity !== 'all') {
                query = Firebase.query(query, Firebase.where('severity', '==', severity));
            }
            
            const alertsSnapshot = await Firebase.getDocs(query);
            const alerts = [];
            
            alertsSnapshot.forEach(doc => {
                alerts.push({ id: doc.id, ...doc.data() });
            });
            
            // Sort by severity and timestamp
            alerts.sort((a, b) => {
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
                if (severityDiff !== 0) return severityDiff;
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
            
            return alerts;
        } catch (error) {
            console.error('Failed to get security alerts:', error);
            throw error;
        }
    }
}

/**
 * Data Lineage Tracker for tracking data flow
 */
class DataLineageTracker {
    constructor() {
        this.lineageGraph = new Map();
        this.lineageRules = new Map();
        
        // Initialize lineage rules
        this.initializeLineageRules();
    }

    /**
     * Initialize lineage rules
     */
    initializeLineageRules() {
        // Document lineage rules
        this.lineageRules.set('document', {
            'document.upload': ['document.created'],
            'document.update': ['document.modified'],
            'document.delete': ['document.deleted'],
            'document.approve': ['document.approved', 'workflow.advanced']
        });
        
        // Case lineage rules
        this.lineageRules.set('case', {
            'case.create': ['case.created'],
            'case.assign': ['case.assigned', 'workflow.advanced'],
            'case.resolve': ['case.resolved', 'workflow.completed']
        });
        
        // CAP lineage rules
        this.lineageRules.set('cap', {
            'cap.create': ['cap.created'],
            'cap.approve': ['cap.approved', 'workflow.advanced'],
            'cap.complete': ['cap.completed', 'workflow.completed']
        });
    }

    /**
     * Track data lineage
     */
    async trackLineage(lineageData) {
        try {
            const lineage = {
                id: this.generateLineageId(),
                timestamp: Firebase.serverTimestamp(),
                source: lineageData.source,
                target: lineageData.target,
                relationship: lineageData.relationship,
                metadata: lineageData.metadata || {},
                confidence: lineageData.confidence || 'high'
            };
            
            // Add to lineage graph
            this.addToLineageGraph(lineage);
            
            return lineage;
        } catch (error) {
            console.error('Failed to track lineage:', error);
            return null;
        }
    }

    /**
     * Generate lineage ID
     */
    generateLineageId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `lineage-${timestamp}-${random}`;
    }

    /**
     * Add to lineage graph
     */
    addToLineageGraph(lineage) {
        if (!this.lineageGraph.has(lineage.source)) {
            this.lineageGraph.set(lineage.source, []);
        }
        
        this.lineageGraph.get(lineage.source).push(lineage);
    }

    /**
     * Update lineage for audit event
     */
    async updateLineage(auditEvent) {
        try {
            if (!auditEvent.dataLineage) return;
            
            // Store lineage in Firestore
            await Firebase.setDoc(
                Firebase.doc(Firebase.db, 'data-lineage', auditEvent.dataLineage.id),
                auditEvent.dataLineage
            );
            
            // Update related lineage records
            await this.updateRelatedLineage(auditEvent.dataLineage);
            
        } catch (error) {
            console.error('Failed to update lineage:', error);
        }
    }

    /**
     * Update related lineage records
     */
    async updateRelatedLineage(lineage) {
        try {
            // Find related lineage records
            const relatedLineage = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'data-lineage'),
                    Firebase.where('source', '==', lineage.target)
                )
            );
            
            // Update confidence scores
            for (const doc of relatedLineage.docs) {
                const related = doc.data();
                if (related.confidence === 'high') {
                    await Firebase.updateDoc(
                        Firebase.doc(Firebase.db, 'data-lineage', doc.id),
                        { confidence: 'confirmed' }
                    );
                }
            }
            
        } catch (error) {
            console.error('Failed to update related lineage:', error);
        }
    }

    /**
     * Get data lineage path
     */
    async getLineagePath(source, target, maxDepth = 5) {
        try {
            const path = [];
            const visited = new Set();
            
            const findPath = async (current, target, depth) => {
                if (depth > maxDepth || visited.has(current)) {
                    return null;
                }
                
                visited.add(current);
                
                if (current === target) {
                    return [];
                }
                
                const lineageRecords = this.lineageGraph.get(current) || [];
                
                for (const lineage of lineageRecords) {
                    const subPath = await findPath(lineage.target, target, depth + 1);
                    if (subPath !== null) {
                        return [lineage, ...subPath];
                    }
                }
                
                return null;
            };
            
            const result = await findPath(source, target, 0);
            return result || [];
            
        } catch (error) {
            console.error('Failed to get lineage path:', error);
            return [];
        }
    }
}

/**
 * Audit Export Manager for generating reports
 */
class AuditExportManager {
    constructor() {
        this.exportFormats = ['pdf', 'csv', 'json', 'xml'];
        this.exportTemplates = new Map();
        
        // Initialize export templates
        this.initializeExportTemplates();
    }

    /**
     * Initialize export templates
     */
    initializeExportTemplates() {
        // Compliance report template
        this.exportTemplates.set('compliance', {
            sections: ['summary', 'audit-trail', 'security-alerts', 'recommendations'],
            format: 'pdf',
            styling: 'professional'
        });
        
        // Security report template
        this.exportTemplates.set('security', {
            sections: ['threats', 'alerts', 'incidents', 'recommendations'],
            format: 'pdf',
            styling: 'security'
        });
        
        // Data lineage template
        this.exportTemplates.set('lineage', {
            sections: ['data-flow', 'relationships', 'confidence', 'metadata'],
            format: 'json',
            styling: 'technical'
        });
    }

    /**
     * Export audit logs
     */
    async exportLogs(format, query, options = {}) {
        try {
            // Validate format
            if (!this.exportFormats.includes(format)) {
                throw new Error(`Unsupported export format: ${format}`);
            }
            
            // Get audit data
            const auditData = await this.getAuditData(query, options);
            
            // Generate export based on format
            let exportData;
            switch (format) {
                case 'pdf':
                    exportData = await this.generatePDFExport(auditData, options);
                    break;
                case 'csv':
                    exportData = await this.generateCSVExport(auditData, options);
                    break;
                case 'json':
                    exportData = await this.generateJSONExport(auditData, options);
                    break;
                case 'xml':
                    exportData = await this.generateXMLExport(auditData, options);
                    break;
                default:
                    throw new Error(`Export format not implemented: ${format}`);
            }
            
            return exportData;
            
        } catch (error) {
            console.error('Failed to export audit logs:', error);
            throw error;
        }
    }

    /**
     * Get audit data for export
     */
    async getAuditData(query, options) {
        try {
            // This would typically query the audit logs collection
            // For now, return mock data structure
            return {
                summary: {
                    totalEvents: 0,
                    timeRange: options.timeRange || '30d',
                    filters: query
                },
                events: [],
                statistics: {},
                alerts: []
            };
        } catch (error) {
            console.error('Failed to get audit data:', error);
            throw error;
        }
    }

    /**
     * Generate PDF export
     */
    async generatePDFExport(auditData, options) {
        try {
            // This would use a PDF generation library like jsPDF
            // For now, return a placeholder
            return {
                format: 'pdf',
                filename: `audit-report-${Date.now()}.pdf`,
                data: 'PDF data would be generated here',
                size: 0
            };
        } catch (error) {
            console.error('Failed to generate PDF export:', error);
            throw error;
        }
    }

    /**
     * Generate CSV export
     */
    async generateCSVExport(auditData, options) {
        try {
            // Generate CSV content
            const csvContent = this.convertToCSV(auditData.events);
            
            return {
                format: 'csv',
                filename: `audit-report-${Date.now()}.csv`,
                data: csvContent,
                size: new Blob([csvContent]).size
            };
        } catch (error) {
            console.error('Failed to generate CSV export:', error);
            throw error;
        }
    }

    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        if (!data || data.length === 0) {
            return 'No data available';
        }
        
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

    /**
     * Generate JSON export
     */
    async generateJSONExport(auditData, options) {
        try {
            const jsonContent = JSON.stringify(auditData, null, 2);
            
            return {
                format: 'json',
                filename: `audit-report-${Date.now()}.json`,
                data: jsonContent,
                size: new Blob([jsonContent]).size
            };
        } catch (error) {
            console.error('Failed to generate JSON export:', error);
            throw error;
        }
    }

    /**
     * Generate XML export
     */
    async generateXMLExport(auditData, options) {
        try {
            const xmlContent = this.convertToXML(auditData);
            
            return {
                format: 'xml',
                filename: `audit-report-${Date.now()}.xml`,
                data: xmlContent,
                size: new Blob([xmlContent]).size
            };
        } catch (error) {
            console.error('Failed to generate XML export:', error);
            throw error;
        }
    }

    /**
     * Convert data to XML format
     */
    convertToXML(data) {
        const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
        const rootElement = this.objectToXML(data, 'auditReport');
        return `${xmlHeader}\n${rootElement}`;
    }

    /**
     * Convert object to XML recursively
     */
    objectToXML(obj, rootName) {
        let xml = `<${rootName}>`;
        
        for (const [key, value] of Object.entries(obj)) {
            if (value === null || value === undefined) {
                continue;
            }
            
            if (typeof value === 'object' && !Array.isArray(value)) {
                xml += this.objectToXML(value, key);
            } else if (Array.isArray(value)) {
                for (const item of value) {
                    xml += this.objectToXML(item, key);
                }
            } else {
                xml += `<${key}>${this.escapeXML(value)}</${key}>`;
            }
        }
        
        xml += `</${rootName}>`;
        return xml;
    }

    /**
     * Escape XML special characters
     */
    escapeXML(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}

// Export for use in other modules
window.ComprehensiveAuditLogging = ComprehensiveAuditLogging;
window.AuditProcessor = AuditProcessor;
window.SecurityMonitor = SecurityMonitor;
window.DataLineageTracker = DataLineageTracker;
window.AuditExportManager = AuditExportManager;

// Initialize comprehensive audit logging system
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Firebase !== 'undefined') {
        window.comprehensiveAudit = new ComprehensiveAuditLogging();
        console.log('Comprehensive audit logging system initialized');
    }
});
