/**
 * Angkor Compliance Platform - Tooltip System JavaScript 2025
 * 
 * Modern tooltip system with 2025 design patterns,
 * accessibility support, and responsive design.
 */

class TooltipManager {
    constructor() {
        this.tooltips = new Map();
        this.activeTooltip = null;
        this.config = {
            animation: true,
            delay: 500,
            hideDelay: 100,
            position: 'auto',
            trigger: 'hover',
            interactive: false,
            arrow: true,
            maxWidth: 200,
            zIndex: 1050,
            animationDuration: 200,
            animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            boundary: 'viewport',
            offset: 8,
            placement: 'top'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTooltips();
        this.setupAccessibility();
        this.setupKeyboardNavigation();
    }

    setupEventListeners() {
        // Handle mouse events
        document.addEventListener('mouseenter', (e) => {
            if (e.target.closest('.tooltip-trigger')) {
                this.handleMouseEnter(e);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.closest('.tooltip-trigger')) {
                this.handleMouseLeave(e);
            }
        }, true);

        // Handle focus events
        document.addEventListener('focusin', (e) => {
            if (e.target.closest('.tooltip-trigger')) {
                this.handleFocusIn(e);
            }
        }, true);

        document.addEventListener('focusout', (e) => {
            if (e.target.closest('.tooltip-trigger')) {
                this.handleFocusOut(e);
            }
        }, true);

        // Handle click events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tooltip-trigger')) {
                this.handleClick(e);
            }
        }, true);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle scroll
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }

    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('.tooltip-trigger');
        
        tooltipElements.forEach((element, index) => {
            const id = element.id || `tooltip-${index}`;
            const tooltipContent = element.getAttribute('data-tooltip') || 
                                 element.getAttribute('title') || 
                                 element.querySelector('.tooltip-content');
            
            if (tooltipContent) {
                this.createTooltip(id, element, tooltipContent);
            }
        });
    }

    setupAccessibility() {
        this.tooltips.forEach((tooltip, id) => {
            const { trigger, content } = tooltip;
            
            // Add ARIA attributes
            if (!trigger.getAttribute('aria-describedby')) {
                const contentId = content.id || `tooltip-content-${id}`;
                content.id = contentId;
                trigger.setAttribute('aria-describedby', contentId);
            }
            
            // Set ARIA hidden
            content.setAttribute('aria-hidden', 'true');
            
            // Remove title attribute to prevent browser tooltip
            if (trigger.getAttribute('title')) {
                trigger.setAttribute('data-original-title', trigger.getAttribute('title'));
                trigger.removeAttribute('title');
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeTooltip) {
                this.hideTooltip(this.activeTooltip.id);
            }
        });
    }

    // Public Methods
    createTooltip(id, trigger, content, options = {}) {
        const config = { ...this.config, ...options };
        
        // Create tooltip content element if it's a string
        let tooltipContent;
        if (typeof content === 'string') {
            tooltipContent = document.createElement('div');
            tooltipContent.className = 'tooltip-content';
            tooltipContent.textContent = content;
            trigger.appendChild(tooltipContent);
        } else {
            tooltipContent = content;
        }
        
        // Store tooltip
        this.tooltips.set(id, {
            id,
            trigger,
            content: tooltipContent,
            config,
            timeout: null,
            hideTimeout: null
        });
        
        return this.tooltips.get(id);
    }

    showTooltip(id, options = {}) {
        const tooltip = this.tooltips.get(id);
        if (!tooltip) {
            console.error(`Tooltip with id "${id}" not found`);
            return;
        }
        
        const { trigger, content, config } = tooltip;
        const tooltipConfig = { ...config, ...options };
        
        // Clear any existing timeouts
        if (tooltip.timeout) {
            clearTimeout(tooltip.timeout);
        }
        if (tooltip.hideTimeout) {
            clearTimeout(tooltip.hideTimeout);
        }
        
        // Set timeout for showing
        tooltip.timeout = setTimeout(() => {
            this.activateTooltip(tooltip, tooltipConfig);
        }, tooltipConfig.delay);
        
        return this;
    }

    hideTooltip(id, options = {}) {
        const tooltip = this.tooltips.get(id);
        if (!tooltip) {
            console.error(`Tooltip with id "${id}" not found`);
            return;
        }
        
        const { content, config } = tooltip;
        const tooltipConfig = { ...config, ...options };
        
        // Clear any existing timeouts
        if (tooltip.timeout) {
            clearTimeout(tooltip.timeout);
        }
        if (tooltip.hideTimeout) {
            clearTimeout(tooltip.hideTimeout);
        }
        
        // Set timeout for hiding
        tooltip.hideTimeout = setTimeout(() => {
            this.deactivateTooltip(tooltip, tooltipConfig);
        }, tooltipConfig.hideDelay);
        
        return this;
    }

    toggleTooltip(id, options = {}) {
        const tooltip = this.tooltips.get(id);
        if (!tooltip) return;
        
        if (this.activeTooltip && this.activeTooltip.id === id) {
            this.hideTooltip(id, options);
        } else {
            this.showTooltip(id, options);
        }
        
        return this;
    }

    updateTooltip(id, content, options = {}) {
        const tooltip = this.tooltips.get(id);
        if (!tooltip) {
            console.error(`Tooltip with id "${id}" not found`);
            return;
        }
        
        const { content: tooltipContent } = tooltip;
        
        if (typeof content === 'string') {
            tooltipContent.textContent = content;
        } else {
            tooltipContent.innerHTML = content;
        }
        
        // Update position if tooltip is active
        if (this.activeTooltip && this.activeTooltip.id === id) {
            this.positionTooltip(tooltip);
        }
        
        return this;
    }

    destroyTooltip(id) {
        const tooltip = this.tooltips.get(id);
        if (!tooltip) return;
        
        const { trigger, content, timeout, hideTimeout } = tooltip;
        
        // Clear timeouts
        if (timeout) clearTimeout(timeout);
        if (hideTimeout) clearTimeout(hideTimeout);
        
        // Remove tooltip content
        if (content.parentNode) {
            content.parentNode.removeChild(content);
        }
        
        // Restore original title
        const originalTitle = trigger.getAttribute('data-original-title');
        if (originalTitle) {
            trigger.setAttribute('title', originalTitle);
            trigger.removeAttribute('data-original-title');
        }
        
        // Remove ARIA attributes
        trigger.removeAttribute('aria-describedby');
        
        // Remove from active tooltip
        if (this.activeTooltip && this.activeTooltip.id === id) {
            this.activeTooltip = null;
        }
        
        // Remove from tooltips map
        this.tooltips.delete(id);
        
        return this;
    }

    // Private Methods
    activateTooltip(tooltip, config) {
        const { trigger, content } = tooltip;
        
        // Hide any existing active tooltip
        if (this.activeTooltip && this.activeTooltip.id !== tooltip.id) {
            this.deactivateTooltip(this.activeTooltip, config);
        }
        
        // Set as active
        this.activeTooltip = tooltip;
        
        // Position tooltip
        this.positionTooltip(tooltip);
        
        // Show tooltip
        this.showTooltipContent(content, config);
        
        // Set ARIA attributes
        content.setAttribute('aria-hidden', 'false');
        
        // Trigger event
        this.triggerEvent(trigger, 'tooltip:show', { tooltip: config });
    }

    deactivateTooltip(tooltip, config) {
        const { trigger, content } = tooltip;
        
        // Hide tooltip
        this.hideTooltipContent(content, config);
        
        // Set ARIA attributes
        content.setAttribute('aria-hidden', 'true');
        
        // Remove from active
        if (this.activeTooltip && this.activeTooltip.id === tooltip.id) {
            this.activeTooltip = null;
        }
        
        // Trigger event
        this.triggerEvent(trigger, 'tooltip:hide', { tooltip: config });
    }

    showTooltipContent(content, config) {
        content.classList.add('show');
        
        if (config.animation) {
            content.style.transition = `opacity ${config.animationDuration}ms ${config.animationEasing}, 
                                       visibility ${config.animationDuration}ms ${config.animationEasing}, 
                                       transform ${config.animationDuration}ms ${config.animationEasing}`;
        }
    }

    hideTooltipContent(content, config) {
        content.classList.remove('show');
        
        if (config.animation) {
            setTimeout(() => {
                content.style.transition = '';
            }, config.animationDuration);
        }
    }

    positionTooltip(tooltip) {
        const { trigger, content, config } = tooltip;
        
        // Get trigger and content dimensions
        const triggerRect = trigger.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // Calculate position
        const position = this.calculatePosition(triggerRect, contentRect, viewport, config);
        
        // Apply position
        this.applyPosition(content, position, config);
    }

    calculatePosition(triggerRect, contentRect, viewport, config) {
        const { placement, offset, boundary } = config;
        
        let position = { x: 0, y: 0, placement };
        
        // Calculate base position
        switch (placement) {
            case 'top':
                position.x = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
                position.y = triggerRect.top - contentRect.height - offset;
                break;
            case 'bottom':
                position.x = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
                position.y = triggerRect.bottom + offset;
                break;
            case 'left':
                position.x = triggerRect.left - contentRect.width - offset;
                position.y = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
                break;
            case 'right':
                position.x = triggerRect.right + offset;
                position.y = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
                break;
            case 'auto':
                position = this.calculateAutoPosition(triggerRect, contentRect, viewport, offset);
                break;
        }
        
        // Adjust for boundary
        if (boundary === 'viewport') {
            position = this.adjustForViewport(position, contentRect, viewport);
        }
        
        return position;
    }

    calculateAutoPosition(triggerRect, contentRect, viewport, offset) {
        const positions = ['top', 'bottom', 'left', 'right'];
        
        for (const placement of positions) {
            let position = { x: 0, y: 0, placement };
            
            switch (placement) {
                case 'top':
                    position.x = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
                    position.y = triggerRect.top - contentRect.height - offset;
                    break;
                case 'bottom':
                    position.x = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
                    position.y = triggerRect.bottom + offset;
                    break;
                case 'left':
                    position.x = triggerRect.left - contentRect.width - offset;
                    position.y = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
                    break;
                case 'right':
                    position.x = triggerRect.right + offset;
                    position.y = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
                    break;
            }
            
            // Check if position fits in viewport
            if (this.isPositionInViewport(position, contentRect, viewport)) {
                return position;
            }
        }
        
        // Fallback to top
        return {
            x: triggerRect.left + (triggerRect.width - contentRect.width) / 2,
            y: triggerRect.top - contentRect.height - offset,
            placement: 'top'
        };
    }

    isPositionInViewport(position, contentRect, viewport) {
        return position.x >= 0 && 
               position.y >= 0 && 
               position.x + contentRect.width <= viewport.width && 
               position.y + contentRect.height <= viewport.height;
    }

    adjustForViewport(position, contentRect, viewport) {
        const adjusted = { ...position };
        
        // Adjust horizontal position
        if (adjusted.x < 0) {
            adjusted.x = 0;
        } else if (adjusted.x + contentRect.width > viewport.width) {
            adjusted.x = viewport.width - contentRect.width;
        }
        
        // Adjust vertical position
        if (adjusted.y < 0) {
            adjusted.y = 0;
        } else if (adjusted.y + contentRect.height > viewport.height) {
            adjusted.y = viewport.height - contentRect.height;
        }
        
        return adjusted;
    }

    applyPosition(content, position, config) {
        // Remove existing position classes
        content.classList.remove('tooltip-top', 'tooltip-bottom', 'tooltip-left', 'tooltip-right');
        
        // Add position class
        content.classList.add(`tooltip-${position.placement}`);
        
        // Apply position styles
        content.style.position = 'fixed';
        content.style.left = `${position.x}px`;
        content.style.top = `${position.y}px`;
        content.style.zIndex = config.zIndex;
    }

    // Event Handlers
    handleMouseEnter(e) {
        const trigger = e.target.closest('.tooltip-trigger');
        if (!trigger) return;
        
        const tooltip = this.findTooltipByTrigger(trigger);
        if (!tooltip) return;
        
        const { config } = tooltip;
        if (config.trigger === 'hover' || config.trigger === 'hover focus') {
            this.showTooltip(tooltip.id);
        }
    }

    handleMouseLeave(e) {
        const trigger = e.target.closest('.tooltip-trigger');
        if (!trigger) return;
        
        const tooltip = this.findTooltipByTrigger(trigger);
        if (!tooltip) return;
        
        const { config } = tooltip;
        if (config.trigger === 'hover' || config.trigger === 'hover focus') {
            this.hideTooltip(tooltip.id);
        }
    }

    handleFocusIn(e) {
        const trigger = e.target.closest('.tooltip-trigger');
        if (!trigger) return;
        
        const tooltip = this.findTooltipByTrigger(trigger);
        if (!tooltip) return;
        
        const { config } = tooltip;
        if (config.trigger === 'focus' || config.trigger === 'hover focus') {
            this.showTooltip(tooltip.id);
        }
    }

    handleFocusOut(e) {
        const trigger = e.target.closest('.tooltip-trigger');
        if (!trigger) return;
        
        const tooltip = this.findTooltipByTrigger(trigger);
        if (!tooltip) return;
        
        const { config } = tooltip;
        if (config.trigger === 'focus' || config.trigger === 'hover focus') {
            this.hideTooltip(tooltip.id);
        }
    }

    handleClick(e) {
        const trigger = e.target.closest('.tooltip-trigger');
        if (!trigger) return;
        
        const tooltip = this.findTooltipByTrigger(trigger);
        if (!tooltip) return;
        
        const { config } = tooltip;
        if (config.trigger === 'click') {
            this.toggleTooltip(tooltip.id);
        }
    }

    handleResize() {
        if (this.activeTooltip) {
            this.positionTooltip(this.activeTooltip);
        }
    }

    handleScroll() {
        if (this.activeTooltip) {
            this.positionTooltip(this.activeTooltip);
        }
    }

    // Utility Methods
    findTooltipByTrigger(trigger) {
        for (const tooltip of this.tooltips.values()) {
            if (tooltip.trigger === trigger) {
                return tooltip;
            }
        }
        return null;
    }

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
        this.tooltips.forEach((tooltip, id) => {
            this.destroyTooltip(id);
        });
        this.tooltips.clear();
        this.activeTooltip = null;
    }
}

// Initialize tooltip manager
document.addEventListener('DOMContentLoaded', () => {
    window.tooltipManager = new TooltipManager();
});

// Global access
window.TooltipManager = TooltipManager;
