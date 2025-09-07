/**
 * 🚨 Grievance Management Service
 * 
 * Comprehensive grievance case management for the Angkor Compliance Platform.
 * Handles case intake, triage, assignment, SLA management, and resolution tracking.
 * 
 * @author Angkor Compliance Team
 * @version 3.0.0
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
    writeBatch,
    arrayUnion,
    arrayRemove
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

class GrievanceManagementService {
    constructor() {
        this.db = getFirestore();
        
        // Grievance categories and types
        this.grievanceCategories = {
            'labor_rights': {
                name: 'Labor Rights',
                subcategories: ['wages', 'working_hours', 'overtime', 'benefits', 'contract_terms'],
                priority: 'high',
                slaDays: 7
            },
            'health_safety': {
                name: 'Health & Safety',
                subcategories: ['workplace_safety', 'equipment_safety', 'chemical_exposure', 'ergonomics'],
                priority: 'critical',
                slaDays: 1
            },
            'harassment_discrimination': {
                name: 'Harassment & Discrimination',
                subcategories: ['sexual_harassment', 'bullying', 'discrimination', 'retaliation'],
                priority: 'critical',
                slaDays: 1
            },
            'working_conditions': {
                name: 'Working Conditions',
                subcategories: ['ventilation', 'lighting', 'noise', 'temperature', 'cleanliness'],
                priority: 'medium',
                slaDays: 14
            },
            'management_issues': {
                name: 'Management Issues',
                subcategories: ['supervision', 'communication', 'policies', 'procedures'],
                priority: 'medium',
                slaDays: 14
            },
            'other': {
                name: 'Other Issues',
                subcategories: ['general', 'personal', 'administrative'],
                priority: 'low',
                slaDays: 30
            }
        };
        
        // Case status definitions
        this.caseStatuses = {
            'intake': 'Intake - Case received and being reviewed',
            'triage': 'Triage - Case being assessed and prioritized',
            'assigned': 'Assigned - Case assigned to investigator',
            'investigation': 'Investigation - Case under investigation',
            'resolution': 'Resolution - Solution being implemented',
            'verification': 'Verification - Solution effectiveness being verified',
            'closed': 'Closed - Case resolved and closed',
            'escalated': 'Escalated - Case escalated to higher authority'
        };
        
        // Priority levels with SLA definitions
        this.priorityLevels = {
            'critical': { name: 'Critical', slaDays: 1, color: '#dc3545', escalationHours: 4 },
            'high': { name: 'High', slaDays: 7, color: '#fd7e14', escalationHours: 24 },
            'medium': { name: 'Medium', slaDays: 14, color: '#ffc107', escalationHours: 72 },
            'low': { name: 'Low', slaDays: 30, color: '#28a745', escalationHours: 168 }
        };
        
        console.log('🚨 Grievance Management Service initialized');
    }

    /**
     * 📝 Create new grievance case
     * @param {Object} grievanceData - Grievance information
     * @returns {Promise<Object>} Created grievance case
     */
    async createGrievance(grievanceData) {
        try {
            console.log('📝 Creating new grievance case');
            
            const {
                workerId,
                workerName,
                factoryId,
                category,
                subcategory,
                description,
                priority = 'medium',
                confidential = false,
                attachments = []
            } = grievanceData;
            
            // Generate case ID
            const caseId = this.generateCaseId();
            
            // Calculate SLA based on category and priority
            const slaDays = this.calculateSLADays(category, priority);
            const dueDate = new Date(Date.now() + (slaDays * 24 * 60 * 60 * 1000));
            
            const grievance = {
                id: caseId,
                caseNumber: this.generateCaseNumber(),
                workerId,
                workerName,
                factoryId,
                category,
                subcategory,
                description,
                priority,
                status: 'intake',
                confidential,
                attachments,
                slaDays,
                dueDate: dueDate.toISOString(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                metadata: {
                    createdBy: window.authService?.getCurrentUser()?.uid || 'unknown',
                    organizationId: grievanceData.organizationId || 'unknown',
                    source: grievanceData.source || 'worker_portal',
                    isActive: true,
                    version: 1
                },
                timeline: {
                    intake: serverTimestamp(),
                    triage: null,
                    assignment: null,
                    investigation: null,
                    resolution: null,
                    verification: null,
                    closure: null
                },
                assignee: null,
                investigator: null,
                notes: [],
                actions: [],
                riskAssessment: this.assessInitialRisk(category, subcategory, description),
                escalationHistory: []
            };
            
            // Save to Firestore
            const docRef = await addDoc(collection(this.db, 'grievances'), grievance);
            console.log('✅ Grievance case created:', docRef.id);
            
            // Trigger automatic triage
            await this.performAutomaticTriage(caseId, grievance);
            
            return { ...grievance, firestoreId: docRef.id };
            
        } catch (error) {
            console.error('❌ Failed to create grievance:', error);
            throw error;
        }
    }

    /**
     * 🔍 Perform automatic case triage
     * @param {string} caseId - Case ID
     * @param {Object} grievance - Grievance data
     * @returns {Promise<Object>} Triage results
     */
    async performAutomaticTriage(caseId, grievance) {
        try {
            console.log('🔍 Performing automatic triage for case:', caseId);
            
            const triageResult = {
                priority: this.calculatePriority(grievance),
                riskLevel: this.assessInitialRisk(grievance.category, grievance.subcategory, grievance.description),
                urgency: this.calculateUrgency(grievance),
                recommendedAssignee: this.recommendAssignee(grievance),
                slaBreachRisk: this.assessSLABreachRisk(grievance),
                escalationTriggers: this.identifyEscalationTriggers(grievance)
            };
            
            // Update case with triage results
            await this.updateGrievance(caseId, {
                'status': 'triage',
                'priority': triageResult.priority,
                'riskLevel': triageResult.riskLevel,
                'triageResult': triageResult,
                'timeline.triage': serverTimestamp(),
                'metadata.updatedAt': serverTimestamp()
            });
            
            console.log('✅ Automatic triage completed:', triageResult);
            return triageResult;
            
        } catch (error) {
            console.error('❌ Automatic triage failed:', error);
            throw error;
        }
    }

    /**
     * 👥 Assign case to investigator
     * @param {string} caseId - Case ID
     * @param {string} investigatorId - Investigator ID
     * @param {Object} assignmentData - Assignment details
     * @returns {Promise<boolean>} Success status
     */
    async assignCase(caseId, investigatorId, assignmentData = {}) {
        try {
            console.log('👥 Assigning case to investigator:', caseId, investigatorId);
            
            const assignment = {
                investigatorId,
                assignedAt: serverTimestamp(),
                assignedBy: window.authService?.getCurrentUser()?.uid || 'unknown',
                expectedCompletion: assignmentData.expectedCompletion || this.calculateExpectedCompletion(caseId),
                notes: assignmentData.notes || '',
                workload: await this.calculateInvestigatorWorkload(investigatorId)
            };
            
            await this.updateGrievance(caseId, {
                'status': 'assigned',
                'investigator': investigatorId,
                'assignment': assignment,
                'timeline.assignment': serverTimestamp(),
                'metadata.updatedAt': serverTimestamp()
            });
            
            // Send notification to investigator
            await this.sendAssignmentNotification(investigatorId, caseId);
            
            console.log('✅ Case assigned successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Case assignment failed:', error);
            throw error;
        }
    }

    /**
     * 📊 Update case status
     * @param {string} caseId - Case ID
     * @param {string} newStatus - New status
     * @param {Object} updateData - Additional update data
     * @returns {Promise<boolean>} Success status
     */
    async updateCaseStatus(caseId, newStatus, updateData = {}) {
        try {
            console.log('📊 Updating case status:', caseId, 'to', newStatus);
            
            const updates = {
                'status': newStatus,
                'metadata.updatedAt': serverTimestamp()
            };
            
            // Update timeline
            if (this.caseStatuses[newStatus]) {
                updates[`timeline.${newStatus}`] = serverTimestamp();
            }
            
            // Add status change note
            if (updateData.notes) {
                updates['notes'] = arrayUnion({
                    type: 'status_change',
                    content: `Status changed to: ${newStatus}`,
                    details: updateData.notes,
                    timestamp: serverTimestamp(),
                    author: window.authService?.getCurrentUser()?.uid || 'unknown'
                });
            }
            
            // Check for SLA breach
            const slaStatus = await this.checkSLABreach(caseId);
            if (slaStatus.breached) {
                updates['slaBreach'] = slaStatus;
                updates['escalationHistory'] = arrayUnion({
                    type: 'sla_breach',
                    timestamp: serverTimestamp(),
                    details: slaStatus
                });
            }
            
            await this.updateGrievance(caseId, updates);
            
            // Trigger status-specific actions
            await this.handleStatusChange(caseId, newStatus, updateData);
            
            console.log('✅ Case status updated successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Case status update failed:', error);
            throw error;
        }
    }

    /**
     * ⚠️ Check SLA breach status
     * @param {string} caseId - Case ID
     * @returns {Promise<Object>} SLA breach status
     */
    async checkSLABreach(caseId) {
        try {
            const grievance = await this.getGrievance(caseId);
            if (!grievance) return { breached: false };
            
            const now = new Date();
            const dueDate = new Date(grievance.dueDate);
            const isBreached = now > dueDate;
            
            if (isBreached) {
                const breachHours = Math.floor((now - dueDate) / (1000 * 60 * 60));
                const escalationLevel = this.calculateEscalationLevel(breachHours);
                
                return {
                    breached: true,
                    breachHours,
                    escalationLevel,
                    dueDate: grievance.dueDate,
                    currentStatus: grievance.status,
                    recommendedAction: this.getEscalationAction(escalationLevel)
                };
            }
            
            return { breached: false };
            
        } catch (error) {
            console.error('❌ SLA breach check failed:', error);
            return { breached: false, error: error.message };
        }
    }

    /**
     * 📈 Get grievance statistics
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Grievance statistics
     */
    async getGrievanceStatistics(options = {}) {
        try {
            const { factoryId, organizationId, timeRange = '30d' } = options;
            
            let q = query(collection(this.db, 'grievances'), where('metadata.isActive', '==', true));
            
            if (factoryId) {
                q = query(q, where('factoryId', '==', factoryId));
            }
            
            if (organizationId) {
                q = query(q, where('metadata.organizationId', '==', organizationId));
            }
            
            const snapshot = await getDocs(q);
            const grievances = snapshot.docs.map(doc => doc.data());
            
            // Filter by time range
            const filteredGrievances = this.filterByTimeRange(grievances, timeRange);
            
            const stats = {
                total: filteredGrievances.length,
                byStatus: {},
                byPriority: {},
                byCategory: {},
                byMonth: {},
                slaCompliance: this.calculateSLACompliance(filteredGrievances),
                averageResolutionTime: this.calculateAverageResolutionTime(filteredGrievances),
                escalationRate: this.calculateEscalationRate(filteredGrievances),
                riskDistribution: this.calculateRiskDistribution(filteredGrievances)
            };
            
            // Calculate breakdowns
            filteredGrievances.forEach(grievance => {
                // Status stats
                stats.byStatus[grievance.status] = (stats.byStatus[grievance.status] || 0) + 1;
                
                // Priority stats
                stats.byPriority[grievance.priority] = (stats.byPriority[grievance.priority] || 0) + 1;
                
                // Category stats
                stats.byCategory[grievance.category] = (stats.byCategory[grievance.category] || 0) + 1;
                
                // Monthly stats
                const month = new Date(grievance.createdAt?.toDate?.() || grievance.createdAt).toISOString().substring(0, 7);
                stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
            });
            
            return stats;
            
        } catch (error) {
            console.error('❌ Failed to get grievance statistics:', error);
            throw error;
        }
    }

    /**
     * 🔍 Search grievances
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Search results
     */
    async searchGrievances(query, options = {}) {
        try {
            const { factoryId, status, priority, category, limit: limitCount = 20 } = options;
            
            let q = query(
                collection(this.db, 'grievances'),
                where('metadata.isActive', '==', true),
                orderBy('createdAt', 'desc'),
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
            
            if (category) {
                q = query(q, where('category', '==', category));
            }
            
            const snapshot = await getDocs(q);
            const grievances = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Simple text search simulation
            if (query) {
                return grievances.filter(grievance => 
                    grievance.description.toLowerCase().includes(query.toLowerCase()) ||
                    grievance.workerName.toLowerCase().includes(query.toLowerCase()) ||
                    grievance.category.toLowerCase().includes(query.toLowerCase())
                );
            }
            
            return grievances;
            
        } catch (error) {
            console.error('❌ Grievance search failed:', error);
            throw error;
        }
    }

    // Utility methods
    generateCaseId() {
        return `grievance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateCaseNumber() {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `GR-${year}${month}-${random}`;
    }

    calculateSLADays(category, priority) {
        const categorySLA = this.grievanceCategories[category]?.slaDays || 30;
        const priorityMultiplier = this.priorityLevels[priority]?.slaDays || 14;
        return Math.min(categorySLA, priorityMultiplier);
    }

    calculatePriority(grievance) {
        // Start with category priority
        let priority = this.grievanceCategories[grievance.category]?.priority || 'medium';
        
        // Escalate based on keywords
        const criticalKeywords = ['safety', 'harassment', 'discrimination', 'child', 'forced'];
        const highKeywords = ['wages', 'overtime', 'benefits', 'retaliation'];
        
        const description = grievance.description.toLowerCase();
        
        if (criticalKeywords.some(keyword => description.includes(keyword))) {
            priority = 'critical';
        } else if (highKeywords.some(keyword => description.includes(keyword))) {
            priority = 'high';
        }
        
        return priority;
    }

    assessInitialRisk(category, subcategory, description) {
        let riskLevel = 'low';
        
        if (category === 'health_safety' || category === 'harassment_discrimination') {
            riskLevel = 'high';
        } else if (category === 'labor_rights') {
            riskLevel = 'medium';
        }
        
        // Adjust based on description keywords
        const description_lower = description.toLowerCase();
        if (description_lower.includes('urgent') || description_lower.includes('emergency')) {
            riskLevel = 'critical';
        }
        
        return riskLevel;
    }

    calculateUrgency(grievance) {
        const urgencyFactors = {
            'critical': 10,
            'high': 7,
            'medium': 4,
            'low': 1
        };
        
        let urgency = urgencyFactors[grievance.priority] || 4;
        
        // Add category urgency
        if (grievance.category === 'health_safety') urgency += 3;
        if (grievance.category === 'harassment_discrimination') urgency += 3;
        
        return Math.min(10, urgency);
    }

    recommendAssignee(grievance) {
        // Simple assignment logic - in production, this would be more sophisticated
        const assigneeMap = {
            'health_safety': 'safety_officer',
            'harassment_discrimination': 'hr_manager',
            'labor_rights': 'compliance_officer',
            'working_conditions': 'facility_manager',
            'management_issues': 'operations_manager',
            'other': 'general_investigator'
        };
        
        return assigneeMap[grievance.category] || 'general_investigator';
    }

    assessSLABreachRisk(grievance) {
        const now = new Date();
        const dueDate = new Date(grievance.dueDate);
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue < 0) return 'breached';
        if (daysUntilDue <= 1) return 'critical';
        if (daysUntilDue <= 3) return 'high';
        if (daysUntilDue <= 7) return 'medium';
        return 'low';
    }

    identifyEscalationTriggers(grievance) {
        const triggers = [];
        
        if (grievance.priority === 'critical') triggers.push('critical_priority');
        if (grievance.category === 'harassment_discrimination') triggers.push('sensitive_issue');
        if (grievance.confidential) triggers.push('confidential_case');
        
        return triggers;
    }

    async calculateInvestigatorWorkload(investigatorId) {
        try {
            const q = query(
                collection(this.db, 'grievances'),
                where('investigator', '==', investigatorId),
                where('status', 'in', ['assigned', 'investigation', 'resolution'])
            );
            
            const snapshot = await getDocs(q);
            return snapshot.docs.length;
            
        } catch (error) {
            console.error('❌ Failed to calculate investigator workload:', error);
            return 0;
        }
    }

    async sendAssignmentNotification(investigatorId, caseId) {
        // In production, this would send actual notifications
        console.log(`📧 Notification sent to investigator ${investigatorId} for case ${caseId}`);
    }

    calculateExpectedCompletion(caseId) {
        // Calculate expected completion based on case complexity and investigator workload
        const baseDays = 7;
        const expectedDate = new Date(Date.now() + (baseDays * 24 * 60 * 60 * 1000));
        return expectedDate.toISOString();
    }

    async handleStatusChange(caseId, newStatus, updateData) {
        // Handle status-specific actions
        switch (newStatus) {
            case 'investigation':
                await this.startInvestigation(caseId);
                break;
            case 'resolution':
                await this.startResolution(caseId);
                break;
            case 'closed':
                await this.closeCase(caseId);
                break;
        }
    }

    async startInvestigation(caseId) {
        console.log(`🔍 Starting investigation for case: ${caseId}`);
        // Add investigation start logic
    }

    async startResolution(caseId) {
        console.log(`✅ Starting resolution for case: ${caseId}`);
        // Add resolution start logic
    }

    async closeCase(caseId) {
        console.log(`🔒 Closing case: ${caseId}`);
        // Add case closure logic
    }

    calculateEscalationLevel(breachHours) {
        if (breachHours >= 72) return 'senior_management';
        if (breachHours >= 48) return 'department_head';
        if (breachHours >= 24) return 'supervisor';
        return 'investigator';
    }

    getEscalationAction(escalationLevel) {
        const actions = {
            'investigator': 'Immediate attention required',
            'supervisor': 'Supervisor notification and oversight',
            'department_head': 'Department head involvement required',
            'senior_management': 'Senior management escalation required'
        };
        return actions[escalationLevel] || 'Standard escalation procedures';
    }

    filterByTimeRange(grievances, timeRange) {
        const now = new Date();
        const ranges = {
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            '90d': 90 * 24 * 60 * 60 * 1000,
            '1y': 365 * 24 * 60 * 60 * 1000
        };
        
        const cutoff = now.getTime() - (ranges[timeRange] || ranges['30d']);
        
        return grievances.filter(grievance => {
            const created = grievance.createdAt?.toDate?.() || new Date(grievance.createdAt);
            return created.getTime() >= cutoff;
        });
    }

    calculateSLACompliance(grievances) {
        const total = grievances.length;
        if (total === 0) return { rate: 100, breached: 0, compliant: 0 };
        
        const breached = grievances.filter(g => g.slaBreach?.breached).length;
        const compliant = total - breached;
        
        return {
            rate: Math.round((compliant / total) * 100),
            breached,
            compliant,
            total
        };
    }

    calculateAverageResolutionTime(grievances) {
        const resolvedCases = grievances.filter(g => g.status === 'closed' && g.timeline?.closure);
        if (resolvedCases.length === 0) return 0;
        
        const totalDays = resolvedCases.reduce((sum, grievance) => {
            const created = grievance.createdAt?.toDate?.() || new Date(grievance.createdAt);
            const closed = grievance.timeline.closure?.toDate?.() || new Date(grievance.timeline.closure);
            return sum + Math.ceil((closed - created) / (1000 * 60 * 60 * 24));
        }, 0);
        
        return Math.round(totalDays / resolvedCases.length);
    }

    calculateEscalationRate(grievances) {
        const total = grievances.length;
        if (total === 0) return 0;
        
        const escalated = grievances.filter(g => g.escalationHistory?.length > 0).length;
        return Math.round((escalated / total) * 100);
    }

    calculateRiskDistribution(grievances) {
        const distribution = { critical: 0, high: 0, medium: 0, low: 0 };
        
        grievances.forEach(grievance => {
            const risk = grievance.riskLevel || 'medium';
            distribution[risk] = (distribution[risk] || 0) + 1;
        });
        
        return distribution;
    }

    async updateGrievance(caseId, updates) {
        try {
            const docRef = doc(this.db, 'grievances', caseId);
            await updateDoc(docRef, updates);
            console.log('✅ Grievance updated:', caseId);
        } catch (error) {
            console.error('❌ Failed to update grievance:', error);
            throw error;
        }
    }

    async getGrievance(caseId) {
        try {
            const docRef = doc(this.db, 'grievances', caseId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ Failed to get grievance:', error);
            throw error;
        }
    }
}

// Export service
export default GrievanceManagementService;

// Global instance for backward compatibility
if (typeof window !== 'undefined') {
    window.grievanceManagementService = new GrievanceManagementService();
}
