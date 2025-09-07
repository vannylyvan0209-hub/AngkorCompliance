/**
 * Centralized Navigation Configuration for Angkor Compliance Platform v2
 * Role-based navigation structure with proper permissions and organization
 */

// Prevent duplicate loading
if (typeof window.NavigationConfig === 'undefined') {
    const NavigationConfig = {
        system: {
            name: 'Angkor Compliance Platform v2',
            version: '2.0.0',
            environment: 'production',
            lastUpdated: '2024-01-15'
        },
        
        navigation: {
            // SUPER ADMIN NAVIGATION (25+ items)
            super_admin: [
                {
                    id: 'overview',
                    title: 'System Overview',
                    icon: 'bar-chart-3',
                    url: '/admin',
                    description: 'Multi-factory birds-eye view and system health',
                    section: 'main',
                    order: 1,
                    enabled: true
                },
                {
                    id: 'factories',
                    title: 'Factory Management',
                    icon: 'building-2',
                    url: '/admin/factories',
                    description: 'Manage factory registrations and compliance',
                    section: 'main',
                    order: 2,
                    enabled: true
                },
                {
                    id: 'users',
                    title: 'User Management',
                    icon: 'users',
                    url: '/admin/users',
                    description: 'Manage user accounts and permissions',
                    section: 'main',
                    order: 3,
                    enabled: true
                },
                {
                    id: 'standards',
                    title: 'Standards Registry',
                    icon: 'book-open',
                    url: 'standards-registry.html',
                    description: 'Manage compliance standards and requirements',
                    section: 'main',
                    order: 4,
                    enabled: true
                },
                {
                    id: 'analytics',
                    title: 'Enterprise Analytics',
                    icon: 'trending-up',
                    url: '/analytics',
                    description: 'Multi-factory analytics and reporting',
                    section: 'main',
                    order: 5,
                    enabled: true
                },
                {
                    id: 'system-hardening',
                    title: 'System Hardening',
                    icon: 'shield-check',
                    url: 'system-hardening-dashboard.html',
                    description: 'Security testing and performance monitoring',
                    section: 'main',
                    order: 6,
                    enabled: true
                },
                {
                    id: 'billing',
                    title: 'Billing & Licensing',
                    icon: 'credit-card',
                    url: '/admin/billing',
                    description: 'Subscription and payment oversight',
                    section: 'main',
                    order: 7,
                    enabled: true
                },
                {
                    id: 'settings',
                    title: 'System Settings',
                    icon: 'settings',
                    url: 'settings.html',
                    description: 'Global system configuration',
                    section: 'main',
                    order: 8,
                    enabled: true
                },
                {
                    id: 'diagnostics',
                    title: 'System Diagnostics',
                    icon: 'wrench',
                    url: 'diagnostics.html',
                    description: 'System health and troubleshooting',
                    section: 'main',
                    order: 9,
                    enabled: true
                },
                {
                    id: 'multi-factory-dashboard',
                    title: 'Multi-Factory Dashboard',
                    icon: 'building',
                    url: 'multi-factory-dashboard.html',
                    description: 'Birds-eye view of all factories',
                    section: 'main',
                    order: 10,
                    enabled: true
                },
                {
                    id: 'system-health',
                    title: 'System Health Dashboard',
                    icon: 'activity',
                    url: 'system-health-dashboard.html',
                    description: 'Performance and monitoring',
                    section: 'main',
                    order: 11,
                    enabled: true
                },
                {
                    id: 'analytics-dashboard',
                    title: 'Analytics Dashboard',
                    icon: 'bar-chart',
                    url: '/analytics',
                    description: 'Enterprise-wide analytics',
                    section: 'main',
                    order: 12,
                    enabled: true
                },
                {
                    id: 'user-profile-management',
                    title: 'User Profile Management',
                    icon: 'user-check',
                    url: 'user-profile-management.html',
                    description: 'Edit user profiles and settings',
                    section: 'main',
                    order: 13,
                    enabled: true
                },
                {
                    id: 'access-control',
                    title: 'Access Control Panel',
                    icon: 'shield',
                    url: 'access-control-panel.html',
                    description: 'Manage permissions and access',
                    section: 'main',
                    order: 14,
                    enabled: true
                },
                {
                    id: 'factory-registration',
                    title: 'Factory Registration',
                    icon: 'plus-circle',
                    url: '/admin/registration',
                    description: 'Add new factory details',
                    section: 'main',
                    order: 15,
                    enabled: true
                },
                {
                    id: 'factory-settings-panel',
                    title: 'Factory Settings Panel',
                    icon: 'settings',
                    url: '/admin/panel',
                    description: 'Configure factory-specific settings',
                    section: 'main',
                    order: 16,
                    enabled: true
                },
                {
                    id: 'multi-factory-overview',
                    title: 'Multi-Factory Overview',
                    icon: 'layers',
                    url: '/admin/overview',
                    description: 'Compare factory performance',
                    section: 'main',
                    order: 17,
                    enabled: true
                },
                {
                    id: 'standard-configuration',
                    title: 'Standard Configuration',
                    icon: 'book-open',
                    url: '/admin/configuration',
                    description: 'Add/edit compliance standards',
                    section: 'main',
                    order: 18,
                    enabled: true
                },
                {
                    id: 'requirement-management',
                    title: 'Requirement Management',
                    icon: 'list',
                    url: '/admin/requirements',
                    description: 'Define requirements and controls',
                    section: 'main',
                    order: 19,
                    enabled: true
                },
                {
                    id: 'audit-checklist-generator',
                    title: 'Audit Checklist Generator',
                    icon: 'check-square',
                    url: '/admin/checklist',
                    description: 'Create program-specific checklists',
                    section: 'main',
                    order: 20,
                    enabled: true
                },
                {
                    id: 'performance-monitoring',
                    title: 'Performance Monitoring',
                    icon: 'trending-up',
                    url: 'performance-monitoring.html',
                    description: 'System performance tracking',
                    section: 'main',
                    order: 21,
                    enabled: true
                },
                {
                    id: 'usage-analytics',
                    title: 'Usage Analytics',
                    icon: 'pie-chart',
                    url: 'usage-analytics.html',
                    description: 'Feature usage and adoption metrics',
                    section: 'main',
                    order: 22,
                    enabled: true
                },
                {
                    id: 'export-management',
                    title: 'Export Management',
                    icon: 'download',
                    url: 'export-management.html',
                    description: 'Generate enterprise reports',
                    section: 'main',
                    order: 23,
                    enabled: true
                }
            ],

            // FACTORY ADMIN NAVIGATION
            factory_admin: [
                {
                    id: 'factory-overview',
                    title: 'Factory Dashboard',
                    icon: 'home',
                    url: '/factory',
                    description: 'Single factory status and overview',
                    section: 'main',
                    order: 1,
                    enabled: true
                },
                {
                    id: 'factory-users',
                    title: 'Factory Users',
                    icon: 'users',
                    url: '/factory/users',
                    description: 'Manage factory users and roles',
                    section: 'main',
                    order: 2,
                    enabled: true
                },
                {
                    id: 'audit-preparation',
                    title: 'Audit Preparation',
                    icon: 'clipboard-check',
                    url: 'audit-preparation-dashboard.html',
                    description: 'Multi-standard audit preparation',
                    section: 'main',
                    order: 3,
                    enabled: true
                },
                {
                    id: 'cap-management',
                    title: 'CAP Management',
                    icon: 'clipboard-list',
                    url: '/cap',
                    description: 'Corrective Action Plans oversight',
                    section: 'main',
                    order: 4,
                    enabled: true
                },
                {
                    id: 'document-oversight',
                    title: 'Document Oversight',
                    icon: 'file-text',
                    url: 'document-oversight.html',
                    description: 'Monitor document processing',
                    section: 'main',
                    order: 5,
                    enabled: true
                },
                {
                    id: 'approvals',
                    title: 'Approvals',
                    icon: 'check-circle',
                    url: '/approval',
                    description: 'Document and request approvals',
                    section: 'main',
                    order: 6,
                    enabled: true
                },
                {
                    id: 'grievance-oversight',
                    title: 'Grievance Oversight',
                    icon: 'message-circle',
                    url: 'grievance-oversight.html',
                    description: 'Monitor grievance processing',
                    section: 'main',
                    order: 7,
                    enabled: true
                },
                {
                    id: 'factory-analytics',
                    title: 'Factory Analytics',
                    icon: 'bar-chart-3',
                    url: 'factory-analytics.html',
                    description: 'Factory-specific analytics and reports',
                    section: 'main',
                    order: 8,
                    enabled: true
                },
                {
                    id: 'tasks-calendar',
                    title: 'Tasks & Calendar',
                    icon: 'list-todo',
                    url: 'tasks-dashboard.html',
                    description: 'Task management and calendar',
                    section: 'main',
                    order: 9,
                    enabled: true
                },
                {
                    id: 'factory-settings',
                    title: 'Factory Settings',
                    icon: 'settings',
                    url: 'factory-settings.html',
                    description: 'Factory-specific configuration',
                    section: 'main',
                    order: 10,
                    enabled: true
                },
                {
                    id: 'factory-analytics-dashboard',
                    title: 'Factory Analytics Dashboard',
                    icon: 'bar-chart-3',
                    url: 'factory-analytics-dashboard.html',
                    description: 'Factory-specific analytics',
                    section: 'main',
                    order: 11,
                    enabled: true
                },
                {
                    id: 'compliance-dashboard',
                    title: 'Compliance Dashboard',
                    icon: 'check-circle',
                    url: 'compliance-dashboard.html',
                    description: 'Factory compliance status',
                    section: 'main',
                    order: 12,
                    enabled: true
                },
                {
                    id: 'performance-dashboard',
                    title: 'Performance Dashboard',
                    icon: 'trending-up',
                    url: 'performance-dashboard.html',
                    description: 'Factory performance metrics',
                    section: 'main',
                    order: 13,
                    enabled: true
                },
                {
                    id: 'user-invitation',
                    title: 'User Invitation',
                    icon: 'user-plus',
                    url: 'user-invitation.html',
                    description: 'Invite new users to factory',
                    section: 'main',
                    order: 14,
                    enabled: true
                },
                {
                    id: 'document-analytics',
                    title: 'Document Analytics',
                    icon: 'file-bar-chart',
                    url: 'document-analytics.html',
                    description: 'Document processing metrics',
                    section: 'main',
                    order: 15,
                    enabled: true
                },
                {
                    id: 'document-settings',
                    title: 'Document Settings',
                    icon: 'file-cog',
                    url: 'document-settings.html',
                    description: 'Configure document workflows',
                    section: 'main',
                    order: 16,
                    enabled: true
                },
                {
                    id: 'cap-analytics',
                    title: 'CAP Analytics',
                    icon: 'clipboard-bar-chart',
                    url: '/analytics/cap',
                    description: 'CAP performance metrics',
                    section: 'main',
                    order: 17,
                    enabled: true
                },
                {
                    id: 'cap-settings',
                    title: 'CAP Settings',
                    icon: 'clipboard-cog',
                    url: 'cap-settings.html',
                    description: 'Configure CAP workflows',
                    section: 'main',
                    order: 18,
                    enabled: true
                },
                {
                    id: 'factory-performance-analytics',
                    title: 'Factory Performance Analytics',
                    icon: 'activity',
                    url: 'factory-performance-analytics.html',
                    description: 'Factory-specific metrics',
                    section: 'main',
                    order: 19,
                    enabled: true
                },
                {
                    id: 'compliance-analytics',
                    title: 'Compliance Analytics',
                    icon: 'shield-check',
                    url: 'compliance-analytics.html',
                    description: 'Compliance tracking and reporting',
                    section: 'main',
                    order: 20,
                    enabled: true
                },
                {
                    id: 'risk-analytics',
                    title: 'Risk Analytics',
                    icon: 'alert-triangle',
                    url: 'risk-analytics.html',
                    description: 'Risk assessment and monitoring',
                    section: 'main',
                    order: 21,
                    enabled: true
                },
                {
                    id: 'export-functionality',
                    title: 'Export Functionality',
                    icon: 'download',
                    url: 'export-functionality.html',
                    description: 'Generate factory reports',
                    section: 'main',
                    order: 22,
                    enabled: true
                }
            ],

            // HR STAFF NAVIGATION (13 → 30+ items)
            hr_staff: [
                {
                    id: 'hr-dashboard',
                    title: 'HR Dashboard',
                    icon: 'user-cog',
                    url: '/hr',
                    description: 'HR-specific overview and management',
                    section: 'main',
                    order: 1,
                    enabled: true
                },
                {
                    id: 'document-management',
                    title: 'Document Management',
                    icon: 'file-text',
                    url: 'documents.html',
                    description: 'Upload and manage compliance documents',
                    section: 'main',
                    order: 2,
                    enabled: true
                },
                {
                    id: 'training-meetings',
                    title: 'Training & Meetings',
                    icon: 'graduation-cap',
                    url: 'training-meetings.html',
                    description: 'Training matrix and meeting management',
                    section: 'main',
                    order: 3,
                    enabled: true
                },
                {
                    id: 'permits-certificates',
                    title: 'Permits & Certificates',
                    icon: 'award',
                    url: 'permits-certificates.html',
                    description: 'Permit registry and expiry tracking',
                    section: 'main',
                    order: 4,
                    enabled: true
                },
                {
                    id: 'cap-execution',
                    title: 'CAP Execution',
                    icon: 'clipboard-list',
                    url: 'cap-execution.html',
                    description: 'Execute and monitor CAPs',
                    section: 'main',
                    order: 5,
                    enabled: true
                },
                {
                    id: 'hr-analytics',
                    title: 'HR Analytics',
                    icon: 'bar-chart-3',
                    url: 'hr-analytics.html',
                    description: 'HR-specific analytics and reporting',
                    section: 'main',
                    order: 6,
                    enabled: true
                },
                {
                    id: 'hr-tasks',
                    title: 'HR Tasks',
                    icon: 'list-todo',
                    url: 'hr-tasks.html',
                    description: 'HR task management and calendar',
                    section: 'main',
                    order: 7,
                    enabled: true
                },
                {
                    id: 'document-management-dashboard',
                    title: 'Document Management Dashboard',
                    icon: 'file-bar-chart',
                    url: 'document-management-dashboard.html',
                    description: 'Document processing overview',
                    section: 'main',
                    order: 8,
                    enabled: true
                },
                {
                    id: 'training-dashboard',
                    title: 'Training Dashboard',
                    icon: 'graduation-cap',
                    url: 'training-dashboard.html',
                    description: 'Training management overview',
                    section: 'main',
                    order: 9,
                    enabled: true
                },
                {
                    id: 'permits-dashboard',
                    title: 'Permits Dashboard',
                    icon: 'award',
                    url: 'permits-dashboard.html',
                    description: 'Permit and certificate tracking',
                    section: 'main',
                    order: 10,
                    enabled: true
                },
                {
                    id: 'document-processing-modal',
                    title: 'Document Processing',
                    icon: 'file-cog',
                    url: 'document-processing.html',
                    description: 'AI-powered document analysis',
                    section: 'main',
                    order: 11,
                    enabled: true
                },
                {
                    id: 'document-version-control',
                    title: 'Document Version Control',
                    icon: 'git-branch',
                    url: 'document-version-control.html',
                    description: 'Manage document versions',
                    section: 'main',
                    order: 12,
                    enabled: true
                },
                {
                    id: 'document-approval-workflow',
                    title: 'Document Approval Workflow',
                    icon: 'check-square',
                    url: 'document-approval-workflow.html',
                    description: 'Document approval process',
                    section: 'main',
                    order: 13,
                    enabled: true
                },
                {
                    id: 'document-categories',
                    title: 'Document Categories',
                    icon: 'folder',
                    url: 'document-categories.html',
                    description: 'Organize documents by type',
                    section: 'main',
                    order: 14,
                    enabled: true
                },
                {
                    id: 'document-search-filter',
                    title: 'Document Search & Filter',
                    icon: 'search',
                    url: 'document-search-filter.html',
                    description: 'Find and filter documents',
                    section: 'main',
                    order: 15,
                    enabled: true
                },
                {
                    id: 'training-matrix-management',
                    title: 'Training Matrix Management',
                    icon: 'grid',
                    url: 'training-matrix-management.html',
                    description: 'Manage training requirements',
                    section: 'main',
                    order: 16,
                    enabled: true
                },
                {
                    id: 'meeting-agenda-generator',
                    title: 'Meeting Agenda Generator',
                    icon: 'calendar-plus',
                    url: 'meeting-agenda-generator.html',
                    description: 'AI-powered agenda creation',
                    section: 'main',
                    order: 17,
                    enabled: true
                },
                {
                    id: 'attendance-tracking',
                    title: 'Attendance Tracking',
                    icon: 'users',
                    url: 'attendance-tracking.html',
                    description: 'Track meeting and training attendance',
                    section: 'main',
                    order: 18,
                    enabled: true
                },
                {
                    id: 'certificate-management',
                    title: 'Certificate Management',
                    icon: 'award',
                    url: 'certificate-management.html',
                    description: 'Issue and manage certificates',
                    section: 'main',
                    order: 19,
                    enabled: true
                },
                {
                    id: 'training-calendar',
                    title: 'Training Calendar',
                    icon: 'calendar',
                    url: 'training-calendar.html',
                    description: 'Schedule and manage training sessions',
                    section: 'main',
                    order: 20,
                    enabled: true
                },
                {
                    id: 'quiz-assessment',
                    title: 'Quiz & Assessment',
                    icon: 'help-circle',
                    url: 'quiz-assessment.html',
                    description: 'Create and manage assessments',
                    section: 'main',
                    order: 21,
                    enabled: true
                },
                {
                    id: 'permit-categories',
                    title: 'Permit Categories',
                    icon: 'folder',
                    url: 'permit-categories.html',
                    description: 'Organize permits by type',
                    section: 'main',
                    order: 22,
                    enabled: true
                },
                {
                    id: 'evidence-capture',
                    title: 'Evidence Capture',
                    icon: 'camera',
                    url: 'evidence-capture.html',
                    description: 'Upload renewal evidence',
                    section: 'main',
                    order: 23,
                    enabled: true
                },
                {
                    id: 'permit-analytics',
                    title: 'Permit Analytics',
                    icon: 'bar-chart',
                    url: 'permit-analytics.html',
                    description: 'Track permit status and trends',
                    section: 'main',
                    order: 24,
                    enabled: true
                }
            ],

            // GRIEVANCE COMMITTEE NAVIGATION (13 → 20+ items)
            grievance_committee: [
                {
                    id: 'committee-dashboard',
                    title: 'Committee Dashboard',
                    icon: 'users',
                    url: 'committee-dashboard.html',
                    description: 'Committee overview and performance',
                    section: 'main',
                    order: 1,
                    enabled: true
                },
                {
                    id: 'case-management',
                    title: 'Case Management',
                    icon: 'folder-open',
                    url: 'pages/grievance-committee/case-management.html',
                    description: 'Grievance case intake and processing',
                    section: 'main',
                    order: 2,
                    enabled: true
                },
                {
                    id: 'case-intake',
                    title: 'Case Intake',
                    icon: 'plus-circle',
                    url: 'case-intake.html',
                    description: 'Receive and triage grievances',
                    section: 'main',
                    order: 3,
                    enabled: true
                },
                {
                    id: 'investigations',
                    title: 'Investigations',
                    icon: 'search',
                    url: 'investigations.html',
                    description: 'Manage investigation process',
                    section: 'main',
                    order: 4,
                    enabled: true
                },
                {
                    id: 'case-resolution',
                    title: 'Case Resolution',
                    icon: 'check-square',
                    url: 'case-resolution.html',
                    description: 'Document resolutions and closures',
                    section: 'main',
                    order: 5,
                    enabled: true
                },
                {
                    id: 'committee-analytics',
                    title: 'Committee Analytics',
                    icon: 'bar-chart-3',
                    url: '/grievance/analytics',
                    description: 'Committee performance and SLA metrics',
                    section: 'main',
                    order: 6,
                    enabled: true
                },
                {
                    id: 'committee-reports',
                    title: 'Committee Reports',
                    icon: 'file-bar-chart',
                    url: 'committee-reports.html',
                    description: 'Generate committee reports',
                    section: 'main',
                    order: 7,
                    enabled: true
                },
                {
                    id: 'case-management-dashboard',
                    title: 'Case Management Dashboard',
                    icon: 'folder-open',
                    url: 'pages/grievance-committee/case-management-dashboard.html',
                    description: 'Case processing overview',
                    section: 'main',
                    order: 8,
                    enabled: true
                },
                {
                    id: 'investigation-dashboard',
                    title: 'Investigation Dashboard',
                    icon: 'search',
                    url: 'investigation-dashboard.html',
                    description: 'Investigation management',
                    section: 'main',
                    order: 9,
                    enabled: true
                },
                {
                    id: 'case-triage-modal',
                    title: 'Case Triage',
                    icon: 'alert-triangle',
                    url: 'case-triage.html',
                    description: 'Assess and categorize cases',
                    section: 'main',
                    order: 10,
                    enabled: true
                },
                {
                    id: 'case-assignment-panel',
                    title: 'Case Assignment',
                    icon: 'user-plus',
                    url: 'case-assignment.html',
                    description: 'Assign cases to investigators',
                    section: 'main',
                    order: 11,
                    enabled: true
                },
                {
                    id: 'case-tracking',
                    title: 'Case Tracking',
                    icon: 'map-pin',
                    url: '/grievance/tracking',
                    description: 'Monitor case progress',
                    section: 'main',
                    order: 12,
                    enabled: true
                },
                {
                    id: 'case-closure',
                    title: 'Case Closure',
                    icon: 'check-circle',
                    url: 'case-closure.html',
                    description: 'Close completed cases',
                    section: 'main',
                    order: 13,
                    enabled: true
                },
                {
                    id: 'investigation-workflow',
                    title: 'Investigation Workflow',
                    icon: 'git-branch',
                    url: '/grievance/investigation',
                    description: 'Manage investigation process',
                    section: 'main',
                    order: 14,
                    enabled: true
                },
                {
                    id: 'evidence-collection',
                    title: 'Evidence Collection',
                    icon: 'folder-plus',
                    url: '/auditor/evidence',
                    description: 'Collect and organize evidence',
                    section: 'main',
                    order: 15,
                    enabled: true
                },
                {
                    id: 'interview-management',
                    title: 'Interview Management',
                    icon: 'message-square',
                    url: 'interview-management.html',
                    description: 'Schedule and conduct interviews',
                    section: 'main',
                    order: 16,
                    enabled: true
                },
                {
                    id: 'investigation-reports',
                    title: 'Investigation Reports',
                    icon: 'file-text',
                    url: 'investigation-reports.html',
                    description: 'Generate investigation reports',
                    section: 'main',
                    order: 17,
                    enabled: true
                },
                {
                    id: 'case-notes',
                    title: 'Case Notes',
                    icon: 'edit',
                    url: '/grievance/notes',
                    description: 'Document investigation findings',
                    section: 'main',
                    order: 18,
                    enabled: true
                },
                {
                    id: 'confidentiality-management',
                    title: 'Confidentiality Management',
                    icon: 'shield',
                    url: 'confidentiality-management.html',
                    description: 'Maintain case confidentiality',
                    section: 'main',
                    order: 19,
                    enabled: true
                },
                {
                    id: 'sla-management',
                    title: 'SLA Management',
                    icon: 'clock',
                    url: '/grievance/sla',
                    description: 'Monitor service level agreements',
                    section: 'main',
                    order: 20,
                    enabled: true
                },
                {
                    id: 'case-statistics',
                    title: 'Case Statistics',
                    icon: 'bar-chart-2',
                    url: 'case-statistics.html',
                    description: 'Case processing statistics',
                    section: 'main',
                    order: 21,
                    enabled: true
                },
                {
                    id: 'trend-analysis',
                    title: 'Trend Analysis',
                    icon: 'trending-up',
                    url: 'trend-analysis.html',
                    description: 'Identify grievance trends',
                    section: 'main',
                    order: 22,
                    enabled: true
                },
                {
                    id: 'performance-metrics',
                    title: 'Performance Metrics',
                    icon: 'target',
                    url: 'performance-metrics.html',
                    description: 'Track committee performance',
                    section: 'main',
                    order: 23,
                    enabled: true
                }
            ],

            // AUDITOR NAVIGATION (12 → 18+ items)
            auditor: [
                {
                    id: 'auditor-dashboard',
                    title: 'Auditor Dashboard',
                    icon: 'search',
                    url: '/auditor',
                    description: 'Read-only compliance overview',
                    section: 'main',
                    order: 1,
                    enabled: true
                },
                {
                    id: 'audit-preparation',
                    title: 'Audit Preparation',
                    icon: 'clipboard-check',
                    url: 'auditor-audit-prep.html',
                    description: 'Prepare for audits and reviews',
                    section: 'main',
                    order: 2,
                    enabled: true
                },
                {
                    id: 'evidence-review',
                    title: 'Evidence Review',
                    icon: 'file-text',
                    url: '/auditor/evidence/review',
                    description: 'Review compliance evidence',
                    section: 'main',
                    order: 3,
                    enabled: true
                },
                {
                    id: 'cap-review',
                    title: 'CAP Review',
                    icon: 'clipboard-list',
                    url: 'cap-review.html',
                    description: 'Review Corrective Action Plans',
                    section: 'main',
                    order: 4,
                    enabled: true
                },
                {
                    id: 'audit-reporting',
                    title: 'Audit Reporting',
                    icon: 'file-bar-chart',
                    url: 'audit-reporting.html',
                    description: 'Generate audit reports',
                    section: 'main',
                    order: 5,
                    enabled: true
                },
                {
                    id: 'auditor-analytics',
                    title: 'Auditor Analytics',
                    icon: 'bar-chart-3',
                    url: 'auditor-analytics.html',
                    description: 'Audit performance analytics',
                    section: 'main',
                    order: 6,
                    enabled: true
                },
                {
                    id: 'audit-preparation-dashboard',
                    title: 'Audit Preparation Dashboard',
                    icon: 'clipboard-check',
                    url: 'audit-preparation-dashboard.html',
                    description: 'Audit readiness overview',
                    section: 'main',
                    order: 7,
                    enabled: true
                },
                {
                    id: 'evidence-review-dashboard',
                    title: 'Evidence Review Dashboard',
                    icon: 'file-text',
                    url: 'evidence-review-dashboard.html',
                    description: 'Evidence management overview',
                    section: 'main',
                    order: 8,
                    enabled: true
                },
                {
                    id: 'audit-reporting-dashboard',
                    title: 'Audit Reporting Dashboard',
                    icon: 'file-bar-chart',
                    url: 'audit-reporting-dashboard.html',
                    description: 'Audit reporting overview',
                    section: 'main',
                    order: 9,
                    enabled: true
                },
                {
                    id: 'audit-checklist-generator',
                    title: 'Audit Checklist Generator',
                    icon: 'check-square',
                    url: '/admin/checklist',
                    description: 'Generate audit checklists',
                    section: 'main',
                    order: 10,
                    enabled: true
                },
                {
                    id: 'evidence-binder-creation',
                    title: 'Evidence Binder Creation',
                    icon: 'folder-plus',
                    url: '/auditor/evidence/binder',
                    description: 'Create evidence binders',
                    section: 'main',
                    order: 11,
                    enabled: true
                },
                {
                    id: 'compliance-documentation-review',
                    title: 'Compliance Documentation Review',
                    icon: 'file-check',
                    url: '/auditor/compliance',
                    description: 'Review compliance docs',
                    section: 'main',
                    order: 12,
                    enabled: true
                },
                {
                    id: 'audit-planning',
                    title: 'Audit Planning',
                    icon: 'calendar',
                    url: '/auditor/planning',
                    description: 'Plan audit activities',
                    section: 'main',
                    order: 13,
                    enabled: true
                },
                {
                    id: 'pre-audit-assessment',
                    title: 'Pre-Audit Assessment',
                    icon: 'clipboard-list',
                    url: 'pre-audit-assessment.html',
                    description: 'Assess audit readiness',
                    section: 'main',
                    order: 14,
                    enabled: true
                },
                {
                    id: 'audit-calendar',
                    title: 'Audit Calendar',
                    icon: 'calendar-days',
                    url: 'audit-calendar.html',
                    description: 'Schedule audit activities',
                    section: 'main',
                    order: 15,
                    enabled: true
                },
                {
                    id: 'evidence-collection',
                    title: 'Evidence Collection',
                    icon: 'folder-plus',
                    url: '/auditor/evidence',
                    description: 'Collect audit evidence',
                    section: 'main',
                    order: 16,
                    enabled: true
                },
                {
                    id: 'evidence-organization',
                    title: 'Evidence Organization',
                    icon: 'folder-open',
                    url: '/auditor/evidence/organization',
                    description: 'Organize evidence by standard',
                    section: 'main',
                    order: 17,
                    enabled: true
                },
                {
                    id: 'evidence-linking',
                    title: 'Evidence Linking',
                    icon: 'link',
                    url: '/auditor/evidence/linking',
                    description: 'Link evidence to requirements',
                    section: 'main',
                    order: 18,
                    enabled: true
                },
                {
                    id: 'evidence-export',
                    title: 'Evidence Export',
                    icon: 'download',
                    url: '/auditor/evidence/export',
                    description: 'Export evidence for reports',
                    section: 'main',
                    order: 19,
                    enabled: true
                },
                {
                    id: 'evidence-analytics',
                    title: 'Evidence Analytics',
                    icon: 'bar-chart',
                    url: 'evidence-analytics.html',
                    description: 'Track evidence completeness',
                    section: 'main',
                    order: 20,
                    enabled: true
                },
                {
                    id: 'finding-documentation',
                    title: 'Finding Documentation',
                    icon: 'file-text',
                    url: '/auditor/findings',
                    description: 'Document audit findings',
                    section: 'main',
                    order: 21,
                    enabled: true
                },
                {
                    id: 'recommendation-tracking',
                    title: 'Recommendation Tracking',
                    icon: 'list-checks',
                    url: 'recommendation-tracking.html',
                    description: 'Track recommendations',
                    section: 'main',
                    order: 22,
                    enabled: true
                },
                {
                    id: 'report-export',
                    title: 'Report Export',
                    icon: 'download',
                    url: 'report-export.html',
                    description: 'Export audit reports',
                    section: 'main',
                    order: 23,
                    enabled: true
                },
                {
                    id: 'follow-up-tracking',
                    title: 'Follow-up Tracking',
                    icon: 'refresh-cw',
                    url: 'follow-up-tracking.html',
                    description: 'Track recommendation follow-up',
                    section: 'main',
                    order: 24,
                    enabled: true
                }
            ],

            // WORKER NAVIGATION (7 → 12+ items)
            worker: [
                {
                    id: 'worker-portal',
                    title: 'Worker Portal',
                    icon: 'user',
                    url: 'worker-portal.html',
                    description: 'Anonymous grievance submission',
                    section: 'main',
                    order: 1,
                    enabled: true
                },
                {
                    id: 'case-tracking',
                    title: 'Case Tracking',
                    icon: 'folder-open',
                    url: '/grievance/tracking',
                    description: 'Track submitted grievances',
                    section: 'main',
                    order: 2,
                    enabled: true
                },
                {
                    id: 'worker-communication',
                    title: 'Communication',
                    icon: 'message-circle',
                    url: 'worker-communication.html',
                    description: 'Communicate with committee',
                    section: 'main',
                    order: 3,
                    enabled: true
                },
                {
                    id: 'case-tracking-portal',
                    title: 'Case Tracking Portal',
                    icon: 'map-pin',
                    url: '/worker/tracking',
                    description: 'Track submitted cases',
                    section: 'main',
                    order: 4,
                    enabled: true
                },
                {
                    id: 'worker-dashboard',
                    title: 'Worker Dashboard',
                    icon: 'home',
                    url: '/worker',
                    description: 'Worker-specific overview',
                    section: 'main',
                    order: 5,
                    enabled: true
                },
                {
                    id: 'grievance-submission-form',
                    title: 'Grievance Submission',
                    icon: 'plus-circle',
                    url: 'grievance-submission-form.html',
                    description: 'Submit grievances anonymously',
                    section: 'main',
                    order: 6,
                    enabled: true
                },
                {
                    id: 'case-status-tracking',
                    title: 'Case Status Tracking',
                    icon: 'activity',
                    url: 'case-status-tracking.html',
                    description: 'Track case progress',
                    section: 'main',
                    order: 7,
                    enabled: true
                },
                {
                    id: 'communication-portal',
                    title: 'Communication Portal',
                    icon: 'message-square',
                    url: 'communication-portal.html',
                    description: 'Communicate with committee',
                    section: 'main',
                    order: 8,
                    enabled: true
                },
                {
                    id: 'confidentiality-assurance',
                    title: 'Confidentiality Assurance',
                    icon: 'shield',
                    url: 'confidentiality-assurance.html',
                    description: 'Maintain anonymity',
                    section: 'main',
                    order: 9,
                    enabled: true
                },
                {
                    id: 'submission-confirmation',
                    title: 'Submission Confirmation',
                    icon: 'check-circle',
                    url: 'submission-confirmation.html',
                    description: 'Confirm grievance submission',
                    section: 'main',
                    order: 10,
                    enabled: true
                },
                {
                    id: 'case-updates',
                    title: 'Case Updates',
                    icon: 'bell',
                    url: 'case-updates.html',
                    description: 'Receive case updates',
                    section: 'main',
                    order: 11,
                    enabled: true
                },
                {
                    id: 'qr-code-access',
                    title: 'QR Code Access',
                    icon: 'smartphone',
                    url: '/worker/qr',
                    description: 'Access via QR codes',
                    section: 'main',
                    order: 12,
                    enabled: true
                },
                {
                    id: 'mobile-interface',
                    title: 'Mobile Interface',
                    icon: 'smartphone',
                    url: '/worker/mobile',
                    description: 'Mobile-friendly interface',
                    section: 'main',
                    order: 13,
                    enabled: true
                },
                {
                    id: 'kiosk-interface',
                    title: 'Kiosk Interface',
                    icon: 'monitor',
                    url: '/worker/kiosk',
                    description: 'Factory kiosk access',
                    section: 'main',
                    order: 14,
                    enabled: true
                },
                {
                    id: 'whatsapp-integration',
                    title: 'WhatsApp Integration',
                    icon: 'message-circle',
                    url: '/worker/whatsapp',
                    description: 'Submit via WhatsApp',
                    section: 'main',
                    order: 15,
                    enabled: true
                },
                {
                    id: 'hotline-integration',
                    title: 'Hotline Integration',
                    icon: 'phone',
                    url: 'hotline-integration.html',
                    description: 'Phone-based submission',
                    section: 'main',
                    order: 16,
                    enabled: true
                },
                {
                    id: 'in-person-entry',
                    title: 'In-Person Entry',
                    icon: 'user',
                    url: 'in-person-entry.html',
                    description: 'Direct submission',
                    section: 'main',
                    order: 17,
                    enabled: true
                }
            ],
            
            // SYSTEM-WIDE MODULES (6 → 30+ items)
            system_wide: [
                {
                    id: 'ai-copilot',
                    title: 'AI Copilot',
                    icon: 'bot',
                    url: '/admin/ai',
                    description: 'AI-powered assistance and automation',
                    section: 'tools',
                    order: 1,
                    enabled: true
                },
                {
                    id: 'notifications',
                    title: 'Notifications',
                    icon: 'bell',
                    url: 'notifications.html',
                    description: 'System notifications and alerts',
                    section: 'tools',
                    order: 2,
                    enabled: true
                },
                {
                    id: 'profile',
                    title: 'Profile',
                    icon: 'user',
                    url: '/profile',
                    description: 'User profile and preferences',
                    section: 'tools',
                    order: 3,
                    enabled: true
                },
                {
                    id: 'help',
                    title: 'Help & Support',
                    icon: 'help-circle',
                    url: '/admin/help',
                    description: 'Help documentation and support',
                    section: 'tools',
                    order: 4,
                    enabled: true
                },
                {
                    id: 'language',
                    title: 'Language',
                    icon: 'globe',
                    action: 'toggleLanguage',
                    description: 'Toggle Khmer/English',
                    section: 'tools',
                    order: 5,
                    enabled: true
                },
                {
                    id: 'logout',
                    title: 'Logout',
                    icon: 'log-out',
                    action: 'logout',
                    description: 'Sign out of the system',
                    section: 'tools',
                    order: 99,
                    enabled: true
                },
                // AI Copilot System
                {
                    id: 'ai-assistant-interface',
                    title: 'AI Assistant Interface',
                    icon: 'message-square',
                    url: 'ai-assistant-interface.html',
                    description: 'Interactive AI assistant interface',
                    section: 'ai',
                    order: 6,
                    enabled: true
                },
                {
                    id: 'document-analysis',
                    title: 'Document Analysis',
                    icon: 'file-text',
                    url: 'document-analysis.html',
                    description: 'AI-powered document analysis',
                    section: 'ai',
                    order: 7,
                    enabled: true
                },
                {
                    id: 'cap-generation',
                    title: 'CAP Generation',
                    icon: 'plus-circle',
                    url: 'cap-generation.html',
                    description: 'AI-powered CAP generation',
                    section: 'ai',
                    order: 8,
                    enabled: true
                },
                {
                    id: 'risk-assessment',
                    title: 'Risk Assessment',
                    icon: 'alert-triangle',
                    url: 'risk-assessment.html',
                    description: 'AI-powered risk assessment',
                    section: 'ai',
                    order: 9,
                    enabled: true
                },
                {
                    id: 'agenda-generation',
                    title: 'Agenda Generation',
                    icon: 'calendar',
                    url: 'agenda-generation.html',
                    description: 'AI-powered agenda generation',
                    section: 'ai',
                    order: 10,
                    enabled: true
                },
                {
                    id: 'standard-query',
                    title: 'Standard Query',
                    icon: 'search',
                    url: 'standard-query.html',
                    description: 'Query compliance standards',
                    section: 'ai',
                    order: 11,
                    enabled: true
                },
                // Analytics & Exports
                {
                    id: 'risk-heatmap',
                    title: 'Risk Heatmap',
                    icon: 'map',
                    url: 'risk-heatmap.html',
                    description: 'Visual risk assessment heatmap',
                    section: 'analytics',
                    order: 12,
                    enabled: true
                },
                {
                    id: 'kpi-dashboard',
                    title: 'KPI Dashboard',
                    icon: 'bar-chart-3',
                    url: 'kpi-dashboard.html',
                    description: 'Key Performance Indicators',
                    section: 'analytics',
                    order: 13,
                    enabled: true
                },
                {
                    id: 'compliance-analytics',
                    title: 'Compliance Analytics',
                    icon: 'trending-up',
                    url: 'compliance-analytics.html',
                    description: 'Compliance tracking and reporting',
                    section: 'analytics',
                    order: 14,
                    enabled: true
                },
                {
                    id: 'export-management',
                    title: 'Export Management',
                    icon: 'download',
                    url: 'export-management.html',
                    description: 'Generate and manage exports',
                    section: 'analytics',
                    order: 15,
                    enabled: true
                },
                {
                    id: 'data-visualization',
                    title: 'Data Visualization',
                    icon: 'pie-chart',
                    url: 'data-visualization.html',
                    description: 'Interactive data visualization',
                    section: 'analytics',
                    order: 16,
                    enabled: true
                },
                {
                    id: 'trend-analysis',
                    title: 'Trend Analysis',
                    icon: 'activity',
                    url: 'trend-analysis.html',
                    description: 'Analyze trends and patterns',
                    section: 'analytics',
                    order: 17,
                    enabled: true
                },
                // Tasks & Calendar
                {
                    id: 'task-management',
                    title: 'Task Management',
                    icon: 'check-square',
                    url: 'task-management.html',
                    description: 'Manage tasks and assignments',
                    section: 'tasks',
                    order: 18,
                    enabled: true
                },
                {
                    id: 'calendar-integration',
                    title: 'Calendar Integration',
                    icon: 'calendar-days',
                    url: 'calendar-integration.html',
                    description: 'Calendar and event management',
                    section: 'tasks',
                    order: 19,
                    enabled: true
                },
                {
                    id: 'notification-system',
                    title: 'Notification System',
                    icon: 'bell-ring',
                    url: '/admin/notifications',
                    description: 'System-wide notifications',
                    section: 'tasks',
                    order: 20,
                    enabled: true
                },
                {
                    id: 'task-assignment',
                    title: 'Task Assignment',
                    icon: 'user-plus',
                    url: 'task-assignment.html',
                    description: 'Assign tasks to users',
                    section: 'tasks',
                    order: 21,
                    enabled: true
                },
                {
                    id: 'task-tracking',
                    title: 'Task Tracking',
                    icon: 'map-pin',
                    url: 'task-tracking.html',
                    description: 'Track task progress',
                    section: 'tasks',
                    order: 22,
                    enabled: true
                },
                {
                    id: 'calendar-sync',
                    title: 'Calendar Sync',
                    icon: 'refresh-cw',
                    url: '/training/calendar',
                    description: 'Synchronize calendars',
                    section: 'tasks',
                    order: 23,
                    enabled: true
                },
                // Security & Access
                {
                    id: 'authentication-system',
                    title: 'Authentication System',
                    icon: 'shield',
                    url: 'authentication-system.html',
                    description: 'User authentication and security',
                    section: 'security',
                    order: 24,
                    enabled: true
                },
                {
                    id: 'role-based-access-control',
                    title: 'Role-Based Access Control',
                    icon: 'users',
                    url: 'role-based-access-control.html',
                    description: 'Manage user roles and permissions',
                    section: 'security',
                    order: 25,
                    enabled: true
                },
                {
                    id: 'audit-logging',
                    title: 'Audit Logging',
                    icon: 'file-text',
                    url: '/admin/audit-log',
                    description: 'System audit logs',
                    section: 'security',
                    order: 26,
                    enabled: true
                },
                {
                    id: 'data-encryption',
                    title: 'Data Encryption',
                    icon: 'lock',
                    url: 'data-encryption.html',
                    description: 'Data security and encryption',
                    section: 'security',
                    order: 27,
                    enabled: true
                },
                {
                    id: 'session-management',
                    title: 'Session Management',
                    icon: 'clock',
                    url: 'session-management.html',
                    description: 'User session management',
                    section: 'security',
                    order: 28,
                    enabled: true
                },
                {
                    id: 'security-monitoring',
                    title: 'Security Monitoring',
                    icon: 'eye',
                    url: 'security-monitoring.html',
                    description: 'Security monitoring and alerts',
                    section: 'security',
                    order: 29,
                    enabled: true
                },
                // Internationalization
                {
                    id: 'language-switching',
                    title: 'Language Switching',
                    icon: 'globe',
                    url: 'language-switching.html',
                    description: 'Switch between languages',
                    section: 'i18n',
                    order: 30,
                    enabled: true
                },
                {
                    id: 'bilingual-interface',
                    title: 'Bilingual Interface',
                    icon: 'languages',
                    url: 'bilingual-interface.html',
                    description: 'Bilingual user interface',
                    section: 'i18n',
                    order: 31,
                    enabled: true
                },
                {
                    id: 'cultural-adaptation',
                    title: 'Cultural Adaptation',
                    icon: 'heart',
                    url: 'cultural-adaptation.html',
                    description: 'Cultural sensitivity features',
                    section: 'i18n',
                    order: 32,
                    enabled: true
                },
                {
                    id: 'translation-features',
                    title: 'Translation Features',
                    icon: 'translate',
                    url: 'translation-features.html',
                    description: 'Content translation tools',
                    section: 'i18n',
                    order: 33,
                    enabled: true
                },
                {
                    id: 'localized-content',
                    title: 'Localized Content',
                    icon: 'file',
                    url: 'localized-content.html',
                    description: 'Localized content management',
                    section: 'i18n',
                    order: 34,
                    enabled: true
                },
                {
                    id: 'cultural-sensitivity',
                    title: 'Cultural Sensitivity',
                    icon: 'smile',
                    url: 'cultural-sensitivity.html',
                    description: 'Cultural sensitivity settings',
                    section: 'i18n',
                    order: 35,
                    enabled: true
                },
                // Mobile & Responsive Features
                {
                    id: 'mobile-dashboard',
                    title: 'Mobile Dashboard',
                    icon: 'smartphone',
                    url: 'mobile-dashboard.html',
                    description: 'Mobile-optimized dashboard',
                    section: 'mobile',
                    order: 36,
                    enabled: true
                },
                {
                    id: 'touch-interface',
                    title: 'Touch Interface',
                    icon: 'touch',
                    url: 'touch-interface.html',
                    description: 'Touch-friendly interface',
                    section: 'mobile',
                    order: 37,
                    enabled: true
                },
                {
                    id: 'mobile-forms',
                    title: 'Mobile Forms',
                    icon: 'edit-3',
                    url: 'mobile-forms.html',
                    description: 'Mobile-optimized forms',
                    section: 'mobile',
                    order: 38,
                    enabled: true
                },
                {
                    id: 'mobile-notifications',
                    title: 'Mobile Notifications',
                    icon: 'bell',
                    url: 'mobile-notifications.html',
                    description: 'Mobile push notifications',
                    section: 'mobile',
                    order: 39,
                    enabled: true
                },
                {
                    id: 'offline-capability',
                    title: 'Offline Capability',
                    icon: 'wifi-off',
                    url: 'offline-capability.html',
                    description: 'Offline functionality',
                    section: 'mobile',
                    order: 40,
                    enabled: true
                },
                {
                    id: 'mobile-analytics',
                    title: 'Mobile Analytics',
                    icon: 'bar-chart',
                    url: 'mobile-analytics.html',
                    description: 'Mobile usage analytics',
                    section: 'mobile',
                    order: 41,
                    enabled: true
                },
                // Integration Features
                {
                    id: 'api-integration',
                    title: 'API Integration',
                    icon: 'code',
                    url: 'api-integration.html',
                    description: 'API integration management',
                    section: 'integration',
                    order: 42,
                    enabled: true
                },
                {
                    id: 'webhook-support',
                    title: 'Webhook Support',
                    icon: 'webhook',
                    url: 'webhook-support.html',
                    description: 'Webhook configuration',
                    section: 'integration',
                    order: 43,
                    enabled: true
                },
                {
                    id: 'data-import-export',
                    title: 'Data Import/Export',
                    icon: 'database',
                    url: 'data-import-export.html',
                    description: 'Data import and export tools',
                    section: 'integration',
                    order: 44,
                    enabled: true
                },
                {
                    id: 'third-party-connectors',
                    title: 'Third-party Connectors',
                    icon: 'link',
                    url: 'third-party-connectors.html',
                    description: 'Third-party integrations',
                    section: 'integration',
                    order: 45,
                    enabled: true
                },
                {
                    id: 'sso-integration',
                    title: 'SSO Integration',
                    icon: 'key',
                    url: 'sso-integration.html',
                    description: 'Single Sign-On integration',
                    section: 'integration',
                    order: 46,
                    enabled: true
                },
                {
                    id: 'calendar-sync-integration',
                    title: 'Calendar Sync Integration',
                    icon: 'refresh-cw',
                    url: 'calendar-sync-integration.html',
                    description: 'Calendar synchronization',
                    section: 'integration',
                    order: 47,
                    enabled: true
                }
            ]
        },
        
        // Role-based navigation mapping
        roleNavigation: {
            'super_admin': ['super_admin', 'system_wide'],
            'factory_admin': ['factory_admin', 'system_wide'],
            'hr_staff': ['hr_staff', 'system_wide'],
            'grievance_committee': ['grievance_committee', 'system_wide'],
            'auditor': ['auditor', 'system_wide'],
            'worker': ['worker', 'system_wide']
        },

        // Page configurations for all navigation items
        pages: {
            // Super Admin Pages
            '/admin': {
                title: 'System Overview',
                subtitle: 'Multi-factory birds-eye view and system health',
                breadcrumbs: ['Dashboard', 'System Overview'],
                showQuickActions: true,
                showSystemStatus: true,
                permissions: ['super_admin']
            },
            'factory-management.html': {
                title: 'Factory Management',
                subtitle: 'Manage factory registrations and compliance',
                breadcrumbs: ['Dashboard', 'Factory Management'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'user-management.html': {
                title: 'User Management',
                subtitle: 'Manage user accounts and permissions',
                breadcrumbs: ['Dashboard', 'User Management'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'standards-registry.html': {
                title: 'Standards Registry',
                subtitle: 'Manage compliance standards and requirements',
                breadcrumbs: ['Dashboard', 'Standards Registry'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'analytics-dashboard.html': {
                title: 'Enterprise Analytics',
                subtitle: 'Multi-factory analytics and reporting',
                breadcrumbs: ['Dashboard', 'Enterprise Analytics'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'system-hardening-dashboard.html': {
                title: 'System Hardening',
                subtitle: 'Security testing and performance monitoring',
                breadcrumbs: ['Dashboard', 'System Hardening'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'billing-management.html': {
                title: 'Billing & Licensing',
                subtitle: 'Subscription and payment oversight',
                breadcrumbs: ['Dashboard', 'Billing & Licensing'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'settings.html': {
                title: 'System Settings',
                subtitle: 'Global system configuration',
                breadcrumbs: ['Dashboard', 'System Settings'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'diagnostics.html': {
                title: 'System Diagnostics',
                subtitle: 'System health and troubleshooting',
                breadcrumbs: ['Dashboard', 'System Diagnostics'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'multi-factory-dashboard.html': {
                title: 'Multi-Factory Dashboard',
                subtitle: 'Birds-eye view of all factories',
                breadcrumbs: ['Dashboard', 'Multi-Factory Dashboard'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'system-health-dashboard.html': {
                title: 'System Health Dashboard',
                subtitle: 'Performance and monitoring',
                breadcrumbs: ['Dashboard', 'System Health Dashboard'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'analytics-dashboard.html': {
                title: 'Analytics Dashboard',
                subtitle: 'Enterprise-wide analytics',
                breadcrumbs: ['Dashboard', 'Analytics Dashboard'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'user-profile-management.html': {
                title: 'User Profile Management',
                subtitle: 'Edit user profiles and settings',
                breadcrumbs: ['Dashboard', 'User Profile Management'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'access-control-panel.html': {
                title: 'Access Control Panel',
                subtitle: 'Manage permissions and access',
                breadcrumbs: ['Dashboard', 'Access Control Panel'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'factory-registration.html': {
                title: 'Factory Registration',
                subtitle: 'Add new factory details',
                breadcrumbs: ['Dashboard', 'Factory Registration'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'factory-settings-panel.html': {
                title: 'Factory Settings Panel',
                subtitle: 'Configure factory-specific settings',
                breadcrumbs: ['Dashboard', 'Factory Settings Panel'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'multi-factory-overview.html': {
                title: 'Multi-Factory Overview',
                subtitle: 'Compare factory performance',
                breadcrumbs: ['Dashboard', 'Multi-Factory Overview'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'standard-configuration.html': {
                title: 'Standard Configuration',
                subtitle: 'Add/edit compliance standards',
                breadcrumbs: ['Dashboard', 'Standard Configuration'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'requirement-management.html': {
                title: 'Requirement Management',
                subtitle: 'Define requirements and controls',
                breadcrumbs: ['Dashboard', 'Requirement Management'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'audit-checklist-generator.html': {
                title: 'Audit Checklist Generator',
                subtitle: 'Create program-specific checklists',
                breadcrumbs: ['Dashboard', 'Audit Checklist Generator'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'performance-monitoring.html': {
                title: 'Performance Monitoring',
                subtitle: 'System performance tracking',
                breadcrumbs: ['Dashboard', 'Performance Monitoring'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'usage-analytics.html': {
                title: 'Usage Analytics',
                subtitle: 'Feature usage and adoption metrics',
                breadcrumbs: ['Dashboard', 'Usage Analytics'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'export-management.html': {
                title: 'Export Management',
                subtitle: 'Generate enterprise reports',
                breadcrumbs: ['Dashboard', 'Export Management'],
                showQuickActions: true,
                permissions: ['super_admin']
            },

            // Factory Admin Pages
            'factory-dashboard.html': {
                title: 'Factory Dashboard',
                subtitle: 'Single factory status and overview',
                breadcrumbs: ['Dashboard', 'Factory Dashboard'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'factory-user-management.html': {
                title: 'Factory Users',
                subtitle: 'Manage factory users and roles',
                breadcrumbs: ['Dashboard', 'Factory Users'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'audit-preparation-dashboard.html': {
                title: 'Audit Preparation',
                subtitle: 'Multi-standard audit preparation',
                breadcrumbs: ['Dashboard', 'Audit Preparation'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin']
            },
            'cap.html': {
                title: 'CAP Management',
                subtitle: 'Corrective Action Plans oversight',
                breadcrumbs: ['Dashboard', 'CAP Management'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin']
            },
            'document-oversight.html': {
                title: 'Document Oversight',
                subtitle: 'Monitor document processing',
                breadcrumbs: ['Dashboard', 'Document Oversight'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'approval-dashboard.html': {
                title: 'Approvals',
                subtitle: 'Document and request approvals',
                breadcrumbs: ['Dashboard', 'Approvals'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin']
            },
            'grievance-oversight.html': {
                title: 'Grievance Oversight',
                subtitle: 'Monitor grievance processing',
                breadcrumbs: ['Dashboard', 'Grievance Oversight'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'factory-analytics.html': {
                title: 'Factory Analytics',
                subtitle: 'Factory-specific analytics and reports',
                breadcrumbs: ['Dashboard', 'Factory Analytics'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'tasks-dashboard.html': {
                title: 'Tasks & Calendar',
                subtitle: 'Task management and calendar',
                breadcrumbs: ['Dashboard', 'Tasks & Calendar'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff']
            },
            'factory-settings.html': {
                title: 'Factory Settings',
                subtitle: 'Factory-specific configuration',
                breadcrumbs: ['Dashboard', 'Factory Settings'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'factory-analytics-dashboard.html': {
                title: 'Factory Analytics Dashboard',
                subtitle: 'Factory-specific analytics',
                breadcrumbs: ['Dashboard', 'Factory Analytics Dashboard'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'compliance-dashboard.html': {
                title: 'Compliance Dashboard',
                subtitle: 'Factory compliance status',
                breadcrumbs: ['Dashboard', 'Compliance Dashboard'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'performance-dashboard.html': {
                title: 'Performance Dashboard',
                subtitle: 'Factory performance metrics',
                breadcrumbs: ['Dashboard', 'Performance Dashboard'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'user-invitation.html': {
                title: 'User Invitation',
                subtitle: 'Invite new users to factory',
                breadcrumbs: ['Dashboard', 'User Invitation'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'document-analytics.html': {
                title: 'Document Analytics',
                subtitle: 'Document processing metrics',
                breadcrumbs: ['Dashboard', 'Document Analytics'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'document-settings.html': {
                title: 'Document Settings',
                subtitle: 'Configure document workflows',
                breadcrumbs: ['Dashboard', 'Document Settings'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'cap-analytics.html': {
                title: 'CAP Analytics',
                subtitle: 'CAP performance metrics',
                breadcrumbs: ['Dashboard', 'CAP Analytics'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'cap-settings.html': {
                title: 'CAP Settings',
                subtitle: 'Configure CAP workflows',
                breadcrumbs: ['Dashboard', 'CAP Settings'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'factory-performance-analytics.html': {
                title: 'Factory Performance Analytics',
                subtitle: 'Factory-specific metrics',
                breadcrumbs: ['Dashboard', 'Factory Performance Analytics'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'compliance-analytics.html': {
                title: 'Compliance Analytics',
                subtitle: 'Compliance tracking and reporting',
                breadcrumbs: ['Dashboard', 'Compliance Analytics'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'risk-analytics.html': {
                title: 'Risk Analytics',
                subtitle: 'Risk assessment and monitoring',
                breadcrumbs: ['Dashboard', 'Risk Analytics'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },
            'export-functionality.html': {
                title: 'Export Functionality',
                subtitle: 'Generate factory reports',
                breadcrumbs: ['Dashboard', 'Export Functionality'],
                showQuickActions: true,
                permissions: ['factory_admin']
            },

            // HR Staff Pages
            'hr-dashboard.html': {
                title: 'HR Dashboard',
                subtitle: 'HR-specific overview and management',
                breadcrumbs: ['Dashboard', 'HR Dashboard'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'documents.html': {
                title: 'Document Management',
                subtitle: 'Upload and manage compliance documents',
                breadcrumbs: ['Dashboard', 'Document Management'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'training-meetings.html': {
                title: 'Training & Meetings',
                subtitle: 'Training matrix and meeting management',
                breadcrumbs: ['Dashboard', 'Training & Meetings'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'permits-certificates.html': {
                title: 'Permits & Certificates',
                subtitle: 'Permit registry and expiry tracking',
                breadcrumbs: ['Dashboard', 'Permits & Certificates'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'cap-execution.html': {
                title: 'CAP Execution',
                subtitle: 'Execute and monitor CAPs',
                breadcrumbs: ['Dashboard', 'CAP Execution'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'hr-analytics.html': {
                title: 'HR Analytics',
                subtitle: 'HR-specific analytics and reporting',
                breadcrumbs: ['Dashboard', 'HR Analytics'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'hr-tasks.html': {
                title: 'HR Tasks',
                subtitle: 'HR task management and calendar',
                breadcrumbs: ['Dashboard', 'HR Tasks'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'document-management-dashboard.html': {
                title: 'Document Management Dashboard',
                subtitle: 'Document processing overview',
                breadcrumbs: ['Dashboard', 'Document Management Dashboard'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'training-dashboard.html': {
                title: 'Training Dashboard',
                subtitle: 'Training management overview',
                breadcrumbs: ['Dashboard', 'Training Dashboard'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'permits-dashboard.html': {
                title: 'Permits Dashboard',
                subtitle: 'Permit and certificate tracking',
                breadcrumbs: ['Dashboard', 'Permits Dashboard'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'document-processing.html': {
                title: 'Document Processing',
                subtitle: 'AI-powered document analysis',
                breadcrumbs: ['Dashboard', 'Document Processing'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'document-version-control.html': {
                title: 'Document Version Control',
                subtitle: 'Manage document versions',
                breadcrumbs: ['Dashboard', 'Document Version Control'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'document-approval-workflow.html': {
                title: 'Document Approval Workflow',
                subtitle: 'Document approval process',
                breadcrumbs: ['Dashboard', 'Document Approval Workflow'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'document-categories.html': {
                title: 'Document Categories',
                subtitle: 'Organize documents by type',
                breadcrumbs: ['Dashboard', 'Document Categories'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'document-search-filter.html': {
                title: 'Document Search & Filter',
                subtitle: 'Find and filter documents',
                breadcrumbs: ['Dashboard', 'Document Search & Filter'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'training-matrix-management.html': {
                title: 'Training Matrix Management',
                subtitle: 'Manage training requirements',
                breadcrumbs: ['Dashboard', 'Training Matrix Management'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'meeting-agenda-generator.html': {
                title: 'Meeting Agenda Generator',
                subtitle: 'AI-powered agenda creation',
                breadcrumbs: ['Dashboard', 'Meeting Agenda Generator'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'attendance-tracking.html': {
                title: 'Attendance Tracking',
                subtitle: 'Track meeting and training attendance',
                breadcrumbs: ['Dashboard', 'Attendance Tracking'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'certificate-management.html': {
                title: 'Certificate Management',
                subtitle: 'Issue and manage certificates',
                breadcrumbs: ['Dashboard', 'Certificate Management'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'training-calendar.html': {
                title: 'Training Calendar',
                subtitle: 'Schedule and manage training sessions',
                breadcrumbs: ['Dashboard', 'Training Calendar'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'quiz-assessment.html': {
                title: 'Quiz & Assessment',
                subtitle: 'Create and manage assessments',
                breadcrumbs: ['Dashboard', 'Quiz & Assessment'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'permit-categories.html': {
                title: 'Permit Categories',
                subtitle: 'Organize permits by type',
                breadcrumbs: ['Dashboard', 'Permit Categories'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'evidence-capture.html': {
                title: 'Evidence Capture',
                subtitle: 'Upload renewal evidence',
                breadcrumbs: ['Dashboard', 'Evidence Capture'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },
            'permit-analytics.html': {
                title: 'Permit Analytics',
                subtitle: 'Track permit status and trends',
                breadcrumbs: ['Dashboard', 'Permit Analytics'],
                showQuickActions: true,
                permissions: ['hr_staff']
            },

            // Grievance Committee Pages
            'committee-dashboard.html': {
                title: 'Committee Dashboard',
                subtitle: 'Committee overview and performance',
                breadcrumbs: ['Dashboard', 'Committee Dashboard'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'case-management.html': {
                title: 'Case Management',
                subtitle: 'Grievance case intake and processing',
                breadcrumbs: ['Dashboard', 'Case Management'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'case-intake.html': {
                title: 'Case Intake',
                subtitle: 'Receive and triage grievances',
                breadcrumbs: ['Dashboard', 'Case Intake'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'investigations.html': {
                title: 'Investigations',
                subtitle: 'Manage investigation process',
                breadcrumbs: ['Dashboard', 'Investigations'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'case-resolution.html': {
                title: 'Case Resolution',
                subtitle: 'Document resolutions and closures',
                breadcrumbs: ['Dashboard', 'Case Resolution'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'committee-analytics.html': {
                title: 'Committee Analytics',
                subtitle: 'Committee performance and SLA metrics',
                breadcrumbs: ['Dashboard', 'Committee Analytics'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'committee-reports.html': {
                title: 'Committee Reports',
                subtitle: 'Generate committee reports',
                breadcrumbs: ['Dashboard', 'Committee Reports'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'case-management-dashboard.html': {
                title: 'Case Management Dashboard',
                subtitle: 'Case processing overview',
                breadcrumbs: ['Dashboard', 'Case Management Dashboard'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'investigation-dashboard.html': {
                title: 'Investigation Dashboard',
                subtitle: 'Investigation management',
                breadcrumbs: ['Dashboard', 'Investigation Dashboard'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'case-triage.html': {
                title: 'Case Triage',
                subtitle: 'Assess and categorize cases',
                breadcrumbs: ['Dashboard', 'Case Triage'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'case-assignment.html': {
                title: 'Case Assignment',
                subtitle: 'Assign cases to investigators',
                breadcrumbs: ['Dashboard', 'Case Assignment'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'case-tracking.html': {
                title: 'Case Tracking',
                subtitle: 'Monitor case progress',
                breadcrumbs: ['Dashboard', 'Case Tracking'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'case-closure.html': {
                title: 'Case Closure',
                subtitle: 'Close completed cases',
                breadcrumbs: ['Dashboard', 'Case Closure'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'investigation-workflow.html': {
                title: 'Investigation Workflow',
                subtitle: 'Manage investigation process',
                breadcrumbs: ['Dashboard', 'Investigation Workflow'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'evidence-collection.html': {
                title: 'Evidence Collection',
                subtitle: 'Collect and organize evidence',
                breadcrumbs: ['Dashboard', 'Evidence Collection'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'interview-management.html': {
                title: 'Interview Management',
                subtitle: 'Schedule and conduct interviews',
                breadcrumbs: ['Dashboard', 'Interview Management'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'investigation-reports.html': {
                title: 'Investigation Reports',
                subtitle: 'Generate investigation reports',
                breadcrumbs: ['Dashboard', 'Investigation Reports'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'case-notes.html': {
                title: 'Case Notes',
                subtitle: 'Document investigation findings',
                breadcrumbs: ['Dashboard', 'Case Notes'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'confidentiality-management.html': {
                title: 'Confidentiality Management',
                subtitle: 'Maintain case confidentiality',
                breadcrumbs: ['Dashboard', 'Confidentiality Management'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'sla-management.html': {
                title: 'SLA Management',
                subtitle: 'Monitor service level agreements',
                breadcrumbs: ['Dashboard', 'SLA Management'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'case-statistics.html': {
                title: 'Case Statistics',
                subtitle: 'Case processing statistics',
                breadcrumbs: ['Dashboard', 'Case Statistics'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'trend-analysis.html': {
                title: 'Trend Analysis',
                subtitle: 'Identify grievance trends',
                breadcrumbs: ['Dashboard', 'Trend Analysis'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },
            'performance-metrics.html': {
                title: 'Performance Metrics',
                subtitle: 'Track committee performance',
                breadcrumbs: ['Dashboard', 'Performance Metrics'],
                showQuickActions: true,
                permissions: ['grievance_committee']
            },

            // Auditor Pages
            'auditor-dashboard.html': {
                title: 'Auditor Dashboard',
                subtitle: 'Read-only compliance overview',
                breadcrumbs: ['Dashboard', 'Auditor Dashboard'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'auditor-audit-prep.html': {
                title: 'Audit Preparation',
                subtitle: 'Prepare for audits and reviews',
                breadcrumbs: ['Dashboard', 'Audit Preparation'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'evidence-review.html': {
                title: 'Evidence Review',
                subtitle: 'Review compliance evidence',
                breadcrumbs: ['Dashboard', 'Evidence Review'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'cap-review.html': {
                title: 'CAP Review',
                subtitle: 'Review Corrective Action Plans',
                breadcrumbs: ['Dashboard', 'CAP Review'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'audit-reporting.html': {
                title: 'Audit Reporting',
                subtitle: 'Generate audit reports',
                breadcrumbs: ['Dashboard', 'Audit Reporting'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'auditor-analytics.html': {
                title: 'Auditor Analytics',
                subtitle: 'Audit performance analytics',
                breadcrumbs: ['Dashboard', 'Auditor Analytics'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'audit-preparation-dashboard.html': {
                title: 'Audit Preparation Dashboard',
                subtitle: 'Audit readiness overview',
                breadcrumbs: ['Dashboard', 'Audit Preparation Dashboard'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'evidence-review-dashboard.html': {
                title: 'Evidence Review Dashboard',
                subtitle: 'Evidence management overview',
                breadcrumbs: ['Dashboard', 'Evidence Review Dashboard'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'audit-reporting-dashboard.html': {
                title: 'Audit Reporting Dashboard',
                subtitle: 'Audit reporting overview',
                breadcrumbs: ['Dashboard', 'Audit Reporting Dashboard'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'audit-checklist-generator.html': {
                title: 'Audit Checklist Generator',
                subtitle: 'Generate audit checklists',
                breadcrumbs: ['Dashboard', 'Audit Checklist Generator'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'evidence-binder-creation.html': {
                title: 'Evidence Binder Creation',
                subtitle: 'Create evidence binders',
                breadcrumbs: ['Dashboard', 'Evidence Binder Creation'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'compliance-documentation-review.html': {
                title: 'Compliance Documentation Review',
                subtitle: 'Review compliance docs',
                breadcrumbs: ['Dashboard', 'Compliance Documentation Review'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'audit-planning.html': {
                title: 'Audit Planning',
                subtitle: 'Plan audit activities',
                breadcrumbs: ['Dashboard', 'Audit Planning'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'pre-audit-assessment.html': {
                title: 'Pre-Audit Assessment',
                subtitle: 'Assess audit readiness',
                breadcrumbs: ['Dashboard', 'Pre-Audit Assessment'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'audit-calendar.html': {
                title: 'Audit Calendar',
                subtitle: 'Schedule audit activities',
                breadcrumbs: ['Dashboard', 'Audit Calendar'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'evidence-collection.html': {
                title: 'Evidence Collection',
                subtitle: 'Collect audit evidence',
                breadcrumbs: ['Dashboard', 'Evidence Collection'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'evidence-organization.html': {
                title: 'Evidence Organization',
                subtitle: 'Organize evidence by standard',
                breadcrumbs: ['Dashboard', 'Evidence Organization'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'evidence-linking.html': {
                title: 'Evidence Linking',
                subtitle: 'Link evidence to requirements',
                breadcrumbs: ['Dashboard', 'Evidence Linking'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'evidence-export.html': {
                title: 'Evidence Export',
                subtitle: 'Export evidence for reports',
                breadcrumbs: ['Dashboard', 'Evidence Export'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'evidence-analytics.html': {
                title: 'Evidence Analytics',
                subtitle: 'Track evidence completeness',
                breadcrumbs: ['Dashboard', 'Evidence Analytics'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'finding-documentation.html': {
                title: 'Finding Documentation',
                subtitle: 'Document audit findings',
                breadcrumbs: ['Dashboard', 'Finding Documentation'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'recommendation-tracking.html': {
                title: 'Recommendation Tracking',
                subtitle: 'Track recommendations',
                breadcrumbs: ['Dashboard', 'Recommendation Tracking'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'report-export.html': {
                title: 'Report Export',
                subtitle: 'Export audit reports',
                breadcrumbs: ['Dashboard', 'Report Export'],
                showQuickActions: true,
                permissions: ['auditor']
            },
            'follow-up-tracking.html': {
                title: 'Follow-up Tracking',
                subtitle: 'Track recommendation follow-up',
                breadcrumbs: ['Dashboard', 'Follow-up Tracking'],
                showQuickActions: true,
                permissions: ['auditor']
            },

            // Worker Pages
            'worker-portal.html': {
                title: 'Worker Portal',
                subtitle: 'Anonymous grievance submission',
                breadcrumbs: ['Worker Portal'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'case-tracking.html': {
                title: 'Case Tracking',
                subtitle: 'Track submitted grievances',
                breadcrumbs: ['Worker Portal', 'Case Tracking'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'worker-communication.html': {
                title: 'Communication',
                subtitle: 'Communicate with committee',
                breadcrumbs: ['Worker Portal', 'Communication'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'case-tracking-portal.html': {
                title: 'Case Tracking Portal',
                subtitle: 'Track submitted cases',
                breadcrumbs: ['Worker Portal', 'Case Tracking Portal'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'worker-dashboard.html': {
                title: 'Worker Dashboard',
                subtitle: 'Worker-specific overview',
                breadcrumbs: ['Worker Portal', 'Worker Dashboard'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'grievance-submission-form.html': {
                title: 'Grievance Submission',
                subtitle: 'Submit grievances anonymously',
                breadcrumbs: ['Worker Portal', 'Grievance Submission'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'case-status-tracking.html': {
                title: 'Case Status Tracking',
                subtitle: 'Track case progress',
                breadcrumbs: ['Worker Portal', 'Case Status Tracking'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'communication-portal.html': {
                title: 'Communication Portal',
                subtitle: 'Communicate with committee',
                breadcrumbs: ['Worker Portal', 'Communication Portal'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'confidentiality-assurance.html': {
                title: 'Confidentiality Assurance',
                subtitle: 'Maintain anonymity',
                breadcrumbs: ['Worker Portal', 'Confidentiality Assurance'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'submission-confirmation.html': {
                title: 'Submission Confirmation',
                subtitle: 'Confirm grievance submission',
                breadcrumbs: ['Worker Portal', 'Submission Confirmation'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'case-updates.html': {
                title: 'Case Updates',
                subtitle: 'Receive case updates',
                breadcrumbs: ['Worker Portal', 'Case Updates'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'qr-code-access.html': {
                title: 'QR Code Access',
                subtitle: 'Access via QR codes',
                breadcrumbs: ['Worker Portal', 'QR Code Access'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'mobile-interface.html': {
                title: 'Mobile Interface',
                subtitle: 'Mobile-friendly interface',
                breadcrumbs: ['Worker Portal', 'Mobile Interface'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'kiosk-interface.html': {
                title: 'Kiosk Interface',
                subtitle: 'Factory kiosk access',
                breadcrumbs: ['Worker Portal', 'Kiosk Interface'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'whatsapp-integration.html': {
                title: 'WhatsApp Integration',
                subtitle: 'Submit via WhatsApp',
                breadcrumbs: ['Worker Portal', 'WhatsApp Integration'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'hotline-integration.html': {
                title: 'Hotline Integration',
                subtitle: 'Phone-based submission',
                breadcrumbs: ['Worker Portal', 'Hotline Integration'],
                showQuickActions: false,
                permissions: ['worker']
            },
            'in-person-entry.html': {
                title: 'In-Person Entry',
                subtitle: 'Direct submission',
                breadcrumbs: ['Worker Portal', 'In-Person Entry'],
                showQuickActions: false,
                permissions: ['worker']
            },

            // System-wide Pages
            'ai-copilot.html': {
                title: 'AI Copilot',
                subtitle: 'AI-powered assistance and automation',
                breadcrumbs: ['Tools', 'AI Copilot'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'notifications.html': {
                title: 'Notifications',
                subtitle: 'System notifications and alerts',
                breadcrumbs: ['Tools', 'Notifications'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'profile.html': {
                title: 'Profile',
                subtitle: 'User profile and preferences',
                breadcrumbs: ['Tools', 'Profile'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            'help-support.html': {
                title: 'Help & Support',
                subtitle: 'Help documentation and support',
                breadcrumbs: ['Tools', 'Help & Support'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            // AI Copilot System Pages
            'ai-assistant-interface.html': {
                title: 'AI Assistant Interface',
                subtitle: 'Interactive AI assistant interface',
                breadcrumbs: ['AI Tools', 'AI Assistant Interface'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'document-analysis.html': {
                title: 'Document Analysis',
                subtitle: 'AI-powered document analysis',
                breadcrumbs: ['AI Tools', 'Document Analysis'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'cap-generation.html': {
                title: 'CAP Generation',
                subtitle: 'AI-powered CAP generation',
                breadcrumbs: ['AI Tools', 'CAP Generation'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'risk-assessment.html': {
                title: 'Risk Assessment',
                subtitle: 'AI-powered risk assessment',
                breadcrumbs: ['AI Tools', 'Risk Assessment'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'agenda-generation.html': {
                title: 'Agenda Generation',
                subtitle: 'AI-powered agenda generation',
                breadcrumbs: ['AI Tools', 'Agenda Generation'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'standard-query.html': {
                title: 'Standard Query',
                subtitle: 'Query compliance standards',
                breadcrumbs: ['AI Tools', 'Standard Query'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            // Analytics & Exports Pages
            'risk-heatmap.html': {
                title: 'Risk Heatmap',
                subtitle: 'Visual risk assessment heatmap',
                breadcrumbs: ['Analytics', 'Risk Heatmap'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'kpi-dashboard.html': {
                title: 'KPI Dashboard',
                subtitle: 'Key Performance Indicators',
                breadcrumbs: ['Analytics', 'KPI Dashboard'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'compliance-analytics.html': {
                title: 'Compliance Analytics',
                subtitle: 'Compliance tracking and reporting',
                breadcrumbs: ['Analytics', 'Compliance Analytics'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'export-management.html': {
                title: 'Export Management',
                subtitle: 'Generate and manage exports',
                breadcrumbs: ['Analytics', 'Export Management'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'data-visualization.html': {
                title: 'Data Visualization',
                subtitle: 'Interactive data visualization',
                breadcrumbs: ['Analytics', 'Data Visualization'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'trend-analysis.html': {
                title: 'Trend Analysis',
                subtitle: 'Analyze trends and patterns',
                breadcrumbs: ['Analytics', 'Trend Analysis'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            // Tasks & Calendar Pages
            'task-management.html': {
                title: 'Task Management',
                subtitle: 'Manage tasks and assignments',
                breadcrumbs: ['Tasks', 'Task Management'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'calendar-integration.html': {
                title: 'Calendar Integration',
                subtitle: 'Calendar and event management',
                breadcrumbs: ['Tasks', 'Calendar Integration'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'notification-system.html': {
                title: 'Notification System',
                subtitle: 'System-wide notifications',
                breadcrumbs: ['Tasks', 'Notification System'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'task-assignment.html': {
                title: 'Task Assignment',
                subtitle: 'Assign tasks to users',
                breadcrumbs: ['Tasks', 'Task Assignment'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'task-tracking.html': {
                title: 'Task Tracking',
                subtitle: 'Track task progress',
                breadcrumbs: ['Tasks', 'Task Tracking'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            'calendar-sync.html': {
                title: 'Calendar Sync',
                subtitle: 'Synchronize calendars',
                breadcrumbs: ['Tasks', 'Calendar Sync'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor']
            },
            // Security & Access Pages
            'authentication-system.html': {
                title: 'Authentication System',
                subtitle: 'User authentication and security',
                breadcrumbs: ['Security', 'Authentication System'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'role-based-access-control.html': {
                title: 'Role-Based Access Control',
                subtitle: 'Manage user roles and permissions',
                breadcrumbs: ['Security', 'Role-Based Access Control'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'audit-logging.html': {
                title: 'Audit Logging',
                subtitle: 'System audit logs',
                breadcrumbs: ['Security', 'Audit Logging'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'data-encryption.html': {
                title: 'Data Encryption',
                subtitle: 'Data security and encryption',
                breadcrumbs: ['Security', 'Data Encryption'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'session-management.html': {
                title: 'Session Management',
                subtitle: 'User session management',
                breadcrumbs: ['Security', 'Session Management'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'security-monitoring.html': {
                title: 'Security Monitoring',
                subtitle: 'Security monitoring and alerts',
                breadcrumbs: ['Security', 'Security Monitoring'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            // Internationalization Pages
            'language-switching.html': {
                title: 'Language Switching',
                subtitle: 'Switch between languages',
                breadcrumbs: ['Internationalization', 'Language Switching'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            'bilingual-interface.html': {
                title: 'Bilingual Interface',
                subtitle: 'Bilingual user interface',
                breadcrumbs: ['Internationalization', 'Bilingual Interface'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            'cultural-adaptation.html': {
                title: 'Cultural Adaptation',
                subtitle: 'Cultural sensitivity features',
                breadcrumbs: ['Internationalization', 'Cultural Adaptation'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            'translation-features.html': {
                title: 'Translation Features',
                subtitle: 'Content translation tools',
                breadcrumbs: ['Internationalization', 'Translation Features'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            'localized-content.html': {
                title: 'Localized Content',
                subtitle: 'Localized content management',
                breadcrumbs: ['Internationalization', 'Localized Content'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            'cultural-sensitivity.html': {
                title: 'Cultural Sensitivity',
                subtitle: 'Cultural sensitivity settings',
                breadcrumbs: ['Internationalization', 'Cultural Sensitivity'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            // Mobile & Responsive Features Pages
            'mobile-dashboard.html': {
                title: 'Mobile Dashboard',
                subtitle: 'Mobile-optimized dashboard',
                breadcrumbs: ['Mobile', 'Mobile Dashboard'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            'touch-interface.html': {
                title: 'Touch Interface',
                subtitle: 'Touch-friendly interface',
                breadcrumbs: ['Mobile', 'Touch Interface'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            'mobile-forms.html': {
                title: 'Mobile Forms',
                subtitle: 'Mobile-optimized forms',
                breadcrumbs: ['Mobile', 'Mobile Forms'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            'mobile-notifications.html': {
                title: 'Mobile Notifications',
                subtitle: 'Mobile push notifications',
                breadcrumbs: ['Mobile', 'Mobile Notifications'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            'offline-capability.html': {
                title: 'Offline Capability',
                subtitle: 'Offline functionality',
                breadcrumbs: ['Mobile', 'Offline Capability'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            'mobile-analytics.html': {
                title: 'Mobile Analytics',
                subtitle: 'Mobile usage analytics',
                breadcrumbs: ['Mobile', 'Mobile Analytics'],
                showQuickActions: false,
                permissions: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'worker']
            },
            // Integration Features Pages
            'api-integration.html': {
                title: 'API Integration',
                subtitle: 'API integration management',
                breadcrumbs: ['Integration', 'API Integration'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'webhook-support.html': {
                title: 'Webhook Support',
                subtitle: 'Webhook configuration',
                breadcrumbs: ['Integration', 'Webhook Support'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'data-import-export.html': {
                title: 'Data Import/Export',
                subtitle: 'Data import and export tools',
                breadcrumbs: ['Integration', 'Data Import/Export'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin']
            },
            'third-party-connectors.html': {
                title: 'Third-party Connectors',
                subtitle: 'Third-party integrations',
                breadcrumbs: ['Integration', 'Third-party Connectors'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'sso-integration.html': {
                title: 'SSO Integration',
                subtitle: 'Single Sign-On integration',
                breadcrumbs: ['Integration', 'SSO Integration'],
                showQuickActions: true,
                permissions: ['super_admin']
            },
            'calendar-sync-integration.html': {
                title: 'Calendar Sync Integration',
                subtitle: 'Calendar synchronization',
                breadcrumbs: ['Integration', 'Calendar Sync Integration'],
                showQuickActions: true,
                permissions: ['super_admin', 'factory_admin', 'hr_staff']
            }
        },
        
        theme: {
            primary: {
                color: '#2563eb',
                hover: '#1d4ed8',
                light: '#dbeafe'
            },
            neutral: {
                50: '#f8fafc',
                100: '#f1f5f9',
                200: '#e2e8f0',
                300: '#cbd5e1',
                400: '#94a3b8',
                500: '#64748b',
                600: '#475569',
                700: '#334155',
                800: '#1e293b',
                900: '#0f172a'
            },
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        },
        
        notifications: {
            enabled: true,
            position: 'top-right',
            autoHide: 5000,
            maxVisible: 5
        },
        
        mobile: {
            breakpoint: 768,
            sidebarCollapsed: true,
            overlayEnabled: true
        },
        
        methods: {
            // Get navigation for specific role
            getNavigationForRole: function(role) {
                const roleSections = this.roleNavigation[role] || [];
                let allNavigation = [];
                
                roleSections.forEach(section => {
                    const sectionNav = this.navigation[section] || [];
                    allNavigation = allNavigation.concat(sectionNav);
                });
                
                return allNavigation
                    .filter(item => item.enabled)
                    .sort((a, b) => a.order - b.order);
            },
            
            // Get navigation by section for role
            getNavigationBySection: function(role) {
                const roleSections = this.roleNavigation[role] || [];
                const sections = {};
                
                roleSections.forEach(sectionName => {
                    const sectionNav = this.navigation[sectionName] || [];
                    sections[sectionName] = sectionNav
                        .filter(item => item.enabled)
                        .sort((a, b) => a.order - b.order);
                });
                
                return sections;
            },
            
            // Check if user has permission for navigation item
            hasPermission: function(userRole, navigationId) {
                const roleSections = this.roleNavigation[userRole] || [];
                
                for (const section of roleSections) {
                    const item = this.navigation[section]?.find(nav => nav.id === navigationId);
                    if (item && item.enabled) {
                        return true;
                    }
                }
                
                return false;
            },
            
            // Get page configuration
            getPageConfig: function(pageUrl) {
                if (!this.pages) {
                    console.log(`⚠️ Navigation pages not loaded yet for: ${pageUrl}`);
                    return null;
                }
                
                if (!this.pages[pageUrl]) {
                    console.log(`⚠️ Page config not found for: ${pageUrl}`);
                    console.log(`📋 Available pages:`, Object.keys(this.pages));
                    return null;
                }
                
                return this.pages[pageUrl];
            },
            
            // Get available roles
            getAvailableRoles: function() {
                return Object.keys(this.roleNavigation);
            },
            
            // Get role display name
            getRoleDisplayName: function(role) {
                const roleNames = {
                    'super_admin': 'Super Admin',
                    'factory_admin': 'Factory Admin',
                    'hr_staff': 'HR Staff',
                    'grievance_committee': 'Grievance Committee',
                    'auditor': 'Auditor',
                    'worker': 'Worker'
                };
                return roleNames[role] || role;
            },
            
            // Get role description
            getRoleDescription: function(role) {
                const roleDescriptions = {
                    'super_admin': 'Global system administration and multi-factory oversight',
                    'factory_admin': 'Factory-level administration and compliance management',
                    'hr_staff': 'Document management, training, and HR operations',
                    'grievance_committee': 'Grievance case management and investigation',
                    'auditor': 'Read-only compliance review and audit preparation',
                    'worker': 'Anonymous grievance submission and case tracking'
                };
                return roleDescriptions[role] || '';
            },
            
            // Update navigation item
            updateNavigationItem: function(section, id, updates) {
                if (this.navigation[section]) {
                    const item = this.navigation[section].find(nav => nav.id === id);
                if (item) {
                    Object.assign(item, updates);
                    }
                }
            },
            
            // Add custom navigation item
            addCustomNavigationItem: function(section, item) {
                if (!this.navigation[section]) {
                    this.navigation[section] = [];
                }
                this.navigation[section].push(item);
                this.navigation[section].sort((a, b) => a.order - b.order);
            },
            
            // Remove navigation item
            removeNavigationItem: function(section, id) {
                if (this.navigation[section]) {
                    this.navigation[section] = this.navigation[section].filter(nav => nav.id !== id);
                }
            },
            
            // Toggle navigation item
            toggleNavigationItem: function(section, id) {
                if (this.navigation[section]) {
                    const item = this.navigation[section].find(nav => nav.id === id);
                if (item) {
                    item.enabled = !item.enabled;
                    }
                }
            },
            
            // Get enabled navigation for role
            getEnabledNavigation: function(role) {
                return this.getNavigationForRole(role).filter(item => item.enabled);
            },
            
            // Check if navigation is loaded
            isLoaded: function() {
                return !!(this.pages && this.navigation && this.roleNavigation);
            },
            
            // Validate navigation configuration
            validate: function() {
                const errors = [];
                
                // Check for duplicate IDs across all sections
                const allIds = [];
                Object.keys(this.navigation).forEach(section => {
                    this.navigation[section].forEach(item => {
                        allIds.push(item.id);
                    });
                });
                
                const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
                if (duplicateIds.length > 0) {
                    errors.push(`Duplicate navigation IDs found: ${duplicateIds.join(', ')}`);
                }
                
                // Check for missing required fields
                Object.keys(this.navigation).forEach(section => {
                    this.navigation[section].forEach(item => {
                        if (!item.id || !item.title || (!item.url && !item.action)) {
                        errors.push(`Navigation item missing required fields: ${item.id || 'unknown'}`);
                    }
                    });
                });
                
                return errors;
            }
        }
    };
    
    // Make it globally accessible
    window.NavigationConfig = NavigationConfig;
    
    // Mark as loaded
    window.NavigationConfigLoaded = true;
    
    console.log('✅ NavigationConfig v2 loaded successfully');
} else {
    console.log('ℹ️ NavigationConfig already loaded, skipping duplicate');
}
