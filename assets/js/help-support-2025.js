/**
 * Angkor Compliance Platform - Help & Support JavaScript 2025
 * Modern help and support system with 2025 styling
 */

class HelpSupportManager {
    constructor() {
        this.helpModal = null;
        this.config = {
            enableSearch: true,
            enableCategories: true,
            enableArticles: true,
            enableContact: true,
            enableAnimations: true,
            enableGlassmorphism: true,
            enableNeumorphism: false,
            enableDarkMode: true,
            enableResponsive: true,
            enableAccessibility: true,
            animationDuration: 300,
            searchDelay: 300
        };
        this.categories = [
            {
                id: 'getting-started',
                title: 'Getting Started',
                description: 'Learn the basics of using the platform',
                icon: 'play-circle',
                articles: [
                    {
                        id: 'welcome',
                        title: 'Welcome to Angkor Compliance',
                        excerpt: 'Get started with your compliance journey',
                        content: `
                            <h1>Welcome to Angkor Compliance Platform</h1>
                            <p>Welcome to the Angkor Compliance Platform, your comprehensive solution for factory compliance management in Cambodia.</p>
                            <h2>What is Angkor Compliance?</h2>
                            <p>Angkor Compliance is a modern, digital platform designed to help factories in Cambodia manage their compliance requirements efficiently and effectively.</p>
                            <h2>Key Features</h2>
                            <ul>
                                <li>Role-based access control</li>
                                <li>Automated compliance tracking</li>
                                <li>Document management</li>
                                <li>Audit preparation</li>
                                <li>Reporting and analytics</li>
                            </ul>
                        `,
                        lastUpdated: '2025-01-15',
                        author: 'System Admin'
                    },
                    {
                        id: 'first-login',
                        title: 'Your First Login',
                        excerpt: 'How to log in and set up your account',
                        content: `
                            <h1>Your First Login</h1>
                            <p>Follow these steps to log in to the Angkor Compliance Platform for the first time.</p>
                            <h2>Step 1: Access the Platform</h2>
                            <p>Navigate to the login page and enter your credentials provided by your administrator.</p>
                            <h2>Step 2: Set Up Your Profile</h2>
                            <p>Complete your profile information and set your preferences.</p>
                            <h2>Step 3: Explore Your Dashboard</h2>
                            <p>Familiarize yourself with your role-specific dashboard and available features.</p>
                        `,
                        lastUpdated: '2025-01-15',
                        author: 'System Admin'
                    }
                ]
            },
            {
                id: 'user-roles',
                title: 'User Roles',
                description: 'Understand different user roles and permissions',
                icon: 'users',
                articles: [
                    {
                        id: 'worker-role',
                        title: 'Worker Portal',
                        excerpt: 'Learn how to use the worker portal',
                        content: `
                            <h1>Worker Portal</h1>
                            <p>The worker portal is designed for factory workers to access their compliance information and submit reports.</p>
                            <h2>Available Features</h2>
                            <ul>
                                <li>View personal compliance status</li>
                                <li>Submit incident reports</li>
                                <li>Access training materials</li>
                                <li>View work schedules</li>
                            </ul>
                        `,
                        lastUpdated: '2025-01-15',
                        author: 'System Admin'
                    },
                    {
                        id: 'admin-role',
                        title: 'Factory Admin Role',
                        excerpt: 'Manage your factory compliance from the admin dashboard',
                        content: `
                            <h1>Factory Admin Role</h1>
                            <p>Factory administrators have access to comprehensive management tools for overseeing compliance across their facility.</p>
                            <h2>Management Features</h2>
                            <ul>
                                <li>Worker management</li>
                                <li>Compliance monitoring</li>
                                <li>Report generation</li>
                                <li>Audit preparation</li>
                            </ul>
                        `,
                        lastUpdated: '2025-01-15',
                        author: 'System Admin'
                    }
                ]
            },
            {
                id: 'compliance',
                title: 'Compliance Management',
                description: 'Manage your factory compliance requirements',
                icon: 'shield-check',
                articles: [
                    {
                        id: 'compliance-overview',
                        title: 'Compliance Overview',
                        excerpt: 'Understanding compliance requirements',
                        content: `
                            <h1>Compliance Overview</h1>
                            <p>Learn about the compliance requirements for factories in Cambodia and how the platform helps you meet them.</p>
                            <h2>Key Compliance Areas</h2>
                            <ul>
                                <li>Labor standards</li>
                                <li>Health and safety</li>
                                <li>Environmental regulations</li>
                                <li>Documentation requirements</li>
                            </ul>
                        `,
                        lastUpdated: '2025-01-15',
                        author: 'System Admin'
                    }
                ]
            },
            {
                id: 'troubleshooting',
                title: 'Troubleshooting',
                description: 'Common issues and solutions',
                icon: 'wrench',
                articles: [
                    {
                        id: 'login-issues',
                        title: 'Login Issues',
                        excerpt: 'Troubleshoot common login problems',
                        content: `
                            <h1>Login Issues</h1>
                            <p>If you're having trouble logging in, try these solutions:</p>
                            <h2>Common Solutions</h2>
                            <ul>
                                <li>Check your username and password</li>
                                <li>Clear your browser cache</li>
                                <li>Try a different browser</li>
                                <li>Contact your administrator</li>
                            </ul>
                        `,
                        lastUpdated: '2025-01-15',
                        author: 'System Admin'
                    }
                ]
            }
        ];
        this.contactMethods = [
            {
                id: 'email',
                title: 'Email Support',
                description: 'support@angkorcompliance.com',
                icon: 'mail',
                action: 'mailto:support@angkorcompliance.com'
            },
            {
                id: 'phone',
                title: 'Phone Support',
                description: '+855 23 123 456',
                icon: 'phone',
                action: 'tel:+85523123456'
            },
            {
                id: 'chat',
                title: 'Live Chat',
                description: 'Available 24/7',
                icon: 'message-circle',
                action: 'chat'
            }
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createHelpModal();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        document.addEventListener('click', (e) => this.handleClick(e));
    }

    createHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'help-support';
        modal.innerHTML = this.renderHelpModal();
        document.body.appendChild(modal);
        this.helpModal = modal;
    }

    renderHelpModal() {
        return `
            <div class="help-support-content">
                <div class="help-support-header">
                    <h2 class="help-support-title">Help & Support</h2>
                    <button class="help-support-close" data-action="close">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="help-support-body">
                    <div class="help-support-sidebar">
                        <div class="help-support-search">
                            <input type="text" class="help-support-search-input" placeholder="Search help articles...">
                        </div>
                        <div class="help-support-categories">
                            ${this.categories.map(category => this.renderCategory(category)).join('')}
                        </div>
                    </div>
                    <div class="help-support-main">
                        <div class="help-support-articles">
                            ${this.renderArticles()}
                        </div>
                        <div class="help-support-contact">
                            <h3 class="help-support-contact-title">Need More Help?</h3>
                            <div class="help-support-contact-methods">
                                ${this.contactMethods.map(method => this.renderContactMethod(method)).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCategory(category) {
        return `
            <div class="help-support-category" data-category="${category.id}">
                <h3 class="help-support-category-title">${category.title}</h3>
                <p class="help-support-category-description">${category.description}</p>
            </div>
        `;
    }

    renderArticles() {
        return this.categories.map(category => 
            category.articles.map(article => this.renderArticle(article)).join('')
        ).join('');
    }

    renderArticle(article) {
        return `
            <div class="help-support-article" data-article="${article.id}">
                <h3 class="help-support-article-title">${article.title}</h3>
                <p class="help-support-article-excerpt">${article.excerpt}</p>
                <div class="help-support-article-meta">
                    <span>Last updated: ${article.lastUpdated}</span>
                    <span>•</span>
                    <span>By: ${article.author}</span>
                </div>
                <div class="help-support-article-content">
                    ${article.content}
                </div>
            </div>
        `;
    }

    renderContactMethod(method) {
        return `
            <div class="help-support-contact-method" data-method="${method.id}">
                <i class="help-support-contact-method-icon" data-lucide="${method.icon}"></i>
                <div>
                    <p class="help-support-contact-method-text">${method.title}</p>
                    <p class="help-support-contact-method-text">${method.description}</p>
                </div>
            </div>
        `;
    }

    show() {
        if (!this.helpModal) return;
        
        this.helpModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        this.triggerEvent('help-support:show');
    }

    hide() {
        if (!this.helpModal) return;
        
        this.helpModal.classList.remove('active');
        document.body.style.overflow = '';
        
        this.triggerEvent('help-support:hide');
    }

    selectCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;
        
        // Remove active class from all categories
        const categoryElements = this.helpModal.querySelectorAll('.help-support-category');
        categoryElements.forEach(element => element.classList.remove('active'));
        
        // Add active class to selected category
        const selectedCategory = this.helpModal.querySelector(`[data-category="${categoryId}"]`);
        if (selectedCategory) {
            selectedCategory.classList.add('active');
        }
        
        // Show articles for selected category
        this.showCategoryArticles(categoryId);
        
        this.triggerEvent('help-support:category:select', { category });
    }

    showCategoryArticles(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;
        
        // Hide all articles
        const articleElements = this.helpModal.querySelectorAll('.help-support-article');
        articleElements.forEach(element => element.style.display = 'none');
        
        // Show articles for selected category
        category.articles.forEach(article => {
            const articleElement = this.helpModal.querySelector(`[data-article="${article.id}"]`);
            if (articleElement) {
                articleElement.style.display = 'block';
            }
        });
    }

    selectArticle(articleId) {
        const article = this.findArticle(articleId);
        if (!article) return;
        
        // Hide all article content
        const contentElements = this.helpModal.querySelectorAll('.help-support-article-content');
        contentElements.forEach(element => element.classList.remove('active'));
        
        // Show selected article content
        const selectedContent = this.helpModal.querySelector(`[data-article="${articleId}"] .help-support-article-content`);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
        
        this.triggerEvent('help-support:article:select', { article });
    }

    findArticle(articleId) {
        for (const category of this.categories) {
            const article = category.articles.find(a => a.id === articleId);
            if (article) return article;
        }
        return null;
    }

    searchArticles(query) {
        if (!query.trim()) {
            this.showAllArticles();
            return;
        }
        
        const results = [];
        this.categories.forEach(category => {
            category.articles.forEach(article => {
                if (article.title.toLowerCase().includes(query.toLowerCase()) ||
                    article.excerpt.toLowerCase().includes(query.toLowerCase()) ||
                    article.content.toLowerCase().includes(query.toLowerCase())) {
                    results.push(article);
                }
            });
        });
        
        this.showSearchResults(results);
    }

    showAllArticles() {
        const articleElements = this.helpModal.querySelectorAll('.help-support-article');
        articleElements.forEach(element => element.style.display = 'block');
    }

    showSearchResults(results) {
        const articleElements = this.helpModal.querySelectorAll('.help-support-article');
        articleElements.forEach(element => {
            const articleId = element.getAttribute('data-article');
            const isResult = results.some(article => article.id === articleId);
            element.style.display = isResult ? 'block' : 'none';
        });
    }

    handleKeyboard(e) {
        if (!this.helpModal || !this.helpModal.classList.contains('active')) return;
        
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this.hide();
                break;
        }
    }

    handleClick(e) {
        if (!this.helpModal || !this.helpModal.classList.contains('active')) return;
        
        const action = e.target.getAttribute('data-action');
        if (action) {
            e.preventDefault();
            this.handleAction(action);
            return;
        }
        
        const category = e.target.closest('.help-support-category');
        if (category) {
            const categoryId = category.getAttribute('data-category');
            this.selectCategory(categoryId);
            return;
        }
        
        const article = e.target.closest('.help-support-article');
        if (article) {
            const articleId = article.getAttribute('data-article');
            this.selectArticle(articleId);
            return;
        }
        
        const contactMethod = e.target.closest('.help-support-contact-method');
        if (contactMethod) {
            const methodId = contactMethod.getAttribute('data-method');
            this.handleContactMethod(methodId);
            return;
        }
        
        // Close on overlay click
        if (e.target === this.helpModal) {
            this.hide();
        }
    }

    handleAction(action) {
        switch (action) {
            case 'close':
                this.hide();
                break;
        }
    }

    handleContactMethod(methodId) {
        const method = this.contactMethods.find(m => m.id === methodId);
        if (!method) return;
        
        switch (method.action) {
            case 'chat':
                this.openChat();
                break;
            default:
                window.open(method.action, '_blank');
                break;
        }
        
        this.triggerEvent('help-support:contact', { method });
    }

    openChat() {
        // Implement chat functionality
        this.triggerEvent('help-support:chat:open');
    }

    // Public Methods
    open() {
        this.show();
    }

    close() {
        this.hide();
    }

    getCategories() {
        return [...this.categories];
    }

    getArticles() {
        return this.categories.flatMap(category => category.articles);
    }

    getContactMethods() {
        return [...this.contactMethods];
    }

    // Utility Methods
    triggerEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    // Configuration
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    getConfig() {
        return { ...this.config };
    }

    // Cleanup
    destroy() {
        if (this.helpModal) {
            this.helpModal.remove();
            this.helpModal = null;
        }
    }
}

// Initialize help support manager
document.addEventListener('DOMContentLoaded', () => {
    window.helpSupportManager = new HelpSupportManager();
});

// Global access
window.HelpSupportManager = HelpSupportManager;
