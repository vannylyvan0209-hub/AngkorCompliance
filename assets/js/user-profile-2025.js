/**
 * Angkor Compliance Platform - User Profile JavaScript 2025
 * Modern user profile pages with avatar and form functionality
 */

class UserProfileManager {
    constructor() {
        this.profiles = new Map();
        this.config = {
            enableAvatarUpload: true,
            enableFormValidation: true,
            enableAutoSave: true,
            enableDarkMode: true,
            enableResponsive: true,
            enableAccessibility: true,
            enableAnimations: true,
            enableGlassmorphism: true,
            enableNeumorphism: false,
            enableCompact: false,
            enableLarge: false,
            animationDuration: 300,
            autoSaveDelay: 2000
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeProfiles();
        this.setupAccessibility();
        this.setupResponsive();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.addEventListener('change', (e) => this.handleFormChange(e));
    }

    initializeProfiles() {
        const profileElements = document.querySelectorAll('.user-profile');
        profileElements.forEach((element, index) => {
            const id = element.id || `user-profile-${index}`;
            this.createProfile(id, element);
        });
    }

    setupAccessibility() {
        this.profiles.forEach((profile, id) => {
            const { element } = profile;
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'main');
            }
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'User profile');
            }
        });
    }

    setupResponsive() {
        const updateResponsiveClasses = () => {
            this.profiles.forEach((profile) => {
                const { element } = profile;
                if (window.innerWidth < 768) {
                    element.classList.add('user-profile-mobile');
                } else {
                    element.classList.remove('user-profile-mobile');
                }
            });
        };
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    // Public Methods
    createProfile(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        this.profiles.set(id, {
            id,
            element,
            config,
            isLoaded: false,
            isDirty: false,
            isSaving: false,
            avatar: null,
            userData: {},
            error: null
        });
        
        this.applyConfiguration(this.profiles.get(id));
        return this.profiles.get(id);
    }

    updateProfile(id, userData) {
        const profile = this.profiles.get(id);
        if (!profile) {
            console.error(`Profile with id "${id}" not found`);
            return;
        }
        
        const { config } = profile;
        
        profile.userData = { ...profile.userData, ...userData };
        profile.isDirty = true;
        this.renderProfile(profile);
        
        this.triggerEvent(profile.element, 'userprofile:update', { 
            profile: config, 
            userData: profile.userData 
        });
        
        return this;
    }

    updateAvatar(id, avatarUrl) {
        const profile = this.profiles.get(id);
        if (!profile) {
            console.error(`Profile with id "${id}" not found`);
            return;
        }
        
        const { config } = profile;
        
        profile.avatar = avatarUrl;
        profile.isDirty = true;
        this.renderProfile(profile);
        
        this.triggerEvent(profile.element, 'userprofile:avatar:update', { 
            profile: config, 
            avatar: avatarUrl 
        });
        
        return this;
    }

    saveProfile(id) {
        const profile = this.profiles.get(id);
        if (!profile) {
            console.error(`Profile with id "${id}" not found`);
            return;
        }
        
        const { config } = profile;
        
        if (profile.isSaving) {
            return;
        }
        
        profile.isSaving = true;
        this.updateProfile(profile);
        
        // Simulate save operation
        setTimeout(() => {
            profile.isSaving = false;
            profile.isDirty = false;
            this.updateProfile(profile);
            
            this.triggerEvent(profile.element, 'userprofile:save', { 
                profile: config,
                userData: profile.userData
            });
        }, 1000);
        
        return this;
    }

    resetProfile(id) {
        const profile = this.profiles.get(id);
        if (!profile) {
            console.error(`Profile with id "${id}" not found`);
            return;
        }
        
        const { config } = profile;
        
        profile.isDirty = false;
        this.updateProfile(profile);
        
        this.triggerEvent(profile.element, 'userprofile:reset', { 
            profile: config 
        });
        
        return this;
    }

    // Private Methods
    applyConfiguration(profile) {
        const { element, config } = profile;
        
        if (config.enableAvatarUpload) element.classList.add('user-profile-avatar-enabled');
        if (config.enableFormValidation) element.classList.add('user-profile-validation-enabled');
        if (config.enableAutoSave) element.classList.add('user-profile-autosave-enabled');
        if (config.enableDarkMode) element.classList.add('user-profile-dark-enabled');
        if (config.enableResponsive) element.classList.add('user-profile-responsive-enabled');
        if (config.enableAccessibility) element.classList.add('user-profile-accessibility-enabled');
        if (config.enableAnimations) element.classList.add('user-profile-animations-enabled');
        if (config.enableGlassmorphism) element.classList.add('user-profile-glass');
        if (config.enableNeumorphism) element.classList.add('user-profile-neumorphism');
        if (config.enableCompact) element.classList.add('user-profile-compact');
        if (config.enableLarge) element.classList.add('user-profile-large');
        
        this.addEventListeners(profile);
        this.renderProfile(profile);
    }

    addEventListeners(profile) {
        const { element, config } = profile;
        
        // Avatar upload event listeners
        const avatarInput = element.querySelector('.user-profile-avatar-input');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                this.handleAvatarUpload(profile, e);
            });
        }
        
        // Form button event listeners
        const formButtons = element.querySelectorAll('.user-profile-button');
        formButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.getAttribute('data-action');
                this.handleAction(profile, action);
            });
        });
    }

    renderProfile(profile) {
        const { element, config, userData, avatar, isDirty, isSaving } = profile;
        
        this.updateProfileHeader(profile);
        this.updateProfileContent(profile);
        this.updateProfileState(profile);
    }

    updateProfileHeader(profile) {
        const { element, config, userData, avatar } = profile;
        
        const header = element.querySelector('.user-profile-header');
        if (!header) return;
        
        const avatarImg = header.querySelector('.user-profile-avatar');
        const name = header.querySelector('.user-profile-name');
        const role = header.querySelector('.user-profile-role');
        const email = header.querySelector('.user-profile-email');
        
        if (avatarImg && avatar) {
            avatarImg.src = avatar;
        }
        
        if (name && userData.name) {
            name.textContent = userData.name;
        }
        
        if (role && userData.role) {
            role.textContent = userData.role;
        }
        
        if (email && userData.email) {
            email.textContent = userData.email;
        }
    }

    updateProfileContent(profile) {
        const { element, config, userData } = profile;
        
        const content = element.querySelector('.user-profile-content');
        if (!content) return;
        
        // Update form fields with user data
        const formInputs = content.querySelectorAll('.user-profile-form-input');
        formInputs.forEach(input => {
            const fieldName = input.getAttribute('name');
            if (fieldName && userData[fieldName]) {
                input.value = userData[fieldName];
            }
        });
    }

    updateProfileState(profile) {
        const { element, config, isDirty, isSaving } = profile;
        
        // Update dirty state
        if (isDirty) {
            element.classList.add('user-profile-dirty');
        } else {
            element.classList.remove('user-profile-dirty');
        }
        
        // Update saving state
        if (isSaving) {
            element.classList.add('user-profile-saving');
        } else {
            element.classList.remove('user-profile-saving');
        }
    }

    handleAction(profile, action) {
        const { config } = profile;
        
        switch (action) {
            case 'save':
                this.saveProfile(profile.id);
                break;
            case 'reset':
                this.resetProfile(profile.id);
                break;
            case 'edit':
                this.editProfile(profile);
                break;
            case 'custom':
                if (config.customAction) {
                    config.customAction(profile);
                }
                break;
            default:
                console.log(`Unknown action: ${action}`);
        }
    }

    handleAvatarUpload(profile, event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const { config } = profile;
        
        // Simulate avatar upload
        const reader = new FileReader();
        reader.onload = (e) => {
            this.updateAvatar(profile.id, e.target.result);
        };
        reader.readAsDataURL(file);
    }

    handleFormSubmit(e) {
        const form = e.target;
        const profile = this.findProfileByElement(form);
        
        if (profile) {
            e.preventDefault();
            this.saveProfile(profile.id);
        }
    }

    handleFormChange(e) {
        const input = e.target;
        const profile = this.findProfileByElement(input);
        
        if (profile) {
            const fieldName = input.getAttribute('name');
            if (fieldName) {
                profile.userData[fieldName] = input.value;
                profile.isDirty = true;
                this.updateProfileState(profile);
            }
        }
    }

    findProfileByElement(element) {
        for (const [id, profile] of this.profiles) {
            if (profile.element.contains(element)) {
                return profile;
            }
        }
        return null;
    }

    editProfile(profile) {
        const { config } = profile;
        
        this.triggerEvent(profile.element, 'userprofile:edit', { 
            profile: config 
        });
    }

    // Event Handlers
    handleResize() {
        this.profiles.forEach((profile) => {
            const { config } = profile;
            
            if (window.innerWidth < 768) {
                profile.element.classList.add('user-profile-mobile');
            } else {
                profile.element.classList.remove('user-profile-mobile');
            }
        });
    }

    // Utility Methods
    triggerEvent(element, eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    // Configuration
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    getConfig() {
        return { ...this.config };
    }

    // Cleanup
    destroy() {
        this.profiles.forEach((profile, id) => {
            this.destroyProfile(id);
        });
        this.profiles.clear();
    }

    destroyProfile(id) {
        const profile = this.profiles.get(id);
        if (!profile) return;
        
        const { element } = profile;
        element.removeEventListener('click', this.handleAction);
        
        this.profiles.delete(id);
        return this;
    }
}

// Initialize user profile manager
document.addEventListener('DOMContentLoaded', () => {
    window.userProfileManager = new UserProfileManager();
});

// Global access
window.UserProfileManager = UserProfileManager;
