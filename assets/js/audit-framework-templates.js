// Audit Framework Templates for Angkor Compliance Platform
// Provides structured audit processes for each compliance standard

class AuditFrameworkTemplates {
    constructor() {
        this.db = window.Firebase?.db;
        this.frameworks = new Map();
        this.isInitialized = false;
        
        this.initializeAuditFrameworks();
    }

    async initializeAuditFrameworks() {
        try {
            console.log('🔍 Initializing Audit Framework Templates...');
            
            // Load existing frameworks
            await this.loadAuditFrameworks();
            
            // Create default templates if none exist
            if (this.frameworks.size === 0) {
                await this.createDefaultTemplates();
            }
            
            this.isInitialized = true;
            console.log('✅ Audit Framework Templates initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Audit Framework Templates:', error);
        }
    }

    async loadAuditFrameworks() {
        try {
            const frameworksRef = this.db.collection('audit_frameworks');
            const snapshot = await frameworksRef.get();
            
            this.frameworks.clear();
            snapshot.forEach(doc => {
                this.frameworks.set(doc.id, { id: doc.id, ...doc.data() });
            });
            
            console.log(`📋 Loaded ${this.frameworks.size} audit frameworks`);
        } catch (error) {
            console.error('❌ Error loading audit frameworks:', error);
        }
    }

    async createDefaultTemplates() {
        console.log('📋 Creating default audit framework templates...');
        
        const { db } = window.Firebase;
        const { collection, addDoc, serverTimestamp } = window.Firebase;
        
        const defaultFrameworks = [
            // SMETA Audit Framework
            {
                name: 'SMETA 6.1 Audit Framework',
                standardId: 'smeta_6_1',
                version: '1.0',
                description: 'Comprehensive audit framework for SMETA 6.1 compliance',
                phases: [
                    {
                        name: 'Pre-Audit Planning',
                        duration: '1-2 weeks',
                        activities: [
                            'Audit scope definition',
                            'Team selection and assignment',
                            'Document review and preparation',
                            'Stakeholder communication',
                            'Audit schedule coordination'
                        ],
                        deliverables: [
                            'Audit plan',
                            'Team assignments',
                            'Document checklist',
                            'Communication plan'
                        ]
                    },
                    {
                        name: 'Opening Meeting',
                        duration: '1 day',
                        activities: [
                            'Introduction of audit team',
                            'Scope and objectives review',
                            'Audit methodology explanation',
                            'Stakeholder roles clarification',
                            'Schedule confirmation'
                        ],
                        deliverables: [
                            'Meeting minutes',
                            'Audit schedule',
                            'Contact information'
                        ]
                    },
                    {
                        name: 'Document Review',
                        duration: '2-3 days',
                        activities: [
                            'Policy and procedure review',
                            'Management system documentation',
                            'Previous audit reports',
                            'Compliance records',
                            'Training documentation'
                        ],
                        deliverables: [
                            'Document review checklist',
                            'Gap analysis report',
                            'Evidence requirements list'
                        ]
                    },
                    {
                        name: 'Site Inspection',
                        duration: '3-5 days',
                        activities: [
                            'Workplace walkthrough',
                            'Safety equipment inspection',
                            'Environmental controls review',
                            'Worker interviews',
                            'Management interviews'
                        ],
                        deliverables: [
                            'Site inspection checklist',
                            'Photo documentation',
                            'Interview notes',
                            'Observation records'
                        ]
                    },
                    {
                        name: 'Worker Interviews',
                        duration: '2-3 days',
                        activities: [
                            'Random worker selection',
                            'Structured interviews',
                            'Anonymous feedback collection',
                            'Working conditions assessment',
                            'Grievance mechanism review'
                        ],
                        deliverables: [
                            'Interview protocols',
                            'Worker feedback summary',
                            'Confidentiality records'
                        ]
                    },
                    {
                        name: 'Management Interviews',
                        duration: '1-2 days',
                        activities: [
                            'Senior management interviews',
                            'HR department interviews',
                            'Safety officer interviews',
                            'Process owner interviews',
                            'Policy implementation review'
                        ],
                        deliverables: [
                            'Management interview notes',
                            'Policy implementation assessment',
                            'Leadership commitment evaluation'
                        ]
                    },
                    {
                        name: 'Evidence Collection',
                        duration: '2-3 days',
                        activities: [
                            'Document collection',
                            'Record verification',
                            'Photographic evidence',
                            'Video documentation',
                            'Sample collection'
                        ],
                        deliverables: [
                            'Evidence inventory',
                            'Documentation package',
                            'Sample records'
                        ]
                    },
                    {
                        name: 'Findings Analysis',
                        duration: '1-2 days',
                        activities: [
                            'Compliance assessment',
                            'Non-conformity identification',
                            'Risk level determination',
                            'Root cause analysis',
                            'Recommendation development'
                        ],
                        deliverables: [
                            'Findings report',
                            'Non-conformity list',
                            'Risk assessment',
                            'Recommendations'
                        ]
                    },
                    {
                        name: 'Closing Meeting',
                        duration: '1 day',
                        activities: [
                            'Findings presentation',
                            'Non-conformity discussion',
                            'Recommendation review',
                            'Timeline agreement',
                            'Follow-up planning'
                        ],
                        deliverables: [
                            'Closing meeting minutes',
                            'Action plan',
                            'Timeline agreement'
                        ]
                    },
                    {
                        name: 'Report Preparation',
                        duration: '1-2 weeks',
                        activities: [
                            'Draft report preparation',
                            'Evidence compilation',
                            'Executive summary',
                            'Detailed findings',
                            'Recommendations'
                        ],
                        deliverables: [
                            'Draft audit report',
                            'Evidence package',
                            'Executive summary'
                        ]
                    }
                ],
                checklists: [
                    {
                        name: 'Labor Standards Checklist',
                        items: [
                            'Child labor prevention',
                            'Forced labor prevention',
                            'Working hours compliance',
                            'Minimum wage compliance',
                            'Overtime regulations',
                            'Leave entitlements',
                            'Freedom of association',
                            'Collective bargaining'
                        ]
                    },
                    {
                        name: 'Health & Safety Checklist',
                        items: [
                            'Safety policies and procedures',
                            'Risk assessments',
                            'Safety training programs',
                            'Personal protective equipment',
                            'Emergency procedures',
                            'Incident reporting',
                            'Health monitoring',
                            'Workplace conditions'
                        ]
                    },
                    {
                        name: 'Environmental Checklist',
                        items: [
                            'Environmental policies',
                            'Waste management',
                            'Energy efficiency',
                            'Water management',
                            'Chemical management',
                            'Emissions control',
                            'Environmental permits',
                            'Environmental training'
                        ]
                    },
                    {
                        name: 'Business Ethics Checklist',
                        items: [
                            'Anti-corruption policies',
                            'Gift and entertainment policies',
                            'Conflict of interest',
                            'Whistleblower protection',
                            'Supplier code of conduct',
                            'Transparency policies',
                            'Ethics training',
                            'Compliance monitoring'
                        ]
                    }
                ],
                samplingMethods: [
                    {
                        name: 'Random Sampling',
                        description: 'Random selection of workers for interviews',
                        criteria: 'All workers have equal probability of selection',
                        sampleSize: '10-15% of workforce'
                    },
                    {
                        name: 'Stratified Sampling',
                        description: 'Sampling by department, shift, or role',
                        criteria: 'Representative sample across all categories',
                        sampleSize: '5-10 workers per category'
                    },
                    {
                        name: 'Document Sampling',
                        description: 'Systematic review of key documents',
                        criteria: 'All critical documents reviewed',
                        sampleSize: '100% of critical documents'
                    }
                ],
                reportingTemplates: [
                    {
                        name: 'Executive Summary',
                        sections: [
                            'Audit overview',
                            'Key findings',
                            'Compliance status',
                            'Critical issues',
                            'Recommendations'
                        ]
                    },
                    {
                        name: 'Detailed Findings',
                        sections: [
                            'Finding description',
                            'Evidence',
                            'Standard reference',
                            'Risk level',
                            'Recommendations'
                        ]
                    },
                    {
                        name: 'Action Plan',
                        sections: [
                            'Action items',
                            'Responsible parties',
                            'Timeline',
                            'Success criteria',
                            'Follow-up schedule'
                        ]
                    }
                ],
                scoringSystem: {
                    method: 'weighted_average',
                    categories: {
                        'labor_standards': 0.4,
                        'health_safety': 0.3,
                        'environmental': 0.2,
                        'business_ethics': 0.1
                    },
                    thresholds: {
                        'excellent': 90,
                        'good': 80,
                        'fair': 70,
                        'poor': 60,
                        'critical': 50
                    }
                },
                duration: '10-15 days',
                teamSize: '2-4 auditors',
                prerequisites: [
                    'Auditor certification',
                    'SMETA training',
                    'Industry experience',
                    'Language proficiency'
                ],
                deliverables: [
                    'Audit report',
                    'Evidence package',
                    'Action plan',
                    'Follow-up schedule'
                ],
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: 'system'
            },
            
            // Higg FSLM Audit Framework
            {
                name: 'Higg FSLM 3.0 Audit Framework',
                standardId: 'higg_fslm_3_0',
                version: '1.0',
                description: 'Structured audit framework for Higg Facility Social & Labor Module',
                phases: [
                    {
                        name: 'Assessment Preparation',
                        duration: '1 week',
                        activities: [
                            'Higg account setup',
                            'Facility profile completion',
                            'Document preparation',
                            'Team training',
                            'Assessment planning'
                        ]
                    },
                    {
                        name: 'Self-Assessment',
                        duration: '2-3 weeks',
                        activities: [
                            'Questionnaire completion',
                            'Evidence collection',
                            'Gap identification',
                            'Improvement planning',
                            'Verification preparation'
                        ]
                    },
                    {
                        name: 'Verification',
                        duration: '3-5 days',
                        activities: [
                            'Document review',
                            'Site inspection',
                            'Worker interviews',
                            'Management interviews',
                            'Evidence verification'
                        ]
                    },
                    {
                        name: 'Report Generation',
                        duration: '1 week',
                        activities: [
                            'Score calculation',
                            'Report preparation',
                            'Recommendations',
                            'Action planning',
                            'Submission'
                        ]
                    }
                ],
                checklists: [
                    {
                        name: 'Management Systems',
                        items: [
                            'Policy development',
                            'Implementation procedures',
                            'Training programs',
                            'Monitoring systems',
                            'Continuous improvement'
                        ]
                    },
                    {
                        name: 'Recruitment & Hiring',
                        items: [
                            'Recruitment practices',
                            'Age verification',
                            'Documentation requirements',
                            'Training programs',
                            'Worker orientation'
                        ]
                    },
                    {
                        name: 'Working Hours',
                        items: [
                            'Regular hours compliance',
                            'Overtime management',
                            'Rest periods',
                            'Time tracking',
                            'Worker consent'
                        ]
                    },
                    {
                        name: 'Compensation & Benefits',
                        items: [
                            'Minimum wage compliance',
                            'Overtime pay',
                            'Benefits provision',
                            'Payroll accuracy',
                            'Deduction transparency'
                        ]
                    }
                ],
                samplingMethods: [
                    {
                        name: 'Higg Sampling',
                        description: 'Higg-specific sampling methodology',
                        criteria: 'Based on facility size and complexity',
                        sampleSize: 'Variable based on facility'
                    }
                ],
                reportingTemplates: [
                    {
                        name: 'Higg Report',
                        sections: [
                            'Facility profile',
                            'Assessment results',
                            'Score breakdown',
                            'Evidence summary',
                            'Improvement recommendations'
                        ]
                    }
                ],
                scoringSystem: {
                    method: 'higg_scoring',
                    categories: {
                        'management_systems': 0.25,
                        'recruitment_hiring': 0.25,
                        'working_hours': 0.25,
                        'compensation_benefits': 0.25
                    },
                    thresholds: {
                        'excellent': 90,
                        'good': 80,
                        'fair': 70,
                        'poor': 60
                    }
                },
                duration: '4-6 weeks',
                teamSize: '1-2 assessors',
                prerequisites: [
                    'Higg training',
                    'Assessment certification',
                    'Industry experience'
                ],
                deliverables: [
                    'Higg assessment report',
                    'Score breakdown',
                    'Improvement plan',
                    'Verification certificate'
                ],
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: 'system'
            },
            
            // ISO 9001 Audit Framework
            {
                name: 'ISO 9001:2015 Audit Framework',
                standardId: 'iso_9001_2015',
                version: '1.0',
                description: 'Quality management system audit framework',
                phases: [
                    {
                        name: 'Stage 1 - Documentation Review',
                        duration: '1-2 days',
                        activities: [
                            'Quality manual review',
                            'Procedure documentation',
                            'Policy review',
                            'Scope definition',
                            'Readiness assessment'
                        ]
                    },
                    {
                        name: 'Stage 2 - Implementation Audit',
                        duration: '3-5 days',
                        activities: [
                            'Process audits',
                            'Implementation verification',
                            'Effectiveness assessment',
                            'Management review',
                            'Internal audit review'
                        ]
                    },
                    {
                        name: 'Surveillance Audit',
                        duration: '2-3 days',
                        activities: [
                            'Process monitoring',
                            'Change assessment',
                            'Complaint review',
                            'Improvement verification',
                            'Continual improvement'
                        ]
                    }
                ],
                checklists: [
                    {
                        name: 'Context & Leadership',
                        items: [
                            'Organizational context',
                            'Stakeholder needs',
                            'Quality policy',
                            'Leadership commitment',
                            'Roles and responsibilities'
                        ]
                    },
                    {
                        name: 'Planning & Support',
                        items: [
                            'Risk assessment',
                            'Quality objectives',
                            'Resource planning',
                            'Competence management',
                            'Infrastructure'
                        ]
                    },
                    {
                        name: 'Operation & Performance',
                        items: [
                            'Process control',
                            'Product requirements',
                            'Design and development',
                            'Purchasing',
                            'Production control'
                        ]
                    }
                ],
                samplingMethods: [
                    {
                        name: 'Process Sampling',
                        description: 'Sample key processes for audit',
                        criteria: 'Based on risk and importance',
                        sampleSize: 'Representative sample'
                    }
                ],
                reportingTemplates: [
                    {
                        name: 'ISO Audit Report',
                        sections: [
                            'Audit scope',
                            'Findings summary',
                            'Non-conformities',
                            'Observations',
                            'Recommendations'
                        ]
                    }
                ],
                scoringSystem: {
                    method: 'iso_scoring',
                    categories: {
                        'context_leadership': 0.2,
                        'planning_support': 0.2,
                        'operation_performance': 0.4,
                        'improvement': 0.2
                    },
                    thresholds: {
                        'certified': 80,
                        'conditional': 70,
                        'non_certified': 60
                    }
                },
                duration: '5-7 days',
                teamSize: '1-3 auditors',
                prerequisites: [
                    'ISO 9001 training',
                    'Lead auditor certification',
                    'Industry experience'
                ],
                deliverables: [
                    'Audit report',
                    'Certificate recommendation',
                    'Action plan',
                    'Surveillance schedule'
                ],
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: 'system'
            }
        ];

        try {
            for (const framework of defaultFrameworks) {
                try {
                    await addDoc(collection(db, 'audit_frameworks'), framework);
                    console.log(`✅ Created audit framework: ${framework.name}`);
                } catch (error) {
                    console.error(`❌ Error creating framework ${framework.name}:`, error);
                }
            }
            
            console.log('✅ Default audit framework templates created');
            
        } catch (error) {
            console.error('❌ Error creating default templates:', error);
        }
    }

    // Get framework by standard
    getFrameworkByStandard(standardId) {
        return Array.from(this.frameworks.values())
            .filter(framework => framework.standardId === standardId);
    }

    // Get framework by name
    getFrameworkByName(name) {
        return Array.from(this.frameworks.values())
            .find(framework => framework.name === name);
    }

    // Create custom framework
    async createCustomFramework(frameworkData) {
        try {
            const framework = {
                ...frameworkData,
                id: `framework_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: frameworkData.createdBy || 'system'
            };

            await this.db.collection('audit_frameworks').doc(framework.id).set(framework);
            this.frameworks.set(framework.id, framework);
            
            console.log(`✅ Created custom audit framework: ${framework.name}`);
            return framework;
        } catch (error) {
            console.error('❌ Error creating custom framework:', error);
            throw error;
        }
    }

    // Generate audit checklist
    generateAuditChecklist(frameworkId, factoryId) {
        const framework = this.frameworks.get(frameworkId);
        if (!framework) {
            throw new Error(`Framework not found: ${frameworkId}`);
        }

        const checklist = {
            id: `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            frameworkId: frameworkId,
            factoryId: factoryId,
            frameworkName: framework.name,
            generatedAt: new Date(),
            sections: framework.checklists.map(checklist => ({
                name: checklist.name,
                items: checklist.items.map(item => ({
                    item: item,
                    status: 'pending',
                    evidence: '',
                    notes: '',
                    score: 0
                }))
            })),
            summary: {
                totalItems: framework.checklists.reduce((sum, checklist) => sum + checklist.items.length, 0),
                completedItems: 0,
                complianceScore: 0
            }
        };

        return checklist;
    }

    // Export framework
    exportFramework(frameworkId, format = 'json') {
        const framework = this.frameworks.get(frameworkId);
        if (!framework) {
            throw new Error(`Framework not found: ${frameworkId}`);
        }

        if (format === 'json') {
            return JSON.stringify(framework, null, 2);
        } else if (format === 'pdf') {
            return this.generatePDFReport(framework);
        }

        return framework;
    }

    generatePDFReport(framework) {
        // Implementation for PDF report generation
        return '';
    }
}

// Initialize Audit Framework Templates
window.auditFrameworkTemplates = new AuditFrameworkTemplates();
