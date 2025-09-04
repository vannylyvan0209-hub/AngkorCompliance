// Enhanced Standards Registry for Angkor Compliance v2
// Implements comprehensive standards management with audit preparation automation

class EnhancedStandardsRegistry {
    constructor() {
        this.db = window.Firebase?.db;
        this.standards = new Map();
        this.requirements = new Map();
        this.controls = new Map();
        this.auditFrameworks = new Map();
        this.isInitialized = false;
        
        this.initializeEnhancedRegistry();
    }

    async initializeEnhancedRegistry() {
        try {
            console.log('🏛️ Initializing Enhanced Standards Registry...');
            
            // Load all standards data
            await Promise.all([
                this.loadStandards(),
                this.loadRequirements(),
                this.loadControls(),
                this.loadAuditFrameworks()
            ]);
            
            this.isInitialized = true;
            console.log('✅ Enhanced Standards Registry initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Enhanced Standards Registry:', error);
            this.isInitialized = false;
        }
    }

    async loadStandards() {
        try {
            const standardsSnapshot = await this.db.collection('standards').get();
            standardsSnapshot.forEach(doc => {
                const standard = { id: doc.id, ...doc.data() };
                this.standards.set(standard.id, standard);
            });
            console.log(`📋 Loaded ${this.standards.size} standards`);
        } catch (error) {
            console.error('Error loading standards:', error);
        }
    }

    async loadRequirements() {
        try {
            const requirementsSnapshot = await this.db.collection('requirements').get();
            requirementsSnapshot.forEach(doc => {
                const requirement = { id: doc.id, ...doc.data() };
                this.requirements.set(requirement.id, requirement);
            });
            console.log(`📋 Loaded ${this.requirements.size} requirements`);
        } catch (error) {
            console.error('Error loading requirements:', error);
        }
    }

    async loadControls() {
        try {
            const controlsSnapshot = await this.db.collection('controls').get();
            controlsSnapshot.forEach(doc => {
                const control = { id: doc.id, ...doc.data() };
                this.controls.set(control.id, control);
            });
            console.log(`📋 Loaded ${this.controls.size} controls`);
        } catch (error) {
            console.error('Error loading controls:', error);
        }
    }

    async loadAuditFrameworks() {
        try {
            const frameworksSnapshot = await this.db.collection('audit_frameworks').get();
            frameworksSnapshot.forEach(doc => {
                const framework = { id: doc.id, ...doc.data() };
                this.auditFrameworks.set(framework.id, framework);
            });
            console.log(`📋 Loaded ${this.auditFrameworks.size} audit frameworks`);
        } catch (error) {
            console.error('Error loading audit frameworks:', error);
        }
    }

    // Standards Management Methods
    async createStandard(standardData) {
        try {
            const standard = {
                id: `standard_${Date.now()}`,
                ...standardData,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'active'
            };

            await this.db.collection('standards').doc(standard.id).set(standard);
            this.standards.set(standard.id, standard);
            
            console.log(`✅ Created standard: ${standard.name}`);
            return standard;
        } catch (error) {
            console.error('Error creating standard:', error);
            throw error;
        }
    }

    async updateStandard(standardId, updates) {
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            await this.db.collection('standards').doc(standardId).update(updateData);
            
            const standard = this.standards.get(standardId);
            if (standard) {
                Object.assign(standard, updateData);
            }
            
            console.log(`✅ Updated standard: ${standardId}`);
        } catch (error) {
            console.error('Error updating standard:', error);
            throw error;
        }
    }

    // Audit Preparation Methods
    async generateAuditChecklist(standardId, factoryId) {
        try {
            const standard = this.standards.get(standardId);
            if (!standard) {
                throw new Error(`Standard not found: ${standardId}`);
            }

            const requirements = Array.from(this.requirements.values())
                .filter(req => req.standardId === standardId);

            const checklist = {
                id: `checklist_${standardId}_${factoryId}_${Date.now()}`,
                standardId: standardId,
                factoryId: factoryId,
                standardName: standard.name,
                generatedAt: new Date(),
                status: 'draft',
                sections: []
            };

            // Group requirements by category
            const categories = [...new Set(requirements.map(req => req.category))];
            
            categories.forEach(category => {
                const categoryRequirements = requirements.filter(req => req.category === category);
                
                const section = {
                    category: category,
                    categoryName: this.getCategoryName(category),
                    requirements: categoryRequirements.map(req => ({
                        id: req.id,
                        code: req.code,
                        title: req.title,
                        description: req.description,
                        priority: req.priority,
                        riskLevel: req.riskLevel,
                        controls: req.controls,
                        evidenceTypes: req.evidenceTypes,
                        testMethods: req.testMethods,
                        complianceThreshold: req.complianceThreshold,
                        status: 'pending',
                        evidence: [],
                        notes: '',
                        score: 0
                    }))
                };
                
                checklist.sections.push(section);
            });

            // Save checklist
            await this.db.collection('audit_checklists').doc(checklist.id).set(checklist);
            
            console.log(`✅ Generated audit checklist: ${checklist.id}`);
            return checklist;
        } catch (error) {
            console.error('Error generating audit checklist:', error);
            throw error;
        }
    }

    async generateEvidenceBinder(factoryId, standardId, auditDate) {
        try {
            const checklist = await this.generateAuditChecklist(standardId, factoryId);
            
            const binder = {
                id: `binder_${factoryId}_${standardId}_${Date.now()}`,
                factoryId: factoryId,
                standardId: standardId,
                auditDate: auditDate,
                checklistId: checklist.id,
                generatedAt: new Date(),
                status: 'draft',
                sections: []
            };

            // Generate sections for each requirement
            checklist.sections.forEach(section => {
                const binderSection = {
                    category: section.category,
                    categoryName: section.categoryName,
                    requirements: section.requirements.map(req => ({
                        requirementId: req.id,
                        code: req.code,
                        title: req.title,
                        description: req.description,
                        evidenceRequired: req.evidenceTypes,
                        documents: [],
                        status: 'pending'
                    }))
                };
                
                binder.sections.push(binderSection);
            });

            // Save binder
            await this.db.collection('evidence_binders').doc(binder.id).set(binder);
            
            console.log(`✅ Generated evidence binder: ${binder.id}`);
            return binder;
        } catch (error) {
            console.error('Error generating evidence binder:', error);
            throw error;
        }
    }

    async calculateReadinessScore(factoryId, standardId) {
        try {
            const checklist = await this.generateAuditChecklist(standardId, factoryId);
            
            let totalRequirements = 0;
            let compliantRequirements = 0;
            
            checklist.sections.forEach(section => {
                section.requirements.forEach(req => {
                    totalRequirements++;
                    if (req.status === 'compliant') {
                        compliantRequirements++;
                    }
                });
            });
            
            const readinessScore = totalRequirements > 0 ? 
                Math.round((compliantRequirements / totalRequirements) * 100) : 0;
            
            return {
                factoryId: factoryId,
                standardId: standardId,
                readinessScore: readinessScore,
                totalRequirements: totalRequirements,
                compliantRequirements: compliantRequirements,
                calculatedAt: new Date()
            };
        } catch (error) {
            console.error('Error calculating readiness score:', error);
            throw error;
        }
    }

    // Gap Analysis Methods
    async performGapAnalysis(factoryId, standardId) {
        try {
            const readiness = await this.calculateReadinessScore(factoryId, standardId);
            const checklist = await this.generateAuditChecklist(standardId, factoryId);
            
            const gaps = [];
            
            checklist.sections.forEach(section => {
                section.requirements.forEach(req => {
                    if (req.status !== 'compliant') {
                        gaps.push({
                            requirementId: req.id,
                            code: req.code,
                            title: req.title,
                            category: section.category,
                            priority: req.priority,
                            riskLevel: req.riskLevel,
                            gap: req.status,
                            recommendations: this.generateRecommendations(req)
                        });
                    }
                });
            });
            
            const analysis = {
                id: `gap_analysis_${factoryId}_${standardId}_${Date.now()}`,
                factoryId: factoryId,
                standardId: standardId,
                readinessScore: readiness.readinessScore,
                totalGaps: gaps.length,
                criticalGaps: gaps.filter(gap => gap.priority === 'critical').length,
                majorGaps: gaps.filter(gap => gap.priority === 'major').length,
                minorGaps: gaps.filter(gap => gap.priority === 'minor').length,
                gaps: gaps,
                analyzedAt: new Date()
            };
            
            // Save analysis
            await this.db.collection('gap_analyses').doc(analysis.id).set(analysis);
            
            console.log(`✅ Performed gap analysis: ${analysis.id}`);
            return analysis;
        } catch (error) {
            console.error('Error performing gap analysis:', error);
            throw error;
        }
    }

    generateRecommendations(requirement) {
        const recommendations = [];
        
        if (requirement.controls && requirement.controls.length > 0) {
            recommendations.push(`Implement controls: ${requirement.controls.join(', ')}`);
        }
        
        if (requirement.evidenceTypes && requirement.evidenceTypes.length > 0) {
            recommendations.push(`Gather evidence: ${requirement.evidenceTypes.join(', ')}`);
        }
        
        if (requirement.testMethods && requirement.testMethods.length > 0) {
            recommendations.push(`Conduct tests: ${requirement.testMethods.join(', ')}`);
        }
        
        return recommendations;
    }

    // Utility Methods
    getCategoryName(category) {
        const categoryNames = {
            'labor_standards': 'Labor Standards',
            'health_safety': 'Health & Safety',
            'environment': 'Environment',
            'business_ethics': 'Business Ethics',
            'management_systems': 'Management Systems',
            'working_hours': 'Working Hours',
            'wages_benefits': 'Wages & Benefits',
            'quality_management': 'Quality Management'
        };
        
        return categoryNames[category] || category;
    }

    getStandardsByCategory(category) {
        return Array.from(this.standards.values())
            .filter(standard => standard.category === category);
    }

    getRequirementsByStandard(standardId) {
        return Array.from(this.requirements.values())
            .filter(req => req.standardId === standardId);
    }

    // Export Methods
    async exportStandardsRegistry(format = 'json') {
        try {
            const registry = {
                standards: Array.from(this.standards.values()),
                requirements: Array.from(this.requirements.values()),
                controls: Array.from(this.controls.values()),
                auditFrameworks: Array.from(this.auditFrameworks.values()),
                exportedAt: new Date()
            };
            
            if (format === 'json') {
                return registry;
            } else if (format === 'csv') {
                return this.convertToCSV(registry);
            }
        } catch (error) {
            console.error('Error exporting standards registry:', error);
            throw error;
        }
    }

    convertToCSV(data) {
        // Implementation for CSV conversion
        // This would convert the registry data to CSV format
        return 'CSV data would be generated here';
    }
}

// Initialize Enhanced Standards Registry
window.enhancedStandardsRegistry = new EnhancedStandardsRegistry();

// Export for use in other files
window.StandardsRegistry = window.enhancedStandardsRegistry;
