/**
 * Mobile Experience 2025 - JavaScript
 * Optimizes mobile experience with touch-friendly 2025 components
 */

class MobileExperience2025 {
    constructor() {
        this.isMobile = this.detectMobile();
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.isScrolling = false;
        this.init();
    }

    init() {
        this.setupTouchOptimizations();
        this.setupSwipeGestures();
        this.setupPullToRefresh();
        this.setupMobileNavigation();
        this.setupViewportOptimizations();
        this.setupPerformanceOptimizations();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    setupTouchOptimizations() {
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Add touch feedback to interactive elements
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.btn, .card, .nav-item, .tab-item');
            if (target) {
                target.classList.add('touch-active');
            }
        });

        document.addEventListener('touchend', (e) => {
            const target = e.target.closest('.btn, .card, .nav-item, .tab-item');
            if (target) {
                setTimeout(() => target.classList.remove('touch-active'), 150);
            }
        });
    }

    setupSwipeGestures() {
        let startX, startY, endX, endY;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            this.handleSwipe(startX, startY, endX, endY);
        });
    }

    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                this.onSwipeRight();
            } else {
                this.onSwipeLeft();
            }
        } else if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                this.onSwipeDown();
            } else {
                this.onSwipeUp();
            }
        }
    }

    onSwipeLeft() {
        // Close mobile menu or navigate forward
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            this.closeMobileMenu();
        }
    }

    onSwipeRight() {
        // Open mobile menu or navigate back
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('active')) {
            this.openMobileMenu();
        }
    }

    onSwipeUp() {
        // Scroll to top or show navigation
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    onSwipeDown() {
        // Show pull to refresh or scroll to bottom
        if (window.scrollY === 0) {
            this.triggerPullToRefresh();
        }
    }

    setupPullToRefresh() {
        let startY = 0;
        let pullDistance = 0;
        const pullThreshold = 100;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (window.scrollY === 0 && startY > 0) {
                pullDistance = e.touches[0].clientY - startY;
                if (pullDistance > 0) {
                    e.preventDefault();
                    this.updatePullToRefresh(pullDistance, pullThreshold);
                }
            }
        });

        document.addEventListener('touchend', () => {
            if (pullDistance > pullThreshold) {
                this.triggerPullToRefresh();
            }
            this.resetPullToRefresh();
            startY = 0;
            pullDistance = 0;
        });
    }

    updatePullToRefresh(distance, threshold) {
        const progress = Math.min(distance / threshold, 1);
        document.documentElement.style.setProperty('--pull-progress', progress);
    }

    resetPullToRefresh() {
        document.documentElement.style.removeProperty('--pull-progress');
    }

    triggerPullToRefresh() {
        // Trigger refresh action
        window.location.reload();
    }

    setupMobileNavigation() {
        // Mobile menu toggle
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });
    }

    toggleMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        }
    }

    openMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            document.body.classList.add('menu-open');
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    }

    setupViewportOptimizations() {
        // Set viewport height for mobile browsers
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);

        // Prevent horizontal scroll
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    setupPerformanceOptimizations() {
        // Lazy load images on mobile
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Optimize scroll performance
        let ticking = false;
        const updateScrollPosition = () => {
            const scrollY = window.scrollY;
            document.documentElement.style.setProperty('--scroll-y', scrollY);
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        });
    }
}

// Initialize mobile experience
document.addEventListener('DOMContentLoaded', () => {
    window.mobileExperience = new MobileExperience2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileExperience2025;
}
