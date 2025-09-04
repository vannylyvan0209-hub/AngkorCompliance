/**
 * Standardized Navigation Template for Super Admin Dashboard
 * This ensures consistent navigation across all pages
 */

// Navigation Template
// Firebase imports removed - using global window.firebase instead

// Prevent duplicate loading
if (typeof window.SuperAdminNavigation === 'undefined') {
    class SuperAdminNavigation {
        constructor() {
            this.currentPage = this.getCurrentPage();
            this.userRole = (typeof localStorage !== 'undefined' && localStorage.getItem('userRole')) || 'super_admin';
            this.navigationItems = this.getNavigationStructure();
            this.init();
        }

        getCurrentPage() {
            const path = window.location.pathname;
            const filename = path.split('/').pop() || 'index.html';
            return filename;
        }

        getNavigationStructure() {
            try {
                if (window.NavigationConfig && window.NavigationConfig.methods && typeof window.NavigationConfig.methods.getNavigationForRole === 'function') {
                    const getForRole = window.NavigationConfig.methods.getNavigationForRole;
                    const items = getForRole.call(window.NavigationConfig, this.userRole) || [];
                    // Map to template structure
                    return items.map(item => ({
                        id: item.id,
                        title: item.title,
                        icon: item.icon,
                        url: item.url,
                        description: item.description
                    }));
                }
            } catch (e) {
                console.warn('NavigationConfig not available, using default navigation. Error:', e);
            }
            return [
                {
                    id: 'overview',
                    title: 'Overview',
                    icon: 'bar-chart-3',
                    url: 'super-admin-dashboard.html',
                    description: 'Dashboard home and system overview'
                },
                {
                    id: 'factories',
                    title: 'Factories',
                    icon: 'building-2',
                    url: 'factory-management.html',
                    description: 'Manage factory registrations and compliance'
                },
                {
                    id: 'users',
                    title: 'User Management',
                    icon: 'users',
                    url: 'user-management.html',
                    description: 'Manage user accounts and permissions'
                },
                {
                    id: 'cap',
                    title: 'CAP Management',
                    icon: 'clipboard-list',
                    url: 'cap.html',
                    description: 'Corrective Action Plans and compliance tracking'
                },
                {
                    id: 'documents',
                    title: 'Documents',
                    icon: 'file-text',
                    url: 'documents.html',
                    description: 'Document management and versioning'
                },
                {
                    id: 'approvals',
                    title: 'Approvals',
                    icon: 'check-circle',
                    url: 'approval-dashboard.html',
                    description: 'Document and request approval workflow'
                },
                {
                    id: 'grievances',
                    title: 'Grievances',
                    icon: 'message-circle',
                    url: 'grievance-management.html',
                    description: 'Grievance tracking and resolution'
                },
                {
                    id: 'analytics',
                    title: 'Analytics',
                    icon: 'trending-up',
                    url: 'analytics-dashboard.html',
                    description: 'System analytics and reporting'
                },
                {
                    id: 'cap-analytics',
                    title: 'CAP Analytics',
                    icon: 'activity',
                    url: 'cap-analytics.html',
                    description: 'Corrective Action Plan analytics and risk assessment'
                },
                {
                    id: 'settings',
                    title: 'System Settings',
                    icon: 'settings',
                    url: 'settings.html',
                    description: 'System configuration and preferences'
                },
                {
                    id: 'diagnostics',
                    title: 'Diagnostics',
                    icon: 'wrench',
                    url: 'diagnostics.html',
                    description: 'System diagnostics and troubleshooting'
                }
            ];
        }

        init() {
            this.renderNavigation();
            this.setActiveState();
            this.updatePortalSubtitle();
            this.setupMobileMenu();
            this.setupNavigationEvents();
        }

        renderNavigation() {
            const sidebar = document.querySelector('.sidebar-nav');
            if (!sidebar) return;

            // Clear existing navigation
            sidebar.innerHTML = '';

            // Render main navigation items
            this.navigationItems.forEach(item => {
                const navItem = this.createNavigationItem(item);
                sidebar.appendChild(navItem);
            });

            // Add logout section
            const logoutSection = this.createLogoutSection();
            sidebar.appendChild(logoutSection);

            // Render lucide icons if available
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        }

        createNavigationItem(item) {
            const navItem = document.createElement('a');
            navItem.href = item.url;
            navItem.className = 'sidebar-nav-item';
            navItem.setAttribute('data-page', item.id);
            navItem.setAttribute('title', item.description);

            navItem.innerHTML = `
                <i data-lucide="${item.icon}"></i>
                <span>${item.title}</span>
            `;

            return navItem;
        }

        createLogoutSection() {
            const logoutSection = document.createElement('div');
            logoutSection.style.cssText = 'margin-top: var(--space-8); padding-top: var(--space-4); border-top: 1px solid var(--neutral-200);';

            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.className = 'sidebar-nav-item';
            logoutLink.onclick = (e) => {
                e.preventDefault();
                this.logout();
            };

            logoutLink.innerHTML = `
                <i data-lucide="log-out"></i>
                <span>Logout</span>
            `;

            logoutSection.appendChild(logoutLink);
            return logoutSection;
        }

        setActiveState() {
            const currentPageId = this.getPageIdFromFilename(this.currentPage);
            
            // Remove all active states
            document.querySelectorAll('.sidebar-nav-item').forEach(item => {
                item.classList.remove('active');
            });

            // Set active state for current page
            const currentNavItem = document.querySelector(`[data-page="${currentPageId}"]`);
            if (currentNavItem) {
                currentNavItem.classList.add('active');
            }
        }

        getPageIdFromFilename(filename) {
            const pageMap = {
                'super-admin-dashboard.html': 'overview',
                'hr-dashboard.html': 'hr',
                'auditor-dashboard.html': 'auditor',
                'factory-dashboard.html': 'factories',
                'factory-management.html': 'factories',
                'user-management.html': 'users',
                'cap.html': 'cap',
                'documents.html': 'documents',
                'approval-dashboard.html': 'approvals',
                'grievance-management.html': 'grievances',
                'analytics-dashboard.html': 'analytics',
                'cap-analytics.html': 'cap-analytics',
                'settings.html': 'settings',
                'diagnostics.html': 'diagnostics'
            };

            return pageMap[filename] || 'overview';
        }

        setupMobileMenu() {
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.mobile-overlay');

            if (mobileToggle) {
                mobileToggle.onclick = () => this.toggleMobileMenu();
            }

            if (overlay) {
                overlay.onclick = () => this.closeMobileMenu();
            }

            // Close mobile menu on window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    this.closeMobileMenu();
                }
            });
        }

        toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            if (sidebar) {
                sidebar.classList.toggle('open');
            }
            if (overlay) {
                overlay.classList.toggle('open');
            }
        }

        closeMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            if (sidebar) {
                sidebar.classList.remove('open');
            }
            if (overlay) {
                overlay.classList.remove('open');
            }
        }

        setupNavigationEvents() {
            // Add navigation analytics
            document.querySelectorAll('.sidebar-nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.trackNavigation(item.getAttribute('data-page'));
                });
            });
        }

        trackNavigation(pageId) {
            // Track navigation for analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'navigation_click', {
                    'page_id': pageId,
                    'user_role': this.userRole
                });
            }
        }

        updatePortalSubtitle() {
            try {
                const subtitleMap = {
                    'super_admin': 'Super Admin Portal',
                    'factory_admin': 'Factory Admin Portal',
                    'hr_staff': 'HR Portal',
                    'auditor': 'Auditor Portal'
                };
                const el = document.querySelector('.brand-subtitle');
                if (el) {
                    el.textContent = subtitleMap[this.userRole] || 'Portal';
                }
            } catch (e) { /* noop */ }
        }

        logout() {
            // Clear user session
            if (auth) {
                auth.signOut().then(() => {
                    window.location.href = 'login.html';
                }).catch((error) => {
                    console.error('Logout error:', error);
                    window.location.href = 'login.html';
                });
            } else {
                // Fallback logout
                localStorage.removeItem('user');
                sessionStorage.clear();
                window.location.href = 'login.html';
            }
        }

        // Method to update navigation dynamically
        updateNavigation(newItems) {
            this.navigationItems = newItems;
            this.renderNavigation();
            this.setActiveState();
        }

        // Method to add custom navigation items
        addCustomItem(item) {
            this.navigationItems.push(item);
            this.renderNavigation();
        }

        // Method to remove navigation items
        removeItem(itemId) {
            this.navigationItems = this.navigationItems.filter(item => item.id !== itemId);
            this.renderNavigation();
        }
    }

    // Make it globally accessible
    window.SuperAdminNavigation = SuperAdminNavigation;
    
    // Mark as loaded
    window.SuperAdminNavigationLoaded = true;
    
    console.log('✅ SuperAdminNavigation loaded successfully');
} else {
    console.log('ℹ️ SuperAdminNavigation already loaded, skipping duplicate');
}

// Auto-load sidebar template (if missing) and initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if not already done
    if (window.superAdminNav) {
        console.log('ℹ️ Navigation already initialized, skipping');
        return;
    }
    
    const ensureSidebarTemplate = () => {
        return new Promise((resolve) => {
            const hasSidebarNav = document.querySelector('.sidebar-nav');
            if (hasSidebarNav) {
                resolve();
                return;
            }
            const target = document.getElementById('sidebarContainer') || document.body;
            fetch('assets/html/sidebar-template.html')
                .then(r => r.text())
                .then(html => {
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = html;
                    if (target.id === 'sidebarContainer') {
                        target.innerHTML = html;
                    } else {
                        target.prepend(wrapper);
                    }
                    resolve();
                })
                .catch(() => resolve());
        });
    };

    ensureSidebarTemplate().then(() => {
        if (window.SuperAdminNavigation && !window.superAdminNav) {
            window.superAdminNav = new window.SuperAdminNavigation();
            console.log('✅ Navigation initialized successfully');
        }
    });
});

// Expose global helpers for inline handlers in template
window.toggleMobileMenu = function() {
    if (window.superAdminNav) {
        window.superAdminNav.toggleMobileMenu();
    }
};

window.closeMobileMenu = function() {
    if (window.superAdminNav) {
        window.superAdminNav.closeMobileMenu();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.SuperAdminNavigation || SuperAdminNavigation;
}
