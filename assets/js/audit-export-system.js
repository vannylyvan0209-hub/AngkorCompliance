/**
 * Audit Export System for Angkor Compliance Platform
 * Phase 0, Week 3 - Audit Export Functionality Implementation
 */

class AuditExportSystem {
    constructor() {
        this.exportFormats = ['pdf', 'csv', 'xlsx', 'json'];
        this.exportTemplates = new Map();
        this.exportHistory = [];
        this.isExporting = false;
        
        this.initializeExportSystem();
    }

    /**
     * Initialize audit export system
     */
    async initializeExportSystem() {
        try {
            await this.loadExportTemplates();
            await this.setupExportFormats();
            
            console.log('Audit export system initialized');
        } catch (error) {
            console.error('Failed to initialize audit export system:', error);
        }
    }

    /**
     * Load export templates from Firestore
     */
    async loadExportTemplates() {
        try {
            const templatesSnapshot = await Firebase.getDocs(
                Firebase.collection(Firebase.db, 'export-templates')
            );

            templatesSnapshot.forEach(doc => {
                const template = doc.data();
                this.exportTemplates.set(template.id, template);
            });

            // Set default templates if none exist
            if (this.exportTemplates.size === 0) {
                this.setDefaultExportTemplates();
            }
        } catch (error) {
            console.error('Failed to load export templates:', error);
            this.setDefaultExportTemplates();
        }
    }

    /**
     * Set default export templates
     */
    setDefaultExportTemplates() {
        const defaultTemplates = [
            {
                id: 'compliance-audit-report',
                name: 'Compliance Audit Report',
                description: 'Standard compliance audit report for regulatory bodies',
                type: 'audit',
                format: 'pdf',
                sections: ['header', 'summary', 'findings', 'recommendations', 'evidence', 'signatures'],
                styling: 'professional',
                requiredFields: ['auditId', 'auditor', 'date', 'findings', 'status']
            },
            {
                id: 'security-incident-report',
                name: 'Security Incident Report',
                description: 'Detailed security incident report for stakeholders',
                type: 'security',
                format: 'pdf',
                sections: ['incident_summary', 'timeline', 'impact_assessment', 'response_actions', 'lessons_learned'],
                styling: 'formal',
                requiredFields: ['incidentId', 'severity', 'date', 'description', 'actions']
            },
            {
                id: 'data-export-template',
                name: 'Data Export Template',
                description: 'Structured data export for analysis and reporting',
                type: 'data',
                format: 'xlsx',
                sections: ['metadata', 'data_summary', 'detailed_records'],
                styling: 'data_focused',
                requiredFields: ['exportId', 'date', 'dataType', 'recordCount']
            },
            {
                id: 'executive-summary',
                name: 'Executive Summary',
                description: 'High-level summary for executive stakeholders',
                type: 'summary',
                format: 'pdf',
                sections: ['overview', 'key_metrics', 'risks', 'recommendations'],
                styling: 'executive',
                requiredFields: ['period', 'summary', 'metrics', 'actions']
            }
        ];

        defaultTemplates.forEach(template => {
            this.exportTemplates.set(template.id, template);
        });
    }

    /**
     * Setup export formats and libraries
     */
    async setupExportFormats() {
        // Load required libraries for different export formats
        await this.loadExportLibraries();
    }

    /**
     * Load export libraries dynamically
     */
    async loadExportLibraries() {
        // Load jsPDF for PDF generation
        if (!window.jsPDF) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }

        // Load SheetJS for Excel generation
        if (!window.XLSX) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        }

        // Load html2canvas for HTML to image conversion
        if (!window.html2canvas) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
    }

    /**
     * Load script dynamically
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Export audit data with specified parameters
     */
    async exportAuditData(exportParams) {
        try {
            if (this.isExporting) {
                throw new Error('Export already in progress');
            }

            this.isExporting = true;
            
            // Validate export parameters
            this.validateExportParams(exportParams);
            
            // Get audit data based on parameters
            const auditData = await this.getAuditData(exportParams);
            
            // Generate export based on format
            const exportResult = await this.generateExport(auditData, exportParams);
            
            // Log export activity
            await this.logExportActivity(exportParams, exportResult);
            
            // Add to export history
            this.exportHistory.push({
                id: exportResult.exportId,
                timestamp: new Date(),
                params: exportParams,
                result: exportResult
            });
            
            this.isExporting = false;
            return exportResult;
            
        } catch (error) {
            this.isExporting = false;
            console.error('Export failed:', error);
            throw error;
        }
    }

    /**
     * Validate export parameters
     */
    validateExportParams(params) {
        const required = ['format', 'dataType', 'dateRange'];
        const validFormats = ['pdf', 'csv', 'xlsx', 'json'];
        
        for (const field of required) {
            if (!params[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        if (!validFormats.includes(params.format)) {
            throw new Error(`Invalid format: ${params.format}`);
        }
        
        if (params.dateRange && (!params.dateRange.start || !params.dateRange.end)) {
            throw new Error('Invalid date range');
        }
    }

    /**
     * Get audit data based on export parameters
     */
    async getAuditData(params) {
        try {
            const { dataType, dateRange, filters = {} } = params;
            
            let collectionName;
            let queryConstraints = [];
            
            // Determine collection and build query
            switch (dataType) {
                case 'audit_logs':
                    collectionName = 'audit-logs';
                    break;
                case 'security_events':
                    collectionName = 'security-events';
                    break;
                case 'user_activities':
                    collectionName = 'user-activities';
                    break;
                case 'permission_changes':
                    collectionName = 'permission-changes';
                    break;
                case 'system_changes':
                    collectionName = 'system-changes';
                    break;
                default:
                    collectionName = 'audit-logs';
            }
            
            // Add date range filter
            if (dateRange && dateRange.start && dateRange.end) {
                queryConstraints.push(
                    Firebase.where('timestamp', '>=', dateRange.start),
                    Firebase.where('timestamp', '<=', dateRange.end)
                );
            }
            
            // Add additional filters
            if (filters.userId) {
                queryConstraints.push(Firebase.where('userId', '==', filters.userId));
            }
            
            if (filters.severity) {
                queryConstraints.push(Firebase.where('severity', '==', filters.severity));
            }
            
            if (filters.action) {
                queryConstraints.push(Firebase.where('action', '==', filters.action));
            }
            
            // Add ordering
            queryConstraints.push(Firebase.orderBy('timestamp', 'desc'));
            
            // Execute query
            const query = Firebase.query(
                Firebase.collection(Firebase.db, collectionName),
                ...queryConstraints
            );
            
            const snapshot = await Firebase.getDocs(query);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            return {
                collection: collectionName,
                data: data,
                metadata: {
                    exportDate: new Date(),
                    recordCount: data.length,
                    filters: filters,
                    dateRange: dateRange
                }
            };
            
        } catch (error) {
            console.error('Failed to get audit data:', error);
            throw error;
        }
    }

    /**
     * Generate export based on format
     */
    async generateExport(auditData, params) {
        const { format, templateId } = params;
        const template = templateId ? this.exportTemplates.get(templateId) : null;
        
        switch (format) {
            case 'pdf':
                return await this.generatePDFExport(auditData, template);
            case 'csv':
                return await this.generateCSVExport(auditData);
            case 'xlsx':
                return await this.generateExcelExport(auditData, template);
            case 'json':
                return await this.generateJSONExport(auditData);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    /**
     * Generate PDF export
     */
    async generatePDFExport(auditData, template) {
        try {
            if (!window.jsPDF) {
                throw new Error('jsPDF library not loaded');
            }
            
            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF();
            
            // Add header
            doc.setFontSize(20);
            doc.text('Audit Report', 105, 20, { align: 'center' });
            
            // Add metadata
            doc.setFontSize(12);
            doc.text(`Export Date: ${auditData.metadata.exportDate.toLocaleDateString()}`, 20, 40);
            doc.text(`Record Count: ${auditData.metadata.recordCount}`, 20, 50);
            doc.text(`Collection: ${auditData.collection}`, 20, 60);
            
            // Add data summary
            let yPosition = 80;
            doc.setFontSize(14);
            doc.text('Data Summary', 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(10);
            auditData.data.slice(0, 20).forEach((record, index) => {
                const text = `${index + 1}. ${record.action || record.type} - ${record.timestamp?.toDate?.()?.toLocaleString() || 'N/A'}`;
                if (yPosition < 280) {
                    doc.text(text, 20, yPosition);
                    yPosition += 7;
                }
            });
            
            if (auditData.data.length > 20) {
                doc.text(`... and ${auditData.data.length - 20} more records`, 20, yPosition);
            }
            
            // Generate filename
            const filename = `audit_report_${Date.now()}.pdf`;
            
            // Save PDF
            doc.save(filename);
            
            return {
                exportId: this.generateExportId(),
                format: 'pdf',
                filename: filename,
                size: 'generated',
                url: null,
                timestamp: new Date()
            };
            
        } catch (error) {
            console.error('PDF generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate CSV export
     */
    async generateCSVExport(auditData) {
        try {
            if (auditData.data.length === 0) {
                throw new Error('No data to export');
            }
            
            // Get headers from first record
            const headers = Object.keys(auditData.data[0]);
            
            // Create CSV content
            let csvContent = headers.join(',') + '\n';
            
            auditData.data.forEach(record => {
                const row = headers.map(header => {
                    let value = record[header];
                    
                    // Handle different data types
                    if (value instanceof Date) {
                        value = value.toISOString();
                    } else if (typeof value === 'object' && value !== null) {
                        value = JSON.stringify(value);
                    } else if (typeof value === 'string' && value.includes(',')) {
                        value = `"${value}"`;
                    }
                    
                    return value || '';
                });
                
                csvContent += row.join(',') + '\n';
            });
            
            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_data_${Date.now()}.csv`;
            a.click();
            
            window.URL.revokeObjectURL(url);
            
            return {
                exportId: this.generateExportId(),
                format: 'csv',
                filename: a.download,
                size: blob.size,
                url: url,
                timestamp: new Date()
            };
            
        } catch (error) {
            console.error('CSV generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate Excel export
     */
    async generateExcelExport(auditData, template) {
        try {
            if (!window.XLSX) {
                throw new Error('SheetJS library not loaded');
            }
            
            if (auditData.data.length === 0) {
                throw new Error('No data to export');
            }
            
            // Prepare data for Excel
            const worksheet = window.XLSX.utils.json_to_sheet(auditData.data);
            
            // Create workbook
            const workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Data');
            
            // Add metadata sheet if template requires it
            if (template && template.sections.includes('metadata')) {
                const metadataSheet = window.XLSX.utils.aoa_to_sheet([
                    ['Export Metadata'],
                    ['Export Date', auditData.metadata.exportDate.toLocaleDateString()],
                    ['Record Count', auditData.metadata.recordCount],
                    ['Collection', auditData.collection],
                    [''],
                    ['Filters Applied'],
                    ...Object.entries(auditData.metadata.filters).map(([key, value]) => [key, value])
                ]);
                
                window.XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
            }
            
            // Generate filename
            const filename = `audit_data_${Date.now()}.xlsx`;
            
            // Save Excel file
            window.XLSX.writeFile(workbook, filename);
            
            return {
                exportId: this.generateExportId(),
                format: 'xlsx',
                filename: filename,
                size: 'generated',
                url: null,
                timestamp: new Date()
            };
            
        } catch (error) {
            console.error('Excel generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate JSON export
     */
    async generateJSONExport(auditData) {
        try {
            const exportData = {
                metadata: auditData.metadata,
                data: auditData.data
            };
            
            // Create and download file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_data_${Date.now()}.json`;
            a.click();
            
            window.URL.revokeObjectURL(url);
            
            return {
                exportId: this.generateExportId(),
                format: 'json',
                filename: a.download,
                size: blob.size,
                url: url,
                timestamp: new Date()
            };
            
        } catch (error) {
            console.error('JSON generation failed:', error);
            throw error;
        }
    }

    /**
     * Log export activity
     */
    async logExportActivity(params, result) {
        try {
            const exportLog = {
                exportId: result.exportId,
                timestamp: Firebase.serverTimestamp(),
                userId: Firebase.auth.currentUser?.uid || 'system',
                params: params,
                result: {
                    format: result.format,
                    filename: result.filename,
                    size: result.size
                },
                ipAddress: await this.getClientIP(),
                userAgent: navigator.userAgent
            };
            
            await Firebase.addDoc(
                Firebase.collection(Firebase.db, 'export-logs'),
                exportLog
            );
            
            console.log(`Export activity logged: ${result.exportId}`);
        } catch (error) {
            console.error('Failed to log export activity:', error);
        }
    }

    /**
     * Get export history
     */
    async getExportHistory(limit = 50) {
        try {
            const historySnapshot = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'export-logs'),
                    Firebase.orderBy('timestamp', 'desc'),
                    Firebase.limit(limit)
                )
            );
            
            return historySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Failed to get export history:', error);
            return this.exportHistory.slice(0, limit);
        }
    }

    /**
     * Get export templates
     */
    getExportTemplates() {
        return Array.from(this.exportTemplates.values());
    }

    /**
     * Create custom export template
     */
    async createExportTemplate(templateData) {
        try {
            const template = {
                id: this.generateTemplateId(),
                ...templateData,
                createdAt: Firebase.serverTimestamp(),
                createdBy: Firebase.auth.currentUser?.uid || 'system'
            };
            
            // Save to Firestore
            await Firebase.addDoc(
                Firebase.collection(Firebase.db, 'export-templates'),
                template
            );
            
            // Add to local cache
            this.exportTemplates.set(template.id, template);
            
            console.log(`Export template created: ${template.id}`);
            return template;
            
        } catch (error) {
            console.error('Failed to create export template:', error);
            throw error;
        }
    }

    /**
     * Update export template
     */
    async updateExportTemplate(templateId, updates) {
        try {
            const templateRef = Firebase.doc(Firebase.db, 'export-templates', templateId);
            
            await Firebase.updateDoc(templateRef, {
                ...updates,
                updatedAt: Firebase.serverTimestamp(),
                updatedBy: Firebase.auth.currentUser?.uid || 'system'
            });
            
            // Update local cache
            const template = this.exportTemplates.get(templateId);
            if (template) {
                Object.assign(template, updates);
            }
            
            console.log(`Export template updated: ${templateId}`);
        } catch (error) {
            console.error('Failed to update export template:', error);
            throw error;
        }
    }

    /**
     * Delete export template
     */
    async deleteExportTemplate(templateId) {
        try {
            await Firebase.deleteDoc(
                Firebase.doc(Firebase.db, 'export-templates', templateId)
            );
            
            // Remove from local cache
            this.exportTemplates.delete(templateId);
            
            console.log(`Export template deleted: ${templateId}`);
        } catch (error) {
            console.error('Failed to delete export template:', error);
            throw error;
        }
    }

    /**
     * Generate compliance report
     */
    async generateComplianceReport(params) {
        try {
            const { standard, dateRange, factoryId, includeEvidence } = params;
            
            // Get compliance data
            const complianceData = await this.getComplianceData(standard, dateRange, factoryId);
            
            // Generate report based on standard requirements
            const report = await this.formatComplianceReport(complianceData, standard, includeEvidence);
            
            // Export report
            const exportResult = await this.exportAuditData({
                format: 'pdf',
                dataType: 'compliance_report',
                dateRange: dateRange,
                templateId: 'compliance-audit-report',
                customData: report
            });
            
            return exportResult;
            
        } catch (error) {
            console.error('Compliance report generation failed:', error);
            throw error;
        }
    }

    /**
     * Get compliance data
     */
    async getComplianceData(standard, dateRange, factoryId) {
        try {
            // Get standards requirements
            const standardsSnapshot = await Firebase.getDocs(
                Firebase.query(
                    Firebase.collection(Firebase.db, 'standards'),
                    Firebase.where('code', '==', standard)
                )
            );
            
            const standardData = standardsSnapshot.docs[0]?.data();
            if (!standardData) {
                throw new Error(`Standard not found: ${standard}`);
            }
            
            // Get compliance evidence
            const evidenceQuery = Firebase.query(
                Firebase.collection(Firebase.db, 'compliance-evidence'),
                Firebase.where('standard', '==', standard),
                Firebase.where('date', '>=', dateRange.start),
                Firebase.where('date', '<=', dateRange.end)
            );
            
            if (factoryId) {
                evidenceQuery.push(Firebase.where('factoryId', '==', factoryId));
            }
            
            const evidenceSnapshot = await Firebase.getDocs(evidenceQuery);
            const evidence = evidenceSnapshot.docs.map(doc => doc.data());
            
            return {
                standard: standardData,
                evidence: evidence,
                dateRange: dateRange,
                factoryId: factoryId
            };
            
        } catch (error) {
            console.error('Failed to get compliance data:', error);
            throw error;
        }
    }

    /**
     * Format compliance report
     */
    async formatComplianceReport(complianceData, standard, includeEvidence) {
        const { standard: standardInfo, evidence, dateRange } = complianceData;
        
        const report = {
            title: `${standardInfo.name} Compliance Report`,
            standard: standardInfo.code,
            period: `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`,
            summary: {
                totalRequirements: standardInfo.requirements?.length || 0,
                compliantRequirements: evidence.filter(e => e.status === 'compliant').length,
                nonCompliantRequirements: evidence.filter(e => e.status === 'non_compliant').length,
                pendingRequirements: evidence.filter(e => e.status === 'pending').length
            },
            requirements: standardInfo.requirements || [],
            evidence: includeEvidence ? evidence : [],
            recommendations: this.generateComplianceRecommendations(complianceData)
        };
        
        return report;
    }

    /**
     * Generate compliance recommendations
     */
    generateComplianceRecommendations(complianceData) {
        const recommendations = [];
        const { evidence } = complianceData;
        
        const nonCompliantCount = evidence.filter(e => e.status === 'non_compliant').length;
        const pendingCount = evidence.filter(e => e.status === 'pending').length;
        
        if (nonCompliantCount > 0) {
            recommendations.push(`Address ${nonCompliantCount} non-compliant requirements immediately`);
        }
        
        if (pendingCount > 0) {
            recommendations.push(`Complete ${pendingCount} pending compliance requirements`);
        }
        
        if (evidence.length === 0) {
            recommendations.push('Implement comprehensive compliance monitoring system');
        }
        
        return recommendations;
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
     * Generate export ID
     */
    generateExportId() {
        return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate template ID
     */
    generateTemplateId() {
        return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get export statistics
     */
    async getExportStatistics() {
        try {
            const stats = {
                totalExports: 0,
                exportsByFormat: {},
                exportsByType: {},
                recentActivity: []
            };
            
            // Get export logs
            const exportLogs = await this.getExportHistory(100);
            stats.totalExports = exportLogs.length;
            
            // Group by format
            exportLogs.forEach(log => {
                const format = log.result.format;
                stats.exportsByFormat[format] = (stats.exportsByFormat[format] || 0) + 1;
            });
            
            // Group by type
            exportLogs.forEach(log => {
                const type = log.params.dataType;
                stats.exportsByType[type] = (stats.exportsByType[type] || 0) + 1;
            });
            
            // Recent activity
            stats.recentActivity = exportLogs.slice(0, 10);
            
            return stats;
            
        } catch (error) {
            console.error('Failed to get export statistics:', error);
            return null;
        }
    }
}

// Export for use in other modules
window.AuditExportSystem = AuditExportSystem;

// Initialize audit export system
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Firebase !== 'undefined') {
        window.auditExportSystem = new AuditExportSystem();
        console.log('Audit export system initialized');
    }
});
