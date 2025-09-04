// Agenda Generator System - Core Functionality
class AgendaGenerator {
    constructor() {
        this.currentLanguage = 'en';
        this.agendaTemplates = [];
        this.recentAgendas = [];
        this.currentAgenda = null;
        this.initializeSystem();
    }

    initializeSystem() {
        this.setupEventListeners();
        this.loadTemplates();
        this.loadRecentAgendas();
        this.setDefaultDateTime();
        this.renderTemplates();
        this.renderRecentAgendas();
    }

    setupEventListeners() {
        const generateBtn = document.getElementById('generate-agenda-btn');
        if (generateBtn) generateBtn.addEventListener('click', () => this.generateAgenda());
        
        const editBtn = document.getElementById('edit-agenda-btn');
        if (editBtn) editBtn.addEventListener('click', () => this.openEditModal());
        
        const saveBtn = document.getElementById('save-agenda-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveAgenda());
        
        const createTemplateBtn = document.getElementById('create-template-btn');
        if (createTemplateBtn) createTemplateBtn.addEventListener('click', () => this.openModal('create-template-modal'));
    }

    setDefaultDateTime() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dateInput = document.getElementById('agenda-date');
        const timeInput = document.getElementById('agenda-time');
        
        if (dateInput) dateInput.value = tomorrow.toISOString().split('T')[0];
        if (timeInput) timeInput.value = '09:00';
    }

    loadTemplates() {
        this.agendaTemplates = [
            {
                id: 'tpl001',
                name: 'Standard Team Meeting',
                description: 'Regular team meeting template',
                type: 'meeting',
                duration: 60,
                contentStructure: ['objectives', 'updates', 'discussion', 'action-items']
            },
            {
                id: 'tpl002',
                name: 'Safety Training Session',
                description: 'Comprehensive safety training',
                type: 'training',
                duration: 120,
                contentStructure: ['objectives', 'presentation', 'interactive', 'assessment']
            }
        ];
    }

    loadRecentAgendas() {
        this.recentAgendas = [
            {
                id: 'ag001',
                title: 'Weekly Production Meeting',
                type: 'meeting',
                date: '2024-01-15',
                time: '09:00',
                duration: 60,
                participants: 12,
                status: 'completed'
            }
        ];
    }

    generateAgenda() {
        const agendaType = document.getElementById('agenda-type').value;
        const duration = parseInt(document.getElementById('agenda-duration').value);
        const date = document.getElementById('agenda-date').value;
        const time = document.getElementById('agenda-time').value;

        if (!agendaType || !duration || !date || !time) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }

        const contentOptions = this.getSelectedContentOptions();
        const agenda = this.createAgenda(agendaType, duration, contentOptions);
        
        this.currentAgenda = agenda;
        this.renderAgendaPreview(agenda);
        this.showNotification('Agenda generated successfully!', 'success');
    }

    getSelectedContentOptions() {
        const checkboxes = document.querySelectorAll('.option-group:first-child input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    createAgenda(type, duration, contentOptions) {
        const agenda = {
            id: 'ag' + Date.now(),
            title: this.generateAgendaTitle(type),
            type: type,
            date: document.getElementById('agenda-date').value,
            time: document.getElementById('agenda-time').value,
            duration: duration,
            items: []
        };

        if (contentOptions.includes('objectives')) {
            agenda.items.push({
                title: 'Meeting Objectives',
                duration: 15,
                description: 'Set meeting goals and agenda'
            });
        }

        if (contentOptions.includes('updates')) {
            agenda.items.push({
                title: 'Status Updates',
                duration: 20,
                description: 'Team member progress reports'
            });
        }

        if (contentOptions.includes('discussion')) {
            agenda.items.push({
                title: 'Open Discussion',
                duration: 30,
                description: 'Key topics and challenges'
            });
        }

        if (contentOptions.includes('action-items')) {
            agenda.items.push({
                title: 'Action Items',
                duration: 15,
                description: 'Review and assign tasks'
            });
        }

        return agenda;
    }

    generateAgendaTitle(type) {
        const titles = {
            'training': 'Training Session',
            'meeting': 'Team Meeting',
            'audit': 'Audit Review Meeting',
            'compliance': 'Compliance Review',
            'safety': 'Safety Meeting'
        };
        return titles[type] || 'Meeting';
    }

    renderAgendaPreview(agenda) {
        const previewContainer = document.getElementById('agenda-preview');
        if (!previewContainer) return;

        previewContainer.innerHTML = `
            <div class="agenda-header-info">
                <div class="agenda-title">
                    <h3>${agenda.title}</h3>
                    <div class="agenda-meta">
                        <span class="agenda-date"><i class="fas fa-calendar"></i> ${this.formatDate(agenda.date)}</span>
                        <span class="agenda-time"><i class="fas fa-clock"></i> ${agenda.time}</span>
                        <span class="agenda-duration"><i class="fas fa-hourglass-half"></i> ${agenda.duration} minutes</span>
                    </div>
                </div>
            </div>
            <div class="agenda-items">
                <h4>Agenda Items:</h4>
                <div class="agenda-timeline">
                    ${this.renderAgendaItems(agenda.items)}
                </div>
            </div>
        `;
    }

    renderAgendaItems(items) {
        let currentTime = 0;
        let html = '';
        
        items.forEach((item, index) => {
            const startTime = this.formatTime(currentTime);
            currentTime += item.duration;
            const endTime = this.formatTime(currentTime);
            
            html += `
                <div class="agenda-item">
                    <div class="item-time">
                        <span class="start-time">${startTime}</span>
                        <span class="end-time">${endTime}</span>
                    </div>
                    <div class="item-content">
                        <h5>${item.title}</h5>
                        <p>${item.description}</p>
                        <span class="item-duration">${item.duration} min</span>
                    </div>
                </div>
            `;
        });
        
        return html;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    renderTemplates() {
        const templatesGrid = document.getElementById('templates-grid');
        if (!templatesGrid) return;

        templatesGrid.innerHTML = '';
        
        this.agendaTemplates.forEach(template => {
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card';
            
            templateCard.innerHTML = `
                <div class="template-header">
                    <h3>${template.name}</h3>
                    <span class="template-type ${template.type}">${template.type}</span>
                </div>
                <p class="template-description">${template.description}</p>
                <div class="template-details">
                    <span class="template-duration"><i class="fas fa-clock"></i> ${template.duration} min</span>
                </div>
                <div class="template-actions">
                    <button class="btn btn-sm btn-primary" onclick="agendaGenerator.useTemplate('${template.id}')">
                        <i class="fas fa-play"></i> Use Template
                    </button>
                </div>
            `;
            
            templatesGrid.appendChild(templateCard);
        });
    }

    renderRecentAgendas() {
        const recentList = document.getElementById('recent-agendas-list');
        if (!recentList) return;

        recentList.innerHTML = '';
        
        this.recentAgendas.forEach(agenda => {
            const agendaItem = document.createElement('div');
            agendaItem.className = 'recent-agenda-item';
            
            agendaItem.innerHTML = `
                <div class="agenda-info">
                    <h4>${agenda.title}</h4>
                    <div class="agenda-details">
                        <span class="agenda-type ${agenda.type}">${agenda.type}</span>
                        <span class="agenda-date">${this.formatDate(agenda.date)}</span>
                        <span class="agenda-time">${agenda.time}</span>
                        <span class="agenda-duration">${agenda.duration} min</span>
                    </div>
                </div>
                <div class="agenda-status">
                    <span class="status-badge status-${agenda.status}">${this.getStatusText(agenda.status)}</span>
                </div>
            `;
            
            recentList.appendChild(agendaItem);
        });
    }

    useTemplate(templateId) {
        const template = this.agendaTemplates.find(t => t.id === templateId);
        if (!template) return;

        document.getElementById('agenda-type').value = template.type;
        document.getElementById('agenda-duration').value = template.duration;
        
        this.showNotification(`Template "${template.name}" applied successfully!`, 'success');
    }

    openEditModal() {
        if (!this.currentAgenda) {
            this.showNotification('No agenda to edit. Please generate an agenda first.', 'error');
            return;
        }
        this.showNotification('Edit functionality coming soon...', 'info');
    }

    saveAgenda() {
        if (!this.currentAgenda) {
            this.showNotification('No agenda to save. Please generate an agenda first.', 'error');
            return;
        }

        this.recentAgendas.unshift({
            id: this.currentAgenda.id,
            title: this.currentAgenda.title,
            type: this.currentAgenda.type,
            date: this.currentAgenda.date,
            time: this.currentAgenda.time,
            duration: this.currentAgenda.duration,
            participants: 15,
            status: 'scheduled'
        });

        this.renderRecentAgendas();
        this.showNotification('Agenda saved successfully!', 'success');
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'block';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    }

    getStatusText(status) {
        const statusMap = {
            'scheduled': 'Scheduled',
            'in-progress': 'In Progress',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
}

// Global functions
window.closeModal = function(modalId) {
    if (agendaGenerator) agendaGenerator.closeModal(modalId);
};

window.saveTemplate = function() {
    if (agendaGenerator) agendaGenerator.showNotification('Template saved!', 'success');
};

window.saveAgendaChanges = function() {
    if (agendaGenerator) agendaGenerator.showNotification('Changes saved!', 'success');
};

// Initialize
let agendaGenerator;
document.addEventListener('DOMContentLoaded', () => {
    agendaGenerator = new AgendaGenerator();
});
