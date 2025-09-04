// Enhanced Real-time Notification System with Advanced Features
class EnhancedNotificationSystem {
    constructor() {
        this.notifications = [];
        this.priorityQueue = [];
        this.subscribers = new Map();
        this.websocket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isInitialized = false;
        this.notificationTypes = this.initializeNotificationTypes();
        this.userPreferences = {};
        this.quietHours = { start: 22, end: 8 }; // 10 PM to 8 AM
        this.init();
    }

    async init() {
        console.log('🔔 Initializing Enhanced Notification System...');
        
        try {
            // Load user preferences
            await this.loadUserPreferences();
            
            // Initialize WebSocket connection
            this.initializeWebSocket();
            
            // Setup Firestore real-time listeners
            await this.setupFirestoreListeners();
            
            // Initialize UI components
            this.initializeUI();
            
            // Start notification checks
            this.startNotificationChecks();
            
            // Setup periodic health checks
            this.setupHealthChecks();
            
            this.isInitialized = true;
            console.log('✅ Enhanced Notification System initialized');
            
        } catch (error) {
            console.error('❌ Error initializing notification system:', error);
        }
    }

    initializeNotificationTypes() {
        return {
            // System Notifications
            system_alert: {
                priority: 'critical',
                icon: 'alert-triangle',
                color: '#EF4444',
                sound: 'alert.mp3',
                ttl: 0, // No expiration
                requiresAction: true
            },
            system_maintenance: {
                priority: 'high',
                icon: 'wrench',
                color: '#F59E0B',
                sound: 'warning.mp3',
                ttl: 86400000, // 24 hours
                requiresAction: false
            },
            
            // User Management
            user_registered: {
                priority: 'medium',
                icon: 'user-plus',
                color: '#10B981',
                sound: 'success.mp3',
                ttl: 3600000, // 1 hour
                requiresAction: false
            },
            user_deactivated: {
                priority: 'high',
                icon: 'user-minus',
                color: '#EF4444',
                sound: 'warning.mp3',
                ttl: 7200000, // 2 hours
                requiresAction: true
            },
            
            // Document Management
            document_expiring: {
                priority: 'high',
                icon: 'clock',
                color: '#F59E0B',
                sound: 'warning.mp3',
                ttl: 86400000, // 24 hours
                requiresAction: true
            },
            document_uploaded: {
                priority: 'medium',
                icon: 'upload',
                color: '#3B82F6',
                sound: 'success.mp3',
                ttl: 1800000, // 30 minutes
                requiresAction: false
            },
            document_approved: {
                priority: 'medium',
                icon: 'check-circle',
                color: '#10B981',
                sound: 'success.mp3',
                ttl: 1800000, // 30 minutes
                requiresAction: false
            },
            document_rejected: {
                priority: 'high',
                icon: 'x-circle',
                color: '#EF4444',
                sound: 'error.mp3',
                ttl: 3600000, // 1 hour
                requiresAction: true
            },
            
            // CAP Management
            cap_created: {
                priority: 'high',
                icon: 'clipboard-list',
                color: '#8B5CF6',
                sound: 'notification.mp3',
                ttl: 7200000, // 2 hours
                requiresAction: true
            },
            cap_overdue: {
                priority: 'critical',
                icon: 'alert-triangle',
                color: '#EF4444',
                sound: 'alert.mp3',
                ttl: 0, // No expiration
                requiresAction: true
            },
            cap_completed: {
                priority: 'medium',
                icon: 'check-circle',
                color: '#10B981',
                sound: 'success.mp3',
                ttl: 3600000, // 1 hour
                requiresAction: false
            },
            
            // Compliance & Audit
            compliance_breach: {
                priority: 'critical',
                icon: 'shield-x',
                color: '#EF4444',
                sound: 'alert.mp3',
                ttl: 0, // No expiration
                requiresAction: true
            },
            audit_scheduled: {
                priority: 'medium',
                icon: 'calendar',
                color: '#3B82F6',
                sound: 'notification.mp3',
                ttl: 86400000, // 24 hours
                requiresAction: false
            },
            audit_completed: {
                priority: 'medium',
                icon: 'file-check',
                color: '#10B981',
                sound: 'success.mp3',
                ttl: 7200000, // 2 hours
                requiresAction: false
            },
            
            // Grievance Management
            grievance_submitted: {
                priority: 'high',
                icon: 'message-square',
                color: '#F59E0B',
                sound: 'warning.mp3',
                ttl: 3600000, // 1 hour
                requiresAction: true
            },
            grievance_resolved: {
                priority: 'medium',
                icon: 'check-circle',
                color: '#10B981',
                sound: 'success.mp3',
                ttl: 3600000, // 1 hour
                requiresAction: false
            },
            
            // Training & Development
            training_reminder: {
                priority: 'medium',
                icon: 'graduation-cap',
                color: '#3B82F6',
                sound: 'notification.mp3',
                ttl: 86400000, // 24 hours
                requiresAction: false
            },
            training_completed: {
                priority: 'low',
                icon: 'award',
                color: '#10B981',
                sound: 'success.mp3',
                ttl: 1800000, // 30 minutes
                requiresAction: false
            },
            
            // Factory Management
            factory_registered: {
                priority: 'medium',
                icon: 'building',
                color: '#3B82F6',
                sound: 'notification.mp3',
                ttl: 7200000, // 2 hours
                requiresAction: false
            },
            factory_status_changed: {
                priority: 'high',
                icon: 'activity',
                color: '#F59E0B',
                sound: 'warning.mp3',
                ttl: 3600000, // 1 hour
                requiresAction: true
            }
        };
    }

    async loadUserPreferences() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const preferencesDoc = await collection(db, 'user_preferences')
                .doc(user.uid)
                .get();

            if (preferencesDoc.exists()) {
                this.userPreferences = preferencesDoc.data().notifications || {};
            } else {
                // Set default preferences
                this.userPreferences = {
                    enabled: true,
                    sound: true,
                    desktop: true,
                    email: false,
                    quietHours: true,
                    types: Object.keys(this.notificationTypes).reduce((acc, type) => {
                        acc[type] = true;
                        return acc;
                    }, {})
                };
                
                // Save default preferences
                await collection(db, 'user_preferences', user.uid, {
                    notifications: this.userPreferences,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

        } catch (error) {
            console.error('❌ Error loading user preferences:', error);
        }
    }

    initializeWebSocket() {
        try {
            // Initialize WebSocket connection for real-time updates
            this.websocket = new WebSocket('wss://your-websocket-server.com');
            
            this.websocket.onopen = () => {
                console.log('🔌 WebSocket connected');
                this.reconnectAttempts = 0;
                this.authenticateWebSocket();
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

    async authenticateWebSocket() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            this.websocket.send(JSON.stringify({
                type: 'authentication',
                token: token,
                userId: user.uid
            }));

        } catch (error) {
            console.error('❌ Error authenticating WebSocket:', error);
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'notification':
                this.handleRealTimeNotification(data.notification);
                break;
            case 'system_alert':
                this.handleSystemAlert(data.alert);
                break;
            case 'user_update':
                this.handleUserUpdate(data.update);
                break;
            case 'ping':
                this.handlePing(data);
                break;
            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
    }

    handleWebSocketDisconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            
            console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
            
            setTimeout(() => {
                this.initializeWebSocket();
            }, delay);
        } else {
            console.error('❌ Max reconnection attempts reached');
        }
    }

    async setupFirestoreListeners() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            // Listen for user-specific notifications
            const notificationsRef = collection(db, 'notifications');
            const userNotificationsQuery = query(
                notificationsRef,
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(50)
            );

            onSnapshot(userNotificationsQuery, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        this.handleNewNotification(change.doc);
                    } else if (change.type === 'modified') {
                        this.handleNotificationUpdate(change.doc);
                    } else if (change.type === 'removed') {
                        this.handleNotificationRemoval(change.doc);
                    }
                });
            });

            // Listen for system-wide notifications
            const systemNotificationsQuery = query(
                notificationsRef,
                where('type', '==', 'system_alert'),
                orderBy('createdAt', 'desc'),
                limit(10)
            );

            onSnapshot(systemNotificationsQuery, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        this.handleSystemNotification(change.doc);
                    }
                });
            });

        } catch (error) {
            console.error('❌ Error setting up Firestore listeners:', error);
        }
    }

    initializeUI() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notificationContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        // Create notification bell if it doesn't exist
        if (!document.getElementById('notificationBell')) {
            this.createNotificationBell();
        }

        // Create notification panel if it doesn't exist
        if (!document.getElementById('notificationPanel')) {
            this.createNotificationPanel();
        }
    }

    createNotificationBell() {
        const bell = document.createElement('div');
        bell.id = 'notificationBell';
        bell.className = 'notification-bell';
        bell.innerHTML = `
            <button class="notification-toggle" onclick="toggleNotificationPanel()">
                <i data-lucide="bell"></i>
                <span class="notification-badge" id="notificationBadge">0</span>
            </button>
        `;

        // Insert into header
        const header = document.querySelector('.header-right');
        if (header) {
            header.insertBefore(bell, header.firstChild);
        }

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    createNotificationPanel() {
        const panel = document.createElement('div');
        panel.id = 'notificationPanel';
        panel.className = 'notification-dropdown';
        panel.innerHTML = `
            <div class="notification-panel-header">
                <h3>Notifications</h3>
                <div class="notification-actions">
                    <button onclick="markAllNotificationsAsRead()" class="btn btn-sm btn-outline">
                        <i data-lucide="check-double"></i>
                        Mark All Read
                    </button>
                </div>
            </div>
            <div class="notification-list" id="notificationList">
                <div class="notification-empty">
                    <i data-lucide="bell-off"></i>
                    <p>No notifications</p>
                </div>
            </div>
            <div class="notification-panel-footer">
                <button onclick="openNotificationSettings()" class="btn btn-sm btn-outline">
                    <i data-lucide="settings"></i>
                    Settings
                </button>
            </div>
        `;

        document.body.appendChild(panel);

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    startNotificationChecks() {
        // Check for document expiry every hour
        setInterval(() => {
            this.checkDocumentExpiry();
        }, 3600000);

        // Check for CAP overdue every 30 minutes
        setInterval(() => {
            this.checkCAPOverdue();
        }, 1800000);

        // Check system health every 5 minutes
        setInterval(() => {
            this.checkSystemHealth();
        }, 300000);
    }

    setupHealthChecks() {
        // Monitor WebSocket connection health
        setInterval(() => {
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000); // Every 30 seconds

        // Monitor notification system health
        setInterval(() => {
            this.checkNotificationSystemHealth();
        }, 60000); // Every minute
    }

    async checkDocumentExpiry() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const documentsRef = collection(db, 'documents');
            const expiryQuery = query(
                documentsRef,
                where('expiryDate', '<=', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days from now
                where('expiryDate', '>', new Date()),
                where('status', '==', 'active')
            );

            const snapshot = await getDocs(expiryQuery);
            
            snapshot.docs.forEach(doc => {
                const document = doc.data();
                const daysUntilExpiry = Math.ceil((document.expiryDate.toDate() - new Date()) / (1000 * 60 * 60 * 24));
                
                this.createNotification('document_expiring', {
                    title: 'Document Expiring Soon',
                    message: `${document.name} expires in ${daysUntilExpiry} days`,
                    documentId: doc.id,
                    documentName: document.name,
                    daysUntilExpiry: daysUntilExpiry
                });
            });

        } catch (error) {
            console.error('❌ Error checking document expiry:', error);
        }
    }

    async checkCAPOverdue() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const capsRef = collection(db, 'caps');
            const overdueQuery = query(
                capsRef,
                where('dueDate', '<', new Date()),
                where('status', 'in', ['pending', 'in_progress'])
            );

            const snapshot = await getDocs(overdueQuery);
            
            snapshot.docs.forEach(doc => {
                const cap = doc.data();
                const daysOverdue = Math.ceil((new Date() - cap.dueDate.toDate()) / (1000 * 60 * 60 * 24));
                
                this.createNotification('cap_overdue', {
                    title: 'CAP Overdue',
                    message: `${cap.title} is ${daysOverdue} days overdue`,
                    capId: doc.id,
                    capTitle: cap.title,
                    daysOverdue: daysOverdue
                });
            });

        } catch (error) {
            console.error('❌ Error checking CAP overdue:', error);
        }
    }

    async checkSystemHealth() {
        try {
            // Check Firebase connection
            const isConnected = await this.checkFirebaseConnection();
            
            if (!isConnected) {
                this.createNotification('system_alert', {
                    title: 'System Connection Issue',
                    message: 'Connection to database is unstable',
                    severity: 'warning'
                });
            }

            // Check storage availability
            const storageAvailable = await this.checkStorageAvailability();
            
            if (!storageAvailable) {
                this.createNotification('system_alert', {
                    title: 'Storage Issue',
                    message: 'File storage service is experiencing issues',
                    severity: 'critical'
                });
            }

        } catch (error) {
            console.error('❌ Error checking system health:', error);
        }
    }

    async checkFirebaseConnection() {
        try {
            const testDoc = await collection(db, 'system_health', 'connection_test');
            return testDoc.exists();
        } catch (error) {
            return false;
        }
    }

    async checkStorageAvailability() {
        try {
            const testRef = storageRef(storage, 'health-check/test.txt');
            await uploadBytes(testRef, 'test');
            await deleteObject(testRef);
            return true;
        } catch (error) {
            return false;
        }
    }

    checkNotificationSystemHealth() {
        const healthMetrics = {
            totalNotifications: this.notifications.length,
            unreadNotifications: this.notifications.filter(n => !n.read).length,
            websocketStatus: this.websocket?.readyState === WebSocket.OPEN,
            lastNotificationTime: this.notifications[0]?.createdAt || null
        };

        console.log('🔍 Notification System Health:', healthMetrics);
        
        // Log health metrics to Firestore
        this.logHealthMetrics(healthMetrics);
    }

    async logHealthMetrics(metrics) {
        try {
            const user = auth.currentUser;
            if (!user) return;

            await collection(db, 'system_health', 'notification_system', {
                userId: user.uid,
                metrics: metrics,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

        } catch (error) {
            console.error('❌ Error logging health metrics:', error);
        }
    }

    // Notification creation and management
    async createNotification(type, data) {
        try {
            // Check if notification type is enabled for user
            if (!this.userPreferences.types?.[type]) {
                return;
            }

            // Check quiet hours
            if (this.userPreferences.quietHours && this.isInQuietHours()) {
                // Only show critical notifications during quiet hours
                const notificationType = this.notificationTypes[type];
                if (notificationType.priority !== 'critical') {
                    return;
                }
            }

            const notification = {
                id: this.generateId(),
                type: type,
                title: data.title,
                message: data.message,
                data: data,
                priority: this.notificationTypes[type]?.priority || 'medium',
                createdAt: new Date(),
                read: false,
                userId: auth.currentUser?.uid,
                factoryId: data.factoryId || null
            };

            // Save to Firestore
            await collection(db, 'notifications', {
                ...notification,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Add to local array
            this.notifications.unshift(notification);

            // Add to priority queue
            this.addToPriorityQueue(notification);

            // Show notification
            this.showNotification(notification);

            // Update UI
            this.updateNotificationUI();

            // Log audit entry
            await this.logAuditEntry('notification_created', {
                notificationId: notification.id,
                type: type,
                title: data.title
            });

            return notification;

        } catch (error) {
            console.error('❌ Error creating notification:', error);
        }
    }

    addToPriorityQueue(notification) {
        this.priorityQueue.push(notification);
        this.priorityQueue.sort((a, b) => {
            const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        // Limit queue size
        if (this.priorityQueue.length > 100) {
            this.priorityQueue = this.priorityQueue.slice(0, 100);
        }
    }

    showNotification(notification) {
        // Show toast notification
        this.showToastNotification(notification);

        // Show browser notification if enabled
        if (this.userPreferences.desktop) {
            this.showBrowserNotification(notification);
        }

        // Play sound if enabled
        if (this.userPreferences.sound) {
            this.playNotificationSound(notification.type);
        }
    }

    showToastNotification(notification) {
        const notificationType = this.notificationTypes[notification.type];
        const toast = document.createElement('div');
        toast.className = `notification-toast ${notification.priority}`;
        toast.innerHTML = `
            <div class="toast-header">
                <i data-lucide="${notificationType?.icon || 'bell'}"></i>
                <span class="toast-title">${notification.title}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="toast-message">${notification.message}</div>
            <div class="toast-time">${this.formatTime(notification.createdAt)}</div>
        `;

        const container = document.getElementById('notificationContainer');
        if (container) {
            container.appendChild(toast);

            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            // Auto-remove after TTL
            const ttl = notificationType?.ttl || 5000;
            if (ttl > 0) {
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, ttl);
            }
        }
    }

    async showBrowserNotification(notification) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            const notificationType = this.notificationTypes[notification.type];
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.png',
                badge: '/favicon.png',
                tag: notification.id,
                requireInteraction: notificationType?.requiresAction || false
            });
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showBrowserNotification(notification);
            }
        }
    }

    playNotificationSound(type) {
        const notificationType = this.notificationTypes[type];
        const soundFile = notificationType?.sound || 'notification.mp3';
        
        try {
            const audio = new Audio(`/assets/sounds/${soundFile}`);
            audio.volume = 0.5;
            audio.play().catch(error => {
                console.error('❌ Error playing notification sound:', error);
            });
        } catch (error) {
            console.error('❌ Error creating audio element:', error);
        }
    }

    updateNotificationUI() {
        // Update badge count
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            const unreadCount = this.notifications.filter(n => !n.read).length;
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }

        // Update notification list
        this.updateNotificationList();

        // Update page title
        this.updatePageTitle();
    }

    updateNotificationList() {
        const list = document.getElementById('notificationList');
        if (!list) return;

        const unreadNotifications = this.notifications.filter(n => !n.read);
        
        if (unreadNotifications.length === 0) {
            list.innerHTML = `
                <div class="notification-empty">
                    <i data-lucide="bell-off"></i>
                    <p>No notifications</p>
                </div>
            `;
        } else {
            list.innerHTML = unreadNotifications.slice(0, 10).map(notification => {
                const notificationType = this.notificationTypes[notification.type];
                return `
                    <div class="notification-item ${notification.read ? 'read' : 'unread'}" 
                         onclick="markNotificationAsRead('${notification.id}')">
                        <div class="notification-icon ${notification.priority}">
                            <i data-lucide="${notificationType?.icon || 'bell'}"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-content-title">${notification.title}</div>
                            <div class="notification-content-message">${notification.message}</div>
                            <div class="notification-content-time">${this.formatTime(notification.createdAt)}</div>
                        </div>
                        <div class="notification-indicator"></div>
                    </div>
                `;
            }).join('');
        }

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    updatePageTitle() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const originalTitle = document.title.replace(/^\(\d+\)\s*/, '');
        
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) ${originalTitle}`;
        } else {
            document.title = originalTitle;
        }
    }

    // Event handlers
    handleNewNotification(doc) {
        const notification = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        };

        this.notifications.unshift(notification);
        this.addToPriorityQueue(notification);
        this.showNotification(notification);
        this.updateNotificationUI();
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
            this.updateNotificationUI();
        }
    }

    handleNotificationRemoval(doc) {
        this.notifications = this.notifications.filter(n => n.id !== doc.id);
        this.priorityQueue = this.priorityQueue.filter(n => n.id !== doc.id);
        this.updateNotificationUI();
    }

    handleRealTimeNotification(notification) {
        this.createNotification(notification.type, notification.data);
    }

    handleSystemAlert(alert) {
        this.createNotification('system_alert', {
            title: alert.title,
            message: alert.message,
            severity: alert.severity
        });
    }

    handleUserUpdate(update) {
        // Handle user-related updates
        console.log('User update received:', update);
    }

    handlePing(data) {
        // Handle ping/pong for connection health
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    isInQuietHours() {
        const now = new Date();
        const hour = now.getHours();
        return hour >= this.quietHours.start || hour < this.quietHours.end;
    }

    async logAuditEntry(action, data) {
        try {
            const user = auth.currentUser;
            if (!user) return;

            await collection(db, 'audit_log', {
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

    // Public API methods
    async markAsRead(notificationId) {
        try {
            const notification = this.notifications.find(n => n.id === notificationId);
            if (!notification) return;

            notification.read = true;

            // Update in Firestore
            await collection(db, 'notifications', notificationId, {
                read: true,
                readAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.updateNotificationUI();

        } catch (error) {
            console.error('❌ Error marking notification as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const unreadNotifications = this.notifications.filter(n => !n.read);
            
            // Update all unread notifications
            const batch = writeBatch(db);
            unreadNotifications.forEach(notification => {
                const docRef = collection(db, 'notifications', notification.id);
                batch.update(docRef, {
                    read: true,
                    readAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                notification.read = true;
            });

            await batch.commit();
            this.updateNotificationUI();

        } catch (error) {
            console.error('❌ Error marking all notifications as read:', error);
        }
    }

    async deleteNotification(notificationId) {
        try {
            // Remove from Firestore
            await collection(db, 'notifications', notificationId);

            // Remove from local arrays
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
            this.priorityQueue = this.priorityQueue.filter(n => n.id !== notificationId);

            this.updateNotificationUI();

        } catch (error) {
            console.error('❌ Error deleting notification:', error);
        }
    }

    subscribe(type, callback) {
        if (!this.subscribers.has(type)) {
            this.subscribers.set(type, new Set());
        }
        this.subscribers.get(type, callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(type);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    unsubscribe(type, callback) {
        const callbacks = this.subscribers.get(type);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }

    // Settings management
    async updateUserPreferences(preferences) {
        try {
            const user = auth.currentUser;
            if (!user) return;

            this.userPreferences = { ...this.userPreferences, ...preferences };

            await collection(db, 'user_preferences', user.uid, {
                notifications: this.userPreferences,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        } catch (error) {
            console.error('❌ Error updating user preferences:', error);
        }
    }

    getNotifications() {
        return this.notifications;
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    isInitialized() {
        return this.isInitialized;
    }
}

// Initialize Enhanced Notification System
let enhancedNotificationSystem;

// Wait for Firebase to be available before initializing
function initializeEnhancednotificationsystem() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeEnhancednotificationsystem, 100);
        return;
    }

    // Get Firebase instances and functions from the global Firebase object
    const { auth, db } = window.Firebase;
    const {
        doc,
        getDoc,
        setDoc,
        updateDoc,
        deleteDoc,
        collection,
        query,
        where,
        orderBy,
        limit,
        onSnapshot,
        getDocs,
        addDoc,
        serverTimestamp,
        writeBatch
    } = window.Firebase;

document.addEventListener('DOMContentLoaded', function() {
    enhancedNotificationSystem = new EnhancedNotificationSystem();
});

// Global functions for HTML onclick handlers
window.toggleNotificationPanel = () => {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('open');
    }
};

window.markNotificationAsRead = (notificationId) => {
    if (enhancedNotificationSystem) {
        enhancedNotificationSystem.markAsRead(notificationId);
    }
};

window.markAllNotificationsAsRead = () => {
    if (enhancedNotificationSystem) {
        enhancedNotificationSystem.markAllAsRead();
    }
};

window.deleteNotification = (notificationId) => {
    if (enhancedNotificationSystem) {
        enhancedNotificationSystem.deleteNotification(notificationId);
    }
};

window.openNotificationSettings = () => {
    // Open notification settings modal or navigate to settings page
    console.log('Opening notification settings...');
};

// Export for use in other modules
window.EnhancedNotificationSystem = EnhancedNotificationSystem;

// Start the initialization process
initializeEnhancednotificationsystem();
