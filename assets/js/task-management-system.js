/**
 * Task Management System - Phase 3
 * Implements task orchestration, calendar sync, bulk assignment, and recurring tasks
 * Based on Enterprise Blueprint (v2) Section D.9
 */

class TaskManagementSystem {
    constructor() {
        this.db = window.Firebase.db;
        this.currentUser = null;
        this.currentFactory = null;
    }

    async initialize(user, factoryId) {
        this.currentUser = user;
        this.currentFactory = factoryId;
        console.log('✅ Task Management System initialized');
    }

    // Task Creation and Management
    async createTask(taskData) {
        try {
            const task = {
                id: this.generateId(),
                factoryId: this.currentFactory,
                title: taskData.title,
                description: taskData.description,
                type: taskData.type, // 'cap_action', 'audit_prep', 'permit_renewal', 'training', 'maintenance'
                priority: taskData.priority || 'medium', // 'low', 'medium', 'high', 'critical'
                status: 'pending', // 'pending', 'in_progress', 'completed', 'cancelled', 'overdue'
                assignee: taskData.assignee || null,
                assignees: taskData.assignees || [], // For bulk assignments
                dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
                startDate: taskData.startDate ? new Date(taskData.startDate) : new Date(),
                estimatedHours: taskData.estimatedHours || 1,
                actualHours: 0,
                progress: 0, // 0-100
                
                // Linked entities
                linkedCAP: taskData.linkedCAP || null,
                linkedStandard: taskData.linkedStandard || null,
                linkedPermit: taskData.linkedPermit || null,
                linkedAudit: taskData.linkedAudit || null,
                linkedDocument: taskData.linkedDocument || null,
                
                // Recurring task settings
                isRecurring: taskData.isRecurring || false,
                recurrencePattern: taskData.recurrencePattern || null, // 'daily', 'weekly', 'monthly', 'yearly'
                recurrenceInterval: taskData.recurrenceInterval || 1,
                recurrenceEndDate: taskData.recurrenceEndDate ? new Date(taskData.recurrenceEndDate) : null,
                
                // Dependencies
                dependencies: taskData.dependencies || [],
                blockers: taskData.blockers || [],
                
                // Attachments and comments
                attachments: taskData.attachments || [],
                comments: [],
                
                // Metadata
                tags: taskData.tags || [],
                category: taskData.category || 'general',
                createdBy: this.currentUser.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                completedAt: null
            };

            await this.db.collection('tasks').doc(task.id).set(task);
            
            // If recurring, create future instances
            if (task.isRecurring && task.recurrencePattern) {
                await this.createRecurringInstances(task);
            }

            return { success: true, taskId: task.id };
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    async createRecurringInstances(parentTask) {
        try {
            if (!parentTask.recurrenceEndDate) return;

            const instances = [];
            let currentDate = new Date(parentTask.startDate);
            const endDate = new Date(parentTask.recurrenceEndDate);

            while (currentDate <= endDate) {
                const instance = {
                    ...parentTask,
                    id: this.generateId(),
                    parentTaskId: parentTask.id,
                    startDate: new Date(currentDate),
                    dueDate: this.calculateDueDate(currentDate, parentTask.recurrencePattern, parentTask.recurrenceInterval),
                    status: 'pending',
                    progress: 0,
                    actualHours: 0,
                    completedAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                instances.push(instance);
                currentDate = this.getNextRecurrenceDate(currentDate, parentTask.recurrencePattern, parentTask.recurrenceInterval);
            }

            // Batch write instances
            const batch = this.db.batch();
            instances.forEach(instance => {
                const docRef = this.db.collection('tasks').doc(instance.id);
                batch.set(docRef, instance);
            });
            await batch.commit();

            return instances.length;
        } catch (error) {
            console.error('Error creating recurring instances:', error);
            throw error;
        }
    }

    calculateDueDate(startDate, pattern, interval) {
        const dueDate = new Date(startDate);
        switch (pattern) {
            case 'daily':
                dueDate.setDate(dueDate.getDate() + interval);
                break;
            case 'weekly':
                dueDate.setDate(dueDate.getDate() + (interval * 7));
                break;
            case 'monthly':
                dueDate.setMonth(dueDate.getMonth() + interval);
                break;
            case 'yearly':
                dueDate.setFullYear(dueDate.getFullYear() + interval);
                break;
        }
        return dueDate;
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

    // Bulk Task Assignment
    async bulkAssignTasks(taskIds, assignees, options = {}) {
        try {
            const batch = this.db.batch();
            const updates = [];

            for (const taskId of taskIds) {
                const taskRef = this.db.collection('tasks').doc(taskId);
                const update = {
                    assignees: assignees,
                    assignee: assignees.length === 1 ? assignees[0] : null,
                    updatedAt: new Date()
                };

                if (options.priority) update.priority = options.priority;
                if (options.dueDate) update.dueDate = new Date(options.dueDate);

                batch.update(taskRef, update);
                updates.push({ taskId, update });
            }

            await batch.commit();
            return { success: true, updatedTasks: updates.length };
        } catch (error) {
            console.error('Error bulk assigning tasks:', error);
            throw error;
        }
    }

    // Task Updates and Progress Tracking
    async updateTaskProgress(taskId, progress, actualHours = null, comment = null) {
        try {
            const taskRef = this.db.collection('tasks').doc(taskId);
            const task = await taskRef.get();

            if (!task.exists) throw new Error('Task not found');

            const taskData = task.data();
            const updates = {
                progress: Math.min(100, Math.max(0, progress)),
                updatedAt: new Date()
            };

            if (actualHours !== null) {
                updates.actualHours = actualHours;
            }

            // Update status based on progress
            if (progress >= 100) {
                updates.status = 'completed';
                updates.completedAt = new Date();
            } else if (progress > 0) {
                updates.status = 'in_progress';
            }

            // Add comment if provided
            if (comment) {
                const newComment = {
                    id: this.generateId(),
                    text: comment,
                    author: this.currentUser.id,
                    timestamp: new Date()
                };
                updates.comments = [...(taskData.comments || []), newComment];
            }

            await taskRef.update(updates);
            return { success: true };
        } catch (error) {
            console.error('Error updating task progress:', error);
            throw error;
        }
    }

    async addTaskComment(taskId, comment) {
        try {
            const taskRef = this.db.collection('tasks').doc(taskId);
            const task = await taskRef.get();

            if (!task.exists) throw new Error('Task not found');

            const taskData = task.data();
            const newComment = {
                id: this.generateId(),
                text: comment,
                author: this.currentUser.id,
                timestamp: new Date()
            };

            await taskRef.update({
                comments: [...(taskData.comments || []), newComment],
                updatedAt: new Date()
            });

            return { success: true, commentId: newComment.id };
        } catch (error) {
            console.error('Error adding task comment:', error);
            throw error;
        }
    }

    // Task Dependencies and Blockers
    async addTaskDependency(taskId, dependencyTaskId) {
        try {
            const taskRef = this.db.collection('tasks').doc(taskId);
            const task = await taskRef.get();

            if (!task.exists) throw new Error('Task not found');

            const taskData = task.data();
            const dependencies = [...(taskData.dependencies || []), dependencyTaskId];

            await taskRef.update({
                dependencies: dependencies,
                updatedAt: new Date()
            });

            return { success: true };
        } catch (error) {
            console.error('Error adding task dependency:', error);
            throw error;
        }
    }

    async addTaskBlocker(taskId, blockerDescription) {
        try {
            const taskRef = this.db.collection('tasks').doc(taskId);
            const task = await taskRef.get();

            if (!task.exists) throw new Error('Task not found');

            const taskData = task.data();
            const newBlocker = {
                id: this.generateId(),
                description: blockerDescription,
                reportedBy: this.currentUser.id,
                reportedAt: new Date(),
                resolved: false,
                resolvedAt: null,
                resolvedBy: null
            };

            const blockers = [...(taskData.blockers || []), newBlocker];

            await taskRef.update({
                blockers: blockers,
                status: 'blocked',
                updatedAt: new Date()
            });

            return { success: true, blockerId: newBlocker.id };
        } catch (error) {
            console.error('Error adding task blocker:', error);
            throw error;
        }
    }

    async resolveTaskBlocker(taskId, blockerId, resolution = null) {
        try {
            const taskRef = this.db.collection('tasks').doc(taskId);
            const task = await taskRef.get();

            if (!task.exists) throw new Error('Task not found');

            const taskData = task.data();
            const blockers = taskData.blockers.map(blocker => {
                if (blocker.id === blockerId) {
                    return {
                        ...blocker,
                        resolved: true,
                        resolvedAt: new Date(),
                        resolvedBy: this.currentUser.id,
                        resolution: resolution
                    };
                }
                return blocker;
            });

            // Check if all blockers are resolved
            const allResolved = blockers.every(blocker => blocker.resolved);
            const newStatus = allResolved ? 'pending' : 'blocked';

            await taskRef.update({
                blockers: blockers,
                status: newStatus,
                updatedAt: new Date()
            });

            return { success: true };
        } catch (error) {
            console.error('Error resolving task blocker:', error);
            throw error;
        }
    }

    // Task Queries and Filtering
    async getTasks(filters = {}, options = {}) {
        try {
            let query = this.db.collection('tasks')
                .where('factoryId', '==', this.currentFactory);

            // Apply filters
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }
            if (filters.priority) {
                query = query.where('priority', '==', filters.priority);
            }
            if (filters.type) {
                query = query.where('type', '==', filters.type);
            }
            if (filters.assignee) {
                query = query.where('assignee', '==', filters.assignee);
            }
            if (filters.category) {
                query = query.where('category', '==', filters.category);
            }

            // Apply date filters
            if (filters.dueDateFrom) {
                query = query.where('dueDate', '>=', new Date(filters.dueDateFrom));
            }
            if (filters.dueDateTo) {
                query = query.where('dueDate', '<=', new Date(filters.dueDateTo));
            }

            // Apply sorting
            if (options.sortBy) {
                query = query.orderBy(options.sortBy, options.sortOrder || 'asc');
            } else {
                query = query.orderBy('dueDate', 'asc');
            }

            // Apply pagination
            if (options.limit) {
                query = query.limit(options.limit);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting tasks:', error);
            throw error;
        }
    }

    async getOverdueTasks() {
        try {
            const now = new Date();
            const query = this.db.collection('tasks')
                .where('factoryId', '==', this.currentFactory)
                .where('dueDate', '<', now)
                .where('status', 'in', ['pending', 'in_progress']);

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting overdue tasks:', error);
            throw error;
        }
    }

    async getTasksByAssignee(assigneeId) {
        try {
            const query = this.db.collection('tasks')
                .where('factoryId', '==', this.currentFactory)
                .where('assignee', '==', assigneeId)
                .orderBy('dueDate', 'asc');

            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting tasks by assignee:', error);
            throw error;
        }
    }

    // Task Analytics and Reporting
    async getTaskAnalytics(filters = {}) {
        try {
            const tasks = await this.getTasks(filters);
            
            const analytics = {
                total: tasks.length,
                byStatus: {},
                byPriority: {},
                byType: {},
                overdue: 0,
                completed: 0,
                inProgress: 0,
                averageProgress: 0,
                totalEstimatedHours: 0,
                totalActualHours: 0
            };

            let totalProgress = 0;
            const now = new Date();

            tasks.forEach(task => {
                // Status breakdown
                analytics.byStatus[task.status] = (analytics.byStatus[task.status] || 0) + 1;
                
                // Priority breakdown
                analytics.byPriority[task.priority] = (analytics.byPriority[task.priority] || 0) + 1;
                
                // Type breakdown
                analytics.byType[task.type] = (analytics.byType[task.type] || 0) + 1;
                
                // Overdue tasks
                if (task.dueDate && task.dueDate < now && task.status !== 'completed') {
                    analytics.overdue++;
                }
                
                // Completed tasks
                if (task.status === 'completed') {
                    analytics.completed++;
                }
                
                // In progress tasks
                if (task.status === 'in_progress') {
                    analytics.inProgress++;
                }
                
                // Progress tracking
                totalProgress += task.progress || 0;
                analytics.totalEstimatedHours += task.estimatedHours || 0;
                analytics.totalActualHours += task.actualHours || 0;
            });

            analytics.averageProgress = tasks.length > 0 ? Math.round(totalProgress / tasks.length) : 0;

            return analytics;
        } catch (error) {
            console.error('Error getting task analytics:', error);
            throw error;
        }
    }

    // Calendar Integration
    async generateCalendarEvents(tasks, options = {}) {
        try {
            const events = [];
            
            tasks.forEach(task => {
                if (task.dueDate) {
                    const event = {
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        start: task.startDate,
                        end: task.dueDate,
                        allDay: false,
                        color: this.getTaskColor(task.priority, task.status),
                        type: 'task',
                        taskId: task.id,
                        assignee: task.assignee,
                        priority: task.priority,
                        status: task.status
                    };
                    
                    events.push(event);
                }
            });

            return events;
        } catch (error) {
            console.error('Error generating calendar events:', error);
            throw error;
        }
    }

    getTaskColor(priority, status) {
        if (status === 'completed') return '#28a745';
        if (status === 'overdue') return '#dc3545';
        
        switch (priority) {
            case 'critical': return '#dc3545';
            case 'high': return '#fd7e14';
            case 'medium': return '#ffc107';
            case 'low': return '#6c757d';
            default: return '#007bff';
        }
    }

    // Utility Methods
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async deleteTask(taskId) {
        try {
            await this.db.collection('tasks').doc(taskId).delete();
            return { success: true };
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    async duplicateTask(taskId, newAssignee = null) {
        try {
            const task = await this.db.collection('tasks').doc(taskId).get();
            if (!task.exists) throw new Error('Task not found');

            const taskData = task.data();
            const newTask = {
                ...taskData,
                id: this.generateId(),
                assignee: newAssignee || taskData.assignee,
                status: 'pending',
                progress: 0,
                actualHours: 0,
                completedAt: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            delete newTask.id; // Remove the old ID
            await this.db.collection('tasks').doc(newTask.id).set(newTask);
            return { success: true, taskId: newTask.id };
        } catch (error) {
            console.error('Error duplicating task:', error);
            throw error;
        }
    }
}

window.TaskManagementSystem = TaskManagementSystem;

