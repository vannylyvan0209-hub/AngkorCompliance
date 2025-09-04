// Navigation Component for Angkor Compliance Platform
// Dynamically generates role-based navigation menus

class NavigationComponent {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.navConfig = window.NavigationConfig;
        this.init();
    }
    
    async init() {
        console.log('🧭 Initializing Navigation Component...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication and get user role
        await this.checkAuthentication();
        
        // Generate navigation
        this.generateNavigation();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Navigation Component initialized');
    }
    
    async initializeFirebase() {
        try {
            if (window.Firebase) {
                this.auth = window.Firebase.auth;
                this.db = window.Firebase.db;
                this.doc = window.Firebase.doc;
                this.getDoc = window.Firebase.getDoc;
                
                console.log('✓ Firebase initialized for navigation');
                return true;
            } else {
                console.log('⚠ Firebase not available for navigation');
                return false;
            }
        } catch (error) {
            console.error('✗ Error initializing Firebase for navigation:', error);
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
                            this.currentUser = { ...user, ...userData };
                            this.currentRole = userData.role;
                            resolve();
                        } else {
                            console.log('❌ User profile not found');
                            this.redirectToLogin();
                        }
                    } catch (error) {
                        console.error('Error checking authentication:', error);
                        this.redirectToLogin();
                    }
                } else {
                    console.log('❌ No authenticated user');
                    this.redirectToLogin();
                }
            });
        });
    }
    
    redirectToLogin() {
        window.location.href = '/login.html';
    }
    
    generateNavigation() {
        if (!this.currentRole || !this.navConfig) {
            console.log('⚠ No role or navigation config available');
            return;
        }
        
        const roleConfig = this.navConfig.getRoleConfig(this.currentRole);
        if (!roleConfig) {
            console.log(`⚠ No navigation config found for role: ${this.currentRole}`);
            return;
        }
        
        // Generate sidebar navigation
        this.generateSidebarNavigation(roleConfig);
        
        // Generate header navigation
        this.generateHeaderNavigation(roleConfig);
        
        // Generate quick actions
        this.generateQuickActions(roleConfig);
        
        // Apply role-specific styling
        this.applyRoleStyling();
    }
    
    generateSidebarNavigation(roleConfig) {
        const sidebarContainer = document.getElementById('sidebarNavigation');
        if (!sidebarContainer) {
            console.log('⚠ Sidebar navigation container not found');
            return;
        }
        
        const menuItems = roleConfig.menu;
        const currentPath = window.location.pathname;
        
        const sidebarHTML = `
            <div class="sidebar-header">
                <div class="sidebar-brand">
                    <div class="brand-logo">
                        <i data-lucide="shield-check"></i>
                    </div>
                    <div class="brand-text">
                        <h3>Angkor Compliance</h3>
                        <span class="role-badge role-${this.currentRole}">${roleConfig.name}</span>
                    </div>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <ul class="nav-menu">
                    ${menuItems.map(item => {
                        const isActive = currentPath.includes(item.url.split('/').pop());
                        const activeClass = isActive ? 'active' : '';
                        
                        return `
                            <li class="nav-item ${activeClass}">
                                <a href="${item.url}" class="nav-link">
                                    <i data-lucide="${item.icon}"></i>
                                    <span class="nav-text">${item.title}</span>
                                    ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
                                </a>
                            </li>
                        `;
                    }).join('')}
                </ul>
            </nav>
            
            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="user-avatar">
                        <span>${this.getUserInitials()}</span>
                    </div>
                    <div class="user-details">
                        <div class="user-name">${this.currentUser.name || this.currentUser.displayName || 'User'}</div>
                        <div class="user-role">${roleConfig.name}</div>
                    </div>
                </div>
                <button class="logout-btn" onclick="navigationComponent.logout()">
                    <i data-lucide="log-out"></i>
                    <span>Logout</span>
                </button>
            </div>
        `;
        
        sidebarContainer.innerHTML = sidebarHTML;
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    generateHeaderNavigation(roleConfig) {
        const headerContainer = document.getElementById('headerNavigation');
        if (!headerContainer) {
            console.log('⚠ Header navigation container not found');
            return;
        }
        
        const headerHTML = `
            <div class="header-left">
                <button class="sidebar-toggle" onclick="navigationComponent.toggleSidebar()">
                    <i data-lucide="menu"></i>
                </button>
                <div class="page-title">
                    <h1>${this.getPageTitle()}</h1>
                    <p>${roleConfig.name} Dashboard</p>
                </div>
            </div>
            
            <div class="header-right">
                <div class="header-actions">
                    <button class="notification-btn" onclick="navigationComponent.toggleNotifications()">
                        <i data-lucide="bell"></i>
                        <span class="notification-badge">3</span>
                    </button>
                    <button class="profile-btn" onclick="navigationComponent.toggleProfileMenu()">
                        <div class="profile-avatar">
                            <span>${this.getUserInitials()}</span>
                        </div>
                        <span class="profile-name">${this.currentUser.name || this.currentUser.displayName || 'User'}</span>
                        <i data-lucide="chevron-down"></i>
                    </button>
                </div>
            </div>
        `;
        
        headerContainer.innerHTML = headerHTML;
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    generateQuickActions(roleConfig) {
        const quickActionsContainer = document.getElementById('quickActions');
        if (!quickActionsContainer) {
            console.log('⚠ Quick actions container not found');
            return;
        }
        
        const quickActions = this.navConfig.getQuickActions(this.currentRole);
        
        const quickActionsHTML = `
            <div class="quick-actions-grid">
                ${quickActions.map(action => `
                    <a href="${action.url}" class="quick-action-card">
                        <div class="action-icon">
                            <i data-lucide="${action.icon}"></i>
                        </div>
                        <div class="action-text">
                            <span>${action.title}</span>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
        
        quickActionsContainer.innerHTML = quickActionsHTML;
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    applyRoleStyling() {
        // Add role-specific class to body
        document.body.classList.add(`role-${this.currentRole}`);
        
        // Update CSS custom properties for role colors
        const roleColor = this.navConfig.getRoleColor(this.currentRole);
        document.documentElement.style.setProperty('--current-role-color', roleColor);
        
        // Update favicon or other role-specific elements
        this.updateRoleSpecificElements();
    }
    
    updateRoleSpecificElements() {
        // Update page title with role
        const roleName = this.navConfig.getRoleDisplayName(this.currentRole);
        const currentTitle = document.title;
        if (!currentTitle.includes(roleName)) {
            document.title = `${currentTitle} - ${roleName}`;
        }
        
        // Update favicon or other branding elements
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            // You could have role-specific favicons here
            // favicon.href = `/assets/images/favicon-${this.currentRole}.png`;
        }
    }
    
    getUserInitials() {
        const name = this.currentUser.name || this.currentUser.displayName || this.currentUser.email || 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    
    getPageTitle() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop().replace('.html', '').replace(/-/g, ' ');
        return pageName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (sidebar && mainContent) {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        }
    }
    
    toggleNotifications() {
        // Implementation for notifications panel
        console.log('Toggle notifications');
    }
    
    toggleProfileMenu() {
        // Implementation for profile menu
        console.log('Toggle profile menu');
    }
    
    async logout() {
        try {
            await this.auth.signOut();
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }
    
    setupEventListeners() {
        // Add event listeners for navigation interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link')) {
                // Handle navigation link clicks
                const link = e.target.closest('.nav-link');
                this.handleNavigationClick(link);
            }
        });
        
        // Handle window resize for responsive navigation
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }
    
    handleNavigationClick(link) {
        // Add loading state
        link.classList.add('loading');
        
        // Remove loading state after navigation
        setTimeout(() => {
            link.classList.remove('loading');
        }, 1000);
    }
    
    handleResize() {
        const width = window.innerWidth;
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (width < 768 && sidebar && mainContent) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }
    
    handleKeyboardNavigation(e) {
        // Handle keyboard shortcuts for navigation
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.navigateToDashboard();
                    break;
                case '2':
                    e.preventDefault();
                    this.navigateToQuickAction(0);
                    break;
                case '3':
                    e.preventDefault();
                    this.navigateToQuickAction(1);
                    break;
                case '4':
                    e.preventDefault();
                    this.navigateToQuickAction(2);
                    break;
            }
        }
    }
    
    navigateToDashboard() {
        const roleConfig = this.navConfig.getRoleConfig(this.currentRole);
        if (roleConfig && roleConfig.menu.length > 0) {
            window.location.href = roleConfig.menu[0].url;
        }
    }
    
    navigateToQuickAction(index) {
        const quickActions = this.navConfig.getQuickActions(this.currentRole);
        if (quickActions && quickActions[index]) {
            window.location.href = quickActions[index].url;
        }
    }
    
    // Public methods for external use
    getCurrentRole() {
        return this.currentRole;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    hasPermission(permission) {
        return this.navConfig.hasPermission(this.currentRole, permission);
    }
    
    getRoleColor() {
        return this.navConfig.getRoleColor(this.currentRole);
    }
    
    getRoleDisplayName() {
        return this.navConfig.getRoleDisplayName(this.currentRole);
    }
}

// Initialize navigation component when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the navigation component
    window.navigationComponent = new NavigationComponent();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationComponent;
}
