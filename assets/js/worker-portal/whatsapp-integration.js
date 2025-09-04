// WhatsApp Integration System
class WhatsAppIntegrationSystem {
    constructor() {
        this.currentUser = null;
        this.chats = [];
        this.currentChat = null;
        this.messages = [];
        this.templates = [];
        this.connectionStatus = 'connected';
        this.whatsappAPI = null;
        
        this.initializeSystem();
    }

    async initializeSystem() {
        try {
            // Initialize Firebase
            await this.initializeFirebase();
            
            // Check authentication
            await this.checkAuthentication();
            
            // Initialize WhatsApp API
            await this.initializeWhatsAppAPI();
            
            // Initialize UI components
            this.initializeUI();
            
            // Load chats and templates
            await this.loadChats();
            await this.loadTemplates();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update statistics
            this.updateStatistics();
            
            console.log('WhatsApp Integration System initialized successfully');
        } catch (error) {
            console.error('Error initializing WhatsApp Integration System:', error);
            this.showNotification('Error initializing system', 'error');
        }
    }

    async initializeFirebase() {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase not loaded');
        }
        
        this.db = firebase.firestore();
        this.storage = firebase.storage();
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    console.log('User authenticated:', user.email);
                    resolve(user);
                } else {
                    console.log('No user authenticated');
                    reject(new Error('User not authenticated'));
                }
            });
        });
    }

    async initializeWhatsAppAPI() {
        // Simulate WhatsApp Business API initialization
        this.whatsappAPI = {
            isConnected: true,
            phoneNumber: '+855123456789',
            businessName: 'Angkor Compliance Platform',
            sendMessage: async (to, message) => {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { success: true, messageId: Date.now().toString() };
            },
            sendTemplate: async (to, templateName, variables) => {
                // Simulate template message
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { success: true, messageId: Date.now().toString() };
            },
            getChats: async () => {
                // Simulate getting chats
                await new Promise(resolve => setTimeout(resolve, 500));
                return this.chats;
            }
        };
        
        this.updateConnectionStatus();
    }

    initializeUI() {
        // Initialize message input
        this.initializeMessageInput();
        
        // Initialize chat selection
        this.initializeChatSelection();
        
        // Initialize template selection
        this.initializeTemplateSelection();
    }

    initializeMessageInput() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            messageInput.addEventListener('input', () => {
                sendButton.disabled = !messageInput.value.trim();
            });
        }
        
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }
    }

    initializeChatSelection() {
        const chatList = document.getElementById('chatList');
        if (chatList) {
            chatList.addEventListener('click', (e) => {
                const chatItem = e.target.closest('.chat-item');
                if (chatItem) {
                    const chatId = chatItem.dataset.chatId;
                    this.selectChat(chatId);
                }
            });
        }
    }

    initializeTemplateSelection() {
        const templateList = document.getElementById('templateList');
        if (templateList) {
            templateList.addEventListener('click', (e) => {
                const templateItem = e.target.closest('.template-item');
                if (templateItem) {
                    const templateId = templateItem.dataset.templateId;
                    this.selectTemplate(templateId);
                }
            });
        }
    }

    async loadChats() {
        try {
            const chatsSnapshot = await this.db.collection('whatsappChats')
                .where('adminId', '==', this.currentUser.uid)
                .orderBy('lastMessageTime', 'desc')
                .get();
            
            this.chats = [];
            chatsSnapshot.forEach(doc => {
                this.chats.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.displayChats();
        } catch (error) {
            console.error('Error loading chats:', error);
            this.showNotification('Error loading chats', 'error');
        }
    }

    async loadTemplates() {
        try {
            const templatesSnapshot = await this.db.collection('whatsappTemplates')
                .where('adminId', '==', this.currentUser.uid)
                .orderBy('name', 'asc')
                .get();
            
            this.templates = [];
            templatesSnapshot.forEach(doc => {
                this.templates.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.displayTemplates();
        } catch (error) {
            console.error('Error loading templates:', error);
            this.showNotification('Error loading templates', 'error');
        }
    }

    displayChats() {
        const chatList = document.getElementById('chatList');
        if (!chatList) return;
        
        chatList.innerHTML = '';
        
        if (this.chats.length === 0) {
            chatList.innerHTML = '<p class="text-muted">No active chats</p>';
            return;
        }
        
        this.chats.forEach(chat => {
            const chatItem = this.createChatItem(chat);
            chatList.appendChild(chatItem);
        });
    }

    createChatItem(chat) {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chat.id;
        
        const statusClass = chat.isOnline ? 'online' : 'offline';
        
        chatItem.innerHTML = `
            <div class="chat-header">
                <span class="chat-name">${chat.workerName}</span>
                <span class="chat-status ${statusClass}">${chat.isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div class="chat-preview">${chat.lastMessage || 'No messages yet'}</div>
            <div class="chat-meta">
                <span class="chat-time">${this.formatTime(chat.lastMessageTime)}</span>
                <div class="chat-actions">
                    <button class="btn btn-primary btn-sm">
                        <i class="fas fa-comment"></i> Chat
                    </button>
                </div>
            </div>
        `;
        
        return chatItem;
    }

    displayTemplates() {
        const templateList = document.getElementById('templateList');
        if (!templateList) return;
        
        templateList.innerHTML = '';
        
        if (this.templates.length === 0) {
            templateList.innerHTML = '<p class="text-muted">No templates available</p>';
            return;
        }
        
        this.templates.forEach(template => {
            const templateItem = this.createTemplateItem(template);
            templateList.appendChild(templateItem);
        });
    }

    createTemplateItem(template) {
        const templateItem = document.createElement('div');
        templateItem.className = 'template-item';
        templateItem.dataset.templateId = template.id;
        
        templateItem.innerHTML = `
            <div class="template-title">${template.name}</div>
            <div class="template-content">${template.content}</div>
        `;
        
        return templateItem;
    }

    async selectChat(chatId) {
        try {
            const chat = this.chats.find(c => c.id === chatId);
            if (!chat) return;
            
            this.currentChat = chat;
            
            // Update UI
            this.updateChatUI();
            
            // Load messages
            await this.loadMessages(chatId);
            
            // Update active chat indicator
            this.updateActiveChat(chatId);
            
            this.showNotification(`Selected chat with ${chat.workerName}`, 'info');
        } catch (error) {
            console.error('Error selecting chat:', error);
            this.showNotification('Error selecting chat', 'error');
        }
    }

    async selectTemplate(templateId) {
        try {
            const template = this.templates.find(t => t.id === templateId);
            if (!template) return;
            
            if (!this.currentChat) {
                this.showNotification('Please select a chat first', 'warning');
                return;
            }
            
            // Send template message
            await this.sendTemplateMessage(template);
            
            this.showNotification(`Template "${template.name}" sent`, 'success');
        } catch (error) {
            console.error('Error selecting template:', error);
            this.showNotification('Error sending template', 'error');
        }
    }

    updateChatUI() {
        if (!this.currentChat) return;
        
        // Update worker information
        document.getElementById('workerName').textContent = this.currentChat.workerName;
        document.getElementById('workerPhone').textContent = this.currentChat.phoneNumber;
        document.getElementById('workerStatus').textContent = this.currentChat.isOnline ? 'Online' : 'Offline';
        document.getElementById('lastActive').textContent = this.formatTime(this.currentChat.lastMessageTime);
        
        // Enable message input
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        
        if (messageInput) messageInput.disabled = false;
        if (sendButton) sendButton.disabled = false;
    }

    updateActiveChat(chatId) {
        // Remove active class from all chats
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected chat
        const activeChat = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (activeChat) {
            activeChat.classList.add('active');
        }
    }

    async loadMessages(chatId) {
        try {
            const messagesSnapshot = await this.db.collection('whatsappMessages')
                .where('chatId', '==', chatId)
                .orderBy('timestamp', 'asc')
                .get();
            
            this.messages = [];
            messagesSnapshot.forEach(doc => {
                this.messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.displayMessages();
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    displayMessages() {
        const messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) return;
        
        messageContainer.innerHTML = '';
        
        if (this.messages.length === 0) {
            messageContainer.innerHTML = `
                <div class="message-placeholder">
                    <i class="fas fa-comments"></i>
                    <p>No messages yet. Start the conversation!</p>
                </div>
            `;
            return;
        }
        
        this.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messageContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === 'admin' ? 'sent' : 'received'}`;
        
        messageDiv.innerHTML = `
            <div class="message-time">${this.formatTime(message.timestamp)}</div>
            <div class="message-bubble">${message.content}</div>
        `;
        
        return messageDiv;
    }

    async sendMessage() {
        try {
            if (!this.currentChat) {
                this.showNotification('Please select a chat first', 'warning');
                return;
            }
            
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value.trim();
            
            if (!message) {
                this.showNotification('Please enter a message', 'warning');
                return;
            }
            
            // Create message object
            const messageData = {
                chatId: this.currentChat.id,
                content: message,
                sender: 'admin',
                timestamp: new Date(),
                messageId: Date.now().toString()
            };
            
            // Send via WhatsApp API
            const result = await this.whatsappAPI.sendMessage(this.currentChat.phoneNumber, message);
            
            if (result.success) {
                // Save to Firebase
                await this.db.collection('whatsappMessages').add(messageData);
                
                // Add to local messages
                this.messages.push(messageData);
                this.displayMessages();
                
                // Update chat last message
                await this.db.collection('whatsappChats').doc(this.currentChat.id).update({
                    lastMessage: message,
                    lastMessageTime: new Date()
                });
                
                // Clear input
                messageInput.value = '';
                document.getElementById('sendButton').disabled = true;
                
                this.showNotification('Message sent successfully', 'success');
            } else {
                this.showNotification('Failed to send message', 'error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Error sending message', 'error');
        }
    }

    async sendTemplateMessage(template) {
        try {
            if (!this.currentChat) {
                this.showNotification('Please select a chat first', 'warning');
                return;
            }
            
            // Send template via WhatsApp API
            const result = await this.whatsappAPI.sendTemplate(
                this.currentChat.phoneNumber,
                template.name,
                template.variables || {}
            );
            
            if (result.success) {
                // Create message object
                const messageData = {
                    chatId: this.currentChat.id,
                    content: `[Template] ${template.content}`,
                    sender: 'admin',
                    timestamp: new Date(),
                    messageId: result.messageId,
                    templateId: template.id
                };
                
                // Save to Firebase
                await this.db.collection('whatsappMessages').add(messageData);
                
                // Add to local messages
                this.messages.push(messageData);
                this.displayMessages();
                
                this.showNotification('Template message sent successfully', 'success');
            } else {
                this.showNotification('Failed to send template message', 'error');
            }
        } catch (error) {
            console.error('Error sending template message:', error);
            this.showNotification('Error sending template message', 'error');
        }
    }

    async sendBroadcast() {
        try {
            const message = prompt('Enter broadcast message:');
            if (!message) return;
            
            const confirmed = confirm(`Send broadcast message to ${this.chats.length} workers?`);
            if (!confirmed) return;
            
            this.showNotification('Sending broadcast messages...', 'info');
            
            let successCount = 0;
            let failCount = 0;
            
            for (const chat of this.chats) {
                try {
                    const result = await this.whatsappAPI.sendMessage(chat.phoneNumber, message);
                    if (result.success) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (error) {
                    failCount++;
                }
            }
            
            this.showNotification(`Broadcast completed: ${successCount} sent, ${failCount} failed`, 'success');
        } catch (error) {
            console.error('Error sending broadcast:', error);
            this.showNotification('Error sending broadcast', 'error');
        }
    }

    async syncContacts() {
        try {
            this.showNotification('Syncing contacts...', 'info');
            
            // Simulate contact sync
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update chats with new contacts
            await this.loadChats();
            
            this.showNotification('Contacts synced successfully', 'success');
        } catch (error) {
            console.error('Error syncing contacts:', error);
            this.showNotification('Error syncing contacts', 'error');
        }
    }

    async exportChats() {
        try {
            this.showNotification('Exporting chat data...', 'info');
            
            const exportData = {
                chats: this.chats.map(chat => ({
                    workerName: chat.workerName,
                    phoneNumber: chat.phoneNumber,
                    lastMessage: chat.lastMessage,
                    lastMessageTime: this.formatTime(chat.lastMessageTime),
                    messageCount: chat.messageCount || 0
                })),
                exportDate: new Date().toISOString()
            };
            
            const csv = this.convertToCSV(exportData.chats);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `whatsapp_chats_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            
            this.showNotification('Chat data exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting chats:', error);
            this.showNotification('Error exporting chats', 'error');
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        const statusIcon = document.getElementById('statusIcon');
        
        if (statusElement) {
            statusElement.textContent = this.connectionStatus;
        }
        
        if (statusIcon) {
            statusIcon.className = `fas fa-circle ${this.connectionStatus === 'connected' ? 'text-success' : 'text-danger'}`;
        }
    }

    updateStatistics() {
        const stats = {
            totalChats: this.chats.length,
            messagesSent: this.messages.filter(m => m.sender === 'admin').length,
            messagesReceived: this.messages.filter(m => m.sender === 'worker').length,
            responseRate: this.calculateResponseRate()
        };
        
        document.getElementById('totalChats').textContent = stats.totalChats;
        document.getElementById('messagesSent').textContent = stats.messagesSent;
        document.getElementById('messagesReceived').textContent = stats.messagesReceived;
        document.getElementById('responseRate').textContent = `${stats.responseRate}%`;
    }

    calculateResponseRate() {
        if (this.chats.length === 0) return 0;
        
        const respondedChats = this.chats.filter(chat => chat.lastMessage && chat.lastMessageSender === 'worker').length;
        return Math.round((respondedChats / this.chats.length) * 100);
    }

    setupEventListeners() {
        // Send broadcast button
        const sendBroadcastButton = document.getElementById('sendBroadcast');
        if (sendBroadcastButton) {
            sendBroadcastButton.addEventListener('click', () => {
                this.sendBroadcast();
            });
        }
        
        // Sync contacts button
        const syncContactsButton = document.getElementById('syncContacts');
        if (syncContactsButton) {
            syncContactsButton.addEventListener('click', () => {
                this.syncContacts();
            });
        }
        
        // Export chats button
        const exportChatsButton = document.getElementById('exportChats');
        if (exportChatsButton) {
            exportChatsButton.addEventListener('click', () => {
                this.exportChats();
            });
        }
        
        // Refresh chats button
        const refreshChatsButton = document.getElementById('refreshChats');
        if (refreshChatsButton) {
            refreshChatsButton.addEventListener('click', () => {
                this.loadChats();
            });
        }
        
        // Add template button
        const addTemplateButton = document.getElementById('addTemplate');
        if (addTemplateButton) {
            addTemplateButton.addEventListener('click', () => {
                this.addTemplate();
            });
        }
        
        // Send template button
        const sendTemplateButton = document.getElementById('sendTemplate');
        if (sendTemplateButton) {
            sendTemplateButton.addEventListener('click', () => {
                this.showTemplateSelector();
            });
        }
    }

    async addTemplate() {
        try {
            const name = prompt('Enter template name:');
            if (!name) return;
            
            const content = prompt('Enter template content:');
            if (!content) return;
            
            const templateData = {
                name,
                content,
                adminId: this.currentUser.uid,
                createdAt: new Date(),
                variables: []
            };
            
            // Save to Firebase
            await this.db.collection('whatsappTemplates').add(templateData);
            
            // Reload templates
            await this.loadTemplates();
            
            this.showNotification('Template added successfully', 'success');
        } catch (error) {
            console.error('Error adding template:', error);
            this.showNotification('Error adding template', 'error');
        }
    }

    showTemplateSelector() {
        if (!this.currentChat) {
            this.showNotification('Please select a chat first', 'warning');
            return;
        }
        
        if (this.templates.length === 0) {
            this.showNotification('No templates available', 'warning');
            return;
        }
        
        const templateNames = this.templates.map(t => t.name);
        const selectedTemplate = prompt(`Select template:\n${templateNames.join('\n')}`);
        
        if (selectedTemplate) {
            const template = this.templates.find(t => t.name === selectedTemplate);
            if (template) {
                this.sendTemplateMessage(template);
            } else {
                this.showNotification('Template not found', 'error');
            }
        }
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }

    formatTime(timestamp) {
        if (!timestamp) return 'Never';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize the system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WhatsAppIntegrationSystem();
});

// Mock data for development
const mockChats = [
    {
        id: '1',
        workerName: 'Sok Dara',
        phoneNumber: '+855123456789',
        lastMessage: 'Thank you for the information',
        lastMessageTime: new Date('2024-01-15T10:30:00'),
        lastMessageSender: 'worker',
        isOnline: true,
        messageCount: 15,
        adminId: 'admin1'
    },
    {
        id: '2',
        workerName: 'Chan Sopheak',
        phoneNumber: '+855987654321',
        lastMessage: 'I have a question about my case',
        lastMessageTime: new Date('2024-01-15T09:15:00'),
        lastMessageSender: 'worker',
        isOnline: false,
        messageCount: 8,
        adminId: 'admin1'
    },
    {
        id: '3',
        workerName: 'Kim Srey',
        phoneNumber: '+855555555555',
        lastMessage: 'Your case has been updated',
        lastMessageTime: new Date('2024-01-15T08:45:00'),
        lastMessageSender: 'admin',
        isOnline: true,
        messageCount: 12,
        adminId: 'admin1'
    }
];

const mockTemplates = [
    {
        id: '1',
        name: 'Case Update',
        content: 'Hello {{worker_name}}, your case #{{case_number}} has been updated. Please check your portal for details.',
        variables: ['worker_name', 'case_number'],
        adminId: 'admin1',
        createdAt: new Date('2024-01-10')
    },
    {
        id: '2',
        name: 'Document Request',
        content: 'Hello {{worker_name}}, we need additional documents for your case. Please upload them through the portal.',
        variables: ['worker_name'],
        adminId: 'admin1',
        createdAt: new Date('2024-01-12')
    },
    {
        id: '3',
        name: 'Meeting Reminder',
        content: 'Hello {{worker_name}}, reminder: you have a meeting scheduled for {{meeting_time}} with {{meeting_person}}.',
        variables: ['worker_name', 'meeting_time', 'meeting_person'],
        adminId: 'admin1',
        createdAt: new Date('2024-01-14')
    }
];

const mockMessages = [
    {
        id: '1',
        chatId: '1',
        content: 'Hello, I have a question about my case',
        sender: 'worker',
        timestamp: new Date('2024-01-15T10:00:00')
    },
    {
        id: '2',
        chatId: '1',
        content: 'Hello Sok Dara, how can I help you today?',
        sender: 'admin',
        timestamp: new Date('2024-01-15T10:05:00')
    },
    {
        id: '3',
        chatId: '1',
        content: 'Thank you for the information',
        sender: 'worker',
        timestamp: new Date('2024-01-15T10:30:00')
    }
];
