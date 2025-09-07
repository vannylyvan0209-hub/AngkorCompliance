/**
 * Angkor Compliance Platform - Homepage JavaScript
 * Advanced interactions, animations, and user experience enhancements
 */

class HomepageManager {
    constructor() {
        this.init();
    }

    init() {
        this.initAOS();
        this.initLucideIcons();
        this.initHeaderManager();
        this.initParticleSystem();
        this.initAnimatedCounters();
        this.initSmoothScrolling();
        this.initPerformanceOptimizations();
        this.initAccessibilityFeatures();
        this.initAnalytics();
        this.initDemo();
    }

    /**
     * Initialize AOS (Animate On Scroll) library
     */
    initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 100,
                disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            });
        }
    }

    /**
     * Initialize Lucide icons
     */
    initLucideIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Initialize header management
     */
    initHeaderManager() {
        this.header = document.querySelector('.header');
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.mobileMenu = document.getElementById('mobileMenu');
        this.langToggle = document.getElementById('langToggle');
        this.langDropdown = document.getElementById('langDropdown');

        this.initScrollEffects();
        this.initMobileMenu();
        this.initLanguageSelector();
    }

    /**
     * Initialize scroll effects for header
     */
    initScrollEffects() {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 100) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }

            // Hide/show header on scroll
            if (scrollY > lastScrollY && scrollY > 200) {
                this.header.style.transform = 'translateY(-100%)';
            } else {
                this.header.style.transform = 'translateY(0)';
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    /**
     * Initialize mobile menu functionality
     */
    initMobileMenu() {
        if (!this.mobileMenuToggle || !this.mobileMenu) return;

        const toggleMenu = () => {
            const isOpen = this.mobileMenu.classList.contains('active');
            
            this.mobileMenuToggle.classList.toggle('active');
            this.mobileMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isOpen ? '' : 'hidden';
            
            // Update ARIA attributes
            this.mobileMenuToggle.setAttribute('aria-expanded', !isOpen);
        };

        this.mobileMenuToggle.addEventListener('click', toggleMenu);

        // Close menu when clicking on links
        const mobileLinks = this.mobileMenu.querySelectorAll('.mobile-nav-link, .btn');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.mobileMenuToggle.classList.remove('active');
                this.mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.mobileMenuToggle.contains(e.target) && 
                !this.mobileMenu.contains(e.target) && 
                this.mobileMenu.classList.contains('active')) {
                toggleMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    }

    /**
     * Initialize language selector
     */
    initLanguageSelector() {
        if (!this.langToggle || !this.langDropdown) return;

        const langOptions = this.langDropdown.querySelectorAll('.lang-option');
        
        const toggleDropdown = (e) => {
            e.stopPropagation();
            const selector = this.langToggle.closest('.language-selector');
            selector.classList.toggle('active');
        };

        this.langToggle.addEventListener('click', toggleDropdown);

        // Language selection
        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = option.getAttribute('data-lang');
                const langText = option.querySelector('span').textContent;
                
                // Update active state
                langOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Update button text
                this.langToggle.querySelector('span').textContent = lang === 'en' ? 'EN' : 'KM';
                
                // Close dropdown
                this.langToggle.closest('.language-selector').classList.remove('active');
                
                // Store language preference
                localStorage.setItem('preferred-language', lang);
                
                // Trigger language change event
                this.triggerLanguageChange(lang);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.langToggle.closest('.language-selector').classList.remove('active');
        });

        // Load saved language preference
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang) {
            const savedOption = this.langDropdown.querySelector(`[data-lang="${savedLang}"]`);
            if (savedOption) {
                savedOption.click();
            }
        }
    }

    /**
     * Trigger language change event
     */
    triggerLanguageChange(lang) {
        const event = new CustomEvent('languageChange', {
            detail: { language: lang }
        });
        document.dispatchEvent(event);
    }

    /**
     * Initialize particle system for hero background
     */
    initParticleSystem() {
        const particlesContainer = document.getElementById('heroParticles');
        if (!particlesContainer) return;

        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--primary-gold);
                border-radius: 50%;
                opacity: 0.3;
                pointer-events: none;
                animation: float 6s infinite linear;
            `;
            
            // Random position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            // Random animation delay
            particle.style.animationDelay = Math.random() * 6 + 's';
            
            particlesContainer.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 6000);
        };

        // Create particles periodically
        setInterval(createParticle, 2000);
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0% {
                    transform: translateY(100vh) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 0.3;
                }
                90% {
                    opacity: 0.3;
                }
                100% {
                    transform: translateY(-100px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Initialize animated counters
     */
    initAnimatedCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');
        
        const animateCounter = (element) => {
            const target = parseFloat(element.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const startTime = performance.now();
            
            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = target * easeOutQuart;
                
                // Format number based on target
                if (target >= 1000) {
                    element.textContent = Math.floor(current).toLocaleString();
                } else if (target % 1 !== 0) {
                    element.textContent = current.toFixed(1) + '%';
                } else {
                    element.textContent = Math.floor(current);
                }
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    if (target >= 1000) {
                        element.textContent = target.toLocaleString();
                    } else if (target % 1 !== 0) {
                        element.textContent = target.toString() + '%';
                    } else {
                        element.textContent = target.toString();
                    }
                }
            };
            
            requestAnimationFrame(updateCounter);
        };

        // Intersection Observer for animated counters
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    /**
     * Initialize smooth scrolling for anchor links
     */
    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Initialize performance optimizations
     */
    initPerformanceOptimizations() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));

        // Preload critical resources
        this.preloadCriticalResources();
    }

    /**
     * Preload critical resources
     */
    preloadCriticalResources() {
        const criticalResources = [
            'assets/css/color-system.css',
            'assets/css/design-tokens.css',
            'assets/css/utilities.css',
            'assets/css/components.css'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = resource;
            document.head.appendChild(link);
        });
    }

    /**
     * Initialize accessibility features
     */
    initAccessibilityFeatures() {
        // Add skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-gold);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add ARIA labels to interactive elements
        const interactiveElements = document.querySelectorAll('.btn, .nav-link, .lang-btn');
        interactiveElements.forEach(element => {
            if (!element.getAttribute('aria-label') && !element.textContent.trim()) {
                element.setAttribute('aria-label', 'Interactive element');
            }
        });

        // Keyboard navigation for custom elements
        this.initKeyboardNavigation();
    }

    /**
     * Initialize keyboard navigation
     */
    initKeyboardNavigation() {
        // Handle Enter key on custom buttons
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('lang-btn')) {
                e.target.click();
            }
        });

        // Focus management for mobile menu
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.mobileMenu.classList.contains('active')) {
                const focusableContent = this.mobileMenu.querySelectorAll(focusableElements);
                const firstFocusableElement = focusableContent[0];
                const lastFocusableElement = focusableContent[focusableContent.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    /**
     * Initialize demo functionality
     */
    initDemo() {
        const demoButton = document.querySelector('a[href="#demo"]');
        if (demoButton) {
            demoButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.trackEvent('demo_requested', { source: 'homepage' });
                this.showDemoModal();
            });
        }
    }

    /**
     * Initialize analytics tracking
     */
    initAnalytics() {
        // Track page view
        this.trackEvent('page_view', {
            page: 'homepage',
            timestamp: new Date().toISOString()
        });

        // Track CTA clicks
        this.trackCTAClicks();
        
        // Track scroll depth
        this.trackScrollDepth();
        
        // Track form interactions
        this.trackFormInteractions();
        
        // Track feature interactions
        this.trackFeatureInteractions();
    }

    /**
     * Track CTA button clicks
     */
    trackCTAClicks() {
        const ctaButtons = document.querySelectorAll('a[href*="register"], a[href*="login"], .btn-primary');
        
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonText = button.textContent.trim();
                const buttonHref = button.getAttribute('href');
                
                this.trackEvent('cta_clicked', {
                    button_text: buttonText,
                    button_href: buttonHref,
                    section: this.getSectionFromElement(button)
                });
            });
        });
    }

    /**
     * Track scroll depth
     */
    trackScrollDepth() {
        let maxScrollDepth = 0;
        const milestones = [25, 50, 75, 90, 100];
        const trackedMilestones = new Set();

        const trackScrollDepth = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollDepth = Math.round((scrollTop / documentHeight) * 100);

            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
            }

            milestones.forEach(milestone => {
                if (scrollDepth >= milestone && !trackedMilestones.has(milestone)) {
                    trackedMilestones.add(milestone);
                    this.trackEvent('scroll_depth', {
                        depth: milestone,
                        max_depth: maxScrollDepth
                    });
                }
            });
        };

        window.addEventListener('scroll', this.throttle(trackScrollDepth, 1000), { passive: true });
    }

    /**
     * Track form interactions
     */
    trackFormInteractions() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Track form focus
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    this.trackEvent('form_field_focused', {
                        field_name: input.name || input.id,
                        form_id: form.id || 'unknown'
                    });
                });
            });

            // Track form submission
            form.addEventListener('submit', (e) => {
                this.trackEvent('form_submitted', {
                    form_id: form.id || 'unknown',
                    form_action: form.action || 'unknown'
                });
            });
        });
    }

    /**
     * Track feature interactions
     */
    trackFeatureInteractions() {
        // Track feature card hovers
        const featureCards = document.querySelectorAll('.feature-card, .standard-card, .step-item');
        
        featureCards.forEach(card => {
            let hoverStartTime = null;
            
            card.addEventListener('mouseenter', () => {
                hoverStartTime = Date.now();
                this.trackEvent('feature_hover_start', {
                    feature_type: card.className,
                    feature_title: card.querySelector('h3')?.textContent || 'unknown'
                });
            });
            
            card.addEventListener('mouseleave', () => {
                if (hoverStartTime) {
                    const hoverDuration = Date.now() - hoverStartTime;
                    this.trackEvent('feature_hover_end', {
                        feature_type: card.className,
                        feature_title: card.querySelector('h3')?.textContent || 'unknown',
                        hover_duration: hoverDuration
                    });
                }
            });
        });

        // Track pricing card interactions
        const pricingCards = document.querySelectorAll('.pricing-card');
        pricingCards.forEach(card => {
            card.addEventListener('click', () => {
                const planName = card.querySelector('h3')?.textContent || 'unknown';
                this.trackEvent('pricing_card_clicked', {
                    plan_name: planName,
                    is_featured: card.classList.contains('featured')
                });
            });
        });
    }

    /**
     * Track custom events
     */
    trackEvent(eventName, eventData = {}) {
        // Google Analytics 4 tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...eventData,
                event_category: 'homepage',
                event_label: eventName
            });
        }

        // Custom analytics tracking
        const analyticsData = {
            event: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            user_agent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        // Send to custom analytics endpoint
        this.sendAnalytics(analyticsData);

        // Console log for development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Analytics Event:', analyticsData);
        }
    }

    /**
     * Send analytics data to server
     */
    async sendAnalytics(data) {
        try {
            // Send to Firebase Analytics or custom endpoint
            if (typeof firebase !== 'undefined' && firebase.analytics) {
                firebase.analytics().logEvent(data.event, data.data);
            }

            // Send to custom analytics endpoint
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.warn('Analytics tracking failed:', error);
        }
    }

    /**
     * Get section name from element
     */
    getSectionFromElement(element) {
        const section = element.closest('section');
        if (section) {
            return section.id || section.className.split(' ')[0] || 'unknown';
        }
        return 'unknown';
    }

    /**
     * Throttle function for performance
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Show demo modal
     */
    showDemoModal() {
        // Create demo modal
        const modal = document.createElement('div');
        modal.className = 'demo-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Platform Demo</h3>
                        <button class="modal-close" aria-label="Close demo">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="demo-video">
                            <div class="video-placeholder">
                                <i data-lucide="play-circle"></i>
                                <p>Demo video will be available soon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Initialize icons in modal
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Close modal functionality
        const closeModal = () => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }
}

// Initialize homepage when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomepageManager();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HomepageManager;
}
