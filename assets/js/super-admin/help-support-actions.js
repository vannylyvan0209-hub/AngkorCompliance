// Help & Support Actions for Super Admin
class HelpSupportActions {
    constructor(core) {
        this.core = core;
    }
    
    async createTicket() {
        this.core.showNotification('info', 'Opening ticket creation form...');
        
        // Simulate opening ticket creation form
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.showTicketCreationModal();
    }
    
    showTicketCreationModal() {
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
                max-width: 700px;
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
                        Create Support Ticket
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
                    <form id="ticketForm">
                        <div style="margin-bottom: var(--space-4);">
                            <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                Title
                            </label>
                            <input type="text" id="ticketTitle" required style="
                                width: 100%;
                                padding: var(--space-3);
                                border: 1px solid var(--neutral-200);
                                border-radius: var(--radius-md);
                                font-size: var(--text-sm);
                            " placeholder="Brief description of the issue">
                        </div>
                        
                        <div style="margin-bottom: var(--space-4);">
                            <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                Description
                            </label>
                            <textarea id="ticketDescription" required style="
                                width: 100%;
                                padding: var(--space-3);
                                border: 1px solid var(--neutral-200);
                                border-radius: var(--radius-md);
                                font-size: var(--text-sm);
                                min-height: 120px;
                                resize: vertical;
                            " placeholder="Detailed description of the issue, including steps to reproduce if applicable"></textarea>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
                            <div>
                                <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                    Category
                                </label>
                                <select id="ticketCategory" style="
                                    width: 100%;
                                    padding: var(--space-3);
                                    border: 1px solid var(--neutral-200);
                                    border-radius: var(--radius-md);
                                    font-size: var(--text-sm);
                                ">
                                    <option value="technical">Technical Issue</option>
                                    <option value="performance">Performance Problem</option>
                                    <option value="security">Security Concern</option>
                                    <option value="system">System Error</option>
                                    <option value="communication">Communication Issue</option>
                                    <option value="billing">Billing Question</option>
                                    <option value="feature">Feature Request</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style="display: block; margin-bottom: var(--space-2); font-weight: 500; color: var(--neutral-700);">
                                    Priority
                                </label>
                                <select id="ticketPriority" style="
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
                                Attachments (Optional)
                            </label>
                            <input type="file" id="ticketAttachments" multiple style="
                                width: 100%;
                                padding: var(--space-3);
                                border: 1px solid var(--neutral-200);
                                border-radius: var(--radius-md);
                                font-size: var(--text-sm);
                            " accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif">
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
                            ">Create Ticket</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        modal.querySelector('#ticketForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateTicket(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    async handleCreateTicket(modal) {
        const title = modal.querySelector('#ticketTitle').value;
        const description = modal.querySelector('#ticketDescription').value;
        const category = modal.querySelector('#ticketCategory').value;
        const priority = modal.querySelector('#ticketPriority').value;
        const attachments = modal.querySelector('#ticketAttachments').files;
        
        try {
            this.core.showNotification('info', 'Creating support ticket...');
            
            // Simulate creating ticket
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create new ticket
            const newTicket = {
                id: 'ticket_' + Date.now(),
                title,
                content: description,
                status: 'open',
                priority,
                category,
                createdBy: this.core.currentUser?.displayName || 'Super Admin',
                assignedTo: 'Support Team',
                createdAt: new Date(),
                lastUpdated: new Date(),
                responses: 0
            };
            
            // Add to tickets array
            this.core.supportTickets.unshift(newTicket);
            
            // Update UI
            this.core.updateOverviewStats();
            this.core.renderSupportTickets();
            
            modal.remove();
            this.core.showNotification('success', 'Support ticket created successfully');
            
        } catch (error) {
            console.error('Error creating ticket:', error);
            this.core.showNotification('error', 'Failed to create support ticket');
        }
    }
    
    async searchKnowledgeBase() {
        const searchInput = document.getElementById('kbSearchInput');
        if (!searchInput) return;
        
        const query = searchInput.value.trim();
        if (!query) {
            this.core.showNotification('warning', 'Please enter a search term');
            return;
        }
        
        this.core.showNotification('info', `Searching for "${query}"...`);
        
        // Simulate search
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Filter knowledge base based on search query
        const filteredKB = this.core.knowledgeBase.filter(category => 
            category.name.toLowerCase().includes(query.toLowerCase()) ||
            category.description.toLowerCase().includes(query.toLowerCase()) ||
            category.articles.some(article => article.toLowerCase().includes(query.toLowerCase()))
        );
        
        this.renderSearchResults(filteredKB, query);
        this.core.showNotification('success', `Found ${filteredKB.length} results for "${query}"`);
    }
    
    renderSearchResults(results, query) {
        const container = document.getElementById('kbCategories');
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: var(--space-8); color: var(--neutral-500);">
                    <i data-lucide="search-x" style="width: 48px; height: 48px; margin: 0 auto var(--space-4); display: block;"></i>
                    <p>No results found for "${query}"</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }
        
        container.innerHTML = results.map(category => `
            <div class="kb-category" onclick="viewKnowledgeCategory('${category.id}')">
                <div class="kb-category-header">
                    <div class="kb-category-name">${this.highlightSearchTerm(category.name, query)}</div>
                    <div class="kb-category-count">${category.articleCount}</div>
                </div>
                <div class="kb-category-description">${this.highlightSearchTerm(category.description, query)}</div>
                <div class="kb-category-articles">
                    ${category.articles.filter(article => 
                        article.toLowerCase().includes(query.toLowerCase())
                    ).slice(0, 3).map(article => `
                        <div class="kb-article" onclick="event.stopPropagation(); viewArticle('${article}')">
                            ${this.highlightSearchTerm(article, query)}
                        </div>
                    `).join('')}
                    ${category.articles.filter(article => 
                        article.toLowerCase().includes(query.toLowerCase())
                    ).length > 3 ? `
                        <div class="kb-article" style="color: var(--primary-600); font-weight: 500;">
                            +${category.articles.filter(article => 
                                article.toLowerCase().includes(query.toLowerCase())
                            ).length - 3} more matching articles
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
    
    highlightSearchTerm(text, term) {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark style="background: var(--warning-200); padding: 2px 4px; border-radius: 2px;">$1</mark>');
    }
    
    async refreshHelp() {
        try {
            this.core.showNotification('info', 'Refreshing help system...');
            
            // Simulate refresh
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            await this.core.loadInitialData();
            
            this.core.showNotification('success', 'Help system refreshed successfully');
            
        } catch (error) {
            console.error('Error refreshing help system:', error);
            this.core.showNotification('error', 'Failed to refresh help system');
        }
    }
    
    async exportTickets() {
        try {
            this.core.showNotification('info', 'Exporting support tickets...');
            
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create CSV content
            const csvContent = this.createTicketsCSV();
            
            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `support_tickets_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.core.showNotification('success', 'Support tickets exported successfully');
            
        } catch (error) {
            console.error('Error exporting tickets:', error);
            this.core.showNotification('error', 'Failed to export support tickets');
        }
    }
    
    createTicketsCSV() {
        const headers = ['ID', 'Title', 'Status', 'Priority', 'Category', 'Created By', 'Assigned To', 'Created At', 'Last Updated', 'Responses'];
        const rows = this.core.supportTickets.map(ticket => [
            ticket.id,
            ticket.title,
            ticket.status,
            ticket.priority,
            ticket.category,
            ticket.createdBy,
            ticket.assignedTo,
            this.core.formatDate(ticket.createdAt),
            this.core.formatDate(ticket.lastUpdated),
            ticket.responses
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
    
    async viewDocumentation(docId) {
        const doc = this.core.documentation.find(d => d.id === docId);
        if (!doc) return;
        
        this.showDocumentationModal(doc);
    }
    
    showDocumentationModal(doc) {
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
                max-width: 800px;
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
                        ${doc.title}
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
                                <strong>Category:</strong> 
                                <span class="doc-category ${doc.category}" style="
                                    padding: var(--space-1) var(--space-2);
                                    border-radius: var(--radius-sm);
                                    font-size: var(--text-xs);
                                    font-weight: 600;
                                    text-transform: uppercase;
                                    margin-left: var(--space-2);
                                ">${doc.category}</span>
                            </div>
                            <div>
                                <strong>Rating:</strong> ${doc.rating}/5
                            </div>
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Last Updated:</strong> ${this.core.formatDate(doc.lastUpdated)}
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Views:</strong> ${doc.views}
                        </div>
                        
                        <div style="margin-bottom: var(--space-4);">
                            <strong>Description:</strong>
                            <p style="margin-top: var(--space-2); color: var(--neutral-600); line-height: 1.6;">
                                ${doc.description}
                            </p>
                        </div>
                        
                        <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--neutral-200);">
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Documentation Content
                            </h4>
                            <div style="background: var(--neutral-50); padding: var(--space-4); border-radius: var(--radius-lg); color: var(--neutral-600);">
                                <p>This is a comprehensive guide that covers all aspects of ${doc.title.toLowerCase()}. The documentation includes step-by-step instructions, best practices, troubleshooting tips, and examples.</p>
                                <br>
                                <p>Key topics covered:</p>
                                <ul style="margin-left: var(--space-4);">
                                    <li>Overview and introduction</li>
                                    <li>Step-by-step procedures</li>
                                    <li>Configuration options</li>
                                    <li>Common issues and solutions</li>
                                    <li>Best practices and recommendations</li>
                                </ul>
                                <br>
                                <p>For additional support, please contact our support team or create a support ticket.</p>
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
    
    async viewTicket(ticketId) {
        const ticket = this.core.supportTickets.find(t => t.id === ticketId);
        if (!ticket) return;
        
        this.showTicketDetailsModal(ticket);
    }
    
    showTicketDetailsModal(ticket) {
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
                max-width: 800px;
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
                        ${ticket.title}
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
                                <strong>Status:</strong> 
                                <span class="ticket-status ${ticket.status}" style="
                                    padding: var(--space-1) var(--space-2);
                                    border-radius: var(--radius-sm);
                                    font-size: var(--text-xs);
                                    font-weight: 600;
                                    text-transform: uppercase;
                                    margin-left: var(--space-2);
                                ">${ticket.status}</span>
                            </div>
                            <div>
                                <strong>Priority:</strong> ${ticket.priority}
                            </div>
                            <div>
                                <strong>Category:</strong> ${ticket.category}
                            </div>
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Created By:</strong> ${ticket.createdBy}
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Assigned To:</strong> ${ticket.assignedTo}
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Created At:</strong> ${this.core.formatDate(ticket.createdAt)}
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Last Updated:</strong> ${this.core.formatDate(ticket.lastUpdated)}
                        </div>
                        
                        <div style="margin-bottom: var(--space-3);">
                            <strong>Responses:</strong> ${ticket.responses}
                        </div>
                        
                        <div style="margin-bottom: var(--space-4);">
                            <strong>Description:</strong>
                            <p style="margin-top: var(--space-2); color: var(--neutral-600); line-height: 1.6;">
                                ${ticket.content}
                            </p>
                        </div>
                        
                        <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--neutral-200);">
                            <h4 style="font-size: var(--text-md); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-3);">
                                Ticket Actions
                            </h4>
                            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
                                <button onclick="assignTicket('${ticket.id}')" style="
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
                                    Assign Ticket
                                </button>
                                <button onclick="updateTicketStatus('${ticket.id}')" style="
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
                                    Update Status
                                </button>
                                <button onclick="addTicketResponse('${ticket.id}')" style="
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
                                    Add Response
                                </button>
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
    
    async assignTicket(ticketId) {
        const ticket = this.core.supportTickets.find(t => t.id === ticketId);
        if (!ticket) return;
        
        this.core.showNotification('info', `Assigning ticket ${ticketId}...`);
        
        // Simulate assignment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        ticket.assignedTo = 'Technical Team';
        ticket.lastUpdated = new Date();
        
        this.core.renderSupportTickets();
        this.core.showNotification('success', 'Ticket assigned successfully');
    }
    
    async updateTicketStatus(ticketId) {
        const ticket = this.core.supportTickets.find(t => t.id === ticketId);
        if (!ticket) return;
        
        const newStatus = prompt('Enter new status (open, in-progress, resolved, closed):', ticket.status);
        if (!newStatus || newStatus === ticket.status) return;
        
        try {
            this.core.showNotification('info', `Updating ticket status to ${newStatus}...`);
            
            // Simulate status update
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            ticket.status = newStatus;
            ticket.lastUpdated = new Date();
            
            this.core.updateOverviewStats();
            this.core.renderSupportTickets();
            this.core.showNotification('success', 'Ticket status updated successfully');
            
        } catch (error) {
            console.error('Error updating ticket status:', error);
            this.core.showNotification('error', 'Failed to update ticket status');
        }
    }
    
    async viewKnowledgeCategory(categoryId) {
        const category = this.core.knowledgeBase.find(c => c.id === categoryId);
        if (!category) return;
        
        this.core.showNotification('info', `Opening ${category.name} category...`);
        
        // Simulate opening category
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.core.showNotification('success', `${category.name} category opened`);
    }
    
    async viewArticle(articleName) {
        this.core.showNotification('info', `Opening article: ${articleName}...`);
        
        // Simulate opening article
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.core.showNotification('success', `Article "${articleName}" opened`);
    }
    
    async initiateContact(methodId) {
        const method = this.core.contactMethods.find(m => m.id === methodId);
        if (!method) return;
        
        this.core.showNotification('info', `Initiating contact via ${method.name}...`);
        
        // Simulate contact initiation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.core.showNotification('success', `Contact initiated via ${method.name}`);
    }
    
    async scheduleContact(methodId) {
        const method = this.core.contactMethods.find(m => m.id === methodId);
        if (!method) return;
        
        this.core.showNotification('info', `Scheduling contact via ${method.name}...`);
        
        // Simulate scheduling
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.core.showNotification('success', `Contact scheduled via ${method.name}`);
    }
}

// Initialize actions when core is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.helpSupportCore) {
            window.helpSupportActions = new HelpSupportActions(window.helpSupportCore);
            
            // Override core methods with actions
            window.helpSupportCore.createTicket = () => window.helpSupportActions.createTicket();
            window.helpSupportCore.searchKnowledgeBase = () => window.helpSupportActions.searchKnowledgeBase();
            window.helpSupportCore.refreshHelp = () => window.helpSupportActions.refreshHelp();
            window.helpSupportCore.exportTickets = () => window.helpSupportActions.exportTickets();
            window.helpSupportCore.switchTab = (tabName) => window.helpSupportActions.switchTab(tabName);
            window.helpSupportCore.viewDocumentation = (docId) => window.helpSupportActions.viewDocumentation(docId);
            window.helpSupportCore.viewTicket = (ticketId) => window.helpSupportActions.viewTicket(ticketId);
            window.helpSupportCore.assignTicket = (ticketId) => window.helpSupportActions.assignTicket(ticketId);
            window.helpSupportCore.updateTicketStatus = (ticketId) => window.helpSupportActions.updateTicketStatus(ticketId);
            window.helpSupportCore.viewKnowledgeCategory = (categoryId) => window.helpSupportActions.viewKnowledgeCategory(categoryId);
            window.helpSupportCore.viewArticle = (articleName) => window.helpSupportActions.viewArticle(articleName);
            window.helpSupportCore.initiateContact = (methodId) => window.helpSupportActions.initiateContact(methodId);
            window.helpSupportCore.scheduleContact = (methodId) => window.helpSupportActions.scheduleContact(methodId);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HelpSupportActions;
}
