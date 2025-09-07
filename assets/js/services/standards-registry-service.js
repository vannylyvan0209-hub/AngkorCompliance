/**
 * 🎯 Standards Registry Service
 * 
 * Manages compliance standards, requirements, and audit preparation for the Angkor Compliance Platform.
 * Provides comprehensive standards mapping, requirement tracking, and audit readiness assessment.
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
    writeBatch,
    arrayUnion,
    arrayRemove
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

class StandardsRegistryService {
    constructor() {
        this.db = getFirestore();
        
        // Core compliance standards
        this.standards = {
            'smeta': {
                name: 'SMETA (Sedex Members Ethical Trade Audit)',
                version: '6.1',
                category: 'Social Compliance',
                description: 'Comprehensive social audit methodology for ethical trade',
                requirements: [
                    'ET1 - Employment is freely chosen',
                    'ET2 - Freedom of association and the right to collective bargaining',
                    'ET3 - Working conditions are safe and hygienic',
                    'ET4 - Child labour shall not be used',
                    'ET5 - Living wages are paid',
                    'ET6 - Working hours are not excessive',
                    'ET7 - No discrimination is practised',
                    'ET8 - Regular employment is provided',
                    'ET9 - No harsh or inhumane treatment is allowed'
                ],
                riskLevels: ['Low', 'Medium', 'High', 'Critical'],
                auditFrequency: '12 months',
                certificationBody: 'Sedex'
            },
            'sa8000': {
                name: 'SA8000 Social Accountability',
                version: '2014',
                category: 'Social Compliance',
                description: 'International standard for social accountability',
                requirements: [
                    'SA1 - Child Labour',
                    'SA2 - Forced or Compulsory Labour',
                    'SA3 - Health and Safety',
                    'SA4 - Freedom of Association and Right to Collective Bargaining',
                    'SA5 - Discrimination',
                    'SA6 - Disciplinary Practices',
                    'SA7 - Working Hours',
                    'SA8 - Remuneration',
                    'SA9 - Management System'
                ],
                riskLevels: ['Minor', 'Major', 'Critical'],
                auditFrequency: '6-12 months',
                certificationBody: 'SAI'
            },
            'iso9001': {
                name: 'ISO 9001 Quality Management',
                version: '2015',
                category: 'Quality Management',
                description: 'International standard for quality management systems',
                requirements: [
                    'Q1 - Context of the Organization',
                    'Q2 - Leadership',
                    'Q3 - Planning',
                    'Q4 - Support',
                    'Q5 - Operation',
                    'Q6 - Performance Evaluation',
                    'Q7 - Improvement'
                ],
                riskLevels: ['Observation', 'Minor NC', 'Major NC'],
                auditFrequency: '12 months',
                certificationBody: 'ISO'
            },
            'iso14001': {
                name: 'ISO 14001 Environmental Management',
                version: '2015',
                category: 'Environmental Management',
                description: 'International standard for environmental management systems',
                requirements: [
                    'E1 - Context of the Organization',
                    'E2 - Leadership',
                    'E3 - Planning',
                    'E4 - Support',
                    'E5 - Operation',
                    'E6 - Performance Evaluation',
                    'E7 - Improvement'
                ],
                riskLevels: ['Observation', 'Minor NC', 'Major NC'],
                auditFrequency: '12 months',
                certificationBody: 'ISO'
            },
            'iso45001': {
                name: 'ISO 45001 Occupational Health & Safety',
                version: '2018',
                category: 'Health & Safety',
                description: 'International standard for occupational health and safety',
                requirements: [
                    'H1 - Context of the Organization',
                    'H2 - Leadership and Worker Participation',
                    'H3 - Planning',
                    'H4 - Support',
                    'H5 - Operation',
                    'H6 - Performance Evaluation',
                    'H7 - Improvement'
                ],
                riskLevels: ['Observation', 'Minor NC', 'Major NC'],
                auditFrequency: '12 months',
                certificationBody: 'ISO'
            },
            'higg': {
                name: 'Higg Index (Sustainable Apparel Coalition)',
                version: '4.0',
                category: 'Sustainability',
                description: 'Standardized sustainability measurement for apparel and footwear',
                requirements: [
                    'H1 - Management',
                    'H2 - Energy & Greenhouse Gas',
                    'H3 - Water Use',
                    'H4 - Wastewater',
                    'H5 - Emissions to Air',
                    'H6 - Waste Management',
                    'H7 - Chemicals Management',
                    'H8 - Social/Labor'
                ],
                riskLevels: ['Level 1', 'Level 2', 'Level 3'],
                auditFrequency: '12 months',
                certificationBody: 'SAC'
            },
            'slcp': {
                name: 'Social & Labor Convergence Program',
                version: '2021',
                category: 'Social Compliance',
                description: 'Converged assessment framework for social and labor conditions',
                requirements: [
                    'SL1 - Recruitment and Hiring',
                    'SL2 - Wages',
                    'SL3 - Working Hours',
                    'SL4 - Freedom of Association',
                    'SL5 - Discrimination',
                    'SL6 - Disciplinary Practices',
                    'SL7 - Health and Safety',
                    'SL8 - Child Labor',
                    'SL9 - Forced Labor'
                ],
                riskLevels: ['Green', 'Yellow', 'Red'],
                auditFrequency: '12 months',
                certificationBody: 'SLCP'
            }
        };
        
        // Buyer-specific programs
        this.buyerPrograms = {
            'primark': {
                name: 'Primark Ethical Trade Program',
                version: '2024',
                category: 'Buyer Program',
                description: 'Primark-specific ethical trade requirements',
                requirements: [
                    'P1 - Ethical Trading Policy',
                    'P2 - Supplier Code of Conduct',
                    'P3 - Worker Rights',
                    'P4 - Health and Safety',
                    'P5 - Environmental Standards'
                ],
                riskLevels: ['Pass', 'Minor Issues', 'Major Issues', 'Fail'],
                auditFrequency: '6-12 months',
                certificationBody: 'Primark'
            },
            'gap': {
                name: 'GAP Inc. Vendor Compliance',
                version: '2024',
                category: 'Buyer Program',
                description: 'GAP Inc. vendor compliance requirements',
                requirements: [
                    'G1 - Code of Vendor Conduct',
                    'G2 - Labor Standards',
                    'G3 - Health and Safety',
                    'G4 - Environmental Standards',
                    'G5 - Business Integrity'
                ],
                riskLevels: ['Compliant', 'Minor NC', 'Major NC', 'Critical NC'],
                auditFrequency: '6-12 months',
                certificationBody: 'GAP Inc.'
            },
            'hm': {
                name: 'H&M Sustainability Assessment',
                version: '2024',
                category: 'Buyer Program',
                description: 'H&M sustainability and compliance requirements',
                requirements: [
                    'H1 - Sustainability Policy',
                    'H2 - Social Standards',
                    'H3 - Environmental Standards',
                    'H4 - Chemical Management',
                    'H5 - Transparency'
                ],
                riskLevels: ['Green', 'Yellow', 'Red'],
                auditFrequency: '12 months',
                certificationBody: 'H&M Group'
            }
        };
        
        console.log('🎯 Standards Registry Service initialized');
    }

    /**
     * 📋 Get all available standards
     * @param {string} category - Filter by category
     * @returns {Object} Available standards
     */
    getStandards(category = null) {
        if (category) {
            return Object.fromEntries(
                Object.entries(this.standards).filter(([_, standard]) => 
                    standard.category.toLowerCase() === category.toLowerCase()
                )
            );
        }
        return this.standards;
    }

    /**
     * 🎯 Get specific standard details
     * @param {string} standardId - Standard identifier
     * @returns {Object|null} Standard details
     */
    getStandard(standardId) {
        return this.standards[standardId] || this.buyerPrograms[standardId] || null;
    }

    /**
     * 📊 Get buyer programs
     * @returns {Object} Available buyer programs
     */
    getBuyerPrograms() {
        return this.buyerPrograms;
    }

    /**
     * 🔍 Search standards by keyword
     * @param {string} keyword - Search keyword
     * @returns {Array} Matching standards
     */
    searchStandards(keyword) {
        const results = [];
        const allStandards = { ...this.standards, ...this.buyerPrograms };
        
        Object.entries(allStandards).forEach(([id, standard]) => {
            if (
                standard.name.toLowerCase().includes(keyword.toLowerCase()) ||
                standard.description.toLowerCase().includes(keyword.toLowerCase()) ||
                standard.category.toLowerCase().includes(keyword.toLowerCase()) ||
                standard.requirements.some(req => req.toLowerCase().includes(keyword.toLowerCase()))
            ) {
                results.push({ id, ...standard });
            }
        });
        
        return results;
    }

    /**
     * 📝 Create compliance requirement
     * @param {Object} requirementData - Requirement data
     * @returns {Promise<string>} Created requirement ID
     */
    async createRequirement(requirementData) {
        try {
            const requirement = {
                id: this.generateRequirementId(),
                ...requirementData,
                metadata: {
                    createdBy: window.authService?.getCurrentUser()?.uid || 'unknown',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    factoryId: requirementData.factoryId || 'unknown',
                    organizationId: requirementData.organizationId || 'unknown'
                },
                status: 'active',
                complianceScore: 0,
                evidenceCount: 0,
                lastAuditDate: null,
                nextAuditDate: null,
                riskLevel: 'medium',
                isActive: true
            };

            const docRef = await addDoc(collection(this.db, 'requirements'), requirement);
            console.log('✅ Requirement created:', docRef.id);
            
            return docRef.id;
        } catch (error) {
            console.error('❌ Failed to create requirement:', error);
            throw error;
        }
    }

    /**
     * 🔄 Update compliance requirement
     * @param {string} requirementId - Requirement ID
     * @param {Object} updates - Update data
     * @returns {Promise<boolean>} Success status
     */
    async updateRequirement(requirementId, updates) {
        try {
            const docRef = doc(this.db, 'requirements', requirementId);
            await updateDoc(docRef, {
                ...updates,
                'metadata.updatedAt': serverTimestamp(),
                'metadata.lastModifiedBy': window.authService?.getCurrentUser()?.uid || 'unknown'
            });
            
            console.log('✅ Requirement updated:', requirementId);
            return true;
        } catch (error) {
            console.error('❌ Failed to update requirement:', error);
            throw error;
        }
    }

    /**
     * 📋 Get requirements by standard
     * @param {string} standardId - Standard identifier
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Requirements list
     */
    async getRequirementsByStandard(standardId, options = {}) {
        try {
            const { factoryId, status = 'active', limit: limitCount = 100 } = options;
            
            let q = query(
                collection(this.db, 'requirements'),
                where('standardId', '==', standardId),
                where('isActive', '==', true),
                orderBy('metadata.createdAt', 'desc'),
                limit(limitCount)
            );

            if (factoryId) {
                q = query(q, where('metadata.factoryId', '==', factoryId));
            }

            if (status) {
                q = query(q, where('status', '==', status));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
        } catch (error) {
            console.error('❌ Failed to get requirements by standard:', error);
            throw error;
        }
    }

    /**
     * 📊 Get compliance score for standard
     * @param {string} standardId - Standard identifier
     * @param {string} factoryId - Factory ID
     * @returns {Promise<Object>} Compliance score and details
     */
    async getComplianceScore(standardId, factoryId) {
        try {
            const requirements = await this.getRequirementsByStandard(standardId, { factoryId });
            
            if (requirements.length === 0) {
                return {
                    standardId,
                    factoryId,
                    totalRequirements: 0,
                    compliantRequirements: 0,
                    nonCompliantRequirements: 0,
                    pendingRequirements: 0,
                    overallScore: 0,
                    riskLevel: 'unknown'
                };
            }

            const totalRequirements = requirements.length;
            const compliantRequirements = requirements.filter(req => req.status === 'compliant').length;
            const nonCompliantRequirements = requirements.filter(req => req.status === 'non_compliant').length;
            const pendingRequirements = requirements.filter(req => req.status === 'pending').length;
            
            const overallScore = Math.round((compliantRequirements / totalRequirements) * 100);
            
            // Determine risk level based on score
            let riskLevel = 'low';
            if (overallScore < 60) riskLevel = 'high';
            else if (overallScore < 80) riskLevel = 'medium';
            
            return {
                standardId,
                factoryId,
                totalRequirements,
                compliantRequirements,
                nonCompliantRequirements,
                pendingRequirements,
                overallScore,
                riskLevel,
                lastUpdated: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Failed to get compliance score:', error);
            throw error;
        }
    }

    /**
     * 🔍 Generate audit checklist
     * @param {string} standardId - Standard identifier
     * @param {Object} options - Checklist options
     * @returns {Promise<Object>} Audit checklist
     */
    async generateAuditChecklist(standardId, options = {}) {
        try {
            const { factoryId, auditType = 'full', focusAreas = [] } = options;
            
            const standard = this.getStandard(standardId);
            if (!standard) {
                throw new Error(`Standard not found: ${standardId}`);
            }

            const requirements = await this.getRequirementsByStandard(standardId, { factoryId });
            
            // Generate checklist items
            const checklist = {
                id: this.generateChecklistId(),
                standardId,
                standardName: standard.name,
                standardVersion: standard.version,
                auditType,
                focusAreas,
                factoryId,
                generatedAt: new Date().toISOString(),
                generatedBy: window.authService?.getCurrentUser()?.uid || 'unknown',
                items: [],
                metadata: {
                    totalItems: 0,
                    criticalItems: 0,
                    highPriorityItems: 0,
                    mediumPriorityItems: 0,
                    lowPriorityItems: 0
                }
            };

            // Add standard requirements as checklist items
            standard.requirements.forEach((req, index) => {
                const existingReq = requirements.find(r => r.requirementCode === `REQ${index + 1}`);
                
                const checklistItem = {
                    id: `item_${index + 1}`,
                    requirementCode: `REQ${index + 1}`,
                    requirementText: req,
                    category: standard.category,
                    priority: this.calculatePriority(req, existingReq),
                    status: 'pending',
                    evidenceRequired: true,
                    notes: '',
                    findings: [],
                    recommendations: [],
                    assignedTo: null,
                    dueDate: null,
                    completionDate: null
                };

                checklist.items.push(checklistItem);
            });

            // Calculate metadata
            checklist.metadata.totalItems = checklist.items.length;
            checklist.metadata.criticalItems = checklist.items.filter(item => item.priority === 'critical').length;
            checklist.metadata.highPriorityItems = checklist.items.filter(item => item.priority === 'high').length;
            checklist.metadata.mediumPriorityItems = checklist.items.filter(item => item.priority === 'medium').length;
            checklist.metadata.lowPriorityItems = checklist.items.filter(item => item.priority === 'low').length;

            // Save checklist to Firestore
            const docRef = await addDoc(collection(this.db, 'audit_checklists'), checklist);
            console.log('✅ Audit checklist generated:', docRef.id);
            
            return { checklistId: docRef.id, ...checklist };
            
        } catch (error) {
            console.error('❌ Failed to generate audit checklist:', error);
            throw error;
        }
    }

    /**
     * 📋 Get audit checklists
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Audit checklists
     */
    async getAuditChecklists(options = {}) {
        try {
            const { factoryId, standardId, status = 'active', limit: limitCount = 50 } = options;
            
            let q = query(
                collection(this.db, 'audit_checklists'),
                where('isActive', '==', true),
                orderBy('generatedAt', 'desc'),
                limit(limitCount)
            );

            if (factoryId) {
                q = query(q, where('factoryId', '==', factoryId));
            }

            if (standardId) {
                q = query(q, where('standardId', '==', standardId));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
        } catch (error) {
            console.error('❌ Failed to get audit checklists:', error);
            throw error;
        }
    }

    /**
     * 📊 Get audit readiness score
     * @param {string} factoryId - Factory ID
     * @param {string} standardId - Standard identifier
     * @returns {Promise<Object>} Readiness assessment
     */
    async getAuditReadiness(factoryId, standardId) {
        try {
            const [complianceScore, checklist] = await Promise.all([
                this.getComplianceScore(standardId, factoryId),
                this.getAuditChecklists({ factoryId, standardId, limit: 1 })
            ]);

            const latestChecklist = checklist[0];
            
            // Calculate readiness score based on multiple factors
            let readinessScore = 0;
            let readinessFactors = [];

            // Factor 1: Compliance Score (40% weight)
            const complianceWeight = 0.4;
            readinessScore += (complianceScore.overallScore / 100) * complianceWeight;
            readinessFactors.push({
                factor: 'Compliance Score',
                score: complianceScore.overallScore,
                weight: complianceWeight,
                contribution: (complianceScore.overallScore / 100) * complianceWeight
            });

            // Factor 2: Evidence Coverage (30% weight)
            const evidenceWeight = 0.3;
            const evidenceCoverage = await this.getEvidenceCoverage(factoryId, standardId);
            readinessScore += evidenceCoverage * evidenceWeight;
            readinessFactors.push({
                factor: 'Evidence Coverage',
                score: Math.round(evidenceCoverage * 100),
                weight: evidenceWeight,
                contribution: evidenceCoverage * evidenceWeight
            });

            // Factor 3: Checklist Completion (20% weight)
            const checklistWeight = 0.2;
            let checklistCompletion = 0;
            if (latestChecklist) {
                const completedItems = latestChecklist.items.filter(item => item.status === 'completed').length;
                checklistCompletion = completedItems / latestChecklist.items.length;
            }
            readinessScore += checklistCompletion * checklistWeight;
            readinessFactors.push({
                factor: 'Checklist Completion',
                score: Math.round(checklistCompletion * 100),
                weight: checklistWeight,
                contribution: checklistCompletion * checklistWeight
            });

            // Factor 4: Recent Activity (10% weight)
            const activityWeight = 0.1;
            const recentActivity = await this.getRecentActivity(factoryId, standardId);
            readinessScore += recentActivity * activityWeight;
            readinessFactors.push({
                factor: 'Recent Activity',
                score: Math.round(recentActivity * 100),
                weight: activityWeight,
                contribution: recentActivity * activityWeight
            });

            // Determine readiness level
            let readinessLevel = 'Not Ready';
            if (readinessScore >= 0.8) readinessLevel = 'Ready';
            else if (readinessScore >= 0.6) readinessLevel = 'Nearly Ready';
            else if (readinessScore >= 0.4) readinessLevel = 'Partially Ready';

            return {
                factoryId,
                standardId,
                readinessScore: Math.round(readinessScore * 100),
                readinessLevel,
                readinessFactors,
                complianceScore,
                evidenceCoverage: Math.round(evidenceCoverage * 100),
                checklistCompletion: Math.round(checklistCompletion * 100),
                recentActivity: Math.round(recentActivity * 100),
                lastUpdated: new Date().toISOString(),
                recommendations: this.generateReadinessRecommendations(readinessScore, readinessFactors)
            };
            
        } catch (error) {
            console.error('❌ Failed to get audit readiness:', error);
            throw error;
        }
    }

    /**
     * 📈 Get evidence coverage for standard
     * @param {string} factoryId - Factory ID
     * @param {string} standardId - Standard identifier
     * @returns {Promise<number>} Evidence coverage (0-1)
     */
    async getEvidenceCoverage(factoryId, standardId) {
        try {
            // This would integrate with the Document Intelligence Service
            // For now, return a simulated coverage
            const baseCoverage = 0.6;
            const randomVariation = (Math.random() - 0.5) * 0.3;
            return Math.max(0, Math.min(1, baseCoverage + randomVariation));
        } catch (error) {
            console.error('❌ Failed to get evidence coverage:', error);
            return 0;
        }
    }

    /**
     * 📅 Get recent activity score
     * @param {string} factoryId - Factory ID
     * @param {string} standardId - Standard identifier
     * @returns {Promise<number>} Activity score (0-1)
     */
    async getRecentActivity(factoryId, standardId) {
        try {
            // This would check recent document uploads, requirement updates, etc.
            // For now, return a simulated activity score
            const baseActivity = 0.7;
            const randomVariation = (Math.random() - 0.5) * 0.2;
            return Math.max(0, Math.min(1, baseActivity + randomVariation));
        } catch (error) {
            console.error('❌ Failed to get recent activity:', error);
            return 0;
        }
    }

    /**
     * 💡 Generate readiness recommendations
     * @param {number} readinessScore - Overall readiness score
     * @param {Array} factors - Readiness factors
     * @returns {Array} Recommendations
     */
    generateReadinessRecommendations(readinessScore, factors) {
        const recommendations = [];
        
        if (readinessScore < 0.4) {
            recommendations.push('Immediate action required to improve compliance');
            recommendations.push('Focus on high-priority requirements first');
            recommendations.push('Consider external compliance consulting');
        } else if (readinessScore < 0.6) {
            recommendations.push('Address non-compliant requirements');
            recommendations.push('Improve evidence documentation');
            recommendations.push('Complete pending checklist items');
        } else if (readinessScore < 0.8) {
            recommendations.push('Finalize remaining requirements');
            recommendations.push('Review and validate evidence');
            recommendations.push('Conduct internal audit preparation');
        } else {
            recommendations.push('Maintain current compliance level');
            recommendations.push('Prepare for external audit');
            recommendations.push('Document best practices');
        }

        return recommendations;
    }

    /**
     * 🎯 Calculate requirement priority
     * @param {string} requirementText - Requirement text
     * @param {Object} existingRequirement - Existing requirement data
     * @returns {string} Priority level
     */
    calculatePriority(requirementText, existingRequirement) {
        // Check if requirement has existing non-compliance
        if (existingRequirement && existingRequirement.status === 'non_compliant') {
            return 'critical';
        }

        // Check for high-priority keywords
        const highPriorityKeywords = ['safety', 'child', 'forced', 'discrimination', 'harassment'];
        const mediumPriorityKeywords = ['training', 'documentation', 'procedure', 'policy'];
        
        const text = requirementText.toLowerCase();
        
        if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
            return 'high';
        } else if (mediumPriorityKeywords.some(keyword => text.includes(keyword))) {
            return 'medium';
        }
        
        return 'low';
    }

    // Utility methods
    generateRequirementId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateChecklistId() {
        return `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 📋 Get all standard categories
     * @returns {Array} Available categories
     */
    getStandardCategories() {
        const categories = new Set();
        Object.values(this.standards).forEach(standard => {
            categories.add(standard.category);
        });
        Object.values(this.buyerPrograms).forEach(program => {
            categories.add(program.category);
        });
        return Array.from(categories);
    }

    /**
     * 🔍 Get standards by category
     * @param {string} category - Category name
     * @returns {Object} Standards in category
     */
    getStandardsByCategory(category) {
        const allStandards = { ...this.standards, ...this.buyerPrograms };
        return Object.fromEntries(
            Object.entries(allStandards).filter(([_, standard]) => 
                standard.category.toLowerCase() === category.toLowerCase()
            )
        );
    }
}

// Export service
export default StandardsRegistryService;

// Global instance for backward compatibility
if (typeof window !== 'undefined') {
    window.standardsRegistryService = new StandardsRegistryService();
}
