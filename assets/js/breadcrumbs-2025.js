/**
 * Angkor Compliance Platform - Breadcrumb Navigation JavaScript 2025
 * 
 * Modern breadcrumb navigation system with 2025 design patterns,
 * accessibility support, and responsive design.
 */

class BreadcrumbManager {
    constructor() {
        this.breadcrumbs = new Map();
        this.currentPath = [];
        this.config = {
            separator: '/',
            maxItems: 5,
            showHome: true,
            homeIcon: 'home',
            homeText: 'Home',
            homeUrl: '/index.html',
            truncateText: true,
            maxTextLength: 20,
            animation: true,
            responsive: true,
            accessibility: true
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeBreadcrumbs();
        this.setupResponsiveHandling();
        this.setupAccessibility();
    }

    setupEventListeners() {
        // Handle window resize for responsive behavior
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle navigation changes
        window.addEventListener('popstate', () => {
            this.updateBreadcrumbs();
        });

        // Handle clicks on breadcrumb links
        document.addEventListener('click', (e) => {
            if (e.target.closest('.breadcrumb-link')) {
                this.handleBreadcrumbClick(e);
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.breadcrumb')) {
                this.handleKeyboardNavigation(e);
            }
        });
    }

    initializeBreadcrumbs() {
        const breadcrumbElements = document.querySelectorAll('.breadcrumb');
        
        breadcrumbElements.forEach((element, index) => {
            const id = element.id || `breadcrumb-${index}`;
            this.breadcrumbs.set(id, {
                element,
                path: this.parseCurrentPath(),
                config: { ...this.config }
            });
            
            this.renderBreadcrumb(id);
        });
    }

    parseCurrentPath() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        const breadcrumbPath = [];
        
        // Add home if configured
        if (this.config.showHome) {
            breadcrumbPath.push({
                text: this.config.homeText,
                url: this.config.homeUrl,
                icon: this.config.homeIcon,
                active: false
            });
        }
        
        // Build path segments
        let currentPath = '';
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === segments.length - 1;
            
            breadcrumbPath.push({
                text: this.formatSegmentText(segment),
                url: isLast ? null : currentPath,
                icon: this.getSegmentIcon(segment),
                active: isLast
            });
        });
        
        return breadcrumbPath;
    }

    formatSegmentText(segment) {
        // Convert segment to readable text
        return segment
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    getSegmentIcon(segment) {
        const iconMap = {
            'dashboard': 'layout-dashboard',
            'documents': 'file-text',
            'settings': 'settings',
            'profile': 'user',
            'help': 'help-circle',
            'reports': 'bar-chart',
            'analytics': 'trending-up',
            'users': 'users',
            'admin': 'shield',
            'factory': 'building',
            'worker': 'user-check',
            'hr': 'briefcase',
            'audit': 'search',
            'grievance': 'message-circle',
            'compliance': 'check-circle',
            'training': 'book-open',
            'meetings': 'calendar',
            'tasks': 'check-square',
            'notifications': 'bell',
            'messages': 'mail',
            'files': 'folder',
            'images': 'image',
            'videos': 'video',
            'audio': 'music'
        };
        
        return iconMap[segment.toLowerCase()] || 'folder';
    }

    renderBreadcrumb(id) {
        const breadcrumb = this.breadcrumbs.get(id);
        if (!breadcrumb) return;
        
        const { element, path, config } = breadcrumb;
        const breadcrumbList = element.querySelector('.breadcrumb-list') || this.createBreadcrumbList(element);
        
        // Clear existing items
        breadcrumbList.innerHTML = '';
        
        // Limit items if configured
        const displayPath = this.limitBreadcrumbItems(path, config.maxItems);
        
        // Render breadcrumb items
        displayPath.forEach((item, index) => {
            const breadcrumbItem = this.createBreadcrumbItem(item, index, displayPath.length);
            breadcrumbList.appendChild(breadcrumbItem);
        });
        
        // Add animations if configured
        if (config.animation) {
            this.animateBreadcrumb(element);
        }
    }

    createBreadcrumbList(element) {
        const list = document.createElement('ol');
        list.className = 'breadcrumb-list';
        list.setAttribute('role', 'list');
        element.appendChild(list);
        return list;
    }

    createBreadcrumbItem(item, index, totalItems) {
        const listItem = document.createElement('li');
        listItem.className = 'breadcrumb-item';
        
        if (item.active) {
            listItem.setAttribute('aria-current', 'page');
        }
        
        const link = document.createElement(item.url ? 'a' : 'span');
        link.className = `breadcrumb-link ${item.active ? 'active' : ''}`;
        
        if (item.url) {
            link.href = item.url;
            link.setAttribute('data-breadcrumb-index', index);
        } else {
            link.setAttribute('aria-current', 'page');
        }
        
        // Add icon if available
        if (item.icon) {
            const icon = document.createElement('i');
            icon.setAttribute('data-lucide', item.icon);
            icon.className = 'breadcrumb-icon';
            link.appendChild(icon);
        }
        
        // Add text
        const text = document.createElement('span');
        text.className = 'breadcrumb-text';
        text.textContent = this.truncateText(item.text, this.config.maxTextLength);
        text.title = item.text; // Full text as tooltip
        link.appendChild(text);
        
        listItem.appendChild(link);
        
        // Add separator if not last item
        if (index < totalItems - 1) {
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = this.config.separator;
            separator.setAttribute('aria-hidden', 'true');
            listItem.appendChild(separator);
        }
        
        return listItem;
    }

    limitBreadcrumbItems(path, maxItems) {
        if (path.length <= maxItems) {
            return path;
        }
        
        const result = [];
        
        // Always include home
        if (path[0] && path[0].text === this.config.homeText) {
            result.push(path[0]);
        }
        
        // Add ellipsis if needed
        if (path.length > maxItems) {
            result.push({
                text: '...',
                url: null,
                icon: 'more-horizontal',
                active: false,
                ellipsis: true
            });
        }
        
        // Add last few items
        const lastItems = path.slice(-(maxItems - 1));
        result.push(...lastItems);
        
        return result;
    }

    truncateText(text, maxLength) {
        if (!this.config.truncateText || text.length <= maxLength) {
            return text;
        }
        
        return text.substring(0, maxLength) + '...';
    }

    animateBreadcrumb(element) {
        const items = element.querySelectorAll('.breadcrumb-item');
        
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    handleBreadcrumbClick(e) {
        const link = e.target.closest('.breadcrumb-link');
        if (!link || !link.href) return;
        
        const index = link.getAttribute('data-breadcrumb-index');
        if (index !== null) {
            // Add click animation
            link.style.transform = 'scale(0.95)';
            setTimeout(() => {
                link.style.transform = 'scale(1)';
            }, 150);
        }
    }

    handleKeyboardNavigation(e) {
        const breadcrumb = e.target.closest('.breadcrumb');
        if (!breadcrumb) return;
        
        const links = breadcrumb.querySelectorAll('.breadcrumb-link');
        const currentIndex = Array.from(links).indexOf(document.activeElement);
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (currentIndex > 0) {
                    links[currentIndex - 1].focus();
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentIndex < links.length - 1) {
                    links[currentIndex + 1].focus();
                }
                break;
            case 'Home':
                e.preventDefault();
                links[0].focus();
                break;
            case 'End':
                e.preventDefault();
                links[links.length - 1].focus();
                break;
        }
    }

    handleResize() {
        if (!this.config.responsive) return;
        
        this.breadcrumbs.forEach((breadcrumb, id) => {
            this.renderBreadcrumb(id);
        });
    }

    setupResponsiveHandling() {
        if (!this.config.responsive) return;
        
        // Add responsive classes based on screen size
        const updateResponsiveClasses = () => {
            this.breadcrumbs.forEach((breadcrumb) => {
                const { element } = breadcrumb;
                
                if (window.innerWidth < 768) {
                    element.classList.add('breadcrumb-mobile');
                } else {
                    element.classList.remove('breadcrumb-mobile');
                }
                
                if (window.innerWidth < 480) {
                    element.classList.add('breadcrumb-small');
                } else {
                    element.classList.remove('breadcrumb-small');
                }
            });
        };
        
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    setupAccessibility() {
        if (!this.config.accessibility) return;
        
        this.breadcrumbs.forEach((breadcrumb) => {
            const { element } = breadcrumb;
            
            // Add ARIA label
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'Breadcrumb navigation');
            }
            
            // Add navigation role
            element.setAttribute('role', 'navigation');
            
            // Ensure proper focus management
            const links = element.querySelectorAll('.breadcrumb-link');
            links.forEach((link, index) => {
                link.setAttribute('tabindex', '0');
                
                if (index === 0) {
                    link.setAttribute('aria-label', 'Go to home page');
                }
            });
        });
    }

    // Public Methods
    updateBreadcrumbs() {
        this.breadcrumbs.forEach((breadcrumb, id) => {
            breadcrumb.path = this.parseCurrentPath();
            this.renderBreadcrumb(id);
        });
    }

    addBreadcrumb(id, path) {
        if (this.breadcrumbs.has(id)) {
            const breadcrumb = this.breadcrumbs.get(id);
            breadcrumb.path = path;
            this.renderBreadcrumb(id);
        }
    }

    removeBreadcrumb(id) {
        this.breadcrumbs.delete(id);
    }

    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.breadcrumbs.forEach((breadcrumb, id) => {
            breadcrumb.config = { ...this.config };
            this.renderBreadcrumb(id);
        });
    }

    getBreadcrumb(id) {
        return this.breadcrumbs.get(id);
    }

    getAllBreadcrumbs() {
        return Array.from(this.breadcrumbs.values());
    }

    // Utility Methods
    createBreadcrumbFromPath(path, options = {}) {
        const config = { ...this.config, ...options };
        const breadcrumbPath = path.map((segment, index) => ({
            text: typeof segment === 'string' ? segment : segment.text,
            url: typeof segment === 'string' ? null : segment.url,
            icon: typeof segment === 'string' ? null : segment.icon,
            active: index === path.length - 1
        }));
        
        return breadcrumbPath;
    }

    generateBreadcrumbHTML(path, options = {}) {
        const config = { ...this.config, ...options };
        const breadcrumbPath = this.createBreadcrumbFromPath(path, config);
        const displayPath = this.limitBreadcrumbItems(breadcrumbPath, config.maxItems);
        
        let html = '<ol class="breadcrumb-list" role="list">';
        
        displayPath.forEach((item, index) => {
            const isActive = item.active;
            const tag = item.url ? 'a' : 'span';
            const href = item.url ? ` href="${item.url}"` : '';
            const ariaCurrent = isActive ? ' aria-current="page"' : '';
            
            html += `<li class="breadcrumb-item"${isActive ? ' aria-current="page"' : ''}>`;
            html += `<${tag} class="breadcrumb-link${isActive ? ' active' : ''}"${href}${ariaCurrent}>`;
            
            if (item.icon) {
                html += `<i data-lucide="${item.icon}" class="breadcrumb-icon"></i>`;
            }
            
            html += `<span class="breadcrumb-text">${this.truncateText(item.text, config.maxTextLength)}</span>`;
            html += `</${tag}>`;
            
            if (index < displayPath.length - 1) {
                html += `<span class="breadcrumb-separator" aria-hidden="true">${config.separator}</span>`;
            }
            
            html += '</li>';
        });
        
        html += '</ol>';
        return html;
    }

    // Event Handlers
    onBreadcrumbClick(callback) {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.breadcrumb-link')) {
                const link = e.target.closest('.breadcrumb-link');
                const index = link.getAttribute('data-breadcrumb-index');
                const text = link.querySelector('.breadcrumb-text').textContent;
                const url = link.href;
                
                callback({
                    index: index ? parseInt(index) : null,
                    text,
                    url,
                    element: link
                });
            }
        });
    }

    onBreadcrumbChange(callback) {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        history.pushState = function(...args) {
            originalPushState.apply(history, args);
            callback('pushstate');
        };
        
        history.replaceState = function(...args) {
            originalReplaceState.apply(history, args);
            callback('replacestate');
        };
        
        window.addEventListener('popstate', () => {
            callback('popstate');
        });
    }

    // Cleanup
    destroy() {
        this.breadcrumbs.clear();
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('popstate', this.updateBreadcrumbs);
    }
}

// Initialize breadcrumb manager
document.addEventListener('DOMContentLoaded', () => {
    window.breadcrumbManager = new BreadcrumbManager();
});

// Global access
window.BreadcrumbManager = BreadcrumbManager;
