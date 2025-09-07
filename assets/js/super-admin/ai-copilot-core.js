// AI Copilot Core System for Super Admin
class AICopilotCore {
    constructor() {
        this.currentUser = null;
        this.chatMessages = [];
        this.recommendations = [];
        this.insights = [];
        this.automation = [];
        this.isTyping = false;
        this.aiStatus = 'online';
        
        this.init();
    }
    
    async init() {
        console.log('🤖 Initializing AI Copilot Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ AI Copilot Core initialized');
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
            window.superAdminNavigation.updateCurrentPage('AI Copilot');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadRecommendations(),
            this.loadInsights(),
            this.loadAutomation()
        ]);
        
        this.renderRecommendations();
        this.renderInsights();
        this.renderAutomation();
    }
    
    async loadRecommendations() {
        try {
            const recommendationsRef = this.collection(this.db, 'ai_recommendations');
            const snapshot = await this.getDocs(recommendationsRef);
            this.recommendations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.recommendations.length === 0) {
                this.recommendations = this.getMockRecommendations();
            }
            console.log(`✓ Loaded ${this.recommendations.length} AI recommendations`);
        } catch (error) {
            console.error('Error loading recommendations:', error);
            this.recommendations = this.getMockRecommendations();
        }
    }
    
    async loadInsights() {
        try {
            const insightsRef = this.collection(this.db, 'ai_insights');
            const snapshot = await this.getDocs(insightsRef);
            this.insights = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.insights.length === 0) {
                this.insights = this.getMockInsights();
            }
            console.log(`✓ Loaded ${this.insights.length} AI insights`);
        } catch (error) {
            console.error('Error loading insights:', error);
            this.insights = this.getMockInsights();
        }
    }
    
    async loadAutomation() {
        try {
            const automationRef = this.collection(this.db, 'ai_automation');
            const snapshot = await this.getDocs(automationRef);
            this.automation = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.automation.length === 0) {
                this.automation = this.getMockAutomation();
            }
            console.log(`✓ Loaded ${this.automation.length} AI automation rules`);
        } catch (error) {
            console.error('Error loading automation:', error);
            this.automation = this.getMockAutomation();
        }
    }
    
    getMockRecommendations() {
        return [
            {
                id: 'rec_1',
                title: 'Optimize Database Performance',
                priority: 'high',
                description: 'Database queries are taking longer than expected. Consider implementing query optimization and indexing strategies.',
                category: 'Performance',
                impact: 'High',
                effort: 'Medium',
                estimatedSavings: '$2,500/month',
                lastAnalyzed: new Date('2024-02-15')
            },
            {
                id: 'rec_2',
                title: 'Implement Automated Backup Verification',
                priority: 'medium',
                description: 'Current backup system lacks verification. Implement automated backup testing to ensure data integrity.',
                category: 'Security',
                impact: 'High',
                effort: 'Low',
                estimatedSavings: '$1,200/month',
                lastAnalyzed: new Date('2024-02-14')
            },
            {
                id: 'rec_3',
                title: 'Enable Multi-Factor Authentication',
                priority: 'high',
                description: 'Several user accounts lack MFA protection. Enable MFA for all administrative accounts.',
                category: 'Security',
                impact: 'Critical',
                effort: 'Low',
                estimatedSavings: 'Risk Reduction',
                lastAnalyzed: new Date('2024-02-13')
            },
            {
                id: 'rec_4',
                title: 'Optimize Compliance Reporting',
                priority: 'low',
                description: 'Compliance reports can be automated to reduce manual effort and improve accuracy.',
                category: 'Compliance',
                impact: 'Medium',
                effort: 'Medium',
                estimatedSavings: '$800/month',
                lastAnalyzed: new Date('2024-02-12')
            },
            {
                id: 'rec_5',
                title: 'Implement Smart Caching',
                priority: 'medium',
                description: 'Implement intelligent caching for frequently accessed data to improve system performance.',
                category: 'Performance',
                impact: 'Medium',
                effort: 'High',
                estimatedSavings: '$1,500/month',
                lastAnalyzed: new Date('2024-02-11')
            },
            {
                id: 'rec_6',
                title: 'Automate User Provisioning',
                priority: 'low',
                description: 'User account creation and management can be automated to reduce administrative overhead.',
                category: 'Efficiency',
                impact: 'Low',
                effort: 'Medium',
                estimatedSavings: '$600/month',
                lastAnalyzed: new Date('2024-02-10')
            }
        ];
    }
    
    getMockInsights() {
        return [
            {
                id: 'insight_1',
                title: 'System Performance',
                type: 'success',
                description: 'Overall system performance is excellent with 99.9% uptime',
                value: '99.9%',
                trend: 'up',
                lastUpdated: new Date('2024-02-15')
            },
            {
                id: 'insight_2',
                title: 'Compliance Score',
                type: 'success',
                description: 'Average compliance score across all factories',
                value: '94%',
                trend: 'up',
                lastUpdated: new Date('2024-02-15')
            },
            {
                id: 'insight_3',
                title: 'Security Alerts',
                type: 'warning',
                description: 'Number of security alerts requiring attention',
                value: '3',
                trend: 'down',
                lastUpdated: new Date('2024-02-15')
            },
            {
                id: 'insight_4',
                title: 'User Activity',
                type: 'info',
                description: 'Active users in the last 24 hours',
                value: '247',
                trend: 'up',
                lastUpdated: new Date('2024-02-15')
            },
            {
                id: 'insight_5',
                title: 'Data Usage',
                type: 'info',
                description: 'Storage utilization across all factories',
                value: '68%',
                trend: 'up',
                lastUpdated: new Date('2024-02-15')
            },
            {
                id: 'insight_6',
                title: 'Audit Completion',
                type: 'success',
                description: 'Percentage of audits completed on time',
                value: '87%',
                trend: 'up',
                lastUpdated: new Date('2024-02-15')
            }
        ];
    }
    
    getMockAutomation() {
        return [
            {
                id: 'auto_1',
                name: 'Automated Compliance Monitoring',
                status: 'active',
                description: 'Continuously monitors compliance metrics and generates alerts for deviations',
                triggers: ['Daily', 'Real-time'],
                lastExecuted: new Date('2024-02-15'),
                successRate: 98
            },
            {
                id: 'auto_2',
                name: 'Smart Backup Scheduling',
                status: 'active',
                description: 'Intelligently schedules backups based on system usage patterns',
                triggers: ['Weekly', 'Usage-based'],
                lastExecuted: new Date('2024-02-14'),
                successRate: 100
            },
            {
                id: 'auto_3',
                name: 'Performance Optimization',
                status: 'inactive',
                description: 'Automatically optimizes system performance based on usage patterns',
                triggers: ['Hourly', 'Load-based'],
                lastExecuted: new Date('2024-02-10'),
                successRate: 95
            },
            {
                id: 'auto_4',
                name: 'Security Threat Detection',
                status: 'active',
                description: 'Monitors system for security threats and automatically responds',
                triggers: ['Real-time', 'Event-based'],
                lastExecuted: new Date('2024-02-15'),
                successRate: 99
            },
            {
                id: 'auto_5',
                name: 'User Access Management',
                status: 'active',
                description: 'Automatically manages user access based on role changes and inactivity',
                triggers: ['Daily', 'Event-based'],
                lastExecuted: new Date('2024-02-15'),
                successRate: 97
            },
            {
                id: 'auto_6',
                name: 'Report Generation',
                status: 'inactive',
                description: 'Automatically generates and distributes compliance reports',
                triggers: ['Monthly', 'Scheduled'],
                lastExecuted: new Date('2024-01-31'),
                successRate: 92
            }
        ];
    }
    
    renderRecommendations() {
        const recommendationsGrid = document.getElementById('recommendationsGrid');
        if (!recommendationsGrid) return;
        
        recommendationsGrid.innerHTML = this.recommendations.map(recommendation => `
            <div class="recommendation-item">
                <div class="recommendation-header">
                    <div class="recommendation-title">${recommendation.title}</div>
                    <div class="recommendation-priority ${recommendation.priority}">${recommendation.priority}</div>
                </div>
                <div class="recommendation-description">${recommendation.description}</div>
                <div style="margin-bottom: var(--space-3);">
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        <strong>Category:</strong> ${recommendation.category} | 
                        <strong>Impact:</strong> ${recommendation.impact} | 
                        <strong>Effort:</strong> ${recommendation.effort}
                    </div>
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        <strong>Estimated Savings:</strong> ${recommendation.estimatedSavings}
                    </div>
                </div>
                <div class="recommendation-actions">
                    <button class="recommendation-btn" onclick="viewRecommendation('${recommendation.id}')">
                        <i data-lucide="eye"></i>
                        View Details
                    </button>
                    <button class="recommendation-btn primary" onclick="implementRecommendation('${recommendation.id}')">
                        <i data-lucide="check"></i>
                        Implement
                    </button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    renderInsights() {
        const insightsGrid = document.getElementById('insightsGrid');
        if (!insightsGrid) return;
        
        insightsGrid.innerHTML = this.insights.map(insight => `
            <div class="insight-item">
                <div class="insight-header">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-icon ${insight.type}">
                        <i data-lucide="${this.getInsightIcon(insight.type)}"></i>
                    </div>
                </div>
                <div class="insight-description">${insight.description}</div>
                <div class="insight-value">${insight.value}</div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    renderAutomation() {
        const automationGrid = document.getElementById('automationGrid');
        if (!automationGrid) return;
        
        automationGrid.innerHTML = this.automation.map(automation => `
            <div class="automation-item">
                <div class="automation-header-item">
                    <div class="automation-name">${automation.name}</div>
                    <div class="automation-status ${automation.status}">${automation.status}</div>
                </div>
                <div class="automation-description">${automation.description}</div>
                <div style="margin-bottom: var(--space-3);">
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        <strong>Triggers:</strong> ${automation.triggers.join(', ')}
                    </div>
                    <div style="font-size: var(--text-xs); color: var(--neutral-600);">
                        <strong>Success Rate:</strong> ${automation.successRate}% | 
                        <strong>Last Executed:</strong> ${this.formatDate(automation.lastExecuted)}
                    </div>
                </div>
                <div class="automation-actions">
                    <button class="automation-btn" onclick="configureAutomation('${automation.id}')">
                        <i data-lucide="settings"></i>
                        Configure
                    </button>
                    <button class="automation-btn" onclick="toggleAutomation('${automation.id}')">
                        <i data-lucide="${automation.status === 'active' ? 'pause' : 'play'}"></i>
                        ${automation.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    getInsightIcon(type) {
        const icons = {
            'success': 'check-circle',
            'warning': 'alert-triangle',
            'danger': 'x-circle',
            'info': 'info'
        };
        return icons[type] || 'info';
    }
    
    async sendMessage(message) {
        if (!message.trim()) return;
        
        // Add user message to chat
        this.addMessage('user', message);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate AI response
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateAIResponse(message);
            this.addMessage('ai', response);
        }, 2000);
    }
    
    addMessage(sender, content) {
        const message = {
            id: Date.now(),
            sender,
            content,
            timestamp: new Date()
        };
        
        this.chatMessages.push(message);
        this.renderChatMessages();
    }
    
    renderChatMessages() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        chatMessages.innerHTML = this.chatMessages.map(message => `
            <div class="message ${message.sender}">
                <div class="message-avatar ${message.sender}">${message.sender === 'user' ? 'U' : 'AI'}</div>
                <div class="message-content">${message.content}</div>
            </div>
        `).join('');
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typingIndicator';
        typingIndicator.className = 'message ai';
        typingIndicator.innerHTML = `
            <div class="message-avatar ai">AI</div>
            <div class="typing-indicator">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    generateAIResponse(userMessage) {
        const responses = {
            'hello': 'Hello! I\'m your AI assistant. I can help you with system administration, compliance management, and provide intelligent recommendations. How can I assist you today?',
            'help': 'I can help you with:\n• System performance optimization\n• Compliance monitoring and reporting\n• Security recommendations\n• Automated task management\n• Data analysis and insights\n\nWhat would you like to know more about?',
            'performance': 'Based on current system metrics, I recommend:\n1. Optimizing database queries (High Priority)\n2. Implementing smart caching (Medium Priority)\n3. Reviewing resource allocation\n\nWould you like me to provide detailed recommendations?',
            'security': 'Security analysis shows:\n• 3 high-priority security alerts\n• MFA not enabled for 12 users\n• 2 outdated security policies\n\nI recommend implementing the security recommendations in the dashboard.',
            'compliance': 'Compliance status:\n• Overall score: 94%\n• 87% of audits completed on time\n• 3 factories need attention\n\nWould you like me to generate a detailed compliance report?',
            'backup': 'Backup system status:\n• Last backup: 2 hours ago\n• Success rate: 100%\n• Storage utilization: 68%\n\nI recommend implementing automated backup verification.',
            'users': 'User management insights:\n• 247 active users in last 24h\n• 12 users need MFA setup\n• 3 inactive accounts to review\n\nWould you like me to help with user management tasks?'
        };
        
        const lowerMessage = userMessage.toLowerCase();
        
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }
        
        return 'I understand you\'re asking about "' + userMessage + '". I can help you with system administration, compliance management, performance optimization, security, and automation. Could you be more specific about what you\'d like assistance with?';
    }
    
    initializeUI() {
        // Initialize chat interface
        this.initializeChatInterface();
    }
    
    initializeChatInterface() {
        // Add initial AI message if no messages exist
        if (this.chatMessages.length === 0) {
            this.addMessage('ai', 'Hello! I\'m your AI assistant. I can help you with system administration, compliance management, and provide intelligent recommendations. How can I assist you today?');
        }
    }
    
    setupEventListeners() {
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        window.refreshAI = () => this.refreshAI();
        window.configureAI = () => this.configureAI();
        window.sendMessage = () => this.sendMessage();
        window.refreshRecommendations = () => this.refreshRecommendations();
        window.configureRecommendations = () => this.configureRecommendations();
        window.viewRecommendation = (recommendationId) => this.viewRecommendation(recommendationId);
        window.implementRecommendation = (recommendationId) => this.implementRecommendation(recommendationId);
        window.configureAutomation = (automationId) => this.configureAutomation(automationId);
        window.toggleAutomation = (automationId) => this.toggleAutomation(automationId);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const recommendationsRef = this.collection(this.db, 'ai_recommendations');
        this.onSnapshot(recommendationsRef, (snapshot) => {
            this.recommendations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderRecommendations();
        });
        
        const insightsRef = this.collection(this.db, 'ai_insights');
        this.onSnapshot(insightsRef, (snapshot) => {
            this.insights = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderInsights();
        });
        
        const automationRef = this.collection(this.db, 'ai_automation');
        this.onSnapshot(automationRef, (snapshot) => {
            this.automation = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderAutomation();
        });
    }
    
    // Utility methods
    formatDate(date) {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString();
    }
    
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
    window.aiCopilotCore = new AICopilotCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AICopilotCore;
}
