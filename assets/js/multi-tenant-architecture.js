/**
 * Multi-Tenant Architecture Implementation
 * Angkor Compliance Platform - Phase 0, Week 1
 * 
 * This module implements:
 * - Tenant isolation and data segregation
 * - Tenant management system
 * - Tenant provisioning workflows
 * - Data access controls
 */

class MultiTenantArchitecture {
    constructor() {
        this.currentTenant = null;
        this.tenantCache = new Map();
        this.tenantPermissions = new Map();
        this.auditLogger = null;
        
        // Initialize tenant context
        this.initializeTenantContext();
    }

    /**
     * Initialize tenant context from user session
     */
    async initializeTenantContext() {
        try {
            const user = Firebase.auth.currentUser;
            if (user) {
                await this.loadUserTenantContext(user.uid);
            }
        } catch (error) {
            console.error('Failed to initialize tenant context:', error);
            throw new Error('Tenant initialization failed');
        }
    }

    /**
     * Load user's tenant context and permissions
     */
    async loadUserTenantContext(userId) {
        try {
            // Get user document to determine tenant
            const userDoc = await Firebase.getDoc(
                Firebase.doc(Firebase.db, 'users', userId)
            );

            if (!userDoc.exists()) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            const tenantId = userData.tenantId;

            if (!tenantId) {
                throw new Error('User not associated with any tenant');
            }

            // Load tenant data
            await this.loadTenant(tenantId);
            
            // Load user permissions
            await this.loadUserPermissions(userId, tenantId);

            console.log(`Tenant context loaded for tenant: ${tenantId}`);
        } catch (error) {
            console.error('Failed to load tenant context:', error);
            throw error;
        }
    }

    /**
     * Load tenant configuration and settings
     */
    async loadTenant(tenantId) {
        try {
            // Check cache first
            if (this.tenantCache.has(tenantId)) {
                this.currentTenant = this.tenantCache.get(tenantId);
                return this.currentTenant;
            }

            // Load from Firestore
            const tenantDoc = await Firebase.getDoc(
                Firebase.doc(Firebase.db, 'tenants', tenantId)
            );

            if (!tenantDoc.exists()) {
                throw new Error(`Tenant ${tenantId} not found`);
            }

            const tenantData = tenantDoc.data();
            
            // Validate tenant status
            if (tenantData.status !== 'active') {
                throw new Error(`Tenant ${tenantId} is not active`);
            }

            // Set current tenant
            this.currentTenant = {
                id: tenantId,
                name: tenantData.name,
                domain: tenantData.domain,
                plan: tenantData.plan,
                status: tenantData.status,
                settings: tenantData.settings || {},
                features: tenantData.features || [],
                createdAt: tenantData.createdAt,
                expiresAt: tenantData.expiresAt
            };

            // Cache tenant data
            this.tenantCache.set(tenantId, this.currentTenant);

            return this.currentTenant;
        } catch (error) {
            console.error(`Failed to load tenant ${tenantId}:`, error);
            throw error;
        }
    }

    /**
     * Load user permissions for the current tenant
     */
    async loadUserPermissions(userId, tenantId) {
        try {
            const permissionsDoc = await Firebase.getDoc(
                Firebase.doc(Firebase.db, 'tenants', tenantId, 'users', userId, 'permissions')
            );

            if (permissionsDoc.exists()) {
                const permissions = permissionsDoc.data();
                this.tenantPermissions.set(userId, permissions);
            } else {
                // Set default permissions based on role
                const userDoc = await Firebase.getDoc(
                    Firebase.doc(Firebase.db, 'users', userId)
                );
                const userData = userDoc.data();
                const defaultPermissions = this.getDefaultPermissions(userData.role);
                this.tenantPermissions.set(userId, defaultPermissions);
            }
        } catch (error) {
            console.error('Failed to load user permissions:', error);
            throw error;
        }
    }

    /**
     * Get default permissions based on user role
     */
    getDefaultPermissions(role) {
        const rolePermissions = {
            'super-admin': {
                global: ['read', 'write', 'delete', 'admin'],
                scope: 'all-tenants',
                restrictions: []
            },
            'factory-admin': {
                global: ['read', 'write'],
                scope: 'assigned-factories',
                restrictions: ['delete-tenant', 'modify-billing']
            },
            'hr-staff': {
                global: ['read', 'write'],
                scope: 'assigned-factories',
                restrictions: ['delete-factory', 'modify-standards']
            },
            'grievance-committee': {
                global: ['read', 'write'],
                scope: 'assigned-factories',
                restrictions: ['delete-records', 'modify-audit-data']
            },
            'auditor': {
                global: ['read', 'write-limited'],
                scope: 'assigned-factories',
                restrictions: ['delete-records', 'modify-core-data']
            },
            'worker': {
                global: ['read-limited'],
                scope: 'own-records',
                restrictions: ['write-others', 'access-admin-features']
            }
        };

        return rolePermissions[role] || rolePermissions['worker'];
    }

    /**
     * Check if user has permission for specific action
     */
    hasPermission(userId, action, resource, context = {}) {
        try {
            const permissions = this.tenantPermissions.get(userId);
            if (!permissions) {
                return false;
            }

            // Check global permissions
            if (permissions.global.includes(action)) {
                // Check scope restrictions
                if (this.checkScopePermission(permissions, context)) {
                    // Check specific restrictions
                    if (!this.checkRestrictions(permissions, action, resource, context)) {
                        return true;
                    }
                }
            }

            return false;
        } catch (error) {
            console.error('Permission check failed:', error);
            return false;
        }
    }

    /**
     * Check scope-based permissions
     */
    checkScopePermission(permissions, context) {
        const scope = permissions.scope;
        
        switch (scope) {
            case 'all-tenants':
                return true;
            case 'assigned-factories':
                return context.factoryId && this.isUserAssignedToFactory(context.factoryId);
            case 'own-records':
                return context.userId === Firebase.auth.currentUser?.uid;
            default:
                return false;
        }
    }

    /**
     * Check if user is assigned to specific factory
     */
    isUserAssignedToFactory(factoryId) {
        try {
            const userId = Firebase.auth.currentUser?.uid;
            if (!userId) return false;

            const permissions = this.tenantPermissions.get(userId);
            if (!permissions) return false;

            // Check if factory is in user's assigned factories
            return permissions.assignedFactories?.includes(factoryId) || false;
        } catch (error) {
            console.error('Factory assignment check failed:', error);
            return false;
        }
    }

    /**
     * Check action restrictions
     */
    checkRestrictions(permissions, action, resource, context) {
        const restrictions = permissions.restrictions || [];
        
        for (const restriction of restrictions) {
            if (this.evaluateRestriction(restriction, action, resource, context)) {
                return true; // Restriction applies
            }
        }
        
        return false; // No restrictions apply
    }

    /**
     * Evaluate specific restriction rules
     */
    evaluateRestriction(restriction, action, resource, context) {
        switch (restriction) {
            case 'delete-tenant':
                return action === 'delete' && resource === 'tenant';
            case 'modify-billing':
                return resource === 'billing' && (action === 'write' || action === 'delete');
            case 'delete-factory':
                return action === 'delete' && resource === 'factory';
            case 'modify-standards':
                return resource === 'standards' && action === 'write';
            case 'delete-records':
                return action === 'delete' && resource.includes('record');
            case 'modify-audit-data':
                return resource === 'audit' && action === 'write';
            case 'modify-core-data':
                return resource === 'core' && action === 'write';
            case 'write-others':
                return context.userId !== Firebase.auth.currentUser?.uid && action === 'write';
            case 'access-admin-features':
                return context.feature === 'admin' && action === 'read';
            default:
                return false;
        }
    }

    /**
     * Create new tenant
     */
    async createTenant(tenantData) {
        try {
            // Validate tenant data
            this.validateTenantData(tenantData);

            // Check if super admin
            if (!this.hasPermission(Firebase.auth.currentUser?.uid, 'admin', 'tenant')) {
                throw new Error('Insufficient permissions to create tenant');
            }

            // Generate tenant ID
            const tenantId = this.generateTenantId(tenantData.name);

            // Create tenant document
            const tenantDoc = {
                id: tenantId,
                name: tenantData.name,
                domain: tenantData.domain,
                plan: tenantData.plan || 'basic',
                status: 'pending',
                settings: tenantData.settings || {},
                features: this.getPlanFeatures(tenantData.plan),
                createdAt: Firebase.serverTimestamp(),
                expiresAt: this.calculateExpiryDate(tenantData.plan),
                createdBy: Firebase.auth.currentUser?.uid,
                metadata: {
                    industry: tenantData.industry,
                    country: tenantData.country,
                    size: tenantData.size
                }
            };

            // Save to Firestore
            await Firebase.setDoc(
                Firebase.doc(Firebase.db, 'tenants', tenantId),
                tenantDoc
            );

            // Create tenant collections
            await this.createTenantCollections(tenantId);

            // Log audit event
            await this.logAuditEvent('tenant.created', {
                tenantId,
                tenantName: tenantData.name,
                createdBy: Firebase.auth.currentUser?.uid
            });

            console.log(`Tenant created successfully: ${tenantId}`);
            return tenantId;

        } catch (error) {
            console.error('Failed to create tenant:', error);
            throw error;
        }
    }

    /**
     * Validate tenant creation data
     */
    validateTenantData(tenantData) {
        if (!tenantData.name || tenantData.name.length < 3) {
            throw new Error('Tenant name must be at least 3 characters');
        }

        if (!tenantData.domain || !this.isValidDomain(tenantData.domain)) {
            throw new Error('Valid domain is required');
        }

        if (tenantData.plan && !['basic', 'professional', 'enterprise'].includes(tenantData.plan)) {
            throw new Error('Invalid plan specified');
        }
    }

    /**
     * Generate unique tenant ID
     */
    generateTenantId(name) {
        const timestamp = Date.now().toString(36);
        const nameHash = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
        return `${nameHash}-${timestamp}`;
    }

    /**
     * Get features for specific plan
     */
    getPlanFeatures(plan) {
        const planFeatures = {
            basic: ['core-compliance', 'basic-reports', 'email-support'],
            professional: ['core-compliance', 'advanced-reports', 'ai-assistant', 'priority-support', 'api-access'],
            enterprise: ['core-compliance', 'advanced-reports', 'ai-assistant', 'priority-support', 'api-access', 'custom-integrations', 'dedicated-support', 'sso', 'advanced-security']
        };

        return planFeatures[plan] || planFeatures.basic;
    }

    /**
     * Calculate expiry date based on plan
     */
    calculateExpiryDate(plan) {
        const now = new Date();
        const expiryMonths = {
            basic: 12,
            professional: 12,
            enterprise: 12
        };

        now.setMonth(now.getMonth() + (expiryMonths[plan] || 12));
        return now;
    }

    /**
     * Create tenant collections structure
     */
    async createTenantCollections(tenantId) {
        const collections = [
            'factories',
            'users',
            'documents',
            'cases',
            'caps',
            'standards',
            'audits',
            'permits',
            'trainings',
            'tasks',
            'notifications',
            'audit-logs'
        ];

        for (const collection of collections) {
            // Create collection with security rules
            await Firebase.setDoc(
                Firebase.doc(Firebase.db, 'tenants', tenantId, 'collections', collection),
                {
                    name: collection,
                    createdAt: Firebase.serverTimestamp(),
                    status: 'active'
                }
            );
        }
    }

    /**
     * Provision factory for tenant
     */
    async provisionFactory(tenantId, factoryData) {
        try {
            // Check permissions
            if (!this.hasPermission(Firebase.auth.currentUser?.uid, 'write', 'factory', { tenantId })) {
                throw new Error('Insufficient permissions to provision factory');
            }

            // Generate factory ID
            const factoryId = this.generateFactoryId(factoryData.name);

            // Create factory document
            const factoryDoc = {
                id: factoryId,
                tenantId,
                name: factoryData.name,
                location: factoryData.location,
                industry: factoryData.industry,
                size: factoryData.size,
                status: 'active',
                createdAt: Firebase.serverTimestamp(),
                createdBy: Firebase.auth.currentUser?.uid,
                settings: factoryData.settings || {},
                metadata: {
                    address: factoryData.address,
                            phone: factoryData.phone,
                            email: factoryData.email,
                            contactPerson: factoryData.contactPerson
                }
            };

            // Save to Firestore
            await Firebase.setDoc(
                Firebase.doc(Firebase.db, 'tenants', tenantId, 'factories', factoryId),
                factoryDoc
            );

            // Create factory collections
            await this.createFactoryCollections(tenantId, factoryId);

            // Log audit event
            await this.logAuditEvent('factory.provisioned', {
                tenantId,
                factoryId,
                factoryName: factoryData.name,
                provisionedBy: Firebase.auth.currentUser?.uid
            });

            console.log(`Factory provisioned successfully: ${factoryId}`);
            return factoryId;

        } catch (error) {
            console.error('Failed to provision factory:', error);
            throw error;
        }
    }

    /**
     * Generate unique factory ID
     */
    generateFactoryId(name) {
        const timestamp = Date.now().toString(36);
        const nameHash = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6);
        return `f-${nameHash}-${timestamp}`;
    }

    /**
     * Create factory collections structure
     */
    async createFactoryCollections(tenantId, factoryId) {
        const collections = [
            'departments',
            'lines',
            'shifts',
            'workers',
            'documents',
            'cases',
            'caps',
            'audits',
            'permits',
            'trainings',
            'tasks'
        ];

        for (const collection of collections) {
            await Firebase.setDoc(
                Firebase.doc(Firebase.db, 'tenants', tenantId, 'factories', factoryId, 'collections', collection),
                {
                    name: collection,
                    createdAt: Firebase.serverTimestamp(),
                    status: 'active'
                }
            );
        }
    }

    /**
     * Get tenant data with caching
     */
    async getTenant(tenantId) {
        if (this.tenantCache.has(tenantId)) {
            return this.tenantCache.get(tenantId);
        }

        return await this.loadTenant(tenantId);
    }

    /**
     * Get current tenant
     */
    getCurrentTenant() {
        return this.currentTenant;
    }

    /**
     * Get user permissions for current tenant
     */
    getUserPermissions(userId) {
        return this.tenantPermissions.get(userId);
    }

    /**
     * Validate domain format
     */
    isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    }

    /**
     * Log audit event
     */
    async logAuditEvent(action, metadata) {
        try {
            if (!this.auditLogger) {
                // Initialize audit logger if not available
                this.auditLogger = new AuditLogger();
            }

            await this.auditLogger.logEvent(action, metadata);
        } catch (error) {
            console.error('Failed to log audit event:', error);
        }
    }

    /**
     * Clean up tenant cache
     */
    clearTenantCache() {
        this.tenantCache.clear();
        this.tenantPermissions.clear();
        this.currentTenant = null;
    }

    /**
     * Get tenant statistics
     */
    async getTenantStats(tenantId) {
        try {
            const stats = {
                factories: 0,
                users: 0,
                documents: 0,
                cases: 0,
                caps: 0,
                activeAudits: 0,
                expiringPermits: 0
            };

            // Count factories
            const factoriesSnapshot = await Firebase.getDocs(
                Firebase.collection(Firebase.db, 'tenants', tenantId, 'factories')
            );
            stats.factories = factoriesSnapshot.size;

            // Count users
            const usersSnapshot = await Firebase.getDocs(
                Firebase.collection(Firebase.db, 'tenants', tenantId, 'users')
            );
            stats.users = usersSnapshot.size;

            // Count other entities
            const collections = ['documents', 'cases', 'caps', 'audits', 'permits'];
            for (const collection of collections) {
                const snapshot = await Firebase.getDocs(
                    Firebase.collection(Firebase.db, 'tenants', tenantId, collection)
                );
                stats[collection] = snapshot.size;
            }

            return stats;
        } catch (error) {
            console.error('Failed to get tenant stats:', error);
            throw error;
        }
    }
}

/**
 * Audit Logger for tracking all tenant operations
 */
class AuditLogger {
    constructor() {
        this.currentUser = Firebase.auth.currentUser;
    }

    /**
     * Log audit event
     */
    async logEvent(action, metadata) {
        try {
            const auditEvent = {
                timestamp: Firebase.serverTimestamp(),
                userId: this.currentUser?.uid || 'system',
                action,
                resource: metadata.resource || 'unknown',
                tenantId: metadata.tenantId || 'unknown',
                metadata,
                ipAddress: await this.getClientIP(),
                userAgent: navigator.userAgent,
                sessionId: this.getSessionId()
            };

            // Save to audit log
            await Firebase.addDoc(
                Firebase.collection(Firebase.db, 'audit-logs'),
                auditEvent
            );

            console.log(`Audit event logged: ${action}`);
        } catch (error) {
            console.error('Failed to log audit event:', error);
        }
    }

    /**
     * Get client IP address (simplified)
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Get session ID
     */
    getSessionId() {
        return sessionStorage.getItem('sessionId') || 'unknown';
    }
}

// Export for use in other modules
window.MultiTenantArchitecture = MultiTenantArchitecture;
window.AuditLogger = AuditLogger;

// Initialize multi-tenant architecture
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Firebase !== 'undefined') {
        window.multiTenant = new MultiTenantArchitecture();
        console.log('Multi-tenant architecture initialized');
    }
});
