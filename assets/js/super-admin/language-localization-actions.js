// Language & Localization Actions for Super Admin
class LanguageLocalizationActions {
    constructor(core) {
        this.core = core;
    }
    
    async addLanguage() {
        this.core.showNotification('info', 'Opening language addition form...');
        
        // Simulate opening language addition form
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.showAddLanguageModal();
    }
    
    showAddLanguageModal() {
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
                        Add New Language
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
                    <form id="addLanguageForm">
                        <div style="margin-bottom: var(--space-4);">
                            <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                Language Name
                            </label>
                            <input type="text" id="languageName" required style="
                                width: 100%;
                                padding: var(--space-3);
                                border: 1px solid var(--neutral-200);
                                border-radius: var(--radius-md);
                                font-size: var(--text-sm);
                            " placeholder="e.g., French">
                        </div>
                        
                        <div style="margin-bottom: var(--space-4);">
                            <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                Native Name
                            </label>
                            <input type="text" id="nativeName" required style="
                                width: 100%;
                                padding: var(--space-3);
                                border: 1px solid var(--neutral-200);
                                border-radius: var(--radius-md);
                                font-size: var(--text-sm);
                            " placeholder="e.g., Français">
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
                            <div>
                                <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                    Language Code
                                </label>
                                <input type="text" id="languageCode" required style="
                                    width: 100%;
                                    padding: var(--space-3);
                                    border: 1px solid var(--neutral-200);
                                    border-radius: var(--radius-md);
                                    font-size: var(--text-sm);
                                " placeholder="e.g., fr" maxlength="2">
                            </div>
                            
                            <div>
                                <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                    Flag Emoji
                                </label>
                                <input type="text" id="flagEmoji" required style="
                                    width: 100%;
                                    padding: var(--space-3);
                                    border: 1px solid var(--neutral-200);
                                    border-radius: var(--radius-md);
                                    font-size: var(--text-sm);
                                " placeholder="e.g., 🇫🇷" maxlength="2">
                            </div>
                        </div>
                        
                        <div style="margin-bottom: var(--space-4);">
                            <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                Description
                            </label>
                            <textarea id="languageDescription" style="
                                width: 100%;
                                padding: var(--space-3);
                                border: 1px solid var(--neutral-200);
                                border-radius: var(--radius-md);
                                font-size: var(--text-sm);
                                min-height: 80px;
                                resize: vertical;
                            " placeholder="Brief description of the language"></textarea>
                        </div>
                        
                        <div style="margin-bottom: var(--space-4);">
                            <label style="display: flex; align-items: center; gap: var(--space-2);">
                                <input type="checkbox" id="isDefault" style="
                                    width: 16px;
                                    height: 16px;
                                ">
                                <span style="font-weight: 500; color: var(--neutral-700);">Set as default language</span>
                            </label>
                        </div>
                        
                        <div style="display: flex; gap: var(--space-3); justify-content: flex-end;">
                            <button type="button" onclick="this.closest('.modal-overlay').remove()" style="
                                padding: var(--space-3) var(--space-6);
                                border: 1px solid var(--neutral-200);
                                border-radius: var(--radius-md);
                                background: white;
                                color: var(--neutral-700);
                                font-size: var(--text-sm);
                                cursor: pointer;
                            ">Cancel</button>
                            <button type="submit" style="
                                padding: var(--space-3) var(--space-6);
                                border: none;
                                border-radius: var(--radius-md);
                                background: var(--primary-600);
                                color: white;
                                font-size: var(--text-sm);
                                cursor: pointer;
                            ">Add Language</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        modal.querySelector('#addLanguageForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddLanguage(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    async handleAddLanguage(modal) {
        const name = modal.querySelector('#languageName').value;
        const nativeName = modal.querySelector('#nativeName').value;
        const code = modal.querySelector('#languageCode').value.toLowerCase();
        const flag = modal.querySelector('#flagEmoji').value;
        const description = modal.querySelector('#languageDescription').value;
        const isDefault = modal.querySelector('#isDefault').checked;
        
        try {
            this.core.showNotification('info', 'Adding new language...');
            
            // Simulate adding language
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create new language
            const newLanguage = {
                id: code,
                name,
                nativeName,
                code,
                flag,
                isActive: true,
                isDefault,
                translationCoverage: 0,
                lastUpdated: new Date(),
                description
            };
            
            // Add to languages array
            this.core.languages.push(newLanguage);
            
            // Update UI
            this.core.updateOverviewStats();
            this.core.renderLanguages();
            
            modal.remove();
            this.core.showNotification('success', 'Language added successfully');
            
        } catch (error) {
            console.error('Error adding language:', error);
            this.core.showNotification('error', 'Failed to add language');
        }
    }
    
    async exportTranslations() {
        try {
            this.core.showNotification('info', 'Exporting translations...');
            
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create CSV content
            const csvContent = this.createTranslationsCSV();
            
            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `translations_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.core.showNotification('success', 'Translations exported successfully');
            
        } catch (error) {
            console.error('Error exporting translations:', error);
            this.core.showNotification('error', 'Failed to export translations');
        }
    }
    
    createTranslationsCSV() {
        const headers = ['Key', 'English', 'Khmer', 'Thai', 'Vietnamese', 'Status', 'Category', 'Last Updated'];
        const rows = this.core.translations.map(translation => [
            translation.key,
            translation.english,
            translation.khmer,
            translation.thai,
            translation.vietnamese,
            translation.status,
            translation.category,
            this.core.formatDate(translation.lastUpdated)
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }
    
    async refreshLanguages() {
        try {
            this.core.showNotification('info', 'Refreshing languages...');
            
            // Simulate refresh
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            await this.core.loadInitialData();
            
            this.core.showNotification('success', 'Languages refreshed successfully');
            
        } catch (error) {
            console.error('Error refreshing languages:', error);
            this.core.showNotification('error', 'Failed to refresh languages');
        }
    }
    
    async importTranslations() {
        this.core.showNotification('info', 'Opening translation import dialog...');
        
        // Simulate opening import dialog
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.core.showNotification('success', 'Translation import dialog opened');
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
    
    async viewLanguage(languageId) {
        const language = this.core.languages.find(l => l.id === languageId);
        if (!language) return;
        
        this.showLanguageDetailsModal(language);
    }
    
    showLanguageDetailsModal(language) {
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
                        ${language.flag} ${language.name}
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
                        <div style="display: flex; gap: var(--space-4); margin-bottom: var(--space-3);">
                            <div>
                                <strong>Native Name:</strong> ${language.nativeName}
                            </div>
                            <div>
                                <strong>Code:</strong> ${language.code.toUpperCase()}
                            </div>
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Status:</strong> 
                            <span class="language-status ${language.isActive ? 'active' : 'inactive'}" style="
                                padding: var(--space-1) var(--space-2);
                                border-radius: var(--radius-sm);
                                font-size: var(--text-xs);
                                font-weight: 600;
                                text-transform: uppercase;
                                margin-left: var(--space-2);
                            ">${language.isActive ? 'active' : 'inactive'}</span>
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Default Language:</strong> ${language.isDefault ? 'Yes' : 'No'}
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Translation Coverage:</strong> ${language.translationCoverage}%
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Last Updated:</strong> ${this.core.formatDate(language.lastUpdated)}
                        </div>
                        
                        <div style="margin-bottom: var(--space-4);">
                            <strong>Description:</strong>
                            <p style="margin-top: var(--space-2); color: var(--neutral-600); line-height: 1.6;">
                                ${language.description}
                            </p>
                        </div>
                        
                        <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--neutral-200);">
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Language Actions
                            </h4>
                            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
                                <button onclick="editLanguage('${language.id}')" style="
                                    padding: var(--space-2) var(--space-3);
                                    border: 1px solid var(--neutral-200);
                                    border-radius: var(--radius-md);
                                    background: white;
                                    color: var(--neutral-700);
                                    font-size: var(--text-sm);
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                " onmouseover="this.style.background='var(--primary-50)'; this.style.borderColor='var(--primary-200)'; this.style.color='var(--primary-700)'"
                                   onmouseout="this.style.background='white'; this.style.borderColor='var(--neutral-200)'; this.style.color='var(--neutral-700)'">
                                    Edit Language
                                </button>
                                <button onclick="toggleLanguage('${language.id}')" style="
                                    padding: var(--space-2) var(--space-3);
                                    border: 1px solid var(--neutral-200);
                                    border-radius: var(--radius-md);
                                    background: white;
                                    color: var(--neutral-700);
                                    font-size: var(--text-sm);
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                " onmouseover="this.style.background='var(--primary-50)'; this.style.borderColor='var(--primary-200)'; this.style.color='var(--primary-700)'"
                                   onmouseout="this.style.background='white'; this.style.borderColor='var(--neutral-200)'; this.style.color='var(--neutral-700)'">
                                    ${language.isActive ? 'Disable' : 'Enable'} Language
                                </button>
                                <button onclick="manageTranslations('${language.id}')" style="
                                    padding: var(--space-2) var(--space-3);
                                    border: 1px solid var(--neutral-200);
                                    border-radius: var(--radius-md);
                                    background: white;
                                    color: var(--neutral-700);
                                    font-size: var(--text-sm);
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                " onmouseover="this.style.background='var(--primary-50)'; this.style.borderColor='var(--primary-200)'; this.style.color='var(--primary-700)'"
                                   onmouseout="this.style.background='white'; this.style.borderColor='var(--neutral-200)'; this.style.color='var(--neutral-700)'">
                                    Manage Translations
                                </button>
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
    
    async editLanguage(languageId) {
        const language = this.core.languages.find(l => l.id === languageId);
        if (!language) return;
        
        this.core.showNotification('info', `Editing ${language.name}...`);
        
        // Simulate editing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.core.showNotification('success', `${language.name} edited successfully`);
    }
    
    async toggleLanguage(languageId) {
        const language = this.core.languages.find(l => l.id === languageId);
        if (!language) return;
        
        const action = language.isActive ? 'disable' : 'enable';
        
        if (!confirm(`Are you sure you want to ${action} "${language.name}"?`)) {
            return;
        }
        
        try {
            this.core.showNotification('info', `${action.charAt(0).toUpperCase() + action.slice(1)}ing ${language.name}...`);
            
            // Simulate toggle
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            language.isActive = !language.isActive;
            language.lastUpdated = new Date();
            
            this.core.updateOverviewStats();
            this.core.renderLanguages();
            this.core.showNotification('success', `${language.name} ${action}d successfully`);
            
        } catch (error) {
            console.error('Error toggling language:', error);
            this.core.showNotification('error', `Failed to ${action} language`);
        }
    }
    
    async viewTranslation(translationId) {
        const translation = this.core.translations.find(t => t.id === translationId);
        if (!translation) return;
        
        this.showTranslationDetailsModal(translation);
    }
    
    showTranslationDetailsModal(translation) {
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
                max-width: 800px;
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
                        ${translation.key}
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
                        <div style="display: flex; gap: var(--space-4); margin-bottom: var(--space-3);">
                            <div>
                                <strong>Status:</strong> 
                                <span class="translation-status ${translation.status}" style="
                                    padding: var(--space-1) var(--space-2);
                                    border-radius: var(--radius-sm);
                                    font-size: var(--text-xs);
                                    font-weight: 600;
                                    text-transform: uppercase;
                                    margin-left: var(--space-2);
                                ">${translation.status}</span>
                            </div>
                            <div>
                                <strong>Category:</strong> ${translation.category}
                            </div>
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Last Updated:</strong> ${this.core.formatDate(translation.lastUpdated)}
                        </div>
                        
                        <div style="margin-bottom: var(--space-4);">
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Translations
                            </h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                                <div>
                                    <strong>English:</strong>
                                    <p style="margin-top: var(--space-1); color: var(--neutral-600);">${translation.english}</p>
                                </div>
                                <div>
                                    <strong>Khmer:</strong>
                                    <p style="margin-top: var(--space-1); color: var(--neutral-600);">${translation.khmer}</p>
                                </div>
                                <div>
                                    <strong>Thai:</strong>
                                    <p style="margin-top: var(--space-1); color: var(--neutral-600);">${translation.thai}</p>
                                </div>
                                <div>
                                    <strong>Vietnamese:</strong>
                                    <p style="margin-top: var(--space-1); color: var(--neutral-600);">${translation.vietnamese}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--neutral-200);">
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Translation Actions
                            </h4>
                            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
                                <button onclick="editTranslation('${translation.id}')" style="
                                    padding: var(--space-2) var(--space-3);
                                    border: 1px solid var(--neutral-200);
                                    border-radius: var(--radius-md);
                                    background: white;
                                    color: var(--neutral-700);
                                    font-size: var(--text-sm);
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                " onmouseover="this.style.background='var(--primary-50)'; this.style.borderColor='var(--primary-200)'; this.style.color='var(--primary-700)'"
                                   onmouseout="this.style.background='white'; this.style.borderColor='var(--neutral-200)'; this.style.color='var(--neutral-700)'">
                                    Edit Translation
                                </button>
                                <button onclick="validateTranslation('${translation.id}')" style="
                                    padding: var(--space-2) var(--space-3);
                                    border: 1px solid var(--neutral-200);
                                    border-radius: var(--radius-md);
                                    background: white;
                                    color: var(--neutral-700);
                                    font-size: var(--text-sm);
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                " onmouseover="this.style.background='var(--primary-50)'; this.style.borderColor='var(--primary-200)'; this.style.color='var(--primary-700)'"
                                   onmouseout="this.style.background='white'; this.style.borderColor='var(--neutral-200)'; this.style.color='var(--neutral-700)'">
                                    Validate Translation
                                </button>
                                <button onclick="copyTranslation('${translation.id}')" style="
                                    padding: var(--space-2) var(--space-3);
                                    border: 1px solid var(--neutral-200);
                                    border-radius: var(--radius-md);
                                    background: white;
                                    color: var(--neutral-700);
                                    font-size: var(--text-sm);
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                " onmouseover="this.style.background='var(--primary-50)'; this.style.borderColor='var(--primary-200)'; this.style.color='var(--primary-700)'"
                                   onmouseout="this.style.background='white'; this.style.borderColor='var(--neutral-200)'; this.style.color='var(--neutral-700)'">
                                    Copy Translation
                                </button>
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
    
    async editTranslation(translationId) {
        const translation = this.core.translations.find(t => t.id === translationId);
        if (!translation) return;
        
        this.core.showNotification('info', `Editing translation: ${translation.key}...`);
        
        // Simulate editing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.core.showNotification('success', 'Translation edited successfully');
    }
    
    async validateTranslation(translationId) {
        const translation = this.core.translations.find(t => t.id === translationId);
        if (!translation) return;
        
        try {
            this.core.showNotification('info', 'Validating translation...');
            
            // Simulate validation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update translation status
            translation.status = 'translated';
            translation.lastUpdated = new Date();
            
            this.core.updateOverviewStats();
            this.core.renderTranslations();
            this.core.showNotification('success', 'Translation validated successfully');
            
        } catch (error) {
            console.error('Error validating translation:', error);
            this.core.showNotification('error', 'Failed to validate translation');
        }
    }
    
    async toggleLocalizationSetting(settingId) {
        const setting = this.core.localizationSettings.find(s => s.id === settingId);
        if (!setting) return;
        
        try {
            this.core.showNotification('info', `${setting.isEnabled ? 'Disabling' : 'Enabling'} ${setting.name}...`);
            
            // Simulate toggle
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setting.isEnabled = !setting.isEnabled;
            this.core.renderLocalizationSettings();
            
            this.core.showNotification('success', `${setting.name} ${setting.isEnabled ? 'enabled' : 'disabled'} successfully`);
            
        } catch (error) {
            console.error('Error toggling localization setting:', error);
            this.core.showNotification('error', 'Failed to toggle localization setting');
        }
    }
}

// Initialize actions when core is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.languageLocalizationCore) {
            window.languageLocalizationActions = new LanguageLocalizationActions(window.languageLocalizationCore);
            
            // Override core methods with actions
            window.languageLocalizationCore.addLanguage = () => window.languageLocalizationActions.addLanguage();
            window.languageLocalizationCore.exportTranslations = () => window.languageLocalizationActions.exportTranslations();
            window.languageLocalizationCore.refreshLanguages = () => window.languageLocalizationActions.refreshLanguages();
            window.languageLocalizationCore.importTranslations = () => window.languageLocalizationActions.importTranslations();
            window.languageLocalizationCore.switchTab = (tabName) => window.languageLocalizationActions.switchTab(tabName);
            window.languageLocalizationCore.viewLanguage = (languageId) => window.languageLocalizationActions.viewLanguage(languageId);
            window.languageLocalizationCore.editLanguage = (languageId) => window.languageLocalizationActions.editLanguage(languageId);
            window.languageLocalizationCore.toggleLanguage = (languageId) => window.languageLocalizationActions.toggleLanguage(languageId);
            window.languageLocalizationCore.viewTranslation = (translationId) => window.languageLocalizationActions.viewTranslation(translationId);
            window.languageLocalizationCore.editTranslation = (translationId) => window.languageLocalizationActions.editTranslation(translationId);
            window.languageLocalizationCore.validateTranslation = (translationId) => window.languageLocalizationActions.validateTranslation(translationId);
            window.languageLocalizationCore.toggleLocalizationSetting = (settingId) => window.languageLocalizationActions.toggleLocalizationSetting(settingId);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageLocalizationActions;
}
