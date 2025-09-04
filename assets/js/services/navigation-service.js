/**
 * Angkor Compliance Platform - Navigation Service
 * Handles dynamic role-based navigation, route protection, and permission-based access
 */

class NavigationService {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.navigationItems = [];
        this.routeGuards = new Map();
        this.navigationListeners = [];
        
        // Role-based navigation configuration
        this.roleNavigation = {
            super_admin: [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    icon: 'fas fa-tachometer-alt',
                    url: '/super-admin-dashboard.html',
                    permissions: ['view_all_data']
                },
                {
                    id: 'organizations',
                    label: 'Organizations',
                    icon: 'fas fa-building',
                    url: '/pages/super-admin/organization-management.html',
                    permissions: ['manage_organizations']
                },
                {
                    id: 'factories',
                    label: 'Factories',
                    icon: 'fas fa-industry',
                    url: '/factory-management.html',
                    permissions: ['manage_factories']
                },
                {
                    id: 'users',
                    label: 'User Management',
                    icon: 'fas fa-users',
                    url: '/user-management.html',
                    permissions: ['manage_users']
                },
                {
                    id: 'standards',
                    label: 'Standards Registry',
                    icon: 'fas fa-certificate',
                    url: '/pages/super-admin/standards-registry.html',
                    permissions: ['manage_standards']
                },
                {
                    id: 'system',
                    label: 'System Settings',
                    icon: 'fas fa-cog',
                    url: '/pages/super-admin/system-settings.html',
                    permissions: ['system_config']
                },
                {
                    id: 'analytics',
                    label: 'Analytics',
                    icon: 'fas fa-chart-bar',
                    url: '/analytics-dashboard.html',
                    permissions: ['view_all_data']
                }
            ],
            factory_admin: [
                {
                    id: 'dashboard',
                    label: 'Factory Dashboard',
                    icon: 'fas fa-tachometer-alt',
                    url: '/factory-dashboard.html',
                    permissions: ['view_factory_analytics']
                },
                {
                    id: 'users',
                    label: 'Factory Users',
                    icon: 'fas fa-users',
                    url: '/pages/factory-admin/factory-user-management.html',
                    permissions: ['manage_factory_users']
                },
                {
                    id: 'documents',
                    label: 'Documents',
                    icon: 'fas fa-file-alt',
                    url: '/documents.html',
                    permissions: ['manage_factory_documents']
                },
                {
                    id: 'caps',
                    label: 'CAP Management',
                    icon: 'fas fa-tasks',
                    url: '/cap.html',
                    permissions: ['manage_factory_caps']
                },
                {
                    id: 'compliance',
                    label: 'Compliance',
                    icon: 'fas fa-check-circle',
                    url: '/pages/factory-admin/compliance-monitoring-dashboard.html',
                    permissions: ['view_factory_analytics']
                },
                {
                    id: 'training',
                    label: 'Training',
                    icon: 'fas fa-graduation-cap',
                    url: '/pages/training-meetings/training-management.html',
                    permissions: ['manage_factory_users']
                },
                {
                    id: 'settings',
                    label: 'Factory Settings',
                    icon: 'fas fa-cog',
                    url: '/factory-admin-settings.html',
                    permissions: ['manage_factory_users']
                }
            ],
            hr_staff: [
                {
                    id: 'dashboard',
                    label: 'HR Dashboard',
                    icon: 'fas fa-tachometer-alt',
                    url: '/hr-dashboard.html',
                    permissions: ['view_hr_analytics']
                },
                {
                    id: 'documents',
                    label: 'Documents',
                    icon: 'fas fa-file-alt',
                    url: '/documents.html',
                    permissions: ['manage_documents']
                },
                {
                    id: 'training',
                    label: 'Training',
                    icon: 'fas fa-graduation-cap',
                    url: '/pages/training-meetings/training-management.html',
                    permissions: ['manage_training']
                },
                {
                    id: 'permits',
                    label: 'Permits',
                    icon: 'fas fa-id-card',
                    url: '/pages/hr-staff/permits-management.html',
                    permissions: ['manage_permits']
                },
                {
                    id: 'workers',
                    label: 'Worker Management',
                    icon: 'fas fa-user-tie',
                    url: '/pages/hr-staff/hr-worker-management.html',
                    permissions: ['manage_training']
                },
                {
                    id: 'settings',
                    label: 'HR Settings',
                    icon: 'fas fa-cog',
                    url: '/hr-staff-settings.html',
                    permissions: ['manage_training']
                }
            ],
            grievance_committee: [
                {
                    id: 'dashboard',
                    label: 'Grievance Dashboard',
                    icon: 'fas fa-tachometer-alt',
                    url: '/grievance-committee-dashboard.html',
                    permissions: ['view_case_analytics']
                },
                {
                    id: 'cases',
                    label: 'Case Management',
                    icon: 'fas fa-folder-open',
                    url: '/grievance-management.html',
                    permissions: ['manage_cases']
                },
                {
                    id: 'intake',
                    label: 'Case Intake',
                    icon: 'fas fa-plus-circle',
                    url: '/case-intake-screen.html',
                    permissions: ['manage_cases']
                },
                {
                    id: 'investigation',
                    label: 'Investigation',
                    icon: 'fas fa-search',
                    url: '/pages/grievance-committee/case-investigation.html',
                    permissions: ['investigate_cases']
                },
                {
                    id: 'resolution',
                    label: 'Resolution',
                    icon: 'fas fa-check-double',
                    url: '/pages/grievance-committee/case-resolution.html',
                    permissions: ['resolve_cases']
                },
                {
                    id: 'analytics',
                    label: 'Case Analytics',
                    icon: 'fas fa-chart-line',
                    url: '/pages/grievance-committee/case-analytics.html',
                    permissions: ['view_case_analytics']
                }
            ],
            auditor: [
                {
                    id: 'dashboard',
                    label: 'Auditor Dashboard',
                    icon: 'fas fa-tachometer-alt',
                    url: '/auditor-dashboard.html',
                    permissions: ['view_assigned_factories']
                },
                {
                    id: 'audits',
                    label: 'Audit Planning',
                    icon: 'fas fa-calendar-alt',
                    url: '/audit-planning.html',
                    permissions: ['conduct_audits']
                },
                {
                    id: 'checklists',
                    label: 'Audit Checklists',
                    icon: 'fas fa-clipboard-check',
                    url: '/audit-checklist-generator.html',
                    permissions: ['conduct_audits']
                },
                {
                    id: 'evidence',
                    label: 'Evidence Collection',
                    icon: 'fas fa-file-upload',
                    url: '/evidence-collection.html',
                    permissions: ['request_evidence']
                },
                {
                    id: 'findings',
                    label: 'Findings',
                    icon: 'fas fa-exclamation-triangle',
                    url: '/pages/auditor/finding-documentation.html',
                    permissions: ['create_findings']
                },
                {
                    id: 'reports',
                    label: 'Audit Reports',
                    icon: 'fas fa-file-pdf',
                    url: '/pages/auditor/audit-report-generation.html',
                    permissions: ['conduct_audits']
                },
                {
                    id: 'settings',
                    label: 'Auditor Settings',
                    icon: 'fas fa-cog',
                    url: '/auditor-settings.html',
                    permissions: ['view_assigned_factories']
                }
            ],
            analytics_user: [
                {
                    id: 'dashboard',
                    label: 'Analytics Dashboard',
                    icon: 'fas fa-tachometer-alt',
                    url: '/analytics-dashboard.html',
                    permissions: ['view_analytics']
                },
                {
                    id: 'reports',
                    label: 'Reports',
                    icon: 'fas fa-chart-pie',
                    url: '/pages/analytics/reports.html',
                    permissions: ['export_reports']
                },
                {
                    id: 'kpis',
                    label: 'KPIs',
                    icon: 'fas fa-chart-line',
                    url: '/pages/analytics/kpi-dashboard.html',
                    permissions: ['view_kpis']
                },
                {
                    id: 'exports',
                    label: 'Data Exports',
                    icon: 'fas fa-download',
                    url: '/pages/analytics/data-export.html',
                    permissions: ['export_reports']
                }
            ],
            worker: [
                {
                    id: 'portal',
                    label: 'Worker Portal',
                    icon: 'fas fa-home',
                    url: '/worker-portal.html',
                    permissions: ['submit_grievances']
                },
                {
                    id: 'grievances',
                    label: 'My Grievances',
                    icon: 'fas fa-folder-open',
                    url: '/pages/worker-portal/my-grievances.html',
                    permissions: ['view_own_cases']
                },
                {
                    id: 'submit',
                    label: 'Submit Grievance',
                    icon: 'fas fa-plus-circle',
                    url: '/pages/worker-portal/submit-grievance.html',
                    permissions: ['submit_grievances']
                },
                {
                    id: 'profile',
                    label: 'My Profile',
                    icon: 'fas fa-user',
                    url: '/profile.html',
                    permissions: ['update_profile']
                }
            ]
        };

        // Bind methods
        this.init = this.init.bind(this);
        this.updateNavigation = this.updateNavigation.bind(this);
        this.getNavigationItems = this.getNavigationItems.bind(this);
        this.canAccessRoute = this.canAccessRoute.bind(this);
        this.protectRoute = this.protectRoute.bind(this);
        this.redirectToLogin = this.redirectToLogin.bind(this);
        this.redirectToDashboard = this.redirectToDashboard.bind(this);
        this.addNavigationListener = this.addNavigationListener.bind(this);
        this.removeNavigationListener = this.removeNavigationListener.bind(this);
        
        // Initialize the service
        this.init();
    }

    /**
     * Initialize the navigation service
     */
    init() {
        try {
            // Listen for auth state changes
            if (window.authService) {
                window.authService.addAuthStateListener(this.updateNavigation.bind(this));
            }
            
            // Set up route protection
            this.setupRouteProtection();
            
            console.log('✅ NavigationService initialized successfully');
        } catch (error) {
            console.error('❌ NavigationService initialization failed:', error);
        }
    }

    /**
     * Update navigation based on current user
     */
    updateNavigation(user, isAuthenticated) {
        try {
            this.currentUser = user;
            this.currentRole = user?.role || null;
            
            if (isAuthenticated && user) {
                this.navigationItems = this.getNavigationItems(user.role);
                console.log('✅ Navigation updated for role:', user.role);
            } else {
                this.navigationItems = [];
                console.log('✅ Navigation cleared - user not authenticated');
            }
            
            // Notify listeners
            this.notifyNavigationChange();
            
        } catch (error) {
            console.error('❌ Failed to update navigation:', error);
        }
    }

    /**
     * Get navigation items for a specific role
     */
    getNavigationItems(role) {
        if (!role || !this.roleNavigation[role]) {
            return [];
        }
        
        // Filter items based on user permissions
        const user = this.currentUser;
        if (!user) return [];
        
        return this.roleNavigation[role].filter(item => {
            // Check if user has required permissions
            if (item.permissions && item.permissions.length > 0) {
                return item.permissions.some(permission => 
                    window.authService?.hasPermission(permission)
                );
            }
            return true;
        });
    }

    /**
     * Check if user can access a specific route
     */
    canAccessRoute(route, user = null) {
        try {
            const currentUser = user || this.currentUser;
            if (!currentUser) return false;
            
            // Find navigation item for this route
            const roleItems = this.roleNavigation[currentUser.role] || [];
            const routeItem = roleItems.find(item => item.url === route);
            
            if (!routeItem) return false;
            
            // Check permissions
            if (routeItem.permissions && routeItem.permissions.length > 0) {
                return routeItem.permissions.some(permission => 
                    window.authService?.hasPermission(permission)
                );
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error checking route access:', error);
            return false;
        }
    }

    /**
     * Protect a route - redirect if user cannot access
     */
    protectRoute(route) {
        try {
            if (!this.canAccessRoute(route)) {
                console.warn('⚠️ Access denied to route:', route);
                
                if (!this.currentUser) {
                    this.redirectToLogin();
                } else {
                    this.redirectToDashboard();
                }
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error protecting route:', error);
            return false;
        }
    }

    /**
     * Setup route protection for the current page
     */
    setupRouteProtection() {
        try {
            const currentPath = window.location.pathname;
            
            // Skip protection for public pages
            const publicPages = [
                '/',
                '/index.html',
                '/login.html',
                '/register.html',
                '/public/404.html'
            ];
            
            if (publicPages.includes(currentPath)) {
                return;
            }
            
            // Protect the current route
            if (!this.protectRoute(currentPath)) {
                return;
            }
            
            console.log('✅ Route protected successfully:', currentPath);
            
        } catch (error) {
            console.error('❌ Error setting up route protection:', error);
        }
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        try {
            const currentPath = window.location.pathname;
            const loginUrl = '/login.html';
            
            // Store intended destination
            sessionStorage.setItem('intendedDestination', currentPath);
            
            // Redirect to login
            window.location.href = loginUrl;
            
        } catch (error) {
            console.error('❌ Error redirecting to login:', error);
            window.location.href = '/login.html';
        }
    }

    /**
     * Redirect to user's dashboard
     */
    redirectToDashboard() {
        try {
            if (!this.currentUser) {
                this.redirectToLogin();
                return;
            }
            
            const dashboardUrls = {
                super_admin: '/super-admin-dashboard.html',
                factory_admin: '/factory-dashboard.html',
                hr_staff: '/hr-dashboard.html',
                grievance_committee: '/grievance-committee-dashboard.html',
                auditor: '/auditor-dashboard.html',
                analytics_user: '/analytics-dashboard.html',
                worker: '/worker-portal.html'
            };
            
            const dashboardUrl = dashboardUrls[this.currentUser.role] || '/dashboard.html';
            window.location.href = dashboardUrl;
            
        } catch (error) {
            console.error('❌ Error redirecting to dashboard:', error);
            window.location.href = '/dashboard.html';
        }
    }

    /**
     * Add navigation change listener
     */
    addNavigationListener(listener) {
        this.navigationListeners.push(listener);
    }

    /**
     * Remove navigation change listener
     */
    removeNavigationListener(listener) {
        const index = this.navigationListeners.indexOf(listener);
        if (index > -1) {
            this.navigationListeners.splice(index, 1);
        }
    }

    /**
     * Notify all navigation listeners
     */
    notifyNavigationChange() {
        this.navigationListeners.forEach(listener => {
            try {
                listener(this.navigationItems, this.currentUser);
            } catch (error) {
                console.error('❌ Error in navigation listener:', error);
            }
        });
    }

    /**
     * Get current navigation items
     */
    getCurrentNavigation() {
        return {
            items: this.navigationItems,
            user: this.currentUser,
            role: this.currentRole
        };
    }

    /**
     * Check if user is on their dashboard
     */
    isOnDashboard() {
        try {
            const currentPath = window.location.pathname;
            const dashboardUrls = {
                super_admin: '/super-admin-dashboard.html',
                factory_admin: '/factory-dashboard.html',
                hr_staff: '/hr-dashboard.html',
                grievance_committee: '/grievance-committee-dashboard.html',
                auditor: '/auditor-dashboard.html',
                analytics_user: '/analytics-dashboard.html',
                worker: '/worker-portal.html'
            };
            
            if (!this.currentUser) return false;
            
            const expectedDashboard = dashboardUrls[this.currentUser.role];
            return currentPath === expectedDashboard;
            
        } catch (error) {
            console.error('❌ Error checking dashboard status:', error);
            return false;
        }
    }

    /**
     * Get breadcrumb navigation for current page
     */
    getBreadcrumbs() {
        try {
            const currentPath = window.location.pathname;
            const breadcrumbs = [];
            
            // Add home
            breadcrumbs.push({
                label: 'Home',
                url: '/',
                icon: 'fas fa-home'
            });
            
            // Find current page in navigation
            if (this.currentUser && this.currentRole) {
                const roleItems = this.roleNavigation[this.currentRole] || [];
                const currentItem = roleItems.find(item => item.url === currentPath);
                
                if (currentItem) {
                    breadcrumbs.push({
                        label: currentItem.label,
                        url: currentItem.url,
                        icon: currentItem.icon,
                        current: true
                    });
                }
            }
            
            return breadcrumbs;
            
        } catch (error) {
            console.error('❌ Error getting breadcrumbs:', error);
            return [];
        }
    }
}

// Export the service
window.NavigationService = NavigationService;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.Firebase && window.Firebase.auth) {
        window.navigationService = new NavigationService();
    } else {
        console.error('❌ Firebase not initialized. NavigationService cannot start.');
    }
});

// Service is available globally via window.NavigationService
