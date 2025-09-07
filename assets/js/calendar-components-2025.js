/**
 * Angkor Compliance Platform - Calendar Components JavaScript 2025
 * 
 * Modern calendar and date picker components with 2025 design patterns,
 * accessibility support, and responsive design.
 */

class CalendarManager {
    constructor() {
        this.calendars = new Map();
        this.config = {
            locale: 'en-US',
            firstDayOfWeek: 0, // 0 = Sunday, 1 = Monday
            enableKeyboardNavigation: true,
            enableTouchNavigation: true,
            enableAccessibility: true,
            enableAnimations: true,
            enableHolidays: true,
            enableEvents: true,
            enableRangeSelection: false,
            enableMultiSelection: false,
            enableTimeSelection: false,
            enableWeekNumbers: false,
            enableMonthNavigation: true,
            enableYearNavigation: true,
            enableTodayButton: true,
            enableClearButton: true,
            enableCloseButton: true,
            animationDuration: 300,
            animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12', // 12 or 24
            minDate: null,
            maxDate: null,
            disabledDates: [],
            holidays: [],
            events: [],
            weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            months: [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ],
            monthNames: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ]
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCalendars();
        this.setupAccessibility();
        this.setupResponsive();
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Handle click outside
        document.addEventListener('click', (e) => {
            this.handleClickOutside(e);
        });
    }

    initializeCalendars() {
        const calendarElements = document.querySelectorAll('.calendar');
        
        calendarElements.forEach((element, index) => {
            const id = element.id || `calendar-${index}`;
            this.createCalendar(id, element);
        });
    }

    setupAccessibility() {
        this.calendars.forEach((calendar, id) => {
            const { element } = calendar;
            
            // Add ARIA attributes
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'grid');
            }
            
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'Calendar');
            }
            
            // Add semantic roles to calendar elements
            const header = element.querySelector('.calendar-header');
            if (header) {
                header.setAttribute('role', 'banner');
            }
            
            const weekdays = element.querySelector('.calendar-weekdays');
            if (weekdays) {
                weekdays.setAttribute('role', 'row');
            }
            
            const days = element.querySelector('.calendar-days');
            if (days) {
                days.setAttribute('role', 'rowgroup');
            }
            
            // Add roles to days
            const dayElements = element.querySelectorAll('.calendar-day');
            dayElements.forEach(day => {
                if (!day.getAttribute('role')) {
                    day.setAttribute('role', 'gridcell');
                }
            });
        });
    }

    setupResponsive() {
        // Add responsive classes based on screen size
        const updateResponsiveClasses = () => {
            this.calendars.forEach((calendar) => {
                const { element } = calendar;
                
                if (window.innerWidth < 768) {
                    element.classList.add('calendar-mobile');
                } else {
                    element.classList.remove('calendar-mobile');
                }
                
                if (window.innerWidth < 480) {
                    element.classList.add('calendar-small');
                } else {
                    element.classList.remove('calendar-small');
                }
            });
        };
        
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    // Public Methods
    createCalendar(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        // Store calendar
        this.calendars.set(id, {
            id,
            element,
            config,
            currentDate: new Date(),
            selectedDate: null,
            selectedDates: [],
            selectedRange: { start: null, end: null },
            isOpen: false,
            isAnimating: false,
            events: [],
            holidays: [],
            disabledDates: [],
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
            focusedDate: null,
            error: null
        });
        
        // Apply configuration
        this.applyConfiguration(this.calendars.get(id));
        
        return this.calendars.get(id);
    }

    setDate(id, date) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Update selected date
        calendar.selectedDate = new Date(date);
        calendar.currentDate = new Date(date);
        calendar.month = date.getMonth();
        calendar.year = date.getFullYear();
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:date:change', { 
            calendar: config, 
            date: calendar.selectedDate 
        });
        
        return this;
    }

    setDateRange(id, startDate, endDate) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Update selected range
        calendar.selectedRange = {
            start: new Date(startDate),
            end: new Date(endDate)
        };
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:range:change', { 
            calendar: config, 
            range: calendar.selectedRange 
        });
        
        return this;
    }

    setMultipleDates(id, dates) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Update selected dates
        calendar.selectedDates = dates.map(date => new Date(date));
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:dates:change', { 
            calendar: config, 
            dates: calendar.selectedDates 
        });
        
        return this;
    }

    navigateMonth(id, direction) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Update month
        if (direction === 'next') {
            calendar.month++;
            if (calendar.month > 11) {
                calendar.month = 0;
                calendar.year++;
            }
        } else if (direction === 'prev') {
            calendar.month--;
            if (calendar.month < 0) {
                calendar.month = 11;
                calendar.year--;
            }
        }
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:month:change', { 
            calendar: config, 
            month: calendar.month, 
            year: calendar.year 
        });
        
        return this;
    }

    navigateYear(id, direction) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Update year
        if (direction === 'next') {
            calendar.year++;
        } else if (direction === 'prev') {
            calendar.year--;
        }
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:year:change', { 
            calendar: config, 
            year: calendar.year 
        });
        
        return this;
    }

    goToToday(id) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Go to today
        const today = new Date();
        calendar.currentDate = today;
        calendar.month = today.getMonth();
        calendar.year = today.getFullYear();
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:today', { 
            calendar: config, 
            date: today 
        });
        
        return this;
    }

    clearSelection(id) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Clear selection
        calendar.selectedDate = null;
        calendar.selectedDates = [];
        calendar.selectedRange = { start: null, end: null };
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:clear', { 
            calendar: config 
        });
        
        return this;
    }

    addEvent(id, event) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Add event
        calendar.events.push(event);
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:event:add', { 
            calendar: config, 
            event 
        });
        
        return this;
    }

    removeEvent(id, eventId) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Remove event
        calendar.events = calendar.events.filter(event => event.id !== eventId);
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:event:remove', { 
            calendar: config, 
            eventId 
        });
        
        return this;
    }

    addHoliday(id, holiday) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Add holiday
        calendar.holidays.push(holiday);
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:holiday:add', { 
            calendar: config, 
            holiday 
        });
        
        return this;
    }

    removeHoliday(id, holidayId) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Remove holiday
        calendar.holidays = calendar.holidays.filter(holiday => holiday.id !== holidayId);
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:holiday:remove', { 
            calendar: config, 
            holidayId 
        });
        
        return this;
    }

    disableDate(id, date) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Add disabled date
        calendar.disabledDates.push(new Date(date));
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:date:disable', { 
            calendar: config, 
            date: new Date(date) 
        });
        
        return this;
    }

    enableDate(id, date) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Remove disabled date
        calendar.disabledDates = calendar.disabledDates.filter(
            disabledDate => !this.isSameDate(disabledDate, new Date(date))
        );
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:date:enable', { 
            calendar: config, 
            date: new Date(date) 
        });
        
        return this;
    }

    show(id) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Show calendar
        calendar.isOpen = true;
        calendar.element.style.display = 'block';
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:show', { 
            calendar: config 
        });
        
        return this;
    }

    hide(id) {
        const calendar = this.calendars.get(id);
        if (!calendar) {
            console.error(`Calendar with id "${id}" not found`);
            return;
        }
        
        const { config } = calendar;
        
        // Hide calendar
        calendar.isOpen = false;
        calendar.element.style.display = 'none';
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:hide', { 
            calendar: config 
        });
        
        return this;
    }

    // Private Methods
    applyConfiguration(calendar) {
        const { element, config } = calendar;
        
        // Add configuration classes
        if (config.enableKeyboardNavigation) element.classList.add('calendar-keyboard-enabled');
        if (config.enableTouchNavigation) element.classList.add('calendar-touch-enabled');
        if (config.enableAccessibility) element.classList.add('calendar-accessibility-enabled');
        if (config.enableAnimations) element.classList.add('calendar-animations-enabled');
        if (config.enableHolidays) element.classList.add('calendar-holidays-enabled');
        if (config.enableEvents) element.classList.add('calendar-events-enabled');
        if (config.enableRangeSelection) element.classList.add('calendar-range-enabled');
        if (config.enableMultiSelection) element.classList.add('calendar-multi-enabled');
        if (config.enableTimeSelection) element.classList.add('calendar-time-enabled');
        if (config.enableWeekNumbers) element.classList.add('calendar-week-numbers-enabled');
        if (config.enableMonthNavigation) element.classList.add('calendar-month-nav-enabled');
        if (config.enableYearNavigation) element.classList.add('calendar-year-nav-enabled');
        if (config.enableTodayButton) element.classList.add('calendar-today-enabled');
        if (config.enableClearButton) element.classList.add('calendar-clear-enabled');
        if (config.enableCloseButton) element.classList.add('calendar-close-enabled');
        
        // Add event listeners
        this.addEventListeners(calendar);
        
        // Initialize features
        if (config.enableKeyboardNavigation) this.initializeKeyboardNavigation(calendar);
        if (config.enableTouchNavigation) this.initializeTouchNavigation(calendar);
        if (config.enableAccessibility) this.initializeAccessibility(calendar);
        if (config.enableAnimations) this.initializeAnimations(calendar);
        if (config.enableHolidays) this.initializeHolidays(calendar);
        if (config.enableEvents) this.initializeEvents(calendar);
        if (config.enableRangeSelection) this.initializeRangeSelection(calendar);
        if (config.enableMultiSelection) this.initializeMultiSelection(calendar);
        if (config.enableTimeSelection) this.initializeTimeSelection(calendar);
        if (config.enableWeekNumbers) this.initializeWeekNumbers(calendar);
        if (config.enableMonthNavigation) this.initializeMonthNavigation(calendar);
        if (config.enableYearNavigation) this.initializeYearNavigation(calendar);
        if (config.enableTodayButton) this.initializeTodayButton(calendar);
        if (config.enableClearButton) this.initializeClearButton(calendar);
        if (config.enableCloseButton) this.initializeCloseButton(calendar);
        
        // Render calendar
        this.renderCalendar(calendar);
    }

    addEventListeners(calendar) {
        const { element, config } = calendar;
        
        // Navigation event listeners
        const prevButton = element.querySelector('.calendar-nav-prev');
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                this.navigateMonth(calendar.id, 'prev');
            });
        }
        
        const nextButton = element.querySelector('.calendar-nav-next');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                this.navigateMonth(calendar.id, 'next');
            });
        }
        
        // Today button event listeners
        const todayButton = element.querySelector('.calendar-today');
        if (todayButton) {
            todayButton.addEventListener('click', () => {
                this.goToToday(calendar.id);
            });
        }
        
        // Clear button event listeners
        const clearButton = element.querySelector('.calendar-clear');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearSelection(calendar.id);
            });
        }
        
        // Close button event listeners
        const closeButton = element.querySelector('.calendar-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hide(calendar.id);
            });
        }
        
        // Day event listeners
        const days = element.querySelectorAll('.calendar-day');
        days.forEach(day => {
            day.addEventListener('click', () => {
                this.handleDayClick(calendar, day);
            });
        });
    }

    renderCalendar(calendar) {
        const { element, config, month, year } = calendar;
        
        // Update header
        this.updateCalendarHeader(calendar);
        
        // Update weekdays
        this.updateCalendarWeekdays(calendar);
        
        // Update days
        this.updateCalendarDays(calendar);
        
        // Update navigation buttons
        this.updateNavigationButtons(calendar);
    }

    updateCalendarHeader(calendar) {
        const { element, config, month, year } = calendar;
        
        const monthElement = element.querySelector('.calendar-month');
        const yearElement = element.querySelector('.calendar-year');
        
        if (monthElement) {
            monthElement.textContent = config.months[month];
        }
        
        if (yearElement) {
            yearElement.textContent = year;
        }
    }

    updateCalendarWeekdays(calendar) {
        const { element, config } = calendar;
        
        const weekdaysElement = element.querySelector('.calendar-weekdays');
        if (!weekdaysElement) return;
        
        // Get weekdays starting from first day of week
        const weekdays = [];
        for (let i = 0; i < 7; i++) {
            const dayIndex = (config.firstDayOfWeek + i) % 7;
            weekdays.push(config.weekdays[dayIndex]);
        }
        
        // Update weekdays HTML
        weekdaysElement.innerHTML = weekdays.map(weekday => 
            `<div class="calendar-weekday">${weekday}</div>`
        ).join('');
    }

    updateCalendarDays(calendar) {
        const { element, config, month, year } = calendar;
        
        const daysElement = element.querySelector('.calendar-days');
        if (!daysElement) return;
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = (firstDay.getDay() - config.firstDayOfWeek + 7) % 7;
        
        // Create days array
        const days = [];
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDay; i++) {
            const prevMonth = month === 0 ? 11 : month - 1;
            const prevYear = month === 0 ? year - 1 : year;
            const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
            const day = prevMonthLastDay - startingDay + i + 1;
            days.push({
                date: new Date(prevYear, prevMonth, day),
                isCurrentMonth: false,
                isToday: false,
                isSelected: false,
                isDisabled: false,
                isWeekend: false,
                isHoliday: false,
                hasEvent: false
            });
        }
        
        // Add days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = this.isToday(date);
            const isSelected = this.isDateSelected(calendar, date);
            const isDisabled = this.isDateDisabled(calendar, date);
            const isWeekend = this.isWeekend(date);
            const isHoliday = this.isHoliday(calendar, date);
            const hasEvent = this.hasEvent(calendar, date);
            
            days.push({
                date,
                isCurrentMonth: true,
                isToday,
                isSelected,
                isDisabled,
                isWeekend,
                isHoliday,
                hasEvent
            });
        }
        
        // Add empty cells for days after month ends
        const remainingCells = 42 - days.length; // 6 rows × 7 days
        for (let i = 1; i <= remainingCells; i++) {
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            const date = new Date(nextYear, nextMonth, i);
            days.push({
                date,
                isCurrentMonth: false,
                isToday: false,
                isSelected: false,
                isDisabled: false,
                isWeekend: false,
                isHoliday: false,
                hasEvent: false
            });
        }
        
        // Update days HTML
        daysElement.innerHTML = days.map(day => {
            const classes = [
                'calendar-day',
                day.isCurrentMonth ? '' : 'outside',
                day.isToday ? 'today' : '',
                day.isSelected ? 'selected' : '',
                day.isDisabled ? 'disabled' : '',
                day.isWeekend ? 'weekend' : '',
                day.isHoliday ? 'holiday' : '',
                day.hasEvent ? 'event' : ''
            ].filter(Boolean).join(' ');
            
            return `
                <button class="${classes}" 
                        data-date="${day.date.toISOString()}"
                        ${day.isDisabled ? 'disabled' : ''}
                        ${day.isCurrentMonth ? '' : 'aria-hidden="true"'}>
                    ${day.date.getDate()}
                </button>
            `;
        }).join('');
        
        // Add event listeners to new day buttons
        const dayButtons = daysElement.querySelectorAll('.calendar-day');
        dayButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleDayClick(calendar, button);
            });
        });
    }

    updateNavigationButtons(calendar) {
        const { element, config, month, year } = calendar;
        
        const prevButton = element.querySelector('.calendar-nav-prev');
        const nextButton = element.querySelector('.calendar-nav-next');
        
        if (prevButton) {
            const prevDate = new Date(year, month - 1, 1);
            prevButton.disabled = config.minDate && prevDate < config.minDate;
        }
        
        if (nextButton) {
            const nextDate = new Date(year, month + 1, 1);
            nextButton.disabled = config.maxDate && nextDate > config.maxDate;
        }
    }

    handleDayClick(calendar, dayElement) {
        const { config } = calendar;
        
        if (dayElement.disabled) return;
        
        const date = new Date(dayElement.getAttribute('data-date'));
        
        if (config.enableRangeSelection) {
            this.handleRangeSelection(calendar, date);
        } else if (config.enableMultiSelection) {
            this.handleMultiSelection(calendar, date);
        } else {
            this.handleSingleSelection(calendar, date);
        }
        
        // Render calendar
        this.renderCalendar(calendar);
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:day:click', { 
            calendar: config, 
            date 
        });
    }

    handleSingleSelection(calendar, date) {
        const { config } = calendar;
        
        // Update selected date
        calendar.selectedDate = date;
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:date:select', { 
            calendar: config, 
            date 
        });
    }

    handleRangeSelection(calendar, date) {
        const { config } = calendar;
        
        if (!calendar.selectedRange.start || calendar.selectedRange.end) {
            // Start new range
            calendar.selectedRange = { start: date, end: null };
        } else {
            // Complete range
            if (date < calendar.selectedRange.start) {
                calendar.selectedRange = { start: date, end: calendar.selectedRange.start };
            } else {
                calendar.selectedRange.end = date;
            }
        }
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:range:select', { 
            calendar: config, 
            range: calendar.selectedRange 
        });
    }

    handleMultiSelection(calendar, date) {
        const { config } = calendar;
        
        // Toggle date in selection
        const existingIndex = calendar.selectedDates.findIndex(
            selectedDate => this.isSameDate(selectedDate, date)
        );
        
        if (existingIndex >= 0) {
            calendar.selectedDates.splice(existingIndex, 1);
        } else {
            calendar.selectedDates.push(date);
        }
        
        // Trigger event
        this.triggerEvent(calendar.element, 'calendar:dates:select', { 
            calendar: config, 
            dates: calendar.selectedDates 
        });
    }

    // Utility Methods
    isToday(date) {
        const today = new Date();
        return this.isSameDate(date, today);
    }

    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    isDateSelected(calendar, date) {
        const { selectedDate, selectedDates, selectedRange } = calendar;
        
        if (selectedDate && this.isSameDate(date, selectedDate)) {
            return true;
        }
        
        if (selectedDates.some(selectedDate => this.isSameDate(date, selectedDate))) {
            return true;
        }
        
        if (selectedRange.start && selectedRange.end) {
            return date >= selectedRange.start && date <= selectedRange.end;
        }
        
        return false;
    }

    isDateDisabled(calendar, date) {
        const { config, disabledDates } = calendar;
        
        if (config.minDate && date < config.minDate) {
            return true;
        }
        
        if (config.maxDate && date > config.maxDate) {
            return true;
        }
        
        if (config.disabledDates.some(disabledDate => this.isSameDate(date, disabledDate))) {
            return true;
        }
        
        if (disabledDates.some(disabledDate => this.isSameDate(date, disabledDate))) {
            return true;
        }
        
        return false;
    }

    isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    }

    isHoliday(calendar, date) {
        const { holidays } = calendar;
        return holidays.some(holiday => this.isSameDate(date, holiday.date));
    }

    hasEvent(calendar, date) {
        const { events } = calendar;
        return events.some(event => this.isSameDate(date, event.date));
    }

    formatDate(date, format = 'MM/DD/YYYY') {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return format
            .replace('MM', month)
            .replace('DD', day)
            .replace('YYYY', year);
    }

    parseDate(dateString, format = 'MM/DD/YYYY') {
        // Simple date parsing - in production, use a proper date library
        const parts = dateString.split('/');
        if (format === 'MM/DD/YYYY') {
            return new Date(parts[2], parts[0] - 1, parts[1]);
        }
        return new Date(dateString);
    }

    // Event Handlers
    handleResize() {
        this.calendars.forEach((calendar) => {
            if (calendar.isOpen) {
                this.renderCalendar(calendar);
            }
        });
    }

    handleKeyboardNavigation(e) {
        // Handle global keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'c':
                    e.preventDefault();
                    this.focusFirstCalendar();
                    break;
            }
        }
    }

    handleClickOutside(e) {
        this.calendars.forEach((calendar) => {
            if (!calendar.element.contains(e.target)) {
                this.hide(calendar.id);
            }
        });
    }

    focusFirstCalendar() {
        const firstCalendar = this.calendars.values().next().value;
        if (firstCalendar && firstCalendar.element) {
            firstCalendar.element.focus();
        }
    }

    // Feature Initializers
    initializeKeyboardNavigation(calendar) {
        // Implement keyboard navigation
    }

    initializeTouchNavigation(calendar) {
        // Implement touch navigation
    }

    initializeAccessibility(calendar) {
        // Implement accessibility features
    }

    initializeAnimations(calendar) {
        // Implement animations
    }

    initializeHolidays(calendar) {
        // Implement holiday features
    }

    initializeEvents(calendar) {
        // Implement event features
    }

    initializeRangeSelection(calendar) {
        // Implement range selection
    }

    initializeMultiSelection(calendar) {
        // Implement multi selection
    }

    initializeTimeSelection(calendar) {
        // Implement time selection
    }

    initializeWeekNumbers(calendar) {
        // Implement week numbers
    }

    initializeMonthNavigation(calendar) {
        // Implement month navigation
    }

    initializeYearNavigation(calendar) {
        // Implement year navigation
    }

    initializeTodayButton(calendar) {
        // Implement today button
    }

    initializeClearButton(calendar) {
        // Implement clear button
    }

    initializeCloseButton(calendar) {
        // Implement close button
    }

    // Utility Methods
    triggerEvent(element, eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    // Configuration
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    getConfig() {
        return { ...this.config };
    }

    // Cleanup
    destroy() {
        this.calendars.forEach((calendar, id) => {
            this.destroyCalendar(id);
        });
        this.calendars.clear();
    }

    destroyCalendar(id) {
        const calendar = this.calendars.get(id);
        if (!calendar) return;
        
        // Remove event listeners
        const { element } = calendar;
        element.removeEventListener('click', this.handleDayClick);
        element.removeEventListener('keydown', this.handleKeyboardNavigation);
        
        // Remove from calendars map
        this.calendars.delete(id);
        
        return this;
    }
}

// Initialize calendar manager
document.addEventListener('DOMContentLoaded', () => {
    window.calendarManager = new CalendarManager();
});

// Global access
window.CalendarManager = CalendarManager;
