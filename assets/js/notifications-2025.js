/**
 * Angkor Compliance Platform - Notification System JavaScript 2025
 * 
 * Modern notification system with toast notifications,
 * accessibility support, and responsive design.
 */

class NotificationManager {
    constructor() {
        this.notifications = new Map();
        this.config = {
            position: 'top-right',
            duration: 5000,
            maxNotifications: 5,
            enableProgress: true,
            enableSound: false,
            enableVibration: false,
            enableAutoClose: true,
            enableClickToClose: true,
            enableSwipeToClose: true,
            enableKeyboardNavigation: true,
            enableAccessibility: true,
            enableAnalytics: true,
            enablePersistence: false,
            animationDuration: 300,
            animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            soundFile: 'notification.mp3',
            vibrationPattern: [200, 100, 200],
            storageKey: 'notifications',
            maxStoredNotifications: 100
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createNotificationContainer();
        this.setupAccessibility();
        this.setupResponsive();
        this.loadStoredNotifications();
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle before unload
        window.addEventListener('beforeunload', () => {
            this.saveNotifications();
        });
    }

    createNotificationContainer() {
        // Create notification container if it doesn't exist
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = `notification-container ${this.config.position}`;
            document.body.appendChild(container);
        }
        
        this.container = container;
    }

    setupAccessibility() {
        if (!this.config.enableAccessibility) return;
        
        // Add ARIA live region for screen readers
        let liveRegion = document.querySelector('.notification-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.className = 'notification-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }
        
        this.liveRegion = liveRegion;
    }

    setupResponsive() {
        // Add responsive classes based on screen size
        const updateResponsiveClasses = () => {
            if (this.container) {
                if (window.innerWidth < 768) {
                    this.container.classList.add('notification-mobile');
                } else {
                    this.container.classList.remove('notification-mobile');
                }
                
                if (window.innerWidth < 480) {
                    this.container.classList.add('notification-small');
                } else {
                    this.container.classList.remove('notification-small');
                }
            }
        };
        
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    // Public Methods
    show(options = {}) {
        const notification = this.createNotification(options);
        this.addNotification(notification);
        this.renderNotification(notification);
        this.triggerEvent('notification:show', { notification });
        return notification;
    }

    success(message, options = {}) {
        return this.show({
            type: 'success',
            message,
            title: options.title || 'Success',
            icon: options.icon || '✓',
            ...options
        });
    }

    info(message, options = {}) {
        return this.show({
            type: 'info',
            message,
            title: options.title || 'Information',
            icon: options.icon || 'ℹ',
            ...options
        });
    }

    warning(message, options = {}) {
        return this.show({
            type: 'warning',
            message,
            title: options.title || 'Warning',
            icon: options.icon || '⚠',
            ...options
        });
    }

    error(message, options = {}) {
        return this.show({
            type: 'error',
            message,
            title: options.title || 'Error',
            icon: options.icon || '✕',
            ...options
        });
    }

    hide(id) {
        const notification = this.notifications.get(id);
        if (!notification) {
            console.error(`Notification with id "${id}" not found`);
            return;
        }
        
        this.removeNotification(notification);
        this.triggerEvent('notification:hide', { notification });
        return this;
    }

    hideAll() {
        this.notifications.forEach((notification) => {
            this.removeNotification(notification);
        });
        this.triggerEvent('notification:hideAll', {});
        return this;
    }

    clear() {
        this.hideAll();
        this.triggerEvent('notification:clear', {});
        return this;
    }

    update(id, updates) {
        const notification = this.notifications.get(id);
        if (!notification) {
            console.error(`Notification with id "${id}" not found`);
            return;
        }
        
        Object.assign(notification, updates);
        this.renderNotification(notification);
        this.triggerEvent('notification:update', { notification, updates });
        return this;
    }

    setPosition(position) {
        this.config.position = position;
        if (this.container) {
            this.container.className = `notification-container ${position}`;
        }
        this.triggerEvent('notification:position:change', { position });
        return this;
    }

    setDuration(duration) {
        this.config.duration = duration;
        this.triggerEvent('notification:duration:change', { duration });
        return this;
    }

    setMaxNotifications(max) {
        this.config.maxNotifications = max;
        this.enforceMaxNotifications();
        this.triggerEvent('notification:max:change', { max });
        return this;
    }

    enableSound(enabled = true) {
        this.config.enableSound = enabled;
        this.triggerEvent('notification:sound:change', { enabled });
        return this;
    }

    enableVibration(enabled = true) {
        this.config.enableVibration = enabled;
        this.triggerEvent('notification:vibration:change', { enabled });
        return this;
    }

    enableAutoClose(enabled = true) {
        this.config.enableAutoClose = enabled;
        this.triggerEvent('notification:autoClose:change', { enabled });
        return this;
    }

    enableClickToClose(enabled = true) {
        this.config.enableClickToClose = enabled;
        this.triggerEvent('notification:clickToClose:change', { enabled });
        return this;
    }

    enableSwipeToClose(enabled = true) {
        this.config.enableSwipeToClose = enabled;
        this.triggerEvent('notification:swipeToClose:change', { enabled });
        return this;
    }

    enableKeyboardNavigation(enabled = true) {
        this.config.enableKeyboardNavigation = enabled;
        this.triggerEvent('notification:keyboard:change', { enabled });
        return this;
    }

    enableAccessibility(enabled = true) {
        this.config.enableAccessibility = enabled;
        this.triggerEvent('notification:accessibility:change', { enabled });
        return this;
    }

    enableAnalytics(enabled = true) {
        this.config.enableAnalytics = enabled;
        this.triggerEvent('notification:analytics:change', { enabled });
        return this;
    }

    enablePersistence(enabled = true) {
        this.config.enablePersistence = enabled;
        this.triggerEvent('notification:persistence:change', { enabled });
        return this;
    }

    // Private Methods
    createNotification(options) {
        const id = options.id || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const notification = {
            id,
            type: options.type || 'default',
            title: options.title || 'Notification',
            message: options.message || '',
            icon: options.icon || 'ℹ',
            variant: options.variant || 'default',
            size: options.size || 'md',
            position: options.position || this.config.position,
            duration: options.duration !== undefined ? options.duration : this.config.duration,
            actions: options.actions || [],
            data: options.data || {},
            config: {
                enableProgress: options.enableProgress !== undefined ? options.enableProgress : this.config.enableProgress,
                enableSound: options.enableSound !== undefined ? options.enableSound : this.config.enableSound,
                enableVibration: options.enableVibration !== undefined ? options.enableVibration : this.config.enableVibration,
                enableAutoClose: options.enableAutoClose !== undefined ? options.enableAutoClose : this.config.enableAutoClose,
                enableClickToClose: options.enableClickToClose !== undefined ? options.enableClickToClose : this.config.enableClickToClose,
                enableSwipeToClose: options.enableSwipeToClose !== undefined ? options.enableSwipeToClose : this.config.enableSwipeToClose,
                enableKeyboardNavigation: options.enableKeyboardNavigation !== undefined ? options.enableKeyboardNavigation : this.config.enableKeyboardNavigation,
                enableAccessibility: options.enableAccessibility !== undefined ? options.enableAccessibility : this.config.enableAccessibility,
                enableAnalytics: options.enableAnalytics !== undefined ? options.enableAnalytics : this.config.enableAnalytics,
                enablePersistence: options.enablePersistence !== undefined ? options.enablePersistence : this.config.enablePersistence
            },
            isVisible: false,
            isPaused: false,
            isDismissed: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            element: null,
            timer: null,
            progressTimer: null
        };
        
        return notification;
    }

    addNotification(notification) {
        // Add to notifications map
        this.notifications.set(notification.id, notification);
        
        // Enforce max notifications
        this.enforceMaxNotifications();
        
        // Store notification if persistence is enabled
        if (notification.config.enablePersistence) {
            this.storeNotification(notification);
        }
        
        // Play sound if enabled
        if (notification.config.enableSound) {
            this.playSound();
        }
        
        // Vibrate if enabled
        if (notification.config.enableVibration) {
            this.vibrate();
        }
        
        // Track analytics if enabled
        if (notification.config.enableAnalytics) {
            this.trackAnalytics('notification_created', notification);
        }
    }

    removeNotification(notification) {
        // Clear timers
        if (notification.timer) {
            clearTimeout(notification.timer);
        }
        if (notification.progressTimer) {
            clearInterval(notification.progressTimer);
        }
        
        // Remove from DOM
        if (notification.element) {
            this.hideNotificationElement(notification);
        }
        
        // Remove from notifications map
        this.notifications.delete(notification.id);
        
        // Track analytics if enabled
        if (notification.config.enableAnalytics) {
            this.trackAnalytics('notification_dismissed', notification);
        }
    }

    renderNotification(notification) {
        // Create notification element
        const element = this.createNotificationElement(notification);
        notification.element = element;
        
        // Add to container
        if (this.container) {
            this.container.appendChild(element);
        }
        
        // Show notification
        this.showNotificationElement(notification);
        
        // Setup auto-close timer
        if (notification.config.enableAutoClose && notification.duration > 0) {
            this.setupAutoCloseTimer(notification);
        }
        
        // Setup progress bar
        if (notification.config.enableProgress && notification.duration > 0) {
            this.setupProgressBar(notification);
        }
        
        // Setup event listeners
        this.setupNotificationEventListeners(notification);
        
        // Announce to screen readers
        if (notification.config.enableAccessibility && this.liveRegion) {
            this.announceToScreenReader(notification);
        }
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.id = notification.id;
        element.className = `toast-notification ${notification.type} ${notification.variant} ${notification.size}`;
        element.setAttribute('data-notification-id', notification.id);
        element.setAttribute('data-notification-type', notification.type);
        element.setAttribute('role', notification.type === 'error' ? 'alert' : 'status');
        element.setAttribute('aria-live', notification.type === 'error' ? 'assertive' : 'polite');
        element.setAttribute('aria-atomic', 'true');
        
        // Create notification HTML
        element.innerHTML = this.createNotificationHTML(notification);
        
        return element;
    }

    createNotificationHTML(notification) {
        const actionsHTML = notification.actions.map(action => 
            `<button class="notification-action ${action.primary ? 'primary' : ''}" data-action="${action.id}">
                ${action.icon ? `<span class="action-icon">${action.icon}</span>` : ''}
                ${action.label}
            </button>`
        ).join('');
        
        return `
            <div class="notification-icon">${notification.icon}</div>
            <div class="notification-content">
                <div class="notification-header">
                    <h4 class="notification-title">${notification.title}</h4>
                    ${notification.config.enableClickToClose ? '<button class="notification-close" aria-label="Close notification">×</button>' : ''}
                </div>
                <p class="notification-message">${notification.message}</p>
                <div class="notification-meta">
                    <span class="notification-time">${this.formatTimestamp(notification.createdAt)}</span>
                </div>
                ${actionsHTML ? `<div class="notification-actions">${actionsHTML}</div>` : ''}
            </div>
            ${notification.config.enableProgress ? '<div class="notification-progress"></div>' : ''}
        `;
    }

    showNotificationElement(notification) {
        if (!notification.element) return;
        
        // Add show class
        notification.element.classList.add('show');
        notification.isVisible = true;
        
        // Update timestamp
        notification.updatedAt = Date.now();
    }

    hideNotificationElement(notification) {
        if (!notification.element) return;
        
        // Add hide class
        notification.element.classList.add('hide');
        notification.isVisible = false;
        notification.isDismissed = true;
        
        // Remove element after animation
        setTimeout(() => {
            if (notification.element && notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
        }, this.config.animationDuration);
    }

    setupAutoCloseTimer(notification) {
        if (notification.timer) {
            clearTimeout(notification.timer);
        }
        
        notification.timer = setTimeout(() => {
            this.hide(notification.id);
        }, notification.duration);
    }

    setupProgressBar(notification) {
        if (!notification.element) return;
        
        const progressBar = notification.element.querySelector('.notification-progress');
        if (!progressBar) return;
        
        const duration = notification.duration;
        const interval = 50; // Update every 50ms
        const step = (interval / duration) * 100;
        let progress = 100;
        
        notification.progressTimer = setInterval(() => {
            if (notification.isPaused) return;
            
            progress -= step;
            progressBar.style.width = `${Math.max(0, progress)}%`;
            
            if (progress <= 0) {
                clearInterval(notification.progressTimer);
            }
        }, interval);
    }

    setupNotificationEventListeners(notification) {
        if (!notification.element) return;
        
        // Close button
        const closeButton = notification.element.querySelector('.notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hide(notification.id);
            });
        }
        
        // Click to close
        if (notification.config.enableClickToClose) {
            notification.element.addEventListener('click', (e) => {
                if (e.target === notification.element || e.target.closest('.notification-content')) {
                    this.hide(notification.id);
                }
            });
        }
        
        // Action buttons
        const actionButtons = notification.element.querySelectorAll('.notification-action');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const actionId = button.getAttribute('data-action');
                const action = notification.actions.find(a => a.id === actionId);
                if (action && action.handler) {
                    action.handler(notification, action);
                }
            });
        });
        
        // Swipe to close (mobile)
        if (notification.config.enableSwipeToClose) {
            this.setupSwipeToClose(notification);
        }
        
        // Keyboard navigation
        if (notification.config.enableKeyboardNavigation) {
            this.setupKeyboardNavigation(notification);
        }
        
        // Pause on hover
        notification.element.addEventListener('mouseenter', () => {
            notification.isPaused = true;
        });
        
        notification.element.addEventListener('mouseleave', () => {
            notification.isPaused = false;
        });
    }

    setupSwipeToClose(notification) {
        if (!notification.element) return;
        
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;
        
        notification.element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
        });
        
        notification.element.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
            
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            // Only allow horizontal swipes
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault();
                notification.element.style.transform = `translateX(${deltaX}px)`;
                notification.element.style.opacity = Math.max(0, 1 - Math.abs(deltaX) / 200);
            }
        });
        
        notification.element.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            isDragging = false;
            const deltaX = currentX - startX;
            
            if (Math.abs(deltaX) > 100) {
                this.hide(notification.id);
            } else {
                notification.element.style.transform = '';
                notification.element.style.opacity = '';
            }
        });
    }

    setupKeyboardNavigation(notification) {
        if (!notification.element) return;
        
        notification.element.setAttribute('tabindex', '0');
        
        notification.element.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    this.hide(notification.id);
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.hide(notification.id);
                    break;
            }
        });
    }

    announceToScreenReader(notification) {
        if (!this.liveRegion) return;
        
        const message = `${notification.title}: ${notification.message}`;
        this.liveRegion.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            this.liveRegion.textContent = '';
        }, 1000);
    }

    enforceMaxNotifications() {
        if (this.notifications.size <= this.config.maxNotifications) return;
        
        const notifications = Array.from(this.notifications.values());
        const sortedNotifications = notifications.sort((a, b) => a.createdAt - b.createdAt);
        
        const toRemove = sortedNotifications.slice(0, this.notifications.size - this.config.maxNotifications);
        toRemove.forEach(notification => {
            this.hide(notification.id);
        });
    }

    storeNotification(notification) {
        try {
            const stored = JSON.parse(localStorage.getItem(this.config.storageKey) || '[]');
            stored.push({
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                createdAt: notification.createdAt,
                data: notification.data
            });
            
            // Limit stored notifications
            if (stored.length > this.config.maxStoredNotifications) {
                stored.splice(0, stored.length - this.config.maxStoredNotifications);
            }
            
            localStorage.setItem(this.config.storageKey, JSON.stringify(stored));
        } catch (error) {
            console.error('Error storing notification:', error);
        }
    }

    loadStoredNotifications() {
        if (!this.config.enablePersistence) return;
        
        try {
            const stored = JSON.parse(localStorage.getItem(this.config.storageKey) || '[]');
            stored.forEach(notificationData => {
                this.show({
                    id: notificationData.id,
                    type: notificationData.type,
                    title: notificationData.title,
                    message: notificationData.message,
                    data: notificationData.data,
                    duration: 0 // Don't auto-close stored notifications
                });
            });
        } catch (error) {
            console.error('Error loading stored notifications:', error);
        }
    }

    saveNotifications() {
        if (!this.config.enablePersistence) return;
        
        try {
            const notifications = Array.from(this.notifications.values()).map(notification => ({
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                createdAt: notification.createdAt,
                data: notification.data
            }));
            
            localStorage.setItem(this.config.storageKey, JSON.stringify(notifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    }

    playSound() {
        if (!this.config.enableSound) return;
        
        try {
            const audio = new Audio(this.config.soundFile);
            audio.play().catch(error => {
                console.warn('Could not play notification sound:', error);
            });
        } catch (error) {
            console.warn('Could not create audio for notification sound:', error);
        }
    }

    vibrate() {
        if (!this.config.enableVibration || !navigator.vibrate) return;
        
        try {
            navigator.vibrate(this.config.vibrationPattern);
        } catch (error) {
            console.warn('Could not vibrate for notification:', error);
        }
    }

    trackAnalytics(event, notification) {
        if (!this.config.enableAnalytics) return;
        
        // Track analytics event
        if (typeof gtag !== 'undefined') {
            gtag('event', event, {
                notification_type: notification.type,
                notification_title: notification.title,
                notification_id: notification.id
            });
        }
        
        // Track custom analytics
        this.triggerEvent('notification:analytics', { event, notification });
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Event Handlers
    handleResize() {
        // Update notification positions on resize
        this.notifications.forEach(notification => {
            if (notification.element) {
                // Recalculate position if needed
            }
        });
    }

    handleKeyboardNavigation(e) {
        if (!this.config.enableKeyboardNavigation) return;
        
        // Handle global keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.show({
                        type: 'info',
                        title: 'Test Notification',
                        message: 'This is a test notification created with Ctrl+N'
                    });
                    break;
            }
        }
        
        // Handle Escape key to close all notifications
        if (e.key === 'Escape') {
            this.hideAll();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseAllNotifications();
        } else {
            this.resumeAllNotifications();
        }
    }

    pauseAllNotifications() {
        this.notifications.forEach(notification => {
            notification.isPaused = true;
        });
    }

    resumeAllNotifications() {
        this.notifications.forEach(notification => {
            notification.isPaused = false;
        });
    }

    // Utility Methods
    triggerEvent(eventName, detail) {
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
        this.hideAll();
        this.notifications.clear();
        
        if (this.container) {
            this.container.remove();
        }
        
        if (this.liveRegion) {
            this.liveRegion.remove();
        }
    }
}

// Initialize notification manager
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
});

// Global access
window.NotificationManager = NotificationManager;

// Convenience methods
window.showNotification = (options) => window.notificationManager.show(options);
window.showSuccess = (message, options) => window.notificationManager.success(message, options);
window.showInfo = (message, options) => window.notificationManager.info(message, options);
window.showWarning = (message, options) => window.notificationManager.warning(message, options);
window.showError = (message, options) => window.notificationManager.error(message, options);
window.hideNotification = (id) => window.notificationManager.hide(id);
window.hideAllNotifications = () => window.notificationManager.hideAll();
window.clearNotifications = () => window.notificationManager.clear();
