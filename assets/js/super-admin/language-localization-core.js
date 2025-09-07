// Language & Localization Management Core for Super Admin
class LanguageLocalizationCore {
    constructor() {
        this.currentUser = null;
        this.languages = [];
        this.translations = [];
        this.localizationSettings = [];
        this.currentTab = 'languages';
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        console.log('🌐 Initializing Language & Localization Management Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ Language & Localization Management Core initialized');
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
            window.superAdminNavigation.updateCurrentPage('Language & Localization');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadLanguages(),
            this.loadTranslations(),
            this.loadLocalizationSettings()
        ]);
        
        this.updateOverviewStats();
        this.renderLanguages();
        this.renderTranslations();
        this.renderLocalizationSettings();
    }
    
    async loadLanguages() {
        try {
            const languagesRef = this.collection(this.db, 'languages');
            const snapshot = await this.getDocs(languagesRef);
            this.languages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.languages.length === 0) {
                this.languages = this.getMockLanguages();
            }
            console.log(`✓ Loaded ${this.languages.length} languages`);
        } catch (error) {
            console.error('Error loading languages:', error);
            this.languages = this.getMockLanguages();
        }
    }
    
    async loadTranslations() {
        try {
            const translationsRef = this.collection(this.db, 'translations');
            const snapshot = await this.getDocs(translationsRef);
            this.translations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.translations.length === 0) {
                this.translations = this.getMockTranslations();
            }
            console.log(`✓ Loaded ${this.translations.length} translations`);
        } catch (error) {
            console.error('Error loading translations:', error);
            this.translations = this.getMockTranslations();
        }
    }
    
    async loadLocalizationSettings() {
        try {
            const settingsRef = this.collection(this.db, 'localization_settings');
            const snapshot = await this.getDocs(settingsRef);
            this.localizationSettings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.localizationSettings.length === 0) {
                this.localizationSettings = this.getMockLocalizationSettings();
            }
            console.log(`✓ Loaded ${this.localizationSettings.length} localization settings`);
        } catch (error) {
            console.error('Error loading localization settings:', error);
            this.localizationSettings = this.getMockLocalizationSettings();
        }
    }
    
    getMockLanguages() {
        return [
            {
                id: 'en',
                name: 'English',
                nativeName: 'English',
                code: 'en',
                flag: '🇺🇸',
                isActive: true,
                isDefault: true,
                translationCoverage: 100,
                lastUpdated: new Date('2024-02-15'),
                description: 'Default language for the system'
            },
            {
                id: 'km',
                name: 'Khmer',
                nativeName: 'ខ្មែរ',
                code: 'km',
                flag: '🇰🇭',
                isActive: true,
                isDefault: false,
                translationCoverage: 98,
                lastUpdated: new Date('2024-02-14'),
                description: 'Official language of Cambodia'
            },
            {
                id: 'th',
                name: 'Thai',
                nativeName: 'ไทย',
                code: 'th',
                flag: '🇹🇭',
                isActive: false,
                isDefault: false,
                translationCoverage: 45,
                lastUpdated: new Date('2024-02-10'),
                description: 'Thai language support (partial)'
            },
            {
                id: 'vi',
                name: 'Vietnamese',
                nativeName: 'Tiếng Việt',
                code: 'vi',
                flag: '🇻🇳',
                isActive: false,
                isDefault: false,
                translationCoverage: 30,
                lastUpdated: new Date('2024-02-08'),
                description: 'Vietnamese language support (partial)'
            }
        ];
    }
    
    getMockTranslations() {
        return [
            {
                id: 'trans_1',
                key: 'dashboard.title',
                english: 'Dashboard',
                khmer: 'ផ្ទាំងគ្រប់គ្រង',
                thai: 'แดชบอร์ด',
                vietnamese: 'Bảng điều khiển',
                status: 'translated',
                category: 'navigation',
                lastUpdated: new Date('2024-02-15')
            },
            {
                id: 'trans_2',
                key: 'factory.management',
                english: 'Factory Management',
                khmer: 'ការគ្រប់គ្រងរោងចក្រ',
                thai: 'การจัดการโรงงาน',
                vietnamese: 'Quản lý nhà máy',
                status: 'translated',
                category: 'navigation',
                lastUpdated: new Date('2024-02-15')
            },
            {
                id: 'trans_3',
                key: 'user.profile',
                english: 'User Profile',
                khmer: 'ប្រវត្តិរូបអ្នកប្រើ',
                thai: 'โปรไฟล์ผู้ใช้',
                vietnamese: 'Hồ sơ người dùng',
                status: 'translated',
                category: 'user',
                lastUpdated: new Date('2024-02-14')
            },
            {
                id: 'trans_4',
                key: 'compliance.audit',
                english: 'Compliance Audit',
                khmer: 'សវនកម្មគោលការណ៍',
                thai: 'การตรวจสอบการปฏิบัติตาม',
                vietnamese: 'Kiểm toán tuân thủ',
                status: 'translated',
                category: 'compliance',
                lastUpdated: new Date('2024-02-14')
            },
            {
                id: 'trans_5',
                key: 'system.settings',
                english: 'System Settings',
                khmer: 'ការកំណត់ប្រព័ន្ធ',
                thai: 'การตั้งค่าระบบ',
                vietnamese: 'Cài đặt hệ thống',
                status: 'translated',
                category: 'system',
                lastUpdated: new Date('2024-02-13')
            },
            {
                id: 'trans_6',
                key: 'notification.alert',
                english: 'Notification Alert',
                khmer: 'ការជូនដំណឹង',
                thai: 'การแจ้งเตือน',
                vietnamese: 'Cảnh báo thông báo',
                status: 'pending',
                category: 'notification',
                lastUpdated: new Date('2024-02-12')
            },
            {
                id: 'trans_7',
                key: 'backup.recovery',
                english: 'Backup & Recovery',
                khmer: 'បម្រុងទុក និង ការស្តារ',
                thai: 'การสำรองข้อมูลและการกู้คืน',
                vietnamese: 'Sao lưu và khôi phục',
                status: 'translated',
                category: 'system',
                lastUpdated: new Date('2024-02-11')
            },
            {
                id: 'trans_8',
                key: 'security.monitoring',
                english: 'Security Monitoring',
                khmer: 'ការតាមដានសុវត្ថិភាព',
                thai: 'การตรวจสอบความปลอดภัย',
                vietnamese: 'Giám sát bảo mật',
                status: 'missing',
                category: 'security',
                lastUpdated: new Date('2024-02-10')
            },
            {
                id: 'trans_9',
                key: 'analytics.report',
                english: 'Analytics Report',
                khmer: 'របាយការណ៍វិភាគ',
                thai: 'รายงานการวิเคราะห์',
                vietnamese: 'Báo cáo phân tích',
                status: 'translated',
                category: 'analytics',
                lastUpdated: new Date('2024-02-09')
            },
            {
                id: 'trans_10',
                key: 'help.support',
                english: 'Help & Support',
                khmer: 'ជំនួយ និង ការគាំទ្រ',
                thai: 'ความช่วยเหลือและการสนับสนุน',
                vietnamese: 'Trợ giúp và hỗ trợ',
                status: 'translated',
                category: 'help',
                lastUpdated: new Date('2024-02-08')
            }
        ];
    }
    
    getMockLocalizationSettings() {
        return [
            {
                id: 'setting_1',
                name: 'Auto Language Detection',
                description: 'Automatically detect user language based on browser settings',
                isEnabled: true,
                settings: {
                    fallbackLanguage: 'en',
                    detectionMethod: 'browser',
                    userOverride: true
                }
            },
            {
                id: 'setting_2',
                name: 'RTL Language Support',
                description: 'Enable right-to-left language support for Arabic and Hebrew',
                isEnabled: false,
                settings: {
                    supportedRTL: ['ar', 'he'],
                    autoDetectRTL: true,
                    cssDirection: 'auto'
                }
            },
            {
                id: 'setting_3',
                name: 'Date & Time Formatting',
                description: 'Format dates and times according to locale preferences',
                isEnabled: true,
                settings: {
                    dateFormat: 'locale',
                    timeFormat: '24h',
                    timezone: 'auto'
                }
            },
            {
                id: 'setting_4',
                name: 'Number Formatting',
                description: 'Format numbers according to locale preferences',
                isEnabled: true,
                settings: {
                    decimalSeparator: 'locale',
                    thousandSeparator: 'locale',
                    currencyFormat: 'locale'
                }
            },
            {
                id: 'setting_5',
                name: 'Currency Localization',
                description: 'Display currencies in local format and symbols',
                isEnabled: true,
                settings: {
                    defaultCurrency: 'USD',
                    showSymbol: true,
                    position: 'before'
                }
            },
            {
                id: 'setting_6',
                name: 'Translation Caching',
                description: 'Cache translations for improved performance',
                isEnabled: true,
                settings: {
                    cacheDuration: '24h',
                    preloadLanguages: ['en', 'km'],
                    compressionEnabled: true
                }
            }
        ];
    }
    
    updateOverviewStats() {
        const supportedLanguages = this.languages.filter(l => l.isActive).length;
        const totalTranslations = this.translations.length;
        const pendingTranslations = this.translations.filter(t => t.status === 'pending' || t.status === 'missing').length;
        const translationCoverage = this.calculateTranslationCoverage();
        
        document.getElementById('supportedLanguages').textContent = supportedLanguages;
        document.getElementById('totalTranslations').textContent = totalTranslations.toLocaleString();
        document.getElementById('pendingTranslations').textContent = pendingTranslations;
        document.getElementById('translationCoverage').textContent = translationCoverage + '%';
    }
    
    calculateTranslationCoverage() {
        const totalTranslations = this.translations.length;
        const translatedCount = this.translations.filter(t => t.status === 'translated').length;
        return totalTranslations > 0 ? Math.round((translatedCount / totalTranslations) * 100) : 0;
    }
    
    renderLanguages() {
        const container = document.getElementById('languageSettings');
        if (!container) return;
        
        container.innerHTML = this.languages.map(language => `
            <div class="language-item ${language.isActive ? 'active' : ''}" onclick="viewLanguage('${language.id}')">
                <div class="language-header-item">
                    <div class="language-name">
                        <div class="language-flag">${language.flag}</div>
                        <div>
                            <div>${language.name}</div>
                            <div style="font-size: var(--text-xs); color: var(--neutral-500);">${language.nativeName}</div>
                        </div>
                    </div>
                    <div class="language-status ${language.isActive ? 'active' : 'inactive'}">${language.isActive ? 'active' : 'inactive'}</div>
                </div>
                <div class="language-description">${language.description}</div>
                <div class="language-stats">
                    <span>Code: ${language.code.toUpperCase()}</span>
                    <span>Coverage: ${language.translationCoverage}%</span>
                    <span>Updated: ${this.formatDate(language.lastUpdated)}</span>
                </div>
                <div class="language-actions">
                    <button class="language-btn" onclick="event.stopPropagation(); editLanguage('${language.id}')">
                        Edit
                    </button>
                    <button class="language-btn ${language.isActive ? '' : 'primary'}" onclick="event.stopPropagation(); toggleLanguage('${language.id}')">
                        ${language.isActive ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderTranslations() {
        const container = document.getElementById('translationList');
        if (!container) return;
        
        if (this.translations.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: var(--space-8); color: var(--neutral-500);">
                    <i data-lucide="languages" style="width: 48px; height: 48px; margin: 0 auto var(--space-4); display: block;"></i>
                    <p>No translations found</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }
        
        container.innerHTML = this.translations.map(translation => `
            <div class="translation-item" onclick="viewTranslation('${translation.id}')">
                <div class="translation-header-item">
                    <div class="translation-key">${translation.key}</div>
                    <div class="translation-status ${translation.status}">${translation.status}</div>
                </div>
                <div class="translation-content">
                    <div>
                        <strong>English:</strong> ${translation.english}
                    </div>
                    <div>
                        <strong>Khmer:</strong> ${translation.khmer}
                    </div>
                </div>
                <div class="translation-actions">
                    <button class="translation-action-btn" onclick="event.stopPropagation(); editTranslation('${translation.id}')">
                        Edit
                    </button>
                    <button class="translation-action-btn" onclick="event.stopPropagation(); validateTranslation('${translation.id}')">
                        Validate
                    </button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    renderLocalizationSettings() {
        const container = document.getElementById('localizationGrid');
        if (!container) return;
        
        container.innerHTML = this.localizationSettings.map(setting => `
            <div class="localization-item">
                <div class="localization-header-item">
                    <div class="localization-name">${setting.name}</div>
                    <div class="localization-toggle ${setting.isEnabled ? 'active' : ''}" 
                         onclick="toggleLocalizationSetting('${setting.id}')"></div>
                </div>
                <div class="localization-description">${setting.description}</div>
                <div class="localization-settings-list">
                    ${Object.entries(setting.settings).map(([key, value]) => `
                        <div class="localization-setting">
                            <span class="localization-setting-label">${this.formatSettingKey(key)}:</span>
                            <span class="localization-setting-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    formatSettingKey(key) {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
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
        window.addLanguage = () => this.addLanguage();
        window.exportTranslations = () => this.exportTranslations();
        window.refreshLanguages = () => this.refreshLanguages();
        window.importTranslations = () => this.importTranslations();
        window.switchTab = (tabName) => this.switchTab(tabName);
        window.viewLanguage = (languageId) => this.viewLanguage(languageId);
        window.editLanguage = (languageId) => this.editLanguage(languageId);
        window.toggleLanguage = (languageId) => this.toggleLanguage(languageId);
        window.viewTranslation = (translationId) => this.viewTranslation(translationId);
        window.editTranslation = (translationId) => this.editTranslation(translationId);
        window.validateTranslation = (translationId) => this.validateTranslation(translationId);
        window.toggleLocalizationSetting = (settingId) => this.toggleLocalizationSetting(settingId);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const languagesRef = this.collection(this.db, 'languages');
        this.onSnapshot(languagesRef, (snapshot) => {
            this.languages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderLanguages();
        });
        
        const translationsRef = this.collection(this.db, 'translations');
        this.onSnapshot(translationsRef, (snapshot) => {
            this.translations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderTranslations();
        });
        
        const settingsRef = this.collection(this.db, 'localization_settings');
        this.onSnapshot(settingsRef, (snapshot) => {
            this.localizationSettings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderLocalizationSettings();
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
    window.languageLocalizationCore = new LanguageLocalizationCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageLocalizationCore;
}
