/**
 * Calendar Management System - Phase 3
 * Implements factory & personal views, ICS sync, holiday awareness, and calendar event management
 * Based on Enterprise Blueprint (v2) Section D.9
 */

class CalendarManagementSystem {
    constructor() {
        this.db = window.Firebase.db;
        this.currentUser = null;
        this.currentFactory = null;
        this.holidays = [];
        this.timezone = 'Asia/Phnom_Penh';
    }

    async initialize(user, factoryId) {
        this.currentUser = user;
        this.currentFactory = factoryId;
        await this.loadHolidays();
        console.log('✅ Calendar Management System initialized');
    }

    // Holiday Management
    async loadHolidays() {
        try {
            const snapshot = await this.db.collection('holidays')
                .where('country', '==', 'Cambodia')
                .get();
            
            this.holidays = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error loading holidays:', error);
            // Load default Cambodian holidays if database fails
            this.holidays = this.getDefaultHolidays();
        }
    }

    getDefaultHolidays() {
        const currentYear = new Date().getFullYear();
        return [
            { name: 'New Year\'s Day', date: `${currentYear}-01-01`, type: 'public' },
            { name: 'Victory over Genocide Day', date: `${currentYear}-01-07`, type: 'public' },
            { name: 'International Women\'s Day', date: `${currentYear}-03-08`, type: 'public' },
            { name: 'Khmer New Year', date: `${currentYear}-04-14`, type: 'public' },
            { name: 'Khmer New Year', date: `${currentYear}-04-15`, type: 'public' },
            { name: 'Khmer New Year', date: `${currentYear}-04-16`, type: 'public' },
            { name: 'International Labor Day', date: `${currentYear}-05-01`, type: 'public' },
            { name: 'Royal Plowing Ceremony', date: `${currentYear}-05-07`, type: 'public' },
            { name: 'King\'s Birthday', date: `${currentYear}-05-14`, type: 'public' },
            { name: 'Constitution Day', date: `${currentYear}-09-24`, type: 'public' },
            { name: 'King\'s Coronation Day', date: `${currentYear}-10-29`, type: 'public' },
            { name: 'Independence Day', date: `${currentYear}-11-09`, type: 'public' },
            { name: 'Water Festival', date: `${currentYear}-11-13`, type: 'public' },
            { name: 'Water Festival', date: `${currentYear}-11-14`, type: 'public' },
            { name: 'Water Festival', date: `${currentYear}-11-15`, type: 'public' }
        ];
    }

    isHoliday(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.holidays.some(holiday => holiday.date === dateStr);
    }

    getHolidayName(date) {
        const dateStr = date.toISOString().split('T')[0];
        const holiday = this.holidays.find(h => h.date === dateStr);
        return holiday ? holiday.name : null;
    }

    // Calendar Event Management
    async createCalendarEvent(eventData) {
        try {
            const event = {
                id: this.generateId(),
                factoryId: this.currentFactory,
                title: eventData.title,
                description: eventData.description,
                type: eventData.type, // 'audit', 'training', 'meeting', 'maintenance', 'permit_renewal', 'personal'
                category: eventData.category, // 'compliance', 'safety', 'quality', 'maintenance', 'personal'
                startDate: new Date(eventData.startDate),
                endDate: new Date(eventData.endDate),
                allDay: eventData.allDay || false,
                location: eventData.location || '',
                attendees: eventData.attendees || [],
                organizer: this.currentUser.id,
                
                // Recurring settings
                isRecurring: eventData.isRecurring || false,
                recurrencePattern: eventData.recurrencePattern || null, // 'daily', 'weekly', 'monthly', 'yearly'
                recurrenceInterval: eventData.recurrenceInterval || 1,
                recurrenceEndDate: eventData.recurrenceEndDate ? new Date(eventData.recurrenceEndDate) : null,
                
                // Reminders
                reminders: eventData.reminders || [
                    { type: 'email', minutes: 60 },
                    { type: 'notification', minutes: 30 }
                ],
                
                // Linked entities
                linkedTask: eventData.linkedTask || null,
                linkedCAP: eventData.linkedCAP || null,
                linkedAudit: eventData.linkedAudit || null,
                linkedTraining: eventData.linkedTraining || null,
                
                // Status and visibility
                status: 'confirmed', // 'tentative', 'confirmed', 'cancelled'
                visibility: eventData.visibility || 'factory', // 'personal', 'factory', 'public'
                color: eventData.color || this.getDefaultEventColor(eventData.type),
                
                // Metadata
                tags: eventData.tags || [],
                attachments: eventData.attachments || [],
                notes: eventData.notes || '',
                createdBy: this.currentUser.id,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.db.collection('calendar_events').doc(event.id).set(event);
            
            // If recurring, create future instances
            if (event.isRecurring && event.recurrencePattern) {
                await this.createRecurringEventInstances(event);
            }

            return { success: true, eventId: event.id };
        } catch (error) {
            console.error('Error creating calendar event:', error);
            throw error;
        }
    }

    async createRecurringEventInstances(parentEvent) {
        try {
            if (!parentEvent.recurrenceEndDate) return;

            const instances = [];
            let currentDate = new Date(parentEvent.startDate);
            const endDate = new Date(parentEvent.recurrenceEndDate);

            while (currentDate <= endDate) {
                const instance = {
                    ...parentEvent,
                    id: this.generateId(),
                    parentEventId: parentEvent.id,
                    startDate: new Date(currentDate),
                    endDate: this.calculateEventEndDate(currentDate, parentEvent.startDate, parentEvent.endDate),
                    status: 'confirmed',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                instances.push(instance);
                currentDate = this.getNextRecurrenceDate(currentDate, parentEvent.recurrencePattern, parentEvent.recurrenceInterval);
            }

            // Batch write instances
            const batch = this.db.batch();
            instances.forEach(instance => {
                const docRef = this.db.collection('calendar_events').doc(instance.id);
                batch.set(docRef, instance);
            });
            await batch.commit();

            return instances.length;
        } catch (error) {
            console.error('Error creating recurring event instances:', error);
            throw error;
        }
    }

    calculateEventEndDate(newStartDate, originalStartDate, originalEndDate) {
        const duration = originalEndDate.getTime() - originalStartDate.getTime();
        const newEndDate = new Date(newStartDate);
        newEndDate.setTime(newEndDate.getTime() + duration);
        return newEndDate;
    }

    getNextRecurrenceDate(currentDate, pattern, interval) {
        const nextDate = new Date(currentDate);
        switch (pattern) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + interval);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + (interval * 7));
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + interval);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + interval);
                break;
        }
        return nextDate;
    }

    getDefaultEventColor(type) {
        const colors = {
            audit: '#dc3545',
            training: '#28a745',
            meeting: '#007bff',
            maintenance: '#fd7e14',
            permit_renewal: '#6f42c1',
            personal: '#6c757d'
        };
        return colors[type] || '#007bff';
    }

    // Calendar Views and Queries
    async getCalendarEvents(filters = {}, options = {}) {
        try {
            let query = this.db.collection('calendar_events')
                .where('factoryId', '==', this.currentFactory);

            // Apply visibility filter
            if (filters.visibility) {
                if (filters.visibility === 'personal') {
                    query = query.where('organizer', '==', this.currentUser.id);
                } else if (filters.visibility === 'factory') {
                    query = query.where('visibility', 'in', ['factory', 'public']);
                }
            } else {
                // Default: show personal and factory events
                query = query.where('visibility', 'in', ['personal', 'factory', 'public']);
            }

            // Apply date range filter
            if (filters.startDate) {
                query = query.where('startDate', '>=', new Date(filters.startDate));
            }
            if (filters.endDate) {
                query = query.where('startDate', '<=', new Date(filters.endDate));
            }

            // Apply type filter
            if (filters.type) {
                query = query.where('type', '==', filters.type);
            }

            // Apply status filter
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }

            // Apply sorting
            query = query.orderBy('startDate', 'asc');

            const snapshot = await query.get();
            let events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Add holidays to events if requested
            if (filters.includeHolidays) {
                const holidayEvents = this.getHolidayEvents(filters.startDate, filters.endDate);
                events = [...events, ...holidayEvents];
            }

            return events;
        } catch (error) {
            console.error('Error getting calendar events:', error);
            throw error;
        }
    }

    getHolidayEvents(startDate, endDate) {
        const events = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            if (this.isHoliday(date)) {
                events.push({
                    id: `holiday_${date.toISOString().split('T')[0]}`,
                    title: this.getHolidayName(date),
                    type: 'holiday',
                    category: 'public',
                    startDate: new Date(date),
                    endDate: new Date(date),
                    allDay: true,
                    color: '#ffc107',
                    visibility: 'public',
                    status: 'confirmed',
                    isHoliday: true
                });
            }
        }

        return events;
    }

    async getUpcomingEvents(days = 7) {
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + days);

            return await this.getCalendarEvents({
                startDate: startDate,
                endDate: endDate,
                includeHolidays: true
            });
        } catch (error) {
            console.error('Error getting upcoming events:', error);
            throw error;
        }
    }

    async getEventsByType(type, days = 30) {
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + days);

            return await this.getCalendarEvents({
                startDate: startDate,
                endDate: endDate,
                type: type
            });
        } catch (error) {
            console.error('Error getting events by type:', error);
            throw error;
        }
    }

    // Event Updates and Management
    async updateCalendarEvent(eventId, updates) {
        try {
            updates.updatedAt = new Date();
            await this.db.collection('calendar_events').doc(eventId).update(updates);
            return { success: true };
        } catch (error) {
            console.error('Error updating calendar event:', error);
            throw error;
        }
    }

    async deleteCalendarEvent(eventId) {
        try {
            await this.db.collection('calendar_events').doc(eventId).delete();
            return { success: true };
        } catch (error) {
            console.error('Error deleting calendar event:', error);
            throw error;
        }
    }

    async addEventAttendee(eventId, attendee) {
        try {
            const eventRef = this.db.collection('calendar_events').doc(eventId);
            const event = await eventRef.get();

            if (!event.exists) throw new Error('Event not found');

            const eventData = event.data();
            const attendees = [...(eventData.attendees || []), attendee];

            await eventRef.update({
                attendees: attendees,
                updatedAt: new Date()
            });

            return { success: true };
        } catch (error) {
            console.error('Error adding event attendee:', error);
            throw error;
        }
    }

    async removeEventAttendee(eventId, attendeeId) {
        try {
            const eventRef = this.db.collection('calendar_events').doc(eventId);
            const event = await eventRef.get();

            if (!event.exists) throw new Error('Event not found');

            const eventData = event.data();
            const attendees = eventData.attendees.filter(a => a.id !== attendeeId);

            await eventRef.update({
                attendees: attendees,
                updatedAt: new Date()
            });

            return { success: true };
        } catch (error) {
            console.error('Error removing event attendee:', error);
            throw error;
        }
    }

    // ICS Export/Import
    async exportToICS(events) {
        try {
            let icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//Angkor Compliance//Calendar//EN',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH'
            ];

            events.forEach(event => {
                const startDate = this.formatICSDate(event.startDate);
                const endDate = this.formatICSDate(event.endDate);
                const createdDate = this.formatICSDate(event.createdAt);
                const uid = event.id;

                icsContent.push(
                    'BEGIN:VEVENT',
                    `UID:${uid}`,
                    `DTSTART:${startDate}`,
                    `DTEND:${endDate}`,
                    `DTSTAMP:${createdDate}`,
                    `SUMMARY:${event.title}`,
                    `DESCRIPTION:${event.description || ''}`,
                    `LOCATION:${event.location || ''}`,
                    `STATUS:${event.status.toUpperCase()}`,
                    `CATEGORIES:${event.category || 'General'}`,
                    'END:VEVENT'
                );
            });

            icsContent.push('END:VCALENDAR');

            return icsContent.join('\r\n');
        } catch (error) {
            console.error('Error exporting to ICS:', error);
            throw error;
        }
    }

    formatICSDate(date) {
        const d = new Date(date);
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    async importFromICS(icsContent) {
        try {
            const events = [];
            const lines = icsContent.split('\n');
            let currentEvent = {};
            let inEvent = false;

            for (const line of lines) {
                const trimmedLine = line.trim();
                
                if (trimmedLine === 'BEGIN:VEVENT') {
                    inEvent = true;
                    currentEvent = {};
                } else if (trimmedLine === 'END:VEVENT') {
                    inEvent = false;
                    if (currentEvent.title) {
                        events.push(currentEvent);
                    }
                } else if (inEvent) {
                    const [key, value] = trimmedLine.split(':', 2);
                    switch (key) {
                        case 'SUMMARY':
                            currentEvent.title = value;
                            break;
                        case 'DESCRIPTION':
                            currentEvent.description = value;
                            break;
                        case 'LOCATION':
                            currentEvent.location = value;
                            break;
                        case 'DTSTART':
                            currentEvent.startDate = this.parseICSDate(value);
                            break;
                        case 'DTEND':
                            currentEvent.endDate = this.parseICSDate(value);
                            break;
                        case 'CATEGORIES':
                            currentEvent.category = value;
                            break;
                    }
                }
            }

            return events;
        } catch (error) {
            console.error('Error importing from ICS:', error);
            throw error;
        }
    }

    parseICSDate(icsDate) {
        // Remove timezone and convert to Date
        const dateStr = icsDate.replace('Z', '').replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6');
        return new Date(dateStr);
    }

    // Calendar Analytics
    async getCalendarAnalytics(filters = {}) {
        try {
            const events = await this.getCalendarEvents(filters);
            
            const analytics = {
                total: events.length,
                byType: {},
                byCategory: {},
                byMonth: {},
                upcoming: 0,
                overdue: 0,
                holidays: 0,
                averageDuration: 0
            };

            let totalDuration = 0;
            const now = new Date();

            events.forEach(event => {
                // Type breakdown
                analytics.byType[event.type] = (analytics.byType[event.type] || 0) + 1;
                
                // Category breakdown
                analytics.byCategory[event.category] = (analytics.byCategory[event.category] || 0) + 1;
                
                // Monthly breakdown
                const month = event.startDate.toISOString().substring(0, 7);
                analytics.byMonth[month] = (analytics.byMonth[month] || 0) + 1;
                
                // Upcoming events
                if (event.startDate > now) {
                    analytics.upcoming++;
                }
                
                // Overdue events (for tasks/meetings that should have started)
                if (event.startDate < now && event.status !== 'completed') {
                    analytics.overdue++;
                }
                
                // Holiday count
                if (event.isHoliday) {
                    analytics.holidays++;
                }
                
                // Duration calculation
                if (!event.allDay) {
                    const duration = event.endDate.getTime() - event.startDate.getTime();
                    totalDuration += duration;
                }
            });

            analytics.averageDuration = events.length > 0 ? Math.round(totalDuration / events.length / (1000 * 60)) : 0; // in minutes

            return analytics;
        } catch (error) {
            console.error('Error getting calendar analytics:', error);
            throw error;
        }
    }

    // Reminder Management
    async setEventReminder(eventId, reminder) {
        try {
            const eventRef = this.db.collection('calendar_events').doc(eventId);
            const event = await eventRef.get();

            if (!event.exists) throw new Error('Event not found');

            const eventData = event.data();
            const reminders = [...(eventData.reminders || []), reminder];

            await eventRef.update({
                reminders: reminders,
                updatedAt: new Date()
            });

            return { success: true };
        } catch (error) {
            console.error('Error setting event reminder:', error);
            throw error;
        }
    }

    async getUpcomingReminders(hours = 24) {
        try {
            const now = new Date();
            const future = new Date(now.getTime() + (hours * 60 * 60 * 1000));

            const events = await this.getCalendarEvents({
                startDate: now,
                endDate: future
            });

            const reminders = [];
            events.forEach(event => {
                if (event.reminders) {
                    event.reminders.forEach(reminder => {
                        const reminderTime = new Date(event.startDate.getTime() - (reminder.minutes * 60 * 1000));
                        if (reminderTime >= now && reminderTime <= future) {
                            reminders.push({
                                eventId: event.id,
                                eventTitle: event.title,
                                reminderType: reminder.type,
                                reminderTime: reminderTime,
                                eventStartTime: event.startDate
                            });
                        }
                    });
                }
            });

            return reminders.sort((a, b) => a.reminderTime - b.reminderTime);
        } catch (error) {
            console.error('Error getting upcoming reminders:', error);
            throw error;
        }
    }

    // Utility Methods
    generateId() {
        return 'cal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getWorkingDays(startDate, endDate) {
        const workingDays = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
            const isHoliday = this.isHoliday(date);

            if (!isWeekend && !isHoliday) {
                workingDays.push(new Date(date));
            }
        }

        return workingDays;
    }

    getNextWorkingDay(date) {
        let nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        while (this.isHoliday(nextDay) || nextDay.getDay() === 0 || nextDay.getDay() === 6) {
            nextDay.setDate(nextDay.getDate() + 1);
        }

        return nextDay;
    }
}

window.CalendarManagementSystem = CalendarManagementSystem;

