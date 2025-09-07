// AI Copilot Actions for Super Admin
class AICopilotActions {
    constructor(core) {
        this.core = core;
    }
    
    async refreshAI() {
        try {
            this.core.showNotification('info', 'Refreshing AI system...');
            
            // Simulate AI refresh
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Reload all AI data
            await this.core.loadInitialData();
            
            this.core.showNotification('success', 'AI system refreshed successfully');
            
        } catch (error) {
            console.error('Error refreshing AI:', error);
            this.core.showNotification('error', 'Failed to refresh AI system');
        }
    }
    
    async configureAI() {
        this.core.showNotification('info', 'Opening AI configuration...');
        
        // Simulate AI configuration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.core.showNotification('success', 'AI configuration opened');
    }
    
    async sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        // Clear input
        chatInput.value = '';
        chatInput.style.height = 'auto';
        
        // Send message
        await this.core.sendMessage(message);
    }
    
    async refreshRecommendations() {
        try {
            this.core.showNotification('info', 'Refreshing AI recommendations...');
            
            // Simulate recommendations refresh
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await this.core.loadRecommendations();
            this.core.renderRecommendations();
            
            this.core.showNotification('success', 'AI recommendations refreshed successfully');
            
        } catch (error) {
            console.error('Error refreshing recommendations:', error);
            this.core.showNotification('error', 'Failed to refresh AI recommendations');
        }
    }
    
    async configureRecommendations() {
        this.core.showNotification('info', 'Opening recommendations configuration...');
        
        // Simulate recommendations configuration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.core.showNotification('success', 'Recommendations configuration opened');
    }
    
    async viewRecommendation(recommendationId) {
        const recommendation = this.core.recommendations.find(r => r.id === recommendationId);
        if (!recommendation) return;
        
        this.showRecommendationDetailsModal(recommendation);
    }
    
    showRecommendationDetailsModal(recommendation) {
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
                        ${recommendation.title}
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
                        <strong>Priority:</strong> 
                        <span class="recommendation-priority ${recommendation.priority}" style="
                            padding: var(--space-1) var(--space-2);
                            border-radius: var(--radius-sm);
                            font-size: var(--text-xs);
                            font-weight: 600;
                            text-transform: uppercase;
                            margin-left: var(--space-2);
                        ">${recommendation.priority}</span>
                    </div>
                    
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Category:</strong> ${recommendation.category}
                    </div>
                    
                    <div style="margin-bottom: var(--space-4);">
                        <strong>Description:</strong>
                        <p style="margin-top: var(--space-2); color: var(--neutral-600);">
                            ${recommendation.description}
                        </p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
                        <div>
                            <strong>Impact:</strong> ${recommendation.impact}
                        </div>
                        <div>
                            <strong>Effort:</strong> ${recommendation.effort}
                        </div>
                        <div>
                            <strong>Estimated Savings:</strong> ${recommendation.estimatedSavings}
                        </div>
                        <div>
                            <strong>Last Analyzed:</strong> ${this.core.formatDate(recommendation.lastAnalyzed)}
                        </div>
                    </div>
                    
                    <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--neutral-200);">
                        <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                            Implementation Steps
                        </h4>
                        <ol style="color: var(--neutral-600); line-height: 1.6;">
                            <li>Review current system configuration</li>
                            <li>Create implementation plan</li>
                            <li>Schedule maintenance window</li>
                            <li>Implement changes</li>
                            <li>Test and validate</li>
                            <li>Monitor performance</li>
                        </ol>
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
    
    async implementRecommendation(recommendationId) {
        const recommendation = this.core.recommendations.find(r => r.id === recommendationId);
        if (!recommendation) return;
        
        if (!confirm(`Are you sure you want to implement "${recommendation.title}"?`)) {
            return;
        }
        
        try {
            this.core.showNotification('info', `Implementing ${recommendation.title}...`);
            
            // Simulate implementation
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Remove recommendation after implementation
            this.core.recommendations = this.core.recommendations.filter(r => r.id !== recommendationId);
            this.core.renderRecommendations();
            
            this.core.showNotification('success', `${recommendation.title} implemented successfully`);
            
        } catch (error) {
            console.error('Error implementing recommendation:', error);
            this.core.showNotification('error', 'Failed to implement recommendation');
        }
    }
    
    async configureAutomation(automationId) {
        const automation = this.core.automation.find(a => a.id === automationId);
        if (!automation) return;
        
        this.core.showNotification('info', `Configuring ${automation.name}...`);
        
        // Simulate automation configuration
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.core.showNotification('success', `${automation.name} configuration opened`);
    }
    
    async toggleAutomation(automationId) {
        const automation = this.core.automation.find(a => a.id === automationId);
        if (!automation) return;
        
        const action = automation.status === 'active' ? 'disable' : 'enable';
        
        if (!confirm(`Are you sure you want to ${action} "${automation.name}"?`)) {
            return;
        }
        
        try {
            this.core.showNotification('info', `${action.charAt(0).toUpperCase() + action.slice(1)}ing ${automation.name}...`);
            
            // Simulate automation toggle
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update automation status
            automation.status = automation.status === 'active' ? 'inactive' : 'active';
            automation.lastExecuted = new Date();
            
            this.core.renderAutomation();
            this.core.showNotification('success', `${automation.name} ${action}d successfully`);
            
        } catch (error) {
            console.error('Error toggling automation:', error);
            this.core.showNotification('error', `Failed to ${action} automation`);
        }
    }
}

// Initialize actions when core is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.aiCopilotCore) {
            window.aiCopilotActions = new AICopilotActions(window.aiCopilotCore);
            
            // Override core methods with actions
            window.aiCopilotCore.refreshAI = () => window.aiCopilotActions.refreshAI();
            window.aiCopilotCore.configureAI = () => window.aiCopilotActions.configureAI();
            window.aiCopilotCore.sendMessage = () => window.aiCopilotActions.sendMessage();
            window.aiCopilotCore.refreshRecommendations = () => window.aiCopilotActions.refreshRecommendations();
            window.aiCopilotCore.configureRecommendations = () => window.aiCopilotActions.configureRecommendations();
            window.aiCopilotCore.viewRecommendation = (recommendationId) => window.aiCopilotActions.viewRecommendation(recommendationId);
            window.aiCopilotCore.implementRecommendation = (recommendationId) => window.aiCopilotActions.implementRecommendation(recommendationId);
            window.aiCopilotCore.configureAutomation = (automationId) => window.aiCopilotActions.configureAutomation(automationId);
            window.aiCopilotCore.toggleAutomation = (automationId) => window.aiCopilotActions.toggleAutomation(automationId);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AICopilotActions;
}
