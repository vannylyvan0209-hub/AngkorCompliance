/**
 * Angkor Compliance Platform - Feedback System JavaScript 2025
 * Modern feedback and rating system components
 */

class FeedbackSystemManager {
    constructor() {
        this.feedbackModal = null;
        this.config = {
            enableRating: true,
            enableComments: true,
            enableCategories: true,
            enableAnonymous: true,
            enableEmail: true,
            enableAnimations: true,
            enableGlassmorphism: true,
            enableNeumorphism: false,
            enableDarkMode: true,
            enableResponsive: true,
            enableAccessibility: true,
            animationDuration: 300,
            submitDelay: 1000
        };
        this.categories = [
            { id: 'general', name: 'General Feedback', icon: 'message-circle' },
            { id: 'bug', name: 'Bug Report', icon: 'bug' },
            { id: 'feature', name: 'Feature Request', icon: 'lightbulb' },
            { id: 'ui', name: 'UI/UX Feedback', icon: 'palette' },
            { id: 'performance', name: 'Performance Issue', icon: 'zap' },
            { id: 'accessibility', name: 'Accessibility Issue', icon: 'accessibility' }
        ];
        this.ratingLabels = [
            'Very Poor',
            'Poor',
            'Fair',
            'Good',
            'Excellent'
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createFeedbackModal();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        document.addEventListener('click', (e) => this.handleClick(e));
    }

    createFeedbackModal() {
        const modal = document.createElement('div');
        modal.className = 'feedback-system';
        modal.innerHTML = this.renderFeedbackModal();
        document.body.appendChild(modal);
        this.feedbackModal = modal;
    }

    renderFeedbackModal() {
        return `
            <div class="feedback-system-content">
                <div class="feedback-system-header">
                    <h2 class="feedback-system-title">Share Your Feedback</h2>
                    <button class="feedback-system-close" data-action="close">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="feedback-system-body">
                    <div class="feedback-system-success">
                        <i class="feedback-system-success-icon" data-lucide="check-circle"></i>
                        <h3 class="feedback-system-success-title">Thank You!</h3>
                        <p class="feedback-system-success-message">Your feedback has been submitted successfully.</p>
                    </div>
                    <div class="feedback-system-error">
                        <i class="feedback-system-error-icon" data-lucide="alert-circle"></i>
                        <h3 class="feedback-system-error-title">Error</h3>
                        <p class="feedback-system-error-message">There was an error submitting your feedback. Please try again.</p>
                    </div>
                    <div class="feedback-system-rating">
                        <label class="feedback-system-rating-label">How would you rate your experience?</label>
                        <div class="feedback-system-rating-stars">
                            ${Array.from({ length: 5 }, (_, i) => `
                                <button class="feedback-system-rating-star" data-rating="${i + 1}">
                                    <i data-lucide="star"></i>
                                </button>
                            `).join('')}
                        </div>
                        <p class="feedback-system-rating-text">Click on a star to rate</p>
                    </div>
                    <form class="feedback-system-form">
                        <div class="feedback-system-form-group">
                            <label class="feedback-system-form-label" for="feedback-category">Category</label>
                            <select class="feedback-system-form-select" id="feedback-category" name="category" required>
                                <option value="">Select a category</option>
                                ${this.categories.map(category => `
                                    <option value="${category.id}">${category.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="feedback-system-form-group">
                            <label class="feedback-system-form-label" for="feedback-subject">Subject</label>
                            <input type="text" class="feedback-system-form-input" id="feedback-subject" name="subject" placeholder="Brief description of your feedback" required>
                        </div>
                        <div class="feedback-system-form-group">
                            <label class="feedback-system-form-label" for="feedback-message">Message</label>
                            <textarea class="feedback-system-form-input feedback-system-form-textarea" id="feedback-message" name="message" placeholder="Please provide detailed feedback..." required></textarea>
                        </div>
                        <div class="feedback-system-form-group">
                            <label class="feedback-system-form-label" for="feedback-email">Email (Optional)</label>
                            <input type="email" class="feedback-system-form-input" id="feedback-email" name="email" placeholder="your.email@example.com">
                        </div>
                        <div class="feedback-system-form-group">
                            <div class="feedback-system-form-checkbox">
                                <input type="checkbox" class="feedback-system-form-checkbox-input" id="feedback-anonymous" name="anonymous">
                                <label class="feedback-system-form-checkbox-label" for="feedback-anonymous">Submit anonymously</label>
                            </div>
                        </div>
                    </form>
                    <div class="feedback-system-actions">
                        <button class="feedback-system-button secondary" data-action="cancel">Cancel</button>
                        <button class="feedback-system-button" data-action="submit">Submit Feedback</button>
                    </div>
                </div>
            </div>
        `;
    }

    show() {
        if (!this.feedbackModal) return;
        
        this.feedbackModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        this.triggerEvent('feedback-system:show');
    }

    hide() {
        if (!this.feedbackModal) return;
        
        this.feedbackModal.classList.remove('active');
        document.body.style.overflow = '';
        
        this.triggerEvent('feedback-system:hide');
    }

    setRating(rating) {
        const stars = this.feedbackModal.querySelectorAll('.feedback-system-rating-star');
        const ratingText = this.feedbackModal.querySelector('.feedback-system-rating-text');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
        
        if (ratingText) {
            ratingText.textContent = this.ratingLabels[rating - 1] || 'Click on a star to rate';
        }
        
        this.triggerEvent('feedback-system:rating:change', { rating });
    }

    submitFeedback() {
        const form = this.feedbackModal.querySelector('.feedback-system-form');
        const formData = new FormData(form);
        
        // Get rating
        const activeStars = this.feedbackModal.querySelectorAll('.feedback-system-rating-star.active');
        const rating = activeStars.length;
        
        // Validate form
        if (!this.validateForm(formData, rating)) {
            return;
        }
        
        // Prepare feedback data
        const feedbackData = {
            rating: rating,
            category: formData.get('category'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            email: formData.get('email'),
            anonymous: formData.get('anonymous') === 'on',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Show loading state
        this.showLoading();
        
        // Simulate API call
        setTimeout(() => {
            this.handleSubmitSuccess(feedbackData);
        }, this.config.submitDelay);
    }

    validateForm(formData, rating) {
        const errors = [];
        
        if (rating === 0) {
            errors.push('Please provide a rating');
        }
        
        if (!formData.get('category')) {
            errors.push('Please select a category');
        }
        
        if (!formData.get('subject')) {
            errors.push('Please provide a subject');
        }
        
        if (!formData.get('message')) {
            errors.push('Please provide a message');
        }
        
        if (errors.length > 0) {
            this.showError(errors.join(', '));
            return false;
        }
        
        return true;
    }

    showLoading() {
        const submitButton = this.feedbackModal.querySelector('[data-action="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
        }
    }

    hideLoading() {
        const submitButton = this.feedbackModal.querySelector('[data-action="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Feedback';
        }
    }

    handleSubmitSuccess(feedbackData) {
        this.hideLoading();
        this.showSuccess();
        
        // Reset form
        this.resetForm();
        
        this.triggerEvent('feedback-system:submit:success', { feedbackData });
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.hide();
        }, 3000);
    }

    handleSubmitError(error) {
        this.hideLoading();
        this.showError(error.message || 'An error occurred while submitting your feedback');
        
        this.triggerEvent('feedback-system:submit:error', { error });
    }

    showSuccess() {
        const successElement = this.feedbackModal.querySelector('.feedback-system-success');
        const errorElement = this.feedbackModal.querySelector('.feedback-system-error');
        
        if (successElement) {
            successElement.classList.add('active');
        }
        
        if (errorElement) {
            errorElement.classList.remove('active');
        }
    }

    showError(message) {
        const successElement = this.feedbackModal.querySelector('.feedback-system-success');
        const errorElement = this.feedbackModal.querySelector('.feedback-system-error');
        const errorMessage = this.feedbackModal.querySelector('.feedback-system-error-message');
        
        if (errorElement) {
            errorElement.classList.add('active');
        }
        
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        
        if (successElement) {
            successElement.classList.remove('active');
        }
    }

    hideMessages() {
        const successElement = this.feedbackModal.querySelector('.feedback-system-success');
        const errorElement = this.feedbackModal.querySelector('.feedback-system-error');
        
        if (successElement) {
            successElement.classList.remove('active');
        }
        
        if (errorElement) {
            errorElement.classList.remove('active');
        }
    }

    resetForm() {
        const form = this.feedbackModal.querySelector('.feedback-system-form');
        if (form) {
            form.reset();
        }
        
        // Reset rating
        this.setRating(0);
        
        // Hide messages
        this.hideMessages();
    }

    handleKeyboard(e) {
        if (!this.feedbackModal || !this.feedbackModal.classList.contains('active')) return;
        
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this.hide();
                break;
        }
    }

    handleClick(e) {
        if (!this.feedbackModal || !this.feedbackModal.classList.contains('active')) return;
        
        const action = e.target.getAttribute('data-action');
        if (action) {
            e.preventDefault();
            this.handleAction(action);
            return;
        }
        
        const ratingStar = e.target.closest('.feedback-system-rating-star');
        if (ratingStar) {
            const rating = parseInt(ratingStar.getAttribute('data-rating'));
            this.setRating(rating);
            return;
        }
        
        // Close on overlay click
        if (e.target === this.feedbackModal) {
            this.hide();
        }
    }

    handleAction(action) {
        switch (action) {
            case 'close':
            case 'cancel':
                this.hide();
                break;
            case 'submit':
                this.submitFeedback();
                break;
        }
    }

    // Public Methods
    open() {
        this.show();
    }

    close() {
        this.hide();
    }

    getCategories() {
        return [...this.categories];
    }

    getRatingLabels() {
        return [...this.ratingLabels];
    }

    // Utility Methods
    triggerEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
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
        if (this.feedbackModal) {
            this.feedbackModal.remove();
            this.feedbackModal = null;
        }
    }
}

// Initialize feedback system manager
document.addEventListener('DOMContentLoaded', () => {
    window.feedbackSystemManager = new FeedbackSystemManager();
});

// Global access
window.FeedbackSystemManager = FeedbackSystemManager;
