/**
 * Angkor Compliance Platform - Modal and Dialog System JavaScript 2025
 * 
 * Modern modal and dialog system with glassmorphism effects,
 * accessibility support, and responsive design.
 */

class ModalManager {
    constructor() {
        this.modals = new Map();
        this.activeModal = null;
        this.modalStack = [];
        this.config = {
            animation: true,
            backdrop: true,
            keyboard: true,
            focus: true,
            show: true,
            backdropClose: true,
            escapeClose: true,
            autoFocus: true,
            restoreFocus: true,
            animationDuration: 300,
            animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1000,
            backdropZIndex: 999
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeModals();
        this.setupAccessibility();
        this.setupKeyboardNavigation();
    }

    setupEventListeners() {
        // Handle backdrop clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop') && this.config.backdropClose) {
                this.closeActiveModal();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.config.escapeClose && this.activeModal) {
                this.closeActiveModal();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle focus management
        document.addEventListener('focusin', (e) => {
            if (this.activeModal && !this.activeModal.element.contains(e.target)) {
                this.trapFocus(e.target);
            }
        });
    }

    initializeModals() {
        const modalElements = document.querySelectorAll('.modal');
        
        modalElements.forEach((element, index) => {
            const id = element.id || `modal-${index}`;
            this.modals.set(id, {
                element,
                dialog: element.querySelector('.modal-dialog'),
                backdrop: element.querySelector('.modal-backdrop'),
                config: { ...this.config }
            });
        });
    }

    setupAccessibility() {
        this.modals.forEach((modal, id) => {
            const { element, dialog } = modal;
            
            // Add ARIA attributes
            if (!element.getAttribute('aria-hidden')) {
                element.setAttribute('aria-hidden', 'true');
            }
            
            if (!dialog.getAttribute('role')) {
                dialog.setAttribute('role', 'dialog');
            }
            
            if (!dialog.getAttribute('aria-modal')) {
                dialog.setAttribute('aria-modal', 'true');
            }
            
            // Add ARIA label
            const title = dialog.querySelector('.modal-title');
            if (title && !dialog.getAttribute('aria-labelledby')) {
                const titleId = title.id || `modal-title-${id}`;
                title.id = titleId;
                dialog.setAttribute('aria-labelledby', titleId);
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.activeModal) return;
            
            const { dialog } = this.activeModal;
            const focusableElements = this.getFocusableElements(dialog);
            const currentIndex = focusableElements.indexOf(document.activeElement);
            
            switch (e.key) {
                case 'Tab':
                    e.preventDefault();
                    if (e.shiftKey) {
                        // Shift + Tab (backward)
                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
                        focusableElements[prevIndex].focus();
                    } else {
                        // Tab (forward)
                        const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
                        focusableElements[nextIndex].focus();
                    }
                    break;
                case 'Enter':
                    if (e.target.classList.contains('modal-close')) {
                        this.closeActiveModal();
                    }
                    break;
            }
        });
    }

    // Public Methods
    show(id, options = {}) {
        const modal = this.modals.get(id);
        if (!modal) {
            console.error(`Modal with id "${id}" not found`);
            return;
        }
        
        const { element, dialog, backdrop, config } = modal;
        const modalConfig = { ...config, ...options };
        
        // Store previous focus
        if (modalConfig.restoreFocus) {
            modal.previousFocus = document.activeElement;
        }
        
        // Add to stack
        this.modalStack.push(id);
        this.activeModal = modal;
        
        // Set ARIA attributes
        element.setAttribute('aria-hidden', 'false');
        element.style.zIndex = this.config.zIndex + this.modalStack.length;
        
        // Show backdrop
        if (modalConfig.backdrop && backdrop) {
            backdrop.style.zIndex = this.config.backdropZIndex + this.modalStack.length;
            this.showBackdrop(backdrop, modalConfig);
        }
        
        // Show modal
        this.showModal(element, dialog, modalConfig);
        
        // Focus management
        if (modalConfig.autoFocus) {
            this.focusModal(dialog);
        }
        
        // Disable body scroll
        this.disableBodyScroll();
        
        // Trigger events
        this.triggerEvent(element, 'modal:show', { modal: modalConfig });
        
        return this;
    }

    hide(id, options = {}) {
        const modal = this.modals.get(id);
        if (!modal) {
            console.error(`Modal with id "${id}" not found`);
            return;
        }
        
        const { element, dialog, backdrop, config } = modal;
        const modalConfig = { ...config, ...options };
        
        // Remove from stack
        const stackIndex = this.modalStack.indexOf(id);
        if (stackIndex > -1) {
            this.modalStack.splice(stackIndex, 1);
        }
        
        // Update active modal
        this.activeModal = this.modalStack.length > 0 ? 
            this.modals.get(this.modalStack[this.modalStack.length - 1]) : null;
        
        // Set ARIA attributes
        element.setAttribute('aria-hidden', 'true');
        
        // Hide modal
        this.hideModal(element, dialog, modalConfig);
        
        // Hide backdrop
        if (backdrop) {
            this.hideBackdrop(backdrop, modalConfig);
        }
        
        // Restore focus
        if (modalConfig.restoreFocus && modal.previousFocus) {
            modal.previousFocus.focus();
        }
        
        // Enable body scroll
        this.enableBodyScroll();
        
        // Trigger events
        this.triggerEvent(element, 'modal:hide', { modal: modalConfig });
        
        return this;
    }

    closeActiveModal() {
        if (this.activeModal) {
            const activeId = this.modalStack[this.modalStack.length - 1];
            this.hide(activeId);
        }
    }

    closeAllModals() {
        this.modalStack.slice().reverse().forEach(id => {
            this.hide(id);
        });
    }

    // Private Methods
    showModal(element, dialog, config) {
        element.classList.add('show');
        
        if (config.animation) {
            element.classList.add('fade-in');
            dialog.classList.add('slide-in');
            
            setTimeout(() => {
                element.classList.remove('fade-in');
                dialog.classList.remove('slide-in');
            }, config.animationDuration);
        }
    }

    hideModal(element, dialog, config) {
        if (config.animation) {
            element.classList.add('fade-out');
            dialog.classList.add('slide-out');
            
            setTimeout(() => {
                element.classList.remove('show', 'fade-out');
                dialog.classList.remove('slide-out');
            }, config.animationDuration);
        } else {
            element.classList.remove('show');
        }
    }

    showBackdrop(backdrop, config) {
        backdrop.classList.add('show');
        
        if (config.animation) {
            backdrop.classList.add('fade-in');
            
            setTimeout(() => {
                backdrop.classList.remove('fade-in');
            }, config.animationDuration);
        }
    }

    hideBackdrop(backdrop, config) {
        if (config.animation) {
            backdrop.classList.add('fade-out');
            
            setTimeout(() => {
                backdrop.classList.remove('show', 'fade-out');
            }, config.animationDuration);
        } else {
            backdrop.classList.remove('show');
        }
    }

    focusModal(dialog) {
        const focusableElements = this.getFocusableElements(dialog);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    getFocusableElements(container) {
        const focusableSelectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ];
        
        return Array.from(container.querySelectorAll(focusableSelectors.join(', ')));
    }

    trapFocus(target) {
        if (!this.activeModal) return;
        
        const { dialog } = this.activeModal;
        const focusableElements = this.getFocusableElements(dialog);
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (target === firstElement) {
            lastElement.focus();
        } else if (target === lastElement) {
            firstElement.focus();
        }
    }

    disableBodyScroll() {
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = this.getScrollbarWidth() + 'px';
    }

    enableBodyScroll() {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    getScrollbarWidth() {
        const scrollDiv = document.createElement('div');
        scrollDiv.style.cssText = 'width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px;';
        document.body.appendChild(scrollDiv);
        const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
        return scrollbarWidth;
    }

    handleResize() {
        if (this.activeModal) {
            const { dialog } = this.activeModal;
            this.centerModal(dialog);
        }
    }

    centerModal(dialog) {
        const rect = dialog.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        if (rect.height < viewportHeight) {
            dialog.style.marginTop = 'auto';
            dialog.style.marginBottom = 'auto';
        } else {
            dialog.style.marginTop = '0';
            dialog.style.marginBottom = '0';
        }
    }

    triggerEvent(element, eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    // Utility Methods
    createModal(id, options = {}) {
        const {
            title = 'Modal Title',
            content = '',
            size = 'md',
            variant = 'default',
            animation = 'scale',
            backdrop = true,
            keyboard = true,
            showClose = true,
            showHeader = true,
            showFooter = true,
            footerContent = '',
            className = ''
        } = options;
        
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = `modal ${className}`;
        modal.setAttribute('aria-hidden', 'true');
        
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        
        const dialog = document.createElement('div');
        dialog.className = `modal-dialog modal-${size} modal-${variant} modal-animate-${animation}`;
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        
        let headerHTML = '';
        if (showHeader) {
            headerHTML = `
                <div class="modal-header">
                    <h2 class="modal-title" id="modal-title-${id}">
                        <i data-lucide="info" class="modal-title-icon"></i>
                        ${title}
                    </h2>
                    ${showClose ? '<button class="modal-close" aria-label="Close modal"><i data-lucide="x" class="modal-close-icon"></i></button>' : ''}
                </div>
            `;
        }
        
        const bodyHTML = `
            <div class="modal-body">
                <div class="modal-body-content">
                    ${content}
                </div>
            </div>
        `;
        
        let footerHTML = '';
        if (showFooter && footerContent) {
            footerHTML = `
                <div class="modal-footer">
                    ${footerContent}
                </div>
            `;
        }
        
        dialog.innerHTML = headerHTML + bodyHTML + footerHTML;
        modal.appendChild(backdrop);
        modal.appendChild(dialog);
        
        document.body.appendChild(modal);
        
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
        
        // Add to modals map
        this.modals.set(id, {
            element: modal,
            dialog,
            backdrop,
            config: { ...this.config }
        });
        
        // Setup event listeners
        this.setupModalEventListeners(modal, id);
        
        return modal;
    }

    setupModalEventListeners(modal, id) {
        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hide(id);
            });
        }
        
        const backdrop = modal.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                this.hide(id);
            });
        }
    }

    // Modal Types
    showConfirmation(title, message, options = {}) {
        const {
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            confirmClass = 'btn-primary',
            cancelClass = 'btn-secondary',
            onConfirm = () => {},
            onCancel = () => {}
        } = options;
        
        const id = `confirmation-${Date.now()}`;
        const content = `<p>${message}</p>`;
        const footerContent = `
            <button class="btn ${cancelClass}" data-action="cancel">${cancelText}</button>
            <button class="btn ${confirmClass}" data-action="confirm">${confirmText}</button>
        `;
        
        const modal = this.createModal(id, {
            title,
            content,
            size: 'sm',
            variant: 'confirmation',
            footerContent
        });
        
        // Add event listeners
        modal.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'confirm') {
                onConfirm();
                this.hide(id);
            } else if (e.target.dataset.action === 'cancel') {
                onCancel();
                this.hide(id);
            }
        });
        
        this.show(id);
        return modal;
    }

    showAlert(title, message, options = {}) {
        const {
            buttonText = 'OK',
            buttonClass = 'btn-primary',
            onClose = () => {}
        } = options;
        
        const id = `alert-${Date.now()}`;
        const content = `<p>${message}</p>`;
        const footerContent = `<button class="btn ${buttonClass}" data-action="close">${buttonText}</button>`;
        
        const modal = this.createModal(id, {
            title,
            content,
            size: 'sm',
            variant: 'alert',
            footerContent
        });
        
        // Add event listeners
        modal.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'close') {
                onClose();
                this.hide(id);
            }
        });
        
        this.show(id);
        return modal;
    }

    showForm(title, formHTML, options = {}) {
        const {
            submitText = 'Submit',
            cancelText = 'Cancel',
            onSubmit = () => {},
            onCancel = () => {}
        } = options;
        
        const id = `form-${Date.now()}`;
        const footerContent = `
            <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
            <button class="btn btn-primary" data-action="submit">${submitText}</button>
        `;
        
        const modal = this.createModal(id, {
            title,
            content: formHTML,
            size: 'lg',
            variant: 'form',
            footerContent
        });
        
        // Add event listeners
        modal.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'submit') {
                const form = modal.querySelector('form');
                if (form) {
                    const formData = new FormData(form);
                    onSubmit(formData);
                }
                this.hide(id);
            } else if (e.target.dataset.action === 'cancel') {
                onCancel();
                this.hide(id);
            }
        });
        
        this.show(id);
        return modal;
    }

    showImage(src, alt = '', options = {}) {
        const id = `image-${Date.now()}`;
        const content = `
            <div class="modal-image-content">
                <img src="${src}" alt="${alt}" />
            </div>
        `;
        
        const modal = this.createModal(id, {
            title: alt,
            content,
            size: 'xl',
            variant: 'image',
            showHeader: false,
            showFooter: false
        });
        
        this.show(id);
        return modal;
    }

    showVideo(src, options = {}) {
        const {
            title = 'Video',
            autoplay = false,
            controls = true
        } = options;
        
        const id = `video-${Date.now()}`;
        const content = `
            <div class="modal-video-content">
                <video ${autoplay ? 'autoplay' : ''} ${controls ? 'controls' : ''}>
                    <source src="${src}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
        
        const modal = this.createModal(id, {
            title,
            content,
            size: 'xl',
            variant: 'video',
            showHeader: false,
            showFooter: false
        });
        
        this.show(id);
        return modal;
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
        this.closeAllModals();
        this.modals.clear();
        this.modalStack = [];
        this.activeModal = null;
    }
}

// Initialize modal manager
document.addEventListener('DOMContentLoaded', () => {
    window.modalManager = new ModalManager();
});

// Global access
window.ModalManager = ModalManager;
