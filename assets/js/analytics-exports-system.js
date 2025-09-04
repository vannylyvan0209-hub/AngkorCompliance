// Analytics & Exports System for Angkor Compliance v2
// Implements risk heatmaps, KPIs, and buyer-ready export packs

class AnalyticsExportsSystem {
    constructor() {
        this.db = window.Firebase?.db;
        this.riskData = new Map();
        this.kpiMetrics = new Map();
        this.exportTemplates = new Map();
        this.isInitialized = false;
        
        this.initializeAnalyticsSystem();
    }

    async initializeAnalyticsSystem() {
        try {
            console.log('📊 Initializing Analytics & Exports System...');
            
            await Promise.all([
                this.loadRiskData(),
                this.loadKPIMetrics(),
                this.loadExportTemplates()
            ]);
            
            this.isInitialized = true;
            console.log('✅ Analytics & Exports System initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Analytics & Exports System:', error);
            this.isInitialized = false;
        }
    }

    async loadRiskData() {
        try {
            const riskSnapshot = await this.db.collection('risk_assessments').get();
            riskSnapshot.forEach(doc => {
                const risk = { id: doc.id, ...doc.data() };
                this.riskData.set(risk.id, risk);
            });
            console.log(`📊 Loaded ${this.riskData.size} risk assessments`);
        } catch (error) {
            console.error('Error loading risk data:', error);
        }
    }

    async loadKPIMetrics() {
        try {
            const kpiSnapshot = await this.db.collection('kpi_metrics').get();
            kpiSnapshot.forEach(doc => {
                const kpi = { id: doc.id, ...doc.data() };
                this.kpiMetrics.set(kpi.id, kpi);
            });
            console.log(`📊 Loaded ${this.kpiMetrics.size} KPI metrics`);
        } catch (error) {
            console.error('Error loading KPI metrics:', error);
        }
    }

    async loadExportTemplates() {
        try {
            const templatesSnapshot = await this.db.collection('export_templates').get();
            templatesSnapshot.forEach(doc => {
                const template = { id: doc.id, ...doc.data() };
                this.exportTemplates.set(template.id, template);
            });
            console.log(`📊 Loaded ${this.exportTemplates.size} export templates`);
        } catch (error) {
            console.error('Error loading export templates:', error);
        }
    }

    // Risk Heatmap Methods
    async generateRiskHeatmap(factoryId, dateRange) {
        try {
            const riskMatrix = {
                low: { count: 0, items: [] },
                medium: { count: 0, items: [] },
                high: { count: 0, items: [] },
                critical: { count: 0, items: [] }
            };

            // Collect risk data from various sources
            const risks = await this.collectRiskData(factoryId, dateRange);
            
            risks.forEach(risk => {
                const level = this.calculateRiskLevel(risk);
                riskMatrix[level].count++;
                riskMatrix[level].items.push(risk);
            });

            return {
                factoryId,
                dateRange,
                generatedAt: new Date(),
                riskMatrix,
                totalRisks: risks.length,
                riskDistribution: this.calculateRiskDistribution(riskMatrix),
                heatmapData: this.generateHeatmapData(riskMatrix)
            };
        } catch (error) {
            console.error('Error generating risk heatmap:', error);
            throw error;
        }
    }

    async collectRiskData(factoryId, dateRange) {
        const risks = [];

        // Collect from CAPs
        const capsSnapshot = await this.db.collection('caps')
            .where('factoryId', '==', factoryId)
            .where('createdAt', '>=', dateRange.start)
            .where('createdAt', '<=', dateRange.end)
            .get();
        
        capsSnapshot.forEach(doc => {
            const cap = doc.data();
            risks.push({
                id: doc.id,
                type: 'cap',
                title: cap.title,
                severity: cap.severity,
                status: cap.status,
                dueDate: cap.dueDate,
                impact: cap.impact,
                probability: cap.probability,
                createdAt: cap.createdAt
            });
        });

        // Collect from Grievances
        const grievancesSnapshot = await this.db.collection('grievances')
            .where('factoryId', '==', factoryId)
            .where('createdAt', '>=', dateRange.start)
            .where('createdAt', '<=', dateRange.end)
            .get();
        
        grievancesSnapshot.forEach(doc => {
            const grievance = doc.data();
            risks.push({
                id: doc.id,
                type: 'grievance',
                title: grievance.subject,
                severity: grievance.severity,
                status: grievance.status,
                category: grievance.category,
                createdAt: grievance.createdAt
            });
        });

        // Collect from Permits
        const permitsSnapshot = await this.db.collection('permits')
            .where('factoryId', '==', factoryId)
            .get();
        
        permitsSnapshot.forEach(doc => {
            const permit = doc.data();
            if (permit.expiryDate && new Date(permit.expiryDate) <= new Date()) {
            risks.push({
                id: doc.id,
                type: 'permit',
                    title: `Expired Permit: ${permit.name}`,
                    severity: 'high',
                    status: 'expired',
                expiryDate: permit.expiryDate,
                    createdAt: permit.createdAt
            });
            }
        });

        return risks;
    }

    calculateRiskLevel(risk) {
        if (risk.type === 'permit' && risk.status === 'expired') {
            return 'critical';
        }

        const severity = risk.severity || 'medium';
        const impact = risk.impact || 3;
        const probability = risk.probability || 3;

        const riskScore = impact * probability;

        if (riskScore >= 15) return 'critical';
        if (riskScore >= 10) return 'high';
        if (riskScore >= 5) return 'medium';
        return 'low';
    }

    calculateRiskDistribution(riskMatrix) {
        const total = Object.values(riskMatrix).reduce((sum, level) => sum + level.count, 0);
        
        return {
            critical: total > 0 ? (riskMatrix.critical.count / total * 100).toFixed(1) : 0,
            high: total > 0 ? (riskMatrix.high.count / total * 100).toFixed(1) : 0,
            medium: total > 0 ? (riskMatrix.medium.count / total * 100).toFixed(1) : 0,
            low: total > 0 ? (riskMatrix.low.count / total * 100).toFixed(1) : 0
        };
    }

    generateHeatmapData(riskMatrix) {
        const heatmapData = [];
        
        Object.entries(riskMatrix).forEach(([level, data]) => {
            if (data.count > 0) {
                heatmapData.push({
                    level,
                    count: data.count,
                    color: this.getRiskColor(level),
                    items: data.items.slice(0, 5) // Top 5 items for display
                });
            }
        });

        return heatmapData;
    }

    getRiskColor(level) {
        const colors = {
            critical: '#dc3545',
            high: '#fd7e14',
            medium: '#ffc107',
            low: '#28a745'
        };
        return colors[level] || '#6c757d';
    }

    // KPI Methods
    async calculateKPIs(factoryId, dateRange) {
        try {
            const kpis = {
                compliance: await this.calculateComplianceKPI(factoryId, dateRange),
                efficiency: await this.calculateEfficiencyKPI(factoryId, dateRange),
                risk: await this.calculateRiskKPI(factoryId, dateRange),
                quality: await this.calculateQualityKPI(factoryId, dateRange)
            };

            return {
                factoryId,
                dateRange,
                calculatedAt: new Date(),
                kpis,
                overallScore: this.calculateOverallScore(kpis)
            };
        } catch (error) {
            console.error('Error calculating KPIs:', error);
            throw error;
        }
    }

    async calculateComplianceKPI(factoryId, dateRange) {
        // Calculate compliance score based on CAPs, permits, and standards
        const capsSnapshot = await this.db.collection('caps')
            .where('factoryId', '==', factoryId)
            .where('createdAt', '>=', dateRange.start)
            .where('createdAt', '<=', dateRange.end)
            .get();

        const totalCAPs = capsSnapshot.size;
        const completedCAPs = capsSnapshot.docs.filter(doc => 
            doc.data().status === 'completed'
        ).length;

        const permitsSnapshot = await this.db.collection('permits')
            .where('factoryId', '==', factoryId)
            .get();

        const totalPermits = permitsSnapshot.size;
        const validPermits = permitsSnapshot.docs.filter(doc => {
            const permit = doc.data();
            return permit.expiryDate && new Date(permit.expiryDate) > new Date();
        }).length;

        const capScore = totalCAPs > 0 ? (completedCAPs / totalCAPs) * 100 : 100;
        const permitScore = totalPermits > 0 ? (validPermits / totalPermits) * 100 : 100;
        
        return {
            score: Math.round((capScore + permitScore) / 2),
            metrics: {
                capCompletionRate: capScore,
                permitValidityRate: permitScore,
                totalCAPs,
                completedCAPs,
                totalPermits,
                validPermits
            }
        };
    }

    async calculateEfficiencyKPI(factoryId, dateRange) {
        // Calculate efficiency based on task completion times and SLA adherence
        const tasksSnapshot = await this.db.collection('tasks')
            .where('factoryId', '==', factoryId)
            .where('createdAt', '>=', dateRange.start)
            .where('createdAt', '<=', dateRange.end)
            .get();

        const tasks = tasksSnapshot.docs.map(doc => doc.data());
        const completedTasks = tasks.filter(task => task.status === 'completed');
        
        const averageCompletionTime = completedTasks.length > 0 ? 
            completedTasks.reduce((sum, task) => {
                const created = new Date(task.createdAt);
                const completed = new Date(task.completedAt);
                return sum + (completed - created);
            }, 0) / completedTasks.length : 0;

        const onTimeTasks = completedTasks.filter(task => {
            if (!task.dueDate) return true;
            const completed = new Date(task.completedAt);
            const due = new Date(task.dueDate);
            return completed <= due;
        }).length;

        const onTimeRate = completedTasks.length > 0 ? 
            (onTimeTasks / completedTasks.length) * 100 : 100;
        
        return {
            score: Math.round(onTimeRate),
            metrics: {
                averageCompletionTime: Math.round(averageCompletionTime / (1000 * 60 * 60 * 24)), // Days
                onTimeCompletionRate: onTimeRate,
                totalTasks: tasks.length,
                completedTasks: completedTasks.length,
                onTimeTasks
            }
        };
    }

    async calculateRiskKPI(factoryId, dateRange) {
        // Calculate risk score based on open risks and their severity
        const riskHeatmap = await this.generateRiskHeatmap(factoryId, dateRange);
        
        const riskMatrix = riskHeatmap.riskMatrix;
        const totalRisks = riskHeatmap.totalRisks;
        
        if (totalRisks === 0) {
        return {
                score: 100,
                metrics: {
                    totalRisks: 0,
                    criticalRisks: 0,
                    highRisks: 0,
                    riskScore: 0
                }
            };
        }

        const criticalWeight = 4;
        const highWeight = 3;
        const mediumWeight = 2;
        const lowWeight = 1;

        const riskScore = (
            riskMatrix.critical.count * criticalWeight +
            riskMatrix.high.count * highWeight +
            riskMatrix.medium.count * mediumWeight +
            riskMatrix.low.count * lowWeight
        ) / totalRisks;

        const normalizedScore = Math.max(0, 100 - (riskScore * 10));

        return {
            score: Math.round(normalizedScore),
            metrics: {
                totalRisks,
                criticalRisks: riskMatrix.critical.count,
                highRisks: riskMatrix.high.count,
                mediumRisks: riskMatrix.medium.count,
                lowRisks: riskMatrix.low.count,
                riskScore: Math.round(riskScore * 10) / 10
            }
        };
    }

    async calculateQualityKPI(factoryId, dateRange) {
        // Calculate quality score based on grievance resolution and audit findings
        const grievancesSnapshot = await this.db.collection('grievances')
            .where('factoryId', '==', factoryId)
            .where('createdAt', '>=', dateRange.start)
            .where('createdAt', '<=', dateRange.end)
            .get();

        const grievances = grievancesSnapshot.docs.map(doc => doc.data());
        const resolvedGrievances = grievances.filter(g => g.status === 'resolved');
        
        const resolutionRate = grievances.length > 0 ? 
            (resolvedGrievances.length / grievances.length) * 100 : 100;

        const averageResolutionTime = resolvedGrievances.length > 0 ?
            resolvedGrievances.reduce((sum, grievance) => {
                const created = new Date(grievance.createdAt);
                const resolved = new Date(grievance.resolvedAt);
                return sum + (resolved - created);
            }, 0) / resolvedGrievances.length : 0;
        
        return {
            score: Math.round(resolutionRate),
            metrics: {
                grievanceResolutionRate: resolutionRate,
                averageResolutionTime: Math.round(averageResolutionTime / (1000 * 60 * 60 * 24)), // Days
                totalGrievances: grievances.length,
                resolvedGrievances: resolvedGrievances.length
            }
        };
    }

    calculateOverallScore(kpis) {
        const weights = {
            compliance: 0.3,
            efficiency: 0.25,
            risk: 0.25,
            quality: 0.2
        };

        const overallScore = Object.entries(kpis).reduce((score, [key, kpi]) => {
            return score + (kpi.score * weights[key]);
        }, 0);

        return Math.round(overallScore);
    }

    // Export Methods
    async generateBuyerExport(factoryId, buyerFormat, dateRange) {
        try {
            const exportData = {
                factory: await this.getFactoryData(factoryId),
                compliance: await this.getComplianceData(factoryId, dateRange),
                risks: await this.generateRiskHeatmap(factoryId, dateRange),
                kpis: await this.calculateKPIs(factoryId, dateRange),
                caps: await this.getCAPData(factoryId, dateRange),
                permits: await this.getPermitData(factoryId),
                grievances: await this.getGrievanceData(factoryId, dateRange)
            };

            const template = this.exportTemplates.get(buyerFormat);
            if (!template) {
                throw new Error(`Export template not found: ${buyerFormat}`);
            }

            const formattedExport = await this.formatExportData(exportData, template);
        
        return {
                factoryId,
                buyerFormat,
                dateRange,
                generatedAt: new Date(),
                data: formattedExport,
                metadata: {
                    totalRecords: this.countTotalRecords(exportData),
                    riskLevel: this.getHighestRiskLevel(exportData.risks),
                    complianceScore: exportData.kpis.kpis.compliance.score
                }
            };
        } catch (error) {
            console.error('Error generating buyer export:', error);
            throw error;
        }
    }

    async getFactoryData(factoryId) {
        const factoryDoc = await this.db.collection('factories').doc(factoryId).get();
        return factoryDoc.exists ? factoryDoc.data() : null;
    }

    async getComplianceData(factoryId, dateRange) {
        const standardsSnapshot = await this.db.collection('standards_compliance')
            .where('factoryId', '==', factoryId)
            .where('assessmentDate', '>=', dateRange.start)
            .where('assessmentDate', '<=', dateRange.end)
            .get();

        return standardsSnapshot.docs.map(doc => doc.data());
    }

    async getCAPData(factoryId, dateRange) {
        const capsSnapshot = await this.db.collection('caps')
            .where('factoryId', '==', factoryId)
            .where('createdAt', '>=', dateRange.start)
            .where('createdAt', '<=', dateRange.end)
            .get();

        return capsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getPermitData(factoryId) {
        const permitsSnapshot = await this.db.collection('permits')
            .where('factoryId', '==', factoryId)
            .get();

        return permitsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getGrievanceData(factoryId, dateRange) {
        const grievancesSnapshot = await this.db.collection('grievances')
            .where('factoryId', '==', factoryId)
            .where('createdAt', '>=', dateRange.start)
            .where('createdAt', '<=', dateRange.end)
            .get();

        return grievancesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async formatExportData(exportData, template) {
        // Apply template formatting rules
        const formatted = {
            summary: {
                factoryName: exportData.factory?.name || 'Unknown Factory',
                assessmentPeriod: `${exportData.kpis.dateRange.start.toLocaleDateString()} - ${exportData.kpis.dateRange.end.toLocaleDateString()}`,
                overallScore: exportData.kpis.overallScore,
                riskLevel: this.getHighestRiskLevel(exportData.risks),
                complianceStatus: this.getComplianceStatus(exportData.kpis.kpis.compliance.score)
            },
            details: {}
        };

        // Apply template-specific formatting
        if (template.format === 'higg') {
            formatted.details = this.formatHiggExport(exportData);
        } else if (template.format === 'smeta') {
            formatted.details = this.formatSMETAExport(exportData);
        } else if (template.format === 'sa8000') {
            formatted.details = this.formatSA8000Export(exportData);
            } else {
            formatted.details = this.formatGenericExport(exportData);
        }

        return formatted;
    }

    formatHiggExport(exportData) {
        return {
            environmental: {
                energyUse: exportData.kpis.kpis.efficiency.metrics,
                waterUse: {},
                wasteManagement: {},
                emissions: {}
            },
            social: {
                laborRights: exportData.grievances,
                healthSafety: exportData.risks.riskMatrix.high.items,
                managementSystems: exportData.compliance
            }
        };
    }

    formatSMETAExport(exportData) {
        return {
            laborStandards: {
                workingHours: {},
                wages: {},
                childLabor: {},
                forcedLabor: {}
            },
            healthSafety: {
                incidents: exportData.risks.riskMatrix.critical.items,
                training: {},
                emergencyProcedures: {}
            },
            environment: {
                permits: exportData.permits,
                wasteManagement: {},
                emissions: {}
            },
            businessEthics: {
                corruption: {},
                transparency: {}
            }
        };
    }

    formatSA8000Export(exportData) {
        return {
            childLabor: {},
            forcedLabor: {},
            healthSafety: exportData.risks.riskMatrix.high.items,
            freedomOfAssociation: exportData.grievances,
            discrimination: {},
            disciplinaryPractices: {},
            workingHours: {},
            compensation: {},
            managementSystems: exportData.compliance
        };
    }

    formatGenericExport(exportData) {
        return {
            compliance: exportData.compliance,
            risks: exportData.risks,
            kpis: exportData.kpis,
            caps: exportData.caps,
            permits: exportData.permits,
            grievances: exportData.grievances
        };
    }

    countTotalRecords(exportData) {
        return (
            exportData.compliance.length +
            exportData.caps.length +
            exportData.permits.length +
            exportData.grievances.length
        );
    }

    getHighestRiskLevel(risks) {
        if (risks.riskMatrix.critical.count > 0) return 'Critical';
        if (risks.riskMatrix.high.count > 0) return 'High';
        if (risks.riskMatrix.medium.count > 0) return 'Medium';
        return 'Low';
    }

    getComplianceStatus(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Good';
        if (score >= 70) return 'Fair';
        return 'Poor';
    }

    // Utility Methods
    async exportToFormat(exportData, format) {
        switch (format) {
            case 'pdf':
                return await this.exportToPDF(exportData);
            case 'xlsx':
                return await this.exportToExcel(exportData);
            case 'csv':
                return await this.exportToCSV(exportData);
            case 'json':
                return await this.exportToJSON(exportData);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    async exportToPDF(exportData) {
        try {
            // Create PDF content using jsPDF
            const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(20);
            doc.text('Angkor Compliance Analytics Report', 20, 20);
            
            // Add date
            doc.setFontSize(12);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
            
            let yPosition = 50;
            
            // Add compliance summary
            if (exportData.compliance && exportData.compliance.length > 0) {
                doc.setFontSize(16);
                doc.text('Compliance Summary', 20, yPosition);
                yPosition += 10;
                
                doc.setFontSize(10);
                exportData.compliance.slice(0, 10).forEach((item, index) => {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(`${index + 1}. ${item.name || 'Compliance Item'}: ${item.status || 'Unknown'}`, 25, yPosition);
                    yPosition += 7;
                });
                yPosition += 10;
            }
            
            // Add risk summary
            if (exportData.risks && exportData.risks.riskMatrix) {
                doc.setFontSize(16);
                doc.text('Risk Assessment', 20, yPosition);
                yPosition += 10;
                
                doc.setFontSize(10);
                Object.entries(exportData.risks.riskMatrix).forEach(([level, data]) => {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(`${level.charAt(0).toUpperCase() + level.slice(1)}: ${data.count} items`, 25, yPosition);
                    yPosition += 7;
                });
                yPosition += 10;
            }
            
            // Add KPIs
            if (exportData.kpis && exportData.kpis.length > 0) {
                doc.setFontSize(16);
                doc.text('Key Performance Indicators', 20, yPosition);
                yPosition += 10;
                
                doc.setFontSize(10);
                exportData.kpis.slice(0, 8).forEach((kpi, index) => {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(`${index + 1}. ${kpi.name || 'KPI'}: ${kpi.value || 'N/A'}`, 25, yPosition);
                    yPosition += 7;
                });
            }
            
            // Generate PDF blob
            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            
            return {
                format: 'pdf',
                data: url,
                filename: `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`,
                blob: pdfBlob
            };
        } catch (error) {
            console.error('PDF generation error:', error);
            // Fallback to basic PDF
            return {
                format: 'pdf',
                data: exportData,
                filename: `analytics-report-${new Date().toISOString().split('T')[0]}.json`,
                error: 'PDF generation failed, fallback to JSON'
            };
        }
    }

    async exportToExcel(exportData) {
        try {
            // Create Excel workbook using SheetJS
            const XLSX = await import('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
            
            const workbook = XLSX.utils.book_new();
            
            // Create compliance worksheet
            if (exportData.compliance && exportData.compliance.length > 0) {
                const complianceWS = XLSX.utils.json_to_sheet(exportData.compliance);
                XLSX.utils.book_append_sheet(workbook, complianceWS, 'Compliance');
            }
            
            // Create risks worksheet
            if (exportData.risks && exportData.risks.riskMatrix) {
                const risksData = Object.entries(exportData.risks.riskMatrix).map(([level, data]) => ({
                    RiskLevel: level.charAt(0).toUpperCase() + level.slice(1),
                    Count: data.count,
                    Items: data.items ? data.items.length : 0
                }));
                const risksWS = XLSX.utils.json_to_sheet(risksData);
                XLSX.utils.book_append_sheet(workbook, risksWS, 'Risks');
            }
            
            // Create KPIs worksheet
            if (exportData.kpis && exportData.kpis.length > 0) {
                const kpisWS = XLSX.utils.json_to_sheet(exportData.kpis);
                XLSX.utils.book_append_sheet(workbook, kpisWS, 'KPIs');
            }
            
            // Create CAPs worksheet
            if (exportData.caps && exportData.caps.length > 0) {
                const capsWS = XLSX.utils.json_to_sheet(exportData.caps);
                XLSX.utils.book_append_sheet(workbook, capsWS, 'CAPs');
            }
            
            // Generate Excel blob
            const excelBlob = XLSX.write(workbook, { bookType: 'xlsx', type: 'blob' });
            const url = URL.createObjectURL(excelBlob);
            
            return {
                format: 'xlsx',
                data: url,
                filename: `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`,
                blob: excelBlob
            };
        } catch (error) {
            console.error('Excel generation error:', error);
            // Fallback to basic Excel
            return {
                format: 'xlsx',
                data: exportData,
                filename: `analytics-report-${new Date().toISOString().split('T')[0]}.json`,
                error: 'Excel generation failed, fallback to JSON'
            };
        }
    }

    async exportToCSV(exportData) {
        try {
            let csvContent = 'Data Type,Name,Status,Value,Date\n';
            
            // Add compliance data
            if (exportData.compliance && exportData.compliance.length > 0) {
                exportData.compliance.forEach(item => {
                    csvContent += `Compliance,${item.name || 'Unknown'},${item.status || 'Unknown'},${item.value || 'N/A'},${item.date || new Date().toISOString()}\n`;
                });
            }
            
            // Add risk data
            if (exportData.risks && exportData.risks.riskMatrix) {
                Object.entries(exportData.risks.riskMatrix).forEach(([level, data]) => {
                    csvContent += `Risk,${level.charAt(0).toUpperCase() + level.slice(1)},${data.count} items,${data.items ? data.items.length : 0},${new Date().toISOString()}\n`;
                });
            }
            
            // Add KPI data
            if (exportData.kpis && exportData.kpis.length > 0) {
                exportData.kpis.forEach(kpi => {
                    csvContent += `KPI,${kpi.name || 'Unknown'},${kpi.status || 'Active'},${kpi.value || 'N/A'},${kpi.date || new Date().toISOString()}\n`;
                });
            }
            
            // Add CAP data
            if (exportData.caps && exportData.caps.length > 0) {
                exportData.caps.forEach(cap => {
                    csvContent += `CAP,${cap.title || 'Unknown'},${cap.status || 'Unknown'},${cap.progress || '0'}%,${cap.dueDate || new Date().toISOString()}\n`;
                });
            }
            
            // Create CSV blob
            const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(csvBlob);
            
            return {
                format: 'csv',
                data: url,
                filename: `analytics-report-${new Date().toISOString().split('T')[0]}.csv`,
                blob: csvBlob
            };
        } catch (error) {
            console.error('CSV generation error:', error);
            // Fallback to basic CSV
            return {
                format: 'csv',
                data: exportData,
                filename: `analytics-report-${new Date().toISOString().split('T')[0]}.json`,
                error: 'CSV generation failed, fallback to JSON'
            };
        }
    }

    async exportToJSON(exportData) {
        return {
            format: 'json',
            data: JSON.stringify(exportData, null, 2),
            filename: `export-${new Date().toISOString().split('T')[0]}.json`
        };
    }
}

// Initialize Analytics & Exports System
window.analyticsExportsSystem = new AnalyticsExportsSystem();

// Export for use in other files
window.AnalyticsSystem = window.analyticsExportsSystem;

