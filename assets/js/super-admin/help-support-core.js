// Help & Support System Core for Super Admin
class HelpSupportCore {
    constructor() {
        this.currentUser = null;
        this.documentation = [];
        this.supportTickets = [];
        this.knowledgeBase = [];
        this.contactMethods = [];
        this.currentTab = 'documentation';
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        console.log('❓ Initializing Help & Support System Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ Help & Support System Core initialized');
    }
    
    async initializeFirebase() {
        try {
            if (window.Firebase) {
                this.auth = window.Firebase.auth;
                this.db = window.Firebase.db;
                this.doc = window.Firebase.doc;
                this.getDoc = window.Firebase.getDoc;
                this.collection = window.Firebase.collection;
                this.addDoc = window.Firebase.addDoc;
                this.updateDoc = window.Firebase.updateDoc;
                this.deleteDoc = window.Firebase.deleteDoc;
                this.query = window.Firebase.query;
                this.where = window.Firebase.where;
                this.orderBy = window.Firebase.orderBy;
                this.onSnapshot = window.Firebase.onSnapshot;
                this.getDocs = window.Firebase.getDocs;
                this.serverTimestamp = window.Firebase.serverTimestamp;
                console.log('✓ Firebase initialized successfully');
                return true;
            } else {
                console.log('⚠ Firebase not available, using local mode');
                return false;
            }
        } catch (error) {
            console.error('✗ Error initializing Firebase:', error);
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
        if (window.superAdminNavigation) {
            window.superAdminNavigation.updateCurrentPage('Help & Support');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadDocumentation(),
            this.loadSupportTickets(),
            this.loadKnowledgeBase(),
            this.loadContactMethods()
        ]);
        
        this.updateOverviewStats();
        this.renderDocumentation();
        this.renderSupportTickets();
        this.renderKnowledgeBase();
        this.renderContactMethods();
    }
    
    async loadDocumentation() {
        try {
            const documentationRef = this.collection(this.db, 'help_documentation');
            const snapshot = await this.getDocs(documentationRef);
            this.documentation = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.documentation.length === 0) {
                this.documentation = this.getMockDocumentation();
            }
            console.log(`✓ Loaded ${this.documentation.length} documentation items`);
        } catch (error) {
            console.error('Error loading documentation:', error);
            this.documentation = this.getMockDocumentation();
        }
    }
    
    async loadSupportTickets() {
        try {
            const ticketsRef = this.collection(this.db, 'support_tickets');
            const snapshot = await this.getDocs(ticketsRef);
            this.supportTickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.supportTickets.length === 0) {
                this.supportTickets = this.getMockSupportTickets();
            }
            console.log(`✓ Loaded ${this.supportTickets.length} support tickets`);
        } catch (error) {
            console.error('Error loading support tickets:', error);
            this.supportTickets = this.getMockSupportTickets();
        }
    }
    
    async loadKnowledgeBase() {
        try {
            const kbRef = this.collection(this.db, 'knowledge_base');
            const snapshot = await this.getDocs(kbRef);
            this.knowledgeBase = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.knowledgeBase.length === 0) {
                this.knowledgeBase = this.getMockKnowledgeBase();
            }
            console.log(`✓ Loaded ${this.knowledgeBase.length} knowledge base items`);
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            this.knowledgeBase = this.getMockKnowledgeBase();
        }
    }
    
    async loadContactMethods() {
        try {
            const contactRef = this.collection(this.db, 'contact_methods');
            const snapshot = await this.getDocs(contactRef);
            this.contactMethods = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.contactMethods.length === 0) {
                this.contactMethods = this.getMockContactMethods();
            }
            console.log(`✓ Loaded ${this.contactMethods.length} contact methods`);
        } catch (error) {
            console.error('Error loading contact methods:', error);
            this.contactMethods = this.getMockContactMethods();
        }
    }
    
    getMockDocumentation() {
        return [
            {
                id: 'doc_1',
                title: 'Getting Started with Angkor Compliance',
                description: 'Complete guide to setting up and configuring your compliance management system',
                category: 'guide',
                lastUpdated: new Date('2024-02-15'),
                views: 1250,
                rating: 4.8
            },
            {
                id: 'doc_2',
                title: 'Factory Registration Process',
                description: 'Step-by-step tutorial for registering new factories in the system',
                category: 'tutorial',
                lastUpdated: new Date('2024-02-14'),
                views: 890,
                rating: 4.6
            },
            {
                id: 'doc_3',
                title: 'User Management API Reference',
                description: 'Complete API documentation for user management endpoints and methods',
                category: 'reference',
                lastUpdated: new Date('2024-02-13'),
                views: 650,
                rating: 4.7
            },
            {
                id: 'doc_4',
                title: 'Common Issues and Solutions',
                description: 'Frequently asked questions and troubleshooting guide for common problems',
                category: 'faq',
                lastUpdated: new Date('2024-02-12'),
                views: 2100,
                rating: 4.5
            },
            {
                id: 'doc_5',
                title: 'Compliance Standards Configuration',
                description: 'How to configure and manage compliance standards for different industries',
                category: 'guide',
                lastUpdated: new Date('2024-02-11'),
                views: 750,
                rating: 4.9
            },
            {
                id: 'doc_6',
                title: 'Security Best Practices',
                description: 'Security guidelines and best practices for system administrators',
                category: 'guide',
                lastUpdated: new Date('2024-02-10'),
                views: 980,
                rating: 4.8
            },
            {
                id: 'doc_7',
                title: 'Backup and Recovery Procedures',
                description: 'Complete guide to system backup and disaster recovery procedures',
                category: 'tutorial',
                lastUpdated: new Date('2024-02-09'),
                views: 420,
                rating: 4.7
            },
            {
                id: 'doc_8',
                title: 'System Integration Guide',
                description: 'How to integrate third-party systems and APIs with Angkor Compliance',
                category: 'reference',
                lastUpdated: new Date('2024-02-08'),
                views: 320,
                rating: 4.6
            }
        ];
    }
    
    getMockSupportTickets() {
        return [
            {
                id: 'ticket_1',
                title: 'Unable to access factory management dashboard',
                content: 'I am getting a 403 error when trying to access the factory management section. This started happening after the latest update.',
                status: 'open',
                priority: 'high',
                category: 'technical',
                createdBy: 'John Smith',
                assignedTo: 'Support Team',
                createdAt: new Date('2024-02-15T10:30:00'),
                lastUpdated: new Date('2024-02-15T10:30:00'),
                responses: 0
            },
            {
                id: 'ticket_2',
                title: 'Compliance report generation is slow',
                content: 'The compliance report generation is taking much longer than usual. It used to take 2-3 minutes, now it takes 15+ minutes.',
                status: 'in-progress',
                priority: 'medium',
                category: 'performance',
                createdBy: 'Sarah Johnson',
                assignedTo: 'Technical Team',
                createdAt: new Date('2024-02-14T14:20:00'),
                lastUpdated: new Date('2024-02-15T09:15:00'),
                responses: 3
            },
            {
                id: 'ticket_3',
                title: 'User permissions not working correctly',
                content: 'Some users are able to access features they should not have permission for. The role-based access control seems to be malfunctioning.',
                status: 'resolved',
                priority: 'high',
                category: 'security',
                createdBy: 'Mike Chen',
                assignedTo: 'Security Team',
                createdAt: new Date('2024-02-13T16:45:00'),
                lastUpdated: new Date('2024-02-14T11:30:00'),
                responses: 5
            },
            {
                id: 'ticket_4',
                title: 'Backup system not running automatically',
                content: 'The automated backup system has not been running for the past 3 days. Manual backups work fine.',
                status: 'open',
                priority: 'medium',
                category: 'system',
                createdBy: 'Lisa Wang',
                assignedTo: 'System Admin',
                createdAt: new Date('2024-02-12T08:15:00'),
                lastUpdated: new Date('2024-02-12T08:15:00'),
                responses: 1
            },
            {
                id: 'ticket_5',
                title: 'Email notifications not being sent',
                content: 'Email notifications for compliance alerts are not being sent to users. The notification system shows they are queued but never sent.',
                status: 'in-progress',
                priority: 'high',
                category: 'communication',
                createdBy: 'David Brown',
                assignedTo: 'Communication Team',
                createdAt: new Date('2024-02-11T12:00:00'),
                lastUpdated: new Date('2024-02-15T08:45:00'),
                responses: 4
            },
            {
                id: 'ticket_6',
                title: 'Request for additional user licenses',
                content: 'We need to add 25 more user licenses to our subscription. Can you help us with the upgrade process?',
                status: 'resolved',
                priority: 'low',
                category: 'billing',
                createdBy: 'Emma Davis',
                assignedTo: 'Sales Team',
                createdAt: new Date('2024-02-10T09:30:00'),
                lastUpdated: new Date('2024-02-11T14:20:00'),
                responses: 2
            }
        ];
    }
    
    getMockKnowledgeBase() {
        return [
            {
                id: 'kb_1',
                name: 'System Administration',
                description: 'Guides and resources for system administrators',
                articleCount: 12,
                articles: [
                    'User Management Best Practices',
                    'System Configuration Guide',
                    'Security Settings Overview',
                    'Backup and Recovery Procedures'
                ]
            },
            {
                id: 'kb_2',
                name: 'Factory Management',
                description: 'Resources for managing factories and compliance',
                articleCount: 8,
                articles: [
                    'Factory Registration Process',
                    'Compliance Monitoring Setup',
                    'Audit Management Guide',
                    'Reporting and Analytics'
                ]
            },
            {
                id: 'kb_3',
                name: 'User Guide',
                description: 'User guides and tutorials for end users',
                articleCount: 15,
                articles: [
                    'Getting Started Tutorial',
                    'Dashboard Navigation',
                    'Creating Compliance Reports',
                    'Managing User Accounts'
                ]
            },
            {
                id: 'kb_4',
                name: 'Troubleshooting',
                description: 'Common issues and their solutions',
                articleCount: 20,
                articles: [
                    'Login Issues',
                    'Performance Problems',
                    'Data Sync Issues',
                    'Email Notification Problems'
                ]
            },
            {
                id: 'kb_5',
                name: 'API Documentation',
                description: 'Technical documentation for developers',
                articleCount: 6,
                articles: [
                    'Authentication API',
                    'User Management API',
                    'Factory Data API',
                    'Reporting API'
                ]
            },
            {
                id: 'kb_6',
                name: 'Security & Compliance',
                description: 'Security guidelines and compliance information',
                articleCount: 10,
                articles: [
                    'Security Best Practices',
                    'Data Protection Guidelines',
                    'Compliance Standards',
                    'Audit Requirements'
                ]
            }
        ];
    }
    
    getMockContactMethods() {
        return [
            {
                id: 'contact_1',
                name: 'Live Chat Support',
                description: 'Get instant help from our support team via live chat',
                status: 'available',
                availability: '24/7',
                responseTime: 'Immediate',
                contactInfo: 'Available in-app'
            },
            {
                id: 'contact_2',
                name: 'Email Support',
                description: 'Send detailed questions and receive comprehensive responses',
                status: 'available',
                availability: '24/7',
                responseTime: '2-4 hours',
                contactInfo: 'support@angkor-compliance.com'
            },
            {
                id: 'contact_3',
                name: 'Phone Support',
                description: 'Speak directly with our technical support team',
                status: 'available',
                availability: 'Mon-Fri 8AM-6PM',
                responseTime: 'Immediate',
                contactInfo: '+855 23 123 456'
            },
            {
                id: 'contact_4',
                name: 'Video Call Support',
                description: 'Schedule a video call for complex technical issues',
                status: 'available',
                availability: 'By appointment',
                responseTime: '24 hours',
                contactInfo: 'Schedule via support portal'
            },
            {
                id: 'contact_5',
                name: 'Remote Desktop Support',
                description: 'Allow our team to access your system for direct assistance',
                status: 'busy',
                availability: 'Mon-Fri 9AM-5PM',
                responseTime: '1-2 hours',
                contactInfo: 'Request via support ticket'
            },
            {
                id: 'contact_6',
                name: 'On-site Support',
                description: 'In-person support for critical system issues',
                status: 'available',
                availability: 'By appointment',
                responseTime: '48-72 hours',
                contactInfo: 'Contact sales team'
            }
        ];
    }
    
    updateOverviewStats() {
        const totalDocs = this.documentation.length;
        const openTickets = this.supportTickets.filter(t => t.status === 'open').length;
        const resolvedTickets = this.supportTickets.filter(t => t.status === 'resolved').length;
        const avgResponseTime = this.calculateAverageResponseTime();
        
        document.getElementById('totalDocumentation').textContent = totalDocs;
        document.getElementById('openTickets').textContent = openTickets;
        document.getElementById('resolvedTickets').textContent = resolvedTickets;
        document.getElementById('avgResponseTime').textContent = avgResponseTime;
    }
    
    calculateAverageResponseTime() {
        const resolvedTickets = this.supportTickets.filter(t => t.status === 'resolved');
        if (resolvedTickets.length === 0) return 'N/A';
        
        const totalTime = resolvedTickets.reduce((sum, ticket) => {
            const created = new Date(ticket.createdAt);
            const resolved = new Date(ticket.lastUpdated);
            return sum + (resolved - created);
        }, 0);
        
        const avgTime = totalTime / resolvedTickets.length;
        const hours = Math.round(avgTime / (1000 * 60 * 60) * 10) / 10;
        return `${hours}h`;
    }
    
    renderDocumentation() {
        const container = document.getElementById('documentationGrid');
        if (!container) return;
        
        container.innerHTML = this.documentation.map(doc => `
            <div class="doc-item" onclick="viewDocumentation('${doc.id}')">
                <div class="doc-header">
                    <div class="doc-title">${doc.title}</div>
                    <div class="doc-category ${doc.category}">${doc.category}</div>
                </div>
                <div class="doc-description">${doc.description}</div>
                <div class="doc-meta">
                    <span>Updated: ${this.formatDate(doc.lastUpdated)}</span>
                    <span>Views: ${doc.views} | Rating: ${doc.rating}/5</span>
                </div>
            </div>
        `).join('');
    }
    
    renderSupportTickets() {
        const container = document.getElementById('ticketList');
        if (!container) return;
        
        if (this.supportTickets.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: var(--space-8); color: var(--neutral-500);">
                    <i data-lucide="ticket" style="width: 48px; height: 48px; margin: 0 auto var(--space-4); display: block;"></i>
                    <p>No support tickets found</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }
        
        container.innerHTML = this.supportTickets.map(ticket => `
            <div class="ticket-item ${ticket.status}" onclick="viewTicket('${ticket.id}')">
                <div class="ticket-header">
                    <div class="ticket-title">${ticket.title}</div>
                    <div class="ticket-id">#${ticket.id}</div>
                </div>
                <div class="ticket-content">${ticket.content}</div>
                <div class="ticket-meta">
                    <div class="ticket-status ${ticket.status}">${ticket.status}</div>
                    <div class="ticket-actions">
                        <button class="ticket-action-btn" onclick="event.stopPropagation(); assignTicket('${ticket.id}')">
                            Assign
                        </button>
                        <button class="ticket-action-btn" onclick="event.stopPropagation(); updateTicketStatus('${ticket.id}')">
                            Update
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    renderKnowledgeBase() {
        const container = document.getElementById('kbCategories');
        if (!container) return;
        
        container.innerHTML = this.knowledgeBase.map(category => `
            <div class="kb-category" onclick="viewKnowledgeCategory('${category.id}')">
                <div class="kb-category-header">
                    <div class="kb-category-name">${category.name}</div>
                    <div class="kb-category-count">${category.articleCount}</div>
                </div>
                <div class="kb-category-description">${category.description}</div>
                <div class="kb-category-articles">
                    ${category.articles.slice(0, 3).map(article => `
                        <div class="kb-article" onclick="event.stopPropagation(); viewArticle('${article}')">
                            ${article}
                        </div>
                    `).join('')}
                    ${category.articles.length > 3 ? `
                        <div class="kb-article" style="color: var(--primary-600); font-weight: 500;">
                            +${category.articles.length - 3} more articles
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
    
    renderContactMethods() {
        const container = document.getElementById('contactMethods');
        if (!container) return;
        
        container.innerHTML = this.contactMethods.map(method => `
            <div class="contact-method">
                <div class="contact-method-header">
                    <div class="contact-method-name">${method.name}</div>
                    <div class="contact-method-status ${method.status}">${method.status}</div>
                </div>
                <div class="contact-method-description">${method.description}</div>
                <div style="margin-bottom: var(--space-3);">
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        <strong>Availability:</strong> ${method.availability}
                    </div>
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        <strong>Response Time:</strong> ${method.responseTime}
                    </div>
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        <strong>Contact:</strong> ${method.contactInfo}
                    </div>
                </div>
                <div class="contact-method-actions">
                    <button class="contact-btn" onclick="initiateContact('${method.id}')">Contact</button>
                    <button class="contact-btn" onclick="scheduleContact('${method.id}')">Schedule</button>
                </div>
            </div>
        `).join('');
    }
    
    formatDate(date) {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString();
    }
    
    initializeUI() {
        // Initialize any UI components
    }
    
    setupEventListeners() {
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        window.createTicket = () => this.createTicket();
        window.searchKnowledgeBase = () => this.searchKnowledgeBase();
        window.refreshHelp = () => this.refreshHelp();
        window.exportTickets = () => this.exportTickets();
        window.switchTab = (tabName) => this.switchTab(tabName);
        window.viewDocumentation = (docId) => this.viewDocumentation(docId);
        window.viewTicket = (ticketId) => this.viewTicket(ticketId);
        window.assignTicket = (ticketId) => this.assignTicket(ticketId);
        window.updateTicketStatus = (ticketId) => this.updateTicketStatus(ticketId);
        window.viewKnowledgeCategory = (categoryId) => this.viewKnowledgeCategory(categoryId);
        window.viewArticle = (articleName) => this.viewArticle(articleName);
        window.initiateContact = (methodId) => this.initiateContact(methodId);
        window.scheduleContact = (methodId) => this.scheduleContact(methodId);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const documentationRef = this.collection(this.db, 'help_documentation');
        this.onSnapshot(documentationRef, (snapshot) => {
            this.documentation = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderDocumentation();
        });
        
        const ticketsRef = this.collection(this.db, 'support_tickets');
        this.onSnapshot(ticketsRef, (snapshot) => {
            this.supportTickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderSupportTickets();
        });
        
        const kbRef = this.collection(this.db, 'knowledge_base');
        this.onSnapshot(kbRef, (snapshot) => {
            this.knowledgeBase = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderKnowledgeBase();
        });
        
        const contactRef = this.collection(this.db, 'contact_methods');
        this.onSnapshot(contactRef, (snapshot) => {
            this.contactMethods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderContactMethods();
        });
    }
    
    // Utility methods
    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-500)' : 
                        type === 'error' ? 'var(--error-500)' : 
                        type === 'warning' ? 'var(--warning-500)' : 'var(--info-500)'};
            color: white;
            padding: var(--space-4);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    window.helpSupportCore = new HelpSupportCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HelpSupportCore;
}
