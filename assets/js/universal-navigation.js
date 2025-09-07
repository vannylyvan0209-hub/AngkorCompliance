/**
 * Universal Navigation System for Angkor Compliance Platform
 * Provides consistent navigation across all role dashboards
 */

// Prevent duplicate loading
if (typeof window.UniversalNavigation === 'undefined') {
    class UniversalNavigation {
        constructor() {
            this.currentPage = this.getCurrentPage();
            this.userRole = this.getUserRole();
            this.navigationItems = this.getNavigationStructure();
            this.init();
        }

        getCurrentPage() {
            const path = window.location.pathname;
            const filename = path.split('/').pop() || 'index.html';
            return filename;
        }

        getUserRole() {
            // Try to get role from localStorage, URL, or default to 'worker'
            if (typeof localStorage !== 'undefined' && localStorage.getItem('userRole')) {
                return localStorage.getItem('userRole');
            }
            
            // Try to detect role from URL path
            const path = window.location.pathname;
            if (path.includes('/super-admin/')) return 'super_admin';
            if (path.includes('/factory-admin/')) return 'factory_admin';
            if (path.includes('/auditor/')) return 'auditor';
            if (path.includes('/hr-staff/')) return 'hr_staff';
            if (path.includes('/grievance-committee/')) return 'grievance_committee';
            if (path.includes('/worker-portal/')) return 'worker';
            if (path.includes('/analytics/')) return 'analytics_user';
            
            return 'worker'; // Default role
        }

        getNavigationStructure() {
            const role = this.userRole;
            
            // Basic navigation structure for each role
            const navigationMap = {
                super_admin: [
                    { id: 'dashboard', title: 'System Overview', icon: 'bar-chart-3', url: '../../pages/super-admin/super-admin-dashboard.html' },
                    { id: 'factories', title: 'Factory Management', icon: 'building-2', url: '../../pages/super-admin/factory-management.html' },
                    { id: 'users', title: 'User Management', icon: 'users', url: '../../pages/super-admin/user-management.html' },
                    { id: 'standards', title: 'Standards Management', icon: 'shield-check', url: '../../pages/super-admin/standards-management.html' },
                    { id: 'analytics', title: 'Enterprise Analytics', icon: 'trending-up', url: '../../pages/super-admin/enterprise-analytics.html' },
                    { id: 'settings', title: 'System Settings', icon: 'settings', url: '../../pages/super-admin/system-settings.html' },
                    { id: 'help', title: 'Help & Support', icon: 'help-circle', url: '../../pages/super-admin/help-support.html' }
                ],
                factory_admin: [
                    { id: 'dashboard', title: 'Factory Dashboard', icon: 'bar-chart-3', url: '../../pages/factory-admin/factory-dashboard.html' },
                    { id: 'management', title: 'Factory Management', icon: 'building-2', url: '../../pages/factory-admin/factory-management.html' },
                    { id: 'users', title: 'User Management', icon: 'users', url: '../../pages/factory-admin/factory-user-management.html' },
                    { id: 'compliance', title: 'Compliance Monitoring', icon: 'shield-check', url: '../../pages/factory-admin/compliance-monitoring-dashboard.html' },
                    { id: 'audits', title: 'Audit Management', icon: 'clipboard-check', url: '../../pages/factory-admin/audit-management-dashboard.html' },
                    { id: 'training', title: 'Training Management', icon: 'graduation-cap', url: '../../pages/factory-admin/training-management-dashboard.html' },
                    { id: 'settings', title: 'Factory Settings', icon: 'settings', url: '../../pages/factory-admin/factory-admin-settings.html' }
                ],
                auditor: [
                    { id: 'dashboard', title: 'Auditor Dashboard', icon: 'bar-chart-3', url: '../../pages/auditor/auditor-dashboard.html' },
                    { id: 'planning', title: 'Audit Planning', icon: 'calendar', url: '../../pages/auditor/audit-planning.html' },
                    { id: 'checklist', title: 'Audit Checklist', icon: 'clipboard-list', url: '../../pages/auditor/audit-checklist-generator.html' },
                    { id: 'evidence', title: 'Evidence Collection', icon: 'folder-open', url: '../../pages/auditor/evidence-collection.html' },
                    { id: 'reports', title: 'Audit Reports', icon: 'file-text', url: '../../pages/auditor/audit-report-generation.html' },
                    { id: 'settings', title: 'Auditor Settings', icon: 'settings', url: '../../pages/auditor/auditor-settings.html' }
                ],
                hr_staff: [
                    { id: 'dashboard', title: 'HR Dashboard', icon: 'bar-chart-3', url: '../../pages/hr/hr-dashboard.html' },
                    { id: 'workers', title: 'Worker Management', icon: 'users', url: '../../pages/hr-staff/hr-worker-management.html' },
                    { id: 'training', title: 'Training Management', icon: 'graduation-cap', url: '../../pages/training-meetings/training-matrix.html' },
                    { id: 'settings', title: 'HR Settings', icon: 'settings', url: '../../pages/hr-staff/hr-staff-settings.html' }
                ],
                grievance_committee: [
                    { id: 'dashboard', title: 'Committee Dashboard', icon: 'bar-chart-3', url: '../../pages/grievance-committee/case-management-dashboard.html' },
                    { id: 'cases', title: 'Case Management', icon: 'folder-open', url: '../../pages/grievance-committee/case-management.html' },
                    { id: 'intake', title: 'Case Intake', icon: 'plus-circle', url: '../../pages/grievance-committee/case-intake-screen.html' },
                    { id: 'tracking', title: 'Case Tracking', icon: 'search', url: '../../pages/grievance-committee/case-tracking.html' },
                    { id: 'analytics', title: 'Committee Analytics', icon: 'trending-up', url: '../../pages/grievance-committee/committee-analytics.html' },
                    { id: 'sla', title: 'SLA Management', icon: 'clock', url: '../../pages/grievance-committee/sla-management.html' }
                ],
                worker: [
                    { id: 'dashboard', title: 'Worker Dashboard', icon: 'bar-chart-3', url: '../../pages/worker-portal/worker-dashboard.html' },
                    { id: 'grievance', title: 'Submit Grievance', icon: 'message-circle', url: '../../pages/worker-portal/grievance-form.html' },
                    { id: 'tracking', title: 'Track Cases', icon: 'search', url: '../../pages/worker-portal/case-tracking-portal.html' },
                    { id: 'profile', title: 'My Profile', icon: 'user', url: '../../pages/worker-portal/user-dashboard.html' }
                ],
                analytics_user: [
                    { id: 'dashboard', title: 'Analytics Dashboard', icon: 'bar-chart-3', url: '../../pages/analytics/analytics-dashboard.html' },
                    { id: 'cap', title: 'CAP Analytics', icon: 'trending-up', url: '../../pages/analytics/cap-analytics.html' }
                ]
            };

            return navigationMap[role] || navigationMap.worker;
        }

        init() {
            this.loadSidebarTemplate();
            this.populateNavigation();
            this.updateUserInfo();
            this.setActiveNavigation();
            this.initializeMobileMenu();
            this.initializeAlertSystem();
        }

        loadSidebarTemplate() {
            const sidebarContainer = document.getElementById('sidebarContainer');
            if (sidebarContainer) {
                fetch('../../assets/html/universal-sidebar-template.html')
                    .then(response => response.text())
                    .then(html => {
                        sidebarContainer.innerHTML = html;
                        this.populateNavigation();
                        this.updateUserInfo();
                        this.setActiveNavigation();
                        this.initializeMobileMenu();
                    })
                    .catch(error => {
                        console.error('Error loading sidebar template:', error);
                        this.createFallbackNavigation();
                    });
            }
        }

        populateNavigation() {
            const sidebarNav = document.getElementById('sidebarNav');
            if (!sidebarNav) return;

            const navHTML = this.navigationItems.map(item => `
                <div class="nav-item">
                    <a href="${item.url}" class="nav-link ${this.currentPage === item.url.split('/').pop() ? 'active' : ''}" 
                       data-page="${item.id}">
                        <i data-lucide="${item.icon}"></i>
                        <span>${item.title}</span>
                    </a>
                </div>
            `).join('');

            sidebarNav.innerHTML = navHTML;

            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }

        updateUserInfo() {
            const roleTitles = {
                super_admin: 'Super Admin Portal',
                factory_admin: 'Factory Admin Portal',
                auditor: 'Auditor Portal',
                hr_staff: 'HR Staff Portal',
                grievance_committee: 'Grievance Committee',
                worker: 'Worker Portal',
                analytics_user: 'Analytics Portal'
            };

            const roleNames = {
                super_admin: 'Super Administrator',
                factory_admin: 'Factory Administrator',
                auditor: 'Auditor',
                hr_staff: 'HR Staff',
                grievance_committee: 'Committee Member',
                worker: 'Worker',
                analytics_user: 'Analytics User'
            };

            // Update role subtitle
            const roleSubtitle = document.getElementById('roleSubtitle');
            if (roleSubtitle) {
                roleSubtitle.textContent = roleTitles[this.userRole] || 'Dashboard';
            }

            // Update user role
            const userRole = document.getElementById('userRole');
            if (userRole) {
                userRole.textContent = roleNames[this.userRole] || 'User';
            }

            // Update user name (try to get from localStorage or use default)
            const userName = document.getElementById('userName');
            if (userName) {
                const storedName = localStorage.getItem('userName') || 'User';
                userName.textContent = storedName;
            }

            // Update user avatar
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) {
                const initials = this.getUserInitials();
                userAvatar.textContent = initials;
            }
        }

        getUserInitials() {
            const userName = localStorage.getItem('userName') || 'User';
            return userName.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2);
        }

        setActiveNavigation() {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && this.currentPage === href.split('/').pop()) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        initializeMobileMenu() {
            // Mobile menu functionality
            window.toggleMobileMenu = () => {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('mobileOverlay');
                
                if (sidebar && overlay) {
                    sidebar.classList.toggle('open');
                    overlay.classList.toggle('open');
                }
            };

            window.closeMobileMenu = () => {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('mobileOverlay');
                
                if (sidebar && overlay) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('open');
                }
            };
        }

        initializeAlertSystem() {
            // Load and initialize the alert system
            if (typeof window.AlertManager === 'undefined') {
                // Load the alerts JavaScript file
                const script = document.createElement('script');
                script.src = '../../assets/js/alerts-2025.js';
                script.onload = () => {
                    if (typeof window.AlertManager !== 'undefined') {
                        window.alertManager = new window.AlertManager();
                        console.log('✅ Alert system initialized');
                    }
                };
                document.head.appendChild(script);
            } else {
                window.alertManager = new window.AlertManager();
                console.log('✅ Alert system initialized');
            }
        }

        createFallbackNavigation() {
            const sidebarContainer = document.getElementById('sidebarContainer');
            if (sidebarContainer) {
                sidebarContainer.innerHTML = `
                    <aside class="sidebar" id="sidebar">
                        <div class="sidebar-header">
                            <div class="navbar-brand">
                                <img src="../../logo.png" alt="Angkor Compliance" class="logo-image">
                                <div class="brand-text">
                                    <h3 class="brand-title">Angkor Compliance</h3>
                                    <p class="brand-subtitle">Dashboard</p>
                                </div>
                            </div>
                        </div>
                        <nav class="sidebar-nav">
                            <div class="nav-item">
                                <a href="../../index.html" class="nav-link">
                                    <i data-lucide="home"></i>
                                    <span>Home</span>
                                </a>
                            </div>
                        </nav>
                    </aside>
                `;
                
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        }
    }

    // Initialize navigation when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        window.UniversalNavigation = new UniversalNavigation();
    });

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = UniversalNavigation;
    }
}
