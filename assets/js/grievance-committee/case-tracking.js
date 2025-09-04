// Case Tracking System
// Grievance Committee - Case Status Tracking and Timeline Management

class CaseTracking {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.cases = [];
        this.filteredCases = [];
        this.selectedCase = null;
        this.timelineEvents = [];
        this.milestones = [];
        this.currentMilestoneFilter = 'all';
        this.unsubscribeCases = null;
        this.unsubscribeTimeline = null;
        this.unsubscribeMilestones = null;
        this.init();
    }

    async init() {
        try {
            console.log('🔧 Initializing Case Tracking System...');
            
            if (!window.Firebase) {
                console.log('⏳ Waiting for Firebase to initialize...');
                setTimeout(() => this.init(), 100);
                return;
            }

            await this.checkAuthentication();
            await this.loadCases();
            this.setupEventListeners();
            this.updateStatistics();
            this.isInitialized = true;
            
            console.log('✅ Case Tracking System initialized');
        } catch (error) {
            console.error('❌ Error initializing Case Tracking System:', error);
        }
    }

    async checkAuthentication() {
        try {
            const { auth, db } = window.Firebase;
            const { doc, getDoc } = window.Firebase;
            
            return new Promise((resolve, reject) => {
                auth.onAuthStateChanged(async (user) => {
                    if (!user) {
                        window.location.href = '../../login.html';
                        reject(new Error('User not authenticated'));
                        return;
                    }

                    try {
                        const userDocRef = doc(db, 'users', user.uid);
                        const userDoc = await getDoc(userDocRef);
                        
                        if (!userDoc.exists()) {
                            window.location.href = '../../login.html';
                            reject(new Error('User document not found'));
                            return;
                        }

                        const userData = userDoc.data();
                        this.currentUser = { id: user.uid, ...userData };
                        
                        if (!['grievance_committee', 'super_admin'].includes(userData.role)) {
                            window.location.href = '../../dashboard.html';
                            reject(new Error('Insufficient permissions'));
                            return;
                        }

                        console.log('✅ Authentication verified for:', userData.name || userData.email);
                        resolve();
                    } catch (error) {
                        console.error('❌ Error checking authentication:', error);
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error('❌ Error in authentication check:', error);
            throw error;
        }
    }

    async loadCases() {
        try {
            console.log('📋 Loading cases for tracking...');
            
            const { db } = window.Firebase;
            const { collection, query, orderBy, onSnapshot } = window.Firebase;
            
            const casesRef = collection(db, 'grievance_cases');
            const casesQuery = query(
                casesRef, 
                orderBy('createdAt', 'desc')
            );
            
            this.unsubscribeCases = onSnapshot(casesQuery, (snapshot) => {
                this.cases = [];
                snapshot.forEach((doc) => {
                    this.cases.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log(`✅ Loaded ${this.cases.length} cases for tracking`);
                this.filteredCases = [...this.cases];
                this.updateCasesGrid();
                this.updateStatistics();
            }, (error) => {
                console.error('❌ Error loading cases:', error);
                this.loadSampleCases();
            });
            
        } catch (error) {
            console.error('❌ Error in loadCases:', error);
            this.loadSampleCases();
        }
    }

    loadSampleCases() {
        console.log('📋 Loading sample cases for tracking development...');
        
        this.cases = [
            {
                id: 'case_001',
                trackingNumber: 'GC-2024-001',
                caseTitle: 'Verbal Harassment by Supervisor',
                description: 'Worker reported being verbally harassed by their supervisor during shift.',
                category: 'harassment',
                severity: 'high',
                priority: 'high',
                status: 'investigating',
                assignedTo: 'inv_001',
                assignedToName: 'John Doe',
                workerId: 'W001',
                workerName: 'John Smith',
                department: 'Production',
                incidentDate: '2024-01-15',
                location: 'Factory Floor - Section A',
                createdAt: new Date('2024-01-15T10:30:00'),
                expectedCompletionDate: '2024-01-25',
                triageNotes: 'Requires immediate attention. Multiple witnesses available.'
            },
            {
                id: 'case_002',
                trackingNumber: 'GC-2024-002',
                caseTitle: 'Overtime Pay Dispute',
                description: 'Worker claims overtime hours were not properly calculated and paid.',
                category: 'wage',
                severity: 'medium',
                priority: 'medium',
                status: 'assigned',
                assignedTo: 'inv_002',
                assignedToName: 'Jane Smith',
                workerId: 'W002',
                workerName: 'Maria Garcia',
                department: 'Assembly',
                incidentDate: '2024-01-14',
                location: 'Payroll Office',
                createdAt: new Date('2024-01-15T14:15:00'),
                expectedCompletionDate: '2024-01-30',
                triageNotes: 'Has pay stubs and time records. Affects multiple workers.'
            },
            {
                id: 'case_003',
                trackingNumber: 'GC-2024-003',
                caseTitle: 'Safety Equipment Malfunction',
                description: 'Safety equipment malfunction reported. Could pose serious risk to workers.',
                category: 'safety',
                severity: 'critical',
                priority: 'critical',
                status: 'resolved',
                assignedTo: 'inv_003',
                assignedToName: 'Mike Johnson',
                workerId: null,
                workerName: null,
                department: null,
                incidentDate: '2024-01-16',
                location: 'Warehouse - Loading Area',
                createdAt: new Date('2024-01-16T08:45:00'),
                expectedCompletionDate: '2024-01-20',
                resolvedDate: new Date('2024-01-19T16:30:00'),
                triageNotes: 'Anonymous report. Equipment ID: WH-001. Multiple workers affected.'
            }
        ];
        
        this.filteredCases = [...this.cases];
        this.updateCasesGrid();
        this.updateStatistics();
    }

    async loadTimelineEvents(caseId) {
        try {
            console.log('📅 Loading timeline events for case:', caseId);
            
            const { db } = window.Firebase;
            const { collection, query, where, orderBy, onSnapshot } = window.Firebase;
            
            const timelineRef = collection(db, 'case_timeline');
            const timelineQuery = query(
                timelineRef, 
                where('caseId', '==', caseId),
                orderBy('timestamp', 'asc')
            );
            
            this.unsubscribeTimeline = onSnapshot(timelineQuery, (snapshot) => {
                this.timelineEvents = [];
                snapshot.forEach((doc) => {
                    this.timelineEvents.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log(`✅ Loaded ${this.timelineEvents.length} timeline events`);
                this.updateTimeline();
            }, (error) => {
                console.error('❌ Error loading timeline events:', error);
                this.loadSampleTimelineEvents(caseId);
            });
            
        } catch (error) {
            console.error('❌ Error in loadTimelineEvents:', error);
            this.loadSampleTimelineEvents(caseId);
        }
    }

    loadSampleTimelineEvents(caseId) {
        console.log('📅 Loading sample timeline events for development...');
        
        this.timelineEvents = [
            {
                id: 'event_001',
                caseId: caseId,
                eventType: 'case_created',
                title: 'Case Created',
                description: 'Grievance case was submitted and created in the system',
                timestamp: new Date('2024-01-15T10:30:00'),
                status: 'completed',
                assignedTo: null,
                notes: 'Initial case creation'
            },
            {
                id: 'event_002',
                caseId: caseId,
                eventType: 'case_triaged',
                title: 'Case Triaged',
                description: 'Case was reviewed and categorized during triage process',
                timestamp: new Date('2024-01-15T14:00:00'),
                status: 'completed',
                assignedTo: 'grievance_committee',
                notes: 'Case categorized as high priority harassment case'
            },
            {
                id: 'event_003',
                caseId: caseId,
                eventType: 'case_assigned',
                title: 'Case Assigned',
                description: 'Case was assigned to investigator for investigation',
                timestamp: new Date('2024-01-16T09:00:00'),
                status: 'completed',
                assignedTo: 'inv_001',
                notes: 'Assigned to John Doe for investigation'
            },
            {
                id: 'event_004',
                caseId: caseId,
                eventType: 'investigation_started',
                title: 'Investigation Started',
                description: 'Investigator began the investigation process',
                timestamp: new Date('2024-01-17T10:00:00'),
                status: 'completed',
                assignedTo: 'inv_001',
                notes: 'Initial interviews scheduled with witnesses'
            },
            {
                id: 'event_005',
                caseId: caseId,
                eventType: 'investigation_in_progress',
                title: 'Investigation In Progress',
                description: 'Investigation is currently ongoing',
                timestamp: new Date('2024-01-19T11:00:00'),
                status: 'current',
                assignedTo: 'inv_001',
                notes: 'Final interviews with involved parties scheduled'
            }
        ];
        
        this.updateTimeline();
    }

    async loadMilestones(caseId) {
        try {
            console.log('🎯 Loading milestones for case:', caseId);
            
            const { db } = window.Firebase;
            const { collection, query, where, orderBy, onSnapshot } = window.Firebase;
            
            const milestonesRef = collection(db, 'case_milestones');
            const milestonesQuery = query(
                milestonesRef, 
                where('caseId', '==', caseId),
                orderBy('dueDate', 'asc')
            );
            
            this.unsubscribeMilestones = onSnapshot(milestonesQuery, (snapshot) => {
                this.milestones = [];
                snapshot.forEach((doc) => {
                    this.milestones.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log(`✅ Loaded ${this.milestones.length} milestones`);
                this.updateMilestones();
            }, (error) => {
                console.error('❌ Error loading milestones:', error);
                this.loadSampleMilestones(caseId);
            });
            
        } catch (error) {
            console.error('❌ Error in loadMilestones:', error);
            this.loadSampleMilestones(caseId);
        }
    }

    loadSampleMilestones(caseId) {
        console.log('🎯 Loading sample milestones for development...');
        
        this.milestones = [
            {
                id: 'milestone_001',
                caseId: caseId,
                title: 'Initial Case Review',
                description: 'Complete initial review and categorization of the case',
                dueDate: new Date('2024-01-16T17:00:00'),
                completedDate: new Date('2024-01-15T14:00:00'),
                status: 'completed',
                assignedTo: 'grievance_committee',
                assignedToName: 'Grievance Committee',
                priority: 'high'
            },
            {
                id: 'milestone_002',
                caseId: caseId,
                title: 'Investigator Assignment',
                description: 'Assign case to appropriate investigator',
                dueDate: new Date('2024-01-17T17:00:00'),
                completedDate: new Date('2024-01-16T09:00:00'),
                status: 'completed',
                assignedTo: 'inv_001',
                assignedToName: 'John Doe',
                priority: 'high'
            },
            {
                id: 'milestone_003',
                caseId: caseId,
                title: 'Investigation Report',
                description: 'Complete investigation report with findings and recommendations',
                dueDate: new Date('2024-01-25T17:00:00'),
                completedDate: null,
                status: 'current',
                assignedTo: 'inv_001',
                assignedToName: 'John Doe',
                priority: 'high'
            },
            {
                id: 'milestone_004',
                caseId: caseId,
                title: 'Case Resolution',
                description: 'Final case resolution and closure',
                dueDate: new Date('2024-02-05T17:00:00'),
                completedDate: null,
                status: 'pending',
                assignedTo: 'inv_001',
                assignedToName: 'John Doe',
                priority: 'high'
            }
        ];
        
        this.updateMilestones();
    }

    updateCasesGrid() {
        try {
            const casesGrid = document.getElementById('casesGrid');
            
            if (this.filteredCases.length === 0) {
                casesGrid.innerHTML = '<div style="text-align: center; padding: var(--space-8); color: var(--neutral-500);">No cases found</div>';
                return;
            }
            
            const casesHTML = this.filteredCases.map(caseItem => {
                const isUrgent = caseItem.priority === 'high' || caseItem.priority === 'critical';
                const isSelected = this.selectedCase && this.selectedCase.id === caseItem.id;
                const progressClass = this.getProgressClass(caseItem.status);
                const progressWidth = this.getProgressWidth(caseItem.status);
                
                return `
                    <div class="case-card ${isUrgent ? 'urgent' : ''} ${isSelected ? 'selected' : ''}" 
                         onclick="selectCase('${caseItem.id}')">
                        <div class="case-card-header">
                            <div class="case-number">${caseItem.trackingNumber}</div>
                            <div class="case-status status-${caseItem.status}">${this.formatStatus(caseItem.status)}</div>
                        </div>
                        <div class="case-title">${caseItem.caseTitle}</div>
                        <div class="case-meta">
                            <span class="case-tag tag-priority">${this.formatPriority(caseItem.priority)}</span>
                            <span class="case-tag tag-category">${this.formatCategory(caseItem.category)}</span>
                            ${caseItem.assignedToName ? `<span class="case-tag tag-assigned">${caseItem.assignedToName}</span>` : ''}
                        </div>
                        <div class="case-progress">
                            <div class="progress-bar">
                                <div class="progress-fill ${progressClass}" style="width: ${progressWidth}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            casesGrid.innerHTML = casesHTML;
            console.log('📋 Cases grid updated');
        } catch (error) {
            console.error('❌ Error updating cases grid:', error);
        }
    }

    selectCase(caseId) {
        try {
            this.selectedCase = this.cases.find(c => c.id === caseId);
            if (!this.selectedCase) return;
            
            // Update visual selection
            document.querySelectorAll('.case-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            const selectedCard = document.querySelector(`[onclick="selectCase('${caseId}')"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }
            
            // Show tracking dashboard
            document.getElementById('trackingDashboard').style.display = 'grid';
            document.getElementById('milestonesSection').style.display = 'block';
            
            // Update case details
            this.updateCaseDetails();
            
            // Load timeline and milestones
            this.loadTimelineEvents(caseId);
            this.loadMilestones(caseId);
            
            console.log('📋 Case selected for tracking:', caseId);
        } catch (error) {
            console.error('❌ Error selecting case:', error);
        }
    }

    updateCaseDetails() {
        try {
            if (!this.selectedCase) return;
            
            // Update case information
            document.getElementById('caseNumber').textContent = this.selectedCase.trackingNumber;
            document.getElementById('caseStatus').textContent = this.formatStatus(this.selectedCase.status);
            document.getElementById('casePriority').textContent = this.formatPriority(this.selectedCase.priority);
            document.getElementById('caseCategory').textContent = this.formatCategory(this.selectedCase.category);
            document.getElementById('caseAssignedTo').textContent = this.selectedCase.assignedToName || 'Unassigned';
            document.getElementById('caseCreatedDate').textContent = this.formatDate(this.selectedCase.createdAt);
            document.getElementById('caseExpectedCompletion').textContent = this.formatDate(this.selectedCase.expectedCompletionDate);
            
            // Calculate days remaining
            const daysRemaining = this.calculateDaysRemaining(this.selectedCase.expectedCompletionDate);
            const daysRemainingElement = document.getElementById('caseDaysRemaining');
            daysRemainingElement.textContent = daysRemaining;
            if (daysRemaining < 0) {
                daysRemainingElement.classList.add('urgent');
            } else {
                daysRemainingElement.classList.remove('urgent');
            }
            
            // Update case description
            document.getElementById('caseDescription').textContent = this.selectedCase.description;
            
            console.log('📝 Case details updated');
        } catch (error) {
            console.error('❌ Error updating case details:', error);
        }
    }

    updateTimeline() {
        try {
            const timelineEvents = document.getElementById('timelineEvents');
            
            if (this.timelineEvents.length === 0) {
                timelineEvents.innerHTML = '<div style="text-align: center; padding: var(--space-8); color: var(--neutral-500);">No timeline events</div>';
                return;
            }
            
            const timelineHTML = this.timelineEvents.map(event => {
                const dotClass = this.getTimelineDotClass(event.status);
                const tagClass = this.getTimelineTagClass(event.status);
                
                return `
                    <div class="timeline-item">
                        <div class="timeline-dot ${dotClass}"></div>
                        <div class="timeline-content">
                            <div class="timeline-header-content">
                                <div class="timeline-step">${event.title}</div>
                                <div class="timeline-date">${this.formatDate(event.timestamp)}</div>
                            </div>
                            <div class="timeline-description">${event.description}</div>
                            <div class="timeline-meta">
                                <span class="timeline-tag ${tagClass}">${this.formatStatus(event.status)}</span>
                                ${event.assignedTo ? `<span class="timeline-tag tag-assigned">${event.assignedTo}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            timelineEvents.innerHTML = timelineHTML;
            console.log('📅 Timeline updated');
        } catch (error) {
            console.error('❌ Error updating timeline:', error);
        }
    }

    updateMilestones() {
        try {
            const milestonesGrid = document.getElementById('milestonesGrid');
            
            if (this.milestones.length === 0) {
                milestonesGrid.innerHTML = '<div style="text-align: center; padding: var(--space-8); color: var(--neutral-500);">No milestones</div>';
                return;
            }
            
            const filteredMilestones = this.filterMilestonesByStatus();
            
            const milestonesHTML = filteredMilestones.map(milestone => {
                const cardClass = this.getMilestoneCardClass(milestone.status);
                const statusClass = this.getMilestoneStatusClass(milestone.status);
                
                return `
                    <div class="milestone-card ${cardClass}">
                        <div class="milestone-header">
                            <div class="milestone-title">${milestone.title}</div>
                            <div class="milestone-status ${statusClass}">${this.formatStatus(milestone.status)}</div>
                        </div>
                        <div class="milestone-description">${milestone.description}</div>
                        <div class="milestone-meta">
                            <div class="milestone-date">Due: ${this.formatDate(milestone.dueDate)}</div>
                            <div class="milestone-assignee">${milestone.assignedToName}</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            milestonesGrid.innerHTML = milestonesHTML;
            console.log('🎯 Milestones updated');
        } catch (error) {
            console.error('❌ Error updating milestones:', error);
        }
    }

    filterMilestonesByStatus() {
        try {
            if (this.currentMilestoneFilter === 'all') {
                return this.milestones;
            }
            
            return this.milestones.filter(milestone => {
                switch (this.currentMilestoneFilter) {
                    case 'completed':
                        return milestone.status === 'completed';
                    case 'current':
                        return milestone.status === 'current';
                    case 'overdue':
                        return this.isMilestoneOverdue(milestone);
                    default:
                        return true;
                }
            });
        } catch (error) {
            console.error('❌ Error filtering milestones:', error);
            return this.milestones;
        }
    }

    isMilestoneOverdue(milestone) {
        try {
            if (milestone.status === 'completed') return false;
            const dueDate = new Date(milestone.dueDate);
            const today = new Date();
            return dueDate < today;
        } catch (error) {
            console.error('❌ Error checking milestone overdue status:', error);
            return false;
        }
    }

    updateStatistics() {
        try {
            const totalCases = this.cases.length;
            const activeCases = this.cases.filter(c => ['new', 'assigned', 'investigating'].includes(c.status)).length;
            const completedCases = this.cases.filter(c => ['resolved', 'closed'].includes(c.status)).length;
            const overdueMilestones = this.milestones.filter(m => this.isMilestoneOverdue(m)).length;
            
            document.getElementById('totalCases').textContent = totalCases;
            document.getElementById('activeCases').textContent = activeCases;
            document.getElementById('completedCases').textContent = completedCases;
            document.getElementById('overdueMilestones').textContent = overdueMilestones;
            
            console.log('📊 Statistics updated');
        } catch (error) {
            console.error('❌ Error updating statistics:', error);
        }
    }

    searchCases() {
        try {
            const searchTerm = document.getElementById('caseSearch').value.toLowerCase();
            
            this.filteredCases = this.cases.filter(caseItem => {
                return caseItem.trackingNumber.toLowerCase().includes(searchTerm) ||
                       caseItem.caseTitle.toLowerCase().includes(searchTerm) ||
                       (caseItem.assignedToName && caseItem.assignedToName.toLowerCase().includes(searchTerm)) ||
                       caseItem.workerName?.toLowerCase().includes(searchTerm);
            });
            
            this.updateCasesGrid();
            console.log(`🔍 Filtered to ${this.filteredCases.length} cases`);
        } catch (error) {
            console.error('❌ Error searching cases:', error);
        }
    }

    filterMilestones(filter) {
        try {
            this.currentMilestoneFilter = filter;
            this.updateMilestones();
            
            // Update filter button states
            document.querySelectorAll('.milestones-actions .btn').forEach(btn => {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline');
            });
            
            // Highlight active filter
            const activeBtn = document.querySelector(`[onclick="filterMilestones('${filter}')"]`);
            if (activeBtn) {
                activeBtn.classList.remove('btn-outline');
                activeBtn.classList.add('btn-primary');
            }
            
            console.log(`🔍 Milestone filter applied: ${filter}`);
        } catch (error) {
            console.error('❌ Error applying milestone filter:', error);
        }
    }

    // Utility functions
    getProgressClass(status) {
        const progressMap = {
            'new': 'progress-new',
            'assigned': 'progress-assigned',
            'investigating': 'progress-investigating',
            'resolved': 'progress-resolved',
            'closed': 'progress-closed'
        };
        return progressMap[status] || 'progress-new';
    }

    getProgressWidth(status) {
        const widthMap = {
            'new': 20,
            'assigned': 40,
            'investigating': 70,
            'resolved': 90,
            'closed': 100
        };
        return widthMap[status] || 20;
    }

    getTimelineDotClass(status) {
        const dotMap = {
            'completed': 'completed',
            'current': 'current',
            'pending': 'pending'
        };
        return dotMap[status] || 'pending';
    }

    getTimelineTagClass(status) {
        const tagMap = {
            'completed': 'tag-completed',
            'current': 'tag-current',
            'pending': 'tag-pending'
        };
        return tagMap[status] || 'tag-pending';
    }

    getMilestoneCardClass(status) {
        const cardMap = {
            'completed': 'completed',
            'current': 'current',
            'overdue': 'overdue'
        };
        return cardMap[status] || '';
    }

    getMilestoneStatusClass(status) {
        const statusMap = {
            'completed': 'status-completed',
            'current': 'status-current',
            'overdue': 'status-overdue',
            'pending': 'status-pending'
        };
        return statusMap[status] || 'status-pending';
    }

    formatStatus(status) {
        const statusMap = {
            'new': 'New',
            'assigned': 'Assigned',
            'investigating': 'Investigating',
            'resolved': 'Resolved',
            'closed': 'Closed',
            'completed': 'Completed',
            'current': 'Current',
            'pending': 'Pending',
            'overdue': 'Overdue'
        };
        return statusMap[status] || status;
    }

    formatPriority(priority) {
        const priorityMap = {
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High',
            'critical': 'Critical'
        };
        return priorityMap[priority] || priority;
    }

    formatCategory(category) {
        const categoryMap = {
            'harassment': 'Harassment',
            'wage': 'Wage Issues',
            'safety': 'Safety Concerns',
            'discrimination': 'Discrimination',
            'working_conditions': 'Working Conditions',
            'other': 'Other'
        };
        return categoryMap[category] || category;
    }

    formatDate(date) {
        try {
            if (!date) return '-';
            const dateObj = new Date(date);
            return dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '-';
        }
    }

    calculateDaysRemaining(expectedDate) {
        try {
            if (!expectedDate) return '-';
            const expected = new Date(expectedDate);
            const today = new Date();
            const diffTime = expected - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (error) {
            return '-';
        }
    }

    async refreshTracking() {
        try {
            console.log('🔄 Refreshing tracking data...');
            
            const refreshBtn = document.getElementById('refreshBtn');
            const originalHTML = refreshBtn.innerHTML;
            
            refreshBtn.innerHTML = '<div class="loading-spinner"></div> Refreshing...';
            refreshBtn.disabled = true;
            
            // Reload data
            if (this.unsubscribeCases) this.unsubscribeCases();
            if (this.unsubscribeTimeline) this.unsubscribeTimeline();
            if (this.unsubscribeMilestones) this.unsubscribeMilestones();
            
            await this.loadCases();
            
            if (this.selectedCase) {
                await this.loadTimelineEvents(this.selectedCase.id);
                await this.loadMilestones(this.selectedCase.id);
            }
            
            this.updateStatistics();
            
            refreshBtn.innerHTML = originalHTML;
            refreshBtn.disabled = false;
            
            console.log('🔄 Tracking data refreshed');
        } catch (error) {
            console.error('❌ Error refreshing tracking data:', error);
        }
    }

    exportTracking() {
        try {
            console.log('📤 Exporting tracking data...');
            alert('Export functionality will be implemented in the next iteration');
        } catch (error) {
            console.error('❌ Error exporting tracking data:', error);
        }
    }

    addMilestone() {
        try {
            console.log('➕ Adding milestone...');
            alert('Add milestone functionality will be implemented in the next iteration');
        } catch (error) {
            console.error('❌ Error adding milestone:', error);
        }
    }

    editCase() {
        try {
            console.log('✏️ Editing case...');
            alert('Edit case functionality will be implemented in the next iteration');
        } catch (error) {
            console.error('❌ Error editing case:', error);
        }
    }

    viewFullCase() {
        try {
            console.log('👁️ Viewing full case...');
            if (this.selectedCase) {
                window.open(`case-management.html?case=${this.selectedCase.id}`, '_blank');
            }
        } catch (error) {
            console.error('❌ Error viewing full case:', error);
        }
    }

    addTimelineEvent() {
        try {
            console.log('➕ Adding timeline event...');
            alert('Add timeline event functionality will be implemented in the next iteration');
        } catch (error) {
            console.error('❌ Error adding timeline event:', error);
        }
    }

    exportTimeline() {
        try {
            console.log('📤 Exporting timeline...');
            alert('Export timeline functionality will be implemented in the next iteration');
        } catch (error) {
            console.error('❌ Error exporting timeline:', error);
        }
    }

    setupEventListeners() {
        try {
            // Add search input event listener
            const searchInput = document.getElementById('caseSearch');
            if (searchInput) {
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.searchCases();
                    }
                });
            }
            
            console.log('🎧 Event listeners set up');
        } catch (error) {
            console.error('❌ Error setting up event listeners:', error);
        }
    }

    // Cleanup
    destroy() {
        if (this.unsubscribeCases) {
            this.unsubscribeCases();
        }
        if (this.unsubscribeTimeline) {
            this.unsubscribeTimeline();
        }
        if (this.unsubscribeMilestones) {
            this.unsubscribeMilestones();
        }
        console.log('🧹 Case Tracking System destroyed');
    }
}

// Global functions for HTML onclick handlers
window.selectCase = (caseId) => window.caseTracking?.selectCase(caseId);
window.searchCases = () => window.caseTracking?.searchCases();
window.filterMilestones = (filter) => window.caseTracking?.filterMilestones(filter);
window.refreshTracking = () => window.caseTracking?.refreshTracking();
window.exportTracking = () => window.caseTracking?.exportTracking();
window.addMilestone = () => window.caseTracking?.addMilestone();
window.editCase = () => window.caseTracking?.editCase();
window.viewFullCase = () => window.caseTracking?.viewFullCase();
window.addTimelineEvent = () => window.caseTracking?.addTimelineEvent();
window.exportTimeline = () => window.caseTracking?.exportTimeline();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.caseTracking = new CaseTracking();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.caseTracking) {
        window.caseTracking.destroy();
    }
});
