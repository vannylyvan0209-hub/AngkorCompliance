/**
 * Audit Log System
 * Implements immutable audit logging with evidence hash stamps
 * As specified in Enterprise Blueprint v2 Section F
 */

class AuditLogSystem {
    constructor() {
        this.db = window.Firebase?.db;
        this.isImmutable = true;
        this.hashAlgorithm = 'SHA-256';
        this.batchSize = 100;
        this.pendingLogs = [];
    }

    /**
     * Log an action with full context
     */
    async logAction(action, user, context, options = {}) {
        try {
            const logEntry = await this.createLogEntry(action, user, context, options);
            
            // Add to pending logs for batch processing
            this.pendingLogs.push(logEntry);
            
            // Process batch if full
            if (this.pendingLogs.length >= this.batchSize) {
                await this.processBatch();
            }

            return logEntry;
        } catch (error) {
            console.error('❌ Failed to log action:', error);
            throw error;
        }
    }

    /**
     * Create a log entry
     */
    async createLogEntry(action, user, context, options) {
        const timestamp = new Date();
        const sessionId = this.getSessionId();
        const evidenceHash = await this.generateHash(context);
        
        const logEntry = {
            id: this.generateLogId(),
            timestamp: timestamp,
            action: action,
            userId: user?.id || 'anonymous',
            userRole: user?.role || 'unknown',
            userEmail: user?.email || null,
            factoryId: user?.factoryId || context?.factoryId || null,
            organizationId: user?.organizationId || context?.organizationId || null,
            context: this.sanitizeContext(context),
            evidenceHash: evidenceHash,
            sessionId: sessionId,
            ipAddress: options.ipAddress || null,
            userAgent: options.userAgent || null,
            source: options.source || 'web',
            severity: this.calculateSeverity(action, context),
            category: this.categorizeAction(action),
            immutable: true,
            version: '1.0',
            metadata: {
                requestId: options.requestId || null,
                correlationId: options.correlationId || null,
                traceId: options.traceId || null
            }
        };

        return logEntry;
    }

    /**
     * Process batch of pending logs
     */
    async processBatch() {
        if (this.pendingLogs.length === 0) return;

        try {
            const batch = this.db.batch();
            
            for (const logEntry of this.pendingLogs) {
                const docRef = this.db.collection('audit_logs').doc(logEntry.id);
                batch.set(docRef, logEntry);
            }

            await batch.commit();
            console.log(`✅ Processed ${this.pendingLogs.length} audit logs`);
            
            // Clear pending logs
            this.pendingLogs = [];
        } catch (error) {
            console.error('❌ Failed to process audit log batch:', error);
            throw error;
        }
    }

    /**
     * Generate hash for evidence
     */
    async generateHash(data) {
        try {
            const text = JSON.stringify(data, this.getCircularReplacer());
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(text);
            const hashBuffer = await crypto.subtle.digest(this.hashAlgorithm, dataBuffer);
            
            return Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        } catch (error) {
            console.warn('⚠️ Hash generation failed, using fallback:', error);
            return this.fallbackHash(data);
        }
    }

    /**
     * Sanitize context to remove sensitive data
     */
    sanitizeContext(context) {
        if (!context) return {};

        const sanitized = { ...context };
        
        // Remove sensitive fields
        const sensitiveFields = [
            'password', 'token', 'secret', 'key', 'credential',
            'ssn', 'passport', 'idNumber', 'phone', 'address'
        ];

        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        }

        // Sanitize nested objects
        for (const [key, value] of Object.entries(sanitized)) {
            if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeContext(value);
            }
        }

        return sanitized;
    }

    /**
     * Calculate severity level
     */
    calculateSeverity(action, context) {
        const criticalActions = [
            'user_login', 'user_logout', 'password_change', 'permission_grant',
            'permission_revoke', 'data_export', 'system_config_change'
        ];

        const highSeverityActions = [
            'document_upload', 'document_delete', 'case_create', 'case_update',
            'audit_create', 'audit_update', 'grievance_submit'
        ];

        const mediumSeverityActions = [
            'document_view', 'case_view', 'report_generate', 'data_query'
        ];

        if (criticalActions.includes(action)) {
            return 'critical';
        } else if (highSeverityActions.includes(action)) {
            return 'high';
        } else if (mediumSeverityActions.includes(action)) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Categorize action
     */
    categorizeAction(action) {
        const categories = {
            'authentication': ['user_login', 'user_logout', 'password_change', 'mfa_setup'],
            'authorization': ['permission_grant', 'permission_revoke', 'role_assignment'],
            'data_access': ['document_view', 'document_upload', 'document_delete', 'data_query'],
            'case_management': ['case_create', 'case_update', 'case_delete', 'grievance_submit'],
            'audit_management': ['audit_create', 'audit_update', 'audit_delete'],
            'system_admin': ['system_config_change', 'user_management', 'backup_create'],
            'reporting': ['report_generate', 'data_export', 'analytics_access']
        };

        for (const [category, actions] of Object.entries(categories)) {
            if (actions.includes(action)) {
                return category;
            }
        }

        return 'other';
    }

    /**
     * Get audit logs with filtering
     */
    async getAuditLogs(filters = {}, options = {}) {
        try {
            let query = this.db.collection('audit_logs');

            // Apply filters
            if (filters.userId) {
                query = query.where('userId', '==', filters.userId);
            }
            if (filters.factoryId) {
                query = query.where('factoryId', '==', filters.factoryId);
            }
            if (filters.organizationId) {
                query = query.where('organizationId', '==', filters.organizationId);
            }
            if (filters.action) {
                query = query.where('action', '==', filters.action);
            }
            if (filters.category) {
                query = query.where('category', '==', filters.category);
            }
            if (filters.severity) {
                query = query.where('severity', '==', filters.severity);
            }
            if (filters.startDate) {
                query = query.where('timestamp', '>=', filters.startDate);
            }
            if (filters.endDate) {
                query = query.where('timestamp', '<=', filters.endDate);
            }

            // Apply ordering
            query = query.orderBy('timestamp', 'desc');

            // Apply pagination
            if (options.limit) {
                query = query.limit(options.limit);
            }
            if (options.offset) {
                query = query.offset(options.offset);
            }

            const snapshot = await query.get();
            const logs = [];

            snapshot.forEach(doc => {
                logs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return {
                logs: logs,
                total: logs.length,
                hasMore: logs.length === (options.limit || 50)
            };

        } catch (error) {
            console.error('❌ Failed to get audit logs:', error);
            throw error;
        }
    }

    /**
     * Export audit logs
     */
    async exportAuditLogs(filters = {}, format = 'json') {
        try {
            const result = await this.getAuditLogs(filters, { limit: 1000 });
            
            switch (format.toLowerCase()) {
                case 'json':
                    return this.exportAsJSON(result.logs);
                case 'csv':
                    return this.exportAsCSV(result.logs);
                case 'pdf':
                    return this.exportAsPDF(result.logs);
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (error) {
            console.error('❌ Failed to export audit logs:', error);
            throw error;
        }
    }

    /**
     * Export as JSON
     */
    exportAsJSON(logs) {
        const exportData = {
            exportDate: new Date().toISOString(),
            totalRecords: logs.length,
            logs: logs
        };

        return {
            data: JSON.stringify(exportData, null, 2),
            filename: `audit_logs_${new Date().toISOString().split('T')[0]}.json`,
            contentType: 'application/json'
        };
    }

    /**
     * Export as CSV
     */
    exportAsCSV(logs) {
        const headers = [
            'ID', 'Timestamp', 'Action', 'User ID', 'User Role', 'Factory ID',
            'Organization ID', 'Severity', 'Category', 'Session ID', 'Source'
        ];

        const csvRows = [headers.join(',')];

        for (const log of logs) {
            const row = [
                log.id,
                log.timestamp.toDate().toISOString(),
                log.action,
                log.userId,
                log.userRole,
                log.factoryId || '',
                log.organizationId || '',
                log.severity,
                log.category,
                log.sessionId,
                log.source
            ].map(field => `"${field}"`).join(',');
            
            csvRows.push(row);
        }

        return {
            data: csvRows.join('\n'),
            filename: `audit_logs_${new Date().toISOString().split('T')[0]}.csv`,
            contentType: 'text/csv'
        };
    }

    /**
     * Export as PDF
     */
    exportAsPDF(logs) {
        // This would integrate with a PDF generation library
        // For now, return a placeholder
        return {
            data: 'PDF generation not implemented',
            filename: `audit_logs_${new Date().toISOString().split('T')[0]}.pdf`,
            contentType: 'application/pdf'
        };
    }

    /**
     * Get audit statistics
     */
    async getAuditStats(filters = {}) {
        try {
            const logs = await this.getAuditLogs(filters, { limit: 1000 });
            
            const stats = {
                totalActions: logs.logs.length,
                actionsByCategory: {},
                actionsBySeverity: {},
                actionsByUser: {},
                actionsByHour: {},
                recentActivity: []
            };

            for (const log of logs.logs) {
                // Category stats
                if (!stats.actionsByCategory[log.category]) {
                    stats.actionsByCategory[log.category] = 0;
                }
                stats.actionsByCategory[log.category]++;

                // Severity stats
                if (!stats.actionsBySeverity[log.severity]) {
                    stats.actionsBySeverity[log.severity] = 0;
                }
                stats.actionsBySeverity[log.severity]++;

                // User stats
                if (!stats.actionsByUser[log.userId]) {
                    stats.actionsByUser[log.userId] = 0;
                }
                stats.actionsByUser[log.userId]++;

                // Hourly stats
                const hour = log.timestamp.toDate().getHours();
                if (!stats.actionsByHour[hour]) {
                    stats.actionsByHour[hour] = 0;
                }
                stats.actionsByHour[hour]++;

                // Recent activity (last 10)
                if (stats.recentActivity.length < 10) {
                    stats.recentActivity.push({
                        timestamp: log.timestamp,
                        action: log.action,
                        userId: log.userId,
                        severity: log.severity
                    });
                }
            }

            return stats;
        } catch (error) {
            console.error('❌ Failed to get audit stats:', error);
            throw error;
        }
    }

    /**
     * Verify log integrity
     */
    async verifyLogIntegrity(logId) {
        try {
            const logDoc = await this.db.collection('audit_logs').doc(logId).get();
            
            if (!logDoc.exists) {
                throw new Error('Log entry not found');
            }

            const logData = logDoc.data();
            const currentHash = await this.generateHash(logData.context);
            
            return {
                logId: logId,
                originalHash: logData.evidenceHash,
                currentHash: currentHash,
                integrity: currentHash === logData.evidenceHash,
                timestamp: logData.timestamp
            };
        } catch (error) {
            console.error('❌ Failed to verify log integrity:', error);
            throw error;
        }
    }

    /**
     * Search audit logs
     */
    async searchAuditLogs(searchTerm, filters = {}) {
        try {
            // Get all logs and filter client-side for now
            // In production, use Firestore full-text search or Algolia
            const result = await this.getAuditLogs(filters, { limit: 1000 });
            
            const searchResults = result.logs.filter(log => {
                const searchableText = [
                    log.action,
                    log.userId,
                    log.userRole,
                    log.category,
                    log.severity,
                    JSON.stringify(log.context)
                ].join(' ').toLowerCase();

                return searchableText.includes(searchTerm.toLowerCase());
            });

            return {
                logs: searchResults,
                total: searchResults.length,
                searchTerm: searchTerm
            };
        } catch (error) {
            console.error('❌ Failed to search audit logs:', error);
            throw error;
        }
    }

    // Utility methods
    generateLogId() {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getSessionId() {
        return sessionStorage.getItem('sessionId') || 
               localStorage.getItem('sessionId') || 
               `session_${Date.now()}`;
    }

    getCircularReplacer() {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                seen.add(value);
            }
            return value;
        };
    }

    fallbackHash(data) {
        // Simple hash fallback
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Flush pending logs
     */
    async flush() {
        if (this.pendingLogs.length > 0) {
            await this.processBatch();
        }
    }

    /**
     * Get system status
     */
    getStatus() {
        return {
            isImmutable: this.isImmutable,
            hashAlgorithm: this.hashAlgorithm,
            pendingLogs: this.pendingLogs.length,
            batchSize: this.batchSize
        };
    }
}

// Export for global use
window.AuditLogSystem = AuditLogSystem;

