#!/usr/bin/env node

/**
 * Update Navigation URLs Script
 * Updates all navigation URLs to use the new routing system
 */

import fs from 'fs';

// URL mapping from old paths to new routes
const URL_MAPPING = {
    // Super Admin URLs
    'super-admin-dashboard.html': '/admin',
    'factory-management.html': '/admin/factories',
    'user-management.html': '/admin/users',
    'standards-management.html': '/admin/standards',
    'requirement-management.html': '/admin/requirements',
    'security-settings.html': '/admin/security',
    'backup-recovery.html': '/admin/backup',
    'audit-logging.html': '/admin/audit-log',
    'system-diagnostics.html': '/admin/diagnostics',
    'system-settings.html': '/admin/settings',
    'billing-management.html': '/admin/billing',
    'system-hardening.html': '/admin/hardening',
    'enterprise-analytics.html': '/admin/analytics',
    'audit-checklist-generator.html': '/admin/checklist',
    'ai-copilot.html': '/admin/ai',
    'factory-registration.html': '/admin/registration',
    'multi-factory-overview.html': '/admin/overview',
    'standard-configuration.html': '/admin/configuration',
    'notification-system.html': '/admin/notifications',
    'system-integration.html': '/admin/integration',
    'profile-management.html': '/admin/profile',
    'language-localization.html': '/admin/language',
    'help-support.html': '/admin/help',
    'factory-settings-panel.html': '/admin/panel',
    'disaster-recovery.html': '/admin/disaster',
    'performance-optimization.html': '/admin/performance',
    
    // Factory Admin URLs
    'factory-dashboard.html': '/factory',
    'factory-admin-settings.html': '/factory/settings',
    'factory-user-management.html': '/factory/users',
    'factory-worker-portal.html': '/factory/workers',
    'permission-management-dashboard.html': '/factory/permissions',
    'role-assignment-panel.html': '/factory/roles',
    'training-management-dashboard.html': '/factory/training',
    'document-oversight-dashboard.html': '/factory/documents',
    'compliance-monitoring-dashboard.html': '/factory/compliance',
    'audit-management-dashboard.html': '/factory/audit',
    'user-invitation-modal.html': '/factory/invite',
    
    // Auditor URLs
    'auditor-dashboard.html': '/auditor',
    'auditor-settings.html': '/auditor/settings',
    'audit-planning.html': '/auditor/planning',
    'audit-report-generation.html': '/auditor/report',
    'evidence-collection.html': '/auditor/evidence',
    'evidence-review.html': '/auditor/evidence/review',
    'evidence-organization.html': '/auditor/evidence/organization',
    'evidence-linking.html': '/auditor/evidence/linking',
    'evidence-export.html': '/auditor/evidence/export',
    'evidence-binder-creation.html': '/auditor/evidence/binder',
    'compliance-documentation-review.html': '/auditor/compliance',
    'finding-documentation.html': '/auditor/findings',
    
    // Worker Portal URLs
    'worker-dashboard.html': '/worker',
    'worker-app.html': '/worker/app',
    'grievance-form.html': '/worker/grievance',
    'case-tracking-portal.html': '/worker/tracking',
    'mobile-interface.html': '/worker/mobile',
    'kiosk-interface.html': '/worker/kiosk',
    'qr-code-access.html': '/worker/qr',
    'whatsapp-integration.html': '/worker/whatsapp',
    
    // HR URLs
    'hr-dashboard.html': '/hr',
    'hr-worker-management.html': '/hr/workers',
    'hr-staff-settings.html': '/hr/settings',
    
    // Grievance Committee URLs
    'case-management-dashboard.html': '/grievance',
    'case-management.html': '/grievance/management',
    'case-intake-screen.html': '/grievance/intake',
    'case-assignment-panel.html': '/grievance/assignment',
    'case-triage-modal.html': '/grievance/triage',
    'case-tracking.html': '/grievance/tracking',
    'case-notes.html': '/grievance/notes',
    'committee-analytics.html': '/grievance/analytics',
    'investigation-workflow.html': '/grievance/investigation',
    'sla-management.html': '/grievance/sla',
    
    // Case Management URLs
    'case-assignment-system.html': '/cases/assignment',
    'case-intake-screen.html': '/cases/intake',
    'case-triage-modal.html': '/cases/triage',
    
    // Analytics URLs
    'analytics-dashboard.html': '/analytics',
    'cap-analytics.html': '/analytics/cap',
    
    // Training URLs
    'training-matrix.html': '/training',
    'task-orchestration.html': '/training/tasks',
    'calendar-sync.html': '/training/calendar',
    'agenda-generator.html': '/training/agenda',
    
    // Documentation URLs
    'documentation-management.html': '/docs',
    
    // Go-live URLs
    'go-live-preparation.html': '/go-live',
    'enterprise-go-live-dashboard.html': '/go-live/enterprise',
    'production-go-live-execution.html': '/go-live/production',
    
    // System URLs
    'disaster-recovery-dashboard.html': '/disaster',
    'security-penetration-testing.html': '/security',
    'performance-optimization.html': '/performance',
    
    // Auth URLs
    'login.html': '/login',
    'register.html': '/register',
    'profile.html': '/profile',
    'mfa-setup.html': '/mfa-setup',
    
    // Special URLs
    'cap.html': '/cap',
    'new-cap.html': '/cap/new',
    'cap-detail.html': '/cap/detail',
    'approval-dashboard.html': '/approval',
    'style-guide-2025.html': '/style-guide',
    'component-library-2025.html': '/components',
    'design-system-showcase-2025.html': '/design-system',
    'documentation-site-2025.html': '/documentation'
};

function updateNavigationFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Update URLs in the navigation configuration
        Object.entries(URL_MAPPING).forEach(([oldUrl, newUrl]) => {
            const regex = new RegExp(`url:\\s*['"]${oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
            if (content.match(regex)) {
                content = content.replace(regex, `url: '${newUrl}'`);
                updated = true;
            }
        });
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting navigation URL update...\n');
    
    const filesToUpdate = [
        'assets/js/navigation-config.js',
        'assets/js/nav-config.js'
    ];
    
    let updatedCount = 0;
    
    for (const file of filesToUpdate) {
        if (fs.existsSync(file)) {
            const result = updateNavigationFile(file);
            if (result) {
                updatedCount++;
            } else {
                console.log(`⏭️  Skipped: ${file} (no URLs to update)`);
            }
        } else {
            console.log(`⚠️  File not found: ${file}`);
        }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Files updated: ${updatedCount}`);
    
    if (updatedCount > 0) {
        console.log('\n🎉 Navigation URLs successfully updated!');
        console.log('\n📋 Next steps:');
        console.log('1. Test navigation links to ensure they work correctly');
        console.log('2. Update any hardcoded links in HTML files');
        console.log('3. Test the routing system');
    } else {
        console.log('\nℹ️  No files needed updating.');
    }
}

main().catch(console.error);
