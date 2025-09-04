// Bilingual Integration for Angkor Compliance Platform
// Enhances all existing components with comprehensive Khmer/English support

class BilingualIntegration {
    constructor() {
        this.isInitialized = false;
        this.components = new Map();
        
        this.initializeBilingualIntegration();
    }

    async initializeBilingualIntegration() {
        try {
            console.log('🌐 Initializing Bilingual Integration...');
            
            // Wait for enhanced bilingual system to be ready
            await this.waitForBilingualSystem();
            
            // Enhance existing components
            await this.enhanceExistingComponents();
            
            // Set up component-specific translations
            this.setupComponentTranslations();
            
            // Initialize dynamic content translation
            this.initializeDynamicTranslation();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ Bilingual Integration initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Bilingual Integration:', error);
        }
    }

    async waitForBilingualSystem() {
        return new Promise((resolve) => {
            const checkSystem = () => {
                if (window.enhancedBilingualSystem && window.enhancedBilingualSystem.isInitialized) {
                    resolve();
                } else {
                    setTimeout(checkSystem, 100);
                }
            };
            checkSystem();
        });
    }

    async enhanceExistingComponents() {
        // Enhance Dashboard Integration
        this.enhanceDashboardIntegration();
        
        // Enhance AI Copilot System
        this.enhanceAICopilotSystem();
        
        // Enhance Standards Registry
        this.enhanceStandardsRegistry();
        
        // Enhance Document Management
        this.enhanceDocumentManagement();
        
        // Enhance Factory Management
        this.enhanceFactoryManagement();
        
        // Enhance CAP Management
        this.enhanceCAPManagement();
        
        // Enhance Grievance System
        this.enhanceGrievanceSystem();
        
        // Enhance Analytics
        this.enhanceAnalytics();
        
        // Enhance Settings
        this.enhanceSettings();
    }

    enhanceDashboardIntegration() {
        if (window.dashboardIntegration) {
            const originalInit = window.dashboardIntegration.initializeDashboardIntegration;
            window.dashboardIntegration.initializeDashboardIntegration = async function() {
                await originalInit.call(this);
                
                // Add bilingual support to dashboard widgets
                this.addBilingualSupportToWidgets();
            };
            
            // Add bilingual widget support method
            window.dashboardIntegration.addBilingualSupportToWidgets = function() {
                const widgets = document.querySelectorAll('.dashboard-widget, .widget');
                widgets.forEach(widget => {
                    this.translateWidget(widget);
                });
            };
            
            // Add widget translation method
            window.dashboardIntegration.translateWidget = function(widget) {
                const title = widget.querySelector('.widget-title, h3, h4');
                if (title && title.dataset.translateKey) {
                    title.textContent = window.t(title.dataset.translateKey);
                }
                
                const labels = widget.querySelectorAll('.metric-label, .label');
                labels.forEach(label => {
                    if (label.dataset.translateKey) {
                        label.textContent = window.t(label.dataset.translateKey);
                    }
                });
            };
        }
    }

    enhanceAICopilotSystem() {
        if (window.AICopilot) {
            // Enhance AI responses with language context
            const originalAsk = window.AICopilot.ask;
            window.AICopilot.ask = async function(question) {
                const currentLang = window.getCurrentLanguage();
                const enhancedQuestion = `${question} [Response Language: ${currentLang}]`;
                const response = await originalAsk.call(this, enhancedQuestion);
                
                // Translate response if needed
                if (currentLang === 'km' && response.language === 'en') {
                    response.content = await this.translateResponse(response.content, 'en', 'km');
                }
                
                return response;
            };
            
            // Add response translation method
            window.AICopilot.translateResponse = async function(content, fromLang, toLang) {
                // This would integrate with a translation service
                // For now, return the original content
                return content;
            };
        }
    }

    enhanceStandardsRegistry() {
        if (window.standardsRegistry) {
            // Add bilingual support to standards display
            const originalLoadStandards = window.standardsRegistry.loadStandards;
            window.standardsRegistry.loadStandards = async function() {
                const standards = await originalLoadStandards.call(this);
                
                // Translate standard names and descriptions
                standards.forEach(standard => {
                    if (window.isKhmer()) {
                        standard.displayName = standard.nameKhmer || standard.name;
                        standard.displayDescription = standard.descriptionKhmer || standard.description;
                    } else {
                        standard.displayName = standard.name;
                        standard.displayDescription = standard.description;
                    }
                });
                
                return standards;
            };
        }
    }

    enhanceDocumentManagement() {
        if (window.documentManagement) {
            // Add bilingual support to document processing
            const originalProcessDocument = window.documentManagement.processDocument;
            window.documentManagement.processDocument = async function(document) {
                // Add language detection
                document.detectedLanguage = await this.detectDocumentLanguage(document);
                document.userLanguage = window.getCurrentLanguage();
                
                return await originalProcessDocument.call(this, document);
            };
            
            // Add language detection method
            window.documentManagement.detectDocumentLanguage = async function(document) {
                // Simple language detection based on content
                const content = document.content || '';
                const khmerChars = /[\u1780-\u17FF]/;
                return khmerChars.test(content) ? 'km' : 'en';
            };
        }
    }

    enhanceFactoryManagement() {
        if (window.factoryManagement) {
            // Add bilingual support to factory forms
            const originalCreateFactory = window.factoryManagement.createFactory;
            window.factoryManagement.createFactory = async function(factoryData) {
                // Add language preference
                factoryData.preferredLanguage = window.getCurrentLanguage();
                
                return await originalCreateFactory.call(this, factoryData);
            };
        }
    }

    enhanceCAPManagement() {
        if (window.capManagement) {
            // Add bilingual support to CAP generation
            const originalGenerateCAP = window.capManagement.generateCAP;
            window.capManagement.generateCAP = async function(nonConformity) {
                const currentLang = window.getCurrentLanguage();
                const cap = await originalGenerateCAP.call(this, nonConformity);
                
                // Translate CAP content
                if (currentLang === 'km') {
                    cap.title = await this.translateText(cap.title, 'en', 'km');
                    cap.description = await this.translateText(cap.description, 'en', 'km');
                    cap.actions = await this.translateActions(cap.actions, 'en', 'km');
                }
                
                return cap;
            };
            
            // Add translation methods
            window.capManagement.translateText = async function(text, fromLang, toLang) {
                // Integration with translation service
                return text;
            };
            
            window.capManagement.translateActions = async function(actions, fromLang, toLang) {
                // Translate action descriptions
                for (let action of actions) {
                    action.description = await this.translateText(action.description, fromLang, toLang);
                }
                return actions;
            };
        }
    }

    enhanceGrievanceSystem() {
        if (window.grievanceSystem) {
            // Add bilingual support to grievance forms
            const originalSubmitGrievance = window.grievanceSystem.submitGrievance;
            window.grievanceSystem.submitGrievance = async function(grievanceData) {
                // Add language preference
                grievanceData.submissionLanguage = window.getCurrentLanguage();
                
                return await originalSubmitGrievance.call(this, grievanceData);
            };
        }
    }

    enhanceAnalytics() {
        if (window.comprehensiveAnalyticsEngine) {
            // Add bilingual support to analytics reports
            const originalGenerateReport = window.comprehensiveAnalyticsEngine.generateReport;
            window.comprehensiveAnalyticsEngine.generateReport = async function(reportType) {
                const report = await originalGenerateReport.call(this, reportType);
                
                // Translate report content
                if (window.isKhmer()) {
                    report.title = await this.translateReportTitle(report.title, 'en', 'km');
                    report.summary = await this.translateReportSummary(report.summary, 'en', 'km');
                }
                
                return report;
            };
        }
    }

    enhanceSettings() {
        if (window.settings) {
            // Add language preference to settings
            const originalSaveSettings = window.settings.saveSettings;
            window.settings.saveSettings = async function(settingsData) {
                settingsData.language = window.getCurrentLanguage();
                
                return await originalSaveSettings.call(this, settingsData);
            };
        }
    }

    setupComponentTranslations() {
        // Add comprehensive translations for all components
        const componentTranslations = {
            en: {
                // Dashboard Widgets
                'widget_factory_overview': 'Factory Overview',
                'widget_compliance_metrics': 'Compliance Metrics',
                'widget_recent_activities': 'Recent Activities',
                'widget_system_alerts': 'System Alerts',
                'widget_ai_copilot': 'AI Copilot',
                
                // Metrics
                'metric_total_factories': 'Total Factories',
                'metric_active_users': 'Active Users',
                'metric_pending_permits': 'Pending Permits',
                'metric_active_caps': 'Active CAPs',
                'metric_compliance_score': 'Compliance Score',
                'metric_risk_level': 'Risk Level',
                
                // Actions
                'action_view_details': 'View Details',
                'action_edit': 'Edit',
                'action_delete': 'Delete',
                'action_approve': 'Approve',
                'action_reject': 'Reject',
                'action_export': 'Export',
                
                // Status Messages
                'status_loading': 'Loading...',
                'status_saving': 'Saving...',
                'status_success': 'Success!',
                'status_error': 'Error occurred',
                'status_no_data': 'No data available',
                
                // Form Labels
                'label_name': 'Name',
                'label_email': 'Email',
                'label_phone': 'Phone',
                'label_address': 'Address',
                'label_description': 'Description',
                'label_date': 'Date',
                'label_status': 'Status',
                'label_priority': 'Priority',
                
                // Buttons
                'btn_submit': 'Submit',
                'btn_cancel': 'Cancel',
                'btn_save': 'Save',
                'btn_reset': 'Reset',
                'btn_back': 'Back',
                'btn_next': 'Next',
                'btn_previous': 'Previous',
                'btn_finish': 'Finish'
            },
            km: {
                // Dashboard Widgets
                'widget_factory_overview': 'ទិដ្ឋភាពទូទៅរោងចក្រ',
                'widget_compliance_metrics': 'វិធានការអនុលោមតាម',
                'widget_recent_activities': 'សកម្មភាពថ្មីៗ',
                'widget_system_alerts': 'ការជូនដំណឹងប្រព័ន្ធ',
                'widget_ai_copilot': 'អ្នកជំនួយ AI',
                
                // Metrics
                'metric_total_factories': 'រោងចក្រសរុប',
                'metric_active_users': 'អ្នកប្រើប្រាស់សកម្ម',
                'metric_pending_permits': 'អាជ្ញាប័ណ្ឌរង់ចាំ',
                'metric_active_caps': 'ផែនការកែតម្រូវសកម្ម',
                'metric_compliance_score': 'ពិន្ទុការអនុលោមតាម',
                'metric_risk_level': 'កម្រិតហានិភ័យ',
                
                // Actions
                'action_view_details': 'មើលព័ត៌មានលម្អិត',
                'action_edit': 'កែសម្រួល',
                'action_delete': 'លុប',
                'action_approve': 'អនុម័ត',
                'action_reject': 'បដិសេធ',
                'action_export': 'នាំចេញ',
                
                // Status Messages
                'status_loading': 'កំពុងផ្ទុក...',
                'status_saving': 'កំពុងរក្សាទុក...',
                'status_success': 'ជោគជ័យ!',
                'status_error': 'កំហុសបានកើតឡើង',
                'status_no_data': 'គ្មានទិន្នន័យ',
                
                // Form Labels
                'label_name': 'ឈ្មោះ',
                'label_email': 'អ៊ីមែល',
                'label_phone': 'លេខទូរស័ព្ទ',
                'label_address': 'អាសយដ្ឋាន',
                'label_description': 'ការពិពណ៌នា',
                'label_date': 'កាលបរិច្ឆេទ',
                'label_status': 'ស្ថានភាព',
                'label_priority': 'អាទិភាព',
                
                // Buttons
                'btn_submit': 'ដាក់ស្នើ',
                'btn_cancel': 'បោះបង់',
                'btn_save': 'រក្សាទុក',
                'btn_reset': 'កំណត់ឡើងវិញ',
                'btn_back': 'ត្រឡប់ក្រោយ',
                'btn_next': 'បន្ទាប់',
                'btn_previous': 'មុន',
                'btn_finish': 'បញ្ចប់'
            }
        };

        // Merge with existing translations
        if (window.translations) {
            Object.assign(window.translations.en, componentTranslations.en);
            Object.assign(window.translations.km, componentTranslations.km);
        }
    }

    initializeDynamicTranslation() {
        // Set up dynamic translation for new content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.translateNewElement(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    translateNewElement(element) {
        // Translate new elements with data attributes
        if (element.dataset.translateKey) {
            element.textContent = window.t(element.dataset.translateKey);
        }

        // Translate child elements
        const children = element.querySelectorAll('[data-translate-key]');
        children.forEach(child => {
            child.textContent = window.t(child.dataset.translateKey);
        });

        // Translate placeholders
        const inputs = element.querySelectorAll('[data-translate-placeholder]');
        inputs.forEach(input => {
            input.placeholder = window.t(input.dataset.translatePlaceholder);
        });
    }

    setupEventListeners() {
        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            this.handleLanguageChange(event.detail.language);
        });

        // Listen for component initialization
        document.addEventListener('componentInitialized', (event) => {
            this.enhanceComponent(event.detail.component);
        });
    }

    handleLanguageChange(newLanguage) {
        console.log(`🌐 Bilingual Integration: Language changed to ${newLanguage}`);
        
        // Update all component content
        this.updateAllComponentContent();
        
        // Notify components of language change
        this.notifyComponentsOfLanguageChange(newLanguage);
    }

    updateAllComponentContent() {
        // Update all translatable elements
        const elements = document.querySelectorAll('[data-translate-key]');
        elements.forEach(element => {
            element.textContent = window.t(element.dataset.translateKey);
        });

        // Update placeholders
        const inputs = document.querySelectorAll('[data-translate-placeholder]');
        inputs.forEach(input => {
            input.placeholder = window.t(input.dataset.translatePlaceholder);
        });

        // Update titles
        const titles = document.querySelectorAll('[data-translate-title]');
        titles.forEach(title => {
            title.title = window.t(title.dataset.translateTitle);
        });
    }

    notifyComponentsOfLanguageChange(language) {
        // Notify all registered components
        this.components.forEach((component, name) => {
            if (component.onLanguageChange) {
                component.onLanguageChange(language);
            }
        });
    }

    enhanceComponent(componentName) {
        // Enhance specific components when they're initialized
        switch (componentName) {
            case 'dashboard':
                this.enhanceDashboardIntegration();
                break;
            case 'ai-copilot':
                this.enhanceAICopilotSystem();
                break;
            case 'standards':
                this.enhanceStandardsRegistry();
                break;
            case 'documents':
                this.enhanceDocumentManagement();
                break;
            case 'factories':
                this.enhanceFactoryManagement();
                break;
            case 'caps':
                this.enhanceCAPManagement();
                break;
            case 'grievances':
                this.enhanceGrievanceSystem();
                break;
            case 'analytics':
                this.enhanceAnalytics();
                break;
            case 'settings':
                this.enhanceSettings();
                break;
        }
    }

    // Register a component for bilingual support
    registerComponent(name, component) {
        this.components.set(name, component);
    }

    // Get component by name
    getComponent(name) {
        return this.components.get(name);
    }

    // Check if component is registered
    isComponentRegistered(name) {
        return this.components.has(name);
    }
}

// Initialize Bilingual Integration
window.bilingualIntegration = new BilingualIntegration();

// Export for use in other files
window.registerBilingualComponent = (name, component) => {
    window.bilingualIntegration.registerComponent(name, component);
};

window.getBilingualComponent = (name) => {
    return window.bilingualIntegration.getComponent(name);
};
