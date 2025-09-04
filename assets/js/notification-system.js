// Advanced Real-time Notification System
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.subscribers = new Set();
        this.websocket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.notificationTypes = {
            'document_expiring': { priority: 'high', icon: 'clock', color: 'warning' },
            'cap_overdue': { priority: 'critical', icon: 'alert-triangle', color: 'danger' },
            'new_grievance': { priority: 'medium', icon: 'message-square', color: 'info' },
            'user_registration': { priority: 'low', icon: 'user-plus', color: 'success' },
            'system_alert': { priority: 'high', icon: 'server', color: 'danger' },
            'compliance_update': { priority: 'medium', icon: 'shield-check', color: 'info' },
            'audit_complete': { priority: 'low', icon: 'check-circle', color: 'success' },
            'backup_complete': { priority: 'low', icon: 'database', color: 'success' }
        };
        this.init();
    }

    async init() {
        console.log('🔔 Initializing notification system...');
        
        // Load existing notifications
        await this.loadNotifications();
        
        // Setup real-time listeners
        this.setupRealTimeListeners();
        
        // Initialize WebSocket for real-time updates
        this.initializeWebSocket();
        
        // Setup notification permissions
        this.setupNotificationPermissions();
        
        // Start notification checks
        this.startNotificationChecks();
        
        console.log('✅ Notification system initialized');
    }

    async loadNotifications() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const notificationsSnapshot = await db.collection('notifications')
                .where('userId', '==', user.uid)
                .where('read', '==', false)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            this.notifications = notificationsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }));

            this.updateNotificationBadge();
            this.notifySubscribers();

        } catch (error) {
            console.error('❌ Error loading notifications:', error);
        }
    }

    setupRealTimeListeners() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            // Listen for new notifications
            const unsubscribe = db.collection('notifications')
                .where('userId', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            this.handleNewNotification(change.doc);
                        } else if (change.type === 'modified') {
                            this.handleNotificationUpdate(change.doc);
                        } else if (change.type === 'removed') {
                            this.handleNotificationRemoval(change.doc.id);
                        }
                    });
                });

            // Store unsubscribe function
            this.unsubscribe = unsubscribe;

        } catch (error) {
            console.error('❌ Error setting up real-time listeners:', error);
        }
    }

    initializeWebSocket() {
        try {
            // Initialize WebSocket connection for real-time updates
            this.websocket = new WebSocket('wss://your-websocket-server.com');
            
            this.websocket.onopen = () => {
                console.log('🔌 WebSocket connected');
                this.reconnectAttempts = 0;
            };

            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };

            this.websocket.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.handleWebSocketDisconnect();
            };

            this.websocket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };

        } catch (error) {
            console.error('❌ Error initializing WebSocket:', error);
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'notification':
                this.createNotification(data.notification);
                break;
            case 'system_alert':
                this.createSystemAlert(data.alert);
                break;
            case 'compliance_update':
                this.createComplianceUpdate(data.update);
                break;
            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
    }

    handleWebSocketDisconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            
            setTimeout(() => {
                console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.initializeWebSocket();
            }, delay);
        }
    }

    setupNotificationPermissions() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    startNotificationChecks() {
        // Check for expiring documents every hour
        setInterval(() => {
            this.checkExpiringDocuments();
        }, 60 * 60 * 1000);

        // Check for overdue CAPs every 30 minutes
        setInterval(() => {
            this.checkOverdueCAPs();
        }, 30 * 60 * 1000);

        // Check system health every 5 minutes
        setInterval(() => {
            this.checkSystemHealth();
        }, 5 * 60 * 1000);
    }

    async checkExpiringDocuments() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const now = new Date();
            const warningDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now

            const expiringDocs = await db.collection('documents')
                .where('expirationDate', '<=', warningDate)
                .where('expirationDate', '>', now)
                .get();

            expiringDocs.forEach(doc => {
                const docData = doc.data();
                const daysUntilExpiration = Math.ceil((docData.expirationDate.toDate() - now) / (1000 * 60 * 60 * 24));

                this.createNotification({
                    type: 'document_expiring',
                    title: 'Document Expiring Soon',
                    message: `${docData.title || docData.originalName} expires in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? '' : 's'}`,
                    data: {
                        documentId: doc.id,
                        documentTitle: docData.title || docData.originalName,
                        daysUntilExpiration: daysUntilExpiration
                    },
                    priority: daysUntilExpiration <= 3 ? 'critical' : 'high'
                });
            });

        } catch (error) {
            console.error('❌ Error checking expiring documents:', error);
        }
    }

    async checkOverdueCAPs() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const now = new Date();

            const overdueCAPs = await db.collection('caps')
                .where('dueDate', '<', now)
                .where('status', 'in', ['pending', 'in-progress'])
                .get();

            overdueCAPs.forEach(doc => {
                const capData = doc.data();
                const daysOverdue = Math.ceil((now - capData.dueDate.toDate()) / (1000 * 60 * 60 * 24));

                this.createNotification({
                    type: 'cap_overdue',
                    title: 'CAP Overdue',
                    message: `${capData.title} is ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`,
                    data: {
                        capId: doc.id,
                        capTitle: capData.title,
                        daysOverdue: daysOverdue
                    },
                    priority: 'critical'
                });
            });

        } catch (error) {
            console.error('❌ Error checking overdue CAPs:', error);
        }
    }

    async checkSystemHealth() {
        try {
            // Check Firebase connection
            const healthCheck = await this.performHealthCheck();
            
            if (!healthCheck.healthy) {
                this.createNotification({
                    type: 'system_alert',
                    title: 'System Health Alert',
                    message: `System health check failed: ${healthCheck.issues.join(', ')}`,
                    data: {
                        healthCheck: healthCheck
                    },
                    priority: 'high'
                });
            }

        } catch (error) {
            console.error('❌ Error checking system health:', error);
        }
    }

    async performHealthCheck() {
        const issues = [];
        
        try {
            // Test Firestore connection
            await db.collection('system_health').limit(1).get();
        } catch (error) {
            issues.push('Database connection');
        }

        try {
            // Test Authentication
            const user = auth.currentUser;
            if (!user) {
                issues.push('Authentication');
            }
        } catch (error) {
            issues.push('Authentication');
        }

        return {
            healthy: issues.length === 0,
            issues: issues,
            timestamp: new Date()
        };
    }

    async createNotification(notificationData) {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const notification = {
                userId: user.uid,
                type: notificationData.type,
                title: notificationData.title,
                message: notificationData.message,
                data: notificationData.data || {},
                priority: notificationData.priority || 'medium',
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                expiresAt: notificationData.expiresAt || null
            };

            // Save to Firestore
            const docRef = await db.collection('notifications').add(notification);
            notification.id = docRef.id;

            // Add to local array
            this.notifications.unshift(notification);

            // Update UI
            this.updateNotificationBadge();
            this.showToastNotification(notification);
            this.notifySubscribers();

            // Show browser notification if permitted
            this.showBrowserNotification(notification);

            // Log audit entry
            await this.logAuditEntry('notification_created', {
                notificationId: docRef.id,
                type: notification.type,
                title: notification.title
            });

            return notification;

        } catch (error) {
            console.error('❌ Error creating notification:', error);
        }
    }

    showToastNotification(notification) {
        const toast = document.createElement('div');
        toast.className = `notification-toast ${notification.priority}`;
        
        const typeInfo = this.notificationTypes[notification.type] || { icon: 'bell', color: 'info' };
        
        toast.innerHTML = `
            <div class="toast-header">
                <i data-lucide="${typeInfo.icon}"></i>
                <span class="toast-title">${notification.title}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="toast-message">${notification.message}</div>
            <div class="toast-time">${this.formatTimeAgo(notification.createdAt)}</div>
        `;

        // Add to notification container
        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(toast);

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    showBrowserNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const typeInfo = this.notificationTypes[notification.type] || { icon: 'bell' };
            
            new Notification(notification.title, {
                body: notification.message,
                icon: `/assets/icons/${typeInfo.icon}.svg`,
                badge: '/favicon.png',
                tag: notification.id,
                requireInteraction: notification.priority === 'critical'
            });
        }
    }

    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notificationBadge');
        
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }

        // Update page title if there are unread notifications
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) Angkor Compliance Platform`;
        } else {
            document.title = 'Angkor Compliance Platform';
        }
    }

    async markAsRead(notificationId) {
        try {
            await db.collection('notifications').doc(notificationId).update({
                read: true,
                readAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update local array
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                notification.readAt = new Date();
            }

            this.updateNotificationBadge();
            this.notifySubscribers();

        } catch (error) {
            console.error('❌ Error marking notification as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const batch = db.batch();
            const unreadNotifications = this.notifications.filter(n => !n.read);

            unreadNotifications.forEach(notification => {
                const docRef = db.collection('notifications').doc(notification.id);
                batch.update(docRef, {
                    read: true,
                    readAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            await batch.commit();

            // Update local array
            this.notifications.forEach(n => {
                n.read = true;
                n.readAt = new Date();
            });

            this.updateNotificationBadge();
            this.notifySubscribers();

        } catch (error) {
            console.error('❌ Error marking all notifications as read:', error);
        }
    }

    async deleteNotification(notificationId) {
        try {
            await db.collection('notifications').doc(notificationId).delete();

            // Remove from local array
            this.notifications = this.notifications.filter(n => n.id !== notificationId);

            this.updateNotificationBadge();
            this.notifySubscribers();

        } catch (error) {
            console.error('❌ Error deleting notification:', error);
        }
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notifySubscribers() {
        this.subscribers.forEach(callback => {
            try {
                callback(this.notifications);
            } catch (error) {
                console.error('❌ Error in notification subscriber:', error);
            }
        });
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    async logAuditEntry(action, data) {
        try {
            const user = auth.currentUser;
            if (!user) return;

            await db.collection('audit_log').add({
                action: action,
                userId: user.uid,
                userName: user.displayName || user.email,
                data: data,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ipAddress: await this.getClientIP(),
                userAgent: navigator.userAgent
            });

        } catch (error) {
            console.error('❌ Error logging audit entry:', error);
        }
    }

    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'Unknown';
        }
    }

    handleNewNotification(doc) {
        const notification = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        };

        this.notifications.unshift(notification);
        this.updateNotificationBadge();
        this.showToastNotification(notification);
        this.notifySubscribers();
    }

    handleNotificationUpdate(doc) {
        const notification = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        };

        const index = this.notifications.findIndex(n => n.id === doc.id);
        if (index !== -1) {
            this.notifications[index] = notification;
        }

        this.updateNotificationBadge();
        this.notifySubscribers();
    }

    handleNotificationRemoval(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationBadge();
        this.notifySubscribers();
    }

    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        if (this.websocket) {
            this.websocket.close();
        }
        this.subscribers.clear();
    }
}

// Initialize notification system
let notificationSystem;

document.addEventListener('DOMContentLoaded', function() {
    notificationSystem = new NotificationSystem();
});

// Global functions for HTML onclick handlers
window.markNotificationAsRead = (notificationId) => {
    if (notificationSystem) {
        notificationSystem.markAsRead(notificationId);
    }
};

window.markAllNotificationsAsRead = () => {
    if (notificationSystem) {
        notificationSystem.markAllAsRead();
    }
};

window.deleteNotification = (notificationId) => {
    if (notificationSystem) {
        notificationSystem.deleteNotification(notificationId);
    }
};

window.toggleNotifications = () => {
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
};
