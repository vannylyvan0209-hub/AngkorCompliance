/**
 * Angkor Compliance Platform - Navigation Service
 * Handles route protection, role-based navigation, and factory context
 */

import { Firebase } from '../../../firebase-config.js';

class NavigationService {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.factoryId = null;
        this.navigationItems = [];
        this.currentRoute = null;
        
        // Initialize the service
        this.init();
    }

    /**
     * Initialize the navigation service
     */
    async init() {
        try {
            // Set up auth state listener
            this.setupAuthListener();
            
            console.log('✅ NavigationService initialized successfully');
        } catch (error) {
            console.error('❌ NavigationService initialization failed:', error);
            throw error;
        }
    }

    /**
     * Set up authentication state listener
     */
    setupAuthListener() {
        // Listen for auth state changes
        if (window.authService) {
            window.authService.addAuthStateListener((user, isAuthenticated) => {
                this.handleAuthStateChange(user, isAuthenticated);
            });
        }
    }

    /**
     * Handle authentication state changes
     */
    handleAuthStateChange(user, isAuthenticated) {
        this.currentUser = user;
        this.userRole = user?.role || null;
        this.factoryId = user?.factoryId || null;
        
        if (isAuthenticated) {
            this.updateNavigation();
            this.protectCurrentRoute();
        } else {
            this.clearNavigation();
            this.redirectToLogin();
        }
    }

    /**
     * Update navigation based on user role
     */
    updateNavigation() {
        if (!this.currentUser || !this.userRole) {
            return;
        }

        // Clear existing navigation
        this.navigationItems = [];

        // Add role-specific navigation items
        switch (this.userRole) {
            case 'super_admin':
                this.addSuperAdminNavigation();
                break;
            case 'factory_admin':
                this.addFactoryAdminNavigation();
                break;
            case 'hr_staff':
                this.addHRStaffNavigation();
                break;
            case 'grievance_committee':
                this.addGrievanceCommitteeNavigation();
                break;
            case 'auditor':
                this.addAuditorNavigation();
                break;
            case 'analytics_user':
                this.addAnalyticsUserNavigation();
                break;
            case 'worker':
                this.addWorkerNavigation();
                break;
            default:
                console.warn('Unknown user role:', this.userRole);
        }

        // Render navigation
        this.renderNavigation();
    }

    /**
     * Add Super Admin navigation items
     */
    addSuperAdminNavigation() {
        this.navigationItems = [
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
                url: '/pages/super-admin/factory-management.html',
                permissions: ['manage_factories']
            },
            {
                id: 'users',
                label: 'User Management',
                icon: 'fas fa-users',
                url: '/pages/super-admin/user-management.html',
                permissions: ['manage_users']
            },
            {
                id: 'standards',
                label: 'Standards',
                icon: 'fas fa-certificate',
                url: '/pages/super-admin/standards-management.html',
                permissions: ['manage_standards']
            },
            {
                id: 'billing',
                label: 'Billing',
                icon: 'fas fa-credit-card',
                url: '/pages/super-admin/billing-management.html',
                permissions: ['system_config']
            },
            {
                id: 'system',
                label: 'System Settings',
                icon: 'fas fa-cogs',
                url: '/pages/super-admin/system-settings.html',
                permissions: ['system_config']
            }
        ];
    }

    /**
     * Add Factory Admin navigation items
     */
    addFactoryAdminNavigation() {
        this.navigationItems = [
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
                url: '/pages/factory-admin/document-oversight-dashboard.html',
                permissions: ['manage_factory_documents']
            },
            {
                id: 'caps',
                label: 'CAP Management',
                icon: 'fas fa-tasks',
                url: '/pages/factory-admin/compliance-monitoring-dashboard.html',
                permissions: ['manage_factory_caps']
            },
            {
                id: 'training',
                label: 'Training',
                icon: 'fas fa-graduation-cap',
                url: '/pages/factory-admin/training-management-dashboard.html',
                permissions: ['manage_factory_users']
            },
            {
                id: 'audits',
                label: 'Audits',
                icon: 'fas fa-search',
                url: '/pages/factory-admin/audit-management-dashboard.html',
                permissions: ['view_factory_analytics']
            }
        ];
    }

    /**
     * Add HR Staff navigation items
     */
    addHRStaffNavigation() {
        this.navigationItems = [
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
                url: '/training-meetings.html',
                permissions: ['manage_training']
            },
            {
                id: 'permits',
                label: 'Permits',
                icon: 'fas fa-id-card',
                url: '/permits.html',
                permissions: ['manage_permits']
            },
            {
                id: 'workers',
                label: 'Worker Management',
                icon: 'fas fa-hard-hat',
                url: '/pages/hr-staff/hr-worker-management.html',
                permissions: ['manage_documents']
            }
        ];
    }

    /**
     * Add Grievance Committee navigation items
     */
    addGrievanceCommitteeNavigation() {
        this.navigationItems = [
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
                url: '/case-management.html',
                permissions: ['investigate_cases']
            },
            {
                id: 'resolution',
                label: 'Resolution',
                icon: 'fas fa-check-circle',
                url: '/case-resolution.html',
                permissions: ['resolve_cases']
            }
        ];
    }

    /**
     * Add Auditor navigation items
     */
    addAuditorNavigation() {
        this.navigationItems = [
            {
                id: 'dashboard',
                label: 'Auditor Dashboard',
                icon: 'fas fa-tachometer-alt',
                url: '/auditor-dashboard.html',
                permissions: ['view_assigned_factories']
            },
            {
                id: 'factories',
                label: 'Assigned Factories',
                icon: 'fas fa-industry',
                url: '/auditor-factories.html',
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
                icon: 'fas fa-clipboard-list',
                url: '/audit-checklist-generator.html',
                permissions: ['conduct_audits']
            },
            {
                id: 'findings',
                label: 'Findings',
                icon: 'fas fa-exclamation-triangle',
                url: '/findings-management.html',
                permissions: ['create_findings']
            },
            {
                id: 'evidence',
                label: 'Evidence',
                icon: 'fas fa-folder',
                url: '/evidence-collection.html',
                permissions: ['request_evidence']
            }
        ];
    }

    /**
     * Add Analytics User navigation items
     */
    addAnalyticsUserNavigation() {
        this.navigationItems = [
            {
                id: 'dashboard',
                label: 'Analytics Dashboard',
                icon: 'fas fa-chart-line',
                url: '/analytics-dashboard.html',
                permissions: ['view_analytics']
            },
            {
                id: 'kpis',
                label: 'KPIs',
                icon: 'fas fa-chart-bar',
                url: '/kpi-dashboard.html',
                permissions: ['view_kpis']
            },
            {
                id: 'reports',
                label: 'Reports',
                icon: 'fas fa-file-chart-line',
                url: '/reports-dashboard.html',
                permissions: ['export_reports']
            },
            {
                id: 'cap-analytics',
                label: 'CAP Analytics',
                icon: 'fas fa-chart-pie',
                url: '/cap-analytics.html',
                permissions: ['view_analytics']
            }
        ];
    }

    /**
     * Add Worker navigation items
     */
    addWorkerNavigation() {
        this.navigationItems = [
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
                url: '/worker-grievances.html',
                permissions: ['view_own_cases']
            },
            {
                id: 'submit',
                label: 'Submit Grievance',
                icon: 'fas fa-plus-circle',
                url: '/submit-grievance.html',
                permissions: ['submit_grievances']
            },
            {
                id: 'profile',
                label: 'My Profile',
                icon: 'fas fa-user',
                url: '/worker-profile.html',
                permissions: ['update_profile']
            }
        ];
    }

    /**
     * Render navigation to the DOM
     */
    renderNavigation() {
        const navContainer = document.getElementById('navigation-container');
        if (!navContainer) {
            return;
        }

        // Clear existing navigation
        navContainer.innerHTML = '';

        // Create navigation items
        this.navigationItems.forEach(item => {
            if (this.hasPermission(item.permissions)) {
                const navItem = this.createNavigationItem(item);
                navContainer.appendChild(navItem);
            }
        });
    }

    /**
     * Create a navigation item element
     */
    createNavigationItem(item) {
        const navItem = document.createElement('div');
        navItem.className = 'nav-item';
        navItem.innerHTML = `
            <a href="${item.url}" class="nav-link">
                <i class="${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `;

        // Add click handler
        navItem.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateTo(item.url);
        });

        return navItem;
    }

    /**
     * Navigate to a specific URL
     */
    navigateTo(url) {
        try {
            // Update current route
            this.currentRoute = url;
            
            // Navigate to the URL
            window.location.href = url;
        } catch (error) {
            console.error('❌ Navigation failed:', error);
        }
    }

    /**
     * Check if user has required permissions
     */
    hasPermission(requiredPermissions) {
        if (!this.currentUser || !requiredPermissions) {
            return false;
        }

        if (Array.isArray(requiredPermissions)) {
            return requiredPermissions.some(permission => 
                this.currentUser.permissions?.includes(permission)
            );
        }

        return this.currentUser.permissions?.includes(requiredPermissions);
    }

    /**
     * Protect the current route
     */
    protectCurrentRoute() {
        const currentPath = window.location.pathname;
        const currentPage = this.getCurrentPageFromPath(currentPath);

        // Check if user can access current page
        if (currentPage && !this.canAccessPage(currentPage)) {
            this.redirectToUnauthorized();
        }
    }

    /**
     * Get current page from path
     */
    getCurrentPageFromPath(path) {
        // Extract page name from path
        const pageName = path.split('/').pop().replace('.html', '');
        return pageName;
    }

    /**
     * Check if user can access a specific page
     */
    canAccessPage(pageName) {
        // Find navigation item for this page
        const navItem = this.navigationItems.find(item => 
            item.url.includes(pageName) || item.id === pageName
        );

        if (!navItem) {
            return false;
        }

        return this.hasPermission(navItem.permissions);
    }

    /**
     * Redirect to unauthorized page
     */
    redirectToUnauthorized() {
        window.location.href = '/unauthorized.html';
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        window.location.href = '/login.html';
    }

    /**
     * Clear navigation
     */
    clearNavigation() {
        this.navigationItems = [];
        this.currentUser = null;
        this.userRole = null;
        this.factoryId = null;
        
        const navContainer = document.getElementById('navigation-container');
        if (navContainer) {
            navContainer.innerHTML = '';
        }
    }

    /**
     * Get current navigation items
     */
    getNavigationItems() {
        return this.navigationItems;
    }

    /**
     * Get current user role
     */
    getCurrentUserRole() {
        return this.userRole;
    }

    /**
     * Get current factory ID
     */
    getCurrentFactoryId() {
        return this.factoryId;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.currentUser;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.userRole === role;
    }
}

// Export the service
export default NavigationService;
