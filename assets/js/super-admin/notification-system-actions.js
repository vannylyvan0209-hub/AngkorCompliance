// Notification System Actions for Super Admin
class NotificationSystemActions {
    constructor(core) {
        this.core = core;
    }
    
    async markAllAsRead() {
        try {
            this.core.showNotification('info', 'Marking all notifications as read...');
            
            // Simulate marking all as read
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update all notifications to read
            this.core.notifications.forEach(notification => {
                notification.isRead = true;
            });
            
            this.core.updateOverviewStats();
            this.core.renderNotifications();
            
            this.core.showNotification('success', 'All notifications marked as read');
            
        } catch (error) {
            console.error('Error marking all as read:', error);
            this.core.showNotification('error', 'Failed to mark all notifications as read');
        }
    }
    
    async sendNotification() {
        this.core.showNotification('info', 'Opening notification composer...');
        
        // Simulate opening notification composer
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.showNotificationComposer();
    }
    
    showNotificationComposer() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: var(--radius-2xl);
                padding: var(--space-6);
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-4);
                ">
                    <h3 style="font-size: var(--text-lg); font-weight: 600; color: var(--neutral-900);">
                        Send Notification
                    </h3>
                    <button onclick="this.closest('.modal-overlay').remove()" style="
                        background: none;
                        border: none;
                        font-size: var(--text-xl);
                        cursor: pointer;
                        color: var(--neutral-500);
                    ">×</button>
                </div>
                <div class="modal-body">
                    <form id="notificationForm">
                        <div style="margin-bottom: var(--space-4);">
                            <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                Title
                            </label>
                            <input type="text" id="notificationTitle" required style="
                                width: 100%;
                                padding: var(--space-3);
                                border: 1px solid var(--neutral-200);
                                border-radius: var(--radius-md);
                                font-size: var(--text-sm);
                            " placeholder="Enter notification title">
                        </div>
                        
                        <div style="margin-bottom: var(--space-4);">
                            <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                Content
                            </label>
                            <textarea id="notificationContent" required style="
                                width: 100%;
                                padding: var(--space-3);
                                border: 1px solid var(--neutral-200);
                                border-radius: var(--radius-md);
                                font-size: var(--text-sm);
                                min-height: 100px;
                                resize: vertical;
                            " placeholder="Enter notification content"></textarea>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
                            <div>
                                <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                    Type
                                </label>
                                <select id="notificationType" style="
                                    width: 100%;
                                    padding: var(--space-3);
                                    border: 1px solid var(--neutral-200);
                                    border-radius: var(--radius-md);
                                    font-size: var(--text-sm);
                                ">
                                    <option value="system">System</option>
                                    <option value="security">Security</option>
                                    <option value="compliance">Compliance</option>
                                    <option value="performance">Performance</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                    Priority
                                </label>
                                <select id="notificationPriority" style="
                                    width: 100%;
                                    padding: var(--space-3);
                                    border: 1px solid var(--neutral-200);
                                    border-radius: var(--radius-md);
                                    font-size: var(--text-sm);
                                ">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: var(--space-4);">
                            <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                Recipients
                            </label>
                            <select id="notificationRecipients" multiple style="
                                width: 100%;
                                padding: var(--space-3);
                                border: 1px solid var(--neutral-200);
                                border-radius: var(--radius-md);
                                font-size: var(--text-sm);
                                min-height: 80px;
                            ">
                                <option value="all">All Users</option>
                                <option value="admins">Administrators</option>
                                <option value="factory_admins">Factory Admins</option>
                                <option value="hr_staff">HR Staff</option>
                                <option value="auditors">Auditors</option>
                            </select>
                        </div>
                        
                        <div style="display: flex; gap: var(--space-3); justify-content: flex-end;">
                            <button type="button" onclick="this.closest('.modal-overlay').remove()" style="
                                padding: var(--space-3) var(--space-6);
                                border: 1px solid var(--neutral-200);
                                border-radius: var(--radius-md);
                                background: white;
                                color: var(--neutral-700);
                                font-size: var(--text-sm);
                                cursor: pointer;
                            ">Cancel</button>
                            <button type="submit" style="
                                padding: var(--space-3) var(--space-6);
                                border: none;
                                border-radius: var(--radius-md);
                                background: var(--primary-600);
                                color: white;
                                font-size: var(--text-sm);
                                cursor: pointer;
                            ">Send Notification</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        modal.querySelector('#notificationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSendNotification(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    async handleSendNotification(modal) {
        const title = modal.querySelector('#notificationTitle').value;
        const content = modal.querySelector('#notificationContent').value;
        const type = modal.querySelector('#notificationType').value;
        const priority = modal.querySelector('#notificationPriority').value;
        const recipients = Array.from(modal.querySelector('#notificationRecipients').selectedOptions).map(option => option.value);
        
        try {
            this.core.showNotification('info', 'Sending notification...');
            
            // Simulate sending notification
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create new notification
            const newNotification = {
                id: 'notif_' + Date.now(),
                title,
                content,
                type,
                priority,
                isRead: false,
                isUrgent: priority === 'urgent',
                timestamp: new Date(),
                source: 'Super Admin',
                actions: ['View Details', 'Dismiss']
            };
            
            // Add to notifications array
            this.core.notifications.unshift(newNotification);
            
            // Update UI
            this.core.updateOverviewStats();
            this.core.renderNotifications();
            
            modal.remove();
            this.core.showNotification('success', 'Notification sent successfully');
            
        } catch (error) {
            console.error('Error sending notification:', error);
            this.core.showNotification('error', 'Failed to send notification');
        }
    }
    
    async refreshNotifications() {
        try {
            this.core.showNotification('info', 'Refreshing notifications...');
            
            // Simulate refresh
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            await this.core.loadNotifications();
            this.core.updateOverviewStats();
            this.core.renderNotifications();
            
            this.core.showNotification('success', 'Notifications refreshed successfully');
            
        } catch (error) {
            console.error('Error refreshing notifications:', error);
            this.core.showNotification('error', 'Failed to refresh notifications');
        }
    }
    
    async exportNotifications() {
        try {
            this.core.showNotification('info', 'Exporting notifications...');
            
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create CSV content
            const csvContent = this.createCSVContent();
            
            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `notifications_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.core.showNotification('success', 'Notifications exported successfully');
            
        } catch (error) {
            console.error('Error exporting notifications:', error);
            this.core.showNotification('error', 'Failed to export notifications');
        }
    }
    
    createCSVContent() {
        const headers = ['Title', 'Content', 'Type', 'Priority', 'Status', 'Timestamp', 'Source'];
        const rows = this.core.notifications.map(notification => [
            notification.title,
            notification.content,
            notification.type,
            notification.priority,
            notification.isRead ? 'Read' : 'Unread',
            this.core.formatTime(notification.timestamp),
            notification.source
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }
    
    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        event.target.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
        
        this.core.currentTab = tabName;
    }
    
    async viewNotification(notificationId) {
        const notification = this.core.notifications.find(n => n.id === notificationId);
        if (!notification) return;
        
        // Mark as read if not already
        if (!notification.isRead) {
            notification.isRead = true;
            this.core.updateOverviewStats();
            this.core.renderNotifications();
        }
        
        this.showNotificationDetailsModal(notification);
    }
    
    showNotificationDetailsModal(notification) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: var(--radius-2xl);
                padding: var(--space-6);
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-4);
                ">
                    <h3 style="font-size: var(--text-lg); font-weight: 600; color: var(--neutral-900);">
                        ${notification.title}
                    </h3>
                    <button onclick="this.closest('.modal-overlay').remove()" style="
                        background: none;
                        border: none;
                        font-size: var(--text-xl);
                        cursor: pointer;
                        color: var(--neutral-500);
                    ">×</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: var(--space-4);">
                        <div style="display: flex; gap: var(--space-4); margin-bottom: var(--space-3);">
                            <div>
                                <strong>Type:</strong> 
                                <span class="notification-type ${notification.type}" style="
                                    padding: var(--space-1) var(--space-2);
                                    border-radius: var(--radius-sm);
                                    font-size: var(--text-xs);
                                    font-weight: 600;
                                    text-transform: uppercase;
                                    margin-left: var(--space-2);
                                ">${notification.type}</span>
                            </div>
                            <div>
                                <strong>Priority:</strong> ${notification.priority}
                            </div>
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Source:</strong> ${notification.source}
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Timestamp:</strong> ${this.core.formatTime(notification.timestamp)}
                        </div>
                        
                        <div style="margin-bottom: var(--space-4);">
                            <strong>Content:</strong>
                            <p style="margin-top: var(--space-2); color: var(--neutral-600); line-height: 1.6;">
                                ${notification.content}
                            </p>
                        </div>
                        
                        <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--neutral-200);">
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Available Actions
                            </h4>
                            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
                                ${notification.actions.map(action => `
                                    <button onclick="handleNotificationAction('${notification.id}', '${action}')" style="
                                        padding: var(--space-2) var(--space-3);
                                        border: 1px solid var(--neutral-200);
                                        border-radius: var(--radius-md);
                                        background: white;
                                        color: var(--neutral-700);
                                        font-size: var(--text-sm);
                                        cursor: pointer;
                                        transition: all 0.2s ease;
                                    " onmouseover="this.style.background='var(--primary-50)'; this.style.borderColor='var(--primary-200)'; this.style.color='var(--primary-700)'"
                                       onmouseout="this.style.background='white'; this.style.borderColor='var(--neutral-200)'; this.style.color='var(--neutral-700)'">
                                        ${action}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    async handleNotificationAction(notificationId, action) {
        const notification = this.core.notifications.find(n => n.id === notificationId);
        if (!notification) return;
        
        this.core.showNotification('info', `Processing action: ${action}`);
        
        // Simulate action processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        switch (action) {
            case 'Dismiss':
                this.core.notifications = this.core.notifications.filter(n => n.id !== notificationId);
                this.core.updateOverviewStats();
                this.core.renderNotifications();
                this.core.showNotification('success', 'Notification dismissed');
                break;
            case 'View Details':
                this.core.showNotification('info', 'Opening detailed view...');
                break;
            case 'Block IP':
                this.core.showNotification('success', 'IP address blocked successfully');
                break;
            case 'View Logs':
                this.core.showNotification('info', 'Opening security logs...');
                break;
            case 'Schedule Audit':
                this.core.showNotification('success', 'Audit scheduled successfully');
                break;
            case 'Approve':
                this.core.showNotification('success', 'User approved successfully');
                break;
            case 'Reject':
                this.core.showNotification('success', 'User rejected');
                break;
            case 'View Profile':
                this.core.showNotification('info', 'Opening user profile...');
                break;
            case 'View Recommendations':
                this.core.showNotification('info', 'Opening AI recommendations...');
                break;
            case 'Implement':
                this.core.showNotification('success', 'Optimization implemented');
                break;
            case 'Renew Certificate':
                this.core.showNotification('success', 'Certificate renewal initiated');
                break;
            case 'View Report':
                this.core.showNotification('info', 'Opening compliance report...');
                break;
            case 'Generate Certificate':
                this.core.showNotification('success', 'Certificate generated successfully');
                break;
            default:
                this.core.showNotification('info', `Action "${action}" processed`);
        }
    }
    
    async toggleAlertConfig(configId) {
        const config = this.core.alertConfigs.find(c => c.id === configId);
        if (!config) return;
        
        try {
            this.core.showNotification('info', `${config.isEnabled ? 'Disabling' : 'Enabling'} ${config.name}...`);
            
            // Simulate toggle
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            config.isEnabled = !config.isEnabled;
            this.core.renderAlertConfigs();
            
            this.core.showNotification('success', `${config.name} ${config.isEnabled ? 'enabled' : 'disabled'} successfully`);
            
        } catch (error) {
            console.error('Error toggling alert config:', error);
            this.core.showNotification('error', 'Failed to toggle alert configuration');
        }
    }
    
    async configureTool(toolId) {
        const tool = this.core.communicationTools.find(t => t.id === toolId);
        if (!tool) return;
        
        this.core.showNotification('info', `Opening configuration for ${tool.name}...`);
        
        // Simulate configuration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.core.showNotification('success', `${tool.name} configuration opened`);
    }
    
    async toggleTool(toolId) {
        const tool = this.core.communicationTools.find(t => t.id === toolId);
        if (!tool) return;
        
        const action = tool.status === 'active' ? 'disable' : 'enable';
        
        if (!confirm(`Are you sure you want to ${action} "${tool.name}"?`)) {
            return;
        }
        
        try {
            this.core.showNotification('info', `${action.charAt(0).toUpperCase() + action.slice(1)}ing ${tool.name}...`);
            
            // Simulate toggle
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            tool.status = tool.status === 'active' ? 'inactive' : 'active';
            this.core.renderCommunicationTools();
            
            this.core.showNotification('success', `${tool.name} ${action}d successfully`);
            
        } catch (error) {
            console.error('Error toggling tool:', error);
            this.core.showNotification('error', `Failed to ${action} tool`);
        }
    }
}

// Initialize actions when core is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.notificationSystemCore) {
            window.notificationSystemActions = new NotificationSystemActions(window.notificationSystemCore);
            
            // Override core methods with actions
            window.notificationSystemCore.markAllAsRead = () => window.notificationSystemActions.markAllAsRead();
            window.notificationSystemCore.sendNotification = () => window.notificationSystemActions.sendNotification();
            window.notificationSystemCore.refreshNotifications = () => window.notificationSystemActions.refreshNotifications();
            window.notificationSystemCore.exportNotifications = () => window.notificationSystemActions.exportNotifications();
            window.notificationSystemCore.switchTab = (tabName) => window.notificationSystemActions.switchTab(tabName);
            window.notificationSystemCore.viewNotification = (notificationId) => window.notificationSystemActions.viewNotification(notificationId);
            window.notificationSystemCore.handleNotificationAction = (notificationId, action) => window.notificationSystemActions.handleNotificationAction(notificationId, action);
            window.notificationSystemCore.toggleAlertConfig = (configId) => window.notificationSystemActions.toggleAlertConfig(configId);
            window.notificationSystemCore.configureTool = (toolId) => window.notificationSystemActions.configureTool(toolId);
            window.notificationSystemCore.toggleTool = (toolId) => window.notificationSystemActions.toggleTool(toolId);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystemActions;
}
