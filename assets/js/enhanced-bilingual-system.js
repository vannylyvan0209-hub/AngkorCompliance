// Enhanced Bilingual System for Angkor Compliance Platform
// Provides comprehensive Khmer/English support across all modules

class EnhancedBilingualSystem {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.isInitialized = false;
        this.translationCache = new Map();
        this.dynamicTranslations = new Map();
        
        this.initializeBilingualSystem();
    }

    async initializeBilingualSystem() {
        try {
            console.log('🌐 Initializing Enhanced Bilingual System...');
            
            // Load comprehensive translations
            await this.loadComprehensiveTranslations();
            
            // Initialize language detection
            this.initializeLanguageDetection();
            
            // Set up language switching
            this.setupLanguageSwitching();
            
            // Initialize dynamic content translation
            this.initializeDynamicTranslation();
            
            // Set up AI Copilot bilingual support
            this.setupAICopilotBilingual();
            
            // Initialize document bilingual support
            this.setupDocumentBilingual();
            
            this.isInitialized = true;
            console.log(`✅ Enhanced Bilingual System initialized (${this.currentLanguage})`);
            
        } catch (error) {
            console.error('❌ Failed to initialize Enhanced Bilingual System:', error);
        }
    }

    async loadComprehensiveTranslations() {
        // Enhanced translations for all platform modules
        const enhancedTranslations = {
            en: {
                // Core Platform
                'platform_title': 'Angkor Compliance Platform',
                'platform_subtitle': 'AI-Powered Factory Compliance Management',
                'welcome_message': 'Welcome to Angkor Compliance',
                'loading': 'Loading...',
                'error': 'Error',
                'success': 'Success',
                'warning': 'Warning',
                'info': 'Information',
                
                // Navigation
                'dashboard': 'Dashboard',
                'factories': 'Factories',
                'documents': 'Documents',
                'caps': 'Corrective Actions',
                'grievances': 'Grievances',
                'permits': 'Permits',
                'training': 'Training',
                'analytics': 'Analytics',
                'settings': 'Settings',
                'profile': 'Profile',
                'logout': 'Logout',
                
                // Dashboard Components
                'overview': 'Overview',
                'recent_activities': 'Recent Activities',
                'quick_actions': 'Quick Actions',
                'system_alerts': 'System Alerts',
                'compliance_score': 'Compliance Score',
                'risk_level': 'Risk Level',
                'pending_items': 'Pending Items',
                'overdue_items': 'Overdue Items',
                
                // Factory Management
                'factory_name': 'Factory Name',
                'factory_location': 'Location',
                'factory_workers': 'Workers',
                'factory_status': 'Status',
                'add_factory': 'Add Factory',
                'edit_factory': 'Edit Factory',
                'delete_factory': 'Delete Factory',
                'factory_details': 'Factory Details',
                
                // Document Management
                'upload_document': 'Upload Document',
                'document_type': 'Document Type',
                'document_name': 'Document Name',
                'upload_date': 'Upload Date',
                'expiry_date': 'Expiry Date',
                'document_status': 'Status',
                'version_control': 'Version Control',
                'document_history': 'Document History',
                
                // CAP Management
                'corrective_actions': 'Corrective Actions',
                'new_cap': 'New CAP',
                'cap_title': 'CAP Title',
                'cap_description': 'Description',
                'cap_priority': 'Priority',
                'cap_deadline': 'Deadline',
                'cap_assignee': 'Assignee',
                'cap_status': 'Status',
                'cap_progress': 'Progress',
                
                // Grievance System
                'grievance_system': 'Grievance System',
                'new_grievance': 'New Grievance',
                'grievance_type': 'Type',
                'grievance_severity': 'Severity',
                'grievance_status': 'Status',
                'anonymous_submission': 'Anonymous Submission',
                'grievance_tracking': 'Grievance Tracking',
                
                // AI Copilot
                'ai_copilot': 'AI Copilot',
                'ask_ai': 'Ask AI',
                'ai_suggestions': 'AI Suggestions',
                'generate_cap': 'Generate CAP',
                'explain_requirement': 'Explain Requirement',
                'audit_readiness': 'Audit Readiness',
                'risk_assessment': 'Risk Assessment',
                
                // Analytics
                'compliance_analytics': 'Compliance Analytics',
                'risk_heatmap': 'Risk Heatmap',
                'kpi_dashboard': 'KPI Dashboard',
                'trend_analysis': 'Trend Analysis',
                'performance_metrics': 'Performance Metrics',
                
                // Settings
                'user_settings': 'User Settings',
                'language_preference': 'Language Preference',
                'notification_settings': 'Notification Settings',
                'security_settings': 'Security Settings',
                'data_export': 'Data Export',
                
                // Common Actions
                'save': 'Save',
                'cancel': 'Cancel',
                'delete': 'Delete',
                'edit': 'Edit',
                'view': 'View',
                'add': 'Add',
                'search': 'Search',
                'filter': 'Filter',
                'export': 'Export',
                'import': 'Import',
                
                // Status
                'active': 'Active',
                'inactive': 'Inactive',
                'pending': 'Pending',
                'completed': 'Completed',
                'overdue': 'Overdue',
                'expired': 'Expired',
                
                // Priority
                'low': 'Low',
                'medium': 'Medium',
                'high': 'High',
                'critical': 'Critical'
            },
            km: {
                // Core Platform
                'platform_title': 'វេទិកាការអនុលោមតាមអង្គរ',
                'platform_subtitle': 'ការគ្រប់គ្រងការអនុលោមតាមរោងចក្រដោយ AI',
                'welcome_message': 'សូមស្វាគមន៍មកកាន់វេទិកាការអនុលោមតាមអង្គរ',
                'loading': 'កំពុងផ្ទុក...',
                'error': 'កំហុស',
                'success': 'ជោគជ័យ',
                'warning': 'ការព្រមាន',
                'info': 'ព័ត៌មាន',
                
                // Navigation
                'dashboard': 'ផ្ទាំងគ្រប់គ្រង',
                'factories': 'រោងចក្រ',
                'documents': 'ឯកសារ',
                'caps': 'សកម្មភាពកែតម្រូវ',
                'grievances': 'ការទាមទារ',
                'permits': 'អាជ្ញាប័ណ្ឌ',
                'training': 'ការបណ្តុះបណ្តាល',
                'analytics': 'ការវិភាគ',
                'settings': 'ការកំណត់',
                'profile': 'ប្រវត្តិរូប',
                'logout': 'ចាកចេញ',
                
                // Dashboard Components
                'overview': 'ទិដ្ឋភាពទូទៅ',
                'recent_activities': 'សកម្មភាពថ្មីៗ',
                'quick_actions': 'សកម្មភាពរហ័ស',
                'system_alerts': 'ការជូនដំណឹងប្រព័ន្ធ',
                'compliance_score': 'ពិន្ទុការអនុលោមតាម',
                'risk_level': 'កម្រិតហានិភ័យ',
                'pending_items': 'ធាតុរង់ចាំ',
                'overdue_items': 'ធាតុហួសកំណត់',
                
                // Factory Management
                'factory_name': 'ឈ្មោះរោងចក្រ',
                'factory_location': 'ទីតាំង',
                'factory_workers': 'កម្មករ',
                'factory_status': 'ស្ថានភាព',
                'add_factory': 'បន្ថែមរោងចក្រ',
                'edit_factory': 'កែសម្រួលរោងចក្រ',
                'delete_factory': 'លុបរោងចក្រ',
                'factory_details': 'ព័ត៌មានលម្អិតរោងចក្រ',
                
                // Document Management
                'upload_document': 'ផ្ទុកឯកសារ',
                'document_type': 'ប្រភេទឯកសារ',
                'document_name': 'ឈ្មោះឯកសារ',
                'upload_date': 'កាលបរិច្ឆេទផ្ទុក',
                'expiry_date': 'កាលបរិច្ឆេទផុតកំណត់',
                'document_status': 'ស្ថានភាព',
                'version_control': 'ការគ្រប់គ្រងកំណែ',
                'document_history': 'ប្រវត្តិឯកសារ',
                
                // CAP Management
                'corrective_actions': 'សកម្មភាពកែតម្រូវ',
                'new_cap': 'ផែនការកែតម្រូវថ្មី',
                'cap_title': 'ចំណងជើងផែនការ',
                'cap_description': 'ការពិពណ៌នា',
                'cap_priority': 'អាទិភាព',
                'cap_deadline': 'កាលបរិច្ឆេទកំណត់',
                'cap_assignee': 'អ្នកទទួលខុសត្រូវ',
                'cap_status': 'ស្ថានភាព',
                'cap_progress': 'ការរីកចម្រើន',
                
                // Grievance System
                'grievance_system': 'ប្រព័ន្ធការទាមទារ',
                'new_grievance': 'ការទាមទារថ្មី',
                'grievance_type': 'ប្រភេទ',
                'grievance_severity': 'ភាពធ្ងន់ធ្ងរ',
                'grievance_status': 'ស្ថានភាព',
                'anonymous_submission': 'ការដាក់ស្នើអនាមិក',
                'grievance_tracking': 'ការតាមដានការទាមទារ',
                
                // AI Copilot
                'ai_copilot': 'អ្នកជំនួយ AI',
                'ask_ai': 'សួរ AI',
                'ai_suggestions': 'ការណែនាំ AI',
                'generate_cap': 'បង្កើតផែនការកែតម្រូវ',
                'explain_requirement': 'ពន្យល់តម្រូវការ',
                'audit_readiness': 'ភាពរួចរាល់សម្រាប់ការត្រួតពិនិត្យ',
                'risk_assessment': 'ការវាយតម្លៃហានិភ័យ',
                
                // Analytics
                'compliance_analytics': 'ការវិភាគការអនុលោមតាម',
                'risk_heatmap': 'ផែនទីកំដៅហានិភ័យ',
                'kpi_dashboard': 'ផ្ទាំងគ្រប់គ្រង KPI',
                'trend_analysis': 'ការវិភាគគន្លង',
                'performance_metrics': 'វិធានការដំណើរការ',
                
                // Settings
                'user_settings': 'ការកំណត់អ្នកប្រើប្រាស់',
                'language_preference': 'ចំណូលចិត្តភាសា',
                'notification_settings': 'ការកំណត់ការជូនដំណឹង',
                'security_settings': 'ការកំណត់សុវត្ថិភាព',
                'data_export': 'ការនាំចេញទិន្នន័យ',
                
                // Common Actions
                'save': 'រក្សាទុក',
                'cancel': 'បោះបង់',
                'delete': 'លុប',
                'edit': 'កែសម្រួល',
                'view': 'មើល',
                'add': 'បន្ថែម',
                'search': 'ស្វែងរក',
                'filter': 'ច្រោះ',
                'export': 'នាំចេញ',
                'import': 'នាំចូល',
                
                // Status
                'active': 'សកម្ម',
                'inactive': 'អសកម្ម',
                'pending': 'រង់ចាំ',
                'completed': 'បានបញ្ចប់',
                'overdue': 'ហួសកំណត់',
                'expired': 'ផុតកំណត់',
                
                // Priority
                'low': 'ទាប',
                'medium': 'មធ្យម',
                'high': 'ខ្ពស់',
                'critical': 'សំខាន់'
            }
        };

        // Merge with existing translations
        if (window.translations) {
            Object.assign(window.translations.en, enhancedTranslations.en);
            Object.assign(window.translations.km, enhancedTranslations.km);
        } else {
            window.translations = enhancedTranslations;
        }

        // Cache translations for performance
        this.translationCache.set('en', enhancedTranslations.en);
        this.translationCache.set('km', enhancedTranslations.km);
    }

    initializeLanguageDetection() {
        // Detect user's preferred language
        const browserLang = navigator.language || navigator.userLanguage;
        const savedLang = localStorage.getItem('language');
        
        if (!savedLang) {
            if (browserLang.startsWith('km') || browserLang.startsWith('khm')) {
                this.currentLanguage = 'km';
            } else {
                this.currentLanguage = 'en';
            }
            localStorage.setItem('language', this.currentLanguage);
        }
    }

    setupLanguageSwitching() {
        // Enhanced language switching with real-time updates
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-lang]')) {
                e.preventDefault();
                const lang = e.target.closest('[data-lang]').dataset.lang;
                this.switchLanguage(lang);
            }
        });

        // Language toggle button
        const langToggle = document.getElementById('language-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                const newLang = this.currentLanguage === 'en' ? 'km' : 'en';
                this.switchLanguage(newLang);
            });
        }
    }

    switchLanguage(lang) {
        if (lang === this.currentLanguage) return;
        
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        
        // Update UI elements
        this.updateLanguageUI();
        
        // Update all translated content
        this.updateAllContent();
        
        // Notify other components
        this.notifyLanguageChange(lang);
        
        console.log(`🌐 Language switched to: ${lang}`);
    }

    updateLanguageUI() {
        // Update language selector buttons
        const langOptions = document.querySelectorAll('[data-lang]');
        langOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.lang === this.currentLanguage);
        });

        // Update language toggle button
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            const span = langToggle.querySelector('span');
            if (span) {
                span.textContent = this.currentLanguage.toUpperCase();
            }
        }

        // Update mobile language selector
        const mobileLangSpan = document.querySelector('.mobile-language-selector span');
        if (mobileLangSpan) {
            mobileLangSpan.textContent = `Language: ${this.currentLanguage === 'en' ? 'English' : 'ខ្មែរ'}`;
        }
    }

    updateAllContent() {
        // Update all elements with data-translate attribute
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = this.t(key);
        });

        // Update placeholders
        const inputs = document.querySelectorAll('[data-translate-placeholder]');
        inputs.forEach(input => {
            const key = input.getAttribute('data-translate-placeholder');
            input.placeholder = this.t(key);
        });

        // Update titles
        const titles = document.querySelectorAll('[data-translate-title]');
        titles.forEach(title => {
            const key = title.getAttribute('data-translate-title');
            title.title = this.t(key);
        });

        // Update dynamic content
        this.updateDynamicContent();
    }

    updateDynamicContent() {
        // Update dashboard components
        this.updateDashboardContent();
        
        // Update AI Copilot content
        this.updateAICopilotContent();
        
        // Update form labels and buttons
        this.updateFormContent();
        
        // Update navigation
        this.updateNavigationContent();
    }

    updateDashboardContent() {
        // Update dashboard widgets and components
        const dashboardElements = document.querySelectorAll('.dashboard-widget, .widget-title, .metric-label');
        dashboardElements.forEach(element => {
            const key = element.dataset.translateKey;
            if (key) {
                element.textContent = this.t(key);
            }
        });
    }

    updateAICopilotContent() {
        // Update AI Copilot interface
        const aiElements = document.querySelectorAll('.ai-copilot-widget .widget-title, .ai-copilot-widget .quick-actions button');
        aiElements.forEach(element => {
            const key = element.dataset.translateKey;
            if (key) {
                element.textContent = this.t(key);
            }
        });
    }

    updateFormContent() {
        // Update form labels, placeholders, and buttons
        const formElements = document.querySelectorAll('label, input[placeholder], button[type="submit"]');
        formElements.forEach(element => {
            const key = element.dataset.translateKey;
            if (key) {
                if (element.tagName === 'INPUT') {
                    element.placeholder = this.t(key);
                } else {
                    element.textContent = this.t(key);
                }
            }
        });
    }

    updateNavigationContent() {
        // Update navigation menu items
        const navElements = document.querySelectorAll('.nav-link, .mobile-nav-link');
        navElements.forEach(element => {
            const key = element.dataset.translateKey;
            if (key) {
                element.textContent = this.t(key);
            }
        });
    }

    initializeDynamicTranslation() {
        // Set up dynamic translation for new content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.translateElement(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    translateElement(element) {
        // Translate element and its children
        if (element.dataset.translateKey) {
            element.textContent = this.t(element.dataset.translateKey);
        }

        const children = element.querySelectorAll('[data-translate-key]');
        children.forEach(child => {
            child.textContent = this.t(child.dataset.translateKey);
        });
    }

    setupAICopilotBilingual() {
        // Enhance AI Copilot with bilingual support
        if (window.AICopilot) {
            const originalAsk = window.AICopilot.ask;
            window.AICopilot.ask = async (question) => {
                // Add language context to AI questions
                const enhancedQuestion = `${question} [Language: ${this.currentLanguage}]`;
                return await originalAsk.call(window.AICopilot, enhancedQuestion);
            };
        }
    }

    setupDocumentBilingual() {
        // Set up bilingual document processing
        if (window.documentManagement) {
            const originalProcess = window.documentManagement.processDocument;
            window.documentManagement.processDocument = async (document) => {
                // Add language detection and processing
                document.language = this.currentLanguage;
                return await originalProcess.call(window.documentManagement, document);
            };
        }
    }

    notifyLanguageChange(lang) {
        // Notify all components of language change
        const event = new CustomEvent('languageChanged', {
            detail: { language: lang, previousLanguage: this.currentLanguage }
        });
        document.dispatchEvent(event);
    }

    // Translation function
    t(key) {
        const translations = this.translationCache.get(this.currentLanguage);
        return translations?.[key] || window.translations?.[this.currentLanguage]?.[key] || key;
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Check if language is Khmer
    isKhmer() {
        return this.currentLanguage === 'km';
    }

    // Check if language is English
    isEnglish() {
        return this.currentLanguage === 'en';
    }

    // Format date according to language
    formatDate(date, options = {}) {
        const locale = this.currentLanguage === 'km' ? 'km-KH' : 'en-US';
        return new Intl.DateTimeFormat(locale, options).format(date);
    }

    // Format number according to language
    formatNumber(number, options = {}) {
        const locale = this.currentLanguage === 'km' ? 'km-KH' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(number);
    }
}

// Initialize Enhanced Bilingual System
window.enhancedBilingualSystem = new EnhancedBilingualSystem();

// Export for use in other files
window.t = (key) => window.enhancedBilingualSystem.t(key);
window.changeLanguage = (lang) => window.enhancedBilingualSystem.switchLanguage(lang);
window.getCurrentLanguage = () => window.enhancedBilingualSystem.getCurrentLanguage();
window.isKhmer = () => window.enhancedBilingualSystem.isKhmer();
window.isEnglish = () => window.enhancedBilingualSystem.isEnglish();
