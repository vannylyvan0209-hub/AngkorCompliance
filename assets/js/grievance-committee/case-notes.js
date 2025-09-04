// Case Notes System
// Manages case notes, collaboration, and documentation for grievance investigations

class CaseNotes {
    constructor() {
        this.currentLanguage = 'en';
        this.notes = [];
        this.cases = [];
        this.collaborators = [];
        this.currentCase = null;
        this.filters = {
            case: '',
            author: '',
            status: '',
            date: ''
        };
        
        this.initializeSystem();
        this.setupEventListeners();
        this.loadSampleData();
    }

    initializeSystem() {
        // Initialize Firebase
        if (typeof firebase !== 'undefined') {
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.setupFirebaseListeners();
        }

        // Set default date
        document.getElementById('date-filter').value = new Date().toISOString().split('T')[0];
        
        // Initialize language
        this.updateLanguage();
        
        // Initialize tabs
        this.initializeTabs();
    }

    setupEventListeners() {
        // Case selector
        document.getElementById('note-case-selector').addEventListener('change', (e) => {
            this.selectCase(e.target.value);
        });

        // Note form submission
        document.getElementById('note-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.publishNote();
        });

        // Save draft button
        document.getElementById('save-draft-btn').addEventListener('click', () => {
            this.saveDraft();
        });

        // Filter events
        document.getElementById('apply-filters-btn').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('clear-filters-btn').addEventListener('click', () => {
            this.clearFilters();
        });

        // Language toggle
        document.querySelector('.language-btn').addEventListener('click', () => {
            this.toggleLanguage();
        });
    }

    setupFirebaseListeners() {
        // Listen for authentication state changes
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.loadUserData(user);
            } else {
                console.log('User not authenticated');
            }
        });
    }

    loadUserData(user) {
        // Load user-specific notes data
        this.db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    if (userData.role === 'grievance_committee') {
                        this.loadNotesData();
                    }
                }
            })
            .catch((error) => {
                console.error('Error loading user data:', error);
            });
    }

    loadNotesData() {
        // Load notes data from Firestore
        this.db.collection('case-notes')
            .where('investigatorId', '==', this.auth.currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get()
            .then((querySnapshot) => {
                const notes = [];
                querySnapshot.forEach((doc) => {
                    notes.push({ id: doc.id, ...doc.data() });
                });
                this.notes = notes;
                this.updateDisplay();
                this.updateStatistics();
            })
            .catch((error) => {
                console.error('Error loading notes data:', error);
                // Load sample data if Firebase fails
                this.loadSampleData();
            });
    }

    loadSampleData() {
        // Sample cases
        this.cases = [
            {
                id: 'GC-2024-001',
                title: 'Workplace Harassment Complaint',
                category: 'Harassment',
                severity: 'High',
                status: 'Under Investigation',
                complainant: 'Anonymous',
                accused: 'Manager A',
                department: 'Production',
                createdAt: new Date(Date.now() - 86400000 * 3),
                assignedTo: 'John Smith'
            },
            {
                id: 'GC-2024-002',
                title: 'Wage Dispute Case',
                category: 'Wage',
                severity: 'Medium',
                status: 'Under Investigation',
                complainant: 'Worker B',
                accused: 'HR Manager',
                department: 'HR',
                createdAt: new Date(Date.now() - 86400000 * 2),
                assignedTo: 'Jane Doe'
            },
            {
                id: 'GC-2024-003',
                title: 'Safety Violation Report',
                category: 'Safety',
                severity: 'High',
                status: 'Under Investigation',
                complainant: 'Safety Officer',
                accused: 'Production Manager',
                department: 'Production',
                createdAt: new Date(Date.now() - 86400000),
                assignedTo: 'John Smith'
            }
        ];

        // Sample notes
        this.notes = [
            {
                id: 1,
                title: 'Initial Interview with Complainant',
                type: 'interview',
                content: 'Conducted initial interview with the complainant. They reported experiencing verbal harassment from their manager on multiple occasions. The complainant appeared distressed and provided specific examples of incidents.',
                caseId: 'GC-2024-001',
                caseTitle: 'Workplace Harassment Complaint',
                author: 'John Smith',
                authorId: 'js001',
                status: 'published',
                priority: 'high',
                tags: ['witness', 'harassment', 'interview'],
                createdAt: new Date(Date.now() - 86400000 * 2),
                updatedAt: new Date(Date.now() - 86400000 * 2)
            },
            {
                id: 2,
                title: 'Evidence Collection Summary',
                type: 'evidence',
                content: 'Collected security camera footage from the production floor for the dates mentioned in the complaint. Also gathered witness statements from three co-workers who were present during the alleged incidents.',
                caseId: 'GC-2024-001',
                caseTitle: 'Workplace Harassment Complaint',
                author: 'John Smith',
                authorId: 'js001',
                status: 'published',
                priority: 'medium',
                tags: ['evidence', 'camera', 'witness'],
                createdAt: new Date(Date.now() - 86400000 * 1.5),
                updatedAt: new Date(Date.now() - 86400000 * 1.5)
            },
            {
                id: 3,
                title: 'Interview with Accused Manager',
                type: 'interview',
                content: 'Conducted interview with the accused manager. They denied all allegations and stated that they have a professional relationship with the complainant. Requested additional evidence to support their position.',
                caseId: 'GC-2024-001',
                caseTitle: 'Workplace Harassment Complaint',
                author: 'John Smith',
                authorId: 'js001',
                status: 'published',
                priority: 'high',
                tags: ['interview', 'accused', 'denial'],
                createdAt: new Date(Date.now() - 86400000),
                updatedAt: new Date(Date.now() - 86400000)
            },
            {
                id: 4,
                title: 'Preliminary Findings',
                type: 'finding',
                content: 'Based on initial investigation, there appears to be conflicting accounts between the complainant and accused. Security footage may provide clarity. Additional witness interviews needed.',
                caseId: 'GC-2024-001',
                caseTitle: 'Workplace Harassment Complaint',
                author: 'John Smith',
                authorId: 'js001',
                status: 'draft',
                priority: 'medium',
                tags: ['findings', 'conflict', 'next-steps'],
                createdAt: new Date(Date.now() - 86400000 * 0.5),
                updatedAt: new Date(Date.now() - 86400000 * 0.5)
            },
            {
                id: 5,
                title: 'Wage Investigation Notes',
                type: 'investigation',
                content: 'Started investigation into wage dispute. Need to review payroll records, employment contracts, and interview HR personnel. Case involves overtime pay calculations.',
                caseId: 'GC-2024-002',
                caseTitle: 'Wage Dispute Case',
                author: 'Jane Doe',
                authorId: 'jd001',
                status: 'published',
                priority: 'medium',
                tags: ['wage', 'overtime', 'payroll'],
                createdAt: new Date(Date.now() - 86400000 * 1.8),
                updatedAt: new Date(Date.now() - 86400000 * 1.8)
            }
        ];

        // Sample collaborators
        this.collaborators = [
            {
                id: 'js001',
                name: 'John Smith',
                role: 'Lead Investigator',
                email: 'john.smith@company.com',
                avatar: 'JS',
                status: 'active',
                lastActive: new Date(Date.now() - 86400000 * 0.5)
            },
            {
                id: 'jd001',
                name: 'Jane Doe',
                role: 'Investigator',
                email: 'jane.doe@company.com',
                avatar: 'JD',
                status: 'active',
                lastActive: new Date(Date.now() - 86400000 * 0.2)
            },
            {
                id: 'mb001',
                name: 'Mike Brown',
                role: 'HR Representative',
                email: 'mike.brown@company.com',
                avatar: 'MB',
                status: 'active',
                lastActive: new Date(Date.now() - 86400000 * 1.2)
            },
            {
                id: 'sl001',
                name: 'Sarah Lee',
                role: 'Legal Advisor',
                email: 'sarah.lee@company.com',
                avatar: 'SL',
                status: 'active',
                lastActive: new Date(Date.now() - 86400000 * 2.1)
            }
        ];

        this.populateCaseSelectors();
        this.updateDisplay();
        this.updateStatistics();
    }

    populateCaseSelectors() {
        // Populate case selector in note form
        const noteCaseSelector = document.getElementById('note-case-selector');
        noteCaseSelector.innerHTML = '<option value="">Choose a case...</option>';
        
        this.cases.forEach(caseItem => {
            const option = document.createElement('option');
            option.value = caseItem.id;
            option.textContent = `${caseItem.id} - ${caseItem.title}`;
            noteCaseSelector.appendChild(option);
        });

        // Populate case filter
        const caseFilter = document.getElementById('case-filter');
        caseFilter.innerHTML = '<option value="">All Cases</option>';
        
        this.cases.forEach(caseItem => {
            const option = document.createElement('option');
            option.value = caseItem.id;
            option.textContent = `${caseItem.id} - ${caseItem.title}`;
            caseFilter.appendChild(option);
        });

        // Populate author filter
        const authorFilter = document.getElementById('author-filter');
        authorFilter.innerHTML = '<option value="">All Authors</option>';
        
        this.collaborators.forEach(collaborator => {
            const option = document.createElement('option');
            option.value = collaborator.id;
            option.textContent = collaborator.name;
            authorFilter.appendChild(option);
        });
    }

    selectCase(caseId) {
        if (!caseId) {
            document.getElementById('case-info').style.display = 'none';
            this.currentCase = null;
            return;
        }

        this.currentCase = this.cases.find(c => c.id === caseId);
        if (this.currentCase) {
            this.displayCaseInfo();
        }
    }

    displayCaseInfo() {
        const caseInfo = document.getElementById('case-info');
        caseInfo.style.display = 'grid';
        
        caseInfo.innerHTML = `
            <div class="case-field">
                <div class="case-field-label">Case ID</div>
                <div class="case-field-value">${this.currentCase.id}</div>
            </div>
            <div class="case-field">
                <div class="case-field-label">Title</div>
                <div class="case-field-value">${this.currentCase.title}</div>
            </div>
            <div class="case-field">
                <div class="case-field-label">Category</div>
                <div class="case-field-value">${this.currentCase.category}</div>
            </div>
            <div class="case-field">
                <div class="case-field-label">Severity</div>
                <div class="case-field-value">${this.currentCase.severity}</div>
            </div>
            <div class="case-field">
                <div class="case-field-label">Status</div>
                <div class="case-field-value">${this.currentCase.status}</div>
            </div>
            <div class="case-field">
                <div class="case-field-label">Assigned To</div>
                <div class="case-field-value">${this.currentCase.assignedTo}</div>
            </div>
        `;
    }

    updateDisplay() {
        this.updateNotesList();
        this.updateCollaboratorList();
        this.updateTimelineView();
        this.updateCategoriesView();
    }

    updateNotesList() {
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = '';

        // Apply filters
        const filteredNotes = this.getFilteredNotes();

        filteredNotes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            
            const statusClass = `status-${note.status}`;
            const statusText = note.status.charAt(0).toUpperCase() + note.status.slice(1);
            
            noteItem.innerHTML = `
                <div class="note-header">
                    <h4 class="note-title">${note.title}</h4>
                    <div class="note-meta">
                        <div class="note-author">
                            <div class="author-avatar">${this.getInitials(note.author)}</div>
                            <span>${note.author}</span>
                        </div>
                        <span>${note.createdAt.toLocaleDateString()}</span>
                        <span>Case: ${note.caseId}</span>
                    </div>
                </div>
                <div class="note-content">${note.content}</div>
                <div class="note-tags">
                    ${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
                </div>
                <div class="note-actions-bar">
                    <span class="note-status ${statusClass}">${statusText}</span>
                    <div class="note-actions-buttons">
                        ${note.status === 'draft' ? 
                            `<button class="btn btn-success btn-sm" onclick="caseNotes.publishNote(${note.id})">
                                <i class="fas fa-paper-plane"></i> Publish
                            </button>` : ''}
                        <button class="btn btn-primary btn-sm" onclick="caseNotes.editNote(${note.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="caseNotes.deleteNote(${note.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            
            notesList.appendChild(noteItem);
        });
    }

    getFilteredNotes() {
        let filtered = [...this.notes];

        if (this.filters.case) {
            filtered = filtered.filter(n => n.caseId === this.filters.case);
        }
        if (this.filters.author) {
            filtered = filtered.filter(n => n.authorId === this.filters.author);
        }
        if (this.filters.status) {
            filtered = filtered.filter(n => n.status === this.filters.status);
        }
        if (this.filters.date) {
            const filterDate = new Date(this.filters.date);
            filtered = filtered.filter(n => {
                const noteDate = new Date(n.createdAt);
                return noteDate.toDateString() === filterDate.toDateString();
            });
        }

        return filtered;
    }

    updateCollaboratorList() {
        const collaboratorList = document.getElementById('collaborator-list');
        collaboratorList.innerHTML = '';

        this.collaborators.forEach(collaborator => {
            const collaboratorItem = document.createElement('div');
            collaboratorItem.className = 'collaborator-item';
            
            const lastActiveText = this.getLastActiveText(collaborator.lastActive);
            
            collaboratorItem.innerHTML = `
                <div class="collaborator-avatar">${collaborator.avatar}</div>
                <div class="collaborator-info">
                    <h5>${collaborator.name}</h5>
                    <small>${collaborator.role} • ${lastActiveText}</small>
                </div>
            `;
            
            collaboratorList.appendChild(collaboratorItem);
        });
    }

    updateTimelineView() {
        const timelineView = document.getElementById('timeline-view');
        timelineView.innerHTML = '';

        // Sort notes by date
        const sortedNotes = [...this.notes].sort((a, b) => b.createdAt - a.createdAt);

        sortedNotes.forEach(note => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.style.cssText = `
                border-left: 3px solid #667eea;
                padding-left: 20px;
                margin-bottom: 20px;
                position: relative;
            `;
            
            timelineItem.innerHTML = `
                <div style="position: relative;">
                    <div style="position: absolute; left: -11px; top: 0; width: 19px; height: 19px; border-radius: 50%; background: #667eea;"></div>
                    <h5 style="margin: 0 0 5px 0; color: #333;">${note.title}</h5>
                    <p style="margin: 0 0 5px 0; color: #666;">${note.author} • ${note.type} • Case: ${note.caseId}</p>
                    <small style="color: #999;">${note.createdAt.toLocaleDateString()}</small>
                </div>
            `;
            
            timelineView.appendChild(timelineItem);
        });
    }

    updateCategoriesView() {
        const categoriesView = document.getElementById('categories-view');
        categoriesView.innerHTML = '';

        // Group notes by type
        const typeGroups = {};
        this.notes.forEach(note => {
            if (!typeGroups[note.type]) {
                typeGroups[note.type] = [];
            }
            typeGroups[note.type].push(note);
        });

        Object.keys(typeGroups).forEach(type => {
            const typeGroup = document.createElement('div');
            typeGroup.style.cssText = `
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 20px;
            `;
            
            const notes = typeGroups[type];
            const typeTitle = type.charAt(0).toUpperCase() + type.slice(1);
            
            typeGroup.innerHTML = `
                <h4 style="margin: 0 0 15px 0; color: #333;">${typeTitle} Notes</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    ${notes.map(n => `
                        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                            <strong>${n.title}</strong><br>
                            <small style="color: #666;">${n.author} • ${n.status} • ${n.createdAt.toLocaleDateString()}</small>
                        </div>
                    `).join('')}
                </div>
            `;
            
            categoriesView.appendChild(typeGroup);
        });
    }

    updateStatistics() {
        const totalNotes = this.notes.length;
        const draftNotes = this.notes.filter(n => n.status === 'draft').length;
        const collaborators = this.collaborators.length;
        const recentActivity = this.notes.filter(n => {
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return n.createdAt > oneWeekAgo;
        }).length;

        document.getElementById('total-notes').textContent = totalNotes;
        document.getElementById('draft-notes').textContent = draftNotes;
        document.getElementById('collaborators').textContent = collaborators;
        document.getElementById('recent-activity').textContent = recentActivity;
    }

    publishNote() {
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (!this.currentCase) {
            this.showNotification('Please select a case first', 'error');
            return;
        }

        // Create note object
        const note = {
            ...formData,
            id: Date.now(),
            caseId: this.currentCase.id,
            caseTitle: this.currentCase.title,
            author: 'Current User',
            authorId: 'current-user',
            status: 'published',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Add to notes array
        this.notes.unshift(note);
        
        // Update display
        this.updateDisplay();
        this.updateStatistics();
        
        // Reset form
        this.resetForm();
        
        this.showNotification('Note published successfully', 'success');
    }

    saveDraft() {
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (!this.currentCase) {
            this.showNotification('Please select a case first', 'error');
            return;
        }

        // Create draft note
        const note = {
            ...formData,
            id: Date.now(),
            caseId: this.currentCase.id,
            caseTitle: this.currentCase.title,
            author: 'Current User',
            authorId: 'current-user',
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Add to notes array
        this.notes.unshift(note);
        
        // Update display
        this.updateDisplay();
        this.updateStatistics();
        
        // Reset form
        this.resetForm();
        
        this.showNotification('Draft saved successfully', 'success');
    }

    getFormData() {
        return {
            title: document.getElementById('note-title').value,
            type: document.getElementById('note-type').value,
            content: document.getElementById('note-content').value,
            tags: document.getElementById('note-tags').value,
            priority: document.getElementById('note-priority').value
        };
    }

    validateFormData(data) {
        return data.title && data.type && data.content;
    }

    resetForm() {
        document.getElementById('note-form').reset();
        document.getElementById('note-case-selector').value = '';
        document.getElementById('case-info').style.display = 'none';
        this.currentCase = null;
    }

    applyFilters() {
        this.filters.case = document.getElementById('case-filter').value;
        this.filters.author = document.getElementById('author-filter').value;
        this.filters.status = document.getElementById('status-filter').value;
        this.filters.date = document.getElementById('date-filter').value;

        this.updateNotesList();
        this.showNotification('Filters applied successfully', 'success');
    }

    clearFilters() {
        document.getElementById('case-filter').value = '';
        document.getElementById('author-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('date-filter').value = '';

        this.filters = {
            case: '',
            author: '',
            status: '',
            date: ''
        };

        this.updateNotesList();
        this.showNotification('Filters cleared', 'info');
    }

    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            // Populate form with note data
            document.getElementById('note-title').value = note.title;
            document.getElementById('note-type').value = note.type;
            document.getElementById('note-content').value = note.content;
            document.getElementById('note-tags').value = note.tags.join(', ');
            document.getElementById('note-priority').value = note.priority;
            
            // Select the case
            document.getElementById('note-case-selector').value = note.caseId;
            this.selectCase(note.caseId);
            
            this.showNotification('Note loaded for editing', 'info');
        }
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            this.notes = this.notes.filter(n => n.id !== noteId);
            this.updateDisplay();
            this.updateStatistics();
            this.showNotification('Note deleted successfully', 'success');
        }
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    getLastActiveText(lastActive) {
        const now = new Date();
        const diffMs = now - lastActive;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else {
            return `${diffDays}d ago`;
        }
    }

    initializeTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                document.getElementById(`${targetTab}-content`).classList.add('active');
            });
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 500;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Language support
    updateLanguage() {
        const translations = {
            en: {
                'page-title': 'Case Notes',
                'page-subtitle': 'Manage case notes, collaboration, and documentation',
                'filters-title': 'Note Filters',
                'case-filter-label': 'Case Number',
                'author-filter-label': 'Author',
                'status-filter-label': 'Status',
                'date-filter-label': 'Date Range',
                'apply-filters-text': 'Apply Filters',
                'clear-filters-text': 'Clear',
                'create-note-title': 'Create Note',
                'note-case-selector-label': 'Select Case',
                'note-title-label': 'Note Title',
                'note-type-label': 'Note Type',
                'note-content-label': 'Note Content',
                'note-tags-label': 'Tags (comma-separated)',
                'note-priority-label': 'Priority',
                'save-draft-text': 'Save Draft',
                'publish-note-text': 'Publish Note',
                'notes-list-title': 'Notes List',
                'organization-title': 'Notes Organization',
                'collaboration-tab': 'Collaboration',
                'timeline-tab': 'Timeline',
                'categories-tab': 'Categories',
                'collaboration-title': 'Team Collaboration',
                'collaboration-description': 'Manage team members and collaboration settings for case notes.',
                'total-notes-label': 'Total Notes',
                'draft-notes-label': 'Draft Notes',
                'collaborators-label': 'Collaborators',
                'recent-activity-label': 'Recent Activity',
                'lang-text': 'English'
            },
            km: {
                'page-title': 'កំណត់ត្រាករណី',
                'page-subtitle': 'គ្រប់គ្រងកំណត់ត្រាករណី ការសហការ និងឯកសារ',
                'filters-title': 'តម្រងកំណត់ត្រា',
                'case-filter-label': 'លេខករណី',
                'author-filter-label': 'អ្នកនិពន្ធ',
                'status-filter-label': 'ស្ថានភាព',
                'date-filter-label': 'ចន្លោះកាលបរិច្ឆេទ',
                'apply-filters-text': 'អនុវត្តតម្រង',
                'clear-filters-text': 'សម្អាត',
                'create-note-title': 'បង្កើតកំណត់ត្រា',
                'note-case-selector-label': 'ជ្រើសរើសករណី',
                'note-title-label': 'ចំណងជើងកំណត់ត្រា',
                'note-type-label': 'ប្រភេទកំណត់ត្រា',
                'note-content-label': 'មាតិកាកំណត់ត្រា',
                'note-tags-label': 'ស្លាក (បំបែកដោយក្បៀស)',
                'note-priority-label': 'អាទិភាព',
                'save-draft-text': 'រក្សាទុកព្រោះ',
                'publish-note-text': 'បោះពុម្ពកំណត់ត្រា',
                'notes-list-title': 'បញ្ជីកំណត់ត្រា',
                'organization-title': 'ការរៀបចំកំណត់ត្រា',
                'collaboration-tab': 'ការសហការ',
                'timeline-tab': 'ពេលវេលា',
                'categories-tab': 'ប្រភេទ',
                'collaboration-title': 'ការសហការក្រុម',
                'collaboration-description': 'គ្រប់គ្រងសមាជិកក្រុម និងការកំណត់ការសហការសម្រាប់កំណត់ត្រាករណី។',
                'total-notes-label': 'កំណត់ត្រាសរុប',
                'draft-notes-label': 'កំណត់ត្រាព្រោះ',
                'collaborators-label': 'អ្នកសហការ',
                'recent-activity-label': 'សកម្មភាពថ្មីៗ',
                'lang-text': 'ខ្មែរ'
            }
        };

        const currentTranslations = translations[this.currentLanguage];
        Object.keys(currentTranslations).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = currentTranslations[key];
            }
        });
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'km' : 'en';
        this.updateLanguage();
    }
}

// Initialize the system when the page loads
let caseNotes;

document.addEventListener('DOMContentLoaded', () => {
    caseNotes = new CaseNotes();
});

// Global functions for HTML onclick handlers
window.caseNotes = null;

window.toggleLanguage = function() {
    if (caseNotes) {
        caseNotes.toggleLanguage();
    }
};

// Make functions globally accessible
window.publishNote = function(id) {
    if (caseNotes) {
        caseNotes.publishNote(id);
    }
};

window.editNote = function(id) {
    if (caseNotes) {
        caseNotes.editNote(id);
    }
};

window.deleteNote = function(id) {
    if (caseNotes) {
        caseNotes.deleteNote(id);
    }
};
