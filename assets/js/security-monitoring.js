/**
 * Security Monitoring System for Angkor Compliance Platform
 * Phase 0, Week 3 - Security & Monitoring Implementation
 */

class SecurityMonitoring {
    constructor() {
        this.securityEvents = [];
        this.threatIndicators = new Map();
        this.monitoringRules = new Map();
        this.alertThresholds = new Map();
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.securityMetrics = {
            failedLogins: 0,
            suspiciousActivities: 0,
            permissionViolations: 0,
            dataAccessAttempts: 0,
            systemChanges: 0
        };
        
        this.initializeSecurityMonitoring();
    }

    /**
     * Initialize security monitoring system
     */
    async initializeSecurityMonitoring() {
        try {
            await this.loadSecurityRules();
            await this.loadThreatIndicators();
            await this.setupAlertThresholds();
            await this.startMonitoring();
            
            console.log('Security monitoring system initialized');
        } catch (error) {
            console.error('Failed to initialize security monitoring:', error);
        }
    }

    /**
     * Load security monitoring rules from Firestore
     */
    async loadSecurityRules() {
        try {
            const rulesSnapshot = await Firebase.getDocs(
                Firebase.collection(Firebase.db, 'security-rules')
            );

            rulesSnapshot.forEach(doc => {
                const rule = doc.data();
                this.monitoringRules.set(rule.id, rule);
            });

            // Set default rules if none exist
            if (this.monitoringRules.size === 0) {
                this.setDefaultSecurityRules();
            }
        } catch (error) {
            console.error('Failed to load security rules:', error);
            this.setDefaultSecurityRules();
        }
    }

    /**
     * Set default security monitoring rules
     */
    setDefaultSecurityRules() {
        const defaultRules = [
            {
                id: 'failed-login-threshold',
                name: 'Failed Login Threshold',
                type: 'threshold',
                resource: 'authentication',
                action: 'login_failed',
                threshold: 5,
                timeWindow: 300000, // 5 minutes
                severity: 'high',
                action: 'block_account'
            },
            {
                id: 'suspicious-ip-access',
                name: 'Suspicious IP Access',
                type: 'pattern',
                resource: 'access',
                pattern: 'ip_blacklist',
                severity: 'critical',
                action: 'block_ip'
            },
            {
                id: 'permission-escalation',
                name: 'Permission Escalation Attempt',
                type: 'behavior',
                resource: 'permissions',
                pattern: 'role_change',
                severity: 'high',
                action: 'alert_admin'
            },
            {
                id: 'data-export-threshold',
                name: 'Data Export Threshold',
                type: 'threshold',
                resource: 'data_export',
                action: 'export',
                threshold: 10,
                timeWindow: 3600000, // 1 hour
                severity: 'medium',
                action: 'require_approval'
            },
            {
                id: 'unusual-access-time',
                name: 'Unusual Access Time',
                type: 'time',
                resource: 'access',
                timeRange: { start: '22:00', end: '06:00' },
                severity: 'medium',
                action: 'log_suspicious'
            }
        ];

        defaultRules.forEach(rule => {
            this.monitoringRules.set(rule.id, rule);
        });
    }

    /**
     * Load threat indicators from Firestore
     */
    async loadThreatIndicators() {
        try {
            const indicatorsSnapshot = await Firebase.getDocs(
                Firebase.collection(Firebase.db, 'threat-indicators')
            );

            indicatorsSnapshot.forEach(doc => {
                const indicator = doc.data();
                this.threatIndicators.set(indicator.id, indicator);
            });

            // Set default threat indicators
            if (this.threatIndicators.size === 0) {
                this.setDefaultThreatIndicators();
            }
        } catch (error) {
            console.error('Failed to load threat indicators:', error);
            this.setDefaultThreatIndicators();
        }
    }

    /**
     * Set default threat indicators
     */
    setDefaultThreatIndicators() {
        const defaultIndicators = [
            {
                id: 'multiple-failed-logins',
                name: 'Multiple Failed Login Attempts',
                pattern: 'login_failure_sequence',
                threshold: 3,
                timeWindow: 300000,
                severity: 'medium'
            },
            {
                id: 'unusual-data-access',
                name: 'Unusual Data Access Patterns',
                pattern: 'data_access_anomaly',
                threshold: 5,
                timeWindow: 600000,
                severity: 'high'
            },
            {
                id: 'permission-violation',
                name: 'Permission Violation Attempts',
                pattern: 'permission_denied',
                threshold: 2,
                timeWindow: 1800000,
                severity: 'high'
            },
            {
                id: 'system-config-changes',
                name: 'System Configuration Changes',
                pattern: 'config_modification',
                threshold: 1,
                timeWindow: 86400000,
                severity: 'critical'
            }
        ];

        defaultIndicators.forEach(indicator => {
            this.threatIndicators.set(indicator.id, indicator);
        });
    }

    /**
     * Setup alert thresholds
     */
    async setupAlertThresholds() {
        this.alertThresholds.set('failed_logins', { warning: 3, critical: 10 });
        this.alertThresholds.set('suspicious_activities', { warning: 5, critical: 15 });
        this.alertThresholds.set('permission_violations', { warning: 2, critical: 5 });
        this.alertThresholds.set('data_access_attempts', { warning: 20, critical: 50 });
        this.alertThresholds.set('system_changes', { warning: 1, critical: 3 });
    }

    /**
     * Start security monitoring
     */
    async startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.performSecurityCheck();
        }, 30000); // Check every 30 seconds

        console.log('Security monitoring started');
    }

    /**
     * Stop security monitoring
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isMonitoring = false;
        console.log('Security monitoring stopped');
    }

    /**
     * Perform security check
     */
    async performSecurityCheck() {
        try {
            await this.checkFailedLogins();
            await this.checkSuspiciousActivities();
            await this.checkPermissionViolations();
            await this.checkDataAccessPatterns();
            await this.checkSystemChanges();
            
            // Update security metrics
            await this.updateSecurityMetrics();
            
        } catch (error) {
            console.error('Security check failed:', error);
        }
    }

    /**
     * Check for failed login attempts
     */
    async checkFailedLogins() {
        try {
            const recentFailures = await this.getRecentFailedLogins();
            
            if (recentFailures.length >= this.alertThresholds.get('failed_logins').critical) {
                await this.triggerSecurityAlert('critical', 'Multiple failed login attempts detected', {
                    type: 'failed_logins',
                    count: recentFailures.length,
                    timeWindow: '5 minutes'
                });
            } else if (recentFailures.length >= this.alertThresholds.get('failed_logins').warning) {
                await this.triggerSecurityAlert('warning', 'Unusual number of failed login attempts', {
                    type: 'failed_logins',
                    count: recentFailures.length,
                    timeWindow: '5 minutes'
                });
            }
        } catch (error) {
            console.error('Failed to check failed logins:', error);
        }
    }

    /**
     * Get recent failed login attempts
     */
    async getRecentFailedLogins() {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 300000);
            
            const failuresSnapshot = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'security-events'),
                    Firebase.where('type', '==', 'login_failed'),
                    Firebase.where('timestamp', '>=', fiveMinutesAgo)
                )
            );

            return failuresSnapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Failed to get recent failed logins:', error);
            return [];
        }
    }

    /**
     * Check for suspicious activities
     */
    async checkSuspiciousActivities() {
        try {
            const recentActivities = await this.getRecentSuspiciousActivities();
            
            if (recentActivities.length >= this.alertThresholds.get('suspicious_activities').critical) {
                await this.triggerSecurityAlert('critical', 'High volume of suspicious activities detected', {
                    type: 'suspicious_activities',
                    count: recentActivities.length,
                    timeWindow: '10 minutes'
                });
            }
        } catch (error) {
            console.error('Failed to check suspicious activities:', error);
        }
    }

    /**
     * Get recent suspicious activities
     */
    async getRecentSuspiciousActivities() {
        try {
            const tenMinutesAgo = new Date(Date.now() - 600000);
            
            const activitiesSnapshot = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'security-events'),
                    Firebase.where('severity', 'in', ['suspicious', 'high', 'critical']),
                    Firebase.where('timestamp', '>=', tenMinutesAgo)
                )
            );

            return activitiesSnapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Failed to get recent suspicious activities:', error);
            return [];
        }
    }

    /**
     * Check for permission violations
     */
    async checkPermissionViolations() {
        try {
            const recentViolations = await this.getRecentPermissionViolations();
            
            if (recentViolations.length >= this.alertThresholds.get('permission_violations').critical) {
                await this.triggerSecurityAlert('critical', 'Multiple permission violations detected', {
                    type: 'permission_violations',
                    count: recentViolations.length,
                    timeWindow: '30 minutes'
                });
            }
        } catch (error) {
            console.error('Failed to check permission violations:', error);
        }
    }

    /**
     * Get recent permission violations
     */
    async getRecentPermissionViolations() {
        try {
            const thirtyMinutesAgo = new Date(Date.now() - 1800000);
            
            const violationsSnapshot = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'security-events'),
                    Firebase.where('type', '==', 'permission_denied'),
                    Firebase.where('timestamp', '>=', thirtyMinutesAgo)
                )
            );

            return violationsSnapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Failed to get recent permission violations:', error);
            return [];
        }
    }

    /**
     * Check data access patterns
     */
    async checkDataAccessPatterns() {
        try {
            const recentAccess = await this.getRecentDataAccess();
            
            if (recentAccess.length >= this.alertThresholds.get('data_access_attempts').critical) {
                await this.triggerSecurityAlert('critical', 'Unusual data access pattern detected', {
                    type: 'data_access_pattern',
                    count: recentAccess.length,
                    timeWindow: '1 hour'
                });
            }
        } catch (error) {
            console.error('Failed to check data access patterns:', error);
        }
    }

    /**
     * Get recent data access attempts
     */
    async getRecentDataAccess() {
        try {
            const oneHourAgo = new Date(Date.now() - 3600000);
            
            const accessSnapshot = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'security-events'),
                    Firebase.where('type', '==', 'data_access'),
                    Firebase.where('timestamp', '>=', oneHourAgo)
                )
            );

            return accessSnapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Failed to get recent data access:', error);
            return [];
        }
    }

    /**
     * Check system changes
     */
    async checkSystemChanges() {
        try {
            const recentChanges = await this.getRecentSystemChanges();
            
            if (recentChanges.length >= this.alertThresholds.get('system_changes').critical) {
                await this.triggerSecurityAlert('critical', 'Multiple system configuration changes detected', {
                    type: 'system_changes',
                    count: recentChanges.length,
                    timeWindow: '24 hours'
                });
            }
        } catch (error) {
            console.error('Failed to check system changes:', error);
        }
    }

    /**
     * Get recent system changes
     */
    async getRecentSystemChanges() {
        try {
            const oneDayAgo = new Date(Date.now() - 86400000);
            
            const changesSnapshot = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'security-events'),
                    Firebase.where('type', '==', 'system_change'),
                    Firebase.where('timestamp', '>=', oneDayAgo)
                )
            );

            return changesSnapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Failed to get recent system changes:', error);
            return [];
        }
    }

    /**
     * Trigger security alert
     */
    async triggerSecurityAlert(severity, message, metadata) {
        try {
            const alert = {
                id: this.generateAlertId(),
                timestamp: Firebase.serverTimestamp(),
                severity,
                message,
                metadata,
                status: 'active',
                acknowledged: false,
                acknowledgedBy: null,
                acknowledgedAt: null
            };

            // Save alert to Firestore
            await Firebase.addDoc(
                Firebase.collection(Firebase.db, 'security-alerts'),
                alert
            );

            // Log security event
            await this.logSecurityEvent('security_alert', {
                alertId: alert.id,
                severity,
                message,
                metadata
            });

            // Send notification if critical
            if (severity === 'critical') {
                await this.sendCriticalAlertNotification(alert);
            }

            console.log(`Security alert triggered: ${severity} - ${message}`);
        } catch (error) {
            console.error('Failed to trigger security alert:', error);
        }
    }

    /**
     * Send critical alert notification
     */
    async sendCriticalAlertNotification(alert) {
        try {
            // Get admin users
            const adminUsers = await this.getAdminUsers();
            
            // Send email/SMS notifications (implement based on your notification system)
            for (const admin of adminUsers) {
                await this.sendNotification(admin, 'critical_alert', alert);
            }
        } catch (error) {
            console.error('Failed to send critical alert notification:', error);
        }
    }

    /**
     * Get admin users
     */
    async getAdminUsers() {
        try {
            const adminSnapshot = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'users'),
                    Firebase.where('role', 'in', ['super_admin', 'factory_admin'])
                )
            );

            return adminSnapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Failed to get admin users:', error);
            return [];
        }
    }

    /**
     * Send notification to user
     */
    async sendNotification(user, type, data) {
        try {
            const notification = {
                userId: user.uid,
                type,
                data,
                timestamp: Firebase.serverTimestamp(),
                read: false
            };

            await Firebase.addDoc(
                Firebase.collection(Firebase.db, 'notifications'),
                notification
            );
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    }

    /**
     * Log security event
     */
    async logSecurityEvent(type, metadata) {
        try {
            const event = {
                timestamp: Firebase.serverTimestamp(),
                type,
                metadata,
                userId: Firebase.auth.currentUser?.uid || 'system',
                ipAddress: await this.getClientIP(),
                userAgent: navigator.userAgent,
                sessionId: this.getSessionId()
            };

            await Firebase.addDoc(
                Firebase.collection(Firebase.db, 'security-events'),
                event
            );

            // Update local metrics
            this.updateLocalMetrics(type);
        } catch (error) {
            console.error('Failed to log security event:', error);
        }
    }

    /**
     * Update local security metrics
     */
    updateLocalMetrics(type) {
        switch (type) {
            case 'login_failed':
                this.securityMetrics.failedLogins++;
                break;
            case 'suspicious_activity':
                this.securityMetrics.suspiciousActivities++;
                break;
            case 'permission_denied':
                this.securityMetrics.permissionViolations++;
                break;
            case 'data_access':
                this.securityMetrics.dataAccessAttempts++;
                break;
            case 'system_change':
                this.securityMetrics.systemChanges++;
                break;
        }
    }

    /**
     * Update security metrics in Firestore
     */
    async updateSecurityMetrics() {
        try {
            const metricsDoc = Firebase.doc(Firebase.db, 'system-metrics', 'security');
            
            await Firebase.updateDoc(metricsDoc, {
                lastUpdated: Firebase.serverTimestamp(),
                metrics: this.securityMetrics
            });
        } catch (error) {
            console.error('Failed to update security metrics:', error);
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
     * Get session ID
     */
    getSessionId() {
        return sessionStorage.getItem('sessionId') || 'unknown';
    }

    /**
     * Generate alert ID
     */
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get security dashboard data
     */
    async getSecurityDashboardData() {
        try {
            const [
                recentAlerts,
                securityMetrics,
                threatIndicators,
                recentEvents
            ] = await Promise.all([
                this.getRecentSecurityAlerts(),
                this.getSecurityMetrics(),
                this.getThreatIndicators(),
                this.getRecentSecurityEvents()
            ]);

            return {
                recentAlerts,
                securityMetrics,
                threatIndicators,
                recentEvents,
                monitoringStatus: this.isMonitoring
            };
        } catch (error) {
            console.error('Failed to get security dashboard data:', error);
            return null;
        }
    }

    /**
     * Get recent security alerts
     */
    async getRecentSecurityAlerts() {
        try {
            const alertsSnapshot = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'security-alerts'),
                    Firebase.orderBy('timestamp', 'desc'),
                    Firebase.limit(10)
                )
            );

            return alertsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Failed to get recent security alerts:', error);
            return [];
        }
    }

    /**
     * Get security metrics
     */
    async getSecurityMetrics() {
        try {
            const metricsDoc = await Firebase.getDoc(
                Firebase.doc(Firebase.db, 'system-metrics', 'security')
            );

            return metricsDoc.exists() ? metricsDoc.data() : this.securityMetrics;
        } catch (error) {
            console.error('Failed to get security metrics:', error);
            return this.securityMetrics;
        }
    }

    /**
     * Get threat indicators
     */
    async getThreatIndicators() {
        return Array.from(this.threatIndicators.values());
    }

    /**
     * Get recent security events
     */
    async getRecentSecurityEvents() {
        try {
            const eventsSnapshot = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'security-events'),
                    Firebase.orderBy('timestamp', 'desc'),
                    Firebase.limit(20)
                )
            );

            return eventsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Failed to get recent security events:', error);
            return [];
        }
    }

    /**
     * Acknowledge security alert
     */
    async acknowledgeAlert(alertId, userId) {
        try {
            const alertRef = Firebase.doc(Firebase.db, 'security-alerts', alertId);
            
            await Firebase.updateDoc(alertRef, {
                acknowledged: true,
                acknowledgedBy: userId,
                acknowledgedAt: Firebase.serverTimestamp(),
                status: 'acknowledged'
            });

            console.log(`Alert ${alertId} acknowledged by ${userId}`);
        } catch (error) {
            console.error('Failed to acknowledge alert:', error);
        }
    }

    /**
     * Get security report
     */
    async getSecurityReport(startDate, endDate) {
        try {
            const eventsSnapshot = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'security-events'),
                    Firebase.where('timestamp', '>=', startDate),
                    Firebase.where('timestamp', '<=', endDate),
                    Firebase.orderBy('timestamp', 'desc')
                )
            );

            const events = eventsSnapshot.docs.map(doc => doc.data());
            
            return this.generateSecurityReport(events, startDate, endDate);
        } catch (error) {
            console.error('Failed to get security report:', error);
            return null;
        }
    }

    /**
     * Generate security report
     */
    generateSecurityReport(events, startDate, endDate) {
        const report = {
            period: { start: startDate, end: endDate },
            summary: {
                totalEvents: events.length,
                criticalEvents: events.filter(e => e.severity === 'critical').length,
                highEvents: events.filter(e => e.severity === 'high').length,
                mediumEvents: events.filter(e => e.severity === 'medium').length,
                lowEvents: events.filter(e => e.severity === 'low').length
            },
            eventsByType: {},
            eventsBySeverity: {},
            recommendations: []
        };

        // Group events by type
        events.forEach(event => {
            if (!report.eventsByType[event.type]) {
                report.eventsByType[event.type] = [];
            }
            report.eventsByType[event.type].push(event);
        });

        // Group events by severity
        events.forEach(event => {
            if (!report.eventsBySeverity[event.severity]) {
                report.eventsBySeverity[event.severity] = [];
            }
            report.eventsBySeverity[event.severity].push(event);
        });

        // Generate recommendations
        if (report.summary.criticalEvents > 0) {
            report.recommendations.push('Immediate attention required for critical security events');
        }
        if (report.summary.failedLogins > 10) {
            report.recommendations.push('Review authentication policies and consider implementing additional security measures');
        }
        if (report.summary.permissionViolations > 5) {
            report.recommendations.push('Review user permissions and access controls');
        }

        return report;
    }
}

// Export for use in other modules
window.SecurityMonitoring = SecurityMonitoring;

// Initialize security monitoring
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Firebase !== 'undefined') {
        window.securityMonitoring = new SecurityMonitoring();
        console.log('Security monitoring system initialized');
    }
});
