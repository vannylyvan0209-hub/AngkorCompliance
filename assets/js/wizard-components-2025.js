/**
 * Angkor Compliance Platform - Wizard Components JavaScript 2025
 * 
 * Modern multi-step forms and wizards with 2025 design patterns,
 * accessibility support, and responsive design.
 */

class WizardManager {
    constructor() {
        this.wizards = new Map();
        this.config = {
            enableKeyboardNavigation: true,
            enableTouchNavigation: true,
            enableAccessibility: true,
            enableAnimations: true,
            enableValidation: true,
            enableProgress: true,
            enableStepNavigation: true,
            enableAutoSave: false,
            autoSaveInterval: 30000,
            animationDuration: 300,
            animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            validationMode: 'onChange', // onChange, onSubmit, onBlur
            allowStepBack: true,
            allowStepSkip: false,
            requireStepCompletion: true,
            showStepNumbers: true,
            showProgressBar: true,
            showStepTitles: true,
            showStepDescriptions: true
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeWizards();
        this.setupAccessibility();
        this.setupResponsive();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    initializeWizards() {
        const wizardElements = document.querySelectorAll('.wizard');
        wizardElements.forEach((element, index) => {
            const id = element.id || `wizard-${index}`;
            this.createWizard(id, element);
        });
    }

    setupAccessibility() {
        this.wizards.forEach((wizard, id) => {
            const { element } = wizard;
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'dialog');
            }
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'Wizard');
            }
        });
    }

    setupResponsive() {
        const updateResponsiveClasses = () => {
            this.wizards.forEach((wizard) => {
                const { element } = wizard;
                if (window.innerWidth < 768) {
                    element.classList.add('wizard-mobile');
                } else {
                    element.classList.remove('wizard-mobile');
                }
            });
        };
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    // Public Methods
    createWizard(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        this.wizards.set(id, {
            id,
            element,
            config,
            steps: [],
            currentStep: 0,
            isLoaded: false,
            isAnimating: false,
            data: {},
            validation: {},
            error: null
        });
        
        this.applyConfiguration(this.wizards.get(id));
        return this.wizards.get(id);
    }

    addStep(id, step) {
        const wizard = this.wizards.get(id);
        if (!wizard) {
            console.error(`Wizard with id "${id}" not found`);
            return;
        }
        
        const { config } = wizard;
        wizard.steps.push(step);
        this.renderWizard(wizard);
        
        this.triggerEvent(wizard.element, 'wizard:step:add', { 
            wizard: config, 
            step 
        });
        
        return this;
    }

    removeStep(id, stepIndex) {
        const wizard = this.wizards.get(id);
        if (!wizard) {
            console.error(`Wizard with id "${id}" not found`);
            return;
        }
        
        const { config } = wizard;
        const step = wizard.steps.splice(stepIndex, 1)[0];
        this.renderWizard(wizard);
        
        this.triggerEvent(wizard.element, 'wizard:step:remove', { 
            wizard: config, 
            step 
        });
        
        return this;
    }

    nextStep(id) {
        const wizard = this.wizards.get(id);
        if (!wizard) {
            console.error(`Wizard with id "${id}" not found`);
            return;
        }
        
        const { config } = wizard;
        
        if (wizard.currentStep < wizard.steps.length - 1) {
            if (this.validateStep(wizard, wizard.currentStep)) {
                wizard.currentStep++;
                this.renderWizard(wizard);
                
                this.triggerEvent(wizard.element, 'wizard:step:next', { 
                    wizard: config, 
                    step: wizard.currentStep 
                });
            }
        }
        
        return this;
    }

    previousStep(id) {
        const wizard = this.wizards.get(id);
        if (!wizard) {
            console.error(`Wizard with id "${id}" not found`);
            return;
        }
        
        const { config } = wizard;
        
        if (wizard.currentStep > 0) {
            wizard.currentStep--;
            this.renderWizard(wizard);
            
            this.triggerEvent(wizard.element, 'wizard:step:previous', { 
                wizard: config, 
                step: wizard.currentStep 
            });
        }
        
        return this;
    }

    goToStep(id, stepIndex) {
        const wizard = this.wizards.get(id);
        if (!wizard) {
            console.error(`Wizard with id "${id}" not found`);
            return;
        }
        
        const { config } = wizard;
        
        if (stepIndex >= 0 && stepIndex < wizard.steps.length) {
            wizard.currentStep = stepIndex;
            this.renderWizard(wizard);
            
            this.triggerEvent(wizard.element, 'wizard:step:goto', { 
                wizard: config, 
                step: wizard.currentStep 
            });
        }
        
        return this;
    }

    setData(id, data) {
        const wizard = this.wizards.get(id);
        if (!wizard) {
            console.error(`Wizard with id "${id}" not found`);
            return;
        }
        
        const { config } = wizard;
        wizard.data = { ...wizard.data, ...data };
        
        this.triggerEvent(wizard.element, 'wizard:data:change', { 
            wizard: config, 
            data: wizard.data 
        });
        
        return this;
    }

    getData(id) {
        const wizard = this.wizards.get(id);
        if (!wizard) {
            console.error(`Wizard with id "${id}" not found`);
            return null;
        }
        
        return wizard.data;
    }

    validateStep(wizard, stepIndex) {
        const { config } = wizard;
        const step = wizard.steps[stepIndex];
        
        if (!step || !step.validation) {
            return true;
        }
        
        const errors = {};
        let isValid = true;
        
        // Validate step fields
        for (const [field, rules] of Object.entries(step.validation)) {
            const value = wizard.data[field];
            const fieldErrors = this.validateField(value, rules);
            
            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
                isValid = false;
            }
        }
        
        wizard.validation[stepIndex] = errors;
        
        if (!isValid) {
            this.triggerEvent(wizard.element, 'wizard:validation:error', { 
                wizard: config, 
                step: stepIndex, 
                errors 
            });
        }
        
        return isValid;
    }

    validateField(value, rules) {
        const errors = [];
        
        for (const [rule, ruleValue] of Object.entries(rules)) {
            switch (rule) {
                case 'required':
                    if (ruleValue && (!value || value.toString().trim() === '')) {
                        errors.push('This field is required');
                    }
                    break;
                case 'minLength':
                    if (value && value.toString().length < ruleValue) {
                        errors.push(`Minimum length is ${ruleValue} characters`);
                    }
                    break;
                case 'maxLength':
                    if (value && value.toString().length > ruleValue) {
                        errors.push(`Maximum length is ${ruleValue} characters`);
                    }
                    break;
                case 'email':
                    if (ruleValue && value && !this.isValidEmail(value)) {
                        errors.push('Please enter a valid email address');
                    }
                    break;
                case 'pattern':
                    if (ruleValue && value && !new RegExp(ruleValue).test(value)) {
                        errors.push('Please enter a valid format');
                    }
                    break;
            }
        }
        
        return errors;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Private Methods
    applyConfiguration(wizard) {
        const { element, config } = wizard;
        
        if (config.enableKeyboardNavigation) element.classList.add('wizard-keyboard-enabled');
        if (config.enableTouchNavigation) element.classList.add('wizard-touch-enabled');
        if (config.enableAccessibility) element.classList.add('wizard-accessibility-enabled');
        if (config.enableAnimations) element.classList.add('wizard-animations-enabled');
        if (config.enableValidation) element.classList.add('wizard-validation-enabled');
        if (config.enableProgress) element.classList.add('wizard-progress-enabled');
        if (config.enableStepNavigation) element.classList.add('wizard-step-nav-enabled');
        if (config.enableAutoSave) element.classList.add('wizard-autosave-enabled');
        
        this.addEventListeners(wizard);
        this.renderWizard(wizard);
    }

    addEventListeners(wizard) {
        const { element, config } = wizard;
        
        // Navigation event listeners
        const nextButton = element.querySelector('.wizard-nav-next');
        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextStep(wizard.id));
        }
        
        const prevButton = element.querySelector('.wizard-nav-previous');
        if (prevButton) {
            prevButton.addEventListener('click', () => this.previousStep(wizard.id));
        }
        
        const finishButton = element.querySelector('.wizard-nav-finish');
        if (finishButton) {
            finishButton.addEventListener('click', () => this.finishWizard(wizard.id));
        }
        
        // Step event listeners
        const steps = element.querySelectorAll('.wizard-step');
        steps.forEach((step, index) => {
            step.addEventListener('click', () => this.goToStep(wizard.id, index));
        });
        
        // Close event listeners
        const closeButton = element.querySelector('.wizard-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeWizard(wizard.id));
        }
    }

    renderWizard(wizard) {
        const { element, config, steps, currentStep } = wizard;
        
        this.updateWizardHeader(wizard);
        this.updateWizardProgress(wizard);
        this.updateWizardSteps(wizard);
        this.updateWizardContent(wizard);
        this.updateWizardNavigation(wizard);
    }

    updateWizardHeader(wizard) {
        const { element, config, steps, currentStep } = wizard;
        
        const title = element.querySelector('.wizard-title');
        const subtitle = element.querySelector('.wizard-subtitle');
        
        if (title && steps[currentStep]) {
            title.textContent = steps[currentStep].title || `Step ${currentStep + 1}`;
        }
        
        if (subtitle && steps[currentStep]) {
            subtitle.textContent = steps[currentStep].description || '';
        }
    }

    updateWizardProgress(wizard) {
        const { element, config, steps, currentStep } = wizard;
        
        const progressFill = element.querySelector('.wizard-progress-fill');
        if (progressFill) {
            const progress = ((currentStep + 1) / steps.length) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }

    updateWizardSteps(wizard) {
        const { element, config, steps, currentStep } = wizard;
        
        const stepElements = element.querySelectorAll('.wizard-step');
        stepElements.forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'completed', 'disabled');
            
            if (index === currentStep) {
                stepEl.classList.add('active');
            } else if (index < currentStep) {
                stepEl.classList.add('completed');
            } else if (index > currentStep) {
                stepEl.classList.add('disabled');
            }
        });
    }

    updateWizardContent(wizard) {
        const { element, config, steps, currentStep } = wizard;
        
        const contentElements = element.querySelectorAll('.wizard-step-content');
        contentElements.forEach((content, index) => {
            content.classList.remove('active');
            if (index === currentStep) {
                content.classList.add('active');
            }
        });
    }

    updateWizardNavigation(wizard) {
        const { element, config, steps, currentStep } = wizard;
        
        const prevButton = element.querySelector('.wizard-nav-previous');
        const nextButton = element.querySelector('.wizard-nav-next');
        const finishButton = element.querySelector('.wizard-nav-finish');
        
        if (prevButton) {
            prevButton.disabled = currentStep === 0;
        }
        
        if (nextButton) {
            nextButton.style.display = currentStep === steps.length - 1 ? 'none' : 'flex';
        }
        
        if (finishButton) {
            finishButton.style.display = currentStep === steps.length - 1 ? 'flex' : 'none';
        }
    }

    // Event Handlers
    handleResize() {
        this.wizards.forEach((wizard) => {
            this.renderWizard(wizard);
        });
    }

    handleKeyboardNavigation(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'w':
                    e.preventDefault();
                    this.focusFirstWizard();
                    break;
            }
        }
    }

    focusFirstWizard() {
        const firstWizard = this.wizards.values().next().value;
        if (firstWizard && firstWizard.element) {
            firstWizard.element.focus();
        }
    }

    finishWizard(id) {
        const wizard = this.wizards.get(id);
        if (!wizard) {
            console.error(`Wizard with id "${id}" not found`);
            return;
        }
        
        const { config } = wizard;
        
        // Validate all steps
        let isValid = true;
        for (let i = 0; i < wizard.steps.length; i++) {
            if (!this.validateStep(wizard, i)) {
                isValid = false;
            }
        }
        
        if (isValid) {
            this.triggerEvent(wizard.element, 'wizard:finish', { 
                wizard: config, 
                data: wizard.data 
            });
        }
        
        return this;
    }

    closeWizard(id) {
        const wizard = this.wizards.get(id);
        if (!wizard) {
            console.error(`Wizard with id "${id}" not found`);
            return;
        }
        
        const { config } = wizard;
        
        this.triggerEvent(wizard.element, 'wizard:close', { 
            wizard: config 
        });
        
        return this;
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
        this.wizards.forEach((wizard, id) => {
            this.destroyWizard(id);
        });
        this.wizards.clear();
    }

    destroyWizard(id) {
        const wizard = this.wizards.get(id);
        if (!wizard) return;
        
        const { element } = wizard;
        element.removeEventListener('click', this.handleAction);
        
        this.wizards.delete(id);
        return this;
    }
}

// Initialize wizard manager
document.addEventListener('DOMContentLoaded', () => {
    window.wizardManager = new WizardManager();
});

// Global access
window.WizardManager = WizardManager;
