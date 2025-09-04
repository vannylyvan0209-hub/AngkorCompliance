// System Integration for Angkor Compliance Platform
// Orchestrates all modules and provides unified API for the platform

class SystemIntegration {
    constructor() {
        this.isInitialized = false;
        this.modules = new Map();
        this.eventBus = new EventTarget();
        this.cache = new Map();
        this.analytics = new Map();
        
        this.initializeSystem();
    }

    async initializeSystem() {
        try {
            console.log('🔧 Initializing Angkor Compliance System Integration...');
            
            // Initialize all core modules
            await this.initializeModules();
            
            // Set up cross-module communication
            this.setupEventSystem();
            
            // Initialize analytics and monitoring
            this.initializeAnalytics();
            
            // Set up real-time synchronization
            this.setupRealTimeSync();
            
            this.isInitialized = true;
            console.log('✅ System Integration initialized successfully');
            
            // Emit system ready event
            this.emitEvent('system:ready', { timestamp: new Date().toISOString() });
            
        } catch (error) {
            console.error('❌ Failed to initialize System Integration:', error);
            throw error;
        }
    }

    async initializeModules() {
        // Initialize all core modules in parallel
        const moduleInitializations = [
            this.initializeStandardsRegistry(),
            this.initializePermitsManager(),
            this.initializeTrainingManager(),
            this.initializeAICopilot(),
            this.initializeAnalyticsEngine(),
            this.initializeNotificationSystem()
        ];

        await Promise.all(moduleInitializations);
        
        console.log(`✅ Initialized ${this.modules.size} core modules`);
    }

    async initializeStandardsRegistry() {
        try {
            if (window.standardsRegistry) {
                await window.standardsRegistry.initializeStandardsRegistry();
                this.modules.set('standards', window.standardsRegistry);
                console.log('✅ Standards Registry integrated');
            }
        } catch (error) {
            console.error('❌ Error initializing Standards Registry:', error);
        }
    }

    async initializePermitsManager() {
        try {
            if (window.permitsCertificatesManager) {
                await window.permitsCertificatesManager.initializePermitsManager();
                this.modules.set('permits', window.permitsCertificatesManager);
                console.log('✅ Permits & Certificates Manager integrated');
            }
        } catch (error) {
            console.error('❌ Error initializing Permits Manager:', error);
        }
    }

    async initializeTrainingManager() {
        try {
            if (window.trainingMeetingsManager) {
                await window.trainingMeetingsManager.initializeTrainingManager();
                this.modules.set('training', window.trainingMeetingsManager);
                console.log('✅ Training & Meetings Manager integrated');
            }
        } catch (error) {
            console.error('❌ Error initializing Training Manager:', error);
        }
    }

    async initializeAICopilot() {
        try {
            if (window.aiCopilotSystem) {
                await window.aiCopilotSystem.initializeCopilot();
                this.modules.set('aiCopilot', window.aiCopilotSystem);
                console.log('✅ AI Copilot System integrated');
            }
        } catch (error) {
            console.error('❌ Error initializing AI Copilot:', error);
        }
    }

    async initializeAnalyticsEngine() {
        try {
            if (window.analyticsEngine) {
                await window.analyticsEngine.initialize();
                this.modules.set('analytics', window.analyticsEngine);
                console.log('✅ Analytics Engine integrated');
            }
        } catch (error) {
            console.error('❌ Error initializing Analytics Engine:', error);
        }
    }

    async initializeNotificationSystem() {
        try {
            if (window.notificationSystem) {
                await window.notificationSystem.initialize();
                this.modules.set('notifications', window.notificationSystem);
                console.log('✅ Notification System integrated');
            }
        } catch (error) {
            console.error('❌ Error initializing Notification System:', error);
        }
    }

    // Cross-Module Communication
    setupEventSystem() {
        // Define system-wide events
        const systemEvents = [
            'document:uploaded',
            'document:analyzed',
            'permit:expiring',
            'training:completed',
            'grievance:submitted',
            'cap:created',
            'audit:scheduled',
            'compliance:violation',
            'user:login',
            'user:logout',
            'factory:updated',
            'standard:updated'
        ];

        // Set up event listeners for cross-module communication
        systemEvents.forEach(eventType => {
            this.eventBus.addEventListener(eventType, (event) => {
                this.handleSystemEvent(eventType, event.detail);
            });
        });
    }

    handleSystemEvent(eventType, data) {
        console.log(`📡 System Event: ${eventType}`, data);
        
        // Route events to appropriate modules
        switch (eventType) {
            case 'document:uploaded':
                this.handleDocumentUploaded(data);
                break;
            case 'permit:expiring':
                this.handlePermitExpiring(data);
                break;
            case 'training:completed':
                this.handleTrainingCompleted(data);
                break;
            case 'grievance:submitted':
                this.handleGrievanceSubmitted(data);
                break;
            case 'cap:created':
                this.handleCAPCreated(data);
                break;
            default:
                // Generic event handling
                this.broadcastEvent(eventType, data);
        }
    }

    // Event Handlers
    async handleDocumentUploaded(data) {
        try {
            // Trigger AI analysis
            if (this.modules.has('aiCopilot')) {
                await this.modules.get('aiCopilot').analyzeDocument(data.documentId);
            }
            
            // Update analytics
            if (this.modules.has('analytics')) {
                await this.modules.get('analytics').trackDocumentUpload(data);
            }
            
            // Send notifications
            if (this.modules.has('notifications')) {
                await this.modules.get('notifications').sendDocumentNotification(data);
            }
        } catch (error) {
            console.error('❌ Error handling document upload:', error);
        }
    }

    async handlePermitExpiring(data) {
        try {
            // Send urgent notifications
            if (this.modules.has('notifications')) {
                await this.modules.get('notifications').sendUrgentNotification({
                    type: 'permit_expiry',
                    title: 'Permit Expiring Soon',
                    message: `${data.permitName} expires in ${data.daysUntilExpiry} days`,
                    priority: 'high',
                    recipients: data.responsibleUsers
                });
            }
            
            // Update analytics
            if (this.modules.has('analytics')) {
                await this.modules.get('analytics').trackPermitExpiry(data);
            }
        } catch (error) {
            console.error('❌ Error handling permit expiry:', error);
        }
    }

    async handleTrainingCompleted(data) {
        try {
            // Issue certificate if applicable
            if (this.modules.has('training')) {
                await this.modules.get('training').issueCertificate(
                    data.employeeId,
                    data.moduleId,
                    data.sessionId
                );
            }
            
            // Update training matrix
            if (this.modules.has('training')) {
                await this.modules.get('training').updateTrainingStatus(
                    data.employeeId,
                    data.factoryId
                );
            }
            
            // Send completion notification
            if (this.modules.has('notifications')) {
                await this.modules.get('notifications').sendTrainingCompletionNotification(data);
            }
        } catch (error) {
            console.error('❌ Error handling training completion:', error);
        }
    }

    async handleGrievanceSubmitted(data) {
        try {
            // Create case in grievance system
            if (window.multiChannelGrievanceSystem) {
                await window.multiChannelGrievanceSystem.createCase(
                    data.channelId,
                    data.grievanceData,
                    data.options
                );
            }
            
            // Send acknowledgment
            if (this.modules.has('notifications')) {
                await this.modules.get('notifications').sendGrievanceAcknowledgment(data);
            }
            
            // Update analytics
            if (this.modules.has('analytics')) {
                await this.modules.get('analytics').trackGrievanceSubmission(data);
            }
        } catch (error) {
            console.error('❌ Error handling grievance submission:', error);
        }
    }

    async handleCAPCreated(data) {
        try {
            // Link to standards requirements
            if (this.modules.has('standards')) {
                await this.modules.get('standards').linkCAPToRequirements(data.capId, data.requirements);
            }
            
            // Create tasks
            if (window.taskManager) {
                await window.taskManager.createTasksFromCAP(data.capId, data.actions);
            }
            
            // Send notifications to responsible parties
            if (this.modules.has('notifications')) {
                await this.modules.get('notifications').sendCAPNotification(data);
            }
        } catch (error) {
            console.error('❌ Error handling CAP creation:', error);
        }
    }

    // Analytics and Monitoring
    initializeAnalytics() {
        // Set up system-wide analytics tracking
        this.analytics.set('system_health', {
            uptime: Date.now(),
            errors: 0,
            warnings: 0,
            performance: {}
        });
        
        // Monitor system performance
        setInterval(() => {
            this.updateSystemHealth();
        }, 60000); // Every minute
    }

    updateSystemHealth() {
        const health = this.analytics.get('system_health');
        health.uptime = Date.now() - health.uptime;
        
        // Check module health
        this.modules.forEach((module, name) => {
            if (module.isInitialized === false) {
                health.warnings++;
                console.warn(`⚠️ Module ${name} not initialized`);
            }
        });
        
        // Update performance metrics
        health.performance = {
            memory: performance.memory ? performance.memory.usedJSHeapSize : 0,
            timestamp: new Date().toISOString()
        };
    }

    // Real-time Synchronization
    setupRealTimeSync() {
        // Set up real-time data synchronization between modules
        this.modules.forEach((module, name) => {
            if (module.setupRealTimeListeners) {
                try {
                    module.setupRealTimeListeners();
                    console.log(`✅ Real-time sync enabled for ${name}`);
                } catch (error) {
                    console.error(`❌ Error setting up real-time sync for ${name}:`, error);
                }
            }
        });
    }

    // Unified API Methods
    async getComplianceOverview(factoryId) {
        try {
            const overview = {
                factoryId,
                timestamp: new Date().toISOString(),
                standards: {},
                permits: {},
                training: {},
                grievances: {},
                caps: {}
            };

            // Get standards compliance
            if (this.modules.has('standards')) {
                const standards = await this.modules.get('standards').getStandards();
                overview.standards = {
                    total: standards.length,
                    compliant: standards.filter(s => s.status === 'compliant').length,
                    nonCompliant: standards.filter(s => s.status === 'non_compliant').length
                };
            }

            // Get permits status
            if (this.modules.has('permits')) {
                const permits = await this.modules.get('permits').getPermits(factoryId);
                const expiringPermits = await this.modules.get('permits').getExpiringItems(factoryId, 30);
                overview.permits = {
                    total: permits.length,
                    active: permits.filter(p => p.status === 'active').length,
                    expiring: expiringPermits.length
                };
            }

            // Get training status
            if (this.modules.has('training')) {
                const trainingSessions = await this.modules.get('training').getTrainingSessions(factoryId);
                overview.training = {
                    totalSessions: trainingSessions.length,
                    completed: trainingSessions.filter(s => s.status === 'completed').length,
                    scheduled: trainingSessions.filter(s => s.status === 'scheduled').length
                };
            }

            return overview;
        } catch (error) {
            console.error('❌ Error getting compliance overview:', error);
            throw error;
        }
    }

    async generateAuditPackage(factoryId, standardId, auditDate) {
        try {
            const auditPackage = {
                factoryId,
                standardId,
                auditDate,
                generatedAt: new Date().toISOString(),
                documents: [],
                evidence: [],
                permits: [],
                training: [],
                caps: [],
                summary: {}
            };

            // Generate audit checklist
            if (this.modules.has('standards')) {
                auditPackage.checklist = await this.modules.get('standards').generateAuditChecklist(standardId, factoryId);
            }

            // Generate evidence binder
            if (this.modules.has('standards')) {
                auditPackage.evidenceBinder = await this.modules.get('standards').generateEvidenceBinder(factoryId, standardId, auditDate);
            }

            // Get relevant permits
            if (this.modules.has('permits')) {
                auditPackage.permits = await this.modules.get('permits').getPermits(factoryId);
            }

            // Get training records
            if (this.modules.has('training')) {
                auditPackage.training = await this.modules.get('training').getTrainingSessions(factoryId);
            }

            return auditPackage;
        } catch (error) {
            console.error('❌ Error generating audit package:', error);
            throw error;
        }
    }

    async askAI(question, context = {}) {
        try {
            if (this.modules.has('aiCopilot')) {
                return await this.modules.get('aiCopilot').askQuestion(question, context);
            } else {
                throw new Error('AI Copilot not available');
            }
        } catch (error) {
            console.error('❌ Error asking AI:', error);
            throw error;
        }
    }

    // Event Management
    emitEvent(eventType, data) {
        const event = new CustomEvent(eventType, { detail: data });
        this.eventBus.dispatchEvent(event);
    }

    broadcastEvent(eventType, data) {
        // Broadcast event to all modules
        this.modules.forEach((module, name) => {
            if (module.handleEvent) {
                try {
                    module.handleEvent(eventType, data);
                } catch (error) {
                    console.error(`❌ Error handling event in ${name}:`, error);
                }
            }
        });
    }

    // Cache Management
    setCache(key, value, ttl = 300000) { // 5 minutes default
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    }

    getCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > cached.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.value;
    }

    clearCache() {
        this.cache.clear();
    }

    // System Status
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            modules: Array.from(this.modules.keys()),
            moduleStatus: Array.from(this.modules.entries()).map(([name, module]) => ({
                name,
                initialized: module.isInitialized || false,
                version: module.version || '1.0.0'
            })),
            analytics: this.analytics.get('system_health'),
            cacheSize: this.cache.size,
            timestamp: new Date().toISOString()
        };
    }

    // Module Access
    getModule(name) {
        return this.modules.get(name);
    }

    getAllModules() {
        return Array.from(this.modules.entries());
    }

    // Error Handling
    handleError(error, context = {}) {
        console.error('❌ System Error:', error, context);
        
        // Log error to analytics
        const health = this.analytics.get('system_health');
        health.errors++;
        
        // Send error notification
        if (this.modules.has('notifications')) {
            this.modules.get('notifications').sendErrorNotification({
                error: error.message,
                stack: error.stack,
                context,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Cleanup
    async cleanup() {
        try {
            console.log('🧹 Cleaning up System Integration...');
            
            // Cleanup all modules
            for (const [name, module] of this.modules) {
                if (module.cleanup) {
                    await module.cleanup();
                }
            }
            
            // Clear cache
            this.clearCache();
            
            // Clear analytics
            this.analytics.clear();
            
            console.log('✅ System Integration cleanup completed');
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
        }
    }
}

// Initialize System Integration
window.systemIntegration = new SystemIntegration();

// Global error handler
window.addEventListener('error', (event) => {
    if (window.systemIntegration) {
        window.systemIntegration.handleError(event.error, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    if (window.systemIntegration) {
        window.systemIntegration.handleError(new Error(event.reason), {
            type: 'unhandledrejection'
        });
    }
});

console.log('🔧 System Integration module loaded');
