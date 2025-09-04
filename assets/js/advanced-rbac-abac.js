/**
 * Advanced RBAC/ABAC System Implementation
 * Angkor Compliance Platform - Phase 0, Week 2
 * 
 * This module implements:
 * - Field-level permissions
 * - Record-level access controls
 * - Attribute-based filtering
 * - Permission inheritance
 * - Dynamic permission evaluation
 */

class AdvancedRBACABAC {
    constructor() {
        this.permissionCache = new Map();
        this.roleHierarchy = new Map();
        this.attributePolicies = new Map();
        this.permissionEvaluator = null;
        
        // Initialize RBAC/ABAC system
        this.initializeSystem();
    }

    /**
     * Initialize the RBAC/ABAC system
     */
    async initializeSystem() {
        try {
            // Load role hierarchy
            await this.loadRoleHierarchy();
            
            // Load attribute policies
            await this.loadAttributePolicies();
            
            // Initialize permission evaluator
            this.permissionEvaluator = new PermissionEvaluator();
            
            console.log('Advanced RBAC/ABAC system initialized');
        } catch (error) {
            console.error('Failed to initialize RBAC/ABAC system:', error);
            throw error;
        }
    }

    /**
     * Load role hierarchy from Firestore
     */
    async loadRoleHierarchy() {
        try {
            const hierarchySnapshot = await Firebase.getDocs(
                Firebase.collection(Firebase.db, 'system', 'role-hierarchy')
            );

            hierarchySnapshot.forEach(doc => {
                const hierarchy = doc.data();
                this.roleHierarchy.set(hierarchy.role, hierarchy);
            });

            console.log('Role hierarchy loaded');
        } catch (error) {
            console.error('Failed to load role hierarchy:', error);
            // Set default hierarchy
            this.setDefaultRoleHierarchy();
        }
    }

    /**
     * Set default role hierarchy
     */
    setDefaultRoleHierarchy() {
        const defaultHierarchy = {
            'super-admin': {
                role: 'super-admin',
                level: 1,
                inherits: [],
                permissions: ['*'],
                scope: 'global'
            },
            'factory-admin': {
                role: 'factory-admin',
                level: 2,
                inherits: ['hr-staff', 'grievance-committee'],
                permissions: ['read', 'write', 'delete'],
                scope: 'assigned-factories'
            },
            'hr-staff': {
                role: 'hr-staff',
                level: 3,
                inherits: ['worker'],
                permissions: ['read', 'write'],
                scope: 'assigned-factories'
            },
            'grievance-committee': {
                role: 'grievance-committee',
                level: 3,
                inherits: ['worker'],
                permissions: ['read', 'write'],
                scope: 'assigned-factories'
            },
            'auditor': {
                role: 'auditor',
                level: 3,
                inherits: [],
                permissions: ['read', 'write-limited'],
                scope: 'assigned-factories'
            },
            'worker': {
                role: 'worker',
                level: 4,
                inherits: [],
                permissions: ['read-limited'],
                scope: 'own-records'
            }
        };

        for (const [role, hierarchy] of Object.entries(defaultHierarchy)) {
            this.roleHierarchy.set(role, hierarchy);
        }
    }

    /**
     * Load attribute policies from Firestore
     */
    async loadAttributePolicies() {
        try {
            const policiesSnapshot = await Firebase.getDocs(
                Firebase.collection(Firebase.db, 'system', 'attribute-policies')
            );

            policiesSnapshot.forEach(doc => {
                const policy = doc.data();
                this.attributePolicies.set(policy.name, policy);
            });

            console.log('Attribute policies loaded');
        } catch (error) {
            console.error('Failed to load attribute policies:', error);
            // Set default policies
            this.setDefaultAttributePolicies();
        }
    }

    /**
     * Set default attribute policies
     */
    setDefaultAttributePolicies() {
        const defaultPolicies = {
            'confidentiality': {
                name: 'confidentiality',
                levels: ['public', 'internal', 'confidential', 'restricted'],
                rules: {
                    'public': { read: ['*'], write: ['super-admin', 'factory-admin'] },
                    'internal': { read: ['super-admin', 'factory-admin', 'hr-staff'], write: ['super-admin', 'factory-admin'] },
                    'confidential': { read: ['super-admin', 'factory-admin'], write: ['super-admin'] },
                    'restricted': { read: ['super-admin'], write: ['super-admin'] }
                }
            },
            'data-sensitivity': {
                name: 'data-sensitivity',
                levels: ['low', 'medium', 'high', 'critical'],
                rules: {
                    'low': { read: ['*'], write: ['super-admin', 'factory-admin', 'hr-staff'] },
                    'medium': { read: ['super-admin', 'factory-admin', 'hr-staff'], write: ['super-admin', 'factory-admin'] },
                    'high': { read: ['super-admin', 'factory-admin'], write: ['super-admin'] },
                    'critical': { read: ['super-admin'], write: ['super-admin'] }
                }
            },
            'time-based': {
                name: 'time-based',
                rules: {
                    'business-hours': { start: '09:00', end: '17:00', timezone: 'Asia/Phnom_Penh' },
                    'after-hours': { start: '17:00', end: '09:00', timezone: 'Asia/Phnom_Penh' }
                }
            }
        };

        for (const [name, policy] of Object.entries(defaultPolicies)) {
            this.attributePolicies.set(name, policy);
        }
    }

    /**
     * Check if user has permission for specific action and resource
     */
    async hasPermission(userId, action, resource, context = {}) {
        try {
            // Get user's role and attributes
            const userContext = await this.getUserContext(userId);
            if (!userContext) {
                return false;
            }

            // Check basic RBAC permissions
            const rbacResult = await this.checkRBACPermissions(userContext, action, resource);
            if (!rbacResult.allowed) {
                return false;
            }

            // Check ABAC policies
            const abacResult = await this.checkABACPolicies(userContext, action, resource, context);
            if (!abacResult.allowed) {
                return false;
            }

            // Check field-level permissions
            const fieldResult = await this.checkFieldLevelPermissions(userContext, action, resource, context);
            if (!fieldResult.allowed) {
                return false;
            }

            // Check record-level permissions
            const recordResult = await this.checkRecordLevelPermissions(userContext, action, resource, context);
            if (!recordResult.allowed) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Permission check failed:', error);
            return false;
        }
    }

    /**
     * Get user context including role and attributes
     */
    async getUserContext(userId) {
        try {
            const userDoc = await Firebase.getDoc(
                Firebase.doc(Firebase.db, 'users', userId)
            );

            if (!userDoc.exists()) {
                return null;
            }

            const userData = userDoc.data();
            
            // Get user's role hierarchy
            const roleHierarchy = this.getRoleHierarchy(userData.role);
            
            // Get user's attributes
            const attributes = await this.getUserAttributes(userId);

            return {
                userId,
                role: userData.role,
                roleLevel: roleHierarchy.level,
                inherits: roleHierarchy.inherits,
                permissions: roleHierarchy.permissions,
                scope: roleHierarchy.scope,
                attributes,
                tenantId: userData.tenantId,
                assignedFactories: userData.assignedFactories || []
            };
        } catch (error) {
            console.error('Failed to get user context:', error);
            return null;
        }
    }

    /**
     * Get role hierarchy for specific role
     */
    getRoleHierarchy(role) {
        return this.roleHierarchy.get(role) || this.roleHierarchy.get('worker');
    }

    /**
     * Get user attributes
     */
    async getUserAttributes(userId) {
        try {
            const attributesDoc = await Firebase.getDoc(
                Firebase.doc(Firebase.db, 'users', userId, 'attributes')
            );

            if (attributesDoc.exists()) {
                return attributesDoc.data();
            }

            // Return default attributes
            return {
                clearance: 'standard',
                department: 'general',
                location: 'main',
                certifications: [],
                training: [],
                lastAudit: null
            };
        } catch (error) {
            console.error('Failed to get user attributes:', error);
            return {};
        }
    }

    /**
     * Check RBAC permissions
     */
    async checkRBACPermissions(userContext, action, resource) {
        try {
            // Check if user has direct permission
            if (userContext.permissions.includes('*') || userContext.permissions.includes(action)) {
                return { allowed: true, reason: 'Direct permission' };
            }

            // Check inherited permissions
            for (const inheritedRole of userContext.inherits) {
                const inheritedHierarchy = this.getRoleHierarchy(inheritedRole);
                if (inheritedHierarchy.permissions.includes('*') || inheritedHierarchy.permissions.includes(action)) {
                    return { allowed: true, reason: `Inherited from ${inheritedRole}` };
                }
            }

            return { allowed: false, reason: 'No RBAC permission' };
        } catch (error) {
            console.error('RBAC permission check failed:', error);
            return { allowed: false, reason: 'RBAC check error' };
        }
    }

    /**
     * Check ABAC policies
     */
    async checkABACPolicies(userContext, action, resource, context) {
        try {
            // Check confidentiality level
            const confidentialityResult = await this.checkConfidentialityPolicy(userContext, action, resource, context);
            if (!confidentialityResult.allowed) {
                return confidentialityResult;
            }

            // Check data sensitivity
            const sensitivityResult = await this.checkDataSensitivityPolicy(userContext, action, resource, context);
            if (!sensitivityResult.allowed) {
                return sensitivityResult;
            }

            // Check time-based policies
            const timeResult = await this.checkTimeBasedPolicy(userContext, action, resource, context);
            if (!timeResult.allowed) {
                return timeResult;
            }

            // Check location-based policies
            const locationResult = await this.checkLocationPolicy(userContext, action, resource, context);
            if (!locationResult.allowed) {
                return locationResult;
            }

            return { allowed: true, reason: 'ABAC policies passed' };
        } catch (error) {
            console.error('ABAC policy check failed:', error);
            return { allowed: false, reason: 'ABAC check error' };
        }
    }

    /**
     * Check confidentiality policy
     */
    async checkConfidentialityPolicy(userContext, action, resource, context) {
        try {
            const confidentiality = context.confidentiality || 'internal';
            const policy = this.attributePolicies.get('confidentiality');
            
            if (!policy || !policy.rules[confidentiality]) {
                return { allowed: true, reason: 'No confidentiality policy' };
            }

            const rules = policy.rules[confidentiality];
            const canRead = rules.read.includes('*') || rules.read.includes(userContext.role);
            const canWrite = rules.write.includes('*') || rules.write.includes(userContext.role);

            if (action === 'read' && !canRead) {
                return { allowed: false, reason: `Insufficient clearance for ${confidentiality} data` };
            }

            if (action === 'write' && !canWrite) {
                return { allowed: false, reason: `Insufficient clearance for ${confidentiality} data` };
            }

            return { allowed: true, reason: 'Confidentiality policy passed' };
        } catch (error) {
            console.error('Confidentiality policy check failed:', error);
            return { allowed: false, reason: 'Confidentiality check error' };
        }
    }

    /**
     * Check data sensitivity policy
     */
    async checkDataSensitivityPolicy(userContext, action, resource, context) {
        try {
            const sensitivity = context.sensitivity || 'medium';
            const policy = this.attributePolicies.get('data-sensitivity');
            
            if (!policy || !policy.rules[sensitivity]) {
                return { allowed: true, reason: 'No sensitivity policy' };
            }

            const rules = policy.rules[sensitivity];
            const canRead = rules.read.includes('*') || rules.read.includes(userContext.role);
            const canWrite = rules.write.includes('*') || rules.write.includes(userContext.role);

            if (action === 'read' && !canRead) {
                return { allowed: false, reason: `Insufficient clearance for ${sensitivity} sensitivity data` };
            }

            if (action === 'write' && !canWrite) {
                return { allowed: false, reason: `Insufficient clearance for ${sensitivity} sensitivity data` };
            }

            return { allowed: true, reason: 'Data sensitivity policy passed' };
        } catch (error) {
            console.error('Data sensitivity policy check failed:', error);
            return { allowed: false, reason: 'Sensitivity check error' };
        }
    }

    /**
     * Check time-based policy
     */
    async checkTimeBasedPolicy(userContext, action, resource, context) {
        try {
            const policy = this.attributePolicies.get('time-based');
            if (!policy) {
                return { allowed: true, reason: 'No time-based policy' };
            }

            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', { 
                hour12: false, 
                timeZone: 'Asia/Phnom_Penh' 
            });

            // Check if current time is within business hours
            const businessHours = policy.rules['business-hours'];
            const isBusinessHours = currentTime >= businessHours.start && currentTime <= businessHours.end;

            // Restrict certain actions outside business hours
            if (!isBusinessHours && ['delete', 'admin'].includes(action)) {
                return { allowed: false, reason: 'Action restricted outside business hours' };
            }

            return { allowed: true, reason: 'Time-based policy passed' };
        } catch (error) {
            console.error('Time-based policy check failed:', error);
            return { allowed: false, reason: 'Time check error' };
        }
    }

    /**
     * Check location policy
     */
    async checkLocationPolicy(userContext, action, resource, context) {
        try {
            const userLocation = userContext.attributes.location;
            const resourceLocation = context.location;

            // If resource has location restriction, check if user is in allowed location
            if (resourceLocation && userLocation !== resourceLocation) {
                // Check if user has override permission
                if (userContext.role === 'super-admin' || userContext.role === 'factory-admin') {
                    return { allowed: true, reason: 'Location override by admin' };
                }
                return { allowed: false, reason: 'Location access denied' };
            }

            return { allowed: true, reason: 'Location policy passed' };
        } catch (error) {
            console.error('Location policy check failed:', error);
            return { allowed: false, reason: 'Location check error' };
        }
    }

    /**
     * Check field-level permissions
     */
    async checkFieldLevelPermissions(userContext, action, resource, context) {
        try {
            const fields = context.fields || [];
            if (fields.length === 0) {
                return { allowed: true, reason: 'No field restrictions' };
            }

            // Get field-level permissions for user's role
            const fieldPermissions = await this.getFieldPermissions(userContext.role, resource);
            
            for (const field of fields) {
                const fieldPermission = fieldPermissions[field];
                if (fieldPermission) {
                    if (!fieldPermission.includes(action)) {
                        return { 
                            allowed: false, 
                            reason: `Field '${field}' access denied for action '${action}'` 
                        };
                    }
                }
            }

            return { allowed: true, reason: 'Field-level permissions passed' };
        } catch (error) {
            console.error('Field-level permission check failed:', error);
            return { allowed: false, reason: 'Field check error' };
        }
    }

    /**
     * Get field-level permissions for role and resource
     */
    async getFieldPermissions(role, resource) {
        try {
            const permissionsDoc = await Firebase.getDoc(
                Firebase.doc(Firebase.db, 'system', 'field-permissions', `${role}-${resource}`)
            );

            if (permissionsDoc.exists()) {
                return permissionsDoc.data();
            }

            // Return default field permissions
            return this.getDefaultFieldPermissions(role, resource);
        } catch (error) {
            console.error('Failed to get field permissions:', error);
            return this.getDefaultFieldPermissions(role, resource);
        }
    }

    /**
     * Get default field permissions
     */
    getDefaultFieldPermissions(role, resource) {
        const defaultPermissions = {
            'super-admin': {
                'user': { '*': ['read', 'write', 'delete'] },
                'factory': { '*': ['read', 'write', 'delete'] },
                'document': { '*': ['read', 'write', 'delete'] },
                'case': { '*': ['read', 'write', 'delete'] },
                'cap': { '*': ['read', 'write', 'delete'] }
            },
            'factory-admin': {
                'user': { 
                    'name': ['read', 'write'], 
                    'email': ['read', 'write'], 
                    'role': ['read'], 
                    'password': ['read'] 
                },
                'factory': { '*': ['read', 'write'] },
                'document': { '*': ['read', 'write'] },
                'case': { '*': ['read', 'write'] },
                'cap': { '*': ['read', 'write'] }
            },
            'hr-staff': {
                'user': { 
                    'name': ['read', 'write'], 
                    'email': ['read', 'write'], 
                    'role': ['read'], 
                    'password': ['read'] 
                },
                'factory': { 'name': ['read'], 'location': ['read'] },
                'document': { '*': ['read', 'write'] },
                'case': { '*': ['read', 'write'] },
                'cap': { '*': ['read', 'write'] }
            }
        };

        return defaultPermissions[role]?.[resource] || {};
    }

    /**
     * Check record-level permissions
     */
    async checkRecordLevelPermissions(userContext, action, resource, context) {
        try {
            const recordId = context.recordId;
            if (!recordId) {
                return { allowed: true, reason: 'No record restrictions' };
            }

            // Check ownership
            if (await this.isRecordOwner(userContext.userId, resource, recordId)) {
                return { allowed: true, reason: 'Record owner' };
            }

            // Check factory assignment
            if (context.factoryId && userContext.assignedFactories.includes(context.factoryId)) {
                return { allowed: true, reason: 'Factory assigned' };
            }

            // Check tenant access
            if (context.tenantId === userContext.tenantId) {
                return { allowed: true, reason: 'Tenant access' };
            }

            return { allowed: false, reason: 'Record access denied' };
        } catch (error) {
            console.error('Record-level permission check failed:', error);
            return { allowed: false, reason: 'Record check error' };
        }
    }

    /**
     * Check if user is record owner
     */
    async isRecordOwner(userId, resource, recordId) {
        try {
            const recordDoc = await Firebase.getDoc(
                Firebase.doc(Firebase.db, resource, recordId)
            );

            if (recordDoc.exists()) {
                const recordData = recordDoc.data();
                return recordData.createdBy === userId || recordData.owner === userId;
            }

            return false;
        } catch (error) {
            console.error('Failed to check record ownership:', error);
            return false;
        }
    }

    /**
     * Create permission policy
     */
    async createPermissionPolicy(policyData) {
        try {
            const policyId = this.generatePolicyId(policyData.name);
            
            const policy = {
                id: policyId,
                name: policyData.name,
                type: policyData.type, // 'rbac', 'abac', 'field', 'record'
                rules: policyData.rules,
                scope: policyData.scope,
                status: 'active',
                createdAt: Firebase.serverTimestamp(),
                createdBy: Firebase.auth.currentUser?.uid
            };

            await Firebase.setDoc(
                Firebase.doc(Firebase.db, 'system', 'permission-policies', policyId),
                policy
            );

            console.log(`Permission policy created: ${policyId}`);
            return policyId;
        } catch (error) {
            console.error('Failed to create permission policy:', error);
            throw error;
        }
    }

    /**
     * Generate policy ID
     */
    generatePolicyId(name) {
        const timestamp = Date.now().toString(36);
        const nameHash = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
        return `${nameHash}-${timestamp}`;
    }

    /**
     * Get effective permissions for user
     */
    async getEffectivePermissions(userId) {
        try {
            const userContext = await this.getUserContext(userId);
            if (!userContext) {
                return null;
            }

            const effectivePermissions = {
                role: userContext.role,
                level: userContext.level,
                permissions: [...userContext.permissions],
                scope: userContext.scope,
                attributes: userContext.attributes,
                restrictions: []
            };

            // Add inherited permissions
            for (const inheritedRole of userContext.inherits) {
                const inheritedHierarchy = this.getRoleHierarchy(inheritedRole);
                effectivePermissions.permissions.push(...inheritedHierarchy.permissions);
            }

            // Remove duplicates
            effectivePermissions.permissions = [...new Set(effectivePermissions.permissions)];

            return effectivePermissions;
        } catch (error) {
            console.error('Failed to get effective permissions:', error);
            return null;
        }
    }

    /**
     * Validate permission policy
     */
    validatePermissionPolicy(policy) {
        const errors = [];

        if (!policy.name || policy.name.length < 3) {
            errors.push('Policy name must be at least 3 characters');
        }

        if (!policy.type || !['rbac', 'abac', 'field', 'record'].includes(policy.type)) {
            errors.push('Invalid policy type');
        }

        if (!policy.rules || Object.keys(policy.rules).length === 0) {
            errors.push('Policy rules are required');
        }

        if (!policy.scope) {
            errors.push('Policy scope is required');
        }

        return errors;
    }
}

/**
 * Permission Evaluator for complex permission scenarios
 */
class PermissionEvaluator {
    constructor() {
        this.evaluationCache = new Map();
        this.ruleEngine = new RuleEngine();
    }

    /**
     * Evaluate complex permission scenario
     */
    async evaluatePermission(scenario) {
        try {
            const cacheKey = this.generateCacheKey(scenario);
            
            if (this.evaluationCache.has(cacheKey)) {
                return this.evaluationCache.get(cacheKey);
            }

            const result = await this.ruleEngine.evaluate(scenario);
            
            // Cache result
            this.evaluationCache.set(cacheKey, result);
            
            return result;
        } catch (error) {
            console.error('Permission evaluation failed:', error);
            return { allowed: false, reason: 'Evaluation error' };
        }
    }

    /**
     * Generate cache key for scenario
     */
    generateCacheKey(scenario) {
        return JSON.stringify({
            userId: scenario.userId,
            action: scenario.action,
            resource: scenario.resource,
            context: scenario.context
        });
    }

    /**
     * Clear evaluation cache
     */
    clearCache() {
        this.evaluationCache.clear();
    }
}

/**
 * Rule Engine for complex permission evaluation
 */
class RuleEngine {
    constructor() {
        this.rules = new Map();
        this.conditions = new Map();
    }

    /**
     * Evaluate permission scenario using rules
     */
    async evaluate(scenario) {
        try {
            // Apply all applicable rules
            for (const [ruleName, rule] of this.rules) {
                if (this.isRuleApplicable(rule, scenario)) {
                    const result = await this.applyRule(rule, scenario);
                    if (!result.allowed) {
                        return result;
                    }
                }
            }

            return { allowed: true, reason: 'All rules passed' };
        } catch (error) {
            console.error('Rule evaluation failed:', error);
            return { allowed: false, reason: 'Rule evaluation error' };
        }
    }

    /**
     * Check if rule is applicable to scenario
     */
    isRuleApplicable(rule, scenario) {
        return rule.conditions.every(condition => 
            this.evaluateCondition(condition, scenario)
        );
    }

    /**
     * Evaluate condition
     */
    evaluateCondition(condition, scenario) {
        const { field, operator, value } = condition;
        
        switch (operator) {
            case 'equals':
                return scenario[field] === value;
            case 'not-equals':
                return scenario[field] !== value;
            case 'contains':
                return scenario[field]?.includes(value);
            case 'greater-than':
                return scenario[field] > value;
            case 'less-than':
                return scenario[field] < value;
            case 'in':
                return Array.isArray(value) && value.includes(scenario[field]);
            default:
                return false;
        }
    }

    /**
     * Apply rule to scenario
     */
    async applyRule(rule, scenario) {
        try {
            // Execute rule actions
            for (const action of rule.actions) {
                const result = await this.executeAction(action, scenario);
                if (!result.success) {
                    return { allowed: false, reason: result.reason };
                }
            }

            return { allowed: true, reason: `Rule '${rule.name}' applied successfully` };
        } catch (error) {
            console.error('Rule application failed:', error);
            return { allowed: false, reason: 'Rule application error' };
        }
    }

    /**
     * Execute rule action
     */
    async executeAction(action, scenario) {
        try {
            switch (action.type) {
                case 'check-permission':
                    return await this.checkPermission(action.params, scenario);
                case 'validate-data':
                    return await this.validateData(action.params, scenario);
                case 'apply-restriction':
                    return await this.applyRestriction(action.params, scenario);
                default:
                    return { success: false, reason: 'Unknown action type' };
            }
        } catch (error) {
            console.error('Action execution failed:', error);
            return { success: false, reason: 'Action execution error' };
        }
    }

    /**
     * Check permission
     */
    async checkPermission(params, scenario) {
        // Implementation for permission checking
        return { success: true };
    }

    /**
     * Validate data
     */
    async validateData(params, scenario) {
        // Implementation for data validation
        return { success: true };
    }

    /**
     * Apply restriction
     */
    async applyRestriction(params, scenario) {
        // Implementation for applying restrictions
        return { success: true };
    }
}

// Export for use in other modules
window.AdvancedRBACABAC = AdvancedRBACABAC;
window.PermissionEvaluator = PermissionEvaluator;
window.RuleEngine = RuleEngine;

// Initialize advanced RBAC/ABAC system
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Firebase !== 'undefined') {
        window.advancedRBAC = new AdvancedRBACABAC();
        console.log('Advanced RBAC/ABAC system initialized');
    }
});
