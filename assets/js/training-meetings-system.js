// Training & Meetings System for Angkor Compliance v2
// Implements comprehensive training management with agenda generation and attendance tracking

class TrainingMeetingsSystem {
    constructor() {
        this.db = window.Firebase?.db;
        this.trainings = new Map();
        this.meetings = new Map();
        this.trainingMatrix = new Map();
        this.certificates = new Map();
        this.attendance = new Map();
        this.isInitialized = false;
        
        this.initializeTrainingSystem();
    }

    async initializeTrainingSystem() {
        try {
            console.log('🎓 Initializing Training & Meetings System...');
            
            // Load all training data
            await Promise.all([
                this.loadTrainings(),
                this.loadMeetings(),
                this.loadTrainingMatrix(),
                this.loadCertificates(),
                this.loadAttendance()
            ]);
            
            this.isInitialized = true;
            console.log('✅ Training & Meetings System initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Training & Meetings System:', error);
            this.isInitialized = false;
        }
    }

    async loadTrainings() {
        try {
            const trainingsSnapshot = await this.db.collection('trainings').get();
            trainingsSnapshot.forEach(doc => {
                const training = { id: doc.id, ...doc.data() };
                this.trainings.set(training.id, training);
            });
            console.log(`📋 Loaded ${this.trainings.size} trainings`);
        } catch (error) {
            console.error('Error loading trainings:', error);
        }
    }

    async loadMeetings() {
        try {
            const meetingsSnapshot = await this.db.collection('meetings').get();
            meetingsSnapshot.forEach(doc => {
                const meeting = { id: doc.id, ...doc.data() };
                this.meetings.set(meeting.id, meeting);
            });
            console.log(`📋 Loaded ${this.meetings.size} meetings`);
        } catch (error) {
            console.error('Error loading meetings:', error);
        }
    }

    async loadTrainingMatrix() {
        try {
            const matrixSnapshot = await this.db.collection('training_matrix').get();
            matrixSnapshot.forEach(doc => {
                const matrix = { id: doc.id, ...doc.data() };
                this.trainingMatrix.set(matrix.id, matrix);
            });
            console.log(`📋 Loaded ${this.trainingMatrix.size} training matrix entries`);
        } catch (error) {
            console.error('Error loading training matrix:', error);
        }
    }

    async loadCertificates() {
        try {
            const certificatesSnapshot = await this.db.collection('training_certificates').get();
            certificatesSnapshot.forEach(doc => {
                const certificate = { id: doc.id, ...doc.data() };
                this.certificates.set(certificate.id, certificate);
            });
            console.log(`📋 Loaded ${this.certificates.size} certificates`);
        } catch (error) {
            console.error('Error loading certificates:', error);
        }
    }

    async loadAttendance() {
        try {
            const attendanceSnapshot = await this.db.collection('attendance').get();
            attendanceSnapshot.forEach(doc => {
                const attendance = { id: doc.id, ...doc.data() };
                this.attendance.set(attendance.id, attendance);
            });
            console.log(`📋 Loaded ${this.attendance.size} attendance records`);
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    }

    // Training Management Methods
    async createTraining(trainingData) {
        try {
            const training = {
                id: `training_${Date.now()}`,
                ...trainingData,
                status: 'scheduled',
                createdAt: new Date(),
                updatedAt: new Date(),
                attendees: [],
                materials: [],
                quizzes: []
            };

            await this.db.collection('trainings').doc(training.id).set(training);
            this.trainings.set(training.id, training);
            
            console.log(`✅ Created training: ${training.title}`);
            return training;
        } catch (error) {
            console.error('Error creating training:', error);
            throw error;
        }
    }

    async updateTraining(trainingId, updates) {
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            await this.db.collection('trainings').doc(trainingId).update(updateData);
            
            const training = this.trainings.get(trainingId);
            if (training) {
                Object.assign(training, updateData);
            }
            
            console.log(`✅ Updated training: ${trainingId}`);
        } catch (error) {
            console.error('Error updating training:', error);
            throw error;
        }
    }

    // Meeting Management Methods
    async createMeeting(meetingData) {
        try {
            const meeting = {
                id: `meeting_${Date.now()}`,
                ...meetingData,
                status: 'scheduled',
                createdAt: new Date(),
                updatedAt: new Date(),
                attendees: [],
                agenda: [],
                minutes: null
            };

            // Generate agenda if not provided
            if (!meeting.agenda || meeting.agenda.length === 0) {
                meeting.agenda = await this.generateAgenda(meeting.type, meeting.purpose);
            }

            await this.db.collection('meetings').doc(meeting.id).set(meeting);
            this.meetings.set(meeting.id, meeting);
            
            console.log(`✅ Created meeting: ${meeting.title}`);
            return meeting;
        } catch (error) {
            console.error('Error creating meeting:', error);
            throw error;
        }
    }

    async generateAgenda(meetingType, purpose) {
        const agendaTemplates = {
            'compliance_review': [
                'Review of current compliance status',
                'Discussion of recent audit findings',
                'Action items and follow-ups',
                'Next steps and deadlines',
                'Open discussion and questions'
            ],
            'safety_meeting': [
                'Safety incident review',
                'Safety procedure updates',
                'Equipment and facility safety',
                'Emergency procedures review',
                'Safety training updates'
            ],
            'grievance_committee': [
                'Case review and updates',
                'Investigation progress',
                'Resolution planning',
                'Policy and procedure updates',
                'Committee member updates'
            ],
            'training_planning': [
                'Training needs assessment',
                'Training schedule review',
                'Resource allocation',
                'Evaluation and feedback',
                'Future training planning'
            ],
            'general': [
                'Opening and introductions',
                'Review of previous minutes',
                'Main discussion topics',
                'Action items and assignments',
                'Next meeting scheduling'
            ]
        };

        return agendaTemplates[meetingType] || agendaTemplates['general'];
    }

    // Training Matrix Methods
    async createTrainingMatrix(matrixData) {
        try {
            const matrix = {
                id: `matrix_${Date.now()}`,
                ...matrixData,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.db.collection('training_matrix').doc(matrix.id).set(matrix);
            this.trainingMatrix.set(matrix.id, matrix);
            
            console.log(`✅ Created training matrix: ${matrix.role}`);
            return matrix;
        } catch (error) {
            console.error('Error creating training matrix:', error);
            throw error;
        }
    }

    async getRequiredTrainings(role, department) {
        try {
            const requiredTrainings = Array.from(this.trainingMatrix.values())
                .filter(matrix => 
                    matrix.role === role && 
                    (matrix.department === department || matrix.department === 'all')
                );

            return requiredTrainings.map(matrix => ({
                role: matrix.role,
                department: matrix.department,
                requiredTrainings: matrix.requiredTrainings,
                frequency: matrix.frequency,
                validityPeriod: matrix.validityPeriod
            }));
        } catch (error) {
            console.error('Error getting required trainings:', error);
            return [];
        }
    }

    async checkTrainingCompliance(userId, role, department) {
        try {
            const requiredTrainings = await this.getRequiredTrainings(role, department);
            const userCertificates = Array.from(this.certificates.values())
                .filter(cert => cert.userId === userId);

            const compliance = {
                userId: userId,
                role: role,
                department: department,
                requiredTrainings: requiredTrainings,
                completedTrainings: [],
                missingTrainings: [],
                complianceScore: 0,
                lastUpdated: new Date()
            };

            // Check each required training
            requiredTrainings.forEach(reqTraining => {
                reqTraining.requiredTrainings.forEach(training => {
                    const certificate = userCertificates.find(cert => 
                        cert.trainingId === training.trainingId &&
                        this.isCertificateValid(cert, training.validityPeriod)
                    );

                    if (certificate) {
                        compliance.completedTrainings.push({
                            trainingId: training.trainingId,
                            trainingName: training.trainingName,
                            completedAt: certificate.issuedAt,
                            expiresAt: certificate.expiresAt
                        });
                    } else {
                        compliance.missingTrainings.push({
                            trainingId: training.trainingId,
                            trainingName: training.trainingName,
                            requiredBy: training.requiredBy
                        });
                    }
                });
            });

            // Calculate compliance score
            const totalRequired = compliance.completedTrainings.length + compliance.missingTrainings.length;
            compliance.complianceScore = totalRequired > 0 ? 
                Math.round((compliance.completedTrainings.length / totalRequired) * 100) : 100;

            return compliance;
        } catch (error) {
            console.error('Error checking training compliance:', error);
            throw error;
        }
    }

    isCertificateValid(certificate, validityPeriod) {
        if (!certificate.expiresAt) return true;
        
        const expiryDate = certificate.expiresAt.toDate ? 
            certificate.expiresAt.toDate() : new Date(certificate.expiresAt);
        
        return expiryDate > new Date();
    }

    // Attendance Management Methods
    async recordAttendance(eventId, eventType, attendees) {
        try {
            const attendanceRecord = {
                id: `attendance_${Date.now()}`,
                eventId: eventId,
                eventType: eventType, // 'training' or 'meeting'
                attendees: attendees.map(attendee => ({
                    userId: attendee.userId,
                    name: attendee.name,
                    role: attendee.role,
                    department: attendee.department,
                    checkInTime: new Date(),
                    checkOutTime: null,
                    status: 'present'
                })),
                recordedAt: new Date(),
                recordedBy: attendees[0]?.recordedBy || 'system'
            };

            await this.db.collection('attendance').doc(attendanceRecord.id).set(attendanceRecord);
            this.attendance.set(attendanceRecord.id, attendanceRecord);
            
            console.log(`✅ Recorded attendance for ${attendees.length} attendees`);
            return attendanceRecord;
        } catch (error) {
            console.error('Error recording attendance:', error);
            throw error;
        }
    }

    async updateAttendanceStatus(attendanceId, userId, status, checkOutTime = null) {
        try {
            const attendance = this.attendance.get(attendanceId);
            if (!attendance) {
                throw new Error(`Attendance record not found: ${attendanceId}`);
            }

            const attendee = attendance.attendees.find(a => a.userId === userId);
            if (!attendee) {
                throw new Error(`Attendee not found: ${userId}`);
            }

            attendee.status = status;
            if (checkOutTime) {
                attendee.checkOutTime = new Date(checkOutTime);
            }

            attendance.updatedAt = new Date();

            await this.db.collection('attendance').doc(attendanceId).update(attendance);
            
            console.log(`✅ Updated attendance status for user ${userId}`);
            return attendance;
        } catch (error) {
            console.error('Error updating attendance status:', error);
            throw error;
        }
    }

    // Certificate Management Methods
    async issueCertificate(certificateData) {
        try {
            const certificate = {
                id: `certificate_${Date.now()}`,
                ...certificateData,
                issuedAt: new Date(),
                expiresAt: this.calculateExpiryDate(certificateData.validityPeriod),
                status: 'active',
                certificateNumber: this.generateCertificateNumber()
            };

            await this.db.collection('training_certificates').doc(certificate.id).set(certificate);
            this.certificates.set(certificate.id, certificate);
            
            console.log(`✅ Issued certificate: ${certificate.certificateNumber}`);
            return certificate;
        } catch (error) {
            console.error('Error issuing certificate:', error);
            throw error;
        }
    }

    calculateExpiryDate(validityPeriod) {
        const expiryDate = new Date();
        
        switch (validityPeriod) {
            case '1_year':
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                break;
            case '2_years':
                expiryDate.setFullYear(expiryDate.getFullYear() + 2);
                break;
            case '3_years':
                expiryDate.setFullYear(expiryDate.getFullYear() + 3);
                break;
            case '6_months':
                expiryDate.setMonth(expiryDate.getMonth() + 6);
                break;
            case 'never':
                return null;
            default:
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }
        
        return expiryDate;
    }

    generateCertificateNumber() {
        const prefix = 'CERT';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    // Quiz and Assessment Methods
    async createQuiz(quizData) {
        try {
            const quiz = {
                id: `quiz_${Date.now()}`,
                ...quizData,
                createdAt: new Date(),
                updatedAt: new Date(),
                attempts: [],
                passingScore: quizData.passingScore || 70
            };

            await this.db.collection('training_quizzes').doc(quiz.id).set(quiz);
            
            console.log(`✅ Created quiz: ${quiz.title}`);
            return quiz;
        } catch (error) {
            console.error('Error creating quiz:', error);
            throw error;
        }
    }

    async submitQuizAttempt(quizId, userId, answers) {
        try {
            const quiz = await this.db.collection('training_quizzes').doc(quizId).get();
            if (!quiz.exists) {
                throw new Error(`Quiz not found: ${quizId}`);
            }

            const quizData = quiz.data();
            const score = this.calculateQuizScore(quizData.questions, answers);
            const passed = score >= quizData.passingScore;

            const attempt = {
                id: `attempt_${Date.now()}`,
                quizId: quizId,
                userId: userId,
                answers: answers,
                score: score,
                passed: passed,
                submittedAt: new Date()
            };

            await this.db.collection('quiz_attempts').add(attempt);
            
            console.log(`✅ Quiz attempt submitted: ${score}% - ${passed ? 'PASSED' : 'FAILED'}`);
            return attempt;
        } catch (error) {
            console.error('Error submitting quiz attempt:', error);
            throw error;
        }
    }

    calculateQuizScore(questions, answers) {
        let correctAnswers = 0;
        let totalQuestions = questions.length;

        questions.forEach((question, index) => {
            const userAnswer = answers[index];
            if (userAnswer === question.correctAnswer) {
                correctAnswers++;
            }
        });

        return Math.round((correctAnswers / totalQuestions) * 100);
    }

    // Reporting Methods
    async generateTrainingReport(factoryId, dateRange) {
        try {
            const factoryTrainings = Array.from(this.trainings.values())
                .filter(training => training.factoryId === factoryId);

            const report = {
                generatedAt: new Date(),
                factoryId: factoryId,
                dateRange: dateRange,
                summary: {
                    totalTrainings: factoryTrainings.length,
                    completedTrainings: factoryTrainings.filter(t => t.status === 'completed').length,
                    scheduledTrainings: factoryTrainings.filter(t => t.status === 'scheduled').length,
                    totalAttendees: 0,
                    averageAttendance: 0
                },
                trainings: factoryTrainings.map(training => ({
                    id: training.id,
                    title: training.title,
                    type: training.type,
                    status: training.status,
                    scheduledDate: training.scheduledDate,
                    attendees: training.attendees?.length || 0
                })),
                compliance: await this.getFactoryComplianceSummary(factoryId)
            };

            return report;
        } catch (error) {
            console.error('Error generating training report:', error);
            throw error;
        }
    }

    async getFactoryComplianceSummary(factoryId) {
        try {
            // Get all users in the factory
            const usersSnapshot = await this.db.collection('users')
                .where('factoryId', '==', factoryId)
                .get();

            const complianceSummary = {
                totalUsers: usersSnapshot.size,
                compliantUsers: 0,
                nonCompliantUsers: 0,
                averageComplianceScore: 0
            };

            let totalScore = 0;

            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const compliance = await this.checkTrainingCompliance(
                    userDoc.id, 
                    userData.role, 
                    userData.department
                );

                if (compliance.complianceScore >= 100) {
                    complianceSummary.compliantUsers++;
                } else {
                    complianceSummary.nonCompliantUsers++;
                }

                totalScore += compliance.complianceScore;
            }

            complianceSummary.averageComplianceScore = usersSnapshot.size > 0 ? 
                Math.round(totalScore / usersSnapshot.size) : 0;

            return complianceSummary;
        } catch (error) {
            console.error('Error getting factory compliance summary:', error);
            return {
                totalUsers: 0,
                compliantUsers: 0,
                nonCompliantUsers: 0,
                averageComplianceScore: 0
            };
        }
    }

    // Utility Methods
    getTrainingsByType(type) {
        return Array.from(this.trainings.values())
            .filter(training => training.type === type);
    }

    getMeetingsByType(type) {
        return Array.from(this.meetings.values())
            .filter(meeting => meeting.type === type);
    }

    getUserCertificates(userId) {
        return Array.from(this.certificates.values())
            .filter(cert => cert.userId === userId);
    }

    getExpiringCertificates(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + days);

        return Array.from(this.certificates.values())
            .filter(cert => {
                if (!cert.expiresAt) return false;
                const expiryDate = cert.expiresAt.toDate ? 
                    cert.expiresAt.toDate() : new Date(cert.expiresAt);
                return expiryDate <= cutoffDate && expiryDate > new Date();
            });
    }
}

// Initialize Training & Meetings System
window.trainingMeetingsSystem = new TrainingMeetingsSystem();

// Export for use in other files
window.TrainingSystem = window.trainingMeetingsSystem;
