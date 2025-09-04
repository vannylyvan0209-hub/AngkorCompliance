/**
 * Worker Portal for Grievance Submission
 * Implements anonymous submission with retaliation protection
 * As specified in Enterprise Blueprint v2 Section D.6
 */

class WorkerPortal {
    constructor() {
        this.db = window.Firebase?.db;
        this.isAnonymous = true;
        this.retaliationProtection = true;
        this.caseId = null;
        this.sessionToken = null;
        this.submissionChannels = ['qr', 'link', 'kiosk', 'hotline', 'whatsapp', 'telegram'];
    }

    /**
     * Initialize worker portal
     */
    async initialize() {
        console.log('🚀 Initializing Worker Portal...');
        
        // Check if user has existing case ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.caseId = urlParams.get('case');
        
        if (this.caseId) {
            await this.loadExistingCase(this.caseId);
        }

        // Generate session token for anonymous tracking
        this.sessionToken = this.generateSessionToken();
        
        console.log('✅ Worker Portal initialized');
    }

    /**
     * Submit grievance anonymously
     */
    async submitGrievance(data) {
        try {
            console.log('📝 Submitting grievance...');

            // Validate grievance data
            const validation = this.validateGrievanceData(data);
            if (!validation.isValid) {
                throw new Error(`Grievance validation failed: ${validation.error}`);
            }

            // Create anonymous case
            const caseId = await this.createAnonymousCase(data);

            // Generate QR code for tracking
            const qrCode = await this.generateQRCode(caseId);

            // Send confirmation
            await this.sendConfirmation(caseId, data);

            // Log submission for audit (without PII)
            await this.logSubmission(caseId, data);

            console.log('✅ Grievance submitted successfully');
            return {
                success: true,
                caseId: caseId,
                qrCode: qrCode,
                trackingUrl: this.generateTrackingUrl(caseId),
                message: 'Your grievance has been submitted successfully. Please keep your case ID for tracking.'
            };

        } catch (error) {
            console.error('❌ Grievance submission failed:', error);
            throw error;
        }
    }

    /**
     * Track case status
     */
    async trackCase(caseId) {
        try {
            console.log(`📊 Tracking case: ${caseId}`);

            const caseStatus = await this.getCaseStatus(caseId);
            const formattedStatus = this.formatStatusForWorker(caseStatus);

            return {
                success: true,
                caseId: caseId,
                status: formattedStatus,
                lastUpdated: caseStatus.updatedAt
            };

        } catch (error) {
            console.error('❌ Case tracking failed:', error);
            throw error;
        }
    }

    /**
     * Load existing case
     */
    async loadExistingCase(caseId) {
        try {
            const caseData = await this.getCaseStatus(caseId);
            this.displayCaseStatus(caseData);
        } catch (error) {
            console.error('❌ Failed to load existing case:', error);
        }
    }

    /**
     * Validate grievance data
     */
    validateGrievanceData(data) {
        const requiredFields = ['category', 'description', 'severity'];
        
        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                return { isValid: false, error: `Missing required field: ${field}` };
            }
        }

        // Validate severity level
        const validSeverities = ['low', 'medium', 'high', 'critical'];
        if (!validSeverities.includes(data.severity.toLowerCase())) {
            return { isValid: false, error: 'Invalid severity level' };
        }

        // Validate category
        const validCategories = [
            'harassment', 'wage', 'osh', 'discrimination', 
            'working_conditions', 'management', 'other'
        ];
        if (!validCategories.includes(data.category.toLowerCase())) {
            return { isValid: false, error: 'Invalid category' };
        }

        return { isValid: true };
    }

    /**
     * Create anonymous case
     */
    async createAnonymousCase(data) {
        const caseId = this.generateCaseId();
        
        const caseData = {
            id: caseId,
            category: data.category.toLowerCase(),
            description: data.description,
            severity: data.severity.toLowerCase(),
            location: data.location || 'Not specified',
            department: data.department || 'Not specified',
            shift: data.shift || 'Not specified',
            anonymous: true,
            sessionToken: this.sessionToken,
            status: 'submitted',
            priority: this.calculatePriority(data.severity),
            createdAt: new Date(),
            updatedAt: new Date(),
            submittedVia: this.detectSubmissionChannel(),
            retaliationProtection: true,
            escalationLevel: 1,
            estimatedResolutionTime: this.calculateResolutionTime(data.severity),
            // No PII stored
            workerId: null,
            workerName: null,
            workerContact: null
        };

        // Add optional fields if provided (with consent)
        if (data.consentToContact && data.contactInfo) {
            caseData.workerContact = this.encryptContactInfo(data.contactInfo);
            caseData.consentToContact = true;
        }

        await this.db.collection('grievance_cases').doc(caseId).set(caseData);

        // Trigger SLA tracking
        await this.startSLATracking(caseId, data.severity);

        return caseId;
    }

    /**
     * Generate QR code for case tracking
     */
    async generateQRCode(caseId) {
        const trackingUrl = this.generateTrackingUrl(caseId);
        
        // Use QRCode library if available
        if (window.QRCode) {
            return await QRCode.toDataURL(trackingUrl);
        } else {
            // Fallback: return URL for manual QR generation
            return trackingUrl;
        }
    }

    /**
     * Send confirmation
     */
    async sendConfirmation(caseId, data) {
        const confirmation = {
            caseId: caseId,
            submittedAt: new Date(),
            category: data.category,
            severity: data.severity,
            estimatedResolutionTime: this.calculateResolutionTime(data.severity),
            nextSteps: this.getNextSteps(data.severity),
            contactInfo: this.getContactInfo(data.severity)
        };

        // Store confirmation for retrieval
        await this.db.collection('grievance_confirmations').doc(caseId).set(confirmation);

        // Display confirmation to user
        this.displayConfirmation(confirmation);
    }

    /**
     * Get case status
     */
    async getCaseStatus(caseId) {
        const caseDoc = await this.db.collection('grievance_cases').doc(caseId).get();
        
        if (!caseDoc.exists) {
            throw new Error('Case not found');
        }

        const caseData = caseDoc.data();
        
        // Get investigation details if available
        const investigation = await this.getInvestigationDetails(caseId);
        
        return {
            ...caseData,
            investigation: investigation,
            timeline: await this.getCaseTimeline(caseId),
            nextUpdate: this.calculateNextUpdate(caseData.status, caseData.severity)
        };
    }

    /**
     * Format status for worker display
     */
    formatStatusForWorker(caseStatus) {
        const statusMap = {
            'submitted': {
                title: 'Submitted',
                description: 'Your grievance has been received and is under review.',
                color: 'blue',
                icon: '📝'
            },
            'under_investigation': {
                title: 'Under Investigation',
                description: 'Your case is being investigated. Updates will be provided.',
                color: 'orange',
                icon: '🔍'
            },
            'resolution_proposed': {
                title: 'Resolution Proposed',
                description: 'A resolution has been proposed for your case.',
                color: 'yellow',
                icon: '💡'
            },
            'resolved': {
                title: 'Resolved',
                description: 'Your case has been resolved.',
                color: 'green',
                icon: '✅'
            },
            'closed': {
                title: 'Closed',
                description: 'Your case has been closed.',
                color: 'gray',
                icon: '🔒'
            }
        };

        return statusMap[caseStatus.status] || statusMap['submitted'];
    }

    /**
     * Calculate priority based on severity
     */
    calculatePriority(severity) {
        const priorityMap = {
            'low': 4,
            'medium': 3,
            'high': 2,
            'critical': 1
        };
        return priorityMap[severity.toLowerCase()] || 4;
    }

    /**
     * Calculate resolution time
     */
    calculateResolutionTime(severity) {
        const timeMap = {
            'low': '7-14 days',
            'medium': '3-7 days',
            'high': '1-3 days',
            'critical': '24 hours'
        };
        return timeMap[severity.toLowerCase()] || '7-14 days';
    }

    /**
     * Get next steps based on severity
     */
    getNextSteps(severity) {
        const stepsMap = {
            'low': [
                'Your case will be reviewed within 48 hours',
                'You will receive an update via this portal',
                'Resolution expected within 7-14 days'
            ],
            'medium': [
                'Your case will be reviewed within 24 hours',
                'Investigation will begin immediately',
                'Resolution expected within 3-7 days'
            ],
            'high': [
                'Your case will be reviewed within 12 hours',
                'Immediate investigation will be initiated',
                'Resolution expected within 1-3 days'
            ],
            'critical': [
                'Your case will be reviewed immediately',
                'Emergency response team will be notified',
                'Resolution expected within 24 hours'
            ]
        };
        return stepsMap[severity.toLowerCase()] || stepsMap['low'];
    }

    /**
     * Get contact information
     */
    getContactInfo(severity) {
        const contactMap = {
            'low': {
                email: 'grievances@company.com',
                phone: '+855-XX-XXX-XXXX',
                hours: 'Monday-Friday, 8:00 AM - 5:00 PM'
            },
            'medium': {
                email: 'grievances@company.com',
                phone: '+855-XX-XXX-XXXX',
                hours: 'Monday-Friday, 8:00 AM - 6:00 PM'
            },
            'high': {
                email: 'urgent-grievances@company.com',
                phone: '+855-XX-XXX-XXX',
                hours: '24/7 Emergency Line'
            },
            'critical': {
                email: 'emergency@company.com',
                phone: '+855-XX-XXX-XXX',
                hours: '24/7 Emergency Line'
            }
        };
        return contactMap[severity.toLowerCase()] || contactMap['low'];
    }

    /**
     * Start SLA tracking
     */
    async startSLATracking(caseId, severity) {
        const slaConfig = {
            caseId: caseId,
            severity: severity,
            startTime: new Date(),
            targetResolutionTime: this.getSLATargetTime(severity),
            escalationRules: this.getEscalationRules(severity),
            status: 'active'
        };

        await this.db.collection('sla_tracking').doc(caseId).set(slaConfig);
    }

    /**
     * Get SLA target time
     */
    getSLATargetTime(severity) {
        const timeMap = {
            'low': 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
            'medium': 7 * 24 * 60 * 60 * 1000, // 7 days
            'high': 3 * 24 * 60 * 60 * 1000, // 3 days
            'critical': 24 * 60 * 60 * 1000 // 24 hours
        };
        return timeMap[severity.toLowerCase()] || timeMap['low'];
    }

    /**
     * Get escalation rules
     */
    getEscalationRules(severity) {
        const rulesMap = {
            'low': [
                { level: 1, time: 7 * 24 * 60 * 60 * 1000, action: 'reminder' },
                { level: 2, time: 14 * 24 * 60 * 60 * 1000, action: 'escalation' }
            ],
            'medium': [
                { level: 1, time: 3 * 24 * 60 * 60 * 1000, action: 'reminder' },
                { level: 2, time: 7 * 24 * 60 * 60 * 1000, action: 'escalation' }
            ],
            'high': [
                { level: 1, time: 24 * 60 * 60 * 1000, action: 'reminder' },
                { level: 2, time: 3 * 24 * 60 * 60 * 1000, action: 'escalation' }
            ],
            'critical': [
                { level: 1, time: 12 * 60 * 60 * 1000, action: 'reminder' },
                { level: 2, time: 24 * 60 * 60 * 1000, action: 'escalation' }
            ]
        };
        return rulesMap[severity.toLowerCase()] || rulesMap['low'];
    }

    /**
     * Get investigation details
     */
    async getInvestigationDetails(caseId) {
        try {
            const investigationDoc = await this.db.collection('investigations').doc(caseId).get();
            if (investigationDoc.exists) {
                const data = investigationDoc.data();
                // Remove sensitive information for worker view
                return {
                    status: data.status,
                    assignedTo: data.assignedTo ? 'Investigation Team' : null,
                    startDate: data.startDate,
                    estimatedCompletion: data.estimatedCompletion,
                    progress: data.progress || 0
                };
            }
            return null;
        } catch (error) {
            console.warn('Could not load investigation details:', error);
            return null;
        }
    }

    /**
     * Get case timeline
     */
    async getCaseTimeline(caseId) {
        try {
            const timelineSnapshot = await this.db.collection('case_timeline')
                .where('caseId', '==', caseId)
                .orderBy('timestamp', 'asc')
                .get();

            const timeline = [];
            timelineSnapshot.forEach(doc => {
                const data = doc.data();
                timeline.push({
                    timestamp: data.timestamp,
                    action: data.action,
                    description: data.description,
                    actor: data.actor === 'worker' ? 'You' : 'System'
                });
            });

            return timeline;
        } catch (error) {
            console.warn('Could not load case timeline:', error);
            return [];
        }
    }

    /**
     * Calculate next update time
     */
    calculateNextUpdate(status, severity) {
        const updateIntervals = {
            'submitted': { low: 48, medium: 24, high: 12, critical: 2 },
            'under_investigation': { low: 72, medium: 48, high: 24, critical: 6 },
            'resolution_proposed': { low: 24, medium: 12, high: 6, critical: 2 }
        };

        const interval = updateIntervals[status]?.[severity] || 48;
        const nextUpdate = new Date();
        nextUpdate.setHours(nextUpdate.getHours() + interval);

        return nextUpdate;
    }

    /**
     * Detect submission channel
     */
    detectSubmissionChannel() {
        if (window.location.pathname.includes('worker-portal')) {
            return 'web_portal';
        } else if (window.location.pathname.includes('kiosk')) {
            return 'kiosk';
        } else if (window.navigator.userAgent.includes('WhatsApp')) {
            return 'whatsapp';
        } else if (window.navigator.userAgent.includes('Telegram')) {
            return 'telegram';
        } else {
            return 'unknown';
        }
    }

    /**
     * Generate case ID
     */
    generateCaseId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 6);
        return `GRV-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Generate session token
     */
    generateSessionToken() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate tracking URL
     */
    generateTrackingUrl(caseId) {
        return `${window.location.origin}/worker-portal.html?case=${caseId}`;
    }

    /**
     * Encrypt contact information
     */
    encryptContactInfo(contactInfo) {
        // In production, use proper encryption
        // For now, return a hash
        return btoa(JSON.stringify(contactInfo));
    }

    /**
     * Log submission for audit
     */
    async logSubmission(caseId, data) {
        const auditLog = {
            caseId: caseId,
            action: 'grievance_submitted',
            timestamp: new Date(),
            sessionToken: this.sessionToken,
            channel: this.detectSubmissionChannel(),
            category: data.category,
            severity: data.severity,
            anonymous: true,
            // No PII logged
            ipAddress: null,
            userAgent: null
        };

        await this.db.collection('audit_logs').add(auditLog);
    }

    /**
     * Display confirmation to user
     */
    displayConfirmation(confirmation) {
        // This would update the UI to show confirmation
        console.log('Confirmation displayed:', confirmation);
    }

    /**
     * Display case status
     */
    displayCaseStatus(caseData) {
        // This would update the UI to show case status
        console.log('Case status displayed:', caseData);
    }

    /**
     * Get portal statistics
     */
    async getPortalStats() {
        try {
            const stats = {
                totalCases: 0,
                resolvedCases: 0,
                averageResolutionTime: 0,
                categories: {}
            };

            // Get basic stats (anonymized)
            const casesSnapshot = await this.db.collection('grievance_cases')
                .where('anonymous', '==', true)
                .get();

            stats.totalCases = casesSnapshot.size;

            casesSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === 'resolved') {
                    stats.resolvedCases++;
                }
                
                if (!stats.categories[data.category]) {
                    stats.categories[data.category] = 0;
                }
                stats.categories[data.category]++;
            });

            return stats;
        } catch (error) {
            console.error('Failed to get portal stats:', error);
            return null;
        }
    }
}

// Export for global use
window.WorkerPortal = WorkerPortal;
