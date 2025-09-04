/**
 * Training Management System - Phase 3
 * Implements training matrix, agenda generator, attendance capture, certificate issuance
 * Based on Enterprise Blueprint (v2) Section D.8
 */

class TrainingManagementSystem {
    constructor() {
        this.db = window.Firebase.db;
        this.storage = window.Firebase.storage;
        this.currentUser = null;
        this.currentFactory = null;
    }

    async initialize(user, factoryId) {
        this.currentUser = user;
        this.currentFactory = factoryId;
        console.log('✅ Training Management System initialized');
    }

    // Training Matrix Management
    async createTrainingMatrix(matrixData) {
        try {
            const matrix = {
                id: this.generateId(),
                factoryId: this.currentFactory,
                name: matrixData.name,
                description: matrixData.description,
                roles: matrixData.roles || [],
                departments: matrixData.departments || [],
                standards: matrixData.standards || [],
                trainingRequirements: matrixData.trainingRequirements || [],
                refresherRules: matrixData.refresherRules || {},
                createdBy: this.currentUser.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'active'
            };

            await this.db.collection('training_matrices').doc(matrix.id).set(matrix);
            return { success: true, matrixId: matrix.id };
        } catch (error) {
            console.error('Error creating training matrix:', error);
            throw error;
        }
    }

    async getTrainingMatrix(matrixId) {
        try {
            const doc = await this.db.collection('training_matrices').doc(matrixId).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting training matrix:', error);
            throw error;
        }
    }

    async updateTrainingMatrix(matrixId, updates) {
        try {
            updates.updatedAt = new Date();
            await this.db.collection('training_matrices').doc(matrixId).update(updates);
            return { success: true };
        } catch (error) {
            console.error('Error updating training matrix:', error);
            throw error;
        }
    }

    // Training Session Management
    async createTrainingSession(sessionData) {
        try {
            const session = {
                id: this.generateId(),
                factoryId: this.currentFactory,
                title: sessionData.title,
                description: sessionData.description,
                type: sessionData.type, // 'initial', 'refresher', 'specialized'
                category: sessionData.category, // 'safety', 'compliance', 'technical', 'soft_skills'
                standards: sessionData.standards || [],
                targetRoles: sessionData.targetRoles || [],
                targetDepartments: sessionData.targetDepartments || [],
                duration: sessionData.duration, // in minutes
                maxParticipants: sessionData.maxParticipants || 50,
                prerequisites: sessionData.prerequisites || [],
                materials: sessionData.materials || [],
                createdBy: this.currentUser.id,
                createdAt: new Date(),
                status: 'draft'
            };

            await this.db.collection('training_sessions').doc(session.id).set(session);
            return { success: true, sessionId: session.id };
        } catch (error) {
            console.error('Error creating training session:', error);
            throw error;
        }
    }

    // Agenda Generator
    async generateAgenda(sessionId, options = {}) {
        try {
            const session = await this.db.collection('training_sessions').doc(sessionId).get();
            if (!session.exists) throw new Error('Training session not found');

            const sessionData = session.data();
            const agenda = {
                id: this.generateId(),
                sessionId: sessionId,
                factoryId: this.currentFactory,
                title: `${sessionData.title} - Agenda`,
                duration: sessionData.duration,
                sections: this.generateAgendaSections(sessionData, options),
                breaks: this.calculateBreaks(sessionData.duration),
                materials: sessionData.materials,
                objectives: options.objectives || [],
                createdBy: this.currentUser.id,
                createdAt: new Date()
            };

            await this.db.collection('training_agendas').doc(agenda.id).set(agenda);
            return { success: true, agendaId: agenda.id, agenda };
        } catch (error) {
            console.error('Error generating agenda:', error);
            throw error;
        }
    }

    generateAgendaSections(sessionData, options) {
        const sections = [];
        const totalDuration = sessionData.duration;
        
        // Introduction (10% of total time)
        sections.push({
            title: 'Introduction & Objectives',
            duration: Math.round(totalDuration * 0.1),
            type: 'presentation',
            content: 'Session overview, learning objectives, and participant introductions'
        });

        // Main content (70% of total time)
        const mainContentDuration = Math.round(totalDuration * 0.7);
        const mainSections = Math.ceil(mainContentDuration / 30); // 30-minute sections

        for (let i = 1; i <= mainSections; i++) {
            sections.push({
                title: `Module ${i}: ${this.getModuleTitle(sessionData.category, i)}`,
                duration: Math.min(30, mainContentDuration - (i - 1) * 30),
                type: 'interactive',
                content: this.getModuleContent(sessionData.category, i)
            });
        }

        // Assessment/Quiz (10% of total time)
        sections.push({
            title: 'Knowledge Assessment',
            duration: Math.round(totalDuration * 0.1),
            type: 'assessment',
            content: 'Quiz or practical assessment to verify understanding'
        });

        // Conclusion (10% of total time)
        sections.push({
            title: 'Summary & Next Steps',
            duration: Math.round(totalDuration * 0.1),
            type: 'discussion',
            content: 'Key takeaways, action items, and follow-up activities'
        });

        return sections;
    }

    getModuleTitle(category, moduleNumber) {
        const titles = {
            safety: ['Safety Fundamentals', 'Hazard Identification', 'Emergency Procedures', 'PPE Requirements'],
            compliance: ['Regulatory Overview', 'Policy Requirements', 'Documentation Standards', 'Audit Preparation'],
            technical: ['Technical Procedures', 'Equipment Operation', 'Quality Standards', 'Troubleshooting'],
            soft_skills: ['Communication Skills', 'Team Collaboration', 'Problem Solving', 'Leadership Development']
        };
        
        const categoryTitles = titles[category] || titles.compliance;
        return categoryTitles[(moduleNumber - 1) % categoryTitles.length];
    }

    getModuleContent(category, moduleNumber) {
        const content = {
            safety: 'Safety protocols, risk assessment, and emergency response procedures',
            compliance: 'Regulatory requirements, compliance frameworks, and audit preparation',
            technical: 'Technical procedures, equipment operation, and quality control measures',
            soft_skills: 'Communication techniques, teamwork strategies, and leadership principles'
        };
        
        return content[category] || content.compliance;
    }

    calculateBreaks(duration) {
        const breaks = [];
        if (duration > 120) { // 2+ hours
            breaks.push({
                type: 'break',
                duration: 15,
                position: Math.round(duration * 0.5) // Middle of session
            });
        }
        if (duration > 240) { // 4+ hours
            breaks.push({
                type: 'lunch',
                duration: 30,
                position: Math.round(duration * 0.5)
            });
        }
        return breaks;
    }

    // Attendance Management
    async createAttendanceRecord(sessionId, participants) {
        try {
            const record = {
                id: this.generateId(),
                sessionId: sessionId,
                factoryId: this.currentFactory,
                participants: participants.map(p => ({
                    userId: p.userId,
                    name: p.name,
                    role: p.role,
                    department: p.department,
                    status: 'registered', // registered, attended, absent, excused
                    checkInTime: null,
                    checkOutTime: null,
                    quizScore: null,
                    certificateIssued: false
                })),
                totalParticipants: participants.length,
                attendedCount: 0,
                absentCount: 0,
                createdBy: this.currentUser.id,
                createdAt: new Date(),
                status: 'active'
            };

            await this.db.collection('attendance_records').doc(record.id).set(record);
            return { success: true, recordId: record.id };
        } catch (error) {
            console.error('Error creating attendance record:', error);
            throw error;
        }
    }

    async updateAttendance(recordId, userId, status, quizScore = null) {
        try {
            const recordRef = this.db.collection('attendance_records').doc(recordId);
            const record = await recordRef.get();
            
            if (!record.exists) throw new Error('Attendance record not found');

            const recordData = record.data();
            const participant = recordData.participants.find(p => p.userId === userId);
            
            if (!participant) throw new Error('Participant not found');

            // Update participant status
            participant.status = status;
            if (status === 'attended') {
                participant.checkInTime = new Date();
            }
            if (quizScore !== null) {
                participant.quizScore = quizScore;
            }

            // Update counts
            const attendedCount = recordData.participants.filter(p => p.status === 'attended').length;
            const absentCount = recordData.participants.filter(p => p.status === 'absent').length;

            await recordRef.update({
                participants: recordData.participants,
                attendedCount,
                absentCount,
                updatedAt: new Date()
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating attendance:', error);
            throw error;
        }
    }

    // Certificate Management
    async generateCertificate(recordId, userId) {
        try {
            const recordRef = this.db.collection('attendance_records').doc(recordId);
            const record = await recordRef.get();
            
            if (!record.exists) throw new Error('Attendance record not found');

            const recordData = record.data();
            const participant = recordData.participants.find(p => p.userId === userId);
            
            if (!participant) throw new Error('Participant not found');
            if (participant.status !== 'attended') throw new Error('Participant did not attend the session');

            // Get session details
            const session = await this.db.collection('training_sessions').doc(recordData.sessionId).get();
            const sessionData = session.data();

            const certificate = {
                id: this.generateId(),
                recordId: recordId,
                sessionId: recordData.sessionId,
                userId: userId,
                participantName: participant.name,
                sessionTitle: sessionData.title,
                sessionType: sessionData.type,
                sessionCategory: sessionData.category,
                completionDate: new Date(),
                validUntil: this.calculateExpiryDate(sessionData.category),
                certificateNumber: this.generateCertificateNumber(),
                issuedBy: this.currentUser.id,
                issuedAt: new Date(),
                status: 'active'
            };

            await this.db.collection('certificates').doc(certificate.id).set(certificate);

            // Update participant record
            participant.certificateIssued = true;
            await recordRef.update({
                participants: recordData.participants,
                updatedAt: new Date()
            });

            return { success: true, certificateId: certificate.id, certificate };
        } catch (error) {
            console.error('Error generating certificate:', error);
            throw error;
        }
    }

    calculateExpiryDate(category) {
        const expiryMonths = {
            safety: 12,
            compliance: 24,
            technical: 18,
            soft_skills: 36
        };
        
        const months = expiryMonths[category] || 24;
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + months);
        return expiryDate;
    }

    generateCertificateNumber() {
        const prefix = 'CERT';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    // Quiz/Assessment Management
    async createQuiz(sessionId, questions) {
        try {
            const quiz = {
                id: this.generateId(),
                sessionId: sessionId,
                factoryId: this.currentFactory,
                questions: questions.map((q, index) => ({
                    id: index + 1,
                    question: q.question,
                    type: q.type, // 'multiple_choice', 'true_false', 'short_answer'
                    options: q.options || [],
                    correctAnswer: q.correctAnswer,
                    points: q.points || 1
                })),
                totalPoints: questions.reduce((sum, q) => sum + (q.points || 1), 0),
                passingScore: Math.round(questions.reduce((sum, q) => sum + (q.points || 1), 0) * 0.7), // 70%
                timeLimit: 30, // minutes
                createdBy: this.currentUser.id,
                createdAt: new Date(),
                status: 'active'
            };

            await this.db.collection('training_quizzes').doc(quiz.id).set(quiz);
            return { success: true, quizId: quiz.id };
        } catch (error) {
            console.error('Error creating quiz:', error);
            throw error;
        }
    }

    async submitQuizAnswers(quizId, userId, answers) {
        try {
            const quizRef = this.db.collection('training_quizzes').doc(quizId);
            const quiz = await quizRef.get();
            
            if (!quiz.exists) throw new Error('Quiz not found');

            const quizData = quiz.data();
            let score = 0;
            const results = [];

            // Grade answers
            quizData.questions.forEach(question => {
                const userAnswer = answers[question.id];
                const isCorrect = this.gradeAnswer(question, userAnswer);
                
                if (isCorrect) {
                    score += question.points;
                }

                results.push({
                    questionId: question.id,
                    userAnswer,
                    correctAnswer: question.correctAnswer,
                    isCorrect,
                    points: isCorrect ? question.points : 0
                });
            });

            const passed = score >= quizData.passingScore;

            const submission = {
                id: this.generateId(),
                quizId: quizId,
                userId: userId,
                answers: answers,
                results: results,
                score: score,
                totalPoints: quizData.totalPoints,
                percentage: Math.round((score / quizData.totalPoints) * 100),
                passed: passed,
                submittedAt: new Date()
            };

            await this.db.collection('quiz_submissions').doc(submission.id).set(submission);
            return { success: true, submissionId: submission.id, submission };
        } catch (error) {
            console.error('Error submitting quiz answers:', error);
            throw error;
        }
    }

    gradeAnswer(question, userAnswer) {
        switch (question.type) {
            case 'multiple_choice':
            case 'true_false':
                return userAnswer === question.correctAnswer;
            case 'short_answer':
                return userAnswer.toLowerCase().includes(question.correctAnswer.toLowerCase());
            default:
                return false;
        }
    }

    // Utility Methods
    generateId() {
        return 'train_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async getTrainingSessions(filters = {}) {
        try {
            let query = this.db.collection('training_sessions')
                .where('factoryId', '==', this.currentFactory);

            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }
            if (filters.category) {
                query = query.where('category', '==', filters.category);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting training sessions:', error);
            throw error;
        }
    }

    async getAttendanceRecords(sessionId = null) {
        try {
            let query = this.db.collection('attendance_records')
                .where('factoryId', '==', this.currentFactory);

            if (sessionId) {
                query = query.where('sessionId', '==', sessionId);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting attendance records:', error);
            throw error;
        }
    }

    async getCertificates(userId = null) {
        try {
            let query = this.db.collection('certificates')
                .where('status', '==', 'active');

            if (userId) {
                query = query.where('userId', '==', userId);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting certificates:', error);
            throw error;
        }
    }
}

window.TrainingManagementSystem = TrainingManagementSystem;

