/**
 * Redirect Utility for Angkor Compliance
 * Handles role-based redirects consistently across the application
 */

class RedirectUtility {
    constructor() {
        this.roleRedirects = {
            'super_admin': 'super-admin-dashboard.html',
            'factory_admin': 'factory-dashboard.html',
            'hr_staff': 'hr-dashboard.html',
            'hr': 'hr-dashboard.html',
            'auditor': 'auditor-dashboard.html',
            'user': 'user-dashboard.html',
            'staff': 'user-dashboard.html',
            'employee': 'user-dashboard.html'
        };
    }

    /**
     * Get the appropriate dashboard URL for a user role
     * @param {string} role - User role
     * @param {Object} userData - User data object (optional)
     * @returns {string} Dashboard URL
     */
    getDashboardUrl(role, userData = null) {
        console.log('🔍 Getting dashboard URL for role:', role);
        
        // Handle factory admin with factory ID
        if (role === 'factory_admin' && userData && userData.factoryId) {
            return `factory-dashboard.html?id=${encodeURIComponent(userData.factoryId)}`;
        }
        
        // Get URL from role mapping
        const url = this.roleRedirects[role];
        
        if (url) {
            console.log(`✅ Dashboard URL for ${role}: ${url}`);
            return url;
        } else {
            console.log(`⚠️ Unknown role '${role}', using default dashboard`);
            return 'user-dashboard.html';
        }
    }

    /**
     * Redirect user based on their role
     * @param {string} role - User role
     * @param {Object} userData - User data object (optional)
     */
    redirectToDashboard(role, userData = null) {
        const url = this.getDashboardUrl(role, userData);
        console.log(`🚀 Redirecting to: ${url}`);
        window.location.href = url;
    }

    /**
     * Async redirect with proper error handling
     * @param {Object} authManager - AuthManager instance
     * @returns {Promise<void>}
     */
    async redirectBasedOnRole(authManager) {
        console.log('🔍 Starting role-based redirect...');
        
        try {
            // Wait for authManager to be available
            if (!authManager) {
                console.log('⚠️ AuthManager not available, redirecting to dashboard');
                window.location.href = 'dashboard.html';
                return;
            }

            // Wait for user data to be loaded
            let attempts = 0;
            const maxAttempts = 30;
            
            while (!authManager.userData && attempts < maxAttempts) {
                console.log(`⏳ Waiting for user data... (${attempts + 1}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 200));
                attempts++;
            }

            if (!authManager.userData) {
                console.log('⚠️ User data not available, redirecting to dashboard');
                window.location.href = 'dashboard.html';
                return;
            }

            const role = authManager.userData.role;
            const email = authManager.userData.email;
            
            console.log('🔍 User data loaded:', { email, role });

            // Redirect to appropriate dashboard
            this.redirectToDashboard(role, authManager.userData);

        } catch (error) {
            console.error('❌ Error during redirect:', error);
            // Fallback to dashboard
            window.location.href = 'dashboard.html';
        }
    }

    /**
     * Check if user has access to current page
     * @param {string} requiredRole - Required role for current page
     * @param {string} userRole - User's actual role
     * @returns {boolean} Whether user has access
     */
    hasAccess(requiredRole, userRole) {
        const roleHierarchy = {
            'super_admin': 4,
            'factory_admin': 3,
            'hr_staff': 2,
            'auditor': 2,
            'user': 1,
            'staff': 1,
            'employee': 1
        };

        const requiredLevel = roleHierarchy[requiredRole] || 0;
        const userLevel = roleHierarchy[userRole] || 0;

        return userLevel >= requiredLevel;
    }

    /**
     * Redirect to login if not authenticated
     * @param {Object} authManager - AuthManager instance
     */
    redirectToLoginIfNotAuthenticated(authManager) {
        if (!authManager || !authManager.currentUser) {
            console.log('⚠️ User not authenticated, redirecting to login');
            window.location.href = 'login.html';
            return true;
        }
        return false;
    }

    /**
     * Redirect to appropriate page if access denied
     * @param {string} userRole - User's role
     */
    redirectOnAccessDenied(userRole) {
        console.log('🚫 Access denied, redirecting to appropriate dashboard');
        this.redirectToDashboard(userRole);
    }
}

// Create global instance
window.redirectUtility = new RedirectUtility();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RedirectUtility;
}
