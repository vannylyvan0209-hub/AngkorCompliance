// Billing & Licensing System for Angkor Compliance Platform
// Implements factory licensing, storage metering, AI assistant top-ups, and usage tracking as outlined in the vision document

class BillingLicensingSystem {
    constructor() {
        this.db = window.Firebase?.db;
        this.currentUser = null;
        this.licenses = new Map();
        this.usageMetrics = new Map();
        this.billingPlans = new Map();
        this.meteringData = new Map();
        this.isInitialized = false;
        
        this.initializeBillingSystem();
    }

    async initializeBillingSystem() {
        try {
            console.log('💰 Initializing Billing & Licensing System...');
            
            // Initialize billing plans
            await this.initializeBillingPlans();
            
            // Initialize license management
            await this.initializeLicenseManagement();
            
            // Initialize usage tracking
            await this.initializeUsageTracking();
            
            // Initialize metering system
            await this.initializeMeteringSystem();
            
            // Set up real-time listeners
            this.setupRealTimeListeners();
            
            this.isInitialized = true;
            console.log('✅ Billing & Licensing System initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Billing & Licensing System:', error);
            this.isInitialized = false;
        }
    }

    // Billing Plans Initialization
    async initializeBillingPlans() {
        // Factory License Plans (Annual)
        this.billingPlans.set('factory_license', {
            starter: {
                id: 'starter',
                name: 'Starter Factory License',
                price: 250,
                currency: 'USD',
                period: 'annual',
                features: {
                    maxWorkers: 100,
                    maxStorage: '1GB',
                    aiAssistance: false,
                    advancedAnalytics: false,
                    customIntegrations: false,
                    prioritySupport: false
                },
                limits: {
                    documentsPerMonth: 1000,
                    aiRequestsPerMonth: 0,
                    usersPerFactory: 5,
                    factoriesPerOrg: 1
                }
            },
            professional: {
                id: 'professional',
                name: 'Professional Factory License',
                price: 500,
                currency: 'USD',
                period: 'annual',
                features: {
                    maxWorkers: 500,
                    maxStorage: '10GB',
                    aiAssistance: true,
                    advancedAnalytics: true,
                    customIntegrations: false,
                    prioritySupport: false
                },
                limits: {
                    documentsPerMonth: 5000,
                    aiRequestsPerMonth: 1000,
                    usersPerFactory: 15,
                    factoriesPerOrg: 5
                }
            },
            enterprise: {
                id: 'enterprise',
                name: 'Enterprise Factory License',
                price: 750,
                currency: 'USD',
                period: 'annual',
                features: {
                    maxWorkers: -1, // Unlimited
                    maxStorage: '100GB',
                    aiAssistance: true,
                    advancedAnalytics: true,
                    customIntegrations: true,
                    prioritySupport: true
                },
                limits: {
                    documentsPerMonth: -1, // Unlimited
                    aiRequestsPerMonth: 10000,
                    usersPerFactory: -1, // Unlimited
                    factoriesPerOrg: -1 // Unlimited
                }
            }
        });

        // Storage Plans (Monthly)
        this.billingPlans.set('storage', {
            pay_as_you_go: {
                id: 'pay_as_you_go',
                name: 'Pay-as-you-go Storage',
                price: 1, // $1 per 100MB
                currency: 'USD',
                period: 'monthly',
                unit: '100MB',
                features: {
                    pooledPerTenant: true,
                    automaticScaling: true,
                    backupIncluded: true
                }
            }
        });

        // AI Assistant Plans (Top-up)
        this.billingPlans.set('ai_assistant', {
            basic_pack: {
                id: 'basic_pack',
                name: 'Basic AI Pack',
                price: 50,
                currency: 'USD',
                tokens: 100000,
                features: {
                    documentAnalysis: true,
                    capGeneration: true,
                    riskAssessment: true
                }
            },
            professional_pack: {
                id: 'professional_pack',
                name: 'Professional AI Pack',
                price: 150,
                currency: 'USD',
                tokens: 500000,
                features: {
                    documentAnalysis: true,
                    capGeneration: true,
                    riskAssessment: true,
                    customPrompts: true,
                    batchProcessing: true
                }
            },
            enterprise_pack: {
                id: 'enterprise_pack',
                name: 'Enterprise AI Pack',
                price: 500,
                currency: 'USD',
                tokens: 2000000,
                features: {
                    documentAnalysis: true,
                    capGeneration: true,
                    riskAssessment: true,
                    customPrompts: true,
                    batchProcessing: true,
                    customModels: true,
                    priorityProcessing: true
                }
            }
        });

        // Add-on Plans
        this.billingPlans.set('addons', {
            sso_scim: {
                id: 'sso_scim',
                name: 'SSO/SCIM Integration',
                price: 100,
                currency: 'USD',
                period: 'monthly',
                features: {
                    saml: true,
                    oidc: true,
                    scimProvisioning: true,
                    userSync: true
                }
            },
            data_residency: {
                id: 'data_residency',
                name: 'Data Residency',
                price: 200,
                currency: 'USD',
                period: 'monthly',
                features: {
                    regionPinning: true,
                    complianceReporting: true,
                    dataGovernance: true
                }
            },
            private_embeddings: {
                id: 'private_embeddings',
                name: 'Private Embeddings',
                price: 300,
                currency: 'USD',
                period: 'monthly',
                features: {
                    onPremiseDeployment: true,
                    customModels: true,
                    enhancedPrivacy: true
                }
            },
            premium_support: {
                id: 'premium_support',
                name: 'Premium Support & SLA',
                price: 500,
                currency: 'USD',
                period: 'monthly',
                features: {
                    dedicatedSupport: true,
                    slaGuarantee: true,
                    priorityEscalation: true,
                    customTraining: true
                }
            }
        });

        // Load billing plans from database
        await this.loadBillingPlans();
    }

    // License Management
    async initializeLicenseManagement() {
        // Load existing licenses from database
        const licensesSnapshot = await this.db.collection('licenses').get();
        licensesSnapshot.forEach(doc => {
            const licenseData = doc.data();
            this.licenses.set(doc.id, licenseData);
        });

        console.log(`📋 Loaded ${this.licenses.size} licenses`);
    }

    // Usage Tracking
    async initializeUsageTracking() {
        // Initialize usage metrics for all active licenses
        for (const [licenseId, license] of this.licenses) {
            if (license.status === 'active') {
                await this.initializeUsageForLicense(licenseId);
            }
        }
    }

    // Metering System
    async initializeMeteringSystem() {
        // Set up metering intervals
        this.startMeteringInterval();
        
        // Initialize metering data
        await this.loadMeteringData();
    }

    // License Management Methods
    async createFactoryLicense(factoryId, planId, organizationId) {
        try {
            const plan = this.billingPlans.get('factory_license')[planId];
            if (!plan) {
                throw new Error(`Invalid plan: ${planId}`);
            }

            const licenseData = {
                id: `license_${factoryId}_${Date.now()}`,
                factoryId: factoryId,
                organizationId: organizationId,
                planId: planId,
                plan: plan,
                status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                billingCycle: 'annual',
                price: plan.price,
                currency: plan.currency,
                features: plan.features,
                limits: plan.limits,
                usage: {
                    workers: 0,
                    storage: 0,
                    documents: 0,
                    aiRequests: 0,
                    users: 0
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Save to database
            await this.db.collection('licenses').doc(licenseData.id).set(licenseData);
            
            // Add to local cache
            this.licenses.set(licenseData.id, licenseData);
            
            // Initialize usage tracking
            await this.initializeUsageForLicense(licenseData.id);

            console.log(`✅ Created license for factory ${factoryId}: ${licenseData.id}`);
            return licenseData;

        } catch (error) {
            console.error('❌ Failed to create factory license:', error);
            throw error;
        }
    }

    async renewLicense(licenseId) {
        try {
            const license = this.licenses.get(licenseId);
            if (!license) {
                throw new Error(`License not found: ${licenseId}`);
            }

            // Extend end date by one year
            const newEndDate = new Date(license.endDate.getTime() + 365 * 24 * 60 * 60 * 1000);
            
            // Update license
            const updates = {
                endDate: newEndDate,
                status: 'active',
                updatedAt: new Date()
            };

            await this.db.collection('licenses').doc(licenseId).update(updates);
            
            // Update local cache
            this.licenses.set(licenseId, { ...license, ...updates });

            console.log(`✅ Renewed license: ${licenseId}`);
            return { success: true, newEndDate };

        } catch (error) {
            console.error('❌ Failed to renew license:', error);
            throw error;
        }
    }

    async cancelLicense(licenseId) {
        try {
            const license = this.licenses.get(licenseId);
            if (!license) {
                throw new Error(`License not found: ${licenseId}`);
            }

            // Update license status
            const updates = {
                status: 'cancelled',
                cancelledAt: new Date(),
                updatedAt: new Date()
            };

            await this.db.collection('licenses').doc(licenseId).update(updates);
            
            // Update local cache
            this.licenses.set(licenseId, { ...license, ...updates });

            console.log(`✅ Cancelled license: ${licenseId}`);
            return { success: true };

        } catch (error) {
            console.error('❌ Failed to cancel license:', error);
            throw error;
        }
    }

    // Usage Tracking Methods
    async trackUsage(licenseId, usageType, amount = 1) {
        try {
            const license = this.licenses.get(licenseId);
            if (!license) {
                throw new Error(`License not found: ${licenseId}`);
            }

            // Update usage
            const currentUsage = license.usage[usageType] || 0;
            const newUsage = currentUsage + amount;

            // Check limits
            const limit = license.limits[usageType];
            if (limit !== -1 && newUsage > limit) {
                throw new Error(`Usage limit exceeded for ${usageType}: ${newUsage}/${limit}`);
            }

            // Update database
            await this.db.collection('licenses').doc(licenseId).update({
                [`usage.${usageType}`]: newUsage,
                updatedAt: new Date()
            });

            // Update local cache
            this.licenses.set(licenseId, {
                ...license,
                usage: { ...license.usage, [usageType]: newUsage },
                updatedAt: new Date()
            });

            // Log usage event
            await this.logUsageEvent(licenseId, usageType, amount);

            return { success: true, newUsage };

        } catch (error) {
            console.error('❌ Failed to track usage:', error);
            throw error;
        }
    }

    async getUsageReport(licenseId, period = 'month') {
        try {
            const license = this.licenses.get(licenseId);
            if (!license) {
                throw new Error(`License not found: ${licenseId}`);
            }

            const startDate = this.getPeriodStartDate(period);
            
            // Get usage events for the period
            const usageEvents = await this.db.collection('usage_events')
                .where('licenseId', '==', licenseId)
                .where('timestamp', '>=', startDate)
                .orderBy('timestamp', 'desc')
                .get();

            const report = {
                licenseId: licenseId,
                period: period,
                startDate: startDate,
                endDate: new Date(),
                currentUsage: license.usage,
                limits: license.limits,
                events: [],
                totals: {
                    documents: 0,
                    aiRequests: 0,
                    storage: 0,
                    workers: 0,
                    users: 0
                }
            };

            usageEvents.forEach(doc => {
                const event = doc.data();
                report.events.push(event);
                report.totals[event.usageType] += event.amount;
            });

            return report;

        } catch (error) {
            console.error('❌ Failed to get usage report:', error);
            throw error;
        }
    }

    // Storage Metering
    async calculateStorageUsage(factoryId) {
        try {
            // Get all documents for the factory
            const documentsSnapshot = await this.db.collection('documents')
                .where('factoryId', '==', factoryId)
                .get();

            let totalSize = 0;
            documentsSnapshot.forEach(doc => {
                const document = doc.data();
                totalSize += document.fileSize || 0;
            });

            // Convert to MB
            const storageMB = totalSize / (1024 * 1024);
            
            // Update storage usage for all licenses of this factory
            for (const [licenseId, license] of this.licenses) {
                if (license.factoryId === factoryId && license.status === 'active') {
                    await this.trackUsage(licenseId, 'storage', storageMB);
                }
            }

            return { storageMB, totalDocuments: documentsSnapshot.size };

        } catch (error) {
            console.error('❌ Failed to calculate storage usage:', error);
            throw error;
        }
    }

    // AI Usage Metering
    async trackAIUsage(licenseId, tokensUsed, cost) {
        try {
            // Track token usage
            await this.trackUsage(licenseId, 'aiRequests', 1);
            
            // Log detailed AI usage
            await this.db.collection('ai_usage_logs').add({
                licenseId: licenseId,
                tokensUsed: tokensUsed,
                cost: cost,
                timestamp: new Date(),
                type: 'ai_request'
            });

            return { success: true };

        } catch (error) {
            console.error('❌ Failed to track AI usage:', error);
            throw error;
        }
    }

    // Billing Methods
    async generateInvoice(licenseId, period = 'month') {
        try {
            const license = this.licenses.get(licenseId);
            if (!license) {
                throw new Error(`License not found: ${licenseId}`);
            }

            const usageReport = await this.getUsageReport(licenseId, period);
            
            // Calculate charges
            const charges = this.calculateCharges(license, usageReport);
            
            const invoice = {
                id: `invoice_${licenseId}_${Date.now()}`,
                licenseId: licenseId,
                factoryId: license.factoryId,
                organizationId: license.organizationId,
                period: period,
                issueDate: new Date(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                status: 'pending',
                subtotal: charges.subtotal,
                tax: charges.tax,
                total: charges.total,
                currency: license.currency,
                items: charges.items,
                usage: usageReport.currentUsage,
                createdAt: new Date()
            };

            // Save invoice
            await this.db.collection('invoices').doc(invoice.id).set(invoice);

            console.log(`✅ Generated invoice: ${invoice.id}`);
            return invoice;

        } catch (error) {
            console.error('❌ Failed to generate invoice:', error);
            throw error;
        }
    }

    calculateCharges(license, usageReport) {
        const items = [];
        let subtotal = 0;

        // Factory license charge
        if (license.billingCycle === 'annual') {
            items.push({
                description: `${license.plan.name} (Annual)`,
                quantity: 1,
                unitPrice: license.price,
                total: license.price
            });
            subtotal += license.price;
        }

        // Storage overage charges
        const storageLimit = license.limits.storage;
        const storageUsed = usageReport.currentUsage.storage;
        
        if (storageLimit !== -1 && storageUsed > storageLimit) {
            const overage = storageUsed - storageLimit;
            const overageCharge = overage * 0.01; // $0.01 per MB overage
            
            items.push({
                description: 'Storage Overage',
                quantity: overage,
                unitPrice: 0.01,
                total: overageCharge
            });
            subtotal += overageCharge;
        }

        // AI usage charges
        const aiLimit = license.limits.aiRequests;
        const aiUsed = usageReport.currentUsage.aiRequests;
        
        if (aiLimit !== -1 && aiUsed > aiLimit) {
            const overage = aiUsed - aiLimit;
            const overageCharge = overage * 0.001; // $0.001 per AI request overage
            
            items.push({
                description: 'AI Usage Overage',
                quantity: overage,
                unitPrice: 0.001,
                total: overageCharge
            });
            subtotal += overageCharge;
        }

        // Calculate tax (simplified)
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;

        return {
            subtotal: Math.round(subtotal * 100) / 100,
            tax: Math.round(tax * 100) / 100,
            total: Math.round(total * 100) / 100,
            items: items
        };
    }

    // Utility Methods
    async initializeUsageForLicense(licenseId) {
        const usageData = {
            workers: 0,
            storage: 0,
            documents: 0,
            aiRequests: 0,
            users: 0
        };

        this.usageMetrics.set(licenseId, usageData);
    }

    async logUsageEvent(licenseId, usageType, amount) {
        try {
            await this.db.collection('usage_events').add({
                licenseId: licenseId,
                usageType: usageType,
                amount: amount,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('❌ Failed to log usage event:', error);
        }
    }

    getPeriodStartDate(period) {
        const now = new Date();
        switch (period) {
            case 'day':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                return weekStart;
            case 'month':
                return new Date(now.getFullYear(), now.getMonth(), 1);
            case 'year':
                return new Date(now.getFullYear(), 0, 1);
            default:
                return new Date(now.getFullYear(), now.getMonth(), 1);
        }
    }

    startMeteringInterval() {
        // Run metering every hour
        setInterval(async () => {
            try {
                await this.runMetering();
            } catch (error) {
                console.error('❌ Metering interval failed:', error);
            }
        }, 60 * 60 * 1000); // 1 hour
    }

    async runMetering() {
        console.log('📊 Running metering...');
        
        // Calculate storage usage for all active factories
        for (const [licenseId, license] of this.licenses) {
            if (license.status === 'active') {
                try {
                    await this.calculateStorageUsage(license.factoryId);
                } catch (error) {
                    console.error(`❌ Failed to meter storage for license ${licenseId}:`, error);
                }
            }
        }
    }

    async loadBillingPlans() {
        try {
            const plansDoc = await this.db.collection('system_config').doc('billing_plans').get();
            if (plansDoc.exists) {
                const savedPlans = plansDoc.data();
                // Merge saved plans with default plans
                for (const [category, plans] of Object.entries(savedPlans)) {
                    if (this.billingPlans.has(category)) {
                        this.billingPlans.set(category, { ...this.billingPlans.get(category), ...plans });
                    }
                }
            }
        } catch (error) {
            console.error('❌ Failed to load billing plans:', error);
        }
    }

    async loadMeteringData() {
        try {
            const meteringSnapshot = await this.db.collection('metering_data').get();
            meteringSnapshot.forEach(doc => {
                this.meteringData.set(doc.id, doc.data());
            });
        } catch (error) {
            console.error('❌ Failed to load metering data:', error);
        }
    }

    setupRealTimeListeners() {
        // Listen for license changes
        this.db.collection('licenses').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added' || change.type === 'modified') {
                    this.licenses.set(change.doc.id, change.doc.data());
                } else if (change.type === 'removed') {
                    this.licenses.delete(change.doc.id);
                }
            });
        });
    }

    // Getter Methods
    getBillingPlans(category) {
        return category ? this.billingPlans.get(category) : this.billingPlans;
    }

    getLicenses(factoryId = null) {
        if (factoryId) {
            return Array.from(this.licenses.values()).filter(license => license.factoryId === factoryId);
        }
        return Array.from(this.licenses.values());
    }

    getUsageMetrics(licenseId) {
        return this.usageMetrics.get(licenseId);
    }

    getMeteringData(licenseId) {
        return this.meteringData.get(licenseId);
    }

    isLicenseActive(licenseId) {
        const license = this.licenses.get(licenseId);
        return license && license.status === 'active' && license.endDate > new Date();
    }

    checkUsageLimit(licenseId, usageType, amount = 1) {
        const license = this.licenses.get(licenseId);
        if (!license) return false;

        const currentUsage = license.usage[usageType] || 0;
        const limit = license.limits[usageType];
        
        return limit === -1 || (currentUsage + amount) <= limit;
    }
}

// Initialize and export
if (typeof window !== 'undefined') {
    window.billingSystem = new BillingLicensingSystem();
    console.log('💰 Billing & Licensing System loaded');
}
