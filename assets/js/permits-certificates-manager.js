// Permits & Certificates Manager for Angkor Compliance v2
// Implements comprehensive permit management with expiry tracking and renewal workflows

class PermitsCertificatesManager {
    constructor() {
        this.db = window.Firebase?.db;
        this.permits = new Map();
        this.certificates = new Map();
        this.renewalWorkflows = new Map();
        this.notifications = new Map();
        this.isInitialized = false;
        
        this.initializePermitsManager();
    }

    async initializePermitsManager() {
        try {
            console.log('📋 Initializing Permits & Certificates Manager...');
            
            // Load all permits data
            await Promise.all([
                this.loadPermits(),
                this.loadCertificates(),
                this.loadRenewalWorkflows(),
                this.setupExpiryTracking()
            ]);
            
            this.isInitialized = true;
            console.log('✅ Permits & Certificates Manager initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Permits & Certificates Manager:', error);
            this.isInitialized = false;
        }
    }

    async loadPermits() {
        try {
            const permitsSnapshot = await this.db.collection('permits').get();
            permitsSnapshot.forEach(doc => {
                const permit = { id: doc.id, ...doc.data() };
                this.permits.set(permit.id, permit);
            });
            console.log(`📋 Loaded ${this.permits.size} permits`);
        } catch (error) {
            console.error('Error loading permits:', error);
        }
    }

    async loadCertificates() {
        try {
            const certificatesSnapshot = await this.db.collection('certificates').get();
            certificatesSnapshot.forEach(doc => {
                const certificate = { id: doc.id, ...doc.data() };
                this.certificates.set(certificate.id, certificate);
            });
            console.log(`📋 Loaded ${this.certificates.size} certificates`);
        } catch (error) {
            console.error('Error loading certificates:', error);
        }
    }

    async loadRenewalWorkflows() {
        try {
            const workflowsSnapshot = await this.db.collection('renewal_workflows').get();
            workflowsSnapshot.forEach(doc => {
                const workflow = { id: doc.id, ...doc.data() };
                this.renewalWorkflows.set(workflow.id, workflow);
            });
            console.log(`📋 Loaded ${this.renewalWorkflows.size} renewal workflows`);
        } catch (error) {
            console.error('Error loading renewal workflows:', error);
        }
    }

    // Permit Management Methods
    async createPermit(permitData) {
        try {
            const permit = {
                id: `permit_${Date.now()}`,
                ...permitData,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
                renewalHistory: [],
                notifications: []
            };

            // Calculate expiry dates and reminders
            this.calculateExpiryDates(permit);
            this.setupReminders(permit);

            await this.db.collection('permits').doc(permit.id).set(permit);
            this.permits.set(permit.id, permit);
            
            console.log(`✅ Created permit: ${permit.name}`);
            return permit;
        } catch (error) {
            console.error('Error creating permit:', error);
            throw error;
        }
    }

    async updatePermit(permitId, updates) {
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            // Recalculate expiry dates if expiry date changed
            if (updates.expiryDate) {
                const permit = this.permits.get(permitId);
                if (permit) {
                    permit.expiryDate = updates.expiryDate;
                    this.calculateExpiryDates(permit);
                    this.setupReminders(permit);
                    updateData.expiryDates = permit.expiryDates;
                    updateData.reminders = permit.reminders;
                }
            }

            await this.db.collection('permits').doc(permitId).update(updateData);
            
            const permit = this.permits.get(permitId);
            if (permit) {
                Object.assign(permit, updateData);
            }
            
            console.log(`✅ Updated permit: ${permitId}`);
        } catch (error) {
            console.error('Error updating permit:', error);
            throw error;
        }
    }

    async renewPermit(permitId, renewalData) {
        try {
            const permit = this.permits.get(permitId);
            if (!permit) {
                throw new Error(`Permit not found: ${permitId}`);
            }

            const renewal = {
                id: `renewal_${Date.now()}`,
                permitId: permitId,
                oldExpiryDate: permit.expiryDate,
                newExpiryDate: renewalData.newExpiryDate,
                renewalDate: new Date(),
                renewalBy: renewalData.renewedBy,
                documents: renewalData.documents || [],
                notes: renewalData.notes || '',
                status: 'completed'
            };

            // Update permit with new expiry date
            const updateData = {
                expiryDate: renewalData.newExpiryDate,
                updatedAt: new Date(),
                status: 'active'
            };

            // Add to renewal history
            if (!permit.renewalHistory) {
                permit.renewalHistory = [];
            }
            permit.renewalHistory.push(renewal);

            // Recalculate expiry dates and reminders
            permit.expiryDate = renewalData.newExpiryDate;
            this.calculateExpiryDates(permit);
            this.setupReminders(permit);

            updateData.renewalHistory = permit.renewalHistory;
            updateData.expiryDates = permit.expiryDates;
            updateData.reminders = permit.reminders;

            await this.db.collection('permits').doc(permitId).update(updateData);
            
            // Save renewal record
            await this.db.collection('permit_renewals').doc(renewal.id).set(renewal);
            
            console.log(`✅ Renewed permit: ${permitId}`);
            return renewal;
        } catch (error) {
            console.error('Error renewing permit:', error);
            throw error;
        }
    }

    // Certificate Management Methods
    async createCertificate(certificateData) {
        try {
            const certificate = {
                id: `certificate_${Date.now()}`,
                ...certificateData,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
                renewalHistory: [],
                notifications: []
            };

            // Calculate expiry dates and reminders
            this.calculateExpiryDates(certificate);
            this.setupReminders(certificate);

            await this.db.collection('certificates').doc(certificate.id).set(certificate);
            this.certificates.set(certificate.id, certificate);
            
            console.log(`✅ Created certificate: ${certificate.name}`);
            return certificate;
        } catch (error) {
            console.error('Error creating certificate:', error);
            throw error;
        }
    }

    async updateCertificate(certificateId, updates) {
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            // Recalculate expiry dates if expiry date changed
            if (updates.expiryDate) {
                const certificate = this.certificates.get(certificateId);
                if (certificate) {
                    certificate.expiryDate = updates.expiryDate;
                    this.calculateExpiryDates(certificate);
                    this.setupReminders(certificate);
                    updateData.expiryDates = certificate.expiryDates;
                    updateData.reminders = certificate.reminders;
                }
            }

            await this.db.collection('certificates').doc(certificateId).update(updateData);
            
            const certificate = this.certificates.get(certificateId);
            if (certificate) {
                Object.assign(certificate, updateData);
            }
            
            console.log(`✅ Updated certificate: ${certificateId}`);
        } catch (error) {
            console.error('Error updating certificate:', error);
            throw error;
        }
    }

    // Expiry Tracking Methods
    calculateExpiryDates(item) {
        if (!item.expiryDate) return;

        const expiryDate = new Date(item.expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

        item.expiryDates = {
            expiryDate: expiryDate,
            daysUntilExpiry: daysUntilExpiry,
            isExpired: daysUntilExpiry < 0,
            isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
            isExpiringVerySoon: daysUntilExpiry <= 7 && daysUntilExpiry > 0,
            status: this.getExpiryStatus(daysUntilExpiry)
        };
    }

    getExpiryStatus(daysUntilExpiry) {
        if (daysUntilExpiry < 0) return 'expired';
        if (daysUntilExpiry <= 7) return 'critical';
        if (daysUntilExpiry <= 30) return 'warning';
        if (daysUntilExpiry <= 90) return 'notice';
        return 'valid';
    }

    setupReminders(item) {
        const expiryDate = new Date(item.expiryDate);
        const reminders = [];

        // 90 days before expiry
        const reminder90 = new Date(expiryDate);
        reminder90.setDate(reminder90.getDate() - 90);
        if (reminder90 > new Date()) {
            reminders.push({
                type: 'notice',
                date: reminder90,
                message: `${item.name} expires in 90 days`,
                sent: false
            });
        }

        // 30 days before expiry
        const reminder30 = new Date(expiryDate);
        reminder30.setDate(reminder30.getDate() - 30);
        if (reminder30 > new Date()) {
            reminders.push({
                type: 'warning',
                date: reminder30,
                message: `${item.name} expires in 30 days`,
                sent: false
            });
        }

        // 7 days before expiry
        const reminder7 = new Date(expiryDate);
        reminder7.setDate(reminder7.getDate() - 7);
        if (reminder7 > new Date()) {
            reminders.push({
                type: 'critical',
                date: reminder7,
                message: `${item.name} expires in 7 days`,
                sent: false
            });
        }

        // Day of expiry
        if (expiryDate > new Date()) {
            reminders.push({
                type: 'expired',
                date: expiryDate,
                message: `${item.name} expires today`,
                sent: false
            });
        }

        item.reminders = reminders;
    }

    async setupExpiryTracking() {
        // Set up daily check for expiring permits and certificates
        setInterval(async () => {
            await this.checkExpiringItems();
        }, 24 * 60 * 60 * 1000); // Check every 24 hours

        // Also check immediately
        await this.checkExpiringItems();
    }

    async checkExpiringItems() {
        try {
            const now = new Date();
            const expiringItems = [];

            // Check permits
            this.permits.forEach(permit => {
                if (permit.expiryDates && permit.expiryDates.isExpiringSoon) {
                    expiringItems.push({
                        type: 'permit',
                        item: permit,
                        daysUntilExpiry: permit.expiryDates.daysUntilExpiry
                    });
                }
            });

            // Check certificates
            this.certificates.forEach(certificate => {
                if (certificate.expiryDates && certificate.expiryDates.isExpiringSoon) {
                    expiringItems.push({
                        type: 'certificate',
                        item: certificate,
                        daysUntilExpiry: certificate.expiryDates.daysUntilExpiry
                    });
                }
            });

            // Send notifications for expiring items
            for (const expiringItem of expiringItems) {
                await this.sendExpiryNotification(expiringItem);
            }

            console.log(`📅 Checked ${expiringItems.length} expiring items`);
        } catch (error) {
            console.error('Error checking expiring items:', error);
        }
    }

    async sendExpiryNotification(expiringItem) {
        try {
            const { type, item, daysUntilExpiry } = expiringItem;
            
            const notification = {
                id: `notification_${Date.now()}`,
                type: 'expiry_warning',
                title: `${item.name} Expiry Warning`,
                message: `${item.name} expires in ${daysUntilExpiry} days`,
                priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
                targetType: type,
                targetId: item.id,
                factoryId: item.factoryId,
                createdAt: new Date(),
                status: 'pending'
            };

            await this.db.collection('notifications').add(notification);
            
            console.log(`📧 Sent expiry notification for ${item.name}`);
        } catch (error) {
            console.error('Error sending expiry notification:', error);
        }
    }

    // Renewal Workflow Methods
    async createRenewalWorkflow(itemId, itemType) {
        try {
            const item = itemType === 'permit' ? 
                this.permits.get(itemId) : 
                this.certificates.get(itemId);

            if (!item) {
                throw new Error(`${itemType} not found: ${itemId}`);
            }

            const workflow = {
                id: `workflow_${Date.now()}`,
                itemId: itemId,
                itemType: itemType,
                itemName: item.name,
                factoryId: item.factoryId,
                status: 'pending',
                steps: this.generateRenewalSteps(item),
                currentStep: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                assignedTo: null,
                deadline: new Date(item.expiryDate)
            };

            await this.db.collection('renewal_workflows').doc(workflow.id).set(workflow);
            this.renewalWorkflows.set(workflow.id, workflow);
            
            console.log(`✅ Created renewal workflow for ${item.name}`);
            return workflow;
        } catch (error) {
            console.error('Error creating renewal workflow:', error);
            throw error;
        }
    }

    generateRenewalSteps(item) {
        const steps = [
            {
                id: 'review',
                name: 'Review Requirements',
                description: 'Review renewal requirements and documentation needed',
                status: 'pending',
                deadline: null,
                completedAt: null
            },
            {
                id: 'gather_documents',
                name: 'Gather Documents',
                description: 'Collect all required documents for renewal',
                status: 'pending',
                deadline: null,
                completedAt: null
            },
            {
                id: 'submit_application',
                name: 'Submit Application',
                description: 'Submit renewal application to relevant authority',
                status: 'pending',
                deadline: null,
                completedAt: null
            },
            {
                id: 'follow_up',
                name: 'Follow Up',
                description: 'Follow up on application status',
                status: 'pending',
                deadline: null,
                completedAt: null
            },
            {
                id: 'receive_approval',
                name: 'Receive Approval',
                description: 'Receive approval and updated permit/certificate',
                status: 'pending',
                deadline: null,
                completedAt: null
            }
        ];

        return steps;
    }

    async updateWorkflowStep(workflowId, stepId, status, notes = '') {
        try {
            const workflow = this.renewalWorkflows.get(workflowId);
            if (!workflow) {
                throw new Error(`Workflow not found: ${workflowId}`);
            }

            const step = workflow.steps.find(s => s.id === stepId);
            if (!step) {
                throw new Error(`Step not found: ${stepId}`);
            }

            step.status = status;
            step.notes = notes;
            step.completedAt = status === 'completed' ? new Date() : null;

            // Update current step if completed
            if (status === 'completed' && workflow.currentStep < workflow.steps.length - 1) {
                workflow.currentStep++;
            }

            workflow.updatedAt = new Date();

            await this.db.collection('renewal_workflows').doc(workflowId).update(workflow);
            
            console.log(`✅ Updated workflow step: ${stepId} - ${status}`);
            return workflow;
        } catch (error) {
            console.error('Error updating workflow step:', error);
            throw error;
        }
    }

    // Calendar Integration Methods
    async generateCalendarEvents(factoryId) {
        try {
            const events = [];

            // Add permit expiry events
            this.permits.forEach(permit => {
                if (permit.factoryId === factoryId) {
                    events.push({
                        id: `permit_${permit.id}`,
                        title: `${permit.name} Expires`,
                        start: permit.expiryDate,
                        end: permit.expiryDate,
                        type: 'permit_expiry',
                        color: '#ef4444',
                        description: `Permit ${permit.name} expires on ${new Date(permit.expiryDate).toLocaleDateString()}`
                    });
                }
            });

            // Add certificate expiry events
            this.certificates.forEach(certificate => {
                if (certificate.factoryId === factoryId) {
                    events.push({
                        id: `certificate_${certificate.id}`,
                        title: `${certificate.name} Expires`,
                        start: certificate.expiryDate,
                        end: certificate.expiryDate,
                        type: 'certificate_expiry',
                        color: '#f59e0b',
                        description: `Certificate ${certificate.name} expires on ${new Date(certificate.expiryDate).toLocaleDateString()}`
                    });
                }
            });

            // Add renewal workflow events
            this.renewalWorkflows.forEach(workflow => {
                if (workflow.factoryId === factoryId) {
                    events.push({
                        id: `workflow_${workflow.id}`,
                        title: `${workflow.itemName} Renewal Due`,
                        start: workflow.deadline,
                        end: workflow.deadline,
                        type: 'renewal_deadline',
                        color: '#3b82f6',
                        description: `Renewal deadline for ${workflow.itemName}`
                    });
                }
            });

            return events;
        } catch (error) {
            console.error('Error generating calendar events:', error);
            return [];
        }
    }

    // Export Methods
    async exportPermitsReport(factoryId, format = 'json') {
        try {
            const factoryPermits = Array.from(this.permits.values())
                .filter(permit => !factoryId || permit.factoryId === factoryId);

            const report = {
                generatedAt: new Date(),
                factoryId: factoryId,
                permits: factoryPermits.map(permit => ({
                    id: permit.id,
                    name: permit.name,
                    type: permit.type,
                    issuingAuthority: permit.issuingAuthority,
                    issueDate: permit.issueDate,
                    expiryDate: permit.expiryDate,
                    status: permit.status,
                    daysUntilExpiry: permit.expiryDates?.daysUntilExpiry || 0,
                    expiryStatus: permit.expiryDates?.status || 'unknown'
                }))
            };

            if (format === 'json') {
                return report;
            } else if (format === 'csv') {
                return this.convertToCSV(report.permits);
            }
        } catch (error) {
            console.error('Error exporting permits report:', error);
            throw error;
        }
    }

    convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => row[header]).join(','))
        ].join('\n');

        return csvContent;
    }

    // Utility Methods
    getPermitsByFactory(factoryId) {
        return Array.from(this.permits.values())
            .filter(permit => permit.factoryId === factoryId);
    }

    getCertificatesByFactory(factoryId) {
        return Array.from(this.certificates.values())
            .filter(certificate => certificate.factoryId === factoryId);
    }

    getExpiringItems(days = 30) {
        const expiringItems = [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + days);
        
        // Check permits
        this.permits.forEach(permit => {
            if (permit.expiryDate && new Date(permit.expiryDate) <= cutoffDate) {
                expiringItems.push({
                    type: 'permit',
                    item: permit
                });
            }
        });
        
        // Check certificates
        this.certificates.forEach(certificate => {
            if (certificate.expiryDate && new Date(certificate.expiryDate) <= cutoffDate) {
                expiringItems.push({
                    type: 'certificate',
                    item: certificate
                });
            }
        });

        return expiringItems.sort((a, b) => 
            new Date(a.item.expiryDate) - new Date(b.item.expiryDate)
        );
    }
}

// Initialize Permits & Certificates Manager
window.permitsCertificatesManager = new PermitsCertificatesManager();

// Export for use in other files
window.PermitsManager = window.permitsCertificatesManager;
