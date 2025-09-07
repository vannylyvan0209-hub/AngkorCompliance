/**
 * Angkor Compliance Platform - User Management Service
 * Handles user CRUD operations, role assignments, and factory management
 */

import { Firebase } from '../../../firebase-config.js';

class UserManagementService {
    constructor() {
        // Initialize the service
        this.init();
    }

    /**
     * Initialize the service
     */
    async init() {
        try {
            console.log('✅ UserManagementService initialized successfully');
        } catch (error) {
            console.error('❌ UserManagementService initialization failed:', error);
        }
    }

    /**
     * Create a new user
     */
    async createUser(userData) {
        try {
            const {
                email,
                displayName,
                role,
                factoryId,
                organizationId,
                profile = {},
                permissions = []
            } = userData;

            // Validate required fields
            if (!email || !displayName || !role) {
                throw new Error('Email, display name, and role are required');
            }

            // Validate role
            const validRoles = ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'analytics_user', 'worker'];
            if (!validRoles.includes(role)) {
                throw new Error('Invalid role specified');
            }

            // Create user document
            const userDoc = {
                email,
                displayName,
                role,
                factoryId: factoryId || null,
                organizationId: organizationId || null,
                permissions: permissions.length > 0 ? permissions : this.getDefaultPermissions(role),
                isActive: true,
                createdAt: Firebase.serverTimestamp(),
                updatedAt: Firebase.serverTimestamp(),
                lastLogin: null,
                profile: {
                    phone: profile.phone || '',
                    department: profile.department || '',
                    position: profile.position || '',
                    avatar: profile.avatar || '',
                    ...profile
                },
                metadata: {
                    createdBy: window.authService?.getCurrentUser()?.uid || 'system',
                    lastModifiedBy: window.authService?.getCurrentUser()?.uid || 'system'
                }
            };

            // Add to Firestore
            const userRef = await Firebase.addDoc(Firebase.collection(Firebase.db, 'users'), userDoc);
            
            console.log('✅ User created successfully:', { id: userRef.id, ...userDoc });
            return { id: userRef.id, ...userDoc };

        } catch (error) {
            console.error('❌ Failed to create user:', error);
            throw error;
        }
    }

    /**
     * Update an existing user
     */
    async updateUser(userId, updates) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const userRef = Firebase.doc(Firebase.collection(Firebase.db, 'users'), userId);
            
            // Get current user data
            const currentUser = await Firebase.getDoc(userRef);
            if (!currentUser.exists()) {
                throw new Error('User not found');
            }

            // Prepare update data
            const updateData = {
                ...updates,
                updatedAt: Firebase.serverTimestamp(),
                metadata: {
                    ...currentUser.data().metadata,
                    lastModifiedBy: window.authService?.getCurrentUser()?.uid || 'system',
                    lastModifiedAt: new Date()
                }
            };

            // Update user document
            await Firebase.updateDoc(userRef, updateData);
            
            console.log('✅ User updated successfully:', userId);
            return { id: userId, ...updateData };

        } catch (error) {
            console.error('❌ Failed to update user:', error);
            throw error;
        }
    }

    /**
     * Delete a user (soft delete by deactivating)
     */
    async deleteUser(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            // Soft delete by deactivating
            await this.deactivateUser(userId);
            
            // Add deletion metadata
            const userRef = Firebase.doc(Firebase.collection(Firebase.db, 'users'), userId);
            await Firebase.updateDoc(userRef, {
                deletedAt: Firebase.serverTimestamp(),
                deletedBy: window.authService?.getCurrentUser()?.uid || 'system',
                isDeleted: true
            });

            console.log('✅ User deleted successfully:', userId);
            return true;

        } catch (error) {
            console.error('❌ Failed to delete user:', error);
            throw error;
        }
    }

    /**
     * Get a single user by ID
     */
    async getUser(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const userRef = Firebase.doc(Firebase.collection(Firebase.db, 'users'), userId);
            const userDoc = await Firebase.getDoc(userRef);
            
            if (!userDoc.exists()) {
                return null;
            }

            return { id: userDoc.id, ...userDoc.data() };

        } catch (error) {
            console.error('❌ Failed to get user:', error);
            throw error;
        }
    }

    /**
     * Get multiple users with filtering and pagination
     */
    async getUsers(options = {}) {
        try {
            const {
                limit = 50,
                offset = 0,
                role = null,
                factoryId = null,
                isActive = null,
                searchTerm = null
            } = options;

            let query = Firebase.collection(Firebase.db, 'users');

            // Apply filters
            if (role) {
                query = Firebase.query(query, Firebase.where('role', '==', role));
            }
            if (factoryId) {
                query = Firebase.query(query, Firebase.where('factoryId', '==', factoryId));
            }
            if (isActive !== null) {
                query = Firebase.query(query, Firebase.where('isActive', '==', isActive));
            }

            // Add ordering
            query = Firebase.query(query, Firebase.orderBy('createdAt', 'desc'));

            // Get documents
            const snapshot = await Firebase.getDocs(query);
            let users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Apply search filter if provided
            if (searchTerm) {
                users = users.filter(user => 
                    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.profile?.department?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Apply pagination
            const paginatedUsers = users.slice(offset, offset + limit);
            
            return {
                users: paginatedUsers,
                total: users.length,
                hasMore: offset + limit < users.length,
                pagination: {
                    limit,
                    offset,
                    total: users.length
                }
            };

        } catch (error) {
            console.error('❌ Failed to get users:', error);
            throw error;
        }
    }

    /**
     * Assign role to user
     */
    async assignRole(userId, newRole) {
        try {
            if (!userId || !newRole) {
                throw new Error('User ID and role are required');
            }

            // Validate role
            const validRoles = ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'analytics_user', 'worker'];
            if (!validRoles.includes(newRole)) {
                throw new Error('Invalid role specified');
            }

            // Update user role and permissions
            await this.updateUser(userId, {
                role: newRole,
                permissions: this.getDefaultPermissions(newRole)
            });

            console.log('✅ Role assigned successfully:', { userId, newRole });
            return true;

        } catch (error) {
            console.error('❌ Failed to assign role:', error);
            throw error;
        }
    }

    /**
     * Assign factory to user
     */
    async assignFactory(userId, factoryId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            // Update user factory
            await this.updateUser(userId, { factoryId });

            console.log('✅ Factory assigned successfully:', { userId, factoryId });
            return true;

        } catch (error) {
            console.error('❌ Failed to assign factory:', error);
            throw error;
        }
    }

    /**
     * Deactivate a user
     */
    async deactivateUser(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            await this.updateUser(userId, { isActive: false });
            
            console.log('✅ User deactivated successfully:', userId);
            return true;

        } catch (error) {
            console.error('❌ Failed to deactivate user:', error);
            throw error;
        }
    }

    /**
     * Activate a user
     */
    async activateUser(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            await this.updateUser(userId, { isActive: true });
            
            console.log('✅ User activated successfully:', userId);
            return true;

        } catch (error) {
            console.error('❌ Failed to activate user:', error);
            throw error;
        }
    }

    /**
     * Get users by specific role
     */
    async getUsersByRole(role, options = {}) {
        return this.getUsers({ ...options, role });
    }

    /**
     * Get users by specific factory
     */
    async getUsersByFactory(factoryId, options = {}) {
        return this.getUsers({ ...options, factoryId });
    }

    /**
     * Bulk update multiple users
     */
    async bulkUpdateUsers(userIds, updates) {
        try {
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                throw new Error('User IDs array is required');
            }

            const batch = Firebase.writeBatch(Firebase.db);
            const results = [];

            for (const userId of userIds) {
                const userRef = Firebase.doc(Firebase.collection(Firebase.db, 'users'), userId);
                batch.update(userRef, {
                    ...updates,
                    updatedAt: Firebase.serverTimestamp(),
                    metadata: {
                        lastModifiedBy: window.authService?.getCurrentUser()?.uid || 'system',
                        lastModifiedAt: new Date()
                    }
                });
                results.push({ userId, success: true });
            }

            await batch.commit();
            
            console.log('✅ Bulk update completed successfully:', results.length, 'users');
            return results;

        } catch (error) {
            console.error('❌ Bulk update failed:', error);
            throw error;
        }
    }

    /**
     * Search users by various criteria
     */
    async searchUsers(searchTerm, options = {}) {
        try {
            if (!searchTerm || searchTerm.trim().length < 2) {
                throw new Error('Search term must be at least 2 characters');
            }

            const searchOptions = {
                ...options,
                searchTerm: searchTerm.trim()
            };

            return this.getUsers(searchOptions);

        } catch (error) {
            console.error('❌ User search failed:', error);
            throw error;
        }
    }

    /**
     * Get default permissions for a role
     */
    getDefaultPermissions(role) {
        const permissions = {
            super_admin: [
                'manage_organizations',
                'manage_factories',
                'manage_users',
                'manage_standards',
                'view_all_data',
                'export_data',
                'system_config'
            ],
            factory_admin: [
                'manage_factory_users',
                'manage_factory_documents',
                'manage_factory_caps',
                'view_factory_analytics',
                'export_factory_data'
            ],
            hr_staff: [
                'manage_documents',
                'manage_training',
                'manage_permits',
                'view_hr_analytics'
            ],
            grievance_committee: [
                'manage_cases',
                'investigate_cases',
                'resolve_cases',
                'view_case_analytics'
            ],
            auditor: [
                'view_assigned_factories',
                'conduct_audits',
                'create_findings',
                'request_evidence'
            ],
            analytics_user: [
                'view_analytics',
                'export_reports',
                'view_kpis'
            ],
            worker: [
                'submit_grievances',
                'view_own_cases',
                'update_profile'
            ]
        };
        
        return permissions[role] || [];
    }

    /**
     * Get user statistics
     */
    async getUserStatistics() {
        try {
            const usersSnapshot = await Firebase.getDocs(Firebase.collection(Firebase.db, 'users'));
            const users = usersSnapshot.docs.map(doc => doc.data());

            const stats = {
                total: users.length,
                active: users.filter(u => u.isActive).length,
                inactive: users.filter(u => !u.isActive).length,
                byRole: {},
                byFactory: {},
                recentLogins: users.filter(u => u.lastLogin).length
            };

            // Count by role
            users.forEach(user => {
                if (user.role) {
                    stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
                }
                if (user.factoryId) {
                    stats.byFactory[user.factoryId] = (stats.byFactory[user.factoryId] || 0) + 1;
                }
            });

            return stats;

        } catch (error) {
            console.error('❌ Failed to get user statistics:', error);
            throw error;
        }
    }
}

// Export the service
export default UserManagementService;
