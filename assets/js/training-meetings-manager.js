// Training & Meetings Manager for Angkor Compliance Platform
// Implements comprehensive training and meeting management as outlined in the vision document

class TrainingMeetingsManager {
    constructor() {
        this.db = window.Firebase?.db;
        this.storage = window.Firebase?.storage;
        this.isInitialized = false;
        this.trainingMatrix = new Map();
        this.trainingSessions = new Map();
        this.meetings = new Map();
        this.certificates = new Map();
        this.attendanceRecords = new Map();
        this.trainingModules = new Map();
        
        this.initializeTrainingManager();
    }

    async initializeTrainingManager() {
        try {
            console.log('🎓 Initializing Training & Meetings Manager...');
            
            // Load training modules and matrices
            await this.initializeTrainingModules();
            await this.loadTrainingMatrix();
            await this.loadTrainingSessions();
            await this.loadMeetings();
            
            // Set up real-time listeners
            this.setupRealTimeListeners();
            
            this.isInitialized = true;
            console.log('✅ Training & Meetings Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Training & Meetings Manager:', error);
        }
    }

    // Initialize comprehensive training modules
    async initializeTrainingModules() {
        const trainingModules = [
            {
                id: 'labor_standards',
                name: 'Labor Standards Training',
                category: 'compliance',
                description: 'Comprehensive training on labor standards and worker rights',
                duration: 120, // minutes
                targetAudience: ['all_workers', 'supervisors', 'managers', 'hr_staff'],
                requiredFrequency: 'annual',
                prerequisites: [],
                learningObjectives: [
                    'Understand basic labor rights and standards',
                    'Identify workplace violations',
                    'Know reporting procedures',
                    'Understand worker protection measures'
                ],
                content: [
                    {
                        section: 'Introduction to Labor Rights',
                        duration: 20,
                        topics: ['Basic worker rights', 'International labor standards', 'Cambodian labor law']
                    },
                    {
                        section: 'Working Hours and Overtime',
                        duration: 25,
                        topics: ['Standard working hours', 'Overtime regulations', 'Rest periods', 'Holiday pay']
                    },
                    {
                        section: 'Wages and Benefits',
                        duration: 30,
                        topics: ['Minimum wage', 'Payment methods', 'Benefits and allowances', 'Deductions']
                    },
                    {
                        section: 'Health and Safety',
                        duration: 25,
                        topics: ['Workplace safety', 'Personal protective equipment', 'Emergency procedures', 'Health monitoring']
                    },
                    {
                        section: 'Grievance Procedures',
                        duration: 20,
                        topics: ['Reporting violations', 'Grievance channels', 'Protection from retaliation', 'Resolution process']
                ],
                assessment: {
                    type: 'quiz',
                    passingScore: 80,
                    questions: [
                        {
                            question: 'What is the standard working week in Cambodia?',
                            options: ['40 hours', '44 hours', '48 hours', '50 hours'],
                            correctAnswer: 1
                        },
                        {
                            question: 'How often should safety training be conducted?',
                            options: ['Monthly', 'Quarterly', 'Annually', 'Every 2 years'],
                            correctAnswer: 2
                        }
                    ]
                },
                certificates: {
                    issueCertificate: true,
                    certificateTemplate: 'labor_standards_certificate',
                    validityPeriod: 365 // days
                }
            },
            {
                id: 'health_safety',
                name: 'Health and Safety Training',
                category: 'safety',
                description: 'Workplace health and safety training for all employees',
                duration: 90,
                targetAudience: ['all_workers', 'supervisors', 'managers', 'safety_officers'],
                requiredFrequency: 'annual',
                prerequisites: ['labor_standards'],
                learningObjectives: [
                    'Identify workplace hazards',
                    'Use personal protective equipment correctly',
                    'Follow emergency procedures',
                    'Report safety incidents'
                ],
                content: [
                    {
                        section: 'Workplace Hazards',
                        duration: 20,
                        topics: ['Physical hazards', 'Chemical hazards', 'Ergonomic hazards', 'Biological hazards']
                    },
                    {
                        section: 'Personal Protective Equipment',
                        duration: 25,
                        topics: ['PPE types and uses', 'Proper fitting and maintenance', 'When to use PPE', 'PPE limitations']
                    },
                    {
                        section: 'Emergency Procedures',
                        duration: 25,
                        topics: ['Fire safety', 'Evacuation procedures', 'First aid basics', 'Emergency contacts']
                    },
                    {
                        section: 'Incident Reporting',
                        duration: 20,
                        topics: ['Near misses', 'Injuries and illnesses', 'Reporting procedures', 'Investigation process']
                    }
                ],
                assessment: {
                    type: 'practical',
                    passingScore: 85,
                    practicalTests: [
                        'PPE fitting demonstration',
                        'Emergency procedure walkthrough',
                        'Hazard identification exercise'
                    ]
                },
                certificates: {
                    issueCertificate: true,
                    certificateTemplate: 'health_safety_certificate',
                    validityPeriod: 365
                }
            },
            {
                id: 'environmental_awareness',
                name: 'Environmental Awareness Training',
                category: 'environmental',
                description: 'Environmental protection and sustainability training',
                duration: 60,
                targetAudience: ['all_workers', 'supervisors', 'managers', 'environmental_officers'],
                requiredFrequency: 'annual',
                prerequisites: [],
                learningObjectives: [
                    'Understand environmental impacts',
                    'Follow waste management procedures',
                    'Conserve resources',
                    'Report environmental incidents'
                ],
                content: [
                    {
                        section: 'Environmental Impacts',
                        duration: 15,
                        topics: ['Air pollution', 'Water pollution', 'Waste generation', 'Resource consumption']
                    },
                    {
                        section: 'Waste Management',
                        duration: 20,
                        topics: ['Waste segregation', 'Recycling procedures', 'Hazardous waste handling', 'Waste reduction']
                    },
                    {
                        section: 'Resource Conservation',
                        duration: 15,
                        topics: ['Energy efficiency', 'Water conservation', 'Material efficiency', 'Sustainable practices']
                    },
                    {
                        section: 'Environmental Compliance',
                        duration: 10,
                        topics: ['Environmental regulations', 'Compliance requirements', 'Reporting obligations', 'Penalties']
                    }
                ],
                assessment: {
                    type: 'quiz',
                    passingScore: 75,
                    questions: [
                        {
                            question: 'What color bin is used for recyclable waste?',
                            options: ['Red', 'Blue', 'Green', 'Yellow'],
                            correctAnswer: 1
                        }
                    ]
                },
                certificates: {
                    issueCertificate: true,
                    certificateTemplate: 'environmental_certificate',
                    validityPeriod: 365
                }
            },
            {
                id: 'quality_management',
                name: 'Quality Management Training',
                category: 'quality',
                description: 'Quality control and management system training',
                duration: 150,
                targetAudience: ['supervisors', 'managers', 'quality_officers', 'production_staff'],
                requiredFrequency: 'annual',
                prerequisites: ['labor_standards'],
                learningObjectives: [
                    'Understand quality management principles',
                    'Follow quality control procedures',
                    'Use quality tools and techniques',
                    'Participate in continuous improvement'
                ],
                content: [
                    {
                        section: 'Quality Management Principles',
                        duration: 30,
                        topics: ['Customer focus', 'Leadership', 'Process approach', 'Continuous improvement']
                    },
                    {
                        section: 'Quality Control Procedures',
                        duration: 40,
                        topics: ['Inspection procedures', 'Testing methods', 'Acceptance criteria', 'Non-conformity handling']
                    },
                    {
                        section: 'Quality Tools',
                        duration: 40,
                        topics: ['Checklists', 'Flowcharts', 'Pareto charts', 'Control charts']
                    },
                    {
                        section: 'Continuous Improvement',
                        duration: 40,
                        topics: ['PDCA cycle', 'Root cause analysis', 'Corrective actions', 'Preventive actions']
                    }
                ],
                assessment: {
                    type: 'combined',
                    passingScore: 80,
                    quizQuestions: [
                        {
                            question: 'What does PDCA stand for?',
                            options: ['Plan, Do, Check, Act', 'Plan, Develop, Check, Act', 'Plan, Do, Control, Act', 'Plan, Develop, Control, Act'],
                            correctAnswer: 0
                        }
                    ],
                    practicalTests: [
                        'Quality inspection demonstration',
                        'Root cause analysis exercise'
                    ]
                },
                certificates: {
                    issueCertificate: true,
                    certificateTemplate: 'quality_management_certificate',
                    validityPeriod: 365
                }
            },
            {
                id: 'supervisor_skills',
                name: 'Supervisor Skills Training',
                category: 'leadership',
                description: 'Leadership and supervisory skills development',
                duration: 180,
                targetAudience: ['supervisors', 'managers', 'team_leaders'],
                requiredFrequency: 'biennial',
                prerequisites: ['labor_standards', 'health_safety'],
                learningObjectives: [
                    'Develop leadership skills',
                    'Manage team performance',
                    'Handle conflicts effectively',
                    'Motivate and engage employees'
                ],
                content: [
                    {
                        section: 'Leadership Fundamentals',
                        duration: 45,
                        topics: ['Leadership styles', 'Communication skills', 'Decision making', 'Problem solving']
                    },
                    {
                        section: 'Team Management',
                        duration: 45,
                        topics: ['Team building', 'Performance management', 'Goal setting', 'Feedback and coaching']
                    },
                    {
                        section: 'Conflict Resolution',
                        duration: 45,
                        topics: ['Conflict types', 'Resolution strategies', 'Mediation skills', 'Prevention techniques']
                    },
                    {
                        section: 'Employee Engagement',
                        duration: 45,
                        topics: ['Motivation theories', 'Recognition programs', 'Career development', 'Work-life balance']
                    }
                ],
                assessment: {
                    type: 'practical',
                    passingScore: 85,
                    practicalTests: [
                        'Leadership scenario role-play',
                        'Team management simulation',
                        'Conflict resolution demonstration'
                    ]
                },
                certificates: {
                    issueCertificate: true,
                    certificateTemplate: 'supervisor_skills_certificate',
                    validityPeriod: 730 // 2 years
                }
            }
        ];

        try {
            const batch = this.db.batch();
            
            trainingModules.forEach(module => {
                const docRef = this.db.collection('training_modules').doc(module.id);
                batch.set(docRef, {
                    ...module,
                    createdAt: this.db.FieldValue.serverTimestamp(),
                    updatedAt: this.db.FieldValue.serverTimestamp(),
                    isActive: true
                });
                
                this.trainingModules.set(module.id, module);
            });
            
            await batch.commit();
            console.log(`✅ Initialized ${trainingModules.length} training modules`);
            
        } catch (error) {
            console.error('❌ Error initializing training modules:', error);
        }
    }

    // Training Matrix Management
    async loadTrainingMatrix() {
        try {
            const matrixRef = this.db.collection('training_matrix');
            const snapshot = await matrixRef.get();
            
            snapshot.forEach(doc => {
                const matrix = { id: doc.id, ...doc.data() };
                this.trainingMatrix.set(matrix.id, matrix);
            });
            
            console.log(`📊 Loaded ${this.trainingMatrix.size} training matrix entries`);
        } catch (error) {
            console.error('❌ Error loading training matrix:', error);
        }
    }

    async createTrainingMatrix(factoryId, role, department) {
        try {
            const matrixId = `matrix_${factoryId}_${role}_${department}`;
            
            // Get required training for this role
            const requiredTraining = this.getRequiredTrainingForRole(role);
            
            const matrix = {
                id: matrixId,
                factoryId,
                role,
                department,
                requiredTraining,
                lastUpdated: new Date().toISOString(),
                nextReview: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)).toISOString() // 90 days
            };

            await this.db.collection('training_matrix').doc(matrixId).set(matrix);
            
            this.trainingMatrix.set(matrixId, matrix);
            console.log(`✅ Created training matrix for ${role} in ${department}`);
            
            return matrix;
        } catch (error) {
            console.error('❌ Error creating training matrix:', error);
            throw error;
        }
    }

    getRequiredTrainingForRole(role) {
        const roleTrainingMap = {
            'worker': ['labor_standards', 'health_safety', 'environmental_awareness'],
            'supervisor': ['labor_standards', 'health_safety', 'environmental_awareness', 'supervisor_skills'],
            'manager': ['labor_standards', 'health_safety', 'environmental_awareness', 'supervisor_skills', 'quality_management'],
            'hr_staff': ['labor_standards', 'health_safety', 'environmental_awareness', 'supervisor_skills'],
            'safety_officer': ['labor_standards', 'health_safety', 'environmental_awareness', 'supervisor_skills'],
            'quality_officer': ['labor_standards', 'health_safety', 'environmental_awareness', 'quality_management'],
            'environmental_officer': ['labor_standards', 'health_safety', 'environmental_awareness', 'quality_management']
        };
        
        return roleTrainingMap[role] || ['labor_standards', 'health_safety'];
    }

    // Training Session Management
    async loadTrainingSessions() {
        try {
            const sessionsRef = this.db.collection('training_sessions');
            const snapshot = await sessionsRef.get();
            
            snapshot.forEach(doc => {
                const session = { id: doc.id, ...doc.data() };
                this.trainingSessions.set(session.id, session);
            });
            
            console.log(`📚 Loaded ${this.trainingSessions.size} training sessions`);
        } catch (error) {
            console.error('❌ Error loading training sessions:', error);
        }
    }

    async createTrainingSession(sessionData) {
        try {
            const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const session = {
                id: sessionId,
                ...sessionData,
                status: 'scheduled',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                attendees: [],
                attendanceRecords: [],
                materials: [],
                assessments: []
            };

            await this.db.collection('training_sessions').doc(sessionId).set(session);
            
            this.trainingSessions.set(sessionId, session);
            console.log(`✅ Created training session: ${session.title}`);
            
            return session;
        } catch (error) {
            console.error('❌ Error creating training session:', error);
            throw error;
        }
    }

    async updateTrainingSession(sessionId, updates) {
        try {
            const sessionRef = this.db.collection('training_sessions').doc(sessionId);
            const sessionDoc = await sessionRef.get();
            
            if (!sessionDoc.exists) {
                throw new Error(`Training session ${sessionId} not found`);
            }
            
            const updatedSession = {
                ...sessionDoc.data(),
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            await sessionRef.update(updatedSession);
            
            this.trainingSessions.set(sessionId, updatedSession);
            console.log(`✅ Updated training session: ${updatedSession.title}`);
            
            return updatedSession;
        } catch (error) {
            console.error('❌ Error updating training session:', error);
            throw error;
        }
    }

    // Meeting Management
    async loadMeetings() {
        try {
            const meetingsRef = this.db.collection('meetings');
            const snapshot = await meetingsRef.get();
            
            snapshot.forEach(doc => {
                const meeting = { id: doc.id, ...doc.data() };
                this.meetings.set(meeting.id, meeting);
            });
            
            console.log(`🤝 Loaded ${this.meetings.size} meetings`);
        } catch (error) {
            console.error('❌ Error loading meetings:', error);
        }
    }

    async createMeeting(meetingData) {
        try {
            const meetingId = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const meeting = {
                id: meetingId,
                ...meetingData,
                status: 'scheduled',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                attendees: [],
                agenda: await this.generateAgenda(meetingData.type, meetingData.topics),
                minutes: null,
                actionItems: []
            };

            await this.db.collection('meetings').doc(meetingId).set(meeting);
            
            this.meetings.set(meetingId, meeting);
            console.log(`✅ Created meeting: ${meeting.title}`);
            
            return meeting;
        } catch (error) {
            console.error('❌ Error creating meeting:', error);
            throw error;
        }
    }

    async generateAgenda(meetingType, topics) {
        const agendaTemplates = {
            'safety_committee': [
                { item: 'Safety Incident Review', duration: 15, type: 'discussion' },
                { item: 'Safety Inspection Results', duration: 20, type: 'presentation' },
                { item: 'Safety Improvement Proposals', duration: 25, type: 'discussion' },
                { item: 'Action Items and Follow-up', duration: 10, type: 'action' }
            ],
            'quality_review': [
                { item: 'Quality Metrics Review', duration: 20, type: 'presentation' },
                { item: 'Non-conformity Analysis', duration: 25, type: 'discussion' },
                { item: 'Corrective Actions Status', duration: 20, type: 'update' },
                { item: 'Quality Improvement Initiatives', duration: 15, type: 'discussion' }
            ],
            'compliance_audit': [
                { item: 'Audit Findings Review', duration: 30, type: 'presentation' },
                { item: 'Compliance Gap Analysis', duration: 25, type: 'discussion' },
                { item: 'Corrective Action Planning', duration: 30, type: 'planning' },
                { item: 'Timeline and Responsibilities', duration: 15, type: 'action' }
            ],
            'general': [
                { item: 'Opening and Introductions', duration: 5, type: 'administrative' },
                { item: 'Previous Meeting Follow-up', duration: 10, type: 'update' },
                { item: 'Main Topics Discussion', duration: 30, type: 'discussion' },
                { item: 'Action Items and Next Steps', duration: 10, type: 'action' },
                { item: 'Meeting Close', duration: 5, type: 'administrative' }
            ]
        };

        const template = agendaTemplates[meetingType] || agendaTemplates.general;
        
        // Customize agenda with specific topics
        if (topics && topics.length > 0) {
            template.splice(2, 0, {
                item: topics.join(', '),
                duration: 20,
                type: 'discussion'
            });
        }

        return template;
    }

    // Attendance Management
    async recordAttendance(sessionId, attendeeData) {
        try {
            const attendanceId = `attendance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const attendance = {
                id: attendanceId,
                sessionId,
                ...attendeeData,
                recordedAt: new Date().toISOString(),
                status: 'present'
            };

            await this.db.collection('attendance_records').doc(attendanceId).set(attendance);
            
            // Update session attendance
            const sessionRef = this.db.collection('training_sessions').doc(sessionId);
            await sessionRef.update({
                attendees: this.db.FieldValue.arrayUnion(attendeeData.employeeId),
                attendanceRecords: this.db.FieldValue.arrayUnion(attendanceId)
            });
            
            this.attendanceRecords.set(attendanceId, attendance);
            console.log(`✅ Recorded attendance for ${attendeeData.employeeName}`);
            
            return attendance;
        } catch (error) {
            console.error('❌ Error recording attendance:', error);
            throw error;
        }
    }

    // Assessment and Certification
    async conductAssessment(sessionId, employeeId, assessmentData) {
        try {
            const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const assessment = {
                id: assessmentId,
                sessionId,
                employeeId,
                ...assessmentData,
                conductedAt: new Date().toISOString(),
                score: this.calculateScore(assessmentData.answers, assessmentData.moduleId),
                passed: this.checkPassingScore(assessmentData.answers, assessmentData.moduleId)
            };

            await this.db.collection('assessments').doc(assessmentId).set(assessment);
            
            // Issue certificate if passed
            if (assessment.passed) {
                await this.issueCertificate(employeeId, assessmentData.moduleId, sessionId);
            }
            
            console.log(`✅ Conducted assessment for employee ${employeeId}`);
            
            return assessment;
        } catch (error) {
            console.error('❌ Error conducting assessment:', error);
            throw error;
        }
    }

    calculateScore(answers, moduleId) {
        const module = this.trainingModules.get(moduleId);
        if (!module || !module.assessment) return 0;
        
        let correctAnswers = 0;
        const totalQuestions = module.assessment.questions.length;
        
        answers.forEach((answer, index) => {
            if (answer === module.assessment.questions[index].correctAnswer) {
                correctAnswers++;
            }
        });
        
        return Math.round((correctAnswers / totalQuestions) * 100);
    }

    checkPassingScore(answers, moduleId) {
        const module = this.trainingModules.get(moduleId);
        if (!module || !module.assessment) return false;
        
        const score = this.calculateScore(answers, moduleId);
        return score >= module.assessment.passingScore;
    }

    async issueCertificate(employeeId, moduleId, sessionId) {
        try {
            const certificateId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const module = this.trainingModules.get(moduleId);
            
            const certificate = {
                id: certificateId,
                employeeId,
                moduleId,
                sessionId,
                moduleName: module.name,
                issuedAt: new Date().toISOString(),
                validUntil: new Date(Date.now() + (module.certificates.validityPeriod * 24 * 60 * 60 * 1000)).toISOString(),
                certificateNumber: this.generateCertificateNumber(),
                status: 'active'
            };

            await this.db.collection('training_certificates').doc(certificateId).set(certificate);
            
            this.certificates.set(certificateId, certificate);
            console.log(`🏆 Issued certificate for ${module.name} to employee ${employeeId}`);
            
            return certificate;
        } catch (error) {
            console.error('❌ Error issuing certificate:', error);
            throw error;
        }
    }

    generateCertificateNumber() {
        const prefix = 'AC';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    // Utility Methods
    async getTrainingStatus(employeeId, factoryId) {
        try {
            const employee = await this.db.collection('users').doc(employeeId).get();
            if (!employee.exists) return null;
            
            const employeeData = employee.data();
            const role = employeeData.role;
            const department = employeeData.department;
            
            // Get training matrix for this role
            const matrixId = `matrix_${factoryId}_${role}_${department}`;
            const matrix = this.trainingMatrix.get(matrixId);
            
            if (!matrix) return null;
            
            // Get employee's training history
            const certificatesRef = this.db.collection('training_certificates')
                .where('employeeId', '==', employeeId);
            const certificatesSnapshot = await certificatesRef.get();
            
            const certificates = [];
            certificatesSnapshot.forEach(doc => {
                certificates.push({ id: doc.id, ...doc.data() });
            });
            
            // Check training status
            const trainingStatus = {};
            matrix.requiredTraining.forEach(moduleId => {
                const module = this.trainingModules.get(moduleId);
                const certificate = certificates.find(c => c.moduleId === moduleId && c.status === 'active');
                
                trainingStatus[moduleId] = {
                    moduleName: module.name,
                    required: true,
                    completed: !!certificate,
                    certificateId: certificate?.id,
                    validUntil: certificate?.validUntil,
                    nextDue: this.calculateNextDueDate(certificate, module.requiredFrequency)
                };
            });
            
            return {
                employeeId,
                role,
                department,
                trainingStatus,
                overallCompletion: this.calculateOverallCompletion(trainingStatus)
            };
        } catch (error) {
            console.error('❌ Error getting training status:', error);
            throw error;
        }
    }

    calculateNextDueDate(certificate, frequency) {
        if (!certificate) return new Date().toISOString();
        
        const validUntil = new Date(certificate.validUntil);
        const frequencyDays = {
            'monthly': 30,
            'quarterly': 90,
            'annual': 365,
            'biennial': 730
        };
        
        const days = frequencyDays[frequency] || 365;
        return new Date(validUntil.getTime() + (days * 24 * 60 * 60 * 1000)).toISOString();
    }

    calculateOverallCompletion(trainingStatus) {
        const required = Object.values(trainingStatus).filter(status => status.required).length;
        const completed = Object.values(trainingStatus).filter(status => status.completed).length;
        
        return required > 0 ? Math.round((completed / required) * 100) : 0;
    }

    setupRealTimeListeners() {
        // Listen for training session updates
        this.db.collection('training_sessions')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const session = { id: change.doc.id, ...change.doc.data() };
                        this.trainingSessions.set(session.id, session);
                    } else if (change.type === 'removed') {
                        this.trainingSessions.delete(change.doc.id);
                    }
                });
            });

        // Listen for meeting updates
        this.db.collection('meetings')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const meeting = { id: change.doc.id, ...change.doc.data() };
                        this.meetings.set(meeting.id, meeting);
                    } else if (change.type === 'removed') {
                        this.meetings.delete(change.doc.id);
                    }
                });
            });
    }

    // Public API Methods
    async getTrainingSessions(factoryId = null) {
        let sessions = Array.from(this.trainingSessions.values());
        
        if (factoryId) {
            sessions = sessions.filter(s => s.factoryId === factoryId);
        }
        
        return sessions;
    }

    async getMeetings(factoryId = null) {
        let meetings = Array.from(this.meetings.values());
        
        if (factoryId) {
            meetings = meetings.filter(m => m.factoryId === factoryId);
        }
        
        return meetings;
    }

    async getTrainingModules() {
        return Array.from(this.trainingModules.values());
    }

    async getCertificates(employeeId = null) {
        let certificates = Array.from(this.certificates.values());
        
        if (employeeId) {
            certificates = certificates.filter(c => c.employeeId === employeeId);
        }
        
        return certificates;
    }
}

// Initialize Training & Meetings Manager
window.trainingMeetingsManager = new TrainingMeetingsManager();
