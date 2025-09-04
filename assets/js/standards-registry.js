// Standards Registry for Angkor Compliance Platform
// Manages compliance standards, requirements, and audit frameworks

class StandardsRegistry {
    constructor() {
        this.db = window.Firebase?.db;
        this.standards = new Map();
        this.requirements = new Map();
        this.auditFrameworks = new Map();
        this.isInitialized = false;
        
        this.initializeStandardsRegistry();
    }

    async initializeStandardsRegistry() {
        try {
            console.log('🏛️ Initializing Standards Registry...');
            
            // Load standards from database
            await this.loadStandards();
            await this.loadRequirements();
            await this.loadAuditFrameworks();
            
            this.isInitialized = true;
            console.log('✅ Standards Registry initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Standards Registry:', error);
        }
    }

    // Standards Management
    async loadStandards() {
        try {
            const standardsRef = this.db.collection('standards');
            const snapshot = await standardsRef.get();
            
            this.standards.clear();
            snapshot.forEach(doc => {
                this.standards.set(doc.id, { id: doc.id, ...doc.data() });
            });
            
            console.log(`📋 Loaded ${this.standards.size} standards`);
        } catch (error) {
            console.error('❌ Error loading standards:', error);
        }
    }

    async createStandard(standardData) {
        try {
            const standard = {
                id: `standard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: standardData.name,
                code: standardData.code,
                version: standardData.version || '1.0',
                type: standardData.type, // 'international', 'national', 'buyer', 'industry'
                category: standardData.category, // 'labor', 'environmental', 'quality', 'safety'
                description: standardData.description,
                scope: standardData.scope,
                requirements: standardData.requirements || [],
                auditFrequency: standardData.auditFrequency,
                validityPeriod: standardData.validityPeriod,
                certificationBody: standardData.certificationBody,
                website: standardData.website,
                documents: standardData.documents || [],
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: standardData.createdBy
            };

            await this.db.collection('standards').doc(standard.id).set(standard);
            this.standards.set(standard.id, standard);
            
            console.log(`✅ Created standard: ${standard.name}`);
            return standard;
        } catch (error) {
            console.error('❌ Error creating standard:', error);
            throw error;
        }
    }

    // Requirements Management
    async loadRequirements() {
        try {
            const requirementsRef = this.db.collection('requirements');
            const snapshot = await requirementsRef.get();
            
            this.requirements.clear();
            snapshot.forEach(doc => {
                this.requirements.set(doc.id, { id: doc.id, ...doc.data() });
            });
            
            console.log(`📋 Loaded ${this.requirements.size} requirements`);
        } catch (error) {
            console.error('❌ Error loading requirements:', error);
        }
    }

    async createRequirement(requirementData) {
        try {
            const requirement = {
                id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                standardId: requirementData.standardId,
                code: requirementData.code,
                title: requirementData.title,
                description: requirementData.description,
                category: requirementData.category,
                priority: requirementData.priority, // 'critical', 'major', 'minor'
                riskLevel: requirementData.riskLevel, // 'high', 'medium', 'low'
                controls: requirementData.controls || [],
                evidenceTypes: requirementData.evidenceTypes || [],
                testMethods: requirementData.testMethods || [],
                scoringCriteria: requirementData.scoringCriteria || {},
                complianceThreshold: requirementData.complianceThreshold || 100,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: requirementData.createdBy
            };

            await this.db.collection('requirements').doc(requirement.id).set(requirement);
            this.requirements.set(requirement.id, requirement);
            
            console.log(`✅ Created requirement: ${requirement.title}`);
            return requirement;
        } catch (error) {
            console.error('❌ Error creating requirement:', error);
            throw error;
        }
    }

    // Audit Framework Management
    async loadAuditFrameworks() {
        try {
            const frameworksRef = this.db.collection('audit_frameworks');
            const snapshot = await frameworksRef.get();
            
            this.auditFrameworks.clear();
            snapshot.forEach(doc => {
                this.auditFrameworks.set(doc.id, { id: doc.id, ...doc.data() });
            });
            
            console.log(`📋 Loaded ${this.auditFrameworks.size} audit frameworks`);
        } catch (error) {
            console.error('❌ Error loading audit frameworks:', error);
        }
    }

    async createAuditFramework(frameworkData) {
        try {
            const framework = {
                id: `framework_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: frameworkData.name,
                standardId: frameworkData.standardId,
                version: frameworkData.version || '1.0',
                description: frameworkData.description,
                phases: frameworkData.phases || [],
                checklists: frameworkData.checklists || [],
                samplingMethods: frameworkData.samplingMethods || [],
                reportingTemplates: frameworkData.reportingTemplates || [],
                scoringSystem: frameworkData.scoringSystem || {},
                duration: frameworkData.duration,
                teamSize: frameworkData.teamSize,
                prerequisites: frameworkData.prerequisites || [],
                deliverables: frameworkData.deliverables || [],
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: frameworkData.createdBy
            };

            await this.db.collection('audit_frameworks').doc(framework.id).set(framework);
            this.auditFrameworks.set(framework.id, framework);
            
            console.log(`✅ Created audit framework: ${framework.name}`);
            return framework;
        } catch (error) {
            console.error('❌ Error creating audit framework:', error);
            throw error;
        }
    }

    // Audit Preparation
    async generateAuditChecklist(standardId, factoryId) {
        try {
            const standard = this.standards.get(standardId);
            if (!standard) {
                throw new Error(`Standard not found: ${standardId}`);
            }

            const requirements = Array.from(this.requirements.values())
                .filter(req => req.standardId === standardId);

            const checklist = {
                id: `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                standardId: standardId,
                factoryId: factoryId,
                standardName: standard.name,
                version: standard.version,
                generatedAt: new Date(),
                sections: requirements.map(req => ({
                    requirementId: req.id,
                    code: req.code,
                    title: req.title,
                    description: req.description,
                    category: req.category,
                    priority: req.priority,
                    riskLevel: req.riskLevel,
                    controls: req.controls,
                    evidenceTypes: req.evidenceTypes,
                    testMethods: req.testMethods,
                    complianceStatus: 'pending',
                    evidenceProvided: false,
                    notes: '',
                    findings: [],
                    score: 0
                })),
                summary: {
                    totalRequirements: requirements.length,
                    criticalRequirements: requirements.filter(r => r.priority === 'critical').length,
                    majorRequirements: requirements.filter(r => r.priority === 'major').length,
                    minorRequirements: requirements.filter(r => r.priority === 'minor').length,
                    complianceScore: 0,
                    readinessPercentage: 0
                }
            };

            return checklist;
        } catch (error) {
            console.error('❌ Error generating audit checklist:', error);
            throw error;
        }
    }

    // Evidence Binder Generation
    async generateEvidenceBinder(factoryId, standardId, auditDate) {
        try {
            const standard = this.standards.get(standardId);
            const requirements = Array.from(this.requirements.values())
                .filter(req => req.standardId === standardId);

            const binder = {
                id: `binder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                factoryId: factoryId,
                standardId: standardId,
                standardName: standard.name,
                auditDate: auditDate,
                generatedAt: new Date(),
                sections: requirements.map(req => ({
                    requirementId: req.id,
                    code: req.code,
                    title: req.title,
                    description: req.description,
                    evidenceRequired: req.evidenceTypes,
                    documents: [],
                    complianceStatus: 'pending',
                    notes: ''
                })),
                summary: {
                    totalRequirements: requirements.length,
                    evidenceProvided: 0,
                    complianceScore: 0,
                    readinessPercentage: 0
                }
            };

            return binder;
        } catch (error) {
            console.error('❌ Error generating evidence binder:', error);
            throw error;
        }
    }

    // Gap Analysis
    async performGapAnalysis(factoryId, standardId) {
        try {
            const requirements = Array.from(this.requirements.values())
                .filter(req => req.standardId === standardId);

            const gapAnalysis = {
                id: `gap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                factoryId: factoryId,
                standardId: standardId,
                performedAt: new Date(),
                gaps: requirements.map(req => ({
                    requirementId: req.id,
                    code: req.code,
                    title: req.title,
                    currentStatus: 'unknown',
                    gapDescription: '',
                    riskLevel: req.riskLevel,
                    priority: req.priority,
                    estimatedEffort: 'unknown',
                    estimatedCost: 0,
                    recommendedActions: []
                })),
                summary: {
                    totalRequirements: requirements.length,
                    compliant: 0,
                    nonCompliant: 0,
                    unknown: requirements.length,
                    highRiskGaps: 0,
                    mediumRiskGaps: 0,
                    lowRiskGaps: 0
                }
            };

            return gapAnalysis;
        } catch (error) {
            console.error('❌ Error performing gap analysis:', error);
            throw error;
        }
    }

    // Standards Search and Filter
    searchStandards(query, filters = {}) {
        const results = Array.from(this.standards.values()).filter(standard => {
            // Text search
            const matchesQuery = !query || 
                standard.name.toLowerCase().includes(query.toLowerCase()) ||
                standard.code.toLowerCase().includes(query.toLowerCase()) ||
                standard.description.toLowerCase().includes(query.toLowerCase());

            // Filter by type
            const matchesType = !filters.type || standard.type === filters.type;
            
            // Filter by category
            const matchesCategory = !filters.category || standard.category === filters.category;
            
            // Filter by status
            const matchesStatus = !filters.status || standard.status === filters.status;

            return matchesQuery && matchesType && matchesCategory && matchesStatus;
        });

        return results;
    }

    // Get requirements by standard
    getRequirementsByStandard(standardId) {
        return Array.from(this.requirements.values())
            .filter(req => req.standardId === standardId);
    }

    // Get audit framework by standard
    getAuditFrameworkByStandard(standardId) {
        return Array.from(this.auditFrameworks.values())
            .filter(framework => framework.standardId === standardId);
    }

    // Export standards data
    exportStandardsData(format = 'json') {
        const data = {
            standards: Array.from(this.standards.values()),
            requirements: Array.from(this.requirements.values()),
            auditFrameworks: Array.from(this.auditFrameworks.values()),
            exportedAt: new Date(),
            version: '1.0'
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            // Implement CSV export
            return this.convertToCSV(data);
        }

        return data;
    }

    convertToCSV(data) {
        // Simple CSV conversion for standards
        const headers = ['id', 'name', 'code', 'type', 'category', 'status'];
        const csv = [headers.join(',')];
        
        data.standards.forEach(standard => {
            const row = headers.map(header => `"${standard[header] || ''}"`).join(',');
            csv.push(row);
        });
        
        return csv.join('\n');
    }
}

// Initialize Standards Registry
window.standardsRegistry = new StandardsRegistry();
