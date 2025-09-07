/**
 * Angkor Compliance Platform - Animation System JavaScript 2025
 * 
 * Comprehensive animation system using AOS and custom CSS animations
 * for consistent, performant, and accessible animations.
 */

class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.observers = new Map();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        this.setupReducedMotionListener();
        this.initializeAOS();
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupFocusAnimations();
        this.setupActiveAnimations();
        this.setupPerformanceOptimizations();
    }

    setupReducedMotionListener() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', (e) => {
            this.isReducedMotion = e.matches;
            if (this.isReducedMotion) {
                this.disableAllAnimations();
            } else {
                this.enableAllAnimations();
            }
        });
    }

    initializeAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 100,
                delay: 0,
                anchorPlacement: 'top-bottom',
                disable: this.isReducedMotion
            });
        }
    }

    setupScrollAnimations() {
        const scrollElements = document.querySelectorAll('.animate-on-scroll');
        
        if (scrollElements.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            scrollElements.forEach(element => {
                observer.observe(element);
            });
            
            this.observers.set('scroll', observer);
        }
    }

    setupHoverAnimations() {
        const hoverElements = document.querySelectorAll('.animate-on-hover');
        
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    element.style.transform = 'translateY(-5px)';
                }
            });
            
            element.addEventListener('mouseleave', () => {
                if (!this.isReducedMotion) {
                    element.style.transform = 'translateY(0)';
                }
            });
        });
    }

    setupFocusAnimations() {
        const focusElements = document.querySelectorAll('.animate-on-focus');
        
        focusElements.forEach(element => {
            element.addEventListener('focus', () => {
                if (!this.isReducedMotion) {
                    element.style.transform = 'scale(1.05)';
                }
            });
            
            element.addEventListener('blur', () => {
                if (!this.isReducedMotion) {
                    element.style.transform = 'scale(1)';
                }
            });
        });
    }

    setupActiveAnimations() {
        const activeElements = document.querySelectorAll('.animate-on-active');
        
        activeElements.forEach(element => {
            element.addEventListener('mousedown', () => {
                if (!this.isReducedMotion) {
                    element.style.transform = 'scale(0.95)';
                }
            });
            
            element.addEventListener('mouseup', () => {
                if (!this.isReducedMotion) {
                    element.style.transform = 'scale(1)';
                }
            });
            
            element.addEventListener('mouseleave', () => {
                if (!this.isReducedMotion) {
                    element.style.transform = 'scale(1)';
                }
            });
        });
    }

    setupPerformanceOptimizations() {
        // Add GPU acceleration to animated elements
        const animatedElements = document.querySelectorAll('.animate, [data-aos]');
        
        animatedElements.forEach(element => {
            element.classList.add('animate-gpu');
        });
    }

    // Animation Methods
    fadeIn(element, duration = 300, delay = 0) {
        if (this.isReducedMotion) {
            element.style.opacity = '1';
            return;
        }
        
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, delay);
    }

    fadeOut(element, duration = 300, delay = 0) {
        if (this.isReducedMotion) {
            element.style.opacity = '0';
            return;
        }
        
        element.style.transition = `opacity ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '0';
        }, delay);
    }

    slideIn(element, direction = 'up', duration = 300, delay = 0) {
        if (this.isReducedMotion) {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
            return;
        }
        
        const transforms = {
            up: 'translateY(30px)',
            down: 'translateY(-30px)',
            left: 'translateX(-30px)',
            right: 'translateX(30px)'
        };
        
        element.style.opacity = '0';
        element.style.transform = transforms[direction];
        element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) translateX(0)';
        }, delay);
    }

    slideOut(element, direction = 'up', duration = 300, delay = 0) {
        if (this.isReducedMotion) {
            element.style.opacity = '0';
            return;
        }
        
        const transforms = {
            up: 'translateY(-30px)',
            down: 'translateY(30px)',
            left: 'translateX(-30px)',
            right: 'translateX(30px)'
        };
        
        element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.transform = transforms[direction];
        }, delay);
    }

    scaleIn(element, duration = 300, delay = 0) {
        if (this.isReducedMotion) {
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
            return;
        }
        
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }, delay);
    }

    scaleOut(element, duration = 300, delay = 0) {
        if (this.isReducedMotion) {
            element.style.opacity = '0';
            return;
        }
        
        element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.transform = 'scale(0.8)';
        }, delay);
    }

    rotateIn(element, duration = 300, delay = 0) {
        if (this.isReducedMotion) {
            element.style.transform = 'rotate(0deg)';
            element.style.opacity = '1';
            return;
        }
        
        element.style.opacity = '0';
        element.style.transform = 'rotate(-180deg)';
        element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'rotate(0deg)';
        }, delay);
    }

    rotateOut(element, duration = 300, delay = 0) {
        if (this.isReducedMotion) {
            element.style.opacity = '0';
            return;
        }
        
        element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.transform = 'rotate(180deg)';
        }, delay);
    }

    bounceIn(element, duration = 600, delay = 0) {
        if (this.isReducedMotion) {
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
            return;
        }
        
        element.style.opacity = '0';
        element.style.transform = 'scale(0.3)';
        element.style.transition = `opacity ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55), transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }, delay);
    }

    bounceOut(element, duration = 600, delay = 0) {
        if (this.isReducedMotion) {
            element.style.opacity = '0';
            return;
        }
        
        element.style.transition = `opacity ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55), transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
        
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.transform = 'scale(0.3)';
        }, delay);
    }

    pulse(element, duration = 1000, iterations = 3) {
        if (this.isReducedMotion) {
            return;
        }
        
        element.style.animation = `pulse ${duration}ms ease-in-out ${iterations}`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration * iterations);
    }

    shake(element, duration = 500) {
        if (this.isReducedMotion) {
            return;
        }
        
        element.style.animation = `shake ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    wiggle(element, duration = 1000) {
        if (this.isReducedMotion) {
            return;
        }
        
        element.style.animation = `wiggle ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    glow(element, duration = 2000, iterations = 3) {
        if (this.isReducedMotion) {
            return;
        }
        
        element.style.animation = `glow ${duration}ms ease-in-out ${iterations}`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration * iterations);
    }

    // Utility Methods
    addAnimation(element, animationType, options = {}) {
        const {
            duration = 300,
            delay = 0,
            easing = 'ease-in-out',
            iterations = 1,
            direction = 'normal',
            fillMode = 'both'
        } = options;
        
        if (this.isReducedMotion) {
            return;
        }
        
        const animationId = `animation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        element.style.animation = `${animationType} ${duration}ms ${easing} ${delay}ms ${iterations} ${direction} ${fillMode}`;
        
        this.animations.set(animationId, {
            element,
            animationType,
            options,
            startTime: Date.now()
        });
        
        return animationId;
    }

    removeAnimation(animationId) {
        if (this.animations.has(animationId)) {
            const animation = this.animations.get(animationId);
            animation.element.style.animation = '';
            this.animations.delete(animationId);
        }
    }

    pauseAnimation(animationId) {
        if (this.animations.has(animationId)) {
            const animation = this.animations.get(animationId);
            animation.element.style.animationPlayState = 'paused';
        }
    }

    resumeAnimation(animationId) {
        if (this.animations.has(animationId)) {
            const animation = this.animations.get(animationId);
            animation.element.style.animationPlayState = 'running';
        }
    }

    disableAllAnimations() {
        const animatedElements = document.querySelectorAll('.animate, [data-aos]');
        
        animatedElements.forEach(element => {
            element.style.animation = 'none';
            element.style.transition = 'none';
            element.style.transform = 'none';
        });
        
        // Disable AOS
        if (typeof AOS !== 'undefined') {
            AOS.refreshHard();
        }
    }

    enableAllAnimations() {
        const animatedElements = document.querySelectorAll('.animate, [data-aos]');
        
        animatedElements.forEach(element => {
            element.style.animation = '';
            element.style.transition = '';
            element.style.transform = '';
        });
        
        // Enable AOS
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    // Animation Sequences
    sequence(elements, animations, options = {}) {
        const {
            stagger = 100,
            loop = false,
            reverse = false
        } = options;
        
        if (this.isReducedMotion) {
            elements.forEach(element => {
                element.style.opacity = '1';
                element.style.transform = 'none';
            });
            return;
        }
        
        const sequence = [];
        
        elements.forEach((element, index) => {
            const delay = index * stagger;
            const animation = animations[index % animations.length];
            
            sequence.push({
                element,
                animation,
                delay
            });
        });
        
        if (reverse) {
            sequence.reverse();
        }
        
        sequence.forEach(({ element, animation, delay }) => {
            setTimeout(() => {
                this.addAnimation(element, animation, { delay: 0 });
            }, delay);
        });
        
        if (loop) {
            const totalDuration = (elements.length - 1) * stagger + 1000;
            setTimeout(() => {
                this.sequence(elements, animations, options);
            }, totalDuration);
        }
    }

    // Staggered Animations
    stagger(elements, animationType, options = {}) {
        const {
            stagger = 100,
            duration = 300,
            delay = 0
        } = options;
        
        elements.forEach((element, index) => {
            const elementDelay = delay + (index * stagger);
            this.addAnimation(element, animationType, { duration, delay: elementDelay });
        });
    }

    // Chained Animations
    chain(elements, animations, options = {}) {
        const {
            delay = 0,
            duration = 300
        } = options;
        
        let currentDelay = delay;
        
        elements.forEach((element, index) => {
            const animation = animations[index % animations.length];
            
            setTimeout(() => {
                this.addAnimation(element, animation, { duration });
            }, currentDelay);
            
            currentDelay += duration;
        });
    }

    // Animation Events
    onAnimationStart(element, callback) {
        element.addEventListener('animationstart', callback);
    }

    onAnimationEnd(element, callback) {
        element.addEventListener('animationend', callback);
    }

    onAnimationIteration(element, callback) {
        element.addEventListener('animationiteration', callback);
    }

    // Performance Monitoring
    getAnimationPerformance() {
        const performance = {
            activeAnimations: this.animations.size,
            observers: this.observers.size,
            reducedMotion: this.isReducedMotion,
            gpuAccelerated: document.querySelectorAll('.animate-gpu').length
        };
        
        return performance;
    }

    // Cleanup
    destroy() {
        // Clear all animations
        this.animations.forEach((animation, id) => {
            this.removeAnimation(id);
        });
        
        // Disconnect all observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        
        // Clear maps
        this.animations.clear();
        this.observers.clear();
    }
}

// Initialize animation manager
document.addEventListener('DOMContentLoaded', () => {
    window.animationManager = new AnimationManager();
});

// Global access
window.AnimationManager = AnimationManager;
