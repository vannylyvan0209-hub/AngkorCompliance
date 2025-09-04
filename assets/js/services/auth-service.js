/**
 * Angkor Compliance Platform - Authentication Service
 * Handles user authentication, role management, and session control
 */

class AuthService {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.factoryId = null;
        this.isAuthenticated = false;
        this.authStateListeners = [];
        
        // Initialize the service after Firebase is fully loaded
        this.waitForFirebase();
    }

    /**
     * Wait for Firebase to be fully loaded before initializing
     */
    waitForFirebase() {
        if (window.Firebase && window.Firebase.auth && window.Firebase.db && window.Firebase.storage) {
            // Firebase is ready, initialize services
            this.auth = window.Firebase.auth;
            this.db = window.Firebase.db;
            this.storage = window.Firebase.storage;
            
            // Initialize the service
            this.init();
        } else {
            // Firebase not ready yet, wait and try again
            setTimeout(() => {
                this.waitForFirebase();
            }, 100);
        }
    }

    /**
     * Initialize the authentication service
     */
    async init() {
        try {
            // Set up auth state listener
            window.Firebase.onAuthStateChanged(async (user) => {
                if (user) {
                    await this.handleUserSignIn(user);
                } else {
                    this.handleUserSignOut();
                }
            });

            console.log('✅ AuthService initialized successfully');
        } catch (error) {
            console.error('❌ AuthService initialization failed:', error);
            throw error;
        }
    }

    /**
     * Handle user sign in
     */
    async handleUserSignIn(user) {
        try {
            // Get user data from Firestore
            const userDoc = window.Firebase.doc(window.Firebase.collection('users'), user.uid);
            const userData = await window.Firebase.getDoc(userDoc);
            
            if (userData.exists()) {
                const userInfo = userData.data();
                
                this.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || userInfo.displayName,
                    role: userInfo.role,
                    factoryId: userInfo.factoryId,
                    organizationId: userInfo.organizationId,
                    permissions: userInfo.permissions || [],
                    isActive: userInfo.isActive !== false,
                    lastLogin: new Date(),
                    ...userInfo
                };
                
                this.userRole = userInfo.role;
                this.factoryId = userInfo.factoryId;
                this.isAuthenticated = true;
                
                // Update last login timestamp
                await this.updateLastLogin(user.uid);
                
                // Notify listeners
                this.notifyAuthStateChange();
                
                console.log('✅ User signed in successfully:', this.currentUser);
            } else {
                console.error('❌ User document not found in Firestore');
                await this.logoutUser();
            }
        } catch (error) {
            console.error('❌ Error handling user sign in:', error);
            throw error;
        }
    }

    /**
     * Handle user sign out
     */
    handleUserSignOut() {
        this.currentUser = null;
        this.userRole = null;
        this.factoryId = null;
        this.isAuthenticated = false;
        
        // Notify listeners
        this.notifyAuthStateChange();
        
        console.log('✅ User signed out successfully');
    }

    /**
     * Register a new user
     */
    async registerUser(userData) {
        try {
            const { email, password, displayName, role, factoryId, organizationId } = userData;
            
            // Validate required fields
            if (!email || !password || !displayName || !role) {
                throw new Error('Missing required fields for registration');
            }
            
            // Validate role
            const validRoles = ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'analytics_user', 'worker'];
            if (!validRoles.includes(role)) {
                throw new Error('Invalid role specified');
            }
            
            // Create user in Firebase Auth
            const userCredential = await window.Firebase.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update profile
            await window.Firebase.updateProfile(user, { displayName });
            
            // Create user document in Firestore
            const userDoc = {
                uid: user.uid,
                email: user.email,
                displayName: displayName,
                role: role,
                factoryId: factoryId || null,
                organizationId: organizationId || null,
                permissions: this.getDefaultPermissions(role),
                isActive: true,
                createdAt: window.Firebase.serverTimestamp(),
                updatedAt: window.Firebase.serverTimestamp(),
                lastLogin: null,
                profile: {
                    phone: '',
                    department: '',
                    position: '',
                    avatar: ''
                }
            };
            
            await window.Firebase.setDoc(window.Firebase.doc(window.Firebase.collection('users'), user.uid), userDoc);
            
            console.log('✅ User registered successfully:', userDoc);
            return userDoc;
            
        } catch (error) {
            console.error('❌ User registration failed:', error);
            throw error;
        }
    }

    /**
     * Login user with email and password
     */
    async loginUser(email, password) {
        try {
            const userCredential = await window.Firebase.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('✅ User login successful:', user.email);
            return user;
            
        } catch (error) {
            console.error('❌ User login failed:', error);
            throw error;
        }
    }

    /**
     * Logout current user
     */
    async logoutUser() {
        try {
            await window.Firebase.signOut();
            console.log('✅ User logout successful');
        } catch (error) {
            console.error('❌ User logout failed:', error);
            throw error;
        }
    }

    /**
     * Reset user password
     */
    async resetPassword(email) {
        try {
            await window.Firebase.sendPasswordResetEmail(email);
            console.log('✅ Password reset email sent');
        } catch (error) {
            console.error('❌ Password reset failed:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(updates) {
        try {
            if (!this.currentUser) {
                throw new Error('No user is currently authenticated');
            }
            
            const userRef = window.Firebase.doc(window.Firebase.collection('users'), this.currentUser.uid);
            await window.Firebase.updateDoc(userRef, {
                ...updates,
                updatedAt: window.Firebase.serverTimestamp()
            });
            
            // Update local user data
            this.currentUser = { ...this.currentUser, ...updates };
            
            console.log('✅ Profile updated successfully');
            return this.currentUser;
            
        } catch (error) {
            console.error('❌ Profile update failed:', error);
            throw error;
        }
    }

    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(permission) {
        if (!this.currentUser || !this.currentUser.permissions) {
            return false;
        }
        return this.currentUser.permissions.includes(permission);
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    /**
     * Check if user can access specific factory
     */
    canAccessFactory(factoryId) {
        if (!this.currentUser) return false;
        
        // Super admin can access all factories
        if (this.currentUser.role === 'super_admin') return true;
        
        // Other users can only access their assigned factory
        return this.currentUser.factoryId === factoryId;
    }

    /**
     * Update last login timestamp
     */
    async updateLastLogin(userId) {
        try {
            const userRef = window.Firebase.doc(window.Firebase.collection('users'), userId);
            await window.Firebase.updateDoc(userRef, {
                lastLogin: window.Firebase.serverTimestamp()
            });
        } catch (error) {
            console.error('❌ Failed to update last login:', error);
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
     * Add auth state change listener
     */
    addAuthStateListener(listener) {
        this.authStateListeners.push(listener);
    }

    /**
     * Remove auth state change listener
     */
    removeAuthStateListener(listener) {
        const index = this.authStateListeners.indexOf(listener);
        if (index > -1) {
            this.authStateListeners.splice(index, 1);
        }
    }

    /**
     * Notify all auth state listeners
     */
    notifyAuthStateChange() {
        this.authStateListeners.forEach(listener => {
            try {
                listener(this.currentUser, this.isAuthenticated);
            } catch (error) {
                console.error('❌ Error in auth state listener:', error);
            }
        });
    }

    /**
     * Get user's accessible factories
     */
    async getUserFactories() {
        try {
            if (!this.currentUser) {
                return [];
            }
            
            if (this.currentUser.role === 'super_admin') {
                // Super admin can see all factories
                const factoriesSnapshot = await window.Firebase.getDocs(window.Firebase.collection('factories'));
                return factoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else if (this.currentUser.factoryId) {
                // Other users can only see their assigned factory
                const factoryDoc = await window.Firebase.getDoc(window.Firebase.doc(window.Firebase.collection('factories'), this.currentUser.factoryId));
                if (factoryDoc.exists()) {
                    return [{ id: factoryDoc.id, ...factoryDoc.data() }];
                }
            }
            
            return [];
        } catch (error) {
            console.error('❌ Failed to get user factories:', error);
            return [];
        }
    }
}

// Export the service
window.AuthService = AuthService;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create the service instance - it will wait for Firebase to be ready
    window.authService = new AuthService();
});

// Service is available globally via window.AuthService
