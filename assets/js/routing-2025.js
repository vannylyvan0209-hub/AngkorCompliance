/**
 * Angkor Compliance Platform - Routing System 2025
 * Handles navigation between pages in the organized structure
 */

class AngkorRouter {
    constructor() {
        this.routes = {
            // Authentication routes
            '/login': '/pages/auth/login.html',
            '/register': '/pages/auth/register.html',
            '/profile': '/pages/auth/profile.html',
            '/mfa-setup': '/pages/auth/mfa-setup.html',
            
            // Worker portal routes
            '/worker': '/pages/worker-portal/worker-dashboard.html',
            '/worker/app': '/pages/worker-portal/worker-app.html',
            '/worker/grievance': '/pages/worker-portal/grievance-form.html',
            '/worker/tracking': '/pages/worker-portal/case-tracking-portal.html',
            '/worker/mobile': '/pages/worker-portal/mobile-interface.html',
            '/worker/kiosk': '/pages/worker-portal/kiosk-interface.html',
            '/worker/qr': '/pages/worker-portal/qr-code-access.html',
            '/worker/whatsapp': '/pages/worker-portal/whatsapp-integration.html',
            
            // Factory admin routes
            '/factory': '/pages/factory-admin/factory-dashboard.html',
            '/factory/management': '/pages/factory-admin/factory-management.html',
            '/factory/settings': '/pages/factory-admin/factory-admin-settings.html',
            '/factory/users': '/pages/factory-admin/factory-user-management.html',
            '/factory/workers': '/pages/factory-admin/factory-worker-portal.html',
            '/factory/permissions': '/pages/factory-admin/permission-management-dashboard.html',
            '/factory/roles': '/pages/factory-admin/role-assignment-panel.html',
            '/factory/training': '/pages/factory-admin/training-management-dashboard.html',
            '/factory/documents': '/pages/factory-admin/document-oversight-dashboard.html',
            '/factory/compliance': '/pages/factory-admin/compliance-monitoring-dashboard.html',
            '/factory/audit': '/pages/factory-admin/audit-management-dashboard.html',
            '/factory/invite': '/pages/factory-admin/user-invitation-modal.html',
            
            // Auditor routes
            '/auditor': '/pages/auditor/auditor-dashboard.html',
            '/auditor/settings': '/pages/auditor/auditor-settings.html',
            '/auditor/planning': '/pages/auditor/audit-planning.html',
            '/auditor/checklist': '/pages/auditor/audit-checklist-generator.html',
            '/auditor/report': '/pages/auditor/audit-report-generation.html',
            '/auditor/evidence': '/pages/auditor/evidence-collection.html',
            '/auditor/evidence/review': '/pages/auditor/evidence-review.html',
            '/auditor/evidence/organization': '/pages/auditor/evidence-organization.html',
            '/auditor/evidence/linking': '/pages/auditor/evidence-linking.html',
            '/auditor/evidence/export': '/pages/auditor/evidence-export.html',
            '/auditor/evidence/binder': '/pages/auditor/evidence-binder-creation.html',
            '/auditor/compliance': '/pages/auditor/compliance-documentation-review.html',
            '/auditor/findings': '/pages/auditor/finding-documentation.html',
            
            // Super admin routes
            '/admin': '/pages/super-admin/super-admin-dashboard.html',
            '/admin/users': '/pages/super-admin/user-management.html',
            '/admin/factories': '/pages/super-admin/factory-management.html',
            '/admin/standards': '/pages/super-admin/standards-management.html',
            '/admin/requirements': '/pages/super-admin/requirement-management.html',
            '/admin/security': '/pages/super-admin/security-settings.html',
            '/admin/backup': '/pages/super-admin/backup-recovery.html',
            '/admin/audit-log': '/pages/super-admin/audit-logging.html',
            '/admin/diagnostics': '/pages/super-admin/system-diagnostics.html',
            '/admin/settings': '/pages/super-admin/system-settings.html',
            '/admin/billing': '/pages/super-admin/billing-management.html',
            '/admin/hardening': '/pages/super-admin/system-hardening.html',
            '/admin/analytics': '/pages/super-admin/enterprise-analytics.html',
            '/admin/checklist': '/pages/super-admin/audit-checklist-generator.html',
            '/admin/ai': '/pages/super-admin/ai-copilot.html',
            '/admin/registration': '/pages/super-admin/factory-registration.html',
            '/admin/overview': '/pages/super-admin/multi-factory-overview.html',
            '/admin/configuration': '/pages/super-admin/standard-configuration.html',
            '/admin/notifications': '/pages/super-admin/notification-system.html',
            '/admin/integration': '/pages/super-admin/system-integration.html',
            '/admin/profile': '/pages/super-admin/profile-management.html',
            '/admin/language': '/pages/super-admin/language-localization.html',
            '/admin/help': '/pages/super-admin/help-support.html',
            '/admin/panel': '/pages/super-admin/factory-settings-panel.html',
            '/admin/disaster': '/pages/super-admin/disaster-recovery.html',
            '/admin/performance': '/pages/super-admin/performance-optimization.html',
            
            // HR routes
            '/hr': '/pages/hr/hr-dashboard.html',
            '/hr/workers': '/pages/hr-staff/hr-worker-management.html',
            '/hr/settings': '/pages/hr-staff/hr-staff-settings.html',
            
            // Grievance committee routes
            '/grievance': '/pages/grievance-committee/case-management-dashboard.html',
            '/grievance/management': '/pages/grievance-committee/case-management.html',
            '/grievance/intake': '/pages/grievance-committee/case-intake-screen.html',
            '/grievance/assignment': '/pages/grievance-committee/case-assignment-panel.html',
            '/grievance/triage': '/pages/grievance-committee/case-triage-modal.html',
            '/grievance/tracking': '/pages/grievance-committee/case-tracking.html',
            '/grievance/notes': '/pages/grievance-committee/case-notes.html',
            '/grievance/analytics': '/pages/grievance-committee/committee-analytics.html',
            '/grievance/evidence': '/pages/grievance-committee/evidence-collection.html',
            '/grievance/investigation': '/pages/grievance-committee/investigation-workflow.html',
            '/grievance/sla': '/pages/grievance-committee/sla-management.html',
            
            // Case management routes
            '/cases': '/pages/case-management/case-management.html',
            '/cases/intake': '/pages/case-management/case-intake-screen.html',
            '/cases/assignment': '/pages/case-management/case-assignment-system.html',
            '/cases/panel': '/pages/case-management/case-assignment-panel.html',
            '/cases/triage': '/pages/case-management/case-triage-modal.html',
            
            // Analytics routes
            '/analytics': '/pages/analytics/analytics-dashboard.html',
            '/analytics/cap': '/pages/analytics/cap-analytics.html',
            
            // Training and meetings routes
            '/training': '/pages/training-meetings/training-matrix.html',
            '/training/tasks': '/pages/training-meetings/task-orchestration.html',
            '/training/calendar': '/pages/training-meetings/calendar-sync.html',
            '/training/agenda': '/pages/training-meetings/agenda-generator.html',
            
            // Documentation routes
            '/docs': '/pages/documentation/documentation-management.html',
            
            // Go-live routes
            '/go-live': '/pages/go-live/go-live-preparation.html',
            '/go-live/enterprise': '/pages/enterprise-go-live/enterprise-go-live-dashboard.html',
            '/go-live/production': '/pages/production-go-live/production-go-live-execution.html',
            
            // System routes
            '/disaster': '/pages/disaster-recovery/disaster-recovery-dashboard.html',
            '/security': '/pages/security/security-penetration-testing.html',
            '/performance': '/pages/performance/performance-optimization.html',
            
            // Special pages
            '/cap': '/cap.html',
            '/cap/new': '/new-cap.html',
            '/cap/detail': '/cap-detail.html',
            '/approval': '/approval-dashboard.html',
            '/style-guide': '/style-guide-2025.html',
            '/components': '/component-library-2025.html',
            '/design-system': '/design-system-showcase-2025.html',
            '/documentation': '/documentation-site-2025.html'
        };
        
        this.init();
    }
    
    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            this.handleRoute(event.state?.path || window.location.pathname);
        });
        
        // Handle initial page load
        this.handleRoute(window.location.pathname);
        
        // Intercept all internal links
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            if (link && this.isInternalLink(link.href)) {
                event.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    }
    
    isInternalLink(href) {
        try {
            const url = new URL(href, window.location.origin);
            return url.origin === window.location.origin;
        } catch {
            return href.startsWith('/') || href.startsWith('./') || href.startsWith('../');
        }
    }
    
    navigate(path) {
        // Clean up path
        path = path.replace(/^\.\//, '').replace(/^\.\.\//, '');
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        // Update browser history
        history.pushState({ path }, '', path);
        
        // Handle the route
        this.handleRoute(path);
    }
    
    handleRoute(path) {
        // Remove query parameters and hash
        const cleanPath = path.split('?')[0].split('#')[0];
        
        // Check if we have a route defined
        if (this.routes[cleanPath]) {
            this.loadPage(this.routes[cleanPath]);
        } else {
            // Default to index.html for unknown routes
            this.loadPage('/index.html');
        }
    }
    
    loadPage(pagePath) {
        // If we're already on the correct page, don't reload
        if (window.location.pathname === pagePath) {
            return;
        }
        
        // Load the page content
        fetch(pagePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // Parse the HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Update the page title
                document.title = doc.title || 'Angkor Compliance Platform';
                
                // Update the main content
                const newContent = doc.querySelector('main') || doc.body;
                const currentContent = document.querySelector('main') || document.body;
                
                if (currentContent && newContent) {
                    currentContent.innerHTML = newContent.innerHTML;
                } else {
                    // Fallback: redirect to the page
                    window.location.href = pagePath;
                }
                
                // Reinitialize any page-specific scripts
                this.reinitializePage();
            })
            .catch(error => {
                console.error('Error loading page:', error);
                // Fallback: redirect to the page
                window.location.href = pagePath;
            });
    }
    
    reinitializePage() {
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Reinitialize AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
        
        // Dispatch custom event for page-specific initialization
        window.dispatchEvent(new CustomEvent('pageLoaded'));
    }
}

// Initialize the router when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.angkorRouter = new AngkorRouter();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AngkorRouter;
}
