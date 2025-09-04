// Enhanced RBAC/ABAC System for Angkor Compliance v2
// Implements advanced role-based access control with attribute-based filtering

class EnhancedRBACSystem {
    constructor() {
        this.db = window.Firebase?.db;
        this.roles = new Map();
        this.permissions = new Map();
        this.policies = new Map();
        this.userSessions = new Map();
        this.isInitialized = false;
        
        this.initializeEnhancedRBAC();
    }

    async initializeEnhancedRBAC() {
        try {
            console.log('🔐 Initializing Enhanced RBAC/ABAC System...');
            
            // Load all RBAC data
            await Promise.all([
                this.loadRoles(),
                this.loadPermissions(),
                this.loadPolicies()
            ]);
            
            this.isInitialized = true;
            console.log('✅ Enhanced RBAC/ABAC System initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Enhanced RBAC/ABAC System:', error);
            this.isInitialized = false;
        }
    }

    async loadRoles() {
        try {
            const rolesSnapshot = await this.db.collection('roles').get();
            rolesSnapshot.forEach(doc => {
                const role = { id: doc.id, ...doc.data() };
                this.roles.set(role.id, role);
            });
            console.log(`📋 Loaded ${this.roles.size} roles`);
        } catch (error) {
            console.error('Error loading roles:', error);
        }
    }

    async loadPermissions() {
        try {
            const permissionsSnapshot = await this.db.collection('permissions').get();
            permissionsSnapshot.forEach(doc => {
                const permission = { id: doc.id, ...doc.data() };
                this.permissions.set(permission.id, permission);
            });
            console.log(`📋 Loaded ${this.permissions.size} permissions`);
        } catch (error) {
            console.error('Error loading permissions:', error);
        }
    }

    async loadPolicies() {
        try {
            const policiesSnapshot = await this.db.collection('policies').get();
            policiesSnapshot.forEach(doc => {
                const policy = { id: doc.id, ...doc.data() };
                this.policies.set(policy.id, policy);
            });
            console.log(`📋 Loaded ${this.policies.size} policies`);
        } catch (error) {
            console.error('Error loading policies:', error);
        }
    }

    // Role Management Methods
    async createRole(roleData) {
        try {
            const role = {
                id: `role_${Date.now()}`,
                ...roleData,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'active'
            };

            await this.db.collection('roles').doc(role.id).set(role);
            this.roles.set(role.id, role);
            
            console.log(`✅ Created role: ${role.name}`);
            return role;
        } catch (error) {
            console.error('Error creating role:', error);
            throw error;
        }
    }

    async updateRole(roleId, updates) {
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            await this.db.collection('roles').doc(roleId).update(updateData);
            
            const role = this.roles.get(roleId);
            if (role) {
                Object.assign(role, updateData);
            }
            
            console.log(`✅ Updated role: ${roleId}`);
        } catch (error) {
            console.error('Error updating role:', error);
            throw error;
        }
    }

    // Permission Management Methods
    async createPermission(permissionData) {
        try {
            const permission = {
                id: `permission_${Date.now()}`,
                ...permissionData,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'active'
            };

            await this.db.collection('permissions').doc(permission.id).set(permission);
            this.permissions.set(permission.id, permission);
            
            console.log(`✅ Created permission: ${permission.name}`);
            return permission;
        } catch (error) {
            console.error('Error creating permission:', error);
            throw error;
        }
    }

    // Policy Management Methods
    async createPolicy(policyData) {
        try {
            const policy = {
                id: `policy_${Date.now()}`,
                ...policyData,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'active'
            };

            await this.db.collection('policies').doc(policy.id).set(policy);
            this.policies.set(policy.id, policy);
            
            console.log(`✅ Created policy: ${policy.name}`);
            return policy;
        } catch (error) {
            console.error('Error creating policy:', error);
            throw error;
        }
    }

    // Access Control Methods
    async checkAccess(userId, resource, action, context = {}) {
        try {
            // Get user data
            const userDoc = await this.db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                return { allowed: false, reason: 'User not found' };
            }

            const userData = userDoc.data();
            const userRole = userData.role;
            const userAttributes = {
                factoryId: userData.factoryId,
                organizationId: userData.organizationId,
                department: userData.department,
                location: userData.location,
                clearanceLevel: userData.clearanceLevel || 'standard'
            };

            // Check role-based permissions
            const rolePermissions = await this.getRolePermissions(userRole);
            const hasPermission = rolePermissions.some(perm => 
                perm.resource === resource && 
                perm.action === action
            );

            if (!hasPermission) {
                return { allowed: false, reason: 'Insufficient role permissions' };
            }

            // Check attribute-based policies
            const policyResult = await this.evaluatePolicies(userAttributes, resource, action, context);
            if (!policyResult.allowed) {
                return policyResult;
            }

            // Check field-level permissions
            const fieldPermissions = await this.checkFieldPermissions(userRole, resource, context.fields);
            if (!fieldPermissions.allowed) {
                return fieldPermissions;
            }

            // Log access attempt
            await this.logAccessAttempt(userId, resource, action, context, true);

            return { allowed: true, reason: 'Access granted' };
        } catch (error) {
            console.error('Error checking access:', error);
            return { allowed: false, reason: 'System error' };
        }
    }

    async getRolePermissions(role) {
        const roleData = this.roles.get(role);
        if (!roleData) {
            return [];
        }

        const permissions = [];
        roleData.permissions.forEach(permId => {
            const permission = this.permissions.get(permId);
            if (permission) {
                permissions.push(permission);
            }
        });

        return permissions;
    }

    async evaluatePolicies(userAttributes, resource, action, context) {
        const applicablePolicies = Array.from(this.policies.values())
            .filter(policy => 
                policy.status === 'active' &&
                policy.resources.includes(resource) &&
                policy.actions.includes(action)
            );

        for (const policy of applicablePolicies) {
            const conditions = policy.conditions || [];
            let allConditionsMet = true;

            for (const condition of conditions) {
                const conditionMet = this.evaluateCondition(condition, userAttributes, context);
                if (!conditionMet) {
                    allConditionsMet = false;
                    break;
                }
            }

            if (allConditionsMet) {
                return { allowed: policy.effect === 'allow', reason: policy.description };
            }
        }

        return { allowed: false, reason: 'No applicable policies found' };
    }

    evaluateCondition(condition, userAttributes, context) {
        const { attribute, operator, value } = condition;

        switch (operator) {
            case 'equals':
                return userAttributes[attribute] === value;
            case 'not_equals':
                return userAttributes[attribute] !== value;
            case 'in':
                return Array.isArray(value) && value.includes(userAttributes[attribute]);
            case 'not_in':
                return Array.isArray(value) && !value.includes(userAttributes[attribute]);
            case 'contains':
                return userAttributes[attribute] && userAttributes[attribute].includes(value);
            case 'starts_with':
                return userAttributes[attribute] && userAttributes[attribute].startsWith(value);
            case 'ends_with':
                return userAttributes[attribute] && userAttributes[attribute].endsWith(value);
            case 'greater_than':
                return userAttributes[attribute] > value;
            case 'less_than':
                return userAttributes[attribute] < value;
            case 'greater_than_or_equal':
                return userAttributes[attribute] >= value;
            case 'less_than_or_equal':
                return userAttributes[attribute] <= value;
            case 'exists':
                return userAttributes[attribute] !== undefined && userAttributes[attribute] !== null;
            case 'not_exists':
                return userAttributes[attribute] === undefined || userAttributes[attribute] === null;
            default:
                return false;
        }
    }

    async checkFieldPermissions(role, resource, fields = []) {
        // Implement field-level permissions
        const fieldPermissions = {
            'super_admin': ['*'], // All fields
            'factory_admin': ['*'], // All fields for their factory
            'hr_staff': ['name', 'email', 'department', 'role', 'status'],
            'auditor': ['name', 'email', 'department', 'role', 'status'],
            'grievance_committee': ['name', 'email', 'department', 'role', 'status'],
            'worker': ['name', 'email', 'department']
        };

        const allowedFields = fieldPermissions[role] || [];
        
        if (allowedFields.includes('*')) {
            return { allowed: true, fields: fields };
        }

        const unauthorizedFields = fields.filter(field => !allowedFields.includes(field));
        
        if (unauthorizedFields.length > 0) {
            return { 
                allowed: false, 
                reason: `Unauthorized fields: ${unauthorizedFields.join(', ')}`,
                unauthorizedFields: unauthorizedFields
            };
        }

        return { allowed: true, fields: fields };
    }

    async logAccessAttempt(userId, resource, action, context, allowed) {
        try {
            const logEntry = {
                userId: userId,
                resource: resource,
                action: action,
                context: context,
                allowed: allowed,
                timestamp: new Date(),
                ipAddress: context.ipAddress || 'unknown',
                userAgent: context.userAgent || 'unknown'
            };

            await this.db.collection('access_logs').add(logEntry);
        } catch (error) {
            console.error('Error logging access attempt:', error);
        }
    }

    // Grievance Committee Specific Methods
    async assignGrievanceCase(caseId, committeeMemberId) {
        try {
            const accessCheck = await this.checkAccess(
                committeeMemberId, 
                'grievance_cases', 
                'assign', 
                { caseId: caseId }
            );

            if (!accessCheck.allowed) {
                throw new Error(`Access denied: ${accessCheck.reason}`);
            }

            const updateData = {
                assignedTo: committeeMemberId,
                assignedAt: new Date(),
                status: 'assigned'
            };

            await this.db.collection('grievance_cases').doc(caseId).update(updateData);
            
            console.log(`✅ Assigned grievance case ${caseId} to ${committeeMemberId}`);
            return { success: true, caseId: caseId };
        } catch (error) {
            console.error('Error assigning grievance case:', error);
            throw error;
        }
    }

    async updateGrievanceStatus(caseId, newStatus, userId, notes = '') {
        try {
            const accessCheck = await this.checkAccess(
                userId, 
                'grievance_cases', 
                'update_status', 
                { caseId: caseId, newStatus: newStatus }
            );

            if (!accessCheck.allowed) {
                throw new Error(`Access denied: ${accessCheck.reason}`);
            }

            const updateData = {
                status: newStatus,
                updatedAt: new Date(),
                updatedBy: userId,
                notes: notes
            };

            // Add status-specific timestamps
            if (newStatus === 'investigating') {
                updateData.investigationStartedAt = new Date();
            } else if (newStatus === 'resolved') {
                updateData.resolvedAt = new Date();
            } else if (newStatus === 'closed') {
                updateData.closedAt = new Date();
            }

            await this.db.collection('grievance_cases').doc(caseId).update(updateData);
            
            console.log(`✅ Updated grievance case ${caseId} status to ${newStatus}`);
            return { success: true, caseId: caseId, status: newStatus };
        } catch (error) {
            console.error('Error updating grievance status:', error);
            throw error;
        }
    }

    async addGrievanceNote(caseId, userId, note, isInternal = false) {
        try {
            const accessCheck = await this.checkAccess(
                userId, 
                'grievance_cases', 
                'add_note', 
                { caseId: caseId }
            );

            if (!accessCheck.allowed) {
                throw new Error(`Access denied: ${accessCheck.reason}`);
            }

            const noteData = {
                id: `note_${Date.now()}`,
                caseId: caseId,
                userId: userId,
                note: note,
                isInternal: isInternal,
                createdAt: new Date()
            };

            await this.db.collection('grievance_notes').add(noteData);
            
            console.log(`✅ Added note to grievance case ${caseId}`);
            return { success: true, noteId: noteData.id };
        } catch (error) {
            console.error('Error adding grievance note:', error);
            throw error;
        }
    }

    // Utility Methods
    getRoleHierarchy() {
        return {
            'super_admin': ['factory_admin', 'hr_staff', 'auditor', 'grievance_committee', 'worker'],
            'factory_admin': ['hr_staff', 'worker'],
            'hr_staff': ['worker'],
            'auditor': [],
            'grievance_committee': [],
            'worker': []
        };
    }

    async getUserEffectivePermissions(userId) {
        try {
            const userDoc = await this.db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                return [];
            }

            const userData = userDoc.data();
            const rolePermissions = await this.getRolePermissions(userData.role);
            
            // Filter permissions based on user attributes
            const userAttributes = {
                factoryId: userData.factoryId,
                organizationId: userData.organizationId
            };

            const effectivePermissions = rolePermissions.filter(permission => {
                if (permission.conditions) {
                    return permission.conditions.every(condition => 
                        this.evaluateCondition(condition, userAttributes, {})
                    );
                }
                return true;
            });

            return effectivePermissions;
        } catch (error) {
            console.error('Error getting user effective permissions:', error);
            return [];
        }
    }

    // Export Methods
    async exportRBACConfig(format = 'json') {
        try {
            const config = {
                roles: Array.from(this.roles.values()),
                permissions: Array.from(this.permissions.values()),
                policies: Array.from(this.policies.values()),
                exportedAt: new Date()
            };
            
            if (format === 'json') {
                return config;
            } else if (format === 'csv') {
                return this.convertToCSV(config);
            }
        } catch (error) {
            console.error('Error exporting RBAC config:', error);
            throw error;
        }
    }

    convertToCSV(data) {
        // Implementation for CSV conversion
        return 'CSV data would be generated here';
    }
}

// Initialize Enhanced RBAC System
window.enhancedRBACSystem = new EnhancedRBACSystem();

// Export for use in other files
window.RBACSystem = window.enhancedRBACSystem;
