// OpenAI Integration for Angkor Compliance Platform (Production-Ready)
// FIXED: Removed client-side API key storage for security
class OpenAIIntegration {
    constructor() {
        this.isConfigured = false;
        this.functions = null;
        
        // Initialize Firebase Functions
        this.initializeFunctions();
    }

    async initializeFunctions() {
        try {
            // Check if Firebase Functions is available
            if (typeof firebase !== 'undefined' && firebase.functions) {
                this.functions = firebase.functions();
                console.log('✅ Firebase Functions initialized');
                await this.checkConfiguration();
            } else {
                console.error('❌ Firebase Functions not available - OpenAI integration disabled');
                this.isConfigured = false;
            }
        } catch (error) {
            console.error('❌ Error initializing Firebase Functions:', error);
            this.isConfigured = false;
        }
    }

    async checkConfiguration() {
        try {
            const status = await this.functions.httpsCallable('getOpenAIStatus')();
            this.isConfigured = status.data.configured;
            
            if (this.isConfigured) {
                console.log('✅ OpenAI integration configured on server');
            } else {
                console.warn('⚠️ OpenAI API not configured on server');
            }
        } catch (error) {
            console.error('❌ Error checking configuration:', error);
            this.isConfigured = false;
        }
    }

    // FIXED: Removed client-side API key storage
    async setAPIKey(apiKey) {
        try {
            if (!apiKey || !apiKey.startsWith('sk-')) {
                throw new Error('Invalid OpenAI API key format');
            }

            if (this.functions) {
                // Use Firebase Functions to store API key securely on server
                const storeKey = this.functions.httpsCallable('storeOpenAIKey');
                await storeKey({ apiKey });
                this.isConfigured = true;
                console.log('✅ OpenAI API key stored securely on server');
                
                // Clear any existing client-side storage
                localStorage.removeItem('openai_api_key');
                sessionStorage.removeItem('openai_api_key');
                
                return true;
            } else {
                throw new Error('Firebase Functions not available - cannot store API key securely');
            }
        } catch (error) {
            console.error('❌ Error setting API key:', error);
            throw error;
        }
    }

    // FIXED: Removed client-side API key retrieval
    async getAPIKey() {
        // API keys are now stored securely on the server
        // Client should never have access to API keys
        throw new Error('API keys are stored securely on server - client access not allowed');
    }

    async makeServerRequest(functionName, data) {
        if (!this.functions) {
            throw new Error('Firebase Functions not available');
        }

        if (!this.isConfigured) {
            throw new Error('OpenAI API not configured. Please set your API key first.');
        }

        try {
            const callFunction = this.functions.httpsCallable(functionName);
            const result = await callFunction(data);
            return result.data;
        } catch (error) {
            console.error(`❌ ${functionName} failed:`, error);
            throw new Error(error.message || 'Server request failed');
        }
    }

    // FIXED: Removed client-side API requests
    async makeClientRequest(endpoint, data) {
        // All API requests now go through secure server-side functions
        throw new Error('Client-side API requests disabled for security - use server functions');
    }

    // Document Analysis and Compliance Checking
    async analyzeDocument(documentText, documentType = 'compliance') {
        try {
            if (this.functions && this.isConfigured) {
                // Use server-side function for secure processing
                return await this.makeServerRequest('analyzeDocument', {
                    documentText,
                    documentType
                });
            } else {
                throw new Error('OpenAI integration not available');
            }
        } catch (error) {
            console.error('❌ Document analysis failed:', error);
            throw error;
        }
    }

    // FIXED: Removed client-side prompt building
    buildDocumentAnalysisPrompt(documentText, documentType) {
        // Prompts are now built on the server for security
        throw new Error('Prompt building moved to server for security');
    }

    // FIXED: Removed client-side response parsing
    parseDocumentAnalysis(response) {
        // Response parsing moved to server for security
        throw new Error('Response parsing moved to server for security');
    }

    // Compliance Gap Analysis
    async analyzeComplianceGaps(complianceData, standards = []) {
        try {
            if (this.functions && this.isConfigured) {
                return await this.makeServerRequest('analyzeComplianceGaps', {
                    complianceData,
                    standards
                });
            } else {
                throw new Error('OpenAI integration not available');
            }
        } catch (error) {
            console.error('❌ Compliance gap analysis failed:', error);
            throw error;
        }
    }

    // Risk Assessment
    async assessRisk(factoryData, auditHistory = []) {
        try {
            if (this.functions && this.isConfigured) {
                return await this.makeServerRequest('assessRisk', {
                    factoryData,
                    auditHistory
                });
            } else {
                throw new Error('OpenAI integration not available');
            }
        } catch (error) {
            console.error('❌ Risk assessment failed:', error);
            throw error;
        }
    }

    // Document Classification
    async classifyDocument(documentText, documentMetadata = {}) {
        try {
            if (this.functions && this.isConfigured) {
                return await this.makeServerRequest('classifyDocument', {
                    documentText,
                    documentMetadata
                });
            } else {
                throw new Error('OpenAI integration not available');
            }
        } catch (error) {
            console.error('❌ Document classification failed:', error);
            throw error;
        }
    }

    // Compliance Recommendations
    async generateRecommendations(complianceIssues, factoryContext = {}) {
        try {
            if (this.functions && this.isConfigured) {
                return await this.makeServerRequest('generateRecommendations', {
                    complianceIssues,
                    factoryContext
                });
            } else {
                throw new Error('OpenAI integration not available');
            }
        } catch (error) {
            console.error('❌ Recommendation generation failed:', error);
            throw error;
        }
    }

    // Audit Report Generation
    async generateAuditReport(auditData, template = 'standard') {
        try {
            if (this.functions && this.isConfigured) {
                return await this.makeServerRequest('generateAuditReport', {
                    auditData,
                    template
                });
            } else {
                throw new Error('OpenAI integration not available');
            }
        } catch (error) {
            console.error('❌ Audit report generation failed:', error);
            throw error;
        }
    }

    // Language Translation
    async translateText(text, targetLanguage, sourceLanguage = 'auto') {
        try {
            if (this.functions && this.isConfigured) {
                return await this.makeServerRequest('translateText', {
                    text,
                    targetLanguage,
                    sourceLanguage
                });
            } else {
                throw new Error('OpenAI integration not available');
            }
        } catch (error) {
            console.error('❌ Text translation failed:', error);
            throw error;
        }
    }

    // Content Summarization
    async summarizeContent(content, maxLength = 500) {
        try {
            if (this.functions && this.isConfigured) {
                return await this.makeServerRequest('summarizeContent', {
                    content,
                    maxLength
                });
            } else {
                throw new Error('OpenAI integration not available');
            }
        } catch (error) {
            console.error('❌ Content summarization failed:', error);
            throw error;
        }
    }

    // Quality Check
    async checkQuality(documentText, qualityCriteria = []) {
        try {
            if (this.functions && this.isConfigured) {
                return await this.makeServerRequest('checkQuality', {
                    documentText,
                    qualityCriteria
                });
            } else {
                throw new Error('OpenAI integration not available');
            }
        } catch (error) {
            console.error('❌ Quality check failed:', error);
            throw error;
        }
    }

    // Get Configuration Status
    getConfigurationStatus() {
        return {
            isConfigured: this.isConfigured,
            hasFunctions: !!this.functions,
            canMakeRequests: this.isConfigured && !!this.functions
        };
    }

    // Test Connection
    async testConnection() {
        try {
            if (this.functions && this.isConfigured) {
                const result = await this.makeServerRequest('testOpenAIConnection', {});
                return result.success;
            } else {
                return false;
            }
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return false;
        }
    }

    // Clear Configuration
    async clearConfiguration() {
        try {
            if (this.functions) {
                await this.makeServerRequest('clearOpenAIKey', {});
                this.isConfigured = false;
                
                // Clear any client-side storage
                localStorage.removeItem('openai_api_key');
                sessionStorage.removeItem('openai_api_key');
                
                console.log('✅ OpenAI configuration cleared');
                return true;
            } else {
                throw new Error('Firebase Functions not available');
            }
        } catch (error) {
            console.error('❌ Error clearing configuration:', error);
            throw error;
        }
    }
}

// Initialize OpenAI Integration
const openAIIntegration = new OpenAIIntegration();

// Add CSS for notifications and modals
const style = document.createElement('style');
style.textContent = `
    .openai-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 12px 16px;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
    }

    .openai-notification.success {
        border-left: 4px solid #28a745;
    }

    .openai-notification.error {
        border-left: 4px solid #dc3545;
    }

    .openai-notification.info {
        border-left: 4px solid #17a2b8;
    }

    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
    }

    .openai-config-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
    }

    .modal-content {
        background: white;
        border-radius: 8px;
        padding: 24px;
        min-width: 400px;
        max-width: 500px;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
    }

    .form-group {
        margin-bottom: 16px;
    }

    .form-group label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
    }

    .form-group input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .form-group small {
        color: #666;
        font-size: 12px;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

document.head.appendChild(style);

console.log('🚀 OpenAI Integration loaded successfully (Production-Ready)');

// Initialize OpenAI integration when Firebase is ready
function initializeOpenaiintegration() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeOpenaiintegration, 100);
        return;
    }

    // Initialize OpenAI integration
    if (window.openAI) {
        console.log('✅ OpenAI integration ready');
    }
}

// Start the initialization process
initializeOpenaiintegration();
