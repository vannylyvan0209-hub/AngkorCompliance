// Navigation Configuration for Angkor Compliance Platform
// Defines role-based navigation menus and access control

const NavigationConfig = {
    // Role-based navigation menus
    roles: {
        // Worker role - Basic access for factory workers
        worker: {
            name: 'Worker',
            color: '#D4AF37', // Primary Gold
            icon: 'user',
            menu: [
                {
                    title: 'Dashboard',
                    icon: 'home',
                    url: '/pages/worker/worker-dashboard.html',
                    badge: null
                },
                {
                    title: 'My Cases',
                    icon: 'file-text',
                    url: '/pages/worker/case-tracking-portal.html',
                    badge: null
                },
                {
                    title: 'Submit Grievance',
                    icon: 'message-circle',
                    url: '/pages/worker/grievance-submission.html',
                    badge: null
                },
                {
                    title: 'Training',
                    icon: 'graduation-cap',
                    url: '/pages/worker/training-portal.html',
                    badge: null
                },
                {
                    title: 'QR Access',
                    icon: 'qrcode',
                    url: '/pages/worker/qr-code-access.html',
                    badge: null
                },
                {
                    title: 'Profile',
                    icon: 'user',
                    url: '/pages/worker/profile.html',
                    badge: null
                }
            ]
        },

        // Factory Admin role - Factory management access
        factory_admin: {
            name: 'Factory Administrator',
            color: '#B8941F', // Primary Gold Dark
            icon: 'building',
            menu: [
                {
                    title: 'Dashboard',
                    icon: 'home',
                    url: '/pages/factory-admin/factory-dashboard.html',
                    badge: null
                },
                {
                    title: 'Factory Management',
                    icon: 'building',
                    url: '/pages/factory-admin/factory-management.html',
                    badge: null
                },
                {
                    title: 'Worker Portal',
                    icon: 'users',
                    url: '/pages/factory-admin/factory-worker-portal.html',
                    badge: null
                },
                {
                    title: 'Cases',
                    icon: 'file-text',
                    url: '/pages/factory-admin/case-management.html',
                    badge: null
                },
                {
                    title: 'Reports',
                    icon: 'bar-chart-3',
                    url: '/pages/factory-admin/reports.html',
                    badge: null
                },
                {
                    title: 'Settings',
                    icon: 'settings',
                    url: '/pages/factory-admin/factory-admin-settings.html',
                    badge: null
                }
            ]
        },

        // HR Staff role - Human resources management
        hr_staff: {
            name: 'HR Staff',
            color: '#22c55e', // Success Green
            icon: 'users',
            menu: [
                {
                    title: 'HR Dashboard',
                    icon: 'home',
                    url: '/pages/hr-staff/hr-dashboard.html',
                    badge: null
                },
                {
                    title: 'Worker Management',
                    icon: 'users',
                    url: '/pages/hr-staff/hr-worker-management.html',
                    badge: null
                },
                {
                    title: 'Training Programs',
                    icon: 'graduation-cap',
                    url: '/pages/hr-staff/training-management.html',
                    badge: null
                },
                {
                    title: 'Compliance',
                    icon: 'shield-check',
                    url: '/pages/hr-staff/compliance-management.html',
                    badge: null
                },
                {
                    title: 'Reports',
                    icon: 'bar-chart-3',
                    url: '/pages/hr-staff/hr-reports.html',
                    badge: null
                },
                {
                    title: 'Settings',
                    icon: 'settings',
                    url: '/pages/hr-staff/hr-staff-settings.html',
                    badge: null
                }
            ]
        },

        // Grievance Committee role - Case management and resolution
        grievance_committee: {
            name: 'Grievance Committee',
            color: '#f59e0b', // Warning Orange
            icon: 'gavel',
            menu: [
                {
                    title: 'Committee Dashboard',
                    icon: 'home',
                    url: '/pages/grievance-committee/grievance-committee-dashboard.html',
                    badge: null
                },
                {
                    title: 'Case Management',
                    icon: 'file-text',
                    url: '/pages/grievance-committee/case-management.html',
                    badge: null
                },
                {
                    title: 'Case Intake',
                    icon: 'plus-circle',
                    url: '/pages/grievance-committee/case-intake-screen.html',
                    badge: null
                },
                {
                    title: 'Case Triage',
                    icon: 'list-priority',
                    url: '/pages/grievance-committee/case-triage-modal.html',
                    badge: null
                },
                {
                    title: 'Case Assignment',
                    icon: 'user-check',
                    url: '/pages/grievance-committee/case-assignment-panel.html',
                    badge: null
                },
                {
                    title: 'Case Tracking',
                    icon: 'map-pin',
                    url: '/pages/grievance-committee/case-tracking-portal.html',
                    badge: null
                },
                {
                    title: 'Grievance Management',
                    icon: 'message-square',
                    url: '/pages/grievance-committee/grievance-management.html',
                    badge: null
                }
            ]
        },

        // Auditor role - Audit and compliance verification
        auditor: {
            name: 'Auditor',
            color: '#3b82f6', // Info Blue
            icon: 'search',
            menu: [
                {
                    title: 'Audit Dashboard',
                    icon: 'home',
                    url: '/pages/auditor/audit-dashboard.html',
                    badge: null
                },
                {
                    title: 'Audit Planning',
                    icon: 'calendar',
                    url: '/pages/auditor/audit-planning.html',
                    badge: null
                },
                {
                    title: 'Evidence Collection',
                    icon: 'folder-plus',
                    url: '/pages/auditor/evidence-collection.html',
                    badge: null
                },
                {
                    title: 'Evidence Organization',
                    icon: 'folder-open',
                    url: '/pages/auditor/evidence-organization.html',
                    badge: null
                },
                {
                    title: 'Evidence Review',
                    icon: 'eye',
                    url: '/pages/auditor/evidence-review.html',
                    badge: null
                },
                {
                    title: 'Evidence Linking',
                    icon: 'link',
                    url: '/pages/auditor/evidence-linking.html',
                    badge: null
                },
                {
                    title: 'Evidence Binder',
                    icon: 'book-open',
                    url: '/pages/auditor/evidence-binder-creation.html',
                    badge: null
                },
                {
                    title: 'Findings',
                    icon: 'clipboard-list',
                    url: '/pages/auditor/finding-documentation.html',
                    badge: null
                },
                {
                    title: 'Compliance Review',
                    icon: 'shield-check',
                    url: '/pages/auditor/compliance-documentation-review.html',
                    badge: null
                },
                {
                    title: 'Checklist Generator',
                    icon: 'check-square',
                    url: '/pages/auditor/audit-checklist-generator.html',
                    badge: null
                },
                {
                    title: 'Report Generation',
                    icon: 'file-text',
                    url: '/pages/auditor/audit-report-generation.html',
                    badge: null
                }
            ]
        },

        // Analytics User role - Data analysis and reporting
        analytics_user: {
            name: 'Analytics User',
            color: '#8b5cf6', // Purple
            icon: 'bar-chart-3',
            menu: [
                {
                    title: 'Analytics Dashboard',
                    icon: 'home',
                    url: '/pages/analytics/analytics-dashboard.html',
                    badge: null
                },
                {
                    title: 'CAP Analytics',
                    icon: 'trending-up',
                    url: '/pages/analytics/cap-analytics.html',
                    badge: null
                },
                {
                    title: 'Reports',
                    icon: 'file-text',
                    url: '/pages/analytics/reports.html',
                    badge: null
                },
                {
                    title: 'Data Export',
                    icon: 'download',
                    url: '/pages/analytics/data-export.html',
                    badge: null
                }
            ]
        },

        // Super Admin role - System administration
        super_admin: {
            name: 'Super Administrator',
            color: '#ef4444', // Danger Red
            icon: 'shield',
            menu: [
                {
                    title: 'Super Admin Dashboard',
                    icon: 'home',
                    url: '/pages/super-admin/super-admin-dashboard.html',
                    badge: null
                },
                {
                    title: 'User Management',
                    icon: 'users',
                    url: '/pages/super-admin/user-management.html',
                    badge: null
                },
                {
                    title: 'System Settings',
                    icon: 'settings',
                    url: '/pages/super-admin/system-settings.html',
                    badge: null
                },
                {
                    title: 'System Monitoring',
                    icon: 'activity',
                    url: '/pages/super-admin/system-monitoring.html',
                    badge: null
                },
                {
                    title: 'Backup & Recovery',
                    icon: 'database',
                    url: '/pages/super-admin/backup-recovery.html',
                    badge: null
                },
                {
                    title: 'Audit Logs',
                    icon: 'file-text',
                    url: '/pages/super-admin/audit-logs.html',
                    badge: null
                }
            ]
        }
    },

    // Quick actions for each role
    quickActions: {
        worker: [
            { title: 'Submit Grievance', icon: 'message-circle', url: '/pages/worker/grievance-submission.html' },
            { title: 'View Cases', icon: 'file-text', url: '/pages/worker/case-tracking-portal.html' },
            { title: 'Training', icon: 'graduation-cap', url: '/pages/worker/training-portal.html' }
        ],
        factory_admin: [
            { title: 'Manage Workers', icon: 'users', url: '/pages/factory-admin/factory-worker-portal.html' },
            { title: 'View Cases', icon: 'file-text', url: '/pages/factory-admin/case-management.html' },
            { title: 'Factory Settings', icon: 'settings', url: '/pages/factory-admin/factory-admin-settings.html' }
        ],
        hr_staff: [
            { title: 'Worker Management', icon: 'users', url: '/pages/hr-staff/hr-worker-management.html' },
            { title: 'Training Programs', icon: 'graduation-cap', url: '/pages/hr-staff/training-management.html' },
            { title: 'Compliance', icon: 'shield-check', url: '/pages/hr-staff/compliance-management.html' }
        ],
        grievance_committee: [
            { title: 'New Case', icon: 'plus-circle', url: '/pages/grievance-committee/case-intake-screen.html' },
            { title: 'Case Triage', icon: 'list-priority', url: '/pages/grievance-committee/case-triage-modal.html' },
            { title: 'Case Assignment', icon: 'user-check', url: '/pages/grievance-committee/case-assignment-panel.html' }
        ],
        auditor: [
            { title: 'New Audit', icon: 'plus-circle', url: '/pages/auditor/audit-planning.html' },
            { title: 'Evidence Collection', icon: 'folder-plus', url: '/pages/auditor/evidence-collection.html' },
            { title: 'Report Generation', icon: 'file-text', url: '/pages/auditor/audit-report-generation.html' }
        ],
        analytics_user: [
            { title: 'Analytics Dashboard', icon: 'bar-chart-3', url: '/pages/analytics/analytics-dashboard.html' },
            { title: 'CAP Analytics', icon: 'trending-up', url: '/pages/analytics/cap-analytics.html' },
            { title: 'Data Export', icon: 'download', url: '/pages/analytics/data-export.html' }
        ],
        super_admin: [
            { title: 'User Management', icon: 'users', url: '/pages/super-admin/user-management.html' },
            { title: 'System Settings', icon: 'settings', url: '/pages/super-admin/system-settings.html' },
            { title: 'System Monitoring', icon: 'activity', url: '/pages/super-admin/system-monitoring.html' }
        ]
    },

    // Role permissions and access control
    permissions: {
        worker: {
            canSubmitGrievance: true,
            canViewOwnCases: true,
            canAccessTraining: true,
            canViewProfile: true
        },
        factory_admin: {
            canManageWorkers: true,
            canViewFactoryCases: true,
            canManageFactorySettings: true,
            canViewFactoryReports: true
        },
        hr_staff: {
            canManageWorkers: true,
            canManageTraining: true,
            canManageCompliance: true,
            canViewHRReports: true
        },
        grievance_committee: {
            canManageCases: true,
            canAssignCases: true,
            canViewAllCases: true,
            canGenerateReports: true
        },
        auditor: {
            canConductAudits: true,
            canManageEvidence: true,
            canGenerateReports: true,
            canViewComplianceData: true
        },
        analytics_user: {
            canViewAnalytics: true,
            canExportData: true,
            canGenerateReports: true,
            canViewSystemMetrics: true
        },
        super_admin: {
            canManageUsers: true,
            canManageSystem: true,
            canViewAllData: true,
            canManageBackups: true
        }
    },

    // Helper functions
    getRoleConfig(role) {
        return this.roles[role] || null;
    },

    getQuickActions(role) {
        return this.quickActions[role] || [];
    },

    getPermissions(role) {
        return this.permissions[role] || {};
    },

    hasPermission(role, permission) {
        const rolePermissions = this.permissions[role];
        return rolePermissions ? rolePermissions[permission] : false;
    },

    // Get all available roles
    getAvailableRoles() {
        return Object.keys(this.roles);
    },

    // Get role display name
    getRoleDisplayName(role) {
        const roleConfig = this.roles[role];
        return roleConfig ? roleConfig.name : 'Unknown Role';
    },

    // Get role color
    getRoleColor(role) {
        const roleConfig = this.roles[role];
        return roleConfig ? roleConfig.color : '#6B7280';
    },

    // Get role icon
    getRoleIcon(role) {
        const roleConfig = this.roles[role];
        return roleConfig ? roleConfig.icon : 'user';
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationConfig;
}

// Make available globally
window.NavigationConfig = NavigationConfig;
