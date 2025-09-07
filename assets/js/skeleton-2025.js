/**
 * Angkor Compliance Platform - Skeleton Loading System JavaScript 2025
 * 
 * Modern skeleton loading system with 2025 design patterns,
 * accessibility support, and responsive design.
 */

class SkeletonManager {
    constructor() {
        this.skeletons = new Map();
        this.config = {
            animation: true,
            animationType: 'shimmer',
            duration: 1500,
            easing: 'ease-in-out',
            delay: 100,
            stagger: 100,
            autoHide: true,
            autoHideDelay: 2000,
            accessibility: true,
            reducedMotion: false
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSkeletons();
        this.setupAccessibility();
        this.setupReducedMotion();
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle reduced motion preference
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addEventListener('change', (e) => {
                this.handleReducedMotionChange(e.matches);
            });
        }
    }

    initializeSkeletons() {
        const skeletonElements = document.querySelectorAll('.skeleton');
        
        skeletonElements.forEach((element, index) => {
            const id = element.id || `skeleton-${index}`;
            this.createSkeleton(id, element);
        });
    }

    setupAccessibility() {
        if (!this.config.accessibility) return;
        
        this.skeletons.forEach((skeleton, id) => {
            const { element } = skeleton;
            
            // Add ARIA attributes
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'Loading content');
            }
            
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'progressbar');
            }
            
            if (!element.getAttribute('aria-hidden')) {
                element.setAttribute('aria-hidden', 'true');
            }
        });
    }

    setupReducedMotion() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.config.reducedMotion = mediaQuery.matches;
        }
    }

    // Public Methods
    createSkeleton(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        // Store skeleton
        this.skeletons.set(id, {
            id,
            element,
            config,
            timeout: null,
            hideTimeout: null,
            isVisible: true
        });
        
        // Apply configuration
        this.applyConfiguration(this.skeletons.get(id));
        
        return this.skeletons.get(id);
    }

    showSkeleton(id, options = {}) {
        const skeleton = this.skeletons.get(id);
        if (!skeleton) {
            console.error(`Skeleton with id "${id}" not found`);
            return;
        }
        
        const { element, config } = skeleton;
        const skeletonConfig = { ...config, ...options };
        
        // Clear any existing timeouts
        if (skeleton.timeout) {
            clearTimeout(skeleton.timeout);
        }
        if (skeleton.hideTimeout) {
            clearTimeout(skeleton.hideTimeout);
        }
        
        // Show skeleton
        this.activateSkeleton(skeleton, skeletonConfig);
        
        return this;
    }

    hideSkeleton(id, options = {}) {
        const skeleton = this.skeletons.get(id);
        if (!skeleton) {
            console.error(`Skeleton with id "${id}" not found`);
            return;
        }
        
        const { element, config } = skeleton;
        const skeletonConfig = { ...config, ...options };
        
        // Clear any existing timeouts
        if (skeleton.timeout) {
            clearTimeout(skeleton.timeout);
        }
        if (skeleton.hideTimeout) {
            clearTimeout(skeleton.hideTimeout);
        }
        
        // Hide skeleton
        this.deactivateSkeleton(skeleton, skeletonConfig);
        
        return this;
    }

    toggleSkeleton(id, options = {}) {
        const skeleton = this.skeletons.get(id);
        if (!skeleton) return;
        
        if (skeleton.isVisible) {
            this.hideSkeleton(id, options);
        } else {
            this.showSkeleton(id, options);
        }
        
        return this;
    }

    updateSkeleton(id, content, options = {}) {
        const skeleton = this.skeletons.get(id);
        if (!skeleton) {
            console.error(`Skeleton with id "${id}" not found`);
            return;
        }
        
        const { element } = skeleton;
        
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else {
            element.appendChild(content);
        }
        
        return this;
    }

    destroySkeleton(id) {
        const skeleton = this.skeletons.get(id);
        if (!skeleton) return;
        
        const { timeout, hideTimeout } = skeleton;
        
        // Clear timeouts
        if (timeout) clearTimeout(timeout);
        if (hideTimeout) clearTimeout(hideTimeout);
        
        // Remove from skeletons map
        this.skeletons.delete(id);
        
        return this;
    }

    // Private Methods
    activateSkeleton(skeleton, config) {
        const { element } = skeleton;
        
        // Show skeleton
        element.style.display = 'block';
        element.setAttribute('aria-hidden', 'false');
        
        // Apply animation
        if (config.animation && !config.reducedMotion) {
            this.applyAnimation(element, config);
        }
        
        // Set as visible
        skeleton.isVisible = true;
        
        // Auto-hide if configured
        if (config.autoHide) {
            skeleton.hideTimeout = setTimeout(() => {
                this.hideSkeleton(skeleton.id);
            }, config.autoHideDelay);
        }
        
        // Trigger event
        this.triggerEvent(element, 'skeleton:show', { skeleton: config });
    }

    deactivateSkeleton(skeleton, config) {
        const { element } = skeleton;
        
        // Hide skeleton
        element.style.display = 'none';
        element.setAttribute('aria-hidden', 'true');
        
        // Remove animation
        this.removeAnimation(element);
        
        // Set as hidden
        skeleton.isVisible = false;
        
        // Trigger event
        this.triggerEvent(element, 'skeleton:hide', { skeleton: config });
    }

    applyConfiguration(skeleton) {
        const { element, config } = skeleton;
        
        // Apply animation type
        if (config.animation && !config.reducedMotion) {
            this.applyAnimation(element, config);
        }
        
        // Apply accessibility
        if (config.accessibility) {
            this.applyAccessibility(element);
        }
    }

    applyAnimation(element, config) {
        // Remove existing animation classes
        element.classList.remove(
            'skeleton-pulse', 'skeleton-shimmer', 'skeleton-wave', 
            'skeleton-glow', 'skeleton-bounce', 'skeleton-rotate', 'skeleton-scale'
        );
        
        // Add animation class
        element.classList.add(`skeleton-${config.animationType}`);
        
        // Apply custom duration if specified
        if (config.duration !== 1500) {
            element.style.setProperty('--skeleton-animation-duration', `${config.duration}ms`);
        }
        
        // Apply custom easing if specified
        if (config.easing !== 'ease-in-out') {
            element.style.setProperty('--skeleton-animation-easing', config.easing);
        }
    }

    removeAnimation(element) {
        element.classList.remove(
            'skeleton-pulse', 'skeleton-shimmer', 'skeleton-wave', 
            'skeleton-glow', 'skeleton-bounce', 'skeleton-rotate', 'skeleton-scale'
        );
        
        // Reset custom properties
        element.style.removeProperty('--skeleton-animation-duration');
        element.style.removeProperty('--skeleton-animation-easing');
    }

    applyAccessibility(element) {
        // Add ARIA attributes
        if (!element.getAttribute('aria-label')) {
            element.setAttribute('aria-label', 'Loading content');
        }
        
        if (!element.getAttribute('role')) {
            element.setAttribute('role', 'progressbar');
        }
        
        if (!element.getAttribute('aria-hidden')) {
            element.setAttribute('aria-hidden', 'true');
        }
    }

    // Event Handlers
    handleResize() {
        // Reposition skeletons if needed
        this.skeletons.forEach((skeleton) => {
            if (skeleton.isVisible) {
                this.triggerEvent(skeleton.element, 'skeleton:resize', { skeleton: skeleton.config });
            }
        });
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations when page is hidden
            this.pauseAnimations();
        } else {
            // Resume animations when page is visible
            this.resumeAnimations();
        }
    }

    handleReducedMotionChange(reducedMotion) {
        this.config.reducedMotion = reducedMotion;
        
        // Update all skeletons
        this.skeletons.forEach((skeleton) => {
            if (reducedMotion) {
                this.removeAnimation(skeleton.element);
            } else {
                this.applyAnimation(skeleton.element, skeleton.config);
            }
        });
    }

    pauseAnimations() {
        this.skeletons.forEach((skeleton) => {
            if (skeleton.isVisible) {
                skeleton.element.style.animationPlayState = 'paused';
            }
        });
    }

    resumeAnimations() {
        this.skeletons.forEach((skeleton) => {
            if (skeleton.isVisible) {
                skeleton.element.style.animationPlayState = 'running';
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

    // Skeleton Types
    createTextSkeleton(lines = 3, options = {}) {
        const container = document.createElement('div');
        container.className = 'skeleton-text-container';
        
        for (let i = 0; i < lines; i++) {
            const line = document.createElement('div');
            line.className = `skeleton skeleton-text ${options.className || ''}`;
            line.style.width = `${Math.random() * 40 + 60}%`;
            line.style.animationDelay = `${i * 100}ms`;
            container.appendChild(line);
        }
        
        return container;
    }

    createCardSkeleton(options = {}) {
        const card = document.createElement('div');
        card.className = `skeleton-card ${options.className || ''}`;
        
        // Header
        const header = document.createElement('div');
        header.className = 'skeleton-card-header';
        
        const avatar = document.createElement('div');
        avatar.className = 'skeleton skeleton-avatar';
        header.appendChild(avatar);
        
        const title = document.createElement('div');
        title.className = 'skeleton skeleton-text skeleton-card-title';
        header.appendChild(title);
        
        card.appendChild(header);
        
        // Content
        const content = document.createElement('div');
        content.className = 'skeleton-card-content';
        
        for (let i = 0; i < 3; i++) {
            const line = document.createElement('div');
            line.className = 'skeleton skeleton-text';
            line.style.width = `${Math.random() * 40 + 60}%`;
            content.appendChild(line);
        }
        
        card.appendChild(content);
        
        // Footer
        const footer = document.createElement('div');
        footer.className = 'skeleton-card-footer';
        
        const button1 = document.createElement('div');
        button1.className = 'skeleton skeleton-button';
        button1.style.width = '80px';
        footer.appendChild(button1);
        
        const button2 = document.createElement('div');
        button2.className = 'skeleton skeleton-button';
        button2.style.width = '100px';
        footer.appendChild(button2);
        
        card.appendChild(footer);
        
        return card;
    }

    createTableSkeleton(rows = 5, columns = 4, options = {}) {
        const table = document.createElement('table');
        table.className = `skeleton-table ${options.className || ''}`;
        
        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        for (let i = 0; i < columns; i++) {
            const th = document.createElement('th');
            const header = document.createElement('div');
            header.className = 'skeleton skeleton-table-header';
            th.appendChild(header);
            headerRow.appendChild(th);
        }
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body
        const tbody = document.createElement('tbody');
        
        for (let i = 0; i < rows; i++) {
            const tr = document.createElement('tr');
            
            for (let j = 0; j < columns; j++) {
                const td = document.createElement('td');
                const cell = document.createElement('div');
                cell.className = 'skeleton skeleton-table-row';
                cell.style.width = `${Math.random() * 40 + 60}%`;
                td.appendChild(cell);
                tr.appendChild(td);
            }
            
            tbody.appendChild(tr);
        }
        
        table.appendChild(tbody);
        
        return table;
    }

    createListSkeleton(items = 5, options = {}) {
        const list = document.createElement('div');
        list.className = `skeleton-list ${options.className || ''}`;
        
        for (let i = 0; i < items; i++) {
            const item = document.createElement('div');
            item.className = 'skeleton-list-item';
            
            const avatar = document.createElement('div');
            avatar.className = 'skeleton skeleton-avatar';
            item.appendChild(avatar);
            
            const content = document.createElement('div');
            content.className = 'skeleton-list-item-content';
            
            const title = document.createElement('div');
            title.className = 'skeleton skeleton-text';
            title.style.width = `${Math.random() * 40 + 60}%`;
            content.appendChild(title);
            
            const description = document.createElement('div');
            description.className = 'skeleton skeleton-text';
            description.style.width = `${Math.random() * 30 + 40}%`;
            content.appendChild(description);
            
            item.appendChild(content);
            list.appendChild(item);
        }
        
        return list;
    }

    createFormSkeleton(fields = 4, options = {}) {
        const form = document.createElement('div');
        form.className = `skeleton-form ${options.className || ''}`;
        
        for (let i = 0; i < fields; i++) {
            const group = document.createElement('div');
            group.className = 'skeleton-form-group';
            
            const label = document.createElement('div');
            label.className = 'skeleton skeleton-form-label';
            group.appendChild(label);
            
            const input = document.createElement('div');
            input.className = 'skeleton skeleton-form-input';
            group.appendChild(input);
            
            form.appendChild(group);
        }
        
        return form;
    }

    createDashboardSkeleton(cards = 4, options = {}) {
        const dashboard = document.createElement('div');
        dashboard.className = `skeleton-dashboard ${options.className || ''}`;
        
        for (let i = 0; i < cards; i++) {
            const card = document.createElement('div');
            card.className = 'skeleton-dashboard-card';
            
            const header = document.createElement('div');
            header.className = 'skeleton-dashboard-header';
            
            const title = document.createElement('div');
            title.className = 'skeleton skeleton-dashboard-title';
            header.appendChild(title);
            
            const icon = document.createElement('div');
            icon.className = 'skeleton skeleton-dashboard-icon';
            header.appendChild(icon);
            
            card.appendChild(header);
            
            const content = document.createElement('div');
            content.className = 'skeleton-dashboard-content';
            
            const value = document.createElement('div');
            value.className = 'skeleton skeleton-dashboard-value';
            content.appendChild(value);
            
            const description = document.createElement('div');
            description.className = 'skeleton skeleton-dashboard-description';
            content.appendChild(description);
            
            card.appendChild(content);
            dashboard.appendChild(card);
        }
        
        return dashboard;
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
        this.skeletons.forEach((skeleton, id) => {
            this.destroySkeleton(id);
        });
        this.skeletons.clear();
    }
}

// Initialize skeleton manager
document.addEventListener('DOMContentLoaded', () => {
    window.skeletonManager = new SkeletonManager();
});

// Global access
window.SkeletonManager = SkeletonManager;
