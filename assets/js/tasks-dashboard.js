// Tasks Dashboard for Angkor Compliance v2
// Handles task management, calendar display, notifications, and analytics

class TasksDashboard {
    constructor() {
        this.currentUser = null;
        this.currentFilter = 'all';
        this.currentMonth = new Date();
        this.taskAnalyticsChart = null;
        this.isInitialized = false;
        
        this.initializeTasksDashboard();
    }

    async initializeTasksDashboard() {
        try {
            console.log('📊 Initializing Tasks Dashboard...');
            
            // Wait for Firebase to be ready
            await this.waitForFirebase();
            
            // Check authentication
            await this.checkAuthentication();
            
            // Load sidebar
            await this.loadSidebar();
            
            // Initialize dashboard components
            await Promise.all([
                this.loadTasks(),
                this.loadNotifications(),
                this.initializeCalendar(),
                this.initializeAnalytics()
            ]);
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Set up real-time listeners
            this.setupRealTimeListeners();
            
            this.isInitialized = true;
            console.log('✅ Tasks Dashboard initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Tasks Dashboard:', error);
            this.isInitialized = false;
        }
    }

    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.Firebase && window.Firebase.db) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    async checkAuthentication() {
        try {
            const auth = window.Firebase?.auth;
            if (!auth) {
                throw new Error('Firebase Auth not available');
            }

            return new Promise((resolve, reject) => {
                const unsubscribe = auth.onAuthStateChanged(async (user) => {
                    unsubscribe();
                    if (user) {
                        this.currentUser = user;
                        console.log('✅ User authenticated:', user.email);
                        resolve(user);
                    } else {
                        console.log('❌ No user authenticated');
                        window.location.href = 'login.html';
                        reject(new Error('No user authenticated'));
                    }
                });
            });
        } catch (error) {
            console.error('Error checking authentication:', error);
            throw error;
        }
    }

    async loadSidebar() {
        try {
            const sidebarContainer = document.getElementById('sidebarContainer');
            if (!sidebarContainer) {
                throw new Error('Sidebar container not found');
            }

            // Load sidebar template
            const response = await fetch('assets/templates/sidebar.html');
            const sidebarTemplate = await response.text();
            
            sidebarContainer.innerHTML = sidebarTemplate;
            
            // Initialize sidebar functionality
            this.initializeSidebar();
            
        } catch (error) {
            console.error('Error loading sidebar:', error);
        }
    }

    initializeSidebar() {
        // Add active class to current page
        const currentPage = 'tasks-dashboard';
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        
        sidebarLinks.forEach(link => {
            if (link.getAttribute('data-page') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    async loadTasks() {
        try {
            const taskList = document.getElementById('taskList');
            if (!taskList) return;

            // Get user's tasks
            const userTasks = window.TasksCalendarSystem?.getTasksByAssignee(this.currentUser.uid) || [];
            
            if (userTasks.length === 0) {
                taskList.innerHTML = this.getEmptyStateHTML('tasks');
                return;
            }

            // Filter tasks based on current filter
            const filteredTasks = this.filterTasks(userTasks, this.currentFilter);
            
            // Update task list
            taskList.innerHTML = filteredTasks.map(task => this.getTaskHTML(task)).join('');
            
            // Update statistics
            this.updateTaskStatistics(userTasks);
            
        } catch (error) {
            console.error('Error loading tasks:', error);
            document.getElementById('taskList').innerHTML = this.getErrorStateHTML('tasks');
        }
    }

    filterTasks(tasks, filter) {
        switch (filter) {
            case 'pending':
                return tasks.filter(task => task.status === 'pending');
            case 'in-progress':
                return tasks.filter(task => task.status === 'in_progress');
            case 'completed':
                return tasks.filter(task => task.status === 'completed');
            default:
                return tasks;
        }
    }

    getTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const priorityText = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
        
        return `
            <div class="task-item ${task.priority}-priority ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                <div class="task-header">
                    <div>
                        <div class="task-title">${task.title}</div>
                        <div class="task-meta">
                            <span>Due: ${dueDate}</span>
                            <span>•</span>
                            <span>Assigned by: ${task.assignedBy || 'System'}</span>
                            ${isOverdue ? '<span class="overdue-badge">OVERDUE</span>' : ''}
                        </div>
                    </div>
                    <div class="task-priority ${priorityClass}">${priorityText}</div>
                </div>
                
                <div class="task-description">${task.description || 'No description provided'}</div>
                
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${task.progress || 0}%"></div>
                    </div>
                    <div class="progress-text">${task.progress || 0}% Complete</div>
                </div>
                
                <div class="task-actions">
                    <button class="btn btn-secondary" onclick="updateTaskStatus('${task.id}', 'in_progress')">
                        <i data-lucide="play"></i>
                        Start
                    </button>
                    <button class="btn btn-primary" onclick="updateTaskProgress('${task.id}')">
                        <i data-lucide="edit"></i>
                        Update Progress
                    </button>
                    <button class="btn btn-secondary" onclick="viewTaskDetails('${task.id}')">
                        <i data-lucide="eye"></i>
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    async loadNotifications() {
        try {
            const notificationsList = document.getElementById('notificationsList');
            if (!notificationsList) return;

            // Get user's notifications
            const userNotifications = window.TasksCalendarSystem?.getUserNotifications(this.currentUser.uid, true) || [];
            
            if (userNotifications.length === 0) {
                notificationsList.innerHTML = this.getEmptyStateHTML('notifications');
                return;
            }

            // Update notifications list
            notificationsList.innerHTML = userNotifications.map(notification => this.getNotificationHTML(notification)).join('');
            
        } catch (error) {
            console.error('Error loading notifications:', error);
            document.getElementById('notificationsList').innerHTML = this.getErrorStateHTML('notifications');
        }
    }

    getNotificationHTML(notification) {
        const isUnread = !notification.readAt;
        const timeAgo = this.getTimeAgo(notification.createdAt);
        const icon = this.getNotificationIcon(notification.type);
        
        return `
            <div class="notification-item ${isUnread ? 'unread' : ''}" data-notification-id="${notification.id}">
                <div class="notification-icon">
                    <i data-lucide="${icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                ${isUnread ? `
                    <button class="btn btn-secondary" onclick="markNotificationAsRead('${notification.id}')">
                        <i data-lucide="check"></i>
                    </button>
                ` : ''}
            </div>
        `;
    }

    getNotificationIcon(type) {
        const iconMap = {
            'task_assigned': 'list-todo',
            'bulk_task_assigned': 'list-todo',
            'calendar_invite': 'calendar',
            'mention': 'at-sign',
            'grievance_update': 'alert-triangle',
            'critical_alert': 'alert-circle'
        };
        return iconMap[type] || 'bell';
    }

    getTimeAgo(date) {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
        return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }

    async initializeCalendar() {
        try {
            this.renderCalendar();
            this.loadCalendarEvents();
        } catch (error) {
            console.error('Error initializing calendar:', error);
        }
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonthSpan = document.getElementById('currentMonth');
        
        if (!calendarGrid || !currentMonthSpan) return;

        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        // Update month display
        currentMonthSpan.textContent = this.currentMonth.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        // Generate calendar HTML
        let calendarHTML = '';
        
        // Add day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            calendarHTML += `<div class="calendar-day header">${day}</div>`;
        });

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }

        // Add days of the month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            const hasEvent = this.hasEventOnDate(date);
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}" 
                     onclick="selectCalendarDate('${date.toISOString()}')">
                    <div class="day-number">${day}</div>
                </div>
            `;
        }

        calendarGrid.innerHTML = calendarHTML;
    }

    hasEventOnDate(date) {
        const events = window.TasksCalendarSystem?.getUpcomingEvents(30) || [];
        return events.some(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.toDateString() === date.toDateString();
        });
    }

    async loadCalendarEvents() {
        try {
            const upcomingEvents = window.TasksCalendarSystem?.getUpcomingEvents(7) || [];
            // Calendar events are already loaded in the system
            // This method can be used to highlight specific events or add tooltips
        } catch (error) {
            console.error('Error loading calendar events:', error);
        }
    }

    async initializeAnalytics() {
        try {
            const ctx = document.getElementById('taskAnalyticsChart');
            if (!ctx) return;

            // Get task data for analytics
            const userTasks = window.TasksCalendarSystem?.getTasksByAssignee(this.currentUser.uid) || [];
            
            // Prepare chart data
            const chartData = this.prepareChartData(userTasks);
            
            // Create chart
            this.taskAnalyticsChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        data: chartData.data,
                        backgroundColor: [
                            '#28a745', // Completed
                            '#ffc107', // In Progress
                            '#dc3545', // Overdue
                            '#6c757d'  // Pending
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            
        } catch (error) {
            console.error('Error initializing analytics:', error);
        }
    }

    prepareChartData(tasks) {
        const completed = tasks.filter(t => t.status === 'completed').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const overdue = tasks.filter(t => 
            t.status !== 'completed' && 
            t.dueDate && 
            new Date(t.dueDate) < new Date()
        ).length;
        const pending = tasks.filter(t => t.status === 'pending').length;

        return {
            labels: ['Completed', 'In Progress', 'Overdue', 'Pending'],
            data: [completed, inProgress, overdue, pending]
        };
    }

    updateTaskStatistics(tasks) {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const overdueTasks = tasks.filter(t => 
            t.status !== 'completed' && 
            t.dueDate && 
            new Date(t.dueDate) < new Date()
        ).length;
        
        // Calculate this week's tasks
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        
        const thisWeekTasks = tasks.filter(t => {
            if (!t.dueDate) return false;
            const dueDate = new Date(t.dueDate);
            return dueDate >= startOfWeek && dueDate <= endOfWeek;
        }).length;

        // Update statistics display
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('overdueTasks').textContent = overdueTasks;
        document.getElementById('thisWeekTasks').textContent = thisWeekTasks;
    }

    setupEventListeners() {
        // Task filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.setActiveFilter(filter);
            });
        });

        // Task item clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.task-item')) {
                const taskId = e.target.closest('.task-item').getAttribute('data-task-id');
                if (taskId) {
                    this.viewTaskDetails(taskId);
                }
            }
        });
    }

    setupRealTimeListeners() {
        try {
            const db = window.Firebase?.db;
            if (!db) return;

            // Listen for task changes
            const tasksQuery = db.collection('tasks')
                .where('assignedTo', '==', this.currentUser.uid);
            
            tasksQuery.onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' || change.type === 'modified') {
                        this.loadTasks();
                    }
                });
            });

            // Listen for notification changes
            const notificationsQuery = db.collection('notifications')
                .where('targetId', '==', this.currentUser.uid);
            
            notificationsQuery.onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' || change.type === 'modified') {
                        this.loadNotifications();
                    }
                });
            });

        } catch (error) {
            console.error('Error setting up real-time listeners:', error);
        }
    }

    setActiveFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Reload tasks with new filter
        this.loadTasks();
    }

    getEmptyStateHTML(type) {
        const emptyStates = {
            tasks: `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i data-lucide="list-todo"></i>
                    </div>
                    <h3>No tasks assigned</h3>
                    <p>You don't have any tasks assigned to you yet.</p>
                    <button class="btn btn-primary" onclick="openNewTaskModal()">
                        <i data-lucide="plus"></i>
                        Create Your First Task
                    </button>
                </div>
            `,
            notifications: `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i data-lucide="bell"></i>
                    </div>
                    <h3>No notifications</h3>
                    <p>You're all caught up! No new notifications.</p>
                </div>
            `
        };
        
        return emptyStates[type] || '<div class="empty-state">No data available</div>';
    }

    getErrorStateHTML(type) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i data-lucide="alert-triangle"></i>
                </div>
                <h3>Error loading ${type}</h3>
                <p>There was an error loading your ${type}. Please try refreshing the page.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i data-lucide="refresh-cw"></i>
                    Refresh Page
                </button>
            </div>
        `;
    }
}

// Helper functions for modals
function getPriorityColor(priority) {
    switch (priority) {
        case 'urgent': return 'danger';
        case 'high': return 'warning';
        case 'medium': return 'info';
        case 'low': return 'success';
        default: return 'secondary';
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'completed': return 'success';
        case 'in-progress': return 'info';
        case 'pending': return 'warning';
        case 'overdue': return 'danger';
        default: return 'secondary';
    }
}

function getEventTypeColor(type) {
    switch (type) {
        case 'meeting': return 'primary';
        case 'training': return 'success';
        case 'audit': return 'warning';
        case 'deadline': return 'danger';
        default: return 'info';
    }
}

function populateAssigneeDropdown() {
    const assigneeSelect = document.getElementById('taskAssignee');
    if (!assigneeSelect) return;
    
    // Get users from the system
    const users = window.TasksCalendarSystem?.getUsers() || [];
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name || user.email;
        assigneeSelect.appendChild(option);
    });
}

function renderCalendarInModal() {
    const calendarContent = document.getElementById('calendarModalContent');
    if (!calendarContent) return;
    
    // Render a simplified calendar view
    calendarContent.innerHTML = `
        <div class="text-center">
            <h4>Calendar View</h4>
            <p class="text-muted">Calendar functionality will be rendered here</p>
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-outline-primary" onclick="previousMonth()">
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
                <button type="button" class="btn btn-outline-primary" onclick="nextMonth()">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
}

// Initialize Tasks Dashboard
window.tasksDashboard = new TasksDashboard();

// Global functions for HTML onclick handlers
window.openNewTaskModal = function() {
    // Create and show new task modal
    const modalHtml = `
        <div class="modal fade" id="newTaskModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-plus me-2"></i>Create New Task
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="newTaskForm">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="mb-3">
                                        <label for="taskTitle" class="form-label">Task Title *</label>
                                        <input type="text" class="form-control" id="taskTitle" required>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="taskPriority" class="form-label">Priority</label>
                                        <select class="form-select" id="taskPriority">
                                            <option value="low">Low</option>
                                            <option value="medium" selected>Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="taskAssignee" class="form-label">Assignee</label>
                                        <select class="form-select" id="taskAssignee">
                                            <option value="">Select Assignee</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="taskDueDate" class="form-label">Due Date</label>
                                        <input type="date" class="form-control" id="taskDueDate">
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="taskDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="taskDescription" rows="3"></textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="taskCategory" class="form-label">Category</label>
                                        <select class="form-select" id="taskCategory">
                                            <option value="compliance">Compliance</option>
                                            <option value="audit">Audit</option>
                                            <option value="training">Training</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="taskEstimatedHours" class="form-label">Estimated Hours</label>
                                        <input type="number" class="form-control" id="taskEstimatedHours" min="0" step="0.5">
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="createNewTask()">
                            <i class="fas fa-save me-2"></i>Create Task
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('newTaskModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Populate assignee dropdown
    populateAssigneeDropdown();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('newTaskModal'));
    modal.show();
};

window.openCalendarModal = function() {
    // Create and show calendar modal
    const modalHtml = `
        <div class="modal fade" id="calendarModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-calendar me-2"></i>Calendar View
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="calendarModalContent">
                            <!-- Calendar will be rendered here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('calendarModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Render calendar in modal
    renderCalendarInModal();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('calendarModal'));
    modal.show();
};

window.updateTaskStatus = async function(taskId, status) {
    try {
        await window.TasksCalendarSystem?.updateTask(taskId, { status });
        console.log(`✅ Updated task ${taskId} status to ${status}`);
    } catch (error) {
        console.error('Error updating task status:', error);
        alert('Error updating task status');
    }
};

window.updateTaskProgress = function(taskId) {
    const progress = prompt('Enter progress percentage (0-100):');
    if (progress !== null && !isNaN(progress)) {
        const progressValue = Math.min(100, Math.max(0, parseInt(progress)));
        window.TasksCalendarSystem?.updateTask(taskId, { progress: progressValue });
    }
};

window.viewTaskDetails = function(taskId) {
    // Get task data and show details modal
    const task = window.TasksCalendarSystem?.getTask(taskId);
    if (!task) {
        alert('Task not found');
        return;
    }
    
    const modalHtml = `
        <div class="modal fade" id="taskDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-tasks me-2"></i>Task Details
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h4>${task.title}</h4>
                                <p class="text-muted">${task.description || 'No description provided'}</p>
                            </div>
                            <div class="col-md-4">
                                <div class="d-flex flex-column gap-2">
                                    <span class="badge bg-${getPriorityColor(task.priority)} fs-6">${task.priority}</span>
                                    <span class="badge bg-${getStatusColor(task.status)} fs-6">${task.status}</span>
                                    <span class="badge bg-info fs-6">${task.category || 'General'}</span>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Task Information</h6>
                                <ul class="list-unstyled">
                                    <li><strong>Assignee:</strong> ${task.assignee || 'Unassigned'}</li>
                                    <li><strong>Created:</strong> ${new Date(task.createdAt).toLocaleDateString()}</li>
                                    <li><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</li>
                                    <li><strong>Estimated Hours:</strong> ${task.estimatedHours || 'Not specified'}</li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h6>Progress</h6>
                                <div class="progress mb-3" style="height: 25px;">
                                    <div class="progress-bar bg-success" role="progressbar" style="width: ${task.progress || 0}%">
                                        ${task.progress || 0}%
                                    </div>
                                </div>
                                <p><strong>Status:</strong> ${task.status}</p>
                                <p><strong>Last Updated:</strong> ${new Date(task.updatedAt || task.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        ${task.attachments && task.attachments.length > 0 ? `
                        <hr>
                        <h6>Attachments</h6>
                        <div class="row">
                            ${task.attachments.map(attachment => `
                                <div class="col-md-4 mb-2">
                                    <div class="card">
                                        <div class="card-body p-2">
                                            <i class="fas fa-file me-2"></i>
                                            <small>${attachment.name}</small>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="editTask('${taskId}')">
                            <i class="fas fa-edit me-2"></i>Edit Task
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('taskDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('taskDetailsModal'));
    modal.show();
};

window.selectCalendarDate = function(dateString) {
    const date = new Date(dateString);
    console.log('Selected date:', date.toLocaleDateString());
    
    // Get events for selected date
    const events = window.TasksCalendarSystem?.getEventsForDate(date) || [];
    
    // Show events modal
    const modalHtml = `
        <div class="modal fade" id="dateEventsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-calendar-day me-2"></i>Events for ${date.toLocaleDateString()}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${events.length > 0 ? `
                            <div class="list-group">
                                ${events.map(event => `
                                    <div class="list-group-item">
                                        <div class="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h6 class="mb-1">${event.title}</h6>
                                                <p class="mb-1 text-muted">${event.description || 'No description'}</p>
                                                <small class="text-muted">
                                                    <i class="fas fa-clock me-1"></i>
                                                    ${event.startTime ? new Date(event.startTime).toLocaleTimeString() : 'All day'}
                                                </small>
                                            </div>
                                            <div>
                                                <span class="badge bg-${getEventTypeColor(event.type)}">${event.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="text-center text-muted py-4">
                                <i class="fas fa-calendar-times fa-3x mb-3"></i>
                                <h5>No Events</h5>
                                <p>No events scheduled for this date.</p>
                                <button class="btn btn-primary" onclick="createEventForDate('${dateString}')">
                                    <i class="fas fa-plus me-2"></i>Add Event
                                </button>
                            </div>
                        `}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        ${events.length > 0 ? `
                            <button type="button" class="btn btn-primary" onclick="exportDateEvents('${dateString}')">
                                <i class="fas fa-download me-2"></i>Export Events
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('dateEventsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('dateEventsModal'));
    modal.show();
};

window.previousMonth = function() {
    window.tasksDashboard.currentMonth.setMonth(window.tasksDashboard.currentMonth.getMonth() - 1);
    window.tasksDashboard.renderCalendar();
    window.tasksDashboard.loadCalendarEvents();
};

window.nextMonth = function() {
    window.tasksDashboard.currentMonth.setMonth(window.tasksDashboard.currentMonth.getMonth() + 1);
    window.tasksDashboard.renderCalendar();
    window.tasksDashboard.loadCalendarEvents();
};

window.markNotificationAsRead = async function(notificationId) {
    try {
        await window.TasksCalendarSystem?.markNotificationAsRead(notificationId);
        console.log(`✅ Marked notification ${notificationId} as read`);
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

window.markAllAsRead = async function() {
    try {
        const unreadNotifications = window.TasksCalendarSystem?.getUserNotifications(
            window.tasksDashboard.currentUser.uid, 
            true
        ) || [];
        
        for (const notification of unreadNotifications) {
            await window.TasksCalendarSystem?.markNotificationAsRead(notification.id);
        }
        
        console.log(`✅ Marked ${unreadNotifications.length} notifications as read`);
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
};

window.exportTaskReport = async function() {
    try {
        const factoryId = window.tasksDashboard.currentUser.factoryId || 'default';
        const dateRange = {
            start: new Date(new Date().setDate(new Date().getDate() - 30)),
            end: new Date()
        };
        
        const report = await window.TasksCalendarSystem?.generateTaskReport(factoryId, dateRange);
        
        // Create downloadable report
        const reportBlob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const reportUrl = URL.createObjectURL(reportBlob);
        
        const link = document.createElement('a');
        link.href = reportUrl;
        link.download = `task-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(reportUrl);
        console.log('✅ Task report exported');
    } catch (error) {
        console.error('Error exporting task report:', error);
        alert('Error exporting task report');
    }
};
