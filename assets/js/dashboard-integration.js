// Comprehensive Dashboard Integration for Angkor Compliance Platform
// Integrates analytics, standards, AI copilot, and all core modules into unified dashboards

class DashboardIntegration {
    constructor() {
        this.db = window.Firebase?.db;
        this.isInitialized = false;
        this.currentUser = null;
        this.currentFactory = null;
        this.dashboardData = new Map();
        this.realTimeUpdates = new Map();
        
        this.initializeDashboardIntegration();
    }

    async initializeDashboardIntegration() {
        try {
            console.log('📊 Initializing Comprehensive Dashboard Integration...');
            
            // Initialize user context
            await this.initializeUserContext();
            
            // Initialize dashboard components
            await this.initializeDashboardComponents();
            
            // Set up real-time data streams
            this.setupRealTimeDataStreams();
            
            // Initialize AI copilot integration
            this.initializeAICopilotIntegration();
            
            this.isInitialized = true;
            console.log('✅ Comprehensive Dashboard Integration initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Dashboard Integration:', error);
        }
    }

    async initializeUserContext() {
        try {
            const user = window.Firebase?.auth?.currentUser;
            if (!user) {
                throw new Error('No authenticated user found');
            }

            const userDoc = await this.db.collection('users').doc(user.uid).get();
            if (!userDoc.exists) {
                throw new Error('User profile not found');
            }

            this.currentUser = { uid: user.uid, ...userDoc.data() };
            
            // Set current factory for factory-specific users
            if (this.currentUser.factoryId) {
                const factoryDoc = await this.db.collection('factories').doc(this.currentUser.factoryId).get();
                if (factoryDoc.exists) {
                    this.currentFactory = { id: factoryDoc.id, ...factoryDoc.data() };
                }
            }

            console.log(`✅ User context initialized: ${this.currentUser.role} - ${this.currentUser.name}`);
            
        } catch (error) {
            console.error('❌ Error initializing user context:', error);
        }
    }

    async initializeDashboardComponents() {
        try {
            // Initialize analytics engine
            if (window.comprehensiveAnalyticsEngine) {
                await window.comprehensiveAnalyticsEngine.initializeAnalyticsEngine();
            }

            // Initialize standards registry
            if (window.standardsRegistry) {
                await window.standardsRegistry.initializeStandardsRegistry();
            }

            // Initialize audit framework templates
            if (window.auditFrameworkTemplates) {
                await window.auditFrameworkTemplates.initializeAuditFrameworks();
            }

            // Initialize AI copilot
            if (window.AICopilot) {
                await window.AICopilot.initializeCopilot();
            }

            console.log('✅ Dashboard components initialized');
            
        } catch (error) {
            console.error('❌ Error initializing dashboard components:', error);
        }
    }

    setupRealTimeDataStreams() {
        try {
            // Set up real-time factory data
            if (this.currentFactory) {
                this.setupFactoryDataStream();
            }

            // Set up real-time CAP data
            this.setupCAPDataStream();

            // Set up real-time grievance data
            this.setupGrievanceDataStream();

            // Set up real-time document data
            this.setupDocumentDataStream();

            console.log('✅ Real-time data streams established');
            
        } catch (error) {
            console.error('❌ Error setting up real-time data streams:', error);
        }
    }

    setupFactoryDataStream() {
        const factoryRef = this.db.collection('factories').doc(this.currentFactory.id);
        
        this.realTimeUpdates.set('factory', 
            factoryRef.onSnapshot((doc) => {
                if (doc.exists) {
                    this.currentFactory = { id: doc.id, ...doc.data() };
                    this.updateFactoryDashboard();
                }
            })
        );
    }

    setupCAPDataStream() {
        const capsRef = this.db.collection('caps')
            .where('factoryId', '==', this.currentFactory?.id || '');
        
        this.realTimeUpdates.set('caps',
            capsRef.onSnapshot((snapshot) => {
                const caps = [];
                snapshot.forEach(doc => {
                    caps.push({ id: doc.id, ...doc.data() });
                });
                this.updateCAPDashboard(caps);
            })
        );
    }

    setupGrievanceDataStream() {
        const grievancesRef = this.db.collection('grievance_cases')
            .where('factoryId', '==', this.currentFactory?.id || '');
        
        this.realTimeUpdates.set('grievances',
            grievancesRef.onSnapshot((snapshot) => {
                const grievances = [];
                snapshot.forEach(doc => {
                    grievances.push({ id: doc.id, ...doc.data() });
                });
                this.updateGrievanceDashboard(grievances);
            })
        );
    }

    setupDocumentDataStream() {
        const documentsRef = this.db.collection('documents')
            .where('factoryId', '==', this.currentFactory?.id || '');
        
        this.realTimeUpdates.set('documents',
            documentsRef.onSnapshot((snapshot) => {
                const documents = [];
                snapshot.forEach(doc => {
                    documents.push({ id: doc.id, ...doc.data() });
                });
                this.updateDocumentDashboard(documents);
            })
        );
    }

    initializeAICopilotIntegration() {
        try {
            // Add AI copilot to dashboard
            this.addAICopilotToDashboard();
            
            // Set up AI copilot event listeners
            this.setupAICopilotEventListeners();
            
            console.log('✅ AI Copilot integration initialized');
            
        } catch (error) {
            console.error('❌ Error initializing AI Copilot integration:', error);
        }
    }

    addAICopilotToDashboard() {
        // Create AI copilot widget
        const copilotWidget = this.createAICopilotWidget();
        
        // Add to dashboard
        const dashboardContainer = document.getElementById('dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.appendChild(copilotWidget);
        }
    }

    createAICopilotWidget() {
        const widget = document.createElement('div');
        widget.className = 'ai-copilot-widget';
        widget.innerHTML = `
            <div class="widget-header">
                <h3>🤖 AI Compliance Assistant</h3>
                <button class="minimize-btn" onclick="toggleAICopilot()">−</button>
            </div>
            <div class="widget-content">
                <div class="chat-container" id="ai-chat-container">
                    <div class="welcome-message">
                        <p>Hello! I'm your AI compliance assistant. How can I help you today?</p>
                        <div class="quick-actions">
                            <button onclick="askAICopilot('Generate CAP for safety violation')">Generate CAP</button>
                            <button onclick="askAICopilot('Explain SMETA requirements')">Explain Standards</button>
                            <button onclick="askAICopilot('Check audit readiness')">Audit Readiness</button>
                            <button onclick="askAICopilot('Risk assessment')">Risk Assessment</button>
                        </div>
                    </div>
                </div>
                <div class="input-container">
                    <input type="text" id="ai-question-input" placeholder="Ask me anything about compliance..." />
                    <button onclick="submitAICopilotQuestion()">Ask</button>
                </div>
            </div>
        `;
        
        return widget;
    }

    setupAICopilotEventListeners() {
        // Enter key listener for AI copilot
        const input = document.getElementById('ai-question-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    submitAICopilotQuestion();
                }
            });
        }
    }

    // Dashboard Update Methods
    async updateFactoryDashboard() {
        try {
            if (!this.currentFactory) return;

            // Update factory overview
            this.updateFactoryOverview();
            
            // Update compliance metrics
            await this.updateComplianceMetrics();
            
            // Update risk heatmap
            await this.updateRiskHeatmap();
            
            // Update KPI dashboard
            await this.updateKPIDashboard();
            
        } catch (error) {
            console.error('❌ Error updating factory dashboard:', error);
        }
    }

    updateFactoryOverview() {
        const overviewElements = {
            'factory-name': this.currentFactory.name,
            'factory-status': this.currentFactory.status,
            'employee-count': this.currentFactory.employeeCount,
            'compliance-score': this.currentFactory.complianceScore || 0,
            'industry-type': this.currentFactory.industry
        };

        Object.entries(overviewElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    async updateComplianceMetrics() {
        try {
            if (!window.comprehensiveAnalyticsEngine) return;

            const metrics = await window.comprehensiveAnalyticsEngine.calculateKPIs(
                this.currentFactory.id, 
                '30d'
            );

            const metricsElements = {
                'overall-compliance': `${metrics.overall_compliance || 0}%`,
                'audit-readiness': `${metrics.audit_preparation || 0}%`,
                'cap-completion': `${metrics.corrective_action_effectiveness || 0}%`,
                'grievance-resolution': `${metrics.stakeholder_satisfaction || 0}%`
            };

            Object.entries(metricsElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });

        } catch (error) {
            console.error('❌ Error updating compliance metrics:', error);
        }
    }

    async updateRiskHeatmap() {
        try {
            if (!window.comprehensiveAnalyticsEngine) return;

            const heatmap = await window.comprehensiveAnalyticsEngine.generateRiskHeatmap(
                this.currentFactory.id,
                '30d'
            );

            // Update risk heatmap visualization
            this.updateRiskHeatmapVisualization(heatmap);

        } catch (error) {
            console.error('❌ Error updating risk heatmap:', error);
        }
    }

    updateRiskHeatmapVisualization(heatmap) {
        const heatmapContainer = document.getElementById('risk-heatmap');
        if (!heatmapContainer) return;

        heatmapContainer.innerHTML = `
            <h4>Risk Heatmap</h4>
            <div class="risk-areas">
                ${heatmap.riskAreas.map(area => `
                    <div class="risk-area ${this.getRiskClass(area.riskScore)}">
                        <h5>${area.category}</h5>
                        <div class="risk-score">${area.riskScore}/10</div>
                        <div class="risk-trend">${area.trend}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getRiskClass(score) {
        if (score >= 7) return 'high-risk';
        if (score >= 5) return 'medium-risk';
        return 'low-risk';
    }

    async updateKPIDashboard() {
        try {
            if (!window.comprehensiveAnalyticsEngine) return;

            const dashboard = await window.comprehensiveAnalyticsEngine.generateKPIDashboard(
                this.currentFactory.id,
                '30d'
            );

            // Update KPI visualizations
            this.updateKPIVisualizations(dashboard);

        } catch (error) {
            console.error('❌ Error updating KPI dashboard:', error);
        }
    }

    updateKPIVisualizations(dashboard) {
        // Update strategic KPIs
        dashboard.strategicKPIs.forEach(kpi => {
            const element = document.getElementById(`kpi-${kpi.name.toLowerCase().replace(/\s+/g, '-')}`);
            if (element) {
                element.innerHTML = `
                    <div class="kpi-value ${this.getKPIStatusClass(kpi.status)}">${kpi.value}%</div>
                    <div class="kpi-trend">${kpi.trend}</div>
                `;
            }
        });

        // Update tactical KPIs
        dashboard.tacticalKPIs.forEach(kpi => {
            const element = document.getElementById(`kpi-${kpi.name.toLowerCase().replace(/\s+/g, '-')}`);
            if (element) {
                element.innerHTML = `
                    <div class="kpi-value ${this.getKPIStatusClass(kpi.status)}">${kpi.value}%</div>
                    <div class="kpi-trend">${kpi.trend}</div>
                `;
            }
        });
    }

    getKPIStatusClass(status) {
        switch (status) {
            case 'excellent': return 'kpi-excellent';
            case 'good': return 'kpi-good';
            case 'fair': return 'kpi-fair';
            case 'poor': return 'kpi-poor';
            case 'critical': return 'kpi-critical';
            default: return 'kpi-unknown';
        }
    }

    updateCAPDashboard(caps) {
        const capsContainer = document.getElementById('caps-dashboard');
        if (!capsContainer) return;

        const openCAPs = caps.filter(cap => cap.status === 'open' || cap.status === 'in_progress');
        const completedCAPs = caps.filter(cap => cap.status === 'completed');

        capsContainer.innerHTML = `
            <h4>Corrective Action Plans</h4>
            <div class="caps-summary">
                <div class="cap-stat">
                    <span class="stat-number">${openCAPs.length}</span>
                    <span class="stat-label">Open CAPs</span>
                </div>
                <div class="cap-stat">
                    <span class="stat-number">${completedCAPs.length}</span>
                    <span class="stat-label">Completed</span>
                </div>
            </div>
            <div class="recent-caps">
                <h5>Recent CAPs</h5>
                ${caps.slice(0, 5).map(cap => `
                    <div class="cap-item">
                        <div class="cap-title">${cap.title}</div>
                        <div class="cap-status ${cap.status}">${cap.status}</div>
                        <div class="cap-due">Due: ${new Date(cap.dueDate).toLocaleDateString()}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateGrievanceDashboard(grievances) {
        const grievancesContainer = document.getElementById('grievances-dashboard');
        if (!grievancesContainer) return;

        const openGrievances = grievances.filter(g => g.status === 'open' || g.status === 'investigating');
        const resolvedGrievances = grievances.filter(g => g.status === 'resolved');

        grievancesContainer.innerHTML = `
            <h4>Grievance Cases</h4>
            <div class="grievances-summary">
                <div class="grievance-stat">
                    <span class="stat-number">${openGrievances.length}</span>
                    <span class="stat-label">Open Cases</span>
                </div>
                <div class="grievance-stat">
                    <span class="stat-number">${resolvedGrievances.length}</span>
                    <span class="stat-label">Resolved</span>
                </div>
            </div>
            <div class="recent-grievances">
                <h5>Recent Cases</h5>
                ${grievances.slice(0, 5).map(grievance => `
                    <div class="grievance-item">
                        <div class="grievance-category">${grievance.category}</div>
                        <div class="grievance-status ${grievance.status}">${grievance.status}</div>
                        <div class="grievance-date">${new Date(grievance.createdAt).toLocaleDateString()}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateDocumentDashboard(documents) {
        const documentsContainer = document.getElementById('documents-dashboard');
        if (!documentsContainer) return;

        const recentDocuments = documents.slice(0, 10);
        const documentCategories = this.groupDocumentsByCategory(documents);

        documentsContainer.innerHTML = `
            <h4>Document Management</h4>
            <div class="documents-summary">
                <div class="document-stat">
                    <span class="stat-number">${documents.length}</span>
                    <span class="stat-label">Total Documents</span>
                </div>
                <div class="document-stat">
                    <span class="stat-number">${documentCategories.length}</span>
                    <span class="stat-label">Categories</span>
                </div>
            </div>
            <div class="document-categories">
                <h5>Document Categories</h5>
                ${documentCategories.map(category => `
                    <div class="category-item">
                        <span class="category-name">${category.name}</span>
                        <span class="category-count">${category.count}</span>
                    </div>
                `).join('')}
            </div>
            <div class="recent-documents">
                <h5>Recent Documents</h5>
                ${recentDocuments.map(doc => `
                    <div class="document-item">
                        <div class="document-title">${doc.title}</div>
                        <div class="document-category">${doc.category}</div>
                        <div class="document-date">${new Date(doc.uploadedAt).toLocaleDateString()}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    groupDocumentsByCategory(documents) {
        const categories = {};
        documents.forEach(doc => {
            categories[doc.category] = (categories[doc.category] || 0) + 1;
        });

        return Object.entries(categories).map(([name, count]) => ({
            name,
            count
        }));
    }

    // AI Copilot Integration Methods
    async askAICopilot(question) {
        try {
            if (!window.AICopilot) {
                throw new Error('AI Copilot not available');
            }

            const context = {
                userId: this.currentUser.uid,
                factoryId: this.currentFactory?.id,
                userRole: this.currentUser.role,
                factoryName: this.currentFactory?.name
            };

            const response = await window.AICopilot.askCopilot(question, context);
            this.displayAICopilotResponse(response);
            
        } catch (error) {
            console.error('❌ Error asking AI Copilot:', error);
            this.displayAICopilotError(error.message);
        }
    }

    displayAICopilotResponse(response) {
        const chatContainer = document.getElementById('ai-chat-container');
        if (!chatContainer) return;

        const responseElement = document.createElement('div');
        responseElement.className = 'ai-response';
        responseElement.innerHTML = `
            <div class="response-header">
                <span class="response-confidence">Confidence: ${Math.round(response.confidence * 100)}%</span>
                ${response.requiresApproval ? '<span class="approval-required">⚠️ Requires Approval</span>' : ''}
            </div>
            <div class="response-content">${response.answer}</div>
            ${response.sources && response.sources.length > 0 ? `
                <div class="response-sources">
                    <strong>Sources:</strong>
                    ${response.sources.map(source => `
                        <div class="source-item">
                            ${source.title} (${source.type}) - ${Math.round(source.confidence * 100)}%
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;

        chatContainer.appendChild(responseElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    displayAICopilotError(error) {
        const chatContainer = document.getElementById('ai-chat-container');
        if (!chatContainer) return;

        const errorElement = document.createElement('div');
        errorElement.className = 'ai-error';
        errorElement.innerHTML = `
            <div class="error-message">❌ ${error}</div>
        `;

        chatContainer.appendChild(errorElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Utility Methods
    getDashboardData(key) {
        return this.dashboardData.get(key);
    }

    setDashboardData(key, data) {
        this.dashboardData.set(key, data);
    }

    cleanup() {
        // Clean up real-time listeners
        this.realTimeUpdates.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.realTimeUpdates.clear();
    }
}

// Global functions for AI Copilot
window.askAICopilot = function(question) {
    if (window.dashboardIntegration) {
        window.dashboardIntegration.askAICopilot(question);
    }
};

window.submitAICopilotQuestion = function() {
    const input = document.getElementById('ai-question-input');
    if (input && input.value.trim()) {
        window.askAICopilot(input.value.trim());
        input.value = '';
    }
};

window.toggleAICopilot = function() {
    const widget = document.querySelector('.ai-copilot-widget');
    if (widget) {
        widget.classList.toggle('minimized');
    }
};

// Initialize Dashboard Integration
window.dashboardIntegration = new DashboardIntegration();
