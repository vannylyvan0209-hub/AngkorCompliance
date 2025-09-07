/**
 * 🔧 CAP Generation Service
 * 
 * Automated Corrective Action Plan generation for the Angkor Compliance Platform.
 * Creates comprehensive CAPs from audit findings with SMART actions and timeline management.
 * 
 * @author Angkor Compliance Team
 * @version 2.0.0
 */

import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    serverTimestamp,
    writeBatch
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

class CAPGenerationService {
    constructor() {
        this.db = getFirestore();
        
        // Priority levels with SLA definitions
        this.priorityLevels = {
            'critical': { name: 'Critical', slaDays: 1, color: '#dc3545' },
            'high': { name: 'High', slaDays: 7, color: '#fd7e14' },
            'medium': { name: 'Medium', slaDays: 30, color: '#ffc107' },
            'low': { name: 'Low', slaDays: 90, color: '#28a745' }
        };
        
        // CAP status definitions
        this.capStatuses = {
            'pending': 'Pending Approval',
            'approved': 'Approved',
            'in_progress': 'In Progress',
            'completed': 'Completed',
            'verified': 'Verified',
            'closed': 'Closed'
        };
        
        console.log('🔧 CAP Generation Service initialized');
    }

    /**
     * 🚀 Generate CAP from audit data
     * @param {Object} auditData - Audit findings and data
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Generated CAP
     */
    async generateCAP(auditData, options = {}) {
        try {
            console.log('🚀 Generating CAP for audit:', auditData.auditId);
            
            const {
                factoryId = 'unknown',
                standardId = 'unknown',
                priority = 'medium',
                assignee = 'unassigned'
            } = options;
            
            // Generate CAP structure
            const cap = {
                id: this.generateCAPId(),
                auditId: auditData.auditId,
                standardId,
                factoryId,
                priority,
                status: 'pending',
                title: this.generateCAPTitle(auditData),
                description: this.generateCAPDescription(auditData),
                findings: auditData.findings || [],
                nonCompliances: auditData.nonCompliances || [],
                actionPlan: await this.generateActionPlan(auditData, priority),
                verificationPlan: this.generateVerificationPlan(auditData),
                metadata: {
                    createdBy: window.authService?.getCurrentUser()?.uid || 'unknown',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    version: 1,
                    isActive: true
                },
                assignee,
                stakeholders: this.identifyStakeholders(auditData),
                riskAssessment: this.assessRisk(auditData, priority),
                costEstimate: this.estimateCosts(auditData, priority),
                timeline: this.generateTimeline(auditData, priority)
            };
            
            // Save to Firestore
            const docRef = await addDoc(collection(this.db, 'caps'), cap);
            console.log('✅ CAP generated and saved:', docRef.id);
            
            return { ...cap, firestoreId: docRef.id };
            
        } catch (error) {
            console.error('❌ CAP generation failed:', error);
            throw error;
        }
    }

    /**
     * 📋 Generate action plan with SMART actions
     * @param {Object} auditData - Audit data
     * @param {string} priority - Priority level
     * @returns {Promise<Object>} Action plan
     */
    async generateActionPlan(auditData, priority) {
        const actions = [];
        const findings = [...(auditData.findings || []), ...(auditData.nonCompliances || [])];
        
        findings.forEach((finding, index) => {
            const action = {
                id: `action_${index + 1}`,
                title: `Address ${finding.type || 'issue'} - ${finding.description?.substring(0, 50)}...`,
                description: `Corrective action required for: ${finding.description}`,
                type: finding.severity === 'critical' ? 'immediate' : 'short_term',
                priority: this.mapSeverityToPriority(finding.severity),
                responsible: 'To be assigned',
                timeframe: this.calculateTimeframe(finding.severity, priority),
                status: 'pending',
                milestones: this.generateMilestones(finding.severity),
                resources: this.identifyResources(finding.type),
                cost: this.estimateActionCost(finding.severity)
            };
            actions.push(action);
        });
        
        return {
            actions,
            totalActions: actions.length,
            immediateActions: actions.filter(a => a.type === 'immediate').length,
            shortTermActions: actions.filter(a => a.type === 'short_term').length,
            longTermActions: actions.filter(a => a.type === 'long_term').length
        };
    }

    /**
     * 🔍 Generate verification plan
     * @param {Object} auditData - Audit data
     * @returns {Object} Verification plan
     */
    generateVerificationPlan(auditData) {
        return {
            verificationMethods: ['Document Review', 'Site Inspection', 'Interview', 'Testing'],
            verificationSchedule: '30 days after completion',
            verificationCriteria: 'All actions completed and documented',
            effectivenessMetrics: ['Compliance Score', 'Risk Reduction', 'Cost Savings'],
            followUpRequired: true,
            followUpInterval: '90 days'
        };
    }

    /**
     * 🎯 Identify stakeholders
     * @param {Object} auditData - Audit data
     * @returns {Array} Stakeholder list
     */
    identifyStakeholders(auditData) {
        const stakeholders = ['Factory Management', 'Compliance Team', 'HR Department'];
        
        if (auditData.findings?.some(f => f.type === 'safety')) {
            stakeholders.push('Safety Officer');
        }
        if (auditData.findings?.some(f => f.type === 'environmental')) {
            stakeholders.push('Environmental Manager');
        }
        if (auditData.findings?.some(f => f.type === 'quality')) {
            stakeholders.push('Quality Manager');
        }
        
        return stakeholders;
    }

    /**
     * ⚠️ Assess risk level
     * @param {Object} auditData - Audit data
     * @param {string} priority - Priority level
     * @returns {Object} Risk assessment
     */
    assessRisk(auditData, priority) {
        const criticalFindings = auditData.findings?.filter(f => f.severity === 'critical').length || 0;
        const highFindings = auditData.findings?.filter(f => f.severity === 'high').length || 0;
        
        let riskLevel = 'low';
        if (criticalFindings > 0) riskLevel = 'critical';
        else if (highFindings > 2) riskLevel = 'high';
        else if (highFindings > 0 || priority === 'high') riskLevel = 'medium';
        
        return {
            level: riskLevel,
            score: this.calculateRiskScore(criticalFindings, highFindings, priority),
            factors: this.identifyRiskFactors(auditData),
            mitigation: this.suggestMitigation(riskLevel)
        };
    }

    /**
     * 💰 Estimate costs
     * @param {Object} auditData - Audit data
     * @param {string} priority - Priority level
     * @returns {Object} Cost estimate
     */
    estimateCosts(auditData, priority) {
        const baseCost = 1000;
        const priorityMultiplier = this.getPriorityMultiplier(priority);
        const findingsCount = (auditData.findings?.length || 0) + (auditData.nonCompliances?.length || 0);
        
        const total = Math.round(baseCost * priorityMultiplier * Math.max(1, findingsCount * 0.5));
        
        return {
            total,
            breakdown: {
                immediate: Math.round(total * 0.4),
                shortTerm: Math.round(total * 0.4),
                longTerm: Math.round(total * 0.2)
            },
            currency: 'USD',
            notes: 'Estimated costs based on priority and complexity'
        };
    }

    /**
     * 📅 Generate timeline
     * @param {Object} auditData - Audit data
     * @param {string} priority - Priority level
     * @returns {Object} Timeline
     */
    generateTimeline(auditData, priority) {
        const startDate = new Date();
        const slaDays = this.priorityLevels[priority]?.slaDays || 30;
        const targetCompletion = new Date(startDate.getTime() + (slaDays * 24 * 60 * 60 * 1000));
        
        return {
            startDate: startDate.toISOString(),
            targetCompletion: targetCompletion.toISOString(),
            slaDays,
            milestones: this.generateTimelineMilestones(startDate, targetCompletion),
            criticalPath: this.identifyCriticalPath(auditData)
        };
    }

    // Utility methods
    generateCAPId() {
        return `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateCAPTitle(auditData) {
        const standard = auditData.standardName || 'Compliance';
        const issueCount = (auditData.findings?.length || 0) + (auditData.nonCompliances?.length || 0);
        return `${standard} Corrective Action Plan - ${issueCount} Issues`;
    }

    generateCAPDescription(auditData) {
        return `Comprehensive corrective action plan addressing ${auditData.findings?.length || 0} findings and ${auditData.nonCompliances?.length || 0} non-compliances identified during the ${auditData.standardName || 'compliance'} audit.`;
    }

    mapSeverityToPriority(severity) {
        const mapping = {
            'critical': 'critical',
            'high': 'high',
            'medium': 'medium',
            'low': 'low'
        };
        return mapping[severity] || 'medium';
    }

    calculateTimeframe(severity, priority) {
        if (severity === 'critical') return '0-24 hours';
        if (priority === 'high') return '1-7 days';
        if (priority === 'medium') return '1-30 days';
        return '1-90 days';
    }

    generateMilestones(severity) {
        if (severity === 'critical') {
            return ['Immediate Action', '24hr Review', '48hr Follow-up'];
        }
        return ['Planning', 'Implementation', 'Review', 'Verification'];
    }

    identifyResources(issueType) {
        const resourceMap = {
            'safety': ['Safety Equipment', 'Training Materials', 'Safety Officer'],
            'environmental': ['Environmental Specialist', 'Monitoring Equipment', 'Compliance Tools'],
            'quality': ['Quality Manager', 'Testing Equipment', 'Documentation Tools'],
            'hr': ['HR Staff', 'Training Resources', 'Policy Documents']
        };
        return resourceMap[issueType] || ['General Resources', 'Staff Time', 'Equipment'];
    }

    estimateActionCost(severity) {
        const costMap = {
            'critical': 5000,
            'high': 2500,
            'medium': 1000,
            'low': 500
        };
        return costMap[severity] || 1000;
    }

    calculateRiskScore(critical, high, priority) {
        let score = 0;
        score += critical * 10;
        score += high * 5;
        score += this.getPriorityMultiplier(priority) * 20;
        return Math.min(100, score);
    }

    identifyRiskFactors(auditData) {
        const factors = [];
        if (auditData.findings?.some(f => f.type === 'safety')) factors.push('Safety Violations');
        if (auditData.findings?.some(f => f.type === 'child_labor')) factors.push('Child Labor Risk');
        if (auditData.findings?.some(f => f.type === 'forced_labor')) factors.push('Forced Labor Risk');
        return factors.length > 0 ? factors : ['General Compliance Risk'];
    }

    suggestMitigation(riskLevel) {
        const mitigationMap = {
            'critical': 'Immediate action required. Escalate to senior management.',
            'high': 'Urgent attention needed. Weekly progress reviews.',
            'medium': 'Standard monitoring. Monthly progress reviews.',
            'low': 'Regular monitoring. Quarterly progress reviews.'
        };
        return mitigationMap[riskLevel] || 'Standard monitoring procedures.';
    }

    getPriorityMultiplier(priority) {
        const multipliers = {
            'critical': 3.0,
            'high': 2.0,
            'medium': 1.5,
            'low': 1.0
        };
        return multipliers[priority] || 1.5;
    }

    generateTimelineMilestones(startDate, targetDate) {
        const milestones = [];
        const totalDays = Math.ceil((new Date(targetDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        
        if (totalDays <= 7) {
            milestones.push({ name: 'Immediate Actions', days: 1 });
            milestones.push({ name: 'Short-term Actions', days: 3 });
            milestones.push({ name: 'Completion', days: totalDays });
        } else {
            milestones.push({ name: 'Planning Phase', days: Math.ceil(totalDays * 0.2) });
            milestones.push({ name: 'Implementation', days: Math.ceil(totalDays * 0.6) });
            milestones.push({ name: 'Verification', days: Math.ceil(totalDays * 0.2) });
        }
        
        return milestones;
    }

    identifyCriticalPath(auditData) {
        const criticalActions = auditData.findings?.filter(f => f.severity === 'critical') || [];
        return criticalActions.map(action => ({
            action: action.description?.substring(0, 50) + '...',
            dependency: 'None',
            duration: '24 hours'
        }));
    }

    /**
     * 📊 Get CAP statistics
     * @param {string} factoryId - Factory ID for filtering
     * @returns {Promise<Object>} CAP statistics
     */
    async getCAPStatistics(factoryId = null) {
        try {
            let q = query(collection(this.db, 'caps'), where('metadata.isActive', '==', true));
            
            if (factoryId) {
                q = query(q, where('factoryId', '==', factoryId));
            }
            
            const snapshot = await getDocs(q);
            const caps = snapshot.docs.map(doc => doc.data());
            
            const stats = {
                total: caps.length,
                byStatus: {},
                byPriority: {},
                byStandard: {},
                averageCost: 0,
                totalCost: 0
            };
            
            caps.forEach(cap => {
                // Status stats
                stats.byStatus[cap.status] = (stats.byStatus[cap.status] || 0) + 1;
                
                // Priority stats
                stats.byPriority[cap.priority] = (stats.byPriority[cap.priority] || 0) + 1;
                
                // Standard stats
                stats.byStandard[cap.standardId] = (stats.byStandard[cap.standardId] || 0) + 1;
                
                // Cost stats
                stats.totalCost += cap.costEstimate?.total || 0;
            });
            
            stats.averageCost = stats.total > 0 ? stats.totalCost / stats.total : 0;
            
            return stats;
            
        } catch (error) {
            console.error('❌ Failed to get CAP statistics:', error);
            throw error;
        }
    }

    /**
     * 🔍 Search CAPs
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Search results
     */
    async searchCAPs(query, options = {}) {
        try {
            const { factoryId, status, priority, limit: limitCount = 20 } = options;
            
            let q = query(
                collection(this.db, 'caps'),
                where('metadata.isActive', '==', true),
                orderBy('metadata.createdAt', 'desc'),
                limit(limitCount)
            );
            
            if (factoryId) {
                q = query(q, where('factoryId', '==', factoryId));
            }
            
            if (status) {
                q = query(q, where('status', '==', status));
            }
            
            if (priority) {
                q = query(q, where('priority', '==', priority));
            }
            
            const snapshot = await getDocs(q);
            const caps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Simple text search simulation
            if (query) {
                return caps.filter(cap => 
                    cap.title.toLowerCase().includes(query.toLowerCase()) ||
                    cap.description.toLowerCase().includes(query.toLowerCase()) ||
                    cap.standardId.toLowerCase().includes(query.toLowerCase())
                );
            }
            
            return caps;
            
        } catch (error) {
            console.error('❌ CAP search failed:', error);
            throw error;
        }
    }
}

// Export service
export default CAPGenerationService;

// Global instance for backward compatibility
if (typeof window !== 'undefined') {
    window.capGenerationService = new CAPGenerationService();
}
