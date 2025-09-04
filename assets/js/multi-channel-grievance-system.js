// Multi-Channel Grievance System for Angkor Compliance Platform
// Implements comprehensive grievance management with multiple channels as outlined in the vision document

class MultiChannelGrievanceSystem {
    constructor() {
        this.db = window.Firebase.db;
        this.storage = window.Firebase.storage;
        this.isInitialized = false;
        this.channels = new Map();
        this.caseWorkflows = new Map();
        this.slaTimers = new Map();
        
        this.initializeGrievanceSystem();
    }

    async initializeGrievanceSystem() {
        try {
            // Initialize communication channels
            await this.initializeChannels();
            
            // Set up case workflows
            await this.setupCaseWorkflows();
            
            // Initialize SLA monitoring
            this.initializeSLAMonitoring();
            
            // Set up analytics tracking
            this.setupAnalyticsTracking();
            
            console.log('✅ Multi-Channel Grievance System initialized');
            this.isInitialized = true;
        } catch (error) {
            console.error('❌ Error initializing Grievance System:', error);
            this.isInitialized = false;
        }
    }

    // Channel Initialization
    async initializeChannels() {
        // QR Code Channel
        this.channels.set('qr', {
            id: 'qr',
            name: 'QR Code Access',
            type: 'digital',
            features: ['anonymous', 'tracking', 'multilingual'],
            config: {
                qrExpiry: 24 * 60 * 60 * 1000, // 24 hours
                maxSubmissions: 10,
                languages: ['en', 'km', 'zh']
            }
        });

        // WhatsApp Channel
        this.channels.set('whatsapp', {
            id: 'whatsapp',
            name: 'WhatsApp Integration',
            type: 'messaging',
            features: ['real-time', 'media', 'automated'],
            config: {
                apiKey: process.env.WHATSAPP_API_KEY,
                webhookUrl: '/api/grievance/whatsapp-webhook',
                autoResponse: true
            }
        });

        // Telegram Channel
        this.channels.set('telegram', {
            id: 'telegram',
            name: 'Telegram Bot',
            type: 'messaging',
            features: ['real-time', 'media', 'automated'],
            config: {
                botToken: process.env.TELEGRAM_BOT_TOKEN,
                webhookUrl: '/api/grievance/telegram-webhook',
                autoResponse: true
            }
        });

        // Hotline Channel
        this.channels.set('hotline', {
            id: 'hotline',
            name: 'Hotline System',
            type: 'voice',
            features: ['24/7', 'recording', 'transcription'],
            config: {
                phoneNumbers: ['+855-23-123-456', '+855-23-123-457'],
                recordingEnabled: true,
                transcriptionEnabled: true
            }
        });

        // Kiosk Channel
        this.channels.set('kiosk', {
            id: 'kiosk',
            name: 'Kiosk Interface',
            type: 'digital',
            features: ['touchscreen', 'multilingual', 'offline'],
            config: {
                languages: ['en', 'km', 'zh'],
                offlineMode: true,
                autoSync: true
            }
        });

        // Email Channel
        this.channels.set('email', {
            id: 'email',
            name: 'Email-to-Case',
            type: 'email',
            features: ['attachments', 'threading', 'automated'],
            config: {
                emailAddress: 'grievance@angkor-compliance.com',
                autoCategorization: true,
                attachmentProcessing: true
            }
        });
    }

    // Case Workflow Setup
    async setupCaseWorkflows() {
        // Standard Grievance Workflow
        this.caseWorkflows.set('standard', {
            id: 'standard',
            name: 'Standard Grievance Process',
            steps: [
                {
                    id: 'intake',
                    name: 'Case Intake',
                    type: 'automatic',
                    sla: 1 * 60 * 60 * 1000, // 1 hour
                    actions: ['categorize', 'assign_severity', 'create_case']
                },
                {
                    id: 'triage',
                    name: 'Case Triage',
                    type: 'manual',
                    sla: 4 * 60 * 60 * 1000, // 4 hours
                    actions: ['review', 'assign_investigator', 'set_priority']
                },
                {
                    id: 'investigation',
                    name: 'Investigation',
                    type: 'manual',
                    sla: 5 * 24 * 60 * 60 * 1000, // 5 days
                    actions: ['gather_evidence', 'interview_witnesses', 'analyze_findings']
                },
                {
                    id: 'resolution',
                    name: 'Resolution',
                    type: 'manual',
                    sla: 3 * 24 * 60 * 60 * 1000, // 3 days
                    actions: ['propose_solution', 'get_approval', 'implement']
                },
                {
                    id: 'closure',
                    name: 'Case Closure',
                    type: 'manual',
                    sla: 1 * 24 * 60 * 60 * 1000, // 1 day
                    actions: ['worker_acknowledgment', 'closure_survey', 'archive']
                }
            ]
        });

        // Critical Grievance Workflow
        this.caseWorkflows.set('critical', {
            id: 'critical',
            name: 'Critical Grievance Process',
            steps: [
                {
                    id: 'immediate_response',
                    name: 'Immediate Response',
                    type: 'automatic',
                    sla: 30 * 60 * 1000, // 30 minutes
                    actions: ['alert_management', 'secure_evidence', 'protect_worker']
                },
                {
                    id: 'emergency_investigation',
                    name: 'Emergency Investigation',
                    type: 'manual',
                    sla: 24 * 60 * 60 * 1000, // 24 hours
                    actions: ['immediate_interview', 'evidence_collection', 'interim_measures']
                },
                {
                    id: 'resolution',
                    name: 'Resolution',
                    type: 'manual',
                    sla: 2 * 24 * 60 * 60 * 1000, // 2 days
                    actions: ['implement_solution', 'worker_safety', 'preventive_measures']
                }
            ]
        });
    }

    // Main Grievance Interface
    async submitGrievance(channelId, grievanceData, options = {}) {
        try {
            if (!this.isInitialized) {
                throw new Error('Grievance system not initialized');
            }

            const channel = this.channels.get(channelId);
            if (!channel) {
                throw new Error(`Channel ${channelId} not supported`);
            }

            // Validate grievance data
            const validatedData = await this.validateGrievanceData(grievanceData);
            
            // Create case with channel-specific processing
            const caseData = await this.createCase(channelId, validatedData, options);
            
            // Apply workflow
            const workflow = this.determineWorkflow(caseData);
            await this.applyWorkflow(caseData.id, workflow);
            
            // Send acknowledgment
            await this.sendAcknowledgment(channelId, caseData);
            
            // Track analytics
            this.trackGrievanceSubmission(channelId, caseData);
            
            return {
                success: true,
                caseId: caseData.id,
                trackingNumber: caseData.trackingNumber,
                estimatedResolution: caseData.estimatedResolution,
                nextSteps: caseData.nextSteps
            };
        } catch (error) {
            console.error('Error submitting grievance:', error);
            throw error;
        }
    }

    // QR Code Generation and Management
    async generateQRCode(factoryId, options = {}) {
        try {
            const qrData = {
                factoryId,
                timestamp: Date.now(),
                expiry: Date.now() + (options.expiry || 24 * 60 * 60 * 1000),
                language: options.language || 'en',
                anonymous: options.anonymous || true
            };

            const qrUrl = `${window.location.origin}/grievance/qr/${btoa(JSON.stringify(qrData))}`;
            
            // Generate QR code image
            const qrCode = await this.generateQRCodeImage(qrUrl);
            
            // Store QR code data
            await this.storeQRCodeData(qrData, qrUrl);
            
            return {
                qrUrl,
                qrCode,
                expiry: qrData.expiry,
                instructions: this.getQRInstructions(options.language)
            };
        } catch (error) {
            console.error('Error generating QR code:', error);
            throw error;
        }
    }

    // WhatsApp Integration
    async setupWhatsAppIntegration(phoneNumber, message) {
        try {
            const whatsappConfig = this.channels.get('whatsapp').config;
            
            // Send message via WhatsApp API
            const response = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${whatsappConfig.apiKey}`
                },
                body: JSON.stringify({
                    to: phoneNumber,
                    message: message,
                    type: 'text'
                })
            });

            if (!response.ok) {
                throw new Error('WhatsApp message failed');
            }

            return await response.json();
        } catch (error) {
            console.error('WhatsApp integration error:', error);
            throw error;
        }
    }

    // Telegram Integration
    async setupTelegramIntegration(chatId, message) {
        try {
            const telegramConfig = this.channels.get('telegram').config;
            
            // Send message via Telegram Bot API
            const response = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            if (!response.ok) {
                throw new Error('Telegram message failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Telegram integration error:', error);
            throw error;
        }
    }

    // Case Management
    async createCase(channelId, grievanceData, options) {
        try {
            const caseId = `grievance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const trackingNumber = this.generateTrackingNumber();
            
            const caseData = {
                id: caseId,
                trackingNumber,
                channelId,
                factoryId: grievanceData.factoryId,
                workerId: options.anonymous ? null : grievanceData.workerId,
                category: grievanceData.category,
                severity: grievanceData.severity,
                description: grievanceData.description,
                evidence: grievanceData.evidence || [],
                status: 'intake',
                createdAt: new Date().toISOString(),
                estimatedResolution: this.calculateEstimatedResolution(grievanceData.severity),
                nextSteps: this.getNextSteps('intake'),
                metadata: {
                    channel: channelId,
                    anonymous: options.anonymous || false,
                    language: options.language || 'en',
                    location: grievanceData.location
                }
            };

            // Store case in Firestore
            await this.db.setDoc(
                this.db.doc(this.db.collection('grievance_cases'), caseId),
                caseData
            );

            return caseData;
        } catch (error) {
            console.error('Error creating case:', error);
            throw error;
        }
    }

    // SLA Monitoring
    initializeSLAMonitoring() {
        // Set up real-time SLA monitoring
        setInterval(() => {
            this.checkSLABreaches();
        }, 5 * 60 * 1000); // Check every 5 minutes
    }

    async checkSLABreaches() {
        try {
            const activeCases = await this.getActiveCases();
            
            for (const caseData of activeCases) {
                const slaStatus = this.calculateSLAStatus(caseData);
                
                if (slaStatus.isBreached) {
                    await this.handleSLABreach(caseData, slaStatus);
                } else if (slaStatus.isWarning) {
                    await this.sendSLAWarning(caseData, slaStatus);
                }
            }
        } catch (error) {
            console.error('Error checking SLA breaches:', error);
        }
    }

    // Analytics and Reporting
    setupAnalyticsTracking() {
        // Track grievance metrics
        this.metrics = {
            submissions: 0,
            resolutions: 0,
            averageResolutionTime: 0,
            slaBreaches: 0,
            channelUsage: new Map()
        };
    }

    trackGrievanceSubmission(channelId, caseData) {
        this.metrics.submissions++;
        
        if (!this.metrics.channelUsage.has(channelId)) {
            this.metrics.channelUsage.set(channelId, 0);
        }
        this.metrics.channelUsage.set(channelId, this.metrics.channelUsage.get(channelId) + 1);
        
        // Store analytics data
        this.storeAnalyticsData('submission', {
            channelId,
            caseId: caseData.id,
            timestamp: new Date().toISOString(),
            category: caseData.category,
            severity: caseData.severity
        });
    }

    // Helper Methods
    async validateGrievanceData(data) {
        const required = ['factoryId', 'category', 'severity', 'description'];
        
        for (const field of required) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate severity levels
        const validSeverities = ['low', 'medium', 'high', 'critical'];
        if (!validSeverities.includes(data.severity)) {
            throw new Error(`Invalid severity level: ${data.severity}`);
        }

        // Validate categories
        const validCategories = ['harassment', 'wage', 'osh', 'discrimination', 'other'];
        if (!validCategories.includes(data.category)) {
            throw new Error(`Invalid category: ${data.category}`);
        }

        return data;
    }

    determineWorkflow(caseData) {
        if (caseData.severity === 'critical') {
            return this.caseWorkflows.get('critical');
        }
        return this.caseWorkflows.get('standard');
    }

    async applyWorkflow(caseId, workflow) {
        try {
            const workflowData = {
                caseId,
                workflowId: workflow.id,
                currentStep: workflow.steps[0].id,
                steps: workflow.steps.map(step => ({
                    ...step,
                    status: 'pending',
                    startedAt: null,
                    completedAt: null
                })),
                startedAt: new Date().toISOString()
            };

            await this.db.setDoc(
                this.db.doc(this.db.collection('grievance_workflows'), caseId),
                workflowData
            );

            // Start first step
            await this.startWorkflowStep(caseId, workflow.steps[0]);
        } catch (error) {
            console.error('Error applying workflow:', error);
            throw error;
        }
    }

    async startWorkflowStep(caseId, step) {
        try {
            // Update workflow step status
            await this.db.updateDoc(
                this.db.doc(this.db.collection('grievance_workflows'), caseId),
                {
                    [`steps.${step.id}.status`]: 'in_progress',
                    [`steps.${step.id}.startedAt`]: new Date().toISOString()
                }
            );

            // Execute step actions
            for (const action of step.actions) {
                await this.executeWorkflowAction(caseId, action);
            }

            // Set SLA timer
            this.setSLATimer(caseId, step);
        } catch (error) {
            console.error('Error starting workflow step:', error);
            throw error;
        }
    }

    async executeWorkflowAction(caseId, action) {
        switch (action) {
            case 'categorize':
                await this.categorizeCase(caseId);
                break;
            case 'assign_severity':
                await this.assignSeverity(caseId);
                break;
            case 'create_case':
                await this.createCaseRecord(caseId);
                break;
            case 'alert_management':
                await this.alertManagement(caseId);
                break;
            default:
                console.log(`Action ${action} not implemented`);
        }
    }

    generateTrackingNumber() {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `GRV-${timestamp}-${random}`;
    }

    calculateEstimatedResolution(severity) {
        const estimates = {
            'low': 7 * 24 * 60 * 60 * 1000, // 7 days
            'medium': 5 * 24 * 60 * 60 * 1000, // 5 days
            'high': 3 * 24 * 60 * 60 * 1000, // 3 days
            'critical': 24 * 60 * 60 * 1000 // 1 day
        };
        return estimates[severity] || estimates.medium;
    }

    getNextSteps(currentStep) {
        const stepInstructions = {
            'intake': ['Case received and being processed', 'You will receive an acknowledgment within 1 hour'],
            'triage': ['Case under review', 'Investigator will be assigned within 4 hours'],
            'investigation': ['Investigation in progress', 'Updates will be provided every 24 hours'],
            'resolution': ['Resolution being implemented', 'Final outcome will be communicated within 3 days']
        };
        return stepInstructions[currentStep] || ['Processing your case'];
    }

    async sendAcknowledgment(channelId, caseData) {
        const message = this.generateAcknowledgmentMessage(caseData);
        
        switch (channelId) {
            case 'whatsapp':
                return await this.setupWhatsAppIntegration(caseData.workerPhone, message);
            case 'telegram':
                return await this.setupTelegramIntegration(caseData.workerChatId, message);
            case 'email':
                return await this.sendEmailAcknowledgment(caseData.workerEmail, message);
            default:
                console.log(`Acknowledgment sent for case ${caseData.id}`);
        }
    }

    generateAcknowledgmentMessage(caseData) {
        return `Your grievance has been received and assigned tracking number: ${caseData.trackingNumber}. 
        
Category: ${caseData.category}
Severity: ${caseData.severity}
Estimated Resolution: ${new Date(Date.now() + caseData.estimatedResolution).toLocaleDateString()}

Next Steps: ${caseData.nextSteps.join(' ')}`;
    }

    async generateQRCodeImage(url) {
        // Implementation would use a QR code generation library
        // For now, return the URL
        return url;
    }

    async storeQRCodeData(qrData, qrUrl) {
        await this.db.addDoc(this.db.collection('qr_codes'), {
            ...qrData,
            qrUrl,
            createdAt: new Date().toISOString()
        });
    }

    getQRInstructions(language) {
        const instructions = {
            'en': 'Scan this QR code to submit a grievance anonymously',
            'km': 'ស្កេន QR code នេះដើម្បីដាក់ពាក្យបណ្តឹងដោយអនាមិក',
            'zh': '扫描此二维码匿名提交申诉'
        };
        return instructions[language] || instructions.en;
    }

    async getActiveCases() {
        const casesQuery = this.db.query(
            this.db.collection('grievance_cases'),
            this.db.where('status', 'in', ['intake', 'triage', 'investigation', 'resolution'])
        );
        
        const casesSnapshot = await this.db.getDocs(casesQuery);
        return casesSnapshot.docs.map(doc => doc.data());
    }

    calculateSLAStatus(caseData) {
        // Implementation would calculate SLA status based on workflow step
        return {
            isBreached: false,
            isWarning: false,
            timeRemaining: 0
        };
    }

    async handleSLABreach(caseData, slaStatus) {
        // Implementation would handle SLA breaches
        console.log(`SLA breach detected for case ${caseData.id}`);
    }

    async sendSLAWarning(caseData, slaStatus) {
        // Implementation would send SLA warnings
        console.log(`SLA warning for case ${caseData.id}`);
    }

    async storeAnalyticsData(type, data) {
        await this.db.addDoc(this.db.collection('grievance_analytics'), {
            type,
            ...data,
            timestamp: new Date().toISOString()
        });
    }

    setSLATimer(caseId, step) {
        this.slaTimers.set(caseId, {
            stepId: step.id,
            deadline: Date.now() + step.sla,
            timer: setTimeout(() => {
                this.checkSLABreaches();
            }, step.sla)
        });
    }

    // Placeholder methods for workflow actions
    async categorizeCase(caseId) {
        // Implementation for case categorization
    }

    async assignSeverity(caseId) {
        // Implementation for severity assignment
    }

    async createCaseRecord(caseId) {
        // Implementation for case record creation
    }

    async alertManagement(caseId) {
        // Implementation for management alerts
    }

    async sendEmailAcknowledgment(email, message) {
        // Implementation for email acknowledgment
    }
}

// Initialize the Multi-Channel Grievance System globally
window.MultiChannelGrievance = new MultiChannelGrievanceSystem();
