// Training & Task Management System for Angkor Compliance Platform
// Implements comprehensive training and task management as outlined in the vision document

class TrainingTaskManagementSystem {
    constructor() {
        this.db = window.Firebase.db;
        this.storage = window.Firebase.storage;
        this.openAI = window.openAI;
        this.isInitialized = false;
        this.trainingMatrix = new Map();
        this.taskWorkflows = new Map();
        this.calendarEvents = new Map();
        
        this.initializeTrainingTaskSystem();
    }

    async initializeTrainingTaskSystem() {
        try {
            // Initialize training matrix
            await this.initializeTrainingMatrix();
            
            // Set up task workflows
            await this.setupTaskWorkflows();
            
            // Initialize calendar integration
            this.initializeCalendarIntegration();
            
            // Set up notification system
            this.setupNotificationSystem();
            
            console.log('✅ Training & Task Management System initialized');
            this.isInitialized = true;
        } catch (error) {
            console.error('❌ Error initializing Training & Task System:', error);
            this.isInitialized = false;
        }
    }

    // Training Matrix Initialization
    async initializeTrainingMatrix() {
        // Role-based training matrix
        this.trainingMatrix.set('super_admin', {
            role: 'super_admin',
            requiredTrainings: [
                {
                    id: 'compliance_overview',
                    name: 'Compliance Overview',
                    frequency: 'annual',
                    duration: '2 hours',
                    type: 'mandatory',
                    standards: ['all']
                },
                {
                    id: 'system_administration',
                    name: 'System Administration',
                    frequency: 'annual',
                    duration: '4 hours',
                    type: 'mandatory',
                    standards: ['all']
                }
            ]
        });

        this.trainingMatrix.set('factory_admin', {
            role: 'factory_admin',
            requiredTrainings: [
                {
                    id: 'factory_management',
                    name: 'Factory Management',
                    frequency: 'annual',
                    duration: '3 hours',
                    type: 'mandatory',
                    standards: ['smeta', 'higg', 'sa8000']
                },
                {
                    id: 'audit_preparation',
                    name: 'Audit Preparation',
                    frequency: 'annual',
                    duration: '2 hours',
                    type: 'mandatory',
                    standards: ['smeta', 'higg']
                }
            ]
        });

        this.trainingMatrix.set('hr_manager', {
            role: 'hr_manager',
            requiredTrainings: [
                {
                    id: 'labor_standards',
                    name: 'Labor Standards',
                    frequency: 'annual',
                    duration: '2 hours',
                    type: 'mandatory',
                    standards: ['smeta', 'sa8000']
                },
                {
                    id: 'grievance_management',
                    name: 'Grievance Management',
                    frequency: 'annual',
                    duration: '3 hours',
                    type: 'mandatory',
                    standards: ['smeta', 'sa8000']
                }
            ]
        });

        this.trainingMatrix.set('worker', {
            role: 'worker',
            requiredTrainings: [
                {
                    id: 'safety_training',
                    name: 'Safety Training',
                    frequency: 'annual',
                    duration: '1 hour',
                    type: 'mandatory',
                    standards: ['osh', 'iso_45001']
                },
                {
                    id: 'rights_awareness',
                    name: 'Worker Rights Awareness',
                    frequency: 'annual',
                    duration: '1 hour',
                    type: 'mandatory',
                    standards: ['smeta', 'sa8000']
                }
            ]
        });
    }

    // Task Workflow Setup
    async setupTaskWorkflows() {
        // CAP Task Workflow
        this.taskWorkflows.set('cap_execution', {
            id: 'cap_execution',
            name: 'CAP Execution Workflow',
            steps: [
                {
                    id: 'planning',
                    name: 'Planning Phase',
                    duration: '2 days',
                    dependencies: [],
                    assignee: 'factory_admin',
                    deliverables: ['action_plan', 'timeline', 'budget']
                },
                {
                    id: 'implementation',
                    name: 'Implementation Phase',
                    duration: 'variable',
                    dependencies: ['planning'],
                    assignee: 'responsible_party',
                    deliverables: ['implementation_evidence', 'progress_reports']
                },
                {
                    id: 'verification',
                    name: 'Verification Phase',
                    duration: '1 day',
                    dependencies: ['implementation'],
                    assignee: 'auditor',
                    deliverables: ['verification_report', 'effectiveness_assessment']
                }
            ]
        });

        // Audit Preparation Workflow
        this.taskWorkflows.set('audit_preparation', {
            id: 'audit_preparation',
            name: 'Audit Preparation Workflow',
            steps: [
                {
                    id: 'pre_audit_assessment',
                    name: 'Pre-Audit Assessment',
                    duration: '3 days',
                    dependencies: [],
                    assignee: 'factory_admin',
                    deliverables: ['gap_analysis', 'readiness_report']
                },
                {
                    id: 'evidence_collection',
                    name: 'Evidence Collection',
                    duration: '5 days',
                    dependencies: ['pre_audit_assessment'],
                    assignee: 'hr_manager',
                    deliverables: ['evidence_binder', 'documentation']
                },
                {
                    id: 'final_preparation',
                    name: 'Final Preparation',
                    duration: '2 days',
                    dependencies: ['evidence_collection'],
                    assignee: 'factory_admin',
                    deliverables: ['audit_binder', 'team_briefing']
                }
            ]
        });
    }

    // Training Management
    async createTrainingSession(trainingData, options = {}) {
        try {
            if (!this.isInitialized) {
                throw new Error('Training system not initialized');
            }

            // Validate training data
            const validatedData = await this.validateTrainingData(trainingData);
            
            // Generate training content if needed
            const content = await this.generateTrainingContent(validatedData);
            
            // Create training session
            const sessionData = await this.createTrainingSessionRecord(validatedData, content, options);
            
            // Schedule training
            await this.scheduleTraining(sessionData);
            
            // Send notifications
            await this.sendTrainingNotifications(sessionData);
            
            return {
                success: true,
                sessionId: sessionData.id,
                agenda: sessionData.agenda,
                participants: sessionData.participants,
                schedule: sessionData.schedule
            };
        } catch (error) {
            console.error('Error creating training session:', error);
            throw error;
        }
    }

    async generateTrainingContent(trainingData) {
        try {
            if (!this.openAI || !this.openAI.isConfigured) {
                throw new Error('OpenAI not configured for content generation');
            }

            const prompt = this.buildTrainingContentPrompt(trainingData);
            
            const response = await this.openAI.makeServerRequest('generateTrainingContent', {
                prompt,
                trainingData,
                options: {
                    duration: trainingData.duration,
                    audience: trainingData.audience,
                    standards: trainingData.standards
                }
            });

            return {
                agenda: response.agenda,
                materials: response.materials,
                quiz: response.quiz,
                certificate: response.certificate
            };
        } catch (error) {
            console.error('Error generating training content:', error);
            // Return default content
            return this.getDefaultTrainingContent(trainingData);
        }
    }

    async createTrainingSessionRecord(trainingData, content, options) {
        try {
            const sessionId = `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const sessionData = {
                id: sessionId,
                title: trainingData.title,
                type: trainingData.type,
                audience: trainingData.audience,
                duration: trainingData.duration,
                standards: trainingData.standards,
                content: content,
                schedule: this.generateTrainingSchedule(trainingData, options),
                participants: await this.getTrainingParticipants(trainingData.audience),
                status: 'scheduled',
                createdAt: new Date().toISOString(),
                metadata: {
                    language: options.language || 'en',
                    location: options.location || 'online',
                    maxParticipants: options.maxParticipants || 50
                }
            };

            // Store in Firestore
            await this.db.setDoc(
                this.db.doc(this.db.collection('training_sessions'), sessionId),
                sessionData
            );

            return sessionData;
        } catch (error) {
            console.error('Error creating training session record:', error);
            throw error;
        }
    }

    // Task Management
    async createTask(taskData, options = {}) {
        try {
            if (!this.isInitialized) {
                throw new Error('Task system not initialized');
            }

            // Validate task data
            const validatedData = await this.validateTaskData(taskData);
            
            // Create task record
            const taskRecord = await this.createTaskRecord(validatedData, options);
            
            // Apply workflow if specified
            if (taskData.workflowId) {
                await this.applyTaskWorkflow(taskRecord.id, taskData.workflowId);
            }
            
            // Assign task
            await this.assignTask(taskRecord.id, taskData.assignee);
            
            // Set up notifications
            await this.setupTaskNotifications(taskRecord);
            
            return {
                success: true,
                taskId: taskRecord.id,
                status: taskRecord.status,
                assignee: taskRecord.assignee,
                deadline: taskRecord.deadline
            };
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    async createTaskRecord(taskData, options) {
        try {
            const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const taskRecord = {
                id: taskId,
                title: taskData.title,
                description: taskData.description,
                type: taskData.type,
                priority: taskData.priority || 'medium',
                assignee: taskData.assignee,
                deadline: this.calculateDeadline(taskData.duration),
                status: 'pending',
                dependencies: taskData.dependencies || [],
                deliverables: taskData.deliverables || [],
                createdAt: new Date().toISOString(),
                metadata: {
                    linkedTo: taskData.linkedTo || null, // CAP, audit, etc.
                    estimatedEffort: taskData.estimatedEffort,
                    tags: taskData.tags || []
                }
            };

            // Store in Firestore
            await this.db.setDoc(
                this.db.doc(this.db.collection('tasks'), taskId),
                taskRecord
            );

            return taskRecord;
        } catch (error) {
            console.error('Error creating task record:', error);
            throw error;
        }
    }

    // Calendar Integration
    initializeCalendarIntegration() {
        // Set up calendar sync
        this.setupCalendarSync();
        
        // Set up holiday awareness
        this.setupHolidayAwareness();
        
        // Set up meeting scheduling
        this.setupMeetingScheduling();
    }

    async scheduleTraining(sessionData) {
        try {
            // Create calendar event
            const calendarEvent = {
                id: `event_${sessionData.id}`,
                title: sessionData.title,
                description: sessionData.content.agenda,
                startTime: sessionData.schedule.startTime,
                endTime: sessionData.schedule.endTime,
                attendees: sessionData.participants.map(p => p.email),
                location: sessionData.metadata.location,
                type: 'training'
            };

            // Add to calendar
            await this.addToCalendar(calendarEvent);
            
            // Send calendar invites
            await this.sendCalendarInvites(calendarEvent);
            
            console.log(`Training scheduled: ${sessionData.title}`);
        } catch (error) {
            console.error('Error scheduling training:', error);
            throw error;
        }
    }

    // Attendance Tracking
    async trackAttendance(sessionId, attendanceData) {
        try {
            const attendanceRecord = {
                sessionId,
                timestamp: new Date().toISOString(),
                participants: attendanceData.participants.map(p => ({
                    userId: p.userId,
                    status: p.status, // present, absent, late
                    checkInTime: p.checkInTime,
                    checkOutTime: p.checkOutTime
                })),
                totalParticipants: attendanceData.participants.length,
                presentCount: attendanceData.participants.filter(p => p.status === 'present').length
            };

            // Store attendance record
            await this.db.addDoc(
                this.db.collection('training_attendance'),
                attendanceRecord
            );

            // Update session record
            await this.db.updateDoc(
                this.db.doc(this.db.collection('training_sessions'), sessionId),
                {
                    attendance: attendanceRecord,
                    lastUpdated: new Date().toISOString()
                }
            );

            return attendanceRecord;
        } catch (error) {
            console.error('Error tracking attendance:', error);
            throw error;
        }
    }

    // Quiz and Assessment
    async conductQuiz(sessionId, quizData) {
        try {
            const quizRecord = {
                sessionId,
                quizId: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                questions: quizData.questions,
                participants: quizData.participants.map(p => ({
                    userId: p.userId,
                    answers: p.answers,
                    score: this.calculateQuizScore(p.answers, quizData.questions),
                    passed: this.calculateQuizScore(p.answers, quizData.questions) >= 70
                })),
                conductedAt: new Date().toISOString()
            };

            // Store quiz record
            await this.db.addDoc(
                this.db.collection('training_quizzes'),
                quizRecord
            );

            // Generate certificates for passing participants
            const passingParticipants = quizRecord.participants.filter(p => p.passed);
            for (const participant of passingParticipants) {
                await this.generateCertificate(sessionId, participant.userId);
            }

            return quizRecord;
        } catch (error) {
            console.error('Error conducting quiz:', error);
            throw error;
        }
    }

    // Certificate Generation
    async generateCertificate(sessionId, userId) {
        try {
            const sessionDoc = await this.db.getDoc(
                this.db.doc(this.db.collection('training_sessions'), sessionId)
            );
            
            const userDoc = await this.db.getDoc(
                this.db.doc(this.db.collection('users'), userId)
            );

            if (!sessionDoc.exists() || !userDoc.exists()) {
                throw new Error('Session or user not found');
            }

            const sessionData = sessionDoc.data();
            const userData = userDoc.data();

            const certificateData = {
                id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sessionId,
                userId,
                userName: userData.name,
                trainingTitle: sessionData.title,
                completionDate: new Date().toISOString(),
                validUntil: this.calculateCertificateValidity(sessionData.type),
                certificateNumber: this.generateCertificateNumber()
            };

            // Store certificate
            await this.db.addDoc(
                this.db.collection('training_certificates'),
                certificateData
            );

            // Generate PDF certificate
            const certificatePdf = await this.generateCertificatePDF(certificateData);
            
            // Store PDF in storage
            await this.storeCertificatePDF(certificateData.id, certificatePdf);

            return certificateData;
        } catch (error) {
            console.error('Error generating certificate:', error);
            throw error;
        }
    }

    // Helper Methods
    async validateTrainingData(data) {
        const required = ['title', 'type', 'audience', 'duration', 'standards'];
        
        for (const field of required) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate training types
        const validTypes = ['mandatory', 'optional', 'refresher'];
        if (!validTypes.includes(data.type)) {
            throw new Error(`Invalid training type: ${data.type}`);
        }

        return data;
    }

    async validateTaskData(data) {
        const required = ['title', 'description', 'type', 'assignee'];
        
        for (const field of required) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate task types
        const validTypes = ['cap', 'audit', 'training', 'maintenance', 'other'];
        if (!validTypes.includes(data.type)) {
            throw new Error(`Invalid task type: ${data.type}`);
        }

        return data;
    }

    buildTrainingContentPrompt(trainingData) {
        return `Generate comprehensive training content for the following training session:

Title: ${trainingData.title}
Type: ${trainingData.type}
Audience: ${trainingData.audience}
Duration: ${trainingData.duration}
Standards: ${trainingData.standards.join(', ')}

Please provide:
1. Detailed agenda with time allocation
2. Training materials and resources
3. Interactive quiz questions
4. Certificate template
5. Learning objectives

Focus on compliance standards and practical application.`;
    }

    getDefaultTrainingContent(trainingData) {
        return {
            agenda: [
                { time: '0:00', topic: 'Introduction', duration: '15 min' },
                { time: '0:15', topic: 'Main Content', duration: trainingData.duration },
                { time: 'end', topic: 'Q&A and Quiz', duration: '15 min' }
            ],
            materials: ['Presentation slides', 'Handouts', 'Reference materials'],
            quiz: [
                { question: 'What is the main objective of this training?', options: ['A', 'B', 'C', 'D'], correct: 'A' }
            ],
            certificate: 'Standard certificate template'
        };
    }

    generateTrainingSchedule(trainingData, options) {
        const startTime = options.startTime || new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
        const endTime = new Date(startTime.getTime() + this.parseDuration(trainingData.duration));
        
        return {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            timezone: options.timezone || 'Asia/Phnom_Penh'
        };
    }

    async getTrainingParticipants(audience) {
        // Get participants based on audience criteria
        const participantsQuery = this.db.query(
            this.db.collection('users'),
            this.db.where('role', '==', audience)
        );
        
        const participantsSnapshot = await this.db.getDocs(participantsQuery);
        return participantsSnapshot.docs.map(doc => ({
            userId: doc.id,
            ...doc.data()
        }));
    }

    calculateDeadline(duration) {
        const durationMs = this.parseDuration(duration);
        return new Date(Date.now() + durationMs).toISOString();
    }

    parseDuration(duration) {
        // Parse duration string like "2 days", "3 hours", etc.
        const match = duration.match(/(\d+)\s*(\w+)/);
        if (!match) return 24 * 60 * 60 * 1000; // Default 1 day
        
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        
        const multipliers = {
            'day': 24 * 60 * 60 * 1000,
            'days': 24 * 60 * 60 * 1000,
            'hour': 60 * 60 * 1000,
            'hours': 60 * 60 * 1000,
            'week': 7 * 24 * 60 * 60 * 1000,
            'weeks': 7 * 24 * 60 * 60 * 1000
        };
        
        return value * (multipliers[unit] || 24 * 60 * 60 * 1000);
    }

    calculateQuizScore(answers, questions) {
        let correct = 0;
        let total = questions.length;
        
        for (let i = 0; i < questions.length; i++) {
            if (answers[i] === questions[i].correct) {
                correct++;
            }
        }
        
        return Math.round((correct / total) * 100);
    }

    calculateCertificateValidity(trainingType) {
        const validityPeriods = {
            'mandatory': 365 * 24 * 60 * 60 * 1000, // 1 year
            'optional': 730 * 24 * 60 * 60 * 1000, // 2 years
            'refresher': 180 * 24 * 60 * 60 * 1000 // 6 months
        };
        
        const validityMs = validityPeriods[trainingType] || validityPeriods.mandatory;
        return new Date(Date.now() + validityMs).toISOString();
    }

    generateCertificateNumber() {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `CERT-${timestamp}-${random}`;
    }

    // Placeholder methods for integrations
    async addToCalendar(event) {
        // Implementation for calendar integration
        console.log('Calendar event added:', event);
    }

    async sendCalendarInvites(event) {
        // Implementation for sending calendar invites
        console.log('Calendar invites sent for:', event.title);
    }

    async sendTrainingNotifications(sessionData) {
        // Implementation for training notifications
        console.log('Training notifications sent for:', sessionData.title);
    }

    async assignTask(taskId, assignee) {
        // Implementation for task assignment
        console.log('Task assigned:', taskId, 'to:', assignee);
    }

    async setupTaskNotifications(taskRecord) {
        // Implementation for task notifications
        console.log('Task notifications set up for:', taskRecord.title);
    }

    async applyTaskWorkflow(taskId, workflowId) {
        // Implementation for applying task workflow
        console.log('Workflow applied to task:', taskId);
    }

    async generateCertificatePDF(certificateData) {
        // Implementation for PDF generation
        return 'certificate_pdf_data';
    }

    async storeCertificatePDF(certificateId, pdfData) {
        // Implementation for storing PDF
        console.log('Certificate PDF stored:', certificateId);
    }

    setupCalendarSync() {
        // Implementation for calendar sync
    }

    setupHolidayAwareness() {
        // Implementation for holiday awareness
    }

    setupMeetingScheduling() {
        // Implementation for meeting scheduling
    }

    setupNotificationSystem() {
        // Implementation for notification system
    }
}

// Initialize the Training & Task Management System globally
window.TrainingTaskManagement = new TrainingTaskManagementSystem();
