/**
 * Angkor Compliance Platform - Accessibility JavaScript 2025
 * 
 * WCAG 2.1 AA compliance features, accessibility enhancements,
 * and inclusive design functionality.
 */

class AccessibilityManager {
    constructor() {
        this.focusTrap = null;
        this.announcements = [];
        this.keyboardNavigation = false;
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupAnnouncements();
        this.setupSkipLinks();
        this.setupAriaLiveRegions();
        this.setupColorContrast();
        this.setupReducedMotion();
    }

    setupKeyboardNavigation() {
        // Detect keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.keyboardNavigation = true;
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            this.keyboardNavigation = false;
            document.body.classList.remove('keyboard-nav');
        });
    }

    setupFocusManagement() {
        // Focus trap for modals
        this.setupFocusTrap();
        
        // Focus management for dynamic content
        this.setupDynamicFocus();
    }

    setupFocusTrap() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapFocus(modal, e);
                }
            });
        });
    }

    trapFocus(element, event) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }

    setupDynamicFocus() {
        // Focus management for dynamically added content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.handleDynamicContent(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    handleDynamicContent(element) {
        // Auto-focus first focusable element in new content
        if (element.classList.contains('modal') || element.classList.contains('toast')) {
            const firstFocusable = element.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 100);
            }
        }
    }

    setupAnnouncements() {
        // Create announcement container
        this.announcementContainer = document.createElement('div');
        this.announcementContainer.className = 'aria-live-assertive';
        this.announcementContainer.setAttribute('aria-live', 'assertive');
        this.announcementContainer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(this.announcementContainer);
    }

    announce(message, priority = 'polite') {
        const announcement = document.createElement('div');
        announcement.textContent = message;
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        
        this.announcementContainer.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            announcement.remove();
        }, 1000);
    }

    setupSkipLinks() {
        // Create skip links for main content
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Ensure main content has ID
        const mainContent = document.querySelector('main') || document.querySelector('#main-content');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    }

    setupAriaLiveRegions() {
        // Create live regions for dynamic content
        const politeRegion = document.createElement('div');
        politeRegion.className = 'aria-live-polite';
        politeRegion.setAttribute('aria-live', 'polite');
        politeRegion.setAttribute('aria-atomic', 'false');
        document.body.appendChild(politeRegion);

        const assertiveRegion = document.createElement('div');
        assertiveRegion.className = 'aria-live-assertive';
        assertiveRegion.setAttribute('aria-live', 'assertive');
        assertiveRegion.setAttribute('aria-atomic', 'false');
        document.body.appendChild(assertiveRegion);
    }

    setupColorContrast() {
        // Check for high contrast mode
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }

        // Listen for contrast changes
        if (window.matchMedia) {
            const contrastQuery = window.matchMedia('(prefers-contrast: high)');
            contrastQuery.addEventListener('change', (e) => {
                if (e.matches) {
                    document.body.classList.add('high-contrast');
                } else {
                    document.body.classList.remove('high-contrast');
                }
            });
        }
    }

    setupReducedMotion() {
        // Check for reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }

        // Listen for motion preference changes
        if (window.matchMedia) {
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            motionQuery.addEventListener('change', (e) => {
                if (e.matches) {
                    document.body.classList.add('reduced-motion');
                } else {
                    document.body.classList.remove('reduced-motion');
                }
            });
        }
    }

    // Form Accessibility
    setupFormAccessibility() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            this.enhanceForm(form);
        });
    }

    enhanceForm(form) {
        // Add required field indicators
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            const label = form.querySelector(`label[for="${field.id}"]`);
            if (label && !label.querySelector('.required-indicator')) {
                const indicator = document.createElement('span');
                indicator.className = 'required-indicator';
                indicator.textContent = ' *';
                indicator.setAttribute('aria-label', 'required');
                label.appendChild(indicator);
            }
        });

        // Add error handling
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('invalid', (e) => {
                this.handleFormError(e.target);
            });

            input.addEventListener('input', (e) => {
                this.clearFormError(e.target);
            });
        });
    }

    handleFormError(field) {
        const errorMessage = field.validationMessage;
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = errorMessage;
        errorElement.id = `${field.id}-error`;
        
        field.setAttribute('aria-describedby', errorElement.id);
        field.setAttribute('aria-invalid', 'true');
        
        field.parentNode.appendChild(errorElement);
        
        // Announce error
        this.announce(`Error: ${errorMessage}`, 'assertive');
    }

    clearFormError(field) {
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.remove();
        }
        
        field.removeAttribute('aria-describedby');
        field.removeAttribute('aria-invalid');
    }

    // Table Accessibility
    setupTableAccessibility() {
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            this.enhanceTable(table);
        });
    }

    enhanceTable(table) {
        // Add caption if missing
        if (!table.querySelector('caption')) {
            const caption = document.createElement('caption');
            caption.textContent = 'Data table';
            table.insertBefore(caption, table.firstChild);
        }

        // Add scope to headers
        const headers = table.querySelectorAll('th');
        headers.forEach(header => {
            if (!header.getAttribute('scope')) {
                const row = header.closest('tr');
                const headerIndex = Array.from(row.children).indexOf(header);
                const isRowHeader = headerIndex === 0;
                header.setAttribute('scope', isRowHeader ? 'row' : 'col');
            }
        });

        // Add role if missing
        if (!table.getAttribute('role')) {
            table.setAttribute('role', 'table');
        }
    }

    // Image Accessibility
    setupImageAccessibility() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            this.enhanceImage(img);
        });
    }

    enhanceImage(img) {
        // Add alt text if missing
        if (!img.getAttribute('alt') && !img.getAttribute('role')) {
            img.setAttribute('alt', 'Image');
        }

        // Mark decorative images
        if (img.getAttribute('role') === 'presentation') {
            img.setAttribute('alt', '');
        }
    }

    // Navigation Accessibility
    setupNavigationAccessibility() {
        const navs = document.querySelectorAll('nav');
        navs.forEach(nav => {
            this.enhanceNavigation(nav);
        });
    }

    enhanceNavigation(nav) {
        // Add role if missing
        if (!nav.getAttribute('role')) {
            nav.setAttribute('role', 'navigation');
        }

        // Add aria-label if missing
        if (!nav.getAttribute('aria-label') && !nav.getAttribute('aria-labelledby')) {
            nav.setAttribute('aria-label', 'Navigation');
        }

        // Enhance nav items
        const navItems = nav.querySelectorAll('a, button');
        navItems.forEach((item, index) => {
            if (!item.getAttribute('aria-current') && item.getAttribute('href') === window.location.pathname) {
                item.setAttribute('aria-current', 'page');
            }
        });
    }

    // Modal Accessibility
    setupModalAccessibility() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            this.enhanceModal(modal);
        });
    }

    enhanceModal(modal) {
        // Add role if missing
        if (!modal.getAttribute('role')) {
            modal.setAttribute('role', 'dialog');
        }

        // Add aria-modal if missing
        if (!modal.getAttribute('aria-modal')) {
            modal.setAttribute('aria-modal', 'true');
        }

        // Add aria-labelledby if missing
        const title = modal.querySelector('.modal-title, h1, h2, h3, h4, h5, h6');
        if (title && !modal.getAttribute('aria-labelledby')) {
            const titleId = title.id || `modal-title-${Date.now()}`;
            title.id = titleId;
            modal.setAttribute('aria-labelledby', titleId);
        }

        // Add aria-describedby if missing
        const description = modal.querySelector('.modal-description, .modal-body p');
        if (description && !modal.getAttribute('aria-describedby')) {
            const descId = description.id || `modal-description-${Date.now()}`;
            description.id = descId;
            modal.setAttribute('aria-describedby', descId);
        }
    }

    // Utility Methods
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    getFocusableElements(container) {
        return container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
    }

    setFocus(element) {
        if (element && this.isElementVisible(element)) {
            element.focus();
        }
    }

    // Public API
    announceToScreenReader(message, priority = 'polite') {
        this.announce(message, priority);
    }

    trapFocusIn(element) {
        this.focusTrap = element;
        const focusableElements = this.getFocusableElements(element);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    releaseFocusTrap() {
        this.focusTrap = null;
    }

    enableKeyboardNavigation() {
        this.keyboardNavigation = true;
        document.body.classList.add('keyboard-nav');
    }

    disableKeyboardNavigation() {
        this.keyboardNavigation = false;
        document.body.classList.remove('keyboard-nav');
    }
}

// Initialize accessibility manager
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
    
    // Setup component-specific accessibility
    window.accessibilityManager.setupFormAccessibility();
    window.accessibilityManager.setupTableAccessibility();
    window.accessibilityManager.setupImageAccessibility();
    window.accessibilityManager.setupNavigationAccessibility();
    window.accessibilityManager.setupModalAccessibility();
});

// Global access
window.AccessibilityManager = AccessibilityManager;
