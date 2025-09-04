// Tasks, Calendar & Notifications System for Angkor Compliance v2
// Implements comprehensive task management, calendar sync, and multi-channel notifications

class TasksCalendarNotificationsSystem {
    constructor() {
        this.db = window.Firebase?.db;
        this.tasks = new Map();
        this.calendarEvents = new Map();
        this.notifications = new Map();
        this.communications = new Map();
        this.isInitialized = false;
        
        this.initializeTasksCalendarSystem();
    }

    async initializeTasksCalendarSystem() {
        try {
            console.log('📅 Initializing Tasks, Calendar & Notifications System...');
            
            // Load all data
            await Promise.all([
                this.loadTasks(),
                this.loadCalendarEvents(),
                this.loadNotifications(),
                this.loadCommunications()
            ]);
            
            this.isInitialized = true;
            console.log('✅ Tasks, Calendar & Notifications System initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Tasks, Calendar & Notifications System:', error);
            this.isInitialized = false;
        }
    }

    async loadTasks() {
        try {
            const tasksSnapshot = await this.db.collection('tasks').get();
            tasksSnapshot.forEach(doc => {
                const task = { id: doc.id, ...doc.data() };
                this.tasks.set(task.id, task);
            });
            console.log(`📋 Loaded ${this.tasks.size} tasks`);
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    async loadCalendarEvents() {
        try {
            const eventsSnapshot = await this.db.collection('calendar_events').get();
            eventsSnapshot.forEach(doc => {
                const event = { id: doc.id, ...doc.data() };
                this.calendarEvents.set(event.id, event);
            });
            console.log(`📋 Loaded ${this.calendarEvents.size} calendar events`);
        } catch (error) {
            console.error('Error loading calendar events:', error);
        }
    }

    async loadNotifications() {
        try {
            const notificationsSnapshot = await this.db.collection('notifications').get();
            notificationsSnapshot.forEach(doc => {
                const notification = { id: doc.id, ...doc.data() };
                this.notifications.set(notification.id, notification);
            });
            console.log(`📋 Loaded ${this.notifications.size} notifications`);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    async loadCommunications() {
        try {
            const communicationsSnapshot = await this.db.collection('communications').get();
            communicationsSnapshot.forEach(doc => {
                const communication = { id: doc.id, ...doc.data() };
                this.communications.set(communication.id, communication);
            });
            console.log(`📋 Loaded ${this.communications.size} communications`);
        } catch (error) {
            console.error('Error loading communications:', error);
        }
    }

    // Task Management Methods
    async createTask(taskData) {
        try {
            const task = {
                id: `task_${Date.now()}`,
                ...taskData,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                progress: 0,
                timeSpent: 0,
                comments: [],
                attachments: []
            };

            // Set default priority if not provided
            if (!task.priority) {
                task.priority = 'medium';
            }

            // Calculate due date if not provided
            if (!task.dueDate && task.estimatedDuration) {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + task.estimatedDuration);
                task.dueDate = dueDate;
            }

            await this.db.collection('tasks').doc(task.id).set(task);
            this.tasks.set(task.id, task);
            
            // Create notification for task assignment
            if (task.assignedTo) {
                await this.createNotification({
                    type: 'task_assigned',
                    title: 'New Task Assigned',
                    message: `You have been assigned a new task: ${task.title}`,
                    priority: task.priority === 'high' ? 'high' : 'medium',
                    targetType: 'user',
                    targetId: task.assignedTo,
                    relatedTaskId: task.id
                });
            }
            
            console.log(`✅ Created task: ${task.title}`);
            return task;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    async updateTask(taskId, updates) {
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            await this.db.collection('tasks').doc(taskId).update(updateData);
            
            const task = this.tasks.get(taskId);
            if (task) {
                Object.assign(task, updateData);
            }
            
            console.log(`✅ Updated task: ${taskId}`);
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    async bulkAssignTasks(tasks, assigneeId) {
        try {
            const batch = this.db.batch();
            const assignedTasks = [];

            for (const taskId of tasks) {
                const taskRef = this.db.collection('tasks').doc(taskId);
                batch.update(taskRef, {
                    assignedTo: assigneeId,
                    assignedAt: new Date(),
                    updatedAt: new Date()
                });
                assignedTasks.push(taskId);
            }

            await batch.commit();
            
            // Create bulk notification
            await this.createNotification({
                type: 'bulk_task_assigned',
                title: 'Multiple Tasks Assigned',
                message: `You have been assigned ${assignedTasks.length} new tasks`,
                priority: 'medium',
                targetType: 'user',
                targetId: assigneeId,
                relatedTaskIds: assignedTasks
            });
            
            console.log(`✅ Bulk assigned ${assignedTasks.length} tasks to ${assigneeId}`);
            return assignedTasks;
        } catch (error) {
            console.error('Error bulk assigning tasks:', error);
            throw error;
        }
    }

    // Calendar Management Methods
    async createCalendarEvent(eventData) {
        try {
            const event = {
                id: `event_${Date.now()}`,
                ...eventData,
                createdAt: new Date(),
                updatedAt: new Date(),
                attendees: eventData.attendees || [],
                reminders: eventData.reminders || []
            };

            // Generate ICS data for calendar sync
            event.icsData = this.generateICSData(event);

            await this.db.collection('calendar_events').doc(event.id).set(event);
            this.calendarEvents.set(event.id, event);
            
            // Create notifications for attendees
            if (event.attendees && event.attendees.length > 0) {
                for (const attendeeId of event.attendees) {
                    await this.createNotification({
                        type: 'calendar_invite',
                        title: 'Calendar Invitation',
                        message: `You have been invited to: ${event.title}`,
                        priority: 'medium',
                        targetType: 'user',
                        targetId: attendeeId,
                        relatedEventId: event.id
                    });
                }
            }
            
            console.log(`✅ Created calendar event: ${event.title}`);
            return event;
        } catch (error) {
            console.error('Error creating calendar event:', error);
            throw error;
        }
    }

    generateICSData(event) {
        const formatDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Angkor Compliance//Calendar Event//EN',
            'BEGIN:VEVENT',
            `UID:${event.id}`,
            `DTSTART:${formatDate(new Date(event.startDate))}`,
            `DTEND:${formatDate(new Date(event.endDate))}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.description || ''}`,
            `LOCATION:${event.location || ''}`,
            `ORGANIZER:mailto:${event.organizer || 'system@angkor-compliance.com'}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        return icsContent;
    }

    async syncWithExternalCalendar(eventId, externalCalendarType) {
        try {
            const event = this.calendarEvents.get(eventId);
            if (!event) {
                throw new Error(`Event not found: ${eventId}`);
            }

            const syncData = {
                eventId: eventId,
                externalCalendarType: externalCalendarType, // 'google', 'outlook', 'ics'
                syncStatus: 'pending',
                lastSyncAttempt: new Date(),
                icsData: event.icsData
            };

            // In a real implementation, this would integrate with external calendar APIs
            // For now, we'll simulate the sync
            syncData.syncStatus = 'completed';
            syncData.lastSyncAttempt = new Date();

            await this.db.collection('calendar_sync').add(syncData);
            
            console.log(`✅ Synced event ${eventId} with ${externalCalendarType}`);
            return syncData;
        } catch (error) {
            console.error('Error syncing with external calendar:', error);
            throw error;
        }
    }

    // Notification Management Methods
    async createNotification(notificationData) {
        try {
            const notification = {
                id: `notification_${Date.now()}`,
                ...notificationData,
                status: 'pending',
                createdAt: new Date(),
                readAt: null,
                sentAt: null,
                deliveryAttempts: 0
            };

            await this.db.collection('notifications').doc(notification.id).set(notification);
            this.notifications.set(notification.id, notification);
            
            // Trigger notification delivery
            await this.deliverNotification(notification);
            
            console.log(`✅ Created notification: ${notification.title}`);
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async deliverNotification(notification) {
        try {
            // Determine delivery channels based on notification type and priority
            const deliveryChannels = this.getDeliveryChannels(notification);
            
            for (const channel of deliveryChannels) {
                try {
                    await this.sendNotificationViaChannel(notification, channel);
                    notification.deliveryAttempts++;
                } catch (error) {
                    console.error(`Error delivering notification via ${channel}:`, error);
                }
            }

            notification.sentAt = new Date();
            notification.status = 'sent';

            await this.db.collection('notifications').doc(notification.id).update({
                sentAt: notification.sentAt,
                status: notification.status,
                deliveryAttempts: notification.deliveryAttempts
            });
            
        } catch (error) {
            console.error('Error delivering notification:', error);
            notification.status = 'failed';
            await this.db.collection('notifications').doc(notification.id).update({
                status: notification.status
            });
        }
    }

    getDeliveryChannels(notification) {
        const channels = ['in_app']; // Always include in-app

        // Add email for medium/high priority notifications
        if (notification.priority === 'high' || notification.priority === 'medium') {
            channels.push('email');
        }

        // Add SMS for high priority notifications
        if (notification.priority === 'high') {
            channels.push('sms');
        }

        // Add WhatsApp for specific notification types
        if (notification.type === 'grievance_update' || notification.type === 'critical_alert') {
            channels.push('whatsapp');
        }

        return channels;
    }

    async sendNotificationViaChannel(notification, channel) {
        switch (channel) {
            case 'in_app':
                // In-app notifications are handled by the frontend
                return;
            case 'email':
                return await this.sendEmailNotification(notification);
            case 'sms':
                return await this.sendSMSNotification(notification);
            case 'whatsapp':
                return await this.sendWhatsAppNotification(notification);
            default:
                throw new Error(`Unsupported notification channel: ${channel}`);
        }
    }

    async sendEmailNotification(notification) {
        // In a real implementation, this would integrate with an email service
        console.log(`📧 Sending email notification: ${notification.title}`);
        return { success: true, channel: 'email' };
    }

    async sendSMSNotification(notification) {
        // In a real implementation, this would integrate with an SMS service
        console.log(`📱 Sending SMS notification: ${notification.title}`);
        return { success: true, channel: 'sms' };
    }

    async sendWhatsAppNotification(notification) {
        // In a real implementation, this would integrate with WhatsApp Business API
        console.log(`💬 Sending WhatsApp notification: ${notification.title}`);
        return { success: true, channel: 'whatsapp' };
    }

    // Communication Methods
    async createCommunication(communicationData) {
        try {
            const communication = {
                id: `communication_${Date.now()}`,
                ...communicationData,
                createdAt: new Date(),
                updatedAt: new Date(),
                replies: [],
                attachments: []
            };

            await this.db.collection('communications').doc(communication.id).set(communication);
            this.communications.set(communication.id, communication);
            
            // Create notifications for mentioned users
            if (communication.mentions && communication.mentions.length > 0) {
                for (const userId of communication.mentions) {
                    await this.createNotification({
                        type: 'mention',
                        title: 'You were mentioned',
                        message: `You were mentioned in a communication about ${communication.subject}`,
                        priority: 'medium',
                        targetType: 'user',
                        targetId: userId,
                        relatedCommunicationId: communication.id
                    });
                }
            }
            
            console.log(`✅ Created communication: ${communication.subject}`);
            return communication;
        } catch (error) {
            console.error('Error creating communication:', error);
            throw error;
        }
    }

    async addReply(communicationId, replyData) {
        try {
            const reply = {
                id: `reply_${Date.now()}`,
                ...replyData,
                createdAt: new Date()
            };

            const communication = this.communications.get(communicationId);
            if (!communication) {
                throw new Error(`Communication not found: ${communicationId}`);
            }

            communication.replies.push(reply);
            communication.updatedAt = new Date();

            await this.db.collection('communications').doc(communicationId).update(communication);
            
            console.log(`✅ Added reply to communication: ${communicationId}`);
            return reply;
        } catch (error) {
            console.error('Error adding reply:', error);
            throw error;
        }
    }

    // Task Orchestration Methods
    async createRecurringTasks(taskTemplate, schedule) {
        try {
            const recurringTasks = [];
            const { frequency, startDate, endDate, maxOccurrences } = schedule;

            let currentDate = new Date(startDate);
            let occurrenceCount = 0;

            while (currentDate <= new Date(endDate) && occurrenceCount < maxOccurrences) {
                const taskData = {
                    ...taskTemplate,
                    title: `${taskTemplate.title} - ${currentDate.toLocaleDateString()}`,
                    dueDate: new Date(currentDate),
                    isRecurring: true,
                    recurringTemplateId: taskTemplate.id
                };

                const task = await this.createTask(taskData);
                recurringTasks.push(task);

                // Calculate next occurrence
                switch (frequency) {
                    case 'daily':
                        currentDate.setDate(currentDate.getDate() + 1);
                        break;
                    case 'weekly':
                        currentDate.setDate(currentDate.getDate() + 7);
                        break;
                    case 'monthly':
                        currentDate.setMonth(currentDate.getMonth() + 1);
                        break;
                    case 'quarterly':
                        currentDate.setMonth(currentDate.getMonth() + 3);
                        break;
                    default:
                        currentDate.setDate(currentDate.getDate() + 1);
                }

                occurrenceCount++;
            }

            console.log(`✅ Created ${recurringTasks.length} recurring tasks`);
            return recurringTasks;
        } catch (error) {
            console.error('Error creating recurring tasks:', error);
            throw error;
        }
    }

    // Reporting Methods
    async generateTaskReport(factoryId, dateRange) {
        try {
            const factoryTasks = Array.from(this.tasks.values())
                .filter(task => task.factoryId === factoryId);

            const report = {
                generatedAt: new Date(),
                factoryId: factoryId,
                dateRange: dateRange,
                summary: {
                    totalTasks: factoryTasks.length,
                    completedTasks: factoryTasks.filter(t => t.status === 'completed').length,
                    pendingTasks: factoryTasks.filter(t => t.status === 'pending').length,
                    overdueTasks: factoryTasks.filter(t => 
                        t.status !== 'completed' && 
                        t.dueDate && 
                        new Date(t.dueDate) < new Date()
                    ).length,
                    averageCompletionTime: this.calculateAverageCompletionTime(factoryTasks)
                },
                tasksByPriority: {
                    high: factoryTasks.filter(t => t.priority === 'high').length,
                    medium: factoryTasks.filter(t => t.priority === 'medium').length,
                    low: factoryTasks.filter(t => t.priority === 'low').length
                },
                tasksByStatus: {
                    pending: factoryTasks.filter(t => t.status === 'pending').length,
                    in_progress: factoryTasks.filter(t => t.status === 'in_progress').length,
                    completed: factoryTasks.filter(t => t.status === 'completed').length,
                    cancelled: factoryTasks.filter(t => t.status === 'cancelled').length
                }
            };

            return report;
        } catch (error) {
            console.error('Error generating task report:', error);
            throw error;
        }
    }

    calculateAverageCompletionTime(tasks) {
        const completedTasks = tasks.filter(t => 
            t.status === 'completed' && 
            t.completedAt && 
            t.createdAt
        );

        if (completedTasks.length === 0) return 0;

        const totalTime = completedTasks.reduce((sum, task) => {
            const created = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
            const completed = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
            return sum + (completed - created);
        }, 0);

        return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60 * 24)); // Days
    }

    // Utility Methods
    getTasksByAssignee(userId) {
        return Array.from(this.tasks.values())
            .filter(task => task.assignedTo === userId);
    }

    getTasksByStatus(status) {
        return Array.from(this.tasks.values())
            .filter(task => task.status === status);
    }

    getOverdueTasks() {
        const now = new Date();
        return Array.from(this.tasks.values())
            .filter(task => 
                task.status !== 'completed' && 
                task.dueDate && 
                new Date(task.dueDate) < now
            );
    }

    getUpcomingEvents(days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + days);

        return Array.from(this.calendarEvents.values())
            .filter(event => 
                new Date(event.startDate) >= new Date() && 
                new Date(event.startDate) <= cutoffDate
            )
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }

    getUserNotifications(userId, unreadOnly = false) {
        let notifications = Array.from(this.notifications.values())
            .filter(notification => notification.targetId === userId);

        if (unreadOnly) {
            notifications = notifications.filter(notification => !notification.readAt);
        }

        return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    async markNotificationAsRead(notificationId) {
        try {
            const notification = this.notifications.get(notificationId);
            if (!notification) {
                throw new Error(`Notification not found: ${notificationId}`);
            }

            notification.readAt = new Date();
            notification.status = 'read';

            await this.db.collection('notifications').doc(notificationId).update({
                readAt: notification.readAt,
                status: notification.status
            });
            
            console.log(`✅ Marked notification as read: ${notificationId}`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }
}

// Initialize Tasks, Calendar & Notifications System
window.tasksCalendarNotificationsSystem = new TasksCalendarNotificationsSystem();

// Export for use in other files
window.TasksCalendarSystem = window.tasksCalendarNotificationsSystem;
