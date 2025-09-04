/**
 * Task Orchestration System - Angkor Compliance Platform
 */

class TaskOrchestrationSystem {
    constructor() {
        this.tasks = [];
        this.caps = [];
        this.users = [];
        this.departments = [];
        this.workflows = [];
        this.dependencies = [];
        
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.loadInitialData();
        this.updateTaskCounts();
    }

    initializeEventListeners() {
        document.getElementById('saveTaskBtn')?.addEventListener('click', () => this.createTask());
        document.getElementById('executeBulkOperationBtn')?.addEventListener('click', () => this.executeBulkOperation());
        document.getElementById('bulkOperationType')?.addEventListener('change', (e) => this.handleBulkOperationChange(e));
        document.getElementById('linkTaskBtn')?.addEventListener('click', () => this.linkTaskToCAP());
        document.getElementById('saveWorkflowBtn')?.addEventListener('click', () => this.saveWorkflow());
        document.getElementById('addWorkflowStep')?.addEventListener('click', () => this.addWorkflowStep());
        document.getElementById('saveDependencyBtn')?.addEventListener('click', () => this.saveDependency());
    }

    async loadInitialData() {
        try {
            await this.loadSampleData();
            this.populateDropdowns();
            this.renderTasksTable();
            this.renderCAPTasksTable();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Error loading data', 'error');
        }
    }

    async loadSampleData() {
        this.tasks = [
            {
                id: 'T001',
                title: 'Update Safety Procedures',
                type: 'compliance',
                priority: 'high',
                assignee: 'John Smith',
                department: 'Safety',
                dueDate: '2024-02-15',
                status: 'pending',
                progress: 25,
                estimatedHours: 8,
                capLink: 'CAP001',
                description: 'Update safety procedures according to new ISO 45001 requirements'
            },
            {
                id: 'T002',
                title: 'Conduct Fire Safety Training',
                type: 'training',
                priority: 'medium',
                assignee: 'Sarah Johnson',
                department: 'Training',
                dueDate: '2024-02-20',
                status: 'pending',
                progress: 0,
                estimatedHours: 4,
                capLink: 'CAP002',
                description: 'Conduct fire safety training for all production staff'
            }
        ];

        this.caps = [
            { id: 'CAP001', title: 'Safety Procedure Update', status: 'in_progress' },
            { id: 'CAP002', title: 'Fire Safety Training Implementation', status: 'planned' }
        ];

        this.users = [
            { id: 'U001', name: 'John Smith', department: 'Safety', role: 'Safety Manager' },
            { id: 'U002', name: 'Sarah Johnson', department: 'Training', role: 'Training Coordinator' }
        ];

        this.departments = ['Safety', 'Training', 'Quality', 'Maintenance', 'Production', 'HR'];
    }

    populateDropdowns() {
        const assigneeSelects = ['taskAssignee', 'bulkAssignee', 'linkTaskSelect', 'dependentTask'];
        assigneeSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Select Assignee</option>';
                this.users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${user.name} (${user.role})`;
                    select.appendChild(option);
                });
            }
        });

        const deptSelects = ['taskDepartment'];
        deptSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Select Department</option>';
                this.departments.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept;
                    option.textContent = dept;
                    select.appendChild(option);
                });
            }
        });

        const capSelects = ['taskCAPLink', 'linkCAPSelect', 'capFilter'];
        capSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Select CAP</option>';
                this.caps.forEach(cap => {
                    const option = document.createElement('option');
                    option.value = cap.id;
                    option.textContent = `${cap.id} - ${cap.title}`;
                    select.appendChild(option);
                });
            }
        });
    }

    renderTasksTable() {
        const tbody = document.getElementById('tasksTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.tasks.forEach(task => {
            const row = this.createTaskRow(task);
            tbody.appendChild(row);
        });
    }

    createTaskRow(task) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div>
                    <strong>${task.title}</strong>
                    <br><small class="text-muted">${task.description}</small>
                </div>
            </td>
            <td><span class="badge bg-secondary">${task.type}</span></td>
            <td><span class="badge bg-${this.getPriorityColor(task.priority)}">${task.priority}</span></td>
            <td>${task.assignee}</td>
            <td><span class="${this.isOverdue(task.dueDate) ? 'text-danger' : ''}">${task.dueDate}</span></td>
            <td><span class="badge bg-${this.getStatusColor(task.status)}">${task.status}</span></td>
            <td>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar" role="progressbar" style="width: ${task.progress}%">${task.progress}%</div>
                </div>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="taskSystem.editTask('${task.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="taskSystem.updateTaskProgress('${task.id}')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="taskSystem.deleteTask('${task.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        return row;
    }

    renderCAPTasksTable() {
        const tbody = document.getElementById('capTasksTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const capTasks = this.tasks.filter(task => task.capLink);
        
        capTasks.forEach(task => {
            const cap = this.caps.find(c => c.id === task.capLink);
            const row = this.createCAPTaskRow(task, cap);
            tbody.appendChild(row);
        });
    }

    createCAPTaskRow(task, cap) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div>
                    <strong>${task.title}</strong>
                    <br><small class="text-muted">${task.description}</small>
                </div>
            </td>
            <td>
                <span class="badge bg-info">${cap?.id || 'N/A'}</span>
                <br><small>${cap?.title || 'N/A'}</small>
            </td>
            <td><span class="badge bg-secondary">Requirement</span></td>
            <td><span class="badge bg-${this.getPriorityColor(task.priority)}">${task.priority}</span></td>
            <td><span class="${this.isOverdue(task.dueDate) ? 'text-danger' : ''}">${task.dueDate}</span></td>
            <td><span class="badge bg-${this.getStatusColor(task.status)}">${task.status}</span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="taskSystem.viewCAPDetails('${task.capLink}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="taskSystem.updateTaskProgress('${task.id}')">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            </td>
        `;
        return row;
    }

    updateTaskCounts() {
        const total = this.tasks.length;
        const pending = this.tasks.filter(t => t.status === 'pending').length;
        const completed = this.tasks.filter(t => t.status === 'completed').length;
        const overdue = this.tasks.filter(t => this.isOverdue(t.dueDate)).length;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('overdueTasks').textContent = overdue;
    }

    async createTask() {
        const form = document.getElementById('createTaskForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const taskData = {
            id: `T${String(this.tasks.length + 1).padStart(3, '0')}`,
            title: document.getElementById('taskTitle').value,
            type: document.getElementById('taskType').value,
            priority: document.getElementById('taskPriority').value,
            assignee: document.getElementById('taskAssignee').value,
            department: document.getElementById('taskDepartment').value,
            dueDate: document.getElementById('taskDueDate').value,
            status: 'pending',
            progress: 0,
            estimatedHours: parseFloat(document.getElementById('taskEstimatedHours').value) || 0,
            capLink: document.getElementById('taskCAPLink').value,
            description: document.getElementById('taskDescription').value
        };

        try {
            this.tasks.push(taskData);
            this.renderTasksTable();
            this.renderCAPTasksTable();
            this.updateTaskCounts();
            this.populateDropdowns();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('createTaskModal'));
            modal.hide();
            this.showNotification('Task created successfully', 'success');
            form.reset();
        } catch (error) {
            console.error('Error creating task:', error);
            this.showNotification('Error creating task', 'error');
        }
    }

    async executeBulkOperation() {
        const operationType = document.getElementById('bulkOperationType').value;
        const target = document.getElementById('bulkTaskTarget').value;
        
        let targetTasks = this.tasks.map(t => t.id);

        if (targetTasks.length === 0) {
            this.showNotification('No tasks selected for operation', 'warning');
            return;
        }

        try {
            switch (operationType) {
                case 'assign':
                    await this.bulkAssignTasks(targetTasks);
                    break;
                case 'update':
                    await this.bulkUpdateTasks(targetTasks);
                    break;
                case 'delete':
                    await this.bulkDeleteTasks(targetTasks);
                    break;
                case 'export':
                    await this.exportTasks(targetTasks);
                    break;
            }
        } catch (error) {
            console.error('Error executing bulk operation:', error);
            this.showNotification('Error executing bulk operation', 'error');
        }
    }

    async bulkAssignTasks(taskIds) {
        const assignee = document.getElementById('bulkAssignee').value;
        const dueDate = document.getElementById('bulkDueDate').value;

        if (!assignee) {
            this.showNotification('Please select an assignee', 'warning');
            return;
        }

        taskIds.forEach(taskId => {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.assignee = this.users.find(u => u.id === assignee)?.name || assignee;
                if (dueDate) task.dueDate = dueDate;
            }
        });

        this.renderTasksTable();
        this.renderCAPTasksTable();
        this.showNotification(`${taskIds.length} tasks assigned successfully`, 'success');
    }

    async bulkUpdateTasks(taskIds) {
        const field = document.getElementById('bulkUpdateField').value;
        const value = document.getElementById('bulkUpdateValue').value;

        if (!value) {
            this.showNotification('Please enter a new value', 'warning');
            return;
        }

        taskIds.forEach(taskId => {
            const task = this.tasks.find(t => t.id === taskId);
            if (task && task.hasOwnProperty(field)) {
                task[field] = value;
            }
        });

        this.renderTasksTable();
        this.renderCAPTasksTable();
        this.showNotification(`${taskIds.length} tasks updated successfully`, 'success');
    }

    async bulkDeleteTasks(taskIds) {
        if (!confirm(`Are you sure you want to delete ${taskIds.length} tasks?`)) {
            return;
        }

        taskIds.forEach(taskId => {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
        });

        this.renderTasksTable();
        this.renderCAPTasksTable();
        this.updateTaskCounts();
        this.showNotification(`${taskIds.length} tasks deleted successfully`, 'success');
    }

    async exportTasks(taskIds) {
        const tasksToExport = this.tasks.filter(t => taskIds.includes(t.id));
        
        let csv = 'Task ID,Title,Type,Priority,Assignee,Department,Due Date,Status,Progress,CAP Link\n';
        tasksToExport.forEach(task => {
            csv += `${task.id},"${task.title}",${task.type},${task.priority},${task.assignee},${task.department},${task.dueDate},${task.status},${task.progress},${task.capLink}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('Tasks exported successfully', 'success');
    }

    async linkTaskToCAP() {
        const taskId = document.getElementById('linkTaskSelect').value;
        const capId = document.getElementById('linkCAPSelect').value;
        const linkType = document.getElementById('linkType').value;

        if (!taskId || !capId) {
            this.showNotification('Please select both task and CAP', 'warning');
            return;
        }

        try {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.capLink = capId;
                this.renderTasksTable();
                this.renderCAPTasksTable();
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('linkTaskToCAPModal'));
                modal.hide();
                this.showNotification('Task linked to CAP successfully', 'success');
                document.getElementById('linkTaskForm').reset();
            }
        } catch (error) {
            console.error('Error linking task to CAP:', error);
            this.showNotification('Error linking task to CAP', 'error');
        }
    }

    async saveWorkflow() {
        const name = document.getElementById('workflowName').value;
        const type = document.getElementById('workflowType').value;

        if (!name) {
            this.showNotification('Please enter workflow name', 'warning');
            return;
        }

        try {
            const workflow = {
                id: `WF${String(this.workflows.length + 1).padStart(3, '0')}`,
                name,
                type,
                steps: []
            };

            this.workflows.push(workflow);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('createWorkflowModal'));
            modal.hide();
            this.showNotification('Workflow created successfully', 'success');
            document.getElementById('workflowName').value = '';
            document.getElementById('workflowSteps').innerHTML = '';
        } catch (error) {
            console.error('Error creating workflow:', error);
            this.showNotification('Error creating workflow', 'error');
        }
    }

    addWorkflowStep() {
        const stepsContainer = document.getElementById('workflowSteps');
        const stepNumber = stepsContainer.children.length + 1;
        
        const stepDiv = document.createElement('div');
        stepDiv.className = 'workflow-step mb-2 p-2 border rounded';
        stepDiv.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <input type="text" class="form-control step-name-input" placeholder="Step ${stepNumber} Name" value="Step ${stepNumber}">
                </div>
                <div class="col-md-3">
                    <input type="text" class="form-control step-role-input" placeholder="Role" value="User">
                </div>
                <div class="col-md-3">
                    <input type="text" class="form-control step-duration-input" placeholder="Duration" value="1 day">
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        stepsContainer.appendChild(stepDiv);
    }

    async saveDependency() {
        const fromTask = document.getElementById('dependencyTask').value;
        const toTask = document.getElementById('dependentTask').value;
        const type = document.getElementById('dependencyType').value;
        const critical = document.getElementById('criticalPath').checked;

        if (!fromTask || !toTask) {
            this.showNotification('Please select both tasks', 'warning');
            return;
        }

        if (fromTask === toTask) {
            this.showNotification('A task cannot depend on itself', 'warning');
            return;
        }

        try {
            const dependency = { from: fromTask, to: toTask, type, critical };
            this.dependencies.push(dependency);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('manageDependenciesModal'));
            modal.hide();
            this.showNotification('Dependency saved successfully', 'success');
            document.getElementById('manageDependenciesModal').querySelector('form').reset();
        } catch (error) {
            console.error('Error saving dependency:', error);
            this.showNotification('Error saving dependency', 'error');
        }
    }

    handleBulkOperationChange(event) {
        const operationType = event.target.value;
        const assignSection = document.getElementById('bulkAssignSection');
        const updateSection = document.getElementById('bulkUpdateSection');
        const infoElement = document.getElementById('bulkOperationInfo');

        assignSection.style.display = 'none';
        updateSection.style.display = 'none';

        switch (operationType) {
            case 'assign':
                assignSection.style.display = 'block';
                infoElement.textContent = 'Select assignee and due date for bulk assignment';
                break;
            case 'update':
                updateSection.style.display = 'block';
                infoElement.textContent = 'Select field and new value for bulk update';
                break;
            case 'delete':
                infoElement.textContent = 'This will permanently delete selected tasks';
                break;
            case 'export':
                infoElement.textContent = 'Export selected tasks to CSV format';
                break;
        }
    }

    getPriorityColor(priority) {
        const colors = { low: 'success', medium: 'warning', high: 'danger', critical: 'dark' };
        return colors[priority] || 'secondary';
    }

    getStatusColor(status) {
        const colors = { pending: 'warning', in_progress: 'info', completed: 'success', overdue: 'danger' };
        return colors[status] || 'secondary';
    }

    isOverdue(dueDate) {
        return new Date(dueDate) < new Date();
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

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.showNotification(`Edit mode for task: ${task.title}`, 'info');
        }
    }

    updateTaskProgress(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const newProgress = Math.min(task.progress + 25, 100);
            task.progress = newProgress;
            
            if (newProgress === 100) {
                task.status = 'completed';
            }
            
            this.renderTasksTable();
            this.renderCAPTasksTable();
            this.updateTaskCounts();
            this.showNotification(`Task progress updated: ${newProgress}%`, 'success');
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.renderTasksTable();
            this.renderCAPTasksTable();
            this.updateTaskCounts();
            this.showNotification('Task deleted successfully', 'success');
        }
    }

    viewCAPDetails(capId) {
        const cap = this.caps.find(c => c.id === capId);
        if (cap) {
            this.showNotification(`Viewing CAP: ${cap.title}`, 'info');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.taskSystem = new TaskOrchestrationSystem();
});
