// System Integration Management Actions
class SystemIntegrationActions {
    constructor(core) {
        this.core = core;
    }
    
    async createIntegration() {
        try {
            this.core.showNotification('info', 'Opening integration creation wizard...');
            
            // Simulate integration creation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showIntegrationCreationModal();
            
        } catch (error) {
            console.error('Error creating integration:', error);
            this.core.showNotification('error', 'Failed to create integration');
        }
    }
    
    showIntegrationCreationModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: var(--radius-2xl);
                padding: var(--space-6);
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-4);
                ">
                    <h3 style="font-size: var(--text-lg); font-weight: 600; color: var(--neutral-900);">
                        Create New Integration
                    </h3>
                    <button onclick="this.closest('.modal-overlay').remove()" style="
                        background: none;
                        border: none;
                        font-size: var(--text-xl);
                        cursor: pointer;
                        color: var(--neutral-500);
                    ">×</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: var(--space-4);">
                        <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                            Integration Type
                        </label>
                        <select style="
                            width: 100%;
                            padding: var(--space-3);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            font-size: var(--text-sm);
                        ">
                            <option value="api">API Integration</option>
                            <option value="webhook">Webhook</option>
                            <option value="third-party">Third-party Service</option>
                            <option value="database">Database Connection</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: var(--space-4);">
                        <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                            Integration Name
                        </label>
                        <input type="text" placeholder="Enter integration name" style="
                            width: 100%;
                            padding: var(--space-3);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            font-size: var(--text-sm);
                        ">
                    </div>
                    
                    <div style="margin-bottom: var(--space-4);">
                        <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                            Description
                        </label>
                        <textarea placeholder="Enter integration description" rows="3" style="
                            width: 100%;
                            padding: var(--space-3);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            font-size: var(--text-sm);
                            resize: vertical;
                        "></textarea>
                    </div>
                    
                    <div style="margin-bottom: var(--space-6);">
                        <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                            Endpoint URL
                        </label>
                        <input type="url" placeholder="https://api.example.com/endpoint" style="
                            width: 100%;
                            padding: var(--space-3);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            font-size: var(--text-sm);
                        ">
                    </div>
                    
                    <div style="display: flex; gap: var(--space-3); justify-content: flex-end;">
                        <button onclick="this.closest('.modal-overlay').remove()" style="
                            padding: var(--space-3) var(--space-6);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            background: white;
                            color: var(--neutral-700);
                            font-size: var(--text-sm);
                            cursor: pointer;
                        ">Cancel</button>
                        <button onclick="this.createIntegration()" style="
                            padding: var(--space-3) var(--space-6);
                            border: none;
                            border-radius: var(--radius-md);
                            background: var(--primary-600);
                            color: white;
                            font-size: var(--text-sm);
                            cursor: pointer;
                        ">Create Integration</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    async testConnections() {
        try {
            this.core.showNotification('info', 'Testing all connections...');
            
            // Simulate connection testing
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const results = {
                apis: this.core.apiEndpoints.filter(api => api.status === 'active').length,
                integrations: this.core.integrations.filter(integration => integration.status === 'connected').length,
                webhooks: this.core.webhooks.filter(webhook => webhook.status === 'enabled').length,
                connections: this.core.externalConnections.filter(connection => connection.status === 'online').length
            };
            
            this.core.showNotification('success', `Connection test completed. ${results.apis + results.integrations + results.webhooks + results.connections} connections active`);
            
        } catch (error) {
            console.error('Error testing connections:', error);
            this.core.showNotification('error', 'Failed to test connections');
        }
    }
    
    async refreshIntegrations() {
        try {
            this.core.showNotification('info', 'Refreshing integration data...');
            
            // Simulate refresh
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await this.core.loadInitialData();
            
            this.core.showNotification('success', 'Integration data refreshed successfully');
            
        } catch (error) {
            console.error('Error refreshing integrations:', error);
            this.core.showNotification('error', 'Failed to refresh integration data');
        }
    }
    
    async exportIntegrations() {
        try {
            this.core.showNotification('info', 'Exporting integration data...');
            
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create integration data object
            const integrationData = {
                apiEndpoints: this.core.apiEndpoints,
                integrations: this.core.integrations,
                webhooks: this.core.webhooks,
                externalConnections: this.core.externalConnections,
                exportDate: new Date().toISOString()
            };
            
            // Create and download JSON file
            const blob = new Blob([JSON.stringify(integrationData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `integration_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.core.showNotification('success', 'Integration data exported successfully');
            
        } catch (error) {
            console.error('Error exporting integrations:', error);
            this.core.showNotification('error', 'Failed to export integration data');
        }
    }
    
    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        event.target.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
        
        this.core.currentTab = tabName;
    }
    
    async viewApiDetails(apiId) {
        const api = this.core.apiEndpoints.find(a => a.id === apiId);
        if (!api) return;
        
        this.core.showNotification('info', `Viewing details for ${api.name}...`);
        
        // Simulate viewing details
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.showApiDetailsModal(api);
    }
    
    showApiDetailsModal(api) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: var(--radius-2xl);
                padding: var(--space-6);
                max-width: 700px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-4);
                ">
                    <h3 style="font-size: var(--text-lg); font-weight: 600; color: var(--neutral-900);">
                        ${api.name}
                    </h3>
                    <button onclick="this.closest('.modal-overlay').remove()" style="
                        background: none;
                        border: none;
                        font-size: var(--text-xl);
                        cursor: pointer;
                        color: var(--neutral-500);
                    ">×</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: var(--space-4);">
                        <p style="color: var(--neutral-600); margin-bottom: var(--space-4);">
                            ${api.description}
                        </p>
                        
                        <div style="background: var(--neutral-50); padding: var(--space-4); border-radius: var(--radius-lg);">
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                API Details
                            </h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
                                <div><strong>Endpoint:</strong> ${api.endpoint}</div>
                                <div><strong>Method:</strong> ${api.method}</div>
                                <div><strong>Version:</strong> ${api.version}</div>
                                <div><strong>Status:</strong> <span class="api-status ${api.status}">${api.status}</span></div>
                                <div><strong>Authentication:</strong> ${api.authentication}</div>
                                <div><strong>Rate Limit:</strong> ${api.rateLimit}</div>
                            </div>
                        </div>
                        
                        <div style="margin-top: var(--space-4); background: var(--neutral-50); padding: var(--space-4); border-radius: var(--radius-lg);">
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Usage Statistics
                            </h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-3);">
                                <div><strong>Total Requests:</strong> ${api.usage.requests.toLocaleString()}</div>
                                <div><strong>Errors:</strong> ${api.usage.errors}</div>
                                <div><strong>Avg Response Time:</strong> ${api.usage.avgResponseTime}ms</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    async testApiEndpoint(apiId) {
        const api = this.core.apiEndpoints.find(a => a.id === apiId);
        if (!api) return;
        
        try {
            this.core.showNotification('info', `Testing ${api.name} endpoint...`);
            
            // Simulate API test
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate test result
            const success = Math.random() > 0.2; // 80% success rate
            
            if (success) {
                this.core.showNotification('success', `${api.name} endpoint test successful`);
            } else {
                this.core.showNotification('error', `${api.name} endpoint test failed`);
            }
            
        } catch (error) {
            console.error('Error testing API endpoint:', error);
            this.core.showNotification('error', 'Failed to test API endpoint');
        }
    }
    
    async configureApi(apiId) {
        const api = this.core.apiEndpoints.find(a => a.id === apiId);
        if (!api) return;
        
        this.core.showNotification('info', `Opening configuration for ${api.name}...`);
        
        // Simulate configuration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.showApiConfigurationModal(api);
    }
    
    showApiConfigurationModal(api) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: var(--radius-2xl);
                padding: var(--space-6);
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-4);
                ">
                    <h3 style="font-size: var(--text-lg); font-weight: 600; color: var(--neutral-900);">
                        Configure ${api.name}
                    </h3>
                    <button onclick="this.closest('.modal-overlay').remove()" style="
                        background: none;
                        border: none;
                        font-size: var(--text-xl);
                        cursor: pointer;
                        color: var(--neutral-500);
                    ">×</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: var(--space-4);">
                        <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                            Rate Limit
                        </label>
                        <input type="text" value="${api.rateLimit}" style="
                            width: 100%;
                            padding: var(--space-3);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            font-size: var(--text-sm);
                        ">
                    </div>
                    
                    <div style="margin-bottom: var(--space-4);">
                        <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                            Authentication Method
                        </label>
                        <select style="
                            width: 100%;
                            padding: var(--space-3);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            font-size: var(--text-sm);
                        ">
                            <option value="Bearer Token" ${api.authentication === 'Bearer Token' ? 'selected' : ''}>Bearer Token</option>
                            <option value="API Key" ${api.authentication === 'API Key' ? 'selected' : ''}>API Key</option>
                            <option value="OAuth 2.0" ${api.authentication === 'OAuth 2.0' ? 'selected' : ''}>OAuth 2.0</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: var(--space-6);">
                        <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                            Status
                        </label>
                        <select style="
                            width: 100%;
                            padding: var(--space-3);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            font-size: var(--text-sm);
                        ">
                            <option value="active" ${api.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${api.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                            <option value="deprecated" ${api.status === 'deprecated' ? 'selected' : ''}>Deprecated</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: var(--space-3); justify-content: flex-end;">
                        <button onclick="this.closest('.modal-overlay').remove()" style="
                            padding: var(--space-3) var(--space-6);
                            border: 1px solid var(--neutral-200);
                            border-radius: var(--radius-md);
                            background: white;
                            color: var(--neutral-700);
                            font-size: var(--text-sm);
                            cursor: pointer;
                        ">Cancel</button>
                        <button onclick="this.saveApiConfiguration('${api.id}')" style="
                            padding: var(--space-3) var(--space-6);
                            border: none;
                            border-radius: var(--radius-md);
                            background: var(--primary-600);
                            color: white;
                            font-size: var(--text-sm);
                            cursor: pointer;
                        ">Save Configuration</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    async saveApiConfiguration(apiId) {
        try {
            this.core.showNotification('info', 'Saving API configuration...');
            
            // Simulate save
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.core.showNotification('success', 'API configuration saved successfully');
            
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.remove();
            
        } catch (error) {
            console.error('Error saving API configuration:', error);
            this.core.showNotification('error', 'Failed to save API configuration');
        }
    }
    
    // Similar methods for integrations, webhooks, and connections
    async viewIntegrationDetails(integrationId) {
        const integration = this.core.integrations.find(i => i.id === integrationId);
        if (!integration) return;
        
        this.core.showNotification('info', `Viewing details for ${integration.name}...`);
        // Implement integration details modal
    }
    
    async testIntegration(integrationId) {
        const integration = this.core.integrations.find(i => i.id === integrationId);
        if (!integration) return;
        
        try {
            this.core.showNotification('info', `Testing ${integration.name} integration...`);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const success = Math.random() > 0.3; // 70% success rate
            
            if (success) {
                this.core.showNotification('success', `${integration.name} integration test successful`);
            } else {
                this.core.showNotification('error', `${integration.name} integration test failed`);
            }
            
        } catch (error) {
            console.error('Error testing integration:', error);
            this.core.showNotification('error', 'Failed to test integration');
        }
    }
    
    async configureIntegration(integrationId) {
        const integration = this.core.integrations.find(i => i.id === integrationId);
        if (!integration) return;
        
        this.core.showNotification('info', `Opening configuration for ${integration.name}...`);
        // Implement integration configuration modal
    }
    
    async viewWebhookDetails(webhookId) {
        const webhook = this.core.webhooks.find(w => w.id === webhookId);
        if (!webhook) return;
        
        this.core.showNotification('info', `Viewing details for ${webhook.name}...`);
        // Implement webhook details modal
    }
    
    async testWebhook(webhookId) {
        const webhook = this.core.webhooks.find(w => w.id === webhookId);
        if (!webhook) return;
        
        try {
            this.core.showNotification('info', `Testing ${webhook.name} webhook...`);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const success = Math.random() > 0.25; // 75% success rate
            
            if (success) {
                this.core.showNotification('success', `${webhook.name} webhook test successful`);
            } else {
                this.core.showNotification('error', `${webhook.name} webhook test failed`);
            }
            
        } catch (error) {
            console.error('Error testing webhook:', error);
            this.core.showNotification('error', 'Failed to test webhook');
        }
    }
    
    async configureWebhook(webhookId) {
        const webhook = this.core.webhooks.find(w => w.id === webhookId);
        if (!webhook) return;
        
        this.core.showNotification('info', `Opening configuration for ${webhook.name}...`);
        // Implement webhook configuration modal
    }
    
    async viewConnectionDetails(connectionId) {
        const connection = this.core.externalConnections.find(c => c.id === connectionId);
        if (!connection) return;
        
        this.core.showNotification('info', `Viewing details for ${connection.name}...`);
        // Implement connection details modal
    }
    
    async testConnection(connectionId) {
        const connection = this.core.externalConnections.find(c => c.id === connectionId);
        if (!connection) return;
        
        try {
            this.core.showNotification('info', `Testing ${connection.name} connection...`);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const success = Math.random() > 0.2; // 80% success rate
            
            if (success) {
                this.core.showNotification('success', `${connection.name} connection test successful`);
            } else {
                this.core.showNotification('error', `${connection.name} connection test failed`);
            }
            
        } catch (error) {
            console.error('Error testing connection:', error);
            this.core.showNotification('error', 'Failed to test connection');
        }
    }
    
    async configureConnection(connectionId) {
        const connection = this.core.externalConnections.find(c => c.id === connectionId);
        if (!connection) return;
        
        this.core.showNotification('info', `Opening configuration for ${connection.name}...`);
        // Implement connection configuration modal
    }
}

// Initialize actions when core is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.systemIntegrationCore) {
            window.systemIntegrationActions = new SystemIntegrationActions(window.systemIntegrationCore);
            
            // Override core methods with actions
            window.systemIntegrationCore.createIntegration = () => window.systemIntegrationActions.createIntegration();
            window.systemIntegrationCore.testConnections = () => window.systemIntegrationActions.testConnections();
            window.systemIntegrationCore.refreshIntegrations = () => window.systemIntegrationActions.refreshIntegrations();
            window.systemIntegrationCore.exportIntegrations = () => window.systemIntegrationActions.exportIntegrations();
            window.systemIntegrationCore.switchTab = (tabName) => window.systemIntegrationActions.switchTab(tabName);
            window.systemIntegrationCore.viewApiDetails = (apiId) => window.systemIntegrationActions.viewApiDetails(apiId);
            window.systemIntegrationCore.testApiEndpoint = (apiId) => window.systemIntegrationActions.testApiEndpoint(apiId);
            window.systemIntegrationCore.configureApi = (apiId) => window.systemIntegrationActions.configureApi(apiId);
            window.systemIntegrationCore.viewIntegrationDetails = (integrationId) => window.systemIntegrationActions.viewIntegrationDetails(integrationId);
            window.systemIntegrationCore.testIntegration = (integrationId) => window.systemIntegrationActions.testIntegration(integrationId);
            window.systemIntegrationCore.configureIntegration = (integrationId) => window.systemIntegrationActions.configureIntegration(integrationId);
            window.systemIntegrationCore.viewWebhookDetails = (webhookId) => window.systemIntegrationActions.viewWebhookDetails(webhookId);
            window.systemIntegrationCore.testWebhook = (webhookId) => window.systemIntegrationActions.testWebhook(webhookId);
            window.systemIntegrationCore.configureWebhook = (webhookId) => window.systemIntegrationActions.configureWebhook(webhookId);
            window.systemIntegrationCore.viewConnectionDetails = (connectionId) => window.systemIntegrationActions.viewConnectionDetails(connectionId);
            window.systemIntegrationCore.testConnection = (connectionId) => window.systemIntegrationActions.testConnection(connectionId);
            window.systemIntegrationCore.configureConnection = (connectionId) => window.systemIntegrationActions.configureConnection(connectionId);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemIntegrationActions;
}
