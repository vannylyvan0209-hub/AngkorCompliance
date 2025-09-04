/**
 * Calendar Sync System - Angkor Compliance Platform
 */

class CalendarSyncSystem {
    constructor() {
        this.calendars = {
            factory: [],
            personal: [],
            meeting: [],
            training: []
        };
        this.calendarSources = [];
        this.holidays = [];
        this.currentView = 'dayGridMonth';
        this.calendarInstances = {};
        
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.loadInitialData();
        this.initializeCalendars();
        this.renderCalendarSources();
        this.renderHolidayList();
        this.setupDateDefaults();
    }

    initializeEventListeners() {
        document.getElementById('saveEventBtn')?.addEventListener('click', () => this.createEvent());
        document.getElementById('importCalendarBtn')?.addEventListener('click', () => this.importCalendar());
        document.getElementById('exportCalendarBtn')?.addEventListener('click', () => this.exportCalendar());
        document.getElementById('saveCalendarSourceBtn')?.addEventListener('click', () => this.addCalendarSource());
        document.getElementById('sourceType')?.addEventListener('change', (e) => this.handleSourceTypeChange(e));
        document.getElementById('saveHolidayBtn')?.addEventListener('click', () => this.addHoliday());
        this.initializeCalendarNavigation();
    }

    initializeCalendarNavigation() {
        const calendarTypes = ['factory', 'personal', 'meeting', 'training'];
        
        calendarTypes.forEach(type => {
            document.getElementById(`${type}Today`)?.addEventListener('click', () => this.goToToday(type));
            document.getElementById(`${type}Prev`)?.addEventListener('click', () => this.goToPrevious(type));
            document.getElementById(`${type}Next`)?.addEventListener('click', () => this.goToNext(type));
        });
    }

    async loadInitialData() {
        try {
            await this.loadSampleData();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Error loading data', 'error');
        }
    }

    async loadSampleData() {
        this.calendars.factory = [
            {
                id: 'E001',
                title: 'Safety Committee Meeting',
                type: 'meeting',
                start: '2024-02-15T09:00:00',
                end: '2024-02-15T10:00:00',
                allDay: false,
                color: '#007bff',
                description: 'Monthly safety committee meeting to review incidents and safety metrics',
                location: 'Conference Room A',
                attendees: ['John Smith', 'Sarah Johnson', 'Mike Chen']
            }
        ];

        this.calendars.personal = [
            {
                id: 'E003',
                title: 'Performance Review',
                type: 'meeting',
                start: '2024-02-18T11:00:00',
                end: '2024-02-18T12:00:00',
                allDay: false,
                color: '#ffc107',
                description: 'Annual performance review meeting with supervisor',
                location: 'Office',
                attendees: ['Manager']
            }
        ];

        this.calendarSources = [
            {
                id: 'CS001',
                name: 'Factory Operations Calendar',
                type: 'manual',
                color: '#007bff',
                syncFrequency: 'daily',
                enabled: true
            }
        ];

        this.holidays = [
            {
                id: 'H001',
                name: 'New Year\'s Day',
                date: '2024-01-01',
                type: 'public',
                description: 'International New Year celebration',
                recurring: true
            }
        ];
    }

    initializeCalendars() {
        const calendarTypes = ['factory', 'personal', 'meeting', 'training'];
        
        calendarTypes.forEach(type => {
            this.initializeCalendar(type);
        });
    }

    initializeCalendar(calendarType) {
        const calendarEl = document.getElementById(`${calendarType}Calendar`);
        if (!calendarEl) return;

        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: this.currentView,
            headerToolbar: false,
            height: 'auto',
            events: this.calendars[calendarType],
            eventClick: (info) => this.handleEventClick(info),
            eventDrop: (info) => this.handleEventDrop(info),
            eventResize: (info) => this.handleEventResize(info),
            selectable: true,
            select: (info) => this.handleDateSelect(info, calendarType),
            editable: true,
            dayMaxEvents: true,
            eventDisplay: 'block'
        });

        calendar.render();
        this.calendarInstances[calendarType] = calendar;
        this.updateCurrentDateDisplay(calendarType);
    }

    handleEventClick(info) {
        this.showEventDetails(info.event);
    }

    handleEventDrop(info) {
        const event = info.event;
        const newStart = event.start;
        const newEnd = event.end;
        
        this.updateEvent(event.id, {
            start: newStart.toISOString(),
            end: newEnd ? newEnd.toISOString() : null
        });
        
        this.showNotification(`Event "${event.title}" moved to ${newStart.toLocaleDateString()}`, 'success');
    }

    handleEventResize(info) {
        const event = info.event;
        const newStart = event.start;
        const newEnd = event.end;
        
        this.updateEvent(event.id, {
            start: newStart.toISOString(),
            end: newEnd.toISOString()
        });
        
        this.showNotification(`Event "${event.title}" resized`, 'success');
    }

    handleDateSelect(selectInfo, calendarType) {
        const startDate = selectInfo.start;
        const endDate = selectInfo.end;
        
        document.getElementById('eventStart').value = this.formatDateTimeLocal(startDate);
        document.getElementById('eventEnd').value = this.formatDateTimeLocal(endDate);
        document.getElementById('eventCalendar').value = calendarType;
        
        const modal = new bootstrap.Modal(document.getElementById('createEventModal'));
        modal.show();
        
        selectInfo.view.calendar.unselect();
    }

    async createEvent() {
        const form = document.getElementById('createEventForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const eventData = {
            id: `E${String(this.generateEventId()).padStart(3, '0')}`,
            title: document.getElementById('eventTitle').value,
            type: document.getElementById('eventType').value,
            start: document.getElementById('eventStart').value,
            end: document.getElementById('eventEnd').value,
            allDay: document.getElementById('eventAllDay').checked,
            color: document.getElementById('eventColor').value,
            description: document.getElementById('eventDescription').value,
            location: document.getElementById('eventLocation').value,
            attendees: Array.from(document.getElementById('eventAttendees').selectedOptions).map(opt => opt.text),
            calendar: document.getElementById('eventCalendar').value
        };

        try {
            const targetCalendar = eventData.calendar;
            this.calendars[targetCalendar].push(eventData);
            
            this.refreshCalendar(targetCalendar);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('createEventModal'));
            modal.hide();
            this.showNotification('Event created successfully', 'success');
            form.reset();
        } catch (error) {
            console.error('Error creating event:', error);
            this.showNotification('Error creating event', 'error');
        }
    }

    async importCalendar() {
        const file = document.getElementById('calendarFile').files[0];
        const targetCalendar = document.getElementById('importTargetCalendar').value;
        const overwrite = document.getElementById('importOverwrite').checked;

        if (!file || !targetCalendar) {
            this.showNotification('Please select a file and target calendar', 'warning');
            return;
        }

        try {
            const events = await this.parseCalendarFile(file);
            
            if (overwrite) {
                this.calendars[targetCalendar] = events;
            } else {
                this.calendars[targetCalendar].push(...events);
            }
            
            this.refreshCalendar(targetCalendar);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('importCalendarModal'));
            modal.hide();
            this.showNotification(`${events.length} events imported successfully`, 'success');
            document.getElementById('importCalendarForm').reset();
        } catch (error) {
            console.error('Error importing calendar:', error);
            this.showNotification('Error importing calendar', 'error');
        }
    }

    async exportCalendar() {
        const calendar = document.getElementById('exportCalendar').value;
        const startDate = document.getElementById('exportStartDate').value;
        const endDate = document.getElementById('exportEndDate').value;
        const format = document.getElementById('exportFormat').value;

        if (!calendar || !startDate || !endDate) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }

        try {
            let events = [];
            
            if (calendar === 'all') {
                Object.values(this.calendars).forEach(cal => events.push(...cal));
            } else {
                events = this.calendars[calendar] || [];
            }
            
            events = events.filter(event => {
                const eventDate = new Date(event.start);
                const start = new Date(startDate);
                const end = new Date(endDate);
                return eventDate >= start && eventDate <= end;
            });
            
            switch (format) {
                case 'ics':
                    this.exportICS(events);
                    break;
                case 'csv':
                    this.exportCSV(events);
                    break;
                case 'pdf':
                    this.exportPDF(events);
                    break;
            }
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('exportCalendarModal'));
            modal.hide();
            this.showNotification('Calendar exported successfully', 'success');
            document.getElementById('exportCalendarForm').reset();
        } catch (error) {
            console.error('Error exporting calendar:', error);
            this.showNotification('Error exporting calendar', 'error');
        }
    }

    async addCalendarSource() {
        const form = document.getElementById('addCalendarSourceForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const sourceData = {
            id: `CS${String(this.calendarSources.length + 1).padStart(3, '0')}`,
            name: document.getElementById('sourceName').value,
            type: document.getElementById('sourceType').value,
            url: document.getElementById('sourceUrl').value,
            file: document.getElementById('sourceFile').files[0],
            syncFrequency: document.getElementById('syncFrequency').value,
            color: document.getElementById('sourceColor').value,
            enabled: true
        };

        try {
            this.calendarSources.push(sourceData);
            this.renderCalendarSources();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addCalendarSourceModal'));
            modal.hide();
            this.showNotification('Calendar source added successfully', 'success');
            form.reset();
        } catch (error) {
            console.error('Error adding calendar source:', error);
            this.showNotification('Error adding calendar source', 'error');
        }
    }

    async addHoliday() {
        const form = document.getElementById('addHolidayForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const holidayData = {
            id: `H${String(this.holidays.length + 1).padStart(3, '0')}`,
            name: document.getElementById('holidayName').value,
            date: document.getElementById('holidayDate').value,
            type: document.getElementById('holidayType').value,
            description: document.getElementById('holidayDescription').value,
            recurring: document.getElementById('holidayRecurring').checked
        };

        try {
            this.holidays.push(holidayData);
            this.renderHolidayList();
            this.refreshAllCalendars();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addHolidayModal'));
            modal.hide();
            this.showNotification('Holiday added successfully', 'success');
            form.reset();
        } catch (error) {
            console.error('Error adding holiday:', error);
            this.showNotification('Error adding holiday', 'error');
        }
    }

    handleSourceTypeChange(event) {
        const sourceType = event.target.value;
        const urlSection = document.getElementById('sourceUrlSection');
        const fileSection = document.getElementById('sourceFileSection');
        
        urlSection.style.display = 'none';
        fileSection.style.display = 'none';
        
        switch (sourceType) {
            case 'google':
            case 'outlook':
            case 'ics':
                urlSection.style.display = 'block';
                break;
            case 'csv':
                fileSection.style.display = 'block';
                break;
        }
    }

    goToToday(calendarType) {
        const calendar = this.calendarInstances[calendarType];
        if (calendar) {
            calendar.today();
            this.updateCurrentDateDisplay(calendarType);
        }
    }

    goToPrevious(calendarType) {
        const calendar = this.calendarInstances[calendarType];
        if (calendar) {
            calendar.prev();
            this.updateCurrentDateDisplay(calendarType);
        }
    }

    goToNext(calendarType) {
        const calendar = this.calendarInstances[calendarType];
        if (calendar) {
            calendar.next();
            this.updateCurrentDateDisplay(calendarType);
        }
    }

    updateCurrentDateDisplay(calendarType) {
        const calendar = this.calendarInstances[calendarType];
        if (calendar) {
            const currentDate = calendar.getDate();
            const dateElement = document.getElementById(`${calendarType}CurrentDate`);
            if (dateElement) {
                dateElement.textContent = currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                });
            }
        }
    }

    renderCalendarSources() {
        const container = document.getElementById('calendarSources');
        if (!container) return;

        container.innerHTML = '';
        this.calendarSources.forEach(source => {
            const sourceElement = this.createCalendarSourceElement(source);
            container.appendChild(sourceElement);
        });
    }

    createCalendarSourceElement(source) {
        const div = document.createElement('div');
        div.className = 'calendar-source-item d-flex justify-content-between align-items-center p-2 border rounded mb-2';
        div.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="calendar-source-color me-2" style="width: 16px; height: 16px; background: ${source.color}; border-radius: 3px;"></div>
                <div>
                    <strong>${source.name}</strong>
                    <br><small class="text-muted">${source.type} • ${source.syncFrequency}</small>
                </div>
            </div>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary btn-sm" onclick="calendarSystem.syncCalendarSource('${source.id}')">
                    <i class="fas fa-sync-alt"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="calendarSystem.removeCalendarSource('${source.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        return div;
    }

    renderHolidayList() {
        const container = document.getElementById('holidayList');
        if (!container) return;

        container.innerHTML = '';
        this.holidays.forEach(holiday => {
            const holidayElement = this.createHolidayElement(holiday);
            container.appendChild(holidayElement);
        });
    }

    createHolidayElement(holiday) {
        const div = document.createElement('div');
        div.className = 'holiday-item d-flex justify-content-between align-items-center p-2 border rounded mb-2';
        div.innerHTML = `
            <div>
                <strong>${holiday.name}</strong>
                <br><small class="text-muted">${holiday.date} • ${holiday.type}</small>
            </div>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary btn-sm" onclick="calendarSystem.editHoliday('${holiday.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="calendarSystem.removeHoliday('${holiday.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        return div;
    }

    setupDateDefaults() {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        
        document.getElementById('exportStartDate').value = this.formatDate(today);
        document.getElementById('exportEndDate').value = this.formatDate(nextMonth);
    }

    generateEventId() {
        return Math.floor(Math.random() * 1000);
    }

    formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    async parseCalendarFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    let events = [];
                    
                    if (file.name.endsWith('.ics')) {
                        events = this.parseICS(content);
                    } else if (file.name.endsWith('.csv')) {
                        events = this.parseCSV(content);
                    }
                    
                    resolve(events);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    parseICS(content) {
        const events = [];
        const lines = content.split('\n');
        let currentEvent = {};
        
        lines.forEach(line => {
            if (line.startsWith('BEGIN:VEVENT')) {
                currentEvent = {};
            } else if (line.startsWith('END:VEVENT')) {
                if (currentEvent.title && currentEvent.start) {
                    events.push(currentEvent);
                }
            } else if (line.startsWith('SUMMARY:')) {
                currentEvent.title = line.substring(8);
            } else if (line.startsWith('DTSTART:')) {
                currentEvent.start = this.parseICSDate(line.substring(8));
            } else if (line.startsWith('DTEND:')) {
                currentEvent.end = this.parseICSDate(line.substring(6));
            }
        });
        
        return events;
    }

    parseCSV(content) {
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const events = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim());
                const event = {};
                
                headers.forEach((header, index) => {
                    event[header.toLowerCase()] = values[index];
                });
                
                if (event.title && event.start) {
                    events.push(event);
                }
            }
        }
        
        return events;
    }

    parseICSDate(dateString) {
        if (dateString.includes('T')) {
            const year = dateString.substring(0, 4);
            const month = dateString.substring(4, 6);
            const day = dateString.substring(6, 8);
            const hour = dateString.substring(9, 11);
            const minute = dateString.substring(11, 13);
            return new Date(year, month - 1, day, hour, minute);
        } else {
            const year = dateString.substring(0, 4);
            const month = dateString.substring(4, 6);
            const day = dateString.substring(6, 8);
            return new Date(year, month - 1, day);
        }
    }

    exportICS(events) {
        let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Angkor Compliance//Calendar Export//EN\n';
        
        events.forEach(event => {
            ics += 'BEGIN:VEVENT\n';
            ics += `UID:${event.id}@angkorcompliance.com\n`;
            ics += `DTSTART:${this.formatICSDate(new Date(event.start))}\n`;
            if (event.end) {
                ics += `DTEND:${this.formatICSDate(new Date(event.end))}\n`;
            }
            ics += `SUMMARY:${event.title}\n`;
            if (event.description) {
                ics += `DESCRIPTION:${event.description}\n`;
            }
            if (event.location) {
                ics += `LOCATION:${event.location}\n`;
            }
            ics += 'END:VEVENT\n';
        });
        
        ics += 'END:VCALENDAR';
        this.downloadFile(ics, 'calendar.ics', 'text/calendar');
    }

    exportCSV(events) {
        let csv = 'Title,Start,End,Type,Location,Description\n';
        
        events.forEach(event => {
            csv += `"${event.title}","${event.start}","${event.end || ''}","${event.type || ''}","${event.location || ''}","${event.description || ''}"\n`;
        });
        
        this.downloadFile(csv, 'calendar.csv', 'text/csv');
    }

    exportPDF(events) {
        this.showNotification('PDF export not implemented yet', 'info');
    }

    formatICSDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hour}${minute}${second}Z`;
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    refreshCalendar(calendarType) {
        const calendar = this.calendarInstances[calendarType];
        if (calendar) {
            calendar.removeAllEvents();
            calendar.addEventSource(this.calendars[calendarType]);
        }
    }

    refreshAllCalendars() {
        Object.keys(this.calendars).forEach(calendarType => {
            this.refreshCalendar(calendarType);
        });
    }

    updateEvent(eventId, updates) {
        Object.keys(this.calendars).forEach(calendarType => {
            const eventIndex = this.calendars[calendarType].findIndex(e => e.id === eventId);
            if (eventIndex >= 0) {
                Object.assign(this.calendars[calendarType][eventIndex], updates);
            }
        });
        
        this.refreshAllCalendars();
    }

    showEventDetails(event) {
        this.showNotification(`Event: ${event.title}`, 'info');
    }

    syncCalendarSource(sourceId) {
        this.showNotification('Calendar sync not implemented yet', 'info');
    }

    removeCalendarSource(sourceId) {
        if (confirm('Are you sure you want to remove this calendar source?')) {
            this.calendarSources = this.calendarSources.filter(s => s.id !== sourceId);
            this.renderCalendarSources();
            this.showNotification('Calendar source removed successfully', 'success');
        }
    }

    editHoliday(holidayId) {
        this.showNotification('Holiday editing not implemented yet', 'info');
    }

    removeHoliday(holidayId) {
        if (confirm('Are you sure you want to remove this holiday?')) {
            this.holidays = this.holidays.filter(h => h.id !== holidayId);
            this.renderHolidayList();
            this.refreshAllCalendars();
            this.showNotification('Holiday removed successfully', 'success');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.calendarSystem = new CalendarSyncSystem();
});
