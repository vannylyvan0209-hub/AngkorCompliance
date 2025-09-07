/**
 * Angkor Compliance Platform - Alert & Notification System JavaScript 2025
 * 
 * Comprehensive alert and notification functionality with modern 2025 features,
 * accessibility support, and seamless integration.
 */

class AlertManager {
    constructor() {
        this.toastContainer = null;
        this.toastQueue = [];
        this.maxToasts = 5;
        this.defaultDuration = 5000;
        this.init();
    }

    /**
     * Initialize alert system
     */
    init() {
        this.createToastContainer();
        this.setupKeyboardShortcuts();
        this.setupStorageListener();
    }

    /**
     * Create toast container
     */
    createToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        this.toastContainer.setAttribute('aria-live', 'polite');
        this.toastContainer.setAttribute('aria-atomic', 'false');
        document.body.appendChild(this.toastContainer);
    }

    /**
     * Show alert
     */
    showAlert(options = {}) {
        const {
            type = 'info',
            title = '',
            message = '',
            dismissible = true,
            duration = 0,
            actions = [],
            icon = true,
            size = 'md',
            style = 'default',
            position = 'static',
            onClose = null
        } = options;

        const alert = this.createAlert({
            type,
            title,
            message,
            dismissible,
            actions,
            icon,
            size,
            style,
            onClose
        });

        // Add to DOM
        const container = position === 'static' ? document.body : document.querySelector(position);
        if (container) {
            container.appendChild(alert);
        }

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => {
                this.dismissAlert(alert);
            }, duration);
        }

        return alert;
    }

    /**
     * Show toast notification
     */
    showToast(options = {}) {
        const {
            type = 'info',
            title = '',
            message = '',
            duration = this.defaultDuration,
            actions = [],
            icon = true,
            position = 'top-right',
            progress = true,
            onClose = null
        } = options;

        // Limit number of toasts
        if (this.toastQueue.length >= this.maxToasts) {
            this.dismissToast(this.toastQueue[0]);
        }

        const toast = this.createToast({
            type,
            title,
            message,
            actions,
            icon,
            progress,
            onClose
        });

        // Set position
        this.toastContainer.className = `toast-container ${position}`;

        // Add to queue and DOM
        this.toastQueue.push(toast);
        this.toastContainer.appendChild(toast);

        // Auto-dismiss
        if (duration > 0) {
            const progressBar = toast.querySelector('.toast-progress');
            if (progressBar && progress) {
                progressBar.style.transition = `width ${duration}ms linear`;
                progressBar.style.width = '0%';
            }

            setTimeout(() => {
                this.dismissToast(toast);
            }, duration);
        }

        return toast;
    }

    /**
     * Show banner notification
     */
    showBanner(options = {}) {
        const {
            type = 'info',
            message = '',
            actions = [],
            icon = true,
            dismissible = true,
            onClose = null
        } = options;

        const banner = this.createBanner({
            type,
            message,
            actions,
            icon,
            dismissible,
            onClose
        });

        // Add to top of page
        document.body.insertBefore(banner, document.body.firstChild);

        return banner;
    }

    /**
     * Show inline notification
     */
    showInlineNotification(options = {}) {
        const {
            type = 'info',
            message = '',
            icon = true,
            dismissible = true,
            container = null,
            onClose = null
        } = options;

        const notification = this.createInlineNotification({
            type,
            message,
            icon,
            dismissible,
            onClose
        });

        // Add to container or body
        const targetContainer = container ? document.querySelector(container) : document.body;
        if (targetContainer) {
            targetContainer.appendChild(notification);
        }

        return notification;
    }

    /**
     * Create alert element
     */
    createAlert(options) {
        const {
            type,
            title,
            message,
            dismissible,
            actions,
            icon,
            size,
            style,
            onClose
        } = options;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-${size} alert-${style} alert-animated`;
        if (dismissible) alert.classList.add('alert-dismissible');

        let content = '';

        if (icon) {
            content += `<div class="alert-icon">${this.getIcon(type)}</div>`;
        }

        content += '<div class="alert-content">';
        
        if (title) {
            content += `<div class="alert-header"><h4 class="alert-title">${title}</h4></div>`;
        }
        
        if (message) {
            content += `<p class="alert-message">${message}</p>`;
        }
        
        if (actions && actions.length > 0) {
            content += '<div class="alert-actions">';
            actions.forEach(action => {
                content += `<button class="btn btn-sm btn-${action.type || 'primary'}" onclick="${action.onClick || ''}">${action.text}</button>`;
            });
            content += '</div>';
        }
        
        content += '</div>';

        if (dismissible) {
            content += `<button class="alert-close" aria-label="Close alert" onclick="alertManager.dismissAlert(this.closest('.alert'))">×</button>`;
        }

        alert.innerHTML = content;

        // Store close callback
        if (onClose) {
            alert._onClose = onClose;
        }

        return alert;
    }

    /**
     * Create toast element
     */
    createToast(options) {
        const {
            type,
            title,
            message,
            actions,
            icon,
            progress,
            onClose
        } = options;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let content = '';

        if (icon) {
            content += `<div class="toast-icon">${this.getIcon(type)}</div>`;
        }

        content += '<div class="toast-content">';
        
        if (title) {
            content += `<h4 class="toast-title">${title}</h4>`;
        }
        
        if (message) {
            content += `<p class="toast-message">${message}</p>`;
        }
        
        if (actions && actions.length > 0) {
            content += '<div class="toast-actions">';
            actions.forEach(action => {
                content += `<button class="btn btn-sm btn-${action.type || 'primary'}" onclick="${action.onClick || ''}">${action.text}</button>`;
            });
            content += '</div>';
        }
        
        content += '</div>';

        content += `<button class="toast-close" aria-label="Close toast" onclick="alertManager.dismissToast(this.closest('.toast'))">×</button>`;

        if (progress) {
            content += `<div class="toast-progress toast-progress-${type}"></div>`;
        }

        toast.innerHTML = content;

        // Store close callback
        if (onClose) {
            toast._onClose = onClose;
        }

        return toast;
    }

    /**
     * Create banner element
     */
    createBanner(options) {
        const {
            type,
            message,
            actions,
            icon,
            dismissible,
            onClose
        } = options;

        const banner = document.createElement('div');
        banner.className = `banner banner-${type}`;

        let content = '';

        if (icon) {
            content += `<div class="banner-icon">${this.getIcon(type)}</div>`;
        }

        content += '<div class="banner-content">';
        content += `<p class="banner-message">${message}</p>`;
        
        if (actions && actions.length > 0) {
            content += '<div class="banner-actions">';
            actions.forEach(action => {
                content += `<button class="btn btn-sm btn-${action.type || 'primary'}" onclick="${action.onClick || ''}">${action.text}</button>`;
            });
            content += '</div>';
        }
        
        content += '</div>';

        if (dismissible) {
            content += `<button class="banner-close" aria-label="Close banner" onclick="alertManager.dismissBanner(this.closest('.banner'))">×</button>`;
        }

        banner.innerHTML = content;

        // Store close callback
        if (onClose) {
            banner._onClose = onClose;
        }

        return banner;
    }

    /**
     * Create inline notification element
     */
    createInlineNotification(options) {
        const {
            type,
            message,
            icon,
            dismissible,
            onClose
        } = options;

        const notification = document.createElement('div');
        notification.className = `inline-notification inline-notification-${type}`;

        let content = '';

        if (icon) {
            content += `<div class="inline-notification-icon">${this.getIcon(type)}</div>`;
        }

        content += '<div class="inline-notification-content">';
        content += `<p class="inline-notification-message">${message}</p>`;
        content += '</div>';

        if (dismissible) {
            content += `<button class="inline-notification-close" aria-label="Close notification" onclick="alertManager.dismissInlineNotification(this.closest('.inline-notification'))">×</button>`;
        }

        notification.innerHTML = content;

        // Store close callback
        if (onClose) {
            notification._onClose = onClose;
        }

        return notification;
    }

    /**
     * Get icon for notification type
     */
    getIcon(type) {
        const icons = {
            success: '<i data-lucide="check-circle"></i>',
            warning: '<i data-lucide="alert-triangle"></i>',
            danger: '<i data-lucide="x-circle"></i>',
            info: '<i data-lucide="info"></i>',
            neutral: '<i data-lucide="bell"></i>'
        };
        return icons[type] || icons.info;
    }

    /**
     * Dismiss alert
     */
    dismissAlert(alert) {
        if (!alert) return;

        alert.classList.add('alert-fade-out');
        
        setTimeout(() => {
            if (alert._onClose) {
                alert._onClose();
            }
            alert.remove();
        }, 300);
    }

    /**
     * Dismiss toast
     */
    dismissToast(toast) {
        if (!toast) return;

        // Remove from queue
        const index = this.toastQueue.indexOf(toast);
        if (index > -1) {
            this.toastQueue.splice(index, 1);
        }

        toast.classList.add('toast-dismiss');
        
        setTimeout(() => {
            if (toast._onClose) {
                toast._onClose();
            }
            toast.remove();
        }, 300);
    }

    /**
     * Dismiss banner
     */
    dismissBanner(banner) {
        if (!banner) return;

        banner.style.animation = 'alertFadeOut 0.3s ease-in forwards';
        
        setTimeout(() => {
            if (banner._onClose) {
                banner._onClose();
            }
            banner.remove();
        }, 300);
    }

    /**
     * Dismiss inline notification
     */
    dismissInlineNotification(notification) {
        if (!notification) return;

        notification.style.animation = 'alertFadeOut 0.3s ease-in forwards';
        
        setTimeout(() => {
            if (notification._onClose) {
                notification._onClose();
            }
            notification.remove();
        }, 300);
    }

    /**
     * Clear all toasts
     */
    clearAllToasts() {
        this.toastQueue.forEach(toast => {
            this.dismissToast(toast);
        });
    }

    /**
     * Clear all alerts
     */
    clearAllAlerts() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            this.dismissAlert(alert);
        });
    }

    /**
     * Clear all banners
     */
    clearAllBanners() {
        const banners = document.querySelectorAll('.banner');
        banners.forEach(banner => {
            this.dismissBanner(banner);
        });
    }

    /**
     * Clear all inline notifications
     */
    clearAllInlineNotifications() {
        const notifications = document.querySelectorAll('.inline-notification');
        notifications.forEach(notification => {
            this.dismissInlineNotification(notification);
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape to close all notifications
            if (e.key === 'Escape') {
                this.clearAllToasts();
                this.clearAllAlerts();
                this.clearAllBanners();
                this.clearAllInlineNotifications();
            }
        });
    }

    /**
     * Setup storage listener for cross-tab synchronization
     */
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'angkor-notification') {
                const data = JSON.parse(e.newValue);
                if (data) {
                    this.showToast(data);
                }
            }
        });
    }

    /**
     * Show notification across all tabs
     */
    showCrossTabNotification(options) {
        try {
            localStorage.setItem('angkor-notification', JSON.stringify(options));
            setTimeout(() => {
                localStorage.removeItem('angkor-notification');
            }, 100);
        } catch (e) {
            console.warn('Unable to sync notification across tabs:', e);
        }
    }

    /**
     * Success notification
     */
    success(message, options = {}) {
        return this.showToast({
            type: 'success',
            message,
            ...options
        });
    }

    /**
     * Warning notification
     */
    warning(message, options = {}) {
        return this.showToast({
            type: 'warning',
            message,
            ...options
        });
    }

    /**
     * Error notification
     */
    error(message, options = {}) {
        return this.showToast({
            type: 'danger',
            message,
            ...options
        });
    }

    /**
     * Info notification
     */
    info(message, options = {}) {
        return this.showToast({
            type: 'info',
            message,
            ...options
        });
    }

    /**
     * Loading notification
     */
    loading(message, options = {}) {
        return this.showToast({
            type: 'info',
            message,
            duration: 0,
            ...options
        });
    }

    /**
     * Confirm dialog
     */
    confirm(message, options = {}) {
        const {
            title = 'Confirm',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            onConfirm = null,
            onCancel = null
        } = options;

        return new Promise((resolve) => {
            const toast = this.showToast({
                type: 'info',
                title,
                message,
                duration: 0,
                actions: [
                    {
                        text: confirmText,
                        type: 'primary',
                        onClick: `alertManager.confirmAction(true, ${JSON.stringify({onConfirm, onCancel})})`
                    },
                    {
                        text: cancelText,
                        type: 'secondary',
                        onClick: `alertManager.confirmAction(false, ${JSON.stringify({onConfirm, onCancel})})`
                    }
                ]
            });

            // Store resolve function
            toast._resolve = resolve;
        });
    }

    /**
     * Handle confirm action
     */
    confirmAction(confirmed, callbacks) {
        if (confirmed && callbacks.onConfirm) {
            callbacks.onConfirm();
        } else if (!confirmed && callbacks.onCancel) {
            callbacks.onCancel();
        }
    }
}

// Initialize alert manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.alertManager = new AlertManager();
    
    // Reinitialize Lucide icons for notifications
    if (window.lucide) {
        lucide.createIcons();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlertManager;
}

// Global access
window.AlertManager = AlertManager;
