// Case Assignment Panel
// Grievance Committee - Case Assignment and Workload Management

class CaseAssignment {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.cases = [];
        this.investigators = [];
        this.filteredCases = [];
        this.filteredInvestigators = [];
        this.selectedCase = null;
        this.selectedInvestigator = null;
        this.currentCaseFilter = 'all';
        this.currentInvestigatorFilter = 'all';
        this.unsubscribeCases = null;
        this.unsubscribeInvestigators = null;
        this.init();
    }

    async init() {
        try {
            console.log('🔧 Initializing Case Assignment Panel...');
            
            if (!window.Firebase) {
                console.log('⏳ Waiting for Firebase to initialize...');
                setTimeout(() => this.init(), 100);
                return;
            }

            await this.checkAuthentication();
            await this.loadCases();
            await this.loadInvestigators();
            this.setupEventListeners();
            this.updateStatistics();
            this.isInitialized = true;
            
            console.log('✅ Case Assignment Panel initialized');
        } catch (error) {
            console.error('❌ Error initializing Case Assignment Panel:', error);
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
            console.log('📋 Loading cases for assignment...');
            
            const { db } = window.Firebase;
            const { collection, query, where, orderBy, onSnapshot } = window.Firebase;
            
            const casesRef = collection(db, 'grievance_cases');
            const casesQuery = query(
                casesRef, 
                where('status', '==', 'assigned'),
                orderBy('priority', 'desc'),
                orderBy('createdAt', 'asc')
            );
            
            this.unsubscribeCases = onSnapshot(casesQuery, (snapshot) => {
                this.cases = [];
                snapshot.forEach((doc) => {
                    const caseData = doc.data();
                    if (!caseData.assignedTo) {
                        this.cases.push({
                            id: doc.id,
                            ...caseData
                        });
                    }
                });
                
                console.log(`✅ Loaded ${this.cases.length} cases for assignment`);
                this.filterCases();
                this.updateCasesList();
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
        console.log('📋 Loading sample cases for assignment development...');
        
        this.cases = [
            {
                id: 'case_001',
                trackingNumber: 'GC-2024-001',
                caseTitle: 'Verbal Harassment by Supervisor',
                description: 'Worker reported being verbally harassed by their supervisor during shift.',
                category: 'harassment',
                severity: 'high',
                priority: 'high',
                status: 'assigned',
                assignedTo: null,
                isAnonymous: false,
                workerId: 'W001',
                workerName: 'John Smith',
                department: 'Production',
                incidentDate: '2024-01-15',
                location: 'Factory Floor - Section A',
                createdAt: new Date('2024-01-15T10:30:00'),
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
                assignedTo: null,
                isAnonymous: false,
                workerId: 'W002',
                workerName: 'Maria Garcia',
                department: 'Assembly',
                incidentDate: '2024-01-14',
                location: 'Payroll Office',
                createdAt: new Date('2024-01-15T14:15:00'),
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
                status: 'assigned',
                assignedTo: null,
                isAnonymous: true,
                workerId: null,
                workerName: null,
                department: null,
                incidentDate: '2024-01-16',
                location: 'Warehouse - Loading Area',
                createdAt: new Date('2024-01-16T08:45:00'),
                triageNotes: 'Anonymous report. Equipment ID: WH-001. Multiple workers affected.'
            }
        ];
        
        this.filterCases();
        this.updateCasesList();
    }

    async loadInvestigators() {
        try {
            console.log('👥 Loading investigators...');
            
            const { db } = window.Firebase;
            const { collection, query, where, onSnapshot } = window.Firebase;
            
            const investigatorsRef = collection(db, 'users');
            const investigatorsQuery = query(
                investigatorsRef, 
                where('role', '==', 'investigator')
            );
            
            this.unsubscribeInvestigators = onSnapshot(investigatorsQuery, (snapshot) => {
                this.investigators = [];
                snapshot.forEach((doc) => {
                    this.investigators.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log(`✅ Loaded ${this.investigators.length} investigators`);
                this.filterInvestigators();
                this.updateInvestigatorsList();
            }, (error) => {
                console.error('❌ Error loading investigators:', error);
                this.loadSampleInvestigators();
            });
            
        } catch (error) {
            console.error('❌ Error in loadInvestigators:', error);
            this.loadSampleInvestigators();
        }
    }

    loadSampleInvestigators() {
        console.log('👥 Loading sample investigators for development...');
        
        this.investigators = [
            {
                id: 'inv_001',
                name: 'John Doe',
                email: 'john.doe@company.com',
                role: 'investigator',
                specialties: ['harassment', 'discrimination'],
                currentWorkload: 3,
                maxWorkload: 8,
                status: 'available',
                experience: '5 years',
                department: 'HR Investigations',
                phone: '+855-123-456-789',
                location: 'Main Office'
            },
            {
                id: 'inv_002',
                name: 'Jane Smith',
                email: 'jane.smith@company.com',
                role: 'investigator',
                specialties: ['wage', 'benefits'],
                currentWorkload: 5,
                maxWorkload: 8,
                status: 'busy',
                experience: '7 years',
                department: 'Payroll & Benefits',
                phone: '+855-987-654-321',
                location: 'Finance Building'
            },
            {
                id: 'inv_003',
                name: 'Mike Johnson',
                email: 'mike.johnson@company.com',
                role: 'investigator',
                specialties: ['safety', 'working_conditions'],
                currentWorkload: 7,
                maxWorkload: 8,
                status: 'overloaded',
                experience: '3 years',
                department: 'Safety & Compliance',
                phone: '+855-555-123-456',
                location: 'Safety Office'
            }
        ];
        
        this.filterInvestigators();
        this.updateInvestigatorsList();
    }

    filterCases() {
        try {
            this.filteredCases = this.cases.filter(caseItem => {
                switch (this.currentCaseFilter) {
                    case 'urgent':
                        return caseItem.priority === 'high' || caseItem.priority === 'critical';
                    case 'anonymous':
                        return caseItem.isAnonymous;
                    default:
                        return true;
                }
            });
            
            console.log(`🔍 Filtered to ${this.filteredCases.length} cases`);
        } catch (error) {
            console.error('❌ Error filtering cases:', error);
        }
    }

    filterInvestigators() {
        try {
            this.filteredInvestigators = this.investigators.filter(investigator => {
                switch (this.currentInvestigatorFilter) {
                    case 'available':
                        return investigator.status === 'available';
                    case 'specialists':
                        return investigator.specialties && investigator.specialties.length > 0;
                    default:
                        return true;
                }
            });
            
            console.log(`🔍 Filtered to ${this.filteredInvestigators.length} investigators`);
        } catch (error) {
            console.error('❌ Error filtering investigators:', error);
        }
    }

    updateCasesList() {
        try {
            const casesList = document.getElementById('casesList');
            
            if (this.filteredCases.length === 0) {
                casesList.innerHTML = '<div style="text-align: center; padding: var(--space-8); color: var(--neutral-500);">No cases pending assignment</div>';
                return;
            }
            
            const casesHTML = this.filteredCases.map(caseItem => {
                const isUrgent = caseItem.priority === 'high' || caseItem.priority === 'critical';
                const isSelected = this.selectedCase && this.selectedCase.id === caseItem.id;
                
                return `
                    <div class="case-item ${isUrgent ? 'urgent' : ''} ${isSelected ? 'selected' : ''}" 
                         onclick="selectCase('${caseItem.id}')">
                        <div class="case-header">
                            <div class="case-number">${caseItem.trackingNumber}</div>
                            <div class="case-priority priority-${caseItem.priority}">${this.formatPriority(caseItem.priority)}</div>
                        </div>
                        <div class="case-title">${caseItem.caseTitle}</div>
                        <div class="case-category">${this.formatCategory(caseItem.category)}</div>
                        <div class="case-meta">
                            <span class="case-tag tag-unassigned">Unassigned</span>
                            ${isUrgent ? '<span class="case-tag tag-urgent">Urgent</span>' : ''}
                            ${caseItem.isAnonymous ? '<span class="case-tag tag-anonymous">Anonymous</span>' : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            casesList.innerHTML = casesHTML;
            console.log('📋 Cases list updated');
        } catch (error) {
            console.error('❌ Error updating cases list:', error);
        }
    }

    updateInvestigatorsList() {
        try {
            const investigatorsList = document.getElementById('investigatorsList');
            
            if (this.filteredInvestigators.length === 0) {
                investigatorsList.innerHTML = '<div style="text-align: center; padding: var(--space-8); color: var(--neutral-500);">No investigators available</div>';
                return;
            }
            
            const investigatorsHTML = this.filteredInvestigators.map(investigator => {
                const isSelected = this.selectedInvestigator && this.selectedInvestigator.id === investigator.id;
                const isOverloaded = investigator.currentWorkload >= investigator.maxWorkload;
                const workloadPercentage = Math.round((investigator.currentWorkload / investigator.maxWorkload) * 100);
                const workloadClass = workloadPercentage < 60 ? 'good' : workloadPercentage < 80 ? 'warning' : 'critical';
                
                return `
                    <div class="investigator-card ${isOverloaded ? 'overloaded' : ''} ${isSelected ? 'selected' : ''}" 
                         onclick="selectInvestigator('${investigator.id}')">
                        <div class="investigator-header">
                            <div class="investigator-name">${investigator.name}</div>
                            <div class="investigator-status status-${investigator.status}">${this.formatStatus(investigator.status)}</div>
                        </div>
                        <div class="investigator-specialties">
                            ${investigator.specialties ? investigator.specialties.map(specialty => 
                                `<span class="specialty-tag">${this.formatCategory(specialty)}</span>`
                            ).join('') : ''}
                        </div>
                        <div class="workload-info">
                            <div class="workload-item">
                                <div class="workload-value">${investigator.currentWorkload}/${investigator.maxWorkload}</div>
                                <div class="workload-label">Active Cases</div>
                                <div class="workload-bar">
                                    <div class="workload-fill workload-${workloadClass}" style="width: ${workloadPercentage}%"></div>
                                </div>
                            </div>
                            <div class="workload-item">
                                <div class="workload-value">${investigator.experience}</div>
                                <div class="workload-label">Experience</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            investigatorsList.innerHTML = investigatorsHTML;
            console.log('👥 Investigators list updated');
        } catch (error) {
            console.error('❌ Error updating investigators list:', error);
        }
    }

    selectCase(caseId) {
        try {
            this.selectedCase = this.cases.find(c => c.id === caseId);
            if (!this.selectedCase) return;
            
            document.querySelectorAll('.case-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            const selectedItem = document.querySelector(`[onclick="selectCase('${caseId}')"]`);
            if (selectedItem) {
                selectedItem.classList.add('selected');
            }
            
            document.getElementById('assignBtn').disabled = false;
            this.checkAssignmentReadiness();
            
            console.log('📋 Case selected:', caseId);
        } catch (error) {
            console.error('❌ Error selecting case:', error);
        }
    }

    selectInvestigator(investigatorId) {
        try {
            this.selectedInvestigator = this.investigators.find(i => i.id === investigatorId);
            if (!this.selectedInvestigator) return;
            
            document.querySelectorAll('.investigator-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            const selectedCard = document.querySelector(`[onclick="selectInvestigator('${investigatorId}')"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }
            
            this.checkAssignmentReadiness();
            
            console.log('👥 Investigator selected:', investigatorId);
        } catch (error) {
            console.error('❌ Error selecting investigator:', error);
        }
    }

    checkAssignmentReadiness() {
        try {
            if (this.selectedCase && this.selectedInvestigator) {
                this.showAssignmentActions();
                this.updateAssignmentForm();
            }
        } catch (error) {
            console.error('❌ Error checking assignment readiness:', error);
        }
    }

    showAssignmentActions() {
        try {
            document.getElementById('assignmentActions').style.display = 'block';
        } catch (error) {
            console.error('❌ Error showing assignment actions:', error);
        }
    }

    updateAssignmentForm() {
        try {
            if (!this.selectedCase || !this.selectedInvestigator) return;
            
            const caseInfo = `
                <strong>${this.selectedCase.trackingNumber}</strong><br>
                ${this.selectedCase.caseTitle}<br>
                <small>Category: ${this.formatCategory(this.selectedCase.category)} | Priority: ${this.formatPriority(this.selectedCase.priority)}</small>
            `;
            document.getElementById('selectedCaseInfo').innerHTML = caseInfo;
            
            const investigatorInfo = `
                <strong>${this.selectedInvestigator.name}</strong><br>
                ${this.selectedInvestigator.department}<br>
                <small>Workload: ${this.selectedInvestigator.currentWorkload}/${this.selectedInvestigator.maxWorkload} | Status: ${this.formatStatus(this.selectedInvestigator.status)}</small>
            `;
            document.getElementById('selectedInvestigatorInfo').innerHTML = investigatorInfo;
            
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 7);
            document.getElementById('expectedCompletionDate').value = defaultDate.toISOString().split('T')[0];
            
            console.log('📝 Assignment form updated');
        } catch (error) {
            console.error('❌ Error updating assignment form:', error);
        }
    }

    async confirmAssignment() {
        try {
            console.log('✅ Confirming assignment...');
            
            if (!this.selectedCase || !this.selectedInvestigator) {
                alert('Please select both a case and an investigator');
                return;
            }
            
            const assignmentPriority = document.getElementById('assignmentPriority').value;
            const expectedCompletionDate = document.getElementById('expectedCompletionDate').value;
            const assignmentNotes = document.getElementById('assignmentNotes').value;
            const notificationType = document.getElementById('notificationType').value;
            
            const confirmBtn = document.getElementById('confirmAssignBtn');
            const originalHTML = confirmBtn.innerHTML;
            confirmBtn.innerHTML = '<div class="loading-spinner"></div> Assigning...';
            confirmBtn.disabled = true;
            
            const { db } = window.Firebase;
            const { doc, updateDoc, serverTimestamp } = window.Firebase;
            
            const caseRef = doc(db, 'grievance_cases', this.selectedCase.id);
            const updateData = {
                assignedTo: this.selectedInvestigator.id,
                assignedBy: this.currentUser.id,
                assignedAt: serverTimestamp(),
                assignmentPriority: assignmentPriority,
                expectedCompletionDate: expectedCompletionDate,
                assignmentNotes: assignmentNotes,
                notificationType: notificationType,
                status: 'investigating',
                updatedAt: serverTimestamp()
            };
            
            await updateDoc(caseRef, updateData);
            
            document.getElementById('assignmentActions').style.display = 'none';
            this.selectedCase = null;
            this.selectedInvestigator = null;
            
            confirmBtn.innerHTML = originalHTML;
            confirmBtn.disabled = false;
            
            alert(`Case assigned successfully!\n\nCase: ${this.selectedCase.trackingNumber}\nInvestigator: ${this.selectedInvestigator.name}\nStatus: Investigating`);
            
            console.log('✅ Assignment confirmed');
        } catch (error) {
            console.error('❌ Error confirming assignment:', error);
            alert('Error assigning case. Please try again.');
            
            const confirmBtn = document.getElementById('confirmAssignBtn');
            confirmBtn.innerHTML = originalHTML;
            confirmBtn.disabled = false;
        }
    }

    updateStatistics() {
        try {
            document.getElementById('unassignedCases').textContent = this.cases.length;
            document.getElementById('availableInvestigators').textContent = this.investigators.filter(inv => inv.status === 'available').length;
            
            const avgWorkload = this.investigators.length > 0 
                ? Math.round(this.investigators.reduce((sum, inv) => sum + inv.currentWorkload, 0) / this.investigators.length)
                : 0;
            document.getElementById('avgWorkload').textContent = avgWorkload;
            
            const urgentCases = this.cases.filter(c => c.priority === 'high' || c.priority === 'critical').length;
            document.getElementById('urgentCases').textContent = urgentCases;
            
            console.log('📊 Statistics updated');
        } catch (error) {
            console.error('❌ Error updating statistics:', error);
        }
    }

    // Utility functions
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

    formatStatus(status) {
        const statusMap = {
            'available': 'Available',
            'busy': 'Busy',
            'overloaded': 'Overloaded'
        };
        return statusMap[status] || status;
    }

    setupEventListeners() {
        try {
            console.log('🎧 Event listeners set up');
        } catch (error) {
            console.error('❌ Error setting up event listeners:', error);
        }
    }

    destroy() {
        if (this.unsubscribeCases) {
            this.unsubscribeCases();
        }
        if (this.unsubscribeInvestigators) {
            this.unsubscribeInvestigators();
        }
        console.log('🧹 Case Assignment Panel destroyed');
    }
}

// Global functions for HTML onclick handlers
window.selectCase = (caseId) => window.caseAssignment?.selectCase(caseId);
window.selectInvestigator = (investigatorId) => window.caseAssignment?.selectInvestigator(investigatorId);
window.confirmAssignment = () => window.caseAssignment?.confirmAssignment();
window.filterCases = (filter) => window.caseAssignment?.filterCases(filter);
window.filterInvestigators = (filter) => window.caseAssignment?.filterInvestigators(filter);
window.assignSelectedCase = () => window.caseAssignment?.confirmAssignment();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.caseAssignment = new CaseAssignment();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.caseAssignment) {
        window.caseAssignment.destroy();
    }
});
