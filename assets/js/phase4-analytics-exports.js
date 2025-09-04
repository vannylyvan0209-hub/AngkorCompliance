/**
 * Phase 4: Analytics & Exports System
 * Enterprise Blueprint v2 - Analytics & Exports (Weeks 16-17)
 */

class Phase4AnalyticsExports {
    constructor() {
        this.db = firebase.firestore();
        this.currentUser = null;
        this.currentFactoryId = null;
        this.riskCategories = {
            'critical': { color: '#dc3545', score: 4 },
            'high': { color: '#fd7e14', score: 3 },
            'medium': { color: '#ffc107', score: 2 },
            'low': { color: '#28a745', score: 1 }
        };
    }

    async initialize(user, factoryId) {
        this.currentUser = user;
        this.currentFactoryId = factoryId;
        console.log('Phase 4 Analytics & Exports initialized for factory:', factoryId);
    }

    // ==================== RISK HEATMAP ====================

    async generateRiskHeatmap(filters = {}) {
        try {
            const riskData = await this.calculateRiskMetrics(filters);
            const heatmapData = this.formatHeatmapData(riskData);
            
            return {
                success: true,
                data: heatmapData,
                metadata: {
                    generatedAt: new Date(),
                    factoryId: this.currentFactoryId,
                    filters: filters
                }
            };
        } catch (error) {
            console.error('Error generating risk heatmap:', error);
            return { success: false, error: error.message };
        }
    }

    async calculateRiskMetrics(filters) {
        const risks = [];
        
        // CAP Risks
        const capRisks = await this.calculateCAPRisks(filters);
        risks.push(...capRisks);

        // Grievance Risks
        const grievanceRisks = await this.calculateGrievanceRisks(filters);
        risks.push(...grievanceRisks);

        // Permit Risks
        const permitRisks = await this.calculatePermitRisks(filters);
        risks.push(...permitRisks);

        return risks;
    }

    async calculateCAPRisks(filters) {
        const capQuery = this.db.collection('caps')
            .where('factoryId', '==', this.currentFactoryId);
        
        const capSnapshot = await capQuery.get();
        const risks = [];

        capSnapshot.forEach(doc => {
            const cap = doc.data();
            const daysOverdue = this.calculateDaysOverdue(cap.dueDate);
            const severity = this.calculateCAPSeverity(cap.priority, daysOverdue);
            
            risks.push({
                id: doc.id,
                type: 'cap',
                category: 'Corrective Actions',
                severity: severity,
                title: cap.title,
                department: cap.department,
                daysOverdue: daysOverdue
            });
        });

        return risks;
    }

    async calculateGrievanceRisks(filters) {
        const grievanceQuery = this.db.collection('grievances')
            .where('factoryId', '==', this.currentFactoryId);
        
        const grievanceSnapshot = await grievanceQuery.get();
        const risks = [];

        grievanceSnapshot.forEach(doc => {
            const grievance = doc.data();
            const daysOpen = this.calculateDaysOpen(grievance.createdAt);
            const severity = this.calculateGrievanceSeverity(grievance.severity, daysOpen);
            
            risks.push({
                id: doc.id,
                type: 'grievance',
                category: 'Worker Grievances',
                severity: severity,
                title: grievance.category,
                department: grievance.department,
                daysOpen: daysOpen
            });
        });

        return risks;
    }

    async calculatePermitRisks(filters) {
        const permitQuery = this.db.collection('permits')
            .where('factoryId', '==', this.currentFactoryId);
        
        const permitSnapshot = await permitQuery.get();
        const risks = [];

        permitSnapshot.forEach(doc => {
            const permit = doc.data();
            const daysToExpiry = this.calculateDaysToExpiry(permit.expiryDate);
            const severity = this.calculatePermitSeverity(daysToExpiry);
            
            risks.push({
                id: doc.id,
                type: 'permit',
                category: 'Permits & Certificates',
                severity: severity,
                title: permit.name,
                department: permit.department,
                daysToExpiry: daysToExpiry
            });
        });

        return risks;
    }

    formatHeatmapData(riskData) {
        const heatmapData = {
            departments: {},
            categories: {},
            overall: { critical: 0, high: 0, medium: 0, low: 0 }
        };

        riskData.forEach(risk => {
            // Aggregate by department
            if (!heatmapData.departments[risk.department]) {
                heatmapData.departments[risk.department] = {
                    critical: 0, high: 0, medium: 0, low: 0, total: 0
                };
            }
            heatmapData.departments[risk.department][risk.severity]++;
            heatmapData.departments[risk.department].total++;

            // Aggregate by category
            if (!heatmapData.categories[risk.category]) {
                heatmapData.categories[risk.category] = {
                    critical: 0, high: 0, medium: 0, low: 0, total: 0
                };
            }
            heatmapData.categories[risk.category][risk.severity]++;
            heatmapData.categories[risk.category].total++;

            // Overall aggregation
            heatmapData.overall[risk.severity]++;
        });

        return heatmapData;
    }

    // ==================== KPI DASHBOARD ====================

    async generateKPIDashboard(filters = {}) {
        try {
            const kpiData = {
                compliance_score: await this.calculateComplianceScore(filters),
                cap_completion_rate: await this.calculateCAPCompletionRate(filters),
                grievance_resolution_time: await this.calculateGrievanceResolutionTime(filters),
                training_completion_rate: await this.calculateTrainingCompletionRate(filters),
                permit_expiry_risk: await this.calculatePermitExpiryRisk(filters)
            };

            return {
                success: true,
                data: {
                    kpis: kpiData,
                    generatedAt: new Date(),
                    factoryId: this.currentFactoryId
                }
            };
        } catch (error) {
            console.error('Error generating KPI dashboard:', error);
            return { success: false, error: error.message };
        }
    }

    async calculateComplianceScore(filters) {
        const totalRequirements = 100; // Placeholder
        const compliantRequirements = 85; // Placeholder
        const score = (compliantRequirements / totalRequirements) * 100;
        
        return {
            value: Math.round(score * 100) / 100,
            target: 95,
            status: this.getKPIStatus(score, 95)
        };
    }

    async calculateCAPCompletionRate(filters) {
        const capQuery = this.db.collection('caps')
            .where('factoryId', '==', this.currentFactoryId);
        
        const capSnapshot = await capQuery.get();
        let total = 0;
        let completed = 0;

        capSnapshot.forEach(doc => {
            const cap = doc.data();
            total++;
            if (cap.status === 'completed') {
                completed++;
            }
        });

        const rate = total > 0 ? (completed / total) * 100 : 0;
        
        return {
            value: Math.round(rate * 100) / 100,
            target: 90,
            status: this.getKPIStatus(rate, 90)
        };
    }

    async calculateGrievanceResolutionTime(filters) {
        const grievanceQuery = this.db.collection('grievances')
            .where('factoryId', '==', this.currentFactoryId)
            .where('status', '==', 'resolved');
        
        const grievanceSnapshot = await grievanceQuery.get();
        let totalDays = 0;
        let count = 0;

        grievanceSnapshot.forEach(doc => {
            const grievance = doc.data();
            if (grievance.resolvedAt && grievance.createdAt) {
                const days = this.calculateDaysBetween(grievance.createdAt, grievance.resolvedAt);
                totalDays += days;
                count++;
            }
        });

        const avgDays = count > 0 ? totalDays / count : 0;
        
        return {
            value: Math.round(avgDays * 100) / 100,
            target: 7,
            status: this.getKPIStatus(avgDays, 7, true) // Lower is better
        };
    }

    async calculateTrainingCompletionRate(filters) {
        const trainingQuery = this.db.collection('training_sessions')
            .where('factoryId', '==', this.currentFactoryId);
        
        const trainingSnapshot = await trainingQuery.get();
        let totalParticipants = 0;
        let completedParticipants = 0;

        trainingSnapshot.forEach(doc => {
            const training = doc.data();
            if (training.participants) {
                totalParticipants += training.participants.length;
                completedParticipants += training.participants.filter(p => p.status === 'completed').length;
            }
        });

        const rate = totalParticipants > 0 ? (completedParticipants / totalParticipants) * 100 : 0;
        
        return {
            value: Math.round(rate * 100) / 100,
            target: 95,
            status: this.getKPIStatus(rate, 95)
        };
    }

    async calculatePermitExpiryRisk(filters) {
        const permitQuery = this.db.collection('permits')
            .where('factoryId', '==', this.currentFactoryId);
        
        const permitSnapshot = await permitQuery.get();
        let expiringCount = 0;

        permitSnapshot.forEach(doc => {
            const permit = doc.data();
            const daysToExpiry = this.calculateDaysToExpiry(permit.expiryDate);
            if (daysToExpiry <= 30) {
                expiringCount++;
            }
        });

        return {
            value: expiringCount,
            target: 0,
            status: this.getKPIStatus(expiringCount, 0, true) // Lower is better
        };
    }

    // ==================== BUYER EXPORT PACKS ====================

    async generateBuyerExportPack(buyerId, filters = {}) {
        try {
            const exportData = {
                factory: await this.getFactoryInfo(),
                compliance: await this.getComplianceSummary(filters),
                caps: await this.getCAPSummary(filters),
                grievances: await this.getGrievanceSummary(filters),
                training: await this.getTrainingSummary(filters),
                riskAssessment: await this.generateRiskAssessment(filters),
                generatedAt: new Date(),
                buyerId: buyerId
            };

            const exportPackage = await this.formatBuyerExport(exportData, buyerId);
            
            return {
                success: true,
                data: exportPackage
            };
        } catch (error) {
            console.error('Error generating buyer export pack:', error);
            return { success: false, error: error.message };
        }
    }

    async getFactoryInfo() {
        const factoryDoc = await this.db.collection('factories')
            .doc(this.currentFactoryId)
            .get();
        
        return factoryDoc.exists ? factoryDoc.data() : null;
    }

    async getComplianceSummary(filters) {
        const complianceScore = await this.calculateComplianceScore(filters);
        
        return {
            overallScore: complianceScore.value,
            status: this.getComplianceStatus(complianceScore.value)
        };
    }

    async getCAPSummary(filters) {
        const capQuery = this.db.collection('caps')
            .where('factoryId', '==', this.currentFactoryId);
        
        const capSnapshot = await capQuery.get();
        const summary = {
            total: 0,
            open: 0,
            inProgress: 0,
            completed: 0,
            overdue: 0,
            byPriority: { critical: 0, high: 0, medium: 0, low: 0 }
        };

        capSnapshot.forEach(doc => {
            const cap = doc.data();
            summary.total++;
            summary[cap.status]++;
            
            if (this.isOverdue(cap.dueDate)) {
                summary.overdue++;
            }
            
            summary.byPriority[cap.priority]++;
        });

        return summary;
    }

    async getGrievanceSummary(filters) {
        const grievanceQuery = this.db.collection('grievances')
            .where('factoryId', '==', this.currentFactoryId);
        
        const grievanceSnapshot = await grievanceQuery.get();
        const summary = {
            total: 0,
            open: 0,
            underInvestigation: 0,
            resolved: 0,
            avgResolutionTime: 0
        };

        let totalResolutionTime = 0;
        let resolvedCount = 0;

        grievanceSnapshot.forEach(doc => {
            const grievance = doc.data();
            summary.total++;
            summary[grievance.status]++;
            
            if (grievance.status === 'resolved' && grievance.resolvedAt && grievance.createdAt) {
                const resolutionTime = this.calculateDaysBetween(grievance.createdAt, grievance.resolvedAt);
                totalResolutionTime += resolutionTime;
                resolvedCount++;
            }
        });

        summary.avgResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

        return summary;
    }

    async getTrainingSummary(filters) {
        const trainingQuery = this.db.collection('training_sessions')
            .where('factoryId', '==', this.currentFactoryId);
        
        const trainingSnapshot = await trainingQuery.get();
        const summary = {
            totalSessions: 0,
            totalParticipants: 0,
            completedParticipants: 0,
            completionRate: 0
        };

        trainingSnapshot.forEach(doc => {
            const training = doc.data();
            summary.totalSessions++;
            
            if (training.participants) {
                summary.totalParticipants += training.participants.length;
                summary.completedParticipants += training.participants.filter(p => p.status === 'completed').length;
            }
        });

        summary.completionRate = summary.totalParticipants > 0 ? 
            (summary.completedParticipants / summary.totalParticipants) * 100 : 0;

        return summary;
    }

    async generateRiskAssessment(filters) {
        const riskData = await this.calculateRiskMetrics(filters);
        
        return {
            overallRiskLevel: this.calculateOverallRiskLevel(riskData),
            riskBreakdown: this.calculateRiskBreakdown(riskData),
            topRisks: this.getTopRisks(riskData, 5)
        };
    }

    async formatBuyerExport(exportData, buyerId) {
        const buyerFormats = {
            'gap': this.formatGAPExport,
            'h&m': this.formatHMExport,
            'inditex': this.formatInditexExport,
            'default': this.formatDefaultExport
        };

        const formatter = buyerFormats[buyerId] || buyerFormats.default;
        return await formatter.call(this, exportData);
    }

    async formatGAPExport(exportData) {
        return {
            format: 'GAP',
            version: '1.0',
            factory: {
                name: exportData.factory.name,
                location: exportData.factory.location
            },
            compliance: {
                overallScore: exportData.compliance.overallScore,
                status: exportData.compliance.status
            },
            correctiveActions: {
                total: exportData.caps.total,
                open: exportData.caps.open,
                critical: exportData.caps.byPriority.critical
            },
            workerGrievances: {
                total: exportData.grievances.total,
                open: exportData.grievances.open,
                avgResolutionTime: exportData.grievances.avgResolutionTime
            },
            training: {
                completionRate: exportData.training.completionRate
            },
            riskAssessment: exportData.riskAssessment
        };
    }

    async formatHMExport(exportData) {
        return {
            format: 'H&M',
            version: '2.1',
            factory: {
                name: exportData.factory.name,
                country: exportData.factory.country
            },
            compliance: {
                score: exportData.compliance.overallScore,
                level: this.getH&MComplianceLevel(exportData.compliance.overallScore)
            },
            actions: {
                total: exportData.caps.total,
                open: exportData.caps.open
            },
            issues: {
                total: exportData.grievances.total,
                open: exportData.grievances.open
            },
            training: {
                completionRate: exportData.training.completionRate
            }
        };
    }

    async formatInditexExport(exportData) {
        return {
            format: 'Inditex',
            version: '3.0',
            factory: {
                name: exportData.factory.name,
                location: exportData.factory.location
            },
            compliance: {
                percentage: exportData.compliance.overallScore,
                status: this.getInditexStatus(exportData.compliance.overallScore)
            },
            correctiveMeasures: {
                total: exportData.caps.total,
                open: exportData.caps.open
            },
            workerComplaints: {
                total: exportData.grievances.total,
                open: exportData.grievances.open
            },
            trainingPrograms: {
                completionRate: exportData.training.completionRate
            }
        };
    }

    async formatDefaultExport(exportData) {
        return {
            format: 'Standard',
            version: '1.0',
            factory: exportData.factory,
            compliance: exportData.compliance,
            correctiveActions: exportData.caps,
            grievances: exportData.grievances,
            training: exportData.training,
            riskAssessment: exportData.riskAssessment
        };
    }

    // ==================== UTILITY METHODS ====================

    calculateDaysOverdue(dueDate) {
        if (!dueDate) return 0;
        const due = new Date(dueDate);
        const now = new Date();
        return Math.max(0, Math.floor((now - due) / (1000 * 60 * 60 * 24)));
    }

    calculateDaysOpen(createdAt) {
        if (!createdAt) return 0;
        const created = new Date(createdAt);
        const now = new Date();
        return Math.floor((now - created) / (1000 * 60 * 60 * 24));
    }

    calculateDaysToExpiry(expiryDate) {
        if (!expiryDate) return 999;
        const expiry = new Date(expiryDate);
        const now = new Date();
        return Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
    }

    calculateDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.floor((end - start) / (1000 * 60 * 60 * 24));
    }

    calculateCAPSeverity(priority, daysOverdue) {
        const priorityScore = { critical: 4, high: 3, medium: 2, low: 1 }[priority] || 1;
        const overdueScore = Math.min(daysOverdue / 7, 2);
        const totalScore = priorityScore + overdueScore;
        
        if (totalScore >= 5) return 'critical';
        if (totalScore >= 3.5) return 'high';
        if (totalScore >= 2.5) return 'medium';
        return 'low';
    }

    calculateGrievanceSeverity(severity, daysOpen) {
        const severityScore = { critical: 4, high: 3, medium: 2, low: 1 }[severity] || 1;
        const openScore = Math.min(daysOpen / 14, 1);
        const totalScore = severityScore + openScore;
        
        if (totalScore >= 4.5) return 'critical';
        if (totalScore >= 3.5) return 'high';
        if (totalScore >= 2.5) return 'medium';
        return 'low';
    }

    calculatePermitSeverity(daysToExpiry) {
        if (daysToExpiry <= 0) return 'critical';
        if (daysToExpiry <= 7) return 'high';
        if (daysToExpiry <= 30) return 'medium';
        return 'low';
    }

    getKPIStatus(value, target, lowerIsBetter = false) {
        if (lowerIsBetter) {
            if (value <= target) return 'excellent';
            if (value <= target * 1.2) return 'good';
            if (value <= target * 1.5) return 'warning';
            return 'critical';
        } else {
            if (value >= target) return 'excellent';
            if (value >= target * 0.9) return 'good';
            if (value >= target * 0.8) return 'warning';
            return 'critical';
        }
    }

    calculateOverallRiskLevel(riskData) {
        const riskScores = { critical: 4, high: 3, medium: 2, low: 1 };
        let totalScore = 0;
        let count = 0;

        riskData.forEach(risk => {
            totalScore += riskScores[risk.severity];
            count++;
        });

        const avgScore = count > 0 ? totalScore / count : 0;
        
        if (avgScore >= 3.5) return 'critical';
        if (avgScore >= 2.5) return 'high';
        if (avgScore >= 1.5) return 'medium';
        return 'low';
    }

    calculateRiskBreakdown(riskData) {
        const breakdown = { critical: 0, high: 0, medium: 0, low: 0 };
        riskData.forEach(risk => {
            breakdown[risk.severity]++;
        });
        return breakdown;
    }

    getTopRisks(riskData, limit) {
        const riskScores = { critical: 4, high: 3, medium: 2, low: 1 };
        return riskData
            .sort((a, b) => riskScores[b.severity] - riskScores[a.severity])
            .slice(0, limit);
    }

    getComplianceStatus(score) {
        if (score >= 95) return 'Excellent';
        if (score >= 85) return 'Good';
        if (score >= 75) return 'Fair';
        return 'Poor';
    }

    getH&MComplianceLevel(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        return 'D';
    }

    getInditexStatus(score) {
        if (score >= 95) return 'Green';
        if (score >= 85) return 'Yellow';
        return 'Red';
    }

    isOverdue(dueDate) {
        return this.calculateDaysOverdue(dueDate) > 0;
    }
}

// Export for global access
window.Phase4AnalyticsExports = Phase4AnalyticsExports;

