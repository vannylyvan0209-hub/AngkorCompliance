/**
 * Internationalization 2025 - JavaScript
 * Support for Khmer and English text with proper typography
 */

class Internationalization2025 {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.supportedLanguages = ['en', 'km'];
        this.translations = {};
        this.init();
    }

    init() {
        this.loadTranslations();
        this.setupLanguageSwitcher();
        this.setupAutoDetection();
        this.setupNumberFormatting();
        this.setupDateFormatting();
        this.setupCurrencyFormatting();
    }

    detectLanguage() {
        // Check localStorage first
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            return savedLang;
        }

        // Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (this.supportedLanguages.includes(browserLang)) {
            return browserLang;
        }

        // Default to English
        return 'en';
    }

    loadTranslations() {
        // Load translations from API or local files
        this.translations = {
            en: {
                // Navigation
                'nav.home': 'Home',
                'nav.dashboard': 'Dashboard',
                'nav.workers': 'Workers',
                'nav.compliance': 'Compliance',
                'nav.reports': 'Reports',
                'nav.settings': 'Settings',
                
                // Common
                'common.save': 'Save',
                'common.cancel': 'Cancel',
                'common.delete': 'Delete',
                'common.edit': 'Edit',
                'common.add': 'Add',
                'common.search': 'Search',
                'common.filter': 'Filter',
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success',
                'common.warning': 'Warning',
                'common.info': 'Information',
                
                // Forms
                'form.name': 'Name',
                'form.email': 'Email',
                'form.password': 'Password',
                'form.confirm-password': 'Confirm Password',
                'form.phone': 'Phone',
                'form.address': 'Address',
                'form.submit': 'Submit',
                'form.reset': 'Reset',
                
                // Roles
                'role.worker': 'Worker',
                'role.factory-admin': 'Factory Admin',
                'role.hr-staff': 'HR Staff',
                'role.grievance-committee': 'Grievance Committee',
                'role.auditor': 'Auditor',
                'role.analytics-user': 'Analytics User',
                'role.super-admin': 'Super Admin',
                
                // Status
                'status.active': 'Active',
                'status.inactive': 'Inactive',
                'status.pending': 'Pending',
                'status.completed': 'Completed',
                'status.cancelled': 'Cancelled'
            },
            km: {
                // Navigation
                'nav.home': 'ទំព័រដើម',
                'nav.dashboard': 'ផ្ទាំងគ្រប់គ្រង',
                'nav.workers': 'កម្មករ',
                'nav.compliance': 'ការអនុលោម',
                'nav.reports': 'របាយការណ៍',
                'nav.settings': 'ការកំណត់',
                
                // Common
                'common.save': 'រក្សាទុក',
                'common.cancel': 'បោះបង់',
                'common.delete': 'លុប',
                'common.edit': 'កែសម្រួល',
                'common.add': 'បន្ថែម',
                'common.search': 'ស្វែងរក',
                'common.filter': 'តម្រង',
                'common.loading': 'កំពុងផ្ទុក...',
                'common.error': 'កំហុស',
                'common.success': 'ជោគជ័យ',
                'common.warning': 'ព្រមាន',
                'common.info': 'ព័ត៌មាន',
                
                // Forms
                'form.name': 'ឈ្មោះ',
                'form.email': 'អ៊ីមែល',
                'form.password': 'ពាក្យសម្ងាត់',
                'form.confirm-password': 'បញ្ជាក់ពាក្យសម្ងាត់',
                'form.phone': 'ទូរស័ព្ទ',
                'form.address': 'អាសយដ្ឋាន',
                'form.submit': 'ដាក់ស្នើ',
                'form.reset': 'កំណត់ឡើងវិញ',
                
                // Roles
                'role.worker': 'កម្មករ',
                'role.factory-admin': 'អ្នកគ្រប់គ្រងរោងចក្រ',
                'role.hr-staff': 'បុគ្គលិកធនធានមនុស្ស',
                'role.grievance-committee': 'គណៈកម្មការបណ្តឹង',
                'role.auditor': 'អ្នកសវនកម្ម',
                'role.analytics-user': 'អ្នកប្រើប្រាស់វិភាគ',
                'role.super-admin': 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់',
                
                // Status
                'status.active': 'សកម្ម',
                'status.inactive': 'មិនសកម្ម',
                'status.pending': 'កំពុងរង់ចាំ',
                'status.completed': 'បានបញ្ចប់',
                'status.cancelled': 'បានលុបចោល'
            }
        };
    }

    setupLanguageSwitcher() {
        this.createLanguageSwitcher();
        this.bindLanguageSwitcherEvents();
    }

    createLanguageSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';
        switcher.innerHTML = `
            <div class="current-lang" data-lang="${this.currentLanguage}">
                <img src="${this.getFlagUrl(this.currentLanguage)}" alt="${this.currentLanguage}" class="flag">
                <span>${this.getLanguageName(this.currentLanguage)}</span>
                <i data-lucide="chevron-down" class="icon"></i>
            </div>
            <div class="dropdown">
                ${this.supportedLanguages.map(lang => `
                    <div class="dropdown-item ${lang === this.currentLanguage ? 'active' : ''}" data-lang="${lang}">
                        <img src="${this.getFlagUrl(lang)}" alt="${lang}" class="flag">
                        <span>${this.getLanguageName(lang)}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Insert into header or navigation
        const header = document.querySelector('header, .header, .nav');
        if (header) {
            header.appendChild(switcher);
        } else {
            document.body.appendChild(switcher);
        }
        
        lucide.createIcons();
    }

    bindLanguageSwitcherEvents() {
        const switcher = document.querySelector('.language-switcher');
        if (!switcher) return;

        const currentLang = switcher.querySelector('.current-lang');
        const dropdown = switcher.querySelector('.dropdown');
        const dropdownItems = switcher.querySelectorAll('.dropdown-item');

        // Toggle dropdown
        currentLang.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // Handle language selection
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = item.dataset.lang;
                this.switchLanguage(lang);
                dropdown.classList.remove('show');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
    }

    switchLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) return;

        this.currentLanguage = lang;
        localStorage.setItem('preferred-language', lang);
        
        // Update document language
        document.documentElement.lang = lang;
        document.documentElement.dir = this.getTextDirection(lang);
        
        // Update language switcher
        this.updateLanguageSwitcher(lang);
        
        // Translate all elements
        this.translateElements();
        
        // Update number and date formatting
        this.updateFormatting();
        
        // Trigger language change event
        this.triggerLanguageChangeEvent(lang);
    }

    updateLanguageSwitcher(lang) {
        const switcher = document.querySelector('.language-switcher');
        if (!switcher) return;

        const currentLang = switcher.querySelector('.current-lang');
        const dropdownItems = switcher.querySelectorAll('.dropdown-item');

        // Update current language display
        currentLang.dataset.lang = lang;
        currentLang.querySelector('.flag').src = this.getFlagUrl(lang);
        currentLang.querySelector('span').textContent = this.getLanguageName(lang);

        // Update dropdown items
        dropdownItems.forEach(item => {
            item.classList.toggle('active', item.dataset.lang === lang);
        });
    }

    translateElements() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.getTranslation(key);
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    getTranslation(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    setupAutoDetection() {
        // Auto-detect language from content
        this.detectContentLanguage();
        
        // Watch for new content
        const observer = new MutationObserver(() => {
            this.detectContentLanguage();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    detectContentLanguage() {
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
        let khmerCount = 0;
        let englishCount = 0;

        textElements.forEach(element => {
            const text = element.textContent.trim();
            if (text.length > 0) {
                if (this.isKhmerText(text)) {
                    khmerCount++;
                } else if (this.isEnglishText(text)) {
                    englishCount++;
                }
            }
        });

        // Auto-switch if content is predominantly in one language
        if (khmerCount > englishCount * 2 && this.currentLanguage !== 'km') {
            this.switchLanguage('km');
        } else if (englishCount > khmerCount * 2 && this.currentLanguage !== 'en') {
            this.switchLanguage('en');
        }
    }

    isKhmerText(text) {
        // Check for Khmer Unicode range
        return /[\u1780-\u17FF]/.test(text);
    }

    isEnglishText(text) {
        // Check for English characters
        return /^[a-zA-Z\s.,!?;:'"()-]+$/.test(text);
    }

    setupNumberFormatting() {
        this.numberFormatters = {
            en: new Intl.NumberFormat('en-US'),
            km: new Intl.NumberFormat('km-KH')
        };
    }

    setupDateFormatting() {
        this.dateFormatters = {
            en: new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            km: new Intl.DateTimeFormat('km-KH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };
    }

    setupCurrencyFormatting() {
        this.currencyFormatters = {
            en: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }),
            km: new Intl.NumberFormat('km-KH', {
                style: 'currency',
                currency: 'KHR'
            })
        };
    }

    updateFormatting() {
        // Update number formatting
        document.querySelectorAll('[data-format="number"]').forEach(element => {
            const value = parseFloat(element.textContent);
            if (!isNaN(value)) {
                element.textContent = this.formatNumber(value);
            }
        });

        // Update date formatting
        document.querySelectorAll('[data-format="date"]').forEach(element => {
            const date = new Date(element.textContent);
            if (!isNaN(date.getTime())) {
                element.textContent = this.formatDate(date);
            }
        });

        // Update currency formatting
        document.querySelectorAll('[data-format="currency"]').forEach(element => {
            const value = parseFloat(element.textContent);
            if (!isNaN(value)) {
                element.textContent = this.formatCurrency(value);
            }
        });
    }

    formatNumber(number) {
        return this.numberFormatters[this.currentLanguage].format(number);
    }

    formatDate(date) {
        return this.dateFormatters[this.currentLanguage].format(date);
    }

    formatCurrency(amount) {
        return this.currencyFormatters[this.currentLanguage].format(amount);
    }

    getFlagUrl(lang) {
        const flags = {
            en: 'enflag.png',
            km: 'khmerflag.png'
        };
        return flags[lang] || 'enflag.png';
    }

    getLanguageName(lang) {
        const names = {
            en: 'English',
            km: 'ខ្មែរ'
        };
        return names[lang] || lang;
    }

    getTextDirection(lang) {
        const directions = {
            en: 'ltr',
            km: 'ltr' // Khmer is also LTR
        };
        return directions[lang] || 'ltr';
    }

    triggerLanguageChangeEvent(lang) {
        const event = new CustomEvent('languageChanged', {
            detail: { language: lang }
        });
        document.dispatchEvent(event);
    }

    // Public API methods
    t(key) {
        return this.getTranslation(key);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    setLanguage(lang) {
        this.switchLanguage(lang);
    }
}

// Initialize internationalization
document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new Internationalization2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Internationalization2025;
}
