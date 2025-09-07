// Super Admin Navigation Service
// Comprehensive navigation management for Super Admin role

class SuperAdminNavigationService {
    constructor() {
        this.currentUser = null;
        this.navConfig = window.NavigationConfig;
        this.navigationItems = [];
        this.quickActions = [];
        this.init();
    }
    
    async init() {
        console.log('🧭 Initializing Super Admin Navigation Service...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize navigation
        this.initializeNavigation();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Super Admin Navigation Service initialized');
    }
    
    async initializeFirebase() {
        try {
            if (window.Firebase) {
                this.auth = window.Firebase.auth;
                this.db = window.Firebase.db;
                this.doc = window.Firebase.doc;
                this.getDoc = window.Firebase.getDoc;
                
                console.log('✓ Firebase initialized for Super Admin navigation');
                return true;
            } else {
                console.log('⚠ Firebase not available for Super Admin navigation');
                return false;
            }
        } catch (error) {
            console.error('✗ Error initializing Firebase for Super Admin navigation:', error);
            return false;
        }
    }
    
    async checkAuthentication() {
        return new Promise((resolve) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        const userDocRef = this.doc(this.db, 'users', user.uid);
                        const userDoc = await this.getDoc(userDocRef);
                        
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            
                            // Only allow super admins
                            if (userData.role === 'super_admin') {
                                this.currentUser = { ...user, ...userData };
                                resolve();
                            } else {
                                console.log('❌ Access denied - super admin privileges required');
                                window.location.href = '../../login.html';
                            }
                        } else {
                            console.log('❌ User profile not found');
                            window.location.href = '../../login.html';
                        }
                    } catch (error) {
                        console.error('Error checking authentication:', error);
                        window.location.href = '../../login.html';
                    }
                } else {
                    console.log('❌ No authenticated user');
                    window.location.href = '../../login.html';
                }
            });
        });
    }
    
    initializeNavigation() {
        if (!this.navConfig) {
            console.log('⚠ Navigation config not available');
            return;
        }
        
        const roleConfig = this.navConfig.getRoleConfig('super_admin');
        if (!roleConfig) {
            console.log('⚠ No navigation config found for super_admin role');
            return;
        }
        
        this.navigationItems = roleConfig.menu || [];
        this.quickActions = this.navConfig.getQuickActions('super_admin') || [];
        
        console.log('✓ Super Admin navigation initialized with', this.navigationItems.length, 'items');
    }
    
    generateSidebarNavigation() {
        const sidebar = document.getElementById('navigation-sidebar');
        if (!sidebar) {
            console.log('⚠ Sidebar element not found');
            return;
        }
        
        const navigationHTML = `
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <img src="../../logo.png" alt="Angkor Compliance" class="logo-img">
                    <div class="logo-text">
                        <h2>Angkor Compliance</h2>
                        <span class="role-badge super-admin">Super Admin</span>
                    </div>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <div class="nav-section">
                    <h3 class="nav-section-title">System Management</h3>
                    ${this.generateNavigationGroup('system')}
                </div>
                
                <div class="nav-section">
                    <h3 class="nav-section-title">Factory & Users</h3>
                    ${this.generateNavigationGroup('management')}
                </div>
                
                <div class="nav-section">
                    <h3 class="nav-section-title">Compliance & Standards</h3>
                    ${this.generateNavigationGroup('compliance')}
                </div>
                
                <div class="nav-section">
                    <h3 class="nav-section-title">Analytics & Reporting</h3>
                    ${this.generateNavigationGroup('analytics')}
                </div>
                
                <div class="nav-section">
                    <h3 class="nav-section-title">Security & Maintenance</h3>
                    ${this.generateNavigationGroup('security')}
                </div>
            </nav>
            
            <div class="sidebar-footer">
                <div class="user-profile">
                    <div class="user-avatar">
                        <span>${this.getUserInitials()}</span>
                    </div>
                    <div class="user-info">
                        <div class="user-name">${this.currentUser?.name || 'Super Admin'}</div>
                        <div class="user-role">System Administrator</div>
                    </div>
                </div>
                
                <div class="sidebar-actions">
                    <button class="nav-action-btn" onclick="toggleLanguage()" title="Toggle Language">
                        <i data-lucide="globe"></i>
                    </button>
                    <button class="nav-action-btn" onclick="openHelp()" title="Help & Support">
                        <i data-lucide="help-circle"></i>
                    </button>
                    <button class="nav-action-btn" onclick="logout()" title="Logout">
                        <i data-lucide="log-out"></i>
                    </button>
                </div>
            </div>
        `;
        
        sidebar.innerHTML = navigationHTML;
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    generateNavigationGroup(category) {
        const groupItems = this.getNavigationItemsByCategory(category);
        
        return groupItems.map(item => `
            <a href="${item.url}" class="nav-item ${this.isActiveRoute(item.url) ? 'active' : ''}" 
               data-tooltip="${item.description || ''}">
                <div class="nav-item-icon">
                    <i data-lucide="${item.icon}"></i>
                </div>
                <div class="nav-item-content">
                    <span class="nav-item-title">${item.title}</span>
                    ${item.badge ? `<span class="nav-item-badge">${item.badge}</span>` : ''}
                </div>
                <div class="nav-item-arrow">
                    <i data-lucide="chevron-right"></i>
                </div>
            </a>
        `).join('');
    }
    
    getNavigationItemsByCategory(category) {
        const categoryMap = {
            'system': ['System Overview', 'System Settings', 'System Diagnostics', 'System Hardening'],
            'management': ['Factory Management', 'User Management', 'Factory Registration', 'Factory Settings Panel'],
            'compliance': ['Standards Registry', 'Requirement Management', 'Standard Configuration', 'Audit Logging'],
            'analytics': ['Enterprise Analytics', 'Multi-Factory Overview'],
            'security': ['Security Settings', 'Backup & Recovery', 'Billing & Licensing']
        };
        
        const categoryItems = categoryMap[category] || [];
        return this.navigationItems.filter(item => categoryItems.includes(item.title));
    }
    
    generateHeaderNavigation() {
        const header = document.getElementById('navigation-header');
        if (!header) {
            console.log('⚠ Header element not found');
            return;
        }
        
        const headerHTML = `
            <div class="header-content">
                <div class="header-left">
                    <button class="sidebar-toggle" onclick="toggleSidebar()">
                        <i data-lucide="menu"></i>
                    </button>
                    <div class="breadcrumb">
                        <span class="breadcrumb-item">Super Admin</span>
                        <i data-lucide="chevron-right" class="breadcrumb-separator"></i>
                        <span class="breadcrumb-item current" id="currentPage">Dashboard</span>
                    </div>
                </div>
                
                <div class="header-center">
                    <div class="search-container">
                        <div class="search-input-wrapper">
                            <i data-lucide="search" class="search-icon"></i>
                            <input type="text" placeholder="Search system, users, factories..." class="search-input" id="globalSearch">
                        </div>
                    </div>
                </div>
                
                <div class="header-right">
                    <div class="header-actions">
                        <button class="header-action-btn" onclick="openNotifications()" title="Notifications">
                            <i data-lucide="bell"></i>
                            <span class="notification-badge" id="notificationCount">0</span>
                        </button>
                        
                        <button class="header-action-btn" onclick="openAICopilot()" title="AI Copilot">
                            <i data-lucide="bot"></i>
                        </button>
                        
                        <div class="user-menu">
                            <button class="user-menu-btn" onclick="toggleUserMenu()">
                                <div class="user-avatar-small">
                                    <span>${this.getUserInitials()}</span>
                                </div>
                                <i data-lucide="chevron-down"></i>
                            </button>
                            
                            <div class="user-menu-dropdown" id="userMenuDropdown">
                                <div class="user-menu-header">
                                    <div class="user-avatar-large">
                                        <span>${this.getUserInitials()}</span>
                                    </div>
                                    <div class="user-details">
                                        <div class="user-name">${this.currentUser?.name || 'Super Admin'}</div>
                                        <div class="user-email">${this.currentUser?.email || 'admin@angkorcompliance.com'}</div>
                                    </div>
                                </div>
                                
                                <div class="user-menu-items">
                                    <a href="/pages/super-admin/profile.html" class="user-menu-item">
                                        <i data-lucide="user"></i>
                                        <span>Profile Settings</span>
                                    </a>
                                    <a href="/pages/super-admin/security-settings.html" class="user-menu-item">
                                        <i data-lucide="shield"></i>
                                        <span>Security Settings</span>
                                    </a>
                                    <a href="/pages/super-admin/system-settings.html" class="user-menu-item">
                                        <i data-lucide="settings"></i>
                                        <span>System Settings</span>
                                    </a>
                                    <div class="user-menu-divider"></div>
                                    <button class="user-menu-item logout-btn" onclick="logout()">
                                        <i data-lucide="log-out"></i>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        header.innerHTML = headerHTML;
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    generateQuickActions() {
        const quickActionsContainer = document.getElementById('quick-actions');
        if (!quickActionsContainer) {
            console.log('⚠ Quick actions container not found');
            return;
        }
        
        const quickActionsHTML = `
            <div class="quick-actions-panel">
                <div class="quick-actions-header">
                    <h3>Quick Actions</h3>
                    <button class="quick-actions-toggle" onclick="toggleQuickActions()">
                        <i data-lucide="chevron-up"></i>
                    </button>
                </div>
                
                <div class="quick-actions-grid">
                    ${this.quickActions.map(action => `
                        <a href="${action.url}" class="quick-action-item">
                            <div class="quick-action-icon">
                                <i data-lucide="${action.icon}"></i>
                            </div>
                            <div class="quick-action-content">
                                <span class="quick-action-title">${action.title}</span>
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
        
        quickActionsContainer.innerHTML = quickActionsHTML;
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    getUserInitials() {
        if (!this.currentUser) return 'SA';
        const name = this.currentUser.name || this.currentUser.displayName || 'Super Admin';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    
    isActiveRoute(url) {
        const currentPath = window.location.pathname;
        return currentPath.includes(url.split('/').pop());
    }
    
    setupEventListeners() {
        // Global search functionality
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }
        
        // User menu toggle
        document.addEventListener('click', (e) => {
            const userMenuBtn = e.target.closest('.user-menu-btn');
            const userMenuDropdown = document.getElementById('userMenuDropdown');
            
            if (userMenuBtn) {
                userMenuDropdown?.classList.toggle('show');
            } else if (!e.target.closest('.user-menu')) {
                userMenuDropdown?.classList.remove('show');
            }
        });
        
        // Sidebar toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('.sidebar-toggle')) {
                this.toggleSidebar();
            }
        });
    }
    
    handleGlobalSearch(query) {
        if (query.length < 2) return;
        
        console.log('Searching for:', query);
        // Implement global search functionality
        // This would search across users, factories, cases, etc.
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('navigation-sidebar');
        const main = document.querySelector('.layout-main');
        
        if (sidebar && main) {
            sidebar.classList.toggle('collapsed');
            main.classList.toggle('sidebar-collapsed');
        }
    }
    
    updateCurrentPage(pageName) {
        const currentPageElement = document.getElementById('currentPage');
        if (currentPageElement) {
            currentPageElement.textContent = pageName;
        }
    }
    
    updateNotificationCount(count) {
        const notificationBadge = document.getElementById('notificationCount');
        if (notificationBadge) {
            notificationBadge.textContent = count;
            notificationBadge.style.display = count > 0 ? 'block' : 'none';
        }
    }
    
    // Public methods for external use
    renderNavigation() {
        this.generateSidebarNavigation();
        this.generateHeaderNavigation();
        this.generateQuickActions();
    }
    
    getNavigationItems() {
        return this.navigationItems;
    }
    
    getQuickActions() {
        return this.quickActions;
    }
}

// Global functions for HTML onclick handlers
function toggleSidebar() {
    if (window.superAdminNavigation) {
        window.superAdminNavigation.toggleSidebar();
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userMenuDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function toggleQuickActions() {
    const panel = document.querySelector('.quick-actions-panel');
    if (panel) {
        panel.classList.toggle('collapsed');
    }
}

function toggleLanguage() {
    // Implement language toggle functionality
    console.log('Toggle language');
}

function openHelp() {
    window.open('/pages/super-admin/help-support.html', '_blank');
}

function openNotifications() {
    // Implement notifications panel
    console.log('Open notifications');
}

function openAICopilot() {
    // Implement AI Copilot panel
    console.log('Open AI Copilot');
}

function logout() {
    if (window.Firebase && window.Firebase.auth) {
        window.Firebase.auth.signOut().then(() => {
            window.location.href = '/login.html';
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    } else {
        window.location.href = '/login.html';
    }
}

// Initialize the navigation service when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the super admin navigation service
    window.superAdminNavigation = new SuperAdminNavigationService();
    
    // Render navigation after initialization
    setTimeout(() => {
        if (window.superAdminNavigation) {
            window.superAdminNavigation.renderNavigation();
        }
    }, 100);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuperAdminNavigationService;
}
