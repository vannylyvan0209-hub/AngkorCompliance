/**
 * Angkor Compliance Platform - Avatar System JavaScript 2025
 * 
 * Role-specific avatar functionality with dynamic generation and management.
 */

class AvatarManager {
    constructor() {
        this.roleIcons = {
            worker: 'user',
            'factory-admin': 'building',
            'hr-staff': 'users',
            'grievance-committee': 'scale',
            auditor: 'search',
            'analytics-user': 'bar-chart',
            'super-admin': 'shield'
        };
        this.init();
    }

    init() {
        this.initializeAvatars();
    }

    initializeAvatars() {
        const avatars = document.querySelectorAll('[data-avatar]');
        avatars.forEach(avatar => {
            this.setupAvatar(avatar);
        });
    }

    setupAvatar(element) {
        const options = {
            role: element.dataset.role || 'worker',
            size: element.dataset.size || 'md',
            shape: element.dataset.shape || 'circle',
            status: element.dataset.status || 'offline',
            badge: element.dataset.badge || null,
            interactive: element.dataset.interactive === 'true',
            image: element.dataset.image || null,
            initials: element.dataset.initials || null
        };

        this.createAvatar(element, options);
    }

    createAvatar(element, options) {
        const {
            role,
            size,
            shape,
            status,
            badge,
            interactive,
            image,
            initials
        } = options;

        // Clear existing content
        element.innerHTML = '';

        // Add base classes
        element.className = `avatar avatar-${size} avatar-${role}`;
        
        if (shape !== 'circle') {
            element.classList.add(`avatar-${shape}`);
        }

        if (interactive) {
            element.classList.add('avatar-interactive');
        }

        // Add content
        if (image) {
            element.innerHTML = `<img src="${image}" alt="Avatar" />`;
        } else if (initials) {
            element.innerHTML = `<div class="avatar-initials">${initials}</div>`;
        } else {
            const icon = this.roleIcons[role] || 'user';
            element.innerHTML = `<div class="avatar-icon"><i data-lucide="${icon}"></i></div>`;
        }

        // Add status indicator
        if (status && status !== 'offline') {
            const statusElement = document.createElement('div');
            statusElement.className = `avatar-status ${status}`;
            element.appendChild(statusElement);
        }

        // Add badge
        if (badge) {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'avatar-badge';
            badgeElement.textContent = badge;
            element.appendChild(badgeElement);
        }

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    createAvatarGroup(container, avatars, options = {}) {
        const {
            maxVisible = 5,
            showMore = true,
            moreText = '+{count}'
        } = options;

        container.innerHTML = '';
        container.className = 'avatar-group';

        const visibleAvatars = avatars.slice(0, maxVisible);
        const remainingCount = avatars.length - maxVisible;

        visibleAvatars.forEach(avatar => {
            const avatarElement = document.createElement('div');
            this.createAvatar(avatarElement, avatar);
            container.appendChild(avatarElement);
        });

        if (showMore && remainingCount > 0) {
            const moreElement = document.createElement('div');
            moreElement.className = 'avatar avatar-sm avatar-more';
            moreElement.textContent = moreText.replace('{count}', remainingCount);
            moreElement.title = `${remainingCount} more users`;
            container.appendChild(moreElement);
        }
    }

    updateAvatarStatus(element, status) {
        let statusElement = element.querySelector('.avatar-status');
        
        if (status === 'offline') {
            if (statusElement) {
                statusElement.remove();
            }
        } else {
            if (!statusElement) {
                statusElement = document.createElement('div');
                statusElement.className = 'avatar-status';
                element.appendChild(statusElement);
            }
            statusElement.className = `avatar-status ${status}`;
        }
    }

    updateAvatarBadge(element, badge) {
        let badgeElement = element.querySelector('.avatar-badge');
        
        if (!badge) {
            if (badgeElement) {
                badgeElement.remove();
            }
        } else {
            if (!badgeElement) {
                badgeElement = document.createElement('div');
                badgeElement.className = 'avatar-badge';
                element.appendChild(badgeElement);
            }
            badgeElement.textContent = badge;
        }
    }

    generateInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    createUserAvatar(user, options = {}) {
        const {
            size = 'md',
            shape = 'circle',
            showStatus = true,
            showBadge = false
        } = options;

        const avatar = document.createElement('div');
        avatar.className = `avatar avatar-${size} avatar-${user.role}`;
        
        if (shape !== 'circle') {
            avatar.classList.add(`avatar-${shape}`);
        }

        if (user.image) {
            avatar.innerHTML = `<img src="${user.image}" alt="${user.name}" />`;
        } else {
            const initials = this.generateInitials(user.name);
            avatar.innerHTML = `<div class="avatar-initials">${initials}</div>`;
        }

        if (showStatus && user.status) {
            const statusElement = document.createElement('div');
            statusElement.className = `avatar-status ${user.status}`;
            avatar.appendChild(statusElement);
        }

        if (showBadge && user.badge) {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'avatar-badge';
            badgeElement.textContent = user.badge;
            avatar.appendChild(badgeElement);
        }

        return avatar;
    }

    createRoleAvatar(role, options = {}) {
        const {
            size = 'md',
            shape = 'circle',
            status = 'offline',
            badge = null
        } = options;

        const avatar = document.createElement('div');
        avatar.className = `avatar avatar-${size} avatar-${role}`;
        
        if (shape !== 'circle') {
            avatar.classList.add(`avatar-${shape}`);
        }

        const icon = this.roleIcons[role] || 'user';
        avatar.innerHTML = `<div class="avatar-icon"><i data-lucide="${icon}"></i></div>`;

        if (status !== 'offline') {
            const statusElement = document.createElement('div');
            statusElement.className = `avatar-status ${status}`;
            avatar.appendChild(statusElement);
        }

        if (badge) {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'avatar-badge';
            badgeElement.textContent = badge;
            avatar.appendChild(badgeElement);
        }

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        return avatar;
    }
}

// Initialize avatar manager
document.addEventListener('DOMContentLoaded', () => {
    window.avatarManager = new AvatarManager();
});

// Global access
window.AvatarManager = AvatarManager;
